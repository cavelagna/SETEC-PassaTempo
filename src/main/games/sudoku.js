'use strict';

// Sudoku — módulo isolado
const Sudoku = (() => {

  // ── Utilitários de geração ────────────────────────────────

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function isValid(board, r, c, n) {
    // Linha
    if (board[r].includes(n)) return false;
    // Coluna
    for (let i = 0; i < 9; i++) if (board[i][c] === n) return false;
    // Bloco 3×3
    const br = Math.floor(r / 3) * 3;
    const bc = Math.floor(c / 3) * 3;
    for (let i = br; i < br + 3; i++) {
      for (let j = bc; j < bc + 3; j++) {
        if (board[i][j] === n) return false;
      }
    }
    return true;
  }

  function findEmpty(board) {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (board[r][c] === 0) return [r, c];
    return null;
  }

  // Resolve o board por backtracking (modifica in-place)
  function solve(board) {
    const empty = findEmpty(board);
    if (!empty) return true;
    const [r, c] = empty;
    for (const n of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
      if (isValid(board, r, c, n)) {
        board[r][c] = n;
        if (solve(board)) return true;
        board[r][c] = 0;
      }
    }
    return false;
  }

  // Preenche os três blocos diagonais (são independentes entre si)
  function fillDiagonalBoxes(board) {
    [0, 3, 6].forEach(start => {
      const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      let k = 0;
      for (let r = start; r < start + 3; r++) {
        for (let c = start; c < start + 3; c++) {
          board[r][c] = nums[k++];
        }
      }
    });
  }

  // Gera um board completo e válido
  function generateFull() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    fillDiagonalBoxes(board);
    solve(board);
    return board;
  }

  // Remove células para criar o puzzle (sem verificação de unicidade —
  // válido para projeto escolar; a solução original sempre funciona)
  const CLUES = { easy: 38, medium: 30, hard: 24 };

  function createPuzzle(full, diff) {
    const board = full.map(r => [...r]);
    const positions = shuffle([...Array(81).keys()]);
    const toRemove  = 81 - CLUES[diff];

    positions.slice(0, toRemove).forEach(pos => {
      const r = Math.floor(pos / 9);
      const c = pos % 9;
      board[r][c] = 0;
    });

    // given[r][c] = true se a célula é pré-preenchida
    const given = board.map(row => row.map(v => v !== 0));
    return { board, given };
  }

  // ── Estado do jogo ────────────────────────────────────────

  let solution, given, userBoard, selected, difficulty, container;
  let keyHandler;

  const DIFF_LABELS = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' };

  function init(diff = 'easy') {
    difficulty = diff;
    const full       = generateFull();
    solution         = full.map(r => [...r]);
    const puzzle     = createPuzzle(full, diff);
    given            = puzzle.given;
    userBoard        = puzzle.board.map(r => [...r]);
    selected         = null;
  }

  function isError(r, c) {
    const v = userBoard[r][c];
    if (!v || given[r][c]) return false;
    return v !== solution[r][c];
  }

  function isRelated(r1, c1, r2, c2) {
    return r1 === r2 || c1 === c2 ||
      (Math.floor(r1 / 3) === Math.floor(r2 / 3) &&
       Math.floor(c1 / 3) === Math.floor(c2 / 3));
  }

  function isBoardComplete() {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (userBoard[r][c] !== solution[r][c]) return false;
    return true;
  }

  // ── Renderização ──────────────────────────────────────────

  function buildDOM() {
    container.innerHTML = `
      <div class="sdk-wrap">

        <div class="sdk-diff-row">
          ${Object.entries(DIFF_LABELS).map(([key, label]) =>
            `<button class="game-action-btn sdk-diff-btn ${key === difficulty ? 'active' : ''}"
               data-diff="${key}">${label}</button>`
          ).join('')}
        </div>

        <div class="sdk-grid-wrap">
          <div class="sdk-grid" role="grid" aria-label="Grade do Sudoku 9 por 9"></div>
        </div>

        <div class="sdk-pad" role="group" aria-label="Painel de números"></div>

        <div class="sdk-actions">
          <button class="game-action-btn sdk-check">Verificar</button>
          <button class="game-action-btn sdk-reveal">Revelar solução</button>
          <button class="game-action-btn sdk-restart">Novo jogo</button>
        </div>

        <p class="sdk-status" role="status" aria-live="polite"></p>

      </div>
    `;

    buildGrid();
    buildPad();
    bindActions();
  }

  function buildGrid() {
    const gridEl = container.querySelector('.sdk-grid');

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const btn = document.createElement('button');
        btn.className = 'sdk-cell';
        btn.setAttribute('data-r', r);
        btn.setAttribute('data-c', c);
        btn.setAttribute('role', 'gridcell');
        btn.setAttribute('aria-rowindex', r + 1);
        btn.setAttribute('aria-colindex', c + 1);
        btn.tabIndex = (r === 0 && c === 0) ? 0 : -1; // roving tabindex

        if (given[r][c]) {
          btn.classList.add('sdk-cell--given');
          btn.textContent = userBoard[r][c];
          btn.setAttribute('aria-label',
            `Linha ${r+1}, coluna ${c+1}: ${userBoard[r][c]}, dado`);
        } else {
          btn.setAttribute('aria-label', `Linha ${r+1}, coluna ${c+1}: vazio`);
        }

        btn.addEventListener('click', () => selectCell(r, c));
        btn.addEventListener('keydown', e => handleCellKey(e, r, c));
        gridEl.appendChild(btn);
      }
    }
  }

  function buildPad() {
    const pad = container.querySelector('.sdk-pad');

    // Números 1–9 + botão limpar
    [...Array(9).keys()].map(i => i + 1).forEach(n => {
      const btn = document.createElement('button');
      btn.className = 'sdk-pad-btn';
      btn.textContent = n;
      btn.setAttribute('aria-label', `Inserir ${n}`);
      btn.addEventListener('click', () => inputNumber(n));
      pad.appendChild(btn);
    });

    const clearBtn = document.createElement('button');
    clearBtn.className = 'sdk-pad-btn sdk-pad-btn--clear';
    clearBtn.textContent = '✕';
    clearBtn.setAttribute('aria-label', 'Apagar célula');
    clearBtn.addEventListener('click', () => inputNumber(0));
    pad.appendChild(clearBtn);
  }

  function bindActions() {
    container.querySelectorAll('.sdk-diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        init(btn.dataset.diff);
        buildDOM();
        installKeyHandler();
      });
    });

    container.querySelector('.sdk-check').addEventListener('click', checkBoard);
    container.querySelector('.sdk-reveal').addEventListener('click', revealSolution);
    container.querySelector('.sdk-restart').addEventListener('click', () => {
      init(difficulty);
      buildDOM();
      installKeyHandler();
    });
  }

  // ── Seleção e input ───────────────────────────────────────

  function selectCell(r, c) {
    selected = { r, c };
    refreshHighlights();
    // Foca a célula selecionada (roving tabindex)
    const cells = container.querySelectorAll('.sdk-cell');
    cells.forEach((el, i) => {
      const er = Math.floor(i / 9), ec = i % 9;
      el.tabIndex = (er === r && ec === c) ? 0 : -1;
    });
    container.querySelector(`.sdk-cell[data-r="${r}"][data-c="${c}"]`)?.focus();
  }

  function inputNumber(n) {
    if (!selected) return;
    const { r, c } = selected;
    if (given[r][c]) return;

    userBoard[r][c] = n;
    refreshCell(r, c);
    refreshHighlights();
    setStatus('');

    if (n !== 0 && isBoardComplete()) {
      setStatus('Parabéns! Puzzle resolvido.');
    }
  }

  function handleCellKey(e, r, c) {
    // Números 1–9 e Delete/Backspace/0
    if (e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      if (!selected || selected.r !== r || selected.c !== c) selectCell(r, c);
      inputNumber(parseInt(e.key, 10));
    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      e.preventDefault();
      if (!selected || selected.r !== r || selected.c !== c) selectCell(r, c);
      inputNumber(0);
    }

    // Setas: mover seleção
    const moves = { ArrowUp: [-1,0], ArrowDown: [1,0], ArrowLeft: [0,-1], ArrowRight: [0,1] };
    if (moves[e.key]) {
      e.preventDefault();
      const [dr, dc] = moves[e.key];
      const nr = Math.min(8, Math.max(0, r + dr));
      const nc = Math.min(8, Math.max(0, c + dc));
      selectCell(nr, nc);
    }
  }

  // Listener de teclado global (para input quando a grade não está focada)
  function installKeyHandler() {
    if (keyHandler) document.removeEventListener('keydown', keyHandler);
    keyHandler = e => {
      // Só atua se a view do jogo estiver ativa e a célula selecionada existir
      const gameView = document.getElementById('view-game');
      if (!gameView || gameView.hidden) return;
      if (!selected) return;
      if (document.activeElement?.classList.contains('sdk-cell')) return; // já tratado

      if (e.key >= '1' && e.key <= '9') inputNumber(parseInt(e.key, 10));
      if (e.key === 'Backspace' || e.key === 'Delete') inputNumber(0);
    };
    document.addEventListener('keydown', keyHandler);
  }

  // ── Atualização visual ─────────────────────────────────────

  function refreshCell(r, c) {
    const el = container?.querySelector(`.sdk-cell[data-r="${r}"][data-c="${c}"]`);
    if (!el) return;

    el.textContent = userBoard[r][c] || '';
    el.classList.remove('sdk-cell--user', 'sdk-cell--error');

    if (!given[r][c]) {
      if (userBoard[r][c]) {
        el.classList.add(isError(r, c) ? 'sdk-cell--error' : 'sdk-cell--user');
      }
      const v = userBoard[r][c] || 'vazio';
      el.setAttribute('aria-label', `Linha ${r+1}, coluna ${c+1}: ${v}`);
    }
  }

  function refreshHighlights() {
    const cells = container?.querySelectorAll('.sdk-cell');
    if (!cells) return;

    const selVal = selected ? userBoard[selected.r][selected.c] : 0;

    cells.forEach(el => {
      const r = parseInt(el.dataset.r, 10);
      const c = parseInt(el.dataset.c, 10);

      el.classList.remove('sdk-cell--selected', 'sdk-cell--related', 'sdk-cell--same-num');

      if (!selected) return;

      if (r === selected.r && c === selected.c) {
        el.classList.add('sdk-cell--selected');
      } else if (isRelated(r, c, selected.r, selected.c)) {
        el.classList.add('sdk-cell--related');
      } else if (selVal && userBoard[r][c] === selVal) {
        el.classList.add('sdk-cell--same-num');
      }
    });
  }

  function setStatus(msg) {
    const el = container?.querySelector('.sdk-status');
    if (el) el.textContent = msg;
  }

  // ── Ações ─────────────────────────────────────────────────

  function checkBoard() {
    let errors = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!given[r][c] && userBoard[r][c] && isError(r, c)) errors++;
        refreshCell(r, c);
      }
    }
    if (errors === 0 && isBoardComplete()) {
      setStatus('Parabéns! Puzzle resolvido.');
    } else if (errors > 0) {
      setStatus(`${errors} erro${errors > 1 ? 's' : ''} encontrado${errors > 1 ? 's' : ''}.`);
    } else {
      setStatus('Sem erros até agora.');
    }
  }

  function revealSolution() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        userBoard[r][c] = solution[r][c];
        refreshCell(r, c);
      }
    }
    setStatus('Solução revelada.');
  }

  // ── Interface pública ─────────────────────────────────────

  function mount(el) {
    container = el;
    init('easy');
    buildDOM();
    installKeyHandler();
  }

  function unmount() {
    if (keyHandler) {
      document.removeEventListener('keydown', keyHandler);
      keyHandler = null;
    }
    if (container) container.innerHTML = '';
    container = null;
  }

  return { mount, unmount };
})();
