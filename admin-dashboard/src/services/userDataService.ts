/**
 * Inkloom AI — User Data & Workspace Storage Service
 * 
 * Provides isolated, tenant- and user-scoped data persistence:
 * - Scopes drafts, snapshots, facts, rules, and telemetry by { tenant_id, user_id, role }
 * - Separates Demo (Nexus Cloud sandbox) from Real Users
 * - Manages fresh user empty states, autosave, and onboarding progress
 */

import { MOCK_GOLDEN_FACTS, MOCK_BRAND_RULES } from "../data/mockData";
import { GoldenFact, BrandRule } from "../types";

export interface VersionSnapshot {
  id: string;
  timestamp: string;
  label: string;
  text: string;
  score: number | null;
}

export interface UserSavedDraft {
  text: string;
  lastSavedAt: string | null;
  snapshots: VersionSnapshot[];
}

export interface AdminOnboardingState {
  factsAdded: boolean;
  rulesAdded: boolean;
  teamInvited: boolean;
}

export interface UserAuditRecord {
  id: string;
  timestamp: string;
  channel: string;
  snippet: string;
  score: number;
  status: "compliant" | "warning" | "flagged";
  issuesCount: number;
}

const DEMO_DRAFT_TEXT =
  "Nexus Cloud delivers guaranteed 100% uptime with our unbeatable 30% discount this quarter. It is the cheapest cloud infrastructure available anywhere!";

const DEMO_SNAPSHOT: VersionSnapshot = {
  id: "snap-demo-1",
  timestamp: "Earlier today",
  label: "Audited: Score 54",
  text: DEMO_DRAFT_TEXT,
  score: 54,
};

class UserDataService {
  private getDraftKey(tenantId: string, userId: string): string {
    return `inkloom_draft_${tenantId}_${userId}`;
  }

  private getHistoryKey(tenantId: string, userId: string): string {
    return `inkloom_history_${tenantId}_${userId}`;
  }

  private getFactsKey(tenantId: string): string {
    return `inkloom_facts_${tenantId}`;
  }

  private getRulesKey(tenantId: string): string {
    return `inkloom_rules_${tenantId}`;
  }

  private getOnboardingKey(tenantId: string): string {
    return `inkloom_onboarding_${tenantId}`;
  }

  // =========================================================================
  // 1. DRAFT & SNAPSHOTS MANAGEMENT
  // =========================================================================

  public getDraft(tenantId: string, userId: string, isDemo: boolean): UserSavedDraft {
    if (isDemo) {
      return {
        text: DEMO_DRAFT_TEXT,
        lastSavedAt: "Just now",
        snapshots: [DEMO_SNAPSHOT],
      };
    }

    try {
      const raw = localStorage.getItem(this.getDraftKey(tenantId, userId));
      if (!raw) {
        return {
          text: "",
          lastSavedAt: null,
          snapshots: [],
        };
      }
      return JSON.parse(raw);
    } catch {
      return {
        text: "",
        lastSavedAt: null,
        snapshots: [],
      };
    }
  }

  public saveDraft(tenantId: string, userId: string, text: string, isDemo: boolean): string {
    if (isDemo) return "Just now";

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    try {
      const existing = this.getDraft(tenantId, userId, false);
      const updated: UserSavedDraft = {
        ...existing,
        text,
        lastSavedAt: formattedTime,
      };
      localStorage.setItem(this.getDraftKey(tenantId, userId), JSON.stringify(updated));
      return formattedTime;
    } catch (e) {
      console.warn("[UserDataService] Could not save draft:", e);
      return formattedTime;
    }
  }

  public saveSnapshot(
    tenantId: string,
    userId: string,
    label: string,
    text: string,
    score: number | null,
    isDemo: boolean
  ): VersionSnapshot[] {
    const newSnapshot: VersionSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      label,
      text,
      score,
    };

    if (isDemo) {
      return [newSnapshot, DEMO_SNAPSHOT];
    }

    try {
      const existing = this.getDraft(tenantId, userId, false);
      const snapshots = [newSnapshot, ...(existing.snapshots || [])].slice(0, 20);
      const updated: UserSavedDraft = {
        ...existing,
        snapshots,
      };
      localStorage.setItem(this.getDraftKey(tenantId, userId), JSON.stringify(updated));
      return snapshots;
    } catch {
      return [newSnapshot];
    }
  }

  // =========================================================================
  // 2. AUDIT HISTORY & TELEMETRY
  // =========================================================================

  public getAudits(tenantId: string, userId: string, isDemo: boolean): UserAuditRecord[] {
    if (isDemo) {
      return [
        {
          id: "AUD-104",
          timestamp: "10 mins ago",
          channel: "linkedin",
          snippet: "Nexus Cloud delivers guaranteed 100% uptime with our unbeatable 30% discount...",
          score: 54,
          status: "warning",
          issuesCount: 2,
        },
        {
          id: "AUD-103",
          timestamp: "1 hour ago",
          channel: "blog",
          snippet: "Sign up today for our starter tier at $49/mo with Velocity with Precision.",
          score: 100,
          status: "compliant",
          issuesCount: 0,
        },
      ];
    }

    try {
      const raw = localStorage.getItem(this.getHistoryKey(tenantId, userId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public recordAudit(
    tenantId: string,
    userId: string,
    record: Omit<UserAuditRecord, "id" | "timestamp">,
    isDemo: boolean
  ): UserAuditRecord[] {
    if (isDemo) return this.getAudits(tenantId, userId, true);

    const now = new Date();
    const newRecord: UserAuditRecord = {
      id: `AUD-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ...record,
    };

    try {
      const existing = this.getAudits(tenantId, userId, false);
      const updated = [newRecord, ...existing].slice(0, 50);
      localStorage.setItem(this.getHistoryKey(tenantId, userId), JSON.stringify(updated));
      return updated;
    } catch {
      return [newRecord];
    }
  }

  // =========================================================================
  // 3. ADMIN ONBOARDING CHECKLIST
  // =========================================================================

  public getAdminOnboarding(tenantId: string, isDemo: boolean): AdminOnboardingState {
    if (isDemo) {
      return { factsAdded: true, rulesAdded: true, teamInvited: true };
    }

    try {
      const raw = localStorage.getItem(this.getOnboardingKey(tenantId));
      if (!raw) {
        return { factsAdded: false, rulesAdded: false, teamInvited: false };
      }
      return JSON.parse(raw);
    } catch {
      return { factsAdded: false, rulesAdded: false, teamInvited: false };
    }
  }

  public setAdminOnboarding(
    tenantId: string,
    step: keyof AdminOnboardingState,
    value: boolean,
    isDemo: boolean
  ): AdminOnboardingState {
    if (isDemo) return { factsAdded: true, rulesAdded: true, teamInvited: true };

    try {
      const current = this.getAdminOnboarding(tenantId, false);
      const updated = { ...current, [step]: value };
      localStorage.setItem(this.getOnboardingKey(tenantId), JSON.stringify(updated));
      return updated;
    } catch {
      return { factsAdded: false, rulesAdded: false, teamInvited: false };
    }
  }

  // =========================================================================
  // 4. GOLDEN FACTS & RULES COUNTS
  // =========================================================================

  public getGoldenFacts(tenantId: string, isDemo: boolean): GoldenFact[] {
    if (isDemo) {
      return MOCK_GOLDEN_FACTS.filter((f) => f.brandId === "brand-nexus" || !f.brandId);
    }

    try {
      const raw = localStorage.getItem(this.getFactsKey(tenantId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getBrandRules(tenantId: string, isDemo: boolean): BrandRule[] {
    if (isDemo) {
      return MOCK_BRAND_RULES.filter((r) => r.brandId === "brand-nexus" || !r.brandId);
    }

    try {
      const raw = localStorage.getItem(this.getRulesKey(tenantId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public clearUserData(tenantId: string, userId: string): void {
    try {
      localStorage.removeItem(this.getDraftKey(tenantId, userId));
      localStorage.removeItem(this.getHistoryKey(tenantId, userId));
    } catch (e) {
      console.warn("Could not clear user data:", e);
    }
  }
}

export const userDataService = new UserDataService();

