'use strict';

const Breakout = (() => {
  const WIDTH = 800;
  const HEIGHT = 500;
  const PADDLE_WIDTH = 112;
  const PADDLE_HEIGHT = 14;
  const PADDLE_Y = HEIGHT - 34;
  const BALL_RADIUS = 8;
  const BRICK_ROWS = 5;
  const BRICK_COLUMNS = 10;
  const BRICK_WIDTH = 68;
  const BRICK_HEIGHT = 21;
  const BRICK_GAP = 7;
  const BRICK_LEFT = (WIDTH - (BRICK_COLUMNS * BRICK_WIDTH + (BRICK_COLUMNS - 1) * BRICK_GAP)) / 2;

  let container = null;
  let canvas = null;
  let context = null;
  let scoreLabel = null;
  let livesLabel = null;
  let statusLabel = null;
  let pauseButton = null;
  let paddleX = 0;
  let ball = null;
  let bricks = [];
  let score = 0;
  let lives = 3;
  let paused = false;
  let ended = false;
  let frameId = 0;
  let lastFrame = 0;
  const keys = new Set();

  function setStatus(message) {
    if (statusLabel) statusLabel.textContent = message;
  }

  function updateHud() {
    scoreLabel.textContent = String(score);
    livesLabel.textContent = String(lives);
  }

  function resetBall() {
    ball = { x: WIDTH / 2, y: PADDLE_Y - 24, vx: 3.2, vy: -4.2 };
  }

  function reset() {
    score = 0;
    lives = 3;
    paddleX = (WIDTH - PADDLE_WIDTH) / 2;
    resetBall();
    paused = false;
    ended = false;
    lastFrame = 0;
    bricks = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let column = 0; column < BRICK_COLUMNS; column++) {
        bricks.push({
          x: BRICK_LEFT + column * (BRICK_WIDTH + BRICK_GAP),
          y: 66 + row * (BRICK_HEIGHT + BRICK_GAP),
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          row,
          alive: true,
        });
      }
    }
    pauseButton.textContent = 'Pausar';
    updateHud();
    setStatus('Partida em andamento.');
  }

  function draw() {
    const styles = getComputedStyle(container);
    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = styles.getPropertyValue('--bg-card').trim() || '#ffffff';
    context.fillRect(0, 0, WIDTH, HEIGHT);

    const tones = ['--tone-1', '--tone-2', '--tone-3', '--tone-4', '--tone-5'];
    for (const brick of bricks) {
      if (!brick.alive) continue;
      context.fillStyle = styles.getPropertyValue(tones[brick.row]).trim() || '#947c6c';
      context.fillRect(brick.x, brick.y, brick.width, brick.height);
      context.strokeStyle = styles.getPropertyValue('--bg-card').trim() || '#ffffff';
      context.strokeRect(brick.x + 0.5, brick.y + 0.5, brick.width - 1, brick.height - 1);
    }

    context.fillStyle = styles.getPropertyValue('--surface-brown').trim() || '#807060';
    context.fillRect(paddleX, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);
    context.beginPath();
    context.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    context.fillStyle = styles.getPropertyValue('--accent').trim() || '#947c6c';
    context.fill();

    if (paused || ended) {
      context.fillStyle = 'rgba(0, 0, 0, 0.58)';
      context.fillRect(0, 0, WIDTH, HEIGHT);
      context.fillStyle = '#ffffff';
      context.font = '700 30px Georgia, serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(paused ? 'Pausado' : (lives ? 'Você venceu!' : 'Fim de jogo'), WIDTH / 2, HEIGHT / 2);
    }
  }

  function movePaddle(amount) {
    paddleX = Math.max(0, Math.min(WIDTH - PADDLE_WIDTH, paddleX + amount));
  }

  function update(delta) {
    const movingLeft = keys.has('ArrowLeft') || keys.has('KeyA') || keys.has('left');
    const movingRight = keys.has('ArrowRight') || keys.has('KeyD') || keys.has('right');
    if (movingLeft !== movingRight) movePaddle((movingLeft ? -1 : 1) * 7 * delta);

    ball.x += ball.vx * delta;
    ball.y += ball.vy * delta;

    if (ball.x - BALL_RADIUS < 0) { ball.x = BALL_RADIUS; ball.vx = Math.abs(ball.vx); }
    if (ball.x + BALL_RADIUS > WIDTH) { ball.x = WIDTH - BALL_RADIUS; ball.vx = -Math.abs(ball.vx); }
    if (ball.y - BALL_RADIUS < 0) { ball.y = BALL_RADIUS; ball.vy = Math.abs(ball.vy); }

    if (ball.vy > 0 && ball.y + BALL_RADIUS >= PADDLE_Y && ball.y - BALL_RADIUS <= PADDLE_Y + PADDLE_HEIGHT &&
      ball.x + BALL_RADIUS >= paddleX && ball.x - BALL_RADIUS <= paddleX + PADDLE_WIDTH) {
      const impact = (ball.x - (paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
      ball.vx = impact * 5.2;
      ball.vy = -Math.sqrt(5.2 * 5.2 - ball.vx * ball.vx);
      ball.y = PADDLE_Y - BALL_RADIUS;
    }

    for (const brick of bricks) {
      if (!brick.alive) continue;
      const nearestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
      const nearestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));
      const dx = ball.x - nearestX;
      const dy = ball.y - nearestY;
      if (dx * dx + dy * dy > BALL_RADIUS * BALL_RADIUS) continue;

      brick.alive = false;
      score += 10;
      updateHud();
      if (Math.abs(dx) > Math.abs(dy)) ball.vx *= -1;
      else ball.vy *= -1;
      break;
    }

    if (bricks.every(brick => !brick.alive)) {
      ended = true;
      setStatus('Você venceu! Todos os blocos foram destruídos.');
      return;
    }

    if (ball.y - BALL_RADIUS > HEIGHT) {
      lives -= 1;
      updateHud();
      if (lives === 0) {
        ended = true;
        setStatus('Fim de jogo. Reinicie para tentar novamente.');
      } else {
        resetBall();
        setStatus('Você perdeu uma vida. Continue!');
      }
    }
  }

  function loop(timestamp) {
    if (!container) return;
    const delta = lastFrame ? Math.min((timestamp - lastFrame) / 16.67, 2.5) : 1;
    lastFrame = timestamp;
    if (!paused && !ended) update(delta);
    draw();
    frameId = requestAnimationFrame(loop);
  }

  function handlePointerMove(event) {
    if (event.target !== canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * WIDTH / bounds.width;
    paddleX = Math.max(0, Math.min(WIDTH - PADDLE_WIDTH, x - PADDLE_WIDTH / 2));
  }

  function handleClick(event) {
    if (event.target.closest('.breakout-pause')) {
      if (ended) return;
      paused = !paused;
      pauseButton.textContent = paused ? 'Continuar' : 'Pausar';
      setStatus(paused ? 'Partida pausada.' : 'Partida em andamento.');
    } else if (event.target.closest('.breakout-restart')) {
      reset();
    }
  }

  function handleKeyDown(event) {
    if (!container.contains(document.activeElement)) return;
    if (event.code === 'Space' && event.target.closest('button')) return;
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight' || event.code === 'Space') event.preventDefault();
    keys.add(event.code);
    if (event.code === 'Space' && !event.repeat && !ended) {
      paused = !paused;
      pauseButton.textContent = paused ? 'Continuar' : 'Pausar';
      setStatus(paused ? 'Partida pausada.' : 'Partida em andamento.');
    }
  }

  function handlePointerDown(event) {
    if (event.target === canvas) canvas.focus({ preventScroll: true });
    const direction = event.target.closest('[data-direction]')?.dataset.direction;
    if (direction) {
      movePaddle(direction === 'left' ? -40 : 40);
      keys.add(direction);
    }
  }

  function handleKeyUp(event) {
    keys.delete(event.code);
  }

  function clearKeys() {
    keys.clear();
  }

  function mount(el) {
    container = el;
    container.innerHTML =
      '<section class="breakout-game">' +
        '<header class="breakout-heading"><h3>Breakout</h3>' +
          '<div class="breakout-stats" aria-label="Placar"><span>Pontos: <strong data-score>0</strong></span><span>Vidas: <strong data-lives>3</strong></span></div>' +
        '</header>' +
        '<canvas class="breakout-canvas" width="800" height="500" tabindex="0" aria-label="Breakout: use as setas ou mova o mouse para controlar a plataforma"></canvas>' +
        '<p class="breakout-status" role="status" aria-live="polite"></p>' +
        '<div class="breakout-controls">' +
          '<button class="game-action-btn" type="button" data-direction="left" aria-label="Mover plataforma para a esquerda">←</button>' +
          '<button class="game-action-btn" type="button" data-direction="right" aria-label="Mover plataforma para a direita">→</button>' +
          '<button class="game-action-btn breakout-pause" type="button">Pausar</button>' +
          '<button class="game-action-btn breakout-restart" type="button">Reiniciar</button>' +
        '</div>' +
      '</section>';

    canvas = container.querySelector('.breakout-canvas');
    context = canvas.getContext('2d');
    scoreLabel = container.querySelector('[data-score]');
    livesLabel = container.querySelector('[data-lives]');
    statusLabel = container.querySelector('.breakout-status');
    pauseButton = container.querySelector('.breakout-pause');
    reset();
    canvas.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('click', handleClick);
    container.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('pointerup', clearKeys);
    document.addEventListener('pointercancel', clearKeys);
    window.addEventListener('blur', clearKeys);
    frameId = requestAnimationFrame(loop);
  }

  function unmount() {
    cancelAnimationFrame(frameId);
    canvas?.removeEventListener('pointermove', handlePointerMove);
    container?.removeEventListener('click', handleClick);
    container?.removeEventListener('pointerdown', handlePointerDown);
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    document.removeEventListener('pointerup', clearKeys);
    document.removeEventListener('pointercancel', clearKeys);
    window.removeEventListener('blur', clearKeys);
    if (container) container.innerHTML = '';
    container = null;
    canvas = null;
    context = null;
    bricks = [];
    keys.clear();
  }

  return { mount, unmount };
})();
