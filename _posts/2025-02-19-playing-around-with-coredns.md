---
layout: post
title: Playing around with CoreDNS
description: 
summary:
tags: dns coredns
minute: 8
---

**saving your time**: *In this post, we will explore how to set up a basic DNS server using CoreDNS and configure it to serve local domain names while forwarding other DNS queries to external resolvers*

### Summary

1. Download Ubuntu Server ISO https://ubuntu.com/download/alternative-downloads
2. Install the Ubuntu Server on VirtualBox
3. Set the virtual machine network mode to bridge
4. Disable systemd-resolved on the newly installed Ubuntu
5. Download CoreDNS on the Ubuntu virtual machine
6. Create a Corefile with bellow configurations on the Ubuntu VM
7. Create a sample DNS zone file for CoreDNS
8. On the host machine, add an entry in /etc/hosts set IP of the Ubuntu VM to include it as an option for DNS resolution
9. Test name resolution to ensure the DNS is working correctly (browser and dig)

![ubuntu-vm](/assets/img/ubuntu-vm-lab.png)

After installing the virtual machine (VM) and assigning an IP address via DHCP, follow the steps below (:

### Configure Ubuntu Server

```
sudo systemctl stop systemd-resolved
wget https://github.com/coredns/coredns/releases/download/v1.10.1/coredns_1.10.1_linux_amd64.tgz
tar -xvzf coredns_1.10.1_linux_amd64.tgz
touch admin.meudominio.local
touch Corefile
```

![ubuntu-vm](/assets/img/ubuntu-vm-lab.png)

Create file **Corefile**
```
admin.meudominio.local {
    file ./admin.meudominio.local
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
> Corefile

Create file **admin.meudominio.local**
```
$ORIGIN admin.meudominio.local.
$TTL 3600

@       IN  SOA  ns.admin.meudominio.local. admin.admin.meudominio.local. (
            2025021901 ; serial
            3600       ; refresh
            1800       ; retry
            1209600    ; expire
            3600 )     ; minimum TTL

@       IN  NS  ns.admin.meudominio.local.

ns      IN  A   192.168.100.218
@       IN  A   192.168.100.1   ; admin.meudominio.local
db      IN  A   192.168.100.1   ; add db.admin.meudominio.local
apolzek IN  CNAME github.com.   ; add CNAME
```
> admin.meudominio.local

start CoreDNS
```
sudo coredns -conf ./Corefile
```

![ubuntu-vm](/assets/img/lab-coredns.png)

### Configure linux host (i'm using ubuntu)

Add the VM's IP to resolv.conf
```
nameserver 192.168.100.218 # VM with Ubuntu Server and CoreDNS
```
> /etc/resolv.conf

### Testing

Run in the host terminal
```
dig @192.168.100.218 apolzek.admin.meudominio.local
dig @192.168.100.218 admin.meudominio.local
```

[gif-dig](/assets/gif/dig-corednslab.gif)