'use strict';
/* ═══════════════════
   PassaTempo FX — partículas ambiente + confete de vitória
   Um único <canvas> fixo atrás do conteúdo:
   - "Ambient": bolinhas suaves caindo devagar (fundo vivo)
   - "Burst": explosão de confete de aniversário ao vencer
     (escuta 'passatempo:gameresult' com detail.result === 'win')
   Sem dependências. Respeita prefers-reduced-motion (tudo desligado).
   ═══════════════════ */

const PassaTempoFX = (() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let canvas, ctx, dpr = 1;
  let ambient = [];          // bolinhas caindo
  let confetti = [];         // confete de vitória
  let rafId = null;
  let running = false;

  // Paleta da identidade: marrom, caramelo, creme, areia + toques de festa
  const AMBIENT_COLORS = [
    'rgba(196, 168, 130, 0.35)',
    'rgba(148, 124, 108, 0.28)',
    'rgba(180, 163, 143, 0.30)',
    'rgba(128, 112, 96, 0.22)',
  ];
  const CONFETTI_COLORS = [
    '#C4A882', '#E8A24A', '#F5C842', '#F7F4EC',
    '#B4A38F', '#E86A5A', '#7BA05B', '#5B8FC4',
  ];

  function setup() {
    if (canvas || reduced.matches) return;
    canvas = document.createElement('canvas');
    canvas.className = 'fx-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    spawnAmbient();
    start();
  }

  function resize() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
  }

  // ── Bolinhas ambiente caindo ────────────────────────────
  function spawnAmbient() {
    const count = Math.min(26, Math.round(window.innerWidth / 55));
    ambient = Array.from({ length: count }, () => newDot(true));
  }

  function newDot(anywhere) {
    const r = 1.5 + Math.random() * 3.5;
    return {
      x: Math.random() * window.innerWidth,
      y: anywhere ? Math.random() * window.innerHeight : -10,
      r,
      vy: 0.15 + Math.random() * 0.45,
      vx: (Math.random() - 0.5) * 0.15,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.004 + Math.random() * 0.01,
      color: AMBIENT_COLORS[Math.floor(Math.random() * AMBIENT_COLORS.length)],
    };
  }

  function updateAmbient() {
    for (let i = 0; i < ambient.length; i++) {
      const d = ambient[i];
      d.sway += d.swaySpeed;
      d.x += d.vx + Math.sin(d.sway) * 0.2;
      d.y += d.vy;
      if (d.y > window.innerHeight + 12) ambient[i] = newDot(false);
    }
  }

  function drawAmbient() {
    for (const d of ambient) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.color;
      ctx.fill();
    }
  }

  // ── Confete de aniversário (vitória) ────────────────────
  function burst() {
    if (reduced.matches || !canvas) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    // Duas "canhões" nos cantos inferiores + chuva do topo
    const sources = [
      { x: W * 0.12, y: H * 0.75, angle: -Math.PI / 3 },
      { x: W * 0.88, y: H * 0.75, angle: -Math.PI + Math.PI / 3 },
    ];
    for (const s of sources) {
      for (let i = 0; i < 55; i++) confetti.push(makeConfetti(s.x, s.y, s.angle, true));
    }
    for (let i = 0; i < 40; i++) confetti.push(makeConfetti(Math.random() * W, -12, Math.PI / 2, false));
    start();
  }

  function makeConfetti(x, y, angle, cannon) {
    const speed = cannon ? 5 + Math.random() * 7 : 1 + Math.random() * 2;
    const spread = cannon ? (Math.random() - 0.5) * 0.9 : (Math.random() - 0.5) * 0.4;
    const shapes = ['rect', 'circle', 'strip'];
    return {
      x, y,
      vx: Math.cos(angle + spread) * speed,
      vy: Math.sin(angle + spread) * speed,
      w: 5 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      rotation: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.25,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      life: 0,
      maxLife: 200 + Math.random() * 120,
      wobble: Math.random() * Math.PI * 2,
    };
  }

  function updateConfetti() {
    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i];
      c.life++;
      c.wobble += 0.12;
      c.vy += 0.11;                    // gravidade
      c.vx *= 0.992;                   // arrasto do ar
      c.x += c.vx + Math.sin(c.wobble) * 0.6;
      c.y += c.vy;
      c.rotation += c.vr;
      if (c.life > c.maxLife || c.y > window.innerHeight + 20) confetti.splice(i, 1);
    }
  }

  function drawConfetti() {
    for (const c of confetti) {
      const alpha = c.life > c.maxLife * 0.75
        ? Math.max(0, 1 - (c.life - c.maxLife * 0.75) / (c.maxLife * 0.25))
        : 1;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rotation);
      ctx.fillStyle = c.color;
      if (c.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, c.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.shape === 'strip') {
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h * 1.8);
      } else {
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      }
      ctx.restore();
    }
  }

  // ── Loop ────────────────────────────────────────────────
  function frame() {
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    updateAmbient();
    drawAmbient();
    if (confetti.length) {
      updateConfetti();
      drawConfetti();
    }
    // Pausa quando nada para além do ambiente está ativo? Mantemos leve: sempre roda.
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduced.matches) return;
    running = true;
    rafId = requestAnimationFrame(frame);
  }

  // ── Eventos ─────────────────────────────────────────────
  window.addEventListener('passatempo:gameresult', e => {
    if (e.detail?.result === 'win') burst();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) cancelAnimationFrame(rafId);
      running = false;
    } else {
      start();
    }
  });
  window.addEventListener('pagehide', () => {
    if (rafId) cancelAnimationFrame(rafId);
    running = false;
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }

  return { burst };
})();
