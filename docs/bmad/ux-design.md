# UX Design: Command Center - Sincron Grupos

## Filosofia de Design

### Principios
1. **Tudo Visivel** - Informacoes importantes sempre na tela
2. **Editar no Local** - Evitar navegacao desnecessaria
3. **Hierarquia Clara** - Grupos > Categorias > Configuracoes
4. **Mobile-First** - Funciona em qualquer dispositivo

### Tom Visual
- Clean e funcional (inspirado em Notion, Linear)
- Cores neutras com acentos coloridos (categorias)
- Espacamento generoso, tipografia clara
- Animacoes sutis de feedback

## Estrutura de Layout

### Desktop (>1024px)

```
+------------------------------------------------------------------+
|  [Logo]  Sincron Grupos          [Instancia v]  [?]  [Avatar v]  |
+------------------------------------------------------------------+
|                                                                  |
|  +------------------+  +--------------------------------------+  |
|  |                  |  |                                      |  |
|  |  INSTANCIA       |  |  GRUPOS                    [+Sync]   |  |
|  |  +-----------+   |  |                                      |  |
|  |  | Status    |   |  |  [Buscar grupos...]       [Filtrar]  |  |
|  |  | Conectado |   |  |                                      |  |
|  |  +-----------+   |  |  +--------------------------------+  |  |
|  |  +55 11 99999    |  |  |  VENDAS (3)         [Cfg] [+]  |  |  |
|  |                  |  |  |  +----------------------------+|  |  |
|  |  [Desconectar]   |  |  |  | Grupo Vendas SP    [Edit] ||  |  |
|  |                  |  |  |  | Grupo Vendas RJ    [Edit] ||  |  |
|  |  +-----------+   |  |  |  | Leads Quentes      [Edit] ||  |  |
|  |  | +Nova     |   |  |  |  +----------------------------+|  |  |
|  |  | Instancia |   |  |  +--------------------------------+  |  |
|  |  +-----------+   |  |                                      |  |
|  |                  |  |  +--------------------------------+  |  |
|  +------------------+  |  |  SUPORTE (2)        [Cfg] [+]  |  |  |
|                        |  |  +----------------------------+|  |  |
|  +------------------+  |  |  | Atendimento        [Edit] ||  |  |
|  |                  |  |  |  | SAC Premium        [Edit] ||  |  |
|  |  ACOES RAPIDAS   |  |  |  +----------------------------+|  |  |
|  |                  |  |  +--------------------------------+  |  |
|  |  [Mensagem]      |  |                                      |  |
|  |  [Gatilhos]      |  |  +--------------------------------+  |  |
|  |  [Transcricao]   |  |  |  SEM CATEGORIA (1)         [+] |  |  |
|  |  [+ Categoria]   |  |  |  +----------------------------+|  |  |
|  |                  |  |  |  | Grupo Geral        [Edit] ||  |  |
|  +------------------+  |  |  +----------------------------+|  |  |
|                        |  +--------------------------------+  |  |
+------------------------------------------------------------------+
```

### Tablet (768-1024px)
- Layout similar, paineis mais estreitos
- Acoes rapidas viram botoes flutuantes

### Mobile (<768px)
- Layout em pilha (stack)
- Bottom sheet para acoes
- Swipe para revelar acoes em grupos

```
+---------------------------+
|  [=]  Sincron    [Avatar] |
+---------------------------+
|  Instancia: Empresa X     |
|  Status: Conectado        |
|  [Ver detalhes]           |
+---------------------------+
|                           |
|  GRUPOS              [+]  |
|  [Buscar...]              |
|                           |
|  VENDAS (3)          [>]  |
|  +---------------------+  |
|  | Grupo Vendas SP     |  |
|  | Grupo Vendas RJ     |  |
|  | Leads Quentes       |  |
|  +---------------------+  |
|                           |
|  SUPORTE (2)         [>]  |
|  +---------------------+  |
|  | Atendimento         |  |
|  | SAC Premium         |  |
|  +---------------------+  |
|                           |
+---------------------------+
|  [Msg] [Gatilhos] [Trans] |
+---------------------------+
```

## Componentes Detalhados

### 1. Instance Panel (Painel de Instancia)

**Estados:**
- `loading` - Skeleton
- `no-instance` - CTA criar primeira
- `disconnected` - QR Code proeminente
- `connecting` - QR + loading
- `connected` - Info resumida

**Acoes:**
- Ver QR Code (se desconectado)
- Desconectar
- Criar nova instancia (dropdown)
- Trocar instancia (se houver mais)

**Visual (Conectado):**
```
+----------------------+
|  [Avatar]  +55 11... |
|  Joao da Empresa     |
|  [Business badge]    |
|                      |
|  Status: Conectado   |
|  Desde: 2h atras     |
|                      |
|  [Desconectar]       |
+----------------------+
```

### 2. Groups Panel (Painel de Grupos)

**Hierarquia:**
1. Categoria (expansivel)
   - Lista de grupos
   - Badge com contagem
   - Botao config (abre drawer)

**Interacoes:**
- Click categoria: Expandir/colapsar
- Click config categoria: Drawer lateral
- Click grupo: Expandir detalhes inline
- Click edit grupo: Drawer lateral
- Swipe grupo (mobile): Revelar acoes

**Visual Grupo:**
```
+----------------------------------------+
|  [Avatar]  Grupo Vendas SP        [...]|
|  +55 11... | 150 participantes         |
|  [Tag: Vendas] [Tag: Ativo]            |
+----------------------------------------+
```

**Grupo Expandido:**
```
+----------------------------------------+
|  [Avatar]  Grupo Vendas SP       [Edit]|
|  +55 11... | 150 participantes         |
|  [Tag: Vendas] [Tag: Ativo]            |
|----------------------------------------|
|  Transcricao: Auto + Resumo            |
|  Gatilhos: 2 ativos                    |
|  Ultima msg: Ha 5min                   |
|  [Enviar Msg] [Ver Gatilhos]           |
+----------------------------------------+
```

### 3. Category Config Drawer

**Abas:**
1. Geral (nome, cor, descricao)
2. Transcricao (modo, tipo, emoji)
3. Gatilhos (lista, criar, editar)

**Visual:**
```
+----------------------------------+
|  Configurar: VENDAS         [X] |
+----------------------------------+
|  [Geral] [Transcricao] [Gatilhos]|
|----------------------------------|
|                                  |
|  Modo de Transcricao             |
|  [Desativado] [Manual] [Auto]    |
|                                  |
|  Tipo                            |
|  [Apenas texto] [Com resumo]     |
|                                  |
|  Emoji gatilho (manual)          |
|  [Input: emoji]                  |
|                                  |
|----------------------------------|
|            [Salvar] [Cancelar]   |
+----------------------------------+
```

### 4. Quick Actions Panel

**Botoes:**
- Enviar Mensagem (abre modal)
- Configurar Gatilhos (link ou drawer)
- Configurar Transcricao (link ou drawer)
- Nova Categoria (abre modal inline)

**Visual:**
```
+----------------------+
|  ACOES RAPIDAS       |
|                      |
|  [Mensagem em Massa] |
|  Enviar para grupos  |
|                      |
|  [Ver Gatilhos]      |
|  3 ativos            |
|                      |
|  [Transcricao]       |
|  2 categorias ativas |
|                      |
|  [+ Categoria]       |
+----------------------+
```

### 5. Mass Message Modal

**Fluxo:**
1. Selecionar destinatarios (categorias/grupos)
2. Compor mensagem (texto/midia)
3. Preview
4. Confirmar envio

**Visual:**
```
+----------------------------------------+
|  Enviar Mensagem em Massa         [X]  |
+----------------------------------------+
|                                        |
|  Para:                                 |
|  [x] Categoria Vendas (3 grupos)       |
|  [x] Categoria Suporte (2 grupos)      |
|  [ ] Grupo Individual: Geral           |
|                                        |
|  Mensagem:                             |
|  +----------------------------------+  |
|  | Digite sua mensagem...           |  |
|  |                                  |  |
|  +----------------------------------+  |
|  [Anexar Imagem] [Anexar Video]        |
|                                        |
|  Preview: 5 grupos selecionados        |
|                                        |
+----------------------------------------+
|  [Cancelar]              [Enviar]      |
+----------------------------------------+
```

## Padroes de Interacao

### Loading States
- Skeleton para listas
- Spinner inline para acoes
- Disabled state para botoes em loading

### Empty States
- Ilustracao simples + CTA
- Mensagem contextual (ex: "Conecte sua instancia primeiro")

### Error States
- Toast para erros leves
- Inline message para erros de formulario
- Retry button para falhas de rede

### Success Feedback
- Toast de confirmacao
- Check animation no botao
- Update otimista na UI

## Transicoes e Animacoes

### Entrada de Elementos
- Fade in + slide up (200ms)
- Stagger para listas

### Expansao de Grupos
- Height transition (150ms)
- Chevron rotation

### Drawers
- Slide from right (250ms)
- Backdrop fade

### Botoes
- Scale on press (95%)
- Hover glow sutil

## Acessibilidade

### Navegacao por Teclado
- Tab order logico
- Focus visible em todos elementos interativos
- Escape fecha modais/drawers

### Screen Readers
- ARIA labels em botoes de icone
- Live regions para notificacoes
- Headings hierarquicos (h1 > h2 > h3)

### Contraste
- Minimo 4.5:1 para texto
- Indicadores de estado nao dependem so de cor

## Responsive Breakpoints

```css
/* Mobile first */
.container { padding: 16px; }

/* Tablet */
@media (min-width: 768px) {
  .container { padding: 24px; }
  .layout { display: grid; grid-template-columns: 280px 1fr; }
}

/* Desktop */
@media (min-width: 1024px) {
  .container { padding: 32px; }
  .layout { grid-template-columns: 300px 1fr; }
}

/* Wide */
@media (min-width: 1280px) {
  .layout { grid-template-columns: 320px 1fr 280px; }
}
```

## Metricas de Sucesso

1. **Tempo para tarefa comum** < 3 cliques
2. **Tempo de carregamento** < 2 segundos
3. **Taxa de erro** < 1% nas acoes
4. **Mobile usability score** > 90

## Proximos Passos

1. [ ] Validar spec com stakeholders
2. [ ] Criar prototipos no Figma (opcional)
3. [ ] Implementar componente base
4. [ ] Testes de usabilidade
5. [ ] Iteracao baseada em feedback
