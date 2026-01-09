// app.js
(function () {
  const foods = Array.isArray(window.FOODS) ? window.FOODS : [];

  // ---------- Storage keys ----------
  const STORAGE_TALLY  = "macro_tally_v2";
  const STORAGE_MACROS = "macro_history_v1";
  const STORAGE_WEIGHT = "weight_history_v1";

  // ---------- Calculator DOM ----------
  const foodSelect    = document.getElementById("foodSelect");
  const measureSelect = document.getElementById("measureSelect");
  const amountInput   = document.getElementById("amountInput");
  const unitLabel     = document.getElementById("unitLabel");

  const addBtn        = document.getElementById("addBtn");
  const clearEntryBtn = document.getElementById("clearEntryBtn");
  const clearLogBtn   = document.getElementById("clearLogBtn");

  const previewBox = document.getElementById("preview");
  const pKcal      = document.getElementById("pKcal");
  const pProtein   = document.getElementById("pProtein");
  const pFat       = document.getElementById("pFat");
  const pCarbs     = document.getElementById("pCarbs");
  const perUnitHint= document.getElementById("perUnitHint");

  const logBody  = document.getElementById("logBody");
  const tKcal    = document.getElementById("tKcal");
  const tProtein = document.getElementById("tProtein");
  const tFat     = document.getElementById("tFat");
  const tCarbs   = document.getElementById("tCarbs");

  // ---------- History DOM ----------
  const saveDayBtn   = document.getElementById("saveDayBtn");
  const saveDayDate  = document.getElementById("saveDayDate");
  const saveDayMsg   = document.getElementById("saveDayMsg");

  const weightDate   = document.getElementById("weightDate");
  const weightInput  = document.getElementById("weightInput");
  const saveWeightBtn= document.getElementById("saveWeightBtn");
  const saveWeightMsg= document.getElementById("saveWeightMsg");

  const exportMacrosBtn  = document.getElementById("exportMacrosBtn");
  const exportWeightsBtn = document.getElementById("exportWeightsBtn");
  const importMacrosFile = document.getElementById("importMacrosFile");
  const importWeightsFile= document.getElementById("importWeightsFile");

  const macroStart = document.getElementById("macroStart");
  const macroEnd   = document.getElementById("macroEnd");
  const macroRangeApply = document.getElementById("macroRangeApply");

  const weightStart = document.getElementById("weightStart");
  const weightEnd   = document.getElementById("weightEnd");
  const weightRangeApply = document.getElementById("weightRangeApply");

  const macroCanvas  = document.getElementById("macroChart");
  const weightCanvas = document.getElementById("weightChart");

  // ---------- State ----------
  let log = loadJSON(STORAGE_TALLY, []);
  let macroHistory = loadJSON(STORAGE_MACROS, []);
  let weightHistory = loadJSON(STORAGE_WEIGHT, []);

  // ---------- Utils ----------
  function todayISO() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function parseISODate(s) {
    // Expect YYYY-MM-DD
    const [y, m, d] = String(s || "").split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  function fmt(n, decimals = 1) {
    if (!Number.isFinite(n)) return "0";
    return n.toFixed(decimals);
  }
  const fmt0 = (n) => fmt(n, 0);
  const fmt1 = (n) => fmt(n, 1);

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  function downloadJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ---------- Food / measure helpers ----------
  function getSelectedFood() {
    const id = foodSelect.value;
    return foods.find(f => f.id === id) || foods[0] || null;
  }

  function getPerBase(food) {
    return food.perBaseUnit || food.perUnit || { kcal: 0, protein: 0, fat: 0, carbs: 0 };
  }

  function getBaseUnit(food) {
    return food.baseUnit || food.unit || "g";
  }

  function getMeasures(food) {
    const baseUnit = getBaseUnit(food);

    if (Array.isArray(food.measures) && food.measures.length > 0) return food.measures;

    // Default base measure if none provided
    return [{
      id: "base",
      label: baseUnit === "ml" ? "milliliters (ml)" : "grams (g)",
      kind: baseUnit,        // "g" or "ml"
      basePerMeasure: 1
    }];
  }

  function populateFoods() {
    foodSelect.innerHTML = "";
    if (foods.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No foods found — edit foods.js";
      foodSelect.appendChild(opt);
      foodSelect.disabled = true;
      measureSelect.disabled = true;
      addBtn.disabled = true;
      return;
    }

    for (const f of foods) {
      const opt = document.createElement("option");
      opt.value = f.id;
      opt.textContent = f.name;
      foodSelect.appendChild(opt);
    }
  }

  function populateMeasures() {
    const food = getSelectedFood();
    measureSelect.innerHTML = "";
    if (!food) return;

    const measures = getMeasures(food);
    for (const m of measures) {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = m.label;
      measureSelect.appendChild(opt);
    }
  }

  function getSelectedMeasure() {
    const food = getSelectedFood();
    if (!food) return null;

    const measures = getMeasures(food);
    const id = measureSelect.value;
    return measures.find(m => m.id === id) || measures[0] || null;
  }

  function updateUnitUI() {
    const measure = getSelectedMeasure();
    if (!measure) return;

    if (measure.kind === "g") {
      unitLabel.textContent = "g";
      amountInput.step = "0.1";
      amountInput.placeholder = "Enter grams…";
    } else if (measure.kind === "ml") {
      unitLabel.textContent = "ml";
      amountInput.step = "0.1";
      amountInput.placeholder = "Enter ml…";
    } else {
      unitLabel.textContent = "count";
      amountInput.step = "1";
      amountInput.placeholder = "Enter count…";
    }
  }

  // ---------- Calculator logic ----------
  function computeEntryPreview() {
    const food = getSelectedFood();
    const measure = getSelectedMeasure();
    if (!food || !measure) return null;

    const amount = Number(amountInput.value);
    if (!Number.isFinite(amount) || amount <= 0) {
      previewBox.classList.add("hidden");
      return null;
    }

    const per = getPerBase(food);
    const baseUnit = getBaseUnit(food);
    const baseAmount = amount * (measure.basePerMeasure ?? 1);

    const totals = {
      kcal: baseAmount * (per.kcal ?? 0),
      protein: baseAmount * (per.protein ?? 0),
      fat: baseAmount * (per.fat ?? 0),
      carbs: baseAmount * (per.carbs ?? 0),
    };

    pKcal.textContent = fmt0(totals.kcal);
    pProtein.textContent = fmt1(totals.protein);
    pFat.textContent = fmt1(totals.fat);
    pCarbs.textContent = fmt1(totals.carbs);

    perUnitHint.textContent =
      `Per 1 ${baseUnit}: ${per.kcal} kcal, ${per.protein}P, ${per.fat}F, ${per.carbs}C. ` +
      `(${fmt1(baseAmount)} ${baseUnit} total)`;

    previewBox.classList.remove("hidden");

    return {
      foodId: food.id,
      foodName: food.name,
      measureId: measure.id,
      measureLabel: measure.label,
      amount,
      baseAmount,
      totals
    };
  }

  function addToLog() {
    const entry = computeEntryPreview();
    if (!entry) return;

    log.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      ...entry
    });

    saveJSON(STORAGE_TALLY, log);
    renderLog();
    renderTotals();
  }

  function removeFromLog(id) {
    log = log.filter(e => e.id !== id);
    saveJSON(STORAGE_TALLY, log);
    renderLog();
    renderTotals();
  }

  function clearLog() {
    log = [];
    saveJSON(STORAGE_TALLY, log);
    renderLog();
    renderTotals();
  }

  function clearEntry() {
    amountInput.value = "";
    previewBox.classList.add("hidden");
    amountInput.focus();
  }

  function currentTallyTotals() {
    return log.reduce((acc, e) => {
      acc.kcal += e.totals.kcal;
      acc.protein += e.totals.protein;
      acc.fat += e.totals.fat;
      acc.carbs += e.totals.carbs;
      return acc;
    }, { kcal: 0, protein: 0, fat: 0, carbs: 0 });
  }

  function renderLog() {
    logBody.innerHTML = "";

    if (log.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="7" style="color: var(--muted); padding: 14px 10px;">
        No items yet — add something above.
      </td>`;
      logBody.appendChild(tr);
      return;
    }

    for (const e of log) {
      const tr = document.createElement("tr");

      // show amount as int if it's a "count-ish" measure
      const isCount = !(e.measureLabel.includes("(g)") || e.measureLabel.includes("(ml)") || e.measureId === "g" || e.measureId === "ml" || e.measureId === "base");
      const amountText = isCount ? fmt0(e.amount) : fmt1(e.amount);

      tr.innerHTML = `
        <td>
          <div><strong>${e.foodName}</strong></div>
          <div style="color: var(--muted); font-size: 12px;">${e.measureLabel}</div>
        </td>
        <td class="num">${amountText}</td>
        <td class="num">${fmt0(e.totals.kcal)}</td>
        <td class="num">${fmt1(e.totals.protein)}</td>
        <td class="num">${fmt1(e.totals.fat)}</td>
        <td class="num">${fmt1(e.totals.carbs)}</td>
        <td class="num">
          <button class="iconBtn" data-remove="${e.id}" title="Remove">×</button>
        </td>
      `;
      logBody.appendChild(tr);
    }

    for (const btn of logBody.querySelectorAll("[data-remove]")) {
      btn.addEventListener("click", (ev) => {
        const id = ev.currentTarget.getAttribute("data-remove");
        removeFromLog(id);
      });
    }
  }

  function renderTotals() {
    const totals = currentTallyTotals();
    tKcal.textContent = fmt0(totals.kcal);
    tProtein.textContent = fmt1(totals.protein);
    tFat.textContent = fmt1(totals.fat);
    tCarbs.textContent = fmt1(totals.carbs);
  }

  // ---------- History: save day + weight ----------
  function upsertByDate(arr, entry) {
    const idx = arr.findIndex(e => e.date === entry.date);
    if (idx >= 0) arr[idx] = entry;
    else arr.push(entry);
    arr.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    return arr;
  }

  function saveDay() {
    const date = saveDayDate.value || todayISO();
    const totals = currentTallyTotals();

    const entry = {
      date,
      calories: Number(fmt0(totals.kcal)),
      protein: Number(fmt1(totals.protein)),
      fat: Number(fmt1(totals.fat)),
      carbs: Number(fmt1(totals.carbs))
    };

    macroHistory = upsertByDate(macroHistory, entry);
    saveJSON(STORAGE_MACROS, macroHistory);

    // “Save to file” = download JSON
    downloadJSON("macro_history.json", macroHistory);

    saveDayMsg.textContent = `Saved ${date} and downloaded macro_history.json`;
    redrawAllCharts();
  }

  function saveWeight() {
    const date = weightDate.value || todayISO();
    const w = Number(weightInput.value);

    if (!Number.isFinite(w) || w <= 0) {
      saveWeightMsg.textContent = "Enter a valid weight first.";
      return;
    }

    const entry = { date, weight: Number(fmt1(w)) };
    weightHistory = upsertByDate(weightHistory, entry);
    saveJSON(STORAGE_WEIGHT, weightHistory);

    downloadJSON("weight_history.json", weightHistory);

    saveWeightMsg.textContent = `Saved ${date} and downloaded weight_history.json`;
    redrawAllCharts();
  }

  // ---------- Import JSON ----------
  async function importJSONFile(file) {
    const text = await file.text();
    return JSON.parse(text);
  }

  async function handleImportMacros(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      const data = await importJSONFile(file);
      if (!Array.isArray(data)) throw new Error("macro_history.json must be an array");

      // basic shape check
      const cleaned = data
        .filter(e => e && typeof e.date === "string")
        .map(e => ({
          date: e.date,
          calories: Number(e.calories ?? 0),
          protein: Number(e.protein ?? 0),
          fat: Number(e.fat ?? 0),
          carbs: Number(e.carbs ?? 0),
        }))
        .sort((a, b) => String(a.date).localeCompare(String(b.date)));

      macroHistory = cleaned;
      saveJSON(STORAGE_MACROS, macroHistory);
      redrawAllCharts();
    } catch (err) {
      alert(`Failed to load macro history: ${err.message}`);
    } finally {
      ev.target.value = "";
    }
  }

  async function handleImportWeights(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      const data = await importJSONFile(file);
      if (!Array.isArray(data)) throw new Error("weight_history.json must be an array");

      const cleaned = data
        .filter(e => e && typeof e.date === "string")
        .map(e => ({
          date: e.date,
          weight: Number(e.weight ?? 0),
        }))
        .sort((a, b) => String(a.date).localeCompare(String(b.date)));

      weightHistory = cleaned;
      saveJSON(STORAGE_WEIGHT, weightHistory);
      redrawAllCharts();
    } catch (err) {
      alert(`Failed to load weight history: ${err.message}`);
    } finally {
      ev.target.value = "";
    }
  }

  // ---------- Charting (canvas, no libs) ----------
  function setCanvasHiDPI(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(300, Math.floor(rect.width));
    const h = Math.max(200, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  function niceMax(v) {
    if (!Number.isFinite(v) || v <= 0) return 10;
    const pow = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / pow;
    const rounded = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return rounded * pow;
  }

  function filterByRange(entries, startISO, endISO) {
    const start = startISO ? parseISODate(startISO) : null;
    const end = endISO ? parseISODate(endISO) : null;

    return entries.filter(e => {
      const d = parseISODate(e.date);
      if (!d) return false;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }

  function drawMultiAxisLineChart(canvas, title, seriesLeft, seriesRight) {
    const ctx = setCanvasHiDPI(canvas);
    const rect = canvas.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;

    ctx.clearRect(0, 0, W, H);

    // Layout
    const padL = 56;
    const padR = 56;
    const padT = 28;
    const padB = 36;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    // Collect x labels from whichever series has data
    const allPoints = [...seriesLeft, ...seriesRight].flatMap(s => s.points);
    if (allPoints.length === 0) {
      ctx.fillStyle = "#a7adbb";
      ctx.font = "14px system-ui";
      ctx.fillText("No data in range.", padL, padT + 24);
      return;
    }

    // Sort unique dates
    const dates = Array.from(new Set(allPoints.map(p => p.date))).sort();
    const xFor = (date) => {
      const i = dates.indexOf(date);
      if (dates.length <= 1) return padL + plotW / 2;
      return padL + (i / (dates.length - 1)) * plotW;
    };

    // Y scaling
    const leftMaxRaw = Math.max(1, ...seriesLeft.flatMap(s => s.points.map(p => p.value)));
    const rightMaxRaw = Math.max(1, ...seriesRight.flatMap(s => s.points.map(p => p.value)));

    const leftMax = niceMax(leftMaxRaw * 1.08);
    const rightMax = niceMax(rightMaxRaw * 1.08);

    const yLeft = (v) => padT + plotH - (clamp(v, 0, leftMax) / leftMax) * plotH;
    const yRight = (v) => padT + plotH - (clamp(v, 0, rightMax) / rightMax) * plotH;

    // Title
    ctx.fillStyle = "#e7e9ee";
    ctx.font = "600 14px system-ui";
    ctx.fillText(title, padL, 18);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padT + (i / gridLines) * plotH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padL + plotW, padT);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = "#a7adbb";
    ctx.font = "12px system-ui";
    ctx.fillText(`${leftMax} kcal`, 6, padT + 10);
    ctx.fillText(`${rightMax} g`, padL + plotW + 8, padT + 10);

    // X labels (min/mid/max)
    const labelIdxs = dates.length <= 2
      ? [0, dates.length - 1]
      : [0, Math.floor((dates.length - 1) / 2), dates.length - 1];

    ctx.fillStyle = "#a7adbb";
    ctx.font = "12px system-ui";
    for (const idx of labelIdxs) {
      const d = dates[idx];
      const x = xFor(d);
      const textW = ctx.measureText(d).width;
      ctx.fillText(d, x - textW / 2, padT + plotH + 26);
    }

    // Draw series
    function drawSeries(series, yFn) {
      for (const s of series) {
        if (!s.points.length) continue;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        s.points.forEach((p, i) => {
          const x = xFor(p.date);
          const y = yFn(p.value);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // points
        ctx.fillStyle = s.color;
        for (const p of s.points) {
          const x = xFor(p.date);
          const y = yFn(p.value);
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    drawSeries(seriesLeft, yLeft);
    drawSeries(seriesRight, yRight);

    // Legend
    const legend = [...seriesLeft, ...seriesRight].map(s => ({ name: s.name, color: s.color }));
    let lx = padL;
    let ly = padT + 6;
    ctx.font = "12px system-ui";
    for (const item of legend) {
      ctx.fillStyle = item.color;
      ctx.fillRect(lx, ly, 10, 10);
      ctx.fillStyle = "#e7e9ee";
      ctx.fillText(item.name, lx + 14, ly + 10);
      lx += 14 + ctx.measureText(item.name).width + 14;
      if (lx > padL + plotW - 120) { lx = padL; ly += 16; }
    }
  }

  function drawSingleLineChart(canvas, title, points, color) {
    const ctx = setCanvasHiDPI(canvas);
    const rect = canvas.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    ctx.clearRect(0, 0, W, H);

    const padL = 56;
    const padR = 16;
    const padT = 28;
    const padB = 36;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    if (!points.length) {
      ctx.fillStyle = "#a7adbb";
      ctx.font = "14px system-ui";
      ctx.fillText("No data in range.", padL, padT + 24);
      return;
    }

    const dates = points.map(p => p.date);
    const xFor = (date) => {
      const i = dates.indexOf(date);
      if (dates.length <= 1) return padL + plotW / 2;
      return padL + (i / (dates.length - 1)) * plotW;
    };

    const maxRaw = Math.max(...points.map(p => p.value));
    const maxY = niceMax(maxRaw * 1.08);
    const yFor = (v) => padT + plotH - (clamp(v, 0, maxY) / maxY) * plotH;

    // Title
    ctx.fillStyle = "#e7e9ee";
    ctx.font = "600 14px system-ui";
    ctx.fillText(title, padL, 18);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padT + (i / gridLines) * plotH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // Y label
    ctx.fillStyle = "#a7adbb";
    ctx.font = "12px system-ui";
    ctx.fillText(`${maxY}`, 10, padT + 10);

    // X labels (min/mid/max)
    const labelIdxs = dates.length <= 2
      ? [0, dates.length - 1]
      : [0, Math.floor((dates.length - 1) / 2), dates.length - 1];

    ctx.fillStyle = "#a7adbb";
    for (const idx of labelIdxs) {
      const d = dates[idx];
      const x = xFor(d);
      const textW = ctx.measureText(d).width;
      ctx.fillText(d, x - textW / 2, padT + plotH + 26);
    }

    // Line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = xFor(p.date);
      const y = yFor(p.value);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // points
    ctx.fillStyle = color;
    for (const p of points) {
      const x = xFor(p.date);
      const y = yFor(p.value);
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function redrawAllCharts() {
    const mStart = macroStart.value || null;
    const mEnd = macroEnd.value || null;
    const wStart = weightStart.value || null;
    const wEnd = weightEnd.value || null;

    const macros = filterByRange(macroHistory, mStart, mEnd).sort((a,b) => a.date.localeCompare(b.date));
    const weights = filterByRange(weightHistory, wStart, wEnd).sort((a,b) => a.date.localeCompare(b.date));

    const leftSeries = [{
      name: "Calories",
      color: "#5aa9ff",
      points: macros.map(e => ({ date: e.date, value: Number(e.calories) || 0 }))
    }];

    const rightSeries = [
      { name: "Protein", color: "#7CFF6B", points: macros.map(e => ({ date: e.date, value: Number(e.protein) || 0 })) },
      { name: "Fat",     color: "#FFB84D", points: macros.map(e => ({ date: e.date, value: Number(e.fat) || 0 })) },
      { name: "Carbs",   color: "#FF6BD6", points: macros.map(e => ({ date: e.date, value: Number(e.carbs) || 0 })) },
    ];

    drawMultiAxisLineChart(macroCanvas, "Calories + Macros", leftSeries, rightSeries);

    const weightPoints = weights.map(e => ({ date: e.date, value: Number(e.weight) || 0 }));
    drawSingleLineChart(weightCanvas, "Weight", weightPoints, "#5aa9ff");
  }

  function setDefaultDateRanges() {
    // Defaults: full range if present
    const macroDates = macroHistory.map(e => e.date).sort();
    if (macroDates.length) {
      macroStart.value = macroDates[0];
      macroEnd.value = macroDates[macroDates.length - 1];
    } else {
      macroStart.value = "";
      macroEnd.value = "";
    }

    const weightDates = weightHistory.map(e => e.date).sort();
    if (weightDates.length) {
      weightStart.value = weightDates[0];
      weightEnd.value = weightDates[weightDates.length - 1];
    } else {
      weightStart.value = "";
      weightEnd.value = "";
    }
  }

  // ---------- Events ----------
  foodSelect.addEventListener("change", () => {
    populateMeasures();
    updateUnitUI();
    computeEntryPreview();
  });

  measureSelect.addEventListener("change", () => {
    updateUnitUI();
    computeEntryPreview();
  });

  amountInput.addEventListener("input", () => computeEntryPreview());

  addBtn.addEventListener("click", () => addToLog());
  clearEntryBtn.addEventListener("click", () => clearEntry());
  clearLogBtn.addEventListener("click", () => clearLog());

  saveDayBtn.addEventListener("click", () => saveDay());
  saveWeightBtn.addEventListener("click", () => saveWeight());

  exportMacrosBtn.addEventListener("click", () => downloadJSON("macro_history.json", macroHistory));
  exportWeightsBtn.addEventListener("click", () => downloadJSON("weight_history.json", weightHistory));

  importMacrosFile.addEventListener("change", handleImportMacros);
  importWeightsFile.addEventListener("change", handleImportWeights);

  macroRangeApply.addEventListener("click", redrawAllCharts);
  weightRangeApply.addEventListener("click", redrawAllCharts);

  window.addEventListener("resize", () => {
    // Re-render for responsive canvas sizing
    redrawAllCharts();
  });

  // ---------- Init ----------
  populateFoods();
  populateMeasures();
  updateUnitUI();

  renderLog();
  renderTotals();

  saveDayDate.value = todayISO();
  weightDate.value = todayISO();

  setDefaultDateRanges();
  redrawAllCharts();
})();
