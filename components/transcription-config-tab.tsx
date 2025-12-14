"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { AudioLines } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { ConfigTranscricao, ModoTranscricao, TipoTranscricao } from "@/types/categoria"

const MODOS = [
  { value: "desativado" as const, label: "Desativado", desc: "Nenhuma transcrição" },
  { value: "automatico" as const, label: "Automático", desc: "Transcreve todos os áudios" },
  { value: "manual" as const, label: "Manual", desc: "Apenas com reação" }
]

const TIPOS = [
  { value: "simples" as const, label: "Simples", desc: "Apenas transcrição" },
  { value: "com_resumo" as const, label: "Com Resumo", desc: "Transcrição + resumo" }
]

interface TranscriptionConfigTabProps {
  idCategoria: number
  config?: ConfigTranscricao
  onUpdate: () => void
}

export function TranscriptionConfigTab({ idCategoria, config, onUpdate }: TranscriptionConfigTabProps) {
  const [modo, setModo] = useState<ModoTranscricao>(config?.modo || "desativado")
  const [tipo, setTipo] = useState<TipoTranscricao>(config?.tipo_transcricao || "simples")
  const [emoji, setEmoji] = useState(config?.emoji_gatilho || "✍️")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      const { data: usuarioSistema } = await supabase
        .from("usuarios_sistema")
        .select("id_organizacao")
        .eq("email", user.email)
        .single()

      if (!usuarioSistema) return

      if (config?.id) {
        // Atualizar existente
        const { error } = await supabase
          .from("config_transcricao")
          .update({ modo, tipo_transcricao: tipo, emoji_gatilho: emoji })
          .eq("id", config.id)

        if (error) throw error
      } else {
        // Criar novo
        const { error } = await supabase
          .from("config_transcricao")
          .insert({
            id_organizacao: usuarioSistema.id_organizacao,
            id_categoria: idCategoria,
            modo,
            tipo_transcricao: tipo,
            emoji_gatilho: emoji
          })

        if (error) throw error
      }

      toast.success("Configuração de transcrição salva!")
      onUpdate()
    } catch (err) {
      console.error(err)
      toast.error("Erro ao salvar configuração")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Conteúdo com scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-5 p-4 sm:p-6 pb-20 sm:pb-6">
          {/* Modo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Modo de Transcrição</Label>
            <Select value={modo} onValueChange={(v) => setModo(v as ModoTranscricao)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODOS.map(m => (
                  <SelectItem key={m.value} value={m.value}>
                    <div className="py-1">
                      <div className="font-medium text-sm">{m.label}</div>
                      <div className="text-xs text-muted-foreground">{m.desc}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo (só aparece se modo != desativado) */}
          {modo !== "desativado" && (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tipo de Transcrição</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as TipoTranscricao)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="py-1">
                          <div className="font-medium text-sm">{t.label}</div>
                          <div className="text-xs text-muted-foreground">{t.desc}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {modo === "manual" && (
                <div className="space-y-2">
                  <Label htmlFor="emoji" className="text-sm font-medium">Emoji Gatilho</Label>
                  <Input
                    id="emoji"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    placeholder="✍️"
                    className="h-10 text-2xl text-center"
                    maxLength={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    Reaja com este emoji para transcrever o áudio
                  </p>
                </div>
              )}
            </>
          )}

          {/* Info card */}
          {modo !== "desativado" && (
            <div className="rounded-lg bg-muted/50 p-3 sm:p-4">
              <div className="flex items-start gap-2">
                <AudioLines className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-medium">Como funciona:</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                    {modo === "automatico" && (
                      <li>Todos os áudios serão transcritos automaticamente</li>
                    )}
                    {modo === "manual" && (
                      <li>Reaja ao áudio com {emoji || "o emoji configurado"} para transcrever</li>
                    )}
                    {tipo === "com_resumo" && (
                      <li>Além da transcrição, um resumo será gerado</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botão fixo no rodapé mobile */}
      <div className="sticky bottom-0 left-0 right-0 bg-background border-t p-3 sm:p-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-9 sm:h-10 min-w-[120px]"
        >
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  )
}
