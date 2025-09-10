document.addEventListener('DOMContentLoaded', function() {
  // --- Configuración de JSONBin ---
  const JSONBIN_URL = "https://api.jsonbin.io/v3/b/68c0a0d6d0ea881f4077edab";
  const JSONBIN_MASTERKEY = "";

  // --- Estado global ---
  let people = [];
  let expenses = [];
  let trips = [];
  let currentTripId = null;
  let percentValues = {};

  // --- Elementos DOM ---
  const tripHeader = document.getElementById('tripHeader');
  const tripCurrent = document.getElementById('tripCurrent');
  const tripMenu = document.getElementById('tripMenu');
  const tripNameInput = document.getElementById('tripNameInput');
  const addTripBtn = document.getElementById('addTripBtn');
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  const tabs = document.getElementById('tabs');
  const tabArrow = document.getElementById('tabArrow');
  const personNameInput = document.getElementById('personName');
  const addPersonBtn = document.getElementById('addPersonBtn');
  const personList = document.getElementById('personList');
  const expensePayerSelect = document.getElementById('expensePayer');
  const expenseSplitDiv = document.getElementById('expenseSplit');
  const splitPercentCheck = document.getElementById('splitPercentCheck');
  const splitPercentDiv = document.getElementById('splitPercentDiv');
  const expenseDescriptionInput = document.getElementById('expenseDescription');
  const expenseCategorySelect = document.getElementById('expenseCategory');
  const expenseAmountInput = document.getElementById('expenseAmount');
  const addExpenseBtn = document.getElementById('addExpenseBtn');
  const expenseList = document.getElementById('expenseList');
  const calcBalancesBtn = document.getElementById('calcBalancesBtn');
  const balancesSection = document.getElementById('balancesSection');
  const filterDescription = document.getElementById('filterDescription');
  const filterCategory = document.getElementById('filterCategory');
  const filterDateStart = document.getElementById('filterDateStart');
  const filterDateEnd = document.getElementById('filterDateEnd');
  const filterBtn = document.getElementById('filterBtn');
  const clearFilterBtn = document.getElementById('clearFilterBtn');
  const historyList = document.getElementById('historyList');
  const statsCards = document.getElementById('statsCards');
  let statsChart = null; // <-- getContext se moverá a renderStats

  // --- Viajes ---
async function loadFromCloud() { /* ... tu código ... */ }
async function saveToCloud() { /* ... tu código ... */ }
function renderTrips() { /* ... tu código ... */ }
function addTrip() { /* ... tu código ... */ }
function selectTrip() { /* ... tu código ... */ }
// --- Viajeros ---
function renderPeople() { /* ... tu código ... */ }
function addPerson() { /* ... tu código ... */ }
window.removePerson = function(id) { /* ... tu código ... */ };
// --- Gastos ---
function renderExpenseForm() { /* ... tu código ... */ }
function renderExpenses() { /* ... tu código ... */ }
function addExpense() { /* ... tu código ... */ }
window.removeExpense = function(id) { /* ... tu código ... */ };

// --- Balances ---
function renderBalances() { /* ... tu código ... */ }
// --- Historial ---
function renderHistory() { /* ... tu código ... */ }
function filterHistory() { /* ... tu código ... */ }
// --- Estadísticas ---
function renderStats() {
  statsCards.innerHTML = '';
  // ... (tu código para calcular estadísticas)
  if (statsChart) statsChart.destroy();
  // getContext aquí:
  const statsChartCtx = document.getElementById('statsChart').getContext('2d');
  statsChart = new Chart(statsChartCtx, {
    type: 'doughnut',
    data: { /* ... */ },
    options: { /* ... */ }
  });
}

  
// --- Utilidades ---
function getIcon(cat) { /* ... tu código ... */ }
function saveTripToCloud() { /* ... tu código ... */ }
function copyLink() { /* ... tu código ... */ }
// --- Eventos ---
document.getElementById('addPersonBtn').onclick = addPerson;
document.getElementById('addTripBtn').onclick = addTrip;
document.getElementById('copyLinkBtn').onclick = copyLink;
// ... (otros eventos)
// --- Inicialización ---
loadFromCloud();

  
  // --- Pestañas ---
  function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
    let idx = tabName==='viajeros'?1:tabName==='gastos'?2:tabName==='balances'?3:tabName==='historial'?4:5;
    tabs.querySelector(`.tab:nth-child(${idx})`).classList.add('active');
    if (window.innerWidth < 600) {
      tabs.scrollTo({left: (idx-1)*120, behavior: 'smooth'});
    }
  }

  // --- Flecha scroll en móviles ---
  function showTabArrow() {
    if (window.innerWidth < 600) {
      tabArrow.style.display = 'block';
      tabArrow.onclick = () => tabs.scrollBy({left: 160, behavior: 'smooth'});
    } else {
      tabArrow.style.display = 'none';
    }
  }
  window.addEventListener('resize', showTabArrow);
  showTabArrow();

  // --- (El resto de las funciones: viajes, viajeros, gastos, balances, historial, stats) ---
  // --- Inicialización ---
  loadFromCloud();
});
