/**
 * Simple quadtree for 2D hit detection on rendered event bounding boxes.
 *
 * MVP: flat array scan with early exit. At <200 visible events per frame,
 * this is faster than a full quadtree due to no construction overhead.
 * Replace with spatial hashing or quadtree if visible count exceeds 500.
 */

import type { HitBox } from "@/timeline/renderer/types";

export interface HitTestIndex {
  boxes: HitBox[];
}

/** Build a hit-test index from rendered bounding boxes */
export function buildHitTestIndex(boxes: HitBox[]): HitTestIndex {
  return { boxes };
}

/** Find the topmost event at a given pixel position */
export function hitTestPoint(
  index: HitTestIndex,
  x: number,
  y: number,
): string | null {
  // Scan in reverse order (last drawn = topmost)
  for (let i = index.boxes.length - 1; i >= 0; i--) {
    const box = index.boxes[i];
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
}

/** Find all events within a rectangular region */
export function hitTestRect(
  index: HitTestIndex,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
): string[] {
  const results: string[] = [];
  for (const box of index.boxes) {
    if (
      box.x + box.width >= rx &&
      box.x <= rx + rw &&
      box.y + box.height >= ry &&
      box.y <= ry + rh
    ) {
      results.push(box.eventId);
    }
  }
  return results;
}
