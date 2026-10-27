---
title: "Revisão: fundamentos de inteligência artificial"
slug: "revisao-fundamentos-de-inteligencia-artificial"
date: '2026-10-27T11:30:00-03:00'
draft: false
description: "Uma revisão de IA do zero ao estado da arte: a história e os invernos, como uma máquina aprende, redes neurais, CNNs e Transformers, LLMs por dentro (tokens, atenção, pré-treino, RLHF, RAG, agentes), geração de imagem, vídeo, áudio e voz, o lado prático (PyTorch, GPUs, Hugging Face, rodar local), o mapa das empresas e serviços, e os limites honestos, em linguagem informal e com analogias."
tags:
- inteligencia-artificial
- machine-learning
minute: 55
---

As outras revisões desta trilha falavam de coisas que já estavam prontas havia décadas: [armazenamento](/2026/10/26/revisao-fundamentos-de-armazenamento/), [redes](/2026/10/26/revisao-redes-de-computadores/), [sistemas operacionais](/2026/10/26/revisao-fundamentos-de-sistemas-operacionais/). Inteligência artificial é diferente: é o assunto que mais mudou nos últimos cinco anos e que mais muda a cada mês. Por isso, esta revisão tenta separar o que é fundamento (e envelhece devagar) do que é manchete (e envelhece em semanas). A ideia é que, ao final, você consiga olhar para qualquer novidade e saber em que caixa ela cai.

## O nome engana: IA, ML, deep learning e IA generativa

A primeira confusão é de vocabulário, porque são quatro termos usados como sinônimos e não são. Pense em bonecas russas, uma dentro da outra:

1. **Inteligência artificial (IA)** é a boneca maior: qualquer técnica que faça um computador realizar tarefas que associamos à inteligência. Isso inclui coisas que hoje nem parecem IA, como o adversário de um jogo de xadrez dos anos 80, feito de regras escritas à mão.
2. **Aprendizado de máquina (machine learning, ML)** é a boneca de dentro: em vez de o programador escrever as regras, a máquina **aprende as regras a partir de exemplos**. Você não programa "o que é spam"; você mostra dez mil emails marcados como spam ou não, e o sistema descobre sozinho os padrões.
3. **Aprendizado profundo (deep learning)** é a boneca seguinte: ML feito com **redes neurais** de muitas camadas. É o que destravou visão, fala e linguagem na última década.
4. **IA generativa** é a boneca mais interna e mais recente: modelos de deep learning que **criam** conteúdo novo (texto, imagem, áudio, vídeo, código) em vez de só classificar ou prever. É a onda de 2022 em diante, dos LLMs aos geradores de imagem.

Guardar essa hierarquia resolve metade das conversas confusas. Quando alguém diz "IA", quase sempre quer dizer "IA generativa", que é uma fatia pequena e nova de um campo muito mais antigo e amplo.

## Uma história em ondas e invernos

IA não nasceu em 2022. Nasceu nos anos 1950, e a sua história é de entusiasmo e decepção se alternando, o que vale conhecer para não achar que desta vez é só subida.

1. **O fundamento (1950).** Alan Turing publica o artigo que pergunta "máquinas podem pensar?" e propõe o teste que leva o seu nome. A pergunta ainda não foi respondida.
2. **O batismo (1956).** Na conferência de Dartmouth, John McCarthy cunha o termo "inteligência artificial". A promessa era alta: resolver o problema em uma geração.
3. **O perceptron (1958).** Frank Rosenblatt cria o perceptron, o primeiro neurônio artificial que aprende. O entusiasmo é enorme, até que, em 1969, Minsky e Papert mostram as limitações matemáticas dele, e o interesse (e o dinheiro) seca. Primeiro **inverno da IA**.
4. **Os sistemas especialistas (anos 1980).** A aposta muda para codificar o conhecimento de especialistas em milhares de regras "se isto, então aquilo". Funciona em nichos, mas não escala: manter as regras vira um pesadelo, e o mercado desaba. Segundo inverno.
5. **A virada estatística (anos 1990 e 2000).** A IA abandona a ambição de imitar o raciocínio e abraça a estatística e os dados. É a era do machine learning "clássico": filtros de spam, recomendação, detecção de fraude. O Deep Blue vence Kasparov no xadrez em 1997, mais por força bruta que por inteligência.
6. **A faísca do deep learning (2012).** Uma rede neural chamada **AlexNet** vence por larga margem uma competição de reconhecimento de imagens, usando **GPUs** para treinar. É o momento em que três coisas finalmente se encontram: muitos dados (a internet), muito poder de cálculo (as placas de vídeo) e algoritmos velhos que agora funcionam. Começa a década do deep learning, com avanços em visão e tradução.
7. **O Transformer (2017).** O artigo "Attention Is All You Need", do Google, apresenta uma arquitetura nova, o **Transformer**, que processa sequências inteiras de uma vez em vez de palavra por palavra. É a fundação de tudo o que veio depois. Sem exagero, é o artigo mais importante da IA moderna.
8. **A escala e o espanto (2018 a 2022).** Descobre-se que, ao aumentar o tamanho do modelo, a quantidade de dados e o cálculo, a qualidade cresce de forma previsível (as "leis de escala"). Surgem os grandes modelos de linguagem. Em novembro de 2022, o **ChatGPT** coloca isso na mão do público, e a IA deixa de ser assunto de laboratório.
9. **A corrida (2023 em diante).** Modelos cada vez maiores e depois menores e mais eficientes, multimodais (texto, imagem, áudio, vídeo juntos), com janelas de contexto gigantes, capazes de usar ferramentas e agir como agentes. Modelos abertos competindo com os fechados. É a onda em que ainda estamos, e ninguém sabe quando (ou se) vem o próximo inverno.

A lição dos invernos: toda vez que se achou que o problema estava resolvido, apareceu uma parede. A onda atual é real e transformadora, mas a história pede humildade sobre o que vem a seguir.

## Como uma máquina "aprende": a teoria mínima

Tirando o misticismo, aprendizado de máquina é **ajustar números para errar menos**. Vale entender o mecanismo, porque ele é o mesmo da rede neural mais simples ao maior LLM.

### Os três grandes tipos de aprendizado

1. **Supervisionado:** você dá exemplos com a resposta certa (imagens rotuladas "gato" ou "cachorro", casas com o preço de venda), e o modelo aprende a mapear entrada para saída. É o mais comum e o mais fácil de avaliar.
2. **Não supervisionado:** você dá dados sem rótulo e pede para o modelo achar estrutura sozinho: agrupar clientes parecidos (clustering), reduzir dimensões, detectar anomalias.
3. **Por reforço (reinforcement learning):** o modelo é um agente que age num ambiente, recebe recompensa ou punição e aprende a política que maximiza a recompensa ao longo do tempo. É como se adestra um cachorro, e é como se ensinou máquinas a jogar Go e videogames melhor que humanos.

Há ainda o **autossupervisionado**, que é o segredo dos LLMs: o rótulo vem do próprio dado. "Preveja a próxima palavra desta frase" não precisa de ninguém rotulando nada, porque a própria frase já traz a resposta. Isso permite treinar com a internet inteira.

### O coração: perda e gradiente

Imagine que você quer prever o preço de uma casa a partir do tamanho. O modelo começa com um palpite qualquer (uma reta aleatória). Para melhorar, precisa de três coisas:

1. **Uma função de perda:** um número que mede o quanto o modelo está errando. Quanto maior a diferença entre o preço previsto e o real, maior a perda.
2. **Um gradiente:** a direção em que ajustar os parâmetros para que a perda diminua. É o cálculo respondendo "para que lado eu empurro cada número para errar menos?".
3. **O gradiente descendente:** repetir, muitas vezes, "calcule a perda, descubra a direção, dê um passinho nela". É descer uma montanha no nevoeiro sentindo a inclinação sob os pés e dando um passo para baixo de cada vez, até chegar ao fundo do vale.

Em redes neurais, o algoritmo que calcula esses gradientes camada por camada, de trás para frente, se chama **retropropagação (backpropagation)**. É a ideia que faz tudo funcionar, e tem quarenta anos. O "aprendizado", desmistificado, é isto: milhões de pequenos ajustes guiados por quanto se está errando.

### O neurônio artificial e a rede

A unidade básica do deep learning é um neurônio de mentira: ele recebe vários números de entrada, multiplica cada um por um **peso**, soma tudo, adiciona um deslocamento e passa o resultado por uma **função de ativação** (que introduz não linearidade, permitindo aprender relações complexas e não só retas). Um neurônio sozinho é burro. O poder vem de empilhar milhares deles em **camadas**, onde a saída de uma alimenta a próxima. As camadas do meio ("ocultas") aprendem representações cada vez mais abstratas: numa rede que vê rostos, as primeiras camadas detectam bordas, as seguintes detectam olhos e narizes, as finais detectam rostos inteiros. Ninguém programou "olho"; a rede descobriu que isso era útil.

### O inimigo: decorar em vez de aprender

O maior risco em ML é o **overfitting**: o modelo decora os exemplos de treino em vez de aprender o padrão geral, e vai mal com dados novos. É o aluno que decorou as respostas da lista e trava na prova com perguntas diferentes. Por isso os dados são sempre divididos em três: **treino** (para aprender), **validação** (para ajustar as configurações) e **teste** (para medir, uma vez só, como vai com o que nunca viu). A arte do ML aplicado é muito mais garantir que o modelo **generaliza** do que fazê-lo acertar o treino.

## Os tipos de modelo, do simples ao Transformer

Nem tudo é rede neural gigante. Em problemas com dados em tabela (a maior parte do mundo corporativo real), modelos mais simples ainda ganham:

1. **Regressão linear e logística:** as mais simples, para prever um número ou uma probabilidade. Velhas, rápidas, interpretáveis e surpreendentemente úteis.
2. **Árvores de decisão e florestas:** sequências de perguntas sim/não. Combinadas em florestas aleatórias ou em **gradient boosting** (**XGBoost**, **LightGBM**), são as campeãs de competições com dados tabulares. Se o seu problema é uma planilha, provavelmente a resposta é XGBoost, não deep learning.

No deep learning, as arquiteturas que importam:

1. **Redes convolucionais (CNNs):** feitas para imagens. Aplicam filtros que deslizam pela imagem detectando padrões locais, independentemente da posição. Dominaram a visão computacional dos anos 2012 a 2020.
2. **Redes recorrentes (RNN, LSTM, GRU):** feitas para sequências (texto, séries temporais, áudio), processando um elemento de cada vez e carregando uma "memória". Foram o estado da arte em linguagem até 2017, e tinham um problema sério: esqueciam o começo de textos longos e eram lentas de treinar.
3. **Transformers:** a arquitetura que substituiu as RNNs e destravou tudo. A próxima seção é só sobre eles.

### Atenção, a ideia que mudou tudo

O Transformer resolveu os dois problemas das RNNs com um mecanismo chamado **atenção (attention)**. Em vez de ler o texto palavra por palavra guardando uma memória que se dilui, ele olha para **todas as palavras ao mesmo tempo** e, para cada uma, decide quais das outras importam para entendê-la. Na frase "o celular não cabia na mala porque ela era grande", para saber a que "ela" se refere, o modelo "presta atenção" em "mala" e não em "celular". Esse mecanismo de pesar relações entre todos os elementos de uma vez é o que dá ao Transformer a capacidade de entender contexto longo e, de quebra, de ser treinado em paralelo (tudo de uma vez), o que permitiu usar todo aquele poder de GPU e escalar para tamanhos antes impensáveis.

## LLMs por dentro

Os grandes modelos de linguagem (LLMs) são Transformers gigantes treinados para uma tarefa enganosamente simples: **prever o próximo pedaço de texto**. Toda a aparente inteligência emerge disso. Vale abrir a caixa.

### Tokens, embeddings e parâmetros

1. **Tokens:** o modelo não lê letras nem palavras exatas, mas **tokens**, pedaços de palavras. "Inteligência" pode virar dois ou três tokens. Uma regra de bolso: em inglês, um token é mais ou menos 4 caracteres, e 100 tokens dão cerca de 75 palavras. É por tokens que se mede contexto, preço e velocidade.
2. **Embeddings:** cada token vira um vetor de centenas ou milhares de números, uma coordenada num espaço onde significados parecidos ficam perto. Nesse espaço acontece a famosa conta "rei − homem + mulher ≈ rainha": o significado virou geometria. Embeddings são a base não só dos LLMs, mas de busca semântica e de sistemas de recomendação.
3. **Parâmetros:** os pesos que o modelo ajusta no treino. Um modelo "de 70 bilhões de parâmetros" tem 70 bilhões desses números. Mais parâmetros, em geral, significam mais capacidade, mais custo e mais memória. A tendência recente é tornar modelos menores tão bons quanto os grandes de ontem, com dados e treino melhores.

### Como um LLM é criado

Um LLM nasce em etapas, e entender cada uma explica muito do comportamento:

1. **Pré-treino:** o modelo lê uma fração gigantesca da internet, de livros e de código, prevendo o próximo token repetidamente. No fim, sabe gramática, fatos, estilos e um pouco de raciocínio, mas é só um "completador de texto" cru, sem noção de como conversar. Esta fase custa milhões de dólares e meses de GPU; é a parte cara.
2. **Fine-tuning por instrução:** mostra-se ao modelo milhares de exemplos de "pedido e boa resposta", ensinando-o a seguir instruções e a se comportar como assistente, em vez de só continuar o texto.
3. **Alinhamento (RLHF e variantes):** humanos comparam respostas e dizem qual é melhor; o modelo é ajustado por reforço para produzir respostas mais úteis, honestas e seguras. É o que transforma um modelo bruto num assistente educado. Técnicas como RLHF e DPO cuidam disso, e também é onde moram muitas das limitações e dos vieses.
4. **Raciocínio:** os modelos mais recentes passam por um treino adicional para "pensar antes de responder", gerando passos intermediários (uma cadeia de raciocínio) antes da resposta final. Gastam mais cálculo na hora de responder em troca de acertar mais em problemas difíceis de lógica, matemática e código.

### Como um LLM responde

Na hora de usar (a **inferência**), o modelo recebe o seu texto (o contexto) e gera a resposta um token de cada vez, cada token realimentando o próximo. Alguns conceitos práticos:

1. **Janela de contexto:** quanto texto o modelo consegue considerar de uma vez, dos antigos poucos milhares de tokens aos atuais que passam de um milhão (um livro inteiro). Tudo o que estiver fora da janela, o modelo simplesmente não vê.
2. **Temperatura:** o quão "criativo" versus previsível é o próximo token. Temperatura baixa dá respostas determinísticas e repetíveis (bom para código e extração); alta dá variedade (bom para brainstorm).
3. **Alucinação:** como o modelo só prevê texto plausível, ele às vezes inventa com total confiança: cita um artigo que não existe, um processo judicial falso, uma função de biblioteca que nunca foi criada. Não é mentira no sentido humano; é a natureza da máquina, que não distingue "verdadeiro" de "coerente". É o limite mais importante de entender.

### O que se faz por cima do modelo

O modelo sozinho é um motor. O que se usa no dia a dia são sistemas construídos em volta dele:

1. **Prompting:** a arte de pedir bem. Dar contexto, exemplos (few-shot), papéis e instruções claras muda muito o resultado. Pedir para o modelo "pensar passo a passo" (chain of thought) melhora tarefas de raciocínio.
2. **RAG (Retrieval-Augmented Generation):** em vez de confiar na memória do modelo, você busca os documentos relevantes (numa base de dados vetorial, por embeddings) e os entrega no contexto para ele responder com base neles. É como deixar o aluno fazer a prova com o livro aberto: reduz alucinação e permite usar dados privados e atuais sem retreinar o modelo. É a arquitetura mais comum em aplicações corporativas de IA.
3. **Tool use (uso de ferramentas):** o modelo pode chamar funções externas (buscar na web, rodar código, consultar um banco, mandar um email). Deixa de só falar e passa a agir.
4. **Agentes:** modelos que recebem um objetivo e, em laço, raciocinam, usam ferramentas, observam o resultado e seguem até terminar. São a fronteira atual e a fonte das maiores promessas e dos maiores perigos (um agente que lê conteúdo não confiável pode ser manipulado, como vimos na parte de **prompt injection** da [revisão de cibersegurança](/2026/10/27/revisao-fundamentos-de-ciberseguranca/)).
5. **MCP (Model Context Protocol):** um padrão aberto, de 2024, para conectar modelos a ferramentas e fontes de dados de forma uniforme, uma espécie de "USB das integrações de IA", que virou referência rápido.

### Afinando e encolhendo modelos

Nem sempre dá para treinar um modelo do zero (custa fortunas). O que se faz:

1. **Fine-tuning:** ajustar um modelo pronto para um domínio ou estilo, com técnicas eficientes como **LoRA**, que mexem só numa fração dos pesos.
2. **Quantização:** reduzir a precisão dos números (de 16 bits para 4, por exemplo) para o modelo caber em menos memória e rodar até num notebook, com pouca perda de qualidade. É o que torna possível rodar LLMs localmente.
3. **Destilação:** treinar um modelo pequeno para imitar um grande, capturando boa parte da qualidade a uma fração do custo.

## IA que vê e desenha: geração de imagem

A geração de imagem seguiu um caminho paralelo ao da linguagem. As abordagens que importam:

1. **GANs (2014):** duas redes competindo, uma gerando imagens falsas e outra tentando distinguir falso de real, até a geradora enganar a crítica. Produziram os primeiros rostos sintéticos convincentes (o site "this person does not exist"), mas eram instáveis de treinar.
2. **Modelos de difusão (2020 em diante):** a técnica que domina hoje. A ideia é curiosa: pega-se uma imagem real e vai-se adicionando ruído até virar chuvisco puro; depois treina-se uma rede para **reverter** o processo, removendo ruído passo a passo. Na geração, parte-se de ruído aleatório e "desembaça-se" até surgir uma imagem, guiada pelo texto do pedido. É como revelar uma foto no banho químico, só que o químico é cálculo e o guia é a sua frase.

A ponte entre texto e imagem é um modelo como o **CLIP**, que aprendeu a colocar textos e imagens no mesmo espaço de significado, permitindo que "um astronauta a cavalo, estilo aquarela" oriente o que é gerado. Os nomes conhecidos: **Stable Diffusion** (aberto, roda localmente, criou um ecossistema enorme), **DALL·E** (OpenAI), **Midjourney** (famoso pela qualidade estética), **Adobe Firefly** (focado em uso comercial seguro) e **Google Imagen**. A mesma família faz edição: trocar fundos, expandir imagens (outpainting), remover objetos, tudo por texto.

## IA que filma, fala e compõe

### Vídeo

Gerar vídeo é muito mais difícil que imagem, porque além de cada quadro ser bom, eles precisam ser **coerentes no tempo** (um objeto não pode mudar de cor entre um quadro e outro) e respeitar física e movimento. É a fronteira mais vistosa dos últimos anos. Os nomes: **Sora** (OpenAI), **Veo** (Google DeepMind), **Runway**, **Kling** e **Pika**. Já produzem segundos a alguns minutos de vídeo surpreendentemente convincente a partir de texto ou de uma imagem inicial, embora ainda tropecem em mãos, texto escrito na cena e continuidade longa. O impacto em publicidade, cinema e, infelizmente, em desinformação (os **deepfakes**) é enorme, e foi tratado no lado de risco da revisão de cibersegurança.

### Áudio, voz e música

1. **Reconhecimento de fala:** transformar voz em texto. O **Whisper** (OpenAI, aberto) virou o padrão, robusto e multilíngue.
2. **Síntese de voz:** transformar texto em fala natural, e clonar vozes a partir de poucos segundos de amostra. **ElevenLabs** é a referência. A tecnologia é incrível para acessibilidade e dublagem, e assustadora para golpes por telefone.
3. **Música:** **Suno** e **Udio** geram músicas completas, com voz e letra, a partir de uma descrição. **AudioCraft**, da Meta, é a alternativa aberta.

### Multimodalidade: o encontro de tudo

A grande tendência atual é o fim das fronteiras entre esses tipos. Os modelos de ponta são **multimodais**: um só modelo entende e gera texto, imagem, áudio e, cada vez mais, vídeo. Você manda uma foto da geladeira e pergunta o que cozinhar; mostra um gráfico e pede a análise; fala e ele responde falando. Internamente, tudo vira tokens no mesmo espaço, e a mesma arquitetura Transformer processa qualquer modalidade. É o caminho para assistentes que percebem o mundo como nós, por vários sentidos ao mesmo tempo.

## O lado prático: como se constrói e se usa

Teoria à parte, como é trabalhar com isso na prática?

### As ferramentas de quem constrói

1. **Linguagem:** **Python** domina, por folga, por causa do ecossistema.
2. **Frameworks de deep learning:** **PyTorch** é o líder absoluto em pesquisa e cada vez mais em produção; **TensorFlow** (Google) ainda aparece em sistemas legados; **JAX** (Google) é a aposta para cálculo de alto desempenho. Para ML clássico (tabular), **scikit-learn**, **XGBoost** e **LightGBM**.
3. **Hugging Face:** o "GitHub da IA". Hospeda centenas de milhares de modelos e datasets abertos, e as bibliotecas (`transformers`, `datasets`) que viraram o jeito padrão de carregar e usar modelos. É impossível trabalhar com IA aberta sem passar por lá.
4. **Orquestração de aplicações:** **LangChain**, **LlamaIndex** e similares ajudam a montar RAG e agentes; bases vetoriais como **FAISS**, **pgvector**, **Qdrant**, **Milvus** e **Pinecone** guardam os embeddings para a busca semântica.

### O hardware, o verdadeiro combustível

Deep learning é, no fundo, multiplicação de matrizes em massa, e é por isso que as **GPUs** (placas de vídeo), feitas para isso, destravaram a área. A **NVIDIA** domina o mercado, não só pelas placas, mas pelo **CUDA**, a plataforma de software que virou padrão de fato (e o fosso competitivo da empresa). Há alternativas: as **TPUs** do Google, chips da AMD, e aceleradores próprios das grandes nuvens. Treinar os maiores modelos exige milhares dessas placas trabalhando em paralelo por semanas, com técnicas de treino distribuído para dividir o modelo e os dados entre elas, o que conecta esta revisão à de [redes](/2026/10/26/revisao-redes-de-computadores/): a comunicação entre GPUs vira gargalo, e data centers de IA são projetados em torno disso. O custo energético e financeiro é um fator central e crescente da área.

### MLOps: colocar em produção

Treinar um modelo é a parte fácil; mantê-lo útil em produção é **MLOps**, o primo do DevOps. Envolve versionar dados e modelos (**DVC**, **MLflow**), acompanhar experimentos (**Weights & Biases**), servir o modelo de forma escalável, e, principalmente, vigiar o **drift**: o mundo muda, os dados de entrada deixam de parecer os de treino, e o modelo silenciosamente piora. Monitorar um modelo é mais difícil que monitorar um software comum, porque ele pode continuar respondendo sem erro e estar completamente errado.

### Rodar na sua máquina

Nem tudo depende da nuvem. Dá para rodar modelos abertos localmente, com privacidade e sem custo por uso:

1. **Ollama** e **LM Studio:** a forma mais fácil, "instale e rode" um modelo aberto na sua máquina.
2. **llama.cpp:** o motor enxuto que roda LLMs quantizados até em hardware modesto, inclusive sem GPU.
3. **vLLM:** para servir modelos com alto desempenho quando se tem GPU.

A qualidade dos modelos abertos que cabem num notebook subiu tanto que, para muitas tarefas, não é mais preciso mandar nada para fora.

### Usar por API

Para a maioria das aplicações, não se treina nem se hospeda nada: consome-se um modelo por **API**, pagando por token. Os provedores oferecem modelos de tamanhos e preços diferentes (um pequeno e barato para tarefas simples, um grande para as difíceis), e a arte da engenharia passa a ser escolher o modelo certo para cada tarefa, controlar custo, latência e qualidade, e construir as camadas de RAG, ferramentas e validação em volta.

## O mapa das empresas e serviços

O cenário muda rápido, mas as peças principais são estáveis. Pense em camadas.

### Quem faz os modelos de ponta (fechados)

1. **OpenAI:** criadora do ChatGPT e da família **GPT**, muito ligada à Microsoft. Definiu o mercado consumidor.
2. **Anthropic:** criadora do **Claude**, com forte ênfase em segurança e alinhamento, popular entre desenvolvedores e empresas.
3. **Google DeepMind:** criadora do **Gemini**, com a vantagem de infraestrutura própria (TPUs) e integração com os produtos do Google.
4. Outros nomes relevantes: **xAI** (o **Grok**), e, no mercado de imagem e vídeo, os já citados.

### Quem aposta no aberto

1. **Meta:** a família **Llama** popularizou os modelos abertos e sustenta boa parte do ecossistema de quem roda localmente ou ajusta os próprios modelos.
2. **Mistral** (França): modelos abertos e eficientes, referência de IA europeia.
3. **DeepSeek** e **Qwen** (da Alibaba), da China: modelos abertos muito fortes que mudaram a percepção de que só laboratórios ocidentais estavam na fronteira, e a um custo de treino declarado bem menor.

A disputa aberto versus fechado é um dos grandes eixos da área: os fechados tendem a liderar a fronteira de qualidade, os abertos dão controle, privacidade, customização e independência, e a distância entre eles varia de mês para mês.

### A infraestrutura por baixo

1. **NVIDIA:** vende as pás e as picaretas da corrida do ouro, e virou uma das empresas mais valiosas do mundo por isso.
2. **As nuvens:** **AWS**, **Azure** (muito atrelada à OpenAI) e **Google Cloud** alugam o poder de cálculo e oferecem os modelos como serviço gerenciado (Amazon Bedrock, Azure OpenAI, Google Vertex AI).

### A camada de aplicação

Por cima de tudo, milhares de produtos que usam esses modelos via API: assistentes de código (**GitHub Copilot**, **Cursor**, o próprio Claude Code), ferramentas de escrita, atendimento, análise de dados, e os assistentes embutidos em praticamente todo software existente. É a camada onde mais se cria valor (e onde mais há fumaça de marketing). A pergunta útil diante de cada "produto de IA" é sempre: isto é um modelo novo, ou é um aplicativo fino em cima do modelo de outra pessoa?

## O lado honesto: limites e riscos

Nenhuma revisão de IA é honesta sem a parte chata. A tecnologia é real e poderosa, e também é cercada de exagero. Os limites que importam:

1. **Alucinação:** modelos inventam com confiança. Para qualquer uso sério, é preciso verificar, e desenhar sistemas (com RAG, citações, validação) que reduzam o problema, porque eliminá-lo não dá, por enquanto.
2. **Viés:** o modelo aprende dos dados, e os dados carregam os preconceitos do mundo. Sem cuidado, ele os reproduz e amplifica, com consequências reais em crédito, contratação e justiça.
3. **Não "entendem" como nós:** um LLM é um previsor de texto extraordinariamente bom, não um ser que compreende. Ele erra em contas simples, se contradiz, e não tem modelo do mundo nem intenção. Tratá-lo como oráculo é o erro mais comum e mais caro.
4. **Custo e ambiente:** treinar e rodar esses modelos consome energia, água e dinheiro em escala que começa a pesar, ambiental e economicamente.
5. **Dados, direitos e trabalho:** os modelos foram treinados com conteúdo da internet, o que levanta disputas enormes de direitos autorais, e o impacto no trabalho criativo e cognitivo é um debate aberto e sério, não um detalhe.
6. **Segurança:** modelos e agentes são uma superfície de ataque nova (prompt injection, vazamento de dados, modelos envenenados), tema que a [revisão de cibersegurança](/2026/10/27/revisao-fundamentos-de-ciberseguranca/) detalha.
7. **AGI:** a "inteligência artificial geral", de nível humano em tudo, é o objetivo declarado de vários laboratórios e o assunto de muita especulação. Ninguém sabe se a escala atual chega lá, se falta uma ideia nova, ou quão longe estamos. Desconfie tanto de quem garante que é logo ali quanto de quem garante que é impossível.

## Amarrando tudo: um mapa mental

1. **Vocabulário:** IA contém ML, que contém deep learning, que contém a IA generativa de hoje. "IA" na boca do público quase sempre é a fatia generativa.
2. **História:** ondas de entusiasmo e invernos desde 1956; a virada foi dados mais GPUs mais Transformers; o estouro público foi 2022.
3. **Aprender:** ajustar números para errar menos, via função de perda, gradiente e retropropagação; o inimigo é decorar (overfitting) em vez de generalizar.
4. **Arquiteturas:** para tabelas, XGBoost; para imagens, CNNs; para sequências, antes RNNs, hoje Transformers, cuja ideia-chave é a atenção.
5. **LLMs:** Transformers que preveem o próximo token; tokens, embeddings e parâmetros; nascem de pré-treino, instrução e alinhamento; usam-se com prompting, RAG, ferramentas e agentes; alucinam por natureza.
6. **Além do texto:** difusão para imagem, geração de vídeo coerente no tempo, voz e música sintéticas, e a convergência multimodal num só modelo.
7. **Prática:** Python e PyTorch, Hugging Face, GPUs da NVIDIA com CUDA, MLOps para não apodrecer em produção, e a opção de rodar local com Ollama e llama.cpp.
8. **Mercado:** laboratórios de fronteira fechados (OpenAI, Anthropic, Google), apostas abertas (Meta, Mistral, DeepSeek), a infraestrutura (NVIDIA e as nuvens) e a camada de aplicações por cima.
9. **Honestidade:** alucinação, viés, custo, direitos e segurança são limites reais; a AGI é uma pergunta em aberto, não um fato anunciado.

## Quinze perguntas pra se testar

1. **Qual a diferença entre IA, machine learning e deep learning?** São bonecas russas: IA é qualquer técnica que imite inteligência; ML é a fatia que aprende regras a partir de dados; deep learning é o ML feito com redes neurais profundas.

2. **O que é aprendizado supervisionado, não supervisionado e por reforço?** Supervisionado aprende de exemplos com a resposta certa; não supervisionado acha estrutura em dados sem rótulo; por reforço aprende por tentativa e erro com recompensas.

3. **O que significa "treinar" um modelo, no fundo?** Ajustar milhões de números (os pesos) para minimizar uma função de perda, dando passinhos na direção indicada pelo gradiente, com a retropropagação calculando esses gradientes.

4. **O que é overfitting?** Quando o modelo decora o treino em vez de aprender o padrão geral e vai mal com dados novos. Por isso se separam dados de treino, validação e teste.

5. **Por que o Transformer foi tão importante?** Porque o mecanismo de atenção permite olhar todas as palavras de uma vez, entender contexto longo e treinar em paralelo, o que destravou a escala e os LLMs.

6. **O que é um token?** O pedaço de texto que o modelo processa, menor que uma palavra. Contexto, preço e velocidade são medidos em tokens.

7. **O que é um embedding?** A representação de um token (ou texto, ou imagem) como um vetor num espaço onde significados parecidos ficam próximos. É a base da busca semântica e do RAG.

8. **Quais são as fases de criação de um LLM?** Pré-treino (prever o próximo token na internet inteira), fine-tuning por instrução (aprender a obedecer), alinhamento (RLHF, para ser útil e seguro) e, nos recentes, treino de raciocínio.

9. **Por que LLMs alucinam?** Porque só preveem texto plausível, sem distinguir verdadeiro de coerente. Inventam com confiança, e isso é inerente ao funcionamento, não um bug que se conserta fácil.

10. **O que é RAG e que problema resolve?** Buscar documentos relevantes e entregá-los no contexto do modelo para ele responder com base neles. Reduz alucinação e permite usar dados privados e atuais sem retreinar.

11. **O que é um agente de IA?** Um modelo que recebe um objetivo e age em laço (raciocina, usa ferramentas, observa, repete) até concluir. É a fronteira atual, e também uma nova superfície de risco.

12. **Como funcionam os geradores de imagem modernos?** Por difusão: aprendem a remover ruído passo a passo, partindo de chuvisco aleatório e "revelando" uma imagem guiada pelo texto do pedido.

13. **Por que gerar vídeo é mais difícil que gerar imagem?** Porque além de cada quadro ser bom, eles precisam ser coerentes ao longo do tempo e respeitar movimento e física.

14. **Por que a NVIDIA é tão central na IA?** Porque deep learning é multiplicação de matrizes em massa, que as GPUs fazem bem, e o CUDA virou o padrão de software que prende o ecossistema ao hardware dela.

15. **Qual a diferença entre modelos abertos e fechados?** Fechados (GPT, Gemini) tendem a liderar a fronteira e se usam por API; abertos (Llama, Mistral, DeepSeek) dão controle, privacidade e customização, e podem rodar na sua própria máquina.

## Nota

Esta revisão foge um pouco do padrão da trilha, que tratava de camadas estáveis de infraestrutura. IA é o oposto: o campo se move rápido demais para qualquer texto durar. Os fundamentos (como uma máquina aprende, o que é um Transformer, por que um LLM alucina) envelhecem devagar e foram o foco aqui; os nomes de modelos, empresas e recordes de contexto vão estar desatualizados em meses, e são só retratos do momento. Se algo aqui já tiver virado história quando você ler, era de se esperar. Correções e atualizações, como sempre, são bem-vindas.
