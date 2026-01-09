// app.js
(function () {
  const foods = Array.isArray(window.FOODS) ? window.FOODS : [];

  const foodSelect  = document.getElementById("foodSelect");
  const amountInput = document.getElementById("amountInput");
  const unitLabel   = document.getElementById("unitLabel");

  const calcBtn  = document.getElementById("calcBtn");
  const clearBtn = document.getElementById("clearBtn");

  const resultBox   = document.getElementById("result");
  const outKcal     = document.getElementById("outKcal");
  const outProtein  = document.getElementById("outProtein");
  const outFat      = document.getElementById("outFat");
  const outCarbs    = document.getElementById("outCarbs");
  const perUnitHint = document.getElementById("perUnitHint");

  function fmt(n, decimals = 1) {
    if (!Number.isFinite(n)) return "0";
    return n.toFixed(decimals);
  }

  function getSelectedFood() {
    const id = foodSelect.value;
    return foods.find(f => f.id === id) || foods[0] || null;
  }

  function populateFoods() {
    foodSelect.innerHTML = "";

    if (foods.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No foods found — edit foods.js";
      foodSelect.appendChild(opt);
      foodSelect.disabled = true;
      calcBtn.disabled = true;
      return;
    }

    for (const f of foods) {
      const opt = document.createElement("option");
      opt.value = f.id;
      opt.textContent = `${f.name} (per 1 ${f.unit})`;
      foodSelect.appendChild(opt);
    }
  }

  function updateUnitUI() {
    const f = getSelectedFood();
    const unit = f?.unit || "g";
    unitLabel.textContent = unit;
    amountInput.placeholder = `Enter amount in ${unit}…`;
  }

  function calculate() {
    const f = getSelectedFood();
    if (!f) return;

    const amount = Number(amountInput.value);
    if (!Number.isFinite(amount) || amount < 0) {
      resultBox.classList.add("hidden");
      return;
    }

    const p = f.perUnit || { kcal: 0, protein: 0, fat: 0, carbs: 0 };

    const kcal    = amount * (p.kcal ?? 0);
    const protein = amount * (p.protein ?? 0);
    const fat     = amount * (p.fat ?? 0);
    const carbs   = amount * (p.carbs ?? 0);

    outKcal.textContent    = fmt(kcal, 0);
    outProtein.textContent = fmt(protein, 1);
    outFat.textContent     = fmt(fat, 1);
    outCarbs.textContent   = fmt(carbs, 1);

    perUnitHint.textContent =
      `Using: ${f.name} per 1 ${f.unit} → ` +
      `${p.kcal} kcal, ${p.protein}g protein, ${p.fat}g fat, ${p.carbs}g carbs.`;

    resultBox.classList.remove("hidden");
  }

  function clearAll() {
    amountInput.value = "";
    resultBox.classList.add("hidden");
    amountInput.focus();
  }

  // Events
  foodSelect.addEventListener("change", () => {
    updateUnitUI();
    calculate();
  });

  amountInput.addEventListener("input", () => calculate());
  calcBtn.addEventListener("click", () => calculate());
  clearBtn.addEventListener("click", () => clearAll());

  // Init
  populateFoods();
  updateUnitUI();
})();
