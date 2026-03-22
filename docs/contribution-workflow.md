# Contribution Workflow

A complete guide to contributing to Other Memory, from forking the repository to getting your pull request merged. This guide is written for Dune fans who may not have much experience with Git or GitHub -- every step is explained.

---

## Table of Contents

- [Overview](#overview)
- [Step 1: Fork the Repository](#step-1-fork-the-repository)
- [Step 2: Clone Your Fork](#step-2-clone-your-fork)
- [Step 3: Create a Branch](#step-3-create-a-branch)
- [Step 4: Make Your Changes](#step-4-make-your-changes)
- [Step 5: Validate Your Changes](#step-5-validate-your-changes)
- [Step 6: Commit Your Changes](#step-6-commit-your-changes)
- [Step 7: Push and Open a Pull Request](#step-7-push-and-open-a-pull-request)
- [What to Include in Your PR](#what-to-include-in-your-pr)
- [What Reviewers Look For](#what-reviewers-look-for)
- [Using GitHub Discussions](#using-github-discussions)
- [Code of Conduct](#code-of-conduct)

---

## Overview

The contribution process follows the standard GitHub fork-and-pull-request workflow:

1. **Fork** the repository to your own GitHub account.
2. **Clone** your fork to your computer.
3. **Create a branch** for your changes.
4. **Edit** the YAML data files.
5. **Validate** your changes locally.
6. **Commit** and **push** your branch.
7. **Open a pull request** for review.

Most contributions involve editing YAML files in the `data/` directory. You do not need to write any code.

---

## Step 1: Fork the Repository

A "fork" is your own copy of the project on GitHub.

1. Go to the Other Memory repository on GitHub.
2. Click the **Fork** button in the upper right corner.
3. GitHub will create a copy under your account (e.g., `github.com/your-username/other-memory`).

You only need to do this once.

---

## Step 2: Clone Your Fork

"Cloning" downloads your fork to your computer so you can edit files locally.

```bash
# Replace "your-username" with your GitHub username
git clone https://github.com/your-username/other-memory.git
cd other-memory
```

Then install the project dependencies (needed for validation):

```bash
npm install
```

You only need to run `npm install` the first time, or after dependencies change.

---

## Step 3: Create a Branch

Never work directly on the `main` branch. Create a new branch for each contribution.

```bash
git checkout -b add/battle-of-the-pass
```

### Branch Naming Convention

Use a descriptive prefix:

| Prefix | When to Use | Example |
|--------|-------------|---------|
| `add/` | Adding a new event, era, or arc | `add/battle-of-the-pass` |
| `fix/` | Correcting a date, description, or other error | `fix/paul-blinded-date` |
| `update/` | Expanding or improving an existing event | `update/leto-ii-death-details` |

---

## Step 4: Make Your Changes

Most contributions involve editing files in the `data/` directory:

| What You Want to Do | File to Edit | Guide |
|---------------------|-------------|-------|
| Add a new event | `data/events/<era-file>.yaml` | [Adding Events](adding-events.md) |
| Add or modify an era | `data/eras.yaml` | [Adding Eras](adding-eras.md) |
| Add a narrative arc | `data/arcs/<arc-name>.yaml` | [Adding Arcs](adding-arcs.md) |
| Add a screen adaptation | `data/media.yaml` | [Adding Media](adding-media.md) |

Open the appropriate file in any text editor (VS Code, Sublime Text, or even Notepad) and make your changes.

**Tips:**
- Use 2 spaces for YAML indentation (not tabs).
- Place new events in roughly chronological order within the file.
- Check for duplicate events before adding a new one.

---

## Step 5: Validate Your Changes

Before committing, run the validator to catch errors:

```bash
npm run validate
```

This checks:
- **YAML syntax** -- catches indentation errors, missing quotes, etc.
- **Schema compliance** -- all required fields present, correct types, string length limits.
- **Referential integrity** -- `book_id` values exist in `data/books.yaml`, faction IDs exist in `data/factions.yaml`.
- **No duplicate IDs** -- each event ID must be unique across all files.
- **Date consistency** -- `date_end` >= `date_start` for spans and eras.

If validation fails, read the error messages carefully. They will tell you which file, which event, and which field has the problem.

---

## Step 6: Commit Your Changes

Once validation passes, stage and commit your changes:

```bash
# Stage the specific file(s) you changed
git add data/events/dune-saga.yaml

# Commit with a descriptive message
git commit -m "Add Battle of the Pass event from Children of Dune"
```

### Commit Message Guidelines

Write a clear, descriptive commit message:

```
# Good commit messages
Add Battle of the Pass event from Children of Dune
Fix Paul blinded date from 10207 to 10209 AG
Update Leto II death event with detailed description
Add Famine Times era to eras.yaml

# Bad commit messages
update
fixed stuff
new event
```

---

## Step 7: Push and Open a Pull Request

Push your branch to your fork on GitHub:

```bash
git push origin add/battle-of-the-pass
```

Then open a pull request:

1. Go to your fork on GitHub.
2. You should see a banner saying "Compare & pull request." Click it.
3. Fill in the PR title and description (see below).
4. Click **Create pull request**.

---

## What to Include in Your PR

A good pull request description helps reviewers understand and approve your contribution quickly.

### PR Title

Keep it short and descriptive:

```
Add: Battle of the Pass (Children of Dune)
Fix: Paul blinded date correction (10207 → 10209 AG)
Update: Expanded Leto II death description
```

### PR Description Template

```markdown
## What

Brief description of what you added or changed.

## Events

- `battle-of-the-pass` — New event, significance 3, military
- (list each event you added or modified)

## Source / Citation

Which book(s) and chapter(s) support this event? Be specific.

Example: Children of Dune, Book Two — the confrontation at the pass
is described in detail during chapters 15-17.

## Significance Justification

Why did you choose this significance level?

Example: Significance 3 — a major battle within Children of Dune
but not universe-altering on the scale of the Battle of Arrakeen.

## Date Notes

If using `approximate` or `estimated` precision, explain your reasoning.
```

---

## What Reviewers Look For

When a maintainer reviews your PR, they check:

1. **Accuracy** -- Are the dates, descriptions, and book references correct?
2. **Significance** -- Is the significance level appropriate? (The most common feedback is "this should be lower.")
3. **Category** -- Does the chosen category match the primary nature of the event?
4. **Sources** -- Are book references provided? Are they specific enough?
5. **Duplicates** -- Does this event already exist in the dataset?
6. **Schema compliance** -- Does `npm run validate` pass?
7. **Writing quality** -- Is the description clear and concise? Is the `detailed` field well-written?
8. **ID conventions** -- Does the ID follow kebab-case naming conventions?

Reviewers may ask you to:
- Lower the significance level.
- Add more book references.
- Clarify a date or description.
- Merge with an existing event instead of creating a duplicate.

This is normal and collaborative. Do not take it personally.

---

## Using GitHub Discussions

Not everything needs to be a pull request right away. Use **GitHub Discussions** for:

### Questions

- "What significance should the founding of the Spacing Guild be?"
- "Which file should events from the Caladan Trilogy go in?"
- "Is there an established character ID for Count Fenring?"

### Ambiguities

- "The Dune Encyclopedia says X happened in year Y, but the Brian Herbert novels say Z. Which do we use?"
- "This event is mentioned in two books with slightly different details. How should we handle it?"

### Timeline Debates

- "Should Paul being blinded be dated 10,207, 10,208, or 10,209 AG? Here is the evidence for each..."
- "Is the Scattering better classified as `cultural` or `political`?"

Discussions are the right place to hash out these questions before investing time in a PR. Other contributors and maintainers can weigh in, and the community can reach consensus.

---

## Code of Conduct

Other Memory is a community project built by Dune fans for Dune fans. We ask that all contributors follow these principles:

### Cite Your Sources

Every event must be traceable to a published Dune novel. Use the `books` field to reference which book(s) mention the event. If something is only mentioned on a wiki, trace it back to its original novel source before adding it.

### No Fan Theories Without Book Backing

This is a timeline of events that *happened* in the Dune universe, not a collection of theories about what *might* have happened. Only include events that are explicitly stated or strongly implied in the source material.

- **Acceptable:** "Paul saw the Golden Path during his prescient visions" (stated in the books).
- **Not acceptable:** "Paul could have prevented the Jihad if he had chosen differently" (fan interpretation).

If you believe an inference is warranted, note it in the `detailed` field with clear reasoning and let reviewers decide.

### Be Respectful of Differing Interpretations

The Dune universe has ambiguities -- dates that contradict across books, events described differently by different characters, and a split between Frank Herbert's originals and the expanded novels. Reasonable people can disagree.

When there is a genuine disagreement:
- Present the evidence for each interpretation.
- Use the `detailed` field to document the ambiguity.
- Use `date_precision: estimated` when the date is your best inference.
- Be open to other contributors' perspectives.

### Be Welcoming

We want contributions from new Dune readers and longtime fans alike. If someone makes a mistake, help them fix it. If someone asks a basic question, answer it patiently. Everyone was new once.

---

## Summary

| Step | Command / Action |
|------|-----------------|
| Fork | Click "Fork" on GitHub |
| Clone | `git clone https://github.com/your-username/other-memory.git` |
| Branch | `git checkout -b add/your-event-name` |
| Edit | Modify YAML files in `data/` |
| Validate | `npm run validate` |
| Commit | `git add data/events/file.yaml && git commit -m "Add: your event"` |
| Push | `git push origin add/your-event-name` |
| PR | Open a pull request on GitHub |
