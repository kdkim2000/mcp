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

## Case D — 타 AI 코딩 도구 (Cursor, Windsurf 등)

### MCP를 지원하는 도구

아래 도구들은 MCP 프로토콜을 지원하므로 **Claude Code와 동일한 방식**으로 연결됩니다.

| 도구 | MCP 설정 파일 |
|------|--------------|
| **Cursor** | `.cursor/mcp.json` (프로젝트) 또는 `~/.cursor/mcp.json` (전역) |
| **Windsurf** | `~/.codeium/windsurf/mcp_config.json` |
| **Continue.dev** (VS Code) | `~/.continue/config.json` → `mcpServers` 배열 |
| **Zed** | `~/.config/zed/settings.json` → `context_servers` |

**Cursor 예시** (`.cursor/mcp.json`):

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

**Windsurf 예시** (`~/.codeium/windsurf/mcp_config.json`):

```json
{
  "mcpServers": {
    "mcp-server-cloud": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "https://mcp-server.kdkim2000.workers.dev",
        "--header", "Authorization: Bearer <API_KEY>"
      ],
      "env": { "MCP_API_KEY": "<API_KEY>" }
    }
  }
}
```

설정 후 해당 도구를 재시작하면 `log_usage` tool이 사용 가능해집니다.

---

### MCP를 지원하지 않는 도구 (GitHub Copilot, JetBrains AI 등)

MCP 프로토콜 없이도 **HTTP API 직접 호출**로 기록할 수 있습니다.  
MCP 서버는 표준 JSON-RPC over HTTP이므로 `curl` 한 줄로 충분합니다.

**세션 종료 후 수동 기록 (bash/zsh)**:

```bash
curl -s -X POST https://mcp-server.kdkim2000.workers.dev \
  -H "Authorization: Bearer <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0","id":1,"method":"tools/call",
    "params":{"name":"log_usage","arguments":{
      "model":"<모델명>",
      "input_tokens": 20000,
      "output_tokens": 5000,
      "note":"<작업 요약>"
    }}
  }'
```

**PowerShell (Windows)**:

```powershell
$body = '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"log_usage","arguments":{"model":"gpt-4o","input_tokens":20000,"output_tokens":5000,"note":"Cursor 작업"}}}'
Invoke-RestMethod -Uri "https://mcp-server.kdkim2000.workers.dev" `
  -Method POST `
  -Headers @{ "Authorization" = "Bearer <API_KEY>"; "Content-Type" = "application/json" } `
  -Body $body
```

> **팁**: 자주 쓴다면 shell alias나 VS Code task로 등록해두면 편합니다.
> ```bash
> alias log-tokens='curl -s -X POST https://mcp-server.kdkim2000.workers.dev \
>   -H "Authorization: Bearer <API_KEY>" -H "Content-Type: application/json" \
>   -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"log_usage\",\"arguments\":{\"model\":\"$1\",\"input_tokens\":$2,\"output_tokens\":$3,\"note\":\"$4\"}}}"'
> # 사용: log-tokens gpt-4o 15000 3000 "코드 리뷰"
> ```

---

## 회사 프록시 / 방화벽 환경

Cloudflare Workers는 표준 HTTPS(443포트)로 서빙되므로 대부분의 기업 프록시를 통과합니다.  
단, `workers.dev` 도메인이 방화벽에서 차단된 경우 아래 방법을 사용합니다.

### 방법 1 — 프록시 환경변수 설정 (가장 간단)

`mcp-remote`는 Node.js 기반이므로 표준 프록시 환경변수를 따릅니다.

**`.claude/settings.json` 또는 MCP 설정 파일에 `env` 추가**:

```json
{
  "mcpServers": {
    "mcp-server-cloud": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "https://mcp-server.kdkim2000.workers.dev",
        "--header", "Authorization: Bearer <API_KEY>"
      ],
      "env": {
        "HTTPS_PROXY": "http://proxy.company.com:8080",
        "NO_PROXY": "localhost,127.0.0.1,*.internal.company.com"
      }
    }
  }
}
```

`curl`도 동일하게 적용됩니다:

```bash
export https_proxy=http://proxy.company.com:8080
curl -s -X POST https://mcp-server.kdkim2000.workers.dev ...
```

### 방법 2 — 회사 CA 인증서 추가 (SSL 인터셉션 환경)

일부 기업은 HTTPS 트래픽을 인터셉트해 자체 CA로 재서명합니다. 이 경우 `NODE_EXTRA_CA_CERTS`로 회사 CA를 신뢰하도록 설정합니다.

```json
"env": {
  "HTTPS_PROXY": "http://proxy.company.com:8080",
  "NODE_EXTRA_CA_CERTS": "C:\\certs\\company-ca.crt"
}
```

회사 CA 인증서는 IT 부서에 요청하거나 브라우저에서 내보낼 수 있습니다.

### 방법 3 — workers.dev 도메인 차단 시: 자체 도메인 사용

Cloudflare Workers에 사용자 정의 도메인을 연결하면 내부 allowlist에 등록할 수 있습니다.

```
# Cloudflare Dashboard → Workers & Pages → mcp-server → Settings → Domains
# 예: mcp-api.yourcompany.com → mcp-server.kdkim2000.workers.dev 에 CNAME
```

이후 모든 설정에서 `workers.dev` URL 대신 사용자 정의 도메인을 사용합니다.

### 방법 4 — 완전 폐쇄망: 내부 서버 자체 배포

인터넷이 완전히 차단된 환경이라면 MCP 서버를 내부 인프라에 직접 배포합니다.

```
# Node.js + SQLite만으로 로컬 HTTP 서버 실행 가능 (D1 불필요)
npm run dev  # stdio 모드 또는 http 모드로 직접 실행
```

자세한 절차는 [DEPLOY.md](./DEPLOY.md)를 참고하세요.

---

## 도구별 지원 요약

| 도구 | MCP 지원 | 연결 방법 |
|------|---------|----------|
| Claude Desktop | ✅ 네이티브 | `claude_desktop_config.json` |
| Claude Code | ✅ 네이티브 | `.claude/settings.json` |
| Cursor | ✅ (0.43+) | `.cursor/mcp.json` |
| Windsurf | ✅ | `~/.codeium/windsurf/mcp_config.json` |
| Continue.dev | ✅ | `~/.continue/config.json` |
| Zed | ✅ | `~/.config/zed/settings.json` |
| GitHub Copilot | ❌ | HTTP API 직접 호출 (curl/PowerShell) |
| JetBrains AI | ❌ | HTTP API 직접 호출 |
| 기타 도구 | 모름 | MCP 설정 있으면 Case A와 동일, 없으면 curl |

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
