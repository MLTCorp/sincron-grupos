"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Zap,
  MessageSquare,
  FileText,
  Image,
  Users,
  UserMinus,
  Ban,
  Webhook,
  Bot,
  Bell,
  Plus,
  X,
  Loader2,
  Tag,
  Reply,
  Forward,
  Send,
  MessagesSquare,
  Phone,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Json } from "@/types/supabase"

type Grupo = {
  id: number
  nome: string
}

type Categoria = {
  id: number
  nome: string
  cor: string
}

type AgenteIA = {
  id: number
  nome: string
  descricao: string | null
}

type Regra = {
  campo: string
  operador: string
  valor: string
}

type EscopoGatilho = "todos" | "categoria" | "grupo"

type FormData = {
  nome: string
  descricao: string
  escopo: EscopoGatilho
  idGrupo: number | null
  idCategoria: number | null
  tipoEvento: string
  condicaoOperador: "AND" | "OR"
  regras: Regra[]
  tipoAcao: string
  configAcao: Record<string, unknown>
  prioridade: number
}

const TIPOS_EVENTO = [
  { value: "mensagem_texto", label: "Mensagem de texto", icon: FileText, desc: "Quando alguem enviar uma mensagem de texto" },
  { value: "mensagem_recebida", label: "Qualquer mensagem", icon: MessageSquare, desc: "Qualquer tipo de mensagem (texto, imagem, video, etc)" },
  { value: "mensagem_midia", label: "Midia (imagem/video/audio)", icon: Image, desc: "Quando enviarem imagem, video ou audio" },
  { value: "membro_entrou", label: "Membro entrou no grupo", icon: Users, desc: "Quando um novo membro entrar no grupo" },
  { value: "membro_saiu", label: "Membro saiu do grupo", icon: UserMinus, desc: "Quando um membro sair ou for removido" },
]

const TIPOS_ACAO = [
  { value: "excluir_mensagem", label: "Excluir mensagem", icon: Ban, desc: "Remove a mensagem do grupo" },
  { value: "enviar_mensagem", label: "Enviar mensagem", icon: MessageSquare, desc: "Envia uma mensagem no grupo" },
  { value: "enviar_webhook", label: "Chamar webhook", icon: Webhook, desc: "Envia dados para uma URL externa" },
  { value: "notificar_admin", label: "Notificar administrador", icon: Bell, desc: "Envia alerta para o admin" },
  { value: "acionar_bot", label: "Acionar bot IA", icon: Bot, desc: "Passa a mensagem para processamento com IA" },
]

const CAMPOS_CONDICAO = [
  { value: "conteudo_texto", label: "Conteudo da mensagem" },
  { value: "remetente", label: "Numero do remetente" },
  { value: "tipo_mensagem", label: "Tipo de mensagem" },
]

const OPERADORES_CONDICAO = [
  { value: "contem", label: "Contem" },
  { value: "nao_contem", label: "Nao contem" },
  { value: "igual", label: "Igual a" },
  { value: "comeca_com", label: "Comeca com" },
  { value: "termina_com", label: "Termina com" },
  { value: "regex", label: "Expressao regular" },
]

const DDI_OPTIONS = [
  { value: "55", label: "Brasil (+55)", flag: "🇧🇷" },
  { value: "1", label: "EUA/Canada (+1)", flag: "🇺🇸" },
  { value: "351", label: "Portugal (+351)", flag: "🇵🇹" },
  { value: "54", label: "Argentina (+54)", flag: "🇦🇷" },
  { value: "56", label: "Chile (+56)", flag: "🇨🇱" },
  { value: "57", label: "Colombia (+57)", flag: "🇨🇴" },
  { value: "52", label: "Mexico (+52)", flag: "🇲🇽" },
  { value: "598", label: "Uruguai (+598)", flag: "🇺🇾" },
  { value: "595", label: "Paraguai (+595)", flag: "🇵🇾" },
  { value: "34", label: "Espanha (+34)", flag: "🇪🇸" },
  { value: "44", label: "Reino Unido (+44)", flag: "🇬🇧" },
  { value: "49", label: "Alemanha (+49)", flag: "🇩🇪" },
  { value: "33", label: "Franca (+33)", flag: "🇫🇷" },
  { value: "39", label: "Italia (+39)", flag: "🇮🇹" },
]

const STEPS = [
  { id: 1, title: "Basico", desc: "Nome e grupo" },
  { id: 2, title: "Quando", desc: "Evento e condicoes" },
  { id: 3, title: "Entao", desc: "Acao a executar" },
  { id: 4, title: "Revisar", desc: "Confirmar e salvar" },
]

export default function EditTriggerPage() {
  const router = useRouter()
  const params = useParams()
  const triggerId = params.id as string

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [agentes, setAgentes] = useState<AgenteIA[]>([])

  const [formData, setFormData] = useState<FormData>({
    nome: "",
    descricao: "",
    escopo: "todos",
    idGrupo: null,
    idCategoria: null,
    tipoEvento: "mensagem_texto",
    condicaoOperador: "AND",
    regras: [],
    tipoAcao: "enviar_mensagem",
    configAcao: {},
    prioridade: 100,
  })

  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user?.email) return

        const { data: usuarioSistema } = await supabase
          .from("usuarios_sistema")
          .select("id_organizacao")
          .eq("email", user.email)
          .single()

        if (!usuarioSistema?.id_organizacao) return

        const { data: gruposData } = await supabase
          .from("grupos")
          .select("id, nome")
          .eq("id_organizacao", usuarioSistema.id_organizacao)
          .eq("ativo", true)
          .order("nome")

        setGrupos(gruposData || [])

        const { data: categoriasData } = await supabase
          .from("categorias")
          .select("id, nome, cor")
          .eq("id_organizacao", usuarioSistema.id_organizacao)
          .eq("ativo", true)
          .order("nome")

        setCategorias(categoriasData || [])

        const { data: agentesData } = await supabase
          .from("agentes_ia")
          .select("id, nome, descricao")
          .eq("id_organizacao", usuarioSistema.id_organizacao)
          .eq("ativo", true)
          .order("nome")

        setAgentes(agentesData || [])

        const { data: gatilho, error } = await supabase
          .from("gatilhos")
          .select("*")
          .eq("id", Number(triggerId))
          .single()

        if (error || !gatilho) {
          toast.error("Gatilho nao encontrado")
          router.push("/triggers")
          return
        }

        const condicoes = gatilho.condicoes as { operador?: "AND" | "OR"; regras?: Regra[] }

        let escopo: EscopoGatilho = "todos"
        if (gatilho.id_categoria) {
          escopo = "categoria"
        } else if (gatilho.id_grupo) {
          escopo = "grupo"
        }

        setFormData({
          nome: gatilho.nome,
          descricao: gatilho.descricao || "",
          escopo,
          idGrupo: gatilho.id_grupo,
          idCategoria: gatilho.id_categoria,
          tipoEvento: gatilho.tipo_evento,
          condicaoOperador: condicoes?.operador || "AND",
          regras: condicoes?.regras || [],
          tipoAcao: gatilho.tipo_acao,
          configAcao: (gatilho.config_acao as Record<string, unknown>) || {},
          prioridade: gatilho.prioridade,
        })
      } catch (err) {
        console.error("Erro ao carregar dados:", err)
        toast.error("Erro ao carregar gatilho")
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [supabase, triggerId, router])

  const addRegra = () => {
    setFormData(prev => ({
      ...prev,
      regras: [...prev.regras, { campo: "conteudo_texto", operador: "contem", valor: "" }]
    }))
  }

  const removeRegra = (index: number) => {
    setFormData(prev => ({
      ...prev,
      regras: prev.regras.filter((_, i) => i !== index)
    }))
  }

  const updateRegra = (index: number, field: keyof Regra, value: string) => {
    setFormData(prev => ({
      ...prev,
      regras: prev.regras.map((r, i) => i === index ? { ...r, [field]: value } : r)
    }))
  }

  const updateConfigAcao = (key: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      configAcao: { ...prev.configAcao, [key]: value }
    }))
  }

  const validateStep = () => {
    switch (step) {
      case 1:
        return formData.nome.trim().length >= 3
      case 2:
        return formData.tipoEvento !== ""
      case 3:
        return formData.tipoAcao !== ""
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("gatilhos")
        .update({
          id_grupo: formData.escopo === "grupo" ? formData.idGrupo : null,
          id_categoria: formData.escopo === "categoria" ? formData.idCategoria : null,
          nome: formData.nome,
          descricao: formData.descricao || null,
          tipo_evento: formData.tipoEvento,
          condicoes: {
            operador: formData.condicaoOperador,
            regras: formData.regras,
          } as unknown as Json,
          tipo_acao: formData.tipoAcao,
          config_acao: formData.configAcao as unknown as Json,
          prioridade: formData.prioridade,
          dt_update: new Date().toISOString(),
        })
        .eq("id", Number(triggerId))

      if (error) throw error

      toast.success("Gatilho atualizado com sucesso!")
      router.push("/triggers")
    } catch (err) {
      console.error("Erro ao atualizar gatilho:", err)
      toast.error("Erro ao atualizar gatilho")
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="p-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </Card>
      </div>
    )
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="nome" className="text-sm">Nome do gatilho *</Label>
        <Input
          id="nome"
          placeholder="Ex: Anti-spam links"
          className="h-8 sm:h-9 text-sm"
          value={formData.nome}
          onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="descricao" className="text-sm">Descricao (opcional)</Label>
        <Textarea
          id="descricao"
          placeholder="Descreva o que este gatilho faz..."
          value={formData.descricao}
          onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
          className="min-h-[70px] text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Aplicar em</Label>
        <RadioGroup
          value={formData.escopo}
          onValueChange={(val: EscopoGatilho) => setFormData(prev => ({
            ...prev,
            escopo: val,
            idGrupo: val === "grupo" ? prev.idGrupo : null,
            idCategoria: val === "categoria" ? prev.idCategoria : null
          }))}
          className="space-y-1.5"
        >
          <div className="flex items-center space-x-2.5 p-2.5 sm:p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors">
            <RadioGroupItem value="todos" id="todos" />
            <Label htmlFor="todos" className="font-normal cursor-pointer flex-1 text-sm">
              Todos os grupos
            </Label>
          </div>
          <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors space-y-2">
            <div className="flex items-center space-x-2.5">
              <RadioGroupItem value="categoria" id="categoria" />
              <Label htmlFor="categoria" className="font-normal cursor-pointer flex-1 text-sm">
                Grupos de uma categoria
              </Label>
            </div>
            {formData.escopo === "categoria" && (
              <Select
                value={formData.idCategoria?.toString() || ""}
                onValueChange={(val) => setFormData(prev => ({ ...prev, idCategoria: Number(val) }))}
              >
                <SelectTrigger className="h-8 sm:h-9 text-sm ml-5">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.length > 0 ? (
                    categorias.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()} className="text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.cor }} />
                          {cat.nome}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      Nenhuma categoria
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors space-y-2">
            <div className="flex items-center space-x-2.5">
              <RadioGroupItem value="grupo" id="grupo" />
              <Label htmlFor="grupo" className="font-normal cursor-pointer flex-1 text-sm">
                Grupo especifico
              </Label>
            </div>
            {formData.escopo === "grupo" && (
              <Select
                value={formData.idGrupo?.toString() || ""}
                onValueChange={(val) => setFormData(prev => ({ ...prev, idGrupo: Number(val) }))}
              >
                <SelectTrigger className="h-8 sm:h-9 text-sm ml-5">
                  <SelectValue placeholder="Selecione um grupo" />
                </SelectTrigger>
                <SelectContent>
                  {grupos.length > 0 ? (
                    grupos.map(grupo => (
                      <SelectItem key={grupo.id} value={grupo.id.toString()} className="text-sm">
                        {grupo.nome}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      Nenhum grupo
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="prioridade" className="text-sm">Prioridade</Label>
        <Input
          id="prioridade"
          type="number"
          min={1}
          max={1000}
          className="h-8 sm:h-9 text-sm w-24"
          value={formData.prioridade}
          onChange={(e) => setFormData(prev => ({ ...prev, prioridade: Number(e.target.value) }))}
        />
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          Menor numero = maior prioridade
        </p>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Tipo de evento</Label>
        <div className="grid gap-2">
          {TIPOS_EVENTO.map(tipo => {
            const Icon = tipo.icon
            const selected = formData.tipoEvento === tipo.value
            return (
              <div
                key={tipo.value}
                onClick={() => setFormData(prev => ({ ...prev, tipoEvento: tipo.value }))}
                className={cn(
                  "flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg border cursor-pointer transition-all",
                  selected
                    ? "border-foreground bg-foreground/5"
                    : "border-border hover:border-foreground/50 hover:bg-muted/50"
                )}
              >
                <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-sm",
                    selected && "text-foreground"
                  )}>{tipo.label}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{tipo.desc}</p>
                </div>
                {selected && (
                  <div className="h-5 w-5 rounded-full bg-foreground flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-background" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Condicoes (opcional)</Label>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addRegra}>
            <Plus className="h-3 w-3 mr-1" />
            Adicionar
          </Button>
        </div>

        {formData.regras.length > 0 && (
          <>
            <RadioGroup
              value={formData.condicaoOperador}
              onValueChange={(val) => setFormData(prev => ({ ...prev, condicaoOperador: val as "AND" | "OR" }))}
              className="flex flex-wrap gap-3"
            >
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="AND" id="and" />
                <Label htmlFor="and" className="font-normal cursor-pointer text-xs sm:text-sm">Todas (E)</Label>
              </div>
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="OR" id="or" />
                <Label htmlFor="or" className="font-normal cursor-pointer text-xs sm:text-sm">Qualquer (OU)</Label>
              </div>
            </RadioGroup>

            <div className="space-y-2">
              {formData.regras.map((regra, index) => (
                <div key={index} className="p-2 sm:p-2.5 rounded-lg bg-muted/50 space-y-2 sm:space-y-0 sm:flex sm:gap-1.5 sm:items-center">
                  <div className="flex gap-1.5 flex-1">
                    <Select value={regra.campo} onValueChange={(val) => updateRegra(index, "campo", val)}>
                      <SelectTrigger className="h-7 sm:h-8 text-xs flex-1 sm:w-[130px] sm:flex-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CAMPOS_CONDICAO.map(c => (
                          <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={regra.operador} onValueChange={(val) => updateRegra(index, "operador", val)}>
                      <SelectTrigger className="h-7 sm:h-8 text-xs w-[100px] sm:w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERADORES_CONDICAO.map(o => (
                          <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-1.5 flex-1">
                    <Input
                      placeholder="Valor..."
                      value={regra.valor}
                      onChange={(e) => updateRegra(index, "valor", e.target.value)}
                      className="h-7 sm:h-8 text-xs flex-1"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" onClick={() => removeRegra(index)}>
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {formData.regras.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Sem condicoes, dispara para todas as mensagens do tipo selecionado.
          </p>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Acao a executar</Label>
        <div className="grid gap-2">
          {TIPOS_ACAO.map(tipo => {
            const Icon = tipo.icon
            const selected = formData.tipoAcao === tipo.value
            return (
              <div
                key={tipo.value}
                onClick={() => setFormData(prev => ({ ...prev, tipoAcao: tipo.value, configAcao: {} }))}
                className={cn(
                  "flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg border cursor-pointer transition-all",
                  selected
                    ? "border-foreground bg-foreground/5"
                    : "border-border hover:border-foreground/50 hover:bg-muted/50"
                )}
              >
                <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium text-sm", selected && "text-foreground")}>{tipo.label}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{tipo.desc}</p>
                </div>
                {selected && (
                  <div className="h-5 w-5 rounded-full bg-foreground flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-background" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t">
        <Label className="text-sm">Configuracao da acao</Label>

        {formData.tipoAcao === "enviar_mensagem" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Tipo de envio</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { value: "nova_mensagem", label: "Nova", icon: Send },
                  { value: "responder", label: "Responder", icon: Reply },
                  { value: "encaminhar", label: "Encaminhar", icon: Forward },
                ].map((tipo) => {
                  const Icon = tipo.icon
                  const selected = (formData.configAcao.tipo_envio as string || "nova_mensagem") === tipo.value
                  return (
                    <div
                      key={tipo.value}
                      onClick={() => updateConfigAcao("tipo_envio", tipo.value)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 sm:p-2.5 rounded-lg border cursor-pointer transition-all text-center",
                        selected ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/50 hover:bg-muted/50"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", selected ? "text-foreground" : "text-muted-foreground")} />
                      <span className={cn("text-xs font-medium", selected ? "text-foreground" : "text-muted-foreground")}>{tipo.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Enviar para</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { value: "mesmo_grupo", label: "Mesmo grupo", icon: MessageSquare },
                  { value: "outros_grupos", label: "Outros grupos", icon: MessagesSquare },
                  { value: "numero_whatsapp", label: "Numero", icon: Phone },
                ].map((destino) => {
                  const Icon = destino.icon
                  const selected = (formData.configAcao.destino as string || "mesmo_grupo") === destino.value
                  return (
                    <div
                      key={destino.value}
                      onClick={() => {
                        updateConfigAcao("destino", destino.value)
                        if (destino.value === "mesmo_grupo") {
                          updateConfigAcao("grupos_destino", [])
                          updateConfigAcao("numero_ddi", undefined)
                          updateConfigAcao("numero_telefone", undefined)
                        } else if (destino.value === "outros_grupos") {
                          updateConfigAcao("numero_ddi", undefined)
                          updateConfigAcao("numero_telefone", undefined)
                        } else if (destino.value === "numero_whatsapp") {
                          updateConfigAcao("grupos_destino", [])
                          if (!formData.configAcao.numero_ddi) {
                            updateConfigAcao("numero_ddi", "55")
                          }
                        }
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 sm:p-2.5 rounded-lg border cursor-pointer transition-all text-center",
                        selected ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/50 hover:bg-muted/50"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", selected ? "text-foreground" : "text-muted-foreground")} />
                      <span className={cn("text-xs font-medium", selected ? "text-foreground" : "text-muted-foreground")}>{destino.label}</span>
                    </div>
                  )
                })}
              </div>

              {(formData.configAcao.destino as string) === "outros_grupos" && (
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs text-muted-foreground">Grupos de destino</Label>
                  <div className="max-h-[150px] overflow-y-auto space-y-1 p-2 rounded-lg bg-muted/30 border">
                    {grupos.length > 0 ? (
                      grupos.map((grupo) => {
                        const gruposDestino = (formData.configAcao.grupos_destino as number[]) || []
                        const isSelected = gruposDestino.includes(grupo.id)
                        return (
                          <div
                            key={grupo.id}
                            className={cn("flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors", isSelected ? "bg-foreground/10" : "hover:bg-muted/50")}
                            onClick={() => {
                              const current = (formData.configAcao.grupos_destino as number[]) || []
                              if (isSelected) {
                                updateConfigAcao("grupos_destino", current.filter(id => id !== grupo.id))
                              } else {
                                updateConfigAcao("grupos_destino", [...current, grupo.id])
                              }
                            }}
                          >
                            <Checkbox checked={isSelected} className="h-3.5 w-3.5" />
                            <span className="text-xs truncate">{grupo.nome}</span>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-2">Nenhum grupo</p>
                    )}
                  </div>
                  {((formData.configAcao.grupos_destino as number[]) || []).length > 0 && (
                    <p className="text-[10px] text-muted-foreground">{((formData.configAcao.grupos_destino as number[]) || []).length} grupo(s)</p>
                  )}
                </div>
              )}

              {/* Campos para numero WhatsApp */}
              {(formData.configAcao.destino as string) === "numero_whatsapp" && (
                <div className="space-y-2 pt-1">
                  <Label className="text-xs text-muted-foreground">Numero de WhatsApp</Label>
                  <div className="flex gap-2">
                    <Select
                      value={(formData.configAcao.numero_ddi as string) || "55"}
                      onValueChange={(val) => updateConfigAcao("numero_ddi", val)}
                    >
                      <SelectTrigger className="h-8 sm:h-9 text-xs w-[140px] shrink-0">
                        <SelectValue placeholder="DDI" />
                      </SelectTrigger>
                      <SelectContent>
                        {DDI_OPTIONS.map((ddi) => (
                          <SelectItem key={ddi.value} value={ddi.value} className="text-xs">
                            <span className="flex items-center gap-1.5">
                              <span>{ddi.flag}</span>
                              <span>{ddi.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="DDD + Numero (ex: 11999999999)"
                      value={(formData.configAcao.numero_telefone as string) || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        updateConfigAcao("numero_telefone", value)
                      }}
                      className="h-8 sm:h-9 text-xs flex-1"
                      maxLength={11}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Digite apenas numeros: DDD (2 digitos) + Numero (8-9 digitos)
                  </p>
                  {(formData.configAcao.numero_ddi as string) && (formData.configAcao.numero_telefone as string) && (
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">
                        +{formData.configAcao.numero_ddi as string} {formData.configAcao.numero_telefone as string}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {(formData.configAcao.tipo_envio as string || "nova_mensagem") !== "encaminhar" && (
              <div className="space-y-1.5">
                <Label htmlFor="mensagem" className="text-xs text-muted-foreground">
                  {(formData.configAcao.tipo_envio as string) === "responder" ? "Resposta" : "Mensagem"}
                </Label>
                <Textarea
                  id="mensagem"
                  placeholder="Digite a mensagem..."
                  value={(formData.configAcao.mensagem as string) || ""}
                  onChange={(e) => updateConfigAcao("mensagem", e.target.value)}
                  className="min-h-[70px] text-sm"
                />
                <p className="text-[10px] text-muted-foreground">Use {"{nome}"} para autor, {"{grupo}"} para nome do grupo</p>
              </div>
            )}

            {(formData.configAcao.tipo_envio as string || "nova_mensagem") === "nova_mensagem" &&
             (formData.configAcao.destino as string || "mesmo_grupo") === "mesmo_grupo" && (
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted/50">
                <Checkbox id="mencionar" className="h-3.5 w-3.5" checked={(formData.configAcao.mencionar_autor as boolean) || false} onCheckedChange={(checked) => updateConfigAcao("mencionar_autor", checked)} />
                <Label htmlFor="mencionar" className="font-normal cursor-pointer text-xs">Mencionar autor</Label>
              </div>
            )}

            {(formData.configAcao.tipo_envio as string) === "encaminhar" && (
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-muted/50 border-l-2 border-foreground/30">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Encaminha a mensagem original mantendo conteudo.</p>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted/50">
                  <Checkbox id="enviar_introducao" className="h-3.5 w-3.5" checked={(formData.configAcao.enviar_introducao as boolean) || false} onCheckedChange={(checked) => updateConfigAcao("enviar_introducao", checked)} />
                  <Label htmlFor="enviar_introducao" className="font-normal cursor-pointer text-xs">Enviar introducao antes</Label>
                </div>
                {(formData.configAcao.enviar_introducao as boolean) && (
                  <div className="space-y-1.5 pl-4 border-l-2 border-foreground/20">
                    <Label htmlFor="mensagem_introducao" className="text-xs text-muted-foreground">Introducao</Label>
                    <Textarea
                      id="mensagem_introducao"
                      placeholder="Ex: Oportunidade do {grupo}!"
                      value={(formData.configAcao.mensagem_introducao as string) || ""}
                      onChange={(e) => updateConfigAcao("mensagem_introducao", e.target.value)}
                      className="min-h-[60px] text-sm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {formData.tipoAcao === "enviar_webhook" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="url" className="text-xs text-muted-foreground">URL do webhook</Label>
              <Input id="url" type="url" placeholder="https://..." className="h-8 sm:h-9 text-sm" value={(formData.configAcao.url as string) || ""} onChange={(e) => updateConfigAcao("url", e.target.value)} />
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted/50">
              <Checkbox id="incluir_mensagem" className="h-3.5 w-3.5" checked={(formData.configAcao.incluir_mensagem as boolean) !== false} onCheckedChange={(checked) => updateConfigAcao("incluir_mensagem", checked)} />
              <Label htmlFor="incluir_mensagem" className="font-normal cursor-pointer text-xs">Incluir dados da mensagem</Label>
            </div>
          </div>
        )}

        {formData.tipoAcao === "notificar_admin" && (
          <div className="space-y-1.5">
            <Label htmlFor="notificacao" className="text-xs text-muted-foreground">Mensagem de notificacao</Label>
            <Textarea id="notificacao" placeholder="Alerta: foi detectado..." value={(formData.configAcao.mensagem as string) || ""} onChange={(e) => updateConfigAcao("mensagem", e.target.value)} className="min-h-[70px] text-sm" />
          </div>
        )}

        {formData.tipoAcao === "acionar_bot" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Agente de IA</Label>
              {agentes.length > 0 ? (
                <Select value={(formData.configAcao.id_agente as number)?.toString() || ""} onValueChange={(val) => updateConfigAcao("id_agente", Number(val))}>
                  <SelectTrigger className="h-8 sm:h-9 text-sm">
                    <SelectValue placeholder="Escolha um agente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {agentes.map(agente => (
                      <SelectItem key={agente.id} value={agente.id.toString()} className="text-sm">{agente.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Card className="p-4 text-center">
                  <div className="mx-auto w-fit p-2.5 rounded-xl bg-muted mb-2">
                    <Bot className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Nenhum agente configurado</p>
                  <Link href="/ai">
                    <Button size="sm" className="h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Criar Agente
                    </Button>
                  </Link>
                </Card>
              )}
            </div>
            {agentes.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Precisa de outro?</p>
                <Link href="/ai">
                  <Button variant="outline" size="sm" className="h-6 text-[10px] sm:h-7 sm:text-xs">Gerenciar</Button>
                </Link>
              </div>
            )}
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted/50">
              <Checkbox id="responder_grupo" className="h-3.5 w-3.5" checked={(formData.configAcao.responder_no_grupo as boolean) !== false} onCheckedChange={(checked) => updateConfigAcao("responder_no_grupo", checked)} />
              <Label htmlFor="responder_grupo" className="font-normal cursor-pointer text-xs">Responder no grupo</Label>
            </div>
          </div>
        )}

        {formData.tipoAcao === "excluir_mensagem" && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted/50">
              <Checkbox id="notificar_autor" className="h-3.5 w-3.5" checked={(formData.configAcao.notificar_autor as boolean) || false} onCheckedChange={(checked) => updateConfigAcao("notificar_autor", checked)} />
              <Label htmlFor="notificar_autor" className="font-normal cursor-pointer text-xs">Avisar autor sobre remocao</Label>
            </div>
            {Boolean(formData.configAcao.notificar_autor) && (
              <div className="space-y-1.5 pl-4 border-l-2 border-foreground/20">
                <Label htmlFor="aviso" className="text-xs text-muted-foreground">Mensagem de aviso</Label>
                <Input id="aviso" placeholder="Mensagem removida por violar regras" className="h-8 sm:h-9 text-sm" value={(formData.configAcao.mensagem_aviso as string) || ""} onChange={(e) => updateConfigAcao("mensagem_aviso", e.target.value)} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  const renderStep4 = () => {
    const eventoInfo = TIPOS_EVENTO.find(t => t.value === formData.tipoEvento)
    const acaoInfo = TIPOS_ACAO.find(t => t.value === formData.tipoAcao)

    let escopoTexto = "Todos os grupos"
    let escopoCor: string | undefined
    if (formData.escopo === "categoria") {
      const cat = categorias.find(c => c.id === formData.idCategoria)
      escopoTexto = cat ? cat.nome : "Categoria nao encontrada"
      escopoCor = cat?.cor
    } else if (formData.escopo === "grupo") {
      escopoTexto = grupos.find(g => g.id === formData.idGrupo)?.nome || "Grupo nao encontrado"
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2.5 p-3 sm:p-4 rounded-lg bg-muted/50">
          <div className="p-2 sm:p-2.5 rounded-xl bg-foreground/10 shrink-0">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base truncate">{formData.nome}</h3>
            {formData.descricao && <p className="text-xs text-muted-foreground truncate">{formData.descricao}</p>}
          </div>
        </div>

        <div className="grid gap-2 grid-cols-2">
          <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Aplicar em</p>
            <div className="flex items-center gap-1.5">
              {escopoCor && <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: escopoCor }} />}
              <p className="font-medium text-xs sm:text-sm truncate">{escopoTexto}</p>
            </div>
          </div>
          <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Evento</p>
            <div className="flex items-center gap-1.5">
              {eventoInfo && <eventoInfo.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
              <p className="font-medium text-xs sm:text-sm truncate">{eventoInfo?.label}</p>
            </div>
          </div>
          <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Acao</p>
            <div className="flex items-center gap-1.5">
              {acaoInfo && <acaoInfo.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
              <p className="font-medium text-xs sm:text-sm truncate">{acaoInfo?.label}</p>
            </div>
          </div>
          <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Prioridade</p>
            <p className="font-medium text-xs sm:text-sm">{formData.prioridade}</p>
          </div>
        </div>

        {formData.regras.length > 0 && (
          <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5">Condicoes:</p>
            <div className="flex flex-wrap gap-1">
              {formData.regras.map((regra, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                  {regra.campo} {regra.operador} &quot;{regra.valor}&quot;
                </Badge>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {formData.condicaoOperador === "AND" ? "Todas verdadeiras" : "Qualquer uma"}
            </p>
          </div>
        )}

        {/* Detalhes da ação de enviar mensagem */}
        {formData.tipoAcao === "enviar_mensagem" && (
          <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50 space-y-2">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Config do envio:</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5">
                {(formData.configAcao.tipo_envio as string || "nova_mensagem") === "nova_mensagem" && <Send className="h-3.5 w-3.5 text-muted-foreground" />}
                {(formData.configAcao.tipo_envio as string) === "responder" && <Reply className="h-3.5 w-3.5 text-muted-foreground" />}
                {(formData.configAcao.tipo_envio as string) === "encaminhar" && <Forward className="h-3.5 w-3.5 text-muted-foreground" />}
                <span className="text-xs">
                  {(formData.configAcao.tipo_envio as string || "nova_mensagem") === "nova_mensagem" && "Nova"}
                  {(formData.configAcao.tipo_envio as string) === "responder" && "Responder"}
                  {(formData.configAcao.tipo_envio as string) === "encaminhar" && "Encaminhar"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {(formData.configAcao.destino as string || "mesmo_grupo") === "mesmo_grupo" && (
                  <>
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs">Mesmo grupo</span>
                  </>
                )}
                {(formData.configAcao.destino as string) === "outros_grupos" && (
                  <>
                    <MessagesSquare className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs">{((formData.configAcao.grupos_destino as number[]) || []).length} grupo(s)</span>
                  </>
                )}
                {(formData.configAcao.destino as string) === "numero_whatsapp" && (
                  <>
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs">
                      +{formData.configAcao.numero_ddi as string} {formData.configAcao.numero_telefone as string}
                    </span>
                  </>
                )}
              </div>
            </div>
            {(formData.configAcao.tipo_envio as string || "nova_mensagem") !== "encaminhar" && (formData.configAcao.mensagem as string) && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-[10px] text-muted-foreground mb-1">Mensagem:</p>
                <p className="text-xs bg-background/50 p-1.5 rounded line-clamp-2">{formData.configAcao.mensagem as string}</p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/triggers">
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">Editar Gatilho</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Modifique a configuracao</p>
        </div>
      </div>

      <Card className="p-2.5 sm:p-3">
        <div className="flex items-center gap-1 sm:gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={cn(
                "flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium transition-all",
                step > s.id ? "bg-foreground text-background" : step === s.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
              )}>
                {step > s.id ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : s.id}
              </div>
              <div className="ml-1.5 sm:ml-2 hidden sm:block">
                <p className={cn("text-xs sm:text-sm font-medium", step >= s.id ? "text-foreground" : "text-muted-foreground")}>{s.title}</p>
              </div>
              {i < STEPS.length - 1 && <div className={cn("flex-1 h-0.5 sm:h-1 mx-1.5 sm:mx-2 rounded-full transition-all", step > s.id ? "bg-foreground" : "bg-muted")} />}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg">{STEPS[step - 1].title}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{STEPS[step - 1].desc}</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </CardContent>
      </Card>

      <div className="flex justify-between gap-2">
        <Button variant="outline" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm" onClick={() => setStep(s => s - 1)} disabled={step === 1}>
          <ArrowLeft className="h-3.5 w-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline">Voltar</span>
        </Button>

        {step < 4 ? (
          <Button size="sm" className="h-8 sm:h-9 text-xs sm:text-sm" onClick={() => setStep(s => s + 1)} disabled={!validateStep()}>
            <span className="hidden sm:inline">Proximo</span>
            <span className="sm:hidden">Avançar</span>
            <ArrowRight className="h-3.5 w-3.5 sm:ml-1.5" />
          </Button>
        ) : (
          <Button size="sm" className="h-8 sm:h-9 text-xs sm:text-sm" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin sm:mr-1.5" />
                <span className="hidden sm:inline">Salvando...</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Salvar</span>
                <span className="sm:hidden">Salvar</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
