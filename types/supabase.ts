export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agent_chats: {
        Row: {
          created_at: string | null
          id: string
          id_organizacao: number | null
          messages: Json | null
          title: string | null
          tool_calls: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          id_organizacao?: number | null
          messages?: Json | null
          title?: string | null
          tool_calls?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          id_organizacao?: number | null
          messages?: Json | null
          title?: string | null
          tool_calls?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_chats_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_chats_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["organizacao_id"]
          },
        ]
      }
      agentes_ia: {
        Row: {
          ativo: boolean
          descricao: string | null
          dt_create: string | null
          dt_update: string | null
          id: number
          id_organizacao: number
          max_tokens: number | null
          modelo: string
          nome: string
          prompt_sistema: string
          responder_no_grupo: boolean | null
          temperatura: number | null
        }
        Insert: {
          ativo?: boolean
          descricao?: string | null
          dt_create?: string | null
          dt_update?: string | null
          id?: number
          id_organizacao: number
          max_tokens?: number | null
          modelo?: string
          nome: string
          prompt_sistema: string
          responder_no_grupo?: boolean | null
          temperatura?: number | null
        }
        Update: {
          ativo?: boolean
          descricao?: string | null
          dt_create?: string | null
          dt_update?: string | null
          id?: number
          id_organizacao?: number
          max_tokens?: number | null
          modelo?: string
          nome?: string
          prompt_sistema?: string
          responder_no_grupo?: boolean | null
          temperatura?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agentes_ia_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agentes_ia_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["organizacao_id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          id: string
          id_organizacao: number
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          key_suffix: string
          last_used_at: string | null
          name: string | null
          revoked_at: string | null
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          id_organizacao: number
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          key_suffix: string
          last_used_at?: string | null
          name?: string | null
          revoked_at?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          id_organizacao?: number
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          key_suffix?: string
          last_used_at?: string | null
          name?: string | null
          revoked_at?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["organizacao_id"]
          },
        ]
      }
      categorias: {
        Row: {
          ativo: boolean | null
          cor: string
          descricao: string | null
          dt_create: string | null
          dt_update: string | null
          id: number
          id_organizacao: number
          nome: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          cor?: string
          descricao?: string | null
          dt_create?: string | null
          dt_update?: string | null
          id?: number
          id_organizacao: number
          nome: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          cor?: string
          descricao?: string | null
          dt_create?: string | null
          dt_update?: string | null
          id?: number
          id_organizacao?: number
          nome?: string
          ordem?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categorias_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categorias_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["organizacao_id"]
          },
        ]
      }
      config_transcricao: {
        Row: {
          dt_create: string | null
          dt_update: string | null
          emoji_gatilho: string | null
          id: number
          id_categoria: number | null
          id_grupo: number | null
          id_organizacao: number
          modo: string
          tipo_transcricao: string | null
        }
        Insert: {
          dt_create?: string | null
          dt_update?: string | null
          emoji_gatilho?: string | null
          id?: number
          id_categoria?: number | null
          id_grupo?: number | null
          id_organizacao: number
          modo?: string
          tipo_transcricao?: string | null
        }
        Update: {
          dt_create?: string | null
          dt_update?: string | null
          emoji_gatilho?: string | null
          id?: number
          id_categoria?: number | null
          id_grupo?: number | null
          id_organizacao?: number
          modo?: string
          tipo_transcricao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_transcricao_id_categoria_fkey"
            columns: ["id_categoria"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "config_transcricao_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "config_transcricao_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "v_estatisticas_grupos"
            referencedColumns: ["grupo_id"]
          },
          {
            foreignKeyName: "config_transcricao_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["grupo_id"]
          },
          {
            foreignKeyName: "config_transcricao_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "config_transcricao_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["organizacao_id"]
          },
        ]
      }
      execucoes_gatilhos: {
        Row: {
          chat_id_whatsapp: string | null
          conteudo_mensagem: string | null
          dt_execucao: string | null
          erro: string | null
          id: number
          id_gatilho: number
          id_grupo: number | null
          id_mensagem: number | null
          remetente: string | null
          resultado: Json | null
          sucesso: boolean
        }
        Insert: {
          chat_id_whatsapp?: string | null
          conteudo_mensagem?: string | null
          dt_execucao?: string | null
          erro?: string | null
          id?: number
          id_gatilho: number
          id_grupo?: number | null
          id_mensagem?: number | null
          remetente?: string | null
          resultado?: Json | null
          sucesso?: boolean
        }
        Update: {
          chat_id_whatsapp?: string | null
          conteudo_mensagem?: string | null
          dt_execucao?: string | null
          erro?: string | null
          id?: number
          id_gatilho?: number
          id_grupo?: number | null
          id_mensagem?: number | null
          remetente?: string | null
          resultado?: Json | null
          sucesso?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "execucoes_gatilhos_id_gatilho_fkey"
            columns: ["id_gatilho"]
            isOneToOne: false
            referencedRelation: "gatilhos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execucoes_gatilhos_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execucoes_gatilhos_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "v_estatisticas_grupos"
            referencedColumns: ["grupo_id"]
          },
          {
            foreignKeyName: "execucoes_gatilhos_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["grupo_id"]
          },
          {
            foreignKeyName: "execucoes_gatilhos_id_mensagem_fkey"
            columns: ["id_mensagem"]
            isOneToOne: false
            referencedRelation: "mensagens_whatsapp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execucoes_gatilhos_id_mensagem_fkey"
            columns: ["id_mensagem"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          audio_url: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          pagina_atual: string
          resolvido_em: string | null
          resposta_admin: string | null
          screenshot_url: string | null
          status: string
          texto: string
          tipo: string
          transcricao_audio: string | null
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          pagina_atual: string
          resolvido_em?: string | null
          resposta_admin?: string | null
          screenshot_url?: string | null
          status?: string
          texto: string
          tipo: string
          transcricao_audio?: string | null
          user_id: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          pagina_atual?: string
          resolvido_em?: string | null
          resposta_admin?: string | null
          screenshot_url?: string | null
          status?: string
          texto?: string
          tipo?: string
          transcricao_audio?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gatilhos: {
        Row: {
          ativo: boolean
          condicoes: Json
          config_acao: Json
          descricao: string | null
          dt_create: string | null
          dt_update: string | null
          id: number
          id_categoria: number | null
          id_grupo: number | null
          id_organizacao: number
          nome: string
          prioridade: number
          tipo_acao: string
          tipo_evento: string
        }
        Insert: {
          ativo?: boolean
          condicoes?: Json
          config_acao?: Json
          descricao?: string | null
          dt_create?: string | null
          dt_update?: string | null
          id?: number
          id_categoria?: number | null
          id_grupo?: number | null
          id_organizacao: number
          nome: string
          prioridade?: number
          tipo_acao: string
          tipo_evento: string
        }
        Update: {
          ativo?: boolean
          condicoes?: Json
          config_acao?: Json
          descricao?: string | null
          dt_create?: string | null
          dt_update?: string | null
          id?: number
          id_categoria?: number | null
          id_grupo?: number | null
          id_organizacao?: number
          nome?: string
          prioridade?: number
          tipo_acao?: string
          tipo_evento?: string
        }
        Relationships: [
          {
            foreignKeyName: "gatilhos_id_categoria_fkey"
            columns: ["id_categoria"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gatilhos_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gatilhos_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "v_estatisticas_grupos"
            referencedColumns: ["grupo_id"]
          },
          {
            foreignKeyName: "gatilhos_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["grupo_id"]
          },
          {
            foreignKeyName: "gatilhos_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gatilhos_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["organizacao_id"]
          },
        ]
      }
      grupos: {
        Row: {
          ativo: boolean
          chat_id_whatsapp: string
          dt_create: string
          dt_update: string
          foto_url: string | null
          guardar_todas_mensagens: boolean | null
          id: number
          id_categoria: number | null
          id_instancia: number | null
          id_organizacao: number
          nome: string
          processar_simultaneo: boolean | null
        }
        Insert: {
          ativo?: boolean
          chat_id_whatsapp: string
          dt_create?: string
          dt_update?: string
          foto_url?: string | null
          guardar_todas_mensagens?: boolean | null
          id?: number
          id_categoria?: number | null
          id_instancia?: number | null
          id_organizacao: number
          nome: string
          processar_simultaneo?: boolean | null
        }
        Update: {
          ativo?: boolean
          chat_id_whatsapp?: string
          dt_create?: string
          dt_update?: string
          foto_url?: string | null
          guardar_todas_mensagens?: boolean | null
          id?: number
          id_categoria?: number | null
          id_instancia?: number | null
          id_organizacao?: number
          nome?: string
          processar_simultaneo?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "grupos_id_categoria_fkey"
            columns: ["id_categoria"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grupos_id_instancia_fkey"
            columns: ["id_instancia"]
            isOneToOne: false
            referencedRelation: "instancias_whatsapp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grupos_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grupos_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["organizacao_id"]
          },
        ]
      }
      grupos_categorias: {
        Row: {
          dt_create: string | null
          id: number
          id_categoria: number
          id_grupo: number
        }
        Insert: {
          dt_create?: string | null
          id?: number
          id_categoria: number
          id_grupo: number
        }
        Update: {
          dt_create?: string | null
          id?: number
          id_categoria?: number
          id_grupo?: number
        }
        Relationships: [
          {
            foreignKeyName: "grupos_categorias_id_categoria_fkey"
            columns: ["id_categoria"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grupos_categorias_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grupos_categorias_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "v_estatisticas_grupos"
            referencedColumns: ["grupo_id"]
          },
          {
            foreignKeyName: "grupos_categorias_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["grupo_id"]
          },
        ]
      }
      instancias_whatsapp: {
        Row: {
          api_key: string | null
          api_url: string | null
          ativo: boolean | null
          dt_create: string | null
          dt_update: string | null
          id: number
          id_organizacao: number
          is_business: boolean | null
          last_disconnect_at: string | null
          last_disconnect_reason: string | null
          nome_instancia: string
          numero_telefone: string | null
          platform: string | null
          profile_name: string | null
          profile_pic_url: string | null
          status: string | null
          webhook_url: string | null
        }
        Insert: {
          api_key?: string | null
          api_url?: string | null
          ativo?: boolean | null
          dt_create?: string | null
          dt_update?: string | null
          id?: number
          id_organizacao: number
          is_business?: boolean | null
          last_disconnect_at?: string | null
          last_disconnect_reason?: string | null
          nome_instancia: string
          numero_telefone?: string | null
          platform?: string | null
          profile_name?: string | null
          profile_pic_url?: string | null
          status?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_key?: string | null
          api_url?: string | null
          ativo?: boolean | null
          dt_create?: string | null
          dt_update?: string | null
          id?: number
          id_organizacao?: number
          is_business?: boolean | null
          last_disconnect_at?: string | null
          last_disconnect_reason?: string | null
          nome_instancia?: string
          numero_telefone?: string | null
          platform?: string | null
          profile_name?: string | null
          profile_pic_url?: string | null
          status?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instancias_whatsapp_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instancias_whatsapp_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["organizacao_id"]
          },
        ]
      }
      membros: {
        Row: {
          ativo: boolean
          dt_create: string
          dt_update: string
          id: number
          nome: string
          whatsapp: string
        }
        Insert: {
          ativo?: boolean
          dt_create?: string
          dt_update?: string
          id?: number
          nome: string
          whatsapp: string
        }
        Update: {
          ativo?: boolean
          dt_create?: string
          dt_update?: string
          id?: number
          nome?: string
          whatsapp?: string
        }
        Relationships: []
      }
      membros_grupos: {
        Row: {
          ativo: boolean
          dt_create: string
          id: number
          id_grupo: number
          id_membro: number
        }
        Insert: {
          ativo?: boolean
          dt_create?: string
          id?: number
          id_grupo: number
          id_membro: number
        }
        Update: {
          ativo?: boolean
          dt_create?: string
          id?: number
          id_grupo?: number
          id_membro?: number
        }
        Relationships: [
          {
            foreignKeyName: "membros_grupos_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membros_grupos_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "v_estatisticas_grupos"
            referencedColumns: ["grupo_id"]
          },
          {
            foreignKeyName: "membros_grupos_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["grupo_id"]
          },
          {
            foreignKeyName: "membros_grupos_id_membro_fkey"
            columns: ["id_membro"]
            isOneToOne: false
            referencedRelation: "membros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membros_grupos_id_membro_fkey"
            columns: ["id_membro"]
            isOneToOne: false
            referencedRelation: "v_atividade_membros"
            referencedColumns: ["membro_id"]
          },
          {
            foreignKeyName: "membros_grupos_id_membro_fkey"
            columns: ["id_membro"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["membro_id"]
          },
        ]
      }
      mensagens_programadas: {
        Row: {
          categoria_id: number | null
          conteudo_texto: string | null
          criado_por: number | null
          dt_agendamento: string | null
          dt_create: string | null
          dt_enviado: string | null
          dt_update: string | null
          enviar_agora: boolean | null
          erro_mensagem: string | null
          grupos_ids: number[] | null
          id: number
          id_organizacao: number
          nome_arquivo: string | null
          status: string | null
          tipo_mensagem: string
          url_midia: string | null
        }
        Insert: {
          categoria_id?: number | null
          conteudo_texto?: string | null
          criado_por?: number | null
          dt_agendamento?: string | null
          dt_create?: string | null
          dt_enviado?: string | null
          dt_update?: string | null
          enviar_agora?: boolean | null
          erro_mensagem?: string | null
          grupos_ids?: number[] | null
          id?: number
          id_organizacao: number
          nome_arquivo?: string | null
          status?: string | null
          tipo_mensagem: string
          url_midia?: string | null
        }
        Update: {
          categoria_id?: number | null
          conteudo_texto?: string | null
          criado_por?: number | null
          dt_agendamento?: string | null
          dt_create?: string | null
          dt_enviado?: string | null
          dt_update?: string | null
          enviar_agora?: boolean | null
          erro_mensagem?: string | null
          grupos_ids?: number[] | null
          id?: number
          id_organizacao?: number
          nome_arquivo?: string | null
          status?: string | null
          tipo_mensagem?: string
          url_midia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_programadas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_programadas_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "usuarios_sistema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_programadas_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_programadas_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["organizacao_id"]
          },
        ]
      }
      mensagens_whatsapp: {
        Row: {
          conteudo_texto: string | null
          dt_create: string
          duracao_audio: number | null
          id: number
          id_grupo: number
          id_membro: number
          id_mensagem_respondida: number | null
          tipo_mensagem: string
          url_midia: string | null
          whatsapp_message_id: string
        }
        Insert: {
          conteudo_texto?: string | null
          dt_create?: string
          duracao_audio?: number | null
          id?: number
          id_grupo: number
          id_membro: number
          id_mensagem_respondida?: number | null
          tipo_mensagem: string
          url_midia?: string | null
          whatsapp_message_id: string
        }
        Update: {
          conteudo_texto?: string | null
          dt_create?: string
          duracao_audio?: number | null
          id?: number
          id_grupo?: number
          id_membro?: number
          id_mensagem_respondida?: number | null
          tipo_mensagem?: string
          url_midia?: string | null
          whatsapp_message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_whatsapp_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_whatsapp_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "v_estatisticas_grupos"
            referencedColumns: ["grupo_id"]
          },
          {
            foreignKeyName: "mensagens_whatsapp_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["grupo_id"]
          },
          {
            foreignKeyName: "mensagens_whatsapp_id_membro_fkey"
            columns: ["id_membro"]
            isOneToOne: false
            referencedRelation: "membros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_whatsapp_id_membro_fkey"
            columns: ["id_membro"]
            isOneToOne: false
            referencedRelation: "v_atividade_membros"
            referencedColumns: ["membro_id"]
          },
          {
            foreignKeyName: "mensagens_whatsapp_id_membro_fkey"
            columns: ["id_membro"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["membro_id"]
          },
          {
            foreignKeyName: "mensagens_whatsapp_id_mensagem_respondida_fkey"
            columns: ["id_mensagem_respondida"]
            isOneToOne: false
            referencedRelation: "mensagens_whatsapp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_whatsapp_id_mensagem_respondida_fkey"
            columns: ["id_mensagem_respondida"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          data_leitura: string | null
          dt_create: string | null
          id: number
          id_organizacao: number
          id_usuario: number | null
          lida: boolean | null
          mensagem: string
          metadata: Json | null
          tipo: string
          titulo: string
        }
        Insert: {
          data_leitura?: string | null
          dt_create?: string | null
          id?: number
          id_organizacao: number
          id_usuario?: number | null
          lida?: boolean | null
          mensagem: string
          metadata?: Json | null
          tipo: string
          titulo: string
        }
        Update: {
          data_leitura?: string | null
          dt_create?: string | null
          id?: number
          id_organizacao?: number
          id_usuario?: number | null
          lida?: boolean | null
          mensagem?: string
          metadata?: Json | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["organizacao_id"]
          },
          {
            foreignKeyName: "notificacoes_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios_sistema"
            referencedColumns: ["id"]
          },
        ]
      }
      organizacoes: {
        Row: {
          ativa: boolean
          dt_create: string
          dt_update: string
          id: number
          nome: string
          plan_limits: Json | null
          plano: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          trial_ends_at: string | null
        }
        Insert: {
          ativa?: boolean
          dt_create?: string
          dt_update?: string
          id?: number
          nome: string
          plan_limits?: Json | null
          plano?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
        }
        Update: {
          ativa?: boolean
          dt_create?: string
          dt_update?: string
          id?: number
          nome?: string
          plan_limits?: Json | null
          plano?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
        }
        Relationships: []
      }
      permissoes_usuario: {
        Row: {
          configurar_comandos: boolean | null
          configurar_gatilhos: boolean | null
          dt_create: string | null
          dt_update: string | null
          enviar_mensagens: boolean | null
          gerenciar_categorias: boolean | null
          gerenciar_grupos: boolean | null
          gerenciar_instancias: boolean | null
          gerenciar_usuarios: boolean | null
          id: number
          id_usuario_sistema: number
          ver_analytics: boolean | null
        }
        Insert: {
          configurar_comandos?: boolean | null
          configurar_gatilhos?: boolean | null
          dt_create?: string | null
          dt_update?: string | null
          enviar_mensagens?: boolean | null
          gerenciar_categorias?: boolean | null
          gerenciar_grupos?: boolean | null
          gerenciar_instancias?: boolean | null
          gerenciar_usuarios?: boolean | null
          id?: number
          id_usuario_sistema: number
          ver_analytics?: boolean | null
        }
        Update: {
          configurar_comandos?: boolean | null
          configurar_gatilhos?: boolean | null
          dt_create?: string | null
          dt_update?: string | null
          enviar_mensagens?: boolean | null
          gerenciar_categorias?: boolean | null
          gerenciar_grupos?: boolean | null
          gerenciar_instancias?: boolean | null
          gerenciar_usuarios?: boolean | null
          id?: number
          id_usuario_sistema?: number
          ver_analytics?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "permissoes_usuario_id_usuario_sistema_fkey"
            columns: ["id_usuario_sistema"]
            isOneToOne: true
            referencedRelation: "usuarios_sistema"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios_grupos: {
        Row: {
          ativo: boolean
          dt_create: string
          id: number
          id_grupo: number
          id_usuario_sistema: number
          permissao: string
        }
        Insert: {
          ativo?: boolean
          dt_create?: string
          id?: number
          id_grupo: number
          id_usuario_sistema: number
          permissao?: string
        }
        Update: {
          ativo?: boolean
          dt_create?: string
          id?: number
          id_grupo?: number
          id_usuario_sistema?: number
          permissao?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_grupos_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_grupos_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "v_estatisticas_grupos"
            referencedColumns: ["grupo_id"]
          },
          {
            foreignKeyName: "usuarios_grupos_id_grupo_fkey"
            columns: ["id_grupo"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["grupo_id"]
          },
          {
            foreignKeyName: "usuarios_grupos_id_usuario_sistema_fkey"
            columns: ["id_usuario_sistema"]
            isOneToOne: false
            referencedRelation: "usuarios_sistema"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios_sistema: {
        Row: {
          accepted_at: string | null
          ativo: boolean
          auth_user_id: string | null
          dt_create: string
          dt_update: string
          email: string
          id: number
          id_organizacao: number
          invite_expires_at: string | null
          invite_token: string | null
          invited_by: number | null
          nome: string
          role: string | null
          senha_hash: string | null
        }
        Insert: {
          accepted_at?: string | null
          ativo?: boolean
          auth_user_id?: string | null
          dt_create?: string
          dt_update?: string
          email: string
          id?: number
          id_organizacao: number
          invite_expires_at?: string | null
          invite_token?: string | null
          invited_by?: number | null
          nome: string
          role?: string | null
          senha_hash?: string | null
        }
        Update: {
          accepted_at?: string | null
          ativo?: boolean
          auth_user_id?: string | null
          dt_create?: string
          dt_update?: string
          email?: string
          id?: number
          id_organizacao?: number
          invite_expires_at?: string | null
          invite_token?: string | null
          invited_by?: number | null
          nome?: string
          role?: string | null
          senha_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_sistema_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "organizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_sistema_id_organizacao_fkey"
            columns: ["id_organizacao"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["organizacao_id"]
          },
          {
            foreignKeyName: "usuarios_sistema_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "usuarios_sistema"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_atividade_membros: {
        Row: {
          membro_ativo: boolean | null
          membro_id: number | null
          membro_nome: string | null
          membro_whatsapp: string | null
          mensagens_audio: number | null
          mensagens_texto: number | null
          total_grupos: number | null
          total_mensagens: number | null
          ultima_mensagem_dt: string | null
        }
        Relationships: []
      }
      v_estatisticas_grupos: {
        Row: {
          chat_id_whatsapp: string | null
          grupo_ativo: boolean | null
          grupo_criado_em: string | null
          grupo_id: number | null
          grupo_nome: string | null
          organizacao_nome: string | null
          total_membros: number | null
          total_mensagens: number | null
          total_mensagens_audio: number | null
          total_mensagens_imagem: number | null
          total_mensagens_texto: number | null
          total_mensagens_video: number | null
          ultima_mensagem_dt: string | null
        }
        Relationships: []
      }
      v_mensagens_completas: {
        Row: {
          conteudo_texto: string | null
          dt_create: string | null
          duracao_audio: number | null
          grupo_chat_id: string | null
          grupo_id: number | null
          grupo_nome: string | null
          id: number | null
          id_mensagem_respondida: number | null
          membro_id: number | null
          membro_nome: string | null
          membro_whatsapp: string | null
          mensagem_respondida_texto: string | null
          mensagem_respondida_tipo: string | null
          organizacao_id: number | null
          organizacao_nome: string | null
          tipo_mensagem: string | null
          url_midia: string | null
          whatsapp_message_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_whatsapp_id_mensagem_respondida_fkey"
            columns: ["id_mensagem_respondida"]
            isOneToOne: false
            referencedRelation: "mensagens_whatsapp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_whatsapp_id_mensagem_respondida_fkey"
            columns: ["id_mensagem_respondida"]
            isOneToOne: false
            referencedRelation: "v_mensagens_completas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      processar_mensagens_agendadas: { Args: never; Returns: undefined }
      usuario_tem_acesso_grupo: {
        Args: { p_id_grupo: number; p_id_usuario_sistema: number }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
