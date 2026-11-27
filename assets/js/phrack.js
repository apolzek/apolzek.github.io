// apolzek: busca global (overlay), "digite na home para buscar" e copiar código.
(function () {
  "use strict";

  var INDEX_URL = "/search-index.json";
  var IS_HOME = document.body.hasAttribute("data-home");

  var overlay = document.getElementById("search-overlay");
  var input = document.getElementById("search-input");
  var box = document.getElementById("search-results");
  var status = document.getElementById("search-status");
  if (!overlay || !input || !box) return;

  var KINDS = { post: "post", thought: "thought", gallery: "gallery", cheatsheet: "cheatsheet" };
  var data = null;
  var loading = false;
  var active = 0;
  var lastFocus = null;

  function normalize(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Normalizar com NFD + remover acentos mantém o mesmo comprimento para o
  // texto em português (cada letra acentuada vira letra + acento removido),
  // então os índices achados no texto normalizado servem no original.
  function highlight(text, tokens) {
    var norm = normalize(text);
    var marks = [];
    tokens.forEach(function (tok) {
      var at = norm.indexOf(tok);
      while (at !== -1) {
        marks.push([at, at + tok.length]);
        at = norm.indexOf(tok, at + tok.length);
      }
    });
    if (!marks.length || norm.length !== text.length) return escapeHtml(text);
    marks.sort(function (a, b) { return a[0] - b[0]; });
    var out = "", from = 0;
    marks.forEach(function (m) {
      if (m[0] < from) return;
      out += escapeHtml(text.slice(from, m[0])) + "<mark>" + escapeHtml(text.slice(m[0], m[1])) + "</mark>";
      from = m[1];
    });
    return out + escapeHtml(text.slice(from));
  }

  function snippet(item, tokens) {
    var at = -1;
    for (var i = 0; i < tokens.length && at === -1; i++) at = item.nc.indexOf(tokens[i]);
    var src = at === -1 ? item.s : item.c;
    if (at === -1) at = 0;
    var start = Math.max(0, at - 70);
    var text = src.slice(start, start + 200);
    return (start > 0 ? "…" : "") + highlight(text, tokens) + (start + 200 < src.length ? "…" : "");
  }

  function load() {
    if (data || loading) return;
    loading = true;
    status.textContent = "carregando índice…";
    fetch(INDEX_URL, { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        data = (json || []).map(function (it) {
          it.g = it.g || [];
          it.c = it.c || "";
          it.s = it.s || "";
          it.nt = normalize(it.t);
          it.ng = normalize(it.g.join(" "));
          it.ns = normalize(it.s);
          it.nc = normalize(it.c);
          return it;
        });
        data.sort(function (a, b) { return (a.d || "") < (b.d || "") ? 1 : -1; });
        loading = false;
        status.textContent = data.length + " itens no índice";
        run();
      })
      .catch(function () {
        loading = false;
        status.textContent = "não foi possível carregar o índice";
      });
  }

  function score(it, tokens) {
    var total = 0;
    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i], s = 0, at = it.nt.indexOf(tok);
      if (at === 0) s = 1000;
      else if (at > 0) s = 700;
      else if (it.ng.indexOf(tok) !== -1) s = 500;
      else if (it.ns.indexOf(tok) !== -1) s = 300;
      else if (it.nc.indexOf(tok) !== -1) s = 100;
      else return -1;
      total += s;
    }
    return total;
  }

  function run() {
    var raw = input.value.trim();
    var tokens = normalize(raw).split(/\s+/).filter(Boolean);
    if (!tokens.length) {
      box.innerHTML = '<div class="search-message"><span>Digite algo para ver os resultados</span></div>';
      if (data) status.textContent = data.length + " itens no índice";
      return;
    }
    if (!data) return;
    var hits = [];
    data.forEach(function (it, i) {
      var s = score(it, tokens);
      if (s >= 0) hits.push({ it: it, s: s - i * 0.001 });
    });
    hits.sort(function (a, b) { return b.s - a.s; });
    status.textContent = hits.length + (hits.length === 1 ? " resultado" : " resultados");
    if (!hits.length) {
      box.innerHTML = '<div class="search-message"><span>Nenhum resultado para "' + escapeHtml(raw) + '"</span></div>';
      return;
    }
    box.innerHTML = hits.slice(0, 30).map(function (h, i) {
      var it = h.it;
      var tags = it.g.length ? " · " + it.g.map(function (t) { return "#" + escapeHtml(t); }).join(" ") : "";
      return '<a class="search-result-item' + (i === 0 ? " is-active" : "") + '" href="' + escapeHtml(it.u) + '">' +
        '<div class="search-result-article-title">' + highlight(it.t, tokens) + "</div>" +
        '<div class="search-result-meta">' + (KINDS[it.k] ? "[" + KINDS[it.k] + "] " : "") + (it.d || "") + tags + "</div>" +
        '<div class="search-result-matching-content">' + snippet(it, tokens) + "</div></a>";
    }).join("");
    active = 0;
  }

  function setActive(i) {
    var rows = box.querySelectorAll(".search-result-item");
    if (!rows.length) return;
    active = (i + rows.length) % rows.length;
    for (var j = 0; j < rows.length; j++) rows[j].classList.toggle("is-active", j === active);
    rows[active].scrollIntoView({ block: "nearest" });
  }

  function open(seed) {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    if (typeof seed === "string") input.value = seed;
    input.focus();
    load();
    run();
  }

  function close() {
    overlay.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function isEditable(node) {
    if (!node || node === document.body) return false;
    if (node.isContentEditable) return true;
    var t = (node.tagName || "").toLowerCase();
    return t === "input" || t === "textarea" || t === "select" || t === "button";
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-search-open]")) { e.preventDefault(); open(); return; }
    if (e.target.closest("[data-search-close]") || e.target === overlay) { close(); }
  });

  input.addEventListener("input", run);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
    else if (e.key === "Enter") {
      var row = box.querySelectorAll(".search-result-item")[active];
      if (row) { e.preventDefault(); window.location.href = row.href; }
    }
  });

  document.addEventListener("keydown", function (e) {
    if (!overlay.hidden) {
      if (e.key === "Escape") close();
      return;
    }
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); open(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
    if (isEditable(e.target) || isEditable(document.activeElement)) return;
    if (document.querySelector(".lightbox:not([hidden])")) return;
    if (e.key === "/") { e.preventDefault(); open(""); return; }
    // Na home, qualquer tecla imprimível abre a busca já com a letra digitada.
    if (IS_HOME && e.key && e.key.length === 1 && e.key !== " ") { e.preventDefault(); open(e.key); }
  });

  // Botão COPIAR dos blocos de código.
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy]");
    if (!btn) return;
    var code = btn.parentNode.querySelector("pre");
    if (!code) return;
    var text = code.innerText.replace(/\n$/, "");
    var done = function () {
      btn.textContent = "COPIADO";
      btn.classList.add("is-copied");
      setTimeout(function () { btn.textContent = "COPIAR"; btn.classList.remove("is-copied"); }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, done);
    } else {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (err) {}
      document.body.removeChild(ta);
      done();
    }
  });
})();
