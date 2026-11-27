// Temas: o visual Phrack é o padrão; os outros são os 28 temas do Omarchy,
// os mesmos da UI da omatelemetry-platform (data/omarchy_themes.json, copiado
// de apps/portal/src/lib/omarchy-themes.js). A matemática de cor é a mesma de
// apps/portal/src/lib/themes.js; aqui cada paleta vira as variáveis --color-*
// do phrack.css. Escolha por [ Tema ], tecla t (shift+t volta) ou ?theme=id.
// O padrão é o retro-82; o visual Phrack original continua na lista.
(function () {
  "use strict";

  var THEMES = window.OMARCHY_THEMES || [];
  var DEFAULT = "retro-82";
  var PHRACK_ID = "phrack";
  var STORAGE_KEY = "apolzek-theme";
  var VARS_KEY = "apolzek-theme-vars";
  var PHRACK = {
    id: PHRACK_ID, name: "Phrack", mode: "dark",
    colors: { background: "#000000", foreground: "#ffffff", red: "#ff5555", green: "#55ff55", blue: "#0000aa", cyan: "#00aaaa", accent: "#55ffff" }
  };
  var ALL = [PHRACK].concat(THEMES);
  var byId = {};
  ALL.forEach(function (t) { byId[t.id] = t; });

  // ---------------------------------------------------------- color math
  function parseHex(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
    if (!m) return null;
    var n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function toHex(rgb) {
    return "#" + rgb.map(function (v) {
      return Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0");
    }).join("");
  }
  function mix(a, b, t) {
    var x = parseHex(a), y = parseHex(b);
    if (!x || !y) return a;
    return toHex(x.map(function (v, i) { return v + (y[i] - v) * t; }));
  }
  function alpha(hex, a) {
    var c = parseHex(hex);
    return c ? "rgba(" + c[0] + ", " + c[1] + ", " + c[2] + ", " + a + ")" : hex;
  }
  function luminance(hex) {
    var c = parseHex(hex);
    if (!c) return 0;
    var l = c.map(function (v) {
      var s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
  }
  function contrast(a, b) {
    var x = luminance(a), y = luminance(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }
  function hsl(hex) {
    var c = parseHex(hex);
    if (!c) return [0, 0, 0];
    var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    var d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min), h;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
    return [h, s, l];
  }
  function inHue(h, band) { return band[0] <= band[1] ? h >= band[0] && h <= band[1] : h >= band[0] || h <= band[1]; }
  function distance(a, b) {
    var x = parseHex(a), y = parseHex(b);
    if (!x || !y) return Infinity;
    return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
  }
  function pickSignal(candidates, band, fallback, avoid) {
    avoid = avoid || [];
    for (var i = 0; i < candidates.length; i++) {
      var c = candidates[i];
      if (!parseHex(c)) continue;
      if (avoid.some(function (a) { return distance(a, c) < 60; })) continue;
      var x = hsl(c);
      if (inHue(x[0], band) && x[1] >= 0.35 && x[2] >= 0.25 && x[2] <= 0.85) return c;
    }
    return fallback;
  }
  function ensureContrast(fg, bg, min, toward) {
    var c = fg;
    for (var i = 1; i <= 10 && contrast(c, bg) < min; i++) c = mix(fg, toward, i / 10);
    return c;
  }
  function inkOn(bg) { return contrast(bg, "#0c0e10") >= contrast(bg, "#ffffff") ? "#0c0e10" : "#ffffff"; }

  // Mesmos tokens do omarchy.org que a plataforma usa.
  function siteTokens(theme) {
    var c = theme.colors, dark = theme.mode !== "light", bg = c.background;
    var lift = dark ? "#ffffff" : "#000000";
    var d = {
      "bg-deep": c.dark_background || mix(bg, dark ? "#000000" : "#ffffff", 0.25),
      bg: bg,
      surface: mix(bg, c.lighter_background || mix(bg, lift, 0.08), 0.5),
      "surface-2": c.lighter_background || mix(bg, lift, 0.08),
      "border-strong": c.muted || mix(bg, lift, 0.3),
      text: c.bright_foreground || c.foreground,
      "text-muted": c.dark_foreground || mix(c.foreground, bg, 0.35),
      brand: c.accent
    };
    var s = theme.site || {};
    for (var k in s) d[k] = s[k];
    return d;
  }

  // ------------------------------------------- paleta -> variáveis do site
  function themeVars(theme) {
    var c = theme.colors, t = siteTokens(theme);
    var dark = theme.mode !== "light", lift = dark ? "#ffffff" : "#000000";
    var bg = t["bg-deep"], fg = t.text;

    var current = ensureContrast(pickSignal([c.bright_yellow, c.yellow, c.orange], [25, 70], "#e5a50a", [fg]), bg, 4.5, lift);
    var cyan = pickSignal([c.bright_cyan, c.cyan, c.bright_blue, c.blue], [160, 250], t.brand);
    var blue = pickSignal([c.blue, c.bright_blue, c.cyan], [180, 265], "#4c8dff");

    var panel = t["surface-2"];
    var bar = pickSignal([c.cyan, c.bright_cyan, c.blue], [160, 230], t.brand);
    var bar2 = mix(fg, bg, 0.3);
    var toc = mix(bg, blue, dark ? 0.45 : 0.3);
    var tocAlt = mix(bg, blue, dark ? 0.3 : 0.18);
    var tocFg = contrast(fg, toc) >= 4.5 && contrast(fg, tocAlt) >= 4.5 ? fg : inkOn(toc);
    var tocHoverFg = ensureContrast(cyan, bg, 4.5, lift);

    var paper = t.surface, ink = t.text;
    var err = pickSignal([c.red, c.bright_red], [335, 22], "#e5484d", [fg]);
    var ok = pickSignal([c.green, c.bright_green], [75, 170], "#2fb67c", [fg, err]);
    var warn = pickSignal([c.yellow, c.bright_yellow, c.orange], [25, 62], "#e5a50a", [fg, err]);
    var magenta = pickSignal([c.magenta, c.bright_magenta], [260, 334], "#a371f7", [fg]);
    var mark = pickSignal([c.bright_yellow, c.yellow], [35, 70], "#e5c07b");

    // Seleção de texto: um tom frio (o "selection" do próprio tema), nunca
    // amarelo, que é a cor da busca (mark) e do item atual. Precisa se
    // destacar do fundo e manter o texto legível (4.5:1) por cima.
    function selection(base, text) {
      var sel = c.selection || (theme.site || {}).selection;
      var h = sel ? hsl(sel) : null;
      if (!sel || contrast(sel, base) < 1.6 || (h && h[1] > 0.3 && inHue(h[0], [35, 75]))) {
        // sem uma seleção própria que se destaque: mistura o azul do tema
        // no fundo até a diferença ficar visível (1.6:1)
        for (var i = dark ? 4 : 3; i <= 8; i++) {
          sel = mix(base, blue, i / 10);
          if (contrast(sel, base) >= 1.6) break;
        }
      }
      return [sel, contrast(text, sel) >= 4.5 ? text : inkOn(sel)];
    }
    var pageSel = selection(bg, fg);
    var paperSel = selection(paper, ink);
    var menuCurrent = ensureContrast(current, tocAlt, 4.5, lift);

    var logo = [c.bright_cyan, c.bright_cyan, c.cyan, c.bright_blue, c.bright_blue, c.blue].map(function (x) {
      return ensureContrast(x || cyan, bg, 2.5, lift);
    });

    var vars = {
      "--color-bg": bg,
      "--color-fg": fg,
      "--color-rule": t["border-strong"],
      "--color-rule-hard": dark ? mix(bg, "#000000", 0.5) : mix(t["border-strong"], "#000000", 0.3),
      "--color-link": fg,
      "--color-link-current": current,
      "--color-focus": current,
      "--color-panel-bg": panel,
      "--color-details-fg": ensureContrast(cyan, panel, 4.5, lift),
      "--color-details-muted-fg": ensureContrast(t["text-muted"], panel, 3, lift),
      "--color-bar-bg": bar,
      "--color-bar-fg": inkOn(bar),
      "--color-bar-alt-bg": bar2,
      "--color-bar-alt-fg": inkOn(bar2),
      "--color-toc-bg": toc,
      "--color-toc-bg-alt": tocAlt,
      "--color-toc-fg": tocFg,
      "--color-toc-hover-bg": bg,
      "--color-toc-hover-fg": tocHoverFg,
      "--color-toc-head-bg": bar2,
      "--color-toc-head-fg": inkOn(bar2),
      "--color-article-bg": paper,
      "--color-article-fg": ink,
      "--color-article-rule": t["border-strong"],
      "--color-paper-2": mix(paper, ink, 0.06),
      "--color-paper-head": bar2,
      "--color-paper-rule": mix(paper, ink, 0.3),
      "--color-ink-muted": ensureContrast(t["text-muted"], paper, 4.5, lift),
      "--color-ink-accent": ensureContrast(blue, paper, 4.5, lift),
      "--color-quote-fg": ensureContrast(t["text-muted"], paper, 4.5, lift),
      "--color-quote-rule": mix(paper, ink, 0.18),
      "--color-input-bg": t.bg,
      "--color-input-fg": fg,
      "--color-overlay-bg": alpha(bg, 0.55),
      "--color-search-bg": tocAlt,
      "--color-search-fg": tocFg,
      "--color-search-rule": toc,
      "--color-search-meta-fg": mix(tocFg, tocAlt, 0.3),
      "--color-mark-bg": mark,
      "--color-mark-fg": inkOn(mark),
      "--color-info": cyan,
      "--color-ok": ok,
      "--color-important": magenta,
      "--color-warn": warn,
      "--color-err": err,
      "--color-err-ink": ensureContrast(err, paper, 4.5, lift),
      "--color-signal-ink": inkOn(ok),
      "--color-select-bg": pageSel[0],
      "--color-select-fg": pageSel[1],
      "--color-article-select-bg": paperSel[0],
      "--color-article-select-fg": paperSel[1],
      "--color-menu-current": menuCurrent,
      "--color-focus-article": ensureContrast(blue, paper, 3, lift)
    };
    logo.forEach(function (x, i) { vars["--logo-" + (i + 1)] = x; });
    return vars;
  }

  // ------------------------------------------------------------- aplicar
  var root = document.documentElement;
  var applied = [];
  var current = DEFAULT;

  function setMeta(color) {
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", color);
  }

  function apply(id, persist) {
    var theme = byId[id] || byId[DEFAULT] || PHRACK;
    applied.forEach(function (k) { root.style.removeProperty(k); });
    applied = [];
    var saved = null;
    if (theme.id === PHRACK_ID) {
      delete root.dataset.code;
      root.style.colorScheme = "dark";
      setMeta("#000000");
    } else {
      var vars = themeVars(theme);
      for (var k in vars) { root.style.setProperty(k, vars[k]); applied.push(k); }
      var code = theme.mode === "light" ? "light" : "dark";
      root.dataset.code = code;
      root.style.colorScheme = code;
      setMeta(vars["--color-bg"]);
      saved = { code: code, vars: vars };
    }
    root.dataset.theme = theme.id;
    current = theme.id;
    if (persist !== false) {
      try {
        localStorage.setItem(STORAGE_KEY, theme.id);
        if (saved) localStorage.setItem(VARS_KEY, JSON.stringify(saved));
        else localStorage.removeItem(VARS_KEY);
      } catch (e) { /* sem storage: o tema vale só para esta página */ }
    }
    document.querySelectorAll("[data-theme-name]").forEach(function (el) { el.textContent = theme.id; });
    renderList();
    return theme;
  }

  // O script inline do <head> já pintou as variáveis salvas; aqui só
  // registramos quais são para poder limpá-las ao trocar de tema.
  function init() {
    var fromUrl = new URLSearchParams(location.search).get("theme");
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    var id = byId[fromUrl] ? fromUrl : (byId[saved] ? saved : DEFAULT);
    for (var i = 0; i < root.style.length; i++) {
      var k = root.style[i];
      if (k.indexOf("--") === 0) applied.push(k);
    }
    apply(id);
  }

  // ------------------------------------------------------- menu de temas
  // Este script roda no <head> (para pintar o tema antes do primeiro frame);
  // os elementos do menu só existem depois que o <body> carrega.
  var overlay = null, list = null, toast = null;
  var toastTimer = null;

  function swatches(t) {
    var c = t.colors;
    return [c.background, c.accent, c.red, c.green, c.blue].map(function (x) {
      return '<i style="background:' + (x || "transparent") + '"></i>';
    }).join("");
  }

  function renderList() {
    if (!list) return;
    list.innerHTML = ALL.map(function (t) {
      var on = t.id === current;
      return '<button type="button" role="menuitemradio" aria-checked="' + on + '" class="theme-item' + (on ? " is-current" : "") + '" data-theme-id="' + t.id + '">' +
        '<span class="swatches" aria-hidden="true">' + swatches(t) + "</span>" +
        '<span class="theme-item__name">' + (on ? "&gt; " : "") + t.name + "</span>" +
        '<span class="theme-item__mode">' + (t.id === DEFAULT ? "padrão" : t.id === PHRACK_ID ? "original" : t.mode) + "</span></button>";
    }).join("");
  }

  function openMenu() {
    if (!overlay) return;
    overlay.hidden = false;
    var cur = list.querySelector(".is-current");
    (cur || list.querySelector("button")).focus();
    if (cur) cur.scrollIntoView({ block: "nearest" });
  }
  function closeMenu() { if (overlay) overlay.hidden = true; }

  function showToast(theme) {
    if (!toast) return;
    toast.textContent = ".:: tema: " + theme.name + " (" + (ALL.indexOf(theme) + 1) + "/" + ALL.length + ") ::.";
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 1600);
  }

  function step(dir) {
    var i = ALL.findIndex(function (t) { return t.id === current; });
    var n = ALL.length;
    showToast(apply(ALL[(i + dir + n) % n].id));
  }

  function typing(node) {
    if (!node) return false;
    var tag = (node.tagName || "").toLowerCase();
    return node.isContentEditable || tag === "input" || tag === "textarea" || tag === "select";
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-theme-open]")) { e.preventDefault(); openMenu(); return; }
    var item = e.target.closest("[data-theme-id]");
    if (item) { apply(item.getAttribute("data-theme-id")); return; }
    if (e.target.closest("[data-theme-close]") || e.target === overlay) closeMenu();
  });

  // Captura: roda antes do atalho "digite na home para buscar" do phrack.js.
  document.addEventListener("keydown", function (e) {
    if (overlay && !overlay.hidden) {
      if (e.key === "Escape") { e.preventDefault(); closeMenu(); return; }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        var items = Array.prototype.slice.call(list.querySelectorAll("button"));
        var i = items.indexOf(document.activeElement);
        var next = items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length];
        next.focus();
        apply(next.getAttribute("data-theme-id"));
      }
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey || e.isComposing || typing(document.activeElement)) return;
    var search = document.getElementById("search-overlay");
    if (search && !search.hidden) return;
    if (document.querySelector(".lightbox:not([hidden])")) return;
    if (e.key === "t" || e.key === "T") {
      e.preventDefault();
      e.stopImmediatePropagation();
      step(e.shiftKey ? -1 : 1);
    }
  }, true);

  init();
  document.addEventListener("DOMContentLoaded", function () {
    overlay = document.getElementById("theme-overlay");
    list = document.getElementById("theme-list");
    toast = document.getElementById("theme-toast");
    apply(current, false);
  });
})();
