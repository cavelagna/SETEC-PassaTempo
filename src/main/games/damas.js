'use strict';

const Checkers = (() => {
  const SIZE = 8;
  let container;
  let board = [];
  let turn = 'light';
  let selected = -1;
  let moves = [];
  let mustCapture = false;
  let lastMove = null;

  function createBoard() {
    board = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if ((row + col) % 2 === 1) board[row][col] = row < 4 ? { player: 'dark', king: false } : { player: 'light', king: false };
      }
    }
    turn = 'light';
    selected = -1;
    moves = [];
    mustCapture = false;
    lastMove = null;
  }

  function isInside(row, col) { return row >= 0 && row < SIZE && col >= 0 && col < SIZE; }
  function opponent(player) { return player === 'light' ? 'dark' : 'light'; }
  function directions(piece) {
    const forward = piece.player === 'light' ? -1 : 1;
    return piece.king ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : [[forward, 1], [forward, -1]];
  }

  function collectCaptures(row, col, captured, currentMoves, path, source) {
    const piece = board[row][col];
    if (!piece) return;
    let extended = false;
    for (const [dr, dc] of directions(piece)) {
      const jumpedRow = row + dr;
      const jumpedCol = col + dc;
      const endRow = row + dr * 2;
      const endCol = col + dc * 2;
      if (!isInside(endRow, endCol) || board[endRow][endCol] || !board[jumpedRow]?.[jumpedCol]) continue;
      const jumped = board[jumpedRow][jumpedCol];
      if (jumped.player === piece.player || captured.includes(`${jumpedRow},${jumpedCol}`)) continue;
      const nextCaptured = [...captured, `${jumpedRow},${jumpedCol}`];
      const nextPath = [...path, { row: endRow, col: endCol, captures: nextCaptured, from: source }];
      const hadMoreCaptures = collectCaptures(endRow, endCol, nextCaptured, currentMoves, nextPath, source);
      if (!hadMoreCaptures) currentMoves.push(...nextPath);
      extended = true;
    }
    if (extended) return true;
    if (path.length) {
      const last = path[path.length - 1];
      if (last.row !== source.row || last.col !== source.col) currentMoves.push({ ...last, from: source });
    }
    return false;
  }

  function getMoves(row, col, onlyCaptures = false) {
    const piece = board[row]?.[col];
    if (!piece || piece.player !== turn) return [];
    const result = [];
    const path = [];
    const source = { row, col };
    const extended = collectCaptures(row, col, [], result, path, source);
    if (extended || onlyCaptures) return result;
    for (const [dr, dc] of directions(piece)) {
      const nextRow = row + dr;
      const nextCol = col + dc;
      if (isInside(nextRow, nextCol) && !board[nextRow][nextCol]) {
        result.push({ row: nextRow, col: nextCol, captures: [], from: { row, col } });
      }
    }
    return result;
  }

  function allMoves() {
    const result = [];
    for (let row = 0; row < SIZE; row++) for (let col = 0; col < SIZE; col++) result.push(...getMoves(row, col, mustCapture));
    return result;
  }

  function pieceLabel(piece) {
    if (!piece) return '';
    return piece.king ? 'Dama' : 'Peça';
  }

  function render(message = mustCapture ? 'É obrigatória uma captura nesta jogada.' : `Vez das peças ${turn === 'light' ? 'claras' : 'escuras'}.`) {
    const cells = [];
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        const piece = board[row][col];
        const isSelected = selected === row * SIZE + col;
        const available = moves.some(move => move.row === row && move.col === col);
        const className = `checkers-cell ${(row + col) % 2 ? 'is-dark' : 'is-light'} ${isSelected ? 'is-selected' : ''} ${available ? 'is-available' : ''}`;
        cells.push(`<button type="button" class="${className}" data-row="${row}" data-col="${col}" aria-label="${piece ? `${pieceLabel(piece)} ${piece.player === 'light' ? 'clara' : 'escura'}, linha ${row + 1}, coluna ${col + 1}` : `Casa vazia, linha ${row + 1}, coluna ${col + 1}`}" ${piece && piece.player !== turn ? 'disabled' : ''}><span class="checkers-piece ${piece ? piece.player : ''} ${piece?.king ? 'is-king' : ''}">${piece ? (piece.king ? 'D' : 'P') : ''}</span></button>`);
      }
    }
    container.innerHTML = `<section class="checkers-game"><div class="checkers-header"><div><p class="game-eyebrow">Clássicos</p><h3>Damas</h3></div><div class="checkers-turn"><span class="checkers-turn-dot ${turn}"></span><span>${turn === 'light' ? 'Claras' : 'Escuras'}</span></div></div><div class="checkers-board" role="grid" aria-label="Tabuleiro de damas">${cells.join('')}</div><p class="checkers-message" role="status" aria-live="polite">${message}</p><div class="checkers-actions"><button class="game-action-btn checkers-undo" type="button" ${lastMove ? '' : 'disabled'}>Desfazer lance</button><button class="game-action-btn checkers-reset" type="button">Reiniciar jogo</button></div></section>`;
  }

  function selectCell(row, col) {
    const index = row * SIZE + col;
    const piece = board[row][col];
    if (selected >= 0 && moves.some(move => move.row === row && move.col === col)) {
      makeMove(row, col);
      return;
    }
    if (piece?.player === turn) {
      selected = index;
      moves = getMoves(row, col, mustCapture);
      if (!moves.length) {
        selected = -1;
        render('Esta peça não possui uma jogada disponível agora.');
      } else render('Escolha uma casa destacada para mover a peça.');
      return;
    }
    selected = -1;
    moves = [];
    render();
  }

  function makeMove(row, col) {
    const fromRow = Math.floor(selected / SIZE);
    const fromCol = selected % SIZE;
    const move = moves.find(item => item.row === row && item.col === col && item.from?.row === fromRow && item.from?.col === fromCol);
    if (!move) return;
    const piece = board[fromRow][fromCol];
    const captured = move.captures.map(key => key.split(',').map(Number));
    const previousBoard = board.map(line => line.map(cell => cell && { ...cell }));
    const previousTurn = turn;
    const previousLastMove = lastMove;

    for (const [capRow, capCol] of captured) board[capRow][capCol] = null;
    board[fromRow][fromCol] = null;
    board[row][col] = piece;
    if (piece.player === 'light' && row === 0) piece.king = true;
    if (piece.player === 'dark' && row === SIZE - 1) piece.king = true;
    lastMove = { before: previousBoard, turn: previousTurn, move: previousLastMove };

    const nextCaptures = getMoves(row, col, true);
    if (nextCaptures.length) {
      selected = row * SIZE + col;
      moves = nextCaptures;
      render('Você pode continuar capturando com a mesma peça.');
      return;
    }

    turn = opponent(turn);
    selected = -1;
    moves = [];
    const legal = allMoves();
    mustCapture = legal.some(move => move.captures.length);
    const winner = checkWinner();
    render(winner || (mustCapture ? 'A captura é obrigatória nesta jogada.' : `Vez das peças ${turn === 'light' ? 'claras' : 'escuras'}.`));
    if (winner) window.dispatchEvent(new CustomEvent('passatempo:result', { detail: { result: 'win' } }));
  }

  function checkWinner() {
    let light = 0;
    let dark = 0;
    board.flat().forEach(piece => { if (piece) piece.player === 'light' ? light++ : dark++; });
    if (!dark) return 'Você venceu!';
    if (!light) return 'Você perdeu.';
    if (!allMoves().length) return 'Empate: nenhuma jogada legal disponível.';
    return '';
  }

  function click(event) {
    const cell = event.target.closest('.checkers-cell');
    if (cell) { selectCell(Number(cell.dataset.row), Number(cell.dataset.col)); return; }
    if (event.target.closest('.checkers-undo') && lastMove) {
      board = lastMove.before;
      turn = lastMove.turn;
      lastMove = lastMove.move;
      selected = -1;
      moves = [];
      const legal = allMoves();
      mustCapture = legal.some(move => move.captures.length);
      render('Lance desfeito. A partida continua no estado anterior.');
      return;
    }
    if (event.target.closest('.checkers-reset')) { createBoard(); render('Nova partida. As peças claras começam.'); }
  }

  function mount(el) { container = el; createBoard(); render('Nova partida. As peças claras começam.'); container.addEventListener('click', click); }
  function unmount() { if (container) { container.removeEventListener('click', click); container.innerHTML = ''; } container = null; }
  return { mount, unmount };
})();
