import React from 'react';
import { 
  Database, 
  Zap, 
  ShieldCheck, 
  Building2, 
  PenTool, 
  Check, 
  ArrowRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ArchitectureAndWorkflows.css';

/**
 * Inkloom AI — Architecture & Role-Aware Workflows Sections
 * - Unified solid glass card tokens across both sections (rgba(20, 10, 8, 0.82))
 * - Connected 3-stage autonomous loop with flow indicators
 * - Benefit-first scannable copy with "Under the hood" technical metadata
 * - Role-tailored action CTAs ("Open Brand Admin view", "Open Creator Studio")
 * - Strict WCAG AA contrast compliance and semantic HTML
 */
export default function ArchitectureAndWorkflows({ onEnterDemo }) {
  const { switchRole } = useAuth();

  const handleLaunchRole = (role) => {
    switchRole(role);
    if (onEnterDemo) {
      onEnterDemo(role);
    }
  };

  const stages = [
    {
      step: '01',
      number: '1',
      title: 'Ingest Golden Facts & Guardrails',
      icon: Database,
      benefit: 'Brand leaders upload verified pricing, specs, and legal rules once.',
      underTheHood: 'Stored as isolated, per-tenant vector embeddings.',
      outcomeChip: 'Single source of truth'
    },
    {
      step: '02',
      number: '2',
      title: 'In-Context Creator Audits',
      icon: Zap,
      benefit: 'Creators get instant fact, tone, and visual checks while they draft.',
      underTheHood: 'Dual-engine check with 1-click fixes.',
      outcomeChip: 'Checks in under 1 second'
    },
    {
      step: '03',
      number: '3',
      title: 'Human Escalation & Analytics',
      icon: ShieldCheck,
      benefit: 'High-risk claims go to brand reviewers; analytics reveal unclear rules.',
      underTheHood: 'Sign-off trail plus compliance trends.',
      outcomeChip: 'Full audit trail'
    }
  ];

  return (
    <div className="architecture-workflows-wrapper">
      {/* ====================================================================
          SECTION 1: THREE-STAGE BRAND GOVERNANCE ARCHITECTURE
          ==================================================================== */}
      <section 
        id="architecture" 
        className="unified-landing-section architecture-section"
        aria-labelledby="architecture-heading"
      >
        <div className="section-dark-scrim" aria-hidden="true" />

        <div className="unified-container">
          {/* Section Header */}
          <div className="unified-section-header">
            <div className="section-header-pill">
              <Sparkles size={13} className="pill-sparkle-icon" aria-hidden="true" />
              <span>The Autonomous Loop</span>
            </div>

            <h2 id="architecture-heading" className="unified-section-h2">
              Three-stage brand governance architecture
            </h2>

            <p className="unified-section-subtitle">
              How Inkloom connects policy, creation, and oversight.
            </p>
          </div>

          {/* Connected 3-Stage Cards Grid */}
          <div className="architecture-loop-container">
            {/* Desktop Autonomous Loop Banner */}
            <div className="loop-indicator-bar" aria-hidden="true">
              <div className="loop-track-line">
                <span className="loop-tag">
                  <RefreshCw size={12} className="loop-spin-icon" />
                  <span>Closed-Loop Brand Safety</span>
                </span>
              </div>
            </div>

            <ol className="architecture-cards-grid" role="list">
              {stages.map((stage, idx) => {
                const Icon = stage.icon;
                return (
                  <li key={stage.step} className="architecture-card-item">
                    <div className="unified-card-surface">
                      {/* Top Row: Numbered Circle Badge & Step Icon */}
                      <div className="arch-card-top-row">
                        <div className="step-circle-badge" aria-label={`Step ${stage.number}`}>
                          <span>{stage.number}</span>
                        </div>

                        <div className="unified-icon-box" aria-hidden="true">
                          <Icon size={22} className="unified-icon" />
                        </div>
                      </div>

                      {/* Card Heading & Benefit-First Copy */}
                      <div className="arch-card-body">
                        <h3 className="unified-card-title">{stage.title}</h3>
                        <p className="arch-benefit-text">{stage.benefit}</p>
                        <div className="arch-under-hood">
                          <span className="hood-label">Under the hood:</span>{' '}
                          <span className="hood-text">{stage.underTheHood}</span>
                        </div>
                      </div>

                      {/* Bottom Outcome Chip */}
                      <div className="arch-card-footer">
                        <span className="outcome-proof-chip">
                          <Check size={13} className="outcome-check-icon" aria-hidden="true" />
                          <span>{stage.outcomeChip}</span>
                        </span>
                      </div>
                    </div>

                    {/* Step Connector Arrow (between cards 1->2 and 2->3 on desktop) */}
                    {idx < stages.length - 1 && (
                      <div className="arch-flow-connector" aria-hidden="true">
                        <ArrowRight size={20} className="connector-arrow-icon" />
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 2: ROLE-AWARE WORKFLOWS
          ==================================================================== */}
      <section 
        id="workflows" 
        className="unified-landing-section workflows-section"
        aria-labelledby="workflows-heading"
      >
        <div className="section-dark-scrim" aria-hidden="true" />

        <div className="unified-container">
          {/* Section Header */}
          <div className="unified-section-header">
            <div className="section-header-pill">
              <Sparkles size={13} className="pill-sparkle-icon" aria-hidden="true" />
              <span>Role-Aware Workflows</span>
            </div>

            <h2 id="workflows-heading" className="unified-section-h2">
              Built for compliance leaders and fast-moving creators
            </h2>

            <p className="unified-section-subtitle">
              Tailored surfaces for centralized governance and autonomous creator velocity.
            </p>
          </div>

          {/* Two Equal-Height Cards Grid */}
          <div className="workflows-two-col-grid">
            {/* Card 1: For Brand Managers & Legal */}
            <article className="unified-card-surface role-workflow-card">
              <div className="role-card-header">
                <div className="unified-icon-box" aria-hidden="true">
                  <Building2 size={24} className="unified-icon" />
                </div>
                <div className="role-header-content">
                  <div className="role-badge-row">
                    <span className="role-outcome-chip">Cut review time by 80%</span>
                  </div>
                  <h3 className="unified-card-title">For Brand Managers & Legal</h3>
                  <p className="role-card-subtitle">Centralized governance without manual review burnout</p>
                </div>
              </div>

              {/* Scannable Checklists */}
              <ul className="role-scannable-checklist" aria-label="Capabilities for Brand Managers and Legal">
                <li className="checklist-row">
                  <span className="check-indicator" aria-hidden="true">
                    <Check size={14} className="check-svg" />
                  </span>
                  <span className="checklist-text">Upload your brand rules from CSV or Excel.</span>
                </li>
                <li className="checklist-row">
                  <span className="check-indicator" aria-hidden="true">
                    <Check size={14} className="check-svg" />
                  </span>
                  <span className="checklist-text">See which rules creators break most.</span>
                </li>
                <li className="checklist-row">
                  <span className="check-indicator" aria-hidden="true">
                    <Check size={14} className="check-svg" />
                  </span>
                  <span className="checklist-text">Review escalated claims with audit notes.</span>
                </li>
              </ul>

              {/* Card Footer with CTA */}
              <div className="role-card-footer">
                <button
                  type="button"
                  className="role-cta-ghost-btn"
                  onClick={() => handleLaunchRole('admin')}
                  aria-label="Open Brand Administrator view"
                >
                  <span>Open Brand Admin view</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </article>

            {/* Card 2: For Content Creators & Marketers */}
            <article className="unified-card-surface role-workflow-card">
              <div className="role-card-header">
                <div className="unified-icon-box" aria-hidden="true">
                  <PenTool size={24} className="unified-icon" />
                </div>
                <div className="role-header-content">
                  <div className="role-badge-row">
                    <span className="role-outcome-chip">Ship faster, stay on-brand</span>
                  </div>
                  <h3 className="unified-card-title">For Content Creators & Marketers</h3>
                  <p className="role-card-subtitle">Immediate feedback directly in active publishing tools</p>
                </div>
              </div>

              {/* Scannable Checklists */}
              <ul className="role-scannable-checklist" aria-label="Capabilities for Content Creators and Marketers">
                <li className="checklist-row">
                  <span className="check-indicator" aria-hidden="true">
                    <Check size={14} className="check-svg" />
                  </span>
                  <span className="checklist-text">Get checks inside WordPress, LinkedIn, or Webflow.</span>
                </li>
                <li className="checklist-row">
                  <span className="check-indicator" aria-hidden="true">
                    <Check size={14} className="check-svg" />
                  </span>
                  <span className="checklist-text">Fix issues with 1-click rewrites that keep your tone.</span>
                </li>
                <li className="checklist-row">
                  <span className="check-indicator" aria-hidden="true">
                    <Check size={14} className="check-svg" />
                  </span>
                  <span className="checklist-text">Request exceptions without email chains.</span>
                </li>
              </ul>

              {/* Card Footer with CTA */}
              <div className="role-card-footer">
                <button
                  type="button"
                  className="role-cta-ghost-btn"
                  onClick={() => handleLaunchRole('creator')}
                  aria-label="Open Content Creator Studio view"
                >
                  <span>Open Creator Studio</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

