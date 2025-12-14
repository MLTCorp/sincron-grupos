"use client"

import { useMemo, useState } from "react"
import { usePagination } from "@/components/hooks/use-pagination"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnDef,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
} from "@tanstack/react-table"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Users,
  Settings2,
  AudioLines,
  Zap,
} from "lucide-react"

// Tipos locais flexiveis para aceitar dados de diferentes fontes
export interface GrupoRow {
  id: number
  chat_id_whatsapp: string
  nome: string
  foto_url?: string | null
  ativo: boolean
  categorias?: number[]
  id_categoria?: number | null
}

export interface CategoriaRow {
  id: number
  nome: string
  cor: string
  hasTranscription?: boolean
  _count?: {
    gatilhosAtivos?: number
  }
}

interface GroupsTableProps {
  grupos: GrupoRow[]
  categorias: CategoriaRow[]
  onConfigGroup?: (grupo: GrupoRow) => void
  onSelectGroups?: (grupos: GrupoRow[]) => void
}

export function GroupsTable({
  grupos,
  categorias,
  onConfigGroup,
  onSelectGroups,
}: GroupsTableProps) {
  const pageSize = 10

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  })

  const [sorting, setSorting] = useState<SortingState>([
    { id: "nome", desc: false },
  ])

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("all")
  const [rowSelection, setRowSelection] = useState({})

  // Mapa de categorias para lookup rapido
  const categoriasMap = useMemo(() => {
    const map = new Map<number, CategoriaRow>()
    categorias.forEach(cat => map.set(cat.id, cat))
    return map
  }, [categorias])

  // Filtrar grupos por tag selecionada
  const filteredGrupos = useMemo(() => {
    if (selectedTagFilter === "all") return grupos
    if (selectedTagFilter === "sem-tag") {
      return grupos.filter(g => !g.categorias || g.categorias.length === 0)
    }
    const tagId = parseInt(selectedTagFilter)
    return grupos.filter(g => g.categorias?.includes(tagId))
  }, [grupos, selectedTagFilter])

  const columns: ColumnDef<GrupoRow>[] = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
        />
      ),
      size: 40,
      enableSorting: false,
    },
    {
      header: "Grupo",
      accessorKey: "nome",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={row.original.foto_url || undefined} />
            <AvatarFallback className="bg-muted">
              <Users className="h-4 w-4 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium truncate">{row.original.nome}</p>
            <p className="text-xs text-muted-foreground truncate">
              {row.original.chat_id_whatsapp}
            </p>
          </div>
        </div>
      ),
      size: 280,
    },
    {
      header: "Tags",
      accessorKey: "categorias",
      cell: ({ row }) => {
        const cats = row.original.categorias || []
        if (cats.length === 0) {
          return (
            <span className="text-xs text-muted-foreground">Sem tags</span>
          )
        }
        return (
          <div className="flex flex-wrap gap-1">
            {cats.slice(0, 2).map(catId => {
              const cat = categoriasMap.get(catId)
              if (!cat) return null
              return (
                <Badge
                  key={catId}
                  variant="outline"
                  className="text-xs px-1.5 py-0"
                  style={{ borderColor: cat.cor, color: cat.cor }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full mr-1"
                    style={{ backgroundColor: cat.cor }}
                  />
                  {cat.nome}
                </Badge>
              )
            })}
            {cats.length > 2 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                +{cats.length - 2}
              </Badge>
            )}
          </div>
        )
      },
      size: 200,
      enableSorting: false,
    },
    {
      header: "Features",
      id: "features",
      cell: ({ row }) => {
        // Verificar se tem transcricao ou gatilhos via categorias
        const cats = row.original.categorias || []
        const hasTranscription = cats.some(catId => {
          const cat = categoriasMap.get(catId)
          return cat?.hasTranscription
        })
        const hasGatilhos = cats.some(catId => {
          const cat = categoriasMap.get(catId)
          return cat?._count?.gatilhosAtivos && cat._count.gatilhosAtivos > 0
        })

        if (!hasTranscription && !hasGatilhos) {
          return <span className="text-xs text-muted-foreground">-</span>
        }

        return (
          <div className="flex items-center gap-2">
            {hasTranscription && (
              <div className="flex items-center gap-1 text-muted-foreground" title="Transcricao ativa">
                <AudioLines className="h-3.5 w-3.5" />
              </div>
            )}
            {hasGatilhos && (
              <div className="flex items-center gap-1 text-muted-foreground" title="Gatilhos ativos">
                <Zap className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        )
      },
      size: 100,
      enableSorting: false,
    },
    {
      header: "Status",
      accessorKey: "ativo",
      cell: ({ row }) => (
        <Badge
          variant={row.original.ativo ? "default" : "secondary"}
          className={cn(
            "text-xs",
            !row.original.ativo && "bg-muted-foreground/60"
          )}
        >
          {row.original.ativo ? "Ativo" : "Inativo"}
        </Badge>
      ),
      size: 80,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onConfigGroup?.(row.original)}
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      ),
      size: 50,
      enableSorting: false,
    },
  ], [categoriasMap, onConfigGroup])

  const table = useReactTable({
    data: filteredGrupos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      pagination,
      columnFilters,
      rowSelection,
    },
  })

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages: table.getPageCount(),
    paginationItemsToDisplay: 5,
  })

  // Notificar selecao de grupos
  const selectedRows = table.getFilteredSelectedRowModel().rows
  useMemo(() => {
    if (onSelectGroups) {
      onSelectGroups(selectedRows.map(r => r.original))
    }
  }, [selectedRows, onSelectGroups])

  return (
    <div className="space-y-4">
      {/* Filtro por Tag */}
      <div className="flex items-center gap-3">
        <Select value={selectedTagFilter} onValueChange={setSelectedTagFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as tags</SelectItem>
            <SelectItem value="sem-tag">Sem tag</SelectItem>
            {categorias.map(cat => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: cat.cor }}
                  />
                  {cat.nome}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {Object.keys(rowSelection).length > 0 && (
          <span className="text-sm text-muted-foreground">
            {Object.keys(rowSelection).length} selecionado(s)
          </span>
        )}
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                    className="h-11"
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className={cn(
                          header.column.getCanSort() &&
                            "flex h-full cursor-pointer select-none items-center justify-between gap-2"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
                          if (
                            header.column.getCanSort() &&
                            (e.key === "Enter" || e.key === " ")
                          ) {
                            e.preventDefault()
                            header.column.getToggleSortingHandler()?.(e)
                          }
                        }}
                        tabIndex={header.column.getCanSort() ? 0 : undefined}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: (
                            <ChevronUp
                              className="shrink-0 opacity-60"
                              size={16}
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                          ),
                          desc: (
                            <ChevronDown
                              className="shrink-0 opacity-60"
                              size={16}
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum grupo encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginacao */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between gap-3 max-sm:flex-col">
          <p className="flex-1 whitespace-nowrap text-sm text-muted-foreground">
            Pagina{" "}
            <span className="text-foreground">
              {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            de <span className="text-foreground">{table.getPageCount()}</span>
          </p>

          <div className="grow">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Pagina anterior"
                  >
                    <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
                  </Button>
                </PaginationItem>

                {showLeftEllipsis && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {pages.map((page) => {
                  const isActive = page === table.getState().pagination.pageIndex + 1
                  return (
                    <PaginationItem key={page}>
                      <Button
                        size="icon"
                        variant={isActive ? "outline" : "ghost"}
                        onClick={() => table.setPageIndex(page - 1)}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {page}
                      </Button>
                    </PaginationItem>
                  )
                })}

                {showRightEllipsis && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Proxima pagina"
                  >
                    <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>

          <div className="flex flex-1 justify-end">
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-fit whitespace-nowrap">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} / pagina
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
