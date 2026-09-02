---
layout: post
title: Diálogo sobre a Novidade e o Tempo
# tags: filosofia dialogo socrates tecnologia
minute: 6
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

**SÓCRATES:** E é exatamente isso que nenhum README te mostra. Não porque estejam mentindo, mas porque o autor também nunca viu. Ele construiu pra cozinha dele.

**GLAUCO:** Mas o site diz que escala horizontalmente.

**SÓCRATES:** Diz. Todo site diz. Olha uma coisa: quase toda ferramenta funciona bem no tamanho em que foi escrita. O que separa uma da outra é o que acontece um pouco além disso. Não pergunta se escala. Pergunta como ela quebra, e o que você faz quando ela quebrar.

**GLAUCO:** Confesso que não pensei nisso.

**SÓCRATES:** Nem precisava, até agora. Me conta outra coisa: quem escreveu essa ferramenta ?

**GLAUCO:** Uma empresa. Mas é open source, o código está todo no GitHub.

**SÓCRATES:** Aberto sob qual licença, e até quando ?

**GLAUCO:** Como assim até quando ?

**SÓCRATES:** Você lembra de quando os aplicativos de transporte chegaram na cidade ?

**GLAUCO:** Lembro. Corrida por dez reais.

**SÓCRATES:** E o que aconteceu com os pontos de táxi do seu bairro ?

**GLAUCO:** Sumiram. Ninguém mais chamava.

**SÓCRATES:** E dois anos depois, quando o preço subiu, eles te enganaram ?

**GLAUCO:** Não. O preço era deles.

**SÓCRATES:** O preço era deles. O que te deram não foi a corrida barata, foi a permissão de pagar aquele preço enquanto interessasse a eles. E o que a cidade perdeu no dia em que subiu ?

**GLAUCO:** Perdeu o preço. E perdeu o táxi, que já não sabia mais chamar.

**SÓCRATES:** É por isso que eu te pergunto o que está escrito na licença, e não na home do site. Uma te diz o que prometem hoje. A outra te diz o que podem tirar amanhã. Já vi mais de um projeto trocar de licença numa versão nova, e quem estava dentro descobriu no dia do anúncio, junto com todo mundo.

**GLAUCO:** Vou ler. Mas imagino que esteja tudo certo, é uma empresa séria.

**SÓCRATES:** Talvez esteja mesmo. Ainda assim: quem decide o rumo dessa ferramenta ?

**GLAUCO:** Eles, imagino. São os autores.

**SÓCRATES:** E se amanhã eles levarem pra um lugar que não te serve, ou simplesmente pararem de manter ?

**GLAUCO:** Aí eu faço um fork. O código é aberto, ninguém pode me impedir.

**SÓCRATES:** Ninguém pode te impedir, é verdade. Deixa eu perguntar de outro jeito: hoje, no seu time, quantas pessoas conseguiriam achar e corrigir um bug dentro do código dessa ferramenta ?

**GLAUCO:** Hoje, nenhuma. Eu talvez, com bastante tempo.

**SÓCRATES:** Então o fork é uma porta que existe e que você não consegue atravessar. É como carro importado que não tem peça no país. Ele é seu, o manual inteiro está publicado, e é exatamente por isso que ele fica na garagem.

**GLAUCO:** Ter o direito de continuar não é a mesma coisa que conseguir continuar.

**SÓCRATES:** Essa é a frase. E muita gente dorme tranquila por causa de uma porta que nunca vai atravessar.

**GLAUCO:** Então eu olho o quê ? Se não é a promessa, e não é só a licença.

**SÓCRATES:** Olha quantas mãos diferentes cuidam. Quantas empresas distintas têm gente enviando código. Se as decisões acontecem em público, de um jeito que dá pra ler a discussão que levou até elas. Um projeto cuidado por gente que discorda em público e mesmo assim continua junto dura mais que a obra perfeita de uma pessoa só. Não porque os muitos sejam mais sábios. É que a saída de um deles não mata o projeto.

**GLAUCO:** Isso parece lento.

**SÓCRATES:** É lento. E é aí que eu queria chegar: você está chamando de lentidão o preço de não depender de uma pessoa. Toda vez que algo te parecer lento demais, pergunta antes o que aquela lentidão está comprando. Às vezes não compra nada, e você tem razão em fugir. Às vezes compra exatamente o que vai te faltar no dia em que der errado.

**GLAUCO:** Entendi. Mas ainda acho que ela resolve o meu problema melhor que tudo que temos hoje.

**SÓCRATES:** Pode ser que resolva mesmo. Faltou uma pergunta. No dia em que você precisar de uma coisa que o autor não previu, o que você faz ?

**GLAUCO:** Abro uma issue e espero.

**SÓCRATES:** E se não vier ?

**GLAUCO:** Não sei. Dou um jeito por fora.

**SÓCRATES:** Você acabou de descrever a diferença entre dois apartamentos. Um tem parede de drywall. O outro tem parede estrutural. Os dois te abrigam igualmente bem enquanto você não precisa abrir uma porta onde não estava previsto.

**GLAUCO:** E como eu sei qual dos dois estou comprando ?

**SÓCRATES:** Procura o lugar onde a ferramenta te deixa escrever o que ela não previu. Um plugin, um hook, uma interface que você implementa, um jeito de sair pelo lado sem quebrar o resto. Quase toda ferramenta boa tem esse lugar e mostra ele sem vergonha nenhuma. Quando você não acha nenhum, não conclui que não vai precisar. Conclui que você ainda não sabe do que vai precisar.

**GLAUCO:** Sócrates, estou começando a achar que você está me dizendo pra nunca usar nada novo.

**SÓCRATES:** Aí eu estaria falando bobagem, e você faria bem em não me ouvir. Tudo que você hoje chama de estável já foi novo na frente de alguém que desconfiou. A escolha não é entre o novo e o velho.

**GLAUCO:** Entre o que, então ?

**SÓCRATES:** Entre escolher de olho aberto e ser escolhido. Faz assim: põe o novo onde o erro sai barato. Uma borda do sistema, um serviço que você desliga numa tarde e ninguém acorda de madrugada. Deixa o meio chato e previsível. Se a ferramenta prestar, ela vai crescendo pra dentro sozinha, e quando chegar lá você já vai ter aprendido a operar ela com o seu peso em cima, e não com o exemplo de vinte minutos.

**GLAUCO:** E se eu errar mesmo assim ?

**SÓCRATES:** Vai errar, várias vezes. Só quero que você saiba quanto custa o erro antes de cometer. Existe erro de uma tarde e existe erro de três anos, e no dia em que a gente comete os dois se parecem muito. **Antes de perguntar o que uma ferramenta faz, pergunta quanto custa sair dela**. Essa é a única resposta que ninguém escreve na documentação.

**GLAUCO:** Vou refazer o diagrama.

**SÓCRATES:** Hoje não. Guarda uma semana e abre de novo. Entusiasmo é bom combustível e péssimo motorista.

..então Sócrates fechou o notebook, Glauco salvou o diagrama sem apagar nada, e os dois foram tomar uma cerveja.

## Glossário

- *fork*: cópia independente de um projeto de código aberto, mantida dali em diante por outras pessoas
- *licença*: o texto que define o que se pode fazer com um software; é ela, e não o código estar visível, que diz o que é permitido
- *governança*: quem decide o rumo de um projeto, e por qual processo
- *custo de saída*: o trabalho necessário para trocar uma ferramenta por outra depois que o sistema inteiro já se apoia nela

## Nota

Este é o segundo diálogo que escrevo no molde de **A República, de Platão**. Só a forma é emprestada: as perguntas curtas, uma ideia de cada vez, a resposta do interlocutor abrindo a pergunta seguinte. O resto é conversa de hoje.

Ele nasceu de uma discussão real que eu já tive dos dois lados, primeiro como Glauco e alguns anos depois como quem faz as perguntas chatas. Uma coisa me incomoda em conversas assim: o mais experiente costuma sair como o adulto da sala, e o iniciante como alguém a ser corrigido. Tentei não escrever isso. O entusiasmo do Glauco não é o erro do diálogo, é o que faz qualquer coisa sair do papel, e sistema construído só por gente cautelosa envelhece antes de nascer. O que a experiência acrescenta não é freio, é prazo: a capacidade de olhar a mesma decisão daqui a três anos.
