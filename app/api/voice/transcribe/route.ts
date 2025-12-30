import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key não configurada" },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const audio = formData.get("audio") as File
    const language = (formData.get("language") as string) || "pt"

    if (!audio) {
      return NextResponse.json(
        { error: "Arquivo de áudio obrigatório" },
        { status: 400 }
      )
    }

    const maxSize = 25 * 1024 * 1024
    if (audio.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande (máx 25MB)" },
        { status: 400 }
      )
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: "whisper-1",
      language,
      response_format: "json"
    })

    return NextResponse.json({
      text: transcription.text,
      language
    })
  } catch (err) {
    console.error("Transcription API error:", err)

    if (err instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `Erro da API OpenAI: ${err.message}` },
        { status: err.status || 500 }
      )
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
