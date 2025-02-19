---
layout: post
title: Playing around with CoreDNS
description: 
summary:
tags: dns coredns
minute: 8
---

**saving your time**: *In this post, we will explore how to set up a basic DNS server using CoreDNS and configure it to serve local domain names while forwarding other DNS queries to external resolvers**



### Step 1: Stop systemd-resolved

```
sudo systemctl stop systemd-resolved
sudo coredns -conf ./Corefile
```

Corefile

```
admin.meudominio.local {
    file ./db.admin.meudominio.local
    log
    errors
}

.:53 {
    forward . 8.8.8.8 1.1.1.1
    cache
    log
    errors
}
```

db.admin.meudominio.local
```
$ORIGIN admin.meudominio.local.
@       3600 IN SOA  ns.admin.meudominio.local. admin.meudominio.local. (
                        2023101001 ; serial
                        3600       ; refresh
                        1800       ; retry
                        1209600    ; expire
                        3600 )     ; minimum
@       3600 IN NS   ns.admin.meudominio.local.
ns      3600 IN A    192.168.100.172
@       3600 IN A    192.168.100.1
```


/etc/resolv.conf
```
nameserver 192.168.100.70
```