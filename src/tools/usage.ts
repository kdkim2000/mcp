import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { UsageStore } from '../db.js';
import { submitToSheets } from '../sheets.js';

export const usageToolDefinitions: Tool[] = [
  {
    name: 'log_usage',
    description: '현재 대화의 토큰 사용량을 기록합니다. 대화가 끝날 때마다 호출하세요.',
    inputSchema: {
      type: 'object',
      properties: {
        model:         { type: 'string',  description: '사용한 모델명 (예: claude-sonnet-4-6)' },
        input_tokens:  { type: 'number',  description: '입력 토큰 수 (0 이상)' },
        output_tokens: { type: 'number',  description: '출력 토큰 수 (0 이상)' },
        email:         { type: 'string',  description: '사용자 이메일 (생략 시 기본값 사용)' },
        note:          { type: 'string',  description: '메모 (선택)' },
      },
      required: ['model', 'input_tokens', 'output_tokens'],
    },
  },
  {
    name: 'get_my_stats',
    description: '토큰 사용량 통계를 조회합니다.',
    inputSchema: {
      type: 'object',
      properties: {
        date:  { type: 'string', description: '조회 날짜 YYYY-MM-DD (생략 시 전체)' },
        email: { type: 'string', description: '이메일 (생략 시 기본값 사용)' },
        limit: { type: 'number', description: '최대 행 수 (기본 30)' },
      },
      required: [],
    },
  },
  {
    name: 'submit_daily_report',
    description: '오늘(또는 지정한 날짜)의 토큰 사용량을 Google Sheets에 제출합니다. 중복 제출은 자동 차단됩니다.',
    inputSchema: {
      type: 'object',
      properties: {
        date:  { type: 'string',  description: '제출할 날짜 YYYY-MM-DD (생략 시 오늘)' },
        email: { type: 'string',  description: '이메일 (생략 시 기본값 사용)' },
        force: { type: 'boolean', description: 'true면 중복 제출 검사 우회' },
      },
      required: [],
    },
  },
];

const USAGE_TOOL_NAMES = new Set(usageToolDefinitions.map((t) => t.name));

export function isUsageTool(name: string): boolean {
  return USAGE_TOOL_NAMES.has(name);
}

function err(message: string): CallToolResult {
  return { content: [{ type: 'text', text: `오류: ${message}` }], isError: true };
}

export async function handleUsageTool(
  name: string,
  args: Record<string, unknown>,
  store: UsageStore
): Promise<CallToolResult> {
  const defaultEmail = process.env.DEFAULT_USER_EMAIL ?? 'unknown@example.com';
  const maxTokens = Number(process.env.MAX_TOKENS_PER_CALL ?? 1_000_000);

  if (name === 'log_usage') {
    const email         = (args.email as string | undefined) ?? defaultEmail;
    const model         = args.model as string;
    const input_tokens  = Number(args.input_tokens);
    const output_tokens = Number(args.output_tokens);
    const note          = args.note as string | undefined;

    if (!model || typeof model !== 'string') return err('model은 필수 문자열입니다');
    if (!Number.isFinite(input_tokens) || input_tokens < 0)
      return err(`input_tokens는 0 이상의 숫자여야 합니다 (입력값: ${args.input_tokens})`);
    if (!Number.isFinite(output_tokens) || output_tokens < 0)
      return err(`output_tokens는 0 이상의 숫자여야 합니다 (입력값: ${args.output_tokens})`);
    if (input_tokens + output_tokens > maxTokens)
      return err(`총 토큰(${input_tokens + output_tokens})이 한도(${maxTokens})를 초과했습니다`);

    const id = await store.insertUsage({ email, model, input_tokens, output_tokens, note });
    const total = input_tokens + output_tokens;
    return {
      content: [{
        type: 'text',
        text: `기록 완료 (id: ${id})\n모델: ${model}\n입력: ${input_tokens.toLocaleString()} | 출력: ${output_tokens.toLocaleString()} | 합계: ${total.toLocaleString()}`,
      }],
    };
  }

  if (name === 'get_my_stats') {
    const email = (args.email as string | undefined) ?? defaultEmail;
    const date  = args.date  as string | undefined;
    const limit = args.limit ? Number(args.limit) : 30;

    const rows = await store.getDailyStats({ email, date, limit });

    if (rows.length === 0) {
      return { content: [{ type: 'text', text: '기록된 사용량이 없습니다.' }] };
    }

    const header = '| 날짜 | 모델 | 입력 | 출력 | 합계 |\n|------|------|-----:|-----:|-----:|';
    const body = rows.map((r) =>
      `| ${r.date} | ${r.model} | ${r.input_tokens.toLocaleString()} | ${r.output_tokens.toLocaleString()} | ${r.total_tokens.toLocaleString()} |`
    ).join('\n');

    const totalAll = rows.reduce((s, r) => s + r.total_tokens, 0);
    return {
      content: [{
        type: 'text',
        text: `## 토큰 사용량 (${email})\n\n${header}\n${body}\n\n**누적 합계: ${totalAll.toLocaleString()} tokens**`,
      }],
    };
  }

  if (name === 'submit_daily_report') {
    const email = (args.email as string | undefined) ?? defaultEmail;
    const date  = (args.date as string | undefined) ?? new Date().toISOString().slice(0, 10);
    const force = Boolean(args.force);

    const rows = await store.getDailyStats({ email, date });

    if (rows.length === 0) {
      return { content: [{ type: 'text', text: `${date} 날짜의 기록이 없습니다.` }] };
    }

    if (force) {
      await store.forceDeleteSubmission(email, date);
    }
    const submission = await store.recordSubmission({ email, date, rows_submitted: rows.length });
    if (!submission.ok) {
      return err(
        `${date} 날짜는 이미 제출되었습니다 (${submission.submittedAt}). 강제 재제출하려면 force: true 사용.`
      );
    }

    const webhookUrl = process.env.SHEETS_WEBHOOK_URL ?? '';
    const result = await submitToSheets(webhookUrl, rows);

    if (!result.success) {
      await store.forceDeleteSubmission(email, date);
      return err(`제출 실패: ${result.message} (시도: ${result.attempts ?? 1}회)`);
    }

    return {
      content: [{
        type: 'text',
        text: `제출 성공: ${result.message} (시도: ${result.attempts ?? 1}회)`,
      }],
    };
  }

  throw new Error(`Unknown usage tool: ${name}`);
}
