/**
 * Inkloom AI Chrome Extension - Universal In-Context Governance Engine
 * 
 * Works across all platforms that support text creation (LinkedIn, Canva, Twitter/X,
 * WordPress, Webflow, Medium, Substack, Notion, Google Docs, etc.).
 * 
 * Features:
 * 1. Persistent floating status pill.
 * 2. In-page floating mini-dashboard popup displaying compliance scores & action items.
 * 3. 1-click in-place rewrites that update framework synthetic states (Quill, Draft.js, React).
 * 4. Dual-engine verification: FastAPI RAG + OpenCV backend with instant offline fallback.
 */

(function () {
  console.log("[Inkloom AI] In-context universal brand governance engine initialized.");

  let activeTooltip = null;
  let activePopup = null;
  let currentAuditData = null;
  let activeIssues = [];
  let isAuditing = false;

  // Detect Platform Environment
  function detectPlatform() {
    const host = window.location.hostname.toLowerCase();
    if (host.includes("linkedin.com")) return "LinkedIn";
    if (host.includes("canva.com")) return "Canva";
    if (host.includes("twitter.com") || host.includes("x.com")) return "Twitter / X";
    if (host.includes("webflow.com")) return "Webflow";
    if (host.includes("wordpress") || host.includes("wp-admin")) return "WordPress";
    if (host.includes("medium.com")) return "Medium";
    if (host.includes("substack.com")) return "Substack";
    if (host.includes("notion.so")) return "Notion";
    if (host.includes("docs.google.com") || host.includes("mail.google.com")) return "Google Workspace";
    return "Web CMS";
  }

  // =========================================================================
  // 1. FLOATING ASSISTANT PILL
  // =========================================================================
  function createFloatingPill() {
    if (document.getElementById("inkloom-floating-pill")) return;

    const pill = document.createElement("div");
    pill.id = "inkloom-floating-pill";
    pill.className = "inkloom-floating-pill";
    pill.setAttribute("role", "button");
    pill.setAttribute("aria-label", "Open Inkloom Brand Governance Inspector");
    pill.title = "Click to inspect brand compliance";

    pill.innerHTML = `
      <div class="inkloom-pill-logo">I</div>
      <div class="inkloom-pill-dot" id="inkloom-pill-dot"></div>
      <span class="inkloom-pill-text" id="inkloom-pill-text">Inkloom</span>
      <span class="inkloom-pill-badge" id="inkloom-pill-badge">Audit</span>
    `;

    // Click on pill toggles the in-page dashboard popup
    pill.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleInPagePopup();
    });

    document.body.appendChild(pill);
  }

  function updatePillStatus(status, badgeText) {
    const dot = document.getElementById("inkloom-pill-dot");
    const badge = document.getElementById("inkloom-pill-badge");
    const text = document.getElementById("inkloom-pill-text");
    if (!dot || !badge) return;

    dot.className = "inkloom-pill-dot";
    badge.className = "inkloom-pill-badge";

    if (status === "compliant") {
      dot.classList.add("compliant");
      badge.classList.add("compliant");
      badge.textContent = badgeText || "100%";
      if (text) text.textContent = "On-Brand";
    } else if (status === "flagged" || status === "warning") {
      dot.classList.add(status === "warning" ? "warning" : "flagged");
      badge.classList.add("flagged");
      badge.textContent = badgeText || "Issues";
      if (text) text.textContent = "Inkloom";
    } else if (status === "auditing") {
      badge.textContent = "Scanning...";
    } else {
      badge.textContent = badgeText || "Audit";
      if (text) text.textContent = "Inkloom";
    }
  }

  // =========================================================================
  // 2. IN-PAGE MINI-DASHBOARD POPUP
  // =========================================================================
  function toggleInPagePopup() {
    if (activePopup) {
      closeInPagePopup();
    } else {
      openInPagePopup();
    }
  }

  function closeInPagePopup() {
    if (activePopup) {
      activePopup.remove();
      activePopup = null;
    }
  }

  function openInPagePopup() {
    closeInPagePopup();

    const popup = document.createElement("div");
    popup.id = "inkloom-inpage-popup";
    popup.className = "inkloom-inpage-popup";
    activePopup = popup;

    document.body.appendChild(popup);

    // If we haven't audited yet, or findings are stale, trigger audit
    if (!currentAuditData) {
      runAudit();
    } else {
      renderPopupContents(currentAuditData);
    }
  }

  function renderPopupContents(data) {
    if (!activePopup) return;

    const platform = detectPlatform();
    const score = typeof data.compliance_score === "number" ? data.compliance_score : 100;
    const issues = data.text_evaluations || [];
    const statusClass = score >= 85 ? "compliant" : score >= 70 ? "warning" : "flagged";
    const statusLabel = score >= 85 ? "100% On-Brand" : "Action Required";
    const wordCount = (data.extracted_text || "").split(/\s+/).filter(Boolean).length;

    activePopup.innerHTML = `
      <!-- Header -->
      <div class="inkloom-pop-header">
        <div class="inkloom-pop-title-wrap">
          <div class="inkloom-pill-logo">I</div>
          <div>
            <div class="inkloom-pop-title">Inkloom Governance</div>
          </div>
          <span class="inkloom-pop-platform-chip">${platform}</span>
        </div>
        <div class="inkloom-pop-actions">
          <button class="inkloom-pop-btn-icon" id="inkloom-pop-rescan" title="Re-scan page copy">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
          </button>
          <button class="inkloom-pop-btn-icon" id="inkloom-pop-close" title="Close popup">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Health Score Strip -->
      <div class="inkloom-pop-score-strip">
        <div>
          <div class="inkloom-pop-score-num ${statusClass}">${score}<span style="font-size: 13px; font-weight: 500; color: #94A3B8;">/100</span></div>
          <div class="inkloom-pop-stats">${wordCount} words analyzed • Nexus Cloud</div>
        </div>
        <div class="inkloom-pop-score-meta">
          <span class="inkloom-pop-badge ${statusClass}">${statusLabel}</span>
          <div class="inkloom-pop-stats">${issues.length} ${issues.length === 1 ? 'Finding' : 'Findings'}</div>
        </div>
      </div>

      <!-- Issues List or All Clear -->
      <div class="inkloom-pop-body" id="inkloom-pop-body">
        ${
          issues.length > 0
            ? issues
                .map(
                  (issue, index) => `
            <div class="inkloom-issue-card" data-issue-index="${index}">
              <div class="inkloom-issue-top">
                <div class="inkloom-issue-claim-wrap">
                  <span class="inkloom-issue-claim" title="${escapeHtml(issue.claim)}">"${escapeHtml(issue.claim)}"</span>
                </div>
                <span class="inkloom-issue-sev ${issue.severity || 'warning'}">${(issue.severity || 'warning').toUpperCase()}</span>
              </div>

              <div class="inkloom-issue-desc">${escapeHtml(issue.issue)}</div>
              
              <div class="inkloom-issue-citation">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <span>${escapeHtml(issue.citation || 'Nexus Cloud Brand Guidelines')}</span>
              </div>

              <div class="inkloom-issue-rewrite">
                <div class="inkloom-issue-rewrite-label">Prescriptive Rewrite</div>
                <div class="inkloom-issue-rewrite-text">→ ${escapeHtml(issue.suggested_rewrite)}</div>
              </div>

              <div class="inkloom-issue-actions">
                <button class="inkloom-btn-esc" data-action="escalate" data-index="${index}">Escalate</button>
                <button class="inkloom-btn-fix" data-action="apply" data-index="${index}">1-Click Apply</button>
              </div>
            </div>
          `
                )
                .join("")
            : `
            <div class="inkloom-all-clear">
              <div class="inkloom-all-clear-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div class="inkloom-all-clear-title">All Clear — 100% On-Brand</div>
              <div class="inkloom-all-clear-desc">
                Content complies with Nexus Cloud Golden Facts, verified SLA commitments, and brand voice guidelines.
              </div>
            </div>
          `
        }
      </div>

      <!-- Footer -->
      <div class="inkloom-pop-footer">
        <a href="http://127.0.0.1:8000/" target="_blank" class="inkloom-pop-link" title="Open full React Governance Cockpit">
          <span>Open Admin Console</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </a>
        <span class="inkloom-pop-version">v1.0 • In-Context</span>
      </div>
    `;

    // Hook Close Button
    activePopup.querySelector("#inkloom-pop-close")?.addEventListener("click", (e) => {
      e.stopPropagation();
      closeInPagePopup();
    });

    // Hook Rescan Button
    activePopup.querySelector("#inkloom-pop-rescan")?.addEventListener("click", (e) => {
      e.stopPropagation();
      runAudit();
    });

    // Hook 1-Click Apply and Escalate buttons inside cards
    activePopup.querySelectorAll("button[data-action='apply']").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const index = parseInt(btn.getAttribute("data-index"), 10);
        const issue = issues[index];
        if (issue) {
          executeRewrite(issue.claim, issue.suggested_rewrite);
          // Remove issue from current active state and re-render
          issues.splice(index, 1);
          currentAuditData.text_evaluations = issues;
          currentAuditData.compliance_score = Math.min(100, Math.round(100 - issues.length * 15));
          renderPopupContents(currentAuditData);
          updatePillStatus(issues.length > 0 ? "flagged" : "compliant", issues.length > 0 ? `${issues.length} Flags` : "100%");
        }
      });
    });

    activePopup.querySelectorAll("button[data-action='escalate']").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const index = parseInt(btn.getAttribute("data-index"), 10);
        const issue = issues[index];
        if (issue) {
          escalateIssue(issue);
          btn.textContent = "Escalated ✓";
          btn.style.color = "#10B981";
          btn.style.borderColor = "rgba(16, 185, 129, 0.4)";
        }
      });
    });
  }

  // Close popup on outside click
  document.addEventListener("click", (e) => {
    if (activePopup && !activePopup.contains(e.target) && !e.target.closest("#inkloom-floating-pill")) {
      closeInPagePopup();
    }
  });

  // =========================================================================
  // 3. UNIVERSAL MULTI-PLATFORM CONTENT EXTRACTION
  // =========================================================================
  function extractContent() {
    let extractedText = "";

    // 1. Check user text selection first
    const selection = window.getSelection() ? window.getSelection().toString().trim() : "";
    if (selection && selection.length > 10) {
      extractedText = selection;
    }

    // 2. Check active element if user is currently typing
    if (!extractedText && document.activeElement) {
      const activeEl = document.activeElement;
      if (
        activeEl.isContentEditable ||
        activeEl.tagName === "TEXTAREA" ||
        (activeEl.tagName === "INPUT" && activeEl.type === "text") ||
        activeEl.getAttribute("role") === "textbox"
      ) {
        const text = activeEl.innerText || activeEl.value || "";
        if (text.trim().length > 10) {
          extractedText = text.trim();
        }
      }
    }

    // 3. Comprehensive multi-platform editor selectors (LinkedIn, Canva, WordPress, Webflow, Twitter, etc.)
    if (!extractedText) {
      const universalSelectors = [
        // LinkedIn Post & Messaging
        'div.ql-editor[contenteditable="true"]',
        '.share-creation-state__text-editor [contenteditable="true"]',
        'div.msg-form__contenteditable[contenteditable="true"]',
        'div[data-placeholder][contenteditable="true"]',
        // Canva text items & design inputs
        'div[contenteditable="true"]',
        'textarea[data-testid]',
        '.ProseMirror',
        // Twitter / X compose
        'div[data-testid="tweetTextarea_0"]',
        'div[role="textbox"][contenteditable="true"]',
        // WordPress / Gutenberg / CMS
        '.wp-block-post-content',
        '.editor-styles-wrapper',
        '.block-editor-writing-flow',
        // Webflow Rich Text
        '.w-richtext',
        '[data-automation-id="rich-text"]',
        // Generic contenteditable & forms
        '[contenteditable="true"]',
        '[role="textbox"]',
        'textarea',
        'article',
        'main'
      ];

      for (const selector of universalSelectors) {
        const el = document.querySelector(selector);
        if (el && !el.closest("#inkloom-inpage-popup") && !el.closest("#inkloom-floating-pill")) {
          const text = el.innerText || el.value || "";
          if (text.trim().length > 15) {
            extractedText = text.trim();
            break;
          }
        }
      }
    }

    // 4. Fallback to visible body text paragraphs
    if (!extractedText) {
      const paragraphs = Array.from(document.querySelectorAll("p, h1, h2, h3, h4, li"))
        .filter((el) => !el.closest("#inkloom-inpage-popup") && !el.closest("#inkloom-floating-pill"))
        .map((p) => p.innerText.trim())
        .filter((t) => t.length > 10);
      extractedText = paragraphs.slice(0, 30).join("\n\n");
    }

    // Extract images on page for OpenCV checks
    const imgElements = Array.from(document.querySelectorAll("img[src]")).filter(
      (img) => !img.closest("#inkloom-inpage-popup") && !img.closest("#inkloom-floating-pill")
    );
    const imageUrls = imgElements
      .map((img) => img.currentSrc || img.src)
      .filter((src) => src && (src.startsWith("http") || src.startsWith("data:image")))
      .slice(0, 8);

    return {
      text: extractedText,
      image_urls: imageUrls,
      page_url: window.location.href,
      page_title: document.title,
      platform: detectPlatform()
    };
  }

  // =========================================================================
  // 4. AUDIT EXECUTION WITH LOCAL DETERMINISTIC FALLBACK
  // =========================================================================
  function runAudit() {
    if (isAuditing) return;
    isAuditing = true;
    updatePillStatus("auditing", "Scanning...");

    if (activePopup) {
      const body = activePopup.querySelector("#inkloom-pop-body");
      if (body) {
        body.innerHTML = `
          <div style="padding: 30px 16px; text-align: center; color: #94A3B8; font-size: 12px; display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <div class="inkloom-pill-dot" style="width: 12px; height: 12px; background: #F26A0F; box-shadow: 0 0 12px #F26A0F;"></div>
            <span>Evaluating draft copy against Nexus Cloud Golden Facts...</span>
          </div>
        `;
      }
    }

    const pageData = extractContent();

    // Call background service worker -> FastAPI backend
    chrome.runtime.sendMessage(
      {
        action: "CHECK_CONTENT",
        text: pageData.text,
        image_urls: pageData.image_urls,
        page_url: pageData.page_url,
        channel: pageData.platform.toLowerCase()
      },
      (res) => {
        isAuditing = false;
        if (res && res.success && res.data) {
          handleAuditSuccess(res.data, pageData.text);
        } else {
          // Graceful high-assurance local deterministic evaluation
          const fallbackData = runLocalDeterministicAudit(pageData.text);
          handleAuditSuccess(fallbackData, pageData.text);
        }
      }
    );
  }

  function handleAuditSuccess(auditData, extractedText) {
    auditData.extracted_text = extractedText;
    currentAuditData = auditData;
    activeIssues = auditData.text_evaluations || [];

    highlightIssues(activeIssues);

    const score = typeof auditData.compliance_score === "number" ? auditData.compliance_score : 100;
    const badgeText = activeIssues.length > 0 ? `${activeIssues.length} Flags` : "100%";
    const status = activeIssues.length > 0 ? (score < 70 ? "flagged" : "warning") : "compliant";

    updatePillStatus(status, badgeText);

    if (activePopup) {
      renderPopupContents(currentAuditData);
    }
  }

  // Local deterministic rules engine (Nexus Cloud Golden Facts)
  function runLocalDeterministicAudit(text) {
    const textStr = text || "";
    const findings = [];

    // 1. Outdated $29 Pricing
    if (/\$29(\/mo|\/month)?|29\s?dollars?/i.test(textStr)) {
      findings.push({
        claim: "$29/mo",
        issue: "Outdated pricing claim. Starter tier was updated from legacy $29/mo to $49/mo in Q3 2024.",
        citation: "Pricing Matrix v2.4 (Effective 2026), Section 1",
        suggested_rewrite: "$49/month (or $39/mo billed annually)",
        severity: "high"
      });
    }

    // 2. Non-existent $19 Pricing
    if (/\$19(\/mo|\/month)?/i.test(textStr)) {
      findings.push({
        claim: "$19",
        issue: "Non-existent pricing tier. Nexus Cloud offers free Community edition or $49/mo Starter tier. No $19 plan exists.",
        citation: "Pricing Matrix v2.4 (Effective 2026), Section 1",
        suggested_rewrite: "free Community tier or $49/mo Starter tier",
        severity: "high"
      });
    }

    // 3. Superlative "magic AI"
    if (/\bmagic\s+ai\b/i.test(textStr)) {
      findings.push({
        claim: "magic AI",
        issue: "Banned hype term 'magic AI'. Brand voice requires explainable, deterministic terminology.",
        citation: "Brand Style Guide: Banned Terminology 2026, Section 3",
        suggested_rewrite: "high-confidence AI assistance",
        severity: "warning"
      });
    }

    // 4. Absolute "100% bug free"
    if (/\b100%\s+bug\s+free\b/i.test(textStr)) {
      findings.push({
        claim: "100% bug free",
        issue: "Disallowed compliance guarantee '100% bug free'. Legal risk for unprovable absolutes.",
        citation: "Brand Style Guide: Legal Risk Policy, Section 4",
        suggested_rewrite: "extensively tested and highly reliable",
        severity: "high"
      });
    }

    // 5. Superlative "cheapest"
    if (/\bcheapest\b/i.test(textStr)) {
      findings.push({
        claim: "cheapest",
        issue: "Disallowed superlative 'cheapest'. Violates enterprise brand voice standards.",
        citation: "Brand Style Guide: Banned Terminology & Risk Policy 2026, Section 3",
        suggested_rewrite: "most cost-effective enterprise solution",
        severity: "warning"
      });
    }

    // 6. Absolute "zero risk"
    if (/\bzero\s+risk\b/i.test(textStr)) {
      findings.push({
        claim: "zero risk",
        issue: "Unsubstantiated absolute guarantee 'zero risk'. Creates enterprise liability.",
        citation: "Brand Style Guide: Legal Risk Policy, Section 4",
        suggested_rewrite: "comprehensive risk mitigation",
        severity: "high"
      });
    }

    // 7. Slogan Distortion
    if (/\bvelocity\s+without(\s+precision)?\b/i.test(textStr)) {
      findings.push({
        claim: "velocity without precision",
        issue: "Distorted brand slogan 'velocity without precision'. Contradicts primary brand identity.",
        citation: "Brand Identity Standards v2.4, Section 2",
        suggested_rewrite: "Velocity with Precision",
        severity: "high"
      });
    }

    // 8. Superlative "flawless"
    if (/\bflawless\b/i.test(textStr)) {
      findings.push({
        claim: "flawless",
        issue: "Disallowed hyperbolic superlative 'flawless'. Violates risk mitigation standards.",
        citation: "Brand Style Guide: Banned Terminology 2026, Section 3",
        suggested_rewrite: "rigorous and consistent",
        severity: "warning"
      });
    }

    const score = Math.max(0, 100 - findings.length * 16);
    return {
      status: findings.length === 0 ? "compliant" : score < 70 ? "flagged" : "warning",
      compliance_score: score,
      total_text_issues: findings.length,
      text_evaluations: findings
    };
  }

  // =========================================================================
  // 5. IN-PAGE TEXT HIGHLIGHTING & TOOLTIPS
  // =========================================================================
  function clearHighlights() {
    const marks = document.querySelectorAll(".inkloom-mark");
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        while (mark.firstChild) {
          parent.insertBefore(mark.firstChild, mark);
        }
        parent.removeChild(mark);
      }
    });
    removeTooltip();
  }

  function highlightIssues(evaluations) {
    clearHighlights();
    if (!evaluations || evaluations.length === 0) return;

    const editorRoots = document.querySelectorAll(
      '[contenteditable="true"], .editor-styles-wrapper, .wp-block-post-content, .w-richtext, .ProseMirror, .ql-editor, article, main, body'
    );
    const searchRoot = editorRoots.length > 0 ? editorRoots[0] : document.body;

    evaluations.forEach((issue) => {
      if (!issue.claim) return;
      highlightPhraseInElement(searchRoot, issue);
    });
  }

  function highlightPhraseInElement(root, issue) {
    const phrase = issue.claim;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.textContent || !node.textContent.includes(phrase)) {
          return NodeFilter.FILTER_REJECT;
        }
        if (
          node.parentElement &&
          (node.parentElement.closest(".inkloom-mark") ||
            node.parentElement.closest(".inkloom-floating-pill") ||
            node.parentElement.closest(".inkloom-inpage-popup") ||
            node.parentElement.tagName === "SCRIPT" ||
            node.parentElement.tagName === "STYLE")
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach((node) => {
      const idx = node.textContent.indexOf(phrase);
      if (idx === -1) return;

      const range = document.createRange();
      range.setStart(node, idx);
      range.setEnd(node, idx + phrase.length);

      const mark = document.createElement("span");
      mark.className = `inkloom-mark inkloom-${issue.severity || 'warning'}`;
      mark.dataset.claim = issue.claim;
      mark.dataset.citation = issue.citation;
      mark.dataset.issue = issue.issue;
      mark.dataset.rewrite = issue.suggested_rewrite;
      mark.dataset.severity = issue.severity || "warning";

      mark.addEventListener("mouseenter", () => showTooltip(mark, issue));
      mark.addEventListener("click", (e) => {
        e.stopPropagation();
        showTooltip(mark, issue);
      });

      try {
        range.surroundContents(mark);
      } catch (err) {
        console.warn("[Inkloom] Could not wrap range:", err);
      }
    });
  }

  function showTooltip(mark, issue) {
    removeTooltip();

    const rect = mark.getBoundingClientRect();
    const tooltip = document.createElement("div");
    tooltip.className = "inkloom-tooltip-portal";
    tooltip.id = "inkloom-tooltip-portal";

    tooltip.innerHTML = `
      <div class="inkloom-tooltip-header">
        <span class="inkloom-badge-${issue.severity === 'high' ? 'danger' : 'warning'}">${(issue.severity || 'warning').toUpperCase()} RISK</span>
        <span style="font-size: 11px; color: #94A3B8;">Inkloom Governance</span>
      </div>
      <div class="inkloom-citation-text">${escapeHtml(issue.citation)}</div>
      <div class="inkloom-issue-msg">${escapeHtml(issue.issue)}</div>
      <div class="inkloom-rewrite-container">
        <div class="inkloom-rewrite-label">Prescriptive Rewrite</div>
        <div class="inkloom-rewrite-val">→ ${escapeHtml(issue.suggested_rewrite)}</div>
      </div>
      <div class="inkloom-btn-row">
        <button class="inkloom-escalate-btn" id="inkloom-tooltip-escalate">Escalate</button>
        <button class="inkloom-apply-btn" id="inkloom-tooltip-apply">1-Click Apply</button>
      </div>
    `;

    document.body.appendChild(tooltip);
    const tooltipRect = tooltip.getBoundingClientRect();
    let top = rect.top + window.scrollY - tooltipRect.height - 10;
    if (top < 10) {
      top = rect.bottom + window.scrollY + 10;
    }
    let left = rect.left + window.scrollX + rect.width / 2 - tooltipRect.width / 2;
    if (left < 10) left = 10;

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;

    tooltip.querySelector("#inkloom-tooltip-apply")?.addEventListener("click", (e) => {
      e.stopPropagation();
      executeRewrite(issue.claim, issue.suggested_rewrite);
      removeTooltip();
    });

    tooltip.querySelector("#inkloom-tooltip-escalate")?.addEventListener("click", (e) => {
      e.stopPropagation();
      escalateIssue(issue);
      const btn = e.target;
      btn.textContent = "Escalated ✓";
      btn.style.color = "#10B981";
      setTimeout(removeTooltip, 1200);
    });

    activeTooltip = tooltip;
  }

  function removeTooltip() {
    if (activeTooltip) {
      activeTooltip.remove();
      activeTooltip = null;
    }
  }

  // =========================================================================
  // 6. UNIVERSAL 1-CLICK IN-PLACE REWRITE EXECUTION
  // =========================================================================
  function executeRewrite(claim, rewrite) {
    let replaced = false;

    // A. Check if the element has active focus or selection (Quill / Draft.js / React)
    const active = document.activeElement;
    if (active && (active.isContentEditable || active.tagName === "TEXTAREA" || active.tagName === "INPUT")) {
      const selection = window.getSelection();
      if (selection && selection.toString().includes(claim)) {
        try {
          document.execCommand("insertText", false, rewrite);
          replaced = true;
        } catch {}
      }
    }

    // B. Replace mark node if present
    const marks = Array.from(document.querySelectorAll(".inkloom-mark"));
    const targetMark = marks.find(
      (m) => m.dataset.claim === claim || (m.textContent && m.textContent.includes(claim))
    );

    if (targetMark && targetMark.parentNode) {
      const textNode = document.createTextNode(rewrite);
      const parentEditable = targetMark.closest('[contenteditable="true"], textarea, input') || targetMark.parentNode;
      targetMark.parentNode.replaceChild(textNode, targetMark);

      if (parentEditable) {
        parentEditable.dispatchEvent(new Event("input", { bubbles: true }));
        parentEditable.dispatchEvent(new Event("change", { bubbles: true }));
        parentEditable.classList.add("inkloom-repaired-pulse");
        setTimeout(() => parentEditable.classList.remove("inkloom-repaired-pulse"), 1500);
      }
      replaced = true;
    }

    // C. Deep DOM search across all editable containers
    if (!replaced) {
      const editables = document.querySelectorAll(
        '[contenteditable="true"], textarea, input, .editor-styles-wrapper, .wp-block-post-content, .ql-editor, .ProseMirror, article, main'
      );

      for (const ed of editables) {
        if (ed.isContentEditable && ed.innerText.includes(claim)) {
          ed.innerHTML = ed.innerHTML.replace(claim, rewrite);
          ed.dispatchEvent(new Event("input", { bubbles: true }));
          ed.dispatchEvent(new Event("change", { bubbles: true }));
          ed.classList.add("inkloom-repaired-pulse");
          setTimeout(() => ed.classList.remove("inkloom-repaired-pulse"), 1500);
          replaced = true;
          break;
        } else if (ed.value && ed.value.includes(claim)) {
          ed.value = ed.value.replace(claim, rewrite);
          ed.dispatchEvent(new Event("input", { bubbles: true }));
          ed.dispatchEvent(new Event("change", { bubbles: true }));
          ed.classList.add("inkloom-repaired-pulse");
          setTimeout(() => ed.classList.remove("inkloom-repaired-pulse"), 1500);
          replaced = true;
          break;
        }
      }
    }

    return replaced;
  }

  // =========================================================================
  // 7. REVIEW QUEUE ESCALATION
  // =========================================================================
  function escalateIssue(issue) {
    chrome.runtime.sendMessage({
      action: "ESCALATE_ISSUE",
      payload: {
        excerpt: issue.claim,
        violation: issue.issue,
        citation: issue.citation,
        author: "In-Context Content Creator",
        cms: `${detectPlatform()} Editor`,
        page_url: window.location.href
      }
    });
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

  // =========================================================================
  // 8. POPUP & BACKGROUND MESSAGE DISPATCHER
  // =========================================================================
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "EXTRACT_PAGE_DATA") {
      const data = extractContent();
      sendResponse({ success: true, data });
      return true;
    }

    if (request.action === "HIGHLIGHT_IN_PAGE") {
      highlightIssues(request.evaluations);
      sendResponse({ success: true });
      return true;
    }

    if (request.action === "CLEAR_HIGHLIGHTS") {
      clearHighlights();
      sendResponse({ success: true });
      return true;
    }

    if (request.action === "APPLY_REWRITE") {
      const { claim, rewrite } = request;
      const ok = executeRewrite(claim, rewrite);
      sendResponse({ success: ok });
      return true;
    }
  });

  // Initialize pill on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createFloatingPill);
  } else {
    createFloatingPill();
  }
})();
