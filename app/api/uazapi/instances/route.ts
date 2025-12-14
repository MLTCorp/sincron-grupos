import { NextRequest, NextResponse } from 'next/server'
import https from 'https'

const BASE_URL = process.env.UAZAPI_BASE_URL || 'https://api.uazapi.com'
const ADMIN_TOKEN = process.env.UAZAPI_API_KEY

// Agent para ignorar problemas de SSL em desenvolvimento
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

export async function POST(request: NextRequest) {
  try {
    if (!ADMIN_TOKEN) {
      console.error('UAZAPI_API_KEY not configured')
      return NextResponse.json(
        { error: 'UAZAPI_API_KEY não configurado' },
        { status: 500 }
      )
    }

    let body
    try {
      body = await request.json()
    } catch {
      console.error('Failed to parse request body')
      return NextResponse.json(
        { error: 'JSON inválido no corpo da requisição' },
        { status: 400 }
      )
    }

    const response = await fetch(`${BASE_URL}/instance/init`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'admintoken': ADMIN_TOKEN,
      },
      body: JSON.stringify(body),
      // @ts-expect-error Node.js https agent not typed in fetch
      agent: httpsAgent,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('UAZAPI Error:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro UAZAPI: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Instance creation error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
