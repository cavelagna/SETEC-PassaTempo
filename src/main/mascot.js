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
const MASCOT_MESSAGES = window.MASCOT_MESSAGES = {
  home: [
    'Oi! Que tal dar uma pausa e jogar alguma coisa?',
    'Bem-vindo ao PassaTempo! Hoje é um ótimo dia para exercitar a mente.',
    'Psst... já escolheu seu próximo desafio?',
    'Tem um montão de jogos esperando por você!',
    'Pode ficar à vontade. Aqui, o tempo passa brincando.',
    'Estou pronto para jogar. E você?',
    'Vamos encontrar um jogo que combine com seu momento?',
    'Entre um desafio e outro, não se esqueça de respirar!',
    'Café, cobertor e um bom jogo. Combinação perfeita!',
    'Sabia que jogar também é exercitar a memória?',
    'Se travar naquela fase, respire. Eu torço por você!',
    'Hoje o placar está 0 a 0. Vamos jogar?',
    'Dizem que os melhores lances vêm com calma.',
    'Escolhe um jogo aí que eu fico de olho no cronômetro!',
    'Meu cachecol rendeu hoje. E o seu dia?',
    'Gelo? Aqui não! Aqui é diversão.',
    'Tem jogo pra pensar, pra rir e pra relaxar. Todos seus!',
    'Se bater a saudade de vencer, vem comigo!',
    'Shhh... os tabuleiros estão descansando. Acorde um!',
    'Que tal bater seu próprio recorde hoje?',
    'Aqui o tempo passa rápido. Aproveite!',
    'Pinguim de cachecol é o melhor tipo de companheiro. Confia.',
  ],
  enterGame: [
    'Opa! Vamos nessa?',
    'Preparando as patinhas para o desafio!',
    'Concentração ativada. Boa sorte!',
    'Hora de testar seus poderes!',
    'Vamos ver como você se sai!',
    'Pronto? Então, que comece a diversão!',
    'Esse parece interessante. Vamos jogar!',
    'Aperta o botão e assume o controle!',
    'Escolhi esse jogo só pra ver você ganhar.',
    'Aposto que você já sabe jogar isso melhor que eu!',
    'Respira fundo. O jogo começou!',
    'Vamos lá! Cada partida conta uma história.',
    'Já aqueci o tabuleiro pra você.',
    'Contagem regressiva... já!',
    'Pode contar comigo nas horas difíceis.',
    'Confio em você mais do que em sorteio de dados!',
    'Se travar, chama. Se ganhar, comemora comigo!',
    'Que os melhores lances vençam!',
    'Chegou a hora do show!',
    'Vai ser épico. Eu sinto isso.',
  ],
  exitGame: [
    'Voltando para escolher outra aventura?',
    'Foi divertido! Qual será o próximo?',
    'Até a próxima rodada!',
    'Vou ficar por aqui, cuidando dos jogos.',
    'Guardando as peças com carinho...',
    'Boa! Descansar também faz parte do jogo.',
    'Se quiser voltar, estarei aqui. Sem pressa!',
    'Gostei dessa partida. Bora escolher outra?',
    'Até o próximo desafio!',
    'Já fechou o tabuleiro? Então vamos explorar!',
    'A home também é um lugar legal. Confere aí!',
    'Se saiu no auge? Sábia decisão... ou sorte. Hehe!',
    'Missão dada é missão jogada. Até logo!',
    'Descansa as patinhas. Você merece.',
    'O catálogo continua lá quando você voltar.',
    'Deixo a luz do tabuleiro acesa pra você.',
    'Foi ótimo jogar com você hoje!',
    'Guardo seu recorde com segurança. Pode confiar!',
    'Toda despedida é um até já!',
    'Vou conferir se os dados estão em ordem...',
  ],
  victory: [
    'Aí sim! Mandou muito bem!',
    'Sabia que você conseguia!',
    'Vitória merecida. Hora de comemorar!',
    'Que jogada incrível!',
    'Estou pulando de alegria aqui!',
    'Nem o gelo derrete tamanha habilidade!',
    'Recorde novo? Guardo com orgulho!',
    'Falei que ia dar certo!',
    'Você jogou muito. Quero ver de novo!',
    'Isso merece um troféu de gelo!',
  ],
  defeat: [
    'Faz parte! Toda tentativa ensina alguma coisa.',
    'Quase lá! Que tal tentar novamente?',
    'Não desanime. O próximo desafio está esperando.',
    'Até os pinguins escorregam de vez em quando!',
    'Respira. A revanche vai ser sua!',
    'Errar é treinar disfarçado.',
    'Se caiu, levanta e joga de novo!',
    'A derrota de hoje é o treino de amanhã!',
    'Ainda dá tempo de virar o jogo!',
    'O importante é se divertir. E você se diverte!',
  ],
  idle: [
    'Ainda aí? O tabuleiro não foge.',
    'Sem pressa: o PassaTempo espera por você.',
    'Uma dica: às vezes o melhor lance é respirar fundo.',
    'Se preferir, depois a gente joga. Eu espero.',
    'Vou dormir uma soneca. Me acorda se precisar!',
    'Enquanto você pensa, conto flocos de neve. Um, dois...',
    'Paciência é meu nome do meio. Pinguim Paciência.',
    'Se travou a cabeça, um jogo rápido ajuda!',
  ],
  click: [
    'Precisa de uma dica? Escolha um jogo e divirta-se!',
    'Estou aqui! Quando quiser, é só jogar.',
    'Brrr... que frio! Mas jogar aquece o coração.',
    'Meu cachecol é da cor do PassaTempo. Combina, né?',
    'Quer saber um segredo? Eu jogo muito bem esconde-espere.',
    'Toque em Jogar e eu vibro junto!',
    'Sou pequeno, mas torço muito alto!',
    'Vamos fazer desse momento o melhor do dia!',
  ],

  // ── Falas específicas por jogo (mínimo 20 cada) ─────────────
  minesweeper: [
    'Cuidado com os próximos passos!',
    'Os números estão tentando contar um segredo.',
    'Pense bem antes de revelar outra casa.',
    'Ufa! Essa foi por pouco!',
    'Cada número é uma pista. Vamos investigar!',
    'Bandeirinha levantada é território protegido.',
    'Não confie em nenhum quadrado. Nenhum mesmo!',
    'O primeiro clique é sempre o mais corajoso.',
    'Se sudou frio agora, foi só o vento. Hehe!',
    'Contorna as minas como eu contorno icebergs!',
    'Um clique errado e... bem, você já sabe.',
    'Campo minado é dedução, não sorte. Maior parte!',
    'Os cantos costumam ser traiçoeiros.',
    'Já contei as minas. Mas não vou falar. Hehe!',
    'Que casa você escolheria? Eu... a mais segura!',
    'Quando a dúvida apertar, marque bandeira.',
    'Você tem cara de quem nunca pisou numa mina.',
    'Dedução elegante é quase poesia!',
    'Se suou, foi só o esforço. Continue!',
    'Cada campo limpo é uma vitória pequena!',
  ],
  sudoku: [
    'Cada número tem seu lugar!',
    'Paciência e lógica: essa é a combinação.',
    'Vamos encontrar o número que está faltando?',
    'Olhe para a linha, a coluna e o bloco!',
    'Um bom raciocínio vale mais que um chute.',
    'Comece pelos números que já aparecem muito.',
    'Lápis mental! Não precisa apagar nada.',
    'Sudoku é comigo mesmo: muita paciência!',
    'Quando travar, mude de bloco. Funciona!',
    'Nove números, infinitas descobertas.',
    'Cada quadrado preenchido é mini-vitória.',
    'Não tem pressa. O Sudoku não tem cronômetro!',
    'Cê já considerou os cantos? Sempre escondem pistas!',
    'Um número por vez, e a grade se completa.',
    'Nem eu que sei nadar em tantos números!',
    'Aquele 7 ali parece perdido... ou não!',
    'Confiar na lógica nunca decepciona.',
    'Marque os candidatos mentais antes de preencher.',
    'Resolver Sudoku esquenta mais que cachecol!',
    'Se travou, respire. A grade sempre revela um caminho.',
  ],
  two048: [
    'Dois números iguais podem virar algo maior!',
    'Planeje os próximos movimentos.',
    'Vamos chegar ao 2048?',
    'Essa combinação foi boa!',
    'Pense alguns movimentos à frente!',
    'Canto é estratégia: escolha um e defenda!',
    'Não deixe o tabuleiro lotar!',
    'Eu já cheguei no 512 uma vez. Foi épico!',
    'Deslizar sem pensar é pedir confusão!',
    'Cada fusão bem feita é uma mini-festa!',
    'Quanto mais quadros grandes, mais espaço livre precisa!',
    'Se o 2 aparecer no canto ruim, respire!',
    'Combine o máximo que puder numa jogada só!',
    'Mantenha os números grandes organizados!',
    '2048 é matemática com sotaque de quebra-cabeça!',
    'Sabe aquele movimento perfeito? Ele existe!',
    'Deslize com convicção!',
    'Uma peça 2048 é possível. Confio em você!',
    'Se travar, lembre: sempre cabe um movimento!',
    'Combinação dupla = pontos em dobro de emoção!',
  ],
  snake: [
    'Cuidado para não morder o próprio rabo!',
    'Quanto maior, mais espaço você precisa!',
    'Coma sem pressa. A maçã não foge!',
    'Se enrolar, não foi minha culpa! Hehe!',
    'Perto da parede = coração acelerado!',
    'Estratégia de círculo salva vidas!',
    'Cada maçã é um ponto, cada curva é um risco!',
    'Você tá grandes! Preciso de cachecol maior...',
    'Aquele risco não valeu a pena, né?',
    'Velocidade sobe? Foco redobrado!',
    'Prefira espaço aberto a atalhos arriscados.',
    'Cobra estressada faz curva errada!',
    'Se enrolou de propósito? Também já fiz isso!',
    'A parede é amiga, mas às vezes morde!',
    'Sabe qual é o lance? Planejar antes de acelerar!',
    'Cada partida rende história nova!',
    'Eu ia dizer algo, mas esqueci. Coisa de cobra!',
    'Perder por pouco dói. Mas chama revanche!',
    'Foco na cauda... digo, na maçã!',
    'Coma bem, cresça bem, viva bem!',
  ],
  chess: [
    'Pense no plano do adversário também!',
    'Proteja seu rei como eu protejo meu cachecol!',
    'Cavalo no canto é cavalo triste.',
    'Controle o centro e o jogo se abre!',
    'Já vi esse lance em partida famosa!',
    'Torre na última fileira fala muito alto!',
    'Peões são a alma do xadrez!',
    'Roque cedo, sono tranquilo!',
    'Cuidado com garfos... os de xadrez, claro!',
    'Bispo em diagonal longa muda a partida!',
    'Não subestime a dama adversária!',
    'Xeque! Um nome pequeno, efeito enorme!',
    'Sacrifício bem pensado vale ouro!',
    'Cê tá vendo o mate em dois? Eu vejo!',
    'Peão promovido muda tudo!',
    'Antes de mover, olhe todo o tabuleiro!',
    'Xadrez é conversa silenciosa de peças!',
    'Rei no meio = festa pro adversário!',
    'Um lance por vez, mas pense em três!',
    'Vence quem pensa melhor, não quem corre mais!',
  ],
  checkers: [
    'Capturar é obrigatório. Estratégia também!',
    'Chegar no fundo virou dama! Aí sim!',
    'Cuidado com saltos duplos!',
    'Peça no canto é peça protegida!',
    'Damas é o primo animado do xadrez!',
    'Ceda peça com sabedoria, não por pressa!',
    'Aquele salto vai ser espetacular!',
    'Dominar o centro é dominar o jogo!',
    'Já levei captura dupla. Dói até hoje!',
    'Cada peça perdida conta uma história!',
    'Salte com convicção!',
    'Dama anda pra trás: é a promoção dos sonhos!',
    'Trocas favoráveis valem o clique!',
    'Vi uma jogada boa ali... digo, nada!',
    'Antecipe onde o adversário vai saltar!',
    'Linha de trás é sua base. Proteja!',
    'Cada salto duplo merece palmas!',
    'Damas ensina: às vezes recuar é avançar!',
    'Você tem cara de campeão de damas!',
    'Foco! Uma distração custa uma peça!',
  ],
  memory: [
    'Eu tenho memória de elefante. E de pinguim!',
    'Anote mentalmente onde estava cada par!',
    'Essa carta te lembra algo?',
    'Quantos pares você já achou?',
    'Errar de propósito pra ver cartas também é tática!',
    'Memória afiada, vitória garantida!',
    'Onde estava aquela carta? Eu sei... mas não falo!',
    'Cada virada conta uma história!',
    'Concentra! Os pares adoram se esconder!',
    'Se travou, respira e olhe de novo!',
    'Cartas iguais se encontram sempre!',
    'Já vi esse par antes... foi só agora!',
    'Sequência de acertos? Tô impressionado!',
    'Esse jogo é ginástica pro cérebro!',
    'Vai uma dica? Confie na primeira lembrança!',
    'Com calma, os pares aparecem!',
    'Eu esqueço onde deixei o gelo, mas não o par!',
    'Foco total. O tabuleiro confia em você!',
    'Pares encontrados sorriem pra você!',
    'Lembre antes de vire. Economize jogadas!',
  ],
  visualseq: [
    'Observe com atenção! Vai ficar mais difícil!',
    'A sequência cresceu! Você consegue!',
    'Olho no alvo... digo, nas figuras!',
    'Memorize a ordem, eu confio em você!',
    'Essa fase tá?puxada, mas dá!',
    'Repetir é treinar. Errar é aprender!',
    'Quanto mais fases, mais emoção!',
    'Consegue ver o padrão? Eu quase vejo!',
    'Não perca o ritmo!',
    'Um erro não define a partida!',
    'Sua memória visual tá afiada hoje!',
    'Cada figura tem seu lugar!',
    'Vou fechar um olho pra te dar sorte!',
    'Sabe aquele instante "ah, agora sei"? Vem aí!',
    'Cronômetro correndo? Foco!',
    'Você tá quase batendo o recorde!',
    'Respire e repita mentalmente!',
    'Sequência longa? Isso é treino de campeão!',
    'Memorizar é meu superpoder secreto!',
    'Uma figura por vez, sempre!',
  ],
  simon: [
    'Siga a luz! Ela nunca mente!',
    'Verde, vermelho, amarelo, azul... onde você tá?',
    'A sequência cresceu! Respira e repete!',
    'Simon é teste de memória e de nervo!',
    'Cada rodada é um recorde novo!',
    'Os sons ajudam! Cante junto!',
    'Errou? O Simon é gente boa, deixa tentar de novo!',
    'Foco! A luz volta a acender!',
    'Já cheguei na rodada 9. Uma vez. Foi épico!',
    'Ritmo acelerando? Eu também sinto!',
    'Aquele painel azul tá chamando você!',
    'Ouça com atenção antes de repetir!',
    'Simon é meu jogo favorito de gelo!',
    'Cada cor tem seu tom! Apreça a melodia!',
    'Você tá quase batendo seu recorde!',
    'Concentre-se! A sequência é sua amiga!',
    'Cada rodada vencida merece palmas!',
    'Painéis acendem, você brilha!',
    'Não tem pressa! Simon é paciência!',
    'Sigo a luz, sigo o som, sigo você!',
  ],
  tictactoe: [
    'Clássico das ruas! Onde vai jogar?',
    'O centro é sempre boa pedida!',
    'Cuidado com as diagonais!',
    'Velha de novo? Partida revanche!',
    'Xis ou bolinha? Qual é a sua?',
    'Três em linha e vitória na certa!',
    'Antecipe o lance do adversário!',
    'Bloquear também é jogar bem!',
    'Esse jogo ensina: às vezes empate é justo!',
    'Cantos abertos são oportunidades!',
    'Já joguei isso na neve. Com pedrinhas!',
    'Tá pensando bem? Eu também!',
    'Aquele X ali tá fazendo planos...',
    'Dois em linha é quase vitória!',
    'Não deixe o adversário fechar a linha!',
    'Jogo da velha: simples e genial!',
    'Você tem cara de quem nunca perdeu isso!',
    'Sabe quem ganha? Quem se diverte mais!',
    'Cada casa conta uma jogada!',
    'Empate também é respeito entre mestres!',
  ],
  solitaire: [
    'Organize as cartas como eu organizo peixes!',
    'Rei solitário no espaço vazio abre o jogo!',
    'Alternar cores é a chave!',
    'O Ás é o primeiro passo da glória!',
    'Carta escondida? Vem aí surpresa!',
    'Movimentos extras valem ouro!',
    'Vai uma carta pro reservatório ou pra fundação?',
    'Paciência é o nome do jogo. Literalmente!',
    'Cada naipe completo é uma festa!',
    'Do Rei ao Ás, tudo tem seu lugar!',
    'Cartas empilhadas, mente organizada!',
    'Se travou, mexa no descarte!',
    'Você tá com sorte hoje! Sinto!',
    'O segredo? Pensar antes de virar!',
    'Naipe completo = troféu mental!',
    'Carta por carta, a vitória se constrói!',
    'Paciência combina com cachecol, né?',
    'Já zerei esse jogo. Uma vez. Hehe!',
    'Reserve espaço pra fundações!',
    'Cartas na mão, mente tranquila!',
  ],
  quickcalc: [
    'Conta mental: meu tipo favorito de exercício!',
    'Rápido! Quanto é 7 × 8? ... 56! Ufa!',
    'O tempo corre, mas a lógica ajuda!',
    'Cada acerto é um ponto pra sua mente!',
    'Multiplicar é somar com pressa!',
    'Respira e calcule. O número aparece!',
    'Você tá voando nos cálculos!',
    'Errar um sinal custa caro, hein!',
    'Cálculo rápido esquema a cabeça!',
    'Tabuada na ponta da língua!',
    'Quanto mais rápido, mais pontos!',
    'Contas na cabeça, sorriso no rosto!',
    'Bateu o recorde? Tô vendo!',
    'Some, subtraia, multiplique! Vence quem foca!',
    'Matemática é meu segundo idioma!',
    'Calculou mentalmente? Você tá brilhando!',
    'Não desarme no meio da conta!',
    'O tempo tá curto! Confie no instinto!',
    'Cada dígito certo merece palmas!',
    'Velocidade + precisão = vitória!',
  ],
  timestable: [
    'Tabuada é o alicerce da matemática!',
    'Quanto é 6 × 7? Sem pressa!',
    'Multiplicar é somar estiloso!',
    'A tabuada do 9 tem truques mágicos!',
    'Cada resposta certa fortalece a memória!',
    'Você tá dominando a tabuada!',
    'Multiplicação é brincadeira quando treina!',
    'O 7 é o mais teimoso, mas você domina!',
    'Praticar hoje é vencer amanhã!',
    'Quanto mais prática, mais rapidez!',
    'A conta na ponta do lápis!',
    'Cada tabuada é uma porta que abre!',
    'Números multiplicados, neurônios felizes!',
    'Tá difícil? O 11 e o 12 também resistiram!',
    'Sabe multiplicar? Sabe reduzir esforço!',
    'Multiplicar bem vale prêmio!',
    'Confie na tabuada. Ela nunca falha!',
    'Resultado certo = sorriso certo!',
    'Tabuada e cachecol: meus dois amores!',
    'Vai uma dica? Decore os quadrados!',
  ],
  numberchallenge: [
    'Combine os números e chegue ao resultado!',
    'Quatro números, infinitas possibilidades!',
    'Multiplicação antes, ou talvez divisão?',
    'Use cada número só uma vez!',
    'Esse desafio é para mentes afiadas!',
    'Parênteses também são seus amigos!',
    'Já vi uma solução genial ali...',
    'Errar a ordem muda tudo!',
    'Somar é fácil. Combinar é arte!',
    'Você tá muito perto da solução!',
    'Cada combinação conta!',
    'Não desista! O número final aparece!',
    'Desafio numérico é xadrez da matemática!',
    'Tá difícil? Eu também travei uma vez!',
    'Quase! Ajuste a ordem das operações!',
    'Divida pra simplificar!',
    'Encontrou? Comemore alto!',
    'Cada desafio resolvido é um troféu!',
    'A ordem das operações é seu mapa!',
    'Sua mente tá afiada hoje!',
  ],
  crossword: [
    'Palavras cruzadas: vitamina pro vocabulário!',
    'Essa dica tá me cutucando...',
    'Horizontal ou vertical? Ambas valem!',
    'Preencha o que souber, o resto se encaixa!',
    'Palavra longa? Comece pelas letras óbvias!',
    'Cada cruzamento é uma pista dupla!',
    'Já sei essa! ...digo, você sabe!',
    'Letra por letra, a grade se completa!',
    'Vocabulário afiado, cruzamento fácil!',
    'Se travou, vá para outra dica!',
    'Palavras cruzadas ensinam paciência!',
    'Tá difícil? Volte depois. As letras esperam!',
    'Cada palavra certa merece palmas!',
    'As letras se abraçam nos cruzamentos!',
    'Dica genérica? Pense em sinônimos!',
    'Complete com confiança!',
    'Quase tudo preenchido? Tô orgulhoso!',
    'Cruzadas são quebra-cabeças de palavras!',
    'A grade confia no seu vocabulário!',
    'Letra repetida? Confira os cruzamentos!',
    'Uma palavra puxa a outra!',
  ],
  wordsearch: [
    'Caça às palavras! Eu adoro uma boa caçada!',
    'As palavras se escondem bem!',
    'Procure em todas as direções!',
    'De trás pra frente também conta!',
    'Diagonal é onde moram as difíceis!',
    'Achei uma! ...digo, achei em espírito!',
    'Cada palavra marcada é uma pequena vitória!',
    'Corra os olhos com calma!',
    'Letra por letra, a palavra aparece!',
    'Marcação dupla? Confira as letras!',
    'Vocabulário em campo, olhar de águia!',
    'As letras se repetem de propósito. Estratégia!',
    'Palavras longas são as mais visíveis!',
    'Praticar caça-palavras afia o olhar!',
    'Tá difícil? Respire e mude a direção!',
    'Cada linha esconde segredos!',
    'Marque com convicção!',
    'Já achou todas? Uau!',
    'A última palavra sempre se esconde melhor!',
    'Cuidado com as pegadinhas de letras repetidas!',
    'Caçar palavras esquenta menos que neve!',
  ],
  hangman: [
    'Letra por letra, a palavra aparece!',
    'Vogais primeiro? Estratégia clássica!',
    'Cuidado com as tentativas!',
    'Essa palavra tem segredos!',
    'Pense no tema antes de chutar!',
    'Consoantes difíceis chegam depois!',
    'Cada letra certa é um passo!',
    'A forca é preta, mas o jogo é divertido!',
    'Errou? Ainda tem mais chances!',
    'Tá no sentido da palavra? Eu confio!',
    'Chutes certeiros economizam vidas!',
    'Palavra curta nem sempre é fácil!',
    'A dica está nas letras que você já tem!',
    'Foco! A palavra quer ser descoberta!',
    'Letras repetidas contam uma vez só!',
    'Você tá quase montando tudo!',
    'Silabas longas assustam, mas vencem!',
    'Forca é desafio de vocabulário e frieza!',
    'Errei uma vez. Foi em "k". Nunca mais!',
    'Complete e comemore comigo!',
  ],
  blockpuzzle: [
    'Encaixe as peças com precisão!',
    'Complete linhas, libere espaço!',
    'Quatro linhas de uma vez? Bônus!',
    'Gire com sabedoria!',
    'A peça I é a mais valiosa!',
    'Pense onde a próxima peça vai cair!',
    'Espaço livre é vida!',
    'Guardar a peça certa salva partidas!',
    'Velocidade sobe? Foco redobrado!',
    'Encaixe perfeito = pontos em dobro!',
    'Não deixe a pilha subir demais!',
    'Cada linha é um mini troféu!',
    'Tá rápida a queda? Ajuste o ritmo!',
    'Blocos empilhados, mente organizada!',
    'Aquele vão ali tá pedindo uma peça!',
    'Rotação certa vale mais que pressa!',
    'Se travou, use a próxima peça com sabedoria!',
    'Tetris é equilíbrio entre velocidade e plano!',
    'Você tá jogando muito!',
    'Complete a linha e vibre comigo!',
  ],
  breakout: [
    'Rebata com precisão!',
    'Os blocos lá no alto valem mais!',
    'Bola rápida? Olho no pincel!',
    'Não deixe a bola passar!',
    'Cada bloco destruído é um passo!',
    'Ângulo fechado muda tudo!',
    'A vantagem tá no meio da plataforma!',
    'Quase! A bola escorregou!',
    'Quebra tudo e vire o campeão!',
    'Rebote lateral é uma arte!',
    'Bola presa em cima? Cuidado!',
    'A cada fase, a bola acelera!',
    'Foco na bola, não nos blocos!',
    'Vidas são preciosas!',
    'Ângulo agudo = bola veloz!',
    'Você tá rebatendo tudo!',
    'Plataforma firme, vitória certa!',
    'O último bloco é sempre o mais escondido!',
    'Espere a bola descer antes de mover!',
    'Breakout é tênis espacial!',
  ],
  quiz: [
    'Leia com atenção antes de responder!',
    'Confie no seu conhecimento!',
    'Não sabe? Elimine as absurdas!',
    'O tempo corre! Mas o pânico não ajuda!',
    'Cada acerto é um ponto pro seu orgulho!',
    'Alternativas parecidas escondem detalhes!',
    'Você tá indo muito bem!',
    'Errou? A próxima te espera!',
    'Quiz é prova disfarçada de brincadeira!',
    'Leia duas vezes, responda uma!',
    'Qual nível você escolheu? Coragem ou ousadia?',
    'Conhecimento é poder. E pontos!',
    'Quase! A resposta estava na ponta!',
    'Certeza absoluta? Confira de novo!',
    'Cada tema ensina algo novo!',
    'Respire e leia de novo!',
    'Tá difícil? O difícil é aqui que a gente aprende!',
    'Você tá com cara de quem acerta tudo!',
    'Chute consciente vale mais que pânico!',
    'Final do quiz? Guardo o troféu!',
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

// Falas gerais para jogos sem categoria própria (usadas como fallback)
MASCOT_MESSAGES.playing = [
  'Hmm... essa merece um pouco de reflexão.',
  'Calma, pense com carinho!',
  'Você consegue. Um movimento de cada vez.',
  'Boa jogada!',
  'Está ficando interessante!',
  'Não tenha pressa. O importante é se divertir.',
  'Quer tentar uma estratégia diferente?',
  'Estou torcendo por você!',
  'O tabuleiro respeita quem pensa!',
  'Já acompanhei partidas menos emocionantes!',
];

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
