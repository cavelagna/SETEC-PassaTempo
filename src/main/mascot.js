'use strict';
/* ═══════════════════
   PenguinMascot — mascote do PassaTempo
   Pinguim de cachecol com falas contextuais por categoria.
   Comunica-se com o orquestrador via eventos globais:
     - 'passatempo:home'           (já emitido pelo script.js)
     - 'passatempo:game'   detail: { id, title }
     - 'passatempo:gameresult' detail: { result: 'win'|'loss'|'draw' }
   Sem dependências externas. Respeita prefers-reduced-motion.
   ═══════════════════ */

// ── Catálogo de falas (mascotMessages) ─────────────────────
const MASCOT_MESSAGES = {
  home: [
    'Oi! Que tal dar uma pausa e jogar alguma coisa?',
    'Bem-vindo ao PassaTempo! Hoje é um ótimo dia para exercitar a mente.',
    'Psst... já escolheu seu próximo desafio?',
    'Tem um montão de jogos esperando por você!',
    'Pode ficar à vontade. Aqui, o tempo passa brincando.',
    'Estou pronto para jogar. E você?',
    'Vamos encontrar um jogo que combine com seu momento?',
    'Entre um desafio e outro, não se esqueça de respirar!',
  ],
  enterGame: [
    'Opa! Vamos nessa?',
    'Preparando as patinhas para o desafio!',
    'Concentração ativada. Boa sorte!',
    'Hora de testar seus poderes!',
    'Vamos ver como você se sai!',
    'Pronto? Então, que comece a diversão!',
    'Esse parece interessante. Vamos jogar!',
  ],
  playing: [
    'Hmm... essa merece um pouco de reflexão.',
    'Calma, pense com carinho!',
    'Você consegue. Um movimento de cada vez.',
    'Boa jogada!',
    'Está ficando interessante!',
    'Não tenha pressa. O importante é se divertir.',
    'Quer tentar uma estratégia diferente?',
    'Estou torcendo por você!',
  ],
  minesweeper: [
    'Cuidado com os próximos passos!',
    'Os números estão tentando contar um segredo.',
    'Pense bem antes de revelar outra casa.',
    'Ufa! Essa foi por pouco!',
    'Cada número é uma pista. Vamos investigar!',
  ],
  sudoku: [
    'Cada número tem seu lugar!',
    'Paciência e lógica: essa é a combinação.',
    'Vamos encontrar o número que está faltando?',
    'Olhe para a linha, a coluna e o bloco!',
    'Um bom raciocínio vale mais que um chute.',
  ],
  two048: [
    'Dois números iguais podem virar algo maior!',
    'Planeje os próximos movimentos.',
    'Vamos chegar ao 2048?',
    'Essa combinação foi boa!',
    'Pense alguns movimentos à frente!',
  ],
  victory: [
    'Aí sim! Mandou muito bem!',
    'Sabia que você conseguia!',
    'Vitória merecida. Hora de comemorar!',
    'Que jogada incrível!',
  ],
  defeat: [
    'Faz parte! Toda tentativa ensina alguma coisa.',
    'Quase lá! Que tal tentar novamente?',
    'Não desanime. O próximo desafio está esperando.',
    'Até os pinguins escorregam de vez em quando!',
  ],
  exitGame: [
    'Voltando para escolher outra aventura?',
    'Foi divertido! Qual será o próximo?',
    'Até a próxima rodada!',
    'Vou ficar por aqui, cuidando dos jogos.',
  ],
  idle: [
    'Ainda aí? O tabuleiro não foge.',
    'Sem pressa: o PassaTempo espera por você.',
    'Uma dica: às vezes o melhor lance é respirar fundo.',
  ],
  click: [
    'Precisa de uma dica? Escolha um jogo e divirta-se!',
    'Estou aqui! Quando quiser, é só jogar.',
    'Brrr... que frio! Mas jogar aquece o coração.',
    'Meu cachecol é da cor do PassaTempo. Combina, né?',
  ],
};

// ── Estado ──────────────────────────────────────────────────
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mascotState = {
  currentGame: null,
  lastCategory: null,
  lastMessage: '',
  bubbleTimer: null,
  blinkTimer: null,
  idleTimer: null,
  ambientTimer: null,
  minimized: false,
};

// ── Referências DOM ─────────────────────────────────────────
const mascotRoot = document.getElementById('mascot');
const mascotBtn = document.getElementById('mascot-btn');
const mascotBubble = document.getElementById('mascot-bubble');
const mascotBubbleText = document.getElementById('mascot-bubble-text');
const mascotMinimize = document.getElementById('mascot-minimize');

// ── Seleção de fala ─────────────────────────────────────────
function pickMessage(category) {
  const pool = MASCOT_MESSAGES[category];
  if (!pool) return null;
  if (pool.length === 1) return pool[0];
  // Evita repetir imediatamente a última fala
  let msg = pool[Math.floor(Math.random() * pool.length)];
  let guard = 0;
  while (msg === mascotState.lastMessage && guard++ < 6) {
    msg = pool[Math.floor(Math.random() * pool.length)];
  }
  mascotState.lastMessage = msg;
  return msg;
}

// ── Balão de fala ───────────────────────────────────────────
function showBubble(category, { duration = 4600, mood = null } = {}) {
  if (!mascotBubble || mascotState.minimized) return;
  const text = pickMessage(category);
  if (!text) return;

  mascotBubbleText.textContent = text;
  mascotBubble.hidden = false;
  requestAnimationFrame(() => mascotBubble.classList.add('is-visible'));

  // Reações corporais associadas ao humor
  if (!reducedMotion.matches) {
    mascotBtn.classList.remove('is-happy', 'is-sad', 'is-talking');
    if (mood === 'happy') mascotBtn.classList.add('is-happy');
    else if (mood === 'sad') mascotBtn.classList.add('is-sad');
    else mascotBtn.classList.add('is-talking');
  }

  if (mascotState.bubbleTimer) window.clearTimeout(mascotState.bubbleTimer);
  mascotState.bubbleTimer = window.setTimeout(hideBubble, duration);
}

function hideBubble() {
  if (!mascotBubble) return;
  mascotBubble.classList.remove('is-visible');
  mascotBtn?.classList.remove('is-happy', 'is-sad', 'is-talking');
  mascotState.bubbleTimer = window.setTimeout(() => {
    mascotBubble.hidden = true;
    mascotState.bubbleTimer = null;
  }, 220);
}

// ── Categoria efetiva (fala específica por jogo ou geral) ──
function playingCategory() {
  const game = mascotState.currentGame;
  if (game && MASCOT_MESSAGES[game]) return game;
  return 'playing';
}

// ── Ambientação: falas ocasionais durante o jogo ───────────
function scheduleAmbient() {
  if (mascotState.ambientTimer) window.clearTimeout(mascotState.ambientTimer);
  if (!mascotState.currentGame || mascotState.minimized) return;
  mascotState.ambientTimer = window.setTimeout(() => {
    if (!document.hidden && mascotState.currentGame && Math.random() < 0.55) {
      showBubble(playingCategory(), { duration: 4200 });
    }
    scheduleAmbient();
  }, 28000 + Math.random() * 26000);
}

function scheduleIdle() {
  if (mascotState.idleTimer) window.clearTimeout(mascotState.idleTimer);
  if (mascotState.currentGame) return;
  mascotState.idleTimer = window.setTimeout(() => {
    if (!document.hidden && !mascotState.minimized) showBubble('idle', { duration: 4200 });
    scheduleIdle();
  }, 65000 + Math.random() * 40000);
}

// ── Piscar dos olhos ───────────────────────────────────────
function scheduleBlink() {
  if (mascotState.blinkTimer) window.clearTimeout(mascotState.blinkTimer);
  mascotState.blinkTimer = window.setTimeout(() => {
    mascotRoot?.classList.add('is-blinking');
    window.setTimeout(() => mascotRoot?.classList.remove('is-blinking'), 160);
    scheduleBlink();
  }, 2600 + Math.random() * 4200);
}

// ── Integração com a navegação do PassaTempo ───────────────
window.addEventListener('passatempo:home', () => {
  mascotState.currentGame = null;
  if (mascotState.ambientTimer) window.clearTimeout(mascotState.ambientTimer);
  scheduleIdle();
  // Boas-vindas: sorteia apenas quando a categoria muda (não a cada render)
  if (mascotState.lastCategory !== 'home') {
    mascotState.lastCategory = 'home';
    window.setTimeout(() => showBubble('home', { duration: 5200 }), 700);
  }
});

window.addEventListener('passatempo:game', event => {
  const { id } = event.detail || {};
  mascotState.currentGame = id || null;
  mascotState.lastCategory = null;
  if (mascotState.idleTimer) window.clearTimeout(mascotState.idleTimer);
  scheduleAmbient();
  showBubble('enterGame', { duration: 4400 });
});

window.addEventListener('passatempo:gameresult', event => {
  const result = event.detail?.result;
  if (result === 'win') {
    mascotBtn?.classList.add('is-jumping');
    window.setTimeout(() => mascotBtn?.classList.remove('is-jumping'), 1100);
    showBubble('victory', { duration: 4800, mood: 'happy' });
  } else if (result === 'loss') {
    showBubble('defeat', { duration: 4800, mood: 'sad' });
  } else if (result === 'draw') {
    showBubble('playing', { duration: 4200 });
  }
});

// ── Interação direta ───────────────────────────────────────
mascotBtn.addEventListener('click', () => {
  const category = mascotState.currentGame ? playingCategory() : 'click';
  showBubble(category, { duration: 5200 });
});

mascotMinimize.addEventListener('click', () => {
  mascotState.minimized = !mascotState.minimized;
  mascotRoot.classList.toggle('is-minimized', mascotState.minimized);
  mascotMinimize.textContent = mascotState.minimized ? '+' : '−';
  mascotMinimize.setAttribute('aria-label', mascotState.minimized ? 'Mostrar mascote' : 'Ocultar mascote');
  mascotMinimize.setAttribute('aria-expanded', String(!mascotState.minimized));
  if (mascotState.minimized) {
    if (mascotState.bubbleTimer) window.clearTimeout(mascotState.bubbleTimer);
    mascotBubble.hidden = true;
    mascotBubble.classList.remove('is-visible');
  } else {
    showBubble('click', { duration: 4200 });
  }
});

// ── Limpeza geral ───────────────────────────────────────────
window.addEventListener('pagehide', () => {
  ['bubbleTimer', 'blinkTimer', 'idleTimer', 'ambientTimer'].forEach(k => {
    if (mascotState[k]) window.clearTimeout(mascotState[k]);
  });
});

// ── Início ──────────────────────────────────────────────────
scheduleBlink();
scheduleIdle();
window.setTimeout(() => showBubble('home', { duration: 5200 }), 900);
