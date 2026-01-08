# Instruções para Executar Migration via MCP Supabase

## Objetivo
Executar a migration SQL que adiciona o campo `tipo_transcricao` na tabela `config_transcricao`.

## Arquivo SQL
Localização: `migrations/add_tipo_transcricao.sql`

## O que fazer
1. Ler o arquivo `migrations/add_tipo_transcricao.sql`
2. Executar o SQL completo via MCP do Supabase usando `execute_sql`
3. Verificar se a execução foi bem-sucedida

## SQL para executar
```sql
-- Adicionar campo tipo_transcricao na tabela config_transcricao
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'config_transcricao' 
    AND column_name = 'tipo_transcricao'
  ) THEN
    ALTER TABLE config_transcricao
    ADD COLUMN tipo_transcricao TEXT DEFAULT 'simples';
    
    -- Atualizar registros existentes com valor padrao
    UPDATE config_transcricao 
    SET tipo_transcricao = 'simples' 
    WHERE tipo_transcricao IS NULL;
  END IF;
END $$;

-- Remover constraint antiga se existir (caso precise reexecutar)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_tipo_transcricao'
  ) THEN
    ALTER TABLE config_transcricao 
    DROP CONSTRAINT check_tipo_transcricao;
  END IF;
END $$;

-- Adicionar constraint para garantir valores validos
ALTER TABLE config_transcricao
ADD CONSTRAINT check_tipo_transcricao 
CHECK (tipo_transcricao IS NULL OR tipo_transcricao IN ('simples', 'com_resumo'));

-- Comentario explicativo
COMMENT ON COLUMN config_transcricao.tipo_transcricao IS 
'Tipo de transcricao: simples ou com_resumo (resumo do audio)';
```

## Verificação
Após executar, verificar se a coluna foi criada:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'config_transcricao'
AND column_name = 'tipo_transcricao';
```











