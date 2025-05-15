/* global fetch */

// Inicialização de variáveis globais
let currentDate = new Date();
let allocations = {};
let selectedDaysByMonth = {};
let lastSelectedDay = null;

// Obter o username da URL
const urlParams = new URLSearchParams(window.location.search);
const currentUser = urlParams.get('username') || 'Convidado';
console.log('Usuário atual obtido da URL:', currentUser);

// Carrega dados de projetos e atividades do arquivo projetos.json
console.log('Carregando projetos.json para popular projetos e atividades...');
fetch('/data/projetos.json')
  .then(response => {
    console.log('Resposta do fetch para projetos.json:', response);
    if (!response.ok) {
      throw new Error('Erro ao carregar projetos.json: ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    console.log('Dados carregados de projetos.json:', data);
    const projetosSelect = document.getElementById('projeto');
    const atividadesSelect = document.getElementById('atividade');
    projetosSelect.innerHTML = '<option>Projeto</option>';
    atividadesSelect.innerHTML = '<option>Atividade</option>';

    // Popula dropdown de projetos
    data.Projetos.forEach(projeto => {
      if (projeto !== '#NÃO INFORMADO - EXCLUIR') { // Ignora valores inválidos
        const option = document.createElement('option');
        option.value = projeto;
        option.textContent = projeto;
        projetosSelect.appendChild(option);
      }
    });

    // Popula dropdown de atividades
    data.Atividades.forEach(atividade => {
      if (atividade !== '#NÃO INFORMADO - EXCLUIR') { // Ignora valores inválidos
        const option = document.createElement('option');
        option.value = atividade;
        option.textContent = atividade;
        atividadesSelect.appendChild(option);
      }
    });

    // Carrega alocações existentes do localStorage
    loadAllocations();
    console.log('Chamando renderCalendar para renderizar o calendário...');
    renderCalendar();
  })
  .catch(error => {
    console.error('Erro ao carregar projetos.json:', error);
    alert('Erro ao carregar dados de projetos e atividades. Verifique o console.');
  });

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

  // Carrega dias selecionados para o mês
