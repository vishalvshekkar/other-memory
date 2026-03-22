/**
 * Media bands layer — renders colored horizontal bands for movies and TV shows.
 * Positioned at the very bottom of the canvas, below CE rows.
 * Each band spans the AG date range that the adaptation covers.
 */

import type { RenderLayer, RenderContext, HitBox } from "../types";
import { yearToPixel } from "../../camera";

export let mediaHitBoxes: HitBox[] = [];

const BAND_HEIGHT = 14;
const BAND_GAP = 2;
const BAND_RADIUS = 2;

export const mediaBandsLayer: RenderLayer = {
  id: "media-bands",

  render(rc: RenderContext) {
    const { ctx, camera, viewport, showMediaBands, mediaEntries, showCEAxis } = rc;
    const { width, height } = viewport;

    if (!showMediaBands || mediaEntries.length === 0) {
      mediaHitBoxes = [];
      return;
    }

    const hitBoxes: HitBox[] = [];

    // Position: below CE rows (or AG axis if CE off)
    const ceRowsHeight = showCEAxis ? 32 : 0;
    const baseY = height - 30 - ceRowsHeight - mediaEntries.length * (BAND_HEIGHT + BAND_GAP);

    // Sort media by timeline_start for consistent ordering
    const sorted = [...mediaEntries].sort((a, b) => a.timeline_start - b.timeline_start);

    for (let i = 0; i < sorted.length; i++) {
      const media = sorted[i];
      const x1 = yearToPixel(media.timeline_start, camera, width);
      const x2 = yearToPixel(media.timeline_end, camera, width);

      // Ensure minimum width for point-like films
      const minWidth = 6;
      const bandX = Math.max(-5, Math.min(x1, x2));
      const rawWidth = Math.max(minWidth, Math.abs(x2 - x1));
      const bandW = Math.min(width + 10, rawWidth);

      // Cull
      if (bandX + bandW < 0 || bandX > width) continue;

      const y = baseY + i * (BAND_HEIGHT + BAND_GAP) + ceRowsHeight + 30;

      // Draw band
      ctx.fillStyle = hexToRgba(media.color, 0.6);
      ctx.beginPath();
      roundRect(ctx, bandX, y, bandW, BAND_HEIGHT, BAND_RADIUS);
      ctx.fill();

      // Left accent border
      ctx.fillStyle = media.color;
      ctx.fillRect(bandX, y, 2, BAND_HEIGHT);

      // Label
      if (bandW > 30) {
        ctx.font = "9px Inter, system-ui, sans-serif";
        ctx.fillStyle = "rgba(232, 224, 208, 0.8)";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const label = bandW > 120
          ? `${media.title} (${media.release_year})`
          : media.title;
        ctx.fillText(label, bandX + 6, y + BAND_HEIGHT / 2, bandW - 10);
      }

      // Type icon at right
      if (bandW > 80) {
        ctx.font = "7px Inter, system-ui, sans-serif";
        ctx.fillStyle = hexToRgba(media.color, 0.6);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        const typeLabel = media.type === "film" ? "FILM"
          : media.type === "tv-series" ? "TV"
          : "MINI";
        ctx.fillText(typeLabel, bandX + bandW - 4, y + BAND_HEIGHT / 2);
      }

      hitBoxes.push({
        eventId: `media:${media.id}`,
        x: bandX,
        y,
        width: bandW,
        height: BAND_HEIGHT,
      });
    }

    mediaHitBoxes = hitBoxes;
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
