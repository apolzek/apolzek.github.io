---
layout: post
title: tools/git/undoing-things
description: undoing-things
summary: undoing-things  
tags: git history github
---

## undoing-things

If you haven't pushed the changes to the remote repository yet, you can undo the commit using the git reset command. To undo the last commit while keeping the commit's changes in your working directory, use:

```sh
git reset HEAD~1
```


If you've already pushed and want to remove the last commit from the remote repository, you can use the git push command with the --force or -f option.

```sh
git push origin HEAD~1 --force
```