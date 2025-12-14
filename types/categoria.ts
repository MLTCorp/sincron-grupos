export type ModoTranscricao = "desativado" | "automatico" | "manual"
export type TipoTranscricao = "simples" | "com_resumo"

export interface ConfigTranscricao {
  id?: number
  modo: ModoTranscricao
  tipo_transcricao: TipoTranscricao
  emoji_gatilho: string | null
}

export interface Gatilho {
  id: number
  ativo: boolean
  nome: string
  descricao: string | null
  tipo_evento: string
  tipo_acao: string
  config_acao: any
  prioridade: number
}

export interface Categoria {
  id: number
  id_organizacao: number
  nome: string
  cor: string
  descricao: string | null
  ordem: number
  dt_create: string
  dt_update: string
}

export interface CategoriaEnriquecida extends Categoria {
  config_transcricao?: ConfigTranscricao[]
  gatilhos?: Pick<Gatilho, 'id' | 'ativo'>[]
  _count: {
    grupos: number
    gatilhos: number
    gatilhosAtivos: number
  }
  hasTranscription: boolean
}
