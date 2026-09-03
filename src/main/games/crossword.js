'use strict';

const Crossword = (() => {
  const SIZE = 7;
  const WORDS = [
    { word: 'AMOR', clue: 'Sentimento de afeto e cuidado.', row: 0, col: 2, direction: 'down' },
    { word: 'MESA', clue: 'Móvel usado para estudar.', row: 1, col: 2, direction: 'across' },
    { word: 'BOLA', clue: 'Objeto redondo usado em muitos jogos.', row: 2, col: 1, direction: 'across' },
  ];
  let container, cells, selected;

  function makeGrid() {
    const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
    WORDS.forEach(item => [...item.word].forEach((letter, offset) => {
      const row = item.row + (item.direction === 'down' ? offset : 0);
      const col = item.col + (item.direction === 'across' ? offset : 0);
      grid[row][col] = { letter, words: [...(grid[row][col]?.words || []), item.word] };
    }));
    return grid;
  }

  function render() {
    const grid = makeGrid();
    container.innerHTML = `<div class="word-game crossword-game"><div class="word-game-intro"><p class="game-eyebrow">Pistas e cruzamentos</p><h3>Palavras Cruzadas</h3><p>Descubra as palavras pelas pistas e preencha a grade com o teclado.</p></div><div class="crossword-layout"><div class="crossword-grid" role="grid" aria-label="Grade de palavras cruzadas">${grid.flatMap((row, r) => row.map((cell, c) => cell ? `<button class="crossword-cell" data-row="${r}" data-col="${c}" aria-label="Linha ${r + 1}, coluna ${c + 1}"></button>` : '<span class="crossword-block" aria-hidden="true"></span>')).join('')}</div><ol class="crossword-clues">${WORDS.map(item => `<li><strong>${item.word.length}</strong> ${item.clue}</li>`).join('')}</ol></div><p class="word-feedback" role="status" aria-live="polite">Selecione uma casa para começar.</p><button class="game-action-btn crossword-restart">Reiniciar</button></div>`;
    cells = [...container.querySelectorAll('.crossword-cell')];
    cells.forEach(cell => cell.addEventListener('click', () => select(Number(cell.dataset.row), Number(cell.dataset.col))));
    container.querySelector('.crossword-restart').addEventListener('click', render);
  }

  function select(row, col) { selected = { row, col }; cells.forEach(cell => cell.classList.toggle('is-selected', Number(cell.dataset.row) === row && Number(cell.dataset.col) === col)); }
  function handleKey(event) {
    if (!selected || event.target.closest('.crossword-restart')) return;
    if (/^[a-zA-ZÀ-ÿ]$/.test(event.key)) { const cell = cells.find(item => Number(item.dataset.row) === selected.row && Number(item.dataset.col) === selected.col); cell.textContent = event.key.toUpperCase(); cell.dataset.value = event.key.toUpperCase(); check(); move(0, 1); }
    if (event.key === 'Backspace') { const cell = cells.find(item => Number(item.dataset.row) === selected.row && Number(item.dataset.col) === selected.col); cell.textContent = ''; delete cell.dataset.value; }
    if (event.key.startsWith('Arrow')) { event.preventDefault(); move(event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0, event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0); }
  }
  function move(rowDelta, colDelta) { const next = cells.find(cell => Number(cell.dataset.row) === selected.row + rowDelta && Number(cell.dataset.col) === selected.col + colDelta); if (next) select(Number(next.dataset.row), Number(next.dataset.col)); }
  function check() { const complete = WORDS.every(item => [...item.word].every((letter, offset) => { const row = item.row + (item.direction === 'down' ? offset : 0); const col = item.col + (item.direction === 'across' ? offset : 0); const cell = cells.find(item => Number(item.dataset.row) === row && Number(item.dataset.col) === col); return cell?.dataset.value === letter; })); if (complete) container.querySelector('.word-feedback').textContent = 'Parabéns! Você completou todas as palavras.'; }
  function mount(el) { container = el; selected = null; container.addEventListener('keydown', handleKey); render(); }
  function unmount() { if (container) container.innerHTML = ''; container = null; cells = null; selected = null; }
  return { mount, unmount };
})();
