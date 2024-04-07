---
layout: post
title: tools/git/delete-all-commit-history-github
description: Delete all commit history on Github
summary: Delete all commit history on Github  
tags: git history github
---

## Delete all commit history on Github

Deleting the .git folder may cause problems in your git repository. If you want to delete all your commit history but keep the code in its current state, it is very safe to do it as in the following:

```sh
git checkout --orphan latest_branch
git add -A
git commit -am "commit message"
git branch -D main
git branch -m main
git push -f origin main
```

*PS: this will not keep your old commit history around*

[Reference](https://stackoverflow.com/questions/13716658/how-to-delete-all-commit-history-in-github)