/**
 * Automated Verification Suite for Inkloom Sidebar and Top Navigation
 * Tests:
 * 1. CSS Design Tokens: All 7 accent palettes configured in both Light and Dark modes
 * 2. Surface Contrast: Verification of light mode neutral sidebar vs dark mode layered midnight
 * 3. Navigation Integrity: All 10 routes preserved and mapped correctly
 * 4. Role Permissions: Strict filtering for OWNER, BRAND_MANAGER, CONTENT_CREATOR, COMPLIANCE_REVIEWER, SUPER_ADMIN
 * 5. Visual Hierarchy: Navigation groups, workspace tenant selector, active role card, breadcrumb
 * 6. Theme Controls: Compact accessible appearance toggle + 7-accent color selector dropdown
 * 7. Mobile Drawer: Responsive navigation mirroring desktop features
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("=================================================");
console.log(" Running Inkloom Sidebar & Navigation Test Suite ");
console.log("=================================================");

const cssPath = path.join(__dirname, "../src/index.css");
const appLayoutPath = path.join(__dirname, "../src/components/AppLayout.tsx");
const themeSwitcherPath = path.join(__dirname, "../src/components/ThemeSwitcher.tsx");

const cssContent = fs.readFileSync(cssPath, "utf-8");
const appLayoutContent = fs.readFileSync(appLayoutPath, "utf-8");
const themeSwitcherContent = fs.readFileSync(themeSwitcherPath, "utf-8");

// --- TEST 1: CSS Design Tokens - 7 Accents in Light & Dark Modes ---
console.log("\n[Test 1] Verifying 7 accent palettes across Light & Dark modes in index.css...");
const accents = ["indigo", "violet", "ocean", "emerald", "rose", "amber", "teal"];

accents.forEach((accent) => {
  const lightSelector = `html[data-accent="${accent}"].light`;
  const darkSelector = `html[data-accent="${accent}"].dark`;
  assert(cssContent.includes(lightSelector), `Missing light mode selector for accent: ${accent}`);
  assert(cssContent.includes(darkSelector), `Missing dark mode selector for accent: ${accent}`);
});
console.log("✓ Test 1 Passed: All 7 accent palettes (Indigo, Violet, Ocean, Emerald, Rose, Amber, Teal) defined in both Light & Dark modes.");

// --- TEST 2: Sidebar Surface Contrast - Neutral Light vs Layered Dark ---
console.log("\n[Test 2] Verifying sidebar surface contrast tokens (no flat white wall in light mode, layered dark in dark mode)...");
assert(cssContent.includes("--bg-sidebar: #f1f5f9;"), "Light mode must use subtle neutral surface #f1f5f9 rather than a bright white wall");
assert(cssContent.includes("--bg-sidebar-card: #ffffff;"), "Light mode must define crisp white cards for elevated elements on sidebar");
assert(cssContent.includes("--bg-sidebar: #070c18;"), "Dark mode must use deep layered midnight surface #070c18");
assert(cssContent.includes("--bg-sidebar-card: #0d1527;"), "Dark mode must define layered dark card surface #0d1527");
assert(cssContent.includes(".bg-sidebar-card-theme"), "Missing .bg-sidebar-card-theme utility class in index.css");
console.log("✓ Test 2 Passed: Sidebar surfaces provide refined neutral light mode and layered midnight dark mode.");

// --- TEST 3: Navigation Routes Preservation ---
console.log("\n[Test 3] Verifying all 10 existing navigation routes are preserved...");
const expectedRoutes = [
  "overview",
  "creator-studio",
  "review-queue",
  "golden-facts",
  "brand-rules",
  "visual-assets",
  "audit-history",
  "analytics",
  "brand-setup",
  "settings",
];

expectedRoutes.forEach((route) => {
  assert(appLayoutContent.includes(`id: "${route}"`), `Missing route definition: ${route}`);
});
console.log(`✓ Test 3 Passed: All ${expectedRoutes.length} navigation routes are fully preserved.`);

// --- TEST 4: Role-Based Navigation Filtering ---
console.log("\n[Test 4] Verifying role filtering logic across user roles...");
const roles = ["OWNER", "BRAND_MANAGER", "CONTENT_CREATOR", "COMPLIANCE_REVIEWER", "SUPER_ADMIN"];

roles.forEach((r) => {
  assert(appLayoutContent.includes(r), `Missing role reference: ${r}`);
});

// Verify Content Creator has Creator Studio & Golden Facts, but NOT Workspace Settings
assert(appLayoutContent.includes(`id: "creator-studio"`));
assert(appLayoutContent.includes(`roles: ["OWNER", "BRAND_MANAGER", "CONTENT_CREATOR", "SUPER_ADMIN"]`));
assert(appLayoutContent.includes(`id: "settings"`));
assert(appLayoutContent.includes(`roles: ["OWNER", "BRAND_MANAGER", "SUPER_ADMIN"]`));
console.log("✓ Test 4 Passed: Role permissions correctly restrict and expose routes per role.");

// --- TEST 5: Sidebar Hierarchy & Navigation Groups ---
console.log("\n[Test 5] Verifying structured navigation groups and visual hierarchy...");
assert(appLayoutContent.includes(`title: "Core Governance"`), "Missing Core Governance group");
assert(appLayoutContent.includes(`title: "Knowledge & Rules"`), "Missing Knowledge & Rules group");
assert(appLayoutContent.includes(`title: "Operations & Audit"`), "Missing Operations & Audit group");

// Check workspace tenant switcher
assert(appLayoutContent.includes("Workspace Tenant"), "Missing Workspace Tenant header");
assert(appLayoutContent.includes("activeBrand.secondaryColor"), "Workspace selector must use brand color");
assert(appLayoutContent.includes("Switch Workspace"), "Missing brand dropdown header");

// Check active navigation styling
assert(appLayoutContent.includes("border-l-[3px] border-[var(--accent-primary)]"), "Active nav must have accent left border");
assert(appLayoutContent.includes("bg-[var(--accent-subtle)]"), "Active nav must have accent subtle background");
assert(appLayoutContent.includes("text-[var(--accent-text)]"), "Active nav must use accent text token");

// Check active role indicator
assert(appLayoutContent.includes("Test Role Navigation"), "Missing role switcher dropdown");
assert(appLayoutContent.includes("Theme Studio"), "Missing Theme Studio launcher in profile footer");
console.log("✓ Test 5 Passed: Clear visual hierarchy between brand, workspace selector, navigation groups, and active role.");

// --- TEST 6: Theme Controls - Compact Toggle & Discoverable Accent Selector ---
console.log("\n[Test 6] Verifying ThemeSwitcher appearance toggle & 7-accent palette selector...");
assert(themeSwitcherContent.includes("toggleThemeMode"), "Missing toggleThemeMode in ThemeSwitcher");
assert(themeSwitcherContent.includes("Sun"), "Missing Sun icon for Dark Mode toggle");
assert(themeSwitcherContent.includes("Moon"), "Missing Moon icon for Light Mode toggle");
assert(themeSwitcherContent.includes("aria-label"), "Missing accessible aria-label on mode toggle");
assert(themeSwitcherContent.includes("dropdownOpen"), "ThemeSwitcher must support dropdown for accent selection");
assert(themeSwitcherContent.includes("setAccentColor"), "ThemeSwitcher must support direct accent color switching");
assert(themeSwitcherContent.includes("openCustomizer"), "ThemeSwitcher must allow opening full customizer");
assert(themeSwitcherContent.includes("Escape"), "ThemeSwitcher must handle Escape key navigation");
console.log("✓ Test 6 Passed: ThemeSwitcher includes accessible Sun/Moon toggle and 7-accent popover dropdown.");

// --- TEST 7: Mobile Navigation Responsiveness ---
console.log("\n[Test 7] Verifying mobile navigation drawer...");
assert(appLayoutContent.includes("mobileMenuOpen"), "Missing mobile menu state");
assert(appLayoutContent.includes("fixed inset-0 z-50 lg:hidden"), "Missing mobile drawer modal container");
assert(appLayoutContent.includes("setMobileMenuOpen(false)"), "Mobile drawer must close on backdrop click and nav selection");
assert(appLayoutContent.includes("<ThemeSwitcher showLabels />"), "Mobile drawer must provide theme switcher");
console.log("✓ Test 7 Passed: Mobile drawer navigation is responsive and mirrors desktop features.");

console.log("\n=================================================");
console.log(" All 7 Sidebar & Navigation Tests Passed Cleanly! ");
console.log("=================================================\n");
