// Tipos para integração com UAZAPI

export interface InstanciaWhatsApp {
  id: string
  token: string
  status: 'desconectado' | 'conectando' | 'conectado'
  paircode?: string
  qrcode?: string
  name: string
  profileName?: string
  profilePicUrl?: string
  isBusiness?: boolean
  plataform?: string
  systemName: string
  owner?: string
  lastDisconnect?: string
  lastDisconnectReason?: string
  adminField01?: string
  created: string
  updated: string
  delayMin?: number
  delayMax?: number
}

// Interface para status completo extraído da UAZAPI
export interface InstanciaStatusCompleto {
  connected: boolean
  loggedIn: boolean
  phoneNumber: string | null      // Extraído do JID (ex: 5511999999999)
  phoneFormatted: string | null   // Formatado (ex: +55 11 99999-9999)
  profileName: string | null      // Nome de exibição do WhatsApp
  profilePicUrl: string | null    // URL da foto do perfil
  isBusiness: boolean             // Se é WhatsApp Business
  platform: string | null         // android/ios/web
  lastDisconnect: string | null   // Timestamp do último disconnect
  lastDisconnectReason: string | null
}

export interface CriarInstanciaRequest {
  name: string
  systemName: string
  adminField01?: string
  adminField02?: string
}

export interface ConectarInstanciaRequest {
  phone?: string
}

export interface UAZAPIResponse {
  connected: boolean
  loggedIn: boolean
  jid: string | null | object
  instance: InstanciaWhatsApp
}

export interface UAZAPIStatusResponse {
  instance: InstanciaWhatsApp
  status: {
    connected: boolean
    loggedIn: boolean
    jid: string | object | null
  }
  // Dados processados/normalizados (adicionados pelo nosso backend)
  phoneNumber?: string | null
  phoneFormatted?: string | null
  extractedStatus?: InstanciaStatusCompleto
}

// Tipo para instância com estado de conexão
export interface InstanciaComConexao extends InstanciaWhatsApp {
  connected: boolean
  loggedIn: boolean
}

// Mapeamento de status UAZAPI para português
export const STATUS_LABELS: Record<string, string> = {
  disconnected: 'Desconectado',
  connecting: 'Conectando',
  connected: 'Conectado',
  desconectado: 'Desconectado',
  conectando: 'Conectando',
  conectado: 'Conectado',
}

export const STATUS_COLORS: Record<string, string> = {
  disconnected: 'secondary',
  connecting: 'outline',
  connected: 'default',
  desconectado: 'secondary',
  conectando: 'outline',
  conectado: 'default',
}

// Tipos para configuração de Webhook
export interface WebhookConfig {
  enabled: boolean
  url: string
  events: string[]
  excludeMessages?: string[]
  addUrlEvents?: boolean
  addUrlTypesMessages?: boolean
}

export interface WebhookResponse {
  enabled: boolean
  url: string
  events: string[]
  excludeMessages?: string[]
  addUrlEvents?: boolean
}

// Tipos para webhooks de conexão recebidos do N8N
export interface ConnectionWebhookPayload {
  event: 'connection'
  instance: string
  owner: string
  token: string
  BaseUrl: string
  status: {
    connected: boolean
    loggedIn: boolean
    jid: string | object | null
  }
}

export interface NotificationPayload {
  tipo: 'desconexao' | 'reconexao'
  instanciaId: number
  instanciaNome: string
  numeroTelefone: string | null
  organizacaoId: number
  timestamp: string
}
