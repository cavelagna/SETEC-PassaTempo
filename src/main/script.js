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
  colorir:     { module: Colorir,    title: 'Colorir' },
  solitaire:   { module: Solitaire,  title: 'Paciência' },
  chess:       { module: Chess,      title: 'Xadrez' },
  checkers:    { module: Checkers,   title: 'Damas' },
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
  colorir: ['Escolha uma cor e clique nas áreas numeradas.', 'A cor deve corresponder ao número indicado.', 'Complete todos os números para revelar o desenho.'],
  solitaire: ['Mova cartas entre a reserva, o descarte e as fundações.', 'Organize cada coluna em ordem decrescente e alternada.', 'Complete as quatro fundações, do Ás ao Rei.'],
  chess: ['Clique em uma peça e depois no destino.', 'Faça jogadas legais e não deixe seu rei em xeque.', 'Tente colocar o rei do adversário em xeque para vencê-lo.'],
  checkers: ['As peças claras começam e se movem na diagonal para frente.', 'Clique na peça e depois na casa destacada para mover ou capturar.', 'Capturas são obrigatórias. Ao chegar ao outro lado, sua peça vira dama.'],
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
let seenGameRules = new Set();

try {
  const saved = JSON.parse(localStorage.getItem(RULES_STORAGE_KEY) || '[]');
  if (Array.isArray(saved)) seenGameRules = new Set(saved.filter(id => Object.hasOwn(GAME_RULES, id)));
} catch (_) {}

let currentGame = null;
const OVERLAY_GAMES = new Set(['two048', 'crossword', 'wordsearch']);

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
  const overlay = document.createElement('div');
  overlay.className = `game-result-overlay ${won ? 'is-win' : 'is-loss'}`;
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'assertive');
  overlay.innerHTML = `<strong>${won ? 'Você venceu!' : 'Você perdeu.'}</strong>`;
  gameArea.appendChild(overlay);
}

window.addEventListener('passatempo:result', event => showGameResult(event.detail?.result));

function clearGameResult() {
  gameArea?.querySelector('.game-result-overlay')?.remove();
}

const resultObserver = new MutationObserver(mutations => {
  if (!viewGame || viewGame.hidden || !currentGame || !OVERLAY_GAMES.has(currentGame)) return;
  const text = mutations.map(mutation => mutation.target.textContent || '').join(' ');
  if (/você venceu|parabéns|venceu!/i.test(text)) showGameResult('win');
  if (/você perdeu|fim de jogo/i.test(text)) showGameResult('loss');
});
resultObserver.observe(gameArea, { childList: true, subtree: true, characterData: true });

gameArea.addEventListener('click', event => {
  if (event.target.closest('.two048-restart, .crossword-restart, .word-search-restart')) clearGameResult();
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
  if (currentGame) {
    GAMES[currentGame].module.unmount();
    currentGame = null;
  }
  viewGame.hidden = true;
  viewHome.hidden = false;
  document.title = 'PassaTempo';
}

function showGame(id) {
  const entry = GAMES[id];
  if (!entry) return;

  // Desmonta o jogo anterior, se houver
  if (currentGame && GAMES[currentGame]) {
    GAMES[currentGame].module.unmount();
  }

  currentGame = id;
  viewHome.hidden = true;
  viewGame.hidden = false;

  gameTitle.textContent = entry.title;
  document.title = `${entry.title} — PassaTempo`;

  clearGameResult();
  gameArea.innerHTML = '';
  entry.module.mount(gameArea);

  if (!seenGameRules.has(id)) showGameRules(id);

  requestAnimationFrame(() => {
    viewGame.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (rulesDialog.open) rulesDialog.querySelector('.game-rules-close').focus({ preventScroll: true });
    else gameArea.focus({ preventScroll: true });
  });
}

function showGameRules(id) {
  const entry = GAMES[id];
  const rules = GAME_RULES[id];
  if (!entry || !rules) return;

  rulesTitle.textContent = `Instruções de ${entry.title}`;
  rulesSummary.textContent = `Leia os passos principais antes de ${entry.title === 'Colorir' ? 'colorir o desenho' : 'começar'}.`;
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

// ── Botões "Jogar" nos cards ──────────────────────────────
document.querySelectorAll('.card-btn').forEach(btn => {
  btn.addEventListener('click', () => showGame(btn.getAttribute('data-game')));
});

// ── Botão "Voltar" ────────────────────────────────────────
backBtn.addEventListener('click', showHome);

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
