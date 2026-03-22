/**
 * Text color utilities for WCAG-compliant contrast.
 */

const CATEGORY_HEX: Record<string, string> = {
  political: "#c4a435",
  military: "#b83a3a",
  ecological: "#2a9d6e",
  religious: "#7b4db5",
  technological: "#4a8db5",
  personal: "#d4c5a9",
  cultural: "#c47a35",
};

/** Compute WCAG relative luminance of a hex color */
function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const linearize = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** Return a dark or light hex color for readable text on the given background */
export function contrastText(bgHex: string): string {
  return relativeLuminance(bgHex) > 0.4 ? "#141210" : "#e8e0d0";
}

/** Return a readable text color for a given category's background */
export function contrastTextForCategory(category: string): string {
  return contrastText(CATEGORY_HEX[category] ?? "#888888");
}
