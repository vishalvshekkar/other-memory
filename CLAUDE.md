# Dune Timeline — Project Guide

## What This Is

An interactive static website that visualizes the entire Dune universe chronology across
all novels. Built with Vite + React + TypeScript + Canvas. See SPEC.md for full details.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build (outputs to `dist/`)
- `npm run preview` — Preview production build
- `npm run validate` — Validate all YAML data files against schemas
- `npm run lint` — Run ESLint
- `npm run typecheck` — Run TypeScript type checking

## Architecture

### Rendering Pipeline

The timeline uses an HTML Canvas renderer with layered drawing (see SPEC.md §9.2).
React handles UI chrome (panels, filters, controls). Canvas handles the timeline itself.

Key renderer files:
- `src/timeline/renderer.ts` — Main render loop, layer orchestration
- `src/timeline/camera.ts` — Zoom/pan state (center year + pixels-per-year)
- `src/timeline/layers/` — Individual render layers (eras, events, labels, etc.)
- `src/timeline/spatial.ts` — Interval tree + quadtree for hit detection
- `src/timeline/cluster.ts` — Event clustering logic

### Data Flow

```
data/*.yaml → build-time validation → JSON bundle → React context → Canvas renderer
```

YAML files in `data/` are the source of truth. At build time, they're validated against
JSON Schema and bundled into a single JSON import. The React app loads this statically.

### Calendar

All dates are stored as AG (After Guild) year numbers. Negative = BG (Before Guild).
The CE (Common Era) conversion is: `ce_year = ag_year + config.ag_zero_ce_year`.
Never store CE dates in data files — always AG.

## Data Files

- `data/config.yaml` — Calendar mapping, display settings
- `data/books.yaml` — Book definitions (one entry per book)
- `data/eras.yaml` — Era/epoch definitions (background timeline bands)
- `data/categories.yaml` — Category definitions with color mappings
- `data/factions.yaml` — Faction definitions
- `data/events/*.yaml` — Timeline events grouped by narrative period
- `data/arcs/*.yaml` — Narrative arc definitions

## Conventions

- Event IDs are kebab-case slugs: `battle-of-corrin`, `paul-atreides-born`
- Book IDs follow: `{slug}-{year}` pattern: `dune-1965`, `dune-messiah-1969`
- All dates in data files are AG years (integers). Use negative for BG.
- Significance is 1-5: 1=minor, 3=notable, 5=universe-altering
- YAML files must pass `npm run validate` before commit
- TypeScript strict mode is on — no `any` types
- Canvas rendering code should not import React; communicate via shared state

## Contributing Data

See CONTRIBUTING.md for guidelines on adding timeline events.
Run `npm run validate` before submitting. CI will also validate.
