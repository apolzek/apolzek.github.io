---
layout: post
title: operating-system/linux-kernel-params
description: Linux Kernel Params
summary: Linux Kernel Params
tags: linux params sysctl
---

## Linux Kernel Params

Para ajustar os parâmetros do kernel no Linux, você pode usar o comando `sysctl` para modificar configurações em tempo de execução. Para tornar as alterações permanentes, adicione as configurações ao arquivo de configuração `/etc/sysctl.conf` ou a um arquivo em `/etc/sysctl.d/`.

Aqui estão os comandos para alterar cada um dos parâmetros mencionados, junto com uma breve descrição do que cada um faz:

1. **fs.file-max:** Limite o número máximo de descritores de arquivos para o sistema.

   ```bash
   sysctl -w fs.file-max=6815744
   ```

2. **kernel.sem:** Configuração de IPC (Inter-Process Communication).

   ```bash
   sysctl -w kernel.sem="250 32000 100 128"
   ```

3. **kernel.shmmni:** Define o número máximo de identificadores de semáforos, memória compartilhada e segmentos de memória no sistema.

   ```bash
   sysctl -w kernel.shmmni=4096
   ```

4. **kernel.shmall:** Define o número total de páginas de memória compartilhada disponíveis para o sistema.

   ```bash
   sysctl -w kernel.shmall=1073741824
   ```

5. **kernel.shmmax:** Define o tamanho máximo do segmento de memória compartilhada que o sistema pode alocar.

   ```bash
   sysctl -w kernel.shmmax=4398046511104
   ```

6. **kernel.panic_on_oops:** Se definido como 1, o sistema entra em pânico em vez de reiniciar após um "oops" do kernel.

   ```bash
   sysctl -w kernel.panic_on_oops=1
   ```

7. **net.core.rmem_default:** Define o tamanho padrão do buffer de recebimento (em bytes) para soquetes de rede.

   ```bash
   sysctl -w net.core.rmem_default=262144
   ```

8. **net.core.rmem_max:** Define o tamanho máximo do buffer de recebimento (em bytes) para soquetes de rede.

   ```bash
   sysctl -w net.core.rmem_max=4194304
   ```

9. **net.core.wmem_default:** Define o tamanho padrão do buffer de envio (em bytes) para soquetes de rede.

   ```bash
   sysctl -w net.core.wmem_default=262144
   ```

10. **net.core.wmem_max:** Define o tamanho máximo do buffer de envio (em bytes) para soquetes de rede.

    ```bash
    sysctl -w net.core.wmem_max=1048576
    ```

11. **net.ipv4.conf.all.rp_filter:** Ativa ou desativa a filtragem de pacotes de resposta invertida.

    ```bash
    sysctl -w net.ipv4.conf.all.rp_filter=2
    ```

12. **net.ipv4.conf.default.rp_filter:** Ativa ou desativa a filtragem de pacotes de resposta invertida para a interface padrão.

    ```bash
    sysctl -w net.ipv4.conf.default.rp_filter=2
    ```

13. **fs.aio-max-nr:** Define o número máximo de solicitações assíncronas de I/O (AIO).

    ```bash
    sysctl -w fs.aio-max-nr=1048576
    ```

14. **net.ipv4.ip_local_port_range:** Define o intervalo de portas locais disponíveis para conexões TCP e UDP.

    ```bash
    sysctl -w net.ipv4.ip_local_port_range="9000 65500"
    ```

Após alterar esses valores usando `sysctl -w`, você pode verificar se as configurações foram aplicadas usando `sysctl -a`. Para tornar as alterações permanentes, adicione as linhas correspondentes ao arquivo `/etc/sysctl.conf` ou a um arquivo em `/etc/sysctl.d/` e execute `sysctl -p` para recarregar as configurações.