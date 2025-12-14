import { NextRequest, NextResponse } from 'next/server'
import https from 'https'

const BASE_URL = process.env.UAZAPI_BASE_URL || 'https://api.uazapi.com'

// Agent para ignorar problemas de SSL em desenvolvimento
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

// POST - Desconectar instância
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()

    if (body.action === 'disconnect') {
      const response = await fetch(`${BASE_URL}/instance/disconnect`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': token,
        },
        // @ts-expect-error Node.js https agent not typed in fetch
        agent: httpsAgent,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Disconnect API Error:', response.status, errorText)
        return NextResponse.json(
          { error: `Erro ao desconectar: ${response.status}` },
          { status: response.status }
        )
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Ação não reconhecida' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Disconnect error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover instância
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const ADMIN_TOKEN = process.env.UAZAPI_API_KEY

    if (!ADMIN_TOKEN) {
      return NextResponse.json(
        { error: 'UAZAPI_API_KEY não configurado' },
        { status: 500 }
      )
    }

    const response = await fetch(`${BASE_URL}/instance/delete`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'admintoken': ADMIN_TOKEN,
        'token': token,
      },
      // @ts-expect-error Node.js https agent not typed in fetch
      agent: httpsAgent,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Delete API Error:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro ao deletar: ${response.status}` },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
