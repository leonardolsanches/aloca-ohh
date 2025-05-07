// Armazenamento global das seleções por mês
let selectionsByMonth = {};
let currentDate = new Date(2025, 0, 1);
let isCtrlPressed = false;
let isShiftPressed = false;
let lastSelectedDay = null;

// Detecta eventos de toque para dispositivos móveis
let touchStartX = 0;
let touchStartY = 0;
let touchMoved = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'Control') isCtrlPressed = true;
    if (e.key === 'Shift') isShiftPressed = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Control') isCtrlPressed = false;
    if (e.key === 'Shift') isShiftPressed = false;
});

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchMoved = false;
});

document.addEventListener('touchmove', (e) => {
    const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
    if (deltaX > 10 || deltaY > 10) {
        touchMoved = true;
    }
});

async function renderCalendar() {
    const calendarBody = document.getElementById('calendar-body');
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const mesAno = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('mes-ano').textContent = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());

    // Carrega seleções existentes para o mês atual
    let selectedDays = selectionsByMonth[mesAno] || [];

    const response = await fetch(`/carregar_alocacoes?mes_ano=${mesAno}`);
    const alocacoes = await response.json();

    calendarBody.innerHTML = '';
    let dayCounter = 1;

    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'calendar-row';
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            if (i === 0 && j < firstDay) {
                cell.textContent = '';
            } else if (dayCounter <= daysInMonth) {
                cell.textContent = dayCounter;
                cell.dataset.day = dayCounter;
                cell.dataset.date = `${mesAno}-${String(dayCounter).padStart(2, '0')}`;
                const tooltip = document.createElement('span');
                tooltip.className = 'tooltip';
                tooltip.textContent = 'Clique para selecionar';
                cell.appendChild(tooltip);
                cell.addEventListener('click', selectDay);
                cell.addEventListener('touchend', (e) => {
                    if (!touchMoved) {
                        selectDay(e);
                    }
                });
                const data = `${mesAno}-${String(dayCounter).padStart(2, '0')}`;
                const percent = alocacoes[data] || 0;
                cell.dataset.percent = Math.round(percent);
                updateCellColor(cell);
                if (selectedDays.includes(dayCounter.toString())) {
                    cell.classList.add('selected');
                }
                dayCounter++;
            }
            row.appendChild(cell);
        }
        calendarBody.appendChild(row);
    }

    // Atualiza a contagem de dias selecionados
    updateSelectedDaysCount();
}

function selectDay(e) {
    e.preventDefault();
    const day = e.target.dataset.day;
    if (!day) return;

    const mesAno = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    let selectedDays = selectionsByMonth[mesAno] || [];

    if (isCtrlPressed) {
        if (selectedDays.includes(day)) {
            selectedDays = selectedDays.filter(d => d !== day);
        } else {
            selectedDays.push(day);
        }
    } else if (isShiftPressed && lastSelectedDay) {
        const start = Math.min(parseInt(lastSelectedDay), parseInt(day));
        const end = Math.max(parseInt(lastSelectedDay), parseInt(day));
        selectedDays = [];
        for (let i = start; i <= end; i++) {
            selectedDays.push(i.toString());
        }

        // Atualizar os campos de data-inicio e data-fim
        const dataInicio = `${mesAno}-${String(start).padStart(2, '0')}`;
        const dataFim = `${mesAno}-${String(end).padStart(2, '0')}`;
        document.getElementById('data-inicio').value = dataInicio;
        document.getElementById('data-fim').value = dataFim;
    } else {
        if (selectedDays.includes(day)) {
            selectedDays = selectedDays.filter(d => d !== day);
        } else {
            selectedDays = [day];
        }
        // Limpar os campos de data-inicio e data-fim se não for uma seleção sequencial
        document.getElementById('data-inicio').value = '';
        document.getElementById('data-fim').value = '';
    }
    lastSelectedDay = day;
    selectionsByMonth[mesAno] = selectedDays;

    document.querySelectorAll('.calendar-cell').forEach(cell => {
        if (cell.dataset.day && selectedDays.includes(cell.dataset.day)) {
            cell.classList.add('selected');
        } else {
            cell.classList.remove('selected');
        }
    });

    // Atualiza a contagem de dias selecionados
    updateSelectedDaysCount();
}

function updateCellColor(cell) {
    const percent = parseInt(cell.dataset.percent) || 0;
    if (percent > 100) {
        cell.style.backgroundColor = '#ffcccc'; // Vermelho
    } else if (percent < 100 && percent > 0) {
        cell.style.backgroundColor = '#ffffcc'; // Amarelo
    } else if (percent === 100) {
        cell.style.backgroundColor = '#ccffcc'; // Verde
    }
    cell.querySelector('.tooltip').textContent = `${percent}% alocado`;
}

function mudarMes(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    renderCalendar();
}

function updateSelectedDaysCount() {
    let totalDays = 0;
    for (const month in selectionsByMonth) {
        totalDays += selectionsByMonth[month].length;
    }
    document.getElementById('selected-days-count').textContent = totalDays;
}

async function updateProjetos() {
    const tipo = document.getElementById('tipo-entregavel').value;
    const projetoSelect = document.getElementById('projeto');
    projetoSelect.disabled = false;
    projetoSelect.innerHTML = '<option value="">Projeto</option>';

    const response = await fetch('/carregar_historico');
    const alocacoes = await response.json();
    const projetos = [...new Set(alocacoes.map(aloc => aloc.projeto))].sort();
    
    projetos.forEach(proj => {
        const option = document.createElement('option');
        option.value = proj;
        option.textContent = proj;
        projetoSelect.appendChild(option);
    });
}

async function updateAtividades() {
    const projeto = document.getElementById('projeto').value;
    const atividadeSelect = document.getElementById('atividade');
    atividadeSelect.disabled = false;
    atividadeSelect.innerHTML = '<option value="">Atividade</option>';

    const response = await fetch('/carregar_historico');
    const alocacoes = await response.json();
    const atividades = [...new Set(alocacoes
        .filter(aloc => aloc.projeto === projeto)
        .map(aloc => aloc.atividade)
    )].sort();

    atividades.forEach(ativ => {
        const option = document.createElement('option');
        option.value = ativ;
        option.textContent = ativ;
        atividadeSelect.appendChild(option);
    });
}

function aplicarAlocacao() {
    const tipo = document.getElementById('tipo-entregavel').value;
    const projeto = document.getElementById('projeto').value;
    const atividade = document.getElementById('atividade').value;
    const percentual = document.getElementById('percentual').value;

    if (!tipo || !projeto || !atividade || !percentual || Object.keys(selectionsByMonth).length === 0) {
        alert('Preencha todos os campos e selecione pelo menos um dia.');
        return;
    }

    // Prepara as seleções para envio
    let allSelectedDates = [];
    for (const month in selectionsByMonth) {
        const days = selectionsByMonth[month];
        days.forEach(day => {
            allSelectedDates.push(`${month}-${String(day).padStart(2, '0')}`);
        });
    }

    const alocacao = {
        tipo_recurso: tipo,
        projeto: projeto,
        atividade: atividade,
        percentual: parseInt(percentual),
        dias: allSelectedDates
    };

    fetch('/salvar_alocacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alocacao)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Alocação salva com sucesso!');
            selectionsByMonth = {}; // Limpa as seleções após salvar
            document.getElementById('data-inicio').value = '';
            document.getElementById('data-fim').value = '';
            renderCalendar();
        } else {
            alert('Erro ao salvar alocação.');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao salvar alocação.');
    });
}

renderCalendar();
