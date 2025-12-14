import { NextRequest, NextResponse } from 'next/server'
import https from 'https'

const BASE_URL = process.env.UAZAPI_BASE_URL || 'https://api.uazapi.com'

// Agent para ignorar problemas de SSL em desenvolvimento
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

export interface WhatsAppGroup {
  id: string
  name: string
  picture?: string
  participants?: number
  description?: string
  owner?: string
  creation?: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Buscar chats que são grupos
    const response = await fetch(`${BASE_URL}/chat/find`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'token': token,
      },
      body: JSON.stringify({
        wa_isGroup: true,
        sort: '-wa_lastMsgTimestamp',
        limit: 100,
      }),
      // @ts-expect-error Node.js https agent not typed in fetch
      agent: httpsAgent,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groups API Error:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro ao buscar grupos: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Log para debug dos campos disponíveis
    if (data.chats?.[0]) {
      console.log('Sample group data fields:', Object.keys(data.chats[0]))
      console.log('Sample group full data:', JSON.stringify(data.chats[0], null, 2))
      // Log de todos os campos que podem conter o ID
      console.log('ID fields check:', {
        wa_chatId: data.chats[0].wa_chatId,
        id: data.chats[0].id,
        _id: data.chats[0]._id,
        wa_id: data.chats[0].wa_id,
        jid: data.chats[0].jid,
        wa_jid: data.chats[0].wa_jid,
      })
    }

    // Normalizar dados dos grupos
    const groups: WhatsAppGroup[] = (data.chats || data || []).map((chat: Record<string, unknown>) => {
      // Tentar múltiplos campos para participantes
      const participantsCount =
        chat.wa_groupParticipantsCount ||
        chat.participantsCount ||
        chat.wa_size ||
        chat.size ||
        (Array.isArray(chat.wa_participants) ? chat.wa_participants.length : 0) ||
        (Array.isArray(chat.participants) ? chat.participants.length : 0) ||
        0

      // O campo correto e wa_chatid (lowercase) conforme documentacao UAZAPI
      // Formato esperado: 120363153742561022@g.us
      // Extrair apenas a parte numerica (sem @g.us) para manter padrao do N8N
      let chatId = chat.wa_chatid || chat.wa_chatId || chat.id || chat._id
      if (typeof chatId === 'string' && chatId.includes('@')) {
        chatId = chatId.split('@')[0]
      }

      return {
        id: chatId,
        name: chat.wa_name || chat.name || 'Grupo sem nome',
        picture: chat.wa_profilePicUrl || chat.profilePicUrl || chat.wa_pic || null,
        participants: participantsCount as number,
        description: chat.wa_groupDescription || chat.description || null,
        owner: chat.wa_groupOwner || chat.owner || null,
        creation: chat.wa_groupCreation || chat.creation || null,
      }
    })

    return NextResponse.json({ groups, total: groups.length })
  } catch (error) {
    console.error('Groups fetch error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
