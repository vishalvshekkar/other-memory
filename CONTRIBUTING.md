# Contributing to Dune Timeline

Thank you for helping build the most comprehensive Dune timeline! This project is
community-driven — anyone can contribute events, corrections, and details.

## How to Contribute

### Adding Events

1. Fork this repository
2. Find the appropriate file in `data/events/` (or create a new one if needed)
3. Add your event following the schema below
4. Run `npm run validate` to check your changes
5. Submit a pull request

### Event Template

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
| 2 | Notable but local | A regional political change |
| 3 | Significant event | A major battle, important birth/death |
| 4 | Major turning point | Fall of a house, start of a jihad |
| 5 | Universe-altering | Butlerian Jihad, Paul's prescience, God Emperor's reign |

When in doubt, underestimate significance. It's easier to raise it in review.

### Guidelines

- **Cite your sources.** Use the `books` field to reference which novel(s) mention the event. Add `notes` for context (e.g., "mentioned briefly in chapter 3").
- **Use AG dates.** All dates must be in AG (After Guild) years. Negative values for Before Guild.
- **Check for duplicates.** Search existing events before adding. If an event exists but is missing details, update it instead of creating a new one.
- **Be concise.** Descriptions should be 1-3 sentences. Put longer content in the `detailed` field (markdown supported).
- **No speculation.** Only include events that are explicitly stated or strongly implied in the source material. Fan theories belong elsewhere.
- **Spoiler awareness.** The `books` field is critical — it powers the spoiler-free reading mode.

### Date Precision

If you're not sure of the exact year:
- **exact**: The source gives a specific year → `date_precision: exact`
- **approximate**: The source says "around" or "roughly" → `date_precision: approximate`
- **estimated**: You're inferring from context → `date_precision: estimated`
- **unknown**: Only the era is known → `date_precision: unknown` (place within parent era)

## Validating Changes

```bash
npm install        # First time only
npm run validate   # Check all data files
```

The validator checks:
- YAML syntax
- Schema compliance (required fields, correct types)
- Referential integrity (book_id references exist in books.yaml, etc.)
- No duplicate IDs
- Date consistency (date_end >= date_start for spans)

## Code Contributions

For UI/renderer changes:
1. Check SPEC.md for the intended behavior
2. Follow the conventions in CLAUDE.md
3. Run `npm run lint && npm run typecheck` before submitting

## Questions?

Open an issue if you're unsure about anything — event dates, significance levels,
categorization, or anything else.
