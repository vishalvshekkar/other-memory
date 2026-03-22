# Adding Narrative Arcs

Narrative arcs are thematic threads that connect related events across the Other Memory timeline. While a regular event describes *what happened*, an arc describes *a story that unfolded through multiple events over time*.

All arcs are defined in `data/arcs/`, with one YAML file per arc.

---

## Table of Contents

- [What Is a Narrative Arc?](#what-is-a-narrative-arc)
- [When to Create an Arc vs. Using Tags](#when-to-create-an-arc-vs-using-tags)
- [The `arc_events` Field](#the-arc_events-field)
- [Creating a New Arc](#creating-a-new-arc)
- [Example: The Golden Path](#example-the-golden-path)
- [Example: The Kwisatz Haderach](#example-the-kwisatz-haderach)
- [Guidelines](#guidelines)

---

## What Is a Narrative Arc?

A narrative arc connects a sequence of existing events into a story thread. On the timeline, arcs render as a connecting line or visual thread that links their constituent events, making it easy to follow a single narrative across thousands of years.

For example, "The Golden Path" connects:

1. Paul being accepted by the Fremen (10,191 AG)
2. The Battle of Arrakeen (10,193 AG)
3. Paul walking into the desert (10,210 AG)
4. Leto II taking the sandtrout skin (10,219 AG)
5. The death of the God Emperor (13,728 AG)

These events span over 3,500 years, but the arc draws a visible connection between them, telling the story of Leto II's plan for humanity.

---

## When to Create an Arc vs. Using Tags

Both arcs and tags can group related events. Here is when to use each:

| | Arc | Tags |
|-|-----|------|
| **Purpose** | Tells a story with a beginning, middle, and end | Groups events by topic or theme |
| **Order matters?** | Yes -- events are listed in narrative order | No -- tags are unordered |
| **Visual treatment** | Connecting line on the timeline | Filter/search functionality |
| **Scope** | Typically spans a large portion of the timeline | Any scope |
| **Examples** | The Golden Path, The Kwisatz Haderach | `"arrakis"`, `"spice"`, `"fremen-ways"` |

**Create an arc when:**
- There is a clear narrative progression through multiple events.
- A reader would benefit from seeing these events connected visually.
- The thread spans a significant portion of the timeline (typically hundreds or thousands of years).

**Use tags instead when:**
- The events share a theme but do not form a narrative sequence.
- The grouping is geographic (e.g., "all events on Arrakis") or topical (e.g., "all events involving spice").
- There is no meaningful order to the events.

---

## The `arc_events` Field

The `arc_events` field is an ordered array of event IDs. Each ID must reference an event that already exists in `data/events/` or `data/eras.yaml`.

```yaml
arc_events:
  - paul-fremen-acceptance       # First event in the arc
  - battle-of-arrakeen
  - paul-walks-into-desert
  - leto-ii-sandtrout-skin
  - leto-ii-death                # Last event in the arc
```

**Key rules:**

- Every ID in `arc_events` must exist elsewhere in the dataset. The validator checks this.
- The order represents the narrative sequence, which should generally follow chronological order.
- You do not need to include every related event -- just the key moments that define the arc's story.
- An event can appear in multiple arcs (e.g., `battle-of-arrakeen` is in both the Golden Path arc and the Kwisatz Haderach arc).

---

## Creating a New Arc

### Step 1: Create a New File

Create a new YAML file in `data/arcs/` named after your arc:

```
data/arcs/your-arc-name.yaml
```

Use kebab-case for the filename (e.g., `golden-path.yaml`, `kwisatz-haderach.yaml`).

### Step 2: Define the Arc

An arc has all the standard event fields plus the `arc_events` field. Here is the template:

```yaml
# Brief comment describing the arc
- id: arc-your-arc-name
  type: arc
  title: "Arc Title"
  subtitle: "Short tagline"
  description: "1-3 sentence summary of the narrative thread."
  date_start: 100               # AG year of the first arc event
  date_end: 15000               # AG year of the last arc event (optional for arcs)
  date_precision: approximate
  significance: 5
  category: political
  tags: ["relevant-tags"]
  factions: ["relevant-factions"]
  characters: ["key-characters"]
  books:
    - book_id: dune-1965
      notes: "How this book relates to the arc"
    - book_id: children-of-dune-1976
      notes: "How this book relates to the arc"
  arc_events:
    - first-event-id
    - second-event-id
    - third-event-id
```

### Step 3: Verify Event IDs

Make sure every event ID in `arc_events` exists in the data files. You can search the existing event files:

```bash
# Search for an event ID across all data files
grep -r "id: battle-of-arrakeen" data/
```

### Step 4: Validate

```bash
npm run validate
```

The validator checks that:
- `arc_events` is present (required for `type: arc`)
- Every ID in `arc_events` exists in the dataset
- Standard schema compliance (required fields, correct types)

---

## Example: The Golden Path

File: `data/arcs/golden-path.yaml`

```yaml
- id: arc-golden-path
  type: arc
  title: "The Golden Path"
  subtitle: "Leto II's plan for humanity's survival"
  description: "A prescient vision of the only path that ensures humanity's long-term survival, requiring millennia of tyrannical rule followed by enforced diaspora."
  date_start: 10193
  date_end: 15350
  date_precision: exact
  significance: 5
  category: political
  tags: ["golden-path", "prescience", "survival"]
  factions: ["atreides"]
  characters: ["paul-atreides", "leto-ii", "siona-atreides"]
  books:
    - book_id: dune-1965
      notes: "Paul first glimpses the Golden Path"
    - book_id: children-of-dune-1976
      notes: "Leto II commits to the path"
    - book_id: god-emperor-of-dune-1981
      notes: "Central theme"
    - book_id: heretics-of-dune-1984
      notes: "Consequences unfold"
  arc_events:
    - paul-fremen-acceptance
    - battle-of-arrakeen
    - paul-walks-into-desert
    - leto-ii-sandtrout-skin
    - leto-ii-death
```

This arc tells the story of Leto II's vision: from Paul's first steps among the Fremen, through the pivotal battles, to Paul's departure, Leto II's transformation, and finally the God Emperor's planned death that triggered the Scattering.

---

## Example: The Kwisatz Haderach

File: `data/arcs/kwisatz-haderach.yaml`

```yaml
- id: arc-kwisatz-haderach
  type: arc
  title: "The Kwisatz Haderach"
  subtitle: "The Bene Gesserit's millennia-long breeding program"
  description: "The Bene Gesserit's ten-thousand-year genetic program to produce a male who can bridge space and time, see where they cannot look, and ultimately shape humanity's destiny."
  date_start: -400
  date_end: 15264
  date_precision: approximate
  significance: 5
  category: religious
  tags: ["kwisatz-haderach", "breeding-program", "bene-gesserit", "superbeing", "prescience"]
  factions: ["bene-gesserit", "atreides"]
  characters: ["gaius-helen-mohiam", "jessica-atreides", "paul-atreides", "leto-ii", "duncan-idaho"]
  books:
    - book_id: dune-1965
      notes: "Paul revealed as the Kwisatz Haderach"
    - book_id: house-atreides-1999
      notes: "Jessica's role in the program"
    - book_id: god-emperor-of-dune-1981
      notes: "Leto II's continuation of genetic destiny"
    - book_id: sandworms-of-dune-2007
      notes: "Duncan Idaho as the ultimate Kwisatz Haderach"
  arc_events:
    - sorceresses-breeding-records
    - raquella-first-reverend-mother
    - bene-gesserit-formalized
    - bene-gesserit-breeding-program-matures
    - paul-atreides-born
    - battle-of-arrakeen
    - leto-ii-sandtrout-skin
    - duncan-idaho-ultimate-kwisatz-haderach
```

This arc spans almost the entire timeline -- from the earliest Bene Gesserit activities (400 BG) to Duncan Idaho's role in the finale (15,264 AG) -- threading together the millennia-long breeding program.

---

## Guidelines

- **Prefix arc IDs with `arc-`** to distinguish them from regular events (e.g., `arc-golden-path`, not `golden-path`).
- **One arc per file.** Each file in `data/arcs/` should contain exactly one arc definition.
- **Keep arc_events focused.** Include the key turning points, not every related event. An arc with 50 events is hard to follow visually; aim for 5--15 events.
- **Set significance thoughtfully.** Most arcs will be significance 4 or 5 since they represent major narrative threads.
- **Arcs are for readers, not encyclopedists.** The goal is to help someone follow a story across the timeline, not to catalog every tangentially related event. If in doubt, leave an event out of the arc and let tags handle the broader association.
