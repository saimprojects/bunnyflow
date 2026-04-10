// BunnyFlow Whisk Session Bridge v1.0 — ISOLATED world, document_idle
// Fetches whisk cookies from BunnyFlow API and sends to background for injection
(function () {
  'use strict';

  var RELOAD_FLAG = '__bf_whisk_reloaded__';
  var RELOAD_TTL  = 15000;

  function inject() {
    var lastReload = Number(localStorage.getItem(RELOAD_FLAG) || 0);
    if (Date.now() - lastReload < RELOAD_TTL) return;

    chrome.storage.local.get(null, function (stored) {
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
      })
        .then(function (resp) { return resp.ok ? resp.json() : null; })
        .then(function (data) {
          if (!data || !data.ok || !data.encryptedCookies) return;
          chrome.runtime.sendMessage({
            type: 'INJECT_WHISK_SESSION',
            encryptedCookies: data.encryptedCookies,
            userId: data.user && data.user.id,
          }, function (response) {
            if (chrome.runtime.lastError) return;
            if (response && response.ok && response.count > 0) {
              try { localStorage.setItem(RELOAD_FLAG, String(Date.now())); } catch (_) {}
              window.location.reload();
            }
          });
        })
        .catch(function () {});
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
