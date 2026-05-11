import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { submitToSheets } from '../src/sheets.js';

describe('submitToSheets', () => {
  const sampleRow = {
    date: '2026-05-12', email: 'a@b.com', model: 'sonnet',
    input_tokens: 100, output_tokens: 50, total_tokens: 150,
  };

  beforeEach(() => { vi.restoreAllMocks(); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('URL 미설정 시 즉시 실패한다 (재시도 없음)', async () => {
    const result = await submitToSheets('', [sampleRow]);
    expect(result.success).toBe(false);
    expect(result.message).toContain('SHEETS_WEBHOOK_URL');
  });

  it('placeholder URL은 거부된다', async () => {
    const result = await submitToSheets('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec', [sampleRow]);
    expect(result.success).toBe(false);
  });

  it('200 OK 응답 시 첫 시도에서 성공한다', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      JSON.stringify({ rowsWritten: 1 }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    )));

    const result = await submitToSheets('https://example.com/hook', [sampleRow], { maxRetries: 3, baseMs: 1 });
    expect(result.success).toBe(true);
    expect(result.attempts).toBe(1);
    expect(result.rowsWritten).toBe(1);
  });

  it('5xx 오류는 재시도 후 실패한다', async () => {
    const mockFetch = vi.fn(async () => new Response('Server Error', { status: 500 }));
    vi.stubGlobal('fetch', mockFetch);

    const result = await submitToSheets('https://example.com/hook', [sampleRow], { maxRetries: 3, baseMs: 1 });
    expect(result.success).toBe(false);
    expect(result.attempts).toBe(3);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('4xx 오류는 재시도하지 않는다', async () => {
    const mockFetch = vi.fn(async () => new Response('Bad Request', { status: 400 }));
    vi.stubGlobal('fetch', mockFetch);

    const result = await submitToSheets('https://example.com/hook', [sampleRow], { maxRetries: 3, baseMs: 1 });
    expect(result.success).toBe(false);
    expect(result.attempts).toBe(1);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('네트워크 오류 후 성공 시 재시도 횟수가 반영된다', async () => {
    const mockFetch = vi.fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ rowsWritten: 1 }), { status: 200 }));
    vi.stubGlobal('fetch', mockFetch);

    const result = await submitToSheets('https://example.com/hook', [sampleRow], { maxRetries: 5, baseMs: 1 });
    expect(result.success).toBe(true);
    expect(result.attempts).toBe(3);
  });
});
