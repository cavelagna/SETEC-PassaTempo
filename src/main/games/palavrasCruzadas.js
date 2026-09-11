'use strict';

const Crossword = (() => {
  const LEVELS = { easy: 5, medium: 10, hard: 15 };
  const LEVEL_LABELS = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' };
  const WORD_POOL = [
    ['AMOR', 'Sentimento de afeto e cuidado.'], ['MESA', 'Móvel usado para estudar.'], ['BOLA', 'Objeto redondo usado em jogos.'],
    ['CARTA', 'Objeto que contém mensagem escrita.'], ['LIVRO', 'Fonte de conhecimento.'], ['CARRO', 'Veículo com quatro rodas.'],
    ['ARVORE', 'Planta de tronco e folhas.'], ['MAR', 'Grande corpo de água salgada.'], ['SOL', 'Estrela que ilumina a Terra.'],
    ['LUA', 'Satélite natural da Terra.'], ['ANO', 'Período de 365 dias.'], ['DIA', 'Período de 24 horas.'],
    ['NOITE', 'Período escuro do dia.'], ['FUTEBOL', 'Esporte com bola e gol.'], ['XADREZ', 'Jogo de estratégia com peças.'],
    ['JOGAR', 'Participar de um jogo.'], ['SOM', 'Vibração que percebemos.'], ['VIDA', 'Existência biológica.'],
    ['TRABALHO', 'Atividade remunerada.'], ['CIDADE', 'Grande concentração urbana.'], ['PAIS', 'Nação ou território.'],
    ['DESENHO', 'Representação gráfica.'], ['MUSICA', 'Arte dos sons.'], ['POEMA', 'Texto em versos.'],
    ['ARTE', 'Expressão criativa.'], ['CIENCIA', 'Estudo sistemático da natureza.'], ['JANELA', 'Abertura na parede.'],
    ['ESCOLA', 'Lugar de aprendizagem.'], ['IDEIA', 'Pensamento ou solução.'], ['AMIZADE', 'Relação de carinho e confiança.'],
  ];
  let container, cells, selected, words, difficulty, dimensions;

  function chooseWords(level) {
    const count = LEVELS[level];
    const model = Math.floor(Math.random() * 8);
    return Array.from({ length: count }, (_, index) => {
      const [word, clue] = WORD_POOL[(model * 3 + index) % WORD_POOL.length];
      return { word, clue, row: index, col: 0, number: index + 1 };
    });
  }

  function difficultyScreen() {
    container.innerHTML = `<div class="word-game difficulty-screen"><p class="game-eyebrow">Escolha o desafio</p><h3>Palavras Cruzadas</h3><p>Os números da grade correspondem aos números das pistas.</p><div class="difficulty-options">${Object.entries(LEVEL_LABELS).map(([key, label]) => `<button class="game-action-btn" data-difficulty="${key}"><strong>${label}</strong><span>${LEVELS[key]} palavras</span></button>`).join('')}</div></div>`;
    container.querySelectorAll('[data-difficulty]').forEach(button => button.addEventListener('click', () => start(button.dataset.difficulty)));
  }

  function makeGrid() {
    const grid = Array.from({ length: dimensions.rows }, () => Array(dimensions.cols).fill(null));
    words.forEach(item => [...item.word].forEach((letter, offset) => { grid[item.row][item.col + offset] = { letter, number: offset === 0 ? item.number : null }; }));
    return grid;
  }

  function render() {
    const grid = makeGrid();
    container.innerHTML = `<div class="word-game crossword-game"><div class="word-game-intro"><p class="game-eyebrow">${LEVEL_LABELS[difficulty]} • ${words.length} palavras</p><h3>Palavras Cruzadas</h3><p>Digite uma resposta e confirme com Enter. Casas vermelhas indicam uma palavra errada.</p></div><div class="crossword-layout"><div class="crossword-grid" style="--crossword-cols:${dimensions.cols};--crossword-rows:${dimensions.rows}" role="grid" aria-label="Grade de palavras cruzadas">${grid.flatMap((row, r) => row.map((cell, c) => cell ? `<button class="crossword-cell" data-row="${r}" data-col="${c}" aria-label="${cell.number ? `Número ${cell.number}. ` : ''}Linha ${r + 1}, coluna ${c + 1}">${cell.number ? `<small>${cell.number}</small>` : ''}<span></span></button>` : '<span class="crossword-block" aria-hidden="true"></span>')).join('')}</div><ol class="crossword-clues">${words.map(item => `<li><strong>${item.number}.</strong> <b>${item.word.length} letras</b> ${item.clue}</li>`).join('')}</ol></div><p class="word-feedback" role="status" aria-live="polite">Selecione uma casa para começar.</p><div class="word-game-actions"><button class="game-action-btn crossword-change-difficulty">Mudar dificuldade</button><button class="game-action-btn crossword-restart">Novo modelo</button></div></div>`;
    cells = [...container.querySelectorAll('.crossword-cell')];
    cells.forEach(cell => cell.addEventListener('click', () => select(Number(cell.dataset.row), Number(cell.dataset.col))));
    container.querySelector('.crossword-restart').addEventListener('click', () => start(difficulty));
    container.querySelector('.crossword-change-difficulty').addEventListener('click', difficultyScreen);
  }

  function select(row, col) { selected = { row, col }; cells.forEach(cell => cell.classList.toggle('is-selected', Number(cell.dataset.row) === row && Number(cell.dataset.col) === col)); }
  function move(rowDelta, colDelta) { const next = cells.find(cell => Number(cell.dataset.row) === selected.row + rowDelta && Number(cell.dataset.col) === selected.col + colDelta); if (next) select(Number(next.dataset.row), Number(next.dataset.col)); }
  function handleKey(event) {
    if (!selected || event.target.closest('.crossword-restart')) return;
    const cell = cells.find(item => Number(item.dataset.row) === selected.row && Number(item.dataset.col) === selected.col);
    if (/^[a-zA-ZÀ-ÿ]$/.test(event.key)) { cell.querySelector('span').textContent = event.key.toUpperCase(); cell.dataset.value = event.key.toUpperCase(); cell.classList.remove('is-wrong'); move(0, 1); }
    if (event.key === 'Backspace') { cell.querySelector('span').textContent = ''; delete cell.dataset.value; }
    if (event.key === 'Enter') check();
    if (event.key.startsWith('Arrow')) { event.preventDefault(); move(event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0, event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0); }
  }
  function check() {
    let complete = true;
    words.forEach(item => {
      const wordCells = [...item.word].map((_, offset) => cells.find(cell => Number(cell.dataset.row) === item.row && Number(cell.dataset.col) === offset));
      const filled = wordCells.every(cell => cell?.dataset.value);
      if (!filled) { complete = false; return; }
      const correct = wordCells.every((cell, offset) => cell.dataset.value === item.word[offset]);
      wordCells.forEach(cell => cell.classList.toggle('is-wrong', !correct));
      if (!correct) complete = false;
    });
    const feedback = container.querySelector('.word-feedback');
    if (complete) { feedback.textContent = 'Parabéns! Você completou todas as palavras.'; window.dispatchEvent(new CustomEvent('passatempo:result', { detail: { result: 'win' } })); }
    else if (words.some(item => [...item.word].every((_, offset) => cells.find(cell => Number(cell.dataset.row) === item.row && Number(cell.dataset.col) === offset)?.dataset.value))) feedback.textContent = 'Há uma palavra preenchida incorretamente em vermelho.';
  }
  function start(level) { difficulty = level; words = chooseWords(level); dimensions = { rows: words.length + 1, cols: Math.max(...words.map(item => item.word.length)) + 1 }; selected = null; render(); }
  function mount(el) { container = el; selected = null; container.addEventListener('keydown', handleKey); difficultyScreen(); }
  function unmount() { if (container) container.innerHTML = ''; container = null; cells = null; selected = null; words = null; dimensions = null; }
  return { mount, unmount };
})();
