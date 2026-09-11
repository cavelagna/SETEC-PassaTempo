'use strict';

// Campo Minado — módulo isolado
const Minesweeper = (() => {

  const CONFIGS = {
    beginner:     { rows: 9,  cols: 9,  mines: 10, label: 'Iniciante (9×9)'      },
    intermediate: { rows: 16, cols: 16, mines: 40, label: 'Intermediário (16×16)' },
  };

  let grid, rows, cols, mineCount, revealed, flagged;
  let gameState, firstClick, seconds, timerInterval;
  let flagMode, currentDiff, container;

  // ── Inicialização ─────────────────────────────────────────

  function init(diff = 'beginner') {
    currentDiff = diff;
    const cfg = CONFIGS[diff];
    rows      = cfg.rows;
    cols      = cfg.cols;
    mineCount = cfg.mines;
    revealed  = 0;
    flagged   = 0;
    gameState = 'idle';
    firstClick = true;
    seconds   = 0;
    flagMode  = false;
    clearInterval(timerInterval);
    timerInterval = null;
    grid = createEmptyGrid();
  }

  function createEmptyGrid() {
    return Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => ({
        r, c,
        mine:     false,
        revealed: false,
        flagged:  false,
        adjacent: 0,
      }))
    );
  }

  function placeMines(safeR, safeC) {
    let placed = 0;
    while (placed < mineCount) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      // Garante que o primeiro clique e seus vizinhos sejam seguros
      if (!grid[r][c].mine && !(Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1)) {
        grid[r][c].mine = true;
        placed++;
      }
    }
    // Calcula contagem de minas adjacentes
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!grid[r][c].mine) {
          grid[r][c].adjacent = neighbors(r, c).filter(n => n.mine).length;
        }
      }
    }
  }

  function neighbors(r, c) {
    const result = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          result.push(grid[nr][nc]);
        }
      }
    }
    return result;
  }

  // ── Lógica do jogo ────────────────────────────────────────

  function revealCell(r, c) {
    const cell = grid[r][c];
    if (cell.revealed || cell.flagged) return;

    if (firstClick) {
      firstClick = false;
      placeMines(r, c);
      gameState = 'playing';
      startTimer();
    }

    cell.revealed = true;
    revealed++;

    if (cell.mine) {
      gameState = 'lost';
      clearInterval(timerInterval);
      return;
    }

    // Flood fill: se não há minas adjacentes, revela vizinhos
    if (cell.adjacent === 0) {
      neighbors(r, c).forEach(n => {
        if (!n.revealed && !n.flagged) revealCell(n.r, n.c);
      });
    }

    if (revealed === rows * cols - mineCount) {
      gameState = 'won';
      clearInterval(timerInterval);
    }
  }

  function toggleFlag(r, c) {
    const cell = grid[r][c];
    if (cell.revealed) return;
    cell.flagged = !cell.flagged;
    flagged += cell.flagged ? 1 : -1;
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      seconds++;
      const el = container?.querySelector('.ms-timer');
      if (el) el.textContent = formatTime(seconds);
    }, 1000);
  }

  function formatTime(s) {
    const m   = Math.floor(s / 60);
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
  }

  // ── Renderização ──────────────────────────────────────────

  function buildDOM() {
    const isLarge = currentDiff === 'intermediate';

    container.innerHTML = `
      <div class="ms-wrap">
        <div class="ms-diff-row">
          ${Object.entries(CONFIGS).map(([key, cfg]) =>
            `<button class="game-action-btn ms-diff-btn ${key === currentDiff ? 'active' : ''}"
               data-diff="${key}">${cfg.label}</button>`
          ).join('')}
        </div>

        <div class="ms-info" role="status" aria-live="polite">
          <span class="ms-mines-count">Minas: ${mineCount - flagged}</span>
          <span class="ms-info-status">—</span>
          <span class="ms-timer">${formatTime(seconds)}</span>
        </div>

        <p class="ms-hint">Clique para revelar · Clique direito (ou modo bandeira) para marcar</p>

        <button class="game-action-btn ms-flag-btn" aria-pressed="false" id="ms-flag-mode">
          Modo bandeira: desativado
        </button>

        <div class="ms-grid-wrap">
          <div class="ms-grid" role="grid" aria-label="Campo Minado"
               style="grid-template-columns: repeat(${cols}, ${isLarge ? '26px' : '34px'})"
               ${isLarge ? 'data-large="true"' : ''}>
          </div>
        </div>

        <button class="game-action-btn ms-restart">Reiniciar</button>
      </div>
    `;

    // Constrói células
    const gridEl = container.querySelector('.ms-grid');
    grid.forEach(row => {
      row.forEach(cell => {
        const btn = document.createElement('button');
        btn.className = 'ms-cell';
        btn.setAttribute('aria-label', 'Célula não revelada');
        btn.dataset.r = cell.r;
        btn.dataset.c = cell.c;

        // Clique primário: revelar ou (modo bandeira) marcar
        btn.addEventListener('click', () => {
          if (gameState === 'won' || gameState === 'lost') return;
          if (flagMode) {
            toggleFlag(cell.r, cell.c);
          } else {
            revealCell(cell.r, cell.c);
          }
          refreshAll();
        });

        // Clique direito: marcar / desmarcar bandeira
        btn.addEventListener('contextmenu', e => {
          e.preventDefault();
          if (gameState === 'won' || gameState === 'lost') return;
          toggleFlag(cell.r, cell.c);
          refreshAll();
        });

        // Toque longo = bandeira (mobile)
        let longPressTimer;
        btn.addEventListener('touchstart', () => {
          longPressTimer = setTimeout(() => {
            if (gameState === 'won' || gameState === 'lost') return;
            toggleFlag(cell.r, cell.c);
            refreshAll();
          }, 500);
        }, { passive: true });
        btn.addEventListener('touchend', () => clearTimeout(longPressTimer));
        btn.addEventListener('touchmove', () => clearTimeout(longPressTimer));

        gridEl.appendChild(btn);
      });
    });

    // Botões de controle
    container.querySelectorAll('.ms-diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        init(btn.dataset.diff);
        buildDOM();
      });
    });

    container.querySelector('.ms-restart').addEventListener('click', () => {
      init(currentDiff);
      buildDOM();
    });

    const flagBtn = container.querySelector('#ms-flag-mode');
    flagBtn.addEventListener('click', () => {
      flagMode = !flagMode;
      flagBtn.setAttribute('aria-pressed', String(flagMode));
      flagBtn.textContent = `Modo bandeira: ${flagMode ? 'ativado' : 'desativado'}`;
      flagBtn.classList.toggle('active', flagMode);
    });

    refreshAll();
  }

  function refreshCell(btn, cell) {
    btn.className = 'ms-cell';
    btn.textContent = '';
    btn.removeAttribute('data-num');
    btn.disabled = false;

    if (gameState === 'lost' && cell.mine) {
      // Revela todas as minas ao perder
      btn.classList.add('ms-cell--mine');
      btn.textContent = '●';
      btn.setAttribute('aria-label', 'Mina');
      btn.disabled = true;
      return;
    }

    if (cell.flagged && !cell.revealed) {
      btn.classList.add('ms-cell--flagged');
      btn.textContent = 'F';
      btn.setAttribute('aria-label', 'Marcada com bandeira');
      return;
    }

    if (!cell.revealed) {
      btn.setAttribute('aria-label', 'Célula não revelada');
      return;
    }

    btn.classList.add('ms-cell--revealed');
    btn.disabled = true;

    if (cell.mine) {
      btn.classList.add('ms-cell--mine');
      btn.textContent = '●';
      btn.setAttribute('aria-label', 'Mina');
    } else if (cell.adjacent > 0) {
      btn.textContent = cell.adjacent;
      btn.setAttribute('data-num', cell.adjacent);
      btn.setAttribute('aria-label', `${cell.adjacent} mina(s) adjacente(s)`);
    } else {
      btn.setAttribute('aria-label', 'Vazia');
    }
  }

  function refreshAll() {
    // Atualiza contagem de minas
    const minesEl = container?.querySelector('.ms-mines-count');
    if (minesEl) minesEl.textContent = `Minas: ${mineCount - flagged}`;

    // Atualiza status
    const statusEl = container?.querySelector('.ms-info-status');
    if (statusEl) {
      if      (gameState === 'won')  statusEl.textContent = 'Você venceu!';
      else if (gameState === 'lost') statusEl.textContent = 'Você perdeu.';
      else                           statusEl.textContent = '—';
    }

    // Atualiza cada célula
    const buttons = container?.querySelectorAll('.ms-cell');
    let i = 0;
    grid.forEach(row => row.forEach(cell => {
      if (buttons[i]) refreshCell(buttons[i], cell);
      i++;
    }));
  }

  // ── Interface pública ─────────────────────────────────────

  function mount(el) {
    container = el;
    init('beginner');
    buildDOM();
  }

  function unmount() {
    clearInterval(timerInterval);
    timerInterval = null;
    if (container) container.innerHTML = '';
    container = null;
  }

  return { mount, unmount };
})();
