/**
 * Claude Code hook script — vibe coding 과정을 data/sessions/YYYY-MM-DD.md 에 자동 기록
 * 이벤트: PostToolUse(Edit, Write, Bash), Stop
 */
import { appendFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SESSIONS_DIR = join(ROOT, 'data', 'sessions');
// Claude Code plan mode files are stored here
const PLANS_DIR_WIN = 'C:\\Users\\kdkim2000\\.claude\\plans';
const PLANS_DIR_POSIX = 'C:/Users/kdkim2000/.claude/plans';

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
      const cmd = (input.command ?? '').slice(0, 120).replace(/\n/g, ' ');
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
