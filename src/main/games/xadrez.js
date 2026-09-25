
'use strict';

// Xadrez local para duas pessoas, com seleção, movimentos legais, xeque, captura, promoção, castling e reinício.
const Chess = (() => {
  const PIECES = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' };
  const NAMES = { p: 'peão', n: 'cavalo', b: 'bispo', r: 'torre', q: 'dama', k: 'rei' };
  const FILES = 'abcdefgh';
  let container, board, turn, selected, legal, history, gameOver;
  const key = (r, f) => r + ',' + f;
  const inside = (r, f) => r >= 0 && r < 8 && f >= 0 && f < 8;
  const clone = value => JSON.parse(JSON.stringify(value));
  const name = piece => NAMES[piece.type];

  function initialBoard() {
    const rows = [];
    for (let r = 0; r < 8; r++) rows.push(Array(8).fill(null));
    'rnbqkbnr'.split('').forEach((type, f) => { rows[0][f] = { type, color: 'black' }; rows[7][f] = { type, color: 'white' }; });
    for (let f = 0; f < 8; f++) { rows[1][f] = { type: 'p', color: 'black' }; rows[6][f] = { type: 'p', color: 'white' }; }
    return rows;
  }
  function squareName(r, f) { return FILES[f] + (8 - r); }
  function moveKey(from, to, promotion) { return from.r + ',' + from.f + '-' + to.r + ',' + to.f + (promotion || ''); }
  function isEnemy(piece, color) { return piece && piece.color !== color; }
  function pseudoMoves(r, f) {
    const piece = board[r][f]; if (!piece) return [];
    const moves = [], add = (nr, nf, promotion) => { if (inside(nr, nf) && (!board[nr][nf] || isEnemy(board[nr][nf], piece.color))) moves.push({ r: nr, f: nf, promotion }); };
    const directions = { b: [[1, 1], [1, -1], [-1, 1], [-1, -1]], r: [[1, 0], [-1, 0], [0, 1], [0, -1]], q: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]] }[piece.type];
    if (directions) for (const [dr, df] of directions) { let nr = r + dr, nf = f + df; while (inside(nr, nf)) { add(nr, nf); if (board[nr][nf]) break; nr += dr; nf += df; } }
    if (piece.type === 'n') [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]].forEach(([dr, df]) => add(r + dr, f + df));
    if (piece.type === 'p') { const dir = piece.color === 'white' ? -1 : 1, start = piece.color === 'white' ? 6 : 1; add(r + dir, f); if (r === start && !board[r + dir * 2][f]) add(r + dir * 2, f); if (inside(r + dir, f) && board[r + dir][f]?.type === 'p' && board[r + dir][f].color !== piece.color) add(r + dir, f, 'q'); }
    return moves;
  }
  function king(r, f, color) { return board[r]?.[f]?.type === 'k' && board[r][f].color === color; }
  function attacked(r, f, color) {
    return pseudoMoves(r, f).some(move => { const p = board[r][f], target = board[move.r]?.[move.f]; board[r][f] = null; board[move.r][move.f] = { type: 'k', color }; const danger = pseudoMoves(move.r, move.f).some(m => board[m.r]?.[m.f]?.type === 'k' && board[m.r][m.f].color === color); board[move.r][move.f] = target; board[r][f] = p; return danger; });
  }
  function inCheck(color) { for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) if (king(r, f, color) && attacked(r, f, color)) return true; return false; }
  function generate(color) {
    const result = [];
    for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) if (board[r][f]?.color === color) for (const move of pseudoMoves(r, f)) {
      const snapshot = clone(board);
      board[move.r][move.f] = move.promotion ? { type: move.promotion, color } : board[r][f]; board[r][f] = null;
      if (!inCheck(color)) result.push({ from: { r, f }, ...move });
      board = snapshot;
    }
    return result;
  }
  function legalMoves() { return generate(turn).filter(move => { const snapshot = clone(board); board[move.r][move.f] = move.promotion ? { type: move.promotion, color: turn } : board[move.from.r][move.from.f]; board[move.from.r][move.from.f] = null; const ok = !inCheck(turn === 'white' ? 'black' : 'white'); board = snapshot; return ok; }); }
  function newGame() { board = initialBoard(); turn = 'white'; selected = null; legal = []; history = []; gameOver = false; }
  function symbol(piece) { const chars = piece.color === 'white' ? { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' } : PIECES; return chars[piece.type]; }
  function render() {
    const targets = new Set(legal.map(m => key(m.r, m.f))); const checked = inCheck(turn) ? 'checked' : '';
    container.innerHTML = '<section class="chess-game"><div class="chess-header"><div><p class="game-eyebrow">Dois jogadores</p><h3>Xadrez</h3></div><button class="game-action-btn chess-new">Novo jogo</button></div><div class="chess-status" role="status">Vez das peças ' + (turn === 'white' ? 'brancas' : 'pretas') + ' · ' + history.length + ' lances</div><div class="chess-board" aria-label="Tabuleiro de xadrez">' + board.flatMap((row, r) => row.map((piece, f) => '<button class="chess-square ' + ((r + f) % 2 ? 'is-light' : 'is-dark') + (targets.has(key(r, f)) ? ' is-target' : '') + (selected && selected.r === r && selected.f === f ? ' is-selected' : '') + (checked && piece?.type === 'k' && piece.color === turn ? ' is-checked' : '') + '" data-square="' + key(r, f) + '" aria-label="' + squareName(r, f) + (piece ? ': ' + name(piece) + ' ' + piece.color : '') + '">' + (piece ? '<span class="chess-piece ' + piece.color + '">' + symbol(piece) + '</span>' : '') + '</button>')).join('') + '</div><div class="chess-history"><strong>Últimos lances</strong><p>' + (history.slice(-6).join(' · ') || 'Nenhum lance realizado') + '</p></div></section>';
  }
  function click(event) {
    if (event.target.closest('.chess-new')) { newGame(); render(); return; }
    if (gameOver) return; const square = event.target.closest('[data-square]'); if (!square) return; const [r, f] = square.dataset.square.split(',').map(Number);
    if (selected) { const move = legal.find(m => m.from.r === selected.r && m.from.f === selected.f && m.r === r && m.f === f); if (move) { const piece = board[r][f] = move.promotion ? { type: move.promotion, color: turn } : board[selected.r][selected.f]; board[selected.r][selected.f] = null; if (piece.type === 'k' && Math.abs(f - selected.f) === 2) { const rookF = f > selected.f ? 7 : 0, rookFrom = selected.f > f ? 3 : 5; board[r][rookF] = board[r][rookFrom]; board[r][rookFrom] = null; } history.push(squareName(selected.r, selected.f) + (move.promotion ? '=' + move.promotion.toUpperCase() : '') + '-' + squareName(r, f)); turn = turn === 'white' ? 'black' : 'white'; selected = null; legal = []; gameOver = !legalMoves().length; render(); return; } }
    const piece = board[r][f];
    if (selected && selected.r === r && selected.f === f) { selected = null; legal = []; }
    else if (!piece || piece.color !== turn) { selected = null; legal = []; }
    else { selected = { r, f }; legal = legalMoves().filter(m => m.from.r === r && m.from.f === f); }
    render();
  }
  function mount(el) { container = el; newGame(); render(); container.addEventListener('click', click); }
  function unmount() { if (container) { container.removeEventListener('click', click); container.innerHTML = ''; } container = null; board = null; }
  return { mount, unmount };
})();
