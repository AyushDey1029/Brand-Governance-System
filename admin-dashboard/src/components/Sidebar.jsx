import React from 'react';
import { 
  BarChart3, 
  Database, 
  ShieldAlert, 
  Palette, 
  FlaskConical, 
  CheckSquare 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, counts = {} }) {
  const navItems = [
    { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
    { id: 'facts', label: 'Golden Facts KB', icon: Database, badge: counts.facts || 4 },
    { id: 'policies', label: 'Tone & Policy Rules', icon: ShieldAlert, badge: counts.policies || 4 },
    { id: 'assets', label: 'Visual Brand Palette', icon: Palette, badge: counts.assets || 3 },
    { id: 'sandbox', label: 'Live Audit Sandbox', icon: FlaskConical },
    { id: 'reviews', label: 'Review Queue', icon: CheckSquare, badge: counts.reviews || 2 }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-badge">
          <div className="logo-accent-dot"></div>
        </div>
        <div className="logo-text">
          <h1>Inkloom <span className="gradient">AI</span></h1>
          <p>Governance Hub</p>
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
        <div style={{ fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center' }}>
          Split Vision: OpenCV + Gemini RAG<br />
          <strong>Phase 1.5 Integrated</strong>
        </div>
      </div>
    </aside>
  );
}
