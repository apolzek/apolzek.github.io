---
layout: post
title: aws/dominando-o-iam
description: Dominando de uma vez por todas o AWS IAM
summary: Dominando de uma vez por todas o AWS IAM
tags: iam aws security
---



A IAM (Identity and Access Management) é um serviço fundamental da AWS (Amazon Web Services) que permite gerenciar de forma segura o acesso aos recursos da AWS. Com a IAM, você pode criar e gerenciar usuários, grupos e funções, além de definir permissões detalhadas para controlar quem tem acesso a quais recursos e ações dentro da sua conta da AWS. Aqui estão alguns conceitos importantes e exemplos práticos de uso da IAM:

#### Usuários

Um usuário é uma identidade que você cria para alguém ou algo (como uma aplicação) que precisa acessar sua conta da AWS. Cada usuário possui um nome de usuário exclusivo e credenciais de login. Aqui está um exemplo de criação de um usuário na IAM:

```
aws iam create-user --user-name myuser
```

#### Grupos

Um grupo é um conjunto de permissões que você pode aplicar a vários usuários. Você atribui políticas (conjuntos de permissões) aos grupos, e os usuários que pertencem ao grupo herdam essas permissões. Aqui está um exemplo de criação de um grupo na IAM e associação de um usuário a ele:

```
aws iam create-group --group-name mygroup
aws iam add-user-to-group --group-name mygroup --user-name myuser

```

#### Políticas

As políticas definem as permissões de acesso em formato JSON. Elas especificam o que um usuário, grupo ou função pode fazer com recursos específicos. Aqui está um exemplo de criação de uma política que permite a leitura de um bucket S3:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::my-bucket/*"
        }
    ]
}
```

#### Funções

As funções permitem conceder permissões temporárias a serviços da AWS ou entidades confiáveis. Isso é útil para permitir que serviços acessem outros recursos em seu nome, sem a necessidade de compartilhar credenciais de acesso direto. Aqui está um exemplo de criação de uma função que permite que uma instância EC2 acesse um bucket S3:

```
aws iam create-role --role-name myrole --assume-role-policy-document file://trust-policy.json
```

#### Assume Role Policy Document

O documento de política de confiança é um JSON que define quais entidades ou serviços podem assumir uma função. Aqui está um exemplo simplificado:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "ec2.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
```