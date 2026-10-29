import React, { useState } from 'react';
import { 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Shield, 
  Zap, 
  Eye, 
  FileText, 
  Layers, 
  RefreshCw,
  FolderOpen,
  Globe
} from 'lucide-react';
import './ExtensionShowcase.css';

export default function ExtensionShowcase() {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <section className="extension-showcase-section" id="extension">
      <div className="extension-showcase-container">
        
        {/* 1. Header */}
        <div className="extension-header">
          <div className="extension-pill-tag">
            <Globe size={14} />
            <span>Chrome Extension (Manifest V3)</span>
          </div>

          <h2 className="extension-title">
            In-Context Brand Governance <span className="extension-title-gradient">Inside Any Web Editor</span>
          </h2>

          <p className="extension-subtitle">
            Audit copy and visual claims directly inside LinkedIn, Canva, WordPress, Medium, and Webflow against enterprise Golden Facts in real time — with zero context switching.
          </p>
        </div>

        {/* 2. Primary Download Hero Box */}
        <div className="extension-download-card">
          <div className="download-info-block">
            <div className="download-icon-box">
              <Download size={28} />
            </div>
            <div className="download-text-meta">
              <h3>Inkloom AI Browser Extension</h3>
              <p>
                Manifest V3 package for Google Chrome & Chromium browsers. Evaluates SLA claims, prohibited superlatives, and outdated pricing matrices in 0ms.
              </p>
              <div className="download-badge-row">
                <span className="download-badge accent">v1.0.0 Stable</span>
                <span className="download-badge">24 KB Zip</span>
                <span className="download-badge">Zero Setup</span>
                <span className="download-badge">Local & Private</span>
              </div>
            </div>
          </div>

          <div className="download-buttons-group">
            <a 
              href="/inkloom-extension.zip" 
              download="inkloom-extension.zip"
              className="btn-download-primary"
            >
              <Download size={18} />
              <span>Download Extension (.zip)</span>
            </a>

            <a 
              href="/test-draft" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-download-secondary"
            >
              <span>Test In-Context CMS</span>
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {/* 3. Four Feature Highlights */}
        <div className="extension-features-grid">
          <div className="feature-glass-card">
            <div className="feature-icon-tile">
              <Eye size={22} />
            </div>
            <h4>Non-Destructive Highlights</h4>
            <p>
              Sub-pixel wavy underlines placed on a fixed viewport overlay. Zero DOM tampering — 100% immune to ProseMirror and Draft.js editor resets.
            </p>
          </div>

          <div className="feature-glass-card">
            <div className="feature-icon-tile">
              <Zap size={22} />
            </div>
            <h4>0ms Deterministic Audit</h4>
            <p>
              Instant local client-side evaluation against Nexus Cloud Golden Facts, pricing tiers, and banned hype terms with zero network latency.
            </p>
          </div>

          <div className="feature-glass-card">
            <div className="feature-icon-tile">
              <Layers size={22} />
            </div>
            <h4>Universal Platform Support</h4>
            <p>
              Works automatically across LinkedIn (Posts & Articles), Canva, Twitter/X, WordPress Gutenberg, Substack, Medium, and custom web CMSs.
            </p>
          </div>

          <div className="feature-glass-card">
            <div className="feature-icon-tile">
              <FileText size={22} />
            </div>
            <h4>1-Click In-Place Fixes</h4>
            <p>
              Click any underline marker or the floating assistant pill to view citations, apply approved brand rewrites, or escalate to the Review Queue.
            </p>
          </div>
        </div>

        {/* 4. Pure Written Step-by-Step Installation Instructions (NO Video, NO GIF) */}
        <div className="instructions-wrapper">
          <div className="instructions-header">
            <h3>How to Install the Extension in Google Chrome</h3>
            <p>
              Follow these simple step-by-step written instructions to install and run the extension locally in less than 60 seconds.
            </p>
          </div>

          <div className="steps-list">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-number-badge">1</div>
              <div className="step-content">
                <h5>
                  <span>Download and Unzip the Extension Package</span>
                </h5>
                <p>
                  Click the <strong>Download Extension (.zip)</strong> button above to save <code>inkloom-extension.zip</code> to your computer. Extract the contents to an easily accessible folder (for example, on your Desktop or in your Documents folder).
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-number-badge">2</div>
              <div className="step-content">
                <h5>
                  <span>Open Chrome's Extensions Manager</span>
                </h5>
                <p>
                  Open a new tab in Google Chrome, type or paste the following into your address bar, and press Enter:
                </p>
                <div className="code-pill">
                  <span>chrome://extensions</span>
                  <button 
                    type="button" 
                    className="copy-mini-btn" 
                    onClick={handleCopyUrl}
                    title="Copy URL"
                  >
                    {copiedUrl ? <CheckCircle2 size={13} color="#4ADE80" /> : <Copy size={13} />}
                  </button>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginLeft: '12px' }}>
                  {copiedUrl ? 'Copied to clipboard!' : '(or click Chrome Menu ⋮ → Extensions → Manage Extensions)'}
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-number-badge">3</div>
              <div className="step-content">
                <h5>
                  <span>Enable Developer Mode</span>
                </h5>
                <p>
                  In the top-right corner of the Extensions page, switch the <strong>Developer mode</strong> toggle to <strong>ON</strong>. This reveals the unpacked extension loading toolbar.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="step-card">
              <div className="step-number-badge">4</div>
              <div className="step-content">
                <h5>
                  <span>Click "Load Unpacked" and Select Folder</span>
                </h5>
                <p>
                  Click the <strong>Load unpacked</strong> button in the top-left toolbar. In the file picker dialog, select the unzipped <code>extension</code> folder (the directory containing <code>manifest.json</code>).
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="step-card">
              <div className="step-number-badge">5</div>
              <div className="step-content">
                <h5>
                  <span>Open Any Editor and Start Creating</span>
                </h5>
                <p>
                  The <strong>Inkloom AI</strong> extension is now active! Navigate to LinkedIn, Canva, WordPress, or our simulated <a href="/test-draft" target="_blank" rel="noopener noreferrer" style={{ color: '#FFB067', textDecoration: 'underline' }}>In-Context CMS Draft</a>. The floating orange Inkloom assistant pill appears automatically in the bottom-right corner, highlighting non-compliant claims in real time.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Support & Maintenance Notice */}
          <div className="extension-notice-bar">
            <RefreshCw size={18} className="notice-icon" />
            <div>
              <strong>Developer Tip:</strong> When making updates to extension code or pulling new changes, go back to <code>chrome://extensions</code>, click the circular <strong>Reload</strong> icon on the Inkloom extension card, and refresh your web page tab to apply the updates.
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
