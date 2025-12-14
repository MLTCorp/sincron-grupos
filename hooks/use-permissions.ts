"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export type Permission =
  | "gerenciar_instancias"
  | "gerenciar_grupos"
  | "gerenciar_categorias"
  | "enviar_mensagens"
  | "configurar_comandos"
  | "configurar_gatilhos"
  | "ver_analytics"
  | "gerenciar_usuarios"

export type Permissions = Record<Permission, boolean>

export interface UsePermissionsReturn {
  permissions: Permissions | null
  loading: boolean
  error: string | null
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  isOwner: boolean
  isAdmin: boolean
  role: string | null
}

export function usePermissions(): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<Permissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    async function loadPermissions() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user?.email) {
          setLoading(false)
          return
        }

        // Buscar usuario_sistema com permissoes
        const { data: usuarioData, error: userError } = await supabase
          .from("usuarios_sistema")
          .select(`
            id,
            role,
            permissoes_usuario (
              gerenciar_instancias,
              gerenciar_grupos,
              gerenciar_categorias,
              enviar_mensagens,
              configurar_comandos,
              configurar_gatilhos,
              ver_analytics,
              gerenciar_usuarios
            )
          `)
          .eq("email", user.email)
          .single()

        if (userError) {
          // Se nao encontrou, pode ser usuario antigo sem permissoes
          console.warn("Usuario sem permissoes:", userError)
          setError("Permissoes nao encontradas")
          setLoading(false)
          return
        }

        setRole(usuarioData.role)

        // Se tem permissoes_usuario, usar
        if (usuarioData.permissoes_usuario) {
          const perms = Array.isArray(usuarioData.permissoes_usuario)
            ? usuarioData.permissoes_usuario[0]
            : usuarioData.permissoes_usuario

          setPermissions({
            gerenciar_instancias: perms?.gerenciar_instancias ?? false,
            gerenciar_grupos: perms?.gerenciar_grupos ?? false,
            gerenciar_categorias: perms?.gerenciar_categorias ?? false,
            enviar_mensagens: perms?.enviar_mensagens ?? false,
            configurar_comandos: perms?.configurar_comandos ?? false,
            configurar_gatilhos: perms?.configurar_gatilhos ?? false,
            ver_analytics: perms?.ver_analytics ?? false,
            gerenciar_usuarios: perms?.gerenciar_usuarios ?? false,
          })
        } else {
          // Se for owner/admin, dar todas as permissoes
          const isOwnerOrAdmin = usuarioData.role === "owner" || usuarioData.role === "admin"
          setPermissions({
            gerenciar_instancias: isOwnerOrAdmin,
            gerenciar_grupos: isOwnerOrAdmin,
            gerenciar_categorias: isOwnerOrAdmin,
            enviar_mensagens: isOwnerOrAdmin,
            configurar_comandos: isOwnerOrAdmin,
            configurar_gatilhos: isOwnerOrAdmin,
            ver_analytics: isOwnerOrAdmin,
            gerenciar_usuarios: usuarioData.role === "owner",
          })
        }
      } catch (err) {
        console.error("Erro ao carregar permissoes:", err)
        setError("Erro ao carregar permissoes")
      } finally {
        setLoading(false)
      }
    }

    loadPermissions()
  }, [])

  const hasPermission = (permission: Permission): boolean => {
    if (role === "owner") return true
    return permissions?.[permission] ?? false
  }

  const hasAnyPermission = (perms: Permission[]): boolean => {
    if (role === "owner") return true
    return perms.some((p) => permissions?.[p])
  }

  const hasAllPermissions = (perms: Permission[]): boolean => {
    if (role === "owner") return true
    return perms.every((p) => permissions?.[p])
  }

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isOwner: role === "owner",
    isAdmin: role === "admin" || role === "owner",
    role,
  }
}
