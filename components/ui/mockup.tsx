"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const mockupVariants = cva(
  "flex relative z-10 overflow-hidden shadow-2xl border border-border/50",
  {
    variants: {
      type: {
        mobile: "rounded-[48px] max-w-[350px]",
        responsive: "rounded-xl",
        browser: "rounded-xl",
      },
    },
    defaultVariants: {
      type: "responsive",
    },
  }
)

export interface MockupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mockupVariants> {}

const Mockup = React.forwardRef<HTMLDivElement, MockupProps>(
  ({ className, type, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(mockupVariants({ type, className }))}
      {...props}
    >
      {type === "browser" && (
        <div className="absolute top-0 left-0 right-0 h-10 bg-muted/80 border-b border-border/50 flex items-center px-4 gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-background/50 rounded-md h-6 max-w-md mx-auto" />
          </div>
        </div>
      )}
      <div className={cn(type === "browser" && "pt-10")}>{children}</div>
    </div>
  )
)
Mockup.displayName = "Mockup"

const MockupFrame = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-gradient-to-b from-muted/50 to-muted/30 rounded-2xl p-2",
      className
    )}
    {...props}
  />
))
MockupFrame.displayName = "MockupFrame"

export { Mockup, MockupFrame }
