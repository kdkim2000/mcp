import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import {
  insertUsage,
  getDailyStats,
  recordSubmission,
  forceDeleteSubmission,
} from '../src/db.js';

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

describe('insertUsage', () => {
  let db: Database.Database;
  beforeEach(() => { db = makeDb(); });

  it('레코드를 삽입하고 ID를 반환한다', async () => {
    const id = await insertUsage(db, {
      email: 'a@b.com', model: 'sonnet',
      input_tokens: 100, output_tokens: 50,
    });
    expect(id).toBe(1);
  });

  it('recorded_at 생략 시 현재 시각을 자동 기록한다', async () => {
    await insertUsage(db, { email: 'a@b.com', model: 'sonnet', input_tokens: 1, output_tokens: 1 });
    const row = db.prepare('SELECT recorded_at FROM usage_logs').get() as { recorded_at: string };
    expect(row.recorded_at).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });
});

describe('getDailyStats', () => {
  let db: Database.Database;
  beforeEach(async () => {
    db = makeDb();
    await insertUsage(db, { email: 'a@b.com', model: 'sonnet', input_tokens: 100, output_tokens: 50, recorded_at: '2026-05-12 10:00:00' });
    await insertUsage(db, { email: 'a@b.com', model: 'sonnet', input_tokens: 200, output_tokens: 100, recorded_at: '2026-05-12 14:00:00' });
    await insertUsage(db, { email: 'c@d.com', model: 'opus',   input_tokens: 500, output_tokens: 200, recorded_at: '2026-05-12 09:00:00' });
  });

  it('같은 날짜·이메일·모델은 합산된다', async () => {
    const rows = await getDailyStats(db, { email: 'a@b.com', date: '2026-05-12' });
    expect(rows).toHaveLength(1);
    expect(rows[0].input_tokens).toBe(300);
    expect(rows[0].output_tokens).toBe(150);
    expect(rows[0].total_tokens).toBe(450);
  });

  it('email 필터가 동작한다', async () => {
    const rows = await getDailyStats(db, { email: 'c@d.com' });
    expect(rows).toHaveLength(1);
    expect(rows[0].model).toBe('opus');
  });

  it('빈 결과는 빈 배열을 반환한다', async () => {
    expect(await getDailyStats(db, { email: 'nobody@nowhere.com' })).toEqual([]);
  });
});

describe('recordSubmission', () => {
  let db: Database.Database;
  beforeEach(() => { db = makeDb(); });

  it('처음 제출은 성공한다', async () => {
    const result = await recordSubmission(db, { email: 'a@b.com', date: '2026-05-12', rows_submitted: 3 });
    expect(result.ok).toBe(true);
  });

  it('같은 (email, date) 두 번째 제출은 거부된다', async () => {
    await recordSubmission(db, { email: 'a@b.com', date: '2026-05-12', rows_submitted: 3 });
    const result = await recordSubmission(db, { email: 'a@b.com', date: '2026-05-12', rows_submitted: 5 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.alreadySubmitted).toBe(true);
  });

  it('다른 날짜 또는 이메일은 허용된다', async () => {
    await recordSubmission(db, { email: 'a@b.com', date: '2026-05-12', rows_submitted: 1 });
    expect((await recordSubmission(db, { email: 'a@b.com', date: '2026-05-13', rows_submitted: 1 })).ok).toBe(true);
    expect((await recordSubmission(db, { email: 'c@d.com', date: '2026-05-12', rows_submitted: 1 })).ok).toBe(true);
  });

  it('forceDeleteSubmission 이후 재제출이 가능하다', async () => {
    await recordSubmission(db, { email: 'a@b.com', date: '2026-05-12', rows_submitted: 1 });
    await forceDeleteSubmission(db, 'a@b.com', '2026-05-12');
    expect((await recordSubmission(db, { email: 'a@b.com', date: '2026-05-12', rows_submitted: 9 })).ok).toBe(true);
  });
});
