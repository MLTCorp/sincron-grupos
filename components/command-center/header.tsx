"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  ChevronDown,
  Wifi,
  WifiOff,
  Plus,
  Settings,
  LogOut,
  Users,
  Smartphone,
} from "lucide-react"
import type { Instancia } from "@/hooks/use-organization-data"
import { cn } from "@/lib/utils"

interface CommandCenterHeaderProps {
  instancias: Instancia[]
  selectedInstance: Instancia | null
  onSelectInstance: (instancia: Instancia) => void
}

export function CommandCenterHeader({
  instancias,
  selectedInstance,
  onSelectInstance,
}: CommandCenterHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Logout realizado com sucesso!")
    router.push("/login")
  }

  const isConnected = selectedInstance?.status === "conectado"

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Logo e titulo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">SG</span>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold">Sincron Grupos</h1>
        </div>
      </div>

      {/* Instance Selector + User Menu */}
      <div className="flex items-center gap-2">
        {/* Instance Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 h-9">
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline max-w-[120px] truncate">
                {selectedInstance?.nome_instancia || "Selecionar"}
              </span>
              {selectedInstance && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "h-5 px-1.5 text-[10px]",
                    isConnected ? "bg-green-500/20 text-green-600" : "bg-muted"
                  )}
                >
                  {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                </Badge>
              )}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {instancias.length > 0 ? (
              <>
                {instancias.map((inst) => (
                  <DropdownMenuItem
                    key={inst.id}
                    onClick={() => onSelectInstance(inst)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="truncate max-w-[140px]">{inst.nome_instancia}</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "h-5 px-1.5 text-[10px]",
                        inst.status === "conectado"
                          ? "bg-green-500/20 text-green-600"
                          : "bg-muted"
                      )}
                    >
                      {inst.status === "conectado" ? "On" : "Off"}
                    </Badge>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            ) : null}
            <DropdownMenuItem onClick={() => router.push("/instances/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Instancia
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs bg-muted">U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push("/team")}>
              <Users className="h-4 w-4 mr-2" />
              Equipe
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Configuracoes
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
