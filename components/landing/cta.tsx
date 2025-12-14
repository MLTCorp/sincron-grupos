"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Glow } from "@/components/ui/glow"
import { BorderBeam } from "@/components/magicui/border-beam"
import { cn } from "@/lib/utils"

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Card */}
          <div
            className={cn(
              "relative rounded-3xl bg-gradient-to-br from-background to-muted/50",
              "border overflow-hidden p-8 md:p-12 lg:p-16"
            )}
          >
            <BorderBeam size={300} duration={10} />

            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="relative text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Pronto para{" "}
                <span className="text-primary">revolucionar</span> sua gestão de
                grupos?
              </h2>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                Junte-se a centenas de empresas que já automatizaram seus grupos
                no WhatsApp. Comece gratuitamente, sem cartão de crédito.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="h-12 px-8 text-base" asChild>
                  <Link href="/signup">
                    Criar Conta Grátis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base"
                  asChild
                >
                  <Link href="/contact">Falar com Especialista</Link>
                </Button>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                Setup em 2 minutos • Sem cartão de crédito • Cancele quando
                quiser
              </p>
            </div>
          </div>

          {/* Glow Effect */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <Glow variant="center" className="opacity-30" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
