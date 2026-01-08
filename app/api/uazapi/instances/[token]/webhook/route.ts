import { NextRequest, NextResponse } from 'next/server'
import https from 'https'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = process.env.UAZAPI_BASE_URL || 'https://api.uazapi.com'
const WEBHOOK_URL = process.env.WEBHOOK_N8N_URL

// Agent para ignorar problemas de SSL em desenvolvimento
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

/**
 * POST - Configura o webhook de uma instância
 * O URL do webhook vem da variável de ambiente por segurança
 * (não permite que o cliente defina um URL arbitrário)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: 'Token da instância não fornecido' },
        { status: 400 }
      )
    }

    if (!WEBHOOK_URL) {
      console.error('WEBHOOK_N8N_URL not configured')
      return NextResponse.json(
        { error: 'WEBHOOK_N8N_URL não configurado no servidor' },
        { status: 500 }
      )
    }

    // Configuração de segurança do webhook:
    // - URL vem da ENV (não do cliente)
    // - excludeMessages previne loops infinitos
    // - addUrlEvents organiza eventos em endpoints separados
    const webhookConfig = {
      enabled: true,
      url: WEBHOOK_URL,
      events: ['messages', 'connection', 'groups'],
      excludeMessages: ['wasSentByApi'],
      addUrlEvents: true
    }

    console.log(`Configurando webhook para instância ${token}:`, {
      url: WEBHOOK_URL,
      events: webhookConfig.events
    })

    const response = await fetch(`${BASE_URL}/webhook`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'token': token,
      },
      body: JSON.stringify(webhookConfig),
      // @ts-expect-error Node.js https agent not typed in fetch
      agent: httpsAgent,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('UAZAPI Webhook Error:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro ao configurar webhook: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Webhook configurado com sucesso:', data)

    // Atualizar webhook_url no banco de dados
    try {
      const supabase = await createClient()
      const { error: dbError } = await supabase
        .from('instancias_whatsapp')
        .update({
          webhook_url: WEBHOOK_URL,
          dt_update: new Date().toISOString()
        })
        .eq('api_key', token)

      if (dbError) {
        console.error('Erro ao salvar webhook_url no banco:', dbError)
      } else {
        console.log('webhook_url salvo no banco para token:', token)
      }
    } catch (dbErr) {
      console.error('Erro ao atualizar banco:', dbErr)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Webhook configuration error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET - Obtém a configuração atual do webhook
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: 'Token da instância não fornecido' },
        { status: 400 }
      )
    }

    const response = await fetch(`${BASE_URL}/webhook`, {
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
      console.error('UAZAPI Webhook GET Error:', response.status, errorText)
      return NextResponse.json(
        { error: `Erro ao obter webhook: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Webhook get error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
