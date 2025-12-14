"use client"

import {
  Bot,
  Command,
  MessageSquare,
  Users,
  Rss,
  BarChart3,
  Shield,
  Zap,
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Command,
    title: "Comandos Automáticos",
    description:
      "Configure comandos personalizados para seus grupos. Tradução, transcrição, calendário e muito mais.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: MessageSquare,
    title: "Mensagens em Massa",
    description:
      "Dispare mensagens para múltiplos grupos simultaneamente com agendamento e templates.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: Bot,
    title: "IA Integrada",
    description:
      "Assistente inteligente que responde perguntas e executa tarefas automaticamente.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Users,
    title: "Gestão de Membros",
    description:
      "Controle admins, membros e permissões de cada grupo de forma centralizada.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Rss,
    title: "RSS & Conteúdo",
    description:
      "Importe feeds RSS e distribua conteúdo automaticamente para seus grupos.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: BarChart3,
    title: "Analytics Avançado",
    description:
      "Acompanhe métricas de engajamento, comandos executados e performance.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description:
      "Dados criptografados, backups automáticos e controle total de acesso.",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    icon: Zap,
    title: "Gatilhos Inteligentes",
    description:
      "Automatize ações com base em palavras-chave, horários ou eventos específicos.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-medium text-primary mb-4"
          >
            RECURSOS
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
          >
            Tudo que você precisa para{" "}
            <span className="text-primary">gerenciar seus grupos</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Uma plataforma completa com todas as ferramentas necessárias para
            automatizar e escalar sua gestão de grupos no WhatsApp.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "group relative rounded-2xl border bg-background p-6",
                "hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                  feature.bg
                )}
              >
                <feature.icon className={cn("w-6 h-6", feature.color)} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
