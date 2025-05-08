function previousMonth() {
  // Lógica para mudar para o mês anterior
}

function nextMonth() {
  // Lógica para mudar para o próximo mês
}

function alocar() {
  const tipoProjetoAtividade = document.getElementById('tipo-projeto-atividade').value;
  const projeto = document.getElementById('projeto').value;
  const atividade = document.getElementById('atividade').value;
  const dataInicio = document.getElementById('data-inicio').value;
  const dataFim = document.getElementById('data-fim').value;
  const qtdHoras = document.getElementById('qtd-horas').value;
  const selectedDays = document.querySelectorAll('.calendar-days .day.selected');

  // Validação simples
  if (!tipoProjetoAtividade || !projeto || !atividade || !dataInicio || !dataFim || !qtdHoras || selectedDays.length === 0) {
    alert('Preencha todos os campos e selecione pelo menos um dia.');
    return;
  }

  // Exemplo de lógica: Exibir os dados alocados
  const alocacao = {
    tipoProjetoAtividade,
    projeto,
    atividade,
    dataInicio,
    dataFim,
    qtdHoras,
    diasSelecionados: Array.from(selectedDays).map(day => day.getAttribute('data-date'))
  };
  console.log('Alocação:', alocacao);
  alert('Alocação realizada com sucesso! Veja os detalhes no console.');
}

// Funcionalidade de seleção de células
const days = document.querySelectorAll('.calendar-days .day:not(.empty)');
const dataInicioInput = document.getElementById('data-inicio');
const dataFimInput = document.getElementById('data-fim');
const counter = document.querySelector('.counter');
let lastSelectedDay = null;

days.forEach(day => {
  day.addEventListener('click', (e) => {
    const isShiftPressed = e.shiftKey;
    const isCtrlPressed = e.ctrlKey;

    if (!isShiftPressed && !isCtrlPressed) {
      // Clique simples: limpa todas as seleções e seleciona apenas o dia clicado
      days.forEach(d => d.classList.remove('selected'));
      day.classList.add('selected');
      lastSelectedDay = day;
    } else if (isCtrlPressed) {
      // Ctrl: adiciona ou remove o dia da seleção
      day.classList.toggle('selected');
      lastSelectedDay = day;
    } else if (isShiftPressed && lastSelectedDay) {
      // Shift: seleciona um intervalo contínuo entre o último dia selecionado e o dia clicado
      const allDays = Array.from(days);
      const startIndex = allDays.indexOf(lastSelectedDay);
      const endIndex = allDays.indexOf(day);
      const minIndex = Math.min(startIndex, endIndex);
      const maxIndex = Math.max(startIndex, endIndex);

      // Limpa seleções anteriores, mas mantém as que já estavam com Ctrl
      days.forEach(d => {
        if (!d.classList.contains('selected')) {
          d.classList.remove('selected');
        }
      });

      // Seleciona o intervalo
      for (let i = minIndex; i <= maxIndex; i++) {
        allDays[i].classList.add('selected');
      }
    }

    // Atualiza o contador e os campos de data
    updateSelection();
  });
});

function updateSelection() {
  const selectedDays = document.querySelectorAll('.calendar-days .day.selected');
  counter.textContent = selectedDays.length;

  if (selectedDays.length > 0) {
    const dates = Array.from(selectedDays)
      .map(day => new Date(day.getAttribute('data-date')))
      .filter(date => !isNaN(date));
    
    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));

      // Formata as datas no formato YYYY-MM-DD
      dataInicioInput.value = minDate.toISOString().split('T')[0];
      dataFimInput.value = maxDate.toISOString().split('T')[0];
    } else {
      dataInicioInput.value = '';
      dataFimInput.value = '';
    }
  } else {
    dataInicioInput.value = '';
    dataFimInput.value = '';
  }
}
