import 'dotenv/config';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { getDb } from "./db.js";
import { usageToolDefinitions, handleUsageTool, isUsageTool } from "./tools/usage.js";
import { sessionToolDefinitions, handleSessionTool, isSessionTool } from "./tools/session.js";

const db = getDb();

const server = new Server(
  { name: "mcp-server", version: "0.1.0" },
  { capabilities: { tools: {}, resources: {} } }
);

// ─── Tools ────────────────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "echo",
      description: "입력한 메시지를 그대로 반환합니다.",
      inputSchema: {
        type: "object",
        properties: {
          message: { type: "string", description: "반환할 메시지" },
        },
        required: ["message"],
      },
    },
    ...usageToolDefinitions,
    ...sessionToolDefinitions,
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "echo") {
    const message = (args as { message: string }).message;
    return { content: [{ type: "text", text: message }] };
  }

  if (isUsageTool(name)) {
    return handleUsageTool(name, args as Record<string, unknown>, db);
  }

  if (isSessionTool(name)) {
    return handleSessionTool(name, args as Record<string, unknown>);
  }

  throw new Error(`Unknown tool: ${name}`);
});

// ─── Resources ────────────────────────────────────────────────────────────────

const RESOURCES: Record<string, { name: string; description: string; content: string }> = {
  "mcp://info/readme": {
    name: "README",
    description: "이 MCP 서버에 대한 설명",
    content: "# MCP Server\n\n이 서버는 Tools와 Resources를 제공하는 MCP 서버입니다.\n\n## 토큰 추적 Tools\n\n- **log_usage**: 대화 종료 후 토큰 사용량 기록\n- **get_my_stats**: 누적 통계 조회\n- **submit_daily_report**: Google Sheets에 일별 집계 제출",
  },
};

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: Object.entries(RESOURCES).map(([uri, { name, description }]) => ({
    uri,
    name,
    description,
    mimeType: "text/markdown",
  })),
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  const resource = RESOURCES[uri];
  if (!resource) throw new Error(`Resource not found: ${uri}`);

  return {
    contents: [{ uri, mimeType: "text/markdown", text: resource.content }],
  };
});

// ─── Start ────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
