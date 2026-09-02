---
layout: post
title: Diálogo sobre a Nova Ferramenta
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

**SÓCRATES:** É exatamente isso que nenhum README te mostra. Não porque estejam mentindo, mas porque o autor também nunca viu. Ele construiu pra cozinha dele e testou na cozinha dele.

**GLAUCO:** Então como eu decido ?

**SÓCRATES:** Para de perguntar se ela funciona. Ela funciona, você viu funcionando. Pergunta se ela tem o que precisa pra ir pra produção, que é outra pergunta e tem lista.

**GLAUCO:** Que lista ?

**SÓCRATES:** Umas oito perguntas, e nenhuma delas é sobre o que a ferramenta faz. A primeira: sob qual licença, e quanto dela é aberto de verdade ?

**GLAUCO:** Está escrito open source na página inicial.

**SÓCRATES:** Página inicial não é licença. Abre o arquivo e lê. Depois repara no que ficou de fora, porque em muito projeto o motor é aberto e o login integrado, o controle de permissão e o registro de acesso são vendidos à parte. Justamente o que você não precisa hoje e vai precisar todo dia quando aquilo virar ferramenta de time.

**SÓCRATES:** Segunda: quantas pessoas mantêm isso, de quantas empresas, e onde elas decidem o rumo ?

**GLAUCO:** O repositório tem oito mil estrelas.

**SÓCRATES:** Estrela não escreve código. Conta quantos nomes enviaram alteração nos últimos seis meses, e quantos sobram depois que você tira o primeiro da lista. Se sobrar um, você não escolheu uma ferramenta, escolheu uma pessoa. E vê onde a discussão acontece: se é em público, dá pra ler e até discordar; se é interna, você só fica sabendo do resultado.

**SÓCRATES:** Terceira: quanto tempo um bug leva pra virar correção ?

**GLAUCO:** Vou olhar as issues fechadas.

**SÓCRATES:** Olha as abertas, das mais antigas pras mais novas. As fechadas mostram o que eles gostam de resolver. As abertas mostram o que eles decidiram ignorar. E abre uma hoje, antes de decidir qualquer coisa: versão, passo a passo, log. A resposta que vier, ou a que não vier, vale mais que qualquer número no site deles.

**SÓCRATES:** Quarta: quando sair uma falha de segurança, como você fica sabendo, e eles corrigem a sua versão ?

**GLAUCO:** Imagino que saia uma versão nova.

**SÓCRATES:** Se sair só na última, uma falha de segurança deixa de ser atualização de uma tarde e vira migração inteira, num dia que você não escolheu. Procura duas coisas: um canal pra reportar em particular e um lugar onde eles anunciam depois, dizendo o que era e quais versões pegam. Sem esse lugar, você fica sabendo por terceiro, depois de quem estava procurando a falha.

**SÓCRATES:** Quinta: como as pessoas entram ?

**GLAUCO:** Usuário e senha criados na própria ferramenta. É rápido.

**SÓCRATES:** Rápido pra você, que é um. Vocês usam LDAP em todo o resto. Então vão ser duzentas contas soltas, e quando alguém for desligado numa sexta ninguém vai lembrar de apagar a de lá. No dia em que te pedirem a lista de quem tem acesso a quê, você monta na mão.

**GLAUCO:** Dá pra botar um proxy na frente, autenticando antes.

**SÓCRATES:** Dá, e às vezes é a saída possível. Só que você acabou de adicionar uma peça pra manter, e o proxy resolve quem entra, não o que cada um pode fazer depois de entrar. Pergunta se lá dentro existe perfil, ou se é administrador ou nada.

**SÓCRATES:** Sexta: o que ela já integra, e o que você vai ter que escrever ?

**GLAUCO:** Como assim ?

**SÓCRATES:** Faz duas colunas: o LDAP, o destino dos logs, o alerta que acorda alguém de madrugada, os sistemas de onde os dados vêm. Marca o que ela faz sozinha e o que falta. Cada item da coluna vazia não é um risco, é uma tarefa que vai aparecer com o seu nome daqui a alguns meses.

**SÓCRATES:** Sétima: o que ela faz quando um pedaço dela cai ?

**GLAUCO:** Não sei. Nunca derrubei.

**SÓCRATES:** Então derruba hoje, antes de gostar dela. Mata o processo no meio de uma carga e olha o que aconteceu: perdeu dado, repetiu dado, voltou sozinha, ou ficou esperando alguém chegar. É a informação mais barata que você vai conseguir a semana inteira.

**SÓCRATES:** Oitava: e no dia em que você precisar de uma coisa que o autor não previu ?

**GLAUCO:** Abro uma issue e espero.

**SÓCRATES:** Você já sabe o tamanho dessa espera. O que interessa é o que dá pra fazer enquanto ela não chega. Procura o lugar onde a ferramenta te deixa escrever o que ela não previu: um plugin, um hook, uma interface que você implementa. Quando não existe nenhum, não conclui que não vai precisar. Conclui que você ainda não sabe do que vai precisar.

**GLAUCO:** Sócrates, estou começando a achar que você está me dizendo pra nunca usar nada novo.

**SÓCRATES:** Aí eu estaria falando bobagem, e você faria bem em não me ouvir. Tudo que você hoje chama de estável já foi novo na frente de alguém que desconfiou. A escolha não é entre o novo e o velho.

**GLAUCO:** Entre o que, então ?

**SÓCRATES:** Entre escolher de olho aberto e ser escolhido. Põe o novo onde o erro sai barato: uma borda do sistema, um serviço que você desliga numa tarde sem acordar ninguém. Deixa o meio chato e previsível. Se a ferramenta prestar, ela cresce pra dentro sozinha, e quando chegar lá você já vai ter aprendido a operar ela com o seu peso em cima, e não com o exemplo de vinte minutos.

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
