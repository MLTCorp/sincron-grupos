"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Bold, Italic, Strikethrough, Code, Lightbulb, Image as ImageIcon, Video, AudioLines } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  parseWhatsAppFormatting,
  applyFormatToSelection,
  insertTextAtCursor,
  FORMATTING_OPTIONS,
  PERSONALIZATION_VARIABLES,
} from "@/lib/whatsapp-formatter"

interface WhatsAppEditorProps {
  type: "texto" | "imagem" | "video" | "audio"
  value: string
  onChange: (value: string) => void
  mediaUrl?: string
  sendMode: "now" | "schedule"
  scheduleDate?: string
  scheduleTime?: string
  className?: string
}

export function WhatsAppEditor({
  type,
  value,
  onChange,
  mediaUrl,
  sendMode,
  scheduleDate,
  scheduleTime,
  className,
}: WhatsAppEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every minute for "Enviar Agora" mode
  useEffect(() => {
    if (sendMode === "now") {
      const interval = setInterval(() => setCurrentTime(new Date()), 60000)
      return () => clearInterval(interval)
    }
  }, [sendMode])

  // Format time for WhatsApp style
  const getDisplayTime = () => {
    if (sendMode === "schedule" && scheduleDate && scheduleTime) {
      const scheduled = new Date(`${scheduleDate}T${scheduleTime}`)
      const today = new Date()
      const isToday = scheduled.toDateString() === today.toDateString()

      if (isToday) {
        return scheduled.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      } else {
        return scheduled.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) +
               " " + scheduled.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      }
    }
    return currentTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  // Apply formatting
  const handleFormat = (formatChar: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { newText, newSelectionStart, newSelectionEnd } = applyFormatToSelection(textarea, formatChar)
    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newSelectionStart, newSelectionEnd)
    }, 0)
  }

  // Insert variable
  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { newText, newCursorPos } = insertTextAtCursor(textarea, variable)
    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    // Auto-resize
    e.target.style.height = "auto"
    e.target.style.height = Math.max(80, e.target.scrollHeight) + "px"
  }

  // Clear placeholder on focus
  const handleFocus = () => {
    if (value === "Escreva sua mensagem aqui...") {
      onChange("")
    }
  }

  // Restore placeholder on blur if empty
  const handleBlur = () => {
    if (value.trim() === "") {
      onChange("Escreva sua mensagem aqui...")
    }
  }

  const isPlaceholder = value === "Escreva sua mensagem aqui..."
  const formattedText = parseWhatsAppFormatting(value)

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* WhatsApp Header */}
      <CardHeader className="py-3 px-4 bg-[#075E54]">
        <CardTitle className="text-white text-sm font-normal">Preview</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {/* WhatsApp Chat Background */}
        <div
          className="min-h-[250px] p-4"
          style={{
            backgroundColor: "#E5DDD5",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8c4c0' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          {/* Message Bubble */}
          <div className="flex justify-end">
            <div
              className="relative max-w-[90%] min-w-[200px] rounded-lg shadow-sm"
              style={{ backgroundColor: "#DCF8C6" }}
            >
              {/* Media Preview (for image/video/audio) */}
              {type !== "texto" && (
                <MediaPreview type={type} mediaUrl={mediaUrl} />
              )}

              {/* Editable Text Area */}
              {type !== "audio" && (
                <div className="relative px-2 pt-1.5 pb-5">
                  <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleInput}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={cn(
                      "w-full bg-transparent border-0 outline-none resize-none text-sm text-gray-800",
                      "placeholder:text-gray-500 min-h-[80px]",
                      isPlaceholder && "text-gray-500"
                    )}
                    style={{ lineHeight: "1.4" }}
                    maxLength={4096}
                  />

                  {/* Character count */}
                  <span className="absolute bottom-1 left-2 text-[10px] text-gray-400">
                    {value.length}/4096
                  </span>
                </div>
              )}

              {/* Audio message placeholder */}
              {type === "audio" && (
                <div className="px-2 py-3 text-sm text-gray-500 italic">
                  Audio nao suporta legenda
                </div>
              )}

              {/* Timestamp + Checkmarks */}
              <div className="absolute bottom-1 right-2 flex items-center gap-0.5">
                <span className="text-[10px] text-gray-500">{getDisplayTime()}</span>
                <div className="flex -space-x-1">
                  <Check className="h-3 w-3 text-blue-500" />
                  <Check className="h-3 w-3 text-blue-500" />
                </div>
              </div>

              {/* Bubble tail */}
              <div
                className="absolute -right-2 top-0 w-0 h-0"
                style={{
                  borderLeft: "8px solid #DCF8C6",
                  borderTop: "8px solid transparent",
                }}
              />
            </div>
          </div>
        </div>

        {/* Formatting Toolbar */}
        {type !== "audio" && (
          <div className="border-t bg-muted/30 p-3 space-y-3">
            {/* Format buttons */}
            <div className="flex items-center gap-1">
              {FORMATTING_OPTIONS.map(({ id, format, label, icon }) => {
                const IconComponent = icon === "Bold" ? Bold : icon === "Italic" ? Italic : icon === "Strikethrough" ? Strikethrough : Code
                return (
                  <Button
                    key={id}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleFormat(format)}
                    title={label}
                  >
                    <IconComponent className="h-4 w-4" />
                  </Button>
                )
              })}

              <div className="h-6 w-px bg-border mx-2" />

              {/* Personalization variables */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {PERSONALIZATION_VARIABLES.map(({ variable, description }) => (
                  <button
                    key={variable}
                    onClick={() => insertVariable(variable)}
                    className="px-2 py-1 rounded text-xs text-primary hover:bg-primary/10 transition-colors border bg-background"
                    title={description}
                  >
                    {variable}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MediaPreview({
  type,
  mediaUrl,
}: {
  type: "imagem" | "video" | "audio"
  mediaUrl?: string
}) {
  if (type === "audio") {
    return (
      <div className="p-3">
        <div className="flex items-center gap-3 bg-white/50 rounded-full px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <AudioLines className="h-5 w-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <div className="h-1 bg-gray-300 rounded-full">
              <div className="h-1 w-1/3 bg-green-600 rounded-full" />
            </div>
            <span className="text-xs text-gray-500 mt-1">0:00</span>
          </div>
        </div>
      </div>
    )
  }

  if (type === "imagem") {
    return (
      <div className="rounded-t-lg overflow-hidden">
        {mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaUrl}
            alt="Preview"
            className="w-full max-h-[200px] object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none"
              e.currentTarget.nextElementSibling?.classList.remove("hidden")
            }}
          />
        ) : null}
        <div
          className={cn(
            "w-full h-[120px] bg-gray-200 flex items-center justify-center",
            mediaUrl && "hidden"
          )}
        >
          <div className="text-center text-gray-400">
            <ImageIcon className="h-8 w-8 mx-auto mb-1" />
            <span className="text-xs">Imagem</span>
          </div>
        </div>
      </div>
    )
  }

  if (type === "video") {
    return (
      <div className="rounded-t-lg overflow-hidden relative">
        {mediaUrl ? (
          <video
            src={mediaUrl}
            className="w-full max-h-[200px] object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none"
              e.currentTarget.nextElementSibling?.classList.remove("hidden")
            }}
          />
        ) : null}
        <div
          className={cn(
            "w-full h-[120px] bg-gray-800 flex items-center justify-center relative",
            mediaUrl && "hidden"
          )}
        >
          <div className="text-center text-gray-400">
            <Video className="h-8 w-8 mx-auto mb-1" />
            <span className="text-xs">Video</span>
          </div>
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
              <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
