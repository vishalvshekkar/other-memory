/**
 * Layer 5: Arc connection lines
 *
 * Draws curved Bezier lines connecting events that form narrative arcs.
 * Each arc gets a distinct color and a label at its midpoint.
 */

import type { RenderLayer, RenderContext } from "../types";
import { yearToPixel } from "../../camera";

const ARC_Y = 230; // slightly above point markers
const ARC_CURVE_HEIGHT = 40;

export const arcLinesLayer: RenderLayer = {
  id: "arc-lines",

  render(rc: RenderContext) {
    const { ctx, camera, viewport, data, theme } = rc;
    const { width } = viewport;

    for (const arc of data.arcs) {
      if (!arc.arc_events || arc.arc_events.length < 2) continue;

      // Resolve arc event positions
      const positions: { x: number; year: number; title: string }[] = [];
      for (const eventId of arc.arc_events) {
        const event = data.eventsById.get(eventId);
        if (!event) continue;
        const x = yearToPixel(event.date_start, camera, width);
        positions.push({ x, year: event.date_start, title: event.title });
      }

      if (positions.length < 2) continue;

      // Check if any part of the arc is visible
      const minX = Math.min(...positions.map((p) => p.x));
      const maxX = Math.max(...positions.map((p) => p.x));
      if (maxX < -100 || minX > width + 100) continue;

      // Don't draw arcs if all points are too close together (< 3px)
      if (maxX - minX < 3) continue;

      const color = arc.color ?? theme.categories[arc.category] ?? theme.accentSpice;

      // Draw connecting line through all points using quadratic curves
      ctx.strokeStyle = hexToRgba(color, 0.3);
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();

      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        const y = ARC_Y;

        if (i === 0) {
          ctx.moveTo(pos.x, y);
        } else {
          const prev = positions[i - 1];
          const cpX = (prev.x + pos.x) / 2;
          const cpY = y - ARC_CURVE_HEIGHT;
          ctx.quadraticCurveTo(cpX, cpY, pos.x, y);
        }
      }

      ctx.stroke();
      ctx.setLineDash([]);

      // Draw dots at each arc event position
      for (const pos of positions) {
        if (pos.x < -10 || pos.x > width + 10) continue;
        ctx.beginPath();
        ctx.arc(pos.x, ARC_Y, 3, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(color, 0.5);
        ctx.fill();
      }

      // Label at midpoint (only if the arc spans enough pixels)
      if (maxX - minX > 100) {
        const midX = (minX + maxX) / 2;
        if (midX > 0 && midX < width) {
          ctx.font = "9px Inter, system-ui, sans-serif";
          ctx.fillStyle = hexToRgba(color, 0.4);
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(arc.title, midX, ARC_Y + 6);
        }
      }
    }
  },
};

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
