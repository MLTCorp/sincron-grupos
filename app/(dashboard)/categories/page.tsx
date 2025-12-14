"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tags, Plus, Trash2, Loader2, AlertTriangle, Settings2, AudioLines, Zap, Users, BookOpen, MessageSquare } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { PermissionGate } from "@/components/permission-gate"
import { cn } from "@/lib/utils"
import { CategoryConfigDialog } from "@/components/category-config-dialog"
import type { CategoriaEnriquecida } from "@/types/categoria"
import { PageHeader, EmptyState } from "@/components/dashboard"

interface Categoria {
  id: number
  nome: string
  cor: string
  descricao: string | null
  ativo: boolean | null
  _count?: {
    grupos: number
  }
}

// Colorful palette for categories
const CORES_PREDEFINIDAS = [
  // Row 1 - Vibrant colors
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#eab308", // Yellow
  "#84cc16", // Lime
  "#22c55e", // Green
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#0ea5e9", // Sky
  "#3b82f6", // Blue
  // Row 2 - More colors
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#a855f7", // Purple
  "#d946ef", // Fuchsia
  "#ec4899", // Pink
  "#f43f5e", // Rose
  // Row 3 - Darker/muted
  "#64748b", // Slate
  "#71717a", // Zinc
  "#78716c", // Stone
  "#0a0a0a", // Black
]

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<CategoriaEnriquecida[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    cor: "#3b82f6",
    descricao: "",
  })
  const [saving, setSaving] = useState(false)

  // Config dialog state
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [configuringCategoria, setConfiguringCategoria] = useState<CategoriaEnriquecida | null>(null)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoriaToDelete, setCategoriaToDelete] = useState<CategoriaEnriquecida | null>(null)
  const [deleteOption, setDeleteOption] = useState<"remove" | "keep">("keep")
  const [deleting, setDeleting] = useState(false)

  const supabase = createClient()

  const loadCategorias = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      const { data: usuarioSistema } = await supabase
        .from("usuarios_sistema")
        .select("id_organizacao")
        .eq("email", user.email)
        .single()

      if (!usuarioSistema) return

      // Query enriquecida com config_transcricao e gatilhos
      const { data, error } = await supabase
        .from("categorias")
        .select(`
          *,
          config_transcricao!config_transcricao_id_categoria_fkey (
            id,
            modo,
            tipo_transcricao,
            emoji_gatilho
          ),
          gatilhos!gatilhos_id_categoria_fkey (
            id,
            ativo
          )
        `)
        .eq("id_organizacao", usuarioSistema.id_organizacao)
        .is("config_transcricao.id_grupo", null)
        .order("ordem", { ascending: true })

      if (error) throw error

      // Buscar contagem de grupos por categoria
      const { data: grupos } = await supabase
        .from("grupos")
        .select("id_categoria")
        .eq("id_organizacao", usuarioSistema.id_organizacao)

      const contagem: Record<number, number> = {}
      grupos?.forEach((g) => {
        if (g.id_categoria) {
          contagem[g.id_categoria] = (contagem[g.id_categoria] || 0) + 1
        }
      })

      // Enriquecer categorias com contagem e flags
      const categoriasEnriquecidas: CategoriaEnriquecida[] = data?.map((cat: any) => ({
        ...cat,
        _count: {
          grupos: contagem[cat.id] || 0,
          gatilhos: cat.gatilhos?.length || 0,
          gatilhosAtivos: cat.gatilhos?.filter((g: any) => g.ativo).length || 0
        },
        hasTranscription: cat.config_transcricao?.[0]?.modo !== 'desativado' && !!cat.config_transcricao?.[0]
      })) || []

      setCategorias(categoriasEnriquecidas)
    } catch (err) {
      console.error("Erro ao carregar categorias:", err)
      toast.error("Erro ao carregar categorias")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategorias()
  }, [])

  const handleOpenDialog = (categoria?: Categoria) => {
    if (categoria) {
      setEditingCategoria(categoria)
      setFormData({
        nome: categoria.nome,
        cor: categoria.cor,
        descricao: categoria.descricao || "",
      })
    } else {
      setEditingCategoria(null)
      setFormData({ nome: "", cor: "#3b82f6", descricao: "" })
    }
    setDialogOpen(true)
  }

  const handleOpenConfigDialog = (categoria: CategoriaEnriquecida) => {
    setConfiguringCategoria(categoria)
    setConfigDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast.error("Nome da categoria e obrigatorio")
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

      if (!usuarioSistema) return

      if (editingCategoria) {
        // Atualizar
        const { error } = await supabase
          .from("categorias")
          .update({
            nome: formData.nome,
            cor: formData.cor,
            descricao: formData.descricao || null,
          })
          .eq("id", editingCategoria.id)

        if (error) throw error
        toast.success("Categoria atualizada com sucesso")
      } else {
        // Criar
        const { error } = await supabase.from("categorias").insert({
          id_organizacao: usuarioSistema.id_organizacao,
          nome: formData.nome,
          cor: formData.cor,
          descricao: formData.descricao || null,
          ordem: categorias.length,
        })

        if (error) throw error
        toast.success("Categoria criada com sucesso")
      }

      setDialogOpen(false)
      loadCategorias()
    } catch (err) {
      console.error("Erro ao salvar categoria:", err)
      toast.error("Erro ao salvar categoria")
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDeleteDialog = (categoria: CategoriaEnriquecida) => {
    setCategoriaToDelete(categoria)
    setDeleteOption("keep")
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!categoriaToDelete) return

    setDeleting(true)
    try {
      const hasGroups = categoriaToDelete._count?.grupos && categoriaToDelete._count.grupos > 0

      if (hasGroups) {
        if (deleteOption === "remove") {
          // Remover grupos da categoria (usando a nova tabela N:N)
          await supabase
            .from("grupos_categorias")
            .delete()
            .eq("id_categoria", categoriaToDelete.id)

          // Também limpar o campo legado id_categoria
          await supabase
            .from("grupos")
            .update({ id_categoria: null })
            .eq("id_categoria", categoriaToDelete.id)
        } else {
          // Manter grupos sem categoria - mesma logica
          await supabase
            .from("grupos_categorias")
            .delete()
            .eq("id_categoria", categoriaToDelete.id)

          await supabase
            .from("grupos")
            .update({ id_categoria: null })
            .eq("id_categoria", categoriaToDelete.id)
        }
      }

      // Deletar a categoria
      const { error } = await supabase
        .from("categorias")
        .delete()
        .eq("id", categoriaToDelete.id)

      if (error) throw error

      toast.success("Categoria excluida com sucesso")
      setDeleteDialogOpen(false)
      setCategoriaToDelete(null)
      loadCategorias()
    } catch (err) {
      console.error("Erro ao excluir categoria:", err)
      toast.error("Erro ao excluir categoria")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias"
        description="Organize seus grupos por categorias"
        actions={
          <PermissionGate permission="gerenciar_categorias">
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </PermissionGate>
        }
      />

      {/* Dialog de criacao/edicao */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base sm:text-lg">
              {editingCategoria ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {editingCategoria
                ? "Atualize as informacoes"
                : "Crie uma categoria para organizar grupos"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="nome" className="text-sm">Nome</Label>
              <Input
                id="nome"
                placeholder="Ex: Vendas, Suporte"
                className="h-8 sm:h-9 text-sm"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Cor</Label>
              <div className="flex flex-wrap gap-1.5">
                {CORES_PREDEFINIDAS.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    className={cn(
                      "h-7 w-7 sm:h-8 sm:w-8 rounded-full transition-all hover:scale-110 border border-border",
                      formData.cor === cor
                        ? "ring-2 ring-offset-1 ring-offset-background ring-foreground scale-110"
                        : ""
                    )}
                    style={{ backgroundColor: cor }}
                    onClick={() => setFormData({ ...formData, cor })}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descricao" className="text-sm">Descricao (opcional)</Label>
              <Input
                id="descricao"
                placeholder="Breve descricao"
                className="h-8 sm:h-9 text-sm"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
              />
            </div>

            <div className="rounded-lg bg-muted/50 p-2.5 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Preview:</span>
              <Badge
                variant="secondary"
                className="text-white text-xs"
                style={{ backgroundColor: formData.cor }}
              >
                {formData.nome || "Categoria"}
              </Badge>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="h-8"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lista de Categorias */}
      {categorias.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Nenhuma categoria criada"
          description="Crie categorias para organizar seus grupos do WhatsApp"
          action={{ label: "Nova Categoria", onClick: () => handleOpenDialog(), icon: Plus }}
          secondaryActions={[
            {
              icon: Users,
              title: "Adicionar Grupos",
              description: "Primeiro adicione grupos do WhatsApp",
              href: "/groups",
            },
            {
              icon: Zap,
              title: "Configurar Gatilhos",
              description: "Automatize acoes nos grupos",
              href: "/triggers",
            },
          ]}
        />
      ) : (
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-2">
            <div className="flex items-center gap-2">
              <Tags className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm sm:text-base font-medium">Suas Categorias</CardTitle>
              <Badge variant="secondary" className="text-[10px] ml-auto">
                {categorias.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {categorias.map((categoria) => (
                <div
                  key={categoria.id}
                  className="px-3 sm:px-4 py-2.5 hover:bg-muted/30 transition-colors group/item"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-muted shrink-0">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: categoria.cor }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {categoria.nome}
                      </p>
                      {categoria.descricao && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {categoria.descricao}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
                      {/* Badge: Transcrição */}
                      {categoria.hasTranscription && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 gap-1">
                          <AudioLines className="h-3 w-3" />
                          <span className="hidden sm:inline">
                            {categoria.config_transcricao?.[0]?.modo === 'automatico' ? 'Auto' : 'Manual'}
                            {categoria.config_transcricao?.[0]?.tipo_transcricao === 'com_resumo' && ' + Resumo'}
                          </span>
                        </Badge>
                      )}
                      {/* Badge: Gatilhos */}
                      {categoria._count.gatilhosAtivos > 0 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 gap-1">
                          <Zap className="h-3 w-3" />
                          <span className="hidden sm:inline">
                            {categoria._count.gatilhosAtivos}
                          </span>
                        </Badge>
                      )}
                      {/* Badge: Grupos */}
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-1">
                        <Users className="h-3 w-3" />
                        <span className="hidden sm:inline">
                          {categoria._count?.grupos || 0}
                        </span>
                      </Badge>
                      <PermissionGate permission="gerenciar_categorias">
                        <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover/item:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleOpenConfigDialog(categoria)}
                            title="Configurar categoria"
                          >
                            <Settings2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleOpenDeleteDialog(categoria)}
                            title="Excluir categoria"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </PermissionGate>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de confirmacao de exclusao */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Excluir Categoria
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Excluir &quot;{categoriaToDelete?.nome}&quot;
            </DialogDescription>
          </DialogHeader>

          {categoriaToDelete?._count?.grupos && categoriaToDelete._count.grupos > 0 ? (
            <div className="space-y-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Possui <strong>{categoriaToDelete._count.grupos} grupo(s)</strong> vinculado(s).
                </p>
              </div>

              <RadioGroup
                value={deleteOption}
                onValueChange={(val) => setDeleteOption(val as "remove" | "keep")}
                className="space-y-2"
              >
                <div className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors">
                  <RadioGroupItem value="keep" id="keep" className="mt-0.5" />
                  <div>
                    <Label htmlFor="keep" className="font-medium text-sm cursor-pointer">
                      Manter grupos sem categoria
                    </Label>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Grupos permanecem no sistema
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors">
                  <RadioGroupItem value="remove" id="remove" className="mt-0.5" />
                  <div>
                    <Label htmlFor="remove" className="font-medium text-sm cursor-pointer">
                      Remover vinculo
                    </Label>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Desvincular grupos (mesmo efeito)
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          ) : (
            <div className="py-2">
              <p className="text-xs text-muted-foreground">
                Sem grupos vinculados. Confirma exclusao?
              </p>
            </div>
          )}

          <DialogFooter className="pt-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Excluir
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de configuração avançada */}
      {configuringCategoria && (
        <CategoryConfigDialog
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          categoria={configuringCategoria}
          onUpdate={loadCategorias}
        />
      )}
    </div>
  )
}
