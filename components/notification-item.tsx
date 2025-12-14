"use client"

import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Bell, BellOff, AlertCircle, CheckCircle, Info } from "lucide-react"
import type { Notificacao } from "@/types/notification"
import { cn } from "@/lib/utils"

interface NotificationItemProps {
  notificacao: Notificacao
  onMarcarLida: (id: number) => void
}

const ICON_MAP = {
  desconexao: AlertCircle,
  reconexao: CheckCircle,
  erro: BellOff,
  info: Info,
}

const COLOR_MAP = {
  desconexao: "text-red-500",
  reconexao: "text-green-500",
  erro: "text-orange-500",
  info: "text-blue-500",
}

export function NotificationItem({ notificacao, onMarcarLida }: NotificationItemProps) {
  const router = useRouter()
  const Icon = ICON_MAP[notificacao.tipo] || Bell

  const handleClick = () => {
    // Marcar como lida
    if (!notificacao.lida) {
      onMarcarLida(notificacao.id)
    }

    // Redirecionar para instância se houver metadata
    if (notificacao.metadata?.instanciaId) {
      router.push(`/instances/${notificacao.metadata.instanciaId}/connect`)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left",
        "hover:bg-accent",
        !notificacao.lida && "bg-accent/50"
      )}
    >
      {/* Ícone */}
      <div className={cn("mt-0.5", COLOR_MAP[notificacao.tipo])}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-sm font-medium",
            !notificacao.lida && "font-semibold"
          )}>
            {notificacao.titulo}
          </p>
          {!notificacao.lida && (
            <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
          )}
        </div>

        <p className="text-sm text-muted-foreground mt-1">
          {notificacao.mensagem}
        </p>

        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notificacao.dt_create), {
            addSuffix: true,
            locale: ptBR
          })}
        </p>
      </div>
    </button>
  )
}
