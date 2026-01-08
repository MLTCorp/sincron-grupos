import { NextRequest, NextResponse } from "next/server";
import { authenticateMcpRequest } from "@/lib/auth/mcp-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { listGroupsSchema } from "@/lib/mcp/schemas";

export async function POST(request: NextRequest) {
  const auth = await authenticateMcpRequest(request);
  if (!auth.authenticated) return auth.errorResponse;

  try {
    const body = await request.json().catch(() => ({}));
    const validated = listGroupsSchema.safeParse(body);

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

    const { limit, offset } = validated.data;
    const supabase = createAdminClient();

    const {
      data: grupos,
      error,
      count,
    } = await supabase
      .from("grupos")
      .select("*", { count: "exact" })
      .eq("id_organizacao", auth.organizacaoId)
      .range(offset, offset + limit - 1)
      .order("nome", { ascending: true });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao listar grupos",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        grupos: grupos || [],
        total: count || 0,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Error listing groups:", error);
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
