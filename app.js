// app.js
(function () {
  const foods = Array.isArray(window.FOODS) ? window.FOODS : [];

  // ---------- Storage keys ----------
  const STORAGE_TALLY  = "macro_tally_v2";

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

  // ---------- Storage ----------
    const STORAGE_HISTORY = "history_v1";

    // ---------- History DOM ----------
    const saveDayBtn   = document.getElementById("saveDayBtn");
    const saveDayDate  = document.getElementById("saveDayDate");
    const saveDayMsg   = document.getElementById("saveDayMsg");

    const weightDate   = document.getElementById("weightDate");
    const weightInput  = document.getElementById("weightInput");
    const saveWeightMsg= document.getElementById("saveWeightMsg");

    const exportHistoryBtn  = document.getElementById("exportHistoryBtn");
    const importHistoryFile = document.getElementById("importHistoryFile");

    const historyStart = document.getElementById("historyStart");
    const historyEnd   = document.getElementById("historyEnd");
    const historyRangeApply = document.getElementById("historyRangeApply");

    const historyCanvas = document.getElementById("historyChart");

    // ---------- State ----------
    let history = loadJSON_any(STORAGE_HISTORY, []);  // array of entries
    let dailyIntake = loadJSON_any(STORAGE_TALLY, []);

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

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function loadJSON_any(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch { return fallback; }
    }
  function saveJSON_any(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    }


  function saveToDailyIntake(key, value) {
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

  function round(n, decimals) {
    const p = Math.pow(10, decimals);
    return Math.round((Number(n) || 0) * p) / p;
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
    console.log('populating')
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

  function computeRatios(entry) {
    const p = Number(entry.protein) || 0;
    const c = Number(entry.carbs) || 0;
    const f = Number(entry.fat) || 0;

    const pCal = p * 4;
    const cCal = c * 4;
    const fCal = f * 9;
    const total = pCal + cCal + fCal;

    if (total <= 0) {
        entry.protein_ratio = 0;
        entry.carb_ratio = 0;
        entry.fat_ratio = 0;
        return entry;
    }

    entry.protein_ratio = round(pCal / total, 4);
    entry.carb_ratio    = round(cCal / total, 4);
    entry.fat_ratio     = round(fCal / total, 4);
    return entry;
    }

  function addToLog() {
    const entry = computeEntryPreview();
    if (!entry) return;

    dailyIntake.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      ...entry
    });

    saveToDailyIntake(STORAGE_TALLY, dailyIntake);
    renderLog();
    renderTotals();
  }

  function removeFromLog(id) {
    dailyIntake = dailyIntake.filter(e => e.id !== id);
    saveToDailyIntake(STORAGE_TALLY, dailyIntake);
    renderLog();
    renderTotals();
  }

  function clearLog() {
    dailyIntake = [];
    saveToDailyIntake(STORAGE_TALLY, dailyIntake);
    renderLog();
    renderTotals();
  }

  function clearEntry() {
    amountInput.value = "";
    previewBox.classList.add("hidden");
    amountInput.focus();
  }

  function currentTallyTotals() {
    return dailyIntake.reduce((acc, e) => {
      acc.kcal += e.totals.kcal;
      acc.protein += e.totals.protein;
      acc.fat += e.totals.fat;
      acc.carbs += e.totals.carbs;
      return acc;
    }, { kcal: 0, protein: 0, fat: 0, carbs: 0 });
  }

  function renderLog() {
    logBody.innerHTML = "";

    if (dailyIntake.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="7" style="color: var(--muted); padding: 14px 10px;">
        No items yet — add something above.
      </td>`;
      logBody.appendChild(tr);
      return;
    }

    for (const e of dailyIntake) {
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
    const w = Number(weightInput.value);

    if (!Number.isFinite(w) || w <= 0) {
        saveWeightMsg.textContent = "Enter a valid weight first.";
        return;
    }

    // Find existing entry for date or create new
    const existing = history.find(e => e.date === date) || { date };

    existing.calories = Number(Math.round(totals.kcal || 0));
    existing.protein  = round(totals.protein || 0, 1);
    existing.fat      = round(totals.fat || 0, 1);
    existing.carbs    = round(totals.carbs || 0, 1);
    existing.weight   = round(w, 1);

    computeRatios(existing);

    history = upsertByDate(history, existing);
    saveJSON_any(STORAGE_HISTORY, history);

    // downloadJSON("history.json", history);
    saveDayMsg.textContent = `Saved ${date}`;

    setDefaultHistoryRange();
    redrawHistoryChart();
    }


  // ---------- Import JSON ----------

  exportHistoryBtn.addEventListener("click", () => downloadJSON("history.json", history));

  importHistoryFile.addEventListener("change", async (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!Array.isArray(data)) throw new Error("history.json must be an array");

        // Clean + normalize
        history = data
        .filter(e => e && typeof e.date === "string")
        .map(e => {
            const entry = {
            date: e.date,
            calories: Number(e.calories ?? 0),
            protein: Number(e.protein ?? 0),
            fat: Number(e.fat ?? 0),
            carbs: Number(e.carbs ?? 0),
            weight: (e.weight === undefined || e.weight === null) ? undefined : Number(e.weight),
            protein_ratio: Number(e.protein_ratio ?? 0),
            carb_ratio: Number(e.carb_ratio ?? 0),
            fat_ratio: Number(e.fat_ratio ?? 0),
            };
            // recompute ratios if macros exist
            if ((entry.protein || entry.fat || entry.carbs) && !(e.protein_ratio || e.carb_ratio || e.fat_ratio)) {
            computeRatios(entry);
            }
            // round nicely
            entry.calories = Math.round(entry.calories || 0);
            entry.protein  = round(entry.protein, 1);
            entry.fat      = round(entry.fat, 1);
            entry.carbs    = round(entry.carbs, 1);
            if (entry.weight !== undefined) entry.weight = round(entry.weight, 1);
            entry.protein_ratio = round(entry.protein_ratio, 4);
            entry.carb_ratio    = round(entry.carb_ratio, 4);
            entry.fat_ratio     = round(entry.fat_ratio, 4);
            return entry;
        })
        .sort((a, b) => a.date.localeCompare(b.date));

        saveJSON_any(STORAGE_HISTORY, history);
        setDefaultHistoryRange();
        redrawHistoryChart();
    } catch (err) {
        alert(`Failed to load history: ${err.message}`);
    } finally {
        ev.target.value = "";
    }
    });


  // ---------- Charting (Chart.js) ----------
    let historyChart = null;

    function ensureHistoryChart() {
    if (!window.Chart) {
        alert("Chart.js not found. Make sure chart.umd.js is loaded before app.js.");
        return false;
    }

    if (historyChart) return true;

    const ctx = historyCanvas.getContext("2d");
    historyChart = new Chart(ctx, {
        type: "line",
        data: {
        labels: [],
        datasets: [
            { key: "calories",       label: "Calories",       yAxisID: "yKcal", borderColor: "#5aa9ff", backgroundColor: "transparent", pointRadius: 2, tension: 0.25, data: [] },

            { key: "protein",        label: "Protein (g)",    yAxisID: "yG",    borderColor: "#7CFF6B", backgroundColor: "transparent", pointRadius: 2, tension: 0.25, data: [] },
            { key: "fat",            label: "Fat (g)",        yAxisID: "yG",    borderColor: "#FFB84D", backgroundColor: "transparent", pointRadius: 2, tension: 0.25, data: [] },
            { key: "carbs",          label: "Carbs (g)",      yAxisID: "yG",    borderColor: "#FF6BD6", backgroundColor: "transparent", pointRadius: 2, tension: 0.25, data: [] },

            { key: "weight",         label: "Weight",        yAxisID: "yW",    borderColor: "#A78BFA", backgroundColor: "transparent", pointRadius: 2, tension: 0.25, data: [] },

            { key: "protein_ratio",  label: "Protein Ratio", yAxisID: "yR",    borderColor: "#34D399", backgroundColor: "transparent", pointRadius: 2, tension: 0.25, data: [] },
            { key: "fat_ratio",      label: "Fat Ratio",     yAxisID: "yR",    borderColor: "#FBBF24", backgroundColor: "transparent", pointRadius: 2, tension: 0.25, data: [] },
            { key: "carb_ratio",     label: "Carb Ratio",    yAxisID: "yR",    borderColor: "#F472B6", backgroundColor: "transparent", pointRadius: 2, tension: 0.25, data: [] },
        ],
        },
        options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
            legend: { labels: { color: "#e7e9ee" } },
            tooltip: { enabled: true }
        },
        scales: {
            x: {
            ticks: { color: "#a7adbb", maxRotation: 0, autoSkip: true },
            grid: { color: "rgba(255,255,255,0.06)" },
            },
            yKcal: {
            position: "left",
            title: { display: true, text: "Calories (kcal)", color: "#a7adbb" },
            ticks: { color: "#a7adbb" },
            grid: { color: "rgba(255,255,255,0.06)" },
            },
            yG: {
            position: "right",
            title: { display: true, text: "Macros (g)", color: "#a7adbb" },
            ticks: { color: "#a7adbb" },
            grid: { drawOnChartArea: false },
            },
            yW: {
            position: "right",
            offset: true,
            title: { display: true, text: "Weight", color: "#a7adbb" },
            ticks: { color: "#a7adbb" },
            grid: { drawOnChartArea: false },
            },
            yR: {
            position: "left",
            offset: true,
            min: 0,
            max: 1,
            title: { display: true, text: "Ratio", color: "#a7adbb" },
            ticks: { color: "#a7adbb" },
            grid: { drawOnChartArea: false },
            }
        }
        }
    });

    return true;
    }

    function setDefaultHistoryRange() {
    const dates = history.map(e => e.date).sort();
    if (dates.length) {
        historyStart.value = dates[0];
        historyEnd.value = dates[dates.length - 1];
    } else {
        historyStart.value = "";
        historyEnd.value = "";
    }
    }

    function redrawHistoryChart() {
    if (!ensureHistoryChart()) return;

    const start = historyStart.value || null;
    const end = historyEnd.value || null;

    const rows = filterByRange(history, start, end).sort((a,b) => a.date.localeCompare(b.date));
    const labels = rows.map(r => r.date);

    historyChart.data.labels = labels;

    // Fill datasets by key
    for (const ds of historyChart.data.datasets) {
        ds.data = rows.map(r => {
        const v = r[ds.key];
        return (v === undefined || v === null) ? null : Number(v);
        });
    }
    historyChart.update();
    }

    historyRangeApply.addEventListener("click", () => redrawHistoryChart());
    window.addEventListener("resize", () => redrawHistoryChart());

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

  setDefaultHistoryRange();
  ensureHistoryChart();
  redrawHistoryChart();  

  saveDayBtn.addEventListener("click", saveDay);

})();
