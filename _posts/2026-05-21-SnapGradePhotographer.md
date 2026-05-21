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

The first screen you see is **Library** — a single intake form titled *Open a roll*. This is where you tell SnapGrade which folder to analyze and which optional models to enable for this pass.

![Library screen with folder picker, optional model toggles for scene classifier, salient subject, object detector, screenshot/document, semantic search, and post-ingest grouping](/assets/images/snapgrade/library.png)
*The Library intake. Pick a folder, opt into the heavier models you actually need, and choose whether to run burst grouping and face clustering after analysis.*

Type or paste a folder path into the input field and click **Analyze**. SnapGrade walks the folder recursively, decodes each image (JPEG, HEIC, RAW), runs the full analysis pipeline, and writes results to a local SQLite database at `~/.snapgrade/library.db`. Progress shows in real time.

Re-running analysis on the same folder is fast — images that haven't changed are skipped entirely. Only new or modified files get re-processed.

Below the intake form is a live **semantic search** field labeled *Search by description*. If you opted into semantic indexing during analysis, you can type natural-language queries like "golden hour portrait" or "wide angle mountain" and SnapGrade returns the visually closest matches using [MobileCLIP](https://github.com/apple/ml-mobileclip) embeddings — all local inference, no API call.

---

## The Triage Screen: Find What to Keep

**Triage** is the main working view, branded as *The Contact Sheet*. It shows your images in a grid with verdict chips (green for keeper, yellow for review, red for reject) and star ratings overlaid on each thumbnail. The top bar holds folder switching, verdict tabs, a timeline scrubber, and the layout/theme toggles.

![Triage Contact Sheet with photo grid, verdict chips, star overlays, timeline scrubber, and the detail panel showing EXIF and verdict for the selected frame](/assets/images/snapgrade/triage.png)
*The Contact Sheet in Grid view. Verdict chips and stars overlay each thumbnail; the right-side detail panel surfaces full EXIF, the verdict, and the per-image reasons.*

### Layout Modes: Grid and Filmstrip

The Triage screen supports two layout modes toggled from the top bar:

* **Grid View**: A dense contact sheet showing verdict chips and star overlays directly on the thumbnails — best for scanning.
* **Filmstrip View**: Places the active frame in a large central workspace with a horizontal, scrollable strip of thumbnails along the bottom — best for inspection. Arrow keys move through frames instantly.

![Triage in Filmstrip mode: one large central frame with subject bounding box overlay and a bottom strip of thumbnails](/assets/images/snapgrade/filmstrip.png)
*Filmstrip mode gives you a single hero frame, the bottom thumbnail strip for navigation, and the detail panel on the right.*

### Subject-Aware Bounding Box Overlays

When a frame is selected, SnapGrade overlays the bounding boxes it actually used during analysis — the subject regions detected by MediaPipe face detection or the saliency fallback. This isn't decorative: those boxes are what the sharpness metric was computed on. Seeing them lets you verify that the autofocus landed where you wanted it.

![Lightbox view of a night Acropolis shot with two labelled subject bounding boxes — SUBJECT 1 (orange) and SUBJECT 2 (white) — drawn over the detected saliency regions](/assets/images/snapgrade/subject_bboxes.png)
*Lightbox view with subject overlays on. The orange and white boxes are the exact regions used for subject-aware sharpness scoring.*

### Filters: Every Dimension You Care About

The left-side filter panel collapses by default. When you open it, you get the full filter surface — every dimension SnapGrade has indexed.

![Triage with the full filter panel expanded — quality histograms, rejection flag toggles, content type and scene dropdowns, color palette wheel, and hue tolerance slider, alongside the photo grid and detail panel](/assets/images/snapgrade/triage_filters.png)
*The full Triage filter surface. Sharpness and aesthetic histograms double as visual sliders; the colour wheel lets you anchor on dominant hues.*

The filter set includes:

- **Verdict**: keepers, review-needed, rejects, or everything
- **Stars**: minimum star rating (1–5)
- **Quality histograms**: live sharpness and aesthetic distributions — drag to define a range visually
- **Rejection flags**: blur, closed eyes, over/underexposure, horizon tilt — each as an independent toggle
- **Content type**: photos vs. screenshots vs. documents
- **Scene**: indoor, outdoor, night, food, etc.
- **OCR / animals**: filter to frames that contain detected text or animals
- **Colour palette**: anchor on one or more dominant hues using the colour wheel, with a ± degree tolerance slider
- **Camera / ISO / aperture / orientation**: standard EXIF-based filters
- **Date range**: scrub the timeline at the top, or set explicit from/to dates
- **Burst only / best-of-burst**: collapse to one frame per burst group

Filters stack — you can ask for "all keepers shot at ISO ≥ 3200 with a warm colour cast and at least 4 stars" in three clicks.

---

## Bursts Screen: Pick the Best Frame Automatically

If you shoot bursts — sports, kids, anything where you fire 6–10 frames per second — the **Bursts** screen is where the real time saving happens.

![Burst Comparison screen: sidebar listing four burst groups, main panel showing Burst #2 with two side-by-side frames and a BEST badge on the chosen keeper](/assets/images/snapgrade/bursts.png)
*Burst Comparison. SnapGrade picks one BEST frame per group based on a weighted score; you can override the pick from this screen.*

SnapGrade groups burst frames by perceptual hash similarity and capture timestamp. Within each group, it ranks frames by a weighted quality score (sharpness 45%, exposure 12%, aesthetic 13%, eye openness 20%, smile 10%) and marks the top frame as **best-of-burst**. The Triage view can be filtered to show only best-of-burst frames, collapsing a 600-frame shoot to the 90 frames that actually matter — before you've done any manual work.

The grouping threshold is tunable. By default, frames shot within 3 seconds with a perceptual hash distance under 10 bits are treated as the same burst. You can loosen both from the CLI: `snapgrade group --hamming 14 --seconds 30`.

---

## Faces Screen: Browse by Person

**Face Clusters** groups detected faces using local embeddings (InsightFace `buffalo_s`) and greedy cosine similarity. Every distinct person in your library gets a cluster card, and clicking *View all* filters the photo grid to every shot featuring that person.

![Face Clusters screen showing one cluster card with four representative thumbnails of the same person and an appearance count](/assets/images/snapgrade/faces.png)
*Face Clusters view. Each card represents one detected person, with the appearance count and a quick "view all" link into a filtered Triage.*

This screen is particularly useful for event photography: after an engagement shoot or a birthday party, you can immediately pull every frame with a specific person and triage that subset independently.

Face clustering is opt-in — run `uv run snapgrade faces` after analysis, or tick *Cluster faces* in the Library intake form's post-analysis options.

---

## Settings: Tune the Verdicts to Your Style

Every threshold and weight that drives a verdict lives in the **Settings** screen, branded as *The Darkroom*. Move a slider, and the entire library is instantly re-classified against the new thresholds — no images are re-analyzed, because the underlying metrics are already cached.

![Darkroom settings screen with sliders for sharpness keeper/reject thresholds, horizon tilt warning, weight sliders for sharpness, exposure, eyes, aesthetic, and rule-flag toggles for closed eyes and over/underexposure](/assets/images/snapgrade/settings.png)
*The Darkroom. Sharpen acceptance, loosen rejection, or rebalance the weights — verdicts update across the whole library instantly.*

The exposed controls:

* **Sharp keeper threshold** (default 0.55) — above this, an image's sharpness counts as keeper-grade.
* **Sharp reject threshold** (default 0.30) — below this, the image is an automatic reject regardless of other scores.
* **Horizon tilt warning** (default ±3°) — surfaces as a warning chip, never auto-rejects.
* **Weight sliders** — sharpness, exposure, eyes, aesthetic. These determine how the star rating is composed from the underlying metrics.
* **Rule flags** — toggle hard rejections for closed eyes, overexposure, underexposure.

If you shoot portraits, push the eyes weight up. If you shoot architecture, push the horizon-tilt tolerance down. The system is built to be tuned, not just used.

---

## Organize Screen: Build a Folder Hierarchy

Once you've triaged your library, the **Organize** screen — *The Hierarchy* — lets you restructure it. You define a folder template using tokens: predefined variables that expand from image metadata.

![Organize screen with scope picker (all libraries), three configured hierarchy levels — date YYYY, camera model, quality:verdict — and a token reference table below listing all available tokens](/assets/images/snapgrade/organize.png)
*The Hierarchy builder. Add ordered levels; SnapGrade previews the resulting folder tree before any file is moved.*

A typical setup might be:

```text
{date:YYYY}/{camera_model}/{quality:verdict}
```

Available tokens include date components, camera make and model, scene type, ISO bucket, verdict, star rating, palette/season, GPS data, and more — all visible in the on-screen reference table. The `/` separator nests them automatically: `{year}/{month}` produces `2025/May/`, `{year}/{month}/{scene}` produces `2025/May/outdoor/`.

You can choose to **move** files into the new hierarchy or create **symlinks** (leaving originals in place). Symlinks are the safer default if you're also managing files in Lightroom.

---

## XMP Export: Take Your Ratings Anywhere

Every rating SnapGrade assigns — verdict, star count, rejection reasons — can be written to an **XMP sidecar** file stored alongside the original image. XMP is the open standard that Lightroom, darktable, Capture One, and Bridge all read natively.

![Batch XMP Export screen showing a table of images with thumbnails, filenames, verdict chips, star ratings, and per-row Write/Reset buttons; verdict-tab filter and Select All toggle at the top](/assets/images/snapgrade/xmp_export.png)
*Batch XMP Export. Filter by verdict, select what you want to write, and SnapGrade lays sidecars next to your originals.*

Run the export from the CLI:

```bash
uv run snapgrade write-xmp /path/to/your/photos
```

Or trigger it from the Batch XMP Export screen. After this, open your folder in Lightroom and the ratings are already there — five-star keepers, one-star rejects, color labels for review-flagged images. SnapGrade's triage becomes a first pass that you refine in whatever editor you prefer.

---

## Visual Themes: Calibrate Your Environment

Culling at night in a dark editing suite and culling outdoors on a bright laptop screen need different visual treatments. SnapGrade ships three themes, switchable from the top-bar dropdown — and switching is instant, with no reload.

### Film Lab (default)

![Triage screen in Film Lab theme — warm amber accents on near-black background with a serif title, designed for editing-suite use](/assets/images/snapgrade/theme_film_lab.png)
*Film Lab — the default. Warm amber accents on a near-black canvas, with a film-grain feel. Best for low-light editing.*

### Modern

![Triage screen in Modern theme — neon orange accents on cool dark grey, with a slightly brighter background and sharper UI chrome](/assets/images/snapgrade/theme_modern.png)
*Modern — cleaner, cooler dark mode with a sharper UI. Best for typical screen workflows.*

### Light Pro

![Triage screen in Light Pro theme — white background with red verdict accents and dark text, calibrated for high-contrast triage in bright environments](/assets/images/snapgrade/theme_light_pro.png)
*Light Pro — a calibrated light mode for bright environments and colour-accurate triage. Best for daylight use on a laptop.*

All three themes preserve the same layout and information density; only the colour palette and surface contrast change. Pick whichever doesn't fight your eyes for the next hour.

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
[^4]: [InsightFace](https://github.com/deepinsight/insightface) — face embedding model (`buffalo_s`) used for clustering
