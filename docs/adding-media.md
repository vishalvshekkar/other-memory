# Adding Movies & TV Shows

A step-by-step guide for adding or updating screen adaptation entries in Other Memory. These entries appear as colored media bands on the timeline, showing which portions of the Dune chronology each film or TV show covers.

---

## Table of Contents

- [When to Add a New Entry](#when-to-add-a-new-entry)
- [Step 1: Open the Media Data File](#step-1-open-the-media-data-file)
- [Step 2: Copy the Template](#step-2-copy-the-template)
- [Step 3: Fill In the Fields](#step-3-fill-in-the-fields)
- [Step 4: Determine Timeline Coverage](#step-4-determine-timeline-coverage)
- [Step 5: Choose a Color](#step-5-choose-a-color)
- [Step 6: Validate](#step-6-validate)
- [How Media Bands Appear on the Timeline](#how-media-bands-appear-on-the-timeline)

---

## When to Add a New Entry

Add a new media entry when:

- A **new Dune film** is announced with enough detail to determine its timeline coverage (source novel, approximate AG year range).
- A **new Dune TV series or miniseries** premieres or is officially confirmed.
- An **existing entry** needs correction (wrong release year, updated timeline range, new season information).

Do **not** add entries for:

- Unconfirmed rumors or early-stage projects with no official announcement.
- Documentaries or behind-the-scenes content (these are not narrative adaptations).
- Fan films (only officially produced adaptations).

---

## Step 1: Open the Media Data File

All screen adaptation entries live in a single file:

```
data/media.yaml
```

Open this file in any text editor. Entries are organized into sections by type: Films, TV Miniseries, and TV Series. Add your new entry in the appropriate section.

---

## Step 2: Copy the Template

### Film Template

```yaml
- id: your-film-slug
  title: "Film Title"
  type: film
  release_year: 2025
  director: "Director Name"
  timeline_start: 10190
  timeline_end: 10193
  adapts: "Source Novel (year)"
  color: "#hexcolor"
  description: "1-3 sentence summary of the adaptation."
```

### TV Series Template

```yaml
- id: your-series-slug
  title: "Series Title"
  type: tv-series
  release_year: 2025
  end_year: 2027
  creator: "Creator Name"
  network: "Network / Platform"
  timeline_start: 10
  timeline_end: 191
  adapts: "Source material description"
  color: "#hexcolor"
  description: "1-3 sentence summary of the adaptation."
```

### TV Miniseries Template

```yaml
- id: your-miniseries-slug
  title: "Miniseries Title"
  type: tv-miniseries
  release_year: 2025
  director: "Director Name"
  network: "Network / Platform"
  timeline_start: 10190
  timeline_end: 10193
  adapts: "Source Novel (year)"
  color: "#hexcolor"
  description: "1-3 sentence summary of the adaptation."
```

---

## Step 3: Fill In the Fields

### Required Fields (all types)

| Field | Description |
|-------|-------------|
| `id` | Unique kebab-case slug. Convention: `title-slug-year` (e.g., `dune-villeneuve-2021`). |
| `title` | The official title of the film or show. |
| `type` | One of: `film`, `tv-series`, `tv-miniseries`. |
| `release_year` | Year the film premiered or the series first aired. |
| `timeline_start` | Earliest AG year the adaptation's story covers. |
| `timeline_end` | Latest AG year the adaptation's story covers. |
| `adapts` | Which novel(s) the adaptation is based on (e.g., `"Dune (1965)"` or `"Dune Messiah (1969) + Children of Dune (1976)"`). |
| `color` | Hex color string for the media band (see [Color Guidelines](#step-5-choose-a-color)). |
| `description` | 1-3 sentence summary of the adaptation. |

### Optional Fields

| Field | When to Use |
|-------|-------------|
| `end_year` | For TV series that span multiple years/seasons. Omit for single-season shows and films. |
| `director` | For films and miniseries with a single director. |
| `creator` | For TV series — the showrunner or creator. |
| `network` | For TV shows — the network or streaming platform (e.g., `"HBO / Max"`, `"Sci Fi Channel"`). |

You can include both `director` and `creator` if appropriate.

---

## Step 4: Determine Timeline Coverage

The `timeline_start` and `timeline_end` fields represent the in-universe AG years the adaptation's story spans. To determine these:

1. **Identify the source novel(s).** Check the `adapts` field.
2. **Look up the novel's timeline range** in `data/books.yaml`. The `timeline_start` and `timeline_end` fields in the book entry give you the novel's full coverage.
3. **Narrow if the adaptation only covers part of a novel.** For example, *Dune: Part One* (2021) only covers the first half of *Dune*, so its `timeline_end` is 10,191 rather than the novel's full range ending at 10,193.
4. **Widen if the adaptation combines multiple novels.** For example, *Frank Herbert's Children of Dune* (2003) adapts both *Dune Messiah* and *Children of Dune*, so its range spans 10,193 to 10,219.

### Reference: Source Novel Timeline Ranges

| Novel | `timeline_start` | `timeline_end` |
|-------|-------------------|-----------------|
| Dune (1965) | 10,190 | 10,193 |
| Dune Messiah (1969) | 10,193 | 10,210 |
| Children of Dune (1976) | 10,210 | 10,219 |
| Sisterhood of Dune era | ~10 | ~191 |

For the complete list, see `data/books.yaml`.

---

## Step 5: Choose a Color

Each media band has a distinct color so users can distinguish overlapping adaptations at a glance.

### Guidelines

- **Use warm tones** (golds, ambers, oranges) for Villeneuve's film series to reflect its visual identity.
- **Use cool tones** (blues, teals) for the Sci Fi Channel miniseries.
- **Use purples or other distinctive hues** for shows set outside the main saga era (like Dune: Prophecy).
- **Avoid colors that clash** with the existing event category palette (reds for military, greens for ecological, etc.) — media bands should be visually distinct from event markers.
- **Check existing entries** in `data/media.yaml` to ensure your new color is distinguishable from neighbors.

### Existing Colors (for reference)

| Adaptation | Color |
|------------|-------|
| Dune (Lynch, 1984) | `#8b6b2f` (dark gold) |
| Dune: Part One (2021) | `#c4841d` (amber) |
| Dune: Part Two (2024) | `#d4943d` (light amber) |
| Dune: Part Three (2026) | `#e4a44d` (pale gold) |
| Frank Herbert's Dune (2000) | `#4a8db5` (blue) |
| Children of Dune (2003) | `#5a9dc5` (light blue) |
| Dune: Prophecy (2024) | `#7b4db5` (purple) |

---

## Step 6: Validate

Before submitting, ensure your YAML is well-formed:

```bash
npm install        # First time only
npm run validate   # Validate all data files
```

Note: `data/media.yaml` does not yet have full JSON Schema validation like the event files. However, `npm run validate` still checks that the file is valid YAML. Additionally, the TypeScript types in `src/types/index.ts` (`MediaEntry` interface) define the expected shape — the app will fail to compile if the loaded data does not match.

---

## How Media Bands Appear on the Timeline

Media bands are rendered in a dedicated region below the book-sourced events and above the time axis:

```
  Events area     ┆  diamonds, circles, bars (book events)
  ────────────────┆──────────────────────────────────
  Media bands     ┆  ▐█████ Dune: Part One ██████▌    colored bands
                  ┆  ▐██████ Dune (Lynch) ███████▌    with sprocket holes
  ────────────────┆──────────────────────────────────
  Time axis       ┆  |  10190  |  10191  |  10192  |
```

Key visual details:

- **Sprocket-hole film-strip effect** along the top and bottom edges of each band distinguishes media bands from era bands.
- **Band width** corresponds to the `timeline_start` through `timeline_end` range at the current zoom level.
- **Band color** comes from the entry's `color` field.
- **Toggle visibility** with the "Media" button in the header toolbar.
- **Click a band** to see full details: title, type, director/creator, release year, network, source material, timeline coverage, and description.

Media bands are visually separated from book-sourced events to make clear that these represent real-world adaptations, not in-universe historical records.

---

## Next Steps

Once your entry is ready and validated:

1. Commit your changes with a descriptive message (e.g., `"Add: Dune Prophecy Season 2 media entry"`).
2. Open a pull request.

See [Contribution Workflow](contribution-workflow.md) for the full process.
