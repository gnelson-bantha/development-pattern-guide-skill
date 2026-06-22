# Developer Pattern Guide Agent Skill

This repository hosts the **`development-pattern-guide`** agent skill — a tool that
turns a real codebase into a **paginated, fully offline HTML tutorial website** that
teaches the *reusable pattern* behind it, so a developer can engineer their own
project the same way.

A trivial example of the output: a tutorial that teaches the **Singleton Pattern**
by walking through how to build a **database library**.

**[See a live example of the skill's output](https://gnelson-bantha.github.io/development-pattern-guide-skill/example-project/development-pattern-guide/)**
— a guide generated from the [`example-project/`](example-project/) sample codebase in this repository.

## What the skill does

Given a repository path, a repo URL, or a local folder, the skill:

1. **Researches the codebase deeply** — tech stack, high-level architecture, key
   classes/modules/services, control and data flow, and the setup/run path.
2. **Derives the repeatable pattern** — the core idea that makes the design work and
   could be reused elsewhere, along with its motivation, trade-offs, and
   consequences. This pattern becomes the spine of the tutorial.
3. **Generalizes all names** — real identifiers (e.g. `AcmePaymentGateway`) are
   replaced with purpose-based, general-purpose names (e.g. `PaymentService`) so the
   lesson teaches a pattern, not one specific project.
4. **Presents a summary and table of contents for approval** — before writing any
   files, it shows a high-level summary of the evaluated repository and the proposed
   chapter list, and waits for you to accept (or request changes).
5. **Generates a static site** — plain HTML + CSS + vanilla JS with one chapter per
   page, a fly-out table of contents, interactive architecture cards that open modal
   dialogs, and prev/next navigation.

The generated site opens directly in a browser: **no build step, no server, no CDN,
no network**. All assets, including fonts, are bundled locally.

### Generated chapter structure

| #  | Chapter                  | Purpose                                          |
|----|--------------------------|--------------------------------------------------|
| 0  | Table of Contents        | `index.html` landing page linking all chapters   |
| 1  | Introduction             | What the pattern does at its core                |
| 2  | Sourced Repository       | Technical overview of the real source repo (systems, sub-systems, classes) — the one chapter that uses real identifiers |
| 3  | Prerequisites            | Required tools, SDKs, accounts, assumed skills   |
| 4  | High Level Architecture  | Core systems and data/request flow (cards→modals)|
| 5..N | Pattern chapters       | Learn-by-doing core, one page each               |
| N  | Extending the System     | How to add features/plugins/modules              |
| N  | Deployment               | When applicable (e.g. cloud / .NET Aspire)       |
| N  | Appendix: Additional Reading | Curated URLs for the stack and concepts (absolute last) |

## How to use it

The skill supports three operations. Invoke it through your agent with one of the
following intents.

### 1. Create a new guide

Provide a source (repo path, repo URL, or folder):

```text
Create a development pattern guide from ./example-project
```

```text
Create a developer guide website from https://github.com/owner/repo
```

Optional flags:

- `--output repo|cwd` — where to write the guide (inside the repo, or the current
  working directory).
- `--style-guide <style-guide.html> --style-css <style-guide.css>` — bring your own
  design system instead of the default style.

The guide is always written into a `development-pattern-guide/` subfolder containing
`index.html`, the chapter pages, a `guide.json` manifest, and an `assets/` folder.

### 2. Add a chapter to an existing guide

```text
Add chapter "Caching Layer" after 6 in ./development-pattern-guide
```

The skill creates the new page, renumbers and renames affected chapters, and updates
all navigation and the `guide.json` manifest to stay consistent.

### 3. Update the style of an existing guide

```text
Update style --style-guide ./brand.html --style-css ./brand.css in ./development-pattern-guide
```

You can either tweak the existing CSS tokens or re-skin the whole guide from a
supplied style guide, while preserving the required structure (fly-out TOC, section
dividers, interactive cards, architecture modals, and prev/next navigation).

You can also ask for specific sections to be given the optional **dot-fade** or
**binary-fade** treatment — a gradient background with a decorative overlay that fades
in toward the right, with the section's text in a left column and the pattern in the
right column. `dot-fade` uses a navy dot-matrix; `binary-fade` uses the same gradient
base but a tiled pattern of 1's and 0's (binary data). Both ship in the default
stylesheet and are applied only to the sections you name:

```text
Give the "What You'll Learn" section the dot-fade treatment in ./development-pattern-guide
Give the "What You'll Learn" section the binary-fade treatment in ./development-pattern-guide
```

## Repository layout

```text
developer-guide-website/
├── .github/
│   └── skills/
│       └── development-pattern-guide/
│           ├── SKILL.md              # Full skill instructions
│           └── assets/               # Templates, CSS, JS, fonts, schema
└── example-project/                  # Sample codebase to generate a guide from
```

- **`.github/skills/development-pattern-guide/SKILL.md`** — the complete skill
  definition and operating instructions.
- **`example-project/`** — a small .NET sample app (`WorldLocations`) you can point
  the skill at to try generating a guide.

## Skill assets

The skill ships with everything needed to produce a fully offline site, located under
`.github/skills/development-pattern-guide/assets/`:

- `default-global.css` — the default stylesheet. Includes the optional `.dot-fade`
  and `.binary-fade` decorative sections (gradient base + navy dot-matrix or tiled
  1's-and-0's binary overlay, text-left / pattern-right) that can be applied to
  specific sections on request.
- `guide.js` — fly-out TOC toggle, modal open/close, and current-page marking.
- `fonts/` — bundled WOFF2 fonts (with `FONTS.md`).
- `templates/` — `page-template.html`, `toc-template.html`,
  `architecture-template.html`.
- `guide.schema.json` — schema for the `guide.json` manifest.
