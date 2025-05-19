/* global fetch */

// Inicialização de variáveis globais
let currentDate = new Date(2025, 4, 1); // Definir data inicial como maio de 2025
let allocations = {};
let selectedDaysByMonth = {};
let lastSelectedDay = null;
let iniciativas = [];

// Obter o username da URL
const urlParams = new URLSearchParams(window.location.search);
const currentUser = urlParams.get('username') || 'Convidado';
console.log('Usuário atual obtido da URL:', currentUser);

// Carrega dados de projetos, atividades e iniciativas
function loadInitialData() {
  Promise.all([
    fetch('/data/tripleta.json').then(response => {
      if (!response.ok) throw new Error('Erro ao carregar tripleta.json');
      return response.json();
    }),
    fetch('/data/iniciativas.json').then(response => {
      if (!response.ok) throw new Error('Erro ao carregar iniciativas.json');
      return response.json();
    }),
    fetch('/data/alocacoes.json').then(response => {
      if (!response.ok) throw new Error('Erro ao carregar alocacoes.json');
      return response.json();
    })
  ])
  .then(([tripletaData, iniciativasData, alocacoesData]) => {
    console.log('Dados carregados:', { tripletaData, iniciativasData, alocacoesData });

    // Popula os dropdowns de tipo, projeto e atividade
    const tipoProjetoAtividadeSelect = document.getElementById('tipo-projeto-atividade');
    const projetosSelect = document.getElementById('projeto');
    const atividadesSelect = document.getElementById('atividade');

    // Popula o dropdown de tipo projeto/atividade com valores fixos
    tipoProjetoAtividadeSelect.innerHTML = '<option value="Projeto">Projeto</option><option value="Atividade">Atividade</option>';

    // Popula o dropdown de projetos
    const projetosUnicos = [...new Set(tripletaData.map(item => item.projeto))];
    projetosSelect.innerHTML = '<option>Projeto</option>';
    projetosUnicos.forEach(projeto => {
      if (projeto !== '#NÃO INFORMADO - EXCLUIR') {
        const option = document.createElement('option');
        option.value = projeto;
        option.textContent = projeto;
        projetosSelect.appendChild(option);
      }
    });

    // Atualiza atividades com base no projeto selecionado
    projetosSelect.addEventListener('change', function() {
      const projetoSelecionado = this.value;
      atividadesSelect.innerHTML = '<option>Atividade</option>';
      const atividadesFiltradas = tripletaData.filter(item => item.projeto === projetoSelecionado);
      const atividadesUnicas = [...new Set(atividadesFiltradas.map(item => item.atividade))];
      atividadesUnicas.forEach(atividade => {
        if (atividade !== '#NÃO INFORMADO - EXCLUIR') {
          const option = document.createElement('option');
          option.value = atividade;
          option.textContent = atividade;
          atividadesSelect.appendChild(option);
        }
      });
    });

    // Popula o autocomplete de iniciativas
    iniciativas = iniciativasData;
    const initiativeFieldSelect = document.getElementById('initiative-field');
    const initiativeSearchInput = document.getElementById('initiative-search');
    const initiativeList = document.getElementById('initiative-list');

    function updateInitiativeAutocomplete() {
      const field = initiativeFieldSelect.value;
      const searchValue = initiativeSearchInput.value.toLowerCase();
      initiativeList.innerHTML = '';

      const filteredIniciativas = iniciativas.filter(iniciativa => {
        const fieldValue = iniciativa[field]?.toLowerCase() || '';
        return fieldValue.includes(searchValue);
      });

      filteredIniciativas.forEach(iniciativa => {
        const option = document.createElement('option');
        option.value = iniciativa[field];
        option.textContent = `${iniciativa[field]} (ID: ${iniciativa.id_alocacao})`;
        initiativeList.appendChild(option);
      });
    }

    initiativeFieldSelect.addEventListener('change', updateInitiativeAutocomplete);
    initiativeSearchInput.addEventListener('input', updateInitiativeAutocomplete);
    updateInitiativeAutocomplete(); // Inicializa o autocomplete

    // Carrega alocações iniciais
    alocacoesData.forEach(alocacao => {
      Object.entries(alocacao.meses).forEach(([mes, percentage]) => {
        if (percentage > 0) {
          const mesIndex = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'].indexOf(mes) + 1;
          const daysInMonth = new Date(2025, mesIndex, 0).getDate();
          for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `2025-${String(mesIndex).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayOfWeek = new Date(dateStr).getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclui fins de semana
              if (!allocations[dateStr]) {
                allocations[dateStr] = [];
              }
              const percentagePerDay = percentage / (daysInMonth - 8); // Aproximado, considerando 8 dias de fim de semana
              allocations[dateStr].push({
                percentage: percentagePerDay,
                projeto: alocacao.projeto,
                atividade: alocacao.atividade,
                usuario: alocacao.colaborador,
                id_alocacao: alocacao.id_alocacao,
                tipoProjetoAtividade: 'Projeto' // Valor padrão, ajustado conforme necessidade
              });
            }
          }
        }
      });
    });

    saveAllocations();
    renderCalendar();
  })
  .catch(error => {
    console.error('Erro ao carregar dados iniciais:', error);
    alert('Erro ao carregar dados. Verifique o console.');
  });
}

// Carrega alocações do localStorage ao iniciar
function loadAllocations() {
  const saved = localStorage.getItem('allocations');
  if (saved) {
    allocations = JSON.parse(saved);
    console.log('Alocações carregadas do localStorage:', allocations);
  } else {
    console.log('Nenhuma alocação encontrada no localStorage. Inicializando com dados vazios.');
    allocations = {};
  }
}

// Salva alocações no localStorage
function saveAllocations() {
  console.log('Salvando alocações no localStorage:', allocations);
  localStorage.setItem('allocations', JSON.stringify(allocations));
}

// Renderiza o calendário na tela
function renderCalendar() {
  console.log('Iniciando renderCalendar...');
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  
  // Atualiza o título do calendário
  const calendarTitle = document.getElementById('calendar-title');
  if (!calendarTitle) {
    console.error('Elemento "calendar-title" não encontrado no DOM.');
    return;
  }
  calendarTitle.textContent = `${monthNames[month]} de ${year}`;

  // Renderiza os dias da semana no cabeçalho
  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const header = document.getElementById('calendar-header');
  if (!header) {
    console.error('Elemento "calendar-header" não encontrado no DOM.');
    return;
  }
  header.innerHTML = '';
  daysOfWeek.forEach(day => {
    const div = document.createElement('div');
    div.className = 'day';
    div.textContent = day;
    header.appendChild(div);
  });

  // Calcula os dias do mês e o primeiro dia
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysDiv = document.getElementById('calendar-days');
  if (!daysDiv) {
    console.error('Elemento "calendar-days" não encontrado no DOM.');
    return;
  }
  daysDiv.innerHTML = '';

  // Adiciona espaços vazios antes do primeiro dia do mês
  for (let i = 0; i < firstDay; i++) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'day empty';
    emptyDiv.dataset.date = '';
    daysDiv.appendChild(emptyDiv);
  }

  // Carrega dias selecionados para o mês atual
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const selectedDays = selectedDaysByMonth[monthKey] || new Set();

  // Renderiza os dias do mês
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

    // Verifica se o dia está selecionado
    if (selectedDays.has(dateStr)) {
      dayDiv.classList.add('selected');
    }

    // Verifica se há alocações para o dia
    if (allocations[dateStr]) {
      const totalPercentage = allocations[dateStr].reduce((sum, alloc) => sum + (alloc.percentage || 0), 0);
      dayDiv.dataset.percentage = totalPercentage;
      if (totalPercentage === 100) {
        dayDiv.classList.add('green');
      } else if (totalPercentage < 100) {
        dayDiv.classList.add('yellow');
      } else {
        dayDiv.classList.add('red');
      }

      // Texto resumido dentro da célula
      const summaryText = `${Math.round(totalPercentage)}%`;
      const summary = document.createElement('span');
      summary.className = 'allocation-summary';
      summary.innerHTML = summaryText;
      dayDiv.appendChild(summary);

      // Tooltip com detalhes completos
      const tooltipText = allocations[dateStr].map(alloc => `${Math.round(alloc.percentage)}% ${alloc.projeto}, ${alloc.atividade} (ID: ${alloc.id_alocacao})`).join('\n');
      dayDiv.setAttribute('title', tooltipText);
    }

    // Adiciona evento de clique ao dia
    dayDiv.addEventListener('click', handleDayClick);
    daysDiv.appendChild(dayDiv);
  }

  updateSelection();
  console.log('renderCalendar concluído.');
}

// Navega para o mês anterior
function previousMonth() {
  saveSelections();
  currentDate.setMonth(currentDate.getMonth() - 1);
  console.log('Navegando para o mês anterior:', currentDate);
  renderCalendar();
}

// Navega para o próximo mês
function nextMonth() {
  saveSelections();
  currentDate.setMonth(currentDate.getMonth() + 1);
  console.log('Navegando para o próximo mês:', currentDate);
  renderCalendar();
}

// Salva os dias selecionados para o mês atual
function saveSelections() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const selectedDays = document.querySelectorAll('.calendar-days .day.selected');
  const selectedDates = new Set();
  selectedDays.forEach(day => selectedDates.add(day.dataset.date));
  selectedDaysByMonth[monthKey] = selectedDates;
  console.log('Seleções salvas para o mês:', monthKey, selectedDates);
}

// Lida com o clique em um dia do calendário
function handleDayClick(e) {
  const isShiftPressed = e.shiftKey;
  const isCtrlPressed = e.ctrlKey;
  const day = e.target.closest('.day'); // Garante que o clique seja no elemento .day
  if (!day || day.classList.contains('empty')) return;

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

// Atualiza a seleção de dias e os campos de data
function updateSelection() {
  const selectedDays = document.querySelectorAll('.calendar-days .day.selected');
  const counter = document.getElementById('counter');
  if (!counter) {
    console.error('Elemento "counter" não encontrado no DOM.');
    return;
  }
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
  console.log('Seleção atualizada. Dias selecionados:', selectedDays.length);
}

// Realiza a alocação de horas
function alocar() {
  const tipoProjetoAtividade = document.getElementById('tipo-projeto-atividade').value;
  const projeto = document.getElementById('projeto').value;
  const atividade = document.getElementById('atividade').value;
  const dataInicio = document.getElementById('data-inicio').value;
  const dataFim = document.getElementById('data-fim').value;
  const quantidade = parseFloat(document.getElementById('quantidade').value);
  const metrica = document.getElementById('metrica').value;
  const initiativeField = document.getElementById('initiative-field').value;
  const initiativeSearch = document.getElementById('initiative-search').value;

  console.log('Iniciando alocação:', { tipoProjetoAtividade, projeto, atividade, dataInicio, dataFim, quantidade, metrica, initiativeField, initiativeSearch });

  // Validação dos campos obrigatórios
  if (!tipoProjetoAtividade || projeto === 'Projeto' || atividade === 'Atividade' || !dataInicio || !dataFim || isNaN(quantidade) || !initiativeSearch) {
    console.log('Campos obrigatórios não preenchidos para alocação.');
    alert('Preencha todos os campos corretamente, incluindo a iniciativa.');
    return;
  }

  // Validação da iniciativa
  const iniciativaSelecionada = iniciativas.find(iniciativa => iniciativa[initiativeField]?.toLowerCase() === initiativeSearch.toLowerCase());
  if (!iniciativaSelecionada) {
    alert('Iniciativa não encontrada. Por favor, selecione uma iniciativa válida.');
    return;
  }

  const inicioIniciativa = new Date(iniciativaSelecionada.data_inicio);
  const fimIniciativa = new Date(iniciativaSelecionada.data_fim);
  const inicioAlocacao = new Date(dataInicio);
  const fimAlocacao = new Date(dataFim);

  if (inicioAlocacao < inicioIniciativa || fimAlocacao > fimIniciativa) {
    alert('A data de alocação está fora do período permitido pela iniciativa.');
    return;
  }

  const businessDays = [];
  let current = new Date(inicioAlocacao);

  while (current <= fimAlocacao) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclui fins de semana
      businessDays.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  if (businessDays.length === 0) {
    console.log('Nenhum dia útil encontrado no período selecionado.');
    alert('Nenhum dia útil encontrado no período selecionado.');
    return;
  }

  let allocationPerDay;
  if (metrica === 'horas/mês') {
    allocationPerDay = (quantidade / businessDays.length) / 8 * 100;
  } else {
    allocationPerDay = quantidade / businessDays.length; // Distribuir a porcentagem igualmente entre os dias úteis
  }

  businessDays.forEach(day => {
    const dateStr = day.toISOString().split('T')[0];
    if (!allocations[dateStr]) {
      allocations[dateStr] = [];
    }
    allocations[dateStr].push({
      percentage: allocationPerDay,
      projeto: projeto,
      atividade: atividade,
      usuario: currentUser,
      tipoProjetoAtividade: tipoProjetoAtividade,
      id_alocacao: iniciativaSelecionada.id_alocacao
    });
  });

  saveAllocations();
  renderCalendar();
  console.log('Alocação concluída para os dias:', businessDays);
}

// Realiza a desalocação de horas
function desalocar() {
  const selectedDays = document.querySelectorAll('.calendar-days .day.selected');
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  console.log('Iniciando desalocação...');
  console.log('Dias selecionados:', selectedDays.length);

  if (selectedDays.length > 0) {
    // Desalocar apenas os dias selecionados
    selectedDays.forEach(day => {
      const dateStr = day.dataset.date;
      if (allocations[dateStr]) {
        console.log('Desalocando dia:', dateStr);
        delete allocations[dateStr];
      }
    });
  } else {
    // Desalocar todo o mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (allocations[dateStr]) {
        console.log('Desalocando dia do mês:', dateStr);
        delete allocations[dateStr];
      }
    }
  }

  saveAllocations();
  renderCalendar();
  console.log('Desalocação concluída.');
}

// Carrega os dados ao iniciar a página
document.addEventListener('DOMContentLoaded', loadInitialData);