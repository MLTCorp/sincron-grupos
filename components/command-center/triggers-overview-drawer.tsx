"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Zap,
  Trash2,
  Copy,
  Pencil,
  MessageSquare,
  Megaphone,
  Webhook,
  Bot,
  Bell,
  Ban,
  Users,
  UserMinus,
  FileText,
  Image,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Gatilho, Categoria } from "@/hooks/use-organization-data"
import type { Json } from "@/types/supabase"

interface TriggersOverviewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gatilhos: Gatilho[]
  categorias: Categoria[]
  onUpdate: () => void
}

type Condicoes = {
  operador: "AND" | "OR"
  regras: Array<{
    campo: string
    operador: string
    valor: string
  }>
}

const TIPO_EVENTO_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  mensagem_recebida: { label: "Qualquer mensagem", icon: MessageSquare },
  mensagem_texto: { label: "Mensagem de texto", icon: FileText },
  mensagem_midia: { label: "Imagem/Video/Audio", icon: Image },
  membro_entrou: { label: "Membro entrou", icon: Users },
  membro_saiu: { label: "Membro saiu", icon: UserMinus },
}

const TIPO_ACAO_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  excluir_mensagem: { label: "Excluir mensagem", icon: Ban },
  enviar_mensagem: { label: "Enviar mensagem", icon: Megaphone },
  enviar_webhook: { label: "Webhook", icon: Webhook },
  notificar_admin: { label: "Notificar admin", icon: Bell },
  acionar_bot: { label: "Acionar bot", icon: Bot },
}

export function TriggersOverviewDrawer({
  open,
  onOpenChange,
  gatilhos,
  categorias,
  onUpdate,
}: TriggersOverviewDrawerProps) {
  const [toggling, setToggling] = useState<number | null>(null)
  const supabase = createClient()

  const handleToggle = async (id: number, ativo: boolean) => {
    setToggling(id)
    try {
      const { error } = await supabase
        .from("gatilhos")
        .update({ ativo, dt_update: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      toast.success(ativo ? "Gatilho ativado" : "Gatilho desativado")
      onUpdate()
    } catch (err) {
      console.error("Erro ao atualizar gatilho:", err)
      toast.error("Erro ao atualizar gatilho")
    } finally {
      setToggling(null)
    }
  }

  const handleDuplicate = async (gatilho: Gatilho) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      const { data: usuarioSistema } = await supabase
        .from("usuarios_sistema")
        .select("id_organizacao")
        .eq("email", user.email)
        .single()

      if (!usuarioSistema?.id_organizacao) return

      const condicoes = (gatilho.condicoes ?? { operador: "AND", regras: [] }) as Condicoes
      const configAcao = (gatilho.config_acao ?? {}) as Record<string, unknown>

      const { error } = await supabase.from("gatilhos").insert({
        id_organizacao: usuarioSistema.id_organizacao,
        id_grupo: gatilho.id_grupo,
        id_categoria: gatilho.id_categoria,
        nome: `${gatilho.nome} (copia)`,
        descricao: gatilho.descricao,
        tipo_evento: gatilho.tipo_evento,
        condicoes: condicoes as unknown as Json,
        tipo_acao: gatilho.tipo_acao,
        config_acao: configAcao as unknown as Json,
        prioridade: gatilho.prioridade + 1,
        ativo: false,
      })

      if (error) throw error

      toast.success("Gatilho duplicado")
      onUpdate()
    } catch (err) {
      console.error("Erro ao duplicar gatilho:", err)
      toast.error("Erro ao duplicar gatilho")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from("gatilhos").delete().eq("id", id)
      if (error) throw error

      toast.success("Gatilho removido")
      onUpdate()
    } catch (err) {
      console.error("Erro ao remover gatilho:", err)
      toast.error("Erro ao remover gatilho")
    }
  }

  const getCategoriaInfo = (catId: number | null) => {
    if (!catId) return null
    return categorias.find(c => c.id === catId)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-4 pb-2 shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Gatilhos
            </SheetTitle>
            <Link href="/triggers/new">
              <Button size="sm" className="h-8 gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Novo
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            {gatilhos.length} gatilho(s) configurado(s)
          </p>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {gatilhos.length > 0 ? (
            <div className="divide-y">
              {gatilhos.map((gatilho) => {
                const eventoInfo = TIPO_EVENTO_LABELS[gatilho.tipo_evento] || { label: gatilho.tipo_evento, icon: Zap }
                const acaoInfo = TIPO_ACAO_LABELS[gatilho.tipo_acao] || { label: gatilho.tipo_acao, icon: Zap }
                const EventoIcon = eventoInfo.icon
                const AcaoIcon = acaoInfo.icon
                const categoria = getCategoriaInfo(gatilho.id_categoria)

                return (
                  <div
                    key={gatilho.id}
                    className={cn(
                      "p-3 transition-colors hover:bg-muted/30 group/item",
                      !gatilho.ativo && "opacity-60"
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={cn(
                          "relative p-2 rounded-lg transition-all shrink-0",
                          gatilho.ativo ? "bg-foreground/10" : "bg-muted"
                        )}>
                          <Zap className={cn(
                            "h-4 w-4 transition-colors",
                            gatilho.ativo ? "text-foreground" : "text-muted-foreground"
                          )} />
                          <div className="absolute -top-0.5 -right-0.5">
                            <div className={cn(
                              "h-2 w-2 rounded-full border border-background",
                              gatilho.ativo ? "bg-foreground" : "bg-muted-foreground"
                            )} />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-sm truncate">{gatilho.nome}</h3>
                          {gatilho.descricao && (
                            <p className="text-[10px] text-muted-foreground truncate">
                              {gatilho.descricao}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/triggers/${gatilho.id}/edit`}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent><p>Editar</p></TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleDuplicate(gatilho)}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Duplicar</p></TooltipContent>
                            </Tooltip>

                            <AlertDialog>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent><p>Excluir</p></TooltipContent>
                              </Tooltip>
                              <AlertDialogContent className="max-w-sm p-4">
                                <AlertDialogHeader className="pb-2">
                                  <AlertDialogTitle className="text-base">Excluir gatilho?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-xs">
                                    Esta acao nao pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="gap-2">
                                  <AlertDialogCancel className="h-8 text-sm">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(gatilho.id)}
                                    className="h-8 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TooltipProvider>
                        </div>

                        <div className="w-px h-5 bg-border mx-1" />

                        <Switch
                          checked={gatilho.ativo}
                          onCheckedChange={(checked) => handleToggle(gatilho.id, checked)}
                          disabled={toggling === gatilho.id}
                          className="scale-90"
                        />
                      </div>
                    </div>

                    {/* Flow visualization */}
                    <div className="flex items-center gap-1.5 flex-wrap pl-10">
                      <Badge variant="secondary" className="flex items-center gap-1 text-[10px] px-1.5 py-0 h-5">
                        <EventoIcon className="h-3 w-3" />
                        {eventoInfo.label.split(' ')[0]}
                      </Badge>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <Badge variant="secondary" className="flex items-center gap-1 text-[10px] px-1.5 py-0 h-5">
                        <AcaoIcon className="h-3 w-3" />
                        {acaoInfo.label.split(' ')[0]}
                      </Badge>
                      {categoria && (
                        <Badge variant="secondary" className="flex items-center gap-1 text-[10px] px-1.5 py-0 h-5">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: categoria.cor }}
                          />
                          {categoria.nome}
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="mx-auto w-fit p-3 rounded-xl bg-muted mb-3">
                <Zap className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">Nenhum gatilho</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Crie automacoes para seus grupos
              </p>
              <Link href="/triggers/new">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Criar Gatilho
                </Button>
              </Link>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
