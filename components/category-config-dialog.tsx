"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoryGeneralTab } from "./category-general-tab"
import { TranscriptionConfigTab } from "./transcription-config-tab"
import { TriggersConfigTab } from "./triggers-config-tab"
import { Settings2, AudioLines, Zap } from "lucide-react"
import type { CategoriaEnriquecida } from "@/types/categoria"

interface CategoryConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoria: CategoriaEnriquecida
  onUpdate: () => void
}

export function CategoryConfigDialog({
  open,
  onOpenChange,
  categoria,
  onUpdate
}: CategoryConfigDialogProps) {
  const [activeTab, setActiveTab] = useState("geral")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[95vh] sm:max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6 border-b">
          <DialogTitle className="text-base sm:text-lg">
            Configurar: {categoria.nome}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b h-auto p-0">
            <TabsTrigger
              value="geral"
              className="flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              <Settings2 className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Geral</span>
            </TabsTrigger>
            <TabsTrigger
              value="transcricao"
              className="flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              <AudioLines className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Transcrição</span>
            </TabsTrigger>
            <TabsTrigger
              value="gatilhos"
              className="flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              <Zap className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Gatilhos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="flex-1 overflow-y-auto m-0 mt-0">
            <CategoryGeneralTab
              categoria={categoria}
              onUpdate={onUpdate}
              onClose={() => onOpenChange(false)}
            />
          </TabsContent>

          <TabsContent value="transcricao" className="flex-1 overflow-y-auto m-0 mt-0">
            <TranscriptionConfigTab
              idCategoria={categoria.id}
              config={categoria.config_transcricao?.[0]}
              onUpdate={onUpdate}
            />
          </TabsContent>

          <TabsContent value="gatilhos" className="flex-1 overflow-y-auto m-0 mt-0">
            <TriggersConfigTab
              idCategoria={categoria.id}
              onUpdate={onUpdate}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
