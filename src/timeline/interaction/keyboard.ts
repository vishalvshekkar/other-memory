/**
 * Keyboard shortcut handler — maps key events to timeline actions.
 * Returns action descriptors; the App component dispatches them.
 */

import type { ZoomTier } from "@/types";

export type KeyboardAction =
  | { type: "PAN_LEFT" }
  | { type: "PAN_RIGHT" }
  | { type: "ZOOM_IN" }
  | { type: "ZOOM_OUT" }
  | { type: "JUMP_TO_TIER"; tier: ZoomTier }
  | { type: "FIT_ALL" }
  | { type: "TOGGLE_ORIENTATION" }
  | { type: "OPEN_SEARCH" }
  | { type: "OPEN_FILTERS" }
  | { type: "OPEN_BOOKS" }
  | { type: "TOGGLE_DETAIL" }
  | { type: "CLOSE_PANEL" }
  | { type: "SHOW_SHORTCUTS" }
  | { type: "GO_HOME" }
  | { type: "GO_END" };

/**
 * Map a keyboard event to a timeline action.
 * Returns null if the key is not a shortcut.
 */
export function handleKeyDown(e: KeyboardEvent): KeyboardAction | null {
  // Don't handle if user is typing in an input
  const target = e.target as HTMLElement;
  if (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  ) {
    return null;
  }

  switch (e.key) {
    case "ArrowLeft":
      e.preventDefault();
      return { type: "PAN_LEFT" };

    case "ArrowRight":
      e.preventDefault();
      return { type: "PAN_RIGHT" };

    case "+":
    case "=":
      e.preventDefault();
      return { type: "ZOOM_IN" };

    case "-":
    case "_":
      e.preventDefault();
      return { type: "ZOOM_OUT" };

    case "0":
      e.preventDefault();
      return { type: "FIT_ALL" };

    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
      e.preventDefault();
      return { type: "JUMP_TO_TIER", tier: parseInt(e.key) as ZoomTier };

    case "h":
    case "v":
      return { type: "TOGGLE_ORIENTATION" };

    case "/":
      e.preventDefault();
      return { type: "OPEN_SEARCH" };

    case "f":
      return { type: "OPEN_FILTERS" };

    case "b":
      return { type: "OPEN_BOOKS" };

    case " ":
      e.preventDefault();
      return { type: "TOGGLE_DETAIL" };

    case "Escape":
      return { type: "CLOSE_PANEL" };

    case "?":
      e.preventDefault();
      return { type: "SHOW_SHORTCUTS" };

    case "Home":
      e.preventDefault();
      return { type: "GO_HOME" };

    case "End":
      e.preventDefault();
      return { type: "GO_END" };

    default:
      return null;
  }
}
