/**
 * Layer 2: Density heatmap
 *
 * Renders a subtle gradient strip along the bottom of the timeline showing
 * event density. Brighter = more events. This is the "hotspot" indicator
 * that's always visible at all zoom levels.
 */

import type { RenderLayer, RenderContext } from "../types";
import type { DensityBucket } from "@/types";
import { yearToPixel } from "../../camera";
import { computeDensity } from "../../density";
import { getTimelineBounds } from "@/data/loader";

let cachedBuckets: DensityBucket[] | null = null;
let cachedEventCount = -1;

export const densityHeatmapLayer: RenderLayer = {
  id: "density-heatmap",

  render(rc: RenderContext) {
    const { ctx, camera, viewport, data } = rc;
    const { width, height } = viewport;

    // Recompute density only when event count changes
    if (cachedBuckets === null || cachedEventCount !== data.events.length) {
      const bounds = getTimelineBounds(data);
      cachedBuckets = computeDensity(data.events, bounds.min, bounds.max);
      cachedEventCount = data.events.length;
    }

    if (cachedBuckets.length === 0) return;

    const stripHeight = 4;
    const stripY = height - rc.bottomAreaHeight - 6; // sits above the entire bottom area

    for (const bucket of cachedBuckets) {
      if (bucket.normalized === 0) continue;

      const x1 = yearToPixel(bucket.year_start, camera, width);
      const x2 = yearToPixel(bucket.year_end, camera, width);

      // Cull
      if (x2 < 0 || x1 > width) continue;

      const bx = Math.max(0, x1);
      const bw = Math.max(1, Math.min(width, x2) - bx);

      // Parse spice color for rgba
      const alpha = bucket.normalized * 0.6; // max 60% opacity
      ctx.fillStyle = `rgba(196, 132, 29, ${alpha})`; // spice orange
      ctx.fillRect(bx, stripY, bw, stripHeight);
    }
  },
};
