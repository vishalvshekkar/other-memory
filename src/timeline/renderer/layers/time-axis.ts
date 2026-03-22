/**
 * Time axis — draws tick marks and year labels along the bottom of the timeline.
 * Adapts tick spacing based on zoom level.
 *
 * When CE mode is enabled, draws a second axis row in water-blue showing
 * real-world Common Era years, plus a "Today" vertical marker line.
 */

import type { RenderLayer, RenderContext } from "../types";
import { yearToPixel, getVisibleRange } from "../../camera";

/** Pick a nice round tick interval based on the visible year range */
function getTickInterval(visibleYears: number): number {
  const intervals = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
  const target = visibleYears / 12;
  for (const interval of intervals) {
    if (interval >= target) return interval;
  }
  return 10000;
}

/** Format an AG year for display */
function formatAG(year: number): string {
  if (year < 0) return `${Math.abs(year).toLocaleString()} BG`;
  return `${year.toLocaleString()} AG`;
}

/** Format a CE year for display */
function formatCE(year: number): string {
  if (year < 0) return `${Math.abs(year).toLocaleString()} BCE`;
  return `${year.toLocaleString()} CE`;
}

export const timeAxisLayer: RenderLayer = {
  id: "time-axis",

  render(rc: RenderContext) {
    const { ctx, camera, viewport, theme, showCEAxis, agZeroCEYear } = rc;
    const { width, height } = viewport;

    // Layout: AG axis sits higher when CE is shown to make room
    const ceRowHeight = showCEAxis ? 16 : 0;
    const axisY = height - 30 - ceRowHeight;

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

      // Tick mark
      ctx.strokeStyle = theme.textMuted;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, axisY);
      ctx.lineTo(x, axisY + 6);
      ctx.stroke();

      // AG year label
      ctx.fillStyle = theme.textSecondary;
      ctx.fillText(formatAG(year), x, axisY + 8);
    }

    // ─── CE Axis (when toggled on) ───

    if (showCEAxis) {
      const ceAxisY = axisY + 22;

      // CE axis line in water blue
      ctx.strokeStyle = "rgba(26, 107, 138, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, ceAxisY);
      ctx.lineTo(width, ceAxisY);
      ctx.stroke();

      // CE ticks — use the same interval, just convert AG→CE
      ctx.font = "9px Inter, system-ui, sans-serif";
      ctx.textBaseline = "top";

      for (let year = firstTick; year <= range.end; year += interval) {
        const x = yearToPixel(year, camera, width);
        const ceYear = year + agZeroCEYear;

        // Tick
        ctx.strokeStyle = "rgba(26, 107, 138, 0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, ceAxisY);
        ctx.lineTo(x, ceAxisY + 4);
        ctx.stroke();

        // CE label
        ctx.fillStyle = "rgba(26, 107, 138, 0.6)";
        ctx.fillText(formatCE(ceYear), x, ceAxisY + 6);
      }

      // ─── "Today" marker ───

      const currentCEYear = new Date().getFullYear();
      const todayAG = currentCEYear - agZeroCEYear;
      const todayX = yearToPixel(todayAG, camera, width);

      // Only draw if today is within or near the visible range
      if (todayX >= -50 && todayX <= width + 50) {
        // Vertical line
        ctx.strokeStyle = "rgba(26, 107, 138, 0.5)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(todayX, 0);
        ctx.lineTo(todayX, height);
        ctx.stroke();
        ctx.setLineDash([]);

        // "Today" label
        ctx.font = "bold 9px Inter, system-ui, sans-serif";
        ctx.fillStyle = theme.accentWater;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText("TODAY", todayX, axisY - 4);

        // Year badge
        ctx.font = "8px Inter, system-ui, sans-serif";
        ctx.fillStyle = "rgba(26, 107, 138, 0.7)";
        ctx.textBaseline = "top";
        ctx.fillText(`${currentCEYear} CE`, todayX, ceAxisY + 6);

        // Small diamond marker at the axis intersection
        ctx.fillStyle = theme.accentWater;
        ctx.beginPath();
        ctx.moveTo(todayX, ceAxisY - 3);
        ctx.lineTo(todayX + 3, ceAxisY);
        ctx.lineTo(todayX, ceAxisY + 3);
        ctx.lineTo(todayX - 3, ceAxisY);
        ctx.closePath();
        ctx.fill();
      }
    }
  },
};
