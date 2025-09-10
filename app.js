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
  let statsChart = null;

  // --- Pestañas ---
  window.openTab = function(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
    let idx = tabName==='viajeros'?1:tabName==='gastos'?2:tabName==='balances'?3:tabName==='historial'?4:5;
    tabs.querySelector(`.tab:nth-child(${idx})`).classList.add('active');
    if (window.innerWidth < 600) {
      tabs.scrollTo({left: (idx-1)*120, behavior: 'smooth'});
    }
  };

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

  // --- Funciones de persistencia (JSONBin) ---
  async function loadFromCloud() {
    try {
      const resp = await fetch(JSONBIN_URL + "/latest", {
        headers: { "X-Master-Key": JSONBIN_MASTERKEY }
      });
      if (!resp.ok) throw new Error('Error al cargar');
      const data = await resp.json();
      if (data.record && data.record.trips) {
        trips = data.record.trips;
      } else {
        trips = [{id: 1, name: "Viaje 1"}];
      }
      if (trips.length === 0) trips = [{id: 1, name: "Viaje 1"}];
      renderTrips();
      if (currentTripId === null) currentTripId = trips[0].id;
      selectTrip(currentTripId);
    } catch (e) {
      trips = [{id: 1, name: "Viaje 1"}];
      currentTripId = 1;
      renderTrips();
      selectTrip(currentTripId);
    }
  }
  async function saveToCloud() {
    try {
      await fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": JSONBIN_MASTERKEY
        },
        body: JSON.stringify({ trips })
      });
    } catch (e) {
      alert('Error al guardar en la nube.');
    }
  }

  // --- Viajes ---
  function renderTrips() {
    tripCurrent.textContent = trips.find(t => t.id === currentTripId).name;
    tripMenu.innerHTML = `
      <input type="text" id="tripNameInput" placeholder="Nombre del viaje" style="width:100%;margin-bottom:6px;">
      <button id="addTripBtn" class="btn" style="width:100%;"><span class="material-icons" style="vertical-align:middle;font-size:18px;">add</span> Crear viaje</button>
    `;
    addTripBtn.onclick = addTrip;
  }
  function toggleTripMenu() {
    tripHeader.classList.toggle('open');
  }
  function addTrip() {
    const name = tripNameInput.value.trim();
    if (!name) return alert('Ingresa un nombre');
    if (trips.some(t => t.name === name)) return alert('Ese nombre ya existe');
    const id = trips.length ? Math.max(...trips.map(t => t.id)) + 1 : 1;
    trips.push({id, name});
    tripNameInput.value = '';
    currentTripId = id;
    renderTrips();
    saveToCloud();
    selectTrip(id);
    tripHeader.classList.remove('open');
  }
  function selectTrip(tripId) {
    currentTripId = tripId;
    tripCurrent.textContent = trips.find(t => t.id === tripId).name;
    tripHeader.classList.remove('open');
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    people = trip.people || [];
    expenses = trip.expenses || [];
    renderPeople();
    renderExpenses();
    renderBalances();
    renderHistory();
    renderStats();
  }
  window.removeTrip = function(id) {
    if (!confirm('¿Eliminar este viaje y todos sus datos?')) return;
    trips = trips.filter(t => t.id !== id);
    if (trips.length === 0) trips = [{id: 1, name: "Viaje 1"}];
    currentTripId = trips[0].id;
    renderTrips();
    saveToCloud();
    selectTrip(currentTripId);
  };
  document.addEventListener('click', e => {
    if (!tripHeader.contains(e.target)) tripHeader.classList.remove('open');
  });

  // --- Gestión de Viajeros ---
  function renderPeople() {
    personList.innerHTML = '';
    people.forEach(person => {
      const div = document.createElement('div');
      div.className = 'person';
      div.innerHTML = `<span>${person.name}</span>
        <button class="delete-btn" onclick="removePerson(${person.id})" title="Eliminar"><span class="material-icons" style="font-size:16px;vertical-align:middle;">close</span></button>`;
      personList.appendChild(div);
    });
    renderExpenseForm();
    renderBalances();
    renderHistory();
    renderStats();
    saveTripToCloud();
  }
  function addPerson() {
    const name = personNameInput.value.trim();
    if (!name) return alert('Ingresa un nombre');
    if (people.some(p => p.name === name)) return alert('Ese nombre ya existe');
    const id = people.length ? Math.max(...people.map(p => p.id)) + 1 : 1;
    people.push({id, name});
    personNameInput.value = '';
    renderPeople();
  }
  window.removePerson = function(id) {
    if (!confirm('¿Eliminar este viajero? También se borrarán sus gastos.')) return;
    people = people.filter(p => p.id !== id);
    expenses = expenses.filter(e => e.payerId !== id && !e.split.some(s => s.personId === id));
    renderPeople();
    renderExpenses();
    renderBalances();
    renderHistory();
    renderStats();
    saveTripToCloud();
  };

  // --- Formulario de gastos ---
  function renderExpenseForm() {
    expensePayerSelect.innerHTML = '';
    people.forEach(person => {
      const opt = document.createElement('option');
      opt.value = person.id;
      opt.textContent = person.name;
      expensePayerSelect.appendChild(opt);
    });
    expenseSplitDiv.innerHTML = '';
    splitPercentDiv.innerHTML = '';
    people.forEach(person => {
      const label = document.createElement('label');
      label.innerHTML = `<input type="checkbox" value="${person.id}" checked> ${person.name}`;
      expenseSplitDiv.appendChild(label);

      const div = document.createElement('div');
      div.className = 'split-percent';
      div.innerHTML = `
        <input type="number" min="0" max="100" value="100" id="percent_${person.id}" style="width:60px;" disabled>
        <span style="color:#0057b8;font-size:0.95em;">${person.name}</span>
      `;
      splitPercentDiv.appendChild(div);
    });
    splitPercentCheck.onchange = () => {
      splitPercentDiv.style.display = splitPercentCheck.checked ? 'block' : 'none';
      if (!splitPercentCheck.checked) {
        splitPercentDiv.querySelectorAll('input').forEach(i => i.disabled = true);
      } else {
        splitPercentDiv.querySelectorAll('input').forEach(i => i.disabled = false);
      }
    };
  }

  // --- Gestión de gastos ---
  function renderExpenses() {
    expenseList.innerHTML = '';
    expenses.forEach(exp => {
      const payer = people.find(p => p.id === exp.payerId);
      const splitList = exp.split.map(s => {
        const p = people.find(p => p.id === s.personId);
        return p ? `<b>${p.name}:</b> $${s.amount.toFixed(2)}` : '';
      }).join(', ');
      const date = exp.date ? new Date(exp.date).toLocaleString() : '';
      const div = document.createElement('div');
      div.className = 'expense';
      div.innerHTML = `
        <span>
          <b>${getIcon(exp.cat)} ${exp.desc ? exp.desc : '(sin descripción)'}</b> (${exp.cat})<br>
          <span style="font-size:0.95em">Pagado por: ${payer ? payer.name : ''}</span><br>
          <span style="font-size:0.9em">Repartido: ${splitList}</span><br>
          <span style="font-size:0.85em">${date}</span>
        </span>
        <button class="delete-btn" onclick="removeExpense(${exp.id})">Eliminar</button>
      `;
      expenseList.appendChild(div);
    });
  }
  function addExpense() {
    if (people.length < 2) return alert('Agrega al menos 2 viajeros');
    const desc = expenseDescriptionInput.value.trim();
    const cat = expenseCategorySelect.value;
    const amount = parseFloat(expenseAmountInput.value);
    if (isNaN(amount) || amount <= 0) return alert('Ingresa un monto válido');
    const payerId = parseInt(expensePayerSelect.value);
    let split = Array.from(expenseSplitDiv.querySelectorAll('input[type=checkbox]:checked'))
      .map(cb => ({personId: parseInt(cb.value), amount: 0}));
    if (!split.length) return alert('Selecciona al menos un viajero para repartir');
    if (splitPercentCheck.checked) {
      let totalPercent = 0;
      split.forEach(s => {
        const val = parseFloat(document.getElementById(`percent_${s.personId}`).value) || 0;
        percentValues[s.personId] = val;
        totalPercent += val;
      });
      if (Math.abs(totalPercent-100) > 0.1) return alert('La suma de porcentajes debe ser 100%');
      split.forEach(s => {
        if (percentValues[s.personId] > 0) {
          s.amount = Math.round(amount * (percentValues[s.personId]/100) * 100)/100;
        } else {
          s.amount = 0;
        }
      });
      let totalSplit = split.reduce((a,b) => a+b.amount, 0);
      if (Math.abs(totalSplit - amount) > 0.01) {
        split[split.length-1].amount += (amount - totalSplit);
      }
    } else {
      const splitAmount = amount / split.length;
      split.forEach(s => s.amount = Math.round(splitAmount * 100) / 100);
      let totalSplit = split.reduce((a,b) => a+b.amount, 0);
      if (Math.abs(totalSplit - amount) > 0.01) {
        split[split.length-1].amount += (amount - totalSplit);
      }
    }
    const id = expenses.length ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
    expenses.push({
      id, desc, cat, amount, payerId, split,
      date: new Date().toISOString()
    });
    expenseDescriptionInput.value = '';
    expenseAmountInput.value = '';
    splitPercentCheck.checked = false;
    splitPercentDiv.style.display = 'none';
    splitPercentDiv.querySelectorAll('input').forEach(i => i.disabled = true);
    Array.from(expenseSplitDiv.querySelectorAll('input[type=checkbox]')).forEach(cb => cb.checked = true);
    renderExpenses();
    renderBalances();
    renderHistory();
    renderStats();
    saveTripToCloud();
  }
  window.removeExpense = function(id) {
    expenses = expenses.filter(e => e.id !== id);
    renderExpenses();
    renderBalances();
    renderHistory();
    renderStats();
    saveTripToCloud();
  };

  // --- Balances ---
  function renderBalances() {
    balancesSection.innerHTML = '';
    if (people.length < 2) return;
    const paid = {};
    people.forEach(p => paid[p.id] = 0);
    expenses.forEach(exp => { paid[exp.payerId] += exp.amount; });
    const owes = {};
    people.forEach(p => owes[p.id] = 0);
    expenses.forEach(exp => { exp.split.forEach(s => owes[s.personId] += s.amount); });
    const net = {};
    people.forEach(p => net[p.id] = (paid[p.id] || 0) - (owes[p.id] || 0));
    let balancesDiv = document.createElement('div');
    balancesDiv.className = 'balances';
    balancesDiv.innerHTML = '<b>Balances por persona:</b><br>';
    people.forEach(p => {
      let balance = net[p.id];
      if (balance > 0)
        balancesDiv.innerHTML += `<span class="credit">${p.name}: +$${balance.toFixed(2)}</span><br>`;
      else if (balance < 0)
        balancesDiv.innerHTML += `<span class="debt">${p.name}: -$${(-balance).toFixed(2)}</span><br>`;
      else
        balancesDiv.innerHTML += `<span>${p.name}: $0.00</span><br>`;
    });
    balancesSection.appendChild(balancesDiv);
    let debtors = people.map(p => ({
      id: p.id,
      name: p.name,
      debt: -net[p.id] > 0.01 ? -net[p.id] : 0
    })).filter(p => p.debt > 0);
    let creditors = people.map(p => ({
      id: p.id,
      name: p.name,
      credit: net[p.id] > 0.01 ? net[p.id] : 0
    })).filter(p => p.credit > 0);
    let payments = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      let d = debtors[i];
      let c = creditors[j];
      let amount = Math.min(d.debt, c.credit);
      if (amount > 0.01) {
        payments.push({ from: d, to: c, amount: Math.round(amount * 100) / 100 });
        d.debt -= amount;
        c.credit -= amount;
      }
      if (d.debt < 0.01) i++;
      if (c.credit < 0.01) j++;
    }
    if (payments.length) {
      let payDiv = document.createElement('div');
      payDiv.className = 'balances';
      payDiv.innerHTML = '<b>Transacciones para cuadrar (simplificadas):</b><br>';
      payments.forEach(p => {
        payDiv.innerHTML += `<b>${p.from.name}</b> paga <b>$${p.amount.toFixed(2)}</b> a <b>${p.to.name}</b><br>`;
      });
      balancesSection.appendChild(payDiv);
    }
  }

  // --- Historial ---
  function renderHistory(filters={}) {
    historyList.innerHTML = '';
    let filtered = expenses;
    if (filters.desc) filtered = filtered.filter(e => e.desc && e.desc.toLowerCase().includes(filters.desc.toLowerCase()));
    if (filters.cat) filtered = filtered.filter(e => e.cat === filters.cat);
    if (filters.start) filtered = filtered.filter(e => e.date && new Date(e.date) >= new Date(filters.start));
    if (filters.end) filtered = filtered.filter(e => e.date && new Date(e.date) <= new Date(filters.end));
    filtered.sort((a,b) => new Date(b.date) - new Date(a.date));
    filtered.forEach(exp => {
      const payer = people.find(p => p.id === exp.payerId);
      const splitList = exp.split.map(s => {
        const p = people.find(p => p.id === s.personId);
        return p ? `<b>${p.name}:</b> $${s.amount.toFixed(2)}` : '';
      }).join(', ');
      const date = exp.date ? new Date(exp.date).toLocaleString() : '';
      const div = document.createElement('div');
      div.className = 'expense';
      div.innerHTML = `
        <span>
          <b>${getIcon(exp.cat)} ${exp.desc ? exp.desc : '(sin descripción)'}</b> (${exp.cat})<br>
          <span style="font-size:0.95em">Pagado por: ${payer ? payer.name : ''}</span><br>
          <span style="font-size:0.9em">Repartido: ${splitList}</span><br>
          <span style="font-size:0.85em">${date}</span>
        </span>
      `;
      historyList.appendChild(div);
    });
  }
  function filterHistory() {
    renderHistory({
      desc: filterDescription.value,
      cat: filterCategory.value,
      start: filterDateStart.value,
      end: filterDateEnd.value
    });
  }
  clearFilterBtn.onclick = () => {
    filterDescription.value = '';
    filterCategory.value = '';
    filterDateStart.value = '';
    filterDateEnd.value = '';
    renderHistory();
  };

  // --- Estadísticas ---
  function renderStats() {
    statsCards.innerHTML = '';
    let catTotals = {};
    expenses.forEach(exp => {
      catTotals[exp.cat] = (catTotals[exp.cat] || 0) + exp.amount;
    });
    let personTotals = {};
    people.forEach(p => personTotals[p.id] = 0);
    expenses.forEach(exp => {
      personTotals[exp.payerId] += exp.amount;
      exp.split.forEach(s => personTotals[s.personId] += s.amount);
    });
    let totalGastos = expenses.reduce((a,e) => a+e.amount, 0);
    let card1 = document.createElement('div');
    card1.className = 'stat-card';
    card1.innerHTML = `<b>Total del viaje:</b><br>$${totalGastos.toFixed(2)}`;
    statsCards.appendChild(card1);
    let card2 = document.createElement('div');
    card2.className = 'stat-card';
    card2.innerHTML = `<b>Total de gastos:</b><br>${expenses.length}`;
    statsCards.appendChild(card2);
    let card3 = document.createElement('div');
    card3.className = 'stat-card';
    card3.innerHTML = `<b>Viajeros:</b><br>${people.length}`;
    statsCards.appendChild(card3);
    if (statsChart) statsChart.destroy();
    // getContext aquí:
    const statsChartCtx = document.getElementById('statsChart').getContext('2d');
    statsChart = new Chart(statsChartCtx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(catTotals),
        datasets: [{
          data: Object.values(catTotals),
          backgroundColor: ['#fbc02d','#1976d2','#43a047','#e53935','#757575']
        }]
      },
      options: { plugins: { legend: { position: 'bottom' } } }
    });
  }

  // --- Utilidades ---
  function getIcon(cat) {
    if (cat === 'Comida') return '<span class="material-icons icon-comida" title="Comida">restaurant</span>';
    if (cat === 'Transporte') return '<span class="material-icons icon-transporte" title="Transporte">directions_car</span>';
    if (cat === 'Alojamiento') return '<span class="material-icons icon-alojamiento" title="Alojamiento">hotel</span>';
    if (cat === 'Entretenimiento') return '<span class="material-icons icon-entretenimiento" title="Entretenimiento">sports_esports</span>';
    return '<span class="material-icons icon-otros" title="Otros">attach_money</span>';
  }
  function saveTripToCloud() {
    trips = trips.map(t => t.id === currentTripId ? {...t, people, expenses} : t);
    saveToCloud();
  }
  function copyLink() {
    const url = window.location.href.split('?')[0] + '?trip=' + currentTripId;
    navigator.clipboard.writeText(url);
    alert('¡Enlace copiado! Comparte este enlace con tus amigos.');
  }
  function openTripMenu() {
    tripHeader.classList.add('open');
  }
  tripCurrent.onclick = openTripMenu;

  // --- Eventos ---
  addPersonBtn.onclick = addPerson;
  personNameInput.addEventListener('keydown', e => { if (e.key === 'Enter') addPerson(); });
  addExpenseBtn.onclick = addExpense;
  expenseAmountInput.addEventListener('keydown', e => { if (e.key === 'Enter') addExpense(); });
  calcBalancesBtn.onclick = renderBalances;
  filterBtn.onclick = filterHistory;
  copyLinkBtn.onclick = copyLink;
  // Filtro por viaje en URL
  const urlParams = new URLSearchParams(window.location.search);
  const tripParam = parseInt(urlParams.get('trip'));
  if (tripParam) currentTripId = tripParam;

  // --- Inicialización ---
  loadFromCloud();
});
