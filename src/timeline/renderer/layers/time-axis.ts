/**
 * Time axis — draws tick marks and year labels along the bottom of the timeline.
 * Adapts tick spacing based on zoom level.
 */

import type { RenderLayer, RenderContext } from "../types";
import { yearToPixel, getVisibleRange } from "../../camera";

/** Pick a nice round tick interval based on the visible year range */
function getTickInterval(visibleYears: number): number {
  const intervals = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
  // Target ~8-15 ticks on screen
  const target = visibleYears / 12;
  for (const interval of intervals) {
    if (interval >= target) return interval;
  }
  return 10000;
}

export const timeAxisLayer: RenderLayer = {
  id: "time-axis",

  render(rc: RenderContext) {
    const { ctx, camera, viewport, theme } = rc;
    const { width, height } = viewport;
    const axisY = height - 30;

    // Axis line
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, axisY);
    ctx.lineTo(width, axisY);
    ctx.stroke();

    const range = getVisibleRange(camera, width);
    const visibleYears = range.end - range.start;
    const interval = getTickInterval(visibleYears);

    // First tick at the nearest round interval
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

      // Year label
      ctx.fillStyle = theme.textSecondary;
      const label = year < 0 ? `${Math.abs(year)} BG` : `${year} AG`;
      ctx.fillText(label, x, axisY + 10);
    }
  },
};
