let gestores = [];
let data = [];
let hierarchy = ['Colaborador', 'Projeto', 'Atividade'];
let currentJustificativaTarget = null;

// Dados simulados (mock)
const mockData = [
  {
    Colaborador: "João Silva",
    Projeto: "Projeto A",
    Atividade: "Atividade 1",
    alocacoes: {
      '2025-01': { percentage: 92, status: 'pendente', justificativa: '' },
      '2025-02': { percentage: 85, status: 'pendente', justificativa: '' },
      '2025-03': { percentage: 110, status: 'pendente', justificativa: '' },
      '2025-04': { percentage: 70, status: 'pendente', justificativa: '' },
      '2025-05': { percentage: 100, status: 'pendente', justificativa: '' },
      '2025-06': { percentage: 95, status: 'pendente', justificativa: '' },
      '2025-07': { percentage: 80, status: 'pendente', justificativa: '' },
      '2025-08': { percentage: 120, status: 'pendente', justificativa: '' },
      '2025-09': { percentage: 60, status: 'pendente', justificativa: '' },
      '2025-10': { percentage: 90, status: 'pendente', justificativa: '' },
      '2025-11': { percentage: 105, status: 'pendente', justificativa: '' },
      '2025-12': { percentage: 88, status: 'pendente', justificativa: '' }
    }
  },
  {
    Colaborador: "Maria Oliveira",
    Projeto: "Projeto B",
    Atividade: "Atividade 2",
    alocacoes: {
      '2025-01': { percentage: 80, status: 'pendente', justificativa: '' },
      '2025-02': { percentage: 90, status: 'pendente', justificativa: '' },
      '2025-03': { percentage: 100, status: 'pendente', justificativa: '' },
      '2025-04': { percentage: 95, status: 'pendente', justificativa: '' },
      '2025-05': { percentage: 85, status: 'pendente', justificativa: '' },
      '2025-06': { percentage: 110, status: 'pendente', justificativa: '' },
      '2025-07': { percentage: 70, status: 'pendente', justificativa: '' },
      '2025-08': { percentage: 120, status: 'pendente', justificativa: '' },
      '2025-09': { percentage: 65, status: 'pendente', justificativa: '' },
      '2025-10': { percentage: 90, status: 'pendente', justificativa: '' },
      '2025-11': { percentage: 100, status: 'pendente', justificativa: '' },
      '2025-12': { percentage: 88, status: 'pendente', justificativa: '' }
    }
  }
];

// Carrega dados de gestores
fetch('/static/usuarios.json')
  .then(response => response.json())
  .then(json => {
    gestores = json.Gestor;
    const gestorSelect = document.getElementById('gestor');
    gestorSelect.innerHTML = '<option>Gestor</option>';
    gestores.forEach(gestor => {
      const option = document.createElement('option');
      option.value = gestor;
      option.textContent = gestor;
      gestorSelect.appendChild(option);
    });
    data = mockData;
    renderTable();
  })
  .catch(error => console.error('Erro ao carregar usuarios.json:', error));

// Carrega aprovações salvas do localStorage
function loadApprovals() {
  const saved = localStorage.getItem('approvals');
  if (saved) {
    const approvals = JSON.parse(saved);
    data.forEach(item => {
      Object.keys(item.alocacoes).forEach(month => {
        const key = `${item.Colaborador}-${item.Projeto}-${item.Atividade}-${month}`;
        if (approvals[key]) {
          item.alocacoes[month].status = approvals[key].status;
          item.alocacoes[month].justificativa = approvals[key].justificativa;
        }
      });
    });
  }
}

function saveApprovals() {
  const approvals = {};
  data.forEach(item => {
    Object.keys(item.alocacoes).forEach(month => {
      const key = `${item.Colaborador}-${item.Projeto}-${item.Atividade}-${month}`;
      approvals[key] = {
        status: item.alocacoes[month].status,
        justificativa: item.alocacoes[month].justificativa
      };
    });
  });
  localStorage.setItem('approvals', JSON.stringify(approvals));
}

function renderTable() {
  loadApprovals();
  const tbody = document.getElementById('approval-table-body');
  tbody.innerHTML = '';
  const groupedData = groupData(data);

  function renderRows(items, level = 0, parentKey = '') {
    items.forEach((item, index) => {
      const key = parentKey ? `${parentKey}-${index}` : `${index}`;
      const row = document.createElement('tr');
      row.className = `level-${level}`;
      row.dataset.key = key;

      const expandCell = document.createElement('td');
      const expandBtn = document.createElement('button');
      expandBtn.className = 'expand-btn';
      expandBtn.textContent = '+';
      expandBtn.onclick = () => toggleExpand(key);
      expandCell.appendChild(expandBtn);
      row.appendChild(expandCell);

      const itemCell = document.createElement('td');
      itemCell.textContent = item.name;
      row.appendChild(itemCell);

      // Colunas dos meses
      for (let month = 1; month <= 12; month++) {
        const monthKey = `2025-${String(month).padStart(2, '0')}`;
        const cell = document.createElement('td');
        if (item.alocacoes && item.alocacoes[monthKey]) {
          const alloc = item.alocacoes[monthKey];
          const statusClass = alloc.status === 'aprovado' ? 'approved' : alloc.status === 'reprovado' ? 'rejected' : 'pending';
          cell.className = statusClass;
          cell.innerHTML = `${alloc.percentage}% <br>`;
          const approveBtn = document.createElement('button');
          approveBtn.className = 'action-btn approve';
          approveBtn.textContent = '✅';
          approveBtn.onclick = () => approve(item, monthKey);
          cell.appendChild(approveBtn);
          const rejectBtn = document.createElement('button');
          rejectBtn.className = 'action-btn reject';
          rejectBtn.textContent = '❌';
          rejectBtn.onclick = () => openJustificativaModal(item, monthKey);
          cell.appendChild(rejectBtn);
          if (alloc.justificativa) {
            const editBtn = document.createElement('button');
            editBtn.className = 'action-btn edit';
            editBtn.textContent = '✎';
            editBtn.onclick = () => editJustificativa(item, monthKey);
            cell.appendChild(editBtn);
          }
        }
        row.appendChild(cell);
      }

      const actionsCell = document.createElement('td');
      const rejectAllBtn = document.createElement('button');
      rejectAllBtn.className = 'action-btn reject-all';
      rejectAllBtn.textContent = 'Reprovar Todos';
      rejectAllBtn.onclick = () => openJustificativaModal(item, 'all');
      actionsCell.appendChild(rejectAllBtn);
      row.appendChild(actionsCell);

      tbody.appendChild(row);

      if (item.children) {
        const childRow = document.createElement('tr');
        childRow.className = `children level-${level + 1}`;
        childRow.id = `children-${key}`;
        childRow.style.display = 'none';
        const childCell = document.createElement('td');
        childCell.colSpan = 15;
        childRow.appendChild(childCell);
        tbody.appendChild(childRow);
        renderRows(item.children, level + 1, key);
      }
    });
  }

  renderRows(groupedData);
}

function groupData(data) {
  const grouped = {};

  data.forEach(item => {
    let currentLevel = grouped;
    hierarchy.forEach(level => {
      const key = item[level];
      if (!currentLevel[key]) {
        currentLevel[key] = { name: key, children: {}, alocacoes: level === hierarchy[hierarchy.length - 1] ? item.alocacoes : null };
      }
      currentLevel = currentLevel[key].children;
    });
  });

  function convertToArray(obj) {
    return Object.keys(obj).map(key => ({
      name: key,
      alocacoes: obj[key].alocacoes,
      children: Object.keys(obj[key].children).length ? convertToArray(obj[key].children) : null
    }));
  }

  return convertToArray(grouped);
}

function toggleExpand(key) {
  const childrenRow = document.getElementById(`children-${key}`);
  const btn = document.querySelector(`tr[data-key="${key}"] .expand-btn`);
  if (childrenRow.style.display === 'none') {
    childrenRow.style.display = 'table-row';
    btn.textContent = '-';
  } else {
    childrenRow.style.display = 'none';
    btn.textContent = '+';
  }
}

function approve(item, monthKey) {
  if (monthKey === 'all') {
    Object.keys(item.alocacoes).forEach(key => {
      item.alocacoes[key].status = 'aprovado';
      item.alocacoes[key].justificativa = '';
    });
  } else {
    item.alocacoes[monthKey].status = 'aprovado';
    item.alocacoes[monthKey].justificativa = '';
  }
  saveApprovals();
  renderTable();
}

function openJustificativaModal(item, monthKey) {
  currentJustificativaTarget = { item, monthKey };
  const modal = document.getElementById('justificativa-modal');
  const textArea = document.getElementById('justificativa-text');
  textArea.value = monthKey !== 'all' && item.alocacoes[monthKey].justificativa ? item.alocacoes[monthKey].justificativa : '';
  modal.style.display = 'block';
}

function editJustificativa(item, monthKey) {
  openJustificativaModal(item, monthKey);
}

function submitJustificativa() {
  const textArea = document.getElementById('justificativa-text');
  const justificativa = textArea.value.trim();
  if (!justificativa) {
    alert('A justificativa é obrigatória.');
    return;
  }

  const { item, monthKey } = currentJustificativaTarget;
  if (monthKey === 'all') {
    Object.keys(item.alocacoes).forEach(key => {
      item.alocacoes[key].status = 'reprovado';
      item.alocacoes[key].justificativa = justificativa;
    });
  } else {
    item.alocacoes[monthKey].status = 'reprovado';
    item.alocacoes[monthKey].justificativa = justificativa;
  }
  saveApprovals();
  closeModal();
  renderTable();
}

function closeModal() {
  const modal = document.getElementById('justificativa-modal');
  modal.style.display = 'none';
  currentJustificativaTarget = null;
}

function moveUp(index) {
  if (index > 0) {
    [hierarchy[index - 1], hierarchy[index]] = [hierarchy[index], hierarchy[index - 1]];
    updateHierarchyDisplay();
    renderTable();
  }
}

function moveDown(index) {
  if (index < hierarchy.length - 1) {
    [hierarchy[index], hierarchy[index + 1]] = [hierarchy[index + 1], hierarchy[index]];
    updateHierarchyDisplay();
    renderTable();
  }
}

function updateHierarchyDisplay() {
  const display = document.getElementById('hierarchy-display');
  display.textContent = hierarchy.join(' ⬇ > ');
}

function filtrar() {
  const gestor = document.getElementById('gestor').value;
  const perfil = document.getElementById('perfil').value;
  const busca = document.getElementById('busca').value.toLowerCase();
  const periodo = document.getElementById('periodo').value;

  let filteredData = mockData.filter(item => {
    const matchesGestor = gestor === 'Gestor' || item.Colaborador === gestor || gestores.includes(item.Colaborador);
    const matchesPerfil = !perfil || item.Colaborador in usuarios[perfil];
    const matchesBusca = !busca || 
      item.Colaborador.toLowerCase().includes(busca) || 
      item.Projeto.toLowerCase().includes(busca) || 
      item.Atividade.toLowerCase().includes(busca);
    return matchesGestor && matchesPerfil && matchesBusca;
  });

  // Filtrar por período (simulado para ano ou trimestre)
  if (periodo === 'trimestre') {
    filteredData = filteredData.map(item => {
      const newItem = { ...item, alocacoes: {} };
      const startMonth = 1; // Primeiro trimestre (JAN-MAR)
      const endMonth = 3;
      Object.keys(item.alocacoes).forEach(month => {
        const monthNum = parseInt(month.split('-')[1]);
        if (monthNum >= startMonth && monthNum <= endMonth) {
          newItem.alocacoes[month] = item.alocacoes[month];
        }
      });
      return newItem;
    });
  }

  data = filteredData;
  renderTable();
}