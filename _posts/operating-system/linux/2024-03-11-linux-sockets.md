---
layout: post
title: operating-system/sockets
description: sockets
summary: sockets
tags: linux sockets
---

Em redes de computadores, sockets são endpoints de comunicação que permitem a troca de dados entre processos em uma rede. Eles são uma abstração fundamental para a comunicação em rede e são amplamente utilizados em sistemas operacionais, incluindo o Linux. Existem vários tipos de sockets, cada um adequado para diferentes tipos de comunicação. Aqui está um resumo detalhado dos principais tipos de sockets e como eles são usados no Linux:

### 1. Sockets de Fluxo (Stream Sockets)
- **Tipo:** SOCK_STREAM
- **Protocolo:** TCP (Transmission Control Protocol)
- **Características:** Conexão orientada, confiável, sequencial e baseada em byte.
- **Uso:** Utilizado para comunicações que requerem uma conexão estável e confiável, como transferência de arquivos, comunicação HTTP, e-mails, etc.
- **Exemplo no Linux:** Aplicações como servidores web (Apache, Nginx) e clientes de e-mail utilizam sockets de fluxo para garantir a entrega confiável de dados.

### 2. Sockets de Datagrama (Datagram Sockets)
- **Tipo:** SOCK_DGRAM
- **Protocolo:** UDP (User Datagram Protocol)
- **Características:** Sem conexão, não confiável, datagramas individuais e sem garantia de ordem.
- **Uso:** Utilizado para comunicações rápidas e que podem tolerar perda de pacotes, como streaming de vídeo, jogos online e protocolos de descoberta de rede.
- **Exemplo no Linux:** Aplicações como servidores DNS e serviços de streaming de vídeo frequentemente usam sockets de datagrama para troca rápida de dados.

### 3. Sockets Brutos (Raw Sockets)
- **Tipo:** SOCK_RAW
- **Protocolo:** Qualquer protocolo IP, incluindo ICMP, IGMP, etc.
- **Características:** Acesso direto ao protocolo de rede subjacente, permite a criação de pacotes personalizados.
- **Uso:** Utilizado para tarefas de baixo nível, como criação de sniffers de rede, ferramentas de diagnóstico e implementação de novos protocolos.
- **Exemplo no Linux:** Ferramentas como ping e traceroute usam sockets brutos para enviar e receber pacotes ICMP.

### 4. Sockets Sequenciais de Pacotes (SeqPacket Sockets)
- **Tipo:** SOCK_SEQPACKET
- **Protocolo:** Geralmente SCTP (Stream Control Transmission Protocol) ou protocolos específicos de sistema.
- **Características:** Conexão orientada, confiável, sequencial, mas com preservação de limites de mensagem.
- **Uso:** Utilizado para comunicações que exigem tanto confiabilidade quanto a preservação de limites de mensagem, como em alguns sistemas de controle industrial.
- **Exemplo no Linux:** Não tão comum quanto os outros tipos de sockets, mas pode ser usado em sistemas especializados ou para experimentação com o SCTP.

### Uso no Linux
No Linux, os sockets são criados e gerenciados por meio de chamadas de sistema como `socket()`, `bind()`, `listen()`, `accept()`, `connect()`, `send()`, `recv()`, e outras. Essas chamadas de sistema são parte da API POSIX e estão disponíveis em linguagens de programação como C e Python através de bibliotecas específicas.

Os sockets no Linux são utilizados por uma ampla gama de aplicações, desde servidores web e de e-mail até clientes de chat e jogos online. Eles são a base da comunicação em rede no sistema operacional e permitem que processos em diferentes máquinas (ou na mesma máquina) troquem dados de forma eficiente e flexível.

Além disso, o Linux oferece várias ferramentas e utilitários para trabalhar com sockets, como `netstat`, `ss`, `nc` (netcat), e `socat`, que ajudam os administradores de sistema a monitorar e diagnosticar a comunicação de rede em seus sistemas.

### Famílias de Endereços
`socket.AF_INET` é uma constante em muitas linguagens de programação, como Python, que indica o uso da família de endereços IPv4 para a comunicação de rede. "AF" significa "Address Family" (Família de Endereços). Aqui estão alguns dos tipos mais comuns de famílias de endereços que você pode encontrar:

1. **socket.AF_INET**
   - **Descrição:** Representa a família de endereços IPv4.
   - **Uso:** Utilizado para comunicação de rede usando o protocolo IP versão 4.

2. **socket.AF_INET6**
   - **Descrição:** Representa a família de endereços IPv6.
   - **Uso:** Utilizado para comunicação de rede usando o protocolo IP versão 6.

3. **socket.AF_UNIX (ou socket.AF_LOCAL)**
   - **Descrição:** Representa a família de endereços de sockets do tipo Unix.
   - **Uso:** Utilizado para comunicação entre processos no mesmo sistema operacional Unix ou Linux, usando um arquivo de socket no sistema de arquivos.

4. **socket.AF_PACKET**
   - **Descrição:** Usado para comunicação de baixo nível usando interfaces de rede diretamente.
   - **Uso:** Permite o envio e recebimento de pacotes a nível de enlace de dados (camada 2), como Ethernet.

5. **socket.AF_BLUETOOTH**
   - **Descrição:** Representa a família de endereços para comunicação Bluetooth.
   - **Uso:** Utilizado para comunicação de rede usando a tecnologia Bluetooth.

6. **socket.AF_CAN**
   - **Descrição:** Representa a família de endereços para Controller Area Network (CAN).
   - **Uso:** Utilizado para comunicação em sistemas embarcados e automotivos usando o protocolo CAN.

7. **socket.AF_IRDA**
   - **Descrição:** Representa a família de endereços para comunicação infravermelha (IrDA).
   - **Uso:** Utilizado para comunicação de rede usando a tecnologia de comunicação de dados por infravermelho.

Cada família de endereços é projetada para um tipo específico de comunicação de rede ou protocolo. Ao criar um socket em uma linguagem de programação, você precisa especificar a família de endereços que deseja usar, o que determinará como o socket se comunica e que tipo de endereços ele pode usar.

client.py
```python
import socket

HOST = '127.0.0.1'
PORT = 65432

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.connect((HOST, PORT))
    s.sendall(b'Ola, servidor!')
    data = s.recv(1024)

print(f'Recebido: {data.decode()}')


server.py
```python
import socket
HOST = '127.0.0.1'
PORT = 65432

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind((HOST, PORT))
    s.listen()
    print('Servidor aguardando conexão...')
    conn, addr = s.accept()
    with conn:
        print(f'Conectado por {addr}')
        while True:
            data = conn.recv(1024)
            if not data:
                break
            conn.sendall(data)

```