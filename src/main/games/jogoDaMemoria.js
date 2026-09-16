'use strict';

// Jogo da Memória — módulo isolado
const Memory = (() => {

  // Pares de ilustrações vetoriais próprias; não dependem de emojis ou fontes externas.
  const PAIRS = [
    { sym: '<svg viewBox="0 0 64 64"><path d="M14 38c7-17 17-23 36-21-3 18-16 29-36 21Z"/><path d="M15 49c13-9 24-19 34-34" class="mem-art-line"/><circle cx="48" cy="17" r="4"/></svg>', name: 'Folha' },
    { sym: '<svg viewBox="0 0 64 64"><path d="M11 43h42l-5-22H16Z"/><path d="M22 21c0-10 20-10 20 0" class="mem-art-line"/><path d="M18 31h28" class="mem-art-line"/></svg>', name: 'Mochila' },
    { sym: '<svg viewBox="0 0 64 64"><path d="M12 38 32 12l20 26-20 14Z"/><path d="m12 38 40 0M32 12v40" class="mem-art-line"/><path d="m18 32 28 0" class="mem-art-line"/></svg>', name: 'Pipa' },
    { sym: '<svg viewBox="0 0 64 64"><path d="M13 35c5-16 17-24 35-22-4 16-15 26-35 22Z"/><path d="M18 41c11-5 19-14 28-27" class="mem-art-line"/><path d="M16 17c7 2 13 5 18 10" class="mem-art-line"/></svg>', name: 'Pena' },
    { sym: '<svg viewBox="0 0 64 64"><path d="M19 18h26l4 31H15Z"/><path d="M23 18V12h18v6M16 31h32" class="mem-art-line"/><circle cx="25" cy="40" r="2"/><circle cx="39" cy="40" r="2"/></svg>', name: 'Lanterna' },
    { sym: '<svg viewBox="0 0 64 64"><path d="M12 29c4-16 20-16 20 0 0-16 16-16 20 0-4 16-20 16-20 0 0 16-16 16-20 0Z"/><path d="M32 28v23" class="mem-art-line"/><circle cx="32" cy="23" r="3"/></svg>', name: 'Borboleta' },
    { sym: '<svg viewBox="0 0 64 64"><path d="M16 42c0-14 9-23 23-23 7 0 12 3 16 8-4 10-13 18-27 18Z"/><path d="M13 45h39" class="mem-art-line"/><circle cx="38" cy="27" r="2"/></svg>', name: 'Tartaruga' },
    { sym: '<svg viewBox="0 0 64 64"><path d="M18 45V27l14-12 14 12v18Z"/><path d="M25 45V34h14v11M15 27h34" class="mem-art-line"/><path d="M32 9v6" class="mem-art-line"/></svg>', name: 'Casinha' }
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
    return container?.querySelector(`.mem-card[data-id="${id}"]`);
  }

  function refreshCard(id) {
    if (!container || !cards) return;
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
    if (!container) return;
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
