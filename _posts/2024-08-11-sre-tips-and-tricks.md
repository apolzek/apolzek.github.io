---
layout: post
title: SRE Tips and Tricks
description: Tips And Tricks
summary:
tags: tips linux
---


asdf ou mise https://github.com/connorads/mise

---

alias

# Alias monitor
alias MONITOR_ALL='xrandr --output HDMI-1 --mode 1920x1080 --primary --left-of eDP-1 --output eDP-1 --auto'
alias MONITOR_JUST_HDMI='xrandr --output HDMI-1 --mode 1920x1080 --primary --output eDP-1 --off'
alias MONITOR_JUST_NOTEBOOK='xrandr --output HDMI-1 --off --output eDP-1 --auto'
alias KEYBOARD_LOCAL='setxkbmap -model thinkpad -layout br -variant abnt2'
alias MONITOR_NOTEBOOK_BRILHANTE='xrandr --output eDP-1 --brightness 1.2'
alias clip='xclip -selection clipboard'
alias docker_killall='docker rm -f $(docker ps -aq)'


---

ferramentas

- docker
- kind
- nix os