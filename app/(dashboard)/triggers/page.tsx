"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
  Plus,
  Zap,
  Trash2,
  Copy,
  Pencil,
  MessageSquare,
  Megaphone,
  Webhook,
  Bot,
  Bell,
  Ban,
  Users,
  UserMinus,
  FileText,
  Image,
  ArrowRight,
  BookOpen,
  Tags,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Json } from "@/types/supabase"
import { PageHeader, EmptyState } from "@/components/dashboard"

type Condicoes = {
  operador: "AND" | "OR"
  regras: Array<{
    campo: string
    operador: string
    valor: string
  }>
}

type Gatilho = {
  id: number
  id_organizacao: number
  id_grupo: number | null
  id_categoria: number | null
  nome: string
  descricao: string | null
  tipo_evento: string
  condicoes: Condicoes
  tipo_acao: string
  config_acao: Record<string, unknown>
  prioridade: number
  ativo: boolean
  dt_create: string | null
  grupos?: {
    nome: string
  } | null
  categorias?: {
    nome: string
    cor: string
  } | null
}

const TIPO_EVENTO_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  mensagem_recebida: { label: "Qualquer mensagem", icon: MessageSquare },
  mensagem_texto: { label: "Mensagem de texto", icon: FileText },
  mensagem_midia: { label: "Imagem/Video/Audio", icon: Image },
  membro_entrou: { label: "Membro entrou", icon: Users },
  membro_saiu: { label: "Membro saiu", icon: UserMinus },
}

const TIPO_ACAO_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  excluir_mensagem: { label: "Excluir mensagem", icon: Ban },
  enviar_mensagem: { label: "Enviar mensagem", icon: Megaphone },
  enviar_webhook: { label: "Webhook", icon: Webhook },
  notificar_admin: { label: "Notificar admin", icon: Bell },
  acionar_bot: { label: "Acionar bot", icon: Bot },
}

export default function TriggersPage() {
  const [gatilhos, setGatilhos] = useState<Gatilho[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  const supabase = createClient()

  // Contagens para tabs
  const activeCount = useMemo(() => gatilhos.filter(g => g.ativo).length, [gatilhos])
  const inactiveCount = useMemo(() => gatilhos.filter(g => !g.ativo).length, [gatilhos])

  // Filtrar por tab
  const filteredGatilhos = useMemo(() => {
    switch (activeTab) {
      case "active":
        return gatilhos.filter(g => g.ativo)
      case "inactive":
        return gatilhos.filter(g => !g.ativo)
      default:
        return gatilhos
    }
  }, [gatilhos, activeTab])

  const loadGatilhos = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      const { data: usuarioSistema } = await supabase
        .from("usuarios_sistema")
        .select("id_organizacao")
        .eq("email", user.email)
        .single()

      if (!usuarioSistema?.id_organizacao) return

      const { data, error } = await supabase
        .from("gatilhos")
        .select("*, grupos(nome), categorias(nome, cor)")
        .eq("id_organizacao", usuarioSistema.id_organizacao)
        .order("prioridade", { ascending: true })

      if (error) throw error
      setGatilhos((data || []).map(g => ({
        ...g,
        condicoes: (g.condicoes || { operador: "AND", regras: [] }) as Condicoes,
        config_acao: (g.config_acao || {}) as Record<string, unknown>,
      })))
    } catch (err) {
      console.error("Erro ao carregar gatilhos:", err)
      toast.error("Erro ao carregar gatilhos")
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadGatilhos()
  }, [loadGatilhos])

  const handleToggle = async (id: number, ativo: boolean) => {
    setToggling(id)
    try {
      const { error } = await supabase
        .from("gatilhos")
        .update({ ativo, dt_update: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      setGatilhos(prev => prev.map(g => g.id === id ? { ...g, ativo } : g))
      toast.success(ativo ? "Gatilho ativado" : "Gatilho desativado")
    } catch (err) {
      console.error("Erro ao atualizar gatilho:", err)
      toast.error("Erro ao atualizar gatilho")
    } finally {
      setToggling(null)
    }
  }

  const handleDuplicate = async (gatilho: Gatilho) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      const { data: usuarioSistema } = await supabase
        .from("usuarios_sistema")
        .select("id_organizacao")
        .eq("email", user.email)
        .single()

      if (!usuarioSistema?.id_organizacao) return

      const { error } = await supabase.from("gatilhos").insert({
        id_organizacao: usuarioSistema.id_organizacao,
        id_grupo: gatilho.id_grupo,
        nome: `${gatilho.nome} (copia)`,
        descricao: gatilho.descricao,
        tipo_evento: gatilho.tipo_evento,
        condicoes: gatilho.condicoes as unknown as Json,
        tipo_acao: gatilho.tipo_acao,
        config_acao: gatilho.config_acao as unknown as Json,
        prioridade: gatilho.prioridade + 1,
        ativo: false,
      })

      if (error) throw error

      toast.success("Gatilho duplicado")
      loadGatilhos()
    } catch (err) {
      console.error("Erro ao duplicar gatilho:", err)
      toast.error("Erro ao duplicar gatilho")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from("gatilhos").delete().eq("id", id)
      if (error) throw error

      setGatilhos(prev => prev.filter(g => g.id !== id))
      toast.success("Gatilho removido")
    } catch (err) {
      console.error("Erro ao remover gatilho:", err)
      toast.error("Erro ao remover gatilho")
    }
  }

const CAMPO_LABELS: Record<string, string> = {
    conteudo_texto: "Mensagem",
    remetente: "Remetente",
    tipo_mensagem: "Tipo",
  }

  const OPERADOR_LABELS: Record<string, string> = {
    contem: "contém",
    nao_contem: "não contém",
    igual: "igual a",
    comeca_com: "começa com",
    termina_com: "termina com",
    regex: "regex",
  }

  // Agrupa regras por campo+operador para exibição compacta
  const agruparCondicoes = (condicoes: Gatilho["condicoes"]) => {
    if (!condicoes.regras || condicoes.regras.length === 0) return null

    // Agrupa por campo+operador
    const grupos: Record<string, string[]> = {}
    condicoes.regras.forEach(r => {
      const key = `${r.campo}|${r.operador}`
      if (!grupos[key]) grupos[key] = []
      grupos[key].push(r.valor)
    })

    return {
      grupos,
      operador: condicoes.operador,
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gatilhos"
        description="Automatize acoes nos seus grupos WhatsApp"
        tabs={[
          { label: "Todos", value: "all", count: gatilhos.length },
          { label: "Ativos", value: "active", count: activeCount },
          { label: "Inativos", value: "inactive", count: inactiveCount },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actions={
          <Button asChild>
            <Link href="/triggers/new">
              <Plus className="h-4 w-4 mr-2" />
              Novo Gatilho
            </Link>
          </Button>
        }
      />

      {/* Lista de Gatilhos */}
      {filteredGatilhos.length > 0 ? (
        <Card>
          <div className="divide-y">
            {filteredGatilhos.map((gatilho) => {
              const eventoInfo = TIPO_EVENTO_LABELS[gatilho.tipo_evento] || { label: gatilho.tipo_evento, icon: Zap }
              const acaoInfo = TIPO_ACAO_LABELS[gatilho.tipo_acao] || { label: gatilho.tipo_acao, icon: Zap }
              const EventoIcon = eventoInfo.icon
              const AcaoIcon = acaoInfo.icon
              const condicoesAgrupadas = agruparCondicoes(gatilho.condicoes)

              return (
                <div
                  key={gatilho.id}
                  className={cn(
                    "p-3 sm:p-4 transition-colors hover:bg-muted/30 group/item",
                    !gatilho.ativo && "opacity-60"
                  )}
                >
                  {/* Header compacto */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className={cn(
                        "relative p-2 sm:p-2.5 rounded-lg transition-all shrink-0",
                        gatilho.ativo
                          ? "bg-foreground/10"
                          : "bg-muted"
                      )}>
                        <Zap className={cn(
                          "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
                          gatilho.ativo ? "text-foreground" : "text-muted-foreground"
                        )} />
                        {/* Status dot */}
                        <div className="absolute -top-0.5 -right-0.5">
                          <div className={cn(
                            "h-2 w-2 rounded-full border border-background",
                            gatilho.ativo ? "bg-foreground" : "bg-muted-foreground"
                          )} />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate">
                          {gatilho.nome}
                        </h3>
                        {gatilho.descricao && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                            {gatilho.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <div className="hidden sm:flex items-center gap-0.5 sm:opacity-0 sm:group-hover/item:opacity-100 transition-opacity">
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/triggers/${gatilho.id}/edit`}>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent><p>Editar</p></TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleDuplicate(gatilho)}
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Duplicar</p></TooltipContent>
                          </Tooltip>

                          <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent><p>Excluir</p></TooltipContent>
                            </Tooltip>
                            <AlertDialogContent className="max-w-sm p-4 sm:p-6">
                              <AlertDialogHeader className="pb-2">
                                <AlertDialogTitle className="text-base">Excluir gatilho?</AlertDialogTitle>
                                <AlertDialogDescription className="text-xs sm:text-sm">
                                  Esta acao nao pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="gap-2">
                                <AlertDialogCancel className="h-8 text-sm">Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(gatilho.id)}
                                  className="h-8 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TooltipProvider>
                      </div>

                      {/* Mobile: apenas editar */}
                      <Link href={`/triggers/${gatilho.id}/edit`} className="sm:hidden">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>

                      <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

                      <Switch
                        checked={gatilho.ativo}
                        onCheckedChange={(checked) => handleToggle(gatilho.id, checked)}
                        disabled={toggling === gatilho.id}
                        className="scale-90 sm:scale-100"
                      />
                    </div>
                  </div>

                  {/* Flow visualization - compacto */}
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pl-10 sm:pl-12">
                    <Badge variant="secondary" className="flex items-center gap-1 text-[10px] sm:text-xs px-1.5 py-0 h-5">
                      <EventoIcon className="h-3 w-3" />
                      <span className="hidden sm:inline">{eventoInfo.label}</span>
                      <span className="sm:hidden">{eventoInfo.label.split(' ')[0]}</span>
                    </Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="secondary" className="flex items-center gap-1 text-[10px] sm:text-xs px-1.5 py-0 h-5">
                      <AcaoIcon className="h-3 w-3" />
                      <span className="hidden sm:inline">{acaoInfo.label}</span>
                      <span className="sm:hidden">{acaoInfo.label.split(' ')[0]}</span>
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1 text-[10px] sm:text-xs px-1.5 py-0 h-5 max-w-[120px] sm:max-w-none">
                      {gatilho.categorias && (
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: gatilho.categorias.cor }}
                        />
                      )}
                      <span className="truncate">
                        {gatilho.grupos
                          ? gatilho.grupos.nome
                          : gatilho.categorias
                          ? gatilho.categorias.nome
                          : "Todos"}
                      </span>
                    </Badge>
                  </div>

                  {/* Conditions - compacto */}
                  {condicoesAgrupadas && (
                    <div className="rounded-lg bg-muted/50 p-2 mt-2 ml-10 sm:ml-12 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[10px] text-muted-foreground font-medium">Condições</p>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                          {condicoesAgrupadas.operador === "AND" ? "todas" : "qualquer"}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {Object.entries(condicoesAgrupadas.grupos).slice(0, 2).map(([key, valores], idx) => {
                          const [campo, operador] = key.split("|")
                          const campoLabel = CAMPO_LABELS[campo] || campo
                          const operadorLabel = OPERADOR_LABELS[operador] || operador
                          return (
                            <div key={idx} className="flex flex-wrap items-center gap-1">
                              <span className="text-[10px] text-muted-foreground">
                                {campoLabel} {operadorLabel}:
                              </span>
                              {valores.slice(0, 3).map((valor, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="text-[10px] font-normal px-1.5 py-0 h-4"
                                >
                                  {valor.length > 15 ? valor.slice(0, 15) + '...' : valor}
                                </Badge>
                              ))}
                              {valores.length > 3 && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                  +{valores.length - 3}
                                </Badge>
                              )}
                            </div>
                          )
                        })}
                        {Object.keys(condicoesAgrupadas.grupos).length > 2 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{Object.keys(condicoesAgrupadas.grupos).length - 2} condição(ões)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={Zap}
          title={activeTab === "all" ? "Nenhum gatilho configurado" : `Nenhum gatilho ${activeTab === "active" ? "ativo" : "inativo"}`}
          description={
            activeTab === "all"
              ? "Crie automacoes para seus grupos WhatsApp"
              : `Voce nao tem gatilhos ${activeTab === "active" ? "ativos" : "inativos"} no momento`
          }
          action={
            activeTab === "all"
              ? { label: "Criar Gatilho", href: "/triggers/new", icon: Plus }
              : undefined
          }
          secondaryActions={
            activeTab === "all"
              ? [
                  {
                    icon: BookOpen,
                    title: "Como funciona",
                    description: "Aprenda sobre gatilhos e automacoes",
                    href: "#",
                  },
                  {
                    icon: Tags,
                    title: "Categorias",
                    description: "Organize grupos antes de criar gatilhos",
                    href: "/categories",
                  },
                ]
              : undefined
          }
        />
      )}
    </div>
  )
}
