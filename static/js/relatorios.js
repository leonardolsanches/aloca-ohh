async function loadRelatorios() {
    const response = await fetch('/carregar_relatorios');
    const relatorios = await response.json();
    const container = document.getElementById('relatorios-table');
    container.innerHTML = '<table><thead><tr><th>Colaborador</th><th>Mês</th><th>Horas</th></tr></thead><tbody></tbody></table>';

    const tbody = container.querySelector('tbody');
    relatorios.forEach(rel => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${rel.colaborador}</td><td>${rel.mes}</td><td>${(rel.horas * 100).toFixed(2)}%</td>`;
        tbody.appendChild(row);
    });
}

loadRelatorios();
