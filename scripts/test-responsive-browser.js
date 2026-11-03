/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Yatrion — Automated Headless Browser Responsive Testing Script
 * Uses real Google Chrome 156 headless rendering engine to test:
 * 320px, 375px, 390px, 768px, 1024px, 1440px
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE_URL = "http://localhost:3000";
const OUTPUT_DIR = path.join(__dirname, "../public/qa-screenshots");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { width: 320, height: 568, name: "320px-mobile-compact" },
  { width: 375, height: 667, name: "375px-mobile-standard" },
  { width: 390, height: 844, name: "390px-mobile-modern" },
  { width: 768, height: 1024, name: "768px-tablet-portrait" },
  { width: 1024, height: 768, name: "1024px-tablet-landscape" },
  { width: 1440, height: 900, name: "1440px-desktop-hd" },
];

console.log("=== YATRION AUTOMATED REAL BROWSER RESPONSIVE SUITE ===");
console.log(`Testing against: ${BASE_URL}\nUsing Chrome: ${CHROME_PATH}\n`);

let passedCount = 0;
const results = [];

for (const vp of VIEWPORTS) {
  const screenshotPath = path.join(OUTPUT_DIR, `${vp.name}.png`);
  console.log(`[TEST] Testing ${vp.width}x${vp.height} (${vp.name})...`);

  try {
    // 1. Capture real headless rendering screenshot
    const cmd = `"${CHROME_PATH}" --headless=new --hide-scrollbars --window-size=${vp.width},${vp.height} --screenshot="${screenshotPath}" "${BASE_URL}"`;
    execSync(cmd, { stdio: "pipe", timeout: 15000 });

    const stats = fs.statSync(screenshotPath);
    const screenshotPassed = stats.size > 20000;

    // 2. Dump DOM and check document rendering
    const dumpCmd = `"${CHROME_PATH}" --headless=new --window-size=${vp.width},${vp.height} --dump-dom "${BASE_URL}"`;
    const domHtml = execSync(dumpCmd, { stdio: "pipe", timeout: 15000 }).toString("utf8");

    const hasNav = domHtml.includes("Yatrion") && domHtml.includes("destinations");
    const hasHero = domHtml.includes("Discover Karnataka");
    const hasPlanner = domHtml.includes("planner");
    const hasKannada = domHtml.includes("ಕನ್ನಡ") || domHtml.includes("ಹಂಪಿ");

    const allPassed = screenshotPassed && hasNav && hasHero && hasPlanner && hasKannada;

    if (allPassed) {
      passedCount++;
      console.log(`  ✓ Rendered successfully (${stats.size} bytes). Nav, Hero, Planner & Kannada verified.`);
      results.push({ ...vp, status: "PASS", sizeBytes: stats.size, screenshot: screenshotPath });
    } else {
      console.error(`  ✗ Verification failed for viewport ${vp.name}`);
      results.push({ ...vp, status: "FAIL", error: "Missing required sections in rendered DOM" });
    }
  } catch (err) {
    console.error(`  ✗ Error testing viewport ${vp.name}:`, err.message);
    results.push({ ...vp, status: "ERROR", error: err.message });
  }
}

// 7. Test Print Layout
console.log("\n[TEST] Testing Print Layout rendering...");
const pdfPath = path.join(OUTPUT_DIR, "yatrion-print-sheet.pdf");
try {
  const printCmd = `"${CHROME_PATH}" --headless=new --print-to-pdf="${pdfPath}" "${BASE_URL}"`;
  execSync(printCmd, { stdio: "pipe", timeout: 15000 });
  const pdfStats = fs.statSync(pdfPath);
  if (pdfStats.size > 10000) {
    console.log(`  ✓ Print PDF generated successfully (${pdfStats.size} bytes).`);
  }
} catch (err) {
  console.error("  ✗ Print PDF generation warning:", err.message);
}

console.log(`\n=== RESPONSIVE AUDIT RESULTS: ${passedCount} / ${VIEWPORTS.length} VIEWPORTS PASSED ===`);
