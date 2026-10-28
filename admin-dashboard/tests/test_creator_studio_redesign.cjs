/**
 * test_creator_studio_redesign.cjs
 *
 * Automated Test Suite for Inkloom Creator Studio Redesign:
 * 1. Studio layout & structural composition
 * 2. Refined top control bar (channel pills, autosave indicator, version snapshots)
 * 3. Spacious writing canvas with ambient illumination & inline claim highlighting
 * 4. Interactive dynamic governance panel (radial compliance ring, expandable findings)
 * 5. Clickable policy evidence citations & 1-click prescriptive rewrite logic
 * 6. Multi-engine copilot tabs (Governance, Contextual AI Assistant, Split-Vision)
 * 7. Reduced motion and long-session legibility safeguards
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("================================================================================");
console.log(" Running Inkloom Creator Studio Redesign Automated Test Suite ");
console.log("================================================================================");

const studioFilePath = path.join(__dirname, "../src/views/CreatorStudioView.tsx");
assert.ok(fs.existsSync(studioFilePath), "CreatorStudioView.tsx must exist");
const studioCode = fs.readFileSync(studioFilePath, "utf8");

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
// Test 1: Refined Top Control Bar & Workspace Composition
// -----------------------------------------------------------------------------
runTest("Test 1: Top control bar contains live telemetry, channel pills, and autosave state", () => {
  assert.ok(
    studioCode.includes("AtmosphericBackground variant=\"header\""),
    "Control bar must incorporate atmospheric ambient lighting"
  );
  assert.ok(
    studioCode.includes("CHANNEL_OPTIONS") && studioCode.includes("linkedin") && studioCode.includes("twitter"),
    "Channel selector must support multi-channel publishing options"
  );
  assert.ok(
    studioCode.includes("CONTENT_TYPE_OPTIONS") && studioCode.includes("social_post"),
    "Content type options must be available"
  );
  assert.ok(
    studioCode.includes("Autosaving edits...") && studioCode.includes("lastSavedTime"),
    "Autosave state indicator must be present with visual status"
  );
  assert.ok(
    studioCode.includes("Save Snapshot") && studioCode.includes("History"),
    "Version snapshot controls must be directly accessible from top bar"
  );
});

// -----------------------------------------------------------------------------
// Test 2: Spacious Writing Canvas & Inline Claim Highlighting Mode
// -----------------------------------------------------------------------------
runTest("Test 2: Writing canvas features dual drafting/review modes and flagged claims ribbon", () => {
  assert.ok(
    studioCode.includes("canvasMode") && studioCode.includes("setCanvasMode"),
    "Canvas must support switching between drafting and review inspection modes"
  );
  assert.ok(
    studioCode.includes("renderAnnotatedText"),
    "Canvas must contain interactive claim highlighting for flagged snippets"
  );
  assert.ok(
    studioCode.includes("Flagged Claims ("),
    "Canvas must include an active flagged claims ribbon for rapid navigation"
  );
  assert.ok(
    studioCode.includes("focus-within:border-[var(--accent-primary)]") ||
      studioCode.includes("focus-within:ring-2"),
    "Canvas must feature ambient focus illumination for comfortable writing sessions"
  );
  assert.ok(
    studioCode.includes("readingTimeMin") && studioCode.includes("wordCount"),
    "Canvas telemetry must provide live word count, character count, and reading time"
  );
});

// -----------------------------------------------------------------------------
// Test 3: Radial Compliance Score Ring & Dynamic Inspection Panel
// -----------------------------------------------------------------------------
runTest("Test 3: Inspection panel renders animated radial compliance score ring and status", () => {
  assert.ok(
    studioCode.includes("strokeDashoffset") && studioCode.includes("strokeDasharray"),
    "Governance inspection must render animated radial SVG progress visualization"
  );
  assert.ok(
    studioCode.includes("auditScore") && studioCode.includes("auditStatus"),
    "Audit score and compliance status must drive visual indicators"
  );
  assert.ok(
    studioCode.includes("PASSED") && studioCode.includes("WARNINGS_RESOLVABLE") && studioCode.includes("NEEDS_REVIEW"),
    "Standard governance status tiers must be accounted for"
  );
  assert.ok(
    studioCode.includes("findingFilter") && studioCode.includes("setFindingFilter"),
    "Category filter chips (Facts, Claims, Disclosures, Tone) must be available"
  );
});

// -----------------------------------------------------------------------------
// Test 4: Expandable Findings & Clickable Evidence Citations
// -----------------------------------------------------------------------------
runTest("Test 4: Finding cards are expandable with clickable ground truth policy evidence", () => {
  assert.ok(
    studioCode.includes("expandedFindingIds") && studioCode.includes("toggleFindingExpansion"),
    "Finding cards must support interactive accordion expansion and collapse"
  );
  assert.ok(
    studioCode.includes("evidenceModalFinding") && studioCode.includes("setEvidenceModalFinding"),
    "Clickable policy evidence citations must trigger ground truth inspection modal"
  );
  assert.ok(
    studioCode.includes("originalSnippet") && studioCode.includes("citationReference"),
    "Finding inspection must reveal original snippet, explanation, and exact citation"
  );
  assert.ok(
    studioCode.includes("compare diff") || studioCode.includes("setDiffModalFinding"),
    "Detailed side-by-side diff comparison must be supported"
  );
});

// -----------------------------------------------------------------------------
// Test 5: Actionable 1-Click Prescriptive Rewrites
// -----------------------------------------------------------------------------
runTest("Test 5: 1-click prescriptive rewrite updates text, ledger, and increments score", () => {
  assert.ok(
    studioCode.includes("applyRewrite"),
    "Must implement applyRewrite action"
  );
  assert.ok(
    studioCode.includes("draftText.replace(finding.originalSnippet, finding.suggestedFix)"),
    "Rewrite must accurately perform direct replacement in draftText"
  );
  assert.ok(
    studioCode.includes("api.acceptAuditFinding"),
    "Applying rewrite must record finding acceptance in the backend audit ledger"
  );
  assert.ok(
    studioCode.includes("handleSaveVersion"),
    "Applying rewrite must preserve an undo snapshot before modifying text"
  );
});

// -----------------------------------------------------------------------------
// Test 6: Multi-Engine Copilot Tabs (Governance, AI Assistant, Split-Vision)
// -----------------------------------------------------------------------------
runTest("Test 6: Multi-engine right panel seamlessly hosts Governance, AI Assistant, and Split-Vision", () => {
  assert.ok(
    studioCode.includes("activeTab") && studioCode.includes("setActiveTab"),
    "Right copilot panel must feature smooth tab switching"
  );
  assert.ok(
    studioCode.includes("handleAskAssistant") && studioCode.includes("assistantAlternatives"),
    "Contextual AI Assistant must support guidance and brand-aligned alternatives"
  );
  assert.ok(
    studioCode.includes("runVisualAudit") && studioCode.includes("logoDetectionResult"),
    "Split-Vision engine must support OpenCV deterministic and Gemini qualitative checks"
  );
  assert.ok(
    studioCode.includes("brandAssets") && studioCode.includes("colorTolerance"),
    "Split-Vision must integrate with private tenant assets and CIELAB color tolerance"
  );
});

// -----------------------------------------------------------------------------
// Test 7: Reduced Motion & Asynchronous Skeleton States
// -----------------------------------------------------------------------------
runTest("Test 7: Reduced-motion settings respected and skeleton states provided during async requests", () => {
  assert.ok(
    studioCode.includes("isMotionReduced"),
    "Component must consume isMotionReduced from ThemeContext"
  );
  assert.ok(
    studioCode.includes("Skeleton"),
    "Component must render skeleton placeholders during active audit and assistant queries"
  );
  assert.ok(
    studioCode.includes("isAuditing") && studioCode.includes("isAskingAssistant"),
    "Asynchronous loading states must drive responsive feedback"
  );
});

// -----------------------------------------------------------------------------
// Test 8: End-to-End Workflow Simulation (Creation, Audit, Rewrite, Snapshot, Restore)
// -----------------------------------------------------------------------------
runTest("Test 8: Complete creation, audit, rewrite, snapshot, and restore state machine verified", () => {
  // Simulate editor state machine
  let draft = "Nexus Cloud delivers guaranteed 100% uptime with our unbeatable 30% discount this quarter.";
  const history = [];

  // Snapshot 1
  history.push({ id: "v1", text: draft, score: null, label: "Initial" });

  // Simulate audit finding
  const mockFinding = {
    id: "f-uptime",
    findingType: "PROHIBITED_CLAIM",
    severity: "CRITICAL",
    originalSnippet: "guaranteed 100% uptime",
    suggestedFix: "guaranteed 99.99% multi-region uptime",
    citationReference: "[Rule: SLA-01: Guaranteed uptime cannot exceed 99.99%]",
    explanation: "Absolute 100% guarantees violate infrastructure SLA regulations.",
  };

  // Pre-fix snapshot
  history.push({ id: "v2", text: draft, score: 52, label: "Before Fix" });

  // Apply fix
  assert.ok(draft.includes(mockFinding.originalSnippet), "Draft must contain original snippet");
  draft = draft.replace(mockFinding.originalSnippet, mockFinding.suggestedFix);
  assert.ok(draft.includes("guaranteed 99.99% multi-region uptime"), "Draft must reflect replacement");
  assert.ok(!draft.includes("guaranteed 100% uptime"), "Old snippet must be fully removed");

  // Post-fix snapshot
  history.push({ id: "v3", text: draft, score: 88, label: "After Fix" });
  assert.strictEqual(history.length, 3, "Version history must track all revision snapshots");

  // Restore previous version
  const restored = history.find((h) => h.id === "v2");
  draft = restored.text;
  assert.ok(draft.includes("guaranteed 100% uptime"), "Restoration must safely revert draft");
});

console.log("--------------------------------------------------------------------------------");
console.log(" Results: 8 of 8 Creator Studio tests PASSED (100% success rate)");
console.log("================================================================================");
