# Security Audit Skill

Skill para auditoria de seguranca em aplicacoes Next.js/React com Supabase e integracao de APIs externas.

## Quando Usar

Ativar esta skill quando:
- Usuario solicitar revisao de seguranca
- Antes de deploy para producao
- Apos adicionar novas integrações de API
- Ao configurar webhooks ou autenticacao
- Revisao de codigo sensivel

## Checklist de Auditoria

### 1. Exposicao de Secrets/Tokens

**CRITICO** - Verificar se tokens estao expostos no client-side:

```typescript
// RUIM - Token exposto no cliente
const API_KEY = "sk-1234567890abcdef"

// BOM - Usar variaveis de ambiente server-side
const API_KEY = process.env.API_KEY // Sem NEXT_PUBLIC_
```

**Padroes a buscar:**
- `NEXT_PUBLIC_` com tokens sensiveis
- Tokens hardcoded em arquivos `.ts/.tsx`
- API keys em commits do git

### 2. SQL Injection

**ALTO** - Verificar queries Supabase:

```typescript
// RUIM - Interpolacao direta
const { data } = await supabase.from("users").select().eq("id", userId)

// BOM - Parametros tipados (Supabase ja faz isso automaticamente)
// Mas cuidado com .rpc() e queries raw
```

### 3. XSS (Cross-Site Scripting)

**ALTO** - Verificar inputs de usuario:

```tsx
// RUIM - dangerouslySetInnerHTML com input nao sanitizado
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// BOM - Usar bibliotecas de sanitizacao ou evitar
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### 4. Webhooks

**ALTO** - Verificar configuracao de webhooks:

```typescript
// RUIM - URL do webhook vem do cliente
const webhookUrl = req.body.url

// BOM - URL controlada pelo servidor
const webhookUrl = process.env.WEBHOOK_URL
```

**Checklist webhooks:**
- [ ] URL vem de variavel de ambiente
- [ ] `excludeMessages` configurado para prevenir loops
- [ ] HTTPS obrigatorio
- [ ] Signature validation (se disponivel)

### 5. Autenticacao

**CRITICO** - Verificar fluxos de auth:

```typescript
// Verificar em todas as rotas protegidas
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  return NextResponse.redirect('/login')
}
```

### 6. RLS (Row Level Security)

**ALTO** - Verificar politicas Supabase:

```sql
-- Toda tabela com dados de usuario DEVE ter RLS
ALTER TABLE tabela ENABLE ROW LEVEL SECURITY;

-- Politica de isolamento por organizacao
CREATE POLICY "Isolamento por org" ON tabela
  USING (id_organizacao = auth.jwt() ->> 'org_id');
```

### 7. CORS

**MEDIO** - Verificar configuracao de CORS:

```typescript
// next.config.js - Verificar headers
headers: async () => [
  {
    source: '/api/:path*',
    headers: [
      { key: 'Access-Control-Allow-Origin', value: 'https://seudominio.com' },
    ],
  },
]
```

### 8. Rate Limiting

**MEDIO** - Verificar se rotas sensiveis tem limite:

```typescript
// Implementar com bibliotecas como 'rate-limiter-flexible'
// ou servicos como Vercel Edge Middleware
```

## Comando de Uso

```
Analise a seguranca de [arquivo/diretorio]
```

## Output Esperado

Relatorio com:
1. Vulnerabilidades encontradas (CRITICO/ALTO/MEDIO/BAIXO)
2. Localizacao no codigo (arquivo:linha)
3. Recomendacao de correcao
4. Codigo de exemplo corrigido

## Arquivos Prioritarios para Auditoria

1. `app/api/**/*.ts` - Todas as rotas de API
2. `lib/**/*.ts` - Services e utilitarios
3. `.env*` - Variaveis de ambiente
4. `middleware.ts` - Middleware de autenticacao
5. `**/route.ts` - Rotas do App Router
