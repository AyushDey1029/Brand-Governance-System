import React, { useState, useRef, useEffect } from 'react';
import { Activity, RefreshCw, User, LogOut, ChevronDown, Sparkles, Crown, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ currentTitle, apiStatus = {}, onRefreshStatus, checking, onGoHome }) {
  const { user, isAdmin, switchRole, logout, openLoginModal } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setMenuOpen(false);
    try {
      await logout();
    } catch (_) {}
    localStorage.removeItem('inkloom_active_user');
    localStorage.removeItem('inkloom_access_token');
    localStorage.removeItem('inkloom_refresh_token');
    if (onGoHome) onGoHome();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="top-header">
      <div className="header-title-group" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {onGoHome && (
          <button 
            className="btn-secondary" 
            onClick={onGoHome}
            style={{ 
              padding: '6px 12px', 
              fontSize: '12px', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px'
            }}
            title="Return to Product Landing Page"
          >
            <span>← Home</span>
          </button>
        )}
        <h2>{currentTitle}</h2>
      </div>

      <div className="header-actions">
        {/* Backend Status Pill */}
        <div className="api-status-pill">
          <span 
            className={`status-indicator-dot ${apiStatus?.connected ? 'online' : 'offline'}`}
          />
          <span>
            {apiStatus?.connected 
              ? `API Online (${apiStatus?.version || 'v0.1.0'})` 
              : 'API Offline (127.0.0.1:8000)'}
          </span>
          <button 
            onClick={onRefreshStatus} 
            disabled={checking}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-muted)', 
              cursor: 'pointer', 
              display: 'flex',
              padding: '2px'
            }}
            title="Refresh API Connection"
          >
            <RefreshCw size={13} className={checking ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Workspace Tag */}
        <div className="header-workspace-tag">
          <Activity size={14} color={isAdmin ? "#F59E0B" : "#F97316"} />
          <span>Workspace: <strong>Acme Brand v2</strong></span>
        </div>

        {/* User Authentication Profile Pill */}
        {user ? (
          <div className="user-profile-menu-wrap" ref={menuRef}>
            <button 
              className={`user-profile-pill ${isAdmin ? 'admin' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="User profile menu"
            >
              <div className={`user-avatar-badge ${isAdmin ? 'admin' : ''}`}>
                {getInitials(user.fullName || user.email)}
              </div>
              <div className="user-pill-info">
                <span className="user-pill-name">{user.fullName || user.email}</span>
                <span className={`user-pill-role ${isAdmin ? 'admin' : ''}`}>
                  {isAdmin ? '👑 Admin' : 'Creator'}
                </span>
              </div>
              <ChevronDown size={14} className={`user-pill-caret ${menuOpen ? 'open' : ''}`} />
            </button>

            {menuOpen && (
              <div className="user-dropdown-menu">
                <div className="dropdown-user-header">
                  <div className="dropdown-name">{user.fullName || (isAdmin ? 'Brand Director' : 'Creator')}</div>
                  <div className="dropdown-email">{user.email}</div>
                  <div className={`dropdown-role-tag ${isAdmin ? 'admin' : ''}`}>
                    {isAdmin ? <Crown size={11} color="#FDE047" /> : <Sparkles size={11} color="#F97316" />}
                    <span>Role: {isAdmin ? 'Brand Administrator' : 'Content Creator'}</span>
                  </div>
                </div>

                <div className="dropdown-divider" />

                <div className="dropdown-item-info">
                  <span>Workspace Isolation</span>
                  <strong>Acme Brand v2 (Enterprise)</strong>
                </div>

                <div className="dropdown-divider" />

                {/* Quick Persona Switcher for Hackathon Testing */}
                <button 
                  className="dropdown-role-switch-btn" 
                  onClick={() => {
                    switchRole(isAdmin ? 'creator' : 'admin');
                    setMenuOpen(false);
                  }}
                  title="Switch between Creator and Brand Admin perspective"
                >
                  <ArrowLeftRight size={13} />
                  <span>Switch to {isAdmin ? 'Creator View' : 'Admin View'}</span>
                </button>

                <div className="dropdown-divider" />

                <button className="dropdown-logout-btn" onClick={handleSignOut}>
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="header-signin-btn" onClick={() => openLoginModal('creator')}>
            <User size={14} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
