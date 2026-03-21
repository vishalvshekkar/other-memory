/**
 * Interval tree for temporal range queries.
 *
 * MVP implementation: sorted array with binary search.
 * Answers "which events overlap [start, end]?" in O(log n + k).
 *
 * For the current data volume (~100 events), this is more than sufficient.
 * Can be replaced with an augmented BST if data grows to 10,000+.
 */

import type { AGYear, TimelineEvent } from "@/types";

export interface IntervalEntry {
  id: string;
  start: AGYear;
  end: AGYear;
  event: TimelineEvent;
}

export interface IntervalTree {
  /** Sorted by start date */
  entries: IntervalEntry[];
}

/** Build an interval tree from events */
export function buildIntervalTree(events: TimelineEvent[]): IntervalTree {
  const entries: IntervalEntry[] = events.map((e) => ({
    id: e.id,
    start: e.date_start,
    end: e.date_end ?? e.date_start,
    event: e,
  }));

  // Sort by start date
  entries.sort((a, b) => a.start - b.start);

  return { entries };
}

/** Query all events that overlap with [queryStart, queryEnd] */
export function queryRange(
  tree: IntervalTree,
  queryStart: AGYear,
  queryEnd: AGYear,
): TimelineEvent[] {
  const results: TimelineEvent[] = [];

  // Binary search for the first entry that could overlap
  // An entry overlaps if entry.start <= queryEnd AND entry.end >= queryStart
  let lo = 0;
  let hi = tree.entries.length;

  // Find leftmost entry where start <= queryEnd
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (tree.entries[mid].start > queryEnd) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }

  // Now scan backwards and forwards from the insertion point
  // All entries with start <= queryEnd are in [0, lo)
  for (let i = 0; i < lo; i++) {
    const entry = tree.entries[i];
    // Check if this entry's range overlaps the query range
    if (entry.end >= queryStart && entry.start <= queryEnd) {
      results.push(entry.event);
    }
  }

  return results;
}
