"use client"

import { useState } from "react"
import {
  User,
  Shield,
  Bell,
  Sliders,
  Building2,
  Plug,
  AlertTriangle,
  Monitor,
  Smartphone,
  CreditCard,
  Key,
  Zap,
  Code,
  Download,
  Trash2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  // Account state
  const [name, setName] = useState("Michelle Santos")
  const [email, setEmail] = useState("michelle@sincron.com")
  const [phone, setPhone] = useState("+55 11 99999-9999")
  const [role, setRole] = useState("admin")

  // Security state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  // Notifications state
  const [notifications, setNotifications] = useState({
    email: true,
    messages: true,
    triggers: true,
    reports: false,
    updates: true,
  })

  // Preferences state
  const [language, setLanguage] = useState("pt-BR")
  const [timezone, setTimezone] = useState("America/Sao_Paulo")
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY")
  const [theme, setTheme] = useState("light")

  // Organization state
  const [orgName, setOrgName] = useState("Sincron Grupos Ltda")

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configuracoes</h2>
        <p className="text-muted-foreground">Gerencie suas preferencias e configuracoes da conta.</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Account Section */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Informacoes da Conta
            </CardTitle>
            <CardDescription>
              Gerencie suas informacoes pessoais e de contato.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Profile Photo */}
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20 border-2 border-border">
                <AvatarImage src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg" />
                <AvatarFallback>MS</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label className="mb-2 block font-semibold">Foto de Perfil</Label>
                <div className="flex items-center gap-3">
                  <Button size="sm">Alterar Foto</Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    Remover
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">JPG, PNG ou GIF. Maximo 2MB.</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold">Nome Completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-semibold">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="font-semibold">Funcao</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="gerente">Gerente</SelectItem>
                    <SelectItem value="operador">Operador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline">Cancelar</Button>
              <Button>Salvar Alteracoes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Seguranca
            </CardTitle>
            <CardDescription>
              Gerencie sua senha e configuracoes de autenticacao.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Password Change */}
            <div>
              <Label className="mb-2 block font-semibold">Alterar Senha</Label>
              <div className="space-y-4">
                <Input type="password" placeholder="Senha atual" />
                <Input type="password" placeholder="Nova senha" />
                <Input type="password" placeholder="Confirmar nova senha" />
              </div>
              <Button className="mt-4">Atualizar Senha</Button>
            </div>

            <Separator />

            {/* Two Factor */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Autenticacao de Dois Fatores</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Adicione uma camada extra de seguranca a sua conta.
                </p>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
              />
            </div>

            <Separator />

            {/* Active Sessions */}
            <div>
              <h4 className="mb-3 font-semibold">Sessoes Ativas</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Windows - Chrome</p>
                      <p className="text-sm text-muted-foreground">Sao Paulo, Brasil - Ativo agora</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Atual
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">iPhone - Safari</p>
                      <p className="text-sm text-muted-foreground">Sao Paulo, Brasil - 2 horas atras</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    Encerrar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-primary" />
              Notificacoes
            </CardTitle>
            <CardDescription>
              Configure como e quando voce deseja receber notificacoes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-0 pt-6">
            <div className="flex items-center justify-between border-b py-3">
              <div>
                <h4 className="font-semibold">Notificacoes por E-mail</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Receba atualizacoes importantes por e-mail.
                </p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
              />
            </div>
            <div className="flex items-center justify-between border-b py-3">
              <div>
                <h4 className="font-semibold">Novas Mensagens</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Notificar quando receber mensagens nos grupos.
                </p>
              </div>
              <Switch
                checked={notifications.messages}
                onCheckedChange={(checked) => setNotifications({...notifications, messages: checked})}
              />
            </div>
            <div className="flex items-center justify-between border-b py-3">
              <div>
                <h4 className="font-semibold">Gatilhos Ativados</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Notificar quando um gatilho for executado.
                </p>
              </div>
              <Switch
                checked={notifications.triggers}
                onCheckedChange={(checked) => setNotifications({...notifications, triggers: checked})}
              />
            </div>
            <div className="flex items-center justify-between border-b py-3">
              <div>
                <h4 className="font-semibold">Relatorios Semanais</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Receba um resumo semanal de atividades.
                </p>
              </div>
              <Switch
                checked={notifications.reports}
                onCheckedChange={(checked) => setNotifications({...notifications, reports: checked})}
              />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="font-semibold">Atualizacoes do Sistema</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Notificar sobre novos recursos e melhorias.
                </p>
              </div>
              <Switch
                checked={notifications.updates}
                onCheckedChange={(checked) => setNotifications({...notifications, updates: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sliders className="h-5 w-5 text-primary" />
              Preferencias do Sistema
            </CardTitle>
            <CardDescription>
              Personalize sua experiencia na plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="language" className="font-semibold">Idioma</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full md:w-1/2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Portugues (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es">Espanol</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="font-semibold">Fuso Horario</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="w-full md:w-1/2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">America/Sao_Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat" className="font-semibold">Formato de Data</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger className="w-full md:w-1/2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="font-semibold">Tema</Label>
              <RadioGroup value={theme} onValueChange={setTheme} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="cursor-pointer font-normal">Claro</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="cursor-pointer font-normal">Escuro</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="auto" id="auto" />
                  <Label htmlFor="auto" className="cursor-pointer font-normal">Automatico</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline">Restaurar Padroes</Button>
              <Button>Salvar Preferencias</Button>
            </div>
          </CardContent>
        </Card>

        {/* Organization Section */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Organizacao
            </CardTitle>
            <CardDescription>
              Informacoes sobre sua organizacao e plano.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="orgName" className="font-semibold">Nome da Organizacao</Label>
              <Input
                id="orgName"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>

            {/* Plan Info */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Plano Atual</h4>
                  <p className="mt-1 text-sm text-muted-foreground">Plano Professional</p>
                </div>
                <Badge className="bg-primary">Ativo</Badge>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Grupos</p>
                  <p className="text-lg font-bold">47 / 120</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Usuarios</p>
                  <p className="text-lg font-bold">8 / 20</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Renovacao</p>
                  <p className="text-lg font-bold">15 dias</p>
                </div>
              </div>
              <Button className="mt-4 w-full">Gerenciar Plano</Button>
            </div>

            <Separator />

            {/* Billing Info */}
            <div>
              <h4 className="mb-3 font-semibold">Informacoes de Cobranca</h4>
              <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">**** **** **** 4242</p>
                    <p className="text-sm text-muted-foreground">Expira em 12/2025</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                  Editar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integrations Section */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plug className="h-5 w-5 text-primary" />
              Integracoes
            </CardTitle>
            <CardDescription>
              Conecte ferramentas externas para expandir funcionalidades.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {/* Zapier */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">Zapier</h4>
                  <p className="text-sm text-muted-foreground">Automatize fluxos de trabalho com 5000+ apps.</p>
                </div>
              </div>
              <Button size="sm">Conectar</Button>
            </div>

            {/* Slack */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold">Slack</h4>
                  <p className="text-sm text-muted-foreground">Receba notificacoes direto no Slack.</p>
                </div>
              </div>
              <Button size="sm">Conectar</Button>
            </div>

            {/* Webhooks */}
            <div className="flex items-center justify-between rounded-lg border bg-accent/5 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                  <Code className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">Webhooks</h4>
                  <p className="text-sm text-muted-foreground">Conectado - 3 webhooks ativos.</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Gerenciar</Button>
            </div>

            {/* API Keys */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <Key className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">API Keys</h4>
                  <p className="text-sm text-muted-foreground">Integre com sua propria aplicacao.</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Ver Chaves</Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-2 border-destructive/20">
          <CardHeader className="border-b border-destructive/20">
            <CardTitle className="flex items-center gap-2 text-lg text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Zona de Perigo
            </CardTitle>
            <CardDescription>
              Acoes irreversiveis que afetam sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-0 pt-6">
            <div className="flex items-center justify-between border-b py-3">
              <div>
                <h4 className="font-semibold">Exportar Dados</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Baixe uma copia de todos os seus dados.
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="font-semibold text-destructive">Excluir Conta</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Exclua permanentemente sua conta e todos os dados.
                </p>
              </div>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Conta
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="pb-4 pt-8 text-center text-sm text-muted-foreground">
          <p>Copyright &copy; 2025 Sincron Grupos</p>
        </footer>
      </div>
    </div>
  )
}
