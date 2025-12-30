import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const tipo = formData.get("tipo") as string
    const texto = formData.get("texto") as string
    const pagina = formData.get("pagina_atual") as string
    const metadataStr = formData.get("metadata") as string || "{}"
    const screenshot = formData.get("screenshot") as File | null
    const audio = formData.get("audio") as File | null

    const validTypes = ["bug", "melhoria", "sugestao", "outro"]
    if (!validTypes.includes(tipo)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
    }

    if (!texto || texto.length < 10) {
      return NextResponse.json(
        { error: "Texto deve ter pelo menos 10 caracteres" },
        { status: 400 }
      )
    }

    let metadata = {}
    try {
      metadata = JSON.parse(metadataStr)
    } catch {
      metadata = {}
    }

    let screenshot_url: string | null = null
    if (screenshot && screenshot.size > 0) {
      const path = `${user.id}/screenshots/${Date.now()}.png`
      const buffer = await screenshot.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from("feedbacks")
        .upload(path, buffer, {
          contentType: "image/png",
          upsert: false
        })

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("feedbacks").getPublicUrl(path)
        screenshot_url = urlData.publicUrl
      } else {
        console.error("Screenshot upload error:", uploadError)
      }
    }

    let audio_url: string | null = null
    let transcricao_audio: string | null = null

    if (audio && audio.size > 0) {
      const ext = audio.type.includes("mp4") ? "mp4" : "webm"
      const path = `${user.id}/audios/${Date.now()}.${ext}`
      const buffer = await audio.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from("feedbacks")
        .upload(path, buffer, {
          contentType: audio.type,
          upsert: false
        })

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("feedbacks").getPublicUrl(path)
        audio_url = urlData.publicUrl

        if (process.env.OPENAI_API_KEY) {
          try {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

            const audioFile = new File([buffer], `audio.${ext}`, { type: audio.type })

            const transcription = await openai.audio.transcriptions.create({
              file: audioFile,
              model: "whisper-1",
              language: "pt"
            })

            transcricao_audio = transcription.text
          } catch (transcribeError) {
            console.error("Transcription error:", transcribeError)
          }
        }
      } else {
        console.error("Audio upload error:", uploadError)
      }
    }

    const { data, error } = await supabase
      .from("feedbacks")
      .insert({
        user_id: user.id,
        tipo,
        texto,
        screenshot_url,
        audio_url,
        transcricao_audio,
        pagina_atual: pagina,
        metadata,
        status: "novo"
      })
      .select("id")
      .single()

    if (error) {
      console.error("Database insert error:", error)
      return NextResponse.json({ error: "Erro ao salvar feedback" }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error("Feedback API error:", err)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
