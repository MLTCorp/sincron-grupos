import { Construction, type LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

interface UnderConstructionProps {
  title: string
  description?: string
  icon?: LucideIcon
}

export function UnderConstruction({
  title,
  description = "Esta funcionalidade esta em desenvolvimento e estara disponivel em breve.",
  icon: Icon = Construction
}: UnderConstructionProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md text-center p-8">
        <div className="flex justify-center mb-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <Icon className="h-12 w-12 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-3">
          {title}
        </h2>
        <p className="text-muted-foreground mb-6">
          {description}
        </p>
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            Estamos trabalhando para trazer esta funcionalidade para voce.
          </p>
        </div>
      </Card>
    </div>
  )
}
