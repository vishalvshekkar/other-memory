/**
 * Event density heatmap — computes event density across the full timeline.
 * Used for the subtle gradient strip that shows "hotspots" at all zoom levels.
 */

import type { AGYear, DensityBucket, TimelineEvent } from "@/types";

const TARGET_BUCKETS = 200;

/** Compute density buckets across the full timeline */
export function computeDensity(
  events: TimelineEvent[],
  minYear: AGYear,
  maxYear: AGYear,
): DensityBucket[] {
  const span = maxYear - minYear;
  if (span <= 0 || events.length === 0) return [];

  const bucketWidth = Math.max(1, Math.ceil(span / TARGET_BUCKETS));
  const bucketCount = Math.ceil(span / bucketWidth);
  const counts = new Array(bucketCount).fill(0);

  // Count events per bucket
  for (const event of events) {
    const start = event.date_start;
    const end = event.date_end ?? event.date_start;

    const startBucket = Math.max(
      0,
      Math.floor((start - minYear) / bucketWidth),
    );
    const endBucket = Math.min(
      bucketCount - 1,
      Math.floor((end - minYear) / bucketWidth),
    );

    // Each event contributes to all buckets it spans
    for (let b = startBucket; b <= endBucket; b++) {
      counts[b]++;
    }
  }

  // Find max count for normalization
  let maxCount = 0;
  for (const c of counts) {
    if (c > maxCount) maxCount = c;
  }

  // Build buckets
  const buckets: DensityBucket[] = [];
  for (let i = 0; i < bucketCount; i++) {
    buckets.push({
      year_start: minYear + i * bucketWidth,
      year_end: minYear + (i + 1) * bucketWidth,
      count: counts[i],
      normalized: maxCount > 0 ? counts[i] / maxCount : 0,
    });
  }

  return buckets;
}
