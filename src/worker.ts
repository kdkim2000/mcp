// Cloudflare Workers entry point — compiled by wrangler, not tsc
// Requires: wrangler.toml [[d1_databases]] binding named "DB"
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type JSONRPCMessage,
} from '@modelcontextprotocol/sdk/types.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { D1Store } from './db/d1.js';
import { usageToolDefinitions, handleUsageTool, isUsageTool } from './tools/usage.js';
import { dashboardHtml } from './dashboard.js';

export interface Env {
  DB: D1Database;
  API_KEY: string;
  DEFAULT_USER_EMAIL: string;
  SHEETS_WEBHOOK_URL: string;
  MAX_TOKENS_PER_CALL?: string;
}

// Minimal in-process transport: feeds a single JSON-RPC request through the
// Server's handler stack and captures the response — no HTTP streaming needed.
class InProcessTransport implements Transport {
  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;

  private _resolve?: (msg: JSONRPCMessage) => void;

  async start(): Promise<void> {}
  async close(): Promise<void> { this.onclose?.(); }

  async send(message: JSONRPCMessage): Promise<void> {
    this._resolve?.(message);
  }

  dispatch(message: JSONRPCMessage): Promise<JSONRPCMessage> {
    return new Promise((resolve) => {
      this._resolve = resolve;
      this.onmessage?.(message);
    });
  }
}

function buildServer(store: D1Store, env: Env): Server {
  // Inject env bindings into process.env so shared tool logic can read them.
  // Workers are single-tenant per isolate so this is safe.
  process.env.DEFAULT_USER_EMAIL  ??= env.DEFAULT_USER_EMAIL;
  process.env.SHEETS_WEBHOOK_URL  ??= env.SHEETS_WEBHOOK_URL;
  process.env.MAX_TOKENS_PER_CALL ??= env.MAX_TOKENS_PER_CALL ?? '1000000';

  const server = new Server(
    { name: 'mcp-server', version: '0.1.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: usageToolDefinitions,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (isUsageTool(name)) {
      return handleUsageTool(name, args as Record<string, unknown>, store);
    }
    throw new Error(`Unknown tool: ${name}`);
  });

  return server;
}

export default {
  async fetch(req: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const isAuthorized = req.headers.get('Authorization') === `Bearer ${env.API_KEY}`;

    // GET /dashboard — public, no auth required
    if (req.method === 'GET' && url.pathname === '/dashboard') {
      return new Response(dashboardHtml(url.origin), {
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }

    // GET /api/stats — returns DailyStats[] JSON for the dashboard
    if (req.method === 'GET' && url.pathname === '/api/stats') {
      if (!isAuthorized) return new Response('Unauthorized', { status: 401 });
      const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '90', 10) || 90, 365);
      const store = new D1Store(env.DB);
      const stats = await store.getDailyStats({ email: env.DEFAULT_USER_EMAIL, limit });
      return new Response(JSON.stringify(stats), {
        headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
      });
    }

    if (!isAuthorized) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (req.method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok', server: 'mcp-server' }), {
        headers: { 'content-type': 'application/json' },
      });
    }

    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    let body: JSONRPCMessage;
    try {
      body = await req.json() as JSONRPCMessage;
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    // Streamable HTTP: notifications have no 'id' and expect no response
    if (!('id' in body)) {
      return new Response(null, { status: 202 });
    }

    const store = new D1Store(env.DB);
    const server = buildServer(store, env);
    const transport = new InProcessTransport();
    await server.connect(transport);

    try {
      const response = await transport.dispatch(body);
      return new Response(JSON.stringify(response), {
        headers: { 'content-type': 'application/json' },
      });
    } finally {
      await server.close();
    }
  },
};
