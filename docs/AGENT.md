# AGENT.md — AI 에이전트 사용 가이드

이 문서는 Claude가 토큰 추적 tool을 자동으로 사용하도록 Claude Desktop에 설정하는 방법을 설명합니다.

## Claude Desktop 시스템 프롬프트 설정

**Settings → Custom Instructions** (또는 프로젝트 지침)에 아래 내용을 추가하세요.

---

### 기본 시스템 프롬프트 (복사하여 붙여넣기)

```
당신은 대화가 완전히 끝날 때마다 반드시 mcp-server의 tool을 순서대로 호출해야 합니다.

## 대화 종료 시 필수 호출 순서

1. log_session 호출 (작업 내용 기록)
   - title: 이번 대화에서 완료한 작업의 제목
   - summary: 무엇을 왜 했는지 2~4문장으로 요약
   - files_changed: 생성/수정한 파일 목록 (plan 파일 제외)
   - key_decisions: 방식 선택, 라이브러리 선택 등 주요 결정 사항.
     **plan 모드에서 결정된 아키텍처/기술 선택도 포함** (예: "Cloudflare Workers + D1 채택 (무료 티어, SQLite 호환)")
   - tags: 작업 종류 태그 (예: ["구현", "디버깅", "문서"])
     plan 파일을 작성·수정한 세션이면 "계획" 태그 추가

2. log_usage 호출 (토큰 사용량 기록)
   - model: 현재 모델명 (예: claude-sonnet-4-6)
   - input_tokens / output_tokens: 이 대화의 추정 토큰 수
   - note: 작업 종류 한 단어

## 중요 규칙
- log_session은 단순 질답이 아닌 코드 작성, 설정 변경, 문서 작성 등 실질적 작업이 있을 때만 호출
- log_usage는 모든 대화 종료 시 호출
- 매일 업무 종료 시 submit_daily_report 호출
```

---

## 토큰 수 추정 가이드

Claude는 정확한 토큰 수를 알 수 없으므로 아래 기준으로 추정합니다.

| 대화 규모 | input_tokens 추정 | output_tokens 추정 |
|-----------|------------------|--------------------|
| 짧은 Q&A (5턴 이하) | 500 ~ 2,000 | 200 ~ 800 |
| 보통 작업 (10턴) | 2,000 ~ 8,000 | 800 ~ 3,000 |
| 긴 작업 (코드, 문서) | 8,000 ~ 30,000 | 3,000 ~ 10,000 |
| 매우 긴 대화 | 30,000+ | 10,000+ |

> 정확한 수치보다 **일관된 추정**이 중요합니다. 너무 작거나 크게 추정하지 않도록 주의하세요.

---

## 워크플로우 예시

### 대화 종료 시 (자동)

```
[사용자 마지막 메시지에 응답 완료]
    ↓
log_usage 호출:
  model: "claude-sonnet-4-6"
  input_tokens: 3200
  output_tokens: 1100
  note: "코딩"
    ↓
"기록 완료 (id: 12) ..." 메시지 확인
```

### 일과 종료 시 (수동 요청)

```
사용자: "오늘 사용량 제출해줘"
    ↓
1. get_my_stats 호출 (오늘 날짜) → 통계 확인
2. submit_daily_report 호출 → Google Sheets에 전송
3. 결과 보고
```

---

## 주의사항

- `log_usage`는 실제 네트워크 호출 없이 로컬에만 저장되므로 성능 영향 없음
- `submit_daily_report`는 Webhook URL이 설정된 경우에만 외부 전송됨
- **중복 제출 자동 차단**: 같은 (email, date)로 두 번째 제출은 거부됩니다. 강제 재제출이 필요하면 `force: true` 사용
- **Webhook 재시도**: 네트워크 오류 시 지수 백오프로 3회 자동 재시도
- **민감정보 기록 금지**:
  - `log_session`의 `summary`/`files_changed`에 API 키, 내부 IP, 비밀번호, 개인정보를 포함하지 마세요
  - hook 자동 기록은 Bash 명령을 120자로 잘라 저장하지만, 그 안에 민감정보가 들어가면 그대로 기록됩니다
  - 민감 정보가 포함된 명령은 환경변수로 분리하여 실행하세요

## plan 모드 파일 처리

Claude Code의 plan 모드로 작성된 파일은 `C:\Users\kdkim2000\.claude\plans\` 에 저장됩니다.

- hook이 이 경로에 대한 Write/Edit를 `Plan(Write)` / `Plan(Edit)` 레이블로 자동 기록합니다
- `session-summarizer` 에이전트는 plan 파일을 읽어 `key_decisions`와 `summary`를 보강합니다
- plan 파일 자체는 `files_changed`에 포함하지 않습니다 (프로젝트 소스 코드가 아님)
- plan 기반 설계 결정은 실제 구현 여부와 무관하게 `key_decisions`에 기록할 수 있습니다

---

## Sub-agent 위임 (선택)

복잡한 추정/요약 작업은 `.claude/agents/` 의 sub-agent에 위임하세요:

| Sub-agent | 용도 |
|-----------|------|
| `token-estimator` | 대화 컨텍스트로부터 토큰 수 추정 |
| `session-summarizer` | 대화 + hook 로그 + plan 파일을 합쳐 `log_session` 인자 생성 |
| `report-validator` | 제출 전 통계 합리성 검증 |
