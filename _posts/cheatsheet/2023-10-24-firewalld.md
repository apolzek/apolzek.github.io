---
layout: post
title: cheatsheet/firewalld
description: Cheatsheet firewalld
summary: Cheatsheet firewalld
tags: firewalld linux firewall
---

## Cheatsheet firewalld

Firewalld, introduced in Fedora 15, serves as a dynamic firewall solution for Linux, supplanting iptables and gaining widespread adoption in distributions like CentOS and RHEL. It brings several key features to the table. 

**Dynamic Configuration**: Firewalld allows for runtime changes without disrupting active connections, a departure from the static nature of iptables.

**Zone-Based Configuration**: The firewall organizes connections into zones such as public and internal, simplifying rule management based on the desired security levels for different network environments.

**Rich Rule Sets**: Firewalld supports rich rule sets, providing a more flexible approach to rule definitions compared to its predecessor iptables.

**Application Layer Filtering**: By integrating with D-Bus, Firewalld enables application layer filtering, allowing applications to define and manage their own firewall rules.

In terms of use cases, Firewalld finds its primary application in enhancing system security by controlling incoming and outgoing network traffic, safeguarding against unauthorized access. Its zone-based approach allows for tailored security measures on different network interfaces. Service level filtering simplifies rule management by allowing rule definitions based on services. The dynamic adaptability of Firewalld makes it suitable for environments with frequently changing network configurations. Additionally, its D-Bus integration facilitates application-specific firewall rule management, meeting the specific network requirements of various applications.

In summary, Firewalld stands as a versatile and dynamic firewall solution for Linux, offering enhanced security, flexibility in rule management, and application integration capabilities in dynamic network environments.

```
# Habilitar o Firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Desabilitar o Firewalld
sudo systemctl stop firewalld
sudo systemctl disable firewalld

# Verificar o Status do Firewalld
sudo systemctl status firewalld

# Listar as Zonas Disponíveis
sudo firewall-cmd --get-zones

# Definir uma Zona Padrão (substitua 'public' pelo nome da zona desejada)
sudo firewall-cmd --set-default-zone=public

# Adicionar uma Regra de Permissão de Porta (por exemplo, porta 80/tcp)
sudo firewall-cmd --add-port=80/tcp --permanent

# Recarregar o Firewalld para Aplicar Alterações Permanentes
sudo firewall-cmd --reload

# Adicionar uma Regra de Serviço (por exemplo, SSH)
sudo firewall-cmd --add-service=ssh --permanent

# Remover uma Regra de Serviço (por exemplo, SSH)
sudo firewall-cmd --remove-service=ssh --permanent

# Habilitar ou Desabilitar o Logging (substitua 'yes' ou 'no' conforme necessário)
sudo firewall-cmd --set-log-denied=yes --permanent
sudo firewall-cmd --set-log-denied=no --permanent

# Ativar ou Desativar o Firewalld
sudo systemctl start firewalld
sudo systemctl stop firewalld
```

Config 

`/etc/firewalld/firewalld.conf.`

![firewalld_structure_nftables](assets/img/firewalld_structure_nftables.png)
