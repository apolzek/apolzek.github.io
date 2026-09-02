---
layout: post
title: Diálogo sobre a Nova Ferramenta
# tags: filosofia dialogo socrates tecnologia
minute: 9
---

*Cenário: fim de tarde, uma mesa de bar perto do escritório. Glauco chega com o notebook debaixo do braço e abre antes mesmo de sentar.*

**GLAUCO:** Sócrates, achei a ferramenta que resolve tudo. Li a documentação ontem à noite, subi um exemplo em vinte minutos e funcionou de primeira. Vou reescrever o sistema inteiro em cima dela.

**SÓCRATES:** Vinte minutos. Deixa eu te perguntar uma coisa antes: quando você faz test drive de um carro, quanto tempo dura ?

**GLAUCO:** Uns quinze minutos. Uma volta no quarteirão com o vendedor do lado.

**SÓCRATES:** E você já descobriu algum defeito de carro numa volta no quarteirão ?

**GLAUCO:** Nunca. Os defeitos aparecem depois. Na estrada, na chuva, no trânsito parado.

**SÓCRATES:** Então nesses vinte minutos você conheceu a ferramenta, ou conheceu o percurso que o autor dela escolheu pra você fazer ?

**GLAUCO:** O percurso.

**SÓCRATES:** Que é justamente o trecho asfaltado. Não estou dizendo que ela é ruim. Estou dizendo que você ainda não pegou chuva. Quantos registros passaram no seu teste ?

**GLAUCO:** Uns mil.

**SÓCRATES:** E num dia de pico, em produção ?

**GLAUCO:** Uns dez milhões.

**SÓCRATES:** Você contrataria pra um casamento de quinhentas pessoas um restaurante que serviu bem dez mesas na semana de inauguração ?

**GLAUCO:** Ia querer ver ele servindo quinhentas primeiro.

**SÓCRATES:** E é exatamente isso que nenhum README te mostra. Não porque estejam mentindo, mas porque o autor também nunca viu. Ele construiu pra cozinha dele e testou na cozinha dele.

**GLAUCO:** Mas o site diz que escala horizontalmente.

**SÓCRATES:** Diz. Todo site diz. Olha uma coisa: quase toda ferramenta funciona bem no tamanho em que foi escrita. O que separa uma da outra é o que acontece um pouco além disso. Não pergunta se escala. Pergunta como ela quebra, e o que você faz quando ela quebrar.

**GLAUCO:** Confesso que não pensei nisso.

**SÓCRATES:** Nem precisava, até agora. Me conta outra coisa: quem escreveu essa ferramenta ?

**GLAUCO:** Uma empresa. Mas é open source, o código está todo no GitHub.

**SÓCRATES:** Aberto sob qual licença, e até quando ?

**GLAUCO:** Como assim até quando ?

**SÓCRATES:** A licença não é uma característica da ferramenta, é uma decisão de quem publica ela. E decisão se revê. Quem publicou hoje pode publicar a próxima versão sob outra regra.

**GLAUCO:** Mas o que já saiu continua liberado.

**SÓCRATES:** Continua, e é só isso que você garante. Tudo que vier depois pode vir diferente. Aí você escolhe entre aceitar a regra nova ou ficar parado numa versão que ninguém mais corrige, olhando o projeto seguir sem você.

**GLAUCO:** Está escrito open source na página inicial.

**SÓCRATES:** Está escrito na página inicial. Abre o arquivo de licença e lê o que está lá. Depois procura a segunda coisa: quanto da ferramenta é aberto de verdade. Existe projeto em que o motor é aberto e tudo que uma empresa precisa fica do outro lado do muro, vendido à parte.

**GLAUCO:** Que coisas, por exemplo ?

**SÓCRATES:** Login integrado, controle de quem pode fazer o quê, registro de quem fez o quê. Repara que são exatamente as coisas que você não precisa hoje, sozinho no seu teste, e que vai precisar de todas no dia em que aquilo virar ferramenta de time. A página inicial te diz o que prometem hoje. A licença te diz o que podem cobrar amanhã.

**GLAUCO:** Vou ler. Mas imagino que esteja tudo certo, é uma empresa séria.

**SÓCRATES:** Talvez esteja mesmo. Ainda assim: quem decide o rumo dessa ferramenta ?

**GLAUCO:** Eles, imagino. São os autores.

**SÓCRATES:** E se amanhã eles levarem pra um lugar que não te serve, ou simplesmente pararem de manter ?

**GLAUCO:** Aí eu faço um fork. O código é aberto, ninguém pode me impedir.

**SÓCRATES:** Ninguém pode te impedir, é verdade. Deixa eu perguntar de outro jeito: hoje, no seu time, quantas pessoas conseguiriam achar e corrigir um bug dentro do código dessa ferramenta ?

**GLAUCO:** Hoje, nenhuma. Eu talvez, com bastante tempo.

**SÓCRATES:** Então o fork é uma porta que existe e que você não consegue atravessar. É como carro importado que não tem peça no país. Ele é seu, o manual inteiro está publicado, e é exatamente por isso que ele fica na garagem.

**GLAUCO:** Ter o direito de continuar não é a mesma coisa que conseguir continuar. Então eu olho o quê ? Se não é a promessa, e não é só a licença.

**SÓCRATES:** Olha quantas mãos diferentes cuidam, e de quantas empresas elas são. Um projeto cuidado por gente que discorda em público e mesmo assim continua junto dura mais que a obra perfeita de uma pessoa só. Não porque os muitos sejam mais sábios. É que a saída de um deles não mata o projeto.

**GLAUCO:** E como eu conto essas mãos ? O repositório tem oito mil estrelas.

**SÓCRATES:** Estrela não escreve código. Olha quem enviou alteração nos últimos seis meses e conta quantos nomes sobram depois que você tira o primeiro da lista. Depois faz uma coisa que quase ninguém faz: em vez de olhar as issues fechadas, abre as que estão abertas, começando pelas mais antigas.

**GLAUCO:** Por que as abertas ?

**SÓCRATES:** Porque as fechadas mostram o que eles gostam de resolver. As abertas mostram o que eles decidiram ignorar. Você vai passar muito mais tempo do lado da segunda lista.

**GLAUCO:** Faz sentido. Vou olhar.

**SÓCRATES:** Faz melhor: abre uma issue hoje, antes de decidir qualquer coisa. Não precisa ser grande. Um relato honesto, com versão, passo a passo e log, do jeito que você gostaria de receber. E aí espera. A resposta que vier, ou a que não vier, te diz mais sobre os próximos três anos do que qualquer número no site deles.

**GLAUCO:** Isso pra bug comum. E quando for coisa de segurança ?

**SÓCRATES:** Aí muda de figura, porque o prazo deixa de ser seu. Onde eles publicam falha de segurança ?

**GLAUCO:** Imagino que no mesmo lugar das outras.

**SÓCRATES:** Imaginar não serve. Procura se existe um canal pra te reportarem em particular, e um lugar onde eles anunciam depois, dizendo o que era, o que foi corrigido e quais versões estão afetadas. Quando um carro tem defeito de fábrica, a montadora sabe quem comprou e chama pelo nome. Software nenhum chama. Se esse lugar não existir, você vai ficar sabendo por um post de terceiro, e nesse caso você chega depois de quem estava procurando a falha.

**GLAUCO:** E se eu estiver numa versão antiga quando sair a correção ?

**SÓCRATES:** Essa é a que dói, e quase ninguém faz na hora de escolher. Pergunta se eles corrigem só na última versão ou se levam a correção pras anteriores também. Porque se for só na última, uma falha de segurança deixa de ser uma atualização de uma tarde e vira uma migração inteira, com tudo que ela quebra pelo caminho, num dia que você não escolheu.

**GLAUCO:** Nunca tinha pensado em segurança como prazo.

**SÓCRATES:** É a forma mais útil de pensar. A falha vai aparecer em qualquer ferramenta que você escolher, inclusive nas antigas e chatas. O que muda de uma pra outra é quanto tempo você fica exposto e quanto trabalho custa sair da exposição.

**GLAUCO:** Vou anotar. Tem mais alguma coisa que eu não estou vendo ?

**SÓCRATES:** Tem uma que costuma aparecer só no dia de colocar em produção. Como as pessoas entram nela ?

**GLAUCO:** Usuário e senha criados na própria ferramenta. É rápido.

**SÓCRATES:** Rápido pra você, que é um. Quantas pessoas vão usar isso daqui a um ano ?

**GLAUCO:** Umas duzentas, contando os times de fora.

**SÓCRATES:** Duzentas senhas dentro de uma ferramenta que não fala com o LDAP da empresa. Me responde: quando alguém é desligado numa sexta à tarde, quem lembra de apagar a conta dessa pessoa ali dentro ?

**GLAUCO:** Sinceramente, ninguém.

**SÓCRATES:** Ninguém. E quando te pedirem a lista de quem tem acesso a quê, você monta essa lista de onde ?

**GLAUCO:** Na mão, exportando de cada ferramenta separado.

**SÓCRATES:** Então você já entendeu. Login integrado não é conforto, é o que faz uma pessoa existir num lugar só: ela entra uma vez, é desligada de uma vez, e existe um lugar único pra olhar quando alguém perguntar quem entrou e quando.

**GLAUCO:** Dá pra botar um proxy na frente, autenticando antes.

**SÓCRATES:** Dá, e às vezes é a saída possível. Só repara no que você acabou de fazer: colocou no sistema uma peça nova, que alguém vai ter que manter e monitorar, pra compensar uma que a ferramenta não tem. E o proxy resolve quem entra, não resolve o que cada um pode fazer depois de entrar.

**GLAUCO:** Lá dentro é administrador ou nada.

**SÓCRATES:** É quase sempre administrador ou nada. Então faz a lista agora, enquanto desistir ainda é barato: o LDAP de vocês, o lugar pra onde os logs precisam ir, o alerta que acorda alguém de madrugada, os sistemas de onde os dados vêm. Marca o que ela já faz e o que você vai ter que escrever. Cada item da segunda coluna não é um risco, é uma tarefa que vai aparecer com o seu nome daqui a alguns meses.

**GLAUCO:** E quando eu precisar de uma coisa que o autor simplesmente não previu ?

**SÓCRATES:** Você já sabe a resposta. Vai abrir uma issue e esperar, e agora tem uma ideia melhor do tamanho dessa espera. O que sobra pra decidir é o que você faz enquanto ela não chega.

**GLAUCO:** Dou um jeito por fora.

**SÓCRATES:** Se a ferramenta tiver por onde. É a diferença entre dois apartamentos: um tem parede de drywall, o outro tem parede estrutural. Os dois te abrigam igualmente bem enquanto você não precisa abrir uma porta onde não estava previsto.

**GLAUCO:** E como eu sei qual dos dois estou comprando ?

**SÓCRATES:** Procura o lugar onde ela te deixa escrever o que ela não previu. Um plugin, um hook, uma interface que você implementa. Quase toda ferramenta boa tem esse lugar e mostra ele sem vergonha nenhuma. Quando você não acha nenhum, não conclui que não vai precisar. Conclui que você ainda não sabe do que vai precisar.

**GLAUCO:** Sócrates, estou começando a achar que você está me dizendo pra nunca usar nada novo.

**SÓCRATES:** Aí eu estaria falando bobagem, e você faria bem em não me ouvir. Tudo que você hoje chama de estável já foi novo na frente de alguém que desconfiou. A escolha não é entre o novo e o velho.

**GLAUCO:** Entre o que, então ?

**SÓCRATES:** Entre escolher de olho aberto e ser escolhido. Faz assim: põe o novo onde o erro sai barato. Uma borda do sistema, um serviço que você desliga numa tarde e ninguém acorda de madrugada. Deixa o meio chato e previsível. Se a ferramenta prestar, ela vai crescendo pra dentro sozinha, e quando chegar lá você já vai ter aprendido a operar ela com o seu peso em cima, e não com o exemplo de vinte minutos.

**GLAUCO:** E se eu errar mesmo assim ?

**SÓCRATES:** Vai errar, várias vezes. Só quero que você saiba quanto custa o erro antes de cometer. Existe erro de uma tarde e existe erro de três anos, e no dia em que a gente comete os dois se parecem muito. **Antes de perguntar o que uma ferramenta faz, pergunta quanto custa sair dela**. Essa é a única resposta que ninguém escreve na documentação.

**GLAUCO:** Vou refazer o diagrama.

**SÓCRATES:** Hoje não. Guarda uma semana e abre de novo. Entusiasmo é bom combustível e péssimo motorista.

..então Sócrates fechou o notebook, Glauco salvou o diagrama sem apagar nada, e os dois foram tomar uma cerveja.

## Nota

A ideia foi pegar o modelo de diálogo de **A República, de Platão**, e aplicar num caso de tecnologia. Só a forma é emprestada: perguntas curtas, uma ideia de cada vez, a resposta do interlocutor abrindo a pergunta seguinte.

O caso é familiar pra quem trabalha com isso. Toda semana aparece uma ferramenta nova, open source, com interface bonita, exemplo que sobe em cinco minutos e um gráfico de estrelas subindo. Nesse ponto parece tudo resolvido, e o entusiasmo é legítimo.

As coisas ficam mais complicadas quando as perguntas começam. Como ela se comporta em escala. O que acontece no dia em que você precisa de algo que o autor não previu. Quanto tempo um bug report leva pra virar correção, e se alguém sequer responde. Quantos mantenedores de verdade existem por trás dos números do repositório, e de quantas empresas diferentes eles são. Quem decide o rumo do projeto, e em que lugar essa decisão é discutida. Como ela faz autenticação, e se isso conversa com o login que o resto da empresa já usa. O que ela faz quando um pedaço dela cai. Se dá pra auditar depois quem fez o quê lá dentro. E quanto trabalho é, de fato, integrá-la ao que você já tem de pé.

Quase nenhuma dessas respostas está na primeira página. A maioria aparece uns seis meses depois, quando trocar já não sai de graça.
