"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { CheckCircle2, XCircle, RefreshCw, UserPlus } from "lucide-react"

interface InviteData {
  id: number
  email: string
  nome: string
  role: string
  invite_expires_at: string
  organizacoes: {
    id: number
    nome: string
  } | null
}

export default function AcceptInvitePage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const supabase = createClient()

  useEffect(() => {
    async function loadInvite() {
      try {
        const { data, error: fetchError } = await supabase
          .from("usuarios_sistema")
          .select(`
            id,
            email,
            nome,
            role,
            invite_expires_at,
            organizacoes (
              id,
              nome
            )
          `)
          .eq("invite_token", token)
          .single()

        if (fetchError || !data) {
          setError("Convite nao encontrado ou invalido")
          return
        }

        // Verificar se expirou
        if (data.invite_expires_at && new Date(data.invite_expires_at) < new Date()) {
          setError("Este convite expirou")
          return
        }

        setInviteData(data as InviteData)
      } catch (err) {
        console.error("Erro ao carregar convite:", err)
        setError("Erro ao carregar convite")
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      loadInvite()
    }
  }, [token, supabase])

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      toast.error("A senha deve ter no minimo 6 caracteres")
      return
    }

    if (password !== confirmPassword) {
      toast.error("As senhas nao conferem")
      return
    }

    if (!inviteData) return

    setAccepting(true)
    try {
      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteData.email,
        password,
        options: {
          data: {
            name: inviteData.nome,
          },
        },
      })

      if (authError) {
        if (authError.message.includes("already registered")) {
          toast.error("Este email ja possui uma conta. Faca login para continuar.")
          router.push("/login")
          return
        }
        throw authError
      }

      // 2. Atualizar usuarios_sistema
      const { error: updateError } = await supabase
        .from("usuarios_sistema")
        .update({
          auth_user_id: authData.user?.id,
          invite_token: null,
          invite_expires_at: null,
          accepted_at: new Date().toISOString(),
          ativo: true,
        })
        .eq("id", inviteData.id)

      if (updateError) {
        console.error("Erro ao atualizar usuario:", updateError)
        // Nao bloquear o fluxo, o usuario foi criado
      }

      toast.success("Conta criada com sucesso! Verifique seu email para confirmar.")
      router.push("/login")
    } catch (err) {
      console.error("Erro ao aceitar convite:", err)
      toast.error("Erro ao criar conta")
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Convite Invalido</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={() => router.push("/")}>
              Voltar para o inicio
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const org = Array.isArray(inviteData?.organizacoes)
    ? inviteData?.organizacoes[0]
    : inviteData?.organizacoes

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Voce foi convidado!</CardTitle>
          <CardDescription>
            Voce foi convidado para fazer parte da organizacao{" "}
            <strong>{org?.nome || "N/A"}</strong> como{" "}
            <strong>{inviteData?.role === "admin" ? "Administrador" : "Membro"}</strong>
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleAccept}>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm">
                <span className="text-muted-foreground">Email:</span>{" "}
                <strong>{inviteData?.email}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Criar Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={accepting}>
              {accepting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Aceitar Convite e Criar Conta
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Ao aceitar, voce concorda com os termos de uso do sistema
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
