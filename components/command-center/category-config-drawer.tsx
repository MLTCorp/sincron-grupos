"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings2, AudioLines, Zap } from "lucide-react"
import { CategoryGeneralTab } from "@/components/category-general-tab"
import { TranscriptionConfigTab } from "@/components/transcription-config-tab"
import { TriggersConfigTab } from "@/components/triggers-config-tab"
import type { Categoria } from "@/hooks/use-organization-data"
import type { CategoriaEnriquecida, ConfigTranscricao } from "@/types/categoria"

interface CategoryConfigDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoria: Categoria
  onUpdate: () => void
}

export function CategoryConfigDrawer({
  open,
  onOpenChange,
  categoria,
  onUpdate,
}: CategoryConfigDrawerProps) {
  const handleUpdate = () => {
    onUpdate()
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  // Adaptar categoria para o formato esperado pelos componentes existentes
  const categoriaEnriquecida: CategoriaEnriquecida = {
    id: categoria.id,
    id_organizacao: categoria.id_organizacao,
    nome: categoria.nome,
    cor: categoria.cor,
    descricao: categoria.descricao,
    ordem: categoria.ordem ?? 0,
    dt_create: categoria.dt_create || "",
    dt_update: categoria.dt_update || "",
    config_transcricao: categoria.config_transcricao as ConfigTranscricao[] | undefined,
    _count: categoria._count || { grupos: 0, gatilhos: 0, gatilhosAtivos: 0 },
    hasTranscription: categoria.hasTranscription || false,
  }

  // Get first config_transcricao with proper type
  const transcriptionConfig = categoria.config_transcricao?.[0]
    ? {
        id: categoria.config_transcricao[0].id,
        modo: categoria.config_transcricao[0].modo as ConfigTranscricao["modo"],
        tipo_transcricao: categoria.config_transcricao[0].tipo_transcricao as ConfigTranscricao["tipo_transcricao"],
        emoji_gatilho: categoria.config_transcricao[0].emoji_gatilho,
      }
    : undefined

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-4 pb-0 shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: categoria.cor }}
            />
            {categoria.nome}
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="geral" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 mt-2 shrink-0">
            <TabsTrigger value="geral" className="gap-1.5">
              <Settings2 className="h-3.5 w-3.5" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="transcricao" className="gap-1.5">
              <AudioLines className="h-3.5 w-3.5" />
              Transcricao
            </TabsTrigger>
            <TabsTrigger value="gatilhos" className="gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Gatilhos
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="geral" className="h-full m-0 p-4 overflow-y-auto">
              <CategoryGeneralTab
                categoria={categoriaEnriquecida}
                onUpdate={handleUpdate}
                onClose={handleClose}
              />
            </TabsContent>

            <TabsContent value="transcricao" className="h-full m-0 p-4 overflow-y-auto">
              <TranscriptionConfigTab
                idCategoria={categoria.id}
                config={transcriptionConfig}
                onUpdate={handleUpdate}
              />
            </TabsContent>

            <TabsContent value="gatilhos" className="h-full m-0 p-4 overflow-y-auto">
              <TriggersConfigTab
                idCategoria={categoria.id}
                onUpdate={handleUpdate}
              />
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
