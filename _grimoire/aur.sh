#!/bin/bash

echo "your password please (:"
sudo -v
while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null &
pacotes=(
  "postman-bin"
  "visual-studio-code-bin"
  "spotify"
  "slack-desktop"
  "dbeaver"
  "obs-studio-git"
)

for pacote in "${pacotes[@]}"; do
    yay -S --noconfirm "$pacote" # yay with sudo? you are weird..
done
echo "All packages have been installed"
