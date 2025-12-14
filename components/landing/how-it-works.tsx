"use client"

import { motion } from "framer-motion"
import { QrCode, Settings, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  {
    number: "01",
    icon: QrCode,
    title: "Conecte seu WhatsApp",
    description:
      "Escaneie o QR Code e conecte sua instância WhatsApp em segundos. Sem necessidade de root ou modificações.",
  },
  {
    number: "02",
    icon: Settings,
    title: "Configure seus Grupos",
    description:
      "Importe seus grupos, defina categorias, configure comandos e personalize as automações.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Automatize e Escale",
    description:
      "Deixe a plataforma trabalhar por você. Envie mensagens, execute comandos e monitore tudo em tempo real.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-medium text-primary mb-4"
          >
            COMO FUNCIONA
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
          >
            Comece em <span className="text-primary">3 passos simples</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Configure sua conta em minutos e comece a automatizar seus grupos
            imediatamente.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connection Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className={cn(
                  "relative md:grid md:grid-cols-2 md:gap-8 md:items-center",
                  index % 2 === 1 && "md:flex-row-reverse"
                )}
              >
                {/* Content */}
                <div
                  className={cn(
                    "mb-8 md:mb-0",
                    index % 2 === 1 ? "md:col-start-2" : "md:text-right"
                  )}
                >
                  <span className="text-6xl font-bold text-muted/30">
                    {step.number}
                  </span>
                  <h3 className="text-2xl font-bold mt-2">{step.title}</h3>
                  <p className="text-muted-foreground mt-2 max-w-md">
                    {step.description}
                  </p>
                </div>

                {/* Icon */}
                <div
                  className={cn(
                    "flex justify-center md:justify-start",
                    index % 2 === 1 && "md:col-start-1 md:row-start-1 md:justify-end"
                  )}
                >
                  <div className="relative">
                    {/* Circle background */}
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                    <div className="relative w-24 h-24 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                      <step.icon className="w-10 h-10 text-primary" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
