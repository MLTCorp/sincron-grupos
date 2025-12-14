"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  Settings2,
  Plus,
  Pencil,
  AudioLines,
  Zap,
} from "lucide-react"
import type { Categoria, Grupo } from "@/hooks/use-organization-data"
import { cn } from "@/lib/utils"

interface GroupsPanelProps {
  grupos: Grupo[]
  categorias: Categoria[]
  gruposPorCategoria: Record<number | "sem-categoria", Grupo[]>
  instanceToken?: string | null
  onSync: () => void
  onConfigCategory: (categoria: Categoria) => void
  onRefresh: () => Promise<void>
}

export function GroupsPanel({
  grupos,
  categorias,
  gruposPorCategoria,
  instanceToken,
  onSync,
  onConfigCategory,
  onRefresh,
}: GroupsPanelProps) {
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<Set<number | "sem-categoria">>(
    new Set([...categorias.map(c => c.id), "sem-categoria"])
  )

  // Filtrar grupos por busca
  const filteredGruposPorCategoria = useMemo(() => {
    if (!search.trim()) return gruposPorCategoria

    const filtered: Record<number | "sem-categoria", Grupo[]> = {
      "sem-categoria": []
    }

    categorias.forEach(cat => {
      filtered[cat.id] = []
    })

    const searchLower = search.toLowerCase()

    Object.entries(gruposPorCategoria).forEach(([key, gruposArr]) => {
      const catKey = key === "sem-categoria" ? "sem-categoria" : Number(key)
      filtered[catKey] = gruposArr.filter(g =>
        g.nome.toLowerCase().includes(searchLower)
      )
    })

    return filtered
  }, [gruposPorCategoria, categorias, search])

  const toggleExpand = (catId: number | "sem-categoria") => {
    setExpanded(prev => {
      const newSet = new Set(prev)
      if (newSet.has(catId)) {
        newSet.delete(catId)
      } else {
        newSet.add(catId)
      }
      return newSet
    })
  }

  const totalGrupos = grupos.length

  return (
    <Card className="flex flex-col h-full min-h-[400px] lg:min-h-[600px]">
      <CardHeader className="p-3 pb-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Grupos
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              {totalGrupos}
            </Badge>
          </div>
          <Button
            size="sm"
            className="h-8 gap-1.5"
            onClick={onSync}
            disabled={!instanceToken}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sincronizar</span>
          </Button>
        </div>

        {/* Search */}
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar grupos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="divide-y">
            {/* Categorias */}
            {categorias.map(categoria => {
              const gruposCategoria = filteredGruposPorCategoria[categoria.id] || []
              const isExpanded = expanded.has(categoria.id)

              if (gruposCategoria.length === 0 && search.trim()) return null

              return (
                <div key={categoria.id}>
                  {/* Category Header */}
                  <div className="flex items-center justify-between px-3 py-2 hover:bg-muted/30 transition-colors">
                    <button
                      onClick={() => toggleExpand(categoria.id)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: categoria.cor }}
                      />
                      <span className="font-medium text-sm">{categoria.nome}</span>
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                        {gruposCategoria.length}
                      </Badge>

                      {/* Badges de features */}
                      {categoria.hasTranscription && (
                        <AudioLines className="h-3 w-3 text-muted-foreground" />
                      )}
                      {categoria._count?.gatilhosAtivos && categoria._count.gatilhosAtivos > 0 && (
                        <Zap className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          onConfigCategory(categoria)
                        }}
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Groups List */}
                  {isExpanded && gruposCategoria.length > 0 && (
                    <div className="bg-muted/20">
                      {gruposCategoria.map(grupo => (
                        <GroupItem key={grupo.id} grupo={grupo} categorias={categorias} />
                      ))}
                    </div>
                  )}

                  {/* Empty state for category */}
                  {isExpanded && gruposCategoria.length === 0 && !search.trim() && (
                    <div className="bg-muted/20 px-3 py-4 text-center">
                      <p className="text-xs text-muted-foreground">
                        Nenhum grupo nesta categoria
                      </p>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Sem Categoria */}
            {(filteredGruposPorCategoria["sem-categoria"]?.length > 0 || !search.trim()) && (
              <div>
                <div className="flex items-center justify-between px-3 py-2 hover:bg-muted/30 transition-colors">
                  <button
                    onClick={() => toggleExpand("sem-categoria")}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    {expanded.has("sem-categoria") ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium text-sm text-muted-foreground">
                      Sem categoria
                    </span>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                      {filteredGruposPorCategoria["sem-categoria"]?.length || 0}
                    </Badge>
                  </button>
                </div>

                {expanded.has("sem-categoria") && filteredGruposPorCategoria["sem-categoria"]?.length > 0 && (
                  <div className="bg-muted/20">
                    {filteredGruposPorCategoria["sem-categoria"].map(grupo => (
                      <GroupItem key={grupo.id} grupo={grupo} categorias={categorias} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Empty state total */}
          {totalGrupos === 0 && (
            <div className="p-6 text-center">
              <div className="mx-auto w-fit p-3 rounded-xl bg-muted mb-3">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">Nenhum grupo</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Sincronize grupos do WhatsApp
              </p>
              <Button size="sm" onClick={onSync} disabled={!instanceToken}>
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Sincronizar
              </Button>
            </div>
          )}

          {/* No results from search */}
          {totalGrupos > 0 && search.trim() && Object.values(filteredGruposPorCategoria).every(arr => arr.length === 0) && (
            <div className="p-6 text-center">
              <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhum resultado para &quot;{search}&quot;
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Sub-component: Group Item
function GroupItem({ grupo, categorias }: { grupo: Grupo; categorias: Categoria[] }) {
  const getCategoriaInfo = (catId: number) => categorias.find(c => c.id === catId)

  return (
    <div className="px-3 py-2 pl-9 hover:bg-muted/30 transition-colors group/item">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={grupo.foto_url || undefined} />
          <AvatarFallback className="bg-muted">
            <Users className="h-4 w-4 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{grupo.nome}</p>
          {/* Multi-category badges */}
          {grupo.categorias && grupo.categorias.length > 1 && (
            <div className="flex flex-wrap gap-0.5 mt-0.5">
              {grupo.categorias.slice(0, 2).map(catId => {
                const cat = getCategoriaInfo(catId)
                return cat ? (
                  <Badge
                    key={catId}
                    variant="outline"
                    className="text-[9px] px-1 py-0 h-4"
                    style={{ borderColor: cat.cor, color: cat.cor }}
                  >
                    {cat.nome}
                  </Badge>
                ) : null
              })}
              {grupo.categorias.length > 2 && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                  +{grupo.categorias.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
