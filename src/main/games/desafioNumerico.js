'use strict';

const NumberChallenge = (() => {
  const TOTAL = 12;
  const OPERATORS = ['+', '-', '×', '÷'];
  let container, state, challenge, advanceTimer;

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
    const expressionComplete = state.selected.length === 7;
    container.innerHTML = `<div class="math-game number-round"><div class="math-game-stats"><span>Desafio <strong>${state.index + 1}/${TOTAL}</strong></span><span>Pontos <strong>${state.score}</strong></span></div><p class="game-eyebrow">Alcance o objetivo</p><div class="number-target">${challenge.target}</div><p class="number-expression" aria-live="polite">${expression}</p><div class="number-choices" role="group" aria-label="Números disponíveis">${challenge.numbers.map((number, index) => `<button class="game-action-btn number-choice" data-index="${index}" ${state.used.includes(index) ? 'disabled' : ''}>${number}</button>`).join('')}</div><div class="number-operators" role="group" aria-label="Operações disponíveis">${OPERATORS.map(operator => `<button class="game-action-btn number-operator" data-operator="${operator}" ${!state.selected.length || state.selected.length % 2 === 0 ? 'disabled' : ''}>${operator}</button>`).join('')}</div><div class="result-actions"><button class="game-action-btn number-clear">Limpar</button><button class="game-action-btn math-primary number-check" ${expressionComplete ? '' : 'disabled'}>Verificar</button><button class="game-action-btn number-restart">Novo desafio</button></div><p class="math-feedback" role="status" aria-live="polite">${expressionComplete ? 'Expressão completa. Você já pode verificar.' : 'Selecione os quatro números e três operações.'}</p></div>`;
    container.querySelectorAll('.number-choice').forEach(button => button.addEventListener('click', () => chooseNumber(Number(button.dataset.index))));
    container.querySelectorAll('.number-operator').forEach(button => button.addEventListener('click', () => chooseOperator(button.dataset.operator)));
    container.querySelector('.number-clear').addEventListener('click', () => { if (!state.locked) { state.selected = []; state.used = []; renderRound(); } });
    container.querySelector('.number-check').addEventListener('click', check);
    container.querySelector('.number-restart').addEventListener('click', () => {
      if (window.confirm('Começar um novo desafio? O progresso atual será descartado.')) start();
    });
  }

  function start() { clearTimeout(advanceTimer); advanceTimer = null; state = { index: 0, score: 0, solved: 0, missed: 0, selected: [], used: [], locked: false }; challenge = createChallenge(); renderRound(); }
  function chooseNumber(index) { if (!state.locked && state.selected.length % 2 === 0 && !state.used.includes(index)) { state.selected.push({ value: challenge.numbers[index], index }); state.used.push(index); renderRound(); } }
  function chooseOperator(operator) { if (!state.locked && state.selected.length % 2 === 1) { state.selected.push({ value: operator }); renderRound(); } }

  function check() {
    if (state.selected.length !== 7 || state.locked) return;
    state.locked = true;
    let result = state.selected[0].value;
    for (let i = 1; i < state.selected.length; i += 2) { result = calculate(result, state.selected[i].value, state.selected[i + 1].value); if (result === null) break; }
    const feedback = container.querySelector('.math-feedback');
    if (result === challenge.target) { state.solved++; state.score += 20; feedback.textContent = 'Desafio resolvido. Próximo...'; feedback.dataset.state = 'correct'; }
    else { state.missed++; feedback.textContent = `Essa expressão resulta em ${result ?? 'um valor inválido'}.`; feedback.dataset.state = 'wrong'; }
    state.index++;
    advanceTimer = setTimeout(() => { advanceTimer = null; state.index >= TOTAL ? finish() : next(); }, 500);
  }

  function next() { challenge = createChallenge(); state.selected = []; state.used = []; state.locked = false; renderRound(); }
  function finish() { clearTimeout(advanceTimer); advanceTimer = null; container.innerHTML = `<div class="math-game math-game--result"><p class="game-eyebrow">Desafios concluídos</p><h3>Resultado</h3><div class="result-score">${state.score} pontos</div><dl class="result-list"><div><dt>Resolvidos</dt><dd>${state.solved}</dd></div><div><dt>Não resolvidos</dt><dd>${state.missed}</dd></div><div><dt>Total</dt><dd>${TOTAL}</dd></div><div><dt>Aproveitamento</dt><dd>${Math.round(state.solved / TOTAL * 100)}%</dd></div></dl><div class="result-actions"><button class="game-action-btn math-primary challenge-again">Jogar novamente</button><button class="game-action-btn challenge-home">Voltar aos jogos</button></div></div>`; container.querySelector('.challenge-again').addEventListener('click', start); container.querySelector('.challenge-home').addEventListener('click', () => window.dispatchEvent(new CustomEvent('passatempo:home'))); }
  function mount(el) { container = el; renderStart(); }
  function unmount() { clearTimeout(advanceTimer); advanceTimer = null; state = null; challenge = null; if (container) container.innerHTML = ''; container = null; }
  function getSaveState() {
    return state && state.index < TOTAL
      ? { state: { ...state, selected: state.selected.map(item => ({ ...item })), used: [...state.used] }, challenge: { numbers: [...challenge.numbers], target: challenge.target } }
      : null;
  }
  function restoreSaveState(saved) {
    if (!saved || !saved.state || !Number.isInteger(saved.state.index) || saved.state.index < 0 || saved.state.index >= TOTAL ||
      !['score', 'solved', 'missed'].every(key => Number.isSafeInteger(saved.state[key]) && saved.state[key] >= 0) ||
      !Array.isArray(saved.challenge?.numbers) || saved.challenge.numbers.length !== 4 ||
      !saved.challenge.numbers.every(number => Number.isInteger(number) && number >= 2 && number <= 9) ||
      !Number.isInteger(saved.challenge.target) || saved.challenge.target < 1 || saved.challenge.target > 100 ||
      !Array.isArray(saved.state.used) || !saved.state.used.every(index => Number.isInteger(index) && index >= 0 && index < 4) ||
      !Array.isArray(saved.state.selected) || saved.state.selected.length > 7 || typeof saved.state.locked !== 'boolean') return false;
    clearTimeout(advanceTimer);
    advanceTimer = null;
    state = { ...saved.state, used: [...saved.state.used], selected: saved.state.selected.map(item => ({ ...item })) };
    challenge = { numbers: [...saved.challenge.numbers], target: saved.challenge.target };
    if (state.locked) {
      if (state.index >= TOTAL) finish();
      else next();
      return true;
    }
    renderRound();
    return true;
  }
  return { mount, unmount, getSaveState, restoreSaveState };
})();
