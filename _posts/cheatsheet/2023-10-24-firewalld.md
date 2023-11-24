---
layout: post
title: cheatsheet/firewalld
description: Cheatsheet firewalld
summary: Cheatsheet firewalld
tags: firewalld linux firewall
---

## Cheatsheet firewalld

Firewalld é um sistema de gerenciamento de firewall dinâmico para sistemas Linux. Ele foi desenvolvido pela Red Hat e introduzido no Fedora 18 em 2013 como uma alternativa ao iptables. O Firewalld foi projetado para oferecer uma interface simplificada para gerenciar regras de firewall e manipular zonas de rede.

Presente em distros como Red Hat Enterprise Linux (RHEL), CentOS, Fedora, Oracle Linux. 

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