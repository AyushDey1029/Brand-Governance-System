import React, { useState } from 'react';
import { CheckSquare, CheckCircle, XCircle, AlertCircle, ArrowRight, Crown, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ReviewQueue({ reviews, setReviews, onNotify }) {
  const { isAdmin, user, switchRole } = useAuth();

  const handleApprove = async (id) => {
    // Optimistically remove from UI
    setReviews((prev) => prev.filter((r) => r.id !== id));
    onNotify(`Draft ${id} approved and signed off in Supabase!`);
    try {
      await fetch(`/api/reviews/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approved', admin_notes: `Signed off by ${user?.fullName || 'Brand Admin'}` })
      });
    } catch (err) {
      console.error("Failed to persist approval to Supabase:", err);
    }
  };

  const handleReject = async (id) => {
    // Optimistically remove from UI
    setReviews((prev) => prev.filter((r) => r.id !== id));
    onNotify(`Draft ${id} returned to author with revision instructions.`);
    try {
      await fetch(`/api/reviews/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rejected', admin_notes: `Revision requested by ${user?.fullName || 'Brand Admin'}` })
      });
    } catch (err) {
      console.error("Failed to persist rejection to Supabase:", err);
    }
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

        <div>
          {isAdmin ? (
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Crown size={12} color="#FDE047" /> Brand Officer Authorized
            </span>
          ) : (
            <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={12} /> Creator View Only
            </span>
          )}
        </div>
      </div>

      {!isAdmin && (
        <div style={{
          background: 'rgba(249, 115, 22, 0.08)',
          border: '1px solid rgba(249, 115, 22, 0.22)',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12.5px',
          color: '#FED7AA'
        }}>
          <span>
            ℹ️ You are viewing the queue as a <strong>Content Creator</strong>. Sign-off actions are restricted to Brand Administrators.
          </span>
          <button 
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px' }}
            onClick={() => switchRole('admin')}
            title="Switch to Brand Admin persona to test approving/rejecting"
          >
            ⚡ Test as Brand Admin
          </button>
        </div>
      )}

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
              {isAdmin ? (
                <>
                  <button 
                    className="btn-secondary" 
                    onClick={() => handleReject(item.id)}
                    title="Reject draft and return to creator with instructions"
                  >
                    <XCircle size={14} color="var(--rose)" />
                    <span>Request Revision</span>
                  </button>
                  <button 
                    className="btn-primary" 
                    style={{ background: 'var(--emerald)' }}
                    onClick={() => handleApprove(item.id)}
                    title="Approve exception and sign off"
                  >
                    <CheckCircle size={14} />
                    <span>Sign-Off & Approve Exception</span>
                  </button>
                </>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '12px', 
                  color: 'var(--text-dim)',
                  padding: '6px 10px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '6px'
                }}>
                  <Clock size={13} color="#F97316" />
                  <span>Pending Brand Compliance Officer Decision</span>
                </div>
              )}
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