import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';

export default function Header({ currentTitle, apiStatus, onRefreshStatus, checking }) {
  return (
    <header className="top-header">
      <div className="header-title-group">
        <h2>{currentTitle}</h2>
      </div>

      <div className="header-actions">
        <div className="api-status-pill">
          <span 
            className={`status-indicator-dot ${apiStatus.connected ? 'online' : 'offline'}`}
          />
          <span>
            {apiStatus.connected 
              ? `Backend Connected (${apiStatus.version || 'v0.1.0'})` 
              : 'Backend Offline (127.0.0.1:8000)'}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <Activity size={14} color="var(--cyan)" />
          <span>Workspace: <strong>Acme Brand v2</strong></span>
        </div>
      </div>
    </header>
  );
}
