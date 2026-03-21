/**
 * Layer 7: Hover/selection overlay
 *
 * Draws highlight effects around hovered and selected events.
 */

import type { RenderLayer, RenderContext } from "../types";
import { spanHitBoxes } from "./span-bars";
import { pointHitBoxes } from "./point-markers";
import type { HitBox } from "../types";

export const overlayLayer: RenderLayer = {
  id: "overlay",

  render(rc: RenderContext) {
    const { ctx, selectedEventId, hoveredEventId, theme } = rc;

    if (!selectedEventId && !hoveredEventId) return;

    const allBoxes: HitBox[] = [...pointHitBoxes, ...spanHitBoxes];

    for (const box of allBoxes) {
      const isSelected = box.eventId === selectedEventId;
      const isHovered = box.eventId === hoveredEventId && !isSelected;

      if (!isSelected && !isHovered) continue;

      if (isSelected) {
        // Bright glow ring
        ctx.strokeStyle = theme.accentSpice;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        roundRectStroke(
          ctx,
          box.x - 3,
          box.y - 3,
          box.width + 6,
          box.height + 6,
          5,
        );

        // Outer glow
        ctx.strokeStyle = `rgba(196, 132, 29, 0.2)`;
        ctx.lineWidth = 1;
        roundRectStroke(
          ctx,
          box.x - 6,
          box.y - 6,
          box.width + 12,
          box.height + 12,
          7,
        );
      } else if (isHovered) {
        // Subtle highlight
        ctx.strokeStyle = `rgba(232, 224, 208, 0.3)`;
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        roundRectStroke(
          ctx,
          box.x - 2,
          box.y - 2,
          box.width + 4,
          box.height + 4,
          4,
        );
      }
    }
  },
};

function roundRectStroke(
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
  ctx.stroke();
}
