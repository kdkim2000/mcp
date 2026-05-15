/* app.jsx — Token Usage Dashboard (OPUS-X)
   Bilingual KO + EN, light/dark, mock data, API-key gate. */

const { useState, useEffect, useMemo } = React;

/* ───── i18n ───── */
const STR = {
  ko: {
    product: "Token Usage Dashboard",
    productSub: "MCP 토큰 사용량 대시보드",
    // Gate
    gateEyebrow: "MCP SERVER",
    gateTitle: "API Key 입력",
    gateBody: "MCP 서버에 접근하기 위한 API Key를 입력하세요. 입력값은 브라우저 localStorage에만 저장됩니다.",
    gateLabel: "API Key",
    gatePlaceholder: "sk-mcp-…",
    gateHelp: "키는 이 브라우저에만 저장되며 외부로 전송되지 않습니다.",
    gateConnect: "접속",
    gateNoKey: "키가 없으신가요?",
    gateFootnote: "OPUS-X · v1.0 · Samsung SDS",
    // Top
    connected: "연결됨",
    refresh: "갱신",
    export: "내보내기",
    // KPI
    today: "오늘",
    thisMonth: "이번 달",
    cumulative: "전체 누적",
    vsYesterday: "어제 대비",
    vsLastMonth: "지난 달 대비",
    sinceStart: "서비스 시작 이후",
    // Charts
    dailyTitle: "일별 사용량",
    dailySub: "최근 30일 · 입력 + 출력 토큰",
    range30: "30일",
    range14: "14일",
    range7:  "7일",
    legendTotal: "전체 토큰",
    legendInput: "입력 토큰",
    modelTitle: "모델별 비율",
    modelSub: "이번 달 사용량 기준",
    // Table
    tableTitle: "상세 기록",
    tableSub: "최근 호출",
    search: "요청 ID, 모델, 도구로 검색…",
    filterAll: "전체",
    filterOk:  "성공",
    filterErr: "오류",
    filterWarn: "지연",
    colTime: "시간",
    colModel: "모델",
    colTool: "도구",
    colIn: "입력",
    colOut: "출력",
    colCost: "비용",
    colStatus: "상태",
    statusOk: "성공",
    statusErr: "오류",
    statusWarn: "지연",
    pagerInfo: (a,b,t) => `${a}–${b} / 총 ${t}건`,
    tokens: "tokens",
    // tweaks
    twkTheme: "테마",
    twkLight: "라이트",
    twkDark: "다크",
    twkLang: "언어",
  },
  en: {
    product: "Token Usage Dashboard",
    productSub: "MCP token usage overview",
    gateEyebrow: "MCP SERVER",
    gateTitle: "Enter API Key",
    gateBody: "Provide an API Key to access the MCP server. The value is stored only in this browser's localStorage.",
    gateLabel: "API Key",
    gatePlaceholder: "sk-mcp-…",
    gateHelp: "The key stays on this device and is never sent to a third party.",
    gateConnect: "Connect",
    gateNoKey: "No key yet?",
    gateFootnote: "OPUS-X · v1.0 · Samsung SDS",
    connected: "Connected",
    refresh: "Refresh",
    export: "Export",
    today: "Today",
    thisMonth: "This month",
    cumulative: "All-time",
    vsYesterday: "vs yesterday",
    vsLastMonth: "vs last month",
    sinceStart: "since launch",
    dailyTitle: "Daily usage",
    dailySub: "Last 30 days · input + output tokens",
    range30: "30 d",
    range14: "14 d",
    range7:  "7 d",
    legendTotal: "Total tokens",
    legendInput: "Input tokens",
    modelTitle: "By model",
    modelSub: "Share of usage this month",
    tableTitle: "Recent calls",
    tableSub: "Detailed log",
    search: "Search request id, model, tool…",
    filterAll: "All",
    filterOk:  "OK",
    filterErr: "Error",
    filterWarn: "Slow",
    colTime: "Time",
    colModel: "Model",
    colTool: "Tool",
    colIn: "Input",
    colOut: "Output",
    colCost: "Cost",
    colStatus: "Status",
    statusOk: "ok",
    statusErr: "error",
    statusWarn: "slow",
    pagerInfo: (a,b,t) => `${a}–${b} of ${t}`,
    tokens: "tokens",
    twkTheme: "Theme",
    twkLight: "Light",
    twkDark: "Dark",
    twkLang: "Language",
  },
};

/* ───── Mock data ───── */
// Seeded pseudo-random so the page is stable across reloads.
function rng(seed) {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 100000) / 100000;
  };
}

const DAILY = (() => {
  const r = rng(7);
  const out = [];
  const today = new Date(2026, 4, 15); // May 15, 2026 (stable)
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dow = d.getDay();
    // Weekend dip, growing trend
    const baseTrend = 220_000 + (29 - i) * 22_000;
    const dipMult   = (dow === 0 || dow === 6) ? 0.55 : 1.0;
    const noise     = 0.7 + r() * 0.6;
    const tot = Math.round(baseTrend * dipMult * noise);
    const inT = Math.round(tot * (0.34 + r() * 0.06));
    const outT = tot - inT;
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    out.push({
      label: `${mm}/${dd}`,
      fullLabel: `${d.getFullYear()}-${mm}-${dd}`,
      in:  inT,
      out: outT,
    });
  }
  return out;
})();

const MODELS = [
  { id: "sonnet",  label: "claude-3-5-sonnet", color: "#7F56D9", value: 4_120_000 },
  { id: "haiku5",  label: "claude-3-5-haiku",  color: "#2E90FA", value: 2_350_000 },
  { id: "opus",    label: "claude-3-opus",     color: "#15B79E", value: 1_180_000 },
  { id: "haiku",   label: "claude-3-haiku",    color: "#EAAA08", value:   640_000 },
];

const TOOLS = ["read_file","grep","web_search","run_script","save_file","list_files","web_fetch"];
const STATUSES = [
  { id:"ok",   pct:.86, tone:"success" },
  { id:"warn", pct:.10, tone:"warning" },
  { id:"err",  pct:.04, tone:"error"   },
];

const ROWS = (() => {
  const r = rng(42);
  const today = new Date(2026, 4, 15, 16, 4);
  const out = [];
  for (let i = 0; i < 38; i++) {
    const t = new Date(today);
    t.setMinutes(today.getMinutes() - Math.round(r() * 60 * 26 * (i + 1) / 6));
    const m = MODELS[Math.floor(r() * MODELS.length)];
    const tool = TOOLS[Math.floor(r() * TOOLS.length)];
    const inT  = Math.round(800 + r() * 22_000);
    const outT = Math.round(120 + r() * 4_500);
    const costPer1k = m.id === "opus" ? 0.075 : m.id === "sonnet" ? 0.018 : 0.0012;
    const cost = ((inT + outT) / 1000) * costPer1k;
    const u = r();
    const status = u < .86 ? STATUSES[0] : u < .96 ? STATUSES[1] : STATUSES[2];
    out.push({
      id: `req_${(0x10000 + Math.floor(r() * 0xfffff)).toString(16)}`,
      time: t,
      model: m,
      tool,
      in: inT,
      out: outT,
      cost,
      status,
    });
  }
  return out.sort((a, b) => b.time - a.time);
})();

/* ───── Helpers ───── */
function fmtDate(d, lang) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${mm}-${dd} ${hh}:${mi}`;
}
function fmtMoney(n) {
  return "$" + n.toFixed(n < 1 ? 4 : 2);
}

/* ───── icon (uses lucide via window.lucide) ───── */
function Icon({ name, size = 18, color, style, ...rest }) {
  return (
    <i
      data-lucide={name}
      style={{
        display: "inline-flex",
        width: size, height: size,
        color: color || "currentColor",
        ...style,
      }}
      {...rest}
    />
  );
}
window.Icon = Icon;

/* ───────────────── Gate (empty state) ───────────────── */
function Gate({ t, onConnect, lang, dark, setTweak }) {
  const [val, setVal]   = useState("");
  const [show, setShow] = useState(false);

  return (
    <div className="gate">
      {/* Tiny top-right toggles even on gate */}
      <div style={{
        position: 'absolute', top: 20, right: 24,
        display: 'flex', gap: 8, zIndex: 2,
      }}>
        <div className="seg">
          <button className={lang === "ko" ? "on" : ""} onClick={() => setTweak('lang','ko')}>KO</button>
          <button className={lang === "en" ? "on" : ""} onClick={() => setTweak('lang','en')}>EN</button>
        </div>
        <button className="icon-btn" onClick={() => setTweak('dark', !dark)} aria-label="toggle theme">
          <Icon name={dark ? "sun" : "moon"} size={18} />
        </button>
      </div>

      <div className="gate-card">
        <div className="gate-mark">X</div>
        <div className="gate-eyebrow">{t.gateEyebrow}</div>
        <h1 className="gate-title">{t.gateTitle}</h1>
        <p className="gate-body">{t.gateBody}</p>

        <div className="gate-field">
          <label htmlFor="apikey">{t.gateLabel}</label>
          <div className="input-wrap">
            <Icon name="key-round" size={18} />
            <input
              id="apikey"
              type={show ? "text" : "password"}
              value={val}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) onConnect(val); }}
              placeholder={t.gatePlaceholder}
            />
            <button className="reveal" onClick={() => setShow(s => !s)} aria-label="toggle visibility">
              <Icon name={show ? "eye-off" : "eye"} size={18} />
            </button>
          </div>
        </div>

        <div className="gate-help">
          <Icon name="shield-check" size={14} />
          <span>{t.gateHelp}</span>
        </div>

        <div className="gate-actions">
          <a className="link" onClick={(e) => { e.preventDefault(); onConnect("sk-mcp-demo-d2f7a"); }}>
            {t.gateNoKey} <span style={{ textDecoration: "underline" }}>Demo</span>
          </a>
          <button
            className="btn primary lg"
            disabled={!val.trim()}
            style={{ opacity: val.trim() ? 1 : .55, cursor: val.trim() ? 'pointer' : 'not-allowed' }}
            onClick={() => onConnect(val)}
          >
            {t.gateConnect}
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 24, left: 0, right: 0, textAlign:'center',
        font: '400 11px/16px var(--font-mono)', color: 'var(--gray-400)',
      }}>
        {t.gateFootnote}
      </div>
    </div>
  );
}

/* ───────────────── Dashboard ───────────────── */
function Dashboard({ t, lang, apiKey, onLogout, dark, setTweak }) {
  const [range, setRange]   = useState(30);
  const [query, setQuery]   = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage]     = useState(1);
  const PER_PAGE = 8;

  /* Derived */
  const slicedDaily = useMemo(() => DAILY.slice(-range), [range]);
  const todayTotal = DAILY[DAILY.length - 1].in + DAILY[DAILY.length - 1].out;
  const yestTotal  = DAILY[DAILY.length - 2].in + DAILY[DAILY.length - 2].out;
  const monthTotal = DAILY.reduce((a, d) => a + d.in + d.out, 0);
  const cumTotal   = monthTotal * 4.6; // mock "all-time"
  const dayDelta   = ((todayTotal - yestTotal) / Math.max(1, yestTotal)) * 100;
  const monthDelta = 18.4; // mock vs last month

  const todaySpark   = DAILY.slice(-14).map(d => d.in + d.out);
  const monthSpark   = DAILY.map(d => d.in + d.out);
  const cumSpark     = monthSpark.map((v, i) => v * (1 + i / 60));

  const filteredRows = useMemo(() => {
    return ROWS.filter(r => {
      if (filter !== "all" && r.status.id !== filter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (!r.id.toLowerCase().includes(q) &&
            !r.model.label.toLowerCase().includes(q) &&
            !r.tool.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [query, filter]);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PER_PAGE));
  const pgRows = filteredRows.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* lucide re-render */
  useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  /* reset page when filter/query change */
  useEffect(() => { setPage(1); }, [filter, query, range]);

  const maskedKey = apiKey.length > 8
    ? `${apiKey.slice(0, 6)}••••${apiKey.slice(-4)}`
    : "sk-mcp-••••";

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">X</span>
          <span className="brand-name">OPUS-X</span>
          <span className="brand-sep">/</span>
          <span className="brand-product">{t.product}</span>
        </div>

        <div className="topbar-spacer" />

        <span className="topbar-status">
          <span className="dot" />
          {t.connected}
          <span className="key">· {maskedKey}</span>
        </span>

        <div className="seg" role="group">
          <button className={lang === "ko" ? "on" : ""} onClick={() => setTweak('lang','ko')}>KO</button>
          <button className={lang === "en" ? "on" : ""} onClick={() => setTweak('lang','en')}>EN</button>
        </div>

        <button className="icon-btn" onClick={() => setTweak('dark', !dark)} aria-label="toggle theme">
          <Icon name={dark ? "sun" : "moon"} size={18} />
        </button>
        <button className="icon-btn" onClick={onLogout} aria-label="logout">
          <Icon name="log-out" size={18} />
        </button>
      </header>

      <main className="page">

        {/* Page header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">{t.product}</h1>
            <p className="page-sub">
              {t.productSub} ·&nbsp;
              <span className="mono">
                2026-04-16 → 2026-05-15 KST
              </span>
            </p>
          </div>
          <div className="page-actions">
            <button className="btn outline md">
              <Icon name="download" size={16} />
              {t.export}
            </button>
            <button className="btn primary md">
              <Icon name="refresh-cw" size={16} />
              {t.refresh}
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="kpi-grid">
          <div className="kpi">
            <div className="kpi-label">
              <span className="ic"><Icon name="zap" size={16} /></span>
              {t.today}
            </div>
            <div className="kpi-value">
              {fmtNum(todayTotal)}
              <span className="unit">{t.tokens}</span>
            </div>
            <Sparkline data={todaySpark} color="#7F56D9" />
            <div className="kpi-meta">
              <span className={"kpi-delta " + (dayDelta >= 0 ? "up" : "down")}>
                <Icon name={dayDelta >= 0 ? "trending-up" : "trending-down"} size={12} />
                {(dayDelta >= 0 ? "+" : "") + dayDelta.toFixed(1)}%
              </span>
              <span className="kpi-foot">{t.vsYesterday}</span>
            </div>
          </div>

          <div className="kpi">
            <div className="kpi-label">
              <span className="ic ok"><Icon name="calendar" size={16} /></span>
              {t.thisMonth}
            </div>
            <div className="kpi-value">
              {fmtNum(monthTotal)}
              <span className="unit">{t.tokens}</span>
            </div>
            <Sparkline data={monthSpark} color="#039855" />
            <div className="kpi-meta">
              <span className="kpi-delta up">
                <Icon name="trending-up" size={12} />
                +{monthDelta.toFixed(1)}%
              </span>
              <span className="kpi-foot">{t.vsLastMonth}</span>
            </div>
          </div>

          <div className="kpi">
            <div className="kpi-label">
              <span className="ic cum"><Icon name="layers" size={16} /></span>
              {t.cumulative}
            </div>
            <div className="kpi-value">
              {fmtNum(cumTotal)}
              <span className="unit">{t.tokens}</span>
            </div>
            <Sparkline data={cumSpark} color="#1570EF" />
            <div className="kpi-meta">
              <span className="kpi-delta up">
                <Icon name="users" size={12} />
                124 {lang === "ko" ? "활성 키" : "active keys"}
              </span>
              <span className="kpi-foot">{t.sinceStart}</span>
            </div>
          </div>
        </div>

        {/* Charts row */}
        <div className="row-2">
          {/* Area chart */}
          <section className="card">
            <div className="card-head">
              <div>
                <h2 className="card-title">{t.dailyTitle}</h2>
                <div className="card-sub">{t.dailySub}</div>
              </div>
              <div className="chip-row">
                <span className={"chip " + (range === 7 ? "on" : "")} onClick={() => setRange(7)}>{t.range7}</span>
                <span className={"chip " + (range === 14 ? "on" : "")} onClick={() => setRange(14)}>{t.range14}</span>
                <span className={"chip " + (range === 30 ? "on" : "")} onClick={() => setRange(30)}>{t.range30}</span>
              </div>
            </div>
            <div className="chart-legend">
              <span className="item">
                <span className="swatch" style={{ background: "#7F56D9" }} />
                {t.legendTotal}
              </span>
              <span className="item">
                <span className="swatch" style={{ background: "#2E90FA" }} />
                {t.legendInput}
              </span>
            </div>
            <div className="chart-wrap">
              <AreaChart data={slicedDaily} height={260} />
            </div>
          </section>

          {/* Donut chart */}
          <section className="card">
            <div className="card-head">
              <div>
                <h2 className="card-title">{t.modelTitle}</h2>
                <div className="card-sub">{t.modelSub}</div>
              </div>
            </div>
            <div className="donut-wrap">
              <DonutChart
                data={MODELS}
                total={fmtNum(MODELS.reduce((a, b) => a + b.value, 0))}
                label={t.tokens}
              />
              <div className="donut-list">
                {MODELS.map(m => {
                  const total = MODELS.reduce((a, b) => a + b.value, 0);
                  const pct = (m.value / total) * 100;
                  return (
                    <div className="row" key={m.id}>
                      <span className="sw" style={{ background: m.color }} />
                      <span className="name">{m.label}</span>
                      <span className="pct">{pct.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* Table */}
        <section className="card">
          <div className="card-head">
            <div>
              <h2 className="card-title">{t.tableTitle}</h2>
              <div className="card-sub">{t.tableSub} · {filteredRows.length}</div>
            </div>
            <div className="chip-row">
              {[
                { id: "all",  label: t.filterAll },
                { id: "ok",   label: t.filterOk },
                { id: "warn", label: t.filterWarn },
                { id: "err",  label: t.filterErr },
              ].map(o => (
                <span key={o.id}
                      className={"chip " + (filter === o.id ? "on" : "")}
                      onClick={() => setFilter(o.id)}>{o.label}</span>
              ))}
            </div>
          </div>
          <div className="table-toolbar">
            <div className="search">
              <Icon name="search" size={16} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t.search}
              />
            </div>
            <span className="muted mono" style={{ fontSize: 12 }}>
              {filteredRows.length} {lang === "ko" ? "건" : "results"}
            </span>
            <div style={{ flex: 1 }} />
            <button className="btn outline sm">
              <Icon name="sliders-horizontal" size={14} />
              {lang === "ko" ? "필터" : "Filters"}
            </button>
            <button className="btn outline sm">
              <Icon name="arrow-up-down" size={14} />
              {lang === "ko" ? "정렬" : "Sort"}
            </button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>{t.colTime}</th>
                <th>{t.colModel}</th>
                <th>{t.colTool}</th>
                <th className="num">{t.colIn}</th>
                <th className="num">{t.colOut}</th>
                <th className="num">{t.colCost}</th>
                <th>{t.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {pgRows.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="ts">{fmtDate(r.time, lang)}</div>
                    <div className="mono muted" style={{ fontSize: 11 }}>{r.id}</div>
                  </td>
                  <td>
                    <span className="model">
                      <span className="dot" style={{ background: r.model.color }} />
                      {r.model.label}
                    </span>
                  </td>
                  <td className="mono" style={{ fontSize: 12 }}>{r.tool}</td>
                  <td className="num">{r.in.toLocaleString()}</td>
                  <td className="num">{r.out.toLocaleString()}</td>
                  <td className="num">{fmtMoney(r.cost)}</td>
                  <td>
                    <span className={"badge " + r.status.tone}>
                      <span className="dot" />
                      {t["status" + r.status.id[0].toUpperCase() + r.status.id.slice(1)]}
                    </span>
                  </td>
                </tr>
              ))}
              {pgRows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign:'center', padding: 48, color:'var(--gray-400)' }}>
                    {lang === "ko" ? "조건에 맞는 기록이 없습니다." : "No matching records."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="table-foot">
            <span>{t.pagerInfo(
              (page - 1) * PER_PAGE + 1,
              Math.min(page * PER_PAGE, filteredRows.length),
              filteredRows.length
            )}</span>
            <div className="pager">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} aria-label="prev">
                <Icon name="chevron-left" size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                <button key={p}
                  className={page === p ? "on" : ""}
                  onClick={() => setPage(p)}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} aria-label="next">
                <Icon name="chevron-right" size={14} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

/* ───────────────── Root ───────────────── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "lang": "ko"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [apiKey, setApiKey] = useState("");

  // Apply theme to <html data-theme>
  useEffect(() => {
    document.documentElement.dataset.theme = tweaks.dark ? "dark" : "light";
  }, [tweaks.dark]);

  // Persist API key locally so reload keeps the dashboard up
  useEffect(() => {
    try {
      const saved = localStorage.getItem("opusx.mcp.apikey");
      if (saved) setApiKey(saved);
    } catch (e) {}
  }, []);
  function onConnect(v) {
    setApiKey(v);
    try { localStorage.setItem("opusx.mcp.apikey", v); } catch (e) {}
  }
  function onLogout() {
    setApiKey("");
    try { localStorage.removeItem("opusx.mcp.apikey"); } catch (e) {}
  }

  useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  const lang = tweaks.lang === "en" ? "en" : "ko";
  const t = STR[lang];

  return (
    <>
      {apiKey
        ? <Dashboard t={t} lang={lang} apiKey={apiKey} onLogout={onLogout}
                     dark={tweaks.dark} setTweak={setTweak} />
        : <Gate t={t} onConnect={onConnect} lang={lang}
                dark={tweaks.dark} setTweak={setTweak} />
      }
      <TweaksPanel title="Tweaks">
        <TweakSection label={t.twkLang} />
        <TweakRadio
          label={t.twkLang}
          value={tweaks.lang}
          options={[{value:"ko", label:"한국어"},{value:"en", label:"English"}]}
          onChange={(v) => setTweak('lang', v)}
        />
        <TweakSection label={t.twkTheme} />
        <TweakRadio
          label={t.twkTheme}
          value={tweaks.dark ? "dark" : "light"}
          options={[{value:"light", label:t.twkLight},{value:"dark", label:t.twkDark}]}
          onChange={(v) => setTweak('dark', v === "dark")}
        />
        {apiKey && (
          <>
            <TweakSection label={lang === "ko" ? "데모" : "Demo"} />
            <TweakButton
              label={lang === "ko" ? "API Key 화면으로" : "Back to gate"}
              secondary
              onClick={onLogout}
            />
          </>
        )}
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
