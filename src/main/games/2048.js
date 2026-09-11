'use strict';

// 2048 - modulo isolado
const TwoThousandFortyEight = (() => {
  const SIZE = 4;
  const TARGET = 2048;
  const MOVE_ANIMATION_MS = 220;
  const BEST_SCORE_KEY = 'pt-2048-best';
  const DIRECTIONS = {
    up: { dr: -1, dc: 0 },
    right: { dr: 0, dc: 1 },
    down: { dr: 1, dc: 0 },
    left: { dr: 0, dc: -1 },
  };

  let board;
  let score;
  let bestScore;
  let phase;
  let targetReached;
  let container;
  let keyHandler;
  let touchStart;
  let isAnimating;
  let resizeHandler;

  function readBestScore() {
    try {
      const saved = Number.parseInt(localStorage.getItem(BEST_SCORE_KEY), 10);
      return Number.isFinite(saved) && saved > 0 ? saved : 0;
    } catch (_) {
      return 0;
    }
  }

  function saveBestScore() {
    try { localStorage.setItem(BEST_SCORE_KEY, String(bestScore)); } catch (_) {}
  }

  function createEmptyBoard() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  }

  function init() {
    board = createEmptyBoard();
    score = 0;
    bestScore = readBestScore();
    phase = 'playing';
    targetReached = false;
    isAnimating = false;
    addRandomTile();
    addRandomTile();
  }

  function getEmptyCells() {
    const cells = [];
    for (let row = 0; row < SIZE; row++) {
      for (let column = 0; column < SIZE; column++) {
        if (board[row][column] === 0) cells.push({ row, column });
      }
    }
    return cells;
  }

  function addRandomTile() {
    const emptyCells = getEmptyCells();
    if (!emptyCells.length) return false;

    const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[cell.row][cell.column] = Math.random() < 0.9 ? 2 : 4;
    return true;
  }

  function compressAndMerge(line) {
    const compact = line.filter(value => value !== 0);
    const merged = [];

    for (let index = 0; index < compact.length; index++) {
      if (compact[index] === compact[index + 1]) {
        const value = compact[index] * 2;
        merged.push(value);
        score += value;
        index++;
      } else {
        merged.push(compact[index]);
      }
    }

    while (merged.length < SIZE) merged.push(0);
    return merged;
  }

  function getLine(direction, index) {
    const { dr, dc } = DIRECTIONS[direction];
    const line = [];

    for (let step = 0; step < SIZE; step++) {
      const row = dr === 0 ? index : (dr === -1 ? step : SIZE - 1 - step);
      const column = dc === 0 ? index : (dc === -1 ? step : SIZE - 1 - step);
      line.push(board[row][column]);
    }

    return line;
  }

  function setLine(direction, index, line) {
    const { dr, dc } = DIRECTIONS[direction];

    for (let step = 0; step < SIZE; step++) {
      const row = dr === 0 ? index : (dr === -1 ? step : SIZE - 1 - step);
      const column = dc === 0 ? index : (dc === -1 ? step : SIZE - 1 - step);
      board[row][column] = line[step];
    }
  }

  function getCellPosition(direction, lineIndex, step) {
    const { dr, dc } = DIRECTIONS[direction];
    return {
      row: dr === 0 ? lineIndex : (dr === -1 ? step : SIZE - 1 - step),
      column: dc === 0 ? lineIndex : (dc === -1 ? step : SIZE - 1 - step),
    };
  }

  function getAnimationTracks(previousBoard, direction) {
    const tracks = [];

    for (let lineIndex = 0; lineIndex < SIZE; lineIndex++) {
      const compact = [];
      for (let step = 0; step < SIZE; step++) {
        const position = getCellPosition(direction, lineIndex, step);
        const value = previousBoard[position.row][position.column];
        if (value) compact.push({ value, position });
      }

      let outputStep = 0;
      for (let index = 0; index < compact.length; index++, outputStep++) {
        const destination = getCellPosition(direction, lineIndex, outputStep);
        const first = compact[index];
        const second = compact[index + 1];
        const mergedValue = second && first.value === second.value ? first.value * 2 : first.value;

        tracks.push({
          from: first.position,
          to: destination,
          value: mergedValue,
          merged: mergedValue !== first.value,
        });

        if (mergedValue !== first.value) index++;
      }
    }

    return tracks;
  }

  function move(direction) {
    if (phase !== 'playing' || isAnimating || !DIRECTIONS[direction]) return;

    const previousBoard = board.map(row => [...row]);

    let changed = false;
    for (let index = 0; index < SIZE; index++) {
      const original = getLine(direction, index);
      const next = compressAndMerge(original);
      if (original.some((value, position) => value !== next[position])) changed = true;
      setLine(direction, index, next);
    }

    if (!changed) return;

    addRandomTile();
    if (score > bestScore) {
      bestScore = score;
      saveBestScore();
    }

    if (!targetReached && hasReachedTarget()) {
      targetReached = true;
      phase = 'won';
      setStatus('Você chegou ao 2048! Continue jogando ou comece uma nova partida.');
      window.dispatchEvent(new CustomEvent('passatempo:result', { detail: { result: 'win' } }));
    } else if (!canMove()) {
      phase = 'lost';
      setStatus('Fim de jogo. Não há mais movimentos possíveis.');
      window.dispatchEvent(new CustomEvent('passatempo:result', { detail: { result: 'loss' } }));
    }

    render({ previousBoard, direction });
  }

  function hasReachedTarget() {
    return board.some(row => row.includes(TARGET));
  }

  function canMove() {
    if (getEmptyCells().length) return true;

    for (let row = 0; row < SIZE; row++) {
      for (let column = 0; column < SIZE; column++) {
        const value = board[row][column];
        if (column < SIZE - 1 && value === board[row][column + 1]) return true;
        if (row < SIZE - 1 && value === board[row + 1][column]) return true;
      }
    }
    return false;
  }

  function continuePlaying() {
    if (phase !== 'won') return;
    phase = 'playing';
    setStatus('Jogo em andamento.');
    render();
  }

  function restart() {
    init();
    render();
  }

  function formatTileLabel(value) {
    return value ? `Peça ${value}` : 'Casa vazia';
  }

  function buildDOM() {
    container.innerHTML = `
      <div class="two048-wrap">
        <div class="two048-header">
          <div>
            <p class="game-eyebrow">Quebra-cabeça de lógica</p>
            <h3>2048</h3>
          </div>
          <div class="two048-scores" aria-label="Pontuação">
            <div><span>Pontos</span><strong class="two048-score">0</strong></div>
            <div><span>Recorde</span><strong class="two048-best">0</strong></div>
          </div>
        </div>
        <p class="two048-help">Junte peças iguais até chegar ao 2048.</p>
        <div class="two048-board" aria-label="Tabuleiro do 2048">
          <div class="two048-slots" aria-hidden="true"></div>
          <div class="two048-tiles" role="grid"></div>
        </div>
        <div class="two048-controls" role="group" aria-label="Controles de movimento">
          <button class="two048-control two048-control--up" data-direction="up" aria-label="Mover para cima">&#9650;</button>
          <button class="two048-control two048-control--left" data-direction="left" aria-label="Mover para a esquerda">&#9664;</button>
          <button class="two048-control two048-control--down" data-direction="down" aria-label="Mover para baixo">&#9660;</button>
          <button class="two048-control two048-control--right" data-direction="right" aria-label="Mover para a direita">&#9654;</button>
        </div>
        <div class="two048-actions">
          <button class="game-action-btn two048-continue" hidden>Continuar</button>
          <button class="game-action-btn two048-restart">Novo jogo</button>
        </div>
        <p class="two048-status" role="status" aria-live="polite">Jogo em andamento.</p>
      </div>
    `;

    container.querySelectorAll('[data-direction]').forEach(button => {
      button.addEventListener('click', () => move(button.dataset.direction));
    });
    container.querySelector('.two048-continue').addEventListener('click', continuePlaying);
    container.querySelector('.two048-restart').addEventListener('click', restart);

    const gameBoard = container.querySelector('.two048-board');
    gameBoard.addEventListener('touchstart', event => {
      const touch = event.changedTouches[0];
      touchStart = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });
    gameBoard.addEventListener('touchend', event => {
      if (!touchStart) return;
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      touchStart = null;
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 24) return;
      move(Math.abs(deltaX) > Math.abs(deltaY) ? (deltaX > 0 ? 'right' : 'left') : (deltaY > 0 ? 'down' : 'up'));
    }, { passive: true });
  }

  function render(animation = null) {
    if (!container) return;
    const gameBoard = container.querySelector('.two048-board');
    const tileLayer = container.querySelector('.two048-tiles');
    const slotLayer = container.querySelector('.two048-slots');
    if (!gameBoard || !tileLayer || !slotLayer) return;

    if (!slotLayer.children.length) {
      for (let row = 0; row < SIZE; row++) {
        for (let column = 0; column < SIZE; column++) {
          const slot = document.createElement('div');
          slot.className = 'two048-slot';
          slot.dataset.row = row;
          slot.dataset.column = column;
          slotLayer.appendChild(slot);
        }
      }
    }

    tileLayer.innerHTML = '';
    const tracks = animation ? getAnimationTracks(animation.previousBoard, animation.direction) : [];
    const trackByDestination = new Map(tracks.map(track => [`${track.to.row}:${track.to.column}`, track]));

    board.forEach((row, rowIndex) => {
      row.forEach((value, columnIndex) => {
        if (!value) return;
        const tile = document.createElement('div');
        const track = trackByDestination.get(`${rowIndex}:${columnIndex}`);
        tile.className = `two048-tile${track?.merged ? ' merged' : ''} two048-tile--${value}`;
        tile.setAttribute('role', 'gridcell');
        tile.setAttribute('aria-label', `Linha ${rowIndex + 1}, coluna ${columnIndex + 1}: ${formatTileLabel(value)}`);
        tile.textContent = value;
        positionTile(tile, rowIndex, columnIndex);
        tileLayer.appendChild(tile);

        if (animation) {
          const source = track?.from;
          const destination = { row: rowIndex, column: columnIndex };
          const sourceSlot = source && getSlot(source);
          const destinationSlot = getSlot(destination);
          if (sourceSlot) {
            tile.style.transform = `translate(${sourceSlot.offsetLeft - destinationSlot.offsetLeft}px, ${sourceSlot.offsetTop - destinationSlot.offsetTop}px)`;
          } else {
            tile.style.transform = 'scale(0.2)';
          }
        }
      });
    });

    if (animation) {
      isAnimating = true;
      requestAnimationFrame(() => {
        animateTiles(tileLayer);
      });
    }

    const scoreElement = container.querySelector('.two048-score');
    const bestElement = container.querySelector('.two048-best');
    if (scoreElement) scoreElement.textContent = score;
    if (bestElement) bestElement.textContent = bestScore;

    const continueButton = container.querySelector('.two048-continue');
    if (continueButton) continueButton.hidden = phase !== 'won';
    refreshControls();
  }

  function getSlot(position) {
    return container?.querySelector(`.two048-slot[data-row="${position.row}"][data-column="${position.column}"]`);
  }

  function positionTile(tile, row, column) {
    const slot = getSlot({ row, column });
    if (!slot) return;
    tile.style.left = `${slot.offsetLeft}px`;
    tile.style.top = `${slot.offsetTop}px`;
    tile.style.width = `${slot.offsetWidth}px`;
    tile.style.height = `${slot.offsetHeight}px`;
  }

  function animateTiles(tileLayer) {
    const tiles = [...tileLayer.querySelectorAll('.two048-tile')];
    tiles.forEach(tile => {
      const initialTransform = tile.style.transform || 'translate(0, 0)';
      tile.style.transition = 'none';

      if (typeof tile.animate === 'function') {
        const keyframes = tile.classList.contains('merged')
          ? [
            { transform: initialTransform, offset: 0 },
            { transform: 'translate(0, 0) scale(1.16)', offset: 0.7 },
            { transform: 'translate(0, 0) scale(1)', offset: 1 },
          ]
          : [
            { transform: initialTransform },
            { transform: 'translate(0, 0) scale(1)' },
          ];
        const animation = tile.animate(
          keyframes,
          { duration: MOVE_ANIMATION_MS, easing: 'ease-out', fill: 'forwards' },
        );
        animation.onfinish = () => {
          tile.style.transform = 'translate(0, 0)';
          tile.style.transition = '';
        };
      } else {
        // Fallback para navegadores sem Web Animations API.
        void tile.offsetWidth;
        tile.style.transition = `transform ${MOVE_ANIMATION_MS}ms ease-out`;
        tile.style.transform = 'translate(0, 0) scale(1)';
      }
    });

    setTimeout(() => {
      isAnimating = false;
      if (container) refreshControls();
    }, MOVE_ANIMATION_MS);
  }

  function refreshControls() {
    container.querySelectorAll('[data-direction]').forEach(button => {
      button.disabled = phase !== 'playing' || isAnimating;
    });
  }

  function setStatus(message) {
    const status = container?.querySelector('.two048-status');
    if (status) status.textContent = message;
  }

  function installKeyHandler() {
    keyHandler = event => {
      const gameView = document.getElementById('view-game');
      if (!gameView || gameView.hidden || !container) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      const keys = {
        ArrowUp: 'up', ArrowRight: 'right', ArrowDown: 'down', ArrowLeft: 'left',
        w: 'up', d: 'right', s: 'down', a: 'left',
        W: 'up', D: 'right', S: 'down', A: 'left',
      };
      const direction = keys[event.key];
      if (!direction) return;
      event.preventDefault();
      move(direction);
    };
    document.addEventListener('keydown', keyHandler);
  }

  function mount(element) {
    container = element;
    init();
    buildDOM();
    render();
    installKeyHandler();
    resizeHandler = () => render();
    window.addEventListener('resize', resizeHandler);
  }

  function unmount() {
    if (keyHandler) document.removeEventListener('keydown', keyHandler);
    if (resizeHandler) window.removeEventListener('resize', resizeHandler);
    keyHandler = null;
    resizeHandler = null;
    touchStart = null;
    if (container) container.innerHTML = '';
    container = null;
  }

  return { mount, unmount };
})();
