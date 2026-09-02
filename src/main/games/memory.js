'use strict';

// Jogo da Memória — módulo isolado
const Memory = (() => {

  // Pares de símbolos com nome acessível para aria-label
  const PAIRS = [
    { sym: '♦', name: 'Losango'    },
    { sym: '♣', name: 'Trevo'      },
    { sym: '♠', name: 'Espada'     },
    { sym: '♥', name: 'Coração'    },
    { sym: '★', name: 'Estrela'    },
    { sym: '◆', name: 'Diamante'   },
    { sym: '▲', name: 'Triângulo'  },
    { sym: '●', name: 'Círculo'    },
  ];

  let cards, flipped, matched, lockBoard, moves, seconds;
  let timerInterval, container;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function init() {
    const deck = shuffle([...PAIRS, ...PAIRS]);
    cards = deck.map((pair, id) => ({
      id,
      sym:     pair.sym,
      name:    pair.name,
      flipped: false,
      matched: false,
    }));
    flipped   = [];
    matched   = 0;
    lockBoard = false;
    moves     = 0;
    seconds   = 0;
    clearInterval(timerInterval);
  }

  // ── Renderização ──────────────────────────────────────────

  function buildDOM() {
    container.innerHTML = `
      <div class="mem-wrap">
        <div class="mem-stats">
          <span id="mem-moves" aria-live="polite">Movimentos: 0</span>
          <span id="mem-time">Tempo: 0:00</span>
        </div>
        <div class="mem-grid" role="list" aria-label="Grade do Jogo da Memória"></div>
        <button class="game-action-btn mem-restart">Reiniciar</button>
      </div>
    `;

    const grid = container.querySelector('.mem-grid');

    cards.forEach(card => {
      const btn = document.createElement('button');
      btn.className = 'mem-card';
      btn.setAttribute('role', 'listitem');
      btn.setAttribute('aria-label', 'Carta virada para baixo');
      btn.dataset.id = card.id;

      btn.innerHTML = `
        <span class="mem-face mem-face--back" aria-hidden="true"></span>
        <span class="mem-face mem-face--front" aria-hidden="true">${card.sym}</span>
      `;

      btn.addEventListener('click', () => handleFlip(card.id));
      grid.appendChild(btn);
    });

    container.querySelector('.mem-restart').addEventListener('click', restart);
  }

  function getCardEl(id) {
    return container.querySelector(`.mem-card[data-id="${id}"]`);
  }

  function refreshCard(id) {
    const card = cards[id];
    const el   = getCardEl(id);
    if (!el) return;

    el.classList.toggle('mem-card--flipped', card.flipped || card.matched);
    el.classList.toggle('mem-card--matched',  card.matched);
    el.disabled = card.matched;

    if (card.flipped || card.matched) {
      el.setAttribute('aria-label', `Carta: ${card.name}`);
    } else {
      el.setAttribute('aria-label', 'Carta virada para baixo');
    }
  }

  function updateStats() {
    const movEl  = container.querySelector('#mem-moves');
    if (movEl) movEl.textContent = `Movimentos: ${moves}`;
  }

  // ── Lógica do jogo ────────────────────────────────────────

  function handleFlip(id) {
    if (lockBoard) return;
    const card = cards[id];
    if (card.flipped || card.matched || flipped.length >= 2) return;

    // Inicia timer no primeiro clique
    if (!timerInterval) startTimer();

    card.flipped = true;
    flipped.push(card);
    refreshCard(id);

    if (flipped.length === 2) {
      moves++;
      updateStats();
      lockBoard = true;
      checkMatch();
    }
  }

  function checkMatch() {
    const [a, b] = flipped;

    if (a.sym === b.sym) {
      a.matched = true;
      b.matched = true;
      matched += 2;
      flipped   = [];
      lockBoard = false;
      refreshCard(a.id);
      refreshCard(b.id);

      if (matched === cards.length) {
        clearInterval(timerInterval);
        setTimeout(showWin, 400);
      }
    } else {
      setTimeout(() => {
        a.flipped = false;
        b.flipped = false;
        flipped   = [];
        lockBoard = false;
        refreshCard(a.id);
        refreshCard(b.id);
      }, 900);
    }
  }

  function showWin() {
    const wrap = container.querySelector('.mem-wrap');
    if (!wrap) return;
    const msg = document.createElement('p');
    msg.className = 'mem-win-msg';
    msg.setAttribute('role', 'status');
    msg.textContent =
      `Parabéns! Concluído em ${moves} movimentos e ${formatTime(seconds)}.`;
    wrap.appendChild(msg);
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      seconds++;
      const el = container?.querySelector('#mem-time');
      if (el) el.textContent = `Tempo: ${formatTime(seconds)}`;
    }, 1000);
  }

  function formatTime(s) {
    const m   = Math.floor(s / 60);
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
  }

  function restart() {
    clearInterval(timerInterval);
    timerInterval = null;
    init();
    buildDOM();
  }

  // ── Interface pública ─────────────────────────────────────

  function mount(el) {
    container = el;
    init();
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
