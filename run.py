"""Inkloom AI — Unified Application Server Runner.

Launches both the FastAPI Brand Governance API and the compiled React Admin Dashboard
from a single unified process on http://127.0.0.1:8000.
"""
import os
import sys
import subprocess
import webbrowser

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend-api")
DASHBOARD_DIR = os.path.join(ROOT_DIR, "admin-dashboard")
DIST_DIR = os.path.join(DASHBOARD_DIR, "dist")
VENV_PYTHON = os.path.join(BACKEND_DIR, ".venv", "Scripts", "python.exe")


def ensure_dashboard_built():
    """Builds React Admin Dashboard if dist folder is missing."""
    if not os.path.exists(DIST_DIR) or not os.path.exists(os.path.join(DIST_DIR, "index.html")):
        print("[Inkloom] Building React Admin Dashboard production bundle...")
        subprocess.run(["npm", "run", "build"], cwd=DASHBOARD_DIR, shell=True, check=True)
        print("[Inkloom] React Dashboard build complete.")


def start_server():
    """Starts the unified FastAPI + React server."""
    ensure_dashboard_built()
    
    print("=" * 65, flush=True)
    print("  [Inkloom AI] BRAND GOVERNANCE PLATFORM", flush=True)
    print("=" * 65, flush=True)
    print("  * React Admin Dashboard : http://127.0.0.1:8000/", flush=True)
    print("  * Interactive API Docs  : http://127.0.0.1:8000/docs", flush=True)
    print("  * Health Check          : http://127.0.0.1:8000/health", flush=True)
    print("  * Compliance Endpoint   : http://127.0.0.1:8000/api/check-content", flush=True)
    print("  * Chrome Extension Port : Connected to http://127.0.0.1:8000", flush=True)
    print("=" * 65, flush=True)
    print("  Press CTRL+C to terminate.", flush=True)
    print("-" * 65, flush=True)

    if BACKEND_DIR not in sys.path:
        sys.path.insert(0, BACKEND_DIR)

    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, log_level="info")


if __name__ == "__main__":
    start_server()
