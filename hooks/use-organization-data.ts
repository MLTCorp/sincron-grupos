"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/supabase"

// Types
export type Instancia = Database["public"]["Tables"]["instancias_whatsapp"]["Row"] & {
  liveStatus?: {
    connected: boolean
    loggedIn: boolean
    phoneNumber?: string
    profileName?: string
    profilePicUrl?: string
    isBusiness?: boolean
    phoneFormatted?: string
  } | null
  isChecking?: boolean
}

export type Categoria = Database["public"]["Tables"]["categorias"]["Row"] & {
  _count?: {
    grupos: number
    gatilhos: number
    gatilhosAtivos: number
  }
  config_transcricao?: {
    id: number
    modo: string
    tipo_transcricao: string
    emoji_gatilho: string | null
  }[]
  hasTranscription?: boolean
}

export type Grupo = Database["public"]["Tables"]["grupos"]["Row"] & {
  categorias?: number[]
}

export type AgenteIA = Database["public"]["Tables"]["agentes_ia"]["Row"]

export type Gatilho = {
  id: number
  nome: string
  descricao: string | null
  tipo_evento: string
  tipo_acao: string
  ativo: boolean
  prioridade: number
  id_categoria: number | null
  id_grupo: number | null
  condicoes?: {
    operador: "AND" | "OR"
    regras: Array<{
      campo: string
      operador: string
      valor: string
    }>
  } | null
  config_acao?: Record<string, unknown> | null
}

interface UseOrganizationDataReturn {
  // Data
  instancias: Instancia[]
  categorias: Categoria[]
  grupos: Grupo[]
  agentes: AgenteIA[]
  gatilhos: Gatilho[]
  organizacaoId: number | null

  // Loading states
  loading: boolean
  loadingInstancias: boolean
  loadingCategorias: boolean
  loadingGrupos: boolean
  loadingAgentes: boolean
  loadingGatilhos: boolean

  // Actions
  refresh: () => Promise<void>
  refreshInstancias: () => Promise<void>
  refreshCategorias: () => Promise<void>
  refreshGrupos: () => Promise<void>
  refreshAgentes: () => Promise<void>
  refreshGatilhos: () => Promise<void>

  // Computed
  instanciaConectada: Instancia | null
  gruposPorCategoria: Record<number | "sem-categoria", Grupo[]>
}

export function useOrganizationData(): UseOrganizationDataReturn {
  const [organizacaoId, setOrganizacaoId] = useState<number | null>(null)
  const [instancias, setInstancias] = useState<Instancia[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [agentes, setAgentes] = useState<AgenteIA[]>([])
  const [gatilhos, setGatilhos] = useState<Gatilho[]>([])

  const [loading, setLoading] = useState(true)
  const [loadingInstancias, setLoadingInstancias] = useState(false)
  const [loadingCategorias, setLoadingCategorias] = useState(false)
  const [loadingGrupos, setLoadingGrupos] = useState(false)
  const [loadingAgentes, setLoadingAgentes] = useState(false)
  const [loadingGatilhos, setLoadingGatilhos] = useState(false)

  const supabase = useMemo(() => createClient(), [])

  // Obter organizacao do usuario
  const getOrganizacaoId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return null

    const { data: usuarioSistema } = await supabase
      .from("usuarios_sistema")
      .select("id_organizacao")
      .eq("email", user.email)
      .single()

    return usuarioSistema?.id_organizacao || null
  }, [supabase])

  // Carregar instancias
  const refreshInstancias = useCallback(async () => {
    if (!organizacaoId) return
    setLoadingInstancias(true)
    try {
      const { data } = await supabase
        .from("instancias_whatsapp")
        .select("*")
        .eq("id_organizacao", organizacaoId)
        .order("dt_create", { ascending: false })

      setInstancias(data?.map(i => ({ ...i, isChecking: false })) || [])
    } finally {
      setLoadingInstancias(false)
    }
  }, [supabase, organizacaoId])

  // Carregar categorias com config
  const refreshCategorias = useCallback(async () => {
    if (!organizacaoId) return
    setLoadingCategorias(true)
    try {
      const { data } = await supabase
        .from("categorias")
        .select(`
          *,
          config_transcricao!config_transcricao_id_categoria_fkey (
            id, modo, tipo_transcricao, emoji_gatilho
          ),
          gatilhos!gatilhos_id_categoria_fkey (id, ativo)
        `)
        .eq("id_organizacao", organizacaoId)
        .is("config_transcricao.id_grupo", null)
        .order("ordem", { ascending: true })

      // Buscar contagem de grupos
      const { data: gruposData } = await supabase
        .from("grupos")
        .select("id_categoria")
        .eq("id_organizacao", organizacaoId)

      const contagem: Record<number, number> = {}
      gruposData?.forEach((g) => {
        if (g.id_categoria) {
          contagem[g.id_categoria] = (contagem[g.id_categoria] || 0) + 1
        }
      })

      const categoriasEnriquecidas = data?.map((cat: any) => ({
        ...cat,
        _count: {
          grupos: contagem[cat.id] || 0,
          gatilhos: cat.gatilhos?.length || 0,
          gatilhosAtivos: cat.gatilhos?.filter((g: any) => g.ativo).length || 0
        },
        hasTranscription: cat.config_transcricao?.[0]?.modo !== 'desativado' && !!cat.config_transcricao?.[0]
      })) || []

      setCategorias(categoriasEnriquecidas)
    } finally {
      setLoadingCategorias(false)
    }
  }, [supabase, organizacaoId])

  // Carregar grupos com categorias N:N
  const refreshGrupos = useCallback(async () => {
    if (!organizacaoId) return
    setLoadingGrupos(true)
    try {
      const { data: gruposData } = await supabase
        .from("grupos")
        .select("*")
        .eq("id_organizacao", organizacaoId)
        .order("nome", { ascending: true })

      // Buscar relacoes N:N
      const { data: gruposCategorias } = await supabase
        .from("grupos_categorias")
        .select("id_grupo, id_categoria")

      const categoriasPorGrupo: Record<number, number[]> = {}
      gruposCategorias?.forEach(gc => {
        if (!categoriasPorGrupo[gc.id_grupo]) {
          categoriasPorGrupo[gc.id_grupo] = []
        }
        categoriasPorGrupo[gc.id_grupo].push(gc.id_categoria)
      })

      const gruposComCategorias = gruposData?.map(g => ({
        ...g,
        categorias: categoriasPorGrupo[g.id] || (g.id_categoria ? [g.id_categoria] : [])
      })) || []

      setGrupos(gruposComCategorias)
    } finally {
      setLoadingGrupos(false)
    }
  }, [supabase, organizacaoId])

  // Carregar agentes IA
  const refreshAgentes = useCallback(async () => {
    if (!organizacaoId) return
    setLoadingAgentes(true)
    try {
      const { data } = await supabase
        .from("agentes_ia")
        .select("*")
        .eq("id_organizacao", organizacaoId)
        .order("nome", { ascending: true })

      setAgentes(data || [])
    } finally {
      setLoadingAgentes(false)
    }
  }, [supabase, organizacaoId])

  // Carregar gatilhos
  const refreshGatilhos = useCallback(async () => {
    if (!organizacaoId) return
    setLoadingGatilhos(true)
    try {
      const { data } = await supabase
        .from("gatilhos")
        .select("id, nome, descricao, tipo_evento, tipo_acao, ativo, prioridade, id_categoria, id_grupo, condicoes, config_acao")
        .eq("id_organizacao", organizacaoId)
        .order("prioridade", { ascending: true })

      setGatilhos((data || []).map(g => ({
        ...g,
        condicoes: g.condicoes as Gatilho["condicoes"],
        config_acao: g.config_acao as Gatilho["config_acao"]
      })))
    } finally {
      setLoadingGatilhos(false)
    }
  }, [supabase, organizacaoId])

  // Refresh all
  const refresh = useCallback(async () => {
    await Promise.all([
      refreshInstancias(),
      refreshCategorias(),
      refreshGrupos(),
      refreshAgentes(),
      refreshGatilhos()
    ])
  }, [refreshInstancias, refreshCategorias, refreshGrupos, refreshAgentes, refreshGatilhos])

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const orgId = await getOrganizacaoId()
      setOrganizacaoId(orgId)
      setLoading(false)
    }
    init()
  }, [getOrganizacaoId])

  // Load data when organizacaoId is set
  useEffect(() => {
    if (organizacaoId) {
      refresh()
    }
  }, [organizacaoId, refresh])

  // Computed: instancia conectada
  const instanciaConectada = useMemo(() => {
    return instancias.find(i => i.status === "conectado") || null
  }, [instancias])

  // Computed: grupos por categoria
  const gruposPorCategoria = useMemo(() => {
    const grouped: Record<number | "sem-categoria", Grupo[]> = {
      "sem-categoria": []
    }

    categorias.forEach(cat => {
      grouped[cat.id] = []
    })

    grupos.forEach(grupo => {
      const cats = grupo.categorias || (grupo.id_categoria ? [grupo.id_categoria] : [])
      if (cats.length === 0) {
        grouped["sem-categoria"].push(grupo)
      } else {
        cats.forEach(catId => {
          if (grouped[catId]) {
            grouped[catId].push(grupo)
          }
        })
      }
    })

    return grouped
  }, [grupos, categorias])

  return {
    instancias,
    categorias,
    grupos,
    agentes,
    gatilhos,
    organizacaoId,
    loading,
    loadingInstancias,
    loadingCategorias,
    loadingGrupos,
    loadingAgentes,
    loadingGatilhos,
    refresh,
    refreshInstancias,
    refreshCategorias,
    refreshGrupos,
    refreshAgentes,
    refreshGatilhos,
    instanciaConectada,
    gruposPorCategoria
  }
}
