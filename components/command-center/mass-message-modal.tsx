"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Megaphone,
  Send,
  Clock,
  FileText,
  Image,
  Video,
  AudioLines,
  Calendar,
  Users,
  Tag,
  Loader2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Categoria, Grupo } from "@/hooks/use-organization-data"

interface MassMessageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  instanceToken: string | null
  categorias: Categoria[]
  grupos: Grupo[]
  onUpdate: () => void
}

type TipoMensagem = "texto" | "imagem" | "video" | "audio"
type TipoDestinatario = "grupos" | "categoria"

const TIPOS_MENSAGEM = [
  { value: "texto" as TipoMensagem, label: "Texto", icon: FileText },
  { value: "imagem" as TipoMensagem, label: "Imagem", icon: Image },
  { value: "video" as TipoMensagem, label: "Video", icon: Video },
  { value: "audio" as TipoMensagem, label: "Audio", icon: AudioLines },
]

export function MassMessageModal({
  open,
  onOpenChange,
  instanceToken,
  categorias,
  grupos,
  onUpdate,
}: MassMessageModalProps) {
  const [saving, setSaving] = useState(false)

  // Form state
  const [tipoMensagem, setTipoMensagem] = useState<TipoMensagem>("texto")
  const [tipoDestinatario, setTipoDestinatario] = useState<TipoDestinatario>("grupos")
  const [gruposSelecionados, setGruposSelecionados] = useState<Set<number>>(new Set())
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null)
  const [conteudoTexto, setConteudoTexto] = useState("")
  const [urlMidia, setUrlMidia] = useState("")
  const [legendaMidia, setLegendaMidia] = useState("")
  const [enviarAgora, setEnviarAgora] = useState(true)
  const [dataAgendamento, setDataAgendamento] = useState("")
  const [horaAgendamento, setHoraAgendamento] = useState("")

  const supabase = createClient()

  const resetForm = () => {
    setTipoMensagem("texto")
    setTipoDestinatario("grupos")
    setGruposSelecionados(new Set())
    setCategoriaSelecionada(null)
    setConteudoTexto("")
    setUrlMidia("")
    setLegendaMidia("")
    setEnviarAgora(true)
    setDataAgendamento("")
    setHoraAgendamento("")
  }

  const toggleGrupo = (grupoId: number) => {
    const newSet = new Set(gruposSelecionados)
    if (newSet.has(grupoId)) {
      newSet.delete(grupoId)
    } else {
      newSet.add(grupoId)
    }
    setGruposSelecionados(newSet)
  }

  const handleSaveMensagem = async () => {
    // Validacoes
    if (tipoDestinatario === "grupos" && gruposSelecionados.size === 0) {
      toast.error("Selecione pelo menos um grupo")
      return
    }
    if (tipoDestinatario === "categoria" && !categoriaSelecionada) {
      toast.error("Selecione uma categoria")
      return
    }
    if (tipoMensagem === "texto" && !conteudoTexto.trim()) {
      toast.error("Digite o texto da mensagem")
      return
    }
    if (tipoMensagem !== "texto" && !urlMidia.trim()) {
      toast.error("Informe a URL da midia")
      return
    }
    if (!enviarAgora && (!dataAgendamento || !horaAgendamento)) {
      toast.error("Informe data e hora do agendamento")
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error("Usuario nao autenticado")

      const { data: usuarioSistema } = await supabase
        .from("usuarios_sistema")
        .select("id, id_organizacao")
        .eq("email", user.email)
        .single()

      if (!usuarioSistema) throw new Error("Usuario nao encontrado")

      // Montar data de agendamento
      let dtAgendamento: string | null = null
      if (!enviarAgora && dataAgendamento && horaAgendamento) {
        dtAgendamento = new Date(`${dataAgendamento}T${horaAgendamento}`).toISOString()
      }

      // Inserir mensagem
      const { data: novaMensagem, error } = await supabase
        .from("mensagens_programadas")
        .insert({
          id_organizacao: usuarioSistema.id_organizacao,
          tipo_mensagem: tipoMensagem,
          conteudo_texto: tipoMensagem === "texto" ? conteudoTexto : legendaMidia || null,
          url_midia: tipoMensagem !== "texto" ? urlMidia : null,
          grupos_ids: tipoDestinatario === "grupos" ? Array.from(gruposSelecionados) : null,
          categoria_id: tipoDestinatario === "categoria" ? categoriaSelecionada : null,
          enviar_agora: enviarAgora,
          dt_agendamento: dtAgendamento,
          status: enviarAgora ? "enviando" : "pendente",
          criado_por: usuarioSistema.id,
        })
        .select()
        .single()

      if (error) throw error

      // Se for enviar agora, processar envio
      if (enviarAgora && instanceToken && novaMensagem) {
        await processarEnvio(novaMensagem)
      }

      toast.success(enviarAgora ? "Mensagem enviada!" : "Mensagem agendada!")
      onOpenChange(false)
      resetForm()
      onUpdate()
    } catch (err) {
      console.error("Erro ao salvar mensagem:", err)
      toast.error("Erro ao salvar mensagem")
    } finally {
      setSaving(false)
    }
  }

  const processarEnvio = async (mensagem: { id: number; tipo_mensagem: string; conteudo_texto: string | null; url_midia: string | null; grupos_ids: number[] | null; categoria_id: number | null }) => {
    if (!instanceToken) return

    try {
      // Determinar grupos para enviar
      let gruposParaEnviar: Grupo[] = []

      if (mensagem.grupos_ids && mensagem.grupos_ids.length > 0) {
        gruposParaEnviar = grupos.filter(g => mensagem.grupos_ids!.includes(g.id))
      } else if (mensagem.categoria_id) {
        gruposParaEnviar = grupos.filter(g => g.categorias?.includes(mensagem.categoria_id!))
      }

      if (gruposParaEnviar.length === 0) {
        throw new Error("Nenhum grupo encontrado para enviar")
      }

      // Enviar para cada grupo
      const erros: string[] = []
      for (const grupo of gruposParaEnviar) {
        try {
          let endpoint = ""
          const body: Record<string, unknown> = { chatId: grupo.chat_id_whatsapp }

          switch (mensagem.tipo_mensagem) {
            case "texto":
              endpoint = `/api/uazapi/instances/${instanceToken}/send/text`
              body.text = mensagem.conteudo_texto
              break
            case "imagem":
              endpoint = `/api/uazapi/instances/${instanceToken}/send/image`
              body.imageUrl = mensagem.url_midia
              body.caption = mensagem.conteudo_texto || ""
              break
            case "video":
              endpoint = `/api/uazapi/instances/${instanceToken}/send/video`
              body.videoUrl = mensagem.url_midia
              body.caption = mensagem.conteudo_texto || ""
              break
            case "audio":
              endpoint = `/api/uazapi/instances/${instanceToken}/send/audio`
              body.audioUrl = mensagem.url_midia
              break
          }

          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })

          if (!response.ok) {
            erros.push(`Erro ao enviar para ${grupo.nome}`)
          }

          // Pequeno delay entre envios
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch {
          erros.push(`Erro ao enviar para ${grupo.nome}`)
        }
      }

      // Atualizar status
      await supabase
        .from("mensagens_programadas")
        .update({
          status: erros.length === 0 ? "concluido" : "erro",
          dt_enviado: new Date().toISOString(),
          erro_mensagem: erros.length > 0 ? erros.join("; ") : null,
        })
        .eq("id", mensagem.id)

    } catch (err) {
      console.error("Erro no processamento:", err)
      await supabase
        .from("mensagens_programadas")
        .update({
          status: "erro",
          erro_mensagem: err instanceof Error ? err.message : "Erro desconhecido",
        })
        .eq("id", mensagem.id)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Megaphone className="h-4 w-4" />
            Nova Mensagem
          </DialogTitle>
          <DialogDescription className="text-xs">
            Envie ou agende para seus grupos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo de conteudo */}
          <div className="space-y-1.5">
            <Label className="text-sm">Tipo</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {TIPOS_MENSAGEM.map((tipo) => (
                <Button
                  key={tipo.value}
                  type="button"
                  variant={tipoMensagem === tipo.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTipoMensagem(tipo.value)}
                  className="h-8 text-xs"
                >
                  <tipo.icon className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">{tipo.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Destinatarios */}
          <div className="space-y-2">
            <Label className="text-sm">Destinatarios</Label>
            <div className="flex gap-3 text-sm">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="tipoDestinatario"
                  checked={tipoDestinatario === "grupos"}
                  onChange={() => setTipoDestinatario("grupos")}
                  className="w-3.5 h-3.5"
                />
                <Users className="h-3.5 w-3.5" />
                Grupos
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="tipoDestinatario"
                  checked={tipoDestinatario === "categoria"}
                  onChange={() => setTipoDestinatario("categoria")}
                  className="w-3.5 h-3.5"
                />
                <Tag className="h-3.5 w-3.5" />
                Categoria
              </label>
            </div>

            {tipoDestinatario === "grupos" && (
              <div className="max-h-32 overflow-y-auto border rounded-lg p-2 space-y-1.5">
                {grupos.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhum grupo</p>
                ) : (
                  grupos.map((grupo) => (
                    <label key={grupo.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={gruposSelecionados.has(grupo.id)}
                        onCheckedChange={() => toggleGrupo(grupo.id)}
                        className="h-4 w-4"
                      />
                      <span className="text-xs truncate">{grupo.nome}</span>
                    </label>
                  ))
                )}
              </div>
            )}

            {tipoDestinatario === "categoria" && (
              <Select
                value={categoriaSelecionada?.toString() || ""}
                onValueChange={(v) => setCategoriaSelecionada(parseInt(v))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Conteudo */}
          <div className="space-y-1.5">
            <Label className="text-sm">
              {tipoMensagem === "texto" ? "Mensagem" : "URL"}
            </Label>
            {tipoMensagem === "texto" ? (
              <Textarea
                placeholder="Digite sua mensagem..."
                value={conteudoTexto}
                onChange={(e) => setConteudoTexto(e.target.value)}
                rows={3}
                className="text-sm"
              />
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder={`URL do ${tipoMensagem}`}
                  value={urlMidia}
                  onChange={(e) => setUrlMidia(e.target.value)}
                  className="h-8 text-sm"
                />
                {tipoMensagem !== "audio" && (
                  <Input
                    placeholder="Legenda (opcional)"
                    value={legendaMidia}
                    onChange={(e) => setLegendaMidia(e.target.value)}
                    className="h-8 text-sm"
                  />
                )}
              </div>
            )}
          </div>

          {/* Agendamento */}
          <div className="space-y-2">
            <Label className="text-sm">Quando enviar</Label>
            <div className="flex gap-3 text-sm">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="enviarAgora"
                  checked={enviarAgora}
                  onChange={() => setEnviarAgora(true)}
                  className="w-3.5 h-3.5"
                />
                <Send className="h-3.5 w-3.5" />
                Agora
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="enviarAgora"
                  checked={!enviarAgora}
                  onChange={() => setEnviarAgora(false)}
                  className="w-3.5 h-3.5"
                />
                <Calendar className="h-3.5 w-3.5" />
                Agendar
              </label>
            </div>

            {!enviarAgora && (
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dataAgendamento}
                  onChange={(e) => setDataAgendamento(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="flex-1 h-8 text-sm"
                />
                <Input
                  type="time"
                  value={horaAgendamento}
                  onChange={(e) => setHoraAgendamento(e.target.value)}
                  className="w-24 h-8 text-sm"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={handleClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button size="sm" className="h-8" onClick={handleSaveMensagem} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {enviarAgora ? <Send className="h-4 w-4 mr-1.5" /> : <Clock className="h-4 w-4 mr-1.5" />}
                {enviarAgora ? "Enviar" : "Agendar"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
