"use client"

import { useState, useEffect, useMemo } from "react"
import { useOrganizationData, type Instancia, type Categoria } from "@/hooks/use-organization-data"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatsCard, StatsGrid } from "@/components/dashboard/stats-card"
import { InstancePanel } from "./instance-panel"
import { GroupsPanel } from "./groups-panel"
import { ActionsPanel } from "./actions-panel"
import { CategoryConfigDrawer } from "./category-config-drawer"
import { TriggersOverviewDrawer } from "./triggers-overview-drawer"
import { AIAgentsDrawer } from "./ai-agents-drawer"
import { SyncGroupsDialog } from "./sync-groups-dialog"
import { MassMessageModal } from "./mass-message-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Users, Zap, Smartphone, MessageSquare, RefreshCw } from "lucide-react"

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
  const [activeTab, setActiveTab] = useState("overview")
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
    instanciasConectadas: instancias.filter(i => i.status === "conectado").length,
    totalInstancias: instancias.length,
    categorias: categorias.length,
    agentesAtivos: agentes.filter(a => a.ativo).length,
  }), [grupos, gatilhos, instancias, categorias, agentes])

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:gap-6">
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-[500px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description="Visao geral do seu workspace"
        tabs={[
          { label: "Visao Geral", value: "overview" },
          { label: "Atividade", value: "activity" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actions={
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        }
      />

      {/* Stats Row */}
      <StatsGrid columns={4}>
        <StatsCard
          label="Grupos"
          value={stats.grupos}
          icon={Users}
          description={`${stats.categorias} categorias`}
          href="/groups"
        />
        <StatsCard
          label="Gatilhos Ativos"
          value={stats.gatilhosAtivos}
          icon={Zap}
          description={`${gatilhos.length} configurados`}
          href="/triggers"
        />
        <StatsCard
          label="Instancias"
          value={`${stats.instanciasConectadas}/${stats.totalInstancias}`}
          icon={Smartphone}
          description={stats.instanciasConectadas > 0 ? "Conectadas" : "Nenhuma conectada"}
          href="/instances"
        />
        <StatsCard
          label="Agentes IA"
          value={stats.agentesAtivos}
          icon={MessageSquare}
          description={`${agentes.length} configurados`}
          href="/ai-agents"
        />
      </StatsGrid>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:gap-6">
        {/* Sidebar esquerda */}
        <div className="space-y-4">
          <InstancePanel
            instancia={selectedInstance || instanciaConectada || instancias[0]}
            onRefresh={refreshInstancias}
          />
          <ActionsPanel
            gatilhosAtivos={gatilhos.filter(g => g.ativo).length}
            agentesAtivos={agentes.filter(a => a.ativo).length}
            onOpenTriggers={() => setTriggersDrawerOpen(true)}
            onOpenAI={() => setAIDrawerOpen(true)}
            onOpenMessages={() => setMessageModalOpen(true)}
            onAddCategory={() => {
              // TODO: Implementar criacao de categoria inline
            }}
          />
        </div>

        {/* Area principal - Grupos */}
        <GroupsPanel
          grupos={grupos}
          categorias={categorias}
          gruposPorCategoria={gruposPorCategoria}
          instanceToken={selectedInstance?.api_key || instanciaConectada?.api_key}
          onSync={() => setSyncDialogOpen(true)}
          onConfigCategory={handleOpenCategoryConfig}
          onRefresh={refreshGrupos}
        />
      </div>

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
