"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Loader2,
  Settings2,
  Users,
  Tags,
  HelpCircle,
  Search,
  Bell,
  Save,
  MessageSquare,
  Wand2,
  Hand,
  FileText,
  Brain,
  Pencil,
  BarChart3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type ModoTranscricao = "desativado" | "automatico" | "manual"
type TipoTranscricao = "simples" | "com_resumo"

type Categoria = {
  id: number
  nome: string
  cor: string
  _count?: { grupos: number }
}

type Grupo = {
  id: number
  nome: string
  chat_id_whatsapp: string
  id_categoria: number | null
  categorias?: number[]
}

type ConfigTranscricao = {
  id?: number
  id_organizacao: number
  id_grupo?: number | null
  id_categoria?: number | null
  modo: ModoTranscricao
  emoji_gatilho: string
  tipo_transcricao: TipoTranscricao
}

const EMOJI_PADRAO = "✍️"
const TIPO_PADRAO: TipoTranscricao = "simples"
const ITEMS_PER_PAGE = 10

export default function TranscriptionPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [configsPorCategoria, setConfigsPorCategoria] = useState<Record<number, ConfigTranscricao>>({})
  const [configsPorGrupo, setConfigsPorGrupo] = useState<Record<number, ConfigTranscricao>>({})
  const [emojiPadrao, setEmojiPadrao] = useState(EMOJI_PADRAO)
  const [emojiDialogOpen, setEmojiDialogOpen] = useState(false)
  const [novoEmoji, setNovoEmoji] = useState(EMOJI_PADRAO)
  const [idOrganizacao, setIdOrganizacao] = useState<number | null>(null)

  // Tab and filter state
  const [activeTab, setActiveTab] = useState<"grupos" | "categorias">("grupos")
  const [searchFilter, setSearchFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const supabase = createClient()

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      const { data: usuarioSistema } = await supabase
        .from("usuarios_sistema")
        .select("id_organizacao")
        .eq("email", user.email)
        .single()

      if (!usuarioSistema?.id_organizacao) return
      setIdOrganizacao(usuarioSistema.id_organizacao)

      const { data: categoriasData } = await supabase
        .from("categorias")
        .select("id, nome, cor")
        .eq("id_organizacao", usuarioSistema.id_organizacao)
        .eq("ativo", true)
        .order("ordem", { ascending: true })

      const { data: gruposData } = await supabase
        .from("grupos")
        .select("id, nome, chat_id_whatsapp, id_categoria")
        .eq("id_organizacao", usuarioSistema.id_organizacao)
        .eq("ativo", true)
        .order("nome", { ascending: true })

      const { data: gruposCategorias } = await supabase
        .from("grupos_categorias")
        .select("id_grupo, id_categoria")

      const gruposComCategorias = (gruposData || []).map(grupo => {
        const cats = gruposCategorias
          ?.filter(gc => gc.id_grupo === grupo.id)
          .map(gc => gc.id_categoria) || []
        return { ...grupo, categorias: cats.length > 0 ? cats : (grupo.id_categoria ? [grupo.id_categoria] : []) }
      })

      const contagemPorCategoria: Record<number, number> = {}
      gruposComCategorias.forEach(grupo => {
        grupo.categorias.forEach(catId => {
          contagemPorCategoria[catId] = (contagemPorCategoria[catId] || 0) + 1
        })
      })

      const categoriasComContagem = (categoriasData || []).map(cat => ({
        ...cat,
        _count: { grupos: contagemPorCategoria[cat.id] || 0 }
      }))

      setCategorias(categoriasComContagem)
      setGrupos(gruposComCategorias)

      let configsData: any[] | null = null

      try {
        const result = await supabase
          .from("config_transcricao")
          .select("id, id_organizacao, id_categoria, id_grupo, modo, emoji_gatilho, dt_create, dt_update, tipo_transcricao")
          .eq("id_organizacao", usuarioSistema.id_organizacao)

        configsData = result.data
      } catch (err: any) {
        if (err?.message?.includes('tipo_transcricao') || err?.message?.includes('schema cache')) {
          const resultFallback = await supabase
            .from("config_transcricao")
            .select("id, id_organizacao, id_categoria, id_grupo, modo, emoji_gatilho, dt_create, dt_update")
            .eq("id_organizacao", usuarioSistema.id_organizacao)

          configsData = resultFallback.data
        } else {
          throw err
        }
      }

      const configsCat: Record<number, ConfigTranscricao> = {}
      const configsGrp: Record<number, ConfigTranscricao> = {}

      configsData?.forEach(config => {
        const tipo = (config as any).tipo_transcricao
          ? (config.tipo_transcricao as TipoTranscricao)
          : TIPO_PADRAO

        const configCompleta: ConfigTranscricao = {
          ...config as any,
          tipo_transcricao: tipo
        }
        if (config.id_categoria) {
          configsCat[config.id_categoria] = configCompleta
        }
        if (config.id_grupo) {
          configsGrp[config.id_grupo] = configCompleta
        }
      })

      setConfigsPorCategoria(configsCat)
      setConfigsPorGrupo(configsGrp)

      if (configsData && configsData.length > 0) {
        const primeiraConfig = configsData[0]
        if (primeiraConfig?.emoji_gatilho) {
          setEmojiPadrao(primeiraConfig.emoji_gatilho)
          setNovoEmoji(primeiraConfig.emoji_gatilho)
        }
      }

    } catch (err) {
      console.error("Erro ao carregar dados:", err)
      toast.error("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Obter modo efetivo de um grupo
  const getModoEfetivo = (grupo: Grupo): ModoTranscricao => {
    if (configsPorGrupo[grupo.id]) {
      return configsPorGrupo[grupo.id].modo
    }
    for (const catId of (grupo.categorias || [])) {
      if (configsPorCategoria[catId]) {
        return configsPorCategoria[catId].modo
      }
    }
    return "desativado"
  }

  const getTipoEfetivo = (grupo: Grupo): TipoTranscricao => {
    if (configsPorGrupo[grupo.id]) {
      return configsPorGrupo[grupo.id].tipo_transcricao
    }
    for (const catId of (grupo.categorias || [])) {
      if (configsPorCategoria[catId]) {
        return configsPorCategoria[catId].tipo_transcricao
      }
    }
    return TIPO_PADRAO
  }

  // Filtrar grupos
  const filteredGrupos = useMemo(() => {
    return grupos.filter(g => {
      const matchesSearch = g.nome.toLowerCase().includes(searchFilter.toLowerCase())
      const matchesCategory = categoryFilter === "all" ||
        g.categorias?.includes(Number(categoryFilter)) ||
        g.id_categoria === Number(categoryFilter)
      const modo = getModoEfetivo(g)
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "enabled" && modo !== "desativado") ||
        (statusFilter === "disabled" && modo === "desativado")
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [grupos, searchFilter, categoryFilter, statusFilter, configsPorGrupo, configsPorCategoria])

  // Paginacao
  const totalPages = Math.ceil(filteredGrupos.length / ITEMS_PER_PAGE)
  const paginatedGrupos = filteredGrupos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchFilter, categoryFilter, statusFilter])

  // Salvar config de grupo
  const saveConfigGrupo = async (idGrupo: number, modo: ModoTranscricao, tipo: TipoTranscricao = TIPO_PADRAO) => {
    if (!idOrganizacao) return
    setSaving(true)

    try {
      const existingConfig = configsPorGrupo[idGrupo]

      if (modo === "desativado" && existingConfig?.id) {
        await supabase.from("config_transcricao").delete().eq("id", existingConfig.id)
        const newConfigs = { ...configsPorGrupo }
        delete newConfigs[idGrupo]
        setConfigsPorGrupo(newConfigs)
      } else if (existingConfig?.id) {
        await supabase.from("config_transcricao").update({
          modo,
          tipo_transcricao: tipo,
          emoji_gatilho: emojiPadrao,
          dt_update: new Date().toISOString()
        }).eq("id", existingConfig.id)

        setConfigsPorGrupo(prev => ({
          ...prev,
          [idGrupo]: { ...existingConfig, modo, tipo_transcricao: tipo }
        }))
      } else if (modo !== "desativado") {
        const { data } = await supabase.from("config_transcricao").insert({
          id_organizacao: idOrganizacao,
          id_grupo: idGrupo,
          modo,
          tipo_transcricao: tipo,
          emoji_gatilho: emojiPadrao
        }).select().single()

        if (data) {
          setConfigsPorGrupo(prev => ({
            ...prev,
            [idGrupo]: { ...data as ConfigTranscricao, tipo_transcricao: tipo }
          }))
        }
      }

      toast.success("Configuracao salva")
    } catch (err) {
      console.error("Erro ao salvar config:", err)
      toast.error("Erro ao salvar configuracao")
    } finally {
      setSaving(false)
    }
  }

  // Salvar config de categoria
  const saveConfigCategoria = async (idCategoria: number, modo: ModoTranscricao, tipo: TipoTranscricao = TIPO_PADRAO) => {
    if (!idOrganizacao) return
    setSaving(true)

    try {
      const existingConfig = configsPorCategoria[idCategoria]

      if (modo === "desativado" && existingConfig?.id) {
        await supabase.from("config_transcricao").delete().eq("id", existingConfig.id)
        const newConfigs = { ...configsPorCategoria }
        delete newConfigs[idCategoria]
        setConfigsPorCategoria(newConfigs)
      } else if (existingConfig?.id) {
        await supabase.from("config_transcricao").update({
          modo,
          tipo_transcricao: tipo,
          emoji_gatilho: emojiPadrao,
          dt_update: new Date().toISOString()
        }).eq("id", existingConfig.id)

        setConfigsPorCategoria(prev => ({
          ...prev,
          [idCategoria]: { ...existingConfig, modo, tipo_transcricao: tipo }
        }))
      } else if (modo !== "desativado") {
        const { data } = await supabase.from("config_transcricao").insert({
          id_organizacao: idOrganizacao,
          id_categoria: idCategoria,
          modo,
          tipo_transcricao: tipo,
          emoji_gatilho: emojiPadrao
        }).select().single()

        if (data) {
          setConfigsPorCategoria(prev => ({
            ...prev,
            [idCategoria]: { ...data as ConfigTranscricao, tipo_transcricao: tipo }
          }))
        }
      }

      toast.success("Configuracao salva")
    } catch (err) {
      console.error("Erro ao salvar config:", err)
      toast.error("Erro ao salvar configuracao")
    } finally {
      setSaving(false)
    }
  }

  // Salvar emoji padrao
  const salvarEmoji = async () => {
    if (!idOrganizacao) return
    setSaving(true)

    try {
      await supabase.from("config_transcricao").update({ emoji_gatilho: novoEmoji }).eq("id_organizacao", idOrganizacao)
      setEmojiPadrao(novoEmoji)
      setEmojiDialogOpen(false)
      toast.success("Emoji atualizado")
    } catch (err) {
      console.error("Erro ao salvar emoji:", err)
      toast.error("Erro ao salvar emoji")
    } finally {
      setSaving(false)
    }
  }

  // Toggle de status para grupo
  const toggleGrupoStatus = (grupo: Grupo) => {
    const modoAtual = getModoEfetivo(grupo)
    const tipoAtual = getTipoEfetivo(grupo)

    if (modoAtual === "desativado") {
      saveConfigGrupo(grupo.id, "automatico", tipoAtual)
    } else {
      saveConfigGrupo(grupo.id, "desativado", tipoAtual)
    }
  }

  // Toggle de status para categoria
  const toggleCategoriaStatus = (categoria: Categoria) => {
    const config = configsPorCategoria[categoria.id]
    const modoAtual = config?.modo || "desativado"
    const tipoAtual = config?.tipo_transcricao || TIPO_PADRAO

    if (modoAtual === "desativado") {
      saveConfigCategoria(categoria.id, "automatico", tipoAtual)
    } else {
      saveConfigCategoria(categoria.id, "desativado", tipoAtual)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configuracoes de Transcricao</h2>
          <p className="text-muted-foreground">Gerencie modos de transcricao, grupos e categorias</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Main Section */}
      <Card>
        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("grupos")}
            className={cn(
              "flex items-center gap-2 px-6 py-4 font-semibold transition-colors",
              activeTab === "grupos"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Por Grupo</span>
            <Badge variant="secondary" className={cn(activeTab === "grupos" ? "bg-primary/10 text-primary" : "")}>
              {grupos.length}
            </Badge>
          </button>
          <button
            onClick={() => setActiveTab("categorias")}
            className={cn(
              "flex items-center gap-2 px-6 py-4 font-semibold transition-colors",
              activeTab === "categorias"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Tags className="h-4 w-4" />
            <span>Por Categoria</span>
            <Badge variant="secondary" className={cn(activeTab === "categorias" ? "bg-primary/10 text-primary" : "")}>
              {categorias.length}
            </Badge>
          </button>
        </div>

        {/* Tab: Por Grupo */}
        {activeTab === "grupos" && (
          <div className="p-6">
            {/* Filters */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar grupos..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todas Categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {categorias.map(cat => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="enabled">Habilitados</SelectItem>
                  <SelectItem value="disabled">Desabilitados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Grupo</TableHead>
                    <TableHead className="font-semibold">Categoria</TableHead>
                    <TableHead className="font-semibold">Modo</TableHead>
                    <TableHead className="font-semibold">Resposta</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedGrupos.map(grupo => {
                    const modo = getModoEfetivo(grupo)
                    const tipo = getTipoEfetivo(grupo)
                    const categoria = categorias.find(c =>
                      grupo.categorias?.includes(c.id) || grupo.id_categoria === c.id
                    )

                    return (
                      <TableRow key={grupo.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                              <MessageSquare className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{grupo.nome}</p>
                              <p className="text-xs text-muted-foreground">ID: {grupo.chat_id_whatsapp?.slice(0, 15) || "-"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {categoria ? (
                            <Badge
                              variant="secondary"
                              style={{
                                backgroundColor: categoria.cor + "20",
                                color: categoria.cor,
                              }}
                            >
                              {categoria.nome}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={modo}
                            onValueChange={(v) => saveConfigGrupo(grupo.id, v as ModoTranscricao, tipo)}
                            disabled={saving}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="desativado">Desativado</SelectItem>
                              <SelectItem value="automatico">
                                <span className="flex items-center gap-1">
                                  <Wand2 className="h-3 w-3" /> Automatico
                                </span>
                              </SelectItem>
                              <SelectItem value="manual">
                                <span className="flex items-center gap-1">
                                  <Hand className="h-3 w-3" /> Manual
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={tipo}
                            onValueChange={(v) => saveConfigGrupo(grupo.id, modo, v as TipoTranscricao)}
                            disabled={saving || modo === "desativado"}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="simples">
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" /> Simples
                                </span>
                              </SelectItem>
                              <SelectItem value="com_resumo">
                                <span className="flex items-center gap-1">
                                  <Brain className="h-3 w-3" /> Com Resumo
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={modo !== "desativado"}
                            onCheckedChange={() => toggleGrupoStatus(grupo)}
                            disabled={saving}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                Mostrando {paginatedGrupos.length} de {filteredGrupos.length} grupos
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
          </div>
        )}

        {/* Tab: Por Categoria */}
        {activeTab === "categorias" && (
          <div className="p-6">
            <p className="text-muted-foreground text-sm mb-6">
              Configure transcricoes para todos os grupos de cada categoria de uma vez
            </p>

            <div className="space-y-4">
              {categorias.map(categoria => {
                const config = configsPorCategoria[categoria.id]
                const modo = config?.modo || "desativado"
                const tipo = config?.tipo_transcricao || TIPO_PADRAO

                return (
                  <div
                    key={categoria.id}
                    className="bg-muted/50 rounded-xl p-5 border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: categoria.cor }}
                        >
                          <Tags className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{categoria.nome}</h4>
                          <p className="text-muted-foreground text-sm">
                            {categoria._count?.grupos || 0} grupos nesta categoria
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 flex-wrap">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">Modo:</span>
                          <Select
                            value={modo}
                            onValueChange={(v) => saveConfigCategoria(categoria.id, v as ModoTranscricao, tipo)}
                            disabled={saving}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="desativado">Desativado</SelectItem>
                              <SelectItem value="automatico">Automatico</SelectItem>
                              <SelectItem value="manual">Manual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">Resposta:</span>
                          <Select
                            value={tipo}
                            onValueChange={(v) => saveConfigCategoria(categoria.id, modo, v as TipoTranscricao)}
                            disabled={saving || modo === "desativado"}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="simples">Simples</SelectItem>
                              <SelectItem value="com_resumo">Com Resumo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Switch
                          checked={modo !== "desativado"}
                          onCheckedChange={() => toggleCategoriaStatus(categoria)}
                          disabled={saving}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}

              {categorias.length === 0 && (
                <div className="text-center py-12">
                  <Tags className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-1">Nenhuma categoria</h3>
                  <p className="text-muted-foreground">Crie categorias para organizar seus grupos</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Info className="h-4 w-4" />
                Ao ativar a transcricao para uma categoria, todos os grupos dessa categoria herdam essas configuracoes.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        <p>Copyright &copy; 2025 Sincron Grupos</p>
      </footer>

      {/* Dialog para alterar emoji */}
      <Dialog open={emojiDialogOpen} onOpenChange={setEmojiDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar emoji de transcricao</DialogTitle>
            <DialogDescription>
              Digite ou cole o emoji que sera usado para solicitar transcricao manual de audios
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4 py-4">
            <Label htmlFor="emoji" className="text-right">
              Emoji
            </Label>
            <div className="flex items-center gap-3 flex-1">
              <Input
                id="emoji"
                value={novoEmoji}
                onChange={(e) => setNovoEmoji(e.target.value)}
                className="text-center text-2xl h-12 w-20"
                maxLength={4}
              />
              <span className="text-sm text-muted-foreground">
                Preview: {novoEmoji}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmojiDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarEmoji} disabled={saving || !novoEmoji}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
