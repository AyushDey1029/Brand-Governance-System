/**
 * Inkloom AI Chrome Extension - Universal In-Context Governance Engine
 * 
 * Works across all platforms that support text creation:
 * - Social & Publishing: LinkedIn (Posts & Articles), Twitter / X, Medium, Substack
 * - Design & Office: Canva (Text items, ProseMirror), Notion, Google Workspace
 * - CMS & Web: WordPress (Gutenberg), Webflow, standard contenteditable & textareas
 * 
 * Capabilities:
 * 1. Real-time text listening: Points out changes directly onto the text with wavy underlines as you type.
 * 2. In-text hover tooltip: Shows citation, explanation, and 1-Click Apply right on top of the text.
 * 3. Floating Status Pill: Anchored in bottom-right with dynamic pulse and issue counter.
 * 4. In-page Dashboard Popup: Compact mini-cockpit with compliance score, findings, and 1-click rewrites.
 * 5. Isolated editor targeting: Accurately analyzes draft copy without scraping website navigation/page chrome.
 * 6. Dual-engine verification: FastAPI RAG + OpenCV backend with instant high-assurance offline fallback.
 */

(function () {
  console.log("[Inkloom AI] In-context universal brand governance engine initialized.");

  let activeTooltip = null;
  let activePopup = null;
  let currentAuditData = null;
  let activeIssues = [];
  let isAuditing = false;
  let currentTargetEditor = null;
  let realtimeDebounceTimer = null;

  // =========================================================================
  // 1. PLATFORM DETECTION & DRAFT EDITOR TARGETING
  // =========================================================================

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

  // Track the active editor element when the user clicks or types
  function trackEditor(el) {
    if (!el || !(el instanceof Element)) return;
    if (
      el.closest("#inkloom-inpage-popup") ||
      el.closest("#inkloom-floating-pill") ||
      el.closest("#inkloom-tooltip-portal")
    ) {
      return;
    }

    if (
      el.isContentEditable ||
      el.getAttribute("contenteditable") === "true" ||
      el.classList.contains("ProseMirror") ||
      el.classList.contains("ql-editor") ||
      el.getAttribute("role") === "textbox" ||
      el.tagName === "TEXTAREA" ||
      (el.tagName === "INPUT" && el.type === "text")
    ) {
      currentTargetEditor = el;
    } else {
      const parentEditable = el.closest(
        '[contenteditable="true"], .ProseMirror, .ql-editor, [role="textbox"], textarea, [data-slate-editor="true"]'
      );
      if (parentEditable) {
        currentTargetEditor = parentEditable;
      }
    }
  }

  // Find the true content editor on the page (avoiding site headers, navigation, footers)
  function findActiveEditor() {
    // 1. Cached editor from recent user interaction
    if (currentTargetEditor && document.body.contains(currentTargetEditor)) {
      const text = (currentTargetEditor.innerText || currentTargetEditor.value || "").trim();
      if (text.length > 0) return currentTargetEditor;
    }

    // 2. Currently focused element
    const active = document.activeElement;
    if (
      active &&
      active !== document.body &&
      !active.closest("#inkloom-floating-pill") &&
      !active.closest("#inkloom-inpage-popup")
    ) {
      if (
        active.isContentEditable ||
        active.getAttribute("contenteditable") === "true" ||
        active.classList.contains("ProseMirror") ||
        active.tagName === "TEXTAREA" ||
        active.getAttribute("role") === "textbox"
      ) {
        currentTargetEditor = active;
        return active;
      }
    }

    // 3. Platform-specific and universal rich-text editor selectors
    const editorSelectors = [
      // LinkedIn Article Creator & Post Editor
      'div.ProseMirror[contenteditable="true"]',
      'div[data-placeholder="Write here…"]',
      'div.editor-content [contenteditable="true"]',
      'div.editor-content',
      '.share-creation-state__text-editor [contenteditable="true"]',
      'div.ql-editor[contenteditable="true"]',
      'div.msg-form__contenteditable[contenteditable="true"]',
      // Canva
      'div.ProseMirror',
      'div[data-slate-editor="true"]',
      'textarea[data-testid]',
      // Twitter / X
      'div[data-testid="tweetTextarea_0"]',
      'div[role="textbox"][contenteditable="true"]',
      // WordPress / CMS / Webflow
      '#liveEditor',
      '.editor-box',
      '.wp-block-post-content [contenteditable="true"]',
      '.wp-block-post-content',
      '.block-editor-writing-flow',
      '.w-richtext [contenteditable="true"]',
      '.w-richtext',
      // General rich text editors
      'div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"]',
      '[contenteditable="true"]',
      'textarea'
    ];

    for (const sel of editorSelectors) {
      const candidates = Array.from(document.querySelectorAll(sel)).filter(
        (el) =>
          !el.closest("#inkloom-inpage-popup") &&
          !el.closest("#inkloom-floating-pill") &&
          !el.closest("#inkloom-tooltip-portal")
      );

      for (const node of candidates) {
        // Exclude site navigation, global search, header, footer elements
        if (node.closest("nav, header, footer, .global-nav, .nav__container, #global-nav")) continue;
        const text = (node.innerText || node.value || "").trim();
        if (text.length > 5) {
          currentTargetEditor = node;
          return node;
        }
      }
    }

    return null;
  }

  // Extract ONLY draft text and draft images (never scrape website UI logos/avatars)
  function extractContent() {
    let extractedText = "";
    const editor = findActiveEditor();

    // 1. Check user text selection first
    const selection = window.getSelection() ? window.getSelection().toString().trim() : "";
    if (selection && selection.length > 10) {
      extractedText = selection;
    } else if (editor) {
      extractedText = (editor.innerText || editor.value || "").trim();
    }

    // 2. Fallback to visible draft paragraphs if no single editor was matched
    if (!extractedText) {
      const mainContainer = document.querySelector(".cms-container, article, main, [role='main']");
      if (mainContainer) {
        const paragraphs = Array.from(mainContainer.querySelectorAll("p, h1, h2, h3, blockquote"))
          .filter((p) => !p.closest("#inkloom-inpage-popup") && !p.closest("#inkloom-floating-pill"))
          .map((p) => p.innerText.trim())
          .filter((t) => t.length > 10);
        if (paragraphs.length > 0) {
          extractedText = paragraphs.slice(0, 10).join("\n\n");
        }
      }
    }

    // 3. Draft Image extraction: ONLY check images inside the editor or article preview
    // NEVER scrape random webpage header/nav icons or user profile avatars!
    let imageUrls = [];
    if (editor) {
      const editorImgs = Array.from(editor.querySelectorAll("img[src]"));
      imageUrls = editorImgs
        .map((img) => img.currentSrc || img.src)
        .filter((src) => src && (src.startsWith("http") || src.startsWith("data:image")));
    }

    if (imageUrls.length === 0) {
      const draftPreview = document.querySelector(".image-preview img, article figure img, .editor-media img");
      if (draftPreview && draftPreview.src) {
        imageUrls = [draftPreview.currentSrc || draftPreview.src];
      }
    }

    return {
      text: extractedText,
      image_urls: imageUrls,
      page_url: window.location.href,
      page_title: document.title,
      platform: detectPlatform(),
      editorElement: editor
    };
  }

  // =========================================================================
  // 2. FLOATING ASSISTANT PILL
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
  // 3. IN-PAGE MINI-DASHBOARD POPUP
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
    const statusClass = score >= 90 ? "compliant" : score >= 70 ? "warning" : "flagged";
    const statusLabel = score >= 90 ? "100% On-Brand" : `${issues.length} Deviation Require Resolution`;
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
                <div class="inkloom-issue-rewrite-label">Actionable Rewrite Fix</div>
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
                Content strictly complies with Nexus Cloud Golden Facts, verified SLA commitments, and brand standards.
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

    // Hook 1-Click Apply and Escalate buttons
    activePopup.querySelectorAll("button[data-action='apply']").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const index = parseInt(btn.getAttribute("data-index"), 10);
        const issue = issues[index];
        if (issue) {
          executeRewrite(issue.claim, issue.suggested_rewrite);
          issues.splice(index, 1);
          currentAuditData.text_evaluations = issues;
          currentAuditData.compliance_score = calculateScore(issues);
          renderPopupContents(currentAuditData);
          updatePillStatus(
            issues.length > 0 ? "flagged" : "compliant",
            issues.length > 0 ? `${issues.length} Flags` : "100%"
          );
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

  function calculateScore(issues) {
    let score = 100;
    for (const item of issues) {
      if (item.severity === "high") score -= 25;
      else if (item.severity === "warning") score -= 10;
      else score -= 5;
    }
    return Math.max(0, Math.min(100, score));
  }

  // Close popup on outside click
  document.addEventListener("click", (e) => {
    if (activePopup && !activePopup.contains(e.target) && !e.target.closest("#inkloom-floating-pill")) {
      closeInPagePopup();
    }
  });

  // =========================================================================
  // 4. REAL-TIME AUDIT & EVALUATION PIPELINE
  // =========================================================================

  function runAudit(isRealtime = false) {
    if (isAuditing && !isRealtime) return;
    isAuditing = true;

    if (!isRealtime) {
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
    }

    const pageData = extractContent();

    // Query background service worker -> FastAPI backend
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
          // Resilient high-assurance local deterministic evaluation (100% aligned with Creator Studio)
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

    // 1. Immediately highlight violations directly onto the text in the editor!
    highlightIssues(activeIssues);

    // 2. Update status pill
    const score = typeof auditData.compliance_score === "number" ? auditData.compliance_score : 100;
    const badgeText = activeIssues.length > 0 ? `${activeIssues.length} Flag${activeIssues.length > 1 ? 's' : ''}` : "100%";
    const status = activeIssues.length > 0 ? (score < 70 ? "flagged" : "warning") : "compliant";

    updatePillStatus(status, badgeText);

    // 3. Re-render open popup
    if (activePopup) {
      renderPopupContents(currentAuditData);
    }
  }

  // Local deterministic rules engine (Identical to Creator Studio & text_rag.py)
  function runLocalDeterministicAudit(text) {
    const textStr = text || "";
    const lower = textStr.toLowerCase();
    const findings = [];

    // 1. Disallowed comparative superlative 'cheapest' (Matches Image 1 Creator Studio)
    if (/\bcheapest\b/i.test(textStr)) {
      findings.push({
        claim: "cheapest",
        issue: "Disallowed superlative 'cheapest'. Violates enterprise brand voice standards.",
        citation: "Brand Style Guide: Banned Terminology & Risk Policy 2026, Section 3",
        suggested_rewrite: "most cost-effective enterprise solution",
        severity: "warning"
      });
    }

    // 2. SLA Uptime check (guaranteed 100% uptime vs 99.99%)
    if (/guaranteed 100% uptime|100% uptime/i.test(textStr)) {
      const match = textStr.match(/guaranteed 100% uptime|100% uptime/i);
      findings.push({
        claim: match ? match[0] : "guaranteed 100% uptime",
        issue: "Contradicts verified Enterprise SLA agreement. Nexus commitment is 99.99% multi-region uptime, not 100%.",
        citation: "Enterprise SLA Agreement v2026.1, Section 4.2",
        suggested_rewrite: "guaranteed 99.99% multi-region uptime",
        severity: "high"
      });
    }

    // 3. Unverified discount superlative (unbeatable 30% discount)
    if (/unbeatable(\s+30%\s+discount)?/i.test(textStr)) {
      const match = textStr.match(/unbeatable\s+30%\s+discount|unbeatable/i);
      findings.push({
        claim: match ? match[0] : "unbeatable 30% discount",
        issue: "Superlative claim 'unbeatable' violates brand guardrail on competitive substantiation without FTC audit proof. Maximum authorized discount is 20%.",
        citation: "Brand Guardrail #2 (Superlatives & Pricing Claims)",
        suggested_rewrite: "verified 20% tier discount",
        severity: "warning"
      });
    }

    // 4. Outdated legacy $29 Pricing
    if (/\$29(\/mo|\/month)?|29\s?dollars?/i.test(textStr)) {
      findings.push({
        claim: "$29/mo",
        issue: "Outdated pricing claim. Starter tier was updated from legacy $29/mo to $49/mo in Q3 2024.",
        citation: "Pricing Matrix v2.4 (Effective 2026), Section 1",
        suggested_rewrite: "$49/month (or $39/mo billed annually)",
        severity: "high"
      });
    }

    // 5. Non-existent $19 Pricing
    if (/\$19(\/mo|\/month)?/i.test(textStr)) {
      findings.push({
        claim: "$19",
        issue: "Non-existent pricing tier. Nexus Cloud offers free Community edition or $49/mo Starter tier. No $19 plan exists.",
        citation: "Pricing Matrix v2.4 (Effective 2026), Section 1",
        suggested_rewrite: "free Community tier or $49/mo Starter tier",
        severity: "high"
      });
    }

    // 6. Superlative "magic AI"
    if (/\bmagic\s+ai\b/i.test(textStr)) {
      findings.push({
        claim: "magic AI",
        issue: "Banned hype term 'magic AI'. Brand voice requires explainable, deterministic terminology.",
        citation: "Brand Style Guide: Banned Terminology 2026, Section 3",
        suggested_rewrite: "high-confidence AI assistance",
        severity: "warning"
      });
    }

    // 7. Absolute "100% bug free"
    if (/\b100%\s+bug\s+free\b/i.test(textStr)) {
      findings.push({
        claim: "100% bug free",
        issue: "Disallowed compliance guarantee '100% bug free'. Legal risk for unprovable absolutes.",
        citation: "Brand Style Guide: Legal Risk Policy, Section 4",
        suggested_rewrite: "extensively tested and highly reliable",
        severity: "high"
      });
    }

    // 8. Absolute "zero risk"
    if (/\bzero\s+risk\b/i.test(textStr)) {
      findings.push({
        claim: "zero risk",
        issue: "Unsubstantiated absolute guarantee 'zero risk'. Creates enterprise liability.",
        citation: "Brand Style Guide: Legal Risk Policy, Section 4",
        suggested_rewrite: "comprehensive risk mitigation",
        severity: "high"
      });
    }

    // 9. Slogan Distortion
    if (/\bvelocity\s+without(\s+precision)?\b/i.test(textStr)) {
      findings.push({
        claim: "velocity without precision",
        issue: "Distorted brand slogan 'velocity without precision'. Contradicts primary brand identity.",
        citation: "Brand Identity Standards v2.4, Section 2",
        suggested_rewrite: "Velocity with Precision",
        severity: "high"
      });
    }

    // 10. Superlative "flawless"
    if (/\bflawless\b/i.test(textStr)) {
      findings.push({
        claim: "flawless",
        issue: "Disallowed hyperbolic superlative 'flawless'. Violates risk mitigation standards.",
        citation: "Brand Style Guide: Banned Terminology 2026, Section 3",
        suggested_rewrite: "rigorous and consistent",
        severity: "warning"
      });
    }

    const score = calculateScore(findings);
    return {
      status: findings.length === 0 ? "compliant" : score < 70 ? "flagged" : "warning",
      compliance_score: score,
      total_text_issues: findings.length,
      text_evaluations: findings
    };
  }

  // =========================================================================
  // 5. IN-PAGE REAL-TIME TEXT HIGHLIGHTING & TOOLTIPS
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
        parent.normalize();
      }
    });
    removeTooltip();
  }

  function highlightIssues(evaluations) {
    clearHighlights();
    if (!evaluations || evaluations.length === 0) return;

    const editor = findActiveEditor();
    const searchRoot = editor || document.querySelector(
      '.editor-content, .ProseMirror, .wp-block-post-content, .w-richtext, #liveEditor, .editor-box, article, main'
    ) || document.body;

    evaluations.forEach((issue) => {
      if (!issue.claim) return;
      highlightPhraseInElement(searchRoot, issue);
    });
  }

  function highlightPhraseInElement(root, issue) {
    const phrase = issue.claim;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.textContent || !node.textContent.toLowerCase().includes(phrase.toLowerCase())) {
          return NodeFilter.FILTER_REJECT;
        }
        if (
          node.parentElement &&
          (node.parentElement.closest(".inkloom-mark") ||
            node.parentElement.closest(".inkloom-floating-pill") ||
            node.parentElement.closest(".inkloom-inpage-popup") ||
            node.parentElement.closest(".inkloom-tooltip-portal") ||
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
      const nodeTextLower = node.textContent.toLowerCase();
      const idx = nodeTextLower.indexOf(phrase.toLowerCase());
      if (idx === -1) return;

      try {
        // Safe W3C DOM text node splitting
        const matchedNode = node.splitText(idx);
        matchedNode.splitText(phrase.length);

        const mark = document.createElement("span");
        mark.className = `inkloom-mark inkloom-${issue.severity || 'warning'}`;
        mark.dataset.claim = issue.claim;
        mark.dataset.citation = issue.citation;
        mark.dataset.issue = issue.issue;
        mark.dataset.rewrite = issue.suggested_rewrite;
        mark.dataset.severity = issue.severity || "warning";
        mark.textContent = matchedNode.textContent;

        mark.addEventListener("mouseenter", () => showTooltip(mark, issue));
        mark.addEventListener("click", (e) => {
          e.stopPropagation();
          showTooltip(mark, issue);
        });

        matchedNode.parentNode.replaceChild(mark, matchedNode);
      } catch (err) {
        console.warn("[Inkloom] Highlighting failed on node:", err);
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
        <div class="inkloom-rewrite-label">Actionable Rewrite Fix</div>
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

  document.addEventListener("click", (e) => {
    if (activeTooltip && !activeTooltip.contains(e.target) && !e.target.closest(".inkloom-mark")) {
      removeTooltip();
    }
  });

  // =========================================================================
  // 6. REAL-TIME INPUT OBSERVER (Points out changes onto text as you type)
  // =========================================================================

  function scheduleRealtimeAudit() {
    if (realtimeDebounceTimer) clearTimeout(realtimeDebounceTimer);
    realtimeDebounceTimer = setTimeout(() => {
      runAudit(true);
    }, 400); // 400ms debounce
  }

  document.addEventListener("focusin", (e) => {
    trackEditor(e.target);
    scheduleRealtimeAudit();
  }, true);

  document.addEventListener("click", (e) => {
    trackEditor(e.target);
  }, true);

  document.addEventListener("input", (e) => {
    trackEditor(e.target);
    scheduleRealtimeAudit();
  }, true);

  document.addEventListener("keyup", (e) => {
    trackEditor(e.target);
    scheduleRealtimeAudit();
  }, true);

  // =========================================================================
  // 7. UNIVERSAL 1-CLICK IN-PLACE REWRITE EXECUTION
  // =========================================================================

  function executeRewrite(claim, rewrite) {
    let replaced = false;

    // A. Replace mark node directly if present
    const marks = Array.from(document.querySelectorAll(".inkloom-mark"));
    const targetMark = marks.find(
      (m) =>
        m.dataset.claim?.toLowerCase() === claim.toLowerCase() ||
        (m.textContent && m.textContent.toLowerCase().includes(claim.toLowerCase()))
    );

    if (targetMark && targetMark.parentNode) {
      const textNode = document.createTextNode(rewrite);
      const parentEditable =
        targetMark.closest('[contenteditable="true"], textarea, input, .ProseMirror') || targetMark.parentNode;
      targetMark.parentNode.replaceChild(textNode, targetMark);

      if (parentEditable) {
        parentEditable.dispatchEvent(new Event("input", { bubbles: true }));
        parentEditable.dispatchEvent(new Event("change", { bubbles: true }));
        parentEditable.classList.add("inkloom-repaired-pulse");
        setTimeout(() => parentEditable.classList.remove("inkloom-repaired-pulse"), 1500);
      }
      replaced = true;
    }

    // B. Search inside active editor or contenteditable containers
    if (!replaced) {
      const editor = findActiveEditor();
      const editables = editor
        ? [editor]
        : Array.from(
            document.querySelectorAll(
              '[contenteditable="true"], .ProseMirror, textarea, input, .editor-content, #liveEditor, .editor-box'
            )
          );

      for (const ed of editables) {
        const regex = new RegExp(claim.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "i");
        if (ed.isContentEditable && regex.test(ed.innerText || ed.innerHTML)) {
          ed.innerHTML = ed.innerHTML.replace(regex, rewrite);
          ed.dispatchEvent(new Event("input", { bubbles: true }));
          ed.dispatchEvent(new Event("change", { bubbles: true }));
          ed.classList.add("inkloom-repaired-pulse");
          setTimeout(() => ed.classList.remove("inkloom-repaired-pulse"), 1500);
          replaced = true;
          break;
        } else if (ed.value && regex.test(ed.value)) {
          ed.value = ed.value.replace(regex, rewrite);
          ed.dispatchEvent(new Event("input", { bubbles: true }));
          ed.dispatchEvent(new Event("change", { bubbles: true }));
          ed.classList.add("inkloom-repaired-pulse");
          setTimeout(() => ed.classList.remove("inkloom-repaired-pulse"), 1500);
          replaced = true;
          break;
        }
      }
    }

    // Immediately trigger a real-time re-audit pass to refresh highlights and score
    scheduleRealtimeAudit();

    return replaced;
  }

  // =========================================================================
  // 8. REVIEW QUEUE ESCALATION
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
  // 9. POPUP & BACKGROUND MESSAGE DISPATCHER
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

  // Initialize on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      createFloatingPill();
      scheduleRealtimeAudit();
    });
  } else {
    createFloatingPill();
    scheduleRealtimeAudit();
  }
})();
