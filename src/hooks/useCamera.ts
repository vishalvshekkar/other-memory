import { useReducer, useCallback, useMemo } from "react";
import type { AGYear, CameraState, ZoomTier } from "@/types";
import {
  zoomAtPoint,
  pan,
  fitToRange,
  zoomIn,
  zoomOut,
} from "@/timeline/camera";
import { getZoomTier, getTierPixelsPerYear, getZoomTierConfig } from "@/timeline/zoom";
import { getTimelineBounds } from "@/data/loader";
import { useTimelineData } from "@/data/TimelineDataContext";

// ─── Actions ───

type CameraAction =
  | { type: "ZOOM_AT_POINT"; cursorPixel: number; factor: number; viewportWidth: number }
  | { type: "ZOOM_IN"; viewportWidth: number }
  | { type: "ZOOM_OUT"; viewportWidth: number }
  | { type: "PAN"; deltaPixels: number }
  | { type: "FIT_ALL"; viewportWidth: number; bounds: { min: AGYear; max: AGYear } }
  | { type: "JUMP_TO_TIER"; tier: ZoomTier; viewportWidth: number }
  | { type: "CENTER_ON"; year: AGYear }
  | { type: "SET"; camera: CameraState };

function cameraReducer(state: CameraState, action: CameraAction): CameraState {
  switch (action.type) {
    case "ZOOM_AT_POINT":
      return zoomAtPoint(state, action.cursorPixel, action.factor, action.viewportWidth);
    case "ZOOM_IN":
      return zoomIn(state, action.viewportWidth);
    case "ZOOM_OUT":
      return zoomOut(state, action.viewportWidth);
    case "PAN":
      return pan(state, action.deltaPixels);
    case "FIT_ALL":
      return fitToRange(action.bounds.min, action.bounds.max, action.viewportWidth);
    case "JUMP_TO_TIER": {
      const ppy = getTierPixelsPerYear(action.tier);
      return { ...state, pixels_per_year: ppy };
    }
    case "CENTER_ON":
      return { ...state, center: action.year };
    case "SET":
      return action.camera;
  }
}

// ─── Hook ───

export function useCamera(viewportWidth: number) {
  const data = useTimelineData();
  const bounds = useMemo(() => getTimelineBounds(data), [data]);

  const initialCamera = useMemo(
    () => fitToRange(bounds.min, bounds.max, Math.max(viewportWidth, 800)),
    // Only compute initial camera once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [camera, dispatch] = useReducer(cameraReducer, initialCamera);

  const zoomTier = useMemo(() => getZoomTier(camera.pixels_per_year), [camera.pixels_per_year]);
  const zoomTierConfig = useMemo(() => getZoomTierConfig(zoomTier), [zoomTier]);

  const fitAll = useCallback(() => {
    dispatch({ type: "FIT_ALL", viewportWidth, bounds });
  }, [viewportWidth, bounds]);

  const centerOn = useCallback((year: AGYear) => {
    dispatch({ type: "CENTER_ON", year });
  }, []);

  return {
    camera,
    dispatch,
    zoomTier,
    zoomTierConfig,
    bounds,
    fitAll,
    centerOn,
  };
}
