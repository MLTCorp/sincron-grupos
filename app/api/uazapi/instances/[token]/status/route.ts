import { NextRequest, NextResponse } from 'next/server'
import https from 'https'

const BASE_URL = process.env.UAZAPI_BASE_URL || 'https://api.uazapi.com'

// Agent para ignorar problemas de SSL em desenvolvimento
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

/**
 * Extrai o número de telefone do JID do WhatsApp
 * @param jid - JID no formato "5511999999999@s.whatsapp.net" ou objeto
 */
function extractPhoneFromJID(jid: string | object | null | undefined): string | null {
  if (!jid) return null

  if (typeof jid === 'string') {
    const match = jid.match(/^(\d+)@/)
    return match ? match[1] : null
  }

  if (typeof jid === 'object') {
    const jidObj = jid as Record<string, unknown>
    if (jidObj.user && typeof jidObj.user === 'string') {
      return jidObj.user
    }
    if (jidObj._serialized && typeof jidObj._serialized === 'string') {
      const match = (jidObj._serialized as string).match(/^(\d+)@/)
      return match ? match[1] : null
    }
  }

  return null
}

/**
 * Formata número de telefone brasileiro
 */
function formatPhoneNumber(phone: string | null): string | null {
  if (!phone) return null

  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    const ddd = cleaned.slice(2, 4)
    const part1 = cleaned.slice(4, 9)
    const part2 = cleaned.slice(9)
    return `+55 ${ddd} ${part1}-${part2}`
  }

  if (cleaned.length === 12 && cleaned.startsWith('55')) {
    const ddd = cleaned.slice(2, 4)
    const part1 = cleaned.slice(4, 8)
    const part2 = cleaned.slice(8)
    return `+55 ${ddd} ${part1}-${part2}`
  }

  return `+${cleaned}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const response = await fetch(`${BASE_URL}/instance/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'token': token,
      },
      // @ts-expect-error Node.js https agent not typed in fetch
      agent: httpsAgent,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Status API Error:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro ao obter status: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Extrair número do telefone do JID ou owner
    const phoneNumber = extractPhoneFromJID(data.status?.jid) ||
                        extractPhoneFromJID(data.instance?.owner)
    const phoneFormatted = formatPhoneNumber(phoneNumber)

    // Adicionar dados processados à resposta
    const enrichedData = {
      ...data,
      phoneNumber,
      phoneFormatted,
      extractedStatus: {
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
    }

    return NextResponse.json(enrichedData)
  } catch (error) {
    console.error('Status error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
