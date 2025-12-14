import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractPhoneFromJID } from '@/lib/uazapi/service'
import type { ConnectionWebhookPayload } from '@/lib/uazapi/types'

export async function POST(request: NextRequest) {
  try {
    // 1. Parse do payload vindo do N8N
    const payload: ConnectionWebhookPayload = await request.json()

    // 2. Validação básica
    if (!payload.token || payload.event !== 'connection') {
      return NextResponse.json(
        { error: 'Payload inválido' },
        { status: 400 }
      )
    }

    // 3. Buscar instância no Supabase
    const supabase = await createClient()
    const { data: instancia, error: instanciaError } = await supabase
      .from('instancias_whatsapp')
      .select(`
        id,
        nome_instancia,
        numero_telefone,
        status,
        id_organizacao,
        organizacoes (
          nome,
          usuarios_sistema (
            id,
            email,
            nome,
            role
          )
        )
      `)
      .eq('api_key', payload.token)
      .single()

    if (instanciaError || !instancia) {
      console.error('Instância não encontrada:', payload.token)
      return NextResponse.json(
        { error: 'Instância não encontrada' },
        { status: 404 }
      )
    }

    // 4. Determinar tipo de evento
    const statusAnterior = instancia.status
    const novoStatus = payload.status.connected ? 'conectado' : 'desconectado'

    // 5. Atualizar status no banco
    const { error: updateError } = await supabase
      .from('instancias_whatsapp')
      .update({
        status: novoStatus,
        numero_telefone: payload.status.connected
          ? extractPhoneFromJID(payload.status.jid)
          : instancia.numero_telefone,
        dt_update: new Date().toISOString()
      })
      .eq('id', instancia.id)

    if (updateError) {
      console.error('Erro ao atualizar status:', updateError)
    }

    // 6. Enviar notificação se desconectou
    if (!payload.status.connected && statusAnterior === 'conectado') {
      // Buscar admin/owner da organização
      const admins = instancia.organizacoes.usuarios_sistema.filter(
        (user: any) => user.role === 'owner' || user.role === 'admin'
      )

      // Inserir notificação para cada admin
      const notificacoesParaInserir = admins.map((admin: any) => ({
        id_organizacao: instancia.id_organizacao,
        id_usuario: admin.id,
        tipo: 'desconexao' as const,
        titulo: `Instância ${instancia.nome_instancia} desconectada`,
        mensagem: `A instância WhatsApp foi desconectada. Clique para reconectar.`,
        metadata: {
          instanciaId: instancia.id,
          instanciaNome: instancia.nome_instancia,
          numeroTelefone: instancia.numero_telefone
        }
      }))

      const { error: notifError } = await supabase
        .from('notificacoes')
        .insert(notificacoesParaInserir)

      if (notifError) {
        console.error('Erro ao criar notificações:', notifError)
      } else {
        console.log(`✅ Notificações criadas para ${admins.length} admin(s)`)
      }

      // Log para debug
      console.log('🚨 ALERTA DE DESCONEXÃO:')
      console.log('Instância:', instancia.nome_instancia)
      console.log('Organização:', instancia.organizacoes.nome)
      console.log('Admins notificados:', admins.map((a: any) => a.email).join(', '))
    }

    // 7. Retornar sucesso
    return NextResponse.json({
      success: true,
      instanceId: instancia.id,
      statusAnterior,
      novoStatus,
      notificado: !payload.status.connected
    })

  } catch (error) {
    console.error('Erro ao processar webhook de conexão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
