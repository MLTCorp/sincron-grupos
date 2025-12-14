-- =====================================================
-- QUERY N8N ATUALIZADA COM TIPO_TRANSCRICAO
-- =====================================================
-- Use esta query no N8N para buscar informações do grupo
-- Inclui: grupo, config_transcricao (com tipo_transcricao), gatilhos
-- =====================================================

WITH grupo_info AS (
    SELECT
      g.id,
      g.id_organizacao,
      g.chat_id_whatsapp,
      g.nome,
      g.ativo,
      g.guardar_todas_mensagens,
      g.processar_simultaneo,
      g.id_categoria,
      g.dt_create,
      g.dt_update
    FROM grupos g
    INNER JOIN instancias_whatsapp i ON i.id = g.id_instancia
    WHERE g.chat_id_whatsapp = '{{ $json.variaveis.chat.chatId }}'
      AND i.numero_telefone = '{{ $json.variaveis.instance.number }}'
      AND g.ativo = true
  ),

  -- Config de transcrição efetiva (hierarquia: grupo > categoria > desativado)
  config_transcricao_efetiva AS (
    SELECT
      COALESCE(
        -- Primeiro: config específica do grupo
        (SELECT json_build_object(
           'modo', ct.modo,
           'emoji_gatilho', ct.emoji_gatilho,
           'tipo_transcricao', COALESCE(ct.tipo_transcricao, 'simples')
         )
         FROM config_transcricao ct
         CROSS JOIN grupo_info gi
         WHERE ct.id_grupo = gi.id),
        -- Segundo: config da categoria
        (SELECT json_build_object(
           'modo', ct.modo,
           'emoji_gatilho', ct.emoji_gatilho,
           'tipo_transcricao', COALESCE(ct.tipo_transcricao, 'simples')
         )
         FROM config_transcricao ct
         CROSS JOIN grupo_info gi
         WHERE ct.id_categoria = gi.id_categoria
           AND ct.id_grupo IS NULL
           AND gi.id_categoria IS NOT NULL),
        -- Terceiro: desativado por padrão
        json_build_object(
          'modo', 'desativado',
          'emoji_gatilho', null,
          'tipo_transcricao', 'simples'
        )
      ) as config
  ),

  -- Gatilhos aplicáveis
  gatilhos_aplicaveis AS (
    SELECT
      gt.id,
      gt.nome,
      gt.descricao,
      gt.tipo_evento,
      gt.condicoes,
      gt.tipo_acao,
      gt.config_acao,
      gt.prioridade
    FROM gatilhos gt
    CROSS JOIN grupo_info gi
    WHERE gt.id_organizacao = gi.id_organizacao
      AND gt.ativo = true
      AND (
        (gt.id_grupo IS NULL AND gt.id_categoria IS NULL)
        OR gt.id_grupo = gi.id
        OR (gt.id_categoria IS NOT NULL AND gt.id_categoria = gi.id_categoria)
      )
    ORDER BY gt.prioridade ASC
  )

  SELECT
    gi.*,
    (SELECT config FROM config_transcricao_efetiva) as config_transcricao,
    COALESCE(
      (SELECT json_agg(ga.*) FROM gatilhos_aplicaveis ga),
      '[]'::json
    ) AS gatilhos
  FROM grupo_info gi;

-- =====================================================
-- EXEMPLO DE RESPOSTA ESPERADA:
-- =====================================================
/*
[
  {
    "id": "1",
    "id_organizacao": "2",
    "chat_id_whatsapp": "120363400460680435",
    "nome": "Sincron IA",
    "ativo": true,
    "guardar_todas_mensagens": true,
    "processar_simultaneo": true,
    "id_categoria": "2",
    "dt_create": "2025-11-04T22:33:55.141Z",
    "dt_update": "2025-12-12T14:33:31.946Z",
    "config_transcricao": {
      "modo": "automatico",
      "emoji_gatilho": "✍️",
      "tipo_transcricao": "com_resumo"  <-- NOVO CAMPO
    },
    "gatilhos": []
  }
]
*/

-- =====================================================
-- HIERARQUIA DE TIPO_TRANSCRICAO:
-- =====================================================
-- 1. Configuração específica do grupo (maior prioridade)
-- 2. Configuração da categoria (se grupo não tem)
-- 3. Padrão: 'simples' (se nenhuma config existe)
--
-- Valores possíveis: 'simples' ou 'com_resumo'
-- =====================================================

-- =====================================================
-- COMO USAR NO N8N:
-- =====================================================
-- 1. No PostgreSQL Node, cole esta query
-- 2. Acesse o tipo de transcrição com: {{ $json.config_transcricao.tipo_transcricao }}
-- 3. Use IF node para rotear:
--    - Se tipo_transcricao === 'simples': rota para transcrição simples
--    - Se tipo_transcricao === 'com_resumo': rota para transcrição + resumo
-- =====================================================
