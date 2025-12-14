"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Ripple } from "@/components/magicui/ripple"
import { ArrowLeft, QrCode, RefreshCw, Wifi, WifiOff, Smartphone, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getUAZAPIService, type UAZAPIResponse, type UAZAPIStatusResponse } from "@/lib/uazapi"
import { createClient } from "@/lib/supabase/client"

type ConnectionStatus = "idle" | "generating" | "waiting" | "connected" | "error"

export default function ConnectInstancePage() {
  const params = useParams()
  const router = useRouter()
  const instanceId = params.id as string

  const [status, setStatus] = useState<ConnectionStatus>("idle")
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [pairCode, setPairCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [instanceToken, setInstanceToken] = useState<string | null>(null)
  const [profileName, setProfileName] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null)
  const [instanceName, setInstanceName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Usar singleton e memoizar o supabase client
  const apiService = useMemo(() => getUAZAPIService(), [])
  const supabase = useMemo(() => createClient(), [])

  // Buscar token da instância do Supabase e verificar status na UAZAPI
  useEffect(() => {
    async function loadInstance() {
      try {
        const { data: instancia, error: fetchError } = await supabase
          .from("instancias_whatsapp")
          .select("api_key, nome_instancia, status")
          .eq("id", Number(instanceId))
          .single()

        if (fetchError || !instancia) {
          setError("Instancia nao encontrada")
          setStatus("error")
          return
        }

        if (!instancia.api_key) {
          setError("Token da instancia nao configurado")
          setStatus("error")
          return
        }

        setInstanceToken(instancia.api_key)
        setInstanceName(instancia.nome_instancia)

        // Verificar status real na UAZAPI (nao confiar apenas no Supabase)
        try {
          const statusResponse = await apiService.obterStatus(instancia.api_key)
          const extracted = statusResponse.extractedStatus

          if (extracted?.connected && extracted?.loggedIn) {
            setStatus("connected")
            setProfileName(extracted.profileName)
            setPhoneNumber(extracted.phoneFormatted)
          } else if (instancia.status === "conectado") {
            // Status no banco diz conectado mas UAZAPI diz desconectado - atualizar banco
            await supabase
              .from("instancias_whatsapp")
              .update({ status: "desconectado", dt_update: new Date().toISOString() })
              .eq("id", Number(instanceId))
          }
        } catch (err) {
          console.error("Erro ao verificar status UAZAPI:", err)
          // Se falhar a verificacao, usar status do banco como fallback
          if (instancia.status === "conectado") {
            setStatus("connected")
          }
        }
      } catch (err) {
        console.error("Erro ao carregar instancia:", err)
        setError("Erro ao carregar dados da instancia")
        setStatus("error")
      } finally {
        setLoading(false)
      }
    }

    loadInstance()
  }, [instanceId, supabase, apiService])

  // Gerar QR Code
  const generateQrCode = useCallback(async () => {
    if (!instanceToken) return

    setStatus("generating")
    setError(null)

    try {
      const response: UAZAPIResponse = await apiService.conectarInstancia(instanceToken)

      if (response.instance.qrcode) {
        setQrCode(response.instance.qrcode)
        setPairCode(response.instance.paircode || null)
        setStatus("waiting")
        setCountdown(30)
      } else if (response.connected && response.loggedIn) {
        setStatus("connected")
        setProfileName(response.instance.profileName || null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar QR Code")
      setStatus("error")
    }
  }, [instanceToken, apiService])

  // Verificar status da conexão
  const checkStatus = useCallback(async () => {
    if (!instanceToken || status !== "waiting") return

    try {
      const response: UAZAPIStatusResponse = await apiService.obterStatus(instanceToken)
      const extracted = response.extractedStatus

      if (extracted?.connected && extracted?.loggedIn) {
        setStatus("connected")
        setProfileName(extracted.profileName)
        setPhoneNumber(extracted.phoneFormatted)
        setQrCode(null)
        setPairCode(null)

        // Atualizar status no Supabase com todos os dados
        await supabase
          .from("instancias_whatsapp")
          .update({
            status: "conectado",
            numero_telefone: extracted.phoneNumber,
            profile_name: extracted.profileName,
            profile_pic_url: extracted.profilePicUrl,
            is_business: extracted.isBusiness,
            platform: extracted.platform,
            dt_update: new Date().toISOString()
          })
          .eq("id", Number(instanceId))

        // Configurar webhook automaticamente apos conexao bem-sucedida
        try {
          await apiService.configurarWebhook(instanceToken)
          console.log('Webhook configurado automaticamente para instancia', instanceId)
        } catch (webhookError) {
          // Nao bloquear o fluxo se webhook falhar - apenas logar
          console.error('Erro ao configurar webhook (nao bloqueante):', webhookError)
        }
      }
    } catch (err) {
      console.error("Erro ao verificar status:", err)
    }
  }, [instanceToken, status, apiService, supabase, instanceId])

  // Polling do status enquanto aguarda conexão
  useEffect(() => {
    if (status !== "waiting") return

    const interval = setInterval(checkStatus, 3000)
    return () => clearInterval(interval)
  }, [status, checkStatus])

  // Countdown para retry do QR Code
  useEffect(() => {
    if (countdown <= 0) return

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const getStatusBadge = () => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-500 text-white">Conectado</Badge>
      case "waiting":
        return <Badge className="bg-yellow-500 text-white">Aguardando leitura</Badge>
      case "generating":
        return <Badge className="bg-blue-500 text-white">Gerando QR Code...</Badge>
      case "error":
        return <Badge variant="destructive">Erro</Badge>
      default:
        return <Badge variant="secondary">Desconectado</Badge>
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
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
        <div>
          <h1 className="text-3xl font-bold">
            Conectar {instanceName || "Instância"}
          </h1>
          <p className="text-muted-foreground">
            Escaneie o QR Code com seu WhatsApp
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* QR Code Card */}
        <Card className="relative overflow-hidden">
          {status === "waiting" && <BorderBeam size={250} duration={12} />}

          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code
              </CardTitle>
              {getStatusBadge()}
            </div>
            <CardDescription>
              {status === "connected"
                ? "Instância conectada com sucesso!"
                : "Abra o WhatsApp no celular e escaneie o código"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Estado: Conectado */}
            {status === "connected" && (
              <div className="relative flex flex-col items-center justify-center py-8">
                <div className="relative">
                  <Ripple mainCircleSize={100} numCircles={5} />
                  <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-green-500">
                    <CheckCircle2 className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-green-600">
                  Conectado com sucesso!
                </h3>
                {profileName && (
                  <p className="font-medium">{profileName}</p>
                )}
                {phoneNumber && (
                  <p className="text-sm text-muted-foreground">{phoneNumber}</p>
                )}
                <Button
                  className="mt-4"
                  onClick={() => router.push("/instances")}
                >
                  Voltar para Instâncias
                </Button>
              </div>
            )}

            {/* Estado: Aguardando leitura do QR Code */}
            {status === "waiting" && qrCode && (
              <div className="space-y-4">
                <div className="flex justify-center rounded-lg border bg-white p-4">
                  <Image
                    src={qrCode}
                    alt="QR Code WhatsApp"
                    width={256}
                    height={256}
                    className="h-64 w-64"
                  />
                </div>

                {pairCode && (
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Ou use o código de pareamento:
                    </p>
                    <span className="font-mono text-2xl font-bold tracking-widest">
                      {pairCode}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Verificando conexão...
                  </span>
                  {countdown > 0 && (
                    <span>Novo QR em {countdown}s</span>
                  )}
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={generateQrCode}
                  disabled={countdown > 0}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Gerar Novo QR Code
                </Button>
              </div>
            )}

            {/* Estado: Idle ou Erro */}
            {(status === "idle" || status === "error") && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                  {status === "error" ? (
                    <WifiOff className="h-12 w-12 text-destructive" />
                  ) : (
                    <Smartphone className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>

                {error && (
                  <p className="text-center text-sm text-destructive">{error}</p>
                )}

                <Button onClick={generateQrCode} className="bg-green-500 hover:bg-green-600">
                  <QrCode className="mr-2 h-4 w-4" />
                  Gerar QR Code
                </Button>
              </div>
            )}

            {/* Estado: Gerando */}
            {status === "generating" && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                  <RefreshCw className="h-12 w-12 text-primary animate-spin" />
                </div>
                <p className="text-muted-foreground">Gerando QR Code...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>Como conectar</CardTitle>
            <CardDescription>
              Siga os passos abaixo para conectar seu WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  1
                </span>
                <div>
                  <p className="font-medium">Abra o WhatsApp</p>
                  <p className="text-sm text-muted-foreground">
                    No seu celular, abra o aplicativo WhatsApp
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  2
                </span>
                <div>
                  <p className="font-medium">Acesse Aparelhos Conectados</p>
                  <p className="text-sm text-muted-foreground">
                    Toque em Menu (três pontos) → Aparelhos conectados
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  3
                </span>
                <div>
                  <p className="font-medium">Conectar um aparelho</p>
                  <p className="text-sm text-muted-foreground">
                    Toque em &quot;Conectar um aparelho&quot;
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  4
                </span>
                <div>
                  <p className="font-medium">Escaneie o QR Code</p>
                  <p className="text-sm text-muted-foreground">
                    Aponte a câmera do celular para o QR Code ao lado
                  </p>
                </div>
              </li>
            </ol>

            <div className="mt-6 rounded-lg bg-muted p-4">
              <div className="flex items-start gap-3">
                <Wifi className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Dica</p>
                  <p className="text-sm text-muted-foreground">
                    Você também pode usar o código de pareamento se preferir não escanear o QR Code.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
