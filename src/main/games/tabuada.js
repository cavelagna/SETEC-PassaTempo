'use strict';

const TimesTable = (() => {
  const QUESTION_SECONDS = 10;
  let container, state, question, questionTimer, advanceTimer;

  function pickQuestion() {
    const table = state.table === 'random' ? Math.floor(Math.random() * 9) + 2 : Number(state.table);
    let multiplier = Math.floor(Math.random() * 10) + 1;
    if (state.last && state.last.table === table && state.last.multiplier === multiplier) multiplier = multiplier % 10 + 1;
    state.last = { table, multiplier };
    return { table, multiplier, answer: table * multiplier };
  }

  function renderStart() {
    container.innerHTML = `<div class="math-game math-game--intro"><p class="game-eyebrow">Prática de multiplicação</p><h3>Tabuada</h3><p>Escolha uma tabuada, a dificuldade e responda no seu ritmo.</p><label class="math-select-label" for="times-table-choice">Tabuada</label><select id="times-table-choice" class="math-select"><option value="random">Aleatória</option>${[2,3,4,5,6,7,8,9,10].map(n => `<option value="${n}">Do ${n}</option>`).join('')}</select><label class="math-select-label" for="times-difficulty">Dificuldade</label><select id="times-difficulty" class="math-select"><option value="10">Fácil · 10 perguntas</option><option value="20" selected>Médio · 20 perguntas</option><option value="30">Difícil · 30 perguntas</option></select><button class="game-action-btn math-primary times-start">Começar</button></div>`;
    container.querySelector('.times-start').addEventListener('click', () => start(container.querySelector('#times-table-choice').value, Number(container.querySelector('#times-difficulty').value)));
  }

  function renderRound(resetTimer = true) {
    container.innerHTML = `<div class="math-game"><div class="math-game-stats"><span>Progresso <strong>${state.index + 1}/${state.total}</strong></span><span>Tempo <strong class="times-time">${state.seconds}s</strong></span><span>Pontos <strong>${state.score}</strong></span></div><p class="game-eyebrow">${state.table === 'random' ? 'Tabuada aleatória' : `Tabuada do ${state.table}`}</p><div class="math-question">${question.table} × ${question.multiplier} = ?</div><form class="math-answer-form"><label class="sr-only" for="times-answer">Sua resposta</label><input id="times-answer" class="math-answer" type="number" inputmode="numeric" required autocomplete="off"><button class="game-action-btn math-primary">Confirmar</button></form><button class="game-action-btn times-restart" type="button">Novo jogo</button><p class="math-feedback" role="status" aria-live="polite">Responda para continuar.</p></div>`;
    container.querySelector('.math-answer-form').addEventListener('submit', e => { e.preventDefault(); submit(); });
    container.querySelector('.math-answer').focus();
    if (resetTimer) startQuestionTimer();
    container.querySelector('.times-restart').addEventListener('click', () => {
      if (window.confirm('Começar uma nova partida? O progresso atual será descartado.')) start(state.table, state.total);
    });
  }

  function start(table, total = 20) { clearInterval(questionTimer); clearTimeout(advanceTimer); advanceTimer = null; state = { table, total, index: 0, score: 0, correct: 0, wrong: 0, last: null, locked: false, seconds: QUESTION_SECONDS }; question = pickQuestion(); renderRound(); }

  function startQuestionTimer(reset = true) {
    clearInterval(questionTimer);
    if (reset) state.seconds = QUESTION_SECONDS;
    questionTimer = setInterval(() => {
      if (!state || state.locked) return;
      state.seconds--;
      const time = container.querySelector('.times-time');
      if (time) time.textContent = `${state.seconds}s`;
      if (state.seconds <= 0) timeOut();
    }, 1000);
  }

  function advance() {
    advanceTimer = null;
    state.index++;
    if (state.index >= state.total) finish();
    else { state.locked = false; question = pickQuestion(); renderRound(); }
  }

  function timeOut() {
    if (!state || state.locked) return;
    state.locked = true;
    state.wrong++;
    clearInterval(questionTimer);
    const feedback = container.querySelector('.math-feedback');
    if (feedback) { feedback.textContent = `Tempo esgotado. A resposta era ${question.answer}.`; feedback.dataset.state = 'wrong'; }
    advanceTimer = setTimeout(advance, 450);
  }

  function submit() {
    if (!state || state.locked) return;
    const input = container.querySelector('.math-answer');
    if (!input || input.value.trim() === '') return;
    state.locked = true;
    const feedback = container.querySelector('.math-feedback');
    if (Number(input.value) === question.answer) { state.correct++; state.score += 10; feedback.textContent = 'Correto. Próxima pergunta...'; feedback.dataset.state = 'correct'; }
    else { state.wrong++; feedback.textContent = `A resposta era ${question.answer}. Próxima pergunta...`; feedback.dataset.state = 'wrong'; }
    clearInterval(questionTimer);
    advanceTimer = setTimeout(advance, 450);
  }

  function finish() {
    clearInterval(questionTimer);
    clearTimeout(advanceTimer);
    advanceTimer = null;
    const percent = Math.round((state.correct / state.total) * 100);
    container.innerHTML = `<div class="math-game math-game--result"><p class="game-eyebrow">${state.total} perguntas concluídas</p><h3>Resultado</h3><div class="result-score">${state.score} pontos</div><dl class="result-list"><div><dt>Acertos</dt><dd>${state.correct}</dd></div><div><dt>Erros</dt><dd>${state.wrong}</dd></div><div><dt>Aproveitamento</dt><dd>${percent}%</dd></div><div><dt>Total</dt><dd>${state.total}</dd></div></dl><div class="result-actions"><button class="game-action-btn math-primary times-again">Jogar novamente</button><button class="game-action-btn times-home">Voltar aos jogos</button></div></div>`;
    container.querySelector('.times-again').addEventListener('click', () => start(state.table, state.total));
    container.querySelector('.times-home').addEventListener('click', () => window.dispatchEvent(new CustomEvent('passatempo:home')));
  }

  function mount(el) { container = el; renderStart(); }
  function unmount() { clearInterval(questionTimer); clearTimeout(advanceTimer); questionTimer = null; advanceTimer = null; state = null; question = null; if (container) container.innerHTML = ''; container = null; }

  function getSaveState() {
    return state && !container?.querySelector('.math-game--result')
      ? { state: { ...state, last: state.last && { ...state.last } }, question: question && { ...question } }
      : null;
  }

  function restoreSaveState(saved) {
    const tableValid = saved?.state?.table === 'random' || Number.isInteger(Number(saved?.state?.table)) && Number(saved.state.table) >= 2 && Number(saved.state.table) <= 10;
    if (!saved || !saved.state || !tableValid || ![10, 20, 30].includes(saved.state.total) ||
      !Number.isInteger(saved.state.index) || saved.state.index < 0 || saved.state.index >= saved.state.total ||
      !['score', 'correct', 'wrong'].every(key => Number.isSafeInteger(saved.state[key]) && saved.state[key] >= 0) ||
      !Number.isInteger(saved.state.seconds) || saved.state.seconds < 1 || saved.state.seconds > QUESTION_SECONDS ||
      typeof saved.state.locked !== 'boolean' || !saved.question ||
      !Number.isInteger(saved.question.table) || saved.question.table < 2 || saved.question.table > 10 ||
      !Number.isInteger(saved.question.multiplier) || saved.question.multiplier < 1 || saved.question.multiplier > 10 ||
      saved.question.answer !== saved.question.table * saved.question.multiplier) return false;
    clearInterval(questionTimer); clearTimeout(advanceTimer);
    state = { ...saved.state, last: saved.state.last && { ...saved.state.last } };
    question = { ...saved.question };
    if (state.locked) {
      state.locked = false;
      advance();
      return true;
    }
    renderRound(false);
    startQuestionTimer(false);
    return true;
  }

  return { mount, unmount, getSaveState, restoreSaveState };
})();
