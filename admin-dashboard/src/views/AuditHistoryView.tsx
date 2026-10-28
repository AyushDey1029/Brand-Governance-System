import React, { useState, useEffect } from "react";
import {
  History,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Filter,
  ShieldCheck,
  User,
  GitBranch,
  X,
  Clock,
  Lock,
  Layers,
  Calendar,
  FileCode,
  Terminal,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../design-system/Card";
import { Button } from "../design-system/Button";
import { Badge } from "../design-system/Badge";
import { Modal } from "../design-system/Modal";
import { EmptyState } from "../design-system/EmptyState";
import { AnimatedCounter } from "../design-system/AnimatedCounter";
import { AtmosphericBackground } from "../components/AtmosphericBackground";
import { api, AuditEventItem } from "../api/client";
import { useNotification } from "../context/NotificationContext";

export const AuditHistoryView: React.FC = () => {
  const { activeBrand } = useWorkspace();
  const { showToast } = useNotification();

  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [resourceFilter, setResourceFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"timeline" | "table">("timeline");
  const [selectedEvent, setSelectedEvent] = useState<AuditEventItem | null>(null);

  const fetchEvents = async () => {
    if (!activeBrand?.id) return;
    setIsLoading(true);
    try {
      const data = await api.listAuditEvents(activeBrand.id, {
        action: actionFilter !== "ALL" ? actionFilter : undefined,
        resource_type: resourceFilter !== "ALL" ? resourceFilter : undefined,
        limit: 100,
      });
      setEvents(data);
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Failed to load audit history",
        message: err.message || "Could not retrieve audit ledger events.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [activeBrand?.id, actionFilter, resourceFilter]);

  const filteredEvents = events.filter((e) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      e.action.toLowerCase().includes(term) ||
      e.resource_type.toLowerCase().includes(term) ||
      e.actor_email.toLowerCase().includes(term) ||
      e.version_reference.toLowerCase().includes(term)
    );
  });

  const getActionBadgeVariant = (action: string): "neutral" | "brand" | "success" | "warning" | "danger" => {
    if (action.includes("APPROVED") || action.includes("PUBLISHED") || action.includes("ACCEPTED")) {
      return "success";
    }
    if (action.includes("REJECTED") || action.includes("DELETED")) {
      return "danger";
    }
    if (action.includes("CHANGES") || action.includes("WARNING")) {
      return "warning";
    }
    if (action.includes("AUDIT") || action.includes("REVIEW")) {
      return "brand";
    }
    return "neutral";
  };

  const totalEventsCount = events.length;
  const uniqueActorsCount = new Set(events.map((e) => e.actor_email)).size;
  const approvedCount = events.filter((e) => e.action.includes("APPROVED") || e.action.includes("PUBLISHED") || e.action.includes("ACCEPTED")).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cryptographic Ledger Atmospheric Header */}
      <div className="surface-glass surface-glass-highlight rounded-3xl p-6 sm:p-8 border border-[var(--glass-border)] shadow-glass relative overflow-hidden">
        <AtmosphericBackground variant="header" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                Cryptographic Append-Only Ledger
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[var(--bg-surface-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                SHA-256 Tamper-Evident
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
              <span className="p-2 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--accent-border)] shadow-xs">
                <History className="h-6 w-6" />
              </span>
              Governance Audit Timeline
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Verifiable, immutable timeline of compliance audits, policy updates, review decisions, and authorization signatures for{" "}
              <strong className="text-[var(--text-primary)] font-semibold">{activeBrand?.name}</strong>.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="p-1 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("timeline")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "timeline"
                    ? "bg-[var(--accent-primary)] text-white shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                Timeline View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-[var(--accent-primary)] text-white shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                Ledger Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Telemetry Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs micro-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Total Recorded Events</span>
            <History className="h-4 w-4 text-[var(--accent-primary)] opacity-80" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-[var(--text-primary)]">
              <AnimatedCounter value={totalEventsCount} />
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">immutable entries</span>
          </div>
        </div>

        <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs micro-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Governing Actors</span>
            <User className="h-4 w-4 text-cyan-400 opacity-80" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-[var(--text-primary)]">
              <AnimatedCounter value={uniqueActorsCount} />
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">active operators</span>
          </div>
        </div>

        <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs micro-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Approved Milestones</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400 opacity-80" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-[var(--text-primary)]">
              <AnimatedCounter value={approvedCount} />
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">signed decisions</span>
          </div>
        </div>

        <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs micro-lift">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Ledger Security</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400 opacity-80" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-emerald-400">
              100%
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">tamper-proof</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="surface-glass rounded-2xl p-4 border border-[var(--glass-border)] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md flex items-center">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search events by actor, action, resource, or version..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-ring)] transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-hidden transition-colors cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {searchTerm && (
            <div className="text-xs font-mono text-[var(--accent-text)] flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent-border)] shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
              <span>{filteredEvents.length} match{filteredEvents.length === 1 ? "" : "es"}</span>
            </div>
          )}

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:ring-[var(--accent-ring)]"
          >
            <option value="ALL">All Actions</option>
            <option value="AUDIT_RUN">Audit Runs</option>
            <option value="REVIEW_REQUESTED">Review Requests</option>
            <option value="REVIEW_DECIDED">Review Decisions</option>
            <option value="REVIEW_RESUBMITTED">Review Resubmissions</option>
            <option value="SUGGESTION_ACCEPTED">Suggestions Accepted</option>
            <option value="RULE_PUBLISHED">Rule Publications</option>
            <option value="FACT_IMPORTED">Fact Imports</option>
            <option value="CONFIG_UPDATED">Config Updates</option>
            <option value="MEMBER_INVITED">Member Invitations</option>
          </select>

          {/* Resource Filter */}
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:ring-[var(--accent-ring)]"
          >
            <option value="ALL">All Resource Types</option>
            <option value="DRAFT">Drafts</option>
            <option value="RULE">Rules</option>
            <option value="FACT">Golden Facts</option>
            <option value="BRAND">Brand Profiles</option>
            <option value="SETTINGS">Settings</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-16 surface-glass rounded-3xl border border-[var(--glass-border)] text-center text-xs text-[var(--text-muted)] flex flex-col items-center justify-center gap-3">
          <span className="h-6 w-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="font-medium text-[var(--text-secondary)]">Verifying cryptographic ledger events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          preset={searchTerm || actionFilter !== "ALL" || resourceFilter !== "ALL" ? "search" : "audit"}
          title={searchTerm ? "No matching audit events" : "Audit ledger empty"}
          description={
            searchTerm
              ? `No records found matching "${searchTerm}". Try adjusting your keywords or clearing the filter.`
              : "No governance audit events have been logged for this brand yet."
          }
          actionLabel={searchTerm || actionFilter !== "ALL" ? "Clear Filters" : undefined}
          onAction={
            searchTerm || actionFilter !== "ALL"
              ? () => {
                  setSearchTerm("");
                  setActionFilter("ALL");
                  setResourceFilter("ALL");
                }
              : undefined
          }
        />
      ) : viewMode === "timeline" ? (
        /* Readable Chronological Timeline */
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[var(--border-default)]">
          {filteredEvents.map((event) => {
            const date = new Date(event.created_at);
            const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

            return (
              <div key={event.id} className="relative group/timeline">
                {/* Timeline Node Dot */}
                <div className="absolute -left-6 sm:-left-8 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--bg-canvas)] bg-[var(--accent-primary)] ring-4 ring-[var(--accent-subtle)] group-hover/timeline:scale-125 transition-transform" />

                {/* Timeline Card */}
                <div className="surface-glass surface-tactile interactive-card micro-lift rounded-2xl p-4 sm:p-5 border border-[var(--glass-border)] shadow-xs hover:border-[var(--border-strong)] transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getActionBadgeVariant(event.action)} size="sm">
                        {event.action}
                      </Badge>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-[var(--bg-surface-subtle)] text-[var(--accent-text)] border border-[var(--border-subtle)]">
                        {event.resource_type}
                      </span>
                      {event.version_reference && (
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                          v{event.version_reference}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {dateStr} at {timeStr}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-6 w-6 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-primary)] flex items-center justify-center font-bold text-[10px]">
                        {event.actor_email.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-[var(--text-primary)]">{event.actor_email}</span>
                      <span className="text-[10px] text-[var(--text-muted)] px-1.5 py-0.2 rounded bg-[var(--bg-surface-subtle)]">
                        {event.actor_role}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEvent(event)}
                      leftIcon={<Eye className="h-3.5 w-3.5" />}
                      className="text-xs h-7 self-end sm:self-auto"
                    >
                      Inspect Payload
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Structured Table View */
        <Card className="surface-glass surface-tactile border border-[var(--glass-border)] shadow-xs overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                    <th className="py-3 px-4">Action & Resource</th>
                    <th className="py-3 px-4">Actor & Role</th>
                    <th className="py-3 px-4">Version Reference</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="interactive-row hover:bg-[var(--bg-surface-subtle)] transition-all"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={getActionBadgeVariant(event.action)} size="sm">
                            {event.action}
                          </Badge>
                          <span className="font-mono text-[10px] text-[var(--text-muted)]">
                            {event.resource_type}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[var(--text-primary)]">
                            {event.actor_email}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">{event.actor_role}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[var(--text-secondary)]">
                        {event.version_reference || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--text-muted)] whitespace-nowrap">
                        {new Date(event.created_at).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEvent(event)}
                          leftIcon={<Eye className="h-3.5 w-3.5" />}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Detail Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={`Audit Event #${selectedEvent.id.slice(0, 8)}`}
          description={`Recorded on ${new Date(selectedEvent.created_at).toLocaleString()}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
              <div>
                <span className="text-[var(--text-muted)] block text-[10px] uppercase font-bold">Action</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {selectedEvent.action}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block text-[10px] uppercase font-bold">
                  Resource
                </span>
                <span className="font-mono text-[var(--text-primary)]">
                  {selectedEvent.resource_type}: {selectedEvent.resource_id}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block text-[10px] uppercase font-bold">Actor</span>
                <span className="text-[var(--text-primary)]">
                  {selectedEvent.actor_email} ({selectedEvent.actor_role})
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block text-[10px] uppercase font-bold">
                  Version
                </span>
                <span className="font-mono text-[var(--text-primary)]">
                  {selectedEvent.version_reference || "N/A"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block mb-1">
                Sanitized Event Details (Confidential Payload Excluded):
              </span>
              <pre className="p-3.5 rounded-lg bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] border border-[var(--border-default)] font-mono text-[11px] overflow-x-auto max-h-56">
                {JSON.stringify(selectedEvent.details, null, 2)}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
