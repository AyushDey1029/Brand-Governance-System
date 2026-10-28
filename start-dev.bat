@echo off
title Inkloom AI - Full-Stack Dev Launcher
cd /d "%~dp0"
echo ================================================================
echo   Inkloom AI - Full-Stack Dev Launcher
echo   1. Starting Backend API on http://127.0.0.1:8000
echo   2. Starting React Vite Dev Server on http://localhost:5173
echo ================================================================
echo.

start "Inkloom Backend (FastAPI)" cmd /k "cd /d \"%~dp0\" && backend-api\.venv\Scripts\python.exe run.py"
timeout /t 3 /nobreak >nul
start "Inkloom Frontend (Vite Dev)" cmd /k "cd /d \"%~dp0admin-dashboard\" && npm run dev"

echo.
echo ================================================================
echo   Both servers launched!
echo   * React Dev Server (Hot-Reload) : http://localhost:5173
echo   * Unified Backend API           : http://127.0.0.1:8000
echo   * Interactive Swagger Docs      : http://127.0.0.1:8000/docs
echo ================================================================
echo.

