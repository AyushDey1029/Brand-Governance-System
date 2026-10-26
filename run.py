"""Inkloom AI — Unified Application Server Runner.

Launches both the FastAPI Brand Governance API and the compiled React Admin Dashboard
from a single unified process on http://127.0.0.1:8000.
"""
import os
import sys
import subprocess
import webbrowser

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
    
    python_exec = VENV_PYTHON if os.path.exists(VENV_PYTHON) else sys.executable
    print("=" * 65)
    print("  🚀 INKLOOM AI — BRAND GOVERNANCE PLATFORM")
    print("=" * 65)
    print("  • React Admin Dashboard : http://127.0.0.1:8000/")
    print("  • Interactive API Docs  : http://127.0.0.1:8000/docs")
    print("  • Health Check          : http://127.0.0.1:8000/health")
    print("  • Compliance Endpoint   : http://127.0.0.1:8000/api/check-content")
    print("  • Chrome Extension Port : Connected to http://127.0.0.1:8000")
    print("=" * 65)
    print("  Press CTRL+C to terminate.")
    print("-" * 65)

    # Launch uvicorn
    cmd = [
        python_exec,
        "-m",
        "uvicorn",
        "app.main:app",
        "--host",
        "127.0.0.1",
        "--port",
        "8000",
        "--reload"
    ]
    subprocess.run(cmd, cwd=BACKEND_DIR)


if __name__ == "__main__":
    start_server()
