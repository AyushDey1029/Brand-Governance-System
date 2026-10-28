import React, { useState } from 'react';
import { Database, Plus, Search, Trash2, Edit2, UploadCloud, CheckCircle, Crown, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function GoldenFactsManager({ facts, setFacts, onNotify }) {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newFact, setNewFact] = useState({
    category: 'Pricing',
    fact: '',
    citation: '',
    status: 'Active',
    notes: ''
  });

  const filteredFacts = facts.filter(f => 
    f.fact.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase()) ||
    f.citation.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newFact.fact || !newFact.citation) return;

    const item = {
      id: `GF-${Date.now().toString().slice(-4)}`,
      ...newFact
    };
    setFacts([item, ...facts]);
    setShowModal(false);
    setNewFact({ category: 'Pricing', fact: '', citation: '', status: 'Active', notes: '' });
    onNotify('New Golden Fact indexed into RAG pipeline!');
  };

  const handleDelete = (id) => {
    setFacts(facts.filter(f => f.id !== id));
    onNotify('Golden Fact removed from knowledge base.');
  };

  const handleSimulateCSV = () => {
    const imported = [
      {
        id: `GF-CSV1`,
        category: 'Pricing',
        fact: 'Enterprise Tier starts at $499/mo with dedicated SLA & SOC2 Type II.',
        citation: 'Pricing Matrix v2.4, Item 3',
        status: 'Active',
        notes: 'Imported from Q4_Pricing_Master.csv'
      },
      {
        id: `GF-CSV2`,
        category: 'Slogan',
        fact: 'Official brand tagline: "Velocity with Precision". Never use "Fast and Cheap".',
        citation: 'Brand Guidelines 2026, Section 1.2',
        status: 'Active',
        notes: 'Imported from Guidelines_v2.csv'
      }
    ];
    setFacts([...imported, ...facts]);
    onNotify('Successfully ingested 2 records from Q4_Pricing_Master.csv!');
  };

  return (
    <div className="dashboard-card">
      <div className="card-header-bar">
        <div>
          <h3 className="card-title">
            <Database size={18} color="var(--primary-light)" />
            'Golden Facts' Knowledge Repository
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            The ground truth knowledge base indexed for RAG claim verification and LLM inline citations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isAdmin ? (
            <>
              <button className="btn-secondary" onClick={handleSimulateCSV} title="Upload CSV/Excel Spreadsheet">
                <UploadCloud size={16} />
                <span>Import CSV/Excel</span>
              </button>
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={16} />
                <span>Add Golden Fact</span>
              </button>
            </>
          ) : (
            <span className="badge badge-cyan" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={11} /> Verified Facts (Read-Only)
            </span>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '38px' }}
            placeholder="Search verified product specs, pricing, and citations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Facts Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Verified Fact / Specification</th>
              <th>Citation Reference</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFacts.map((item) => (
              <tr key={item.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{item.id}</td>
                <td>
                  <span className="badge badge-cyan">{item.category}</span>
                </td>
                <td style={{ color: 'var(--text-main)', fontWeight: '500', maxWidth: '420px' }}>
                  {item.fact}
                  {item.notes && (
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {item.notes}
                    </div>
                  )}
                </td>
                <td style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{item.citation}</td>
                <td>
                  <span className="badge badge-emerald">
                    <CheckCircle size={10} style={{ marginRight: '4px' }} /> Active
                  </span>
                </td>
                <td>
                  {isAdmin ? (
                    <button 
                      className="btn-danger" 
                      onClick={() => handleDelete(item.id)}
                      title="Remove Fact (Brand Admin)"
                    >
                      <Trash2 size={13} />
                    </button>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Locked</span>
                  )}
                </td>
              </tr>
            ))}
            {filteredFacts.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-dim)' }}>
                  No Golden Facts found matching your search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Fact Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="card-header-bar">
              <h3 className="card-title">Add Verified Golden Fact</h3>
            </div>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="form-select"
                  value={newFact.category}
                  onChange={(e) => setNewFact({ ...newFact, category: e.target.value })}
                >
                  <option value="Pricing">Pricing Matrix</option>
                  <option value="Slogan">Official Tagline & Slogan</option>
                  <option value="Product Specs">Product Capabilities</option>
                  <option value="Compliance">Security & Privacy</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Verified Fact / Statement</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. Starter tier is $49/mo billed monthly ($39/mo annually). The legacy $29/mo is obsolete."
                  value={newFact.fact}
                  onChange={(e) => setNewFact({ ...newFact, fact: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Source Citation</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Golden Facts: Pricing Matrix v2.4, Item 1"
                  value={newFact.citation}
                  onChange={(e) => setNewFact({ ...newFact, citation: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Index into RAG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
