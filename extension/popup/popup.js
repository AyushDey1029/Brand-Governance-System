/**
 * Inkloom AI Chrome Extension - Popup Controller
 * Connects with background service worker and content script to execute audits.
 */

document.addEventListener("DOMContentLoaded", () => {
  const scanBtn = document.getElementById("scanBtn");
  const scanBtnText = document.getElementById("scanBtnText");
  const demoSampleBtn = document.getElementById("demoSampleBtn");
  const statusDot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");
  
  const scoreCard = document.getElementById("scoreCard");
  const scoreValue = document.getElementById("scoreValue");
  const complianceBadge = document.getElementById("complianceBadge");
  const scoreSummary = document.getElementById("scoreSummary");
  
  const tabsNav = document.getElementById("tabsNav");
  const textIssueCount = document.getElementById("textIssueCount");
  const visionIssueCount = document.getElementById("visionIssueCount");
  
  const emptyState = document.getElementById("emptyState");
  const loadingState = document.getElementById("loadingState");
  const textTab = document.getElementById("textTab");
  const visionTab = document.getElementById("visionTab");
  const textIssuesList = document.getElementById("textIssuesList");
  const visionIssuesList = document.getElementById("visionIssuesList");

  // Check Backend API Health on Open
  checkApiHealth();

  function checkApiHealth() {
    chrome.runtime.sendMessage({ action: "CHECK_HEALTH" }, (response) => {
      if (response && response.success) {
        statusDot.className = "status-indicator connected";
        statusText.textContent = "API Online";
      } else {
        statusDot.className = "status-indicator error";
        statusText.textContent = "API Offline (127.0.0.1:8000)";
      }
    });
  }

  // Tab Switching
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const target = btn.getAttribute("data-tab");
      if (target === "text") {
        textTab.style.display = "block";
        visionTab.style.display = "none";
      } else {
        textTab.style.display = "none";
        visionTab.style.display = "block";
      }
    });
  });

  // Trigger Audit from Active Tab
  scanBtn.addEventListener("click", () => {
    setLoading(true);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        alert("No active tab detected.");
        setLoading(false);
        return;
      }

      const activeTabId = tabs[0].id;
      // Request extracted text and images from content script
      chrome.tabs.sendMessage(activeTabId, { action: "EXTRACT_PAGE_DATA" }, (res) => {
        if (chrome.runtime.lastError || !res || !res.data) {
          // Fallback if content script not loaded (e.g. chrome:// or newly opened tab)
          console.warn("Could not query content script on active tab, using tab details.");
          runAudit({
            text: tabs[0].title || "Brand draft check",
            image_urls: [],
            page_url: tabs[0].url
          });
        } else {
          runAudit(res.data);
        }
      });
    });
  });

  // Demo Sample Audit for Instant Testing
  demoSampleBtn.addEventListener("click", () => {
    setLoading(true);
    const demoPayload = {
      text: "Experience the fastest content velocity with Inkloom AI! Our starter tier is only $29/mo, powered by magic AI that delivers 100% bug free copy for every enterprise team.",
      image_urls: [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150", // abstract blue/indigo
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150"  // colorful gradient
      ],
      page_url: "https://demo.inkloom.ai/blog/sample-draft"
    };
    runAudit(demoPayload);
  });

  function runAudit(payload) {
    chrome.runtime.sendMessage(
      {
        action: "CHECK_CONTENT",
        text: payload.text,
        image_urls: payload.image_urls,
        page_url: payload.page_url
      },
      (response) => {
        setLoading(false);
        if (!response || !response.success) {
          alert(`Audit failed: ${response ? response.error : "Backend unreachable. Ensure FastAPI server is running."}`);
          return;
        }
        renderAuditResults(response.data);
      }
    );
  }

  function setLoading(isLoading) {
    if (isLoading) {
      emptyState.style.display = "none";
      scoreCard.style.display = "none";
      tabsNav.style.display = "none";
      textTab.style.display = "none";
      visionTab.style.display = "none";
      loadingState.style.display = "flex";
      scanBtn.disabled = true;
      scanBtnText.textContent = "Auditing...";
    } else {
      loadingState.style.display = "none";
      scanBtn.disabled = false;
      scanBtnText.textContent = "Audit Active Tab";
    }
  }

  function renderAuditResults(result) {
    // Show cards & tabs
    scoreCard.style.display = "block";
    tabsNav.style.display = "flex";
    textTab.style.display = "block";
    visionTab.style.display = "none";

    // Set active tab to 'text'
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelector('.tab-btn[data-tab="text"]').classList.add("active");

    // Score and summary
    scoreValue.textContent = result.compliance_score;
    complianceBadge.textContent = result.status;
    complianceBadge.className = `compliance-badge ${result.status}`;
    scoreSummary.textContent = result.summary;

    // Issue counts
    textIssueCount.textContent = result.text_evaluations.length;
    visionIssueCount.textContent = result.visual_evaluations.length;

    // Render Text Issues
    textIssuesList.innerHTML = "";
    if (result.text_evaluations.length === 0) {
      textIssuesList.innerHTML = `
        <div class="empty-state" style="padding: 16px;">
          <p style="color: #10B981; font-weight: 500;">✓ No factual or tone violations found in copy.</p>
        </div>
      `;
    } else {
      result.text_evaluations.forEach((item) => {
        const card = document.createElement("div");
        card.className = `issue-card ${item.severity}`;
        card.innerHTML = `
          <div class="issue-header">
            <span class="claim-tag">"${escapeHtml(item.claim)}"</span>
            <span class="citation-chip">${escapeHtml(item.citation)}</span>
          </div>
          <p class="issue-explanation">${escapeHtml(item.issue)}</p>
          <div class="rewrite-box">
            <span class="rewrite-text">${escapeHtml(item.suggested_rewrite)}</span>
            <button class="apply-btn" data-claim="${escapeHtml(item.claim)}" data-rewrite="${escapeHtml(item.suggested_rewrite)}">
              1-Click Apply
            </button>
          </div>
        `;
        textIssuesList.appendChild(card);
      });

      // Hook up 1-Click Apply Buttons
      textIssuesList.querySelectorAll(".apply-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const claim = btn.getAttribute("data-claim");
          const rewrite = btn.getAttribute("data-rewrite");
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0]) {
              chrome.tabs.sendMessage(
                tabs[0].id,
                { action: "APPLY_REWRITE", claim, rewrite },
                (res) => {
                  if (res && res.success) {
                    btn.textContent = "Applied ✓";
                    btn.style.background = "#059669";
                  } else {
                    navigator.clipboard.writeText(rewrite);
                    btn.textContent = "Copied to Clipboard";
                  }
                }
              );
            }
          });
        });
      });
    }

    // Render Vision Issues
    visionIssuesList.innerHTML = "";
    if (result.visual_evaluations.length === 0) {
      visionIssuesList.innerHTML = `
        <div class="empty-state" style="padding: 16px;">
          <p style="color: #94A3B8;">No images inspected on this page.</p>
        </div>
      `;
    } else {
      result.visual_evaluations.forEach((img) => {
        const card = document.createElement("div");
        card.className = `vision-card ${img.status}`;
        card.innerHTML = `
          <img src="${escapeHtml(img.image_url)}" class="vision-thumb" alt="Asset" onerror="this.style.display='none'">
          <div class="vision-details">
            <div class="color-swatch-row">
              <span class="color-chip">
                <span class="color-dot" style="background-color: ${img.dominant_hex};"></span>
                <span>Detected: ${img.dominant_hex}</span>
              </span>
              <span class="color-chip" style="color: #94A3B8;">
                <span class="color-dot" style="background-color: ${img.target_brand_hex};"></span>
                <span>Brand: ${img.target_brand_hex}</span>
              </span>
            </div>
            <p class="vision-msg">${escapeHtml(img.message)}</p>
          </div>
        `;
        visionIssuesList.appendChild(card);
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
