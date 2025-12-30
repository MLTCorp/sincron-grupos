"use client"

import { useState } from "react"
import { MessageSquarePlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScreenshot } from "@/hooks/use-screenshot"
import { FeedbackSheet } from "./feedback-sheet"
import { cn } from "@/lib/utils"

export function FeedbackFab() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { screenshot, isCapturing, capture, clear } = useScreenshot()

  const handleClick = async () => {
    if (isCapturing) return

    const result = await capture()

    if (result) {
      setSheetOpen(true)
    } else {
      setSheetOpen(true)
    }
  }

  const handleClearScreenshot = () => {
    clear()
  }

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isCapturing}
        size="icon"
        className={cn(
          "feedback-ignore fixed z-50 h-12 w-12 rounded-full shadow-lg",
          "bg-yellow-500 hover:bg-yellow-600 text-black",
          "bottom-20 right-4 md:bottom-6 md:right-6",
          "transition-all duration-200",
          isCapturing && "opacity-50 cursor-wait"
        )}
      >
        {isCapturing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <MessageSquarePlus className="h-5 w-5" />
        )}
        <span className="sr-only">Enviar feedback</span>
      </Button>

      <FeedbackSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        screenshot={screenshot}
        onClearScreenshot={handleClearScreenshot}
      />
    </>
  )
}
