import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  Clock, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function AnalyticsOverview({ onNavigate }) {
  const recentAudits = [
    { id: 'AUD-891', page: 'WordPress: Launching Next-Gen Cloud', author: 'Ayush Dey', score: 65, status: 'warning', issues: 'Outdated $29/mo pricing claim', time: '12 mins ago' },
    { id: 'AUD-890', page: 'Webflow: Enterprise Pricing Tier', author: 'Sarah Jenkins', score: 100, status: 'compliant', issues: 'None (100% On-Brand)', time: '45 mins ago' },
    { id: 'AUD-889', page: 'LinkedIn: Q3 Product Update Post', author: 'Markus Chen', score: 40, status: 'flagged', issues: 'Banned term "magic AI" & off-brand banner', time: '2 hours ago' },
    { id: 'AUD-888', page: 'Blog: Why Deterministic Vision Matters', author: 'Abhyudai Sood', score: 95, status: 'compliant', issues: 'Minor typography spacing', time: '5 hours ago' }
  ];

  return (
    <div>
      {/* Top Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span>Overall Brand Health</span>
            <div className="stat-icon-wrap" style={{ color: 'var(--emerald)' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--emerald)' }}>94.2%</div>
          <p className="stat-desc">↑ 4.8% increase across all decentralized CMS posts</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span>Audits Executed</span>
            <div className="stat-icon-wrap" style={{ color: 'var(--primary-light)' }}>
              <Zap size={18} />
            </div>
          </div>
          <div className="stat-value">1,428</div>
          <p className="stat-desc">In-context checks via Chrome Extension</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span>Violations Intercepted</span>
            <div className="stat-icon-wrap" style={{ color: 'var(--rose)' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--rose)' }}>312</div>
          <p className="stat-desc">Factual drift & obsolete claims caught pre-publish</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span>Governance Turnaround</span>
            <div className="stat-icon-wrap" style={{ color: 'var(--cyan)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--cyan)' }}>1.2s</div>
          <p className="stat-desc">Reduced from 3.5 days human review queue</p>
        </div>
      </div>

      {/* Analytics Breakdown & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Violation Breakdown */}
        <div className="dashboard-card">
          <div className="card-header-bar">
            <h3 className="card-title">Recurring Violation Patterns</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Last 30 Days</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                <span>Factual Drift & Legacy Pricing ($29/mo vs $49/mo)</span>
                <strong style={{ color: 'var(--rose)' }}>44% (138 flags)</strong>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-dark)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '44%', height: '100%', background: 'linear-gradient(90deg, #F43F5E, #FB7185)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                <span>Banned Terminology & Superlatives ("magic AI", "flawless")</span>
                <strong style={{ color: 'var(--amber)' }}>32% (100 flags)</strong>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-dark)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '32%', height: '100%', background: 'linear-gradient(90deg, #F59E0B, #FBBF24)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                <span>Off-Brand Hex Colors & Palette Variance</span>
                <strong style={{ color: 'var(--cyan)' }}>24% (74 flags)</strong>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-dark)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '24%', height: '100%', background: 'linear-gradient(90deg, #06B6D4, #38BDF8)' }}></div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '14px', background: 'var(--bg-dark)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              💡 <strong>Operational Insight:</strong> Updating Golden Facts Pricing reduced pricing drift by 62% this week.
            </span>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => onNavigate('facts')}>
              Manage Facts
            </button>
          </div>
        </div>

        {/* Quick Governance Links */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card-header-bar" style={{ marginBottom: '8px' }}>
            <h3 className="card-title">Quick Operations</h3>
          </div>
          
          <button 
            className="btn-secondary" 
            style={{ justifyContent: 'flex-start', padding: '12px', width: '100%' }}
            onClick={() => onNavigate('sandbox')}
          >
            <Zap size={16} color="var(--primary-light)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '13px' }}>Live Audit Sandbox</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Test copy & OpenCV vision live</div>
            </div>
          </button>

          <button 
            className="btn-secondary" 
            style={{ justifyContent: 'flex-start', padding: '12px', width: '100%' }}
            onClick={() => onNavigate('facts')}
          >
            <ShieldCheck size={16} color="var(--emerald)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '13px' }}>Upload Golden Facts</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Sync pricing matrices & product specs</div>
            </div>
          </button>

          <button 
            className="btn-secondary" 
            style={{ justifyContent: 'flex-start', padding: '12px', width: '100%' }}
            onClick={() => onNavigate('reviews')}
          >
            <AlertTriangle size={16} color="var(--rose)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '13px' }}>Escalated Reviews (2)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Inspect flagged drafts awaiting signoff</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Audits Table */}
      <div className="dashboard-card">
        <div className="card-header-bar">
          <h3 className="card-title">Recent In-Context Audits</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Connected to active Chrome Extensions</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Audit ID</th>
                <th>Source Page / CMS</th>
                <th>Author</th>
                <th>Compliance Score</th>
                <th>Status</th>
                <th>Identified Issues</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentAudits.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{item.id}</td>
                  <td style={{ color: 'var(--text-main)', fontWeight: '500' }}>{item.page}</td>
                  <td>{item.author}</td>
                  <td>
                    <strong style={{ 
                      color: item.score >= 90 ? 'var(--emerald)' : item.score >= 60 ? 'var(--amber)' : 'var(--rose)' 
                    }}>
                      {item.score}%
                    </strong>
                  </td>
                  <td>
                    {item.status === 'compliant' && <span className="badge badge-emerald">Compliant</span>}
                    {item.status === 'warning' && <span className="badge badge-amber">Warning</span>}
                    {item.status === 'flagged' && <span className="badge badge-rose">Flagged</span>}
                  </td>
                  <td style={{ fontSize: '12.5px' }}>{item.issues}</td>
                  <td style={{ color: 'var(--text-dim)', fontSize: '12px' }}>{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
