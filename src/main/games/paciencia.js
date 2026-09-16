'use strict';

// Paciência Klondike: monte, descarte, fundações e sete colunas.
const Solitaire = (() => {
  const SUITS = [{ id: 'hearts', symbol: '♥', red: true }, { id: 'diamonds', symbol: '♦', red: true }, { id: 'clubs', symbol: '♣', red: false }, { id: 'spades', symbol: '♠', red: false }];
  const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  let container, state;
  const value = card => RANKS.indexOf(card.rank) + 1;
  const shuffle = deck => { for (let i = deck.length - 1; i; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; } return deck; };
  function newGame() {
    const deck = shuffle(SUITS.flatMap(suit => RANKS.map(rank => ({ suit, rank, faceUp: false }))));
    const tableau = Array.from({ length: 7 }, (_, pile) => deck.splice(0, pile + 1));
    tableau.forEach(pile => { pile[pile.length - 1].faceUp = true; });
    state = { stock: deck, waste: [], tableau, foundations: SUITS.map(() => []), selected: null, won: false };
  }
  function cardMarkup(card, selected, extra) {
    if (!card) return '<div class="sol-slot ' + (extra || '') + '"></div>';
    if (!card.faceUp) return '<button class="sol-card sol-card--back ' + (extra || '') + '" aria-label="Carta virada para baixo"></button>';
    return '<button class="sol-card ' + (card.suit.red ? 'sol-card--red ' : '') + (selected ? ' is-selected ' : '') + (extra || '') + '" aria-label="' + card.rank + ' de ' + card.suit.id + '"><span>' + card.rank + '</span><b>' + card.suit.symbol + '</b><i>' + card.suit.symbol + '</i></button>';
  }
  function render() {
    const s = state.selected;
    const pile = (cards, index) => '<div class="sol-tableau-pile">' + cards.map((card, cardIndex) => '<div class="sol-tableau-card" style="top:' + (cardIndex * 25) + 'px;z-index:' + cardIndex + '" data-zone="tableau" data-pile="' + index + '" data-index="' + cardIndex + '">' + cardMarkup(card, s && s.zone === 'tableau' && s.pile === index && s.index === cardIndex) + '</div>').join('') + (cards.length ? '' : '<div class="sol-tableau-card sol-empty" data-zone="tableau" data-pile="' + index + '"></div>') + '</div>';
    container.innerHTML = '<section class="sol-game"><div class="sol-header"><div><p class="game-eyebrow">Klondike</p><h3>Paciência</h3></div><button class="game-action-btn sol-new">Novo jogo</button></div><p class="sol-help" role="status">Monte os naipes em ordem crescente. Nas colunas, alterne cores em ordem decrescente.</p><div class="sol-top"><div class="sol-stock" data-zone="stock">' + cardMarkup(state.stock.length ? { faceUp: false } : null, false) + '</div><div class="sol-waste" data-zone="waste">' + cardMarkup(state.waste.at(-1), s && s.zone === 'waste') + '</div><div class="sol-spacer"></div><div class="sol-foundations">' + state.foundations.map((foundation, index) => '<div data-zone="foundation" data-pile="' + index + '">' + cardMarkup(foundation.at(-1), s && s.zone === 'foundation' && s.pile === index, 'sol-foundation') + '</div>').join('') + '</div></div><div class="sol-tableau">' + state.tableau.map(pile).join('') + '</div></section>';
  }
  function source(zone, pile, index) {
    if (zone === 'waste') return state.waste.length ? { zone, cards: [state.waste.at(-1)] } : null;
    if (zone === 'foundation') return state.foundations[pile].length ? { zone, pile, cards: [state.foundations[pile].at(-1)] } : null;
    const cards = state.tableau[pile].slice(index);
    return cards.length && cards[0].faceUp ? { zone, pile, index, cards } : null;
  }
  function canTable(cards, target) {
    const first = cards[0]; if (!target) return value(first) === 13;
    return target.faceUp && target.suit.red !== first.suit.red && value(target) === value(first) + 1;
  }
  function move(from, zone, pile) {
    const cards = from.cards, target = zone === 'tableau' ? state.tableau[pile].at(-1) : state.foundations[pile].at(-1);
    if (zone === 'tableau' && !canTable(cards, target)) return false;
    if (zone === 'foundation' && (cards.length !== 1 || cards[0].suit.id !== SUITS[pile].id || value(cards[0]) !== (target ? value(target) + 1 : 1))) return false;
    if (from.zone === 'waste') state.waste.pop();
    else if (from.zone === 'foundation') state.foundations[from.pile].pop();
    else { state.tableau[from.pile].splice(from.index); const top = state.tableau[from.pile].at(-1); if (top) top.faceUp = true; }
    if (zone === 'tableau') state.tableau[pile].push(...cards); else state.foundations[pile].push(cards[0]);
    state.selected = null; state.won = state.foundations.every(cards => cards.length === 13); return true;
  }
  function click(event) {
    if (event.target.closest('.sol-new')) { newGame(); render(); return; }
    const target = event.target.closest('[data-zone]'); if (!target) return;
    const zone = target.dataset.zone, pile = Number(target.dataset.pile), index = Number(target.dataset.index);
    if (zone === 'stock') { if (state.stock.length) { const card = state.stock.pop(); card.faceUp = true; state.waste.push(card); } else { state.stock = state.waste.reverse().map(card => ({ ...card, faceUp: false })); state.waste = []; } state.selected = null; render(); return; }
    if (state.selected && move(state.selected, zone, pile)) { render(); return; }
    state.selected = source(zone, pile, index); render();
  }
  function mount(el) { container = el; newGame(); render(); container.addEventListener('click', click); }
  function unmount() { if (container) { container.removeEventListener('click', click); container.innerHTML = ''; } container = null; state = null; }
  return { mount, unmount };
})();
