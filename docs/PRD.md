# PRD — MCP 토큰 사용량 추적 & 세션 기록 서버

## 개요

AI 활용 활성화 이벤트를 위해 Claude Desktop 사용자가 ① 매일 토큰 사용량을 쉽게 기록·제출하고 ② vibe 코딩 세션 과정을 자동·수동으로 기록하도록 지원하는 MCP 서버.

## 문제 정의

- Claude Desktop은 토큰 사용량을 사용자에게 노출하지 않음
- Anthropic Console 대시보드는 개인별 세션 구분이 어렵고 수동 확인 필요
- 이벤트 집계를 위해 개인별 일별 사용량을 공유 스프레드시트에 제출해야 함
- vibe 코딩 과정의 의사결정/변경 내역이 휘발되어 사후 추적이 어려움

## 기능 요구사항

| ID | 기능 | 설명 |
|----|------|------|
| F-01 | 사용량 기록 | `log_usage` tool로 모델·입출력 토큰 수를 로컬 SQLite에 저장 |
| F-02 | 통계 조회 | `get_my_stats` tool로 날짜별 누적 통계를 마크다운 테이블로 반환 |
| F-03 | 일별 제출 | `submit_daily_report` tool로 오늘 집계를 Google Sheets Webhook에 POST |
| F-04 | 기본값 폴백 | `email` 파라미터 생략 시 `DEFAULT_USER_EMAIL` 자동 적용 |
| F-05 | Webhook 미설정 안내 | URL 미설정 상태에서 제출 시 설정 방법 안내 |
| F-06 | 세션 기록 (수동) | `log_session` tool로 작업 제목·요약·변경 파일·결정사항을 마크다운에 저장 |
| F-07 | 세션 기록 (자동) | Claude Code hook(PostToolUse/Stop)이 Edit/Write/Bash 호출과 응답 종료를 자동 기록 |
| F-08 | 중복 제출 방지 | `submit_daily_report` 호출 시 같은 (email, date) 조합 이력은 거부하거나 사용자 확인 |
| F-09 | Webhook 재시도 | 네트워크 오류 시 지수 백오프(기본 3회) 재시도 |
| F-10 | 입력값 검증 | `log_usage`의 토큰 값이 0 미만 또는 `MAX_TOKENS_PER_CALL` 초과 시 거부 |

## 비기능 요구사항

| 영역 | 요구사항 |
|------|---------|
| 동작성 | 기록·조회는 네트워크 없이 로컬 SQLite만으로 동작 |
| 설치성 | `npm install` + `.env` 1개만으로 동작, 별도 DB 서버 불필요 |
| 신뢰성 | Webhook 재시도, 중복 제출 방지, 입력값 검증 |
| 테스트성 | vitest 단위 테스트로 DB·sheets·tools 검증 가능 |
| 보안성 | `.env`/`data/` git 제외, 세션 로그에 민감정보 기록 금지 (사용자 책임) |
| 환경 | Node.js 18+ / TypeScript ESM / Windows 검증 |

## 데이터 모델

### `usage_logs` 테이블 (원시 기록)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INTEGER PK | 자동 증가 |
| email | TEXT | 사용자 이메일 |
| model | TEXT | 모델명 (예: claude-sonnet-4-6) |
| input_tokens | INTEGER | 입력 토큰 수 |
| output_tokens | INTEGER | 출력 토큰 수 |
| recorded_at | TEXT | ISO8601 기록 시각 |
| note | TEXT | 메모 (선택) |

### `submissions` 테이블 (제출 이력, F-08)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INTEGER PK | 자동 증가 |
| email | TEXT | 사용자 이메일 |
| date | TEXT | 제출 대상 날짜 (YYYY-MM-DD) |
| submitted_at | TEXT | 실제 제출 시각 |
| rows_submitted | INTEGER | 제출된 집계 행 수 |
| UNIQUE(email, date) | | 같은 날 중복 제출 방지 |

### `daily_stats` 뷰 (Google Sheets 제출 형식)

| 컬럼 | 설명 |
|------|------|
| date / email / model / input_tokens / output_tokens / total_tokens | 일별 집계 |

### 세션 로그 파일 (F-06, F-07)

`data/sessions/YYYY-MM-DD.md` — 마크다운, 누적 append. hook 자동 항목 + `log_session` 수동 항목이 시간순으로 혼재.

## 향후 확장

- 팀 단위 집계: 중앙 HTTP 서버 전환
- 자동 제출: OS 스케줄러 또는 Stop hook 통합
- 비용 환산: 모델별 토큰 단가 테이블 추가
- 세션 분석 agent: 일자별 sessions/*.md를 분석해 작업 분류 통계 생성
