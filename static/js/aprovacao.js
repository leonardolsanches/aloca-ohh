let hierarchy = ['colaborador', 'projeto', 'atividade'];

async function loadAprovacao() {
    const response = await fetch('/carregar_historico');
    const alocacoes = await response.json();
    const tableBody = document.getElementById('aprovacao-table');
    tableBody.innerHTML = '';

    const colaboradores = [...new Set(alocacoes.map(aloc => aloc.colaborador))];
    for (const colaborador of colaboradores) {
        const row = document.createElement('tr');
        const colAloc = alocacoes.filter(a => a.colaborador === colaborador);
        row.innerHTML = `<td>${colaborador}</td>`;
        for (let mes = 1; mes <= 12; mes++) {
            const mesStr = `2025-${String(mes).padStart(2, '0')}`;
            const alocMes = colAloc.find(a => a.mes === mesStr);
            const percent = alocMes ? (alocMes.horas * 100).toFixed(0) : 0;
            const cell = document.createElement('td');
            cell.innerHTML = `
                ${percent}%
                <button onclick="aprovar('${colaborador}', '${mesStr}')">✔</button>
                <button onclick="showJustificativa('${colaborador}', '${mesStr}')">✖</button>
            `;
            if (alocMes && alocMes.justificativa) {
                const tooltip = document.createElement('span');
                tooltip.className = 'tooltip';
                tooltip.textContent = alocMes.justificativa;
                cell.appendChild(tooltip);
            }
            row.appendChild(cell);
        }
        tableBody.appendChild(row);
    }
}

function toggleHierarchy(level) {
    const index = hierarchy.indexOf(level);
    if (index > -1) {
        hierarchy = hierarchy.slice(0, index + 1).reverse().concat(hierarchy.slice(index + 1));
    }
    loadAprovacao();
}

function aprovar(colaborador, mes) {
    fetch('/aprovar_alocacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colaborador, mes, projeto: 'CAUSA RAIZ' })
    }).then(() => loadAprovacao());
}

function showJustificativa(colaborador, mes) {
    const justificativa = prompt('Insira a justificativa para reprovação:');
    if (justificativa) {
        fetch('/reprovar_alocacao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ colaborador, mes, projeto:
