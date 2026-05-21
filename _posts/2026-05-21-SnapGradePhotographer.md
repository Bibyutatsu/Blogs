---
layout: single
author_profile: true
title: "SnapGrade: Cull Your Entire Photo Library Without Touching Lightroom AI"
date: 2026-05-21
last_modified_at: 2026-05-21
description: "SnapGrade is a free, fully local web app that automatically rates and culls your photo library — blurry shots, closed eyes, blown highlights, burst duplicates, and all. Your photos never leave your machine."
excerpt: "A free local web app that does smart photo culling — blurry shots, closed eyes, burst picks — without uploading a single file to the cloud."
categories:
  - Developer Tools
  - AI
tags:
  - photography
  - photo-culling
  - local-first
  - computer-vision
  - triage
  - burst-photography
  - lightroom
  - darktable
  - workflow
  - python
header:
  overlay_color: "#1e293b"
  teaser: "/assets/images/icon.webp"
toc: true
toc_label: "On this page"
toc_sticky: true
---

You come back from a shoot with 600 frames. Maybe half are burst duplicates. Maybe 80 have someone blinking. Maybe 30 are soft because you were shooting wide open in low light and the autofocus picked the wrong eye. The actual keepers — the ones you'd ever open in an editor — are maybe 90 frames. Finding those 90 by hand is the most mind-numbing part of photography.

**SnapGrade** is a fully local web application that does this triage automatically. It analyzes every image for sharpness, exposure, blink detection, composition, and more — then assigns a verdict (keeper, review, or reject) and a star rating. It groups burst shots and picks the best frame. It clusters faces so you can see every photo of a specific person. It exports XMP sidecars that Lightroom, darktable, and Capture One can read directly. And the entire process happens on your machine: no subscription, no cloud upload, no vendor lock-in.

---

## What SnapGrade Checks

Before walking through the UI, it helps to understand what "automatic culling" means here. SnapGrade is not a black-box AI model — it runs a set of transparent, measurable checks on each image:

| Signal | What it catches |
|---|---|
| **Sharpness** (Laplacian + Tenengrad) | Out-of-focus shots, camera shake, motion blur |
| **Blink / closed-eye detection** | Any face with eyes below the open threshold |
| **Exposure** | Blown highlights, crushed shadows, overall luma |
| **Composition** | Horizon tilt, rule-of-thirds offset |
| **Burst similarity** (perceptual hash) | Near-duplicate frames from rapid-fire shooting |
| **Aesthetic score** (optional, CoreML) | NIMA-based perceived quality — opt-in only |

Each check contributes a weighted score. The weights are visible and adjustable in the Settings screen — so if you shoot portraits and closed eyes are an absolute reject, you can weight that heavily. If you shoot landscapes where blinks are irrelevant, you can turn it off entirely.

---

## Getting Started

SnapGrade requires Python 3.11+ and [uv](https://docs.astral.sh/uv/). Install it and launch the web server in two commands:

```bash
git clone https://github.com/Bibyutatsu/SnapGrade
cd SnapGrade
uv sync --all-extras
uv run snapgrade serve
```

The UI opens at `http://127.0.0.1:8765`. Everything from here is point-and-click.

---

## The Library Screen: Point and Analyze

The first screen you see is **Library**. This is where you tell SnapGrade which folder to analyze.

<!-- IMAGE NEEDED: Library screen showing the folder path input and Analyze button, with a progress bar — check the ui/ directory or take a screenshot from a running instance -->

Type or paste a folder path into the input field and click **Analyze**. SnapGrade walks the folder recursively, decodes each image (JPEG, HEIC, RAW), runs the full analysis pipeline, and writes results to a local SQLite database at `~/.snapgrade/library.db`. Progress shows in real time.

Re-running analysis on the same folder is fast — images that haven't changed are skipped entirely. Only new or modified files get re-processed.

The Library screen also shows a live **semantic search** field if you ran analysis with semantic embeddings enabled. Type "golden hour portrait" or "wide angle mountain" and SnapGrade returns the visually closest matches using [MobileCLIP](https://github.com/apple/ml-mobileclip) embeddings — all local inference, no API call.

---

## The Triage Screen: Find What to Keep

**Triage** is the main working view. It shows your images in a grid with verdict chips (green for keeper, yellow for review, red for reject) and star ratings overlaid on each thumbnail.

<!-- IMAGE NEEDED: Triage screen showing a photo grid with keeper/review/reject chips and star overlays, and the filter panel on the left side -->

The left-side filter panel lets you narrow the grid along any combination of dimensions:

- **Verdict**: show only keepers, only rejects, or everything
- **Stars**: minimum star rating (1–5)
- **Rejection flags**: show only blurry shots, only closed-eye shots, only over/underexposed, only tilted horizon
- **Content type**: photos vs. screenshots vs. documents (useful if your camera roll mixes both)
- **Scene**: indoor, outdoor, night, food, etc.
- **Camera / ISO / aperture / orientation**: standard EXIF-based filters
- **Date range**: filter to a specific shoot window
- **Burst only**: show only frames that are part of a detected burst sequence

Filters stack — you can ask for "all portraits shot at ISO ≥ 3200 that are keepers but have a tilt warning" in a few clicks. Clicking any image opens a detail view with the full metrics breakdown: exact sharpness score, EAR (eye aspect ratio) for each face, exposure histogram, and the reasons behind the verdict.

---

## Burst Screen: Pick the Best Frame Automatically

If you shoot bursts — sports, kids, anything where you fire 6–10 frames per second — the **Bursts** screen is where the real time saving happens.

<!-- IMAGE NEEDED: Bursts screen showing a grouped burst strip with the best-of-burst frame highlighted -->

SnapGrade groups burst frames by perceptual hash similarity and capture timestamp. Within each group, it ranks frames by a weighted quality score (sharpness 45%, exposure 12%, aesthetic 13%, eye openness 20%, smile 10%) and marks the top frame as **best-of-burst**. You can filter the Triage view to show only best-of-burst frames, which collapses a 600-frame shoot to the 90 frames that actually matter — before you've done any manual work.

The grouping threshold is tunable. By default, frames shot within 3 seconds with a perceptual hash distance under 10 bits are treated as the same burst.

---

## Faces Screen: Browse by Person

**Faces** clusters detected faces using local embedding models and greedy cosine similarity. Every distinct person in your library gets a cluster, and clicking a cluster shows every photo featuring that person.

<!-- IMAGE NEEDED: Faces screen showing face cluster chips at the top and a photo grid filtered to one person below -->

This screen is particularly useful for event photography: after an engagement shoot or a birthday party, you can immediately pull every frame with a specific person and triage that subset independently.

Face clustering is opt-in — run `uv run snapgrade faces` after analysis to generate the clusters, or enable it from the Library screen's post-analysis options.

---

## Organize Screen: Build a Folder Hierarchy

Once you've triaged your library, the **Organize** screen lets you restructure it. You define a folder template using tokens — predefined variables that expand from image metadata:

```text
{year}/{month}/{scene}/{camera_make}
```

SnapGrade previews the resulting folder tree before moving or symlinking anything. Available tokens include year, month, day, camera make and model, scene type, ISO bucket, verdict, star rating, event name, and more. The `/` separator nests them automatically: `{year}/{month}` produces `2025/May/`, `{year}/{month}/{scene}` produces `2025/May/outdoor/`.

You can choose to **move** files into the new hierarchy or create **symlinks** (leaving originals in place). Symlinks are the safer default if you're also managing files in Lightroom.

---

## XMP Export: Take Your Ratings Anywhere

Every rating SnapGrade assigns — verdict, star count, rejection reasons — can be written to an **XMP sidecar** file stored alongside the original image. XMP is the open standard that Lightroom, darktable, Capture One, and Bridge all read natively.

Run the export from the CLI:

```bash
uv run snapgrade write-xmp /path/to/your/photos
```

Or trigger it from the UI's export button. After this, open your folder in Lightroom and the ratings are already there — five-star keepers, one-star rejects, color labels for review-flagged images. SnapGrade's triage becomes a first pass that you refine in whatever editor you prefer.

---

## What SnapGrade Is Not

A few things worth being clear about: SnapGrade is not trying to replace your editing software. It doesn't touch or convert your image files. It doesn't upload anything anywhere. It doesn't learn from your corrections in real time (though you can override any verdict in the Triage screen, and overrides persist in the database).

The aesthetic score model (NIMA via CoreML) is opt-in and only runs on Apple Silicon. Everything else — sharpness, blink detection, exposure, burst grouping — works on any Mac with Python installed.

---

## Try It

The full source, installation instructions, and CLI reference are on GitHub:

[SnapGrade on GitHub](https://github.com/Bibyutatsu/SnapGrade){:target="_blank" rel="noopener noreferrer"}

If you shoot more than a few hundred frames per session and are currently culling by hand, give it a run on a recent folder. The first re-run after analysis completes in under a second — all results come from the local SQLite cache.

---

## References

[^1]: [MobileCLIP: Fast Image-Text Models through Multi-Modal Reinforced Training](https://arxiv.org/abs/2311.17091) — Apple's efficient CLIP model used for semantic search
[^2]: [NIMA: Neural Image Assessment](https://arxiv.org/abs/1709.05424) — the aesthetic scoring model, optional CoreML inference
[^3]: [XMP Specification](https://www.adobe.com/devnet/xmp.html) — Adobe's open metadata standard for image ratings and labels
