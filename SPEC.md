# Dune Timeline — Technical Specification

> An interactive, explorable timeline of the entire Dune universe spanning ~35,000 years of
> fictional history, anchored to real-world years, sourced from all novels by Frank Herbert
> and Brian Herbert & Kevin J. Anderson.

---

## 1. Vision & Audience

**Primary users:** Dune fans — readers, movie watchers, lore enthusiasts — who want to
explore the chronology of the universe. Some are mid-read and want to see where they are;
others have consumed everything and want the full picture.

**Secondary users:** Contributors who submit timeline data via pull requests.

**Core experience:** A single, continuous, zoomable timeline where time is the anchor axis.
Users can zoom from a 35,000-year birds-eye view down to individual days within a specific
book's events. At every zoom level, the timeline communicates *density* — even when
individual events aren't visible, users can see where the action clusters.

---

## 2. Calendar System

### 2.1 Primary Coordinate: AG (After Guild)

All dates in the system are stored in **AG** (After Guild) — the founding of the Spacing
Guild, which is year zero. Events before the Guild use negative AG values (historically
called "BG" — Before Guild).

| Calendar | Relationship |
|----------|-------------|
| AG 0 | Founding of the Spacing Guild |
| BG X | Equivalent to AG -X |
| CE (Common Era) | AG 0 ≈ 11,200 CE (configurable — see §2.2) |

### 2.2 Real-World Anchor

The mapping of AG 0 to a Common Era year is stored in a config file and is adjustable:

```yaml
# data/config.yaml
calendar:
  ag_zero_ce_year: 13160  # AG 0 = 13,160 CE (Expanded Dune canon)
  display_calendars:
    - id: ag
      label: "AG (After Guild)"
      primary: true
    - id: ce
      label: "CE (Common Era)"
      primary: false
```

This is derived from: 11,200 BG = 1960 CE (beginning of space travel), so AG 0 = 13,160 CE.

This means:
- Dune (10,191 AG) ≈ 23,351 CE
- Butlerian Jihad (-200 AG) ≈ 12,960 CE
- Today (2026 CE) ≈ 11,134 BG

The UI shows the primary calendar (AG) by default with a toggle to overlay CE years.
The CE mapping follows the Expanded Dune canon (Brian Herbert/KJA). The Dune Encyclopedia
uses a different anchor (16,200 BG = 0 CE) — the value is configurable for either system.

### 2.3 Date Precision

Not all events have exact dates. Every date carries a precision qualifier:

| Precision | Meaning | Example |
|-----------|---------|---------|
| `exact` | Known year (or finer) | "10,191 AG" |
| `approximate` | Roughly this period, ±decades | "~10,000 AG" |
| `estimated` | Scholarly guess, ±centuries | "~-1,500 AG" |
| `unknown` | Only era is known | "During the Butlerian Jihad" |

For `unknown` precision, events are placed within their parent era's bounds.

---

## 3. Data Model

### 3.1 Event Types

| Type | Description | Visual Treatment |
|------|-------------|-----------------|
| `point` | A discrete moment in time | Dot/marker on the timeline |
| `span` | Something that lasted a duration | Horizontal bar with start/end |
| `milestone` | A pivotal point event (elevated importance) | Larger marker with flag/banner |
| `era` | A named historical period | Background band/stripe |
| `arc` | A narrative thread connecting events | Connecting line between linked events |

### 3.2 Event Schema

```yaml
# Every event has these fields
id: string                  # Unique slug, e.g., "battle-of-corrin"
type: point | span | milestone | era | arc
title: string               # Short display name
subtitle: string?           # Optional secondary line
description: string         # 1-3 sentence summary (visible on hover/click)
detailed: string?           # Longer markdown content (visible in detail panel)

# Temporal placement
date_start: number          # AG year (negative for BG)
date_end: number?           # AG year — required for span/era, optional for point/milestone
date_precision: exact | approximate | estimated | unknown

# Classification
significance: 1-5           # 1=minor detail, 5=universe-altering
category: string            # See §3.4
tags: string[]              # Freeform tags for search/filter
factions: string[]          # e.g., ["atreides", "harkonnen", "spacing-guild"]
characters: string[]        # e.g., ["paul-atreides", "leto-ii"]

# Source attribution
books: BookReference[]      # Which books reference this event
  - book_id: string         # References books.yaml
    chapters: string[]?     # Optional chapter references
    notes: string?          # E.g., "mentioned in passing"

# Visual overrides (optional)
color: string?              # Hex color override
icon: string?               # Icon identifier
lane: string?               # Named lane for parallel display (see §5.3)

# Arc-specific (type=arc only)
arc_events: string[]?       # Ordered list of event IDs that form this arc
```

### 3.3 Book Schema

```yaml
id: string                  # e.g., "dune-1965"
title: string               # "Dune"
author: string              # "Frank Herbert"
publication_year: number    # 1965
series: string              # "original" | "prelude" | "legends" | "heroes" | "schools" | "caladan" | "great-schools"
series_order: number        # Reading/publication order within series
timeline_start: number      # Earliest AG year referenced
timeline_end: number        # Latest AG year referenced
color: string               # Theme color for this book's events
```

### 3.4 Categories

Categories control visual lane grouping and color theming:

| Category | Description | Default Color Palette |
|----------|-------------|-----------------------|
| `political` | Governance, dynasties, power shifts | Golds/ambers |
| `military` | Battles, wars, conquests | Reds/crimsons |
| `ecological` | Planetary changes, spice, sandworms | Greens/teals |
| `religious` | Bene Gesserit, Zensunni, Orange Catholic | Purples/violets |
| `technological` | Thinking machines, inventions, bans | Blues/silvers |
| `personal` | Births, deaths, marriages, character moments | Warm whites/creams |
| `cultural` | Social changes, traditions, arts | Oranges/corals |

### 3.5 Era Schema

Eras are a subtype of event but get special treatment as background context layers:

```yaml
id: "corrino-dynasty"
type: era
title: "Corrino Empire"
date_start: 0              # AG
date_end: 10193            # AG
significance: 5
category: political
nesting_level: 0           # 0=top-level era, 1=sub-era, 2=sub-sub-era
parent_era: null            # or ID of parent era for nesting
```

Eras can nest: "Corrino Empire" contains "Reign of Shaddam IV" contains "Arrakis Conflict."

---

## 4. Zoom System

### 4.1 Zoom Tiers

The timeline operates on a continuous zoom scale, but behavior changes at tier boundaries:

| Tier | Time Window | Granularity | Min Significance Shown | Behavior |
|------|-------------|-------------|----------------------|----------|
| 1 | 35,000+ years | Millennia | 5 only | Full timeline, only eras + universe-altering events |
| 2 | 5,000-35,000 years | Centuries | 4+ | Major eras and pivotal events |
| 3 | 500-5,000 years | Decades | 3+ | Named periods, important events |
| 4 | 50-500 years | Years | 2+ | Most events visible, spans shown |
| 5 | 5-50 years | Months | 1+ | All events, full detail |
| 6 | <5 years | Days/Weeks | 1+ | Maximum detail, all content |

Zoom is **continuous** (not snapped to tiers). Tiers define when rendering behavior
transitions (e.g., when labels appear, when clustering kicks in).

### 4.2 Clustering & Hotspots

When events overlap or are too close to distinguish at the current zoom level:

1. **Spatial clustering:** Events within N pixels of each other merge into a cluster node
2. **Cluster display:** Shows (a) count badge, (b) highest-significance event title, (c) category color blend
3. **Density heatmap:** A subtle gradient strip along the timeline axis showing event density — always visible at all zoom levels. Brighter = more events. This is the "hotspot" indicator.
4. **Cluster interaction:** Click to zoom into that cluster's time range. Hover to see a preview list.

### 4.3 Zoom Controls

| Action | Effect |
|--------|--------|
| Scroll wheel / trackpad pinch | Continuous zoom centered on cursor |
| `+` / `-` keys | Step zoom in/out |
| `1`-`6` keys | Jump to zoom tier |
| `0` key | Fit entire timeline |
| Double-click | Zoom into clicked region |
| Minimap click | Jump to that position |

---

## 5. Layout & Navigation

### 5.1 Orientation Modes

| Mode | Description | Best For |
|------|-------------|----------|
| **Horizontal** (default) | Time flows left→right, events stack vertically | Desktop, wide screens |
| **Vertical** | Time flows top→bottom, events stack horizontally | Mobile, narrow screens, reading flow |

Toggle via button or `H`/`V` keys. Only one mode active at a time.

### 5.2 Navigation

| Action | Effect |
|--------|--------|
| Click + drag | Pan through time |
| Arrow keys (←→ or ↑↓) | Pan in time direction |
| `Home` | Jump to start of timeline |
| `End` | Jump to end of timeline |
| `Space` | Open/close detail panel for selected event |
| `Escape` | Close panels, deselect |
| `/` | Open search |
| `F` | Open filter panel |
| `B` | Open book selector |
| `?` | Show keyboard shortcut overlay |

### 5.3 Lanes

Events can occupy parallel **lanes** to avoid visual collision:

- **Auto-lanes:** The renderer automatically assigns events to lanes to prevent overlap
- **Named lanes:** Data authors can assign events to semantic lanes (e.g., "Atreides," "Harkonnen," "Bene Gesserit") to create parallel narrative tracks
- **Category lanes:** A view mode that groups events by category into fixed lanes
- Lane visibility is toggleable

### 5.4 Minimap

A persistent minimap (thin bar) shows the entire timeline at all times with:
- Current viewport indicator (highlighted region)
- Density heatmap
- Era color bands
- Click-to-navigate

---

## 6. Filtering & Book Mode

### 6.1 Book Filter (Three-State)

Each book has three filter states:

| State | Visual | Behavior |
|-------|--------|----------|
| **Highlighted** | Full color, full opacity | Primary focus |
| **Contextual** | Dimmed (30% opacity) | Visible for orientation but not prominent |
| **Hidden** | Not rendered | Completely removed |

Default: All books highlighted. Users can select a single book to highlight it and dim everything else — perfect for "I'm reading Dune Messiah and want to see where I am."

### 6.2 "Reading Mode"

A special mode where the user selects which book they're reading:
- That book's events are highlighted
- All prior books' events are contextual (dimmed)
- All future books' events are hidden (spoiler prevention)
- A "reading progress" indicator shows where the current book's events fall on the timeline

### 6.3 Other Filters

- **By category:** Toggle categories on/off
- **By faction:** Show events involving specific factions
- **By character:** Show events involving specific characters
- **By significance:** Minimum significance slider (1-5)
- **Search:** Full-text search across titles, descriptions, tags
- **By era:** Click an era band to filter to events within it

All filters are composable (AND logic between different filter types).

---

## 7. Detail Panel

Clicking an event opens a detail panel (slide-in from right or bottom):

```
┌─────────────────────────────────┐
│ ✕                               │
│ ██ BATTLE OF CORRIN             │
│ 88 BG (≈ 11,112 CE)            │
│ ─────────────────────────────── │
│ Category: Military              │
│ Significance: ★★★★★            │
│ ─────────────────────────────── │
│ The decisive battle that ended  │
│ the Butlerian Jihad and led to  │
│ the formation of the ...        │
│                                 │
│ [Read more ↓]                   │
│ ─────────────────────────────── │
│ 📚 Referenced in:               │
│   • Dune: The Battle of Corrin  │
│   • Dune (mentioned)            │
│ ─────────────────────────────── │
│ 👥 Characters:                  │
│   Vorian Atreides, Abulurd ...  │
│ ⚔️ Factions:                    │
│   League of Nobles, Thinking    │
│   Machines                      │
│ ─────────────────────────────── │
│ 🔗 Related Events:              │
│   ← Butlerian Jihad (era)      │
│   → Founding of Great Houses    │
└─────────────────────────────────┘
```

---

## 8. Data File Organization

### 8.1 Directory Structure

```
data/
├── config.yaml              # Calendar config, display settings
├── books.yaml               # All book definitions
├── eras.yaml                # All era/epoch definitions
├── categories.yaml          # Category definitions with colors
├── factions.yaml            # Faction definitions
├── events/
│   ├── butlerian-jihad.yaml     # Events grouped by narrative period
│   ├── corrino-empire.yaml
│   ├── dune-saga.yaml           # Original hexalogy events
│   ├── god-emperor.yaml
│   ├── the-scattering.yaml
│   ├── return-and-kralizec.yaml
│   ├── prelude-era.yaml
│   ├── legends-era.yaml
│   └── ...
└── arcs/
    ├── golden-path.yaml         # Narrative arc files
    ├── kwisatz-haderach.yaml
    └── ...
```

### 8.2 Why YAML

- **Comments:** Contributors can cite sources and explain reasoning inline
- **Readability:** Non-developers (Dune fans) can read and edit it
- **Diff-friendly:** YAML diffs are cleaner in PRs than JSON
- **Validation:** JSON Schema validates YAML at build time

### 8.3 Contribution Flow

1. Fork the repo
2. Add/edit YAML files in `data/`
3. Run `npm run validate` to check schema compliance
4. Submit PR — CI validates automatically
5. Maintainer reviews for accuracy and merges
6. Site rebuilds and deploys via CI/CD

---

## 9. Technical Architecture

### 9.1 Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Build | Vite | Fast, modern, excellent DX |
| Language | TypeScript | Type safety for complex data model |
| UI Framework | React 19 | Component model for panels/filters/controls |
| Timeline Renderer | HTML Canvas + custom engine | Performance for zoom/pan with thousands of events |
| Interaction Layer | Pointer/keyboard event handlers | Hit detection on canvas, delegated to React for UI |
| Styling | Tailwind CSS | Rapid, consistent styling |
| Data Loading | YAML → JSON at build time | Static site, no runtime parsing |
| Validation | Ajv (JSON Schema) | Build-time validation of YAML data |
| Deployment | Static hosting (Vercel/Netlify/GitHub Pages) | Zero backend |

### 9.2 Renderer Architecture

```
┌──────────────────────────────────────────┐
│                React App                  │
│  ┌────────────┐ ┌──────────┐ ┌────────┐ │
│  │ Filter Bar │ │ Minimap  │ │ Detail │ │
│  │            │ │          │ │ Panel  │ │
│  └────────────┘ └──────────┘ └────────┘ │
│  ┌──────────────────────────────────────┐ │
│  │         Canvas Timeline              │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │ Layer 1: Era background bands   │ │ │
│  │  │ Layer 2: Density heatmap        │ │ │
│  │  │ Layer 3: Span bars              │ │ │
│  │  │ Layer 4: Point/milestone markers│ │ │
│  │  │ Layer 5: Arc connection lines   │ │ │
│  │  │ Layer 6: Labels & annotations   │ │ │
│  │  │ Layer 7: Hover/selection overlay│ │ │
│  │  └─────────────────────────────────┘ │ │
│  └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

Each layer renders independently. Only dirty layers re-render on interaction.

### 9.3 Spatial Index

For efficient hit detection and clustering:
- Events are indexed in an **interval tree** (for temporal queries: "what events exist between year X and Y?")
- Visible events are indexed in a **quadtree** (for spatial queries: "what event is at pixel X,Y?")
- Both indexes are rebuilt when zoom/pan changes (debounced)

### 9.4 Performance Targets

| Metric | Target |
|--------|--------|
| Initial load | < 2s on 3G |
| Zoom/pan frame rate | 60fps |
| Event capacity | 10,000+ events without degradation |
| Time to interactive | < 1.5s |
| Bundle size | < 200KB gzipped (excluding data) |

---

## 10. Visual Design Direction

### 10.1 Aesthetic

- **Dark theme primary** (space/desert noir) with light theme option
- **Spice-inspired palette:** Deep blacks, desert golds, spice oranges, Arrakis blues
- **Typography:** Clean sans-serif for UI, slightly stylized for era labels
- **Minimal chrome:** The timeline IS the UI. Controls float and fade.
- **Ambient texture:** Subtle sand/grain texture in the background

### 10.2 Color System

```
--color-bg-primary:     #0a0a0f       /* Deep space black */
--color-bg-secondary:   #12121a       /* Slightly lighter */
--color-accent-spice:   #c4841d       /* Melange orange */
--color-accent-water:   #1a6b8a       /* Fremen blue */
--color-accent-danger:  #8b1a1a       /* Harkonnen red */
--color-accent-power:   #8b7d2f       /* Imperial gold */
--color-text-primary:   #e8e0d0       /* Sand white */
--color-text-secondary: #8a8070       /* Muted sand */
--color-era-band:       rgba(255,255,255,0.03) /* Subtle era bands */
```

### 10.3 Animations

- Zoom: Smooth easing (ease-out cubic)
- Pan: Momentum/inertia scrolling
- Cluster expand: Events fan out from cluster center
- Detail panel: Slide-in with subtle parallax
- Hotspot pulse: Gentle glow animation on dense regions when zoomed out

---

## 11. URL State & Sharing

The current view state is reflected in the URL for shareability:

```
/timeline?t=10191&z=4&f=dune-1965&c=military,political
           │       │   │            │
           │       │   │            └─ Active category filters
           │       │   └─ Book filter (highlighted)
           │       └─ Zoom tier
           └─ Center year (AG)
```

This enables:
- Sharing a specific moment: "Look at this cluster of events around the Butlerian Jihad"
- Bookmarking reading positions
- Deep linking from external wikis

---

## 12. Accessibility

- Full keyboard navigation (see §5.2)
- ARIA labels on all interactive elements
- Screen reader announcements for timeline navigation
- High contrast mode
- Reduced motion mode (disables animations)
- Focus management for detail panel open/close

---

## 13. Screen Adaptations (Media Bands)

Movies, TV series, and TV miniseries are displayed on the timeline as **media bands** — colored
horizontal bars that show which portion of the Dune chronology each screen adaptation covers.

### 13.1 Data Source

Media entries are stored in `data/media.yaml`. Each entry has a `timeline_start` and
`timeline_end` (AG years) representing the in-universe time span the adaptation depicts,
plus metadata like `release_year`, `director`/`creator`, `network`, source material (`adapts`),
and a hex `color`. The type field is one of `film`, `tv-series`, or `tv-miniseries`. See
`src/types/index.ts` for the `MediaEntry` TypeScript interface.

### 13.2 Visual Treatment

- **Position:** Media bands render below the book-sourced events and above the time axis, in a
  dedicated region that does not overlap with event markers or era bands.
- **Appearance:** Each band is a colored horizontal bar spanning the adaptation's timeline
  coverage. A sprocket-hole film-strip visual along the edges distinguishes media bands from
  book-sourced era bands.
- **Labels:** The adaptation title and release year are shown inside or alongside the band when
  space permits.

### 13.3 Interaction

- **Toggle:** A "Media" button in the header toggles media band visibility on and off.
- **Click:** Clicking a media band opens a detail pop-up showing the title, type, director or
  creator, release year, network, source material, timeline coverage, and description.
- **No filtering by media:** Media bands are display-only overlays. They do not participate in
  book filters, category filters, or significance filtering.

### 13.4 Current Entries

As of the initial release, 7 screen adaptations are included:
- Dune (David Lynch, 1984)
- Dune: Part One (Denis Villeneuve, 2021)
- Dune: Part Two (Denis Villeneuve, 2024)
- Dune: Part Three / Messiah (Denis Villeneuve, 2026)
- Frank Herbert's Dune (Sci Fi Channel miniseries, 2000)
- Frank Herbert's Children of Dune (Sci Fi Channel miniseries, 2003)
- Dune: Prophecy (HBO series, 2024--)

---

## 14. Future Considerations (Out of Scope for V1)

These are NOT being built now but the architecture should not preclude them:

- **Character relationship graph** overlaid on timeline
- **Fremen calendar** as a third calendar system
- **Map integration** showing locations alongside timeline
- **Multimedia** attachments (book covers, fan art, movie stills)
- **Annotations/comments** by users (would require a backend)
- **Timeline comparison** (side-by-side different eras)
- **Audio narration** of events
- **API endpoint** for programmatic access to timeline data
