import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateApiKey } from "./api-key";

export interface McpAuthResult {
  authenticated: boolean;
  userId?: string;
  organizacaoId?: number;
  error?: string;
  errorResponse?: NextResponse;
}

/**
 * Autentica uma requisição MCP.
 * Aceita autenticação via:
 * - Headers internos (x-internal-user-id e x-internal-org-id) - para chamadas server-to-server
 * - Header x-api-key (API key gerada no painel)
 * - Sessão Supabase (para chamadas do frontend)
 */
export async function authenticateMcpRequest(
  request: NextRequest
): Promise<McpAuthResult> {
  // 0. Tentar autenticação interna (server-to-server)
  const internalUserId = request.headers.get("x-internal-user-id");
  const internalOrgId = request.headers.get("x-internal-org-id");

  if (internalUserId && internalOrgId) {
    // Chamada interna do executor - confiar nos headers
    return {
      authenticated: true,
      userId: internalUserId,
      organizacaoId: parseInt(internalOrgId, 10),
    };
  }

  const apiKey = request.headers.get("x-api-key");

  // 1. Tentar autenticação por API Key
  if (apiKey) {
    const validation = await validateApiKey(apiKey);
    if (!validation.valid || !validation.userId) {
      return {
        authenticated: false,
        error: validation.error || "API key inválida",
        errorResponse: NextResponse.json(
          { error: validation.error || "API key inválida" },
          { status: 401 }
        ),
      };
    }
    return {
      authenticated: true,
      userId: validation.userId,
      organizacaoId: validation.organizacaoId,
    };
  }

  // 2. Fallback: Sessão Supabase
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Buscar organização do usuário
      const { data: usuario } = await supabase
        .from("usuarios_sistema")
        .select("id_organizacao")
        .eq("auth_user_id", user.id)
        .single();

      return {
        authenticated: true,
        userId: user.id,
        organizacaoId: usuario?.id_organizacao,
      };
    }
  } catch (err) {
    console.error("Supabase auth error:", err);
  }

  return {
    authenticated: false,
    error: "Unauthorized. Forneça uma API key via header x-api-key ou faça login.",
    errorResponse: NextResponse.json(
      {
        error: "Unauthorized. Forneça uma API key via header x-api-key ou faça login.",
        hint: "Gere uma API key em /settings",
      },
      { status: 401 }
    ),
  };
}
