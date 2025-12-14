"use client"

import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Como funciona a conexão com o WhatsApp?",
    answer:
      "A conexão é feita através de QR Code, similar ao WhatsApp Web. Você escaneia o código com seu celular e pronto! Sua instância fica conectada 24/7 em nossos servidores seguros.",
  },
  {
    question: "Preciso manter meu celular conectado?",
    answer:
      "Não! Diferente do WhatsApp Web tradicional, após a conexão inicial você pode desconectar seu celular. Nossa infraestrutura mantém sua sessão ativa de forma independente.",
  },
  {
    question: "É seguro usar a plataforma?",
    answer:
      "Sim! Utilizamos criptografia de ponta a ponta, servidores seguros e não armazenamos suas mensagens. Seus dados são protegidos seguindo as melhores práticas de segurança.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer:
      "Claro! Não há fidelidade ou multa. Você pode cancelar sua assinatura a qualquer momento diretamente pelo painel, e continuará tendo acesso até o fim do período pago.",
  },
  {
    question: "Quantos grupos posso gerenciar?",
    answer:
      "No plano Starter você pode gerenciar até 5 grupos. Nos planos Pro e Enterprise, os grupos são ilimitados! Gerencie centenas de grupos sem preocupações.",
  },
  {
    question: "A plataforma viola os termos do WhatsApp?",
    answer:
      "Nossa plataforma utiliza a API oficial do WhatsApp Business. Recomendamos sempre seguir as diretrizes do WhatsApp para evitar qualquer tipo de bloqueio.",
  },
  {
    question: "Oferecem suporte técnico?",
    answer:
      "Sim! Todos os planos incluem suporte. O plano Starter tem suporte por email, o Pro tem suporte prioritário, e o Enterprise conta com gerente de conta dedicado.",
  },
  {
    question: "Posso testar antes de assinar?",
    answer:
      "Com certeza! O plano Starter é 100% gratuito e você pode usar para sempre. É perfeito para testar a plataforma e entender se atende suas necessidades.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-medium text-primary mb-4"
          >
            FAQ
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
          >
            Perguntas <span className="text-primary">frequentes</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Tire suas dúvidas sobre a plataforma. Não encontrou o que procura?
            Entre em contato conosco.
          </motion.p>
        </div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
