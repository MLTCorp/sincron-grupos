"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Notificacao } from '@/types/notification'

export function useNotifications() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const supabase = createClient()

  // Buscar notificações iniciais
  useEffect(() => {
    async function fetchNotificacoes() {
      try {
        // Buscar usuário atual
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !user.email) {
          setLoading(false)
          return
        }

        // Buscar organização do usuário
        const { data: usuarioSistema } = await supabase
          .from('usuarios_sistema')
          .select('id_organizacao, role')
          .eq('email', user.email)
          .single()

        if (!usuarioSistema) {
          setLoading(false)
          return
        }

        // Buscar notificações da organização (últimos 30 dias)
        const { data, error } = await supabase
          .from('notificacoes')
          .select('*')
          .eq('id_organizacao', usuarioSistema.id_organizacao)
          .gte('dt_create', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('dt_create', { ascending: false })
          .limit(50)

        if (error) throw error

        setNotificacoes((data as any) || [])
        setUnreadCount(((data as any) || []).filter((n: Notificacao) => !n.lida).length)
      } catch (error) {
        console.error('Erro ao buscar notificações:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotificacoes()
  }, [])

  // Subscribe para novas notificações (Realtime)
  useEffect(() => {
    const channel = supabase
      .channel('notificacoes-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes'
        },
        (payload) => {
          const novaNotificacao = payload.new as Notificacao
          setNotificacoes(prev => [novaNotificacao, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notificacoes'
        },
        (payload) => {
          const notificacaoAtualizada = payload.new as Notificacao
          setNotificacoes(prev =>
            prev.map(n => n.id === notificacaoAtualizada.id ? notificacaoAtualizada : n)
          )
          if (notificacaoAtualizada.lida) {
            setUnreadCount(prev => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Marcar como lida
  const marcarComoLida = async (id: number) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({
          lida: true,
          data_leitura: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      setNotificacoes(prev =>
        prev.map(n => n.id === id ? { ...n, lida: true, data_leitura: new Date().toISOString() } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }

  // Marcar todas como lidas
  const marcarTodasComoLidas = async () => {
    try {
      const idsNaoLidas = notificacoes.filter(n => !n.lida).map(n => n.id)

      if (idsNaoLidas.length === 0) return

      const { error } = await supabase
        .from('notificacoes')
        .update({
          lida: true,
          data_leitura: new Date().toISOString()
        })
        .in('id', idsNaoLidas)

      if (error) throw error

      setNotificacoes(prev =>
        prev.map(n => ({ ...n, lida: true, data_leitura: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  return {
    notificacoes,
    loading,
    unreadCount,
    marcarComoLida,
    marcarTodasComoLidas
  }
}
