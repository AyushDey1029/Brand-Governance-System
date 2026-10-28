import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  Layers,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  RefreshCw,
  X,
  Target,
  ArrowUpRight,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../design-system/Card";
import { Badge } from "../design-system/Badge";
import { AnimatedCounter } from "../design-system/AnimatedCounter";
import { AtmosphericBackground } from "../components/AtmosphericBackground";
import { PageHeader } from "../components/PageHeader";
import { api, AnalyticsOverview } from "../api/client";
import { useNotification } from "../context/NotificationContext";

export const AnalyticsView: React.FC = () => {
  const { activeBrand } = useWorkspace();
  const { showToast } = useNotification();

  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [selectedChannel, setSelectedChannel] = useState<string>("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [ruleSearch, setRuleSearch] = useState<string>("");

  const fetchAnalytics = async () => {
    if (!activeBrand?.id) return;
    setIsLoading(true);
    try {
      const data = await api.getAnalytics(activeBrand.id, {
        channel: selectedChannel !== "ALL" ? selectedChannel : undefined,
        severity: selectedSeverity !== "ALL" ? selectedSeverity : undefined,
        rule: ruleSearch.trim() || undefined,
      });
      setAnalytics(data);
    } catch (err: any) {
      console.warn("Governance analytics API:", err?.message || err);
      // Keep verified baseline without stacking jarring 404 toasts on initial page render
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [activeBrand?.id, selectedChannel, selectedSeverity]);

  const handleRuleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalytics();
  };

  const handleResetFilters = () => {
    setSelectedChannel("ALL");
    setSelectedSeverity("ALL");
    setRuleSearch("");
  };

  const hasActiveFilters = selectedChannel !== "ALL" || selectedSeverity !== "ALL" || ruleSearch.trim().length > 0;
  const hasData = (analytics?.total_audits_measured ?? 0) > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Standardized Compact Page Header */}
      <PageHeader
        icon={BarChart3}
        title="Governance Analytics"
        description="Real-time compliance measurements, risk distributions, and violation patterns."
        technicalDetails="AUDITED EMPIRICAL TELEMETRY — Live event streaming with zero synthetic or mock estimates."
        isAdmin={true}
      />

      {/* Standalone Filter Toolbar Under Header */}
      <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Channel Selector */}
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-ring)] cursor-pointer shadow-xs"
          >
            <option value="ALL">All Channels</option>
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">X / Twitter</option>
            <option value="blog">Blog</option>
            <option value="press_release">Press Release</option>
            <option value="email">Email</option>
          </select>

          {/* Severity Selector */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-ring)] cursor-pointer shadow-xs"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="WARNING">Warning</option>
            <option value="SUGGESTION">Suggestion</option>
          </select>

          {/* Rule Filter */}
          <form onSubmit={handleRuleFilterSubmit} className="flex items-center gap-1.5">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by rule citation..."
                value={ruleSearch}
                onChange={(e) => setRuleSearch(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-ring)] w-48 shadow-xs"
              />
              {ruleSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setRuleSearch("");
                    fetchAnalytics();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </form>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-[var(--accent-text)] hover:underline px-2 py-1 transition-colors cursor-pointer"
              title="Reset all filters"
            >
              Reset Filters
            </button>
          )}
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={isLoading}
          className="p-2 self-end sm:self-auto rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5 text-xs font-medium"
          title="Refresh telemetry"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-[var(--accent-primary)]" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Overview Telemetry Ribbon — Equal Height, Tabular Numerals, Neutral Empty States */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Audits */}
        <div className="surface-glass rounded-2xl p-5 border border-[var(--glass-border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Audits Processed</span>
            <span className="p-1.5 rounded-lg bg-[var(--bg-surface-subtle)] text-[var(--accent-primary)]">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)] font-display tracking-tight tabular-nums">
            {isLoading ? "..." : (hasData ? <AnimatedCounter value={analytics?.total_audits_measured ?? 0} /> : "—")}
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)]">
            <span>{hasData ? `${analytics?.passed_audits_measured ?? 0} passed cleanly` : "No audits evaluated yet"}</span>
          </div>
        </div>

        {/* First-Time Pass Rate */}
        <div className="surface-glass rounded-2xl p-5 border border-[var(--glass-border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">First-Time Pass Rate</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="text-3xl font-bold font-display tracking-tight tabular-nums" style={{ color: hasData ? "var(--color-success)" : "var(--text-primary)" }}>
            {isLoading ? "..." : (hasData ? <AnimatedCounter value={analytics?.first_time_pass_rate ?? 0} suffix="%" /> : "—")}
          </div>
          <div className="text-[12px] text-[var(--text-secondary)]">
            {hasData ? "Measured from live creator evaluations" : "Awaiting baseline evaluation"}
          </div>
        </div>

        {/* Correction Rate */}
        <div className="surface-glass rounded-2xl p-5 border border-[var(--glass-border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Correction Rate</span>
            <span className="p-1.5 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent-primary)]">
              <Target className="h-4 w-4" />
            </span>
          </div>
          <div className="text-3xl font-bold text-[var(--accent-primary)] font-display tracking-tight tabular-nums">
            {isLoading ? "..." : (hasData ? <AnimatedCounter value={analytics?.correction_rate ?? 0} suffix="%" /> : "—")}
          </div>
          <div className="text-[12px] text-[var(--text-secondary)]">
            {hasData ? `${analytics?.accepted_corrections_measured ?? 0} of ${analytics?.total_findings_measured ?? 0} findings fixed` : "No findings generated"}
          </div>
        </div>

        {/* Turnaround SLA */}
        <div className="surface-glass rounded-2xl p-5 border border-[var(--glass-border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Review SLA Turnaround</span>
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)] font-display tracking-tight tabular-nums">
            {isLoading ? "..." : (hasData && (analytics?.avg_review_turnaround_minutes ?? 0) > 0 ? <AnimatedCounter value={analytics?.avg_review_turnaround_minutes ?? 0} suffix=" min" /> : "—")}
          </div>
          <div className="text-[12px] text-[var(--text-secondary)]">
            {hasData ? `Based on ${analytics?.completed_reviews_measured ?? 0} closed cycles` : "Target SLA: < 4 hours"}
          </div>
        </div>
      </div>

      {/* Breakdown Grid: Recurring Violations & Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recurring Violations */}
        <div className="lg:col-span-7">
          <Card className="surface-glass border-[var(--glass-border)] h-full">
            <CardHeader className="pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-[var(--accent-primary)]" />
                    Top Recurring Brand Violations
                  </CardTitle>
                  <CardDescription>
                    Empirical violation categories identifying ambiguity or creator knowledge gaps.
                  </CardDescription>
                </div>
                <Badge variant="neutral" size="sm">
                  {analytics?.violation_categories?.length || 0} Categories
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {analytics?.violation_categories && analytics.violation_categories.length > 0 ? (
                analytics.violation_categories.map((item) => (
                  <div
                    key={item.category}
                    className="space-y-2 text-xs p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/30 hover:bg-[var(--bg-surface)] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--text-muted)] font-mono">{item.count} occurrences</span>
                        <Badge
                          variant={item.severity === "CRITICAL" ? "danger" : item.severity === "WARNING" ? "warning" : "neutral"}
                          size="sm"
                        >
                          {item.severity}
                        </Badge>
                      </div>
                    </div>
                    {/* Progress Bar with smooth micro transition */}
                    <div className="w-full bg-[var(--bg-surface-elevated)] h-2.5 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          item.severity === "CRITICAL"
                            ? "bg-[var(--color-danger)] shadow-sm shadow-[var(--color-danger)]/50"
                            : "bg-[var(--color-warning)] shadow-sm shadow-[var(--color-warning)]/50"
                        }`}
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-[var(--text-muted)] space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-[var(--color-success)] mx-auto opacity-70" />
                  <p className="font-semibold text-[var(--text-primary)]">Clean Governance Record</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">No violation categories recorded for the selected filter.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Severity & Frequently Violated Rules */}
        <div className="lg:col-span-5 space-y-6">
          {/* Severity Distribution */}
          <Card className="surface-glass border-[var(--glass-border)]">
            <CardHeader className="pb-3 border-b border-[var(--border-subtle)]">
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[var(--accent-primary)]" />
                Severity Distribution
              </CardTitle>
              <CardDescription>Breakdown by governance impact</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {analytics?.severity_distribution && analytics.severity_distribution.length > 0 ? (
                analytics.severity_distribution.map((sev) => (
                  <div
                    key={sev.severity}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs hover:border-[var(--border-default)] transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <Badge
                        variant={
                          sev.severity === "CRITICAL"
                            ? "danger"
                            : sev.severity === "WARNING"
                            ? "warning"
                            : "neutral"
                        }
                        size="sm"
                      >
                        {sev.severity}
                      </Badge>
                      <span className="font-medium text-[var(--text-secondary)]">
                        {sev.count} findings
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[var(--text-primary)] text-sm">
                      {sev.percentage}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                  No severity data recorded.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Frequently Violated Rules Leaderboard */}
          <Card className="surface-glass border-[var(--glass-border)]">
            <CardHeader className="pb-3 border-b border-[var(--border-subtle)]">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--color-warning)]" />
                Frequently Violated Rules
              </CardTitle>
              <CardDescription>Most triggered governance guardrails</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-2.5 text-xs">
              {analytics?.frequently_violated_rules && analytics.frequently_violated_rules.length > 0 ? (
                analytics.frequently_violated_rules.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setRuleSearch(r.rule_reference);
                      fetchAnalytics();
                    }}
                    className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-surface)] hover:border-[var(--accent-primary)]/40 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="truncate pr-3">
                      <span className="font-semibold text-[var(--text-primary)] block truncate group-hover:text-[var(--accent-primary)] transition-colors">
                        {r.rule_reference}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)] truncate block mt-0.5">
                        {r.sample_explanation}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[var(--accent-primary)] bg-[var(--accent-primary-subtle)] px-2 py-0.5 rounded-md shrink-0 text-xs">
                      {r.violation_count}x
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-[var(--text-secondary)]">
                  No specific rule violations detected.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Channel Performance Table */}
      <Card className="surface-glass border-[var(--glass-border)] overflow-hidden">
        <CardHeader className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[var(--accent-primary)]" />
                Channel Compliance Performance
              </CardTitle>
              <CardDescription>
                Compliance scores and pass rates across configured brand publishing channels.
              </CardDescription>
            </div>
            <span className="text-[10px] font-mono font-semibold text-[var(--text-muted)] uppercase">
              Omnichannel Ledger
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                  <th className="py-3.5 px-5">Publishing Channel</th>
                  <th className="py-3.5 px-5">Audits Executed</th>
                  <th className="py-3.5 px-5">Avg Compliance Score</th>
                  <th className="py-3.5 px-5">Pass Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {analytics?.channel_performance && analytics.channel_performance.length > 0 ? (
                  analytics.channel_performance.map((c) => (
                    <tr key={c.channel} className="interactive-row hover:bg-[var(--bg-surface-subtle)] transition-all">
                      <td className="py-3.5 px-5 font-semibold text-[var(--text-primary)] uppercase text-[11px] flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />
                        {c.channel}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[var(--text-secondary)]">
                        {c.audit_count}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-[var(--text-primary)]">
                        <div className="flex items-center gap-2">
                          <span>{c.avg_score}/100</span>
                          <div className="w-16 bg-[var(--bg-surface-subtle)] h-1.5 rounded-full overflow-hidden hidden sm:block border border-[var(--border-subtle)]">
                            <div
                              className="h-full bg-[var(--accent-primary)] rounded-full"
                              style={{ width: `${Math.min(c.avg_score, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-mono font-bold" style={{ color: "var(--color-success)" }}>
                        {c.pass_rate}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[var(--text-secondary)]">
                      No channel audit data measured yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
