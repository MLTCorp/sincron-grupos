import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createApiKey, listApiKeys, revokeApiKey } from "@/lib/auth/api-key";

// GET - Listar API keys do usuário
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Buscar organização do usuário
    const { data: usuario } = await supabase
      .from("usuarios_sistema")
      .select("id_organizacao")
      .eq("auth_user_id", user.id)
      .single();

    const result = await listApiKeys(user.id, usuario?.id_organizacao);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ keys: result.keys });
  } catch (error) {
    console.error("Error listing API keys:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST - Criar nova API key
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Buscar organização do usuário
    const { data: usuario } = await supabase
      .from("usuarios_sistema")
      .select("id_organizacao")
      .eq("auth_user_id", user.id)
      .single();

    if (!usuario?.id_organizacao) {
      return NextResponse.json({ error: "Usuário sem organização" }, { status: 400 });
    }

    const body = await request.json();
    const { name } = body;

    const result = await createApiKey(user.id, usuario.id_organizacao, name);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      apiKey: result.apiKey, // Só retorna a key completa aqui
      keyId: result.keyId,
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE - Revogar API key
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get("keyId");

    if (!keyId) {
      return NextResponse.json({ error: "keyId é obrigatório" }, { status: 400 });
    }

    const result = await revokeApiKey(user.id, keyId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking API key:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
