# Tech Spec: Refatoracao UX/UI - Sincron Grupos

## Problema e Solucao

**Problema**: Sistema atual fragmentado em 12+ paginas separadas. Usuario precisa navegar entre muitas telas para gerenciar instancias, grupos, categorias, gatilhos e transcricao.

**Solucao**: Interface unificada "Command Center" onde tudo e visivel e editavel na mesma tela. Foco em simplicidade e produtividade.

## Escopo MVP da Refatoracao

### Funcionalidades Core (Manter)
1. **Instancias WhatsApp** - Criar, conectar (QR), desconectar, status
2. **Grupos** - Visualizar, categorizar, sincronizar do WhatsApp
3. **Categorias** - CRUD com cores, organizar grupos
4. **Gatilhos** - Definir triggers por categoria/grupo
5. **Transcricao** - Configurar modo de transcricao de audios
6. **Mensagens** - Envio em massa por categoria

### Funcionalidades Removidas (Simplificar)
- Dashboard separado (integrado no Command Center)
- Comandos (/commands) - v2
- RSS Feeds - v2
- IA separada - v2
- Pagina Team (manter apenas settings)

## Stack Tecnico

### Existente (Manter)
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase (PostgreSQL)
- UAZAPI (WhatsApp API)

### Padroes de Codigo
- Componentes funcionais com hooks
- `use client` para componentes interativos
- Supabase client: `createClient()` de `@/lib/supabase/client`
- Toast notifications: `sonner`
- Icons: `lucide-react`

### Estrutura de Arquivos (Nova)
```
app/
  (auth)/                  # Manter - login, signup, onboarding
  (dashboard)/
    page.tsx               # NOVO: Command Center (tela unica)
    settings/page.tsx      # Simplificar - apenas conta
  api/uazapi/              # Manter - proxy routes
```

### Componentes Existentes (Reutilizar)
- `components/ui/*` - shadcn components
- `components/category-config-dialog.tsx` - Dialog de config
- `components/transcription-config-tab.tsx` - Config transcricao
- `components/triggers-config-tab.tsx` - Config gatilhos
- `hooks/use-permissions.ts` - Sistema de permissoes

## Tabelas Supabase (Existentes)

```sql
-- Organizacoes (tenants)
organizacoes (id, nome, slug, plano, ativo)

-- Usuarios
usuarios_sistema (id, email, nome, id_organizacao, tipo, permissoes)

-- WhatsApp
instancias_whatsapp (id, id_organizacao, nome_instancia, api_key, status, numero_telefone)

-- Grupos
grupos (id, id_organizacao, id_instancia, chat_id_whatsapp, nome, id_categoria, ativo)
grupos_categorias (id_grupo, id_categoria) -- N:N

-- Categorias
categorias (id, id_organizacao, nome, cor, descricao, ordem, ativo)

-- Config
config_transcricao (id, id_categoria, id_grupo, modo, tipo_transcricao, emoji_gatilho)
gatilhos (id, id_categoria, nome, tipo_gatilho, condicao, acao, ativo)
```

## Arquitetura da Nova Interface

### Layout Principal (Command Center)

```
+--------------------------------------------------+
|  Header: Logo | Instancia Seletor | User Menu    |
+--------------------------------------------------+
|                                                  |
|  +-------------+  +---------------------------+  |
|  | INSTANCIAS  |  |        GRUPOS             |  |
|  | - Status    |  |  [Filtro] [+ Sincronizar] |  |
|  | - QR Code   |  |                           |  |
|  | - Conectar  |  |  Cat 1 (3)  [Config]      |  |
|  +-------------+  |    - Grupo A  [Edit]      |  |
|                   |    - Grupo B  [Edit]      |  |
|  +-------------+  |    - Grupo C  [Edit]      |  |
|  | ACOES       |  |                           |  |
|  | Mensagens   |  |  Cat 2 (2)  [Config]      |  |
|  | Gatilhos    |  |    - Grupo D              |  |
|  | Transcricao |  |    - Grupo E              |  |
|  +-------------+  |                           |  |
|                   |  Sem Categoria (1)        |  |
|                   |    - Grupo F              |  |
|                   +---------------------------+  |
|                                                  |
+--------------------------------------------------+
```

### Estados de Interface

1. **Sem Instancia**: Mostrar wizard de criacao
2. **Instancia Desconectada**: QR Code em destaque
3. **Instancia Conectada**: Dashboard completo
4. **Sem Grupos**: CTA para sincronizar

### Componentes Novos

```tsx
// Painel de Instancia
components/command-center/instance-panel.tsx

// Lista de Grupos por Categoria
components/command-center/groups-panel.tsx

// Painel de Acoes Rapidas
components/command-center/actions-panel.tsx

// Dialogs de Configuracao (inline ou modal)
components/command-center/config-drawer.tsx
```

## Fluxo de Implementacao

### Epic 1: Command Center Base
1. Criar estrutura da pagina unificada
2. Migrar logica de instancias
3. Implementar seletor de instancia

### Epic 2: Painel de Grupos
1. Migrar listagem de grupos agrupados
2. Implementar config inline de categoria
3. Botoes de acao rapida por grupo

### Epic 3: Acoes e Configuracoes
1. Drawer de configuracao de gatilhos
2. Drawer de transcricao
3. Modal de mensagens em massa

### Epic 4: Polimento
1. Estados vazios e loading
2. Responsividade mobile
3. Animacoes e transicoes

## Criterios de Aceite

- [ ] Usuario visualiza tudo em uma tela
- [ ] Configurar categoria sem sair da tela
- [ ] Editar grupo inline
- [ ] Status da instancia sempre visivel
- [ ] Funciona em mobile (drawer ao inves de paineis)
- [ ] Nao quebra autenticacao existente
- [ ] Performance aceitavel (<2s para carregar)

## Riscos e Mitigacoes

| Risco | Mitigacao |
|-------|-----------|
| Complexidade do componente | Dividir em sub-componentes |
| Performance com muitos grupos | Virtualizacao ou paginacao |
| Responsividade | Mobile-first com drawers |
| Regressao de funcionalidades | Testes E2E antes de merge |

## Proximos Passos

1. Aprovar esta spec
2. Criar UX Design detalhado
3. Implementar Epic 1
4. Review e iteracao
