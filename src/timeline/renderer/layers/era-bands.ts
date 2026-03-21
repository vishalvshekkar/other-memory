/**
 * Layer 1: Era background bands
 *
 * Renders eras as semi-transparent horizontal bands spanning their date range.
 * Nesting is expressed via opacity: deeper levels are slightly more opaque.
 */

import type { RenderLayer, RenderContext } from "../types";
import { yearToPixel } from "../../camera";

const NESTING_OPACITY = [0.03, 0.05, 0.08]; // opacity per nesting level
const LABEL_MIN_WIDTH_PX = 80; // minimum band width to show a label

export const eraBandsLayer: RenderLayer = {
  id: "era-bands",

  render(rc: RenderContext) {
    const { ctx, camera, viewport, data, theme } = rc;
    const { width, height } = viewport;

    // Sort eras by nesting level so parents draw first (behind children)
    const sortedEras = [...data.eras].sort(
      (a, b) => a.nesting_level - b.nesting_level,
    );

    for (const era of sortedEras) {
      const x1 = yearToPixel(era.date_start, camera, width);
      const x2 = yearToPixel(era.date_end, camera, width);

      // Cull: skip eras entirely outside viewport
      if (x2 < 0 || x1 > width) continue;

      const bandX = Math.max(0, x1);
      const bandW = Math.min(width, x2) - bandX;

      // Background band
      const opacity = NESTING_OPACITY[era.nesting_level] ?? 0.08;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fillRect(bandX, 0, bandW, height);

      // Left border line
      if (x1 >= 0 && x1 <= width) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, 0);
        ctx.lineTo(x1, height);
        ctx.stroke();
      }

      // Label (only if band is wide enough)
      if (bandW > LABEL_MIN_WIDTH_PX) {
        const fontSize = era.nesting_level === 0 ? 13 : 11;
        ctx.font = `${fontSize}px Cinzel, serif`;
        ctx.fillStyle = theme.textMuted;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        const labelX = bandX + bandW / 2;
        const labelY = 8 + era.nesting_level * 18;

        ctx.fillText(era.title, labelX, labelY, bandW - 16);
      }
    }
  },
};
