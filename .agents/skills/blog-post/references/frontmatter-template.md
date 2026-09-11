# Front Matter Specification & Taxonomies

Every article published on the blog requires a Jekyll YAML front matter block. This document defines all schema fields, conventions, and established taxonomy values.

---

## Front Matter Template

```yaml
---
layout: single
author_profile: true
title: "Your Benefit-Driven Post Title"
date: 2026-03-28
last_modified_at: 2026-03-28
description: "A 150-160 character description summarizing the article. This is used for SEO meta tags and social card embeds."
excerpt: "1-2 punchy sentences previewing the article. Appears on homepage card teasers. An emoji is welcome 😉."
categories:
  - AI
  - Developer Tools
tags:
  - python
  - tutorial
  - deep-learning
header:
  overlay_color: "#1e293b" # Theme slate color (#1e293b)
  teaser: "/assets/images/icon.webp" # Card teaser image (500x500 square recommended)
  # overlay_image: "/assets/images/posts/hero.webp" # Optional hero banner
toc: true
toc_label: "On this page"
toc_sticky: true
---
```

---

## Field Reference

| Field | Type | Required? | Purpose & Rules |
|---|---|---|---|
| `layout` | string | **Yes** | Must be `single`. Minimal Mistakes post layout. |
| `author_profile`| boolean | **Yes** | Set to `true` to render author sidebar profile. |
| `title` | string | **Yes** | The article title. Wrapped in quotes. Do NOT repeat as `# Title` in body. |
| `date` | `YYYY-MM-DD` | **Yes** | Publication date. Must match filename date prefix. |
| `last_modified_at` | `YYYY-MM-DD` | **Yes** | Update when substantial edits occur. |
| `description` | string | **Yes** | 150-160 chars for search engines & OpenGraph. |
| `excerpt` | string | **Yes** | 1-2 punchy sentences for card grid. |
| `categories` | list | **Yes** | 1-3 broad categories (see Taxonomy below). |
| `tags` | list | **Yes** | Lowercase, hyphenated topical keywords. |
| `header.overlay_color` | hex string | **Yes** | Default `#1e293b`. Matches theme glassmorphism styling. |
| `header.teaser` | path string | **Yes** | Default `/assets/images/icon.webp` or post-specific thumbnail. |
| `toc` | boolean | **Yes** | Set `true` to enable table of contents. |
| `toc_label` | string | **Yes** | Set to `"On this page"`. |
| `toc_sticky` | boolean | **Yes** | Set to `true` for sticky scrolling sidebar TOC. |

---

## Established Categories Taxonomy

Use existing categories to maintain clean archive navigation:

- `AI`
- `Developer Tools`
- `API`
- `Deployment`
- `Data Science`
- `Photography`
- `Bioinformatics`
- `Tutorial`

---

## Common Tags Reference

Tags should be lowercase, kebab-case, and precise:

- Tools/Libraries: `python`, `fastapi`, `docker`, `ollama`, `docling`, `rag`, `mcp`, `pytorch`
- Concepts: `code-intelligence`, `knowledge-graph`, `local-first`, `document-parsing`, `vector-search`
- Workflows: `tutorial`, `benchmarks`, `system-design`, `self-hosting`
