// Dashboard HTML template served at GET /dashboard
// All JS inside uses string concatenation (not template literals) to avoid
// escaping conflicts with the outer TypeScript template literal.
export function dashboardHtml(apiBase: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Token Usage Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f0f2f5; --surface: #ffffff; --border: #e2e8f0;
    --primary: #4f46e5; --primary-light: #eef2ff;
    --text: #1e293b; --muted: #64748b;
    --green: #10b981; --amber: #f59e0b; --red: #ef4444;
    --radius: 12px; --shadow: 0 1px 4px rgba(0,0,0,0.08);
  }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
         background: var(--bg); color: var(--text); min-height: 100vh; }
  header { background: var(--surface); border-bottom: 1px solid var(--border);
           padding: 0 24px; display: flex; align-items: center;
           justify-content: space-between; height: 56px; position: sticky; top: 0; z-index: 10; }
  header h1 { font-size: 17px; font-weight: 700; color: var(--primary); letter-spacing: -0.3px; }
  .key-area { display: flex; align-items: center; gap: 8px; }
  .key-area input { border: 1px solid var(--border); border-radius: 8px; padding: 6px 10px;
                    font-size: 13px; width: 220px; outline: none; transition: border .15s; }
  .key-area input:focus { border-color: var(--primary); }
  .key-area button { background: var(--primary); color: #fff; border: none; border-radius: 8px;
                     padding: 6px 14px; font-size: 13px; cursor: pointer; font-weight: 600; }
  .key-area button:hover { opacity: 0.88; }
  main { max-width: 1100px; margin: 0 auto; padding: 24px 20px; }
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .card { background: var(--surface); border-radius: var(--radius); padding: 20px 24px;
          box-shadow: var(--shadow); border: 1px solid var(--border); }
  .card-label { font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase;
                letter-spacing: 0.5px; margin-bottom: 8px; }
  .card-value { font-size: 28px; font-weight: 800; letter-spacing: -1px; color: var(--text); }
  .card-sub { font-size: 12px; color: var(--muted); margin-top: 4px; }
  .charts { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 24px; }
  .chart-box { background: var(--surface); border-radius: var(--radius); padding: 20px 24px;
               box-shadow: var(--shadow); border: 1px solid var(--border); }
  .chart-box h2 { font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase;
                  letter-spacing: 0.5px; margin-bottom: 16px; }
  .chart-wrap { position: relative; }
  .table-box { background: var(--surface); border-radius: var(--radius); padding: 20px 24px;
               box-shadow: var(--shadow); border: 1px solid var(--border); }
  .table-box h2 { font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase;
                  letter-spacing: 0.5px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 8px 12px; font-weight: 600; color: var(--muted);
       border-bottom: 2px solid var(--border); font-size: 11px; text-transform: uppercase; }
  td { padding: 9px 12px; border-bottom: 1px solid var(--border); }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--primary-light); }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .badge { display: inline-block; background: var(--primary-light); color: var(--primary);
           border-radius: 4px; padding: 2px 7px; font-size: 11px; font-weight: 600; }
  .status { text-align: center; padding: 40px; color: var(--muted); font-size: 14px; }
  .err { color: var(--red); }
  #overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5);
             display: flex; align-items: center; justify-content: center; z-index: 100; }
  .modal { background: var(--surface); border-radius: 16px; padding: 32px; width: 360px;
           box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
  .modal h2 { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
  .modal p { font-size: 13px; color: var(--muted); margin-bottom: 20px; line-height: 1.5; }
  .modal input { width: 100%; border: 1px solid var(--border); border-radius: 8px;
                 padding: 10px 12px; font-size: 14px; margin-bottom: 12px; outline: none; }
  .modal input:focus { border-color: var(--primary); }
  .modal button { width: 100%; background: var(--primary); color: #fff; border: none;
                  border-radius: 8px; padding: 11px; font-size: 14px; font-weight: 700; cursor: pointer; }
  @media (max-width: 700px) {
    .cards { grid-template-columns: 1fr; }
    .charts { grid-template-columns: 1fr; }
    .key-area input { width: 140px; }
  }
</style>
</head>
<body>

<div id="overlay">
  <div class="modal">
    <h2>API Key 입력</h2>
    <p>MCP 서버에 접근하기 위한 API Key를 입력하세요.<br>입력값은 브라우저 localStorage에만 저장됩니다.</p>
    <input type="password" id="modal-key" placeholder="Bearer token..." autocomplete="off">
    <button id="modal-btn">접속</button>
  </div>
</div>

<header>
  <h1>Token Usage Dashboard</h1>
  <div class="key-area">
    <input type="password" id="header-key" placeholder="API Key" autocomplete="off">
    <button id="header-btn">갱신</button>
  </div>
</header>

<main>
  <div class="cards">
    <div class="card">
      <div class="card-label">오늘</div>
      <div class="card-value" id="today-val">—</div>
      <div class="card-sub" id="today-sub"></div>
    </div>
    <div class="card">
      <div class="card-label">이번 달</div>
      <div class="card-value" id="month-val">—</div>
      <div class="card-sub" id="month-sub"></div>
    </div>
    <div class="card">
      <div class="card-label">전체 누적</div>
      <div class="card-value" id="total-val">—</div>
      <div class="card-sub" id="total-sub"></div>
    </div>
  </div>

  <div class="charts">
    <div class="chart-box">
      <h2>일별 사용량 (최근 30일)</h2>
      <div class="chart-wrap" style="height:220px">
        <canvas id="bar-chart"></canvas>
      </div>
    </div>
    <div class="chart-box">
      <h2>모델별 비율</h2>
      <div class="chart-wrap" style="height:220px">
        <canvas id="donut-chart"></canvas>
      </div>
    </div>
  </div>

  <div class="table-box">
    <h2>상세 기록</h2>
    <div id="table-wrap"><p class="status">API Key를 입력하면 데이터를 불러옵니다.</p></div>
  </div>
</main>

<script>
(function() {
  var API_BASE = '${apiBase}';
  var STORAGE_KEY = 'mcp_dashboard_api_key';
  var barChart = null;
  var donutChart = null;

  // ── 유틸 ──────────────────────────────────────────────────────
  function fmt(n) {
    if (n == null) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function thisMonth() {
    return new Date().toISOString().slice(0, 7);
  }

  // ── 오버레이 ──────────────────────────────────────────────────
  var overlay = document.getElementById('overlay');
  var modalKey = document.getElementById('modal-key');
  var headerKey = document.getElementById('header-key');

  function showOverlay() { overlay.style.display = 'flex'; }
  function hideOverlay() { overlay.style.display = 'none'; }

  document.getElementById('modal-btn').addEventListener('click', function() {
    var k = modalKey.value.trim();
    if (!k) return;
    localStorage.setItem(STORAGE_KEY, k);
    headerKey.value = k;
    hideOverlay();
    loadAndRender(k);
  });

  modalKey.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('modal-btn').click();
  });

  document.getElementById('header-btn').addEventListener('click', function() {
    var k = headerKey.value.trim();
    if (!k) return;
    localStorage.setItem(STORAGE_KEY, k);
    loadAndRender(k);
  });

  // ── 데이터 로딩 ───────────────────────────────────────────────
  function loadAndRender(apiKey) {
    document.getElementById('table-wrap').innerHTML = '<p class="status">불러오는 중...</p>';
    fetch(API_BASE + '/api/stats?limit=90', {
      headers: { 'Authorization': 'Bearer ' + apiKey }
    })
    .then(function(r) {
      if (r.status === 401) throw new Error('API Key가 올바르지 않습니다. (401)');
      if (!r.ok) throw new Error('서버 오류: HTTP ' + r.status);
      return r.json();
    })
    .then(function(data) { render(data); })
    .catch(function(e) {
      document.getElementById('table-wrap').innerHTML =
        '<p class="status err">오류: ' + e.message + '</p>';
      ['today-val','month-val','total-val'].forEach(function(id) {
        document.getElementById(id).textContent = '—';
      });
    });
  }

  // ── 렌더링 ────────────────────────────────────────────────────
  function render(rows) {
    if (!rows || rows.length === 0) {
      document.getElementById('table-wrap').innerHTML =
        '<p class="status">아직 기록된 데이터가 없습니다.</p>';
      return;
    }

    var td = today();
    var tm = thisMonth();

    // 요약 카드
    var todayRows  = rows.filter(function(r) { return r.date === td; });
    var monthRows  = rows.filter(function(r) { return r.date && r.date.slice(0,7) === tm; });
    var todayTok   = todayRows.reduce(function(s, r) { return s + (r.total_tokens || 0); }, 0);
    var monthTok   = monthRows.reduce(function(s, r) { return s + (r.total_tokens || 0); }, 0);
    var totalTok   = rows.reduce(function(s, r) { return s + (r.total_tokens || 0); }, 0);
    var todayCalls = todayRows.reduce(function(s, r) { return s + 1; }, 0);
    var monthCalls = monthRows.length;

    document.getElementById('today-val').textContent = fmt(todayTok);
    document.getElementById('today-sub').textContent = todayCalls + '개 모델 조합';
    document.getElementById('month-val').textContent = fmt(monthTok);
    document.getElementById('month-sub').textContent = monthCalls + '개 레코드';
    document.getElementById('total-val').textContent = fmt(totalTok);
    document.getElementById('total-sub').textContent = rows.length + '개 레코드 합계';

    // 바 차트 — 날짜별 집계 (최근 30일)
    var dateMap = {};
    rows.forEach(function(r) {
      if (!dateMap[r.date]) dateMap[r.date] = 0;
      dateMap[r.date] += (r.total_tokens || 0);
    });
    var sortedDates = Object.keys(dateMap).sort().slice(-30);
    var barData = sortedDates.map(function(d) { return dateMap[d]; });

    if (barChart) barChart.destroy();
    var barCtx = document.getElementById('bar-chart').getContext('2d');
    barChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: sortedDates.map(function(d) { return d.slice(5); }),
        datasets: [{
          label: '토큰',
          data: barData,
          backgroundColor: 'rgba(79,70,229,0.75)',
          borderRadius: 4,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false },
                   tooltip: { callbacks: { label: function(c) { return ' ' + fmt(c.raw) + ' tokens'; } } } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 45 } },
          y: { grid: { color: '#f0f2f5' }, ticks: { callback: function(v) { return fmt(v); }, font: { size: 10 } } }
        }
      }
    });

    // 도넛 차트 — 모델별 집계
    var modelMap = {};
    rows.forEach(function(r) {
      var m = r.model || 'unknown';
      if (!modelMap[m]) modelMap[m] = 0;
      modelMap[m] += (r.total_tokens || 0);
    });
    var modelNames = Object.keys(modelMap);
    var modelVals  = modelNames.map(function(m) { return modelMap[m]; });
    var palette = ['#4f46e5','#7c3aed','#2563eb','#0891b2','#059669','#d97706'];

    if (donutChart) donutChart.destroy();
    var donutCtx = document.getElementById('donut-chart').getContext('2d');
    donutChart = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: modelNames.map(function(m) { return m.replace('claude-','').replace(/-\d{4}.*$/,''); }),
        datasets: [{ data: modelVals, backgroundColor: palette, borderWidth: 0, hoverOffset: 6 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '62%',
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12, boxWidth: 12 } },
          tooltip: { callbacks: { label: function(c) { return ' ' + fmt(c.raw) + ' tokens'; } } }
        }
      }
    });

    // 테이블
    var html = '<table><thead><tr>'
      + '<th>날짜</th><th>모델</th>'
      + '<th style="text-align:right">입력</th>'
      + '<th style="text-align:right">출력</th>'
      + '<th style="text-align:right">합계</th>'
      + '</tr></thead><tbody>';

    var sorted = rows.slice().sort(function(a, b) {
      return (b.date + b.model).localeCompare(a.date + a.model);
    });

    sorted.forEach(function(r) {
      var shortModel = (r.model || '').replace('claude-', '').replace(/-\d{4}.*$/, '');
      html += '<tr>'
        + '<td>' + (r.date || '—') + '</td>'
        + '<td><span class="badge">' + shortModel + '</span></td>'
        + '<td class="num">' + (r.input_tokens || 0).toLocaleString() + '</td>'
        + '<td class="num">' + (r.output_tokens || 0).toLocaleString() + '</td>'
        + '<td class="num"><strong>' + (r.total_tokens || 0).toLocaleString() + '</strong></td>'
        + '</tr>';
    });

    html += '</tbody></table>';
    document.getElementById('table-wrap').innerHTML = html;
  }

  // ── 초기화 ────────────────────────────────────────────────────
  var stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    headerKey.value = stored;
    hideOverlay();
    loadAndRender(stored);
  } else {
    showOverlay();
  }
})();
</script>
</body>
</html>`;
}
