import React, { useState, useEffect } from 'react';
import { Shield, ArrowRight, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

/**
 * Inkloom Top Navbar Component
 * Refactored for pixel-perfect vertical alignment, unified 72px height,
 * zero text wrapping, WCAG AA accessibility, and responsive hamburger navigation.
 */
export default function Navbar({ onEnterDemo }) {
  const { user, isAdmin, openLoginModal, loginAsDemo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('architecture');

  // Track scroll position to update active navigation item
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      const inspectionEl = document.getElementById('inspection');
      const workflowsEl = document.getElementById('workflows');

      if (workflowsEl && scrollPos >= workflowsEl.offsetTop) {
        setActiveSection('workflows');
      } else if (inspectionEl && scrollPos >= inspectionEl.offsetTop) {
        setActiveSection('inspection');
      } else {
        setActiveSection('architecture');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute initials for user avatar
  const getInitials = (name) => {
    if (!name) return 'SA';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleNavClick = (e, sectionId) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
  };

  const handleCtaClick = () => {
    if (user) {
      onEnterDemo(isAdmin ? 'admin' : 'creator');
    } else {
      loginAsDemo('creator');
      onEnterDemo('creator');
    }
  };

  return (
    <header className="inkloom-top-navbar" role="banner">
      <div className="inkloom-navbar-container">
        {/* GROUP 1: Brand Block */}
        <a 
          href="#home" 
          className="navbar-brand-link" 
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label="Inkloom AI Home"
        >
          <div className="brand-icon-box" aria-hidden="true">
            <Shield size={20} className="brand-shield-icon" />
          </div>
          <div className="brand-text-stack">
            <span className="brand-name-title">Inkloom</span>
            <span className="brand-tagline-sub">Autonomous Brand Governance</span>
          </div>
        </a>

        {/* GROUP 2: Nav Links (Desktop — Centered) */}
        <nav className="navbar-center-nav" aria-label="Primary">
          <a
            href="#architecture"
            className={`nav-anchor-link ${activeSection === 'architecture' ? 'active' : ''}`}
            aria-current={activeSection === 'architecture' ? 'page' : undefined}
            onClick={(e) => handleNavClick(e, 'architecture')}
          >
            Architecture
          </a>
          <a
            href="#inspection"
            className={`nav-anchor-link ${activeSection === 'inspection' ? 'active' : ''}`}
            aria-current={activeSection === 'inspection' ? 'page' : undefined}
            onClick={(e) => handleNavClick(e, 'inspection')}
          >
            Live Inspection
          </a>
          <a
            href="#workflows"
            className={`nav-anchor-link ${activeSection === 'workflows' ? 'active' : ''}`}
            aria-current={activeSection === 'workflows' ? 'page' : undefined}
            onClick={(e) => handleNavClick(e, 'workflows')}
          >
            Role Workflows
          </a>
        </nav>

        {/* GROUP 3: User Chip + CTA */}
        <div className="navbar-actions-group">
          {user ? (
            <div 
              className="navbar-user-chip"
              role="status"
              aria-label={`Signed in as ${user.fullName || 'User'}, role: ${isAdmin ? 'Brand Administrator' : 'Content Creator'}`}
              tabIndex={0}
            >
              <div 
                className={`navbar-user-avatar ${isAdmin ? 'admin' : ''}`} 
                aria-hidden="true"
              >
                {getInitials(user.fullName || user.email)}
              </div>
              <span className="navbar-user-name" title={user.fullName || user.email}>
                {user.fullName || 'Sarah Chen'}
              </span>
              <span className={`navbar-user-badge ${isAdmin ? 'admin' : ''}`}>
                {isAdmin ? 'Brand Admin' : 'Creator'}
              </span>
            </div>
          ) : (
            <button
              type="button"
              className="navbar-signin-button"
              onClick={() => openLoginModal('creator')}
              aria-label="Sign In to your workspace"
            >
              <User size={15} aria-hidden="true" />
              <span>Sign In</span>
            </button>
          )}

          {/* Primary CTA Button */}
          <button
            type="button"
            className="navbar-cta-button"
            onClick={handleCtaClick}
            aria-label="Open Workspace"
          >
            <span>Open Workspace</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>

          {/* Mobile Hamburger Toggle (< 1024px) */}
          <button
            type="button"
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (< 1024px) */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-drawer" id="mobile-navigation">
          <nav aria-label="Mobile Primary">
            <a
              href="#architecture"
              className={`mobile-nav-link ${activeSection === 'architecture' ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, 'architecture')}
            >
              Architecture
            </a>
            <a
              href="#inspection"
              className={`mobile-nav-link ${activeSection === 'inspection' ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, 'inspection')}
            >
              Live Inspection
            </a>
            <a
              href="#workflows"
              className={`mobile-nav-link ${activeSection === 'workflows' ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, 'workflows')}
            >
              Role Workflows
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

