// BunnyFlow Whisk Early Lock v1.0
// Runs in MAIN world at document_start — same strategy as bf_early.js for Flow
// Blocks: MY LIBRARY · ULTRA · M avatar · Discord
(function () {
  'use strict';

  // ── 1. CSS ────────────────────────────────────────────────────────────────
  var CSS = [
    '.__bf_wh_corner__{',
    '  position:fixed!important;top:0!important;right:0!important;',
    '  width:440px!important;height:72px!important;',
    '  z-index:2147483647!important;background:transparent!important;',
    '  cursor:not-allowed!important;pointer-events:all!important;display:block!important;',
    '}',
    '.__bf_wh_dim__{',
    '  opacity:0.35!important;pointer-events:none!important;',
    '  cursor:not-allowed!important;filter:grayscale(0.8)!important;',
    '}',
  ].join('\n');

  function injectCSS() {
    if (document.getElementById('__bf_wh_css__')) return;
    var s = document.createElement('style');
    s.id = '__bf_wh_css__';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }
  injectCSS();
  new MutationObserver(injectCSS).observe(document.documentElement, { childList: true });

  // ── 2. FIXED CORNER BLOCK (captures clicks before React) ─────────────────
  function makeBlocker() {
    var cb = document.createElement('div');
    cb.id = '__bf_wh_corner__';
    cb.className = '__bf_wh_corner__';
    var BLK = function (e) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
      return false;
    };
    ['click', 'mousedown', 'mouseup', 'pointerdown', 'pointerup',
      'touchstart', 'touchend'].forEach(function (ev) {
      cb.addEventListener(ev, BLK, { capture: true, passive: false });
    });
    return cb;
  }

  function injectCorner() {
    if (document.getElementById('__bf_wh_corner__')) return;
    var cb = makeBlocker();
    (document.body || document.documentElement).appendChild(cb);
  }

  // ── 3. CAPTURE-PHASE GLOBAL CLICK BLOCKER ─────────────────────────────────
  // Even if corner div fails, catch clicks by checking coordinates
  var HEADER_H = 72;

  function isTopRight(e) {
    var x = e.clientX, y = e.clientY;
    if (y > HEADER_H) return false;
    if (x < (window.innerWidth - 440)) return false;
    return true;
  }

  function isLockedEl(el) {
    if (!el) return false;
    var txt = (el.textContent || '').trim();
    var lbl = (el.getAttribute('aria-label') || '').toLowerCase();
    var href = (el.getAttribute('href') || '');
    if (/my.?library/i.test(txt)) return true;
    if (/ultra/i.test(txt)) return true;
    if (/discord/i.test(href)) return true;
    if (/account|profile|user|sign.?out/i.test(lbl)) return true;
    // Single/double uppercase initial (account avatar)
    if (txt.length <= 3 && /^[A-Z]{1,3}$/.test(txt)) return true;
    return false;
  }

  function checkAndBlock(e) {
    // Block if in top-right corner zone
    if (isTopRight(e)) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    // Also block any locked element anywhere (MY LIBRARY can be elsewhere)
    var el = e.target;
    for (var i = 0; i < 6 && el; i++) {
      if (isLockedEl(el)) {
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      el = el.parentElement;
    }
  }

  ['click', 'mousedown', 'pointerdown', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, checkAndBlock, { capture: true, passive: false });
  });

  // ── 4. VISUAL DIM: scan elements + apply opacity ──────────────────────────
  var _dimmed = new WeakSet();

  function dimEl(el) {
    if (!el || _dimmed.has(el)) return;
    _dimmed.add(el);
    el.classList.add('__bf_wh_dim__');
    el.style.setProperty('opacity',        '0.35',        'important');
    el.style.setProperty('pointer-events', 'none',        'important');
    el.style.setProperty('cursor',         'not-allowed', 'important');
    el.style.setProperty('filter',         'grayscale(0.8) brightness(0.6)', 'important');
  }

  function scanDim() {
    var ww = window.innerWidth;

    document.querySelectorAll('button, a, div[role="button"], span[role="button"], [tabindex="0"]').forEach(function (el) {
      var txt = (el.textContent || '').trim();
      var lbl = (el.getAttribute('aria-label') || '').toLowerCase();
      var href = (el.getAttribute('href') || '');

      // MY LIBRARY — text match (anywhere)
      if (/my.?library/i.test(txt)) { dimEl(el); return; }
      if (/library/i.test(lbl))     { dimEl(el); return; }
      if (/discord/i.test(href))    { dimEl(el); return; }

      // Right-side elements only (rightmost 45%)
      try {
        var r = el.getBoundingClientRect();
        if (r.width < 1 || r.right < ww * 0.55) return;
        if (/ultra/i.test(txt))                               { dimEl(el); return; }
        if (txt.length <= 3 && /^[A-Z]{1,3}$/.test(txt))     { dimEl(el); return; }
        if (/account|profile|user|sign.?out/i.test(lbl))     { dimEl(el); return; }
      } catch (_) {}
    });

    // Standalone ULTRA text node → dim + parents
    document.querySelectorAll('span, div, p, button').forEach(function (el) {
      if (el.childNodes.length !== 1 || el.childNodes[0].nodeType !== 3) return;
      if (!/^ultra$/i.test((el.textContent || '').trim())) return;
      dimEl(el);
      var p = el.parentElement;
      if (p && p !== document.body) dimEl(p);
      var gp = p && p.parentElement;
      if (gp && gp !== document.body) dimEl(gp);
    });
  }

  // ── 5. BOOT ───────────────────────────────────────────────────────────────
  function boot() {
    injectCSS();
    injectCorner();
    scanDim();
  }

  if (document.body) {
    boot();
  } else {
    document.addEventListener('DOMContentLoaded', boot);
  }

  new MutationObserver(boot).observe(document.documentElement, { childList: true, subtree: true });
  setInterval(boot, 200);

})();
