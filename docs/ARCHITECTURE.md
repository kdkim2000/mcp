# ARCHITECTURE — MCP 토큰 사용량 추적 서버

## 시스템 흐름

```
Claude Desktop ─── stdio (MCP protocol) ───┐
                                            │
Claude Code hooks (PostToolUse/Stop) ───┐   │
       │                                 │   │
       ▼                                 │   ▼
scripts/log-hook.mjs                    src/index.ts ─ dotenv → .env
       │                                 │
       │                                 ├── log_usage ────────►┐
       │                                 ├── get_my_stats ◄────┤
       │                                 ├── submit_daily_report
       │                                 │      │              │
       │                                 │      │              ▼
       │                                 │      │       src/db.ts ──► data/usage.db
       │                                 ├── log_session       (usage_logs, submissions)
       │                                 │      │              ▲
       │                                 │      ▼              │
       │                                 │   data/sessions/    │
       │                                 │   YYYY-MM-DD.md ◄───┘
       │                                 │      ▲
       └─────────────────────────────────┴──────┘ (자동 append)
                                         │
                                         ▼
                                 src/sheets.ts (재시도)
                                         │
                                         ▼
                                 Google Apps Script
                                         │
                                         ▼
                                 Google Sheets
```

## 소스 파일 역할

| 파일 | 역할 |
|------|------|
| `src/index.ts` | MCP 서버 진입점. tool 등록 및 요청 라우팅 |
| `src/db.ts` | SQLite 싱글턴, 스키마 초기화, 쿼리 함수 (usage_logs / submissions) |
| `src/sheets.ts` | Google Sheets Webhook POST, 타임아웃, **지수 백오프 재시도** |
| `src/tools/usage.ts` | 토큰 추적 3개 tool 정의 + 핸들러 (입력 검증·중복 제출 방지) |
| `src/tools/session.ts` | `log_session` tool — 세션 작업 내용 마크다운 기록 |
| `scripts/log-hook.mjs` | Claude Code hook 자동 기록 스크립트 |
| `.claude/agents/*.md` | 토큰 추정·세션 요약·리포트 검증 sub-agent 정의 |
| `tests/*.test.ts` | vitest 단위 테스트 (db / sheets / tools) |

## 기술 스택

- **런타임**: Node.js 18+ (ESM, `"type": "module"`)
- **MCP SDK**: `@modelcontextprotocol/sdk` v1.29.0
- **DB**: `better-sqlite3` (동기 API, 네이티브 모듈)
- **환경변수**: `dotenv` (`import 'dotenv/config'` ESM 패턴)
- **HTTP**: Node.js 내장 `fetch()` (별도 라이브러리 없음)

## 사전 요구사항 (Windows)

`better-sqlite3`는 네이티브 모듈이므로 컴파일 도구가 필요합니다.

```powershell
# Visual C++ Build Tools 설치 (미설치 시 npm install 실패)
winget install Microsoft.VisualStudio.2022.BuildTools
# 또는
npm install --global windows-build-tools
```

## Google Apps Script Webhook 생성 가이드

### 1. Google Sheets 스프레드시트 준비

1. [Google Sheets](https://sheets.google.com) 에서 새 스프레드시트 생성
2. 첫 번째 시트 이름을 `Usage` 로 변경
3. A1부터 헤더 입력: `날짜 | 이메일 | 모델 | 입력토큰 | 출력토큰 | 합계 | 제출시각`

### 2. Apps Script 설정

1. 스프레드시트 메뉴 → **확장 프로그램** → **Apps Script**
2. 기존 코드 전체 삭제 후 아래 코드 붙여넣기:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Usage');

  const rows = JSON.parse(e.postData.contents);

  rows.forEach(function(row) {
    sheet.appendRow([
      row.date,
      row.email,
      row.model,
      row.input_tokens,
      row.output_tokens,
      row.total_tokens,
      new Date().toISOString()
    ]);
  });

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, rowsWritten: rows.length }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. 저장 (Ctrl+S)

### 3. 웹 앱 배포

1. 오른쪽 상단 **배포** → **새 배포**
2. 유형: **웹 앱** 선택
3. 설정:
   - 설명: `MCP Token Tracker`
   - 다음 사용자로 실행: **나(본인)**
   - 액세스 권한: **모든 사용자**
4. **배포** 클릭 → Google 계정 권한 승인
5. 생성된 **웹 앱 URL** 복사

### 4. .env 파일에 URL 입력

```
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycb.../exec
```

### 5. Claude Desktop 재시작

설정 → Developer → mcp-server **Reconnect** 클릭

---

## 환경변수 (.env)

| 변수 | 필수 | 설명 |
|------|------|------|
| `SHEETS_WEBHOOK_URL` | 제출 시 필수 | Google Apps Script 웹 앱 URL |
| `DEFAULT_USER_EMAIL` | 권장 | tool 호출 시 email 생략 가능하게 해주는 기본값 |
| `DB_PATH` | 선택 | SQLite 파일 경로 (기본: `./data/usage.db`) |
| `MAX_TOKENS_PER_CALL` | 선택 | log_usage 단일 호출 최대 토큰 (기본: 1,000,000) |
| `SHEETS_MAX_RETRIES` | 선택 | Webhook 재시도 횟수 (기본: 3) |
| `SHEETS_RETRY_BASE_MS` | 선택 | 재시도 백오프 기준 ms (기본: 1000) |

`.env.example` 파일을 복사해 `.env`로 사용하세요. `.env` 자체는 `.gitignore`에 포함됨.

## 운영 가이드

### DB 백업
SQLite 파일을 주기적으로 복사:
```powershell
Copy-Item data\usage.db data\usage.db.$(Get-Date -Format 'yyyyMMdd').bak
```

### 중복 제출 처리
`submissions` 테이블의 `UNIQUE(email, date)` 제약으로 같은 날 두 번째 호출은 거부됩니다.
강제 재제출이 필요하면 `submit_daily_report` 호출 시 `force: true` 사용.

### 보안 주의사항
- **`.env`는 절대 git 커밋 금지** — `SHEETS_WEBHOOK_URL`이 노출되면 외부인이 Sheet에 임의 행 삽입 가능
- **세션 로그(`data/sessions/`)에 민감정보 기록 금지** — Bash 명령 내 API 키, 내부 IP, 비밀번호 등 주의
- **사용자 책임**: `log_session`의 `summary` 본문은 사용자가 검토 후 작성
