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

// Obter o username da URL
const urlParams = new URLSearchParams(window.location.search);
const currentUser = urlParams.get('username') || 'Convidado';
console.log('Usuário atual obtido da URL:', currentUser);

// Dados mockados para teste
const mockData = [
    {
        Colaborador: "João Silva",
        Projeto: "Projeto X",
        Atividade: "Atividade 1",
        alocacoes: {
            '2025-01': [
                { percentage: 100, projeto: "Projeto X", atividade: "Atividade 1", status: 'pendente', justificativa: '' }
            ],
            '2025-02': [
                { percentage: 100, projeto: "Projeto X", atividade: "Atividade 1", status: 'pendente', justificativa: '' }
            ],
            '2025-03': [
                { percentage: 100, projeto: "Projeto X", atividade: "Atividade 1", status: 'pendente', justificativa: '' }
            ]
        }
    },
    {
        Colaborador: "Maria Oliveira",
        Projeto: "Projeto X",
        Atividade: "Atividade 1",
        alocacoes: {
            '2025-01': [
                { percentage: 100, projeto: "Projeto X", atividade: "Atividade 1", status: 'pendente', justificativa: '' }
            ],
            '2025-03': [
                { percentage: 100, projeto: "Projeto X", atividade: "Atividade 1", status: 'pendente', justificativa: '' }
            ],
            '2025-04': [
                { percentage: 100, projeto: "Projeto X", atividade: "Atividade 1", status: 'pendente', justificativa: '' }
            ]
        }
    },
    {
        Colaborador: "Pedro Almeida",
        Projeto: "Projeto X",
        Atividade: "Atividade 1",
        alocacoes: {
            '2025-02': [
                { percentage: 100, projeto: "Projeto X", atividade: "Atividade 1", status: 'pendente', justificativa: '' }
            ],
            '2025-03': [
                { percentage: 100, projeto: "Projeto X", atividade: "Atividade 1", status: 'pendente', justificativa: '' }
            ],
            '2025-04': [
                { percentage: 100, projeto: "Projeto X", atividade: "Atividade 1", status: 'pendente', justificativa: '' }
            ]
        }
    }
];

// Carrega alocações do localStorage
function loadAllocationsFromLocalStorage() {
    const saved = localStorage.getItem('allocations');
    const allocations = saved ? JSON.parse(saved) : {};
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

        let localData = loadAllocationsFromLocalStorage();
        console.log('Dados processados do localStorage:', localData);

        data = [...localData, ...mockData];
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
                    justificativa: alloc.justificativa
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
            itemCell.textContent = item.name;
            row.appendChild(itemCell);

            // Colunas dos meses
            for (let month = 1; month <= 12; month++) {
                const monthKey = `2025-${String(month).padStart(2, '0')}`;
                const cell = document.createElement('td');
                cell.className = 'month-cell';
                cell.dataset.key = `${key}-${monthKey}`;

                const subCellContainer = document.createElement('div');
                subCellContainer.className = 'subcell-container';

                if (item.alocacoes && item.alocacoes[monthKey]) {
                    const alocs = item.alocacoes[monthKey];
                    const statusClass = alocs.every(alloc => alloc.status === 'aprovado') ? 'approved-subcell' :
                                       alocs.some(alloc => alloc.status === 'reprovado') ? 'rejected-subcell' : 'pending-subcell';
                    cell.className += ` ${statusClass}`;

                    // Exibir subníveis dentro da célula
                    if (level === 0) {
                        // Nível mais alto (ex.: Projeto)
                        const subCell = document.createElement('div');
                        subCell.className = 'subcell';
                        subCell.dataset.allocKey = `${key}-${monthKey}`;

                        const statusIcon = document.createElement('span');
                        statusIcon.className = 'status-icon';
                        statusIcon.textContent = alocs.every(alloc => alloc.status === 'aprovado') ? '✓' :
                                                 alocs.some(alloc => alloc.status === 'reprovado') ? '✗' : '';
                        statusIcon.onclick = (e) => {
                            e.stopPropagation();
                            toggleCellStatus(item, monthKey, null, true, level, statusIcon);
                        };
                        subCell.appendChild(statusIcon);

                        const allocText = document.createElement('span');
                        allocText.className = 'alloc-text';
                        allocText.textContent = item.name;
                        subCell.appendChild(allocText);

                        subCellContainer.appendChild(subCell);

                        // Exibir subníveis (Colaboradores)
                        const subLevel = hierarchy[1];
                        const subItems = {};
                        alocs.forEach(alloc => {
                            const subKey = alloc[subLevel.toLowerCase()];
                            if (!subItems[subKey]) {
                                subItems[subKey] = [];
                            }
                            subItems[subKey].push(alloc);
                        });

                        Object.keys(subItems).forEach(subKey => {
                            const subAlocs = subItems[subKey];
                            const subStatusClass = subAlocs.every(alloc => alloc.status === 'aprovado') ? 'approved-subcell' :
                                                  subAlocs.some(alloc => alloc.status === 'reprovado') ? 'rejected-subcell' : 'pending-subcell';
                            const subCell = document.createElement('div');
                            subCell.className = `subcell sublevel-1 ${subStatusClass}`;
                            subCell.dataset.allocKey = `${key}-${monthKey}-${subKey}`;

                            const subStatusIcon = document.createElement('span');
                            subStatusIcon.className = 'status-icon';
                            subStatusIcon.textContent = subAlocs.every(alloc => alloc.status === 'aprovado') ? '✓' :
                                                        subAlocs.some(alloc => alloc.status === 'reprovado') ? '✗' : '';
                            subStatusIcon.onclick = (e) => {
                                e.stopPropagation();
                                toggleSubLevelStatus(item, monthKey, subKey, subAlocs, level + 1, subStatusIcon);
                            };
                            subCell.appendChild(subStatusIcon);

                            const subAllocText = document.createElement('span');
                            subAllocText.className = 'alloc-text';
                            subAllocText.textContent = subKey;
                            subCell.appendChild(subAllocText);

                            subCellContainer.appendChild(subCell);

                            // Exibir sub-subníveis (Atividades)
                            const subSubLevel = hierarchy[2];
                            const subSubItems = {};
                            subAlocs.forEach(alloc => {
                                const subSubKey = alloc[subSubLevel.toLowerCase()];
                                if (!subSubItems[subSubKey]) {
                                    subSubItems[subSubKey] = [];
                                }
                                subSubItems[subSubKey].push(alloc);
                            });

                            Object.keys(subSubItems).forEach(subSubKey => {
                                const subSubAlocs = subSubItems[subSubKey];
                                const subSubStatusClass = subSubAlocs.every(alloc => alloc.status === 'aprovado') ? 'approved-subcell' :
                                                         subSubAlocs.some(alloc => alloc.status === 'reprovado') ? 'rejected-subcell' : 'pending-subcell';
                                const subSubCell = document.createElement('div');
                                subSubCell.className = `subcell sublevel-2 ${subSubStatusClass}`;
                                subSubCell.dataset.allocKey = `${key}-${monthKey}-${subKey}-${subSubKey}`;

                                const subSubStatusIcon = document.createElement('span');
                                subSubStatusIcon.className = 'status-icon';
                                subSubStatusIcon.textContent = subSubAlocs.every(alloc => alloc.status === 'aprovado') ? '✓' :
                                                               subSubAlocs.some(alloc => alloc.status === 'reprovado') ? '✗' : '';
                                subSubStatusIcon.onclick = (e) => {
                                    e.stopPropagation();
                                    toggleSubSubLevelStatus(item, monthKey, subKey, subSubKey, subSubAlocs, subSubStatusIcon);
                                };
                                subSubCell.appendChild(subSubStatusIcon);

                                const subSubAllocText = document.createElement('span');
                                subSubAllocText.className = 'alloc-text';
                                subSubAllocText.textContent = subSubAlocs.map(alloc => `${alloc.percentage}% ${alloc.projeto} - ${alloc.atividade}`).join(', ');
                                if (subSubAlocs[0].justificativa) {
                                    subSubAllocText.setAttribute('title', `Justificativa: ${subSubAlocs[0].justificativa}`);
                                }
                                subSubCell.appendChild(subSubAllocText);

                                if (subSubAlocs[0].justificativa) {
                                    const editBtn = document.createElement('span');
                                    editBtn.className = 'edit-icon';
                                    editBtn.textContent = '✎';
                                    editBtn.onclick = (e) => {
                                        e.stopPropagation();
                                        editJustificativa(item, monthKey, subSubAlocs[0]);
                                    };
                                    subSubCell.appendChild(editBtn);
                                }

                                subCellContainer.appendChild(subSubCell);
                            });
                        });
                    } else if (level === 1) {
                        // Nível intermediário (ex.: Colaborador)
                        const subCell = document.createElement('div');
                        subCell.className = 'subcell';
                        subCell.dataset.allocKey = `${key}-${monthKey}`;

                        const statusClass = alocs.every(alloc => alloc.status === 'aprovado') ? 'approved-subcell' :
                                          alocs.some(alloc => alloc.status === 'reprovado') ? 'rejected-subcell' : 'pending-subcell';
                        subCell.className += ` ${statusClass}`;

                        const statusIcon = document.createElement('span');
                        statusIcon.className = 'status-icon';
                        statusIcon.textContent = alocs.every(alloc => alloc.status === 'aprovado') ? '✓' :
                                                 alocs.some(alloc => alloc.status === 'reprovado') ? '✗' : '';
                        statusIcon.onclick = (e) => {
                            e.stopPropagation();
                            toggleCellStatus(item, monthKey, null, true, level, statusIcon);
                        };
                        subCell.appendChild(statusIcon);

                        const allocText = document.createElement('span');
                        allocText.className = 'alloc-text';
                        allocText.textContent = item.name;
                        subCell.appendChild(allocText);

                        subCellContainer.appendChild(subCell);

                        // Exibir subníveis (Atividades)
                        const subLevel = hierarchy[2];
                        const subItems = {};
                        alocs.forEach(alloc => {
                            const subKey = alloc[subLevel.toLowerCase()];
                            if (!subItems[subKey]) {
                                subItems[subKey] = [];
                            }
                            subItems[subKey].push(alloc);
                        });

                        Object.keys(subItems).forEach(subKey => {
                            const subAlocs = subItems[subKey];
                            const subStatusClass = subAlocs.every(alloc => alloc.status === 'aprovado') ? 'approved-subcell' :
                                                  subAlocs.some(alloc => alloc.status === 'reprovado') ? 'rejected-subcell' : 'pending-subcell';
                            const subCell = document.createElement('div');
                            subCell.className = `subcell sublevel-2 ${subStatusClass}`;
                            subCell.dataset.allocKey = `${key}-${monthKey}-${subKey}`;

                            const subStatusIcon = document.createElement('span');
                            subStatusIcon.className = 'status-icon';
                            subStatusIcon.textContent = subAlocs.every(alloc => alloc.status === 'aprovado') ? '✓' :
                                                        subAlocs.some(alloc => alloc.status === 'reprovado') ? '✗' : '';
                            subStatusIcon.onclick = (e) => {
                                e.stopPropagation();
                                toggleSubLevelStatus(item, monthKey, subKey, subAlocs, level + 1, subStatusIcon);
                            };
                            subCell.appendChild(subStatusIcon);

                            const subAllocText = document.createElement('span');
                            subAllocText.className = 'alloc-text';
                            subAllocText.textContent = subAlocs.map(alloc => `${alloc.percentage}% ${alloc.projeto} - ${alloc.atividade}`).join(', ');
                            if (subAlocs[0].justificativa) {
                                subAllocText.setAttribute('title', `Justificativa: ${subAlocs[0].justificativa}`);
                            }
                            subCell.appendChild(subAllocText);

                            if (subAlocs[0].justificativa) {
                                const editBtn = document.createElement('span');
                                editBtn.className = 'edit-icon';
                                editBtn.textContent = '✎';
                                editBtn.onclick = (e) => {
                                    e.stopPropagation();
                                    editJustificativa(item, monthKey, subAlocs[0]);
                                };
                                subCell.appendChild(editBtn);
                            }

                            subCellContainer.appendChild(subCell);
                        });
                    } else if (level === 2) {
                        // Nível mais baixo (ex.: Atividade)
                        alocs.forEach((alloc, allocIndex) => {
                            const subCell = document.createElement('div');
                            subCell.className = 'subcell';
                            subCell.dataset.allocKey = `${key}-${monthKey}-${allocIndex}`;

                            const statusClass = alloc.status === 'aprovado' ? 'approved-subcell' :
                                              alloc.status === 'reprovado' ? 'rejected-subcell' : 'pending-subcell';
                            subCell.className += ` ${statusClass}`;

                            const statusIcon = document.createElement('span');
                            statusIcon.className = 'status-icon';
                            statusIcon.textContent = alloc.status === 'aprovado' ? '✓' :
                                                     alloc.status === 'reprovado' ? '✗' : '';
                            statusIcon.onclick = (e) => {
                                e.stopPropagation();
                                toggleCellStatus(item, monthKey, allocIndex, false, level, statusIcon);
                            };
                            subCell.appendChild(statusIcon);

                            const allocText = document.createElement('span');
                            allocText.className = 'alloc-text';
                            allocText.textContent = `${alloc.percentage}% ${alloc.projeto} - ${alloc.atividade}`;
                            if (alloc.justificativa) {
                                allocText.setAttribute('title', `Justificativa: ${alloc.justificativa}`);
                            }
                            subCell.appendChild(allocText);

                            if (alloc.justificativa) {
                                const editBtn = document.createElement('span');
                                editBtn.className = 'edit-icon';
                                editBtn.textContent = '✎';
                                editBtn.onclick = (e) => {
                                    e.stopPropagation();
                                    editJustificativa(item, monthKey, alloc);
                                };
                                subCell.appendChild(editBtn);
                            }

                            subCellContainer.appendChild(subCell);
                        });
                    }
                }

                cell.appendChild(subCellContainer);
                row.appendChild(cell);
            }

            tbody.appendChild(row);

            const childRow = document.createElement('tr');
            childRow.className = `children level-${level + 1}`;
            childRow.id = `children-${key}`;
            childRow.style.display = 'none';
            const childCell = document.createElement('td');
            childCell.colSpan = 14;
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
                colaborador: levels['Colaborador']
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
        itemCell.textContent = item.name;
        row.appendChild(itemCell);

        for (let month = 1; month <= 12; month++) {
            const monthKey = `2025-${String(month).padStart(2, '0')}`;
            const cell = document.createElement('td');
            cell.className = 'month-cell';
            cell.dataset.key = `${key}-${monthKey}`;

            const subCellContainer = document.createElement('div');
            subCellContainer.className = 'subcell-container';

            if (item.alocacoes && item.alocacoes[monthKey]) {
                const alocs = item.alocacoes[monthKey];
                const statusClass = alocs.every(alloc => alloc.status === 'aprovado') ? 'approved-subcell' :
                                   alocs.some(alloc => alloc.status === 'reprovado') ? 'rejected-subcell' : 'pending-subcell';
                cell.className += ` ${statusClass}`;

                if (level === 0) {
                    // Nível mais alto (ex.: Projeto)
                    const subCell = document.createElement('div');
                    subCell.className = 'subcell';
                    subCell.dataset.allocKey = `${key}-${monthKey}`;

                    const statusIcon = document.createElement('span');
                    statusIcon.className = 'status-icon';
                    statusIcon.textContent = alocs.every(alloc => alloc.status === 'aprovado') ? '✓' :
                                             alocs.some(alloc => alloc.status === 'reprovado') ? '✗' : '';
                    statusIcon.onclick = (e) => {
                        e.stopPropagation();
                        toggleCellStatus(item, monthKey, null, true, level, statusIcon);
                    };
                    subCell.appendChild(statusIcon);

                    const allocText = document.createElement('span');
                    allocText.className = 'alloc-text';
                    allocText.textContent = item.name;
                    subCell.appendChild(allocText);

                    subCellContainer.appendChild(subCell);

                    // Exibir subníveis (Colaboradores)
                    const subLevel = hierarchy[1];
                    const subItems = {};
                    alocs.forEach(alloc => {
                        const subKey = alloc[subLevel.toLowerCase()];
                        if (!subItems[subKey]) {
                            subItems[subKey] = [];
                        }
                        subItems[subKey].push(alloc);
                    });

                    Object.keys(subItems).forEach(subKey => {
                        const subAlocs = subItems[subKey];
                        const subStatusClass = subAlocs.every(alloc => alloc.status === 'aprovado') ? 'approved-subcell' :
                                              subAlocs.some(alloc => alloc.status === 'reprovado') ? 'rejected-subcell' : 'pending-subcell';
                        const subCell = document.createElement('div');
                        subCell.className = `subcell sublevel-1 ${subStatusClass}`;
                        subCell.dataset.allocKey = `${key}-${monthKey}-${subKey}`;

                        const subStatusIcon = document.createElement('span');
                        subStatusIcon.className = 'status-icon';
                        subStatusIcon.textContent = subAlocs.every(alloc => alloc.status === 'aprovado') ? '✓' :
                                                    subAlocs.some(alloc => alloc.status === 'reprovado') ? '✗' : '';
                        subStatusIcon.onclick = (e) => {
                            e.stopPropagation();
                            toggleSubLevelStatus(item, monthKey, subKey, subAlocs, level + 1, subStatusIcon);
                        };
                        subCell.appendChild(subStatusIcon);

                        const subAllocText = document.createElement('span');
                        subAllocText.className = 'alloc-text';
                        subAllocText.textContent = subKey;
                        subCell.appendChild(subAllocText);

                        subCellContainer.appendChild(subCell);

                        // Exibir sub-subníveis (Atividades)
                        const subSubLevel = hierarchy[2];
                        const subSubItems = {};
                        subAlocs.forEach(alloc => {
                            const subSubKey = alloc[subSubLevel.toLowerCase()];
                            if (!subSubItems[subSubKey]) {
                                subSubItems[subSubKey] = [];
                            }
                            subSubItems[subSubKey].push(alloc);
                        });

                        Object.keys(subSubItems).forEach(subSubKey => {
                            const subSubAlocs = subSubItems[subSubKey];
                            const subSubStatusClass = subSubAlocs.every(alloc => alloc.status === 'aprovado') ? 'approved-subcell' :
                                                     subSubAlocs.some(alloc => alloc.status === 'reprovado') ? 'rejected-subcell' : 'pending-subcell';
                            const subSubCell = document.createElement('div');
                            subSubCell.className = `subcell sublevel-2 ${subSubStatusClass}`;
                            subSubCell.dataset.allocKey = `${key}-${monthKey}-${subKey}-${subSubKey}`;

                            const subSubStatusIcon = document.createElement('span');
                            subSubStatusIcon.className = 'status-icon';
                            subSubStatusIcon.textContent = subSubAlocs.every(alloc => alloc.status === 'aprovado') ? '✓' :
                                                           subSubAlocs.some(alloc => alloc.status === 'reprovado') ? '✗' : '';
                            subSubStatusIcon.onclick = (e) => {
                                e.stopPropagation();
                                toggleSubSubLevelStatus(item, monthKey, subKey, subSubKey, subSubAlocs, subSubStatusIcon);
                            };
                            subSubCell.appendChild(subSubStatusIcon);

                            const subSubAllocText = document.createElement('span');
                            subSubAllocText.className = 'alloc-text';
                            subSubAllocText.textContent = subSubAlocs.map(alloc => `${alloc.percentage}% ${alloc.projeto} - ${alloc.atividade}`).join(', ');
                            if (subSubAlocs[0].justificativa) {
                                subSubAllocText.setAttribute('title', `Justificativa: ${subSubAlocs[0].justificativa}`);
                            }
                            subSubCell.appendChild(subSubAllocText);

                            if (subSubAlocs[0].justificativa) {
                                const editBtn = document.createElement('span');
                                editBtn.className = 'edit-icon';
                                editBtn.textContent = '✎';
                                editBtn.onclick = (e) => {
                                    e.stopPropagation();
                                    editJustificativa(item, monthKey, subSubAlocs[0]);
                                };
                                subSubCell.appendChild(editBtn);
                            }

                            subCellContainer.appendChild(subSubCell);
                        });
                    });
                } else if (level === 1) {
                    // Nível intermediário (ex.: Colaborador)
                    const subCell = document.createElement('div');
                    subCell.className = 'subcell';
                    subCell.dataset.allocKey = `${key}-${monthKey}`;

                    const statusClass = alocs.every(alloc => alloc.status === 'aprovado') ? 'approved-subcell' :
                                      alocs.some(alloc => alloc.status === 'reprovado') ? 'rejected-subcell' : 'pending-subcell';
                    subCell.className += ` ${statusClass}`;

                    const statusIcon = document.createElement('span');
                    statusIcon.className = 'status-icon';
                    statusIcon.textContent = alocs.every(alloc => alloc.status === 'aprovado') ? '✓' :
                                             alocs.some(alloc => alloc.status === 'reprovado') ? '✗' : '';
                    statusIcon.onclick = (e) => {
                        e.stopPropagation();
                        toggleCellStatus(item, monthKey, null, true, level, statusIcon);
                    };
                    subCell.appendChild(statusIcon);

                    const allocText = document.createElement('span');
                    allocText.className = 'alloc-text';
                    allocText.textContent = item.name;
                    subCell.appendChild(allocText);

                    subCellContainer.appendChild(subCell);

                    // Exibir subníveis (Atividades)
                    const subLevel = hierarchy[2];
                    const subItems = {};
                    alocs.forEach(alloc => {
                        const subKey = alloc[subLevel.toLowerCase()];
                        if (!subItems[subKey]) {
                            subItems[subKey] = [];
                        }
                        subItems[subKey].push(alloc);
                    });

                    Object.keys(subItems).forEach(subKey => {
                        const subAlocs = subItems[subKey];
                        const subStatusClass = subAlocs.every(alloc => alloc.status === 'aprovado') ? 'approved-subcell' :
                                              alocs.some(alloc => alloc.status === 'reprovado') ? 'rejected-subcell' : 'pending-subcell';
                        const subCell = document.createElement('div');
                        subCell.className = `subcell sublevel-2 ${subStatusClass}`;
                        subCell.dataset.allocKey = `${key}-${monthKey}-${subKey}`;

                        const subStatusIcon = document.createElement('span');
                        subStatusIcon.className = 'status-icon';
                        subStatusIcon.textContent = subAlocs.every(alloc => alloc.status === 'aprovado') ? '✓' :
                                                    subAlocs.some(alloc => alloc.status === 'reprovado') ? '✗' : '';
                        subStatusIcon.onclick = (e) => {
                            e.stopPropagation();
                            toggleSubLevelStatus(item, monthKey, subKey, subAlocs, level + 1, subStatusIcon);
                        };
                        subCell.appendChild(subStatusIcon);

                        const subAllocText = document.createElement('span');
                        subAllocText.className = 'alloc-text';
                        subAllocText.textContent = subAlocs.map(alloc => `${alloc.percentage}% ${alloc.projeto} - ${alloc.atividade}`).join(', ');
                        if (subAlocs[0].justificativa) {
                            subAllocText.setAttribute('title', `Justificativa: ${subAlocs[0].justificativa}`);
                        }
                        subCell.appendChild(subAllocText);

                        if (subAlocs[0].justificativa) {
                            const editBtn = document.createElement('span');
                            editBtn.className = 'edit-icon';
                            editBtn.textContent = '✎';
                            editBtn.onclick = (e) => {
                                e.stopPropagation();
                                editJustificativa(item, monthKey, subAlocs[0]);
                            };
                            subCell.appendChild(editBtn);
                        }

                        subCellContainer.appendChild(subCell);
                    });
                } else if (level === 2) {
                    // Nível mais baixo (ex.: Atividade)
                    alocs.forEach((alloc, allocIndex) => {
                        const subCell = document.createElement('div');
                        subCell.className = 'subcell';
                        subCell.dataset.allocKey = `${key}-${monthKey}-${allocIndex}`;

                        const statusClass = alloc.status === 'aprovado' ? 'approved-subcell' :
                                          alloc.status === 'reprovado' ? 'rejected-subcell' : 'pending-subcell';
                        subCell.className += ` ${statusClass}`;

                        const statusIcon = document.createElement('span');
                        statusIcon.className = 'status-icon';
                        statusIcon.textContent = alloc.status === 'aprovado' ? '✓' :
                                                 alloc.status === 'reprovado' ? '✗' : '';
                        statusIcon.onclick = (e) => {
                            e.stopPropagation();
                            toggleCellStatus(item, monthKey, allocIndex, false, level, statusIcon);
                        };
                        subCell.appendChild(statusIcon);

                        const allocText = document.createElement('span');
                        allocText.className = 'alloc-text';
                        allocText.textContent = `${alloc.percentage}% ${alloc.projeto} - ${alloc.atividade}`;
                        if (alloc.justificativa) {
                            allocText.setAttribute('title', `Justificativa: ${alloc.justificativa}`);
                        }
                        subCell.appendChild(allocText);

                        if (alloc.justificativa) {
                            const editBtn = document.createElement('span');
                            editBtn.className = 'edit-icon';
                            editBtn.textContent = '✎';
                            editBtn.onclick = (e) => {
                                e.stopPropagation();
                                editJustificativa(item, monthKey, alloc);
                            };
                            subCell.appendChild(editBtn);
                        }

                        subCellContainer.appendChild(subCell);
                    });
                }
            }

            cell.appendChild(subCellContainer);
            row.appendChild(cell);
        }

        tbody.appendChild(row);

        const childRow = document.createElement('tr');
        childRow.className = `children level-${level + 1}`;
        childRow.id = `children-${key}`;
        childRow.style.display = 'none';
        const childCell = document.createElement('td');
        childCell.colSpan = 14;
        const childTable = document.createElement('table');
        childTable.className = 'sub-table';
        const childTbody = document.createElement('tbody');
        childTable.appendChild(childTbody);
        childCell.appendChild(childTable);
        childRow.appendChild(childCell);
        tbody.appendChild(childRow);
    });
}

function toggleCellStatus(item, monthKey, allocIndex, propagate, level, iconElement) {
    if (item.alocacoes && item.alocacoes[monthKey]) {
        let newStatus = 'pendente';
        if (allocIndex !== null) {
            const alloc = item.alocacoes[monthKey][allocIndex];
            if (alloc.status === 'pendente') {
                newStatus = 'aprovado';
            } else if (alloc.status === 'aprovado') {
                newStatus = 'reprovado';
                currentJustificativaTarget = { item, monthKey, alloc: alloc };
                const modal = document.getElementById('justificativa-modal');
                const textArea = document.getElementById('justificativa-text');
                textArea.value = alloc.justificativa || '';
                modal.style.display = 'block';
                return;
            } else {
                newStatus = 'pendente';
                alloc.justificativa = '';
            }
            alloc.status = newStatus;
        } else if (propagate) {
            const currentStatus = item.alocacoes[monthKey].every(alloc => alloc.status === 'aprovado') ? 'aprovado' :
                                 item.alocacoes[monthKey].every(alloc => alloc.status === 'reprovado') ? 'reprovado' : 'pendente';
            if (currentStatus === 'pendente') {
                newStatus = 'aprovado';
            } else if (currentStatus === 'aprovado') {
                newStatus = 'reprovado';
                currentJustificativaTarget = { item, monthKey, alloc: null, propagate: true };
                const modal = document.getElementById('justificativa-modal');
                const textArea = document.getElementById('justificativa-text');
                textArea.value = '';
                modal.style.display = 'block';
                return;
            } else {
                newStatus = 'pendente';
            }

            let shouldPropagate = false;
            if (level < 2) {
                shouldPropagate = confirm('Deseja aplicar essa ação a todos os itens abaixo?');
            }

            item.alocacoes[monthKey].forEach(alloc => {
                alloc.status = newStatus;
                if (newStatus !== 'reprovado') {
                    alloc.justificativa = '';
                }
            });

            if (shouldPropagate && item.children) {
                propagateAction(item.children, monthKey, newStatus);
            }
        }
    }
    saveApprovals();
    renderTable();
}

function toggleSubLevelStatus(item, monthKey, subKey, subAlocs, level, iconElement) {
    let newStatus = 'pendente';
    const currentStatus = subAlocs.every(alloc => alloc.status === 'aprovado') ? 'aprovado' :
                         subAlocs.every(alloc => alloc.status === 'reprovado') ? 'reprovado' : 'pendente';
    if (currentStatus === 'pendente') {
        newStatus = 'aprovado';
    } else if (currentStatus === 'aprovado') {
        newStatus = 'reprovado';
        currentJustificativaTarget = { item, monthKey, alloc: null, propagate: true, subAlocs: subAlocs };
        const modal = document.getElementById('justificativa-modal');
        const textArea = document.getElementById('justificativa-text');
        textArea.value = '';
        modal.style.display = 'block';
        return;
    } else {
        newStatus = 'pendente';
    }

    let shouldPropagate = false;
    if (level < 2) {
        shouldPropagate = confirm('Deseja aplicar essa ação a todos os itens abaixo?');
    }

    subAlocs.forEach(alloc => {
        alloc.status = newStatus;
        if (newStatus !== 'reprovado') {
            alloc.justificativa = '';
        }
    });

    if (shouldPropagate && item.children) {
        propagateAction(item.children, monthKey, newStatus);
    }

    saveApprovals();
    renderTable();
}

function toggleSubSubLevelStatus(item, monthKey, subKey, subSubKey, subSubAlocs, iconElement) {
    let newStatus = 'pendente';
    const currentStatus = subSubAlocs.every(alloc => alloc.status === 'aprovado') ? 'aprovado' :
                         subSubAlocs.every(alloc => alloc.status === 'reprovado') ? 'reprovado' : 'pendente';
    if (currentStatus === 'pendente') {
        newStatus = 'aprovado';
    } else if (currentStatus === 'aprovado') {
        newStatus = 'reprovado';
        currentJustificativaTarget = { item, monthKey, alloc: subSubAlocs[0] };
        const modal = document.getElementById('justificativa-modal');
        const textArea = document.getElementById('justificativa-text');
        textArea.value = subSubAlocs[0].justificativa || '';
        modal.style.display = 'block';
        return;
    } else {
        newStatus = 'pendente';
        subSubAlocs.forEach(alloc => {
            alloc.justificativa = '';
        });
    }

    subSubAlocs.forEach(alloc => {
        alloc.status = newStatus;
    });

    saveApprovals();
    renderTable();
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

function submitJustificativa() {
    const textArea = document.getElementById('justificativa-text');
    const justificativa = textArea.value.trim();
    if (!justificativa) {
        alert('A justificativa é obrigatória.');
        return;
    }

    if (currentJustificativaTarget) {
        const { item, monthKey, alloc, propagate, subAlocs } = currentJustificativaTarget;
        if (alloc) {
            alloc.status = 'reprovado';
            alloc.justificativa = justificativa;
        } else if (propagate && subAlocs) {
            subAlocs.forEach(alloc => {
                alloc.status = 'reprovado';
                alloc.justificativa = justificativa;
            });
            if (item.children) {
                propagateAction(item.children, monthKey, 'reprovado');
            }
        } else if (propagate) {
            item.alocacoes[monthKey].forEach(alloc => {
                alloc.status = 'reprovado';
                alloc.justificativa = justificativa;
            });
            if (item.children) {
                propagateAction(item.children, monthKey, 'reprovado');
            }
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
        <span class="hierarchy-level">${hierarchy[0]}</span>
        <span> ⬇ > </span>
        <span class="hierarchy-level">${hierarchy[1]}</span>
        <span> ⬇ > </span>
        <span class="hierarchy-level">${hierarchy[2]}</span>
    `;
}

function filtrar() {
    const gestor = document.getElementById('gestor').value;
    const perfil = document.getElementById('perfil').value;
    const busca = document.getElementById('busca').value.toLowerCase();
    const periodo = document.getElementById('periodo').value;
    const mesInicio = parseInt(document.getElementById('mes-inicio').value) || 1;
    const mesFim = parseInt(document.getElementById('mes-fim').value) || 12;

    let filteredData = data.filter(item => {
        const matchesGestor = gestor === 'Gestor' || item.Colaborador === gestor;
        const matchesPerfil = perfil === '' || usuarios[perfil]?.includes(item.Colaborador);
        const matchesBusca = busca === '' || 
            item.Colaborador.toLowerCase().includes(busca) || 
            item.Projeto.toLowerCase().includes(busca) || 
            item.Atividade.toLowerCase().includes(busca);
        return matchesGestor && matchesPerfil && matchesBusca;
    });

    filteredData = filteredData.map(item => {
        const newItem = { ...item, alocacoes: {} };
        Object.keys(item.alocacoes).forEach(month => {
            const monthNum = parseInt(month.split('-')[1]);
            if (monthNum >= mesInicio && monthNum <= mesFim) {
                newItem.alocacoes[month] = item.alocacoes[month];
            }
        });
        return newItem;
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

document.getElementById('gestor').addEventListener('change', updateAutocomplete);
document.getElementById('perfil').addEventListener('change', updateAutocomplete);