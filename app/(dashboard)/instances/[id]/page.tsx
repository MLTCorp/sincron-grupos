"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Smartphone,
  RefreshCw,
  Wifi,
  WifiOff,
  QrCode,
  Trash2,
  Power,
  Phone,
  Calendar,
  Hash,
  User,
  Building2,
  Monitor,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { getUAZAPIService, type InstanciaStatusCompleto } from "@/lib/uazapi"
import { toast } from "sonner"

interface Instancia {
  id: number
  nome_instancia: string
  api_key: string | null
  status: string | null
  numero_telefone: string | null
  profile_name?: string | null
  profile_pic_url?: string | null
  is_business?: boolean | null
  platform?: string | null
  ativo: boolean | null
  dt_create: string | null
  dt_update: string | null
}

export default function InstanceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const instanceId = params.id as string

  const [instancia, setInstancia] = useState<Instancia | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [liveStatus, setLiveStatus] = useState<InstanciaStatusCompleto | null>(null)

  const supabase = createClient()
  const apiService = getUAZAPIService()

  // Função para verificar status na UAZAPI
  const checkUAZAPIStatus = useCallback(async (apiKey: string, currentData: Instancia) => {
    setStatusLoading(true)
    try {
      const statusResponse = await apiService.obterStatus(apiKey)
      const extracted = statusResponse.extractedStatus

      if (extracted) {
        setLiveStatus(extracted)

        // Determinar novo status
        const newStatus = extracted.connected && extracted.loggedIn
          ? "conectado"
          : "desconectado"

        // Atualizar banco se houve mudança
        const needsUpdate = currentData.status !== newStatus ||
          currentData.numero_telefone !== extracted.phoneNumber ||
          currentData.profile_name !== extracted.profileName

        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from("instancias_whatsapp")
            .update({
              status: newStatus,
              numero_telefone: extracted.phoneNumber,
              profile_name: extracted.profileName,
              profile_pic_url: extracted.profilePicUrl,
              is_business: extracted.isBusiness,
              platform: extracted.platform,
              last_disconnect_at: extracted.lastDisconnect,
              last_disconnect_reason: extracted.lastDisconnectReason,
              dt_update: new Date().toISOString(),
            })
            .eq("id", currentData.id)

          if (updateError) {
            console.error("Erro ao atualizar status no banco:", updateError)
          } else {
            setInstancia({
              ...currentData,
              status: newStatus,
              numero_telefone: extracted.phoneNumber,
              profile_name: extracted.profileName,
              profile_pic_url: extracted.profilePicUrl,
              is_business: extracted.isBusiness,
              platform: extracted.platform,
            })
          }
        }
      }
    } catch (err) {
      console.error("Erro ao verificar status UAZAPI:", err)
      toast.error("Erro ao verificar status da conexao")
    } finally {
      setStatusLoading(false)
    }
  }, [apiService, supabase])

  // Carregar dados da instancia
  useEffect(() => {
    async function loadInstancia() {
      try {
        const { data, error } = await supabase
          .from("instancias_whatsapp")
          .select("*")
          .eq("id", Number(instanceId))
          .single()

        if (error || !data) {
          toast.error("Instancia nao encontrada")
          router.push("/instances")
          return
        }

        setInstancia(data)

        // Verificar status real na UAZAPI se tiver token
        if (data.api_key) {
          await checkUAZAPIStatus(data.api_key, data)
        }
      } catch (err) {
        console.error("Erro ao carregar instancia:", err)
        toast.error("Erro ao carregar dados")
      } finally {
        setLoading(false)
      }
    }

    loadInstancia()
  }, [instanceId, supabase, router, checkUAZAPIStatus])

  // Desconectar instancia
  const handleDisconnect = async () => {
    if (!instancia?.api_key) return

    setActionLoading(true)
    try {
      await apiService.desconectarInstancia(instancia.api_key)

      // Atualizar status no banco
      await supabase
        .from("instancias_whatsapp")
        .update({
          status: "desconectado",
          last_disconnect_at: new Date().toISOString(),
          last_disconnect_reason: "Desconectado manualmente pelo usuario",
          dt_update: new Date().toISOString(),
        })
        .eq("id", Number(instanceId))

      setInstancia({ ...instancia, status: "desconectado" })
      setLiveStatus(prev => prev ? { ...prev, connected: false, loggedIn: false } : null)
      toast.success("Instancia desconectada")
    } catch (err) {
      console.error("Erro ao desconectar:", err)
      toast.error("Erro ao desconectar instancia")
    } finally {
      setActionLoading(false)
    }
  }

  // Deletar instancia
  const handleDelete = async () => {
    if (!instancia) return

    setActionLoading(true)
    try {
      // Desconectar primeiro se estiver conectada
      if (instancia.api_key) {
        try {
          await apiService.deletarInstancia(instancia.api_key)
        } catch (err) {
          console.warn("Erro ao deletar na UAZAPI:", err)
        }
      }

      // Remover do banco
      const { error } = await supabase
        .from("instancias_whatsapp")
        .delete()
        .eq("id", Number(instanceId))

      if (error) throw error

      toast.success("Instancia removida")
      router.push("/instances")
    } catch (err) {
      console.error("Erro ao deletar:", err)
      toast.error("Erro ao remover instancia")
    } finally {
      setActionLoading(false)
    }
  }

  // Atualizar status
  const handleRefreshStatus = async () => {
    if (!instancia?.api_key) return
    await checkUAZAPIStatus(instancia.api_key, instancia)
    toast.success("Status atualizado")
  }

  const isConnected = liveStatus?.connected && liveStatus?.loggedIn

  const getStatusBadge = () => {
    if (loading) return <Badge variant="secondary">Carregando...</Badge>
    if (statusLoading) return <Badge variant="outline" className="animate-pulse">Verificando...</Badge>
    if (isConnected) return <Badge className="bg-green-500 text-white">Conectado</Badge>
    return <Badge variant="secondary">Desconectado</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!instancia) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/instances">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{instancia.nome_instancia}</h1>
            {getStatusBadge()}
          </div>
          <p className="text-muted-foreground">
            Gerencie esta instancia WhatsApp
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-muted-foreground" />
                )}
                Conexao
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshStatus}
                disabled={actionLoading || statusLoading}
              >
                <RefreshCw className={`h-4 w-4 ${statusLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected ? (
              /* Perfil conectado */
              <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={liveStatus?.profilePicUrl || undefined} />
                  <AvatarFallback className="bg-green-100 text-green-700">
                    <User className="h-7 w-7" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold truncate">
                      {liveStatus?.profileName || "Sem nome"}
                    </p>
                    {liveStatus?.isBusiness && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        <Building2 className="h-3 w-3 mr-1" />
                        Business
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {liveStatus?.phoneFormatted || liveStatus?.phoneNumber || "Numero nao disponivel"}
                  </p>
                  {liveStatus?.platform && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Monitor className="h-3 w-3" />
                      {liveStatus.platform}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* Desconectado */
              <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-muted/50 border border-dashed">
                <WifiOff className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground text-center">
                  WhatsApp desconectado
                </p>
                <p className="text-xs text-muted-foreground/70 text-center mt-1">
                  Conecte para gerenciar seus grupos
                </p>
              </div>
            )}

            {/* Info secundária */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              <div className="text-center p-2">
                <p className="text-xs text-muted-foreground">ID</p>
                <p className="text-sm font-mono font-medium">{instancia.id}</p>
              </div>
              <div className="text-center p-2">
                <p className="text-xs text-muted-foreground">Criada em</p>
                <p className="text-sm font-medium">
                  {instancia.dt_create
                    ? new Date(instancia.dt_create).toLocaleDateString("pt-BR")
                    : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acoes Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Acoes
            </CardTitle>
            <CardDescription>
              Gerencie a conexao desta instancia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isConnected ? (
              <Link href={`/instances/${instancia.id}/connect`} className="block">
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  <QrCode className="mr-2 h-4 w-4" />
                  Conectar WhatsApp
                </Button>
              </Link>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full" disabled={actionLoading}>
                    <Power className="mr-2 h-4 w-4" />
                    Desconectar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Desconectar instancia?</AlertDialogTitle>
                    <AlertDialogDescription>
                      A conexao WhatsApp sera encerrada. Voce precisara escanear o QR Code
                      novamente para reconectar.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDisconnect}>
                      Desconectar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" disabled={actionLoading}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover Instancia
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover instancia?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acao nao pode ser desfeita. A instancia sera permanentemente
                    removida e todos os dados associados serao perdidos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
