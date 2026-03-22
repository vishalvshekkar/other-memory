/**
 * TimelineCanvas — React component that manages the <canvas> element,
 * handles resize, devicePixelRatio scaling, and delegates to the render engine.
 *
 * Also handles mouse/keyboard interaction for zoom, pan, and event selection.
 */

import { useRef, useEffect, useCallback } from "react";
import type { CameraState } from "@/types";
import { useTimelineData } from "@/data/TimelineDataContext";
import { renderTimeline } from "@/timeline/renderer";
import { DEFAULT_THEME } from "@/timeline/renderer/types";
import type { RenderContext } from "@/timeline/renderer/types";
import { getZoomTier, getMinSignificance } from "@/timeline/zoom";
import { zoomAtPoint, pan as cameraPan } from "@/timeline/camera";
import { MomentumTracker } from "@/timeline/animation";
import { spanHitBoxes } from "@/timeline/renderer/layers/span-bars";
import { pointHitBoxes } from "@/timeline/renderer/layers/point-markers";
import { mediaHitBoxes } from "@/timeline/renderer/layers/media-bands";
import type { HitBox } from "@/timeline/renderer/types";

interface TimelineCanvasProps {
  camera: CameraState;
  onCameraChange: (camera: CameraState) => void;
  selectedEventId: string | null;
  onSelectEvent: (id: string | null) => void;
  hoveredEventId: string | null;
  onHoverEvent: (id: string | null) => void;
  onHoverPosition: (pos: { x: number; y: number } | null) => void;
  onViewportResize: (width: number, height: number) => void;
  visibleEventIds?: Set<string>;
  contextualEventIds?: Set<string>;
  showCEAxis?: boolean;
  ceAnchorExpanded?: number;
  ceAnchorEncyclopedia?: number;
  showMediaBands?: boolean;
  interactionDisabled?: boolean;
}

export function TimelineCanvas({
  camera,
  onCameraChange,
  selectedEventId,
  onSelectEvent,
  hoveredEventId,
  onHoverEvent,
  onHoverPosition,
  onViewportResize,
  visibleEventIds,
  contextualEventIds,
  showCEAxis = false,
  ceAnchorExpanded = 13160,
  ceAnchorEncyclopedia = 16200,
  showMediaBands = true,
  interactionDisabled = false,
}: TimelineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const data = useTimelineData();
  const rafRef = useRef<number>(0);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);
  const momentumRef = useRef(new MomentumTracker());
  const cancelMomentumRef = useRef<(() => void) | null>(null);
  const cameraRef = useRef(camera);
  cameraRef.current = camera;
  const onCameraChangeRef = useRef(onCameraChange);
  onCameraChangeRef.current = onCameraChange;

  // ─── Pinch-to-zoom state ───
  const activePointers = useRef(new Map<number, { x: number; y: number }>());
  const lastPinchDist = useRef<number | null>(null);

  // ─── Render Loop ───

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Set canvas backing store size for crisp rendering
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    const rc: RenderContext = {
      ctx,
      camera,
      viewport: { width, height },
      zoomTier: getZoomTier(camera.pixels_per_year),
      theme: DEFAULT_THEME,
      orientation: "horizontal",
      data,
      minSignificance: getMinSignificance(camera.pixels_per_year),
      visibleEventIds: visibleEventIds ?? new Set(),
      contextualEventIds: contextualEventIds ?? new Set(),
      selectedEventId,
      hoveredEventId,
      dpr,
      showCEAxis,
      ceAnchorExpanded,
      ceAnchorEncyclopedia,
      showMediaBands,
      mediaEntries: data.media,
      bottomAreaHeight: 30
        + (showCEAxis ? 32 : 0)
        + (showMediaBands ? 10 + data.media.length * 16 + 22 : 0),
    };

    renderTimeline(rc);
  }, [camera, data, selectedEventId, hoveredEventId, visibleEventIds, contextualEventIds, showCEAxis, ceAnchorExpanded, ceAnchorEncyclopedia, showMediaBands]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  // ─── Resize Observer ───

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        onViewportResize(width, height);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [onViewportResize]);

  // ─── Hit Testing ───

  const hitTest = useCallback(
    (x: number, y: number): string | null => {
      // Check point/milestone hit boxes first (on top)
      const allHitBoxes: HitBox[] = [...mediaHitBoxes, ...pointHitBoxes, ...spanHitBoxes];
      for (const box of allHitBoxes) {
        if (
          x >= box.x &&
          x <= box.x + box.width &&
          y >= box.y &&
          y <= box.y + box.height
        ) {
          return box.eventId;
        }
      }
      return null;
    },
    [],
  );

  // ─── Mouse Interaction ───

  const getCanvasCoords = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  // ─── Wheel → Zoom/Pan (native listener for reliable preventDefault) ───

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      if (interactionDisabled || isDragging.current) return;
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const cam = cameraRef.current;
      const setCam = onCameraChangeRef.current;

      // Normalize delta for deltaMode (Firefox uses line-based scrolling)
      let deltaY = e.deltaY;
      let deltaX = e.deltaX;
      if (e.deltaMode === 1) { deltaY *= 30; deltaX *= 30; }
      if (e.deltaMode === 2) { deltaY *= 800; deltaX *= 800; }

      // Pinch-to-zoom gesture (macOS trackpad reports ctrlKey for pinch)
      if (e.ctrlKey) {
        const factor = Math.pow(2, -deltaY * 0.01);
        setCam(zoomAtPoint(cam, x, factor, rect.width));
        return;
      }

      // Shift + scroll → horizontal pan (Windows/Linux; macOS converts automatically)
      if (e.shiftKey) {
        setCam(cameraPan(cam, -deltaY));
        return;
      }

      // Dominant horizontal scroll (trackpad two-finger swipe) → pan
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setCam(cameraPan(cam, -deltaX));
        return;
      }

      // Vertical scroll → zoom (proportional to delta for smooth trackpad & mouse)
      const factor = Math.pow(2, -deltaY * 0.002);
      setCam(zoomAtPoint(cam, x, factor, rect.width));
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [interactionDisabled]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (interactionDisabled) return;

      // Cancel any active momentum
      cancelMomentumRef.current?.();
      cancelMomentumRef.current = null;
      momentumRef.current.cancel();

      // Track this pointer
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      if (activePointers.current.size === 1) {
        // Single pointer — start drag
        isDragging.current = true;
        hasDragged.current = false;
        dragStart.current = { x: e.clientX, y: e.clientY };
      } else if (activePointers.current.size >= 2) {
        // Second pointer — switch to pinch mode, cancel drag
        isDragging.current = false;
        const pts = [...activePointers.current.values()];
        lastPinchDist.current = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      }
    },
    [interactionDisabled],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (interactionDisabled) return;

      // Update tracked pointer position
      if (activePointers.current.has(e.pointerId)) {
        activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      // ─── Pinch-to-zoom (two pointers active) ───
      if (activePointers.current.size >= 2 && lastPinchDist.current !== null) {
        const pts = [...activePointers.current.values()];
        const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        const factor = dist / lastPinchDist.current;

        if (factor !== 1) {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            const midX = (pts[0].x + pts[1].x) / 2 - rect.left;
            onCameraChange(zoomAtPoint(camera, midX, factor, rect.width));
          }
          lastPinchDist.current = dist;
        }
        return;
      }

      // ─── Single-pointer drag ───
      const { x, y } = getCanvasCoords(e as unknown as React.MouseEvent);

      if (isDragging.current) {
        const dx = e.clientX - dragStart.current.x;
        if (Math.abs(dx) > 2) hasDragged.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
        momentumRef.current.push(dx);
        onCameraChange(cameraPan(camera, dx));
        return;
      }

      // Hover hit test
      const eventId = hitTest(x, y);
      onHoverEvent(eventId);
      if (eventId) {
        onHoverPosition({ x: e.clientX, y: e.clientY });
      } else {
        onHoverPosition(null);
      }
    },
    [camera, onCameraChange, hitTest, onHoverEvent, onHoverPosition, getCanvasCoords, interactionDisabled],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      activePointers.current.delete(e.pointerId);

      // If we still have pointers, recalculate pinch baseline
      if (activePointers.current.size >= 2) {
        const pts = [...activePointers.current.values()];
        lastPinchDist.current = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        return;
      }

      // Reset pinch state when fewer than 2 pointers
      if (activePointers.current.size < 2) {
        lastPinchDist.current = null;
      }

      // Last pointer lifted — was a pinch gesture, skip click/momentum
      if (activePointers.current.size === 0 && !isDragging.current && hasDragged.current) {
        return;
      }

      isDragging.current = false;

      // If it was a click (not a drag), do hit test for selection
      if (!hasDragged.current) {
        const { x, y } = getCanvasCoords(e as unknown as React.MouseEvent);
        const eventId = hitTest(x, y);
        onSelectEvent(eventId);
      } else {
        // Start momentum panning
        cancelMomentumRef.current = momentumRef.current.startMomentum(
          (deltaPixels) => {
            onCameraChangeRef.current(cameraPan(cameraRef.current, deltaPixels));
          },
        );
      }
    },
    [hitTest, onSelectEvent, getCanvasCoords],
  );

  const handlePointerCancel = useCallback((e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId);
    if (activePointers.current.size < 2) {
      lastPinchDist.current = null;
    }
    if (activePointers.current.size === 0) {
      isDragging.current = false;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex-1 relative overflow-hidden ${interactionDisabled ? "pointer-events-none" : "cursor-grab active:cursor-grabbing"}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      />
    </div>
  );
}
