# GitHub Pages

+ Theme: https://github.com/P0WEX/Gesko
+ Forked: https://github.com/DavideBrie/Gesko

*run*

```
mise install ruby@3.2.2
mise use -g ruby@3.2.2
export PATH="$HOME/.local/share/mise/installs/ruby/3.2.2/bin:$PATH"
gem install bundler jekyll
bundle install
bundle update liquid
bundle exec jekyll serve
```