# Handoff: Token Usage Dashboard (OPUS-X)

> MCP 서버의 토큰 사용량을 보여주는 단일 페이지 대시보드.
> Samsung SDS **OPUS-X Design System (v1.1.3)** 기반.

---

## ⚠ About the design files (READ FIRST)

The files inside **`design_reference/`** are **design references** — interactive
HTML/CSS/JSX prototypes that show the intended look, behavior, and exact
tokens. They are **not production code to copy verbatim.**

The implementation task is to **recreate these designs in the target
codebase's existing environment** (React/Next.js, Vue, SwiftUI, native iOS/Android,
etc.) using its established patterns, component library, and design tokens.
If no environment exists yet, choose the most appropriate framework and
implement there.

When the target codebase already has its own design system, **map the OPUS-X
tokens listed in `TOKENS.md` onto the equivalent in-house tokens** instead of
inlining hex codes. Where the codebase lacks an equivalent (e.g. the
`--bg-canvas` `#F8F9FC` page surface), introduce the missing token rather
than scattering hardcoded colors.

---

## Fidelity

**High-fidelity (hi-fi).** Pixel-perfect mockups with final colors, typography,
spacing, radii, shadows, and interactions. Recreate pixel-perfectly using the
codebase's component library.

The prototype uses **mock data** (seeded RNG, deterministic). Replace with the
real MCP server's stats endpoints in production — the data **shape** is
documented in [Data model](#data-model).

---

## Scope

Two screens, gated by an API-Key submit:

| # | Screen | Trigger | File path inside prototype |
|---|---|---|---|
| 1 | **API-Key Gate** (empty state) | No key in `localStorage["opusx.mcp.apikey"]` | `Gate` component in `app.jsx` |
| 2 | **Dashboard** | Key present | `Dashboard` component in `app.jsx` |

Out of scope (intentionally not designed — confirm before adding):
- Multi-tenant org switcher
- Settings / billing pages
- Per-key drill-down
- Push notifications / webhooks

---

## Locale (KO + EN)

Bilingual. **Korean is the primary locale.** English copy is provided for every
string. The toggle persists per-user.

- Source-of-truth string table: `app.jsx → const STR = { ko: {...}, en: {...} }`
- All strings — including KPI labels, button copy, status badges, table headers,
  pager info, empty-state copy — must come from this table. Don't hardcode.

---

## Theme (light + dark)

Light is default. Dark mode is a re-skin of **context tokens only** — seed
palette (purple/blue/green/etc.) stays the same. See `TOKENS.md` for the full
context-token override table.

Implementation: set `data-theme="dark"` on `<html>` (or root). All semantic
tokens flip; no per-component overrides needed.

---

# 1 · Design System Foundation

This dashboard is built on **OPUS-X v1.1.3** (Samsung SDS internal). The full
token system is reproduced in `design_reference/tokens.css`; key tokens are
catalogued in `TOKENS.md`.

| Foundation | Value |
|---|---|
| **Primary brand color** | Purple — `--purple-600` `#6941C6` base, `--purple-500` `#7F56D9` accent, `--purple-700` `#53389E` hover |
| **Neutral** | Gray Modern. `--gray-900 #101828` (ink) → `--gray-25 #FCFCFD` |
| **Status** | Success `--green-600`, Warning `--yellow-700`, Error `--red-600`, Info `--blue-600` |
| **Page surface** | `--bg-canvas` `#F8F9FC` (light), `#0F1117` (dark) |
| **Card surface** | `--bg-base` `#fff` (light), `#161A24` (dark) |
| **Card radius** | `--radius-xl` 12px |
| **Card border** | `1px solid --border-subtle` (`--gray-200` / `#222838` dark) |
| **Card shadow** | `--shadow-sm` |
| **Sans typeface** | `"Noto Sans KR", "Noto Sans"` (KO+EN co-located Pan-CJK) |
| **Display typeface** | `"Sora"` (open substitute for the proprietary Samsung Sharp Sans) — used **only** for the OPUS-X wordmark + brand mark |
| **Mono typeface** | `"Roboto Mono"` — code tokens, timestamps, numerics |
| **Type scale** | h2 30/40 · h3 24/32 · h5 16/20 · md 14/20 (body) · sm 12/16 · xs 10/16 |
| **Spacing** | 4-pt grid (4/8/12/16/24/32) |
| **Motion** | fast 120ms · medium 200ms · slow 320ms · `cubic-bezier(.2,0,0,1)` standard ease |
| **Focus ring** | `--ring-primary` 4px halo (`rgba(127,86,217,.24)`) |

---

# 2 · Screen 1: API-Key Gate

**File:** `design_reference/app.jsx → function Gate(...)`
**Live preview:** open `Token Usage Dashboard.html` with `localStorage` empty.

## Purpose

Block access to the dashboard until the user supplies an API Key. Key is
stored **only in browser `localStorage`** — never sent to any third party.

## Layout

- Full-viewport (`min-height: 100vh`), centered grid (`display: grid; place-items: center`).
- Background `--bg-canvas`, with two **decorative radial blurs** (purple top-left + blue bottom-right) at `filter: blur(80px); opacity: .35`. In dark mode opacity drops to `.18 / .14`. These are pseudo-elements on `.gate`.
- Card: 480px wide, `--radius-2xl` (16px), `--shadow-xl`, padding 40px, `--bg-base`.

## Top-right toggles (also shown on the gate)

Absolutely positioned at `top:20px; right:24px`:

- **Locale segmented control** — KO/EN, segmented switch (`.seg`)
- **Theme icon-button** — sun/moon toggle (`.icon-btn`, 36×36)

These keep the gate accessible in both languages and themes.

## Card contents (top → bottom)

| Element | Spec |
|---|---|
| **Brand mark** | 48×48 rounded square, `border-radius: 12px`, linear-gradient(135deg, `--purple-500` → `--purple-700`). Contains the letter **"X"** in `Sora 800 22/1`. |
| **Eyebrow** | KO: `"MCP SERVER"` · EN: `"MCP SERVER"`. `font-mono 500 12/16`, color `--purple-600` / `--purple-300` (dark). Uppercase, letter-spacing `.06em`. |
| **Title** | KO: `"API Key 입력"` · EN: `"Enter API Key"`. `font-sans 700 24/32`, color `--gray-900`. |
| **Body** | KO: `"MCP 서버에 접근하기 위한 API Key를 입력하세요. 입력값은 브라우저 localStorage에만 저장됩니다."` · EN: `"Provide an API Key to access the MCP server. The value is stored only in this browser's localStorage."` `font-sans 400 14/22`, color `--gray-500`. |
| **Field label** | `font-sans 500 12/16`, color `--gray-700`. Text: `"API Key"` (both locales). |
| **Input** | 44px tall, `--radius-md` (6px), 1px `--border-neutral`, `--shadow-xs`. Contains: leading `key-round` icon (lucide, 18px, `--gray-400`), `<input type="password">` (`font-mono 500 14/20`), trailing `eye / eye-off` reveal button (`.reveal`). Focus state: border `--purple-500` + `--ring-primary` halo. |
| **Help row** | `shield-check` icon 14px + KO/EN copy. `font-sans 400 12/18`, color `--gray-500`. |
| **Actions row** | Left: text link "키가 없으신가요? **Demo**" (clicking it injects a demo key and proceeds). Right: **`접속 / Connect`** primary button (`.btn.primary.lg`, 44px, with `arrow-right` trailing icon). Button is disabled (`opacity: .55`, `cursor: not-allowed`) until input is non-empty. |
| **Footnote** | Absolutely positioned at `bottom: 24px`, centered. KO/EN: `"OPUS-X · v1.0 · Samsung SDS"`. `font-mono 400 11/16`, color `--gray-400`. |

## Interactions

- **Submit triggers**: Enter key inside the input, or click `접속/Connect`, or click the Demo link.
- **Reveal toggle** swaps `<input type>` between `password` and `text`; icon swaps `eye ↔ eye-off`.
- On submit: `localStorage.setItem("opusx.mcp.apikey", value)`, route to dashboard. No network call in the prototype — wire to your auth endpoint in production.

---

# 3 · Screen 2: Dashboard

**File:** `design_reference/app.jsx → function Dashboard(...)`

Layout: **Top bar** (sticky, 64px) → **Page** (max-width 1280px, `padding: 32px 32px 80px`) containing the page header, KPI row, charts row, and table.

## 3.1 — Top bar (`.topbar`)

Sticky, 64px tall, `--bg-base`, 1px bottom border `--border-subtle`, `padding: 0 32px`.

Left → right:

1. **Brand cluster**
   - `.brand-mark` — 28×28 rounded-square (radius 8px), purple gradient, white **"X"** in Sora 800/14.
   - `.brand-name` — `"OPUS-X"`, Sora 700 16/20.
   - Slash separator `--gray-300`.
   - `.brand-product` — `"Token Usage Dashboard"`, Noto-Sans 500 14/20, `--gray-600`.
2. Spacer (flex: 1).
3. **Connection status pill** (`.topbar-status`) — pill on `--bg-subtle`, 1px `--border-subtle`, contains:
   - 6px green dot (`--green-500`) with 3px halo (`--bg-success-tint`).
   - `"연결됨 / Connected"` label, then `· sk-mcp••••2f7a` (masked key).
   - Font: Roboto-Mono 500 12/16, `--gray-500`.
4. **Locale segmented switch** — KO/EN (`.seg`). Active = white pill + shadow-xs.
5. **Theme icon button** — `moon` (in light mode) / `sun` (in dark) — 36×36 icon button.
6. **Logout icon button** — `log-out` lucide — 36×36, clears `localStorage` and returns to gate.

## 3.2 — Page header

```
┌────────────────────────────────────────────────────────────┐
│ Token Usage Dashboard                       [↓ Export]      │
│ MCP 토큰 사용량 대시보드 · 2026-04-16 → 2026-05-15 KST  [↻ 갱신] │
└────────────────────────────────────────────────────────────┘
```

- Title: `.page-title` — h2 token (30/40, `--gray-900`, letter-spacing `-.01em`).
- Subtitle: `.page-sub` — `font-sans 400 14/22`, `--gray-500`. The date range is wrapped in `.mono` (Roboto-Mono 12).
- Actions, right-aligned:
  - **Export** — outline button (`.btn.outline.md`), leading `download` icon.
  - **Refresh** — primary button (`.btn.primary.md`), leading `refresh-cw` icon.

## 3.3 — KPI row (3 cards)

3-column grid, `gap: 16px`, `margin-bottom: 20px`. Each card:

```
┌──────────────────────────────────┐
│ [⚡] Today                        │  ← .kpi-label (28×28 tint icon + label)
│                                  │
│ 612K  tokens                     │  ← .kpi-value (h2-equivalent 36/44, tabular-nums)
│ ╲___╱╲╱╲___╱  (sparkline)        │  ← .spark (width:100%, height:36)
│                                  │
│ [▲ +4.2%]      어제 대비           │  ← .kpi-meta (delta pill + foot)
└──────────────────────────────────┘
```

| Card | Label icon (lucide) | Icon tint | Sparkline color | Delta | Foot |
|---|---|---|---|---|---|
| **Today** | `zap` | `--purple-600` on `--bg-primary-tint` | `#7F56D9` (purple-500) | `(today - yesterday)/yesterday` (computed) | `"어제 대비" / "vs yesterday"` |
| **This month** | `calendar` | `--green-600` on `--bg-success-tint` | `#039855` (green-600) | `+18.4%` (mock — wire to real) | `"지난 달 대비" / "vs last month"` |
| **All-time** | `layers` | `--blue-600` on `--bg-info-tint` | `#1570EF` (blue-600) | `"124 활성 키" / "124 active keys"` w/ `users` icon | `"서비스 시작 이후" / "since launch"` |

Card spec:
- `--bg-base` + 1px `--border-subtle` + `--radius-xl` (12px) + `--shadow-sm`.
- Padding: `22px 24px 20px`.
- `.kpi-value` formats numbers with **K/M/B suffixes** (`fmtNum` helper) and uses `font-variant-numeric: tabular-nums`.
- `.unit` (`"tokens"`) is Roboto-Mono 500 14/20 in `--gray-400`.
- `.kpi-delta` is a pill: `+N.N%` mono on `--bg-success-tint` (up) / `--bg-error-tint` (down), with `trending-up` / `trending-down` icon.
- `.kpi-foot` is `font-mono 400 11/16`, `--gray-400`.

## 3.4 — Charts row

2-column grid (1.65fr / 1fr), `gap: 20px`. Collapses to single column under 1100px.

### 3.4a — Daily usage area chart (left, large)

Card with `.card-head` showing:
- Title `"일별 사용량" / "Daily usage"` + sub `"최근 30일 · 입력 + 출력 토큰" / "Last 30 days · input + output tokens"`.
- Right: range chip-row — `7 d / 14 d / 30 d`. Active chip: `--bg-primary-tint` + `--purple-700` text.

Legend (`.chart-legend`) below the head: purple square = `"전체 토큰 / Total tokens"`, blue square = `"입력 토큰 / Input tokens"`.

Chart body (`AreaChart` component in `charts.jsx`):
- **Two stacked-ish areas**: total (purple) on the back, input-only (blue) on the front, both rendered as cardinal-spline smoothed paths with linear vertical gradients (`stop` 0% at .30/.22 opacity → 0% bottom).
- 800×260 viewBox, padding `l:56 r:16 t:16 b:36`.
- Y-axis: 5 gridlines (0/25/50/75/100% of rounded max), tick labels in Roboto-Mono 11.
- X-axis: ~6 evenly-spaced date labels (`MM/DD`).
- **Hover**: vertical dashed crosshair + two colored dots (`r=5` for total, `r=4` for input). HTML tooltip floats above with full date, total token count, then per-series breakdown.

### 3.4b — Model breakdown donut (right)

Card with title `"모델별 비율" / "By model"` + sub `"이번 달 사용량 기준" / "Share of usage this month"`.

Two-column body (180px donut + flex-column list).

**DonutChart** (`charts.jsx`):
- 180×180 viewBox, radius 76, stroke-width 22. Inner background ring on `--border-subtle`.
- Each slice = `<circle>` with computed `stroke-dasharray` rotated by accumulated angle. Starts at -90° (top).
- Center label: total number (Noto-Sans 700 22/26, tabular-nums) + label `"tokens"` (mono 11).

**Donut list** — one row per model:
- 10×10 colored square + model id (Roboto-Mono 12, `--gray-800`) + percentage (Roboto-Mono 600 13, tabular-nums).

Model palette (must match donut slices ↔ table dot colors ↔ list squares):

| Model id | Hex | Token (semantic) |
|---|---|---|
| `claude-3-5-sonnet` | `#7F56D9` | `--purple-500` |
| `claude-3-5-haiku`  | `#2E90FA` | `--blue-500` |
| `claude-3-opus`     | `#15B79E` | `--teal-500` |
| `claude-3-haiku`    | `#EAAA08` | `--yellow-500` |

## 3.5 — Recent calls table

Card containing card-head, toolbar, table, footer pager.

### Card head
- Title `"상세 기록" / "Recent calls"` + sub `"최근 호출 · <count>" / "Detailed log · <count>"`.
- Right: filter chip-row — `전체/성공/지연/오류` · `All/OK/Slow/Error`. Active chip uses the same `--bg-primary-tint` style as the chart range chips.

### Toolbar (`.table-toolbar`)
- **Search box** (`.search`) — max-width 360px, 36px tall, `--bg-subtle` background, leading `search` icon. Placeholder localized: `"요청 ID, 모델, 도구로 검색…"` / `"Search request id, model, tool…"`. Focus state: bg → `--bg-base`, border → `--purple-500`, ring-primary halo.
- Result count (KO: `"<N>건"` / EN: `"<N> results"`), `font-mono 12 / --gray-500`.
- Spacer.
- Two outline `sm` buttons: **`필터/Filters`** (`sliders-horizontal` icon) and **`정렬/Sort`** (`arrow-up-down` icon).

### Table (`.table`)
Columns:
1. **시간 / Time** — two-line cell: timestamp `MM-DD HH:mm` (Roboto-Mono 12, `--gray-500`) + request id `req_<hex>` (Roboto-Mono 11, `--gray-500`).
2. **모델 / Model** — colored 8×8 square (matches the donut palette) + model id in mono 12.
3. **도구 / Tool** — MCP tool name, mono 12.
4. **입력 / Input** — number, right-aligned, `toLocaleString()`, mono 13, tabular-nums.
5. **출력 / Output** — same treatment as input.
6. **비용 / Cost** — `$N.NN` (or `$N.NNNN` if < $1). Right-aligned.
7. **상태 / Status** — pill badge (`success/warning/error`) with a 5px dot. Labels localized.

Table chrome:
- Header bg `--bg-subtle`, font 600 12/16 `--gray-500`, letter-spacing `.02em`.
- Row hover bg `--bg-subtle`.
- Row separators `--border-subtle`.
- Empty state row: `"조건에 맞는 기록이 없습니다." / "No matching records."` centered, `--gray-400`, padding 48.

### Footer / pager
- Left: `1–8 / 총 N건` (KO) / `1–8 of N` (EN).
- Right: pager — prev (`chevron-left`), numbered pages (active uses `--bg-primary-tint` + `--purple-200` border), next (`chevron-right`). Each cell 30×30, `--radius-md`.

---

# 4 · State management

Suggested state shape (mirrors the prototype):

```ts
type Lang   = 'ko' | 'en';
type Theme  = 'light' | 'dark';
type Range  = 7 | 14 | 30;
type Filter = 'all' | 'ok' | 'warn' | 'err';

interface AppState {
  apiKey: string | null;       // localStorage["opusx.mcp.apikey"]
  lang: Lang;                  // persisted
  theme: Theme;                // persisted

  // dashboard-local
  range: Range;
  query: string;
  filter: Filter;
  page: number;                // 1-indexed
}
```

**State transitions / triggers**

| Trigger | Effect |
|---|---|
| Gate submit (Enter / button) | `apiKey = value`, write localStorage, route to dashboard |
| Logout button (top-bar) | `apiKey = null`, clear localStorage, route to gate |
| Locale segment click | `lang` flips, all strings re-render from `STR[lang]` table |
| Theme button click | `theme` flips, sets `<html data-theme="dark">` |
| Range chip click | `range` updates, `setPage(1)`, area chart re-slices |
| Search input change | `query` updates, table re-filters, `setPage(1)` |
| Filter chip click | `filter` updates, table re-filters, `setPage(1)` |
| Pager prev/next/number | `page` updates, clamped to `[1, totalPages]` |

**Derived values**
- `todayTotal = DAILY[-1].in + DAILY[-1].out`
- `yestTotal  = DAILY[-2].in + DAILY[-2].out`
- `monthTotal = sum(DAILY[*].in + DAILY[*].out)`
- `dayDelta  = (todayTotal - yestTotal) / yestTotal * 100`
- `filteredRows = ROWS.filter(matches filter + query)`
- `totalPages = ceil(filteredRows.length / 8)`

---

# 5 · Data model

The prototype runs on seeded mock data. In production, replace `DAILY`,
`MODELS`, and `ROWS` with API responses of this shape:

```ts
// GET /api/usage/daily?range=30
type DailyPoint = {
  label: string;       // "MM/DD" for axis
  fullLabel: string;   // "YYYY-MM-DD" for tooltip
  in:  number;         // input tokens
  out: number;         // output tokens
};

// GET /api/usage/models?period=current-month
type ModelShare = {
  id:    string;       // "sonnet" | "haiku5" | "opus" | "haiku"
  label: string;       // "claude-3-5-sonnet"
  color: string;       // hex from palette (see model palette table)
  value: number;       // total tokens this period
};

// GET /api/usage/calls?page=1&pageSize=8&filter=all&q=
type CallRow = {
  id:     string;      // "req_<hex>"
  time:   string;      // ISO 8601 (UTC)
  model:  ModelShare;  // or just { id, label }
  tool:   string;      // MCP tool name
  in:     number;
  out:    number;
  cost:   number;      // USD
  status: { id: 'ok' | 'warn' | 'err'; tone: 'success' | 'warning' | 'error' };
};
```

Cost is **computed client-side** in the prototype (`(in + out)/1000 * perKModel`) — move to the server in production so pricing is single-source-of-truth.

---

# 6 · Interactions & motion

| Surface | Behavior |
|---|---|
| All hover states | Color/background change only — **never opacity, never transform**. `transition: <prop> 120ms cubic-bezier(.2,0,0,1)` |
| Buttons | Hover = darker shade (`--purple-600 → --purple-700`); pressed = same direction one stop further; disabled = `--purple-300` + `opacity: .4` |
| Chips (range/filter) | Inactive → hover bg `--bg-subtle`. Active = `--bg-primary-tint` + `--purple-700` text |
| Input focus | Border `--purple-500` + 4px `--ring-primary` halo |
| Area-chart hover | Dashed vertical crosshair + circle markers + HTML tooltip (200ms fade) |
| Theme switch | `<html data-theme>` swap; CSS context tokens re-resolve. `transition: background 200ms` on body |
| Card entrance | Subtle 200ms fade-in (optional; not in prototype) |

**Strictly avoid:** scale transforms, bounce, spring physics, drop-shadow on hover, gradient backgrounds (except the brand mark and the gate's decorative blurs).

---

# 7 · Accessibility

- All icon-only buttons need `aria-label` (`"toggle theme"`, `"logout"`, `"prev"`, `"next"`, `"toggle visibility"`).
- Locale switch: role `group`, each option `aria-pressed`.
- Filter chips: role `tablist` + `tab` with `aria-selected`.
- Status pill in topbar: include "Connected" text — the dot alone isn't sufficient.
- API key input: `type="password"` by default, `autocomplete="off"`, `spellcheck=false`.
- Color contrast: every body-text on `--bg-base` and `--bg-canvas` clears WCAG AA in both light and dark themes.
- Keyboard: gate's submit on Enter; tab order goes through locale/theme → input → reveal → demo link → connect.

---

# 8 · Assets & dependencies

| Used in prototype | Production guidance |
|---|---|
| **Lucide** icons via CDN | If your codebase already has icons (Phosphor, Heroicons, internal OPUS-X sprite), swap to those. Icon names referenced: `zap, calendar, layers, users, trending-up, trending-down, refresh-cw, download, log-out, sun, moon, search, sliders-horizontal, arrow-up-down, chevron-left, chevron-right, key-round, eye, eye-off, shield-check, arrow-right` |
| **Google Fonts**: Noto Sans KR, Noto Sans, Roboto Mono, Sora | If the org has Samsung Sharp Sans licensed, swap into `--font-display`. Pan-CJK Noto must stay — it's the OPUS-X canonical face |
| **Charts**: hand-rolled inline SVG (`charts.jsx`) | OK to keep hand-rolled (no chart library), or substitute with **Recharts / Visx / ECharts** matching the spec in §3.4. Keep palette + curve smoothing + tooltip behavior |
| **Mock data**: seeded RNG in `app.jsx` | Delete, wire to real endpoints (§5) |
| **localStorage key**: `opusx.mcp.apikey` | Keep the namespace; or migrate to `httpOnly` cookie + session if your auth allows |

No images required — the brand mark is rendered with CSS gradient + a single
Sora glyph.

---

# 9 · Files in this bundle

```
design_handoff_token_usage_dashboard/
├── README.md                       ← this file
├── TOKENS.md                       ← full OPUS-X token map (light + dark)
└── design_reference/
    ├── Token Usage Dashboard.html  ← entry point — open this in a browser
    ├── tokens.css                  ← OPUS-X foundation tokens (color, type, spacing, …)
    ├── dashboard.css               ← page + component styles
    ├── app.jsx                     ← React app: Gate + Dashboard, i18n table, mock data
    ├── charts.jsx                  ← AreaChart, DonutChart, Sparkline (inline SVG)
    └── tweaks-panel.jsx            ← prototype-only tweak panel (KO/EN, light/dark) — drop in production
```

To preview locally: serve the `design_reference/` folder over any static server
(`python3 -m http.server`, `npx serve`, etc.) and open `Token Usage Dashboard.html`.
React/Babel/Lucide load from CDN.

---

# 10 · Implementation checklist

- [ ] Token layer: import OPUS-X tokens (or map to in-house equivalents — see `TOKENS.md`)
- [ ] Wire fonts (Noto Sans KR + Noto Sans + Roboto Mono + Sora display)
- [ ] Implement light/dark via `data-theme` attribute on `<html>`
- [ ] Build i18n string table from `STR` in `app.jsx`; wire to your i18n lib (i18next, formatjs, etc.)
- [ ] **Gate screen** — full-bleed centered card, key persisted in localStorage (or your auth)
- [ ] **Top bar** — sticky, brand cluster + status pill + locale + theme + logout
- [ ] **Page header** — title/sub + export/refresh
- [ ] **KPI cards** — 3 cards with sparklines (full-width, between value and meta)
- [ ] **Area chart** — input + total stacked, range chips, hover tooltip
- [ ] **Donut chart** — 4 model slices, center total, side list
- [ ] **Table** — search/filter chips/columns/pager
- [ ] Hook up real endpoints (§5)
- [ ] A11y pass (§7)
- [ ] Cross-check pixel-perfect vs `Token Usage Dashboard.html`

---

**Questions / clarifications?** Reach the OPUS-X design system maintainers at
`opus_sds@samsung.com`, and reference the prototype in `design_reference/`.
