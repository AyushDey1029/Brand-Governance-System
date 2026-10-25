/**
 * Inkloom AI Chrome Extension - In-Context Content Script
 * Extracts text and images from CMS editors (WordPress, Webflow, Medium, etc.)
 * and renders inline feedback overlays and 1-click rewrites.
 */

(function () {
  console.log("[Inkloom AI] In-context brand governance engine loaded.");

  /**
   * Scans DOM for text content, prioritizing CMS editors and main article blocks.
   */
  function extractContent() {
    let extractedText = "";

    // Priority 1: User selection
    const selection = window.getSelection() ? window.getSelection().toString().trim() : "";
    if (selection && selection.length > 20) {
      extractedText = selection;
    } else {
      // Priority 2: Common CMS rich editors (WordPress Gutenberg, Webflow, Medium, TinyMCE)
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
          if (text.trim().length > 30) {
            extractedText = text.trim();
            break;
          }
        }
      }

      // Priority 3: Fallback to all document paragraphs
      if (!extractedText) {
        const paragraphs = Array.from(document.querySelectorAll("p, h1, h2, h3, h4"))
          .map((p) => p.innerText.trim())
          .filter((t) => t.length > 10);
        extractedText = paragraphs.slice(0, 30).join("\n\n");
      }
    }

    // Extract image URLs
    const imgElements = Array.from(document.querySelectorAll("img[src]"));
    const imageUrls = imgElements
      .map((img) => img.currentSrc || img.src)
      .filter((src) => src && (src.startsWith("http") || src.startsWith("data:image")))
      .slice(0, 10); // Grab up to 10 prominent images

    return {
      text: extractedText,
      image_urls: imageUrls,
      page_url: window.location.href,
      page_title: document.title
    };
  }

  /**
   * Replaces flagged claim with on-brand rewrite in active editable elements.
   */
  function applyRewrite(claim, rewrite) {
    if (!claim || !rewrite) return false;

    // Search active editable elements
    const editables = document.querySelectorAll('[contenteditable="true"], textarea, input[type="text"]');
    for (const el of editables) {
      if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
        if (el.value.includes(claim)) {
          el.value = el.value.replace(claim, rewrite);
          el.dispatchEvent(new Event("input", { bubbles: true }));
          return true;
        }
      } else {
        if (el.innerHTML.includes(claim)) {
          el.innerHTML = el.innerHTML.replace(claim, rewrite);
          el.dispatchEvent(new Event("input", { bubbles: true }));
          return true;
        }
      }
    }

    // Fallback: document body replacement
    if (document.body.innerHTML.includes(claim)) {
      document.body.innerHTML = document.body.innerHTML.replace(claim, rewrite);
      return true;
    }
    return false;
  }

  // Handle messages from Popup or Background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "EXTRACT_PAGE_DATA") {
      const data = extractContent();
      sendResponse({ success: true, data });
      return true;
    }

    if (request.action === "APPLY_REWRITE") {
      const replaced = applyRewrite(request.claim, request.rewrite);
      sendResponse({ success: replaced });
      return true;
    }
  });
})();
