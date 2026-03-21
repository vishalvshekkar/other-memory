# Dune Timeline

An interactive, explorable timeline of the entire Dune universe — spanning from the
Butlerian Jihad to the return from the Scattering and beyond. Built for fans, readers,
and lore enthusiasts.

**[Live Site →](#)** *(coming soon)*

## What Is This?

A single, continuous, zoomable timeline covering ~35,000 years of Dune history across
every novel by Frank Herbert and Brian Herbert & Kevin J. Anderson. Zoom from a birds-eye
view of the entire universe down to individual events within a single book.

### Features

- **Zoomable timeline** — Scroll to zoom from millennia to days
- **Event density hotspots** — See where the action clusters, even when zoomed out
- **Book filter** — Select which book you're reading; see only relevant events (with spoiler prevention)
- **Multiple event types** — Point events, spans, milestones, eras, narrative arcs
- **Dual calendar** — AG (After Guild) primary, with real-world CE year overlay
- **Keyboard-first** — Full keyboard and mouse navigation
- **Dark theme** — Desert noir aesthetic inspired by Arrakis
- **Static site** — No backend, deploys anywhere

## Tech Stack

| | |
|---|---|
| Build | Vite |
| Language | TypeScript (strict) |
| UI | React 19 |
| Timeline | HTML Canvas (custom renderer) |
| Styling | Tailwind CSS |
| Data | YAML files validated at build time |
| Hosting | Static (GitHub Pages / Vercel / Netlify) |

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` to see the timeline.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` `→` | Pan timeline |
| `+` `-` | Zoom in/out |
| `1`-`6` | Jump to zoom tier |
| `0` | Fit entire timeline |
| `H` / `V` | Horizontal / Vertical mode |
| `/` | Search |
| `F` | Filters |
| `B` | Book selector |
| `Space` | Event detail panel |
| `Esc` | Close panel |
| `?` | Show all shortcuts |

## Contributing Timeline Data

The timeline data lives in `data/` as YAML files. Anyone can contribute events,
corrections, or additional details by opening a pull request.

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

```bash
# Validate your changes locally before submitting
npm run validate
```

## Project Structure

```
├── data/                    # Timeline data (YAML)
│   ├── config.yaml          # Calendar & display config
│   ├── books.yaml           # Book definitions
│   ├── eras.yaml            # Era/epoch definitions
│   ├── categories.yaml      # Category colors
│   ├── factions.yaml        # Faction definitions
│   ├── events/              # Event files by narrative period
│   └── arcs/                # Narrative arc definitions
├── src/
│   ├── main.tsx             # App entry
│   ├── App.tsx              # Root component
│   ├── types/               # TypeScript type definitions
│   ├── data/                # Data loading & validation
│   ├── timeline/            # Canvas renderer & engine
│   │   ├── renderer.ts      # Main render loop
│   │   ├── camera.ts        # Zoom/pan state
│   │   ├── layers/          # Render layers
│   │   ├── spatial.ts       # Interval tree / quadtree
│   │   └── cluster.ts       # Clustering logic
│   ├── components/          # React UI components
│   │   ├── FilterPanel.tsx
│   │   ├── DetailPanel.tsx
│   │   ├── BookSelector.tsx
│   │   ├── Minimap.tsx
│   │   └── SearchOverlay.tsx
│   └── styles/              # Tailwind config & globals
├── SPEC.md                  # Full technical specification
├── CLAUDE.md                # AI assistant guide
└── CONTRIBUTING.md          # Contribution guidelines
```

## License

MIT
