/**
 * Media bands layer — renders colored horizontal bands for movies and TV shows.
 * Positioned in a dedicated zone BELOW the book events/arcs area and ABOVE
 * the density heatmap and time axis. Visually separated from book content.
 * Bands are strictly clipped to their AG date range.
 */

import type { RenderLayer, RenderContext, HitBox } from "../types";
import { yearToPixel } from "../../camera";

export let mediaHitBoxes: HitBox[] = [];

const BAND_HEIGHT = 14;
const BAND_GAP = 2;
const BAND_RADIUS = 2;
const SECTION_LABEL_HEIGHT = 14;
const SECTION_GAP = 8; // space above the section separator

export const mediaBandsLayer: RenderLayer = {
  id: "media-bands",

  render(rc: RenderContext) {
    const { ctx, camera, viewport, showMediaBands, mediaEntries } = rc;
    const { width, height } = viewport;

    if (!showMediaBands || mediaEntries.length === 0) {
      mediaHitBoxes = [];
      return;
    }

    const hitBoxes: HitBox[] = [];

    // Position: above the bottom area (heatmap + axis + CE), below book content
    const totalBandsHeight = mediaEntries.length * (BAND_HEIGHT + BAND_GAP);
    const sectionTop = height - rc.bottomAreaHeight - 10 - totalBandsHeight - SECTION_LABEL_HEIGHT - SECTION_GAP;

    // Separator line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, sectionTop);
    ctx.lineTo(width, sectionTop);
    ctx.stroke();

    // Section label
    ctx.font = "7px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(138, 128, 112, 0.35)";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("SCREEN ADAPTATIONS", 4, sectionTop + 4);

    const bandsStartY = sectionTop + SECTION_LABEL_HEIGHT + 2;

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

      // For point-like entries (film at a single year), use a small width
      if (bandW < 3) bandW = 3;

      const y = bandsStartY + i * (BAND_HEIGHT + BAND_GAP);

      // Draw band
      ctx.fillStyle = hexToRgba(media.color, 0.45);
      ctx.beginPath();
      roundRect(ctx, bandX, y, bandW, BAND_HEIGHT, BAND_RADIUS);
      ctx.fill();

      // Left accent border (only if left edge is visible)
      if (leftEdge >= 0 && leftEdge <= width) {
        ctx.fillStyle = media.color;
        ctx.fillRect(leftEdge, y, 2, BAND_HEIGHT);
      }

      // Sprocket holes for both films and TV (unified visual language)
      ctx.fillStyle = hexToRgba("#0a0a0f", 0.4);
      const spacing = 8;
      for (let sx = bandX + 4; sx < bandX + bandW - 2; sx += spacing) {
        ctx.fillRect(sx, y + 1, 2, 2);
        ctx.fillRect(sx, y + BAND_HEIGHT - 3, 2, 2);
      }

      // Label
      if (bandW > 40) {
        ctx.font = "9px Inter, system-ui, sans-serif";
        ctx.fillStyle = "rgba(232, 224, 208, 0.8)";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const label = bandW > 140
          ? `${media.title} (${media.release_year})`
          : media.title;
        ctx.fillText(label, bandX + 6, y + BAND_HEIGHT / 2, bandW - 10);
      }

      // Type badge at right
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
