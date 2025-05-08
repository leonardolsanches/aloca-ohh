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

function bypassLogin() {
  // Redireciona para alocacao.html sem autenticação
  window.location.href = '/alocacao';
}
