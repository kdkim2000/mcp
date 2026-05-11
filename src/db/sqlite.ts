import Database from 'better-sqlite3';
import type {
  UsageStore, UsageRecord, DailyStats, SubmissionRecord, RecordSubmissionResult,
} from '../db.js';

export class SqliteStore implements UsageStore {
  constructor(private db: Database.Database) {}

  async insertUsage(record: UsageRecord): Promise<number> {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const result = this.db.prepare(`
      INSERT INTO usage_logs (email, model, input_tokens, output_tokens, recorded_at, note)
      VALUES (@email, @model, @input_tokens, @output_tokens, @recorded_at, @note)
    `).run({
      ...record,
      recorded_at: record.recorded_at ?? now,
      note: record.note ?? null,
    });
    return result.lastInsertRowid as number;
  }

  async getDailyStats(options: { email?: string; date?: string; limit?: number } = {}): Promise<DailyStats[]> {
    const conditions: string[] = [];
    const params: Record<string, string | number> = {};

    if (options.email) { conditions.push('email = @email'); params.email = options.email; }
    if (options.date)  { conditions.push('date = @date');   params.date  = options.date; }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = options.limit ?? 30;

    return this.db.prepare(
      `SELECT * FROM daily_stats ${where} ORDER BY date DESC LIMIT ${limit}`
    ).all(params) as DailyStats[];
  }

  async recordSubmission(record: SubmissionRecord): Promise<RecordSubmissionResult> {
    const existing = this.db
      .prepare('SELECT submitted_at FROM submissions WHERE email = ? AND date = ?')
      .get(record.email, record.date) as { submitted_at: string } | undefined;

    if (existing) {
      return { ok: false, alreadySubmitted: true, submittedAt: existing.submitted_at };
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const result = this.db.prepare(
      `INSERT INTO submissions (email, date, submitted_at, rows_submitted) VALUES (?, ?, ?, ?)`
    ).run(record.email, record.date, now, record.rows_submitted);

    return { ok: true, id: result.lastInsertRowid as number };
  }

  async forceDeleteSubmission(email: string, date: string): Promise<void> {
    this.db.prepare('DELETE FROM submissions WHERE email = ? AND date = ?').run(email, date);
  }
}
