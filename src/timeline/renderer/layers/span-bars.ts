/**
 * Layer 3: Span bars
 *
 * Renders events with type "span" as horizontal bars. Uses a greedy sweep-line
 * algorithm to auto-assign lanes and prevent visual overlap.
 */

import type { RenderLayer, RenderContext, HitBox } from "../types";
import type { TimelineEvent } from "@/types";
import { yearToPixel } from "../../camera";
import { getMinSignificance } from "../../zoom";

/** Lane assignment state for overlap prevention */
interface LaneEnd {
  lane: number;
  endPixel: number;
}

/** Exported hit boxes for click/hover detection */
export let spanHitBoxes: HitBox[] = [];

const BAR_HEIGHT = 20;
const BAR_GAP = 4;
const BAR_Y_OFFSET = 100; // vertical offset from top (below era labels)
const BAR_RADIUS = 3;

export const spanBarsLayer: RenderLayer = {
  id: "span-bars",

  render(rc: RenderContext) {
    const { ctx, camera, viewport, data, theme, contextualEventIds } = rc;
    const { width } = viewport;
    const minSig = getMinSignificance(camera.pixels_per_year);
    const hitBoxes: HitBox[] = [];

    // Filter to visible span events
    const spans = data.events.filter(
      (e): e is TimelineEvent & { date_end: number } =>
        e.type === "span" &&
        e.date_end !== undefined &&
        e.significance >= minSig,
    );

    // Sort by start date for sweep-line
    spans.sort((a, b) => a.date_start - b.date_start);

    // Greedy lane assignment
    const lanes: LaneEnd[] = [];

    for (const span of spans) {
      const x1 = yearToPixel(span.date_start, camera, width);
      const x2 = yearToPixel(span.date_end, camera, width);

      // Cull
      if (x2 < -50 || x1 > width + 50) continue;

      const barX = Math.max(-5, x1);
      const barW = Math.max(4, Math.min(width + 10, x2) - barX);

      // Find the lowest available lane
      let assignedLane = 0;
      let foundLane = false;
      for (const le of lanes) {
        if (x1 >= le.endPixel + 4) {
          assignedLane = le.lane;
          le.endPixel = x2;
          foundLane = true;
          break;
        }
      }
      if (!foundLane) {
        assignedLane = lanes.length;
        lanes.push({ lane: assignedLane, endPixel: x2 });
      }

      const y = BAR_Y_OFFSET + assignedLane * (BAR_HEIGHT + BAR_GAP);
      const isContextual = contextualEventIds.has(span.id);
      const alpha = isContextual ? 0.3 : 0.85;
      const color = span.color ?? theme.categories[span.category] ?? theme.accentSpice;

      // Draw rounded bar
      ctx.fillStyle = hexToRgba(color, alpha);
      roundRect(ctx, barX, y, barW, BAR_HEIGHT, BAR_RADIUS);
      ctx.fill();

      // Label inside bar if wide enough
      if (barW > 60) {
        ctx.font = "11px Inter, system-ui, sans-serif";
        ctx.fillStyle = isContextual
          ? `rgba(232, 224, 208, 0.3)`
          : `rgba(232, 224, 208, 0.9)`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(span.title, barX + 6, y + BAR_HEIGHT / 2, barW - 12);
      }

      hitBoxes.push({ eventId: span.id, x: barX, y, width: barW, height: BAR_HEIGHT });
    }

    spanHitBoxes = hitBoxes;
  },
};

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
