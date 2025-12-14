import { UnderConstruction } from "@/components/under-construction"
import { Rss } from "lucide-react"

export default function FeedsPage() {
  return (
    <UnderConstruction
      title="RSS Feeds"
      description="Configure feeds RSS para enviar atualizacoes automaticamente aos seus grupos. Mantenha sua audiencia informada sobre novidades."
      icon={Rss}
    />
  )
}
