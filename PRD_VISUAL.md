# PRD VISUAL - SINCRON GRUPOS

> Documento para redesign de UI. Sistema de gestão de grupos WhatsApp para comunidades, suporte e vendas.

---

## 1. VISAO GERAL

### O que é
SaaS multi-tenant para gerenciar grupos WhatsApp. Cada organizacao conecta seu WhatsApp via QR Code e gerencia grupos, automacoes e mensagens.

### Publico-alvo
- Gestores de comunidades
- Equipes de suporte
- Times de vendas

### Escala tipica
- 10 a 120 grupos por organizacao
- Multiplos usuarios por organizacao (owner, admin, member)

### Estilo visual desejado
**Stripe-like**: Limpo, espaçado, minimalista, profissional. Hierarquia visual clara.

---

## 2. ARQUITETURA DE NAVEGACAO

### Estrutura de paginas (separadas, nao em tabs)

```
SIDEBAR
├── Dashboard (home resumida)
├── Instancias (WhatsApp)
├── Grupos
├── Categorias (tags)
├── Gatilhos (automacoes)
├── Mensagens (em massa)
├── Agentes IA
├── Transcricao
├── Equipe
└── [Configuracoes - futuro]
```

### Principio
- Cada modulo = pagina propria
- Paginas relacionadas podem ter tabs internas (ex: Transcricao por Categoria / por Grupo)
- Drawers apenas para preview rapido ou acoes secundarias
- Modais para criacao/edicao

---

## 3. JORNADA DO USUARIO NOVO

### Onboarding Flow (checklist persistente)

```
┌─────────────────────────────────────────────────────────────┐
│  BEM-VINDO AO SINCRON GRUPOS                                │
│                                                             │
│  Complete os passos para comecar:                          │
│                                                             │
│  [✓] 1. Conectar WhatsApp                                  │
│      Escaneie o QR Code para vincular seu numero           │
│                                                             │
│  [ ] 2. Sincronizar grupos                                 │
│      Importe seus grupos do WhatsApp                       │
│                                                             │
│  [ ] 3. Criar categorias                                   │
│      Organize grupos por tags (Vendas, Suporte, etc)       │
│                                                             │
│  [ ] 4. Configurar primeiro gatilho                        │
│      Crie uma automacao para moderar ou responder          │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│  [Pular setup]                        Progresso: 1/4       │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. PAGINAS DETALHADAS

### 4.1 DASHBOARD (Home)

**Proposito:** Visao geral rapida + atalhos para acoes principais

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  DASHBOARD                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ INSTANCIA    │  │ GRUPOS       │  │ GATILHOS     │      │
│  │ ✓ Conectada  │  │ 47 grupos    │  │ 12 ativos    │      │
│  │ +55 11 9...  │  │ 5 categorias │  │ 3 pausados   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ MENSAGENS    │  │ AGENTES IA   │  │ TRANSCRICAO  │      │
│  │ 3 agendadas  │  │ 2 ativos     │  │ 23 grupos    │      │
│  │ 156 enviadas │  │ Bot Vendas   │  │ configurados │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  ACOES RAPIDAS                                              │
│  [+ Nova mensagem]  [+ Novo gatilho]  [Sincronizar grupos] │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Componentes:**
- 6 cards de metricas (clicaveis, levam para a pagina)
- Secao de acoes rapidas
- Onboarding checklist (se incompleto)

---

### 4.2 INSTANCIAS

**Proposito:** Gerenciar conexao WhatsApp

**Estados:**
1. Nenhuma instancia → Empty state com CTA "Conectar WhatsApp"
2. Instancia desconectada → Card com botao "Reconectar"
3. Instancia conectada → Card com info do numero + status

**Layout conectado:**
```
┌─────────────────────────────────────────────────────────────┐
│  INSTANCIAS                                    [+ Nova]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ○ CONECTADA                                         │   │
│  │                                                      │   │
│  │  WhatsApp Comercial                                  │   │
│  │  +55 11 99999-9999                                   │   │
│  │  Conta Business • Conectado ha 3 dias               │   │
│  │                                                      │   │
│  │  [Desconectar]  [Excluir]                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Layout QR Code (ao conectar):**
```
┌─────────────────────────────────────────────────────────────┐
│  CONECTAR WHATSAPP                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│        ┌─────────────────────┐                              │
│        │                     │                              │
│        │     [QR CODE]       │                              │
│        │                     │                              │
│        └─────────────────────┘                              │
│                                                             │
│        Escaneie com seu WhatsApp                           │
│        1. Abra o WhatsApp no celular                       │
│        2. Toque em Menu > Aparelhos conectados             │
│        3. Aponte para este QR Code                         │
│                                                             │
│        Status: Aguardando conexao...                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.3 GRUPOS

**Proposito:** Ver todos os grupos, filtrar, atribuir categorias

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  GRUPOS                                    [Sincronizar]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Buscar...]  [Categoria: Todas ▼]  [Status: Todos ▼]      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ NOME              │ CATEGORIAS      │ MEMBROS │ ... │   │
│  ├───────────────────┼─────────────────┼─────────┼─────┤   │
│  │ Vendas SP         │ ● Vendas        │ 234     │  ⋮  │   │
│  │ Suporte Premium   │ ● Suporte ● VIP │ 89      │  ⋮  │   │
│  │ Comunidade Geral  │ ● Comunidade    │ 1.2k    │  ⋮  │   │
│  │ Leads Novembro    │ ● Vendas ● Temp │ 156     │  ⋮  │   │
│  │ ...               │ ...             │ ...     │  ⋮  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Mostrando 1-20 de 47 grupos           [< 1 2 3 >]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Tabela paginada (20 por pagina)
- Busca por nome
- Filtro por categoria (multi-select)
- Clique na linha abre modal de edicao
- Coluna categorias com badges coloridos
- Acao "..." → Editar, Remover

**Modal de edicao de grupo:**
```
┌─────────────────────────────────────────────────────────────┐
│  EDITAR GRUPO                                      [X]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Nome do grupo                                              │
│  [Vendas SP                                    ]            │
│                                                             │
│  Categorias                                                 │
│  [● Vendas] [● Premium] [+ Adicionar]                      │
│                                                             │
│  ID WhatsApp                                                │
│  120363041234567890@g.us (nao editavel)                    │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│  [Cancelar]                                    [Salvar]     │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.4 CATEGORIAS

**Proposito:** Criar e gerenciar tags para organizar grupos

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  CATEGORIAS                                [+ Nova]         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ COR │ NOME        │ GRUPOS │ TRANSCRICAO │ GATILHOS │   │
│  ├─────┼─────────────┼────────┼─────────────┼──────────┤   │
│  │ ●   │ Vendas      │ 12     │ Automatico  │ 3 ativos │   │
│  │ ●   │ Suporte     │ 8      │ Manual      │ 5 ativos │   │
│  │ ●   │ Comunidade  │ 23     │ Desativado  │ 1 ativo  │   │
│  │ ●   │ VIP         │ 4      │ Com resumo  │ 2 ativos │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Ao clicar em uma categoria → Modal de configuracao com tabs:**
```
┌─────────────────────────────────────────────────────────────┐
│  CATEGORIA: VENDAS                                 [X]      │
├─────────────────────────────────────────────────────────────┤
│  [Geral]  [Transcricao]  [Gatilhos]                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TAB GERAL:                                                 │
│  Nome: [Vendas                    ]                        │
│  Cor:  [● Azul ▼]                                          │
│  Grupos vinculados: 12                                      │
│                                                             │
│  TAB TRANSCRICAO:                                          │
│  Modo: [Automatico ▼]                                      │
│  Tipo: [Com resumo ▼]                                      │
│                                                             │
│  TAB GATILHOS:                                             │
│  Lista de gatilhos vinculados a esta categoria             │
│  [+ Criar gatilho para esta categoria]                     │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│  [Excluir categoria]                           [Salvar]     │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.5 GATILHOS

**Proposito:** Automacoes que reagem a eventos no WhatsApp

**Eventos disponiveis:**
- Mensagem recebida (texto, audio, imagem, video, sticker)
- Membro entrou no grupo
- Membro saiu do grupo

**Acoes disponiveis:**
- Excluir mensagem
- Enviar mensagem de resposta
- Chamar webhook externo
- Notificar administrador
- Acionar agente IA

**Layout lista:**
```
┌─────────────────────────────────────────────────────────────┐
│  GATILHOS                                      [+ Novo]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Buscar...]  [Evento: Todos ▼]  [Status: Todos ▼]         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ○ ATIVO                                              │   │
│  │ Anti-spam                                            │   │
│  │ Mensagem recebida → Excluir mensagem                │   │
│  │ Categorias: Vendas, Suporte                         │   │
│  │ Condicoes: Contem link E nao e admin                │   │
│  │                                         [Editar] [⋮]│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ○ ATIVO                                              │   │
│  │ Boas-vindas                                          │   │
│  │ Membro entrou → Enviar mensagem                     │   │
│  │ Categorias: Comunidade                              │   │
│  │                                         [Editar] [⋮]│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ● PAUSADO                                            │   │
│  │ Bot de vendas                                        │   │
│  │ Mensagem recebida → Acionar agente IA               │   │
│  │ Categorias: Vendas                                  │   │
│  │                                         [Editar] [⋮]│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Editor de gatilho (pagina dedicada):**
```
┌─────────────────────────────────────────────────────────────┐
│  ← Voltar                              CRIAR GATILHO        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  NOME DO GATILHO                                           │
│  [Anti-spam de links                           ]           │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│                                                             │
│  QUANDO (Evento)                                           │
│  [Mensagem recebida ▼]                                     │
│                                                             │
│  EM (Escopo)                                               │
│  ○ Todos os grupos                                         │
│  ● Categorias especificas: [Vendas ▼] [+ Adicionar]       │
│  ○ Grupos especificos: [Selecionar...]                     │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│                                                             │
│  SE (Condicoes)                           [+ Adicionar]    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Mensagem [contem ▼] [http                    ]      │   │
│  │ [E ▼]                                               │   │
│  │ Remetente [nao e ▼] [admin do grupo ▼]             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│                                                             │
│  ENTAO (Acao)                                              │
│  [Excluir mensagem ▼]                                      │
│                                                             │
│  Configuracao da acao:                                     │
│  (campos dinamicos baseado na acao selecionada)            │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│  [Cancelar]                    [Testar]  [Salvar gatilho]  │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.6 MENSAGENS

**Proposito:** Envio de mensagens em massa (imediato ou agendado)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  MENSAGENS                                 [+ Nova]         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Tab: Agendadas]  [Tab: Enviadas]  [Tab: Rascunhos]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ DATA/HORA  │ TIPO  │ DESTINO      │ STATUS   │ ... │   │
│  ├────────────┼───────┼──────────────┼──────────┼─────┤   │
│  │ Hoje 15:00 │ Texto │ Cat: Vendas  │ Agendada │  ⋮  │   │
│  │ Hoje 10:30 │ Imagem│ 5 grupos     │ Enviada  │  ⋮  │   │
│  │ Ontem 18:00│ Texto │ Cat: Suporte │ Enviada  │  ⋮  │   │
│  │ 12/12 09:00│ Audio │ 12 grupos    │ Erro     │  ⋮  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Modal de nova mensagem:**
```
┌─────────────────────────────────────────────────────────────┐
│  NOVA MENSAGEM                                     [X]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TIPO DE MENSAGEM                                          │
│  [● Texto] [○ Imagem] [○ Video] [○ Audio]                  │
│                                                             │
│  CONTEUDO                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Ola! Temos novidades para voce...                   │   │
│  │                                                      │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│  Variaveis: {nome} {grupo}                                 │
│                                                             │
│  DESTINATARIOS                                             │
│  ○ Categorias: [Vendas ▼] [Suporte ▼]                     │
│  ● Grupos especificos: [Selecionar...]                     │
│                                                             │
│  AGENDAMENTO                                               │
│  ○ Enviar agora                                            │
│  ● Agendar para: [14/12/2024] [15:00]                     │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│  [Salvar rascunho]              [Agendar] ou [Enviar]      │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.7 AGENTES IA

**Proposito:** Bots inteligentes que respondem automaticamente

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  AGENTES IA                                    [+ Novo]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ● ATIVO                                     [Toggle]│   │
│  │                                                      │   │
│  │ Bot de Vendas                                       │   │
│  │ Responde duvidas sobre produtos e precos           │   │
│  │                                                      │   │
│  │ Modelo: GPT-4o • Temp: 0.7 • Tokens: 1000          │   │
│  │ Ativado em: 3 gatilhos                             │   │
│  │                                                      │   │
│  │ [Editar]  [Duplicar]  [Excluir]                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ○ INATIVO                                   [Toggle]│   │
│  │                                                      │   │
│  │ Assistente de Suporte                               │   │
│  │ Ajuda com problemas tecnicos e duvidas             │   │
│  │                                                      │   │
│  │ Modelo: Claude 3 • Temp: 0.5 • Tokens: 2000        │   │
│  │ Ativado em: 1 gatilho                              │   │
│  │                                                      │   │
│  │ [Editar]  [Duplicar]  [Excluir]                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Modal de edicao:**
```
┌─────────────────────────────────────────────────────────────┐
│  EDITAR AGENTE                                     [X]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  NOME                                                      │
│  [Bot de Vendas                                ]           │
│                                                             │
│  DESCRICAO                                                 │
│  [Responde duvidas sobre produtos e precos     ]           │
│                                                             │
│  MODELO                                                    │
│  [GPT-4o ▼]                                                │
│                                                             │
│  PROMPT DO SISTEMA                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Voce e um assistente de vendas da empresa X.        │   │
│  │ Responda de forma amigavel e direta.                │   │
│  │ Produtos disponiveis: ...                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  CONFIGURACOES AVANCADAS                                   │
│  Temperatura: [0.7          ] (0 = preciso, 1 = criativo)  │
│  Max tokens:  [1000         ]                              │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│  [Cancelar]                    [Testar]  [Salvar]          │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.8 TRANSCRICAO

**Proposito:** Converter audios em texto automaticamente

**Layout (2 tabs internas):**
```
┌─────────────────────────────────────────────────────────────┐
│  TRANSCRICAO                           Emoji: ✍️ [Alterar]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Tab: Por Categoria]  [Tab: Por Grupo]                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TAB POR CATEGORIA:                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ CATEGORIA   │ GRUPOS │ MODO       │ TIPO      │     │   │
│  ├─────────────┼────────┼────────────┼───────────┼─────┤   │
│  │ ● Vendas    │ 12     │ Automatico │ Simples   │     │   │
│  │ ● Suporte   │ 8      │ Manual ✍️  │ C/ Resumo │     │   │
│  │ ● Comunidade│ 23     │ Desativado │ -         │     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  TAB POR GRUPO:                                            │
│  (similar, mas com grupos individuais)                     │
│  Grupos herdam config da categoria, mas podem sobrescrever │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Modos:**
- Desativado: Nao transcreve
- Automatico: Todo audio e transcrito
- Manual: Reaja com emoji (ex: ✍️) para transcrever

**Tipos:**
- Simples: Apenas transcricao
- Com resumo: Transcricao + resumo gerado por IA

---

### 4.9 EQUIPE

**Proposito:** Gerenciar usuarios e permissoes

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  EQUIPE                                    [+ Convidar]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MEMBROS (4)                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ NOME          │ EMAIL              │ ROLE   │ ...   │   │
│  ├───────────────┼────────────────────┼────────┼───────┤   │
│  │ Joao Silva    │ joao@empresa.com   │ Owner  │   ⋮   │   │
│  │ Maria Santos  │ maria@empresa.com  │ Admin  │   ⋮   │   │
│  │ Pedro Costa   │ pedro@empresa.com  │ Member │   ⋮   │   │
│  │ Ana Lima      │ ana@empresa.com    │ Member │   ⋮   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  CONVITES PENDENTES (1)                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ carlos@empresa.com • Admin • Expira em 5 dias       │   │
│  │                              [Reenviar] [Cancelar]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Roles:**
- Owner: Todas as permissoes (nao pode ser alterado)
- Admin: Todas exceto gerenciar usuarios
- Member: Permissoes individuais configuradas

**Permissoes disponiveis:**
- Gerenciar instancias
- Gerenciar grupos
- Gerenciar categorias
- Enviar mensagens
- Configurar comandos
- Configurar gatilhos
- Ver analytics (futuro)
- Gerenciar usuarios

---

## 5. COMPONENTES GLOBAIS

### 5.1 Sidebar
```
┌──────────────────────┐
│  SINCRON             │
│  [Logo]              │
├──────────────────────┤
│  Dashboard           │
│  Instancias          │
│  Grupos              │
│  Categorias          │
│  Gatilhos            │
│  Mensagens           │
│  Agentes IA          │
│  Transcricao         │
├──────────────────────┤
│  Equipe              │
├──────────────────────┤
│  [Avatar] Joao       │
│  Org: Empresa X      │
│  [Sair]              │
└──────────────────────┘
```

- Icones + Labels
- Indicador de pagina ativa
- Colapsavel em mobile
- Badge de notificacao onde aplicavel

### 5.2 Empty States

Cada pagina vazia deve ter:
- Ilustracao simples (icone grande ou SVG)
- Titulo explicativo
- Descricao breve
- CTA primario
- Link "Saiba mais" opcional

Exemplo:
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    [Ilustracao]                            │
│                                                             │
│              Nenhum gatilho configurado                    │
│                                                             │
│    Gatilhos automatizam acoes quando eventos acontecem    │
│    nos seus grupos, como excluir spam ou dar boas-vindas. │
│                                                             │
│                 [Criar primeiro gatilho]                   │
│                                                             │
│                    Como funcionam →                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Toasts/Notificacoes

- Sucesso: Verde, icone check
- Erro: Vermelho, icone X
- Info: Azul, icone info
- Posicao: Canto inferior direito
- Auto-dismiss em 5s

### 5.4 Loading States

- Skeleton loaders para listas/tabelas
- Spinner central para paginas inteiras
- Botoes com loading state inline

---

## 6. RESPONSIVIDADE

### Desktop (>1024px)
- Sidebar fixa lateral
- Tabelas completas
- Modais centralizados

### Tablet (768-1024px)
- Sidebar colapsavel
- Tabelas com scroll horizontal
- Modais fullscreen

### Mobile (<768px)
- Sidebar como drawer
- Tabelas viram cards empilhados
- Modais fullscreen
- Botoes de acao como FAB

---

## 7. TEMAS

### Cores principais (Light mode)
- Background: #FFFFFF
- Surface: #F9FAFB
- Border: #E5E7EB
- Text primary: #111827
- Text secondary: #6B7280
- Primary: #2563EB (azul)
- Success: #10B981 (verde)
- Warning: #F59E0B (amarelo)
- Error: #EF4444 (vermelho)

### Dark mode (futuro)
- Invertido com mesma paleta

---

## 8. TIPOGRAFIA

- Font: Inter (ou system-ui)
- Headings: 600-700 weight
- Body: 400 weight
- Monospace: JetBrains Mono (para IDs, tokens)

Escala:
- H1: 24px / 32px line-height
- H2: 20px / 28px
- H3: 16px / 24px
- Body: 14px / 20px
- Small: 12px / 16px

---

## 9. MICRO-INTERACOES

- Hover em cards: leve elevacao (shadow)
- Hover em botoes: escurecimento sutil
- Toggle switches: animacao suave
- Transicoes de pagina: fade 150ms
- Modais: slide up + fade

---

## 10. ACESSIBILIDADE

- Contraste minimo WCAG AA
- Focus visible em todos interativos
- Labels em todos os inputs
- Roles ARIA onde necessario
- Navegacao por teclado funcional

---

## 11. PROXIMOS PASSOS (NAO IMPLEMENTAR AGORA)

- [ ] Comandos (/ajuda, /regras, etc)
- [ ] Feeds RSS
- [ ] Configuracoes da organizacao
- [ ] Analytics/Relatorios
- [ ] Dark mode
- [ ] Planos e billing

---

## NOTAS PARA A IA DE DESIGN

1. **Estilo Stripe**: Clean, muito espaco em branco, hierarquia clara
2. **Consistencia**: Todos os modais, tabelas, cards seguem mesmo padrao
3. **Foco no essencial**: Nao adicionar elementos decorativos desnecessarios
4. **Mobile-first na logica**: Mas desktop e o uso principal
5. **Estados**: Sempre considerar empty, loading, error, success

---

*Documento gerado em 14/12/2024 para redesign do Sincron Grupos*
