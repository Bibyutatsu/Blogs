---
name: blog-post
description: >-
  Author, review, humanize, and validate technical blog posts for the Jekyll blog repository.
  Use this skill whenever the user asks to create a new blog post, draft an article, edit or polish
  an existing post in _posts/, or mentions /blog-post. Enforces strict file naming conventions
  (YYYY-MM-DD-title-slug.md), Jekyll front matter metadata, the Solution-Walkthrough narrative structure,
  rigorous anti-AI humanization (zero em dashes, elimination of AI vocabulary and superficial framing),
  Kramdown formatting standards, and automated verification with tools/check_post.py.
---

# Jekyll Blog Post Publishing SOP

This skill guides the end-to-end authoring, review, humanization, and validation of technical articles for Bibhash's dev blog. It codifies repository conventions from `_posts/`, the tooling in `tools/`, and the `/humanizer` writing standards.

---

## Quick Reference & Subdocs

For deep reference during authoring, consult the modular guides:

- **Rendering Pitfalls & Historical Git Corrections**: [references/rendering-and-pitfalls.md](references/rendering-and-pitfalls.md)
- **Front Matter Reference & Taxonomies**: [references/frontmatter-template.md](references/frontmatter-template.md)
- **Solution-Walkthrough Narrative Pattern**: [references/narrative-structure.md](references/narrative-structure.md)
- **Anti-AI Humanizer Checklist**: [references/anti-ai-checklist.md](references/anti-ai-checklist.md)
- **Post Template**: [tools/POST_TEMPLATE.md](tools/POST_TEMPLATE.md)
- **Validation Script**: [tools/check_post.py](tools/check_post.py)

---

## Authoring Workflow

Execute these sequential phases when authoring or revising any post:

```
[Phase 1: Scope] ➔ [Phase 2: Name File] ➔ [Phase 3: Front Matter] ➔ [Phase 4: Draft] ➔ [Phase 5: Humanize] ➔ [Phase 6: Format] ➔ [Phase 7: Validate]
```

### Phase 1: Scoping & Topic Definition

Before writing, establish:
1. **Topic & Angle**: What is the core problem and why do existing solutions fail?
2. **Artifacts & Data**: Real benchmarks, architecture diagrams, GitHub repositories, paper citations, or code implementations.
3. **Primary Category**: e.g., `AI`, `Developer Tools`, `API`, `Deployment`, `Photography`.
4. **Publication Date**: Today's date or user-specified date (`YYYY-MM-DD`).

### Phase 2: File Naming & Placement

All blog posts **MUST** be placed in `_posts/` with the exact naming format:

```text
_posts/YYYY-MM-DD-title-slug.md
```

- **Date**: Must match the `date` field in front matter (`YYYY-MM-DD`).
- **Slug**: Kebab-case or CamelCase topic slug matching existing repo patterns:
  - Good: `2026-03-28-Repolect.md`
  - Good: `2026-02-21-DoclingServe.md`
  - Good: `2026-02-19-RAG.md`
  - Bad: `new-post.md` (missing date)
  - Bad: `2026-3-5-test.md` (non-padded date)

### Phase 3: Front Matter Configuration

Every post must start with a complete YAML front matter block between `---` delimiters on line 1:

```yaml
---
layout: single
author_profile: true
title: "Your Post Title Here"
date: YYYY-MM-DD
last_modified_at: YYYY-MM-DD
description: "150-160 character concise summary for SEO meta tags and social sharing."
excerpt: "1-2 punchy sentences with an optional emoji 😉. This is the preview shown on homepage cards."
categories:
  - AI
  - Developer Tools
tags:
  - python
  - tutorial
header:
  overlay_color: "#1e293b" # Theme slate color
  teaser: "/assets/images/icon.webp" # Card thumbnail (500x500 square)
toc: true
toc_label: "On this page"
toc_sticky: true
---
```

> [!IMPORTANT]
> - **Layout Must Be `single`**: Never use `layout: post`. Minimal Mistakes theme expects `layout: single` to properly load author profiles, sticky TOCs, and sidebar styles.
> - **No Duplicate H1**: Never add `# Post Title` after the front matter. Jekyll's `single` layout automatically renders `title` as the page `<h1>`. Starting the markdown body with an H1 creates duplicate titles.
> - **Mandatory SEO & Excerpt**: Ensure `description` (150-160 chars) and `excerpt` (1-2 sentences with punch) are populated.

### Phase 4: Narrative Architecture (The Solution-Walkthrough)

Draft following the proven structure from `_posts/2026-03-28-Repolect.md` and `_posts/2026-02-21-DoclingServe.md`:

1. **Opening Hook**: 1-2 sentence core thesis and benefit statement. State what the project does and what it replaces.
2. **The Problem**: Concrete pain point. Why naive approaches (e.g. vector search on code, expensive proprietary APIs) break down in practice.
3. **The Solution**: Introduce the tool, repo stars, license, or core innovation.
4. **Architecture & Design**: Break down how it works under the hood. Use ASCII diagrams, Markdown tables, or syntax-safe Mermaid diagrams.
5. **Technical Deep Dive**: Walk through key files, algorithms, or configurations with syntax-highlighted code blocks (`python`, `yaml`, `bash`).
6. **Usage Guide**: Copy-pastable commands (`curl`, CLI commands, Docker run, Python snippets). Prefer vivid headings (*"Two Commands, Then Coffee"* over *"Getting Started"*).
7. **Limits & Realities**: Transparently discuss edge cases, cold starts, memory constraints, or blast radiuses (builds engineering trust).
8. **Roadmap & External Links**: What is next, version info, links to GitHub/PyPI. Use Kramdown security attributes:
   ```markdown
   [GitHub Repo](https://github.com/Bibyutatsu/Project){:target="_blank" rel="noopener noreferrer"}
   ```
9. **Footnotes & References**: Use academic-style citations `[^1]`.
   - **Critical Rule**: NEVER use vertical pipes (`|`) inside footnote link titles (e.g. `[Doc | API](...)`). Pipes break Kramdown's table and link parser. Use hyphens `-` instead.

#### Mermaid Diagram Requirements
When adding ````mermaid` blocks:
- **Quote Special Characters**: Wrap any node label containing `()`, `[]`, `/`, `.`, `-`, or `<br/>` in double quotes: `Root["1. Root Probe<br/>(Reads repo summaries)"]`.
- **Quote Subgraph Titles**: `subgraph IP ["Indexing Pipeline"]` or `subgraph "Analyzer (image → metrics)"`.
- **Theme-Appropriate Styling**: Apply dark-palette styles so nodes are crisp against the dark theme:
  `style Start fill:#111827,stroke:#38bdf8`
  `style Success fill:#064e3b,stroke:#34d399`
  `style Alert fill:#450a0a,stroke:#f87171`
- **Blank Lines**: Always keep an empty line before and after the ````mermaid` block.

### Phase 5: Anti-AI Humanizer Pass (Rigorous De-AI-fication)

Apply the `/humanizer` audit to all generated prose. Run the **draft ➔ audit ➔ rewrite** loop:

#### Hard Constraints
- **ZERO EM DASHES OR EN DASHES**: Absolutely no `—`, `–`, or `--` used as dashes. Replace with periods, commas, colons, parentheses, or restructure the sentence into two clauses.
- **ZERO AI VOCABULARY**: Never use:
  *delve, tapestry, testament, crucial, pivotal, vibrant, underscore, landscape, intricate, interplay, fostered, garnered, showcase, beacon, notable, moreover, furthermore*.
- **NO SUPERFICIAL `-ing` PARTICIPLES**: Cut clauses like *"highlighting the importance of..."*, *"ensuring seamless integration..."*, *"symbolizing the enduring..."*.
- **NO COPULA AVOIDANCE**: Use direct verbs (*"is"*, *"has"*, *"contains"*). Do not write *"serves as"*, *"stands as"*, or *"boasts a"*.
- **NO NEGATIVE PARALLELISMS OR TAILING NEGATIONS**: Avoid *"Not only X, but Y"*, *"It's not just about speed, it's about control"*, or trailing fragments like *"no guessing"*.
- **NO RULE-OF-THREE PADDING**: Do not force concepts into threes (*"fast, scalable, and robust"*). State only the real qualities.
- **NO GENERIC UPBEAT CLOSINGS**: Do not end with *"The future looks bright for..."* or *"Exciting times lie ahead"*. End on concrete facts, next steps, or the reference list.
- **PRESERVE VOICE & SOUL**: Keep the author's direct, pragmatic, builder perspective. Include concrete numbers, edge case discoveries, and real tradeoffs.

### Phase 6: Kramdown & Asset Formatting Standards

1. **Jekyll `baseurl` in Image Paths (CRITICAL)**:
   - The site uses `baseurl: "/Blogs"` in `_config.yml`.
   - **In Markdown body**: ALL local images **MUST** include the `/Blogs` prefix:
     ```markdown
     ![Screenshot](/Blogs/assets/images/posts/my-image.webp)
     ```
     *(Omitting `/Blogs` causes images to 404 on GitHub Pages).*
   - **In Front Matter (`header.teaser`)**: Use `/assets/images/icon.webp` (Jekyll automatically applies `relative_url` to front matter teaser paths).
2. **Blank Lines Around Block Elements (Mandatory Kramdown Rule)**:
   - Always put a full blank line before AND after every image, table, blockquote, and diagram.
   - Missing blank lines cause Kramdown to render images as inline text instead of HTML blocks.
3. **Quotes & Ellipses**:
   - Use straight ASCII quotes (`"`, `'`), never curled quotes (`“`, `”`).
   - Use standard triple dots (`...`), never unicode ellipses (`…`).
4. **Thematic Breaks**: Ensure `---` dividers have blank lines above and below.

### Phase 7: Automated Validation Pipeline

Always validate the finished markdown before presenting it or committing:

1. **Run `tools/check_post.py`**:
   ```bash
   python3 tools/check_post.py _posts/YYYY-MM-DD-your-slug.md
   ```
   Ensures:
   - Filename matches regex `^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$`.
   - Front matter has valid closing delimiter `---`.
   - Mandatory keys `title` and `date` exist.
   - Simulation preview renders correctly.

2. **Verify Post Excerpt & Description**:
   - Check that `description` is 150-160 characters.
   - Check that `excerpt` displays cleanly for homepage cards.

3. **Verify Kramdown / Jekyll Build (if environment allows)**:
   ```bash
   bundle exec jekyll build
   ```
   Ensures zero Liquid syntax errors, broken links, or Kramdown parsing bugs.
