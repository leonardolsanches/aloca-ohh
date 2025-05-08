let gestores = [];
let data = [];
let hierarchy = ['Colaborador', 'Projeto', 'Atividade'];
let currentJustificativaTarget = null;
let usuarios = {};
let lastSelectedCell = null;

// Dados simulados (mock)
const mockData = [
  {
    Colaborador: "João Silva",
    Projeto: "Projeto A",
    Atividade: "Atividade 1",
    alocacoes: {
      '2025-01': [
        { percentage: 55, projeto: "Projeto A", atividade: "Atividade 1", status: 'pendente', justificativa: '' },
        { percentage: 37, projeto: "Projeto A", atividade: "Atividade 2", status: 'pendente', justificativa: '' }
      ],
      '2025-02': [
        { percentage: 48, projeto: "Projeto A", atividade: "Atividade 1", status: 'pendente', justificativa: '' }
      ],
      '2025-03': [
        { percentage: 60, projeto: "Projeto A", atividade: "Atividade 1", status: 'pendente', justificativa: '' },
        { percentage: 50, projeto: "Projeto A", atividade: "Atividade 2", status: 'pendente', justificativa: '' }
      ],
      '2025-04': [{ percentage: 70, projeto: "Projeto A", atividade: "Atividade 1", status: 'pendente', justificativa: '' }],
      '2025-05': [{ percentage: 100, projeto: "Projeto A", atividade: "Atividade 1", status: 'pendente', justificativa: '' }],
      '2025-06': [{ percentage: 95, projeto: "Projeto A", atividade: "Atividade 1", status: 'pendente', justificativa: '' }],
      '2025-07': [{ percentage: 80, projeto: "Projeto A", atividade: "Atividade 1", status: 'pendente', justificativa: '' }],
      '2025-08': [{ percentage: 120, projeto: "Projeto A", atividade: "Atividade 1", status: 'pendente', justificativa: '' }],
      '2025-09': [{ percentage: 60, projeto: "Projeto A", atividade: "Atividade 1", status: 'pendente', justificativa: '' }],
      '2025-10': [{ percentage: 90, projeto: "Projeto A", atividade: "Atividade 1", status: 'pendente', justificativa: '' }],
      '2025-11': [{ percentage: 105, projeto: "Projeto A", atividade: "Atividade 1", status: 'pendente', justificativa: '' }],
      '2025-12': [{ percentage: 88, projeto: "Projeto A", atividade: "Atividade 1", status: 'pendente', justificativa: '' }]
    }
  },
  {
    Colaborador: "Maria Oliveira",
    Projeto: "Projeto B",
    Atividade: "Atividade 2",
    alocacoes: {
      '2025-01': [{ percentage: 80, projeto: "Projeto B", atividade: "Atividade 2", status: 'pendente', justificativa: '' }],
      '2025-02': [{ percentage: 90, projeto: "Projeto B", atividade: "Atividade 2", status: 'pendente', justificativa: '' }],
      '2025-03': [{ percentage: 100, projeto: "Projeto B", atividade: "Atividade 2", status: 'pendente', justificativa: '' }],
      '2025-04': [{ percentage: 95, projeto: "Projeto B", atividade: "Atividade 2", status: 'pendente', justificativa: '' }],
      '2025-05': [{ percentage: 85, projeto: "Projeto B", atividade: "Atividade 2", status: 'pendente', justificativa: '' }],
      '2025-06': [{ percentage: 110, projeto: "Projeto B", atividade: "Atividade 2", status: 'pendente', justificativa: '' }],
      '2025-07': [{ percentage: 70, projeto: "Projeto B", atividade: "Atividade 2", status: 'pendente', justificativa: '' }],
      '2025-08': [{ percentage: 120, projeto: "Projeto B", atividade: "Atividade 2", status: 'pendente', justificativa: '' }],
      '2025-09': [{ percentage: 65, projeto: "Projeto B", atividade: "Atividade 2", status: 'pendente', justificativa: '' }],
      '2025-10': [{ percentage: 90, projeto: "Projeto B", atividade: "Atividade 2", status: 'pendente', justificativa: '' }],
      '2025-11': [{ percentage: 100, projeto: "Projeto B", atividade: "Atividade 2", status: 'pendente', justificativa: '' }],
      '2025-12': [{ percentage: 88, projeto: "Projeto B", atividade: "Atividade 2", status: 'pendente', justificativa: '' }]
    }
  }
];

// Carrega dados de gestores e usuários
fetch('/static/usuarios.json')
  .then(response => response.json())
  .then(json => {
    gestores = json.Gestor;
    usuarios = json;
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
    updateButtonStates();
    updateAutocomplete();
  })
  .catch(error => console.error('Erro ao carregar usuarios.json:', error));

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
}

// Carrega aprovações salvas do localStorage
function loadApprovals() {
  const saved = localStorage.getItem('approvals');
  if (saved) {
    const approvals = JSON.parse(saved);
    data.forEach(item => {
      Object.keys(item.alocacoes).forEach(month => {
        item.alocacoes[month].forEach((alloc, index) => {
          const key = `${item.Colaborador}-${item.Projeto}-${item.Atividade}-${month}-${index}`;
          if (approvals[key]) {
            alloc.status = approvals[key].status;
            alloc.justificativa = approvals[key].justificativa;
          }
        });
      });
    });
  }
}

function saveApprovals() {
  const approvals = {};
  data.forEach(item => {
    Object.keys(item.alocacoes).forEach(month => {
      item.alocacoes[month].forEach((alloc, index) => {
        const key = `${item.Colaborador}-${item.Projeto}-${item.Atividade}-${month}-${index}`;
        approvals[key] = {
          status: alloc.status,
          justificativa: alloc.justificativa
        };
      });
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
      if (item.children && item.children.length > 0) {
        const expandBtn = document.createElement('button');
        expandBtn.className = 'expand-btn';
        expandBtn.textContent = '+';
        expandBtn.onclick = () => toggleExpand(key);
        expandCell.appendChild(expandBtn);
      }
      row.appendChild(expandCell);

      const itemCell = document.createElement('td');
      itemCell.textContent = item.name;
      row.appendChild(itemCell);

      // Colunas dos meses
      for (let month = 1; month <= 12; month++) {
        const monthKey = `2025-${String(month).padStart(2, '0')}`;
        const cell = document.createElement('td');
        if (item.alocacoes && item.alocacoes[monthKey]) {
          const alocs = item.alocacoes[monthKey];
          const totalPercentage = alocs.reduce((sum, alloc) => sum + alloc.percentage, 0);
          const status = alocs[0].status;
          const statusClass = status === 'aprovado' ? 'approved' : status === 'reprovado' ? 'rejected' : 'pending';
          cell.className = statusClass;

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.className = 'select-cell';
          checkbox.dataset.key = `${key}-${monthKey}`;
          checkbox.onclick = (e) => handleCellClick(e, key, monthKey);
          cell.appendChild(checkbox);

          const summaryText = alocs.map(alloc => `${alloc.percentage}% ${alloc.projeto}, ${alloc.atividade}`).join('<br>');
          const summary = document.createElement('span');
          summary.className = 'allocation-summary';
          summary.innerHTML = summaryText;
          cell.appendChild(summary);

          cell.appendChild(document.createElement('br'));

          if (alocs.some(alloc => alloc.justificativa)) {
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
      const approveAllBtn = document.createElement('button');
      approveAllBtn.className = 'action-btn approve-all';
      approveAllBtn.textContent = 'Aprovar Todos';
      approveAllBtn.dataset.key = key;
      approveAllBtn.onclick = () => approveAll(item);
      actionsCell.appendChild(approveAllBtn);

      const rejectAllBtn = document.createElement('button');
      rejectAllBtn.className = 'action-btn reject-all';
      rejectAllBtn.textContent = 'Reprovar Todos';
      rejectAllBtn.dataset.key = key;
      rejectAllBtn.onclick = () => openJustificativaModal(item, 'all');
      actionsCell.appendChild(rejectAllBtn);
      row.appendChild(actionsCell);

      tbody.appendChild(row);

      // Inicialmente, não renderizar subníveis até que sejam expandidos
      const childRow = document.createElement('tr');
      childRow.className = `children level-${level + 1}`;
      childRow.id = `children-${key}`;
      childRow.style.display = 'none';
      const childCell = document.createElement('td');
      childCell.colSpan = 15;
      const childTable = document.createElement('table');
      childTable.className = 'sub-table';
      const childTbody = document.createElement('tbody');
      childTable.appendChild(childTbody);
      childCell.appendChild(childTable);
      childRow.appendChild(childCell);
      tbody.appendChild(childRow);
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
  const childTbody = childrenRow.querySelector('tbody');
  const btn = document.querySelector(`tr[data-key="${key}"] .expand-btn`);
  const approveAllBtn = document.querySelector(`tr[data-key="${key}"] .approve-all`);
  const rejectAllBtn = document.querySelector(`tr[data-key="${key}"] .reject-all`);

  if (childrenRow.style.display === 'none') {
    // Limpar o conteúdo anterior
    childTbody.innerHTML = '';
    const item = findItemByKey(data, key.split('-').map(Number));

    // Verificar se há subníveis antes de renderizar
    if (item && item.children && item.children.length > 0) {
      renderSubRows(item.children, childTbody, key);
      childrenRow.style.display = 'table-row';
      btn.textContent = '-';
      if (approveAllBtn) approveAllBtn.style.display = 'inline-block';
      if (rejectAllBtn) rejectAllBtn.style.display = 'inline-block';
    } else {
      // Exibir mensagem se não houver subníveis
      childTbody.innerHTML = '<tr><td colspan="15">Sem registros no período selecionado.</td></tr>';
      childrenRow.style.display = 'table-row';
      btn.textContent = '-';
      if (approveAllBtn) approveAllBtn.style.display = 'none';
      if (rejectAllBtn) rejectAllBtn.style.display = 'none';
    }
  } else {
    childrenRow.style.display = 'none';
    btn.textContent = '+';
    if (approveAllBtn) approveAllBtn.style.display = 'none';
    if (rejectAllBtn) rejectAllBtn.style.display = 'none';
  }
}

function findItemByKey(items, indices) {
  let current = items;
  for (let i = 0; i < indices.length; i++) {
    current = current[indices[i]];
    if (i < indices.length - 1) {
      current = current.children;
    }
  }
  return current;
}

function renderSubRows(items, tbody, parentKey) {
  items.forEach((item, index) => {
    const key = `${parentKey}-${index}`;
    const level = parentKey.split('-').length;
    const row = document.createElement('tr');
    row.className = `level-${level}`;
    row.dataset.key = key;

    const expandCell = document.createElement('td');
    if (item.children && item.children.length > 0) {
      const expandBtn = document.createElement('button');
      expandBtn.className = 'expand-btn';
      expandBtn.textContent = '+';
      expandBtn.onclick = () => toggleExpand(key);
      expandCell.appendChild(expandBtn);
    }
    row.appendChild(expandCell);

    const itemCell = document.createElement('td');
    itemCell.textContent = item.name;
    row.appendChild(itemCell);

    for (let month = 1; month <= 12; month++) {
      const monthKey = `2025-${String(month).padStart(2, '0')}`;
      const cell = document.createElement('td');
      if (item.alocacoes && item.alocacoes[monthKey]) {
        const alocs = item.alocacoes[monthKey];
        const totalPercentage = alocs.reduce((sum, alloc) => sum + alloc.percentage, 0);
        const status = alocs[0].status;
        const statusClass = status === 'aprovado' ? 'approved' : status === 'reprovado' ? 'rejected' : 'pending';
        cell.className = statusClass;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'select-cell';
        checkbox.dataset.key = `${key}-${monthKey}`;
        checkbox.onclick = (e) => handleCellClick(e, key, monthKey);
        cell.appendChild(checkbox);

        const summaryText = alocs.map(alloc => `${alloc.percentage}% ${alloc.projeto}, ${alloc.atividade}`).join('<br>');
        const summary = document.createElement('span');
        summary.className = 'allocation-summary';
        summary.innerHTML = summaryText;
        cell.appendChild(summary);

        cell.appendChild(document.createElement('br'));

        if (alocs.some(alloc => alloc.justificativa)) {
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
    const approveAllBtn = document.createElement('button');
    approveAllBtn.className = 'action-btn approve-all';
    approveAllBtn.textContent = 'Aprovar Todos';
    approveAllBtn.dataset.key = key;
    approveAllBtn.onclick = () => approveAll(item);
    actionsCell.appendChild(approveAllBtn);

    const rejectAllBtn = document.createElement('button');
    rejectAllBtn.className = 'action-btn reject-all';
    rejectAllBtn.textContent = 'Reprovar Todos';
    rejectAllBtn.dataset.key = key;
    rejectAllBtn.onclick = () => openJustificativaModal(item, 'all');
    actionsCell.appendChild(rejectAllBtn);
    row.appendChild(actionsCell);

    tbody.appendChild(row);

    const childRow = document.createElement('tr');
    childRow.className = `children level-${level + 1}`;
    childRow.id = `children-${key}`;
    childRow.style.display = 'none';
    const childCell = document.createElement('td');
    childCell.colSpan = 15;
    const childTable = document.createElement('table');
    childTable.className = 'sub-table';
    const childTbody = document.createElement('tbody');
    childTable.appendChild(childTbody);
    childCell.appendChild(childTable);
    childRow.appendChild(childCell);
    tbody.appendChild(childRow);
  });
}

function handleCellClick(e, key, monthKey) {
  const isShiftPressed = e.shiftKey;
  const isCtrlPressed = e.ctrlKey;
  const checkbox = e.target;

  const allCheckboxes = Array.from(document.querySelectorAll('.select-cell'));
  const currentIndex = allCheckboxes.findIndex(cb => cb.dataset.key === `${key}-${monthKey}`);

  if (!isShiftPressed && !isCtrlPressed) {
    // Desmarcar todas as outras células
    allCheckboxes.forEach(cb => {
      if (cb !== checkbox) {
        cb.checked = false;
      }
    });
    checkbox.checked = true;
    lastSelectedCell = { checkbox, index: currentIndex };
  } else if (isCtrlPressed) {
    // Alternar a seleção da célula clicada
    checkbox.checked = !checkbox.checked;
    lastSelectedCell = { checkbox, index: currentIndex };
  } else if (isShiftPressed && lastSelectedCell) {
    // Selecionar um intervalo de células
    const startIndex = lastSelectedCell.index;
    const endIndex = currentIndex;
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);

    for (let i = minIndex; i <= maxIndex; i++) {
      allCheckboxes[i].checked = true;
    }
    lastSelectedCell = { checkbox, index: currentIndex };
  }
}

function approveSelected() {
  const selectedCells = document.querySelectorAll('.select-cell:checked');
  if (selectedCells.length === 0) {
    alert('Nenhuma célula selecionada para aprovar.');
    return;
  }
  selectedCells.forEach(checkbox => {
    const [key, monthKey] = checkbox.dataset.key.split('-2025-');
    const item = findItemByKey(data, key.split('-').map(Number));
    if (item && item.alocacoes && item.alocacoes[`2025-${monthKey}`]) {
      item.alocacoes[`2025-${monthKey}`].forEach(alloc => {
        alloc.status = 'aprovado';
        alloc.justificativa = '';
      });
    }
  });
  saveApprovals();
  renderTable();
}

function rejectSelected() {
  const selectedCells = document.querySelectorAll('.select-cell:checked');
  if (selectedCells.length === 0) {
    alert('Nenhuma célula selecionada para reprovar.');
    return;
  }

  currentJustificativaTarget = { cells: Array.from(selectedCells).map(cb => cb.dataset.key) };
  const modal = document.getElementById('justificativa-modal');
  const textArea = document.getElementById('justificativa-text');
  textArea.value = '';
  modal.style.display = 'block';
}

function approveAll(item) {
  if (item.alocacoes) {
    Object.keys(item.alocacoes).forEach(monthKey => {
      item.alocacoes[monthKey].forEach(alloc => {
        alloc.status = 'aprovado';
        alloc.justificativa = '';
      });
    });
    saveApprovals();
    renderTable();
  }
}

function openJustificativaModal(item, monthKey) {
  currentJustificativaTarget = { item, monthKey };
  const modal = document.getElementById('justificativa-modal');
  const textArea = document.getElementById('justificativa-text');
  textArea.value = monthKey !== 'all' && item.alocacoes[monthKey] && item.alocacoes[monthKey][0].justificativa ? item.alocacoes[monthKey][0].justificativa : '';
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

  if (currentJustificativaTarget.cells) {
    currentJustificativaTarget.cells.forEach(cellKey => {
      const [key, monthKey] = cellKey.split('-2025-');
      const item = findItemByKey(data, key.split('-').map(Number));
      if (item && item.alocacoes && item.alocacoes[`2025-${monthKey}`]) {
        item.alocacoes[`2025-${monthKey}`].forEach(alloc => {
          alloc.status = 'reprovado';
          alloc.justificativa = justificativa;
        });
      }
    });
  } else {
    const { item, monthKey } = currentJustificativaTarget;
    if (monthKey === 'all') {
      Object.keys(item.alocacoes).forEach(key => {
        item.alocacoes[key].forEach(alloc => {
          alloc.status = 'reprovado';
          alloc.justificativa = justificativa;
        });
      });
    } else {
      item.alocacoes[monthKey].forEach(alloc => {
        alloc.status = 'reprovado';
        alloc.justificativa = justificativa;
      });
    }
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
    updateButtonStates();
  }
}

function moveDown(index) {
  if (index < hierarchy.length - 1) {
    [hierarchy[index], hierarchy[index + 1]] = [hierarchy[index + 1], hierarchy[index]];
    updateHierarchyDisplay();
    renderTable();
    updateButtonStates();
  }
}

function updateHierarchyDisplay() {
  const display = document.getElementById('hierarchy-display');
  display.innerHTML = `
    <span class="hierarchy-level">${hierarchy[0]}</span>
    <button onclick="moveDown(0)" id="down-0" title="Descer">⬇ Descer</button>
    <span> ⬇ > </span>
    <span class="hierarchy-level">${hierarchy[1]}</span>
    <button onclick="moveUp(1)" id="up-1" title="Subir">⬆ Subir</button>
    <button onclick="moveDown(1)" id="down-1" title="Descer">⬇ Descer</button>
    <span> ⬇ > </span>
    <span class="hierarchy-level">${hierarchy[2]}</span>
    <button onclick="moveUp(2)" id="up-2" title="Subir">⬆ Subir</button>
  `;
}

function updateButtonStates() {
  document.getElementById('down-0').disabled = false;
  document.getElementById('up-1').disabled = false;
  document.getElementById('down-1').disabled = false;
  document.getElementById('up-2').disabled = false;

  if (hierarchy[0] === 'Colaborador') {
    document.getElementById('down-0').disabled = false;
  }
  if (hierarchy[1] === 'Projeto') {
    document.getElementById('up-1').disabled = false;
    document.getElementById('down-1').disabled = false;
  }
  if (hierarchy[2] === 'Atividade') {
    document.getElementById('up-2').disabled = false;
  }
}

function filtrar() {
  const gestor = document.getElementById('gestor').value;
  const perfil = document.getElementById('perfil').value;
  const busca = document.getElementById('busca').value.toLowerCase();
  const periodo = document.getElementById('periodo').value;

  let filteredData = mockData.filter(item => {
    const matchesGestor = gestor === 'Gestor' || item.Colaborador === gestor;
    const matchesPerfil = perfil === '' || usuarios[perfil].includes(item.Colaborador);
    const matchesBusca = busca === '' || 
      item.Colaborador.toLowerCase().includes(busca) || 
      item.Projeto.toLowerCase().includes(busca) || 
      item.Atividade.toLowerCase().includes(busca);
    return matchesGestor && matchesPerfil && matchesBusca;
  });

  if (periodo === 'trimestre') {
    filteredData = filteredData.map(item => {
      const newItem = { ...item, alocacoes: {} };
      const startMonth = 1;
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
  updateAutocomplete();
}

// Atualiza o autocomplete ao mudar o gestor ou perfil
document.getElementById('gestor').addEventListener('change', updateAutocomplete);
document.getElementById('perfil').addEventListener('change', updateAutocomplete);