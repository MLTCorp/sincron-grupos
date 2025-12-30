# TODO - Sincron Grupos

**Atualizado em:** 30/12/2024
**Progresso geral:** ~88%

---

## Legenda

| Simbolo | Significado |
|---------|-------------|
| `[ ]` | Pendente |
| `[x]` | Concluido |
| `[~]` | Parcialmente implementado (UI existe, falta logica) |
| `[!]` | Bloqueado ou aguardando dependencia |

**Prioridades:**
- **P0** = Critico para lancamento
- **P1** = Importante, mas pode lancar sem
- **P2** = Nice to have
- **P3** = Futuro (v2+)

---

## P0 - Critico para Lancamento

### Autenticacao e Onboarding

- [ ] **Permitir login sem confirmacao de email**
  - *O que:* Usuarios podem entrar imediatamente apos signup
  - *Onde:* Supabase Dashboard > Authentication > Providers > Email > Desativar "Confirm email"
  - *Por que:* Reduz friccao no onboarding, usuarios desistem se precisam confirmar email

### Pagina Settings (Dados Reais)

- [ ] **Carregar dados do usuario logado**
  - *O que:* Substituir dados mockados ("Michelle Santos") por dados reais do banco
  - *Onde:* `app/(dashboard)/settings/page.tsx`
  - *Tabelas:* `usuarios_sistema`, `organizacoes`
  - *Campos:* nome, email, telefone, cargo, nome_organizacao

- [ ] **Salvar alteracoes de perfil**
  - *O que:* Implementar `handleSaveAccount()` com update real no Supabase
  - *Onde:* `app/(dashboard)/settings/page.tsx`

- [ ] **Alterar senha funcional**
  - *O que:* Usar `supabase.auth.updateUser({ password })`
  - *Onde:* `app/(dashboard)/settings/page.tsx`

### Envio de Mensagens (Integracao Real)

- [~] **Mensagens em massa - envio real**
  - *O que:* A UI existe (`/messages`), mas o envio nao esta integrado
  - *Falta:* Chamar API UAZAPI para enviar mensagens aos grupos selecionados
  - *Onde:* `app/(dashboard)/messages/page.tsx` - funcao `handleSaveMessage()`
  - *API:* `POST /api/uazapi/instances/[token]/send/text`

- [ ] **Feedback de envio em tempo real**
  - *O que:* Mostrar progresso (enviando 1/10, 2/10...) e erros por grupo
  - *Onde:* Modal de confirmacao em `/messages`

---

## P1 - Importante

### Sistema de Comandos

- [ ] **Criar tabela `comandos`**
  - *O que:* Tabela para armazenar comandos configurados (ex: /ajuda, /regras)
  - *Campos sugeridos:* id, id_organizacao, comando, resposta, ativo, tipo_match (exato/contem)

- [ ] **Pagina de CRUD de comandos**
  - *O que:* Substituir placeholder em `/commands` por UI funcional
  - *Onde:* `app/(dashboard)/commands/page.tsx`
  - *Funcoes:* Criar, listar, editar, excluir, ativar/desativar comandos

- [ ] **Processamento de comandos no N8N**
  - *O que:* Workflow que detecta mensagens iniciando com "/" e responde
  - *Status:* Verificar se ja existe no N8N

### Integracao IA (Agentes)

- [~] **CRUD de agentes funcional**
  - *Status:* Ja implementado em `/ai`

- [ ] **Associar agente a grupo/categoria**
  - *O que:* Definir qual agente responde em qual grupo
  - *Onde:* Adicionar campo `id_agente` na tabela `grupos` ou criar tabela N:N
  - *UI:* Dropdown de agente no modal de edicao de grupo

- [ ] **Chamada real a OpenAI/Claude**
  - *O que:* Quando mensagem chega, chamar API de IA com prompt do agente
  - *Onde:* Workflow N8N ou Edge Function
  - *Usar:* `prompt_sistema` + `modelo` + `temperatura` da tabela `agentes_ia`

- [ ] **Base de conhecimento (RAG)**
  - *O que:* Upload de documentos para o agente consultar
  - *Tabela:* Criar `documentos_agente` (id, id_agente, nome, conteudo, embedding)
  - *Integracao:* OpenAI Embeddings + busca vetorial

### Transcricao de Audio

- [~] **Configuracao de transcricao por categoria**
  - *Status:* UI existe em `/transcription`, tabela `config_transcricao` existe

- [ ] **Processamento real de audios**
  - *O que:* Quando audio chega no grupo, enviar para Whisper e postar transcricao
  - *Onde:* Workflow N8N
  - *API:* OpenAI Whisper (`/v1/audio/transcriptions`)
  - *Webhook:* Receber evento de audio do UAZAPI

- [ ] **Respeitar configuracao (auto/manual)**
  - *O que:* Se `tipo = 'auto'`, transcreve automaticamente. Se `tipo = 'manual'`, so com comando
  - *Onde:* Logica no workflow N8N

### Pagina AI - Estatisticas Reais

- [ ] **Criar tabela `logs_agente`**
  - *O que:* Registrar cada interacao do agente (pergunta, resposta, confianca, tempo)
  - *Campos:* id, id_agente, id_grupo, pergunta, resposta, tokens_usados, dt_create

- [ ] **Substituir `getAgentStats()` por dados reais**
  - *O que:* Buscar COUNT de logs por agente em vez de `Math.random()`
  - *Onde:* `app/(dashboard)/ai/page.tsx:127-131`

- [ ] **Atividades recentes reais**
  - *O que:* Listar ultimos registros de `logs_agente`
  - *Onde:* `app/(dashboard)/ai/page.tsx:134-140` (substituir `ATIVIDADES_RECENTES`)

---

## P2 - Nice to Have

### RSS Feeds

- [ ] **Criar tabela `feeds_rss`**
  - *Campos:* id, id_organizacao, url, nome, intervalo_minutos, ultimo_check, ativo

- [ ] **Criar tabela `feeds_grupos`** (N:N)
  - *Campos:* id_feed, id_grupo

- [ ] **Pagina de CRUD de feeds**
  - *Onde:* `app/(dashboard)/feeds/page.tsx` (substituir placeholder)

- [ ] **Worker de verificacao de feeds**
  - *O que:* Cron job que verifica novos itens e envia para grupos
  - *Onde:* N8N scheduled workflow ou Supabase Edge Function

### Multi-Instancia

- [ ] **Seletor de instancia no header**
  - *O que:* Dropdown para trocar entre instancias (para planos Pro/Enterprise)
  - *Onde:* `components/command-center/header.tsx`

- [ ] **Filtrar dados por instancia selecionada**
  - *O que:* Grupos, mensagens, etc. filtrados pela instancia ativa
  - *Onde:* Hook `useOrganizationData` - adicionar parametro `instanciaId`

### Dashboard Analytics

- [ ] **Graficos de uso**
  - *O que:* Mensagens enviadas/recebidas por dia, grupos mais ativos
  - *Onde:* `/dashboard` ou nova pagina `/analytics`
  - *Lib:* Recharts (ja instalado via shadcn)

- [ ] **Metricas de agentes IA**
  - *O que:* Taxa de acerto, tempo de resposta, custo de tokens
  - *Fonte:* Tabela `logs_agente`

### UX Polish

- [ ] **Empty states completos**
  - *O que:* Telas amigaveis quando nao ha dados (primeira vez do usuario)
  - *Onde:* Todas as paginas do dashboard

- [ ] **Otimizacao mobile**
  - *O que:* Bottom sheets em vez de modais, touch areas maiores
  - *Onde:* Todos os dialogs/drawers

- [ ] **Animacoes de transicao**
  - *O que:* Fade in, slide, expand/collapse suaves
  - *Lib:* Framer Motion (ja disponivel via MagicUI)

---

## P3 - Futuro (v2+)

### Intencoes para Proximas Versoes

- [ ] **Agendamento de mensagens**
  - *O que:* Programar mensagem para enviar em data/hora especifica

- [ ] **Webhooks de saida**
  - *O que:* Notificar sistemas externos quando eventos acontecem

- [ ] **API publica**
  - *O que:* Endpoints REST para integracao com outros sistemas

- [ ] **White-label**
  - *O que:* Permitir clientes personalizarem logo/cores

- [ ] **Marketplace de templates**
  - *O que:* Templates prontos de agentes, comandos, gatilhos

- [ ] **Relatorios exportaveis**
  - *O que:* PDF/Excel com metricas do periodo

---

## Infraestrutura e DevOps

- [ ] **Configurar dominio de producao**
  - *O que:* Apontar sincrongrupos.com para Vercel

- [ ] **Variaveis de ambiente em producao**
  - *O que:* Configurar todas as env vars no Vercel

- [ ] **Monitoramento de erros**
  - *O que:* Integrar Sentry ou similar

- [ ] **Backup automatico do banco**
  - *O que:* Configurar backup diario no Supabase (ja incluso no plano)

---

## Correcoes Conhecidas

- [ ] **Permitir entrada sem confirmacao de email**
  - *Status:* Pendente (config no Supabase Dashboard)

---

## Concluido Recentemente (30/12/2024)

- [x] Sistema de feedback para testers (FeedbackFab + screenshot + audio)
- [x] Favicon e Open Graph images
- [x] Validacao de limites de planos (max_groups)
- [x] Constraint de grupo unico por organizacao
- [x] Variavel WEBHOOK_N8N_URL configurada
- [x] Documentacao de planos alinhada com landing page

---

## Como Usar Este Arquivo

1. **Antes de comecar uma sessao:** Leia as tarefas P0 pendentes
2. **Ao concluir uma tarefa:** Marque com `[x]` e adicione data
3. **Ao descobrir novo trabalho:** Adicione na prioridade apropriada
4. **Ao final da sessao:** Atualize o progresso geral no topo

---

*Mantido por: Claude Code*
*Projeto: Sincron Grupos*
