import React, { useState, useEffect } from "react";
import {
  Building2,
  Save,
  Globe,
  Radio,
  FileText,
  Volume2,
  ShieldAlert,
  Users,
  CheckCircle2,
  Plus,
  Trash2,
  Sliders,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../design-system/Card";
import { Button } from "../design-system/Button";
import { Input, Textarea, Select } from "../design-system/FormControls";
import { Badge } from "../design-system/Badge";
import { AtmosphericBackground } from "../components/AtmosphericBackground";
import { useNotification } from "../context/NotificationContext";
import { api } from "../api/client";

const ALL_CHANNELS = [
  { id: "linkedin", label: "LinkedIn", icon: "in" },
  { id: "twitter", label: "X / Twitter", icon: "x" },
  { id: "blog", label: "Blog / Article", icon: "doc" },
  { id: "press_release", label: "Press Release", icon: "pr" },
  { id: "email", label: "Email Newsletter", icon: "mail" },
  { id: "instagram", label: "Instagram", icon: "ig" },
  { id: "facebook", label: "Facebook", icon: "fb" },
];

export const BrandSetupView: React.FC = () => {
  const { activeBrand, refreshActiveBrand, isDemoMode } = useWorkspace();
  const { showToast } = useNotification();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState(activeBrand.name || "");
  const [description, setDescription] = useState(activeBrand.description || "");
  const [industry, setIndustry] = useState(activeBrand.industry || "");
  const [website, setWebsite] = useState(activeBrand.website || "");
  const [tagline, setTagline] = useState(activeBrand.tagline || "");
  const [targetAudience, setTargetAudience] = useState(activeBrand.target_audience || "");
  const [supportedChannels, setSupportedChannels] = useState<string[]>(
    activeBrand.supported_channels || ["linkedin", "twitter", "blog"]
  );
  const [brandVoice, setBrandVoice] = useState<string>(
    (activeBrand.brand_voice || activeBrand.toneGuidelines || []).join("\n")
  );

  // Preferred Terminology: List of { key: string, value: string }
  const [preferredTerms, setPreferredTerms] = useState<Array<{ key: string; value: string }>>(() => {
    if (activeBrand.preferred_terminology) {
      return Object.entries(activeBrand.preferred_terminology).map(([key, value]) => ({ key, value }));
    }
    return [
      { key: "AI tool", value: "Governance Platform" },
      { key: "cheap", value: "cost-effective" },
    ];
  });

  // Prohibited Terminology
  const [prohibitedTerms, setProhibitedTerms] = useState<string[]>(
    activeBrand.prohibited_terminology || ["guaranteed", "100% bug-free", "foolproof", "unhackable"]
  );
  const [newProhibitedTerm, setNewProhibitedTerm] = useState("");

  // Review & Escalation
  const [reviewerContactEmail, setReviewerContactEmail] = useState(
    activeBrand.reviewer_contact_email || "compliance@inkloom.io"
  );
  const [autoPassScore, setAutoPassScore] = useState(
    activeBrand.review_thresholds?.auto_pass_min_score ?? 85
  );
  const [escalateScore, setEscalateScore] = useState(
    activeBrand.review_thresholds?.escalate_below_score ?? 70
  );
  const [targetSlaHours, setTargetSlaHours] = useState(
    activeBrand.review_thresholds?.target_sla_hours ?? 4
  );
  const [requireHumanReviewForCritical, setRequireHumanReviewForCritical] = useState(
    activeBrand.review_thresholds?.require_human_review_for_critical ?? true
  );

  // Fetch latest brand info from API on mount or brand change
  useEffect(() => {
    let isMounted = true;
    if (!isDemoMode && api.hasTokens() && activeBrand.id) {
      setIsLoading(true);
      api
        .getBrand(activeBrand.id)
        .then((b) => {
          if (!isMounted) return;
          setName(b.name || "");
          setDescription(b.description || "");
          setIndustry(b.industry || "");
          setWebsite(b.website || "");
          setTagline(b.tagline || "");
          setTargetAudience(b.target_audience || "");
          if (b.supported_channels && b.supported_channels.length > 0) {
            setSupportedChannels(b.supported_channels);
          }
          if (b.brand_voice && b.brand_voice.length > 0) {
            setBrandVoice(b.brand_voice.join("\n"));
          } else if (b.toneGuidelines) {
            setBrandVoice(b.toneGuidelines.join("\n"));
          }
          if (b.preferred_terminology) {
            setPreferredTerms(
              Object.entries(b.preferred_terminology).map(([k, v]) => ({ key: k, value: String(v) }))
            );
          }
          if (b.prohibited_terminology) {
            setProhibitedTerms(b.prohibited_terminology);
          }
          if (b.reviewer_contact_email) {
            setReviewerContactEmail(b.reviewer_contact_email);
          }
          if (b.review_thresholds) {
            setAutoPassScore(b.review_thresholds.auto_pass_min_score ?? 85);
            setEscalateScore(b.review_thresholds.escalate_below_score ?? 70);
            setTargetSlaHours(b.review_thresholds.target_sla_hours ?? 4);
            setRequireHumanReviewForCritical(
              b.review_thresholds.require_human_review_for_critical ?? true
            );
          }
        })
        .catch((err) => {
          console.error("Failed to fetch brand profile:", err);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [activeBrand.id, isDemoMode]);

  const toggleChannel = (channelId: string) => {
    setSupportedChannels((prev) =>
      prev.includes(channelId) ? prev.filter((c) => c !== channelId) : [...prev, channelId]
    );
  };

  const addPreferredTerm = () => {
    setPreferredTerms([...preferredTerms, { key: "", value: "" }]);
  };

  const removePreferredTerm = (index: number) => {
    setPreferredTerms(preferredTerms.filter((_, i) => i !== index));
  };

  const updatePreferredTerm = (index: number, field: "key" | "value", val: string) => {
    const updated = [...preferredTerms];
    updated[index][field] = val;
    setPreferredTerms(updated);
  };

  const addProhibitedTerm = () => {
    const trimmed = newProhibitedTerm.trim();
    if (trimmed && !prohibitedTerms.includes(trimmed)) {
      setProhibitedTerms([...prohibitedTerms, trimmed]);
      setNewProhibitedTerm("");
    }
  };

  const removeProhibitedTerm = (term: string) => {
    setProhibitedTerms(prohibitedTerms.filter((t) => t !== term));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    const voiceList = brandVoice
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const preferredDict: Record<string, string> = {};
    preferredTerms.forEach((item) => {
      if (item.key.trim() && item.value.trim()) {
        preferredDict[item.key.trim()] = item.value.trim();
      }
    });

    const updatePayload = {
      name,
      description,
      industry,
      website,
      tagline,
      target_audience: targetAudience,
      supported_channels: supportedChannels,
      brand_voice: voiceList,
      preferred_terminology: preferredDict,
      prohibited_terminology: prohibitedTerms,
      reviewer_contact_email: reviewerContactEmail,
      review_thresholds: {
        auto_pass_min_score: Number(autoPassScore),
        escalate_below_score: Number(escalateScore),
        target_sla_hours: Number(targetSlaHours),
        require_human_review_for_critical: Boolean(requireHumanReviewForCritical),
      },
    };

    if (!isDemoMode && api.hasTokens() && activeBrand.id) {
      try {
        await api.updateBrand(activeBrand.id, updatePayload);
        await refreshActiveBrand();
        showToast({
          type: "success",
          title: "Brand Workspace Synchronized",
          message: `Saved configuration for ${name}. Brand voice, terminology, and thresholds updated across the engine.`,
        });
      } catch (err: any) {
        showToast({
          type: "error",
          title: "Update Failed",
          message: err.message || "Failed to save brand profile to server.",
        });
      } finally {
        setIsSaving(false);
      }
    } else {
      // Demo fallback
      setTimeout(() => {
        setIsSaving(false);
        showToast({
          type: "success",
          title: "Brand Profile Saved (Local)",
          message: `Saved configuration for ${name}.`,
        });
      }, 400);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl animate-in fade-in duration-300 pb-12">
      {/* Atmospheric Page Header */}
      <div className="surface-glass surface-glass-highlight rounded-3xl p-6 sm:p-8 border border-[var(--glass-border)] shadow-glass relative overflow-hidden">
        <AtmosphericBackground variant="header" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-[var(--accent-primary-subtle)] border border-[var(--accent-primary)]/30 flex items-center justify-center font-display font-black text-xl text-[var(--accent-primary)] shadow-sm shrink-0">
              {name ? name.substring(0, 2).toUpperCase() : "BK"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent-text)]">
                  Autonomous Governance Profile
                </span>
                <span className="text-xs text-[var(--text-muted)]">•</span>
                <span className="text-xs font-mono text-[var(--text-secondary)]">{industry || "Enterprise"}</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                Brand Workspace & Identity Profile
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl">
                Configure core identity, voice guardrails, vocabulary dictionaries, and automated escalation policies for{" "}
                <strong className="text-[var(--text-primary)] font-semibold">{name || activeBrand.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {website && (
              <a
                href={website.startsWith("http") ? website : `https://${website}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shadow-xs"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Visit Domain</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              leftIcon={<Save className="h-4 w-4" />}
              className="shadow-md shadow-[var(--accent-primary)]/20 cursor-pointer font-semibold"
            >
              {isSaving ? "Synchronizing..." : "Save Brand Profile"}
            </Button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="p-4 rounded-2xl surface-glass border border-[var(--accent-primary)]/20 text-xs text-[var(--accent-primary)] flex items-center gap-3 shadow-glass">
          <div className="w-4 h-4 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin shrink-0" />
          <span>Synchronizing live brand configuration from governance engine...</span>
        </div>
      )}

      {/* Main Profile Composition: Structured 2-Column Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Core Identity, Distribution & Vocabulary (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Core Organization & Identity */}
          <Card className="surface-glass border-[var(--glass-border)]">
            <CardHeader className="pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[var(--accent-primary)]" />
                    Organization & Core Identity
                  </CardTitle>
                  <CardDescription>Primary brand metadata, market positioning, and web footprint</CardDescription>
                </div>
                <Badge variant="neutral" size="sm">Metadata</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Brand Workspace Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nexus Cloud Technologies"
                  required
                />
                <Input
                  label="Industry Domain"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Cloud Infrastructure, FinTech, Healthcare"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Official Website URL"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://nexuscloud.io"
                />
                <Input
                  label="Tagline / Positioning Statement"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Autonomous cloud governance for modern engineering teams"
                />
              </div>

              <Textarea
                label="Brand Overview & Mission Description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the company mission, what you do, and what you stand for..."
              />
            </CardContent>
          </Card>

          {/* Section 2: Distribution Channels & Audience */}
          <Card className="surface-glass border-[var(--glass-border)]">
            <CardHeader className="pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-[var(--accent-primary)]" />
                    Publishing Channels & Target Audience
                  </CardTitle>
                  <CardDescription>
                    Configure channel matrix to enforce platform-specific constraints and tone
                  </CardDescription>
                </div>
                <Badge variant="neutral" size="sm">{supportedChannels.length} Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-2.5">
                  Supported Content Channels
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {ALL_CHANNELS.map((ch) => {
                    const isSelected = supportedChannels.includes(ch.id);
                    return (
                      <button
                        type="button"
                        key={ch.id}
                        onClick={() => toggleChannel(ch.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? "bg-[var(--accent-primary)] text-[var(--accent-contrast)] border-[var(--accent-border)] font-semibold shadow-xs"
                            : "bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-surface)]"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                        <span>{ch.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Textarea
                label="Primary Target Audience & Persona"
                rows={2}
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Enterprise Chief Information Security Officers, VP of Infrastructure, DevSecOps Leaders"
              />
            </CardContent>
          </Card>

          {/* Section 3: Approved Vocabulary & Prohibited Terminology */}
          <Card className="surface-glass border-[var(--glass-border)]">
            <CardHeader className="pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[var(--accent-primary)]" />
                    Approved Vocabulary & Prohibited Terms
                  </CardTitle>
                  <CardDescription>
                    Deterministic dictionary replacements and banned vocabulary enforced during audits
                  </CardDescription>
                </div>
                <Badge variant="neutral" size="sm">Deterministic Lexicon</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Preferred Terminology Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">
                      Preferred Terminology Replacements
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      When creators use the avoided term, Inkloom automatically suggests the preferred replacement.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addPreferredTerm}
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                  >
                    Add Term Pair
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {preferredTerms.map((term, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]"
                    >
                      <input
                        placeholder="Avoided term (e.g. AI tool)"
                        value={term.key}
                        onChange={(e) => updatePreferredTerm(idx, "key", e.target.value)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] flex-1 focus:ring-1 focus:ring-[var(--accent-ring)]"
                      />
                      <ArrowRight className="h-3.5 w-3.5 text-[var(--accent-primary)] shrink-0" />
                      <input
                        placeholder="Preferred term (e.g. Platform)"
                        value={term.value}
                        onChange={(e) => updatePreferredTerm(idx, "value", e.target.value)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] flex-1 focus:ring-1 focus:ring-[var(--accent-ring)]"
                      />
                      <button
                        type="button"
                        onClick={() => removePreferredTerm(idx)}
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--color-danger)] transition-colors cursor-pointer"
                        title="Remove term pair"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strictly Prohibited Terminology */}
              <div className="pt-5 border-t border-[var(--border-subtle)] space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">
                    Strictly Prohibited Terminology
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Any occurrence of these terms triggers a blocking violation in content audits.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {prohibitedTerms.map((term) => (
                    <span
                      key={term}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger-border)] font-semibold shadow-xs"
                    >
                      <span>{term}</span>
                      <button
                        type="button"
                        onClick={() => removeProhibitedTerm(term)}
                        className="hover:opacity-80 font-bold ml-1 cursor-pointer"
                        title="Remove prohibited term"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 max-w-md pt-1">
                  <input
                    placeholder="Enter prohibited term (e.g. foolproof)..."
                    value={newProhibitedTerm}
                    onChange={(e) => setNewProhibitedTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addProhibitedTerm();
                      }
                    }}
                    className="text-xs px-3 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] flex-1 focus:ring-2 focus:ring-[var(--accent-ring)]"
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={addProhibitedTerm}>
                    Add Term
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Voice Directives & Escalation Policies (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* Section 4: Brand Voice & Tone Directives */}
          <Card className="surface-glass border-[var(--glass-border)]">
            <CardHeader className="pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-[var(--accent-primary)]" />
                    Voice & Tone Directives
                  </CardTitle>
                  <CardDescription>
                    Evaluated during creator audits for tonal conformity
                  </CardDescription>
                </div>
                <Badge variant="neutral" size="sm">AI Evaluation</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Textarea
                label="Tone Directives (One guideline per line)"
                rows={5}
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
                placeholder="Empirical, architectural, and authoritative&#10;Clear, unambiguous, and data-backed&#10;Never hyperbolic or sensationally defensive"
                className="font-mono text-xs leading-relaxed"
              />
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] space-y-1">
                <span className="font-semibold text-[var(--text-primary)] block">Engine Evaluation Notice</span>
                <p>
                  Each line acts as an active prompt vector. The AI auditor flags passive phrases, colloquialisms, or hyperbole against these directives.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Review Thresholds & Escalation */}
          <Card className="surface-glass border-[var(--glass-border)]">
            <CardHeader className="pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-[var(--accent-primary)]" />
                    Review Thresholds & Escalation
                  </CardTitle>
                  <CardDescription>
                    Define automated publication gates and reviewer sign-off policies
                  </CardDescription>
                </div>
                <Badge variant="neutral" size="sm">SLA Policies</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <Input
                label="Compliance Escalation Contact Email"
                type="email"
                value={reviewerContactEmail}
                onChange={(e) => setReviewerContactEmail(e.target.value)}
                placeholder="compliance@brand.com"
                required
              />

              <Select
                label="Target Sign-Off SLA"
                value={String(targetSlaHours)}
                onChange={(e) => setTargetSlaHours(Number(e.target.value))}
                options={[
                  { value: "1", label: "1 Hour (Urgent / Breaking Release)" },
                  { value: "4", label: "4 Hours (Standard Enterprise SLA)" },
                  { value: "12", label: "12 Hours (Same Day)" },
                  { value: "24", label: "24 Hours (Low Urgency / Async)" },
                ]}
              />

              {/* Threshold Sliders */}
              <div className="space-y-4 pt-2">
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--text-primary)]">
                      Auto-Pass Threshold
                    </label>
                    <span className="font-mono font-bold text-xs text-[var(--color-success)] bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      ≥ {autoPassScore}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={autoPassScore}
                    onChange={(e) => setAutoPassScore(Number(e.target.value))}
                    className="w-full accent-[var(--accent-primary)] cursor-pointer"
                  />
                  <span className="text-[10px] text-[var(--text-muted)] block">
                    Drafts scoring ≥ {autoPassScore}% with no critical flags are automatically cleared for publication.
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--text-primary)]">
                      Mandatory Escalation Threshold
                    </label>
                    <span className="font-mono font-bold text-xs text-[var(--color-danger)] bg-rose-500/10 px-2 py-0.5 rounded-md">
                      &lt; {escalateScore}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="90"
                    value={escalateScore}
                    onChange={(e) => setEscalateScore(Number(e.target.value))}
                    className="w-full accent-[var(--color-danger)] cursor-pointer"
                  />
                  <span className="text-[10px] text-[var(--text-muted)] block">
                    Drafts scoring below {escalateScore}% are queued for formal human reviewer sign-off.
                  </span>
                </div>
              </div>

              {/* Critical Human Review Toggle */}
              <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-start gap-3">
                <input
                  type="checkbox"
                  id="req-human-crit"
                  checked={requireHumanReviewForCritical}
                  onChange={(e) => setRequireHumanReviewForCritical(e.target.checked)}
                  className="h-4 w-4 rounded text-[var(--accent-primary)] focus:ring-[var(--accent-ring)] border-[var(--border-default)] mt-0.5 cursor-pointer"
                />
                <label htmlFor="req-human-crit" className="text-xs text-[var(--text-secondary)] cursor-pointer leading-relaxed">
                  <strong className="text-[var(--text-primary)]">Strict Human Sign-off for Critical Violations:</strong> Always require reviewer sign-off whenever a Critical violation is detected, regardless of overall score.
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};
