---
layout: post
title: tools/sre-commands
description: sre-commands
summary: sre-commands
tags: tools
---

## sre-commands

copy/paste using xclip
```sh
<comando> | xclip -selection clipboard
pwd | xclip -selection clipboard

alias ccp='xclip -selection clipboard'
base64 ~/.bashrc | xclip -selection clipboard
```

list today's files, recursively, and show the size in MB
```sh
find . -type f -mtime 0 -exec ls -lh {} + | awk '{ print $5, $9 }'
```

check the external connections to your machine, including the ports being used
```sh
netstat -tunap
ss -tunap
ss -tunap | grep -v '127.0.0.1\|::1'
```

create http server(ways)
```sh
ruby -run -ehttpd . -p8000
php -S localhost:8000
python3 -m http.server
npm install -g http-server
http-server -p 8000
while true; do { echo -ne "HTTP/1.1 200 OK\r\nContent-Length: $(wc -c <index.html)\r\nContent-Type: text/html\r\n\r\n"; cat index.html; } | nc -l -p 8080; done
```