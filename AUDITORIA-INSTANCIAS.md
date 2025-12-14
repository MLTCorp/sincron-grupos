# Auditoria do Sistema de Instancias WhatsApp

**Data:** 12/12/2024
**Status:** Pendente correcao

---

## Resumo

- **21 problemas identificados**
- 5 criticos, 8 altos, 8 medios
- Sistema funcional mas com gaps de seguranca e persistencia

---

## Problemas Criticos (P1)

### 1. Token nao validado nas rotas API

**Arquivos afetados:**
- `app/api/uazapi/instances/[token]/webhook/route.ts`
- `app/api/uazapi/instances/[token]/groups/route.ts`
- `app/api/uazapi/instances/[token]/status/route.ts`

**Problema:** Qualquer token pode acessar qualquer rota. Sem validacao se token pertence a organizacao do usuario autenticado.

**Solucao:** Adicionar middleware que valida token contra `instancias_whatsapp` e `usuarios_sistema`.

---

### 2. Campo `jid` nao salvo no banco

**Problema:** O JID (ex: `5511999999999:87@s.whatsapp.net`) e o identificador unico da sessao WhatsApp. Necessario para:
- Referenciar instancia em webhooks
- Identificar de qual instancia veio uma mensagem
- Rastrear reconexoes

**Solucao:**
```sql
ALTER TABLE instancias_whatsapp ADD COLUMN jid VARCHAR(100);
CREATE INDEX idx_instancias_jid ON instancias_whatsapp(jid);
```

---

### 3. `numero_telefone` sem constraint UNIQUE

**Problema:** Pode cadastrar duas instancias com mesmo telefone. Causa:
- Grupos vinculados a instancia errada
- Webhooks duplicados
- Confusao na identificacao

**Solucao:**
```sql
ALTER TABLE instancias_whatsapp
ADD CONSTRAINT unique_numero_telefone UNIQUE (numero_telefone);
```

---

### 4. `grupos.id_instancia` sem ON DELETE CASCADE

**Problema:** Se deletar instancia, grupos ficam orfaos com `id_instancia` apontando para registro inexistente.

**Solucao:**
```sql
ALTER TABLE grupos
DROP CONSTRAINT IF EXISTS grupos_id_instancia_fkey,
ADD CONSTRAINT grupos_id_instancia_fkey
  FOREIGN KEY (id_instancia)
  REFERENCES instancias_whatsapp(id)
  ON DELETE SET NULL;
```

---

### 5. Webhook nao persistido no banco

**Arquivos afetados:**
- `app/api/uazapi/instances/[token]/webhook/route.ts`
- `app/(dashboard)/instances/[id]/connect/page.tsx`

**Problema:** Webhook configurado na UAZAPI mas `webhook_url` nunca salvo em `instancias_whatsapp`. Se UAZAPI resetar, webhook perdido sem como recuperar.

**Solucao:**
1. Apos configurar webhook, salvar URL no banco
2. Adicionar campo `webhook_configured_at`

---

## Problemas Altos (P2)

### 6. `adminField01` enviado mas nao salvo

**Arquivo:** `app/(dashboard)/instances/new/page.tsx` linha 49-53

**Problema:** Enviamos `adminField01: "org-${id}"` para UAZAPI mas nao salvamos no Supabase.

---

### 7. Body nao validado em POST /instances

**Arquivo:** `app/api/uazapi/instances/route.ts`

**Problema:** Aceita qualquer JSON. Campos `name`, `systemName` podem ser vazios.

**Solucao:** Implementar validacao com Zod.

---

### 8-9. Campos `delayMin/delayMax` e `pairCode` nao salvos

**Problema:** Dados de rate limiting e codigo de pareamento nao persistidos.

---

### 10. Timestamps UAZAPI nao salvos

**Problema:** `instance.created` e `instance.updated` da UAZAPI ignorados. Usamos apenas `dt_create` local.

---

### 11. `systemName` nao salvo

**Problema:** Enviamos "sincron-grupos" para UAZAPI mas nao persistimos.

---

### 12. Status oscila = campos desatualizam

**Arquivo:** `app/(dashboard)/instances/page.tsx` linhas 99-107

**Problema:** Condicao `if (instancia.status !== newStatus)` pode ignorar atualizacoes de outros campos se status nao mudou.

---

### 13. Typo `plataform` vs `platform`

**Problema:** UAZAPI usa `plataform` (typo). Codigo salva em `platform`. Pode causar confusao.

---

## Problemas Medios (P3)

### 14-18. Campos que faltam no banco

| Campo | Uso |
|-------|-----|
| `webhook_status` | Sucesso/erro/pendente |
| `ultima_sincronizacao_grupos` | Timestamp |
| `tentativas_reconexao` | Counter |
| `token_renovacao_data` | Rotacao de tokens |
| `versao_api_uazapi` | Track breaking changes |

---

### 19. Campos existentes mas nunca preenchidos

| Campo | Status |
|-------|--------|
| `api_url` | Sempre NULL |
| `webhook_url` | Sempre NULL |

---

### 20. Duplicacao de logica phone extraction

**Arquivos:**
- `lib/uazapi/service.ts` (extractPhoneFromJID)
- `app/api/uazapi/instances/[token]/status/route.ts` (duplica logica)

---

### 21. Sem paginacao em /groups

**Arquivo:** `app/api/uazapi/instances/[token]/groups/route.ts`

**Problema:** Limite hardcoded de 100 grupos. Se instancia tiver mais, dados truncados.

---

## Correcoes ja Feitas (12/12/2024)

1. [x] Regex `extractPhoneFromJID` corrigida para formato `:87@`
2. [x] `id_instancia` adicionado ao salvar grupos
3. [x] Query de instancia agora busca `id` alem de `api_key`
4. [x] Grupos existentes atualizados com `id_instancia` correto
5. [x] `numero_telefone` atualizado na instancia existente

---

## Proximos Passos Sugeridos

### Sprint 1 (Criticos)
1. Adicionar validacao de token nas rotas
2. Adicionar constraint UNIQUE em numero_telefone
3. Persistir webhook_url no banco
4. Adicionar campo jid

### Sprint 2 (Altos)
5. Validacao de body com Zod
6. Corrigir logica de atualizacao de status
7. Salvar adminField01, systemName

### Sprint 3 (Medios)
8. Adicionar campos de auditoria
9. Remover duplicacao de codigo
10. Implementar paginacao
