"use client"

import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Glow } from "@/components/ui/glow"
import { Mockup } from "@/components/ui/mockup"
import { AnimatedGroup } from "@/components/ui/animated-group"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { cn } from "@/lib/utils"

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 py-20">
        <AnimatedGroup preset="blur-slide" className="flex flex-col items-center text-center">
          {/* Badge */}
          <Link href="/signup" className="group mb-8">
            <AnimatedGradientText className="px-4 py-1.5">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                Novo: Integração com IA
              </span>
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </AnimatedGradientText>
          </Link>

          {/* Title */}
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Gestão Inteligente de{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Grupos WhatsApp
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Automatize comandos, dispare mensagens em massa, integre IA e
            gerencie todos os seus grupos em um só lugar. Tudo isso com uma
            interface moderna e intuitiva.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/signup">
                Começar Grátis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base"
              asChild
            >
              <Link href="#features">Ver Recursos</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 md:gap-16">
            <div className="text-center">
              <p className="text-3xl font-bold md:text-4xl">10k+</p>
              <p className="mt-1 text-sm text-muted-foreground">Grupos Gerenciados</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold md:text-4xl">500+</p>
              <p className="mt-1 text-sm text-muted-foreground">Empresas Ativas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold md:text-4xl">99.9%</p>
              <p className="mt-1 text-sm text-muted-foreground">Uptime Garantido</p>
            </div>
          </div>
        </AnimatedGroup>

        {/* Mockup */}
        <div className="relative mt-20 px-4">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <Glow variant="above" className="opacity-50" />
          </div>

          <Mockup
            type="browser"
            className={cn(
              "mx-auto max-w-5xl",
              "shadow-[0_0_80px_-20px_rgba(0,0,0,0.3)]",
              "dark:shadow-[0_0_80px_-20px_rgba(255,255,255,0.1)]"
            )}
          >
            <div className="aspect-[16/10] bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-2xl">SG</span>
                </div>
                <p className="text-muted-foreground">Dashboard Preview</p>
              </div>
            </div>
          </Mockup>

          {/* Gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  )
}
