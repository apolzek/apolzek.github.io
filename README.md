# apolzek.github.io

[Português](README.pt-br.md)

## Running locally

Requires Hugo Extended (0.146+), Go and Ruby.

```sh
./scripts/generate_index.rb
hugo server --renderToMemory -p 1313
```

Drafts too:

```sh
./scripts/generate_index.rb --drafts   # don't commit the result
hugo server -D --renderToMemory -p 1313
```

With Docker: `./scripts/dev.sh start` / `./scripts/dev.sh stop`.

## Writing a post

```sh
./scripts/dev.sh new-post "Post title"   # creates content/writing/<slug>/index.md and index.en.md
```

To publish:

1. Set `draft: false` in both files.
2. Move `content/writing/<slug>/` to `content/posts/YYYY-MM-DD-<slug>/`, using the `date` from the front matter.
3. Run `./scripts/tag_catalog.rb --check` and `./scripts/generate_index.rb`, then commit.

Tags must exist in `data/tag_taxonomy.yml` (`./scripts/tag_catalog.rb --search "topic"`).

## Deploy

Every push to `main` deploys to GitHub Pages via `.github/workflows/pages.yaml`.
