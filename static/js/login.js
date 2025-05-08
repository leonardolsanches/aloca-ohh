function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const profile = document.getElementById('profile').value;

  // Validação simples (para teste)
  if (username === 'admin' && password === 'password' && profile) {
    // Armazena estado de autenticação
    localStorage.setItem('isAuthenticated', 'true');
    // Redireciona para alocacao.html
    window.location.href = '/static/alocacao.html';
  } else {
    alert('Credenciais inválidas. Use "admin" como usuário e senha, e selecione um perfil.');
  }
}
