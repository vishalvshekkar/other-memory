# Other Memory — Project Guide

## What This Is

**Other Memory** is an interactive static website that visualizes the complete
Dune universe chronology (~35,000 years) across all novels. Built with
Vite + React 19 + TypeScript + Canvas. See SPEC.md for the full specification.

Named after the Bene Gesserit ability to access ancestral memories spanning
millennia — which is exactly what this timeline lets fans do.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build (outputs to `dist/`)
- `npm run preview` — Preview production build
- `npm run validate` — Validate all YAML data files against schemas
- `npm run lint` — Run ESLint
- `npm run typecheck` — Run TypeScript type checking

## Architecture

### Rendering Pipeline

The timeline uses an HTML Canvas renderer with 8 layered drawing passes:
1. Era background bands
2. Density heatmap
3. Span bars (duration events)
4. Point/milestone markers
5. Arc connection lines
6. Labels
7. Time axis (AG + optional dual CE rows)
8. Hover/selection overlay

Media bands (movies & TV shows) render below book events and above the time
axis as colored horizontal bands with sprocket-hole film-strip visuals. They
are toggleable via the "Media" button and clickable for detail pop-ups. Data
comes from `data/media.yaml` and is loaded into `TimelineData.media`.

React handles UI chrome (panels, filters, controls). Canvas handles the
timeline itself. **Canvas code must not import React** — communicate via
shared state passed as function arguments.

### Data Flow

```
data/*.yaml → build-time YAML plugin → JSON → React context → Canvas renderer
```

YAML files in `data/` are the source of truth. Vite's custom YAML plugin
transforms them into JSON at build time. The React app loads this statically.

### Calendar System

All dates are stored as AG (After Guild) year numbers. Negative = BG.

Two CE (Common Era) anchors exist:
- **Expanded Dune**: `CE = AG + 13,160` (11,200 BG = 1960 CE)
- **Dune Encyclopedia**: `CE = AG + 16,200` (16,200 BG = 0 CE)

Both are shown simultaneously when the CE toggle is enabled. Never store CE
dates in data files — always AG.

## Data Files

- `data/config.yaml` — Calendar anchors (dual CE system), display settings
- `data/books.yaml` — 22 book definitions
- `data/eras.yaml` — 12 era/epoch definitions (background timeline bands)
- `data/categories.yaml` — 7 category definitions with color mappings
- `data/factions.yaml` — 12 faction definitions
- `data/events/*.yaml` — Timeline events grouped by narrative period (95 events)
- `data/arcs/*.yaml` — 2 narrative arc definitions
- `data/media.yaml` — 7 screen adaptation entries (movies & TV shows with timeline bands)
- `data/_schema.json` — JSON Schema for build-time validation

## Conventions

- Event IDs are kebab-case slugs: `battle-of-corrin`, `paul-atreides-born`
- Book IDs follow: `{slug}-{year}` pattern: `dune-1965`, `dune-messiah-1969`
- All dates in data files are AG years (integers). Negative for BG.
- Significance is 1-5: 1=minor, 3=notable, 5=universe-altering
- YAML files must pass `npm run validate` before commit
- TypeScript strict mode — no `any` types
- Canvas rendering code must not import React

## Key Files

| File | Purpose |
|------|---------|
| `src/timeline/camera.ts` | Core coordinate math (yearToPixel, zoom, pan) |
| `src/timeline/renderer/index.ts` | 8-layer render orchestrator |
| `src/data/loader.ts` | YAML data loading + merge into TimelineData |
| `src/components/TimelineCanvas.tsx` | Bridge between React and Canvas |
| `src/App.tsx` | Root component with all state management |
| `src/types/index.ts` | All TypeScript type definitions |

## Documentation

See `docs/` for detailed guides:
- [docs/data-schema.md](docs/data-schema.md) — Complete data schema reference
- [docs/adding-events.md](docs/adding-events.md) — How to add events
- [docs/adding-eras.md](docs/adding-eras.md) — How to add eras
- [docs/adding-arcs.md](docs/adding-arcs.md) — How to add narrative arcs
- [docs/calendar-system.md](docs/calendar-system.md) — The dual calendar explained
- [docs/adding-media.md](docs/adding-media.md) — How to add movies & TV shows
- [docs/contribution-workflow.md](docs/contribution-workflow.md) — Fork/PR workflow
