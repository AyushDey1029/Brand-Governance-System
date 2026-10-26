/**
 * Inkloom AI Chrome Extension - In-Context Content Engine
 * Injects a floating governance assistant, highlights flagged claims with wavy underlines,
 * displays inline hover tooltips with citations, and executes 1-click in-place rewrites.
 */

(function () {
  console.log("[Inkloom AI] In-context brand governance engine loaded.");

  let activeTooltip = null;
  let activeIssues = [];

  // 1. Initialize Floating Assistant Pill
  function createFloatingPill() {
    if (document.getElementById("inkloom-floating-pill")) return;

    const pill = document.createElement("div");
    pill.id = "inkloom-floating-pill";
    pill.className = "inkloom-floating-pill";
    pill.innerHTML = `
      <div class="inkloom-pill-dot" id="inkloom-pill-dot"></div>
      <span class="inkloom-pill-text" id="inkloom-pill-text">Inkloom AI</span>
      <span class="inkloom-pill-badge" id="inkloom-pill-badge">Audit</span>
    `;

    pill.addEventListener("click", () => {
      // Trigger audit via background
      updatePillStatus("auditing", "Scanning...");
      const pageData = extractContent();
      chrome.runtime.sendMessage(
        {
          action: "CHECK_CONTENT",
          text: pageData.text,
          image_urls: pageData.image_urls,
          page_url: pageData.page_url
        },
        (res) => {
          if (res && res.success && res.data) {
            highlightIssues(res.data.text_evaluations);
            updatePillStatus(res.data.status, `${res.data.compliance_score}%`);
          } else {
            updatePillStatus("idle", "API Offline");
          }
        }
      );
    });

    document.body.appendChild(pill);
  }

  function updatePillStatus(status, text) {
    const dot = document.getElementById("inkloom-pill-dot");
    const label = document.getElementById("inkloom-pill-text");
    const badge = document.getElementById("inkloom-pill-badge");
    if (!dot || !badge) return;

    if (status === "compliant") {
      dot.className = "inkloom-pill-dot compliant";
      badge.textContent = text || "100%";
      label.textContent = "On-Brand";
    } else if (status === "flagged" || status === "warning") {
      dot.className = "inkloom-pill-dot flagged";
      badge.textContent = text || "Issues";
      label.textContent = "Inkloom AI";
    } else {
      dot.className = "inkloom-pill-dot";
      badge.textContent = text || "Audit";
      label.textContent = "Inkloom AI";
    }
  }

  // 2. Safe DOM Text Content Extraction
  function extractContent() {
    let extractedText = "";

    const selection = window.getSelection() ? window.getSelection().toString().trim() : "";
    if (selection && selection.length > 20) {
      extractedText = selection;
    } else {
      const editorSelectors = [
        '[contenteditable="true"]',
        '.editor-styles-wrapper',
        '.wp-block-post-content',
        '.ProseMirror',
        '.w-richtext',
        'article',
        'main',
        'textarea'
      ];

      for (const selector of editorSelectors) {
        const el = document.querySelector(selector);
        if (el) {
          const text = el.innerText || el.value || "";
          if (text.trim().length > 20) {
            extractedText = text.trim();
            break;
          }
        }
      }

      if (!extractedText) {
        const paragraphs = Array.from(document.querySelectorAll("p, h1, h2, h3, h4"))
          .map((p) => p.innerText.trim())
          .filter((t) => t.length > 10);
        extractedText = paragraphs.slice(0, 30).join("\n\n");
      }
    }

    const imgElements = Array.from(document.querySelectorAll("img[src]"));
    const imageUrls = imgElements
      .map((img) => img.currentSrc || img.src)
      .filter((src) => src && (src.startsWith("http") || src.startsWith("data:image")))
      .slice(0, 10);

    return {
      text: extractedText,
      image_urls: imageUrls,
      page_url: window.location.href,
      page_title: document.title
    };
  }

  // 3. In-Page Text Highlighting using TreeWalker
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
    if (!evaluations || evaluations.length === 0) {
      clearHighlights();
      updatePillStatus("compliant", "100%");
      return;
    }

    clearHighlights();
    activeIssues = evaluations;
    updatePillStatus("flagged", `${evaluations.length} Flag${evaluations.length > 1 ? 's' : ''}`);

    const editorRoots = document.querySelectorAll(
      '[contenteditable="true"], .editor-styles-wrapper, .wp-block-post-content, .w-richtext, article, main, body'
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
        if (node.parentElement && (node.parentElement.closest(".inkloom-mark") || node.parentElement.closest(".inkloom-floating-pill") || node.parentElement.tagName === "SCRIPT" || node.parentElement.tagName === "STYLE")) {
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
      mark.className = `inkloom-mark inkloom-${issue.severity}`;
      mark.dataset.claim = issue.claim;
      mark.dataset.citation = issue.citation;
      mark.dataset.issue = issue.issue;
      mark.dataset.rewrite = issue.suggested_rewrite;
      mark.dataset.severity = issue.severity;

      // Event listeners for Tooltip
      mark.addEventListener("mouseenter", (e) => showTooltip(mark, issue));
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

  // 4. In-Page Interactive Tooltip
  function showTooltip(mark, issue) {
    removeTooltip();

    const rect = mark.getBoundingClientRect();
    const tooltip = document.createElement("div");
    tooltip.className = "inkloom-tooltip-portal";
    tooltip.id = "inkloom-tooltip-portal";

    tooltip.innerHTML = `
      <div class="inkloom-tooltip-header">
        <span class="inkloom-badge-danger">${issue.severity.toUpperCase()} RISK</span>
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

    // Position tooltip above the mark
    document.body.appendChild(tooltip);
    const tooltipRect = tooltip.getBoundingClientRect();
    let top = rect.top + window.scrollY - tooltipRect.height - 10;
    if (top < 10) {
      top = rect.bottom + window.scrollY + 10; // place below if off top
    }
    let left = rect.left + window.scrollX + (rect.width / 2) - (tooltipRect.width / 2);
    if (left < 10) left = 10;

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;

    // Hook Apply Button
    tooltip.querySelector("#inkloom-tooltip-apply").addEventListener("click", (e) => {
      e.stopPropagation();
      executeRewriteOnMark(mark, issue.suggested_rewrite);
      removeTooltip();
    });

    // Hook Escalate Button
    tooltip.querySelector("#inkloom-tooltip-escalate").addEventListener("click", (e) => {
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

  // 5. In-Place Safe Rewrite & Green Flash
  function executeRewriteOnMark(mark, rewrite) {
    const parentEditable = mark.closest('[contenteditable="true"], textarea, input') || mark.parentNode;
    const textNode = document.createTextNode(rewrite);

    // Replace mark with text node
    mark.parentNode.replaceChild(textNode, mark);

    // Trigger input event so React/Vue/Gutenberg catches the change
    if (parentEditable) {
      parentEditable.dispatchEvent(new Event("input", { bubbles: true }));
      parentEditable.classList.add("inkloom-repaired-pulse");
      setTimeout(() => parentEditable.classList.remove("inkloom-repaired-pulse"), 1500);
    }

    // Refresh remaining highlights
    const remaining = document.querySelectorAll(".inkloom-mark").length;
    updatePillStatus(remaining > 0 ? "flagged" : "compliant", remaining > 0 ? `${remaining} Flags` : "100%");
  }

  function escalateIssue(issue) {
    chrome.runtime.sendMessage({
      action: "ESCALATE_ISSUE",
      payload: {
        excerpt: issue.claim,
        violation: issue.issue,
        citation: issue.citation,
        author: "In-Context CMS Creator",
        cms: document.title || "Web CMS Post",
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

  // Handle messages from Extension Popup
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
      let applied = false;

      // 1. Look for matching highlight mark in DOM
      const marks = Array.from(document.querySelectorAll(".inkloom-mark"));
      const targetMark = marks.find(
        (m) => m.dataset.claim === claim || (m.textContent && m.textContent.includes(claim))
      );

      if (targetMark) {
        executeRewriteOnMark(targetMark, rewrite);
        applied = true;
      } else {
        // 2. Look for claim inside editable fields or article containers
        const editables = document.querySelectorAll(
          '[contenteditable="true"], textarea, input, .editor-styles-wrapper, article, main'
        );
        for (const ed of editables) {
          if (ed.isContentEditable && ed.innerText.includes(claim)) {
            ed.innerHTML = ed.innerHTML.replace(claim, rewrite);
            ed.dispatchEvent(new Event("input", { bubbles: true }));
            ed.classList.add("inkloom-repaired-pulse");
            setTimeout(() => ed.classList.remove("inkloom-repaired-pulse"), 1500);
            applied = true;
            break;
          } else if (ed.value && ed.value.includes(claim)) {
            ed.value = ed.value.replace(claim, rewrite);
            ed.dispatchEvent(new Event("input", { bubbles: true }));
            ed.classList.add("inkloom-repaired-pulse");
            setTimeout(() => ed.classList.remove("inkloom-repaired-pulse"), 1500);
            applied = true;
            break;
          }
        }
      }

      sendResponse({ success: applied });
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
