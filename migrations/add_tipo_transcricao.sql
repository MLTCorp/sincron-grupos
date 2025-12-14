-- =====================================================
-- MIGRATION: Adicionar campo tipo_transcricao
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =====================================================

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

-- =====================================================
-- ATUALIZAR QUERY PARA N8N (se necessario)
-- =====================================================
/*
-- Query atualizada para incluir tipo_transcricao
WITH grupo_info AS (
  SELECT g.id, g.id_organizacao, g.id_categoria
  FROM grupos g
  WHERE g.chat_id_whatsapp = '{{ $json.chatId }}'
),
config_grupo AS (
  SELECT ct.modo, ct.emoji_gatilho, ct.tipo_transcricao
  FROM config_transcricao ct
  JOIN grupo_info gi ON ct.id_grupo = gi.id
  WHERE ct.id_organizacao = gi.id_organizacao
),
config_categoria AS (
  SELECT ct.modo, ct.emoji_gatilho, ct.tipo_transcricao
  FROM config_transcricao ct
  JOIN grupo_info gi ON ct.id_categoria = gi.id_categoria
  WHERE ct.id_organizacao = gi.id_organizacao
)
SELECT
  COALESCE(
    (SELECT modo FROM config_grupo),
    (SELECT modo FROM config_categoria),
    'desativado'
  ) AS modo,
  COALESCE(
    (SELECT emoji_gatilho FROM config_grupo),
    (SELECT emoji_gatilho FROM config_categoria),
    '✍️'
  ) AS emoji_gatilho,
  COALESCE(
    (SELECT tipo_transcricao FROM config_grupo),
    (SELECT tipo_transcricao FROM config_categoria),
    'simples'
  ) AS tipo_transcricao
FROM grupo_info;
*/

