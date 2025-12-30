# Project Brief: WhatsApp Group Manager

## Document Info

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Date** | 2024 |
| **Author** | Analyst Agent (BMAD Method) |
| **Status** | Approved |

---

## 1. Executive Summary

### 1.1 Project Name
WhatsApp Group Manager (nome provisório)

### 1.2 Project Type
SaaS B2B/B2C - Plataforma de Gestão de Grupos WhatsApp com IA

### 1.3 Value Proposition
Solução simples e acessível para monitoramento e automação de grupos WhatsApp com IA conversacional configurável.

---

## 2. Problem Statement

Empresas, comunidades e influencers que gerenciam grupos de WhatsApp enfrentam dificuldades para **monitorar conversas em escala** e **oferecer suporte eficiente**. As soluções atuais no mercado são:

- **Caras**: R$50-300/mês + markups de 15-20% por mensagem
- **Complexas**: Curva de aprendizado alta, interfaces confusas
- **Focadas em 1:1**: Ignoram o potencial dos grupos
- **Técnicas**: Exigem conhecimento de comandos ou programação

### 2.1 Pain Points Identificados

1. **Comandos são difíceis** para usuários não-técnicos
2. **Configurar IA é complexo** sem interface visual
3. **Subir documentos pelo WhatsApp** tem UX ruim
4. **Moderação manual não escala** para múltiplos grupos
5. **Falta de visibilidade** do que acontece nos grupos

---

## 3. Target Audience

### 3.1 Primary Personas

| Persona | Descrição | Necessidade Principal |
|---------|-----------|----------------------|
| **Empresas** | Times de suporte/vendas | Escalar atendimento em grupos |
| **Comunidades** | Admins de grupos temáticos | Moderar e engajar membros |
| **Influencers** | Creators com audiência | Automatizar interação com fãs |
| **Times de Suporte** | Equipes de atendimento | Centralizar monitoramento |

### 3.2 Market Size

- WhatsApp: 2B+ usuários globais
- Brasil: 120M+ usuários ativos
- Grupos ativos: estimativa de milhões
- TAM (Brasil): Pequenas empresas com grupos ativos

---

## 4. Proposed Solution

### 4.1 Core Features

| Feature | Descrição | Prioridade |
|---------|-----------|------------|
| **Painel Web** | Interface simples (não comandos) | Must |
| **Gestão de Grupos** | Listar, organizar com tags | Must |
| **Config IA Visual** | Prompt dinâmico + docs | Must |
| **Gatilhos** | Menção, palavra-chave, ações | Must |
| **Transcrição Áudio** | Manual ou automático | Must |
| **Logs/Monitoramento** | Histórico de mensagens/respostas | Must |
| **Planos/Billing** | Tiers com limites | Must |

### 4.2 Key Differentiators

1. **Foco em GRUPOS** (não atendimento 1:1)
2. **Painel simples** (não comandos no WhatsApp)
3. **Preço acessível** (sem markups ocultos)
4. **IA configurável** com base de conhecimento
5. **Setup em 5 minutos** (wizard guiado)

---

## 5. Technical Constraints

### 5.1 Defined Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14+ (App Router) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Backend** | Supabase (Auth, DB, Edge Functions) |
| **Database** | PostgreSQL (Supabase) |
| **WhatsApp API** | Uazapi |
| **AI** | OpenAI GPT-4o |
| **Transcription** | OpenAI Whisper |
| **Payments** | Stripe |
| **Hosting** | Vercel |

### 5.2 Key Constraints

- **Uazapi é API não-oficial** - sujeita a instabilidades
- **Rate limits** - respeitar limites das APIs
- **Custos variáveis** - tokens OpenAI por uso
- **Webhooks** - necessário endpoint público

---

## 6. Success Metrics

### 6.1 Product Metrics (3 months)

| Metric | Target |
|--------|--------|
| Usuários cadastrados | 100 |
| Usuários ativos (WAU) | 30 |
| Instâncias conectadas | 50 |
| Grupos monitorados | 200 |
| Taxa de ativação | 60% |
| Retenção D7 | 40% |
| Retenção D30 | 25% |

### 6.2 Business Metrics (3 months)

| Metric | Target |
|--------|--------|
| Conversão trial → pago | 10% |
| MRR | R$2.000 |
| Churn mensal | <10% |
| CAC | <R$50 |

### 6.3 Hypothesis Validation

| Hypothesis | Validation Metric | Success If |
|------------|------------------|------------|
| "Painel é mais fácil que comandos" | NPS + tempo setup | NPS > 7, setup < 10min |
| "Gatilhos são úteis" | % usuários que criam | > 50% criam ao menos 1 |
| "Transcrição agrega valor" | % usuários que ativam | > 30% ativam |
| "Preço é competitivo" | Conversão trial | > 10% convertem |

---

## 7. Competitive Analysis

### 7.1 Market Landscape

| Category | Players | Positioning |
|----------|---------|-------------|
| **Enterprise (API Oficial)** | WATI, Gallabox, Respond.io | Alto custo, compliance total |
| **Mid-Market SaaS** | Heltar, AiSensy, DoubleTick | Preço médio, features balanceadas |
| **Open Source** | Evolution API, Baileys | Gratuito, requer expertise |

### 7.2 Pricing Comparison

| Solution | Starting Price | Pro Plan | Markup |
|----------|---------------|----------|--------|
| WATI | ~R$150/mês | ~R$360/mês | ~20% |
| Gallabox | ~R$60/mês | ~R$360/mês | 15-20% |
| Heltar | ~R$60/mês | ~R$180/mês | 5% |
| **Our Product** | Grátis | R$97/mês | 0% |

### 7.3 Competitive Advantage

> **Descoberta crítica**: A maioria dos concorrentes foca em atendimento 1:1 e marketing. O nicho de "IA em grupos" é pouco explorado.

---

## 8. Risk Analysis

### 8.1 Key Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Bloqueio WhatsApp/Meta | Alta | Crítico | Disclaimer claro, termos de uso |
| IA responde errado | Alta | Alto | Preview, sandbox, fallback humano |
| Custo de infra explode | Média | Alto | Rate limiting, quotas, alertas |
| Usuário configura mal | Alta | Médio | Templates prontos, validação |
| LGPD/Compliance | Média | Crítico | Termos claros, opt-in, não armazenar sensível |

---

## 9. Business Model

### 9.1 Pricing Tiers

| Plan | Price | Limits |
|------|-------|--------|
| **Starter** | Grátis | 1 instância, 5 grupos, comandos básicos |
| **Pro** | R$97/mês | 3 instâncias, grupos ilimitados, IA integrada, mensagens em massa |
| **Enterprise** | R$297/mês | 10 instâncias, grupos ilimitados, API access, gerente dedicado |

### 9.2 Cost Structure

- Uazapi: ~R$1,38/instância (100 números por R$138)
- OpenAI GPT-4o: ~$0.01 por 1k tokens
- Whisper: ~$0.006 por minuto de áudio
- Supabase: Free tier → ~$25/mês em escala
- Vercel: Free tier → ~$20/mês em escala

---

## 10. MVP Scope

### 10.1 In Scope (MVP)

- ✅ Auth + Planos
- ✅ Conectar instância (Uazapi)
- ✅ Gestão de grupos + Tags
- ✅ Config IA (prompt + docs)
- ✅ Gatilhos configuráveis
- ✅ Transcrição de áudio (manual/auto)
- ✅ Logs de mensagens/respostas

### 10.2 Out of Scope (v2+)

- ❌ Mensagens em massa (risco de ban)
- ❌ Métricas avançadas (dashboard analytics)
- ❌ Integrações externas (Slack, CRM, webhooks)
- ❌ Agendamento de mensagens
- ❌ Multi-instância (além do plano)
- ❌ White-label

---

## 11. Timeline

**Approach**: Sem prazo fixo, construção com IA para velocidade.

### 11.1 Suggested Phases

| Phase | Focus | Estimated |
|-------|-------|-----------|
| **Phase 1** | Foundation + Auth + Instance | 1-2 weeks |
| **Phase 2** | Groups + Tags + Basic IA | 1-2 weeks |
| **Phase 3** | Triggers + Transcription | 1-2 weeks |
| **Phase 4** | Logs + Billing + Polish | 1-2 weeks |

---

## 12. Next Steps

1. ✅ Project Brief - Approved
2. ⏳ PRD (Product Requirements Document)
3. ⏳ UI/UX Specification
4. ⏳ Architecture Document
5. ⏳ Development (Stories)

---

## Appendix A: Lessons from Pantero

Based on the Pantero project experience:

1. **Commands don't work** for non-technical users
2. **Web panel is essential** for configuration
3. **Visual prompt editor** needed for IA setup
4. **Trigger system** must be flexible
5. **Audio transcription** is a strong differentiator
6. **Keep it simple** - avoid feature creep

---

## Appendix B: User Journey (First Access)

1. Signup (email/Google)
2. Dashboard vazio → CTA "Conectar WhatsApp"
3. QR Code → Escaneia → Conectado
4. Lista grupos → Seleciona quais gerenciar
5. Wizard IA: Nome → Tom → Prompt → Docs (opcional)
6. Preview/Teste
7. Ativar → Setup completo!

**Target time**: < 10 minutes
