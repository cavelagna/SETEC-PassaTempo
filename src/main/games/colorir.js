'use strict';
const Colorir = (() => {
  // Paleta de cores (pode ser ajustada posteriormente)
  const PALETTE = [
    { index: 1, color: '#4caf50' }, // Verde
    { index: 2, color: '#2e7d32' }, // Verde escuro
    { index: 3, color: '#ff9800' }, // Laranja
    { index: 4, color: '#f44336' }  // Vermelho
  ];

  // Três desenhos SVG simples (cada um tem áreas numeradas 1‑4)
  const SVG_TEMPLATES = [
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
       <rect data-number="1" x="10" y="10" width="80" height="80" fill="none" stroke="var(--text-subtle)"/>
       <rect data-number="2" x="110" y="10" width="80" height="80" fill="none" stroke="var(--text-subtle)"/>
       <rect data-number="3" x="10" y="110" width="80" height="80" fill="none" stroke="var(--text-subtle)"/>
       <rect data-number="4" x="110" y="110" width="80" height="80" fill="none" stroke="var(--text-subtle)"/>
     </svg>`,
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
       <circle data-number="1" cx="50" cy="50" r="40" fill="none" stroke="var(--text-subtle)"/>
       <circle data-number="2" cx="150" cy="50" r="40" fill="none" stroke="var(--text-subtle)"/>
       <circle data-number="3" cx="50" cy="150" r="40" fill="none" stroke="var(--text-subtle)"/>
       <circle data-number="4" cx="150" cy="150" r="40" fill="none" stroke="var(--text-subtle)"/>
     </svg>`,
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
       <polygon data-number="1" points="10,190 100,10 190,190" fill="none" stroke="var(--text-subtle)"/>
       <polygon data-number="2" points="30,170 100,30 170,170" fill="none" stroke="var(--text-subtle)"/>
       <polygon data-number="3" points="50,150 100,50 150,150" fill="none" stroke="var(--text-subtle)"/>
       <polygon data-number="4" points="70,130 100,70 130,130" fill="none" stroke="var(--text-subtle)"/>
     </svg>`
  ];

  let container = null;
  let selectedIndex = 1; // começa com a primeira cor da paleta

  function mount(el) {
    container = el;
    // Escolhe um desenho aleatório
    const svgString = SVG_TEMPLATES[Math.floor(Math.random() * SVG_TEMPLATES.length)];
    const gameWrapper = document.createElement('div');
    gameWrapper.className = 'colorir-game';
    // Insere o SVG (como markup) e a paleta de cores abaixo dele
    gameWrapper.innerHTML = `${svgString}<div class="colorir-palette"></div>`;
    const paletteDiv = gameWrapper.querySelector('.colorir-palette');
    // Cria os swatches da paleta
    PALETTE.forEach(item => {
      const sw = document.createElement('div');
      sw.className = 'colorir-swatch' + (item.index === selectedIndex ? ' is-selected' : '');
      sw.dataset.index = item.index;
      sw.style.background = item.color;
      paletteDiv.appendChild(sw);
    });
    // Delegação de eventos – evita múltiplos listeners
    gameWrapper.addEventListener('click', e => {
      // 1) Clique na paleta
      const swatch = e.target.closest('.colorir-swatch');
      if (swatch) {
        selectedIndex = Number(swatch.dataset.index);
        gameWrapper.querySelectorAll('.colorir-swatch').forEach(s => {
          s.classList.toggle('is-selected', Number(s.dataset.index) === selectedIndex);
        });
        return;
      }
      // 2) Clique na região numerada do SVG
      const area = e.target.closest('[data-number]');
      if (area) {
        const colour = PALETTE.find(p => p.index === selectedIndex).color;
        area.setAttribute('fill', colour);
      }
    });
    // Insere tudo no container do jogo
    el.appendChild(gameWrapper);
    // Foco para que o teclado (se houver) funcione normalmente
    el.focus({ preventScroll: true });
  }

  function unmount() {
    if (container) {
      container.innerHTML = '';
      container = null;
    }
  }

  return { mount, unmount };
})();
