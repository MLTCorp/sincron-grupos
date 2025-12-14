"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Search,
  Loader2,
  Check,
  RefreshCw,
  ImageIcon,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Categoria, Grupo } from "@/hooks/use-organization-data"

interface SyncGroupsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  instanceToken: string | null
  instanceId: number | null
  categorias: Categoria[]
  gruposCadastrados: Grupo[]
  onUpdate: () => void
}

interface WhatsAppGroup {
  id: string
  name: string
  picture?: string | null
  participants?: number
}

export function SyncGroupsDialog({
  open,
  onOpenChange,
  instanceToken,
  instanceId,
  categorias,
  gruposCadastrados,
  onUpdate,
}: SyncGroupsDialogProps) {
  const [whatsappGroups, setWhatsappGroups] = useState<WhatsAppGroup[]>([])
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Record<string, number[]>>({})
  const [saving, setSaving] = useState(false)
  const [updatingPhotos, setUpdatingPhotos] = useState(false)
  const [searchFilter, setSearchFilter] = useState("")

  const supabase = createClient()

  // Grupos cadastrados que precisam de atualização de foto
  const gruposParaAtualizarFoto = useMemo(() => {
    return gruposCadastrados.filter(gc => {
      const whatsappGroup = whatsappGroups.find(wg => wg.id === gc.chat_id_whatsapp)
      // Precisa atualizar se: tem foto na UAZAPI e (não tem foto no DB ou a foto é diferente)
      return whatsappGroup?.picture && (!gc.foto_url || gc.foto_url !== whatsappGroup.picture)
    })
  }, [gruposCadastrados, whatsappGroups])

  // Buscar grupos do WhatsApp
  const fetchWhatsAppGroups = useCallback(async () => {
    if (!instanceToken) return

    setLoadingGroups(true)
    try {
      const response = await fetch(`/api/uazapi/instances/${instanceToken}/groups`)
      if (!response.ok) throw new Error("Falha ao buscar grupos")

      const data = await response.json()
      setWhatsappGroups(data.groups || [])
    } catch (err) {
      console.error("Erro ao buscar grupos:", err)
      toast.error("Erro ao buscar grupos do WhatsApp")
    } finally {
      setLoadingGroups(false)
    }
  }, [instanceToken])

  useEffect(() => {
    if (open && instanceToken) {
      fetchWhatsAppGroups()
    }
  }, [open, instanceToken, fetchWhatsAppGroups])

  // Grupos nao cadastrados
  const gruposNaoCadastrados = whatsappGroups.filter(
    (g) => !gruposCadastrados.some((gc) => gc.chat_id_whatsapp === g.id)
  )

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

      // Inserir os grupos
      const gruposParaSalvar = Array.from(selectedGroups).map((groupId) => {
        const group = whatsappGroups.find((g) => g.id === groupId)!
        const cats = selectedCategories[groupId] || []
        return {
          id_organizacao: usuarioSistema.id_organizacao,
          id_instancia: instanceId,
          chat_id_whatsapp: groupId,
          nome: group.name,
          foto_url: group.picture || null,
          id_categoria: cats.length > 0 ? cats[0] : null,
          ativo: true,
        }
      })

      const { data: gruposInseridos, error } = await supabase
        .from("grupos")
        .insert(gruposParaSalvar)
        .select("id, chat_id_whatsapp")

      if (error) throw error

      // Inserir relacoes N:N com categorias
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

      toast.success(`${gruposParaSalvar.length} grupo(s) sincronizado(s)!`)
      onOpenChange(false)
      setSelectedGroups(new Set())
      setSelectedCategories({})
      onUpdate()
    } catch (err) {
      console.error("Erro ao salvar grupos:", err)
      toast.error("Erro ao sincronizar grupos")
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setSearchFilter("")
    setSelectedGroups(new Set())
    setSelectedCategories({})
  }

  // Atualizar fotos dos grupos existentes usando dados já carregados
  const handleUpdateExistingPhotos = async () => {
    if (gruposParaAtualizarFoto.length === 0) {
      toast.info("Todas as fotos já estão atualizadas")
      return
    }

    setUpdatingPhotos(true)
    try {
      // Criar array de updates usando dados já em memória (sem nova chamada à UAZAPI)
      const updates = gruposParaAtualizarFoto.map(grupo => {
        const whatsappGroup = whatsappGroups.find(wg => wg.id === grupo.chat_id_whatsapp)
        return {
          id: grupo.id,
          foto_url: whatsappGroup?.picture || null
        }
      })

      // Executar updates em batch
      let successCount = 0
      for (const update of updates) {
        const { error } = await supabase
          .from("grupos")
          .update({ foto_url: update.foto_url })
          .eq("id", update.id)

        if (!error) successCount++
      }

      toast.success(`${successCount} foto(s) atualizada(s)!`)
      onUpdate() // Atualizar dados no componente pai
    } catch (err) {
      console.error("Erro ao atualizar fotos:", err)
      toast.error("Erro ao atualizar fotos dos grupos")
    } finally {
      setUpdatingPhotos(false)
    }
  }

  const filteredGroups = gruposNaoCadastrados.filter((g) =>
    g.name.toLowerCase().includes(searchFilter.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Sincronizar Grupos
          </DialogTitle>
          <DialogDescription className="text-xs">
            Selecione grupos do WhatsApp para adicionar
          </DialogDescription>
        </DialogHeader>

        {/* Campo de pesquisa */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={fetchWhatsAppGroups}
            disabled={loadingGroups}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loadingGroups && "animate-spin")} />
            Atualizar
          </Button>
        </div>

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
              <h3 className="text-sm font-semibold">Todos sincronizados!</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Nenhum grupo novo disponivel
              </p>

              {/* Botão para atualizar fotos dos grupos existentes */}
              {gruposParaAtualizarFoto.length > 0 && (
                <div className="mt-4 pt-4 border-t w-full">
                  <p className="text-xs text-muted-foreground mb-2">
                    {gruposParaAtualizarFoto.length} grupo(s) com fotos desatualizadas
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={handleUpdateExistingPhotos}
                    disabled={updatingPhotos}
                  >
                    {updatingPhotos ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ImageIcon className="h-3.5 w-3.5" />
                    )}
                    Atualizar fotos
                  </Button>
                </div>
              )}
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Search className="h-6 w-6 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">
                Nenhum resultado para &quot;{searchFilter}&quot;
              </p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div
                key={group.id}
                className={cn(
                  "rounded-lg border transition-all p-2.5",
                  selectedGroups.has(group.id)
                    ? "ring-2 ring-foreground bg-muted/50"
                    : "hover:bg-muted/30"
                )}
              >
                <div className="flex items-center gap-2">
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
                    <p className="text-[10px] text-muted-foreground">
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
                            "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all",
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
              onClick={handleClose}
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
                  <Check className="h-4 w-4 mr-1.5" />
                  Sincronizar
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
