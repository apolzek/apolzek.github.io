---
layout: post
title: tools/sre-commands
description: sre-commands
summary: sre-commands
tags: tools
---

## sre-commands

```
comando | xclip -selection clipboard

alias ccp='xclip -selection clipboard'

base64 /caminho/para/seu/arquivo | xclip -selection clipboard

```

listar arquivos de hoje, de forma recursiva, e mostrar o tamanho em MB

```
find . -type f -mtime 0 -exec ls -lh {} + | awk '{ print $5, $9 }'
```

Verificar as conexões externas à sua máquina, incluindo as portas que estão sendo utilizadas
```
netstat -tunap

ss -tunap

ss -tunap | grep -v '127.0.0.1\|::1'
```


```
ruby -run -ehttpd . -p8000
php -S localhost:8000
python3 -m http.server

npm install -g http-server
http-server -p 8000

while true; do { echo -ne "HTTP/1.1 200 OK\r\nContent-Length: $(wc -c <index.html)\r\nContent-Type: text/html\r\n\r\n"; cat index.html; } | nc -l -p 8080; done

```