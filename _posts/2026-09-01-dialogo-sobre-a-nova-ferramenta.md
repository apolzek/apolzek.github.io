---
layout: post
title: Diálogo sobre a Nova Ferramenta
# tags: filosofia dialogo socrates tecnologia
minute: 5
---

*Cenário: fim de tarde, uma mesa de bar perto do escritório. Glauco chega com o notebook debaixo do braço e abre antes mesmo de sentar.*

**GLAUCO:** Sócrates, achei a ferramenta que resolve tudo. Li a documentação ontem à noite, subi um exemplo em vinte minutos e funcionou de primeira. Vou reescrever o sistema inteiro em cima dela.

**SÓCRATES:** Vinte minutos. Quando você faz test drive de um carro, quanto tempo dura ?

**GLAUCO:** Uns quinze minutos. Uma volta no quarteirão com o vendedor do lado.

**SÓCRATES:** E você já descobriu algum defeito de carro numa volta no quarteirão ?

**GLAUCO:** Nunca. Os defeitos aparecem depois. Na estrada, na chuva, no trânsito parado.

**SÓCRATES:** Então nesses vinte minutos você conheceu a ferramenta, ou conheceu o percurso que o autor dela escolheu pra você fazer ?

**GLAUCO:** O percurso. Mas gostei do percurso.

**SÓCRATES:** E gostar é um bom começo, não estou tirando isso de você. Só que agora você quer fazer outra coisa, e talvez não tenha reparado. Você testou uma ferramenta. O que você quer instalar é uma ferramenta dentro de uma organização.

**GLAUCO:** É a mesma ferramenta.

**SÓCRATES:** É o mesmo objeto. Não é a mesma coisa. No seu teste ela foi usada por uma pessoa, uma vez, com quantos registros ?

**GLAUCO:** Uns mil.

**SÓCRATES:** Lá dentro vai ser usada por muita gente, todo dia, com milhões, por mais tempo do que você vai ficar cuidando dela. Duas coisas mudam: quantas pessoas e quanto tempo. Quase tudo que dá errado depois vem de uma dessas duas.

**GLAUCO:** Começa pelas pessoas.

**SÓCRATES:** Como elas entram ?

**GLAUCO:** Cria usuário e senha na própria ferramenta. É rápido.

**SÓCRATES:** Rápido pra você, que é um. Repara numa coisa: ferramenta de uma pessoa só não precisa saber quem você é, porque você é o único que está lá. Assim que entra a segunda, ela precisa saber. E quando forem duzentas, alguém vai ter que responder três perguntas que hoje nem existem: quem pode entrar, o que cada um pode fazer, e quem fez o que já foi feito.

**GLAUCO:** Na empresa todo mundo entra pelo LDAP.

**SÓCRATES:** E ela fala LDAP ?

**GLAUCO:** Acho que não.

**SÓCRATES:** Então quem for desligado numa sexta sai da empresa e continua dentro da ferramenta. Isso não é detalhe de configuração, é o que separa uma ferramenta pessoal de uma ferramenta de organização. Olha isso hoje, junto com a licença, porque em muito projeto o motor é aberto e é justamente essa parte, o login integrado e o registro de quem fez o quê, que fica vendida à parte.

**GLAUCO:** E o tempo ? Você disse que eram duas coisas.

**SÓCRATES:** O tempo é fácil de dizer e difícil de aceitar: você não vai ser quem conserta. Daqui a dois anos vai aparecer um defeito sério, e ou existe gente no seu time capaz de mexer naquele código, ou você depende de estranhos.

**GLAUCO:** Depender é tão ruim assim ?

**SÓCRATES:** Não é ruim, é normal. Todo mundo depende. O que muda de um projeto pra outro é a resposta a uma pergunta só: quanto tempo eles demoram pra corrigir, e a correção chega até você ?

**GLAUCO:** Não é a mesma coisa ?

**SÓCRATES:** Não. Uma coisa é consertar. Outra é publicar o conserto de um jeito que sirva pra quem já está usando. Pergunta se eles sabem lançar uma versão pequena, só com a correção, ou se ela só chega junto da próxima versão grande, com tudo que ela muda de quebra.

**GLAUCO:** Se for só na próxima grande...

**SÓCRATES:** Se for só na próxima grande, o defeito deixa de ser um conserto de uma tarde e vira uma migração inteira, num dia que você não escolheu. Projeto maduro tem duas velocidades: uma pra melhorar e outra pra consertar. Quando só tem uma, quem usa fica preso ao calendário de quem escreve.

**GLAUCO:** Dá pra saber isso antes ?

**SÓCRATES:** Dá, e custa uma tarde. Olha o histórico de versões e procura correções soltas entre as versões grandes. Olha as issues abertas há mais tempo, não as fechadas, porque as fechadas mostram o que eles gostam de resolver e as abertas mostram o que decidiram ignorar. E conta quantas pessoas diferentes assinaram alterações nos últimos meses. Se sobrar uma, você não escolheu uma ferramenta, escolheu uma pessoa.

**GLAUCO:** Tudo isso antes de decidir.

**SÓCRATES:** Tudo isso custa uma tarde, e você já gastou vinte minutos gostando. Falta a última, e é a mais barata de perguntar: no dia em que você precisar de uma coisa que o autor não previu, existe algum lugar onde você mesmo escreve ela ?

**GLAUCO:** E se não existir ?

**SÓCRATES:** Aí não conclui que você não vai precisar. Conclui que ainda não sabe do que vai precisar.

**GLAUCO:** Sócrates, estou começando a achar que você está me dizendo pra nunca usar nada novo.

**SÓCRATES:** Aí eu estaria falando bobagem, e você faria bem em não me ouvir. Tudo que você hoje chama de estável já foi novo na frente de alguém que desconfiou. A escolha não é entre o novo e o velho.

**GLAUCO:** Entre o que, então ?

**SÓCRATES:** Entre escolher de olho aberto e ser escolhido. Põe o novo onde o erro sai barato, numa borda que você desliga numa tarde sem acordar ninguém, e deixa o meio chato e previsível. Se a ferramenta prestar, ela cresce pra dentro sozinha.

**GLAUCO:** E se eu errar mesmo assim ?

**SÓCRATES:** Vai errar, várias vezes. Só quero que você saiba quanto custa o erro antes de cometer. **Antes de perguntar o que uma ferramenta faz, pergunta quanto custa sair dela**. Essa é a única resposta que ninguém escreve na documentação.

**GLAUCO:** Vou refazer o diagrama.

**SÓCRATES:** Hoje não. Guarda uma semana e abre de novo. Entusiasmo é bom combustível e péssimo motorista.

..então Sócrates fechou o notebook, Glauco salvou o diagrama sem apagar nada, e os dois foram tomar uma cerveja.

## Nota

A ideia foi pegar o modelo de diálogo de **A República, de Platão**, e aplicar num caso de tecnologia. Só a forma é emprestada: perguntas curtas, uma ideia de cada vez, a resposta do interlocutor abrindo a pergunta seguinte.

O caso é familiar pra quem trabalha com isso. Toda semana aparece uma ferramenta nova, open source, com interface bonita, exemplo que sobe em cinco minutos e um gráfico de estrelas subindo. Nesse ponto parece tudo resolvido, e o entusiasmo é legítimo.

As coisas ficam mais complicadas quando as perguntas começam. Como ela se comporta em escala. O que acontece no dia em que você precisa de algo que o autor não previu. Quanto tempo um bug report leva pra virar correção, e se alguém sequer responde. Quantos mantenedores de verdade existem por trás dos números do repositório, e de quantas empresas diferentes eles são. Quem decide o rumo do projeto, e em que lugar essa decisão é discutida. Como ela faz autenticação, e se isso conversa com o login que o resto da empresa já usa. O que ela faz quando um pedaço dela cai. Se dá pra auditar depois quem fez o quê lá dentro. E quanto trabalho é, de fato, integrá-la ao que você já tem de pé.

Quase nenhuma dessas respostas está na primeira página. A maioria aparece uns seis meses depois, quando trocar já não sai de graça.
