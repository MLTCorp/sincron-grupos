import { MCP_TOOLS } from "./tools";
import { logMcpExecution, logMcpStart, formatMcpError } from "./logger";

export interface ToolExecutionContext {
  userId: string;
  organizacaoId: number;
  baseUrl: string;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Retorna as tools no formato OpenAI para function calling
 */
export function getOpenAITools(): OpenAI.Chat.ChatCompletionTool[] {
  return MCP_TOOLS.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));
}

/**
 * Executa uma tool MCP chamando o endpoint correspondente
 */
export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolResult> {
  // Converter nome da tool para endpoint (snake_case -> kebab-case)
  const endpoint = toolName.replace(/_/g, "-");
  const url = `${context.baseUrl}/api/mcp/tools/${endpoint}`;

  // Logging de início
  logMcpStart(toolName, url, args);
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Passar contexto de autenticação internamente
        "x-internal-user-id": context.userId,
        "x-internal-org-id": context.organizacaoId.toString(),
      },
      body: JSON.stringify(args),
    });

    const result = await response.json();
    const durationMs = Date.now() - startTime;

    if (!response.ok) {
      const toolResult: ToolResult = {
        success: false,
        error: result.error || `HTTP ${response.status}`,
      };

      // Log de erro
      logMcpExecution({
        timestamp: new Date().toISOString(),
        tool: toolName,
        url,
        args,
        result: toolResult,
        durationMs,
        context: { userId: context.userId, organizacaoId: context.organizacaoId },
      });

      return toolResult;
    }

    const toolResult: ToolResult = {
      success: result.success ?? true,
      data: result.data ?? result,
      error: result.error,
    };

    // Log de sucesso
    logMcpExecution({
      timestamp: new Date().toISOString(),
      tool: toolName,
      url,
      args,
      result: toolResult,
      durationMs,
      context: { userId: context.userId, organizacaoId: context.organizacaoId },
    });

    return toolResult;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = formatMcpError(error);

    const toolResult: ToolResult = {
      success: false,
      error: errorMessage,
    };

    // Log de erro de exceção
    logMcpExecution({
      timestamp: new Date().toISOString(),
      tool: toolName,
      url,
      args,
      result: toolResult,
      durationMs,
      context: { userId: context.userId, organizacaoId: context.organizacaoId },
    });

    return toolResult;
  }
}

// Type import for OpenAI
import type OpenAI from "openai";
