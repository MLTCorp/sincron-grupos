"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  UserPlus,
  FileText,
  Image,
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Check,
  Pause,
  Clock,
  Link as LinkIcon,
  Send,
  Reply,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Json } from "@/types/supabase"

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

interface Categoria {
  id: number
  nome: string
  cor: string
}

const TIPO_EVENTO_LABELS: Record<string, { label: string; icon: React.ElementType; bgColor: string }> = {
  mensagem_recebida: { label: "Qualquer mensagem", icon: MessageSquare, bgColor: "bg-primary/10" },
  mensagem_texto: { label: "Palavra-chave", icon: FileText, bgColor: "bg-primary/10" },
  mensagem_midia: { label: "Midia enviada", icon: Image, bgColor: "bg-primary/10" },
  membro_entrou: { label: "Novo membro", icon: UserPlus, bgColor: "bg-primary/10" },
  membro_saiu: { label: "Membro saiu", icon: UserMinus, bgColor: "bg-primary/10" },
  link_detectado: { label: "Link detectado", icon: LinkIcon, bgColor: "bg-destructive/10" },
  agendado: { label: "Agendado", icon: Clock, bgColor: "bg-primary/10" },
}

const TIPO_ACAO_LABELS: Record<string, { label: string; icon: React.ElementType; bgColor: string }> = {
  excluir_mensagem: { label: "Deletar + Avisar", icon: Ban, bgColor: "bg-destructive/10" },
  enviar_mensagem: { label: "Enviar mensagem", icon: Send, bgColor: "bg-accent/10" },
  enviar_webhook: { label: "Webhook", icon: Webhook, bgColor: "bg-primary/10" },
  notificar_admin: { label: "Notificar admin", icon: Bell, bgColor: "bg-primary/10" },
  acionar_bot: { label: "Acionar bot", icon: Bot, bgColor: "bg-primary/10" },
  responder: { label: "Responder", icon: Reply, bgColor: "bg-accent/10" },
}

const ITEMS_PER_PAGE = 10

export default function TriggersPage() {
  const [gatilhos, setGatilhos] = useState<Gatilho[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<number | null>(null)
  const [searchFilter, setSearchFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const supabase = createClient()

  // Estatisticas
  const stats = useMemo(() => {
    const ativos = gatilhos.filter(g => g.ativo).length
    const pausados = gatilhos.filter(g => !g.ativo).length
    const execucoes = gatilhos.reduce((acc, g) => acc + Math.floor(Math.random() * 500), 0) // Placeholder
    const gruposComGatilhos = new Set(gatilhos.map(g => g.id_grupo || g.id_categoria)).size
    return { ativos, pausados, execucoes, gruposComGatilhos }
  }, [gatilhos])

  // Filtrar gatilhos
  const filteredGatilhos = useMemo(() => {
    return gatilhos.filter(g => {
      const matchesSearch = g.nome.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (g.descricao?.toLowerCase().includes(searchFilter.toLowerCase()) ?? false)

      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "active" && g.ativo) ||
        (statusFilter === "paused" && !g.ativo)

      const matchesCategory = categoryFilter === "all" ||
        g.id_categoria === Number(categoryFilter)

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [gatilhos, searchFilter, statusFilter, categoryFilter])

  // Paginacao
  const totalPages = Math.ceil(filteredGatilhos.length / ITEMS_PER_PAGE)
  const paginatedGatilhos = filteredGatilhos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset page quando filtros mudam
  useEffect(() => {
    setCurrentPage(1)
  }, [searchFilter, statusFilter, categoryFilter])

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

      // Carregar gatilhos
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

      // Carregar categorias
      const { data: cats } = await supabase
        .from("categorias")
        .select("id, nome, cor")
        .eq("id_organizacao", usuarioSistema.id_organizacao)
        .eq("ativo", true)

      setCategorias(cats || [])
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
      toast.success(ativo ? "Gatilho ativado" : "Gatilho pausado")
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
        id_categoria: gatilho.id_categoria,
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

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gatilhos</h2>
          <p className="text-muted-foreground">Crie automacoes que respondem a eventos especificos no WhatsApp.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar gatilhos..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status: Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status: Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="paused">Pausados</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Categoria: Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Categoria: Todas</SelectItem>
              {categorias.map(cat => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.cor }} />
                    {cat.nome}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button asChild>
          <Link href="/triggers/new">
            <Plus className="h-4 w-4 mr-2" />
            Novo Gatilho
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-muted-foreground">ATIVOS</span>
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <Check className="h-4 w-4 text-accent" />
              </div>
            </div>
            <p className="text-3xl font-bold">{stats.ativos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-muted-foreground">PAUSADOS</span>
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                <Pause className="h-4 w-4 text-secondary" />
              </div>
            </div>
            <p className="text-3xl font-bold">{stats.pausados}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-muted-foreground">EXECUCOES (30d)</span>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold">{stats.execucoes > 1000 ? `${(stats.execucoes / 1000).toFixed(1)}k` : stats.execucoes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-muted-foreground">GRUPOS COM GATILHOS</span>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-3xl font-bold">{stats.gruposComGatilhos}</p>
          </CardContent>
        </Card>
      </div>

      {/* Triggers Table */}
      {gatilhos.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium">Nome</TableHead>
                  <TableHead className="font-medium">Evento</TableHead>
                  <TableHead className="font-medium">Acao</TableHead>
                  <TableHead className="font-medium">Grupos</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Execucoes</TableHead>
                  <TableHead className="font-medium text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedGatilhos.map((gatilho) => {
                  const eventoInfo = TIPO_EVENTO_LABELS[gatilho.tipo_evento] || { label: gatilho.tipo_evento, icon: Zap, bgColor: "bg-muted" }
                  const acaoInfo = TIPO_ACAO_LABELS[gatilho.tipo_acao] || { label: gatilho.tipo_acao, icon: Zap, bgColor: "bg-muted" }
                  const EventoIcon = eventoInfo.icon
                  const AcaoIcon = acaoInfo.icon
                  const execucoes = Math.floor(Math.random() * 1500) // Placeholder

                  return (
                    <TableRow key={gatilho.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-semibold">{gatilho.nome}</p>
                          {gatilho.descricao && (
                            <p className="text-sm text-muted-foreground">{gatilho.descricao}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", eventoInfo.bgColor)}>
                            <EventoIcon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm">{eventoInfo.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", acaoInfo.bgColor)}>
                            <AcaoIcon className="h-4 w-4 text-accent" />
                          </div>
                          <span className="text-sm">{acaoInfo.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {gatilho.categorias ? (
                            <>
                              <Badge
                                variant="secondary"
                                className="text-xs"
                                style={{
                                  backgroundColor: gatilho.categorias.cor + "20",
                                  color: gatilho.categorias.cor,
                                }}
                              >
                                {gatilho.categorias.nome}
                              </Badge>
                              <Badge variant="secondary" className="text-xs bg-secondary/10 text-secondary">
                                +{Math.floor(Math.random() * 5) + 1}
                              </Badge>
                            </>
                          ) : gatilho.grupos ? (
                            <Badge variant="secondary" className="text-xs">
                              {gatilho.grupos.nome}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">Todos</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {gatilho.ativo ? (
                          <Badge variant="secondary" className="bg-accent/10 text-accent">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mr-1.5" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5" />
                            Pausado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold">{execucoes > 1000 ? `${(execucoes / 1000).toFixed(1)}k` : execucoes}</p>
                        <p className="text-xs text-muted-foreground">ultimos 30 dias</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/triggers/${gatilho.id}/edit`}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(gatilho)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggle(gatilho.id, !gatilho.ativo)}>
                              {gatilho.ativo ? (
                                <>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Pausar
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Ativar
                                </>
                              )}
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir gatilho?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acao nao pode ser desfeita. O gatilho "{gatilho.nome}" sera removido permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(gatilho.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <span className="text-sm text-muted-foreground">
              Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredGatilhos.length)} de {filteredGatilhos.length} gatilhos
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum gatilho configurado</h3>
            <p className="text-muted-foreground mb-6">
              Crie automacoes para responder a eventos nos seus grupos WhatsApp
            </p>
            <Button asChild>
              <Link href="/triggers/new">
                <Plus className="h-4 w-4 mr-2" />
                Criar Gatilho
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        <p>Copyright &copy; 2025 Sincron Grupos</p>
      </footer>
    </div>
  )
}
