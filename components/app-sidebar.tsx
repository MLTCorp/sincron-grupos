"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Smartphone,
  Users,
  Tags,
  Terminal,
  Zap,
  Megaphone,
  Rss,
  Brain,
  Bot,
  Settings,
  UserPlus,
  AudioLines,
  Search,
  LogOut,
  ChevronsUpDown,
  Sparkles,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { NotificationCenter } from "@/components/notification-center";
import { useSearchCommand } from "@/components/dashboard";

interface MenuItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number | string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const menuItems: MenuGroup[] = [
  {
    title: "Principal",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Assistente", href: "/agent", icon: Bot },
      { title: "Instancias", href: "/instances", icon: Smartphone },
      { title: "Grupos", href: "/groups", icon: Users },
      { title: "Categorias", href: "/categories", icon: Tags },
    ],
  },
  {
    title: "Automacoes",
    items: [
      { title: "Gatilhos", href: "/triggers", icon: Zap },
      { title: "Comandos", href: "/commands", icon: Terminal },
      { title: "Mensagens", href: "/messages", icon: Megaphone },
      { title: "Transcricao", href: "/transcription", icon: AudioLines },
    ],
  },
  {
    title: "Inteligencia",
    items: [
      { title: "Agentes IA", href: "/ai", icon: Brain },
      { title: "RSS Feeds", href: "/feeds", icon: Rss },
    ],
  },
  {
    title: "Configuracoes",
    items: [
      { title: "Equipe", href: "/team", icon: UserPlus },
      { title: "Conta", href: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpen: setSearchOpen } = useSearchCommand();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso!");
    router.push("/login");
  };

  // TODO: Substituir por dados reais do contexto
  const planUsage = {
    grupos: { used: 5, limit: 10 },
    plan: "Free",
  };

  const usagePercent = (planUsage.grupos.used / planUsage.grupos.limit) * 100;

  return (
    <Sidebar>
      <SidebarHeader>
        {/* Logo */}
        <div className="flex items-center justify-between px-2 py-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-sm">SG</span>
            </div>
            <span className="font-semibold text-base">Sincron</span>
          </Link>
          <NotificationCenter />
        </div>

        {/* Botao de busca global */}
        <div className="px-2 pb-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-9 text-muted-foreground font-normal"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left text-sm">Buscar...</span>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    >
                      <Link href={item.href}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                        {item.badge !== undefined && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        {/* Indicador de plano/uso */}
        <div className="px-3 pb-2">
          <div className="rounded-lg border bg-card/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                Plano {planUsage.plan}
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 gap-1">
                <Sparkles className="h-3 w-3" />
                Upgrade
              </Badge>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Grupos</span>
                <span className="font-medium">
                  {planUsage.grupos.used}/{planUsage.grupos.limit}
                </span>
              </div>
              <Progress value={usagePercent} className="h-1.5" />
            </div>
          </div>
        </div>

        {/* Menu do usuario */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                      U
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">Minha Conta</span>
                    <span className="text-[11px] text-muted-foreground truncate">
                      usuario@email.com
                    </span>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configuracoes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/team" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Equipe
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4 mr-2" />
                  ) : (
                    <Moon className="h-4 w-4 mr-2" />
                  )}
                  {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
