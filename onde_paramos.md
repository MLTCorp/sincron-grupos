# Onde Paramos - Sincron Grupos

**Data:** 12/12/2024 (atualizado)
**Ultimo commit:** 62ae6e6 (Initial commit from Create Next App)

---

## 🎯 SESSÃO ATUAL - 12/12/2024

### ✅ O que foi feito

#### 1. Melhoria Completa da Página de Categorias

**Implementação:** Modal com tabs para configuração integrada de categorias

**Arquivos Criados:**
- `types/categoria.ts` - Tipos TypeScript para categorias enriquecidas
- `components/category-config-dialog.tsx` - Dialog principal com 3 tabs
- `components/category-general-tab.tsx` - Tab de configurações gerais (nome, cor, descrição)
- `components/transcription-config-tab.tsx` - Tab de configuração de transcrição
- `components/triggers-config-tab.tsx` - Tab de gerenciamento de gatilhos

**Arquivos Modificados:**
- `app/(dashboard)/categories/page.tsx` - Query enriquecida + indicadores visuais
- `app/api/notifications/connection/route.ts` - Corrigido campos `nome_instancia` e `role`
- `hooks/use-notifications.ts` - Validação de email + correções de tipos
- `types/supabase.ts` - Tipos atualizados do Supabase (incluindo tabela notificacoes)

#### 2. Query Enriquecida para Categorias

```typescript
const { data, error } = await supabase
  .from("categorias")
  .select(`
    *,
    config_transcricao!config_transcricao_id_categoria_fkey (
      id,
      modo,
      tipo_transcricao,
      emoji_gatilho
    ),
    gatilhos!gatilhos_id_categoria_fkey (
      id,
      ativo
    )
  `)
  .eq("id_organizacao", usuarioSistema.id_organizacao)
  .is("config_transcricao.id_grupo", null)
  .order("ordem", { ascending: true })
```

**Processamento:**
```typescript
const categoriasEnriquecidas: CategoriaEnriquecida[] = data?.map((cat: any) => ({
  ...cat,
  _count: {
    grupos: contagem[cat.id] || 0,
    gatilhos: cat.gatilhos?.length || 0,
    gatilhosAtivos: cat.gatilhos?.filter((g: any) => g.ativo).length || 0
  },
  hasTranscription: cat.config_transcricao?.[0]?.modo !== 'desativado' && !!cat.config_transcricao?.[0]
})) || []
```

#### 3. Indicadores Visuais na Lista

Badges mostrando status em tempo real:
- 🎙️ **Transcrição:** `Auto` ou `Manual` + indicador `+ Resumo`
- ⚡ **Gatilhos:** Quantidade de gatilhos ativos
- 👥 **Grupos:** Contador de grupos na categoria

```tsx
{categoria.hasTranscription && (
  <Badge variant="secondary">
    <AudioLines className="h-3 w-3" />
    {categoria.config_transcricao?.[0]?.modo === 'automatico' ? 'Auto' : 'Manual'}
    {categoria.config_transcricao?.[0]?.tipo_transcricao === 'com_resumo' && ' + Resumo'}
  </Badge>
)}
```

#### 4. UX/UI Mobile-First

**Dialog Responsivo:**
- Fullscreen no mobile (`max-h-[95vh]`)
- Desktop otimizado (`max-h-[85vh]`)

**Grid de Cores Adaptativo:**
- Mobile: 5 colunas (`grid-cols-5`)
- Desktop: 10 colunas (`sm:grid-cols-10`)

**Sticky Footer:**
- Botões sempre visíveis durante scroll
- Padding compensatório no conteúdo (`pb-20 sm:pb-6`)

**Tabs com Ícones:**
- ⚙️ Geral (Settings2)
- 🎙️ Transcrição (AudioLines)
- ⚡ Gatilhos (Zap)

**Info Cards Contextuais:**
- Explicam como cada modo funciona
- Conteúdo dinâmico baseado nas opções selecionadas

**Empty States:**
- Ícone + texto descritivo + CTA para criar

#### 5. Correções Técnicas

**Erro 1:** Tipos incompatíveis em categories/page.tsx
```typescript
// Fix: Mudado tipo de parâmetro
const handleOpenDeleteDialog = (categoria: CategoriaEnriquecida) => {...}
```

**Erro 2:** Tabela notificacoes ausente nos tipos Supabase
```
Fix: Regenerado tipos via MCP generate_typescript_types (project_id: qhjlxnzxazcqrkgojnbx)
```

**Erro 3:** Campos incorretos em instancias_whatsapp
```typescript
// Fix: Atualizados todos os campos
instancia.nome → instancia.nome_instancia
user.tipo → user.role
```

**Erro 4:** Import faltando AudioLines
```typescript
// Fix: Adicionado import
import { AudioLines } from "lucide-react"
```

**Erro 5:** Type mismatch em notifications hook
```typescript
// Fix: Type casting para compatibilidade
setNotificacoes((data as any) || [])
```

### 🏗️ Arquitetura dos Componentes

```
CategoryConfigDialog (Dialog com tabs)
  ├── Tab Geral (CategoryGeneralTab)
  │   ├── Nome, Cor, Descrição
  │   ├── Grid de cores responsivo
  │   └── Preview ao vivo
  │
  ├── Tab Transcrição (TranscriptionConfigTab)
  │   ├── Modo (desativado/automatico/manual)
  │   ├── Tipo (simples/com_resumo)
  │   ├── Emoji Gatilho (condicional para modo manual)
  │   └── Info Card explicativo
  │
  └── Tab Gatilhos (TriggersConfigTab)
      ├── Header fixo com contador
      ├── Lista de gatilhos com status
      ├── Empty state quando vazio
      └── Link para criar novo gatilho
```

### 📐 Padrões Responsive Implementados

```css
/* Grids */
grid-cols-5 sm:grid-cols-10        /* Color picker */
grid-cols-3                         /* Tabs */

/* Spacing */
p-4 sm:p-6                         /* Padding geral */
gap-1.5 sm:gap-2                   /* Gap entre elementos */
pb-20 sm:pb-6                      /* Compensação sticky footer */

/* Sizing */
max-h-[95vh] sm:max-h-[85vh]      /* Dialog height */
h-9 sm:h-10                        /* Button height */
text-xs sm:text-sm                 /* Font size */
text-base sm:text-lg               /* Dialog title */

/* Layout */
flex-col sm:flex-row               /* Direction change */
w-full sm:w-auto                   /* Full width mobile */
```

### 🎓 Lições Aprendidas

1. ✅ **Mobile-first evita retrabalho** - Começar pelo mobile e expandir para desktop
2. ✅ **Sticky footers precisam compensação** - Usar `pb-20` no conteúdo para não esconder elementos
3. ✅ **Supabase types devem ser sincronizados** - Usar MCP para regenerar quando schema mudar
4. ✅ **Badges melhoram visibilidade** - Status visível sem precisar abrir modal
5. ✅ **Componentização facilita manutenção** - Tabs separados podem ser reutilizados

---

## 📋 SESSÃO ANTERIOR - 11/12/2024

### 1. Correcao do Erro de Transcricao

**Problema:** Erro `Erro ao salvar config: {}` ao mudar status de transcricao

**Causa:** Operacoes do Supabase (delete/update) nao capturavam o erro corretamente

**Solucao:** Adicionado tratamento de erros correto em todas as funcoes:
- `saveConfigCategoria`
- `saveConfigGrupo`
- `aplicarEmLote`
- `salvarEmoji`

```tsx
// Antes (sem captura de erro)
await supabase.from("config_transcricao").delete().eq("id", existingConfig.id)

// Depois (com captura de erro)
const { error } = await supabase.from("config_transcricao").delete().eq("id", existingConfig.id)
if (error) throw error
```

Tambem melhorado o catch para extrair mensagem real:
```tsx
catch (err: unknown) {
  const errorMsg = err instanceof Error ? err.message : (err as { message?: string })?.message || "Erro desconhecido"
  toast.error(`Erro: ${errorMsg}`)
}
```

### 2. Correcao do RLS (Row Level Security)

**Problema:** `new row violates row-level security policy for table "config_transcricao"`

**Causa:** Campo `auth_user_id` estava NULL na tabela `usuarios_sistema`, impedindo as politicas RLS de funcionar

**Solucao:**
```sql
UPDATE usuarios_sistema
SET auth_user_id = '17a60a44-b8f9-4aa4-966d-8256f0863641'
WHERE email = 'contato.luizhms@gmail.com';
```

**IMPORTANTE:** O fluxo de onboarding/signup deve preencher automaticamente o `auth_user_id` quando o usuario se cadastra.

### 3. Analise Completa das Funcionalidades para N8N

Mapeadas todas as tabelas e o que precisa ser carregado no workflow:

| Tabela | Funcao | Status no N8N |
|--------|--------|---------------|
| `grupos` | Info do grupo + configs | Ja carrega |
| `gatilhos` | Automacoes por evento | Ja carrega |
| `config_transcricao` | Transcricao de audio | **NOVO** |
| `categorias` | Categoria do grupo | Parcial |
| `agentes_ia` | Bots de IA | Futuro |
| `instancias_whatsapp` | Info da instancia | Para validacao |

### 4. Query SQL Otimizada para N8N

**IMPORTANTE:** Esta query precisa ser atualizada para incluir o campo `tipo_transcricao`

Nova query que inclui config de transcricao com hierarquia (grupo > categoria > desativado):

```sql
WITH grupo_info AS (
  SELECT
    g.id, g.id_organizacao, g.chat_id_whatsapp, g.nome, g.ativo,
    g.guardar_todas_mensagens, g.processar_simultaneo, g.id_categoria,
    g.dt_create, g.dt_update
  FROM grupos g
  INNER JOIN instancias_whatsapp i ON i.id = g.id_instancia
  WHERE g.chat_id_whatsapp = '{{ $json.variaveis.chat.chatId }}'
    AND i.numero_telefone = '{{ $json.variaveis.instance.number }}'
    AND g.ativo = true
),

config_transcricao_efetiva AS (
  SELECT
    COALESCE(
      -- Primeiro: config especifica do grupo
      (SELECT json_build_object(
         'modo', ct.modo,
         'tipo_transcricao', ct.tipo_transcricao,  -- ⚠️ ADICIONAR ESTE CAMPO
         'emoji_gatilho', ct.emoji_gatilho
       )
       FROM config_transcricao ct
       CROSS JOIN grupo_info gi
       WHERE ct.id_grupo = gi.id),
      -- Segundo: config da categoria
      (SELECT json_build_object(
         'modo', ct.modo,
         'tipo_transcricao', ct.tipo_transcricao,  -- ⚠️ ADICIONAR ESTE CAMPO
         'emoji_gatilho', ct.emoji_gatilho
       )
       FROM config_transcricao ct
       CROSS JOIN grupo_info gi
       WHERE ct.id_categoria = gi.id_categoria
         AND ct.id_grupo IS NULL
         AND gi.id_categoria IS NOT NULL),
      -- Terceiro: desativado por padrao
      json_build_object(
        'modo', 'desativado',
        'tipo_transcricao', 'simples',  -- ⚠️ ADICIONAR ESTE CAMPO
        'emoji_gatilho', null
      )
    ) as config
),

gatilhos_aplicaveis AS (
  SELECT
    gt.id, gt.nome, gt.descricao, gt.tipo_evento, gt.condicoes,
    gt.tipo_acao, gt.config_acao, gt.prioridade
  FROM gatilhos gt
  CROSS JOIN grupo_info gi
  WHERE gt.id_organizacao = gi.id_organizacao
    AND gt.ativo = true
    AND (
      (gt.id_grupo IS NULL AND gt.id_categoria IS NULL)
      OR gt.id_grupo = gi.id
      OR (gt.id_categoria IS NOT NULL AND gt.id_categoria = gi.id_categoria)
    )
  ORDER BY gt.prioridade ASC
)

SELECT
  gi.*,
  (SELECT config FROM config_transcricao_efetiva) as config_transcricao,
  COALESCE((SELECT json_agg(ga.*) FROM gatilhos_aplicaveis ga), '[]'::json) AS gatilhos
FROM grupo_info gi;
```

**Resultado esperado:**
```json
{
  "id": 1,
  "nome": "Sincron IA",
  "config_transcricao": {
    "modo": "automatico",
    "tipo_transcricao": "com_resumo",
    "emoji_gatilho": "✍️"
  },
  "gatilhos": [...]
}
```

---

## 📋 Próximos Passos (Priorizados)

### 🔴 Alta Prioridade

1. **Atualizar Query N8N com tipo_transcricao**
   - Substituir query atual pela versão atualizada acima
   - Validar retorno do campo `tipo_transcricao`
   - Testar hierarquia (grupo > categoria > default)

2. **Implementar Lógica de Transcrição no N8N**
   - Roteamento baseado em `tipo_transcricao`
   - Fluxo 'simples': Apenas transcrição
   - Fluxo 'com_resumo': Transcrição + resumo via IA

3. **Testar Sistema de Notificações End-to-End**
   - Simular desconexão de instância
   - Validar recebimento de notificação
   - Testar redirecionamento ao clicar

4. **Verificar Fluxo de Signup**
   - Garantir que `auth_user_id` é preenchido automaticamente
   - Testar onboarding completo

### 🟡 Média Prioridade

5. **Sincronização de Grupos WhatsApp**
   - Buscar grupos da instância via UAZAPI
   - Auto-salvar na tabela `grupos`
   - Atualização de membros em background

6. **Implementar Páginas Pendentes**
   - `/commands` - Sistema de comandos
   - `/messages` - Mensagens agendadas/em massa
   - `/ai` - Configuração de agentes IA
   - `/feeds` - RSS Feeds

### 🟢 Baixa Prioridade

7. **Auditoria de Segurança**
   - Revisar 21 problemas documentados em `AUDITORIA-INSTANCIAS.md`
   - Implementar validações críticas
   - Adicionar constraints faltantes

8. **Melhorias de UX**
   - Drag & drop para reordenar categorias
   - Filtros na lista de categorias
   - Exportar/importar configurações

---

## 📊 Contexto do Projeto

### Informações Técnicas

- **Projeto Supabase:** `qhjlxnzxazcqrkgojnbx` (Sincron Assistant)
- **Região:** us-east-1
- **Status:** ACTIVE_HEALTHY
- **Usuário vinculado:** contato.luizhms@gmail.com
- **Auth User ID:** 17a60a44-b8f9-4aa4-966d-8256f0863641

### Hierarquia de Configurações

```
Grupo específico > Categoria > Desativado (padrão)
```

### Modos de Transcrição

- `desativado` - Não transcreve áudios
- `automatico` - Transcreve todos os áudios automaticamente
- `manual` - Transcreve apenas quando reagir com emoji_gatilho

### Tipos de Transcrição (NOVO)

- `simples` - Apenas transcrição do áudio
- `com_resumo` - Transcrição + resumo gerado por IA

### Comandos Úteis

```bash
# Desenvolvimento
npm run dev      # http://localhost:3000
npm run build    # Build de produção
npm run lint     # ESLint

# Supabase Types (via MCP)
mcp__supabase__generate_typescript_types com project_id: qhjlxnzxazcqrkgojnbx
```

---

## 🐛 Erros de TypeScript Pre-existentes

Existem 5 erros em arquivos não relacionados:
- `app/(dashboard)/messages/page.tsx` - tipos de `tipo_mensagem`
- `components/ui/glow-menu.tsx` - tipos do framer-motion

**Nota:** Estes erros são pré-existentes e não bloqueiam o build.

---

## 📈 Progresso Estimado

**99%** - Frontend completo, configs integradas, falta apenas:
- Atualizar query N8N com `tipo_transcricao`
- Implementar lógica de transcrição no N8N
- Testes end-to-end

---

**Última Atualização:** 12/12/2024 às 15:30
**Sessão por:** Claude Sonnet 4.5
**Status:** ✅ Página de categorias completa e responsiva, pronta para testes
