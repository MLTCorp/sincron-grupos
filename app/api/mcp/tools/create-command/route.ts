import { NextRequest, NextResponse } from "next/server";
import { authenticateMcpRequest } from "@/lib/auth/mcp-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCommandSchema } from "@/lib/mcp/schemas";

export async function POST(request: NextRequest) {
  const auth = await authenticateMcpRequest(request);
  if (!auth.authenticated) return auth.errorResponse;

  try {
    const body = await request.json();
    const validated = createCommandSchema.safeParse(body);

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
    const { comando, descricao, resposta, ativo } = validated.data;

    // Criar comando como um gatilho especial
    const { data: gatilho, error } = await supabase
      .from("gatilhos")
      .insert({
        id_organizacao: auth.organizacaoId,
        nome: `Comando ${comando}`,
        descricao: descricao || `Comando de chatbot: ${comando}`,
        tipo_evento: "mensagem_texto",
        condicoes: {
          operador: "AND",
          regras: [
            {
              campo: "texto",
              operador: "igual",
              valor: comando,
            },
          ],
        },
        tipo_acao: "enviar_mensagem",
        config_acao: {
          tipo: "texto",
          mensagem: resposta,
          is_command: true,
          command: comando,
        },
        ativo,
        prioridade: 10, // Comandos têm alta prioridade
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating command:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao criar comando",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: gatilho.id,
        comando,
        descricao: descricao || gatilho.descricao,
        resposta,
        ativo,
      },
    });
  } catch (error) {
    console.error("Error creating command:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno",
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
