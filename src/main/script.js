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
    const tags  = normalizeStr(card.getAttribute('data-tags') || '');
    const title = normalizeStr(card.querySelector('.card-title')?.textContent || '');
    const match = !norm || tags.includes(norm) || title.includes(norm);
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
    const hasSoon = section.querySelector('.cat-soon');
    // Mostra seção se tem cards visíveis, ou se só tem o "em breve"
    const visibleCards = [...cards].filter(c => !c.hidden);
    section.hidden = visibleCards.length === 0 && !hasSoon;
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
// MENU HAMBÚRGUER (CATEGORIAS)
// ─────────────────────────────────────────────────────────

function openMenu() {
  categoryMenu.hidden = false;
  menuToggle.setAttribute('aria-expanded', 'true');
  categoryMenu.querySelectorAll('.cat-link').forEach(l => l.setAttribute('tabindex', '0'));
  // Foca no primeiro link
  const firstLink = categoryMenu.querySelector('.cat-link');
  if (firstLink) setTimeout(() => firstLink.focus(), 10);
}

function closeMenu() {
  categoryMenu.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  categoryMenu.querySelectorAll('.cat-link').forEach(l => l.setAttribute('tabindex', '-1'));
}

menuToggle.addEventListener('click', () => {
  categoryMenu.hidden ? openMenu() : closeMenu();
});

// Fechar ao clicar fora
document.addEventListener('click', e => {
  if (!menuToggle.contains(e.target) && !categoryMenu.contains(e.target)) {
    closeMenu();
  }
});

// Fechar com Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !categoryMenu.hidden) {
    closeMenu();
    menuToggle.focus();
  }
});

// Navegação por teclado dentro do menu (setas)
categoryMenu.addEventListener('keydown', e => {
  const links = [...categoryMenu.querySelectorAll('.cat-link')];
  const idx = links.indexOf(document.activeElement);
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    links[(idx + 1) % links.length]?.focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    links[(idx - 1 + links.length) % links.length]?.focus();
  }
});

// Links de categoria → rolar até a seção
categoryMenu.querySelectorAll('.cat-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.getAttribute('href').slice(1);
    closeMenu();

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
