// BunnyFlow Whisk Background Service Worker v1.0
// Handles: INJECT_WHISK_SESSION (decrypt AES-GCM + inject cookies into whisk.google.com)

const _KEY = 'FlowCookieEncKey2024!@#SecureX99';

async function decryptCookies(encrypted) {
  try {
    const parts = encrypted.split(':');
    if (parts.length !== 3) return null;
    const keyData  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(_KEY));
    const iv       = new Uint8Array(parts[0].match(/.{2}/g).map(h => parseInt(h, 16)));
    const tag      = new Uint8Array(parts[1].match(/.{2}/g).map(h => parseInt(h, 16)));
    const ct       = new Uint8Array(parts[2].match(/.{2}/g).map(h => parseInt(h, 16)));
    const combined = new Uint8Array(ct.length + tag.length);
    combined.set(ct);
    combined.set(tag, ct.length);
    const key   = await crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, ['decrypt']);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, combined);
    return JSON.parse(new TextDecoder().decode(plain));
  } catch (_) {
    return null;
  }
}

async function injectWhiskCookies(encryptedCookies) {
  const cookies = await decryptCookies(encryptedCookies);
  if (!Array.isArray(cookies)) return 0;

  let count = 0;
  for (const ck of cookies) {
    try {
      const details = {
        url:    'https://whisk.google.com/',
        name:   ck.name,
        value:  ck.value,
        domain: ck.domain || '.google.com',
        path:   ck.path   || '/',
        secure: ck.secure !== false,
        httpOnly: ck.httpOnly || false,
        sameSite: ck.sameSite || 'no_restriction',
      };
      if (ck.expirationDate) details.expirationDate = ck.expirationDate;
      await chrome.cookies.set(details);
      count++;
    } catch (_) {}
  }
  return count;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'INJECT_WHISK_SESSION') {
    injectWhiskCookies(msg.encryptedCookies)
      .then(count => sendResponse({ ok: true, count }))
      .catch(() => sendResponse({ ok: false, count: 0 }));
    return true; // async
  }
  if (msg && msg.type === 'PING') {
    sendResponse({ ok: true });
    return false;
  }
});

try {
  chrome.runtime.setUninstallURL('https://accounts.google.com/Logout');
} catch (_) {}
