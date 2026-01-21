# Post Creation Template

Use this file as a reference when creating new blog posts. 

## 1. File Naming Convention
The filename MUST follow this exact format:
```
YYYY-MM-DD-your-title-slug.md
```
**Example**: `_posts/2025-01-21-my-new-ai-project.md`

## 2. Front Matter Template (Copy & Paste)
Copy the block below into the very top of your new markdown file.

```yaml
---
layout: single
author_profile: true
title: "Your Post Title Here"
date: 2025-01-21
last_modified_at: 2025-01-21
excerpt: "A short 1-2 sentence description of what this post is about. This appears on the homepage cards."
categories:
  - AI
  - Data Science
tags: 
  - python
  - tutorial
  - deep-learning
header:
  overlay_color: "#1e293b" # Dark blue/slate color matching theme
  teaser: "/assets/images/icon.webp" # Image shown on homepage card (Square 500x500 is best)
  # overlay_image: "/assets/images/header.jpg" # Optional: Large hero image at top of post
toc: true
toc_label: "On this page"
toc_sticky: true
---
```

## 3. Writing Content
Write your content below the second `---`.

### Headers
Use `#` for H1 (Avoid using H1 manually, the title handles it), `##` for H2, `###` for H3.

### Images
Put images in `assets/images/posts/` and link them like this:
`![Description](/assets/images/posts/my-image.jpg)`

### Code Blocks
Use triple backticks with language name:
```python
def hello():
    print("Hello world")
```
