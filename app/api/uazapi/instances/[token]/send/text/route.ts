import { NextRequest, NextResponse } from 'next/server'
import https from 'https'

const BASE_URL = process.env.UAZAPI_BASE_URL || 'https://mltcorp.uazapi.com'

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const { chatId, text } = body

    if (!chatId || !text) {
      return NextResponse.json(
        { error: 'chatId e text sao obrigatorios' },
        { status: 400 }
      )
    }

    const response = await fetch(`${BASE_URL}/send/text`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'token': token,
      },
      body: JSON.stringify({
        number: chatId,
        text: text,
      }),
      // @ts-expect-error Node.js https agent not typed in fetch
      agent: httpsAgent,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Send text API Error:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro ao enviar mensagem: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      messageId: data.messageId || data.id || null,
      data
    })
  } catch (error) {
    console.error('Send text error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
