/* global fetch */

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');
  const bypassButton = document.getElementById('bypass-login');
  const userTypeSelect = document.getElementById('user-type');
  const usernameInput = document.getElementById('username');
  const usernameList = document.getElementById('username-list');

  // Verificar se os elementos existem
  if (!loginForm) {
    console.error('Elemento "login-form" não encontrado no DOM.');
    return;
  }
  if (!bypassButton) {
    console.error('Elemento "bypass-login" não encontrado no DOM.');
    return;
  }
  if (!userTypeSelect || !usernameInput || !usernameList) {
    console.error('Elementos necessários para o login não encontrados:', { userTypeSelect, usernameInput, usernameList });
    return;
  }

  // Função para preencher a lista de usuários com base no tipo de usuário
  function populateUsers(userType, searchTerm = '') {
    console.log('Carregando usuarios.json para preencher lista de usuários...');
    fetch('/data/usuarios.json')
      .then(response => {
        console.log('Resposta do fetch para usuarios.json:', response);
        if (!response.ok) {
          throw new Error('Erro ao carregar usuarios.json: ' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        console.log('Dados carregados de usuarios.json:', data);
        usernameList.innerHTML = ''; // Limpar a lista existente

        if (userType && data[userType]) {
          const users = data[userType].filter(user => 
            user.nome.toLowerCase().includes(searchTerm.toLowerCase())
          );
          console.log(`Usuários para o tipo "${userType}" com busca "${searchTerm}":`, users);
          users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.nome;
            option.textContent = user.nome;
            usernameList.appendChild(option);
          });
        } else {
          console.log(`Nenhum usuário encontrado para o tipo "${userType}"`);
        }
      })
      .catch(error => {
        console.error('Erro ao carregar usuarios.json:', error);
        alert('Erro ao carregar lista de usuários. Verifique o console.');
      });
  }

  // Preencher a lista de usuários quando o tipo de usuário mudar
  userTypeSelect.addEventListener('change', function() {
    const userType = userTypeSelect.value;
    console.log('Tipo de usuário alterado para:', userType);
    populateUsers(userType, usernameInput.value);
  });

  // Atualizar a lista ao digitar no campo de usuário
  usernameInput.addEventListener('input', function() {
    const userType = userTypeSelect.value;
    const searchTerm = usernameInput.value;
    populateUsers(userType, searchTerm);
  });

  // Preencher inicialmente com base no tipo de usuário padrão (se houver)
  populateUsers(userTypeSelect.value);

  // Evento de submit do formulário de login
  loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const userType = userTypeSelect.value;
    const username = usernameInput.value.trim();
    const password = document.getElementById('password').value.trim();

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

    // Carregar o arquivo usuarios.json para autenticação
    console.log('Carregando usuarios.json para autenticação...');
    fetch('/data/usuarios.json')
      .then(response => {
        console.log('Resposta do fetch para usuarios.json:', response);
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
        const user = users.find(u => u.nome.toLowerCase() === username.toLowerCase()); // Comparação case-insensitive

        if (user) {
          console.log('Usuário encontrado:', user);
          // Simulação de verificação de senha (senha padrão: "senha123")
          if (password.toLowerCase() === 'senha123') {
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
    event.preventDefault();
    console.log('Botão "Seguir sem Login" clicado. Redirecionando como Convidado...');
    try {
      window.location.href = '/alocacao?username=Convidado';
    } catch (error) {
      console.error('Erro ao redirecionar com "Seguir sem Login":', error);
      alert('Erro ao redirecionar com "Seguir sem Login". Verifique o console para mais detalhes.');
    }
  });
});
