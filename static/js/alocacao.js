let currentDate = new Date();
let allocations = {};
let selectedDaysByMonth = {};

// Carrega alocações do localStorage ao iniciar
function loadAllocations() {
  const saved = localStorage.getItem('allocations');
  if (saved) {
    allocations = JSON.parse(saved);
  }
}

// Salva alocações no localStorage
function saveAllocations() {
  localStorage.setItem('allocations', JSON.stringify(allocations));
}

// Carrega dados de projetos e atividades
fetch('/static/usuarios.json')
  .then(response => response.json())
  .then(data => {
    const projetosSelect = document.getElementById('projeto');
    const atividadesSelect = document.getElementById('atividade');
    projetosSelect.innerHTML = '<option>Projeto</option>';
    atividadesSelect.innerHTML = '<option>Atividade</option>';
    data.Projetos.forEach(projeto => {
      const option = document.createElement('option');
      option.value = projeto;
      option.textContent = projeto;
      projetosSelect.appendChild(option);
    });
    data.Atividades.forEach(atividade => {
      const option = document.createElement('option');
      option.value = atividade;
      option.textContent = atividade;
      atividadesSelect.appendChild(option);
    });
    loadAllocations();
    renderCalendar();
  })
  .catch(error => console.error('Erro ao carregar usuarios.json:', error));

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  document.getElementById('calendar-title').textContent = `${monthNames[month]} de ${year}`;

  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const header = document.getElementById('calendar-header');
  header.innerHTML = '';
  daysOfWeek.forEach(day => {
    const div = document.createElement('div');
    div.className = 'day';
    div.textContent = day;
    header.appendChild(div);
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysDiv = document.getElementById('calendar-days');
  daysDiv.innerHTML = '';

  for (let i = 0; i < firstDay; i++) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'day empty';
    emptyDiv.dataset.date = '';
    daysDiv.appendChild(emptyDiv);
  }

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const selectedDays = selectedDaysByMonth[monthKey] || new Set();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day';
    dayDiv.dataset.date = dateStr;

    // Adiciona o número do dia
    const dayNumber = document.createElement('span');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayDiv.appendChild(dayNumber);

    if (selectedDays.has(dateStr)) {
      dayDiv.classList.add('selected');
    }

    if (allocations[dateStr]) {
      const totalPercentage = allocations[dateStr].reduce((sum, alloc) => sum + alloc.percentage, 0);
      dayDiv.dataset.percentage = totalPercentage;
      if (totalPercentage === 100) {
        dayDiv.classList.add('green');
      } else if (totalPercentage < 100) {
        dayDiv.classList.add('yellow');
      } else {
        dayDiv.classList.add('red');
      }

      // Texto resumido dentro da célula
      const summaryText = allocations[dateStr].map(alloc => `${alloc.percentage}% ${alloc.projeto}`).join('<br>');
      const summary = document.createElement('span');
      summary.className = 'allocation-summary';
      summary.innerHTML = summaryText;
      dayDiv.appendChild(summary);

      // Tooltip com detalhes completos
      const tooltipText = allocations[dateStr].map(alloc => `${alloc.percentage}% ${alloc.projeto}, ${alloc.atividade}`).join('\n');
      dayDiv.setAttribute('title', tooltipText);
    }

    dayDiv.addEventListener('click', handleDayClick);
    daysDiv.appendChild(dayDiv);
  }

  updateSelection();
}

function previousMonth() {
  saveSelections();
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  saveSelections();
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}

function saveSelections() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const selectedDays = document.querySelectorAll('.calendar-days .day.selected');
  const selectedDates = new Set();
  selectedDays.forEach(day => selectedDates.add(day.dataset.date));
  selectedDaysByMonth[monthKey] = selectedDates;
}

function handleDayClick(e) {
  const isShiftPressed = e.shiftKey;
  const isCtrlPressed = e.ctrlKey;
  const day = e.target;
  const days = document.querySelectorAll('.calendar-days .day:not(.empty)');

  if (!isShiftPressed && !isCtrlPressed) {
    days.forEach(d => d.classList.remove('selected'));
    day.classList.add('selected');
    lastSelectedDay = day;
  } else if (isCtrlPressed) {
    day.classList.toggle('selected');
    lastSelectedDay = day;
  } else if (isShiftPressed && lastSelectedDay) {
    const allDays = Array.from(days);
    const startIndex = allDays.indexOf(lastSelectedDay);
    const endIndex = allDays.indexOf(day);
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);

    days.forEach(d => {
      if (!d.classList.contains('selected')) {
        d.classList.remove('selected');
      }
    });

    for (let i = minIndex; i <= maxIndex; i++) {
      allDays[i].classList.add('selected');
    }
  }

  updateSelection();
}

function updateSelection() {
  const selectedDays = document.querySelectorAll('.calendar-days .day.selected');
  const counter = document.getElementById('counter');
  counter.textContent = `${selectedDays.length} dias selecionados`;

  if (selectedDays.length > 0) {
    const dates = Array.from(selectedDays)
      .map(day => new Date(day.getAttribute('data-date')))
      .filter(date => !isNaN(date));
    
    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      document.getElementById('data-inicio').value = minDate.toISOString().split('T')[0];
      document.getElementById('data-fim').value = maxDate.toISOString().split('T')[0];
    } else {
      document.getElementById('data-inicio').value = '';
      document.getElementById('data-fim').value = '';
    }
  } else {
    document.getElementById('data-inicio').value = '';
    document.getElementById('data-fim').value = '';
  }
}

function alocar() {
  const tipoProjetoAtividade = document.getElementById('tipo-projeto-atividade').value;
  const projeto = document.getElementById('projeto').value;
  const atividade = document.getElementById('atividade').value;
  const dataInicio = document.getElementById('data-inicio').value;
  const dataFim = document.getElementById('data-fim').value;
  const quantidade = parseFloat(document.getElementById('quantidade').value);
  const metrica = document.getElementById('metrica').value;

  if (!tipoProjetoAtividade || !projeto || !atividade || !dataInicio || !dataFim || isNaN(quantidade)) {
    alert('Preencha todos os campos corretamente.');
    return;
  }

  const startDate = new Date(dataInicio);
  const endDate = new Date(dataFim);
  const businessDays = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  if (businessDays.length === 0) {
    alert('Nenhum dia útil encontrado no período selecionado.');
    return;
  }

  let allocationPerDay;
  if (metrica === 'horas/mês') {
    allocationPerDay = (quantidade / businessDays.length) / 8 * 100;
  } else {
    allocationPerDay = 100 / businessDays.length;
  }

  businessDays.forEach(day => {
    const dateStr = day.toISOString().split('T')[0];
    if (!allocations[dateStr]) {
      allocations[dateStr] = [];
    }
    allocations[dateStr].push({
      percentage: allocationPerDay,
      projeto: projeto,
      atividade: atividade
    });
  });

  saveAllocations();
  renderCalendar();
}