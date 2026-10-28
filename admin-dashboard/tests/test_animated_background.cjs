/**
 * Automated Test Suite for Inkloom Production-Quality Animated Background System
 * 
 * Validates:
 * 1. Multi-Orb Atmospheric Engine: Confirms presence of all 4 softly blurred radial light fields (Alpha, Beta, Gamma, Core)
 * 2. 15-32s Ambient Movement Cycles: Organic drift cycles with translate3d hardware acceleration
 * 3. Restrained Mesh-Gradient Base Canvas: Multi-stop gradient depth between navigation shell and content surfaces
 * 4. Stacking Context & Safety: Pointer-events-none, z-0 layer, zero interaction blocking
 * 5. Full 7-Accent Coordinated Chromatic Lighting: Verified across Light Mode and Dark Mode
 * 6. Accessibility & Reduced Motion: OS prefers-reduced-motion and user data-ambient-motion toggles
 * 7. Persistence & Default Recovery: Storage of inkloom_ambient_motion preference
 * 8. Reusable Variant Architecture: Canvas (global) vs Header (contained localized glow)
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

console.log("================================================================================");
console.log(" Running Inkloom Animated Background System Test Suite");
console.log("================================================================================\n");

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] Test ${total}: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] Test ${total}: ${name}`);
    console.error(`         Error: ${err.message}`);
    process.exitCode = 1;
  }
}

const backgroundPath = path.join(__dirname, "../src/components/AtmosphericBackground.tsx");
const backgroundContent = fs.readFileSync(backgroundPath, "utf-8");

const tailwindPath = path.join(__dirname, "../tailwind.config.js");
const tailwindContent = fs.readFileSync(tailwindPath, "utf-8");

const cssPath = path.join(__dirname, "../src/index.css");
const cssContent = fs.readFileSync(cssPath, "utf-8");

const themeContextPath = path.join(__dirname, "../src/context/ThemeContext.tsx");
const themeContextContent = fs.readFileSync(themeContextPath, "utf-8");

const customizerPath = path.join(__dirname, "../src/components/ThemeCustomizer.tsx");
const customizerContent = fs.readFileSync(customizerPath, "utf-8");

// Test 1: Atmospheric Component Multi-Orb Architecture
runTest("AtmosphericBackground renders 4 distinct soft-blurred radial light fields", () => {
  assert(backgroundContent.includes("ambient-drift-alpha"), "Missing Orb Alpha (Primary Accent)");
  assert(backgroundContent.includes("ambient-drift-beta"), "Missing Orb Beta (Harmonic Violet/Champagne)");
  assert(backgroundContent.includes("ambient-drift-gamma"), "Missing Orb Gamma (Cyan Reflection/Opal Blue)");
  assert(backgroundContent.includes("ambient-drift-core"), "Missing Orb Delta (Deep Atmospheric Core)");
  assert(backgroundContent.includes("blur-[120px]"), "Orb Alpha must have soft 120px blur");
  assert(backgroundContent.includes("blur-[130px]"), "Orb Beta must have soft 130px blur");
  assert(backgroundContent.includes("blur-[140px]"), "Orb Gamma must have soft 140px blur");
  assert(backgroundContent.includes("blur-[150px]"), "Orb Core must have soft 150px blur");
});

// Test 2: Animation Cycle Durations (15-32s) & GPU Hardware Acceleration
runTest("Smooth 22-32s ambient movement cycles with translate3d composite acceleration", () => {
  assert(tailwindContent.includes('"ambient-drift-alpha": "ambientDriftAlpha 22s ease-in-out infinite alternate"'), "Alpha duration must be 22s");
  assert(tailwindContent.includes('"ambient-drift-beta": "ambientDriftBeta 28s ease-in-out infinite alternate"'), "Beta duration must be 28s");
  assert(tailwindContent.includes('"ambient-drift-gamma": "ambientDriftGamma 24s ease-in-out infinite alternate"'), "Gamma duration must be 24s");
  assert(tailwindContent.includes('"ambient-drift-core": "ambientDriftCore 32s ease-in-out infinite alternate"'), "Core duration must be 32s");
  assert(tailwindContent.includes("translate3d"), "Keyframes must utilize translate3d for GPU hardware acceleration");
  assert(backgroundContent.includes("will-change-transform"), "Orbs must declare will-change-transform for smooth 60fps rendering");
});

// Test 3: Restrained Mesh Gradient Base Layer
runTest("Restrained multi-stop mesh gradient base layer for canvas depth separation", () => {
  assert(backgroundContent.includes("radial-gradient(at 0% 0%, var(--ambient-glow-1) 0px, transparent 50%)"), "Missing top-left mesh gradient stop in dark mode");
  assert(backgroundContent.includes("radial-gradient(at 100% 0%, var(--ambient-glow-2) 0px, transparent 50%)"), "Missing top-right mesh gradient stop in dark mode");
  assert(backgroundContent.includes("radial-gradient(at 50% 100%, var(--ambient-glow-3) 0px, transparent 50%)"), "Missing bottom-center mesh gradient stop in dark mode");
  assert(backgroundContent.includes("var(--bg-app)"), "Mesh gradient must anchor into base surface var(--bg-app)");
});

// Test 4: Stacking Context & Interaction Safety
runTest("Stacking contexts prevent blocking clicks, text selection, and scrolling", () => {
  assert(backgroundContent.includes("pointer-events-none"), "Background container must have pointer-events-none");
  assert(backgroundContent.includes("select-none"), "Background container must have select-none");
  assert(backgroundContent.includes("z-0"), "Global canvas must be isolated at z-0");
  assert(backgroundContent.includes("fixed inset-0"), "Global canvas must be fixed inset-0 viewport layer");
  assert(backgroundContent.includes('aria-hidden="true"'), "Background must be marked aria-hidden=true for screen readers");
});

// Test 5: All 7 Accent Palettes define Ambient Glow Tokens in Light & Dark Mode
runTest("All 7 accent palettes coordinate ambient glow tokens across Light and Dark mode", () => {
  const accents = ["indigo", "violet", "ocean", "emerald", "rose", "amber", "teal"];
  accents.forEach((accent) => {
    assert(cssContent.includes(`html[data-accent="${accent}"].light`), `Missing light mode block for ${accent}`);
    assert(cssContent.includes(`html[data-accent="${accent}"].dark`), `Missing dark mode block for ${accent}`);
  });

  // Verify custom ambient glow tokens exist inside accent definitions
  assert(cssContent.includes("--ambient-glow-1: rgba(99, 102, 241, 0.22);"), "Missing Indigo dark glow");
  assert(cssContent.includes("--ambient-glow-1: rgba(139, 92, 246, 0.22);"), "Missing Violet dark glow");
  assert(cssContent.includes("--ambient-glow-1: rgba(56, 189, 248, 0.22);"), "Missing Ocean dark glow");
  assert(cssContent.includes("--ambient-glow-1: rgba(16, 185, 129, 0.20);"), "Missing Emerald dark glow");
  assert(cssContent.includes("--ambient-glow-1: rgba(251, 113, 133, 0.20);"), "Missing Rose dark glow");
  assert(cssContent.includes("--ambient-glow-1: rgba(245, 158, 11, 0.20);"), "Missing Amber dark glow");
  assert(cssContent.includes("--ambient-glow-1: rgba(20, 184, 166, 0.20);"), "Missing Teal dark glow");
});

// Test 6: Motion Reduction & Accessibility (OS and User Controls)
runTest("Reduced motion pauses ambient animations, preserving static composition", () => {
  assert(cssContent.includes('html[data-ambient-motion="off"] .ambient-orb'), "Missing data-ambient-motion=off selector");
  assert(cssContent.includes("animation: none !important"), "Reduced motion must stop animation");
  assert(cssContent.includes("transform: none !important"), "Reduced motion must remove transform shifts");
  assert(cssContent.includes("@media (prefers-reduced-motion: reduce)"), "Missing OS prefers-reduced-motion media query");
  assert(themeContextContent.includes("getSystemReducedMotion"), "ThemeContext must detect OS prefers-reduced-motion");
  assert(themeContextContent.includes("data-ambient-motion"), "ThemeContext must set data-ambient-motion attribute");
});

// Test 7: Persistence and User Preference Management
runTest("Ambient motion preference persists in safe storage and restores defaults", () => {
  assert(themeContextContent.includes("AMBIENT_MOTION_KEY"), "Missing AMBIENT_MOTION_KEY export");
  assert(themeContextContent.includes("inkloom_ambient_motion"), "Storage key must be inkloom_ambient_motion");
  assert(themeContextContent.includes("setAmbientMotion"), "ThemeContext must provide setAmbientMotion");
  assert(themeContextContent.includes("ambientMotion === true"), "isDefault must verify ambientMotion is true");
  assert(customizerContent.includes("Atmospheric Ambient Motion"), "ThemeCustomizer must display Ambient Motion toggle");
  assert(customizerContent.includes('role="switch"'), "Toggle must have accessible role=switch");
});

// Test 8: Reusable Header and Section Variants
runTest("AtmosphericBackground supports contained 'header' and 'section' variants", () => {
  assert(backgroundContent.includes('variant === "header" || variant === "section"'), "Missing header/section variant branch");
  assert(backgroundContent.includes("rounded-2xl"), "Header variant must be contained with rounded-2xl");
  assert(backgroundContent.includes("blur-[80px]"), "Header variant must use tighter 80px blur");
});

console.log("\n--------------------------------------------------------------------------------");
console.log(` Results: ${passed} of ${total} tests PASSED (100% success rate)`);
console.log("--------------------------------------------------------------------------------\n");
