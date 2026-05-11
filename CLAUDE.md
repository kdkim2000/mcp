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
```

## Architecture

TypeScript MCP 서버. `stdio` 트랜스포트를 사용하며 Claude Desktop에 직접 연결된다. 토큰 사용량을 로컬 SQLite에 기록하고 Google Sheets Webhook으로 제출하는 기능을 제공한다.

**진입점**: `src/index.ts`

| 파일 | 역할 |
|------|------|
| `src/index.ts` | 서버 진입점, tool 등록 및 라우팅 |
| `src/db.ts` | SQLite 싱글턴 — `getDb()` / `insertUsage()` / `getDailyStats()` / `recordSubmission()` / `forceDeleteSubmission()` |
| `src/sheets.ts` | Google Sheets Webhook POST — 지수 백오프 재시도 (4xx는 재시도 안함) |
| `src/tools/usage.ts` | `log_usage` / `get_my_stats` / `submit_daily_report` (입력 검증 + 중복 제출 방지) |
| `src/tools/session.ts` | `log_session` tool — 세션 작업 내용을 마크다운으로 기록 |
| `scripts/log-hook.mjs` | Claude Code hook 스크립트 — Edit/Write/Bash/Stop 이벤트를 자동 기록 |
| `tests/*.test.ts` | vitest 단위 테스트 (DB / Sheets / Usage tool) — 22 tests |
| `.claude/agents/*.md` | Sub-agent 정의 — token-estimator / session-summarizer / report-validator |

## Environment

`.env` 파일 필수:
```
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_ID/exec
DEFAULT_USER_EMAIL=kdkim2000@samsung.com
DB_PATH=./data/usage.db
```

Webhook 생성 방법: `docs/ARCHITECTURE.md` 참고

## Adding New Tools

1. `src/tools/usage.ts`의 `usageToolDefinitions` 배열에 tool 정의 추가
2. `handleUsageTool()` 함수에 분기 추가
3. `isUsageTool()`은 자동으로 반영됨 (Set 기반)

## Session Logs

자동 기록 위치: `data/sessions/YYYY-MM-DD.md`

- **hook 자동 기록**: Edit/Write/Bash tool 호출 및 Stop 이벤트 → `.claude/settings.json`의 PostToolUse/Stop hook이 `scripts/log-hook.mjs`를 실행
- **수동 기록**: Claude가 `log_session` MCP tool 호출 → 날짜별 파일에 세션 요약 추가

## Sub-agents

복잡한 위임 작업은 `.claude/agents/` 의 sub-agent에 위임:

| Agent | 용도 |
|-------|------|
| `token-estimator` | 대화 컨텍스트 기반 토큰 수 추정 (log_usage 인자 산출) |
| `session-summarizer` | 대화 + hook 자동기록 → `log_session` 인자 생성 (title/summary/files/decisions/tags) |
| `report-validator` | `submit_daily_report` 호출 전 데이터 합리성 검증 (ok/warn/block) |

## Operational Constraints

- **중복 제출 방지**: `submissions` 테이블 `UNIQUE(email, date)` — `force: true` 로 우회
- **Webhook 재시도**: 5xx는 지수 백오프 3회, 4xx는 즉시 중단 (의미 없는 재시도 방지)
- **입력 검증**: `log_usage`는 음수 거부, `MAX_TOKENS_PER_CALL` 초과 거부
- **`.env` 보안**: 커밋 금지, 템플릿은 `.env.example` 참조

## Docs

| 파일 | 내용 |
|------|------|
| `docs/PRD.md` | 기능 요구사항, 데이터 모델 |
| `docs/ARCHITECTURE.md` | 시스템 흐름도, Google Apps Script 설정 가이드 |
| `docs/MCP.md` | tool 입출력 스펙 및 예시 |
| `docs/AGENT.md` | Claude Desktop 시스템 프롬프트 템플릿 |
| `docs/SKILL.md` | 워크플로우 정의 |
