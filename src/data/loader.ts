/**
 * Loads all YAML data files and merges them into a typed TimelineData bundle.
 *
 * Vite's custom YAML plugin transforms .yaml imports into JSON modules at build time,
 * so these imports are statically resolved — no runtime YAML parsing needed.
 */

import type {
  TimelineData,
  TimelineEvent,
  EraEvent,
  ArcEvent,
  Book,
  Category,
  Faction,
  MediaEntry,
  CalendarConfig,
  CategoryId,
} from "@/types";

// Static YAML imports — Vite transforms these at build time
import configRaw from "@data/config.yaml";
import booksRaw from "@data/books.yaml";
import categoriesRaw from "@data/categories.yaml";
import factionsRaw from "@data/factions.yaml";
import erasRaw from "@data/eras.yaml";

// Event files
import eventsDuneSaga from "@data/events/dune-saga.yaml";
import eventsButlerianJihad from "@data/events/butlerian-jihad.yaml";
import eventsCorrino from "@data/events/corrino-empire.yaml";
import eventsPrelude from "@data/events/prelude-era.yaml";
import eventsGodEmperor from "@data/events/god-emperor.yaml";
import eventsScattering from "@data/events/the-scattering.yaml";
import eventsReturn from "@data/events/return-and-kralizec.yaml";

// Media
import mediaRaw from "@data/media.yaml";

// Arc files
import arcsGoldenPath from "@data/arcs/golden-path.yaml";
import arcsKwisatz from "@data/arcs/kwisatz-haderach.yaml";

// ─── Lookup Maps ───

export type EventMap = Map<string, TimelineEvent>;
export type BookMap = Map<string, Book>;
export type CategoryMap = Map<CategoryId, Category>;
export type FactionMap = Map<string, Faction>;

export interface TimelineDataWithMaps extends TimelineData {
  eventsById: EventMap;
  booksById: BookMap;
  categoriesById: CategoryMap;
  factionsById: FactionMap;
}

// ─── Loader ───

let cached: TimelineDataWithMaps | null = null;

export function loadTimelineData(): TimelineDataWithMaps {
  if (cached) return cached;

  const config: CalendarConfig = (configRaw as { calendar: CalendarConfig }).calendar;
  const books: Book[] = booksRaw as Book[];
  const categories: Category[] = categoriesRaw as Category[];
  const factions: Faction[] = factionsRaw as Faction[];
  const eras: EraEvent[] = erasRaw as EraEvent[];

  // Merge all event files
  const events: TimelineEvent[] = [
    ...(eventsDuneSaga as TimelineEvent[]),
    ...(eventsButlerianJihad as TimelineEvent[]),
    ...(eventsCorrino as TimelineEvent[]),
    ...(eventsPrelude as TimelineEvent[]),
    ...(eventsGodEmperor as TimelineEvent[]),
    ...(eventsScattering as TimelineEvent[]),
    ...(eventsReturn as TimelineEvent[]),
  ];

  // Merge all arc files
  const arcs: ArcEvent[] = [
    ...(arcsGoldenPath as ArcEvent[]),
    ...(arcsKwisatz as ArcEvent[]),
  ];

  // Media
  const media: MediaEntry[] = mediaRaw as MediaEntry[];

  // Build lookup maps
  const eventsById: EventMap = new Map();
  for (const event of events) {
    eventsById.set(event.id, event);
  }
  // Also index eras as events
  for (const era of eras) {
    eventsById.set(era.id, era);
  }

  const booksById: BookMap = new Map();
  for (const book of books) {
    booksById.set(book.id, book);
  }

  const categoriesById: CategoryMap = new Map();
  for (const cat of categories) {
    categoriesById.set(cat.id, cat);
  }

  const factionsById: FactionMap = new Map();
  for (const faction of factions) {
    factionsById.set(faction.id, faction);
  }

  cached = {
    config,
    books,
    categories,
    factions,
    eras,
    events,
    arcs,
    media,
    eventsById,
    booksById,
    categoriesById,
    factionsById,
  };

  return cached;
}

/** Get the full timeline bounds from all events and eras */
export function getTimelineBounds(data: TimelineData): {
  min: number;
  max: number;
} {
  let min = Infinity;
  let max = -Infinity;

  for (const era of data.eras) {
    if (era.date_start < min) min = era.date_start;
    if (era.date_end !== undefined && era.date_end > max) max = era.date_end;
  }

  for (const event of data.events) {
    if (event.date_start < min) min = event.date_start;
    const end = event.date_end ?? event.date_start;
    if (end > max) max = end;
  }

  // Fallback if no data
  if (min === Infinity) min = -1500;
  if (max === -Infinity) max = 15350;

  return { min, max };
}
