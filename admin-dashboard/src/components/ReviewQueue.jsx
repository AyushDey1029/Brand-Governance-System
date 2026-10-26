import React, { useState } from 'react';
import { CheckSquare, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function ReviewQueue({ reviews, setReviews, onNotify }) {
  const handleApprove = (id) => {
    setReviews(reviews.filter(r => r.id !== id));
    onNotify(`Draft ${id} approved and cleared for publication!`);
  };

  const handleReject = (id) => {
    setReviews(reviews.filter(r => r.id !== id));
    onNotify(`Draft ${id} returned to author with revision notes.`);
  };

  return (
    <div className="dashboard-card">
      <div className="card-header-bar">
        <div>
          <h3 className="card-title">
            <CheckSquare size={18} color="var(--primary-light)" />
            Escalated Compliance Review Queue
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            High-risk policy flags escalated by content creators for compliance officer sign-off.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {reviews.map((item) => (
          <div 
            key={item.id}
            style={{
              background: 'var(--bg-dark)',
              border: '1px solid var(--border-medium)',
              borderLeft: '4px solid var(--rose)',
              borderRadius: '10px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-main)' }}>
                  {item.id}
                </span>
                <span className="badge badge-cyan">{item.cms}</span>
                <span style={{ fontSize: '12.5px', color: 'var(--text-dim)' }}>
                  Submitted by <strong>{item.author}</strong> ({item.submittedAt})
                </span>
              </div>

              <span className="badge badge-rose">High Risk Flag</span>
            </div>

            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '13px' }}>
              <div style={{ color: 'var(--text-dim)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>
                Flagged Draft Excerpt
              </div>
              <div style={{ color: 'var(--text-main)', fontStyle: 'italic' }}>
                "{item.excerpt}"
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '12.5px' }}>
              <div>
                <strong style={{ color: '#FB7185' }}>Policy Violation:</strong> {item.violation}
              </div>
              <div>
                <strong style={{ color: 'var(--cyan)' }}>Citation Reference:</strong> {item.citation}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
              <button 
                className="btn-secondary" 
                onClick={() => handleReject(item.id)}
              >
                <XCircle size={14} color="var(--rose)" />
                <span>Request Revision</span>
              </button>
              <button 
                className="btn-primary" 
                style={{ background: 'var(--emerald)' }}
                onClick={() => handleApprove(item.id)}
              >
                <CheckCircle size={14} />
                <span>Sign-Off & Approve</span>
              </button>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <CheckCircle size={40} color="var(--emerald)" style={{ marginBottom: '12px' }} />
            <h3>Review Queue Clear</h3>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>All escalated drafts have been audited and signed off.</p>
          </div>
        )}
      </div>
    </div>
  );
}
