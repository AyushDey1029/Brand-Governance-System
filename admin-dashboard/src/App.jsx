import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AnalyticsOverview from './components/AnalyticsOverview';
import GoldenFactsManager from './components/GoldenFactsManager';
import PolicyRulesManager from './components/PolicyRulesManager';
import VisualAssetsManager from './components/VisualAssetsManager';
import LiveAuditSandbox from './components/LiveAuditSandbox';
import ReviewQueue from './components/ReviewQueue';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);
  const [checkingApi, setCheckingApi] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    connected: false,
    version: '0.1.0',
    app: 'Inkloom AI Backend'
  });

  // Knowledge Base State
  const [facts, setFacts] = useState([
    {
      id: 'GF-01',
      category: 'Pricing',
      fact: 'Starter Tier is $49/month billed monthly, or $39/month billed annually. (The legacy $29/mo tier was discontinued in Q3 2024).',
      citation: 'Golden Facts: Pricing Matrix v2.4, Item 1',
      status: 'Active',
      notes: 'Crucial for blog & ads audits'
    },
    {
      id: 'GF-02',
      category: 'Pricing',
      fact: 'Enterprise Tier starts at $499/mo, including SOC2 Type II compliance, VPC isolation, and dedicated SLA.',
      citation: 'Golden Facts: Pricing Matrix v2.4, Item 3',
      status: 'Active',
      notes: 'Custom annual contracts'
    },
    {
      id: 'GF-03',
      category: 'Slogan',
      fact: 'Primary official brand tagline: "Velocity with Precision". Secondary: "Explainable Brand Governance for Modern Creators".',
      citation: 'Brand Style Guide: Official Taglines v2.4',
      status: 'Active',
      notes: 'Core messaging'
    },
    {
      id: 'GF-04',
      category: 'Compliance',
      fact: 'Inkloom AI processes DOM text transiently and enforces zero model-training on customer data.',
      citation: 'Enterprise Security Whitepaper 2026',
      status: 'Active',
      notes: 'Privacy compliance'
    }
  ]);

  // Policy & Tone Rules State
  const [policies, setPolicies] = useState([
    {
      id: 'POL-01',
      bannedTerm: 'magic AI',
      approvedAlternative: 'high-confidence AI assistance',
      severity: 'warning',
      reason: 'Banned term. Inkloom relies on deterministic rules and explainable LLMs.'
    },
    {
      id: 'POL-02',
      bannedTerm: 'cheapest',
      approvedAlternative: 'most cost-effective enterprise solution',
      severity: 'warning',
      reason: 'Disallowed superlative. Violates brand voice standards.'
    },
    {
      id: 'POL-03',
      bannedTerm: 'flawless',
      approvedAlternative: 'rigorous and consistent',
      severity: 'warning',
      reason: 'Disallowed absolute claim. Avoid 100% perfection guarantees.'
    },
    {
      id: 'POL-04',
      bannedTerm: '100% bug free',
      approvedAlternative: 'extensively tested and highly reliable',
      severity: 'high',
      reason: 'High-risk legal liability. Absolute guarantees are prohibited.'
    }
  ]);

  // Visual Golden Assets State
  const [swatches, setSwatches] = useState([
    { id: 'SW-1', name: 'Inkloom Indigo', hex: '#4F46E5', role: 'Primary' },
    { id: 'SW-2', name: 'Cyan Glow Accent', hex: '#06B6D4', role: 'Secondary' },
    { id: 'SW-3', name: 'Deep Slate Base', hex: '#0F172A', role: 'Surface' },
    { id: 'SW-4', name: 'Emerald Compliance', hex: '#10B981', role: 'Accent' }
  ]);

  // Escalated Review Queue State
  const [reviews, setReviews] = useState([
    {
      id: 'REV-104',
      cms: 'WordPress Blog',
      author: 'Marcus Vance',
      submittedAt: 'Today at 10:15 AM',
      excerpt: 'Upgrade to our starter edition today for only $29/mo and enjoy effortless content velocity with magic AI.',
      violation: 'Outdated legacy pricing ($29) + Disallowed superlative ("magic AI")',
      citation: 'Golden Facts: Pricing Matrix v2.4, Item 1'
    },
    {
      id: 'REV-105',
      cms: 'LinkedIn Campaign',
      author: 'Elena Rostova',
      submittedAt: 'Today at 09:30 AM',
      excerpt: 'Guaranteed 100% bug free brand governance with zero human overhead.',
      violation: 'High-risk absolute guarantee ("100% bug free")',
      citation: 'Brand Style Guide: Banned Terminology 2026'
    }
  ]);

  // API Health Check
  const checkHealth = async () => {
    setCheckingApi(true);
    try {
      const res = await fetch('/health');
      if (res.ok) {
        const data = await res.json();
        setApiStatus({
          connected: true,
          version: data.version || '0.1.0',
          app: data.app || 'Inkloom AI Backend'
        });
      } else {
        setApiStatus((prev) => ({ ...prev, connected: false }));
      }
    } catch {
      setApiStatus((prev) => ({ ...prev, connected: false }));
    } finally {
      setCheckingApi(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        if (data.reviews) {
          setReviews(data.reviews);
        }
      }
    } catch (e) {
      console.warn("Could not fetch reviews:", e);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchReviews();
    const interval = setInterval(() => {
      checkHealth();
      fetchReviews();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Executive Governance Dashboard';
      case 'facts': return 'Golden Facts Knowledge Base';
      case 'policies': return 'Brand Tone & Risk Policies';
      case 'assets': return 'Visual Brand Palette & OpenCV Assets';
      case 'sandbox': return 'Dual-Engine Live Audit Sandbox';
      case 'reviews': return 'Escalated Review & Sign-Off Queue';
      default: return 'Inkloom AI Governance Hub';
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        counts={{
          facts: facts.length,
          policies: policies.length,
          assets: swatches.length,
          reviews: reviews.length
        }}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Header 
          currentTitle={getTabTitle()}
          apiStatus={apiStatus}
          onRefreshStatus={checkHealth}
          checking={checkingApi}
        />

        <main className="content-container">
          {activeTab === 'overview' && (
            <AnalyticsOverview onNavigate={setActiveTab} />
          )}

          {activeTab === 'facts' && (
            <GoldenFactsManager 
              facts={facts} 
              setFacts={setFacts} 
              onNotify={triggerToast} 
            />
          )}

          {activeTab === 'policies' && (
            <PolicyRulesManager 
              policies={policies} 
              setPolicies={setPolicies} 
              onNotify={triggerToast} 
            />
          )}

          {activeTab === 'assets' && (
            <VisualAssetsManager 
              swatches={swatches} 
              setSwatches={setSwatches} 
              onNotify={triggerToast} 
            />
          )}

          {activeTab === 'sandbox' && (
            <LiveAuditSandbox onNotify={triggerToast} />
          )}

          {activeTab === 'reviews' && (
            <ReviewQueue 
              reviews={reviews} 
              setReviews={setReviews} 
              onNotify={triggerToast} 
            />
          )}
        </main>
      </div>

      {/* Toast Notification */}
      {toast && <div className="toast-msg">✓ {toast}</div>}
    </div>
  );
}
