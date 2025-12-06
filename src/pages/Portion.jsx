import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Portion.css";

/*
  Full interactive Portion page with:
  - food inputs (kg)
  - people + appetite
  - timer with animated circle
  - Bar chart (available vs needed)
  - Donut charts (per-item percent used)
  - Line chart (trend over time)
  - Visual-only feedback (colors/badges) — no text AI outputs
*/

function Donut({ value, size = 80, stroke = 12, color = "#10b981", bg = "#e6eef0" }) {
  // value 0..1
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, value)) * c;
  return (
    <svg width={size} height={size} className="donut-svg">
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={r} fill="none" stroke={bg} strokeWidth={stroke} />
        <circle
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90)"
        />
      </g>
    </svg>
  );
}

function BarChart({ items, people, appetite }) {
  // items: {name, leftKg, perPersonKg}
  // For each item compute neededKg and availableKg
  const data = items.map((it) => {
    const available = Number(it.leftKg) || 0;
    const needed = (it.perPersonKg || 0) * appetite * people;
    return { ...it, available, needed, percent: available === 0 ? 0 : Math.min(1.5, needed / Math.max(0.0001, available)) };
  });

  const maxVal = Math.max(...data.map((d) => Math.max(d.available, d.needed)), 1);

  return (
    <div className="chart-bar">
      {data.map((d) => {
        const availHeight = (d.available / maxVal) * 100;
        const needHeight = (d.needed / maxVal) * 100;
        const color = d.needed <= d.available ? "#10b981" : "#ef4444";
        return (
          <div key={d.id} className="bar-col">
            <div className="bar-stack">
              <div className="bar-available" style={{ height: `${Math.max(3, availHeight)}%` }} />
              <div className="bar-needed" style={{ height: `${Math.max(3, needHeight)}%`, background: color, opacity: 0.9 }} />
            </div>
            <div className="bar-label">
              <div className="bar-name">{d.icon} {d.name}</div>
              <div className="bar-nums">
                <span className="muted small">{d.available}kg</span>
                <span className="muted small">{Math.round(d.needed * 1000)}g</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({ history }) {
  // Render simple SVG line chart. history = [{t, riceNeeded, dalNeeded, curryNeeded}, ...]
  const width = 420;
  const height = 120;
  const padding = 20;
  if (!history.length) return <div className="line-empty">—</div>;

  // build series for total needed (sum of needed kg)
  const points = history.map((h) => {
    const total = (h.values || []).reduce((s, v) => s + v, 0);
    return { t: h.t, total };
  });

  const max = Math.max(...points.map((p) => p.total), 0.001);
  const stepX = (width - padding * 2) / Math.max(1, points.length - 1);

  const pathD = points.map((p, i) => {
    const x = padding + i * stepX;
    const y = height - padding - (p.total / max) * (height - padding * 2);
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  return (
    <svg className="line-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <rect x="0" y="0" width={width} height={height} fill="transparent" />
      {/* grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((g, idx) => {
        const y = padding + (height - padding * 2) * g;
        return <line key={idx} x1={padding} x2={width - padding} y1={y} y2={y} stroke="#eef2f3" strokeWidth="1" />;
      })}
      <path d={pathD} fill="none" stroke="#0ea5a4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* circles */}
      {points.map((p, i) => {
        const x = padding + i * stepX;
        const y = height - padding - (p.total / max) * (height - padding * 2);
        return <circle key={i} cx={x} cy={y} r={3} fill="#0ea5a4" />;
      })}
    </svg>
  );
}

export default function Portion() {
  // items with per-person kg
  const [items, setItems] = useState([
    { id: 1, name: "Rice", icon: "🍚", leftKg: 1.2, perPersonKg: 0.15 },
    { id: 2, name: "Dal", icon: "🥣", leftKg: 0.8, perPersonKg: 0.08 },
    { id: 3, name: "Curry", icon: "🍛", leftKg: 0.6, perPersonKg: 0.12 },
  ]);

  const [people, setPeople] = useState(2);
  const [appetite, setAppetite] = useState(1); // 0.8..1.2

  // Timer
  const [timerMins, setTimerMins] = useState("");
  const [initialTimer, setInitialTimer] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  // push snapshot history for line chart
  const [history, setHistory] = useState([]);

  // update timer
  useEffect(() => {
    if (running && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(timerRef.current);
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  // compute needed & available data for charts
  const computed = useMemo(() => {
    return items.map((it) => {
      const available = Number(it.leftKg) || 0;
      const needed = it.perPersonKg * appetite * people; // kg
      const percentUsed = available === 0 ? 0 : Math.min(1.5, needed / Math.max(0.0001, available)); // allow >1
      return { ...it, available, needed, percentUsed };
    });
  }, [items, people, appetite]);

  // total needed (kg)
  const totals = useMemo(() => {
    return computed.reduce((s, it) => s + it.needed, 0);
  }, [computed]);

  // update history when key inputs change
  useEffect(() => {
    const snapshot = {
      t: Date.now(),
      values: computed.map((c) => c.needed),
    };
    setHistory((h) => {
      const next = [...h, snapshot].slice(-20); // last 20
      return next;
    });
  }, [items, people, appetite]); // eslint-disable-line

  // handlers
  const updateLeft = (id, value) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, leftKg: value === "" ? "" : Number(value) } : it)));
  };

  const startTimer = () => {
    const mins = Math.floor(Number(timerMins) || 0);
    if (mins <= 0) return;
    const secs = mins * 60;
    setInitialTimer(secs);
    setSecondsLeft(secs);
    setRunning(true);
  };

  const resetTimer = () => {
    setRunning(false);
    setSecondsLeft(0);
    setInitialTimer(0);
    setTimerMins("");
  };

  // helpers for donut percent (0..1)
  const donutPercent = (it) => {
    if (!it.available || it.available <= 0) return 0;
    return Math.min(1, it.needed / it.available);
  };

  // timer circle values
  const circleR = 54;
  const circumference = 2 * Math.PI * circleR;
  const timerProgress = initialTimer > 0 ? (initialTimer - secondsLeft) / initialTimer : 0;
  const strokeOffset = Math.max(0, circumference * (1 - timerProgress));

  return (
    <div className="portion-page">
      <div className="portion-shell">

        {/* Header */}
        <header className="portion-header">
          <h1>Smart Portion Dashboard</h1>
          <p className="portion-subtitle">Graphical, live, interactive — visual feedback only</p>
        </header>

        <div className="grid-2">
          {/* Left column: controls + charts */}
          <div className="left-col">

            {/* Food inputs */}
            <section className="portion-card">
              <h2>Food (donor)</h2>
              <div className="food-list">
                {items.map((it) => (
                  <div key={it.id} className="food-row">
                    <div className="food-meta">
                      <div className="food-icon">{it.icon}</div>
                      <div>
                        <div className="food-name">{it.name}</div>
                        <div className="muted small">per person {Math.round(it.perPersonKg * 1000)} g</div>
                      </div>
                    </div>

                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      className="food-input"
                      value={it.leftKg === "" ? "" : it.leftKg}
                      onChange={(e) => updateLeft(it.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* People & appetite */}
            <section className="portion-card">
              <div className="people-top">
                <div>
                  <h2>People</h2>
                  <div className="people-control">
                    <button className="circle-btn" onClick={() => setPeople((p) => Math.max(1, p - 1))}>−</button>
                    <div className="people-value">{people}</div>
                    <button className="circle-btn" onClick={() => setPeople((p) => p + 1)}>+</button>
                  </div>
                </div>

                <div>
                  <h2>Appetite</h2>
                  <div className="appetite-wrap">
                    <span className="small">Light</span>
                    <input type="range" min="0.8" max="1.2" step="0.1" value={appetite} onChange={(e) => setAppetite(Number(e.target.value))} />
                    <span className="small">Heavy</span>
                  </div>
                </div>
              </div>

              <div className="summary-row">
                <div className="summary-card">
                  <div className="summary-number">{Number.isFinite(Math.min(...items.map(it => servingsFrom(it, appetite, people)))) ? Math.min(...items.map(it => servingsFrom(it, appetite, people))) : '—'}</div>
                  <div className="summary-label">Max possible</div>
                </div>

                <div className="summary-card">
                  <div className="summary-number">{Math.round(appetite * 100)}%</div>
                  <div className="summary-label">Appetite</div>
                </div>

                <div className="summary-card">
                  <div className="summary-number">{people}</div>
                  <div className="summary-label">Selected</div>
                </div>
              </div>
            </section>

            {/* Bar chart */}
            <section className="portion-card">
              <h2>Bar chart — available vs needed</h2>
              <BarChart items={items.map(it => ({ ...it }))} people={people} appetite={appetite} />
            </section>
          </div>

          {/* Right column: donut + line + timer */}
          <div className="right-col">
            <section className="portion-card">
              <h2>Donut — percent of item used</h2>
              <div className="donut-row">
                {computed.map((it) => {
                  const percent = donutPercent(it);
                  const fillColor = percent <= 0.6 ? "#10b981" : percent <= 1 ? "#f59e0b" : "#ef4444";
                  return (
                    <div key={it.id} className="donut-item">
                      <Donut value={percent} color={fillColor} size={94} />
                      <div className="donut-meta">
                        <div className="donut-name">{it.icon} {it.name}</div>
                        <div className="muted small">{Math.round(percent * 100)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="portion-card">
              <h2>Trend — total needed (last changes)</h2>
              <LineChart history={history} />
            </section>

            <section className="portion-card timer-card">
              <h2>Cooking Timer</h2>
              <div className="timer-controls-outer">
                <input className="timer-input" type="number" min="0" placeholder="minutes" value={timerMins} onChange={(e) => setTimerMins(e.target.value)} />
                <div className="timer-visual">
                  <svg width="140" height="140" viewBox="0 0 140 140">
                    <defs />
                    <circle cx="70" cy="70" r={circleR} className="timer-bg" />
                    <circle
                      cx="70"
                      cy="70"
                      r={circleR}
                      className="timer-fg"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeOffset}
                    />
                  </svg>
                  <div className="timer-text-big">{formatSeconds(secondsLeft)}</div>
                </div>
              </div>

              <div className="timer-buttons">
                {!running ? (
                  <button className="btn-start" onClick={() => {
                    startTimerAction(setInitialTimer, setSecondsLeft, setRunning, timerMins);
                  }}>▶ Start</button>
                ) : (
                  <button className="btn-pause" onClick={() => setRunning(false)}>⏸ Pause</button>
                )}
                <button className="btn-reset" onClick={() => { resetTimerAction(setInitialTimer, setSecondsLeft, setRunning, setTimerMins); }}>🔄 Reset</button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Helper functions used in the JSX above ---------- */

function servingsFrom(it, appetite, people) {
  if (!it.leftKg || Number(it.leftKg) <= 0) return Infinity;
  const capacity = Math.floor((Number(it.leftKg) / (it.perPersonKg * appetite)) || 0);
  return isFinite(capacity) ? capacity : Infinity;
}

function formatSeconds(s) {
  if (!s || s <= 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function startTimerAction(setInitialTimer, setSecondsLeft, setRunning, minsStr) {
  const mins = Math.floor(Number(minsStr) || 0);
  if (mins <= 0) return;
  const secs = mins * 60;
  setInitialTimer(secs);
  setSecondsLeft(secs);
  setRunning(true);
}

function resetTimerAction(setInitialTimer, setSecondsLeft, setRunning, setTimerMins) {
  setInitialTimer(0);
  setSecondsLeft(0);
  setRunning(false);
  setTimerMins("");
}
