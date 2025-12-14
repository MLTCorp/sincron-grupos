"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
  Smartphone,
  Wifi,
  WifiOff,
  RefreshCw,
  Loader2,
  User,
  Building2,
  QrCode,
  Power,
  Plus,
} from "lucide-react"
import { getUAZAPIService } from "@/lib/uazapi"
import { createClient } from "@/lib/supabase/client"
import type { Instancia } from "@/hooks/use-organization-data"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface InstancePanelProps {
  instancia: Instancia | null
  onRefresh: () => Promise<void>
}

export function InstancePanel({ instancia, onRefresh }: InstancePanelProps) {
  const [liveStatus, setLiveStatus] = useState<Instancia["liveStatus"]>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loadingQR, setLoadingQR] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)

  const apiService = getUAZAPIService()
  const supabase = createClient()

  // Verificar status
  const checkStatus = useCallback(async () => {
    if (!instancia?.api_key) return

    setIsChecking(true)
    try {
      const statusResponse = await apiService.obterStatus(instancia.api_key)
      const extracted = statusResponse.extractedStatus

      if (extracted) {
        // Map to correct type (convert null to undefined)
        setLiveStatus({
          connected: extracted.connected,
          loggedIn: extracted.loggedIn,
          phoneNumber: extracted.phoneNumber || undefined,
          profileName: extracted.profileName || undefined,
          profilePicUrl: extracted.profilePicUrl || undefined,
          isBusiness: extracted.isBusiness || undefined,
          phoneFormatted: extracted.phoneFormatted || undefined,
        })

        // Atualizar no banco se mudou
        const newStatus = extracted.connected && extracted.loggedIn ? "conectado" : "desconectado"
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
      }
    } catch (err) {
      console.error("Erro ao verificar status:", err)
    } finally {
      setIsChecking(false)
    }
  }, [instancia, apiService, supabase])

  // Gerar QR Code
  const generateQR = useCallback(async () => {
    if (!instancia?.api_key) return

    setLoadingQR(true)
    try {
      const response = await fetch(`/api/uazapi/instances/${instancia.api_key}/connect`, {
        method: "POST",
      })
      const data = await response.json()

      if (data.qrcode) {
        setQrCode(data.qrcode)
        setShowQR(true)
      } else {
        toast.error("Erro ao gerar QR Code")
      }
    } catch (err) {
      console.error("Erro ao gerar QR:", err)
      toast.error("Erro ao gerar QR Code")
    } finally {
      setLoadingQR(false)
    }
  }, [instancia])

  // Desconectar
  const handleDisconnect = async () => {
    if (!instancia?.api_key) return

    setDisconnecting(true)
    try {
      await fetch(`/api/uazapi/instances/${instancia.api_key}`, {
        method: "POST",
      })

      await supabase
        .from("instancias_whatsapp")
        .update({ status: "desconectado", dt_update: new Date().toISOString() })
        .eq("id", instancia.id)

      toast.success("Instancia desconectada")
      setShowDisconnectDialog(false)
      setLiveStatus(null)
      onRefresh()
    } catch (err) {
      console.error("Erro ao desconectar:", err)
      toast.error("Erro ao desconectar")
    } finally {
      setDisconnecting(false)
    }
  }

  // Check status on mount
  useEffect(() => {
    if (instancia?.api_key) {
      checkStatus()
    }
  }, [instancia?.api_key, checkStatus])

  // Polling de QR
  useEffect(() => {
    if (!showQR || !instancia?.api_key) return

    const interval = setInterval(async () => {
      await checkStatus()
      if (liveStatus?.connected && liveStatus?.loggedIn) {
        setShowQR(false)
        setQrCode(null)
        toast.success("Conectado com sucesso!")
        onRefresh()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [showQR, instancia?.api_key, checkStatus, liveStatus, onRefresh])

  // Sem instancia
  if (!instancia) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <div className="mx-auto w-fit p-3 rounded-xl bg-muted mb-3">
            <Smartphone className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">Nenhuma instancia</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Crie uma para comecar
          </p>
          <Link href="/instances/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Instancia
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  const isConnected = liveStatus?.connected && liveStatus?.loggedIn

  return (
    <Card>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Instancia
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={checkStatus}
            disabled={isChecking}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isChecking && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-3">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Status</span>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              isConnected ? "bg-green-500/20 text-green-600" : "bg-muted"
            )}
          >
            {isConnected ? (
              <><Wifi className="h-3 w-3 mr-1" />Conectado</>
            ) : (
              <><WifiOff className="h-3 w-3 mr-1" />Desconectado</>
            )}
          </Badge>
        </div>

        {/* QR Code ou Profile Info */}
        {showQR && qrCode ? (
          <div className="rounded-lg bg-white p-3 flex flex-col items-center">
            <img src={qrCode} alt="QR Code" className="w-full max-w-[180px]" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Escaneie com o WhatsApp
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => {
                setShowQR(false)
                setQrCode(null)
              }}
            >
              Cancelar
            </Button>
          </div>
        ) : isConnected && liveStatus ? (
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-1 ring-border">
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
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {liveStatus.phoneFormatted || liveStatus.phoneNumber || ""}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <QrCode className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">
              Conecte para sincronizar
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {isConnected ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-destructive hover:text-destructive"
              onClick={() => setShowDisconnectDialog(true)}
            >
              <Power className="h-4 w-4 mr-1.5" />
              Desconectar
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1"
              onClick={generateQR}
              disabled={loadingQR || showQR}
            >
              {loadingQR ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-1.5" />
                  Conectar
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>

      {/* Disconnect Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desconectar instancia?</AlertDialogTitle>
            <AlertDialogDescription>
              Voce precisara escanear o QR Code novamente para reconectar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disconnecting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {disconnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Desconectar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
