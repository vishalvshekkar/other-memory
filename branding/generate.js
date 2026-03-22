/**
 * Generate all branding assets: favicon PNGs, ICO, OG image.
 *
 * Usage: cd branding && npm install && npm run generate
 * Requires: ImageMagick (magick) on PATH
 */

import puppeteer from "puppeteer-core";
import { execFileSync } from "child_process";
import { mkdirSync, existsSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, "output");

const FAVICON_SIZES = [16, 32, 48, 64, 128, 256, 512];
const ICO_SIZES = [16, 32, 48, 64, 128, 256];

async function main() {
  if (!existsSync(OUTPUT)) mkdirSync(OUTPUT, { recursive: true });

  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    channel: "chrome",
    args: ["--no-sandbox"],
  });

  // ─── Generate Favicon PNGs ───

  console.log("\nGenerating favicon PNGs...");
  const faviconPage = await browser.newPage();

  const svgPath = `file://${join(__dirname, "moon-logo.svg")}`;

  for (const size of FAVICON_SIZES) {
    await faviconPage.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    await faviconPage.goto(svgPath, { waitUntil: "networkidle0" });
    const outPath = join(OUTPUT, `favicon-${size}.png`);
    await faviconPage.screenshot({
      path: outPath,
      omitBackground: true,
    });
    console.log(`  favicon-${size}.png`);
  }

  await faviconPage.close();

  // ─── Generate ICO using ImageMagick ───

  console.log("\nCombining into favicon.ico...");
  const icoInputs = ICO_SIZES.map((s) => join(OUTPUT, `favicon-${s}.png`));
  try {
    execFileSync("magick", [...icoInputs, join(OUTPUT, "favicon.ico")], {
      stdio: "inherit",
    });
    console.log("  favicon.ico");
  } catch {
    console.error("  Failed to create ICO. Is ImageMagick installed?");
  }

  // ─── Copy SVG as favicon.svg ───

  copyFileSync(join(__dirname, "moon-logo.svg"), join(OUTPUT, "favicon.svg"));
  console.log("  favicon.svg (copy)");

  // ─── Copy large logo ───

  copyFileSync(join(OUTPUT, "favicon-512.png"), join(OUTPUT, "logo-512.png"));
  console.log("  logo-512.png (copy of 512)");

  // ─── Generate OG Image ───

  console.log("\nGenerating OG image (1200x630)...");
  const ogPage = await browser.newPage();
  await ogPage.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

  const ogPath = `file://${join(__dirname, "og-image.html")}`;
  await ogPage.goto(ogPath, { waitUntil: "networkidle0" });

  // Wait for fonts to load
  await ogPage.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 500));

  await ogPage.screenshot({
    path: join(OUTPUT, "og-image.png"),
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });
  console.log("  og-image.png");

  await browser.close();

  // ─── Summary ───

  console.log("\nAll assets generated in branding/output/:");
  const files = [
    ...FAVICON_SIZES.map((s) => `favicon-${s}.png`),
    "favicon.ico",
    "favicon.svg",
    "logo-512.png",
    "og-image.png",
  ];
  for (const f of files) {
    console.log(`  ${f}`);
  }

  console.log("\nNext steps:");
  console.log("  1. Copy favicon.ico and favicon.svg to public/");
  console.log("  2. Copy og-image.png to public/");
  console.log("  3. Update index.html with favicon and og:image links");
}

main().catch((err) => {
  console.error("Generation failed:", err);
  process.exit(1);
});
