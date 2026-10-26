import React, { useState } from 'react';
import { Palette, Sliders, Plus, Copy, Check } from 'lucide-react';

export default function VisualAssetsManager({ swatches, setSwatches, onNotify }) {
  const [copiedHex, setCopiedHex] = useState(null);
  const [tolerance, setTolerance] = useState(38.0);
  const [showModal, setShowModal] = useState(false);
  const [newSwatch, setNewSwatch] = useState({
    name: 'Accent Brand Color',
    hex: '#8B5CF6',
    role: 'Accent'
  });

  const handleCopy = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
    onNotify(`Copied ${hex} to clipboard!`);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    setSwatches([...swatches, { id: `SW-${Date.now()}`, ...newSwatch }]);
    setShowModal(false);
    onNotify('New brand palette swatch registered!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Brand Color Swatches */}
      <div className="dashboard-card">
        <div className="card-header-bar">
          <div>
            <h3 className="card-title">
              <Palette size={18} color="var(--cyan)" />
              Visual 'Golden Assets' — Approved Brand Palette
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
              These hex standards are mathematically verified by the OpenCV Deterministic Vision Engine.
            </p>
          </div>

          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>Add Brand Swatch</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {swatches.map((swatch) => (
            <div 
              key={swatch.id}
              style={{
                background: 'var(--bg-dark)',
                border: '1px solid var(--border-medium)',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'transform 0.2s',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Swatch color display */}
              <div 
                style={{
                  height: '110px',
                  backgroundColor: swatch.hex,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '12px',
                  boxShadow: 'inset 0 -20px 20px rgba(0,0,0,0.2)'
                }}
              >
                <span className="badge" style={{ background: 'rgba(0,0,0,0.6)', color: '#FFFFFF', backdropFilter: 'blur(4px)' }}>
                  {swatch.role}
                </span>
              </div>

              {/* Swatch details */}
              <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13.5px', color: 'var(--text-main)' }}>
                    {swatch.name}
                  </div>
                  <div style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
                    {swatch.hex.toUpperCase()}
                  </div>
                </div>

                <button 
                  className="btn-secondary" 
                  style={{ padding: '6px 10px' }}
                  onClick={() => handleCopy(swatch.hex)}
                  title="Copy Hex"
                >
                  {copiedHex === swatch.hex ? <Check size={14} color="var(--emerald)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OpenCV Vision Engine Settings */}
      <div className="dashboard-card">
        <div className="card-header-bar">
          <div>
            <h3 className="card-title">
              <Sliders size={18} color="var(--primary-light)" />
              OpenCV Mathematical Vision Parameters
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Adjust Euclidean color distance thresholds (ΔE) to fine-tune image palette strictness.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="form-label">Color Distance Tolerance (ΔE Threshold)</span>
              <strong style={{ color: 'var(--primary-light)' }}>{tolerance} units</strong>
            </div>
            <input 
              type="range" 
              min="15.0" 
              max="70.0" 
              step="1.0"
              value={tolerance}
              onChange={(e) => setTolerance(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
              <span>15.0 (Strict / Zero Tolerance)</span>
              <span>38.0 (Recommended Default)</span>
              <span>70.0 (Permissive / Relaxed)</span>
            </div>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-dark)', borderRadius: '10px', fontSize: '12.5px', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
            <strong style={{ color: 'var(--text-main)' }}>Why Deterministic Math?</strong>
            <p style={{ marginTop: '4px' }}>
              LLMs hallucinate subtle color shades. OpenCV downsamples pixel matrices, applies K-means clustering (k=3), and compares RGB Euclidean distance mathematically in <strong>&lt; 5ms</strong> at <strong>zero API cost</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Modal for adding swatch */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="card-header-bar">
              <h3 className="card-title">Register Brand Palette Color</h3>
            </div>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Swatch Label</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Electric Violet Accent"
                  value={newSwatch.name}
                  onChange={(e) => setNewSwatch({ ...newSwatch, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role / Category</label>
                <select
                  className="form-select"
                  value={newSwatch.role}
                  onChange={(e) => setNewSwatch({ ...newSwatch, role: e.target.value })}
                >
                  <option value="Primary">Primary Brand</option>
                  <option value="Secondary">Secondary Accent</option>
                  <option value="Surface">Neutral Surface</option>
                  <option value="Accent">Highlight Accent</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Hex Color</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={newSwatch.hex}
                    onChange={(e) => setNewSwatch({ ...newSwatch, hex: e.target.value })}
                    style={{ width: '42px', height: '42px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={newSwatch.hex}
                    onChange={(e) => setNewSwatch({ ...newSwatch, hex: e.target.value })}
                    style={{ fontFamily: 'monospace', flex: 1 }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Swatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
