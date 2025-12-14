import type {
  CriarInstanciaRequest,
  ConectarInstanciaRequest,
  UAZAPIResponse,
  UAZAPIStatusResponse,
  InstanciaStatusCompleto,
  WebhookConfig,
  WebhookResponse,
} from './types'

// Timeout padrão para requisições (10 segundos)
const DEFAULT_TIMEOUT = 10000

/**
 * Extrai o número de telefone do JID do WhatsApp
 * @param jid - JID no formato "5511999999999@s.whatsapp.net" ou "5511999999999:87@s.whatsapp.net" ou objeto
 * @returns Número de telefone ou null
 */
export function extractPhoneFromJID(jid: string | object | null | undefined): string | null {
  if (!jid) return null

  // Se for string, extrair número antes do @ (com ou sem :XX no meio)
  // Formatos: "5511999999999@s.whatsapp.net" ou "5511999999999:87@s.whatsapp.net"
  if (typeof jid === 'string') {
    const match = jid.match(/^(\d+)(?::\d+)?@/)
    return match ? match[1] : null
  }

  // Se for objeto, tentar extrair de propriedades comuns
  if (typeof jid === 'object') {
    const jidObj = jid as Record<string, unknown>
    if (jidObj.user && typeof jidObj.user === 'string') {
      return jidObj.user
    }
    if (jidObj._serialized && typeof jidObj._serialized === 'string') {
      const match = (jidObj._serialized as string).match(/^(\d+)(?::\d+)?@/)
      return match ? match[1] : null
    }
  }

  return null
}

/**
 * Formata número de telefone brasileiro
 * @param phone - Número no formato 5511999999999
 * @returns Número formatado +55 11 99999-9999
 */
export function formatPhoneNumber(phone: string | null): string | null {
  if (!phone) return null

  // Remove caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '')

  // Formato brasileiro: +55 XX XXXXX-XXXX
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    const ddd = cleaned.slice(2, 4)
    const part1 = cleaned.slice(4, 9)
    const part2 = cleaned.slice(9)
    return `+55 ${ddd} ${part1}-${part2}`
  }

  // Formato brasileiro sem 9: +55 XX XXXX-XXXX
  if (cleaned.length === 12 && cleaned.startsWith('55')) {
    const ddd = cleaned.slice(2, 4)
    const part1 = cleaned.slice(4, 8)
    const part2 = cleaned.slice(8)
    return `+55 ${ddd} ${part1}-${part2}`
  }

  // Outros formatos: adicionar + no início
  return `+${cleaned}`
}

/**
 * Cria uma Promise com timeout
 */
function fetchWithTimeout(url: string, options: RequestInit, timeout: number = DEFAULT_TIMEOUT): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: servidor não respondeu')), timeout)
    )
  ])
}

/**
 * Serviço para comunicação com a UAZAPI via rotas de API internas
 * Todas as chamadas são proxiadas pelo Next.js para evitar CORS
 */
export class UAZAPIService {
  private baseUrl = '/api/uazapi'

  /**
   * Cria uma nova instância WhatsApp
   */
  async criarInstancia(data: CriarInstanciaRequest): Promise<UAZAPIResponse> {
    const response = await fetchWithTimeout(`${this.baseUrl}/instances`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.error || `Erro HTTP: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Conecta uma instância e gera QR Code
   */
  async conectarInstancia(
    instanceToken: string,
    data: ConectarInstanciaRequest = {}
  ): Promise<UAZAPIResponse> {
    const response = await fetchWithTimeout(`${this.baseUrl}/instances/${instanceToken}/connect`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.error || `Erro HTTP: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Verifica o status de uma instância
   * Retorna dados já processados com número de telefone extraído
   */
  async obterStatus(instanceToken: string): Promise<UAZAPIStatusResponse> {
    const response = await fetchWithTimeout(`${this.baseUrl}/instances/${instanceToken}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.error || `Erro HTTP: ${response.status}`)
    }

    const data: UAZAPIStatusResponse = await response.json()

    // Extrair e adicionar dados processados
    const phoneNumber = extractPhoneFromJID(data.status?.jid) ||
                        extractPhoneFromJID(data.instance?.owner)
    const phoneFormatted = formatPhoneNumber(phoneNumber)

    // Adicionar dados extraídos à resposta
    data.phoneNumber = phoneNumber
    data.phoneFormatted = phoneFormatted
    data.extractedStatus = {
      connected: data.status?.connected ?? false,
      loggedIn: data.status?.loggedIn ?? false,
      phoneNumber,
      phoneFormatted,
      profileName: data.instance?.profileName || null,
      profilePicUrl: data.instance?.profilePicUrl || null,
      isBusiness: data.instance?.isBusiness ?? false,
      platform: data.instance?.plataform || null,
      lastDisconnect: data.instance?.lastDisconnect || null,
      lastDisconnectReason: data.instance?.lastDisconnectReason || null,
    }

    return data
  }

  /**
   * Desconecta uma instância
   */
  async desconectarInstancia(instanceToken: string): Promise<{ success: boolean }> {
    const response = await fetchWithTimeout(`${this.baseUrl}/instances/${instanceToken}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'disconnect' }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.error || `Erro HTTP: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Remove uma instância
   */
  async deletarInstancia(instanceToken: string): Promise<{ success: boolean }> {
    const response = await fetchWithTimeout(`${this.baseUrl}/instances/${instanceToken}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.error || `Erro HTTP: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Envia mensagem de texto
   */
  async enviarTexto(
    instanceToken: string,
    chatId: string,
    text: string
  ): Promise<{ success: boolean; messageId?: string }> {
    const response = await fetchWithTimeout(`${this.baseUrl}/instances/${instanceToken}/send/text`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatId, text }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.error || `Erro HTTP: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Envia imagem
   */
  async enviarImagem(
    instanceToken: string,
    chatId: string,
    imageUrl: string,
    caption?: string
  ): Promise<{ success: boolean; messageId?: string }> {
    const response = await fetchWithTimeout(`${this.baseUrl}/instances/${instanceToken}/send/image`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatId, imageUrl, caption }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.error || `Erro HTTP: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Envia video
   */
  async enviarVideo(
    instanceToken: string,
    chatId: string,
    videoUrl: string,
    caption?: string
  ): Promise<{ success: boolean; messageId?: string }> {
    const response = await fetchWithTimeout(`${this.baseUrl}/instances/${instanceToken}/send/video`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatId, videoUrl, caption }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.error || `Erro HTTP: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Envia audio
   */
  async enviarAudio(
    instanceToken: string,
    chatId: string,
    audioUrl: string
  ): Promise<{ success: boolean; messageId?: string }> {
    const response = await fetchWithTimeout(`${this.baseUrl}/instances/${instanceToken}/send/audio`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatId, audioUrl }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.error || `Erro HTTP: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Configura o webhook de uma instância
   * O URL do webhook é controlado pelo servidor (não vem do cliente) por segurança
   */
  async configurarWebhook(instanceToken: string): Promise<WebhookResponse> {
    const response = await fetchWithTimeout(`${this.baseUrl}/instances/${instanceToken}/webhook`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.error || `Erro ao configurar webhook: ${response.status}`)
    }

    return response.json()
  }
}

// Singleton do serviço
let serviceInstance: UAZAPIService | null = null

export function getUAZAPIService(): UAZAPIService {
  if (!serviceInstance) {
    serviceInstance = new UAZAPIService()
  }
  return serviceInstance
}
