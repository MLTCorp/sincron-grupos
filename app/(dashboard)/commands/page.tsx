import { UnderConstruction } from "@/components/under-construction"
import { Terminal } from "lucide-react"

export default function CommandsPage() {
  return (
    <UnderConstruction
      title="Comandos"
      description="Configure comandos automaticos para seus grupos WhatsApp. Responda automaticamente quando membros enviarem mensagens especificas."
      icon={Terminal}
    />
  )
}
