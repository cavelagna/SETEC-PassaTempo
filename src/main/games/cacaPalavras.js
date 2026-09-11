'use strict';

const WordSearch = (() => {
  let size = 10;
  const LEVELS = { easy: 5, medium: 10, hard: 15 };
  const LABELS = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' };
  const WORDS = ['ESCOLA', 'LIVRO', 'JOGO', 'IDEIA', 'AMIZADE', 'LEITURA', 'DESAFIO', 'MUSICA', 'ARTE', 'CIENCIA', 'NATUREZA', 'AVENTURA', 'FAMILIA', 'PLANETA', 'SORRISO', 'CAMINHO', 'OCEANO', 'FLORESTA', 'MEMORIA', 'CORAGEM', 'CINEMA', 'VIAGEM', 'TELEFONE', 'JANELA', 'BRINCADEIRA', 'CRIATIVIDADE', 'PASSATEMPO', 'ESCOLHA', 'HISTORIA', 'MONTANHA'];
  const DIRECTIONS = [[0, 1], [1, 0], [1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1], [-1, 1]];
  let container, grid, placements, found, start, current, difficulty;

  function difficultyScreen() {
    container.innerHTML = `<div class="word-game difficulty-screen"><p class="game-eyebrow">Escolha o desafio</p><h3>Caça-Palavras</h3><p>Segure o botão do mouse e passe pelas letras para selecionar uma palavra.</p><div class="difficulty-options">${Object.entries(LABELS).map(([key, label]) => `<button class="game-action-btn" data-difficulty="${key}"><strong>${label}</strong><span>${LEVELS[key]} palavras</span></button>`).join('')}</div></div>`;
    container.querySelectorAll('[data-difficulty]').forEach(button => button.addEventListener('click', () => startGame(button.dataset.difficulty)));
  }

  function sizeFor(level) { return level === 'easy' ? 10 : level === 'medium' ? 12 : 15; }

  function wordsFor(level) {
    const model = Math.floor(Math.random() * 8);
    return Array.from({ length: LEVELS[level] }, (_, index) => WORDS[(model * 3 + index) % WORDS.length]);
  }

  function placeWord(word, board, random) {
    const options = [];
    DIRECTIONS.forEach(([dr, dc]) => {
      for (let row = 0; row < size; row++) for (let col = 0; col < size; col++) {
        const endRow = row + dr * (word.length - 1), endCol = col + dc * (word.length - 1);
        if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;
        if ([...word].every((letter, i) => !board[row + dr * i][col + dc * i] || board[row + dr * i][col + dc * i] === letter)) options.push({ row, col, dr, dc });
      }
    });
    if (!options.length) return null;
    const placement = options[Math.floor(random() * options.length)];
    [...word].forEach((letter, i) => { board[placement.row + placement.dr * i][placement.col + placement.dc * i] = letter; });
    return { word, ...placement };
  }

  function buildGrid(words) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const board = Array.from({ length: size }, () => Array(size).fill(''));
      let seed = attempt + words.length * 17;
      const random = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      const result = words.map(word => placeWord(word, board, random));
      if (result.every(Boolean)) {
        grid = board.map(row => row.map(letter => letter || String.fromCharCode(65 + Math.floor(random() * 26))));
        return result;
      }
    }
    throw new Error('Não foi possível gerar este modelo de caça-palavras.');
  }

  function cellAt(row, col) { return container.querySelector(`.word-search-cell[data-row="${row}"][data-col="${col}"]`); }

  function render() {
    placements = buildGrid(wordsFor(difficulty));
    found = new Set(); start = null; current = null;
    container.innerHTML = `<div class="word-game word-search-game"><div class="word-game-intro"><p class="game-eyebrow">${LABELS[difficulty]} • ${placements.length} palavras</p><h3>Caça-Palavras</h3><p>Segure o mouse e passe pelas letras. A seleção fica marcada enquanto você arrasta.</p></div><div class="word-search-layout"><div class="word-search-grid" style="--word-search-size:${size}" role="grid" aria-label="Grade de caça-palavras">${grid.flatMap((row, r) => row.map((letter, c) => `<button class="word-search-cell" data-row="${r}" data-col="${c}" aria-label="Linha ${r + 1}, coluna ${c + 1}, letra ${letter}">${letter}</button>`)).join('')}</div><ul class="word-list">${placements.map(item => `<li data-word="${item.word}">${item.word}</li>`).join('')}</ul></div><p class="word-feedback" role="status" aria-live="polite">Palavras encontradas: 0 de ${placements.length}</p><div class="word-game-actions"><button class="game-action-btn word-search-change-difficulty">Mudar dificuldade</button><button class="game-action-btn word-search-restart">Novo modelo</button></div></div>`;
    const gridElement = container.querySelector('.word-search-grid');
    gridElement.addEventListener('pointerdown', event => {
      const cell = event.target.closest('.word-search-cell');
      if (!cell) return;
      event.preventDefault();
      start = { row: Number(cell.dataset.row), col: Number(cell.dataset.col) };
      current = start;
      try { gridElement.setPointerCapture?.(event.pointerId); } catch (_) {}
      previewLine();
    });
    gridElement.addEventListener('pointermove', event => {
      if (!start) return;
      const rect = gridElement.getBoundingClientRect();
      const cell = document.elementFromPoint(event.clientX, event.clientY)?.closest('.word-search-cell');
      if (cell && gridElement.contains(cell)) {
        current = { row: Number(cell.dataset.row), col: Number(cell.dataset.col) };
        previewLine();
      } else if (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) {
        previewLine();
      }
    });
    gridElement.addEventListener('pointerup', finishSelection);
    gridElement.addEventListener('pointercancel', finishSelection);
    container.querySelector('.word-search-restart').addEventListener('click', () => startGame(difficulty));
    container.querySelector('.word-search-change-difficulty').addEventListener('click', difficultyScreen);
  }

  function previewLine() {
    container.querySelectorAll('.word-search-cell.is-selecting').forEach(cell => cell.classList.remove('is-selecting'));
    if (!start || !current) return;
    const rowDiff = current.row - start.row, colDiff = current.col - start.col;
    if (!(rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff))) return;
    const length = Math.max(Math.abs(rowDiff), Math.abs(colDiff)) + 1;
    const rowStep = Math.sign(rowDiff), colStep = Math.sign(colDiff);
    for (let i = 0; i < length; i++) cellAt(start.row + rowStep * i, start.col + colStep * i)?.classList.add('is-selecting');
  }

  function finishSelection() {
    if (!start) return;
    selectLine(start, current || start);
    start = null; current = null;
    container.querySelectorAll('.word-search-cell.is-selecting').forEach(cell => cell.classList.remove('is-selecting'));
  }

  function selectLine(from, to) {
    const rowDiff = to.row - from.row, colDiff = to.col - from.col;
    const length = Math.max(Math.abs(rowDiff), Math.abs(colDiff)) + 1;
    if (!(rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff))) return;
    const rowStep = Math.sign(rowDiff), colStep = Math.sign(colDiff);
    const word = Array.from({ length }, (_, i) => grid[from.row + rowStep * i][from.col + colStep * i]).join('');
    const reversed = word.split('').reverse().join('');
    const match = placements.find(item => !found.has(item.word) && (item.word === word || item.word === reversed));
    if (!match) {
      const invalidCells = [...container.querySelectorAll('.word-search-cell.is-selecting')];
      invalidCells.forEach(cell => cell.classList.add('is-invalid'));
      window.setTimeout(() => invalidCells.forEach(cell => cell.classList.remove('is-invalid')), 450);
      return;
    }
    found.add(match.word);
    for (let i = 0; i < length; i++) cellAt(from.row + rowStep * i, from.col + colStep * i)?.classList.add('is-found');
    container.querySelector(`[data-word="${match.word}"]`).classList.add('is-found');
    container.querySelector('.word-feedback').textContent = found.size === placements.length ? 'Parabéns! Você encontrou todas as palavras.' : `Palavras encontradas: ${found.size} de ${placements.length}`;
  }

  function startGame(level) { difficulty = level; size = sizeFor(level); render(); }
  function mount(el) { container = el; difficultyScreen(); }
  function unmount() { if (container) container.innerHTML = ''; container = null; grid = null; placements = null; found = null; start = null; current = null; }
  return { mount, unmount };
})();
