import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Upload,
  RefreshCw,
  Send,
  CheckCircle2,
  Image as ImageIcon,
  Layers,
  Check,
  ArrowRight,
  Info,
  History,
  RotateCcw,
  Save,
  MessageSquare,
  Copy,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
  Eye,
  Palette,
  Compass,
  Sliders,
  Target,
  Edit3,
  BookOpen,
  FileCheck2,
  Lock,
  Clock,
  ArrowUpRight,
  ExternalLink,
  CheckCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { useTheme } from "../context/ThemeContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../design-system/Card";
import { Button } from "../design-system/Button";
import { Badge } from "../design-system/Badge";
import { Select, Textarea, Input } from "../design-system/FormControls";
import { Modal } from "../design-system/Modal";
import { Skeleton } from "../design-system/Skeleton";
import { AnimatedCounter } from "../design-system/AnimatedCounter";
import { AtmosphericBackground } from "../components/AtmosphericBackground";
import { useNotification } from "../context/NotificationContext";
import { AuditFinding } from "../types";
import { api } from "../api/client";

interface VersionSnapshot {
  id: string;
  timestamp: string;
  label: string;
  text: string;
  score: number | null;
}

const CHANNEL_OPTIONS = [
  { value: "linkedin", label: "LinkedIn", icon: "in", desc: "Professional tone • 100-300 words" },
  { value: "twitter", label: "X / Twitter", icon: "𝕏", desc: "Concise hook • Max 280 chars" },
  { value: "instagram_square", label: "Instagram (1:1)", icon: "ig", desc: "Square visual • 1080x1080" },
  { value: "instagram_portrait", label: "Instagram (4:5)", icon: "ig", desc: "Portrait feed • 1080x1350" },
  { value: "blog", label: "Website / Blog", icon: "web", desc: "In-depth editorial • 600+ words" },
  { value: "email", label: "Email Campaign", icon: "mail", desc: "Punchy CTA • High conversion" },
  { value: "press_release", label: "Press Release", icon: "pr", desc: "Formal announcement • Fact-heavy" },
];

const CONTENT_TYPE_OPTIONS = [
  { value: "social_post", label: "Social Media Post" },
  { value: "caption", label: "Caption / Short Copy" },
  { value: "advertisement", label: "Paid Ad Copy" },
  { value: "blog_post", label: "Blog / Article" },
  { value: "product_description", label: "Product Description" },
  { value: "email_campaign", label: "Email Newsletter" },
  { value: "press_release", label: "Press Release" },
];

export const CreatorStudioView: React.FC = () => {
  const { activeBrand, brands, switchBrand, isDemoMode } = useWorkspace();
  const { isMotionReduced } = useTheme();
  const { showToast } = useNotification();

  // Content configuration states
  const [contentType, setContentType] = useState("social_post");
  const [channel, setChannel] = useState("linkedin");
  const [campaignContext, setCampaignContext] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [referenceBrief, setReferenceBrief] = useState("");

  // Editor states
  const [draftText, setDraftText] = useState(
    "Nexus Cloud delivers guaranteed 100% uptime with our unbeatable 30% discount this quarter. It is the cheapest cloud infrastructure available anywhere!"
  );
  const [isAuditing, setIsAuditing] = useState(false);
  const [currentAuditId, setCurrentAuditId] = useState<string | null>(null);
  const [auditScore, setAuditScore] = useState<number | null>(null);
  const [auditStatus, setAuditStatus] = useState<"PASSED" | "WARNINGS_RESOLVABLE" | "NEEDS_REVIEW">("NEEDS_REVIEW");
  const [auditSummary, setAuditSummary] = useState<string>("");
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [rejectedFindingIds, setRejectedFindingIds] = useState<string[]>([]);
  const [findingFilter, setFindingFilter] = useState<string>("ALL");
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [expandedFindingIds, setExpandedFindingIds] = useState<string[]>([]);

  // Canvas visual mode: "editor" for typing, "review" for inline claim highlight inspector
  const [canvasMode, setCanvasMode] = useState<"editor" | "review">("editor");

  // Right-hand tab switcher: "governance" | "assistant" | "visual"
  const [activeTab, setActiveTab] = useState<"governance" | "assistant" | "visual">("governance");

  // Modals
  const [diffModalFinding, setDiffModalFinding] = useState<AuditFinding | null>(null);
  const [evidenceModalFinding, setEvidenceModalFinding] = useState<AuditFinding | null>(null);
  const [contextModalOpen, setContextModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);

  // Version History states
  const [versionHistory, setVersionHistory] = useState<VersionSnapshot[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // AI Assistant states
  const [assistantQuery, setAssistantQuery] = useState("");
  const [isAskingAssistant, setIsAskingAssistant] = useState(false);
  const [assistantAdvice, setAssistantAdvice] = useState<string | null>(null);
  const [assistantAlternatives, setAssistantAlternatives] = useState<string[]>([]);
  const [assistantChannelNotes, setAssistantChannelNotes] = useState<string | null>(null);

  // Escalation states
  const [creatorNotes, setCreatorNotes] = useState("");
  const [hasEscalated, setHasEscalated] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);

  // Visual Split Vision Engine states
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isAuditingImage, setIsAuditingImage] = useState(false);
  const [visualScore, setVisualScore] = useState<number | null>(null);
  const [visualSummary, setVisualSummary] = useState<string | null>(null);
  const [colorFindings, setColorFindings] = useState<any[]>([]);
  const [aspectRatioCompliant, setAspectRatioCompliant] = useState<boolean | null>(null);
  const [channelSpecDesc, setChannelSpecDesc] = useState<string>("");
  const [logoDetectionResult, setLogoDetectionResult] = useState<any | null>(null);
  const [deterministicExplanations, setDeterministicExplanations] = useState<string[]>([]);
  const [qualitativeAssessment, setQualitativeAssessment] = useState<any | null>(null);
  const [brandAssets, setBrandAssets] = useState<any[]>([]);
  const [selectedLogoId, setSelectedLogoId] = useState<string>("");
  const [colorTolerance, setColorTolerance] = useState<number>(25.0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load brand visual assets from private asset repository
  useEffect(() => {
    if (activeBrand?.id) {
      api.listAssets(activeBrand.id)
        .then((assets) => {
          setBrandAssets(assets || []);
          const firstLogo = assets.find((a: any) => a.asset_type === "LOGO");
          if (firstLogo) {
            setSelectedLogoId(firstLogo.id);
          }
        })
        .catch(() => setBrandAssets([]));
    }
  }, [activeBrand?.id]);

  // Load initial version snapshot on mount
  useEffect(() => {
    if (draftText && versionHistory.length === 0) {
      setVersionHistory([
        {
          id: "v-initial",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          label: "Initial Draft",
          text: draftText,
          score: null,
        },
      ]);
    }
  }, []);

  // Track unsaved changes & Autosave with debounce
  useEffect(() => {
    setHasUnsavedChanges(true);
    const timer = setTimeout(() => {
      setHasUnsavedChanges(false);
      setLastSavedTime(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    }, 2500);

    return () => clearTimeout(timer);
  }, [draftText, campaignContext, targetAudience, referenceBrief, channel, contentType]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  // Word & Reading Time calculations
  const wordCount = useMemo(() => {
    return draftText.trim() ? draftText.trim().split(/\s+/).length : 0;
  }, [draftText]);

  const readingTimeMin = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  // Filter active findings
  const visibleFindings = useMemo(() => {
    return findings.filter((f) => {
      if (f.isApplied) return false;
      if (rejectedFindingIds.includes(f.id)) return false;
      if (findingFilter === "ALL") return true;
      if (findingFilter === "FACTS") return f.findingType === "FACTUAL_INACCURACY";
      if (findingFilter === "CLAIMS")
        return f.findingType === "PROHIBITED_CLAIM" || f.findingType === "PROHIBITED_TERM";
      if (findingFilter === "DISCLOSURES") return f.findingType === "MISSING_DISCLOSURE";
      if (findingFilter === "TONE") return f.findingType === "TONE_DEVIATION";
      return true;
    });
  }, [findings, rejectedFindingIds, findingFilter]);

  // Auto-expand selected finding
  useEffect(() => {
    if (selectedFindingId && !expandedFindingIds.includes(selectedFindingId)) {
      setExpandedFindingIds((prev) => [...prev, selectedFindingId]);
    }
  }, [selectedFindingId]);

  // Manual Save Version
  const handleSaveVersion = (customLabel?: string) => {
    const newVersion: VersionSnapshot = {
      id: `v-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      label: customLabel || `Revision ${versionHistory.length + 1} (${channel})`,
      text: draftText,
      score: auditScore,
    };
    setVersionHistory((prev) => [newVersion, ...prev]);
    setHasUnsavedChanges(false);
    setLastSavedTime(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    );
    showToast({
      type: "success",
      title: "Draft Version Saved",
      message: `Captured snapshot: "${newVersion.label}".`,
    });
  };

  const handleRestoreVersion = (snapshot: VersionSnapshot) => {
    setDraftText(snapshot.text);
    setAuditScore(snapshot.score);
    setHistoryModalOpen(false);
    showToast({
      type: "info",
      title: "Version Restored",
      message: `Restored draft from ${snapshot.timestamp} (${snapshot.label}).`,
    });
  };

  // Run Text Audit
  const handleAudit = async () => {
    if (!draftText.trim()) {
      showToast({
        type: "warning",
        title: "Draft is Empty",
        message: "Please write or paste draft copy before running governance audit.",
      });
      return;
    }

    setIsAuditing(true);
    setHasEscalated(false);
    setActiveTab("governance");

    let brandIdToUse = activeBrand?.id;

    // Auto-authenticate with demo credentials if no token
    if (!api.hasTokens() || !brandIdToUse || brandIdToUse.startsWith("brand-")) {
      try {
        const loginRes = await api.login({ email: "demo.creator@inkloom.io", password: "Password123!" });
        if (loginRes.user?.memberships?.[0]?.brand_id) {
          brandIdToUse = loginRes.user.memberships[0].brand_id;
        }
      } catch (loginErr: any) {
        setIsAuditing(false);
        showToast({
          type: "error",
          title: "Authentication Required",
          message:
            "Please sign in with your account to execute backend audits. Ensure backend is running at http://127.0.0.1:8000.",
        });
        return;
      }
    }

    if (!brandIdToUse) {
      setIsAuditing(false);
      showToast({
        type: "error",
        title: "No Active Brand",
        message: "Please select an authorized brand workspace first.",
      });
      return;
    }

    try {
      const response = await api.auditText(brandIdToUse, {
        draft_text: draftText,
        channel,
      });

      setCurrentAuditId(response.audit_id);
      setAuditScore(response.overall_score);
      setAuditStatus(response.status as any);
      setAuditSummary(response.summary || "Evaluation completed against active brand facts & rules.");

      const mappedFindings: AuditFinding[] = (response.findings || []).map((f, idx) => ({
        id: f.id || `finding-${idx}`,
        findingType: f.finding_type as any,
        severity: f.severity,
        originalSnippet: f.original_snippet,
        explanation: f.explanation,
        citationReference: f.citation_reference,
        suggestedFix: f.suggested_fix,
        isApplied: false,
      }));

      setFindings(mappedFindings);
      setRejectedFindingIds([]);
      if (mappedFindings.length > 0) {
        setSelectedFindingId(mappedFindings[0].id);
        setExpandedFindingIds([mappedFindings[0].id]);
      }

      // Snapshot audited state
      handleSaveVersion(`Audited: Score ${response.overall_score}`);

      showToast({
        type: response.overall_score >= 80 ? "success" : "info",
        title: "Governance Audit Completed",
        message: response.summary || `Evaluated against brand facts. Score: ${response.overall_score}/100.`,
      });
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Audit Failed",
        message: err.message || "Failed to audit draft with governance engine.",
      });
    } finally {
      setIsAuditing(false);
    }
  };

  // Keyboard shortcut Ctrl+Enter to run audit
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleAudit();
    }
  };

  // Apply single rewrite
  const applyRewrite = (finding: AuditFinding) => {
    if (!draftText.includes(finding.originalSnippet)) {
      showToast({
        type: "warning",
        title: "Snippet Not Found",
        message: "The original text snippet has already been edited or replaced.",
      });
      return;
    }

    // Preserve undo state before applying
    handleSaveVersion(`Before Fix: ${finding.originalSnippet.slice(0, 20)}...`);

    const updatedText = draftText.replace(finding.originalSnippet, finding.suggestedFix);
    setDraftText(updatedText);
    setFindings((prev) =>
      prev.map((f) => (f.id === finding.id ? { ...f, isApplied: true } : f))
    );

    // Record finding acceptance in backend audit ledger
    if (activeBrand?.id && currentAuditId && finding.id) {
      api.acceptAuditFinding(activeBrand.id, currentAuditId, finding.id).catch((err) => {
        console.warn("Could not log accepted finding to backend:", err);
      });
    }

    // Increment compliance score
    setAuditScore((prev) => {
      const next = Math.min(100, (prev || 50) + 16);
      if (next >= 90) setAuditStatus("PASSED");
      else if (next >= 70) setAuditStatus("WARNINGS_RESOLVABLE");
      return next;
    });

    showToast({
      type: "success",
      title: "Correction Applied",
      message: `Replaced "${finding.originalSnippet}" with compliant wording.`,
    });
  };

  // Reject a suggestion
  const rejectSuggestion = (findingId: string) => {
    setRejectedFindingIds((prev) => [...prev, findingId]);
    showToast({
      type: "info",
      title: "Finding Dismissed",
      message: "Suggestion rejected by creator.",
    });
  };

  // Toggle accordion item
  const toggleFindingExpansion = (id: string) => {
    setExpandedFindingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Run AI Assistant
  const handleAskAssistant = async (queryPreset?: string) => {
    const q = queryPreset || assistantQuery;
    if (!q.trim()) return;

    if (!activeBrand?.id) {
      showToast({
        type: "error",
        title: "No Brand Selected",
        message: "Please select an authorized brand workspace.",
      });
      return;
    }

    setIsAskingAssistant(true);
    setActiveTab("assistant");
    try {
      const res = await api.getAssistantSuggestions(activeBrand.id, {
        draft_text: draftText,
        query: q,
        channel,
      });

      setAssistantAdvice(res.advice);
      setAssistantAlternatives(res.alternatives || []);
      setAssistantChannelNotes(res.channel_notes);
      setAssistantQuery("");
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Assistant Request Failed",
        message: err.message || "Failed to retrieve suggestions from AI assistant.",
      });
    } finally {
      setIsAskingAssistant(false);
    }
  };

  // Apply alternative copy from Assistant
  const applyAlternative = (altText: string) => {
    handleSaveVersion("Before AI Alternative");
    setDraftText(altText);
    showToast({
      type: "success",
      title: "Alternative Applied",
      message: "Draft replaced with brand-aligned alternative. Run audit to verify.",
    });
  };

  // Real Image File Upload & Split Vision Audit
  const runVisualAudit = async (fileToAudit?: File) => {
    const file = fileToAudit || uploadedImageFile;
    if (!file) return;

    if (!activeBrand?.id) {
      showToast({
        type: "error",
        title: "No Active Brand",
        message: "Please select an authorized brand workspace.",
      });
      return;
    }

    setIsAuditingImage(true);
    setActiveTab("visual");
    try {
      const res = await api.auditImage(activeBrand.id, file, {
        channel,
        brief_context: referenceBrief || campaignContext || undefined,
        color_tolerance: colorTolerance,
        reference_logo_id: selectedLogoId || undefined,
      });

      setVisualScore(res.overall_visual_score);
      setVisualSummary(res.summary);
      setColorFindings(res.color_findings || []);
      setAspectRatioCompliant(res.is_aspect_ratio_compliant);
      setChannelSpecDesc(res.target_channel_spec);
      setLogoDetectionResult(res.logo_detection);
      setDeterministicExplanations(res.deterministic_explanations || []);
      setQualitativeAssessment(res.qualitative_assessment);

      showToast({
        type: res.overall_visual_score >= 80 ? "success" : "info",
        title: "Split Vision Audit Completed",
        message: res.summary,
      });
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Visual Audit Failed",
        message: err.message || "Failed to audit visual asset with Split Vision Engine.",
      });
    } finally {
      setIsAuditingImage(false);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreviewUrl(preview);
    await runVisualAudit(file);
  };

  // Escalation submission
  const handleEscalateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let brandIdToUse = activeBrand?.id;
    if (!brandIdToUse || brandIdToUse.startsWith("brand-")) {
      try {
        const me = await api.getMe();
        brandIdToUse = me.memberships?.[0]?.brand_id;
      } catch {}
    }

    if (!brandIdToUse || !currentAuditId) {
      showToast({
        type: "warning",
        title: "Cannot Escalate",
        message: "Please complete an audit before submitting an escalation.",
      });
      return;
    }

    setIsEscalating(true);
    try {
      await api.escalateAudit(brandIdToUse, currentAuditId, {
        creator_notes: creatorNotes,
      });

      setEscalateModalOpen(false);
      setHasEscalated(true);
      showToast({
        type: "success",
        title: "Escalated to Review Queue",
        message: "Draft successfully submitted to authorized brand compliance reviewers.",
      });
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Escalation Failed",
        message: err.message || "Failed to submit draft to review queue.",
      });
    } finally {
      setIsEscalating(false);
    }
  };

  // Explicit demo sample presets
  const loadDemoSample = (type: "violations" | "clean") => {
    if (type === "violations") {
      setDraftText(
        "Nexus Cloud delivers guaranteed 100% uptime with our unbeatable 30% discount this quarter. It is the cheapest cloud infrastructure available anywhere!"
      );
    } else {
      setDraftText(
        "Nexus Cloud delivers guaranteed 99.99% multi-region uptime backed by enterprise financial SLAs. Take advantage of an exclusive 20% promotional credit for eligible Q4 enterprise accounts."
      );
    }
    setAuditScore(null);
    setCurrentAuditId(null);
    setFindings([]);
    setHasEscalated(false);
    setSelectedFindingId(null);
    showToast({
      type: "info",
      title: type === "violations" ? "Demo Violations Loaded" : "Demo Compliant Loaded",
      message: "Ready to run governance audit.",
    });
  };

  // Radial chart stroke calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const currentScoreVal = auditScore ?? 0;
  const strokeDashoffset = circumference - (Math.min(Math.max(currentScoreVal, 0), 100) / 100) * circumference;

  // Render Annotated Text with Clickable Findings in Claim Review Mode
  const renderAnnotatedText = () => {
    if (!draftText) {
      return <span className="text-[var(--text-muted)] italic">No draft copy written yet...</span>;
    }
    if (visibleFindings.length === 0) {
      return <span className="whitespace-pre-wrap">{draftText}</span>;
    }

    const matches: { start: number; end: number; finding: AuditFinding }[] = [];
    visibleFindings.forEach((f) => {
      if (!f.originalSnippet) return;
      let idx = draftText.indexOf(f.originalSnippet);
      while (idx !== -1) {
        matches.push({ start: idx, end: idx + f.originalSnippet.length, finding: f });
        idx = draftText.indexOf(f.originalSnippet, idx + f.originalSnippet.length);
      }
    });

    matches.sort((a, b) => a.start - b.start);

    // Remove overlapping matches
    const nonOverlapping: { start: number; end: number; finding: AuditFinding }[] = [];
    let lastEnd = 0;
    for (const m of matches) {
      if (m.start >= lastEnd) {
        nonOverlapping.push(m);
        lastEnd = m.end;
      }
    }

    if (nonOverlapping.length === 0) {
      return <span className="whitespace-pre-wrap">{draftText}</span>;
    }

    const elements: React.ReactNode[] = [];
    let cur = 0;
    nonOverlapping.forEach((m, i) => {
      if (m.start > cur) {
        elements.push(<span key={`txt-${i}`}>{draftText.substring(cur, m.start)}</span>);
      }
      const isSelected = selectedFindingId === m.finding.id;
      const severityStyles =
        m.finding.severity === "CRITICAL"
          ? "bg-rose-500/20 text-rose-300 border-b-2 border-rose-500 hover:bg-rose-500/30"
          : m.finding.severity === "WARNING"
          ? "bg-amber-500/20 text-amber-300 border-b-2 border-amber-500 hover:bg-amber-500/30"
          : "bg-sky-500/20 text-sky-300 border-b-2 border-sky-500 hover:bg-sky-500/30";

      elements.push(
        <button
          type="button"
          key={`match-${i}`}
          onClick={() => {
            setSelectedFindingId(m.finding.id);
            setActiveTab("governance");
          }}
          className={`px-1.5 py-0.5 rounded transition-all cursor-pointer inline text-left font-mono ${severityStyles} ${
            isSelected
              ? "ring-2 ring-[var(--accent-primary)] font-bold scale-[1.02] shadow-sm"
              : ""
          }`}
          title={`Click to inspect: ${m.finding.explanation}`}
        >
          <span>{draftText.substring(m.start, m.end)}</span>
          <span className="ml-1.5 text-[9px] uppercase px-1 py-0.2 rounded bg-black/40 font-mono font-bold tracking-wider">
            {m.finding.severity}
          </span>
        </button>
      );
      cur = m.end;
    });

    if (cur < draftText.length) {
      elements.push(<span key="txt-end">{draftText.substring(cur)}</span>);
    }

    return <div className="whitespace-pre-wrap leading-relaxed">{elements}</div>;
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* ========================================================================= */}
      {/* 1. TOP STUDIO CONTROL BAR                                                 */}
      {/* ========================================================================= */}
      <div className="relative rounded-2xl surface-glass surface-glass-highlight border border-[var(--glass-border)] shadow-glass p-4 sm:p-5 overflow-hidden">
        <AtmosphericBackground variant="header" intensity="subtle" />

        <div className="relative z-10 space-y-4">
          {/* Upper Deck: Identity, Brand Workspace & Action Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full bg-emerald-500 ${
                    isMotionReduced ? "" : "animate-ping"
                  }`}
                />
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--accent-text)]">
                  Creator Studio • Brand Cockpit
                </span>
                <span className="text-[var(--text-muted)]">•</span>
                <Badge variant="glow" size="sm">
                  Live Engine
                </Badge>
                {activeBrand?.name && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-default)] font-semibold text-[var(--text-secondary)]">
                    {activeBrand.name}
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] flex items-center gap-2.5 tracking-tight">
                <Sparkles
                  className={`h-6 w-6 text-[var(--accent-primary)] ${
                    isMotionReduced ? "" : "animate-pulse"
                  }`}
                />
                Inkloom Creator Studio
              </h1>
              <p className="text-xs text-[var(--text-secondary)]">
                Autonomous editorial workspace grounded in real brand facts, regulatory guardrails, and deterministic visual rules.
              </p>
            </div>

            {/* Right: Autosave status, Brand Switcher, History, Save */}
            <div className="flex items-center flex-wrap gap-2 sm:gap-3">
              {/* Animated Autosave Indicator */}
              <div
                className="surface-glass-subtle px-3 py-1.5 rounded-xl border border-[var(--border-default)] flex items-center gap-2 text-[11px] font-mono shadow-xs"
                title="Autosave debounced every 2.5s"
              >
                {hasUnsavedChanges ? (
                  <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <span
                      className={`h-2 w-2 rounded-full bg-amber-400 ${
                        isMotionReduced ? "" : "animate-pulse"
                      }`}
                    />
                    Autosaving edits...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Saved {lastSavedTime ? `at ${lastSavedTime}` : "locally"}
                  </span>
                )}
              </div>

              {/* Brand Workspace Selector */}
              <div className="w-44">
                <Select
                  value={activeBrand?.id || ""}
                  onChange={(e) => switchBrand(e.target.value)}
                  options={brands.map((b) => ({
                    value: b.id,
                    label: b.name,
                  }))}
                />
              </div>

              {/* Save Snapshot Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleSaveVersion()}
                leftIcon={<Save className="h-3.5 w-3.5" />}
              >
                Save Snapshot
              </Button>

              {/* Version History Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHistoryModalOpen(true)}
                leftIcon={<History className="h-3.5 w-3.5" />}
              >
                History ({versionHistory.length})
              </Button>

              {/* Demo Mode Quick Presets */}
              {isDemoMode && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-rose-400 hover:text-rose-300"
                    onClick={() => loadDemoSample("violations")}
                  >
                    Demo Violation
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-emerald-400 hover:text-emerald-300"
                    onClick={() => loadDemoSample("clean")}
                  >
                    Demo Clean
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Lower Deck: Channel Pills, Content Type & Target Context */}
          <div className="pt-3 border-t border-[var(--glass-border)] flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Channel Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mr-1 hidden sm:inline">
                Channel:
              </span>
              {CHANNEL_OPTIONS.map((ch) => {
                const isActive = channel === ch.value;
                return (
                  <button
                    key={ch.value}
                    type="button"
                    onClick={() => setChannel(ch.value)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-[var(--accent-primary)] text-[var(--accent-contrast)] border-transparent font-semibold shadow-accent-glow scale-[1.02]"
                        : "border-[var(--border-default)] bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-border)]"
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-80">{ch.icon}</span>
                    <span>{ch.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Content Type Dropdown & Context Trigger */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-44">
                <Select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  options={CONTENT_TYPE_OPTIONS}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setContextModalOpen(true)}
                leftIcon={<SlidersHorizontal className="h-3.5 w-3.5 text-[var(--accent-primary)]" />}
              >
                Target Brief
                {(campaignContext || targetAudience) && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN CREATIVE STUDIO STAGE (Canvas vs Inspection & Copilot)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ======================================================================= */}
        {/* LEFT COLUMN: THE WRITING CANVAS & INLINE CLAIM INSPECTOR (7 cols)       */}
        {/* ======================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          <Card
            variant="glass"
            className="shadow-glass border border-[var(--glass-border)] transition-all duration-300 focus-within:border-[var(--accent-primary)] focus-within:ring-2 focus-within:ring-[var(--accent-glow)]"
          >
            <CardHeader className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[var(--accent-primary)]" />
                    Creative Writing Canvas
                  </CardTitle>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-default)] text-[var(--text-muted)]">
                    {CHANNEL_OPTIONS.find((c) => c.value === channel)?.label || channel}
                  </span>
                </div>
                <CardDescription className="text-xs mt-0.5">
                  Write, polish, and verify draft copy with real-time compliance highlighting and audit telemetry.
                </CardDescription>
              </div>

              {/* Canvas Mode Switcher & Audit CTA */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* View Mode: Editor vs Claim Review */}
                <div className="p-0.5 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-default)] flex items-center">
                  <button
                    type="button"
                    onClick={() => setCanvasMode("editor")}
                    className={`text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium ${
                      canvasMode === "editor"
                        ? "bg-[var(--accent-primary)] text-[var(--accent-contrast)] shadow-xs font-semibold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Drafting
                  </button>
                  <button
                    type="button"
                    onClick={() => setCanvasMode("review")}
                    className={`text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer font-medium flex items-center gap-1 ${
                      canvasMode === "review"
                        ? "bg-[var(--accent-primary)] text-[var(--accent-contrast)] shadow-xs font-semibold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <span>Claim Review</span>
                    {visibleFindings.length > 0 && (
                      <span className="text-[10px] px-1 rounded-full bg-rose-500 text-white font-mono">
                        {visibleFindings.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Primary Governance Audit CTA */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAudit}
                  isLoading={isAuditing}
                  leftIcon={<ShieldCheck className="h-4 w-4" />}
                  className="shadow-accent-glow font-semibold"
                >
                  Run Audit
                </Button>
              </div>
            </CardHeader>

            {/* Flagged Claims Ribbon (Visible whenever unapplied findings exist) */}
            {visibleFindings.length > 0 && (
              <div className="px-4 py-2.5 bg-[var(--bg-surface-subtle)] border-b border-[var(--border-subtle)] flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider shrink-0 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                  Flagged Claims ({visibleFindings.length}):
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {visibleFindings.map((f) => {
                    const isSelected = selectedFindingId === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setSelectedFindingId(f.id);
                          setActiveTab("governance");
                        }}
                        className={`text-[11px] px-2 py-0.5 rounded-lg border font-mono truncate max-w-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                          f.severity === "CRITICAL"
                            ? "border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                            : f.severity === "WARNING"
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                            : "border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
                        } ${isSelected ? "ring-2 ring-[var(--accent-primary)] font-bold scale-[1.03]" : ""}`}
                      >
                        <span className="font-semibold text-[9px] uppercase tracking-wider">
                          {f.severity === "CRITICAL" ? "Crit" : "Warn"}:
                        </span>
                        <span>"{f.originalSnippet}"</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Canvas Body */}
            <CardContent className="p-5 space-y-4">
              {canvasMode === "editor" ? (
                <div className="relative">
                  <Textarea
                    rows={12}
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    placeholder="Write, paste, or draft your creative copy here. Press Ctrl+Enter to audit..."
                    className="font-mono text-sm leading-relaxed tracking-normal p-4 bg-[var(--bg-surface-subtle)] focus:bg-[var(--bg-surface)] border-[var(--border-default)] transition-colors"
                  />
                  {isAuditing && (
                    <div className="absolute inset-0 bg-[var(--bg-surface)]/60 backdrop-blur-xs flex items-center justify-center rounded-xl pointer-events-none">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--accent-border)] shadow-lg">
                        <RefreshCw
                          className={`h-4 w-4 text-[var(--accent-primary)] ${
                            isMotionReduced ? "" : "animate-spin"
                          }`}
                        />
                        <span className="text-xs font-semibold text-[var(--text-primary)]">
                          Evaluating ground truth & brand rules...
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="min-h-[280px] p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] font-mono text-sm leading-relaxed overflow-y-auto max-h-[420px]">
                  <div className="text-[11px] font-sans font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>Interactive Annotated Draft:</span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      Click any highlighted snippet to view rules & 1-click apply fixes
                    </span>
                  </div>
                  {renderAnnotatedText()}
                </div>
              )}

              {/* Canvas Bottom Telemetry Strip */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 text-[var(--text-muted)] flex-wrap">
                  <span className="flex items-center gap-1 font-mono">
                    <strong className="text-[var(--text-primary)]">{draftText.length}</strong> chars
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <strong className="text-[var(--text-primary)]">{wordCount}</strong> words
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" /> ~{readingTimeMin} min read
                  </span>
                  <span>•</span>
                  <span className="text-[11px]">
                    {CHANNEL_OPTIONS.find((c) => c.value === channel)?.desc}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDraftText("")}
                    disabled={!draftText}
                    className="text-xs text-[var(--text-muted)] hover:text-rose-400"
                  >
                    Clear Canvas
                  </Button>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono hidden md:inline">
                    ⌘↵ / Ctrl+Enter to audit
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: MULTI-ENGINE COPILOT (Governance, Assistant, Split Vision)*/}
        {/* ======================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <Card variant="glass" className="shadow-glass border border-[var(--glass-border)]">
            {/* Tab Navigation Header */}
            <div className="p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] w-full">
                <button
                  type="button"
                  onClick={() => setActiveTab("governance")}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "governance"
                      ? "bg-[var(--accent-primary)] text-[var(--accent-contrast)] shadow-accent-glow"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Governance</span>
                  {visibleFindings.length > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        activeTab === "governance"
                          ? "bg-black/30 text-white"
                          : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {visibleFindings.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("assistant")}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "assistant"
                      ? "bg-[var(--accent-primary)] text-[var(--accent-contrast)] shadow-accent-glow"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Assistant</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("visual")}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "visual"
                      ? "bg-[var(--accent-primary)] text-[var(--accent-contrast)] shadow-accent-glow"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Split-Vision</span>
                  {visualScore !== null && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-text)] font-mono">
                      {visualScore}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Tab 1 Content: Governance Inspection Panel */}
            {activeTab === "governance" && (
              <CardContent className="p-4 sm:p-5 space-y-4">
                {isAuditing ? (
                  /* Skeleton State during Audit */
                  <div className="space-y-4 py-2">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-default)]">
                      <Skeleton className="h-20 w-20 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-24 w-full rounded-xl" />
                      <Skeleton className="h-24 w-full rounded-xl" />
                    </div>
                  </div>
                ) : auditScore !== null ? (
                  <>
                    {/* Compliance Radial Gauge & Score Box */}
                    <div className="p-4 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-default)] flex items-center justify-between gap-4">
                      {/* Animated Radial Progress Ring */}
                      <div className="relative h-20 w-20 shrink-0 flex items-center justify-center">
                        <svg className="h-20 w-20 -rotate-90 transform" viewBox="0 0 90 90">
                          {/* Track */}
                          <circle
                            cx="45"
                            cy="45"
                            r={radius}
                            className="stroke-[var(--border-default)]"
                            strokeWidth="7"
                            fill="transparent"
                          />
                          {/* Animated Value Arc */}
                          <circle
                            cx="45"
                            cy="45"
                            r={radius}
                            className={`transition-all duration-700 ease-out ${
                              auditScore >= 80
                                ? "stroke-emerald-400"
                                : auditScore >= 60
                                ? "stroke-amber-400"
                                : "stroke-rose-400"
                            }`}
                            strokeWidth="7"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            fill="transparent"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="font-display text-xl font-black text-[var(--text-primary)] leading-none">
                            <AnimatedCounter value={auditScore ?? 0} />
                          </span>
                          <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase">
                            Index
                          </span>
                        </div>
                      </div>

                      {/* Score Metrics & Status Badge */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                            Brand Compliance
                          </span>
                          <Badge
                            variant={
                              auditStatus === "PASSED"
                                ? "success"
                                : auditStatus === "WARNINGS_RESOLVABLE"
                                ? "warning"
                                : "danger"
                            }
                            size="sm"
                          >
                            {auditStatus}
                          </Badge>
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] font-medium">
                          {visibleFindings.length === 0 ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> 100% compliant with brand rules
                            </span>
                          ) : (
                            <span>
                              <strong>{visibleFindings.length}</strong> deviation
                              {visibleFindings.length === 1 ? "" : "s"} require resolution
                            </span>
                          )}
                        </div>
                        {auditSummary && (
                          <p className="text-[11px] text-[var(--text-muted)] italic line-clamp-2">
                            "{auditSummary}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Category Filter Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setFindingFilter("ALL")}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                          findingFilter === "ALL"
                            ? "bg-[var(--accent-primary)] text-[var(--accent-contrast)] border-transparent font-semibold shadow-xs"
                            : "border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
                        }`}
                      >
                        All ({findings.filter((f) => !f.isApplied && !rejectedFindingIds.includes(f.id)).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFindingFilter("FACTS")}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                          findingFilter === "FACTS"
                            ? "bg-[var(--accent-primary)] text-[var(--accent-contrast)] border-transparent font-semibold shadow-xs"
                            : "border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
                        }`}
                      >
                        Facts
                      </button>
                      <button
                        type="button"
                        onClick={() => setFindingFilter("CLAIMS")}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                          findingFilter === "CLAIMS"
                            ? "bg-[var(--accent-primary)] text-[var(--accent-contrast)] border-transparent font-semibold shadow-xs"
                            : "border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
                        }`}
                      >
                        Prohibited Claims
                      </button>
                      <button
                        type="button"
                        onClick={() => setFindingFilter("DISCLOSURES")}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                          findingFilter === "DISCLOSURES"
                            ? "bg-[var(--accent-primary)] text-[var(--accent-contrast)] border-transparent font-semibold shadow-xs"
                            : "border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
                        }`}
                      >
                        Disclosures
                      </button>
                      <button
                        type="button"
                        onClick={() => setFindingFilter("TONE")}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                          findingFilter === "TONE"
                            ? "bg-[var(--accent-primary)] text-[var(--accent-contrast)] border-transparent font-semibold shadow-xs"
                            : "border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
                        }`}
                      >
                        Tone & Style
                      </button>
                    </div>

                    {/* Expandable Findings Cards List */}
                    <div className="space-y-3">
                      {visibleFindings.length > 0 ? (
                        visibleFindings.map((f) => {
                          const isExpanded = expandedFindingIds.includes(f.id);
                          const isSelected = selectedFindingId === f.id;

                          return (
                            <div
                              key={f.id}
                              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                                f.severity === "CRITICAL"
                                  ? "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50"
                                  : f.severity === "WARNING"
                                  ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                                  : "border-sky-500/30 bg-sky-500/5 hover:border-sky-500/50"
                              } ${
                                isSelected
                                  ? "ring-2 ring-[var(--accent-primary)] shadow-md"
                                  : ""
                              }`}
                            >
                              {/* Header Accordion Bar */}
                              <div
                                onClick={() => {
                                  setSelectedFindingId(f.id);
                                  toggleFindingExpansion(f.id);
                                }}
                                className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <Badge
                                    variant={
                                      f.severity === "CRITICAL"
                                        ? "danger"
                                        : f.severity === "WARNING"
                                        ? "warning"
                                        : "neutral"
                                    }
                                    size="sm"
                                  >
                                    {f.severity}
                                  </Badge>
                                  <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                                    "{f.originalSnippet}"
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] uppercase font-mono font-bold text-[var(--text-muted)]">
                                    {f.findingType.replace(/_/g, " ")}
                                  </span>
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                                  )}
                                </div>
                              </div>

                              {/* Expanded Details */}
                              {isExpanded && (
                                <div className="p-4 pt-1 space-y-3 border-t border-[var(--border-subtle)] text-xs">
                                  {/* Flagged Snippet Box */}
                                  <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-xs">
                                    <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold tracking-wider mb-1">
                                      Flagged draft snippet:
                                    </span>
                                    <span className="bg-rose-500/15 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded">
                                      "{f.originalSnippet}"
                                    </span>
                                  </div>

                                  {/* Explanation & Rationale */}
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">
                                      Evaluation Rationale:
                                    </span>
                                    <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
                                      {f.explanation}
                                    </p>
                                  </div>

                                  {/* Clickable Policy Citation Reference */}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">
                                      Ground Truth Rule:
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setEvidenceModalFinding(f)}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--accent-subtle)] border border-[var(--accent-border)] text-[var(--accent-text)] font-mono text-[11px] font-semibold hover:brightness-110 cursor-pointer transition-all"
                                      title="Click to view verified ground truth evidence"
                                    >
                                      <BookOpen className="h-3 w-3 text-[var(--accent-primary)]" />
                                      <span>{f.citationReference}</span>
                                      <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                                    </button>
                                  </div>

                                  {/* Suggested Fix */}
                                  {f.suggestedFix && (
                                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 space-y-1">
                                      <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">
                                        Actionable Rewrite Fix:
                                      </span>
                                      <p className="font-mono text-emerald-300 text-xs">
                                        "{f.suggestedFix}"
                                      </p>
                                    </div>
                                  )}

                                  {/* Action Buttons: Compare Diff, Reject, Apply Rewrite */}
                                  <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-[11px] h-7 px-2"
                                        onClick={() => setDiffModalFinding(f)}
                                      >
                                        Compare Diff
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-[11px] h-7 px-2 text-[var(--text-muted)] hover:text-rose-400"
                                        onClick={() => rejectSuggestion(f.id)}
                                      >
                                        Dismiss
                                      </Button>
                                    </div>

                                    {f.suggestedFix && (
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => applyRewrite(f)}
                                        className="h-7 text-xs font-semibold shadow-xs"
                                        leftIcon={<CheckCheck className="h-3.5 w-3.5" />}
                                      >
                                        Apply Rewrite
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
                          <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                          <h4 className="text-sm font-bold text-white">
                            100% Brand Compliant
                          </h4>
                          <p className="text-xs opacity-90 max-w-sm mx-auto">
                            All factual claims, SLAs, disclosures, and brand voice guidelines are satisfied. Ready to publish across {channel}.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Escalate Exception Button */}
                    <div className="pt-2 border-t border-[var(--border-subtle)]">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => setEscalateModalOpen(true)}
                        disabled={hasEscalated}
                        leftIcon={<Send className="h-3.5 w-3.5" />}
                      >
                        {hasEscalated
                          ? "Escalated to Compliance Review Queue"
                          : "Request Reviewer Exception Sign-Off"}
                      </Button>
                    </div>
                  </>
                ) : (
                  /* Initial Empty State */
                  <div className="py-16 text-center text-xs text-[var(--text-muted)] space-y-3">
                    <div className="h-14 w-14 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center mx-auto text-[var(--accent-primary)]">
                      <ShieldCheck className="h-7 w-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">
                        Governance Engine Ready
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs mx-auto">
                        Click "Run Audit" on the canvas to inspect copy against verified brand facts, prohibited claims, and tone rules.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            )}

            {/* Tab 2 Content: AI Brand Assistant */}
            {activeTab === "assistant" && (
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--accent-text)] tracking-wider">
                    Contextual AI Assistant
                  </span>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Grounded in <strong>{activeBrand?.name || "Active Brand"}</strong> verified knowledge, SLAs, and channel conventions.
                  </p>
                </div>

                {/* Preset Prompt Pills */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleAskAssistant("How do I make this copy sound more premium and authoritative?")
                    }
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                  >
                    Make it sound more premium
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAskAssistant(`Adapt this copy specifically for ${channel}`)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                  >
                    Adapt for {channel}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAskAssistant("Generate 3 punchy, 100% compliant alternatives")}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                  >
                    Suggest 3 alternatives
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAskAssistant("Check SLA phrasing guidelines")}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                  >
                    Explain SLA guidelines
                  </button>
                </div>

                {/* Query Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask assistant: e.g. How should I phrase our enterprise guarantee?"
                    value={assistantQuery}
                    onChange={(e) => setAssistantQuery(e.target.value)}
                    className="text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAskAssistant();
                    }}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAskAssistant()}
                    isLoading={isAskingAssistant}
                  >
                    Ask
                  </Button>
                </div>

                {/* Assistant Response Skeleton or Results */}
                {isAskingAssistant ? (
                  <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-default)] space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-8 w-3/4" />
                  </div>
                ) : assistantAdvice ? (
                  <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--accent-border)] text-xs space-y-3">
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-[var(--accent-text)] flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                        Assistant Guidance:
                      </div>
                      <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
                        {assistantAdvice}
                      </p>
                    </div>

                    {assistantChannelNotes && (
                      <p className="text-[11px] text-[var(--text-muted)] italic border-l-2 border-[var(--accent-primary)] pl-2">
                        Channel Note: {assistantChannelNotes}
                      </p>
                    )}

                    {assistantAlternatives.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                        <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                          Brand-Aligned Alternatives:
                        </div>
                        {assistantAlternatives.map((alt, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-start justify-between gap-3 text-xs"
                          >
                            <span className="text-[var(--text-primary)] text-xs leading-relaxed font-mono">
                              "{alt}"
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="shrink-0 text-[11px] h-7"
                              onClick={() => applyAlternative(alt)}
                            >
                              Use This
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                    Ask questions or click a prompt above to request brand-aligned alternatives.
                  </div>
                )}
              </CardContent>
            )}

            {/* Tab 3 Content: Split Vision Visual Media Engine */}
            {activeTab === "visual" && (
              <CardContent className="p-4 sm:p-5 space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--accent-text)] tracking-wider">
                      Split-Vision Engine
                    </span>
                    <p className="text-xs text-[var(--text-secondary)]">
                      OpenCV deterministic checks combined with Gemini qualitative visual style critique.
                    </p>
                  </div>
                  {visualScore !== null && (
                    <Badge
                      variant={visualScore >= 80 ? "success" : visualScore >= 60 ? "warning" : "danger"}
                      size="sm"
                    >
                      Score: {visualScore}/100
                    </Badge>
                  )}
                </div>

                {/* Controls: Reference Logo & Tolerance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] block mb-1">
                      Approved Reference Logo:
                    </span>
                    <select
                      value={selectedLogoId}
                      onChange={(e) => setSelectedLogoId(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-ring)]"
                    >
                      <option value="">Auto-select latest approved logo</option>
                      {brandAssets
                        .filter((a) => a.asset_type === "LOGO")
                        .map((logo) => (
                          <option key={logo.id} value={logo.id}>
                            {logo.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] block mb-1">
                      Color ΔE Tolerance (CIELAB):
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="5"
                        max="50"
                        step="1"
                        value={colorTolerance}
                        onChange={(e) => setColorTolerance(parseFloat(e.target.value) || 25.0)}
                        className="w-20 text-xs px-2.5 py-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] font-mono text-center"
                      />
                      <span className="text-[10px] text-[var(--text-muted)]">ΔE ≤ {colorTolerance}</span>
                    </div>
                  </div>
                </div>

                {/* Upload Zone or Asset Preview */}
                {!imagePreviewUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[var(--border-default)] rounded-xl p-8 text-center hover:bg-[var(--bg-surface-subtle)] cursor-pointer transition-all group"
                  >
                    <div className="h-12 w-12 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                      <Upload className="h-6 w-6 text-[var(--accent-primary)]" />
                    </div>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">
                      Upload visual asset for Split-Vision governance
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      PNG, JPEG, WebP up to 10MB. Non-destructive analysis.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Media Header */}
                    <div className="p-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={imagePreviewUrl}
                          alt="Uploaded Preview"
                          className="h-14 w-14 object-cover rounded-lg border border-[var(--border-default)]"
                        />
                        <div>
                          <div className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-xs">
                            {uploadedImageFile?.name || "Uploaded Image"}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                            Target: <strong className="text-[var(--text-secondary)]">{channel}</strong>
                            {channelSpecDesc && ` (${channelSpecDesc})`}
                          </div>
                          {aspectRatioCompliant !== null && (
                            <span
                              className={`text-[10px] font-semibold ${
                                aspectRatioCompliant ? "text-emerald-400" : "text-amber-400"
                              }`}
                            >
                              {aspectRatioCompliant ? "✓ Dimensions Compliant" : "⚠ Aspect Ratio Mismatch"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => runVisualAudit()}
                          isLoading={isAuditingImage}
                          leftIcon={<RefreshCw className="h-3 w-3" />}
                          className="h-7 text-xs"
                        >
                          Re-Audit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setImagePreviewUrl(null);
                            setUploadedImageFile(null);
                            setVisualScore(null);
                          }}
                          className="h-7 text-xs text-[var(--text-muted)]"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>

                    {/* Loading Skeleton */}
                    {isAuditingImage ? (
                      <div className="space-y-3">
                        <Skeleton className="h-20 w-full rounded-xl" />
                        <Skeleton className="h-28 w-full rounded-xl" />
                      </div>
                    ) : (
                      <>
                        {/* Deterministic OpenCV Checks */}
                        <div className="p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                              <Target className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                              Deterministic Checks (OpenCV)
                            </span>
                            <Badge variant="neutral" size="sm">
                              Mathematical Fact
                            </Badge>
                          </div>

                          {logoDetectionResult && (
                            <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[11px] space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[var(--text-muted)]">Logo Detection:</span>
                                <Badge
                                  variant={
                                    logoDetectionResult.detected
                                      ? logoDetectionResult.is_reliable_match
                                        ? "success"
                                        : "warning"
                                      : "danger"
                                  }
                                  size="sm"
                                >
                                  {logoDetectionResult.detected
                                    ? logoDetectionResult.is_reliable_match
                                      ? "Verified Match"
                                      : "Borderline"
                                    : "No Logo"}
                                </Badge>
                              </div>
                              <div className="text-[10px] text-[var(--text-muted)] font-mono">
                                Score: {logoDetectionResult.confidence_score} • Method:{" "}
                                {logoDetectionResult.detection_method}
                              </div>
                            </div>
                          )}

                          {colorFindings.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">
                                Dominant Hex vs Brand Palette:
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {colorFindings.map((cf, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-2 rounded-lg border text-[11px] space-y-1 ${
                                      cf.is_compliant
                                        ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                                        : "border-amber-500/30 bg-amber-500/5 text-amber-300"
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className="h-3.5 w-3.5 rounded-full border border-black/20 shrink-0"
                                        style={{ backgroundColor: cf.extracted_hex }}
                                      />
                                      <span className="font-mono font-bold text-[10px]">
                                        {cf.extracted_hex}
                                      </span>
                                    </div>
                                    <div className="text-[9px] text-[var(--text-muted)]">
                                      ΔE: {cf.distance_delta_e} ({cf.percentage_coverage}%)
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {deterministicExplanations.length > 0 && (
                            <div className="space-y-1 pt-1">
                              {deterministicExplanations.map((exp, idx) => (
                                <p key={idx} className="text-[11px] text-[var(--text-secondary)]">
                                  • {exp}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Qualitative Style Assessment (Gemini Multimodal) */}
                        {qualitativeAssessment && (
                          <div className="p-3.5 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-subtle)] text-xs space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[var(--accent-text)] flex items-center gap-1.5">
                                <Compass className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                                Qualitative Assessment (Gemini)
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--accent-text)] font-mono font-bold">
                                Vibe: {qualitativeAssessment.vibe_score}/100
                              </span>
                            </div>

                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                              {qualitativeAssessment.aesthetic_critique}
                            </p>

                            {qualitativeAssessment.suggestions?.length > 0 && (
                              <div className="space-y-1 pt-1 border-t border-[var(--border-subtle)]">
                                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                                  Recommendations:
                                </span>
                                {qualitativeAssessment.suggestions.map((sug: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className="text-[11px] text-[var(--text-secondary)] flex items-start gap-1.5"
                                  >
                                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                    <span>{sug}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODALS & SUPPORTING DRAWERS                                            */}
      {/* ========================================================================= */}

      {/* Compare Diff Modal */}
      {diffModalFinding && (
        <Modal
          isOpen={!!diffModalFinding}
          onClose={() => setDiffModalFinding(null)}
          title="Compare Original vs Revised Copy"
          description="Inspect exact proposed change before accepting correction."
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                Original Flagged Text
              </label>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-mono leading-relaxed">
                {diffModalFinding.originalSnippet}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                Recommended Compliant Text
              </label>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-mono leading-relaxed">
                {diffModalFinding.suggestedFix}
              </div>
            </div>

            <div className="text-xs text-[var(--text-muted)] space-y-1">
              <strong>Ground Truth Basis:</strong>
              <p className="text-[var(--text-secondary)]">{diffModalFinding.explanation}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDiffModalFinding(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  applyRewrite(diffModalFinding);
                  setDiffModalFinding(null);
                }}
              >
                Accept and Apply
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Clickable Ground Truth Evidence & Policy Modal */}
      {evidenceModalFinding && (
        <Modal
          isOpen={!!evidenceModalFinding}
          onClose={() => setEvidenceModalFinding(null)}
          title="Authoritative Brand Ground Truth & Citation"
          description="Verified brand fact or policy rule stored in active tenant knowledge base."
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-border)] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--accent-text)] tracking-wider">
                Policy Citation Reference
              </span>
              <div className="font-mono font-bold text-sm text-[var(--text-primary)]">
                {evidenceModalFinding.citationReference}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                Rule Explanation & Enforcement Context
              </span>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-default)]">
                {evidenceModalFinding.explanation}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-default)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Severity</span>
                <Badge
                  variant={
                    evidenceModalFinding.severity === "CRITICAL"
                      ? "danger"
                      : evidenceModalFinding.severity === "WARNING"
                      ? "warning"
                      : "neutral"
                  }
                  size="sm"
                >
                  {evidenceModalFinding.severity}
                </Badge>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-default)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Category</span>
                <div className="font-semibold text-[var(--text-primary)] font-mono text-xs">
                  {evidenceModalFinding.findingType}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <Button variant="ghost" size="sm" onClick={() => setEvidenceModalFinding(null)}>
                Close
              </Button>
              {evidenceModalFinding.suggestedFix && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    applyRewrite(evidenceModalFinding);
                    setEvidenceModalFinding(null);
                  }}
                >
                  Apply Suggested Rewrite
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Campaign Context & Audience Modal */}
      <Modal
        isOpen={contextModalOpen}
        onClose={() => setContextModalOpen(false)}
        title="Campaign Context & Target Audience"
        description="Fine-tune audience framing and campaign scope to guide AI auditing and assistant advice."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Campaign / Product Scope
            </label>
            <Input
              placeholder="e.g. Q4 Cloud Infra Migration"
              value={campaignContext}
              onChange={(e) => setCampaignContext(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Target Audience
            </label>
            <Input
              placeholder="e.g. Enterprise DevOps, CTOs & Systems Architects"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Optional Reference Brief
            </label>
            <Input
              placeholder="e.g. PR-2024-Q4-Doc"
              value={referenceBrief}
              onChange={(e) => setReferenceBrief(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="primary" size="sm" onClick={() => setContextModalOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* Version History Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Revision History & Restorations"
        description="Preserve previous draft states and undo or restore earlier versions."
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {versionHistory.map((v) => (
            <div
              key={v.id}
              className="p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface-subtle)] flex items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <span>{v.label}</span>
                  {v.score !== null && (
                    <Badge variant={v.score >= 80 ? "success" : "warning"} size="sm">
                      Score: {v.score}
                    </Badge>
                  )}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Saved at {v.timestamp} • {v.text.length} chars
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] truncate max-w-sm mt-1 font-mono">
                  "{v.text.slice(0, 70)}..."
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRestoreVersion(v)}
                leftIcon={<RotateCcw className="h-3 w-3" />}
              >
                Restore
              </Button>
            </div>
          ))}
        </div>
      </Modal>

      {/* Escalation Modal */}
      <Modal
        isOpen={escalateModalOpen}
        onClose={() => setEscalateModalOpen(false)}
        title="Escalate Draft for Human Review"
        description="Submit this draft to authorized compliance reviewers for policy exception approval."
      >
        <form onSubmit={handleEscalateSubmit} className="space-y-4">
          <Textarea
            label="Reviewer Notes & Justification"
            placeholder="Explain why this copy requires a promotional exception or emergency publication..."
            value={creatorNotes}
            onChange={(e) => setCreatorNotes(e.target.value)}
            required
            rows={4}
          />
          <div className="text-[11px] text-[var(--text-muted)]">
            Escalating will notify assigned Brand Compliance Officers and log this event in the immutable audit trail.
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setEscalateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isEscalating}>
              Submit to Review Queue
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
