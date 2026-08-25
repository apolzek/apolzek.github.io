#!/bin/sh
# Sanity checks on a built site. Run against the output directory:
#   ./bin/verify-build.sh build
# CI runs this between building and deploying, so a build that produced
# nonsense fails the job instead of being published.
set -e
DIR="${1:-build}"
fail() { echo "FAIL: $*" >&2; exit 1; }
ok()   { echo "ok: $*"; }

[ -d "$DIR" ] || fail "$DIR does not exist"

# Pages that must exist and carry content.
for f in index.html 404.html sitemap.xml atom.xml; do
  [ -s "$DIR/$f" ] || fail "$f missing or empty"
done
ok "core pages present"

# Posts actually got rendered. 5 is a floor, not a target.
posts=$(find "$DIR" -name '*.html' | wc -l | tr -d ' ')
[ "$posts" -ge 5 ] || fail "only $posts html files built"
ok "$posts html pages built"

# JSON endpoints must parse. A Liquid slip here yields a file that looks
# fine and breaks the search silently.
for f in search.json feed.json; do
  [ -s "$DIR/$f" ] || fail "$f missing or empty"
  python3 -c "import json,sys; json.load(open(sys.argv[1]))" "$DIR/$f" \
    || fail "$f is not valid JSON"
done
ok "search.json and feed.json parse"

# Assets must be served as themselves. A .js file with front matter but no
# "layout: null" comes out as a full HTML page, which is exactly the bug this
# check was written after.
for f in assets/js/cosmos.js assets/js/site.js assets/css/catppuccin.css; do
  [ -s "$DIR/$f" ] || fail "$f missing or empty"
  if grep -qi '<html\|<!doctype' "$DIR/$f"; then
    fail "$f contains HTML - it was probably wrapped in a layout"
  fi
done
ok "assets are not HTML"

# The home page carries the build stamp, so a silently skipped stamp step
# does not reach production.
grep -q 'class="build-stamp"' "$DIR/index.html" || fail "build stamp missing from index.html"
ok "build stamp present"

# Files that have leaked into the output before.
for f in package.json package-lock.json Gemfile bin AGENTS.md CLAUDE.md README.md; do
  [ ! -e "$DIR/$f" ] || fail "$f should not be published"
done
ok "no dev files published"

echo "build verified"
