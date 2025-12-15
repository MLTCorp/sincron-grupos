"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  RefreshCw,
  Plus,
  Wifi,
  WifiOff,
  User,
  Building2,
  Smartphone,
  Loader2,
  Users,
  Zap,
  Send,
  Clock,
  MoreVertical,
  Power,
  QrCode,
  Info,
  Bell
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { getUAZAPIService, type InstanciaStatusCompleto } from "@/lib/uazapi"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Instancia = {
  id: number
  id_organizacao: number
  nome_instancia: string
  api_key: string | null
  api_url: string | null
  status: string | null
  numero_telefone: string | null
  profile_name?: string | null
  profile_pic_url?: string | null
  is_business?: boolean | null
  webhook_url: string | null
  ativo: boolean | null
  dt_create: string | null
  dt_update: string | null
}

type InstanciaComLiveStatus = Instancia & {
  liveStatus?: InstanciaStatusCompleto | null
  isChecking?: boolean
}

const POLLING_INTERVAL = 30000 // 30 segundos

export default function InstancesPage() {
  const [instancias, setInstancias] = useState<InstanciaComLiveStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [stats, setStats] = useState({ grupos: 0, gatilhos: 0 })

  const instanciasRef = useRef<InstanciaComLiveStatus[]>([])
  const hasCheckedRef = useRef(false)

  const supabase = useMemo(() => createClient(), [])
  const apiService = useMemo(() => getUAZAPIService(), [])

  // Manter ref sincronizado com state
  useEffect(() => {
    instanciasRef.current = instancias
  }, [instancias])

  // Carregar instancias do Supabase
  const loadInstancias = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      const { data: usuarioSistema } = await supabase
        .from("usuarios_sistema")
        .select("*, organizacoes(*)")
        .eq("email", user.email)
        .single()

      const organizacao = usuarioSistema?.organizacoes as { id: number } | null
      if (!organizacao?.id) return

      const { data } = await supabase
        .from("instancias_whatsapp")
        .select("*")
        .eq("id_organizacao", organizacao.id)
        .order("dt_create", { ascending: false })

      if (data) {
        setInstancias(data.map(i => ({ ...i, isChecking: false })))
      }

      // Carregar stats
      const { count: gruposCount } = await supabase
        .from("grupos")
        .select("*", { count: "exact", head: true })
        .eq("id_organizacao", organizacao.id)

      const { count: gatilhosCount } = await supabase
        .from("gatilhos")
        .select("*", { count: "exact", head: true })
        .eq("id_organizacao", organizacao.id)
        .eq("ativo", true)

      setStats({
        grupos: gruposCount || 0,
        gatilhos: gatilhosCount || 0
      })
    } catch (err) {
      console.error("Erro ao carregar instancias:", err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Verificar status de uma instancia especifica
  const checkInstanceStatus = useCallback(async (instancia: InstanciaComLiveStatus) => {
    if (!instancia.api_key) return instancia

    try {
      const statusResponse = await apiService.obterStatus(instancia.api_key)
      const extracted = statusResponse.extractedStatus

      if (extracted) {
        const newStatus = extracted.connected && extracted.loggedIn ? "conectado" : "desconectado"

        // Atualizar no banco se mudou
        if (instancia.status !== newStatus) {
          await supabase
            .from("instancias_whatsapp")
            .update({
              status: newStatus,
              numero_telefone: extracted.phoneNumber,
              profile_name: extracted.profileName,
              profile_pic_url: extracted.profilePicUrl,
              is_business: extracted.isBusiness,
              dt_update: new Date().toISOString(),
            })
            .eq("id", instancia.id)
        }

        return {
          ...instancia,
          status: newStatus,
          numero_telefone: extracted.phoneNumber,
          profile_name: extracted.profileName,
          profile_pic_url: extracted.profilePicUrl,
          is_business: extracted.isBusiness,
          liveStatus: extracted,
          isChecking: false,
        }
      }
    } catch (err) {
      console.error(`Erro ao verificar status da instancia ${instancia.id}:`, err)
    }

    return { ...instancia, isChecking: false }
  }, [apiService, supabase])

  // Verificar status de todas as instancias
  const checkAllStatuses = useCallback(async () => {
    const currentInstancias = instanciasRef.current
    if (currentInstancias.length === 0) return

    setIsRefreshing(true)
    setInstancias(prev => prev.map(i => ({ ...i, isChecking: !!i.api_key })))

    const updated = await Promise.all(
      currentInstancias.map(instancia => checkInstanceStatus(instancia))
    )

    setInstancias(updated)
    setLastCheck(new Date())
    setIsRefreshing(false)
  }, [checkInstanceStatus])

  // Carregar instancias ao montar
  useEffect(() => {
    loadInstancias()
  }, [loadInstancias])

  // Verificar status apos carregar instancias (apenas uma vez)
  useEffect(() => {
    if (!loading && instancias.length > 0 && !hasCheckedRef.current) {
      hasCheckedRef.current = true
      checkAllStatuses()
    }
  }, [loading, instancias.length, checkAllStatuses])

  // Polling automatico a cada 30 segundos
  useEffect(() => {
    if (loading || instancias.length === 0) return

    const interval = setInterval(() => {
      checkAllStatuses()
    }, POLLING_INTERVAL)

    return () => clearInterval(interval)
  }, [loading, instancias.length, checkAllStatuses])

  // Instancia principal (primeira conectada ou primeira da lista)
  const instanciaPrincipal = useMemo(() => {
    const conectada = instancias.find(i => i.status === "conectado")
    return conectada || instancias[0] || null
  }, [instancias])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  const isConnected = instanciaPrincipal?.status === "conectado"

  return (
    <div className="flex-1 space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Instancias WhatsApp</h2>
          <p className="text-muted-foreground">Gerencie suas conexoes com o WhatsApp.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={checkAllStatuses}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
          {instancias.length === 0 && (
            <Button asChild>
              <Link href="/instances/new">
                <Plus className="h-4 w-4 mr-2" />
                Nova Instancia
              </Link>
            </Button>
          )}
        </div>
      </div>

      {instanciaPrincipal ? (
        <>
          {/* Instance Card */}
          <Card>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center",
                    isConnected ? "bg-green-100" : "bg-muted"
                  )}>
                    <Smartphone className={cn(
                      "h-7 w-7",
                      isConnected ? "text-green-600" : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{instanciaPrincipal.nome_instancia}</h3>
                    <p className="text-sm text-muted-foreground">
                      {instanciaPrincipal.liveStatus?.phoneFormatted ||
                       instanciaPrincipal.numero_telefone ||
                       "Numero nao disponivel"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={cn(
                    "gap-2",
                    isConnected
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-muted text-muted-foreground hover:bg-muted"
                  )}>
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      isConnected ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
                    )} />
                    {isConnected ? "Conectada" : "Desconectada"}
                  </Badge>
                  {instanciaPrincipal.isChecking && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/instances/${instanciaPrincipal.id}`}>
                          Configuracoes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Desconectar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{stats.grupos}</p>
                  <p className="text-sm text-muted-foreground">Grupos</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{stats.gatilhos}</p>
                  <p className="text-sm text-muted-foreground">Gatilhos ativos</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Mensagens hoje</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{isConnected ? "99.9%" : "0%"}</p>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  <span>Ultima atividade: </span>
                  <span className="font-medium text-foreground">
                    {isConnected ? "Agora mesmo" : "Desconectada"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={checkAllStatuses} disabled={isRefreshing}>
                    <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                    Reconectar
                  </Button>
                  {isConnected && (
                    <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                      <Power className="h-4 w-4 mr-2" />
                      Desconectar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Section (when disconnected) */}
          {!isConnected && (
            <Card>
              <div className="p-6 border-b">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" />
                  Conectar WhatsApp
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Escaneie o QR Code com seu WhatsApp para conectar.
                </p>
              </div>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-64 h-64 rounded-lg flex items-center justify-center border-2 border-dashed border-border bg-muted/50">
                    <div className="text-center">
                      <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">QR Code</p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <h4 className="font-semibold">Como conectar:</h4>
                    <ol className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                        <span>Abra o WhatsApp no seu celular</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                        <span>Toque em <strong>Menu</strong> ou <strong>Configuracoes</strong> e selecione <strong>Aparelhos conectados</strong></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                        <span>Toque em <strong>Conectar um aparelho</strong></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                        <span>Aponte seu celular para esta tela para escanear o QR Code</span>
                      </li>
                    </ol>
                    <Button asChild className="mt-4">
                      <Link href={`/instances/${instanciaPrincipal.id}/connect`}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Gerar novo QR Code
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instance Info */}
          <Card>
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Informacoes da Instancia
              </h3>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nome da Instancia</label>
                    <p className="font-medium">{instanciaPrincipal.nome_instancia}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Numero WhatsApp</label>
                    <p className="font-medium">
                      {instanciaPrincipal.liveStatus?.phoneFormatted ||
                       instanciaPrincipal.numero_telefone ||
                       "Nao conectado"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p className={cn(
                      "font-medium flex items-center gap-2",
                      isConnected ? "text-green-600" : "text-muted-foreground"
                    )}>
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        isConnected ? "bg-green-500" : "bg-muted-foreground"
                      )} />
                      {isConnected ? "Conectada" : "Desconectada"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Criada em</label>
                    <p className="font-medium">{formatDate(instanciaPrincipal.dt_create)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ultima conexao</label>
                    <p className="font-medium">
                      {isConnected ? "Agora (ativa)" : formatDate(instanciaPrincipal.dt_update)}
                    </p>
                  </div>
                  {instanciaPrincipal.liveStatus?.isBusiness && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tipo de Conta</label>
                      <p className="font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        WhatsApp Business
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Empty State */
        <Card className="p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma instancia</h3>
            <p className="text-muted-foreground mb-6">
              Conecte seu primeiro WhatsApp para comecar a gerenciar grupos
            </p>
            <Button asChild>
              <Link href="/instances/new">
                <Plus className="h-4 w-4 mr-2" />
                Nova Instancia
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        <p>Copyright &copy; 2025 Sincron Grupos</p>
      </footer>
    </div>
  )
}
