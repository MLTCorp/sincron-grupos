import { NextResponse } from "next/server";
import { MCP_TOOLS } from "@/lib/mcp/tools";
import type { McpDiscoveryResponse } from "@/lib/mcp/types";

// GET /api/mcp - Discovery endpoint
export async function GET() {
  const response: McpDiscoveryResponse = {
    name: "sincron-grupos",
    version: "1.0.0",
    description: "MCP Server para gerenciamento de grupos WhatsApp do Sincron Grupos",
    tools: MCP_TOOLS,
    authentication: {
      type: "api-key",
      header: "x-api-key",
      description: "Gere uma API key em /settings para autenticar requisições",
    },
  };

  return NextResponse.json(response);
}

// OPTIONS - CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
  });
}
