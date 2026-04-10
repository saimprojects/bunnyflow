// BunnyFlow Whisk Lock v1.0 — MAIN world, document_start
// Locks: MY LIBRARY · ULTRA · M avatar · Discord
// Shows toast: "Session settings are locked on managed accounts"
(function () {
  'use strict';

  // ── CSS ───────────────────────────────────────────────────────────────────
  var CSS = [
    '.__bf_wh_dim__{opacity:0.35!important;pointer-events:none!important;',
    '  cursor:not-allowed!important;filter:grayscale(0.8) brightness(0.55)!important;}',
    '.__bf_wh_toast__{',
    '  position:fixed!important;bottom:24px!important;left:50%!important;',
    '  transform:translateX(-50%)!important;',
    '  background:#1a1a1a!important;color:#fff!important;',
    '  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;',
    '  font-size:13px!important;font-weight:500!important;',
    '  padding:10px 18px!important;border-radius:8px!important;',
    '  display:flex!important;align-items:center!important;gap:8px!important;',
    '  z-index:2147483647!important;pointer-events:none!important;',
    '  box-shadow:0 4px 20px rgba(0,0,0,0.5)!important;',
    '  white-space:nowrap!important;',
    '}',
    '.__bf_wh_dot__{width:8px!important;height:8px!important;border-radius:50%!important;',
    '  background:#f59e0b!important;flex-shrink:0!important;}',
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

  // ── TOAST ─────────────────────────────────────────────────────────────────
  var _toastTimer = null;
  function showToast() {
    var existing = document.getElementById('__bf_wh_toast__');
    if (existing) existing.remove();
    if (_toastTimer) clearTimeout(_toastTimer);

    var t = document.createElement('div');
    t.id = '__bf_wh_toast__';
    t.className = '__bf_wh_toast__';
    var dot = document.createElement('span');
    dot.className = '__bf_wh_dot__';
    var msg = document.createTextNode('Session settings are locked on managed accounts');
    t.appendChild(dot);
    t.appendChild(msg);
    (document.body || document.documentElement).appendChild(t);

    _toastTimer = setTimeout(function () {
      var el = document.getElementById('__bf_wh_toast__');
      if (el) el.remove();
    }, 3500);
  }

  // ── LOCKED ELEMENT DETECTION ──────────────────────────────────────────────
  var HEADER_H  = 80;   // top 80px is the header zone
  var RIGHT_PX  = 480;  // rightmost 480px covers MY LIBRARY through M

  function isInTopRight(e) {
    return (e.clientY <= HEADER_H) && (e.clientX >= window.innerWidth - RIGHT_PX);
  }

  function isLockedByText(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    var txt = (el.textContent || '').trim();
    var lbl = (el.getAttribute && el.getAttribute('aria-label') || '').toLowerCase();
    var href = (el.getAttribute && el.getAttribute('href') || '');
    if (/my.?library/i.test(txt))                                 return true;
    if (/library/i.test(lbl))                                     return true;
    if (/ultra/i.test(txt) && txt.length < 20)                    return true;
    if (/discord/i.test(href))                                     return true;
    if (/account|profile|user|sign.?out/i.test(lbl))              return true;
    if (txt.length <= 3 && /^[A-Z]{1,3}$/.test(txt))              return true;
    return false;
  }

  function isLockedClick(e) {
    // Zone-based check (covers entire right header area)
    if (isInTopRight(e)) return true;
    // Text-based walk up the DOM tree
    var el = e.target;
    for (var i = 0; i < 7 && el; i++) {
      if (isLockedByText(el)) return true;
      el = el.parentElement;
    }
    return false;
  }

  // ── CAPTURE CLICK INTERCEPT ───────────────────────────────────────────────
  var BLK = function (e) {
    if (!isLockedClick(e)) return;
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
    showToast();
    return false;
  };

  ['click', 'mousedown', 'pointerdown', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, BLK, { capture: true, passive: false });
  });

  // ── VISUAL DIM ────────────────────────────────────────────────────────────
  var _dimmed = new WeakSet();

  function dimEl(el) {
    if (!el || _dimmed.has(el)) return;
    _dimmed.add(el);
    el.classList.add('__bf_wh_dim__');
    el.style.setProperty('opacity',        '0.35',        'important');
    el.style.setProperty('pointer-events', 'none',        'important');
    el.style.setProperty('cursor',         'not-allowed', 'important');
    el.style.setProperty('filter',         'grayscale(0.8) brightness(0.55)', 'important');
  }

  function scanDim() {
    var ww = window.innerWidth;

    document.querySelectorAll('button, a, div[role="button"], span[role="button"], [tabindex="0"]').forEach(function (el) {
      var txt = (el.textContent || '').trim();
      var lbl = (el.getAttribute('aria-label') || '').toLowerCase();
      var href = (el.getAttribute('href') || '');

      if (/my.?library/i.test(txt))  { dimEl(el); return; }
      if (/library/i.test(lbl))       { dimEl(el); return; }
      if (/discord/i.test(href))      { dimEl(el); return; }

      try {
        var r = el.getBoundingClientRect();
        if (r.width < 1 || r.right < ww * 0.55) return;
        if (/ultra/i.test(txt) && txt.length < 20)         { dimEl(el); return; }
        if (txt.length <= 3 && /^[A-Z]{1,3}$/.test(txt))  { dimEl(el); return; }
        if (/account|profile|user|sign.?out/i.test(lbl))  { dimEl(el); return; }
      } catch (_) {}
    });

    // ULTRA standalone node → dim + ancestors
    document.querySelectorAll('span, div, p, button').forEach(function (el) {
      if (el.childNodes.length !== 1 || el.childNodes[0].nodeType !== 3) return;
      if (!/^ultra$/i.test((el.textContent || '').trim())) return;
      dimEl(el);
      var p = el.parentElement;
      if (p && p !== document.body) { dimEl(p); }
      var gp = p && p.parentElement;
      if (gp && gp !== document.body) { dimEl(gp); }
    });
  }

  // ── BOOT ──────────────────────────────────────────────────────────────────
  function boot() {
    injectCSS();
    scanDim();
  }

  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot);

  new MutationObserver(boot).observe(document.documentElement, { childList: true, subtree: true });
  setInterval(boot, 250);

})();
