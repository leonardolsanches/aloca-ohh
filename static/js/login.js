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

  console.log('Tentando fazer login com:', { userType, username, password });

  // Carregar o arquivo usuarios.json
  fetch('/static/usuarios.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao carregar usuarios.json: ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log('Dados carregados de usuarios.json:', data);

      // Verificar se o tipo de usuário existe no JSON
      if (!data[userType]) {
        console.log(`Tipo de usuário "${userType}" não encontrado em usuarios.json`);
        alert('Tipo de usuário inválido.');
        return;
      }

      // Verificar se o usuário existe no tipo selecionado
      const users = data[userType];
      const user = users.find(u => u === username);

      if (user) {
        console.log('Usuário encontrado:', user);
        // Simulação de verificação de senha (senha padrão: "senha123")
        if (password === 'senha123') {
          console.log('Senha correta. Redirecionando para a tela de alocação...');
          // Redirecionar para a tela de alocação
          window.location.href = '/alocacao?username=' + encodeURIComponent(username);
        } else {
          console.log('Senha incorreta. Senha fornecida:', password);
          alert('Senha incorreta. Tente novamente. (Dica: a senha padrão para testes é "senha123")');
        }
      } else {
        console.log(`Usuário "${username}" não encontrado no tipo "${userType}"`);
        alert('Usuário não encontrado.');
      }
    })
    .catch(error => {
      console.error('Erro ao autenticar:', error);
      alert('Erro ao autenticar. Verifique o console para mais detalhes.');
    });
});

document.getElementById('bypass-login').addEventListener('click', function() {
  console.log('Bypass login: redirecionando como Convidado...');
  window.location.href = '/alocacao?username=Convidado';
});