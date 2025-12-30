"use client"

interface LogEntry {
  level: 'log' | 'warn' | 'error'
  message: string
  timestamp: string
  stack?: string
}

interface ErrorEntry {
  message: string
  source?: string
  lineno?: number
  colno?: number
  stack?: string
  timestamp: string
  type: 'error' | 'unhandledrejection'
}

interface BreadcrumbEntry {
  type: 'click' | 'navigation' | 'input'
  target: string
  text?: string
  url?: string
  timestamp: string
}

export interface ErrorSummary {
  logs: LogEntry[]
  errors: ErrorEntry[]
  breadcrumbs: BreadcrumbEntry[]
  hasErrors: boolean
  hasWarnings: boolean
}

const MAX_LOGS = 50
const MAX_ERRORS = 20
const MAX_BREADCRUMBS = 30

let logs: LogEntry[] = []
let errors: ErrorEntry[] = []
let breadcrumbs: BreadcrumbEntry[] = []
let initialized = false

let originalWarn: typeof console.warn | null = null
let originalError: typeof console.error | null = null

function getTimestamp(): string {
  return new Date().toISOString()
}

function truncateMessage(message: string, maxLength = 500): string {
  if (message.length <= maxLength) return message
  return message.slice(0, maxLength) + '...'
}

function getCSSSelector(element: Element): string {
  if (element.id) return `#${element.id}`

  const classes = Array.from(element.classList)
    .filter(c => !c.startsWith('feedback-'))
    .slice(0, 2)
    .join('.')

  const tagName = element.tagName.toLowerCase()

  if (classes) return `${tagName}.${classes}`
  return tagName
}

function interceptConsole(): void {
  if (originalWarn !== null) return

  originalWarn = console.warn
  originalError = console.error

  console.warn = (...args: unknown[]) => {
    const message = args.map(a =>
      typeof a === 'object' ? JSON.stringify(a) : String(a)
    ).join(' ')

    logs.push({
      level: 'warn',
      message: truncateMessage(message),
      timestamp: getTimestamp()
    })

    if (logs.length > MAX_LOGS) logs.shift()

    originalWarn?.apply(console, args)
  }

  console.error = (...args: unknown[]) => {
    const message = args.map(a => {
      if (a instanceof Error) return a.message
      if (typeof a === 'object') return JSON.stringify(a)
      return String(a)
    }).join(' ')

    const errorArg = args.find(a => a instanceof Error) as Error | undefined

    logs.push({
      level: 'error',
      message: truncateMessage(message),
      timestamp: getTimestamp(),
      stack: errorArg?.stack
    })

    if (logs.length > MAX_LOGS) logs.shift()

    originalError?.apply(console, args)
  }
}

function interceptErrors(): void {
  window.onerror = (message, source, lineno, colno, error) => {
    errors.push({
      message: truncateMessage(String(message)),
      source,
      lineno,
      colno,
      stack: error?.stack,
      timestamp: getTimestamp(),
      type: 'error'
    })

    if (errors.length > MAX_ERRORS) errors.shift()
  }

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    const message = reason instanceof Error
      ? reason.message
      : String(reason)

    errors.push({
      message: truncateMessage(message),
      stack: reason instanceof Error ? reason.stack : undefined,
      timestamp: getTimestamp(),
      type: 'unhandledrejection'
    })

    if (errors.length > MAX_ERRORS) errors.shift()
  })
}

function interceptClicks(): void {
  document.addEventListener('click', (event) => {
    const target = event.target as Element
    if (!target) return

    if (target.closest('.feedback-ignore')) return

    const selector = getCSSSelector(target)
    const text = target.textContent?.trim().slice(0, 50)

    breadcrumbs.push({
      type: 'click',
      target: selector,
      text,
      timestamp: getTimestamp()
    })

    if (breadcrumbs.length > MAX_BREADCRUMBS) breadcrumbs.shift()
  }, { capture: true })
}

function interceptNavigation(): void {
  const originalPushState = history.pushState
  const originalReplaceState = history.replaceState

  history.pushState = function(...args) {
    breadcrumbs.push({
      type: 'navigation',
      target: 'pushState',
      url: String(args[2] || ''),
      timestamp: getTimestamp()
    })

    if (breadcrumbs.length > MAX_BREADCRUMBS) breadcrumbs.shift()

    return originalPushState.apply(this, args)
  }

  history.replaceState = function(...args) {
    breadcrumbs.push({
      type: 'navigation',
      target: 'replaceState',
      url: String(args[2] || ''),
      timestamp: getTimestamp()
    })

    if (breadcrumbs.length > MAX_BREADCRUMBS) breadcrumbs.shift()

    return originalReplaceState.apply(this, args)
  }

  window.addEventListener('popstate', () => {
    breadcrumbs.push({
      type: 'navigation',
      target: 'popstate',
      url: window.location.href,
      timestamp: getTimestamp()
    })

    if (breadcrumbs.length > MAX_BREADCRUMBS) breadcrumbs.shift()
  })
}

export function initErrorTracker(): void {
  if (typeof window === 'undefined') return
  if (initialized) return

  initialized = true

  interceptConsole()
  interceptErrors()
  interceptClicks()
  interceptNavigation()

  breadcrumbs.push({
    type: 'navigation',
    target: 'pageload',
    url: window.location.href,
    timestamp: getTimestamp()
  })
}

export function getErrorSummary(): ErrorSummary {
  return {
    logs: [...logs],
    errors: [...errors],
    breadcrumbs: [...breadcrumbs],
    hasErrors: errors.length > 0 || logs.some(l => l.level === 'error'),
    hasWarnings: logs.some(l => l.level === 'warn')
  }
}

export function clearLogs(): void {
  logs = []
  errors = []
  breadcrumbs = []
}
