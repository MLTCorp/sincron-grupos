"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { CategoriaEnriquecida } from "@/types/categoria"

const CORES_PREDEFINIDAS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6",
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  "#f43f5e", "#64748b", "#71717a", "#78716c", "#0a0a0a"
]

interface CategoryGeneralTabProps {
  categoria: CategoriaEnriquecida
  onUpdate: () => void
  onClose: () => void
}

export function CategoryGeneralTab({ categoria, onUpdate, onClose }: CategoryGeneralTabProps) {
  const [formData, setFormData] = useState({
    nome: categoria.nome,
    cor: categoria.cor,
    descricao: categoria.descricao || ""
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("categorias")
        .update({
          nome: formData.nome,
          cor: formData.cor,
          descricao: formData.descricao || null,
          dt_update: new Date().toISOString()
        })
        .eq("id", categoria.id)

      if (error) throw error

      toast.success("Categoria atualizada!")
      onUpdate()
      onClose()
    } catch (err) {
      console.error(err)
      toast.error("Erro ao atualizar categoria")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Conteúdo com scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4 sm:p-6 pb-20 sm:pb-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-sm font-medium">Nome</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Vendas, Suporte..."
              className="h-10"
            />
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Cor da categoria</Label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mt-2">
              {CORES_PREDEFINIDAS.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setFormData({ ...formData, cor })}
                  className={cn(
                    "w-full aspect-square rounded-lg transition-all hover:scale-110",
                    formData.cor === cor && "ring-2 ring-offset-2 ring-primary scale-110"
                  )}
                  style={{ backgroundColor: cor }}
                  title={cor}
                />
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-sm font-medium">
              Descrição <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Breve descrição da categoria"
              className="h-10"
            />
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Preview</Label>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: formData.cor }}
              />
              <Badge
                variant="secondary"
                className="text-xs"
                style={{
                  backgroundColor: formData.cor,
                  color: "#fff",
                  borderColor: formData.cor
                }}
              >
                {formData.nome || "Nome da categoria"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Botões fixos no rodapé mobile */}
      <div className="sticky bottom-0 left-0 right-0 bg-background border-t p-3 sm:p-4 flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onClose}
          className="h-9 sm:h-10"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !formData.nome}
          className="h-9 sm:h-10"
        >
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  )
}
