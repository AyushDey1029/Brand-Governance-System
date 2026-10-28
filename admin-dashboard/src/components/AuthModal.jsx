import React, { useState } from 'react';
import { 
  Shield, 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  Crown,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ onEnterWorkspace }) {
  const { 
    authModalOpen, 
    authModalMode, 
    setAuthModalMode, 
    authPortal,
    setAuthPortal,
    closeAuthModal, 
    login, 
    signup, 
    loginAsDemo 
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('Acme Corp');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!authModalOpen) return null;

  const isAdminPortal = authPortal === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authModalMode === 'signup') {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await signup(email.trim(), password, fullName.trim(), authPortal);
        setSuccessMsg(`Account created successfully! Welcome to Inkloom AI ${isAdminPortal ? 'Brand Governance' : 'Creator Portal'}.`);
      } else {
        await login(email.trim(), password);
        setSuccessMsg('Signed in successfully!');
      }

      setTimeout(() => {
        closeAuthModal();
        if (onEnterWorkspace) onEnterWorkspace(authPortal);
      }, 700);
    } catch (err) {
      console.error('[Auth Error]', err);
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypass = () => {
    loginAsDemo(authPortal);
    if (onEnterWorkspace) onEnterWorkspace(authPortal);
  };

  return (
    <div className="auth-modal-backdrop" onClick={closeAuthModal}>
      <div 
        className={`auth-modal-container ${isAdminPortal ? 'admin-theme' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Bar with Portal Selector & Aligned Close Button */}
        <div className="auth-modal-top-bar">
          <div className="auth-portal-selector">
            <button 
              type="button"
              className={`portal-select-btn ${!isAdminPortal ? 'active' : ''}`}
              onClick={() => {
                setAuthPortal('creator');
                setErrorMsg('');
                setSuccessMsg('');
              }}
            >
              <Sparkles size={14} />
              <span>Content Creator</span>
            </button>
            <button 
              type="button"
              className={`portal-select-btn ${isAdminPortal ? 'active' : ''}`}
              onClick={() => {
                setAuthPortal('admin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
            >
              <Crown size={14} />
              <span>Company / Admin</span>
            </button>
          </div>

          <button 
            className="auth-modal-close-aligned" 
            onClick={closeAuthModal}
            aria-label="Close dialog"
            title="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Header Icon & Title */}
        <div className="auth-modal-header">
          <div className={`auth-brand-badge ${isAdminPortal ? 'admin' : ''}`}>
            {isAdminPortal ? <Crown size={24} color="#FDE047" /> : <Shield size={24} color="#FFFFFF" />}
          </div>
          <div className="auth-header-text">
            <h3>
              {isAdminPortal 
                ? (authModalMode === 'signup' ? 'Company Admin Registration' : 'Brand Governance Admin Portal')
                : (authModalMode === 'signup' ? 'Creator Registration' : 'Creator Portal Sign In')}
            </h3>
            <p>
              {isAdminPortal 
                ? 'Centralized Policy Enforcement, Golden Facts Indexing & Review Sign-Off'
                : 'Autonomous Brand Governance for High-Velocity Marketing'}
            </p>
          </div>
        </div>



        {/* Tabs: Sign In vs Create Account */}
        <div className="auth-tab-switch">
          <button 
            type="button"
            className={`auth-tab-btn ${authModalMode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setAuthModalMode('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={`auth-tab-btn ${authModalMode === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setAuthModalMode('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
          >
            Create Account
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="auth-feedback-box error">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-feedback-box success">
            <CheckCircle2 size={15} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="auth-form-fields">
          {authModalMode === 'signup' && (
            <>
              <div className="auth-field-group">
                <label>Full Name</label>
                <div className="auth-input-wrap">
                  <User size={16} className="auth-field-icon" />
                  <input 
                    type="text" 
                    placeholder={isAdminPortal ? "e.g. Alex Morgan (Brand Manager)" : "e.g. Jordan Lee"} 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {isAdminPortal && (
                <div className="auth-field-group">
                  <label>Company / Organization Name</label>
                  <div className="auth-input-wrap">
                    <Building2 size={16} className="auth-field-icon" />
                    <input 
                      type="text" 
                      placeholder="e.g. Acme Corporation" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="auth-field-group">
            <label>{isAdminPortal ? "Admin Work Email" : "Work Email"}</label>
            <div className="auth-input-wrap">
              <Mail size={16} className="auth-field-icon" />
              <input 
                type="email" 
                placeholder={isAdminPortal ? "brand-admin@company.com" : "creator@company.com"} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-field-group">
            <label>Password</label>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-field-icon" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={`auth-submit-btn ${isAdminPortal ? 'admin' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>
                  {isAdminPortal
                    ? (authModalMode === 'signup' ? 'Create Admin Account' : 'Sign In as Brand Administrator')
                    : (authModalMode === 'signup' ? 'Create Creator Account' : 'Sign In to Workspace')}
                </span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Bypass Footer */}
        <div className="auth-demo-divider">
          <span>OR HACKATHON EVALUATION</span>
        </div>

        <button 
          type="button" 
          className={`auth-demo-quick-btn ${isAdminPortal ? 'admin' : ''}`}
          onClick={handleDemoBypass}
        >
          {isAdminPortal ? (
            <>
              <Crown size={15} color="#FDE047" />
              <span>Quick 1-Click Demo as <strong>Brand Manager</strong></span>
            </>
          ) : (
            <>
              <Sparkles size={15} color="#FED7AA" />
              <span>Quick 1-Click Demo as <strong>Content Creator</strong></span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
