/* ============================================================
   REACT project page — interactive result charts (Chart.js)
   All data transcribed verbatim from the published paper:
   Tables 2, 3, 4, 5, 8 of EAAI 180 (2026) 115186.
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
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  Chart.defaults.color = "#475569";
  Chart.defaults.font.size = 13;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const anim = reduceMotion ? false : { duration: 800, easing: "easeOutQuart" };

  const charts = {};

  // ================= Chart 1: method comparison (Table 3) =================
  (function () {
    const el = document.getElementById("chartMethods");
    if (!el) return;
    const labels = [
      "V2XFormer\n+ Average",
      "V2XFormer\n+ DiscoNet",
      "V2XFormer\n+ V2X-ViT",
      "V2XFormer\n+ CoBEVT",
      "AccidentGPT",
      "REACT (ours)",
    ];
    const mIoU = [52.1, 54.2, 55.1, 56.2, 57.3, 57.9];
    const vpq = [39.5, 42.0, 43.2, 44.0, 45.2, 50.6];
    const last = labels.length - 1;
    const border = labels.map((_, i) => (i === last ? C.ink : "transparent"));
    const bw = labels.map((_, i) => (i === last ? 2 : 0));

    charts.methods = new Chart(el, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "mIoU", data: mIoU, backgroundColor: C.lightBlue, borderColor: border, borderWidth: bw, borderRadius: 5 },
          { label: "VPQ", data: vpq, backgroundColor: C.accent, borderColor: border, borderWidth: bw, borderRadius: 5 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: anim,
        scales: {
          y: { beginAtZero: true, suggestedMax: 65, grid: { color: C.grid }, title: { display: true, text: "Score (higher is better)" } },
          x: { grid: { display: false }, ticks: { autoSkip: false, font: { size: 11 }, callback: function (v) { return this.getLabelForValue(v).split("\n"); } } },
        },
        plugins: {
          legend: { position: "top" },
          tooltip: { callbacks: { title: (t) => t[0].label.replace(/\n/g, " ") } },
        },
      },
    });
  })();

  // ============ Chart 2: accuracy-latency tradeoff (Table 4) ============
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

  // ============ Chart 3: robustness across conditions (Table 5) ============
  (function () {
    const el = document.getElementById("chartConditions");
    if (!el) return;
    const AVG = 84.93;
    const groups = {
      time: { labels: ["Noon", "Sunset", "Night"], data: [85.01, 84.88, 84.90] },
      weather: { labels: ["Clear", "Cloudy", "Rainy", "Wet"], data: [85.12, 84.76, 84.81, 84.83] },
      location: { labels: ["Highway", "Downtown", "Residential", "Rural"], data: [84.70, 84.65, 85.10, 85.00] },
    };
    function avgLine(n) { return new Array(n).fill(AVG); }

    function build(group) {
      const g = groups[group];
      // Append the overall average as its own distinct bar instead of a horizontal line
      const labels = g.labels.concat(["Average"]);
      const data = g.data.concat([AVG]);
      const colors = g.data.map(() => C.accent).concat(["#475569"]);
      return {
        labels: labels,
        datasets: [
          { label: "CRR (%)", data: data, backgroundColor: colors, borderRadius: 6, maxBarThickness: 90 },
        ],
      };
    }

    // Draw the exact CRR value above each bar (no datalabels plugin is vendored, so do it inline)
    const condValueLabels = {
      id: "condValueLabels",
      afterDatasetsDraw(chart) {
        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(0);
        const ds = chart.data.datasets[0];
        if (!meta || !ds) return;
        ctx.save();
        ctx.fillStyle = C.ink;
        ctx.font = "700 12px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        meta.data.forEach((bar, i) => {
          if (ds.data[i] == null) return;
          ctx.fillText(ds.data[i].toFixed(2) + "%", bar.x, bar.y - 7);
        });
        ctx.restore();
      },
    };

    charts.conditions = new Chart(el, {
      type: "bar",
      data: build("time"),
      options: {
        responsive: true, maintainAspectRatio: false, animation: anim,
        layout: { padding: { top: 18 } },
        scales: {
          y: { min: 84, max: 85.4, grid: { color: C.grid }, title: { display: true, text: "Collision-rate reduction (%)" }, ticks: { callback: (v) => v + "%" } },
          x: { grid: { display: false } },
        },
        plugins: { legend: { display: false } },
      },
      plugins: [condValueLabels],
    });

    // toggle handling
    const btns = document.querySelectorAll(".chart-toggle .toggle-btn");
    btns.forEach((b) => {
      b.addEventListener("click", () => {
        btns.forEach((x) => { x.classList.remove("active"); x.setAttribute("aria-pressed", "false"); });
        b.classList.add("active"); b.setAttribute("aria-pressed", "true");
        const data = build(b.dataset.group);
        charts.conditions.data.labels = data.labels;
        charts.conditions.data.datasets = data.datasets;
        charts.conditions.update(reduceMotion ? "none" : undefined);
      });
    });
  })();

  // ============ Chart 4: inference-time breakdown (Table 2) ============
  (function () {
    const el = document.getElementById("chartBreakdown");
    if (!el) return;
    const segs = [
      { l: "Text–vision fusion & LLM", ms: 256.2, c: C.accent },
      { l: "Vision encoding", ms: 243.6, c: C.accentDark },
      { l: "Output decoding", ms: 48.2, c: C.cyan },
      { l: "BEV preprocessing", ms: 20.8, c: C.sky },
      { l: "Residual control classification", ms: 5.7, c: C.lightBlue },
      { l: "Control reconstruction", ms: 0.04, c: C.slate },
    ];
    const total = segs.reduce((a, s) => a + s.ms, 0); // 574.54 ms — single source of truth
    const legendPos = () => (window.innerWidth < 640 ? "bottom" : "right");
    const centerText = {
      id: "centerText",
      afterDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta.data.length) return;
        const { x, y } = meta.data[0];
        ctx.save();
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = C.ink;
        ctx.font = "800 26px 'Inter', sans-serif";
        ctx.fillText("574.5", x, y - 8);
        ctx.fillStyle = "#64748b";
        ctx.font = "600 13px 'Inter', sans-serif";
        ctx.fillText("ms total", x, y + 16);
        ctx.restore();
      },
    };
    charts.breakdown = new Chart(el, {
      type: "doughnut",
      data: {
        labels: segs.map((s) => s.l),
        datasets: [{ data: segs.map((s) => s.ms), backgroundColor: segs.map((s) => s.c), borderColor: "#fff", borderWidth: 2, hoverOffset: 8 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: anim,
        cutout: "62%",
        plugins: {
          legend: { position: legendPos(), labels: { boxWidth: 14, padding: 12 } },
          tooltip: { callbacks: { label: (ctx) => { const s = segs[ctx.dataIndex]; const share = (s.ms / total) * 100; const pct = share < 0.1 ? "<0.1%" : share.toFixed(1) + "%"; return `${ctx.label}: ${s.ms} ms (${pct})`; } } },
        },
      },
      plugins: [centerText],
    });
    window.addEventListener("resize", () => {
      const pos = legendPos();
      if (charts.breakdown.options.plugins.legend.position !== pos) {
        charts.breakdown.options.plugins.legend.position = pos;
        charts.breakdown.update(reduceMotion ? "none" : undefined);
      }
    });
  })();

  // ============ Chart 5: input-modality ablation (Table 8) ============
  (function () {
    const el = document.getElementById("chartAblation");
    if (!el) return;
    const labels = ["Full REACT", "− Visual frames", "− RSU hazard", "− Control sequence"];
    const crr = [84.9, 61.2, 67.1, 51.7];
    const miou = [57.9, 54.6, 53.9, 38.2];
    const vpq = [50.6, 45.8, 46.4, 32.2];
    charts.ablation = new Chart(el, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "CRR (%)", data: crr, backgroundColor: C.accent, borderRadius: 5 },
          { label: "mIoU", data: miou, backgroundColor: C.cyan, borderRadius: 5 },
          { label: "VPQ", data: vpq, backgroundColor: C.lightBlue, borderRadius: 5 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: anim,
        scales: {
          y: { beginAtZero: true, suggestedMax: 90, grid: { color: C.grid }, title: { display: true, text: "Score (higher is better)" } },
          x: { grid: { display: false }, ticks: { font: { size: 12 } } },
        },
        plugins: { legend: { position: "top" } },
      },
    });
  })();

  window.__reactCharts = charts;
})();
