// Dashboard HTML — OPUS-X design system (Samsung SDS).
// All inner JS/JSX uses single/double quotes only (no backticks) to avoid
// escaping conflicts with the outer TypeScript template literal.
export function dashboardHtml(apiBase: string): string {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Token Usage Dashboard · AX Lab</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&family=Noto+Sans+KR:wght@400;500;700;800&family=Roboto+Mono:wght@400;500;700&family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
/* ── AX Lab tokens (v1.1.3) ── */
*,*::before,*::after{box-sizing:border-box}
:root{
  --purple-25:#FAFAFF;--purple-50:#F4F3FF;--purple-100:#EBE9FE;
  --purple-200:#D9D6FE;--purple-300:#BDB4FE;--purple-400:#9B8AFB;
  --purple-500:#7F56D9;--purple-600:#6941C6;--purple-700:#53389E;
  --purple-800:#42307D;--purple-900:#2F1C6A;
  --yellow-50:#FEFBE8;--yellow-300:#FDE272;--yellow-500:#EAAA08;
  --yellow-600:#A15C07;--yellow-700:#854A0E;
  --gray-25:#FCFCFD;--gray-50:#F9FAFB;--gray-100:#F2F4F7;
  --gray-200:#EAECF0;--gray-300:#D0D5DD;--gray-400:#98A2B3;
  --gray-500:#667085;--gray-600:#475467;--gray-700:#344054;
  --gray-800:#1D2939;--gray-900:#101828;
  --blue-50:#EFF8FF;--blue-300:#84CAFF;--blue-500:#2E90FA;
  --blue-600:#1570EF;--blue-700:#175CD3;
  --green-50:#ECFDF3;--green-400:#32D583;--green-500:#12B76A;
  --green-600:#039855;--green-700:#027A48;
  --red-50:#FEF3F2;--red-400:#F97066;--red-500:#F04438;
  --red-600:#D92D20;--red-700:#B42318;
  --teal-500:#15B79E;
  /* context tokens — light */
  --fg-primary:var(--purple-600);--fg-primary-hover:var(--purple-700);
  --fg-primary-accent:var(--purple-500);
  --fg-neutral:var(--gray-600);--fg-neutral-hover:var(--gray-700);
  --fg-secondary:var(--gray-500);--fg-tertiary:var(--gray-400);
  --fg-success:var(--green-600);--fg-warning:var(--yellow-700);
  --fg-error:var(--red-600);--fg-info:var(--blue-600);--fg-on-primary:#fff;
  --bg-base:#fff;--bg-subtle:var(--gray-50);--bg-muted:var(--gray-100);
  --bg-canvas:#F8F9FC;--bg-invert:var(--gray-900);
  --bg-primary:var(--purple-600);--bg-primary-hover:var(--purple-700);
  --bg-primary-tint:var(--purple-50);--bg-primary-tint-hover:var(--purple-100);
  --bg-neutral-tint:var(--gray-50);
  --bg-success-tint:var(--green-50);--bg-warning-tint:var(--yellow-50);
  --bg-error-tint:var(--red-50);--bg-info-tint:var(--blue-50);
  --border-primary:var(--purple-600);--border-neutral:var(--gray-300);
  --border-neutral-hover:var(--gray-400);--border-subtle:var(--gray-200);
  --font-sans:"Noto Sans KR","Noto Sans","Malgun Gothic",-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;
  --font-mono:"Roboto Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  --font-display:"Sora","Samsung Sharp Sans","Noto Sans",-apple-system,sans-serif;
  --fw-regular:400;--fw-medium:500;--fw-bold:700;
  --fs-h2:30px;--lh-h2:40px;--fs-h3:24px;--lh-h3:32px;
  --fs-h5:16px;--lh-h5:20px;--fs-md:14px;--lh-md:20px;
  --fs-sm:12px;--lh-sm:16px;--fs-xs:10px;--lh-xs:16px;
  --space-xs:4px;--space-sm:8px;--space-md:12px;--space-lg:16px;
  --space-xl:24px;--space-2xl:32px;--space-3xl:40px;
  --radius-sm:4px;--radius-md:6px;--radius-lg:8px;
  --radius-xl:12px;--radius-2xl:16px;--radius-full:1000px;
  --shadow-xs:0 1px 2px 0 rgba(16,24,40,.05);
  --shadow-sm:0 1px 3px 0 rgba(16,24,40,.10),0 1px 2px 0 rgba(16,24,40,.06);
  --shadow-md:0 4px 8px -2px rgba(16,24,40,.10),0 2px 4px -2px rgba(16,24,40,.06);
  --shadow-xl:0 20px 24px -4px rgba(16,24,40,.08),0 8px 8px -4px rgba(16,24,40,.03);
  --ring-primary:0 0 0 4px rgba(127,86,217,.24);
  --duration-fast:120ms;--duration-medium:200ms;
  --ease-standard:cubic-bezier(.2,0,0,1);
  --z-raised:100;--z-overlay:1100;
}
:root[data-theme="dark"]{
  --fg-primary:var(--purple-300);--fg-primary-hover:var(--purple-200);
  --fg-primary-accent:var(--purple-400);
  --fg-neutral:#D6DAE3;--fg-neutral-hover:#EAECF0;
  --fg-secondary:#98A2B3;--fg-tertiary:#667085;
  --fg-success:var(--green-400);--fg-warning:var(--yellow-300);
  --fg-error:var(--red-400);--fg-info:var(--blue-300);
  --bg-base:#161A24;--bg-canvas:#0F1117;--bg-subtle:#1C2030;--bg-muted:#232838;
  --bg-primary:var(--purple-500);--bg-primary-hover:var(--purple-400);
  --bg-primary-tint:rgba(127,86,217,.16);--bg-primary-tint-hover:rgba(127,86,217,.28);
  --bg-neutral-tint:#1C2030;
  --bg-success-tint:rgba(18,183,106,.14);--bg-warning-tint:rgba(247,144,9,.14);
  --bg-error-tint:rgba(240,68,56,.14);--bg-info-tint:rgba(46,144,250,.14);
  --border-neutral:#2A3142;--border-neutral-hover:#3A4258;--border-subtle:#222838;
  --border-primary:var(--purple-400);
  --shadow-xs:0 1px 2px 0 rgba(0,0,0,.4);
  --shadow-sm:0 1px 3px 0 rgba(0,0,0,.55),0 1px 2px 0 rgba(0,0,0,.4);
  --shadow-xl:0 20px 24px -4px rgba(0,0,0,.55),0 8px 8px -4px rgba(0,0,0,.4);
}
html,body{margin:0;padding:0;height:100%;font-family:var(--font-sans);font-size:var(--fs-md);line-height:var(--lh-md);-webkit-font-smoothing:antialiased}
body{background:var(--bg-canvas);color:var(--gray-900);transition:background var(--duration-medium) var(--ease-standard),color var(--duration-medium) var(--ease-standard)}
:root[data-theme="dark"] body{color:#E5E8EE}
#root{height:100%}
button{font-family:inherit;cursor:pointer}
</style>
<style>
/* ── dashboard.css ── */
.topbar{height:64px;background:var(--bg-base);border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:16px;padding:0 32px;position:sticky;top:0;z-index:var(--z-raised)}
.brand{display:inline-flex;align-items:center;gap:10px}
.brand-mark{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,var(--purple-500),var(--purple-700));display:inline-flex;align-items:center;justify-content:center;color:#fff;box-shadow:var(--shadow-xs);font:800 14px/1 var(--font-display);letter-spacing:-.02em}
.brand-name{font:700 16px/20px var(--font-display);color:var(--gray-900);letter-spacing:-.01em}
:root[data-theme="dark"] .brand-name{color:#fff}
.brand-sep{color:var(--gray-300);font-weight:300}
:root[data-theme="dark"] .brand-sep{color:#3A4258}
.brand-product{font:500 14px/20px var(--font-sans);color:var(--gray-600)}
:root[data-theme="dark"] .brand-product{color:#98A2B3}
.topbar-spacer{flex:1}
.topbar-status{display:inline-flex;align-items:center;gap:8px;font:500 12px/16px var(--font-mono);color:var(--gray-500);padding:4px 10px;border-radius:var(--radius-full);background:var(--bg-subtle);border:1px solid var(--border-subtle)}
.topbar-status .dot{width:6px;height:6px;border-radius:50%;background:var(--green-500);box-shadow:0 0 0 3px var(--bg-success-tint)}
.topbar-status .key{color:var(--gray-700)}
:root[data-theme="dark"] .topbar-status .key{color:#D6DAE3}
.seg{display:inline-flex;align-items:center;background:var(--bg-subtle);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:2px}
.seg button{appearance:none;border:0;background:transparent;padding:4px 10px;border-radius:4px;cursor:pointer;font:500 12px/16px var(--font-sans);color:var(--gray-500);display:inline-flex;align-items:center;gap:6px;transition:background var(--duration-fast) var(--ease-standard),color var(--duration-fast) var(--ease-standard)}
.seg button:hover{color:var(--gray-700)}
.seg button.on{background:var(--bg-base);color:var(--gray-900);box-shadow:var(--shadow-xs)}
:root[data-theme="dark"] .seg button.on{color:#fff;background:#232838}
:root[data-theme="dark"] .seg button{color:#98A2B3}
:root[data-theme="dark"] .seg button:hover{color:#EAECF0}
.icon-btn{width:36px;height:36px;border:1px solid var(--border-subtle);background:var(--bg-base);color:var(--gray-600);border-radius:var(--radius-md);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--shadow-xs);transition:background var(--duration-fast) var(--ease-standard),color var(--duration-fast) var(--ease-standard),border-color var(--duration-fast) var(--ease-standard)}
.icon-btn:hover{background:var(--bg-subtle);color:var(--gray-900);border-color:var(--border-neutral)}
:root[data-theme="dark"] .icon-btn{color:#98A2B3}
:root[data-theme="dark"] .icon-btn:hover{color:#fff}
.icon-btn svg,.icon-btn i{width:18px;height:18px;pointer-events:none}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:var(--font-sans);font-weight:500;border:1px solid transparent;cursor:pointer;white-space:nowrap;transition:background var(--duration-fast) var(--ease-standard),color var(--duration-fast) var(--ease-standard),border-color var(--duration-fast) var(--ease-standard)}
.btn svg,.btn i{width:16px;height:16px;pointer-events:none}
.btn.sm{height:28px;padding:0 10px;border-radius:6px;font-size:12px;line-height:16px}
.btn.md{height:36px;padding:0 14px;border-radius:6px;font-size:14px;line-height:20px}
.btn.lg{height:44px;padding:0 18px;border-radius:8px;font-size:15px;line-height:20px}
.btn.primary{background:var(--bg-primary);color:#fff;box-shadow:var(--shadow-xs)}
.btn.primary:hover{background:var(--bg-primary-hover)}
.btn.primary:disabled{opacity:.55;cursor:not-allowed}
.btn.outline{background:var(--bg-base);color:var(--gray-700);border-color:var(--border-neutral);box-shadow:var(--shadow-xs)}
.btn.outline:hover{background:var(--bg-subtle);border-color:var(--border-neutral-hover);color:var(--gray-900)}
:root[data-theme="dark"] .btn.outline{color:#D6DAE3}
:root[data-theme="dark"] .btn.outline:hover{color:#fff}
.page{max-width:1280px;margin:0 auto;padding:32px 32px 80px}
.page-header{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:28px}
.page-title{font:700 var(--fs-h2)/var(--lh-h2) var(--font-sans);letter-spacing:-.01em;margin:0;color:var(--gray-900)}
:root[data-theme="dark"] .page-title{color:#fff}
.page-sub{font:400 14px/22px var(--font-sans);color:var(--gray-500);margin:6px 0 0}
.page-sub .mono{font-family:var(--font-mono);font-size:12px}
.page-actions{display:flex;gap:8px;align-items:center}
.card{background:var(--bg-base);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);box-shadow:var(--shadow-sm)}
.card-head{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--border-subtle);gap:12px}
.card-title{font:700 16px/24px var(--font-sans);color:var(--gray-900);letter-spacing:-.005em;margin:0}
:root[data-theme="dark"] .card-title{color:#fff}
.card-sub{font:400 12px/16px var(--font-sans);color:var(--gray-500)}
.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px}
.kpi{background:var(--bg-base);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);box-shadow:var(--shadow-sm);padding:22px 24px 20px;display:flex;flex-direction:column}
.kpi-label{font:500 13px/18px var(--font-sans);color:var(--gray-500);display:flex;align-items:center;gap:8px}
.kpi-label .ic{width:28px;height:28px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;background:var(--bg-primary-tint);color:var(--purple-600)}
.kpi-label .ic.ok{background:var(--bg-success-tint);color:var(--green-600)}
.kpi-label .ic.cum{background:var(--bg-info-tint);color:var(--blue-600)}
.kpi-label .ic svg,.kpi-label .ic i{width:16px;height:16px}
.kpi-value{font:700 36px/44px var(--font-sans);letter-spacing:-.02em;color:var(--gray-900);margin:14px 0 0;font-variant-numeric:tabular-nums;display:flex;align-items:baseline;gap:8px}
:root[data-theme="dark"] .kpi-value{color:#fff}
.kpi-value .unit{font:500 14px/20px var(--font-mono);color:var(--gray-400);letter-spacing:0}
.kpi-meta{margin-top:4px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.kpi-delta{font:500 12px/16px var(--font-mono);display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:var(--radius-full)}
.kpi-delta svg,.kpi-delta i{width:12px;height:12px}
.kpi-delta.up{color:var(--green-700);background:var(--bg-success-tint)}
.kpi-delta.down{color:var(--red-700);background:var(--bg-error-tint)}
:root[data-theme="dark"] .kpi-delta.up{color:var(--green-400)}
:root[data-theme="dark"] .kpi-delta.down{color:var(--red-400)}
.kpi-foot{font:400 11px/16px var(--font-mono);color:var(--gray-400)}
.spark{display:block;width:100%;height:36px;margin:12px 0 10px;opacity:.9;pointer-events:none}
.row-2{display:grid;grid-template-columns:1.65fr 1fr;gap:20px;margin-bottom:20px}
.chip-row{display:inline-flex;gap:6px}
.chip{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:6px;font:500 12px/16px var(--font-sans);background:transparent;color:var(--gray-500);cursor:pointer;border:1px solid transparent;transition:background var(--duration-fast) var(--ease-standard),color var(--duration-fast) var(--ease-standard)}
.chip:hover{color:var(--gray-700);background:var(--bg-subtle)}
.chip.on{background:var(--bg-primary-tint);color:var(--purple-700)}
:root[data-theme="dark"] .chip.on{color:var(--purple-300)}
:root[data-theme="dark"] .chip:hover{color:#EAECF0}
.chart-wrap{padding:12px 24px 24px;position:relative}
.chart-svg{width:100%;height:280px;display:block}
.chart-legend{display:flex;gap:16px;align-items:center;padding:0 24px 18px}
.chart-legend .item{display:inline-flex;align-items:center;gap:6px;font:500 12px/16px var(--font-sans);color:var(--gray-600)}
.chart-legend .swatch{width:10px;height:10px;border-radius:2px}
:root[data-theme="dark"] .chart-legend .item{color:#98A2B3}
.chart-tip{position:absolute;pointer-events:none;transform:translate(-50%,-100%);background:var(--gray-900);color:#fff;padding:8px 10px;border-radius:8px;font:500 12px/16px var(--font-sans);box-shadow:var(--shadow-xl);white-space:nowrap;opacity:0;transition:opacity 120ms}
.chart-tip.on{opacity:1}
.chart-tip .l{color:var(--gray-300);font:500 11px/14px var(--font-mono);display:block}
.chart-tip .v{font:700 14px/18px var(--font-sans)}
.chart-tip .row{display:flex;align-items:center;gap:6px;font:500 11px/14px var(--font-mono);color:var(--gray-300)}
.chart-tip .row .sw{width:8px;height:8px;border-radius:2px;display:inline-block}
:root[data-theme="dark"] .chart-tip{background:#fff;color:#101828}
:root[data-theme="dark"] .chart-tip .l,:root[data-theme="dark"] .chart-tip .row{color:#475467}
.donut-wrap{padding:12px 24px 24px;display:grid;grid-template-columns:180px 1fr;gap:24px;align-items:center}
.donut{width:180px;height:180px}
.donut-center{position:relative}
.donut-center-text{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none}
.donut-center-text .v{font:700 22px/26px var(--font-sans);color:var(--gray-900);letter-spacing:-.01em;font-variant-numeric:tabular-nums}
:root[data-theme="dark"] .donut-center-text .v{color:#fff}
.donut-center-text .l{font:500 11px/14px var(--font-mono);color:var(--gray-400);margin-top:2px}
.donut-list{display:flex;flex-direction:column;gap:10px}
.donut-list .row{display:grid;grid-template-columns:12px 1fr auto;gap:10px;align-items:center}
.donut-list .sw{width:10px;height:10px;border-radius:3px}
.donut-list .name{font:500 12px/18px var(--font-mono);color:var(--gray-800)}
:root[data-theme="dark"] .donut-list .name{color:#D6DAE3}
.donut-list .pct{font:600 13px/18px var(--font-mono);color:var(--gray-700);font-variant-numeric:tabular-nums}
:root[data-theme="dark"] .donut-list .pct{color:#EAECF0}
.table-toolbar{display:flex;align-items:center;gap:12px;padding:16px 24px;border-bottom:1px solid var(--border-subtle)}
.search{flex:1;max-width:360px;display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 12px;background:var(--bg-subtle);border:1px solid var(--border-subtle);border-radius:6px;color:var(--gray-500);transition:background var(--duration-fast) var(--ease-standard),border-color var(--duration-fast) var(--ease-standard)}
.search:focus-within{background:var(--bg-base);border-color:var(--purple-500);box-shadow:var(--ring-primary)}
.search svg,.search i{width:16px;height:16px}
.search input{flex:1;border:0;outline:0;background:transparent;font:400 14px/20px var(--font-sans);color:var(--gray-900)}
:root[data-theme="dark"] .search input{color:#EAECF0}
.search input::placeholder{color:var(--gray-400)}
.data-table{width:100%;border-collapse:collapse}
.data-table thead th{text-align:left;font:600 12px/16px var(--font-sans);color:var(--gray-500);letter-spacing:.02em;padding:12px 16px;background:var(--bg-subtle);border-bottom:1px solid var(--border-subtle)}
.data-table thead th:first-child{padding-left:24px}
.data-table thead th:last-child{padding-right:24px}
.data-table thead th.num{text-align:right}
.data-table tbody td{padding:14px 16px;border-bottom:1px solid var(--border-subtle);font:400 13px/20px var(--font-sans);color:var(--gray-700);vertical-align:middle}
.data-table tbody td:first-child{padding-left:24px}
.data-table tbody td:last-child{padding-right:24px}
.data-table tbody td.num{font-family:var(--font-mono);font-size:13px;text-align:right;color:var(--gray-800);font-variant-numeric:tabular-nums}
:root[data-theme="dark"] .data-table tbody td{color:#D6DAE3}
:root[data-theme="dark"] .data-table tbody td.num{color:#EAECF0}
.data-table tbody tr:last-child td{border-bottom:0}
.data-table tbody tr:hover{background:var(--bg-subtle)}
.data-table .model-cell{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:12px;color:var(--gray-800)}
:root[data-theme="dark"] .data-table .model-cell{color:#EAECF0}
.model-cell .dot{width:8px;height:8px;border-radius:2px}
.table-foot{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;border-top:1px solid var(--border-subtle);font:400 12px/16px var(--font-sans);color:var(--gray-500)}
.pager{display:inline-flex;align-items:center;gap:4px}
.pager button{appearance:none;border:1px solid var(--border-subtle);background:var(--bg-base);color:var(--gray-600);width:30px;height:30px;border-radius:6px;cursor:pointer;font:500 12px/16px var(--font-mono);display:inline-flex;align-items:center;justify-content:center}
.pager button:hover{background:var(--bg-subtle)}
.pager button.on{background:var(--bg-primary-tint);color:var(--purple-700);border-color:var(--purple-200)}
:root[data-theme="dark"] .pager button{color:#98A2B3}
:root[data-theme="dark"] .pager button.on{color:var(--purple-300);border-color:rgba(127,86,217,.4)}
.pager button svg,.pager button i{width:14px;height:14px}
.gate{min-height:100vh;display:grid;place-items:center;padding:40px;background:var(--bg-canvas);position:relative;overflow:hidden}
.gate::before,.gate::after{content:"";position:absolute;border-radius:50%;filter:blur(80px);opacity:.35;pointer-events:none}
.gate::before{width:480px;height:480px;background:radial-gradient(circle,var(--purple-300),transparent 60%);top:-120px;left:-120px}
.gate::after{width:520px;height:520px;background:radial-gradient(circle,var(--blue-300),transparent 60%);bottom:-160px;right:-160px}
:root[data-theme="dark"] .gate::before{opacity:.18}
:root[data-theme="dark"] .gate::after{opacity:.14}
.gate-card{position:relative;z-index:1;background:var(--bg-base);border:1px solid var(--border-subtle);border-radius:var(--radius-2xl);box-shadow:var(--shadow-xl);padding:40px;width:480px;max-width:100%}
.gate-mark{width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,var(--purple-500),var(--purple-700));display:inline-flex;align-items:center;justify-content:center;color:#fff;box-shadow:var(--shadow-md);font:800 22px/1 var(--font-display);letter-spacing:-.04em}
.gate-eyebrow{font:500 12px/16px var(--font-mono);color:var(--purple-600);letter-spacing:.06em;text-transform:uppercase;margin:22px 0 8px}
:root[data-theme="dark"] .gate-eyebrow{color:var(--purple-300)}
.gate-title{font:700 24px/32px var(--font-sans);color:var(--gray-900);margin:0 0 8px;letter-spacing:-.01em}
:root[data-theme="dark"] .gate-title{color:#fff}
.gate-body{font:400 14px/22px var(--font-sans);color:var(--gray-500);margin:0 0 24px}
.gate-field{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
.gate-field label{font:500 12px/16px var(--font-sans);color:var(--gray-700)}
:root[data-theme="dark"] .gate-field label{color:#D6DAE3}
.input-wrap{display:flex;align-items:center;gap:8px;height:44px;padding:0 12px;background:var(--bg-base);border:1px solid var(--border-neutral);border-radius:var(--radius-md);box-shadow:var(--shadow-xs);transition:border-color var(--duration-fast) var(--ease-standard),box-shadow var(--duration-fast) var(--ease-standard)}
.input-wrap:focus-within{border-color:var(--purple-500);box-shadow:var(--ring-primary)}
.input-wrap svg,.input-wrap i{color:var(--gray-400);width:18px;height:18px}
.input-wrap input{flex:1;border:0;outline:0;background:transparent;font:500 14px/20px var(--font-mono);color:var(--gray-900)}
:root[data-theme="dark"] .input-wrap input{color:#fff}
.input-wrap input::placeholder{color:var(--gray-400)}
.input-wrap .reveal{appearance:none;border:0;background:transparent;color:var(--gray-400);cursor:pointer;padding:4px;border-radius:4px}
.input-wrap .reveal:hover{color:var(--gray-700)}
.gate-help{display:flex;align-items:flex-start;gap:8px;font:400 12px/18px var(--font-sans);color:var(--gray-500);margin:-4px 0 24px}
.gate-help svg,.gate-help i{color:var(--gray-400);flex:0 0 auto;margin-top:2px;width:14px;height:14px}
.gate-actions{display:flex;align-items:center;justify-content:space-between;gap:12px}
.gate-actions .link{font:500 13px/20px var(--font-sans);color:var(--purple-600);text-decoration:none;cursor:pointer;background:none;border:none}
:root[data-theme="dark"] .gate-actions .link{color:var(--purple-300)}
.gate-footnote{text-align:center;margin-top:20px;font:400 11px/16px var(--font-mono);color:var(--gray-400)}
.empty-state{text-align:center;padding:48px 24px;color:var(--gray-400);font:400 14px/20px var(--font-sans)}
.loading-row td{text-align:center;padding:48px;color:var(--gray-400)}
@media(max-width:1100px){.row-2{grid-template-columns:1fr}.kpi-grid{grid-template-columns:1fr 1fr}}
@media(max-width:720px){.kpi-grid{grid-template-columns:1fr}.donut-wrap{grid-template-columns:1fr;justify-items:center}.page{padding:24px 16px 60px}.topbar{padding:0 16px}}
</style>
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js"></script>
</head>
<body>
<div id="root"></div>
<script>var API_BASE = '${apiBase}';</script>
<script type="text/babel">
/* ── Hooks ── */
const { useState, useEffect, useMemo, useRef } = React;

/* ── Number formatting ── */
function fmtNum(n) {
  if (n == null) return '0';
  if (n >= 1e9) return (n / 1e9).toFixed(2).replace(/\\.?0+$/, '') + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2).replace(/\\.?0+$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\\.?0+$/, '') + 'K';
  return String(n);
}
function fmtFull(n) { return (n || 0).toLocaleString('en-US'); }

/* ── Smooth cardinal-spline path ── */
function smoothPath(points) {
  if (points.length < 2) return '';
  var d = 'M ' + points[0].x + ',' + points[0].y;
  for (var i = 0; i < points.length - 1; i++) {
    var p0 = points[i - 1] || points[i];
    var p1 = points[i];
    var p2 = points[i + 1];
    var p3 = points[i + 2] || p2;
    var cp1x = p1.x + (p2.x - p0.x) / 6;
    var cp1y = p1.y + (p2.y - p0.y) / 6;
    var cp2x = p2.x - (p3.x - p1.x) / 6;
    var cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ' C ' + cp1x + ',' + cp1y + ' ' + cp2x + ',' + cp2y + ' ' + p2.x + ',' + p2.y;
  }
  return d;
}

/* ── AreaChart ── */
function AreaChart({ data, height = 260 }) {
  var wrapRef = useRef(null);
  var [hover, setHover] = useState(null);
  var W = 800, H = height;
  var PAD = { l: 56, r: 16, t: 16, b: 36 };
  var innerW = W - PAD.l - PAD.r;
  var innerH = H - PAD.t - PAD.b;

  var max = useMemo(function() {
    var m = Math.max(1, ...data.map(function(d) { return d.in + d.out; }));
    var pow = Math.pow(10, Math.floor(Math.log10(m)));
    return Math.ceil(m / pow) * pow;
  }, [data]);

  function xFor(i) { return PAD.l + (i / Math.max(1, data.length - 1)) * innerW; }
  function yFor(v) { return PAD.t + innerH - (v / max) * innerH; }

  var totalPts = data.map(function(d, i) { return { x: xFor(i), y: yFor(d.in + d.out), d: d }; });
  var inPts = data.map(function(d, i) { return { x: xFor(i), y: yFor(d.in), d: d }; });
  var totalLine = smoothPath(totalPts);
  var inLine = smoothPath(inPts);
  var baselineY = PAD.t + innerH;
  var totalArea = totalLine + ' L ' + totalPts[totalPts.length - 1].x + ',' + baselineY + ' L ' + totalPts[0].x + ',' + baselineY + ' Z';
  var inArea = inLine + ' L ' + inPts[inPts.length - 1].x + ',' + baselineY + ' L ' + inPts[0].x + ',' + baselineY + ' Z';

  var yTicks = [0, .25, .5, .75, 1].map(function(t) {
    return { v: max * t, y: PAD.t + innerH - t * innerH };
  });
  var xTickStep = Math.max(1, Math.floor(data.length / 6));

  function onMove(e) {
    var svg = e.currentTarget;
    var rect = svg.getBoundingClientRect();
    var xView = ((e.clientX - rect.left) / rect.width) * W;
    if (xView < PAD.l || xView > W - PAD.r) { setHover(null); return; }
    var i = Math.round(((xView - PAD.l) / innerW) * (data.length - 1));
    var clamped = Math.max(0, Math.min(data.length - 1, i));
    setHover({
      i: clamped,
      px: (xFor(clamped) / W) * rect.width,
      py: (yFor(data[clamped].in + data[clamped].out) / H) * rect.height,
    });
  }

  var tip = hover != null && data[hover.i];

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <svg className="chart-svg" viewBox={"0 0 " + W + " " + H} preserveAspectRatio="none"
           onMouseMove={onMove} onMouseLeave={function() { setHover(null); }}>
        <defs>
          <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--purple-500)" stopOpacity=".30" />
            <stop offset="100%" stopColor="var(--purple-500)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--blue-500)" stopOpacity=".22" />
            <stop offset="100%" stopColor="var(--blue-500)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map(function(t, idx) {
          return (
            <g key={idx}>
              <line x1={PAD.l} x2={W - PAD.r} y1={t.y} y2={t.y}
                    stroke="var(--border-subtle)" strokeDasharray={idx === 0 ? "0" : "3 3"} />
              <text x={PAD.l - 10} y={t.y + 4} textAnchor="end" fill="var(--gray-400)"
                    style={{ font: '500 11px/14px var(--font-mono)' }}>
                {fmtNum(t.v)}
              </text>
            </g>
          );
        })}
        {data.map(function(d, i) {
          if (i % xTickStep !== 0 && i !== data.length - 1) return null;
          return (
            <text key={i} x={xFor(i)} y={H - 12} textAnchor="middle" fill="var(--gray-400)"
                  style={{ font: '500 11px/14px var(--font-mono)' }}>
              {d.label}
            </text>
          );
        })}
        <path d={totalArea} fill="url(#gradTotal)" />
        <path d={inArea} fill="url(#gradIn)" />
        <path d={totalLine} fill="none" stroke="var(--purple-500)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <path d={inLine} fill="none" stroke="var(--blue-500)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {hover != null && (
          <g>
            <line x1={xFor(hover.i)} x2={xFor(hover.i)} y1={PAD.t} y2={PAD.t + innerH}
                  stroke="var(--gray-300)" strokeDasharray="3 3" />
            <circle cx={xFor(hover.i)} cy={yFor(data[hover.i].in + data[hover.i].out)}
                    r="5" fill="var(--bg-base)" stroke="var(--purple-500)" strokeWidth="2" />
            <circle cx={xFor(hover.i)} cy={yFor(data[hover.i].in)}
                    r="4" fill="var(--bg-base)" stroke="var(--blue-500)" strokeWidth="2" />
          </g>
        )}
      </svg>
      {tip && (
        <div className="chart-tip on" style={{ left: hover.px, top: Math.max(40, hover.py - 8) }}>
          <span className="l">{tip.fullLabel || tip.label}</span>
          <div className="v">{fmtFull(tip.in + tip.out)}<span style={{ fontWeight: 500, color: '#D6DAE3', marginLeft: 4 }}>tokens</span></div>
          <div className="row" style={{ marginTop: 4 }}>
            <span className="sw" style={{ background: 'var(--purple-500)' }} />
            {'Total · ' + fmtFull(tip.in + tip.out)}
          </div>
          <div className="row">
            <span className="sw" style={{ background: 'var(--blue-500)' }} />
            {'Input · ' + fmtFull(tip.in)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── DonutChart ── */
function DonutChart({ data, total, label }) {
  var size = 180, cx = 90, cy = 90, r = 76, strokeW = 22;
  var C = 2 * Math.PI * r;
  var sum = data.reduce(function(a, b) { return a + b.value; }, 0) || 1;
  var acc = 0;
  return (
    <div className="donut-center">
      <svg className="donut" viewBox={"0 0 " + size + " " + size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-subtle)" strokeWidth={strokeW} />
        {data.map(function(d, i) {
          var frac = d.value / sum;
          var dash = frac * C;
          var gap = C - dash;
          var rot = -90 + (acc / sum) * 360;
          acc += d.value;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                    stroke={d.color} strokeWidth={strokeW}
                    strokeDasharray={dash + " " + gap}
                    strokeDashoffset="0"
                    transform={"rotate(" + rot + " " + cx + " " + cy + ")"}
                    strokeLinecap="butt" />
          );
        })}
      </svg>
      <div className="donut-center-text">
        <div className="v">{total}</div>
        <div className="l">{label}</div>
      </div>
    </div>
  );
}

/* ── Sparkline ── */
function Sparkline({ data, color }) {
  color = color || 'var(--purple-500)';
  var W = 110, H = 38, P = 2;
  var max = Math.max(...data, 1);
  var min = Math.min(...data, 0);
  var range = Math.max(1, max - min);
  var pts = data.map(function(v, i) {
    return {
      x: P + (i / Math.max(1, data.length - 1)) * (W - 2 * P),
      y: P + (1 - (v - min) / range) * (H - 2 * P),
    };
  });
  var line = smoothPath(pts);
  var area = line + ' L ' + pts[pts.length - 1].x + ',' + (H - P) + ' L ' + pts[0].x + ',' + (H - P) + ' Z';
  var gradId = 'sg-' + color.replace(/[^a-z0-9]/gi, '');
  return (
    <svg className="spark" viewBox={"0 0 " + W + " " + H} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={"url(#" + gradId + ")"} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.25"
            strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ── Icon helper (Lucide) ── */
function Icon({ name, size, style }) {
  size = size || 18;
  return (
    <i data-lucide={name}
       style={Object.assign({ display: 'inline-flex', width: size, height: size, color: 'currentColor' }, style || {})} />
  );
}

/* ── i18n ── */
var STR = {
  ko: {
    product: 'Token Usage Dashboard',
    productSub: 'MCP 토큰 사용량 대시보드',
    gateEyebrow: 'MCP SERVER',
    gateTitle: 'API Key 입력',
    gateBody: 'MCP 서버에 접근하기 위한 API Key를 입력하세요. 입력값은 브라우저 localStorage에만 저장됩니다.',
    gateLabel: 'API Key',
    gatePlaceholder: 'sk-mcp-…',
    gateHelp: '키는 이 브라우저에만 저장되며 외부로 전송되지 않습니다.',
    gateConnect: '접속',
    gateNoKey: '키가 없으신가요?',
    gateFootnote: 'OPUS-X · v1.0 · Samsung SDS',
    connected: '연결됨',
    refresh: '갱신',
    export: '내보내기',
    today: '오늘',
    thisMonth: '이번 달',
    cumulative: '전체 누적',
    vsYesterday: '어제 대비',
    vsLastMonth: '지난 달 대비',
    sinceStart: '서비스 시작 이후',
    dailyTitle: '일별 사용량',
    dailySub: '최근 30일 · 입력 + 출력 토큰',
    range30: '30일',
    range14: '14일',
    range7: '7일',
    legendTotal: '전체 토큰',
    legendInput: '입력 토큰',
    modelTitle: '모델별 비율',
    modelSub: '이번 달 사용량 기준',
    tableTitle: '상세 기록',
    tableSub: '날짜별 집계',
    search: '날짜 또는 모델로 검색…',
    colDate: '날짜',
    colModel: '모델',
    colIn: '입력',
    colOut: '출력',
    colTotal: '합계',
    tokens: 'tokens',
    pagerInfo: function(a, b, t) { return a + '–' + b + ' / 총 ' + t + '건'; },
    loading: '데이터를 불러오는 중…',
    empty: '아직 기록된 데이터가 없습니다.',
    noMatch: '조건에 맞는 기록이 없습니다.',
    errPrefix: '오류: ',
  },
  en: {
    product: 'Token Usage Dashboard',
    productSub: 'MCP token usage overview',
    gateEyebrow: 'MCP SERVER',
    gateTitle: 'Enter API Key',
    gateBody: "Provide an API Key to access the MCP server. The value is stored only in this browser's localStorage.",
    gateLabel: 'API Key',
    gatePlaceholder: 'sk-mcp-…',
    gateHelp: 'The key stays on this device and is never sent to a third party.',
    gateConnect: 'Connect',
    gateNoKey: 'No key yet?',
    gateFootnote: 'OPUS-X · v1.0 · Samsung SDS',
    connected: 'Connected',
    refresh: 'Refresh',
    export: 'Export',
    today: 'Today',
    thisMonth: 'This month',
    cumulative: 'All-time',
    vsYesterday: 'vs yesterday',
    vsLastMonth: 'vs last month',
    sinceStart: 'since launch',
    dailyTitle: 'Daily usage',
    dailySub: 'Last 30 days · input + output tokens',
    range30: '30 d',
    range14: '14 d',
    range7: '7 d',
    legendTotal: 'Total tokens',
    legendInput: 'Input tokens',
    modelTitle: 'By model',
    modelSub: 'Share of usage this month',
    tableTitle: 'Detailed records',
    tableSub: 'Daily aggregates',
    search: 'Search by date or model…',
    colDate: 'Date',
    colModel: 'Model',
    colIn: 'Input',
    colOut: 'Output',
    colTotal: 'Total',
    tokens: 'tokens',
    pagerInfo: function(a, b, t) { return a + '–' + b + ' of ' + t; },
    loading: 'Loading data…',
    empty: 'No records yet.',
    noMatch: 'No matching records.',
    errPrefix: 'Error: ',
  },
};

/* ── Data transform (raw /api/stats → chart-ready shapes) ── */
var MODEL_PALETTE = ['#7F56D9', '#2E90FA', '#15B79E', '#EAAA08', '#F04438', '#039855'];

function transformApiData(rows) {
  if (!rows || !rows.length) return { daily: [], models: [], tableRows: [] };

  // Daily aggregates (date → {in, out})
  var dateMap = {};
  rows.forEach(function(r) {
    if (!dateMap[r.date]) dateMap[r.date] = { in: 0, out: 0 };
    dateMap[r.date]['in']  += (r.input_tokens  || 0);
    dateMap[r.date]['out'] += (r.output_tokens || 0);
  });
  var daily = Object.keys(dateMap).sort().map(function(date) {
    var parts = date.split('-');
    return {
      label: parts[1] + '/' + parts[2],
      fullLabel: date,
      'in':  dateMap[date]['in'],
      'out': dateMap[date]['out'],
    };
  });

  // Model breakdown for current month
  var thisMonth = new Date().toISOString().slice(0, 7);
  var modelMap = {};
  rows.filter(function(r) { return r.date && r.date.slice(0, 7) === thisMonth; })
      .forEach(function(r) {
        var m = r.model || 'unknown';
        if (!modelMap[m]) modelMap[m] = 0;
        modelMap[m] += (r.total_tokens || 0);
      });
  var models = Object.entries(modelMap)
    .sort(function(a, b) { return b[1] - a[1]; })
    .map(function(entry, i) {
      var label = entry[0];
      return {
        id: label.replace('claude-', '').replace(/-\\d{8}$/, ''),
        label: label,
        color: MODEL_PALETTE[i % MODEL_PALETTE.length],
        value: entry[1],
      };
    });

  // Table rows (date + model, sorted newest first)
  var tableRows = rows.slice().sort(function(a, b) {
    return (b.date + b.model).localeCompare(a.date + a.model);
  });

  return { daily: daily, models: models, tableRows: tableRows };
}

/* ── Gate screen ── */
function Gate({ t, lang, setLang, dark, setDark, onConnect }) {
  var [val, setVal] = useState('');
  var [show, setShow] = useState(false);

  function submit(v) {
    if (v && v.trim()) onConnect(v.trim());
  }

  useEffect(function() { if (window.lucide) window.lucide.createIcons(); });

  return (
    <div className="gate">
      <div style={{ position: 'absolute', top: 20, right: 24, display: 'flex', gap: 8, zIndex: 2 }}>
        <div className="seg">
          <button className={lang === 'ko' ? 'on' : ''} onClick={function() { setLang('ko'); }}>KO</button>
          <button className={lang === 'en' ? 'on' : ''} onClick={function() { setLang('en'); }}>EN</button>
        </div>
        <button className="icon-btn" onClick={function() { setDark(!dark); }} aria-label="toggle theme">
          <Icon name={dark ? 'sun' : 'moon'} size={18} />
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
              type={show ? 'text' : 'password'}
              value={val}
              autoComplete="off"
              spellCheck={false}
              onChange={function(e) { setVal(e.target.value); }}
              onKeyDown={function(e) { if (e.key === 'Enter') submit(val); }}
              placeholder={t.gatePlaceholder}
            />
            <button className="reveal" onClick={function() { setShow(function(s) { return !s; }); }} aria-label="toggle visibility">
              <Icon name={show ? 'eye-off' : 'eye'} size={18} />
            </button>
          </div>
        </div>

        <div className="gate-help">
          <Icon name="shield-check" size={14} />
          <span>{t.gateHelp}</span>
        </div>

        <div className="gate-actions">
          <button className="link" onClick={function() { submit('sk-mcp-demo'); }}
                  style={{ textDecoration: 'none' }}>
            {t.gateNoKey} <span style={{ textDecoration: 'underline' }}>Demo</span>
          </button>
          <button className="btn primary lg" disabled={!val.trim()}
                  onClick={function() { submit(val); }}>
            {t.gateConnect}
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center',
                    font: '400 11px/16px var(--font-mono)', color: 'var(--gray-400)' }}>
        {t.gateFootnote}
      </div>
    </div>
  );
}

/* ── Dashboard screen ── */
function Dashboard({ t, lang, setLang, apiKey, onLogout, dark, setDark, data, isLoading, error, onRefresh }) {
  var [range, setRange] = useState(30);
  var [query, setQuery] = useState('');
  var [page, setPage]   = useState(1);
  var PER_PAGE = 8;

  var daily     = (data && data.daily)     || [];
  var models    = (data && data.models)    || [];
  var tableRows = (data && data.tableRows) || [];

  useEffect(function() { setPage(1); }, [query, range]);
  useEffect(function() { if (window.lucide) window.lucide.createIcons(); });

  // Derived KPI values
  var todayStr     = new Date().toISOString().slice(0, 10);
  var yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  var thisMonthStr = new Date().toISOString().slice(0, 7);
  var lastMonthStr = (function() {
    var d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 7);
  })();

  var todayRows   = tableRows.filter(function(r) { return r.date === todayStr; });
  var yesterdayRows = tableRows.filter(function(r) { return r.date === yesterdayStr; });
  var monthRows   = tableRows.filter(function(r) { return r.date && r.date.slice(0, 7) === thisMonthStr; });
  var lastMonRows = tableRows.filter(function(r) { return r.date && r.date.slice(0, 7) === lastMonthStr; });

  var todayTotal  = todayRows.reduce(function(s, r) { return s + (r.total_tokens || 0); }, 0);
  var yestTotal   = yesterdayRows.reduce(function(s, r) { return s + (r.total_tokens || 0); }, 0);
  var monthTotal  = monthRows.reduce(function(s, r) { return s + (r.total_tokens || 0); }, 0);
  var lastMonTotal= lastMonRows.reduce(function(s, r) { return s + (r.total_tokens || 0); }, 0);
  var allTotal    = tableRows.reduce(function(s, r) { return s + (r.total_tokens || 0); }, 0);

  var dayDelta    = yestTotal ? ((todayTotal - yestTotal) / yestTotal * 100) : 0;
  var monDelta    = lastMonTotal ? ((monthTotal - lastMonTotal) / lastMonTotal * 100) : 0;

  // Sparkline data arrays
  var slicedDaily = daily.slice(-range);
  var todaySpark  = daily.slice(-14).map(function(d) { return d['in'] + d['out']; });
  var monthSpark  = daily.map(function(d) { return d['in'] + d['out']; });
  var cumSpark    = (function() {
    var acc = 0;
    return daily.map(function(d) { acc += d['in'] + d['out']; return acc; });
  })();

  // Date range for page sub
  var minDate = daily.length ? daily[0].fullLabel : '';
  var maxDate = daily.length ? daily[daily.length - 1].fullLabel : '';
  var dateRange = minDate && maxDate ? minDate + ' → ' + maxDate + ' KST' : '';

  // Table filtering & pagination
  var filteredRows = useMemo(function() {
    if (!query.trim()) return tableRows;
    var q = query.toLowerCase();
    return tableRows.filter(function(r) {
      return (r.date || '').includes(q) || (r.model || '').toLowerCase().includes(q);
    });
  }, [tableRows, query]);

  var totalPages = Math.max(1, Math.ceil(filteredRows.length / PER_PAGE));
  var pgRows = filteredRows.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  var maskedKey = apiKey.length > 8
    ? apiKey.slice(0, 6) + '••••' + apiKey.slice(-4)
    : 'sk-mcp-••••';

  function modelColor(modelLabel) {
    var found = models.find(function(m) { return m.label === modelLabel; });
    return found ? found.color : '#98A2B3';
  }

  function shortModel(m) {
    return (m || '').replace('claude-', '').replace(/-\\d{8}$/, '');
  }

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">X</span>
          <span className="brand-name">AX-Lab</span>
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
          <button className={lang === 'ko' ? 'on' : ''} onClick={function() { setLang('ko'); }}>KO</button>
          <button className={lang === 'en' ? 'on' : ''} onClick={function() { setLang('en'); }}>EN</button>
        </div>
        <button className="icon-btn" onClick={function() { setDark(!dark); }} aria-label="toggle theme">
          <Icon name={dark ? 'sun' : 'moon'} size={18} />
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
              {t.productSub}
              {dateRange && <span> · <span className="mono">{dateRange}</span></span>}
            </p>
          </div>
          <div className="page-actions">
            <button className="btn outline md">
              <Icon name="download" size={16} />
              {t.export}
            </button>
            <button className="btn primary md" onClick={onRefresh} disabled={isLoading}>
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
            <Sparkline data={todaySpark.length ? todaySpark : [0]} color="#7F56D9" />
            <div className="kpi-meta">
              <span className={"kpi-delta " + (dayDelta >= 0 ? 'up' : 'down')}>
                <Icon name={dayDelta >= 0 ? 'trending-up' : 'trending-down'} size={12} />
                {(dayDelta >= 0 ? '+' : '') + dayDelta.toFixed(1) + '%'}
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
            <Sparkline data={monthSpark.length ? monthSpark : [0]} color="#039855" />
            <div className="kpi-meta">
              <span className={"kpi-delta " + (monDelta >= 0 ? 'up' : 'down')}>
                <Icon name={monDelta >= 0 ? 'trending-up' : 'trending-down'} size={12} />
                {(monDelta >= 0 ? '+' : '') + monDelta.toFixed(1) + '%'}
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
              {fmtNum(allTotal)}
              <span className="unit">{t.tokens}</span>
            </div>
            <Sparkline data={cumSpark.length ? cumSpark : [0]} color="#1570EF" />
            <div className="kpi-meta">
              <span className="kpi-delta up">
                <Icon name="database" size={12} />
                {tableRows.length + (lang === 'ko' ? '개 레코드' : ' records')}
              </span>
              <span className="kpi-foot">{t.sinceStart}</span>
            </div>
          </div>
        </div>

        {/* Charts row */}
        <div className="row-2">
          <section className="card">
            <div className="card-head">
              <div>
                <h2 className="card-title">{t.dailyTitle}</h2>
                <div className="card-sub">{t.dailySub}</div>
              </div>
              <div className="chip-row">
                <span className={"chip " + (range === 7  ? 'on' : '')} onClick={function() { setRange(7);  }}>{t.range7}</span>
                <span className={"chip " + (range === 14 ? 'on' : '')} onClick={function() { setRange(14); }}>{t.range14}</span>
                <span className={"chip " + (range === 30 ? 'on' : '')} onClick={function() { setRange(30); }}>{t.range30}</span>
              </div>
            </div>
            <div className="chart-legend">
              <span className="item"><span className="swatch" style={{ background: '#7F56D9' }} />{t.legendTotal}</span>
              <span className="item"><span className="swatch" style={{ background: '#2E90FA' }} />{t.legendInput}</span>
            </div>
            <div className="chart-wrap">
              {slicedDaily.length > 0
                ? <AreaChart data={slicedDaily} height={260} />
                : <div className="empty-state">{isLoading ? t.loading : t.empty}</div>
              }
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <div>
                <h2 className="card-title">{t.modelTitle}</h2>
                <div className="card-sub">{t.modelSub}</div>
              </div>
            </div>
            <div className="donut-wrap">
              {models.length > 0
                ? <>
                    <DonutChart data={models} total={fmtNum(models.reduce(function(a, b) { return a + b.value; }, 0))} label={t.tokens} />
                    <div className="donut-list">
                      {models.map(function(m) {
                        var tot = models.reduce(function(a, b) { return a + b.value; }, 0);
                        var pct = tot ? (m.value / tot * 100) : 0;
                        return (
                          <div className="row" key={m.id}>
                            <span className="sw" style={{ background: m.color }} />
                            <span className="name">{m.label}</span>
                            <span className="pct">{pct.toFixed(1) + '%'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                : <div className="empty-state">{isLoading ? t.loading : t.empty}</div>
              }
            </div>
          </section>
        </div>

        {/* Table */}
        <section className="card">
          <div className="card-head">
            <div>
              <h2 className="card-title">{t.tableTitle}</h2>
              <div className="card-sub">{t.tableSub + ' · ' + filteredRows.length}</div>
            </div>
          </div>
          <div className="table-toolbar">
            <div className="search">
              <Icon name="search" size={16} />
              <input
                value={query}
                onChange={function(e) { setQuery(e.target.value); }}
                placeholder={t.search}
              />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--gray-500)' }}>
              {filteredRows.length + (lang === 'ko' ? '건' : ' results')}
            </span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>{t.colDate}</th>
                <th>{t.colModel}</th>
                <th className="num">{t.colIn}</th>
                <th className="num">{t.colOut}</th>
                <th className="num">{t.colTotal}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 48, color: 'var(--gray-400)' }}>{t.loading}</td></tr>
              )}
              {!isLoading && error && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 48, color: 'var(--red-600)' }}>{t.errPrefix + error}</td></tr>
              )}
              {!isLoading && !error && pgRows.map(function(r, idx) {
                var col = modelColor(r.model);
                return (
                  <tr key={r.date + '-' + r.model + '-' + idx}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.date || '—'}</td>
                    <td>
                      <span className="model-cell">
                        <span className="dot" style={{ background: col }} />
                        {shortModel(r.model)}
                      </span>
                    </td>
                    <td className="num">{(r.input_tokens  || 0).toLocaleString()}</td>
                    <td className="num">{(r.output_tokens || 0).toLocaleString()}</td>
                    <td className="num" style={{ fontWeight: 700 }}>{(r.total_tokens  || 0).toLocaleString()}</td>
                  </tr>
                );
              })}
              {!isLoading && !error && pgRows.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 48, color: 'var(--gray-400)' }}>
                  {tableRows.length === 0 ? t.empty : t.noMatch}
                </td></tr>
              )}
            </tbody>
          </table>

          <div className="table-foot">
            <span>
              {filteredRows.length > 0
                ? t.pagerInfo((page - 1) * PER_PAGE + 1, Math.min(page * PER_PAGE, filteredRows.length), filteredRows.length)
                : t.pagerInfo(0, 0, 0)}
            </span>
            <div className="pager">
              <button onClick={function() { setPage(function(p) { return Math.max(1, p - 1); }); }} aria-label="prev">
                <Icon name="chevron-left" size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, function(_, i) { return i + 1; }).map(function(p) {
                return (
                  <button key={p} className={page === p ? 'on' : ''} onClick={function() { setPage(p); }}>
                    {p}
                  </button>
                );
              })}
              <button onClick={function() { setPage(function(p) { return Math.min(totalPages, p + 1); }); }} aria-label="next">
                <Icon name="chevron-right" size={14} />
              </button>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}

/* ── App root ── */
function App() {
  var [lang, setLang]       = useState('ko');
  var [dark, setDark]       = useState(false);
  var [apiKey, setApiKey]   = useState('');
  var [data, setData]       = useState(null);
  var [isLoading, setIsLoading] = useState(false);
  var [error, setError]     = useState(null);

  // Restore from localStorage on mount
  useEffect(function() {
    try {
      var key = localStorage.getItem('opusx.mcp.apikey');
      var l   = localStorage.getItem('opusx.mcp.lang');
      var d   = localStorage.getItem('opusx.mcp.dark');
      if (key) setApiKey(key);
      if (l)   setLang(l);
      if (d)   setDark(d === 'true');
    } catch(e) {}
  }, []);

  // Persist theme
  useEffect(function() {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    try { localStorage.setItem('opusx.mcp.dark', String(dark)); } catch(e) {}
  }, [dark]);

  // Persist lang
  useEffect(function() {
    try { localStorage.setItem('opusx.mcp.lang', lang); } catch(e) {}
  }, [lang]);

  // Fetch data whenever apiKey changes
  useEffect(function() {
    if (apiKey) loadData();
  }, [apiKey]);

  function loadData() {
    setIsLoading(true);
    setError(null);
    fetch(API_BASE + '/api/stats?limit=90', {
      headers: { 'Authorization': 'Bearer ' + apiKey },
    })
    .then(function(res) {
      if (res.status === 401) { onLogout(); return null; }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function(rows) {
      if (rows !== null) setData(transformApiData(rows));
    })
    .catch(function(e) {
      setError(e.message);
    })
    .finally(function() {
      setIsLoading(false);
    });
  }

  function onConnect(key) {
    try { localStorage.setItem('opusx.mcp.apikey', key); } catch(e) {}
    setApiKey(key);
  }

  function onLogout() {
    try { localStorage.removeItem('opusx.mcp.apikey'); } catch(e) {}
    setApiKey('');
    setData(null);
    setError(null);
  }

  useEffect(function() { if (window.lucide) window.lucide.createIcons(); });

  var t = STR[lang] || STR.ko;

  if (!apiKey) {
    return <Gate t={t} lang={lang} setLang={setLang} dark={dark} setDark={setDark} onConnect={onConnect} />;
  }
  return (
    <Dashboard t={t} lang={lang} setLang={setLang}
               apiKey={apiKey} onLogout={onLogout}
               dark={dark} setDark={setDark}
               data={data} isLoading={isLoading} error={error}
               onRefresh={loadData} />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
</script>
</body>
</html>`;
}
