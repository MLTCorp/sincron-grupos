export type NotificationType = 'desconexao' | 'reconexao' | 'erro' | 'info'

export interface Notificacao {
  id: number
  id_organizacao: number
  id_usuario: number | null
  tipo: NotificationType
  titulo: string
  mensagem: string
  lida: boolean
  data_leitura: string | null
  metadata: {
    instanciaId?: number
    instanciaNome?: string
    numeroTelefone?: string | null
    [key: string]: any
  } | null
  dt_create: string
}

export interface NotificacaoInsert {
  id_organizacao: number
  id_usuario?: number | null
  tipo: NotificationType
  titulo: string
  mensagem: string
  metadata?: Record<string, any>
}
