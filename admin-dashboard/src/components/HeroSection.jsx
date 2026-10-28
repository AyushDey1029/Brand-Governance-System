import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ExternalLink, 
  Database, 
  Eye, 
  Lock, 
  Zap,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './HeroSection.css';

/**
 * Inkloom AI — Refactored Enterprise Hero Section
 * Fully WCAG AA compliant, solid-contrast typography, balanced 72px buttons,
 * uniform glass cards, and zero text breaking on key brand tokens.
 */
export default function HeroSection({ onEnterDemo }) {
  const { user, isAdmin, openLoginModal, loginAsDemo } = useAuth();

  const handlePrimaryCta = () => {
    if (user) {
      onEnterDemo(isAdmin ? 'admin' : 'creator');
    } else {
      loginAsDemo('creator');
      onEnterDemo('creator');
    }
  };

  // Determine user display name for dynamic CTA
  const userFirstName = user?.fullName 
    ? user.fullName.trim().split(/\s+/)[0] 
    : (isAdmin ? 'Sarah' : 'Marcus');

  const pillarCards = [
    {
      id: 'citations',
      icon: Database,
      title: 'Grounded Citations',
      desc: 'Zero hallucinated policy flags. Every violation cites approved enterprise ground truth.'
    },
    {
      id: 'vision',
      icon: Eye,
      title: 'Split-Vision CV',
      desc: 'OpenCV deterministic hex delta math paired with Gemini multimodal aesthetic judging.'
    },
    {
      id: 'isolation',
      icon: Lock,
      title: 'Tenant Isolation',
      desc: 'Brand-partitioned pgvector vector stores ensuring strict organizational safety.'
    },
    {
      id: 'chrome',
      icon: Zap,
      title: 'Chrome MV3 Sidepanel',
      desc: 'Audits inside LinkedIn, WordPress, and Webflow without switching contexts.'
    }
  ];

  return (
    <section className="inkloom-hero-section" aria-labelledby="hero-main-heading">
      {/* Dark Radial Scrim to guarantee text contrast against background */}
      <div className="hero-dark-scrim" aria-hidden="true" />

      <div className="hero-shell-container">
        {/* 1. TOP BADGE PILL */}
        <div className="hero-top-badge" role="note" aria-label="Enterprise platform metadata">
          <span className="badge-icon-wrap" aria-hidden="true">
            <Sparkles size={16} className="badge-sparkle" />
          </span>
          <span className="badge-primary-text">Enterprise Multi-Tenant AI Platform</span>
          <span className="badge-dot-separator" aria-hidden="true" />
          <span className="badge-secondary-chip">pgvector + Split-Vision CV</span>
        </div>

        {/* 2. MAIN HEADLINE */}
        <h1 id="hero-main-heading" className="hero-headline-title">
          Content velocity without{' '}
          <span className="headline-accent-word">brand risk.</span>
        </h1>

        {/* 3. BODY PARAGRAPH WITH HIGH-CONTRAST HIGHLIGHTS */}
        <p className="hero-body-text">
          Eliminate manual review bottlenecks. Inkloom audits marketing drafts and creative imagery in real time against approved{' '}
          <strong className="hero-brand-highlight">Golden Facts</strong>,{' '}
          <strong className="hero-brand-highlight">prohibited claims</strong>, and{' '}
          <strong className="hero-brand-highlight nowrap">exact visual brand tokens</strong>{' '}
          directly inside creator workflows.
        </p>

        {/* 4. BALANCED CTA BUTTON GROUP */}
        <div className="hero-actions-cluster">
          {user ? (
            <button
              type="button"
              className="hero-btn-primary"
              onClick={handlePrimaryCta}
              aria-label={`Open Workspace as ${userFirstName}`}
            >
              <span>Open Workspace ({userFirstName})</span>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          ) : (
            <>
              <button
                type="button"
                className="hero-btn-primary"
                onClick={handlePrimaryCta}
                aria-label="Launch Live Workspace Demo"
              >
                <span>Launch Live Workspace Demo</span>
                <ArrowRight size={18} aria-hidden="true" />
              </button>

              <button
                type="button"
                className="hero-btn-secondary"
                onClick={() => openLoginModal('creator')}
                aria-label="Sign In to your workspace account"
              >
                <User size={18} aria-hidden="true" />
                <span>Sign In to Workspace</span>
              </button>
            </>
          )}

          {/* Secondary Ghost CTA */}
          <a
            href="/test-draft"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-btn-secondary"
            aria-label="Open In-Context CMS test page in a new tab"
          >
            <span>Try In-Context CMS Draft</span>
            <ExternalLink size={17} aria-hidden="true" />
          </a>
        </div>

        {/* 5. UNIFORM FEATURE / PILLAR CARDS GRID */}
        <div className="hero-pillar-cards-grid" role="region" aria-label="Platform Architecture Capabilities">
          {pillarCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.id} className="hero-feature-card">
                <div className="card-icon-container" aria-hidden="true">
                  <Icon size={20} className="card-icon" />
                </div>
                <h2 className="card-heading">{card.title}</h2>
                <p className="card-description">{card.desc}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

