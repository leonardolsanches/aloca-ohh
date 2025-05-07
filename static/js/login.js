// Lista de usuários por perfil
const usersByProfile = {
    "Colaborador": [
        "AGOSTINHO AYRES CARDOSO DE PINHO",
        "LEONARDO LIMA SANCHES"
    ],
    "Terceiro": [],
    "Gestor": [
        "ANA LUCIA ANTUNES DE ARAUJO",
        "admin"
    ]
};

function filterUsers() {
    const perfil = document.getElementById('perfil').value;
    const datalist = document.getElementById('nomes');
    datalist.innerHTML = ''; // Limpa as opções existentes

    if (perfil && usersByProfile[perfil]) {
        usersByProfile[perfil].forEach(user => {
            const option = document.createElement('option');
            option.value = user;
            datalist.appendChild(option);
        });
    } else {
        // Se nenhum perfil for selecionado, limpa as opções
        datalist.innerHTML = '';
    }
}

document.querySelector('form').addEventListener('submit', (e) => {
    const bypass = e.submitter.name === 'bypass';
    if (bypass) return;

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const perfil = document.getElementById('perfil').value;

    if (!username || !password || !perfil) {
        e.preventDefault();
        alert('Preencha nome completo, senha e perfil.');
    }
});
