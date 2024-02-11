---
layout: post
title: cheatsheet/terraform
description: Cheatsheet terraform
summary: Cheatsheet terraform
tags: terraform
---

## Cheatsheet terraform

```
# Inicializa o diretório do Terraform, baixando os plugins necessários para o provedor configurado.
terraform init

# Valida a configuração do arquivo do Terraform, verificando se há erros de sintaxe ou referências inválidas.
terraform validate

# Formata os arquivos de configuração do Terraform para seguir um estilo consistente.
terraform fmt

# Gera um plano de execução do Terraform, mostrando as mudanças que serão aplicadas na infraestrutura.
terraform plan

# Aplica as alterações planejadas no plano de execução do Terraform, modificando a infraestrutura de acordo.
terraform apply

# Destrói a infraestrutura provisionada pelo Terraform, removendo todos os recursos gerenciados.
terraform destroy

# Cria um novo workspace no Terraform, permitindo gerenciar diferentes estados de infraestrutura.
terraform workspace new dev

# Lista todos os workspaces disponíveis no Terraform.
terraform workspace list

# Seleciona um workspace específico no Terraform para ser utilizado nas operações subsequentes.
terraform workspace select dev

# Importa um recurso existente de um provedor para o estado do Terraform.
terraform import aws_s3_bucket.example my-bucket

# Lista todos os recursos gerenciados pelo Terraform no estado atual.
terraform state list

# Exibe o valor de uma saída (output) específica definida no arquivo de configuração do Terraform.
terraform output example_output

# Gera um gráfico da infraestrutura gerenciada pelo Terraform e exporta como uma imagem PNG.
terraform graph | dot -Tpng > graph.png

# Marca um recurso como "sujado", forçando o Terraform a recreá-lo na próxima aplicação.
terraform taint aws_instance.example

# Remove a marca de "sujado" de um recurso, permitindo que o Terraform continue gerenciando-o normalmente.
terraform untaint aws_instance.example

# Inicializa o diretório do Terraform, usando um arquivo de configuração alternativo.
terraform init -backend-config=config.tfbackend

# Aplica as alterações com aprovação automática, sem exigir interação do usuário.
terraform apply -auto-approve

# Aplica as alterações em um workspace específico.
terraform apply -var-file=dev.tfvars

# Destrói a infraestrutura provisionada pelo Terraform em um workspace específico.
terraform destroy -var-file=dev.tfvars
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

### Variable precedence

Variáveis Explicitamente Definidas
Arquivos de Variáveis (.tfvars)
Flags de Linha de Comando
Variáveis de Ambiente
Arquivo de Configuração do Terraform (.tf)