#!/usr/bin/env ruby
# frozen_string_literal: true

# Gera a home nos dois idiomas, com todos os posts, a partir de
# content/posts/AAAA-MM-DD-<slug>/index.md (PT) e index.en.md (EN); com --drafts, também
# content/writing/. A URL vem do front matter (date + slug), igual ao permalink
# do hugo.yaml:
#
#   content/_index.md            content/_index.en.md
#
# Nunca edite esses arquivos à mão.
#
#   ./scripts/generate_index.rb            # só posts publicados
#   ./scripts/generate_index.rb --drafts   # inclui rascunhos (preview local)
#   ./scripts/generate_index.rb --future   # inclui posts com data futura

require 'yaml'
require 'date'
require 'cgi'

CONTENT_DIR = 'content'
FRONTMATTER_DELIMITER = '---'
TAG_TAXONOMY = YAML.safe_load(File.read('data/tag_taxonomy.yml'))
ALLOWED_TAGS = {
  pt: TAG_TAXONOMY.fetch('tags').values.map { |values| values.fetch('pt') } +
      TAG_TAXONOMY.fetch('event_series').keys +
      TAG_TAXONOMY.fetch('special_tags').values.map { |values| values.fetch('pt') },
  en: TAG_TAXONOMY.fetch('tags').values.map { |values| values.fetch('en') } +
      TAG_TAXONOMY.fetch('event_series').keys +
      TAG_TAXONOMY.fetch('special_tags').values.map { |values| values.fetch('en') }
}.transform_values(&:freeze).freeze

L = {
  pt: {
    title: 'apolzek | Journal',
    intro: "_Sistemas em produção, observabilidade e engenharia de confiabilidade. Documentando experiências técnicas e, fora da produção, explorando filosofia e reflexões sobre a vida._",
    list: 'Lista', grid: 'Grade', view: 'Visualização dos posts',
    months: [nil, 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
             'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    date_fmt: '%d/%m/%Y', prefix: ''
  },
  en: {
    title: 'apolzek | Journal',
    intro: "_Production systems, observability and reliability engineering. Documenting technical experiences and, outside production, exploring philosophy and reflections on life._",
    list: 'List', grid: 'Grid', view: 'Post view',
    months: Date::MONTHNAMES,
    date_fmt: '%b %-d, %Y', prefix: '/en'
  }
}.freeze

def escape_html(text)
  CGI.escapeHTML(text.to_s)
end

def tag_url(tag, lang)
  "#{L[lang][:prefix]}/tags/#{CGI.escape(tag).gsub('+', '%20')}/"
end

def render_tag_links(tags, lang:, modifier:)
  links = tags.map do |tag|
    %(<a class="aor-tag-link" href="#{escape_html(tag_url(tag, lang))}">##{escape_html(tag)}</a>)
  end
  return '' if links.empty?

  %(<span class="aor-post-tags aor-post-tags--#{modifier}">#{links.join}</span>)
end

def extract_frontmatter(content)
  return nil unless content.start_with?("#{FRONTMATTER_DELIMITER}\n")

  end_index = content.index("\n#{FRONTMATTER_DELIMITER}\n", 4)
  return nil unless end_index

  YAML.safe_load(content[4..end_index], permitted_classes: [Date, Time])
end

def parse_post(path, lang:, include_drafts: false)
  content = File.read(path)
  frontmatter = extract_frontmatter(content)
  return nil unless frontmatter&.dig('title') && frontmatter&.dig('date')
  return nil if frontmatter['draft'] == true && !include_drafts

  date = DateTime.parse(frontmatter['date'].to_s)
  slug = frontmatter['slug'].to_s
  slug = File.basename(File.dirname(path)).sub(/\A\d{4}-\d{2}-\d{2}-/, '') if slug.empty?
  url = frontmatter['url'] ? frontmatter['url'].to_s : "#{L[lang][:prefix]}/#{date.strftime('%Y/%m/%d')}/#{slug}/"

  tags = Array(frontmatter['tags']).map(&:to_s)
  unknown_tags = tags - ALLOWED_TAGS.fetch(lang)
  unless unknown_tags.empty?
    raise "#{path}: tag(s) #{lang.to_s.upcase} desconhecida(s): #{unknown_tags.join(', ')}. Rode scripts/tag_catalog.rb --search QUERY."
  end

  {
    title: frontmatter['title'],
    description: frontmatter['description'].to_s,
    url: url,
    date: date,
    tags: tags
  }
rescue ArgumentError, Psych::SyntaxError => e
  warn "Error parsing #{path}: #{e.message}"
  nil
end

def collect_posts(lang, include_future: false, include_drafts: false)
  now = DateTime.now
  file = lang == :en ? 'index.en.md' : 'index.md'
  Dir.glob("#{CONTENT_DIR}/{posts,writing}/*/#{file}")
     .map { |path| parse_post(path, lang: lang, include_drafts: include_drafts) }
     .compact
     .select { |post| include_future || post[:date] <= now }
end

def group_by_month(posts)
  posts
    .sort_by { |post| [post[:date], post[:url]] }
    .reverse
    .group_by { |post| [post[:date].year, post[:date].month] }
end

def render_months(grouped_posts, lang:, show_tags: false)
  lines = []

  grouped_posts.keys.sort.reverse.each do |(year, month)|
    lines << "## #{year} - #{L[lang][:months][month]}\n"

    grouped_posts[[year, month]].each do |post|
      line = %(- <a class="aor-index-list__main-link" href="#{escape_html(post[:url])}" title="#{escape_html(post[:description])}">#{escape_html(post[:title])}</a>)
      line += "<br>#{render_tag_links(post[:tags], lang: lang, modifier: 'index-list')}" if show_tags
      lines << line
    end

    lines << ''
  end

  lines
end

def render_post_card(post, lang:)
  <<~HTML.chomp
    <article class="aor-post-card" title="#{escape_html(post[:description])}">
      <time class="aor-post-card__date" datetime="#{post[:date].to_date.iso8601}">#{post[:date].strftime(L[lang][:date_fmt])}</time>
      <h3 class="aor-post-card__title"><a class="aor-post-card__title-link" href="#{escape_html(post[:url])}">#{escape_html(post[:title])}</a></h3>
      #{render_tag_links(post[:tags], lang: lang, modifier: 'card')}
      <p class="aor-post-card__description">#{escape_html(post[:description])}</p>
    </article>
  HTML
end

def render_grid_months(grouped_posts, lang:)
  lines = ['<div id="aor-index-grid" class="aor-index-grid" data-index-view="grid">']

  grouped_posts.keys.sort.reverse.each do |(year, month)|
    posts = grouped_posts[[year, month]]
    count_label = "#{posts.length} #{posts.length == 1 ? 'post' : 'posts'}"
    heading_id = "aor-grid-#{year}-#{format('%02d', month)}"

    lines << <<~HTML.chomp
      <section class="aor-index-month" aria-labelledby="#{heading_id}">
        <div class="aor-index-month__header">
          <h2 id="#{heading_id}">#{escape_html("#{year} - #{L[lang][:months][month]}")}</h2>
          <span>#{escape_html(count_label)}</span>
        </div>
        <div class="aor-post-grid">
    HTML

    posts.each { |post| lines << render_post_card(post, lang: lang) }

    lines << <<~HTML.chomp
        </div>
      </section>
    HTML
  end

  lines << '</div>'
  lines << ''
  lines
end

def render_index_views(grouped_posts, lang:)
  lines = ['{{% index-list %}}']
  lines.concat(render_months(grouped_posts, lang: lang, show_tags: true))
  lines << '{{% /index-list %}}'
  lines << ''
  lines.concat(render_grid_months(grouped_posts, lang: lang))
  lines
end

def generate_index(grouped_posts, lang:)
  t = L[lang]
  lines = ["#{FRONTMATTER_DELIMITER}\ntitle: #{t[:title]}\n#{FRONTMATTER_DELIMITER}\n"]
  lines << "#{t[:intro]}\n"
  lines << %({{< index-view-toggle list="#{t[:list]}" grid="#{t[:grid]}" label="#{t[:view]}" >}})
  lines << ''
  lines.concat(render_index_views(grouped_posts, lang: lang))
  lines.join("\n")
end

include_future = ARGV.include?('--future')
include_drafts = ARGV.include?('--drafts')

if include_drafts || include_future
  warn '*** --drafts/--future são só pra preview local. NÃO comite os _index.md'
  warn '*** gerados com essas flags, ou rascunhos vazam na home.'
end

{ pt: '', en: '.en' }.each do |lang, suffix|
  posts = collect_posts(lang, include_future: include_future, include_drafts: include_drafts)
  grouped = group_by_month(posts)
  index_file = "#{CONTENT_DIR}/_index#{suffix}.md"
  File.write(index_file, generate_index(grouped, lang: lang))
  puts "[#{lang}] #{index_file}: #{posts.size} posts."
end
