import React, { useState, useEffect, useCallback } from "react";
import {
  Sliders,
  Plus,
  AlertTriangle,
  ShieldAlert,
  FileText,
  Volume2,
  Bookmark,
  CheckCircle2,
  Clock,
  History,
  Trash2,
  Send,
  Eye,
  Check,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Search,
  XCircle,
  Copy,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../design-system/Card";
import { Button } from "../design-system/Button";
import { Badge } from "../design-system/Badge";
import { Input, Textarea, Select } from "../design-system/FormControls";
import { Modal } from "../design-system/Modal";
import { EmptyState } from "../design-system/EmptyState";
import { AnimatedCounter } from "../design-system/AnimatedCounter";
import { AtmosphericBackground } from "../components/AtmosphericBackground";
import { PageHeader } from "../components/PageHeader";
import { useNotification } from "../context/NotificationContext";
import { MOCK_BRAND_RULES } from "../data/mockData";
import { BrandRule, RuleAuditLogEntry } from "../types";
import { api } from "../api/client";

const RULE_CATEGORIES = [
  { id: "ALL", label: "All Rules" },
  { id: "PROHIBITED_CLAIM", label: "Prohibited Claims" },
  { id: "MANDATORY_DISCLOSURE", label: "Mandatory Disclosures" },
  { id: "TONE_OF_VOICE", label: "Tone of Voice" },
  { id: "TERMINOLOGY", label: "Approved Vocabulary" },
  { id: "CHANNEL_POLICY", label: "Channel Policies" },
  { id: "RECOMMENDATION", label: "Recommendations" },
];

const CHANNELS_LIST = [
  { id: "all", label: "All Channels" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "X / Twitter" },
  { id: "blog", label: "Blog" },
  { id: "press_release", label: "Press Release" },
  { id: "email", label: "Email" },
];

export const BrandRulesView: React.FC = () => {
  const { activeBrand, isDemoMode, activeRole } = useWorkspace();
  const isAdmin = activeRole === "BRAND_MANAGER";
  const { showToast } = useNotification();

  const handleToggleRule = (rule: BrandRule) => {
    const updated = !rule.isActive;
    setRules((prev) =>
      prev.map((r) => (r.id === rule.id ? { ...r, isActive: updated } : r))
    );
    showToast({
      type: "info",
      title: updated ? "Rule Enabled" : "Rule Paused",
      message: `Guardrail "${rule.name}" is now ${updated ? "active in real-time scans" : "disabled"}.`,
    });
  };

  const [rules, setRules] = useState<BrandRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeType, setActiveType] = useState<string>("ALL");
  const [selectedChannel, setSelectedChannel] = useState<string>("ALL");
  const [selectedEnforcement, setSelectedEnforcement] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<string>("PROHIBITED_CLAIM");
  const [formSeverity, setFormSeverity] = useState<"CRITICAL" | "WARNING" | "SUGGESTION">("CRITICAL");
  const [formEnforcement, setFormEnforcement] = useState<string>("BLOCK");
  const [formPattern, setFormPattern] = useState("");
  const [formExplanation, setFormExplanation] = useState("");
  const [formSourceRef, setFormSourceRef] = useState("");
  const [formChannels, setFormChannels] = useState<string[]>(["all"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyRule, setHistoryRule] = useState<BrandRule | null>(null);
  const [auditLogs, setAuditLogs] = useState<RuleAuditLogEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load rules
  const fetchRules = useCallback(async () => {
    if (!activeBrand?.id) return;
    if (isDemoMode || !api.hasTokens()) {
      setRules(MOCK_BRAND_RULES);
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.listRules(activeBrand.id, {
        rule_type: activeType !== "ALL" ? activeType : undefined,
        channel: selectedChannel !== "ALL" ? selectedChannel : undefined,
        enforcement_mode: selectedEnforcement !== "ALL" ? selectedEnforcement : undefined,
      });

      const normalized: BrandRule[] = data.map((r: any) => ({
        id: r.id,
        brandId: r.brand_id,
        ruleType: r.rule_type,
        name: r.name,
        description: r.description,
        severity: r.severity,
        enforcementMode: r.enforcement_mode || "BLOCK",
        patternOrInstruction: r.pattern_or_instruction,
        explanation: r.explanation_template || r.explanation || "",
        sourceReference: r.source_reference,
        channels: r.applies_to_channels || ["all"],
        isActive: r.is_active,
        version: r.version || 1,
        isDraft: r.is_draft || false,
        draftChanges: r.draft_changes,
        created_at: r.created_at,
      }));
      setRules(normalized);
    } catch (err: any) {
      console.error("Failed to load rules:", err);
      setRules(MOCK_BRAND_RULES);
    } finally {
      setIsLoading(false);
    }
  }, [activeBrand.id, isDemoMode, activeType, selectedChannel, selectedEnforcement]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleOpenAddModal = () => {
    setEditingRuleId(null);
    setFormName("");
    setFormDescription("");
    setFormType("PROHIBITED_CLAIM");
    setFormSeverity("CRITICAL");
    setFormEnforcement("BLOCK");
    setFormPattern("");
    setFormExplanation("");
    setFormSourceRef("");
    setFormChannels(["all"]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rule: BrandRule) => {
    setEditingRuleId(rule.id);
    setFormName(rule.name);
    setFormDescription(rule.description || "");
    setFormType(rule.ruleType);
    setFormSeverity(rule.severity);
    setFormEnforcement(rule.enforcementMode || "BLOCK");
    setFormPattern(rule.patternOrInstruction);
    setFormExplanation(rule.explanation);
    setFormSourceRef(rule.sourceReference || "");
    setFormChannels(rule.channels || ["all"]);
    setIsModalOpen(true);
  };

  const handleToggleChannel = (chId: string) => {
    if (chId === "all") {
      setFormChannels(["all"]);
      return;
    }
    const filtered = formChannels.filter((c) => c !== "all");
    if (filtered.includes(chId)) {
      const next = filtered.filter((c) => c !== chId);
      setFormChannels(next.length === 0 ? ["all"] : next);
    } else {
      setFormChannels([...filtered, chId]);
    }
  };

  const handleSaveRule = async (saveAsDraft: boolean) => {
    if (!formName.trim() || !formPattern.trim()) {
      showToast({ type: "error", title: "Missing Fields", message: "Rule name and instruction are required." });
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: formName,
      description: formDescription,
      rule_type: formType,
      severity: formSeverity,
      enforcement_mode: formEnforcement,
      pattern_or_instruction: formPattern,
      explanation_template: formExplanation,
      source_reference: formSourceRef,
      applies_to_channels: formChannels,
      save_as_draft: saveAsDraft,
    };

    try {
      if (!isDemoMode && api.hasTokens() && activeBrand.id) {
        if (editingRuleId) {
          await api.updateRule(activeBrand.id, editingRuleId, payload, saveAsDraft);
          showToast({
            type: "success",
            title: saveAsDraft ? "Draft Saved" : "Rule Published",
            message: saveAsDraft
              ? `Staged changes for "${formName}". Existing live version remains active until published.`
              : `Published new version of "${formName}".`,
          });
        } else {
          await api.createRule(activeBrand.id, payload);
          showToast({
            type: "success",
            title: "Rule Created",
            message: `Created guardrail "${formName}".`,
          });
        }
        await fetchRules();
      } else {
        // Demo mode
        const mock: BrandRule = {
          id: editingRuleId || `rule-${Date.now()}`,
          brandId: activeBrand.id,
          name: formName,
          description: formDescription,
          ruleType: formType,
          severity: formSeverity,
          enforcementMode: formEnforcement,
          patternOrInstruction: formPattern,
          explanation: formExplanation,
          sourceReference: formSourceRef,
          channels: formChannels,
          isActive: true,
          version: editingRuleId ? (rules.find((r) => r.id === editingRuleId)?.version || 1) + (saveAsDraft ? 0 : 1) : 1,
          isDraft: saveAsDraft,
        };
        setRules((prev) =>
          editingRuleId ? prev.map((r) => (r.id === editingRuleId ? mock : r)) : [mock, ...prev]
        );
        showToast({
          type: "success",
          title: saveAsDraft ? "Draft Saved (Demo)" : "Rule Published (Demo)",
          message: formName,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast({ type: "error", title: "Save Failed", message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Publish Staged Draft
  const handlePublishDraft = async (rule: BrandRule) => {
    if (!isDemoMode && api.hasTokens() && activeBrand.id) {
      try {
        await api.publishRule(activeBrand.id, rule.id);
        await fetchRules();
        showToast({
          type: "success",
          title: "Version Published",
          message: `Staged draft for "${rule.name}" is now live (v${(rule.version || 1) + 1}).`,
        });
      } catch (err: any) {
        showToast({ type: "error", title: "Publish Failed", message: err.message });
      }
    } else {
      setRules((prev) =>
        prev.map((r) =>
          r.id === rule.id ? { ...r, isDraft: false, version: (r.version || 1) + 1 } : r
        )
      );
      showToast({ type: "success", title: "Version Published (Demo)", message: rule.name });
    }
  };

  // Delete Rule
  const handleDeleteRule = async (rule: BrandRule) => {
    if (!window.confirm(`Permanently delete rule "${rule.name}"?`)) return;

    if (!isDemoMode && api.hasTokens() && activeBrand.id) {
      try {
        await api.deleteRule(activeBrand.id, rule.id);
        await fetchRules();
        showToast({ type: "info", title: "Rule Deleted", message: rule.name });
      } catch (err: any) {
        showToast({ type: "error", title: "Deletion Failed", message: err.message });
      }
    } else {
      setRules((prev) => prev.filter((r) => r.id !== rule.id));
      showToast({ type: "info", title: "Rule Deleted (Demo)", message: rule.name });
    }
  };

  // View Rule History
  const handleViewHistory = async (rule: BrandRule) => {
    setHistoryRule(rule);
    setIsHistoryModalOpen(true);
    setIsLoadingHistory(true);

    if (!isDemoMode && api.hasTokens() && activeBrand.id) {
      try {
        const logs = await api.getRuleHistory(activeBrand.id, rule.id);
        setAuditLogs(logs);
      } catch (err: any) {
        console.error("Failed to fetch rule history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    } else {
      setAuditLogs([
        {
          id: "hist-1",
          rule_id: rule.id,
          actor_name: "Brand Lead",
          action: "CREATED",
          version: 1,
          changes_summary: "Initial rule creation and enforcement setup.",
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
      ]);
      setIsLoadingHistory(false);
    }
  };

  const getEnforcementBadge = (mode?: string) => {
    switch (mode) {
      case "BLOCK":
      case "MANDATORY":
        return (
          <Badge variant="danger" size="sm">
            <ShieldAlert className="h-3 w-3 mr-1 shrink-0" />
            Hard Block
          </Badge>
        );
      case "FLAG_FOR_REVIEW":
        return (
          <Badge variant="warning" size="sm">
            <AlertCircle className="h-3 w-3 mr-1 shrink-0" />
            Escalate to Review
          </Badge>
        );
      case "WARN":
        return (
          <Badge variant="warning" size="sm">
            <AlertTriangle className="h-3 w-3 mr-1 shrink-0" />
            Warning
          </Badge>
        );
      case "SUGGEST":
        return (
          <Badge variant="neutral" size="sm">
            <Sparkles className="h-3 w-3 mr-1 shrink-0 text-[var(--accent-primary)]" />
            Recommendation
          </Badge>
        );
      default:
        return <Badge variant="neutral" size="sm">{mode || "Enforced"}</Badge>;
    }
  };

  const totalRulesCount = rules.length;
  const criticalCount = rules.filter((r) => r.severity === "CRITICAL" || r.enforcementMode === "BLOCK").length;
  const warningCount = rules.filter((r) => r.severity === "WARNING" || r.enforcementMode === "FLAG_FOR_REVIEW" || r.enforcementMode === "WARN").length;
  const suggestionCount = rules.filter((r) => r.severity === "SUGGESTION" || r.enforcementMode === "SUGGEST").length;

  const filteredRules = rules.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.name.toLowerCase().includes(term) ||
      (r.description && r.description.toLowerCase().includes(term)) ||
      (r.patternOrInstruction && r.patternOrInstruction.toLowerCase().includes(term)) ||
      (r.sourceReference && r.sourceReference.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Standardized Compact Page Header */}
      <PageHeader
        icon={Sliders}
        title="Guardrails & Rules"
        description="Enforce tone, disallowed terminology, mandatory disclosures, and risk policies."
        technicalDetails="DETERMINISTIC AST & REGEX EVALUATOR — Multi-channel rule compiler with zero-tolerance blockers."
        isAdmin={isAdmin}
        actions={
          isAdmin ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddModal}
              leftIcon={<Plus className="h-4 w-4" />}
              className="font-bold shadow-glow"
            >
              Add Guardrail
            </Button>
          ) : undefined
        }
      />

      {/* 4 Metric Cards — Equal Height, Tabular Numerals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs border-l-4 border-l-[var(--color-danger)]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Critical Blockers</span>
            <ShieldAlert className="h-4 w-4 text-[var(--color-danger)]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold tabular-nums text-[var(--color-danger)]">
              <AnimatedCounter value={criticalCount} />
            </span>
            <span className="text-[13px] text-[var(--text-muted)]">zero-tolerance</span>
          </div>
        </div>

        <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs border-l-4 border-l-[var(--color-warning)]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Review Escalations</span>
            <AlertCircle className="h-4 w-4 text-[var(--color-warning)]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold tabular-nums text-[var(--color-warning)]">
              <AnimatedCounter value={warningCount} />
            </span>
            <span className="text-[13px] text-[var(--text-muted)]">require sign-off</span>
          </div>
        </div>

        <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs border-l-4 border-l-[var(--accent-primary)]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Best Practices</span>
            <Sparkles className="h-4 w-4 text-[var(--accent-primary)]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold tabular-nums text-[var(--text-primary)]">
              <AnimatedCounter value={suggestionCount} />
            </span>
            <span className="text-[13px] text-[var(--text-muted)]">tone & guidelines</span>
          </div>
        </div>

        <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Active Guardrails</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold tabular-nums text-[var(--text-primary)]">
              <AnimatedCounter value={totalRulesCount} />
            </span>
            <span className="text-[13px] text-[var(--text-muted)]">live policies</span>
          </div>
        </div>
      </div>

      {/* Single-Row Unified Filter Toolbar */}
      <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 relative flex items-center">
            <Search className="h-4 w-4 absolute left-3.5 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search guardrails by name, pattern, or explanation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] hover:border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:border-[var(--accent-primary)] transition-all duration-200"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
                title="Clear search"
              >
                <XCircle className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              options={CHANNELS_LIST.map((c) => ({ value: c.id === "all" ? "ALL" : c.id, label: c.label }))}
              className="text-xs min-w-[130px]"
            />

            <Select
              value={selectedEnforcement}
              onChange={(e) => setSelectedEnforcement(e.target.value)}
              options={[
                { value: "ALL", label: "All Enforcement Modes" },
                { value: "BLOCK", label: "Hard Block" },
                { value: "MANDATORY", label: "Mandatory" },
                { value: "FLAG_FOR_REVIEW", label: "Escalate to Review" },
                { value: "WARN", label: "Warning" },
                { value: "SUGGEST", label: "Recommendation" },
              ]}
              className="text-xs min-w-[160px]"
            />
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-[var(--border-subtle)] scrollbar-none">
          {RULE_CATEGORIES.map((tab) => {
            const count = tab.id === "ALL" ? rules.length : rules.filter((r) => r.ruleType === tab.id).length;
            const isSelected = activeType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveType(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all interactive-pill cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] font-semibold shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] border border-transparent"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? "bg-[var(--accent-primary)] text-white" : "bg-[var(--bg-surface-subtle)] text-[var(--text-muted)]"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rules Policy Grid */}
      {isLoading ? (
        <div className="p-16 surface-glass rounded-3xl border border-[var(--glass-border)] text-center text-xs text-[var(--text-muted)] flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="font-medium text-[var(--text-secondary)]">Loading brand policy definitions...</p>
        </div>
      ) : filteredRules.length === 0 ? (
        <EmptyState
          preset="rules"
          title="No Brand Guardrails Configured"
          description="Create deterministic rules, mandatory disclosures, or tone instructions to govern content generation."
          action={
            <Button variant="primary" size="sm" onClick={handleOpenAddModal} leftIcon={<Plus className="h-4 w-4" />}>
              Add Guardrail
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((rule) => {
            const isCritical = rule.severity === "CRITICAL" || rule.enforcementMode === "BLOCK";
            const isWarning = rule.severity === "WARNING" || rule.enforcementMode === "FLAG_FOR_REVIEW" || rule.enforcementMode === "WARN";

            return (
              <Card
                key={rule.id}
                className={`interactive-card micro-lift border-l-4 transition-all ${
                  isCritical
                    ? "border-l-[var(--color-danger)] shadow-xs"
                    : isWarning
                    ? "border-l-[var(--color-warning)] shadow-xs"
                    : "border-l-[var(--accent-primary)] shadow-xs"
                } ${
                  rule.isDraft ? "border-[var(--color-warning-border)] bg-[var(--color-warning-bg)]/40" : ""
                }`}
              >
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* ONE severity chip */}
                        <Badge
                          variant={
                            rule.severity === "CRITICAL"
                              ? "danger"
                              : rule.severity === "WARNING"
                              ? "warning"
                              : "neutral"
                          }
                          size="sm"
                        >
                          {rule.severity === "CRITICAL" ? "Critical" : rule.severity === "WARNING" ? "Warning" : "Suggestion"}
                        </Badge>

                        {/* Readable category label in sentence case */}
                        <span className="text-[12px] font-medium text-[var(--text-secondary)] bg-[var(--bg-surface-subtle)] px-2 py-0.5 rounded-md border border-[var(--border-subtle)]">
                          {RULE_CATEGORIES.find((c) => c.id === rule.ruleType)?.label || rule.ruleType}
                        </span>

                        {/* Enforcement mode label */}
                        <span className="text-[11px] text-[var(--text-muted)] font-medium">
                          • {rule.enforcementMode === "BLOCK" || rule.enforcementMode === "MANDATORY"
                              ? "Hard Block"
                              : rule.enforcementMode === "FLAG_FOR_REVIEW"
                              ? "Escalate to Review"
                              : rule.enforcementMode === "WARN"
                              ? "Warning"
                              : "Recommendation"}
                        </span>

                        {rule.isDraft && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--color-warning-bg)] text-[var(--color-warning)] font-bold border border-[var(--color-warning-border)]">
                            Staged Draft
                          </span>
                        )}
                      </div>

                      {/* Enable/Disable Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleRule(rule)}
                        className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
                        title={rule.isActive !== false ? "Click to disable rule" : "Click to enable rule"}
                        aria-label={`Toggle ${rule.name}`}
                      >
                        <span className="text-[11px] font-medium">
                          {rule.isActive !== false ? "Active" : "Paused"}
                        </span>
                        {rule.isActive !== false ? (
                          <ToggleRight className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-[var(--text-muted)]" />
                        )}
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1 tracking-tight">
                      {rule.name}
                    </h3>

                    {rule.description && (
                      <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
                        {rule.description}
                      </p>
                    )}

                    <div className="bg-[var(--bg-surface-subtle)] p-3 rounded-xl border border-[var(--border-subtle)] space-y-2.5">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-medium text-[var(--text-muted)]">
                            Detection Pattern
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(rule.patternOrInstruction);
                              showToast({
                                type: "info",
                                title: "Pattern Copied",
                                message: "Detection pattern copied to clipboard.",
                              });
                            }}
                            className="text-[11px] text-[var(--accent-text)] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                          >
                            <Copy className="h-3 w-3" />
                            Copy
                          </button>
                        </div>
                        <p className="text-xs font-mono text-[var(--text-primary)] bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)] break-all select-all">
                          {rule.patternOrInstruction}
                        </p>
                      </div>

                      {rule.explanation && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block mb-1 font-mono">
                            Creator Remediation Guidance
                          </span>
                          <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-surface)]/60 p-2 rounded-lg border border-[var(--border-subtle)] leading-relaxed italic">
                            “{rule.explanation}”
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2 text-[11px] text-[var(--text-muted)]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">Channels:</span>
                        {rule.channels.map((ch) => (
                          <span
                            key={ch}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-medium"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>

                      {rule.sourceReference && (
                        <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[150px] font-mono" title={rule.sourceReference}>
                          Ref: {rule.sourceReference}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      {rule.isDraft && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handlePublishDraft(rule)}
                          className="text-xs px-2.5 h-7 shadow-glow font-bold"
                          leftIcon={<Send className="h-3 w-3" />}
                        >
                          Publish Draft
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditModal(rule)}
                        className="text-xs px-2 h-7"
                      >
                        Edit
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewHistory(rule)}
                        className="text-xs px-2 h-7"
                        title="View change history"
                      >
                        <History className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRule(rule)}
                        className="text-xs px-2 h-7 text-[var(--color-danger)]"
                        title="Delete rule"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Rule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRuleId ? "Edit Brand Guardrail" : "Create Brand Guardrail"}
        description="Configure rule classification, severity, channels, and enforcement mode."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Guardrail Name"
              placeholder="e.g. Absolute Security & Uptime Guarantee Ban"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
            <Select
              label="Rule Category"
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              options={RULE_CATEGORIES.filter((c) => c.id !== "ALL").map((c) => ({
                value: c.id,
                label: c.label,
              }))}
            />
          </div>

          <Textarea
            label="Internal Description / Objective"
            placeholder="Explain why this rule exists and which compliance regulation it satisfies..."
            rows={2}
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Enforcement Mode"
              value={formEnforcement}
              onChange={(e) => setFormEnforcement(e.target.value)}
              options={[
                { value: "BLOCK", label: "Hard Block (Rejects draft publication)" },
                { value: "MANDATORY", label: "Mandatory Requirement" },
                { value: "FLAG_FOR_REVIEW", label: "Escalate to Human Reviewer" },
                { value: "WARN", label: "Advisory Warning (Non-blocking)" },
                { value: "SUGGEST", label: "Creative Suggestion" },
              ]}
            />
            <Select
              label="Severity"
              value={formSeverity}
              onChange={(e) => setFormSeverity(e.target.value as any)}
              options={[
                { value: "CRITICAL", label: "CRITICAL (High Risk / Regulatory)" },
                { value: "WARNING", label: "WARNING (Brand Drift / Tone)" },
                { value: "SUGGESTION", label: "SUGGESTION (Style Optimization)" },
              ]}
            />
          </div>

          <Textarea
            label="Pattern / Detection Instruction"
            placeholder="e.g. Detect any claim stating 100% bug-free, unhackable, or completely secure without qualification."
            rows={3}
            value={formPattern}
            onChange={(e) => setFormPattern(e.target.value)}
            required
          />

          <Textarea
            label="Creator Guidance & Explanation Template"
            placeholder="e.g. Avoid absolute guarantees. Frame security capabilities around continuous monitoring and defense-in-depth."
            rows={2}
            value={formExplanation}
            onChange={(e) => setFormExplanation(e.target.value)}
          />

          <Input
            label="Legal / Regulatory Reference"
            placeholder="e.g. FTC Act Section 5, Legal Brand Charter §4.1"
            value={formSourceRef}
            onChange={(e) => setFormSourceRef(e.target.value)}
          />

          {/* Channel Applicability */}
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">
              Applies to Content Channels
            </label>
            <div className="flex flex-wrap gap-2">
              {CHANNELS_LIST.map((ch) => {
                const isSelected = formChannels.includes(ch.id);
                return (
                  <button
                    type="button"
                    key={ch.id}
                    onClick={() => handleToggleChannel(ch.id)}
                    className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                      isSelected
                        ? "bg-[var(--accent-primary)] text-[var(--accent-contrast)] border-[var(--accent-border)] font-semibold shadow-xs"
                        : "bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-surface-elevated)]"
                    }`}
                  >
                    {ch.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-[var(--border-subtle)]">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => handleSaveRule(true)}
              >
                Save as Staged Draft
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={isSubmitting}
                onClick={() => handleSaveRule(false)}
              >
                {isSubmitting ? "Publishing..." : "Publish Version Immediately"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Change History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Audit History: ${historyRule?.name}`}
        description="Chronological log of version changes, author actions, and publishing timestamps."
        maxWidth="md"
      >
        <div className="space-y-4">
          {isLoadingHistory ? (
            <div className="p-4 text-center text-xs text-[var(--text-muted)]">Loading audit history...</div>
          ) : auditLogs.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] text-center py-4">No historical audit logs recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--text-primary)]">
                      {log.actor_name} • <Badge variant="neutral" size="sm">{log.action}</Badge>
                    </span>
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">v{log.version}</span>
                  </div>
                  <p className="text-[var(--text-secondary)]">{log.changes_summary}</p>
                  <div className="text-[10px] text-[var(--text-muted)] pt-1">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-[var(--border-subtle)]">
            <Button variant="ghost" onClick={() => setIsHistoryModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
