/**
 * Victor Tuboy I - Real-Time Deduction & Budget Tracker
 * Core Application Logic
 */

// Colors dictionary for category representations
const CATEGORY_COLORS = {
  Salary: 'var(--color-emerald)',
  Freelance: '#3b82f6',
  Investments: 'var(--color-amber)',
  Food: '#fb923c',
  Rent: '#a78bfa',
  Utilities: '#2dd4bf',
  Entertainment: 'var(--color-rose)',
  Transportation: '#22d3ee',
  Shopping: '#ec4899',
  Others: '#9ca3af'
};

// Initial state template when localStorage is empty
const INITIAL_TRANSACTIONS = [
  { id: 'tx-1', description: 'Monthly Salary Payment', amount: 4200.00, category: 'Salary', type: 'income', date: '2026-06-01' },
  { id: 'tx-2', description: 'UI/UX Freelance Project', amount: 850.00, category: 'Freelance', type: 'income', date: '2026-06-02' },
  { id: 'tx-3', description: 'Apartment Monthly Rent', amount: 1100.00, category: 'Rent', type: 'expense', date: '2026-06-02' },
  { id: 'tx-4', description: 'Organic Grocery shopping', amount: 142.50, category: 'Food', type: 'expense', date: '2026-06-03' },
  { id: 'tx-5', description: 'Electricity Grid Bill', amount: 95.00, category: 'Utilities', type: 'expense', date: '2026-06-04' },
  { id: 'tx-6', description: 'Netflix & Spotify sub', amount: 32.90, category: 'Entertainment', type: 'expense', date: '2026-06-05' },
  { id: 'tx-7', description: 'Gas station refuel', amount: 60.00, category: 'Transportation', type: 'expense', date: '2026-06-05' },
  { id: 'tx-8', description: 'Office ergonomic desk lamp', amount: 85.00, category: 'Shopping', type: 'expense', date: '2026-06-06' }
];

const INITIAL_BUDGET = 2500.00;

// Application State
let state = {
  budget: INITIAL_BUDGET,
  transactions: [],
  filters: {
    search: '',
    type: 'all',
    category: 'all'
  },
  sorting: {
    column: 'date',
    direction: 'desc' // 'asc' or 'desc'
  },
  simulator: {
    amount: 0,
    category: 'Others'
  }
};

// Cache DOM elements
const elements = {
  // Navigation
  navDash: document.getElementById('nav-dash'),
  navTx: document.getElementById('nav-tx'),
  navSim: document.getElementById('nav-sim'),
  dashboardView: document.getElementById('dashboard-view'),
  transactionsView: document.getElementById('transactions-view'),
  
  // Dashboard indicators
  valBudget: document.getElementById('val-budget'),
  valIncome: document.getElementById('val-income'),
  valExpenses: document.getElementById('val-expenses'),
  valBalance: document.getElementById('val-balance'),
  subBudget: document.getElementById('sub-budget'),
  subIncome: document.getElementById('sub-income'),
  subExpenses: document.getElementById('sub-expenses'),
  subBalance: document.getElementById('sub-balance'),
  balanceCard: document.getElementById('balance-card'),
  balanceIcon: document.getElementById('balance-icon'),
  
  // Sidebar stats
  efficiencyFill: document.getElementById('efficiency-fill'),
  efficiencyValue: document.getElementById('efficiency-value'),
  
  // Deduction Simulator elements
  simCategory: document.getElementById('sim-category'),
  simAmountSlider: document.getElementById('sim-amount-slider'),
  simSliderVal: document.getElementById('sim-slider-val'),
  simMaxLimit: document.getElementById('sim-max-limit'),
  simFeedback: document.getElementById('sim-feedback'),
  simCurrentBal: document.getElementById('sim-current-bal'),
  simProjectedBal: document.getElementById('sim-projected-bal'),
  simBudgetPct: document.getElementById('sim-budget-pct'),
  simProgressBar: document.getElementById('sim-progress-bar'),
  simGaugeLabel: document.getElementById('sim-gauge-label'),
  
  // SVG Graphics
  svgDonut: document.getElementById('svg-donut'),
  donutTotal: document.getElementById('donut-total'),
  donutLegend: document.getElementById('donut-legend'),
  svgTrend: document.getElementById('svg-trend'),
  trendLine: document.getElementById('trend-line'),
  trendArea: document.getElementById('trend-area'),
  trendAxes: document.getElementById('trend-axes'),
  
  // Transaction Table elements
  txSearch: document.getElementById('tx-search'),
  filterType: document.getElementById('filter-type'),
  filterCategory: document.getElementById('filter-category'),
  txTableBody: document.getElementById('tx-table-body'),
  txCountLabel: document.getElementById('tx-count-label'),
  tableEmptyState: document.getElementById('table-empty-state'),
  thDate: document.getElementById('th-date'),
  thDesc: document.getElementById('th-desc'),
  thCategory: document.getElementById('th-category'),
  thType: document.getElementById('th-type'),
  thAmount: document.getElementById('th-amount'),
  
  // Modal Dialogs & Buttons
  btnExport: document.getElementById('btn-export'),
  btnImport: document.getElementById('btn-import'),
  importFileInput: document.getElementById('import-file-input'),
  btnAddTxTrigger: document.getElementById('btn-add-tx-trigger'),
  
  budgetDialog: document.getElementById('budget-dialog'),
  btnEditBudget: document.getElementById('btn-edit-budget'),
  btnCloseBudget: document.getElementById('btn-close-budget'),
  btnCancelBudget: document.getElementById('btn-cancel-budget'),
  budgetForm: document.getElementById('budget-form'),
  budgetInput: document.getElementById('budget-input'),
  
  txDialog: document.getElementById('tx-dialog'),
  btnCloseTx: document.getElementById('btn-close-tx'),
  btnCancelTx: document.getElementById('btn-cancel-tx'),
  txForm: document.getElementById('tx-form'),
  txDesc: document.getElementById('tx-desc'),
  txAmount: document.getElementById('tx-amount'),
  txCategory: document.getElementById('tx-category'),
  txDate: document.getElementById('tx-date'),
  btnSubmitTx: document.getElementById('btn-submit-tx'),
  typeOptExpense: document.getElementById('type-opt-expense'),
  typeOptIncome: document.getElementById('type-opt-income')
};

// Initialize Application
function init() {
  // Load State from LocalStorage
  loadState();

  // Set default date input value to today
  elements.txDate.value = new Date().toISOString().split('T')[0];

  // Bind Event Listeners
  bindEvents();

  // Initial calculation and layout render
  updateUI();
}

// Load configurations from storage
function loadState() {
  const storedBudget = localStorage.getItem('vt_budget');
  const storedTransactions = localStorage.getItem('vt_transactions');
  
  if (storedBudget !== null) {
    state.budget = parseFloat(storedBudget);
  } else {
    state.budget = INITIAL_BUDGET;
    localStorage.setItem('vt_budget', INITIAL_BUDGET.toString());
  }

  if (storedTransactions !== null) {
    try {
      state.transactions = JSON.parse(storedTransactions);
    } catch (e) {
      state.transactions = INITIAL_TRANSACTIONS;
      localStorage.setItem('vt_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
    }
  } else {
    state.transactions = INITIAL_TRANSACTIONS;
    localStorage.setItem('vt_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
  }
}

// Save active transactions/budget
function saveState() {
  localStorage.setItem('vt_budget', state.budget.toString());
  localStorage.setItem('vt_transactions', JSON.stringify(state.transactions));
}

// Event bindings
function bindEvents() {
  // Navigation tab toggles
  elements.navDash.addEventListener('click', (e) => switchTab(e, 'dashboard'));
  elements.navTx.addEventListener('click', (e) => switchTab(e, 'transactions'));
  elements.navSim.addEventListener('click', (e) => {
    switchTab(e, 'dashboard');
    // Scroll smoothly to simulator panel
    setTimeout(() => {
      elements.simAmountSlider.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Trigger a beautiful visual focus glow
      elements.simFeedback.classList.add('active-deduction');
      setTimeout(() => elements.simFeedback.classList.remove('active-deduction'), 2000);
    }, 300);
  });

  // Modal actions: Budget Editor
  elements.btnEditBudget.addEventListener('click', () => {
    elements.budgetInput.value = state.budget;
    elements.budgetDialog.showModal();
  });
  
  const closeBudgetDialog = () => elements.budgetDialog.close();
  elements.btnCloseBudget.addEventListener('click', closeBudgetDialog);
  elements.btnCancelBudget.addEventListener('click', closeBudgetDialog);
  
  elements.budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newBudget = parseFloat(elements.budgetInput.value);
    if (!isNaN(newBudget) && newBudget >= 0) {
      state.budget = newBudget;
      saveState();
      updateUI();
      closeBudgetDialog();
    }
  });

  // Modal actions: Add Transaction
  elements.btnAddTxTrigger.addEventListener('click', () => {
    elements.txForm.reset();
    elements.txDate.value = new Date().toISOString().split('T')[0];
    setTxTypeOption('expense');
    elements.txDialog.showModal();
  });

  const closeTxDialog = () => elements.txDialog.close();
  elements.btnCloseTx.addEventListener('click', closeTxDialog);
  elements.btnCancelTx.addEventListener('click', closeTxDialog);

  // Form toggle switches between Income/Expense
  elements.typeOptExpense.addEventListener('click', () => setTxTypeOption('expense'));
  elements.typeOptIncome.addEventListener('click', () => setTxTypeOption('income'));

  elements.txForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const isExpense = elements.typeOptExpense.classList.contains('active');
    const amount = parseFloat(elements.txAmount.value);
    const description = elements.txDesc.value.trim();
    const category = elements.txCategory.value;
    const date = elements.txDate.value;

    if (description && !isNaN(amount) && amount > 0 && category && date) {
      const newTx = {
        id: 'tx-' + Date.now(),
        description,
        amount,
        category,
        type: isExpense ? 'expense' : 'income',
        date
      };
      
      state.transactions.push(newTx);
      saveState();
      updateUI();
      closeTxDialog();
    }
  });

  // Real-Time Simulator Slider listeners
  elements.simAmountSlider.addEventListener('input', (e) => {
    state.simulator.amount = parseFloat(e.target.value);
    elements.simSliderVal.textContent = formatCurrency(state.simulator.amount);
    updateSimulatorFeedback();
  });

  elements.simCategory.addEventListener('change', (e) => {
    state.simulator.category = e.target.value;
    updateSimulatorFeedback();
  });

  // Transaction view filters
  elements.txSearch.addEventListener('input', (e) => {
    state.filters.search = e.target.value.toLowerCase();
    renderTransactionsTable();
  });

  elements.filterType.addEventListener('change', (e) => {
    state.filters.type = e.target.value;
    renderTransactionsTable();
  });

  elements.filterCategory.addEventListener('change', (e) => {
    state.filters.category = e.target.value;
    renderTransactionsTable();
  });

  // Sorting columns in table
  elements.thDate.addEventListener('click', () => toggleSort('date'));
  elements.thDesc.addEventListener('click', () => toggleSort('description'));
  elements.thCategory.addEventListener('click', () => toggleSort('category'));
  elements.thType.addEventListener('click', () => toggleSort('type'));
  elements.thAmount.addEventListener('click', () => toggleSort('amount'));

  // Export Data
  elements.btnExport.addEventListener('click', exportData);

  // Import Data
  elements.btnImport.addEventListener('click', () => elements.importFileInput.click());
  elements.importFileInput.addEventListener('change', importData);
}

// Switching tab sections
function switchTab(event, targetSection) {
  if (event) event.preventDefault();

  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.view-section').forEach(view => view.classList.remove('active'));

  if (targetSection === 'dashboard') {
    elements.navDash.classList.add('active');
    elements.dashboardView.classList.add('active');
  } else if (targetSection === 'transactions') {
    elements.navTx.classList.add('active');
    elements.transactionsView.classList.add('active');
    renderTransactionsTable(); // Always refresh table on filter tab
  }
}

// Toggle Add Transaction Modal type option (Income or Expense toggle switches)
function setTxTypeOption(type) {
  const options = elements.txCategory.querySelectorAll('option');
  
  if (type === 'expense') {
    elements.typeOptExpense.classList.add('active');
    elements.typeOptIncome.classList.remove('active');
    
    // Toggle options
    options.forEach(opt => {
      if (opt.classList.contains('opt-expense')) {
        opt.style.display = 'block';
      } else {
        opt.style.display = 'none';
      }
    });
    // Set default category for expense
    elements.txCategory.value = 'Food';
  } else {
    elements.typeOptIncome.classList.add('active');
    elements.typeOptExpense.classList.remove('active');
    
    // Toggle options
    options.forEach(opt => {
      if (opt.classList.contains('opt-income')) {
        opt.style.display = 'block';
      } else {
        opt.style.display = 'none';
      }
    });
    // Set default category for income
    elements.txCategory.value = 'Salary';
  }
}

// Helper: Format to currency string
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Main updater for visual panels
function updateUI() {
  // 1. Recalculate Totals
  const incomeTx = state.transactions.filter(t => t.type === 'income');
  const expenseTx = state.transactions.filter(t => t.type === 'expense');
  
  const totalIncome = incomeTx.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseTx.reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  
  // 2. Set dashboard metrics fields
  elements.valBudget.textContent = formatCurrency(state.budget);
  elements.valIncome.textContent = formatCurrency(totalIncome);
  elements.valExpenses.textContent = formatCurrency(totalExpenses);
  elements.valBalance.textContent = formatCurrency(netBalance);
  
  elements.subIncome.textContent = `${incomeTx.length} transactions`;
  elements.subExpenses.textContent = `${expenseTx.length} transactions`;
  
  // 3. Update remaining balance state highlights (Warning red/deficit indicator)
  if (netBalance < 0) {
    elements.balanceCard.classList.add('alert-deficit');
    elements.subBalance.textContent = 'Account Deficit — Incurring Debt!';
    elements.subBalance.style.color = 'var(--color-rose)';
    elements.balanceIcon.className = 'card-icon red';
    // Change balance icon to exclamation mark
    elements.balanceIcon.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  } else {
    elements.balanceCard.classList.remove('alert-deficit');
    const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(0) : 0;
    elements.subBalance.textContent = `${savingsRate}% savings rate`;
    elements.subBalance.style.color = 'var(--text-dim)';
    elements.balanceIcon.className = 'card-icon gold';
    elements.balanceIcon.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  }

  // 4. Update Sidebar budget efficiency progress indicators
  const budgetUsagePct = state.budget > 0 ? (totalExpenses / state.budget) * 100 : 100;
  const budgetEfficiencyLeft = Math.max(0, 100 - budgetUsagePct);
  
  elements.efficiencyFill.style.width = `${Math.min(100, budgetUsagePct)}%`;
  if (budgetUsagePct > 100) {
    elements.efficiencyFill.classList.add('overbudget');
    elements.efficiencyValue.textContent = 'Budget Exceeded!';
    elements.efficiencyValue.style.color = 'var(--color-rose)';
    elements.subBudget.textContent = 'Exceeded budget limit!';
    elements.subBudget.style.color = 'var(--color-rose)';
  } else {
    elements.efficiencyFill.classList.remove('overbudget');
    elements.efficiencyValue.textContent = `${budgetEfficiencyLeft.toFixed(0)}% Left`;
    elements.efficiencyValue.style.color = 'var(--text-main)';
    elements.subBudget.textContent = `${budgetUsagePct.toFixed(0)}% of limit consumed`;
    elements.subBudget.style.color = 'var(--text-dim)';
  }

  // 5. Update Simulator limits based on balance or standard max
  const maxSimLimit = Math.max(1000, Math.ceil(totalIncome / 500) * 500);
  elements.simAmountSlider.max = maxSimLimit;
  elements.simMaxLimit.textContent = formatCurrency(maxSimLimit);
  
  // Reset simulator amounts on core load to match
  elements.simAmountSlider.value = state.simulator.amount;
  elements.simSliderVal.textContent = formatCurrency(state.simulator.amount);

  updateSimulatorFeedback();

  // 6. Draw dynamic SVG Charts
  drawDonutChart(expenseTx, totalExpenses);
  drawTrendChart();
  
  // 7. Refresh transaction table listing
  renderTransactionsTable();
}

// Simulation deduction engine logic
function updateSimulatorFeedback() {
  const totalIncome = state.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = state.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = totalIncome - totalExpenses;
  
  const simulatedDeduction = state.simulator.amount;
  const projectedBalance = currentBalance - simulatedDeduction;
  
  // Set amounts readings
  elements.simCurrentBal.textContent = formatCurrency(currentBalance);
  elements.simProjectedBal.textContent = formatCurrency(projectedBalance);
  
  // Budget impact computation
  const simTotalExpenses = totalExpenses + simulatedDeduction;
  const simBudgetUsagePct = state.budget > 0 ? (simTotalExpenses / state.budget) * 100 : 100;
  elements.simBudgetPct.textContent = `${simBudgetUsagePct.toFixed(0)}%`;
  
  // Visual Progress bar fill percentage
  const fillPct = Math.min(100, simBudgetUsagePct);
  elements.simProgressBar.style.width = `${fillPct}%`;
  
  // Dynamic alerts colors and classing
  elements.simFeedback.classList.remove('alert-warning', 'alert-danger');
  const statusEl = elements.simFeedback.querySelector('.feedback-status');
  
  // Status check
  if (simulatedDeduction === 0) {
    statusEl.className = 'feedback-status status-safe';
    statusEl.innerHTML = `<span class="status-indicator"></span><span class="status-text">Simulator Idle — Deduct $0.00</span>`;
    elements.simProgressBar.style.backgroundColor = 'var(--color-emerald)';
    elements.simGaugeLabel.textContent = 'Safe Margin';
    elements.simGaugeLabel.style.color = 'var(--color-emerald)';
  } else if (projectedBalance < 0) {
    // Over Draft Debt!
    elements.simFeedback.classList.add('alert-danger');
    statusEl.className = 'feedback-status status-danger';
    statusEl.innerHTML = `<span class="status-indicator"></span><span class="status-text">Critical: Balance Overdraft!</span>`;
    elements.simProgressBar.style.backgroundColor = 'var(--color-rose)';
    elements.simGaugeLabel.textContent = 'Debt Incurred';
    elements.simGaugeLabel.style.color = 'var(--color-rose)';
  } else if (simTotalExpenses > state.budget) {
    // Exceeds Monthly Budget
    elements.simFeedback.classList.add('alert-warning');
    statusEl.className = 'feedback-status status-warning';
    statusEl.innerHTML = `<span class="status-indicator"></span><span class="status-text">Warning: Budget Limit Exceeded!</span>`;
    elements.simProgressBar.style.backgroundColor = 'var(--color-amber)';
    elements.simGaugeLabel.textContent = 'Over budget limit';
    elements.simGaugeLabel.style.color = 'var(--color-amber)';
  } else {
    // Perfectly fine transaction
    statusEl.className = 'feedback-status status-safe';
    statusEl.innerHTML = `<span class="status-indicator"></span><span class="status-text">Safe: Affordable Purchase</span>`;
    elements.simProgressBar.style.backgroundColor = 'var(--color-emerald)';
    elements.simGaugeLabel.textContent = `${(100 - simBudgetUsagePct).toFixed(0)}% Remaining`;
    elements.simGaugeLabel.style.color = 'var(--color-emerald)';
  }
}

// Generate dynamic SVG Donut/Pie Chart
function drawDonutChart(expenseTx, totalExpenses) {
  // Clear any previous dynamically generated arcs
  const prevArcs = elements.svgDonut.querySelectorAll('.donut-arc');
  prevArcs.forEach(arc => arc.remove());
  
  if (totalExpenses === 0) {
    elements.donutTotal.textContent = '$0.00';
    elements.donutLegend.innerHTML = '<div class="no-data-msg">No expense transactions recorded. Create one using "New Transaction" to see visual analytics.</div>';
    return;
  }
  
  elements.donutTotal.textContent = formatCurrency(totalExpenses);
  
  // Categorize expense aggregates
  const categoriesMap = {};
  expenseTx.forEach(tx => {
    categoriesMap[tx.category] = (categoriesMap[tx.category] || 0) + tx.amount;
  });
  
  // Sort categories by expenditure value
  const sortedCategories = Object.keys(categoriesMap)
    .map(cat => ({ category: cat, amount: categoriesMap[cat], color: CATEGORY_COLORS[cat] || '#9ca3af' }))
    .sort((a, b) => b.amount - a.amount);
    
  // Compute SVG arc configurations
  // Circumference of r=40 is 2 * PI * 40 = 251.327
  const circumference = 251.327;
  let accumulatedOffset = 0;
  
  // Build legend elements alongside
  let legendHtml = '';
  
  sortedCategories.forEach(item => {
    const percentage = (item.amount / totalExpenses) * 100;
    
    // SVG circular arc parameters
    const arcLength = (percentage / 100) * circumference;
    const arcGap = circumference - arcLength;
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', 'donut-arc');
    circle.setAttribute('cx', '50');
    circle.setAttribute('cy', '50');
    circle.setAttribute('r', '40');
    circle.setAttribute('stroke', item.color);
    circle.setAttribute('stroke-dasharray', `${arcLength} ${arcGap}`);
    circle.setAttribute('stroke-dashoffset', -accumulatedOffset);
    circle.setAttribute('fill', 'transparent');
    circle.setAttribute('stroke-width', '12');
    
    // Add interactions
    circle.addEventListener('mouseover', () => {
      elements.donutTotal.textContent = formatCurrency(item.amount);
      elements.donutTotal.nextElementSibling.textContent = item.category;
    });
    
    circle.addEventListener('mouseout', () => {
      elements.donutTotal.textContent = formatCurrency(totalExpenses);
      elements.donutTotal.nextElementSibling.textContent = 'Total Spent';
    });
    
    elements.svgDonut.appendChild(circle);
    accumulatedOffset += arcLength;
    
    // Build legend layout
    legendHtml += `
      <div class="legend-item" data-category="${item.category}">
        <div class="legend-label-col">
          <span class="legend-dot" style="background-color: ${item.color};"></span>
          <span>${item.category}</span>
        </div>
        <div class="legend-val-col">
          <span>${formatCurrency(item.amount)}</span>
          <small>${percentage.toFixed(1)}%</small>
        </div>
      </div>
    `;
  });
  
  elements.donutLegend.innerHTML = legendHtml;
}

// Generate dynamic SVG chronological area graph
function drawTrendChart() {
  const points = elements.svgTrend.querySelectorAll('.trend-data-point');
  points.forEach(p => p.remove());
  
  // Sort transactions chronologically
  const sortedTx = [...state.transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  if (sortedTx.length === 0) {
    elements.trendLine.setAttribute('d', '');
    elements.trendArea.setAttribute('d', '');
    elements.trendAxes.innerHTML = '<span>No transaction timeline data.</span>';
    return;
  }
  
  // Accumulate balance trends daily
  const dailyBalances = [];
  let runningBalance = 0;
  
  // Build chronological running data points
  sortedTx.forEach(tx => {
    if (tx.type === 'income') {
      runningBalance += tx.amount;
    } else {
      runningBalance -= tx.amount;
    }
    
    // Check if daily record already exists, if so overwrite with newest cumulative value
    const lastDay = dailyBalances[dailyBalances.length - 1];
    if (lastDay && lastDay.date === tx.date) {
      lastDay.balance = runningBalance;
    } else {
      dailyBalances.push({
        date: tx.date,
        balance: runningBalance
      });
    }
  });

  // Calculate scaling grid dimensions
  // Viewbox: 600 x 200. Padding: X: 40px, Y: 20px
  const width = 600;
  const height = 200;
  const paddingX = 40;
  const paddingY = 20;
  
  const minBalance = Math.min(0, ...dailyBalances.map(db => db.balance));
  const maxBalance = Math.max(100, ...dailyBalances.map(db => db.balance));
  const balanceRange = maxBalance - minBalance;
  
  // Create X & Y mappings
  const totalDays = dailyBalances.length;
  
  const getCoordinates = (index, balance) => {
    // Map index to X coordinate [paddingX, width - paddingX]
    const x = paddingX + (index / Math.max(1, totalDays - 1)) * (width - 2 * paddingX);
    // Map balance value to Y coordinate [height - paddingY, paddingY] (flipped coordinates)
    const normalizedY = (balance - minBalance) / (balanceRange || 1);
    const y = (height - paddingY) - normalizedY * (height - 2 * paddingY);
    return { x, y };
  };

  // Build SVG Path strings
  let linePathStr = '';
  let areaPathStr = '';
  
  const pointsCoords = [];
  
  dailyBalances.forEach((db, index) => {
    const { x, y } = getCoordinates(index, db.balance);
    pointsCoords.push({ x, y, date: db.date, balance: db.balance });
    
    if (index === 0) {
      linePathStr += `M ${x} ${y}`;
      areaPathStr += `M ${x} ${height - paddingY} L ${x} ${y}`;
    } else {
      linePathStr += ` L ${x} ${y}`;
      areaPathStr += ` L ${x} ${y}`;
    }
  });
  
  // Close the area path to build bounds
  if (pointsCoords.length > 0) {
    const lastPoint = pointsCoords[pointsCoords.length - 1];
    areaPathStr += ` L ${lastPoint.x} ${height - paddingY} Z`;
  }
  
  elements.trendLine.setAttribute('d', linePathStr);
  elements.trendArea.setAttribute('d', areaPathStr);
  
  // Draw interactive dots on paths
  pointsCoords.forEach(pt => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', 'trend-data-point');
    circle.setAttribute('cx', pt.x.toString());
    circle.setAttribute('cy', pt.y.toString());
    circle.setAttribute('r', '4');
    
    // Tooltip titles
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${formatDateString(pt.date)}: ${formatCurrency(pt.balance)}`;
    circle.appendChild(title);
    
    elements.svgTrend.appendChild(circle);
  });

  // Render Horizontal gridlines markers
  const gridLines = elements.svgTrend.querySelectorAll('.trend-grid-line');
  gridLines.forEach(gl => gl.remove());

  const gridLevels = 3; // 3 levels: bottom, middle, top
  for (let i = 0; i < gridLevels; i++) {
    const val = minBalance + (i / (gridLevels - 1)) * balanceRange;
    const y = (height - paddingY) - (i / (gridLevels - 1)) * (height - 2 * paddingY);
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'trend-grid-line');
    line.setAttribute('x1', paddingX.toString());
    line.setAttribute('y1', y.toString());
    line.setAttribute('x2', (width - paddingX).toString());
    line.setAttribute('y2', y.toString());
    elements.svgTrend.insertBefore(line, elements.trendLine);
  }

  // Draw X & Y axis label text
  let axisHtml = '';
  if (dailyBalances.length > 0) {
    axisHtml += `<span>${formatDateString(dailyBalances[0].date)}</span>`;
    if (dailyBalances.length > 2) {
      const midIndex = Math.floor(dailyBalances.length / 2);
      axisHtml += `<span>${formatDateString(dailyBalances[midIndex].date)}</span>`;
    }
    axisHtml += `<span>${formatDateString(dailyBalances[dailyBalances.length - 1].date)}</span>`;
  }
  elements.trendAxes.innerHTML = axisHtml;
}

// Format short date string representation
function formatDateString(dateStr) {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Sorting logic table action trigger
function toggleSort(column) {
  if (state.sorting.column === column) {
    state.sorting.direction = state.sorting.direction === 'asc' ? 'desc' : 'asc';
  } else {
    state.sorting.column = column;
    state.sorting.direction = 'asc';
  }
  
  // Re-draw arrows inside column headers
  document.querySelectorAll('.tx-table th.sortable').forEach(th => {
    const arrow = th.querySelector('.arrow');
    if (arrow) arrow.textContent = '';
  });
  
  const thMap = {
    date: elements.thDate,
    description: elements.thDesc,
    category: elements.thCategory,
    type: elements.thType,
    amount: elements.thAmount
  };
  
  const currentTh = thMap[column];
  if (currentTh) {
    const arrow = currentTh.querySelector('.arrow') || document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = state.sorting.direction === 'asc' ? ' ↑' : ' ↓';
    if (!currentTh.querySelector('.arrow')) currentTh.appendChild(arrow);
  }
  
  renderTransactionsTable();
}

// Render Table components with active sorting/filtering
function renderTransactionsTable() {
  const tbody = elements.txTableBody;
  tbody.innerHTML = '';
  
  // Filter transactions
  let filtered = state.transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(state.filters.search) || 
                          tx.category.toLowerCase().includes(state.filters.search);
    const matchesType = state.filters.type === 'all' || tx.type === state.filters.type;
    const matchesCategory = state.filters.category === 'all' || tx.category === state.filters.category;
    
    return matchesSearch && matchesType && matchesCategory;
  });
  
  // Sort transactions
  const col = state.sorting.column;
  const dir = state.sorting.direction === 'asc' ? 1 : -1;
  
  filtered.sort((a, b) => {
    if (col === 'amount') {
      return (a.amount - b.amount) * dir;
    }
    if (col === 'date') {
      return (new Date(a.date) - new Date(b.date)) * dir;
    }
    return a[col].toString().localeCompare(b[col].toString()) * dir;
  });
  
  // Update count label
  elements.txCountLabel.textContent = `Showing ${filtered.length} of ${state.transactions.length} transactions`;
  
  if (filtered.length === 0) {
    elements.tableEmptyState.classList.add('active');
    return;
  } else {
    elements.tableEmptyState.classList.remove('active');
  }
  
  // Draw rows
  filtered.forEach(tx => {
    const tr = document.createElement('tr');
    tr.dataset.id = tx.id;
    
    // Construct values
    const dateFormatted = formatDateString(tx.date);
    const catClass = tx.category.toLowerCase();
    const typeLabel = tx.type === 'income' ? 'Inflow' : 'Outflow';
    const amountFormatted = (tx.type === 'income' ? '+' : '-') + formatCurrency(tx.amount);
    const amountClass = tx.type === 'income' ? 'inflow' : 'outflow';
    
    tr.innerHTML = `
      <td>${dateFormatted}</td>
      <td style="font-weight: 500;">${escapeHTML(tx.description)}</td>
      <td>
        <span class="cat-pill ${catClass}">
          ${getCategoryIcon(tx.category)}
          ${tx.category}
        </span>
      </td>
      <td>${typeLabel}</td>
      <td class="amount-col amount-val ${amountClass}">${amountFormatted}</td>
      <td class="action-col">
        <button class="action-delete-btn" title="Delete transaction" onclick="deleteTransaction('${tx.id}')">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Global hook to delete transactions
window.deleteTransaction = function(id) {
  // Confirm action
  if (confirm('Are you sure you want to permanently delete this transaction?')) {
    const index = state.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      const tr = document.querySelector(`tr[data-id="${id}"]`);
      if (tr) {
        tr.style.transform = 'translateX(20px)';
        tr.style.opacity = '0';
        tr.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
          state.transactions.splice(index, 1);
          saveState();
          updateUI();
        }, 300);
      } else {
        state.transactions.splice(index, 1);
        saveState();
        updateUI();
      }
    }
  }
};

// Escape text helper
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Category pill icons
function getCategoryIcon(cat) {
  switch (cat) {
    case 'Salary': return '💰';
    case 'Freelance': return '💻';
    case 'Investments': return '📈';
    case 'Food': return '🍔';
    case 'Rent': return '🏠';
    case 'Utilities': return '⚡';
    case 'Entertainment': return '🎬';
    case 'Transportation': return '🚗';
    case 'Shopping': return '🛍️';
    default: return '🏷️';
  }
}

// Export database dump to file
function exportData() {
  const exportBlob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(exportBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `victor_tuboy_i_budget_data_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import database dump from file
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedState = JSON.parse(e.target.result);
      if (importedState.budget !== undefined && Array.isArray(importedState.transactions)) {
        state.budget = parseFloat(importedState.budget);
        state.transactions = importedState.transactions;
        saveState();
        updateUI();
        alert('Data configuration successfully imported!');
      } else {
        alert('Invalid data file format. Missing core properties.');
      }
    } catch (err) {
      alert('Error parsing JSON backup data.');
    }
  };
  reader.readAsText(file);
  // Clear file inputs
  elements.importFileInput.value = '';
}

// Run App
window.addEventListener('DOMContentLoaded', init);
