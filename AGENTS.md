# AGENTS.md

Project instructions for coding agents. The full guide is in [CLAUDE.md](CLAUDE.md); the two
standing rules below are the ones that look like defects at a glance and are not.

## 1. Never delete unreferenced images

`static/assets/img/` contains images no published post links to. They belong to drafts
(`draft: true` posts), to posts not written yet, or to posts that were unpublished and may come
back. Deleting one destroys the intent behind it. You may report them; removing or re-encoding
one is the author's call and needs an explicit ask for that specific file.

## 2. Drafts and secret posts stay drafts

Every post migrated from the old `_writing/` folder has `draft: true`. Some also carry
`secret: true` and a `password:` field from the old Jekyll site. Do not flip `draft` to `false`,
do not strip those fields, and do not run `generate_index.rb --drafts` and commit the result.
Publishing is the author's decision.

## Working on this repo

```sh
./scripts/tag_catalog.rb --check   # tags must exist in data/tag_taxonomy.yml
./scripts/generate_index.rb        # regenerate home + archive after content changes
hugo --minify                      # must build clean before pushing
```

Prefer proving a change over asserting it: build before and after and diff `public/`.
