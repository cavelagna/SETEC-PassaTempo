'use strict';

/* Quiz — perguntas de conhecimento geral em três níveis.
 * A cada partida as perguntas são sorteadas do nível escolhido e as
 * alternativas também são embaralhadas, então a ordem nunca se repete.
 */
const Quiz = (() => {
  // ── Nível fácil ───────────────────────────────────────────
  const EASY = [
    { q: 'Qual é a montanha mais alta do mundo?', a: ['Monte Everest', 'K2', 'Mauna Kea', 'Mont Blanc'] },
    { q: 'Quem pintou a Mona Lisa?', a: ['Leonardo da Vinci', 'Michelangelo', 'Pablo Picasso', 'Rafael'] },
    { q: 'Qual é o maior planeta do nosso sistema solar?', a: ['Júpiter', 'Saturno', 'Neptuno', 'Terra'] },
    { q: 'Em que país se localiza Machu Picchu?', a: ['Peru', 'Chile', 'Bolívia', 'México'] },
    { q: 'Quantos ossos tem o corpo humano adulto?', a: ['206 ossos', '186 ossos', '226 ossos', '246 ossos'] },
    { q: 'Qual é a capital do Brasil?', a: ['Brasília', 'Rio de Janeiro', 'São Paulo', 'Salvador'] },
    { q: 'Quantos dias tem um ano bissexto?', a: ['366 dias', '365 dias', '364 dias', '367 dias'] },
    { q: 'Que cor resulta da mistura do azul com o amarelo?', a: ['Verde', 'Roxo', 'Laranja', 'Vermelho'] },
    { q: 'Quantos lados tem um hexágono?', a: ['6 lados', '5 lados', '7 lados', '8 lados'] },
    { q: 'Qual é o maior oceano do planeta?', a: ['Pacífico', 'Atlântico', 'Índico', 'Ártico'] },
    { q: 'Em que continente fica o deserto do Saara?', a: ['África', 'Ásia', 'Europa', 'América do Sul'] },
    { q: 'Como se chama a passagem da água do estado líquido para o gasoso?', a: ['Evaporação', 'Condensação', 'Congelamento', 'Precipitação'] },
    { q: 'Qual gás nós respiramos para viver?', a: ['Oxigênio', 'Gás carbônico', 'Hidrogênio', 'Metano'] },
    { q: 'Quantos dias tem o mês de fevereiro em anos comuns?', a: ['28 dias', '29 dias', '30 dias', '31 dias'] },
    { q: 'Qual é o menor número primo?', a: ['2', '0', '1', '3'] },
    { q: 'Que animal é conhecido como o rei da selva?', a: ['O leão', 'O tigre', 'O elefante', 'O urso'] },
    { q: 'Qual é a fórmula química da água?', a: ['H2O', 'CO2', 'O2', 'NaCl'] },
    { q: 'Em qual camada da atmosfera vivemos?', a: ['Troposfera', 'Estratosfera', 'Mesosfera', 'Exosfera'] },
    { q: 'Quanto é sete multiplicado por oito?', a: ['56', '54', '58', '48'] },
    { q: 'Qual instrumento tem muitas teclas e é tocado com os dedos?', a: ['Piano', 'Violão', 'Flauta', 'Bateria'] },
    { q: 'Quantos lados tem um triângulo?', a: ['3 lados', '2 lados', '4 lados', '5 lados'] },
    { q: 'Qual é o maior animal do mundo?', a: ['Baleia-azul', 'Elefante-africano', 'Tubarão-baleia', 'Girafa'] },
    { q: 'Em que país ficam as pirâmides de Gizé?', a: ['Egito', 'Grécia', 'Itália', 'México'] },
    { q: 'Como se chama a falta de chuva na terra por muito tempo?', a: ['Seca', 'Chuva', 'Geada', 'Nevasca'] },
    { q: 'Qual é o nome da estrela que ilumina o dia?', a: ['Sol', 'Lua', 'Vênus', 'Marte'] },
  ];

  // ── Nível médio ───────────────────────────────────────────
  const MEDIUM = [
    { q: 'Qual foi a primeira mulher a viajar para o espaço?', a: ['Valentina Tereshkova', 'Sally Ride', 'Mae Jemison', 'Yuri Gagarin'] },
    { q: 'Até 1923, qual era o nome antigo da cidade de Istambul, na Turquia?', a: ['Constantinopla', 'Alexandria', 'Bagdá', 'Roma'] },
    { q: 'Qual gás as plantas absorvem da atmosfera para realizar a fotossíntese?', a: ['Gás carbônico (dióxido de carbono)', 'Oxigênio', 'Nitrogênio', 'Metano'] },
    { q: 'Qual é o rio mais longo do mundo em extensão oficial?', a: ['Rio Nilo', 'Rio Amazonas', 'Rio Yangtzi', 'Rio Misisipi'] },
    { q: 'Quem escreveu a famosa obra literária "Dom Casmurro"?', a: ['Machado de Assis', 'José de Alencar', 'Jorge Amado', 'Clarice Lispector'] },
    { q: 'Quem formulou a teoria da relatividade?', a: ['Albert Einstein', 'Isaac Newton', 'Niels Bohr', 'Galileu Galilei'] },
    { q: 'Qual é o maior órgão do corpo humano?', a: ['Pele', 'Fígado', 'Cérebro', 'Coração'] },
    { q: 'Em que cidade grega nasceu a democracia?', a: ['Atenas', 'Esparta', 'Corinto', 'Tebas'] },
    { q: 'Qual metal é líquido em temperatura ambiente?', a: ['Mercúrio', 'Chumbo', 'Estanho', 'Ferro'] },
    { q: 'Qual é a moeda oficial do Japão?', a: ['Iene', 'Won', 'Yuan', 'Dólar'] },
    { q: 'Quem escreveu o livro "O Pequeno Príncipe"?', a: ['Antoine de Saint-Exupéry', 'Jules Verne', 'Lewis Carroll', 'Hans Christian Andersen'] },
    { q: 'Qual é o maior bioma brasileiro em extensão de área?', a: ['Amazônia', 'Caatinga', 'Pantanal', 'Pampa'] },
    { q: 'Em que ano o ser humano pisou na Lua pela primeira vez?', a: ['1969', '1965', '1972', '1958'] },
    { q: 'Qual camada da atmosfera nos protege dos raios ultravioleta?', a: ['Camada de ozônio', 'Troposfera', 'Ionosfera', 'Magnetosfera'] },
    { q: 'Qual cordilheira corta a América do Sul?', a: ['Cordilheira dos Andes', 'Cordilheira Central', 'Montanhas Rochosas', 'Serra do Mar'] },
    { q: 'Em que país começou a Revolução Industrial?', a: ['Inglaterra', 'França', 'Alemanha', 'Bélgica'] },
    { q: 'Qual ciência estuda os fósseis?', a: ['Paleontologia', 'Geologia', 'Astronomia', 'Botânica'] },
    { q: 'Qual é o planeta conhecido como o planeta vermelho?', a: ['Marte', 'Vênus', 'Mercúrio', 'Júpiter'] },
    { q: 'Quantos artigos tem a Declaração Universal dos Direitos Humanos?', a: ['30 artigos', '15 artigos', '21 artigos', '48 artigos'] },
    { q: 'Qual é a capital do estado do Acre?', a: ['Rio Branco', 'Porto Velho', 'Palmas', 'Boa Vista'] },
    { q: 'Qual cidade brasileira é conhecida como a capital da moda?', a: ['São Paulo', 'Curitiba', 'Recife', 'Salvador'] },
    { q: 'Qual é o único mamífero capaz de voar ativamente?', a: ['Morcego', 'Voador-do-solo', 'Toupeira', 'Preguiça'] },
    { q: 'Quem foi a primeira pessoa a viajar ao espaço?', a: ['Yuri Gagarin', 'Neil Armstrong', 'Laika', 'Valentina Tereshkova'] },
    { q: 'Qual é o menor estado brasileiro em área territorial?', a: ['Sergipe', 'Roraima', 'Tocantins', 'Alagoas'] },
    { q: 'Como se chama o estudo das estrelas e do universo?', a: ['Astronomia', 'Astrologia', 'Geometria', 'Biologia'] },
    { q: 'Qual é o principal componente do ar que respiramos?', a: ['Nitrogênio', 'Oxigênio', 'Gás carbônico', 'Vapor de água'] },
    { q: 'Em que cidade americana foi assinada a Declaração de Independência dos Estados Unidos?', a: ['Filadélfia', 'Nova York', 'Boston', 'Washington'] },
    { q: 'Qual é o menor oceano do mundo?', a: ['Oceano Ártico', 'Oceano Índico', 'Oceano Atlântico', 'Oceano Pacífico'] },
    { q: 'Qual é o nome do processo em que as plantas liberam vapor de água?', a: ['Transpiração', 'Evaporação', 'Filtração', 'Sublimação'] },
    { q: 'Qual é a capital do estado do Amazonas?', a: ['Manaus', 'Belém', 'Porto Velho', 'Rio Branco'] },
    { q: 'Qual navegador foi criado pela empresa Google?', a: ['Chrome', 'Firefox', 'Safari', 'Edge'] },
    { q: 'Qual é a capital do estado do Maranhão?', a: ['São Luís', 'Teresina', 'Fortaleza', 'Belém'] },
    { q: 'Quem pintou o teto da Capela Sistina?', a: ['Michelangelo', 'Leonardo da Vinci', 'Rafael', 'Donatello'] },
    { q: 'Qual é o maior animal terrestre da América do Sul?', a: ['Anta', 'Capivara', 'Anaconda', 'Tatu-bola'] },
  ];

  // ── Nível difícil ─────────────────────────────────────────
  const HARD = [
    { q: 'Em que ano ocorreu a fundação oficial de Brasília?', a: ['1960', '1956', '1964', '1970'] },
    { q: 'Qual cientista ganhou o Prêmio Nobel em duas áreas científicas diferentes (Física e Química)?', a: ['Marie Curie', 'Albert Einstein', 'Linus Pauling', 'Rosalind Franklin'] },
    { q: 'Qual é o menor país do mundo em área territorial?', a: ['Vaticano', 'Mônaco', 'San Marino', 'Liechtenstein'] },
    { q: 'Quantos fusos horários oficiais existem na Rússia?', a: ['11 fusos horários', '9 fusos horários', '7 fusos horários', '13 fusos horários'] },
    { q: 'Qual é o elemento químico mais abundante em todo o Universo?', a: ['Hidrogênio', 'Oxigênio', 'Carbono', 'Hélio'] },
    { q: 'Qual físico recebeu o Prêmio Nobel de Física em 1911?', a: ['Wilhelm Wien', 'Wilhelm Röntgen', 'Ernest Rutherford', 'Max Planck'] },
    { q: 'Qual é a unidade de potência no Sistema Internacional?', a: ['Watt', 'Joule', 'Pascal', 'Newton'] },
    { q: 'Que rio corta a cidade de Londres?', a: ['Rio Tâmisa', 'Rio Sena', 'Rio Tibre', 'Rio Danúbio'] },
    { q: 'Qual matemático grego é conhecido pelo teorema do triângulo retângulo?', a: ['Pitágoras', 'Euclides', 'Arquimedes', 'Fermat'] },
    { q: 'Em que ano foi assinado o Tratado de Versailles?', a: ['1919', '1914', '1918', '1923'] },
    { q: 'Qual é o maior tribunal penal internacional?', a: ['Tribunal Penal Internacional', 'Tribunal Internacional de Justiça', 'Corte Internacional de Justiça', 'Tribunal de Arbitragem das Nações Unidas'] },
    { q: 'Qual é a fórmula molecular do ozônio?', a: ['O3', 'O2', 'O4', 'O'] },
    { q: 'Em que cidade foi adotada a Declaração Universal dos Direitos Humanos, em 1948?', a: ['Paris', 'Londres', 'Genebra', 'Nova York'] },
    { q: 'Qual é a estrela mais próxima da Terra?', a: ['Sol', 'Proxima Centauri', 'Sirius', 'Alpha Centauri A'] },
    { q: 'Qual é a capital do Uzbequistão?', a: ['Tashkent', 'Bishkek', 'Dushanbe', 'Ashgabat'] },
    { q: 'Qual linha imaginária divide a Terra em hemisférios norte e sul?', a: ['Equador', 'Meridiano de Greenwich', 'Trópico de Câncer', 'Círculo Polar Ártico'] },
    { q: 'Qual é o metal mais abundante na crosta terrestre?', a: ['Alumínio', 'Ferro', 'Cobre', 'Ouro'] },
    { q: 'Em que ano foi publicada a primeira edição de "Dom Casmurro"?', a: ['1899', '1888', '1905', '1870'] },
    { q: 'Que civilização antiga ergueu as pirâmides de Gizé?', a: ['Os egípcios', 'Os gregos', 'Os romanos', 'Os persas'] },
    { q: 'Qual órgão do corpo humano produz a insulina?', a: ['Pâncreas', 'Fígado', 'Baço', 'Tireoide'] },
    { q: 'Quanto é a raiz quadrada de 144?', a: ['12', '14', '16', '11'] },
    { q: 'Qual é o maior país do mundo em área total?', a: ['Rússia', 'Canadá', 'China', 'Brasil'] },
    { q: 'Qual tratado criou o Mercosul?', a: ['Tratado de Asunción', 'Acordo de Alfândega', 'Protocolo de Ouro Preto', 'Acordo de Montevidéu'] },
    { q: 'Em que ano terminou a Segunda Guerra Mundial?', a: ['1945', '1943', '1946', '1944'] },
    { q: 'Qual é a unidade de energia no Sistema Internacional?', a: ['Joule', 'Watt', 'Caloria', 'Newton'] },
    { q: 'Qual era a capital do Império Brasileiro?', a: ['Rio de Janeiro', 'São Paulo', 'Salvador', 'Recife'] },
    { q: 'Em que ano entrou em vigor a Constituição Federal atual do Brasil?', a: ['1988', '1985', '1967', '1946'] },
    { q: 'Qual constelação é famosa no hemisfério sul?', a: ['Cruzeiro do Sul', 'Órion', 'Ursa Maior', 'Escorpião'] },
    { q: 'Qual é o número atômico do carbono?', a: ['6', '12', '8', '5'] },
    { q: 'Qual tag HTML define o título principal de uma página?', a: ['<h1>', '<title>', '<head>', '<p>'] },
    { q: 'Qual protocolo permite a uma página carregar recursos de outro domínio?', a: ['CORS', 'FTP', 'SMTP', 'DHCP'] },
    { q: 'Quem criou o sistema operacional Linux?', a: ['Linus Torvalds e a comunidade', 'Microsoft', 'Apple', 'Google'] },
    { q: 'Qual é o menor número primo maior que 2?', a: ['3', '2', '4', '7'] },
    { q: 'Em que país fica a estátua do Cristo Redentor?', a: ['Brasil', 'Portugal', 'Espanha', 'Argentina'] },
    { q: 'Qual oceano fica entre a África e a Austrália?', a: ['Oceano Índico', 'Oceano Atlântico', 'Oceano Pacífico', 'Oceano Ártico'] },
    { q: 'Qual é o maior lago de água doce do mundo em superfície?', a: ['Lago Superior', 'Lago Baikal', 'Lago Titicaca', 'Lago Michigan'] },
    { q: 'Qual é a principal causa do efeito estufa?', a: ['Os gases de efeito estufa', 'A chuva ácida', 'Os buracos na camada de ozônio', 'A maré alta'] },
    { q: 'Qual é a capital do Canadá?', a: ['Ottawa', 'Toronto', 'Vancouver', 'Montreal'] },
    { q: 'Qual instrumento mede a pressão atmosférica?', a: ['Barômetro', 'Termômetro', 'Higrômetro', 'Anemômetro'] },
    { q: 'Quantos vértices tem um tetraedro?', a: ['4 vértices', '3 vértices', '5 vértices', '6 vértices'] },
    { q: 'Qual cidade é a capital administrativa da África do Sul?', a: ['Pretória', 'Bruxelas', 'Cidade do Cabo', 'Lima'] },
    { q: 'Em que ano o euro passou a ser a moeda oficial da União Europeia?', a: ['1999', '2002', '1991', '2005'] },
    { q: 'Qual é a camada mais externa da atmosfera terrestre?', a: ['Exosfera', 'Troposfera', 'Estratosfera', 'Ionosfera'] },
  ];

  // ── Níveis ────────────────────────────────────────────────
  const LEVELS = [
    { id: 'easy', name: 'Fácil', count: 15, bank: EASY, hint: 'Conhecimento geral do dia a dia.' },
    { id: 'medium', name: 'Médio', count: 25, bank: MEDIUM, hint: 'História, geografia e ciência com um pouco mais de atenção.' },
    { id: 'hard', name: 'Difícil', count: 35, bank: HARD, hint: 'Para os verdadeiros mestres do Quiz.' },
  ];

  const TIME_PER_QUESTION = 30;

  let container = null;
  let level = null;
  let questions = [];
  let index = 0;
  let score = 0;
  let correct = 0;
  let wrong = 0;
  let streak = 0;
  let bestStreak = 0;
  let answered = false;
  let secondsLeft = TIME_PER_QUESTION;
  let timer = null;
  let advanceTimer = null;

  function clearAdvanceTimer() {
    clearTimeout(advanceTimer);
    advanceTimer = null;
  }

  function scheduleNext(delay) {
    clearAdvanceTimer();
    advanceTimer = setTimeout(() => {
      advanceTimer = null;
      next();
    }, delay);
  }

  // ── Sorteio ───────────────────────────────────────────────
  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  // Todas as alternativas são embaralhadas JÁ COM a marcação correta,
  // senão a posição 0 seria tratada como acerto depois do embaralhamento.
  function shuffledOptions(question) {
    return shuffle(question.a.map((text, i) => ({ text, correct: i === 0 })));
  }

  // ── Telas ─────────────────────────────────────────────────
  function renderIntro() {
    container.innerHTML =
      '<div class="quiz-game">' +
        '<div class="quiz-intro">' +
          '<p class="game-eyebrow">Desafio de conhecimento</p>' +
          '<h3>Quiz</h3>' +
          '<p>Escolha o nível. As perguntas e a ordem das alternativas são sorteadas a cada partida.</p>' +
        '</div>' +
        '<div class="quiz-levels">' +
          LEVELS.map(item =>
            '<button class="quiz-level" type="button" data-level="' + item.id + '">' +
              '<span class="quiz-level-name">' + item.name + '</span>' +
              '<span class="quiz-level-count">' + item.count + ' perguntas</span>' +
              '<span class="quiz-level-hint">' + item.hint + '</span>' +
            '</button>').join('') +
        '</div>' +
        '<div class="quiz-actions">' +
          '<button class="game-action-btn quiz-home" type="button">Voltar aos jogos</button>' +
        '</div>' +
      '</div>';

    container.querySelectorAll('.quiz-level').forEach(button => {
      button.addEventListener('click', () => start(button.dataset.level));
    });
    container.querySelector('.quiz-home').addEventListener('click', goHome);
  }

  function renderQuestion() {
    const question = questions[index];
    const options = shuffledOptions(question);
    const percent = Math.round((index / questions.length) * 100);

    container.innerHTML =
      '<div class="quiz-game quiz-game--play">' +
        '<div class="quiz-top">' +
          '<div class="quiz-stats">' +
            '<span>Progresso <strong>' + (index + 1) + '/' + questions.length + '</strong></span>' +
            '<span>Pontos <strong>' + score + '</strong></span>' +
            '<span>Acertos <strong>' + correct + '</strong></span>' +
          '</div>' +
          '<div class="quiz-progress"><span style="width:' + percent + '%"></span></div>' +
          '<p class="quiz-timer" data-state="' + (secondsLeft <= 10 ? 'low' : 'ok') + '">Tempo: ' + secondsLeft + 's</p>' +
        '</div>' +
        '<p class="quiz-level-tag">Nível ' + level.name + '</p>' +
        '<h3 class="quiz-question">' + question.q + '</h3>' +
        '<div class="quiz-options" role="group" aria-label="Alternativas">' +
          options.map((option, i) =>
            '<button class="game-action-btn quiz-option" type="button" data-option="' + i + '" data-correct="' + option.correct + '">' +
              '<span class="quiz-option-key" aria-hidden="true">' + String.fromCharCode(65 + i) + '</span>' +
              '<span class="quiz-option-text">' + option.text + '</span>' +
            '</button>').join('') +
        '</div>' +
        '<p class="quiz-feedback" role="status" aria-live="polite">Escolha uma alternativa.</p>' +
        '<div class="quiz-actions">' +
          '<button class="game-action-btn quiz-skip" type="button">Pular pergunta</button>' +
          '<button class="game-action-btn quiz-quit" type="button">Encerrar partida</button>' +
        '</div>' +
      '</div>';

    container.querySelectorAll('.quiz-option').forEach(button => {
      button.addEventListener('click', () => answer(button));
    });
    container.querySelector('.quiz-skip').addEventListener('click', skip);
    container.querySelector('.quiz-quit').addEventListener('click', () => finish(true));
  }

  function renderResult(quit) {
    const percent = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    const message = percent >= 90 ? 'Excelente! Você domina o assunto.'
      : percent >= 70 ? 'Muito bem! Quase lá.'
      : percent >= 50 ? 'Foi razoável, mas dá para melhorar.'
      : 'Continue estudando e tente de novo.';

    container.innerHTML =
      '<div class="quiz-game quiz-game--result">' +
        '<p class="game-eyebrow">Nível ' + level.name + '</p>' +
        '<h3>' + (quit ? 'Partida encerrada' : 'Resultado') + '</h3>' +
        '<div class="result-score">' + score + ' pontos</div>' +
        '<dl class="result-list quiz-result-list">' +
          '<div><dt>Acertos</dt><dd>' + correct + '</dd></div>' +
          '<div><dt>Erros</dt><dd>' + wrong + '</dd></div>' +
          '<div><dt>Aproveitamento</dt><dd>' + percent + '%</dd></div>' +
          '<div><dt>Melhor sequência</dt><dd>' + bestStreak + '</dd></div>' +
        '</dl>' +
        '<p class="quiz-message">' + message + '</p>' +
        '<div class="quiz-actions result-actions">' +
          '<button class="game-action-btn math-primary quiz-again" type="button">Jogar novamente</button>' +
          '<button class="game-action-btn quiz-change" type="button">Trocar de nível</button>' +
          '<button class="game-action-btn quiz-home" type="button">Voltar aos jogos</button>' +
        '</div>' +
      '</div>';

    container.querySelector('.quiz-again').addEventListener('click', () => start(level.id));
    container.querySelector('.quiz-change').addEventListener('click', renderIntro);
    container.querySelector('.quiz-home').addEventListener('click', goHome);
  }

  // ── Fluxo ─────────────────────────────────────────────────
  function goHome() {
    window.dispatchEvent(new CustomEvent('passatempo:home'));
  }

  function start(levelId) {
    level = LEVELS.find(item => item.id === levelId) || LEVELS[0];
    questions = shuffle(level.bank).slice(0, level.count);
    index = 0;
    score = 0;
    correct = 0;
    wrong = 0;
    streak = 0;
    bestStreak = 0;
    showQuestion();
  }

  function showQuestion() {
    answered = false;
    secondsLeft = TIME_PER_QUESTION;
    renderQuestion();
    startTimer();
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
      if (answered) return;
      secondsLeft -= 1;
      const timerEl = container.querySelector('.quiz-timer');
      if (timerEl) {
        timerEl.textContent = 'Tempo: ' + secondsLeft + 's';
        timerEl.dataset.state = secondsLeft <= 10 ? 'low' : 'ok';
      }
      if (secondsLeft <= 0) timeUp();
    }, 1000);
  }

  function lockOptions() {
    container.querySelectorAll('.quiz-option').forEach(button => { button.disabled = true; });
    const skipBtn = container.querySelector('.quiz-skip');
    if (skipBtn) skipBtn.disabled = true;
  }

  function showFeedback(text, state) {
    const feedback = container.querySelector('.quiz-feedback');
    if (!feedback) return;
    feedback.textContent = text;
    feedback.dataset.state = state;
  }

  function revealRight() {
    const right = container.querySelector('.quiz-option[data-correct="true"]');
    if (right) right.classList.add('is-correct');
  }

  function answer(button) {
    if (answered) return;
    answered = true;
    clearInterval(timer);
    lockOptions();

    if (button.dataset.correct === 'true') {
      const gained = 10 + Math.floor(secondsLeft / 3);
      score += gained;
      correct += 1;
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
      button.classList.add('is-correct');
      showFeedback('Correto! +' + gained + ' pontos.', 'correct');
    } else {
      wrong += 1;
      streak = 0;
      button.classList.add('is-wrong');
      revealRight();
      showFeedback('Resposta incorreta. A alternativa correta está destacada.', 'wrong');
    }

    scheduleNext(1500);
  }

  function timeUp() {
    if (answered) return;
    answered = true;
    clearInterval(timer);
    lockOptions();
    wrong += 1;
    streak = 0;
    revealRight();
    showFeedback('Tempo esgotado! A alternativa correta está destacada.', 'wrong');
    scheduleNext(1900);
  }

  function skip() {
    if (answered) return;
    answered = true;
    clearInterval(timer);
    lockOptions();
    wrong += 1;
    streak = 0;
    revealRight();
    showFeedback('Pergunta pulada.', 'wrong');
    scheduleNext(1100);
  }

  function next() {
    index += 1;
    if (index >= questions.length) { finish(false); return; }
    showQuestion();
  }

  function finish(quit) {
    clearInterval(timer);
    timer = null;
    clearAdvanceTimer();
    renderResult(quit);
    if (!quit && questions.length) {
      const won = correct / questions.length >= 0.7;
      window.dispatchEvent(new CustomEvent('passatempo:result', { detail: { result: won ? 'win' : 'loss' } }));
    }
  }

  // ── Ciclo de vida ─────────────────────────────────────────
  function mount(el) {
    container = el;
    renderIntro();
  }

  function unmount() {
    clearInterval(timer);
    timer = null;
    clearAdvanceTimer();
    if (container) container.innerHTML = '';
    container = null;
    questions = [];
  }

  // Ponte de testes: tamanho dos bancos de perguntas por nível.
  function bankSizes() {
    return LEVELS.map(level => ({ id: level.id, name: level.name, perRound: level.count, bank: level.bank.length }));
  }

  return { mount, unmount, bankSizes };
})();
