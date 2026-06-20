---
name: development-pattern-guide
description: Examine a repository, repo URL, or local folder; derive a reusable, general-purpose development pattern from its architecture; and generate a paginated, fully offline HTML tutorial website (one chapter per page) that teaches developers to build similar projects with that pattern. Also adds chapters to, and restyles, existing generated guides. Use when the user wants a "development pattern guide", "developer guide website", a pattern tutorial, or to add a chapter / change the style of an existing one.
argument-hint: ["<repo-path | repo-url | folder> [--output repo|cwd] [--style-guide <style-guide.html> --style-css <style-guide.css>]", "add chapter \"<title>\" [after <n> | before <type>] [in <guide-path>]", "update style [--style-guide <style-guide.html> --style-css <style-guide.css>] [in <guide-path>]"]
---

# development-pattern-guide

Turn a real codebase into a **paginated, offline HTML tutorial** that teaches the
*pattern* behind it — so a developer can engineer their own project the same way.
A trivial example of the output: a tutorial on using the **Singleton Pattern** to
write a **database library**.

The generated site is plain static HTML + CSS + vanilla JS. It opens directly in a
browser: **no build step, no server, no CDN, no network**. All assets (including
fonts) are bundled.

> **Skill assets** live next to this file under `assets/`:
> `default-global.css`, `guide.js`, `fonts/` (bundled WOFF2 + `FONTS.md`),
> `templates/` (`page-template.html`, `toc-template.html`,
> `architecture-template.html`), and `guide.schema.json`.
> Resolve them relative to this `SKILL.md`; call that directory `SKILL_DIR`.

---

## 1. Detect the operation

Read the user's request and pick exactly one:

| Intent | Trigger | Go to |
|--------|---------|-------|
| **Create** a new guide | A repo path, repo URL, or folder is given (the default) | §3 |
| **Add a chapter** | "add a chapter", "insert a chapter", names a chapter to add | §4 |
| **Update style** | "update/change the style", "re-skin", supplies a new style-guide | §5 |

If the request is ambiguous (e.g. a path **and** "add a chapter"), ask the user
which operation they want before proceeding.

A user-supplied **style guide** (`style-guide.html` + `style-guide.css`) may be
provided to Create or Update style. See §6.

---

## 2. Output location (all operations that write a guide)

- The guide is **always** written into a subfolder named **`development-pattern-guide/`**.
  Create it if it does not exist; reuse it if it does.
- Deciding the **parent** of that subfolder:
  - **Local repository source** → you MUST ask the user where to put it:
    > "Create the guide inside the repository (`<repo>/development-pattern-guide/`)
    > or in the folder you started from (`<cwd>/development-pattern-guide/`)?"
  - **Repo URL source** (cloned to a temp dir) → use the current working directory
    (the folder the user started in). Do not write the guide into the temp clone.
  - **Local folder source that is not a git repo** → default to that folder; if it
    is clearly read-only or not the user's project, ask.
- Inside the guide folder, copy the skill assets into an `assets/` subfolder
  (see §3, step 6). Never modify the originals in `SKILL_DIR`.

---

## 3. Create a new guide

### Step 0 — Parse inputs
Identify the source (repo path / repo URL / folder) and any `--style-guide` /
`--style-css` paths. Report the plan to the user in one short line.

### Step 1 — Acquire the source
- **Repo URL** → `git clone --depth 1 <url>` into a temp directory; analyze there.
- **Local path / folder** → analyze in place (read-only; do not modify the source).
- Verify the path exists; if not, stop and tell the user.

### Step 2 — Resolve the output location
Apply §2. Confirm the final guide path with the user before generating files.

### Step 3 — Research the codebase (do this thoroughly)
Build a real understanding before writing anything. Prefer, in order: available
code-intelligence tools → language servers → `glob`/`grep` → reading key files.
Determine:
- **Tech stack**: languages, frameworks, runtimes, package managers, notable
  libraries/SDKs, cloud services (note **.NET Aspire** if present — see §5/Deployment).
- **High-level architecture**: the core systems, sub-systems, major components,
  and how they interact (entry points, control flow, data/request flow).
- **Key classes/modules/services** and their responsibilities.
- **The repeatable pattern**: the *core idea* that makes this design work and could
  be reused in another project (e.g. "a single shared accessor guards all access to
  a resource"). This pattern is the spine of the tutorial.
- **Setup/run path**: how someone installs deps and runs it locally (for Quick Start).

Report a short summary of the derived pattern to the user before generating.

### Step 4 — Generalize all names (critical)
The tutorial teaches a **reusable pattern**, so it must **not** use the source's
real identifiers. For every system, sub-system, class, and library, derive a
**general-purpose name from its purpose** and use that consistently everywhere.
- Example: `RetailerFinancialRecord` → `DataModel`; `AcmePaymentGateway` →
  `PaymentService`; `Foo.Bar.UserRepositoryImpl` → `Repository`.
- Keep a **naming map** (real → general) for your own consistency; write the
  general names into pages and into `guide.json`. Never leak the originals into the
  rendered guide. (You may keep the map in memory; do not ship it in the site.)

### Step 5 — Plan the chapters
Order is fixed for the framing chapters; pattern chapters sit in the middle.

**Required, in this order:**
0. **Table of Contents** — `index.html` (pretty landing page; links to all chapters).
1. **Introduction** — what this pattern does at its core.
2. **Prerequisites** — required tools, technologies, SDKs/packages, accounts or
   permissions, and assumed skills.
3. **Quick Start Guide** — install deps and run locally; goal: up and running in
   **under 10 minutes**, *no deep explanations yet*.
4. **High Level Architecture** — core systems/sub-systems, major components, how
   they interact, and data/request flow. Uses clickable **cards → modal dialogs**
   (see §7 and `architecture-template.html`).
5. **Helpful Resources** — curated URLs for the stack and concepts used by the pattern.

**Then the pattern chapters** — the "learn by doing" core. Break the pattern into
logical chapters, one HTML page each, sequenced so a reader can build their own
solution chapter-by-chapter.

**Then, last:**
- **Extending the System** — how to add features/plugins/modules, where they hook
  into the pattern, and common extension patterns.
- **Deployment** — *when applicable* (cloud-derived patterns): how to deploy. If the
  source uses **.NET Aspire**, explain deploying with Aspire (e.g. `azd` / Aspire
  manifests). Omit this chapter if deployment is not relevant to the pattern.

Number chapters 1..N (the TOC page is number 0 / `index.html`). Name files
`NN-slug.html` (zero-padded), e.g. `01-introduction.html`.

### Step 6 — Scaffold the site assets
From the **chosen guide folder**:
1. Create `assets/`.
2. **Default style** (no custom style guide): copy `SKILL_DIR/assets/default-global.css`,
   `SKILL_DIR/assets/guide.js`, the whole `SKILL_DIR/assets/fonts/` folder
   (WOFF2 + `FONTS.md`), and the whole `SKILL_DIR/assets/vendor/` folder
   (`highlight.min.js` + `HIGHLIGHTJS-LICENSE`, the bundled syntax highlighter)
   into `<guide>/assets/`.
3. **Custom style** (style guide supplied): follow §6 instead — link the user's
   `style-guide.css`, still copy `guide.js` and `vendor/`, and localize referenced fonts/assets.
4. Confirm there are **no CDN/`http(s)://` references** in the copied CSS.

### Step 7 — Generate the pages
For each chapter, copy the matching template and replace **every** `{{PLACEHOLDER}}`:
- **Delete every `<!-- TEMPLATE-GUIDE … -->` comment** — these are author guidance,
  not output, and they contain `{{…}}` tokens that must not ship.
- Most chapters → `templates/page-template.html`.
- Table of Contents (`index.html`) → `templates/toc-template.html`.
- High Level Architecture → `page-template.html` with its `{{CHAPTER_BODY}}` built
  from `templates/architecture-template.html` (one card **and** one matching modal
  per component; unique ids).
- Set `{{ASSETS}}` to `assets` (all pages sit at the guide root).
- Apply the **content & style rules** in §7 to every page.
- Use **general-purpose names** only (Step 4).

### Step 8 — Wire navigation and write the manifest
- Build the **fly-out TOC link list** once and embed the *identical* `{{TOC_LINKS}}`
  on every page. `guide.js` auto-marks the current page.
- Build the **TOC landing grid** (`{{TOC_ENTRIES}}`) on `index.html`.
- Set **footer prev/next** on every page from chapter order: each button shows the
  adjacent chapter's number + title; **Previous is left-aligned, Next right-aligned**.
  On the first chapter omit the `chapter-nav__prev` anchor; on the last omit
  `chapter-nav__next` (the remaining button keeps its side).
- Write **`<guide>/guide.json`** per `assets/guide.schema.json` (chapter order,
  types, titles/subtitles, files, `siteTitle`, `stylesheet`, and—if used—`styleSource`).
  This manifest is the source of truth for §4 and §5.

### Step 9 — Verify
- Confirm every `{{PLACEHOLDER}}` is gone and every `TEMPLATE-GUIDE` comment was
  removed (`grep -R "{{" <guide>` and `grep -R "TEMPLATE-GUIDE" <guide>` return nothing).
- Confirm every internal `href` resolves to a file that exists, and every
  `data-modal="X"` has a matching `id="X"`.
- Confirm `assets/` has the stylesheet, `guide.js`, fonts, and `vendor/highlight.min.js`;
  no network URLs. Spot-check that chapter pages still include the deferred
  `vendor/highlight.min.js` script (it ships in `page-template.html`) and that
  code blocks render highlighted.
- Open `index.html` in the browser if possible and sanity-check the fly-out TOC,
  a modal, and prev/next. Report the guide path and chapter list to the user.

---

## 4. Add a chapter to an existing guide

1. Locate the guide folder (the `development-pattern-guide/` containing `guide.json`).
   If you can't find `guide.json`, ask the user for the guide path.
2. Read `guide.json`. Determine **placement** from the user (e.g. "after chapter 6",
   "before Deployment"); if unspecified, ask. Keep the required framing chapters
   (TOC, Intro, Prerequisites, Quick Start, Architecture, Helpful Resources) at the
   front and Extending/Deployment at the back unless the user says otherwise.
3. Create the new page from `page-template.html`, following §7 and using the existing
   guide's general-purpose naming.
4. **Renumber** affected chapters and **rename files** if numbering shifts; update
   every page's `{{TOC_LINKS}}`, the `index.html` grid, and all prev/next footers so
   the chain stays consistent.
5. Update `guide.json` to match. Re-run the §3 Step 9 checks.

---

## 5. Update the style of an existing guide

1. Locate the guide and read `guide.json`.
2. **Two modes:**
   - **Token/CSS tweak** (no new style guide): edit the active stylesheet in
     `<guide>/assets/` (prefer the `:root` token block between `TOKENS:START` /
     `TOKENS:END` for color/font/spacing changes) and adjust pages only if class
     names change.
   - **Re-skin from a supplied style guide** (`--style-guide` + `--style-css`):
     follow §6, then regenerate page markup as needed to fit the new design system.
3. Keep the structure intact: every page must still have the fly-out TOC, stylized
   section dividers, chapter header+subhead, interactive cards, architecture
   cards→modals, and footer prev/next (mapped onto the new design — see §6).
4. Update `guide.json` (`stylesheet`, and `styleSource` if applicable). Re-run §3
   Step 9 checks. Confirm the result stays fully offline (no CDN references).

---

## 6. Bring-your-own style guide (`style-guide.html` + `style-guide.css`)

When the user supplies their own style guide, **use it in place of the default**.

1. **Inventory the design system.** Read `style-guide.html` to discover the
   available components, class names, design tokens, and layout patterns it offers.
   Read `style-guide.css` to learn its variables and conventions.
2. **Install the stylesheet.** Copy `style-guide.css` into `<guide>/assets/` and link
   it from every page instead of `default-global.css`. Record it as `stylesheet`
   (and the HTML path as `styleSource`) in `guide.json`. Still copy `guide.js`.
3. **Map required features onto the closest available styles.** Generate pages using
   the discovered vocabulary, matching these required capabilities to whatever the
   design system provides:
   fly-out Table of Contents · stylized section dividers · chapter header+subhead ·
   interactive (hover-reactive) cards · architecture cards that open modal dialogs ·
   footer prev/next (Previous left, Next right).
4. **Synthesize gaps in-style.** If a required component has no equivalent, create a
   small complementary style **consistent with the supplied system's tokens,
   spacing, and type** — do not fall back to the default look. Keep added CSS in the
   user's stylesheet (or a clearly-marked appended block).
5. **Stay offline.** Bundle any fonts/images the custom CSS references into
   `<guide>/assets/` and rewrite URLs to be relative. If something can't be
   localized (e.g. a remote-only asset), warn the user.
6. The `guide.js` behavior (fly-out toggle, modal open/close, current-page marking)
   is driven by the class/attribute **hooks** it expects
   (`.toc-flyout`, `.toc-flyout__tab`, `.toc-flyout.is-open`, `.modal`,
   `[data-modal]`, `[data-close]`, `.toc-flyout__link`). Preserve these hooks in the
   markup even when the visual styling comes from the user's CSS, or adapt `guide.js`
   accordingly.

---

## 7. Content & style rules (apply to every page)

- **Chapters are chunked.** Split each chapter into logical sections, each separated
  by a **stylized horizontal rule**: `<hr class="section-divider">`.
- **Titles + subtitles everywhere.** Every chapter has a header title + subhead
  subtitle (`.chapter-header`). Every section has its own title + subhead
  (`.section-heading` with `<h2>` + `.section-subhead`) briefly stating what it covers.
- **Code in code blocks.** Use `<pre class="codeblock"><code>…</code></pre>` for
  multi-line code and inline `<code>` for short snippets, wherever applicable.
  Keep code generic (use the generalized names).
  - **Syntax highlighting.** Tag each multi-line block with the snippet's language
    so the bundled highlighter (highlight.js) colors it:
    `<pre class="codeblock"><code class="language-csharp">…</code></pre>`.
    Use the matching token, e.g. `language-csharp`, `language-javascript`,
    `language-typescript`, `language-python`, `language-java`, `language-go`,
    `language-bash`, `language-json`, `language-xml` (for HTML/XML/`.csproj`),
    `language-css`, `language-sql`, `language-yaml`. If the language is unknown or
    not one of highlight.js's common languages, **omit the class** and auto-detection
    handles it. Always keep code **HTML-escaped** (`<`→`&lt;`, `&`→`&amp;`).
- **Interactive cards.** Use `.info-card` (in `.card-grid`) for important callouts;
  they have reactive hover effects already. The architecture chapter uses
  `.arch-card` (clickable) → `.modal`.
- **Architecture diagrams.** HTML card-based, clickable to expand into modal dialogs
  with more detail; include a `.arch-flow` row for data/request flow.
- **Fly-out Table of Contents.** Present on every page (the vertical **Contents**
  button on the left that reveals the panel on hover/focus/click).
- **Footer prev/next.** Present on every page; each button labeled with the adjacent
  chapter's number **and** title; Previous left-aligned, Next right-aligned.
- **Accessibility.** Keep the skip link, `role="dialog"`/`aria-modal` on modals,
  `aria-label`s, and don't remove the reduced-motion / print guardrails in the CSS.
- **Offline.** No `http(s)://` asset references anywhere; everything lives in `assets/`.

---

## 8. Placeholder reference

`page-template.html`: `{{PAGE_TITLE}}`, `{{CHAPTER_NUMBER}}`, `{{CHAPTER_TITLE}}`,
`{{CHAPTER_SUBHEAD}}`, `{{ASSETS}}`, `{{TOC_LINKS}}`, `{{SITE_TITLE}}`,
`{{CHAPTER_BODY}}`, `{{PREV_HREF}}`, `{{PREV_NUMBER}}`, `{{PREV_TITLE}}`,
`{{NEXT_HREF}}`, `{{NEXT_NUMBER}}`, `{{NEXT_TITLE}}`, `{{FOOTER_TEXT}}`.

`toc-template.html`: `{{SITE_TITLE}}`, `{{GUIDE_TITLE}}`, `{{GUIDE_SUBHEAD}}`,
`{{ASSETS}}`, `{{TOC_LINKS}}`, `{{TOC_ENTRIES}}`, `{{FOOTER_TEXT}}`.

Replace **all** of them; none may remain in a finished page.

---

## 9. Generated site layout (reference)

```
<parent>/development-pattern-guide/
├── index.html                         (Table of Contents)
├── 01-introduction.html
├── 02-prerequisites.html
├── 03-quick-start.html
├── 04-high-level-architecture.html    (cards → modals)
├── 05-helpful-resources.html
├── 06..NN-<pattern chapters>.html     (learn-by-doing)
├── <NN>-extending-the-system.html
├── <NN>-deployment.html               (when applicable)
├── guide.json                         (manifest — source of truth)
└── assets/
    ├── default-global.css  (or the user's style-guide.css)
    ├── guide.js
    ├── vendor/  (highlight.min.js + HIGHLIGHTJS-LICENSE — offline syntax highlighting)
    └── fonts/  (bundled WOFF2 + FONTS.md)
```
