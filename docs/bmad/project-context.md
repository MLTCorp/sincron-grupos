# Project Context: Sincron Grupos

## Visao Geral

**Nome:** Sincron Grupos
**Tipo:** MicroSaaS Multi-tenant
**Proposito:** Gerenciamento de grupos WhatsApp com automacoes

## Problema que Resolve

Empresas e comunidades precisam gerenciar multiplos grupos WhatsApp de forma organizada, com:
- Categorizacao de grupos
- Envio de mensagens em massa
- Automacoes via gatilhos
- Transcricao de audios

## Usuarios

### Primario: Gestor de Comunidade
- Gerencia 10-100 grupos
- Envia comunicados frequentes
- Precisa organizar grupos por tema
- Usa principalmente mobile

### Secundario: Equipe de Suporte
- Acessa via convite
- Permissoes limitadas
- Executa tarefas especificas

## Fluxo Principal (Atual)

1. Login / Signup
2. Criar organizacao
3. Criar instancia WhatsApp
4. Conectar via QR Code
5. Sincronizar grupos
6. Categorizar grupos
7. Configurar automacoes
8. Enviar mensagens

## Pain Points Identificados

1. **Fragmentacao** - Muitas paginas para tarefas relacionadas
2. **Navegacao** - Muitos cliques para tarefas simples
3. **Contexto** - Perde-se contexto ao navegar
4. **Mobile** - Experiencia ruim em celular

## Solucao Proposta

**Command Center** - Interface unificada onde:
- Tudo esta visivel de uma vez
- Configuracoes sao inline/drawer
- Acoes rapidas sempre acessiveis
- Mobile-first

## Stack Tecnico

- **Frontend:** Next.js 16, TypeScript, Tailwind, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **WhatsApp:** UAZAPI (API terceira)
- **Automacoes:** N8N (futuro)

## Restricoes

- Deve manter compatibilidade com auth existente
- Nao alterar schema do banco (apenas queries)
- Performance: <2s para carregar dashboard
- Funcionar em 3G/4G

## Metricas de Sucesso

1. Reducao de cliques para tarefas comuns (50%)
2. Tempo de onboarding (<5min)
3. Uso mobile aumentar (target: 40%)
4. NPS >7

## Timeline

- **Sprint 1:** MVP do Command Center
- **Sprint 2:** Configuracoes inline
- **Sprint 3:** Polimento e testes
- **Launch:** Validar com usuarios beta

## Stakeholders

- **Product Owner:** Usuario (voce)
- **Dev:** Claude Code
- **Design:** BMAD UX Agent

## Documentos Relacionados

- [Tech Spec](./tech-spec.md)
- [UX Design](./ux-design.md)
- [Epics e Stories](./epics.md)
- [CLAUDE.md](../../CLAUDE.md) - Instrucoes de codigo
