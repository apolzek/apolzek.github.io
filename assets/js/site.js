/* Behaviour shared by every page: back-to-top, the quote easter egg, the copy
   button on code blocks, and the search box. These used to be four inline
   <script> blocks in default.html, which shipped the same 6KB inside every
   generated page instead of once, cached. */
/* --- backtotop --- */
addBackToTop({
    diameter: 48,
    backgroundColor: 'rgb(196, 187, 240)',
    textColor: 'black'
  })

/* --- quote --- */
document.addEventListener('dblclick', function () {
  var quote = document.getElementById('site-quote');
  if (quote) {
    quote.classList.add('visible');
    setTimeout(function () {
      quote.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  }
});

/* --- copy --- */
document.querySelectorAll('pre.highlight').forEach(function(pre) {
  var btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.textContent = 'copy';
  pre.appendChild(btn);
  btn.addEventListener('click', function() {
    var code = pre.querySelector('code');
    navigator.clipboard.writeText(code ? code.innerText : pre.innerText).then(function() {
      btn.textContent = 'copied!';
      setTimeout(function() { btn.textContent = 'copy'; }, 2000);
    });
  });
});

/* --- search --- */
(function () {
  var input = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  if (!input || !results) return;

  var REVEAL = '%revelare';
  var LIMIT = 10;
  var posts = [];

  /* Subsequence ("fuzzy") match, same spirit as the previous search lib. */
  function fuzzy(needle, haystack) {
    needle = (needle || '').toLowerCase();
    haystack = (haystack || '').toLowerCase();
    var n = 0;
    for (var i = 0; i < haystack.length && n < needle.length; i++) {
      if (haystack[i] === needle[n]) n++;
    }
    return n === needle.length;
  }

  function isSecret(p) {
    return p.secret === true || p.secret === 'true';
  }

  /* Secret + password: locked, never revealed by %revelare — only by its own %<password>. */
  function isLocked(p) {
    return isSecret(p) && p.password != null && p.password !== '';
  }

  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  /* Format "2026-06-08 00:00:00 +0000" -> "Jun 08, 2026", matching the post list. */
  function fmtDate(s) {
    var p = (s || '').slice(0, 10).split('-');
    if (p.length < 3) return '';
    return MONTHS[parseInt(p[1], 10) - 1] + ' ' + p[2] + ', ' + p[0];
  }

  function render(list) {
    if (!list.length) {
      results.innerHTML = 'Not found / Não encontrado..';
      return;
    }
    results.innerHTML = list.map(function (p) {
      return '<li><a href="' + p.url + '">' + p.title + '</a>' +
             '<time datetime="' + p.date + '">' + fmtDate(p.date) + '</time></li>';
    }).join('');
  }

  var loaded = false;

  fetch('/search.json', { cache: 'no-store' })
    .then(function (r) { return r.json(); })
    .then(function (data) { posts = data; loaded = true; runSearch(); });

  var blog = document.getElementById('Blog');

  /* Hide the default post listing while a search is active. */
  function setBlogHidden(hidden) {
    if (blog) blog.style.display = hidden ? 'none' : '';
  }

  function runSearch() {
    var q = input.value.trim();
    if (!q) { results.innerHTML = ''; setBlogHidden(false); return; }

    setBlogHidden(true);

    /* Posts not loaded yet: re-run once the fetch resolves. */
    if (!loaded) { results.innerHTML = ''; return; }

    var lowered = q.toLowerCase();

    /* Secret reveal mode: list secret posts that are NOT password-locked. */
    if (lowered === REVEAL) {
      render(posts.filter(function (p) { return isSecret(p) && !isLocked(p); }));
      return;
    }

    /* Password mode: "%<password>" reveals only the post with that exact password. */
    if (lowered.charAt(0) === '%') {
      render(posts.filter(function (p) {
        return isLocked(p) && ('%' + String(p.password).toLowerCase()) === lowered;
      }));
      return;
    }

    /* Normal search never surfaces secret posts. */
    var matches = posts.filter(function (p) {
      return !isSecret(p) && (fuzzy(q, p.title) || fuzzy(q, p.tags));
    }).slice(0, LIMIT);
    render(matches);
  }

  input.addEventListener('input', runSearch);
})();
