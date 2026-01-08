import { NextRequest, NextResponse } from "next/server";
import { authenticateMcpRequest } from "@/lib/auth/mcp-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const auth = await authenticateMcpRequest(request);
  if (!auth.authenticated) return auth.errorResponse;

  try {
    if (!auth.organizacaoId) {
      return NextResponse.json(
        { success: false, error: "Organização não encontrada" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const orgId = auth.organizacaoId;

    // Buscar categorias com contagem de grupos via SQL direto
    // Isso evita problemas de RLS na tabela grupos_categorias
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: categoriasComContagem, error } = await (supabase.rpc as any)(
      "get_categories_with_group_count",
      { org_id: orgId }
    ) as { data: Array<{ id: number; nome: string; descricao: string | null; cor: string | null; quantidade_grupos: number }> | null; error: Error | null };

    if (error) {
      console.error("Error fetching categories with RPC:", error);

      // Fallback: buscar categorias sem contagem se a função não existir
      const { data: categorias, error: catError } = await supabase
        .from("categorias")
        .select("id, nome, descricao, cor")
        .eq("id_organizacao", auth.organizacaoId)
        .order("nome", { ascending: true });

      if (catError) {
        return NextResponse.json(
          {
            success: false,
            error: "Erro ao listar categorias",
          },
          { status: 500 }
        );
      }

      // Tentar contagem direta com query alternativa
      const categoriasComCount = await Promise.all(
        (categorias || []).map(async (cat) => {
          // Usar query com filtro explícito de organização via JOIN com grupos
          const { data: grupos } = await supabase
            .from("grupos_categorias")
            .select("id_grupo, grupos!inner(id_organizacao)")
            .eq("id_categoria", cat.id)
            .eq("grupos.id_organizacao", orgId);

          return {
            ...cat,
            quantidade_grupos: grupos?.length || 0,
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: {
          categorias: categoriasComCount,
          total: categoriasComCount.length,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        categorias: categoriasComContagem || [],
        total: categoriasComContagem?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error listing categories:", error);
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
