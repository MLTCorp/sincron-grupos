"use client"

import { useState, useCallback } from "react"

interface UseScreenshotReturn {
  screenshot: string | null
  isCapturing: boolean
  error: string | null
  capture: () => Promise<string | null>
  clear: () => void
}

export function useScreenshot(): UseScreenshotReturn {
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const capture = useCallback(async (): Promise<string | null> => {
    if (typeof window === "undefined") return null

    setIsCapturing(true)
    setError(null)

    try {
      const html2canvas = (await import("html2canvas")).default

      const targetElement = document.getElementById("app-main") || document.body

      const canvas = await html2canvas(targetElement, {
        scale: Math.min(window.devicePixelRatio, 2),
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        ignoreElements: (element) => {
          return element.classList.contains("feedback-ignore")
        }
      })

      const dataUrl = canvas.toDataURL("image/png", 0.85)
      setScreenshot(dataUrl)
      return dataUrl
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao capturar tela"
      setError(message)
      console.error("Screenshot error:", err)
      return null
    } finally {
      setIsCapturing(false)
    }
  }, [])

  const clear = useCallback(() => {
    setScreenshot(null)
    setError(null)
  }, [])

  return {
    screenshot,
    isCapturing,
    error,
    capture,
    clear
  }
}
