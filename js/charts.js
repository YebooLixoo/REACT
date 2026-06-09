/* ============================================================
   REACT project page — interactive result chart (Chart.js)
   Data transcribed verbatim from Table 4 of EAAI 180 (2026) 115186.
   ============================================================ */
(function () {
  if (typeof Chart === "undefined") return;

  // ---- shared theme ----
  const C = {
    accent: "#2563eb",
    accentDark: "#1d4ed8",
    cyan: "#06b6d4",
    sky: "#38bdf8",
    lightBlue: "#93c5fd",
    slate: "#cbd5e1",
    slate2: "#94a3b8",
    ink: "#0f172a",
    grid: "rgba(15,23,42,0.07)",
    danger: "#ef4444",
  };

  Chart.defaults.font.family =
    "'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  Chart.defaults.color = "#475569";
  Chart.defaults.font.size = 13;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const anim = reduceMotion ? false : { duration: 800, easing: "easeOutQuart" };

  const charts = {};

  // ============ Accuracy–latency–safety trade-off (Table 4) ============
  (function () {
    const el = document.getElementById("chartTradeoff");
    if (!el) return;
    // x = latency (s), y = CRR (%)
    const models = [
      { n: "Qwen2.5-VL-3B", x: 1.866, y: 85.8, c: "#f59e0b", r: 9 },
      { n: "LLaVA-1.5-7B", x: 2.938, y: 86.3, c: "#10b981", r: 9 },
      { n: "Qwen2.5-VL-7B", x: 2.090, y: 86.7, c: "#8b5cf6", r: 9 },
      { n: "SmolVLM2-500M (ours)", x: 0.570, y: 84.9, c: C.accent, r: 13 },
    ];
    charts.tradeoff = new Chart(el, {
      type: "scatter",
      data: {
        datasets: models.map((m) => ({
          label: m.n,
          data: [{ x: m.x, y: m.y }],
          backgroundColor: m.c,
          borderColor: m.n.includes("ours") ? C.accentDark : "#fff",
          borderWidth: 2,
          pointRadius: m.r,
          pointHoverRadius: m.r + 3,
        })),
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: anim,
        scales: {
          x: { min: 0, max: 3.25, grid: { color: C.grid }, title: { display: true, text: "Average inference latency (s)  —  lower is better" } },
          y: { min: 84, max: 87.5, grid: { color: C.grid }, title: { display: true, text: "Collision-rate reduction (%)  —  higher is better" } },
        },
        plugins: {
          legend: { position: "top" },
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}% CRR @ ${ctx.parsed.x}s` } },
        },
      },
    });
  })();

  window.__reactCharts = charts;
})();
