"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Bug,
  Lightbulb,
  MessageSquare,
  HelpCircle,
  Camera,
  Mic,
  MicOff,
  X,
  Loader2,
  Check,
  Quote,
  Send
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useVoiceInput } from "@/hooks/use-voice-input"
import { useFeedback } from "@/hooks/use-feedback"
import { toast } from "sonner"

type FeedbackType = "bug" | "melhoria" | "sugestao" | "outro"

interface FeedbackSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  screenshot: string | null
  onClearScreenshot: () => void
}

const feedbackTypes = [
  { value: "bug" as const, label: "Bug", icon: Bug, color: "text-red-500 bg-red-500/10 border-red-500/30 hover:bg-red-500/20" },
  { value: "melhoria" as const, label: "Melhoria", icon: Lightbulb, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20" },
  { value: "sugestao" as const, label: "Sugestão", icon: MessageSquare, color: "text-blue-500 bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20" },
  { value: "outro" as const, label: "Outro", icon: HelpCircle, color: "text-gray-500 bg-gray-500/10 border-gray-500/30 hover:bg-gray-500/20" },
]

export function FeedbackSheet({
  open,
  onOpenChange,
  screenshot,
  onClearScreenshot
}: FeedbackSheetProps) {
  const [tipo, setTipo] = useState<FeedbackType | null>(null)
  const [texto, setTexto] = useState("")

  const { submit, isSubmitting } = useFeedback()
  const voice = useVoiceInput({
    onTranscript: (text) => {
      setTexto((prev) => (prev ? `${prev} ${text}` : text))
    }
  })

  const canSubmit = tipo !== null && texto.length >= 10

  const handleSubmit = async () => {
    if (!canSubmit || !tipo) return

    const result = await submit({
      tipo,
      texto,
      screenshotDataUrl: screenshot,
      audioBlob: voice.audioBlob
    })

    if (result.success) {
      toast.success("Feedback enviado com sucesso!")
      handleReset()
      onOpenChange(false)
    } else {
      toast.error(result.error || "Erro ao enviar feedback")
    }
  }

  const handleReset = () => {
    setTipo(null)
    setTexto("")
    voice.reset()
    onClearScreenshot()
  }

  useEffect(() => {
    if (!open) {
      handleReset()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleVoiceToggle = () => {
    if (voice.isRecording) {
      voice.stopRecording()
    } else {
      voice.startRecording()
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md feedback-ignore"
      >
        <SheetHeader>
          <SheetTitle>Enviar Feedback</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Tipo de feedback */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Tipo de feedback
            </label>
            <div className="grid grid-cols-4 gap-2">
              {feedbackTypes.map((type) => {
                const Icon = type.icon
                const isSelected = tipo === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setTipo(type.value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all",
                      isSelected
                        ? type.color + " ring-2 ring-offset-2 ring-offset-background"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isSelected && type.color.split(" ")[0])} />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Texto */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Descreva o problema ou sugestão
            </label>
            <Textarea
              placeholder="Descreva o problema ou sugestão em detalhes..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {texto.length < 10
                ? `Mínimo 10 caracteres (${texto.length}/10)`
                : `${texto.length} caracteres`}
            </p>
          </div>

          {/* Anexos */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Anexos
            </label>
            <div className="flex gap-2">
              {/* Screenshot */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "flex-1",
                  screenshot && "border-green-500 text-green-500"
                )}
                disabled
              >
                {screenshot ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Screenshot anexado
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Sem screenshot
                  </>
                )}
              </Button>

              {/* Áudio */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "flex-1",
                  voice.isRecording && "border-red-500 text-red-500 animate-pulse",
                  voice.transcript && !voice.isRecording && "border-green-500 text-green-500"
                )}
                onClick={handleVoiceToggle}
                disabled={!voice.isSupported || voice.isProcessing}
              >
                {voice.isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Transcrevendo...
                  </>
                ) : voice.isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Parar ({voice.duration}s)
                  </>
                ) : voice.transcript ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Transcrito
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Gravar voz
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Preview do screenshot */}
          {screenshot && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Screenshot capturado
              </label>
              <div className="relative rounded-lg overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={screenshot}
                  alt="Screenshot capturado"
                  className="w-full h-32 object-cover object-top"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={onClearScreenshot}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Preview da transcrição */}
          {voice.transcript && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Transcrição do áudio
              </label>
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="flex gap-2">
                  <Quote className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-sm italic">{voice.transcript}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botão de envio */}
          <Button
            type="button"
            className="w-full"
            disabled={!canSubmit || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Feedback
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
