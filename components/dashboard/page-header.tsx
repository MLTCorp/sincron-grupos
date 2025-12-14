"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft } from "lucide-react"

interface Tab {
  label: string
  value: string
  href?: string
  count?: number
}

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  tabs?: Tab[]
  activeTab?: string
  onTabChange?: (value: string) => void
  actions?: React.ReactNode
  breadcrumbs?: Breadcrumb[]
  backHref?: string
  className?: string
}

export function PageHeader({
  title,
  description,
  tabs,
  activeTab,
  onTabChange,
  actions,
  breadcrumbs,
  backHref,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Breadcrumbs ou Back */}
      {(breadcrumbs || backHref) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {backHref && (
            <Link
              href={backHref}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Link>
          )}
          {breadcrumbs && (
            <nav className="flex items-center gap-2">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span>/</span>}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
        </div>
      )}

      {/* Header principal */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-sm md:text-base">
              {description}
            </p>
          )}
        </div>

        {/* Acoes */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <>
          {/* Desktop: Tabs inline */}
          <div className="hidden sm:block border-b">
            <nav className="flex gap-6 -mb-px">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.value
                const TabWrapper = tab.href ? Link : "button"

                return (
                  <TabWrapper
                    key={tab.value}
                    href={tab.href || "#"}
                    onClick={
                      !tab.href && onTabChange
                        ? () => onTabChange(tab.value)
                        : undefined
                    }
                    className={cn(
                      "flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors",
                      isActive
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                    )}
                  >
                    {tab.label}
                    {tab.count !== undefined && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {tab.count}
                      </span>
                    )}
                  </TabWrapper>
                )
              })}
            </nav>
          </div>

          {/* Mobile: Select dropdown */}
          <div className="sm:hidden">
            <Select value={activeTab} onValueChange={onTabChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma aba" />
              </SelectTrigger>
              <SelectContent>
                {tabs.map((tab) => (
                  <SelectItem key={tab.value} value={tab.value}>
                    <span className="flex items-center gap-2">
                      {tab.label}
                      {tab.count !== undefined && (
                        <span className="text-muted-foreground">
                          ({tab.count})
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  )
}
