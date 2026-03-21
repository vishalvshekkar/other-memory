/**
 * Camera system — pure functions for zoom/pan coordinate math.
 *
 * The camera state is simple: a center AG year and a pixels-per-year value.
 * All rendering and interaction code converts between year-space and pixel-space
 * using these functions.
 *
 * IMPORTANT: This file must not import React. It is shared between the Canvas
 * renderer (non-React) and React hooks.
 */

import type { AGYear, CameraState } from "@/types";
import { MIN_PPY, MAX_PPY } from "./zoom";

/** Convert an AG year to a pixel X position */
export function yearToPixel(
  year: AGYear,
  camera: CameraState,
  viewportWidth: number,
): number {
  const centerPixel = viewportWidth / 2;
  return centerPixel + (year - camera.center) * camera.pixels_per_year;
}

/** Convert a pixel X position to an AG year */
export function pixelToYear(
  px: number,
  camera: CameraState,
  viewportWidth: number,
): AGYear {
  const centerPixel = viewportWidth / 2;
  return camera.center + (px - centerPixel) / camera.pixels_per_year;
}

/** Get the visible AG year range for the current camera + viewport */
export function getVisibleRange(
  camera: CameraState,
  viewportWidth: number,
): { start: AGYear; end: AGYear } {
  const halfWidth = viewportWidth / 2;
  const halfYears = halfWidth / camera.pixels_per_year;
  return {
    start: camera.center - halfYears,
    end: camera.center + halfYears,
  };
}

/**
 * Zoom centered on a specific pixel position.
 * The year under the cursor stays fixed while the zoom changes.
 */
export function zoomAtPoint(
  camera: CameraState,
  cursorPixel: number,
  zoomFactor: number,
  viewportWidth: number,
): CameraState {
  // What year is under the cursor before zoom?
  const yearUnderCursor = pixelToYear(cursorPixel, camera, viewportWidth);

  // New zoom level
  const newPpy = clampPpy(camera.pixels_per_year * zoomFactor);

  // After zoom, what pixel would yearUnderCursor be at with the old center?
  // We need to adjust center so that yearUnderCursor stays at cursorPixel.
  const centerPixel = viewportWidth / 2;
  const newCenter =
    yearUnderCursor - (cursorPixel - centerPixel) / newPpy;

  return { center: newCenter, pixels_per_year: newPpy };
}

/** Pan by a number of pixels */
export function pan(
  camera: CameraState,
  deltaPixels: number,
): CameraState {
  const deltaYears = deltaPixels / camera.pixels_per_year;
  return { ...camera, center: camera.center - deltaYears };
}

/** Compute camera state that fits a year range into the viewport */
export function fitToRange(
  startYear: AGYear,
  endYear: AGYear,
  viewportWidth: number,
  padding: number = 0.05,
): CameraState {
  const span = endYear - startYear;
  const paddedSpan = span * (1 + padding * 2);
  const ppy = clampPpy(viewportWidth / paddedSpan);
  const center = (startYear + endYear) / 2;
  return { center, pixels_per_year: ppy };
}

/** Clamp camera center to stay within bounds */
export function clampCamera(
  camera: CameraState,
  bounds: { min: AGYear; max: AGYear },
): CameraState {
  const center = Math.max(bounds.min, Math.min(bounds.max, camera.center));
  return { ...camera, center };
}

/** Clamp pixels-per-year to valid range */
function clampPpy(ppy: number): number {
  return Math.max(MIN_PPY, Math.min(MAX_PPY, ppy));
}

/** Step zoom in by a fixed factor */
export function zoomIn(
  camera: CameraState,
  viewportWidth: number,
): CameraState {
  return zoomAtPoint(camera, viewportWidth / 2, 1.5, viewportWidth);
}

/** Step zoom out by a fixed factor */
export function zoomOut(
  camera: CameraState,
  viewportWidth: number,
): CameraState {
  return zoomAtPoint(camera, viewportWidth / 2, 1 / 1.5, viewportWidth);
}
