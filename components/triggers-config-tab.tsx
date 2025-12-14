"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Link from "next/link"
import type { Gatilho } from "@/types/categoria"

interface TriggersConfigTabProps {
  idCategoria: number
  onUpdate: () => void
}

export function TriggersConfigTab({ idCategoria, onUpdate }: TriggersConfigTabProps) {
  const [gatilhos, setGatilhos] = useState<Gatilho[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGatilhos()
  }, [idCategoria])

  const loadGatilhos = async () => {
    setLoading(true)
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

      const { data } = await supabase
        .from("gatilhos")
        .select("*")
        .eq("id_organizacao", usuarioSistema.id_organizacao)
        .eq("id_categoria", idCategoria)
        .order("prioridade", { ascending: true })

      setGatilhos(data || [])
    } catch (err) {
      console.error(err)
      toast.error("Erro ao carregar gatilhos")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header fixo */}
      <div className="px-4 pt-4 sm:px-6 sm:pt-6 pb-4 border-b bg-background">
        <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
          <div className="flex-1">
            <h3 className="font-medium text-sm sm:text-base">Gatilhos desta Categoria</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {gatilhos.length} gatilho{gatilhos.length !== 1 ? 's' : ''} configurado{gatilhos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button asChild size="sm" className="h-8 sm:h-9 w-full sm:w-auto">
            <Link href={`/triggers?categoria=${idCategoria}`}>
              <Plus className="h-4 w-4 mr-2" />
              <span className="text-xs sm:text-sm">Novo Gatilho</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Lista com scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                <p className="text-sm text-muted-foreground mt-2">Carregando...</p>
              </div>
            </div>
          ) : gatilhos.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Zap className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="font-medium text-sm mb-1">Nenhum gatilho configurado</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Crie gatilhos para automatizar ações nesta categoria
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href={`/triggers?categoria=${idCategoria}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeiro gatilho
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {gatilhos.map((gatilho) => (
                <div
                  key={gatilho.id}
                  className="flex items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="shrink-0 mt-0.5">
                      <Zap className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{gatilho.nome}</div>
                      {gatilho.descricao && (
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {gatilho.descricao}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                          {gatilho.tipo_evento}
                        </span>
                        <span>→</span>
                        <span className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                          {gatilho.tipo_acao}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={gatilho.ativo ? "default" : "secondary"}
                    className="text-[10px] shrink-0"
                  >
                    {gatilho.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
