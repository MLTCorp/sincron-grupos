"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  LayoutDashboard,
  Smartphone,
  Users,
  Tags,
  Zap,
  Terminal,
  Megaphone,
  Brain,
  Settings,
  UserPlus,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react"

interface SearchCommandProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)

  // Sincroniza estado interno com props
  const isControlled = open !== undefined
  const isDialogOpen = isControlled ? open : isOpen
  const setDialogOpen = isControlled ? onOpenChange! : setIsOpen

  // Atalho de teclado Cmd+K / Ctrl+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setDialogOpen(!isDialogOpen)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [isDialogOpen, setDialogOpen])

  const runCommand = React.useCallback(
    (command: () => void) => {
      setDialogOpen(false)
      command()
    },
    [setDialogOpen]
  )

  // Navegacao
  const navigation = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", shortcut: "D" },
    { icon: Smartphone, label: "Instancias", href: "/instances", shortcut: "I" },
    { icon: Users, label: "Grupos", href: "/groups", shortcut: "G" },
    { icon: Tags, label: "Categorias", href: "/categories", shortcut: "C" },
    { icon: Zap, label: "Gatilhos", href: "/triggers", shortcut: "T" },
    { icon: Terminal, label: "Comandos", href: "/commands" },
    { icon: Megaphone, label: "Mensagens", href: "/messages" },
    { icon: Brain, label: "Agentes IA", href: "/ai" },
    { icon: UserPlus, label: "Equipe", href: "/team" },
    { icon: Settings, label: "Configuracoes", href: "/settings" },
  ]

  // Acoes rapidas
  const quickActions = [
    {
      icon: Plus,
      label: "Nova Instancia",
      action: () => router.push("/instances/new"),
    },
    {
      icon: Plus,
      label: "Nova Categoria",
      action: () => router.push("/categories?action=new"),
    },
    {
      icon: Plus,
      label: "Novo Gatilho",
      action: () => router.push("/triggers/new"),
    },
    {
      icon: RefreshCw,
      label: "Sincronizar Grupos",
      action: () => router.push("/dashboard?action=sync"),
    },
  ]

  return (
    <CommandDialog
      open={isDialogOpen}
      onOpenChange={setDialogOpen}
      title="Busca Global"
      description="Navegue ou execute acoes rapidamente"
    >
      <CommandInput placeholder="Buscar paginas, acoes..." />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-4">
            <Search className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhum resultado encontrado</p>
          </div>
        </CommandEmpty>

        {/* Acoes Rapidas */}
        <CommandGroup heading="Acoes Rapidas">
          {quickActions.map((item) => (
            <CommandItem
              key={item.label}
              onSelect={() => runCommand(item.action)}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Navegacao */}
        <CommandGroup heading="Navegacao">
          {navigation.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => runCommand(() => router.push(item.href))}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.shortcut && (
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

// Provider para uso global
interface SearchCommandContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const SearchCommandContext = React.createContext<SearchCommandContextType | null>(null)

export function SearchCommandProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  return (
    <SearchCommandContext.Provider value={{ open, setOpen }}>
      {children}
      <SearchCommand open={open} onOpenChange={setOpen} />
    </SearchCommandContext.Provider>
  )
}

export function useSearchCommand() {
  const context = React.useContext(SearchCommandContext)
  if (!context) {
    throw new Error("useSearchCommand must be used within a SearchCommandProvider")
  }
  return context
}
