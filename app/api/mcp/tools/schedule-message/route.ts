import { NextRequest, NextResponse } from "next/server";
import { authenticateMcpRequest } from "@/lib/auth/mcp-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { scheduleMessageSchema } from "@/lib/mcp/schemas";

export async function POST(request: NextRequest) {
  const auth = await authenticateMcpRequest(request);
  if (!auth.authenticated) return auth.errorResponse;

  try {
    const body = await request.json();
    const validated = scheduleMessageSchema.safeParse(body);

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

    const {
      grupo_nome,
      grupos_ids,
      categoria_id,
      tipo_mensagem,
      conteudo_texto,
      url_midia,
      data,
      hora,
    } = validated.data;

    const supabase = createAdminClient();
    let finalGruposIds: number[] = [];

    // PRIORIDADE 1: Se grupos_ids fornecido, usar diretamente (já foi confirmado pelo usuário)
    if (grupos_ids && grupos_ids.length > 0) {
      // Validar que os grupos existem e pertencem à organização
      const { data: grupos, error: gruposError } = await supabase
        .from("grupos")
        .select("id, nome")
        .eq("id_organizacao", auth.organizacaoId)
        .in("id", grupos_ids);

      if (gruposError || !grupos) {
        return NextResponse.json(
          { success: false, error: "Erro ao validar grupos" },
          { status: 500 }
        );
      }

      if (grupos.length !== grupos_ids.length) {
        const idsEncontrados = grupos.map((g) => g.id);
        const idsNaoEncontrados = grupos_ids.filter(
          (id) => !idsEncontrados.includes(id)
        );
        return NextResponse.json(
          {
            success: false,
            error: `Grupos com IDs ${idsNaoEncontrados.join(", ")} não foram encontrados`,
          },
          { status: 404 }
        );
      }

      finalGruposIds = grupos_ids;
    } else if (grupo_nome) {
      // PRIORIDADE 2: Buscar grupos por nome
      const { data: grupos, error: gruposError } = await supabase
        .from("grupos")
        .select("id, nome")
        .eq("id_organizacao", auth.organizacaoId)
        .ilike("nome", `%${grupo_nome}%`);

      if (gruposError) {
        return NextResponse.json(
          { success: false, error: "Erro ao buscar grupos" },
          { status: 500 }
        );
      }

      if (!grupos || grupos.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Nenhum grupo encontrado com o nome "${grupo_nome}". Use list_groups para ver os grupos disponíveis.`,
          },
          { status: 404 }
        );
      }

      if (grupos.length > 1) {
        // Retorna lista de grupos encontrados para o agente escolher
        return NextResponse.json({
          success: false,
          error: `Encontrei ${grupos.length} grupos com "${grupo_nome}". Qual deles você quer?`,
          grupos_encontrados: grupos.map((g) => ({ id: g.id, nome: g.nome })),
          dica: "Responda com o ID do grupo desejado para eu continuar.",
        });
      }

      finalGruposIds = [grupos[0].id];
    } else if (categoria_id) {
      // PRIORIDADE 3: Buscar grupos da categoria
      // SEGURANÇA: Primeiro validar que a categoria pertence à organização
      const { data: categoriaValida, error: catValidError } = await supabase
        .from("categorias")
        .select("id")
        .eq("id_organizacao", auth.organizacaoId)
        .eq("id", categoria_id)
        .single();

      if (catValidError || !categoriaValida) {
        return NextResponse.json(
          {
            success: false,
            error: "Categoria não encontrada ou não pertence à organização",
          },
          { status: 404 }
        );
      }

      const { data: gruposCategorias, error: catError } = await supabase
        .from("grupos_categorias")
        .select("id_grupo")
        .eq("id_categoria", categoria_id);

      if (catError) {
        return NextResponse.json(
          { success: false, error: "Erro ao buscar grupos da categoria" },
          { status: 500 }
        );
      }

      if (!gruposCategorias || gruposCategorias.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Nenhum grupo encontrado nessa categoria",
          },
          { status: 404 }
        );
      }

      finalGruposIds = gruposCategorias.map((gc) => gc.id_grupo);
    } else {
      return NextResponse.json(
        {
          success: false,
          error:
            "Você precisa especificar o destino: grupo_nome, grupos_ids ou categoria_id",
        },
        { status: 400 }
      );
    }

    // Converter data + hora para timestamp ISO
    // Assumindo timezone de Brasília (UTC-3)
    const dtAgendamento = new Date(`${data}T${hora}:00-03:00`);

    // Calcular horário atual em São Paulo (UTC-3)
    const agora = new Date();
    const utcMs = agora.getTime() + agora.getTimezoneOffset() * 60 * 1000;
    const saoPauloOffset = -3 * 60 * 60 * 1000; // UTC-3 em ms
    const agoraSaoPaulo = new Date(utcMs + saoPauloOffset);

    const horaAtualSP = agoraSaoPaulo.getHours().toString().padStart(2, "0");
    const minutoAtualSP = agoraSaoPaulo.getMinutes().toString().padStart(2, "0");
    const horaAtualFormatada = `${horaAtualSP}:${minutoAtualSP}`;

    const dataAtualSP = agoraSaoPaulo.toISOString().split("T")[0];

    // Validar que a data é no futuro (com margem de 1 minuto)
    const margemMs = 60 * 1000; // 1 minuto de margem
    if (dtAgendamento.getTime() <= agora.getTime() - margemMs) {
      // Determinar o motivo específico do erro
      let explicacao = "";

      if (data < dataAtualSP) {
        explicacao = `A data ${data} já passou. Hoje é ${dataAtualSP}.`;
      } else if (data === dataAtualSP && hora <= horaAtualFormatada) {
        explicacao = `O horário ${hora} já passou. Agora são ${horaAtualFormatada} (horário de Brasília).`;
      } else {
        explicacao = `O momento ${data} às ${hora} já passou. Agora são ${horaAtualFormatada} do dia ${dataAtualSP}.`;
      }

      return NextResponse.json(
        {
          success: false,
          error: explicacao,
          detalhes: {
            horario_solicitado: `${data} ${hora}`,
            horario_atual: `${dataAtualSP} ${horaAtualFormatada}`,
            timezone: "America/Sao_Paulo (UTC-3)",
            sugestao: "Escolha um horário futuro para agendar a mensagem.",
          },
        },
        { status: 400 }
      );
    }

    // Validar mídia para tipos não-texto
    if (tipo_mensagem !== "texto" && !url_midia) {
      return NextResponse.json(
        {
          success: false,
          error: `Para mensagens do tipo "${tipo_mensagem}", você precisa fornecer url_midia`,
        },
        { status: 400 }
      );
    }

    // Buscar ID do usuário no sistema (se autenticado via sessão)
    let criadoPor: number | null = null;
    if (auth.userId) {
      const { data: usuario } = await supabase
        .from("usuarios_sistema")
        .select("id")
        .eq("auth_user_id", auth.userId)
        .single();
      criadoPor = usuario?.id || null;
    }

    // Inserir mensagem agendada
    const { data: mensagem, error: insertError } = await supabase
      .from("mensagens_programadas")
      .insert({
        id_organizacao: auth.organizacaoId,
        grupos_ids: finalGruposIds,
        categoria_id: categoria_id || null,
        tipo_mensagem,
        conteudo_texto,
        url_midia: url_midia || null,
        enviar_agora: false,
        dt_agendamento: dtAgendamento.toISOString(),
        status: "pendente",
        criado_por: criadoPor,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting scheduled message:", insertError);
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao agendar mensagem",
        },
        { status: 500 }
      );
    }

    // Buscar nomes dos grupos para a resposta
    const { data: gruposNomes } = await supabase
      .from("grupos")
      .select("nome")
      .in("id", finalGruposIds);

    return NextResponse.json({
      success: true,
      data: {
        id: mensagem.id,
        grupos: gruposNomes?.map((g) => g.nome) || [],
        quantidade_grupos: finalGruposIds.length,
        tipo_mensagem,
        conteudo_texto,
        agendado_para: dtAgendamento.toISOString(),
        agendado_para_formatado: dtAgendamento.toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          dateStyle: "full",
          timeStyle: "short",
        }),
        status: "pendente",
      },
    });
  } catch (error) {
    console.error("Error scheduling message:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno ao agendar mensagem",
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
