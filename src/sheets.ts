export interface SheetRow {
  date: string;
  email: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export interface SubmitResult {
  success: boolean;
  message: string;
  rowsWritten?: number;
  attempts?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function submitToSheets(
  webhookUrl: string,
  rows: SheetRow[],
  options: { maxRetries?: number; baseMs?: number } = {}
): Promise<SubmitResult> {
  if (!webhookUrl || webhookUrl.includes('YOUR_SCRIPT_ID')) {
    return {
      success: false,
      message: 'SHEETS_WEBHOOK_URL이 설정되지 않았습니다. docs/ARCHITECTURE.md를 참고하여 Google Apps Script Webhook을 생성하세요.',
    };
  }

  const maxRetries = options.maxRetries ?? Number(process.env.SHEETS_MAX_RETRIES ?? 3);
  const baseMs    = options.baseMs    ?? Number(process.env.SHEETS_RETRY_BASE_MS ?? 1000);

  let lastError = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows),
        redirect: 'follow',
        signal: controller.signal,
      });

      if (!res.ok) {
        lastError = `HTTP ${res.status}: ${await res.text()}`;
        if (res.status >= 400 && res.status < 500) {
          // 4xx는 재시도해도 의미 없음
          return { success: false, message: lastError, attempts: attempt };
        }
      } else {
        const body = await res.json() as { rowsWritten?: number };
        return {
          success: true,
          message: `${rows.length}행 제출 완료`,
          rowsWritten: body.rowsWritten ?? rows.length,
          attempts: attempt,
        };
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    } finally {
      clearTimeout(timeout);
    }

    if (attempt < maxRetries) {
      await sleep(baseMs * Math.pow(2, attempt - 1));
    }
  }

  return {
    success: false,
    message: `재시도 ${maxRetries}회 실패: ${lastError}`,
    attempts: maxRetries,
  };
}
