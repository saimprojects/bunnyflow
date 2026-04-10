(function(){
  'use strict';

  // ── 1. CSS ────────────────────────────────────────────────────────────────
  const CSS = `
    [data-bf-hide]{display:none!important;visibility:hidden!important;}
    [data-bf-ban] {display:none!important;}
    [data-bf-locked]{opacity:0.35!important;}
    [data-bf-unlocked]{opacity:1!important;pointer-events:auto!important;cursor:pointer!important;}
    .bf-ov{position:absolute!important;inset:0!important;z-index:2147483647!important;cursor:not-allowed!important;background:transparent!important;}
    .bf-lk{position:absolute!important;right:8px!important;top:50%!important;transform:translateY(-50%)!important;font-size:11px!important;z-index:2147483647!important;pointer-events:none!important;}
  `;
  function inject(){
    if(document.getElementById('__bf__')) return;
    const s=document.createElement('style');
    s.id='__bf__';s.textContent=CSS;
    (document.head||document.documentElement).appendChild(s);
  }
  inject();
  new MutationObserver(inject).observe(document.documentElement,{childList:true});

  // ── 2. CLICK INTERCEPT — block clicks on locked model OPTIONS only ──────────
  // Strategy: use capture-phase document click listener instead of blocking
  // addEventListener registration (which would also block the dropdown toggle button).
  //
  // Locked model OPTIONS are inside a dropdown list and have role=option/menuitem/listitem.
  // The dropdown TOGGLE button (showing current model name) must NOT be blocked so we
  // can programmatically open the dropdown.
  const _LP_RE   = /lower.{0,5}priority/i;
  const _LITE_RE = /veo.{0,20}lite/i;
  const _FREE_RE = /nano.{0,5}banana|pro.{0,5}imagen/i;
  const _LOCK_RE = /\bveo\b.{0,40}(quality|fast)\b/i;
  const _OPT_SEL = '[role="option"],[role="menuitem"],[role="listitem"],li';

  // Block clicks/pointerdown on locked model options in the dropdown list
  var _blockEvents = ['click', 'mousedown', 'pointerdown', 'touchstart'];
  _blockEvents.forEach(function(evName) {
    document.addEventListener(evName, function(e) {
      try {
        // Find the nearest option ancestor
        var el = e.target;
        var optEl = null;
        for (var i = 0; i < 5 && el; i++) {
          if (el.matches && el.matches(_OPT_SEL)) { optEl = el; break; }
          el = el.parentElement;
        }
        if (!optEl) return;
        var txt = (optEl.textContent || '').trim();
        if (txt.length < 3 || txt.length > 150) return;
        var isLP   = _LP_RE.test(txt);
        var isLite = _LITE_RE.test(txt);
        var isFree = _FREE_RE.test(txt);
        // Block only locked (non-LP, non-Lite, non-FREE) model options
        if (!isLP && !isLite && !isFree && _LOCK_RE.test(txt)) {
          e.stopPropagation();
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      } catch(_) {}
    }, true /* capture phase */);
  });

  // ── 2b. BLOCK SEND BUTTON when non-LP model is active ────────────────────
  // ── SELF-CONTAINED SEND BUTTON LOCK ─────────────────────────────────────────
  // bf_early.js runs in MAIN world. This block independently:
  //  1. Reads the current model text directly from the DOM
  //  2. Finds the send button by position heuristics
  //  3. Applies red colour + cursor:not-allowed inline (every 300ms)
  //  4. Blocks all click + Enter events when non-LP model is active
  // No dependency on bunny_extra.js or data-bf-model-locked attribute.

  var _bfSendBtn  = null;  // cached send button reference
  var _bfLocked   = false; // current lock state

  // Detect whether the active video model is non-LP (returns true = should lock)
  // IMPORTANT: must skip dropdown list items — only read the combobox/selector element
  function _shouldLockSend() {
    try {
      var btns = document.querySelectorAll('[role="combobox"],button,[role="button"]');
      for (var i = 0; i < btns.length; i++) {
        var el = btns[i];
        var txt = (el.textContent || '').trim();
        if (txt.length < 3 || txt.length > 120) continue;
        if (!/veo|lower.{0,5}priority/i.test(txt)) continue;
        var r = el.getBoundingClientRect();
        if (r.width < 10) continue;
        // CRITICAL: skip elements that are inside a dropdown list (open state)
        var elRole = (el.getAttribute('role') || '').toLowerCase();
        if (elRole === 'option' || elRole === 'menuitem' || elRole === 'listitem') continue;
        if (el.closest('[role="listbox"],[role="menu"],[role="list"],[role="option"],[role="menuitem"]')) continue;
        // Found the model selector combobox — is the selected model NOT allowed?
        return !/lower.{0,5}priority/i.test(txt) && !/veo.{0,20}lite/i.test(txt);
      }
    } catch(_) {}
    return false; // no model visible → image tab likely → allow
  }

  // Visually unlock Veo Lite in the dropdown (content.js locks it, we override)
  function _unlockVeoLiteVisual() {
    try {
      var opts = document.querySelectorAll('[role="option"],[role="menuitem"],[role="listitem"],li');
      for (var i = 0; i < opts.length; i++) {
        var el = opts[i];
        if (!_LITE_RE.test(el.textContent || '')) continue;
        el.removeAttribute('data-bf-locked');
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('pointer-events', 'auto', 'important');
        el.style.setProperty('cursor', 'pointer', 'important');
        el.style.setProperty('filter', 'none', 'important');
        // Hide lock overlay/icon children
        el.querySelectorAll('.bf-lk,.bf-ov').forEach(function(c) {
          c.style.setProperty('display', 'none', 'important');
        });
      }
    } catch(_) {}
  }
  setInterval(_unlockVeoLiteVisual, 150);

  // Find the send button: most bottom-right SVG button in lower screen area
  function _findBfSendBtn() {
    try {
      var best = null, bestScore = -1;
      var wh = window.innerHeight, ww = window.innerWidth;
      var all = document.querySelectorAll('button,[role="button"]');
      for (var i = 0; i < all.length; i++) {
        var b = all[i];
        var r = b.getBoundingClientRect();
        if (r.width < 20 || r.width > 90 || r.height < 20 || r.height > 90) continue;
        if (r.bottom < wh * 0.5) continue;
        if (r.right  < ww * 0.35) continue;
        if (!b.querySelector('svg')) continue;
        var txt = (b.textContent || '').replace(/\s+/g,'');
        if (txt.length > 5) continue; // reject text buttons
        var score = (r.right / ww) * 3 + (r.bottom / wh);
        if (score > bestScore) { bestScore = score; best = b; }
      }
      return best;
    } catch(_) { return null; }
  }

  function _applyBfLock(btn) {
    if (!btn) return;
    btn.style.setProperty('background',        '#ef4444', 'important');
    btn.style.setProperty('background-color',  '#ef4444', 'important');
    btn.style.setProperty('background-image',  'none',    'important');
    btn.style.setProperty('border-color',      '#b91c1c', 'important');
    btn.style.setProperty('cursor',            'not-allowed', 'important');
    btn.style.setProperty('opacity',           '1',       'important');
    btn.setAttribute('data-bf-locked', '1');
    btn.title = 'Select "Lower Priority" model to generate';
  }

  function _removeBfLock(btn) {
    if (!btn) return;
    ['background','background-color','background-image','border-color','cursor','opacity']
      .forEach(function(p) { btn.style.removeProperty(p); });
    btn.removeAttribute('data-bf-locked');
    btn.title = '';
  }

  function _flashModelSelector() {
    try {
      var btns = document.querySelectorAll('[role="button"],[role="combobox"],button');
      for (var j = 0; j < btns.length; j++) {
        var mt = (btns[j].textContent || '').trim();
        if (mt.length > 2 && mt.length < 100 && /veo/i.test(mt) &&
            btns[j].getBoundingClientRect().width > 10) {
          var b2 = btns[j];
          b2.style.outline = '2px solid #ef4444';
          b2.style.borderRadius = '6px';
          setTimeout(function() { b2.style.outline = ''; b2.style.borderRadius = ''; }, 1200);
          break;
        }
      }
    } catch(_) {}
  }

  // Main enforcement loop — runs every 300ms
  function _bfEnforceSendLock() {
    try {
      var shouldLock = _shouldLockSend();

      if (shouldLock) {
        document.documentElement.setAttribute('data-bf-model-locked', '1');
        // Find button fresh (React may have replaced the element)
        var btn = _findBfSendBtn();
        if (btn && btn !== _bfSendBtn) {
          // New element — remove lock from old, apply to new
          if (_bfSendBtn) _removeBfLock(_bfSendBtn);
          _bfSendBtn = btn;
        }
        if (_bfSendBtn) _applyBfLock(_bfSendBtn);
        _bfLocked = true;
      } else {
        document.documentElement.removeAttribute('data-bf-model-locked');
        if (_bfSendBtn) { _removeBfLock(_bfSendBtn); _bfSendBtn = null; }
        _bfLocked = false;
      }
    } catch(_) {}
  }

  // Start enforcement loop as soon as body exists
  function _startSendLockLoop() {
    _bfEnforceSendLock();
    setInterval(_bfEnforceSendLock, 300);
  }
  if (document.body) {
    _startSendLockLoop();
  } else {
    document.addEventListener('DOMContentLoaded', _startSendLockLoop);
  }

  // ── AUTO-SELECT LP: switch to Lower Priority on page load (MAIN world) ──────
  // Runs independently in MAIN world so .click() is more direct.
  // Stops as soon as LP is confirmed selected.

  var _bfLpDone = false;

  function _bfIsAllowedSelected() {
    var btns = document.querySelectorAll('[role="button"],[role="combobox"],button');
    for (var i = 0; i < btns.length; i++) {
      var txt = (btns[i].textContent || '').trim();
      if (txt.length > 2 && txt.length < 100 &&
          (/lower.{0,5}priority/i.test(txt) || /veo.{0,20}lite/i.test(txt)) &&
          btns[i].getBoundingClientRect().width > 10) return true;
    }
    return false;
  }

  function _bfOpenModelDropdown() {
    var btns = document.querySelectorAll('[role="button"],[role="combobox"],button');
    for (var i = 0; i < btns.length; i++) {
      var txt = (btns[i].textContent || '').trim();
      if (txt.length < 3 || txt.length > 120) continue;
      if (!/veo|fast|quality|standard/i.test(txt)) continue;
      if (/lower.{0,5}priority/i.test(txt)) continue;
      var r = btns[i].getBoundingClientRect();
      if (r.width < 10 || r.height < 6) continue;
      try { btns[i].click(); } catch(_) {}
      return true;
    }
    return false;
  }

  function _bfClickLPOption() {
    var opts = document.querySelectorAll(
      '[role="option"],[role="menuitem"],[role="listitem"],li,[tabindex="0"],[tabindex="-1"]'
    );
    for (var i = 0; i < opts.length; i++) {
      var txt = (opts[i].textContent || '').trim();
      if (txt.length < 3 || txt.length > 150) continue;
      if (!/lower.{0,5}priority/i.test(txt)) continue;
      var r = opts[i].getBoundingClientRect();
      if (r.width < 2 && r.height < 2) continue;
      try {
        opts[i].dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        opts[i].dispatchEvent(new MouseEvent('mouseup',   { bubbles: true, cancelable: true }));
        opts[i].dispatchEvent(new MouseEvent('click',     { bubbles: true, cancelable: true }));
        opts[i].click();
      } catch(_) {}
      return true;
    }
    return false;
  }

  var _bfLpAttempts = 0;
  function _bfAutoSelectLP() {
    if (_bfLpDone || _bfLpAttempts > 25) return;
    _bfLpAttempts++;
    if (_bfIsAllowedSelected()) { _bfLpDone = true; return; }
    if (_bfClickLPOption()) {
      // Clicked — check after 600ms if it worked
      setTimeout(function() {
        if (_bfIsAllowedSelected()) _bfLpDone = true;
        else _bfOpenModelDropdown(); // try again
      }, 600);
      return;
    }
    // Dropdown not open — open it
    _bfOpenModelDropdown();
  }

  // Start trying LP select as soon as body is available, every 500ms for ~12s
  function _bfStartLPLoop() {
    if (_bfIsAllowedSelected()) { _bfLpDone = true; return; }
    var iv = setInterval(function() {
      if (_bfLpDone || _bfLpAttempts > 25) { clearInterval(iv); return; }
      _bfAutoSelectLP();
    }, 500);
    // Also watch DOM for LP option appearing
    var obs = new MutationObserver(function() {
      if (_bfLpDone) { obs.disconnect(); return; }
      if (_bfClickLPOption()) {
        obs.disconnect();
        setTimeout(function() { if (_bfIsAllowedSelected()) _bfLpDone = true; }, 600);
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.body) _bfStartLPLoop();
  else document.addEventListener('DOMContentLoaded', _bfStartLPLoop);

  // Block click on any locked button (data-bf-locked) OR when model is non-LP
  document.addEventListener('click', function(e) {
    try {
      var el = e.target;
      for (var i = 0; i < 8 && el; i++) {
        // Direct lock attribute on element (set by _applyBfLock above)
        if (el.getAttribute && el.getAttribute('data-bf-locked') === '1') {
          e.stopPropagation(); e.stopImmediatePropagation(); e.preventDefault();
          _flashModelSelector();
          return;
        }
        el = el.parentElement;
      }
      // Also block if locked state is active AND click is in the lower screen area
      if (_bfLocked && e.clientY > window.innerHeight * 0.55) {
        var tgt = e.target;
        for (var j = 0; j < 6 && tgt; j++) {
          var tag = tgt.tagName;
          if (tag === 'BUTTON' || (tgt.getAttribute && tgt.getAttribute('role') === 'button')) {
            var lbl = (tgt.getAttribute('aria-label') || '').toLowerCase();
            var isNavBtn = /image|video|frame|ingredi|expand|close|menu|setting|filter|search/i.test(lbl + (tgt.textContent || ''));
            if (!isNavBtn) {
              e.stopPropagation(); e.stopImmediatePropagation(); e.preventDefault();
              _flashModelSelector();
              return;
            }
          }
          tgt = tgt.parentElement;
        }
      }
    } catch(_) {}
  }, true);

  // Block Enter key in prompt area when locked
  document.addEventListener('keydown', function(e) {
    try {
      if (e.key !== 'Enter' || e.shiftKey) return;
      if (!_bfLocked) return;
      var active = document.activeElement;
      if (active && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT'
                     || active.getAttribute('contenteditable') === 'true'
                     || active.getAttribute('contenteditable') === '')) {
        e.stopPropagation(); e.stopImmediatePropagation(); e.preventDefault();
        _flashModelSelector();
      }
    } catch(_) {}
  }, true);

  // ─────────────────────────────────────────────────────────────────────────
  // ── 3. GENERATION DETECTION — 4 independent layers ───────────────────────
  // All layers dispatch __bf_gen__ event to bunny_extra.js (isolated world)
  // ─────────────────────────────────────────────────────────────────────────

  var _seen      = new Set();    // URLs we've already counted
  var _baseline  = new Set();    // URLs present on page load (don't charge)
  var _baselined = false;        // true after 3s baseline window

  function _dispatch(type) {
    document.dispatchEvent(new CustomEvent('__bf_gen__', { detail: { type: type, count: 1 } }));
  }

  // Mark existing media as baseline after 3 seconds
  function _buildBaseline() {
    document.querySelectorAll('img,video').forEach(function(el) {
      var src = el.src || el.currentSrc || el.poster || '';
      if (src) { _baseline.add(src); _seen.add(src); }
    });
    _baselined = true;
  }
  setTimeout(_buildBaseline, 3000);
  // Also rebuild baseline on navigation
  window.addEventListener('popstate', function() { _baselined = false; _seen.clear(); _baseline.clear(); setTimeout(_buildBaseline, 3000); });

  // ── Layer A: img/video load events (capture phase = fires for ALL elements) ──
  // Catches every <img> or <video> that loads, regardless of src domain.
  // Only fires after baseline to avoid charging for pre-existing content.
  window.addEventListener('load', function(e) {
    if (!_baselined) return;
    var el = e.target;
    if (!el || !el.tagName) return;
    var tag = el.tagName.toUpperCase();
    if (tag !== 'IMG' && tag !== 'VIDEO') return;

    var src = el.src || el.currentSrc || el.poster || '';
    if (!src || src.startsWith('data:') || src.startsWith('chrome-extension:')) return;
    if (_seen.has(src)) return;
    _seen.add(src);

    // Only count large media (> 200x150) to filter out icons/avatars
    var w = el.naturalWidth  || el.videoWidth  || el.offsetWidth  || 0;
    var h = el.naturalHeight || el.videoHeight || el.offsetHeight || 0;
    if (w < 200 || h < 100) return;

    var type = (tag === 'VIDEO') ? 'video' : 'image';
    _dispatch(type);
  }, true /* capture */);

  // ── Layer B: HTMLImageElement.src property setter intercept ──────────────
  // Catches when React/JS sets el.src = "..." programmatically.
  // Works even before the element is in the DOM.
  (function() {
    var _d = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (!_d || !_d.set) return;
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      configurable: true,
      get: _d.get,
      set: function(v) {
        if (_baselined && v && typeof v === 'string' && v.length > 20 &&
            !v.startsWith('data:') && !_seen.has(v)) {
          _seen.add(v);
          // Will confirm size via naturalWidth check after load
          var self = this;
          self.addEventListener('load', function onLoad() {
            self.removeEventListener('load', onLoad);
            if ((self.naturalWidth || 0) >= 200 && (self.naturalHeight || 0) >= 100) {
              if (!_baseline.has(v)) _dispatch('image');
            }
          }, { once: true });
        }
        return _d.set.call(this, v);
      }
    });
  })();

  // ── Layer C: HTMLVideoElement.src / poster setter intercept ──────────────
  (function() {
    ['src', 'poster'].forEach(function(prop) {
      var proto = HTMLVideoElement.prototype;
      var _d = Object.getOwnPropertyDescriptor(proto, prop) ||
               Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, prop);
      if (!_d || !_d.set) return;
      Object.defineProperty(proto, prop, {
        configurable: true,
        get: _d.get,
        set: function(v) {
          if (_baselined && v && typeof v === 'string' && v.length > 20 &&
              !v.startsWith('data:') && !_seen.has(v)) {
            _seen.add(v);
            if (!_baseline.has(v)) _dispatch('video');
          }
          return _d.set.call(this, v);
        }
      });
    });
  })();

  // ── Layer D: PerformanceObserver — catches ALL resources including CSS bg ──
  // This fires for fetch, XHR, img, video, CSS background-image, etc.
  (function() {
    if (typeof PerformanceObserver === 'undefined') return;
    try {
      var _po = new PerformanceObserver(function(list) {
        if (!_baselined) return;
        list.getEntries().forEach(function(entry) {
          var url = entry.name || '';
          if (!url || url.startsWith('data:') || url.startsWith('chrome-extension:')) return;
          if (_seen.has(url)) return;

          // Only care about potential video/image content URLs
          // Match: googleapis.com, googleusercontent.com, lh3, yt, any video extension
          var isMedia = /storage\.googleapis\.com|googleusercontent\.com|\.mp4|\.webm|\.mov|\.jpg|\.jpeg|\.png|\.webp/i.test(url);
          // Also match any fetch/XHR to labs.google that indicates generation
          var isGenAPI = /labs\.google.*\/api\//i.test(url);

          if (!isMedia && !isGenAPI) return;
          if (_baseline.has(url)) return;
          _seen.add(url);

          // Use transferSize or encodedBodySize to filter out tiny resources
          var size = entry.transferSize || entry.encodedBodySize || 0;
          if (size > 0 && size < 10000) return; // < 10KB = not a real video/image

          var type = /\.mp4|\.webm|\.mov|video/i.test(url) ? 'video' : 'image';
          _dispatch(type);
        });
      });
      _po.observe({ type: 'resource', buffered: true });
    } catch(e) {}
  })();

  // ── Layer E: Network intercept (fetch + XHR) ─────────────────────────────
  // Original network intercept — watches API responses for videoUri patterns
  var _BF_FLOW = /labs\.google|googleapis\.com|\/fx\//i;
  var _bf_url = '', _bf_nv = 0, _bf_ni = 0;

  function _bf_reset() {
    if (location.href !== _bf_url) { _bf_url = location.href; _bf_nv = 0; _bf_ni = 0; }
  }

  function _bf_inspect(text) {
    if (!text || text.length < 10 || text.length > 500000) return;
    try {
      _bf_reset();
      var hasV = /videoUri|video_uri|\.mp4|\.webm|generatedVideo|videoUrl/i.test(text);
      var hasI = /imageUri|image_uri|generatedImage|imageUrl/i.test(text);
      if (!hasV && !hasI) return;
      if (hasV) {
        var totalV = Math.min((text.match(/videoUri|video_uri|\.mp4|\.webm|generatedVideo|videoUrl/ig)||[]).length, 8);
        if (totalV > _bf_nv) {
          document.dispatchEvent(new CustomEvent('__bf_gen__', { detail: { type: 'video', count: totalV - _bf_nv } }));
          _bf_nv = totalV;
        }
      }
      if (hasI && !hasV) {
        var totalI = Math.min((text.match(/imageUri|image_uri|generatedImage|imageUrl/ig)||[]).length, 8);
        if (totalI > _bf_ni) {
          document.dispatchEvent(new CustomEvent('__bf_gen__', { detail: { type: 'image', count: totalI - _bf_ni } }));
          _bf_ni = totalI;
        }
      }
    } catch(e) {}
  }

  // fetch
  var _origFetch = window.fetch;
  window.fetch = async function(input, init) {
    var resp;
    try { resp = await _origFetch.call(this, input, init); } catch(e) { throw e; }
    try {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      if (_BF_FLOW.test(url) && !/fonts|analytics|gtag|signout/i.test(url)) {
        resp.clone().text().then(_bf_inspect).catch(function(){});
      }
    } catch(e) {}
    return resp;
  };

  // XHR
  var _xhrMap = new WeakMap();
  var _xhrOpen = XMLHttpRequest.prototype.open;
  var _xhrSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(m, url) {
    _xhrMap.set(this, String(url || ''));
    return _xhrOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function() {
    var xhr = this, url = _xhrMap.get(xhr) || '';
    if (_BF_FLOW.test(url) && !/fonts|analytics|gtag|signout/i.test(url)) {
      xhr.addEventListener('load', function() { _bf_inspect(xhr.responseText || ''); }, { once: true });
    }
    return _xhrSend.apply(xhr, arguments);
  };

  // EventSource (SSE)
  var _OrigES = window.EventSource;
  if (_OrigES) {
    window.EventSource = function(url, opts) {
      var es = new _OrigES(url, opts);
      if (_BF_FLOW.test(String(url || ''))) {
        ['message','generation','update','result'].forEach(function(ev) {
          es.addEventListener(ev, function(e) { _bf_inspect(e.data || ''); });
        });
      }
      return es;
    };
    Object.setPrototypeOf(window.EventSource, _OrigES);
  }

})();