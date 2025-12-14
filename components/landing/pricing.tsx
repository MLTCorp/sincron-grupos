"use client"

import Link from "next/link"
import { Check } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ShineBorder } from "@/components/magicui/shine-border"

const plans = [
  {
    name: "Starter",
    description: "Para quem está começando",
    price: "Grátis",
    period: "",
    features: [
      "1 instância WhatsApp",
      "Até 5 grupos",
      "Comandos básicos",
      "Suporte por email",
    ],
    cta: "Começar Grátis",
    href: "/signup",
    popular: false,
  },
  {
    name: "Pro",
    description: "Para profissionais",
    price: "R$ 97",
    period: "/mês",
    features: [
      "3 instâncias WhatsApp",
      "Grupos ilimitados",
      "Todos os comandos",
      "IA integrada",
      "Mensagens em massa",
      "Analytics avançado",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
    href: "/signup?plan=pro",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Para grandes equipes",
    price: "R$ 297",
    period: "/mês",
    features: [
      "10 instâncias WhatsApp",
      "Grupos ilimitados",
      "API completa",
      "White-label",
      "Integrações customizadas",
      "Gerente de conta dedicado",
      "SLA garantido",
    ],
    cta: "Falar com Vendas",
    href: "/contact",
    popular: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-medium text-primary mb-4"
          >
            PREÇOS
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
          >
            Planos para <span className="text-primary">todos os tamanhos</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Comece grátis e escale conforme seu negócio cresce. Sem surpresas,
            sem taxas ocultas.
          </motion.p>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular ? (
                <ShineBorder
                  className="w-full"
                  color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                >
                  <PlanCard plan={plan} />
                </ShineBorder>
              ) : (
                <div className="rounded-2xl border bg-background">
                  <PlanCard plan={plan} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PlanCard({ plan }: { plan: (typeof plans)[0] }) {
  return (
    <div className="p-8 h-full flex flex-col">
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
            Mais Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold">{plan.name}</h3>
        <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold">{plan.price}</span>
        <span className="text-muted-foreground">{plan.period}</span>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        asChild
        className={cn("w-full", !plan.popular && "variant-outline")}
        variant={plan.popular ? "default" : "outline"}
      >
        <Link href={plan.href}>{plan.cta}</Link>
      </Button>
    </div>
  )
}
