// BunnyFlow Watchdog — detects extension removal on Google Flow
// Pings background every 20s. If extension gone → logout from all Google accounts.

const PING_INTERVAL = 20000;
let missedPings = 0;
const MAX_MISSED = 2;

function pingExtension() {
  try {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
      missedPings++;
    } else {
      chrome.runtime.sendMessage({ type: 'PING' }, () => {
        if (chrome.runtime.lastError) {
          missedPings++;
        } else {
          missedPings = 0;
        }
        if (missedPings >= MAX_MISSED) triggerGoogleLogout();
      });
      return;
    }
    if (missedPings >= MAX_MISSED) triggerGoogleLogout();
  } catch(e) {
    missedPings++;
    if (missedPings >= MAX_MISSED) triggerGoogleLogout();
  }
}

function triggerGoogleLogout() {
  window.location.href = 'https://accounts.google.com/Logout';
}

// Wait 10s on first load (grace period) then start pinging
setTimeout(() => {
  pingExtension();
  setInterval(pingExtension, PING_INTERVAL);
}, 10000);