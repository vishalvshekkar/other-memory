/**
 * Filter engine — takes FilterState + events, returns filtered results.
 *
 * Filters are composed with AND logic: an event must pass ALL active filters.
 * Book filtering uses three-state logic: highlighted/contextual/hidden.
 */

import type {
  TimelineEvent,
  FilterState,
  BookFilterState,
  Book,
} from "@/types";

export interface FilteredEvent {
  event: TimelineEvent;
  /** Whether this event should render dimmed (contextual book filter) */
  contextual: boolean;
}

/** Apply all filters and return matching events with their visual state */
export function filterEvents(
  events: TimelineEvent[],
  filters: FilterState,
  books: Book[],
): FilteredEvent[] {
  const results: FilteredEvent[] = [];

  for (const event of events) {
    // 1. Significance filter
    if (event.significance < filters.min_significance) continue;

    // 2. Category filter
    if (!filters.categories[event.category]) continue;

    // 3. Faction filter (if any factions are selected, event must match at least one)
    if (filters.factions.length > 0) {
      const hasMatchingFaction = event.factions.some((f) =>
        filters.factions.includes(f),
      );
      if (!hasMatchingFaction) continue;
    }

    // 4. Character filter (same logic as factions)
    if (filters.characters.length > 0) {
      const hasMatchingChar = event.characters.some((c) =>
        filters.characters.includes(c),
      );
      if (!hasMatchingChar) continue;
    }

    // 5. Search filter
    if (filters.search_query) {
      const query = filters.search_query.toLowerCase();
      const searchable = [
        event.title,
        event.description,
        ...event.tags,
        ...event.characters,
        ...event.factions,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(query)) continue;
    }

    // 6. Book filter (three-state)
    const bookState = getEventBookState(event, filters, books);
    if (bookState === "hidden") continue;

    results.push({
      event,
      contextual: bookState === "contextual",
    });
  }

  return results;
}

/**
 * Determine the book filter state for an event.
 * An event is visible if ANY of its referenced books are highlighted or contextual.
 * It gets the "best" state across all its book references.
 */
function getEventBookState(
  event: TimelineEvent,
  filters: FilterState,
  books: Book[],
): BookFilterState {
  // Reading mode overrides individual book filters
  if (filters.reading_mode.enabled && filters.reading_mode.current_book) {
    return getReadingModeState(event, filters.reading_mode.current_book, books);
  }

  // Normal book filtering
  if (event.books.length === 0) return "highlighted"; // events without book refs are always shown

  let bestState: BookFilterState = "hidden";

  for (const ref of event.books) {
    const state = filters.books[ref.book_id] ?? "highlighted";
    if (state === "highlighted") return "highlighted"; // best possible, early exit
    if (state === "contextual" && bestState === "hidden") {
      bestState = "contextual";
    }
  }

  return bestState;
}

/**
 * Reading mode: the current book is highlighted, prior books are contextual,
 * future books are hidden (spoiler prevention).
 */
function getReadingModeState(
  event: TimelineEvent,
  currentBookId: string,
  books: Book[],
): BookFilterState {
  const currentBook = books.find((b) => b.id === currentBookId);
  if (!currentBook) return "highlighted";

  if (event.books.length === 0) return "contextual";

  let bestState: BookFilterState = "hidden";

  for (const ref of event.books) {
    const refBook = books.find((b) => b.id === ref.book_id);
    if (!refBook) continue;

    if (ref.book_id === currentBookId) {
      // Primary reference (first listed book) → highlighted
      // Secondary reference → contextual (provides context, not main source)
      return event.books[0].book_id === currentBookId ? "highlighted" : "contextual";
    }

    // Compare by publication year to determine order
    if (refBook.publication_year <= currentBook.publication_year) {
      if (bestState === "hidden") bestState = "contextual"; // prior book
    }
    // Future books remain hidden (spoiler prevention)
  }

  return bestState;
}

/** Get the set of all visible event IDs (passed all filters) */
export function getVisibleEventIds(
  filteredEvents: FilteredEvent[],
): Set<string> {
  const ids = new Set<string>();
  for (const fe of filteredEvents) {
    ids.add(fe.event.id);
  }
  return ids;
}

/** Get the set of contextual event IDs for rendering */
export function getContextualEventIds(
  filteredEvents: FilteredEvent[],
): Set<string> {
  const ids = new Set<string>();
  for (const fe of filteredEvents) {
    if (fe.contextual) {
      ids.add(fe.event.id);
    }
  }
  return ids;
}

/** Default filter state: everything visible */
export function createDefaultFilters(books: Book[]): FilterState {
  const bookFilters: Record<string, BookFilterState> = {};
  for (const book of books) {
    bookFilters[book.id] = "highlighted";
  }

  return {
    books: bookFilters,
    categories: {
      political: true,
      military: true,
      ecological: true,
      religious: true,
      technological: true,
      personal: true,
      cultural: true,
    },
    factions: [],
    characters: [],
    min_significance: 1,
    search_query: "",
    reading_mode: {
      enabled: false,
    },
  };
}
