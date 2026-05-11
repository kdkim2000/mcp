import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { SqliteStore } from './db/sqlite.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Shared types ─────────────────────────────────────────────────────────────

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

export interface SubmissionRecord {
  email: string;
  date: string;
  rows_submitted: number;
}

export type RecordSubmissionResult =
  | { ok: true; id: number }
  | { ok: false; alreadySubmitted: true; submittedAt: string };

// ─── UsageStore interface (implemented by SqliteStore and D1Store) ─────────────

export interface UsageStore {
  insertUsage(record: UsageRecord): Promise<number>;
  getDailyStats(options?: { email?: string; date?: string; limit?: number }): Promise<DailyStats[]>;
  recordSubmission(record: SubmissionRecord): Promise<RecordSubmissionResult>;
  forceDeleteSubmission(email: string, date: string): Promise<void>;
}

// ─── SQLite factory (stdio mode) ──────────────────────────────────────────────

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
      SUM(input_tokens)                 AS input_tokens,
      SUM(output_tokens)                AS output_tokens,
      SUM(input_tokens + output_tokens) AS total_tokens
    FROM usage_logs
    GROUP BY date(recorded_at), email, model;
  `);
}

export function createStore(cfg: { kind: 'sqlite'; path?: string }): UsageStore {
  const dbPath = cfg.path
    ? resolve(process.cwd(), cfg.path)
    : resolve(__dirname, '../data/usage.db');

  mkdirSync(dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  initSchema(db);
  return new SqliteStore(db);
}

let _store: UsageStore | null = null;

export function getStore(): UsageStore {
  if (!_store) {
    _store = createStore({ kind: 'sqlite', path: process.env.DB_PATH });
  }
  return _store;
}

// ─── Backward-compat standalone functions (used by tests/db.test.ts) ──────────
// These take a raw Database instance so tests can use in-memory DBs.

export async function insertUsage(db: Database.Database, record: UsageRecord): Promise<number> {
  return new SqliteStore(db).insertUsage(record);
}

export async function getDailyStats(
  db: Database.Database,
  options: { email?: string; date?: string; limit?: number } = {}
): Promise<DailyStats[]> {
  return new SqliteStore(db).getDailyStats(options);
}

export async function recordSubmission(
  db: Database.Database,
  record: SubmissionRecord
): Promise<RecordSubmissionResult> {
  return new SqliteStore(db).recordSubmission(record);
}

export async function forceDeleteSubmission(
  db: Database.Database,
  email: string,
  date: string
): Promise<void> {
  return new SqliteStore(db).forceDeleteSubmission(email, date);
}
