---
layout: single
author_profile: true
title: "SnapGrade: A Classical CV Photo Intelligence Pipeline That Runs at 3.3 img/s on 8 GB RAM"
date: 2026-05-21
last_modified_at: 2026-05-21
description: "How I built a fully local photo culling system using classical computer vision — no transformers, no VLMs — that runs at 3.3 images per second on an 8 GB MacBook Air and makes smart keep/reject decisions using a transparent, tunable decision layer."
excerpt: "Classical CV + a threshold decision engine outperforms a VLM for photo culling — and fits in 8 GB of RAM at 3.3 img/s."
categories:
  - AI
  - Developer Tools
tags:
  - computer-vision
  - local-first
  - python
  - fastapi
  - sqlite
  - mediapipe
  - opencv
  - photo-culling
  - performance
  - classical-cv
header:
  overlay_color: "#1e293b"
  teaser: "/assets/images/icon.webp"
toc: true
toc_label: "On this page"
toc_sticky: true
---

The obvious way to build a photo culling tool in 2025 is to throw a vision-language model at it. Feed each image to a VLM, ask "is this a good photo?", parse the answer. It works, sort of. It's also slow, expensive, and — on an 8 GB MacBook Air with a modest photo library — completely impractical.

I built **SnapGrade** to prove that classical computer vision, applied carefully, covers 95% of what makes a photo a keeper or a reject. Blurry shots, closed eyes, blown highlights, burst duplicates, horizon tilt: all of these have precise, fast, interpretable measures. No transformer needed. The system processes 3.3 images per second on the same 8 GB machine, re-runs are instant (SQLite cache), and every verdict comes with a human-readable reason string — not a probability from a black box.

This post covers the architecture, the metrics layer, the decision engine, and the performance optimization work that got throughput from 1.9 to 3.3 img/s.

---

## Architecture: Three Decoupled Layers

The system has three layers that share no state except the SQLite database:

```mermaid
flowchart TD
    subgraph "Analyzer (pure image → metrics)"
        A[Image Decode\ndecode.py] --> B[EXIF Extraction\nexif.py]
        A --> C[Sharpness\nLaplacian + Tenengrad + FFT]
        A --> D[Subject Detection\nMediaPipe face + saliency]
        A --> E[Blink Detection\nFaceMesh + EAR]
        A --> F[Exposure\nhistogram + clipping]
        A --> G[Perceptual Hash\npHash + dHash]
        A --> H[Composition\nHough lines + bbox]
    end

    subgraph "Decision Engine (metrics + thresholds → verdict)"
        I[Thresholds dataclass] --> J[Weighted quality score]
        J --> K[Verdict: keeper / review / reject]
        J --> L[Stars: 1..5]
        K --> M[Reasons list]
    end

    subgraph "Organizer / UI"
        N[FastAPI backend\nSQLite reads + mutators]
        O[React SPA\nLibrary / Triage / Organize / Settings]
        P[XMP sidecar writer]
        Q[Hierarchical organizer\ntoken-based folder tree]
    end

    C & D & E & F & G & H --> I
    M --> N
    N --> O
    N --> P
    N --> Q

    style A fill:#111827,stroke:#38bdf8
    style I fill:#111827,stroke:#38bdf8
    style N fill:#111827,stroke:#38bdf8
    style K fill:#064e3b,stroke:#34d399
    style M fill:#064e3b,stroke:#34d399
```

The Analyzer is stateless — pure functions from `np.ndarray` to metric dataclasses, with no I/O. The Decision Engine is a pure function from `(metrics_dict, Thresholds) → Verdict`. The Organizer never calls either: it reads the SQLite cache. This means the UI can re-classify images by changing thresholds without re-running any CV — the metrics are already cached.

The single source of truth is `~/.snapgrade/library.db`. Files on disk are never authoritative. Re-runs skip any image whose mtime hasn't changed, making the second pass through a 2,000-image library effectively free.

---

## The Metrics Layer

### Sharpness: Three Complementary Signals

A single sharpness metric is unreliable. Laplacian variance fires on noise as well as edges. Tenengrad (Sobel gradient energy) is more robust but can be fooled by high-contrast static subjects. FFT directional energy distinguishes camera shake (directional blur) from defocus (isotropic blur).

```python
# snapgrade/metrics/sharpness.py

def laplacian_variance(rgb: np.ndarray, bbox=None) -> float:
    gray = _crop(_to_gray(rgb), bbox)
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())

def tenengrad(rgb: np.ndarray, bbox=None) -> float:
    gray = _crop(_to_gray(rgb), bbox)
    gx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    return float(np.mean(gx * gx + gy * gy))
```

Both operate on an optional `bbox` — the subject bounding box detected by MediaPipe. Subject-aware sharpness avoids penalizing intentional background blur (bokeh) and focuses the measurement where it matters: the face, or the primary saliency region if no face is detected.

The combined `score` (0..1) feeds the decision engine. A score below 0.30 is an automatic reject; above 0.55 is keeper-quality sharpness.

### Blink Detection: Eye Aspect Ratio

Closed-eye detection uses MediaPipe FaceMesh to extract 468 facial landmarks per detected face, then computes the **Eye Aspect Ratio (EAR)** — the ratio of vertical to horizontal eye extent. Values below 0.20 indicate a closed or nearly-closed eye.

The key design choice here: EAR is measured per face, and `any_closed = True` if *any* face in the frame has a closed eye. For group portraits this is conservative by design — one blinking person rejects the frame. The threshold (0.20) and the `reject_closed_eyes` flag are both user-configurable via the `Thresholds` dataclass.

### Burst Grouping: Union-Find on Perceptual Hashes

Rapid-fire bursts are grouped by two criteria: perceptual hash distance (64-bit pHash, Hamming distance ≤ 10 bits) and capture timestamp proximity (within 3 seconds). A union-find structure merges connected components in O(N α(N)):

```python
# snapgrade/group.py

class _UnionFind:
    def __init__(self, n: int) -> None:
        self.parent = list(range(n))

    def find(self, x: int) -> int:
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]  # path compression
            x = self.parent[x]
        return x

    def union(self, a: int, b: int) -> None:
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[rb] = ra
```

Within each burst group, frames are ranked by a weighted quality score — sharpness 45%, eye openness 20%, aesthetic 13%, exposure 12%, smile 10%, highlight clipping −10% — and the top frame is marked `best_image_id`. The UI can filter to best-of-burst only, collapsing a 600-frame event into ~90 candidates.

---

## The Decision Engine

The decision engine is a pure function with no imports from the metrics layer — it receives a plain `dict` of metric results and a `Thresholds` dataclass:

```python
# snapgrade/decide.py

@dataclass
class Thresholds:
    sharp_keeper: float = 0.55   # >= → keeper-quality sharpness
    sharp_reject: float = 0.30   # < → auto-reject
    accept_overexposed: bool = False
    accept_underexposed: bool = False
    reject_closed_eyes: bool = True
    horizon_warn_deg: float = 3.0  # warn only, never auto-rejects

    # Star score weights
    w_sharpness: float = 0.50
    w_exposure: float = 0.18
    w_eyes: float = 0.14
    w_composition: float = 0.08
    w_aesthetic: float = 0.10
```

Each sub-score is computed independently (exposure histogram analysis, EAR-to-score mapping, composition tilt scoring) and combined into a single 0..1 quality score. Stars are binned from the continuous score: ≥0.80 → 5 stars, ≥0.65 → 4 stars, and so on. The verdict is determined by hard threshold checks first (sharpness below `sharp_reject`, or `reject_closed_eyes` and any face blinking) — a hard reject doesn't get softened by a good aesthetic score.

The `Thresholds` dataclass serializes to JSON and is stored in the database, so the UI can modify thresholds and re-classify the entire library without touching any image file.

---

## Performance: From 1.9 to 3.3 img/s

The initial pipeline ran at 1.90 img/s on 53 test images. Getting to 3.28 img/s on 2,070 images required two main changes.

### Decode Bottleneck

Profiling revealed that image decoding (rawpy for RAW, Pillow for JPEG/HEIC) dominated wall time — often more than the CV inference itself. Two fixes:

1. **PIL draft mode**: JPEG images are decoded at a reduced resolution first using Pillow's draft mode, which skips unnecessary decompress work when the full resolution isn't needed for the analysis pass.
2. **EXIF fast path**: If an embedded JPEG thumbnail exists in the RAW file's EXIF data, SnapGrade uses that instead of full RAW decode. For culling purposes, a 1200px embedded JPEG is sufficient for sharpness and exposure metrics.

### Thread-Local YuNet Model

MediaPipe and OpenCV's face detector (YuNet) are not thread-safe when shared across threads. The initial implementation used a single global model instance, which serialized all inference through a lock. The fix: thread-local storage via `threading.local()` so each worker thread initializes its own model copy.

```python
_tls = threading.local()

def _get_detector() -> cv2.FaceDetectorYN:
    if not hasattr(_tls, "detector"):
        _tls.detector = cv2.FaceDetectorYN.create(...)
    return _tls.detector
```

This eliminated the lock contention and allowed genuine parallel inference.

### Benchmark Results

| Corpus | Phase | Wall time | Throughput | Notes |
|---|---|---|---|---|
| 2,070 images | Pre-optimization | 767.6 s | 2.70 img/s | Single-threaded decode, shared model |
| 2,070 images | Post-optimization | 630.7 s | **3.28 img/s** | Draft decode + thread-local models |
| 53 images | Re-run (cached) | 0.00 s | — | mtime match, zero re-processing |

The cached re-run at 58.5 MB RSS is the number I'm most satisfied with — the second pass through a library is effectively free, which matters when you're iterating on threshold tuning.

---

## SQLite as the Single Source of Truth

All analysis results live in `~/.snapgrade/library.db`. The schema uses a JSON blob column for metrics rather than individual columns, which means adding a new metric never requires a migration — it just appears in the blob on the next analysis run. Columns are only promoted to dedicated schema fields when they need to be indexed or filtered (e.g., `verdict` and `stars` have dedicated columns because the UI filters on them constantly).

WAL mode is enabled so that read-heavy UI queries don't block background ingest writes. The organizer, XMP writer, and report generator all read from this cache — they never touch image files directly.

---

## Getting Started (Developer)

```bash
git clone https://github.com/Bibyutatsu/SnapGrade
cd SnapGrade
uv sync --all-extras

# Analyze a folder
uv run snapgrade analyze /path/to/photos

# Start the API + UI
uv run snapgrade serve   # → http://127.0.0.1:8765

# Write XMP sidecars for rated images
uv run snapgrade write-xmp /path/to/photos

# Run tests
uv run pytest
```

The optional models — aesthetic scoring (CoreML NIMA), semantic search (MobileCLIP), face clustering (InsightFace `buffalo_s`), OCR and content-type classification — are all gated behind environment variables or CLI flags. The base pipeline runs without any of them.

---

## What's Next

The next significant piece is a smarter **subject segmentation** path using the already-wired `subject_seg.py` module — separating foreground from background properly should improve sharpness scoring on images with complex depth of field. There's also an open question about whether the aesthetic NIMA model (opt-in CoreML) is pulling its weight relative to the compositional signals that are already running unconditionally.

Source, issues, and the full design rationale are on GitHub:

[SnapGrade on GitHub](https://github.com/Bibyutatsu/SnapGrade){:target="_blank" rel="noopener noreferrer"}

---

## References

[^1]: [Tenengrad focus measure — Pertuz et al., 2013](https://www.sciencedirect.com/science/article/pii/S0031320312004736) — comparative study of focus measures including Tenengrad and Laplacian variance
[^2]: [Eye Aspect Ratio for blink detection — Soukupová & Čech, 2016](http://vision.fe.uni-lj.si/cvww2016/proceedings/papers/05.pdf) — original EAR formulation using facial landmarks
[^3]: [pHash — perceptual image hashing](http://phash.org/) — basis for burst grouping
[^4]: [MediaPipe FaceMesh](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker) — 468-landmark facial geometry used for EAR computation
[^5]: [NIMA: Neural Image Assessment](https://arxiv.org/abs/1709.05424) — aesthetic scoring model, opt-in CoreML inference
