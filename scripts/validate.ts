/**
 * Validates all YAML data files against schemas and checks referential integrity.
 *
 * Run: npm run validate (or: npx tsx scripts/validate.ts)
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { parse as parseYaml } from "yaml";
import Ajv from "ajv";

const DATA_DIR = join(import.meta.dirname, "..", "data");
const EVENTS_DIR = join(DATA_DIR, "events");
const ARCS_DIR = join(DATA_DIR, "arcs");

let hasErrors = false;

function error(msg: string) {
  console.error(`  ✗ ${msg}`);
  hasErrors = true;
}

function ok(msg: string) {
  console.log(`  ✓ ${msg}`);
}

function loadYaml<T>(path: string): T | null {
  try {
    const content = readFileSync(path, "utf-8");
    return parseYaml(content) as T;
  } catch (e) {
    error(`Failed to parse ${path}: ${(e as Error).message}`);
    return null;
  }
}

// ─── Load all data ───

console.log("\n🔍 Validating Dune Timeline data...\n");

// Config
console.log("📋 Config:");
const config = loadYaml<{ calendar: { ce_anchor_expanded: number; ce_anchor_encyclopedia: number } }>(
  join(DATA_DIR, "config.yaml"),
);
if (config?.calendar?.ce_anchor_expanded && config?.calendar?.ce_anchor_encyclopedia) {
  ok(`Calendar anchors: Expanded=${config.calendar.ce_anchor_expanded} CE, Encyclopedia=${config.calendar.ce_anchor_encyclopedia} CE`);
} else {
  error("Missing or invalid calendar config");
}

// Books
console.log("\n📚 Books:");
interface BookEntry {
  id: string;
  title: string;
  timeline_start: number;
  timeline_end: number;
}
const books = loadYaml<BookEntry[]>(join(DATA_DIR, "books.yaml"));
const bookIds = new Set<string>();
if (books) {
  for (const book of books) {
    if (!book.id) {
      error("Book missing id");
      continue;
    }
    if (bookIds.has(book.id)) {
      error(`Duplicate book id: ${book.id}`);
    }
    bookIds.add(book.id);
    if (book.timeline_start > book.timeline_end) {
      error(`Book ${book.id}: timeline_start > timeline_end`);
    }
  }
  ok(`${books.length} books loaded, ${bookIds.size} unique IDs`);
}

// Categories
console.log("\n🏷️  Categories:");
interface CategoryEntry {
  id: string;
}
const categories = loadYaml<CategoryEntry[]>(
  join(DATA_DIR, "categories.yaml"),
);
const categoryIds = new Set<string>();
if (categories) {
  for (const cat of categories) {
    categoryIds.add(cat.id);
  }
  ok(`${categories.length} categories: ${[...categoryIds].join(", ")}`);
}

// Factions
console.log("\n⚔️  Factions:");
interface FactionEntry {
  id: string;
}
const factions = loadYaml<FactionEntry[]>(join(DATA_DIR, "factions.yaml"));
const factionIds = new Set<string>();
if (factions) {
  for (const f of factions) {
    factionIds.add(f.id);
  }
  ok(`${factions.length} factions loaded`);
}

// Events — schema validation
console.log("\n📅 Events:");
const schema = JSON.parse(
  readFileSync(join(DATA_DIR, "_schema.json"), "utf-8"),
);
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

interface EventEntry {
  id: string;
  type: string;
  date_start: number;
  date_end?: number;
  books: { book_id: string }[];
  category: string;
  factions?: string[];
}

const allEventIds = new Set<string>();
let totalEvents = 0;

function validateEventFile(filePath: string, label: string) {
  const events = loadYaml<EventEntry[]>(filePath);
  if (!events) return;

  const valid = validate(events);
  if (!valid && validate.errors) {
    for (const err of validate.errors) {
      error(`${label} ${err.instancePath}: ${err.message}`);
    }
    return;
  }

  for (const event of events) {
    totalEvents++;

    // Duplicate ID check
    if (allEventIds.has(event.id)) {
      error(`Duplicate event ID: ${event.id}`);
    }
    allEventIds.add(event.id);

    // Date consistency
    if (
      event.date_end !== undefined &&
      event.date_end < event.date_start
    ) {
      error(`${event.id}: date_end < date_start`);
    }

    // Book reference check
    for (const ref of event.books) {
      if (!bookIds.has(ref.book_id)) {
        error(`${event.id}: references unknown book "${ref.book_id}"`);
      }
    }

    // Category check
    if (categoryIds.size > 0 && !categoryIds.has(event.category)) {
      error(
        `${event.id}: unknown category "${event.category}"`,
      );
    }

    // Faction check (warning only — factions list may be incomplete)
    if (event.factions) {
      for (const f of event.factions) {
        if (factionIds.size > 0 && !factionIds.has(f)) {
          console.warn(`  ⚠ ${event.id}: unknown faction "${f}" (not in factions.yaml)`);
        }
      }
    }
  }

  ok(`${label}: ${events.length} events valid`);
}

// Validate events/ directory
if (existsSync(EVENTS_DIR)) {
  for (const file of readdirSync(EVENTS_DIR)) {
    if (file.endsWith(".yaml") || file.endsWith(".yml")) {
      validateEventFile(join(EVENTS_DIR, file), `events/${file}`);
    }
  }
}

// Validate eras
console.log("\n🌍 Eras:");
const erasPath = join(DATA_DIR, "eras.yaml");
if (existsSync(erasPath)) {
  validateEventFile(erasPath, "eras.yaml");
}

// Validate arcs
console.log("\n🔗 Arcs:");
if (existsSync(ARCS_DIR)) {
  for (const file of readdirSync(ARCS_DIR)) {
    if (file.endsWith(".yaml") || file.endsWith(".yml")) {
      validateEventFile(join(ARCS_DIR, file), `arcs/${file}`);
    }
  }
}

// Arc event references
console.log("\n🔗 Arc references:");
if (existsSync(ARCS_DIR)) {
  for (const file of readdirSync(ARCS_DIR)) {
    if (!file.endsWith(".yaml") && !file.endsWith(".yml")) continue;
    const arcs = loadYaml<EventEntry[]>(join(ARCS_DIR, file));
    if (!arcs) continue;
    for (const arc of arcs) {
      if (arc.type === "arc" && "arc_events" in arc) {
        const arcEvents = (arc as EventEntry & { arc_events: string[] })
          .arc_events;
        for (const refId of arcEvents) {
          if (!allEventIds.has(refId)) {
            error(
              `Arc "${arc.id}" references unknown event "${refId}"`,
            );
          }
        }
      }
    }
  }
  ok("Arc event references checked");
}

// Summary
console.log("\n" + "─".repeat(50));
if (hasErrors) {
  console.error("❌ Validation failed — see errors above\n");
  process.exit(1);
} else {
  console.log(
    `✅ All valid! ${totalEvents} events, ${bookIds.size} books, ${categoryIds.size} categories\n`,
  );
}
