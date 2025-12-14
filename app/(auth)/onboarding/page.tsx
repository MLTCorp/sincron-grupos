"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Building2, CheckCircle2, ArrowRight, Smartphone, Users, Zap, RefreshCw } from "lucide-react"

const STEPS = [
  {
    id: "welcome",
    title: "Bem-vindo ao Sincron Grupos!",
    description: "Vamos configurar sua organizacao em poucos passos",
  },
  {
    id: "organization",
    title: "Sua Organizacao",
    description: "Confirme ou atualize o nome da sua organizacao",
  },
  {
    id: "features",
    title: "O que voce pode fazer",
    description: "Conheca as principais funcionalidades",
  },
]

const FEATURES = [
  {
    icon: Smartphone,
    title: "Conecte seu WhatsApp",
    description: "Conecte uma ou mais instancias WhatsApp para gerenciar seus grupos",
  },
  {
    icon: Users,
    title: "Gerencie Grupos",
    description: "Organize grupos em categorias, adicione membros e monitore atividades",
  },
  {
    icon: Zap,
    title: "Automatize Tarefas",
    description: "Configure comandos, gatilhos e disparos em massa automatizados",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [orgName, setOrgName] = useState("")
  const [orgId, setOrgId] = useState<number | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function loadOrganization() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user?.email) {
          router.push("/login")
          return
        }

        const { data: usuarioSistema, error } = await supabase
          .from("usuarios_sistema")
          .select(`
            id,
            id_organizacao,
            organizacoes (
              id,
              nome
            )
          `)
          .eq("email", user.email)
          .single()

        if (error || !usuarioSistema) {
          toast.error("Erro ao carregar dados. Tente fazer login novamente.")
          router.push("/login")
          return
        }

        const org = Array.isArray(usuarioSistema.organizacoes)
          ? usuarioSistema.organizacoes[0]
          : usuarioSistema.organizacoes

        if (org) {
          setOrgName(org.nome || "")
          setOrgId(org.id)
        }
      } catch (err) {
        console.error("Erro no onboarding:", err)
        toast.error("Erro ao carregar dados")
      } finally {
        setLoading(false)
      }
    }

    loadOrganization()
  }, [router, supabase])

  const handleSaveOrg = async () => {
    if (!orgId || !orgName.trim()) {
      toast.error("Nome da organizacao e obrigatorio")
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from("organizacoes")
        .update({ nome: orgName.trim() })
        .eq("id", orgId)

      if (error) throw error

      toast.success("Organizacao atualizada!")
      setCurrentStep(2)
    } catch (err) {
      console.error("Erro ao salvar:", err)
      toast.error("Erro ao salvar organizacao")
    } finally {
      setSaving(false)
    }
  }

  const handleFinish = () => {
    router.push("/dashboard")
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 py-8">
      <Card className="w-full max-w-lg">
        {/* Progress indicator */}
        <div className="flex justify-center gap-2 pt-6">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`h-2 w-16 rounded-full transition-colors ${
                index <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{STEPS[currentStep].title}</CardTitle>
          <CardDescription>{STEPS[currentStep].description}</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Step 0: Welcome */}
          {currentStep === 0 && (
            <div className="flex flex-col items-center py-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <p className="text-center text-muted-foreground">
                Sua conta foi criada com sucesso! Vamos configurar algumas coisas
                para voce comecar a usar o sistema.
              </p>
            </div>
          )}

          {/* Step 1: Organization */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Nome da Organizacao</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="orgName"
                    type="text"
                    placeholder="Nome da sua empresa"
                    className="pl-10"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Este nome aparecera no sistema e para os membros da sua equipe
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Features */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          {currentStep > 0 && currentStep < 2 && (
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Voltar
            </Button>
          )}
          {currentStep === 0 && <div />}

          {currentStep === 0 && (
            <Button onClick={nextStep}>
              Comecar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {currentStep === 1 && (
            <Button onClick={handleSaveOrg} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}

          {currentStep === 2 && (
            <Button onClick={handleFinish} className="w-full">
              Ir para o Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
