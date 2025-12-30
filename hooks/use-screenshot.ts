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
      const html2canvasModule = await import("html2canvas")
      const html2canvas = html2canvasModule.default

      // Tentar encontrar o elemento principal ou usar body
      let targetElement: HTMLElement | null = document.getElementById("app-main")

      if (!targetElement) {
        targetElement = document.querySelector("main") as HTMLElement
      }

      if (!targetElement) {
        targetElement = document.body
      }

      console.log("Screenshot target:", targetElement.tagName, targetElement.id)

      const canvas = await html2canvas(targetElement, {
        scale: Math.min(window.devicePixelRatio, 2),
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: true, // Ativar logs para debug
        ignoreElements: (element) => {
          if (!(element instanceof HTMLElement)) return false
          return element.classList.contains("feedback-ignore")
        },
        onclone: (clonedDoc) => {
          // Garantir que elementos com posição fixa sejam capturados
          const feedbackElements = clonedDoc.querySelectorAll(".feedback-ignore")
          feedbackElements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.display = "none"
            }
          })
        }
      })

      // Usar JPEG para melhor compressão
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85)
      console.log("Screenshot captured, size:", dataUrl.length)

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
