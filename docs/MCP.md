# MCP Tools 레퍼런스

이 서버가 제공하는 MCP tool의 전체 스펙입니다.

---

## `log_usage`

대화가 끝날 때 토큰 사용량을 로컬 SQLite에 기록합니다.

### 입력 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `model` | string | ✅ | 사용한 모델명 (예: `claude-sonnet-4-6`) |
| `input_tokens` | number | ✅ | 입력 토큰 수 |
| `output_tokens` | number | ✅ | 출력 토큰 수 |
| `email` | string | — | 사용자 이메일 (생략 시 `DEFAULT_USER_EMAIL`) |
| `note` | string | — | 메모 (예: 작업 종류) |

### 호출 예시

```json
{
  "name": "log_usage",
  "arguments": {
    "model": "claude-sonnet-4-6",
    "input_tokens": 2450,
    "output_tokens": 812,
    "note": "코드 리뷰"
  }
}
```

### 반환 예시

```
기록 완료 (id: 7)
모델: claude-sonnet-4-6
입력: 2,450 | 출력: 812 | 합계: 3,262
```

---

## `get_my_stats`

날짜별 토큰 사용량 집계를 마크다운 테이블로 반환합니다.

### 입력 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `date` | string | — | `YYYY-MM-DD` (생략 시 전체 날짜) |
| `email` | string | — | 이메일 (생략 시 `DEFAULT_USER_EMAIL`) |
| `limit` | number | — | 최대 행 수 (기본 30) |

### 호출 예시

```json
{
  "name": "get_my_stats",
  "arguments": {
    "date": "2026-05-12"
  }
}
```

### 반환 예시

```markdown
## 토큰 사용량 (kdkim2000@samsung.com)

| 날짜 | 모델 | 입력 | 출력 | 합계 |
|------|------|-----:|-----:|-----:|
| 2026-05-12 | claude-sonnet-4-6 | 12,450 | 3,812 | 16,262 |

**누적 합계: 16,262 tokens**
```

---

## `submit_daily_report`

지정 날짜(기본: 오늘)의 집계를 Google Sheets Webhook으로 제출합니다.
**같은 (email, date)로 이미 제출된 경우 거부**됩니다 (F-08).

### 입력 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `date` | string | — | `YYYY-MM-DD` (생략 시 오늘) |
| `email` | string | — | 이메일 (생략 시 `DEFAULT_USER_EMAIL`) |
| `force` | boolean | — | `true`면 중복 제출 검사 우회 |

### 호출 예시

```json
{
  "name": "submit_daily_report",
  "arguments": {}
}
```

### 반환 예시 (성공)

```
제출 성공: 2행 제출 완료
```

### 반환 예시 (Webhook 미설정)

```
제출 실패: SHEETS_WEBHOOK_URL이 설정되지 않았습니다. docs/ARCHITECTURE.md를 참고하여 Google Apps Script Webhook을 생성하세요.
```

---

## `log_session`

vibe 코딩 세션의 작업 내용을 `data/sessions/YYYY-MM-DD.md`에 마크다운으로 누적 기록합니다.

### 입력 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `title` | string | ✅ | 세션 제목 |
| `summary` | string | ✅ | 작업 요약 (2~4문장) |
| `files_changed` | string[] | — | 생성/수정 파일 목록 |
| `key_decisions` | string[] | — | 주요 의사결정 |
| `tags` | string[] | — | 분류 태그 |

### 호출 예시

```json
{
  "name": "log_session",
  "arguments": {
    "title": "MCP 서버 토큰 추적 구현",
    "summary": "SQLite 기반 로컬 저장과 Google Sheets Webhook 제출을 추가했다.",
    "files_changed": ["src/db.ts", "src/sheets.ts", "src/tools/usage.ts"],
    "key_decisions": ["better-sqlite3 동기 API 채택", "Webhook 재시도 3회"],
    "tags": ["구현", "MCP"]
  }
}
```

### 반환 예시

```
세션 기록 완료: data/sessions/2026-05-12.md
제목: MCP 서버 토큰 추적 구현
```

---

## `echo` (연결 테스트용)

```json
{ "name": "echo", "arguments": { "message": "hello" } }
```

---

## 입력 검증 규칙 (F-10)

| Tool | 규칙 |
|------|------|
| `log_usage` | `input_tokens >= 0`, `output_tokens >= 0`, `input_tokens + output_tokens <= MAX_TOKENS_PER_CALL` (기본 1,000,000) |
| `submit_daily_report` | 같은 (email, date)로 이미 제출된 경우 거부 — `force: true` 시 우회 |
