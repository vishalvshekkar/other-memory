import type { AGYear, CalendarConfig } from "@/types";

/** Convert an AG year to Common Era year */
export function agToCE(ag: AGYear, config: CalendarConfig): number {
  return ag + config.ag_zero_ce_year;
}

/** Convert a Common Era year to AG */
export function ceToAG(ce: number, config: CalendarConfig): AGYear {
  return ce - config.ag_zero_ce_year;
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

/** Format a year in the user's chosen calendar */
export function formatYear(
  ag: AGYear,
  config: CalendarConfig,
  calendarMode: "ag" | "ce",
): string {
  if (calendarMode === "ce") {
    return formatCEYear(agToCE(ag, config));
  }
  return formatAGYear(ag);
}

/** Format a date range */
export function formatDateRange(
  start: AGYear,
  end: AGYear | undefined,
  config: CalendarConfig,
  calendarMode: "ag" | "ce",
): string {
  const startStr = formatYear(start, config, calendarMode);
  if (end === undefined || end === start) {
    return startStr;
  }
  const endStr = formatYear(end, config, calendarMode);
  return `${startStr} – ${endStr}`;
}
