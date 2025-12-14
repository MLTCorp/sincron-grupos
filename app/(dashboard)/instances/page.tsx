"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, Plus, Wifi, WifiOff, User, Building2, Smartphone, Loader2, Settings, BookOpen, Zap } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { getUAZAPIService, type InstanciaStatusCompleto } from "@/lib/uazapi"
import { cn } from "@/lib/utils"
import { PageHeader, EmptyState } from "@/components/dashboard"

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
  const [activeTab, setActiveTab] = useState("all")

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

  // Contagens para tabs
  const connectedCount = instancias.filter(i => i.status === "conectado").length
  const disconnectedCount = instancias.filter(i => i.status !== "conectado").length

  // Filtrar por tab
  const filteredInstancias = useMemo(() => {
    switch (activeTab) {
      case "connected":
        return instancias.filter(i => i.status === "conectado")
      case "disconnected":
        return instancias.filter(i => i.status !== "conectado")
      default:
        return instancias
    }
  }, [instancias, activeTab])

  const formatLastCheck = () => {
    if (!lastCheck) return null
    return lastCheck.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instancias"
        description="Gerencie suas conexoes WhatsApp"
        tabs={[
          { label: "Todas", value: "all", count: instancias.length },
          { label: "Conectadas", value: "connected", count: connectedCount },
          { label: "Desconectadas", value: "disconnected", count: disconnectedCount },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actions={
          <div className="flex items-center gap-2">
            {lastCheck && (
              <span className="text-xs text-muted-foreground hidden md:inline">
                Atualizado {formatLastCheck()}
              </span>
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={checkAllStatuses}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
            <Button asChild>
              <Link href="/instances/new">
                <Plus className="h-4 w-4 mr-2" />
                Nova Instancia
              </Link>
            </Button>
          </div>
        }
      />

      {/* Grid de Instancias */}
      {filteredInstancias.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredInstancias.map((instancia) => {
            const isConnected = instancia.status === "conectado"
            const liveStatus = instancia.liveStatus

            return (
              <Card
                key={instancia.id}
                className={cn(
                  "group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/30",
                  !isConnected && "opacity-80"
                )}
              >
                <CardContent className="p-4 md:p-5">
                  {/* Checking indicator */}
                  {instancia.isChecking && (
                    <div className="absolute top-4 right-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      "relative p-2.5 rounded-xl transition-all shrink-0",
                      isConnected
                        ? "bg-green-500/10"
                        : "bg-muted"
                    )}>
                      <Smartphone className={cn(
                        "h-5 w-5 transition-colors",
                        isConnected ? "text-green-600" : "text-muted-foreground"
                      )} />
                      {/* Status dot */}
                      <div className="absolute -top-0.5 -right-0.5">
                        <div className={cn(
                          "h-2.5 w-2.5 rounded-full border-2 border-background",
                          isConnected ? "bg-green-500" : "bg-muted-foreground"
                        )} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {instancia.nome_instancia}
                      </h3>
                      <Badge
                        variant={isConnected ? "default" : "secondary"}
                        className={cn(
                          "text-xs mt-1",
                          isConnected && "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                        )}
                      >
                        {isConnected ? (
                          <><Wifi className="h-3 w-3 mr-1" />Conectado</>
                        ) : (
                          <><WifiOff className="h-3 w-3 mr-1" />Desconectado</>
                        )}
                      </Badge>
                    </div>
                  </div>

                  {/* Profile info */}
                  {isConnected && liveStatus ? (
                    <div className="rounded-xl bg-muted/50 p-3 mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-background shrink-0">
                          <AvatarImage src={liveStatus.profilePicUrl || undefined} />
                          <AvatarFallback className="bg-muted">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-sm truncate">
                              {liveStatus.profileName || "Sem nome"}
                            </p>
                            {liveStatus.isBusiness && (
                              <Building2 className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {liveStatus.phoneFormatted || liveStatus.phoneNumber || ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-muted/50 p-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <WifiOff className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-muted-foreground">
                            Desconectada
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Conecte para sincronizar grupos
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/instances/${instancia.id}`}>
                        <Settings className="h-4 w-4 mr-2" />
                        Gerenciar
                      </Link>
                    </Button>
                    {!isConnected && (
                      <Button size="sm" asChild>
                        <Link href={`/instances/${instancia.id}/connect`}>
                          Conectar
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={Smartphone}
          title={activeTab === "all" ? "Nenhuma instancia" : `Nenhuma instancia ${activeTab === "connected" ? "conectada" : "desconectada"}`}
          description={
            activeTab === "all"
              ? "Conecte seu primeiro WhatsApp para comecar a gerenciar grupos"
              : `Voce nao tem instancias ${activeTab === "connected" ? "conectadas" : "desconectadas"} no momento`
          }
          action={
            activeTab === "all"
              ? { label: "Nova Instancia", href: "/instances/new", icon: Plus }
              : undefined
          }
          secondaryActions={
            activeTab === "all"
              ? [
                  {
                    icon: BookOpen,
                    title: "Como funciona",
                    description: "Aprenda como conectar seu WhatsApp",
                    href: "#",
                  },
                  {
                    icon: Zap,
                    title: "Automacoes",
                    description: "Configure gatilhos e comandos",
                    href: "/triggers",
                  },
                ]
              : undefined
          }
        />
      )}
    </div>
  )
}
