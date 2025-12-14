# Epics e Stories: Refatoracao UX - Sincron Grupos

## Epic 1: Command Center - Estrutura Base

**Objetivo**: Criar a estrutura da pagina unificada com layout responsivo

### Story 1.1: Layout Base do Command Center
**Como** usuario do sistema
**Quero** acessar uma pagina unificada ao fazer login
**Para** ver todas as informacoes importantes de uma vez

**Criterios de Aceite:**
- [ ] Pagina `/dashboard` renderiza o Command Center
- [ ] Layout em grid: sidebar esquerda + area principal
- [ ] Header com logo, seletor de instancia, menu usuario
- [ ] Responsivo: stack em mobile, grid em desktop
- [ ] Reutiliza autenticacao existente

**Arquivos a criar/modificar:**
- `app/(dashboard)/page.tsx` - Pagina principal
- `components/command-center/layout.tsx` - Layout wrapper
- `components/command-center/header.tsx` - Header com acoes

**Estimativa:** P (pequeno)

---

### Story 1.2: Instance Panel
**Como** usuario
**Quero** ver o status da minha instancia WhatsApp
**Para** saber se estou conectado e poder gerenciar

**Criterios de Aceite:**
- [ ] Mostra status atual (conectado/desconectado)
- [ ] Se conectado: avatar, nome, telefone
- [ ] Se desconectado: QR Code para conectar
- [ ] Botao desconectar (com confirmacao)
- [ ] Loading state durante verificacao

**Arquivos a criar:**
- `components/command-center/instance-panel.tsx`
- Reutiliza logica de `/instances/page.tsx`

**Estimativa:** M (medio)

---

### Story 1.3: Instance Selector
**Como** usuario com multiplas instancias
**Quero** trocar entre instancias
**Para** gerenciar grupos de diferentes numeros

**Criterios de Aceite:**
- [ ] Dropdown no header listando instancias
- [ ] Badge de status em cada opcao
- [ ] Selecionada persiste na sessao
- [ ] Opcao "Nova Instancia" no dropdown

**Arquivos a criar:**
- `components/command-center/instance-selector.tsx`

**Estimativa:** P

---

## Epic 2: Painel de Grupos

**Objetivo**: Migrar e melhorar a visualizacao de grupos

### Story 2.1: Groups Panel - Listagem
**Como** usuario
**Quero** ver todos os meus grupos organizados por categoria
**Para** ter visao geral do que estou gerenciando

**Criterios de Aceite:**
- [ ] Lista grupos agrupados por categoria
- [ ] Categoria expansivel/colapsavel
- [ ] Badge com contagem de grupos
- [ ] Grupos sem categoria aparecem no final
- [ ] Busca/filtro de grupos
- [ ] Scroll area para muitos grupos

**Arquivos a criar:**
- `components/command-center/groups-panel.tsx`
- `components/command-center/category-group.tsx`
- `components/command-center/group-item.tsx`

**Estimativa:** M

---

### Story 2.2: Sync de Grupos do WhatsApp
**Como** usuario
**Quero** sincronizar grupos do WhatsApp
**Para** adicionar novos grupos ao sistema

**Criterios de Aceite:**
- [ ] Botao "Sincronizar" no painel de grupos
- [ ] Modal com lista de grupos disponiveis
- [ ] Checkbox para selecionar multiplos
- [ ] Selecao de categoria(s) para cada grupo
- [ ] Feedback de sucesso/erro
- [ ] Grupos ja cadastrados nao aparecem

**Arquivos:**
- Reutiliza logica de `groups/page.tsx`
- `components/command-center/sync-groups-dialog.tsx`

**Estimativa:** M

---

### Story 2.3: Group Item - Interacoes
**Como** usuario
**Quero** ver detalhes e editar um grupo rapidamente
**Para** configurar sem navegar para outra pagina

**Criterios de Aceite:**
- [ ] Click expande grupo mostrando detalhes
- [ ] Mostra: categorias, transcricao, gatilhos ativos
- [ ] Botoes de acao: Editar, Enviar Msg
- [ ] Editar abre drawer com config
- [ ] Mobile: swipe revela acoes

**Arquivos:**
- `components/command-center/group-details.tsx`
- `components/command-center/group-edit-drawer.tsx`

**Estimativa:** M

---

## Epic 3: Configuracao de Categorias

**Objetivo**: Permitir configurar categorias inline

### Story 3.1: Category Quick Actions
**Como** usuario
**Quero** configurar uma categoria sem sair da tela
**Para** economizar tempo e manter contexto

**Criterios de Aceite:**
- [ ] Botao config no header da categoria
- [ ] Abre drawer lateral (ou bottom sheet mobile)
- [ ] Abas: Geral, Transcricao, Gatilhos
- [ ] Salvar atualiza lista automaticamente

**Arquivos:**
- `components/command-center/category-config-drawer.tsx`
- Reutiliza tabs de `category-config-dialog.tsx`

**Estimativa:** M

---

### Story 3.2: Nova Categoria Inline
**Como** usuario
**Quero** criar categoria rapidamente
**Para** organizar grupos sem processo complexo

**Criterios de Aceite:**
- [ ] Botao "+ Categoria" no painel de acoes
- [ ] Form inline ou modal simples
- [ ] Nome + Cor obrigatorios
- [ ] Adiciona na lista apos criar

**Arquivos:**
- `components/command-center/new-category-form.tsx`

**Estimativa:** P

---

## Epic 4: Acoes e Mensagens

**Objetivo**: Implementar envio de mensagens e acoes rapidas

### Story 4.1: Quick Actions Panel
**Como** usuario
**Quero** ter acesso rapido as acoes principais
**Para** executar tarefas comuns com poucos cliques

**Criterios de Aceite:**
- [ ] Painel lateral com botoes de acao
- [ ] Acoes: Mensagem, Gatilhos, Transcricao, + Categoria
- [ ] Mostra resumo (ex: "3 gatilhos ativos")
- [ ] Mobile: barra inferior ou FAB

**Arquivos:**
- `components/command-center/actions-panel.tsx`

**Estimativa:** P

---

### Story 4.2: Mass Message Modal
**Como** usuario
**Quero** enviar mensagem para varios grupos
**Para** comunicar rapidamente com categorias inteiras

**Criterios de Aceite:**
- [ ] Selecionar categorias ou grupos individuais
- [ ] Compor mensagem com texto
- [ ] Preview de quantos grupos receberao
- [ ] Confirmar antes de enviar
- [ ] Feedback de envio (sucesso/erro)

**Arquivos:**
- `components/command-center/mass-message-modal.tsx`

**Estimativa:** M

---

### Story 4.3: View All Triggers
**Como** usuario
**Quero** ver todos os gatilhos configurados
**Para** ter visao geral das automacoes

**Criterios de Aceite:**
- [ ] Lista todos gatilhos por categoria
- [ ] Mostra: nome, tipo, condicao, status
- [ ] Toggle ativar/desativar inline
- [ ] Link para editar cada gatilho

**Arquivos:**
- `components/command-center/triggers-overview.tsx`

**Estimativa:** P

---

## Epic 5: Polimento e Mobile

**Objetivo**: Refinar UX e garantir funcionamento mobile

### Story 5.1: Empty States
**Como** usuario novo
**Quero** entender o que fazer quando nao ha dados
**Para** comecar a usar o sistema

**Criterios de Aceite:**
- [ ] Estado vazio para: instancia, grupos, categorias
- [ ] Ilustracao + texto explicativo + CTA
- [ ] Guia contextual de primeiros passos

**Arquivos:**
- `components/command-center/empty-states.tsx`

**Estimativa:** P

---

### Story 5.2: Loading e Error States
**Como** usuario
**Quero** feedback visual durante carregamento
**Para** saber que o sistema esta funcionando

**Criterios de Aceite:**
- [ ] Skeleton loaders para paineis
- [ ] Spinner em acoes
- [ ] Toast de erro com retry
- [ ] Mensagem de erro contextual

**Estimativa:** P

---

### Story 5.3: Mobile Optimization
**Como** usuario mobile
**Quero** usar o sistema no celular
**Para** gerenciar grupos de qualquer lugar

**Criterios de Aceite:**
- [ ] Layout stack em telas pequenas
- [ ] Bottom sheet para drawers
- [ ] Touch-friendly (min 44px hit area)
- [ ] Swipe gestures onde aplicavel

**Estimativa:** M

---

### Story 5.4: Animations e Polish
**Como** usuario
**Quero** transicoes suaves na interface
**Para** uma experiencia mais agradavel

**Criterios de Aceite:**
- [ ] Fade in para elementos
- [ ] Slide para drawers
- [ ] Expand/collapse animado
- [ ] Feedback visual em interacoes

**Estimativa:** P

---

## Prioridade de Implementacao

### Sprint 1 (MVP Funcional)
1. Story 1.1 - Layout Base
2. Story 1.2 - Instance Panel
3. Story 2.1 - Groups Panel
4. Story 2.2 - Sync Grupos

### Sprint 2 (Configuracoes)
5. Story 3.1 - Category Config
6. Story 2.3 - Group Interactions
7. Story 4.1 - Quick Actions
8. Story 4.2 - Mass Message

### Sprint 3 (Polimento)
9. Story 1.3 - Instance Selector
10. Story 3.2 - Nova Categoria
11. Story 4.3 - Triggers Overview
12. Stories 5.x - Polish

## Definicao de Done

- [ ] Codigo implementado e revisado
- [ ] Funciona em Chrome, Firefox, Safari
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Sem erros no console
- [ ] Acessivel (keyboard nav, aria labels)
- [ ] Testado manualmente
- [ ] Documentado em CLAUDE.md se necessario
