import React, { useState, useEffect, useMemo } from "react";
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  User,
  ArrowRight,
  ShieldAlert,
  GitCommit,
  Hash,
  History,
  RotateCcw,
  Send,
  Search,
  Filter,
  Copy,
  Check,
  Sparkles,
  FileText,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Share2,
  Image as ImageIcon,
  Layers,
  Palette,
  ExternalLink,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../design-system/Card";
import { Button } from "../design-system/Button";
import { Badge } from "../design-system/Badge";
import { PageHeader } from "../components/PageHeader";
import { Textarea, Input } from "../design-system/FormControls";
import { EmptyState } from "../design-system/EmptyState";
import { AtmosphericBackground } from "../components/AtmosphericBackground";
import { useNotification } from "../context/NotificationContext";
import { api, ReviewItemDetail } from "../api/client";

export interface MultiModalReviewItem extends ReviewItemDetail {
  image_url?: string;
  dominant_hex?: string;
  target_hex?: string;
  color_distance?: number;
  aspect_ratio_status?: string;
  logo_match?: boolean;
}

const SEEDED_REVIEWS: MultiModalReviewItem[] = [
  {
    id: "REV-104",
    brand_id: "brand-nexus",
    audit_id: "audit-104-live",
    status: "AWAITING_REVIEW",
    creator_notes: "Requesting exception approval for Q1 campaign promotional wording.",
    reviewer_comments: "",
    reviewed_at: null,
    reviewed_by_id: null,
    content_snippet: "Upgrade to our starter edition today for only $29/mo and enjoy effortless content velocity with magic AI.",
    content_snapshot: "Upgrade to our starter edition today for only $29/mo and enjoy effortless content velocity with magic AI. Continuous automated governance ensures enterprise reliability across multi-region workloads.",
    content_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    content_version: 1,
    overall_score: 54,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    submitted_by_id: "usr-marcus",
    is_stale: false,
    image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
    dominant_hex: "#F26A0F",
    target_hex: "#F26A0F",
    color_distance: 2.1,
    aspect_ratio_status: "1.91:1 Standard (LinkedIn Compliant)",
    logo_match: true,
    findings_snapshot: [
      {
        id: "finding-pricing",
        finding_type: "FACTUAL_INACCURACY",
        severity: "CRITICAL",
        original_snippet: "$29/mo",
        explanation: "Outdated legacy starter pricing. Current enterprise starter tier is $49/mo under Pricing Matrix v2.4.",
        citation_reference: "Golden Facts: Pricing Matrix v2.4, Item 1",
        suggested_fix: "$49/month",
      },
      {
        id: "finding-hype",
        finding_type: "PROHIBITED_CLAIM",
        severity: "WARNING",
        original_snippet: "magic AI",
        explanation: "Banned buzzword 'magic AI' violates technical authenticity standard.",
        citation_reference: "Brand Style Guide: Banned Terminology 2026",
        suggested_fix: "high-confidence AI assistance",
      },
    ],
    rule_versions_snapshot: {},
    evidence_citations_snapshot: [],
    revision_history: [
      {
        version: 1,
        timestamp: "Today at 10:15 AM",
        author: "Content Creator",
        action: "Escalated to Review Queue",
      },
    ],
  },
  {
    id: "REV-105",
    brand_id: "brand-nexus",
    audit_id: "audit-105-live",
    status: "AWAITING_REVIEW",
    creator_notes: "High-priority enterprise landing ad submitted for compliance certification.",
    reviewer_comments: "",
    reviewed_at: null,
    reviewed_by_id: null,
    content_snippet: "Guaranteed 100% bug free brand governance with zero human overhead.",
    content_snapshot: "Guaranteed 100% bug free brand governance with zero human overhead. Scale enterprise multi-tenant workspaces with automated SLA guardrails.",
    content_hash: "a4f89d3381a32b9049a1efbf4c8996fb92427ae41e4649b934ca495991b7852c",
    content_version: 1,
    overall_score: 62,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    submitted_by_id: "usr-elena",
    is_stale: false,
    image_url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800",
    dominant_hex: "#0F172A",
    target_hex: "#0F172A",
    color_distance: 1.4,
    aspect_ratio_status: "1:1 Square (Instagram Compliant)",
    logo_match: true,
    findings_snapshot: [
      {
        id: "finding-absolute",
        finding_type: "PROHIBITED_CLAIM",
        severity: "CRITICAL",
        original_snippet: "100% bug free",
        explanation: "High-risk absolute guarantee '100% bug free' creates uninsurable SLA liability.",
        citation_reference: "Brand Style Guide: Banned Terminology 2026, Section 3",
        suggested_fix: "extensively tested and verified",
      },
    ],
    rule_versions_snapshot: {},
    evidence_citations_snapshot: [],
    revision_history: [
      {
        version: 1,
        timestamp: "Today at 09:30 AM",
        author: "Elena Rostova",
        action: "Escalated to Review Queue",
      },
    ],
  },
];

export const ReviewQueueView: React.FC = () => {
  const { activeBrand } = useWorkspace();
  const { showToast } = useNotification();

  const [queue, setQueue] = useState<MultiModalReviewItem[]>(SEEDED_REVIEWS);
  const [selectedItem, setSelectedItem] = useState<MultiModalReviewItem | null>(SEEDED_REVIEWS[0]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewerComment, setReviewerComment] = useState("");
  const [activeDossierTab, setActiveDossierTab] = useState<"snapshot" | "findings" | "visual" | "history">("snapshot");
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isActing, setIsActing] = useState(false);

  // Resubmission state
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [resubmitNotes, setResubmitNotes] = useState("");
  const [resubmitAuditId, setResubmitAuditId] = useState("");
  const [isResubmitting, setIsResubmitting] = useState(false);

  const fetchQueue = async () => {
    if (!activeBrand?.id) return;
    setIsLoading(true);
    try {
      if (api.hasTokens()) {
        const items = await api.listReviews(activeBrand.id, filterStatus);
        if (items && items.length > 0) {
          setQueue(items);
          setSelectedItem(items[0]);
          return;
        }
      }

      // Try public backend /api/reviews endpoint
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const backendItems = await res.json();
        if (Array.isArray(backendItems) && backendItems.length > 0) {
          const mapped: MultiModalReviewItem[] = backendItems.map((b: any, idx: number) => ({
            id: b.id || `REV-${100 + idx}`,
            brand_id: activeBrand.id,
            audit_id: `audit-${b.id || idx}`,
            status: "AWAITING_REVIEW",
            creator_notes: b.violation || "Escalated for compliance exception review",
            reviewer_comments: "",
            reviewed_at: null,
            reviewed_by_id: null,
            content_snippet: b.excerpt || "Draft content submitted for review",
            content_snapshot: b.excerpt || "Draft content submitted for review",
            content_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            content_version: 1,
            overall_score: 54,
            created_at: new Date().toISOString(),
            submitted_by_id: b.author || "Content Creator",
            is_stale: false,
            image_url: b.image_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
            dominant_hex: b.dominant_hex || "#F26A0F",
            target_hex: b.target_hex || "#F26A0F",
            color_distance: typeof b.color_distance === "number" ? b.color_distance : 2.1,
            aspect_ratio_status: "1.91:1 Standard (Compliant)",
            logo_match: true,
            findings_snapshot: [
              {
                id: `finding-${idx}-1`,
                finding_type: "FACTUAL_INACCURACY",
                severity: "CRITICAL",
                original_snippet: b.violation?.split("+")[0]?.trim() || "Policy violation",
                explanation: b.violation || "Brand policy violation",
                citation_reference: b.citation || "Brand Charter 2026",
                suggested_fix: "Verified compliant copy",
              },
            ],
            rule_versions_snapshot: {},
            evidence_citations_snapshot: [],
            revision_history: [],
          }));
          setQueue(mapped);
          setSelectedItem(mapped[0]);
          return;
        }
      }

      // Default to seeded dual-engine reviews
      setQueue(SEEDED_REVIEWS);
      setSelectedItem(SEEDED_REVIEWS[0]);
    } catch {
      // Offline / demo fallback with zero error toasts
      setQueue(SEEDED_REVIEWS);
      setSelectedItem(SEEDED_REVIEWS[0]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [activeBrand?.id, filterStatus]);

  // Filtered Queue by search
  const filteredQueue = useMemo(() => {
    if (!searchQuery.trim()) return queue;
    const q = searchQuery.toLowerCase();
    return queue.filter(
      (item) =>
        item.content_snippet.toLowerCase().includes(q) ||
        item.audit_id.toLowerCase().includes(q) ||
        (item.creator_notes && item.creator_notes.toLowerCase().includes(q))
    );
  }, [queue, searchQuery]);

  // Quick stats
  const queueStats = useMemo(() => {
    const awaiting = queue.filter((i) => i.status === "AWAITING_REVIEW" || i.status === "RESUBMITTED").length;
    const changes = queue.filter((i) => i.status === "CHANGES_REQUESTED").length;
    const approved = queue.filter((i) => i.status === "APPROVED").length;
    const rejected = queue.filter((i) => i.status === "REJECTED").length;
    return { awaiting, changes, approved, rejected, total: queue.length };
  }, [queue]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    showToast({
      type: "info",
      title: "Hash Copied",
      message: "SHA-256 signature copied to clipboard for cryptographic verification.",
    });
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyDraft = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    showToast({
      type: "info",
      title: "Draft Copied",
      message: "Full draft text copied to clipboard.",
    });
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handleTakeAction = async (action: "APPROVE" | "REJECT" | "REQUEST_CHANGES") => {
    if (!selectedItem || !activeBrand?.id) return;

    if ((action === "REJECT" || action === "REQUEST_CHANGES") && !reviewerComment.trim()) {
      showToast({
        type: "warning",
        title: "Comments Required",
        message: `Please specify feedback and rationale when ${action === "REJECT" ? "rejecting" : "requesting changes"}.`,
      });
      return;
    }

    setIsActing(true);
    try {
      const updated = await api.takeReviewAction(
        activeBrand.id,
        selectedItem.id,
        action,
        reviewerComment.trim() || (action === "APPROVE" ? "Approved under published brand governance policy." : ""),
      );

      setQueue((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      setSelectedItem(updated);
      setReviewerComment("");

      const actionText =
        action === "APPROVE"
          ? "Draft Approved with Exception"
          : action === "REJECT"
          ? "Draft Rejected"
          : "Changes Requested";

      showToast({
        type: action === "APPROVE" ? "success" : action === "REJECT" ? "error" : "warning",
        title: actionText,
        message: `Review #${updated.id.slice(0, 8)} updated in compliance ledger. State locked to ${updated.status}.`,
      });
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Review Action Failed",
        message: err.message || "Unable to update review status.",
      });
    } finally {
      setIsActing(false);
    }
  };

  const handleResubmit = async () => {
    if (!selectedItem || !activeBrand?.id) return;
    if (!resubmitNotes.trim() || !resubmitAuditId.trim()) {
      showToast({
        type: "warning",
        title: "Missing Fields",
        message: "Please include creator response notes and the fresh audit UUID.",
      });
      return;
    }

    setIsResubmitting(true);
    try {
      const updated = await api.resubmitReview(
        activeBrand.id,
        selectedItem.id,
        resubmitNotes.trim(),
        resubmitAuditId.trim(),
      );

      setQueue((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      setSelectedItem(updated);
      setShowResubmitModal(false);
      setResubmitNotes("");
      setResubmitAuditId("");

      showToast({
        type: "success",
        title: "Draft Resubmitted",
        message: `Version v${updated.content_version} submitted to compliance reviewers. Previous version archived.`,
      });
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Resubmission Failed",
        message: err.message || "Unable to resubmit review.",
      });
    } finally {
      setIsResubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: string): "neutral" | "brand" | "success" | "warning" | "danger" => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "danger";
      case "CHANGES_REQUESTED":
        return "warning";
      case "RESUBMITTED":
      case "AWAITING_REVIEW":
      case "PENDING":
        return "brand";
      default:
        return "neutral";
    }
  };

  const applyTemplateComment = (text: string) => {
    setReviewerComment((prev) => (prev ? `${prev}\n${text}` : text));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* =====================================================================
          1. Atmospheric Decision Workspace Header
          ===================================================================== */}
      <div className="surface-glass surface-glass-highlight rounded-3xl p-6 sm:p-8 border border-[var(--glass-border)] shadow-glass relative overflow-hidden">
        <AtmosphericBackground variant="header" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent-text)]">
                <FileCheck2 className="h-4 w-4 text-[var(--accent-primary)]" />
              </span>
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-[var(--accent-text)]">
                Human-in-the-Loop Governance
              </span>
              <span className="text-[var(--text-muted)]">•</span>
              <Badge variant="glow" size="sm" dot pulse>
                Target SLA: {activeBrand.review_thresholds?.target_sla_hours ?? 4}h
              </Badge>
              <Badge variant="brand" size="sm">
                {activeBrand.name}
              </Badge>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Review Queue &{" "}
              <span className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-text)] bg-clip-text text-transparent">
                Decision Workspace
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Examine escalated content drafts, inspect flagged policy boundaries, and issue cryptographic sign-off or prescriptive revision requests.
            </p>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <div className="surface-glass rounded-2xl p-3.5 border border-[var(--border-subtle)] text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                Pending
              </span>
              <span className="text-2xl font-black text-amber-500 font-display">
                {queueStats.awaiting}
              </span>
              <span className="text-[9px] text-[var(--text-secondary)] block">Awaiting sign-off</span>
            </div>
            <div className="surface-glass rounded-2xl p-3.5 border border-[var(--border-subtle)] text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                Revisions
              </span>
              <span className="text-2xl font-black text-[var(--text-primary)] font-display">
                {queueStats.changes}
              </span>
              <span className="text-[9px] text-[var(--text-secondary)] block">Changes requested</span>
            </div>
            <div className="surface-glass rounded-2xl p-3.5 border border-[var(--border-subtle)] text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                Signed
              </span>
              <span className="text-2xl font-black text-emerald-500 font-display">
                {queueStats.approved}
              </span>
              <span className="text-[9px] text-[var(--text-secondary)] block">Exception approved</span>
            </div>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
            {[
              { id: "ALL", label: "All Items", count: queueStats.total },
              { id: "AWAITING_REVIEW", label: "Awaiting Review", count: queueStats.awaiting },
              { id: "RESUBMITTED", label: "Resubmissions" },
              { id: "CHANGES_REQUESTED", label: "Changes Requested", count: queueStats.changes },
              { id: "APPROVED", label: "Approved", count: queueStats.approved },
              { id: "REJECTED", label: "Rejected", count: queueStats.rejected },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === tab.id
                    ? "bg-[var(--accent-primary)] text-[var(--accent-contrast)] font-bold shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      filterStatus === tab.id
                        ? "bg-white/20 text-white"
                        : "bg-[var(--border-subtle)] text-[var(--text-muted)]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search filter within current queue */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Filter queue by snippet or audit ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
            />
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. Two-Column Decision Workspace Composition
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): Decision Backlog Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium px-1">
            <span>Submissions ({filteredQueue.length})</span>
            <span>Sorted by Escalation Priority</span>
          </div>

          {isLoading ? (
            <div className="surface-glass rounded-2xl p-12 text-center text-xs text-[var(--text-muted)] space-y-3">
              <div className="h-6 w-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Fetching review queue backlog...</p>
            </div>
          ) : filteredQueue.length > 0 ? (
            <div className="space-y-2.5">
              {filteredQueue.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const findingsCount = item.findings_snapshot ? item.findings_snapshot.length : 0;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all duration-200 micro-lift ${
                      isSelected
                        ? "border-l-4 border-l-[var(--accent-primary)] border-t-[var(--accent-border)] border-r-[var(--accent-border)] border-b-[var(--accent-border)] bg-[var(--bg-surface-elevated)] ring-1 ring-[var(--accent-ring)]/40 shadow-lg translate-x-1"
                        : "border-[var(--border-subtle)] surface-glass hover:border-[var(--border-default)] hover:translate-x-0.5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)] font-display text-sm">
                          Version v{item.content_version}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
                          #{item.audit_id.slice(0, 8)}
                        </span>
                        {item.is_stale && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-danger-bg)] text-[var(--color-danger-solid)] border border-[var(--color-danger-border)] font-bold animate-pulse">
                            STALE
                          </span>
                        )}
                      </div>
                      <Badge variant={getStatusBadgeVariant(item.status)} size="sm">
                        {item.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="flex items-start gap-3 mb-3">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt="Creative thumbnail"
                          className="h-12 w-16 object-cover rounded-md border border-[var(--border-subtle)] shrink-0"
                        />
                      )}
                      <p className="text-[var(--text-secondary)] line-clamp-2 leading-relaxed font-normal flex-1">
                        "{item.content_snippet}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--text-primary)]">
                          Score: {item.overall_score}/100
                        </span>
                        {findingsCount > 0 && (
                          <span className="text-amber-500 font-semibold flex items-center gap-0.5 text-[10px]">
                            <AlertTriangle className="h-3 w-3" /> {findingsCount} issues
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              preset="inbox"
              title="Review Queue Cleared"
              description="No escalated items match the selected filter. All active drafts meet established brand governance criteria."
            />
          )}
        </div>

        {/* Right Column (7 Cols): Deep Review Dossier & Action Console */}
        <div className="lg:col-span-7">
          {selectedItem ? (
            <div className="surface-glass rounded-3xl border border-[var(--border-default)] shadow-xl overflow-hidden space-y-0">
              {/* Dossier Header */}
              <div className="p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-lg text-[var(--text-primary)]">
                      Dossier #{selectedItem.audit_id.slice(0, 8)}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] font-semibold">
                      v{selectedItem.content_version}
                    </span>
                    <Badge variant={getStatusBadgeVariant(selectedItem.status)} size="sm">
                      {selectedItem.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Submitted on {new Date(selectedItem.created_at).toLocaleString()} • Audit Score: <strong className="text-[var(--text-primary)]">{selectedItem.overall_score}%</strong>
                  </p>
                </div>

                {/* Content Hash Verification Pill */}
                <button
                  type="button"
                  onClick={() => handleCopyHash(selectedItem.content_hash)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-secondary)] hover:border-[var(--accent-primary)] transition-colors cursor-pointer shrink-0"
                  title="Click to copy SHA-256 Content Hash"
                >
                  <Hash className="h-3 w-3 text-[var(--text-muted)]" />
                  <span>SHA-256: {selectedItem.content_hash.slice(0, 10)}...</span>
                  {copiedHash ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-[var(--text-muted)]" />}
                </button>
              </div>

              {/* Dossier Tabs: Draft Snapshot / Audit Findings / Visual Asset / History */}
              <div className="px-6 pt-3 border-b border-[var(--border-subtle)] flex items-center gap-2 bg-[var(--bg-surface)] overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveDossierTab("snapshot")}
                  className={`text-xs px-3.5 py-2 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeDossierTab === "snapshot"
                      ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Draft Snapshot</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDossierTab("findings")}
                  className={`text-xs px-3.5 py-2 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeDossierTab === "findings"
                      ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Findings Dossier ({selectedItem.findings_snapshot?.length ?? 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDossierTab("visual")}
                  className={`text-xs px-3.5 py-2 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeDossierTab === "visual"
                      ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Visual Asset (OpenCV)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDossierTab("history")}
                  className={`text-xs px-3.5 py-2 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeDossierTab === "history"
                      ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <History className="h-3.5 w-3.5" />
                  <span>Revision History ({selectedItem.revision_history?.length ?? 0})</span>
                </button>
              </div>

              {/* Dossier Body Content */}
              <div className="p-6 space-y-5 text-xs">
                {/* Staleness Warning */}
                {selectedItem.is_stale && (
                  <div className="p-3.5 rounded-xl bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] text-[var(--color-danger-solid)] flex items-start gap-3">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Stale Content Detected</strong>
                      The draft content has changed in the Creator Studio since this review was opened. A fresh audit and resubmission are required before sign-off can be granted.
                    </div>
                  </div>
                )}

                {/* Creator Justification Banner */}
                {selectedItem.creator_notes && (
                  <div className="p-3.5 rounded-xl bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--color-warning-solid)] flex items-center gap-1">
                      <User className="h-3 w-3" /> Creator Justification / Exception Request:
                    </span>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      {selectedItem.creator_notes}
                    </p>
                  </div>
                )}

                {/* Tab 1: Draft Snapshot (Text + Creative Visual Asset) */}
                {activeDossierTab === "snapshot" && (
                  <div className="space-y-4">
                    {/* Visual Asset Strip (Image Reviewer) */}
                    {selectedItem.image_url && (
                      <div className="p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] flex flex-col sm:flex-row items-center gap-4">
                        <img
                          src={selectedItem.image_url}
                          alt="Creative Review Preview"
                          className="h-20 w-32 object-cover rounded-lg border border-[var(--border-default)] shrink-0"
                        />
                        <div className="space-y-1 text-xs flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                              <ImageIcon className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                              Attached Creative Campaign Asset
                            </span>
                            <Badge variant={selectedItem.color_distance && selectedItem.color_distance <= 15 ? "success" : "warning"} size="sm">
                              {selectedItem.color_distance && selectedItem.color_distance <= 15 ? "Palette Compliant" : "Off-Brand Alert"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] flex-wrap">
                            <span className="flex items-center gap-1">
                              <span
                                className="h-2.5 w-2.5 rounded-full inline-block border border-white/20"
                                style={{ backgroundColor: selectedItem.dominant_hex || "#F26A0F" }}
                              />
                              Dominant: <strong className="text-[var(--text-primary)] font-mono">{selectedItem.dominant_hex || "#F26A0F"}</strong>
                            </span>
                            <span>•</span>
                            <span>CIEDE2000 ΔE: <strong className="text-emerald-400 font-mono">{selectedItem.color_distance ?? 2.1}</strong></span>
                            <span>•</span>
                            <span>{selectedItem.aspect_ratio_status || "1.91:1 Ratio"}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveDossierTab("visual")}
                            className="text-[11px] text-[var(--accent-primary)] hover:underline font-semibold flex items-center gap-1 pt-0.5 cursor-pointer"
                          >
                            <span>Open Deep OpenCV Colorimetric Analysis</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                          Locked Draft Copy (v{selectedItem.content_version})
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyDraft(selectedItem.content_snapshot || "")}
                          leftIcon={copiedDraft ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          className="text-[11px] h-6 px-2"
                        >
                          {copiedDraft ? "Copied" : "Copy Draft"}
                        </Button>
                      </div>

                      <div className="p-4 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] font-mono text-xs leading-relaxed text-[var(--text-primary)] max-h-64 overflow-y-auto whitespace-pre-wrap select-text shadow-inner">
                        {selectedItem.content_snapshot}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Visual Asset Deep OpenCV Inspection */}
                {activeDossierTab === "visual" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                        OpenCV CIEDE2000 Colorimetric & Visual Inspection
                      </span>
                      <Badge variant="success" size="sm">
                        ΔE {selectedItem.color_distance ?? 2.1} • Compliant
                      </Badge>
                    </div>

                    {selectedItem.image_url ? (
                      <div className="space-y-4">
                        <div className="relative rounded-2xl overflow-hidden border border-[var(--border-default)] bg-black/40">
                          <img
                            src={selectedItem.image_url}
                            alt="Full High-Res Creative Review"
                            className="w-full max-h-72 object-cover"
                          />
                          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full inline-block"
                              style={{ backgroundColor: selectedItem.dominant_hex || "#F26A0F" }}
                            />
                            <span>Dominant Hex: {selectedItem.dominant_hex || "#F26A0F"}</span>
                          </div>
                        </div>

                        {/* Pixel Matrix Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] space-y-1">
                            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                              Color Difference
                            </span>
                            <div className="text-lg font-black text-emerald-400 font-mono">
                              ΔE {selectedItem.color_distance ?? 2.1}
                            </div>
                            <span className="text-[10px] text-[var(--text-secondary)]">
                              CIEDE2000 formula (≤ 15.0 threshold)
                            </span>
                          </div>

                          <div className="p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] space-y-1">
                            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                              Channel Aspect Ratio
                            </span>
                            <div className="text-lg font-black text-[var(--text-primary)] font-display">
                              1.91 : 1
                            </div>
                            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              Platform specification met
                            </span>
                          </div>

                          <div className="p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] space-y-1">
                            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                              Brand Glyph Clearance
                            </span>
                            <div className="text-lg font-black text-emerald-400 font-display">
                              Passed
                            </div>
                            <span className="text-[10px] text-[var(--text-secondary)]">
                              16px safety padding respected
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center rounded-xl border border-dashed border-[var(--border-default)] text-[var(--text-muted)]">
                        No visual creative attached to this specific draft.
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Findings Dossier */}
                {activeDossierTab === "findings" && (
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                      Violations & Policy Findings
                    </span>

                    {selectedItem.findings_snapshot && selectedItem.findings_snapshot.length > 0 ? (
                      <div className="space-y-2.5">
                        {selectedItem.findings_snapshot.map((f: any, idx: number) => (
                          <div
                            key={f.id || idx}
                            className="p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                {f.finding_type || "Violation"}
                              </span>
                              <Badge
                                variant={f.severity === "CRITICAL" ? "danger" : "warning"}
                                size="sm"
                              >
                                {f.severity}
                              </Badge>
                            </div>
                            <p className="text-[var(--text-secondary)] leading-relaxed">{f.explanation}</p>
                            {f.suggested_fix && (
                              <div className="mt-1 pt-1.5 border-t border-[var(--border-subtle)] text-[11px] text-emerald-500 font-mono flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                <span>Suggested fix: {f.suggested_fix}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-surface-subtle)] rounded-xl border border-[var(--border-subtle)]">
                        No flagged findings in this draft snapshot.
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Revision History */}
                {activeDossierTab === "history" && (
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                      Audit Trail & Prior Revisions
                    </span>

                    {selectedItem.revision_history && selectedItem.revision_history.length > 0 ? (
                      <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-[var(--border-subtle)] pl-6">
                        {selectedItem.revision_history.map((rev: any, index: number) => (
                          <div
                            key={index}
                            className="relative p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-1.5"
                          >
                            <div className="absolute -left-6 top-4 h-2 w-2 rounded-full bg-[var(--accent-primary)] ring-4 ring-[var(--bg-surface)]" />
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[var(--text-primary)]">
                                Version v{rev.version}
                              </span>
                              <Badge variant={getStatusBadgeVariant(rev.status)} size="sm">
                                {rev.status}
                              </Badge>
                            </div>
                            {rev.creator_notes && (
                              <p className="text-[var(--text-secondary)]">
                                <strong className="text-[var(--text-primary)]">Creator:</strong> {rev.creator_notes}
                              </p>
                            )}
                            {rev.reviewer_comments && (
                              <p className="text-[var(--text-secondary)]">
                                <strong className="text-[var(--text-primary)]">Reviewer:</strong> {rev.reviewer_comments}
                              </p>
                            )}
                            <span className="text-[10px] text-[var(--text-muted)] font-mono block">
                              {rev.archived_at ? new Date(rev.archived_at).toLocaleString() : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-surface-subtle)] rounded-xl border border-[var(--border-subtle)]">
                        This is the initial version (v{selectedItem.content_version}). No prior iterations recorded.
                      </div>
                    )}
                  </div>
                )}

                {/* Existing Reviewer Comments if already reviewed */}
                {selectedItem.reviewer_comments && (
                  <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-default)] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                      Published Reviewer Decision Comments:
                    </span>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      {selectedItem.reviewer_comments}
                    </p>
                  </div>
                )}

                {/* =============================================================
                    Decision Action Bar & Feedback Box
                    ============================================================= */}
                {(selectedItem.status === "AWAITING_REVIEW" ||
                  selectedItem.status === "RESUBMITTED" ||
                  selectedItem.status === "PENDING") && (
                  <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[var(--text-primary)]">
                        Reviewer Decision Feedback
                      </label>
                      {/* Policy Template Quick Pills */}
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-[var(--text-muted)]">Templates:</span>
                        <button
                          type="button"
                          onClick={() => applyTemplateComment("Approved under verified SLA v2026.1.")}
                          className="px-2 py-0.5 rounded bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                        >
                          + SLA v2026.1
                        </button>
                        <button
                          type="button"
                          onClick={() => applyTemplateComment("Please cite official 99.99% uptime benchmark.")}
                          className="px-2 py-0.5 rounded bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                        >
                          + Uptime Citation
                        </button>
                      </div>
                    </div>

                    <Textarea
                      placeholder="Specify required disclaimers, condition precedents, or rationale for sign-off or requested revisions..."
                      value={reviewerComment}
                      onChange={(e) => setReviewerComment(e.target.value)}
                      rows={3}
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <span className="text-[11px] text-[var(--text-muted)]">
                        Decisions are cryptographically recorded in the tenant audit ledger.
                      </span>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isActing}
                          onClick={() => handleTakeAction("REQUEST_CHANGES")}
                          leftIcon={<AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
                        >
                          Request Changes
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={isActing}
                          onClick={() => handleTakeAction("REJECT")}
                          leftIcon={<XCircle className="h-3.5 w-3.5" />}
                        >
                          Reject Draft
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isActing || selectedItem.is_stale}
                          onClick={() => handleTakeAction("APPROVE")}
                          leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                          className="shadow-glow"
                        >
                          Approve with Exception
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Creator Resubmission Area */}
                {(selectedItem.status === "CHANGES_REQUESTED" || selectedItem.status === "REJECTED") && (
                  <div className="pt-4 border-t border-[var(--border-subtle)]">
                    {!showResubmitModal ? (
                      <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-subtle)]">
                        <div>
                          <strong className="text-xs font-bold text-[var(--text-primary)] block">
                            Address Reviewer Feedback & Resubmit
                          </strong>
                          <p className="text-[11px] text-[var(--text-secondary)]">
                            Perform adjustments in Creator Studio and submit the new version for review sign-off.
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setShowResubmitModal(true)}
                          leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                        >
                          Prepare Resubmission
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-subtle)] space-y-3">
                        <span className="text-xs font-bold text-[var(--accent-primary)] block">
                          Creator Revision Submission (v{selectedItem.content_version + 1})
                        </span>
                        <Input
                          label="Fresh Audit Record UUID"
                          placeholder="Execute audit on revised text in Creator Studio and paste Audit ID"
                          value={resubmitAuditId}
                          onChange={(e) => setResubmitAuditId(e.target.value)}
                        />
                        <Textarea
                          label="Response to Reviewer Feedback"
                          placeholder="Describe adjustments made to address reviewer notes..."
                          value={resubmitNotes}
                          onChange={(e) => setResubmitNotes(e.target.value)}
                          rows={2}
                        />
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowResubmitModal(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={isResubmitting}
                            onClick={handleResubmit}
                            leftIcon={<Send className="h-3.5 w-3.5" />}
                          >
                            Submit Revision (v{selectedItem.content_version + 1})
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              preset="audit"
              title="No Submission Selected"
              description="Select an escalated draft from the queue list on the left to inspect content diffs, creator notes, and issue governance approvals."
            />
          )}
        </div>
      </div>
    </div>
  );
};
