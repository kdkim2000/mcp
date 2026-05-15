/* charts.jsx — Inline SVG charts for the OPUS-X Token Usage Dashboard.
   Exports AreaChart and DonutChart to window. */

const { useState, useMemo, useRef } = React;

/* ───────── helpers ───────── */
function fmtNum(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2).replace(/\.?0+$/, '') + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.?0+$/, '') + 'K';
  return String(n);
}
function fmtFull(n) {
  return n.toLocaleString('en-US');
}

/* Smooth catmull-rom-ish path so the area doesn't look like a polyline. */
function smoothPath(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    // tension 0.5 cardinal
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

/* ───────── AreaChart ─────────
   props: data: [{label, in, out}], width, height
*/
function AreaChart({ data, height = 280 }) {
  const wrapRef = useRef(null);
  const [hover, setHover] = useState(null);
  // Use a fixed viewBox; SVG scales responsively.
  const W = 800, H = height;
  const PAD = { l: 56, r: 16, t: 16, b: 36 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const max = useMemo(() => {
    const m = Math.max(1, ...data.map(d => d.in + d.out));
    // round up to nearest nice unit
    const pow = Math.pow(10, Math.floor(Math.log10(m)));
    return Math.ceil(m / pow) * pow;
  }, [data]);

  const xFor = (i) => PAD.l + (i / (data.length - 1)) * innerW;
  const yFor = (v) => PAD.t + innerH - (v / max) * innerH;

  const totalPts = data.map((d, i) => ({ x: xFor(i), y: yFor(d.in + d.out), d }));
  const inPts    = data.map((d, i) => ({ x: xFor(i), y: yFor(d.in), d }));

  const totalLine = smoothPath(totalPts);
  const inLine    = smoothPath(inPts);
  const baselineY = PAD.t + innerH;
  const totalArea = `${totalLine} L ${totalPts[totalPts.length-1].x},${baselineY} L ${totalPts[0].x},${baselineY} Z`;
  const inArea    = `${inLine} L ${inPts[inPts.length-1].x},${baselineY} L ${inPts[0].x},${baselineY} Z`;

  // Y-axis ticks
  const yTicks = [0, .25, .5, .75, 1].map(t => ({
    v: max * t,
    y: PAD.t + innerH - t * innerH,
  }));

  // X-axis labels — show ~6 evenly spaced
  const xTickStep = Math.max(1, Math.floor(data.length / 6));

  const onMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    // map client x → viewBox x
    const xView = ((e.clientX - rect.left) / rect.width) * W;
    if (xView < PAD.l || xView > W - PAD.r) { setHover(null); return; }
    const i = Math.round(((xView - PAD.l) / innerW) * (data.length - 1));
    const clamped = Math.max(0, Math.min(data.length - 1, i));
    setHover({
      i: clamped,
      // For the floating div, use the SVG's px position (scaled):
      px: (xFor(clamped) / W) * rect.width,
      py: (yFor(data[clamped].in + data[clamped].out) / H) * rect.height,
    });
  };

  const tip = hover != null && data[hover.i];

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <svg
        className="chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="var(--purple-500)" stopOpacity=".30" />
            <stop offset="100%" stopColor="var(--purple-500)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="var(--blue-500)" stopOpacity=".22" />
            <stop offset="100%" stopColor="var(--blue-500)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y gridlines + tick labels */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD.l} x2={W - PAD.r}
              y1={t.y} y2={t.y}
              stroke="var(--border-subtle)" strokeDasharray={i === 0 ? "0" : "3 3"}
            />
            <text
              x={PAD.l - 10} y={t.y + 4}
              textAnchor="end"
              fill="var(--gray-400)"
              style={{ font: '500 11px/14px var(--font-mono)' }}
            >
              {fmtNum(t.v)}
            </text>
          </g>
        ))}

        {/* X labels */}
        {data.map((d, i) => (
          (i % xTickStep === 0 || i === data.length - 1) && (
            <text key={i}
              x={xFor(i)} y={H - 12}
              textAnchor="middle"
              fill="var(--gray-400)"
              style={{ font: '500 11px/14px var(--font-mono)' }}
            >
              {d.label}
            </text>
          )
        ))}

        {/* Areas */}
        <path d={totalArea} fill="url(#gradTotal)" />
        <path d={inArea}    fill="url(#gradIn)" />

        {/* Lines */}
        <path d={totalLine} fill="none"
              stroke="var(--purple-500)" strokeWidth="2"
              strokeLinejoin="round" strokeLinecap="round" />
        <path d={inLine}    fill="none"
              stroke="var(--blue-500)"   strokeWidth="2"
              strokeLinejoin="round" strokeLinecap="round" />

        {/* Hover marker */}
        {hover != null && (
          <g>
            <line
              x1={xFor(hover.i)} x2={xFor(hover.i)}
              y1={PAD.t} y2={PAD.t + innerH}
              stroke="var(--gray-300)" strokeDasharray="3 3"
            />
            <circle cx={xFor(hover.i)} cy={yFor(data[hover.i].in + data[hover.i].out)}
                    r="5" fill="var(--bg-base)" stroke="var(--purple-500)" strokeWidth="2" />
            <circle cx={xFor(hover.i)} cy={yFor(data[hover.i].in)}
                    r="4" fill="var(--bg-base)" stroke="var(--blue-500)" strokeWidth="2" />
          </g>
        )}
      </svg>

      {/* Tooltip (HTML overlay so fonts render crisply) */}
      {tip && (
        <div
          className="chart-tip on"
          style={{ left: hover.px, top: Math.max(40, hover.py - 8) }}
        >
          <span className="l">{tip.fullLabel || tip.label}</span>
          <div className="v">{fmtFull(tip.in + tip.out)}<span style={{ fontWeight: 500, color:'#D6DAE3', marginLeft:4 }}>tokens</span></div>
          <div className="row" style={{ marginTop: 4 }}>
            <span className="sw" style={{ background: 'var(--purple-500)' }} />
            Total · {fmtFull(tip.in + tip.out)}
          </div>
          <div className="row">
            <span className="sw" style={{ background: 'var(--blue-500)' }} />
            Input · {fmtFull(tip.in)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────── DonutChart ─────────
   props: data: [{label, value, color}]
*/
function DonutChart({ data, total, label }) {
  const size = 180;
  const cx = size / 2, cy = size / 2;
  const r = 76;
  const strokeW = 22;
  const C = 2 * Math.PI * r;

  const sum = data.reduce((a, b) => a + b.value, 0) || 1;
  let acc = 0;
  return (
    <div className="donut-center">
      <svg className="donut" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r}
                fill="none" stroke="var(--border-subtle)" strokeWidth={strokeW} />
        {data.map((d, i) => {
          const frac = d.value / sum;
          const dash = frac * C;
          const gap  = C - dash;
          // rotate so each slice sits at its angle; start at -90 (top)
          const rot = -90 + (acc / sum) * 360;
          acc += d.value;
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeW}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset="0"
              transform={`rotate(${rot} ${cx} ${cy})`}
              strokeLinecap="butt"
            />
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

/* ───────── Tiny sparkline for KPI cards ───────── */
function Sparkline({ data, color = 'var(--purple-500)' }) {
  const W = 110, H = 38, P = 2;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = Math.max(1, max - min);
  const pts = data.map((v, i) => ({
    x: P + (i / (data.length - 1)) * (W - 2 * P),
    y: P + (1 - (v - min) / range) * (H - 2 * P),
  }));
  const line = smoothPath(pts);
  const area = `${line} L ${pts[pts.length-1].x},${H-P} L ${pts[0].x},${H-P} Z`;
  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace(/[^a-z0-9]/gi,'')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={color} stopOpacity=".25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace(/[^a-z0-9]/gi,'')})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.25"
            strokeLinejoin="round" strokeLinecap="round"
            vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

Object.assign(window, { AreaChart, DonutChart, Sparkline, fmtNum, fmtFull });
