/**
 * Layer 4: Point and milestone markers
 *
 * Renders point events as circles and milestones as diamond/flag shapes.
 * Size scales with significance level.
 */

import type { RenderLayer, RenderContext, HitBox } from "../types";
import { yearToPixel } from "../../camera";
import { shouldShowEvent } from "../../zoom";

/** Exported hit boxes for click/hover detection */
export let pointHitBoxes: HitBox[] = [];

/** Exported Y positions per event so the labels layer can align */
export let pointYPositions: Map<string, number> = new Map();

/** Vertical center line for point events */
const POINT_Y_CENTER = 250;
const MIN_SPACING = 24; // minimum horizontal px before markers stack
const LANE_OFFSET = 26; // vertical px between stacked lanes

/** Size range based on significance */
const SIG_RADIUS: Record<number, number> = {
  1: 3,
  2: 4,
  3: 6,
  4: 8,
  5: 10,
};

export const pointMarkersLayer: RenderLayer = {
  id: "point-markers",

  render(rc: RenderContext) {
    const { ctx, camera, viewport, data, theme, contextualEventIds, selectedEventId, hoveredEventId } = rc;
    const { width } = viewport;
    const hitBoxes: HitBox[] = [];
    const yPositions = new Map<string, number>();

    // Filter to visible point and milestone events
    const points = data.events.filter(
      (e) =>
        (e.type === "point" || e.type === "milestone") &&
        shouldShowEvent(e, camera.pixels_per_year),
    );

    // Pre-calculate pixel X and sort for sweep-line lane assignment
    const positioned = points.map((event) => ({
      event,
      x: yearToPixel(event.date_start, camera, width),
    }));
    positioned.sort((a, b) => a.x - b.x);

    // Assign vertical lanes so co-located markers stack instead of overlapping
    const laneEnds: number[] = []; // rightmost occupied X per lane

    for (const { event, x } of positioned) {
      // Cull
      if (x < -20 || x > width + 20) continue;

      const radius = SIG_RADIUS[event.significance] ?? 5;

      // Find first lane with enough horizontal clearance
      let lane = 0;
      while (lane < laneEnds.length && x < laneEnds[lane] + MIN_SPACING) {
        lane++;
      }
      while (laneEnds.length <= lane) laneEnds.push(-Infinity);
      laneEnds[lane] = x + radius;

      const isContextual = contextualEventIds.has(event.id);
      const isSelected = event.id === selectedEventId;
      const isHovered = event.id === hoveredEventId;
      const alpha = isContextual ? 0.3 : 1.0;
      const color = event.color ?? theme.categories[event.category] ?? theme.accentSpice;

      const y = POINT_Y_CENTER + lane * LANE_OFFSET;
      yPositions.set(event.id, y);

      if (event.type === "milestone") {
        drawMilestone(ctx, x, y, radius, color, alpha, isSelected, isHovered);
      } else {
        drawPoint(ctx, x, y, radius, color, alpha, isSelected, isHovered);
      }

      const hitSize = Math.max(radius * 2, 16);
      hitBoxes.push({
        eventId: event.id,
        x: x - hitSize / 2,
        y: y - hitSize / 2,
        width: hitSize,
        height: hitSize,
      });
    }

    pointHitBoxes = hitBoxes;
    pointYPositions = yPositions;
  },
};

function drawPoint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha: number,
  isSelected: boolean,
  isHovered: boolean,
) {
  // Glow effect for selected/hovered
  if (isSelected || isHovered) {
    ctx.beginPath();
    ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(color, isSelected ? 0.3 : 0.15);
    ctx.fill();
  }

  // Outer ring
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(color, alpha);
  ctx.fill();

  // Inner dot
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba("#0a0a0f", alpha);
  ctx.fill();
}

function drawMilestone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha: number,
  isSelected: boolean,
  isHovered: boolean,
) {
  const size = radius * 1.4;

  // Glow
  if (isSelected || isHovered) {
    ctx.beginPath();
    ctx.arc(x, y, size + 6, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(color, isSelected ? 0.3 : 0.15);
    ctx.fill();
  }

  // Diamond shape
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size, y);
  ctx.closePath();
  ctx.fillStyle = hexToRgba(color, alpha);
  ctx.fill();

  // Stem line going up
  ctx.strokeStyle = hexToRgba(color, alpha * 0.5);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y - size - 20);
  ctx.stroke();
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
