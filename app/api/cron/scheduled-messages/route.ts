import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Criar cliente Supabase com service role para bypass de RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const UAZAPI_BASE_URL = process.env.UAZAPI_BASE_URL || "https://mltcorp.uazapi.com"

interface MensagemPendente {
  id: number
  id_organizacao: number
  grupos_ids: number[] | null
  tipo_mensagem: string
  conteudo_texto: string | null
  url_midia: string | null
  instance_token: string
}

interface Grupo {
  id: number
  nome: string
  chat_id_whatsapp: string
}

export async function GET(request: NextRequest) {
  // Verificar autorizacao (Vercel Cron envia header especial)
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  // Aceitar chamadas do Vercel Cron ou com secret correto
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Permitir se vier do Vercel Cron (header x-vercel-cron)
    const isVercelCron = request.headers.get("x-vercel-cron") === "1"
    if (!isVercelCron) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    // Buscar mensagens pendentes cujo horario de agendamento ja passou
    const { data: mensagens, error: fetchError } = await supabaseAdmin
      .from("mensagens_programadas")
      .select(`
        id,
        id_organizacao,
        grupos_ids,
        tipo_mensagem,
        conteudo_texto,
        url_midia
      `)
      .eq("status", "pendente")
      .not("dt_agendamento", "is", null)
      .lte("dt_agendamento", new Date().toISOString())
      .limit(10) // Processar em lotes

    if (fetchError) {
      console.error("Erro ao buscar mensagens:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!mensagens || mensagens.length === 0) {
      return NextResponse.json({ message: "Nenhuma mensagem pendente", processed: 0 })
    }

    const resultados: { id: number; status: string; error?: string }[] = []

    for (const mensagem of mensagens) {
      try {
        // Buscar instancia conectada da organizacao
        const { data: instancia } = await supabaseAdmin
          .from("instancias_whatsapp")
          .select("api_key")
          .eq("id_organizacao", mensagem.id_organizacao)
          .eq("status", "conectado")
          .single()

        if (!instancia?.api_key) {
          await supabaseAdmin
            .from("mensagens_programadas")
            .update({
              status: "erro",
              erro_mensagem: "Nenhuma instancia conectada",
              dt_enviado: new Date().toISOString(),
            })
            .eq("id", mensagem.id)

          resultados.push({ id: mensagem.id, status: "erro", error: "Sem instancia" })
          continue
        }

        // Buscar grupos
        const { data: grupos } = await supabaseAdmin
          .from("grupos")
          .select("id, nome, chat_id_whatsapp")
          .in("id", mensagem.grupos_ids || [])

        if (!grupos || grupos.length === 0) {
          await supabaseAdmin
            .from("mensagens_programadas")
            .update({
              status: "erro",
              erro_mensagem: "Nenhum grupo encontrado",
              dt_enviado: new Date().toISOString(),
            })
            .eq("id", mensagem.id)

          resultados.push({ id: mensagem.id, status: "erro", error: "Sem grupos" })
          continue
        }

        // Marcar como enviando
        await supabaseAdmin
          .from("mensagens_programadas")
          .update({ status: "enviando" })
          .eq("id", mensagem.id)

        // Enviar para cada grupo
        const erros: string[] = []
        for (const grupo of grupos as Grupo[]) {
          try {
            // Adicionar sufixo @g.us se nao existir
            let chatId = grupo.chat_id_whatsapp
            if (!chatId.includes("@")) {
              chatId = `${chatId}@g.us`
            }
            await enviarMensagem(
              instancia.api_key,
              chatId,
              mensagem as MensagemPendente
            )
            // Delay entre mensagens para evitar rate limit
            await new Promise((resolve) => setTimeout(resolve, 500))
          } catch (err) {
            erros.push(`${grupo.nome}: ${err instanceof Error ? err.message : "Erro"}`)
          }
        }

        // Atualizar status final
        await supabaseAdmin
          .from("mensagens_programadas")
          .update({
            status: erros.length === 0 ? "concluido" : "erro",
            dt_enviado: new Date().toISOString(),
            erro_mensagem: erros.length > 0 ? erros.join("; ") : null,
          })
          .eq("id", mensagem.id)

        resultados.push({
          id: mensagem.id,
          status: erros.length === 0 ? "enviado" : "erro_parcial",
          error: erros.length > 0 ? erros.join("; ") : undefined,
        })
      } catch (err) {
        console.error(`Erro processando mensagem ${mensagem.id}:`, err)

        await supabaseAdmin
          .from("mensagens_programadas")
          .update({
            status: "erro",
            erro_mensagem: err instanceof Error ? err.message : "Erro desconhecido",
          })
          .eq("id", mensagem.id)

        resultados.push({
          id: mensagem.id,
          status: "erro",
          error: err instanceof Error ? err.message : "Erro desconhecido",
        })
      }
    }

    return NextResponse.json({
      message: `Processadas ${resultados.length} mensagens`,
      processed: resultados.length,
      resultados,
    })
  } catch (error) {
    console.error("Erro no cron:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    )
  }
}

async function enviarMensagem(
  instanceToken: string,
  chatId: string,
  mensagem: MensagemPendente
): Promise<void> {
  let endpoint = ""
  const body: Record<string, unknown> = { number: chatId }

  switch (mensagem.tipo_mensagem) {
    case "texto":
      endpoint = `/send/text`
      body.text = mensagem.conteudo_texto
      break
    case "imagem":
      endpoint = `/send/image`
      body.url = mensagem.url_midia
      body.caption = mensagem.conteudo_texto || ""
      break
    case "video":
      endpoint = `/send/video`
      body.url = mensagem.url_midia
      body.caption = mensagem.conteudo_texto || ""
      break
    case "audio":
      endpoint = `/send/audio`
      body.url = mensagem.url_midia
      break
    default:
      throw new Error(`Tipo de mensagem desconhecido: ${mensagem.tipo_mensagem}`)
  }

  const response = await fetch(`${UAZAPI_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "token": instanceToken,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`UAZAPI error: ${response.status} - ${errorText}`)
  }
}
