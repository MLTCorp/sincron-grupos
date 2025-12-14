"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AudioLines,
  Loader2,
  Settings2,
  Users,
  Tags,
  Check,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Zap,
  Circle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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

const MODOS: { value: ModoTranscricao; label: string; desc: string }[] = [
  { value: "desativado", label: "Desativado", desc: "Nenhuma transcricao" },
  { value: "automatico", label: "Automatico", desc: "Transcreve todos os audios" },
  { value: "manual", label: "Manual", desc: "Apenas com reacao" },
]

const TIPOS_TRANSCRICAO: { value: TipoTranscricao; label: string; desc: string }[] = [
  { value: "simples", label: "Simples", desc: "Apenas transcricao do audio" },
  { value: "com_resumo", label: "Com Resumo", desc: "Transcricao + resumo do conteudo" },
]

const EMOJI_PADRAO = "✍️"
const TIPO_PADRAO: TipoTranscricao = "simples"

export default function TranscriptionPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [configsPorCategoria, setConfigsPorCategoria] = useState<Record<number, ConfigTranscricao>>({})
  const [configsPorGrupo, setConfigsPorGrupo] = useState<Record<number, ConfigTranscricao>>({})
  const [selectedGroups, setSelectedGroups] = useState<Set<number>>(new Set())
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas")
  const [emojiPadrao, setEmojiPadrao] = useState(EMOJI_PADRAO)
  const [emojiDialogOpen, setEmojiDialogOpen] = useState(false)
  const [novoEmoji, setNovoEmoji] = useState(EMOJI_PADRAO)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [idOrganizacao, setIdOrganizacao] = useState<number | null>(null)

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

      // Carregar categorias com contagem de grupos
      const { data: categoriasData } = await supabase
        .from("categorias")
        .select("id, nome, cor")
        .eq("id_organizacao", usuarioSistema.id_organizacao)
        .eq("ativo", true)
        .order("ordem", { ascending: true })

      // Carregar grupos
      const { data: gruposData } = await supabase
        .from("grupos")
        .select("id, nome, chat_id_whatsapp, id_categoria")
        .eq("id_organizacao", usuarioSistema.id_organizacao)
        .eq("ativo", true)
        .order("nome", { ascending: true })

      // Carregar relacoes N:N grupos_categorias
      const { data: gruposCategorias } = await supabase
        .from("grupos_categorias")
        .select("id_grupo, id_categoria")

      // Mapear categorias para cada grupo
      const gruposComCategorias = (gruposData || []).map(grupo => {
        const cats = gruposCategorias
          ?.filter(gc => gc.id_grupo === grupo.id)
          .map(gc => gc.id_categoria) || []
        return { ...grupo, categorias: cats.length > 0 ? cats : (grupo.id_categoria ? [grupo.id_categoria] : []) }
      })

      // Contar grupos por categoria
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

      // Carregar configuracoes existentes
      // Tentar carregar com tipo_transcricao, se falhar usar sem o campo
      let configsData: any[] | null = null
      let configsError: any = null
      
      try {
        const result = await supabase
          .from("config_transcricao")
          .select("id, id_organizacao, id_categoria, id_grupo, modo, emoji_gatilho, dt_create, dt_update, tipo_transcricao")
          .eq("id_organizacao", usuarioSistema.id_organizacao)
        
        configsData = result.data
        configsError = result.error
      } catch (err: any) {
        // Se erro for por coluna nao encontrada, tentar sem tipo_transcricao
        if (err?.message?.includes('tipo_transcricao') || err?.message?.includes('schema cache')) {
          const resultFallback = await supabase
            .from("config_transcricao")
            .select("id, id_organizacao, id_categoria, id_grupo, modo, emoji_gatilho, dt_create, dt_update")
            .eq("id_organizacao", usuarioSistema.id_organizacao)
          
          configsData = resultFallback.data
          configsError = resultFallback.error
        } else {
          throw err
        }
      }

      const configsCat: Record<number, ConfigTranscricao> = {}
      const configsGrp: Record<number, ConfigTranscricao> = {}

      configsData?.forEach(config => {
        // Verificar se tipo_transcricao existe no objeto (pode nao existir se migration nao foi executada)
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

      setConfigsPorCategoria(configsCat)
      setConfigsPorGrupo(configsGrp)

      // Pegar emoji padrao da primeira config encontrada
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

  // Grupos filtrados por categoria
  const gruposFiltrados = useMemo(() => {
    if (filtroCategoria === "todas") return grupos
    if (filtroCategoria === "sem-categoria") {
      return grupos.filter(g => !g.categorias || g.categorias.length === 0)
    }
    const catId = parseInt(filtroCategoria)
    return grupos.filter(g => g.categorias?.includes(catId))
  }, [grupos, filtroCategoria])

  // Obter modo efetivo de um grupo (grupo > categoria > desativado)
  const getModoEfetivo = (grupo: Grupo): ModoTranscricao => {
    // Primeiro verifica config especifica do grupo
    if (configsPorGrupo[grupo.id]) {
      return configsPorGrupo[grupo.id].modo
    }
    // Depois verifica config da categoria
    for (const catId of (grupo.categorias || [])) {
      if (configsPorCategoria[catId]) {
        return configsPorCategoria[catId].modo
      }
    }
    return "desativado"
  }

  // Obter tipo de transcricao efetivo de um grupo (grupo > categoria > simples)
  const getTipoEfetivo = (grupo: Grupo): TipoTranscricao => {
    // Primeiro verifica config especifica do grupo
    if (configsPorGrupo[grupo.id]) {
      return configsPorGrupo[grupo.id].tipo_transcricao
    }
    // Depois verifica config da categoria
    for (const catId of (grupo.categorias || [])) {
      if (configsPorCategoria[catId]) {
        return configsPorCategoria[catId].tipo_transcricao
      }
    }
    return TIPO_PADRAO
  }

  // Salvar config de categoria
  const saveConfigCategoria = async (idCategoria: number, modo: ModoTranscricao, tipo: TipoTranscricao = TIPO_PADRAO) => {
    if (!idOrganizacao) return
    setSaving(true)

    try {
      const existingConfig = configsPorCategoria[idCategoria]

      if (modo === "desativado" && existingConfig?.id) {
        // Remover config se desativado
        const { error } = await supabase
          .from("config_transcricao")
          .delete()
          .eq("id", existingConfig.id)

        if (error) throw error

        const newConfigs = { ...configsPorCategoria }
        delete newConfigs[idCategoria]
        setConfigsPorCategoria(newConfigs)
      } else if (existingConfig?.id) {
        // Atualizar config existente
        const updateData: any = { 
          modo, 
          emoji_gatilho: emojiPadrao, 
          dt_update: new Date().toISOString() 
        }
        
        updateData.tipo_transcricao = tipo
        
        const { error } = await supabase
          .from("config_transcricao")
          .update(updateData)
          .eq("id", existingConfig.id)

        if (error) {
          // Se erro for por coluna nao encontrada, tentar sem tipo_transcricao
          if (error.message?.includes('tipo_transcricao') || error.message?.includes('schema cache')) {
            const { error: errorRetry } = await supabase
              .from("config_transcricao")
              .update({ 
                modo, 
                emoji_gatilho: emojiPadrao, 
                dt_update: new Date().toISOString() 
              })
              .eq("id", existingConfig.id)
            if (errorRetry) throw errorRetry
            toast.error("Execute a migration para habilitar tipo de transcricao. Veja migrations/add_tipo_transcricao.sql")
            return
          }
          throw error
        }

        setConfigsPorCategoria(prev => ({
          ...prev,
          [idCategoria]: { ...existingConfig, modo, tipo_transcricao: tipo }
        }))
      } else if (modo !== "desativado") {
        // Criar nova config
        const insertData: any = {
          id_organizacao: idOrganizacao,
          id_categoria: idCategoria,
          modo,
          emoji_gatilho: emojiPadrao,
          tipo_transcricao: tipo
        }
        
        const { data, error } = await supabase
          .from("config_transcricao")
          .insert(insertData)
          .select()
          .single()

        if (error) {
          // Se erro for por coluna nao encontrada, tentar sem tipo_transcricao
          if (error.message?.includes('tipo_transcricao') || error.message?.includes('schema cache')) {
            const { data: dataRetry, error: errorRetry } = await supabase
              .from("config_transcricao")
              .insert({
                id_organizacao: idOrganizacao,
                id_categoria: idCategoria,
                modo,
                emoji_gatilho: emojiPadrao
              })
              .select()
              .single()
            
            if (errorRetry) throw errorRetry
            if (dataRetry) {
              setConfigsPorCategoria(prev => ({
                ...prev,
                [idCategoria]: { ...dataRetry as ConfigTranscricao, tipo_transcricao: TIPO_PADRAO }
              }))
              toast.error("Execute a migration para habilitar tipo de transcricao. Veja migrations/add_tipo_transcricao.sql")
              return
            }
          }
          throw error
        }

        setConfigsPorCategoria(prev => ({
          ...prev,
          [idCategoria]: { ...data as ConfigTranscricao, tipo_transcricao: (data.tipo_transcricao as TipoTranscricao) || TIPO_PADRAO }
        }))
      }

      toast.success("Configuracao salva")
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : (err as { message?: string })?.message || "Erro desconhecido"
      console.error("Erro ao salvar config:", errorMsg)
      toast.error(`Erro: ${errorMsg}`)
    } finally {
      setSaving(false)
    }
  }

  // Salvar config de grupo
  const saveConfigGrupo = async (idGrupo: number, modo: ModoTranscricao, tipo: TipoTranscricao = TIPO_PADRAO) => {
    if (!idOrganizacao) return
    setSaving(true)

    try {
      const existingConfig = configsPorGrupo[idGrupo]

      if (modo === "desativado" && existingConfig?.id) {
        // Remover config se desativado (herda da categoria)
        const { error } = await supabase
          .from("config_transcricao")
          .delete()
          .eq("id", existingConfig.id)

        if (error) throw error

        const newConfigs = { ...configsPorGrupo }
        delete newConfigs[idGrupo]
        setConfigsPorGrupo(newConfigs)
      } else if (existingConfig?.id) {
        // Atualizar config existente
        const updateData: any = { 
          modo, 
          emoji_gatilho: emojiPadrao, 
          dt_update: new Date().toISOString() 
        }
        
        updateData.tipo_transcricao = tipo
        
        const { error } = await supabase
          .from("config_transcricao")
          .update(updateData)
          .eq("id", existingConfig.id)

        if (error) {
          if (error.message?.includes('tipo_transcricao') || error.message?.includes('schema cache')) {
            const { error: errorRetry } = await supabase
              .from("config_transcricao")
              .update({ 
                modo, 
                emoji_gatilho: emojiPadrao, 
                dt_update: new Date().toISOString() 
              })
              .eq("id", existingConfig.id)
            if (errorRetry) throw errorRetry
            toast.error("Execute a migration para habilitar tipo de transcricao. Veja migrations/add_tipo_transcricao.sql")
            return
          }
          throw error
        }

        setConfigsPorGrupo(prev => ({
          ...prev,
          [idGrupo]: { ...existingConfig, modo, tipo_transcricao: tipo }
        }))
      } else if (modo !== "desativado") {
        // Criar nova config
        const insertData: any = {
          id_organizacao: idOrganizacao,
          id_grupo: idGrupo,
          modo,
          emoji_gatilho: emojiPadrao,
          tipo_transcricao: tipo
        }
        
        const { data, error } = await supabase
          .from("config_transcricao")
          .insert(insertData)
          .select()
          .single()

        if (error) {
          if (error.message?.includes('tipo_transcricao') || error.message?.includes('schema cache')) {
            const { data: dataRetry, error: errorRetry } = await supabase
              .from("config_transcricao")
              .insert({
                id_organizacao: idOrganizacao,
                id_grupo: idGrupo,
                modo,
                emoji_gatilho: emojiPadrao
              })
              .select()
              .single()
            
            if (errorRetry) throw errorRetry
            if (dataRetry) {
              setConfigsPorGrupo(prev => ({
                ...prev,
                [idGrupo]: { ...dataRetry as ConfigTranscricao, tipo_transcricao: TIPO_PADRAO }
              }))
              toast.error("Execute a migration para habilitar tipo de transcricao. Veja migrations/add_tipo_transcricao.sql")
              return
            }
          }
          throw error
        }

        setConfigsPorGrupo(prev => ({
          ...prev,
          [idGrupo]: { ...data as ConfigTranscricao, tipo_transcricao: (data.tipo_transcricao as TipoTranscricao) || TIPO_PADRAO }
        }))
      }

      toast.success("Configuracao salva")
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : (err as { message?: string })?.message || "Erro desconhecido"
      console.error("Erro ao salvar config:", errorMsg)
      toast.error(`Erro: ${errorMsg}`)
    } finally {
      setSaving(false)
    }
  }

  // Aplicar em lote nos grupos selecionados
  const aplicarEmLote = async (modo: ModoTranscricao) => {
    if (selectedGroups.size === 0) {
      toast.error("Selecione pelo menos um grupo")
      return
    }
    if (!idOrganizacao) return

    setSaving(true)

    try {
      for (const idGrupo of selectedGroups) {
        const existingConfig = configsPorGrupo[idGrupo]
        const grupo = grupos.find(g => g.id === idGrupo)
        const tipoAtual = existingConfig?.tipo_transcricao || (grupo ? getTipoEfetivo(grupo) : TIPO_PADRAO)

        if (modo === "desativado" && existingConfig?.id) {
          const { error } = await supabase
            .from("config_transcricao")
            .delete()
            .eq("id", existingConfig.id)
          if (error) throw error
        } else if (existingConfig?.id) {
          const updateData: any = { 
            modo, 
            emoji_gatilho: emojiPadrao, 
            dt_update: new Date().toISOString() 
          }
          updateData.tipo_transcricao = tipoAtual
          
          const { error } = await supabase
            .from("config_transcricao")
            .update(updateData)
            .eq("id", existingConfig.id)
          
          if (error) {
            if (error.message?.includes('tipo_transcricao') || error.message?.includes('schema cache')) {
              const { error: errorRetry } = await supabase
                .from("config_transcricao")
                .update({ 
                  modo, 
                  emoji_gatilho: emojiPadrao, 
                  dt_update: new Date().toISOString() 
                })
                .eq("id", existingConfig.id)
              if (errorRetry) throw errorRetry
            } else {
              throw error
            }
          }
        } else if (modo !== "desativado") {
          const insertData: any = {
            id_organizacao: idOrganizacao,
            id_grupo: idGrupo,
            modo,
            emoji_gatilho: emojiPadrao,
            tipo_transcricao: tipoAtual
          }
          
          const { error } = await supabase
            .from("config_transcricao")
            .insert(insertData)
          
          if (error) {
            if (error.message?.includes('tipo_transcricao') || error.message?.includes('schema cache')) {
              const { error: errorRetry } = await supabase
                .from("config_transcricao")
                .insert({
                  id_organizacao: idOrganizacao,
                  id_grupo: idGrupo,
                  modo,
                  emoji_gatilho: emojiPadrao
                })
              if (errorRetry) throw errorRetry
            } else {
              throw error
            }
          }
        }
      }

      toast.success(`Configuracao aplicada em ${selectedGroups.size} grupo(s)`)
      setSelectedGroups(new Set())
      loadData()
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : (err as { message?: string })?.message || "Erro desconhecido"
      console.error("Erro ao aplicar em lote:", errorMsg)
      toast.error(`Erro: ${errorMsg}`)
    } finally {
      setSaving(false)
    }
  }

  // Salvar emoji padrao
  const salvarEmoji = async () => {
    if (!idOrganizacao) return
    setSaving(true)

    try {
      // Atualizar todas as configs existentes
      const { error } = await supabase
        .from("config_transcricao")
        .update({ emoji_gatilho: novoEmoji })
        .eq("id_organizacao", idOrganizacao)

      if (error) throw error

      setEmojiPadrao(novoEmoji)
      setEmojiDialogOpen(false)
      toast.success("Emoji atualizado")
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : (err as { message?: string })?.message || "Erro desconhecido"
      console.error("Erro ao salvar emoji:", errorMsg)
      toast.error(`Erro: ${errorMsg}`)
    } finally {
      setSaving(false)
    }
  }

  // Toggle selecao de grupo
  const toggleGroupSelection = (idGrupo: number) => {
    const newSelected = new Set(selectedGroups)
    if (newSelected.has(idGrupo)) {
      newSelected.delete(idGrupo)
    } else {
      newSelected.add(idGrupo)
    }
    setSelectedGroups(newSelected)
  }

  // Selecionar todos os grupos filtrados
  const selectAllFiltered = () => {
    if (selectedGroups.size === gruposFiltrados.length) {
      setSelectedGroups(new Set())
    } else {
      setSelectedGroups(new Set(gruposFiltrados.map(g => g.id)))
    }
  }

  // Toggle categoria expandida
  const toggleCategoryExpanded = (catId: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(catId)) {
      newExpanded.delete(catId)
    } else {
      newExpanded.add(catId)
    }
    setExpandedCategories(newExpanded)
  }

  // Obter badge de modo
  const getModoBadge = (modo: ModoTranscricao) => {
    switch (modo) {
      case "automatico":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Automatico</Badge>
      case "manual":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">Manual</Badge>
      default:
        return <Badge variant="outline" className="text-muted-foreground">Desativado</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Transcricao
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Configure transcricao de audios por categoria ou grupo
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="text-sm">
                <strong>Automatico:</strong> Todos os audios sao transcritos automaticamente.<br /><br />
                <strong>Manual:</strong> Reaja ao audio com {emojiPadrao} para transcrever.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Configuracao Global do Emoji - Compacto */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Settings2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm truncate">Emoji para manual:</span>
              <span className="text-xl">{emojiPadrao}</span>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 h-8 px-3 text-xs" onClick={() => setEmojiDialogOpen(true)}>
              Alterar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="categoria" className="space-y-3">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="categoria" className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Por Categoria
          </TabsTrigger>
          <TabsTrigger value="grupo" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Por Grupo
          </TabsTrigger>
        </TabsList>

        {/* Tab: Por Categoria - Layout Compacto */}
        <TabsContent value="categoria" className="space-y-4">
          {categorias.length > 0 ? (
            <Card>
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-base font-medium">Categorias</CardTitle>
                <CardDescription className="text-xs">
                  Grupos herdam a configuracao da categoria
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {categorias.map((categoria) => {
                    const config = configsPorCategoria[categoria.id]
                    const modoAtual = config?.modo || "desativado"
                    const tipoAtual = config?.tipo_transcricao || TIPO_PADRAO
                    const isExpanded = expandedCategories.has(categoria.id)
                    const gruposDaCategoria = grupos.filter(g => g.categorias?.includes(categoria.id))

                    return (
                      <div key={categoria.id}>
                        {/* Item da categoria - Compacto */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 hover:bg-muted/30 transition-colors">
                          {/* Lado esquerdo: Expand + Cor + Nome */}
                          <button
                            onClick={() => toggleCategoryExpanded(categoria.id)}
                            className="flex items-center gap-2 text-left flex-1 min-w-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <div
                              className="h-2.5 w-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: categoria.cor }}
                            />
                            <span className="font-medium text-sm truncate">{categoria.nome}</span>
                          </button>

                          {/* Lado direito: Contagem + Selects */}
                          <div className="flex items-center gap-2 sm:gap-3 pl-6 sm:pl-0 flex-wrap">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {categoria._count?.grupos || 0} grupos
                            </span>
                            <Select
                              value={modoAtual}
                              onValueChange={(val) => saveConfigCategoria(categoria.id, val as ModoTranscricao, tipoAtual)}
                              disabled={saving}
                            >
                              <SelectTrigger
                                className={cn(
                                  "w-[130px] sm:w-[150px] h-8 text-xs transition-all",
                                  modoAtual === "automatico" && "bg-green-500/10 border-green-500/50 text-green-600",
                                  modoAtual === "manual" && "bg-blue-500/10 border-blue-500/50 text-blue-600",
                                  modoAtual === "desativado" && "bg-muted text-muted-foreground"
                                )}
                              >
                                <SelectValue>
                                  <span className="flex items-center gap-1.5">
                                    {modoAtual === "automatico" && <Zap className="h-3.5 w-3.5" />}
                                    {modoAtual === "manual" && <span>{emojiPadrao}</span>}
                                    {modoAtual === "desativado" && <Circle className="h-3.5 w-3.5" />}
                                    {modoAtual === "automatico" ? "Automatico" : modoAtual === "manual" ? "Manual" : "Desativado"}
                                  </span>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="desativado">
                                  <span className="flex items-center gap-2">
                                    <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                                    Desativado
                                  </span>
                                </SelectItem>
                                <SelectItem value="automatico">
                                  <span className="flex items-center gap-2 text-green-600">
                                    <Zap className="h-3.5 w-3.5" />
                                    Automatico
                                  </span>
                                </SelectItem>
                                <SelectItem value="manual">
                                  <span className="flex items-center gap-2 text-blue-600">
                                    <span>{emojiPadrao}</span>
                                    Manual
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {modoAtual !== "desativado" && (
                              <Select
                                value={tipoAtual}
                                onValueChange={(val) => saveConfigCategoria(categoria.id, modoAtual, val as TipoTranscricao)}
                                disabled={saving}
                              >
                                <SelectTrigger className="w-[120px] sm:w-[140px] h-8 text-xs">
                                  <SelectValue>
                                    {tipoAtual === "com_resumo" ? "Com Resumo" : "Simples"}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="simples">
                                    Simples
                                  </SelectItem>
                                  <SelectItem value="com_resumo">
                                    Com Resumo
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>

                        {/* Grupos da categoria (expandido) - Compacto */}
                        {isExpanded && gruposDaCategoria.length > 0 && (
                          <div className="bg-muted/20 border-t">
                            {gruposDaCategoria.map((grupo, idx) => {
                              const modoGrupo = configsPorGrupo[grupo.id]?.modo
                              const tipoGrupo = configsPorGrupo[grupo.id]?.tipo_transcricao
                              const modoEfetivo = getModoEfetivo(grupo)
                              const tipoEfetivo = getTipoEfetivo(grupo)
                              const temConfigPropria = !!modoGrupo

                              return (
                                <div
                                  key={grupo.id}
                                  className={cn(
                                    "flex items-center justify-between py-2 px-4 pl-10 gap-2",
                                    idx !== gruposDaCategoria.length - 1 && "border-b border-border/50"
                                  )}
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className="text-xs text-muted-foreground">-</span>
                                    <span className="text-sm truncate">{grupo.nome}</span>
                                    {temConfigPropria && (
                                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                                        proprio
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {modoEfetivo !== "desativado" && (
                                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-5">
                                        {tipoGrupo ? (tipoGrupo === "com_resumo" ? "Resumo" : "Simples") : tipoEfetivo === "com_resumo" ? "Resumo" : "Simples"}
                                      </Badge>
                                    )}
                                    {getModoBadge(modoEfetivo)}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <div className="mx-auto w-fit p-3 rounded-xl bg-muted mb-3">
                <Tags className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-1">Nenhuma categoria</h3>
              <p className="text-muted-foreground text-xs">
                Crie categorias para organizar seus grupos
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Por Grupo - Compacto */}
        <TabsContent value="grupo" className="space-y-3">
          {/* Filtro e Acoes em Lote - Compacto */}
          <Card>
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Label className="text-xs whitespace-nowrap shrink-0">Categoria:</Label>
                  <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                    <SelectTrigger className="w-full sm:w-[180px] h-8 text-xs">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      <SelectItem value="sem-categoria">Sem categoria</SelectItem>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: cat.cor }}
                            />
                            {cat.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedGroups.size > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {selectedGroups.size} sel.
                    </span>
                    <Select onValueChange={(val) => aplicarEmLote(val as ModoTranscricao)}>
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue placeholder="Aplicar" />
                      </SelectTrigger>
                      <SelectContent>
                        {MODOS.map((modo) => (
                          <SelectItem key={modo.value} value={modo.value}>
                            {modo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lista de Grupos - Compacta */}
          {gruposFiltrados.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                {/* Header da lista */}
                <div className="flex items-center gap-2 sm:gap-3 px-3 py-2 border-b bg-muted/30">
                  <Checkbox
                    checked={selectedGroups.size === gruposFiltrados.length && gruposFiltrados.length > 0}
                    onCheckedChange={selectAllFiltered}
                    className="h-4 w-4"
                  />
                  <span className="text-xs font-medium flex-1">Grupo</span>
                  <span className="text-xs font-medium w-24 sm:w-28 text-center hidden sm:block shrink-0">Categoria</span>
                  <span className="text-xs font-medium w-[110px] sm:w-[130px] text-center shrink-0">Modo</span>
                  <span className="text-xs font-medium w-[100px] sm:w-[120px] text-center hidden md:block shrink-0">Tipo</span>
                </div>

                {/* Itens */}
                <div className="divide-y">
                  {gruposFiltrados.map((grupo) => {
                    const modoGrupo = configsPorGrupo[grupo.id]?.modo
                    const tipoGrupo = configsPorGrupo[grupo.id]?.tipo_transcricao
                    const modoEfetivo = getModoEfetivo(grupo)
                    const tipoEfetivo = getTipoEfetivo(grupo)
                    const categoriasDoGrupo = categorias.filter(c => grupo.categorias?.includes(c.id))

                    return (
                      <div
                        key={grupo.id}
                        className={cn(
                          "flex items-center gap-2 sm:gap-3 px-3 py-2 transition-colors overflow-hidden",
                          selectedGroups.has(grupo.id) && "bg-primary/5"
                        )}
                      >
                        <Checkbox
                          checked={selectedGroups.has(grupo.id)}
                          onCheckedChange={() => toggleGroupSelection(grupo.id)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm flex-1 truncate min-w-0">{grupo.nome}</span>
                        <div className="w-24 sm:w-28 hidden sm:flex justify-center shrink-0">
                          {categoriasDoGrupo.length > 0 ? (
                            <div className="flex flex-wrap gap-0.5 justify-center max-w-full">
                              {categoriasDoGrupo.slice(0, 1).map((cat) => (
                                <Badge
                                  key={cat.id}
                                  variant="outline"
                                  className="text-[9px] px-1 py-0 h-4 max-w-[90px] truncate"
                                  style={{ borderColor: cat.cor, color: cat.cor }}
                                >
                                  {cat.nome}
                                </Badge>
                              ))}
                              {categoriasDoGrupo.length > 1 && (
                                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                                  +{categoriasDoGrupo.length - 1}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                        <div className="w-[110px] sm:w-[130px] shrink-0">
                          <Select
                            value={modoGrupo || "herdar"}
                            onValueChange={(val) => {
                              if (val === "herdar") {
                                saveConfigGrupo(grupo.id, "desativado", tipoGrupo || tipoEfetivo)
                              } else {
                                saveConfigGrupo(grupo.id, val as ModoTranscricao, tipoGrupo || tipoEfetivo)
                              }
                            }}
                          >
                            <SelectTrigger
                              className={cn(
                                "h-7 text-xs transition-all",
                                modoGrupo === "automatico" && "bg-green-500/10 border-green-500/50 text-green-600",
                                modoGrupo === "manual" && "bg-blue-500/10 border-blue-500/50 text-blue-600",
                                !modoGrupo && "bg-muted/50 text-muted-foreground"
                              )}
                            >
                              <SelectValue>
                                <span className="flex items-center gap-1">
                                  {modoGrupo === "automatico" && <Zap className="h-3 w-3" />}
                                  {modoGrupo === "manual" && <span className="text-xs">{emojiPadrao}</span>}
                                  {!modoGrupo && <Circle className="h-3 w-3" />}
                                  <span className="truncate">
                                    {modoGrupo === "automatico"
                                      ? "Auto"
                                      : modoGrupo === "manual"
                                      ? "Manual"
                                      : `Herdar`}
                                  </span>
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="herdar">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                  <Circle className="h-3.5 w-3.5" />
                                  Herdar
                                </span>
                              </SelectItem>
                              <SelectItem value="automatico">
                                <span className="flex items-center gap-2 text-green-600">
                                  <Zap className="h-3.5 w-3.5" />
                                  Automatico
                                </span>
                              </SelectItem>
                              <SelectItem value="manual">
                                <span className="flex items-center gap-2 text-blue-600">
                                  <span>{emojiPadrao}</span>
                                  Manual
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-[100px] sm:w-[120px] hidden md:block shrink-0">
                          {modoEfetivo !== "desativado" && (
                            <Select
                              value={tipoGrupo || "herdar"}
                              onValueChange={(val) => {
                                if (val === "herdar" && modoGrupo) {
                                  // Se tem modo proprio, mantém modo mas remove tipo (herda)
                                  saveConfigGrupo(grupo.id, modoGrupo, tipoEfetivo)
                                } else if (val !== "herdar") {
                                  // Garante que tem modo configurado antes de salvar tipo
                                  const modoFinal = modoGrupo || modoEfetivo
                                  if (modoFinal !== "desativado") {
                                    saveConfigGrupo(grupo.id, modoFinal, val as TipoTranscricao)
                                  }
                                }
                              }}
                            >
                              <SelectTrigger className="h-7 text-xs w-full">
                                <SelectValue>
                                  <span className="truncate block">
                                    {tipoGrupo
                                      ? (tipoGrupo === "com_resumo" ? "Resumo" : "Simples")
                                      : `Herdar`
                                    }
                                  </span>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {!tipoGrupo && (
                                  <SelectItem value="herdar">
                                    Herdar ({tipoEfetivo === "com_resumo" ? "Resumo" : "Simples"})
                                  </SelectItem>
                                )}
                                <SelectItem value="simples">Simples</SelectItem>
                                <SelectItem value="com_resumo">Resumo</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          {modoEfetivo === "desativado" && (
                            <span className="text-xs text-muted-foreground text-center">-</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <div className="mx-auto w-fit p-3 rounded-xl bg-muted mb-3">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-1">Nenhum grupo</h3>
              <p className="text-muted-foreground text-xs">
                {filtroCategoria !== "todas"
                  ? "Nenhum grupo nesta categoria"
                  : "Adicione grupos para configurar"}
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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
