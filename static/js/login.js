document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const userType = document.getElementById('user-type').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Validação de campos
  if (!userType || !username || !password) {
    if (!password) {
      alert('A senha não pode estar em branco. Por favor, insira a senha.');
    } else {
      alert('Por favor, preencha todos os campos.');
    }
    return;
  }

  // Simulação de autenticação
  fetch('/static/usuarios.json')
    .then(response => response.json())
    .then(data => {
      const users = data[userType];
      const user = users.find(u => u === username);

      if (user) {
        // Simulação de verificação de senha (senha padrão: "senha123")
        if (password === 'senha123') {
          // Redirecionar para a tela de alocação
          window.location.href = '/alocacao?username=' + encodeURIComponent(username);
        } else {
          alert('Senha incorreta. Tente novamente. (Dica: a senha padrão para testes é "senha123")');
        }
      } else {
        alert('Usuário não encontrado.');
      }
    })
    .catch(error => {
      console.error('Erro ao carregar usuarios.json:', error);
      alert('Erro ao autenticar. Tente novamente.');
    });
});

document.getElementById('bypass-login').addEventListener('click', function() {
  window.location.href = '/alocacao?username=Convidado';
});
