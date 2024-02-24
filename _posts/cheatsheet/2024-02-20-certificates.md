---
layout: post
title: cheatsheet/certificates
description: Cheatsheet certificates
summary: Cheatsheet certificates
tags: certificates linux
---

## Cheatsheet certificates

https://github.com/Hakky54/certificate-ripper

```sh
crip print --url=https://stackoverflow.com/
crip export pkcs12 -u=https://github.com
crip print -u=https://github.com -f=pem

crip print -f=pem \
-u=https://youtube.com \
-u=https://github.com \
-u=https://stackoverflow.com \
-u=https://facebook.com

```