# DEPLOY.md — Cloudflare Workers + D1 배포 가이드

## 사전 준비

```powershell
# devDependencies 설치
npm install

# Cloudflare 로그인 (브라우저 인증)
npx wrangler login
```

## Step 1 — D1 데이터베이스 생성

```powershell
npx wrangler d1 create mcp-usage
```

출력된 `database_id`를 `wrangler.toml`에 붙여넣기:

```toml
[[d1_databases]]
binding      = "DB"
database_name = "mcp-usage"
database_id  = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"   # ← 여기
```

## Step 2 — 스키마 적용

```powershell
# 원격 D1에 적용
npm run migrate:remote

# (선택) 로컬 개발용 D1에도 적용
npm run migrate:local
```

## Step 3 — 시크릿 등록

```powershell
npx wrangler secret put API_KEY            # 임의의 긴 문자열 (예: openssl rand -hex 32)
npx wrangler secret put DEFAULT_USER_EMAIL # kdkim2000@samsung.com
npx wrangler secret put SHEETS_WEBHOOK_URL # https://script.google.com/macros/s/.../exec
```

## Step 4 — (선택) 기존 데이터 이관

로컬 SQLite 데이터를 D1으로 복사:

```powershell
# SQLite 덤프
sqlite3 data/usage.db ".dump usage_logs submissions" > dump.sql

# D1 원격에 적용
npx wrangler d1 execute mcp-usage --remote --file=dump.sql
```

## Step 5 — 로컬 개발 테스트

```powershell
# .dev.vars 에 로컬 시크릿 작성 후 (이미 생성됨)
npm run dev:worker
# → http://localhost:8787 에서 서버 실행
```

테스트 요청:

```powershell
curl -s -X POST http://localhost:8787 `
  -H "Authorization: Bearer dev-local-key" `
  -H "Content-Type: application/json" `
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

## Step 6 — 배포

```powershell
npm run deploy
# → https://mcp-server.<account>.workers.dev
```

배포 확인:

```powershell
curl -s https://mcp-server.<account>.workers.dev `
  -H "Authorization: Bearer <API_KEY>"
# {"status":"ok","server":"mcp-server"}
```

## Step 7 — Claude Desktop 멀티 디바이스 연결

`%APPDATA%\Claude\claude_desktop_config.json` 또는 `~/Library/Application Support/Claude/claude_desktop_config.json`:

```jsonc
{
  "mcpServers": {
    "mcp-server-local": {
      "command": "npx",
      "args": ["tsx", "E:\\apps\\mcp\\src\\index.ts"]
    },
    "mcp-server-cloud": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "https://mcp-server.<account>.workers.dev",
        "--header", "Authorization: Bearer ${MCP_API_KEY}"
      ],
      "env": { "MCP_API_KEY": "your-api-key-here" }
    }
  }
}
```

다른 디바이스(노트북, 모바일 등)에는 `mcp-server-cloud`만 등록.

## 운영

| 작업 | 명령 |
|------|------|
| 실시간 로그 | `npm run tail` |
| D1 쿼리 | `npx wrangler d1 execute mcp-usage --remote --command "SELECT * FROM daily_stats"` |
| D1 백업 | `npx wrangler d1 export mcp-usage --remote --output=backup-$(date +%F).sql` |
| API 키 교체 | `npx wrangler secret put API_KEY` → 각 디바이스 config 갱신 |
| 배포 상태 | Cloudflare Dashboard → Workers & Pages |

## 무료 티어 한도 (2026 기준)

| 리소스 | 무료 | 개인 예상 |
|--------|------|----------|
| Workers 요청 | 100,000/일 | < 500/일 |
| D1 읽기 | 5,000,000 rows/일 | 수십 회/일 |
| D1 쓰기 | 100,000 rows/일 | < 100/일 |
| D1 저장소 | 5 GB | < 10 MB |
