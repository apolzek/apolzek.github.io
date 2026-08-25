# AGENTS.md

Project instructions for coding agents working on this blog.

## Standing rules

These two exist because both look like defects at a glance and are not. Do not
"fix" either one. If a cleanup pass, an audit, or a review flags them, say they
are deliberate and point here.

### 1. Never delete unreferenced images

`assets/img/` contains images no post links to. They are not dead weight to be
swept up: they belong to drafts in `_writing/`, to posts not written yet, or to
posts that were unpublished and may come back. Deleting the file destroys the
intent behind it, and no grep can tell you which of those it was.

Currently unreferenced, as an example of what this covers — not a list to act
on, and not one that stays accurate:

```
Screenshot 2026-01-23 at 10.53.31.png   iis_solarwinds.webp
carta-medicos-bh.png                    julio.png
iis-dashboard-v2.png                    performance-monitor-window.png
iis.jpg                                 redis.png
iis_collector.png                       windows-iis-logs-exporter.png
```

You may report them, and you may report that some are large and unoptimised
(`lab-kafka-and-rabbitmq.png` is about 1MB). Removing one, or re-encoding one,
is the author's call and needs an explicit ask for that specific file.

### 2. The home page is hidden on purpose

`index.html` renders `#intro` with `.hidden-content { display: none }`, and only
a double click reveals it. That hides the title, the search box and the whole
post listing, so a first-time visitor sees an empty star field.

This is an easter egg, not a bug, and not an accessibility oversight to be
corrected. Leave the reveal behaviour alone. Anything added to `#intro` inherits
it — that is expected, and is why the build stamp above the title only appears
after the double click.

## Working on this repo

Build and check locally before pushing. `bundle` from the system Ruby is too old
here; use the Homebrew one:

```sh
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
./bin/build-stamp.sh                    # writes _data/build.yml, gitignored
bundle exec jekyll build -d /tmp/site
./bin/verify-build.sh /tmp/site
```

`bin/verify-build.sh` is the same gate CI runs between building and deploying.
It checks that core pages exist, that `search.json` and `feed.json` parse, that
assets were not wrapped in a layout, that the build stamp survived, and that no
dev file leaked into the output. Run it on any change that touches templates,
`_config.yml` or assets.

For a change you need to see in a browser, serve the built directory. Assets use
`relative_url`, so a local build serves local CSS and JS.

Prefer proving a change over asserting it: build before and after and diff the
output, and say what the diff was. Refactors that should change nothing can be
checked by seeding `Math.random` and comparing the resulting draw calls, which
is how `assets/js/cosmos.js` was verified.

## Conventions

- Commit messages, comments and documentation in English; the posts themselves
  are mixed Portuguese and English.
- Post front matter is `layout`, `title`, `minute`. There is no `description` or
  `summary` — nothing consumed them, and they were removed on purpose.
- A `.js` or `.json` file that needs Liquid must set `layout: null` in its front
  matter. `_config.yml` applies the `default` layout to every path, so without
  it Jekyll serves an HTML page from a `.js` URL.
- Secret posts appear in `search.json` with their password in clear. That is
  deliberate and documented at the top of that file — read it before touching.
