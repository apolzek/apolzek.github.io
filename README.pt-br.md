# apolzek.github.io

[English](README.md)

## Rodando localmente

Precisa de Hugo Extended (0.146+), Go e Ruby.

```sh
./scripts/generate_index.rb
hugo server --renderToMemory -p 1313
```

Com rascunhos:

```sh
./scripts/generate_index.rb --drafts   # não comite o resultado
hugo server -D --renderToMemory -p 1313
```

Com Docker: `./scripts/dev.sh start` / `./scripts/dev.sh stop`.

## Escrevendo um post

```sh
./scripts/dev.sh new-post "Título do post"   # cria content/writing/<slug>/index.md e index.en.md
```

Para publicar:

1. Coloque `draft: false` nos dois arquivos.
2. Mova `content/writing/<slug>/` para `content/posts/AAAA-MM-DD-<slug>/`, com a data do `date` do front matter.
3. Rode `./scripts/tag_catalog.rb --check` e `./scripts/generate_index.rb` e comite.

As tags precisam existir em `data/tag_taxonomy.yml` (`./scripts/tag_catalog.rb --search "assunto"`).

## Deploy

Cada push na `main` publica no GitHub Pages via `.github/workflows/pages.yaml`.
