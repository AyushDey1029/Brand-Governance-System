# Inkloom AI — Brand Governance Platform

> **In-context, explainable brand compliance for modern content creators and enterprise marketing teams.**  
> Built by Team A4 for the Hackathon.

---

## 🌟 Executive Overview & Problem Statement

Modern content velocity pushes decentralized teams to publish continuously in CMS platforms like **WordPress, Webflow, LinkedIn, and Canva**. However, traditional brand compliance remains a slow, manual bottleneck:
1. **The Manual Hex-Code Grind**: Designers spend hours manually sampling pixels and checking hex codes.
2. **Factual Drift & Obsolete Claims**: Copywriters unknowingly cite outdated pricing or specs buried in legacy spreadsheets.
3. **The "Gatekeeper" Review Queue**: Content velocity halts while drafts wait days for compliance approval.

**Inkloom AI** solves this at the source by pairing a **centralized source of truth** with a **lightweight in-context Chrome Extension** that audits copy and visual assets in real time inside the creator's active authoring environment.

---

## ⚡ The Split Vision Architecture

LLMs are probabilistic and cannot guarantee 100% exact hex color code verification. Inkloom introduces the **Split Vision Engine**:
* **Deterministic Math (OpenCV)**: Zero-hallucination, sub-millisecond, exact RGB/hex matrix sampling and logo boundary checks at zero API cost.
* **Qualitative Style (Gemini Vision)**: Evaluates subjective vibe, aesthetic composition, and visual tone against reference brand assets.
* **Factual & Tone Verification (RAG + Gemini LLM)**: Compares draft claims against indexed "Golden Facts" (pricing matrices, brand guidelines) to return inline citations and prescriptive 1-click rewrites.

---

## 📁 Repository Structure

```text
c:\Brand governance folder\
├── backend-api/             # FastAPI backend server
│   ├── app/
│   │   ├── main.py          # FastAPI application entry & CORS middleware
│   │   ├── config.py        # Brand palettes & environment configuration
│   │   ├── models/schemas.py# Pydantic request/response models
│   │   ├── services/
│   │   │   ├── text_rag.py  # Stubbed RAG pipeline (Golden Facts KB + Gemini LLM)
│   │   │   └── vision_check.py # OpenCV dominant hex extraction & palette comparator
│   │   └── routes/
│   │       ├── content.py   # POST /api/check-content (Dual evaluation pipeline)
│   │       └── health.py    # GET /health
│   ├── tests/
│   │   └── test_content.py  # Automated pytest suite
│   ├── requirements.txt     # Python dependencies
│   └── pytest.ini
├── admin-dashboard/         # React + Vite Admin Dashboard Web App
│   ├── src/
│   │   ├── components/      # Governance, Golden Facts, Policies, Palette, Sandbox
│   │   ├── App.jsx          # React SPA shell
│   │   └── index.css        # Premium dark-mode design system
│   ├── dist/                # Pre-compiled production bundle (served by FastAPI)
│   ├── package.json
│   └── vite.config.js
├── extension/               # Chrome Extension Manifest V3
│   ├── manifest.json        # MV3 manifest with activeTab & background worker
│   ├── background/
│   │   └── service_worker.js# Proxies audit requests to FastAPI backend
│   ├── content/
│   │   ├── content.js       # Extracts text/images & executes in-page 1-click rewrites
│   │   └── content.css      # In-context highlight styles
│   ├── popup/
│   │   ├── popup.html       # Sleek dark-mode audit dashboard
│   │   ├── popup.css        # Glassmorphic, modern styling
│   │   └── popup.js         # Scan controller & 1-click fix trigger
│   └── icons/               # Extension icons (16px, 48px, 128px)
├── vision-engine/           # Standalone Computer Vision utilities
│   └── color_extractor.py   # OpenCV dominant color extractor script
├── run.py                   # Unified single-command runner (React + FastAPI)
├── test-cms-draft.html      # Interactive test page simulating a CMS editor
└── README.md
```

---

## 🚀 Quickstart Guide (Unified Single-Command)

### 1. Launch the Merged Platform (Frontend + Backend)

You don't need to start the frontend and backend separately. A single command launches the entire unified system:

```bash
# From workspace root:
backend-api\.venv\Scripts\python.exe run.py
```
* **React Admin Dashboard**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
* **Interactive API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
* **Compliance Endpoint**: `POST http://127.0.0.1:8000/api/check-content`

.venv\Scripts\activate

# Run the server with hot-reload
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
* **API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 2. Load the Chrome Extension

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle on **Developer mode** (top-right corner).
3. Click **Load unpacked** and select the `extension/` directory from this repository.
4. Pin the **Inkloom AI** icon to your browser toolbar.

### 3. Test the End-to-End Workflow

1. Open `test-cms-draft.html` in Chrome.
2. Click the **Inkloom AI** extension icon.
3. Click **"Audit Active Tab"** (or click **"Load Sample"** inside the popup).
4. **Observe the Results**:
   * **Copy & Claims**: Flags the outdated `$29/mo` tier against *Golden Facts: Pricing Matrix v2.4* and recommends `$49/month`.
   * **Banned Superlatives**: Flags disallowed terms like `magic AI` and `100% bug free`.
   * **Visual Palette**: OpenCV samples the banner image, extracts the dominant hex code, and compares it to brand `#4F46E5`.
   * **1-Click Apply**: Click the **1-Click Apply** button next to any rewrite and watch the live draft in the editor update instantly!

---

## 🧪 Running Automated Tests

```bash
cd backend-api
.venv\Scripts\python.exe -m pytest -v
```

All 5 core unit tests verify:
* `/health` and root endpoints
* Factual violation detection and citation attribution
* Compliant copy scoring
* OpenCV mathematical Euclidean color distance algorithms

---

## 🛡️ Enterprise Roadmap & Future Scope (Post-MVP)

* **Phase 1.5**: React Admin Web Dashboard for uploading CSV/Excel Golden Facts and managing visual swatches.
* **Phase 2 (Post-Event)**:
  * Google Cloud Vertex AI private tenant isolation (zero model-training on customer data).
  * Multi-scale OpenCV logo template matching and spatial bounding box detection.
  * Asynchronous video evaluation pipeline (FFmpeg visual keyframes + Speech-to-Text audio transcripts).
