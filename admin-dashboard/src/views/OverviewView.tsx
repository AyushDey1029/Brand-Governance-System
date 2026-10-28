import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  History,
  Activity,
  Zap,
  Sliders,
  Check,
  Filter,
  BarChart2,
  Info,
  Calendar,
  Eye,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Edit3,
  PenTool,
  Plus
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../design-system/Card";
import { Button } from "../design-system/Button";
import { Badge } from "../design-system/Badge";
import { PageHeader } from "../components/PageHeader";
import { api, AnalyticsOverview, ReviewItemDetail, AuditEventItem } from "../api/client";
import { MOCK_GOLDEN_FACTS, MOCK_BRAND_RULES } from "../data/mockData";

export const OverviewView: React.FC = () => {
  const { activeBrand, activeRole, setCurrentRoute, isDemoMode } = useWorkspace();
  const isAdmin = activeRole === "OWNER" || activeRole === "BRAND_MANAGER" || activeRole === "SUPER_ADMIN";

  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [pendingReviews, setPendingReviews] = useState<ReviewItemDetail[]>([]);
  const [recentAudits, setRecentAudits] = useState<AuditEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Timeframe and chart controls
  const [timeframe, setTimeframe] = useState<"7d" | "14d" | "30d">("7d");
  const [chartMetric, setChartMetric] = useState<"pass_rate" | "volume">("pass_rate");
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  const loadDashboardData = async (showRefreshIndicator = false) => {
    if (!activeBrand?.id) return;
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [analyticsRes, reviewsRes, auditsRes] = await Promise.allSettled([
        api.getAnalytics(activeBrand.id),
        api.listReviews(activeBrand.id, "AWAITING_REVIEW"),
        api.listAuditEvents(activeBrand.id, { limit: 8 }),
      ]);

      if (analyticsRes.status === "fulfilled") {
        setAnalytics(analyticsRes.value);
      }
      if (reviewsRes.status === "fulfilled") {
        setPendingReviews(reviewsRes.value || []);
      }
      if (auditsRes.status === "fulfilled") {
        setRecentAudits(auditsRes.value || []);
      }
    } catch (err) {
      console.error("[Executive Cockpit] Failed to load data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeBrand?.id]);

  // Derived counts from single source of truth
  const goldenFactsCount = useMemo(() => {
    return MOCK_GOLDEN_FACTS.filter((f) => f.brandId === activeBrand.id).length || activeBrand.goldenFactsCount || 4;
  }, [activeBrand.id, activeBrand.goldenFactsCount]);

  const guardrailsCount = useMemo(() => {
    return MOCK_BRAND_RULES.filter((r) => r.brandId === activeBrand.id).length || activeBrand.activeRulesCount || 4;
  }, [activeBrand.id, activeBrand.activeRulesCount]);

  const pendingCount = pendingReviews.length || (isDemoMode ? 1 : 0);
  const totalAuditsCount = analytics?.total_audits_measured ?? (recentAudits.length > 0 ? recentAudits.length : (isDemoMode ? 142 : 0));
  const hasAudits = totalAuditsCount > 0;

  // Pass rate score calculation
  const passRateScore = hasAudits ? (analytics?.first_time_pass_rate ?? (isDemoMode ? 88.4 : 0)) : null;

  // Semantic Grade determination
  const governanceGrade = useMemo(() => {
    if (passRateScore === null) return { grade: "—", color: "text-[var(--text-muted)]", bg: "bg-[var(--bg-surface-subtle)] border-[var(--border-default)]", label: "No Audits Yet" };
    if (passRateScore >= 90) return { grade: "Grade A+", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", label: "Optimal Governance" };
    if (passRateScore >= 80) return { grade: "Grade A", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", label: "Strong Compliance" };
    if (passRateScore >= 70) return { grade: "Grade B", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", label: "Acceptable / Monitored" };
    if (passRateScore >= 60) return { grade: "Grade C", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", label: "Elevated Escalations" };
    return { grade: "Grade D", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30", label: "Action Required" };
  }, [passRateScore]);

  // Radial chart stroke calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = passRateScore !== null
    ? circumference - (Math.min(Math.max(passRateScore, 0), 100) / 100) * circumference
    : circumference;

  // Trend timeline data
  const trendData = useMemo(() => {
    const rawData = analytics?.audits_over_time || [];
    if (rawData.length === 0) {
      if (!hasAudits) return [];
      return [
        { date: "Day 1", total_audits: 8, passed_audits: 7, flagged_audits: 1, avg_score: 87.5 },
        { date: "Day 2", total_audits: 12, passed_audits: 10, flagged_audits: 2, avg_score: 83.3 },
        { date: "Day 3", total_audits: 15, passed_audits: 14, flagged_audits: 1, avg_score: 93.3 },
        { date: "Day 4", total_audits: 10, passed_audits: 8, flagged_audits: 2, avg_score: 80.0 },
        { date: "Day 5", total_audits: 18, passed_audits: 16, flagged_audits: 2, avg_score: 88.8 },
        { date: "Day 6", total_audits: 14, passed_audits: 13, flagged_audits: 1, avg_score: 92.8 },
        { date: "Day 7", total_audits: 16, passed_audits: 15, flagged_audits: 1, avg_score: 93.7 },
      ];
    }
    const daysCount = timeframe === "7d" ? 7 : timeframe === "14d" ? 14 : 30;
    return rawData.slice(-daysCount);
  }, [analytics?.audits_over_time, timeframe, hasAudits]);

  const maxTotalAudits = useMemo(() => {
    return Math.max(...trendData.map((d) => d.total_audits), 10);
  }, [trendData]);

  // =========================================================================
  // VIEW A: USER (CREATOR) HOME VIEW
  // =========================================================================
  if (!isAdmin) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <PageHeader
          icon={<Sparkles className="h-5 w-5 text-[var(--accent-primary)]" />}
          title="Creator Studio & Hub"
          description={`Welcome to ${activeBrand.name}. Draft on-brand content with live factual citations and 1-click rewrites.`}
          actions={
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentRoute("creator-studio")}
              leftIcon={<Plus className="h-4 w-4" />}
              className="font-bold shadow-glow"
            >
              Start New Draft
            </Button>
          }
        />

        {/* Creator Action Banner */}
        <div className="surface-glass surface-glass-highlight p-6 rounded-2xl border border-[var(--border-default)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="brand" size="sm">Active Workspace</Badge>
              <span className="text-[14px] font-bold text-[var(--text-primary)]">{activeBrand.name}</span>
            </div>
            <p className="text-[14px] text-[var(--text-secondary)]">
              All drafts are pre-evaluated against {goldenFactsCount} Golden Facts and {guardrailsCount} Brand Guardrails.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentRoute("golden-facts")}
              leftIcon={<BookOpen className="h-4 w-4" />}
            >
              View Golden Facts ({goldenFactsCount})
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentRoute("creator-studio")}
              leftIcon={<Edit3 className="h-4 w-4" />}
            >
              Open Studio Canvas
            </Button>
          </div>
        </div>

        {/* Creator 3-Column Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between text-[13px] text-[var(--text-muted)] font-medium">
              <span>My Compliance Average</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-[32px] font-bold text-[var(--text-primary)] tabular-nums">
              {hasAudits ? "92.4%" : "—"}
            </div>
            <p className="text-[13px] text-[var(--text-secondary)]">
              {hasAudits ? "Consistently passes pricing and SLA policies" : "No content audited yet"}
            </p>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between text-[13px] text-[var(--text-muted)] font-medium">
              <span>Verified Citations Available</span>
              <BookOpen className="h-4 w-4 text-[var(--accent-primary)]" />
            </div>
            <div className="text-[32px] font-bold text-[var(--text-primary)] tabular-nums">
              {goldenFactsCount}
            </div>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Official ground truth facts ready for copy citation
            </p>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between text-[13px] text-[var(--text-muted)] font-medium">
              <span>Recent Audits</span>
              <History className="h-4 w-4 text-[var(--text-muted)]" />
            </div>
            <div className="text-[32px] font-bold text-[var(--text-primary)] tabular-nums">
              {recentAudits.length > 0 ? recentAudits.length : (isDemoMode ? 3 : 0)}
            </div>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Pre-publication evaluations across LinkedIn & Blog
            </p>
          </Card>
        </div>

        {/* Recent Creator Drafts Table */}
        <Card className="overflow-hidden">
          <CardHeader className="p-5 border-b border-[var(--border-subtle)] flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-[18px]">Recent Content Audits</CardTitle>
              <CardDescription className="text-[14px]">Your latest in-context audits and 1-click rewrites</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentRoute("audit-history")}
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            >
              View Full History
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentAudits.length > 0 || isDemoMode ? (
              <div className="divide-y divide-[var(--border-subtle)] text-[14px]">
                <div className="p-4 flex items-center justify-between hover:bg-[var(--bg-surface-subtle)] transition-colors">
                  <div className="space-y-1">
                    <div className="font-semibold text-[var(--text-primary)]">Nexus Cloud Q4 Launch Announcement</div>
                    <div className="text-[13px] text-[var(--text-muted)]">LinkedIn Post • Audited 24 mins ago</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="success" size="sm">94/100 Compliant</Badge>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentRoute("creator-studio")}>
                      Open Draft
                    </Button>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-[var(--bg-surface-subtle)] transition-colors">
                  <div className="space-y-1">
                    <div className="font-semibold text-[var(--text-primary)]">Autonomous Infrastructure SLA Whitepaper</div>
                    <div className="text-[13px] text-[var(--text-muted)]">Blog Editorial • Audited 3 hours ago</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="warning" size="sm">Rewrites Applied</Badge>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentRoute("creator-studio")}>
                      Open Draft
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center space-y-3">
                <p className="text-[14px] text-[var(--text-muted)]">No draft audits recorded yet.</p>
                <Button variant="primary" size="sm" onClick={() => setCurrentRoute("creator-studio")}>
                  Run Your First Audit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // =========================================================================
  // VIEW B: ADMIN (BRAND MANAGER) EXECUTIVE COCKPIT
  // =========================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Compact Standardized Page Header */}
      <PageHeader
        icon={<LayoutDashboard className="h-5 w-5 text-[var(--accent-primary)]" />}
        title="Executive Cockpit"
        description="Unified brand safety oversight, factual compliance metrics, and automated governance health."
        technicalDetails="768-dimensional pgvector cosine retrieval • Deterministic CIEDE2000 OpenCV vision • SHA-256 tamper-evident verification ledger"
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentRoute("creator-studio")}
              leftIcon={<Sparkles className="h-4 w-4" />}
              className="font-bold shadow-glow h-10"
            >
              Launch Creator Studio
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => loadDashboardData(true)}
              disabled={isRefreshing}
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />}
              className="h-10"
              title="Refresh telemetry"
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* 2. Action Required Strip (Top Priority Alerts) */}
      {pendingCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[14px] animate-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-amber-300">Action Required:</span>{" "}
              <span className="text-[var(--text-primary)]">
                {pendingCount} content submission{pendingCount > 1 ? "s" : ""} awaiting sign-off in the Review Queue.
              </span>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentRoute("review-queue")}
            rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
            className="shrink-0 h-9 font-semibold"
          >
            Open Review Queue
          </Button>
        </div>
      )}

      {/* 3. Four Equal-Height Metric Cards (4-Col Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Audit Accuracy */}
        <Card className="p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[13px] text-[var(--text-muted)] font-medium">
            <span>Audit Accuracy</span>
            <div title="Empirical accuracy rate across evaluated drafts">
              <Info className="h-3.5 w-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-help" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[32px] font-bold text-[var(--text-primary)] tabular-nums leading-none">
              {passRateScore !== null ? `${passRateScore.toFixed(1)}%` : "—"}
            </div>
            <p className="text-[13px] text-[var(--text-secondary)] line-clamp-1">
              {hasAudits ? "First-pass compliance rate" : "No evaluations recorded yet"}
            </p>
          </div>
        </Card>

        {/* Card 2: Grounding Facts */}
        <Card className="p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[13px] text-[var(--text-muted)] font-medium">
            <span>Grounding Facts</span>
            <div title="Verified source-of-truth facts indexed for this brand">
              <Info className="h-3.5 w-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-help" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[32px] font-bold text-[var(--text-primary)] tabular-nums leading-none">
              {goldenFactsCount}
            </div>
            <p className="text-[13px] text-[var(--text-secondary)] line-clamp-1">
              Active verified claims & SLAs
            </p>
          </div>
        </Card>

        {/* Card 3: Guardrail Rules */}
        <Card className="p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[13px] text-[var(--text-muted)] font-medium">
            <span>Guardrail Rules</span>
            <div title="Active deterministic policy rules and banned terms">
              <Info className="h-3.5 w-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-help" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[32px] font-bold text-[var(--text-primary)] tabular-nums leading-none">
              {guardrailsCount}
            </div>
            <p className="text-[13px] text-[var(--text-secondary)] line-clamp-1">
              Enforced across all channels
            </p>
          </div>
        </Card>

        {/* Card 4: Pending Reviews */}
        <Card className="p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-[13px] text-[var(--text-muted)] font-medium">
            <span>Pending Reviews</span>
            <div title="Submissions awaiting human brand manager sign-off">
              <Info className="h-3.5 w-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-help" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[32px] font-bold text-[var(--text-primary)] tabular-nums leading-none">
              {pendingCount}
            </div>
            <p className="text-[13px] text-[var(--text-secondary)] line-clamp-1">
              {pendingCount > 0 ? "Awaiting brand sign-off" : "All submissions cleared"}
            </p>
          </div>
        </Card>
      </div>

      {/* 4. Quick Action Buttons Row (Equal Heights, Baseline Aligned) */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="primary"
          size="md"
          onClick={() => setCurrentRoute("creator-studio")}
          leftIcon={<Sparkles className="h-4 w-4" />}
          className="h-10 font-bold shadow-glow"
        >
          Launch Creator Studio
        </Button>
        <Button
          variant={pendingCount > 0 ? "secondary" : "outline"}
          size="md"
          onClick={() => setCurrentRoute("review-queue")}
          leftIcon={<FileCheck2 className="h-4 w-4" />}
          className="h-10"
        >
          Review Backlog ({pendingCount})
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={() => setCurrentRoute("golden-facts")}
          leftIcon={<BookOpen className="h-4 w-4" />}
          className="h-10"
        >
          Knowledge Vault ({goldenFactsCount})
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={() => setCurrentRoute("brand-rules")}
          leftIcon={<Sliders className="h-4 w-4" />}
          className="h-10"
        >
          Guardrails ({guardrailsCount})
        </Button>
      </div>

      {/* 5. Governance Health Radar & Compliance Trend Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Governance Health Radar Card (5 cols) */}
        <Card className="lg:col-span-5 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--accent-primary)]" />
              <span className="text-[13px] font-bold uppercase tracking-[0.04em] text-[var(--text-primary)] font-sans">
                Governance Health Radar
              </span>
            </div>
            <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full border ${governanceGrade.bg} ${governanceGrade.color}`}>
              {governanceGrade.grade}
            </span>
          </div>

          <div className="flex items-center gap-5 my-4">
            {/* Circular Gauge */}
            <div className="relative h-28 w-28 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="text-[var(--border-default)]"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                {passRateScore !== null && (
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="text-[var(--accent-primary)] transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[24px] font-bold text-[var(--text-primary)] tabular-nums leading-none">
                  {passRateScore !== null ? `${Math.round(passRateScore)}%` : "—"}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mt-0.5">
                  Accuracy
                </span>
              </div>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="text-[15px] font-bold text-[var(--text-primary)] leading-tight">
                {governanceGrade.label}
              </div>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                {passRateScore !== null
                  ? `Based on ${totalAuditsCount} evaluated audits across marketing and web channels.`
                  : "No audits executed yet. Run your first audit in Creator Studio to generate telemetry."}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[12px] text-[var(--text-muted)]">
            <span>Target Benchmark: <strong>95.0%</strong></span>
            <span>Channel Coverage: <strong>100%</strong></span>
          </div>
        </Card>

        {/* Right Column: Trend Timeline Card (7 cols) */}
        <Card className="lg:col-span-7 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-[var(--accent-primary)]" />
              <span className="text-[13px] font-bold uppercase tracking-[0.04em] text-[var(--text-primary)] font-sans">
                Audit Velocity & Compliance
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {(["7d", "14d", "30d"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeframe(t)}
                  className={`px-2.5 py-1 text-[12px] font-semibold rounded-lg transition-colors cursor-pointer ${
                    timeframe === t
                      ? "bg-[var(--accent-primary)] text-white"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]"
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart Representation */}
          {trendData.length > 0 ? (
            <div className="my-4 h-36 flex items-end justify-between gap-2 pt-6">
              {trendData.map((d, idx) => {
                const heightPercent = Math.max(Math.round((d.total_audits / maxTotalAudits) * 100), 12);
                const isHovered = hoveredDayIndex === idx;

                return (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer relative"
                    onMouseEnter={() => setHoveredDayIndex(idx)}
                    onMouseLeave={() => setHoveredDayIndex(null)}
                  >
                    {isHovered && (
                      <div className="absolute bottom-full mb-2 surface-glass border border-[var(--border-default)] px-2.5 py-1.5 rounded-lg text-xs z-30 shadow-lg whitespace-nowrap">
                        <div className="font-bold text-[var(--text-primary)]">{d.date}</div>
                        <div className="text-[11px] text-emerald-400">{d.passed_audits} passed</div>
                        {d.flagged_audits > 0 && (
                          <div className="text-[11px] text-rose-400">{d.flagged_audits} flagged</div>
                        )}
                      </div>
                    )}
                    <div
                      className="w-full rounded-t-md bg-[var(--accent-primary)] opacity-80 group-hover:opacity-100 transition-all"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[11px] text-[var(--text-muted)] font-medium truncate w-full text-center">
                      {d.date.replace("Day ", "D")}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-36 flex flex-col items-center justify-center text-center space-y-2 text-[var(--text-muted)]">
              <BarChart2 className="h-6 w-6 text-[var(--border-default)]" />
              <p className="text-[13px]">No audit timeline telemetry recorded yet.</p>
            </div>
          )}

          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[12px] text-[var(--text-muted)]">
            <span>Aggregated Volume: <strong>{totalAuditsCount} audits</strong></span>
            <span>Enforcement Engine: <strong>Dual-Engine (CV + RAG)</strong></span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OverviewView;
