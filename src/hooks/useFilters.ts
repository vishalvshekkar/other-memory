import { useReducer, useMemo, useCallback } from "react";
import type { FilterState, CategoryId, BookFilterState } from "@/types";
import { useTimelineData } from "@/data/TimelineDataContext";
import { createDefaultFilters } from "@/timeline/filter";

// ─── Actions ───

type FilterAction =
  | { type: "SET_CATEGORY"; category: CategoryId; enabled: boolean }
  | { type: "TOGGLE_CATEGORY"; category: CategoryId }
  | { type: "SET_BOOK_FILTER"; bookId: string; state: BookFilterState }
  | { type: "CYCLE_BOOK_FILTER"; bookId: string }
  | { type: "HIGHLIGHT_ONLY_BOOK"; bookId: string }
  | { type: "RESET_BOOK_FILTERS" }
  | { type: "SET_FACTIONS"; factions: string[] }
  | { type: "TOGGLE_FACTION"; faction: string }
  | { type: "SET_CHARACTERS"; characters: string[] }
  | { type: "TOGGLE_CHARACTER"; character: string }
  | { type: "SET_MIN_SIGNIFICANCE"; min: 1 | 2 | 3 | 4 | 5 }
  | { type: "SET_SEARCH"; query: string }
  | { type: "SET_READING_MODE"; enabled: boolean; bookId?: string }
  | { type: "RESET_ALL" };

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_CATEGORY":
      return {
        ...state,
        categories: { ...state.categories, [action.category]: action.enabled },
      };

    case "TOGGLE_CATEGORY":
      return {
        ...state,
        categories: {
          ...state.categories,
          [action.category]: !state.categories[action.category],
        },
      };

    case "SET_BOOK_FILTER":
      return {
        ...state,
        books: { ...state.books, [action.bookId]: action.state },
      };

    case "CYCLE_BOOK_FILTER": {
      const current = state.books[action.bookId] ?? "highlighted";
      const next: BookFilterState =
        current === "highlighted"
          ? "contextual"
          : current === "contextual"
            ? "hidden"
            : "highlighted";
      return {
        ...state,
        books: { ...state.books, [action.bookId]: next },
      };
    }

    case "HIGHLIGHT_ONLY_BOOK": {
      const newBooks: Record<string, BookFilterState> = {};
      for (const id of Object.keys(state.books)) {
        newBooks[id] = id === action.bookId ? "highlighted" : "contextual";
      }
      return { ...state, books: newBooks };
    }

    case "RESET_BOOK_FILTERS": {
      const newBooks: Record<string, BookFilterState> = {};
      for (const id of Object.keys(state.books)) {
        newBooks[id] = "highlighted";
      }
      return { ...state, books: newBooks };
    }

    case "SET_FACTIONS":
      return { ...state, factions: action.factions };

    case "TOGGLE_FACTION": {
      const factions = state.factions.includes(action.faction)
        ? state.factions.filter((f) => f !== action.faction)
        : [...state.factions, action.faction];
      return { ...state, factions };
    }

    case "SET_CHARACTERS":
      return { ...state, characters: action.characters };

    case "TOGGLE_CHARACTER": {
      const characters = state.characters.includes(action.character)
        ? state.characters.filter((c) => c !== action.character)
        : [...state.characters, action.character];
      return { ...state, characters };
    }

    case "SET_MIN_SIGNIFICANCE":
      return { ...state, min_significance: action.min };

    case "SET_SEARCH":
      return { ...state, search_query: action.query };

    case "SET_READING_MODE":
      return {
        ...state,
        reading_mode: {
          enabled: action.enabled,
          current_book: action.bookId,
        },
      };

    case "RESET_ALL":
      // We don't have access to books here, so just reset what we can
      return {
        ...state,
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
        reading_mode: { enabled: false },
      };
  }
}

// ─── Hook ───

export function useFilters() {
  const data = useTimelineData();
  const defaultFilters = useMemo(() => createDefaultFilters(data.books), [data.books]);
  const [filters, dispatch] = useReducer(filterReducer, defaultFilters);

  const hasActiveFilters = useMemo(() => {
    const allCategoriesOn = Object.values(filters.categories).every(Boolean);
    const allBooksHighlighted = Object.values(filters.books).every(
      (s) => s === "highlighted",
    );
    return (
      !allCategoriesOn ||
      !allBooksHighlighted ||
      filters.factions.length > 0 ||
      filters.characters.length > 0 ||
      filters.min_significance > 1 ||
      filters.search_query !== "" ||
      filters.reading_mode.enabled
    );
  }, [filters]);

  const resetAll = useCallback(() => {
    dispatch({ type: "RESET_ALL" });
    dispatch({ type: "RESET_BOOK_FILTERS" });
  }, []);

  return { filters, dispatch, hasActiveFilters, resetAll };
}
