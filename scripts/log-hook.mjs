/**
 * Claude Code hook script — vibe coding 과정을 data/sessions/YYYY-MM-DD.md 에 자동 기록
 * 이벤트: PostToolUse(Edit, Write, Bash), Stop
 * 민감정보(API 키, 토큰, Webhook URL 등)는 [MASKED]로 치환 후 기록
 */
import { appendFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SESSIONS_DIR = join(ROOT, 'data', 'sessions');
// Claude Code plan mode files are stored here
const PLANS_DIR_WIN = 'C:\\Users\\kdkim2000\\.claude\\plans';

// 민감정보 마스킹 패턴 목록 — [regex, replacement] 순서
const MASK_PATTERNS = [
  // Authorization: Bearer <token>  (따옴표/공백 전까지)
  [/(Authorization:\s*Bearer\s+)[^\s"'`]+/gi, '$1[MASKED]'],
  // --header "Authorization: Bearer ..." (curl 인자)
  [/(--header\s+["']?Authorization:\s*Bearer\s+)[^\s"']+/gi, '$1[MASKED]'],
  // 환경변수 대입: API_KEY=xxx, SECRET=xxx, TOKEN=xxx, PASSWORD=xxx
  [/\b(API[_-]?KEY|SECRET|TOKEN|PASSWORD|WEBHOOK_URL|SHEETS_WEBHOOK_URL|DATABASE_URL|PRIVATE_KEY|ACCESS_KEY|AUTH_TOKEN)\s*=\s*\S+/gi, '$1=[MASKED]'],
  // echo "value" | ... 패턴 (wrangler secret put 파이프)
  [/echo\s+["']([^"']{6,})["']\s*\|/gi, 'echo [MASKED] |'],
  // wrangler secret put KEY VALUE (인라인 값)
  [/(wrangler\s+secret\s+put\s+\w+\s+)\S+/gi, '$1[MASKED]'],
  // 알려진 토큰 접두사: sk-, cfat_, ghp_, glpat-, xox*
  [/\b(sk-[A-Za-z0-9]{10,}|cfat_[A-Za-z0-9]{10,}|ghp_[A-Za-z0-9]{10,}|glpat-[A-Za-z0-9-]{10,}|xox[bpars]-[A-Za-z0-9-]+)\b/g, '[MASKED]'],
  // URL 자격증명: https://user:pass@host
  [/(https?:\/\/)[^:@\s]+:[^@\s]+@/g, '$1[MASKED]@'],
  // Google Apps Script URL (스크립트 ID 포함)
  [/(script\.google\.com\/macros\/s\/)[A-Za-z0-9_-]+/g, '$1[MASKED]'],
  // 32자 이상 연속 16진수 (해시/시크릿 키)
  [/\b[0-9a-f]{32,}\b/gi, '[MASKED]'],
];

function maskSensitive(text) {
  let result = text;
  for (const [pattern, replacement] of MASK_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function isPlanFile(filePath) {
  const norm = filePath.replace(/\\/g, '/');
  return norm.includes('/.claude/plans/') || filePath.startsWith(PLANS_DIR_WIN);
}

function todayFile() {
  const date = new Date().toISOString().slice(0, 10);
  const file = join(SESSIONS_DIR, `${date}.md`);
  if (!existsSync(file)) {
    writeFileSync(file, `# Session Log — ${date}\n\n`);
  }
  return file;
}

function timestamp() {
  return new Date().toTimeString().slice(0, 8);
}

function handleEvent(event) {
  mkdirSync(SESSIONS_DIR, { recursive: true });
  const file = todayFile();
  const ts = timestamp();
  const sid = (event.session_id ?? '').slice(0, 8);

  if (event.hook_event_name === 'PostToolUse') {
    const tool = event.tool_name ?? '';
    const input = event.tool_input ?? {};

    if (tool === 'Edit') {
      const path = input.file_path ?? '?';
      const label = isPlanFile(path) ? 'Plan(Edit)' : 'Edit';
      appendFileSync(file, `- \`${ts}\` **${label}** \`${path}\`\n`);
    } else if (tool === 'Write') {
      const path = input.file_path ?? '?';
      const label = isPlanFile(path) ? 'Plan(Write)' : 'Write';
      appendFileSync(file, `- \`${ts}\` **${label}** \`${path}\`\n`);
    } else if (tool === 'Bash') {
      const raw = (input.command ?? '').replace(/\n/g, ' ');
      const cmd = maskSensitive(raw).slice(0, 160);
      appendFileSync(file, `- \`${ts}\` **Bash** \`${cmd}\`\n`);
    }
  } else if (event.hook_event_name === 'Stop') {
    const reason = event.stop_reason ?? 'end_turn';
    appendFileSync(file, `\n---\n> \`${ts}\` 세션 종료 [${reason}] (sid: ${sid})\n\n`);
  }
}

// stdin에서 JSON 읽기
const chunks = [];
process.stdin.on('data', (chunk) => chunks.push(chunk));
process.stdin.on('end', () => {
  try {
    const raw = Buffer.concat(chunks).toString('utf8').trim();
    if (raw) handleEvent(JSON.parse(raw));
  } catch {
    // 파싱 실패 시 무시 — Claude 동작에 영향 없음
  }
  process.exit(0);
});
