---
layout: post
title: Catálogo dos Principais Protocolos de Rede
minute: 42
secret: true
---

| # | Protocolo | O que faz e onde aparece |
|---|-----------|--------------------------|
| 1 | HTTP | Pede e devolve recursos identificados por URL, com verbos e códigos de status; é a base de sites, APIs REST e webhooks |
| 2 | HTTPS | É o mesmo HTTP dentro de uma sessão TLS, com cifra e identidade do servidor comprovada por certificado; hoje é o caso normal em qualquer site público |
| 3 | HTTP/2 | Multiplexa várias requisições numa única conexão TCP e comprime cabeçalhos; usado por CDNs, navegadores e como transporte do gRPC |
| 4 | HTTP/3 | Roda o HTTP sobre QUIC, eliminando o bloqueio de cabeça de fila do TCP; padrão em Google, Cloudflare e navegadores atuais |
| 5 | QUIC | Transporte cifrado sobre UDP com handshake de uma viagem e conexão que sobrevive a troca de rede; base do HTTP/3, de jogos e de streaming |
| 6 | WebSocket | Transforma uma conexão HTTP em canal bidirecional persistente; chats, dashboards ao vivo e editores colaborativos |
| 7 | WSS | WebSocket dentro de TLS; obrigatório quando a página que abre o canal é servida por HTTPS |
| 8 | WebRTC | Negocia e transporta áudio, vídeo e dados diretamente entre navegadores, furando NAT pelo caminho; Meet, Discord e atendimento por vídeo |
| 9 | gRPC | RPC com contrato em protobuf, streaming nos dois sentidos e códigos de erro próprios, sobre HTTP/2; conversa entre microsserviços |
| 10 | SOAP | Troca mensagens XML com envelope, cabeçalhos de segurança e contrato WSDL; integrações bancárias, ERPs e web services corporativos |
| 11 | XML-RPC | Chama métodos remotos com parâmetros serializados em XML sobre HTTP; WordPress, Pingback e sistemas antigos |
| 12 | JSON-RPC | Pedido e resposta em JSON com método, parâmetros e id; nós blockchain e o Language Server Protocol dos editores |
| 13 | GraphQL | Deixa o cliente descrever num único pedido exatamente os campos que quer receber; APIs de apps móveis e portais com muitas telas |
| 14 | WebDAV | Estende o HTTP com escrita, travas e coleções para tratar o servidor como sistema de arquivos; Nextcloud, SharePoint e discos montados |
| 15 | CalDAV | Sincroniza eventos, convites e agendas por cima do WebDAV; iCloud, Fastmail e servidores de calendário corporativos |
| 16 | CardDAV | Sincroniza contatos no mesmo modelo do CalDAV; agenda do iPhone e clientes de e-mail de desktop |
| 17 | WebFinger | Descobre onde mora uma identidade a partir de um endereço parecido com e-mail; Mastodon e fluxos OpenID |
| 18 | ActivityPub | Entrega mensagens assinadas entre servidores sociais independentes; Mastodon, PeerTube e o resto do Fediverso |
| 19 | WebSub | Avisa assinantes por push quando um feed muda, em vez de deixá-los consultando sem parar; blogs, podcasts e agregadores |
| 20 | WHOIS | Devolve em texto quem registrou um domínio ou um bloco de IP e como contatá-lo; investigação de abuso e checagem de titularidade |
| 21 | RDAP | Faz o que o WHOIS faz, mas com respostas em JSON, autenticação e referência entre registros; padrão atual dos registradores |
| 22 | TLS | Autentica o servidor por certificado, negocia chaves e cifra tudo que passa; sustenta HTTPS, SMTP, IMAP, VPNs e bancos de dados |
| 23 | DTLS | Leva a cifra e a autenticação do TLS para datagramas que podem chegar fora de ordem ou se perder; WebRTC, CoAP e VPNs |
| 24 | ACME | Prova controle do domínio por um desafio automatizado e emite ou renova o certificado sozinho; Let's Encrypt, certbot e balanceadores |
| 25 | OCSP | Pergunta à autoridade certificadora se um certificado foi revogado, em vez de baixar uma lista inteira; navegadores e servidores TLS |
| 26 | SCEP | Provisiona certificados em massa em equipamentos que não têm quem digite nada; roteadores, VPNs e gestão de dispositivos móveis |
| 27 | EST | Sucessor do SCEP, faz o enrollment de certificados sobre HTTPS com autenticação mútua; redes corporativas e IoT gerenciada |
| 28 | OpenPGP | Cifra e assina mensagens e arquivos com chaves de confiança descentralizada; e-mail seguro e assinatura de pacotes e releases |
| 29 | S/MIME | Cifra e assina e-mail usando certificados emitidos por uma autoridade; Outlook e ambientes corporativos e governamentais |
| 30 | Signal Protocol | Faz troca de chaves com sigilo futuro e chaves que giram a cada mensagem; Signal, WhatsApp e Messenger |
| 31 | OTR | Cifra conversas ponto a ponto com negação plausível; mensageria XMPP, hoje bastante substituído por OMEMO e Signal |
| 32 | MLS | Leva criptografia fim a fim para grupos grandes com entrada e saída eficientes de membros; padrão recente para chats corporativos |
| 33 | SSH | Autentica por chave, abre shell remoto e ainda serve de túnel para outras portas; administração de servidores e equipamentos de rede |
| 34 | SFTP | Transfere e manipula arquivos dentro de uma sessão SSH, com permissões e retomada; automação, backup e troca com parceiros |
| 35 | SCP | Copia arquivos sobre SSH com sintaxe de cp remoto; scripts antigos e cópias rápidas entre servidores |
| 36 | Mosh | Mantém a sessão remota viva ao trocar de rede e ecoa o que você digita antes da resposta chegar; links lentos e conexões móveis |
| 37 | Telnet | Abre sessão de texto sem nenhuma cifra; sobrevive em laboratório, equipamento industrial antigo e como teste de porta TCP |
| 38 | FTP | Separa canal de controle e de dados para listar e transferir arquivos; hospedagem, transferência entre empresas e equipamentos antigos |
| 39 | FTPS | FTP com TLS por cima, cifrando login e dados; sobrevive onde o parceiro não aceita SFTP |
| 40 | TFTP | Transferência mínima sobre UDP, sem autenticação nem listagem; boot de rede e atualização de firmware de switches e telefones IP |
| 41 | rsync | Compara origem e destino e transfere apenas as diferenças; backup incremental, espelho de repositórios e deploy de arquivos |
| 42 | XMODEM | Envia arquivos em blocos com checksum por porta serial; recuperação de firmware em console de equipamento |
| 43 | ZMODEM | Transferência serial com retomada automática e blocos maiores; roteadores, BBS e sistemas embarcados |
| 44 | NFS | Monta diretórios remotos como se fossem locais, com semântica de arquivo Unix; clusters, laboratórios e storage compartilhado |
| 45 | NFSv4 | Junta tudo numa porta só, mantém estado e traz ACLs e Kerberos; padrão em ambientes Linux modernos |
| 46 | pNFS | Separa metadados dos dados para que vários clientes leiam de vários servidores ao mesmo tempo; storage de alto desempenho |
| 47 | SMB/CIFS | Compartilha arquivos, impressoras e pipes nomeados na rede Windows; unidade mapeada, GPO e perfis de usuário |
| 48 | SMB2/SMB3 | Reduz a conversa do protocolo antigo e acrescenta cifra, multicanal e RDMA; Windows atual, Samba e storage de VMs |
| 49 | iSCSI | Encapsula comandos SCSI em TCP para entregar disco de bloco pela rede; SAN de baixo custo e boot de servidores sem disco |
| 50 | Fibre Channel (FCP) | Rede dedicada de baixa latência para tráfego de blocos entre servidores e storage; SANs corporativas |
| 51 | FCoE | Coloca quadros Fibre Channel dentro de Ethernet sem perdas para unir as duas redes; datacenters convergentes |
| 52 | NVMe-oF | Estende as filas do NVMe pela rede com RDMA ou Fibre Channel; storage flash de altíssimo desempenho |
| 53 | NVMe/TCP | Faz o mesmo do NVMe-oF usando TCP comum, sem placa especial; storage moderno em rede Ethernet padrão |
| 54 | SMTP | Entrega e repassa mensagens entre servidores de e-mail, com filas e tentativas; espinha dorsal do correio eletrônico |
| 55 | ESMTP | Extensões negociadas no início da sessão SMTP, como STARTTLS, AUTH e SIZE; presente em qualquer servidor atual |
| 56 | SMTPS | SMTP em TLS implícito na porta 465; envio de clientes que não usam STARTTLS |
| 57 | Submission | Porta 587 dedicada ao envio autenticado pelo cliente, separada do relay entre servidores; combate a spam de origem |
| 58 | LMTP | Entrega mensagens ao mailstore com resposta por destinatário, evitando fila dupla; Dovecot e Cyrus |
| 59 | POP3 | Baixa mensagens para o cliente e tradicionalmente as remove do servidor; contas antigas e integrações simples |
| 60 | POP3S | POP3 dentro de TLS na porta 995; o modo em que ele ainda deve ser usado |
| 61 | IMAP | Mantém a caixa no servidor com pastas, flags e busca, para acesso de vários dispositivos; clientes de e-mail em geral |
| 62 | IMAPS | IMAP sobre TLS na porta 993; configuração padrão em qualquer provedor sério |
| 63 | ManageSieve | Permite ao cliente instalar e editar filtros Sieve no servidor; regras de caixa de entrada em Dovecot e Fastmail |
| 64 | MAPI | Protocolo rico do Outlook com Exchange, cobrindo e-mail, agenda, tarefas e permissões; ambientes Microsoft |
| 65 | Exchange ActiveSync | Sincroniza e-mail, agenda e contatos em celulares e aplica políticas de dispositivo; Exchange e Microsoft 365 |
| 66 | SPF | Publica no DNS quais servidores podem enviar em nome do domínio; primeira barreira contra remetente forjado |
| 67 | DKIM | Assina cabeçalhos e corpo com chave privada e publica a pública no DNS; prova origem e integridade da mensagem |
| 68 | DMARC | Diz o que fazer quando SPF e DKIM não alinham com o domínio visível e pede relatórios; política antifraude do domínio |
| 69 | ARC | Preserva o resultado da autenticação quando a mensagem passa por listas e encaminhadores; evita falso positivo em DMARC |
| 70 | MTA-STS | Publica por HTTPS a exigência de TLS válido entre servidores de e-mail; impede downgrade em trânsito |
| 71 | TLS-RPT | Recebe relatórios diários de falha de TLS na entrega; diagnóstico de MTA-STS e DANE |
| 72 | NNTP | Distribui e replica artigos entre servidores de notícias; Usenet e arquivos de listas |
| 73 | NNTPS | NNTP dentro de TLS; provedores de Usenet comerciais |
| 74 | DNS | Traduz nomes em endereços e outros registros por uma hierarquia de servidores com cache; a camada de indireção da internet |
| 75 | DNSSEC | Assina zonas para que o resolvedor prove que a resposta não foi forjada nem alterada; raiz, TLDs e domínios sensíveis |
| 76 | DoT | Coloca as consultas DNS dentro de TLS na porta 853; resolvedores de sistema operacional e Android |
| 77 | DoH | Envia consultas DNS como requisições HTTPS, indistinguíveis do resto do tráfego web; navegadores e resolvedores públicos |
| 78 | DoQ | DNS sobre QUIC, com menos latência de handshake que DoT; resolvedores recentes e redes móveis |
| 79 | mDNS | Resolve nomes .local por multicast, sem servidor nenhum; impressoras, Chromecast e dispositivos de casa |
| 80 | DNS-SD | Usa registros DNS para anunciar e descobrir serviços por tipo; Bonjour, AirPrint e descoberta em LAN |
| 81 | LLMNR | Resolução de nomes local da Microsoft quando o DNS falha; alvo clássico de ataques de spoofing em pentest |
| 82 | NetBIOS-NS | Registra e resolve nomes NetBIOS na LAN; redes Windows antigas e compartilhamentos legados |
| 83 | NetBIOS Session Service | Abre sessões TCP na porta 139 para SMB antigo; ainda visto em servidores de arquivo legados |
| 84 | NetBIOS Datagram Service | Envia datagramas e broadcasts de navegação na rede Windows; lista de vizinhança clássica |
| 85 | LDAP | Consulta e altera um diretório hierárquico de usuários, grupos e atributos; login corporativo e catálogo de endereços |
| 86 | LDAPS | LDAP dentro de TLS na porta 636; exigido para trocar senha no Active Directory |
| 87 | Kerberos | Emite tíquetes com tempo de vida curto para autenticar sem trafegar senha; domínios Windows, NFS e Hadoop |
| 88 | SSDP | Anuncia e procura dispositivos na LAN por multicast; descoberta UPnP em TVs, roteadores e media servers |
| 89 | UPnP | Descreve dispositivos e serviços em XML e permite controlá-los sem configuração; TVs, consoles e media servers |
| 90 | UPnP IGD | Deixa a aplicação abrir porta no roteador sozinha; jogos, torrent e um risco de exposição clássico |
| 91 | DLNA | Padroniza descoberta e streaming de mídia entre aparelhos da casa; TVs, consoles e NAS |
| 92 | AirPlay | Espelha tela e envia áudio e vídeo entre aparelhos Apple; Apple TV, caixas de som e projetores |
| 93 | Google Cast | Manda a URL do conteúdo para o dispositivo tocar sozinho, em vez de espelhar; Chromecast e TVs Android |
| 94 | Miracast | Espelha a tela por Wi-Fi Direct, sem passar por roteador; notebooks Windows e projetores |
| 95 | RADIUS | Centraliza autenticação, autorização e contabilidade de acesso à rede; Wi-Fi corporativo, VPN e provedores de banda larga |
| 96 | RadSec | Leva o RADIUS para TCP com TLS, resolvendo o segredo compartilhado fraco e a perda de pacotes; roaming entre operadoras e eduroam |
| 97 | Diameter | Sucessor do RADIUS com sessões confiáveis e mensagens extensíveis; cobrança e políticas em redes 4G e 5G |
| 98 | TACACS+ | Separa autenticação de autorização e registra cada comando digitado; controle de acesso de administradores a switches e roteadores |
| 99 | IEEE 802.1X | Mantém a porta fechada até o dispositivo se autenticar; Wi-Fi corporativo e portas de switch em escritórios |
| 100 | EAP | Moldura genérica que carrega o método de autenticação escolhido pelas pontas; usado dentro de 802.1X, Wi-Fi e PPP |
| 101 | EAPOL | Transporta mensagens EAP diretamente sobre o quadro Ethernet ou Wi-Fi, antes de existir IP; início de toda sessão 802.1X |
| 102 | EAP-TLS | Autentica cliente e servidor por certificado, sem senha nenhuma; Wi-Fi corporativo e redes com PKI própria |
| 103 | EAP-TTLS | Cria um túnel TLS com o servidor e só então envia a credencial interna; provedores e universidades |
| 104 | PEAP | Túnel TLS com MS-CHAPv2 dentro, o mais comum em Windows; Wi-Fi corporativo integrado ao Active Directory |
| 105 | EAP-SIM | Autentica pelo cartão SIM 2G e 3G; offload de celular para Wi-Fi de operadora |
| 106 | EAP-AKA | Faz o mesmo pelo USIM de 4G e 5G, com autenticação mútua; hotspots Passpoint e chamadas por Wi-Fi |
| 107 | PAP | Envia usuário e senha em texto claro dentro do PPP; legado, aceitável só dentro de um túnel já cifrado |
| 108 | CHAP | Autentica por desafio e resposta, sem trafegar a senha; enlaces PPP e conexões discadas |
| 109 | MS-CHAPv2 | Versão Microsoft do desafio e resposta, com autenticação mútua e fraquezas conhecidas; VPNs antigas e PEAP |
| 110 | NTLM | Desafio e resposta do Windows anterior ao Kerberos; SMB, IIS e o alvo preferido de ataques de relay |
| 111 | SPNEGO | Negocia qual mecanismo usar, normalmente Kerberos com NTLM como reserva; autenticação integrada em HTTP e SMB |
| 112 | GSSAPI | Interface única para autenticação e cifra que esconde o mecanismo por baixo; Kerberos em SSH, NFS e LDAP |
| 113 | SASL | Encaixa mecanismos de autenticação em protocolos de aplicação; IMAP, SMTP, LDAP, XMPP e Kafka |
| 114 | OAuth 2.0 | Emite tokens de acesso com escopo limitado para que um app use a API sem ver a senha; "entrar com" e integrações entre SaaS |
| 115 | OpenID Connect | Acrescenta identidade ao OAuth com um token assinado que diz quem é o usuário; login social e SSO moderno |
| 116 | SAML 2.0 | Troca asserções XML assinadas entre provedor de identidade e aplicação; SSO corporativo com Okta, ADFS e Entra ID |
| 117 | SCIM | Cria, altera e desativa usuários e grupos entre sistemas por API; onboarding e desligamento automatizados em SaaS |
| 118 | WebAuthn | Autentica por chave criptográfica ligada ao domínio, imune a phishing; passkeys e login sem senha no navegador |
| 119 | CTAP2 | Fala com o autenticador em si por USB, NFC ou Bluetooth; YubiKey, Windows Hello e o celular como chave |
| 120 | TOTP | Deriva um código de seis dígitos do relógio e de um segredo compartilhado; segundo fator em apps autenticadores |
| 121 | HOTP | Mesma ideia, mas contando eventos em vez de tempo; tokens físicos de banco e cartões de senha |
| 122 | IPv4 | Endereça hosts em 32 bits e roteia pacotes salto a salto; ainda carrega a maior parte do tráfego da internet |
| 123 | IPv6 | Endereça em 128 bits, dispensa NAT e simplifica o cabeçalho; obrigatório em redes móveis e padrão em provedores novos |
| 124 | ICMP | Reporta erros e testa alcance da rede; é o que faz ping, traceroute e a descoberta de MTU existirem |
| 125 | ICMPv6 | Faz o mesmo no IPv6 e ainda carrega descoberta de vizinhos e multicast; bloqueá-lo por inteiro quebra a rede |
| 126 | ARP | Descobre o endereço MAC correspondente a um IP na mesma LAN; base de toda comunicação Ethernet e alvo de spoofing |
| 127 | Proxy ARP | Faz o roteador responder ARP no lugar de um host de outra sub-rede; correção de rede mal segmentada e VPNs |
| 128 | NDP | Resolve vizinhos, encontra roteadores e detecta endereço duplicado no IPv6; substitui ARP e parte do DHCP |
| 129 | SLAAC | Deixa o host montar o próprio endereço IPv6 a partir do prefixo anunciado; redes domésticas e móveis |
| 130 | IGMP | Informa ao switch e ao roteador em quais grupos multicast o host quer entrar; IPTV e distribuição de vídeo interno |
| 131 | MLD | Faz o papel do IGMP em IPv6, dentro do ICMPv6; multicast em redes IPv6 e descoberta de serviços |
| 132 | IPsec | Cifra e autentica no nível do pacote IP, transparente para a aplicação; VPN site a site e acesso remoto |
| 133 | AH | Garante integridade e origem do pacote sem cifrar o conteúdo; raro hoje, atrapalha NAT |
| 134 | ESP | Cifra e autentica o payload IP; é o que efetivamente carrega o tráfego das VPNs IPsec |
| 135 | ISAKMP | Define o formato das mensagens de negociação de associações de segurança; moldura usada pelo IKE |
| 136 | IKEv1 | Negocia chaves IPsec em duas fases, com modos main e aggressive; VPNs antigas ainda em produção |
| 137 | IKEv2 | Negociação mais simples e resiliente, com MOBIKE para trocar de rede sem cair; VPN de celular e site a site |
| 138 | WireGuard | Túnel cifrado minúsculo em UDP com chaves fixas e roteamento por chave pública; VPN moderna em servidores e celulares |
| 139 | OpenVPN | VPN em espaço de usuário com TLS, capaz de passar por porta 443; provedores comerciais e acesso remoto corporativo |
| 140 | L2TP | Cria túnel de camada 2 sem cifra própria, quase sempre combinado com IPsec; VPN nativa de sistemas operacionais |
| 141 | L2TPv3 | Transporta circuitos Ethernet ponto a ponto sobre IP; pseudowires em operadoras |
| 142 | SSTP | VPN da Microsoft encapsulada em HTTPS para atravessar firewall restritivo; clientes Windows |
| 143 | GRE | Encapsula qualquer protocolo dentro de IP, sem cifra; túneis entre roteadores, DMVPN e proteção anti-DDoS |
| 144 | mGRE | Um único túnel GRE que fala com muitos pares dinamicamente; base do DMVPN |
| 145 | NHRP | Descobre o endereço público do par para montar túnel direto entre filiais; DMVPN spoke a spoke |
| 146 | IP-in-IP | Encapsulamento mínimo de IP dentro de IP; túneis simples, mobile IP e alguns CNIs de Kubernetes |
| 147 | 6in4 | Leva IPv6 dentro de IPv4 por túnel configurado manualmente; túnel broker e laboratórios |
| 148 | 6rd | Versão do 6to4 dentro de um único provedor, com relay próprio; entrega de IPv6 sobre acesso IPv4 |
| 149 | Teredo | Encapsula IPv6 em UDP para atravessar NAT; usado por Windows e por serviços de jogos |
| 150 | DS-Lite | Leva IPv4 do cliente até o CGNAT do provedor por túnel IPv6; redes de acesso só IPv6 |
| 151 | MAP-E | Mapeia IPv4 e portas em prefixos IPv6, sem estado no núcleo; provedores que abandonaram IPv4 na borda |
| 152 | 464XLAT | Permite apps só IPv4 funcionarem em rede só IPv6, traduzindo nas duas pontas; celulares em operadoras modernas |
| 153 | NAT64 | Traduz pacotes IPv6 em IPv4 na saída da rede; redes móveis e datacenters só IPv6 |
| 154 | DNS64 | Sintetiza registros AAAA para nomes que só têm A, apontando para o NAT64; complemento obrigatório dele |
| 155 | NAT-PMP | Faz a aplicação pedir abertura de porta ao roteador; equipamentos Apple e clientes P2P |
| 156 | PCP | Sucessor do NAT-PMP, controla mapeamentos também em CGNAT do provedor; jogos e aplicações P2P |
| 157 | STUN | Descobre qual é o endereço público visto de fora e que tipo de NAT está no caminho; WebRTC e VoIP |
| 158 | TURN | Faz relay da mídia quando os dois lados estão atrás de NAT impenetrável; plano B caro de toda chamada WebRTC |
| 159 | ICE | Testa todos os caminhos candidatos e escolhe o que funciona; combina STUN e TURN em WebRTC e SIP |
| 160 | SOCKS5 | Proxy com autenticação, IPv6 e UDP, capaz de resolver DNS no destino; Tor, túnel dinâmico do SSH e navegadores |
| 161 | HTTP CONNECT | Pede ao proxy que abra um túnel TCP puro; é assim que HTTPS passa por proxy corporativo |
| 162 | TCP | Entrega bytes em ordem e sem perda, com controle de congestionamento e retransmissão; base de HTTP, SMTP, SSH e bancos |
| 163 | UDP | Manda datagramas sem garantia nem estado, deixando o resto para a aplicação; DNS, jogos, voz, vídeo e QUIC |
| 164 | SCTP | Transporte confiável com múltiplos fluxos e múltiplos endereços por associação; sinalização telecom e canal de dados WebRTC |
| 165 | MPTCP | Usa vários caminhos ao mesmo tempo numa conexão TCP única; Siri, celulares que combinam Wi-Fi e 5G |
| 166 | DHCP | Entrega endereço, máscara, gateway e DNS ao host que acabou de entrar na rede; praticamente toda LAN IPv4 |
| 167 | DHCPv6 | Faz o mesmo em IPv6, incluindo delegação de prefixo para roteadores domésticos; provedores e redes gerenciadas |
| 168 | BOOTP | Antecessor do DHCP para dar IP e imagem de boot a estações sem disco; ainda visto no relay de switches |
| 169 | PXE | Baixa o carregador por TFTP e sobe o sistema sem disco local; instalação em massa e estações finas |
| 170 | iPXE | PXE turbinado com HTTP, iSCSI, Wi-Fi e scripts; provisionamento de servidores em datacenter |
| 171 | UEFI HTTP Boot | Substitui o TFTP do PXE por HTTP ou HTTPS direto no firmware; provisionamento moderno e nuvem privada |
| 172 | RIPv2 | Acrescenta máscara, multicast e autenticação simples; redes pequenas e laboratórios de certificação |
| 173 | RIPng | Versão do RIP para IPv6; redes pequenas e ambientes de estudo |
| 174 | EIGRP | Vetor de distância avançado com convergência rápida e rotas de reserva; redes corporativas Cisco |
| 175 | OSPFv2 | Monta a topologia inteira por estado de enlace e calcula o caminho mais curto; roteamento interno IPv4 |
| 176 | OSPFv3 | Mesmo algoritmo adaptado ao IPv6 e a múltiplas famílias de endereço; redes internas modernas |
| 177 | IS-IS | Estado de enlace independente do IP, que escala bem e é fácil de estender; backbones de operadora e fabric de datacenter |
| 178 | BGP-4 | Troca rotas entre sistemas autônomos com políticas e atributos; é o protocolo que faz a internet ser uma só |
| 179 | MP-BGP | Estende o BGP para carregar IPv6, VPNv4, EVPN e outras famílias; VPNs de operadora e overlays |
| 180 | BGP-LS | Exporta a topologia do domínio para um controlador calcular caminhos; SDN e engenharia de tráfego |
| 181 | RPKI-RTR | Entrega ao roteador a lista validada de quem pode anunciar cada prefixo; defesa contra sequestro de rotas |
| 182 | BFD | Detecta queda de vizinho em milissegundos com um hello leve; acelera a convergência de OSPF, BGP e IS-IS |
| 183 | VRRP | Faz dois roteadores compartilharem um IP virtual de gateway; alta disponibilidade em qualquer LAN |
| 184 | HSRP | Mesma ideia na versão Cisco, com roteador ativo e standby; redes corporativas Cisco |
| 185 | GLBP | Redundância de gateway que ainda distribui carga entre os roteadores; ambientes Cisco |
| 186 | CARP | Endereço IP virtual compartilhado entre firewalls; alta disponibilidade em OpenBSD e pfSense |
| 187 | PIM-SM | Constrói a árvore multicast só onde alguém pediu, a partir de um ponto de encontro; IPTV e distribuição de vídeo |
| 188 | PIM-DM | Inunda o tráfego e depois poda onde ninguém quer; redes pequenas e laboratórios |
| 189 | PIM-SSM | Liga o receptor direto à fonte que ele nomeou, sem ponto de encontro; streaming em larga escala |
| 190 | BIDIR-PIM | Árvore compartilhada que serve muitas fontes e muitos receptores; aplicações financeiras e de colaboração |
| 191 | MSDP | Faz pontos de encontro de domínios diferentes descobrirem as fontes uns dos outros; multicast entre operadoras |
| 192 | Babel | Roteamento por vetor de distância robusto em enlaces instáveis; redes mesh e comunitárias |
| 193 | OLSR | Mantém rotas prontas antes de precisar delas em rede sem fio móvel; mesh comunitário e ad hoc |
| 194 | B.A.T.M.A.N. | Cada nó decide o próximo salto sem conhecer a rota inteira; redes mesh como a Freifunk |
| 195 | LISP | Separa quem é o host de onde ele está, permitindo mover sem trocar de endereço; mobilidade e multihoming |
| 196 | MPLS | Encaminha por rótulo em vez de consultar a tabela IP inteira; backbones, VPNs corporativas e engenharia de tráfego |
| 197 | LDP | Distribui os rótulos MPLS entre roteadores vizinhos; base das redes MPLS clássicas |
| 198 | RSVP | Reserva banda ao longo do caminho para um fluxo específico; QoS integrada, hoje rara |
| 199 | RSVP-TE | Usa a reserva para montar túneis MPLS por caminhos escolhidos; engenharia de tráfego em operadoras |
| 200 | SR-MPLS | Põe a lista de saltos no próprio pacote e dispensa protocolo de sinalização; backbones que estão saindo do LDP |
| 201 | SRv6 | Faz Segment Routing usando endereços IPv6 como instruções; redes 5G e datacenters programáveis |
| 202 | PCEP | Conversa entre o roteador e um calculador central de caminhos; engenharia de tráfego controlada por software |
| 203 | VPLS | Entrega um domínio Ethernet único a filiais distantes sobre MPLS; LAN estendida corporativa |
| 204 | EVPN | Usa BGP para anunciar MACs e rotas de VPN, com multihoming ativo; datacenters e operadoras modernas |
| 205 | VXLAN | Encapsula quadros Ethernet em UDP para estender L2 sobre uma malha L3; fabric de datacenter e nuvens |
| 206 | Geneve | Overlay com cabeçalho extensível por opções, pensado para metadados; VMware NSX e nuvens públicas |
| 207 | OpenFlow | Deixa um controlador programar as tabelas de fluxo do switch; SDN acadêmica e primeiras redes programáveis |
| 208 | OVSDB | Configura bridges, portas e túneis do Open vSwitch; hipervisores e ambientes de virtualização de rede |
| 209 | NETCONF | Aplica configuração transacional em XML com candidate, commit e rollback; automação de rede com modelos YANG |
| 210 | RESTCONF | Expõe os mesmos modelos YANG como API REST em JSON; automação a partir de scripts e portais |
| 211 | gNMI | Assina telemetria por streaming e escreve configuração via gRPC; monitoração de datacenter em segundos, não minutos |
| 212 | gNOI | Executa operações do dia a dia como reboot, troca de certificado e upgrade; automação de operação de rede |
| 213 | SNMPv1 | Consulta contadores e recebe traps, com senha em texto claro; equipamento antigo ainda monitorado assim |
| 214 | SNMPv2c | Acrescenta consultas em bloco e mantém a community string; ainda o mais comum em monitoração |
| 215 | SNMPv3 | Traz usuário, autenticação e cifra ao SNMP; ambientes que levam a sério o acesso ao equipamento |
| 216 | Syslog | Envia eventos de sistemas e equipamentos para um coletor central; SIEM, auditoria e investigação de incidente |
| 217 | NetFlow | Exporta registros de quem falou com quem, quanto e por quanto tempo; análise de tráfego e detecção de anomalia |
| 218 | IPFIX | Padrão IETF derivado do NetFlow, com campos definidos por template; medição em operadoras e ferramentas modernas |
| 219 | sFlow | Amostra pacotes e contadores direto no hardware do switch; visibilidade barata em alta velocidade |
| 220 | STIX | Estrutura indicadores, campanhas e atores em um formato comum; compartilhamento de inteligência de ameaças |
| 221 | TAXII | Transporta feeds STIX entre organizações por API; centros de resposta e plataformas de threat intel |
| 222 | OTLP | Leva traces, métricas e logs no formato OpenTelemetry até o coletor; observabilidade moderna em qualquer linguagem |
| 223 | CDP | Anuncia modelo, porta e VLAN nativa entre equipamentos Cisco; mapeamento de topologia e telefones IP |
| 224 | LLDP | Faz o mesmo em padrão aberto, entre fabricantes diferentes; documentação automática de cabeamento |
| 225 | LLDP-MED | Extensão que negocia VLAN de voz e potência PoE com o telefone; telefonia IP corporativa |
| 226 | UDLD | Detecta fibra que transmite mas não recebe, evitando loop silencioso; enlaces ópticos entre switches |
| 227 | DTP | Negocia sozinho se a porta vira trunk; conveniência antiga que hoje se desliga por segurança |
| 228 | VTP | Propaga a base de VLANs de um switch para os outros; prático e famoso por apagar VLANs de um domínio inteiro |
| 229 | STP | Bloqueia portas redundantes para não formar laço em L2; qualquer rede com mais de um caminho entre switches |
| 230 | RSTP | Mesma proteção com convergência em segundos em vez de dezenas deles; padrão em switches atuais |
| 231 | MSTP | Agrupa VLANs em instâncias para não rodar uma árvore por VLAN; redes grandes com muitas VLANs |
| 232 | PVST+ | Uma árvore por VLAN, permitindo balancear tráfego entre uplinks; ambientes Cisco |
| 233 | SPB (802.1aq) | Alternativa ao TRILL baseada em IS-IS e encapsulamento MAC-in-MAC; redes corporativas e de campus |
| 234 | LACP | Junta vários enlaces físicos num único lógico e detecta cabo errado; uplinks de switch e servidores com duas placas |
| 235 | PAgP | Versão proprietária da Cisco para a mesma agregação; ambientes só Cisco |
| 236 | IEEE 802.3 | Define quadro, endereço MAC e acesso ao meio da Ethernet; a base física de quase toda rede local |
| 237 | 802.1Q | Insere a etiqueta de VLAN no quadro para separar redes no mesmo cabo; trunks entre switches e virtualização |
| 238 | 802.1ad (QinQ) | Empilha duas etiquetas para o provedor transportar as VLANs do cliente; serviços Ethernet de operadora |
| 239 | 802.1p | Marca prioridade dentro da etiqueta de VLAN; filas de QoS para voz e vídeo |
| 240 | PoE (802.3af/at/bt) | Negocia e entrega energia pelo mesmo cabo de dados; APs, câmeras, telefones IP e até luminárias |
| 241 | 802.3x PAUSE | Pede ao vizinho que pare de transmitir por um instante; controle de fluxo grosseiro, evitado em redes modernas |
| 242 | PFC (802.1Qbb) | Pausa só a classe de tráfego congestionada; Ethernet sem perdas para RoCE e FCoE |
| 243 | ETS (802.1Qaz) | Divide a banda do enlace entre classes de tráfego; datacenters convergentes |
| 244 | DCBX | Faz os dois lados combinarem os parâmetros de PFC e ETS automaticamente; switches e placas de rede de datacenter |
| 245 | MACsec (802.1AE) | Cifra e autentica o quadro salto a salto, em hardware e sem perder desempenho; enlaces entre switches e entre sites |
| 246 | MKA | Distribui e gira as chaves usadas pelo MACsec; complemento obrigatório dele |
| 247 | TSN (802.1Qbv) | Reserva janelas de tempo para tráfego crítico em Ethernet comum; automação industrial e redes automotivas |
| 248 | gPTP (802.1AS) | Perfil de sincronismo do PTP usado por AVB e TSN; áudio profissional e sistemas embarcados |
| 249 | PTP (IEEE 1588) | Sincroniza relógios com precisão de sub-microssegundo usando carimbos de tempo em hardware; telecom, bolsas e subestações |
| 250 | SyncE | Distribui frequência pelo próprio sinal físico da Ethernet; estações rádio-base e transporte de operadora |
| 251 | NTP | Ajusta o relógio do host contra vários servidores, compensando a latência do caminho; praticamente toda máquina em rede |
| 252 | SNTP | Versão simplificada do NTP para quem só precisa de segundos certos; dispositivos embarcados e roteadores domésticos |
| 253 | PPP | Estabelece, autentica e configura um enlace ponto a ponto e negocia os protocolos que vão passar; WAN, discada e celular |
| 254 | PPPoE | Coloca o PPP dentro de quadros Ethernet para autenticar assinantes; banda larga em DSL e fibra |
| 255 | LCP | Negocia MTU, autenticação e keepalive no início da sessão PPP; parte interna de todo enlace PPP |
| 256 | IPCP | Negocia endereço IP e DNS depois que o PPP autenticou; conexões de banda larga e móveis |
| 257 | MLPPP | Soma a banda de vários enlaces PPP num só canal lógico; links E1 e T1 agregados |
| 258 | HDLC | Enquadra bits em enlaces seriais síncronos com delimitador e CRC; base de várias tecnologias WAN |
| 259 | Cisco HDLC | Variante com campo de protocolo, padrão em seriais Cisco; interligação entre roteadores |
| 260 | LAPD | Enlace do canal de sinalização do ISDN; centrais telefônicas e acessos primários |
| 261 | ATM | Comuta células de 53 bytes com qualidade de serviço por circuito; backbones, DSL e transporte 3G legados |
| 262 | ISDN Q.931 | Sinaliza estabelecimento e derrubada de chamadas; acessos ISDN e troncos PRI |
| 263 | AX.25 | Enlace de pacotes por rádio amador, com indicativo no endereço; packet radio e redes de emergência |
| 264 | APRS | Divulga posição, telemetria e mensagens curtas por rádio; rastreamento em radioamadorismo e balões |
| 265 | SIP | Estabelece, modifica e encerra sessões de voz e vídeo, com registro e roteamento de chamadas; telefonia IP e troncos SIP |
| 266 | SIPS | Sinalização SIP dentro de TLS; operadoras e PABX que exigem sinalização cifrada |
| 267 | SDP | Descreve codecs, endereços e portas da mídia dentro da sinalização; SIP, WebRTC e streaming multicast |
| 268 | RTP | Carrega áudio e vídeo com número de sequência e carimbo de tempo para reconstruir a ordem; toda chamada VoIP e WebRTC |
| 269 | RTCP | Informa perda, jitter e atraso para as pontas ajustarem qualidade; monitoração de chamadas |
| 270 | SRTP | Cifra e autentica o fluxo RTP sem estragar a compressão de cabeçalho; VoIP corporativo e WebRTC |
| 271 | ZRTP | Negocia as chaves da mídia entre as próprias pontas, com verificação por frase falada; telefonia com sigilo fim a fim |
| 272 | RTSP | Comanda play, pause e busca em um fluxo servido por outro protocolo; câmeras IP, NVRs e servidores de vídeo |
| 273 | RTMP | Envia áudio e vídeo em fluxo contínuo com baixa latência; ingestão de live do OBS para Twitch e YouTube |
| 274 | RTMPS | RTMP dentro de TLS; exigido por plataformas que não aceitam mais ingestão em claro |
| 275 | HLS | Corta o vídeo em segmentos e publica uma playlist com várias qualidades, tudo por HTTP; streaming em quase todo player |
| 276 | MPEG-DASH | Mesma ideia do HLS em padrão aberto e independente de codec; plataformas de vídeo e TV conectada |
| 277 | SRT | Recupera perdas e atravessa a internet pública com atraso previsível; contribuição de vídeo entre estúdios |
| 278 | RIST | Transporte broadcast profissional com correção de erro e interoperabilidade entre fabricantes; emissoras |
| 279 | NDI | Leva vídeo de alta qualidade e baixa latência pela LAN, com descoberta automática; produção ao vivo e igrejas |
| 280 | SAP | Anuncia por multicast quais sessões existem e como sintonizá-las; IPTV e distribuição interna de canais |
| 281 | H.323 | Pilha completa de videoconferência com gatekeeper e negociação de mídia; salas corporativas legadas |
| 282 | H.225 | Cuida do registro e do estabelecimento da chamada dentro do H.323; sistemas de videoconferência |
| 283 | H.245 | Negocia codecs e canais lógicos depois que a chamada foi aceita; complemento do H.225 |
| 284 | H.248 / Megaco | Um controlador central manda o gateway abrir e fechar circuitos de mídia; núcleos de operadora |
| 285 | MGCP | Modelo parecido para telefones e gateways burros comandados pelo servidor; provedores de VoIP residencial |
| 286 | SCCP (Skinny) | Protocolo leve entre telefone Cisco e o CUCM; telefonia corporativa Cisco |
| 287 | IAX2 | Sinalização e mídia numa única porta UDP, o que facilita passar por NAT; troncos entre servidores Asterisk |
| 288 | T.38 | Transporta fax em tempo real convertendo os tons em pacotes; cartórios, hospitais e órgãos públicos |
| 289 | MSRP | Carrega mensagens e arquivos dentro de uma sessão negociada por SIP; RCS e redes IMS |
| 290 | XMPP | Mensageria federada em XML com presença e extensões; chat corporativo, notificações e infraestrutura de jogos |
| 291 | Jingle | Extensão do XMPP que negocia chamadas de voz e vídeo; clientes de mensageria aberta |
| 292 | Matrix | Sincroniza salas replicadas entre servidores, com criptografia fim a fim; Element e comunicação de órgãos públicos |
| 293 | IRC | Chat em canais com servidores interligados, simples e em texto; comunidades técnicas e projetos de código aberto |
| 294 | IRCS | IRC dentro de TLS; redes atuais como Libera.Chat |
| 295 | MQTT | Publica e assina tópicos por um broker, com QoS e mensagem de última vontade; IoT, telemetria e casa inteligente |
| 296 | MQTT-SN | Variante para redes de sensores sem TCP, com tópicos numéricos; malhas de rádio e dispositivos minúsculos |
| 297 | AMQP | Filas, trocas e roteamento de mensagens com confirmação e transações; integração corporativa em RabbitMQ e Service Bus |
| 298 | STOMP | Mensageria em texto simples, fácil de implementar em qualquer linguagem; clientes web e scripts |
| 299 | CoAP | REST enxuto sobre UDP com respostas confirmáveis e observação de recursos; sensores com pouca memória e bateria |
| 300 | LwM2M | Gerencia dispositivos por cima do CoAP, com firmware, bootstrap e telemetria; IoT celular gerenciada |
| 301 | DDS | Publica e assina dados com prazos e prioridades, sem broker central; robótica com ROS 2, defesa e sistemas críticos |
| 302 | RTPS | O protocolo de fio que faz o DDS funcionar entre fabricantes diferentes; interoperabilidade em tempo real |
| 303 | OPC UA | Modela equipamentos e variáveis de fábrica e expõe tudo com segurança para a TI; Indústria 4.0 |
| 304 | Kafka protocol | Escreve e lê partições de um log distribuído com offsets e grupos de consumo; streaming de eventos em larga escala |
| 305 | NATS | Mensageria de baixa latência com assuntos e request-reply, e filas persistentes no JetStream; microsserviços e edge |
| 306 | ZMTP | Enquadra e negocia as conexões do ZeroMQ entre processos e nós; sistemas distribuídos sem broker |
| 307 | Thrift | Define serviços em IDL e gera cliente e servidor em várias linguagens; Facebook, HBase e serviços internos |
| 308 | Avro RPC | Chamada remota com esquema Avro trafegado junto dos dados; ecossistema Hadoop e pipelines de dados |
| 309 | Modbus RTU | Lê e escreve registradores de um escravo por serial, sem qualquer segurança; CLPs, inversores e medidores |
| 310 | Modbus TCP | Mesmos registradores encapsulados em TCP na porta 502; supervisão industrial sobre Ethernet |
| 311 | DNP3 | Telemetria com carimbo de tempo, relatório por exceção e resposta a falha de enlace; subestações e saneamento |
| 312 | IEC 60870-5-104 | Telecontrole de energia sobre TCP/IP com comandos e medidas; centros de operação elétrica |
| 313 | IEC 61850 MMS | Modela e opera equipamentos de subestação de forma padronizada; automação de subestações digitais |
| 314 | GOOSE | Envia eventos de proteção em multicast Ethernet em poucos milissegundos; trip e intertravamento entre relés |
| 315 | Sampled Values | Transmite amostras de corrente e tensão direto do transformador de medição; subestações digitais |
| 316 | BACnet | Descreve e comanda objetos de automação predial como setpoints e alarmes; ar-condicionado, iluminação e elevadores |
| 317 | BACnet/IP | Mesmo protocolo transportado por UDP em rede IP; prédios com automação centralizada |
| 318 | KNX | Barramento de automação residencial e predial com dispositivos que falam entre si sem central; Europa em especial |
| 319 | LonTalk | Rede de controle predial com nós distribuídos; instalações LonWorks antigas |
| 320 | PROFIBUS | Barramento de campo determinístico entre CLP e dispositivos; máquinas e plantas de processo |
| 321 | PROFINET | Leva o mesmo modelo para Ethernet, com classes de tempo real; automação Siemens |
| 322 | EtherCAT | Faz o quadro passar por todos os escravos lendo e escrevendo em voo, com ciclos de microssegundos; controle de movimento |
| 323 | EtherNet/IP | Aplica o CIP sobre Ethernet e TCP; automação Rockwell e Allen-Bradley |
| 324 | CIP | Modelo de objetos e serviços comum ao EtherNet/IP, DeviceNet e ControlNet; integração entre essas redes |
| 325 | HART | Modula dados digitais em cima do laço analógico de 4 a 20 mA; instrumentação de processo sem trocar cabeamento |
| 326 | WirelessHART | Mesma instrumentação em malha sem fio com salto de frequência; plantas onde passar cabo é caro |
| 327 | ISA100.11a | Rede industrial sem fio baseada em IPv6 e 802.15.4; monitoração de processo |
| 328 | M-Bus | Lê medidores de consumo em barramento de dois fios ou por rádio; água, gás, calor e energia |
| 329 | RS-232 | Enlace serial ponto a ponto de curta distância; console de switches, roteadores, CLPs e no-breaks |
| 330 | RS-485 | Barramento serial diferencial com vários dispositivos e centenas de metros; Modbus RTU e automação predial |
| 331 | I2C | Dois fios para conectar sensores e chips na mesma placa, com endereço por dispositivo; eletrônica embarcada |
| 332 | SPI | Barramento síncrono rápido com seleção de chip; memórias flash, displays e conversores |
| 333 | CAN | Barramento com arbitragem por prioridade e resistência a ruído; carros, tratores e máquinas industriais |
| 334 | CAN FD | Mesma arbitragem com payload maior e taxa mais alta na fase de dados; veículos recentes |
| 335 | CANopen | Camada de aplicação com dicionário de objetos e perfis de dispositivo; robótica, elevadores e medicina |
| 336 | SAE J1939 | Perfil CAN com mensagens padronizadas de motor e transmissão; caminhões, ônibus e máquinas pesadas |
| 337 | LIN | Barramento serial barato de um fio para funções lentas; vidros, bancos, espelhos e sensores de conforto |
| 338 | FlexRay | Comunicação determinística e redundante por janelas de tempo; direção e suspensão eletrônicas |
| 339 | ISO-TP | Quebra mensagens longas em vários quadros CAN e remonta na outra ponta; diagnóstico automotivo |
| 340 | UDS | Serviços padronizados de leitura de falhas, sessões e regravação de ECU; oficinas e recall de software |
| 341 | OBD-II | Conjunto mínimo de leituras de emissão e falha obrigatório por lei; scanners de oficina e dongles |
| 342 | DoIP | Leva o diagnóstico UDS para Ethernet automotiva; regravação rápida e diagnóstico remoto |
| 343 | SOME/IP | Publica serviços e eventos entre módulos do carro sobre Ethernet; arquiteturas automotivas modernas |
| 344 | NMEA 0183 | Sentenças de texto com posição, rumo e profundidade em linha serial; GPS e instrumentos náuticos |
| 345 | NMEA 2000 | Mesma informação em barramento CAN com plug and play; barcos e sistemas de navegação atuais |
| 346 | AIS | Cada embarcação transmite identificação, posição e rota por VHF; tráfego marítimo e sites de rastreamento |
| 347 | ADS-B | A aeronave transmite posição derivada do GPS para quem quiser ouvir; controle de tráfego aéreo e receptores caseiros |
| 348 | ACARS | Troca mensagens curtas entre aeronave e operações em solo por VHF ou satélite; manutenção e despacho |
| 349 | Zigbee | Malha de baixo consumo em 2,4 GHz com roteadores e dispositivos finais; sensores, lâmpadas e fechaduras |
| 350 | Z-Wave | Malha proprietária em sub-GHz, com menos interferência e alcance maior; automação residencial |
| 351 | Thread | Malha IPv6 sem ponto único de falha, sobre 802.15.4; base de rede do Matter |
| 352 | Matter | Camada de aplicação comum que faz dispositivos de fabricantes diferentes se entenderem; Apple, Google, Amazon e SmartThings |
| 353 | 6LoWPAN | Comprime e fragmenta IPv6 para caber em rádios minúsculos; sensores e Thread |
| 354 | IEEE 802.15.4 | Define o rádio e o quadro que Zigbee, Thread e WirelessHART usam por baixo; redes pessoais de baixa potência |
| 355 | BLE GATT | Organiza dados em serviços e características que o celular lê e escreve; pulseiras, balanças e sensores |
| 356 | ATT | Protocolo de atributos que o GATT usa para ler, escrever e notificar; interior de toda conexão BLE |
| 357 | L2CAP | Multiplexa canais e segmenta pacotes sobre o rádio Bluetooth; base das camadas superiores |
| 358 | RFCOMM | Emula uma porta serial sobre Bluetooth; leitores, impressoras e módulos embarcados |
| 359 | Bluetooth SDP | Diz quais serviços o outro dispositivo oferece e em qual canal; pareamento e conexão |
| 360 | A2DP | Transmite áudio estéreo comprimido para o receptor; fones, caixas de som e som automotivo |
| 361 | AVRCP | Controla reprodução, faixa e volume e mostra metadados; botões do fone e painel do carro |
| 362 | HFP | Cuida do áudio de chamada, atender e desligar; viva-voz de carros e headsets |
| 363 | OBEX | Empurra objetos como arquivos e contatos entre dispositivos; envio por Bluetooth e cartões de visita |
| 364 | LoRaWAN | Modulação de longo alcance e baixíssimo consumo com gateways que repassam para a nuvem; medidores e sensores urbanos |
| 365 | NB-IoT | Canal celular estreito para pouquíssimos dados e bateria de anos; medição e rastreamento fixo |
| 366 | LTE-M | IoT celular com mais banda, mobilidade e voz; rastreadores e equipamentos móveis |
| 367 | NFC / NDEF | Comunicação a centímetros com formato comum de mensagem; pagamento por aproximação, crachás e tags |
| 368 | ISO/IEC 14443 | Define o rádio e o diálogo dos cartões sem contato; crachá de acesso, bilhete de transporte e cartão bancário |
| 369 | ISO/IEC 15693 | Etiquetas lidas a alguns decímetros de distância; controle de estoque e bibliotecas |
| 370 | EPC Gen2 | Lê centenas de etiquetas UHF por segundo a metros de distância; inventário em varejo e logística |
| 371 | IEEE 802.11 | Define o rádio, o quadro e o acesso ao meio do Wi-Fi em todas as gerações; qualquer rede sem fio local |
| 372 | WEP | Cifra original do Wi-Fi, quebrável em minutos; só aparece em equipamento esquecido e em relatório de auditoria |
| 373 | WPA | Correção emergencial do WEP usando TKIP; transição já encerrada |
| 374 | WPA2 | Autenticação com handshake de quatro vias e cifra AES-CCMP; padrão dominante por mais de uma década |
| 375 | WPA3 | Troca o handshake por SAE e protege até redes abertas; equipamentos e celulares recentes |
| 376 | TKIP | Cifra de transição que reaproveitava o hardware do WEP; obsoleta e desabilitada |
| 377 | CCMP | Cifra AES que dá confidencialidade e integridade ao WPA2; presente em toda rede moderna |
| 378 | SAE | Handshake que impede descobrir a senha por dicionário mesmo capturando a conexão; coração do WPA3 |
| 379 | WPS | Pareia dispositivos por botão ou PIN de oito dígitos; conveniência com falha conhecida no PIN |
| 380 | 802.11r | Pré-autentica no próximo AP para o roaming não derrubar a chamada; Wi-Fi de voz e hospitais |
| 381 | 802.11k | Entrega ao cliente a lista de APs vizinhos e suas condições; decisão de roaming mais rápida |
| 382 | 802.11v | Permite à rede sugerir ao cliente que mude de AP ou economize energia; balanceamento de carga |
| 383 | 802.11w | Assina quadros de gerenciamento para impedir desautenticação forjada; requisito do WPA3 |
| 384 | Passpoint (802.11u) | Faz o celular entrar sozinho em hotspot confiável usando credencial da operadora; aeroportos e offload celular |
| 385 | Wi-Fi Direct | Dois dispositivos formam um grupo sem passar por roteador; impressão, compartilhamento e Miracast |
| 386 | CAPWAP | Túnel de controle e dados entre APs e a controladora; Wi-Fi corporativo gerenciado |
| 387 | GSM | Rede celular digital de voz e SMS com SIM; 2G, ainda ativo em áreas remotas e IoT antiga |
| 388 | GPRS | Acrescenta dados por pacote ao GSM; máquinas de cartão e telemetria legada |
| 389 | UMTS | Rede 3G com acesso por código e banda maior; sendo desligada em vários países |
| 390 | LTE | Rede 4G totalmente por pacotes, com voz sobre IP; cobertura móvel dominante |
| 391 | 5G NR | Interface de rádio 5G com faixas novas, feixes direcionados e latência baixa; redes públicas e privadas |
| 392 | RRC | Controla estados, medições e handover entre o celular e a estação; sinalização de rádio em LTE e 5G |
| 393 | NAS (3GPP) | Sinalização direta entre o celular e o núcleo, com registro e sessões; autenticação e mobilidade |
| 394 | PDCP | Comprime cabeçalhos, cifra e evita duplicatas no rádio; pilha LTE e 5G |
| 395 | RLC | Segmenta, remonta e retransmite blocos no enlace de rádio; camada abaixo do PDCP |
| 396 | S1AP | Sinaliza entre eNodeB e núcleo LTE; anexos, portadores e handover |
| 397 | NGAP | Faz o mesmo entre gNodeB e núcleo 5G; sessões e mobilidade |
| 398 | X2AP | Coordena handover e interferência entre eNodeBs vizinhos; LTE |
| 399 | XnAP | Equivalente entre gNodeBs; 5G |
| 400 | F1AP | Liga a unidade central à unidade distribuída em rádio desagregado; Open RAN e 5G |
| 401 | GTP-C | Cria, altera e apaga sessões de assinante no núcleo móvel; controle de portadoras |
| 402 | GTP-U | Encapsula o tráfego do assinante entre a antena e o gateway; todo dado de celular passa por ele |
| 403 | PFCP | Faz o plano de controle programar as regras do plano de usuário; núcleo 5G e CUPS |
| 404 | SS7 | Sinalização entre centrais telefônicas do mundo inteiro; roaming e SMS, com falhas de segurança famosas |
| 405 | SIGTRAN | Transporta a pilha SS7 sobre IP com SCTP; interligação de operadoras |
| 406 | M3UA | Camada de adaptação que leva mensagens MTP3 sobre SCTP; núcleos híbridos |
| 407 | GSM MAP | Consulta e atualiza dados de assinante entre elementos da rede; roaming, SMS e autenticação |
| 408 | CAMEL | Permite serviços inteligentes como pré-pago funcionarem fora da rede de origem; cobrança em tempo real |
| 409 | SMPP | Entrega SMS em massa entre aplicações e operadoras; notificações, códigos de verificação e marketing |
| 410 | USSD | Sessão interativa de menus em texto direto com a operadora; consulta de saldo e serviços bancários por celular |
| 411 | RDP | Transmite a área de trabalho Windows com redirecionamento de áudio, impressora e disco; suporte remoto e VDI |
| 412 | RFB (VNC) | Envia atualizações de retângulos da tela e recebe teclado e mouse; acesso remoto multiplataforma e KVM sobre IP |
| 413 | X11 | Aplicações desenham em um servidor gráfico que pode estar em outra máquina; Unix e encaminhamento por SSH |
| 414 | SPICE | Console de máquina virtual com áudio, USB e vídeo acelerado; KVM, oVirt e Proxmox |
| 415 | PCoIP | Comprime a tela para VDI com boa qualidade em rede ruim; VMware Horizon e estações remotas |
| 416 | ICA/HDX | Entrega aplicações e desktops virtuais com canais para som, impressão e USB; ambientes Citrix |
| 417 | WinRM | Executa comandos e sessões PowerShell remotas sobre HTTP ou HTTPS; automação de servidores Windows e Ansible |
| 418 | WS-Management | Padrão de gestão em SOAP para servidores e controladores de gerência; iDRAC, iLO e ferramentas corporativas |
| 419 | DCOM | Chamada de objetos distribuídos com portas dinâmicas; OPC clássico e integrações Windows legadas |
| 420 | MSRPC (DCE/RPC) | Base de chamadas remotas do Windows sobre SMB ou TCP; Active Directory, spooler e serviços internos |
| 421 | ONC RPC | Chamada remota do mundo Unix com XDR; NFS, NIS e utilitários clássicos |
| 422 | rpcbind | Diz em qual porta cada serviço RPC está ouvindo; dependência do NFS e alvo frequente de varredura |
| 423 | Java RMI | Chama métodos de objetos em outra JVM, com serialização nativa; aplicações Java corporativas |
| 424 | LPD/LPR | Envia trabalhos para uma fila de impressão remota; impressoras antigas e sistemas Unix |
| 425 | IPP | Envia trabalhos, consulta status e descobre recursos da impressora; CUPS, AirPrint e impressão sem driver |
| 426 | IPPS | IPP dentro de TLS; impressão em rede corporativa e na nuvem |
| 427 | ONVIF | Padroniza descoberta, streaming e PTZ entre câmeras e gravadores de fabricantes diferentes; CFTV IP |
| 428 | MySQL protocol | Autentica, envia consultas e devolve resultados em pacotes binários; conexão de aplicações ao MySQL e MariaDB |
| 429 | PostgreSQL wire protocol | Mesma função com suporte a prepared statements e notificações assíncronas; drivers e pgbouncer |
| 430 | TDS | Protocolo de fio do SQL Server e do Sybase; drivers ODBC, JDBC e ferramentas Microsoft |
| 431 | Oracle TNS | Cuida da conexão, do listener e do redirecionamento de sessão no Oracle; aplicações corporativas |
| 432 | MongoDB Wire Protocol | Envia comandos e documentos BSON entre driver e servidor; aplicações e réplicas MongoDB |
| 433 | RESP | Protocolo de texto simples de pedido e resposta do Redis; caches, filas e clientes Valkey |
| 434 | Memcached protocol | Comandos curtos de get e set em texto ou binário; cache distribuído em memória |
| 435 | CQL binary | Transporte binário das consultas CQL com paginação e eventos de cluster; Cassandra e ScyllaDB |
| 436 | Bolt | Protocolo binário de consultas em grafo com streaming de resultados; drivers do Neo4j |
| 437 | BitTorrent | Divide o arquivo em pedaços e faz cada par baixar e servir ao mesmo tempo; distribuição de ISOs e conteúdo grande |
| 438 | Kademlia DHT | Tabela hash distribuída que encontra quem tem o conteúdo sem servidor central; torrents sem tracker e IPFS |
| 439 | IPFS Bitswap | Negocia e troca blocos endereçados por hash entre nós; recuperação de conteúdo no IPFS |
| 440 | libp2p | Junta descoberta, multiplexação, cifra e transporte numa pilha reutilizável; IPFS, Ethereum e projetos P2P |
| 441 | Bitcoin P2P | Anuncia e propaga blocos e transações entre nós da rede; sincronização da blockchain |
| 442 | RLPx (devp2p) | Sessão cifrada e multiplexada entre nós Ethereum; propagação de blocos e sincronização de estado |
| 443 | Tor | Encaminha o tráfego por três saltos com cifra em camadas para esconder a origem; navegação anônima e serviços onion |
| 444 | I2P | Rede sobreposta com túneis unidirecionais voltada a serviços internos; mensageria e sites anônimos |
| 445 | Raft | Elege um líder e replica um log para manter réplicas consistentes; etcd, Consul e o plano de controle do Kubernetes |
| 446 | Paxos | Consenso clássico sobre um valor entre nós que podem falhar; Chubby, Spanner e sistemas de banco distribuídos |
| 447 | SWIM | Descobre membros e detecta falhas por gossip, sem sobrecarregar a rede; Consul, Serf e clusters grandes |
| 448 | ZAB | Difusão ordenada de atualizações do Apache ZooKeeper; coordenação de clusters Hadoop e Kafka antigos |
| 449 | Totem | Anel de comunicação de grupo com ordem total das mensagens; Corosync e Pacemaker |
| 450 | HL7 v2 | Mensagens delimitadas por barra vertical com admissão, exames e resultados; integração entre sistemas hospitalares |
| 451 | HL7 FHIR | Recursos de saúde expostos como API REST em JSON; prontuário eletrônico e apps de paciente |
| 452 | DICOM | Formato e protocolo para imagem médica com metadados do exame; tomógrafos, PACS e estações de laudo |
| 453 | ISO 8583 | Mensagem de autorização e captura de transação com cartão; caixas eletrônicos, maquininhas e adquirentes |
| 454 | FIX | Envia ordens, cancelamentos e execuções em sessões de baixa latência; corretoras e bolsas |
| 455 | AS2 | Troca documentos EDI por HTTP com assinatura, cifra e recibo assinado; varejo e cadeia de suprimentos |
| 456 | EDIFACT | Sintaxe padrão de documentos comerciais como pedido e fatura; comércio internacional e aduana |
| 457 | OFTP2 | Transferência segura de arquivos entre montadoras e fornecedores; indústria automotiva europeia |
| 458 | DMX512 | Envia níveis para centenas de canais de luz em barramento serial; iluminação de palco e teatro |
| 459 | Art-Net | Leva universos DMX dentro de UDP; shows, eventos e cenografia com muitos aparelhos |
| 460 | sACN (E1.31) | Padrão de DMX sobre IP com multicast e prioridade entre consoles; instalações profissionais |
| 461 | OSC | Mensagens com endereços em forma de caminho para controlar áudio, vídeo e instalações; espetáculos e arte interativa |
| 462 | AES67 | Interoperabilidade de áudio sobre IP com PTP e RTP; rádios, emissoras e estúdios |
| 463 | Dante | Áudio digital sobre Ethernet com descoberta e sincronismo automáticos; igrejas, estúdios e eventos |
| 464 | MIDI | Transmite notas, controles e sincronismo entre instrumentos; estúdios, teclados e controladores |
| 465 | CFM (802.1ag) | Verifica continuidade e localiza falha em serviços Ethernet de ponta a ponta; operadoras e enlaces contratados |
| 466 | ERPS (G.8032) | Bloqueia um trecho do anel e reabre em milissegundos quando o enlace cai; anéis Ethernet de telecom |
| 467 | ISATAP | Trata a rede IPv4 interna como um enlace para tráfego IPv6; transição dentro de empresas |

## Os principais da internet, por categoria

Os quadros abaixo recortam da lista acima o que sustenta a internet no dia a
dia. Se você só for guardar uma parte, guarde esta.

### Transporte

| Protocolo | Papel |
|-----------|-------|
| TCP | Entrega confiável e ordenada; base de HTTP, SMTP, SSH |
| UDP | Datagramas sem garantia; base de DNS, RTP, QUIC |
| QUIC | Transporte cifrado sobre UDP; base do HTTP/3 |
| SCTP | Múltiplos fluxos numa associação; sinalização telecom e WebRTC data |
| MPTCP | Uma conexão TCP sobre vários caminhos (Wi-Fi e celular juntos) |

### Rede e endereçamento

| Protocolo | Papel |
|-----------|-------|
| IPv4 | Endereçamento e roteamento da internet clássica |
| IPv6 | Endereçamento de 128 bits, sem NAT obrigatório |
| ICMP / ICMPv6 | Diagnóstico e erro; é o que faz ping e traceroute existirem |
| ARP | Descobre o MAC a partir do IP dentro da LAN |
| NDP | Equivalente do ARP no IPv6, mais descoberta de roteador |
| DHCP / DHCPv6 | Entrega endereço, gateway e DNS ao host que acabou de subir |
| SLAAC | Autoconfiguração de endereço IPv6 sem servidor |

### Nomes e descoberta

| Protocolo | Papel |
|-----------|-------|
| DNS | Traduz nome em endereço; a camada de indireção da internet |
| DNSSEC | Assina respostas DNS para provar que não foram forjadas |
| DoT / DoH / DoQ | DNS dentro de TLS, HTTPS ou QUIC, contra bisbilhotice |
| mDNS / DNS-SD | Resolução e descoberta de serviços na rede local |
| WHOIS / RDAP | Quem registrou o domínio ou o bloco de IP |

### Web e APIs

| Protocolo | Papel |
|-----------|-------|
| HTTP | O verbo e o recurso; a linguagem franca da web |
| HTTPS | HTTP dentro de TLS; hoje é o caso normal, não a exceção |
| HTTP/2 | Várias requisições multiplexadas numa conexão TCP |
| HTTP/3 | O mesmo HTTP sobre QUIC, sem bloqueio de cabeça de fila |
| WebSocket | Canal bidirecional persistente aberto pelo navegador |
| WebRTC | Áudio, vídeo e dados ponto a ponto entre navegadores |
| gRPC | RPC tipado sobre HTTP/2 entre microsserviços |
| GraphQL | Uma consulta descreve exatamente o que a resposta traz |

### Segurança e criptografia de transporte

| Protocolo | Papel |
|-----------|-------|
| TLS | Cifra e autentica sessões TCP; sustenta HTTPS e o resto |
| DTLS | TLS para UDP; WebRTC e CoAP dependem dele |
| IPsec (AH, ESP) | Cifra no nível do pacote IP, transparente para a aplicação |
| IKEv2 | Negocia as chaves das sessões IPsec |
| WireGuard | VPN moderna, pequena e rápida, sobre UDP |
| SSH | Sessão remota autenticada; também túnel e transferência |
| ACME | Emite e renova certificados sem alguém clicar em nada |

### Identidade e autenticação

| Protocolo | Papel |
|-----------|-------|
| OAuth 2.0 | Delegação de acesso por token, sem entregar a senha |
| OpenID Connect | Camada de identidade sobre OAuth; o login social |
| SAML 2.0 | SSO corporativo por asserções XML |
| LDAP / LDAPS | Diretório de usuários, grupos e atributos |
| Kerberos | Autenticação por tíquete em domínios Windows e Unix |
| RADIUS / TACACS+ | AAA de rede: Wi-Fi corporativo, VPN, acesso a switches |
| IEEE 802.1X / EAP | Autentica a porta antes de dar rede ao dispositivo |
| WebAuthn / CTAP2 | Chaves de acesso e chaves de segurança, sem senha |

### E-mail

| Protocolo | Papel |
|-----------|-------|
| SMTP | Transporte e relay entre servidores |
| Submission (587) | Envio autenticado a partir do cliente |
| IMAP / IMAPS | Caixa postal mantida no servidor, vista de vários dispositivos |
| POP3 / POP3S | Baixa e, tradicionalmente, apaga do servidor |
| SPF | Diz quais servidores podem enviar pelo seu domínio |
| DKIM | Assina a mensagem para provar origem e integridade |
| DMARC | Junta SPF e DKIM numa política e pede relatórios |

### Roteamento

| Protocolo | Papel |
|-----------|-------|
| BGP-4 | Roteamento entre sistemas autônomos; a internet como um todo |
| OSPFv2 / OSPFv3 | Estado de enlace dentro de um domínio administrativo |
| IS-IS | Estado de enlace preferido em backbones de operadora |
| RIPv2 / RIPng | Vetor de distância simples, ainda visto em redes pequenas |
| EIGRP | Vetor de distância avançado da Cisco |
| BFD | Detecta queda de vizinho em milissegundos |
| VRRP / HSRP | Gateway virtual redundante para os hosts da LAN |
| MPLS | Encaminhamento por rótulo, base de VPNs e engenharia de tráfego |

### Enlace e LAN

| Protocolo | Papel |
|-----------|-------|
| IEEE 802.3 | Ethernet: quadros, endereços MAC, meio físico |
| 802.1Q | VLAN por marcação no quadro |
| STP / RSTP / MSTP | Corta laços na topologia de switches |
| LACP | Agrega vários enlaces num só, lógico |
| LLDP | Vizinho anuncia quem é e em que porta está |
| MACsec (802.1AE) | Cifra salto a salto no próprio enlace Ethernet |
| VXLAN / Geneve | Estende L2 sobre L3 em datacenters e nuvens |

### Wi-Fi e redes móveis

| Protocolo | Papel |
|-----------|-------|
| IEEE 802.11 | O rádio e o quadro do Wi-Fi |
| WPA2 / WPA3 | Cifra e autenticação da associação sem fio |
| SAE | Handshake do WPA3, resistente a ataque de dicionário |
| LTE / 5G NR | Interface de rádio das redes celulares atuais |
| GTP-U / GTP-C | Túnel e controle do tráfego de assinante no núcleo móvel |
| PFCP | Separa plano de controle e de usuário no núcleo 5G |

### Transferência de arquivos e acesso remoto

| Protocolo | Papel |
|-----------|-------|
| SFTP / SCP | Arquivos sobre SSH, sem porta extra nem canal em claro |
| FTP / FTPS | Transferência clássica, ainda viva em hospedagem |
| TFTP | Boot de rede e firmware de switch, simples ao extremo |
| rsync | Sincroniza só a diferença; base de backup incremental |
| NFS | Sistema de arquivos de rede no mundo Unix |
| SMB2 / SMB3 | Compartilhamento de arquivos e impressão no mundo Windows |
| RDP | Área de trabalho remota Windows |
| RFB (VNC) | Área de trabalho remota independente de plataforma |

### Mídia e tempo real

| Protocolo | Papel |
|-----------|-------|
| SIP | Estabelece, altera e encerra sessões de voz e vídeo |
| SDP | Descreve codecs e endereços dentro da sinalização |
| RTP / RTCP | Carrega o fluxo de mídia e reporta a qualidade dele |
| SRTP | RTP cifrado e autenticado |
| RTSP | Controle de reprodução em câmeras e servidores de vídeo |
| HLS / MPEG-DASH | Streaming adaptativo por HTTP, dividido em segmentos |
| STUN / TURN / ICE | Descobrem e furam NAT para a mídia chegar ao outro lado |

### Mensageria e IoT

| Protocolo | Papel |
|-----------|-------|
| MQTT | Publish/subscribe leve, padrão de fato em IoT |
| AMQP | Filas e roteamento com garantias de entrega |
| CoAP | REST em UDP para dispositivos com pouca memória |
| Kafka protocol | Log distribuído e particionado, alto volume |
| NATS | Mensageria de baixa latência entre serviços |
| XMPP / Matrix | Mensageria federada entre servidores distintos |

### Operação e observabilidade

| Protocolo | Papel |
|-----------|-------|
| SNMPv3 | Consulta e trap de equipamento, agora com cifra |
| Syslog | Fluxo de eventos de rede e sistema |
| NetFlow / IPFIX / sFlow | Quem falou com quem, quanto e por quanto tempo |
| NETCONF / RESTCONF | Configuração de rede transacional, sobre YANG |
| gNMI | Telemetria por streaming e configuração via gRPC |
| OTLP | Traces, métricas e logs no formato OpenTelemetry |

### Tempo

| Protocolo | Papel |
|-----------|-------|
| NTP | Relógio dos servidores dentro de milissegundos |
| PTP (IEEE 1588) | Sincronismo de sub-microssegundo em telecom e finanças |
| SyncE | Frequência distribuída pelo próprio enlace Ethernet |

### Bancos de dados e P2P

| Protocolo | Papel |
|-----------|-------|
| MySQL, PostgreSQL, TDS, TNS | Protocolos de fio dos bancos relacionais |
| RESP | Protocolo texto do Redis |
| BitTorrent | Distribuição de arquivos entre pares |
| Kademlia DHT | Tabela hash distribuída que localiza pares sem rastreador |
| libp2p | Pilha P2P do IPFS e de vários projetos descentralizados |
| Tor | Roteamento em camadas para anonimato de origem |
