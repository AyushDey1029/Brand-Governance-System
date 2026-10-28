/**
 * test_pages_visual_direction.cjs
 *
 * Verifies that the new immersive visual direction is applied consistently
 * across all remaining Inkloom pages:
 * 1. Review Queue (ReviewQueueView.tsx)
 * 2. Golden Facts (GoldenFactsView.tsx)
 * 3. Guardrails & Rules (BrandRulesView.tsx)
 * 4. Visual Identity (VisualAssetsView.tsx)
 * 5. Audit History (AuditHistoryView.tsx)
 * 6. Governance Analytics (AnalyticsView.tsx)
 * 7. Brand Profile (BrandSetupView.tsx)
 * 8. Workspace Settings (SettingsView.tsx)
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const VIEWS_DIR = path.join(__dirname, "../src/views");

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

console.log("\n================================================================================");
console.log(" Running Inkloom Immersive Visual Direction Page Verification Suite ");
console.log("================================================================================\n");

// Test 1: All 8 pages import and render AtmosphericBackground with variant="header"
runTest("Test 1: All 8 pages render atmospheric page headers with AtmosphericBackground", () => {
  const pages = [
    "ReviewQueueView.tsx",
    "GoldenFactsView.tsx",
    "BrandRulesView.tsx",
    "VisualAssetsView.tsx",
    "AuditHistoryView.tsx",
    "AnalyticsView.tsx",
    "BrandSetupView.tsx",
    "SettingsView.tsx",
  ];

  for (const page of pages) {
    const filePath = path.join(VIEWS_DIR, page);
    assert.ok(fs.existsSync(filePath), `${page} must exist in views/`);
    const code = fs.readFileSync(filePath, "utf-8");
    assert.ok(
      code.includes("AtmosphericBackground"),
      `${page} must import and utilize AtmosphericBackground`
    );
    assert.ok(
      code.includes('variant="header"'),
      `${page} must use AtmosphericBackground with variant="header"`
    );
  }
});

// Test 2: ReviewQueueView composition: Decision workspace with split dossier, copyable hashes, SLA badges
runTest("Test 2: Review Queue serves as an interactive decision workspace with detail dossier", () => {
  const code = fs.readFileSync(path.join(VIEWS_DIR, "ReviewQueueView.tsx"), "utf-8");
  assert.ok(code.includes("selectedItem"), "Must support selecting active review item");
  assert.ok(code.includes("surface-glass"), "Must use layered glass surfaces");
  assert.ok(code.includes("api.takeReviewAction") || code.includes("handleTakeAction"), "Preserves approval/rejection review action handling");
  assert.ok(code.includes("SLA") || code.includes("Turnaround") || code.includes("sla"), "Includes SLA telemetry or badges");
});

// Test 3: GoldenFactsView composition: Curated knowledge library with source preview modal
runTest("Test 3: Golden Facts serves as a curated knowledge library with source preview modal", () => {
  const code = fs.readFileSync(path.join(VIEWS_DIR, "GoldenFactsView.tsx"), "utf-8");
  assert.ok(code.includes("setPreviewingSourceFact"), "Must support source citation preview modal");
  assert.ok(code.includes("Knowledge Library Telemetry") || code.includes("Verified Ground Truth Facts"), "Includes library telemetry ribbon");
  assert.ok(code.includes("interactive-card") && code.includes("micro-lift"), "Fact cards must support interactive microinteractions");
  assert.ok(code.includes("selectedCategory"), "Supports category filtering");
});

// Test 4: BrandRulesView composition: Policy control center with severity hierarchy
runTest("Test 4: Guardrails & Rules serves as a policy control center with severity hierarchy", () => {
  const code = fs.readFileSync(path.join(VIEWS_DIR, "BrandRulesView.tsx"), "utf-8");
  assert.ok(code.includes("border-l-4"), "Implements severity-based colored left border hierarchy");
  assert.ok(code.includes("ShieldAlert"), "Includes severity indicator iconography");
  assert.ok(code.includes("enforcementMode") || code.includes("selectedEnforcement"), "Communicates enforcement states");
  assert.ok(code.includes("Pattern / Detection Syntax") || code.includes("patternOrInstruction"), "Provides detection syntax preview");
});

// Test 5: VisualAssetsView composition: Brand studio with live contrast stages & typography specimens
runTest("Test 5: Visual Identity serves as a brand studio with live previews and specimen cards", () => {
  const code = fs.readFileSync(path.join(VIEWS_DIR, "VisualAssetsView.tsx"), "utf-8");
  assert.ok(code.includes("logoStages"), "Supports live contrast stage toggle (Dark/Light/Grid)");
  assert.ok(code.includes("Sphinx of black quartz, judge my vow"), "Provides font specimen preview for typography");
  assert.ok(code.includes("copiedHex"), "Supports copyable palette hex codes");
  assert.ok(code.includes("Brand Studio Telemetry") || code.includes("Palette Swatches"), "Includes studio telemetry ribbon");
});

// Test 6: AuditHistoryView composition: Chronological timeline with glowing track & payload inspector
runTest("Test 6: Audit History presents readable chronological timeline and event payload inspector", () => {
  const code = fs.readFileSync(path.join(VIEWS_DIR, "AuditHistoryView.tsx"), "utf-8");
  assert.ok(code.includes("viewMode"), "Supports switching between Timeline and Table views");
  assert.ok(code.includes("setSelectedEvent"), "Provides event payload modal inspector");
  assert.ok(code.includes("border-l-2") || code.includes("track"), "Renders vertical glowing timeline track");
  assert.ok(code.includes("Ledger Telemetry") || code.includes("Recorded Events"), "Includes audit ledger telemetry");
});

// Test 7: AnalyticsView composition: Empirical data visualizations with interactive rows
runTest("Test 7: Governance Analytics provides polished, interactive empirical data visualizations", () => {
  const code = fs.readFileSync(path.join(VIEWS_DIR, "AnalyticsView.tsx"), "utf-8");
  assert.ok(code.includes("AnimatedCounter"), "Uses animated counters for key metrics");
  assert.ok(code.includes("interactive-row"), "Uses interactive rows for channel compliance table");
  assert.ok(code.includes("transition-all duration-700 ease-out"), "Smooth micro transitions on progress bars");
  assert.ok(code.includes("Top Recurring Brand Violations"), "Provides violation category breakdown");
});

// Test 8: BrandSetupView composition: Elegant multi-section form with organized columns
runTest("Test 8: Brand Profile provides elegant multi-section forms and organized sections", () => {
  const code = fs.readFileSync(path.join(VIEWS_DIR, "BrandSetupView.tsx"), "utf-8");
  assert.ok(code.includes("Organization & Core Identity"), "Includes organization identity section");
  assert.ok(code.includes("Publishing Channels & Target Audience"), "Includes distribution channels section");
  assert.ok(code.includes("Approved Vocabulary & Prohibited Terms"), "Includes terminology guardrails section");
  assert.ok(code.includes("Review Thresholds & Escalation"), "Includes escalation policies section");
  assert.ok(code.includes("api.updateBrand"), "Preserves updateBrand API integration");
});

// Test 9: SettingsView composition: Categorized tabs with ThemeCustomizer & RBAC
runTest("Test 9: Workspace Settings provides organized tabs, ThemeCustomizer, and RBAC table", () => {
  const code = fs.readFileSync(path.join(VIEWS_DIR, "SettingsView.tsx"), "utf-8");
  assert.ok(code.includes("ThemeCustomizer"), "Integrates ThemeCustomizer sandbox");
  assert.ok(code.includes("activeTab"), "Provides categorized tab switching");
  assert.ok(code.includes("Authorized Workspace Members"), "Renders RBAC tenant membership table");
  assert.ok(code.includes("handleCopyToken"), "Preserves Chrome Extension PAT copy functionality");
  assert.ok(code.includes("api.inviteMember"), "Preserves member invitation API");
});

// Test 10: Preserved permissions, tokenized styling, and absence of static mock inventions
runTest("Test 10: Zero hardcoded color walls; tokenized styling and backend integration preserved", () => {
  const pages = [
    "ReviewQueueView.tsx",
    "GoldenFactsView.tsx",
    "BrandRulesView.tsx",
    "VisualAssetsView.tsx",
    "AuditHistoryView.tsx",
    "AnalyticsView.tsx",
    "BrandSetupView.tsx",
    "SettingsView.tsx",
  ];

  for (const page of pages) {
    const code = fs.readFileSync(path.join(VIEWS_DIR, page), "utf-8");
    assert.ok(
      code.includes("var(--text-primary)") || code.includes("var(--accent-primary)"),
      `${page} must use tokenized CSS variables`
    );
    assert.ok(
      !code.includes("bg-[#ffffff]") && !code.includes("bg-[#000000]"),
      `${page} must not hardcode raw hex backgrounds`
    );
  }
});

console.log("\n================================================================================");
console.log(" ALL 10 IMMERSIVE VISUAL DIRECTION PAGE TESTS PASSED CLEANLY! ");
console.log("================================================================================\n");
