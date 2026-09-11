'use strict';

// Jogo da Velha — módulo isolado
const TicTacToe = (() => {

  const WIN_LINES = [
    [0,1,2],[3,4,5],[6,7,8], // linhas
    [0,3,6],[1,4,7],[2,5,8], // colunas
    [0,4,8],[2,4,6],          // diagonais
  ];

  let board, player, gameOver, container;

  // Verifica resultado: retorna { type, winner, line } ou null
  function checkResult(b) {
    for (const line of WIN_LINES) {
      const [a, c, d] = line;
      if (b[a] && b[a] === b[c] && b[a] === b[d]) {
        return { type: 'win', winner: b[a], line };
      }
    }
    if (b.every(Boolean)) return { type: 'draw' };
    return null;
  }

  function handleMove(index) {
    if (gameOver || board[index]) return;
    board[index] = player;
    player = player === 'X' ? 'O' : 'X';
    updateView();
  }

  function updateView() {
    const result  = checkResult(board);
    const statusEl = container.querySelector('.ttt-status');
    const cells    = container.querySelectorAll('.ttt-cell');

    if (result) gameOver = true;

    cells.forEach((cell, i) => {
      cell.textContent = board[i] || '';
      cell.disabled    = !!(board[i] || gameOver);
      cell.classList.toggle('ttt-cell--x',   board[i] === 'X');
      cell.classList.toggle('ttt-cell--o',   board[i] === 'O');
      cell.classList.remove('ttt-cell--win');

      const label = board[i]
        ? `Célula ${i + 1}: ${board[i]}`
        : `Célula ${i + 1}, vazia`;
      cell.setAttribute('aria-label', label);
    });

    if (result?.type === 'win') {
      result.line.forEach(i => cells[i].classList.add('ttt-cell--win'));
      statusEl.textContent = `${result.winner} venceu!`;
    } else if (result?.type === 'draw') {
      statusEl.textContent = 'Empate.';
    } else {
      statusEl.textContent = `Vez de ${player}`;
    }
  }

  function resetGame() {
    board    = Array(9).fill('');
    player   = 'X';
    gameOver = false;
    updateView();
  }

  function mount(el) {
    container = el;

    // Monta estrutura HTML
    container.innerHTML = `
      <div class="ttt-wrap">
        <p class="ttt-status" role="status" aria-live="polite">Vez de X</p>
        <div class="ttt-grid" role="grid" aria-label="Grade do Jogo da Velha">
          ${Array.from({ length: 9 }, (_, i) =>
            `<button class="ttt-cell" data-i="${i}"
               aria-label="Célula ${i + 1}, vazia"
               aria-rowindex="${Math.floor(i / 3) + 1}"
               aria-colindex="${(i % 3) + 1}">
             </button>`
          ).join('')}
        </div>
        <button class="game-action-btn ttt-restart">Reiniciar</button>
      </div>
    `;

    board    = Array(9).fill('');
    player   = 'X';
    gameOver = false;

    // Eventos
    container.querySelectorAll('.ttt-cell').forEach((cell, i) => {
      cell.addEventListener('click', () => handleMove(i));
    });

    container.querySelector('.ttt-restart').addEventListener('click', resetGame);
  }

  function unmount() {
    if (container) container.innerHTML = '';
    container = null;
  }

  return { mount, unmount };
})();
