import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Grainient from './components/Grainient';
import AuthModal from './components/AuthModal';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';

// Teammate Context & Providers
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';

// Teammate Layout & Views
import { AppLayout } from './components/AppLayout';
import { AtmosphericBackground } from './components/AtmosphericBackground';
import { OverviewView } from './views/OverviewView';
import { CreatorStudioView } from './views/CreatorStudioView';
import { ReviewQueueView } from './views/ReviewQueueView';
import { GoldenFactsView } from './views/GoldenFactsView';
import { BrandRulesView } from './views/BrandRulesView';
import { VisualAssetsView } from './views/VisualAssetsView';
import { AuditHistoryView } from './views/AuditHistoryView';
import { AnalyticsView } from './views/AnalyticsView';
import { BrandSetupView } from './views/BrandSetupView';
import { SettingsView } from './views/SettingsView';

const CREATOR_ALLOWED_ROUTES = [
  'overview',
  'creator-studio',
  'golden-facts',
  'visual-assets',
  'audit-history',
];

function DashboardRouter({ onGoHome }) {
  const { currentRoute, setCurrentRoute, activeRole } = useWorkspace();
  const { role, isDemo, status } = useAuth();
  const { showToast } = useNotification();

  // Enforce Role-Based Route Guards
  useEffect(() => {
    if (status === 'signed_out') {
      onGoHome();
      return;
    }

    const isCreator = (role === 'creator' || activeRole === 'CONTENT_CREATOR') && !isDemo;
    if (isCreator && !CREATOR_ALLOWED_ROUTES.includes(currentRoute)) {
      setCurrentRoute('overview');
      showToast({
        type: 'warning',
        title: 'Access Restricted',
        message: "You don't have access to that page.",
      });
    }
  }, [currentRoute, role, activeRole, isDemo, status]);

  return (
    <div className="relative min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)]">
      <AtmosphericBackground variant="canvas" />
      <AppLayout onGoHome={onGoHome}>
        {currentRoute === 'overview' && <OverviewView />}
        {currentRoute === 'creator-studio' && <CreatorStudioView />}
        {currentRoute === 'review-queue' && <ReviewQueueView />}
        {currentRoute === 'golden-facts' && <GoldenFactsView />}
        {currentRoute === 'brand-rules' && <BrandRulesView />}
        {currentRoute === 'visual-assets' && <VisualAssetsView />}
        {currentRoute === 'audit-history' && <AuditHistoryView />}
        {currentRoute === 'analytics' && <AnalyticsView />}
        {currentRoute === 'brand-setup' && <BrandSetupView />}
        {currentRoute === 'settings' && <SettingsView />}
      </AppLayout>
    </div>
  );
}

function MainApp() {
  const { role, isDemo, enterDemo: authEnterDemo } = useAuth();
  const { setCurrentRoute } = useWorkspace();

  const [viewMode, setViewMode] = useState(() => {
    return window.location.hash === '#dashboard' ? 'dashboard' : 'landing';
  });

  // Keep hash synced with viewMode
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#dashboard') {
        setViewMode('dashboard');
      } else if (!window.location.hash) {
        setViewMode('landing');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleEnterWorkspace = (requestedRole) => {
    setViewMode('dashboard');
    window.location.hash = 'dashboard';
    const targetRole = requestedRole || role;
    if (targetRole === 'admin') {
      setCurrentRoute('overview');
    } else {
      setCurrentRoute('overview');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnterDemo = (requestedRole = 'creator') => {
    authEnterDemo(requestedRole);
    setViewMode('dashboard');
    window.location.hash = 'dashboard';
    setCurrentRoute('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    setViewMode('landing');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {viewMode === 'landing' ? (
        <div className="inkloom-root-canvas">
          {/* Dynamic Animated Grainient Background */}
          <div className="global-grainient-bg">
            <Grainient
              colors={['#120f17', '#2a0f0a', '#9a3412', '#f97316', '#fed7aa']}
              angle={55}
              flow={0.9}
              speed={0.8}
              silk={0.35}
              grainAmount={0.06}
              interactive={true}
              stir={1.2}
              clickSwirl={true}
              intro={false}
            />
            <div className="global-grainient-overlay landing" />
          </div>

          <div className="inkloom-root-content">
            <LandingPage onEnterDemo={handleEnterDemo} onOpenWorkspace={handleEnterWorkspace} />
          </div>

          {/* Authentication Modal */}
          <AuthModal onEnterWorkspace={handleEnterWorkspace} />
        </div>
      ) : (
        <DashboardRouter onGoHome={goHome} />
      )}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <WorkspaceProvider>
              <MainApp />
            </WorkspaceProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
