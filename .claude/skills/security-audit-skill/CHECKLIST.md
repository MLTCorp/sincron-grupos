# Security Audit Checklist

Use esta checklist para auditorias de seguranca.

## Pre-Deploy Checklist

### Secrets e Credenciais

- [ ] Nenhum token/secret hardcoded no codigo
- [ ] Variaveis sensiveis NAO usam prefixo `NEXT_PUBLIC_`
- [ ] `.env.local` esta no `.gitignore`
- [ ] Nenhuma credencial commitada no historico git
- [ ] Tokens de API rotacionados apos exposicao

### Autenticacao

- [ ] Todas as rotas protegidas verificam sessao
- [ ] Tokens JWT validados corretamente
- [ ] Sessoes expiram em tempo adequado
- [ ] Logout invalida sessao no servidor
- [ ] Protecao contra CSRF em forms

### Autorizacao

- [ ] RLS habilitado em todas as tabelas Supabase
- [ ] Politicas de isolamento por organizacao
- [ ] Permissoes verificadas no backend (nao apenas frontend)
- [ ] Roles e permissoes implementadas corretamente

### Input Validation

- [ ] Todos os inputs de usuario sanitizados
- [ ] Validacao de tipos (zod, yup, etc)
- [ ] Limites de tamanho em uploads
- [ ] File type validation em uploads
- [ ] Protecao contra path traversal

### API Security

- [ ] Rate limiting implementado
- [ ] CORS configurado corretamente
- [ ] Headers de seguranca (CSP, X-Frame-Options, etc)
- [ ] Respostas de erro nao vazam informacoes sensiveis
- [ ] Logs nao contem dados sensiveis

### Webhooks

- [ ] URLs de webhook em variaveis de ambiente
- [ ] `excludeMessages` configurado (prevencao de loops)
- [ ] HTTPS obrigatorio
- [ ] Signature validation quando disponivel
- [ ] Timeout configurado para prevenir DoS

### Database

- [ ] Queries parametrizadas (sem interpolacao)
- [ ] Indices em colunas de busca frequente
- [ ] Backups automaticos configurados
- [ ] Conexoes SSL habilitadas
- [ ] Usuarios com privilegios minimos

### Frontend

- [ ] Nenhum `dangerouslySetInnerHTML` sem sanitizacao
- [ ] Links externos com `rel="noopener noreferrer"`
- [ ] Imagens de terceiros com domains permitidos
- [ ] Nenhum console.log com dados sensiveis em producao
- [ ] Error boundaries implementados

### Infraestrutura

- [ ] HTTPS em todos os endpoints
- [ ] Certificados SSL validos
- [ ] DNS configurado corretamente
- [ ] Firewall rules adequadas
- [ ] Monitoramento de erros ativo

## Padroes de Busca (grep/search)

### Tokens Expostos
```bash
# Buscar por padroes de tokens
grep -r "sk-" --include="*.ts" --include="*.tsx"
grep -r "api_key\s*=" --include="*.ts" --include="*.tsx"
grep -r "NEXT_PUBLIC_.*KEY" --include="*.ts" --include="*.tsx"
```

### SQL Injection
```bash
# Buscar por string interpolation em queries
grep -r "\.rpc\(" --include="*.ts"
grep -r "\.sql\(" --include="*.ts"
```

### XSS
```bash
# Buscar por dangerouslySetInnerHTML
grep -r "dangerouslySetInnerHTML" --include="*.tsx"
```

### Logs Sensiveis
```bash
# Buscar por logs com dados potencialmente sensiveis
grep -r "console.log.*token" --include="*.ts" --include="*.tsx"
grep -r "console.log.*password" --include="*.ts" --include="*.tsx"
```

## Severidade

| Nivel | Descricao | Acao |
|-------|-----------|------|
| CRITICO | Exposicao de dados, RCE, bypass de auth | Corrigir IMEDIATAMENTE |
| ALTO | SQL injection, XSS, IDOR | Corrigir antes do deploy |
| MEDIO | Rate limiting, CORS, headers | Corrigir em breve |
| BAIXO | Melhores praticas, code quality | Backlog |
