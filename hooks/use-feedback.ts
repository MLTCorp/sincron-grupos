"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { getErrorSummary, clearLogs } from "@/lib/error-tracker"

interface FeedbackData {
  tipo: "bug" | "melhoria" | "sugestao" | "outro"
  texto: string
  screenshotDataUrl?: string | null
  audioBlob?: Blob | null
}

interface SubmitResult {
  success: boolean
  id?: string
  error?: string
}

interface UseFeedbackReturn {
  submit: (data: FeedbackData) => Promise<SubmitResult>
  isSubmitting: boolean
  error: string | null
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",")
  const mimeMatch = header.match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : "image/png"
  const binary = atob(base64)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i)
  }
  return new Blob([array], { type: mime })
}

export function useFeedback(): UseFeedbackReturn {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(async (data: FeedbackData): Promise<SubmitResult> => {
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !sessionData.session) {
        throw new Error("Usuário não autenticado")
      }

      const errorSummary = getErrorSummary()

      const metadata = {
        device: /Mobile|Android|iPhone/.test(navigator.userAgent) ? "mobile" : "desktop",
        browser: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString(),
        appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
        consoleLogs: errorSummary.logs,
        jsErrors: errorSummary.errors,
        breadcrumbs: errorSummary.breadcrumbs,
        hasErrors: errorSummary.hasErrors,
        hasWarnings: errorSummary.hasWarnings
      }

      const formData = new FormData()
      formData.append("tipo", data.tipo)
      formData.append("texto", data.texto)
      formData.append("pagina_atual", window.location.pathname)
      formData.append("metadata", JSON.stringify(metadata))

      if (data.screenshotDataUrl) {
        const screenshotBlob = dataUrlToBlob(data.screenshotDataUrl)
        formData.append("screenshot", screenshotBlob, "screenshot.png")
      }

      if (data.audioBlob) {
        const ext = data.audioBlob.type.includes("mp4") ? "mp4" : "webm"
        formData.append("audio", data.audioBlob, `audio.${ext}`)
      }

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`
        },
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao enviar feedback")
      }

      clearLogs()

      return { success: true, id: result.id }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao enviar feedback"
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return {
    submit,
    isSubmitting,
    error
  }
}
