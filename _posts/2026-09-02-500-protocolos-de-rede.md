---
layout: post
title: 500 Protocolos de Rede
minute: 23
secret: true
---

Uma lista de 500 protocolos, cada um com uma linha dizendo onde ele realmente
aparece. Não é um manual nem um ranking: é um índice para reconhecer o nome
quando ele surge em um log, num diagrama de rede ou numa captura de pacotes.

A ordem segue camadas e domínios, começando na web e terminando em nichos
industriais, automotivos e de mídia. Alguns são padrões vivos, outros são
legado que ainda roda em equipamento antigo, e vários aparecem aqui só para que
o nome deixe de ser um mistério.

| # | Protocolo | Onde é usado |
|---|-----------|--------------|
| 1 | HTTP | Transferência de páginas e APIs na web |
| 2 | HTTPS | HTTP sobre TLS; todo tráfego web seguro |
| 3 | HTTP/2 | Web moderna, multiplexação de requisições sobre TCP |
| 4 | HTTP/3 | Web moderna sobre QUIC/UDP; menor latência |
| 5 | QUIC | Transporte do HTTP/3, jogos, streaming (Google, Cloudflare) |
| 6 | WebSocket | Comunicação bidirecional em tempo real no navegador |
| 7 | WSS | WebSocket sobre TLS |
| 8 | WebRTC | Vídeo/áudio/dados P2P no navegador (Meet, Discord) |
| 9 | gRPC | RPC entre microsserviços sobre HTTP/2 |
| 10 | SOAP | Web services corporativos legados, ERPs, bancos |
| 11 | XML-RPC | APIs antigas (WordPress, sistemas legados) |
| 12 | JSON-RPC | APIs de nós blockchain, editores, IDEs (LSP) |
| 13 | GraphQL | APIs de consulta flexível sobre HTTP |
| 14 | WebDAV | Edição de arquivos remotos via HTTP (Nextcloud, SharePoint) |
| 15 | CalDAV | Sincronização de calendários (iCloud, Fastmail) |
| 16 | CardDAV | Sincronização de contatos |
| 17 | WebFinger | Descoberta de identidade (Mastodon, OIDC) |
| 18 | ActivityPub | Federação de redes sociais (Mastodon, Fediverso) |
| 19 | WebSub | Notificação push de feeds/assinaturas |
| 20 | WHOIS | Consulta de registro de domínios e blocos IP |
| 21 | RDAP | Sucessor do WHOIS, em JSON sobre HTTP |
| 22 | TLS | Criptografia de sessões TCP (web, e-mail, VPN) |
| 23 | DTLS | TLS sobre UDP; WebRTC, VPNs, CoAP |
| 24 | SSL 3.0 | Legado; substituído por TLS (obsoleto/inseguro) |
| 25 | ACME | Emissão automática de certificados (Let's Encrypt) |
| 26 | OCSP | Verificação online de revogação de certificados |
| 27 | SCEP | Provisionamento de certificados em roteadores e MDM |
| 28 | EST | Enrollment de certificados sobre HTTPS |
| 29 | OpenPGP | Criptografia e assinatura de e-mail e arquivos |
| 30 | S/MIME | E-mail assinado e cifrado em ambientes corporativos |
| 31 | Signal Protocol | E2EE em Signal, WhatsApp, Messenger |
| 32 | OTR | Mensageria cifrada ponto a ponto (legado XMPP) |
| 33 | MLS | E2EE em grupos grandes (RFC 9420) |
| 34 | SSH | Acesso remoto seguro a servidores e equipamentos |
| 35 | SFTP | Transferência de arquivos sobre SSH |
| 36 | SCP | Cópia de arquivos sobre SSH |
| 37 | Mosh | Shell remoto tolerante a roaming e alta latência |
| 38 | Telnet | Acesso remoto em texto puro; labs e equipamentos legados |
| 39 | rlogin | Login remoto Unix legado |
| 40 | FTP | Transferência de arquivos, hospedagem legada |
| 41 | FTPS | FTP sobre TLS |
| 42 | TFTP | Boot de rede, upgrade de firmware de switches e IP phones |
| 43 | rsync | Sincronização e backup incremental de arquivos |
| 44 | XMODEM | Transferência serial em consoles e recuperação de firmware |
| 45 | ZMODEM | Transferência serial com retomada (routers, BBS) |
| 46 | Kermit | Transferência serial em mainframes e equipamentos industriais |
| 47 | NFS | Compartilhamento de arquivos em Unix/Linux |
| 48 | NFSv4 | NFS com estado, ACLs e Kerberos |
| 49 | pNFS | NFS paralelo para storage de alto desempenho |
| 50 | SMB/CIFS | Compartilhamento de arquivos e impressoras Windows |
| 51 | SMB2/SMB3 | Versões modernas com cifra e multicanal |
| 52 | AFP | Compartilhamento de arquivos Apple legado |
| 53 | iSCSI | Blocos SCSI sobre TCP/IP em SANs |
| 54 | Fibre Channel (FCP) | SANs corporativas de alto desempenho |
| 55 | FCoE | Fibre Channel encapsulado em Ethernet |
| 56 | NVMe-oF | NVMe sobre rede (RDMA/FC) em datacenters |
| 57 | NVMe/TCP | NVMe sobre TCP em storage moderno |
| 58 | SMTP | Envio e relay de e-mail entre servidores |
| 59 | ESMTP | SMTP estendido (SIZE, STARTTLS, AUTH) |
| 60 | SMTPS | SMTP em TLS implícito (porta 465) |
| 61 | Submission | Envio autenticado de e-mail pelo cliente (porta 587) |
| 62 | LMTP | Entrega local de e-mail para o mailstore |
| 63 | POP3 | Download de mensagens pelo cliente de e-mail |
| 64 | POP3S | POP3 sobre TLS |
| 65 | IMAP | Acesso a caixas postais mantidas no servidor |
| 66 | IMAPS | IMAP sobre TLS |
| 67 | ManageSieve | Gerência de filtros de e-mail no servidor |
| 68 | MAPI | Outlook com Exchange |
| 69 | Exchange ActiveSync | Sincronização de e-mail em celulares |
| 70 | SPF | Autorização de servidores de envio via DNS |
| 71 | DKIM | Assinatura criptográfica de e-mails |
| 72 | DMARC | Política de alinhamento SPF/DKIM e relatórios |
| 73 | ARC | Preserva autenticação em encaminhamentos e listas |
| 74 | MTA-STS | Força TLS entre servidores de e-mail |
| 75 | TLS-RPT | Relatórios de falhas de TLS em SMTP |
| 76 | NNTP | Usenet e distribuição de newsgroups |
| 77 | NNTPS | NNTP sobre TLS |
| 78 | DNS | Resolução de nomes em toda a internet |
| 79 | DNSSEC | Assinatura e validação de respostas DNS |
| 80 | DoT | DNS sobre TLS (porta 853) |
| 81 | DoH | DNS sobre HTTPS em navegadores e SOs |
| 82 | DoQ | DNS sobre QUIC |
| 83 | mDNS | Descoberta local sem servidor (.local, Bonjour) |
| 84 | DNS-SD | Descoberta de serviços na LAN (impressoras, Chromecast) |
| 85 | LLMNR | Resolução local em Windows (alvo comum de ataques) |
| 86 | NetBIOS-NS | Resolução de nomes NetBIOS em redes Windows legadas |
| 87 | NetBIOS Session Service | Sessões SMB legadas (porta 139) |
| 88 | NetBIOS Datagram Service | Broadcast de nomes e navegação de rede |
| 89 | WINS | Servidor central de nomes NetBIOS |
| 90 | LDAP | Diretórios corporativos, Active Directory |
| 91 | LDAPS | LDAP sobre TLS |
| 92 | Kerberos | Autenticação com tickets em domínios AD |
| 93 | NIS/YP | Diretório Unix legado (usuários, hosts) |
| 94 | SSDP | Descoberta UPnP na LAN (smart TVs, roteadores) |
| 95 | UPnP | Descoberta e controle de dispositivos domésticos |
| 96 | UPnP IGD | Abertura automática de portas no roteador |
| 97 | DLNA | Compartilhamento de mídia entre TV, PC e NAS |
| 98 | AirPlay | Espelhamento e áudio entre dispositivos Apple |
| 99 | Google Cast | Envio de mídia para Chromecast e Android TV |
| 100 | Miracast | Espelhamento de tela Wi-Fi (Windows, Android) |
| 101 | RADIUS | Autenticação de Wi-Fi, VPN e ISPs |
| 102 | RadSec | RADIUS sobre TLS/TCP |
| 103 | Diameter | AAA em redes 4G/5G (sucessor do RADIUS) |
| 104 | TACACS+ | Autenticação e autorização de admins em equipamentos Cisco |
| 105 | IEEE 802.1X | Controle de acesso à porta em switches e Wi-Fi corporativo |
| 106 | EAP | Framework de autenticação usado pelo 802.1X |
| 107 | EAPOL | Transporte de EAP sobre LAN Ethernet/Wi-Fi |
| 108 | EAP-TLS | Autenticação por certificado em Wi-Fi corporativo |
| 109 | EAP-TTLS | Túnel TLS com autenticação interna por senha |
| 110 | PEAP | Wi-Fi corporativo com MS-CHAPv2 dentro de TLS |
| 111 | EAP-FAST | Alternativa Cisco ao PEAP |
| 112 | EAP-SIM | Autenticação Wi-Fi via cartão SIM 2G/3G |
| 113 | EAP-AKA | Autenticação Wi-Fi/celular via USIM (4G/5G) |
| 114 | PAP | Autenticação PPP em texto claro (legado) |
| 115 | CHAP | Autenticação PPP por desafio |
| 116 | MS-CHAPv2 | Autenticação em VPNs Microsoft e PEAP |
| 117 | NTLM | Autenticação Windows legada (SMB, IIS) |
| 118 | SPNEGO | Negociação Kerberos/NTLM em HTTP e SMB |
| 119 | GSSAPI | API de segurança usada por Kerberos, NFS, SSH |
| 120 | SASL | Camada de autenticação para IMAP, SMTP, LDAP, XMPP |
| 121 | OAuth 2.0 | Autorização delegada em APIs e apps |
| 122 | OpenID Connect | Login social e SSO moderno |
| 123 | SAML 2.0 | SSO corporativo (Okta, ADFS, Azure AD) |
| 124 | SCIM | Provisionamento automático de usuários entre SaaS |
| 125 | WebAuthn | Login sem senha e passkeys no navegador |
| 126 | CTAP2 | Comunicação com chaves FIDO2 (YubiKey) |
| 127 | TOTP | Códigos 2FA baseados em tempo (Google Authenticator) |
| 128 | HOTP | Códigos 2FA baseados em contador (tokens físicos) |
| 129 | IPv4 | Endereçamento e roteamento na internet |
| 130 | IPv6 | Endereçamento moderno, obrigatório em redes móveis |
| 131 | ICMP | Ping, traceroute, mensagens de erro IPv4 |
| 132 | ICMPv6 | Erros, ping, NDP e MLD em IPv6 |
| 133 | ARP | Resolução IPv4 → MAC em LANs |
| 134 | RARP | MAC → IP em estações diskless (legado) |
| 135 | InARP | Descoberta de IP em Frame Relay e ATM |
| 136 | Proxy ARP | Roteador respondendo ARP por outra sub-rede |
| 137 | NDP | Descoberta de vizinhos e roteadores em IPv6 |
| 138 | SLAAC | Autoconfiguração de endereço IPv6 |
| 139 | IGMP | Inscrição em grupos multicast IPv4 (IPTV) |
| 140 | MLD | Equivalente ao IGMP em IPv6 |
| 141 | IPsec | VPNs site-to-site e acesso remoto |
| 142 | AH | Integridade e autenticação IPsec (sem cifra) |
| 143 | ESP | Cifra e autenticação de pacotes IPsec |
| 144 | ISAKMP | Framework de negociação de SAs IPsec |
| 145 | IKEv1 | Negociação de chaves IPsec legada |
| 146 | IKEv2 | Negociação IPsec moderna, VPN móvel (MOBIKE) |
| 147 | WireGuard | VPN moderna, leve e rápida |
| 148 | OpenVPN | VPN SSL popular em empresas e provedores |
| 149 | PPTP | VPN legada da Microsoft (insegura) |
| 150 | L2TP | Túnel L2, normalmente combinado com IPsec |
| 151 | L2TPv3 | Pseudowires L2 sobre IP em operadoras |
| 152 | SSTP | VPN Microsoft sobre HTTPS |
| 153 | GRE | Encapsulamento genérico de túneis |
| 154 | mGRE | Túneis multiponto em DMVPN |
| 155 | NHRP | Resolução de próximos saltos em DMVPN |
| 156 | IP-in-IP | Túnel simples IP sobre IP |
| 157 | 6in4 | IPv6 encapsulado em IPv4 (túnel broker) |
| 158 | 6to4 | Transição IPv6 automática (legado) |
| 159 | 6rd | IPv6 rápido sobre infraestrutura IPv4 de ISP |
| 160 | Teredo | IPv6 através de NAT |
| 161 | DS-Lite | IPv4 sobre rede IPv6 de operadora |
| 162 | MAP-E | Transição IPv4/IPv6 com encapsulamento |
| 163 | 464XLAT | IPv4 sobre redes móveis IPv6-only |
| 164 | NAT64 | Tradução de IPv6 para IPv4 |
| 165 | DNS64 | Síntese de registros AAAA para NAT64 |
| 166 | NAT-PMP | Mapeamento de portas em roteadores Apple |
| 167 | PCP | Sucessor do NAT-PMP para controle de NAT/CGNAT |
| 168 | STUN | Descoberta de IP público e tipo de NAT (WebRTC, VoIP) |
| 169 | TURN | Relay de mídia quando o NAT bloqueia P2P |
| 170 | ICE | Escolha do melhor caminho de mídia (WebRTC/SIP) |
| 171 | SOCKS4 | Proxy TCP genérico legado |
| 172 | SOCKS5 | Proxy com UDP e autenticação (Tor, SSH -D) |
| 173 | HTTP CONNECT | Túnel TCP através de proxy HTTP |
| 174 | TCP | Transporte confiável da maior parte da internet |
| 175 | UDP | Transporte sem conexão: DNS, jogos, streaming |
| 176 | SCTP | Sinalização telecom, WebRTC data channel |
| 177 | DCCP | Transporte não confiável com controle de congestionamento |
| 178 | UDP-Lite | Mídia tolerante a erros parciais |
| 179 | MPTCP | TCP em múltiplos caminhos (Siri, celular + Wi-Fi) |
| 180 | DHCP | Atribuição automática de IP em redes IPv4 |
| 181 | DHCPv6 | Configuração de endereços e opções em IPv6 |
| 182 | BOOTP | Antecessor do DHCP, boot remoto |
| 183 | PXE | Boot de estações pela rede |
| 184 | iPXE | PXE estendido com HTTP, iSCSI e scripts |
| 185 | UEFI HTTP Boot | Boot moderno de imagens via HTTP/HTTPS |
| 186 | RIPv1 | Roteamento por vetor de distância classful (legado) |
| 187 | RIPv2 | Roteamento simples em redes pequenas |
| 188 | RIPng | RIP para IPv6 |
| 189 | EIGRP | Roteamento interno em redes Cisco |
| 190 | OSPFv2 | Roteamento interno IPv4 em empresas e ISPs |
| 191 | OSPFv3 | OSPF para IPv6 |
| 192 | IS-IS | Roteamento interno em backbones de operadoras |
| 193 | BGP-4 | Roteamento entre sistemas autônomos na internet |
| 194 | MP-BGP | BGP multiprotocolo (VPNv4, EVPN, IPv6) |
| 195 | BGP-LS | Exportação de topologia para controladores SDN |
| 196 | RPKI-RTR | Validação de origem de rotas BGP |
| 197 | BFD | Detecção rápida de falhas de enlace |
| 198 | VRRP | Redundância de gateway padrão |
| 199 | HSRP | Redundância de gateway proprietária Cisco |
| 200 | GLBP | Redundância com balanceamento de carga (Cisco) |
| 201 | CARP | Redundância de IP em BSD/pfSense |
| 202 | PIM-SM | Roteamento multicast esparso (IPTV) |
| 203 | PIM-DM | Roteamento multicast denso |
| 204 | PIM-SSM | Multicast fonte-específico para streaming |
| 205 | BIDIR-PIM | Multicast bidirecional (many-to-many) |
| 206 | MSDP | Interligação de domínios multicast |
| 207 | Babel | Roteamento em redes mesh e comunitárias |
| 208 | OLSR | Roteamento proativo em redes mesh sem fio |
| 209 | B.A.T.M.A.N. | Mesh comunitário (Freifunk) |
| 210 | LISP | Separação de identificador e localizador; mobilidade |
| 211 | MPLS | Comutação por rótulos em backbones |
| 212 | LDP | Distribuição de rótulos MPLS |
| 213 | RSVP | Reserva de recursos e QoS |
| 214 | RSVP-TE | Engenharia de tráfego em MPLS |
| 215 | SR-MPLS | Segment Routing sobre MPLS |
| 216 | SRv6 | Segment Routing nativo em IPv6 |
| 217 | PCEP | Comunicação entre PCE e roteadores para caminhos TE |
| 218 | VPLS | LAN estendida sobre MPLS |
| 219 | EVPN | VPN L2/L3 moderna em datacenters e operadoras |
| 220 | VXLAN | Overlay L2 sobre L3 em datacenters |
| 221 | Geneve | Overlay flexível em NSX e nuvens |
| 222 | OpenFlow | Programação de switches SDN |
| 223 | OVSDB | Configuração do Open vSwitch |
| 224 | NETCONF | Configuração de equipamentos via XML/YANG |
| 225 | RESTCONF | Configuração via REST/JSON com YANG |
| 226 | gNMI | Telemetria e configuração via gRPC |
| 227 | gNOI | Operações de rede (reboot, certificados) via gRPC |
| 228 | SNMPv1 | Monitoração legada de equipamentos |
| 229 | SNMPv2c | Monitoração ainda muito usada (community string) |
| 230 | SNMPv3 | Monitoração com autenticação e cifra |
| 231 | Syslog | Envio centralizado de logs |
| 232 | NetFlow | Estatísticas de fluxo em roteadores Cisco |
| 233 | IPFIX | Padrão IETF de exportação de fluxos |
| 234 | sFlow | Amostragem de tráfego em switches |
| 235 | RMON | Monitoração remota via MIB estendida |
| 236 | STIX | Formato de troca de inteligência de ameaças |
| 237 | TAXII | Transporte de indicadores de ameaça |
| 238 | Prometheus exposition | Coleta de métricas em Kubernetes |
| 239 | OTLP | Telemetria OpenTelemetry (traces, métricas, logs) |
| 240 | CDP | Descoberta de vizinhos Cisco |
| 241 | LLDP | Descoberta de vizinhos padrão IEEE |
| 242 | LLDP-MED | Descoberta de telefones IP e PoE |
| 243 | UDLD | Detecção de links unidirecionais em fibra |
| 244 | DTP | Negociação de trunk em switches Cisco |
| 245 | VTP | Propagação de VLANs entre switches Cisco |
| 246 | STP | Prevenção de loops em L2 |
| 247 | RSTP | Convergência rápida de spanning tree |
| 248 | MSTP | Spanning tree por instância de VLAN |
| 249 | PVST+ | Spanning tree por VLAN (Cisco) |
| 250 | TRILL | L2 multipath em datacenters |
| 251 | SPB (802.1aq) | Shortest Path Bridging em redes corporativas |
| 252 | LACP | Agregação de links padrão |
| 253 | PAgP | Agregação de links proprietária Cisco |
| 254 | IEEE 802.3 | Ethernet com fio (base de quase toda LAN) |
| 255 | 802.1Q | Tagging de VLAN |
| 256 | 802.1ad (QinQ) | Empilhamento de VLANs em operadoras |
| 257 | 802.1p | Marcação de prioridade/CoS em L2 |
| 258 | PoE (802.3af/at/bt) | Alimentação de APs, câmeras e telefones IP |
| 259 | 802.3x PAUSE | Controle de fluxo Ethernet |
| 260 | PFC (802.1Qbb) | Controle de fluxo por prioridade (RoCE, FCoE) |
| 261 | ETS (802.1Qaz) | Alocação de banda por classe em DCB |
| 262 | DCBX | Negociação de parâmetros DCB |
| 263 | MACsec (802.1AE) | Criptografia hop-by-hop em Ethernet |
| 264 | MKA | Distribuição de chaves para MACsec |
| 265 | TSN (802.1Qbv) | Ethernet determinístico em indústria e automotivo |
| 266 | gPTP (802.1AS) | Sincronismo de tempo em AVB/TSN |
| 267 | PTP (IEEE 1588) | Sincronismo de precisão em telecom, finanças, energia |
| 268 | SyncE | Sincronismo de frequência em redes móveis |
| 269 | NTP | Sincronização de relógio em praticamente todo host |
| 270 | SNTP | Versão simplificada do NTP em dispositivos pequenos |
| 271 | Time Protocol (RFC 868) | Sincronismo legado |
| 272 | PPP | Enlace ponto a ponto em WAN, discada, celular |
| 273 | PPPoE | Autenticação de banda larga em ISPs (DSL, fibra) |
| 274 | PPPoA | PPP sobre ATM em ADSL |
| 275 | SLIP | IP sobre serial legado |
| 276 | LCP | Negociação de enlace dentro do PPP |
| 277 | IPCP | Negociação de parâmetros IP no PPP |
| 278 | MLPPP | Agregação de múltiplos enlaces PPP |
| 279 | HDLC | Enquadramento em enlaces seriais síncronos |
| 280 | Cisco HDLC | Encapsulamento padrão em seriais Cisco |
| 281 | LAPB | Camada de enlace do X.25 |
| 282 | LAPD | Canal de sinalização D do ISDN |
| 283 | X.25 | Rede de pacotes legada (bancos, ATMs antigos) |
| 284 | Frame Relay | WAN corporativa legada |
| 285 | ATM | Backbone e DSL legados, celulares 3G |
| 286 | ISDN Q.931 | Sinalização de chamadas ISDN e PRI |
| 287 | IPX | Rede Novell NetWare legada e jogos antigos |
| 288 | SPX | Transporte confiável sobre IPX |
| 289 | NetBEUI | Rede Windows local legada |
| 290 | AppleTalk DDP | Redes Apple legadas |
| 291 | AARP | Resolução de endereços em AppleTalk |
| 292 | DECnet | Redes DEC/VMS legadas |
| 293 | SDLC | Enlace em redes IBM SNA/mainframe |
| 294 | AX.25 | Radioamadorismo, packet radio |
| 295 | APRS | Rastreamento e telemetria via rádio amador |
| 296 | SIP | Sinalização de chamadas VoIP |
| 297 | SIPS | SIP sobre TLS |
| 298 | SDP | Descrição de mídia em SIP e WebRTC |
| 299 | RTP | Transporte de áudio e vídeo em tempo real |
| 300 | RTCP | Estatísticas e controle de sessões RTP |
| 301 | SRTP | RTP criptografado (VoIP, WebRTC) |
| 302 | ZRTP | Troca de chaves de mídia ponto a ponto |
| 303 | RTSP | Controle de streams de câmeras IP e NVRs |
| 304 | RTMP | Ingestão de live streaming (OBS → Twitch/YouTube) |
| 305 | RTMPS | RTMP sobre TLS |
| 306 | HLS | Streaming adaptativo da Apple, usado por quase todos |
| 307 | MPEG-DASH | Streaming adaptativo padrão aberto |
| 308 | SRT | Contribuição de vídeo confiável sobre internet |
| 309 | RIST | Transporte broadcast profissional sobre IP |
| 310 | NDI | Vídeo sobre IP em estúdios e produção ao vivo |
| 311 | SAP | Anúncio de sessões multicast (SDP) |
| 312 | H.323 | Videoconferência corporativa legada |
| 313 | H.225 | Sinalização de chamadas dentro do H.323 |
| 314 | H.245 | Negociação de capacidades de mídia no H.323 |
| 315 | H.248 / Megaco | Controle de media gateways em operadoras |
| 316 | MGCP | Controle de gateways VoIP |
| 317 | SCCP (Skinny) | Telefones IP Cisco com CUCM |
| 318 | IAX2 | Troncos entre servidores Asterisk |
| 319 | T.38 | Fax sobre IP |
| 320 | MSRP | Mensagens instantâneas em redes IMS/RCS |
| 321 | XMPP | Mensageria aberta, notificações, jogos |
| 322 | Jingle | Chamadas de voz/vídeo sobre XMPP |
| 323 | Matrix | Mensageria federada com E2EE (Element) |
| 324 | IRC | Chat em comunidades técnicas |
| 325 | IRCS | IRC sobre TLS |
| 326 | MQTT | IoT, telemetria, casas inteligentes |
| 327 | MQTT-SN | MQTT para redes de sensores sem TCP |
| 328 | AMQP | Filas corporativas (RabbitMQ, Azure Service Bus) |
| 329 | STOMP | Mensageria simples baseada em texto |
| 330 | CoAP | REST leve para dispositivos IoT restritos |
| 331 | LwM2M | Gerenciamento de dispositivos IoT sobre CoAP |
| 332 | DDS | Middleware de tempo real em robótica (ROS 2), defesa |
| 333 | RTPS | Protocolo de fio do DDS |
| 334 | OPC UA | Integração de chão de fábrica com TI (Indústria 4.0) |
| 335 | Kafka protocol | Streaming de eventos em larga escala |
| 336 | NATS | Mensageria leve em microsserviços e edge |
| 337 | ZMTP | Transporte do ZeroMQ entre processos e nós |
| 338 | Thrift | RPC multiplataforma (Facebook, HBase) |
| 339 | Avro RPC | RPC e serialização no ecossistema Hadoop |
| 340 | Modbus RTU | Automação industrial sobre serial RS-485 |
| 341 | Modbus TCP | Automação industrial sobre Ethernet |
| 342 | DNP3 | Telemetria em subestações e saneamento |
| 343 | IEC 60870-5-104 | SCADA de energia elétrica sobre TCP/IP |
| 344 | IEC 61850 MMS | Comunicação em subestações digitais |
| 345 | GOOSE | Trip e intertravamento rápido em subestações |
| 346 | Sampled Values | Amostras de corrente e tensão em subestações |
| 347 | BACnet | Automação predial (HVAC, iluminação) |
| 348 | BACnet/IP | BACnet sobre redes IP |
| 349 | KNX | Automação residencial e predial europeia |
| 350 | LonTalk | Automação predial legada (LonWorks) |
| 351 | PROFIBUS | Barramento de campo industrial |
| 352 | PROFINET | Automação industrial sobre Ethernet (Siemens) |
| 353 | EtherCAT | Controle de movimento de alta velocidade |
| 354 | EtherNet/IP | Automação Rockwell/Allen-Bradley |
| 355 | CIP | Camada de aplicação do EtherNet/IP e DeviceNet |
| 356 | HART | Instrumentação 4-20 mA com dados digitais |
| 357 | WirelessHART | Instrumentação industrial sem fio |
| 358 | ISA100.11a | Rede industrial sem fio de processo |
| 359 | M-Bus | Leitura de medidores de água, gás e energia |
| 360 | RS-232 | Console serial em roteadores, switches e PLCs |
| 361 | RS-485 | Barramento serial multiponto industrial |
| 362 | I2C | Comunicação entre chips em placas e sensores |
| 363 | SPI | Comunicação rápida com memórias, displays e sensores |
| 364 | CAN | Barramento de veículos e máquinas |
| 365 | CAN FD | CAN com maior taxa e payload |
| 366 | CANopen | Automação e robótica sobre CAN |
| 367 | SAE J1939 | Caminhões, ônibus e máquinas pesadas |
| 368 | LIN | Subsistemas automotivos de baixo custo (vidros, bancos) |
| 369 | FlexRay | Sistemas automotivos críticos e determinísticos |
| 370 | ISO-TP | Segmentação de mensagens longas sobre CAN |
| 371 | UDS | Diagnóstico e reprogramação de ECUs |
| 372 | OBD-II | Diagnóstico veicular padronizado |
| 373 | DoIP | Diagnóstico automotivo sobre IP/Ethernet |
| 374 | SOME/IP | Comunicação de serviços em Ethernet automotiva |
| 375 | NMEA 0183 | GPS e instrumentos náuticos |
| 376 | NMEA 2000 | Rede de instrumentos marítimos sobre CAN |
| 377 | AIS | Identificação e rastreamento de embarcações |
| 378 | ADS-B | Vigilância e rastreamento de aeronaves |
| 379 | ACARS | Mensagens entre aeronaves e operações em solo |
| 380 | Zigbee | Automação residencial e sensores mesh |
| 381 | Z-Wave | Automação residencial em sub-GHz |
| 382 | Thread | Mesh IPv6 para casa inteligente |
| 383 | Matter | Interoperabilidade de smart home (Apple, Google, Amazon) |
| 384 | 6LoWPAN | IPv6 em redes de baixa potência |
| 385 | IEEE 802.15.4 | Camada física de Zigbee, Thread e WirelessHART |
| 386 | BLE GATT | Perfis de dados em Bluetooth Low Energy |
| 387 | ATT | Transporte de atributos do BLE |
| 388 | L2CAP | Multiplexação de canais Bluetooth |
| 389 | RFCOMM | Emulação de porta serial sobre Bluetooth |
| 390 | Bluetooth SDP | Descoberta de serviços entre dispositivos pareados |
| 391 | A2DP | Áudio estéreo em fones Bluetooth |
| 392 | AVRCP | Controle de reprodução (play/pause) em Bluetooth |
| 393 | HFP | Chamadas viva-voz em carros e headsets |
| 394 | OBEX | Troca de arquivos e contatos via Bluetooth |
| 395 | LoRaWAN | Sensores de longo alcance e baixa potência |
| 396 | NB-IoT | IoT celular de banda estreita |
| 397 | LTE-M | IoT celular com mobilidade e voz |
| 398 | NFC / NDEF | Pagamentos por aproximação e tags |
| 399 | ISO/IEC 14443 | Cartões sem contato e crachás de acesso |
| 400 | ISO/IEC 15693 | Etiquetas de proximidade estendida |
| 401 | EPC Gen2 | RFID UHF em logística e varejo |
| 402 | IEEE 802.11 | Wi-Fi em todas as suas gerações |
| 403 | WEP | Segurança Wi-Fi obsoleta e quebrada |
| 404 | WPA | Segurança Wi-Fi de transição (TKIP) |
| 405 | WPA2 | Padrão Wi-Fi dominante por mais de uma década |
| 406 | WPA3 | Segurança Wi-Fi atual com SAE |
| 407 | TKIP | Cifra legada do WPA |
| 408 | CCMP | Cifra AES do WPA2 |
| 409 | SAE | Handshake resistente a dicionário no WPA3 |
| 410 | WPS | Pareamento simplificado de Wi-Fi (inseguro) |
| 411 | 802.11r | Roaming rápido entre APs |
| 412 | 802.11k | Relatórios de rádio para decisão de roaming |
| 413 | 802.11v | Direcionamento de clientes entre APs |
| 414 | 802.11w | Proteção de quadros de gerenciamento |
| 415 | Passpoint (802.11u) | Onboarding automático em hotspots e offload celular |
| 416 | Wi-Fi Direct | Conexão direta entre dispositivos sem AP |
| 417 | CAPWAP | Túnel entre APs e controladora Wi-Fi |
| 418 | GSM | Rede celular 2G |
| 419 | GPRS | Dados em 2G/2.5G |
| 420 | UMTS | Rede celular 3G |
| 421 | LTE | Rede celular 4G |
| 422 | 5G NR | Interface de rádio 5G |
| 423 | RRC | Controle de rádio entre celular e rede |
| 424 | NAS (3GPP) | Sinalização entre dispositivo e núcleo da rede |
| 425 | PDCP | Compressão e cifra de dados no rádio LTE/5G |
| 426 | RLC | Segmentação e retransmissão no rádio |
| 427 | S1AP | Sinalização eNodeB ↔ núcleo LTE |
| 428 | NGAP | Sinalização gNodeB ↔ núcleo 5G |
| 429 | X2AP | Comunicação entre eNodeBs (handover) |
| 430 | XnAP | Comunicação entre gNodeBs |
| 431 | F1AP | Interface entre unidades centrais e distribuídas 5G |
| 432 | GTP-C | Controle de sessões em núcleo móvel |
| 433 | GTP-U | Túnel de dados de usuário em 4G/5G |
| 434 | PFCP | Separação de plano de controle e usuário (5G) |
| 435 | SS7 | Sinalização telefônica global legada |
| 436 | SIGTRAN | SS7 sobre IP |
| 437 | M3UA | Camada de adaptação SS7/SCTP |
| 438 | GSM MAP | Roaming, SMS e autenticação em redes móveis |
| 439 | CAMEL | Serviços inteligentes e pré-pago em celular |
| 440 | SMPP | Envio de SMS em massa entre aplicações e operadoras |
| 441 | USSD | Menus interativos em celulares (*123#) |
| 442 | WAP | Internet móvel legada |
| 443 | RDP | Área de trabalho remota Windows |
| 444 | RFB (VNC) | Área de trabalho remota multiplataforma |
| 445 | X11 | Interface gráfica remota em Unix/Linux |
| 446 | SPICE | Console de VMs em KVM/oVirt |
| 447 | PCoIP | VDI de alta qualidade (VMware, Teradici) |
| 448 | ICA/HDX | Aplicações e desktops virtuais Citrix |
| 449 | WinRM | Administração remota e PowerShell Remoting |
| 450 | WS-Management | Gestão de servidores e BMCs |
| 451 | DCOM | Objetos distribuídos Windows (OPC clássico) |
| 452 | MSRPC (DCE/RPC) | Base de AD, SMB e serviços Windows |
| 453 | ONC RPC | Base de NFS e NIS em Unix |
| 454 | rpcbind | Mapeamento de portas para serviços RPC |
| 455 | IIOP/GIOP | CORBA e servidores de aplicação Java EE |
| 456 | Java RMI | Chamadas remotas entre JVMs |
| 457 | LPD/LPR | Impressão em rede Unix legada |
| 458 | IPP | Impressão em rede moderna (AirPrint, CUPS) |
| 459 | IPPS | IPP sobre TLS |
| 460 | ONVIF | Interoperabilidade de câmeras IP e VMS |
| 461 | MySQL protocol | Conexão de aplicações ao MySQL/MariaDB |
| 462 | PostgreSQL wire protocol | Conexão de aplicações ao PostgreSQL |
| 463 | TDS | Conexão ao Microsoft SQL Server |
| 464 | Oracle TNS | Conexão ao banco Oracle |
| 465 | MongoDB Wire Protocol | Conexão ao MongoDB |
| 466 | RESP | Protocolo do Redis e Valkey |
| 467 | Memcached protocol | Cache distribuído em memória |
| 468 | CQL binary | Conexão ao Cassandra e ScyllaDB |
| 469 | Bolt | Conexão ao banco de grafos Neo4j |
| 470 | BitTorrent | Distribuição P2P de arquivos e ISOs |
| 471 | Kademlia DHT | Localização de pares sem tracker |
| 472 | IPFS Bitswap | Troca de blocos no IPFS |
| 473 | libp2p | Camada de rede de projetos P2P e blockchains |
| 474 | Bitcoin P2P | Propagação de blocos e transações |
| 475 | RLPx (devp2p) | Comunicação entre nós Ethereum |
| 476 | Tor | Navegação anônima e serviços onion |
| 477 | I2P | Rede anônima ponto a ponto |
| 478 | Raft | Consenso em etcd, Consul, Kubernetes |
| 479 | Paxos | Consenso em sistemas distribuídos (Chubby, Spanner) |
| 480 | SWIM | Detecção de falhas por gossip em clusters |
| 481 | ZAB | Consenso do Apache ZooKeeper |
| 482 | Totem | Comunicação de grupo no Corosync/Pacemaker |
| 483 | HL7 v2 | Troca de mensagens entre sistemas hospitalares |
| 484 | HL7 FHIR | APIs modernas de saúde sobre REST |
| 485 | DICOM | Imagens médicas, PACS e modalidades |
| 486 | ISO 8583 | Transações de cartão em ATMs e POS |
| 487 | FIX | Ordens e execuções em mercados financeiros |
| 488 | AS2 | EDI seguro entre parceiros comerciais |
| 489 | EDIFACT | Documentos EDI em comércio internacional |
| 490 | OFTP2 | EDI na indústria automotiva |
| 491 | DMX512 | Controle de iluminação cênica |
| 492 | Art-Net | DMX sobre Ethernet em shows e eventos |
| 493 | sACN (E1.31) | Iluminação profissional sobre IP |
| 494 | OSC | Controle de áudio, vídeo e instalações interativas |
| 495 | AES67 | Áudio profissional sobre IP interoperável |
| 496 | Dante | Áudio digital em estúdios, igrejas e eventos |
| 497 | MIDI | Instrumentos musicais e controladores |
| 498 | CFM (802.1ag) | OAM e detecção de falhas em Ethernet de operadora |
| 499 | ERPS (G.8032) | Proteção de anel Ethernet em telecom |
| 500 | ISATAP | Túnel IPv6 sobre infraestrutura IPv4 interna |
