"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  DialogTrigger,
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
  MessageSquare,
  Sparkles,
  Info,
  Cpu,
  Thermometer,
  Loader2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type AgenteIA = {
  id: number
  id_organizacao: number
  nome: string
  descricao: string | null
  prompt_sistema: string
  modelo: string
  temperatura: number | null
  max_tokens: number | null
  responder_no_grupo: boolean | null
  ativo: boolean
  dt_create: string | null
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

export default function AIPage() {
  const [agentes, setAgentes] = useState<AgenteIA[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)

  const supabase = createClient()

  const loadAgentes = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      const { data: usuarioSistema } = await supabase
        .from("usuarios_sistema")
        .select("id_organizacao")
        .eq("email", user.email)
        .single()

      if (!usuarioSistema?.id_organizacao) return

      const { data, error } = await supabase
        .from("agentes_ia")
        .select("*")
        .eq("id_organizacao", usuarioSistema.id_organizacao)
        .order("nome")

      if (error) throw error
      setAgentes(data || [])
    } catch (err) {
      console.error("Erro ao carregar agentes:", err)
      toast.error("Erro ao carregar agentes de IA")
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadAgentes()
  }, [loadAgentes])

  const handleToggle = async (id: number, ativo: boolean) => {
    setToggling(id)
    try {
      const { error } = await supabase
        .from("agentes_ia")
        .update({ ativo, dt_update: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      setAgentes(prev => prev.map(a => a.id === id ? { ...a, ativo } : a))
      toast.success(ativo ? "Agente ativado" : "Agente desativado")
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
        toast.success("Agente atualizado com sucesso!")
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
        toast.success("Agente criado com sucesso!")
      }

      setDialogOpen(false)
      setEditingId(null)
      setFormData(initialFormData)
      loadAgentes()
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

      setAgentes(prev => prev.filter(a => a.id !== id))
      toast.success("Agente removido")
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="p-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header - Compacto */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Agentes IA
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Assistentes para grupos
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0 h-8 sm:h-9">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Novo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-base sm:text-lg">{editingId ? "Editar Agente" : "Novo Agente"}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Configure assistente IA para grupos
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="nome" className="text-sm">Nome *</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Assistente Vendas"
                    className="h-8 sm:h-9 text-sm"
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
                    <SelectTrigger className="h-8 sm:h-9 text-sm">
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
                  className="h-8 sm:h-9 text-sm"
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
                    className="h-8 sm:h-9 text-sm"
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
              <Button
                size="sm"
                className="h-8"
                onClick={handleSubmit}
                disabled={saving}
              >
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
      </div>

      {/* Dica - Compacta */}
      <Card className="p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Dica:</span> Use em <strong>Gatilhos</strong> com acao &quot;Acionar bot IA&quot;
          </p>
        </div>
      </Card>

      {/* Lista de Agentes */}
      {agentes.length > 0 ? (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          {agentes.map((agente) => {
            const modeloInfo = MODELOS.find(m => m.value === agente.modelo)
            return (
              <Card
                key={agente.id}
                className={cn(
                  "group card-hover transition-all",
                  !agente.ativo && "opacity-60"
                )}
              >
                <CardContent className="p-3 sm:p-4">
                  {/* Header - Compacto */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={cn(
                        "relative p-2 sm:p-2.5 rounded-lg transition-all shrink-0",
                        agente.ativo ? "bg-foreground/10" : "bg-muted"
                      )}>
                        <Bot className={cn(
                          "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
                          agente.ativo ? "text-foreground" : "text-muted-foreground"
                        )} />
                        {/* Status dot */}
                        <div className="absolute -top-0.5 -right-0.5">
                          <div className={cn(
                            "h-2 w-2 rounded-full border border-background",
                            agente.ativo ? "bg-foreground" : "bg-muted-foreground"
                          )} />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate">
                          {agente.nome}
                        </h3>
                        {agente.descricao && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                            {agente.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={agente.ativo}
                      onCheckedChange={(checked) => handleToggle(agente.id, checked)}
                      disabled={toggling === agente.id}
                      className="shrink-0 scale-90 sm:scale-100"
                    />
                  </div>

                  {/* Stats - Compacto */}
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2.5">
                    <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0 h-5 flex items-center gap-1">
                      <Cpu className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span className="hidden sm:inline">{modeloInfo?.label || agente.modelo}</span>
                      <span className="sm:hidden">{modeloInfo?.label.split(' ')[0] || agente.modelo.split('-')[0]}</span>
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0 h-5 flex items-center gap-1">
                      <Thermometer className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {agente.temperatura || 0.7}
                    </Badge>
                    {agente.responder_no_grupo !== false && (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0 h-5 flex items-center gap-1">
                        <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span className="hidden sm:inline">Auto</span>
                      </Badge>
                    )}
                  </div>

                  {/* Prompt preview - Compacto */}
                  <div className="rounded-md bg-muted/50 p-2 sm:p-2.5 mb-2.5">
                    <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                      {agente.prompt_sistema}
                    </p>
                  </div>

                  {/* Actions - Compacto */}
                  <div className="flex items-center gap-1.5 pt-2.5 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => handleEdit(agente)}
                    >
                      <Pencil className="h-3 w-3 sm:mr-1" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-destructive hover:text-destructive">
                          <Trash2 className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Excluir</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-sm p-4 sm:p-6">
                        <AlertDialogHeader className="pb-2">
                          <AlertDialogTitle className="text-base">Excluir agente?</AlertDialogTitle>
                          <AlertDialogDescription className="text-xs sm:text-sm">
                            O agente sera removido. Gatilhos que o usam deixarao de funcionar.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2 sm:gap-0">
                          <AlertDialogCancel className="h-8 text-xs sm:text-sm">Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(agente.id)}
                            className="h-8 text-xs sm:text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <div className="mx-auto w-fit p-3 rounded-xl bg-muted mb-3">
            <Brain className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold mb-1">
            Nenhum agente
          </h3>
          <p className="text-muted-foreground text-sm mb-4 max-w-xs mx-auto">
            Crie agentes IA para automatizar respostas
          </p>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Agente
          </Button>
        </Card>
      )}
    </div>
  )
}
