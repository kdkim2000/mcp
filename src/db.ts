import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface UsageRecord {
  email: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  recorded_at?: string;
  note?: string;
}

export interface DailyStats {
  date: string;
  email: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const dbPath = process.env.DB_PATH
    ? resolve(process.cwd(), process.env.DB_PATH)
    : resolve(__dirname, '../data/usage.db');

  mkdirSync(dirname(dbPath), { recursive: true });

  _db = new Database(dbPath);
  _db.pragma('journal_mode = WAL');
  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS usage_logs (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT    NOT NULL,
      model         TEXT    NOT NULL,
      input_tokens  INTEGER NOT NULL DEFAULT 0,
      output_tokens INTEGER NOT NULL DEFAULT 0,
      recorded_at   TEXT    NOT NULL,
      note          TEXT
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      email           TEXT    NOT NULL,
      date            TEXT    NOT NULL,
      submitted_at    TEXT    NOT NULL,
      rows_submitted  INTEGER NOT NULL DEFAULT 0,
      UNIQUE(email, date)
    );

    CREATE VIEW IF NOT EXISTS daily_stats AS
    SELECT
      date(recorded_at) AS date,
      email,
      model,
      SUM(input_tokens)                    AS input_tokens,
      SUM(output_tokens)                   AS output_tokens,
      SUM(input_tokens + output_tokens)    AS total_tokens
    FROM usage_logs
    GROUP BY date(recorded_at), email, model;
  `);
}

export interface SubmissionRecord {
  email: string;
  date: string;
  rows_submitted: number;
}

export function recordSubmission(
  db: Database.Database,
  record: SubmissionRecord
): { ok: true; id: number } | { ok: false; alreadySubmitted: true; submittedAt: string } {
  const existing = db
    .prepare('SELECT submitted_at FROM submissions WHERE email = ? AND date = ?')
    .get(record.email, record.date) as { submitted_at: string } | undefined;

  if (existing) {
    return { ok: false, alreadySubmitted: true, submittedAt: existing.submitted_at };
  }

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const result = db.prepare(
    `INSERT INTO submissions (email, date, submitted_at, rows_submitted)
     VALUES (?, ?, ?, ?)`
  ).run(record.email, record.date, now, record.rows_submitted);

  return { ok: true, id: result.lastInsertRowid as number };
}

export function forceDeleteSubmission(
  db: Database.Database,
  email: string,
  date: string
): void {
  db.prepare('DELETE FROM submissions WHERE email = ? AND date = ?').run(email, date);
}

export function insertUsage(db: Database.Database, record: UsageRecord): number {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const stmt = db.prepare(`
    INSERT INTO usage_logs (email, model, input_tokens, output_tokens, recorded_at, note)
    VALUES (@email, @model, @input_tokens, @output_tokens, @recorded_at, @note)
  `);
  const result = stmt.run({
    ...record,
    recorded_at: record.recorded_at ?? now,
    note: record.note ?? null,
  });
  return result.lastInsertRowid as number;
}

export function getDailyStats(
  db: Database.Database,
  options: { email?: string; date?: string; limit?: number } = {}
): DailyStats[] {
  const conditions: string[] = [];
  const params: Record<string, string | number> = {};

  if (options.email) {
    conditions.push('email = @email');
    params.email = options.email;
  }
  if (options.date) {
    conditions.push('date = @date');
    params.date = options.date;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = options.limit ?? 30;

  return db
    .prepare(`SELECT * FROM daily_stats ${where} ORDER BY date DESC LIMIT ${limit}`)
    .all(params) as DailyStats[];
}
