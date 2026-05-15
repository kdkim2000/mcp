# CONNECT.md — 타 프로젝트 / 타 PC 연결 가이드

이미 배포된 MCP 서버(`https://mcp-server.kdkim2000.workers.dev`)에  
새 프로젝트나 새 PC를 연결하는 방법을 설명합니다.  
서버 재배포는 필요 없습니다.

---

## 준비물

| 항목 | 값 |
|------|----|
| Workers URL | `https://mcp-server.kdkim2000.workers.dev` |
| API Key | 관리자(kdkim2000)에게 요청 |
| 프리컨디션 | Node.js 18+ 설치 |

---

## Case A — 같은 PC의 다른 Claude Code 프로젝트

### 1. `CLAUDE.md`에 서버 정보 추가

프로젝트 루트의 `CLAUDE.md` (없으면 생성):

```markdown
## Token Logging

대화가 끝날 때마다 **mcp-server-cloud** 서버의 `log_usage` tool을 호출하세요.

- model: 현재 대화 모델명 (예: claude-sonnet-4-6)
- input_tokens / output_tokens: 이번 대화 추정 토큰 수
- note: 작업 내용 한 줄 요약 (선택)
```

### 2. `.claude/settings.json`에 MCP 서버 등록

프로젝트의 `.claude/settings.json`:

```json
{
  "mcpServers": {
    "mcp-server-cloud": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "https://mcp-server.kdkim2000.workers.dev",
        "--header", "Authorization: Bearer <API_KEY>"
      ]
    }
  }
}
```

> **보안**: `<API_KEY>`를 파일에 직접 쓰는 대신 환경변수로 분리하려면:
> ```json
> "env": { "MCP_API_KEY": "<API_KEY>" }
> ```
> 그리고 `--header` 값을 `"Authorization: Bearer ${MCP_API_KEY}"`로 변경.  
> `.claude/settings.json`은 `.gitignore`에 추가하거나 `settings.local.json`에 작성 권장.

### 3. 연결 확인

Claude Code를 열고:
```
사용 가능한 MCP 서버 확인해줘
```
→ `mcp-server-cloud`의 `log_usage`, `get_my_stats` 등이 보이면 완료.

---

## Case B — 다른 PC의 Claude Desktop

### Windows

`%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-server-cloud": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "https://mcp-server.kdkim2000.workers.dev",
        "--header", "Authorization: Bearer <API_KEY>"
      ]
    }
  }
}
```

### macOS / Linux

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-server-cloud": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "https://mcp-server.kdkim2000.workers.dev",
        "--header", "Authorization: Bearer <API_KEY>"
      ]
    }
  }
}
```

Claude Desktop 재시작 → 채팅창 하단 망치(🔨) 아이콘에서 tool 목록 확인.

---

## Case C — 다른 PC의 Claude Code

`~/.claude/settings.json` (전역) 또는 프로젝트 `.claude/settings.json`:

```json
{
  "mcpServers": {
    "mcp-server-cloud": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "https://mcp-server.kdkim2000.workers.dev",
        "--header", "Authorization: Bearer <API_KEY>"
      ]
    }
  }
}
```

---

## 자동 토큰 기록 설정

### Claude Desktop — Custom Instructions

**Settings → Custom Instructions**에 추가:

```
대화가 완전히 끝날 때마다 아래를 순서대로 실행하세요.

1. mcp-server-cloud의 log_usage 호출
   - model: 이번 대화 모델명
   - input_tokens: 추정 입력 토큰
   - output_tokens: 추정 출력 토큰
   - note: 작업 내용 한 줄 요약

추정 기준:
- 짧은 Q&A (5턴 이하): input 500~2,000 / output 200~800
- 보통 작업 (10턴): input 2,000~8,000 / output 800~3,000
- 긴 코드 작업: input 8,000~30,000 / output 3,000~10,000
```

### Claude Code — CLAUDE.md 자동 트리거

프로젝트 `CLAUDE.md`에 추가:

```markdown
## 세션 종료 시 필수 작업

대화가 끝나면 반드시 mcp-server-cloud의 log_usage를 호출하세요.
모델: claude-sonnet-4-6 (또는 실제 모델명)
토큰 추정이 불확실하면 token-estimator sub-agent에 위임하세요.
```

---

## 연결 테스트

### 1. 상태 확인 (인증 없이)

```bash
curl https://mcp-server.kdkim2000.workers.dev \
  -H "Authorization: Bearer <API_KEY>"
# → {"status":"ok","server":"mcp-server"}
```

### 2. 토큰 기록 테스트

```bash
curl -s -X POST https://mcp-server.kdkim2000.workers.dev \
  -H "Authorization: Bearer <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"log_usage","arguments":{"model":"claude-sonnet-4-6","input_tokens":1000,"output_tokens":200,"note":"연결 테스트"}}}'
# → {"result":{"content":[{"type":"text","text":"기록 완료 (id: N)\n..."}]}}
```

### 3. 기록 조회 테스트

```bash
curl -s -X POST https://mcp-server.kdkim2000.workers.dev \
  -H "Authorization: Bearer <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_my_stats","arguments":{"limit":5}}}'
```

### 4. 대시보드 확인

브라우저: `https://mcp-server.kdkim2000.workers.dev/dashboard`  
→ API Key 입력 → 방금 기록한 데이터 확인.

---

## 사용 가능한 Tool 목록

| Tool | 설명 | 필수 파라미터 |
|------|------|--------------|
| `log_usage` | 토큰 사용량 기록 | `model`, `input_tokens`, `output_tokens` |
| `get_my_stats` | 날짜별 통계 조회 | — (선택: `date`, `limit`) |
| `submit_daily_report` | Google Sheets 제출 | — |
| `log_session` | 세션 작업 내용 기록 | `title`, `summary` |
| `echo` | 연결 테스트 | `message` |

---

## 자주 묻는 질문

**Q. 여러 사람이 같은 서버를 공유할 수 있나요?**  
A. 가능합니다. `log_usage` 호출 시 `email` 파라미터로 사용자를 구분합니다. 기본값은 서버에 등록된 `DEFAULT_USER_EMAIL`입니다. 다른 사용자로 기록하려면:
```json
{ "email": "other@email.com", "model": "...", "input_tokens": 0, "output_tokens": 0 }
```

**Q. API Key는 어디서 확인하나요?**  
A. 서버 관리자(kdkim2000)에게 요청하거나, 직접 서버를 배포했다면 `wrangler secret put API_KEY`로 설정한 값을 사용합니다.

**Q. `mcp-remote`가 없다고 오류가 나요.**  
A. `-y` 플래그로 자동 설치됩니다. 수동 설치:
```bash
npm install -g mcp-remote
```

**Q. 로컬 SQLite 데이터와 D1이 다릅니다.**  
A. 로컬 stdio 서버(`src/index.ts`)는 SQLite에만, 클라우드 서버(`workers.dev`)는 D1에만 기록합니다. 두 DB는 자동 동기화되지 않습니다. 대시보드는 D1 데이터만 표시합니다.
