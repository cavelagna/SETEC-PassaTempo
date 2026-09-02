'use strict';

// Snake — módulo isolado (usa Canvas apenas para o jogo)
const Snake = (() => {

  const CELL   = 20;  // tamanho de cada célula em px
  const SPEED  = 140; // ms por tick

  let canvas, ctx, container;
  let snake, direction, nextDir, food, score, gameState, intervalId;
  let cols, rows;

  // ── Polyfill roundRect (compatibilidade) ──────────────────
  function drawRoundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y,     x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x,     y + h, r);
    ctx.arcTo(x,     y + h, x,     y,     r);
    ctx.arcTo(x,     y,     x + w, y,     r);
    ctx.closePath();
  }

  // ── Inicialização ─────────────────────────────────────────

  function init() {
    cols = Math.floor(canvas.width  / CELL);
    rows = Math.floor(canvas.height / CELL);

    // Cobra começa no centro, movendo para a direita
    const midX = Math.floor(cols / 2);
    const midY = Math.floor(rows / 2);
    snake     = [{ x: midX, y: midY }, { x: midX - 1, y: midY }, { x: midX - 2, y: midY }];
    direction = { x: 1, y: 0 };
    nextDir   = { x: 1, y: 0 };
    score     = 0;
    gameState = 'ready';
    spawnFood();
    updateScore();
    updateStartButton();
    draw();
  }

  function spawnFood() {
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows),
      };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    food = pos;
  }

  // ── Loop do jogo ──────────────────────────────────────────

  function tick() {
    if (gameState !== 'running') return;

    direction = { ...nextDir };
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Colisão com paredes
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
      endGame();
      return;
    }

    // Colisão consigo mesmo
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      endGame();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      updateScore();
      spawnFood();
    } else {
      snake.pop();
    }

    draw();
  }

  function endGame() {
    gameState = 'lost';
    clearInterval(intervalId);
    updateStartButton();
    draw(); // renderiza overlay de game over
  }

  function start() {
    if (gameState === 'running') return;
    gameState = 'running';
    updateStartButton();
    intervalId = setInterval(tick, SPEED);
  }

  function restart() {
    clearInterval(intervalId);
    init();
    start();
  }

  // ── Renderização em Canvas ────────────────────────────────

  function draw() {
    const W = canvas.width;
    const H = canvas.height;

    // Cores do tema atual via CSS variables
    const style  = getComputedStyle(document.documentElement);
    const bgCard = style.getPropertyValue('--bg-card').trim()     || '#FFFFFF';
    const bgPage = style.getPropertyValue('--bg').trim()          || '#FAF8EF';
    const accent = style.getPropertyValue('--accent').trim()      || '#8F7A66';
    const text   = style.getPropertyValue('--text-strong').trim() || '#5A5248';
    const muted  = style.getPropertyValue('--text-muted').trim()  || '#A09488';
    const divider = style.getPropertyValue('--divider').trim()    || '#B4A38F';

    // Fundo do canvas
    ctx.fillStyle = bgCard;
    ctx.fillRect(0, 0, W, H);

    // Grade sutil
    ctx.strokeStyle = divider;
    ctx.lineWidth   = 1;
    for (let x = 0; x <= W; x += CELL) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += CELL) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Comida
    ctx.fillStyle = accent;
    drawRoundRect(food.x * CELL + 3, food.y * CELL + 3, CELL - 6, CELL - 6, 3);
    ctx.fill();

    // Cobra (gradiente de opacidade do corpo)
    snake.forEach((seg, i) => {
      const alpha = Math.max(0.35, 1 - (i / snake.length) * 0.65);
      if (i === 0) {
        ctx.fillStyle = text;
      } else {
        ctx.fillStyle = `rgba(143,122,102,${alpha.toFixed(2)})`;
      }
      const r = i === 0 ? 5 : 3;
      drawRoundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, r);
      ctx.fill();
    });

    // Overlay de espera ou fim de jogo
    if (gameState === 'ready' || gameState === 'lost') {
      ctx.fillStyle = bgPage.includes('#') ? bgPage + 'DD' : 'rgba(250,248,239,0.88)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = text;
      ctx.font      = `bold 1.1rem 'Libre Baskerville', serif`;
      ctx.textAlign = 'center';
      ctx.fillText(gameState === 'ready' ? 'Pronto para jogar' : 'Fim de jogo', W / 2, H / 2 - 10);
      ctx.font      = `0.82rem 'Inter', sans-serif`;
      ctx.fillStyle = muted;
      ctx.fillText(gameState === 'ready' ? 'Clique em Iniciar para começar' : `Pontuação: ${score}`, W / 2, H / 2 + 14);
      ctx.font      = `0.75rem 'Inter', sans-serif`;
      if (gameState === 'lost') ctx.fillText('Clique em Reiniciar para jogar novamente', W / 2, H / 2 + 36);
    }
  }

  function updateScore() {
    const el = container?.querySelector('.snake-score');
    if (el) el.setAttribute('aria-live', 'polite'),
            el.textContent = `Pontuação: ${score}`;
  }

  function updateStartButton() {
    const btn = container?.querySelector('.snake-start-btn');
    if (btn) btn.hidden = gameState !== 'ready';
  }

  // ── Controles de teclado ──────────────────────────────────

  function handleKey(e) {
    // Só processa se o Snake estiver ativo
    if (!container || !document.getElementById('view-game') ||
        document.getElementById('view-game').hidden) return;

    const MAP = {
      ArrowUp:    { x: 0, y: -1 },
      ArrowDown:  { x: 0, y:  1 },
      ArrowLeft:  { x: -1, y: 0 },
      ArrowRight: { x: 1,  y: 0 },
      w:          { x: 0, y: -1 },
      s:          { x: 0, y:  1 },
      a:          { x: -1, y: 0 },
      d:          { x: 1,  y: 0 },
    };

    const dir = MAP[e.key];
    if (!dir) return;

    // Impede reverter a direção atual
    if (dir.x !== 0 && dir.x === -direction.x) return;
    if (dir.y !== 0 && dir.y === -direction.y) return;

    nextDir = dir;
    e.preventDefault(); // impede scroll da página com setas
  }

  // ── Construção do DOM ─────────────────────────────────────

  function buildDOM() {
    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'snake-wrap';

    // Pontuação
    const scoreEl = document.createElement('p');
    scoreEl.className = 'snake-score';
    scoreEl.textContent = 'Pontuação: 0';
    wrap.appendChild(scoreEl);

    // Dica
    const hint = document.createElement('p');
    hint.className = 'snake-hint';
    hint.textContent = 'Use as setas do teclado ou WASD para mover.';
    wrap.appendChild(hint);

    // Canvas
    const containerWidth = container.getBoundingClientRect().width || 500;
    const size = Math.min(400, Math.max(260, containerWidth - 40));

    canvas = document.createElement('canvas');
    canvas.width  = size;
    canvas.height = size;
    canvas.className = 'snake-canvas';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Jogo Snake — tela do jogo');
    canvas.tabIndex = 0;
    wrap.appendChild(canvas);

    // Controles
    const controls = document.createElement('div');
    controls.className = 'snake-controls';

    const startBtn = document.createElement('button');
    startBtn.className = 'game-action-btn snake-start-btn';
    startBtn.textContent = 'Iniciar';
    startBtn.addEventListener('click', start);
    controls.appendChild(startBtn);

    const restartBtn = document.createElement('button');
    restartBtn.className = 'game-action-btn';
    restartBtn.textContent = 'Reiniciar';
    restartBtn.addEventListener('click', restart);
    controls.appendChild(restartBtn);

    // D-pad para mobile
    const dpad = document.createElement('div');
    dpad.className = 'snake-dpad';
    dpad.setAttribute('aria-label', 'Controles direcionais');
    dpad.setAttribute('role', 'group');

    const DPAD_DIRS = [
      { key: 'up',    label: 'Cima',     dir: { x: 0, y: -1 }, sym: '▲' },
      { key: 'left',  label: 'Esquerda', dir: { x: -1, y: 0 }, sym: '◀' },
      { key: 'right', label: 'Direita',  dir: { x: 1,  y: 0 }, sym: '▶' },
      { key: 'down',  label: 'Baixo',    dir: { x: 0,  y: 1 }, sym: '▼' },
    ];

    DPAD_DIRS.forEach(({ key, label, dir, sym }) => {
      const btn = document.createElement('button');
      btn.className = `snake-dpad-btn snake-dpad-btn--${key}`;
      btn.setAttribute('aria-label', label);
      btn.textContent = sym;
      btn.addEventListener('click', () => {
        if (gameState !== 'running') return;
        if (dir.x !== 0 && dir.x === -direction.x) return;
        if (dir.y !== 0 && dir.y === -direction.y) return;
        nextDir = dir;
      });
      dpad.appendChild(btn);
    });

    controls.appendChild(dpad);
    wrap.appendChild(controls);
    container.appendChild(wrap);

    ctx = canvas.getContext('2d');
  }

  // ── Interface pública ─────────────────────────────────────

  function mount(el) {
    container = el;
    buildDOM();
    init();
    document.addEventListener('keydown', handleKey);
    canvas.focus();
  }

  function unmount() {
    clearInterval(intervalId);
    document.removeEventListener('keydown', handleKey);
    if (container) container.innerHTML = '';
    container = null;
    canvas = null;
    ctx    = null;
  }

  return { mount, unmount };
})();
