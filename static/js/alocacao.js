/* global fetch */

let gestores = [];
let data = [];
let hierarchy = ['Projeto', 'Colaborador', 'Atividade'];
let hierarchyOptions = [
    { display: 'Atividade > Colaborador > Projeto', value: ['Atividade', 'Colaborador', 'Projeto'] },
    { display: 'Atividade > Projeto > Colaborador', value: ['Atividade', 'Projeto', 'Colaborador'] },
    { display: 'Colaborador > Atividade > Projeto', value: ['Colaborador', 'Atividade', 'Projeto'] },
    { display: 'Colaborador > Projeto > Atividade', value: ['Colaborador', 'Projeto', 'Atividade'] },
    { display: 'Projeto > Atividade > Colaborador', value: ['Projeto', 'Atividade', 'Colaborador'] },
    { display: 'Projeto > Colaborador > Atividade', value: ['Projeto', 'Colaborador', 'Atividade'] }
];
let currentJustificativaTarget = null;
let usuarios = {};
let lastSelectedCell = null;
let selectedCells = new Set();

// Obter o username da URL
const urlParams = new URLSearchParams(window.location.search);
const currentUser = urlParams.get('username') || 'Convidado';
console.log('Usuário atual obtido da URL:', currentUser);

// Carrega alocações do localStorage e dos dados fornecidos
function loadDataFromLocalStorage() {
  const savedAllocations = localStorage.getItem('allocations');
  const allocations = savedAllocations ? JSON.parse(savedAllocations) : {};
  console.log('Alocações carregadas do localStorage:', allocations);

  const groupedData = [];

  Object.keys(allocations).forEach(date => {
    const entries = allocations[date] || [];
    entries.forEach(entry => {
      const colaborador = entry.usuario || currentUser;
      const projeto = entry.projeto || "Projeto Desconhecido";
      const atividade = entry.atividade || "Atividade Desconhecida";
      const percentage = entry.percentage || 0;

      let colaboradorEntry = groupedData.find(item => item.Colaborador === colaborador && item.Projeto === projeto && item.Atividade === atividade);
      if (!colaboradorEntry) {
        colaboradorEntry = {
          Colaborador: colaborador,
          Projeto: projeto,
          Atividade: atividade,
          alocacoes: {}
        };
        groupedData.push(colaboradorEntry);
      }

      const monthKey = date.slice(0, 7);
      if (!colaboradorEntry.alocacoes[monthKey]) {
        colaboradorEntry.alocacoes[monthKey] = [];
      }
      colaboradorEntry.alocacoes[monthKey].push({
        percentage: percentage,
        projeto: projeto,
        atividade: atividade,
        status: 'pendente',
        justificativa: ''
      });
    });
  });

  return groupedData;
}

// Carrega dados de gestores e usuários
console.log('Carregando usuarios.json para preencher filtros...');
fetch('/static/usuarios.json')
  .then(response => {
    console.log('Resposta do fetch para usuarios.json:', response);
    if (!response.ok) {
      throw new Error('Erro ao carregar usuarios.json: ' + response.statusText);
    }
    return response.json();
  })
  .then(json => {
    usuarios = json;
    gestores = json.Gestor || [];
    const gestorSelect = document.getElementById('gestor');
    gestorSelect.innerHTML = '<option>Gestor</option>';
    gestores.forEach(gestor => {
      if (gestor !== 'GESTOR À IDENTIFICAR' && gestor !== 'CAUSA RAIZ' && gestor !== 'SUPORTE N3' && gestor !== 'PROJETO ESTRATEGICO') {
        const option = document.createElement('option');
        option.value = gestor;
        option.textContent = gestor;
        gestorSelect.appendChild(option);
      }
    });

    let localData = loadDataFromLocalStorage();
    console.log('Dados processados do localStorage:', localData);

    // Estrutura de dados a partir de Dados.xlsx (simulada aqui com base no contexto)
    const rawData = [
      // Dados extraídos de Dados.xlsx (segunda seção)
      {
        Colaborador: "VAGA (SILVANA MARIA OTTO DORIA)",
        Projeto: "CAUSA RAIZ",
        Atividade: "#NÃO INFORMADO - EXCLUIR",
        alocacoes: {
          "2025-01": [{ percentage: 0.5, projeto: "CAUSA RAIZ", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-02": [{ percentage: 0.5, projeto: "CAUSA RAIZ", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-03": [{ percentage: 0.5, projeto: "CAUSA RAIZ", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-04": [{ percentage: 0.5, projeto: "CAUSA RAIZ", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-05": [{ percentage: 0.5, projeto: "CAUSA RAIZ", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-06": [{ percentage: 0.5, projeto: "CAUSA RAIZ", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-07": [{ percentage: 0.5, projeto: "CAUSA RAIZ", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-08": [{ percentage: 0.5, projeto: "CAUSA RAIZ", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-09": [{ percentage: 0.5, projeto: "CAUSA RAIZ", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-10": [{ percentage: 0.5, projeto: "CAUSA RAIZ", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-11": [{ percentage: 0.5, projeto: "CAUSA RAIZ", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-12": [{ percentage: 0.5, projeto: "CAUSA RAIZ", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }]
        }
      },
      {
        Colaborador: "VAGA (SILVANA MARIA OTTO DORIA)",
        Projeto: "SUPORTE N3",
        Atividade: "#NÃO INFORMADO - EXCLUIR",
        alocacoes: {
          "2025-01": [{ percentage: 0.5, projeto: "SUPORTE N3", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-02": [{ percentage: 0.5, projeto: "SUPORTE N3", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-03": [{ percentage: 0.5, projeto: "SUPORTE N3", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-04": [{ percentage: 0.5, projeto: "SUPORTE N3", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-05": [{ percentage: 0.5, projeto: "SUPORTE N3", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-06": [{ percentage: 0.5, projeto: "SUPORTE N3", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-07": [{ percentage: 0.5, projeto: "SUPORTE N3", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-08": [{ percentage: 0.5, projeto: "SUPORTE N3", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-09": [{ percentage: 0.5, projeto: "SUPORTE N3", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-10": [{ percentage: 0.5, projeto: "SUPORTE N3", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-11": [{ percentage: 0.5, projeto: "SUPORTE N3", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }],
          "2025-12": [{ percentage: 0.5, projeto: "SUPORTE N3", atividade: "#NÃO INFORMADO - EXCLUIR", status: 'pendente', justificativa: '' }]
        }
      },
      {
        Colaborador: "VAGNER DE CARVALHO BRANDAO",
        Projeto: "CAUSA RAIZ",
        Atividade: "LIDERANÇA TÉCNICA",
        alocacoes: {
          "2025-01": [{ percentage: 0.5, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-02": [{ percentage: 0.5, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-03": [{ percentage: 0.5, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-04": [{ percentage: 0.5, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-05": [{ percentage: 0.6, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-06": [{ percentage: 0.6, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-07": [{ percentage: 0.5, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-08": [{ percentage: 0.4, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-09": [{ percentage: 0.4, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-10": [{ percentage: 0.4, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-11": [{ percentage: 0.4, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-12": [{ percentage: 0.4, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }]
        }
      },
      {
        Colaborador: "VAGNER FUMES VIEIRA",
        Projeto: "PROJETO SOLAR",
        Atividade: "LIDERANÇA TÉCNICA",
        alocacoes: {
          "2025-01": [{ percentage: 1, projeto: "PROJETO SOLAR", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-02": [{ percentage: 1, projeto: "PROJETO SOLAR", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-03": [{ percentage: 1, projeto: "PROJETO SOLAR", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-04": [{ percentage: 1, projeto: "PROJETO SOLAR", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-05": [{ percentage: 1, projeto: "PROJETO SOLAR", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-06": [{ percentage: 1, projeto: "PROJETO SOLAR", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-07": [{ percentage: 1, projeto: "PROJETO SOLAR", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-08": [{ percentage: 1, projeto: "PROJETO SOLAR", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-09": [{ percentage: 1, projeto: "PROJETO SOLAR", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-10": [{ percentage: 1, projeto: "PROJETO SOLAR", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-11": [{ percentage: 1, projeto: "PROJETO SOLAR", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-12": [{ percentage: 1, projeto: "PROJETO SOLAR", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }]
        }
      },
      {
        Colaborador: "VALERIA GONCALVES FERREIRA DA SILVA",
        Projeto: "CAUSA RAIZ",
        Atividade: "LIDERANÇA TÉCNICA",
        alocacoes: {
          "2025-01": [{ percentage: 0.2, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-02": [{ percentage: 0.2, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-03": [{ percentage: 0.2, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-04": [{ percentage: 0.2, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-05": [{ percentage: 0.5, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-06": [{ percentage: 0.3, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-07": [{ percentage: 0.3, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-08": [{ percentage: 0.3, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-09": [{ percentage: 0.3, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-10": [{ percentage: 0.3, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-11": [{ percentage: 0.3, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }],
          "2025-12": [{ percentage: 0.3, projeto: "CAUSA RAIZ", atividade: "LIDERANÇA TÉCNICA", status: 'pendente', justificativa: '' }]
        }
      }
      // Outros registros podem ser adicionados aqui conforme necessário...
    ];

    // Filtra entradas inválidas e combina com dados do localStorage
    data = [...localData, ...rawData.filter(item => item.Projeto !== '#NÃO INFORMADO - EXCLUIR' && item.Atividade !== '#NÃO INFORMADO - EXCLUIR')];
    console.log('Dados combinados para a tela de aprovação:', data);

    // Popula o seletor de hierarquia
    const hierarchySelect = document.getElementById('hierarchy-select');
    hierarchyOptions.forEach((option, index) => {
      const opt = document.createElement('option');
      opt.value = index;
      opt.textContent = option.display;
      hierarchySelect.appendChild(opt);
    });

    renderTable();
    updateAutocomplete();
  })
  .catch(error => {
    console.error('Erro ao carregar usuarios.json:', error);
    alert('Erro ao carregar dados. Verifique o console.');
  });

// Atualiza o autocomplete com base nos filtros
function updateAutocomplete() {
  const gestor = document.getElementById('gestor').value;
  const perfil = document.getElementById('perfil').value;
  const buscaList = document.getElementById('busca-list');
  buscaList.innerHTML = '';

  let filteredUsers = [];
  if (gestor !== 'Gestor' && perfil) {
    filteredUsers = data.filter(item => item.Colaborador === gestor || usuarios[perfil].includes(item.Colaborador)).map(item => item.Colaborador);
  } else if (perfil) {
    filteredUsers = usuarios[perfil];
  } else if (gestor !== 'Gestor') {
    filteredUsers = data.filter(item => item.Colaborador === gestor).map(item => item.Colaborador);
  } else {
    filteredUsers = [...new Set(data.map(item => item.Colaborador))];
  }

  filteredUsers.forEach(user => {
    const option = document.createElement('option');
    option.value = user;
    buscaList.appendChild(option);
  });
  console.log('Autocomplete atualizado:', filteredUsers);
}

// Carrega aprovações salvas do localStorage
function loadApprovals() {
  const saved = localStorage.getItem('approvals');
  if (saved) {
    const approvals = JSON.parse(saved);
    console
