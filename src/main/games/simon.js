'use strict';

// Simon — módulo isolado.
// Quatro painéis em formato 2×2, quatro timbres distintos gerados por Web Audio,
// sequência crescente, progresso visível e recorde local.
const Simon = (() => {
  // Cada painel tem cor própria e um acorde exclusivo. Cores modernas e
  // aconchegantes, distintas da paleta terrosa do site, mas harmônicas com ela.
  const PADS = [
    { id: 0, name: 'Coral',  color: '#d98a72', glow: '#e8a894', notes: [261.63, 329.63] }, // C5/E5
    { id: 1, name: 'Índigo', color: '#7f9fc9', glow: '#9db9de', notes: [293.66, 349.23] }, // D5/F5
    { id: 2, name: 'Sálvia', color: '#8fb392', glow: '#a9c9ab', notes: [329.63, 392.00] }, // E5/G5
    { id: 3, name: 'Âmbar',  color: '#e0ae63', glow: '#efc78c', notes: [392.00, 440.00] }, // G5/A5
  ];

  const BEST_KEY = 'pt-simon-best';
  const SPEEDS = [700, 620, 540, 460, 400, 350, 310, 270, 240, 220]; // ms por passo

  let container, padEls;
  let sequence = [];      // índices na ordem em que devem ser repetidos
  let inputIndex = 0;     // posição atual durante a resposta do jogador
  let state = 'idle';     // idle | playing | input | over
  let level = 0;          // tamanho da sequência
  let best = 0;           // recorde (maior sequência vencida)
  let audioCtx = null;

  const timers = new Set();

  // ── Áudio ────────────────────────────────────────────────

  function track(timer) {
    timers.add(timer);
    return timer;
  }

  function clearAllTimers() {
    timers.forEach(id => clearTimeout(id));
    timers.clear();
  }

  // Web Audio dispensa arquivos externos e garante um timbre exclusivo para
  // cada painel. O contexto só nasce após o primeiro gesto do usuário, como
  // exigem os navegadores modernos.
  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      try { audioCtx = new Ctx(); } catch (_) { audioCtx = null; }
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  function playSound(pad, duration = 0.3) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.26, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Triangular na fundamental e seno uma quinta acima: timbre macio.
    pad.notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + duration + 0.05);
    });
  }

  // ── Estado ───────────────────────────────────────────────

  function loadBest() {
    try { best = Math.max(0, parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0); } catch (_) { best = 0; }
  }

  function saveBest(value) {
    if (value <= best) return;
    best = value;
    try { localStorage.setItem(BEST_KEY, String(best)); } catch (_) { }
  }

  function nextStepDelay() {
    return SPEEDS[Math.min(level - 1, SPEEDS.length - 1)];
  }

  function setPadState(index, active) {
    const el = padEls?.[index];
    if (!el) return;
    el.classList.toggle('is-lit', active);
    el.setAttribute('aria-pressed', String(active));
  }

  function clearPadStates() {
    padEls?.forEach((_, index) => setPadState(index, false));
  }

  function flashPad(index, duration = 380) {
    setPadState(index, true);
    track(setTimeout(() => setPadState(index, false), duration));
  }

  // ── Renderização ─────────────────────────────────────────

  function status() {
    return container?.querySelector('.sim-status');
  }

  function setStatus(message) {
    const el = status();
    if (el) el.textContent = message;
  }

  function updateHud() {
    const roundEl = container?.querySelector('.sim-round');
    const bestEl = container?.querySelector('.sim-best');
    if (roundEl) roundEl.textContent = String(level);
    if (bestEl) bestEl.textContent = String(best);
    renderProgress();
  }

  // Barra de progresso da rodada: enche conforme o jogador acerta os passos.
  function renderProgress() {
    const bar = container?.querySelector('.sim-progress-bar');
    if (!bar) return;
    const done = state === 'over' ? 0 : inputIndex;
    bar.style.setProperty('--sim-progress', `${sequence.length ? (done / sequence.length) * 100 : 0}%`);
  }

  // O estado do painel é sempre derivado de `state`, evitando dessincronização.
  // Usamos `aria-disabled` (e não `disabled`) para que os painéis não saiam da
  // ordem de tabulação no meio da partida, o que causaria perda de foco.
  function setControls() {
    const startBtn = container?.querySelector('.sim-start');
    if (startBtn) {
      startBtn.disabled = state === 'playing' || state === 'input';
      startBtn.textContent = state === 'over' ? 'Jogar de novo' : (level > 0 ? 'Recomeçar' : 'Iniciar jogo');
    }
    const padsDisabled = state !== 'input';
    padEls?.forEach(pad => { pad.setAttribute('aria-disabled', String(padsDisabled)); });
    container?.classList.toggle('is-locked', state !== 'input');
  }

  function build() {
    container.innerHTML = `
      <section class="sim-game">
        <div class="sim-hud">
          <div class="sim-score">
            <span class="sim-score-label">Rodada</span>
            <strong class="sim-round">0</strong>
          </div>
          <p class="sim-status" role="status" aria-live="polite">Pressione “Iniciar jogo” para começar.</p>
          <div class="sim-score">
            <span class="sim-score-label">Recorde</span>
            <strong class="sim-best">0</strong>
          </div>
        </div>

        <p class="sim-progress" aria-hidden="true">
          <span class="sim-progress-bar" style="--sim-progress:0%"></span>
        </p>

        <div class="sim-pads" role="group" aria-label="Painéis do Simon">
          ${PADS.map(pad => `
            <button type="button" class="sim-pad" data-pad="${pad.id}"
                    style="--pad-color:${pad.color};--pad-glow:${pad.glow}" aria-pressed="false"
                    aria-disabled="true"
                    aria-label="Painel ${pad.name} (tecla ${pad.id + 1})">
              <span class="sim-pad-shape" aria-hidden="true"></span>
              <span class="sim-pad-name">${pad.name}</span>
            </button>`).join('')}
          <span class="sim-hub" aria-hidden="true"></span>
        </div>

        <div class="sim-actions">
          <button type="button" class="game-action-btn sim-start">Iniciar jogo</button>
        </div>
        <p class="sim-hint">Use o mouse, o toque ou as teclas <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd>.</p>
      </section>
    `;

    padEls = [...container.querySelectorAll('.sim-pad')];
    padEls.forEach(pad => {
      // `click` é o único caminho de ativação: cobre mouse, toque e teclado
      // (Enter/Espaço) sem duplicar eventos nem sequestrar o foco.
      pad.addEventListener('click', () => handlePad(Number(pad.dataset.pad)));
    });
    container.querySelector('.sim-start').addEventListener('click', startRound);

    setControls();
    updateHud();
  }

  // ── Lógica do jogo ───────────────────────────────────────

  function startRound() {
    ensureAudio();
    clearAllTimers();
    clearPadStates();
    sequence = [];
    level = 0;
    inputIndex = 0;
    nextRound();
  }

  function nextRound() {
    level += 1;
    const pad = PADS[Math.floor(Math.random() * PADS.length)];
    sequence.push(pad.id);
    inputIndex = 0;
    updateHud();
    playSequence();
  }

  function playSequence() {
    state = 'playing';
    setControls();
    renderProgress();
    setStatus('Observe a sequência…');

    const step = nextStepDelay();
    // Pequena pausa inicial para o jogador separar "assistir" de "responder".
    let delay = 520;

    sequence.forEach(padIndex => {
      track(setTimeout(() => {
        playSound(PADS[padIndex]);
        flashPad(padIndex, Math.max(180, step * 0.62));
      }, delay));
      delay += step;
    });

    delay += track(setTimeout(() => {
      clearPadStates();
      inputIndex = 0;
      state = 'input';
      setControls();
      renderProgress();
      setStatus('Sua vez! Repita a sequência na ordem.');
    }, delay + 220));
  }

  function handlePad(index) {
    if (state !== 'input') return;
    if (!Number.isInteger(index) || index < 0 || index >= PADS.length) return;

    const pad = PADS[index];
    ensureAudio();
    playSound(pad, 0.24);
    flashPad(index, 220);

    if (index !== sequence[inputIndex]) {
      gameOver();
      return;
    }

    inputIndex += 1;
    renderProgress();

    if (inputIndex === sequence.length) {
      state = 'idle';
      setControls();
      saveBest(level);
      updateHud();
      setStatus(`Muito bem! Sequência de ${level} acertada. Prepare-se para a próxima.`);
      clearPadStates();
      track(setTimeout(nextRound, 900));
    }
  }

  function gameOver() {
    clearAllTimers();
    clearPadStates();
    state = 'over';
    setControls();
    renderProgress();
    setStatus(`Fim da rodada! Você chegou à sequência ${level}. Clique em “Jogar de novo”.`);
    // O orquestrador só exibe overlay para jogos com resultado; o evento
    // mantém o módulo desacoplado e permite efeitos futuros.
    window.dispatchEvent(new CustomEvent('passatempo:result', { detail: { result: 'loss' } }));
  }

  // ── Interface pública ─────────────────────────────────────

  function onKeyDown(event) {
    if (container === null) return;
    if (event.target && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    const key = Number(event.key);
    if (!Number.isInteger(key) || key < 1 || key > 4) return;
    // Não sequestramos atalhos do navegador com modificadores.
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    handlePad(key - 1);
  }

  function mount(el) {
    container = el;
    loadBest();
    sequence = [];
    inputIndex = 0;
    level = 0;
    state = 'idle';
    build();
    document.addEventListener('keydown', onKeyDown);
  }

  function unmount() {
    document.removeEventListener('keydown', onKeyDown);
    clearAllTimers();
    clearPadStates();
    if (container) container.innerHTML = '';
    container = null;
    padEls = null;
  }

  return { mount, unmount };
})();
