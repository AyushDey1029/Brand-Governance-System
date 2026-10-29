import React, { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Users,
  Key,
  Copy,
  Check,
  Shield,
  Plus,
  RefreshCw,
  Cpu,
  Mail,
  ShieldCheck,
  Clock,
  ExternalLink,
  Palette,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
  Sliders,
  Laptop,
  Layers,
  Database,
  Lock,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../design-system/Card";
import { Button } from "../design-system/Button";
import { Badge } from "../design-system/Badge";
import { Input, Select } from "../design-system/FormControls";
import { Modal } from "../design-system/Modal";
import { AtmosphericBackground } from "../components/AtmosphericBackground";
import { PageHeader } from "../components/PageHeader";
import { useNotification } from "../context/NotificationContext";
import { api } from "../api/client";

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined_at?: string;
}

type SettingsTab = "all" | "team" | "integrations" | "security";

export const SettingsView: React.FC = () => {
  const { activeBrand, isDemoMode } = useWorkspace();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<SettingsTab>("all");
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedInviteUrl, setCopiedInviteUrl] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("CONTENT_CREATOR");
  const [isInviting, setIsInviting] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);

  const [members, setMembers] = useState<MemberItem[]>([
    { id: "m-1", name: "David Vance", email: "david@nexuscloud.io", role: "BRAND_MANAGER", status: "Active" },
    { id: "m-2", name: "Elena Rostova", email: "elena.r@nexuscloud.io", role: "CONTENT_CREATOR", status: "Active" },
    { id: "m-3", name: "Marcus Sterling", email: "m.sterling@legal.nexuscloud.io", role: "COMPLIANCE_REVIEWER", status: "Active" },
  ]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Load real brand members
  const fetchMembers = useCallback(async () => {
    if (!activeBrand?.id) return;
    if (isDemoMode || !api.hasTokens()) return;

    setIsLoadingMembers(true);
    try {
      const realMembers = await api.getBrandMembers(activeBrand.id);
      const mapped: MemberItem[] = realMembers.map((m) => ({
        id: m.user_id,
        name: m.full_name || m.email.split("@")[0],
        email: m.email,
        role: m.role,
        status: "Active",
        joined_at: m.joined_at,
      }));
      setMembers(mapped);
    } catch (err) {
      console.error("Failed to load brand members:", err);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [activeBrand.id, isDemoMode]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleCopyToken = () => {
    navigator.clipboard.writeText("inkloom_pat_live_9f82d1b7c4a30e8f");
    setCopiedToken(true);
    showToast({
      type: "info",
      title: "Extension Token Copied",
      message: "Personal Access Token copied to clipboard for Chrome MV3 Extension.",
    });
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setGeneratedInviteLink(null);

    try {
      if (!isDemoMode && api.hasTokens() && activeBrand.id) {
        const res = await api.inviteMember(activeBrand.id, inviteEmail, inviteRole);
        const inviteUrl = `${window.location.origin}/#register?token=${res.invitation_token}`;
        setGeneratedInviteLink(inviteUrl);

        showToast({
          type: "success",
          title: "Invitation Generated",
          message: `Created secure join invitation token for ${inviteEmail}.`,
        });
        await fetchMembers();
      } else {
        setMembers([
          ...members,
          {
            id: `m-${Date.now()}`,
            name: inviteEmail.split("@")[0],
            email: inviteEmail,
            role: inviteRole,
            status: "Invited",
          },
        ]);
        showToast({
          type: "success",
          title: "Invitation Dispatched (Demo)",
          message: `Invited ${inviteEmail} as ${inviteRole} to ${activeBrand.name}.`,
        });
        setIsInviteModalOpen(false);
        setInviteEmail("");
      }
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Invitation Failed",
        message: err.message || "Failed to create invitation.",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (!generatedInviteLink) return;
    navigator.clipboard.writeText(generatedInviteLink);
    setCopiedInviteUrl(true);
    showToast({
      type: "info",
      title: "Link Copied",
      message: "Creator invitation link copied to clipboard.",
    });
    setTimeout(() => setCopiedInviteUrl(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-16">
      {/* Standardized Compact Page Header */}
      <PageHeader
        icon={Settings}
        title="Workspace Settings"
        description="Configure appearance themes, authorized members, API keys, and Chrome Extension policies."
        technicalDetails="TENANT VAULT & RBAC — Tenant isolation boundaries with role-based access control and PKI authentication."
        isAdmin={true}
        actions={
          <div className="flex items-center gap-2">
            {/* Copyable Tenant ID Chip */}
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(activeBrand?.id || "tenant-inkloom-live");
                showToast({ type: "info", title: "Tenant ID Copied", message: activeBrand?.id || "tenant-inkloom-live" });
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Click to copy Tenant ID"
            >
              <span className="text-[10px] text-[var(--text-muted)] uppercase">ID:</span>
              <span>{activeBrand?.id ? `${activeBrand.id.slice(0, 12)}...` : "tenant-live"}</span>
              <Copy className="h-3 w-3 text-[var(--text-muted)]" />
            </button>

            <Badge variant="brand" size="sm">Enterprise Tier</Badge>
          </div>
        }
      />

      {/* Single-Row Horizontal Scroll Tabs Bar */}
      <div className="surface-glass rounded-2xl p-1.5 border border-[var(--glass-border)] shadow-xs flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
        {[
          { id: "all", label: "Overview", icon: Layers },
          { id: "team", label: "Team & RBAC", icon: Users },
          { id: "integrations", label: "Integrations & API", icon: Key },
          { id: "security", label: "SLA Policies", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? "bg-[var(--accent-primary)] text-[var(--accent-contrast)] shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Team Members & RBAC */}
      {(activeTab === "all" || activeTab === "team") && (
        <Card className="surface-glass border-[var(--glass-border)] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/40 p-5 sm:p-6">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--accent-primary)]" />
                Authorized Workspace Members
              </CardTitle>
              <CardDescription>Strict role-based access control and tenant isolation</CardDescription>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setGeneratedInviteLink(null);
                setIsInviteModalOpen(true);
              }}
              leftIcon={<Plus className="h-4 w-4" />}
              className="cursor-pointer font-semibold shadow-xs"
            >
              Invite Member
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                    <th className="py-3.5 px-5">Member</th>
                    <th className="py-3.5 px-5">Email Address</th>
                    <th className="py-3.5 px-5">Assigned Role</th>
                    <th className="py-3.5 px-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {isLoadingMembers ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[var(--text-muted)]">
                        Loading tenant memberships...
                      </td>
                    </tr>
                  ) : (
                    members.map((m) => (
                      <tr key={m.id} className="interactive-row hover:bg-[var(--bg-surface-subtle)] transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)] font-bold text-xs flex items-center justify-center shrink-0 border border-[var(--accent-primary)]/20">
                              {m.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-[var(--text-primary)] text-xs">
                              {m.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-5 font-mono text-[var(--text-secondary)] text-[11px]">{m.email}</td>
                        <td className="py-4 px-5">
                          <Badge variant="brand" size="sm">
                            {m.role.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <Badge variant={m.status === "Active" ? "success" : "neutral"} size="sm" dot>
                            {m.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab: Integrations & API Access */}
      {(activeTab === "all" || activeTab === "integrations") && (
        <Card className="surface-glass border-[var(--glass-border)]">
          <CardHeader className="border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-[var(--accent-primary)]" />
                  Chrome Extension (Manifest V3) & API Access
                </CardTitle>
                <CardDescription>
                  Authenticate browser extensions and external CMS integrations directly to the Inkloom Engine
                </CardDescription>
              </div>
              <Badge variant="success" size="sm" dot>Active Gateway</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5 text-xs">
            <div>
              <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] block mb-2">
                Personal Access Token (PAT)
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                <input
                  type="password"
                  readOnly
                  value="inkloom_pat_live_9f82d1b7c4a30e8f"
                  className="w-full max-w-md font-mono text-xs rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] p-2.5 text-[var(--text-primary)] select-all shadow-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToken}
                  leftIcon={copiedToken ? <Check className="h-3.5 w-3.5 text-[var(--color-success)]" /> : <Copy className="h-3.5 w-3.5" />}
                  className="cursor-pointer shrink-0"
                >
                  {copiedToken ? "Copied" : "Copy Token"}
                </Button>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                Input this secret into the Inkloom Chrome MV3 extension sidepanel to audit live drafts in LinkedIn or WordPress.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>REST API Gateway Endpoint: <strong className="text-[var(--text-primary)] font-mono">http://localhost:8000/api/v1</strong></span>
              </div>
              <Badge variant="neutral" size="sm">v1.4 Spec</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab: Governance Policies & Infrastructure */}
      {(activeTab === "all" || activeTab === "security") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Active Review Policies Summary (7 cols) */}
          <div className="lg:col-span-7">
            <Card className="surface-glass border-[var(--glass-border)] h-full">
              <CardHeader className="border-b border-[var(--border-subtle)] pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[var(--accent-primary)]" />
                      Active Review Thresholds
                    </CardTitle>
                    <CardDescription>
                      Automated gatekeeper policies configured in Brand Profile
                    </CardDescription>
                  </div>
                  <Badge variant="brand" size="sm">Live Engine</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                      Auto-Pass Threshold
                    </span>
                    <div className="text-xl font-black text-[var(--color-success)] font-display">
                      ≥ {activeBrand.review_thresholds?.auto_pass_min_score ?? 85}%
                    </div>
                    <span className="text-[11px] text-[var(--text-secondary)]">Auto-cleared when zero critical flags are detected</span>
                  </div>

                  <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                      Escalation Threshold
                    </span>
                    <div className="text-xl font-black text-[var(--color-danger)] font-display">
                      &lt; {activeBrand.review_thresholds?.escalate_below_score ?? 70}%
                    </div>
                    <span className="text-[11px] text-[var(--text-secondary)]">Automatically enqueues to human reviewer</span>
                  </div>

                  <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                      Target Review SLA
                    </span>
                    <div className="text-xl font-black text-[var(--text-primary)] font-display flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-[var(--text-muted)]" />
                      {activeBrand.review_thresholds?.target_sla_hours ?? 4} Hours
                    </div>
                    <span className="text-[11px] text-[var(--text-secondary)]">Authorized reviewer turnaround target</span>
                  </div>

                  <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                      Critical Policy
                    </span>
                    <div className="text-sm font-bold text-[var(--text-primary)] mt-1">
                      {activeBrand.review_thresholds?.require_human_review_for_critical !== false ? (
                        <Badge variant="danger" size="sm">Mandatory Sign-off</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">Score Dependent</Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--text-secondary)] block mt-1 truncate">
                      Reviewer: {activeBrand.reviewer_contact_email || "compliance@brand.io"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Infrastructure Engine Specs (5 cols) */}
          <div className="lg:col-span-5">
            <Card className="surface-glass border-[var(--glass-border)] h-full">
              <CardHeader className="border-b border-[var(--border-subtle)] pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-[var(--accent-primary)]" />
                  Engine Infrastructure
                </CardTitle>
                <CardDescription>Decoupled multi-tenant governance topology</CardDescription>
              </CardHeader>
              <CardContent className="p-6 text-xs text-[var(--text-secondary)] space-y-3.5">
                <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)]">
                  <span className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Database className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                    Vector Engine
                  </span>
                  <span className="font-mono text-[var(--text-primary)] font-semibold text-right">Postgres 18 + pgvector (768d)</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)]">
                  <span className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    Vision Auditor
                  </span>
                  <span className="font-mono text-[var(--text-primary)] font-semibold text-right">OpenCV 4.10 + CIELAB</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)]">
                  <span className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Laptop className="h-3.5 w-3.5 text-sky-400" />
                    LLM Engine
                  </span>
                  <span className="font-mono text-[var(--text-primary)] font-semibold text-right">Gemini 2.5 Flash SDK</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Lock className="h-3.5 w-3.5 text-emerald-400" />
                    Tenant Isolation
                  </span>
                  <span className="font-mono text-[var(--text-primary)] font-semibold text-right">RLS + Foreign Key Boundaries</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Brand Workspace Member"
        description="Grant a team member access to create, audit, or review content for this brand."
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Work Email"
            type="email"
            placeholder="colleague@nexuscloud.io"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />

          <Select
            label="Assigned Role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            options={[
              { value: "CONTENT_CREATOR", label: "Content Creator (Studio & Extension Audits)" },
              { value: "COMPLIANCE_REVIEWER", label: "Compliance Reviewer (Queue Approvals)" },
              { value: "BRAND_MANAGER", label: "Brand Manager (Full Workspace Configuration)" },
            ]}
          />

          {generatedInviteLink && (
            <div
              className="p-3.5 rounded-xl text-xs space-y-2 border"
              style={{
                backgroundColor: "var(--color-success-bg)",
                borderColor: "var(--color-success-border)",
                color: "var(--color-success)"
              }}
            >
              <span className="font-semibold block" style={{ color: "var(--color-success)" }}>
                Secure Invitation Link Created:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedInviteLink}
                  className="w-full text-xs font-mono p-2 rounded-lg border select-all"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--color-success-border)",
                    color: "var(--text-primary)"
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyInviteLink}
                  leftIcon={copiedInviteUrl ? <Check className="h-3 w-3" style={{ color: "var(--color-success)" }} /> : <Copy className="h-3 w-3" />}
                >
                  {copiedInviteUrl ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsInviteModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isInviting}>
              {isInviting ? "Creating Token..." : "Send Invite"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
