export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface McpToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface McpDiscoveryResponse {
  name: string;
  version: string;
  description: string;
  tools: McpTool[];
  authentication: {
    type: string;
    header: string;
    description: string;
  };
}

// Chat Agent Types
export interface AgentMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  toolResult?: ToolResultInfo;
}

export interface ToolCallInfo {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResultInfo {
  toolCallId: string;
  name: string;
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}
