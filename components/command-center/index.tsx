"use client"

import { useState, useEffect, useMemo } from "react"
import { useOrganizationData, type Instancia, type Categoria } from "@/hooks/use-organization-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { CategoryConfigDrawer } from "./category-config-drawer"
import { TriggersOverviewDrawer } from "./triggers-overview-drawer"
import { AIAgentsDrawer } from "./ai-agents-drawer"
import { SyncGroupsDialog } from "./sync-groups-dialog"
import { MassMessageModal } from "./mass-message-modal"
import Link from "next/link"
import {
  Users,
  Zap,
  Smartphone,
  Send,
  Bot,
  FileAudio,
  Plus,
  RefreshCw,
  Check,
  UserPlus,
  Bell
} from "lucide-react"

// Onboarding steps
const onboardingSteps = [
  { id: 1, title: "Conectar WhatsApp", description: "Escaneie o QR Code para vincular seu numero.", completed: false },
  { id: 2, title: "Sincronizar grupos", description: "Importe seus grupos do WhatsApp.", completed: false },
  { id: 3, title: "Criar categorias", description: "Organize grupos por tags (Vendas, Suporte, etc).", completed: false },
  { id: 4, title: "Configurar primeiro gatilho", description: "Crie uma automacao para moderar ou responder.", completed: false },
]

export function CommandCenter() {
  const {
    instancias,
    categorias,
    grupos,
    agentes,
    gatilhos,
    loading,
    refresh,
    refreshInstancias,
    refreshCategorias,
    refreshGrupos,
    refreshAgentes,
    refreshGatilhos,
    instanciaConectada,
    gruposPorCategoria,
  } = useOrganizationData()

  // Estado da instancia selecionada
  const [selectedInstance, setSelectedInstance] = useState<Instancia | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Drawers e modais
  const [categoryConfigOpen, setCategoryConfigOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null)
  const [triggersDrawerOpen, setTriggersDrawerOpen] = useState(false)
  const [aiDrawerOpen, setAIDrawerOpen] = useState(false)
  const [syncDialogOpen, setSyncDialogOpen] = useState(false)
  const [messageModalOpen, setMessageModalOpen] = useState(false)

  // Selecionar instancia automaticamente
  useEffect(() => {
    if (instancias.length > 0 && !selectedInstance) {
      setSelectedInstance(instanciaConectada || instancias[0])
    }
  }, [instancias, instanciaConectada, selectedInstance])

  // Estatisticas
  const stats = useMemo(() => ({
    grupos: grupos.length,
    gatilhosAtivos: gatilhos.filter(g => g.ativo).length,
    gatilhosPausados: gatilhos.filter(g => !g.ativo).length,
    instanciasConectadas: instancias.filter(i => i.status === "conectado").length,
    totalInstancias: instancias.length,
    categorias: categorias.length,
    agentesAtivos: agentes.filter(a => a.ativo).length,
  }), [grupos, gatilhos, instancias, categorias, agentes])

  // Calcular progresso do onboarding
  const onboardingProgress = useMemo(() => {
    let completed = 0
    if (stats.instanciasConectadas > 0) completed++
    if (stats.grupos > 0) completed++
    if (stats.categorias > 0) completed++
    if (stats.gatilhosAtivos > 0) completed++
    return { completed, total: 4, percentage: (completed / 4) * 100 }
  }, [stats])

  // Refresh all data
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refresh()
    setIsRefreshing(false)
  }

  // Handlers
  const handleOpenCategoryConfig = (categoria: Categoria) => {
    setSelectedCategory(categoria)
    setCategoryConfigOpen(true)
  }

  const handleCategoryUpdate = () => {
    refreshCategorias()
    refreshGrupos()
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-8 p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Visao geral da sua organizacao.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Onboarding Checklist */}
      {onboardingProgress.completed < 4 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">Bem-vindo ao Sincron Grupos</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete os passos para comecar a usar a plataforma.
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary">
                  Progresso: {onboardingProgress.completed}/{onboardingProgress.total}
                </p>
                <Progress value={onboardingProgress.percentage} className="w-32 h-2 mt-2" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`flex items-start gap-4 ${stats.instanciasConectadas > 0 ? "" : "opacity-60"}`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 mt-1 ${
                  stats.instanciasConectadas > 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border-2 border-border text-muted-foreground"
                }`}>
                  {stats.instanciasConectadas > 0 ? <Check className="h-4 w-4" /> : "1"}
                </div>
                <div>
                  <h4 className="font-semibold">1. Conectar WhatsApp</h4>
                  <p className="text-sm text-muted-foreground">Escaneie o QR Code para vincular seu numero.</p>
                </div>
              </div>

              <div className={`flex items-start gap-4 ${stats.grupos > 0 ? "" : "opacity-60"}`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 mt-1 ${
                  stats.grupos > 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border-2 border-border text-muted-foreground"
                }`}>
                  {stats.grupos > 0 ? <Check className="h-4 w-4" /> : "2"}
                </div>
                <div>
                  <h4 className="font-semibold">2. Sincronizar grupos</h4>
                  <p className="text-sm text-muted-foreground">Importe seus grupos do WhatsApp.</p>
                </div>
              </div>

              <div className={`flex items-start gap-4 ${stats.categorias > 0 ? "" : "opacity-60"}`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 mt-1 ${
                  stats.categorias > 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border-2 border-border text-muted-foreground"
                }`}>
                  {stats.categorias > 0 ? <Check className="h-4 w-4" /> : "3"}
                </div>
                <div>
                  <h4 className="font-semibold">3. Criar categorias</h4>
                  <p className="text-sm text-muted-foreground">Organize grupos por tags (Vendas, Suporte, etc).</p>
                </div>
              </div>

              <div className={`flex items-start gap-4 ${stats.gatilhosAtivos > 0 ? "" : "opacity-60"}`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 mt-1 ${
                  stats.gatilhosAtivos > 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border-2 border-border text-muted-foreground"
                }`}>
                  {stats.gatilhosAtivos > 0 ? <Check className="h-4 w-4" /> : "4"}
                </div>
                <div>
                  <h4 className="font-semibold">4. Configurar primeiro gatilho</h4>
                  <p className="text-sm text-muted-foreground">Crie uma automacao para moderar ou responder.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t mt-6 text-right">
              <Button variant="ghost" className="text-muted-foreground">
                Pular setup
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Instancia */}
        <Link href="/instances">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Instancia</h4>
                <div className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-lg">
                  <Smartphone className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-4 flex items-center">
                {stats.instanciasConectadas > 0 ? (
                  <>
                    <span className="w-3 h-3 rounded-full bg-primary mr-2"></span>
                    Conectada
                  </>
                ) : (
                  <>
                    <span className="w-3 h-3 rounded-full bg-muted-foreground mr-2"></span>
                    Desconectada
                  </>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {instanciaConectada?.liveStatus?.phoneFormatted || instanciaConectada?.numero_telefone || instanciaConectada?.nome_instancia || "Nenhum numero"}
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Grupos */}
        <Link href="/groups">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Grupos</h4>
                <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-4">{stats.grupos} grupos</p>
              <p className="text-sm text-muted-foreground">{stats.categorias} categorias</p>
            </CardContent>
          </Card>
        </Link>

        {/* Gatilhos */}
        <Link href="/triggers">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Gatilhos</h4>
                <div className="w-8 h-8 flex items-center justify-center bg-yellow-100 rounded-lg">
                  <Zap className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-4">{stats.gatilhosAtivos} ativos</p>
              <p className="text-sm text-muted-foreground">{stats.gatilhosPausados} pausados</p>
            </CardContent>
          </Card>
        </Link>

        {/* Mensagens */}
        <Link href="/messages">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Mensagens</h4>
                <div className="w-8 h-8 flex items-center justify-center bg-indigo-100 rounded-lg">
                  <Send className="h-4 w-4 text-indigo-600" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-4">0 agendadas</p>
              <p className="text-sm text-muted-foreground">0 enviadas</p>
            </CardContent>
          </Card>
        </Link>

        {/* Agentes IA */}
        <Link href="/ai">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Agentes IA</h4>
                <div className="w-8 h-8 flex items-center justify-center bg-purple-100 rounded-lg">
                  <Bot className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-4">{stats.agentesAtivos} ativos</p>
              <p className="text-sm text-muted-foreground">{agentes.length} configurados</p>
            </CardContent>
          </Card>
        </Link>

        {/* Transcricao */}
        <Link href="/transcription">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Transcricao</h4>
                <div className="w-8 h-8 flex items-center justify-center bg-pink-100 rounded-lg">
                  <FileAudio className="h-4 w-4 text-pink-600" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-4">0 grupos</p>
              <p className="text-sm text-muted-foreground">configurados</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold">Acoes Rapidas</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Execute tarefas comuns com um unico clique.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button onClick={() => setMessageModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova mensagem
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/triggers/new">
                <Plus className="h-4 w-4 mr-2" />
                Novo gatilho
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setSyncDialogOpen(true)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizar grupos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold">Atividade Recente</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Ultimas acoes realizadas na plataforma.
          </p>
          <div className="mt-4 flow-root">
            <ul role="list" className="-mb-8">
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border" aria-hidden="true"></span>
                  <div className="relative flex gap-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-accent flex items-center justify-center ring-8 ring-card">
                        <Zap className="h-4 w-4 text-accent-foreground" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between gap-4">
                      <div>
                        <p className="text-sm">
                          Gatilho <span className="font-medium text-primary">&quot;Boas-vindas&quot;</span> foi ativado no grupo <span className="font-medium">Vendas SP</span>.
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-muted-foreground">
                        <time>2 min atras</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border" aria-hidden="true"></span>
                  <div className="relative flex gap-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-muted-foreground flex items-center justify-center ring-8 ring-card">
                        <Users className="h-4 w-4 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between gap-4">
                      <div>
                        <p className="text-sm">
                          Sincronizacao completada. <span className="font-medium">2 novos grupos</span> adicionados.
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-muted-foreground">
                        <time>1 hora atras</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative">
                  <div className="relative flex gap-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-primary flex items-center justify-center ring-8 ring-card">
                        <UserPlus className="h-4 w-4 text-primary-foreground" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between gap-4">
                      <div>
                        <p className="text-sm">
                          Usuario <span className="font-medium">Carlos</span> foi adicionado a equipe.
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-muted-foreground">
                        <time>3 horas atras</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        <p>Copyright &copy; 2025 Sincron Grupos. Todos os direitos reservados.</p>
      </footer>

      {/* Drawers */}
      {selectedCategory && (
        <CategoryConfigDrawer
          open={categoryConfigOpen}
          onOpenChange={setCategoryConfigOpen}
          categoria={selectedCategory}
          onUpdate={handleCategoryUpdate}
        />
      )}

      <TriggersOverviewDrawer
        open={triggersDrawerOpen}
        onOpenChange={setTriggersDrawerOpen}
        gatilhos={gatilhos}
        categorias={categorias}
        onUpdate={refreshGatilhos}
      />

      <AIAgentsDrawer
        open={aiDrawerOpen}
        onOpenChange={setAIDrawerOpen}
        agentes={agentes}
        onUpdate={refreshAgentes}
      />

      {/* Modais */}
      <SyncGroupsDialog
        open={syncDialogOpen}
        onOpenChange={setSyncDialogOpen}
        instanceToken={selectedInstance?.api_key || instanciaConectada?.api_key || null}
        instanceId={selectedInstance?.id || instanciaConectada?.id || null}
        categorias={categorias}
        gruposCadastrados={grupos}
        onUpdate={() => {
          refreshGrupos()
          refreshCategorias()
        }}
      />

      <MassMessageModal
        open={messageModalOpen}
        onOpenChange={setMessageModalOpen}
        instanceToken={selectedInstance?.api_key || instanciaConectada?.api_key || null}
        categorias={categorias}
        grupos={grupos}
        onUpdate={refresh}
      />
    </div>
  )
}
