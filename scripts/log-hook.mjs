/**
 * Claude Code hook script — vibe coding 과정을 data/sessions/YYYY-MM-DD.md 에 자동 기록
 * 이벤트: PostToolUse(Edit, Write, Bash), Stop
 * Stop 이벤트에 usage 데이터가 있으면 토큰 사용량을 D1에 자동 기록
 * 민감정보(API 키, 토큰, Webhook URL 등)는 [MASKED]로 치환 후 기록
 */
import { appendFileSync, mkdirSync, existsSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SESSIONS_DIR = join(ROOT, 'data', 'sessions');
const PLANS_DIR_WIN = 'C:\\Users\\kdkim2000\\.claude\\plans';

// ---------------------------------------------------------------------------
// .env / .dev.vars 파서
// ---------------------------------------------------------------------------

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const vars = {};
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const idx = t.indexOf('=');
    if (idx === -1) continue;
    vars[t.slice(0, idx).trim()] = t.slice(idx + 1).trim();
  }
  return vars;
}

const _env = { ...parseEnvFile(join(ROOT, '.env')), ...parseEnvFile(join(ROOT, '.dev.vars')) };
const getVar = (key) => _env[key] ?? process.env[key] ?? '';

// ---------------------------------------------------------------------------
// 민감정보 마스킹
// ---------------------------------------------------------------------------

const MASK_PATTERNS = [
  [/(Authorization:\s*Bearer\s+)[^\s"'`]+/gi, '$1[MASKED]'],
  [/(--header\s+["']?Authorization:\s*Bearer\s+)[^\s"']+/gi, '$1[MASKED]'],
  [/\b(API[_-]?KEY|SECRET|TOKEN|PASSWORD|WEBHOOK_URL|SHEETS_WEBHOOK_URL|DATABASE_URL|PRIVATE_KEY|ACCESS_KEY|AUTH_TOKEN)\s*=\s*\S+/gi, '$1=[MASKED]'],
  [/echo\s+["']([^"']{6,})["']\s*\|/gi, 'echo [MASKED] |'],
  [/(wrangler\s+secret\s+put\s+\w+\s+)\S+/gi, '$1[MASKED]'],
  [/\b(sk-[A-Za-z0-9]{10,}|cfat_[A-Za-z0-9]{10,}|ghp_[A-Za-z0-9]{10,}|glpat-[A-Za-z0-9-]{10,}|xox[bpars]-[A-Za-z0-9-]+)\b/g, '[MASKED]'],
  [/(https?:\/\/)[^:@\s]+:[^@\s]+@/g, '$1[MASKED]@'],
  [/(script\.google\.com\/macros\/s\/)[A-Za-z0-9_-]+/g, '$1[MASKED]'],
  [/\b[0-9a-f]{32,}\b/gi, '[MASKED]'],
];

function maskSensitive(text) {
  let result = text;
  for (const [pattern, replacement] of MASK_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// ---------------------------------------------------------------------------
// 유틸
// ---------------------------------------------------------------------------

function isPlanFile(filePath) {
  const norm = filePath.replace(/\\/g, '/');
  return norm.includes('/.claude/plans/') || filePath.startsWith(PLANS_DIR_WIN);
}

function todayFile() {
  const date = new Date().toISOString().slice(0, 10);
  const file = join(SESSIONS_DIR, `${date}.md`);
  if (!existsSync(file)) writeFileSync(file, `# Session Log — ${date}\n\n`);
  return file;
}

function timestamp() {
  return new Date().toTimeString().slice(0, 8);
}

// ---------------------------------------------------------------------------
// D1 기록 — Workers HTTP 엔드포인트 POST
// ---------------------------------------------------------------------------

async function logUsageToD1(input_tokens, output_tokens, sid) {
  const apiKey    = getVar('API_KEY');
  if (!apiKey) return { ok: false, reason: 'API_KEY 없음' };

  const workerUrl = getVar('WORKER_URL') || 'https://mcp-server.kdkim2000.workers.dev';
  const email     = getVar('DEFAULT_USER_EMAIL') || 'unknown@example.com';
  const model     = getVar('CLAUDE_MODEL') || 'claude-sonnet-4-6';

  try {
    const res = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1,
        method: 'tools/call',
        params: {
          name: 'log_usage',
          arguments: { model, input_tokens, output_tokens, email, note: `auto-hook sid:${sid}` },
        },
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const json = await res.json();
    const text = json?.result?.content?.[0]?.text ?? '';
    return { ok: true, text };
  } catch (e) {
    return { ok: false, reason: String(e?.message ?? e) };
  }
}

// ---------------------------------------------------------------------------
// 이벤트 핸들러
// ---------------------------------------------------------------------------

async function handleEvent(event) {
  mkdirSync(SESSIONS_DIR, { recursive: true });
  const file = todayFile();
  const ts   = timestamp();
  const sid  = (event.session_id ?? '').slice(0, 8);

  if (event.hook_event_name === 'PostToolUse') {
    const tool  = event.tool_name ?? '';
    const input = event.tool_input ?? {};

    if (tool === 'Edit') {
      const p = input.file_path ?? '?';
      appendFileSync(file, `- \`${ts}\` **${isPlanFile(p) ? 'Plan(Edit)' : 'Edit'}** \`${p}\`\n`);
    } else if (tool === 'Write') {
      const p = input.file_path ?? '?';
      appendFileSync(file, `- \`${ts}\` **${isPlanFile(p) ? 'Plan(Write)' : 'Write'}** \`${p}\`\n`);
    } else if (tool === 'Bash') {
      const cmd = maskSensitive((input.command ?? '').replace(/\n/g, ' ')).slice(0, 160);
      appendFileSync(file, `- \`${ts}\` **Bash** \`${cmd}\`\n`);
    }

  } else if (event.hook_event_name === 'Stop') {
    const reason = event.stop_reason ?? 'end_turn';
    const usage  = event.usage;

    if (usage && (usage.input_tokens > 0 || usage.output_tokens > 0)) {
      const inp = usage.input_tokens  ?? 0;
      const out = usage.output_tokens ?? 0;
      const r   = await logUsageToD1(inp, out, sid);

      if (r.ok) {
        appendFileSync(file,
          `\n---\n> \`${ts}\` 세션 종료 [${reason}] (sid: ${sid})\n` +
          `> D1 기록 완료 — input:${inp.toLocaleString()} output:${out.toLocaleString()} total:${(inp+out).toLocaleString()}\n\n`
        );
      } else {
        appendFileSync(file,
          `\n---\n> \`${ts}\` 세션 종료 [${reason}] (sid: ${sid})\n` +
          `> D1 기록 실패(${r.reason}) — input:${inp.toLocaleString()} output:${out.toLocaleString()}\n\n`
        );
      }
    } else {
      appendFileSync(file, `\n---\n> \`${ts}\` 세션 종료 [${reason}] (sid: ${sid})\n\n`);
    }
  }
}

// ---------------------------------------------------------------------------
// stdin 읽기
// ---------------------------------------------------------------------------

const chunks = [];
process.stdin.on('data', (chunk) => chunks.push(chunk));
process.stdin.on('end', async () => {
  try {
    const raw = Buffer.concat(chunks).toString('utf8').trim();
    if (raw) await handleEvent(JSON.parse(raw));
  } catch {
    // 파싱 실패 시 무시 — Claude 동작에 영향 없음
  }
  process.exit(0);
});
