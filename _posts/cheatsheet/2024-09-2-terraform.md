---
layout: post
title: cheatsheet/terraform
description: Cheatsheet terraform
summary: Cheatsheet terraform
tags: terraform
---

## Cheatsheet terraform

```
terraform init
terraform validate
terraform fmt
terraform plan
terraform apply
terraform destroy
terraform workspace new dev
terraform workspace list
terraform workspace select dev
terraform import aws_s3_bucket.example my-bucket
terraform state list
terraform output example_output
terraform graph | dot -Tpng > graph.png
terraform taint aws_instance.example
terraform untaint aws_instance.example
```

**terraform init**: Este comando é usado para inicializar um novo diretório de configuração do Terraform. Ele baixa os provedores e módulos especificados no arquivo de configuração.

**terraform plan**: Este comando cria um plano de execução que mostra o que o Terraform fará antes de efetivamente fazer qualquer alteração na infraestrutura. É uma boa prática executar isso antes de aplicar qualquer configuração.

**terraform apply**: Este comando é usado para aplicar as alterações definidas em seu código do Terraform à infraestrutura. Ele criará, atualizará ou destruirá recursos conforme necessário.

**terraform destroy**: Este comando é usado para destruir todos os recursos definidos em seu código do Terraform. Use com cuidado, pois isso pode resultar na perda de recursos.

**terraform validate**: Este comando verifica a sintaxe do arquivo de configuração do Terraform e verifica se há erros.

**terraform fmt**: Este comando formata seu código Terraform de acordo com as convenções de estilo do Terraform.

**terraform workspace**: Este comando permite que você gerencie workspaces (espaços de trabalho) no Terraform, o que é útil para lidar com configurações diferentes em um único diretório.

**terraform import**: Este comando é usado para importar um recurso existente em um provedor para o estado do Terraform. Isso é útil quando você deseja começar a gerenciar recursos que já existem.

**terraform state**: Este comando permite manipular diretamente o estado do Terraform, que é útil em situações avançadas de gerenciamento de estado.

**terraform output**: Este comando exibe os valores de saída definidos em seu arquivo de configuração do Terraform.

**terraform graph**: Este comando gera uma representação visual do gráfico de recursos do Terraform, mostrando as dependências entre recursos.

**terraform taint**: Este comando marca um recurso como "sujo" no estado, o que faz com que o Terraform o reconstrua na próxima vez que você executar o terraform apply.

**terraform untaint**: Este comando remove a marcação de "sujeira" de um recurso no estado.