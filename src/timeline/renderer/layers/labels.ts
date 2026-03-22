/**
 * Layer 6: Labels
 *
 * Renders event titles next to their markers/bars. Uses collision detection
 * to avoid overlapping labels — a greedy placement algorithm marks bounding
 * boxes and skips labels that would collide.
 */

import type { RenderLayer, RenderContext } from "../types";
import type { TimelineEvent } from "@/types";
import { yearToPixel } from "../../camera";
import { getMinSignificance, shouldShowEvent } from "../../zoom";
import { pointYPositions } from "./point-markers";

/** Bounding box for label collision detection */
interface LabelBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const LABEL_LINE_HEIGHT = 16;
const LABEL_PADDING = 8;

export const labelsLayer: RenderLayer = {
  id: "labels",

  render(rc: RenderContext) {
    const { ctx, camera, viewport, data, theme, contextualEventIds } = rc;
    const { width } = viewport;
    const minSig = getMinSignificance(camera.pixels_per_year);

    // Only show labels at zoom tier 3+ (significance 3 or lower = more zoomed in)
    if (minSig > 3) return;

    const placed: LabelBox[] = [];

    // Sort events by significance descending so important ones get labels first
    const labelCandidates = data.events
      .filter(
        (e) =>
          (e.type === "point" || e.type === "milestone") &&
          shouldShowEvent(e, camera.pixels_per_year),
      )
      .sort((a, b) => b.significance - a.significance);

    for (const event of labelCandidates) {
      const x = yearToPixel(event.date_start, camera, width);

      // Cull
      if (x < -100 || x > width + 100) continue;

      const isContextual = contextualEventIds.has(event.id);
      if (isContextual && minSig > 1) continue; // skip dimmed labels unless very zoomed in

      const fontSize = event.significance >= 4 ? 12 : 11;
      ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;

      const text = event.title;
      const metrics = ctx.measureText(text);
      const labelWidth = metrics.width;
      const labelHeight = LABEL_LINE_HEIGHT;

      // Position label centered below the marker (follows stacked marker Y)
      const markerY = pointYPositions.get(event.id) ?? 250;
      const labelX = x - labelWidth / 2;
      const labelY = markerY + 20 + (event.significance >= 4 ? 0 : LABEL_LINE_HEIGHT);

      const box: LabelBox = {
        x: labelX - LABEL_PADDING / 2,
        y: labelY - 2,
        width: labelWidth + LABEL_PADDING,
        height: labelHeight + 4,
      };

      // Check collision with already placed labels
      if (collides(box, placed)) continue;

      placed.push(box);

      // Draw label
      const alpha = isContextual ? 0.3 : 0.85;
      ctx.fillStyle = event.significance >= 4
        ? rgbaStr(theme.textPrimary, alpha)
        : rgbaStr(theme.textSecondary, alpha);
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(text, x, labelY);

      // Date subtitle for high-significance events at sufficient zoom
      if (event.significance >= 4 && camera.pixels_per_year > 0.3) {
        ctx.font = "10px Inter, system-ui, sans-serif";
        ctx.fillStyle = rgbaStr(theme.textMuted, alpha);
        drawDateLabel(ctx, event, x, labelY + LABEL_LINE_HEIGHT);
      }
    }
  },
};

function drawDateLabel(
  ctx: CanvasRenderingContext2D,
  event: TimelineEvent,
  x: number,
  y: number,
) {
  const year = event.date_start;
  const text = year < 0 ? `${Math.abs(year)} BG` : `${year} AG`;
  ctx.fillText(text, x, y);
}

function collides(box: LabelBox, placed: LabelBox[]): boolean {
  for (const p of placed) {
    if (
      box.x < p.x + p.width &&
      box.x + box.width > p.x &&
      box.y < p.y + p.height &&
      box.y + box.height > p.y
    ) {
      return true;
    }
  }
  return false;
}

function rgbaStr(hexOrNamed: string, alpha: number): string {
  // Handle hex colors
  if (hexOrNamed.startsWith("#")) {
    const r = parseInt(hexOrNamed.slice(1, 3), 16);
    const g = parseInt(hexOrNamed.slice(3, 5), 16);
    const b = parseInt(hexOrNamed.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hexOrNamed;
}
