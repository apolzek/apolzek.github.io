# GitHub Pages

+ Theme: https://github.com/P0WEX/Gesko
+ Forked: https://github.com/DavideBrie/Gesko

## Running locally

### 1. System build dependencies (Ubuntu / Debian)

`ruby-build` compiles ruby from source, so the OS needs the matching headers
and toolchain. Without these the build fails with errors like
`Neither readline nor libedit was found`.

```sh
sudo apt update
sudo apt install -y autoconf patch build-essential rustc \
  libssl-dev libyaml-dev libreadline-dev zlib1g-dev libgmp-dev \
  libncurses-dev libffi-dev libgdbm-dev libdb-dev uuid-dev
```

> On Fedora use `dnf groupinstall "Development Tools"` + the equivalent
> `-devel` packages. On Arch most of these come with `base-devel`.

### 2. Ruby via mise

```sh
mise install ruby@3.2.2
mise use -g ruby@3.2.2
export PATH="$HOME/.local/share/mise/installs/ruby/3.2.2/bin:$PATH"
```

### 3. Jekyll + gems

```sh
gem install bundler jekyll
bundle install
bundle update liquid
bundle exec jekyll serve
```

The site will be available at <http://127.0.0.1:4000/>.

## Layout

```
_posts/      # blog posts (YYYY-MM-DD-slug.md)
_grimoire/   # cheatsheet entries
_data/       # site data (thoughts.yml, etc.)
_layouts/    # page templates
_includes/   # partials
_sass/       # styles
assets/      # images, gifs, downloads
index.html   # home (typing title + subtitle live here)
references.html   # people i admire across different fields
thoughts.html
cheatsheet.html
```

## Authoring a post

Create a file in `_posts/` named `YYYY-MM-DD-slug.md` with the front matter:

```yaml
---
layout: post
title: post title
description: short blurb (optional)
summary:
# tags: tag1 tag2
minute: 6
---
```

Conventions used across the blog:

- Title in lower or sentence case, no trailing punctuation.
- First paragraph starts with `**saving your time**: *one-line TL;DR*`.
- Fence every code block with the language (` ```sh `, ` ```yaml `,
  ` ```mermaid `, etc.) so syntax highlighting works.
- Keep prose first-person and direct — the blog is a journal, not a manual.
