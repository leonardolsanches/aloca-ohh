    let gestores = [];
    let data = [];
    let hierarchy = ['Colaborador', 'Projeto', 'Atividade'];
    let currentJustificativaTarget = null;
    let usuarios = {};
    let lastSelectedCell = null;

    // Obter o username da URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentUser = urlParams.get('username') || 'Convidado';
    console.log('Usuário atual obtido da URL:', currentUser);

    // Dados simulados para teste (mock)
    const mockData = [
    {
        Colaborador: "João Silva",
        Projeto: "Projeto A",
        Atividade: "Atividade 1",
        alocacoes: {
        '2025-01': [
            { percentage: 55, projeto: "Projeto A", atividade: "Atividade 1", status: 'pendente', justificativa: '' }
        ],
        '2025-02': [
            { percentage: 48, projeto: "Projeto A", atividade: "Atividade 1", status: 'pendente', justificativa: '' }
        ],
        '2025-03': [
            { percentage: 60, projeto: "Projeto A", atividade: "Atividade 1", status: 'pendente', justificativa: '' }
        ],
        '2025-04': [
            { percentage: 70, projeto: "Projeto A", atividade: "Atividade 1", status: 'pendente', justificativa: '' }
        ],
        '2025-05': [
            { percentage: 65, projeto: "Projeto A", atividade: "Atividade 1", status: 'pendente', justificativa: '' }
        ],
        '2025-06': [
            { percentage: 50, projeto: "Projeto A", atividade: "Atividade 1", status: 'pendente', justificativa: '' }
        ]
        }
    },
    {
        Colaborador: "João Silva",
        Projeto: "Projeto A",
        Atividade: "Atividade 2",
        alocacoes: {
        '2025-01': [
            { percentage: 37, projeto: "Projeto A", atividade: "Atividade 2", status: 'pendente', justificativa: '' }
        ],
        '2025-03': [
            { percentage: 50, projeto: "Projeto A", atividade: "Atividade 2", status: 'pendente', justificativa: '' }
        ],
        '2025-05': [
            { percentage: 65, projeto: "Projeto A", atividade: "Atividade 2", status: 'pendente', justificativa: '' }
        ],
        '2025-07': [
            { percentage: 70, projeto: "Projeto A", atividade: "Atividade 2", status: 'pendente', justificativa: '' }
        ]
        }
    },
    {
        Colaborador: "João Silva",
        Projeto: "Projeto B",
        Atividade: "Atividade 3",
        alocacoes: {
        '2025-02': [
            { percentage: 80, projeto: "Projeto B", atividade: "Atividade 3", status: 'pendente', justificativa: '' }
        ],
        '2025-04': [
            { percentage: 90, projeto: "Projeto B", atividade: "Atividade 3", status: 'pendente', justificativa: '' }
        ],
        '2025-06': [
            { percentage: 100, projeto: "Projeto B", atividade: "Atividade 3", status: 'pendente', justificativa: '' }
        ],
        '2025-08': [
            { percentage: 60, projeto: "Projeto B", atividade: "Atividade 3", status: 'pendente', justificativa: '' }
        ]
        }
    },
    {
        Colaborador: "João Silva",
        Projeto: "Projeto B",
        Atividade: "Atividade 4",
        alocacoes: {
        '2025-03': [
            { percentage: 45, projeto: "Projeto B", atividade: "Atividade 4", status: 'pendente', justificativa: '' }
        ],
        '2025-05': [
            { percentage: 70, projeto: "Projeto B", atividade: "Atividade 4", status: 'pendente', justificativa: '' }
        ],
        '2025-07': [
            { percentage: 85, projeto: "Projeto B", atividade: "Atividade 4", status: 'pendente', justificativa: '' }
        ],
        '2025-09': [
            { percentage: 55, projeto: "Projeto B", atividade: "Atividade 4", status: 'pendente', justificativa: '' }
        ]
        }
    },
    {
        Colaborador: "Maria Oliveira",
        Projeto: "Projeto C",
        Atividade: "Atividade 5",
        alocacoes: {
        '2025-01': [
            { percentage: 45, projeto: "Projeto C", atividade: "Atividade 5", status: 'pendente', justificativa: '' }
        ],
        '2025-03': [
            { percentage: 60, projeto: "Projeto C", atividade: "Atividade 5", status: 'pendente', justificativa: '' }
        ],
        '2025-05': [
            { percentage: 70, projeto: "Projeto C", atividade: "Atividade 5", status: 'pendente', justificativa: '' }
        ],
        '2025-07': [
            { percentage: 80, projeto: "Projeto C", atividade: "Atividade 5", status: 'pendente', justificativa: '' }
        ]
        }
    },
    {
        Colaborador: "Maria Oliveira",
        Projeto: "Projeto C",
        Atividade: "Atividade 6",
        alocacoes: {
        '2025-02': [
            { percentage: 50, projeto: "Projeto C", atividade: "Atividade 6", status: 'pendente', justificativa: '' }
        ],
        '2025-04': [
            { percentage: 80, projeto: "Projeto C", atividade: "Atividade 6", status: 'pendente', justificativa: '' }
        ],
        '2025-06': [
            { percentage: 90, projeto: "Projeto C", atividade: "Atividade 6", status: 'pendente', justificativa: '' }
        ],
        '2025-08': [
            { percentage: 65, projeto: "Projeto C", atividade: "Atividade 6", status: 'pendente', justificativa: '' }
        ]
        }
    },
    {
        Colaborador: "Pedro Almeida",
        Projeto: "Projeto D",
        Atividade: "Atividade 7",
        alocacoes: {
        '2025-01': [
            { percentage: 40, projeto: "Projeto D", atividade: "Atividade 7", status: 'pendente', justificativa: '' }
        ],
        '2025-03': [
            { percentage: 55, projeto: "Projeto D", atividade: "Atividade 7", status: 'pendente', justificativa: '' }
        ],
        '2025-05': [
            { percentage: 60, projeto: "Projeto D", atividade: "Atividade 7", status: 'pendente', justificativa: '' }
        ],
        '2025-07': [
            { percentage: 75, projeto: "Projeto D", atividade: "Atividade 7", status: 'pendente', justificativa: '' }
        ]
        }
    },
    {
        Colaborador: "Pedro Almeida",
        Projeto: "Projeto D",
        Atividade: "Atividade 8",
        alocacoes: {
        '2025-02': [
            { percentage: 60, projeto: "Projeto D", atividade: "Atividade 8", status: 'pendente', justificativa: '' }
        ],
        '2025-04': [
            { percentage: 70, projeto: "Projeto D", atividade: "Atividade 8", status: 'pendente', justificativa: '' }
        ],
        '2025-06': [
            { percentage: 85, projeto: "Projeto D", atividade: "Atividade 8", status: 'pendente', justificativa: '' }
        ],
        '2025-08': [
            { percentage: 50, projeto: "Projeto D", atividade: "Atividade 8", status: 'pendente', justificativa: '' }
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

        renderTable();
        updateButtonStates();
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
            cell.className = 'month-cell';
            if (item.alocacoes && item.alocacoes[monthKey]) {
            const alocs = item.alocacoes[monthKey];
            const totalPercentage = alocs.reduce((sum, alloc) => sum + alloc.percentage, 0);
            const status = alocs[0].status;
            const statusClass = status === 'aprovado' ? 'approved' : status === 'reprovado' ? 'rejected' : 'pending';
            cell.className += ` ${statusClass}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'select-cell';
            checkbox.dataset.key = `${key}-${monthKey}`;
            checkbox.onclick = (e) => {
                e.stopPropagation();
                handleCellClick(e, key, monthKey);
            };
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
                editBtn.onclick = (e) => {
                e.stopPropagation();
                editJustificativa(item, monthKey);
                };
                cell.appendChild(editBtn);
            }

            cell.onclick = (e) => {
                if (e.target !== checkbox && !e.target.classList.contains('edit')) {
                checkbox.checked = !checkbox.checked;
                handleCellClick({ target: checkbox, shiftKey: e.shiftKey, ctrlKey: e.ctrlKey }, key, monthKey);
                }
            };
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

    renderRows(groupedData);
    }

    function groupData(data) {
    const grouped = {};

    data.forEach(item => {
        let colaboradorLevel = grouped;
        const colaboradorKey = item.Colaborador;
        if (!colaboradorLevel[colaboradorKey]) {
        colaboradorLevel[colaboradorKey] = { name: colaboradorKey, children: {}, alocacoes: null };
        }
        colaboradorLevel = colaboradorLevel[colaboradorKey].children;

        const projetoKey = item.Projeto;
        if (!colaboradorLevel[projetoKey]) {
        colaboradorLevel[projetoKey] = { name: projetoKey, children: {}, alocacoes: null };
        }
        colaboradorLevel = colaboradorLevel[projetoKey].children;

        const atividadeKey = item.Atividade;
        if (!colaboradorLevel[atividadeKey]) {
        colaboradorLevel[atividadeKey] = { name: atividadeKey, children: {}, alocacoes: item.alocacoes };
        }
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
        childTbody.innerHTML = '';
        const item = findItemByKey(data, key.split('-').map(Number));

        if (item && item.children && item.children.length > 0) {
        renderSubRows(item.children, childTbody, key);
        childrenRow.style.display = 'table-row';
        btn.textContent = '-';
        if (approveAllBtn) approveAllBtn.style.display = 'inline-block';
        if (rejectAllBtn) rejectAllBtn.style.display = 'inline-block';
        } else if (item.alocacoes && Object.keys(item.alocacoes).length > 0) {
        renderSubRows([item], childTbody, key);
        childrenRow.style.display = 'table-row';
        btn.textContent = '-';
        if (approveAllBtn) approveAllBtn.style.display = 'inline-block';
        if (rejectAllBtn) rejectAllBtn.style.display = 'inline-block';
        } else {
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
        cell.className = 'month-cell';
        if (item.alocacoes && item.alocacoes[monthKey]) {
            const alocs = item.alocacoes[monthKey];
            const totalPercentage = alocs.reduce((sum, alloc) => sum + alloc.percentage, 0);
            const status = alocs[0].status;
            const statusClass = status === 'aprovado' ? 'approved' : status === 'reprovado' ? 'rejected' : 'pending';
            cell.className += ` ${statusClass}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'select-cell';
            checkbox.dataset.key = `${key}-${monthKey}`;
            checkbox.onclick = (e) => {
            e.stopPropagation();
            handleCellClick(e, key, monthKey);
            };
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
            editBtn.onclick = (e) => {
                e.stopPropagation();
                editJustificativa(item, monthKey);
            };
            cell.appendChild(editBtn);
            }

            cell.onclick = (e) => {
            if (e.target !== checkbox && !e.target.classList.contains('edit')) {
                checkbox.checked = !checkbox.checked;
                handleCellClick({ target: checkbox, shiftKey: e.shiftKey, ctrlKey: e.ctrlKey }, key, monthKey);
            }
            };
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
        allCheckboxes.forEach(cb => {
        if (cb !== checkbox) {
            cb.checked = false;
        }
        });
        checkbox.checked = true;
        lastSelectedCell = { checkbox, index: currentIndex };
    } else if (isCtrlPressed) {
        checkbox.checked = !checkbox.checked;
        lastSelectedCell = { checkbox, index: currentIndex };
    } else if (isShiftPressed && lastSelectedCell) {
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
        checkbox.checked = false;
    });
    lastSelectedCell = null;
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

    function rejectAll(item) {
    if (item.alocacoes) {
        Object.keys(item.alocacoes).forEach(monthKey => {
        item.alocacoes[monthKey].forEach(alloc => {
            alloc.status = 'reprovado';
            alloc.justificativa = justificativa;
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
            const checkbox = document.querySelector(`.select-cell[data-key="${cellKey}"]`);
            if (checkbox) checkbox.checked = false;
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
    lastSelectedCell = null;
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