# INKLOOM AI — PROJECT CONTEXT & ARCHITECTURE BIBLE

> **Project Name**: Inkloom AI Brand Governance Platform  
> **Team Name**: Team A4 (Lovely Professional University)  
> **Git Repository**: [https://github.com/AyushDey1029/Brand-Governance-System.git](https://github.com/AyushDey1029/Brand-Governance-System.git)  
> **Status**: Phase 1 (Hackathon MVP) Active — Frontend & Base Integration Complete

---

## 🎯 1. Executive Product Vision & Problem Statement

Anyone who has managed content across decentralized teams knows the constant friction between **publishing speed** and **brand compliance**. Marketing and content teams are pushed to publish continuously across **WordPress, Webflow, LinkedIn, and Canva**, while brand compliance managers are tasked with protecting company reputation and accuracy.

Traditional compliance creates painful bottlenecks:
* **The Manual Hex-Code Grind**: Designers spend hours manually sampling hex codes, verifying logo spacing, and checking color contrast.
* **Factual Drift & Obsolete Claims**: Copywriters unknowingly cite outdated pricing (e.g. citing legacy $29/mo when the current tier is $49/mo) or obsolete specs buried in forgotten spreadsheets.
* **The "Gatekeeper" Review Queue**: Manual sign-off queues delay publishing velocity by days, causing creators to bypass review entirely.

### The Inkloom AI Solution:
Instead of acting as an opaque, blocking gatekeeper, **Inkloom AI** embeds directly alongside the creator. By pairing a centralized **Admin Dashboard** (where managers upload Golden Facts & brand swatches) with an **In-Context Chrome Extension** (inside the CMS), the platform audits text and images in real time with **inline source citations** and **1-click prescriptive rewrites**.

---

## ⚡ 2. The Architectural Core: The Split Vision Engine

Large Language Models (LLMs) are probabilistic and cannot guarantee 100% exact hex color code verification. Inkloom uniquely solves this by separating deterministic mathematical checks from subjective style checks:

```text
                                  ┌──────────────────────────────┐
                                  │      Draft Content Check     │
                                  └──────────────┬───────────────┘
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        ▼                                                 ▼
             ┌─────────────────────┐                           ┌─────────────────────┐
             │    Text Pipeline    │                           │   Visual Pipeline   │
             │   (RAG + Gemini)    │                           │(Split Vision Engine)│
             └──────────┬──────────┘                           └──────────┬──────────┘
                        │                                                 │
            ┌───────────┴───────────┐                         ┌───────────┴───────────┐
            ▼                       ▼                         ▼                       ▼
   [Query Golden Facts]     [Gemini LLM Audit]       [OpenCV Exact Math]     [Gemini Pro Vision]
   Pinecone/Qdrant Index   Citations & Rewrites      RGB/Hex Pixel Sampling  Qualitative Style & Vibe
```

1. **Deterministic Vision (OpenCV + NumPy)**:
   * Downsamples images and filters out white/black backgrounds.
   * Performs K-means clustering ($k=3$) to extract the dominant hex code.
   * Calculates Euclidean color distance ($\Delta E$) against approved brand swatches.
   * **Execution**: $< 5\text{ms}$, zero hallucination risk, **zero API cost**.
2. **Qualitative Vision (Gemini Pro Vision)**:
   * Evaluates subjective aesthetic vibe, mood, and visual tone against reference brand assets.
3. **Factual & Tone Verification (RAG + Gemini LLM)**:
   * Compares draft text claims against indexed **"Golden Facts"** (pricing matrices, brand guidelines, approved slogans).
   * Identifies outdated claims and banned superlatives (`magic AI`, `flawless`, `cheapest`).
   * Returns precise source citations and prescriptive 1-click rewrites.

---

## 👥 3. Team Member Roles & Deliverable Ownership

As defined in Section 7 & Section 11 of the official project proposal:

### 1. Ayush Dey — Full-Stack & Product Lead (`deyayush1029@gmail.com`)
* **Primary Role**: Owns user experience, frontend architecture, and submission documentation.
* **Key Deliverables**:
  * Manifest V3 Chrome Extension (`extension/`)
  * React Admin Dashboard (`admin-dashboard/` with Tailwind CSS)
  * User Workflow Design & Interactive CMS Simulation (`test-cms-draft.html`)
  * Unified Application Runner (`run.py`)
* **Dedicated Git Branch**: `feat/frontend-admin-extension`

### 2. Anshul Gurjar — AI & RAG Backend Engineer (`anshulgurjarag15@gmail.com`)
* **Primary Role**: Architect for text evaluation pipeline and knowledge retrieval.
* **Key Deliverables**:
  * FastAPI RAG endpoints (`backend-api/app/services/text_rag.py`, `app/routes/content.py`)
  * Vector Database index (Pinecone / Qdrant)
  * Golden Facts knowledge base dataset and JSON response parsers
  * Gemini LLM system prompts and few-shot formatting
* **Dedicated Git Branch**: `feat/backend-rag-pipeline`

### 3. Abhyudai Sood — Computer Vision & Systems Engineer (`abhyudai.edwards@gmail.com`)
* **Primary Role**: Owns Split Vision Engine, OpenCV algorithms, and ingestion pipelines.
* **Key Deliverables**:
  * OpenCV color extraction module (`vision-engine/color_extractor.py`, `backend-api/app/services/vision_check.py`)
  * Multi-scale logo template matching & boundary verification
  * CSV/Excel Golden Facts ingestion parser
  * Multi-modal AI integration & compliance test suite
* **Dedicated Git Branch**: `feat/vision-engine`

---

## 🚀 4. What Has Been Completed So Far (Phase 1 Baseline)

### A. React Admin Dashboard (`admin-dashboard/`)
* Built with **React 18 + Tailwind CSS + Vite**.
* Six functional governance modules:
  1. **Executive Overview**: Brand health scores, violation patterns, and recent audit activity.
  2. **Golden Facts KB**: Ingestion repository for pricing and specs with CSV simulation.
  3. **Brand Tone & Policies**: Disallowed superlatives manager with severity levels.
  4. **Visual Golden Assets**: Interactive brand palette swatches and OpenCV $\Delta E$ tolerance slider.
  5. **Live Audit Sandbox**: In-browser dual-engine audit tester.
  6. **Escalated Review Queue**: Human-in-the-loop review with 1-click sign-off.
* Compiled production bundle in `admin-dashboard/dist/`.

### B. Chrome Extension Manifest V3 (`extension/`)
* **Manifest V3** compliant with `activeTab`, `scripting`, and host permissions.
* **Background Service Worker** (`background/service_worker.js`): Proxies audit calls to FastAPI backend with health monitoring.
* **Content Script** (`content/content.js`):
  * Scans active CMS rich editors (WordPress Gutenberg, Webflow, Medium, etc.).
  * Extracts text and prominent `img[src]` assets.
  * Injects in-page inline highlight badges and performs **1-click in-place rewrites**.
* **Popup UI** (`popup/popup.html`, `popup.css`, `popup.js`): Sleek dark-mode interface with score radial and copy/vision issue cards.

### C. FastAPI Backend Microservice (`backend-api/`)
* Async REST API with CORS configured for Chrome Extensions and local dashboards.
* **`GET /health`**: Health status and capability flags.
* **`POST /api/check-content`**: Runs concurrent text RAG checks and OpenCV image evaluations.
* **Stubbed RAG Engine** (`services/text_rag.py`): Checks claims against Golden Facts KB, integrates with Google Gemini SDK (`google-genai`), and includes an offline rule engine.
* **OpenCV Vision Engine** (`services/vision_check.py` & `vision-engine/`): Extracts dominant colors and computes Euclidean distances.
* **Automated Pytest Suite** (`tests/test_content.py`): 6 automated tests passing in $< 1\text{s}$.

### D. Unified Single-Command Hosting (`run.py`)
* FastAPI serves both the API endpoints and the compiled React Admin Dashboard SPA from port 8000.
* Starting the entire platform requires only:
  ```powershell
  python run.py
  ```
  * Dashboard: `http://127.0.0.1:8000/`
  * API Docs: `http://127.0.0.1:8000/docs`

---

## 📌 5. Direct Instructions for Anshul & Abhyudai (Next Milestones)

### For Anshul Gurjar (AI & RAG Backend Engineer):
1. Branch from `origin/main`:
   ```bash
   git checkout -b feat/backend-rag-pipeline origin/main
   ```
2. Your primary workspace is [`backend-api/app/services/text_rag.py`](file:///c:/Brand%20governance%20folder/backend-api/app/services/text_rag.py) and vector store integration:
   * Replace the local Golden Facts dictionary with real vector embeddings (Pinecone or Qdrant).
   * Expand the Golden Facts dataset with comprehensive enterprise pricing matrices.
   * Fine-tune the Gemini prompt engineering for tone classification and prescriptive rewrites.
3. Commit and push to `feat/backend-rag-pipeline` and open a PR into `main`.

### For Abhyudai Sood (Computer Vision Engineer):
1. Branch from `origin/main`:
   ```bash
   git checkout -b feat/vision-engine origin/main
   ```
2. Your primary workspace is [`vision-engine/`](file:///c:/Brand%20governance%20folder/vision-engine) and [`backend-api/app/services/vision_check.py`](file:///c:/Brand%20governance%20folder/backend-api/app/services/vision_check.py):
   * Build the CSV/Excel spreadsheet ingestion parser for uploading Golden Assets.
   * Expand OpenCV capabilities: Add multi-scale template matching for logo boundary verification and clear-space checks.
   * Integrate Gemini Pro Vision for qualitative visual vibe scoring against reference assets.
3. Commit and push to `feat/vision-engine` and open a PR into `main`.
