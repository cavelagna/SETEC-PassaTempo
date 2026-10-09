'use strict';

/* Xadrez local para duas pessoas.
 * Motor de regras completo: movimentos por peça, capturas em diagonal e
 * em linha, realce da trajetória, promoção, castling, en passant, xeque,
 * xeque-mate, impasse, material insuficiente, três repetições, regra das
 * 50 jogadas, desfazer e notação algébrica simplificada.
 */
const Chess = (() => {
  // ── Vocabulário ────────────────────────────────────────────
  const FILES = 'abcdefgh';
  const PIECE_NAME = { p: 'peão', n: 'cavalo', b: 'bispo', r: 'torre', q: 'dama', k: 'rei' };
  const GLYPH = {
    w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
    b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
  };
  const SAN_LETTER = { k: 'R', q: 'D', r: 'T', b: 'B', n: 'C' };

  const SLIDE = {
    b: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
    r: [[-1, 0], [1, 0], [0, -1], [0, 1]],
    q: [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]],
  };
  const KNIGHT_STEPS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  const KING_STEPS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
  const DIAGONALS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  const ORTHOGONALS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  // ── Utilidades de coordenadas ──────────────────────────────
  const key = (r, f) => r * 8 + f;
  const rowOf = i => Math.floor(i / 8);
  const colOf = i => i % 8;
  const inside = (r, f) => r >= 0 && r < 8 && f >= 0 && f < 8;
  const sqName = i => FILES[colOf(i)] + (8 - rowOf(i));
  const other = c => (c === 'w' ? 'b' : 'w');
  const colorName = c => (c === 'w' ? 'brancas' : 'pretas');

  // ── Estado ────────────────────────────────────────────────
  let container = null;
  let state = null;
  let selected = -1;
  let targets = [];        // lances legais da peça selecionada
  let path = new Set();    // casas atravessadas pela peça deslizante
  let pendingPromotion = null;
  let repetition = new Map();
  const undoStack = [];

  function createState() {
    const board = new Array(64).fill(null);
    const back = 'rnbqkbnr';
    for (let f = 0; f < 8; f++) {
      board[key(0, f)] = { t: back[f], c: 'b' };
      board[key(1, f)] = { t: 'p', c: 'b' };
      board[key(6, f)] = { t: 'p', c: 'w' };
      board[key(7, f)] = { t: back[f], c: 'w' };
    }
    const start = {
      board,
      turn: 'w',
      castling: { K: true, Q: true, k: true, q: true },
      ep: null,
      halfmove: 0,
      fullmove: 1,
      captured: { w: [], b: [] },
      history: [],
      result: null,
    };
    const signature = positionKey(start);
    repetition = new Map([[signature, 1]]);
    return start;
  }

  // ── Detecção de ataques ───────────────────────────────────
  function isAttacked(board, square, byColor) {
    const r = rowOf(square);
    const f = colOf(square);

    // Peões: um peão branco ataca a casa imediatamente acima dele.
    const pawnRow = byColor === 'w' ? r + 1 : r - 1;
    for (const df of [-1, 1]) {
      const nf = f + df;
      if (!inside(pawnRow, nf)) continue;
      const piece = board[key(pawnRow, nf)];
      if (piece && piece.c === byColor && piece.t === 'p') return true;
    }

    for (const [dr, df] of KNIGHT_STEPS) {
      const nr = r + dr, nf = f + df;
      if (!inside(nr, nf)) continue;
      const piece = board[key(nr, nf)];
      if (piece && piece.c === byColor && piece.t === 'n') return true;
    }

    for (const [dr, df] of KING_STEPS) {
      const nr = r + dr, nf = f + df;
      if (!inside(nr, nf)) continue;
      const piece = board[key(nr, nf)];
      if (piece && piece.c === byColor && piece.t === 'k') return true;
    }

    for (const [dr, df] of ORTHOGONALS) {
      let nr = r + dr, nf = f + df;
      while (inside(nr, nf)) {
        const piece = board[key(nr, nf)];
        if (piece) {
          if (piece.c === byColor && (piece.t === 'r' || piece.t === 'q')) return true;
          break;
        }
        nr += dr; nf += df;
      }
    }

    for (const [dr, df] of DIAGONALS) {
      let nr = r + dr, nf = f + df;
      while (inside(nr, nf)) {
        const piece = board[key(nr, nf)];
        if (piece) {
          if (piece.c === byColor && (piece.t === 'b' || piece.t === 'q')) return true;
          break;
        }
        nr += dr; nf += df;
      }
    }

    return false;
  }

  function kingSquare(board, color) {
    for (let i = 0; i < 64; i++) {
      const piece = board[i];
      if (piece && piece.c === color && piece.t === 'k') return i;
    }
    return -1;
  }

  function inCheck(board, color) {
    const king = kingSquare(board, color);
    return king >= 0 && isAttacked(board, king, other(color));
  }

  // ── Geração de lances pseudo-legais ────────────────────────
  function pseudoMoves(board, color, castling, ep) {
    const moves = [];

    for (let from = 0; from < 64; from++) {
      const piece = board[from];
      if (!piece || piece.c !== color) continue;

      const r = rowOf(from);
      const f = colOf(from);

      // Só marca o destino quando a casa está livre ou ocupada por inimigo.
      const add = (to, extra) => {
        const victim = board[to];
        if (victim && victim.c === color) return;
        moves.push(Object.assign(
          { from, to, piece: piece.t, captured: victim ? victim.t : null },
          extra || {}
        ));
      };

      if (piece.t === 'p') {
        const dir = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;
        const lastRow = color === 'w' ? 0 : 7;
        const ahead = r + dir;

        if (inside(ahead, f) && !board[key(ahead, f)]) {
          add(key(ahead, f), { promotion: ahead === lastRow });
          const twoSteps = r + dir * 2;
          if (r === startRow && !board[key(twoSteps, f)]) add(key(twoSteps, f));
        }

        for (const df of [-1, 1]) {
          const nr = ahead, nf = f + df;
          if (!inside(nr, nf)) continue;
          const to = key(nr, nf);
          const victim = board[to];
          if (victim && victim.c !== color) {
            add(to, { promotion: nr === lastRow });
          } else if (!victim && ep === to) {
            add(to, { enPassant: true, captured: 'p' });
          }
        }
      } else if (piece.t === 'n') {
        for (const [dr, df] of KNIGHT_STEPS) {
          const nr = r + dr, nf = f + df;
          if (inside(nr, nf)) add(key(nr, nf));
        }
      } else if (piece.t === 'k') {
        for (const [dr, df] of KING_STEPS) {
          const nr = r + dr, nf = f + df;
          if (inside(nr, nf)) add(key(nr, nf));
        }

        const homeRow = color === 'w' ? 7 : 0;
        if (r === homeRow && f === 4) {
          const foe = other(color);
          const kingSide = color === 'w' ? 'K' : 'k';
          const queenSide = color === 'w' ? 'Q' : 'q';
          const rookK = board[key(homeRow, 7)];
          const rookQ = board[key(homeRow, 0)];

          if (castling[kingSide] && rookK && rookK.t === 'r' && rookK.c === color &&
            !board[key(homeRow, 5)] && !board[key(homeRow, 6)] &&
            !isAttacked(board, key(homeRow, 4), foe) &&
            !isAttacked(board, key(homeRow, 5), foe) &&
            !isAttacked(board, key(homeRow, 6), foe)) {
            moves.push({ from, to: key(homeRow, 6), piece: 'k', captured: null, castle: 'K' });
          }

          if (castling[queenSide] && rookQ && rookQ.t === 'r' && rookQ.c === color &&
            !board[key(homeRow, 1)] && !board[key(homeRow, 2)] && !board[key(homeRow, 3)] &&
            !isAttacked(board, key(homeRow, 4), foe) &&
            !isAttacked(board, key(homeRow, 3), foe) &&
            !isAttacked(board, key(homeRow, 2), foe)) {
            moves.push({ from, to: key(homeRow, 2), piece: 'k', captured: null, castle: 'Q' });
          }
        }
      } else {
        // Bispo, torre e dama percorrem linhas retas até a primeira peça,
        // que é capturada e interrompe o trajeto.
        for (const [dr, df] of SLIDE[piece.t]) {
          let nr = r + dr, nf = f + df;
          while (inside(nr, nf)) {
            const to = key(nr, nf);
            if (board[to]) { add(to); break; }
            add(to);
            nr += dr; nf += df;
          }
        }
      }
    }

    return moves;
  }

  function cloneBoard(board) {
    const next = new Array(64);
    for (let i = 0; i < 64; i++) next[i] = board[i] ? { t: board[i].t, c: board[i].c } : null;
    return next;
  }

  // ── Aplicação de lance (devolve um estado novo) ───────────
  function applyMove(source, move) {
    const board = cloneBoard(source.board);
    const color = board[move.from].c;
    const castling = Object.assign({}, source.castling);
    const captured = { w: source.captured.w.slice(), b: source.captured.b.slice() };
    let ep = null;

    if (move.enPassant) board[key(rowOf(move.to) + (color === 'w' ? 1 : -1), colOf(move.to))] = null;
    if (move.captured) captured[color].push(move.captured);

    // Guarda a peça antes de limpar a casa de origem.
    const movingPiece = board[move.from];

    // No castling a torre sai antes do rei: caso contrário o destino da
    // torre já estaria limpo e a peça se perderia no caminho.
    if (move.castle) {
      const home = rowOf(move.from);
      if (move.castle === 'K') {
        board[key(home, 5)] = board[key(home, 7)];
        board[key(home, 7)] = null;
      } else {
        board[key(home, 3)] = board[key(home, 0)];
        board[key(home, 0)] = null;
      }
    }

    board[move.from] = null;
    board[move.to] = move.promotion ? { t: move.promotion, c: color } : movingPiece;

    // Revogação dos direitos de castling
    const homeRow = color === 'w' ? 7 : 0;
    if (move.piece === 'k') {
      castling[color === 'w' ? 'K' : 'k'] = false;
      castling[color === 'w' ? 'Q' : 'q'] = false;
    }
    if (move.piece === 'r' && move.from === key(homeRow, 0)) castling[color === 'w' ? 'Q' : 'q'] = false;
    if (move.piece === 'r' && move.from === key(homeRow, 7)) castling[color === 'w' ? 'K' : 'k'] = false;
    if (move.to === key(0, 0)) castling.q = false;
    if (move.to === key(0, 7)) castling.k = false;
    if (move.to === key(7, 0)) castling.Q = false;
    if (move.to === key(7, 7)) castling.K = false;

    // En passant só vale para a jogada seguinte
    if (move.piece === 'p' && Math.abs(rowOf(move.to) - rowOf(move.from)) === 2) {
      ep = key((rowOf(move.from) + rowOf(move.to)) / 2, colOf(move.from));
    }

    return {
      board,
      turn: other(color),
      castling,
      ep,
      halfmove: move.piece === 'p' || move.captured ? 0 : source.halfmove + 1,
      fullmove: color === 'b' ? source.fullmove + 1 : source.fullmove,
      captured,
      history: source.history,
      result: null,
    };
  }

  // Um lance só é legal quando, depois de executado, o próprio rei
  // continua fora de xeque (isso cobre peças presas, xeque e castling).
  function legalMoves(source, color) {
    return pseudoMoves(source.board, color, source.castling, source.ep)
      .filter(move => !inCheck(applyMove(source, move).board, color));
  }

  function positionKey(source) {
    let signature = source.turn;
    for (let i = 0; i < 64; i++) signature += source.board[i] ? source.board[i].c + source.board[i].t : '-';
    signature += source.ep === null ? '' : String(source.ep);
    signature += ['K', 'Q', 'k', 'q'].filter(flag => source.castling[flag]).join('');
    return signature;
  }

  function insufficientMaterial(board) {
    const pieces = [];
    for (let i = 0; i < 64; i++) if (board[i] && board[i].t !== 'k') pieces.push(board[i]);
    if (pieces.length === 0) return true;                          // apenas os reis
    if (pieces.length === 1 && (pieces[0].t === 'b' || pieces[0].t === 'n')) return true;
    return false;
  }

  function evaluateResult(next) {
    const replies = legalMoves(next, next.turn);
    if (!replies.length) {
      return inCheck(next.board, next.turn)
        ? { over: true, outcome: 'loss', text: 'Xeque-mate! Você venceu esta partida.' }
        : { over: true, outcome: 'draw', text: 'Empate: impasse, o rei não tem lance legal.' };
    }
    if (insufficientMaterial(next.board)) {
      return { over: true, outcome: 'draw', text: 'Empate: material insuficiente para dar mate.' };
    }
    if (next.halfmove >= 100) {
      return { over: true, outcome: 'draw', text: 'Empate pela regra das 50 jogadas.' };
    }
    const signature = positionKey(next);
    const count = (repetition.get(signature) || 0) + 1;
    repetition.set(signature, count);
    if (count >= 3) {
      return { over: true, outcome: 'draw', text: 'Empate: a mesma posição apareceu três vezes.' };
    }
    return null;
  }

  // ── Notação algébrica ─────────────────────────────────────
  function toSan(source, move, replies) {
    if (move.castle) return move.castle === 'K' ? 'O-O' : 'O-O-O';

    let san = '';
    if (move.piece === 'p') {
      if (move.captured) san += FILES[colOf(move.from)] + 'x';
      san += sqName(move.to);
      if (move.promotion) san += '=' + SAN_LETTER[move.promotion];
    } else {
      san += SAN_LETTER[move.piece];
      const rivals = replies.filter(otherMove =>
        otherMove.to === move.to && otherMove.piece === move.piece && otherMove.from !== move.from);
      if (rivals.length) {
        const sameFile = rivals.some(o => colOf(o.from) === colOf(move.from));
        const sameRank = rivals.some(o => rowOf(o.from) === rowOf(move.from));
        if (!sameFile) san += FILES[colOf(move.from)];
        else if (!sameRank) san += String(8 - rowOf(move.from));
        else san += sqName(move.from);
      }
      if (move.captured) san += 'x';
      san += sqName(move.to);
    }
    return san;
  }

  // ── Trajetória da peça selecionada ───────────────────────
  // Devolve todas as casas que a peça alcança deslizando (o "caminho").
  // Os destinos legais recebem marcadores próprios (.is-target / .is-capture)
  // por cima desse realce; casas bloqueadas não entram na lista.
  function buildPath(from, moves) {
    const piece = state.board[from];
    const trail = new Set();
    if (!piece) return trail;

    // Castling também mostra o percurso da torre.
    for (const move of moves) {
      if (move.castle) {
        const homeRow = rowOf(from);
        trail.add(key(homeRow, move.castle === 'K' ? 5 : 3));
        trail.add(key(homeRow, move.castle === 'K' ? 6 : 2));
      }
    }

    if (!SLIDE[piece.t]) return trail;

    const r = rowOf(from);
    const f = colOf(from);
    for (const [dr, df] of SLIDE[piece.t]) {
      let nr = r + dr, nf = f + df;
      while (inside(nr, nf)) {
        trail.add(key(nr, nf));   // casa alcançável — pode ser destino ou apenas passagem
        if (state.board[key(nr, nf)]) break;   // bloqueada: nada além dela
        nr += dr; nf += df;
      }
    }

    return trail;
  }

  // ── Renderização ──────────────────────────────────────────
  function render() {
    if (!container) return;

    const checked = state.result ? -1 : (inCheck(state.board, state.turn) ? kingSquare(state.board, state.turn) : -1);
    const targetMap = new Map(targets.map(move => [move.to, move]));
    const lastMove = state.history.length ? state.history[state.history.length - 1].move : null;

    const cells = [];
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const i = key(r, f);
        const piece = state.board[i];
        const move = targetMap.get(i);
        const classes = ['chess-square', (r + f) % 2 ? 'is-light' : 'is-dark'];
        if (path.has(i)) classes.push('is-path');
        if (move) classes.push(move.captured || move.enPassant ? 'is-capture' : 'is-target');
        if (selected === i) classes.push('is-selected');
        if (i === checked) classes.push('is-checked');
        if (lastMove && (lastMove.from === i || lastMove.to === i)) classes.push('is-last');

        const description = sqName(i) +
          (piece ? `: ${PIECE_NAME[piece.t]} ${piece.c === 'w' ? 'branco' : 'preto'}` : ': vazia') +
          (move ? (move.captured || move.enPassant ? ', casa de captura' : ', destino legal') : '') +
          (path.has(i) ? ', casa do trajeto' : '');

        cells.push(
          '<button type="button" class="' + classes.join(' ') + '" data-square="' + i + '"' +
          ' aria-label="' + description + '"' +
          (piece ? '><span class="chess-piece ' + (piece.c === 'w' ? 'white' : 'black') + '" aria-hidden="true">' + GLYPH[piece.c][piece.t] + '</span></button>'
            : '></button>')
        );
      }
    }

    const rows = [];
    for (let i = 0; i < state.history.length; i += 2) {
      const white = state.history[i];
      const black = state.history[i + 1];
      rows.push(
        '<li><span class="chess-move-num">' + (i / 2 + 1) + '.</span>' +
        '<span class="chess-move">' + white.san + '</span>' +
        '<span class="chess-move">' + (black ? black.san : '—') + '</span></li>'
      );
    }

    const status = state.result
      ? state.result.text
      : (checked >= 0 ? 'Xeque! ' : '') + 'Vez das peças ' + colorName(state.turn) +
      ' · lance ' + state.fullmove + ' · ' + state.history.length + ' jogadas';

    container.innerHTML =
      '<section class="chess-game">' +
      '<div class="chess-header">' +
      '<div><p class="game-eyebrow">Dois jogadores</p><h3>Xadrez</h3></div>' +
      '<div class="chess-actions">' +
      '<button class="game-action-btn chess-undo" type="button"' + (undoStack.length ? '' : ' disabled') + '>Desfazer</button>' +
      '<button class="game-action-btn chess-new" type="button">Novo jogo</button>' +
      '</div>' +
      '</div>' +
      '<p class="chess-status" role="status" aria-live="polite">' + status + '</p>' +
      '<div class="chess-board" role="grid" aria-label="Tabuleiro de xadrez">' + cells.join('') + '</div>' +
      (pendingPromotion
        ? '<div class="chess-promotion"><p>Promoção: escolha a nova peça</p>' +
        '<div class="chess-promotion-row">' +
        ['q', 'r', 'b', 'n'].map(type =>
          '<button class="game-action-btn chess-promotion-btn" data-promotion="' + type + '">' +
          '<span aria-hidden="true">' + GLYPH.w[type] + '</span> ' + PIECE_NAME[type] + '</button>').join('') +
        '</div></div>'
        : '') +
      '<div class="chess-panels">' +
      '<div class="chess-captured"><strong>Capturadas</strong>' +
      '<p><span class="chess-side">Pelas brancas</span>' + (state.captured.w.length ? state.captured.w.map(t => GLYPH.w[t]).join(' ') : '—') + '</p>' +
      '<p><span class="chess-side">Pelas pretas</span>' + (state.captured.b.length ? state.captured.b.map(t => GLYPH.b[t]).join(' ') : '—') + '</p>' +
      '</div>' +
      '<div class="chess-history"><strong>Lances</strong>' +
      (rows.length
        ? '<ol class="chess-moves">' + rows.slice(-8).join('') + '</ol>'
        : '<p class="chess-history-empty">Nenhum lance realizado</p>') +
      '</div>' +
      '</div>' +
      '</section>';

    container.querySelectorAll('.chess-promotion-btn').forEach(button => {
      button.addEventListener('click', () => {
        const pending = pendingPromotion;
        pendingPromotion = null;
        commitMove(Object.assign({}, pending.move, { promotion: button.dataset.promotion }));
      });
    });
  }

  // ── Fluxo de jogada ───────────────────────────────────────
  function resetSelection() {
    selected = -1;
    targets = [];
    path = new Set();
  }

  function selectSquare(index) {
    if (selected >= 0) {
      const move = targets.find(item => item.to === index);
      if (move) {
        if (move.promotion) {
          pendingPromotion = { move };
          render();
        } else {
          commitMove(move);
        }
        return;
      }
    }

    const piece = state.board[index];
    if (piece && piece.c === state.turn) {
      const moves = legalMoves(state, state.turn).filter(move => move.from === index);
      if (moves.length) {
        selected = index;
        targets = moves;
        path = buildPath(index, moves);
        render();
        return;
      }
    }

    resetSelection();
    render();
  }

  function commitMove(move) {
    const replies = legalMoves(state, state.turn);
    const san = toSan(state, move, replies);
    const moverColor = state.turn;
    const next = applyMove(state, move);
    const verdict = evaluateResult(next);

    undoStack.push({
      board: state.board, castling: state.castling, ep: state.ep,
      halfmove: state.halfmove, fullmove: state.fullmove, turn: state.turn,
      captured: state.captured, history: state.history,
      signature: positionKey(state),
    });

    next.history = state.history.concat([{ san, from: move.from, to: move.to, color: moverColor }]);
    state = next;
    state.result = verdict;
    pendingPromotion = null;
    resetSelection();
    render();

    if (verdict) {
      window.dispatchEvent(new CustomEvent('passatempo:result', {
        detail: { result: verdict.outcome === 'loss' ? 'win' : verdict.outcome === 'draw' ? 'draw' : 'loss' }
      }));
    }
  }

  function undo() {
    const previous = undoStack.pop();
    if (!previous) return;
    repetition.set(previous.signature, Math.max(1, (repetition.get(previous.signature) || 1) - 1));
    state = Object.assign(state, previous, { result: null });
    pendingPromotion = null;
    resetSelection();
    render();
  }

  function newGame() {
    state = createState();
    undoStack.length = 0;
    pendingPromotion = null;
    resetSelection();
    render();
  }

  // ── Eventos ───────────────────────────────────────────────
  function handleClick(event) {
    const promotion = event.target.closest('[data-promotion]');
    if (promotion && pendingPromotion) {
      const pending = pendingPromotion;
      pendingPromotion = null;
      commitMove(Object.assign({}, pending.move, { promotion: promotion.dataset.promotion }));
      return;
    }
    const square = event.target.closest('[data-square]');
    if (square) {
      if (state.result) return;
      selectSquare(Number(square.dataset.square));
      return;
    }
    if (event.target.closest('.chess-new')) { newGame(); return; }
    if (event.target.closest('.chess-undo')) { undo(); }
  }

  function handleKey(event) {
    if (event.key !== 'Escape') return;
    if (!pendingPromotion && selected < 0) return;
    event.preventDefault();
    pendingPromotion = null;
    resetSelection();
    render();
  }

  /* Ponte de teste: permite montar posições arbitrárias (como notação FEN)
   * para validar promoções, castling, en passant e xeque-mate na QA.
   * Não altera o comportamento do jogo em uso normal. */
  function setPosition(fen) {
    const [placement, turn, castle, ep, half, full] = fen.trim().split(/\s+/);
    const board = new Array(64).fill(null);
    const rows = placement.split('/');
    if (rows.length !== 8) throw new Error('FEN inválido: esperado 8 fileiras, veio ' + rows.length);

    for (let r = 0; r < 8; r++) {
      let col = 0;
      for (const ch of rows[r]) {
        if (/\d/.test(ch)) { col += Number(ch); continue; }
        if (col > 7) throw new Error('FEN inválido: fileira transborda em ' + rows[r]);
        board[key(r, col)] = { t: ch.toLowerCase(), c: ch === ch.toLowerCase() ? 'b' : 'w' };
        col++;
      }
    }

    // A notação FEN usa casas como "e6"; converte para o índice interno.
    let epSquare = null;
    if (ep && ep !== '-') {
      const col = FILES.indexOf(ep[0]);
      const row = 8 - Number(ep[1]);
      if (col >= 0 && inside(row, col)) epSquare = key(row, col);
    }

    state = {
      board, turn, castling: { K: false, Q: false, k: false, q: false },
      ep: epSquare,
      halfmove: half ? Number(half) : 0,
      fullmove: full ? Number(full) : 1,
      captured: { w: [], b: [] },
      history: [],
      result: null,
    };
    for (const flag of castle) if (state.castling[flag]) state.castling[flag] = true;
    repetition = new Map([[positionKey(state), 1]]);
    pendingPromotion = null;
    resetSelection();
    render();
  }

  function mount(el) {
    container = el;
    newGame();
    container.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKey);
  }

  function unmount() {
    if (container) {
      container.removeEventListener('click', handleClick);
      container.innerHTML = '';
    }
    document.removeEventListener('keydown', handleKey);
    container = null;
    state = null;
    undoStack.length = 0;
  }

  return { mount, unmount, setPosition };
})();
