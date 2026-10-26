import React, { useState } from 'react';
import { ShieldAlert, Plus, Trash2, AlertCircle } from 'lucide-react';

export default function PolicyRulesManager({ policies, setPolicies, onNotify }) {
  const [showModal, setShowModal] = useState(false);
  const [newRule, setNewRule] = useState({
    bannedTerm: '',
    approvedAlternative: '',
    severity: 'warning',
    reason: ''
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newRule.bannedTerm || !newRule.approvedAlternative) return;

    const item = {
      id: `POL-${Date.now().toString().slice(-4)}`,
      ...newRule
    };
    setPolicies([item, ...policies]);
    setShowModal(false);
    setNewRule({ bannedTerm: '', approvedAlternative: '', severity: 'warning', reason: '' });
    onNotify('New brand policy rule enforced!');
  };

  const handleDelete = (id) => {
    setPolicies(policies.filter(p => p.id !== id));
    onNotify('Policy rule removed.');
  };

  return (
    <div className="dashboard-card">
      <div className="card-header-bar">
        <div>
          <h3 className="card-title">
            <ShieldAlert size={18} color="var(--amber)" />
            Brand Tone & Risk Policies
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Configure disallowed superlatives, mandatory disclosures, and tone guardrails for CMS checks.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          <span>Add Disallowed Term</span>
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Banned Phrase / Pattern</th>
              <th>Enforced Alternative</th>
              <th>Severity Level</th>
              <th>Rationale / Policy Reference</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.id}>
                <td>
                  <span style={{ 
                    fontFamily: 'monospace', 
                    background: 'rgba(244, 63, 94, 0.15)', 
                    color: '#FB7185', 
                    padding: '3px 8px', 
                    borderRadius: '4px',
                    fontWeight: '600'
                  }}>
                    "{p.bannedTerm}"
                  </span>
                </td>
                <td style={{ color: 'var(--emerald)', fontWeight: '500' }}>
                  → {p.approvedAlternative}
                </td>
                <td>
                  {p.severity === 'high' && <span className="badge badge-rose">High Risk</span>}
                  {p.severity === 'warning' && <span className="badge badge-amber">Warning</span>}
                  {p.severity === 'info' && <span className="badge badge-cyan">Advisory</span>}
                </td>
                <td style={{ fontSize: '12.5px' }}>{p.reason}</td>
                <td>
                  <button 
                    className="btn-danger"
                    onClick={() => handleDelete(p.id)}
                    title="Remove Rule"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="card-header-bar">
              <h3 className="card-title">Add Brand Tone Guardrail</h3>
            </div>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Disallowed Term or Phrase</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. cheapest on market, guaranteed 100% bug free"
                  value={newRule.bannedTerm}
                  onChange={(e) => setNewRule({ ...newRule, bannedTerm: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Approved On-Brand Alternative</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. high-confidence enterprise solution"
                  value={newRule.approvedAlternative}
                  onChange={(e) => setNewRule({ ...newRule, approvedAlternative: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Violation Severity</label>
                <select
                  className="form-select"
                  value={newRule.severity}
                  onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
                >
                  <option value="warning">Warning (Demotes score, suggests rewrite)</option>
                  <option value="high">High Risk (Blocks publish, triggers escalation)</option>
                  <option value="info">Advisory (Informational style tip)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Governance Rationale</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Disallowed superlative. Brand voice prioritizes precision over hype."
                  value={newRule.reason}
                  onChange={(e) => setNewRule({ ...newRule, reason: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
