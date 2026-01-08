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

    // Buscar instância da organização (status pode ser "connected" ou "conectado")
    const { data: instancia, error: instanciaError } = await supabase
      .from("instancias_whatsapp")
      .select("id, api_key")
      .eq("id_organizacao", auth.organizacaoId)
      .in("status", ["connected", "conectado"])
      .eq("ativo", true)
      .single();

    if (instanciaError || !instancia?.api_key) {
      return NextResponse.json({
        success: false,
        error: "Instância não encontrada ou desconectada",
      });
    }

    // Buscar grupos do WhatsApp via UAZAPI
    const groupsResponse = await fetch("https://mltcorp.uazapi.com/group/all", {
      method: "GET",
      headers: {
        token: instancia.api_key,
      },
    });

    if (!groupsResponse.ok) {
      return NextResponse.json({
        success: false,
        error: "Erro ao buscar grupos do WhatsApp",
      });
    }

    const groupsData = await groupsResponse.json();
    const groups = Array.isArray(groupsData) ? groupsData : groupsData.data || [];

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const group of groups) {
      const chatId = group.id || group.chatid || group.jid;
      const nome = group.name || group.subject || "Grupo sem nome";
      const fotoUrl = group.profilePicUrl || group.profile_pic_url || null;

      if (!chatId) {
        skipped++;
        continue;
      }

      // Verificar se grupo já existe
      const { data: existingGroup } = await supabase
        .from("grupos")
        .select("id")
        .eq("chat_id_whatsapp", chatId)
        .eq("id_organizacao", auth.organizacaoId)
        .single();

      if (existingGroup) {
        // Atualizar grupo existente
        // SEGURANÇA: Dupla validação com id_organizacao
        await supabase
          .from("grupos")
          .update({
            nome,
            foto_url: fotoUrl,
            id_instancia: instancia.id,
            dt_update: new Date().toISOString(),
          })
          .eq("id", existingGroup.id)
          .eq("id_organizacao", auth.organizacaoId);
        updated++;
      } else {
        // Criar novo grupo
        await supabase.from("grupos").insert({
          id_organizacao: auth.organizacaoId,
          id_instancia: instancia.id,
          chat_id_whatsapp: chatId,
          nome,
          foto_url: fotoUrl,
          ativo: true,
        });
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total_whatsapp: groups.length,
        created,
        updated,
        skipped,
      },
    });
  } catch (error) {
    console.error("Error syncing groups:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao sincronizar grupos",
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
