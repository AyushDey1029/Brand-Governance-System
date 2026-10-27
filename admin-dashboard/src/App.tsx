import React from "react";
import { NotificationProvider } from "./context/NotificationContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { WorkspaceProvider, useWorkspace } from "./context/WorkspaceContext";
import { LandingView } from "./views/LandingView";
import { AppLayout } from "./components/AppLayout";
import { OverviewView } from "./views/OverviewView";
import { CreatorStudioView } from "./views/CreatorStudioView";
import { GoldenFactsView } from "./views/GoldenFactsView";
import { BrandRulesView } from "./views/BrandRulesView";
import { VisualAssetsView } from "./views/VisualAssetsView";
import { ReviewQueueView } from "./views/ReviewQueueView";
import { AuditHistoryView } from "./views/AuditHistoryView";
import { AnalyticsView } from "./views/AnalyticsView";
import { BrandSetupView } from "./views/BrandSetupView";
import { SettingsView } from "./views/SettingsView";

import { AtmosphericBackground } from "./components/AtmosphericBackground";

/** Synchronizes authenticated user-scoped theme preferences without requiring backend migration */
const ThemeUserSync: React.FC = () => {
  const { currentUser } = useWorkspace();
  const { syncUserTheme } = useTheme();

  React.useEffect(() => {
    syncUserTheme(currentUser?.id || null);
  }, [currentUser?.id, syncUserTheme]);

  return null;
};

const WorkspaceRouter: React.FC = () => {
  const { isAuthenticated, currentRoute } = useWorkspace();

  if (!isAuthenticated) {
    return <LandingView />;
  }

  return (
    <AppLayout>
      {currentRoute === "overview" && <OverviewView />}
      {currentRoute === "creator-studio" && <CreatorStudioView />}
      {currentRoute === "golden-facts" && <GoldenFactsView />}
      {currentRoute === "brand-rules" && <BrandRulesView />}
      {currentRoute === "visual-assets" && <VisualAssetsView />}
      {currentRoute === "review-queue" && <ReviewQueueView />}
      {currentRoute === "audit-history" && <AuditHistoryView />}
      {currentRoute === "analytics" && <AnalyticsView />}
      {currentRoute === "brand-setup" && <BrandSetupView />}
      {currentRoute === "settings" && <SettingsView />}
    </AppLayout>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AtmosphericBackground />
      <NotificationProvider>
        <WorkspaceProvider>
          <ThemeUserSync />
          <WorkspaceRouter />
        </WorkspaceProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
