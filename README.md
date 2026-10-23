# apolzek.github.io

Blog pessoal de Vinícius Gomes Batista (apolzek), em [Hugo](https://gohugo.io) com o tema
[Hextra](https://github.com/imfing/hextra), usando o visual e os layouts do
[blog do Fabio Akita](https://github.com/akitaonrails/akitaonrails.github.io).

## Rodando localmente

Precisa de Hugo Extended (0.146+), Go e Ruby.

```sh
brew install hugo            # macOS

./scripts/generate_index.rb  # gera content/_index.md e content/_index.en.md
hugo server --renderToMemory -p 1313
```

Abra <http://localhost:1313>. Pra ver rascunhos (`draft: true`) também:

```sh
./scripts/generate_index.rb --drafts   # não comite o resultado
hugo server -D --renderToMemory -p 1313
```

Com Docker:

```sh
./scripts/dev.sh start        # http://localhost:1313
./scripts/dev.sh stop
./scripts/dev.sh new-post "Título"
```

## Estrutura

```
content/posts/AAAA-MM-DD-<slug>/     # post publicado: index.md (PT, URL /AAAA/MM/DD/<slug>/)
                                     # e index.en.md (EN, URL /en/AAAA/MM/DD/<slug-en>/)
content/writing/<slug>/              # rascunhos (draft: true), em escrita
content/_index.md, _index.en.md      # home PT/EN, GERADAS por scripts/generate_index.rb
content/about.md, about.en.md        # Sobre
content/thoughts*.md                 # Thoughts (dados em data/thoughts.yml; image/alt/caption e text_en opcionais)
content/moments*.md                  # Moments: grade de fotos com legenda (dados em data/moments.yml)
content/cheatsheet*.md               # Cheatsheet (dados em data/cheatsheet.yml)
content/dm/<slug>/index.md           # Direct message: textos ocultos, abertos por código
data/tag_taxonomy.yml                # tags permitidas, com nome pt e en
i18n/pt-br.yaml, en.yaml             # textos da interface
layouts/                           # overrides do Hextra (visual do AkitaOnRails)
static/assets/img/                 # imagens dos posts
_grimoire/                         # anotações pessoais, não são publicadas
```

## Escrevendo um post

```sh
./scripts/dev.sh new-post "Título do post"   # cria content/writing/<slug>/index.md e index.en.md
```

Pra publicar: `draft: false` nos dois arquivos e mova a pasta de `content/writing/<slug>/` para
`content/posts/AAAA-MM-DD-<slug>/`, com a data do `date`. Assim `content/posts/` fica em ordem de
publicação. A URL (`/AAAA/MM/DD/slug/`) sai do `date` e do `slug` do front matter (`permalinks` no
`hugo.yaml`), não do nome da pasta: mudar a data muda a URL (renomeie a pasta junto).

`tag_catalog.rb --check` (roda no deploy) falha se um post publicado não tiver o par PT + EN, se
houver rascunho em `posts/` ou post publicado em `writing/`, ou se a pasta em `posts/` não começar
com a data do post.

Front matter mínimo:

```yaml
---
title: "Título"
slug: "titulo"
date: '2026-10-08T12:00:00-03:00'
draft: false
description: "TL;DR concreto do post, aparece na home e nos cards."
tags:
- kubernetes
---
```

Para a versão em inglês, crie `index.en.md` na mesma pasta com título, slug e
descrição traduzidos e as tags na coluna `en` da taxonomia. Sem o `index.en.md`,
o botão EN daquele post aparece desabilitado.

As tags precisam existir em `data/tag_taxonomy.yml`:

```sh
./scripts/tag_catalog.rb --search "assunto"   # procura uma tag
./scripts/tag_catalog.rb --check              # valida todos os posts
```

Depois de publicar ou despublicar um post, rode `./scripts/generate_index.rb` e
comite os `_index.md` gerados. Blocos ```mermaid são renderizados pelo Hextra.

## Direct message (textos por código)

Textos em `content/dm/<slug>/index.md` não aparecem na home, na busca, no RSS
nem no sitemap. A página `/dm/` tem um input: quem digita o `code:` certo é
levado ao texto. O código fica exposto no HTML da página, de propósito; é uma
cortina, não um cadeado. Front matter:

```yaml
---
title: "Título"
date: '2026-10-08T12:00:00-03:00'
draft: false
description: "Resumo."
code: "palavra-secreta"
build:
  list: local
sitemap:
  disable: true
---
```

Códigos atuais: `nexus`, `sollicitudo`, `protocolos`, `cncf`. Sem tags, para o
texto não vazar nas páginas de tag.

## Deploy

GitHub Pages via `.github/workflows/pages.yaml` a cada push na `main`
(Pages precisa estar configurado como "GitHub Actions" nas settings do repo).
