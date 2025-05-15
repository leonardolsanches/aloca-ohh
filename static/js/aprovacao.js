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
        justificativa: '',
        id_alocacao: entry.id_alocacao
      });
    });
  });

  return groupedData;
}

// Carrega dados de gestores, usuários e alocações
console.log('Carregando dados para a tela de aprovação...');
Promise.all([
  fetch('/data/usuarios.json').then(response => {
    if (!response.ok) throw new Error('Erro ao carregar usuarios.json');
    return response.json();
  }),
  fetch('/data/alocacoes.json').then(response => {
    if (!response.ok) throw new Error('Erro ao carregar alocacoes.json');
    return response.json();
  })
])
.then(([usuariosData, alocacoesData]) => {
  usuarios = usuariosData;
  gestores = usuarios.Gestor || [];
  const gestorSelect = document.getElementById('gestor');
  gestorSelect.innerHTML = '<option>Gestor</option>';
  gestores.forEach(gestor => {
    if (gestor !== 'GESTOR À IDENTIFICAR' && gestor !== 'CAUSA RAIZ' && gestor !== 'SUPORTE N3' && gestor !== 'PROJETO ESTRATEGICO') {
      const option = document.createElement('option');
      option.value = gestor.nome;
      option.textContent = gestor.nome;
      gestorSelect.appendChild(option);
    }
  });

  let localData = loadDataFromLocalStorage();
  console.log('Dados processados do localStorage:', localData);

  // Estrutura de dados a partir de alocacoes.json
  const rawData = alocacoesData.map(alocacao => {
    const alocacoesMensais = {};
    Object.entries(alocacao.meses).forEach(([mes, percentage]) => {
      if (percentage > 0) {
        const mesIndex = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'].indexOf(mes) + 1;
        const monthKey = `2025-${String(mesIndex).padStart(2, '0')}`;
        alocacoesMensais[monthKey] = [{
          percentage: percentage,
          projeto: alocacao.projeto,
          atividade: alocacao.atividade,
          status: 'pendente',
          justificativa: '',
          id_alocacao: alocacao.id_alocacao
        }];
      }
    });
    return {
      Colaborador: alocacao.colaborador,
      Projeto: alocacao.projeto,
      Atividade: alocacao.atividade,
      alocacoes: alocacoesMensais
    };
  });

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
  console.error('Erro ao carregar dados:', error);
  alert('Erro ao carregar dados. Verifique o console.');
});

// Atualiza o autocomplete com base nos filtros
function updateAutocomplete() {
  const gestor = document.getElementById('gestor').value;
  const perfil = document.getElementById('perfil').value;
  const busca = document.getElementById('busca').value.toLowerCase();
  const buscaList = document.getElementById('busca-list');
  buscaList.innerHTML = '';

  let filteredUsers = [];
  if (gestor !== 'Gestor' && perfil) {
    filteredUsers = data.filter(item => item.Colaborador === gestor || usuarios[perfil].map(u => u.nome).includes(item.Colaborador)).map(item => item.Colaborador);
  } else if (perfil) {
    filteredUsers = usuarios[perfil].map(u => u.nome);
  } else if (gestor !== 'Gestor') {
    filteredUsers = data.filter(item => item.Colaborador === gestor).map(item => item.Colaborador);
  } else {
    filteredUsers = [...new Set(data.map(item => item.Colaborador))];
  }

  filteredUsers = filteredUsers.filter(user => user.toLowerCase().includes(busca));

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
    console.log('Aprovações carregadas do localStorage:', approvals);
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
          nivel: 'atividade',
          projeto: item.Projeto,
          colaborador: item.Colaborador,
          atividade: item.Atividade,
          mes: month.split('-')[1],
          status: alloc.status,
          justificativa: alloc.justificativa,
          id_alocacao: alloc.id_alocacao
        };
      });
    });
  });
  console.log('Salvando aprovações no localStorage:', approvals);
  localStorage.setItem('approvals', JSON.stringify(approvals));
}

function renderTable() {
  loadApprovals();
  const tbody = document.getElementById('approval-table-body');
  if (!tbody) {
    console.error('Elemento "approval-table-body" não encontrado no DOM.');
    return;
  }
  tbody.innerHTML = '';
  selectedCells.clear(); // Limpar seleções ao renderizar a tabela
  const groupedData = groupData(data);

  function renderRows(items, level = 0, parentKey = '', parentValues = {}) {
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
      itemCell.className = `item-cell level-${level}`;
      itemCell.textContent = item.name;
      row.appendChild(itemCell);

      // Colunas dos meses
      for (let month = 1; month <= 12; month++) {
        const monthKey = `2025-${String(month).padStart(2, '0')}`;
        const cell = document.createElement('td');
        cell.className = 'month-cell col-mes';
        cell.dataset.key = `${key}-${monthKey}`;
        cell.dataset.month = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][month - 1];

        if (item.alocacoes && item.alocacoes[monthKey]) {
          const alocs = item.alocacoes[monthKey];
          const totalPercentage = alocs.reduce((sum, alloc) => sum + alloc.percentage, 0);
          const statusClass = alocs.every(alloc => alloc.status === 'aprovado') ? 'approved-subcell' :
                             alocs.some(alloc => alloc.status === 'reprovado') ? 'rejected-subcell' : 'pending-subcell';
          cell.className += ` ${statusClass}`;
          cell.dataset.totalPercentage = totalPercentage;

          if (totalPercentage === 100) {
            cell.classList.add('green');
          } else if (totalPercentage < 100) {
            cell.classList.add('yellow');
          } else {
            cell.classList.add('red');
          }

          const subCellContainer = document.createElement('div');
          subCellContainer.className = 'subcell-container';

          const subCell = document.createElement('div');
          subCell.className = 'subcell';
          subCell.dataset.allocKey = `${key}-${monthKey}-${item.name}-${level}`;

          const statusIcon = document.createElement('span');
          statusIcon.className = 'status-icon';
          statusIcon.textContent = alocs.every(alloc => alloc.status === 'aprovado') ? '✓' :
                                   alocs.some(alloc => alloc.status === 'reprovado') ? '✗' : '↺';
          statusIcon.onclick = (e) => {
            e.stopPropagation();
            handleCellClick(e, item, monthKey, level, subCell);
          };
          subCell.appendChild(statusIcon);

          const allocText = document.createElement('span');
          allocText.className = 'alloc-text';
          allocText.textContent = `${Math.round(totalPercentage)}%`;
          subCell.appendChild(allocText);

          if (alocs.some(alloc => alloc.justificativa)) {
            const editBtn = document.createElement('span');
            editBtn.className = 'edit-icon';
            editBtn.textContent = '✎';
            editBtn.onclick = (e) => {
              e.stopPropagation();
              editJustificativa(item, monthKey, alocs[0]);
            };
            subCell.appendChild(editBtn);
          }

          subCellContainer.appendChild(subCell);
          cell.appendChild(subCellContainer);

          // Adiciona evento de hover para tooltip
          cell.addEventListener('mouseover', (e) => showTooltip(e, alocs));
          cell.addEventListener('mouseout', hideTooltip);
        } else {
          cell.textContent = '-';
        }

        row.appendChild(cell);
      }

      tbody.appendChild(row);

      // Renderizar os filhos como novas linhas
      if (item.children && item.children.length > 0) {
        const childRow = document.createElement('tr');
        childRow.className = `children level-${level + 1}`;
        childRow.id = `children-${key}`;
        childRow.style.display = 'none';
        const childCell = document.createElement('td');
        childCell.colSpan = 14; // Ocupa todas as colunas para conter a sub-tabela
        const childTable = document.createElement('table');
        childTable.className = 'sub-table';
        const childTbody = document.createElement('tbody');
        childTable.appendChild(childTbody);
        childCell.appendChild(childTable);
        childRow.appendChild(childCell);
        tbody.appendChild(childRow);
      }
    });
  }

  renderRows(groupedData);
}

function showTooltip(e, alocs) {
  const tooltip = document.getElementById('cell-details-tooltip');
  const tooltipContent = document.getElementById('tooltip-content');
  tooltipContent.innerHTML = alocs.map(alloc => 
    `Percentual: ${Math.round(alloc.percentage)}%<br>ID Alocação: ${alloc.id_alocacao}<br>Projeto: ${alloc.projeto}<br>Atividade: ${alloc.atividade}${alloc.justificativa ? `<br>Justificativa: ${alloc.justificativa}` : ''}`
  ).join('<br><br>');
  
  tooltip.style.display = 'block';
  tooltip.style.left = `${e.pageX + 10}px`;
  tooltip.style.top = `${e.pageY + 10}px`;
}

function hideTooltip() {
  const tooltip = document.getElementById('cell-details-tooltip');
  tooltip.style.display = 'none';
}

function handleCellClick(e, item, monthKey, level, subCell) {
  const isShiftPressed = e.shiftKey;
  const isCtrlPressed = e.ctrlKey;
  const cellKey = `${item.name}-${monthKey}-${level}`;
  const cell = subCell.closest('.month-cell');

  if (!isShiftPressed && !isCtrlPressed) {
    // Clique simples: limpar todas as seleções e selecionar apenas a célula clicada
    selectedCells.clear();
    document.querySelectorAll('.month-cell.selected').forEach(cell => {
      cell.classList.remove('selected');
    });
    selectedCells.add(cellKey);
    cell.classList.add('selected');
    lastSelectedCell = { key: cellKey, cell, item, monthKey, level };
  } else if (isCtrlPressed) {
    // CTRL: adicionar/remover a célula da seleção
    if (selectedCells.has(cellKey)) {
      selectedCells.delete(cellKey);
      cell.classList.remove('selected');
    } else {
      selectedCells.add(cellKey);
      cell.classList.add('selected');
    }
    lastSelectedCell = { key: cellKey, cell, item, monthKey, level };
  } else if (isShiftPressed && lastSelectedCell) {
    // SHIFT: selecionar intervalo entre a última célula e a atual
    const allCells = Array.from(document.querySelectorAll('.month-cell'));
    const startIndex = allCells.indexOf(lastSelectedCell.cell);
    const endIndex = allCells.indexOf(cell);

    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);

    selectedCells.clear();
    document.querySelectorAll('.month-cell.selected').forEach(cell => {
      cell.classList.remove('selected');
    });

    for (let i = minIndex; i <= maxIndex; i++) {
      const cell = allCells[i];
      const cellKey = cell.dataset.key;
      selectedCells.add(cellKey);
      cell.classList.add('selected');
    }
  }

  updateSelection();
}

function updateSelection() {
  const counter = document.getElementById('counter');
  if (counter) {
    counter.textContent = `${selectedCells.size} células selecionadas`;
  }
}

function approveSelected() {
  selectedCells.forEach(cellKey => {
    const [key, monthKey] = cellKey.split('-2025-');
    const [_, levelStr] = key.split('-').slice(-2);
    const level = parseInt(levelStr);
    const name = key.split('-').slice(0, -2).join('-');
    const groupedData = groupData(data);
    const item = findItemByKeyWithName(groupedData, name, level);
    if (item && item.alocacoes && item.alocacoes[`2025-${monthKey}`]) {
      const alocs = item.alocacoes[`2025-${monthKey}`];
      alocs.forEach(alloc => {
        alloc.status = 'aprovado';
        alloc.justificativa = '';
      });
      if (level < 2 && item.children) {
        propagateAction(item.children, `2025-${monthKey}`, 'aprovado');
      }
    }
  });
  selectedCells.clear();
  document.querySelectorAll('.month-cell.selected').forEach(cell => {
    cell.classList.remove('selected');
  });
  saveApprovals();
  renderTable();
}

function rejectSelected() {
  currentJustificativaTarget = { propagate: true };
  const modal = document.getElementById('justificativa-modal');
  const textArea = document.getElementById('justificativa-text');
  textArea.value = '';
  modal.style.display = 'block';
}

function submitJustificativa() {
  const textArea = document.getElementById('justificativa-text');
  const justificativa = textArea.value.trim();
  if (!justificativa) {
    alert('A justificativa é obrigatória.');
    return;
  }

  if (currentJustificativaTarget) {
    const { item, monthKey, alloc, propagate } = currentJustificativaTarget;
    if (alloc) {
      alloc.status = 'reprovado';
      alloc.justificativa = justificativa;
      if (propagate && item.children) {
        propagateAction(item.children, monthKey, 'reprovado');
      }
    } else if (propagate) {
      selectedCells.forEach(cellKey => {
        const [key, monthKey] = cellKey.split('-2025-');
        const [_, levelStr] = key.split('-').slice(-2);
        const level = parseInt(levelStr);
        const name = key.split('-').slice(0, -2).join('-');
        const groupedData = groupData(data);
        const item = findItemByKeyWithName(groupedData, name, level);
        if (item && item.alocacoes && item.alocacoes[`2025-${monthKey}`]) {
          const alocs = item.alocacoes[`2025-${monthKey}`];
          alocs.forEach(alloc => {
            alloc.status = 'reprovado';
            alloc.justificativa = justificativa;
          });
          if (level < 2 && item.children) {
            propagateAction(item.children, `2025-${monthKey}`, 'reprovado');
          }
        }
      });
    }
  }

  selectedCells.clear();
  document.querySelectorAll('.month-cell.selected').forEach(cell => {
    cell.classList.remove('selected');
  });
  saveApprovals();
  closeModal();
  renderTable();
}

function findItemByKeyWithName(items, name, targetLevel, currentLevel = 0) {
  for (const item of items) {
    if (item.name === name && currentLevel === targetLevel) {
      return item;
    }
    if (item.children && item.children.length > 0) {
      const found = findItemByKeyWithName(item.children, name, targetLevel, currentLevel + 1);
      if (found) return found;
    }
  }
  return null;
}

function groupData(data) {
  const grouped = {};

  data.forEach(item => {
    let currentLevel = grouped;
    const levels = {};

    hierarchy.forEach(level => {
      levels[level] = item[level];
      const key = item[level];
      if (!currentLevel[key]) {
        currentLevel[key] = { name: key, children: {}, alocacoes: null };
      }
      currentLevel = currentLevel[key].children;
    });

    Object.keys(item.alocacoes).forEach(monthKey => {
      if (!currentLevel[monthKey]) {
        currentLevel[monthKey] = [];
      }
      currentLevel[monthKey].push(...item.alocacoes[monthKey].map(alloc => ({
        percentage: alloc.percentage,
        projeto: levels['Projeto'],
        atividade: levels['Atividade'],
        status: alloc.status,
        justificativa: alloc.justificativa,
        colaborador: levels['Colaborador'],
        id_alocacao: alloc.id_alocacao
      })));
    });
  });

  function buildHierarchy(obj, levelIndex) {
    if (levelIndex === hierarchy.length) {
      const alocacoes = {};
      Object.keys(obj).forEach(monthKey => {
        if (obj[monthKey] && obj[monthKey].length > 0) {
          alocacoes[monthKey] = obj[monthKey];
        }
      });
      return Object.keys(alocacoes).length > 0 ? [{ alocacoes: alocacoes }] : [];
    }

    const levelName = hierarchy[levelIndex];
    return Object.keys(obj).map(key => {
      const children = buildHierarchy(obj[key].children, levelIndex + 1);
      return {
        name: key,
        children: children.length ? children : null,
        alocacoes: levelIndex === hierarchy.length - 1 ? obj[key].children : null
      };
    }).filter(item => item.alocacoes || (item.children && item.children.length > 0));
  }

  return buildHierarchy(grouped, 0);
}

function toggleExpand(key) {
  const childrenRow = document.getElementById(`children-${key}`);
  const childTbody = childrenRow.querySelector('tbody');
  const btn = document.querySelector(`tr[data-key="${key}"] .expand-btn`);

  if (childrenRow.style.display === 'none') {
    childTbody.innerHTML = '';
    const groupedData = groupData(data);
    const item = findItemByKey(groupedData, key.split('-').map(Number));

    if (item && item.children && item.children.length > 0) {
      renderSubRows(item.children, childTbody, key);
      childrenRow.style.display = 'table-row';
      btn.textContent = '-';
    } else {
      childTbody.innerHTML = '<tr><td colspan="14">Sem registros no período selecionado.</td></tr>';
      childrenRow.style.display = 'table-row';
      btn.textContent = '-';
    }
  } else {
    childrenRow.style.display = 'none';
    btn.textContent = '+';
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
    itemCell.className = `item-cell level-${level}`;
    itemCell.textContent = item.name;
    row.appendChild(itemCell);

    for (let month = 1; month <= 12; month++) {
      const monthKey = `2025-${String(month).padStart(2, '0')}`;
      const cell = document.createElement('td');
      cell.className = 'month-cell col-mes';
      cell.dataset.key = `${key}-${monthKey}`;
      cell.dataset.month = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][month - 1];

      if (item.alocacoes && item.alocacoes[monthKey]) {
        const alocs = item.alocacoes[monthKey];
        const totalPercentage = alocs.reduce((sum, alloc) => sum + alloc.percentage, 0);
        const statusClass = alocs.every(alloc => alloc.status === 'aprovado') ? 'approved-subcell' :
                           alocs.some(alloc => alloc.status === 'reprovado') ? 'rejected-subcell' : 'pending-subcell';
        cell.className += ` ${statusClass}`;
        cell.dataset.totalPercentage = totalPercentage;

        if (totalPercentage === 100) {
          cell.classList.add('green');
        } else if (totalPercentage < 100) {
          cell.classList.add('yellow');
        } else {
          cell.classList.add('red');
        }

        const subCellContainer = document.createElement('div');
        subCellContainer.className = 'subcell-container';

        const subCell = document.createElement('div');
        subCell.className = 'subcell';
        subCell.dataset.allocKey = `${key}-${monthKey}-${item.name}-${level}`;

        const statusIcon = document.createElement('span');
        statusIcon.className = 'status-icon';
        statusIcon.textContent = alocs.every(alloc => alloc.status === 'aprovado') ? '✓' :
                                 alocs.some(alloc => alloc.status === 'reprovado') ? '✗' : '↺';
        statusIcon.onclick = (e) => {
          e.stopPropagation();
          handleCellClick(e, item, monthKey, level, subCell);
        };
        subCell.appendChild(statusIcon);

        const allocText = document.createElement('span');
        allocText.className = 'alloc-text';
        allocText.textContent = `${Math.round(totalPercentage)}%`;
        subCell.appendChild(allocText);

        if (alocs.some(alloc => alloc.justificativa)) {
          const editBtn = document.createElement('span');
          editBtn.className = 'edit-icon';
          editBtn.textContent = '✎';
          editBtn.onclick = (e) => {
            e.stopPropagation();
            editJustificativa(item, monthKey, alocs[0]);
          };
          subCell.appendChild(editBtn);
        }

        subCellContainer.appendChild(subCell);
        cell.appendChild(subCellContainer);

        // Adiciona evento de hover para tooltip
        cell.addEventListener('mouseover', (e) => showTooltip(e, alocs));
        cell.addEventListener('mouseout', hideTooltip);
      } else {
        cell.textContent = '-';
      }

      row.appendChild(cell);
    }

    tbody.appendChild(row);

    // Renderizar os filhos como novas linhas
    if (item.children && item.children.length > 0) {
      const childRow = document.createElement('tr');
      childRow.className = `children level-${level + 1}`;
      childRow.id = `children-${key}`;
      childRow.style.display = 'none';
      const childCell = document.createElement('td');
      childCell.colSpan = 14; // Ocupa todas as colunas para conter a sub-tabela
      const childTable = document.createElement('table');
      childTable.className = 'sub-table';
      const childTbody = document.createElement('tbody');
      childTable.appendChild(childTbody);
      childCell.appendChild(childTable);
      childRow.appendChild(childCell);
      tbody.appendChild(childRow);
    }
  });
}

function propagateAction(items, monthKey, newStatus) {
  items.forEach(item => {
    if (item.alocacoes && item.alocacoes[monthKey]) {
      item.alocacoes[monthKey].forEach(alloc => {
        alloc.status = newStatus;
        if (newStatus !== 'reprovado') {
          alloc.justificativa = '';
        }
      });
    }
    if (item.children) {
      propagateAction(item.children, monthKey, newStatus);
    }
  });
}

function editJustificativa(item, monthKey, alloc) {
  currentJustificativaTarget = { item, monthKey, alloc };
  const modal = document.getElementById('justificativa-modal');
  const textArea = document.getElementById('justificativa-text');
  textArea.value = alloc.justificativa || '';
  modal.style.display = 'block';
}

function closeModal() {
  const modal = document.getElementById('justificativa-modal');
  modal.style.display = 'none';
  currentJustificativaTarget = null;
}

function updateHierarchy() {
  const hierarchySelect = document.getElementById('hierarchy-select');
  const selectedIndex = parseInt(hierarchySelect.value);
  hierarchy = hierarchyOptions[selectedIndex].value;
  updateHierarchyDisplay();
  renderTable();
}

function updateHierarchyDisplay() {
  const display = document.getElementById('hierarchy-display');
  display.innerHTML = `
    <span class="hierarchy
