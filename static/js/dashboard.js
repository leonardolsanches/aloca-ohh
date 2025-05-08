let currentDate = new Date();
let allocations = {};

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  document.getElementById('calendar-title').textContent = `${monthNames[month]} de ${year}`;

  // Renderizar cabeçalho
  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const header = document.getElementById('calendar-header');
  header.innerHTML = '';
  daysOfWeek.forEach(day => {
    const div = document.createElement('div');
    div.className = 'day';
    div.textContent = day;
    header.appendChild(div);
  });

  // Renderizar dias
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysDiv = document.getElementById('calendar-days');
  daysDiv.innerHTML = '';

  // Espaços vazios antes do primeiro dia
  for (let i = 0; i < firstDay; i++) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'day empty';
    emptyDiv.dataset.date = '';
    daysDiv.appendChild(emptyDiv);
  }

  // Renderizar dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day';
    dayDiv.dataset.date = dateStr;
    dayDiv.textContent = day;

    // Aplicar alocações existentes
    if (allocations[dateStr]) {
      const percentage = allocations[dateStr];
      dayDiv.dataset.percentage = percentage;
      if (percentage === 100) {
        dayDiv.classList.add('green');
      } else if (percentage < 100) {
        dayDiv.classList.add('yellow');
      } else {
        dayDiv.classList.add('red');
      }
    }

    // Adicionar evento de clique para seleção
    dayDiv.addEventListener('click', handleDayClick);
    daysDiv.appendChild(dayDiv);
  }

  updateSelection();
}

function previousMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
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
  document.getElementById('counter').textContent = selectedDays.length;

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

function aplicarAlocacao() {
  const tipoProjetoAtividade = document.getElementById('tipo-projeto-atividade').value;
  const projeto = document.getElementById('projeto').value;
  const atividade = document.getElementById('atividade').value;
  const dataInicio = document.getElementById('data-inicio').value;
  const dataFim = document.getElementById('data-fim').value;
  const quantidade = parseFloat(document.getElementById('quantidade').value);
  const metrica = document.getElementById('metrica').value;

  // Validação
  if (!tipoProjetoAtividade || !projeto || !atividade || !dataInicio || !dataFim || isNaN(quantidade)) {
    alert('Preencha todos os campos corretamente.');
    return;
  }

  // Determinar dias úteis no período
  const startDate = new Date(dataInicio);
  const endDate = new Date(dataFim);
  const businessDays = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclui sábado e domingo
      businessDays.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  if (businessDays.length === 0) {
    alert('Nenhum dia útil encontrado no período selecionado.');
    return;
  }

  // Calcular alocação por dia
  let allocationPerDay;
  if (metrica === 'horas/mês') {
    allocationPerDay = (quantidade / businessDays.length) / 8 * 100; // Considera 8h/dia como 100%
  } else {
    allocationPerDay = 100 / businessDays.length; // Distribui 100% entre os dias úteis
  }

  // Aplicar alocações
  allocations = {};
  businessDays.forEach(day => {
    const dateStr = day.toISOString().split('T')[0];
    allocations[dateStr] = allocationPerDay;
  });

  renderCalendar();
}

// Inicializar o calendário
renderCalendar();
