# Adding Eras

Eras are named historical periods that render as colored background bands on the Other Memory timeline. They provide structure and context -- when you see a cluster of events, the era band behind them tells you "this was during the Corrino Empire" or "this was the Butlerian Jihad."

All eras are defined in a single file: `data/eras.yaml`.

---

## Table of Contents

- [When to Use an Era vs. a Span Event](#when-to-use-an-era-vs-a-span-event)
- [Era Nesting](#era-nesting)
- [Required Fields](#required-fields)
- [Adding a New Era](#adding-a-new-era)
- [Adding a Nested Sub-Era](#adding-a-nested-sub-era)
- [Guidelines](#guidelines)

---

## When to Use an Era vs. a Span Event

Eras and span events both cover a range of years, but they serve different purposes:

| | Era (`type: era`) | Span (`type: span`) |
|-|-------------------|---------------------|
| **Purpose** | Names a historical period; provides context for other events | Describes something that happened over a duration |
| **Visual** | Background band behind other events | Foreground bar alongside other events |
| **File** | `data/eras.yaml` | `data/events/*.yaml` |
| **Examples** | "Corrino Empire," "The Scattering," "Butlerian Jihad" | "Muad'Dib's Jihad," "Alia's Regency" (if treated as an event, not a period) |
| **Nesting** | Supports hierarchical nesting (parent/child) | No nesting |

**Rule of thumb:** If readers would say "during the ___" to place other events in context, it is an era. If readers would say "___ happened," it is a span event.

Some borderline cases exist. The Regency of Alia is currently defined as an era (a named political period) rather than a span event. Use your judgment, and reviewers will help if the classification is debatable.

---

## Era Nesting

Eras support hierarchical nesting using the `nesting_level` and `parent_era` fields. This allows sub-eras to sit inside larger eras visually on the timeline.

### Nesting Level 0: Top-Level Eras

The broadest historical periods. These have no parent.

```yaml
- id: corrino-empire
  type: era
  title: "Corrino Empire"
  description: "Ten millennia of Imperial rule by House Corrino from the Golden Lion Throne on Kaitain."
  date_start: -88
  date_end: 10196
  date_precision: approximate
  significance: 5
  category: political
  tags: ["imperium", "golden-lion-throne", "kaitain"]
  factions: ["corrino", "sardaukar"]
  characters: []
  books:
    - book_id: dune-1965
      notes: "End of the Corrino Empire"
  nesting_level: 0
  parent_era: null
```

Current top-level eras include:

- Time of Titans
- Synchronized Empire
- Butlerian Jihad
- Era of the Great Convention
- Corrino Empire
- Atreides Empire
- The Scattering
- Return from the Scattering

### Nesting Level 1: Sub-Eras

Named periods within a top-level era. They must reference their parent.

```yaml
- id: reign-of-shaddam-iv
  type: era
  title: "Reign of Shaddam IV"
  description: "The final Corrino emperor, whose machinations against House Atreides led to the fall of his dynasty."
  date_start: 10156
  date_end: 10196
  date_precision: exact
  significance: 4
  category: political
  tags: ["shaddam-iv", "last-emperor"]
  factions: ["corrino", "sardaukar"]
  characters: ["shaddam-iv"]
  books:
    - book_id: dune-1965
    - book_id: house-harkonnen-2000
    - book_id: house-corrino-2001
  nesting_level: 1
  parent_era: corrino-empire
```

Current sub-eras include:

- Reign of Shaddam IV (inside Corrino Empire)
- Reign of Muad'Dib (inside Atreides Empire)
- Regency of Alia (inside Atreides Empire)
- God Emperor's Reign (inside Atreides Empire)

### Nesting Level 2: Sub-Sub-Eras

For even finer divisions within a sub-era. The `parent_era` points to the level-1 era above it.

```yaml
- id: example-sub-sub-era
  type: era
  title: "Example Period"
  description: "A finer division within a sub-era."
  date_start: 10200
  date_end: 10205
  ...
  nesting_level: 2
  parent_era: muad-dib-reign    # Points to the level-1 era
```

Level 2 eras are not common. Most of the timeline is well-served by levels 0 and 1.

---

## Required Fields

Eras require **all the standard event fields** plus three era-specific fields that are mandatory:

| Field | Required For | Notes |
|-------|-------------|-------|
| `date_end` | `span` and `era` | An era must have an ending year. |
| `nesting_level` | `era` only | Integer >= 0. Use 0 for top-level, 1 for sub-era, 2 for sub-sub-era. |
| `parent_era` | `era` only | ID of the parent era, or `null` for top-level eras. |

If you forget any of these three, the validator will reject the era.

---

## Adding a New Era

### Step 1: Determine if It Should Be an Era

Ask yourself:

- Is this a named historical period that provides context for other events?
- Would it make sense as a background band on the timeline?
- Are there (or will there be) multiple events that fall within this period?

If yes to all three, it belongs in `data/eras.yaml`.

### Step 2: Determine the Nesting Level

- **Level 0** if it stands on its own as a major epoch of Dune history.
- **Level 1** if it is a subdivision of an existing level-0 era.
- **Level 2** if it is a subdivision of an existing level-1 era (rare).

### Step 3: Add the Era

Open `data/eras.yaml` and add your era in chronological order. Here is the complete template:

```yaml
- id: your-era-slug
  type: era
  title: "Era Name"
  description: "1-3 sentence description of this historical period."
  date_start: 1000
  date_end: 2000
  date_precision: approximate
  significance: 4
  category: political
  tags: ["relevant-tags"]
  factions: ["relevant-factions"]
  characters: []
  books:
    - book_id: dune-1965
      notes: "Source for this era"
  nesting_level: 0
  parent_era: null
```

### Step 4: Validate

```bash
npm run validate
```

The validator ensures:
- `date_end` is present and >= `date_start`
- `nesting_level` and `parent_era` are present
- If `nesting_level` > 0, the `parent_era` ID exists in the file
- The era's date range falls within its parent era's date range

---

## Adding a Nested Sub-Era

When adding a sub-era within an existing era:

1. Set `nesting_level` to the parent's level + 1.
2. Set `parent_era` to the parent era's `id`.
3. Ensure the sub-era's `date_start` and `date_end` fall within the parent's range.

Example: adding a sub-era within the Atreides Empire:

```yaml
- id: alia-regency
  type: era
  title: "Regency of Alia"
  description: "Alia Atreides serves as regent after Paul walks into the desert."
  date_start: 10210
  date_end: 10219
  date_precision: exact
  significance: 3
  category: political
  tags: ["alia", "regency"]
  factions: ["atreides"]
  characters: ["alia-atreides"]
  books:
    - book_id: children-of-dune-1976
  nesting_level: 1
  parent_era: atreides-empire     # The level-0 parent
```

---

## Guidelines

- **Be conservative about adding top-level eras.** The timeline should have a manageable number of level-0 eras (roughly 5--10). Too many top-level bands create visual clutter.
- **Eras should not overlap at the same nesting level** unless there is a strong historical reason (e.g., the Corrino Empire and the Era of the Great Convention overlap in early years because the Convention was established during Corrino rule).
- **Significance for eras** is typically 4 or 5. An era that is only significance 1--2 probably should not be an era at all.
- **Cite your sources.** Even eras need book references. Which novel describes or takes place during this period?
