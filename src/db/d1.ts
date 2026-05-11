// D1 adapter — compiled by wrangler (not tsc). Requires @cloudflare/workers-types.
import type {
  UsageStore, UsageRecord, DailyStats, SubmissionRecord, RecordSubmissionResult,
} from '../db.js';

export class D1Store implements UsageStore {
  constructor(private d1: D1Database) {}

  async insertUsage(record: UsageRecord): Promise<number> {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const result = await this.d1
      .prepare(
        `INSERT INTO usage_logs (email, model, input_tokens, output_tokens, recorded_at, note)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        record.email, record.model,
        record.input_tokens, record.output_tokens,
        record.recorded_at ?? now,
        record.note ?? null,
      )
      .run();
    return result.meta.last_row_id ?? 0;
  }

  async getDailyStats(options: { email?: string; date?: string; limit?: number } = {}): Promise<DailyStats[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (options.email) { conditions.push('email = ?'); params.push(options.email); }
    if (options.date)  { conditions.push('date = ?');  params.push(options.date); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = options.limit ?? 30;
    params.push(limit);

    const result = await this.d1
      .prepare(`SELECT * FROM daily_stats ${where} ORDER BY date DESC LIMIT ?`)
      .bind(...params)
      .all<DailyStats>();
    return result.results;
  }

  async recordSubmission(record: SubmissionRecord): Promise<RecordSubmissionResult> {
    const existing = await this.d1
      .prepare('SELECT submitted_at FROM submissions WHERE email = ? AND date = ?')
      .bind(record.email, record.date)
      .first<{ submitted_at: string }>();

    if (existing) {
      return { ok: false, alreadySubmitted: true, submittedAt: existing.submitted_at };
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const result = await this.d1
      .prepare(
        `INSERT INTO submissions (email, date, submitted_at, rows_submitted) VALUES (?, ?, ?, ?)`
      )
      .bind(record.email, record.date, now, record.rows_submitted)
      .run();

    return { ok: true, id: result.meta.last_row_id ?? 0 };
  }

  async forceDeleteSubmission(email: string, date: string): Promise<void> {
    await this.d1
      .prepare('DELETE FROM submissions WHERE email = ? AND date = ?')
      .bind(email, date)
      .run();
  }
}
