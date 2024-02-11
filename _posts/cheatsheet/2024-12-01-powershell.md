---
layout: post
title: cheatsheet/powershell
description: Cheatsheet powershell
summary: Cheatsheet powershell
tags: powershell linux
---

## Cheatsheet powershell

```powershell
# Imprimir uma mensagem na tela
Write-Output "Hello, World!"

# Declarar variáveis
$idade = 30
$nome = "João"
$salario = 2500.50
$ativo = $true

# Comentários de linha única

<#
Comentários
de várias
linhas
#>

# Operadores aritméticos
$soma = 5 + 3
$subtracao = 10 - 4
$multiplicacao = 2 * 6
$divisao = 15 / 3
$exponenciacao = 2 ** 3
$resto_divisao = 10 % 3

# Estruturas condicionais
if ($idade -ge 18) {
    Write-Output "Você é maior de idade"
} else {
    Write-Output "Você é menor de idade"
}

# Estruturas de repetição - Loop for
for ($i = 0; $i -lt 5; $i++) {
    Write-Output $i
}

# Estruturas de repetição - Loop while
$contador = 0
while ($contador -lt 5) {
    Write-Output $contador
    $contador++
}

# Listas
$cores = @('vermelho', 'verde', 'azul')
$primeira_cor = $cores[0]
$cores += 'amarelo'
$tamanho_lista = $cores.Count

# Dicionários
$pessoa = @{
    'nome' = 'Maria'
    'idade' = 25
}
$idade_da_pessoa = $pessoa['idade']
$pessoa['profissao'] = 'engenheira'

# Funções
function Saudacao {
    param (
        [string]$nome
    )
    Write-Output "Olá, $nome"
}

Saudacao "Ana"

# Trabalhar com arquivos
$conteudo = Get-Content arquivo.txt

# Manipulação de strings
$mensagem = "Olá, Mundo!"
$tamanho = $mensagem.Length
$maiusculas = $mensagem.ToUpper()
$minusculas = $mensagem.ToLower()
$palavras = $mensagem -split ','

# Tratamento de exceções
try {
    $resultado = 10 / 0
} catch {
    Write-Output "Não é possível dividir por zero"
}

# Trabalhar com datas e horas
$agora = Get-Date
$ano_atual = $agora.Year
$mes_atual = $agora.Month

# Compreensão de lista
$numeros = @(1, 2, 3, 4, 5)
$dobro = $numeros | ForEach-Object { $_ * 2 }

# Definir uma classe
class Pessoa {
    [string]$nome
    [int]$idade

    Pessoa([string]$nome, [int]$idade) {
        $this.nome = $nome
        $this.idade = $idade
    }

    [void] Saudacao() {
        Write-Output "Olá, $($this.nome)"
    }
}

# Instanciar um objeto da classe Pessoa
$p1 = [Pessoa]::new("Carlos", 30)
$p1.Saudacao()
```

### HTTP Server