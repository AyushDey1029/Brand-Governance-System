import React, { useState } from 'react';
import { 
  Shield, 
  CheckCircle, 
  Database, 
  Eye, 
  Lock, 
  Zap, 
  ArrowRight, 
  ExternalLink, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  Layers, 
  Users, 
  Building2, 
  Crown,
  PenTool,
  RefreshCw,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage({ onEnterDemo, apiStatus }) {
  const { user, isAdmin, openLoginModal, openSignUpModal, loginAsDemo, logout } = useAuth();
  // Interactive Live Inspection State
  const [draftText, setDraftText] = useState(
    "Nexus Cloud delivers guaranteed 100% uptime with our unbeatable 30% discount this quarter. It is the cheapest cloud infrastructure available!"
  );
  const [complianceScore, setComplianceScore] = useState(54);
  const [fixedFactual, setFixedFactual] = useState(false);
  const [fixedSuperlative, setFixedSuperlative] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  const handleFixFactual = () => {
    if (fixedFactual) return;
    setDraftText((prev) => 
      prev.replace("guaranteed 100% uptime", "guaranteed 99.99% multi-region uptime")
    );
    setFixedFactual(true);
    setComplianceScore((prev) => Math.min(100, prev + 26));
    triggerPulse();
  };

  const handleFixSuperlative = () => {
    if (fixedSuperlative) return;
    setDraftText((prev) => 
      prev.replace("cheapest", "most cost-optimized")
    );
    setFixedSuperlative(true);
    setComplianceScore((prev) => Math.min(100, prev + 18));
    triggerPulse();
  };

  const triggerPulse = () => {
    setPulseAnimation(true);
    setTimeout(() => setPulseAnimation(false), 1200);
  };

  const handleResetDemo = () => {
    setDraftText(
      "Nexus Cloud delivers guaranteed 100% uptime with our unbeatable 30% discount this quarter. It is the cheapest cloud infrastructure available!"
    );
    setComplianceScore(54);
    setFixedFactual(false);
    setFixedSuperlative(false);
  };

  return (
    <div className="landing-page-wrapper">
      {/* 1. TOP NAVBAR */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          {/* Brand Logo */}
          <div className="landing-brand-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="landing-logo-icon">
              <Shield size={20} color="#FFFFFF" />
            </div>
            <div className="landing-logo-text">
              <span className="brand-name">Inkloom</span>
              <span className="brand-tagline">AUTONOMOUS BRAND GOVERNANCE</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="landing-nav-links">
            <a href="#architecture">Architecture</a>
            <a href="#inspection">Live Inspection</a>
            <a href="#workflows">Role Workflows</a>
          </div>

          {/* Actions */}
          <div className="landing-nav-actions">
            {/* Live API Telemetry Pill */}
            <div className="landing-telemetry-badge">
              <span className={`telemetry-dot ${apiStatus.connected ? 'online' : 'offline'}`} />
              <span className="telemetry-text">
                {apiStatus.connected ? 'API Online' : 'API Offline'}
              </span>
            </div>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="landing-user-badge">
                  <div className={`landing-user-avatar ${isAdmin ? 'admin' : ''}`}>
                    {(user.fullName || user.email || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <span className="landing-user-name">{user.fullName || user.email}</span>
                  <span className={`landing-user-role ${isAdmin ? 'admin' : ''}`}>
                    {isAdmin ? '👑 Brand Admin' : 'Creator'}
                  </span>
                </div>
                <button 
                  className="landing-enter-demo-btn"
                  onClick={onEnterDemo}
                >
                  <span>Open Workspace</span>
                  <ArrowRight size={15} />
                </button>
                <button 
                  className="landing-creator-login-btn"
                  onClick={logout}
                  title="Sign Out / Log Out of Account"
                >
                  <LogOut size={13} />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  className="landing-creator-login-btn"
                  onClick={() => openLoginModal('creator')}
                  title="Sign In (Choose Creator or Company Admin)"
                >
                  <User size={14} />
                  <span>Sign In</span>
                </button>

                <button 
                  className="landing-enter-demo-btn"
                  onClick={() => {
                    loginAsDemo('creator');
                    onEnterDemo();
                  }}
                  title="Launch Instant Demo"
                >
                  <span>Explore Demo</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="landing-hero-section">
        {/* Ambient Top Glow */}
        <div className="hero-ambient-glow" />

        <div className="hero-content-container">
          {/* Top Pill Badge */}
          <div className="hero-tech-badge">
            <Sparkles size={14} color="#F97316" />
            <span>Enterprise Multi-Tenant AI Platform</span>
            <span className="badge-divider">•</span>
            <span className="tech-chip">pgvector + Split-Vision CV</span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-headline">
            Content velocity without{' '}
            <span className="hero-gradient-text">brand risk.</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subheadline">
            Eliminate manual review bottlenecks. Inkloom audits marketing drafts and creative imagery 
            in real time against approved <strong>Golden Facts</strong>, <strong>prohibited claims</strong>, 
            and <strong>exact visual brand tokens</strong> directly inside creator workflows.
          </p>

          {/* CTAs */}
          <div className="hero-cta-group">
            {user ? (
              <>
                <button 
                  className="cta-primary-glow" 
                  onClick={onEnterDemo}
                >
                  <span>Open Workspace ({user.fullName ? user.fullName.split(' ')[0] : 'Creator'})</span>
                  <ArrowRight size={16} />
                </button>
                <button 
                  className="cta-secondary-glass"
                  onClick={logout}
                  style={{ cursor: 'pointer' }}
                >
                  <LogOut size={15} color="#FED7AA" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  className="cta-primary-glow" 
                  onClick={() => {
                    loginAsDemo();
                    onEnterDemo();
                  }}
                >
                  <span>Launch Live Workspace Demo</span>
                  <ArrowRight size={16} />
                </button>
                <button 
                  className="cta-secondary-glass"
                  onClick={openSignUpModal}
                  style={{ cursor: 'pointer' }}
                >
                  <User size={15} color="#FED7AA" />
                  <span>Create Creator Account</span>
                </button>
              </>
            )}

            <a 
              href="/test-draft" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="cta-secondary-glass"
            >
              <span>Try In-Context CMS Draft</span>
              <ExternalLink size={15} color="#94A3B8" />
            </a>
          </div>

          {/* 4 Technical Pillar Cards */}
          <div className="hero-pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon-box" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#FB923C' }}>
                <Database size={20} />
              </div>
              <h4>Grounded Citations</h4>
              <p>Zero hallucinated policy flags. Every violation cites approved enterprise ground truth.</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-box" style={{ background: 'rgba(234, 88, 12, 0.15)', color: '#F97316' }}>
                <Eye size={20} />
              </div>
              <h4>Split-Vision CV</h4>
              <p>OpenCV deterministic hex delta math paired with Gemini multimodal aesthetic judging.</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
                <Lock size={20} />
              </div>
              <h4>Tenant Isolation</h4>
              <p>Brand-partitioned pgvector vector stores ensuring strict organizational safety.</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon-box" style={{ background: 'rgba(254, 215, 170, 0.15)', color: '#FED7AA' }}>
                <Zap size={20} />
              </div>
              <h4>Chrome MV3 Sidepanel</h4>
              <p>Audits inside LinkedIn, WordPress, and Webflow without switching contexts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE LIVE INSPECTION SECTION */}
      <section id="inspection" className="landing-section inspection-section">
        <div className="section-header-block">
          <div className="section-pill-tag">
            <span className="pulsing-live-dot" />
            <span>Real-Time Evaluation Engine</span>
          </div>
          <h2 className="section-title">How Inkloom catches off-brand violations live</h2>
          <p className="section-desc">
            Creators receive prescriptive, 1-click rewrites with citations to official SLAs instead of generic rejections.
          </p>
        </div>

        {/* The Live Interactive Showcase Card */}
        <div className="inspection-card-container">
          {/* Card Header Bar */}
          <div className="inspection-card-header">
            <div className="inspection-target-info">
              <span className="draft-label">Active Creator Draft</span>
              <span className="target-channel-badge">LinkedIn Ad</span>
              <span className="target-workspace-tag">Target: <strong>Nexus Cloud</strong></span>
            </div>

            <div className="inspection-score-header">
              <span className="score-header-label">Autonomous Governance Findings</span>
              <div className={`score-metric-badge ${complianceScore >= 80 ? 'good' : 'bad'}`}>
                Score: {complianceScore} / 100
              </div>
            </div>
          </div>

          {/* Card Body Grid */}
          <div className="inspection-body-grid">
            {/* Left Column: Creator Draft with Inline Highlights */}
            <div className="inspection-draft-col">
              <div className={`draft-text-box ${pulseAnimation ? 'draft-pulse' : ''}`}>
                {fixedFactual ? (
                  <span className="highlight-repaired">guaranteed 99.99% multi-region uptime</span>
                ) : (
                  <span className="highlight-critical">guaranteed 100% uptime</span>
                )}
                {' with our '}
                <span className="highlight-warning">unbeatable 30% discount</span>
                {' this quarter. It is the '}
                {fixedSuperlative ? (
                  <span className="highlight-repaired">most cost-optimized</span>
                ) : (
                  <span className="highlight-warning">cheapest</span>
                )}
                {' cloud infrastructure available!'}
              </div>

              <div className="draft-benchmark-meta">
                <span className="benchmark-pulse-icon">⚡</span>
                <span>Evaluated against 14 Golden Facts and 8 brand guardrails in 180ms.</span>
              </div>

              {(fixedFactual || fixedSuperlative) && (
                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button className="reset-demo-btn" onClick={handleResetDemo}>
                    <RefreshCw size={12} />
                    <span>Reset Simulation</span>
                  </button>
                  <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '500' }}>
                    ✓ Prescriptive edits applied in-place!
                  </span>
                </div>
              )}
            </div>

            {/* Right Column: Autonomous Findings Cards */}
            <div className="inspection-findings-col">
              {/* Finding 1: Factual Inaccuracy */}
              <div className={`finding-item-card critical ${fixedFactual ? 'resolved' : ''}`}>
                <div className="finding-header">
                  <div className="finding-type">
                    <AlertTriangle size={15} color="#FB7185" />
                    <span className="type-name">FACTUAL_INACCURACY</span>
                  </div>
                  <span className="severity-pill critical">
                    {fixedFactual ? 'Resolved ✓' : 'Critical Violation'}
                  </span>
                </div>

                <p className="finding-explanation">
                  Contradicts verified SLA agreement. Nexus commitment is 99.99%, not 100%.
                </p>

                <div className="finding-citation-meta">
                  Source Fact: <strong>Enterprise SLA Agreement v2026.1</strong>
                </div>

                <div className="finding-action-row">
                  <span className="rewrite-suggestion">→ "guaranteed 99.99% multi-region uptime"</span>
                  <button 
                    className={`btn-rewrite-action ${fixedFactual ? 'applied' : ''}`}
                    onClick={handleFixFactual}
                    disabled={fixedFactual}
                  >
                    {fixedFactual ? 'Applied ✓' : '1 Click Rewrite'}
                  </button>
                </div>
              </div>

              {/* Finding 2: Prohibited Claim */}
              <div className={`finding-item-card warning ${fixedSuperlative ? 'resolved' : ''}`}>
                <div className="finding-header">
                  <div className="finding-type">
                    <AlertTriangle size={15} color="#FBBF24" />
                    <span className="type-name">PROHIBITED_CLAIM</span>
                  </div>
                  <span className="severity-pill warning">
                    {fixedSuperlative ? 'Resolved ✓' : 'Warning'}
                  </span>
                </div>

                <p className="finding-explanation">
                  Superlative claim "cheapest" violates brand guardrail on competitive substantiation.
                </p>

                <div className="finding-citation-meta">
                  Source: <strong>Brand Guardrail #2 (Superlatives & Pricing Claims)</strong>
                </div>

                <div className="finding-action-row">
                  <span className="rewrite-suggestion">→ "most cost-optimized"</span>
                  <button 
                    className={`btn-rewrite-action ${fixedSuperlative ? 'applied' : ''}`}
                    onClick={handleFixSuperlative}
                    disabled={fixedSuperlative}
                  >
                    {fixedSuperlative ? 'Applied ✓' : '1 Click Rewrite'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THREE-STAGE ARCHITECTURE LOOP */}
      <section id="architecture" className="landing-section architecture-section">
        <div className="section-header-block">
          <div className="section-pill-tag">
            <span>The Autonomous Loop</span>
          </div>
          <h2 className="section-title">Three-stage brand governance architecture</h2>
          <p className="section-desc">
            How Inkloom seamlessly bridges policy authoring, active creator tooling, and executive compliance oversight.
          </p>
        </div>

        <div className="architecture-grid">
          {/* Step 01 */}
          <div className="arch-step-card">
            <div className="step-number-badge blue">01</div>
            <h3>Ingest Golden Facts & Guardrails</h3>
            <p>
              Brand leaders upload verified pricing matrices, product specs, and legal rules. 
              pgvector generates 768-dimensional embeddings in isolated tenant boundaries.
            </p>
          </div>

          {/* Step 02 */}
          <div className="arch-step-card">
            <div className="step-number-badge emerald">02</div>
            <h3>In-Context Creator Audits</h3>
            <p>
              Creators draft in the Studio or via Chrome Extension. The dual-engine checks facts, 
              tone, and visual hex compliance, returning explanations and 1-click fixes.
            </p>
          </div>

          {/* Step 03 */}
          <div className="arch-step-card">
            <div className="step-number-badge amber">03</div>
            <h3>Human Escalation & Analytics</h3>
            <p>
              High-risk deviations route to authorized brand reviewers for sign-off. Compliance 
              trend analytics identify ambiguous rules needing clarification.
            </p>
          </div>
        </div>
      </section>

      {/* 5. ROLE-AWARE WORKFLOWS */}
      <section id="workflows" className="landing-section workflows-section">
        <div className="section-header-block">
          <div className="section-pill-tag">
            <span>Role-Aware Workflows</span>
          </div>
          <h2 className="section-title">Built for compliance leaders and fast-moving creators</h2>
        </div>

        <div className="workflows-grid">
          {/* Card 1: For Brand Managers & Legal */}
          <div className="role-card">
            <div className="role-card-header">
              <div className="role-icon-box purple">
                <Building2 size={22} />
              </div>
              <div>
                <h3>For Brand Managers & Legal</h3>
                <p className="role-subtitle">Centralized governance without manual review burnout</p>
              </div>
            </div>

            <ul className="role-checklist">
              <li>
                <div className="check-icon-circle"><Check size={14} color="#34D399" /></div>
                <span>Upload single-source-of-truth spreadsheets (CSV/Excel) and brand guardrails.</span>
              </li>
              <li>
                <div className="check-icon-circle"><Check size={14} color="#34D399" /></div>
                <span>Inspect recurring compliance violations and optimize ambiguous guidelines.</span>
              </li>
              <li>
                <div className="check-icon-circle"><Check size={14} color="#34D399" /></div>
                <span>Manage escalated high-risk claims with structured audit notes.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: For Content Creators & Marketers */}
          <div className="role-card">
            <div className="role-card-header">
              <div className="role-icon-box emerald">
                <PenTool size={22} />
              </div>
              <div>
                <h3>For Content Creators & Marketers</h3>
                <p className="role-subtitle">Immediate feedback directly in active publishing tools</p>
              </div>
            </div>

            <ul className="role-checklist">
              <li>
                <div className="check-icon-circle"><Check size={14} color="#34D399" /></div>
                <span>Instant pre-publication checks inside WordPress, LinkedIn, or Webflow.</span>
              </li>
              <li>
                <div className="check-icon-circle"><Check size={14} color="#34D399" /></div>
                <span>Replace vague rejections with 1-click prescriptive rewrites that preserve tone.</span>
              </li>
              <li>
                <div className="check-icon-circle"><Check size={14} color="#34D399" /></div>
                <span>Submit exceptions directly to brand reviewers without messy email chains.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION */}
      <section className="landing-bottom-cta-section">
        <div className="bottom-cta-ambient" />
        <div className="bottom-cta-content">
          <div className="section-pill-tag" style={{ margin: '0 auto 16px auto' }}>
            <span>Enterprise Brand Sovereignty</span>
          </div>

          <h2 className="cta-headline">Experience frictionless brand governance</h2>
          <p className="cta-subheadline">
            Explore the multi-tenant workspace with pre-populated ground truth data for Nexus Cloud, Aura Health, and Veritas Financial.
          </p>

          <div className="bottom-cta-buttons">
            <button className="cta-primary-glow" onClick={onEnterDemo}>
              <span>Enter Live Demo Workspace</span>
              <ArrowRight size={16} />
            </button>

            <a 
              href="/test-draft" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="cta-secondary-glass"
            >
              <span>Test In-Context CMS</span>
              <ExternalLink size={15} color="#94A3B8" />
            </a>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="footer-brand-info">
            <Shield size={16} color="#F97316" />
            <span><strong>Inkloom Platform</strong> • Multi-Tenant AI Governance</span>
          </div>

          <div className="footer-tech-stack">
            <span>FastAPI Backend</span>
            <span className="dot">•</span>
            <span>PostgreSQL + pgvector</span>
            <span className="dot">•</span>
            <span>OpenCV Vision</span>
            <span className="dot">•</span>
            <span>Gemini LLM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
