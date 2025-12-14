"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { type LucideIcon, ArrowRight, Package } from "lucide-react"

interface Action {
  label: string
  onClick?: () => void
  href?: string
  icon?: LucideIcon
  variant?: "default" | "outline" | "secondary" | "ghost"
}

interface SecondaryAction {
  icon?: LucideIcon
  title: string
  description: string
  href: string
}

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: Action
  secondaryAction?: Action
  secondaryActions?: SecondaryAction[]
  className?: string
  compact?: boolean
}

export function EmptyState({
  icon: Icon = Package,
  title,
  description,
  action,
  secondaryAction,
  secondaryActions,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8" : "py-12 md:py-16",
        className
      )}
    >
      {/* Icone */}
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-muted/50 mb-4",
          compact ? "p-4" : "p-5 md:p-6"
        )}
      >
        <Icon
          className={cn(
            "text-muted-foreground/40",
            compact ? "h-8 w-8" : "h-10 w-10 md:h-12 md:w-12"
          )}
        />
      </div>

      {/* Titulo */}
      <h3
        className={cn(
          "font-semibold mb-2",
          compact ? "text-base" : "text-lg md:text-xl"
        )}
      >
        {title}
      </h3>

      {/* Descricao */}
      <p
        className={cn(
          "text-muted-foreground max-w-md mx-auto mb-6",
          compact ? "text-sm" : "text-sm md:text-base"
        )}
      >
        {description}
      </p>

      {/* Acoes principais */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action && (
            <ActionButton action={action} isPrimary />
          )}
          {secondaryAction && (
            <ActionButton action={secondaryAction} />
          )}
        </div>
      )}

      {/* Acoes secundarias em cards (estilo Stripe) */}
      {secondaryActions && secondaryActions.length > 0 && (
        <div className="mt-8 w-full max-w-2xl">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {secondaryActions.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="group"
              >
                <Card className="p-4 h-full transition-all hover:shadow-md hover:border-primary/30">
                  <div className="flex items-start gap-3">
                    {item.icon && (
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ActionButton({
  action,
  isPrimary = false,
}: {
  action: Action
  isPrimary?: boolean
}) {
  const ButtonContent = (
    <>
      {action.icon && <action.icon className="h-4 w-4 mr-2" />}
      {action.label}
    </>
  )

  const buttonVariant = action.variant || (isPrimary ? "default" : "outline")

  if (action.href) {
    return (
      <Button variant={buttonVariant} asChild>
        <Link href={action.href}>
          {ButtonContent}
        </Link>
      </Button>
    )
  }

  return (
    <Button variant={buttonVariant} onClick={action.onClick}>
      {ButtonContent}
    </Button>
  )
}

// Variante compacta para uso inline em cards/secoes
export function EmptyStateCompact({
  icon: Icon = Package,
  title,
  description,
  action,
  className,
}: Omit<EmptyStateProps, "secondaryActions" | "secondaryAction" | "compact">) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-6 px-4",
        className
      )}
    >
      <div className="p-3 rounded-xl bg-muted/50 mb-3">
        <Icon className="h-6 w-6 text-muted-foreground/40" />
      </div>
      <h4 className="font-medium text-sm mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground max-w-[200px] mb-3">
        {description}
      </p>
      {action && (
        <ActionButton action={{ ...action, variant: "outline" }} />
      )}
    </div>
  )
}
