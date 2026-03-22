/**
 * Media bands layer — renders colored horizontal bands for movies and TV shows.
 * Positioned at the TOP of the canvas, just below the header area.
 * Each band spans the AG date range that the adaptation covers.
 * Bands are strictly clipped to their AG range — if out of view, they disappear.
 */

import type { RenderLayer, RenderContext, HitBox } from "../types";
import { yearToPixel } from "../../camera";

export let mediaHitBoxes: HitBox[] = [];

const BAND_HEIGHT = 14;
const BAND_GAP = 2;
const BAND_RADIUS = 2;
const TOP_OFFSET = 4; // gap below the top of the canvas
const LABEL_HEIGHT = 12; // "SCREEN ADAPTATIONS" label

export const mediaBandsLayer: RenderLayer = {
  id: "media-bands",

  render(rc: RenderContext) {
    const { ctx, camera, viewport, showMediaBands, mediaEntries } = rc;
    const { width } = viewport;

    if (!showMediaBands || mediaEntries.length === 0) {
      mediaHitBoxes = [];
      return;
    }

    const hitBoxes: HitBox[] = [];

    // Section label
    ctx.font = "7px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(138, 128, 112, 0.4)";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("SCREEN ADAPTATIONS", 4, TOP_OFFSET);

    // Sort media by timeline_start for consistent ordering
    const sorted = [...mediaEntries].sort((a, b) => a.timeline_start - b.timeline_start);

    for (let i = 0; i < sorted.length; i++) {
      const media = sorted[i];
      const x1 = yearToPixel(media.timeline_start, camera, width);
      const x2 = yearToPixel(media.timeline_end, camera, width);

      // Strict culling — if the band's AG range is entirely off-screen, skip it
      const leftEdge = Math.min(x1, x2);
      const rightEdge = Math.max(x1, x2);
      if (rightEdge < 0 || leftEdge > width) continue;

      // Clip to viewport
      const bandX = Math.max(0, leftEdge);
      const bandRight = Math.min(width, rightEdge);
      let bandW = bandRight - bandX;

      // For point-like entries (film covering a single year), use a small
      // but proportional width — only if the point is actually on screen
      if (bandW < 3) bandW = 3;

      const y = TOP_OFFSET + LABEL_HEIGHT + i * (BAND_HEIGHT + BAND_GAP);

      // Draw band
      ctx.fillStyle = hexToRgba(media.color, 0.5);
      ctx.beginPath();
      roundRect(ctx, bandX, y, bandW, BAND_HEIGHT, BAND_RADIUS);
      ctx.fill();

      // Left accent border (only if left edge is visible)
      if (leftEdge >= 0 && leftEdge <= width) {
        ctx.fillStyle = media.color;
        ctx.fillRect(leftEdge, y, 2, BAND_HEIGHT);
      }

      // Visual distinction: film gets sprocket-hole dots, TV gets dashed top border
      if (media.type === "film") {
        // Sprocket holes along top edge
        ctx.fillStyle = hexToRgba("#0a0a0f", 0.5);
        const spacing = 8;
        for (let sx = bandX + 4; sx < bandX + bandW - 2; sx += spacing) {
          ctx.fillRect(sx, y + 1, 2, 2);
          ctx.fillRect(sx, y + BAND_HEIGHT - 3, 2, 2);
        }
      } else {
        // TV: thin dashed top line
        ctx.strokeStyle = hexToRgba(media.color, 0.8);
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(bandX, y);
        ctx.lineTo(bandX + bandW, y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Label (only if band is wide enough to show text)
      if (bandW > 40) {
        ctx.font = "9px Inter, system-ui, sans-serif";
        ctx.fillStyle = "rgba(232, 224, 208, 0.85)";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const label = bandW > 140
          ? `${media.title} (${media.release_year})`
          : media.title;
        ctx.fillText(label, bandX + 6, y + BAND_HEIGHT / 2, bandW - 10);
      }

      // Type badge at right (only if plenty of space)
      if (bandW > 100) {
        ctx.font = "7px Inter, system-ui, sans-serif";
        ctx.fillStyle = hexToRgba(media.color, 0.5);
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
