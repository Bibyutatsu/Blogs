# Common Rendering Pitfalls & Historical Git Corrections

This document codifies real-world issues, root causes, and solutions discovered across the git history of the `Blogs` repository. Adhere strictly to these patterns to prevent recurring regressions.

---

## 1. Jekyll `baseurl` Image Path Breakage
*Historical Commits: `6288e478`, `e7722b67`*

- **The Issue**: On GitHub Pages, the site is hosted under `https://Bibyutatsu.github.io/Blogs` with `baseurl: "/Blogs"`. Linking images as `/assets/images/...` in markdown causes the browser to request `https://Bibyutatsu.github.io/assets/images/...`, returning HTTP 404.
- **The Rule**:
  - **In Markdown body**: ALL local images **MUST** include the `/Blogs` prefix:
    ```markdown
    <!-- CORRECT -->
    ![Triage screen](/Blogs/assets/images/snapgrade/triage.png)

    <!-- INCORRECT - Will 404 on GitHub Pages -->
    ![Triage screen](/assets/images/snapgrade/triage.png)
    ```
  - **In YAML Front Matter (`header.teaser`)**: Use `/assets/images/icon.webp` (Jekyll's layout automatically applies `| relative_url` to front matter teaser paths).

---

## 2. Mermaid Diagrams: Special Characters, Syntax & Dark Theme
*Historical Commits: `a36a9ca1`, `f743c8f8`, `15755965`*

- **The Issue 1 (Special Character Parser Crashes)**: Mermaid's parser crashes when node labels or subgraph names contain parentheses `()`, arrows `→`, colons `:`, periods `.`, slashes `/`, brackets `[]`, or hyphens `-` without surrounding double quotes.
  ```mermaid
  <!-- INCORRECT - Mermaid syntax error -->
  A[1. Root Probe (Reads repo)] --> B

  <!-- CORRECT - Node text wrapped in ["..."] -->
  A["1. Root Probe<br/>(Reads repo)"] --> B
  ```

- **The Issue 2 (Subgraph Title Escaping)**: Subgraphs with titles containing spaces or parentheses must quote the title or use an alias:
  ```mermaid
  <!-- CORRECT -->
  subgraph IP ["Indexing Pipeline"]
      Scan["Scan Repo"] --> Parse["Hybrid Parse"]
  end

  <!-- ALSO CORRECT -->
  subgraph "Analyzer (image → metrics)"
      Decode["Image Decode"]
  end
  ```

- **The Issue 3 (Line Breaks inside Nodes)**: Never put literal raw newlines inside a node label. Use `<br/>` or `\n`:
  ```mermaid
  <!-- CORRECT -->
  Tree["tree.json<br/>(Semantic Tree)<br/>LLM-Navigable"]
  ```

- **The Issue 4 (Dark Theme Node Readability)**: The site uses a dark Minimal Mistakes theme (`#1e293b`). Default mermaid nodes can have low contrast or jarring white backgrounds. Apply explicit dark-palette styling to key nodes:
  ```mermaid
  <!-- Dark mode friendly node styling -->
  style Start fill:#111827,stroke:#38bdf8
  style Success fill:#064e3b,stroke:#34d399
  style Alert fill:#450a0a,stroke:#f87171
  ```

- **The Issue 5 (Kramdown Integration)**: Always use fenced code blocks with ````mermaid` and ensure a full blank line exists before and after the block. `_includes/scripts.html` converts `.language-mermaid` to `<div class="mermaid">` on DOMContentLoaded.

---

## 3. Pipe Characters (`|`) Breaking Footnote Links & Tables
*Historical Commit: `b808be99`*

- **The Issue**: Kramdown interprets the vertical bar (`|`) as a table column delimiter. Putting a pipe in a footnote reference link title corrupts markdown parsing.
  ```markdown
  <!-- INCORRECT - Pipe breaks Kramdown reference parser -->
  [^8]: [API Reference | docling-serve | DeepWiki](https://deepwiki.com/...)

  <!-- CORRECT - Replaced with hyphens or colons -->
  [^8]: [API Reference - docling-serve - DeepWiki](https://deepwiki.com/...)
  ```

---

## 4. Layout Name: `single` vs. `post`
*Historical Commits: `113911e2`, `272f2892`, `c04f69a3`*

- **The Issue**: Minimal Mistakes uses `layout: single`, NOT `layout: post`. Setting `layout: post` breaks the CSS layout, sidebars, TOC, and author profile.
  ```yaml
  # CORRECT
  layout: single
  author_profile: true

  # INCORRECT
  layout: post
  ```

---

## 5. Duplicate `<h1>` Title Rendering
*Historical Commits: `26f683c6`, `eb331a65`*

- **The Issue**: Minimal Mistakes automatically renders the front matter `title` as the page's primary `<h1>` element. If the author manually writes `# Post Title` at the start of the body, two consecutive H1s appear.
- **The Rule**: Never start post content with `# Title`. Start directly with the lead paragraph or an H2 (`##`).

---

## 6. Blank Lines Around Block Elements (Kramdown Mandatory Rule)
*Historical Commit: `eb331a65`*

- **The Issue**: In Kramdown, if an image `![alt](url)` or blockquote `>` does not have a complete blank line before AND after it, it is treated as an inline element. Images will fail to render as blocks and often output as raw markdown text.
  ```markdown
  <!-- INCORRECT -->
  Here is some introductory text.
  ![Screenshot](/Blogs/assets/images/demo.png)
  And here is the follow-up text.

  <!-- CORRECT -->
  Here is some introductory text.

  ![Screenshot](/Blogs/assets/images/demo.png)

  And here is the follow-up text.
  ```

---

## 7. SEO Description & Excerpt Completeness
*Historical Commits: `eb331a65`, `e282d966`*

- **The Issue**: Missing `description` breaks search engine previews and OpenGraph cards. An unquoted or overly generic `excerpt` results in bland homepage cards.
- **The Rule**: Always provide both fields:
  - `description`: 150-160 characters, no quotes or cleanly escaped.
  - `excerpt`: 1-2 punchy sentences with personality and an optional emoji (`😉`).

---

## 8. Link Security Attributes
*Historical Commit: `15755965`*

- **The Issue**: External outbound links without `target="_blank" rel="noopener noreferrer"` can pose security/tabnabbing risks and navigate users away from the blog.
- **The Rule**: Use Kramdown inline attribute lists:
  ```markdown
  [SnapGrade on GitHub](https://github.com/Bibyutatsu/SnapGrade){:target="_blank" rel="noopener noreferrer"}
  ```

---

## 9. Punchy, Action-Oriented Headings (Human Tone)
*Historical Commit: `623143b3`*

- **The Issue**: Academic or robotic headings reduce engagement.
- **Before vs After**:
  - *"Getting Started"* ➔ *"Two Commands, Then Coffee"*
  - *"The filter set includes:"* ➔ *"What you can filter on:"*
  - *"The first screen you see is Library"* ➔ *"Drop a Folder. Walk Away."*
