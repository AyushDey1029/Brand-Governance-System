import React from 'react';
import { 
  Shield, 
  ArrowRight, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import LiveAuditDemo from './LiveAuditDemo';
import ArchitectureAndWorkflows from './ArchitectureAndWorkflows';

export default function LandingPage({ onEnterDemo }) {
  const { user, isAdmin } = useAuth();

  return (
    <div className="landing-page-wrapper">
      {/* 1. TOP NAVBAR */}
      <Navbar onEnterDemo={onEnterDemo} />

      {/* 2. HERO SECTION */}
      <HeroSection onEnterDemo={onEnterDemo} />

      {/* 3. INTERACTIVE LIVE INSPECTION SECTION */}
      <LiveAuditDemo />

      {/* 4 & 5. ARCHITECTURE & ROLE-AWARE WORKFLOWS */}
      <ArchitectureAndWorkflows onEnterDemo={onEnterDemo} />

      {/* 6. BOTTOM CALL TO ACTION */}
      <section className="landing-bottom-cta-section">
        <div className="bottom-cta-ambient" />
        <div className="bottom-cta-content">
          <div className="section-pill-tag" style={{ margin: '0 auto 16px auto' }}>
            <span>Enterprise Brand Sovereignty</span>
          </div>

          <h2 className="cta-headline">Experience frictionless brand governance</h2>
          <p className="cta-subheadline">
            Explore the enterprise brand governance workspace with pre-populated ground truth data for Nexus Cloud.
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
