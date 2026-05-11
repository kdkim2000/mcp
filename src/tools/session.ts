import { appendFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SESSIONS_DIR = join(ROOT, 'data', 'sessions');

export const sessionToolDefinitions: Tool[] = [
  {
    name: 'log_session',
    description: 'vibe 코딩 세션의 작업 내용을 마크다운 파일로 기록합니다. 중요한 작업 완료 시 호출하세요.',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: '세션 제목 (예: "MCP 서버 토큰 추적 기능 구현")',
        },
        summary: {
          type: 'string',
          description: '작업 요약 — 무엇을 왜 했는지 서술',
        },
        files_changed: {
          type: 'array',
          items: { type: 'string' },
          description: '생성/수정된 파일 목록',
        },
        key_decisions: {
          type: 'array',
          items: { type: 'string' },
          description: '주요 의사결정 사항',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: '태그 (예: ["구현", "MCP", "TypeScript"])',
        },
      },
      required: ['title', 'summary'],
    },
  },
];

export function isSessionTool(name: string): boolean {
  return name === 'log_session';
}

export async function handleSessionTool(
  name: string,
  args: Record<string, unknown>
): Promise<CallToolResult> {
  if (name !== 'log_session') throw new Error(`Unknown session tool: ${name}`);

  const title          = args.title as string;
  const summary        = args.summary as string;
  const filesChanged   = (args.files_changed as string[] | undefined) ?? [];
  const keyDecisions   = (args.key_decisions as string[] | undefined) ?? [];
  const tags           = (args.tags as string[] | undefined) ?? [];

  mkdirSync(SESSIONS_DIR, { recursive: true });

  const date = new Date().toISOString().slice(0, 10);
  const time = new Date().toTimeString().slice(0, 8);
  const file = join(SESSIONS_DIR, `${date}.md`);

  if (!existsSync(file)) {
    writeFileSync(file, `# Session Log — ${date}\n\n`);
  }

  const tagLine = tags.length ? `\`${tags.join('` `')}\`` : '';
  const filesSection = filesChanged.length
    ? `\n**변경 파일**\n${filesChanged.map((f) => `- \`${f}\``).join('\n')}`
    : '';
  const decisionsSection = keyDecisions.length
    ? `\n**주요 결정**\n${keyDecisions.map((d) => `- ${d}`).join('\n')}`
    : '';

  const entry = `
## ${time} — ${title}
${tagLine ? `> ${tagLine}\n` : ''}
${summary}
${filesSection}
${decisionsSection}

`;

  appendFileSync(file, entry);

  return {
    content: [{
      type: 'text',
      text: `세션 기록 완료: data/sessions/${date}.md\n제목: ${title}`,
    }],
  };
}
