'use strict';

const Hangman = (() => {
  const WORDS = ['ESCOLA', 'CADERNO', 'LEITURA', 'JANELA', 'DESAFIO', 'AMIZADE', 'PLANETA'];
  let container, word, used, misses, keyHandler;

  function render() {
    const masked = [...word].map(letter => used.has(letter) ? letter : '_').join(' ');
    const won = [...word].every(letter => used.has(letter));
    const lost = misses >= 6;
    container.innerHTML = `<div class="word-game hangman-game"><div class="word-game-intro"><p class="game-eyebrow">Descubra a palavra</p><h3>Forca</h3><p>Escolha letras e descubra a palavra antes que suas tentativas acabem.</p></div><div class="hangman-word" aria-live="polite">${masked}</div><p class="hangman-attempts">Tentativas restantes: ${Math.max(0, 6 - misses)}</p><div class="hangman-keyboard" role="group" aria-label="Teclado de letras">${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => `<button class="game-action-btn hangman-key" data-letter="${letter}" ${used.has(letter) || won || lost ? 'disabled' : ''}>${letter}</button>`).join('')}</div><p class="word-feedback" role="status" aria-live="polite">${won ? `Parabéns! A palavra era ${word}.` : lost ? `Fim de jogo. A palavra era ${word}.` : 'Escolha uma letra.'}</p><div class="result-actions"><button class="game-action-btn math-primary hangman-again">Nova palavra</button><button class="game-action-btn hangman-home">Voltar aos jogos</button></div></div>`;
    container.querySelectorAll('.hangman-key').forEach(button => button.addEventListener('click', () => guess(button.dataset.letter)));
    container.querySelector('.hangman-again').addEventListener('click', start);
    container.querySelector('.hangman-home').addEventListener('click', () => window.dispatchEvent(new CustomEvent('passatempo:home')));
  }
  function guess(letter) { if (used.has(letter) || misses >= 6 || [...word].every(item => used.has(item))) return; used.add(letter); if (!word.includes(letter)) misses++; render(); }
  function start() { word = WORDS[Math.floor(Math.random() * WORDS.length)]; used = new Set(); misses = 0; render(); }
  function mount(el) { container = el; keyHandler = event => { const letter = event.key.toUpperCase(); if (/^[A-Z]$/.test(letter)) guess(letter); }; container.addEventListener('keydown', keyHandler); start(); }
  function unmount() { if (container && keyHandler) container.removeEventListener('keydown', keyHandler); if (container) container.innerHTML = ''; container = null; used = null; keyHandler = null; }
  return { mount, unmount };
})();
