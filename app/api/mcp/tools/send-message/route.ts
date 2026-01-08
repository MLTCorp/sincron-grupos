import { NextRequest, NextResponse } from "next/server";
import { authenticateMcpRequest } from "@/lib/auth/mcp-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMessageSchema } from "@/lib/mcp/schemas";

export async function POST(request: NextRequest) {
  const auth = await authenticateMcpRequest(request);
  if (!auth.authenticated) return auth.errorResponse;

  try {
    const body = await request.json();
    const validated = sendMessageSchema.safeParse(body);

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

    const { number, text } = validated.data;
    const supabase = createAdminClient();

    // Buscar instância e token (status pode ser "connected" ou "conectado")
    const { data: instancia } = await supabase
      .from("instancias_whatsapp")
      .select("api_key")
      .eq("id_organizacao", auth.organizacaoId)
      .in("status", ["connected", "conectado"])
      .eq("ativo", true)
      .single();

    if (!instancia?.api_key) {
      return NextResponse.json(
        {
          success: false,
          error: "Instância não encontrada ou desconectada",
        },
        { status: 404 }
      );
    }

    // Enviar mensagem via UAZAPI
    const response = await fetch("https://mltcorp.uazapi.com/send/text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: instancia.api_key,
      },
      body: JSON.stringify({ number, text }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Erro ao enviar mensagem",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        messageId: result.messageid || result.messageId,
        status: "sent",
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
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
