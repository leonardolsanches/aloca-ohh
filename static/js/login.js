document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');
  const bypassButton = document.getElementById('bypass-login');

  // Verificar se os elementos existem
  if (!loginForm) {
    console.error('Elemento "login-form" não encontrado no DOM.');
    return;
  }
  if (!bypassButton) {
    console.error('Elemento "bypass-login" não encontrado no DOM.');
    return;
  }

  // Evento de submit do formulário de login
  loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const userType = document.getElementById('user-type').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log('Iniciando processo de login...');
    console.log('Dados do formulário:', { userType, username, password });

    // Validação de campos
    if (!userType || !username) {
      console.log('Campos obrigatórios não preenchidos:', { userType, username });
      alert('Por favor, preencha todos os campos obrigatórios (Tipo de Usuário e Usuário).');
      return;
    }

    if (!password) {
      console.log('Senha está em branco.');
      alert('A senha não pode estar em branco. Por favor, insira a senha.');
      return;
    }

    // Carregar o arquivo usuarios.json
    console.log('Carregando usuarios.json...');
    fetch('/static/usuarios.json')
      .then(response => {
        console.log('Resposta do fetch:', response);
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
        console.log(`Usuários no tipo "${userType}":`, users);
        const user = users.find(u => u.toLowerCase() === username.toLowerCase()); // Comparação case-insensitive

        if (user) {
          console.log('Usuário encontrado:', user);
          // Simulação de verificação de senha (senha padrão: "senha123")
          if (password.toLowerCase() === 'senha123') { // Comparação case-insensitive para a senha
            console.log('Senha correta. Redirecionando para a tela de alocação...');
            try {
              window.location.href = '/alocacao?username=' + encodeURIComponent(username);
            } catch (error) {
              console.error('Erro ao redirecionar para /alocacao:', error);
              alert('Erro ao redirecionar para a tela de alocação. Verifique o console.');
            }
          } else {
            console.log('Senha incorreta. Senha fornecida:', password);
            alert('Credenciais inválidas: Senha incorreta. Tente novamente. (Dica: a senha padrão para testes é "senha123")');
          }
        } else {
          console.log(`Usuário "${username}" não encontrado no tipo "${userType}"`);
          alert('Credenciais inválidas: Usuário não encontrado.');
        }
      })
      .catch(error => {
        console.error('Erro ao autenticar:', error);
        alert('Erro ao autenticar. Verifique o console para mais detalhes.');
      });
  });

  // Evento do botão "Seguir sem Login"
  bypassButton.addEventListener('click', function(event) {
    event.preventDefault(); // Impedir comportamento padrão
    console.log('Botão "Seguir sem Login" clicado. Redirecionando como Convidado...');
    try {
      window.location.href = '/alocacao?username=Convidado';
    } catch (error) {
      console.error('Erro ao redirecionar com "Seguir sem Login":', error);
      alert('Erro ao redirecionar com "Seguir sem Login". Verifique o console para mais detalhes.');
    }
  });
});