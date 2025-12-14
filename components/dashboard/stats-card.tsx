"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { type LucideIcon, TrendingUp, TrendingDown, ArrowRight } from "lucide-react"

interface StatsCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  iconColor?: string
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  description?: string
  href?: string
  className?: string
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-primary",
  trend,
  description,
  href,
  className,
}: StatsCardProps) {
  const CardWrapper = href ? Link : "div"

  return (
    <CardWrapper href={href || "#"} className={cn(href && "block group")}>
      <Card
        className={cn(
          "p-3 sm:p-4 lg:p-5 transition-all",
          href && "hover:shadow-md hover:border-primary/30 cursor-pointer",
          className
        )}
      >
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
            {/* Label */}
            <p className="text-xs sm:text-sm text-muted-foreground font-medium line-clamp-1">
              {label}
            </p>

            {/* Valor */}
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                {value}
              </span>

              {/* Trend indicator */}
              {trend && (
                <span
                  className={cn(
                    "flex items-center gap-0.5 text-[10px] sm:text-xs font-medium",
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  )}
                  {trend.value > 0 && "+"}
                  {trend.value}%
                </span>
              )}
            </div>

            {/* Descricao ou trend label */}
            {(description || trend?.label) && (
              <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                {description || trend?.label}
              </p>
            )}
          </div>

          {/* Icone - esconde em telas muito pequenas */}
          {Icon && (
            <div
              className={cn(
                "p-1.5 sm:p-2 lg:p-2.5 rounded-lg sm:rounded-xl bg-muted/50 shrink-0 transition-colors",
                href && "group-hover:bg-primary/10"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
                  href ? "text-muted-foreground group-hover:text-primary" : iconColor
                )}
              />
            </div>
          )}
        </div>

        {/* Link indicator */}
        {href && (
          <div className="flex items-center gap-1 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t text-[10px] sm:text-xs text-muted-foreground group-hover:text-primary transition-colors">
            <span>Ver detalhes</span>
            <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          </div>
        )}
      </Card>
    </CardWrapper>
  )
}

// Grid wrapper para stats
interface StatsGridProps {
  children: React.ReactNode
  className?: string
  columns?: 2 | 3 | 4
}

export function StatsGrid({
  children,
  className,
  columns = 4,
}: StatsGridProps) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:gap-4",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  )
}

// Variante compacta para uso em sidebars
export function StatsCardCompact({
  label,
  value,
  icon: Icon,
  trend,
  className,
}: Omit<StatsCardProps, "description" | "href" | "iconColor">) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {Icon && (
        <div className="p-2 rounded-lg bg-muted/50">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-semibold">{value}</span>
          {trend && (
            <span
              className={cn(
                "text-[10px] font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
