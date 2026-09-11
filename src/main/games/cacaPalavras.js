'use strict';

const WordSearch = (() => {
  const SIZE = 10;
  const PLACEMENTS = [{ word: 'ESCOLA', row: 1, col: 1, dr: 0, dc: 1 }, { word: 'LIVRO', row: 3, col: 7, dr: 1, dc: 0 }, { word: 'JOGO', row: 8, col: 2, dr: -1, dc: 1 }, { word: 'IDEIA', row: 6, col: 1, dr: 1, dc: 1 }];
  let container, grid, found, start, current;

  function buildGrid() {
    grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(''));
    PLACEMENTS.forEach(item => [...item.word].forEach((letter, i) => { grid[item.row + item.dr * i][item.col + item.dc * i] = letter; }));
    grid = grid.map(row => row.map(letter => letter || String.fromCharCode(65 + Math.floor(Math.random() * 26))));
  }
  function cellAt(row, col) { return container.querySelector(`.word-search-cell[data-row="${row}"][data-col="${col}"]`); }
  function render() {
    buildGrid(); found = new Set(); start = null; current = null;
    container.innerHTML = `<div class="word-game word-search-game"><div class="word-game-intro"><p class="game-eyebrow">Observe, encontre, marque</p><h3>Caça-Palavras</h3><p>Arraste sobre as letras para encontrar todas as palavras.</p></div><div class="word-search-layout"><div class="word-search-grid" role="grid" aria-label="Grade de caça-palavras">${grid.flatMap((row, r) => row.map((letter, c) => `<button class="word-search-cell" data-row="${r}" data-col="${c}" aria-label="Linha ${r + 1}, coluna ${c + 1}, letra ${letter}">${letter}</button>`)).join('')}</div><ul class="word-list">${PLACEMENTS.map(item => `<li data-word="${item.word}">${item.word}</li>`).join('')}</ul></div><p class="word-feedback" role="status" aria-live="polite">Palavras encontradas: 0 de ${PLACEMENTS.length}</p><button class="game-action-btn word-search-restart">Reiniciar</button></div>`;
    container.querySelectorAll('.word-search-cell').forEach(cell => { cell.addEventListener('pointerdown', e => { e.preventDefault(); start = { row: Number(cell.dataset.row), col: Number(cell.dataset.col) }; current = start; }); cell.addEventListener('pointerenter', () => { if (start) current = { row: Number(cell.dataset.row), col: Number(cell.dataset.col) }; }); cell.addEventListener('pointerup', () => { if (!start) return; selectLine(start, current || { row: Number(cell.dataset.row), col: Number(cell.dataset.col) }); start = null; current = null; }); });
    container.querySelector('.word-search-restart').addEventListener('click', render);
  }
  function selectLine(from, to) {
    const rowDiff = to.row - from.row, colDiff = to.col - from.col;
    const length = Math.max(Math.abs(rowDiff), Math.abs(colDiff)) + 1;
    if (!(rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff))) return;
    const stepRow = Math.sign(rowDiff), stepCol = Math.sign(colDiff);
    const word = Array.from({ length }, (_, i) => grid[from.row + stepRow * i][from.col + stepCol * i]).join('');
    const reversed = word.split('').reverse().join('');
    const match = PLACEMENTS.find(item => !found.has(item.word) && (item.word === word || item.word === reversed));
    if (!match) return;
    found.add(match.word);
    for (let i = 0; i < length; i++) cellAt(from.row + stepRow * i, from.col + stepCol * i)?.classList.add('is-found');
    container.querySelector(`[data-word="${match.word}"]`).classList.add('is-found');
    container.querySelector('.word-feedback').textContent = found.size === PLACEMENTS.length ? 'Parabéns! Você encontrou todas as palavras.' : `Palavras encontradas: ${found.size} de ${PLACEMENTS.length}`;
  }
  function mount(el) { container = el; render(); }
  function unmount() { if (container) container.innerHTML = ''; container = null; grid = null; found = null; start = null; current = null; }
  return { mount, unmount };
})();
