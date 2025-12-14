import { UnderConstruction } from "@/components/under-construction"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <UnderConstruction
      title="Configuracoes"
      description="Gerencie as configuracoes da sua conta, preferencias de notificacao e dados da organizacao."
      icon={Settings}
    />
  )
}
