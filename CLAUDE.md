# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev         # tsx watch로 개발 중 실시간 재시작
npm run build       # tsc로 dist/ 빌드
npm run start       # 빌드된 서버 실행 (stdio transport)
npm run inspect     # MCP Inspector UI로 서버 테스트
npm test            # vitest run (단위 테스트 실행)
npm run test:watch  # vitest watch

# Cloudflare Workers
npm run dev:worker  # wrangler dev (로컬 Workers 서버, :8787)
npm run deploy      # wrangler deploy (프로덕션 배포)
npm run migrate:remote  # D1 스키마 원격 적용
npm run tail        # Workers 실시간 로그
```

## Architecture

TypeScript MCP 서버. **듀얼 모드**:

```
[로컬 Claude Desktop] ──stdio──► src/index.ts  ──► SqliteStore (data/usage.db)
                                                        │
                                                   UsageStore (공통 인터페이스)
                                                        │
[다른 디바이스 Claude] ──HTTPS──► src/worker.ts ──► D1Store   (Cloudflare D1)
                      (mcp-remote)  + API_KEY 인증
```

**진입점**: `src/index.ts` (stdio), `src/worker.ts` (HTTP/Workers)

| 파일 | 역할 |
|------|------|
| `src/index.ts` | stdio 서버 진입점, tool 등록 및 라우팅 |
| `src/worker.ts` | Cloudflare Workers 진입점 (wrangler 빌드, tsc 제외) |
| `src/db.ts` | `UsageStore` 인터페이스 + `createStore()` / `getStore()` 팩토리 |
| `src/db/sqlite.ts` | `SqliteStore` — better-sqlite3 동기 API를 Promise로 래핑 |
| `src/db/d1.ts` | `D1Store` — Cloudflare D1 네이티브 async API (wrangler 빌드 전용) |
| `src/sheets.ts` | Google Sheets Webhook POST — 지수 백오프 재시도 (4xx는 재시도 안함) |
| `src/tools/usage.ts` | `log_usage` / `get_my_stats` / `submit_daily_report` |
| `src/tools/session.ts` | `log_session` tool — 세션 작업 내용을 마크다운으로 기록 |
| `scripts/log-hook.mjs` | Claude Code hook — Edit/Write/Bash/Stop 이벤트 자동 기록 |
| `tests/*.test.ts` | vitest 단위 테스트 (DB / Sheets / Usage tool) — 22 tests |
| `migrations/0001_init.sql` | D1 스키마 마이그레이션 |
| `.claude/agents/*.md` | Sub-agent 정의 — token-estimator / session-summarizer / report-validator |

## Environment

`.env` 파일 필수 (stdio 모드):
```
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_ID/exec
DEFAULT_USER_EMAIL=kdkim2000@samsung.com
DB_PATH=./data/usage.db
```

Workers 모드 시크릿은 `.dev.vars` (로컬) 또는 `wrangler secret put` (프로덕션).  
Webhook 생성 방법: `docs/ARCHITECTURE.md` 참고. 배포 절차: `docs/DEPLOY.md` 참고.

## Adding New Tools

1. `src/tools/usage.ts`의 `usageToolDefinitions` 배열에 tool 정의 추가
2. `handleUsageTool()` 함수에 분기 추가 — `store: UsageStore`를 `await`로 사용
3. `isUsageTool()`은 자동으로 반영됨 (Set 기반)
4. Workers에서도 쓸 tool이면 `src/worker.ts`의 `buildServer()`에서 자동 등록됨

## DB 추상화

`UsageStore` 인터페이스: `insertUsage`, `getDailyStats`, `recordSubmission`, `forceDeleteSubmission`  
- `SqliteStore(db: Database)` — 테스트 및 로컬 stdio 모드
- `D1Store(d1: D1Database)` — Workers 프로덕션 모드
- `createStore({kind:'sqlite', path?})` — stdio 진입점용 팩토리
- 테스트에서 직접 import하는 `insertUsage(db, ...)` 등 standalone 함수는 `SqliteStore` 래퍼

## Session Logs

자동 기록 위치: `data/sessions/YYYY-MM-DD.md`

- **hook 자동 기록**: Edit/Write/Bash tool 호출 및 Stop 이벤트 → `scripts/log-hook.mjs`
  - `C:\Users\kdkim2000\.claude\plans\` 경로의 plan 파일 변경은 `Plan(Edit)` / `Plan(Write)` 레이블로 구분
  - Bash 명령 내 민감정보 자동 마스킹 → `[MASKED]` 치환 후 기록
    - 대상: Bearer 토큰, `API_KEY=` 등 환경변수 대입, `echo "..." |` 파이프, `wrangler secret put`, `sk-`/`cfat_`/`ghp_` 토큰, Google Apps Script URL, 32자 이상 hex
- **수동 기록**: `log_session` MCP tool 호출 → 날짜별 파일에 세션 요약 추가

## Sub-agents

| Agent | 용도 |
|-------|------|
| `token-estimator` | 대화 컨텍스트 기반 토큰 수 추정 (log_usage 인자 산출) |
| `session-summarizer` | 대화 + hook 자동기록 + plan 파일 → `log_session` 인자 생성 |
| `report-validator` | `submit_daily_report` 호출 전 데이터 합리성 검증 (ok/warn/block) |

## Operational Constraints

- **중복 제출 방지**: `submissions` 테이블 `UNIQUE(email, date)` — `force: true` 로 우회
- **Webhook 재시도**: 5xx는 지수 백오프 3회, 4xx는 즉시 중단
- **입력 검증**: `log_usage`는 음수 거부, `MAX_TOKENS_PER_CALL` 초과 거부
- **Worker 인증**: `Authorization: Bearer <API_KEY>` 헤더 필수
- **tsconfig 제외**: `src/worker.ts`, `src/db/d1.ts`는 tsc 대상에서 제외 (wrangler 전용)

## Docs

| 파일 | 내용 |
|------|------|
| `docs/PRD.md` | 기능 요구사항, 데이터 모델 |
| `docs/ARCHITECTURE.md` | 시스템 흐름도, Google Apps Script 설정 가이드 |
| `docs/MCP.md` | tool 입출력 스펙 및 예시 |
| `docs/AGENT.md` | Claude Desktop 시스템 프롬프트 템플릿 |
| `docs/SKILL.md` | 워크플로우 정의 |
| `docs/DEPLOY.md` | Cloudflare Workers + D1 배포 단계별 가이드 |
