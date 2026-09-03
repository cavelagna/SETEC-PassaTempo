'use strict';

const NumberChallenge = (() => {
  const TOTAL = 5;
  const OPERATORS = ['+', '-', '×', '÷'];
  let container, state, challenge;

  function calculate(left, operator, right) {
    if (operator === '+') return left + right;
    if (operator === '-') return left - right;
    if (operator === '×') return left * right;
    if (operator === '÷' && right !== 0 && left % right === 0) return left / right;
    return null;
  }

  function createChallenge() {
    let result, numbers, solution;
    do {
      numbers = [Math.floor(Math.random() * 8) + 2, Math.floor(Math.random() * 8) + 2, Math.floor(Math.random() * 8) + 2, Math.floor(Math.random() * 8) + 2];
      solution = [OPERATORS[Math.floor(Math.random() * 4)], OPERATORS[Math.floor(Math.random() * 4)], OPERATORS[Math.floor(Math.random() * 4)]];
      result = numbers[0];
      for (let i = 0; i < solution.length; i++) result = calculate(result, solution[i], numbers[i + 1]);
    } while (result === null || result < 1 || result > 100);
    return { numbers, target: result };
  }

  function renderStart() {
    container.innerHTML = `<div class="math-game math-game--intro"><p class="game-eyebrow">Raciocínio em etapas</p><h3>Desafio Numérico</h3><p>Use cada um dos quatro números uma vez. Escolha operações e alcance o objetivo sem criar divisões fracionadas.</p><button class="game-action-btn math-primary challenge-start">Começar</button></div>`;
    container.querySelector('.challenge-start').addEventListener('click', start);
  }

  function renderRound() {
    const expression = state.selected.length ? state.selected.map(item => item.value).join(' ') : 'Escolha um número';
    container.innerHTML = `<div class="math-game number-round"><div class="math-game-stats"><span>Desafio <strong>${state.index + 1}/${TOTAL}</strong></span><span>Pontos <strong>${state.score}</strong></span></div><p class="game-eyebrow">Alcance o objetivo</p><div class="number-target">${challenge.target}</div><p class="number-expression" aria-live="polite">${expression}</p><div class="number-choices" role="group" aria-label="Números disponíveis">${challenge.numbers.map((number, index) => `<button class="game-action-btn number-choice" data-index="${index}" ${state.used.includes(index) ? 'disabled' : ''}>${number}</button>`).join('')}</div><div class="number-operators" role="group" aria-label="Operações disponíveis">${OPERATORS.map(operator => `<button class="game-action-btn number-operator" data-operator="${operator}" ${!state.selected.length || state.selected.length % 2 === 0 ? 'disabled' : ''}>${operator}</button>`).join('')}</div><div class="result-actions"><button class="game-action-btn number-clear">Limpar</button><button class="game-action-btn math-primary number-check" ${state.selected.length !== 7 ? 'disabled' : ''}>Verificar</button></div><p class="math-feedback" role="status" aria-live="polite">Selecione um número, uma operação e o próximo número.</p></div>`;
    container.querySelectorAll('.number-choice').forEach(button => button.addEventListener('click', () => chooseNumber(Number(button.dataset.index))));
    container.querySelectorAll('.number-operator').forEach(button => button.addEventListener('click', () => chooseOperator(button.dataset.operator)));
    container.querySelector('.number-clear').addEventListener('click', () => { state.selected = []; state.used = []; renderRound(); });
    container.querySelector('.number-check').addEventListener('click', check);
  }

  function start() { state = { index: 0, score: 0, solved: 0, missed: 0, selected: [], used: [], locked: false }; challenge = createChallenge(); renderRound(); }
  function chooseNumber(index) { if (state.selected.length % 2 === 0 && !state.used.includes(index)) { state.selected.push({ value: challenge.numbers[index], index }); state.used.push(index); renderRound(); } }
  function chooseOperator(operator) { if (state.selected.length % 2 === 1) { state.selected.push({ value: operator }); renderRound(); } }

  function check() {
    if (state.selected.length !== 7 || state.locked) return;
    state.locked = true;
    let result = state.selected[0].value;
    for (let i = 1; i < state.selected.length; i += 2) { result = calculate(result, state.selected[i].value, state.selected[i + 1].value); if (result === null) break; }
    const feedback = container.querySelector('.math-feedback');
    if (result === challenge.target) { state.solved++; state.score += 20; feedback.textContent = 'Desafio resolvido. Próximo...'; feedback.dataset.state = 'correct'; }
    else { state.missed++; feedback.textContent = `Essa expressão resulta em ${result ?? 'um valor inválido'}.`; feedback.dataset.state = 'wrong'; }
    state.index++;
    setTimeout(() => state.index >= TOTAL ? finish() : next(), 500);
  }

  function next() { challenge = createChallenge(); state.selected = []; state.used = []; renderRound(); }
  function finish() { container.innerHTML = `<div class="math-game math-game--result"><p class="game-eyebrow">Desafios concluídos</p><h3>Resultado</h3><div class="result-score">${state.score} pontos</div><dl class="result-list"><div><dt>Resolvidos</dt><dd>${state.solved}</dd></div><div><dt>Não resolvidos</dt><dd>${state.missed}</dd></div><div><dt>Total</dt><dd>${TOTAL}</dd></div><div><dt>Aproveitamento</dt><dd>${Math.round(state.solved / TOTAL * 100)}%</dd></div></dl><div class="result-actions"><button class="game-action-btn math-primary challenge-again">Jogar novamente</button><button class="game-action-btn challenge-home">Voltar aos jogos</button></div></div>`; container.querySelector('.challenge-again').addEventListener('click', start); container.querySelector('.challenge-home').addEventListener('click', () => window.dispatchEvent(new CustomEvent('passatempo:home'))); }
  function mount(el) { container = el; renderStart(); }
  function unmount() { state = null; challenge = null; if (container) container.innerHTML = ''; container = null; }
  return { mount, unmount };
})();
