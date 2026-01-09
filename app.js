// app.js
(function () {
  const foods = Array.isArray(window.FOODS) ? window.FOODS : [];

  // Inputs
  const foodSelect    = document.getElementById("foodSelect");
  const measureSelect = document.getElementById("measureSelect");
  const amountInput   = document.getElementById("amountInput");
  const unitLabel     = document.getElementById("unitLabel");

  // Buttons
  const addBtn        = document.getElementById("addBtn");
  const clearEntryBtn = document.getElementById("clearEntryBtn");
  const clearLogBtn   = document.getElementById("clearLogBtn");

  // Preview
  const previewBox = document.getElementById("preview");
  const pKcal      = document.getElementById("pKcal");
  const pProtein   = document.getElementById("pProtein");
  const pFat       = document.getElementById("pFat");
  const pCarbs     = document.getElementById("pCarbs");
  const perUnitHint= document.getElementById("perUnitHint");

  // Log
  const logBody  = document.getElementById("logBody");
  const tKcal    = document.getElementById("tKcal");
  const tProtein = document.getElementById("tProtein");
  const tFat     = document.getElementById("tFat");
  const tCarbs   = document.getElementById("tCarbs");

  const STORAGE_KEY = "macro_tally_v1";
  let log = loadLog();

  function fmt(n, decimals = 1) {
    if (!Number.isFinite(n)) return "0";
    return n.toFixed(decimals);
  }

  function fmt0(n) { return fmt(n, 0); }
  function fmt1(n) { return fmt(n, 1); }

  function getSelectedFood() {
    const id = foodSelect.value;
    return foods.find(f => f.id === id) || foods[0] || null;
  }

  function getPerBase(food) {
    // Backward compatible with earlier format
    return food.perBaseUnit || food.perUnit || { kcal: 0, protein: 0, fat: 0, carbs: 0 };
  }

  function getBaseUnit(food) {
    return food.baseUnit || food.unit || "g";
  }

  function getMeasures(food) {
    const baseUnit = getBaseUnit(food);

    if (Array.isArray(food.measures) && food.measures.length > 0) return food.measures;

    // Default measure if none provided
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
    const food = getSelectedFood();
    const measure = getSelectedMeasure();
    if (!food || !measure) return;

    // Input label + step
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

    // Convert to base units
    const baseAmount = amount * (measure.basePerMeasure ?? 1);

    const totals = {
      kcal: baseAmount * (per.kcal ?? 0),
      protein: baseAmount * (per.protein ?? 0),
      fat: baseAmount * (per.fat ?? 0),
      carbs: baseAmount * (per.carbs ?? 0),
    };

    // Render preview
    pKcal.textContent = fmt0(totals.kcal);
    pProtein.textContent = fmt1(totals.protein);
    pFat.textContent = fmt1(totals.fat);
    pCarbs.textContent = fmt1(totals.carbs);

    perUnitHint.textContent =
      `Using per 1 ${baseUnit}: ${per.kcal} kcal, ${per.protein}P, ${per.fat}F, ${per.carbs}C. ` +
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

    saveLog();
    renderLog();
    renderTotals();
  }

  function removeFromLog(id) {
    log = log.filter(e => e.id !== id);
    saveLog();
    renderLog();
    renderTotals();
  }

  function clearLog() {
    log = [];
    saveLog();
    renderLog();
    renderTotals();
  }

  function clearEntry() {
    amountInput.value = "";
    previewBox.classList.add("hidden");
    amountInput.focus();
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

      const amountText =
        (e.measureId === "g" || e.measureId === "ml" || e.measureLabel.includes("(g)") || e.measureLabel.includes("(ml)"))
          ? `${fmt1(e.amount)}`
          : `${fmt0(e.amount)}`;

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

    // Wire remove buttons
    for (const btn of logBody.querySelectorAll("[data-remove]")) {
      btn.addEventListener("click", (ev) => {
        const id = ev.currentTarget.getAttribute("data-remove");
        removeFromLog(id);
      });
    }
  }

  function renderTotals() {
    const totals = log.reduce((acc, e) => {
      acc.kcal += e.totals.kcal;
      acc.protein += e.totals.protein;
      acc.fat += e.totals.fat;
      acc.carbs += e.totals.carbs;
      return acc;
    }, { kcal: 0, protein: 0, fat: 0, carbs: 0 });

    tKcal.textContent = fmt0(totals.kcal);
    tProtein.textContent = fmt1(totals.protein);
    tFat.textContent = fmt1(totals.fat);
    tCarbs.textContent = fmt1(totals.carbs);
  }

  function saveLog() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
    } catch {
      // If storage fails, it still works in-memory.
    }
  }

  function loadLog() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // Events
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

  // Init
  populateFoods();
  populateMeasures();
  updateUnitUI();
  renderLog();
  renderTotals();
})();
