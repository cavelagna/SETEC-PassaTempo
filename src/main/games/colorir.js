'use strict';

// Colorir por números — ilustrações vetoriais originais, sem dependências externas.
const Colorir = (() => {
  const PALETTE = [
    { index: 1, name: 'Verde folha', color: '#5b9a59' },
    { index: 2, name: 'Verde profundo', color: '#2f6d4f' },
    { index: 3, name: 'Laranja', color: '#e9873f' },
    { index: 4, name: 'Coral', color: '#d95f5f' },
    { index: 5, name: 'Creme', color: '#f2d49b' },
    { index: 6, name: 'Azul céu', color: '#6fa9c5' }
  ];

  const DRAWINGS = [
    {
      name: 'Morango do jardim',
      description: 'Um morango maduro entre folhas e pequenas flores.',
      svg: '<svg class="colorir-art" viewBox="0 0 360 360" role="img" aria-label="Desenho de um morango para colorir"><path class="colorir-piece" data-number="6" d="M40 276c19-36 48-52 79-40 18 7 26 24 24 43-28 17-66 16-103-3Z"/><path class="colorir-piece" data-number="6" d="M320 276c-19-36-48-52-79-40-18 7-26 24-24 43 28 17 66 16 103-3Z"/><path class="colorir-piece" data-number="1" d="M180 82c-16-25-38-33-59-27 10 21 28 34 50 38m9-11c16-25 38-33 59-27-10 21-28 34-50 38"/><path class="colorir-piece" data-number="2" d="M180 90 151 107l18 11-8 24 19-8 19 8-8-24 18-11Z"/><path class="colorir-piece" data-number="4" d="M180 109c-58 0-94 31-82 79 13 54 49 106 82 132 33-26 69-78 82-132 12-48-24-79-82-79Z"/><path class="colorir-piece" data-number="3" d="M80 136c-26-11-45 3-49 27 25 1 43-9 49-27Zm200 0c26-11 45 3 49 27-25 1-43-9-49-27Z"/><path class="colorir-piece" data-number="5" d="M56 187c-11-20-32-23-45-10 13 13 29 16 45 10Zm248 0c11-20 32-23 45-10-13 13-29 16-45 10Z"/><g class="colorir-seeds"><ellipse cx="147" cy="164" rx="4" ry="7"/><ellipse cx="180" cy="154" rx="4" ry="7"/><ellipse cx="213" cy="164" rx="4" ry="7"/><ellipse cx="128" cy="205" rx="4" ry="7"/><ellipse cx="164" cy="202" rx="4" ry="7"/><ellipse cx="199" cy="204" rx="4" ry="7"/><ellipse cx="232" cy="205" rx="4" ry="7"/><ellipse cx="148" cy="247" rx="4" ry="7"/><ellipse cx="180" cy="254" rx="4" ry="7"/><ellipse cx="212" cy="247" rx="4" ry="7"/></g><g class="colorir-number-labels"><text data-label="1" x="142" y="73">1</text><text data-label="2" x="180" y="120">2</text><text data-label="4" x="180" y="225">4</text><text data-label="6" x="91" y="264">6</text><text data-label="6" x="269" y="264">6</text><text data-label="3" x="53" y="154">3</text><text data-label="3" x="307" y="154">3</text></g></svg>'
    },
    {
      name: 'Raposa curiosa',
      description: 'Uma raposinha aconchegada observando o bosque.',
      svg: '<svg class="colorir-art" viewBox="0 0 360 360" role="img" aria-label="Desenho de uma raposa para colorir"><path class="colorir-piece" data-number="2" d="M65 274c-21-61 4-116 48-130l-19-88 71 43c10-3 20-4 30-4s20 1 30 4l71-43-19 88c44 14 69 69 48 130-18 52-62 66-140 66S83 326 65 274Z"/><path class="colorir-piece" data-number="3" d="M110 152c24-40 49-53 85-53s61 13 85 53c10 18 10 57-11 84-20 25-43 39-74 39s-54-14-74-39c-21-27-21-66-11-84Z"/><path class="colorir-piece" data-number="5" d="M126 168c18-28 39-38 69-38s51 10 69 38c-5 50-30 84-69 84s-64-34-69-84Z"/><path class="colorir-piece" data-number="4" d="M72 278c31-16 65-17 94 4 12 9 20 20 24 34-57 4-96-5-118-38Zm216 0c-31-16-65-17-94 4-12 9-20 20-24 34 57 4 96-5 118-38Z"/><path class="colorir-piece" data-number="1" d="M61 326c42-31 85-34 119-11-18 20-49 31-87 31-12 0-23-2-32-5Zm238 0c-42-31-85-34-119-11 18 20 49 31 87 31 12 0 23-2 32-5Z"/><path class="colorir-piece" data-number="6" d="M100 85 113 145 145 111Zm160 0-13 60-32-34Z"/><path class="colorir-nose" d="M184 207q11-10 22 0-11 13-22 0Z"/><path class="colorir-detail" d="M173 220q11 12 22 0m-55-45q11-8 22 0m56 0q11-8 22 0"/><g class="colorir-number-labels"><text data-label="2" x="194" y="285">2</text><text data-label="3" x="115" y="150">3</text><text data-label="5" x="195" y="180">5</text><text data-label="4" x="112" y="292">4</text><text data-label="4" x="276" y="292">4</text><text data-label="1" x="106" y="335">1</text><text data-label="1" x="254" y="335">1</text><text data-label="6" x="116" y="108">6</text><text data-label="6" x="244" y="108">6</text></g></svg>'
    },
    {
      name: 'Pera e borboleta',
      description: 'Uma pera perfumada com uma borboleta pousando perto.',
      svg: '<svg class="colorir-art" viewBox="0 0 360 360" role="img" aria-label="Desenho de uma pera e borboleta para colorir"><path class="colorir-piece" data-number="2" d="M177 49c-1 35-11 57-32 73m32-73c17-19 40-23 60-12-17 19-36 25-60 12Z"/><path class="colorir-piece" data-number="1" d="M179 82c-26-24-55-20-75 5 28 13 53 9 75-5Z"/><path class="colorir-piece" data-number="5" d="M180 109c-30 0-58 25-55 65 2 24-43 58-28 111 11 39 42 54 83 54s72-15 83-54c15-53-30-87-28-111 3-40-25-65-55-65Z"/><path class="colorir-piece" data-number="3" d="M92 246c-32-19-57-10-72 16 34 13 59 2 72-16Zm176 0c32-19 57-10 72 16-34 13-59 2-72-16Z"/><path class="colorir-piece" data-number="4" d="M266 109c-26-29-57-20-63 8-5 25 13 42 43 32 18-6 25-22 20-40Zm12 78c-26 29-57 20-63-8-5-25 13-42 43-32 18 6 25 22 20 40Z"/><path class="colorir-piece" data-number="6" d="M282 128c20-24 43-14 47 8 3 16-10 29-29 23-13-4-20-14-18-31Zm0 39c20 24 43 14 47-8 3-16-10-29-29-23-13 4-20 14-18 31Z"/><path class="colorir-detail" d="M275 147v28m-9-10q9 9 18 0M145 161q35-22 70 0m-81 83q46 18 92 0"/><circle class="colorir-nose" cx="180" cy="196" r="4"/><g class="colorir-number-labels"><text data-label="2" x="165" y="78">2</text><text data-label="1" x="135" y="85">1</text><text data-label="5" x="180" y="228">5</text><text data-label="3" x="55" y="262">3</text><text data-label="3" x="305" y="262">3</text><text data-label="4" x="239" y="124">4</text><text data-label="4" x="250" y="177">4</text><text data-label="6" x="308" y="145">6</text><text data-label="6" x="308" y="172">6</text></g></svg>'
    },
    {
      name: 'Coelhinho e cenoura',
      description: 'Um coelhinho brincalhão guardando a sua cenoura.',
      svg: '<svg class="colorir-art" viewBox="0 0 360 360" role="img" aria-label="Desenho de um coelhinho e uma cenoura para colorir"><path class="colorir-piece" data-number="6" d="M120 129C80 88 77 37 104 23c24-12 43 43 42 91m-2 13c9-58 36-101 61-87 23 13 4 67-29 105Z"/><path class="colorir-piece" data-number="5" d="M128 112c-21-34-21-64-13-68 14-5 26 33 28 68Zm31 0c13-35 30-65 43-59 12 7-8 40-28 68Z"/><path class="colorir-piece" data-number="5" d="M93 192c0-63 40-99 87-99s87 36 87 99c0 70-40 125-87 125S93 262 93 192Z"/><path class="colorir-piece" data-number="4" d="M80 291c27-26 58-28 83-8 8 7 14 15 17 25-42 15-76 9-100-17Zm200 0c-27-26-58-28-83-8-8 7-14 15-17 25 42 15 76 9 100-17Z"/><path class="colorir-piece" data-number="3" d="M166 267 209 212l33 20-43 75c-11 18-43-17-33-40Z"/><path class="colorir-piece" data-number="1" d="M205 216c2-26 14-39 32-40-1 19-11 32-32 40Zm13 4c14-20 31-24 45-15-11 15-25 20-45 15Z"/><path class="colorir-nose" d="M171 201q9-9 18 0-9 11-18 0Z"/><path class="colorir-detail" d="M180 212q0 12-12 12m12-12q0 12 12 12m-49-42q11-8 22 0m51 0q11-8 22 0"/><g class="colorir-number-labels"><text data-label="6" x="111" y="89">6</text><text data-label="6" x="199" y="90">6</text><text data-label="5" x="180" y="255">5</text><text data-label="4" x="119" y="300">4</text><text data-label="4" x="241" y="300">4</text><text data-label="3" x="207" y="264">3</text><text data-label="1" x="236" y="198">1</text><text data-label="1" x="254" y="210">1</text></g></svg>'
    }
  ];

  let container, selectedIndex, drawingIndex, painted, totalPieces;
  function color() { return PALETTE.find(item => item.index === selectedIndex); }
  function instruction(message) {
    const el = container.querySelector('.colorir-instruction');
    el.innerHTML = message || 'Agora pinte as áreas do número <strong>' + color().index + '</strong> · ' + color().name + '. Elas estão destacadas no desenho.';
  }
  function targets() {
    container.querySelectorAll('.colorir-piece').forEach(piece => piece.classList.toggle('is-target', Number(piece.dataset.number) === selectedIndex && !piece.classList.contains('is-painted')));
  }
  function render() {
    const drawing = DRAWINGS[drawingIndex];
    container.innerHTML = '<section class="colorir-game"><div class="colorir-heading"><div><p class="game-eyebrow">Colorir por números</p><h3>' + drawing.name + '</h3><p>' + drawing.description + '</p></div><span class="colorir-progress" aria-live="polite"></span></div><div class="colorir-choice" role="group" aria-label="Escolha uma ilustração">' + DRAWINGS.map((item, i) => '<button type="button" class="colorir-drawing-btn ' + (i === drawingIndex ? 'is-active' : '') + '" data-drawing="' + i + '">' + item.name + '</button>').join('') + '</div><div class="colorir-canvas">' + drawing.svg + '</div><div class="colorir-panel"><p class="colorir-instruction" role="status" aria-live="polite"></p><div class="colorir-palette" role="group" aria-label="Paleta de cores">' + PALETTE.map(item => '<button type="button" class="colorir-swatch ' + (item.index === selectedIndex ? 'is-selected' : '') + '" data-index="' + item.index + '" style="--swatch:' + item.color + '" aria-pressed="' + (item.index === selectedIndex) + '" aria-label="Número ' + item.index + ': ' + item.name + '"><b>' + item.index + '</b><span>' + item.name + '</span></button>').join('') + '</div></div><div class="colorir-actions"><button type="button" class="game-action-btn colorir-reset">Recomeçar desenho</button><button type="button" class="game-action-btn colorir-next">Próximo desenho</button></div></section>';
    totalPieces = container.querySelectorAll('.colorir-piece').length; painted = 0;
    container.querySelector('.colorir-progress').textContent = '0/' + totalPieces + ' áreas';
    instruction(); targets();
  }
  function select(index) {
    selectedIndex = index;
    container.querySelectorAll('.colorir-swatch').forEach(swatch => { const active = Number(swatch.dataset.index) === index; swatch.classList.toggle('is-selected', active); swatch.setAttribute('aria-pressed', String(active)); });
    instruction(); targets();
  }
  function paint(piece) {
    if (piece.classList.contains('is-painted')) return;
    if (Number(piece.dataset.number) !== selectedIndex) { piece.classList.remove('is-wrong'); void piece.getBoundingClientRect(); piece.classList.add('is-wrong'); instruction('Esta área é do número ' + piece.dataset.number + '. Procure uma área destacada com o número ' + selectedIndex + '.'); return; }
    piece.classList.add('is-painted'); piece.style.setProperty('--piece-color', color().color); painted++;
    if (!container.querySelector('.colorir-piece[data-number="' + piece.dataset.number + '"]:not(.is-painted)')) container.querySelectorAll('[data-label="' + piece.dataset.number + '"]').forEach(label => label.classList.add('is-hidden'));
    container.querySelector('.colorir-progress').textContent = painted + '/' + totalPieces + ' áreas';
    if (painted === totalPieces) { instruction('Desenho concluído! Escolha outro retrato ou recomece este para colorir novamente.'); window.dispatchEvent(new CustomEvent('passatempo:result', { detail: { result: 'win' } })); } else { instruction(); targets(); }
  }
  function click(event) {
    const swatch = event.target.closest('.colorir-swatch'); if (swatch) { select(Number(swatch.dataset.index)); return; }
    const drawing = event.target.closest('[data-drawing]'); if (drawing) { drawingIndex = Number(drawing.dataset.drawing); render(); return; }
    if (event.target.closest('.colorir-reset')) { render(); return; }
    if (event.target.closest('.colorir-next')) { drawingIndex = (drawingIndex + 1) % DRAWINGS.length; render(); return; }
    const piece = event.target.closest('.colorir-piece'); if (piece) paint(piece);
  }
  function mount(el) { container = el; selectedIndex = 1; drawingIndex = Math.floor(Math.random() * DRAWINGS.length); render(); container.addEventListener('click', click); }
  function unmount() { if (container) { container.removeEventListener('click', click); container.innerHTML = ''; } container = null; }
  return { mount, unmount };
})();
