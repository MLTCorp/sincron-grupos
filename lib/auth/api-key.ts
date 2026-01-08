import { createAdminClient } from "@/lib/supabase/admin";
import { createHash, randomBytes } from "crypto";

/**
 * Gera uma nova API Key
 * Formato: sg_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 */
export function generateApiKey(): string {
  const prefix = "sg_live_";
  const randomPart = randomBytes(32).toString("hex"); // 64 caracteres hex
  return `${prefix}${randomPart}`;
}

/**
 * Cria hash SHA-256 da API key para armazenamento seguro
 */
export function hashApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

/**
 * Extrai prefixo e sufixo da API key para exibição
 * Ex: "sg_live_abc123...xyz789"
 */
export function getKeyDisplay(apiKey: string): { prefix: string; suffix: string } {
  return {
    prefix: apiKey.substring(0, 12), // "sg_live_xxxx"
    suffix: apiKey.substring(apiKey.length - 4), // últimos 4 caracteres
  };
}

/**
 * Valida uma API Key e retorna o userId e organizacaoId associados
 */
export async function validateApiKey(
  apiKey: string
): Promise<{
  valid: boolean;
  userId?: string;
  organizacaoId?: number;
  keyId?: string;
  error?: string;
}> {
  try {
    const supabase = createAdminClient();
    const keyHash = hashApiKey(apiKey);

    // Busca a key pelo hash
    const { data, error } = await supabase
      .from("api_keys")
      .select("id, user_id, id_organizacao, is_active, usage_count")
      .eq("key_hash", keyHash)
      .single();

    if (error || !data) {
      return {
        valid: false,
        error: "API key inválida",
      };
    }

    if (!data.is_active) {
      return {
        valid: false,
        error: "API key revogada",
      };
    }

    // Atualiza last_used_at e usage_count
    await supabase
      .from("api_keys")
      .update({
        last_used_at: new Date().toISOString(),
        usage_count: (data.usage_count || 0) + 1,
      })
      .eq("id", data.id);

    return {
      valid: true,
      userId: data.user_id,
      organizacaoId: data.id_organizacao,
      keyId: data.id,
    };
  } catch (err) {
    console.error("Error validating API key:", err);
    return {
      valid: false,
      error: "Erro ao validar API key",
    };
  }
}

/**
 * Cria uma nova API Key para um usuário
 */
export async function createApiKey(
  userId: string,
  organizacaoId: number,
  name?: string
): Promise<{ success: boolean; apiKey?: string; keyId?: string; error?: string }> {
  try {
    const supabase = createAdminClient();

    // Gera a key
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);
    const { prefix, suffix } = getKeyDisplay(apiKey);

    // Revoga keys anteriores do usuário nesta organização
    await supabase
      .from("api_keys")
      .update({ is_active: false, revoked_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("id_organizacao", organizacaoId)
      .eq("is_active", true);

    // Insere a nova key
    const { data, error } = await supabase
      .from("api_keys")
      .insert({
        user_id: userId,
        id_organizacao: organizacaoId,
        key_hash: keyHash,
        key_prefix: prefix,
        key_suffix: suffix,
        name: name || "API Key",
        is_active: true,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Error creating API key:", error);
      return {
        success: false,
        error: "Erro ao criar API key",
      };
    }

    return {
      success: true,
      apiKey, // Retorna a key completa APENAS neste momento
      keyId: data.id,
    };
  } catch (err) {
    console.error("Error creating API key:", err);
    return {
      success: false,
      error: "Erro ao criar API key",
    };
  }
}

/**
 * Revoga uma API Key
 */
export async function revokeApiKey(
  userId: string,
  keyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("api_keys")
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq("id", keyId)
      .eq("user_id", userId);

    if (error) {
      return {
        success: false,
        error: "Erro ao revogar API key",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Error revoking API key:", err);
    return {
      success: false,
      error: "Erro ao revogar API key",
    };
  }
}

/**
 * Lista API Keys do usuário (sem expor o hash)
 */
export async function listApiKeys(userId: string, organizacaoId?: number) {
  try {
    const supabase = createAdminClient();

    let query = supabase
      .from("api_keys")
      .select(
        "id, key_prefix, key_suffix, name, is_active, created_at, last_used_at, usage_count, id_organizacao"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (organizacaoId) {
      query = query.eq("id_organizacao", organizacaoId);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: "Erro ao listar API keys" };
    }

    return { success: true, keys: data || [] };
  } catch (err) {
    console.error("Error listing API keys:", err);
    return { success: false, error: "Erro ao listar API keys" };
  }
}
