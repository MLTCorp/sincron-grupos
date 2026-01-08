import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenRouter, DEFAULT_MODEL } from "@/lib/openrouter/client";
import { getFullSystemPrompt, WELCOME_MESSAGE } from "@/lib/chat/agent-prompt";
import { getOpenAITools, executeTool } from "@/lib/mcp/executor";
import { chatAgentRequestSchema } from "@/lib/mcp/schemas";
import type { AgentMessage, ToolCallInfo, ToolResultInfo } from "@/lib/mcp/types";
import type { Json } from "@/types/supabase";

/**
 * Chat Agent API - Sincron Grupos
 * POST /api/chat/agent
 *
 * Conversa com o agente usando GPT-4.1 mini com function calling
 */
export async function POST(request: NextRequest) {
  try {
    // Auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Get user's organization
    const { data: usuario } = await supabase
      .from("usuarios_sistema")
      .select("id_organizacao")
      .eq("auth_user_id", user.id)
      .single();

    if (!usuario?.id_organizacao) {
      return NextResponse.json(
        { error: "Usuário sem organização" },
        { status: 400 }
      );
    }

    // Parse request
    const body = await request.json();
    const validated = chatAgentRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: validated.error.issues
            .map((e: { message: string }) => e.message)
            .join(", "),
        },
        { status: 400 }
      );
    }

    const { message, sessionId } = validated.data;

    // Get or create session
    let chatSession: {
      id: string;
      messages: AgentMessage[];
      tool_calls: ToolCallInfo[];
    };

    if (sessionId) {
      // Load existing session
      const { data: existing } = await supabase
        .from("agent_chats")
        .select("id, messages, tool_calls")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        chatSession = {
          id: existing.id,
          messages: (existing.messages as unknown as AgentMessage[]) || [],
          tool_calls: (existing.tool_calls as unknown as ToolCallInfo[]) || [],
        };
      } else {
        // Session not found, create new
        const { data: newSession } = await supabase
          .from("agent_chats")
          .insert({
            user_id: user.id,
            id_organizacao: usuario.id_organizacao,
            messages: [],
            tool_calls: [],
          })
          .select("id")
          .single();

        chatSession = {
          id: newSession?.id || crypto.randomUUID(),
          messages: [],
          tool_calls: [],
        };
      }
    } else {
      // Create new session with welcome message
      const { data: newSession } = await supabase
        .from("agent_chats")
        .insert({
          user_id: user.id,
          id_organizacao: usuario.id_organizacao,
          messages: [
            {
              role: "assistant",
              content: WELCOME_MESSAGE,
              timestamp: new Date().toISOString(),
            },
          ],
          tool_calls: [],
        })
        .select("id")
        .single();

      chatSession = {
        id: newSession?.id || crypto.randomUUID(),
        messages: [
          {
            role: "assistant",
            content: WELCOME_MESSAGE,
            timestamp: new Date().toISOString(),
          },
        ],
        tool_calls: [],
      };
    }

    // Add user message
    const userMessage: AgentMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };
    chatSession.messages.push(userMessage);

    // Prepare messages for OpenRouter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const openrouterMessages: any[] = [
      { role: "system", content: getFullSystemPrompt() },
      ...chatSession.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    // Get base URL for tool execution
    // Detectar corretamente o protocolo para evitar erro SSL em localhost
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto");

    let baseUrl: string;
    if (forwardedHost) {
      // Produção - usar x-forwarded headers
      const proto = forwardedProto || "https";
      baseUrl = `${proto}://${forwardedHost}`;
    } else {
      // Desenvolvimento - forçar http para localhost
      const host = request.nextUrl.host;
      const isLocalhost =
        host.includes("localhost") || host.includes("127.0.0.1");
      const proto = isLocalhost
        ? "http"
        : request.nextUrl.protocol.replace(":", "");
      baseUrl = `${proto}://${host}`;
    }

    // Call OpenRouter with tools
    const openrouter = getOpenRouter();
    const tools = getOpenAITools();

    let completion = await openrouter.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: openrouterMessages,
      tools,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 4000,
    });

    let assistantMessage = completion.choices[0]?.message;
    const toolResults: ToolResultInfo[] = [];

    // Handle tool calls if any
    while (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolCalls = assistantMessage.tool_calls;

      for (const toolCall of toolCalls) {
        // Type assertion for OpenRouter tool call structure
        const tc = toolCall as {
          id: string;
          function: { name: string; arguments: string };
        };
        const toolName = tc.function.name;
        let toolArgs: Record<string, unknown>;

        try {
          toolArgs = JSON.parse(tc.function.arguments);
        } catch {
          toolArgs = {};
        }

        // Record tool call
        const toolCallInfo: ToolCallInfo = {
          id: tc.id,
          name: toolName,
          arguments: toolArgs,
        };
        chatSession.tool_calls.push(toolCallInfo);

        // Execute tool
        const result = await executeTool(toolName, toolArgs, {
          userId: user.id,
          organizacaoId: usuario.id_organizacao,
          baseUrl,
        });

        // Record result
        const toolResult: ToolResultInfo = {
          toolCallId: tc.id,
          name: toolName,
          success: result.success,
          data:
            typeof result.data === "object" && result.data !== null
              ? (result.data as Record<string, unknown>)
              : {},
          error: result.error,
        };
        toolResults.push(toolResult);

        // Add tool result to messages for next iteration
        openrouterMessages.push({
          role: "assistant",
          content: "",
          tool_calls: [toolCall],
        });
        openrouterMessages.push({
          role: "tool",
          content: JSON.stringify(result),
          tool_call_id: tc.id,
        });
      }

      // Continue conversation with tool results
      completion = await openrouter.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: openrouterMessages,
        tools,
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 4000,
      });

      assistantMessage = completion.choices[0]?.message;
    }

    // Get final response
    const finalContent =
      assistantMessage?.content ||
      "Desculpe, nao consegui processar sua solicitacao.";

    // Add assistant message to history
    const assistantResponse: AgentMessage = {
      role: "assistant",
      content: finalContent,
      timestamp: new Date().toISOString(),
      toolResult:
        toolResults.length > 0 ? toolResults[toolResults.length - 1] : undefined,
    };
    chatSession.messages.push(assistantResponse);

    // Update session in database
    await supabase
      .from("agent_chats")
      .update({
        messages: chatSession.messages as unknown as Json,
        tool_calls: chatSession.tool_calls as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq("id", chatSession.id);

    // Return response
    return NextResponse.json({
      success: true,
      message: finalContent,
      sessionId: chatSession.id,
      toolCalls:
        toolResults.length > 0
          ? chatSession.tool_calls.slice(-toolResults.length)
          : undefined,
      toolResults: toolResults.length > 0 ? toolResults : undefined,
    });
  } catch (error) {
    console.error("Chat agent error:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao processar mensagem" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve chat history
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const sessionId = request.nextUrl.searchParams.get("sessionId");

    if (sessionId) {
      // Get specific session
      const { data: session } = await supabase
        .from("agent_chats")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .single();

      if (!session) {
        return NextResponse.json(
          { error: "Sessão não encontrada" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, session });
    } else {
      // Get all sessions
      const { data: sessions } = await supabase
        .from("agent_chats")
        .select("id, title, messages, created_at, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(20);

      return NextResponse.json({ success: true, sessions: sessions || [] });
    }
  } catch (error) {
    console.error("Get chat history error:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao buscar histórico" },
      { status: 500 }
    );
  }
}

/**
 * DELETE endpoint to delete a chat session
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const sessionId = request.nextUrl.searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId obrigatório" },
        { status: 400 }
      );
    }

    await supabase
      .from("agent_chats")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete chat error:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao deletar chat" },
      { status: 500 }
    );
  }
}

/**
 * PATCH endpoint to rename a chat session
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, title } = body;

    if (!sessionId || typeof title !== "string") {
      return NextResponse.json(
        { error: "sessionId e title obrigatórios" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("agent_chats")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", sessionId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { success: false, error: "Falha ao atualizar sessão" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Rename chat error:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao renomear chat" },
      { status: 500 }
    );
  }
}
