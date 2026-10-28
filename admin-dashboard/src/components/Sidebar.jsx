import React from 'react';
import { 
  BarChart3, 
  Database, 
  ShieldAlert, 
  Palette, 
  FlaskConical, 
  CheckSquare,
  LogOut,
  Sparkles,
  ArrowLeftRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, counts = {}, onGoHome, onNotify }) {
  const { user, isAdmin, switchRole, logout } = useAuth();

  const adminNavItems = [
    { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
    { id: 'facts', label: 'Golden Facts KB', icon: Database, badge: counts.facts || 4 },
    { id: 'policies', label: 'Tone & Policy Rules', icon: ShieldAlert, badge: counts.policies || 4 },
    { id: 'assets', label: 'Visual Brand Palette', icon: Palette, badge: counts.assets || 3 },
    { id: 'sandbox', label: 'Live Audit Sandbox', icon: FlaskConical },
    { id: 'reviews', label: 'Review Queue', icon: CheckSquare, badge: counts.reviews || 2 }
  ];

  const creatorNavItems = [
    { id: 'creator_studio', label: 'Creator Studio', icon: Sparkles, badge: 'AI Live' },
    { id: 'facts', label: 'Golden Facts Reference', icon: Database, badge: counts.facts || 4 },
    { id: 'reviews', label: 'My Submissions', icon: CheckSquare, badge: counts.reviews || 2 }
  ];

  const navItems = isAdmin ? adminNavItems : creatorNavItems;

  const handleLogout = async () => {
    await logout();
    if (onNotify) onNotify('Logged out successfully');
    if (onGoHome) onGoHome();
  };

  const getInitials = (name) => {
    if (!name) return 'C';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-badge">
          <div className="logo-accent-dot"></div>
        </div>
        <div className="logo-text">
          <h1>Inkloom <span className="gradient">AI</span></h1>
          <p>{isAdmin ? 'Governance Hub' : 'Creator Portal'}</p>
        </div>
      </div>

      <nav className="nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {/* Fast Role Switcher */}
        <button 
          onClick={() => {
            const nextRole = isAdmin ? 'creator' : 'admin';
            switchRole(nextRole);
            setActiveTab(nextRole === 'admin' ? 'overview' : 'creator_studio');
            if (onNotify) onNotify(`Switched to ${nextRole === 'admin' ? 'Brand Admin' : 'Creator'} workspace`);
          }}
          className="btn-secondary"
          style={{ 
            width: '100%', 
            marginBottom: '10px', 
            fontSize: '11px', 
            padding: '7px 10px', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '6px',
            border: '1px solid rgba(254, 215, 170, 0.16)'
          }}
          title="Switch perspective between Content Creator and Brand Administrator"
        >
          <ArrowLeftRight size={12} color="#F97316" />
          <span>Switch to {isAdmin ? 'Creator View' : 'Admin View'}</span>
        </button>

        {user && (
          <div className="sidebar-user-card">
            <div className={`sidebar-user-avatar ${isAdmin ? 'admin' : ''}`}>
              {getInitials(user.fullName || user.email)}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.fullName || user.email}</span>
              <span className={`sidebar-user-role ${isAdmin ? 'admin' : ''}`}>
                {isAdmin ? '👑 Brand Admin' : '✨ Creator'}
              </span>
            </div>
            <button 
              className="sidebar-logout-btn" 
              onClick={handleLogout}
              title="Sign Out / Log Out"
              aria-label="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}

        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center', marginTop: '6px' }}>
          Split Vision: OpenCV + Gemini RAG<br />
          <strong>Phase 1.5 Integrated</strong>
        </div>
      </div>
    </aside>
  );
}
