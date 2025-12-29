# Migration: Adicionar Tipo de Transcrição

## 📋 Descrição

Esta migration adiciona o campo `tipo_transcricao` na tabela `config_transcricao`, permitindo configurar se a transcrição de áudio deve ser:
- **simples**: Apenas transcrição do áudio
- **com_resumo**: Transcrição + resumo do conteúdo

## 🚀 Como Executar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Abra o arquivo `migrations/add_tipo_transcricao.sql`
5. Copie todo o conteúdo
6. Cole no SQL Editor
7. Clique em **Run** ou pressione `Ctrl+Enter`

### Opção 2: Via CLI (se configurado)

```bash
# Se você tem o Supabase CLI configurado
supabase db push

# Ou usando psql diretamente
psql -h [SEU_HOST] -U postgres -d postgres -f migrations/add_tipo_transcricao.sql
```

## ✅ Verificação

Após executar a migration, verifique se foi aplicada corretamente:

```sql
-- Verificar se a coluna existe
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'config_transcricao'
AND column_name = 'tipo_transcricao';

-- Verificar se a constraint existe
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'config_transcricao'
AND constraint_name = 'check_tipo_transcricao';
```

## 🔄 Reversão (Rollback)

Se precisar reverter a migration:

```sql
-- Remover constraint
ALTER TABLE config_transcricao
DROP CONSTRAINT IF EXISTS check_tipo_transcricao;

-- Remover coluna
ALTER TABLE config_transcricao
DROP COLUMN IF EXISTS tipo_transcricao;
```

## 📝 Notas

- A migration é **idempotente** - pode ser executada múltiplas vezes sem problemas
- Todos os registros existentes receberão o valor padrão `'simples'`
- O valor padrão para novos registros é `'simples'`

## 🐛 Solução de Problemas

### Erro: "column already exists"
- Normal! A migration usa `IF NOT EXISTS`, então isso não deve acontecer
- Se acontecer, significa que a coluna já existe e você pode ignorar

### Erro: "constraint already exists"
- Normal! A migration remove a constraint antiga antes de recriar
- Se acontecer, execute apenas a parte de remoção da constraint primeiro

### Erro: "permission denied"
- Certifique-se de estar usando uma conexão com privilégios de administrador
- No Supabase Dashboard, use sempre a conexão do projeto (não precisa de senha)






