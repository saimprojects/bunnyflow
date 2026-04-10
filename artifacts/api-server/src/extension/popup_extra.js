// popup_extra.js — plan + days display fix + Whisk tab detection (v3.6.6)
(function(){
  'use strict';

  function getDays(data){
    if (data.daysRemaining != null) return Math.max(0, parseInt(data.daysRemaining));
    if (data.creditsLeft   != null) return Math.max(0, parseInt(data.creditsLeft));
    if (data.credits       != null) return Math.max(0, parseInt(data.credits));
    if (data.planExpiresAt) {
      var ms = new Date(data.planExpiresAt).getTime() - Date.now();
      return Math.max(0, Math.ceil(ms / (1000*60*60*24)));
    }
    return null;
  }

  function showDays(days){
    var el = document.getElementById('credits-left');
    if (el) {
      if (days === null) { el.textContent = '—'; }
      else if (days === 0) { el.textContent = '0'; el.style.color = '#ef4444'; }
      else if (days <= 2) { el.textContent = days; el.style.color = '#f59e0b'; }
      else { el.textContent = days; el.style.color = ''; }
    }
    var pd = document.getElementById('plan-days');
    if (pd) {
      pd.style.display = 'block';
      if (days === null)    { pd.textContent = ''; pd.style.display = 'none'; }
      else if (days === 0)  { pd.textContent = '\u26A0 Plan expired'; pd.style.color = '#ef4444'; }
      else if (days <= 2)   { pd.textContent = '\u26A0 ' + days + ' days left'; pd.style.color = '#f59e0b'; }
      else                  { pd.textContent = '\u23F1 ' + days + ' days left'; pd.style.color = ''; }
    }
  }

  function showPlan(plan){
    if (!plan) return;
    var el = document.getElementById('user-plan');
    if (el) el.textContent = plan.charAt(0).toUpperCase() + plan.slice(1) + ' Plan';
  }

  function applyData(data){
    var days = getDays(data);
    showDays(days);
    if (data.plan) showPlan(data.plan);
  }

  function fetchFresh(apiBase, token){
    var base = apiBase.replace(/\/+$/, '');
    fetch(base + '/api/auth/me', {
      headers: { Authorization: 'Bearer ' + token }
    })
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(resp){
      if (!resp) return;
      var u = (resp.user && typeof resp.user === 'object') ? resp.user : resp;
      applyData(u);
      if (typeof chrome !== 'undefined' && chrome.storage) {
        var patch = {};
        if (u.daysRemaining != null) patch.daysRemaining = u.daysRemaining;
        if (u.credits       != null) patch.credits       = u.credits;
        if (u.plan)                  patch.plan          = u.plan;
        if (u.planExpiresAt)         patch.planExpiresAt = u.planExpiresAt;
        chrome.storage.local.set(patch);
      }
    })
    .catch(function(){});
  }

  function fixFooterLinks(serverUrl) {
    var base = serverUrl ? serverUrl.replace(/\/+$/, '') : '';
    var dash = document.getElementById('footer-dashboard');
    var ext  = document.getElementById('footer-extension');
    if (dash && base) dash.href = base + '/dashboard';
    if (ext  && base) ext.href  = base + '/extension';
  }

  /* ── Site detection: Flow + Whisk ── */
  function isWhiskUrl(url) {
    if (!url) return false;
    return (
      url.indexOf('whisk.google.com') !== -1 ||
      url.indexOf('labs.google/fx/tools/whisk') !== -1 ||
      url.indexOf('labs.google.com/fx/tools/whisk') !== -1 ||
      url.indexOf('/fx/tools/whisk') !== -1
    );
  }

  function isFlowUrl(url) {
    if (!url) return false;
    return (
      url.indexOf('labs.google/fx/tools/flow') !== -1 ||
      url.indexOf('labs.google.com/fx/tools/flow') !== -1 ||
      url.indexOf('labs.google/fx') !== -1
    );
  }

  function updatePageIndicator(url) {
    var pill    = document.getElementById('page-indicator');
    var txt     = document.getElementById('page-text');
    var pillDot = pill ? pill.querySelector('.pill-dot') : null;
    var btn     = document.getElementById('inject-btn');
    if (!pill || !txt) return;

    if (isWhiskUrl(url)) {
      /* ── ON WHISK ── */
      pill.className = 'page-pill whisk';
      pill.style.cssText = 'background:rgba(234,179,8,0.12);border:1px solid rgba(234,179,8,0.3);border-radius:20px;padding:6px 12px;display:flex;align-items:center;gap:7px;width:100%;margin-bottom:8px';
      if (pillDot) pillDot.style.cssText = 'width:7px;height:7px;border-radius:50%;background:#fbbf24;box-shadow:0 0 6px #f59e0b;flex-shrink:0';
      txt.style.cssText = 'font-size:12px;font-weight:700;color:#fbbf24';
      txt.textContent = '\u2728 On Whisk \u2014 Session Active';
      /* Show Re-inject button for Whisk */
      if (btn) {
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
      }
    } else if (isFlowUrl(url)) {
      /* ── ON FLOW — popup.js handles main state, we add emoji ── */
      setTimeout(function() {
        var t = document.getElementById('page-text');
        var p = document.getElementById('page-indicator');
        var d = p ? p.querySelector('.pill-dot') : null;
        if (t && t.textContent && t.textContent.indexOf('Google Flow') !== -1 && t.textContent.indexOf('\uD83C') === -1) {
          t.textContent = '\uD83C\uDFAC ' + t.textContent;
        }
        if (d) d.style.cssText = 'width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 7px #22c55e;flex-shrink:0;animation:pulse 1.5s ease-in-out infinite';
      }, 350);
    } else {
      /* ── NOT ON FLOW OR WHISK ── */
      pill.className = 'page-pill inactive';
      pill.style.cssText = '';
      txt.style.cssText  = '';
      txt.textContent = 'Not on Google Flow / Whisk';
    }
  }

  function checkActiveTab() {
    if (typeof chrome === 'undefined' || !chrome.tabs) return;
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs || !tabs[0]) return;
      updatePageIndicator(tabs[0].url || '');
    });
  }

  function run(){
    if (typeof chrome === 'undefined' || !chrome.storage) return;
    chrome.storage.local.get(null, function(all) {
      applyData(all);

      var apiBase = all.apiBase || all.origin || all.serverUrl || all.baseUrl || all.api_base || '';
      if (apiBase) fixFooterLinks(apiBase);

      var token = all.token || all.session || all.sessionToken || all.authToken || all.jwt;
      if (token && apiBase) {
        setTimeout(function(){ fetchFresh(apiBase, token); }, 300);
      }
    });

    setTimeout(checkActiveTab, 150);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
