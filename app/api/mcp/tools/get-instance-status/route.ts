import { NextRequest, NextResponse } from "next/server";
import { authenticateMcpRequest } from "@/lib/auth/mcp-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  // 1. Autenticar
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

    // Buscar instância da organização
    const { data: instancia, error } = await supabase
      .from("instancias_whatsapp")
      .select("*")
      .eq("id_organizacao", auth.organizacaoId)
      .single();

    if (error || !instancia) {
      return NextResponse.json({
        success: false,
        error: "Instância não encontrada",
      });
    }

    // Chamar UAZAPI para status atual
    let statusUazapi = null;
    if (instancia.api_key) {
      try {
        const statusResponse = await fetch(
          `https://mltcorp.uazapi.com/instance/status`,
          {
            method: "GET",
            headers: {
              token: instancia.api_key,
            },
          }
        );
        statusUazapi = await statusResponse.json();
      } catch (err) {
        console.error("Error fetching UAZAPI status:", err);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        nome: instancia.nome_instancia,
        numero: instancia.numero_telefone,
        status: statusUazapi?.state || instancia.status,
        conectado:
          statusUazapi?.state === "connected" ||
          instancia.status === "connected" ||
          instancia.status === "conectado",
        profile_name: instancia.profile_name,
        profile_pic_url: instancia.profile_pic_url,
        is_business: instancia.is_business,
        ultima_conexao: instancia.dt_update,
      },
    });
  } catch (error) {
    console.error("Error getting instance status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao obter status da instância",
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
