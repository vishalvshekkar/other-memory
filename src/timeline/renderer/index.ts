/**
 * Render orchestrator — manages the layer stack and draws the timeline.
 *
 * For MVP: single canvas, full redraw every frame.
 * Future: split into background/content/overlay canvases for selective redraw.
 */

import type { RenderContext, RenderLayer } from "./types";
import { eraBandsLayer } from "./layers/era-bands";
import { densityHeatmapLayer } from "./layers/density-heatmap";
import { spanBarsLayer } from "./layers/span-bars";
import { pointMarkersLayer } from "./layers/point-markers";
import { arcLinesLayer } from "./layers/arc-lines";
import { labelsLayer } from "./layers/labels";
import { timeAxisLayer } from "./layers/time-axis";
import { mediaBandsLayer } from "./layers/media-bands";
import { overlayLayer } from "./layers/overlay";

/** The ordered layer stack — drawn bottom to top */
const layers: RenderLayer[] = [
  eraBandsLayer,        // Layer 1: Era background bands
  densityHeatmapLayer,  // Layer 2: Density heatmap
  spanBarsLayer,        // Layer 3: Span bars
  pointMarkersLayer,    // Layer 4: Point/milestone markers
  arcLinesLayer,        // Layer 5: Arc connection lines
  labelsLayer,          // Layer 6: Labels
  timeAxisLayer,        // Time axis (always present)
  mediaBandsLayer,      // Media bands (movies/TV shows)
  overlayLayer,         // Layer 7: Hover/selection overlay
];

/** Render the full timeline */
export function renderTimeline(rc: RenderContext): void {
  const { ctx, viewport, theme } = rc;

  // Clear canvas
  ctx.fillStyle = theme.bgPrimary;
  ctx.fillRect(0, 0, viewport.width, viewport.height);

  // Render each layer in order
  for (const layer of layers) {
    ctx.save();
    layer.render(rc);
    ctx.restore();
  }
}
