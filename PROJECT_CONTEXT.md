# INKLOOM AI — PROJECT CONTEXT & ARCHITECTURE BIBLE

> **Project Name**: Inkloom AI Brand Governance Platform  
> **Team Name**: Team A4 (Lovely Professional University)  
> **Git Repository**: [https://github.com/AyushDey1029/Brand-Governance-System.git](https://github.com/AyushDey1029/Brand-Governance-System.git)  
> **Current Status**: Phase 1 (Frontend & Base Microservice Integration) **COMPLETE & VERIFIED**. Phase 2 (AI/RAG & OpenCV Engine) Active.

---

## 🎯 1. Executive Product Vision & Problem Statement

Anyone who has managed content across decentralized enterprise teams knows the constant friction between **publishing velocity** and **brand governance**. Marketing and content teams are pushed to publish continuously across **WordPress, Webflow, LinkedIn, and Canva**, while brand compliance managers are tasked with protecting company reputation and accuracy.

Traditional compliance creates painful bottlenecks:
* **The Manual Hex-Code Grind**: Designers spend hours manually sampling hex codes, verifying logo spacing, and checking color contrast.
* **Factual Drift & Obsolete Claims**: Copywriters unknowingly cite outdated pricing (e.g. legacy $29/mo when current tier is $49/mo) or obsolete product specs buried in forgotten spreadsheets.
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
             │ [OWNED BY: ANSHUL]  │                           │[OWNED BY: ABHYUDAI] │
             └──────────┬──────────┘                           └──────────┬──────────┘
                        │                                                 │
            ┌───────────┴───────────┐                         ┌───────────┴───────────┐
            ▼                       ▼                         ▼                       ▼
   [Query Golden Facts]     [Gemini LLM Audit]       [OpenCV Exact Math]     [Gemini Pro Vision]
   Vector Store / RAG      Citations & Rewrites      RGB/Hex Pixel Sampling  Qualitative Style & Vibe
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
* **Primary Role**: Owns user experience, frontend architecture, extension engineering, and submission documentation.
* **Deliverables Completed**:
  * Manifest V3 Chrome Extension (`extension/`) with in-page TreeWalker highlights, hover tooltips, and 1-click in-place rewrites.
  * React Admin Dashboard (`admin-dashboard/` with Tailwind CSS & Lucide Icons).
  * Real-time Review Queue escalation flow (`/api/reviews/escalate` & `/api/reviews`).
  * In-context CMS simulation testbed (`test-cms-draft.html` served at `http://127.0.0.1:8000/test-draft`).
  * Unified Application Runner (`run.py`).
* **Dedicated Git Branch**: `feat/frontend-admin-extension`
* **Status**: **Phase 1 Complete, Fully Tested & Pushed to GitHub**.

### 2. Anshul Gurjar — AI & RAG Backend Engineer (`anshulgurjarag15@gmail.com`)
* **Primary Role**: Architect for text evaluation pipeline, RAG knowledge retrieval, and Gemini LLM prompt engineering.
* **Key Deliverables**:
  * Real RAG pipeline in `backend-api/app/services/text_rag.py`.
  * Vector Database index (Pinecone, Qdrant, or Supabase `pgvector`).
  * Expansion of Golden Facts knowledge base dataset and JSON response parsers.
  * Gemini LLM system prompts, few-shot formatting, and graceful offline fallback.
* **Dedicated Git Branch**: `feat/backend-rag-pipeline`
* **Status**: **Ready to Start**.

### 3. Abhyudai Sood — Computer Vision & Systems Engineer (`abhyudai.edwards@gmail.com`)
* **Primary Role**: Owns Split Vision Engine, OpenCV algorithms, and asset ingestion pipelines.
* **Key Deliverables**:
  * OpenCV color extraction & CIEDE2000 ($\Delta E$) color distance in `backend-api/app/services/vision_check.py`.
  * Standalone vision engine experiments in `vision-engine/`.
  * Multi-scale logo template matching & boundary verification.
  * CSV/Excel Golden Assets ingestion parser.
* **Dedicated Git Branch**: `feat/vision-engine`
* **Status**: **Ready to Start**.

---

## 🚀 4. Phase 1 Accomplishments (Live Baseline)

### A. React Admin Dashboard (`admin-dashboard/`)
* Built with **React 18 + Tailwind CSS + Vite**.
* Six functional governance modules:
  1. **Executive Overview**: Brand health scores, violation trends, and live API status indicator.
  2. **Golden Facts KB**: Central repository for pricing and specs with mock CSV import.
  3. **Brand Tone & Policies**: Disallowed superlatives manager with severity levels.
  4. **Visual Golden Assets**: Interactive brand palette swatches and OpenCV $\Delta E$ tolerance slider.
  5. **Live Audit Sandbox**: In-browser dual-engine audit tester.
  6. **Review Queue**: Human-in-the-loop review with real-time polling of escalated tickets from the extension.
* Compiled production bundle in `admin-dashboard/dist/`.

### B. Chrome Extension Manifest V3 (`extension/`)
* **Manifest V3** compliant with `activeTab`, `scripting`, and host permissions.
* **Background Service Worker** (`background/service_worker.js`): Proxies audit calls to FastAPI backend with health monitoring.
* **Content Script** (`content/content.js` & `content/content.css`):
  * **Safe TreeWalker Highlighting**: Wavy red (`.inkloom-critical`) and amber (`.inkloom-warning`) underlines under flagged claims without destroying DOM events.
  * **In-Page Hover Tooltip**: Displays severity badge, Golden Fact citation, violation explanation, and prescriptive rewrite.
  * **1-Click Apply**: Swaps out offending text in-place, fires an `input` event, and pulses green (`.inkloom-repaired-pulse`).
  * **Floating Assistant Pill**: Bottom-right `#inkloom-floating-pill` allows 1-click audit directly from the page.
  * **Escalate Button**: Forwards flagged text to the Admin Review Queue (`POST /api/reviews/escalate`).
* **Popup UI** (`popup/popup.html`, `popup.css`, `popup.js`): Dual-tab breakdown of text issues and visual OpenCV swatches.

### C. FastAPI Backend Microservice (`backend-api/`)
* Async REST API with CORS configured for Chrome Extensions and local dashboards.
* **`GET /health`**: Health status and capability flags.
* **`POST /api/check-content`**: Runs concurrent text RAG checks and OpenCV image evaluations.
* **`POST /api/reviews/escalate` & `GET /api/reviews`**: Real-time review queue synchronization.
* **`GET /test-draft`**: Serves `test-cms-draft.html` for instant Chrome extension testing.
* **Automated Pytest Suite** (`tests/test_content.py`): 7 automated tests passing in $< 1\text{s}$.

### D. Unified Server Runner (`run.py`)
* FastAPI serves both the API endpoints and the compiled React Admin Dashboard SPA from port 8000.
* Starting the entire platform requires only:
  ```powershell
  python run.py
  ```
  * Dashboard: `http://127.0.0.1:8000/`
  * Test Draft CMS: `http://127.0.0.1:8000/test-draft`
  * API Docs: `http://127.0.0.1:8000/docs`

---

## 📌 5. Implementation Guide & Contracts for Anshul & Abhyudai

### For Anshul Gurjar (AI & RAG Backend Engineer):
1. **Branch Setup**:
   ```bash
   git fetch origin
   git checkout -b feat/backend-rag-pipeline origin/main
   ```
2. **Primary Target File**: [`backend-api/app/services/text_rag.py`](file:///c:/Brand%20governance%20folder/backend-api/app/services/text_rag.py).
3. **Interface Contract**:
   Your function signature must remain:
   ```python
   async def eval_text_compliance(text: str) -> List[TextCheckResult]:
       ...
   ```
   Each `TextCheckResult` object in the returned list must supply:
   - `claim` (str): The exact phrase or sentence flagged in the user's text.
   - `issue` (str): Why it is wrong (e.g. "Pricing outdated as of Q1 2026").
   - `citation` (str): Exact source (e.g. "Pricing Matrix v2.4, Item 1").
   - `suggested_rewrite` (str): Compliant replacement (e.g. "$49/month").
   - `severity` ("info" | "warning" | "high"): Determines underline color in the Chrome Extension.
4. **Key Tasks**:
   - Integrate Google Gemini GenAI SDK (`from google import genai`).
   - Replace or augment the hardcoded `GOLDEN_FACTS_KB` string with vector similarity retrieval (e.g. Qdrant / Pinecone / Supabase `pgvector`).
   - Retain the `_mock_rule_engine()` as a fallback when `GEMINI_API_KEY` is not present, ensuring offline resilience.

---

### For Abhyudai Sood (Computer Vision Engineer):
1. **Branch Setup**:
   ```bash
   git fetch origin
   git checkout -b feat/vision-engine origin/main
   ```
2. **Primary Target Files**: [`backend-api/app/services/vision_check.py`](file:///c:/Brand%20governance%20folder/backend-api/app/services/vision_check.py) and [`vision-engine/`](file:///c:/Brand%20governance%20folder/vision-engine).
3. **Interface Contract**:
   Your function signature must remain:
   ```python
   async def eval_visual_compliance(
       image_urls: List[str], 
       target_brand_hex: str = "#4F46E5", 
       tolerance: float = 65.0
   ) -> List[VisionCheckResult]:
       ...
   ```
   Each `VisionCheckResult` object must supply:
   - `image_url` (str): Source image URL.
   - `dominant_hex` (str): Dominant non-background color (e.g. "#4F46E5").
   - `target_brand_hex` (str): Approved brand palette hex.
   - `match` (bool): `True` if `color_distance <= tolerance`.
   - `color_distance` (float): Mathematical distance ($\Delta E$).
   - `status` ("compliant" | "warning" | "violation" | "error").
   - `message` (str): Human-readable verdict.
4. **Key Tasks**:
   - Upgrade color distance from simple RGB Euclidean distance to CIEDE2000 ($\Delta E_{00}$) in LAB color space for perceptual accuracy.
   - Implement logo template matching and clear-space checks.
   - Build a CSV parser in `vision-engine/` for batch importing brand asset guidelines.

---

## 🧪 6. Testing & Validation Commands

All engineers should run the test suite before submitting any Pull Request:
```powershell
cd backend-api
.venv\Scripts\python.exe -m pytest -v
```
To verify the complete frontend + backend integration:
```powershell
python run.py
```
And test the Chrome extension against [`http://127.0.0.1:8000/test-draft`](http://127.0.0.1:8000/test-draft).
