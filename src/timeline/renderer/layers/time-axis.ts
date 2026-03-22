/**
 * Time axis — draws tick marks and year labels along the bottom of the timeline.
 *
 * When CE mode is enabled, draws TWO CE rows:
 *   1. Expanded Dune (blue) — 11,200 BG = 1960 CE → AG 0 = 13,160 CE
 *   2. Dune Encyclopedia (green) — 16,200 BG = 0 CE → AG 0 = 16,200 CE
 *
 * Each row gets its own "Today" marker showing where the current year falls.
 */

import type { RenderLayer, RenderContext } from "../types";
import { yearToPixel, getVisibleRange } from "../../camera";

// Colors
const EXPANDED_COLOR = "rgba(26, 107, 138, 0.6)";     // water blue
const EXPANDED_DIM = "rgba(26, 107, 138, 0.25)";
const EXPANDED_BRIGHT = "rgba(26, 107, 138, 0.8)";
const ENCYCLOPEDIA_COLOR = "rgba(42, 157, 110, 0.6)";  // teal green
const ENCYCLOPEDIA_DIM = "rgba(42, 157, 110, 0.25)";
const ENCYCLOPEDIA_BRIGHT = "rgba(42, 157, 110, 0.8)";

function getTickInterval(visibleYears: number): number {
  const intervals = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
  const target = visibleYears / 12;
  for (const interval of intervals) {
    if (interval >= target) return interval;
  }
  return 10000;
}

function formatAG(year: number): string {
  if (year < 0) return `${Math.abs(year).toLocaleString()} BG`;
  return `${year.toLocaleString()} AG`;
}

function formatCE(year: number): string {
  if (year < 0) return `${Math.abs(year).toLocaleString()} BCE`;
  return `${year.toLocaleString()} CE`;
}

export const timeAxisLayer: RenderLayer = {
  id: "time-axis",

  render(rc: RenderContext) {
    const { ctx, camera, viewport, theme, showCEAxis, ceAnchorExpanded, ceAnchorEncyclopedia } = rc;
    const { width, height } = viewport;

    // Layout: make room for CE rows when shown
    const ceRowsHeight = showCEAxis ? 32 : 0; // two rows of ~16px each
    const axisY = height - 30 - ceRowsHeight;

    // ─── AG Axis ───

    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, axisY);
    ctx.lineTo(width, axisY);
    ctx.stroke();

    const range = getVisibleRange(camera, width);
    const visibleYears = range.end - range.start;
    const interval = getTickInterval(visibleYears);
    const firstTick = Math.ceil(range.start / interval) * interval;

    ctx.font = "10px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    for (let year = firstTick; year <= range.end; year += interval) {
      const x = yearToPixel(year, camera, width);

      ctx.strokeStyle = theme.textMuted;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, axisY);
      ctx.lineTo(x, axisY + 6);
      ctx.stroke();

      ctx.fillStyle = theme.textSecondary;
      ctx.fillText(formatAG(year), x, axisY + 8);
    }

    if (!showCEAxis) return;

    // ─── CE Row 1: Expanded Dune (blue) ───

    const ce1Y = axisY + 22;
    drawCERow(ctx, camera, width, ce1Y, ceAnchorExpanded, firstTick, interval, range.end,
      EXPANDED_DIM, EXPANDED_COLOR, "Expanded");

    // ─── CE Row 2: Dune Encyclopedia (green) ───

    const ce2Y = ce1Y + 16;
    drawCERow(ctx, camera, width, ce2Y, ceAnchorEncyclopedia, firstTick, interval, range.end,
      ENCYCLOPEDIA_DIM, ENCYCLOPEDIA_COLOR, "Encyclopedia");

    // ─── "Today" markers for both systems ───

    const currentCEYear = new Date().getFullYear();
    drawTodayMarker(ctx, camera, width, height, axisY, ce1Y,
      currentCEYear, ceAnchorExpanded, EXPANDED_BRIGHT, "Expanded");
    drawTodayMarker(ctx, camera, width, height, axisY, ce2Y,
      currentCEYear, ceAnchorEncyclopedia, ENCYCLOPEDIA_BRIGHT, "Encyclopedia");
  },
};

/** Draw one CE axis row */
function drawCERow(
  ctx: CanvasRenderingContext2D,
  camera: { center: number; pixels_per_year: number },
  width: number,
  y: number,
  anchor: number,
  firstTick: number,
  interval: number,
  endYear: number,
  dimColor: string,
  labelColor: string,
  label: string,
) {
  // Axis line
  ctx.strokeStyle = dimColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();

  // Label at left edge
  ctx.font = "7px Inter, system-ui, sans-serif";
  ctx.fillStyle = labelColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 4, y);

  // Ticks and labels
  ctx.font = "9px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  for (let year = firstTick; year <= endYear; year += interval) {
    const x = yearToPixel(year, camera, width);
    const ceYear = year + anchor;

    ctx.strokeStyle = dimColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 4);
    ctx.stroke();

    ctx.fillStyle = labelColor;
    ctx.fillText(formatCE(ceYear), x, y + 5);
  }
}

/** Draw a "Today" marker for one CE system */
function drawTodayMarker(
  ctx: CanvasRenderingContext2D,
  camera: { center: number; pixels_per_year: number },
  width: number,
  height: number,
  agAxisY: number,
  ceRowY: number,
  currentCEYear: number,
  anchor: number,
  color: string,
  label: string,
) {
  const todayAG = currentCEYear - anchor;
  const todayX = yearToPixel(todayAG, camera, width);

  if (todayX < -50 || todayX > width + 50) return;

  // Dashed vertical line
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(todayX, 0);
  ctx.lineTo(todayX, height);
  ctx.stroke();
  ctx.setLineDash([]);

  // "TODAY" label above the AG axis
  ctx.font = "bold 8px Inter, system-ui, sans-serif";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(`TODAY (${label})`, todayX, agAxisY - 4);

  // Diamond on the CE row
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(todayX, ceRowY - 3);
  ctx.lineTo(todayX + 3, ceRowY);
  ctx.lineTo(todayX, ceRowY + 3);
  ctx.lineTo(todayX - 3, ceRowY);
  ctx.closePath();
  ctx.fill();

  // CE year below the diamond
  ctx.font = "7px Inter, system-ui, sans-serif";
  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  ctx.fillText(`${currentCEYear} CE`, todayX, ceRowY + 6);
}
