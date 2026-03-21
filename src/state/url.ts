/**
 * URL state encoding/decoding for shareable links.
 *
 * Format: ?t=10191&z=4&f=dune-1965&e=battle-of-arrakeen
 */

import type { AGYear, ZoomTier } from "@/types";

export interface URLParams {
  center?: AGYear;
  zoomTier?: ZoomTier;
  bookFilter?: string;
  selectedEvent?: string;
}

/** Decode URL search params into timeline state */
export function decodeURL(search: string): URLParams {
  const params = new URLSearchParams(search);
  const result: URLParams = {};

  const t = params.get("t");
  if (t) result.center = parseInt(t, 10);

  const z = params.get("z");
  if (z) {
    const tier = parseInt(z, 10);
    if (tier >= 1 && tier <= 6) result.zoomTier = tier as ZoomTier;
  }

  const f = params.get("f");
  if (f) result.bookFilter = f;

  const e = params.get("e");
  if (e) result.selectedEvent = e;

  return result;
}

/** Encode timeline state into URL search params */
export function encodeURL(params: URLParams): string {
  const sp = new URLSearchParams();
  if (params.center !== undefined) sp.set("t", Math.round(params.center).toString());
  if (params.zoomTier !== undefined) sp.set("z", params.zoomTier.toString());
  if (params.bookFilter) sp.set("f", params.bookFilter);
  if (params.selectedEvent) sp.set("e", params.selectedEvent);

  const str = sp.toString();
  return str ? `?${str}` : "";
}
