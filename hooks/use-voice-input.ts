"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface UseVoiceInputOptions {
  language?: string
  onTranscript?: (text: string) => void
  onError?: (error: string) => void
}

interface UseVoiceInputReturn {
  isRecording: boolean
  isProcessing: boolean
  transcript: string
  duration: number
  error: string | null
  isSupported: boolean
  useWhisper: boolean
  audioBlob: Blob | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  reset: () => void
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const { language = "pt-BR", onTranscript, onError } = options

  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent)
  const hasWebSpeech = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  const useWhisper = isIOS || !hasWebSpeech
  const isSupported = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia

  const updateDuration = useCallback(() => {
    if (startTimeRef.current) {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }
  }, [])

  const transcribeWithWhisper = useCallback(async (blob: Blob): Promise<string> => {
    const formData = new FormData()
    formData.append("audio", blob, "recording.webm")
    formData.append("language", language.split("-")[0])

    const response = await fetch("/api/voice/transcribe", {
      method: "POST",
      body: formData
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Erro na transcrição")
    }

    const data = await response.json()
    return data.text
  }, [language])

  const startRecordingWithWebSpeech = useCallback(async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      throw new Error("Web Speech API não suportada")
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language

    let finalTranscript = ""

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " "
        } else {
          interim += result[0].transcript
        }
      }
      const fullText = (finalTranscript + interim).trim()
      setTranscript(fullText)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error !== "aborted") {
        const errorMsg = `Erro no reconhecimento: ${event.error}`
        setError(errorMsg)
        onError?.(errorMsg)
      }
    }

    recognition.onend = () => {
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (finalTranscript.trim()) {
        onTranscript?.(finalTranscript.trim())
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [language, onTranscript, onError])

  const startRecordingWithMediaRecorder = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true
      }
    })

    const mimeTypes = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4"
    ]

    let mimeType = "audio/webm"
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        mimeType = type
        break
      }
    }

    const mediaRecorder = new MediaRecorder(stream, { mimeType })
    audioChunksRef.current = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(track => track.stop())

      const blob = new Blob(audioChunksRef.current, { type: mimeType })
      setAudioBlob(blob)

      if (blob.size > 0) {
        setIsProcessing(true)
        try {
          const text = await transcribeWithWhisper(blob)
          setTranscript(text)
          onTranscript?.(text)
        } catch (err) {
          const message = err instanceof Error ? err.message : "Erro na transcrição"
          setError(message)
          onError?.(message)
        } finally {
          setIsProcessing(false)
        }
      }
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start(1000)
  }, [transcribeWithWhisper, onTranscript, onError])

  const startRecording = useCallback(async () => {
    if (isRecording || isProcessing) return

    setError(null)
    setTranscript("")
    setAudioBlob(null)
    setDuration(0)
    startTimeRef.current = Date.now()

    try {
      setIsRecording(true)

      if (useWhisper) {
        await startRecordingWithMediaRecorder()
      } else {
        await startRecordingWithWebSpeech()
      }

      timerRef.current = setInterval(updateDuration, 1000)
    } catch (err) {
      setIsRecording(false)
      const message = err instanceof Error ? err.message : "Erro ao iniciar gravação"
      setError(message)
      onError?.(message)
    }
  }, [isRecording, isProcessing, useWhisper, startRecordingWithMediaRecorder, startRecordingWithWebSpeech, updateDuration, onError])

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }

    setIsRecording(false)
  }, [])

  const reset = useCallback(() => {
    stopRecording()
    setTranscript("")
    setError(null)
    setDuration(0)
    setAudioBlob(null)
    setIsProcessing(false)
  }, [stopRecording])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (recognitionRef.current) recognitionRef.current.abort()
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  return {
    isRecording,
    isProcessing,
    transcript,
    duration,
    error,
    isSupported,
    useWhisper,
    audioBlob,
    startRecording,
    stopRecording,
    reset
  }
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any
  }
}
