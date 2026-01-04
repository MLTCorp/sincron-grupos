"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ArrowLeft,
  Send,
  Clock,
  Loader2,
  FileText,
  Image,
  Video,
  AudioLines,
  Users,
  Phone,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Lightbulb,
  Check,
  Upload,
  Eye,
  ChevronDown,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  parseWhatsAppFormatting,
  applyFormatToSelection,
  insertTextAtCursor,
  PERSONALIZATION_VARIABLES,
} from "@/lib/whatsapp-formatter"

type TipoMensagem = "texto" | "imagem" | "video" | "audio"
type DestinoTipo = "private" | "groups"
type SendMode = "now" | "schedule"

interface Categoria {
  id: number
  nome: string
  cor: string
}

interface Grupo {
  id: number
  nome: string
  chat_id_whatsapp: string
  categorias?: number[]
}

const TIPOS_MENSAGEM = [
  { value: "texto" as TipoMensagem, label: "Texto", icon: FileText },
  { value: "imagem" as TipoMensagem, label: "Imagem", icon: Image },
  { value: "video" as TipoMensagem, label: "Video", icon: Video },
  { value: "audio" as TipoMensagem, label: "Audio", icon: AudioLines },
]

export default function NewMessagePage() {
  const router = useRouter()
  const supabase = createClient()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Data state
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [instanceToken, setInstanceToken] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Send mode
  const [sendMode, setSendMode] = useState<SendMode>("now")

  // Message content
  const [messageType, setMessageType] = useState<TipoMensagem>("texto")
  const [textContent, setTextContent] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [caption, setCaption] = useState("")

  // Destination
  const [destinationType, setDestinationType] = useState<DestinoTipo>("groups")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedGroups, setSelectedGroups] = useState<Set<number>>(new Set())
  const [activeCategories, setActiveCategories] = useState<Set<number>>(new Set())

  // Scheduling
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")

  // Mobile preview
  const [previewOpen, setPreviewOpen] = useState(false)

  // Load data
  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      const { data: usuarioSistema } = await supabase
        .from("usuarios_sistema")
        .select("id_organizacao")
        .eq("email", user.email)
        .single()

      if (!usuarioSistema) return

      // Fetch connected instance
      const { data: instancia } = await supabase
        .from("instancias_whatsapp")
        .select("api_key, status")
        .eq("id_organizacao", usuarioSistema.id_organizacao)
        .eq("status", "conectado")
        .single()

      if (instancia) {
        setInstanceToken(instancia.api_key)
        setIsConnected(true)
      }

      // Fetch categories
      const { data: categoriasData } = await supabase
        .from("categorias")
        .select("id, nome, cor")
        .eq("id_organizacao", usuarioSistema.id_organizacao)
        .order("nome")

      if (categoriasData) {
        setCategorias(categoriasData)
      }

      // Fetch groups with categories
      const { data: gruposData } = await supabase
        .from("grupos")
        .select(`
          id,
          nome,
          chat_id_whatsapp,
          grupos_categorias(id_categoria)
        `)
        .eq("id_organizacao", usuarioSistema.id_organizacao)
        .eq("ativo", true)
        .order("nome")

      if (gruposData) {
        const gruposProcessados = gruposData.map(g => ({
          id: g.id,
          nome: g.nome,
          chat_id_whatsapp: g.chat_id_whatsapp,
          categorias: (g.grupos_categorias as { id_categoria: number }[])?.map(gc => gc.id_categoria) || []
        }))
        setGrupos(gruposProcessados)
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err)
      toast.error("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter groups by active categories
  const filteredGroups = activeCategories.size === 0
    ? grupos
    : grupos.filter(g => g.categorias?.some(c => activeCategories.has(c)))

  // Toggle category filter
  const toggleCategoryFilter = (categoryId: number) => {
    const newSet = new Set(activeCategories)
    if (newSet.has(categoryId)) {
      newSet.delete(categoryId)
    } else {
      newSet.add(categoryId)
    }
    setActiveCategories(newSet)
  }

  // Toggle group selection
  const toggleGroup = (groupId: number) => {
    const newSet = new Set(selectedGroups)
    if (newSet.has(groupId)) {
      newSet.delete(groupId)
    } else {
      newSet.add(groupId)
    }
    setSelectedGroups(newSet)
  }

  // Select all visible groups
  const selectAllGroups = () => {
    if (selectedGroups.size === filteredGroups.length) {
      setSelectedGroups(new Set())
    } else {
      setSelectedGroups(new Set(filteredGroups.map(g => g.id)))
    }
  }

  // Get current text content
  const getCurrentText = () => {
    return messageType === "texto" ? textContent : caption
  }

  // Apply formatting to selected text
  const handleFormat = (formatChar: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { newText, newSelectionStart, newSelectionEnd } = applyFormatToSelection(textarea, formatChar)

    if (messageType === "texto") {
      setTextContent(newText)
    } else {
      setCaption(newText)
    }

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newSelectionStart, newSelectionEnd)
    }, 0)
  }

  // Insert variable at cursor
  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { newText, newCursorPos } = insertTextAtCursor(textarea, variable)

    if (messageType === "texto") {
      setTextContent(newText)
    } else {
      setCaption(newText)
    }

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // Get display time for preview
  const getDisplayTime = () => {
    if (sendMode === "schedule" && scheduleDate && scheduleTime) {
      const scheduled = new Date(`${scheduleDate}T${scheduleTime}`)
      const today = new Date()
      const isToday = scheduled.toDateString() === today.toDateString()

      if (isToday) {
        return scheduled.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      } else {
        return scheduled.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) +
               " " + scheduled.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      }
    }
    return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  // Save and send message
  const handleSubmit = async (saveAsDraft = false) => {
    // Validation
    if (!saveAsDraft) {
      if (destinationType === "private" && !phoneNumber.trim()) {
        toast.error("Informe o numero do telefone")
        return
      }
      if (destinationType === "groups" && selectedGroups.size === 0) {
        toast.error("Selecione pelo menos um grupo")
        return
      }
      if (messageType === "texto" && !getCurrentText().trim()) {
        toast.error("Digite o texto da mensagem")
        return
      }
      if (messageType !== "texto" && !mediaUrl.trim()) {
        toast.error("Informe a URL da midia")
        return
      }
      if (sendMode === "schedule" && (!scheduleDate || !scheduleTime)) {
        toast.error("Informe data e hora do agendamento")
        return
      }
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

      let dtAgendamento: string | null = null
      if (sendMode === "schedule" && scheduleDate && scheduleTime) {
        dtAgendamento = new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
      }

      const mensagemData = {
        id_organizacao: usuarioSistema.id_organizacao,
        criado_por: usuarioSistema.id,
        tipo_mensagem: messageType,
        conteudo_texto: getCurrentText() || null,
        url_midia: messageType !== "texto" ? mediaUrl : null,
        grupos_ids: destinationType === "groups" ? Array.from(selectedGroups) : null,
        enviar_agora: saveAsDraft ? false : sendMode === "now",
        dt_agendamento: dtAgendamento,
        status: saveAsDraft ? "rascunho" : (sendMode === "now" ? "enviando" : "pendente"),
      }

      const { data: mensagem, error } = await supabase
        .from("mensagens_programadas")
        .insert(mensagemData)
        .select()
        .single()

      if (error) throw error

      // If sending now and connected, process immediately
      if (!saveAsDraft && sendMode === "now" && instanceToken && mensagem) {
        await processarEnvio(mensagem)
      }

      toast.success(
        saveAsDraft
          ? "Rascunho salvo!"
          : sendMode === "now"
          ? "Mensagem enviada!"
          : "Mensagem agendada!"
      )
      router.push("/messages")
    } catch (err) {
      console.error("Erro ao salvar mensagem:", err)
      toast.error("Erro ao salvar mensagem")
    } finally {
      setSaving(false)
    }
  }

  // Process message sending
  const processarEnvio = async (mensagem: { id: number; tipo_mensagem: string; conteudo_texto: string | null; url_midia: string | null; grupos_ids: number[] | null }) => {
    if (!instanceToken) return

    try {
      let gruposParaEnviar: Grupo[] = []

      if (mensagem.grupos_ids && mensagem.grupos_ids.length > 0) {
        gruposParaEnviar = grupos.filter(g => mensagem.grupos_ids!.includes(g.id))
      }

      // For private number, create a virtual group
      if (destinationType === "private" && phoneNumber) {
        gruposParaEnviar = [{
          id: 0,
          nome: phoneNumber,
          chat_id_whatsapp: phoneNumber.replace(/\D/g, "") + "@c.us",
          categorias: []
        }]
      }

      if (gruposParaEnviar.length === 0) {
        throw new Error("Nenhum destinatario encontrado")
      }

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

          await new Promise(resolve => setTimeout(resolve, 500))
        } catch {
          erros.push(`Erro ao enviar para ${grupo.nome}`)
        }
      }

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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const previewText = getCurrentText() || "Preview..."
  const formattedPreview = parseWhatsAppFormatting(previewText)

  return (
    <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 sm:h-10 sm:w-10">
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold truncate">Nova Mensagem</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isConnected ? "WhatsApp conectado" : "WhatsApp desconectado"}
          </p>
        </div>
      </div>

      {/* Top Bar: Send Mode + Schedule + Message Type */}
      <div className="mb-6 space-y-4">
        {/* Row 1: Send Mode Toggle + Schedule inputs - Touch-friendly */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex bg-muted p-1 rounded-lg gap-1 w-full sm:w-auto">
            <Button
              variant={sendMode === "now" ? "default" : "ghost"}
              size="sm"
              className="gap-2 flex-1 sm:flex-none h-10 touch-manipulation"
              onClick={() => setSendMode("now")}
            >
              <Send className="h-4 w-4" />
              Enviar Agora
            </Button>
            <Button
              variant={sendMode === "schedule" ? "default" : "ghost"}
              size="sm"
              className="gap-2 flex-1 sm:flex-none h-10 touch-manipulation"
              onClick={() => setSendMode("schedule")}
            >
              <Clock className="h-4 w-4" />
              Agendar
            </Button>
          </div>

          {/* Inline Schedule Inputs */}
          {sendMode === "schedule" && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="flex-1 sm:w-[140px] h-10"
              />
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-[110px] h-10"
              />
            </div>
          )}
        </div>

      </div>

      {/* Main Content Grid - Message + Preview side by side */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Message Editor */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Message Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Mensagem</CardTitle>
          </CardHeader>

            <CardContent className="space-y-4">
              {/* Message Type Selector - Scrollable on mobile */}
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="inline-flex items-center gap-1 bg-muted p-1 rounded-lg min-w-max">
                  {TIPOS_MENSAGEM.map(({ value, label, icon: Icon }) => (
                    <Button
                      key={value}
                      variant={messageType === value ? "default" : "ghost"}
                      size="sm"
                      className={cn("gap-1.5 h-8 px-3 text-xs whitespace-nowrap", messageType !== value && "text-muted-foreground")}
                      onClick={() => setMessageType(value)}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Media URL Input (for non-text types) */}
              {messageType !== "texto" && (
                <div className="flex gap-2">
                  <Input
                    placeholder={`https://exemplo.com/${messageType === "imagem" ? "imagem.jpg" : messageType === "video" ? "video.mp4" : "audio.mp3"}`}
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="flex-1"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept={messageType === "imagem" ? "image/*" : messageType === "video" ? "video/*" : "audio/*"}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          // Por enquanto apenas mostra o nome - integrar com storage depois
                          toast.info(`Arquivo selecionado: ${file.name}. Upload em breve!`)
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="icon" className="h-9 w-9" asChild>
                      <span>
                        <Upload className="h-4 w-4" />
                      </span>
                    </Button>
                  </label>
                </div>
              )}

              {/* Audio message notice */}
              {messageType === "audio" ? (
                <div className="text-sm text-muted-foreground italic py-4 text-center">
                  Audio nao suporta legenda
                </div>
              ) : (
                <>
                  {/* Text Editor with Formatting Toolbar */}
                  <div className="border rounded-lg overflow-hidden">
                    {/* Formatting toolbar - Touch-friendly */}
                    <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 touch-manipulation"
                        onClick={() => handleFormat("*")}
                        title="Negrito"
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 touch-manipulation"
                        onClick={() => handleFormat("_")}
                        title="Italico"
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 touch-manipulation"
                        onClick={() => handleFormat("~")}
                        title="Tachado"
                      >
                        <Strikethrough className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 touch-manipulation"
                        onClick={() => handleFormat("```")}
                        title="Monoespaco"
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Textarea */}
                    <Textarea
                      ref={textareaRef}
                      placeholder="Digite sua mensagem..."
                      value={messageType === "texto" ? textContent : caption}
                      onChange={(e) => {
                        if (messageType === "texto") {
                          setTextContent(e.target.value)
                        } else {
                          setCaption(e.target.value)
                        }
                      }}
                      className="min-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
                      maxLength={4096}
                    />

                    {/* Character count */}
                    <div className="px-3 py-1.5 border-t bg-muted/30">
                      <span className="text-xs text-muted-foreground">
                        {(messageType === "texto" ? textContent : caption).length}/4096
                      </span>
                    </div>
                  </div>

                  {/* Personalization variables */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" />
                      Clique para inserir variaveis:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {PERSONALIZATION_VARIABLES.map(({ variable, description }) => (
                        <button
                          key={variable}
                          onClick={() => insertVariable(variable)}
                          className="px-2 py-1 rounded text-xs text-primary hover:bg-primary/10 transition-colors border bg-background"
                          title={description}
                        >
                          {variable}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Mobile Preview - Collapsible */}
          <div className="lg:hidden">
            <Collapsible open={previewOpen} onOpenChange={setPreviewOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between h-10">
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Ver Preview
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", previewOpen && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="flex justify-center p-4 bg-muted/30 rounded-lg">
                  <div
                    className="relative max-w-[220px] p-3 rounded-lg shadow-sm"
                    style={{ backgroundColor: "#DCF8C6" }}
                  >
                    <div
                      className="text-gray-800 break-words whitespace-pre-wrap"
                      style={{ fontSize: "13px", lineHeight: "1.4" }}
                      dangerouslySetInnerHTML={{ __html: formattedPreview }}
                    />
                    <div className="flex items-center justify-end gap-0.5 mt-1">
                      <span className="text-[10px] text-gray-500">{getDisplayTime()}</span>
                      <div className="flex -space-x-1">
                        <Check className="h-3 w-3 text-blue-500" />
                        <Check className="h-3 w-3 text-blue-500" />
                      </div>
                    </div>
                    <div
                      className="absolute -right-[6px] bottom-3 w-0 h-0"
                      style={{
                        borderLeft: "8px solid #DCF8C6",
                        borderTop: "4px solid transparent",
                        borderBottom: "4px solid transparent",
                      }}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Right Column - Preview Bubble (simple, no background) - Desktop only */}
        <div className="hidden lg:flex lg:items-start">
          <div className="sticky top-20">
            {/* Preview bubble */}
            <div
              className="relative max-w-[220px] p-3 rounded-lg shadow-sm"
              style={{ backgroundColor: "#DCF8C6" }}
            >
              <div
                className="text-gray-800 break-words whitespace-pre-wrap"
                style={{ fontSize: "13px", lineHeight: "1.4" }}
                dangerouslySetInnerHTML={{ __html: formattedPreview }}
              />
              <div className="flex items-center justify-end gap-0.5 mt-1">
                <span className="text-[10px] text-gray-500">{getDisplayTime()}</span>
                <div className="flex -space-x-1">
                  <Check className="h-3 w-3 text-blue-500" />
                  <Check className="h-3 w-3 text-blue-500" />
                </div>
              </div>
              {/* Bubble tail */}
              <div
                className="absolute -right-[6px] bottom-3 w-0 h-0"
                style={{
                  borderLeft: "8px solid #DCF8C6",
                  borderTop: "4px solid transparent",
                  borderBottom: "4px solid transparent",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Destinatários - Full width below */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Destinatarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Destination Type Toggle - Touch-friendly */}
          <div className="inline-flex bg-muted p-1 rounded-lg gap-1 w-full sm:w-auto">
            <Button
              variant={destinationType === "private" ? "default" : "ghost"}
              size="sm"
              className="gap-2 flex-1 sm:flex-none h-10 touch-manipulation"
              onClick={() => setDestinationType("private")}
            >
              <Phone className="h-4 w-4" />
              Numero Privado
            </Button>
            <Button
              variant={destinationType === "groups" ? "default" : "ghost"}
              size="sm"
              className="gap-2 flex-1 sm:flex-none h-10 touch-manipulation"
              onClick={() => setDestinationType("groups")}
            >
              <Users className="h-4 w-4" />
              Grupos
            </Button>
          </div>

          {/* Private Number Input */}
          {destinationType === "private" && (
            <div className="space-y-2">
              <Label>Numero do Telefone</Label>
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="5511999999999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="max-w-md h-10"
              />
              <p className="text-xs text-muted-foreground">
                Formato: codigo do pais + DDD + numero (sem espacos ou caracteres especiais)
              </p>
            </div>
          )}

          {/* Groups Selection */}
          {destinationType === "groups" && (
            <div className="space-y-4">
              {/* Category Filters - Touch-friendly */}
              {categorias.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveCategories(new Set())}
                    className={cn(
                      "px-3 py-2 rounded-full text-xs font-medium transition-all border touch-manipulation min-h-[36px]",
                      activeCategories.size === 0
                        ? "bg-foreground text-background border-foreground"
                        : "bg-transparent hover:bg-muted border-border"
                    )}
                  >
                    Todas
                  </button>
                  {categorias.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategoryFilter(cat.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all border touch-manipulation min-h-[36px]"
                      )}
                      style={{
                        backgroundColor: activeCategories.has(cat.id) ? cat.cor + "20" : "transparent",
                        borderColor: cat.cor,
                        color: cat.cor,
                      }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.cor }}
                      />
                      {cat.nome}
                    </button>
                  ))}
                </div>
              )}

              {/* Select All */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedGroups.size} de {filteredGroups.length} grupos selecionados
                </span>
                <Button variant="link" size="sm" onClick={selectAllGroups}>
                  {selectedGroups.size === filteredGroups.length ? "Desmarcar todos" : "Selecionar todos"}
                </Button>
              </div>

              {/* Groups List - Responsive height */}
              <ScrollArea className="h-[200px] sm:h-[250px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {filteredGroups.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum grupo encontrado
                    </p>
                  ) : (
                    filteredGroups.map((grupo) => (
                      <div
                        key={grupo.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-muted transition-colors touch-manipulation min-h-[48px]",
                          selectedGroups.has(grupo.id) && "bg-muted"
                        )}
                        onClick={() => toggleGroup(grupo.id)}
                      >
                        <Checkbox
                          checked={selectedGroups.has(grupo.id)}
                          onCheckedChange={() => toggleGroup(grupo.id)}
                          className="h-5 w-5"
                        />
                        <span className="text-sm flex-1 truncate">{grupo.nome}</span>
                        <div className="flex gap-1.5">
                          {grupo.categorias?.map(catId => {
                            const cat = categorias.find(c => c.id === catId)
                            return cat ? (
                              <div
                                key={catId}
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: cat.cor }}
                                title={cat.nome}
                              />
                            ) : null
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons - Full width, Touch-friendly */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button
          variant="outline"
          className="flex-1 h-12 sm:h-10 touch-manipulation text-base sm:text-sm"
          onClick={() => handleSubmit(true)}
          disabled={saving}
        >
          Salvar Rascunho
        </Button>
        <Button
          className="flex-1 h-12 sm:h-10 gap-2 touch-manipulation text-base sm:text-sm"
          onClick={() => handleSubmit(false)}
          disabled={saving || !isConnected}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : sendMode === "now" ? (
            <Send className="h-4 w-4" />
          ) : (
            <Clock className="h-4 w-4" />
          )}
          {sendMode === "now" ? "Enviar" : "Agendar"}
        </Button>
      </div>

      {!isConnected && (
        <p className="text-sm text-destructive text-center mt-4">
          Conecte uma instancia do WhatsApp para enviar mensagens
        </p>
      )}
    </div>
  )
}
