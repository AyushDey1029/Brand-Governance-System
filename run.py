"""Inkloom AI — Unified Application Server Runner.

Launches both the FastAPI Brand Governance API and the compiled React Admin Dashboard
from a single unified process on http://127.0.0.1:8000.
"""
import os
import sys
import subprocess

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
        try:
            print("[Inkloom] Building React Admin Dashboard production bundle...", flush=True)
            subprocess.run(["npm", "run", "build"], cwd=DASHBOARD_DIR, shell=True, check=True)
            print("[Inkloom] React Dashboard build complete.", flush=True)
        except Exception as err:
            print(f"[Inkloom] Notice: Dashboard build step ({err}). Serving existing or fallback API.", flush=True)


def start_server():
    """Starts the unified FastAPI + React server."""
    ensure_dashboard_built()
    
    bind_host = os.environ.get("HOST", "0.0.0.0" if os.environ.get("PORT") else "127.0.0.1")
    port = int(os.environ.get("PORT", 8000))
    display_host = "localhost" if bind_host in ("0.0.0.0", "::") else bind_host

    print("=" * 65, flush=True)
    print("  [Inkloom AI] BRAND GOVERNANCE PLATFORM", flush=True)
    print("=" * 65, flush=True)
    print(f"  * React Admin Dashboard : http://{display_host}:{port}/ (or http://127.0.0.1:{port}/)", flush=True)
    print(f"  * Interactive API Docs  : http://{display_host}:{port}/docs", flush=True)
    print(f"  * Health Check          : http://{display_host}:{port}/health", flush=True)
    print(f"  * Compliance Endpoint   : http://{display_host}:{port}/api/check-content", flush=True)
    print(f"  * Chrome Extension Port : Connected to http://{display_host}:{port}", flush=True)
    print("=" * 65, flush=True)
    print("  Press CTRL+C to terminate.", flush=True)
    print("-" * 65, flush=True)

    if BACKEND_DIR not in sys.path:
        sys.path.insert(0, BACKEND_DIR)

    import uvicorn
    uvicorn.run("app.main:app", host=bind_host, port=port, log_level="info")


if __name__ == "__main__":
    start_server()
