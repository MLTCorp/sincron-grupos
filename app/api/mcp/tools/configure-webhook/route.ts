import { NextRequest, NextResponse } from "next/server";
import { authenticateMcpRequest } from "@/lib/auth/mcp-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { configureWebhookSchema } from "@/lib/mcp/schemas";

export async function POST(request: NextRequest) {
  const auth = await authenticateMcpRequest(request);
  if (!auth.authenticated) return auth.errorResponse;

  try {
    const body = await request.json();
    const validated = configureWebhookSchema.safeParse(body);

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

    const { url, events, enabled } = validated.data;
    const supabase = createAdminClient();

    // Buscar instância (status pode ser "connected" ou "conectado")
    const { data: instancia } = await supabase
      .from("instancias_whatsapp")
      .select("id, api_key")
      .eq("id_organizacao", auth.organizacaoId)
      .in("status", ["connected", "conectado"])
      .eq("ativo", true)
      .single();

    if (!instancia?.api_key) {
      return NextResponse.json(
        {
          success: false,
          error: "Instância não encontrada",
        },
        { status: 404 }
      );
    }

    // Configurar webhook via UAZAPI
    const response = await fetch("https://mltcorp.uazapi.com/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: instancia.api_key,
      },
      body: JSON.stringify({
        enabled,
        url,
        events,
        excludeMessages: ["wasSentByApi"],
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Erro ao configurar webhook",
        },
        { status: response.status }
      );
    }

    // Atualizar URL no banco
    // SEGURANÇA: Dupla validação com id_organizacao
    await supabase
      .from("instancias_whatsapp")
      .update({
        webhook_url: url,
        api_url: url,
        dt_update: new Date().toISOString(),
      })
      .eq("id", instancia.id)
      .eq("id_organizacao", auth.organizacaoId);

    return NextResponse.json({
      success: true,
      data: {
        url,
        events,
        enabled,
      },
    });
  } catch (error) {
    console.error("Error configuring webhook:", error);
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
