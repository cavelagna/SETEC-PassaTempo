'use strict';

// ── Registro de jogos ─────────────────────────────────────
// Cada entrada mapeia um ID para o módulo e o título exibido.
const GAMES = {
  quickcalc:    { module: QuickCalc,   title: 'Cálculo Rápido' },
  timestable:   { module: TimesTable,  title: 'Tabuada'       },
  numberchallenge: { module: NumberChallenge, title: 'Desafio Numérico' },
  crossword:   { module: Crossword,   title: 'Palavras Cruzadas' },
  wordsearch:  { module: WordSearch,  title: 'Caça-Palavras' },
  hangman:     { module: Hangman,     title: 'Forca' },
  minesweeper: { module: Minesweeper, title: 'Campo Minado' },
  sudoku:      { module: Sudoku,      title: 'Sudoku'       },
  memory:      { module: Memory,      title: 'Jogo da Memória' },
  tictactoe:   { module: TicTacToe,  title: 'Jogo da Velha' },
  snake:       { module: Snake,       title: 'Snake'         },
  two048:      { module: TwoThousandFortyEight, title: '2048' },
  blockpuzzle: { module: BlockPuzzle, title: 'Tetris' },
  solitaire:   { module: Solitaire,  title: 'Paciência' },
  breakout:    { module: Breakout,    title: 'Breakout' },
  chess:       { module: Chess,      title: 'Xadrez' },
  checkers:    { module: Checkers,   title: 'Damas' },
  quiz:        { module: Quiz,        title: 'Quiz' },
  simon:       { module: Simon,        title: 'Simon' },
  visualseq:   { module: VisualSequence, title: 'Sequência Visual' },
};

// Instruções curtas, separadas por jogo. O registro é local ao navegador e
// guarda apenas quais telas já foram vistas.
const GAME_RULES = {
  quickcalc: ['Resolva a conta e digite a resposta.', 'Cada acerto soma pontos. Erros também avançam a rodada.', 'Você tem 90 segundos para fazer o máximo possível.'],
  timestable: ['Escolha a tabuada e responda às perguntas.', 'Digite o resultado ou selecione uma resposta.', 'Respostas corretas aumentam sua pontuação.'],
  numberchallenge: ['Use os quatro números uma única vez.', 'Monte a expressão e alcance o objetivo.', 'Você tem 10 desafios; cada solução soma pontos.'],
  crossword: ['Leia a pista e escolha a palavra correspondente.', 'Preencha as casas em sequência horizontal ou vertical.', 'Palavras corretas ficam fixadas na grade.'],
  wordsearch: ['Procure as palavras listadas na grade.', 'A busca pode seguir em qualquer direção.', 'Marque uma palavra por vez;elas disappearão da lista.'],
  hangman: ['Escolha uma letra para tentar completar a palavra.', 'Letras corretas revelam posições; letras erradas gastam uma tentativa.', 'Complete a palavra antes que as tentativas acabem.'],
  minesweeper: ['Revele células sem descobrir uma mina.', 'Os números indicam quantas minas cercam cada célula.', 'Marque as minas com o botão direito.'],
  sudoku: ['Preencha a grade com números de 1 a 9.', 'Cada linha, coluna e bloco deve ter todos os números uma vez.', 'A dificuldade aumenta conforme você avança.'],
  memory: ['Vire duas cartas por vez.', 'Encontre pares de imagens iguais para mantê-los descobertos.', 'Termine o tabuleiro com o menor número de tentativas.'],
  tictactoe: ['Escolha uma casa vazia em cada rodada.', 'Forme uma linha horizontal, vertical ou diagonal antes do adversário.', 'Cada jogador alterna uma jogada por vez.'],
  snake: ['Clique em Iniciar e dirija a cobra.', 'Use as setas ou os controles na tela para mudar de direção.', 'Coma a comida e evite as bordas e o próprio corpo.'],
  two048: ['Deslize o tabuleiro para cima, baixo ou para os lados.', 'Combine dois números iguais para criar o dobro.', 'Alcance a peça 2048 sem ficar sem jogadas.'],
  solitaire: ['Mova cartas entre a reserva, o descarte e as fundações.', 'Organize cada coluna em ordem decrescente e alternada.', 'Complete as quatro fundações, do Ás ao Rei.'],
  chess: ['Clique na peça branca e depois na casa de destino (as casas legais aparecem destacadas).', 'O caminho inteiro que a peça pode percorrer é realceado; a casa com anel vermelho é onde a peça adversária é capturada.', 'Peões andam uma casa para frente e comem na diagonal. Cavalo anda em L. Bispo anda na diagonal. Torre anda em linha. Dama nas duas. Rei em qualquer direção.', 'A peça nunca atravessa outra peça e nunca anda para trás.', 'Promoção, castling (troca de rei e torre) e en passant também valem. Use Desfazer para corrigir um lance.'],
  checkers: ['As peças claras começam e se movem na diagonal para frente, uma casa por vez.', 'Clique na peça e depois na casa destacada. As casas com anel vermelho são capturas.', 'A captura é obrigatória: se houver captura possível, escolha uma peça marcada e salte sobre a adversária para a casa vazia depois dela.', 'É possível capturar várias peças no mesmo lance, sempre com a mesma peça; continue até não haver outro salto.', 'Ao chegar na fileira do adversário, sua peça é promovida a dama e passa a andar para trás.'],
  blockpuzzle: ['As peças caem automaticamente do alto da grade.', 'Use as setas ← e → para mover e ↓ para descer mais rápido.', 'Gire com ↑ ou com a tecla R para encaixar melhor a peça; use C para guardar uma peça.', 'Pressione Espaço ou o botão Pausar para interromper a partida.', 'Complete linhas inteiras para somar pontos; ao completar quatro de uma vez, você ganha bônus.', 'A partida acaba quando uma peça nova não couber na grade.'],
  breakout: ['Mova a plataforma para rebater a bola e destruir todos os blocos.', 'Use as setas, A e D, o mouse ou os controles na tela para mover a plataforma.', 'A bola que cair pela parte inferior custa uma vida; a partida termina ao perder as três vidas.', 'Use Espaço ou Pausar para interromper a partida; Reiniciar começa uma nova rodada.'],
  quiz: ['Escolha o nível: Fácil (15 perguntas), Médio (25) ou Difícil (35).', 'As perguntas são sorteadas e a ordem das alternativas muda a cada partida.', 'Leia a pergunta e clique em uma alternativa antes que o tempo termine.', 'Cada acerto soma pontos; resposta errada ou tempo esgotado contam como erro.'],
  simon: ['Clique em “Iniciar jogo” para a sequência começar.', 'Observe e ouça os quatro painéis acendendo em ordem, cada um com seu próprio tom musical.', 'Repita a sequência usando o mouse, o toque ou as teclas 1, 2, 3 e 4.', 'Acompanhe a barra de progresso: a cada rodada a sequência cresce e o ritmo acelera um pouco.', 'Um único erro encerra a rodada; o recorde fica salvo no navegador.'],
  visualseq: ['Clique em “Iniciar jogo” para começar.', 'Observe as figuras aparecendo em sequência e memorize a ordem.', 'Depois da demonstração as figuras se escondem e o cronômetro começa: você tem 5 segundos para responder na primeira fase, e mais 1 segundo a cada fase seguinte.', 'Não há espera: você pode pensar e clicar ao mesmo tempo, dentro do tempo mostrado na barra.', 'Se o cronômetro zerar antes de você completar a ordem, você perde uma vida.', 'Toque nas figuras embaralhadas seguindo exatamente a ordem vista.', 'Cada rodada acrescenta uma figura nova à sequência anterior, formando fases cada vez maiores.', 'Você tem 3 vidas; um erro custa uma vida e a sequência é mostrada de novo.', 'Quando as vidas acabarem, clique em “Iniciar jogo” para recomeçar.'],
};

// ── Referências DOM ───────────────────────────────────────
const viewHome     = document.getElementById('view-home');
const viewGame     = document.getElementById('view-game');
const gameArea     = document.getElementById('game-area');
const gameTitle    = document.getElementById('game-running-title');
const backBtn      = document.getElementById('back-btn');
const searchInput  = document.getElementById('game-search');
const searchEmpty  = document.getElementById('search-empty');
const menuToggle   = document.getElementById('menu-toggle');
const categoryMenu = document.getElementById('category-menu');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const drawerClose   = document.getElementById('drawer-close');
const htmlEl       = document.documentElement;
const topbarBrand   = document.querySelector('.topbar-brand');
const notificationButton = document.getElementById('btn-notifications');
const accessibilityTip = document.getElementById('a11y-tip');
const accessibilityTipClose = document.getElementById('a11y-tip-close');
const instructionsButton = document.getElementById('game-instructions-btn');
const rulesDialog = document.getElementById('game-rules-dialog');
const rulesTitle = document.getElementById('game-rules-title');
const rulesSummary = document.getElementById('game-rules-summary');
const rulesList = document.getElementById('game-rules-list');
const rulesClose = document.getElementById('game-rules-close');
const RULES_STORAGE_KEY = 'pt-game-rules-seen';
const reduced_motion_media = window.matchMedia('(prefers-reduced-motion: reduce)');
let seenGameRules = new Set();

try {
  const saved = JSON.parse(localStorage.getItem(RULES_STORAGE_KEY) || '[]');
  if (Array.isArray(saved)) seenGameRules = new Set(saved.filter(id => Object.hasOwn(GAME_RULES, id)));
} catch (_) {}

let currentGame = null;
const OVERLAY_GAMES = new Set(['two048', 'crossword', 'wordsearch', 'quiz', 'solitaire']);

// ── Camada de transição ao entrar/sair dos jogos ────────────
// Uma única camada fixa sobre a aplicação: desfoca o conteúdo ao fundo,
// mostra spinner + mensagem curta e é encerrada logo após a navegação.
const transitionLayer = document.getElementById('game-transition');
const transitionMessage = document.getElementById('game-transition-message');
const TRANSITION_DURATION = 620;   // deve casar com a duração das animações no CSS
const TRANSITION_EXIT_MS  = 420;   // fade-out da camada após a troca de view
let transitionTimer = null;
let isTransitioning = false;

function runTransition(message, onMid) {
  if (isTransitioning) return;               // evita cliques repetidos
  isTransitioning = true;
  transitionMessage.textContent = message;
  transitionLayer.classList.add('is-active');
  transitionLayer.setAttribute('aria-hidden', 'false');

  transitionTimer = window.setTimeout(() => {
    onMid();                                 // troca a view com a tela coberta
    transitionLayer.classList.remove('is-active');
    transitionLayer.classList.add('is-leaving');
    transitionTimer = window.setTimeout(() => {
      transitionLayer.classList.remove('is-leaving');
      transitionLayer.setAttribute('aria-hidden', 'true');
      transitionMessage.textContent = '';
      isTransitioning = false;
      transitionTimer = null;
    }, TRANSITION_EXIT_MS);
  }, TRANSITION_DURATION);
}

function cancelTransition() {
  if (transitionTimer) { window.clearTimeout(transitionTimer); transitionTimer = null; }
  transitionLayer.classList.remove('is-active', 'is-leaving');
  transitionLayer.setAttribute('aria-hidden', 'true');
  transitionMessage.textContent = '';
  isTransitioning = false;
}

window.addEventListener('pagehide', cancelTransition);

let notificationsEnabled = true;
try { notificationsEnabled = localStorage.getItem('pt-a11y-notifications') !== 'false'; } catch (_) {}

function updateNotificationButton() {
  notificationButton.setAttribute('aria-pressed', String(notificationsEnabled));
  notificationButton.setAttribute('aria-label', notificationsEnabled ? 'Desativar avisos de acessibilidade' : 'Ativar avisos de acessibilidade');
  notificationButton.classList.toggle('is-muted', !notificationsEnabled);
}

function showAccessibilityTip() {
  if (!notificationsEnabled || !accessibilityTip) return;
  accessibilityTip.hidden = false;
  accessibilityTip.classList.remove('is-visible');
  requestAnimationFrame(() => accessibilityTip.classList.add('is-visible'));
}

function closeAccessibilityTip() {
  if (!accessibilityTip) return;
  accessibilityTip.classList.remove('is-visible');
  window.setTimeout(() => { accessibilityTip.hidden = true; }, 180);
}

notificationButton.addEventListener('click', () => {
  notificationsEnabled = !notificationsEnabled;
  try { localStorage.setItem('pt-a11y-notifications', String(notificationsEnabled)); } catch (_) {}
  updateNotificationButton();
  if (!notificationsEnabled) closeAccessibilityTip();
  else showAccessibilityTip();
});
accessibilityTipClose.addEventListener('click', closeAccessibilityTip);
updateNotificationButton();
showAccessibilityTip();
window.setInterval(showAccessibilityTip, 5 * 60 * 1000);

function showGameResult(result) {
  if (!gameArea || !OVERLAY_GAMES.has(currentGame) || gameArea.querySelector('.game-result-overlay')) return;
  const won = result === 'win';
  const draw = result === 'draw';
  const overlay = document.createElement('div');
  overlay.className = `game-result-overlay ${won ? 'is-win' : draw ? 'is-draw' : 'is-loss'}`;
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'assertive');
  overlay.innerHTML = `<strong>${won ? 'Você venceu!' : draw ? 'Empate!' : 'Você perdeu.'}</strong>`;
  gameArea.appendChild(overlay);
}

window.addEventListener('passatempo:result', event => {
  showGameResult(event.detail?.result);
  window.dispatchEvent(new CustomEvent('passatempo:gameresult', { detail: { result: event.detail?.result } }));
});

function clearGameResult() {
  gameArea?.querySelector('.game-result-overlay')?.remove();
}

const resultObserver = new MutationObserver(mutations => {
  if (!viewGame || viewGame.hidden || !currentGame || !OVERLAY_GAMES.has(currentGame)) return;
  const text = mutations.map(mutation => mutation.target.textContent || '').join(' ');
  if (/você venceu|parabéns|venceu!/i.test(text)) showGameResult('win');
  if (/empate/i.test(text)) showGameResult('draw');
  if (/você perdeu|fim de jogo/i.test(text)) showGameResult('loss');
});
resultObserver.observe(gameArea, { childList: true, subtree: true, characterData: true });

gameArea.addEventListener('click', event => {
  if (event.target.closest('.two048-restart, .crossword-restart, .word-search-restart, .quiz-again, .sol-new')) clearGameResult();
});

window.addEventListener('passatempo:home', showHome);

topbarBrand.addEventListener('click', event => {
  event.preventDefault();
  showHome();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─────────────────────────────────────────────────────────
// NAVEGAÇÃO ENTRE VIEWS
// ─────────────────────────────────────────────────────────

function showHome() {
  // Saída de um jogo: mantém o jogo visível ao fundo durante a transição.
  if (currentGame) {
    runTransition('Carregando...', () => {
      GAMES[currentGame].module.unmount();
      currentGame = null;
      viewGame.hidden = true;
      viewHome.hidden = false;
      document.title = 'PassaTempo';
    });
    return;
  }
  viewGame.hidden = true;
  viewHome.hidden = false;
  document.title = 'PassaTempo';
}

function showGame(id) {
  const entry = GAMES[id];
  if (!entry) return;

  // Abertura síncrona e instantânea: usa uma duração visual curta e controlada.
  runTransition('Carregando...', () => {
    // Desmonta o jogo anterior, se houver
    if (currentGame && GAMES[currentGame]) {
      GAMES[currentGame].module.unmount();
    }

    currentGame = id;
    viewHome.hidden = true;
    viewGame.hidden = false;

    gameTitle.textContent = entry.title;
    document.title = `${entry.title} — PassaTempo`;

    window.dispatchEvent(new CustomEvent('passatempo:game', { detail: { id, title: entry.title } }));

    clearGameResult();
    gameArea.innerHTML = '';
    entry.module.mount(gameArea);

    // Selo "2 Jogadores" para jogos de duas pessoas
    if (TWO_PLAYER_GAMES.has(id) && gameArea) {
      const badge = document.createElement('div');
      badge.className = 'two-player-badge';
      badge.setAttribute('role', 'note');
      badge.setAttribute('aria-label', 'Este jogo é para 2 jogadores');
      badge.innerHTML = '<svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="4.6" cy="5" r="2.1"/><path d="M1.5 12.2c0-2 1.4-3.4 3.1-3.4S7.7 10.2 7.7 12.2"/><circle cx="10.4" cy="5" r="2.1"/><path d="M7.3 12.2c0-2 1.4-3.4 3.1-3.4s3.1 1.4 3.1 3.4"/></svg><span>2 Jogadores</span>';
      gameArea.prepend(badge);
    }

    if (!seenGameRules.has(id)) showGameRules(id);

    requestAnimationFrame(() => {
      viewGame.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (rulesDialog.open) rulesDialog.querySelector('.game-rules-close').focus({ preventScroll: true });
      else gameArea.focus({ preventScroll: true });
    });
  });
}

// Jogos que exigem duas pessoas: exibem o selo "2 Jogadores" dentro da área do jogo
const TWO_PLAYER_GAMES = new Set(['tictactoe', 'checkers', 'chess']);

function showGameRules(id) {
  const entry = GAMES[id];
  const rules = GAME_RULES[id];
  if (!entry || !rules) return;

  rulesTitle.textContent = `Instruções de ${entry.title}`;
  rulesSummary.textContent = `Leia os passos principais antes de começar.`;
  rulesList.replaceChildren(...rules.map(text => {
    const item = document.createElement('li');
    item.textContent = text;
    return item;
  }));
  if (typeof rulesDialog.showModal === 'function') rulesDialog.showModal();
  else rulesDialog.setAttribute('open', '');
  rulesClose.focus();
}

function markGameRulesSeen(id) {
  if (seenGameRules.has(id)) return;
  seenGameRules.add(id);
  try {
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify([...seenGameRules]));
  } catch (_) {}
}

instructionsButton.addEventListener('click', () => {
  if (currentGame) showGameRules(currentGame);
});
rulesClose.addEventListener('click', () => {
  if (currentGame) markGameRulesSeen(currentGame);
  rulesDialog.close();
  gameArea.focus({ preventScroll: true });
});
rulesDialog.addEventListener('cancel', event => {
  event.preventDefault();
  rulesClose.click();
});
rulesDialog.addEventListener('click', event => {
  if (event.target === rulesDialog) rulesClose.click();
});

// ── LOGO INTERATIVA ─ tilt 3D + movimento espontâneo ─────
(function initLogoTilt() {
  const logo = document.querySelector('.site-title-mark');
  if (!logo || reduced_motion_media.matches) return;
  let rafId = null;

  logo.addEventListener('pointermove', e => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const rect = logo.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      logo.style.setProperty('--logo-rx', `${(-py * 10).toFixed(2)}deg`);
      logo.style.setProperty('--logo-ry', `${(px * 12).toFixed(2)}deg`);
      logo.style.setProperty('--logo-s', '1.04');
    });
  });

  logo.addEventListener('pointerleave', () => {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    logo.style.setProperty('--logo-rx', '0deg');
    logo.style.setProperty('--logo-ry', '0deg');
    logo.style.setProperty('--logo-s', '1');
  });

  // Movimento espontâneo ocasional (não conflita com hover: só quando fora dele)
  let isHovering = false;
  logo.addEventListener('pointerenter', () => { isHovering = true; });
  logo.addEventListener('pointerleave', () => { isHovering = false; });
  (function sway() {
    window.setTimeout(() => {
      if (!isHovering && !document.hidden) {
        logo.classList.add('is-swaying');
        window.setTimeout(() => logo.classList.remove('is-swaying'), 1800);
      }
      sway();
    }, 9000 + Math.random() * 9000);
  })();
})();

// ── CARDS ─ tilt sutil baseado no cursor ───────────────
(function initCardTilt() {
  if (reduced_motion_media.matches) return;
  let raf = null;
  document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--card-rx', `${(-py * 3).toFixed(2)}deg`);
        card.style.setProperty('--card-ry', `${(px * 4).toFixed(2)}deg`);
      });
    });
    card.addEventListener('pointerleave', () => {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      card.style.setProperty('--card-rx', '0deg');
      card.style.setProperty('--card-ry', '0deg');
    });
  });
})();

// ── ENTRADA EM SEQUÊNCIA: banner e cards ────────────────
(function initEntrance() {
  const header = document.querySelector('.site-header');
  if (header && !reduced_motion_media.matches) header.classList.add('will-enter');

  const cards = document.querySelectorAll('.game-card');
  if (reduced_motion_media.matches || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = [...cards].indexOf(entry.target);
      entry.target.style.setProperty('--enter-delay', `${Math.min(idx * 25, 160)}ms`);
      entry.target.classList.add('has-entered');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  cards.forEach(card => { card.classList.add('will-enter'); observer.observe(card); });
})();

// ── Rodapé: entrada suave quando visível ────────────────
(function initFooterReveal() {
  const footer = document.querySelector('.site-footer');
  if (!footer || reduced_motion_media.matches || !('IntersectionObserver' in window)) {
    footer?.classList.add('is-visible');
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { footer.classList.add('is-visible'); io.disconnect(); }
    });
  }, { threshold: 0.15 });
  io.observe(footer);
})();

// ── FUNDO DECORATIVO: antigo clube de jogos ────────────────
// Ilustrações SVG de traço fino (xadrez, dados, cartas, dominó,
// quebra-cabeça, sudoku) espalhadas como marcas-d'água.
(function initBackdropDoodles() {
  const STROKE = 'currentColor';
  const svgs = {
    chessKing: `<svg viewBox="0 0 40 64" fill="none" stroke="${STROKE}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4v6M17 7h6M20 10c-4 3-6 6-6 10h12c0-4-2-7-6-10Z"/><path d="M14 20c-3 6-3 14 0 20h12c3-6 3-14 0-20"/><path d="M12 40h16l2 8H10l2-8Z"/><path d="M8 48h24v6H8zM12 54h16l-2 6H14l-2-6Z"/></svg>`,
    chessQueen: `<svg viewBox="0 0 44 64" fill="none" stroke="${STROKE}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="10" r="2.4"/><circle cx="22" cy="6" r="2.4"/><circle cx="36" cy="10" r="2.4"/><path d="M8 12c2 6 10 12 12 8M36 12c-2 6-10 12-12 8"/><path d="M13 24c-2 8-2 14 1 20h16c3-6 3-12 1-20"/><path d="M11 44h22l2 8H9l2-8Z"/><path d="M8 52h28v6H8z"/></svg>`,
    chessKnight: `<svg viewBox="0 0 40 60" fill="none" stroke="${STROKE}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 54c0-14 2-24 8-30-2-4-2-8 2-10l2 4c6 0 12 6 12 16 0 6-2 10-4 20"/><path d="M22 14l-2-6M26 20c2 0 4 2 4 4"/><circle cx="26" cy="22" r="1.2"/><path d="M10 54h22v4H10z"/></svg>`,
    chessPawn: `<svg viewBox="0 0 36 56" fill="none" stroke="${STROKE}" stroke-width="1.6" stroke-linecap="round"><circle cx="18" cy="12" r="6"/><path d="M14 18c-2 6-2 12 1 18h6c3-6 3-12 1-18"/><path d="M10 36h16l2 8H8l2-8Z"/><path d="M8 44h20v6H8zM11 50h14v4H11z"/></svg>`,
    dice5: `<svg viewBox="0 0 48 48" fill="none" stroke="${STROKE}" stroke-width="1.6"><rect x="4" y="4" width="40" height="40" rx="8"/><circle cx="15" cy="15" r="3"/><circle cx="33" cy="15" r="3"/><circle cx="24" cy="24" r="3"/><circle cx="15" cy="33" r="3"/><circle cx="33" cy="33" r="3"/></svg>`,
    dice3: `<svg viewBox="0 0 48 48" fill="none" stroke="${STROKE}" stroke-width="1.6"><rect x="4" y="4" width="40" height="40" rx="8" transform="rotate(8 24 24)"/><circle cx="16" cy="17" r="3"/><circle cx="25" cy="25" r="3"/><circle cx="34" cy="33" r="3"/></svg>`,
    dice6: `<svg viewBox="0 0 48 48" fill="none" stroke="${STROKE}" stroke-width="1.6"><rect x="4" y="4" width="40" height="40" rx="8" transform="rotate(-10 24 24)"/><circle cx="16" cy="14" r="3"/><circle cx="16" cy="24" r="3"/><circle cx="16" cy="34" r="3"/><circle cx="33" cy="14" r="3"/><circle cx="33" cy="24" r="3"/><circle cx="33" cy="34" r="3"/></svg>`,
    cardA: `<svg viewBox="0 0 40 56" fill="none" stroke="${STROKE}" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="2" width="34" height="52" rx="5" transform="rotate(-8 20 28)"/><path d="M21 16l5 8c2 3-1 7-5 4-4 3-7-1-5-4l5-8Z"/><path d="M16 40l4-6 4 6"/></svg>`,
    cardK: `<svg viewBox="0 0 40 56" fill="none" stroke="${STROKE}" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="2" width="34" height="52" rx="5" transform="rotate(10 20 28)"/><path d="M14 18h12M20 18v20"/><path d="M13 44c3-4 11-4 14 0"/><circle cx="20" cy="30" r="4"/></svg>`,
    domino: `<svg viewBox="0 0 36 60" fill="none" stroke="${STROKE}" stroke-width="1.6"><rect x="3" y="2" width="30" height="56" rx="6" transform="rotate(6 18 30)"/><line x1="6" y1="30" x2="31" y2="32"/><circle cx="15" cy="15" r="2.6"/><circle cx="23" cy="20" r="2.6"/><circle cx="17" cy="44" r="2.6"/><circle cx="23" cy="38" r="2.6"/></svg>`,
    puzzle: `<svg viewBox="0 0 52 52" fill="none" stroke="${STROKE}" stroke-width="1.6" stroke-linejoin="round"><path d="M6 6h14a5 5 0 1 1 10 0h14v14a5 5 0 1 0 0 10v14H30a5 5 0 1 0-10 0H6V30a5 5 0 1 1 0-10V6Z"/></svg>`,
    sudoku: `<svg viewBox="0 0 44 44" fill="none" stroke="${STROKE}" stroke-width="1.4"><rect x="3" y="3" width="38" height="38" rx="3"/><path d="M16 3v38M30 3v38M3 16h38M3 30h38" stroke-width="2"/><text x="8" y="13" font-size="9" font-family="serif" fill="${STROKE}" stroke="none">5</text><text x="34" y="41" font-size="9" font-family="serif" fill="${STROKE}" stroke="none">3</text></svg>`,
    meeples: `<svg viewBox="0 0 48 48" fill="none" stroke="${STROKE}" stroke-width="1.6"><circle cx="16" cy="14" r="6"/><path d="M6 40c0-7 4-12 10-12s10 5 10 12"/><circle cx="34" cy="18" r="5"/><path d="M26 42c0-6 4-10 8-10s8 4 8 10"/></svg>`,
    spinner: `<svg viewBox="0 0 48 48" fill="none" stroke="${STROKE}" stroke-width="1.6"><circle cx="24" cy="24" r="18"/><path d="M24 6v10M24 32v10M6 24h10M32 24h10"/><path d="M24 24l9 9"/></svg>`,
    meeples2: `<svg viewBox="0 0 48 48" fill="none" stroke="${STROKE}" stroke-width="1.6"><circle cx="24" cy="16" r="7"/><path d="M12 42c0-8 5-13 12-13s12 5 12 13"/></svg>`,
  };

  // Posições orgânicas (%, tamanho e rotação variados), evitando o centro-superior
  // onde ficam título/busca, e o miolo denso dos cards.
  const placements = [
    ['chessKing',   3,  14,  92, -14], ['dice5',     22, 4,  46,  12],
    ['chessPawn',  44,  3,  60,   9], ['cardA',     70, 8,  78, -10],
    ['domino',     90, 18,  84,  14], ['sudoku',     8, 36,  74,  -6],
    ['puzzle',     92, 46,  96,  10], ['dice3',     30, 46,  54, -12],
    ['meeples',    60, 42,  64,   6], ['cardK',     48, 56,  70,   8],
    ['chessQueen',  4,  62, 104,  -8], ['spinner',   78, 62,  58, -14],
    ['dice6',      24, 76,  66,  10], ['chessKnight', 56, 74, 96, -12],
    ['puzzle',     86, 84,  70,   8], ['domino',     10, 90,  62, 12],
    ['sudoku',     40, 90,  52,  -6], ['chessPawn', 68, 92,  58, 10],
    ['dice5',      92, 68,  44,  -8], ['cardA',      2, 48,  66, 12],
    ['meeples2',   34, 34,  46, -10],
  ];

  const layer = document.createElement('div');
  layer.className = 'bg-doodles';
  layer.setAttribute('aria-hidden', 'true');

  placements.forEach(([key, x, y, size, rot], i) => {
    const span = document.createElement('span');
    span.className = 'bg-doodle';
    span.innerHTML = svgs[key];
    span.style.left = `${x}%`;
    span.style.top = `${y}%`;
    span.style.width = `${Math.round(size * 1.45)}px`;   // imagens maiores
    span.style.transform = `rotate(${rot}deg)`;
    span.style.opacity = (0.05 + (i % 4) * 0.012).toFixed(3); // 0.05–0.086
    layer.appendChild(span);
  });

  document.body.appendChild(layer);
})();
// ── Botões "Jogar" nos cards ──────────────────────────────
document.querySelectorAll('.card-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!isTransitioning) showGame(btn.getAttribute('data-game'));
  });
});

// ── Botão "Voltar" ────────────────────────────────────────
backBtn.addEventListener('click', () => {
  if (!isTransitioning) showHome();
});

// ─────────────────────────────────────────────────────────
// BUSCA EM TEMPO REAL
// ─────────────────────────────────────────────────────────

function normalizeStr(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function handleSearch() {
  const query  = searchInput.value.trim();
  const norm   = normalizeStr(query);
  let   visible = 0;

  document.querySelectorAll('.game-card').forEach(card => {
    const tags = normalizeStr(card.getAttribute('data-tags') || '');
    const cardContent = normalizeStr(card.textContent || '');
    const match = !norm || tags.includes(norm) || cardContent.includes(norm);
    card.hidden = !match;
    if (match) visible++;
  });

  // Esconde seções sem nenhum card visível (quando há busca ativa)
  document.querySelectorAll('.cat-section').forEach(section => {
    if (!norm) {
      section.hidden = false;
      return;
    }
    const cards = section.querySelectorAll('.game-card');
    const visibleCards = [...cards].filter(c => !c.hidden);
    section.hidden = visibleCards.length === 0;
  });

  if (norm && visible === 0) {
    searchEmpty.textContent = `Nenhum jogo encontrado para "${query}".`;
    searchEmpty.hidden = false;
  } else {
    searchEmpty.hidden = true;
  }
}

searchInput.addEventListener('input', handleSearch);

// ─────────────────────────────────────────────────────────
// MENU HAMBÚRGUER (DRAWER DE CATEGORIAS)
// ─────────────────────────────────────────────────────────

function openMenu() {
  drawerBackdrop.classList.add('is-open');
  categoryMenu.classList.add('is-open');
  document.body.classList.add('drawer-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  categoryMenu.setAttribute('aria-hidden', 'false');
  setTimeout(() => drawerClose.focus(), 120);
}

function closeMenu(restoreFocus = false) {
  drawerBackdrop.classList.remove('is-open');
  categoryMenu.classList.remove('is-open');
  document.body.classList.remove('drawer-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  categoryMenu.setAttribute('aria-hidden', 'true');
  if (restoreFocus) menuToggle.focus();
}

menuToggle.addEventListener('click', () => {
  menuToggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
});

drawerClose.addEventListener('click', () => closeMenu(true));
drawerBackdrop.addEventListener('click', () => closeMenu(true));

// Fechar com Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu(true);
  }
});

// Cada categoria abre seus subníveis também por teclado e clique.
categoryMenu.querySelectorAll('.drawer-category').forEach(category => {
  category.addEventListener('click', () => {
    const willOpen = category.getAttribute('aria-expanded') !== 'true';
    categoryMenu.querySelectorAll('.drawer-category').forEach(item => item.setAttribute('aria-expanded', 'false'));
    category.setAttribute('aria-expanded', String(willOpen));
  });
});

// Itens do drawer levam à categoria ou abrem imediatamente os jogos ativos.
categoryMenu.querySelectorAll('.drawer-games a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.getAttribute('href').slice(1);
    const gameId = link.getAttribute('data-game');
    closeMenu();

    if (gameId) {
      showGame(gameId);
      return;
    }

    const doScroll = () => {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Se estiver na view do jogo, volta para home primeiro
    if (!viewGame.hidden) {
      showHome();
      setTimeout(doScroll, 50);
    } else {
      doScroll();
    }
  });
});

// ─────────────────────────────────────────────────────────
// ACESSIBILIDADE — TAMANHO DE FONTE
// ─────────────────────────────────────────────────────────

const FONT_LEVELS = ['small', 'medium', 'large', 'xlarge'];
let fontLevel = 1; // padrão: medium

function applyFont() {
  htmlEl.setAttribute('data-font', FONT_LEVELS[fontLevel]);
  try { localStorage.setItem('pt-font', fontLevel); } catch (_) {}
}

document.getElementById('btn-font-down').addEventListener('click', () => {
  if (fontLevel > 0) { fontLevel--; applyFont(); }
});

document.getElementById('btn-font-up').addEventListener('click', () => {
  if (fontLevel < FONT_LEVELS.length - 1) { fontLevel++; applyFont(); }
});

// ─────────────────────────────────────────────────────────
// ACESSIBILIDADE — TEMAS
// ─────────────────────────────────────────────────────────

let isDark     = false;
let isContrast = false;

const btnDark     = document.getElementById('btn-dark');
const btnContrast = document.getElementById('btn-contrast');

function applyTheme() {
  if (isContrast) {
    htmlEl.setAttribute('data-theme', 'high-contrast');
  } else if (isDark) {
    htmlEl.setAttribute('data-theme', 'dark');
  } else {
    htmlEl.setAttribute('data-theme', '');
  }
  btnDark.setAttribute('aria-pressed',     String(isDark));
  btnContrast.setAttribute('aria-pressed', String(isContrast));
  try {
    localStorage.setItem('pt-dark',     isDark);
    localStorage.setItem('pt-contrast', isContrast);
  } catch (_) {}
}

btnDark.addEventListener('click', () => {
  isDark = !isDark;
  if (isDark) isContrast = false; // exclusivos
  applyTheme();
});

btnContrast.addEventListener('click', () => {
  isContrast = !isContrast;
  if (isContrast) isDark = false; // exclusivos
  applyTheme();
});

// ─────────────────────────────────────────────────────────
// RESTAURAR PREFERÊNCIAS SALVAS
// ─────────────────────────────────────────────────────────

(function restorePreferences() {
  try {
    const savedFont = localStorage.getItem('pt-font');
    if (savedFont !== null) {
      fontLevel = Math.min(Math.max(parseInt(savedFont, 10), 0), FONT_LEVELS.length - 1);
    }
    isDark     = localStorage.getItem('pt-dark')     === 'true';
    isContrast = localStorage.getItem('pt-contrast') === 'true';
  } catch (_) {}

  applyFont();
  applyTheme();
})();
