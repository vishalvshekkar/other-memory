# Calendar System

Other Memory uses the AG/BG calendar as its primary dating system, with optional CE (Common Era) conversions. This document explains how the calendar works, why there are two CE anchors, and how dates are stored in the data files.

---

## Table of Contents

- [AG/BG Calendar](#agbg-calendar)
- [The Two CE Anchors](#the-two-ce-anchors)
- [Why Two Systems?](#why-two-systems)
- [How Dates Are Stored](#how-dates-are-stored)
- [The config.yaml Calendar Section](#the-configyaml-calendar-section)
- [How the CE Toggle Works](#how-the-ce-toggle-works)
- [Quick Reference](#quick-reference)

---

## AG/BG Calendar

The Dune universe uses a calendar centered on the founding of the Spacing Guild:

- **AG** = After Guild (years after the founding)
- **BG** = Before Guild (years before the founding)

This is the universal dating system across all Dune novels. When Frank Herbert writes that Dune takes place in "10,191 AG," he means 10,191 years after the Spacing Guild was founded.

Key dates as reference points:

| AG Year | Event |
|---------|-------|
| ~1,287 BG | Time of Titans begins |
| ~201 BG | Butlerian Jihad begins |
| 88 BG | Battle of Corrin; founding of the Great Houses |
| **0 AG** | **Founding of the Spacing Guild** |
| 10,191 AG | Events of *Dune* begin |
| 10,193 AG | Battle of Arrakeen; Paul becomes Emperor |
| 13,728 AG | Death of Leto II, the God Emperor |
| ~15,240 AG | Events of *Heretics of Dune* |

---

## The Two CE Anchors

Dune scholars have long wanted to know: when does the Dune timeline fall relative to our calendar (CE -- Common Era)? Two different answers exist, depending on which source you follow.

### Anchor 1: Expanded Dune (Brian Herbert & Kevin J. Anderson)

> **11,200 BG = 1960 CE**

This comes from the expanded Dune novels, which tie 11,200 BG to the year 1960 CE -- the launch of Pioneer 5, marking the beginning of humanity's space age.

Working the math:

```
If 11,200 BG = 1960 CE
Then 0 AG = 1960 + 11,200 = 13,160 CE

So: AG 0 = 13,160 CE
```

Under this system, the events of *Dune* (10,191 AG) take place in **23,351 CE**.

### Anchor 2: Dune Encyclopedia (Willis McNelly, 1984)

> **16,200 BG = 0 CE**

The *Dune Encyclopedia* -- compiled by Willis McNelly with Frank Herbert's approval -- ties 16,200 BG to the year 0 CE (the birth of Christ in the Common Era calendar).

Working the math:

```
If 16,200 BG = 0 CE
Then 0 AG = 0 + 16,200 = 16,200 CE

So: AG 0 = 16,200 CE
```

Under this system, the events of *Dune* (10,191 AG) take place in **26,391 CE**.

---

## Why Two Systems?

The two anchors produce a **3,040-year gap**:

```
16,200 CE - 13,160 CE = 3,040 years
```

This means any AG date converts to a CE date that is 3,040 years later under the Encyclopedia system than under the Expanded Dune system.

The discrepancy exists because the two sources chose different historical events as their reference point and were created decades apart:

| | Expanded Dune | Dune Encyclopedia |
|-|---------------|-------------------|
| **Source** | Brian Herbert & Kevin J. Anderson novels (2000s) | Willis McNelly, with Frank Herbert's involvement (1984) |
| **Reference point** | Pioneer 5 launch (1960 CE) = 11,200 BG | Birth of Christ (0 CE) = 16,200 BG |
| **AG 0 in CE** | 13,160 CE | 16,200 CE |
| ***Dune* in CE** | 23,351 CE | 26,391 CE |

Neither system is "wrong." They come from different editorial traditions within the Dune franchise. Other Memory shows both when the CE toggle is enabled, so users can choose the interpretation they prefer.

---

## How Dates Are Stored

**All dates in the data files are stored as AG years. Never as CE.**

- Positive integers = AG (e.g., `10191`)
- Negative integers = BG (e.g., `-201` means 201 BG)
- Zero = the founding year of the Spacing Guild

```yaml
# AG dates
date_start: 10191      # 10,191 AG (events of Dune)
date_start: 0          # 0 AG (Guild founding)

# BG dates (negative)
date_start: -201       # 201 BG (start of the Butlerian Jihad)
date_start: -1287      # 1,287 BG (Time of Titans)
```

CE conversion is handled purely at display time by the frontend. You should **never** store CE values in the YAML data.

---

## The config.yaml Calendar Section

The calendar configuration lives in `data/config.yaml`:

```yaml
calendar:
  ce_anchor_expanded: 13160       # AG 0 = 13,160 CE (Expanded Dune)
  ce_anchor_encyclopedia: 16200   # AG 0 = 16,200 CE (Dune Encyclopedia)

  display_calendars:
    - id: ag
      label: "AG (After Guild)"
      primary: true

    - id: ce-expanded
      label: "CE — Expanded Dune"
      primary: false

    - id: ce-encyclopedia
      label: "CE — Dune Encyclopedia"
      primary: false
```

### Fields

| Field | Description |
|-------|-------------|
| `ce_anchor_expanded` | The CE year that corresponds to AG 0 under the Expanded Dune system. |
| `ce_anchor_encyclopedia` | The CE year that corresponds to AG 0 under the Dune Encyclopedia system. |
| `display_calendars` | The list of calendar display options available to the user. |
| `display_calendars[].id` | Identifier: `ag`, `ce-expanded`, or `ce-encyclopedia`. |
| `display_calendars[].label` | Human-readable label shown in the UI. |
| `display_calendars[].primary` | Whether this is the default calendar display. AG is always primary. |

### CE Conversion Formula

To convert an AG year to CE:

```
CE year = AG year + ce_anchor
```

Examples using the Expanded Dune anchor (13,160):

```
10,191 AG  →  10,191 + 13,160  =  23,351 CE
0 AG       →  0 + 13,160       =  13,160 CE
-201 AG    →  -201 + 13,160    =  12,959 CE
```

Examples using the Encyclopedia anchor (16,200):

```
10,191 AG  →  10,191 + 16,200  =  26,391 CE
0 AG       →  0 + 16,200       =  16,200 CE
-201 AG    →  -201 + 16,200    =  15,999 CE
```

---

## How the CE Toggle Works

On the Other Memory site, users can toggle CE dates on or off:

1. **Default (AG only):** The timeline shows only AG/BG years. This is the primary display.
2. **CE enabled:** When toggled on, both CE anchors are shown alongside the AG date, letting users see the equivalent CE year under each system.

The three display options from `config.yaml` control what the user sees:

| Display | Example for 10,191 AG |
|---------|----------------------|
| AG (After Guild) | 10,191 AG |
| CE -- Expanded Dune | 23,351 CE |
| CE -- Dune Encyclopedia | 26,391 CE |

**As a data contributor, you do not need to worry about CE.** Just store dates in AG and let the frontend handle the conversion.

---

## Quick Reference

| Question | Answer |
|----------|--------|
| What calendar do I use in YAML files? | Always AG. Use negative numbers for BG. |
| What is AG 0? | The founding of the Spacing Guild. |
| When is *Dune* set? | 10,191 AG. |
| How do I express 201 BG? | `date_start: -201` |
| Why are there two CE systems? | Different source materials chose different historical anchors. |
| What is the gap between the two CE systems? | 3,040 years. |
| Do I ever write CE dates in the data? | No. CE conversion is handled by the frontend. |
