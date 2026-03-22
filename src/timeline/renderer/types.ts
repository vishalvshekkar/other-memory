/**
 * Types for the canvas rendering pipeline.
 * These are separate from the main app types because they are renderer-internal.
 */

import type {
  CameraState,
  ZoomTier,
  Orientation,
  CategoryId,
  MediaEntry,
} from "@/types";
import type { TimelineDataWithMaps } from "@/data/loader";

/** Colors resolved from CSS variables for canvas rendering */
export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentSpice: string;
  accentWater: string;
  border: string;
  eraBand: string;
  categories: Record<CategoryId, string>;
}

/** Everything a render layer needs to draw */
export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  camera: CameraState;
  viewport: { width: number; height: number };
  zoomTier: ZoomTier;
  theme: ThemeColors;
  orientation: Orientation;
  data: TimelineDataWithMaps;
  minSignificance: 1 | 2 | 3 | 4 | 5;
  /** IDs of events that passed all filters (render these, skip the rest) */
  visibleEventIds: Set<string>;
  /** IDs of events that should render dimmed (contextual book filter) */
  contextualEventIds: Set<string>;
  /** Currently selected event ID */
  selectedEventId: string | null;
  /** Currently hovered event ID */
  hoveredEventId: string | null;
  /** Device pixel ratio for crisp rendering */
  dpr: number;
  /** Whether to show the CE (real-world) calendar axes */
  showCEAxis: boolean;
  /** Expanded Dune anchor: AG 0 = this CE year (11,200 BG = 1960 CE → 13,160) */
  ceAnchorExpanded: number;
  /** Dune Encyclopedia anchor: AG 0 = this CE year (16,200 BG = 0 CE → 16,200) */
  ceAnchorEncyclopedia: number;
  /** Whether to show movie/TV show bands */
  showMediaBands: boolean;
  /** Media entries to render as bands */
  mediaEntries: MediaEntry[];
  /** Precomputed height of the bottom area (axis + CE + media) */
  bottomAreaHeight: number;
}

/** A render layer draws one visual concern onto the canvas */
export interface RenderLayer {
  id: string;
  render(rc: RenderContext): void;
}

/** A bounding box for hit detection — produced by renderers, consumed by spatial indexing */
export interface HitBox {
  eventId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Default theme (dark mode, spice-inspired) */
export const DEFAULT_THEME: ThemeColors = {
  bgPrimary: "#0a0a0f",
  bgSecondary: "#12121a",
  textPrimary: "#e8e0d0",
  textSecondary: "#8a8070",
  textMuted: "#5a5548",
  accentSpice: "#c4841d",
  accentWater: "#1a6b8a",
  border: "rgba(255, 255, 255, 0.08)",
  eraBand: "rgba(255, 255, 255, 0.03)",
  categories: {
    political: "#c4a435",
    military: "#b83a3a",
    ecological: "#2a9d6e",
    religious: "#7b4db5",
    technological: "#4a8db5",
    personal: "#d4c5a9",
    cultural: "#c47a35",
  },
};
