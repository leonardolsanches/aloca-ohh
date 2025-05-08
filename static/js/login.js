function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const profile = document.getElementById('profile').value;

  // Validação simples (para teste)
  if (username === 'admin' && password === 'password' && profile) {
    // Redireciona para alocacao.html na pasta templates
    window.location.href = '/templates/alocacao.html';
  } else {
    alert('Credenciais inválidas. Use "admin" como usuário e senha, e selecione um perfil.');
  }
}
