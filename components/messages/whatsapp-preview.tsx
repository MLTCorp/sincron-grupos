"use client"

import { parseWhatsAppFormatting } from "@/lib/whatsapp-formatter"
import { Check, Image as ImageIcon, Video, AudioLines } from "lucide-react"
import { cn } from "@/lib/utils"

interface WhatsAppPreviewProps {
  type: "texto" | "imagem" | "video" | "audio"
  text: string
  mediaUrl?: string
  caption?: string
  className?: string
}

export function WhatsAppPreview({
  type,
  text,
  mediaUrl,
  caption,
  className,
}: WhatsAppPreviewProps) {
  const displayText = type === "texto" ? text : caption || ""
  const formattedText = parseWhatsAppFormatting(displayText)
  const hasContent = displayText.trim().length > 0 || (type !== "texto" && mediaUrl)

  // Hora atual formatada
  const time = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className={cn("w-full", className)}>
      {/* WhatsApp Chat Container */}
      <div
        className="min-h-[300px] p-4 rounded-lg"
        style={{
          backgroundColor: "#E5DDD5",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8c4c0' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {/* Empty State */}
        {!hasContent && (
          <div className="flex items-center justify-center h-[268px] text-gray-500">
            <p className="text-sm text-center">
              Digite sua mensagem para ver o preview
            </p>
          </div>
        )}

        {/* Message Bubble */}
        {hasContent && (
          <div className="flex justify-end">
            <div
              className="relative max-w-[85%] rounded-lg shadow-sm"
              style={{ backgroundColor: "#DCF8C6" }}
            >
              {/* Media Preview */}
              {type !== "texto" && (
                <MediaPreview type={type} mediaUrl={mediaUrl} />
              )}

              {/* Text Content */}
              {displayText.trim().length > 0 && (
                <div className="px-2 pt-1.5 pb-4">
                  <div
                    className="text-sm text-gray-800 break-words whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formattedText }}
                  />
                </div>
              )}

              {/* Timestamp + Checkmarks */}
              <div className="absolute bottom-1 right-2 flex items-center gap-0.5">
                <span className="text-[10px] text-gray-500">{time}</span>
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
        )}
      </div>
    </div>
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
            "w-full h-[150px] bg-gray-200 flex items-center justify-center",
            mediaUrl && "hidden"
          )}
        >
          <div className="text-center text-gray-400">
            <ImageIcon className="h-10 w-10 mx-auto mb-2" />
            <span className="text-xs">Imagem</span>
          </div>
        </div>
      </div>
    )
  }

  if (type === "video") {
    return (
      <div className="rounded-t-lg overflow-hidden">
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
            "w-full h-[150px] bg-gray-800 flex items-center justify-center relative",
            mediaUrl && "hidden"
          )}
        >
          <div className="text-center text-gray-400">
            <Video className="h-10 w-10 mx-auto mb-2" />
            <span className="text-xs">Video</span>
          </div>
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
              <div className="w-0 h-0 border-l-[16px] border-l-white border-y-[10px] border-y-transparent ml-1" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
