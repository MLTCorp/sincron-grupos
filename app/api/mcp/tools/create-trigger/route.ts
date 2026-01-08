import { NextRequest, NextResponse } from "next/server";
import { authenticateMcpRequest } from "@/lib/auth/mcp-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createTriggerSchema } from "@/lib/mcp/schemas";

export async function POST(request: NextRequest) {
  const auth = await authenticateMcpRequest(request);
  if (!auth.authenticated) return auth.errorResponse;

  try {
    const body = await request.json();
    const validated = createTriggerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: validated.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    if (!auth.organizacaoId) {
      return NextResponse.json(
        { success: false, error: "Organização não encontrada" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const {
      nome,
      descricao,
      escopo,
      id_categoria,
      id_grupo,
      tipo_evento,
      condicoes,
      tipo_acao,
      config_acao,
      palavras_chave,
      resposta,
      tipo_resposta,
      ativo,
      prioridade,
    } = validated.data;

    // Validar que escopo='categoria' requer categoria válida da organização
    if (escopo === "categoria" && id_categoria) {
      const { data: categoriaValida, error: catError } = await supabase
        .from("categorias")
        .select("id")
        .eq("id_organizacao", auth.organizacaoId)
        .eq("id", id_categoria)
        .single();

      if (catError || !categoriaValida) {
        return NextResponse.json(
          {
            success: false,
            error: "Categoria não encontrada ou não pertence à organização. Use list_categories para ver as categorias disponíveis.",
          },
          { status: 404 }
        );
      }
    }

    // Validar que escopo='grupo' requer grupo válido da organização
    if (escopo === "grupo" && id_grupo) {
      const { data: grupoValido, error: grupoError } = await supabase
        .from("grupos")
        .select("id")
        .eq("id_organizacao", auth.organizacaoId)
        .eq("id", id_grupo)
        .single();

      if (grupoError || !grupoValido) {
        return NextResponse.json(
          {
            success: false,
            error: "Grupo não encontrado ou não pertence à organização. Use list_groups para ver os grupos disponíveis.",
          },
          { status: 404 }
        );
      }
    }

    // Determinar modo: simples (palavras_chave + resposta) ou avançado (condicoes + config_acao)
    const modoSimples = palavras_chave && palavras_chave.length > 0;

    // Construir condições
    let finalCondicoes;
    if (modoSimples) {
      // Modo simples: gerar condições a partir de palavras_chave
      finalCondicoes = {
        operador: "OR",
        regras: palavras_chave.map((palavra) => ({
          campo: "texto",
          operador: "contem",
          valor: palavra,
        })),
      };
    } else if (condicoes) {
      // Modo avançado: usar condições fornecidas
      finalCondicoes = condicoes;
    }

    // Construir config_acao
    let finalConfigAcao;
    if (modoSimples && resposta) {
      // Modo simples: gerar config_acao a partir de resposta
      finalConfigAcao = {
        tipo_envio: "nova",
        destino: "mesmo_grupo",
        tipo: tipo_resposta || "texto",
        mensagem: resposta,
      };
    } else if (config_acao) {
      // Modo avançado: usar config_acao fornecido
      finalConfigAcao = config_acao;
    }

    // Gerar descrição se não fornecida
    let finalDescricao = descricao;
    if (!finalDescricao && modoSimples && palavras_chave) {
      finalDescricao = `Responde automaticamente quando detecta: ${palavras_chave.join(", ")}`;
    }

    // Criar gatilho no banco
    // Nota: A coluna 'escopo' NÃO existe no banco - usamos id_categoria/id_grupo para determinar
    const { data: gatilho, error } = await supabase
      .from("gatilhos")
      .insert({
        id_organizacao: auth.organizacaoId,
        nome,
        descricao: finalDescricao,
        // Escopo é inferido: se id_categoria → categoria, se id_grupo → grupo, senão → todos
        id_categoria: escopo === "categoria" ? id_categoria : null,
        id_grupo: escopo === "grupo" ? id_grupo : null,
        // Evento
        tipo_evento: tipo_evento || "mensagem_texto",
        // Condições
        condicoes: finalCondicoes,
        // Ação
        tipo_acao: tipo_acao || "enviar_mensagem",
        config_acao: finalConfigAcao,
        // Outros
        ativo: ativo ?? true,
        prioridade: prioridade ?? 100,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating trigger:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao criar gatilho: " + error.message,
        },
        { status: 500 }
      );
    }

    // Buscar nome da categoria/grupo para resposta mais informativa
    let escopoInfo = "todos os grupos";
    if (escopo === "categoria" && id_categoria) {
      const { data: cat } = await supabase
        .from("categorias")
        .select("nome")
        .eq("id", id_categoria)
        .single();
      escopoInfo = `categoria "${cat?.nome || id_categoria}"`;
    } else if (escopo === "grupo" && id_grupo) {
      const { data: grp } = await supabase
        .from("grupos")
        .select("nome")
        .eq("id", id_grupo)
        .single();
      escopoInfo = `grupo "${grp?.nome || id_grupo}"`;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: gatilho.id,
        nome: gatilho.nome,
        escopo: escopoInfo,
        tipo_evento: gatilho.tipo_evento,
        tipo_acao: gatilho.tipo_acao,
        ativo: gatilho.ativo,
        prioridade: gatilho.prioridade,
        modo: modoSimples ? "simples" : "avançado",
      },
      mensagem: `Gatilho "${nome}" criado com sucesso para ${escopoInfo}`,
    });
  } catch (error) {
    console.error("Error creating trigger:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno ao criar gatilho",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
  });
}
