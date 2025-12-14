"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserPlus, Users, Mail, Shield, Crown, ShieldCheck, User, Loader2, BookOpen, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { PermissionGate } from "@/components/permission-gate"
import { usePermissions, type Permission } from "@/hooks/use-permissions"
import { cn } from "@/lib/utils"
import { PageHeader, EmptyState } from "@/components/dashboard"

interface Usuario {
  id: number
  nome: string
  email: string
  role: string | null
  ativo: boolean
  accepted_at: string | null
  invite_token: string | null
  permissoes_usuario: {
    gerenciar_instancias: boolean | null
    gerenciar_grupos: boolean | null
    gerenciar_categorias: boolean | null
    enviar_mensagens: boolean | null
    configurar_comandos: boolean | null
    configurar_gatilhos: boolean | null
    ver_analytics: boolean | null
    gerenciar_usuarios: boolean | null
  } | null
}

const PERMISSOES_LABELS: Record<Permission, string> = {
  gerenciar_instancias: "Gerenciar Instancias",
  gerenciar_grupos: "Gerenciar Grupos",
  gerenciar_categorias: "Gerenciar Categorias",
  enviar_mensagens: "Enviar Mensagens",
  configurar_comandos: "Configurar Comandos",
  configurar_gatilhos: "Configurar Gatilhos",
  ver_analytics: "Ver Analytics",
  gerenciar_usuarios: "Gerenciar Usuarios",
}

export default function TeamPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [permDialogOpen, setPermDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member")
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [permissoes, setPermissoes] = useState<Record<Permission, boolean>>({
    gerenciar_instancias: false,
    gerenciar_grupos: false,
    gerenciar_categorias: false,
    enviar_mensagens: false,
    configurar_comandos: false,
    configurar_gatilhos: false,
    ver_analytics: false,
    gerenciar_usuarios: false,
  })

  const { isOwner } = usePermissions()
  const supabase = createClient()

  // Contagens para tabs
  const activeCount = useMemo(() => usuarios.filter(u => u.accepted_at).length, [usuarios])
  const pendingCount = useMemo(() => usuarios.filter(u => u.invite_token && !u.accepted_at).length, [usuarios])

  // Filtrar por tab
  const filteredUsuarios = useMemo(() => {
    switch (activeTab) {
      case "active":
        return usuarios.filter(u => u.accepted_at)
      case "pending":
        return usuarios.filter(u => u.invite_token && !u.accepted_at)
      default:
        return usuarios
    }
  }, [usuarios, activeTab])

  const loadUsuarios = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      const { data: usuarioSistema } = await supabase
        .from("usuarios_sistema")
        .select("id_organizacao")
        .eq("email", user.email)
        .single()

      if (!usuarioSistema) return

      const { data, error } = await supabase
        .from("usuarios_sistema")
        .select(`
          id,
          nome,
          email,
          role,
          ativo,
          accepted_at,
          invite_token,
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
        .eq("id_organizacao", usuarioSistema.id_organizacao)
        .order("role", { ascending: true })

      if (error) throw error

      setUsuarios(data?.map(u => ({
        ...u,
        permissoes_usuario: Array.isArray(u.permissoes_usuario)
          ? u.permissoes_usuario[0]
          : u.permissoes_usuario
      })) || [])
    } catch (err) {
      console.error("Erro ao carregar usuarios:", err)
      toast.error("Erro ao carregar usuarios")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsuarios()
  }, [])

  const getRoleInfo = (role: string | null) => {
    switch (role) {
      case "owner":
        return {
          label: "Owner",
          icon: Crown,
        }
      case "admin":
        return {
          label: "Admin",
          icon: ShieldCheck,
        }
      default:
        return {
          label: "Membro",
          icon: User,
        }
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Email e obrigatorio")
      return
    }

    setSending(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      const { data: usuarioSistema } = await supabase
        .from("usuarios_sistema")
        .select("id, id_organizacao")
        .eq("email", user.email)
        .single()

      if (!usuarioSistema) return

      // Gerar token de convite
      const inviteToken = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 dias

      // Criar usuario convidado
      const { error } = await supabase.from("usuarios_sistema").insert({
        id_organizacao: usuarioSistema.id_organizacao,
        email: inviteEmail,
        nome: inviteEmail.split("@")[0],
        role: inviteRole,
        ativo: false,
        invite_token: inviteToken,
        invite_expires_at: expiresAt.toISOString(),
        invited_by: usuarioSistema.id,
      })

      if (error) {
        if (error.code === "23505") {
          toast.error("Este email ja foi convidado")
        } else {
          throw error
        }
        return
      }

      toast.success("Convite enviado com sucesso!")
      toast.info(`Link de convite: ${window.location.origin}/invite/${inviteToken}`)

      setInviteDialogOpen(false)
      setInviteEmail("")
      setInviteRole("member")
      loadUsuarios()
    } catch (err) {
      console.error("Erro ao enviar convite:", err)
      toast.error("Erro ao enviar convite")
    } finally {
      setSending(false)
    }
  }

  const openPermissionsDialog = (usuario: Usuario) => {
    setSelectedUser(usuario)
    if (usuario.permissoes_usuario) {
      setPermissoes({
        gerenciar_instancias: usuario.permissoes_usuario.gerenciar_instancias ?? false,
        gerenciar_grupos: usuario.permissoes_usuario.gerenciar_grupos ?? false,
        gerenciar_categorias: usuario.permissoes_usuario.gerenciar_categorias ?? false,
        enviar_mensagens: usuario.permissoes_usuario.enviar_mensagens ?? false,
        configurar_comandos: usuario.permissoes_usuario.configurar_comandos ?? false,
        configurar_gatilhos: usuario.permissoes_usuario.configurar_gatilhos ?? false,
        ver_analytics: usuario.permissoes_usuario.ver_analytics ?? false,
        gerenciar_usuarios: usuario.permissoes_usuario.gerenciar_usuarios ?? false,
      })
    } else {
      setPermissoes({
        gerenciar_instancias: false,
        gerenciar_grupos: false,
        gerenciar_categorias: false,
        enviar_mensagens: false,
        configurar_comandos: false,
        configurar_gatilhos: false,
        ver_analytics: false,
        gerenciar_usuarios: false,
      })
    }
    setPermDialogOpen(true)
  }

  const savePermissions = async () => {
    if (!selectedUser) return

    setSending(true)
    try {
      // Verificar se ja existe permissoes_usuario
      const { data: existing } = await supabase
        .from("permissoes_usuario")
        .select("id")
        .eq("id_usuario_sistema", selectedUser.id)
        .single()

      if (existing) {
        // Atualizar
        const { error } = await supabase
          .from("permissoes_usuario")
          .update(permissoes)
          .eq("id_usuario_sistema", selectedUser.id)

        if (error) throw error
      } else {
        // Criar
        const { error } = await supabase
          .from("permissoes_usuario")
          .insert({
            id_usuario_sistema: selectedUser.id,
            ...permissoes,
          })

        if (error) throw error
      }

      toast.success("Permissoes atualizadas com sucesso")
      setPermDialogOpen(false)
      loadUsuarios()
    } catch (err) {
      console.error("Erro ao salvar permissoes:", err)
      toast.error("Erro ao salvar permissoes")
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-48" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipe"
        description="Gerencie os usuarios da sua organizacao"
        tabs={[
          { label: "Todos", value: "all", count: usuarios.length },
          { label: "Ativos", value: "active", count: activeCount },
          { label: "Pendentes", value: "pending", count: pendingCount },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actions={
          <PermissionGate permission="gerenciar_usuarios">
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Convidar
            </Button>
          </PermissionGate>
        }
      />

      {/* Dialog de convite */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="max-w-sm p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base sm:text-lg">Convidar Usuario</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Adicione um membro a organizacao
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                className="h-8 sm:h-9 text-sm"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-sm">Funcao</Label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as "admin" | "member")}
              >
                <SelectTrigger className="h-8 sm:h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Membro</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Admins: acesso total. Membros: configuravel.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setInviteDialogOpen(false)}
              disabled={sending}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="h-8"
              onClick={handleInvite}
              disabled={sending}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-1.5" />
                  Enviar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lista de Usuarios */}
      {filteredUsuarios.length === 0 ? (
        <EmptyState
          icon={Users}
          title={activeTab === "all" ? "Nenhum usuario" : `Nenhum usuario ${activeTab === "active" ? "ativo" : "pendente"}`}
          description={
            activeTab === "all"
              ? "Convide membros para sua organizacao"
              : `Voce nao tem usuarios ${activeTab === "active" ? "ativos" : "com convite pendente"} no momento`
          }
          action={
            activeTab === "all"
              ? { label: "Convidar Usuario", onClick: () => setInviteDialogOpen(true), icon: UserPlus }
              : undefined
          }
          secondaryActions={
            activeTab === "all"
              ? [
                  {
                    icon: BookOpen,
                    title: "Como funciona",
                    description: "Aprenda sobre funcoes e permissoes",
                    href: "#",
                  },
                  {
                    icon: Settings,
                    title: "Configuracoes",
                    description: "Ajuste as configuracoes da conta",
                    href: "/settings",
                  },
                ]
              : undefined
          }
        />
      ) : (
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm sm:text-base font-medium">Membros</CardTitle>
              <Badge variant="secondary" className="text-[10px] ml-auto">
                {filteredUsuarios.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredUsuarios.map((usuario) => {
                const roleInfo = getRoleInfo(usuario.role)
                const RoleIcon = roleInfo.icon

                return (
                  <div
                    key={usuario.id}
                    className="px-3 sm:px-4 py-2.5 hover:bg-muted/30 transition-colors group/item"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {usuario.nome}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {usuario.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1 text-[10px] px-1.5 py-0 h-5">
                          <RoleIcon className="h-2.5 w-2.5" />
                          <span className="hidden sm:inline">{roleInfo.label}</span>
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 hidden sm:flex">
                          {usuario.accepted_at ? "Ativo" : usuario.invite_token ? "Pendente" : "Inativo"}
                        </Badge>
                        {usuario.role !== "owner" && (
                          <PermissionGate permission="gerenciar_usuarios">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:opacity-0 sm:group-hover/item:opacity-100 transition-opacity"
                              onClick={() => openPermissionsDialog(usuario)}
                            >
                              <Shield className="h-3.5 w-3.5" />
                            </Button>
                          </PermissionGate>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Permissoes - Compacto */}
      <Dialog open={permDialogOpen} onOpenChange={setPermDialogOpen}>
        <DialogContent className="max-w-sm p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base sm:text-lg">
              Permissoes
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {selectedUser?.nome}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
            {(Object.keys(PERMISSOES_LABELS) as Permission[]).map((perm) => (
              <div
                key={perm}
                className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50"
              >
                <Label htmlFor={perm} className="cursor-pointer text-xs sm:text-sm">
                  {PERMISSOES_LABELS[perm]}
                </Label>
                <Switch
                  id={perm}
                  checked={permissoes[perm]}
                  onCheckedChange={(checked) =>
                    setPermissoes({ ...permissoes, [perm]: checked })
                  }
                  className="scale-90 sm:scale-100"
                />
              </div>
            ))}
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setPermDialogOpen(false)}
              disabled={sending}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="h-8"
              onClick={savePermissions}
              disabled={sending}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
