---
layout: post
title: Diálogo sobre a Nova Ferramenta
# tags: filosofia dialogo socrates tecnologia
minute: 6
---

*Cenário: fim de tarde, uma mesa de bar perto do escritório. Glauco chega com o notebook debaixo do braço e abre antes mesmo de sentar.*

**GLAUCO:** Sócrates, achei a ferramenta que resolve tudo. Li a documentação ontem à noite, subi um exemplo em vinte minutos e funcionou de primeira. Vou reescrever o sistema inteiro em cima dela.

**SÓCRATES:** Vinte minutos. Quando você faz test drive de um carro, quanto tempo dura ?

**GLAUCO:** Uns quinze minutos. Uma volta no quarteirão com o vendedor do lado.

**SÓCRATES:** E você já descobriu algum defeito de carro numa volta no quarteirão ?

**GLAUCO:** Nunca. Os defeitos aparecem depois. Na estrada, na chuva, no trânsito parado.

**SÓCRATES:** Então nesses vinte minutos você conheceu a ferramenta, ou conheceu o percurso que o autor dela escolheu pra você fazer ?

**GLAUCO:** O percurso. Mas gostei do percurso.

**SÓCRATES:** Gostar já é alguma coisa. Deixa eu te fazer umas perguntas, então. Só não me responde o que você imagina. Me responde o que você sabe.

**GLAUCO:** Pode perguntar.

**SÓCRATES:** Em que linguagem ela foi escrita ?

**GLAUCO:** Isso importa ? Ela roda num contêiner, eu nem preciso saber.

**SÓCRATES:** Não precisa enquanto ela funciona. A linguagem de uma ferramenta é a língua em que você vai poder discutir com ela, e enquanto tudo vai bem ninguém discute nada. Numa noite ela vai travar, o log não vai dizer o suficiente, e alguém vai ter que abrir aquele código e ler. Se ninguém no seu time fala aquela língua, você não tem a ferramenta. Você tem uma cópia dela.

**GLAUCO:** É Rust, eu acho.

**SÓCRATES:** Acha. E quantas pessoas do seu time leem Rust ?

**GLAUCO:** Nenhuma.

**SÓCRATES:** Anota isso, não como defeito dela, mas como preço que você vai pagar. Próxima: como uma pessoa prova pra ela que é quem diz ser ?

**GLAUCO:** Usuário e senha, criados ali dentro mesmo.

**SÓCRATES:** E na sua empresa, como as pessoas provam isso em todo o resto ?

**GLAUCO:** Pelo LDAP.

**SÓCRATES:** Então ela vai ser o único lugar da empresa onde uma pessoa existe duas vezes. Quem for desligado numa sexta vai sair de todos os lugares menos de um. Agora a segunda metade da mesma pergunta: depois que a pessoa entra, quem decide o que ela pode fazer ?

**GLAUCO:** Acho que quem entra pode tudo.

**SÓCRATES:** Repara que são duas coisas diferentes, e você acabou de tratar como uma. Uma é quem entra. Outra é o que cada um faz depois de entrar. Ferramenta de uma pessoa só não precisa separar as duas, porque a pessoa é você. Ferramenta de organização vive dessa separação.

**GLAUCO:** Nunca precisei pensar nisso.

**SÓCRATES:** Nunca precisou porque você era o único lá dentro. E se amanhã alguém apagar uma coisa importante, você consegue descobrir quem foi ?

**GLAUCO:** Não sei se ela guarda isso.

**SÓCRATES:** Guardar quem fez o quê não serve pra punir ninguém. Serve pra você conseguir contar a história depois. Sem isso, todo incidente vira discussão de memória, e memória não é prova.

**GLAUCO:** Faz sentido.

**SÓCRATES:** Quando saiu a última versão dela ?

**GLAUCO:** Faz uns dois meses, acho.

**SÓCRATES:** E antes dessa ?

**GLAUCO:** Não olhei.

**SÓCRATES:** Olha, porque o intervalo entre as versões é o relógio no qual você vai amarrar o seu. E olha uma coisa mais fina: entre uma versão grande e outra, saem versões pequenas, só com correção ?

**GLAUCO:** Não reparei.

**SÓCRATES:** Repara. Se saírem, no dia de um problema sério você atualiza uma casa decimal e volta a dormir. Se não saírem, o conserto só chega junto da próxima versão grande, com tudo que ela muda de quebra, e um problema de uma tarde vira uma migração inteira num dia que você não escolheu.

**GLAUCO:** Isso eu consigo verificar hoje.

**SÓCRATES:** Verifica junto com esta: quantas pessoas de fato mantêm isso ?

**GLAUCO:** O repositório tem oito mil estrelas e centenas de contribuidores.

**SÓCRATES:** Estrela é aplauso, e aplauso não conserta nada. Contribuidor, na maioria dessas listas, é qualquer um que já corrigiu uma vírgula na documentação. Conta outra coisa: nos últimos seis meses, quantos nomes diferentes mexeram no coração da ferramenta ? E desses, quantos sobram depois que você tira o primeiro ?

**GLAUCO:** Não sei. Imagino que poucos.

**SÓCRATES:** Se sobrar um, você não escolheu uma ferramenta. Escolheu uma pessoa, e essa pessoa não assinou nada com você.

**GLAUCO:** Falta muita pergunta ?

**SÓCRATES:** Uma. Você disse que ela faz quase tudo que você precisa. E o quase ?

**GLAUCO:** O que faltar eu abro uma issue e peço.

**SÓCRATES:** Sempre ? Toda vez que aparecer uma necessidade nova, o caminho vai ser pedir e esperar ?

**GLAUCO:** É o que dá pra fazer.

**SÓCRATES:** Então repara no que você aceitou: o ritmo do que você entrega passa a ser decidido por gente que não conhece o seu problema e não deve nada a você. Existe outro caminho, e ele é a diferença entre uma ferramenta e uma parede: um lugar onde você mesmo escreve o que faltou. Um plugin, um encaixe, um script que ela chama na hora certa. Quando esse lugar existe, o que falta hoje é trabalho seu. Quando não existe, o que falta hoje é espera.

**GLAUCO:** Sócrates, eu não soube responder quase nada.

**SÓCRATES:** E é a melhor coisa que te aconteceu hoje. Repara que você não descobriu que a ferramenta é ruim. Descobriu que você não conhece ela. São coisas muito diferentes, e só uma das duas tem conserto.

**GLAUCO:** Mas eu estava seguro.

**SÓCRATES:** Estava seguro do que viu, e você viu vinte minutos escolhidos por outra pessoa. Todo mundo está seguro no começo. A diferença é que uns descobrem as perguntas antes de instalar, e outros descobrem depois, com o sistema inteiro em pé em cima delas.

**GLAUCO:** Então eu desisto dela ?

**SÓCRATES:** Não foi isso que eu disse. Talvez ela seja ótima. Vai atrás de cada resposta e volta com elas. Se forem boas, você instala sabendo o que instalou. Se forem ruins, você já sabe onde vai doer, e às vezes se instala mesmo assim, de propósito, porque doer naquele lugar é aceitável.

**GLAUCO:** E se eu errar mesmo tendo perguntado tudo ?

**SÓCRATES:** Vai errar de vez em quando, e tudo bem. Põe o novo onde o erro sai barato, numa borda que você desliga numa tarde sem acordar ninguém, e deixa o meio chato e previsível. **Antes de perguntar o que uma ferramenta faz, pergunta quanto custa sair dela**. Essa é a única resposta que ninguém escreve na documentação.

**GLAUCO:** Vou refazer o diagrama.

**SÓCRATES:** Hoje não. Guarda uma semana e abre de novo. Entusiasmo é bom combustível e péssimo motorista.

..então Sócrates fechou o notebook, Glauco salvou o diagrama sem apagar nada, e os dois foram tomar uma cerveja.

## Nota

A ideia foi pegar o modelo de diálogo de **A República, de Platão**, e aplicar num caso de tecnologia. Só a forma é emprestada: perguntas curtas, uma ideia de cada vez, a resposta do interlocutor abrindo a pergunta seguinte.

O caso é familiar pra quem trabalha com isso. Toda semana aparece uma ferramenta nova, open source, com interface bonita, exemplo que sobe em cinco minutos e um gráfico de estrelas subindo. Nesse ponto parece tudo resolvido, e o entusiasmo é legítimo.

As coisas ficam mais complicadas quando as perguntas começam. Como ela se comporta em escala. O que acontece no dia em que você precisa de algo que o autor não previu. Quanto tempo um bug report leva pra virar correção, e se alguém sequer responde. Quantos mantenedores de verdade existem por trás dos números do repositório, e de quantas empresas diferentes eles são. Quem decide o rumo do projeto, e em que lugar essa decisão é discutida. Como ela faz autenticação, e se isso conversa com o login que o resto da empresa já usa. O que ela faz quando um pedaço dela cai. Se dá pra auditar depois quem fez o quê lá dentro. E quanto trabalho é, de fato, integrá-la ao que você já tem de pé.

Quase nenhuma dessas respostas está na primeira página. A maioria aparece uns seis meses depois, quando trocar já não sai de graça.
