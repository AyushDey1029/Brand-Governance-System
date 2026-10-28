import React, { useState } from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  Zap, 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  RotateCcw, 
  Check, 
  Sparkles,
  Info,
  Clock,
  ExternalLink
} from 'lucide-react';
import './LiveAuditDemo.css';

/**
 * Inkloom AI — Real-Time Evaluation Engine Interactive Demo
 * WCAG AA Compliant (4.5:1 contrast), bidirectional highlight linking,
 * hero score metric with projection, before/after previews, and 1-click batch remediation.
 */
export default function LiveAuditDemo() {
  const [fixedFactual, setFixedFactual] = useState(false);
  const [fixedSuperlative, setFixedSuperlative] = useState(false);
  const [dismissedSuperlative, setDismissedSuperlative] = useState(false);
  const [previewMode, setPreviewMode] = useState('original'); // 'original' | 'fixed'
  const [hoveredFindingId, setHoveredFindingId] = useState(null);
  const [showDemoBadge, setShowDemoBadge] = useState(true);

  // Dynamic score calculation
  const getScore = () => {
    let score = 54;
    if (fixedFactual) score += 26; // 80
    if (fixedSuperlative || dismissedSuperlative) score += 16; // 96
    return Math.min(100, score);
  };

  const currentScore = getScore();

  // Status risk tier
  const getRiskStatus = (score) => {
    if (score < 60) return { label: 'High risk – do not publish', class: 'high-risk', color: '#EF4444' };
    if (score < 85) return { label: 'Needs review', class: 'medium-risk', color: '#F59E0B' };
    return { label: 'Brand safe', class: 'safe-risk', color: '#10B981' };
  };

  const riskStatus = getRiskStatus(currentScore);

  const handleFixFactual = () => setFixedFactual(true);
  const handleFixSuperlative = () => setFixedSuperlative(true);
  const handleDismissSuperlative = () => setDismissedSuperlative(true);

  const handleFixAll = () => {
    setFixedFactual(true);
    setFixedSuperlative(true);
  };

  const handleReset = () => {
    setFixedFactual(false);
    setFixedSuperlative(false);
    setDismissedSuperlative(false);
    setPreviewMode('original');
    setHoveredFindingId(null);
  };

  const remainingIssuesCount = (fixedFactual ? 0 : 1) + (fixedSuperlative || dismissedSuperlative ? 0 : 1);

  return (
    <section id="inspection" className="live-audit-demo-section" aria-labelledby="audit-demo-heading">
      {/* Background Scrim for Contrast Protection */}
      <div className="audit-section-scrim" aria-hidden="true" />

      <div className="audit-shell-container">
        {/* 1. SECTION HEADER */}
        <div className="audit-header-block">
          <div className="audit-pill-badge">
            <span className="pulsing-live-dot" aria-hidden="true" />
            <span>Real-Time Evaluation Engine</span>
          </div>

          <h2 id="audit-demo-heading" className="audit-section-h2">
            How Inkloom catches off-brand violations live
          </h2>

          <p className="audit-section-subtitle">
            Creators receive prescriptive, 1-click rewrites with citations to official SLAs instead of generic rejections.
          </p>

          {/* Value Strip: 3 Proof Points */}
          <div className="audit-value-strip" role="list" aria-label="Key Capabilities">
            <div className="value-strip-item" role="listitem">
              <ShieldCheck size={16} className="value-strip-icon" aria-hidden="true" />
              <span>Catches issues before publish</span>
            </div>
            <span className="value-strip-dot" aria-hidden="true">•</span>
            <div className="value-strip-item" role="listitem">
              <BookOpen size={16} className="value-strip-icon" aria-hidden="true" />
              <span>Cites official SLAs and guardrails</span>
            </div>
            <span className="value-strip-dot" aria-hidden="true">•</span>
            <div className="value-strip-item" role="listitem">
              <Zap size={16} className="value-strip-icon" aria-hidden="true" />
              <span>Fix in one click</span>
            </div>
          </div>
        </div>

        {/* 2. THE DEMO CARD CONTAINER */}
        <div className="audit-card-surface">
          {/* Top-Right Dismissible Demo Tag */}
          {showDemoBadge && (
            <div className="audit-demo-tag" role="status">
              <Sparkles size={13} className="tag-sparkle" aria-hidden="true" />
              <span>Live Interactive Sandbox</span>
              <button 
                type="button" 
                className="tag-dismiss-btn" 
                onClick={() => setShowDemoBadge(false)}
                aria-label="Dismiss demo badge"
              >
                ×
              </button>
            </div>
          )}

          {/* Card Header: Score Hero Metric + Context Metadata */}
          <div className="audit-card-header">
            {/* Left: Prominent Score Block */}
            <div className="score-hero-block">
              <div className="score-metric-group">
                <div 
                  className={`score-big-number ${riskStatus.class}`}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <span className="number-tabular">{currentScore}</span>
                  <span className="number-base">/100</span>
                </div>

                <div className="score-status-meta">
                  <div className={`score-badge ${riskStatus.class}`}>
                    <span className="status-dot" aria-hidden="true" />
                    <span>{riskStatus.label}</span>
                  </div>

                  {currentScore < 96 && (
                    <div className="score-projected-preview" title="Projected score after applying recommended rewrites">
                      <span>Projected after fixes: <strong>96/100</strong></span>
                      <span className="projection-arrow" aria-hidden="true">({currentScore} → 96)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Linear Progress Meter */}
              <div 
                className="score-progress-bar-track" 
                role="progressbar" 
                aria-valuenow={currentScore} 
                aria-valuemin="0" 
                aria-valuemax="100"
                aria-label="Brand Compliance Score"
              >
                <div 
                  className={`score-progress-bar-fill ${riskStatus.class}`}
                  style={{ width: `${currentScore}%` }}
                />
              </div>
            </div>

            {/* Right: Channel Context Chips */}
            <div className="audit-context-chips" aria-label="Draft Target Details">
              <span className="context-chip">Channel: <strong>LinkedIn Ad</strong></span>
              <span className="context-chip">Target: <strong>Nexus Cloud</strong></span>
            </div>
          </div>

          {/* Card Body Grid (1.1fr / 1fr) */}
          <div className="audit-card-body-grid">
            {/* LEFT COLUMN: Draft Panel */}
            <div className="draft-workspace-panel">
              <div className="draft-panel-top-bar">
                <div className="draft-label-meta">
                  <span className="draft-panel-title">Your Draft</span>
                  <span className="draft-counts-chip">23 words · 148 chars</span>
                </div>

                {/* Original vs Fixed Toggle */}
                <div className="draft-view-toggle" role="tablist" aria-label="Draft Version Toggle">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={previewMode === 'original'}
                    className={`toggle-tab-btn ${previewMode === 'original' ? 'active' : ''}`}
                    onClick={() => setPreviewMode('original')}
                  >
                    Original
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={previewMode === 'fixed'}
                    className={`toggle-tab-btn ${previewMode === 'fixed' ? 'active' : ''}`}
                    onClick={() => setPreviewMode('fixed')}
                  >
                    Rewritten Preview
                  </button>
                </div>
              </div>

              {/* Draft Content Box with Linked Highlights */}
              <div className="draft-content-display" tabIndex={0} aria-label="Draft Content">
                {previewMode === 'fixed' ? (
                  /* FULL COMPLIANT VERSION PREVIEW */
                  <p className="draft-text-rendered fixed-preview">
                    Nexus Cloud delivers{' '}
                    <mark className="draft-token-fixed">guaranteed 99.99% multi-region uptime</mark>
                    {' with our '}
                    <span className="draft-token-approved">unbeatable 30% discount</span>
                    {' this quarter. It is the '}
                    <mark className="draft-token-fixed">most cost-optimized</mark>
                    {' cloud infrastructure available!'}
                  </p>
                ) : (
                  /* ACTIVE WORKSPACE WITH NUMBERED HIGHLIGHTS */
                  <p className="draft-text-rendered">
                    Nexus Cloud delivers{' '}
                    {fixedFactual ? (
                      <mark className="draft-token-fixed">
                        guaranteed 99.99% multi-region uptime
                        <span className="token-check-badge" aria-label="Fixed">✓</span>
                      </mark>
                    ) : (
                      <mark 
                        className={`draft-token-critical ${hoveredFindingId === 'fact-1' ? 'token-hovered' : ''}`}
                        onMouseEnter={() => setHoveredFindingId('fact-1')}
                        onMouseLeave={() => setHoveredFindingId(null)}
                      >
                        <span className="token-index-badge critical" aria-hidden="true">①</span>
                        guaranteed 100% uptime
                      </mark>
                    )}
                    {' with our '}
                    <span className="draft-token-neutral">unbeatable 30% discount</span>
                    {' this quarter. It is the '}
                    {fixedSuperlative ? (
                      <mark className="draft-token-fixed">
                        most cost-optimized
                        <span className="token-check-badge" aria-label="Fixed">✓</span>
                      </mark>
                    ) : dismissedSuperlative ? (
                      <span className="draft-token-dismissed">cheapest</span>
                    ) : (
                      <mark 
                        className={`draft-token-warning ${hoveredFindingId === 'rule-2' ? 'token-hovered' : ''}`}
                        onMouseEnter={() => setHoveredFindingId('rule-2')}
                        onMouseLeave={() => setHoveredFindingId(null)}
                      >
                        <span className="token-index-badge warning" aria-hidden="true">②</span>
                        cheapest
                      </mark>
                    )}
                    {' cloud infrastructure available!'}
                  </p>
                )}
              </div>

              {/* Draft Footer: Trust Line & Reset Button */}
              <div className="draft-panel-footer">
                <div className="draft-trust-badge">
                  <Clock size={14} className="trust-icon" aria-hidden="true" />
                  <span>
                    Checked against <strong>14 Golden Facts</strong> + <strong>8 guardrails</strong> in <strong>0.18s</strong>
                  </span>
                </div>

                {(fixedFactual || fixedSuperlative || dismissedSuperlative) && (
                  <button 
                    type="button" 
                    className="draft-reset-btn"
                    onClick={handleReset}
                    aria-label="Reset simulation to initial state"
                  >
                    <RotateCcw size={13} aria-hidden="true" />
                    <span>Reset Simulation</span>
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Findings Panel */}
            <div className="findings-workspace-panel">
              {/* Findings Header with Batch CTA */}
              <div className="findings-panel-header">
                <div className="findings-summary-title">
                  <h3 className="findings-h3">
                    {remainingIssuesCount > 0 ? `${remainingIssuesCount} issues found` : 'All issues resolved'}
                  </h3>
                  {remainingIssuesCount > 0 ? (
                    <span className="findings-severity-counter">
                      {!fixedFactual && <span className="counter-critical">1 critical</span>}
                      {!fixedFactual && (!fixedSuperlative && !dismissedSuperlative) && ' · '}
                      {!fixedSuperlative && !dismissedSuperlative && <span className="counter-warning">1 warning</span>}
                    </span>
                  ) : (
                    <span className="counter-clean">✓ 100% Brand Compliant</span>
                  )}
                </div>

                {remainingIssuesCount > 0 && (
                  <button
                    type="button"
                    className="btn-fix-all-primary"
                    onClick={handleFixAll}
                    aria-label={`Fix all ${remainingIssuesCount} violations in one click`}
                  >
                    <Zap size={15} aria-hidden="true" />
                    <span>Fix all ({remainingIssuesCount})</span>
                  </button>
                )}
              </div>

              {/* Findings Cards List */}
              <ul className="findings-cards-list" aria-label="Detected Policy Violations">
                {/* Finding 1: Critical Factual Inaccuracy */}
                <li 
                  className={`finding-card-item critical ${fixedFactual ? 'resolved' : ''} ${hoveredFindingId === 'fact-1' ? 'hover-linked' : ''}`}
                  onMouseEnter={() => setHoveredFindingId('fact-1')}
                  onMouseLeave={() => setHoveredFindingId(null)}
                >
                  <div className="finding-card-top-row">
                    <div className="finding-title-group">
                      <span className="finding-index-circle critical" aria-hidden="true">①</span>
                      <h4 className="finding-title-text">Incorrect uptime claim</h4>
                    </div>
                    <span className="finding-badge-tag critical">
                      {fixedFactual ? 'Fixed ✓' : 'Critical'}
                    </span>
                  </div>

                  <p className="finding-card-explanation">
                    Contradicts verified SLA agreement. Nexus commitment is 99.99%, not 100%.
                  </p>

                  <div className="finding-impact-hint">
                    <AlertOctagon size={13} className="impact-icon" aria-hidden="true" />
                    <span>Prevents a false SLA claim in a public ad.</span>
                  </div>

                  {/* Before / After Focal Block */}
                  <div className="finding-before-after-box">
                    <div className="before-row">
                      <span className="diff-label">Before:</span>
                      <del className="diff-before-text">guaranteed 100% uptime</del>
                    </div>
                    <div className="after-row">
                      <span className="diff-label">After:</span>
                      <ins className="diff-after-text">guaranteed 99.99% multi-region uptime</ins>
                    </div>
                  </div>

                  {/* Citation Document Link */}
                  <div className="finding-citation-row">
                    <FileText size={13} aria-hidden="true" />
                    <span className="citation-lead">Source:</span>
                    <a 
                      href="#facts" 
                      className="citation-link" 
                      onClick={(e) => e.preventDefault()}
                      title="Inspect ground truth reference doc"
                    >
                      Enterprise SLA Agreement v2026.1
                    </a>
                  </div>

                  {/* Per-Finding Action Buttons */}
                  <div className="finding-card-actions">
                    {fixedFactual ? (
                      <div className="finding-applied-indicator">
                        <Check size={14} aria-hidden="true" />
                        <span>Prescriptive rewrite applied</span>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn-apply-fix"
                          onClick={handleFixFactual}
                          aria-label="Apply fix for incorrect uptime claim"
                        >
                          <span>Apply fix</span>
                          <ArrowRight size={14} aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </div>
                </li>

                {/* Finding 2: Warning Superlative Claim */}
                <li 
                  className={`finding-card-item warning ${fixedSuperlative ? 'resolved' : dismissedSuperlative ? 'dismissed' : ''} ${hoveredFindingId === 'rule-2' ? 'hover-linked' : ''}`}
                  onMouseEnter={() => setHoveredFindingId('rule-2')}
                  onMouseLeave={() => setHoveredFindingId(null)}
                >
                  <div className="finding-card-top-row">
                    <div className="finding-title-group">
                      <span className="finding-index-circle warning" aria-hidden="true">②</span>
                      <h4 className="finding-title-text">Unsupported superlative</h4>
                    </div>
                    <span className="finding-badge-tag warning">
                      {fixedSuperlative ? 'Fixed ✓' : dismissedSuperlative ? 'Dismissed' : 'Warning'}
                    </span>
                  </div>

                  <p className="finding-card-explanation">
                    Superlative claim "cheapest" violates brand guardrail on competitive substantiation.
                  </p>

                  {/* Before / After Focal Block */}
                  <div className="finding-before-after-box">
                    <div className="before-row">
                      <span className="diff-label">Before:</span>
                      <del className="diff-before-text">cheapest</del>
                    </div>
                    <div className="after-row">
                      <span className="diff-label">After:</span>
                      <ins className="diff-after-text">most cost-optimized</ins>
                    </div>
                  </div>

                  {/* Citation Document Link */}
                  <div className="finding-citation-row">
                    <FileText size={13} aria-hidden="true" />
                    <span className="citation-lead">Source:</span>
                    <a 
                      href="#policies" 
                      className="citation-link" 
                      onClick={(e) => e.preventDefault()}
                      title="Inspect policy guideline"
                    >
                      Brand Guardrail #2 (Superlatives & Pricing Claims)
                    </a>
                  </div>

                  {/* Per-Finding Action Buttons */}
                  <div className="finding-card-actions">
                    {fixedSuperlative ? (
                      <div className="finding-applied-indicator">
                        <Check size={14} aria-hidden="true" />
                        <span>Prescriptive rewrite applied</span>
                      </div>
                    ) : dismissedSuperlative ? (
                      <div className="finding-applied-indicator muted">
                        <span>Rule violation dismissed</span>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn-apply-fix"
                          onClick={handleFixSuperlative}
                          aria-label="Apply fix for unsupported superlative"
                        >
                          <span>Apply fix</span>
                          <ArrowRight size={14} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="btn-dismiss-text"
                          onClick={handleDismissSuperlative}
                          aria-label="Dismiss unsupported superlative warning"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

