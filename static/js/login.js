let usuarios = {};

// Carrega os dados do usuarios.json
fetch('/static/usuarios.json')
  .then(response => response.json())
  .then(data => {
    usuarios = data;
    updateAutocomplete();
  })
  .catch(error => console.error('Erro ao carregar usuarios.json:', error));

function updateAutocomplete() {
  const profile = document.getElementById('profile').value;
  const usernameList = document.getElementById('username-list');
  usernameList.innerHTML = '';

  if (profile && usuarios[profile]) {
    usuarios[profile].forEach(user => {
      const option = document.createElement('option');
      option.value = user;
      usernameList.appendChild(option);
    });
  }
}

function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const profile = document.getElementById('profile').value;

  // Validação
  if (!profile || !username || password !== 'Leonardo Lima Sanches') {
    alert('Credenciais inválidas. A senha padrão é "Leonardo Lima Sanches".');
    return;
  }

  // Armazena o nome do usuário logado
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('username', username);
  // Redireciona para dashboard.html
  window.location.href = '/static/dashboard.html';
}
