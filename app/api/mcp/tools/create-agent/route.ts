import { NextRequest, NextResponse } from "next/server";
import { authenticateMcpRequest } from "@/lib/auth/mcp-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAgentSchema } from "@/lib/mcp/schemas";

export async function POST(request: NextRequest) {
  const auth = await authenticateMcpRequest(request);
  if (!auth.authenticated) return auth.errorResponse;

  try {
    const body = await request.json();
    const validated = createAgentSchema.safeParse(body);

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
    const { nome, prompt_sistema, modelo, temperatura, ativo } = validated.data;

    const { data: agente, error } = await supabase
      .from("agentes_ia")
      .insert({
        id_organizacao: auth.organizacaoId,
        nome,
        prompt_sistema,
        modelo,
        temperatura,
        ativo,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating agent:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao criar agente",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: agente,
    });
  } catch (error) {
    console.error("Error creating agent:", error);
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
