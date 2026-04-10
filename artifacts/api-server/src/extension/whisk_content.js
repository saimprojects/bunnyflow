// BunnyFlow Whisk Bridge v1.5 — bulletproof header lock
// Targets: MY LIBRARY · Discord · ULTRA · M avatar
(function () {
  'use strict';

  // ── 1. CSS ────────────────────────────────────────────────────────────────
  var CSS = `
    .__bf_corner_block__ {
      position: fixed !important;
      top: 0 !important;
      right: 0 !important;
      width: 420px !important;
      height: 72px !important;
      z-index: 2147483647 !important;
      background: transparent !important;
      cursor: not-allowed !important;
      pointer-events: all !important;
      display: block !important;
    }
    .__bf_block__ {
      position: fixed !important;
      z-index: 2147483646 !important;
      background: transparent !important;
      cursor: not-allowed !important;
      pointer-events: all !important;
      display: block !important;
    }
    a[href*="discord"] {
      pointer-events: none !important;
      opacity: 0.35 !important;
    }
  `;

  function injectCSS() {
    var existing = document.getElementById('__bf_whisk_style__');
    if (existing) return;
    var s = document.createElement('style');
    s.id = '__bf_whisk_style__';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }
  injectCSS();

  // ── 2. FIXED CORNER BLOCKER ───────────────────────────────────────────────
  // Width 420px covers: MY LIBRARY + Discord + ? + ULTRA + M (based on screenshot)
  function injectCornerBlock() {
    if (document.getElementById('__bf_whisk_corner__')) return;
    var cb = document.createElement('div');
    cb.id = '__bf_whisk_corner__';
    cb.className = '__bf_corner_block__';
    var blk = function(e) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
      return false;
    };
    cb.addEventListener('click',      blk, true);
    cb.addEventListener('mousedown',  blk, true);
    cb.addEventListener('mouseup',    blk, true);
    cb.addEventListener('pointerdown',blk, true);
    cb.addEventListener('pointerup',  blk, true);
    cb.addEventListener('touchstart', blk, { capture: true, passive: false });
    // Attach to BODY (not documentElement) so it sits in normal fixed stacking
    (document.body || document.documentElement).appendChild(cb);
  }

  // ── 3. ELEMENT-LEVEL DIM + LOCK ──────────────────────────────────────────
  var _locked = new WeakSet();
  var _overlays = new Map();

  function _placeOverlay(el) {
    if (_overlays.has(el)) return;
    var ov = document.createElement('div');
    ov.className = '__bf_block__';
    var blk = function(e) { e.stopImmediatePropagation(); e.preventDefault(); };
    ov.addEventListener('click',       blk, true);
    ov.addEventListener('pointerdown', blk, true);
    ov.addEventListener('mousedown',   blk, true);
    (document.body || document.documentElement).appendChild(ov);
    _overlays.set(el, ov);
    _syncOverlay(el, ov);
  }

  function _syncOverlay(el, ov) {
    try {
      var r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) { ov.style.display = 'none'; return; }
      ov.style.display = 'block';
      ov.style.left   = r.left + 'px';
      ov.style.top    = r.top  + 'px';
      ov.style.width  = r.width + 'px';
      ov.style.height = r.height + 'px';
    } catch(_) {}
  }

  function _syncAll() {
    _overlays.forEach(_syncOverlay);
  }

  function dimEl(el) {
    if (!el || _locked.has(el)) return;
    _locked.add(el);
    el.style.setProperty('pointer-events', 'none',        'important');
    el.style.setProperty('opacity',        '0.35',        'important');
    el.style.setProperty('cursor',         'not-allowed', 'important');
    el.style.setProperty('filter',         'grayscale(0.8) brightness(0.6)', 'important');
    var blk = function(e) { e.stopImmediatePropagation(); e.preventDefault(); };
    el.addEventListener('click',       blk, true);
    el.addEventListener('pointerdown', blk, true);
    _placeOverlay(el);
  }

  function scanAndLock() {
    var ww = window.innerWidth;
    var threshold = ww * 0.55; // lock anything in right 45% of screen

    // All interactive elements
    var all = Array.from(document.querySelectorAll(
      'button, a, div[role="button"], span[role="button"], [tabindex="0"]'
    ));

    all.forEach(function(el) {
      var txt = (el.textContent || '').trim();
      var lbl = (el.getAttribute('aria-label') || '').toLowerCase();
      var href = (el.getAttribute('href') || '');

      // MY LIBRARY — text match
      if (/my.?library/i.test(txt) || /library/i.test(lbl)) {
        dimEl(el);
        return;
      }

      // Discord link
      if (/discord/i.test(href) || /discord/i.test(lbl)) {
        dimEl(el);
        return;
      }

      // Right-side elements only
      try {
        var r = el.getBoundingClientRect();
        if (r.width < 1 || r.right < threshold) return;

        // ULTRA badge (text)
        if (/ultra/i.test(txt)) { dimEl(el); return; }

        // Account initial: 1-3 uppercase letters (M, MB, etc)
        if (txt.length <= 3 && /^[A-Z]{1,3}$/.test(txt)) { dimEl(el); return; }

        // aria-label matches
        if (/account|profile|user|sign.?out|sign.?in/i.test(lbl)) { dimEl(el); return; }
      } catch(_) {}
    });

    // Also look for ULTRA as standalone text node (could be a span inside button)
    document.querySelectorAll('span, div, p').forEach(function(el) {
      if (el.childNodes.length !== 1 || el.childNodes[0].nodeType !== 3) return;
      var own = (el.textContent || '').trim();
      if (!/^ultra$/i.test(own)) return;
      dimEl(el);
      var p = el.parentElement;
      if (p && p !== document.body) { dimEl(p); }
      var gp = p && p.parentElement;
      if (gp && gp !== document.body) { dimEl(gp); }
      var next = el.nextElementSibling;
      if (next) dimEl(next);
    });

    _syncAll();
  }

  // ── 4. BOOT ───────────────────────────────────────────────────────────────
  function boot() {
    injectCSS();
    injectCornerBlock();
    scanAndLock();
  }

  // Run immediately
  if (document.body) {
    boot();
  } else {
    document.addEventListener('DOMContentLoaded', boot);
  }

  // Keep running to catch dynamic content
  new MutationObserver(function() {
    injectCSS();
    injectCornerBlock();
    scanAndLock();
  }).observe(document.documentElement, { childList: true, subtree: true });

  setInterval(boot, 200);

  window.addEventListener('scroll', _syncAll, { passive: true, capture: true });
  window.addEventListener('resize', function() { _syncAll(); injectCornerBlock(); });

  /* ── Session injection ── */
  var RELOAD_FLAG = '__bf_whisk_reloaded__';
  var RELOAD_TTL  = 15000;

  function injectWhiskSession() {
    var lastReload = Number(localStorage.getItem(RELOAD_FLAG) || 0);
    if (Date.now() - lastReload < RELOAD_TTL) return;

    chrome.storage.local.get(null, function(stored) {
      var authData = stored['__flow_auth__'] || stored['bf_auth'] || null;
      var apiBase  = stored['bf_api_base']   || stored['apiBase'] || 'https://flowbybunny.replit.app';
      if (!authData) return;

      var plan = (authData.plan || 'free').toLowerCase();
      if (plan === 'free') return;

      var token = authData.token || authData.sessionToken || '';
      if (token && token.indexOf(':') !== -1) { token = token.split(':').slice(1).join(':'); }
      if (!token || token.length < 10) return;

      fetch(apiBase + '/api/user/whisk-cookies', {
        headers: { 'Authorization': 'Bearer ' + token }
      }).then(function(resp) {
        if (!resp.ok) return null;
        return resp.json();
      }).then(function(data) {
        if (!data || !data.ok || !data.encryptedCookies) return;
        chrome.runtime.sendMessage({
          type: 'INJECT_WHISK_SESSION',
          encryptedCookies: data.encryptedCookies,
          userId: data.user && data.user.id,
        }, function(response) {
          if (chrome.runtime.lastError) return;
          if (response && response.ok && response.count > 0) {
            try { localStorage.setItem(RELOAD_FLAG, String(Date.now())); } catch(e) {}
            window.location.reload();
          }
        });
      }).catch(function() {});
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWhiskSession);
  } else {
    injectWhiskSession();
  }
})();
