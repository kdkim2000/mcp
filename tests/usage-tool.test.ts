import { describe, it, expect, beforeEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { handleUsageTool } from '../src/tools/usage.js';

function makeDb(): Database.Database {
  const db = new Database(':memory:');
  db.exec(`
    CREATE TABLE usage_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL, model TEXT NOT NULL,
      input_tokens INTEGER NOT NULL DEFAULT 0,
      output_tokens INTEGER NOT NULL DEFAULT 0,
      recorded_at TEXT NOT NULL, note TEXT
    );
    CREATE TABLE submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL, date TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      rows_submitted INTEGER NOT NULL DEFAULT 0,
      UNIQUE(email, date)
    );
    CREATE VIEW daily_stats AS
    SELECT date(recorded_at) AS date, email, model,
      SUM(input_tokens) AS input_tokens,
      SUM(output_tokens) AS output_tokens,
      SUM(input_tokens + output_tokens) AS total_tokens
    FROM usage_logs GROUP BY date(recorded_at), email, model;
  `);
  return db;
}

describe('log_usage 입력 검증 (F-10)', () => {
  let db: Database.Database;
  beforeEach(() => {
    db = makeDb();
    process.env.DEFAULT_USER_EMAIL = 'test@example.com';
    process.env.MAX_TOKENS_PER_CALL = '1000';
  });

  it('음수 input_tokens는 거부된다', async () => {
    const r = await handleUsageTool('log_usage', {
      model: 'sonnet', input_tokens: -1, output_tokens: 100,
    }, db);
    expect(r.isError).toBe(true);
  });

  it('한도 초과 토큰은 거부된다', async () => {
    const r = await handleUsageTool('log_usage', {
      model: 'sonnet', input_tokens: 600, output_tokens: 600,
    }, db);
    expect(r.isError).toBe(true);
    expect((r.content[0] as { text: string }).text).toContain('한도');
  });

  it('정상 입력은 통과한다', async () => {
    const r = await handleUsageTool('log_usage', {
      model: 'sonnet', input_tokens: 100, output_tokens: 50,
    }, db);
    expect(r.isError).toBeUndefined();
  });
});

describe('submit_daily_report 중복 제출 방지 (F-08)', () => {
  let db: Database.Database;
  beforeEach(() => {
    db = makeDb();
    process.env.DEFAULT_USER_EMAIL = 'test@example.com';
    process.env.SHEETS_WEBHOOK_URL = 'https://example.com/hook';

    vi.stubGlobal('fetch', vi.fn(async () =>
      new Response(JSON.stringify({ rowsWritten: 1 }), { status: 200 })
    ));

    // 사용량 1건 삽입
    db.prepare(`INSERT INTO usage_logs (email, model, input_tokens, output_tokens, recorded_at)
                VALUES ('test@example.com', 'sonnet', 100, 50, '2026-05-12 10:00:00')`).run();
  });

  it('처음 제출은 성공한다', async () => {
    const r = await handleUsageTool('submit_daily_report', { date: '2026-05-12' }, db);
    expect(r.isError).toBeUndefined();
    expect((r.content[0] as { text: string }).text).toContain('제출 성공');
  });

  it('같은 날짜 두 번째 제출은 거부된다', async () => {
    await handleUsageTool('submit_daily_report', { date: '2026-05-12' }, db);
    const r = await handleUsageTool('submit_daily_report', { date: '2026-05-12' }, db);
    expect(r.isError).toBe(true);
    expect((r.content[0] as { text: string }).text).toContain('이미 제출');
  });

  it('force: true 로 강제 재제출이 가능하다', async () => {
    await handleUsageTool('submit_daily_report', { date: '2026-05-12' }, db);
    const r = await handleUsageTool('submit_daily_report', { date: '2026-05-12', force: true }, db);
    expect(r.isError).toBeUndefined();
  });

  it('데이터 없으면 안내 메시지 반환', async () => {
    const r = await handleUsageTool('submit_daily_report', { date: '2099-01-01' }, db);
    expect(r.isError).toBeUndefined();
    expect((r.content[0] as { text: string }).text).toContain('기록이 없습니다');
  });
});
