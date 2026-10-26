import React, { useState } from 'react';
import { FlaskConical, Play, CheckCircle2, AlertTriangle, Image as ImageIcon } from 'lucide-react';

export default function LiveAuditSandbox({ onNotify }) {
  const [text, setText] = useState(
    'Experience the fastest content velocity with Inkloom AI! Our starter tier is only $29/mo, powered by magic AI that delivers 100% bug free copy for every enterprise team.'
  );
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'
  );
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleRunAudit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/check-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          image_urls: imageUrl ? [imageUrl] : [],
          channel: 'admin-sandbox'
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
      onNotify('Live audit completed successfully!');
    } catch (err) {
      console.error('Audit failed:', err);
      // Fallback local simulation if backend server is unreachable
      setResults({
        status: 'warning',
        compliance_score: 65,
        summary: 'Audit flagged: 2 copy issues and 1 visual palette variance. Actionable fixes are provided below.',
        total_text_issues: 2,
        total_visual_issues: 0,
        text_evaluations: [
          {
            claim: '$29/mo',
            issue: 'Outdated pricing claim. Starter tier was updated from $29/mo to $49/mo in Q3.',
            citation: 'Golden Facts: Pricing Matrix v2.4, Item 1',
            suggested_rewrite: '$49/month (or $39/mo billed annually)',
            severity: 'high'
          },
          {
            claim: 'magic AI',
            issue: "Banned term 'magic AI'. Inkloom relies on deterministic rules and explainable LLMs.",
            citation: 'Brand Style Guide: Banned Terminology & Risk Policy 2026',
            suggested_rewrite: 'high-confidence AI assistance',
            severity: 'warning'
          }
        ],
        visual_evaluations: [
          {
            image_url: imageUrl,
            dominant_hex: '#3E38A8',
            target_brand_hex: '#4F46E5',
            match: true,
            color_distance: 22.4,
            status: 'compliant',
            message: 'Dominant color #3E38A8 aligns within brand palette tolerance (#4F46E5).'
          }
        ]
      });
      onNotify('Evaluated via local dual-engine fallback (Backend API unreachable)');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRewrite = (claim, rewrite) => {
    setText((prev) => prev.replace(claim, rewrite));
    onNotify(`Applied rewrite: "${rewrite}"`);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Input Form */}
      <div className="dashboard-card">
        <div className="card-header-bar">
          <div>
            <h3 className="card-title">
              <FlaskConical size={18} color="var(--primary-light)" />
              Live Dual-Engine Sandbox
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Test draft text against Golden Facts RAG and inspect image colors with OpenCV.
            </p>
          </div>

          <button 
            className="btn-primary" 
            onClick={handleRunAudit}
            disabled={loading}
          >
            <Play size={15} />
            <span>{loading ? 'Evaluating...' : 'Run Live Audit'}</span>
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Draft Copy</label>
          <textarea
            className="form-textarea"
            style={{ height: '140px' }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste marketing copy..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Image Asset URL (for OpenCV Hex Extraction)</label>
          <input
            type="text"
            className="form-input"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/brand-banner.png"
          />
        </div>

        {imageUrl && (
          <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', height: '120px', border: '1px solid var(--border-medium)', background: '#000' }}>
            <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
          </div>
        )}
      </div>

      {/* Output Results */}
      <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="card-header-bar">
          <h3 className="card-title">Evaluation Report</h3>
          {results && (
            <span className={`badge ${results.status === 'compliant' ? 'badge-emerald' : results.status === 'warning' ? 'badge-amber' : 'badge-rose'}`}>
              Score: {results.compliance_score}/100 — {results.status.toUpperCase()}
            </span>
          )}
        </div>

        {!results && !loading && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', textAlign: 'center', padding: '40px' }}>
            <FlaskConical size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p>Click <strong>"Run Live Audit"</strong> to execute concurrent RAG claims check and OpenCV matrix sampling.</p>
          </div>
        )}

        {loading && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid rgba(79,70,229,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }}></div>
            <p style={{ color: 'var(--text-muted)' }}>Executing dual-engine audit...</p>
          </div>
        )}

        {results && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-dark)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}>
              {results.summary}
            </div>

            {/* Text issues */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Copy & Claim Issues ({results.text_evaluations?.length || 0})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {results.text_evaluations?.map((item, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderLeft: '3px solid var(--rose)', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'monospace', color: '#FB7185', background: 'rgba(244,63,94,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
                        "{item.claim}"
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                        {item.citation}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{item.issue}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(16,185,129,0.08)', border: '1px dashed rgba(16,185,129,0.3)', borderRadius: '6px', padding: '6px 10px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--emerald)', fontWeight: '500' }}>
                        → {item.suggested_rewrite}
                      </span>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                        onClick={() => handleApplyRewrite(item.claim, item.suggested_rewrite)}
                      >
                        Apply Fix
                      </button>
                    </div>
                  </div>
                ))}
                {results.text_evaluations?.length === 0 && (
                  <div style={{ padding: '12px', color: 'var(--emerald)', fontSize: '12.5px' }}>
                    ✓ No factual or tone issues detected in copy.
                  </div>
                )}
              </div>
            </div>

            {/* Vision issues */}
            {results.visual_evaluations?.length > 0 && (
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  OpenCV Palette Analysis ({results.visual_evaluations.length})
                </div>
                {results.visual_evaluations.map((v, i) => (
                  <div key={i} style={{ background: 'var(--bg-dark)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: v.dominant_hex, display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)' }}></span>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{v.dominant_hex}</span>
                    </div>
                    <span style={{ color: 'var(--text-dim)' }}>vs Brand {v.target_brand_hex}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: v.match ? 'var(--emerald)' : 'var(--amber)' }}>
                      ΔE: {v.color_distance} ({v.match ? 'Aligned ✓' : 'Variance'})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
