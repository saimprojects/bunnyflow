// BunnyFlow Gemini Pro Bridge v1.1
// Runs on gemini.google.com (ISOLATED world) - hides history, locks account, injects session
(function () {
  'use strict';

  // ── CSS: hide conversation history + lock account switcher ──
  const CSS = `
    /* Hide left sidebar / recent conversations history */
    .sSzDzb, .oZcpUe, .side-nav-list,
    [jsname="PkMOVf"], [jsname="dsyhDe"],
    [aria-label="Recent conversations"],
    [aria-label="Hide recent conversations"],
    [data-test-id="history-drawer"],
    .history-drawer, .side-drawer,
    bard-sidenav, bard-side-nav,
    mat-drawer.mat-drawer-side,
    [jscontroller="XD0iqc"],
    c-wiz > div > div.sSzDzb { display: none !important; }

    /* Hide "new chat" / history icon in top bar */
    [mattooltip="Recent conversations"],
    [aria-label="Recent conversations"] { display: none !important; }

    /* Dim + block account switcher (top-right avatar) */
    .gb_d.gb_Ld, .gb_0.gb_Ld, .gb_Ea, .gb_B.gb_Ea,
    [aria-label*="Google Account"],
    .profile-icon, .gb_Ha {
      pointer-events: none !important;
      opacity: 0.35 !important;
      cursor: not-allowed !important;
    }

    /* Unlock all Gemini Pro features - remove any disabled/locked overlays */
    [data-gemini-locked], .upgrade-overlay, .paywall-overlay,
    .upsell-banner, [aria-label*="upgrade"], [aria-label*="Upgrade"] {
      display: none !important;
    }
  `;

  function injectCSS() {
    if (document.getElementById('__bf_gemini_css__')) return;
    const s = document.createElement('style');
    s.id = '__bf_gemini_css__';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  injectCSS();
  new MutationObserver(injectCSS).observe(document.documentElement, { childList: true, subtree: true });

  // ── Session injection ──
  const RELOAD_FLAG = '__bf_gemini_reloaded__';
  const RELOAD_TTL  = 15000;

  async function injectGeminiSession() {
    const lastReload = Number(localStorage.getItem(RELOAD_FLAG) || 0);
    if (Date.now() - lastReload < RELOAD_TTL) return;

    let stored = {};
    try { stored = await new Promise(resolve => chrome.storage.local.get(null, resolve)); } catch (e) { return; }

    const authData = stored['__flow_auth__'] || stored['bf_auth'] || null;
    const apiBase  = stored['bf_api_base']   || 'https://flowbybunny.replit.app';
    if (!authData) return;

    const plan = (authData.plan || 'free').toLowerCase();
    if (plan === 'free') return;

    let token = authData.token || authData.sessionToken || '';
    if (token && token.includes(':')) { token = token.split(':').slice(1).join(':'); }
    if (!token || token.length < 10) return;

    try {
      const resp = await fetch(`${apiBase}/api/user/gemini-cookies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) return;
      const data = await resp.json();
      if (!data.ok || !data.encryptedCookies) return;

      chrome.runtime.sendMessage({
        type: 'INJECT_GEMINI_SESSION',
        encryptedCookies: data.encryptedCookies,
        userId: data.user?.id,
      }, (response) => {
        if (chrome.runtime.lastError) return;
        if (response && response.ok && response.count > 0) {
          try { localStorage.setItem(RELOAD_FLAG, String(Date.now())); } catch(e) {}
          window.location.reload();
        }
      });
    } catch (e) { /* ignore */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectGeminiSession);
  } else {
    injectGeminiSession();
  }
})();
