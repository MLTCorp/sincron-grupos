"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  Brain,
  Trash2,
  Pencil,
  Bot,
  Sparkles,
  Info,
  Cpu,
  Thermometer,
  Loader2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { AgenteIA } from "@/hooks/use-organization-data"

interface AIAgentsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agentes: AgenteIA[]
  onUpdate: () => void
}

type FormData = {
  nome: string
  descricao: string
  prompt_sistema: string
  modelo: string
  temperatura: number
  max_tokens: number
  responder_no_grupo: boolean
}

const MODELOS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini", desc: "Rapido e economico" },
  { value: "gpt-4o", label: "GPT-4o", desc: "Mais inteligente" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo", desc: "Alta capacidade" },
  { value: "claude-3-haiku", label: "Claude 3 Haiku", desc: "Rapido e eficiente" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet", desc: "Equilibrado" },
]

const initialFormData: FormData = {
  nome: "",
  descricao: "",
  prompt_sistema: "",
  modelo: "gpt-4o-mini",
  temperatura: 0.7,
  max_tokens: 1000,
  responder_no_grupo: true,
}

export function AIAgentsDrawer({
  open,
  onOpenChange,
  agentes,
  onUpdate,
}: AIAgentsDrawerProps) {
  const [toggling, setToggling] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  const handleToggle = async (id: number, ativo: boolean) => {
    setToggling(id)
    try {
      const { error } = await supabase
        .from("agentes_ia")
        .update({ ativo, dt_update: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      toast.success(ativo ? "Agente ativado" : "Agente desativado")
      onUpdate()
    } catch (err) {
      console.error("Erro ao atualizar agente:", err)
      toast.error("Erro ao atualizar agente")
    } finally {
      setToggling(null)
    }
  }

  const handleSubmit = async () => {
    if (!formData.nome.trim() || !formData.prompt_sistema.trim()) {
      toast.error("Preencha o nome e o prompt do sistema")
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      const { data: usuarioSistema } = await supabase
        .from("usuarios_sistema")
        .select("id_organizacao")
        .eq("email", user.email)
        .single()

      if (!usuarioSistema?.id_organizacao) return

      if (editingId) {
        const { error } = await supabase
          .from("agentes_ia")
          .update({
            nome: formData.nome,
            descricao: formData.descricao || null,
            prompt_sistema: formData.prompt_sistema,
            modelo: formData.modelo,
            temperatura: formData.temperatura,
            max_tokens: formData.max_tokens,
            responder_no_grupo: formData.responder_no_grupo,
            dt_update: new Date().toISOString(),
          })
          .eq("id", editingId)

        if (error) throw error
        toast.success("Agente atualizado!")
      } else {
        const { error } = await supabase.from("agentes_ia").insert({
          id_organizacao: usuarioSistema.id_organizacao,
          nome: formData.nome,
          descricao: formData.descricao || null,
          prompt_sistema: formData.prompt_sistema,
          modelo: formData.modelo,
          temperatura: formData.temperatura,
          max_tokens: formData.max_tokens,
          responder_no_grupo: formData.responder_no_grupo,
          ativo: true,
        })

        if (error) throw error
        toast.success("Agente criado!")
      }

      setDialogOpen(false)
      setEditingId(null)
      setFormData(initialFormData)
      onUpdate()
    } catch (err) {
      console.error("Erro ao salvar agente:", err)
      toast.error("Erro ao salvar agente")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (agente: AgenteIA) => {
    setEditingId(agente.id)
    setFormData({
      nome: agente.nome,
      descricao: agente.descricao || "",
      prompt_sistema: agente.prompt_sistema,
      modelo: agente.modelo,
      temperatura: agente.temperatura || 0.7,
      max_tokens: agente.max_tokens || 1000,
      responder_no_grupo: agente.responder_no_grupo !== false,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from("agentes_ia").delete().eq("id", id)
      if (error) throw error

      toast.success("Agente removido")
      onUpdate()
    } catch (err) {
      console.error("Erro ao remover agente:", err)
      toast.error("Erro ao remover agente")
    }
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData(initialFormData)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
          <SheetHeader className="p-4 pb-2 shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Agentes IA
              </SheetTitle>
              <Button size="sm" className="h-8 gap-1.5" onClick={() => setDialogOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Novo
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {agentes.length} agente(s) configurado(s)
            </p>
          </SheetHeader>

          {/* Dica */}
          <div className="mx-4 mb-2 p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <p className="text-[10px] text-muted-foreground">
                <span className="font-medium text-foreground">Dica:</span> Use em Gatilhos com acao &quot;Acionar bot IA&quot;
              </p>
            </div>
          </div>

          <ScrollArea className="flex-1">
            {agentes.length > 0 ? (
              <div className="p-4 pt-0 space-y-3">
                {agentes.map((agente) => {
                  const modeloInfo = MODELOS.find(m => m.value === agente.modelo)
                  return (
                    <div
                      key={agente.id}
                      className={cn(
                        "rounded-lg border p-3 transition-all",
                        !agente.ativo && "opacity-60"
                      )}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={cn(
                            "relative p-2 rounded-lg transition-all shrink-0",
                            agente.ativo ? "bg-foreground/10" : "bg-muted"
                          )}>
                            <Bot className={cn(
                              "h-4 w-4 transition-colors",
                              agente.ativo ? "text-foreground" : "text-muted-foreground"
                            )} />
                            <div className="absolute -top-0.5 -right-0.5">
                              <div className={cn(
                                "h-2 w-2 rounded-full border border-background",
                                agente.ativo ? "bg-foreground" : "bg-muted-foreground"
                              )} />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-sm truncate">{agente.nome}</h3>
                            {agente.descricao && (
                              <p className="text-[10px] text-muted-foreground truncate">
                                {agente.descricao}
                              </p>
                            )}
                          </div>
                        </div>
                        <Switch
                          checked={agente.ativo}
                          onCheckedChange={(checked) => handleToggle(agente.id, checked)}
                          disabled={toggling === agente.id}
                          className="shrink-0 scale-90"
                        />
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 flex items-center gap-1">
                          <Cpu className="h-2.5 w-2.5" />
                          {modeloInfo?.label.split(' ')[0] || agente.modelo.split('-')[0]}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 flex items-center gap-1">
                          <Thermometer className="h-2.5 w-2.5" />
                          {agente.temperatura || 0.7}
                        </Badge>
                      </div>

                      {/* Prompt preview */}
                      <div className="rounded-md bg-muted/50 p-2 mb-2">
                        <p className="text-[10px] text-muted-foreground line-clamp-2">
                          {agente.prompt_sistema}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => handleEdit(agente)}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-destructive hover:text-destructive">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Excluir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-sm p-4">
                            <AlertDialogHeader className="pb-2">
                              <AlertDialogTitle className="text-base">Excluir agente?</AlertDialogTitle>
                              <AlertDialogDescription className="text-xs">
                                Gatilhos que usam este agente deixarao de funcionar.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2">
                              <AlertDialogCancel className="h-8 text-sm">Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(agente.id)}
                                className="h-8 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="mx-auto w-fit p-3 rounded-xl bg-muted mb-3">
                  <Brain className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">Nenhum agente</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Crie agentes IA para automatizar respostas
                </p>
                <Button size="sm" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Criar Agente
                </Button>
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Dialog de criacao/edicao */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base">{editingId ? "Editar Agente" : "Novo Agente"}</DialogTitle>
            <DialogDescription className="text-xs">
              Configure assistente IA para grupos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="nome" className="text-sm">Nome *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Assistente Vendas"
                  className="h-8 text-sm"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modelo" className="text-sm">Modelo</Label>
                <Select
                  value={formData.modelo}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, modelo: val }))}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELOS.map(m => (
                      <SelectItem key={m.value} value={m.value} className="text-sm">
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descricao" className="text-sm">Descricao</Label>
              <Input
                id="descricao"
                placeholder="Breve descricao..."
                className="h-8 text-sm"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prompt" className="text-sm">Prompt *</Label>
              <Textarea
                id="prompt"
                placeholder="Voce e um assistente de atendimento..."
                className="min-h-[80px] text-sm"
                value={formData.prompt_sistema}
                onChange={(e) => setFormData(prev => ({ ...prev, prompt_sistema: e.target.value }))}
              />
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Define personalidade do agente
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="temperatura" className="text-sm">Temp: {formData.temperatura}</Label>
                <Input
                  id="temperatura"
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={formData.temperatura}
                  onChange={(e) => setFormData(prev => ({ ...prev, temperatura: Number(e.target.value) }))}
                  className="cursor-pointer h-8"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="max_tokens" className="text-sm">Max tokens</Label>
                <Input
                  id="max_tokens"
                  type="number"
                  min={100}
                  max={4000}
                  className="h-8 text-sm"
                  value={formData.max_tokens}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_tokens: Number(e.target.value) }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => handleDialogChange(false)}
            >
              Cancelar
            </Button>
            <Button size="sm" className="h-8" onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  {editingId ? "Salvar" : "Criar"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
