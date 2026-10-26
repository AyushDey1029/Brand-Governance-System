/**
 * Inkloom AI Chrome Extension - Background Service Worker (Manifest V3)
 * Proxies compliance evaluation requests from content scripts / popup to FastAPI backend.
 */

const API_BASE_URL = "http://127.0.0.1:8000";

// Handle messages from Popup and Content Scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "CHECK_HEALTH") {
    fetch(`${API_BASE_URL}/health`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // Keep message channel open for async response
  }

  if (message.action === "CHECK_CONTENT") {
    const payload = {
      text: message.text || "",
      image_urls: message.image_urls || [],
      page_url: message.page_url || "",
      channel: message.channel || "cms",
      brand_id: message.brand_id || "default"
    };

    fetch(`${API_BASE_URL}/api/check-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) throw new Error(`API returned HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        sendResponse({ success: true, data });
      })
      .catch((err) => {
        console.error("[Inkloom Extension] API error:", err);
        sendResponse({ success: false, error: err.message });
      });

    return true; // Keep message channel open for async response
  }

  if (message.action === "ESCALATE_ISSUE") {
    fetch(`${API_BASE_URL}/api/reviews/escalate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.payload || {})
    })
      .then((res) => res.json())
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});
