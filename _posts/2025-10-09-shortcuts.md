---
layout: post
title: shortcuts
description: 
summary: 
tags: shortcuts
minute: 
---

## VIM

| **Shortcut**    | **Description**                                                  |
| --------------- | ---------------------------------------------------------------- |
| `i`             | Enter insert mode at cursor position.                            |
| `I`             | Enter insert mode at the beginning of the current line.          |
| `a`             | Enter insert mode after the cursor position.                     |
| `A`             | Enter insert mode at the end of the current line.                |
| `o`             | Open a new line below and enter insert mode.                     |
| `O`             | Open a new line above and enter insert mode.                     |
| `:w`            | Save (write) the current file.                                   |
| `:q`            | Quit Vim.                                                        |
| `:wq`           | Save and quit.                                                   |
| `:q!`           | Quit without saving.                                             |
| `u`             | Undo the last change.                                            |
| `Ctrl + r`      | Redo the last undone change.                                     |
| `yy`            | Yank (copy) the entire current line.                             |
| `p`             | Paste the yanked text after the cursor.                          |
| `P`             | Paste the yanked text before the cursor.                         |
| `dd`            | Delete (cut) the entire current line.                            |
| `dw`            | Delete (cut) from the cursor to the end of the current word.     |
| `d$`            | Delete (cut) from the cursor to the end of the line.             |
| `x`             | Delete (cut) the character under the cursor.                     |
| `r`             | Replace the character under the cursor with a new one.           |
| `v`             | Enter visual mode (text selection).                              |
| `V`             | Enter visual line mode (select entire lines).                    |
| `Ctrl + v`      | Enter visual block mode (select rectangular blocks of text).     |
| `:s/foo/bar/g`  | Replace all occurrences of "foo" with "bar" in the current line. |
| `:%s/foo/bar/g` | Replace all occurrences of "foo" with "bar" in the entire file.  |
| `/pattern`      | Search for a pattern in the file.                                |
| `n`             | Jump to the next occurrence of the search pattern.               |
| `N`             | Jump to the previous occurrence of the search pattern.           |
| `gg`            | Go to the beginning of the file.                                 |
| `G`             | Go to the end of the file.                                       |
| `:e filename`   | Open a new file named "filename".                                |
| `:bd`           | Close the current buffer (file).                                 |
| `Ctrl + o`      | Go to the last cursor position.                                  |
| `Ctrl + i`      | Go forward to the next cursor position.                          |
| `Ctrl + z`      | Suspend Vim (send to background in terminal).                    |
| `J`             | Join the current line with the line below it.                    |
| `.`             | Repeat the last command.                                         |
| `%`             | Jump to the matching pair (e.g., parentheses, brackets).         |
| `:!command`     | Run a shell command from within Vim.                             |
| `Ctrl + f`      | Scroll one page forward.                                         |
| `Ctrl + b`      | Scroll one page backward.                                        |
| `Ctrl + u`      | Scroll half a page up.                                           |
| `Ctrl + d`      | Scroll half a page down.                                         |
| `H`             | Move the cursor to the top of the screen.                        |
| `M`             | Move the cursor to the middle of the screen.                     |
| `L`             | Move the cursor to the bottom of the screen.                     |
| `:help`         | Open Vim's help documentation.                                   |
