# INKLOOM AI — AGENT COLLABORATION & GIT PROTOCOL

> **ATTENTION ALL AI AGENTS & CODING ASSISTANTS:**  
> This repository is actively developed by a 3-person team (Team A4) for the Hackathon.  
> Every AI agent operating in this repository **MUST** adhere to the strict ownership boundaries, git branching rules, and tech stack guidelines defined below to prevent merge conflicts and ensure fair contribution attribution.

---

## 👥 1. Team Ownership & Strict Directory Boundaries

Each team member has a dedicated deliverable domain defined in the official project proposal (Sections 7 & 11). **Do NOT write or modify code outside your assigned team member's domain without cross-team coordination.**

```text
c:\Brand governance folder\
├── admin-dashboard/       <-- [OWNED BY: Ayush Dey] React + Tailwind CSS Web App (COMPLETE)
├── extension/             <-- [OWNED BY: Ayush Dey] Manifest V3 Chrome Extension (COMPLETE)
├── test-cms-draft.html    <-- [OWNED BY: Ayush Dey] In-Context CMS Simulation Page (COMPLETE)
├── run.py                 <-- [SHARED] Unified Server Runner (FastAPI + React SPA)
├── backend-api/
│   ├── app/models/schemas.py      <-- [SHARED] Pydantic Contract Models
│   ├── app/routes/content.py      <-- [SHARED / ANCHORED BY: Anshul Gurjar]
│   ├── app/services/text_rag.py   <-- [OWNED BY: Anshul Gurjar] RAG Pipeline & Golden Facts
│   └── app/services/vision_check.py<-- [OWNED BY: Abhyudai Sood] OpenCV Vision Bridge
└── vision-engine/         <-- [OWNED BY: Abhyudai Sood] Standalone OpenCV Engine
```

### Team Members, Deliverables & Status:
1. **Ayush Dey (`Full-Stack & Product Lead`)** — `deyayush1029@gmail.com`
   * **Domain**: Frontend Architecture, UI/UX, In-Context Experience, Review Queue
   * **Directories Owned**: `admin-dashboard/`, `extension/`, `test-cms-draft.html`, submission reports
   * **Branch**: `feat/frontend-admin-extension`
   * **Status**: **Phase 1 Complete & Verified**. Wavy in-page underlines, hover tooltips, 1-click in-place rewrites, real-time Review Queue sync, and 7/7 backend test suite passing.
2. **Anshul Gurjar (`AI & RAG Backend Engineer`)** — `anshulgurjarag15@gmail.com`
   * **Domain**: Text Evaluation Pipeline, RAG Knowledge Indexing, LLM Prompt Engineering
   * **Directories Owned**: `backend-api/app/services/text_rag.py`, Vector DB (Pinecone/Qdrant/pgvector), Golden Facts datasets
   * **Branch**: `feat/backend-rag-pipeline`
   * **Status**: **Ready to Start**.
3. **Abhyudai Sood (`Computer Vision & Systems Engineer`)** — `abhyudai.edwards@gmail.com`
   * **Domain**: Split Vision Engine, OpenCV Pixel Matrix Sampling, Multi-Modal Validation
   * **Directories Owned**: `vision-engine/`, `backend-api/app/services/vision_check.py`, CSV ingestion parsers
   * **Branch**: `feat/vision-engine`
   * **Status**: **Ready to Start**.

---

## 🌿 2. Git Branching & Conflict Prevention Rules

To guarantee **zero merge conflicts** and maintain clean individual contribution graphs on GitHub:

### RULE 1: NEVER Commit Directly to `main`
* The `main` branch is the shared, stable baseline.
* Direct commits to `main` are strictly forbidden.

### RULE 2: Always Work on Your Dedicated Feature Branch
* **Ayush's Agent**: `git checkout feat/frontend-admin-extension`
* **Anshul's Agent**: `git checkout -b feat/backend-rag-pipeline origin/main`
* **Abhyudai's Agent**: `git checkout -b feat/vision-engine origin/main`

### RULE 3: Keep Your Branch Synchronized
Before starting any new feature work, sync with the latest baseline:
```bash
git fetch origin
git rebase origin/main
```

### RULE 4: The Pull Request (PR) Workflow
* When your milestone is complete, push **only** to your dedicated branch:
  ```bash
  git push -u origin feat/<your-feature-name>
  ```
* Open a **Pull Request (PR)** against `main` on GitHub.
* Teammates review the PR before merging. Never force-push (`--force`) to `main`.

---

## 🤖 3. Specific Agent Instructions for Teammates

### A. Instructions for Anshul's Agent (`feat/backend-rag-pipeline`)
- **Allowed Files**:
  - `backend-api/app/services/text_rag.py`
  - `backend-api/app/services/` (new vector database client, e.g. `vector_store.py`)
  - `backend-api/data/` (Golden Facts datasets, markdown/json guidelines)
  - `backend-api/requirements.txt` (only if adding vector DB packages like `qdrant-client` or `pinecone-client`)
- **Forbidden Files**: Do NOT touch `admin-dashboard/`, `extension/`, or `vision-engine/`.
- **Output Contract**:
  Your `eval_text_compliance(text: str)` function **MUST** return a `List[TextCheckResult]`:
  ```python
  class TextCheckResult(BaseModel):
      claim: str              # The exact text snippet violating brand rules
      issue: str              # Clear explanation of the violation
      citation: str           # Source document (e.g. "Pricing Matrix v2.4, Item 1")
      suggested_rewrite: str  # Prescriptive, on-brand replacement
      severity: Literal["info", "warning", "high"]
  ```
- **Validation**:
  Run pytest before committing:
  ```powershell
  cd backend-api
  .venv\Scripts\python.exe -m pytest -v
  ```

---

### B. Instructions for Abhyudai's Agent (`feat/vision-engine`)
- **Allowed Files**:
  - `vision-engine/` (standalone OpenCV algorithms, batch scripts, testing assets)
  - `backend-api/app/services/vision_check.py`
  - `backend-api/app/services/` (asset parsers, e.g. `csv_parser.py`)
  - `backend-api/requirements.txt` (if adding image processing libraries)
- **Forbidden Files**: Do NOT touch `admin-dashboard/`, `extension/`, or `backend-api/app/services/text_rag.py`.
- **Output Contract**:
  Your `eval_visual_compliance(image_urls: List[str], target_hex: str, tolerance: float)` function **MUST** return a `List[VisionCheckResult]`:
  ```python
  class VisionCheckResult(BaseModel):
      image_url: str          # Image inspected
      dominant_hex: str       # Detected dominant hex color (e.g. "#4F46E5")
      target_brand_hex: str   # Brand guideline hex compared against
      match: bool             # True if within delta E tolerance
      color_distance: float   # Mathematical distance
      status: Literal["compliant", "warning", "violation", "error"]
      message: str            # Explanation of check result
  ```
- **Validation**:
  Run pytest before committing:
  ```powershell
  cd backend-api
  .venv\Scripts\python.exe -m pytest -v
  ```

---

## 🛠️ 4. Tech Stack Compliance (Do Not Deviate)

All code written must adhere strictly to the proposal document:
* **Frontend**: React 18, Tailwind CSS, Vite.
* **Browser Extension**: Manifest V3 Chrome Extension (background service worker, content scripts).
* **Backend**: Python 3.11, FastAPI, Uvicorn, Pydantic v2.
* **Computer Vision**: OpenCV (`opencv-python-headless`), NumPy.
* **AI / RAG**: Google GenAI SDK (`google-genai` for Gemini), local Golden Facts KB (later Pinecone/Qdrant/Supabase).

---

## ⚡ 5. How to Run the Unified Server Locally

The frontend and backend are merged so you don't need to run two separate servers:
```powershell
# From project root:
backend-api\.venv\Scripts\python.exe run.py
```
* **React Admin Dashboard**: `http://127.0.0.1:8000/`
* **Test CMS Draft (for Extension Testing)**: `http://127.0.0.1:8000/test-draft`
* **Swagger API Docs**: `http://127.0.0.1:8000/docs`
* **Health Endpoint**: `http://127.0.0.1:8000/health`
* **Compliance Endpoint**: `POST http://127.0.0.1:8000/api/check-content`
* **Escalate Review Endpoint**: `POST http://127.0.0.1:8000/api/reviews/escalate`
* **Chrome Extension**: Points to `http://127.0.0.1:8000`
