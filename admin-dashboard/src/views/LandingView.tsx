import React, { useState } from "react";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  BookOpen,
  Layers,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  UserCheck,
  ChevronRight,
  Zap,
  Lock,
  Eye,
  Sliders,
  Cpu,
  Activity,
  ArrowUpRight,
  Database,
  Check,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { Button } from "../design-system/Button";
import { Badge } from "../design-system/Badge";
import { Modal } from "../design-system/Modal";
import { Input } from "../design-system/FormControls";
import { useNotification } from "../context/NotificationContext";
import { ThemeSwitcher } from "../components/ThemeSwitcher";

export const LandingView: React.FC = () => {
  const { setIsAuthenticated, setCurrentRoute, setIsDemoMode, login, registerBrand } = useWorkspace();
  const { showToast } = useNotification();

  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [emailError, setEmailError] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLaunchDemo = async () => {
    setIsLoading(true);
    try {
      await login({ email: "demo.creator@inkloom.io", password: "Password123!" });
      setCurrentRoute("creator-studio");
      showToast({
        type: "success",
        title: "Demo Workspace Active",
        message: "Signed in as Marcus Brody (Content Creator) in Nexus Cloud Technologies.",
      });
    } catch {
      try {
        await login({ email: "demo.owner@inkloom.io", password: "Password123!" });
        setCurrentRoute("creator-studio");
        showToast({
          type: "success",
          title: "Demo Workspace Active",
          message: "Signed in as Alex Vance (Brand Owner) in Nexus Cloud Technologies.",
        });
      } catch (err: any) {
        showToast({
          type: "error",
          title: "Backend Connection Required",
          message: "Could not auto-login demo user. Please make sure the backend is running at http://127.0.0.1:8000.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setEmailError("Please enter a valid business email address.");
      return;
    }
    setEmailError("");
    setAuthError("");
    setIsLoading(true);

    try {
      if (authModal === "register") {
        const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        await registerBrand({
          email,
          password,
          full_name: fullName,
          brand_name: companyName,
          brand_slug: slug || "my-brand",
        });
        showToast({
          type: "success",
          title: "Account Provisioned",
          message: "Organization workspace created. You are the brand owner.",
        });
      } else {
        await login({ email, password });
        showToast({
          type: "success",
          title: "Authenticated Successfully",
          message: "Signed in to your authorized brand workspace.",
        });
      }

      setAuthModal(null);
      setCurrentRoute("overview");
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed. Please check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-[var(--accent-primary)] selection:text-[var(--accent-contrast)] relative z-10 text-[var(--text-primary)]">
      {/* Top Floating Glass Navbar */}
      <header className="sticky top-0 z-40 surface-glass surface-glass-highlight border-b border-[var(--glass-border)] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-contrast)] flex items-center justify-center font-bold shadow-glow ring-1 ring-white/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display font-bold text-base tracking-tight block">Inkloom</span>
              <span className="text-[10px] font-mono font-medium tracking-wider uppercase block -mt-1 text-[var(--accent-text)]">
                Autonomous Brand Governance
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[var(--text-secondary)] font-display">
            <a href="#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">
              Architecture
            </a>
            <a href="#demo" className="hover:text-[var(--text-primary)] transition-colors">
              Live Inspection
            </a>
            <a href="#solutions" className="hover:text-[var(--text-primary)] transition-colors">
              Role Workflows
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Button variant="ghost" size="sm" onClick={() => setAuthModal("login")}>
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleLaunchDemo}
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              className="font-bold shadow-glow"
            >
              Enter Demo
            </Button>
          </div>
        </div>
      </header>

      {/* Cinematic Hero Section */}
      <section className="pt-20 pb-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full surface-glass border border-[var(--accent-border)] text-xs shadow-glow/10">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent-primary)] animate-pulse" />
            <span className="font-semibold text-[var(--text-primary)]">Enterprise Multi-Tenant AI Platform</span>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="font-mono text-[var(--accent-text)]">pgvector + Split-Vision CV</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-[var(--text-primary)]">
            Content velocity without{" "}
            <span className="bg-gradient-to-r from-[var(--accent-primary)] via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              brand risk
            </span>
            .
          </h1>

          <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-[var(--text-secondary)] font-normal">
            Eliminate manual review bottlenecks. Inkloom audits marketing drafts and creative imagery in real time against approved <strong>Golden Facts</strong>, <strong>prohibited claims</strong>, and <strong>exact visual brand tokens</strong> directly inside creator workflows.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              size="lg"
              variant="primary"
              onClick={handleLaunchDemo}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="font-bold shadow-glow text-base px-8 py-3.5"
            >
              Launch Live Workspace Demo
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setAuthModal("register")}
              className="font-semibold text-base px-8 py-3.5"
            >
              Register Enterprise Brand
            </Button>
          </div>

          {/* Asymmetric Value Pillars */}
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left max-w-5xl mx-auto">
            <div className="p-5 rounded-2xl surface-glass surface-glass-highlight surface-tactile border border-[var(--glass-border)] space-y-2">
              <div className="h-8 w-8 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent-primary)] flex items-center justify-center font-bold">
                <Database className="h-4 w-4" />
              </div>
              <div className="font-display text-sm font-bold text-[var(--text-primary)]">Grounded Citations</div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Zero hallucinated policy flags. Every violation cites approved enterprise ground truth.
              </p>
            </div>

            <div className="p-5 rounded-2xl surface-glass surface-glass-highlight surface-tactile border border-[var(--glass-border)] space-y-2">
              <div className="h-8 w-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold border border-violet-500/20">
                <Eye className="h-4 w-4" />
              </div>
              <div className="font-display text-sm font-bold text-[var(--text-primary)]">Split-Vision CV</div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                OpenCV deterministic hex delta math paired with Gemini multimodal aesthetic judging.
              </p>
            </div>

            <div className="p-5 rounded-2xl surface-glass surface-glass-highlight surface-tactile border border-[var(--glass-border)] space-y-2">
              <div className="h-8 w-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold border border-cyan-500/20">
                <Lock className="h-4 w-4" />
              </div>
              <div className="font-display text-sm font-bold text-[var(--text-primary)]">Tenant Isolation</div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Brand-partitioned pgvector vector stores ensuring strict organizational safety.
              </p>
            </div>

            <div className="p-5 rounded-2xl surface-glass surface-glass-highlight surface-tactile border border-[var(--glass-border)] space-y-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20">
                <Zap className="h-4 w-4" />
              </div>
              <div className="font-display text-sm font-bold text-[var(--text-primary)]">Chrome MV3 Sidepanel</div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Audits inside LinkedIn, WordPress, and Webflow without switching contexts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Inspection Sample */}
      <section id="demo" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <Badge variant="glow" size="sm" pulse dot>
            Real-time Evaluation Engine
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            How Inkloom catches off-brand violations live
          </h2>
          <p className="text-sm max-w-xl mx-auto text-[var(--text-secondary)]">
            Creators receive prescriptive, 1-click rewrites with citations to official SLAs instead of generic rejections.
          </p>
        </div>

        <div className="surface-glass surface-glass-highlight rounded-3xl p-6 sm:p-10 border border-[var(--glass-border)] shadow-glass grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Draft Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className="font-display text-xs font-bold text-[var(--text-primary)]">
                  Active Creator Draft
                </span>
                <Badge variant="neutral" size="sm">LinkedIn Ad</Badge>
              </div>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">Target: Nexus Cloud</span>
            </div>

            <div className="p-5 rounded-2xl surface-glass-subtle border border-[var(--border-default)] text-xs leading-relaxed font-mono">
              Nexus Cloud delivers{" "}
              <span className="px-1.5 py-0.5 rounded border border-rose-500/40 bg-rose-500/20 text-rose-300 font-semibold">
                guaranteed 100% uptime
              </span>{" "}
              with our{" "}
              <span className="px-1.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/20 text-amber-300 font-semibold">
                unbeatable 30% discount
              </span>{" "}
              this quarter. It is the cheapest cloud infrastructure available!
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-muted)]">
              <Activity className="h-3.5 w-3.5 text-[var(--accent-primary)] animate-pulse" />
              <span>Evaluated against 14 Golden Facts and 8 brand guardrails in 180ms.</span>
            </div>
          </div>

          {/* Findings Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <span className="font-display text-xs font-bold text-[var(--text-primary)]">
                Autonomous Governance Findings
              </span>
              <Badge variant="warning" size="sm">Score: 54 / 100</Badge>
            </div>

            {/* Finding Item 1 */}
            <div className="p-4 rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-xs space-y-2 surface-tactile">
              <div className="flex items-center justify-between">
                <span className="font-bold font-display flex items-center gap-1.5 text-[var(--color-danger-text)]">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> FACTUAL_INACCURACY
                </span>
                <Badge variant="danger" size="sm">Critical Violation</Badge>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Contradicts verified SLA agreement. Nexus commitment is 99.99%, not 100%.
              </p>
              <div className="text-[10px] font-mono text-[var(--text-muted)]">
                <strong>Source Fact:</strong> Enterprise SLA Agreement v2026.1
              </div>
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-emerald-400">
                  → "guaranteed 99.99% multi-region uptime"
                </span>
                <Badge variant="success" size="sm">1-Click Rewrite</Badge>
              </div>
            </div>

            {/* Finding Item 2 */}
            <div className="p-4 rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] text-xs space-y-2 surface-tactile">
              <div className="flex items-center justify-between">
                <span className="font-bold font-display flex items-center gap-1.5 text-[var(--color-warning-text)]">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> PROHIBITED_CLAIM
                </span>
                <Badge variant="warning" size="sm">Warning</Badge>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Superlative claim "cheapest" violates brand guardrail on competitive substantiation.
              </p>
              <div className="text-[10px] font-mono text-[var(--text-muted)]">
                <strong>Source:</strong> Brand Guardrail #2 (Superlatives & Pricing Claims)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="neutral">The Autonomous Loop</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Three-stage brand governance architecture
          </h2>
          <p className="text-xs sm:text-sm max-w-xl mx-auto text-[var(--text-secondary)]">
            How Inkloom seamlessly bridges policy authoring, active creator tooling, and executive compliance oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-2xl surface-glass surface-glass-highlight border border-[var(--glass-border)] space-y-4 surface-tactile">
            <div className="h-10 w-10 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent-primary)] flex items-center justify-center font-display font-bold text-base shadow-xs">
              01
            </div>
            <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
              Ingest Golden Facts & Guardrails
            </h3>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              Brand leaders upload verified pricing matrices, product specs, and legal rules. pgvector generates 768-dimensional embeddings in isolated tenant boundaries.
            </p>
          </div>

          <div className="p-7 rounded-2xl surface-glass surface-glass-highlight border border-[var(--glass-border)] space-y-4 surface-tactile">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-display font-bold text-base border border-emerald-500/20 shadow-xs">
              02
            </div>
            <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
              In-Context Creator Audits
            </h3>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              Creators draft in the Studio or via Chrome Extension. The dual-engine checks facts, tone, and visual hex compliance, returning explanations and 1-click fixes.
            </p>
          </div>

          <div className="p-7 rounded-2xl surface-glass surface-glass-highlight border border-[var(--glass-border)] space-y-4 surface-tactile">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-display font-bold text-base border border-amber-500/20 shadow-xs">
              03
            </div>
            <h3 className="font-display text-base font-bold text-[var(--text-primary)]">
              Human Escalation & Analytics
            </h3>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              High-risk deviations route to authorized brand reviewers for sign-off. Compliance trend analytics identify ambiguous rules needing clarification.
            </p>
          </div>
        </div>
      </section>

      {/* Role Workflows */}
      <section id="solutions" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="brand">Role-Aware Workflows</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Built for compliance leaders and fast-moving creators
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl surface-glass surface-glass-highlight border border-[var(--glass-border)] space-y-5 surface-tactile">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent-primary)] flex items-center justify-center shadow-xs">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[var(--text-primary)]">For Brand Managers & Legal</h3>
                <span className="text-xs text-[var(--text-muted)] font-mono">Centralized governance without manual review burnout</span>
              </div>
            </div>
            <ul className="space-y-3 text-xs text-[var(--text-secondary)]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                <span>Upload single-source-of-truth spreadsheets (CSV/Excel) and brand guardrails.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                <span>Inspect recurring compliance violations and optimize ambiguous guidelines.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                <span>Manage escalated high-risk claims with structured audit notes.</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl surface-glass surface-glass-highlight border border-[var(--glass-border)] space-y-5 surface-tactile">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[var(--text-primary)]">For Content Creators & Marketers</h3>
                <span className="text-xs text-[var(--text-muted)] font-mono">Immediate feedback directly in active publishing tools</span>
              </div>
            </div>
            <ul className="space-y-3 text-xs text-[var(--text-secondary)]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                <span>Instant pre-publication checks inside WordPress, LinkedIn, or Webflow.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                <span>Replace vague rejections with 1-click prescriptive rewrites that preserve tone.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                <span>Submit exceptions directly to brand reviewers without messy email chains.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-24 px-4 sm:px-6 text-center border-t border-[var(--border-subtle)]">
        <div className="max-w-3xl mx-auto space-y-6">
          <Badge variant="glow" size="sm" pulse dot>
            Enterprise Brand Sovereignty
          </Badge>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Experience frictionless brand governance
          </h2>
          <p className="text-sm max-w-xl mx-auto text-[var(--text-secondary)] leading-relaxed">
            Explore the multi-tenant workspace with pre-populated ground truth data for Nexus Cloud, Aura Health, and Veritas Financial.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              size="lg"
              variant="primary"
              onClick={handleLaunchDemo}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="font-bold shadow-glow text-base px-8 py-3.5"
            >
              Enter Live Demo Workspace
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setAuthModal("register")}
              className="font-semibold text-base px-8 py-3.5"
            >
              Register New Brand
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-6 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)] surface-glass">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--accent-primary)]" />
            <span className="font-bold text-[var(--text-primary)] font-display">Inkloom Platform</span>
            <span>• Multi-Tenant AI Governance</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span>FastAPI Backend</span>
            <span>PostgreSQL + pgvector</span>
            <span>OpenCV Vision</span>
            <span>Gemini LLM</span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <Modal
        isOpen={authModal !== null}
        onClose={() => setAuthModal(null)}
        title={authModal === "register" ? "Create Brand Workspace Account" : "Sign In to Brand Workspace"}
        description={
          authModal === "register"
            ? "Register your enterprise brand to manage private Golden Facts and review policies."
            : "Enter your credentials to access your authorized brand workspace."
        }
      >
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {authError && (
            <div className="p-3 text-xs rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] font-semibold">
              {authError}
            </div>
          )}

          {authModal === "register" && (
            <>
              <Input
                label="Full Name"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Company / Brand Name"
                placeholder="Acme Technologies"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </>
          )}

          <Input
            label="Work Email"
            type="email"
            placeholder="jane@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            error={emailError}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Min. 8 chars, Aa1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="pt-3 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setAuthError("");
                setAuthModal(authModal === "register" ? "login" : "register");
              }}
            >
              {authModal === "register" ? "Already registered? Sign in" : "Need an account? Register"}
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="font-bold shadow-glow">
              {authModal === "register" ? "Create Account" : "Sign In"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
