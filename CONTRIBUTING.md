# Contributing to Other Memory

Thank you for helping build the most comprehensive Dune timeline! This project
is community-driven — fans, scholars, and casual readers are all welcome.

## Ways to Contribute

### 1. Add Timeline Events
See [docs/adding-events.md](docs/adding-events.md) for a step-by-step guide.

### 2. Correct Dates or Details
Found an inaccuracy? Some dates in the Dune universe are genuinely ambiguous
across sources. If you have book evidence for a different date, open a PR with
your correction and cite the source (book, chapter, page if possible).

### 3. Add or Modify Eras
See [docs/adding-eras.md](docs/adding-eras.md) for guidance on era boundaries
and nesting.

### 4. Add Narrative Arcs
See [docs/adding-arcs.md](docs/adding-arcs.md) for how to create story threads
that connect events across the timeline.

### 5. Discuss Ambiguities
The Dune universe has real contradictions between sources. Use
[GitHub Discussions](https://github.com/visioninhope/dune-timeline/discussions)
to debate timeline placement, propose changes, or ask questions before
submitting a PR. Topics might include:
- "What year does Paul actually walk into the desert?"
- "Should the Butlerian Jihad start at -201 or -200?"
- "Proposal: add events from the Caladan Trilogy"

### 6. Improve the Site
For code contributions (UI, renderer, features), check [SPEC.md](SPEC.md) and
[CLAUDE.md](CLAUDE.md) for architecture context.

---

## Quick Start for Data Contributions

### Prerequisites
- A GitHub account
- Basic familiarity with YAML (it's just indented text — see examples below)
- A copy of the Dune book(s) you're referencing

### The Workflow

1. **Fork** this repository on GitHub
2. **Clone** your fork: `git clone https://github.com/YOUR-USERNAME/dune-timeline.git`
3. **Branch**: `git checkout -b add/event-name` (or `fix/date-correction`)
4. **Edit** YAML files in the `data/` folder
5. **Validate**: `npm install && npm run validate`
6. **Commit**: `git commit -m "Add: Battle of Arrakeen details from Dune Ch. 22"`
7. **Push**: `git push origin add/event-name`
8. **Open a Pull Request** on GitHub

See [docs/contribution-workflow.md](docs/contribution-workflow.md) for the full
detailed walkthrough, including PR templates and what reviewers look for.

---

## Adding an Event (Quick Reference)

Find the right file in `data/events/` and add an entry:

```yaml
- id: your-event-slug           # Unique kebab-case ID
  type: point                   # point | span | milestone | era
  title: "Event Title"
  description: "1-3 sentence summary of what happened."
  date_start: 10191             # AG year (negative for BG)
  # date_end: 10193             # Only for span/era types
  date_precision: exact         # exact | approximate | estimated | unknown
  significance: 3               # 1-5 (see guide below)
  category: military            # See categories.yaml
  tags: ["arrakis", "fremen"]
  factions: ["atreides"]
  characters: ["paul-atreides"]
  books:
    - book_id: dune-1965
      chapters: ["Book Two"]
      notes: "Central event of the novel"
```

### Significance Guide

| Level | Meaning | Example |
|-------|---------|---------|
| 1 | Minor detail, footnote | A character's offhand mention of a past event |
| 2 | Notable but local | A regional political change, a birth |
| 3 | Significant event | A major battle, important death |
| 4 | Major turning point | Fall of a house, a key invention |
| 5 | Universe-altering | Butlerian Jihad, Paul's prescience, Kralizec |

### Date Precision

| Value | When to use | Example |
|-------|-------------|---------|
| `exact` | Source gives a specific year | "10,191 AG" |
| `approximate` | Source says "around" or "roughly" | "~10,000 AG" |
| `estimated` | You're inferring from context | "~-1,500 AG" |
| `unknown` | Only the era is known | "During the Butlerian Jihad" |

---

## Guidelines

- **Cite your sources.** Use the `books` field. Add `notes` for context.
- **Use AG dates.** All dates must be AG years. Negative for BG. Never CE.
- **Check for duplicates.** Search existing files before adding.
- **Be concise.** 1-3 sentences for `description`. Longer content in `detailed`.
- **No speculation.** Only events explicitly stated or strongly implied in source material.
- **When in doubt, underestimate significance.** It's easier to raise in review.
- **Document ambiguities.** If sources disagree, note the alternatives in `detailed`.

---

## Detailed Documentation

| Guide | What it covers |
|-------|---------------|
| [Data Schema Reference](docs/data-schema.md) | Every field, every type, every allowed value |
| [Adding Events](docs/adding-events.md) | Step-by-step with templates and examples |
| [Adding Eras](docs/adding-eras.md) | Era boundaries, nesting, and when to use eras vs spans |
| [Adding Arcs](docs/adding-arcs.md) | Narrative threads connecting events |
| [Calendar System](docs/calendar-system.md) | AG/BG, dual CE anchors, why they disagree |
| [Contribution Workflow](docs/contribution-workflow.md) | Fork, branch, validate, PR, review |

---

## Validating Your Changes

```bash
npm install        # First time only
npm run validate   # Check all data files
```

The validator checks:
- YAML syntax
- Schema compliance (required fields, correct types)
- Referential integrity (book IDs, categories, factions)
- No duplicate event IDs across all files
- Date consistency (end >= start for spans/eras)
- Arc event references exist

---

## Code of Conduct

- **Cite sources.** Book title, chapter, page number when possible.
- **No fan theories.** Unless clearly labeled as interpretation.
- **Respect ambiguity.** The Dune universe has genuine contradictions. Document
  them rather than silently choosing one.
- **Be welcoming.** Not everyone has read all 20+ books. Help newcomers navigate.
- **Be respectful** in discussions and code reviews.

## Questions?

Open a [GitHub Discussion](https://github.com/visioninhope/dune-timeline/discussions)
or an issue. We're happy to help.
