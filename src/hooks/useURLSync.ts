import { useEffect, useRef } from "react";
import type { AGYear, ZoomTier } from "@/types";
import { decodeURL, encodeURL } from "@/state/url";

interface URLSyncState {
  center: AGYear;
  zoomTier: ZoomTier;
  selectedEventId: string | null;
}

interface URLSyncCallbacks {
  onCenterChange: (year: AGYear) => void;
  onZoomTierChange: (tier: ZoomTier) => void;
  onSelectEvent: (id: string | null) => void;
}

/**
 * Two-way sync between app state and URL.
 * - On mount: reads URL params and applies them.
 * - On state change: debounced update of URL via replaceState.
 */
export function useURLSync(state: URLSyncState, callbacks: URLSyncCallbacks) {
  const initialized = useRef(false);
  const debounceTimer = useRef<number>(0);

  // Read URL on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const params = decodeURL(window.location.search);
    if (params.center !== undefined) callbacks.onCenterChange(params.center);
    if (params.zoomTier !== undefined) callbacks.onZoomTierChange(params.zoomTier);
    if (params.selectedEvent) callbacks.onSelectEvent(params.selectedEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Write URL on state change (debounced)
  useEffect(() => {
    if (!initialized.current) return;

    window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      const url = encodeURL({
        center: state.center,
        zoomTier: state.zoomTier,
        selectedEvent: state.selectedEventId ?? undefined,
      });
      const newUrl = window.location.pathname + url;
      if (newUrl !== window.location.pathname + window.location.search) {
        window.history.replaceState(null, "", newUrl);
      }
    }, 500);

    return () => window.clearTimeout(debounceTimer.current);
  }, [state.center, state.zoomTier, state.selectedEventId]);
}
