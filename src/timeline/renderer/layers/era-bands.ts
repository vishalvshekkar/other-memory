/**
 * Layer 1: Era background bands
 *
 * Renders eras as semi-transparent horizontal bands spanning their date range.
 * Nesting is expressed via opacity: deeper levels are slightly more opaque.
 * Overlapping eras are stacked vertically so labels never collide.
 */

import type { RenderLayer, RenderContext } from "../types";
import type { EraEvent } from "@/types";
import { yearToPixel } from "../../camera";

const NESTING_OPACITY = [0.03, 0.05, 0.08]; // opacity per nesting level
const LABEL_MIN_WIDTH_PX = 80; // minimum band width to show a label
const ROW_HEIGHT = 18; // vertical spacing per label row
const LABEL_TOP = 8; // top padding for the first row

/**
 * Assign each era a visual row so that overlapping eras stack vertically.
 * Wider parent eras get earlier (higher) rows; children start below their parent.
 */
function assignEraRows(eras: EraEvent[]): Map<string, number> {
  const sorted = [...eras].sort((a, b) => {
    if (a.nesting_level !== b.nesting_level) return a.nesting_level - b.nesting_level;
    if (a.date_start !== b.date_start) return a.date_start - b.date_start;
    // Wider eras first so they claim earlier rows
    return (b.date_end - b.date_start) - (a.date_end - a.date_start);
  });

  const rows = new Map<string, number>();
  const rowEnds: number[] = []; // latest date_end occupying each row

  for (const era of sorted) {
    const minRow = era.parent_era ? (rows.get(era.parent_era) ?? 0) + 1 : 0;

    let row = minRow;
    while (row < rowEnds.length && rowEnds[row] > era.date_start) {
      row++;
    }

    rows.set(era.id, row);
    while (rowEnds.length <= row) rowEnds.push(-Infinity);
    rowEnds[row] = Math.max(rowEnds[row], era.date_end);
  }

  return rows;
}

export const eraBandsLayer: RenderLayer = {
  id: "era-bands",

  render(rc: RenderContext) {
    const { ctx, camera, viewport, data, theme } = rc;
    const { width, height } = viewport;

    const eraRows = assignEraRows(data.eras);

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
        const row = eraRows.get(era.id) ?? era.nesting_level;
        const labelY = LABEL_TOP + row * ROW_HEIGHT;

        ctx.fillText(era.title, labelX, labelY, bandW - 16);
      }
    }
  },
};
