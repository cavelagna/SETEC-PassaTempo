'use strict';

const QuickCalc = (() => {
  const ROUND_SECONDS = 60;
  let container, timerId, state, question, startedAt;

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function makeQuestion(correct) {
    const level = Math.min(5, 1 + Math.floor(correct / 4));
    const type = randomInt(0, 3);
    let a, b, answer, symbol;
    if (type === 0) { a = randomInt(2, 12 + level * 5); b = randomInt(2, 12 + level * 5); answer = a + b; symbol = '+'; }
    if (type === 1) { a = randomInt(8, 18 + level * 6); b = randomInt(2, a); answer = a - b; symbol = '-'; }
    if (type === 2) { a = randomInt(2, 5 + level * 2); b = randomInt(2, 6 + level * 2); answer = a * b; symbol = '×'; }
    if (type === 3) { b = randomInt(2, 5 + level); answer = randomInt(2, 6 + level) * b; a = answer; answer = a / b; symbol = '÷'; }
    return { text: `${a} ${symbol} ${b}`, answer };
  }

  function readRecord() {
    try { return Number(localStorage.getItem('pt-record-quick-calc')) || 0; } catch (_) { return 0; }
  }

  function saveRecord(score) {
    const record = Math.max(score, readRecord());
    try { localStorage.setItem('pt-record-quick-calc', record); } catch (_) {}
    return record;
  }

  function renderStart() {
    container.innerHTML = `<div class="math-game math-game--intro">
      <p class="game-eyebrow">Desafio de cálculo mental</p><h3>Cálculo Rápido</h3>
      <p>Resolva o maior número possível de contas em 60 segundos.</p>
      <button class="game-action-btn math-primary quick-start">Começar</button>
      <p class="game-record">Melhor pontuação: ${readRecord()}</p>
    </div>`;
    container.querySelector('.quick-start').addEventListener('click', start);
  }

  function renderRound() {
    container.innerHTML = `<div class="math-game quick-round">
      <div class="math-game-stats"><span>Tempo <strong class="quick-time">${state.time}</strong></span><span>Pontos <strong>${state.score}</strong></span></div>
      <p class="game-eyebrow">Conta ${state.total + 1}</p><div class="math-question">${question.text} = ?</div>
      <form class="math-answer-form"><label class="sr-only" for="quick-answer">Sua resposta</label><input id="quick-answer" class="math-answer" type="number" inputmode="numeric" autocomplete="off" required><button class="game-action-btn math-primary">Confirmar</button></form>
      <p class="math-feedback" role="status" aria-live="polite">Digite a resposta e pressione Enter.</p>
    </div>`;
    container.querySelector('.math-answer-form').addEventListener('submit', event => { event.preventDefault(); submit(); });
    container.querySelector('.math-answer').focus();
  }

  function start() {
    clearInterval(timerId);
    state = { time: ROUND_SECONDS, score: 0, correct: 0, wrong: 0, total: 0, locked: false };
    question = makeQuestion(0);
    renderRound();
    timerId = setInterval(() => { state.time--; const time = container.querySelector('.quick-time'); if (time) time.textContent = state.time; if (state.time <= 0) finish(); }, 1000);
  }

  function submit() {
    if (!state || state.locked || state.time <= 0) return;
    const input = container.querySelector('.math-answer');
    if (!input || input.value.trim() === '') return;
    state.locked = true;
    const value = Number(input.value);
    const feedback = container.querySelector('.math-feedback');
    const correct = value === question.answer;
    if (correct) { state.correct++; state.score += 10 + Math.max(0, Math.floor(state.time / 10)); feedback.textContent = 'Correto. Próxima conta...'; feedback.dataset.state = 'correct'; }
    else { state.wrong++; feedback.textContent = `Ainda não. A resposta era ${question.answer}.`; feedback.dataset.state = 'wrong'; }
    state.total++;
    setTimeout(() => { if (!state || state.time <= 0) return; state.locked = false; question = makeQuestion(state.correct); renderRound(); }, 450);
  }

  function finish() {
    if (!state) return;
    clearInterval(timerId); timerId = null; state.time = 0;
    const record = saveRecord(state.score);
    container.innerHTML = `<div class="math-game math-game--result"><p class="game-eyebrow">Tempo encerrado</p><h3>Resultado</h3><div class="result-score">${state.score} pontos</div><dl class="result-list"><div><dt>Acertos</dt><dd>${state.correct}</dd></div><div><dt>Erros</dt><dd>${state.wrong}</dd></div><div><dt>Total</dt><dd>${state.total}</dd></div><div><dt>Recorde</dt><dd>${record}</dd></div></dl><div class="result-actions"><button class="game-action-btn math-primary quick-again">Jogar novamente</button><button class="game-action-btn quick-home">Voltar aos jogos</button></div></div>`;
    container.querySelector('.quick-again').addEventListener('click', start);
    container.querySelector('.quick-home').addEventListener('click', () => window.dispatchEvent(new CustomEvent('passatempo:home')));
  }

  function mount(el) { container = el; state = null; renderStart(); }
  function unmount() { clearInterval(timerId); timerId = null; state = null; question = null; if (container) container.innerHTML = ''; container = null; }
  return { mount, unmount };
})();
