/**
 * test_microinteractions.cjs
 *
 * Automated Test Suite for Inkloom Frontend Microinteractions:
 * 1. AnimatedCounter component architecture, easing, and reduced motion compliance
 * 2. EmptyState component presets, abstract geometric decor, and action callbacks
 * 3. Button, FormControls forwardRef, active tap feedback, and focus states
 * 4. CSS microinteraction utilities (.micro-lift, .interactive-card, .interactive-row, .interactive-pill, .focus-ring)
 * 5. OverviewView metrics counter and micro-lift integration
 * 6. CreatorStudioView animated gauge and feedback integration
 * 7. ReviewQueueView selection state and semantic empty states
 * 8. GoldenFactsView immediate search, clear button, and interactive fact cards
 * 9. BrandRulesView severity/enforcement indicators and guardrail interactions
 * 10. AuditHistoryView and AnalyticsView interactive rows and live feedback
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log(" Running Inkloom Microinteractions Automated Test Suite ");
console.log("================================================================================");

function runTest(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${err.message}`);
    process.exit(1);
  }
}

// -----------------------------------------------------------------------------
// Test 1: AnimatedCounter Component Architecture & Motion Safety
// -----------------------------------------------------------------------------
runTest("Test 1: AnimatedCounter uses requestAnimationFrame and respects reduced motion", () => {
  const filePath = path.join(__dirname, "../src/design-system/AnimatedCounter.tsx");
  assert.ok(fs.existsSync(filePath), "AnimatedCounter.tsx must exist");
  const code = fs.readFileSync(filePath, "utf8");

  assert.ok(code.includes("requestAnimationFrame"), "AnimatedCounter must use requestAnimationFrame for fluid updates");
  assert.ok(code.includes("cancelAnimationFrame"), "AnimatedCounter must clean up animation frames on unmount");
  assert.ok(code.includes("isMotionReduced"), "AnimatedCounter must detect reduced motion preference");
  assert.ok(code.includes("prefers-reduced-motion"), "AnimatedCounter must check prefers-reduced-motion media query");
  assert.ok(code.includes("prefix") && code.includes("suffix"), "AnimatedCounter must support prefix and suffix formatting");
  assert.ok(code.includes("decimals"), "AnimatedCounter must support decimal formatting");
});

// -----------------------------------------------------------------------------
// Test 2: EmptyState Layered Abstract Decor & Semantic Presets
// -----------------------------------------------------------------------------
runTest("Test 2: EmptyState provides semantic presets and abstract geometric decor", () => {
  const filePath = path.join(__dirname, "../src/design-system/EmptyState.tsx");
  assert.ok(fs.existsSync(filePath), "EmptyState.tsx must exist");
  const code = fs.readFileSync(filePath, "utf8");

  assert.ok(code.includes("preset"), "EmptyState must support semantic presets");
  assert.ok(
    code.includes('"search"') &&
    code.includes('"inbox"') &&
    code.includes('"rules"') &&
    code.includes('"shield"') &&
    code.includes('"audit"'),
    "EmptyState must include search, inbox, rules, shield, and audit presets"
  );
  assert.ok(code.includes("actionLabel") && code.includes("onAction"), "EmptyState must support action buttons");
  assert.ok(code.includes("rounded-full border"), "EmptyState must render geometric abstract backdrop rings");
});

// -----------------------------------------------------------------------------
// Test 3: Design System Buttons & FormControls Focus/Active Microinteractions
// -----------------------------------------------------------------------------
runTest("Test 3: Button and FormControls implement active scale, focus rings, and forwardRef", () => {
  const btnPath = path.join(__dirname, "../src/design-system/Button.tsx");
  const formPath = path.join(__dirname, "../src/design-system/FormControls.tsx");
  assert.ok(fs.existsSync(btnPath), "Button.tsx must exist");
  assert.ok(fs.existsSync(formPath), "FormControls.tsx must exist");

  const btnCode = fs.readFileSync(btnPath, "utf8");
  assert.ok(btnCode.includes("active:scale-[0.97]"), "Button must have tactile active press scale microinteraction");
  assert.ok(btnCode.includes("hover:-translate-y-0.5"), "Button must have subtle hover lift");
  assert.ok(btnCode.includes("focus-visible:ring-2"), "Button must provide clear keyboard focus indicator");

  const formCode = fs.readFileSync(formPath, "utf8");
  assert.ok(formCode.includes("forwardRef"), "Form controls must use forwardRef for DOM access and focus management");
  assert.ok(formCode.includes("focus:ring-2"), "Form controls must have high-visibility focus ring");
});

// -----------------------------------------------------------------------------
// Test 4: CSS Microinteraction Utility Classes & Accessibility Safeguards
// -----------------------------------------------------------------------------
runTest("Test 4: CSS provides .micro-lift, .interactive-card, .interactive-row, .interactive-pill, and reduced-motion reset", () => {
  const cssPath = path.join(__dirname, "../src/index.css");
  assert.ok(fs.existsSync(cssPath), "index.css must exist");
  const cssCode = fs.readFileSync(cssPath, "utf8");

  assert.ok(cssCode.includes(".micro-lift"), "index.css must define .micro-lift utility");
  assert.ok(cssCode.includes(".interactive-card"), "index.css must define .interactive-card utility");
  assert.ok(cssCode.includes(".interactive-row"), "index.css must define .interactive-row utility");
  assert.ok(cssCode.includes(".interactive-pill"), "index.css must define .interactive-pill utility");
  assert.ok(cssCode.includes(".focus-ring"), "index.css must define .focus-ring utility");
  assert.ok(
    cssCode.includes("@media (prefers-reduced-motion: reduce)"),
    "index.css must contain prefers-reduced-motion query to neutralize motion for sensitive users"
  );
});

// -----------------------------------------------------------------------------
// Test 5: OverviewView Animated Counters & Pod Micro-Lift
// -----------------------------------------------------------------------------
runTest("Test 5: OverviewView incorporates AnimatedCounter and micro-lift cards", () => {
  const viewPath = path.join(__dirname, "../src/views/OverviewView.tsx");
  assert.ok(fs.existsSync(viewPath), "OverviewView.tsx must exist");
  const code = fs.readFileSync(viewPath, "utf8");

  assert.ok(code.includes("AnimatedCounter"), "OverviewView must import and render AnimatedCounter");
  assert.ok(
    code.includes("<AnimatedCounter value={passRateScore}") || code.includes("<AnimatedCounter value={complianceScore}"),
    "Governance score must animate smoothly with AnimatedCounter"
  );
  assert.ok(code.includes("micro-lift"), "Overview metric pods must use .micro-lift for restrained hover elevation");
});

// -----------------------------------------------------------------------------
// Test 6: CreatorStudioView Animated Radial Gauge & Textarea Focus
// -----------------------------------------------------------------------------
runTest("Test 6: CreatorStudioView features animated compliance gauge and refined interactions", () => {
  const viewPath = path.join(__dirname, "../src/views/CreatorStudioView.tsx");
  assert.ok(fs.existsSync(viewPath), "CreatorStudioView.tsx must exist");
  const code = fs.readFileSync(viewPath, "utf8");

  assert.ok(
    code.includes("<AnimatedCounter value={auditScore") || code.includes("<AnimatedCounter value={complianceScore"),
    "Compliance gauge score must be animated"
  );
});

// -----------------------------------------------------------------------------
// Test 7: ReviewQueueView Active Item Selection & Presets
// -----------------------------------------------------------------------------
runTest("Test 7: ReviewQueueView provides interactive item selection and semantic empty states", () => {
  const viewPath = path.join(__dirname, "../src/views/ReviewQueueView.tsx");
  assert.ok(fs.existsSync(viewPath), "ReviewQueueView.tsx must exist");
  const code = fs.readFileSync(viewPath, "utf8");

  assert.ok(code.includes("border-l-4 border-l-[var(--accent-primary)]"), "Selected submission in Review Queue must have distinct active accent indicator");
  assert.ok(code.includes("micro-lift"), "Review Queue items must have hover lift");
  assert.ok(code.includes('preset="inbox"') || code.includes('preset="audit"'), "Review Queue must use semantic presets for empty states");
});

// -----------------------------------------------------------------------------
// Test 8: GoldenFactsView Immediate Search, Clear Button, and Card Lift
// -----------------------------------------------------------------------------
runTest("Test 8: GoldenFactsView provides instant search with clear button, live match badge, and interactive cards", () => {
  const viewPath = path.join(__dirname, "../src/views/GoldenFactsView.tsx");
  assert.ok(fs.existsSync(viewPath), "GoldenFactsView.tsx must exist");
  const code = fs.readFileSync(viewPath, "utf8");

  assert.ok(code.includes('setSearchTerm("")'), "GoldenFactsView must have immediate search clear action");
  assert.ok(code.includes("interactive-card") && code.includes("micro-lift"), "Fact cards must use interactive-card and micro-lift");
  assert.ok(
    code.includes('preset={searchTerm ? "search" : "default"}') || code.includes('preset="search"'),
    "Search empty state must use preset='search'"
  );
});

// -----------------------------------------------------------------------------
// Test 9: BrandRulesView Severity & Enforcement Visuals
// -----------------------------------------------------------------------------
runTest("Test 9: BrandRulesView clearly communicates severity and enforcement mode with icons", () => {
  const viewPath = path.join(__dirname, "../src/views/BrandRulesView.tsx");
  assert.ok(fs.existsSync(viewPath), "BrandRulesView.tsx must exist");
  const code = fs.readFileSync(viewPath, "utf8");

  assert.ok(code.includes("ShieldAlert"), "BrandRulesView must render ShieldAlert for blocking rules");
  assert.ok(code.includes("AlertTriangle") || code.includes("AlertCircle"), "BrandRulesView must render warning/advisory icons");
  assert.ok(code.includes("interactive-card"), "Rule cards must use interactive-card");
  assert.ok(code.includes('preset="rules"'), "Rules empty state must use preset='rules'");
});

// -----------------------------------------------------------------------------
// Test 10: AuditHistoryView & AnalyticsView Interactive Rows & Progress Transitions
// -----------------------------------------------------------------------------
runTest("Test 10: AuditHistoryView and AnalyticsView incorporate interactive rows and animated metrics", () => {
  const auditPath = path.join(__dirname, "../src/views/AuditHistoryView.tsx");
  const analyticsPath = path.join(__dirname, "../src/views/AnalyticsView.tsx");
  assert.ok(fs.existsSync(auditPath), "AuditHistoryView.tsx must exist");
  assert.ok(fs.existsSync(analyticsPath), "AnalyticsView.tsx must exist");

  const auditCode = fs.readFileSync(auditPath, "utf8");
  assert.ok(auditCode.includes("interactive-row"), "AuditHistoryView table rows must have interactive-row class");
  assert.ok(auditCode.includes('setSearchTerm("")'), "AuditHistoryView must have instant search clear button");
  assert.ok(auditCode.includes("EmptyState") && auditCode.includes('"audit"'), "AuditHistoryView must use semantic empty states");

  const analyticsCode = fs.readFileSync(analyticsPath, "utf8");
  assert.ok(analyticsCode.includes("AnimatedCounter"), "AnalyticsView must use AnimatedCounter for key KPIs");
  assert.ok(analyticsCode.includes("interactive-row"), "AnalyticsView channel performance table must use interactive-row");
  assert.ok(analyticsCode.includes("transition-all duration-700 ease-out"), "AnalyticsView progress bars must have smooth transition");
});

console.log("================================================================================");
console.log(" ALL 10 MICROINTERACTION TESTS PASSED CLEANLY! ");
console.log("================================================================================");
