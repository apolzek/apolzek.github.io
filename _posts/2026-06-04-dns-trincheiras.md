---
layout: post
title: DNS por quem já viveu nas trincheiras
description:
summary:
# tags: dns linux
minute: 10
---

> A história a seguir é fictícia e tem apenas objetivos didáticos de ensinar sobre o funcionamento do DNS (Domain Name System). Qualquer semelhança com eventos, sistemas ou situações reais é mera coincidência. O conteúdo não descreve fatos reais nem deve ser interpretado como informação factual.

Bem, vamos à definição do que é DNS:

*DNS (Domain Name System) é um sistema distribuído da internet que converte nomes de domínio legíveis por humanos, como www.google.com, em endereços IP, como 142.250.191.14, permitindo que dispositivos localizem e se conectem aos servidores corretos sem que os usuários precisem memorizar números.*

Não tem como isso ser complexo, correto ?

![gif](https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGh0bTlrdXBkczNlNnRld203bzVuYTR2cmFodXdoeWljMWVxYng2ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/jN86rcdOyrpyo/giphy.gif)

### Vamos comecar do inicio

Me contrataram pra "cuidar dos servidores". Ninguém avisou que metade dos meus incidentes começaria com alguém jurando, de alma e coração, que "a internet caiu", quando na real era DNS. É sempre DNS. Existe até um haiku famoso entre sysadmins cujo desfecho é exatamente esse: a culpa, no fim, é do DNS. Esta é a história de como saí de não saber o que era um resolver até virar a pessoa que assina zonas com DNSSEC às três da manhã, xingando. Com sorte, você aprende aqui o que eu aprendi chorando.


### Primeiro dia: três sistemas, a mesma desgraça

Primeiro chamado: um notebook "sem internet" que pingava IP numa boa, mas não abria `intranet`. O número certo, o nome é que não virava número.

Conheci ali o **stub resolver**: a peça mínima dentro do sistema operacional que não resolve nada sozinha, só repassa o pedido pra outra pessoa. E quem é essa pessoa depende do sistema. Naquele primeiro dia, peguei os três.

No **Linux** do dev, abri o de praxe e descobri que quem manda hoje não é mais só o velho arquivo:

```bash
cat /etc/resolv.conf
resolvectl status
```

O `systemd-resolved` cacheia e às vezes guarda rancor; quando eu trocava o servidor e nada mudava, a cura era `resolvectl flush-caches`. E tem o `/etc/nsswitch.conf`, a linha `hosts:`, que decide se ele olha o `/etc/hosts` **antes** do DNS. Foi exatamente isso que sabotou meu teste: um `/etc/hosts` esquecido apontando pro IP errado.

No **Windows** do financeiro, outra liturgia:

```powershell
ipconfig /all          
ipconfig /displaydns   
ipconfig /flushdns     
Resolve-DnsName intranet
```

O Windows tem um serviço chamado **DNS Client** (`dnscache`) que cacheia tudo. Esquecer dele já me custou uma hora de vida.

No **Mac** da designer, terceira religião:

```bash
scutil --dns          
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

No macOS quem cacheia é o **mDNSResponder**, e limpar exige esse combo (o segundo comando chuta o processo). Felizmente `dig` e `host` existem no Mac também, então não fiquei órfão.

A ferramenta que me salvou nos três foi o `dig`. Rodei `dig +trace www.intranet` e vi, ao vivo, a peregrinação: o **resolver recursivo** pergunta a um servidor **raiz**, que não sabe e aponta pro `.com`; o `.com` aponta pro **autoritativo** do domínio; e o autoritativo, o único que conhece a verdade, devolve o IP. Os intermediários nunca respondem de verdade, só dão *referrals*. Essa é a diferença entre consulta **recursiva** ("me resolve inteiro") e **iterativa** ("vira-te com o próximo"). No protocolo são dois bits, **RD** e **RA**, "quero recursão" e "ofereço recursão". Servidor raiz tem RA desligado de propósito: ele não é seu mordomo.

E por que metade das consultas internas ia pra outro lugar ? **Forwarder**. Tudo que terminava em `corp.interno` era encaminhado pro DNS do Active Directory; o resto ia pro mundo. Encaminhamento condicional. Aprendi a diferença entre "forward only" e "forward first" na madrugada em que o AD reiniciou e o "forward only" levou junto.

### Comprando o domínio na GoDaddy (o teatro nos bastidores)

Quando me deixaram comprar o domínio da empresa, fui na GoDaddy, cliquei, paguei, e achei que tinha "comprado um DNS". Comprei um **nome**, que é outra coisa, e finalmente entendi o teatro por trás.

Existem três papéis. Eu sou a **registrante** (dona do nome). A GoDaddy é a **registrar** (a loja). Quem realmente manda no `.com` é a **registry**, a Verisign (a prefeitura do TLD). E por cima de tudo, a **ICANN**. Quando paguei, a GoDaddy não gravou nada por mágica: ela conversou com a registry por um protocolo chamado **EPP** e disse "este nome agora é dela, e os nameservers são esses". Pra consultar quem é dono e quais os NS, dá pra usar o velho `whois`, hoje em boa parte substituído pelo **RDAP**:

```bash
whois meudominio.com
dig NS meudominio.com
```

Por padrão, a GoDaddy já apontava pros nameservers dela. Como eu queria meus próprios autoritativos, troquei a delegação pra `ns1.meudominio.com` e `ns2.meudominio.com`, e caí no quebra-cabeça circular clássico: pra achar o IP de `ns1.meudominio.com`, o mundo teria que perguntar a `meudominio.com`, que só responde via `ns1`. Galinha e ovo. A solução de décadas atende por **glue records**: a zona-pai entrega o IP dos meus nameservers de brinde, junto da delegação.

Duas coisas que a GoDaddy oferecia e eu ignorei por burrice (e que voltariam a me assombrar): o **registrar lock**, que impede transferências não autorizadas, e o **auth code** (código EPP), que é literalmente a senha pra mudar o domínio de registrar. Guarde isso na memória, porque tem alguém querendo essa senha.

E o trauma eterno do iniciante: mudei um registro, salvei, nada. Refiz, nada. Quase abri chamado contra a GoDaddy antes de alguém rir e dizer "TTL". Cada registro tem tempo de vida, e os resolvers do mundo cachearam o valor antigo. Pior ainda: criei um registro novo que "demorou a existir", culpa do **negative caching**, que cacheia o "não existe" pelo tempo do último campo do **SOA**. Desde então eu rodo:

```bash
dig SOA meudominio.com
```

antes de prometer prazo pra qualquer mudança nova..

### O cadeado verde: DNS, certificados e a confiança de um site

Montamos e-mail próprio, e metade do que mandávamos sumia. Primeiro vilão: **PTR**, a resolução reversa (IP vira nome). Servidores sérios desconfiam de quem conecta sem PTR válido, ou que falha no **FCrDNS** (o reverso aponta pra um nome que, resolvido de volta, dá o mesmo IP). Configurei com a operadora e a reputação melhorou. De brinde aprendi o **SRV**, que aponta pra um *serviço* e não a um host, e é como o Active Directory se acha sozinho na rede.

Mas a parte que mudou minha cabeça foi entender de onde vem o cadeado do navegador. Aquele cadeado é um **certificado TLS** assinado por uma autoridade certificadora (CA) em que o navegador confia. A pergunta que eu nunca tinha feito: *como a CA sabe que o domínio é meu ?* Resposta: via DNS. Quando pedi um certificado na Let's Encrypt, ela mandou publicar um registro TXT específico:

```bash
dig TXT _acme-challenge.meudominio.com
```

Esse é o **desafio DNS-01** do protocolo **ACME**: se eu consigo publicar aquele valor no DNS, provo que controlo o DNS, logo controlo o domínio, logo mereço o certificado (e é exatamente assim que se emite certificado curinga, pra `*.meudominio.com`). O DNS é a prova de posse que sustenta a confiança da web inteira. Pare e sinta o peso disso.

Aí veio o susto que justificou o **CAA**. Alguém quase emitiu um certificado pro nosso domínio por uma CA que a gente nem usava. Publiquei e conferi:

```bash
dig CAA meudominio.com

```
declarando "só a Let's Encrypt emite aqui". As CAs são obrigadas a checar isso antes de emitir; uma linha que barra emissão fraudulenta. Existe um nível mais paranoico, o **DANE/TLSA**, que prende o próprio certificado no DNS:

```bash
dig TLSA _443._tcp.meudominio.com
```

mas isso só é seguro se o DNS for inviolável, o que me empurrou, lá na frente, direto pro DNSSEC.

Pra fechar, aprendi a debugar certificado sem abrir navegador (comando que rodei mil vezes, sempre às vésperas de um certificado vencer num domingo):

```bash
echo | openssl s_client -connect meudominio.com:443 -servername meudominio.com 2>/dev/null \
  | openssl x509 -noout -dates -subject -issuer
```

### Crescer dói: escala, latência e o apex teimoso

Veio tráfego do mundo todo e meu DNS estava num datacenter só. Usuário no Japão sofria. A solução é o truque mais elegante do DNS: **anycast**. Você anuncia o mesmo IP de vários lugares (via BGP) e o roteamento entrega cada um ao nó mais perto. É como `1.1.1.1`, `8.8.8.8` e os servidores raiz funcionam, e dá latência baixa, resiliência e absorção de ataque de uma tacada só. No mesmo balaio conheci **GeoDNS** (responder IP diferente por região, a base das CDNs) e o velho **round-robin**, que só rotaciona uma lista e, importante, não sabe se um servidor morreu: continua entregando o IP do cadáver, todo feliz.

Bati então numa parede que enlouquece todo júnior: queria `meudominio.com` puro (sem `www`) apontando pra um host de CDN. O DNS não deixa, porque o ápice já tem SOA e NS, e um CNAME não convive com outros registros. A salvação foram truques de provedor, o **CNAME flattening** da Cloudflare e o **ALIAS** do Route 53, que resolvem o destino por baixo dos panos e devolvem um A normalzinho.

E comecei a publicar os registros novos da turma, **HTTPS/SVCB**, que entregam parâmetros de conexão numa consulta só:

```bash
dig HTTPS meudominio.com
```

Eles anunciam "este site fala HTTP/3" e carregam o **ECH** (Encrypted Client Hello), peça que volta a aparecer no capítulo de privacidade. Em 2026, é assim que um navegador moderno decide ir direto de QUIC e esconder de bisbilhoteiros qual site você abriu.

### Operação Dilúvio: a noite em que o DNS virou alvo

Três e dezessete da manhã, o pager dispara: os autoritativos a 100% de CPU, consultas empilhando, e o site ficando intermitente porque resolver nenhum conseguia resposta. Liguei o laptop achando que era pico de tráfego. Não era.

Rodei o básico e fui pro log:

```bash
dig @ns1.meudominio.com meudominio.com
tail -f /var/log/named/query.log
```

E lá estava o monstro: milhares de consultas por segundo pra subdomínios aleatórios que não existiam, tipo `a7f3k9z.meudominio.com`, `qx12bb8.meudominio.com`, cada um diferente do outro, todos retornando "não existe". Joguei o log numa peneira pra confirmar:

```bash
awk '{print $9}' query.log | sort | uniq -c | sort -rn | head
```

Nomes únicos, sem repetição. Era um ataque de **DNS water torture** (inundação por subdomínio aleatório). O nome aleatório é a sacanagem: como cada um é único, o **negative caching** não ajuda (não há nada repetido pra cachear), então toda consulta vaza até mim, e os atacantes usavam resolvers abertos pelo mundo como megafone, forjando a origem. O objetivo era simples: derreter meu DNS e, com ele, tirar a empresa do ar.

Resolvi em camadas, e cada camada me ensinou na prática um conceito que eu só conhecia da teoria:

Primeiro, sangrar a enxurrada com **Response Rate Limiting** no autoritativo, que corta respostas abusivas por origem. Deu fôlego, mas não matou, porque os nomes eram únicos.

Segundo, joguei os autoritativos pra trás de uma rede **anycast** (aquele truque da quarta parte, mesmo IP em vários lugares), o que diluiu o ataque entre os pontos em vez de concentrar tudo num servidor. O DNS voltou a respirar.

Terceiro, montei uma **RPZ** (um firewall de DNS) pra derrubar exatamente aquele padrão de lixo e limitar por origem, e confirmei que eu não estava, por descuido, rodando um resolver aberto que pudesse virar parte de uma **amplificação** contra outra vítima. Acionei o upstream sobre filtro de origem forjada (BCP38), que é o que mataria a brincadeira na raiz.

Aquela noite me deixou paranoica do jeito certo. Eu já tinha ouvido a lenda do **ataque de Kaminsky** de 2008, quando o número de transação do DNS, de só 16 bits, era adivinhável e dava pra envenenar o cache de um resolver inteiro (o famoso *cache poisoning*); a correção foi randomizar a porta de origem, e existe até o truque do **0x20**, que embaralha maiúsculas e minúsculas do nome (`WwW.eXeMpLo`) pra denunciar respostas forjadas. Mas tudo isso são curativos. Saí daquele plantão querendo uma coisa só: poder provar, matematicamente, que uma resposta DNS é autêntica. Esse desejo tem nome, e ele me daria muito trabalho.

### Assinando a verdade: a saga do DNSSEC

**DNSSEC** é a ideia de que cada resposta venha assinada de um jeito que ninguém falsifica. A execução é uma matrioska. A zona ganha uma **DNSKEY** (chave pública); cada conjunto de registros passa a vir com uma **RRSIG** (a assinatura). Como confiar na DNSKEY ? Por um **DS**, um resumo dela que eu publico na zona-pai, lá no registrar (sim, de volta na GoDaddy do capítulo 2). A raiz assina o DS do `.com`, o `.com` assina o meu, e eu assino meus registros: essa é a **cadeia de confiança**, ancorada numa chave da raiz que vem embutida nos sistemas e é trocada em cerimônias públicas, com testemunhas e cofre (não é piada).

Por segurança, separamos em duas chaves: a **KSK** assina só as chaves e é a que o DS aponta; a **ZSK** assina o resto. Assim eu giro a ZSK sozinha e sempre, deixando a KSK (que mexe com o pai) pra eventos raros e cuidadosos. E como provar, assinado, que um nome *não* existe ? Com **NSEC**, ou melhor, **NSEC3**, que troca nomes por hashes pra ninguém sair listando minha zona inteira; TLDs gigantes usam NSEC3 com *opt-out* pra não ter que assinar o infinito.

Foi aqui que o **EDNS0** fez sentido: o DNS nasceu limitado a 512 bytes por resposta UDP, e assinatura estoura isso fácil; o EDNS0 permite respostas maiores e diz "pode mandar as assinaturas junto". Pra validar e debugar, troquei o `dig` puro por:

```bash
dig +dnssec meudominio.com   # mostra as RRSIG e o bit DO
delv meudominio.com          # valida e fala se está "fully validated"
```

A lição mais dolorosa não foi sobre ataque, foi sobre tiro no pé. **Assinaturas RRSIG expiram.** Num fim de semana, a automação de re-assinatura falhou, as assinaturas venceram, e todo resolver validador do planeta passou a responder **SERVFAIL** pro meu domínio. O site não foi hackeado. Ele simplesmente sumiu, por minha conta. DNSSEC dá segurança e tira o sono em doses iguais. (E o **DANE/TLSA** do capítulo 3 só agora fazia sentido pra mim: prender certificado no DNS só vale se o DNS for inviolável.)

### Privacidade, anonimato e o DNS de 2026

A virada seguinte não foi sobre falsificação, foi sobre bisbilhotagem. Por décadas, toda consulta DNS trafegou em texto puro: qualquer um no caminho via cada site que você abria. Em 2026, isso é, em grande parte, passado.

Hoje o DNS anda criptografado, e em vários sabores. Tem o **DoT** (DNS over TLS, porta 853), que é o que o Android usa no "Private DNS"; o **DoH** (DNS over HTTPS, porta 443), que se esconde dentro do tráfego web e por isso é ótimo contra censura e um pesadelo pra mim, que administro rede corporativa (ele contorna meus filtros, e eu desabilito por política onde preciso de controle); o **DoQ**, sobre QUIC, mais rápido; e o mais esperto de todos, o **ODoH**, que põe um proxy no meio pra que o resolver veja a pergunta mas não você, e o proxy veja você mas não a pergunta (a parceria Cloudflare + Apple demonstrou isso). Pra testar, o `kdig` do Knot fala esses protocolos:

```bash
kdig +tls   @1.1.1.1 meudominio.com
kdig +https @https://cloudflare-dns.com/dns-query meudominio.com
resolvectl status   # no Linux mostra se o DoT está ativo por interface
```

Em 2026 também virou padrão a **QNAME minimization**: o resolver conta pra cada servidor só o pedaço necessário (pra raiz, só `.com`; pro TLD, só `meudominio.com`), então os operadores da raiz não veem mais tudo que você acessa. No sentido oposto, por um bom motivo, existe o **ECS**, em que o resolver conta sua sub-rede ao autoritativo pra a CDN te mandar pro nó mais perto; é troca de privacidade por velocidade, e por isso o `1.1.1.1` não manda ECS enquanto o `8.8.8.8` manda pra parceiros.

Agora, a parte que poucos contam: **criptografar o DNS não te deixa anônimo.** Por anos, mesmo com DNS cifrado, o nome do site ainda vazava no SNI do TLS. É aí que entra o **ECH** lá do capítulo 4, que em 2026 está se espalhando e fecha essa fresta. Mesmo assim, sobra o IP de destino e o padrão de tráfego: privacidade de DNS não é anonimato. Pra anonimato de verdade você precisa de algo como o **Tor**, que resolve nomes pela própria rede dele (tem até a ferramenta `tor-resolve`) em vez de pelo seu resolver, e ainda assim com ressalvas. E nada disso adianta se o resolver público que você escolheu guarda log de tudo: a política de retenção de quem você confia importa tanto quanto o protocolo. (No horizonte de 2026, já se discute assinatura pós-quântica pro DNSSEC, mas isso ainda é mais laboratório que produção.)

### Epílogo. Tudo numa tecla Enter

Anos depois, ainda sorrio com o tanto que acontece quando alguém digita `https://www.meudominio.com` e dá Enter, sem fazer a menor ideia:

o **stub resolver** (no Windows, no Linux ou no Mac, cada um com sua manha e seu cache teimoso) entrega ao **recursivo**, talvez por **DoH** cifrado; o recursivo sobe a hierarquia com **QNAME minimization**, contando o mínimo a cada degrau; em cada passo ele pode validar **DNSSEC** (DS, DNSKEY, RRSIG), usando **EDNS0** pra caber as assinaturas; o **autoritativo**, em **anycast** e olhando o **ECS**, devolve um registro **HTTPS** com **ECH** que manda o navegador ir de QUIC e esconder o SNI; o **certificado** que pinta o cadeado existe porque um dia eu publiquei um TXT provando posse do domínio; e se aquela rede roda uma **RPZ**, tudo isso pode ser barrado antes mesmo de começar.

Cada peça nasceu pra resolver escala, latência, privacidade ou segurança, e quase nunca trabalham sozinhas. "DNS é simples", continuam me dizendo. É simples como um iceberg: a pontinha que você vê, e os anos de engenharia (e plantões) que seguram tudo embaixo d'água. E quando der ruim, respire fundo, porque você já sabe a resposta: é sempre DNS.


## DNS terminology reference

| Term | Description |
|------|-------------|
| DNS (Domain Name System) | A distributed naming system that translates human-readable domain names (e.g., example.com) into IP addresses used by machines to locate and communicate with servers on the internet. |
| Domain | A human-friendly identifier for a network resource, typically used to represent websites and services instead of numeric IP addresses. |
| IP Address | A numerical identifier assigned to devices on a network, used to route traffic to the correct destination (IPv4 or IPv6). |
| Resolver (DNS Resolver) | A server or system component that receives DNS queries from clients and performs the necessary lookup process to return the corresponding IP address. |
| Stub Resolver | A lightweight DNS client built into an operating system that forwards DNS queries to a recursive resolver without performing full resolution itself. |
| DNS Cache | A temporary storage mechanism that keeps previously resolved DNS records to reduce lookup time and network traffic. |
| TTL (Time To Live) | A value that defines how long a DNS record can be cached before it must be refreshed from authoritative sources. |
| A Record | A DNS record type that maps a domain name to an IPv4 address. |
| AAAA Record | A DNS record type that maps a domain name to an IPv6 address. |
| TXT Record | A flexible DNS record type used to store arbitrary text data, often for verification, SPF, DKIM, and ACME challenges. |
| NS Record | A DNS record that specifies which authoritative name servers are responsible for a domain or zone. |
| CNAME Record | A DNS record that aliases one domain name to another canonical domain name. |
| SOA (Start of Authority) | A DNS record that defines the authoritative information about a DNS zone, including serial number, refresh intervals, and administrative data. |
| PTR Record | A reverse DNS record that maps an IP address back to a domain name, commonly used for verification and email reputation. |
| SRV Record | A DNS record that defines the location (host and port) of specific services such as SIP or Active Directory. |
| CAA Record | A security-related DNS record that specifies which certificate authorities are allowed to issue TLS certificates for a domain. |
| DNS Recursion | A process where a DNS resolver performs multiple queries on behalf of the client until it obtains the final answer. |
| Iterative Query | A DNS query method where each server returns the best information it has, typically a referral to another DNS server. |
| Root DNS Server | The top-level servers in the DNS hierarchy that direct queries to appropriate top-level domain (TLD) servers. |
| TLD (Top-Level Domain) | The highest level in the DNS hierarchy, such as .com, .org, or country-specific domains like .br. |
| Authoritative DNS Server | A DNS server that holds the original and definitive records for a domain zone. |
| Glue Record | A DNS record that provides the IP address of a name server within the same domain it is authoritative for, preventing circular dependencies. |
| Zone Delegation | The process of assigning responsibility for a DNS zone to specific authoritative name servers. |
| Forwarder | A DNS server that forwards unresolved queries to another DNS server for resolution. |
| Conditional Forwarding | A configuration where DNS queries for specific domains are forwarded to designated DNS servers. |
| Negative Caching | The caching of failed DNS lookups (e.g., non-existent domains) to reduce repeated queries for missing records. |
| EDNS0 | An extension to DNS that allows larger packet sizes and additional functionality beyond the original DNS protocol limits. |
| Anycast | A routing technique where multiple servers share the same IP address, and requests are routed to the nearest available instance. |
| GeoDNS | A DNS technique that returns different responses based on the geographic location of the client. |
| Round-Robin DNS | A simple load balancing method that rotates multiple IP addresses for a single domain name. |
| CNAME Flattening | A DNS feature that resolves CNAME records at the apex of a domain and returns A/AAAA records instead. |
| ALIAS Record | A non-standard DNS record type that behaves similarly to CNAME but works at the root domain level. |
| DNSSEC | A set of security extensions that add cryptographic signatures to DNS records to ensure authenticity and integrity. |
| RRSIG | A DNSSEC record containing cryptographic signatures for DNS data sets. |
| DNSKEY | A DNSSEC record that stores the public key used to verify DNS signatures. |
| DS Record | A record used to link a child DNS zone to its parent zone in DNSSEC, forming a chain of trust. |
| KSK (Key Signing Key) | A DNSSEC key used specifically to sign other DNS keys within a zone. |
| ZSK (Zone Signing Key) | A DNSSEC key used to sign the actual DNS zone records. |
| NSEC / NSEC3 | DNSSEC mechanisms used to prove that a DNS record does not exist, preventing spoofing of negative responses. |
| DoT (DNS over TLS) | A protocol that encrypts DNS queries using TLS to improve privacy and security. |
| DoH (DNS over HTTPS) | A method of sending DNS queries over HTTPS, hiding them within regular web traffic. |
| DoQ (DNS over QUIC) | A DNS transport protocol using QUIC for lower latency and improved performance. |
| ODoH (Oblivious DNS over HTTPS) | A privacy-enhanced DNS protocol that separates client identity from query content using a proxy layer. |
| ECS (EDNS Client Subnet) | An extension that includes part of the client’s IP subnet in DNS queries to improve geolocation-based responses. |
| QNAME Minimization | A privacy technique where DNS resolvers only send the minimal required portion of a query to upstream servers. |
| RPZ (Response Policy Zone) | A DNS-based filtering mechanism used to block or redirect malicious or unwanted domains. |
| RRL (Response Rate Limiting) | A mechanism used by authoritative DNS servers to mitigate abuse by limiting response rates. |
| DNS Water Torture Attack | A type of DNS flood attack using randomized subdomains to overwhelm authoritative servers. |
| Cache Poisoning | A security attack that injects false DNS data into a resolver’s cache. |
| Kaminsky Attack | A classic DNS cache poisoning exploit that abuses predictable transaction IDs in DNS queries. |
| 0x20 Encoding | A DNS security technique that randomizes letter casing in queries to detect forged responses. |