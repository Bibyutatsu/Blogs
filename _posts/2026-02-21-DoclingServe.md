---
layout: single
author_profile: true
title: "How I Hosted Docling-Serve on Hugging Face Spaces — A Free Document AI API for Everyone"
date: 2026-02-21
last_modified_at: 2026-02-21
description: "A comprehensive guide on deploying Docling-Serve to Hugging Face Spaces for free document parsing and AI applications."
excerpt: "Learn how to host IBM's Docling-Serve on Hugging Face Spaces for free. A complete walkthrough of Docker configuration, rate limiting, and API usage for document AI."
categories:
  - AI
  - API
  - Deployment
tags:
  - docling
  - huggingface
  - docker
  - fastapi
  - document-parsing
  - python
header:
  overlay_color: "#1e293b"
  teaser: "/assets/images/icon.webp"
toc: true
toc_label: "On this page"
toc_sticky: true
---

## The Problem: Document Parsing is Hard (and Expensive)

If you've ever tried building a RAG pipeline, an AI document assistant, or any application that ingests real-world documents, you know the pain. PDFs have inconsistent layouts. Tables break during extraction. Scanned documents need OCR. And the tools that handle this well — like Adobe's APIs or AWS Textract — come with usage-based pricing that adds up fast.

Enter **Docling**, an open-source toolkit by IBM that uses state-of-the-art AI models for layout analysis (DocLayNet) and table structure recognition (TableFormer) to parse documents into clean, structured representations. It supports PDFs, DOCX, PPTX, XLSX, HTML, images, and more, converting them into Markdown, JSON, or plain text. With 53.7k+ stars on GitHub, it was the #1 trending repository worldwide in November 2024.[^1][^2][^3]

The Docling team also built **docling-serve**, a FastAPI-based API service that wraps Docling's capabilities into RESTful endpoints. You can run it locally or in a container, and it exposes synchronous and asynchronous conversion endpoints, document chunking for RAG, and even a built-in Gradio UI.[^4]

But here's the catch: running docling-serve locally requires downloading several GB of ML models, a decent amount of RAM, and ideally a GPU for best performance. Not everyone has that setup handy, especially during a hackathon or when prototyping.

**So I decided to host it on Hugging Face Spaces — for free — so anyone can use it without setting up anything.**

***

## What is Docling?

Docling is IBM's open-source document conversion toolkit designed to get documents ready for generative AI workflows. Under the hood, it uses a pipeline of specialized AI models:[^5]

- **Layout Analysis (DocLayNet):** A deep learning model that identifies text blocks, headings, tables, figures, lists, and other structural elements on each page.[^3][^1]
- **Table Structure Recognition (TableFormer):** Detects rows, columns, headers, merged cells, and complex table layouts — preserving the tabular format that traditional parsers destroy.[^6]
- **OCR Engine:** Supports multiple OCR backends including EasyOCR, RapidOCR, and Tesseract for scanned documents and images.[^7]
- **Picture Classification:** Uses vision-language models (like SmolVLM) to classify and describe images found within documents.

Each document is first parsed by a PDF backend, which retrieves programmatic text tokens and renders bitmap images of each page. Then, the AI models run independently on every page to extract features and content. Finally, the results are aggregated into a unified `DoclingDocument` representation that can be exported to Markdown, JSON, HTML, or text.[^1]

### Supported Formats

| Direction | Formats |
|-----------|---------|
| **Input** | PDF, DOCX, PPTX, XLSX, HTML, Markdown, AsciiDoc, CSV, Images (PNG, JPEG, TIFF, BMP, GIF) |
| **Output** | Markdown, JSON (Docling Document), Text, HTML, Doctags |

***

## What is Docling-Serve?

Docling-serve wraps the Docling library into a production-ready API service built with FastAPI and Uvicorn. Instead of writing Python scripts to convert documents, you can simply send HTTP requests to a running server.[^4]

### Key Features

- **REST API with v1 Endpoints:** Stable API with both synchronous and asynchronous document conversion.[^8]
- **File Upload & URL Support:** Convert documents by uploading files directly or by providing HTTP URLs.[^9]
- **Document Chunking:** Built-in endpoints for hybrid and hierarchical chunking — essential for RAG pipelines that need to split documents into semantic chunks before embedding.[^8]
- **Task Management:** Async endpoints return a `task_id` that can be polled for status and results — perfect for large documents that take time to process.[^8]
- **Built-in UI:** A Gradio-based playground at `/ui` for interactive testing.[^4]
- **Container Images:** Official Docker images available for CPU, CUDA 12.6, and CUDA 12.8 configurations.[^4]
- **API Key Authentication:** Optional security via the `X-Api-Key` header when `DOCLING_SERVE_API_KEY` is configured.[^8]

***

## Why Host It on Hugging Face Spaces?

Hugging Face Spaces provide free hosting for ML applications with Docker support. The free tier offers 2 vCPUs and 16 GB of RAM — enough to run docling-serve with CPU-based inference. The key advantages:[^10][^11]

1. **Zero cost** — No cloud bills, no credit card required.
2. **Instant accessibility** — Anyone can hit the API endpoint from anywhere.
3. **Docker SDK support** — Spaces can run any Docker container, not just Gradio/Streamlit apps.[^10]
4. **Git-based deployment** — Push to the repo, and the Space rebuilds automatically.

The trade-off? The free tier has limited compute, and the Space goes to sleep after ~48 hours of inactivity. The first request after sleep triggers a cold start that takes 2–5 minutes (loading PyTorch models). But for prototyping, testing, and small workloads, it's more than adequate.

***

## How I Set It Up

The full deployment consists of just **three files**: a `Dockerfile`, an `app_wrapper.py`, and a `README.md` with HF Spaces metadata.

### The Dockerfile

```dockerfile
FROM ghcr.io/docling-project/docling-serve:latest

ENV DOCLING_SERVE_ENABLE_UI=true \
    UVICORN_PORT=7860 \
    UVICORN_HOST=0.0.0.0 \
    DOCLING_SERVE_MAX_SYNC_WAIT=300 \
    PYTHONWARNINGS="ignore::UserWarning"

# Download the SmolVLM model required by the UI for Picture Description
RUN docling-tools models download-hf-repo HuggingFaceTB/SmolVLM-256M-Instruct

# Add wrapper that provides root "/", rate limiting, and concurrency control
COPY --chown=1001:0 app_wrapper.py /opt/app-root/src/app_wrapper.py

# HF Spaces expects port 7860
EXPOSE 7860

CMD ["uvicorn", "app_wrapper:app"]
```

The approach is straightforward: start from the official `docling-serve` Docker image (which already includes all Docling models and dependencies), adjust the port to 7860 (required by HF Spaces), pre-download the SmolVLM model for picture description, and overlay a custom wrapper.[^10]

### The Custom Wrapper (`app_wrapper.py`)

This is where the interesting engineering happens. Hugging Face Spaces has a specific requirement: the root path (`/`) must return an HTTP response for health checks. The default docling-serve doesn't serve anything at `/`, so the Space would appear unhealthy.[^10]

The wrapper solves this and adds two critical protections for a public free-tier deployment:

**1. Root Redirect for Health Checks**

```python
@app.get("/", include_in_schema=False)
async def root():
    """Redirect root to Gradio UI (also serves as HF Spaces health check)."""
    return RedirectResponse(url="/ui/")
```

**2. Per-IP Sliding Window Rate Limiter**

Since this is a free public instance, uncontrolled usage could exhaust the limited resources. The wrapper implements an in-memory sliding window rate limiter that allows 2 requests per minute per IP on the heavy endpoints (`/v1/convert/*` and `/v1/chunk/*`):

```python
RATE_LIMIT_PER_MINUTE = int(os.environ.get("DOCLING_WRAPPER_RATE_LIMIT", "2"))

def _is_rate_limited(client_ip: str) -> bool:
    now = time.time()
    window_start = now - 60.0
    _rate_limit_store[client_ip] = [
        ts for ts in _rate_limit_store[client_ip] if ts > window_start
    ]
    if len(_rate_limit_store[client_ip]) >= RATE_LIMIT_PER_MINUTE:
        return True
    _rate_limit_store[client_ip].append(now)
    return False
```

**3. Global Concurrency Semaphore**

Document conversion is memory-intensive. On a 16 GB free tier, running too many simultaneous conversions causes OOM crashes. An asyncio semaphore limits concurrent heavy tasks to 3:

```python
MAX_CONCURRENT_TASKS = int(os.environ.get("DOCLING_WRAPPER_MAX_CONCURRENT", "3"))
_semaphore = asyncio.Semaphore(MAX_CONCURRENT_TASKS)
```

Both limits are configurable via environment variables, and clients that exceed them receive a `429 Too Many Requests` response with a helpful message suggesting the async endpoints.

### The README.md

The README serves double duty. Its YAML front matter tells HF Spaces how to build and run the Docker container:

```yaml
---
title: Docling Serve
emoji: 📄
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
license: mit
---
```

Setting `sdk: docker` tells Spaces to build from the Dockerfile, and `app_port: 7860` configures the health check port.[^10]

***

## Architecture Overview

```
┌──────────────────────────────────────┐
│  Hugging Face Spaces (Free Tier)     │
│  2 vCPU · 16 GB RAM · CPU Basic     │
├──────────────────────────────────────┤
│  Custom Dockerfile                   │
│  ├── FROM docling-serve:latest       │
│  ├── app_wrapper.py                  │
│  │   ├── Root "/" → "/ui/" redirect  │
│  │   ├── IP rate limiter (in-memory) │
│  │   └── Concurrency semaphore       │
│  └── Exposes Port: 7860             │
├──────────────────────────────────────┤
│  docling-serve (FastAPI + Uvicorn)   │
│  ├── Layout detection model          │
│  ├── Table structure model           │
│  └── OCR / Picture classifier        │
└──────────────────────────────────────┘
```

The wrapper sits as a FastAPI middleware on top of the original docling-serve app. It intercepts requests, checks rate limits and concurrency, and then passes valid requests through to the underlying Docling pipeline.

***

## Using the Hosted API

The live instance is available at:

| Interface | URL |
|-----------|-----|
| **Gradio UI** | `https://Bibyutatsu-HF-docling-serve.hf.space/ui` |
| **Swagger Docs** | `https://Bibyutatsu-HF-docling-serve.hf.space/docs` |
| **Scalar API Docs** | `https://Bibyutatsu-HF-docling-serve.hf.space/scalar` |

### Convert a Document from URL (cURL)

```bash
curl -X POST "https://Bibyutatsu-HF-docling-serve.hf.space/v1/convert/source" \
  -H "Content-Type: application/json" \
  -d '{
    "sources": [{"kind": "http", "url": "https://arxiv.org/pdf/2501.17887"}]
  }'
```

### Upload a Local File

```bash
curl -X POST "https://Bibyutatsu-HF-docling-serve.hf.space/v1/convert/file" \
  -F "files=@/path/to/document.pdf"
```

### Async Conversion (Recommended for Large Files)

For documents that take longer to process, async endpoints prevent HTTP timeouts:

```bash
# Start the task
curl -X POST "https://Bibyutatsu-HF-docling-serve.hf.space/v1/convert/source/async" \
  -H "Content-Type: application/json" \
  -d '{"sources": [{"kind": "http", "url": "https://arxiv.org/pdf/2501.17887"}]}'

# Poll for status
curl "https://Bibyutatsu-HF-docling-serve.hf.space/v1/task/{task_id}/status"

# Fetch result when completed
curl "https://Bibyutatsu-HF-docling-serve.hf.space/v1/task/{task_id}/result"
```

### Document Chunking for RAG

The chunking endpoints are particularly useful for vector database ingestion:

```bash
curl -X POST "https://Bibyutatsu-HF-docling-serve.hf.space/v1/chunk/hybrid/source" \
  -H "Content-Type: application/json" \
  -d '{"sources": [{"kind": "http", "url": "https://arxiv.org/pdf/2501.17887"}]}'
```

### Python Example

```python
import requests
import time

BASE_URL = "https://Bibyutatsu-HF-docling-serve.hf.space"

# Async conversion (recommended for large PDFs)
response = requests.post(
    f"{BASE_URL}/v1/convert/source/async",
    json={"sources": [{"kind": "http", "url": "https://arxiv.org/pdf/2501.17887"}]}
)

task_id = response.json().get("task_id")
print(f"Task started: {task_id}")

# Poll until complete
status = "pending"
while status in ["pending", "processing"]:
    time.sleep(5)
    res = requests.get(f"{BASE_URL}/v1/task/{task_id}/status")
    status = res.json().get("status")
    print(f"Status: {status}")

# Fetch result
result = requests.get(f"{BASE_URL}/v1/task/{task_id}/result").json()
print(result['document']['md_content'][:500])
```

***

## Fair-Use Limits

Since this is a free, shared resource, the following limits keep things stable for everyone:

| Limit | Value |
|-------|-------|
| Per-IP Rate Limit | 2 requests/minute on `/v1/convert/*` and `/v1/chunk/*` |
| Global Concurrency | Max 3 simultaneous heavy processing tasks |
| Cold Start | ~2–5 minutes after 48h of inactivity |

Exceeding the rate limit returns a `429 Too Many Requests` response. The async endpoints (`/v1/convert/source/async`) queue efficiently and are the recommended approach for heavy workloads.

***

## Lessons Learned

### 1. HF Spaces Health Checks Are Non-Negotiable

The Space will show as "unhealthy" and eventually restart if the root path doesn't return a valid response. The official docling-serve image doesn't handle this out of the box, so the wrapper's root redirect was essential.

### 2. Memory Management Matters on Free Tier

With 16 GB of RAM shared between the OS, Python runtime, and multiple ML models (layout analysis, table structure recognition, OCR, VLM), memory is tight. The concurrency semaphore was added after observing OOM crashes during parallel conversion requests. Limiting to 3 concurrent tasks keeps memory usage within safe bounds.

### 3. Rate Limiting Is a Must for Public APIs

Without rate limiting, a single user (or bot) could monopolize the instance. The sliding window approach is simple but effective — it's all in-memory, so there's no Redis dependency, which keeps the deployment minimal.

### 4. Pre-downloading Models Saves Cold Start Time

The Dockerfile includes `RUN docling-tools models download-hf-repo HuggingFaceTB/SmolVLM-256M-Instruct` to bake the SmolVLM model into the image. Without this, the first request would need to download the model at runtime, adding even more delay to cold starts.

***

## Potential Use Cases

- **RAG Pipeline Prototyping:** Use the chunking endpoints to split documents into semantically meaningful pieces for vector database ingestion, without running any local infrastructure.
- **Hackathon Projects:** Need document parsing in your weekend project? Point your API calls at the hosted instance instead of wrestling with local GPU setups.
- **Quick Document Conversion:** Convert a batch of research papers, contracts, or reports to Markdown for further processing.
- **Testing Docling Before Self-Hosting:** Try out Docling's capabilities before committing to a self-hosted deployment.

***

## Try It Yourself

The full source is available on GitHub, and the live Space is running on Hugging Face:

- **GitHub Repository:** [Bibyutatsu/HF-docling-serve](https://github.com/Bibyutatsu/HF-docling-serve)
- **Live Space:** [huggingface.co/spaces/Bibyutatsu/HF-docling-serve](https://huggingface.co/spaces/Bibyutatsu/HF-docling-serve)
- **Upstream Docling-Serve:** [docling-project/docling-serve](https://github.com/docling-project/docling-serve)[^4]
- **Docling Core:** [docling-project/docling](https://github.com/docling-project/docling)[^5]

If you want to deploy your own instance (perhaps with different rate limits or on a GPU-upgraded Space), simply fork the repo, update the environment variables in the Dockerfile, and push to your own HF Space. The entire deployment is three files and zero external dependencies beyond the Docker image.

A huge thanks to the team at **IBM** for building and open-sourcing Docling and the entire docling ecosystem. Making powerful document AI freely accessible moves the whole community forward.[^3]

---

## References

[^1]: [Docling: An Efficient Open-Source Toolkit for AI-driven ...](https://arxiv.org/html/2501.17887v1)

[^2]: [Docling](https://www.docling.ai) - Docling converts messy documents into structured data and simplifies downstream document and AI proc...

[^3]: [Docling: An Efficient Open-Source Toolkit for AI-driven Document ...](https://huggingface.co/papers/2501.17887) - Docling is an open-source toolkit using AI models for layout analysis and table recognition, facilit...

[^4]: [docling-project/docling-serve: Running Docling as an API service](https://github.com/docling-project/docling-serve) - Running Docling as an API service. Contribute to docling-project/docling-serve development by creati...

[^5]: [docling-project/docling: Get your documents ready for gen AI - GitHub](https://github.com/docling-project/docling) - Get your documents ready for gen AI. Contribute to docling-project/docling development by creating a...

[^6]: [Docling: A Guide to Building a Document Intelligence App](https://www.datacamp.com/tutorial/docling) - Learn how to use Docling to extract structured data from PDFs and documents. Build a Streamlit app w...

[^7]: [README.md · CerealDev/Docling-UI at main - Hugging Face](https://huggingface.co/spaces/CerealDev/Docling-UI/blob/main/README.md) - We're on a journey to advance and democratize artificial intelligence through open source and open s...

[^8]: [API Reference - docling-project/docling-serve - DeepWiki](https://deepwiki.com/docling-project/docling-serve/4-api-reference) - This document provides comprehensive technical documentation for the docling-serve REST API endpoint...

[^9]: [docling-serve](https://pypi.org/project/docling-serve/0.3.0/) - Running Docling as a service

[^10]: [Docker Spaces - Hugging Face](https://huggingface.co/docs/hub/en/spaces-sdks-docker) - We're on a journey to advance and democratize artificial intelligence through open source and open s...

[^11]: [Spaces Overview](https://huggingface.co/docs/hub/en/spaces-overview) - We're on a journey to advance and democratize artificial intelligence through open source and open s...

