"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Megaphone,
  Zap,
  Brain,
  Plus,
  ChevronRight,
} from "lucide-react"

interface ActionsPanelProps {
  gatilhosAtivos: number
  agentesAtivos: number
  onOpenTriggers: () => void
  onOpenAI: () => void
  onOpenMessages: () => void
  onAddCategory: () => void
}

export function ActionsPanel({
  gatilhosAtivos,
  agentesAtivos,
  onOpenTriggers,
  onOpenAI,
  onOpenMessages,
  onAddCategory,
}: ActionsPanelProps) {
  return (
    <Card>
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm font-medium">Acoes Rapidas</CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-1.5">
        {/* Mensagens em Massa */}
        <Button
          variant="ghost"
          className="w-full justify-between h-auto py-2.5 px-3"
          onClick={onOpenMessages}
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-md bg-blue-500/10">
              <Megaphone className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Mensagens</p>
              <p className="text-xs text-muted-foreground">Envio em massa</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Gatilhos */}
        <Button
          variant="ghost"
          className="w-full justify-between h-auto py-2.5 px-3"
          onClick={onOpenTriggers}
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-md bg-amber-500/10">
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Gatilhos</p>
              <p className="text-xs text-muted-foreground">Automacoes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {gatilhosAtivos > 0 && (
              <Badge variant="secondary" className="text-[10px] h-5">
                {gatilhosAtivos}
              </Badge>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>

        {/* Agentes IA */}
        <Button
          variant="ghost"
          className="w-full justify-between h-auto py-2.5 px-3"
          onClick={onOpenAI}
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-md bg-purple-500/10">
              <Brain className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Agentes IA</p>
              <p className="text-xs text-muted-foreground">Bots inteligentes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {agentesAtivos > 0 && (
              <Badge variant="secondary" className="text-[10px] h-5">
                {agentesAtivos}
              </Badge>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>

        {/* Divider */}
        <div className="border-t my-2" />

        {/* Nova Categoria */}
        <Button
          variant="outline"
          className="w-full justify-center gap-2"
          onClick={onAddCategory}
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </CardContent>
    </Card>
  )
}
