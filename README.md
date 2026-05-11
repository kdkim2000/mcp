# MCP Token Tracker

Claude Desktop 사용자의 **토큰 사용량 추적**과 **vibe 코딩 세션 기록**을 위한 MCP 서버.

로컬(SQLite)과 클라우드(Cloudflare Workers + D1)를 동시에 지원하는 **듀얼 모드** 구조로, 여러 디바이스에서 동일한 통계를 공유할 수 있습니다.

---

## 목차

- [기능](#기능)
- [아키텍처](#아키텍처)
- [빠른 시작 — 로컬](#빠른-시작--로컬)
- [빠른 시작 — 클라우드](#빠른-시작--클라우드)
- [MCP Tools 사용법](#mcp-tools-사용법)
- [Claude Desktop 설정](#claude-desktop-설정)
- [세션 자동 기록](#세션-자동-기록)
- [Google Sheets 연동](#google-sheets-연동)
- [개발 명령어](#개발-명령어)
- [개발 과정](#개발-과정)

---

## 기능

| Tool | 설명 |
|------|------|
| `log_usage` | 대화 종료 후 입·출력 토큰 수를 로컬 DB에 기록 |
| `get_my_stats` | 날짜별 누적 통계를 마크다운 테이블로 조회 |
| `submit_daily_report` | 오늘 집계를 Google Sheets Webhook으로 제출 |
| `log_session` | 세션 작업 내용(제목·요약·변경 파일·결정사항)을 마크다운으로 기록 |
| `echo` | 연결 테스트용 |

**부가 기능**
- Claude Code hook으로 Edit/Write/Bash 호출 자동 기록 (`data/sessions/YYYY-MM-DD.md`)
- 중복 제출 자동 차단 (`UNIQUE(email, date)`) — `force: true`로 우회
- Webhook 5xx 오류 시 지수 백오프 3회 재시도, 4xx 즉시 중단
- 음수·한도 초과 토큰 입력 거부 (F-10)
- 3개 Sub-agent: `token-estimator`, `session-summarizer`, `report-validator`

---

## 아키텍처

```
[로컬 Claude Desktop]  ──stdio──►  src/index.ts  ──► SqliteStore
                                                        │
                                                   UsageStore (공통 인터페이스)
                                                        │
[다른 디바이스 Claude]  ──HTTPS──►  src/worker.ts ──► D1Store
                       (mcp-remote)  API_KEY 인증      Cloudflare D1
```

### 소스 구조

```
src/
  index.ts          # stdio 서버 진입점
  worker.ts         # Cloudflare Workers 진입점 (wrangler 빌드 전용)
  db.ts             # UsageStore 인터페이스 + createStore/getStore 팩토리
  db/
    sqlite.ts       # SqliteStore — better-sqlite3 동기 API → Promise 래핑
    d1.ts           # D1Store — Cloudflare D1 네이티브 async API
  sheets.ts         # Google Sheets Webhook (지수 백오프 재시도)
  tools/
    usage.ts        # log_usage / get_my_stats / submit_daily_report
    session.ts      # log_session
scripts/
  log-hook.mjs      # Claude Code hook 자동 기록 스크립트
migrations/
  0001_init.sql     # D1 스키마 마이그레이션
tests/              # vitest 단위 테스트 22개
.claude/
  agents/           # token-estimator / session-summarizer / report-validator
  settings.json     # PostToolUse/Stop hook 설정
```

---

## 빠른 시작 — 로컬

### 1. 사전 요구사항

Node.js 18+, `better-sqlite3` 네이티브 모듈 빌드를 위한 Visual C++ Build Tools (Windows):

```powershell
winget install Microsoft.VisualStudio.2022.BuildTools
```

### 2. 설치

```bash
git clone <repo>
cd mcp
npm install
```

### 3. 환경 설정

`.env.example`을 복사해 `.env`로 저장 후 수정:

```
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
DEFAULT_USER_EMAIL=your@email.com
DB_PATH=./data/usage.db
```

| 변수 | 필수 | 설명 |
|------|------|------|
| `SHEETS_WEBHOOK_URL` | 제출 시 필수 | Google Apps Script 웹 앱 URL |
| `DEFAULT_USER_EMAIL` | 권장 | tool 호출 시 email 생략 가능 |
| `DB_PATH` | 선택 | SQLite 경로 (기본: `./data/usage.db`) |
| `MAX_TOKENS_PER_CALL` | 선택 | 단일 호출 최대 토큰 (기본: 1,000,000) |

### 4. Claude Desktop 연결

`%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-server": {
      "command": "npx",
      "args": ["tsx", "E:\\apps\\mcp\\src\\index.ts"]
    }
  }
}
```

Claude Desktop 재시작 후 채팅창 하단 망치 아이콘에서 tool 목록을 확인합니다.

---

## 빠른 시작 — 클라우드

Cloudflare 무료 티어: Workers 100k req/일, D1 5GB 저장소.

### 1. 사전 작업

```bash
npm install           # wrangler 포함
npx wrangler login    # Cloudflare 계정 로그인 (브라우저 인증)
```

### 2. D1 데이터베이스 생성

```bash
npx wrangler d1 create mcp-usage
```

출력된 `database_id`를 `wrangler.toml`에 입력:

```toml
[[d1_databases]]
binding      = "DB"
database_name = "mcp-usage"
database_id  = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 3. 스키마 적용 및 배포

```bash
npm run migrate:remote   # D1에 테이블/뷰 생성
npm run deploy           # Workers에 배포
```

### 4. 시크릿 등록

```bash
npx wrangler secret put API_KEY             # 임의의 긴 문자열
npx wrangler secret put DEFAULT_USER_EMAIL  # your@email.com
npx wrangler secret put SHEETS_WEBHOOK_URL  # Google Apps Script URL
```

### 5. 동작 확인

```bash
curl https://mcp-server.<account>.workers.dev \
  -H "Authorization: Bearer <API_KEY>"
# → {"status":"ok","server":"mcp-server"}
```

### 6. 다른 디바이스에서 연결

```json
{
  "mcpServers": {
    "mcp-server-cloud": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "https://mcp-server.<account>.workers.dev",
        "--header", "Authorization: Bearer <API_KEY>"
      ]
    }
  }
}
```

---

## MCP Tools 사용법

### `log_usage` — 토큰 사용량 기록

대화가 끝날 때마다 호출합니다. Claude에게 "오늘 대화 토큰 기록해줘"라고 요청하거나, 시스템 프롬프트에 자동 호출을 지시합니다.

```
사용자: 이 코드 리뷰해줘 [... 대화 진행 ...]

사용자: 고마워, 오늘 대화 토큰 기록해줘
AI: [log_usage 호출]
    기록 완료 (id: 7)
    모델: claude-sonnet-4-6
    입력: 12,450 | 출력: 3,812 | 합계: 16,262
```

**파라미터**

| 파라미터 | 필수 | 설명 |
|----------|------|------|
| `model` | ✅ | 모델명 (예: `claude-sonnet-4-6`) |
| `input_tokens` | ✅ | 입력 토큰 수 (0 이상) |
| `output_tokens` | ✅ | 출력 토큰 수 (0 이상) |
| `email` | — | 생략 시 `DEFAULT_USER_EMAIL` |
| `note` | — | 메모 (예: "코드 리뷰") |

---

### `get_my_stats` — 사용량 조회

```
사용자: 오늘 사용량 보여줘
AI: [get_my_stats 호출]

## 토큰 사용량 (your@email.com)

| 날짜       | 모델              |    입력 |    출력 |    합계 |
|------------|-------------------|--------:|--------:|--------:|
| 2026-05-12 | claude-sonnet-4-6 | 12,450  |  3,812  | 16,262  |

**누적 합계: 16,262 tokens**
```

**파라미터**

| 파라미터 | 설명 |
|----------|------|
| `date` | `YYYY-MM-DD` (생략 시 전체) |
| `limit` | 최대 행 수 (기본 30) |

---

### `submit_daily_report` — Google Sheets 제출

```
사용자: 오늘 사용량 제출해줘
AI: [get_my_stats → submit_daily_report 순서로 호출]
    제출 성공: 1행 제출 완료 (시도: 1회)
```

- 같은 날짜 두 번 호출하면 자동 차단됩니다.
- 강제 재제출: `force: true` 파라미터 추가

---

### `log_session` — 세션 기록

코드 작업 완료 후 세션 내용을 기록합니다. `data/sessions/YYYY-MM-DD.md`에 누적 저장됩니다.

```
사용자: 이번 세션 기록해줘
AI: [log_session 호출]
    세션 기록 완료: data/sessions/2026-05-12.md
    제목: 인증 모듈 리팩토링
```

**파라미터**

| 파라미터 | 필수 | 설명 |
|----------|------|------|
| `title` | ✅ | 세션 제목 (30자 이내) |
| `summary` | ✅ | 무엇을 왜 했는지 2~4문장 |
| `files_changed` | — | 변경 파일 목록 |
| `key_decisions` | — | 주요 의사결정 |
| `tags` | — | 분류 태그 |

---

### 자동화 — 시스템 프롬프트 설정

Claude Desktop **Settings → Custom Instructions**에 추가하면 대화 종료 시 자동 호출됩니다:

```
대화가 완전히 끝날 때마다 다음을 순서대로 호출하세요:

1. log_usage — 이 대화의 추정 토큰 수 기록
   (model: 현재 모델명, input_tokens/output_tokens: 추정값)

2. log_session — 코드 작업이 있었을 때만 호출
   (title, summary, files_changed, key_decisions, tags)
```

---

## Claude Desktop 설정

로컬 + 클라우드 동시 연결 예시:

```json
{
  "mcpServers": {
    "mcp-server": {
      "command": "npx",
      "args": ["tsx", "E:\\apps\\mcp\\src\\index.ts"]
    },
    "mcp-server-cloud": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "https://mcp-server.<account>.workers.dev",
        "--header", "Authorization: Bearer <API_KEY>"
      ]
    }
  }
}
```

- **로컬**: 로컬 PC에서 stdio로 연결, `data/usage.db`에 저장
- **클라우드**: 다른 디바이스에서 HTTPS로 연결, Cloudflare D1에 저장

---

## 세션 자동 기록

Claude Code hook이 Edit/Write/Bash 호출을 `data/sessions/YYYY-MM-DD.md`에 자동 기록합니다.

### Hook 설정 확인 (`.claude/settings.json`)

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write|Bash",
      "hooks": [{"type": "command", "command": "node E:\\apps\\mcp\\scripts\\log-hook.mjs"}]
    }],
    "Stop": [{
      "matcher": "",
      "hooks": [{"type": "command", "command": "node E:\\apps\\mcp\\scripts\\log-hook.mjs"}]
    }]
  }
}
```

### 기록 예시 (`data/sessions/2026-05-12.md`)

```markdown
# Session Log — 2026-05-12

- `10:23:41` **Edit** `src/db.ts`
- `10:24:05` **Write** `src/db/sqlite.ts`
- `10:31:12` **Bash** `npm test`

---
> `10:35:00` 세션 종료 [end_turn] (sid: a1b2c3d4)

## 10:35:01 — UsageStore 인터페이스 추출
> `구현` `TypeScript` `리팩토링`

기존 db.ts의 동기 함수를 UsageStore 인터페이스로 추상화하여 D1 어댑터를 추가할 수 있도록 구조를 분리했다.
```

- `Plan(Write)` / `Plan(Edit)` 레이블: `C:\Users\..\.claude\plans\` 경로의 plan 파일 변경

---

## Google Sheets 연동

### Apps Script 설정

1. [Google Sheets](https://sheets.google.com)에서 새 스프레드시트 생성, 첫 시트 이름을 `Usage`로 변경
2. **확장 프로그램 → Apps Script**에서 아래 코드 입력 후 저장:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Usage');
  const rows = JSON.parse(e.postData.contents);
  rows.forEach(function(row) {
    sheet.appendRow([
      row.date, row.email, row.model,
      row.input_tokens, row.output_tokens, row.total_tokens,
      new Date().toISOString()
    ]);
  });
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, rowsWritten: rows.length }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. **배포 → 새 배포 → 웹 앱** 선택, 액세스: **모든 사용자**, 배포 후 URL 복사
4. `.env`의 `SHEETS_WEBHOOK_URL`에 URL 입력

---

## 개발 명령어

```bash
npm run dev           # tsx watch — 로컬 서버 실시간 재시작
npm run build         # tsc — dist/ 빌드
npm run start         # 빌드된 서버 실행
npm test              # vitest — 22개 단위 테스트
npm run inspect       # MCP Inspector UI 테스트

npm run dev:worker    # wrangler dev — 로컬 Workers 서버 (:8787)
npm run deploy        # Cloudflare Workers 배포
npm run migrate:remote  # D1 스키마 원격 적용
npm run tail          # Workers 실시간 로그
```

---

## 개발 과정

### Phase 1 — 로컬 MCP 서버 구축

Claude Desktop을 stdio 트랜스포트로 연결하고 5개의 MCP tool을 구현했습니다.

**핵심 구현 사항**
- `better-sqlite3` 동기 API로 로컬 SQLite 연동 (`data/usage.db`)
- `submissions` 테이블 `UNIQUE(email, date)` 제약으로 중복 제출 방지
- Google Sheets Webhook POST + 지수 백오프 재시도 (4xx 즉시 중단, 5xx 3회 재시도)
- `log_usage` 입력 검증 — 음수 거부, `MAX_TOKENS_PER_CALL` 초과 거부
- vitest 인메모리 SQLite + fetch mock으로 22개 단위 테스트 작성

**기술 결정**
- ESM + `"type": "module"` — MCP SDK가 ESM 전용
- `import 'dotenv/config'` — ESM 환경 dotenv 로딩 패턴
- `fileURLToPath(import.meta.url)` — ESM에서 `__dirname` 대체

### Phase 2 — 세션 자동 기록 시스템

Claude Code의 PostToolUse/Stop hook을 활용해 코딩 세션을 자동 기록합니다.

**구현 사항**
- `scripts/log-hook.mjs` — stdin JSON 수신 후 Edit/Write/Bash/Stop 이벤트를 마크다운으로 append
- `.claude/settings.json` — hook 등록 (matcher: `Edit|Write|Bash`)
- `log_session` MCP tool — Claude가 세션 요약을 수동으로 기록
- Plan 파일(`C:\Users\..\.claude\plans\`) 변경 시 `Plan(Write/Edit)` 레이블로 구분 기록

**Sub-agent 설계**
- `token-estimator` — 대화 컨텍스트에서 토큰 수 추정 (±25%)
- `session-summarizer` — hook 기록 + plan 파일 → `log_session` 인자 자동 생성
- `report-validator` — 제출 전 통계 합리성 검증 (ok/warn/block)

### Phase 3 — Cloudflare Workers + D1 원격 배포

여러 디바이스에서 동일한 통계를 공유하기 위해 원격 인스턴스를 추가했습니다.

**핵심 설계 결정**
- `UsageStore` 인터페이스 도입 — sqlite/d1 구현이 동일 비즈니스 로직을 공유
- `SqliteStore` — 기존 동기 API를 `Promise.resolve()`로 래핑
- `D1Store` — `prepare().bind().run()` D1 네이티브 async API
- `InProcessTransport` 구현 — Workers 환경에서 Node.js 전용 `StreamableHTTPServerTransport` 우회, 단일 JSON-RPC 요청을 Server 핸들러에 직접 dispatch
- Bearer 토큰 인증 — 개인 운영에 OAuth는 과잉, Cloudflare Secret으로 코드 외부 보관
- `src/worker.ts`, `src/db/d1.ts`는 tsc 대상 제외, wrangler가 자체 번들링

**배포 결과**
- Worker URL: `https://mcp-server.kdkim2000.workers.dev`
- D1 데이터베이스: APAC 리전, 스키마 마이그레이션 완료
- E2E 검증: 유닛 22개 + 로컬 stdio + 클라우드 Worker 전 항목 통과

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 런타임 | Node.js 18+ (ESM) |
| MCP SDK | `@modelcontextprotocol/sdk` ^1.12.0 |
| 로컬 DB | `better-sqlite3` (동기 네이티브 모듈) |
| 클라우드 DB | Cloudflare D1 (SQLite 호환) |
| 배포 | Cloudflare Workers (wrangler ^4.0) |
| 환경변수 | `dotenv` |
| 테스트 | `vitest` (인메모리 SQLite + fetch mock) |
| TypeScript | `^5.8`, `module: Node16` |

---

## 라이선스

개인/팀 내부 사용 전용.
