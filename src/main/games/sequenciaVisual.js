'use strict';

// Sequência Visual — módulo isolado.
// Formato diferente do Simon: o jogador observa uma ordem de ilustrações
// e precisa reconstruí-la clicando nas figuras embaralhadas.
const VisualSequence = (() => {
  // Banco de ilustrações vetoriais próprias (sem emojis nem fontes externas).
  const ITEMS = [
    { id: 'estrela', name: 'Estrela', art: '<svg viewBox="0 0 48 48"><path d="m24 5 5.6 12.4L43 19.2l-9.7 9 2.5 13.2L24 35.6 12.2 41.4l2.5-13.2-9.7-9 13.4-1.8Z" class="vs-art-line"/></svg>' },
    { id: 'lua', name: 'Lua', art: '<svg viewBox="0 0 48 48"><path d="M34 8a18 18 0 1 0 6 14A15 15 0 0 1 34 8Z" class="vs-art-line"/></svg>' },
    { id: 'gota', name: 'Gota', art: '<svg viewBox="0 0 48 48"><path d="M24 5c9 12 14 18 14 24a14 14 0 0 1-28 0c0-6 5-12 14-24Z" class="vs-art-line"/></svg>' },
    { id: 'barco', name: 'Barco', art: '<svg viewBox="0 0 48 48"><path d="M24 5v24M24 9l13 6-13 6M11 29h26l-5 11H16Z" class="vs-art-line"/></svg>' },
    { id: 'flor', name: 'Flor', art: '<svg viewBox="0 0 48 48"><circle cx="24" cy="13" r="6" class="vs-art-line"/><circle cx="13" cy="22" r="6" class="vs-art-line"/><circle cx="35" cy="22" r="6" class="vs-art-line"/><circle cx="24" cy="29" r="6" class="vs-art-line"/><path d="M24 35v8" class="vs-art-line"/></svg>' },
    { id: 'seta', name: 'Seta', art: '<svg viewBox="0 0 48 48"><path d="M10 24h28m0 0-11-11m11 11-11 11" class="vs-art-line"/></svg>' },
    { id: 'folha', name: 'Folha', art: '<svg viewBox="0 0 48 48"><path d="M8 40C12 18 26 8 42 8c0 16-14 30-34 32Z" class="vs-art-line"/><path d="M8 40 34 14" class="vs-art-thin"/></svg>' },
    { id: 'copo', name: 'Copo', art: '<svg viewBox="0 0 48 48"><path d="M11 10h26l-3 24a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4Z" class="vs-art-line"/><path d="M18 20v12m12-12v12" class="vs-art-thin"/></svg>' },
    { id: 'peixe', name: 'Peixe', art: '<svg viewBox="0 0 48 48"><path d="M6 24c7-10 21-12 28-4l8-6v20l-8-6c-7 8-21 6-28-4Z" class="vs-art-line"/><circle cx="17" cy="22" r="1.6" class="vs-art-dot"/></svg>' },
    { id: 'castelo', name: 'Castelo', art: '<svg viewBox="0 0 48 48"><path d="M10 42V14h6v-6h5v6h6v-6h5v6h6v28Z" class="vs-art-line"/><path d="M21 42V30h6v12" class="vs-art-thin"/></svg>' },
    { id: 'livro', name: 'Livro', art: '<svg viewBox="0 0 48 48"><path d="M8 10h13c2 0 3 1 3 3v26c0-2-1-3-3-3H8Zm32 0H27c-2 0-3 1-3 3v26c0-2 1-3 3-3h13Z" class="vs-art-line"/></svg>' },
    { id: 'bussola', name: 'Bússola', art: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17" class="vs-art-line"/><path d="m30 18-4 8-8 4 4-8Z" class="vs-art-line"/></svg>' },
    { id: 'coracao', name: 'Coração', art: '<svg viewBox="0 0 48 48"><path d="M24 41S8 31 8 19a8 8 0 0 1 16-3 8 8 0 0 1 16 3c0 12-16 22-16 22Z" class="vs-art-line"/></svg>' },
    { id: 'chave', name: 'Chave', art: '<svg viewBox="0 0 48 48"><circle cx="15" cy="17" r="7" class="vs-art-line"/><path d="M20 22 38 40m-6-6 4-4m-9 1 4-4" class="vs-art-line"/></svg>' },
    { id: 'ampulheta', name: 'Ampulheta', art: '<svg viewBox="0 0 48 48"><path d="M13 6h22M13 42h22M15 6v7l9 11-9 11v7m18-36v7l-9 11 9 11v7" class="vs-art-line"/></svg>' },
    { id: 'musica', name: 'Nota', art: '<svg viewBox="0 0 48 48"><path d="M20 36V10l14-3v26" class="vs-art-line"/><circle cx="16" cy="36" r="5" class="vs-art-line"/><circle cx="30" cy="33" r="5" class="vs-art-line"/></svg>' },
    { id: 'cachorro', name: 'Cachorro', art: '<svg viewBox="0 0 48 48"><path d="M12 20 8 10l9 4m19 6 4-10-9 4" class="vs-art-line"/><path d="M12 20a12 12 0 0 0 24 0Z" class="vs-art-line"/><path d="M20 27v3m8-3v3m-6 6h4" class="vs-art-thin"/></svg>' },
    { id: 'girassol', name: 'Girassol', art: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="13" class="vs-art-thin"/><circle cx="24" cy="24" r="6" class="vs-art-line"/><path d="M24 4v5m0 30v5M4 24h5m30 0h5M10 10l3.5 3.5m21 21L38 38M38 10l-3.5 3.5m-21 21L10 38" class="vs-art-thin"/></svg>' },
    { id: 'barco2', name: 'Veleiro', art: '<svg viewBox="0 0 48 48"><path d="M24 4v22" class="vs-art-line"/><path d="M24 7c8 3 12 8 12 14H24Z" class="vs-art-line"/><path d="M7 30h34l-6 10H13Z" class="vs-art-line"/><path d="M4 42c4 0 4-3 8-3s4 3 8 3 4-3 8-3 4 3 8 3" class="vs-art-thin"/></svg>' },
    { id: 'casa', name: 'Casa', art: '<svg viewBox="0 0 48 48"><path d="M8 22 24 9l16 13v18H8Z" class="vs-art-line"/><rect x="20" y="29" width="8" height="11" class="vs-art-thin"/><rect x="12" y="26" width="6" height="6" class="vs-art-thin"/></svg>' },
    { id: 'ovo', name: 'Ovo', art: '<svg viewBox="0 0 48 48"><path d="M24 6c9 0 14 13 14 21a14 14 0 0 1-28 0c0-8 5-21 14-21Z" class="vs-art-line"/><path d="M16 30c2 3 6 4 9 2" class="vs-art-thin"/></svg>' },
    { id: 'planeta', name: 'Planeta', art: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="11" class="vs-art-line"/><ellipse cx="24" cy="24" rx="20" ry="7" class="vs-art-thin" transform="rotate(-18 24 24)"/></svg>' },
    { id: 'pessoa', name: 'Pessoa', art: '<svg viewBox="0 0 48 48"><circle cx="24" cy="13" r="6" class="vs-art-line"/><path d="M11 41c0-8 6-13 13-13s13 5 13 13" class="vs-art-line"/></svg>' },
  ];

  const MAX_LIVES = 3;
  const STEP_MS = [1100, 1000, 900, 800, 720, 650, 590, 540, 500, 460];
  // Tempo de resposta: começa em 5s e ganha 1s a cada fase superada.
  const THINK_BASE_MS = 5000;
  const THINK_STEP_MS = 1000;
  const COUNTDOWN_TICK_MS = 250;

  let container;
  let order = [];       // ordem correta (ids)
  let options = [];     // figuras embaralhadas exibidas ao jogador
  let picked = [];      // o que o jogador já marcou
  let level = 0;
  let lives = MAX_LIVES;
  let playing = false;
  let accepting = false;
  const timers = new Set();

  // ── Utilidades ───────────────────────────────────────────

  function track(timer) { timers.add(timer); return timer; }
  function clearTimers() { timers.forEach(clearTimeout); timers.clear(); }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function byId(id) { return ITEMS.find(item => item.id === id); }
  function stepDelay() { return STEP_MS[Math.min(level - 1, STEP_MS.length - 1)]; }
  function thinkMs() { return THINK_BASE_MS + THINK_STEP_MS * (level - 1); }

  // ── Renderização ─────────────────────────────────────────

  function statusEl() { return container?.querySelector('.vs-status'); }
  function setStatus(message) { const el = statusEl(); if (el) el.textContent = message; }

  function updateHud() {
    const roundEl = container?.querySelector('.vs-round');
    const livesEl = container?.querySelector('.vs-lives');
    if (roundEl) roundEl.textContent = String(level);
    if (livesEl) {
      livesEl.textContent = '♥'.repeat(lives) + '♡'.repeat(MAX_LIVES - lives);
      livesEl.setAttribute('aria-label', `${lives} de ${MAX_LIVES} vidas restantes`);
    }
  }

  function build() {
    container.innerHTML = `
      <section class="vs-game">
        <div class="vs-hud">
          <div class="vs-score"><span class="vs-score-label">Rodada</span><strong class="vs-round">0</strong></div>
          <p class="vs-status" role="status" aria-live="polite">Pressione “Iniciar jogo” para começar.</p>
          <div class="vs-score vs-score--lives">
            <span class="vs-score-label">Vidas</span>
            <strong class="vs-lives" aria-label="3 de 3 vidas restantes">♥♥♥</strong>
          </div>
        </div>

        <p class="vs-eyebrow game-eyebrow">Sequência a reproduzir</p>
        <ol class="vs-stage" aria-label="Sequência exibida"></ol>
        <p class="vs-think" aria-hidden="true"><span class="vs-think-bar" style="--vs-think:100%"></span></p>

        <p class="vs-eyebrow game-eyebrow">Toque na ordem em que apareceram</p>
        <div class="vs-options" role="group" aria-label="Figuras para ordenar"></div>

        <div class="vs-actions">
          <button type="button" class="game-action-btn vs-start">Iniciar jogo</button>
        </div>
      </section>
    `;
    container.querySelector('.vs-start').addEventListener('click', startGame);
    renderStage();
    renderOptions();
    updateHud();
  }

  function renderStage() {
    const stage = container.querySelector('.vs-stage');
    // Oculta as figuras durante a resposta: só a posição na sequência e a
    // cor sobrevivem como pista, o figurado some por completo.
    stage.innerHTML = order.map((id, index) => {
      const item = byId(id);
      const hue = (index * 47 + 18) % 360;
      return `<li class="vs-step" style="--vs-delay:${index * 60}ms;--vs-hue:${hue}">
                <span class="vs-step-index">${index + 1}</span>
                <span class="vs-step-art">${item.art}</span>
              </li>`;
    }).join('') || '<li class="vs-stage-empty">Nenhuma sequência ainda</li>';
  }

  function renderOptions() {
    const box = container.querySelector('.vs-options');
    box.innerHTML = options.map(id => {
      const item = byId(id);
      const used = picked.includes(id);
      return `<button type="button" class="vs-option${used ? ' is-used' : ''}"
                data-item="${id}" ${used ? 'disabled' : ''}
                aria-label="${item.name}${used ? ', já posicionado' : ''}">
                <span class="vs-option-art">${item.art}</span>
                <span class="vs-option-name">${item.name}</span>
              </button>`;
    }).join('');
  }

  // Marca uma figura como já posicionada sem recriar o DOM, para que o foco
  // do teclado permaneça no elemento que o jogador acabou de acionar.
  function markOptionUsed(id) {
    const el = container.querySelector(`.vs-option[data-item="${id}"]`);
    if (!el) return;
    el.classList.add('is-used');
    el.disabled = true;
    el.setAttribute('aria-label', `${byId(id).name}, já posicionado`);
  }

  function clearOptionFeedback() {
    container.querySelectorAll('.vs-option').forEach(el => {
      el.classList.remove('is-wrong', 'is-hint');
    });
  }

  // ── Lógica do jogo ───────────────────────────────────────

  function startGame() {
    clearTimers();
    order = [];
    level = 0;
    lives = MAX_LIVES;
    nextRound();
  }

  function nextRound() {
    level += 1;
    picked = [];
    // A próxima rodada sempre acrescenta uma figura nova à sequência anterior.
    const pool = ITEMS.filter(item => !order.includes(item.id));
    if (pool.length) order.push(pool[Math.floor(Math.random() * pool.length)].id);
    options = shuffle(order);

    playing = true;
    accepting = false;
    renderStage();
    container.querySelector('.vs-think-bar')?.style.setProperty('--vs-think', '100%');
    renderOptions();
    updateHud();
    showSequence();
  }

  function showSequence() {
    const stage = container.querySelector('.vs-stage');
    clearOptionFeedback();
    setStatus('Memorize a ordem das figuras…');
    stage.classList.remove('is-hidden');
    [...stage.querySelectorAll('.vs-step')].forEach(step => step.classList.remove('is-showing'));

    const delay = stepDelay();
    order.forEach((_, index) => {
      track(setTimeout(() => {
        stage.querySelectorAll('.vs-step')[index]?.classList.add('is-showing');
      }, 260 + index * delay));
    });

    track(setTimeout(startThinking, 260 + order.length * delay + 240));
  }

  // A sequência desaparece e o prazo começa a correr na mesma hora: o jogador
  // já pode responder enquanto memoriza. O total de `thinkMs()` (5s na primeira
  // fase, +1s por fase) é o tempo disponível para responder; estourar custa vida.
  function startThinking() {
    const stage = container.querySelector('.vs-stage');
    [...stage.querySelectorAll('.vs-step')].forEach(step => step.classList.remove('is-showing'));
    stage.classList.add('is-hidden');

    const total = thinkMs();
    const endsAt = Date.now() + total;
    const bar = container.querySelector('.vs-think-bar');
    bar?.style.setProperty('--vs-think', '100%');

    const tick = () => {
      const left = Math.max(0, endsAt - Date.now());
      // O `setTimeout` final (que encerra o prazo) roda no mesmo instante do
      // último tique; retornar aqui evita sobrescrever o status da rodada.
      if (left <= 0) return;
      bar?.style.setProperty('--vs-think', `${(left / total) * 100}%`);
      setStatus(`Repita a sequência! ${Math.ceil(left / 1000)}s`);
      track(setTimeout(tick, COUNTDOWN_TICK_MS));
    };

    // Sem espera: a resposta é liberada imediatamente, junto com o cronômetro.
    accepting = true;
    tick();
    track(setTimeout(timeUp, total));
  }

  // O prazo terminou com a sequência incompleta: mesmo efeito de um erro.
  function timeUp() {
    if (!playing || picked.length >= order.length) return;
    clearTimers();
    loseLife(null, order[picked.length]);
  }

  function handlePick(id) {
    if (!accepting || !playing || picked.includes(id)) return;

    const expected = order[picked.length];
    if (id !== expected) {
      loseLife(id, expected);
      return;
    }

    picked.push(id);
    markOptionUsed(id);
    container.querySelector('.vs-stage')?.classList.remove('is-hidden');

    if (picked.length === order.length) {
      accepting = false;
      setStatus(`Correto! Sequência de ${level} acertada. Prepare-se para a próxima.`);
      track(setTimeout(nextRound, 1000));
    }
  }

  function loseLife(chosen, expected) {
    accepting = false;
    lives -= 1;
    updateHud();
    container.querySelector('.vs-think-bar')?.style.setProperty('--vs-think', '0%');

    // `chosen === null` significa que o prazo estourou, e não um clique errado.
    if (chosen === null) {
      const expectedEl = container.querySelector(`.vs-option[data-item="${expected}"]`);
      expectedEl?.classList.add('is-hint');

      if (lives <= 0) {
        setStatus('Fim de jogo! Clique em “Iniciar jogo” para tentar novamente.');
        playing = false;
        window.dispatchEvent(new CustomEvent('passatempo:result', { detail: { result: 'loss' } }));
        return;
      }

      setStatus(`O tempo acabou! Restam ${lives} vida${lives > 1 ? 's' : ''}. A sequência será mostrada de novo.`);
      track(setTimeout(() => showSequence(), 1500));
      return;
    }

    const chosenEl = container.querySelector(`.vs-option[data-item="${chosen}"]`);
    chosenEl?.classList.add('is-wrong');
    const expectedEl = container.querySelector(`.vs-option[data-item="${expected}"]`);
    expectedEl?.classList.add('is-hint');

    if (lives <= 0) {
      setStatus('Fim de jogo! Clique em “Iniciar jogo” para tentar novamente.');
      playing = false;
      window.dispatchEvent(new CustomEvent('passatempo:result', { detail: { result: 'loss' } }));
      return;
    }

    setStatus(`Não era essa figura. Ela deveria ser “${byId(expected).name}”. Restam ${lives} vida${lives > 1 ? 's' : ''}.`);
    track(setTimeout(() => showSequence(), 1300));
  }

  function onClick(event) {
    const option = event.target.closest('.vs-option');
    if (option) handlePick(option.dataset.item);
  }

  // ── Interface pública ─────────────────────────────────────

  function mount(el) {
    container = el;
    order = [];
    picked = [];
    level = 0;
    lives = MAX_LIVES;
    playing = false;
    accepting = false;
    build();
    container.addEventListener('click', onClick);
  }

  function unmount() {
    if (container) {
      container.removeEventListener('click', onClick);
      container.innerHTML = '';
    }
    container = null;
    clearTimers();
  }

  return { mount, unmount };
})();
