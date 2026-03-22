import type { ZoomTier, ZoomTierConfig } from "@/types";

/**
 * Zoom tier definitions. The timeline operates on continuous zoom, but behavior
 * changes at tier boundaries (what significance level is visible, label density, etc.)
 *
 * pixels_per_year ranges are calibrated so that:
 * - Tier 1 shows ~35,000 years on a 1920px screen → ~0.05 ppy
 * - Tier 6 shows ~2 years on a 1920px screen → ~960 ppy
 */
export const ZOOM_TIERS: ZoomTierConfig[] = [
  { tier: 1, label: "Full Timeline",  min_ppy: 0,      max_ppy: 0.1,    min_significance: 5 },
  { tier: 2, label: "Millennia",      min_ppy: 0.1,    max_ppy: 0.5,    min_significance: 4 },
  { tier: 3, label: "Centuries",      min_ppy: 0.5,    max_ppy: 5,      min_significance: 3 },
  { tier: 4, label: "Decades",        min_ppy: 5,      max_ppy: 50,     min_significance: 2 },
  { tier: 5, label: "Years",          min_ppy: 50,     max_ppy: 500,    min_significance: 1 },
  { tier: 6, label: "Months/Days",    min_ppy: 500,    max_ppy: Infinity, min_significance: 1 },
];

/** Get the current zoom tier for a given pixels-per-year */
export function getZoomTier(ppy: number): ZoomTier {
  for (const tier of ZOOM_TIERS) {
    if (ppy >= tier.min_ppy && ppy < tier.max_ppy) {
      return tier.tier;
    }
  }
  return 6; // fallback to most zoomed in
}

/** Get the tier config for a given tier number */
export function getZoomTierConfig(tier: ZoomTier): ZoomTierConfig {
  return ZOOM_TIERS[tier - 1];
}

/** Get the minimum significance that should be visible at the current zoom level */
export function getMinSignificance(ppy: number): 1 | 2 | 3 | 4 | 5 {
  const tier = getZoomTier(ppy);
  return getZoomTierConfig(tier).min_significance;
}

/** Get a representative pixels-per-year value for a tier (geometric midpoint) */
export function getTierPixelsPerYear(tier: ZoomTier): number {
  const config = getZoomTierConfig(tier);
  const min = Math.max(config.min_ppy, 0.01); // avoid 0
  const max = config.max_ppy === Infinity ? min * 10 : config.max_ppy;
  return Math.sqrt(min * max); // geometric mean
}

/**
 * Check if an event should be visible at the current zoom level.
 *
 * Uses the standard significance threshold, with an escape hatch for
 * duration events: if a span would render wider than `minVisualPx`,
 * it stays visible regardless of significance.
 */
export function shouldShowEvent(
  event: { significance: number; date_start: number; date_end?: number },
  ppy: number,
  minVisualPx: number = 40,
): boolean {
  const minSig = getMinSignificance(ppy);
  if (event.significance >= minSig) return true;
  // Duration events stay visible if they'd occupy meaningful screen space
  if (event.date_end !== undefined) {
    const pixelWidth = (event.date_end - event.date_start) * ppy;
    return pixelWidth >= minVisualPx;
  }
  return false;
}

/** Zoom limits to prevent zooming too far in or out */
export const MIN_PPY = 0.005; // ~384,000 years on 1920px
export const MAX_PPY = 5000;  // ~0.38 years on 1920px
