import type { AGYear, CalendarConfig } from "@/types";

/** Convert AG year to CE using the Expanded Dune anchor */
export function agToCEExpanded(ag: AGYear, config: CalendarConfig): number {
  return ag + config.ce_anchor_expanded;
}

/** Convert AG year to CE using the Dune Encyclopedia anchor */
export function agToCEEncyclopedia(ag: AGYear, config: CalendarConfig): number {
  return ag + config.ce_anchor_encyclopedia;
}

/** Format an AG year for display: "10,191 AG" or "88 BG" */
export function formatAGYear(ag: AGYear): string {
  if (ag < 0) {
    return `${Math.abs(ag).toLocaleString()} BG`;
  }
  return `${ag.toLocaleString()} AG`;
}

/** Format a CE year for display: "21,391 CE" or "500 BCE" */
export function formatCEYear(ce: number): string {
  if (ce < 0) {
    return `${Math.abs(ce).toLocaleString()} BCE`;
  }
  return `${ce.toLocaleString()} CE`;
}
