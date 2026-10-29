# Inkloom AI — Brand Governance Platform

> **In-context, explainable brand compliance for modern content creators and enterprise marketing teams.**  
> Built by Team A4 for the Hackathon.

[![Documentation & Tutorial](https://img.shields.io/badge/📖_Quickstart_Tutorial-TUTORIAL.md-4F46E5?style=for-the-badge)](./TUTORIAL.md)
[![Live Demo](https://img.shields.io/badge/🚀_Live_Dashboard-Vercel-06B6D4?style=for-the-badge)](https://brand-governance-system.vercel.app)
[![API Docs](https://img.shields.io/badge/⚡_API_Docs-Swagger-10B981?style=for-the-badge)](http://localhost:8000/docs)

> [!TIP]
> **New to the project or evaluating for the Hackathon?**  
> Check out the complete **[📖 Interactive Tutorial & Operations Sheet (TUTORIAL.md)](./TUTORIAL.md)** for 5-minute setup steps, Chrome extension installation, and 3 step-by-step judge demonstration workflows!

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
├── TUTORIAL.md              # 📖 Comprehensive Tutorial & Judge Evaluation Sheet
├── docker-compose.yml       # 🐳 Single-command unified Docker deployment
├── Dockerfile               # Multi-stage production container (Node 20 + Python 3.11)
├── run.py                   # Unified single-command local runner (React + FastAPI)
├── test-cms-draft.html      # Interactive test page simulating a CMS editor
├── backend-api/             # FastAPI backend server
│   ├── app/
│   │   ├── main.py          # FastAPI application entry & SPA static mounter
│   │   ├── config.py        # Brand palettes & environment configuration
│   │   ├── models/schemas.py# Pydantic request/response models
│   │   ├── services/
│   │   │   ├── text_rag.py  # RAG pipeline (Golden Facts KB + Gemini LLM)
│   │   │   └── vision_check.py # OpenCV dominant hex extraction & CIEDE2000 comparator
│   │   └── routes/
│   │       ├── content.py   # POST /api/check-content (Dual evaluation pipeline)
│   │       ├── health.py    # GET /health
│   │       └── auth.py      # Supabase client auth configuration
│   ├── tests/
│   │   └── test_content.py  # Automated pytest suite
│   ├── requirements.txt     # Python dependencies
│   └── pytest.ini
├── admin-dashboard/         # React + Vite Admin Dashboard Web App
│   ├── src/
│   │   ├── components/      # Creator Studio, Review Queue, Brand Setup
│   │   ├── App.jsx          # React SPA shell
│   │   └── index.css        # Premium dark-mode design system
│   ├── dist/                # Pre-compiled production bundle (served by FastAPI)
│   ├── package.json
│   └── vite.config.js
└── extension/               # Chrome Extension Manifest V3
    ├── manifest.json        # MV3 manifest with activeTab & background worker
    ├── background/
    │   └── service_worker.js# Proxies audit requests to FastAPI backend
    ├── content/
    │   ├── content.js       # Extracts text/images & executes in-page 1-click rewrites
    │   └── content.css      # In-context highlight styles
    └── popup/
        ├── popup.html       # Sleek dark-mode audit dashboard
        └── popup.js         # Scan controller & 1-click fix trigger
```

---

## 🚀 Quickstart Guide (Unified Single-Command)

### Option A: Local Python Unified Server

You don't need to start the frontend and backend separately. A single command launches the entire unified system on port 8000:

```bash
# From workspace root:
backend-api\.venv\Scripts\python.exe run.py
```
* **React Admin Dashboard**: [http://localhost:8000/](http://localhost:8000/) *(or [http://127.0.0.1:8000/](http://127.0.0.1:8000/))*
* **Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
* **Interactive CMS Simulation**: [http://localhost:8000/test-draft](http://localhost:8000/test-draft)

### Option B: Unified Docker Compose

```bash
docker compose up -d --build
```

---

## 🧩 Load the Chrome Extension

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle on **Developer mode** (top-right corner).
3. Click **Load unpacked** and select the `extension/` directory from this repository.
4. Pin the **Inkloom AI** icon to your browser toolbar.

---

## 🧪 Test the End-to-End Workflow

1. Open [http://localhost:8000/test-draft](http://localhost:8000/test-draft) (or `test-cms-draft.html`) in Chrome.
2. Click the **Inkloom AI** extension icon.
3. Click **"Audit Active Tab"**.
4. **Observe the Results**:
   * **Copy & Claims**: Flags the outdated `$29/mo` tier against *Golden Facts: Pricing Matrix v2.4* and recommends `$49/month`.
   * **Banned Superlatives**: Flags disallowed terms like `100% bug free` and `guaranteed 100% uptime`.
   * **Visual Palette**: OpenCV samples the banner image, extracts the dominant hex code, and compares it to brand `#4F46E5`.
   * **1-Click Apply**: Click **1-Click Apply** next to any rewrite and watch the live draft in the editor update instantly!

---

## 🧪 Running Automated Tests

```bash
cd backend-api
.venv\Scripts\python.exe -m pytest -v
```

Automated test cases verify:
* `/health` and root endpoints
* Factual violation detection and citation attribution
* Compliant copy scoring
* OpenCV mathematical Euclidean and CIE Lab color distance algorithms

---

## 📖 Complete Documentation

For comprehensive architecture diagrams, cloud deployment details, and deep dive demo scenarios, read **[TUTORIAL.md](./TUTORIAL.md)**.
