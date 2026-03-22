# Other Memory — The Complete Dune Timeline

An interactive, zoomable timeline spanning ~35,000 years of the Dune saga — every
event, era, and narrative arc across all novels by Frank Herbert and
Brian Herbert & Kevin J. Anderson.

**[Live Site → othermemory.nihil.codes](https://othermemory.nihil.codes)**

---

## What Is This?

**Other Memory** is named after the Bene Gesserit ability to access ancestral
memories spanning millennia. This site gives you that same power — explore the
complete chronology of the Dune universe, from the Time of Titans through Kralizec,
in a single continuous timeline.

Zoom from a 35,000-year birds-eye view down to individual events within a single
book. See where you are in the story, how events connect across millennia, and
where Frank Herbert placed his saga in humanity's deep future.

### Features

- **Zoomable timeline** — 6 zoom tiers from full history to individual years
- **95 events** across all narrative periods, with more added by the community
- **Dual calendar overlay** — Dune's AG/BG calendar plus two real-world CE
  mappings (Expanded Dune and Dune Encyclopedia), each with a "Today" marker
- **Book filter** — select which book you're reading; Reading Mode hides
  future events to prevent spoilers
- **Search** — find events, characters, factions instantly
- **Narrative arcs** — visual threads connecting events like The Golden Path
  and the Kwisatz Haderach breeding program
- **Movies & TV shows** — 7 screen adaptations displayed as media bands, from
  Lynch's 1984 film through Dune: Prophecy, showing which eras each covers
- **Density heatmap** — see where events cluster, even when fully zoomed out
- **Detail panel** — click any event for full description, book references,
  characters, factions, and related events with a zoom-to-event button
- **Visual user guide** — built-in manual with legends matching the actual visuals
- **Keyboard-first** — 14 keyboard shortcuts for power users
- **Shareable URLs** — every view state is encoded in the URL
- **Community-driven** — YAML data files anyone can contribute to via pull requests

---

## Calling All Dune Fans

This timeline is built by fans, for fans — and we need your help making it
the most accurate and comprehensive Dune chronology on the internet.

**Are we wrong about a date?** The Dune universe has genuine ambiguities across
different sources. We've documented where dates disagree (like Paul's desert walk
at 10,207 vs 10,210 AG) and chosen the most book-consistent interpretation. If
you have evidence for a different reading, we want to hear it.

**Is an event missing?** We have 95 events and growing, but there are hundreds
more across the novels. Every contribution helps.

**Want to debate timeline placement?** Open a
[GitHub Discussion](https://github.com/vishalvshekkar/other-memory/discussions)
to talk about ambiguities, interpretations, or proposals before submitting a PR.

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines, or dive into the
[docs/](docs/) folder for detailed schema references and step-by-step guides.

---

## Tech Stack

| | |
|---|---|
| Build | Vite |
| Language | TypeScript (strict) |
| UI | React 19 |
| Timeline | HTML Canvas (custom 8-layer renderer) |
| Styling | Tailwind CSS 4 |
| Data | YAML files validated at build time |
| Hosting | Static (GitHub Pages / Vercel / Netlify) |

## Quick Start

```bash
git clone https://github.com/vishalvshekkar/other-memory.git
cd dune-timeline
npm install
npm run dev
```

Open `http://localhost:5173` to explore the timeline.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Scroll` | Zoom at cursor |
| `Drag` | Pan timeline |
| `Click` | Select event |
| `← →` | Pan |
| `+ -` | Zoom in/out |
| `1`-`6` | Jump to zoom tier |
| `0` | Fit entire timeline |
| `/` | Search |
| `F` | Filters |
| `B` | Book selector |
| `Esc` | Close panel |
| `?` | Quick shortcuts reference |

## Contributing

The timeline data lives in `data/` as YAML files. Anyone can contribute —
no programming experience required beyond basic YAML editing.

```bash
npm run validate   # Check your changes before submitting
```

**Quick links:**
- [How to add events](docs/adding-events.md)
- [How to add eras](docs/adding-eras.md)
- [How to add narrative arcs](docs/adding-arcs.md)
- [How to add movies & TV shows](docs/adding-media.md)
- [Data schema reference](docs/data-schema.md)
- [Calendar system explained](docs/calendar-system.md)
- [Full contribution workflow](docs/contribution-workflow.md)

## Project Structure

```
├── data/                    # Timeline data (YAML) — this is what you edit
│   ├── config.yaml          # Calendar configuration (dual CE anchors)
│   ├── books.yaml           # 22 book definitions
│   ├── eras.yaml            # 12 era/epoch definitions
│   ├── categories.yaml      # 7 event categories with colors
│   ├── factions.yaml        # 12 faction definitions
│   ├── events/              # Event files grouped by narrative period
│   │   ├── butlerian-jihad.yaml
│   │   ├── corrino-empire.yaml
│   │   ├── prelude-era.yaml
│   │   ├── dune-saga.yaml
│   │   ├── god-emperor.yaml
│   │   ├── the-scattering.yaml
│   │   └── return-and-kralizec.yaml
│   ├── media.yaml           # 7 screen adaptation entries (movies & TV shows)
│   └── arcs/                # Narrative arc definitions
│       ├── golden-path.yaml
│       └── kwisatz-haderach.yaml
├── docs/                    # Detailed documentation
├── src/                     # Application source (TypeScript + React)
│   ├── components/          # React UI components
│   ├── timeline/            # Canvas renderer, camera, interactions
│   ├── types/               # TypeScript type definitions
│   └── ...
├── SPEC.md                  # Technical specification
├── CLAUDE.md                # AI assistant guide
└── CONTRIBUTING.md          # Contribution guidelines
```

## The Two Dune Calendars

The Dune universe uses AG (After Guild) / BG (Before Guild) dating. But how
does this map to our real-world calendar? Two canonical sources disagree:

- **Expanded Dune** (Brian Herbert/KJA): 11,200 BG = 1960 CE → AG 0 = **13,160 CE**
- **Dune Encyclopedia** (1984): 16,200 BG = 0 CE → AG 0 = **16,200 CE**

Toggle the **CE** button on the site to see both mappings simultaneously.
See [docs/calendar-system.md](docs/calendar-system.md) for the full explanation.

## License

MIT
