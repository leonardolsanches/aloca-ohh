let hierarchy = ['colaborador', 'projeto', 'atividade'];
let expanded = {};

async function loadHistorico() {
    const response = await fetch('/carregar_historico');
    const alocacoes = await response.json();
    const container = document.getElementById('historico-table');
    container.innerHTML = '';

    const grouped = alocacoes.reduce((acc, aloc) => {
        let key = hierarchy[0];
        if (!acc[aloc[key]]) acc[aloc[key]] = {};
        key = hierarchy[1];
        if (!acc[aloc[hierarchy[0]]][aloc[key]]) acc[aloc[hierarchy[0]]][aloc[key]] = {};
        key = hierarchy[2];
        if (!acc[aloc[hierarchy[0]]][aloc[hierarchy[1]]][aloc[key]]) acc[aloc[hierarchy[0]]][aloc[hierarchy[1]]][aloc[key]] = [];
        acc[aloc[hierarchy[0]]][aloc[hierarchy[1]]][aloc[key]].push(aloc);
        return acc;
    }, {});

    for (const colaborador in grouped) {
        const div = document.createElement('div');
        div.innerHTML = `<h3>${colaborador} <button onclick="toggleExpand('${colaborador}')">+</button></h3>`;
        if (expanded[colaborador]) {
            for (const projeto in grouped[colaborador]) {
                const pDiv = document.createElement('div');
                pDiv.innerHTML = `<h4>${projeto}</h4>`;
                for (const atividade in grouped[colaborador][projeto]) {
                    const aDiv = document.createElement('div');
                    aDiv.innerHTML = `${atividade}: ${grouped[colaborador][projeto][atividade].length} registros`;
                    pDiv.appendChild(aDiv);
                }
                div.appendChild(pDiv);
            }
        }
        container.appendChild(div);
    }
}

function toggleExpand(colaborador) {
    expanded[colaborador] = !expanded[colaborador];
    loadHistorico();
}

function toggleHierarchy() {
    hierarchy = hierarchy.reverse();
    loadHistorico();
}

document.getElementById('filtrar').addEventListener('click', loadHistorico);
loadHistorico();
