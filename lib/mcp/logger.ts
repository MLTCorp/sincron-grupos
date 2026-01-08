/**
 * Sistema de Logging para MCP Tools
 * Facilita debug, auditoria e detecção de erros
 */

export interface McpLogEntry {
  timestamp: string;
  tool: string;
  url: string;
  args: Record<string, unknown>;
  result: { success: boolean; error?: string; data?: unknown };
  durationMs: number;
  context: { userId: string; organizacaoId: number };
}

/**
 * Log de execução de tool MCP
 * Exibe informações formatadas no console do servidor
 */
export function logMcpExecution(entry: McpLogEntry): void {
  const emoji = entry.result.success ? "\u2705" : "\u274C";
  const timestamp = new Date().toISOString();

  // Log básico sempre
  console.log(
    `[MCP ${emoji}] ${entry.tool} - ${entry.durationMs}ms - ${entry.url}`
  );

  // Se erro, log detalhado
  if (!entry.result.success) {
    console.error(`[MCP ERROR] Tool: ${entry.tool}`);
    console.error(`[MCP ERROR] URL: ${entry.url}`);
    console.error(`[MCP ERROR] Error: ${entry.result.error}`);
    console.error(`[MCP ERROR] Args:`, JSON.stringify(entry.args, null, 2));
    console.error(
      `[MCP ERROR] Context: userId=${entry.context.userId}, orgId=${entry.context.organizacaoId}`
    );
    console.error(`[MCP ERROR] Timestamp: ${timestamp}`);
  }
}

/**
 * Log de início de execução (para debug)
 */
export function logMcpStart(
  tool: string,
  url: string,
  args: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[MCP START] ${tool}`);
    console.log(`[MCP START] URL: ${url}`);
    console.log(`[MCP START] Args:`, JSON.stringify(args, null, 2));
  }
}

/**
 * Formata erro para exibição amigável
 */
export function formatMcpError(error: unknown): string {
  if (error instanceof Error) {
    // Tratar erros comuns com mensagens amigáveis
    if (error.message.includes("ERR_SSL_PACKET_LENGTH_TOO_LONG")) {
      return "Erro de SSL: Tentativa de conexão HTTPS em servidor HTTP. Verifique baseUrl.";
    }
    if (error.message.includes("ECONNREFUSED")) {
      return "Servidor não disponível. Verifique se o serviço está rodando.";
    }
    if (error.message.includes("fetch failed")) {
      const cause = (error as Error & { cause?: Error }).cause;
      if (cause) {
        return `Fetch falhou: ${cause.message}`;
      }
      return "Falha na requisição. Verifique a URL e conectividade.";
    }
    return error.message;
  }
  return String(error);
}
