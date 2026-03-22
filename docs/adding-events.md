# Adding Events

A step-by-step guide for contributing new events to Other Memory. Whether you are adding a minor detail from the Appendix of *Dune* or a galaxy-shaking battle from the Legends of Dune trilogy, this guide walks you through the process.

If you are new to Git and YAML, do not worry -- we explain everything you need.

---

## Table of Contents

- [Step 1: Find the Right File](#step-1-find-the-right-file)
- [Step 2: Copy the Event Template](#step-2-copy-the-event-template)
- [Step 3: Choose the Event Type](#step-3-choose-the-event-type)
- [Step 4: Set the Date](#step-4-set-the-date)
- [Step 5: Assign Significance](#step-5-assign-significance)
- [Step 6: Pick a Category](#step-6-pick-a-category)
- [Step 7: Add Characters and Factions](#step-7-add-characters-and-factions)
- [Step 8: Cite Your Book Sources](#step-8-cite-your-book-sources)
- [Step 9: Validate Locally](#step-9-validate-locally)
- [Common Mistakes](#common-mistakes)

---

## Step 1: Find the Right File

Events live in `data/events/` and are organized by era:

| File | Era / Period |
|------|-------------|
| `data/events/butlerian-jihad.yaml` | Butlerian Jihad and machine wars (~200 BG -- 88 BG) |
| `data/events/corrino-empire.yaml` | The Corrino Empire period |
| `data/events/prelude-era.yaml` | Prelude to Dune era (~10,140 -- 10,191 AG) |
| `data/events/dune-saga.yaml` | Frank Herbert's original six novels (10,191 -- 15,280 AG) |
| `data/events/god-emperor.yaml` | God Emperor period (~10,219 -- 13,728 AG) |
| `data/events/the-scattering.yaml` | The Scattering and Famine Times |
| `data/events/return-and-kralizec.yaml` | Return from the Scattering and Kralizec |

Find the file that matches the time period of your event and add it there.

**Tip:** If you are unsure which file, look at the `date_start` of your event and compare with the existing events in each file.

---

## Step 2: Copy the Event Template

Copy this template into the appropriate file. Place it in roughly chronological order among the other events in that file.

```yaml
- id: your-event-slug
  type: point
  title: "Event Title"
  subtitle: "Optional secondary line"
  description: "A 1-3 sentence summary of what happened. Must be 10-500 characters."
  detailed: |
    Optional long-form description. Markdown is supported here.
    Use this for nuance, context, and date-sourcing notes.
  date_start: 10191
  # date_end: 10193               # Uncomment for span events
  date_precision: exact
  significance: 3
  category: military
  tags: ["arrakis", "example-tag"]
  factions: ["atreides"]
  characters: ["paul-atreides"]
  books:
    - book_id: dune-1965
      chapters: ["Book Two"]
      notes: "Described in detail"
```

### Required vs. Optional Fields

**Required** (every event must have these):
- `id`, `type`, `title`, `description`
- `date_start`, `date_precision`
- `significance`, `category`
- `books` (at least one entry)

**Optional:**
- `subtitle`, `detailed`
- `date_end` (required only for `span` and `era` types)
- `tags`, `factions`, `characters` (default to empty arrays if omitted)
- `color`, `icon`, `lane` (visual overrides -- rarely needed)

---

## Step 3: Choose the Event Type

| Type | Use When... | Example |
|------|-------------|---------|
| `point` | A discrete moment in time. This is the default for most events. | Paul rides a sandworm, a character dies, a treaty is signed. |
| `span` | Something that lasted a defined period of years. Requires `date_end`. | Muad'Dib's Jihad (10,193--10,198 AG), the Famine Times. |
| `milestone` | A single moment that fundamentally altered the universe. Use sparingly -- perhaps 15--20 milestones across the entire timeline. | Battle of Arrakeen, death of the God Emperor, Leto II taking the sandtrout skin. |
| `era` | A named historical period. **Do not use this in `data/events/` files.** Eras belong in `data/eras.yaml`. See [Adding Eras](adding-eras.md). | Corrino Empire, Reign of Muad'Dib. |
| `arc` | A narrative thread connecting existing events. **Do not use this in `data/events/` files.** Arcs belong in `data/arcs/`. See [Adding Arcs](adding-arcs.md). | The Golden Path, the Kwisatz Haderach. |

**The vast majority of new contributions will be `point` events.** If you are unsure, use `point`.

---

## Step 4: Set the Date

All dates are in AG (After Guild) years. Use negative numbers for BG (Before Guild).

```yaml
date_start: 10191        # 10,191 AG
date_start: -201         # 201 BG (the negative sign means "before the Guild's founding")
```

For events that span time, add `date_end`:

```yaml
date_start: 10193
date_end: 10198           # Muad'Dib's Jihad lasted ~5 years
```

### Date Precision

Be honest about how confident the date is.

| Precision | When to Use | Example |
|-----------|-------------|---------|
| `exact` | The novel or source gives a specific year, or it can be computed unambiguously. | "The Battle of Arrakeen took place in 10,193 AG." |
| `approximate` | The source says "around" or "roughly." | "Paul rode a sandworm sometime during his second year with the Fremen." |
| `estimated` | You are inferring the year from context and other dated events. Add a note in the `detailed` field explaining your reasoning. | "Working backward from Children of Dune's '9 years later' statement..." |
| `unknown` | Only the era is known. Place the event within a parent era. | "Sometime during the Butlerian Jihad." |

**If you used `estimated`, please explain your reasoning in the `detailed` field.** This helps reviewers and future contributors understand the logic.

---

## Step 5: Assign Significance

Significance controls visibility at different zoom levels. This is one of the most important decisions you will make.

| Level | Ask Yourself | Examples |
|-------|-------------|---------|
| **1** | "Would only a deep-lore fan care about this?" | A minor character's backstory detail; an offhand reference to a past event. |
| **2** | "Does this matter to one planet or one faction?" | A regional political change; the founding of a minor school; a secondary character's death. |
| **3** | "Would a reader of the relevant book remember this event?" | Paul rides a sandworm; the Great Surrender Ceremony; Miles Teg's stand on Gammu. |
| **4** | "Did this change a major character's life or a faction's direction?" | Paul accepted by the Fremen; Paul blinded by the stone burner; Shaddam IV exiled. |
| **5** | "Did this reshape the entire Known Universe?" | Battle of Arrakeen; Butlerian Jihad; death of the God Emperor; Paul walking into the desert. |

**When in doubt, go lower.** Reviewers may suggest raising it, and that is much easier than defending an inflated score. A significance-5 event should be something *every* Dune reader knows about.

---

## Step 6: Pick a Category

Choose the **primary** nature of the event. If it fits multiple categories, pick the one that best describes why the event matters.

| Category | When to Use |
|----------|-------------|
| `political` | Governance, power shifts, treaties, succession, exile |
| `military` | Battles, wars, conquests, campaigns |
| `ecological` | Planetary changes, spice cycle, terraforming, sandworm activity |
| `religious` | Bene Gesserit actions, prophecy, Missionaria Protectiva, the Orange Catholic Bible |
| `technological` | Inventions, thinking machines, the Butlerian prohibition, navigation technology |
| `personal` | Births, deaths, marriages, personal milestones, character moments |
| `cultural` | Social changes, traditions, Fremen customs, artistic or cultural shifts |

**Examples of judgment calls:**

- *Paul accepted by the Fremen* -- he is a political figure, but the event itself is about cultural integration. Use `cultural`.
- *Leto II takes the sandtrout skin* -- it has enormous political implications, but the act itself is deeply personal. Use `personal`.
- *Battle of Arrakeen* -- clearly `military`, even though it had political and religious consequences.

---

## Step 7: Add Characters and Factions

### Factions

Reference faction IDs from `data/factions.yaml`. Only include factions that are **directly involved** in the event, not merely affected by it.

```yaml
factions: ["atreides", "harkonnen", "corrino", "sardaukar"]
```

Available factions: `atreides`, `harkonnen`, `corrino`, `bene-gesserit`, `spacing-guild`, `fremen`, `tleilaxu`, `ixians`, `thinking-machines`, `honored-matres`, `sardaukar`, `choam`.

### Characters

Use kebab-case IDs in `firstname-lastname` format:

```yaml
characters: ["paul-atreides", "stilgar", "baron-harkonnen"]
```

Only include characters who **play an active role** in the event. If Paul is merely mentioned in passing, do not include him.

**Note:** Character IDs are not yet validated against a separate characters file, but consistency matters. Search existing events to find the established ID for a character before inventing a new one. For example, use `leto-i-atreides` (not `duke-leto`) and `leto-ii` (not `leto-ii-atreides`).

---

## Step 8: Cite Your Book Sources

Every event **must** reference at least one book. This powers the spoiler-free reading mode -- users who have only read *Dune* will not see events from *Children of Dune*.

```yaml
books:
  - book_id: dune-1965
    chapters: ["Book Two"]
    notes: "Central event of the novel"
```

### Structure

| Field | Required | Description |
|-------|----------|-------------|
| `book_id` | **Yes** | ID from `data/books.yaml` (e.g., `dune-1965`, `dune-messiah-1969`). |
| `chapters` | No | Which chapters or sections mention this event. |
| `notes` | No | Brief context (e.g., "mentioned in passing," "central event"). |

### Multiple Sources

If an event is covered in multiple books, list them all:

```yaml
books:
  - book_id: dune-messiah-1969
    notes: "Referenced as recent history"
  - book_id: paul-of-dune-2008
    notes: "Depicted in detail"
```

### Finding the Right `book_id`

Common IDs for Frank Herbert's original series:

| Book | `book_id` |
|------|-----------|
| Dune | `dune-1965` |
| Dune Messiah | `dune-messiah-1969` |
| Children of Dune | `children-of-dune-1976` |
| God Emperor of Dune | `god-emperor-of-dune-1981` |
| Heretics of Dune | `heretics-of-dune-1984` |
| Chapterhouse: Dune | `chapterhouse-dune-1985` |

See `data/books.yaml` for the full list, including all Brian Herbert and Kevin J. Anderson novels.

---

## Step 9: Validate Locally

Before submitting your changes, run the validator to catch errors early.

```bash
# First time only:
npm install

# Validate all data files:
npm run validate
```

The validator checks:

- YAML syntax errors
- Schema compliance (required fields, correct types, string length limits)
- Referential integrity (`book_id` values exist in `data/books.yaml`, faction IDs exist in `data/factions.yaml`)
- No duplicate IDs across all event files
- Date consistency (`date_end` >= `date_start` for spans and eras)
- ID format (kebab-case pattern)

Fix any errors the validator reports before submitting your pull request.

---

## Common Mistakes

### 1. Missing `date_end` on a span

```yaml
# WRONG -- spans require date_end
- id: muad-dib-jihad
  type: span
  date_start: 10193
  # date_end is missing!
```

```yaml
# CORRECT
- id: muad-dib-jihad
  type: span
  date_start: 10193
  date_end: 10198
```

### 2. Uppercase or underscores in IDs

```yaml
# WRONG
id: Battle_of_Arrakeen
id: PaulAtreides

# CORRECT
id: battle-of-arrakeen
id: paul-atreides
```

### 3. Description too short

The `description` field must be at least 10 characters. A one-word description will fail validation.

```yaml
# WRONG
description: "Paul dies"

# CORRECT
description: "Paul Atreides walks into the desert following the Fremen tradition for the blind."
```

### 4. Missing `books` field

Every event needs at least one book reference. Even if you learned about the event from a wiki, trace it back to its novel source.

```yaml
# WRONG -- no books field
- id: some-event
  type: point
  title: "Something"
  description: "Something happened."
  ...

# CORRECT
  books:
    - book_id: dune-1965
      notes: "Mentioned in the Appendix"
```

### 5. Inflated significance

Not every event is universe-altering. Ask yourself: "If I told a casual Dune reader this event happened, would they say 'so what?'" If yes, it is probably significance 1 or 2.

### 6. Wrong category

Pick the category that describes the *nature* of the event, not its *consequences*. A birth is `personal` even if the person born later becomes Emperor.

### 7. Forgetting to check for duplicates

Before adding an event, search the existing YAML files for similar events. If the event already exists but is missing detail, update the existing entry rather than creating a duplicate.

### 8. YAML indentation errors

YAML is sensitive to indentation. Use **2 spaces** (not tabs) for each level.

```yaml
# WRONG -- mixed indentation
books:
    - book_id: dune-1965
  chapters: ["Book Two"]

# CORRECT -- consistent 2-space indentation
books:
  - book_id: dune-1965
    chapters: ["Book Two"]
```

---

## Next Steps

Once your event is ready and validated:

1. Commit your changes with a descriptive message.
2. Open a pull request.

See [Contribution Workflow](contribution-workflow.md) for the full process.
