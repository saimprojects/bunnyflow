// BunnyFlow Extra v4.4 — plan expiry blocking + visual cleanup
// This file handles visual cleanup (badge removal) + video hiding + plan enforcement
(function () {
  'use strict';

  // ── 0. PLAN EXPIRY CHECK ──────────────────────────────────────────────────
  // Runs in isolated world so has chrome.storage access
  function getDaysRemaining(data) {
    if (data.daysRemaining != null) return Math.max(0, parseInt(data.daysRemaining) || 0);
    if (data.planExpiresAt) {
      const ms = new Date(data.planExpiresAt).getTime() - Date.now();
      return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
    }
    return null;
  }

  function showExpiredOverlay(serverUrl) {
    const overlay = document.createElement('div');
    overlay.id = '__bf_expired__';
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '2147483647',
      background: 'rgba(10,6,18,0.97)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif', color: '#fff',
    });
    const dashUrl = serverUrl ? serverUrl.replace(/\/+$/, '') + '/dashboard' : '#';
    overlay.innerHTML = `
      <div style="text-align:center;max-width:400px;padding:32px">
        <div style="font-size:48px;margin-bottom:16px">🚫</div>
        <h2 style="font-size:22px;font-weight:700;margin:0 0 8px;color:#f87171">Plan Expired</h2>
        <p style="color:#9ca3af;font-size:14px;margin:0 0 24px;line-height:1.6">
          Your BunnyFlow plan has expired.<br>
          Contact your admin to renew access.
        </p>
        <a href="${dashUrl}" target="_blank"
           style="display:inline-block;padding:10px 24px;background:#7c3aed;color:#fff;
                  border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
          Go to Dashboard
        </a>
      </div>`;
    function inject() {
      if (!document.getElementById('__bf_expired__') && document.body) {
        document.body.appendChild(overlay);
      }
    }
    inject();
    new MutationObserver(inject).observe(document.documentElement, { childList: true, subtree: true });
  }

  function showWarningBanner(days, serverUrl) {
    if (document.getElementById('__bf_warn__')) return;
    const banner = document.createElement('div');
    banner.id = '__bf_warn__';
    const dashUrl = serverUrl ? serverUrl.replace(/\/+$/, '') + '/dashboard' : '#';
    Object.assign(banner.style, {
      position: 'fixed', bottom: '16px', right: '16px', zIndex: '2147483646',
      background: '#78350f', color: '#fef3c7', borderRadius: '10px',
      padding: '12px 16px', fontSize: '13px', fontFamily: 'system-ui,sans-serif',
      display: 'flex', alignItems: 'center', gap: '10px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)', maxWidth: '320px',
    });
    banner.innerHTML = `
      <span style="font-size:18px">⚠️</span>
      <span><strong>${days} day${days === 1 ? '' : 's'} left</strong> on your BunnyFlow plan.<br>
        <a href="${dashUrl}" target="_blank" style="color:#fde68a">Renew now →</a></span>
      <button onclick="this.parentNode.remove()" style="background:none;border:none;color:#fde68a;cursor:pointer;font-size:16px;margin-left:auto">✕</button>`;
    if (document.body) document.body.appendChild(banner);
    else document.addEventListener('DOMContentLoaded', () => document.body && document.body.appendChild(banner));
  }

  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(null, function(all) {
      const days = getDaysRemaining(all);
      const serverUrl = all.apiBase || all.origin || all.serverUrl || all.baseUrl || '';
      if (days === 0) {
        showExpiredOverlay(serverUrl);
      } else if (days !== null && days <= 1) {
        setTimeout(() => showWarningBanner(days, serverUrl), 1500);
      }
    });
  }

  // ── 1. PERMANENT CSS ─────────────────────────────────────────────────────
  const CSS = `
    [data-bf-hide]{display:none!important;visibility:hidden!important;}
    [data-bf-ban] {display:none!important;}
    [data-bf-locked]{opacity:0.35!important;}
    [data-bf-unlocked]{opacity:1!important;pointer-events:auto!important;cursor:pointer!important;}
    .bf-ov{position:absolute!important;inset:0!important;z-index:2147483647!important;
           cursor:not-allowed!important;background:transparent!important;}
    .bf-lk{position:absolute!important;right:8px!important;top:50%!important;
            transform:translateY(-50%)!important;font-size:11px!important;
            z-index:2147483647!important;pointer-events:none!important;}
    .credits-locked{display:none!important;}

    /* ── SEND BUTTON LOCK (non-LP model active) ────────────────────────── */
    html[data-bf-model-locked] [aria-label*="send" i],
    html[data-bf-model-locked] [aria-label*="generat" i],
    html[data-bf-model-locked] [aria-label*="submit" i],
    html[data-bf-model-locked] button[type="submit"] {
      background: #ef4444 !important;
      background-color: #ef4444 !important;
      border-color: #ef4444 !important;
      box-shadow: 0 0 0 3px rgba(239,68,68,0.4) !important;
      cursor: not-allowed !important;
      opacity: 1 !important;
      filter: none !important;
    }
    html[data-bf-model-locked] [aria-label*="send" i] svg,
    html[data-bf-model-locked] [aria-label*="generat" i] svg {
      color: #fff !important;
      fill: #fff !important;
    }
  `;
  function injectCSS() {
    if (document.getElementById('__bf__')) return;
    const s = document.createElement('style');
    s.id = '__bf__'; s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }
  injectCSS();
  new MutationObserver(injectCSS).observe(document.documentElement, { childList: true });

  // ── 2. MATCHERS ───────────────────────────────────────────────────────────
  const LOCK_RE  = /veo.*(quality|fast(?!.*lower))/i;
  const LP_RE    = /lower.{0,5}priority/i;
  const FREE_RE  = /nano.{0,5}banana|pro.{0,5}imagen|^imagen\b|veo.*lite/i;

  const OPT_SEL = '[role="option"],[role="menuitem"],[role="listitem"],li,[tabindex="0"],[tabindex="-1"]';

  function shouldFreeUnlock(txt) {
    if (!txt || txt.length > 120) return false;
    return LP_RE.test(txt) || FREE_RE.test(txt);
  }

  // ── 3. LOCK non-free video models ─────────────────────────────────────────
  function lockModels() {
    document.querySelectorAll(OPT_SEL).forEach(el => {
      if (el.dataset.bfLocked === '1') return;
      const txt = el.textContent || '';
      if (txt.length > 120) return;
      if (LP_RE.test(txt) || FREE_RE.test(txt)) return; // never lock LP/free
      if (!LOCK_RE.test(txt)) return;

      el.dataset.bfLocked = '1';
      el.style.position = 'relative';

      const block = e => { e.stopPropagation(); e.preventDefault(); };
      ['click','mousedown','pointerdown','touchstart','keydown'].forEach(ev =>
        el.addEventListener(ev, block, true));

      if (!el.querySelector('.bf-ov')) {
        const ov = document.createElement('div');
        ov.className = 'bf-ov';
        ov.title = 'BunnyFlow: upgrade to unlock';
        el.appendChild(ov);
      }
      if (!el.querySelector('.bf-lk')) {
        const lk = document.createElement('span');
        lk.className = 'bf-lk'; lk.textContent = '\uD83D\uDD12';
        el.appendChild(lk);
      }
    });
  }

  // ── 4. FORCE-UNLOCK free models (LP + free image models) ─────────────────
  // bf_early.js already prevents persistent_lock.js from adding click-blocking
  // listeners on LP/free elements via addEventListener intercept.
  // This function handles VISUAL cleanup: removes lock badge icons/overlays
  // that persistent_lock.js may still inject as DOM children.

  function removeLockBadges(el) {
    // Remove all children that look like lock overlays or badges:
    // our own .bf-ov / .bf-lk, elements containing 🔒 emoji,
    // elements with "lock"/"overlay" in their class, absolutely positioned overlays
    Array.from(el.children).forEach(child => {
      const childTxt = (child.textContent || '').trim();
      const cls      = (child.className  || '').toLowerCase();
      const isOurs       = child.classList.contains('bf-ov') || child.classList.contains('bf-lk');
      const isLockEmoji  = childTxt === '\uD83D\uDD12' || childTxt === '\uD83D\uDD13';
      const isLockClass  = cls.includes('lock') || cls.includes('overlay');
      const isAbsOverlay = child.style && child.style.position === 'absolute';
      if (isOurs || isLockEmoji || isLockClass || isAbsOverlay) {
        child.remove();
      }
    });
  }

  function unlockFreeModels() {
    document.querySelectorAll(OPT_SEL).forEach(el => {
      const txt = el.textContent || '';
      if (!shouldFreeUnlock(txt)) return;

      // Remove visual lock badges left by persistent_lock.js
      removeLockBadges(el);

      // Force pointer events + visual unlock
      el.style.setProperty('pointer-events', 'auto',    'important');
      el.style.setProperty('opacity',        '1',        'important');
      el.style.setProperty('cursor',         'pointer',  'important');
      delete el.dataset.bfLocked;
      el.removeAttribute('disabled');
      el.removeAttribute('aria-disabled');
      el.dataset.bfUnlocked = '1';
    });
  }

  // ── 5. VIDEO / THUMBNAIL HIDING (home page only) ──────────────────────────
  const DATE_RE = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b.{0,5}\d{1,2}|\d{1,2}:\d{2}\s*(am|pm)|tháng|\d{4}-\d{2}-\d{2}/i;
  const NEWP_RE = /new\s*project|dự án mới|\+\s*d|create new/i;
  const BNNER_RE = /nano banana|is here!|new model|veo\s+\d|imagen/i;

  function isHome() { return !/\/project\//.test(location.pathname); }

  function cardParent(el, depth) {
    depth = depth || 8;
    let cur = el;
    for (let i = 0; i < depth; i++) {
      const p = cur.parentElement;
      if (!p || p === document.body || p === document.documentElement) break;
      if (p.children.length > 6) return cur;
      if (['ARTICLE','LI'].includes(p.tagName) || p.getAttribute('role') === 'gridcell') return p;
      cur = p;
    }
    return cur;
  }

  function hideVideos() {
    if (!isHome()) return;

    // Hide all project card links and their parent cards
    document.querySelectorAll('a[href*="/project/"]').forEach(a => {
      if (a.dataset.bfSeen) return;
      a.dataset.bfSeen = '1';
      if (NEWP_RE.test(a.textContent || '')) return;
      const card = cardParent(a);
      card.dataset.bfHide = '1';
      // Also hide the link itself in case card hiding misses it
      a.dataset.bfHide = '1';
    });

    // Hide list/article/gridcell items that contain dates (project cards)
    document.querySelectorAll('li,article,[role="gridcell"],[role="listitem"]').forEach(el => {
      if (el.dataset.bfSeen) return;
      el.dataset.bfSeen = '1';
      const txt = el.textContent || '';
      if (txt.length > 350 || !DATE_RE.test(txt) || NEWP_RE.test(txt)) return;
      el.dataset.bfHide = '1';
    });

    // Hide any div/section with an image/video AND a date (= project thumbnail card)
    document.querySelectorAll('div,section').forEach(el => {
      if (el.dataset.bfSeen) return;
      const txt = el.textContent || '';
      if (txt.length > 280 || txt.length < 3 || !DATE_RE.test(txt) || NEWP_RE.test(txt)) return;
      if (!el.querySelector('img,video,[role="img"]')) return;
      if (el.querySelectorAll('[data-bf-hide]').length > 0) return;
      el.dataset.bfSeen = '1';
      cardParent(el).dataset.bfHide = '1';
    });

    // Hide "Your projects" / "Recent" section titles and banner ads
    document.querySelectorAll('div,section').forEach(el => {
      if (el.dataset.bfSeen) return;
      const txt = el.textContent || '';
      if (txt.length > 500 || txt.length < 5 || !BNNER_RE.test(txt) || NEWP_RE.test(txt)) return;
      el.dataset.bfSeen = '1';
      el.dataset.bfBan = '1';
    });

    // Also hide any container whose ALL children are [data-bf-hide] (= entire project grid)
    document.querySelectorAll('ul,ol,div[class*="grid"],div[class*="list"]').forEach(el => {
      if (el.dataset.bfSeen) return;
      const kids = Array.from(el.children);
      if (kids.length < 2) return;
      const allHidden = kids.every(k => k.dataset.bfHide === '1' || k.dataset.bfBan === '1');
      if (allHidden) {
        el.dataset.bfSeen = '1';
        el.dataset.bfHide = '1';
      }
    });
  }

  // ── 5b. GENERATION WATCHER & CREDIT DEDUCTION ───────────────────────────────
  // Detects when videos/images complete on Google Flow and calls
  // POST /api/extension/use-credits to deduct from the user's BunnyFlow account.
  //
  // Strategy: track how many <video> elements exist at page-load (baseCount).
  // Any increase after that = new generation completed → charge credits.
  // Images are detected similarly via <img> inside generation result containers.

  // ─── CREDIT DEDUCTION ─────────────────────────────────────────────────────
  // Rules:
  //   • Deduct 20 credits ONLY after a video is SUCCESSFULLY generated.
  //   • Download is FREE — no credits deducted on download.
  //   • Prevent double deductions with a per-page cooldown.
  //
  // Detection approach — two independent layers:
  //   Layer 1 (PRIMARY)  : Progress-bar disappearance watcher in watchGenerations()
  //     Google Flow shows "33%", "67%"... while generating.
  //     When those percentage text elements disappear, generation is complete.
  //   Layer 2 (BACKUP)   : Network intercept in bf_early.js watches API responses
  //     for videoUri / .mp4 patterns and dispatches __bf_gen__ event.
  //
  // Either layer fires callUseCredits() which sends one POST to BunnyFlow backend.
  // Both layers share a cooldown to prevent double charging.
  // ─────────────────────────────────────────────────────────────────────────────

  const _API_BASE = '';

  // Cooldown: after any charge, ignore further charge attempts for N ms.
  // Prevents double deduction if both layers fire for the same completion.
  let _chargeTs   = 0;
  const _COOLDOWN = 5000; // 8 seconds per charge event

  // ─── Auth ──────────────────────────────────────────────────────────────────
  // background.js stores sessionToken as "userId:jwt".
  // Extract the real JWT by splitting on the first colon.
  function _extractJwt(all) {
    if (all.sessionToken && typeof all.sessionToken === 'string' && all.sessionToken.includes(':')) {
      const jwt = all.sessionToken.substring(all.sessionToken.indexOf(':') + 1);
      if (jwt && jwt.length > 20) return jwt;
    }
    return all.token || all.session || all.authToken || all.jwt || null;
  }

  // ─── Credit API call ───────────────────────────────────────────────────────
  function callUseCredits(type, count) {
    if (typeof chrome === 'undefined' || !chrome.storage) return;

    // Per-charge cooldown — prevent double deduction
    const now = Date.now();
    if (now - _chargeTs < _COOLDOWN) return;
    _chargeTs = now;

    chrome.storage.local.get(null, function(all) {
      const token   = _extractJwt(all);
      const apiBase = all.apiBase || all.origin || _API_BASE;
      if (!token || token.length < 20) return;

      for (let i = 0; i < (count || 1); i++) {
        fetch(apiBase + '/api/extension/use-credits', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type: type || 'video' }),
        })
        .then(function(res) { return res.ok ? res.json() : null; })
        .then(function(data) {
          if (data && data.creditsRemaining != null && chrome.storage) {
            chrome.storage.local.set({ credits: data.creditsRemaining, creditsLeft: data.creditsRemaining });
          }
        })
        .catch(function() {});
      }
    });

    // Also notify background.js so its own credit path can fire
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      try {
        chrome.runtime.sendMessage({
          type: type === 'video' ? 'VIDEO_GENERATED' : 'IMAGE_GENERATED',
          data: { mediaType: type || 'video', prompt: '', videoUrl: null, thumbnailUrl: null }
        }, function() {});
      } catch(e) {}
    }
  }

  // ─── Layer 2: Network intercept backup ────────────────────────────────────
  // bf_early.js dispatches __bf_gen__ when it finds videoUri in API responses.
  // Use this only if Layer 1 (progress bars) hasn't fired recently.
  document.addEventListener('__bf_gen__', function(e) {
    if (!e.detail || !e.detail.count || e.detail.count <= 0) return;
    callUseCredits(e.detail.type || 'video', e.detail.count);
  });

  // ─── Layer 1: Progress-bar disappearance (PRIMARY) ────────────────────────
  // Counts leaf DOM elements that contain only a percentage number (e.g. "33%").
  // When those disappear after being present → generation completed.
  let _progSeen  = 0; // max % bars seen in current generation run
  let _progPolls = 0; // consecutive polls with % bars visible
  let _genLastUrl = '';

  function countProgressBars() {
    var count = 0;
    var all = document.getElementsByTagName('*');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.childElementCount === 0) {
        var txt = (el.textContent || '').trim();
        // Match only pure percentage text: "33%" "100%" etc.
        if (/^[1-9]\d?%$|^100%$/.test(txt)) count++;
      }
    }
    return count;
  }

  function watchGenerations() {
    if (isHome()) {
      _progSeen = 0; _progPolls = 0; _genLastUrl = '';
      return;
    }

    // Reset counters on page navigation
    if (location.href !== _genLastUrl) {
      _genLastUrl = location.href;
      _progSeen = 0; _progPolls = 0;
      return;
    }

    var current = countProgressBars();

    if (current > 0) {
      // Generation in progress
      if (current > _progSeen) _progSeen = current;
      _progPolls++;

      // Ensure current generation is tracked
      if (!_currGenId || !_genMap[_currGenId]) {
        _currGenId = _newGenId();
        _genMap[_currGenId] = { status: 'pending', deducted: false };
      }
    } else if (_progPolls >= 1 && _progSeen > 0) {
      // Progress bars gone → generation succeeded
      var completed = _progSeen;
      var genId     = _currGenId;
      _progSeen     = 0;
      _progPolls    = 0;

      // Task 2: use tracking — mark success → deduct only once
      if (genId && _genMap[genId] && !_genMap[genId].deducted) {
        _markGenSuccess(genId);
        // If more than 1 video was generating, charge for the rest directly
        for (var extra = 1; extra < completed; extra++) {
          var xId = _newGenId();
          _genMap[xId] = { status: 'pending', deducted: false };
          _markGenSuccess(xId);
        }
      } else {
        // Fallback: no tracking record → charge directly
        callUseCredits('video', completed);
      }

      _currGenId = null;
    }
  }

  // ── MISSING FUNCTIONS (restored) ─────────────────────────────────────────

  // Variable declarations referenced in onNav() and below
  let lpSwitchPending = false;
  let _genBaseVideo   = -1;  // kept for onNav() compat

  // Simple generation tracking: Task 2
  // Each generation gets a unique ID, status, and deducted flag.
  // Only deduct when status = 'success' AND deducted = false.
  const _genMap = {};   // { [genId]: { status, deducted } }
  let   _currGenId = null;

  function _newGenId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function _markGenSuccess(genId) {
    if (!genId || !_genMap[genId]) return;
    const rec = _genMap[genId];
    if (rec.status === 'success' && rec.deducted) return; // already handled
    rec.status   = 'success';
    if (!rec.deducted) {
      rec.deducted = true;
      callUseCredits('video', 1);
    }
  }

  // ── AUTO-SELECT LOWER PRIORITY MODEL ─────────────────────────────────────
  // Every time user lands on Flow (fresh load, redirect, SPA nav):
  //  1. Check if LP is already selected → done
  //  2. If not, open the model dropdown by clicking the current model button
  //  3. Wait 400ms for dropdown to appear, then click LP option
  //  4. If LP option not found yet, retry up to 8 times (every 300ms)
  //
  // MODEL_RE: matches any non-LP video model name (Veo, Fast, Quality, etc.)
  const MODEL_BTN_RE = /veo|fast|quality|standard|turbo|flash|ultra/i;

  let _lpDone    = false;   // true once LP successfully clicked this page load
  let _lpOpening = false;   // true while we're in the open→click sequence

  function _isLPSelected() {
    // Check all visible buttons/selectors for LP text
    const all = document.querySelectorAll('[role="button"],[role="combobox"],button,select');
    for (var i = 0; i < all.length; i++) {
      const txt = (all[i].textContent || all[i].value || '').trim();
      if (txt.length > 2 && txt.length < 100 && /lower.{0,5}priority/i.test(txt)) return true;
    }
    return false;
  }

  function _clickLPInDropdown() {
    // Try to find and click the LP option in an open dropdown
    const opts = document.querySelectorAll(
      '[role="option"],[role="menuitem"],[role="listitem"],li,[tabindex="0"],[tabindex="-1"]'
    );
    for (var i = 0; i < opts.length; i++) {
      const opt = opts[i];
      const txt = (opt.textContent || '').trim();
      if (txt.length < 3 || txt.length > 150) continue;
      if (!/lower.{0,5}priority/i.test(txt)) continue;
      // Verify it's visible
      const rect = opt.getBoundingClientRect();
      if (rect.width < 2 && rect.height < 2) continue;

      // Found LP option — fire proper mouse event sequence
      try {
        opt.dispatchEvent(new MouseEvent('mouseover',  { bubbles: true, cancelable: true }));
        opt.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
        opt.dispatchEvent(new MouseEvent('mousedown',  { bubbles: true, cancelable: true }));
        opt.dispatchEvent(new PointerEvent('pointerup',   { bubbles: true, cancelable: true }));
        opt.dispatchEvent(new MouseEvent('mouseup',    { bubbles: true, cancelable: true }));
        opt.dispatchEvent(new MouseEvent('click',      { bubbles: true, cancelable: true }));
        opt.click();
      } catch(e) {}

      _lpDone    = true;
      _lpOpening = false;
      lpSwitchPending = true;
      setTimeout(function() { lpSwitchPending = false; }, 2500);
      return true;
    }
    return false;
  }

  function _openModelDropdown() {
    // Find the model selector button (currently showing a non-LP model name)
    const btns = document.querySelectorAll('[role="button"],[role="combobox"],button');
    for (var i = 0; i < btns.length; i++) {
      const btn = btns[i];
      const txt = (btn.textContent || '').trim();
      if (txt.length < 3 || txt.length > 120) continue;
      // Must look like a model name (Veo, Fast, Quality, etc.) and not be LP
      if (!MODEL_BTN_RE.test(txt)) continue;
      if (/lower.{0,5}priority/i.test(txt)) continue;
      // Must be visible
      const rect = btn.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 6) continue;
      try { btn.click(); } catch(e) {}
      return true;
    }
    return false;
  }

  // MutationObserver: fires instantly when LP option appears in the DOM
  // (when the dropdown opens). This is faster and more reliable than polling.
  var _lpObserver = null;

  function _startLPObserver() {
    if (_lpObserver) return; // already watching
    _lpObserver = new MutationObserver(function() {
      if (_lpDone || isHome()) return;
      if (_clickLPInDropdown()) {
        _stopLPObserver(); // LP clicked — stop observing
      }
    });
    _lpObserver.observe(document.body || document.documentElement,
      { childList: true, subtree: true });
  }

  function _stopLPObserver() {
    if (_lpObserver) { _lpObserver.disconnect(); _lpObserver = null; }
  }

  function _trySelectLP(retries) {
    if (_lpDone || isHome()) { _stopLPObserver(); return; }
    // Already LP?
    if (_isLPSelected()) { _lpDone = true; _lpOpening = false; _stopLPObserver(); return; }
    // LP option visible in open dropdown? Click it now.
    if (_clickLPInDropdown()) { _stopLPObserver(); return; }
    // Not found yet — open the dropdown if retries left
    if (retries <= 0) { _lpOpening = false; _stopLPObserver(); return; }
    _openModelDropdown();
    // Wait 400ms then try again
    setTimeout(function() { _trySelectLP(retries - 1); }, 400);
  }

  function autoSelectLP() {
    if (isHome() || lpSwitchPending) return;
    if (_lpDone && _isLPSelected()) return;
    if (_isLPSelected()) { _lpDone = true; return; }
    if (_lpOpening) return; // already in progress
    // Start: watch the DOM for LP option + poll
    _lpOpening = true;
    _lpDone    = false;
    _startLPObserver();           // instant reaction when dropdown opens
    _trySelectLP(20);             // fallback: up to 20 retries × 400ms = 8 seconds
  }

  // ── ENFORCE LP MODEL: lock send button via HTML attribute + CSS ─────────────
  // Sets/removes data-bf-model-locked on <html> element.
  // CSS (above) turns send button RED when attribute is present.
  // bf_early.js capture-phase listener blocks actual clicks when attribute is set.

  function _getCurrentModelText() {
    const btns = document.querySelectorAll('[role="button"],[role="combobox"],button');
    for (var i = 0; i < btns.length; i++) {
      const txt = (btns[i].textContent || '').trim();
      if (txt.length < 3 || txt.length > 100) continue;
      if (!/veo|lower.{0,5}priority/i.test(txt)) continue;
      if (btns[i].getBoundingClientRect().width < 10) continue;
      return txt;
    }
    return '';
  }

  // ── SEND BUTTON LOCK: fixed overlay + attribute + inline style (triple lock) ──
  // Approach: a single <div id="__bf_slo__"> overlays the send button.
  // Its position is updated every 200ms so it never drifts.
  // bf_early.js (MAIN world) blocks the real button via data-bf-model-locked.
  // Inline styles on the button itself are also applied as a 3rd layer.

  var _slo = null; // the overlay div
  var _sloBtnObs = null; // MutationObserver watching the found button

  function _getOrCreateOverlay() {
    if (_slo && document.contains(_slo)) return _slo;
    _slo = document.createElement('div');
    _slo.id = '__bf_slo__';
    Object.assign(_slo.style, {
      position:     'fixed',
      zIndex:       '2147483646',
      borderRadius: '50%',
      cursor:       'not-allowed',
      background:   '#ef4444',
      opacity:      '0.92',
      display:      'none',
      pointerEvents:'auto',
    });
    _slo.title = 'Select "Lower Priority" model to generate video';
    // block clicks on overlay itself
    ['click','mousedown','pointerdown','touchstart'].forEach(function(ev) {
      _slo.addEventListener(ev, function(e) {
        e.stopPropagation(); e.stopImmediatePropagation(); e.preventDefault();
        _flashModelSel();
      }, true);
    });
    document.documentElement.appendChild(_slo);
    return _slo;
  }

  function _flashModelSel() {
    var btns = document.querySelectorAll('[role="button"],[role="combobox"],button');
    for (var j = 0; j < btns.length; j++) {
      var mt = (btns[j].textContent || '').trim();
      if (mt.length > 2 && mt.length < 100 && /veo/i.test(mt)
          && btns[j].getBoundingClientRect().width > 10) {
        var b2 = btns[j];
        b2.style.outline = '2px solid #ef4444';
        b2.style.borderRadius = '6px';
        setTimeout(function() { b2.style.outline = ''; b2.style.borderRadius = ''; }, 1200);
        break;
      }
    }
  }

  // Find the send button: rightmost + bottommost SVG-only button in lower-right of screen
  function _findSendBtn() {
    var best = null, bestScore = -1;
    var wh = window.innerHeight, ww = window.innerWidth;
    var allBtns = document.querySelectorAll('button,[role="button"]');
    for (var i = 0; i < allBtns.length; i++) {
      var b = allBtns[i];
      if (!b.offsetParent && b.style.display === 'none') continue;
      var r = b.getBoundingClientRect();
      if (r.width < 24 || r.width > 80) continue;   // small-ish button
      if (r.height < 24 || r.height > 80) continue;
      if (r.bottom < wh * 0.55) continue;            // lower 45% of screen
      if (r.right < ww * 0.45) continue;             // right 55% of screen
      if (!b.querySelector('svg,img')) continue;      // has icon
      // reject text-heavy buttons (tabs, labels)
      var txt = (b.textContent || '').replace(/\s+/g, '');
      if (txt.length > 6) continue;
      // score: prioritise rightmost, bottommost
      var score = (r.right / ww) * 2 + (r.bottom / wh);
      if (score > bestScore) { bestScore = score; best = b; }
    }
    return best;
  }

  function _applyLockStyles(btn) {
    if (!btn) return;
    btn.style.setProperty('background',       '#ef4444', 'important');
    btn.style.setProperty('background-color', '#ef4444', 'important');
    btn.style.setProperty('background-image', 'none',    'important');
    btn.style.setProperty('border-color',     '#b91c1c', 'important');
    btn.style.setProperty('opacity',          '1',       'important');
    btn.style.setProperty('cursor',           'not-allowed', 'important');
    btn.dataset.bfLocked = '1';
  }

  function _removeLockStyles(btn) {
    if (!btn) return;
    ['background','background-color','background-image','border-color','opacity','cursor']
      .forEach(function(p) { btn.style.removeProperty(p); });
    delete btn.dataset.bfLocked;
    btn.title = '';
  }

  function _positionOverlay(btn) {
    var ov = _getOrCreateOverlay();
    if (!btn) { ov.style.display = 'none'; return; }
    var r = btn.getBoundingClientRect();
    if (r.width < 1) { ov.style.display = 'none'; return; }
    ov.style.left   = r.left   + 'px';
    ov.style.top    = r.top    + 'px';
    ov.style.width  = r.width  + 'px';
    ov.style.height = r.height + 'px';
    ov.style.display = 'block';
  }

  var _sendBtnCache = null;
  var _btnObserver  = null;

  function _observeBtn(btn) {
    if (_btnObserver) { _btnObserver.disconnect(); _btnObserver = null; }
    if (!btn) return;
    _btnObserver = new MutationObserver(function() {
      // If React wiped our styles, reapply immediately
      if (document.documentElement.hasAttribute('data-bf-model-locked')) {
        _applyLockStyles(btn);
        _positionOverlay(btn);
      }
    });
    _btnObserver.observe(btn, { attributes: true, attributeFilter: ['style','class'] });
  }

  function enforceLPModel() {
    var ov = _getOrCreateOverlay();

    if (isHome()) {
      document.documentElement.removeAttribute('data-bf-model-locked');
      if (_sendBtnCache) { _removeLockStyles(_sendBtnCache); _sendBtnCache = null; }
      if (_btnObserver) { _btnObserver.disconnect(); _btnObserver = null; }
      ov.style.display = 'none';
      return;
    }

    var modelTxt = _getCurrentModelText();
    if (!modelTxt) {
      // Image tab or no model visible → unlock
      document.documentElement.removeAttribute('data-bf-model-locked');
      if (_sendBtnCache) { _removeLockStyles(_sendBtnCache); _sendBtnCache = null; }
      if (_btnObserver) { _btnObserver.disconnect(); _btnObserver = null; }
      ov.style.display = 'none';
      return;
    }

    var isLP = /lower.{0,5}priority/i.test(modelTxt);

    if (isLP) {
      // UNLOCK
      document.documentElement.removeAttribute('data-bf-model-locked');
      if (_sendBtnCache) { _removeLockStyles(_sendBtnCache); }
      if (_btnObserver) { _btnObserver.disconnect(); _btnObserver = null; }
      _sendBtnCache = null;
      ov.style.display = 'none';
    } else {
      // LOCK
      document.documentElement.setAttribute('data-bf-model-locked', '1');
      var btn = _findSendBtn();
      if (btn && btn !== _sendBtnCache) {
        // New button found (React replaced it) → re-observe
        if (_sendBtnCache) _removeLockStyles(_sendBtnCache);
        _sendBtnCache = btn;
        _observeBtn(btn);
      }
      if (_sendBtnCache) {
        _applyLockStyles(_sendBtnCache);
        _positionOverlay(_sendBtnCache);
      } else {
        ov.style.display = 'none';
      }
    }
  }

  // hookSendButton: intercept the generate button to record a pending generation ID.
  // On click → create a new gen record with status=pending.
  // watchGenerations() will mark it success when progress bars disappear.
  function hookSendButton() {
    if (isHome()) return;
    const BTN_SEL = '[aria-label*="send" i],[aria-label*="generat" i],[aria-label*="create" i]';
    document.querySelectorAll(BTN_SEL).forEach(function(btn) {
      if (btn.dataset.bfSendHooked) return;
      btn.dataset.bfSendHooked = '1';
      btn.addEventListener('click', function() {
        _currGenId = _newGenId();
        _genMap[_currGenId] = { status: 'pending', deducted: false };
        // Expire old records (keep last 10)
        const keys = Object.keys(_genMap);
        if (keys.length > 10) delete _genMap[keys[0]];
      }, { capture: true });
    });
    // Also hook any form submission (textarea + Enter)
    document.querySelectorAll('textarea,input[type="text"]').forEach(function(inp) {
      if (inp.dataset.bfKeyHooked) return;
      inp.dataset.bfKeyHooked = '1';
      inp.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          _currGenId = _newGenId();
          _genMap[_currGenId] = { status: 'pending', deducted: false };
        }
      }, { capture: true });
    });
  }

  // ── HIDE "Not enough credits" GOOGLE FLOW ERROR TOASTS ──────────────────
  const _CRED_RE = /not enough credits|enough credits to save|credits to save this/i;
  const _TOAST_SELS = [
    '[role="alert"]', '[role="status"]',
    'snack-bar-container', 'mat-snack-bar-container',
    '.snackbar', '.toast', '.notification', '.alert-message',
    '[class*="snack"]', '[class*="toast"]', '[class*="notif"]',
    '[class*="error"]', '[class*="credits"]',
  ].join(',');

  function hideErrorMessages() {
    try {
      // Hide any element containing the "not enough credits" text
      document.querySelectorAll(_TOAST_SELS).forEach(el => {
        if (_CRED_RE.test(el.textContent || '')) {
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('visibility', 'hidden', 'important');
          el.style.setProperty('opacity', '0', 'important');
          el.setAttribute('data-bf-ban', '1');
        }
      });
      // Also scan all elements with inline error-like styles that mention credits
      document.querySelectorAll('[aria-live]').forEach(el => {
        if (_CRED_RE.test(el.textContent || '')) {
          el.style.setProperty('display', 'none', 'important');
          el.setAttribute('data-bf-ban', '1');
        }
      });
    } catch(e) {}
  }

  function run() {
    injectCSS();
    lockModels();
    unlockFreeModels();
    hideVideos();
    autoSelectLP();
    hookSendButton();
    watchGenerations();
    hideErrorMessages();
    enforceLPModel();
  }


  run();
  if (document.readyState !== 'complete') {
    document.addEventListener('DOMContentLoaded', run);
    window.addEventListener('load', run);
  }

  // Aggressive LP selection on initial page load: try multiple times after load
  // to handle slow-rendering UI components
  [500, 1000, 1500, 2500, 4000].forEach(function(t) {
    setTimeout(function() {
      if (!_lpDone && !isHome()) {
        if (!_lpOpening) autoSelectLP();
      }
    }, t);
  });

  setInterval(run, 200);

  const mo = new MutationObserver(run);
  function startObs() { if (document.body) mo.observe(document.body, { childList: true, subtree: true }); }
  if (document.body) startObs();
  else document.addEventListener('DOMContentLoaded', startObs);

  // SPA navigation
  let last = location.href;
  function onNav() {
    if (location.href === last) return;
    last = location.href;
    // Reset LP auto-select for new page
    lpSwitchPending = false;
    _lpDone    = false;
    _lpOpening = false;
    _genBaseVideo = -1;
    _genLastUrl   = '';
    _progSeen     = 0;
    _progPolls    = 0;
    _currGenId    = null;
    document.querySelectorAll('[data-bf-tried-auto-lp],[data-bf-auto-lp],[data-bf-send-hooked]').forEach(el => {
      delete el.dataset.bfTriedAutoLP;
      delete el.dataset.bfAutoLp;
      delete el.dataset.bfSendHooked;
    });
    document.querySelectorAll('[data-bf-seen]').forEach(el => {
      delete el.dataset.bfSeen;
      el.removeAttribute('data-bf-hide');
      el.removeAttribute('data-bf-ban');
    });
    run();
    [100, 300, 600, 1200].forEach(t => setTimeout(run, t));
  }
  window.addEventListener('popstate', onNav);
  window.addEventListener('hashchange', onNav);
  ['pushState','replaceState'].forEach(fn => {
    const orig = history[fn];
    history[fn] = function (...a) { orig.apply(this, a); onNav(); };
  });
  setInterval(onNav, 400);

  // ── AUTO-SELECT "Veo 3.1 - Fast [Lower Priority]" on load ─────────────────
  function autoSelectLowerPriority() {
    var allButtons = Array.from(document.querySelectorAll('button, div[role="button"], div[role="listbox"]'));
    var modelTrigger = allButtons.find(function(el) {
      var txt = (el.textContent || '').trim();
      return /veo/i.test(txt) && txt.length < 60;
    });
    if (!modelTrigger) return;
    var currentTxt = (modelTrigger.textContent || '').trim();
    if (/lower.{0,5}priority/i.test(currentTxt)) return; // already set
    // Open dropdown
    modelTrigger.click();
    setTimeout(function() {
      var options = Array.from(document.querySelectorAll(
        '[role="option"], [role="menuitem"], [role="listitem"], li, [tabindex="0"]'
      ));
      var lpOption = options.find(function(el) {
        return /lower.{0,5}priority/i.test(el.textContent || '');
      });
      if (lpOption) {
        lpOption.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        lpOption.dispatchEvent(new MouseEvent('mouseup',   { bubbles: true, cancelable: true }));
        lpOption.dispatchEvent(new MouseEvent('click',     { bubbles: true, cancelable: true }));
        lpOption.click();
      } else {
        document.body.click(); // close dropdown if LP not found
      }
    }, 300);
  }

  var _autoSelInterval = setInterval(function() {
    var allEls = Array.from(document.querySelectorAll('button, div[role="button"]'));
    var activeModel = allEls.find(function(el) {
      var txt = (el.textContent || '').trim();
      return /veo/i.test(txt) && txt.length < 60;
    });
    if (activeModel && /lower.{0,5}priority/i.test(activeModel.textContent || '')) {
      clearInterval(_autoSelInterval);
      return;
    }
    autoSelectLowerPriority();
  }, 500);
  setTimeout(function() { clearInterval(_autoSelInterval); }, 30000);

})();