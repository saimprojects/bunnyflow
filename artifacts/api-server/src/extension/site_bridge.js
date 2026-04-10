// BunnyFlow Site Bridge v3.0
// Runs on BunnyFlow platform

const STORAGE_KEY = '__flow_auth__';
const HEARTBEAT_KEY = '__bf_ext_active';
const HEARTBEAT_INTERVAL = 20000; // 20 seconds

// Set extension presence heartbeat so platform knows extension is active
function setHeartbeat() {
  try {
    sessionStorage.setItem(HEARTBEAT_KEY, Date.now().toString());
  } catch(e) {}
}

// Start immediately, then repeat
setHeartbeat();
setInterval(setHeartbeat, HEARTBEAT_INTERVAL);

// Auth bridge: read localStorage auth and send to background script
function syncAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data || !data.userId) return;
    chrome.runtime.sendMessage(
      { type: 'SITE_AUTH', data: { ...data, apiBase: window.location.origin } },
      () => { if (chrome.runtime.lastError) {} }
    );
  } catch(e) {}
}

syncAuth();

// Listen for video open events from platform
window.addEventListener('FLOW_OPEN_VIDEO', (e) => {
  if (e && e.detail && e.detail.url) {
    chrome.runtime.sendMessage(
      { type: 'OPEN_VIDEO', url: e.detail.url },
      () => { if (chrome.runtime.lastError) {} }
    );
  }
});

// Watch DOM for auth changes
const observer = new MutationObserver(() => syncAuth());
observer.observe(document.body, { childList: true, subtree: true });

// Watch localStorage for auth changes
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) syncAuth();
});