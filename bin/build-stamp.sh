#!/bin/sh
# Writes _data/build.yml from the current commit. Jekyll cannot read git itself,
# so the build stamp on the home page is fed by this file.
# Run it before `jekyll build`; CI does the same (.github/workflows/jekyll.yml).
#
# date_display is pre-formatted here on purpose: rendering it with Liquid would
# use the timezone of whatever machine ran the build (UTC on the CI runner),
# so the same commit would show different times. Formatting from the commit's
# own recorded offset keeps it stable everywhere.
set -e
cd "$(dirname "$0")/.."

cat > _data/build.yml <<YAML
commit: $(git rev-parse --short=7 HEAD)
commit_full: $(git rev-parse HEAD)
date: $(git show -s --format=%cI HEAD)
date_display: "$(git show -s --format=%cd --date=format:'%b %d, %Y at %H:%M' HEAD)"
YAML

echo "wrote _data/build.yml:"
cat _data/build.yml
