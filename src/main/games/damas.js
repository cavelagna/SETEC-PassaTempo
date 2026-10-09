'use strict';

/* Jogo da Dama (checkers) para duas pessoas.
 * Regras: movimento diagonal curto para peças e qualquer diagonal para damas,
 * captura obrigatória, captura múltipla em sequência, promoção ao chegar no
 * outro lado e bloqueio quando não há peça adversária.
 */
const Checkers = (() => {
  const SIZE = 8;
  const LIGHT = 'light';
  const DARK = 'dark';

  let container = null;
  let board = [];
  let turn = LIGHT;
  let selected = -1;
  let moves = [];
  let mustCapture = false;   // apenas para aviso na interface
  let chainLocked = false;   // sequência de capturas em curso: só a peça que comeu joga
  let undoStack = [];
  let gameOver = false;

  // ── Tabelas ───────────────────────────────────────────────
  const isInside = (r, c) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;
  const opponent = p => (p === LIGHT ? DARK : LIGHT);
  const colorName = p => (p === LIGHT ? 'claras' : 'escuras');
  const sqLabel = (r, c) => String.fromCharCode(97 + c) + (SIZE - r);
  const cellKey = (r, c) => r + ',' + c;

  function directions(piece) {
    const forward = piece.player === LIGHT ? -1 : 1;
    return piece.king
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : [[forward, -1], [forward, 1]];
  }

  const goalRow = player => (player === LIGHT ? 0 : SIZE - 1);

  // ── Tabuleiro ─────────────────────────────────────────────
  // 12 peças por lado: as escuras ocupam as três primeiras fileiras jogáveis
  // e as claras as três últimas, sempre sobre as casas escuras.
  function createBoard() {
    board = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if ((r + c) % 2 !== 1) continue;
        if (r <= 2) board[r][c] = { player: DARK, king: false };
        else if (r >= 5) board[r][c] = { player: LIGHT, king: false };
      }
    }
    turn = LIGHT;
    selected = -1;
    moves = [];
    undoStack = [];
    gameOver = false;
    chainLocked = false;
    refreshMustCapture();
  }

  function snapshot() {
    return {
      board: board.map(row => row.map(cell => (cell ? { ...cell } : null))),
      turn,
      mustCapture,
      gameOver,
    };
  }

  function restore(state) {
    board = state.board.map(row => row.map(cell => (cell ? { ...cell } : null)));
    turn = state.turn;
    mustCapture = state.mustCapture;
    gameOver = state.gameOver;
    chainLocked = false;
    selected = -1;
    moves = [];
  }

  // ── Geração de movimentos ─────────────────────────────────
  // Busca em profundidade: cada recursão é um salto adicional da mesma peça,
  // guardando as casas por onde ela passou e as peças já capturadas.
  function collectJumps(row, col, captured, path, results) {
    const piece = board[row][col];
    if (!piece) return false;

    let extended = false;

    for (const [dr, dc] of directions(piece)) {
      const jumpRow = row + dr;
      const jumpCol = col + dc;
      const landRow = row + dr * 2;
      const landCol = col + dc * 2;

      if (!isInside(landRow, landCol)) continue;
      if (board[landRow][landCol]) continue;                       // precisa cair em casa livre

      const victim = isInside(jumpRow, jumpCol) ? board[jumpRow][jumpCol] : null;
      if (!victim || victim.player === piece.player) continue;     // só salta peça inimiga
      if (captured.has(cellKey(jumpRow, jumpCol))) continue;       // não salta a mesma peça duas vezes

      const nextCaptured = new Set(captured);
      nextCaptured.add(cellKey(jumpRow, jumpCol));

      const nextPath = path.concat([{
        row: landRow,
        col: landCol,
        jump: { row: jumpRow, col: jumpCol },
        wasKing: piece.king,
      }]);

      extended = true;
      if (!collectJumps(landRow, landCol, nextCaptured, nextPath, results)) {
        results.push(nextPath);
      }
    }

    return extended;
  }

  // Retorna [{ row, col, path, capture }], onde path é a sequência de saltos.
  // Movimentos simples e capturas convivem: capturar é uma opção, não uma ordem.
  function stepsFor(row, col) {
    const piece = board[row][col];
    if (!piece) return [];

    const capturedPaths = [];
    collectJumps(row, col, new Set(), [], capturedPaths);
    const captures = capturedPaths.map(path => ({
      row: path[path.length - 1].row,
      col: path[path.length - 1].col,
      path,
      capture: true,
    }));

    const simple = [];
    for (const [dr, dc] of directions(piece)) {
      const nr = row + dr;
      const nc = col + dc;
      if (isInside(nr, nc) && !board[nr][nc]) {
        simple.push({
          row: nr, col: nc, capture: false,
          path: [{ row: nr, col: nc, jump: null, wasKing: piece.king }],
        });
      }
    }

    // A peça não pode atravessar uma casa bloqueada por peça adversária.
    const blocked = new Set();
    for (const step of captures) {
      for (const hop of step.path) {
        blocked.add(cellKey(hop.row, hop.col));
        if (hop.jump) blocked.add(cellKey(hop.jump.row, hop.jump.col));
      }
    }

    return captures.concat(simple.filter(step => !blocked.has(cellKey(step.row, step.col))));
  }

  // Lista os lances da peça: se ela tem captura disponível, só as capturas
  // são permitidas — a captura é obrigatória.
  function stepsFrom(row, col) {
    if (!board[row] || !board[row][col] || board[row][col].player !== turn) return [];
    const steps = stepsFor(row, col);
    const captures = steps.filter(step => step.capture);
    if (mustCapture) return captures;
    return captures.length ? captures : steps;
  }

  function allSteps() {
    const list = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) list.push(...stepsFrom(r, c));
    }
    return list;
  }

  // Indica na interface que existe captura disponível nesta rodada.
  // stepsFrom() já garante que a captura é a única jogada permitida.
  function refreshMustCapture() {
    mustCapture = false;
    for (let r = 0; r < SIZE && !mustCapture; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!board[r][c] || board[r][c].player !== turn) continue;
        if (stepsFor(r, c).some(step => step.path.some(hop => hop.jump))) {
          mustCapture = true;
          break;
        }
      }
    }
  }

  function pieceCount(player) {
    let total = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) if (board[r][c] && board[r][c].player === player) total++;
    }
    return total;
  }

  function evaluateBoard() {
    if (!pieceCount(DARK)) return { over: true, result: 'win', text: 'Você venceu! As pretas ficaram sem peças.' };
    if (!pieceCount(LIGHT)) return { over: true, result: 'loss', text: 'Você perdeu. As claras ficaram sem peças.' };
    if (!allSteps().length) return { over: true, result: 'draw', text: 'Empate: nenhuma jogada legal disponível.' };
    return null;
  }

  // ── Renderização ──────────────────────────────────────────
  function render(message) {
    if (!container) return;

    const captureSteps = new Map();
    for (const step of moves) {
      if (step.capture) captureSteps.set(cellKey(step.row, step.col), true);
    }
    const available = new Set(moves.map(step => cellKey(step.row, step.col)));
    const cells = [];

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const piece = board[r][c];
        const isSelected = selected === r * SIZE + c;
        const isAvailable = available.has(cellKey(r, c));
        const isCapture = captureSteps.get(cellKey(r, c)) === true;
        const classes = ['checkers-cell', (r + c) % 2 ? 'is-dark' : 'is-light'];
        if (isSelected) classes.push('is-selected');
        if (isAvailable) classes.push('is-available');
        if (isCapture) classes.push('is-capture');

        const pieceLabel = piece ? (piece.king ? 'Dama' : 'Peça') + ' ' + colorName(piece.player) : 'Casa vazia';
        const hint = isCapture ? ', casa de captura'
          : isAvailable ? ', casa de destino'
          : '';

        cells.push(
          `<button type="button" class="${classes.join(' ')}" data-row="${r}" data-col="${c}"` +
          ` aria-label="${sqLabel(r, c)}: ${pieceLabel}${hint}" aria-pressed="${isSelected}">` +
          (piece ? `<span class="checkers-piece ${piece.player}${piece.king ? ' is-king' : ''}" aria-hidden="true">${piece.king ? 'D' : 'P'}</span>` : '') +
          '</button>'
        );
      }
    }

    container.innerHTML =
      '<section class="checkers-game">' +
      '<div class="checkers-header">' +
      '<div><p class="game-eyebrow">Dois jogadores</p><h3>Damas</h3></div>' +
      '<div class="checkers-turn"><span class="checkers-turn-dot ' + turn + '" aria-hidden="true"></span>' +
      '<span>' + (gameOver ? 'Partida encerrada' : 'Vez das ' + colorName(turn)) + '</span></div>' +
      '</div>' +
      '<p class="checkers-message" role="status" aria-live="polite">' + (message || defaultMessage()) + '</p>' +
      '<p class="checkers-hint">Captura é obrigatória: se houver peça para comer, você só pode jogá-la. E, depois de capturar, é obrigatório continuar o salto com a mesma peça enquanto houver captura possível.</p>' +
      '<div class="checkers-board" role="grid" aria-label="Tabuleiro de damas">' + cells.join('') + '</div>' +
      '<div class="checkers-score">' +
      '<span>Claras <strong>' + pieceCount(LIGHT) + '</strong></span>' +
      '<span>Escuras <strong>' + pieceCount(DARK) + '</strong></span>' +
      '<span>Lances <strong>' + undoStack.length + '</strong></span>' +
      '</div>' +
      '<div class="checkers-actions">' +
      '<button class="game-action-btn checkers-undo" type="button"' + (undoStack.length ? '' : ' disabled') + '>Desfazer lance</button>' +
      '<button class="game-action-btn checkers-reset" type="button">Reiniciar jogo</button>' +
      '</div>' +
      '</section>';
  }

  function defaultMessage() {
    if (gameOver) return 'Use Reiniciar jogo para começar outra partida.';
    if (mustCapture) return 'Captura obrigatória nesta rodada: escolha uma peça marcada com anel.';
    return 'Escolha uma peça para ver os destinos possíveis.';
  }

  // ── Jogada ────────────────────────────────────────────────
  // Conta quantas peças ainda podem ser capturadas a partir de uma casa.
  function countCaptures(steps) {
    return steps.reduce((total, step) => total + step.path.filter(hop => hop.jump).length, 0);
  }

  function selectCell(row, col) {
    if (gameOver) { render(); return; }

    // Durante a sequência de capturas, o lance é direto: só vale clicar numa
    // casa de salto da MESMA peça. Chegar perto de uma peça não encerra nada —
    // o turno só acaba quando o jogador realmente come.
    if (chainLocked) {
      const step = moves.find(item => item.row === row && item.col === col);
      if (step) { applyMove(row, col, step); return; }
      render('Captura em sequência: você precisa saltar com a mesma peça.');
      return;
    }

    if (selected >= 0) {
      const step = moves.find(item => item.row === row && item.col === col);
      if (step) { applyMove(row, col, step); return; }
    }

    const piece = board[row][col];
    if (piece && piece.player === turn) {
      const options = stepsFrom(row, col);
      if (options.length) {
        selected = row * SIZE + col;
        moves = options;
        const capturas = options.filter(step => step.capture).length;
        render(capturas
          ? 'Captura obrigatória: escolha uma casa com anel para comer a peça.'
          : 'Agora escolha a casa destacada para concluir o lance.');
        return;
      }
    }

    selected = -1;
    moves = [];
    render();
  }

  function applyMove(row, col, step) {
    undoStack.push(snapshot());

    const fromRow = Math.floor(selected / SIZE);
    const fromCol = selected % SIZE;
    const piece = board[fromRow][fromCol];

    for (const hop of step.path) {
      if (hop.jump) board[hop.jump.row][hop.jump.col] = null;
    }

    board[fromRow][fromCol] = null;
    board[row][col] = { player: piece.player, king: piece.king };

    // Promoção: peça comum que chega à fileira adversária vira dama.
    // Uma peça que termina a captura já pode ser promovida e ainda
    // salta para trás — por isso a checagem acontece antes da sequência.
    const reachedGoal = row === goalRow(piece.player);
    if (reachedGoal && step.path.every(hop => !hop.wasKing)) board[row][col].king = true;

    const capturedCount = step.path.filter(hop => hop.jump).length;

    // Captura múltipla: a sequência SÓ continua se a peça acabou de COMER.
    // Se o lance foi um movimento simples (nada capturado), o turno passa,
    // mesmo que a peça tenha chegado perto de uma peça adversária.
    const chained = capturedCount > 0
      ? stepsFor(row, col).filter(option => option.capture)
      : [];
    if (chained.length && !evaluateBoard()) {
      // Captura múltipla obrigatória: só a mesma peça pode seguir saltando.
      selected = row * SIZE + col;
      moves = chained;
      chainLocked = true;
      const total = capturedCount + countCaptures(chained);
      render('Captura múltipla obrigatória: continue saltando com a mesma peça (' +
        total + ' em sequência).');
      return;
    }

    turn = opponent(turn);
    selected = -1;
    moves = [];
    chainLocked = false;
    refreshMustCapture();

    const verdict = evaluateBoard();
    gameOver = !!(verdict && verdict.over);

    let message;
    if (verdict) message = verdict.text;
    else if (board[row][col].king && capturedCount === 0) message = 'Promoção! Sua peça virou dama.';
    else if (capturedCount > 1) message = 'Captura múltipla: ' + capturedCount + ' peças capturadas.';
    else if (capturedCount === 1) message = 'Peça capturada.';
    else message = 'Lance simples.';

    if (!verdict && mustCapture) message = 'Você tem uma captura obrigatória nesta rodada.';

    render(message);

    if (verdict) {
      window.dispatchEvent(new CustomEvent('passatempo:result', { detail: { result: verdict.result } }));
    }
  }

  function undo() {
    const previous = undoStack.pop();
    if (!previous) return;
    restore(previous);
    render('Lance desfeito. A partida continua no estado anterior.');
  }

  function reset() {
    createBoard();
    render('Nova partida. As peças claras começam.');
  }

  // ── Eventos ───────────────────────────────────────────────
  function handleClick(event) {
    const cell = event.target.closest('.checkers-cell');
    if (cell) { selectCell(Number(cell.dataset.row), Number(cell.dataset.col)); return; }
    if (event.target.closest('.checkers-reset')) { reset(); return; }
    if (event.target.closest('.checkers-undo')) { undo(); }
  }

  function mount(el) {
    container = el;
    createBoard();
    render('Nova partida. As peças claras começam.');
    container.addEventListener('click', handleClick);
  }

  function unmount() {
    if (container) {
      container.removeEventListener('click', handleClick);
      container.innerHTML = '';
    }
    container = null;
    board = [];
  }

  return { mount, unmount };
})();
