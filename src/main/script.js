'use strict';

// ── Registro de jogos ─────────────────────────────────────
// Cada entrada mapeia um ID para o módulo e o título exibido.
const GAMES = {
  minesweeper: { module: Minesweeper, title: 'Campo Minado' },
  sudoku:      { module: Sudoku,      title: 'Sudoku'       },
  memory:      { module: Memory,      title: 'Jogo da Memória' },
  tictactoe:   { module: TicTacToe,  title: 'Jogo da Velha' },
  snake:       { module: Snake,       title: 'Snake'         },
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

let currentGame = null;

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

  gameArea.innerHTML = '';
  entry.module.mount(gameArea);
}

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
