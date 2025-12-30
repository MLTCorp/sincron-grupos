"use client"

import { useEffect } from "react"
import { initErrorTracker } from "@/lib/error-tracker"

interface ErrorTrackerProviderProps {
  children: React.ReactNode
}

export function ErrorTrackerProvider({ children }: ErrorTrackerProviderProps) {
  useEffect(() => {
    initErrorTracker()
  }, [])

  return <>{children}</>
}
