# Product Requirements Document (PRD)
# WhatsApp Group Manager

## Document Info

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Date** | 2024 |
| **Author** | PM Agent (BMAD Method) |
| **Status** | Approved |
| **Based On** | Project Brief v1.0 |

---

## 1. Goals & Background Context

### 1.1 Goals

- Permitir que empresas, comunidades e influencers **monitorem e automatizem** grupos de WhatsApp de forma simples
- Oferecer uma **IA conversacional configurável** que responde em grupos baseada em gatilhos
- Disponibilizar **transcrição de áudios** para melhorar acessibilidade e contexto da IA
- Criar uma **alternativa acessível** às soluções caras e complexas do mercado
- Validar o modelo de negócio SaaS com **100 usuários e R$2k MRR em 3 meses**

### 1.2 Background Context

Este produto nasce da experiência real com o projeto "Pantero", onde foram identificadas dificuldades significativas dos usuários em gerenciar grupos via comandos no WhatsApp. A solução proposta substitui comandos por um **painel web intuitivo**, permitindo configuração visual de prompts, upload de documentos para base de conhecimento, e definição de gatilhos sem necessidade de conhecimento técnico.

O mercado atual oferece soluções focadas em atendimento 1:1 e marketing (WATI, Gallabox, Respond.io), mas **ignora o potencial dos grupos**. Este produto foca especificamente em **monitoramento e IA em grupos**, um nicho pouco explorado.

### 1.3 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2024-XX-XX | 1.0 | Initial PRD creation | PM Agent |

---

## 2. Requirements

### 2.1 Functional Requirements (FR)

| ID | Requirement | Priority | Epic |
|----|-------------|----------|------|
| **FR1** | O sistema deve permitir cadastro/login de usuários via email/senha ou OAuth (Google) | Must | 1 |
| **FR2** | O sistema deve permitir conectar uma instância WhatsApp via QR Code (Uazapi) | Must | 2 |
| **FR3** | O sistema deve exibir status de conexão da instância (online/offline/reconectando) | Must | 2 |
| **FR4** | O sistema deve listar automaticamente os grupos da instância conectada | Must | 3 |
| **FR5** | O sistema deve permitir cadastrar/editar grupos manualmente | Should | 3 |
| **FR6** | O sistema deve permitir criar e atribuir tags aos grupos | Must | 3 |
| **FR7** | O sistema deve permitir filtrar grupos por tags | Must | 3 |
| **FR8** | O sistema deve permitir ativar/desativar monitoramento por grupo | Must | 3 |
| **FR9** | O sistema deve permitir configurar o prompt da IA via editor visual | Must | 4 |
| **FR10** | O sistema deve permitir upload de documentos para base de conhecimento | Must | 4 |
| **FR11** | O sistema deve permitir editar informações de agenda/contexto da IA | Should | 4 |
| **FR12** | O sistema deve permitir criar gatilhos por menção (@bot) | Must | 5 |
| **FR13** | O sistema deve permitir criar gatilhos por nome do bot | Must | 5 |
| **FR14** | O sistema deve permitir criar gatilhos por palavra-chave configurável | Must | 5 |
| **FR15** | O sistema deve permitir definir ações para gatilhos: chamar IA, alertar, excluir msg | Must | 5 |
| **FR16** | O sistema deve permitir configurar transcrição de áudio (desativado/manual/automático) | Must | 6 |
| **FR17** | O sistema deve transcrever áudios usando Whisper API e incluir no contexto da IA | Must | 6 |
| **FR18** | O sistema deve registrar logs de mensagens processadas e respostas da IA | Must | 7 |
| **FR19** | O sistema deve exibir histórico de alertas gerados | Should | 7 |
| **FR20** | O sistema deve gerenciar planos de assinatura com limites por tier | Must | 8 |
| **FR21** | O sistema deve alertar usuário quando próximo dos limites do plano | Should | 8 |

### 2.2 Non-Functional Requirements (NFR)

| ID | Requirement | Category |
|----|-------------|----------|
| **NFR1** | Tempo de resposta da IA deve ser < 5 segundos | Performance |
| **NFR2** | Sistema deve ter uptime de 99.5% | Availability |
| **NFR3** | Reconexão automática de instância em caso de queda | Resilience |
| **NFR4** | Interface deve ser responsiva (mobile-friendly) | Usability |
| **NFR5** | Dados devem ser isolados por tenant (multi-tenant) | Security |
| **NFR6** | Senhas devem ser hasheadas (Supabase Auth) | Security |
| **NFR7** | Comunicação via HTTPS | Security |
| **NFR8** | Sistema deve suportar 100 usuários simultâneos no MVP | Scalability |
| **NFR9** | Logs devem ser retidos por 30 dias | Retention |
| **NFR10** | Sistema deve funcionar nos navegadores Chrome, Firefox, Safari, Edge | Compatibility |

---

## 3. User Interface Design Goals

### 3.1 Visual Direction

| Aspect | Guideline |
|--------|-----------|
| **Style** | Clean, minimalist, modern SaaS |
| **Colors** | Neutral tones + WhatsApp green accent (#25D366) |
| **Framework** | shadcn/ui + Tailwind CSS |
| **Layout** | Fixed sidebar + main content area |
| **Mobile** | Responsive, but desktop-optimized |

### 3.2 Navigation Structure

```
├── 🏠 Dashboard
├── 📱 Instâncias
│   ├── Conectar Nova
│   └── Status/Reconectar
├── 👥 Grupos
│   ├── Lista de Grupos
│   ├── Gerenciar Tags
│   └── Detalhes do Grupo
├── 🤖 Configuração IA
│   ├── Prompt Editor
│   ├── Base de Conhecimento
│   ├── Agenda/Info
│   └── Transcrição
├── ⚡ Gatilhos
│   ├── Lista de Gatilhos
│   └── Criar/Editar Gatilho
├── 📜 Logs
│   ├── Mensagens
│   ├── Respostas IA
│   └── Alertas
└── ⚙️ Configurações
    ├── Minha Conta
    └── Plano/Billing
```

### 3.3 Key UX Principles

1. **Onboarding em 5 minutos** - Wizard guiado de setup inicial
2. **Zero friction** - Mínimo de cliques para ações comuns
3. **Feedback imediato** - Loading states, toasts, confirmações
4. **Configuração visual** - Prompts e gatilhos sem código
5. **Preview antes de ativar** - Testar IA antes de ir pro grupo

---

## 4. Technical Constraints

### 4.1 Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend** | Next.js 14+ (App Router) | SSR, performance, DX |
| **Styling** | Tailwind CSS + shadcn/ui | Speed, consistency |
| **Backend** | Supabase | Auth, DB, Edge Functions, Realtime |
| **Database** | PostgreSQL (Supabase) | RLS, scalability |
| **WhatsApp API** | Uazapi | Cost-effective, stable, groups support |
| **AI** | OpenAI GPT-4o | Response quality |
| **Transcription** | OpenAI Whisper | Accuracy, easy integration |
| **Payments** | Stripe | Industry standard |
| **Hosting** | Vercel | Easy deploy, edge functions |

### 4.2 Technical Constraints

- **Uazapi is unofficial API** - Subject to WhatsApp instabilities
- **Rate limits** - Must respect Uazapi and OpenAI limits
- **Variable costs** - OpenAI tokens and Whisper transcription
- **Webhooks** - Requires public endpoint for receiving events
- **Multi-tenant** - Data isolation via Supabase RLS

---

## 5. Epics & User Stories

### 📦 Epic 1: Foundation & Auth

**Goal**: Establish project foundation with authentication and base structure.

**Dependencies**: None (starting point)

#### Story 1.1: Project Setup
**As a** developer,
**I want** to have the project scaffolded with Next.js and Supabase,
**So that** I can start building features on a solid foundation.

**Acceptance Criteria:**
1. Next.js 14+ project created with App Router
2. Tailwind CSS configured with shadcn/ui
3. Supabase project connected (env variables)
4. Basic folder structure established
5. ESLint and Prettier configured
6. Git repository initialized

---

#### Story 1.2: User Authentication
**As a** user,
**I want** to sign up and log in with email/password or Google,
**So that** I can access my account securely.

**Acceptance Criteria:**
1. Sign up form with email/password validation
2. Login form with email/password
3. Google OAuth integration
4. Password reset flow via email
5. Session persistence across browser refresh
6. Logout functionality
7. Protected routes redirect to login

---

#### Story 1.3: Base Layout
**As a** user,
**I want** a consistent navigation layout,
**So that** I can easily navigate between sections.

**Acceptance Criteria:**
1. Sidebar with navigation items (icons + labels)
2. Main content area with proper spacing
3. Header with user avatar and dropdown menu
4. Mobile responsive (sidebar collapses)
5. Active navigation state indicator
6. Smooth transitions between pages

---

#### Story 1.4: User Profile Page
**As a** user,
**I want** to view and edit my profile,
**So that** I can manage my account information.

**Acceptance Criteria:**
1. Display user name and email
2. Edit name functionality
3. Display current plan/tier
4. Show account creation date
5. Change password option
6. Delete account option (with confirmation)

---

### 📦 Epic 2: Instance Management

**Goal**: Enable WhatsApp instance connection and management via Uazapi.

**Dependencies**: Epic 1 (Auth)

#### Story 2.1: Uazapi Integration Setup
**As a** developer,
**I want** to integrate with Uazapi API,
**So that** users can connect their WhatsApp.

**Acceptance Criteria:**
1. Uazapi credentials stored securely (env)
2. API wrapper created for Uazapi endpoints
3. Instance creation endpoint working
4. Error handling for API failures
5. Rate limiting consideration

---

#### Story 2.2: QR Code Connection Flow
**As a** user,
**I want** to connect my WhatsApp by scanning a QR code,
**So that** the system can access my groups.

**Acceptance Criteria:**
1. "Connect WhatsApp" button in empty state
2. QR code displayed in modal
3. QR code auto-refreshes when expired
4. Real-time status update (waiting → connected)
5. Success confirmation with animation
6. Error state with retry option
7. Instructions for scanning

---

#### Story 2.3: Instance Management Page
**As a** user,
**I want** to view and manage my connected instance,
**So that** I can monitor its status.

**Acceptance Criteria:**
1. Display instance status (online/offline/connecting)
2. Connected phone number shown
3. Last activity timestamp
4. Reconnect button for offline instances
5. Disconnect/remove instance option
6. Connection health indicator

---

#### Story 2.4: Webhook Event Handling
**As a** system,
**I want** to receive events from Uazapi via webhook,
**So that** I can process messages and status changes.

**Acceptance Criteria:**
1. Webhook endpoint created (API route)
2. Signature validation for security
3. Handle connection status events
4. Handle message received events
5. Queue events for processing
6. Error logging for failed webhooks

---

### 📦 Epic 3: Groups Management

**Goal**: List, organize, and configure groups for monitoring.

**Dependencies**: Epic 2 (Instance connected)

#### Story 3.1: Fetch and List Groups
**As a** user,
**I want** to see all groups from my WhatsApp,
**So that** I can choose which ones to manage.

**Acceptance Criteria:**
1. Automatic fetch of groups after connection
2. Display group name and photo
3. Show member count
4. Show message count (today)
5. Pagination or infinite scroll for many groups
6. Search/filter functionality
7. Loading skeleton while fetching

---

#### Story 3.2: Tag Management System
**As a** user,
**I want** to create and manage tags,
**So that** I can organize my groups.

**Acceptance Criteria:**
1. Create tag with name and color
2. Edit existing tags
3. Delete tags (with confirmation)
4. Assign multiple tags to a group
5. Remove tag from group
6. Tags displayed as colored chips
7. Predefined color palette

---

#### Story 3.3: Filter Groups by Tags
**As a** user,
**I want** to filter the group list by tags,
**So that** I can find specific groups quickly.

**Acceptance Criteria:**
1. Tag filter dropdown in group list
2. Multi-select tags for filtering
3. Clear filters option
4. Show count of filtered results
5. Persist filter state in URL
6. Empty state when no matches

---

#### Story 3.4: Group Monitoring Toggle
**As a** user,
**I want** to enable/disable monitoring per group,
**So that** I control where the AI is active.

**Acceptance Criteria:**
1. Toggle switch on group card/row
2. Visual indicator of monitoring status
3. Bulk enable/disable option
4. Confirmation for disable action
5. Status persisted in database
6. Webhook only processes monitored groups

---

### 📦 Epic 4: AI Configuration

**Goal**: Enable complete configuration of conversational AI.

**Dependencies**: Epic 3 (Groups)

#### Story 4.1: Prompt Editor
**As a** user,
**I want** to write and edit my AI's prompt,
**So that** I can customize how it responds.

**Acceptance Criteria:**
1. Textarea with prompt content
2. Character count display
3. Syntax highlighting (optional)
4. Save button with confirmation
5. Revert to default option
6. Preview of how prompt will be used
7. Variable placeholders explained (e.g., {user_name})

---

#### Story 4.2: Document Upload for Knowledge Base
**As a** user,
**I want** to upload documents for the AI to reference,
**So that** it can answer questions about my content.

**Acceptance Criteria:**
1. File upload zone (drag & drop)
2. Supported formats: PDF, TXT, DOCX, MD
3. File size limit (e.g., 10MB per file)
4. List of uploaded documents
5. Delete document option
6. Processing status indicator
7. Total storage used display

---

#### Story 4.3: Knowledge Base RAG Integration
**As a** system,
**I want** to index documents for semantic search,
**So that** the AI can reference relevant content.

**Acceptance Criteria:**
1. Document text extraction on upload
2. Text chunking for embeddings
3. Embeddings stored in Supabase (pgvector)
4. Semantic search function
5. Retrieved context included in AI prompt
6. Re-index on document update/delete

---

#### Story 4.4: Agenda/Context Information Editor
**As a** user,
**I want** to add contextual information (agenda, FAQs),
**So that** the AI has up-to-date info.

**Acceptance Criteria:**
1. Rich text editor for agenda
2. Save/update functionality
3. Context included in AI prompt
4. Last updated timestamp
5. Quick edit mode
6. Preview how it affects responses

---

#### Story 4.5: AI Name and Persona Settings
**As a** user,
**I want** to set my AI's name and tone,
**So that** it matches my brand voice.

**Acceptance Criteria:**
1. Input field for AI name
2. Tone selector (Formal/Friendly/Fun/Technical)
3. Tone affects system prompt automatically
4. Preview of tone effect
5. Save configuration

---

### 📦 Epic 5: Triggers System

**Goal**: Create flexible trigger and action system.

**Dependencies**: Epic 4 (AI Config)

#### Story 5.1: Trigger Wizard UI
**As a** user,
**I want** a step-by-step wizard to create triggers,
**So that** I can easily configure automation.

**Acceptance Criteria:**
1. Multi-step wizard (4 steps)
2. Progress indicator
3. Back/Next navigation
4. Summary before save
5. Cancel with confirmation
6. Mobile-friendly layout

---

#### Story 5.2: Mention Trigger (@bot)
**As a** user,
**I want** the AI to respond when mentioned,
**So that** users can explicitly call it.

**Acceptance Criteria:**
1. Detect @mention in messages
2. Extract message content after mention
3. Trigger AI response
4. Handle multiple mentions
5. Configurable mention name

---

#### Story 5.3: Keyword Trigger
**As a** user,
**I want** to set keywords that trigger actions,
**So that** the AI responds to specific topics.

**Acceptance Criteria:**
1. Input field for keywords (comma-separated)
2. Case-insensitive matching option
3. Whole word vs partial match option
4. Test keyword against sample text
5. Multiple keywords per trigger

---

#### Story 5.4: Action - Call AI
**As a** user,
**I want** to call the AI when a trigger fires,
**So that** it can respond automatically.

**Acceptance Criteria:**
1. Action type: "Call AI"
2. Send message to GPT-4o with context
3. Include knowledge base results
4. Send response to WhatsApp group
5. Log interaction

---

#### Story 5.5: Action - Alert Team
**As a** user,
**I want** to alert my team when triggers fire,
**So that** we know about important messages.

**Acceptance Criteria:**
1. Action type: "Alert Team"
2. Select destination (group or number)
3. Customizable alert message template
4. Include original message in alert
5. Throttling to prevent spam

---

#### Story 5.6: Action - Delete Message
**As a** user,
**I want** to auto-delete messages matching rules,
**So that** I can moderate content automatically.

**Acceptance Criteria:**
1. Action type: "Delete Message"
2. Warning about irreversible action
3. Call Uazapi delete endpoint
4. Log deletion with reason
5. Confirmation before enabling

---

### 📦 Epic 6: Audio Transcription

**Goal**: Transcribe audio messages and integrate with AI context.

**Dependencies**: Epic 5 (Triggers)

#### Story 6.1: Transcription Mode Configuration
**As a** user,
**I want** to choose how audio transcription works,
**So that** I can balance cost and convenience.

**Acceptance Criteria:**
1. Three modes: Disabled / Manual / Automatic
2. Mode selector with descriptions
3. Cost warning for automatic mode
4. Define manual trigger command
5. Save configuration

---

#### Story 6.2: Audio Detection in Messages
**As a** system,
**I want** to detect audio messages,
**So that** I can process them accordingly.

**Acceptance Criteria:**
1. Identify audio message type in webhook
2. Extract audio file URL
3. Download audio from Uazapi
4. Queue for transcription based on mode
5. Handle various audio formats

---

#### Story 6.3: Whisper API Integration
**As a** system,
**I want** to transcribe audio using Whisper,
**So that** I can convert speech to text.

**Acceptance Criteria:**
1. Send audio to OpenAI Whisper API
2. Handle response with transcription
3. Support Portuguese language
4. Error handling for failed transcriptions
5. Track transcription costs/usage

---

#### Story 6.4: Manual Transcription Command
**As a** user,
**I want** to transcribe audio on demand,
**So that** I only pay for what I need.

**Acceptance Criteria:**
1. Reply to audio with trigger (e.g., "@AI transcreve")
2. Transcribe replied audio
3. Send transcription text to group
4. Optionally include in AI context
5. Handle invalid replies gracefully

---

#### Story 6.5: Automatic Transcription Mode
**As a** user,
**I want** all audios automatically transcribed,
**So that** I don't miss any content.

**Acceptance Criteria:**
1. Transcribe all audio in monitored groups
2. Include transcription in AI context
3. Trigger AI if keyword matches transcription
4. Track usage against plan limits
5. Alert when approaching limit

---

### 📦 Epic 7: Logs & Monitoring

**Goal**: Record and display operation history.

**Dependencies**: Epic 6 (All features generating data)

#### Story 7.1: Message Log Storage
**As a** system,
**I want** to store processed messages,
**So that** users can review history.

**Acceptance Criteria:**
1. Store message content, sender, group, timestamp
2. Store trigger matched (if any)
3. 30-day retention policy
4. Efficient querying by date/group
5. Privacy consideration (hash sensitive data option)

---

#### Story 7.2: AI Response Log
**As a** system,
**I want** to store AI responses,
**So that** users can review what the AI said.

**Acceptance Criteria:**
1. Link response to original message
2. Store prompt used and response
3. Store tokens consumed
4. Store response time
5. Exportable data

---

#### Story 7.3: Logs Page UI
**As a** user,
**I want** to view logs in a searchable interface,
**So that** I can find specific interactions.

**Acceptance Criteria:**
1. Tabbed view: Messages / AI Responses / Alerts
2. Date range filter
3. Group filter
4. Search by content
5. Pagination
6. Export to CSV option

---

#### Story 7.4: Alerts History
**As a** user,
**I want** to see all alerts generated,
**So that** I can track important events.

**Acceptance Criteria:**
1. List of alerts with timestamp
2. Alert type and trigger
3. Status (sent/failed)
4. Link to original message
5. Mark as read functionality

---

### 📦 Epic 8: Plans & Billing

**Goal**: Implement subscription system with usage limits.

**Dependencies**: All previous epics

#### Story 8.1: Plan Structure in Database
**As a** system,
**I want** plans defined with limits,
**So that** I can enforce usage restrictions.

**Acceptance Criteria:**
1. Plans table with tiers
2. Limits per plan (instances, groups, messages)
3. User subscription table
4. Usage tracking table
5. Default to free trial on signup

---

#### Story 8.2: Usage Tracking
**As a** system,
**I want** to track feature usage,
**So that** I can enforce plan limits.

**Acceptance Criteria:**
1. Count AI messages per month
2. Count transcription minutes
3. Count active groups
4. Reset counters monthly
5. Block usage when limit reached

---

#### Story 8.3: Usage Limit Alerts
**As a** user,
**I want** to be notified when approaching limits,
**So that** I can upgrade or reduce usage.

**Acceptance Criteria:**
1. Alert at 80% usage
2. Alert at 100% usage
3. In-app notification
4. Email notification option
5. Display usage in dashboard

---

#### Story 8.4: Stripe Checkout Integration
**As a** user,
**I want** to upgrade my plan via Stripe,
**So that** I can pay for premium features.

**Acceptance Criteria:**
1. Upgrade button per plan
2. Redirect to Stripe Checkout
3. Handle successful payment webhook
4. Update user plan in database
5. Confirmation email

---

#### Story 8.5: Stripe Customer Portal
**As a** user,
**I want** to manage my subscription,
**So that** I can update payment or cancel.

**Acceptance Criteria:**
1. Link to Stripe Customer Portal
2. View current plan and billing
3. Update payment method
4. Cancel subscription
5. Handle cancellation webhook

---

## 6. Out of Scope (Future Versions)

The following features are explicitly **not** included in MVP:

| Feature | Reason | Target Version |
|---------|--------|----------------|
| Bulk messaging | Risk of WhatsApp ban | v2 |
| Advanced analytics dashboard | Nice-to-have | v2 |
| External integrations (Slack, CRM) | Complexity | v2 |
| Message scheduling | Nice-to-have | v2 |
| White-label | Enterprise feature | v3 |
| API for developers | Enterprise feature | v3 |

---

## 7. Success Metrics

### 7.1 Product Metrics

| Metric | Target (3 months) |
|--------|-------------------|
| Registered users | 100 |
| Weekly active users (WAU) | 30 |
| Connected instances | 50 |
| Monitored groups | 200 |
| Activation rate | 60% |
| D7 retention | 40% |
| D30 retention | 25% |

### 7.2 Business Metrics

| Metric | Target (3 months) |
|--------|-------------------|
| Trial → Paid conversion | 10% |
| Monthly Recurring Revenue (MRR) | R$2,000 |
| Monthly churn | <10% |
| Customer Acquisition Cost (CAC) | <R$50 |

---

## 8. Technical Architecture Summary

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                  │
│                    Next.js 14 + Tailwind                         │
│                        + shadcn/ui                                │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                         BACKEND                                   │
│                        Supabase                                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │  Auth   │  │Database │  │  Edge   │  │Realtime │             │
│  │         │  │(Postgres│  │Functions│  │         │             │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘             │
└────────────────────────────┬─────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌─────────┐    ┌─────────┐    ┌─────────┐
        │ Uazapi  │    │ OpenAI  │    │ Stripe  │
        │WhatsApp │    │GPT-4o + │    │Payments │
        │  API    │    │ Whisper │    │         │
        └─────────┘    └─────────┘    └─────────┘
```

---

## 9. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WhatsApp blocks | High | Critical | Clear disclaimer, ToS |
| AI hallucination | High | High | Preview mode, sandbox |
| Cost explosion | Medium | High | Rate limiting, quotas |
| Bad config by user | High | Medium | Templates, validation |
| LGPD compliance | Medium | Critical | Clear terms, opt-in |

---

## 10. Next Steps

1. ✅ Project Brief - Complete
2. ✅ PRD - Complete
3. ⏳ UI/UX Specification
4. ⏳ Architecture Document
5. ⏳ Development Stories

---

## Appendix: Glossary

| Term | Definition |
|------|------------|
| **Instance** | A connected WhatsApp number via Uazapi |
| **Trigger** | A condition that activates an action |
| **Action** | What happens when a trigger fires |
| **RAG** | Retrieval Augmented Generation - using docs in AI context |
| **Webhook** | HTTP endpoint that receives events from external services |
