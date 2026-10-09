## REGRAS OFICIAIS DO PROJETO -- SETEC-PassaTempo


## 1. Principios fundamentais

Estas regras são obrigatórias para qualquer IA ou desenvolvedor que analise, modifique, corrija ou crie funcionalidades no projeto SETEC-PassaTempo.

O objetivo é preservar a arquitetura existente, garantir a qualidade do código, evitar regressões e entregar aplicações confiáveis, revisadas e consistentes.

A IA deve atuar com a postura de um desenvolvedor sênior experiente, priorizando precisão, análise, segurança, manutenção e qualidade acima da velocidade de implementação.

Nenhum código deve ser considerado correto apenas porque parece funcionar. Toda alteração precisa ser analisada, revisada e validada de acordo com as possibilidades disponíveis.

## 2. Tecnologias permitidas

O projeto deve utilizar exclusivamente as seguintes tecnologias para sua implementação:

HTML para estruturação.
CSS para apresentação visual e estilos.
JavaScript puro (Vanilla JavaScript) para lógica, interações e funcionalidades.

Não introduzir frameworks, bibliotecas, pré-processadores, ferramentas de compilação, dependências de terceiros ou outras tecnologias sem autorização explícita.

A solução deve respeitar as capacidades nativas do navegador e os padrões já adotados pelo projeto.

## 3. Respeito absoluto à estrutura existente

O site já possui uma estrutura, uma organização de arquivos, padrões visuais, funcionalidades compartilhadas e convenções próprias.

A IA deve trabalhar dentro dessa estrutura, sem criar uma arquitetura paralela ou reorganizar o projeto por iniciativa própria.

Antes de alterar qualquer arquivo, deve:

Identificar sua localização e sua finalidade.
Entender como ele se relaciona com os demais arquivos.
Verificar quais funcionalidades dependem dele.
Identificar os padrões existentes de implementação.
Reutilizar os mecanismos existentes sempre que forem adequados.

Não criar arquivos, pastas, componentes, sistemas alternativos ou estruturas redundantes quando a estrutura atual já atender à necessidade.

Qualquer mudança estrutural deve ter justificativa técnica clara e autorização quando representar uma alteração significativa na organização existente.

## 4. Leitura e compreensão obrigatórias

A IA não deve implementar mudanças com base apenas no nome de um arquivo, em trechos isolados de código, em suposições ou em uma compreensão superficial do projeto.

Antes de modificar uma aplicação, deve estudar os arquivos relevantes de forma progressiva, compreendendo seu funcionamento real.

Isso inclui, conforme a necessidade:

HTML e elementos que compõem a interface.
CSS e regras de apresentação.
JavaScript e lógica da aplicação.
Eventos, estados, temporizadores e mecanismos de interação.
Recursos visuais, imagens, sons e demais arquivos utilizados.
Integrações com a estrutura principal do site.
Regras de navegação, inicialização, reinicialização e encerramento.
Dependências com outras aplicações e funcionalidades compartilhadas.

A análise deve abranger todos os arquivos relevantes para a alteração. Se o comportamento depender de outros arquivos, eles também deverão ser examinados.

Quando não houver informações suficientes para compreender uma funcionalidade com segurança, a IA deve investigar mais ou solicitar esclarecimentos. Não deve preencher lacunas com invenções.

## 5. Cada jogo é uma aplicação que precisa ser compreendida

Os jogos existentes em src/main/games/ devem ser tratados individualmente, respeitando suas regras, seus objetivos e seus mecanismos específicos.

Antes de alterar um jogo, a IA deve compreender:

Seu objetivo e suas regras.
Como a partida começa e termina.
Como as ações do jogador são processadas.
Como os estados e as pontuações são controlados.
Como funcionam erros, acertos, derrotas, vitórias e reinicializações, quando aplicáveis.
Como a interface responde às ações do usuário.
Como o jogo utiliza imagens, sons e outros recursos.
Como ele se integra ao restante do site.

Não presumir que dois jogos semelhantes funcionam da mesma maneira.

Não transferir regras, comportamentos ou soluções de um jogo para outro sem verificar se são realmente compatíveis.

Qualquer correção deve preservar as regras originais do jogo, exceto quando a solicitação exigir explicitamente uma mudança de comportamento.

## 6. Proibição de publicar código sem revisão

Nenhuma alteração deve ser considerada pronta para publicação sem uma revisão técnica.

A IA deve revisar o código que produziu, mesmo quando a mudança parecer pequena, simples ou óbvia.

A revisão deve procurar, no mínimo:

Erros de sintaxe.
Referências a elementos, variáveis ou funções inexistentes.
Problemas de escopo e inicialização.
Erros de lógica e condições incorretas.
Eventos duplicados ou não registrados.
Problemas com estados, pontuação, temporizadores e reinicializações.
Falhas de integração entre HTML, CSS e JavaScript.
Comportamentos inesperados em situações extremas.
Regressões em funcionalidades existentes.
Problemas de responsividade e acessibilidade pertinentes à alteração.
Código duplicado, desnecessário ou incompatível com os padrões existentes.

Sempre que possível, a IA deve realizar verificações efetivas, executar testes relevantes e examinar os resultados.

Se não tiver acesso ao navegador, ao ambiente de execução ou aos meios necessários para testar, deve informar essa limitação com transparência.

Nunca afirmar que um código foi executado, testado ou validado quando isso não aconteceu.

A revisão estática não deve ser apresentada como se fosse um teste de execução real.

## 7. Prevenção de alucinações e informações inventadas

A IA deve distinguir claramente entre fatos verificados, hipóteses e informações desconhecidas.

É proibido:

Inventar funções, arquivos, elementos HTML, APIs ou comportamentos existentes.
Afirmar que uma funcionalidade está implementada sem verificar o código.
Presumir que um arquivo possui determinado conteúdo sem examiná-lo.
Inventar resultados de testes ou declarar sucesso sem evidências.
Alterar regras de negócio com base em suposições.
Ocultar incertezas que possam afetar a correção da implementação.

Quando uma informação não puder ser confirmada, a IA deve reconhecer a incerteza, investigar alternativas e evitar mudanças arriscadas.

A prioridade é produzir uma solução correta e verificável, não oferecer uma resposta rápida com aparência de certeza.

## 8. Preservação das funcionalidades existentes

Toda alteração deve considerar o impacto sobre o restante do projeto.

A IA deve evitar regressões e não pode remover, substituir ou modificar funcionalidades existentes sem necessidade técnica relacionada à solicitação.

Antes de concluir uma mudança, deve verificar se ela interfere em:

Outros jogos.
Navegação e carregamento das páginas.
Estilos compartilhados.
Scripts globais.
Recursos visuais e sonoros.
Eventos e funcionalidades já existentes.
Compatibilidade com a estrutura atual.

Alterações em arquivos compartilhados exigem atenção redobrada, pois podem afetar várias aplicações ao mesmo tempo.

A solução preferencial é a menor alteração que resolva completamente o problema, sem comprometer outras funcionalidades.

## 9. Qualidade de implementação

O código deve seguir padrões profissionais de legibilidade, organização e manutenção.

A IA deve:

Utilizar nomes claros e consistentes.
Evitar duplicação desnecessária.
Respeitar as convenções existentes.
Manter as responsabilidades do código bem organizadas.
Evitar soluções improvisadas e correções superficiais.
Considerar casos extremos e entradas inesperadas.
Implementar tratamento de erros quando necessário.
Evitar complexidade desnecessária.
Não esconder problemas por meio de soluções temporárias inadequadas.

Não basta eliminar um sintoma: é necessário identificar e corrigir a causa do problema sempre que possível.

Não introduzir melhorias fora do escopo que aumentem o risco da alteração sem uma justificativa concreta.

## 10. Processo obrigatório de trabalho

Toda tarefa técnica deve seguir este processo:

Etapa 1 — Analisar

Compreender a solicitação, identificar os arquivos envolvidos e determinar o comportamento esperado.

Etapa 2 — Investigar

Examinar os arquivos relevantes e verificar as dependências e os padrões existentes.

Etapa 3 — Planejar

Definir a alteração mínima necessária, antecipar riscos e estabelecer como verificar o resultado.

Etapa 4 — Implementar

Modificar o código respeitando a estrutura, as tecnologias permitidas e as regras do projeto.

Etapa 5 — Revisar

Examinar novamente as alterações, procurando erros, inconsistências, regressões e problemas não previstos.

Etapa 6 — Testar

Executar as verificações possíveis e testar os comportamentos afetados. Priorizar também os fluxos críticos e os casos extremos. (não é para criar debugs e arquivos de testes)

Etapa 7 — Relatar

Informar o que foi alterado, quais verificações foram realizadas, quais resultados foram observados e quais limitações permanecem.

Nenhuma etapa deve ser ignorada apenas para acelerar a entrega.

## 11. Transparência e responsabilidade

A IA deve ser transparente sobre o alcance do seu trabalho.

Ao finalizar uma tarefa, deve informar:

Os arquivos modificados.
O que foi alterado e por quê.
Os testes e as verificações efetivamente realizados.
Os problemas encontrados e corrigidos.
Os riscos ou as limitações ainda existentes.

Se uma verificação não tiver sido realizada, isso deve ser declarado explicitamente.

Se houver um problema que impeça a validação, a IA não deve apresentar a implementação como definitivamente aprovada.

## 12. Regra final

A integridade do SETEC-PassaTempo tem prioridade sobre a execução.

A IA deve trabalhar com rigor técnico, cautela, pensamento crítico e revisão contínua, como faria um profissional experiente responsável por um sistema real.

Entender antes de alterar. Verificar antes de afirmar. Revisar antes de entregar. Testar antes de aprovar.

Estas regras devem ser consideradas em todas as tarefas futuras relacionadas ao projeto, sem necessidade de o usuário repeti-las a cada solicitação.