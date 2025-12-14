"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Users,
  Plus,
  Check,
  Search,
  Loader2,
  Pencil,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Tags,
  Zap,
  Smartphone,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { GroupsTable } from "@/components/command-center/groups-table"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PageHeader, EmptyState } from "@/components/dashboard"
import Link from "next/link"

interface WhatsAppGroup {
  id: string
  name: string
  picture?: string | null
  participants?: number
  description?: string | null
}

interface Categoria {
  id: number
  nome: string
  cor: string
}

interface GrupoCadastrado {
  id: number
  chat_id_whatsapp: string
  nome: string
  foto_url?: string | null
  id_categoria?: number | null
  ativo: boolean
  categorias?: number[] // IDs das categorias (tabela N:N)
}

export default function GroupsPage() {
  const [whatsappGroups, setWhatsappGroups] = useState<WhatsAppGroup[]>([])
  const [gruposCadastrados, setGruposCadastrados] = useState<GrupoCadastrado[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [instanceToken, setInstanceToken] = useState<string | null>(null)
  const [instanceId, setInstanceId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Modal state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Record<string, number[]>>({})
  const [saving, setSaving] = useState(false)
  const [searchFilter, setSearchFilter] = useState("")

  // Edit group state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<GrupoCadastrado | null>(null)
  const [editGroupCategories, setEditGroupCategories] = useState<number[]>([])
  const [savingEdit, setSavingEdit] = useState(false)

  // Delete group state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<GrupoCadastrado | null>(null)
  const [deletingGroup, setDeletingGroup] = useState(false)

  const supabase = createClient()

  // Carregar dados iniciais
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

      // Buscar instancia conectada
      const { data: instancia } = await supabase
        .from("instancias_whatsapp")
        .select("id, api_key, status")
        .eq("id_organizacao", usuarioSistema.id_organizacao)
        .eq("status", "conectado")
        .single()

      if (instancia?.api_key) {
        setInstanceToken(instancia.api_key)
        setInstanceId(instancia.id)
        setIsConnected(true)
      }

      // Buscar categorias
      const { data: cats } = await supabase
        .from("categorias")
        .select("id, nome, cor")
        .eq("id_organizacao", usuarioSistema.id_organizacao)
        .eq("ativo", true)
        .order("ordem", { ascending: true })

      setCategorias(cats || [])

      // Buscar grupos ja cadastrados
      const { data: grupos } = await supabase
        .from("grupos")
        .select("*")
        .eq("id_organizacao", usuarioSistema.id_organizacao)
        .order("nome", { ascending: true })

      // Buscar categorias dos grupos (tabela N:N)
      const { data: gruposCategorias } = await supabase
        .from("grupos_categorias")
        .select("id_grupo, id_categoria")

      // Mapear categorias por grupo
      const categoriasPorGrupo: Record<number, number[]> = {}
      gruposCategorias?.forEach(gc => {
        if (!categoriasPorGrupo[gc.id_grupo]) {
          categoriasPorGrupo[gc.id_grupo] = []
        }
        categoriasPorGrupo[gc.id_grupo].push(gc.id_categoria)
      })

      // Adicionar categorias aos grupos
      const gruposComCategorias = grupos?.map(g => ({
        ...g,
        categorias: categoriasPorGrupo[g.id] || (g.id_categoria ? [g.id_categoria] : [])
      })) || []

      setGruposCadastrados(gruposComCategorias)
    } catch (err) {
      console.error("Erro ao carregar dados:", err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Buscar grupos do WhatsApp
  const fetchWhatsAppGroups = useCallback(async (showRefresh = false) => {
    if (!instanceToken) return

    if (showRefresh) {
      setIsRefreshing(true)
    } else {
      setLoadingGroups(true)
    }

    try {
      const response = await fetch(`/api/uazapi/instances/${instanceToken}/groups`)
      if (!response.ok) throw new Error("Falha ao buscar grupos")

      const data = await response.json()
      setWhatsappGroups(data.groups || [])
      if (showRefresh) {
        toast.success("Grupos atualizados!")
      }
    } catch (err) {
      console.error("Erro ao buscar grupos:", err)
      toast.error("Erro ao buscar grupos do WhatsApp")
    } finally {
      setLoadingGroups(false)
      setIsRefreshing(false)
    }
  }, [instanceToken])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (instanceToken) {
      fetchWhatsAppGroups()
    }
  }, [instanceToken, fetchWhatsAppGroups])

  // Grupos nao cadastrados (para mostrar na previa)
  const gruposNaoCadastrados = whatsappGroups.filter(
    (g) => !gruposCadastrados.some((gc) => gc.chat_id_whatsapp === g.id)
  )

  // Contagens para tabs
  const withCategoryCount = gruposCadastrados.filter(g =>
    (g.categorias && g.categorias.length > 0) || g.id_categoria
  ).length
  const withoutCategoryCount = gruposCadastrados.filter(g =>
    !g.categorias || g.categorias.length === 0
  ).length

  // Toggle selecao de grupo
  const toggleGroupSelection = (groupId: string) => {
    const newSelected = new Set(selectedGroups)
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId)
      const newCategories = { ...selectedCategories }
      delete newCategories[groupId]
      setSelectedCategories(newCategories)
    } else {
      newSelected.add(groupId)
    }
    setSelectedGroups(newSelected)
  }

  // Toggle categoria para grupo (multiplas)
  const toggleCategoryForGroup = (groupId: string, categoryId: number) => {
    const current = selectedCategories[groupId] || []
    if (current.includes(categoryId)) {
      setSelectedCategories({
        ...selectedCategories,
        [groupId]: current.filter(id => id !== categoryId)
      })
    } else {
      setSelectedCategories({
        ...selectedCategories,
        [groupId]: [...current, categoryId]
      })
    }
  }

  // Salvar grupos selecionados
  const handleSaveGroups = async () => {
    if (selectedGroups.size === 0) {
      toast.error("Selecione pelo menos um grupo")
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

      // Primeiro, inserir os grupos
      const gruposParaSalvar = Array.from(selectedGroups).map((groupId) => {
        const group = whatsappGroups.find((g) => g.id === groupId)!
        const cats = selectedCategories[groupId] || []
        return {
          id_organizacao: usuarioSistema.id_organizacao,
          id_instancia: instanceId, // Vincula o grupo a instancia conectada
          chat_id_whatsapp: groupId,
          nome: group.name,
          id_categoria: cats.length > 0 ? cats[0] : null, // Campo legado
          ativo: true,
        }
      })

      const { data: gruposInseridos, error } = await supabase
        .from("grupos")
        .insert(gruposParaSalvar)
        .select("id, chat_id_whatsapp")

      if (error) {
        console.error("Supabase error details:", JSON.stringify(error, null, 2))
        throw new Error(error.message || "Erro ao inserir grupos")
      }

      // Depois, inserir as relacoes N:N com categorias
      if (gruposInseridos) {
        const relacoes: { id_grupo: number; id_categoria: number }[] = []
        gruposInseridos.forEach(grupo => {
          const cats = selectedCategories[grupo.chat_id_whatsapp] || []
          cats.forEach(catId => {
            relacoes.push({ id_grupo: grupo.id, id_categoria: catId })
          })
        })

        if (relacoes.length > 0) {
          await supabase.from("grupos_categorias").insert(relacoes)
        }
      }

      toast.success(`${gruposParaSalvar.length} grupo(s) cadastrado(s) com sucesso!`)
      setDialogOpen(false)
      setSelectedGroups(new Set())
      setSelectedCategories({})
      loadData()
    } catch (err) {
      console.error("Erro ao salvar grupos:", err)
      toast.error("Erro ao cadastrar grupos")
    } finally {
      setSaving(false)
    }
  }

  // Abrir dialog de edicao
  const handleOpenEditDialog = (grupo: GrupoCadastrado) => {
    setEditingGroup(grupo)
    setEditGroupCategories(grupo.categorias || (grupo.id_categoria ? [grupo.id_categoria] : []))
    setEditDialogOpen(true)
  }

  // Toggle categoria no grupo em edicao
  const toggleEditCategory = (catId: number) => {
    setEditGroupCategories(prev => {
      if (prev.includes(catId)) {
        return prev.filter(id => id !== catId)
      } else {
        return [...prev, catId]
      }
    })
  }

  // Salvar edicao do grupo
  const handleSaveEdit = async () => {
    if (!editingGroup) return

    setSavingEdit(true)
    try {
      // Primeiro, remover todas as categorias antigas
      await supabase
        .from("grupos_categorias")
        .delete()
        .eq("id_grupo", editingGroup.id)

      // Inserir novas categorias
      if (editGroupCategories.length > 0) {
        await supabase
          .from("grupos_categorias")
          .insert(editGroupCategories.map(catId => ({
            id_grupo: editingGroup.id,
            id_categoria: catId
          })))
      }

      // Atualizar o campo legado id_categoria (pegar a primeira categoria ou null)
      await supabase
        .from("grupos")
        .update({ id_categoria: editGroupCategories[0] || null })
        .eq("id", editingGroup.id)

      toast.success("Grupo atualizado com sucesso!")
      setEditDialogOpen(false)
      setEditingGroup(null)
      loadData()
    } catch (err) {
      console.error("Erro ao atualizar grupo:", err)
      toast.error("Erro ao atualizar grupo")
    } finally {
      setSavingEdit(false)
    }
  }

  // Abrir dialog de exclusao
  const handleOpenDeleteDialog = (grupo: GrupoCadastrado) => {
    setGroupToDelete(grupo)
    setDeleteDialogOpen(true)
  }

  // Excluir grupo
  const handleDeleteGroup = async () => {
    if (!groupToDelete) return

    setDeletingGroup(true)
    try {
      // Remover categorias do grupo
      await supabase
        .from("grupos_categorias")
        .delete()
        .eq("id_grupo", groupToDelete.id)

      // Excluir o grupo
      const { error } = await supabase
        .from("grupos")
        .delete()
        .eq("id", groupToDelete.id)

      if (error) throw error

      toast.success("Grupo excluido com sucesso!")
      setDeleteDialogOpen(false)
      setGroupToDelete(null)
      loadData()
    } catch (err) {
      console.error("Erro ao excluir grupo:", err)
      toast.error("Erro ao excluir grupo")
    } finally {
      setDeletingGroup(false)
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
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grupos"
        description="Gerencie os grupos do WhatsApp"
        tabs={[
          { label: "Todos", value: "all", count: gruposCadastrados.length },
          { label: "Categorizados", value: "with-category", count: withCategoryCount },
          { label: "Sem Categoria", value: "without-category", count: withoutCategoryCount },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actions={
          <div className="flex items-center gap-2">
            {isConnected && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => fetchWhatsAppGroups(true)}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                </Button>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Lista de grupos cadastrados */}
      {gruposCadastrados.length > 0 ? (
        <GroupsTable
          grupos={gruposCadastrados}
          categorias={categorias}
          onConfigGroup={handleOpenEditDialog}
        />
      ) : (
        <EmptyState
          icon={Users}
          title={activeTab === "all" ? "Nenhum grupo cadastrado" : `Nenhum grupo ${activeTab === "with-category" ? "categorizado" : "sem categoria"}`}
          description={
            activeTab === "all"
              ? isConnected
                ? "Adicione grupos do WhatsApp para gerencia-los com a IA"
                : "Conecte uma instancia WhatsApp primeiro para sincronizar grupos"
              : activeTab === "with-category"
                ? "Nenhum grupo foi categorizado ainda"
                : "Todos os grupos estao categorizados"
          }
          action={
            activeTab === "all"
              ? isConnected
                ? { label: "Adicionar Grupos", onClick: () => setDialogOpen(true), icon: Plus }
                : { label: "Ver Instancias", href: "/instances", icon: Smartphone }
              : undefined
          }
          secondaryActions={
            activeTab === "all" && isConnected
              ? [
                  {
                    icon: Tags,
                    title: "Criar Categorias",
                    description: "Organize seus grupos por categorias",
                    href: "/categories",
                  },
                  {
                    icon: Zap,
                    title: "Configurar Gatilhos",
                    description: "Automatize acoes nos grupos",
                    href: "/triggers",
                  },
                ]
              : undefined
          }
        />
      )}

      {/* Modal de selecao de grupos - Compacto */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) setSearchFilter("")
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              Adicionar Grupos
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Selecione grupos e categorias
            </DialogDescription>
          </DialogHeader>

          {/* Campo de pesquisa */}
          {gruposNaoCadastrados.length > 0 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 h-8 sm:h-9 text-sm"
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto py-2 space-y-1.5">
            {loadingGroups ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : gruposNaoCadastrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="p-3 rounded-xl bg-muted mb-3">
                  <Check className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold">Todos ja adicionados!</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Nenhum grupo disponivel
                </p>
              </div>
            ) : (
              gruposNaoCadastrados
                .filter((g) => g.name.toLowerCase().includes(searchFilter.toLowerCase()))
                .map((group) => (
                <div
                  key={group.id}
                  className={cn(
                    "rounded-lg border transition-all p-2.5 sm:p-3",
                    selectedGroups.has(group.id)
                      ? "ring-2 ring-foreground bg-muted/50"
                      : "hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Checkbox
                      checked={selectedGroups.has(group.id)}
                      onCheckedChange={() => toggleGroupSelection(group.id)}
                      className="h-4 w-4"
                    />
                    <Avatar className="h-8 w-8 shrink-0 grayscale">
                      <AvatarImage src={group.picture || undefined} />
                      <AvatarFallback className="bg-muted">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{group.name}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {group.participants ? `${group.participants} part.` : "WhatsApp"}
                      </p>
                    </div>
                  </div>

                  {/* Categorias - aparece quando grupo esta selecionado */}
                  {selectedGroups.has(group.id) && categorias.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t">
                      {categorias.map((cat) => {
                        const isSelected = (selectedCategories[group.id] || []).includes(cat.id)
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategoryForGroup(group.id, cat.id)}
                            className={cn(
                              "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium transition-all",
                              !isSelected && "opacity-60 hover:opacity-100"
                            )}
                            style={{
                              backgroundColor: isSelected ? cat.cor + "20" : "transparent",
                              borderColor: cat.cor,
                              color: cat.cor,
                              border: `1px solid ${cat.cor}`,
                              boxShadow: isSelected ? `0 0 0 1px ${cat.cor}40` : "none"
                            }}
                          >
                            <div
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: cat.cor }}
                            />
                            {cat.nome}
                            {isSelected && <Check className="h-2.5 w-2.5" />}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
            {gruposNaoCadastrados.length > 0 &&
             searchFilter &&
             gruposNaoCadastrados.filter((g) => g.name.toLowerCase().includes(searchFilter.toLowerCase())).length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Search className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">
                  Nenhum resultado para &quot;{searchFilter}&quot;
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-3 flex-col sm:flex-row gap-2">
            <p className="text-xs text-muted-foreground sm:flex-1">
              {selectedGroups.size} selecionado(s)
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-initial h-8"
                onClick={() => {
                  setDialogOpen(false)
                  setSelectedGroups(new Set())
                  setSelectedCategories({})
                }}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="flex-1 sm:flex-initial h-8"
                onClick={handleSaveGroups}
                disabled={saving || selectedGroups.size === 0}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Adicionar</span>
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de edicao de grupo - Compacto */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-sm p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Pencil className="h-4 w-4" />
              Editar Grupo
            </DialogTitle>
          </DialogHeader>

          {editingGroup && (
            <div className="space-y-3">
              {/* Nome do grupo */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{editingGroup.nome}</p>
                  <p className="text-[10px] text-muted-foreground">WhatsApp</p>
                </div>
              </div>

              {/* Seletor de categorias (multiplas) */}
              <div className="space-y-1.5">
                <Label className="text-sm">Categorias</Label>
                <div className="space-y-1.5">
                  {categorias.map(cat => (
                    <label
                      key={cat.id}
                      className={cn(
                        "flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors",
                        editGroupCategories.includes(cat.id)
                          ? "border-foreground bg-muted/50"
                          : "border-border hover:bg-muted/30"
                      )}
                    >
                      <Checkbox
                        checked={editGroupCategories.includes(cat.id)}
                        onCheckedChange={() => toggleEditCategory(cat.id)}
                        className="h-4 w-4"
                      />
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: cat.cor }}
                      />
                      <span className="font-medium text-sm">{cat.nome}</span>
                    </label>
                  ))}
                </div>
                {editGroupCategories.length === 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    Sem categoria selecionada
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setEditDialogOpen(false)}
              disabled={savingEdit}
            >
              Cancelar
            </Button>
            <Button size="sm" className="h-8" onClick={handleSaveEdit} disabled={savingEdit}>
              {savingEdit ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmacao de exclusao - Compacto */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Excluir Grupo
            </DialogTitle>
          </DialogHeader>

          {groupToDelete && (
            <div className="space-y-3">
              {/* Nome do grupo */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{groupToDelete.nome}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {groupToDelete.categorias && groupToDelete.categorias.length > 0
                      ? `${groupToDelete.categorias.length} cat.`
                      : "Sem categoria"}
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Sera removido do sistema mas continuara no WhatsApp.
              </p>
            </div>
          )}

          <DialogFooter className="pt-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletingGroup}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8"
              onClick={handleDeleteGroup}
              disabled={deletingGroup}
            >
              {deletingGroup ? (
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
    </div>
  )
}
