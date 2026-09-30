'use strict';

/* Tetris — encaixe de peças numa grade.
 * Regras: as peças caem, você as move para os lados e rotaciona.
 * Ao completar uma ou mais linhas, elas somem e as de cima descem.
 * A partida acaba quando uma peça nova não encontra espaço para entrar.
 */
const BlockPuzzle = (() => {
  const COLS = 10;
  const ROWS = 18;
  const HIDDEN_ROWS = 2;          // linhas reservadas acima da grade visível

  // Cada peça é uma matriz; 1 = bloco preenchido.
  const SHAPES = {
    I: [[1, 1, 1, 1]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    Z: [[1, 1, 0], [0, 1, 1]],
    J: [[1, 0, 0], [1, 1, 1]],
    L: [[0, 0, 1], [1, 1, 1]],
  };
  const KEYS = Object.keys(SHAPES);

  const SCORE_LINES = [0, 100, 300, 500, 800];   // 0, 1, 2, 3, 4 linhas

  let container = null;
  let board = [];
  let bag = [];
  let current = null;
  let next = null;
  let hold = null;
  let canHold = true;
  let score = 0;
  let lines = 0;
  let level = 1;
  let dropTimer = null;
  let gameOver = false;
  let paused = false;

  // ── Utilidades ───────────────────────────────────────────
  // A guarda guarda 0 = vazia, 1 a 7 = peça sólida (o número indica a tonalidade).
  const EMPTY = 0;
  const GHOST = -1;

  function emptyGrid() {
    return Array.from({ length: ROWS + HIDDEN_ROWS }, () => new Array(COLS).fill(EMPTY));
  }

  function rotateMatrix(matrix) {
    const rotated = matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
    return rotated;
  }

  function shapeCells(matrix) {
    const cells = [];
    matrix.forEach((row, r) => row.forEach((value, c) => { if (value) cells.push([r, c]); }));
    return cells;
  }

  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Sorteia em "sacos": todas as peças aparecem antes de repetir.
  function refilBag() {
    bag = shuffle(KEYS);
  }

  function nextKey() {
    if (!bag.length) refilBag();
    return bag.pop();
  }

  function spawn(key) {
    const matrix = SHAPES[key].map(row => row.slice());
    return {
      key,
      matrix,
      x: Math.floor((COLS - matrix[0].length) / 2),
      y: HIDDEN_ROWS,
    };
  }

  // ── Colisão ──────────────────────────────────────────────
  function collides(piece, offsetX, offsetY, shapeMatrix) {
    const matrix = shapeMatrix || piece.matrix;
    const cells = shapeCells(matrix);
    return cells.some(([r, c]) => {
      const y = (piece.y + offsetY) + r;
      const x = (piece.x + offsetX) + c;
      if (x < 0 || x >= COLS || y >= ROWS + HIDDEN_ROWS) return true;
      if (y < 0) return false;
      return board[y][x] !== EMPTY;
    });
  }

  function fits(piece) {
    return !collides(piece, 0, 0);
  }

  // ── Movimento ────────────────────────────────────────────
  function move(dx) {
    if (!current || gameOver || paused) return;
    if (!collides(current, dx, 0)) { current.x += dx; render(); }
  }

  function moveDown(manual) {
    if (!current || gameOver || paused) return;
    if (!collides(current, 0, 1)) {
      current.y += 1;
      if (manual) score += 1;
      render();
      resetDropTimer();
      return;
    }
    lockPiece();
  }

  // Rotaciona; se a posição travada, desloca a peça até um canto livre.
  function rotateWithKick() {
    if (!current || gameOver || paused) return;
    const rotated = rotateMatrix(current.matrix);
    if (!collides(current, 0, 0, rotated)) {
      current.matrix = rotated;
      render();
      return;
    }
    for (const dx of [-1, 1, -2, 2]) {
      if (!collides(current, dx, 0, rotated)) {
        current.matrix = rotated;
        current.x += dx;
        render();
        return;
      }
    }
  }

  // ── Travamento e pontuação ────────────────────────────────
  function lockPiece() {
    const tone = PIECE_TONE[current.key] + 1;
    shapeCells(current.matrix).forEach(([r, c]) => {
      const y = current.y + r;
      const x = current.x + c;
      if (y >= 0 && y < ROWS + HIDDEN_ROWS && x >= 0 && x < COLS) board[y][x] = tone;
    });

    const cleared = [];
    for (let y = 0; y < ROWS + HIDDEN_ROWS; y++) {
      if (board[y].every(cell => cell !== EMPTY)) cleared.push(y);
    }

    if (cleared.length) {
      // Remove as linhas completas e puxa as de cima para baixo.
      const keep = board.filter((_, y) => !cleared.includes(y));
      while (keep.length < ROWS + HIDDEN_ROWS) keep.unshift(new Array(COLS).fill(EMPTY));
      board = keep;
      score += SCORE_LINES[cleared.length] * level;
      lines += cleared.length;
      level = 1 + Math.floor(lines / 10);
      lastMessage = cleared.length === 4
        ? 'Quatro linhas de uma vez!'
        : cleared.length === 1 ? 'Linha completa!' : cleared.length + ' linhas completas!';
    } else {
      lastMessage = '';
    }

    canHold = true;
    advancePiece();
    checkGameOver();
    render();
    resetDropTimer();
  }

  function advancePiece() {
    // A peça atual é SEMPRE a que já estava anunciada em "Próxima" (spawn não
    // sorteia nada). Só depois de usar essa peça é que a nova é sorteada e
    // exibida como próxima — assim a previsão nunca mente.
    if (!next) next = nextKey();
    current = spawn(next);
    next = nextKey();
    if (!fits(current)) {
      gameOver = true;
      clearInterval(dropTimer);
      dropTimer = null;
      lastMessage = 'Fim de jogo: não coube mais nenhuma peça.';
    }
  }

  function checkGameOver() {
    if (gameOver) return;
    const topRow = board.slice(0, HIDDEN_ROWS).some(row => row.some(cell => cell !== EMPTY));
    if (topRow) {
      gameOver = true;
      clearInterval(dropTimer);
      dropTimer = null;
    }
  }

  function holdPiece() {
    if (!canHold || gameOver || paused || !current) return;
    const key = hold || current.key;
    hold = current.key;
    current = spawn(key);
    canHold = false;
    if (!fits(current)) gameOver = true;
    render();
    resetDropTimer();
  }

  // ── Tempo de queda ───────────────────────────────────────
  function dropInterval() {
    return Math.max(90, 700 - (level - 1) * 60);
  }

  function resetDropTimer() {
    clearInterval(dropTimer);
    if (gameOver || paused) return;
    dropTimer = setInterval(() => moveDown(false), dropInterval());
  }

  // ── Controles ────────────────────────────────────────────
  function onKey(event) {
    if (!container) return;
    const key = event.key;
    const handled = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' ', 'r', 'R', 'c', 'C'].includes(key);
    if (!handled) return;
    event.preventDefault();

    if (key === 'ArrowLeft') move(-1);
    else if (key === 'ArrowRight') move(1);
    else if (key === 'ArrowDown') moveDown(true);
    else if (key === 'ArrowUp' || key === 'r' || key === 'R') rotateWithKick();
    else if (key === 'c' || key === 'C') holdPiece();
    else if (key === ' ') togglePause();
  }

  function togglePause() {
    if (gameOver) return;
    paused = !paused;
    if (paused) clearInterval(dropTimer);
    else resetDropTimer();
    render();
  }

  function newGame() {
    board = emptyGrid();
    bag = [];
    hold = null;
    canHold = true;
    score = 0;
    lines = 0;
    level = 1;
    gameOver = false;
    paused = false;
    lastMessage = '';
    next = nextKey();
    current = spawn(nextKey());
    checkGameOver();
    render();
    resetDropTimer();
  }

  let lastMessage = '';

  // ── Renderização ─────────────────────────────────────────
  function ghostY() {
    if (!current) return 0;
    let y = current.y;
    while (!collides(current, 0, y - current.y + 1)) y += 1;
    return y;
  }

  function pieceLabel(key) {
    return key;
  }

  // Cores das peças: cada tipo tem sua própria tonalidade, dentro da paleta.
  const PIECE_TONE = { I: 0, O: 1, T: 2, S: 3, Z: 4, J: 5, L: 6 };

  function renderGrid() {
    const preview = board.map(row => row.slice());
    const drop = ghostY();

    const stamp = (piece, offsetY, value) => {
      shapeCells(piece.matrix).forEach(([r, c]) => {
        const y = piece.y + offsetY + r;
        const x = piece.x + c;
        if (y >= 0 && y < ROWS + HIDDEN_ROWS && x >= 0 && x < COLS) {
          preview[y][x] = preview[y][x] !== EMPTY ? preview[y][x] : value;
        }
      });
    };

    if (current && !gameOver) stamp(current, drop, GHOST);
    if (current && !gameOver) stamp(current, 0, PIECE_TONE[current.key] + 1);

    const cells = [];
    for (let y = HIDDEN_ROWS; y < ROWS + HIDDEN_ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const value = preview[y][x];
        const classes = ['bp-cell'];
        if (value === EMPTY) {
          classes.push('is-empty');
        } else if (value === GHOST) {
          classes.push('is-filled', 'is-ghost', 'tone-' + (PIECE_TONE[current.key] + 1));
        } else {
          classes.push('is-filled', 'tone-' + value);
        }
        cells.push('<div class="' + classes.join(' ') + '"></div>');
      }
    }
    return cells.join('');
  }

  function renderPreview(key) {
    if (!key) return '<div class="bp-preview-empty">—</div>';
    const matrix = SHAPES[key];
    const height = matrix.length;
    const width = Math.max(...matrix.map(row => row.length));
    const rows = [];
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        rows.push('<div class="bp-preview-cell ' + (matrix[r][c] ? 'is-filled tone-' + (PIECE_TONE[key] + 1) : 'is-empty') + '"></div>');
      }
    }
    return '<div class="bp-preview" style="grid-template-columns:repeat(' + width + ',1fr)">' + rows.join('') + '</div>';
  }

  function render() {
    if (!container) return;

    const status = gameOver
      ? lastMessage
      : paused
        ? 'Jogo pausado. Pressione P ou o botão para continuar.'
        : lastMessage || 'Encaixe as peças para completar linhas.';

    container.innerHTML =
      '<section class="bp-game">' +
      '<div class="bp-header">' +
      '<div><p class="game-eyebrow">Lógica</p><h3>Tetris</h3></div>' +
      '<button class="game-action-btn bp-new" type="button">Novo jogo</button>' +
      '</div>' +
      '<div class="bp-stats">' +
      '<span>Pontos <strong>' + score + '</strong></span>' +
      '<span>Linhas <strong>' + lines + '</strong></span>' +
      '<span>Nível <strong>' + level + '</strong></span>' +
      '</div>' +
      '<div class="bp-layout">' +
      '<div class="bp-side">' +
      '<p class="bp-side-label">Próxima</p>' + renderPreview(next) +
      '<p class="bp-side-label">Guardar</p>' + renderPreview(hold) +
      '<button class="game-action-btn bp-hold" type="button"' + (canHold && !gameOver ? '' : ' disabled') + '>Guardar (C)</button>' +
      '<button class="game-action-btn bp-pause" type="button">' + (paused ? 'Continuar' : 'Pausar') + '</button>' +
      '</div>' +
      '<div class="bp-board" role="grid" aria-label="Grade do Tetris">' + renderGrid() + '</div>' +
      '<div class="bp-controls">' +
      '<p class="bp-side-label">Controles</p>' +
      '<ul class="bp-keys">' +
      '<li><b>←</b> <b>→</b> mover</li>' +
      '<li><b>↓</b> descer</li>' +
      '<li><b>↑</b> ou <b>R</b> girar</li>' +
      '<li><b>C</b> guardar peça</li>' +
      '<li><b>Espaço</b> pausar</li>' +
      '</ul>' +
      '<p class="bp-current">Peça atual: <strong>' + (current ? pieceLabel(current.key) : '—') + '</strong></p>' +
      '</div>' +
      '</div>' +
      '<p class="bp-message" role="status" aria-live="polite">' + status + '</p>' +
      '</section>';
  }

  // ── Ponteiros ────────────────────────────────────────────
  let pointerX = null;

  function onPointerDown(event) {
    if (!container) return;
    const boardEl = event.target.closest('.bp-board');
    if (!boardEl) return;
    const rect = boardEl.getBoundingClientRect();
    pointerX = event.clientX - rect.left;
  }

  function onPointerMove(event) {
    if (pointerX === null || !container) return;
    const boardEl = container.querySelector('.bp-board');
    if (!boardEl) return;
    const rect = boardEl.getBoundingClientRect();
    const cell = rect.width / COLS;
    const delta = event.clientX - rect.left - pointerX;
    const steps = Math.round(delta / cell);
    if (steps !== 0) {
      pointerX += steps * cell;
      for (let i = 0; i < Math.abs(steps); i++) move(steps > 0 ? 1 : -1);
    }
  }

  function onPointerUp() {
    pointerX = null;
  }

  function onClick(event) {
    if (event.target.closest('.bp-new')) { newGame(); return; }
    if (event.target.closest('.bp-hold')) { holdPiece(); return; }
    if (event.target.closest('.bp-pause')) { togglePause(); }

    // Tocar na metade esquerda/direita move a peça; girar com dois toques.
    const boardEl = event.target.closest('.bp-board');
    if (boardEl) {
      const rect = boardEl.getBoundingClientRect();
      const third = rect.width / 3;
      const offset = event.clientX - rect.left;
      if (offset < third) move(-1);
      else if (offset > rect.width - third) move(1);
      else rotateWithKick();
    }
  }

  // ── Ciclo de vida ─────────────────────────────────────────
  function mount(el) {
    container = el;
    lastMessage = '';
    newGame();
    container.addEventListener('click', onClick);
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);
    document.addEventListener('keydown', onKey);
  }

  function unmount() {
    clearInterval(dropTimer);
    dropTimer = null;
    if (container) {
      container.removeEventListener('click', onClick);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      container.innerHTML = '';
    }
    document.removeEventListener('keydown', onKey);
    container = null;
    current = null;
    board = [];
  }

  return { mount, unmount };
})();
