# Data Schema Reference

Complete reference for the YAML data schema used by Other Memory. Every event, era, and arc in the project is defined as a YAML object conforming to this schema.

The canonical JSON Schema lives at `data/_schema.json`. This document explains every field in human-readable terms.

---

## Table of Contents

- [Event Object](#event-object)
- [Field Reference](#field-reference)
- [Event Types](#event-types)
- [Categories](#categories)
- [Significance Levels](#significance-levels)
- [Date Precision](#date-precision)
- [BookReference Structure](#bookreference-structure)
- [ID Naming Conventions](#id-naming-conventions)

---

## Event Object

Every item in the timeline (whether a battle, a reign, or a narrative thread) is represented as a single event object. Here is a complete example showing all fields:

```yaml
- id: battle-of-arrakeen
  type: milestone
  title: "Battle of Arrakeen"
  subtitle: "Paul seizes the Imperial throne"
  description: "Paul Atreides leads the Fremen against the Harkonnen and Sardaukar forces, defeats Emperor Shaddam IV, and claims the Imperial throne."
  detailed: |
    The battle was decided when Paul threatened to destroy all spice production
    on Arrakis using the Water of Death. With Alia having killed Baron Harkonnen
    and the Sardaukar routed by Fremen warriors, Shaddam IV was forced to
    abdicate. Paul ascended as Emperor by right of combat and marriage to
    Princess Irulan.
  date_start: 10193
  date_end: null
  date_precision: exact
  significance: 5
  category: military
  tags: ["arrakeen", "fremen-assault", "imperial-succession"]
  factions: ["atreides", "fremen", "harkonnen", "corrino", "sardaukar"]
  characters: ["paul-atreides", "alia-atreides", "shaddam-iv", "baron-harkonnen", "stilgar"]
  books:
    - book_id: dune-1965
      chapters: ["Book Three"]
      notes: "Climactic battle"
  color: null
  icon: null
  lane: null
  nesting_level: null
  parent_era: null
  arc_events: null
```

---

## Field Reference

### Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | **Yes** | Unique kebab-case identifier. Must match `^[a-z0-9][a-z0-9-]*[a-z0-9]$` (lowercase letters, digits, hyphens; cannot start or end with a hyphen). |
| `type` | string | **Yes** | One of: `point`, `span`, `milestone`, `era`, `arc`. See [Event Types](#event-types). |
| `title` | string | **Yes** | Display title. 1--100 characters. |
| `subtitle` | string | No | Secondary line shown below the title. Max 150 characters. |
| `description` | string | **Yes** | 1--3 sentence summary. 10--500 characters. |
| `detailed` | string | No | Long-form content (Markdown supported). Use a YAML literal block (`\|`) for multi-line text. No length limit. |

#### `id`

```yaml
id: leto-i-death            # good
id: Battle_of_Arrakeen      # bad — uppercase and underscores
id: x                       # bad — too short (minimum 2 characters)
```

#### `title`

```yaml
title: "Death of Duke Leto Atreides"
```

#### `subtitle`

```yaml
subtitle: "The Harkonnen trap on Arrakis"
```

#### `description`

```yaml
description: "Duke Leto Atreides is killed in the Harkonnen-Sardaukar attack on Arrakeen, betrayed by Dr. Wellington Yueh."
```

#### `detailed`

```yaml
detailed: |
  The attack on House Atreides was orchestrated by Baron Vladimir Harkonnen
  with the secret backing of Emperor Shaddam IV's Sardaukar troops. Dr. Yueh,
  the Atreides Suk doctor, disabled the house shields in exchange for the
  promise of his wife's release.
```

---

### Temporal Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date_start` | integer | **Yes** | AG year. Use negative values for BG (e.g., `-201` = 201 BG). |
| `date_end` | integer | **Required for `span` and `era`** | AG year when the event/period ends. Must be >= `date_start`. |
| `date_precision` | string | **Yes** | One of: `exact`, `approximate`, `estimated`, `unknown`. See [Date Precision](#date-precision). |

#### `date_start`

```yaml
date_start: 10191           # 10,191 AG
date_start: -201            # 201 BG (Before Guild)
```

#### `date_end`

```yaml
date_end: 10196             # Required for spans and eras
# Omit for point and milestone events
```

---

### Classification Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `significance` | integer (1--5) | **Yes** | How important this event is to the Dune universe. See [Significance Levels](#significance-levels). |
| `category` | string | **Yes** | One of seven categories. See [Categories](#categories). |
| `tags` | array of strings | No | Free-form tags for search and grouping (e.g., `["arrakis", "spice"]`). Defaults to `[]`. |
| `factions` | array of strings | No | IDs of factions involved (must match IDs in `data/factions.yaml`). Defaults to `[]`. |
| `characters` | array of strings | No | IDs of characters involved. Defaults to `[]`. |

#### `tags`

```yaml
tags: ["arrakeen", "betrayal", "harkonnen-attack"]
```

#### `factions`

```yaml
factions: ["atreides", "harkonnen", "corrino"]
```

Reference the `id` field from `data/factions.yaml`. Available factions include: `atreides`, `harkonnen`, `corrino`, `bene-gesserit`, `spacing-guild`, `fremen`, `tleilaxu`, `ixians`, `thinking-machines`, `honored-matres`, `sardaukar`, `choam`.

#### `characters`

```yaml
characters: ["paul-atreides", "stilgar", "baron-harkonnen"]
```

Character IDs follow the same kebab-case convention. Use the format `firstname-lastname` (e.g., `leto-ii`, `duncan-idaho`, `jessica-atreides`).

---

### Source Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `books` | array of [BookReference](#bookreference-structure) | **Yes** (min 1) | Which novel(s) this event appears in. At least one is required. |

---

### Visual Override Fields

These are optional and rarely needed. The timeline renderer assigns visuals based on category and type by default.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `color` | string | No | Hex color override (e.g., `"#c4a435"`). Must match `^#[0-9a-fA-F]{6}$`. |
| `icon` | string | No | Icon identifier override. |
| `lane` | string | No | Force the event into a specific visual lane. |

---

### Era-Specific Fields

Required only when `type` is `era`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nesting_level` | integer (>= 0) | **Required for `era`** | Depth in the era hierarchy. `0` = top-level era, `1` = sub-era, `2` = sub-sub-era. |
| `parent_era` | string or null | **Required for `era`** | ID of the containing era, or `null` for top-level eras. |

#### Example: top-level era

```yaml
nesting_level: 0
parent_era: null
```

#### Example: nested sub-era

```yaml
nesting_level: 1
parent_era: corrino-empire        # Must be the id of a nesting_level 0 era
```

---

### Arc-Specific Fields

Required only when `type` is `arc`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `arc_events` | array of strings | **Required for `arc`** | Ordered list of event IDs that make up this narrative arc. Each ID must exist elsewhere in the data. |

```yaml
arc_events:
  - paul-fremen-acceptance
  - battle-of-arrakeen
  - paul-walks-into-desert
  - leto-ii-sandtrout-skin
  - leto-ii-death
```

---

## Event Types

Other Memory supports five event types. Each has different required fields and a different visual treatment on the timeline.

| Type | Visual Treatment | `date_end` | Extra Required Fields | When to Use |
|------|-----------------|------------|----------------------|-------------|
| `point` | Small dot or marker on the timeline axis | Not used | None | A discrete moment: a battle, a birth, a speech. Most events are points. |
| `span` | Horizontal bar stretching from start to end | **Required** | None | Something that lasted a period of time: a war, a journey, a siege. |
| `milestone` | Enlarged, elevated marker with extra visual emphasis | Not used | None | A pivotal moment that changed the course of history. Use sparingly -- only for events that altered the trajectory of the entire universe. |
| `era` | Background band behind other events | **Required** | `nesting_level`, `parent_era` | A named historical period. Renders as a colored backdrop. Defined in `data/eras.yaml`, not in `data/events/`. |
| `arc` | Connecting line or thread linking multiple events | Optional | `arc_events` | A narrative thread that connects events across time. Defined in `data/arcs/`. |

### Choosing the Right Type

- **Is it a single moment?** Use `point`.
- **Did it span multiple years?** Use `span`.
- **Is it one of the ~20 most pivotal moments in the entire saga?** Use `milestone` instead of `point`.
- **Is it a named historical period (like "Corrino Empire")?** Use `era`.
- **Is it a thematic thread connecting events across the timeline (like "The Golden Path")?** Use `arc`.

---

## Categories

Seven categories control the color theme and lane grouping of events.

| ID | Label | Color | Description |
|----|-------|-------|-------------|
| `political` | Political | `#c4a435` (gold) | Governance, dynasties, power shifts, treaties, succession |
| `military` | Military | `#b83a3a` (red) | Battles, wars, conquests, military campaigns |
| `ecological` | Ecological | `#2a9d6e` (green) | Planetary changes, spice cycle, sandworm activity, terraforming |
| `religious` | Religious | `#7b4db5` (purple) | Bene Gesserit, Zensunni, Orange Catholic Bible, prophecy, Missionaria Protectiva |
| `technological` | Technological | `#4a8db5` (blue) | Thinking machines, inventions, the Butlerian prohibition, navigation |
| `personal` | Personal | `#d4c5a9` (tan) | Births, deaths, marriages, personal milestones, character moments |
| `cultural` | Cultural | `#c47a35` (orange) | Social changes, traditions, Fremen customs, artistic works |

### Choosing a Category

Pick the **primary** nature of the event. If an event fits multiple categories, choose the one that best describes *why the event matters*:

- The Battle of Arrakeen is `military` even though it had political consequences.
- Paul being accepted by the Fremen is `cultural` even though Paul is a political figure.
- Leto II taking the sandtrout skin is `personal` even though it shaped galactic politics.

---

## Significance Levels

Significance controls which events appear at different zoom levels. Higher significance events remain visible when the user is zoomed out; lower significance events only appear when zoomed in.

| Level | Meaning | Guideline | Examples |
|-------|---------|-----------|---------|
| **1** | Minor detail | A footnote, an offhand mention, a small character moment. Only visible at maximum zoom. | A character's memory of a past conversation; a minor skirmish mentioned in passing. |
| **2** | Notable but local | Affects a single planet, faction, or character's trajectory. | A regional political shift; a secondary character's death; founding of a minor school. |
| **3** | Significant event | A major occurrence within its era. Most well-known events from the books. | Paul rides a sandworm; a major battle; the Great Surrender Ceremony. |
| **4** | Major turning point | Changed the direction of a faction, planet, or major character's life permanently. | Paul accepted by the Fremen; Paul blinded by stone burner; fall of a Great House. |
| **5** | Universe-altering | One of the handful of events that fundamentally reshaped all of human civilization. Use very sparingly. | Butlerian Jihad; Battle of Arrakeen; Leto II's death; Paul walking into the desert. |

**When in doubt, underestimate.** It is easier to raise significance during review than to lower it. A timeline where everything is significance 5 is useless.

---

## Date Precision

How confident are we in the year assigned to this event?

| Value | Meaning | When to Use | Example |
|-------|---------|-------------|---------|
| `exact` | The source explicitly states the year. | A book says "in 10,191 AG" or we can compute the exact year from stated facts. | Battle of Arrakeen: 10,193 AG |
| `approximate` | The source says "around" or "roughly" this year. | The book says "around this time" or "roughly a century later." | Paul rides the sandworm: ~10,192 AG |
| `estimated` | Inferred from context by contributors. | No explicit date, but we can reason about it from other dated events. | Miles Teg's stand on Gammu: ~15,240 AG |
| `unknown` | Only the general era is known. | The event is mentioned but with no temporal anchoring beyond "during the Butlerian Jihad." | Place within the appropriate parent era. |

---

## BookReference Structure

Every event must cite at least one book source. The `books` field is an array of BookReference objects:

```yaml
books:
  - book_id: dune-1965
    chapters: ["Book Two", "Book Three"]
    notes: "Central event of the novel"
  - book_id: paul-of-dune-2008
    notes: "Depicted in flashback chapters"
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `book_id` | string | **Yes** | Must match an `id` in `data/books.yaml`. |
| `chapters` | array of strings | No | Which chapters or sections mention this event. |
| `notes` | string | No | Brief context about how the book references this event. |

### Available Book IDs

The full list is in `data/books.yaml`. Common ones include:

| `book_id` | Title | Author |
|-----------|-------|--------|
| `dune-1965` | Dune | Frank Herbert |
| `dune-messiah-1969` | Dune Messiah | Frank Herbert |
| `children-of-dune-1976` | Children of Dune | Frank Herbert |
| `god-emperor-of-dune-1981` | God Emperor of Dune | Frank Herbert |
| `heretics-of-dune-1984` | Heretics of Dune | Frank Herbert |
| `chapterhouse-dune-1985` | Chapterhouse: Dune | Frank Herbert |
| `butlerian-jihad-2002` | Dune: The Butlerian Jihad | Brian Herbert & Kevin J. Anderson |
| `house-atreides-1999` | Dune: House Atreides | Brian Herbert & Kevin J. Anderson |

See `data/books.yaml` for the complete list of all novels across every series.

---

## ID Naming Conventions

All IDs in the project use **kebab-case**: lowercase letters, digits, and hyphens.

| Entity | Convention | Examples |
|--------|-----------|----------|
| Events | Descriptive slug of the event | `battle-of-arrakeen`, `paul-walks-into-desert` |
| Eras | Period name | `corrino-empire`, `muad-dib-reign` |
| Arcs | Prefixed with `arc-` | `arc-golden-path`, `arc-kwisatz-haderach` |
| Books | `title-year` format | `dune-1965`, `house-atreides-1999` |
| Factions | Organization name | `bene-gesserit`, `spacing-guild` |
| Characters | `firstname-lastname` | `paul-atreides`, `duncan-idaho`, `leto-ii` |
| Categories | Single descriptive word | `political`, `military`, `ecological` |

### Rules

- Must start and end with a lowercase letter or digit (not a hyphen).
- No underscores, spaces, or uppercase letters.
- Must be unique across the entire dataset -- no two events can share an ID, even if they are in different files.
- Keep IDs reasonably short but descriptive enough to identify the event at a glance.
