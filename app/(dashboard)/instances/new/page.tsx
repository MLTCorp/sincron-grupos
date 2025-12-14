"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShineBorder } from "@/components/magicui/shine-border"
import { ArrowLeft, Smartphone, RefreshCw, Sparkles } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { UAZAPIService } from "@/lib/uazapi"

export default function NewInstancePage() {
  const router = useRouter()
  const [nome, setNome] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<"form" | "creating" | "success">("form")

  const supabase = createClient()
  const apiService = new UAZAPIService()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) return

    setLoading(true)
    setError(null)
    setStep("creating")

    try {
      // 1. Buscar usuário e organização
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error("Usuário não autenticado")

      const { data: usuarioSistema } = await supabase
        .from("usuarios_sistema")
        .select("*, organizacoes(*)")
        .eq("email", user.email)
        .single()

      if (!usuarioSistema?.id_organizacao) {
        throw new Error("Organização não encontrada")
      }

      // 2. Criar instância na UAZAPI
      const uazapiResponse = await apiService.criarInstancia({
        name: nome,
        systemName: "sincron-grupos",
        adminField01: `org-${usuarioSistema.id_organizacao}`,
      })

      // 3. Salvar instância no Supabase
      const { data: instancia, error: insertError } = await supabase
        .from("instancias_whatsapp")
        .insert({
          id_organizacao: usuarioSistema.id_organizacao,
          nome_instancia: nome,
          api_key: uazapiResponse.instance.token,
          status: "desconectado",
        })
        .select()
        .single()

      if (insertError) throw insertError

      setStep("success")

      // Redirecionar para a página de conexão após 2 segundos
      setTimeout(() => {
        router.push(`/instances/${instancia.id}/connect`)
      }, 2000)
    } catch (err) {
      console.error("Erro ao criar instância:", err)
      setError(err instanceof Error ? err.message : "Erro ao criar instância")
      setStep("form")
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold">Nova Instância</h1>
          <p className="text-muted-foreground">
            Configure uma nova conexão WhatsApp
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulário */}
        <ShineBorder
          className="w-full"
          color={step === "success" ? ["#22c55e", "#16a34a"] : ["#3b82f6", "#8b5cf6"]}
        >
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                {step === "success" ? "Instância Criada!" : "Dados da Instância"}
              </CardTitle>
              <CardDescription>
                {step === "success"
                  ? "Redirecionando para a página de conexão..."
                  : "Preencha as informações abaixo"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {step === "form" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Instância</Label>
                    <Input
                      id="nome"
                      placeholder="Ex: WhatsApp Principal"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Um nome para identificar esta conexão WhatsApp
                    </p>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600"
                    disabled={loading || !nome.trim()}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Criar Instância
                      </>
                    )}
                  </Button>
                </form>
              )}

              {step === "creating" && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                  </div>
                  <p className="text-muted-foreground">Criando instância...</p>
                </div>
              )}

              {step === "success" && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
                    <Sparkles className="h-10 w-10 text-green-500" />
                  </div>
                  <p className="text-green-600 font-medium">
                    Instancia criada com sucesso!
                  </p>
                  <p className="text-sm text-muted-foreground text-center">
                    Agora vamos gerar seu QR Code para conectar o WhatsApp...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </ShineBorder>

        {/* Informações */}
        <Card>
          <CardHeader>
            <CardTitle>O que é uma Instância?</CardTitle>
            <CardDescription>
              Entenda como funciona a conexão WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium mb-2">Uma instância representa:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  Uma conexão ativa com um número WhatsApp
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  Acesso a todos os grupos desse número
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  Capacidade de enviar e receber mensagens
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  Execução de comandos e automações
                </li>
              </ul>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="font-medium mb-2">Próximos passos:</h4>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Criar a instância (você está aqui)</li>
                <li>Escanear o QR Code com seu WhatsApp</li>
                <li>Sincronizar seus grupos</li>
                <li>Configurar comandos e automações</li>
              </ol>
            </div>

            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 p-4">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Importante
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Você precisará manter seu celular conectado à internet para que a
                instância funcione corretamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
