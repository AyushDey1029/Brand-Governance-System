@echo off
title Inkloom AI - Unified Server Runner
cd /d "%~dp0"
echo ================================================================
echo   Inkloom AI - Unified Server (FastAPI + React SPA)
echo   Starting on http://127.0.0.1:8000 ...
echo ================================================================
echo.
backend-api\.venv\Scripts\python.exe run.py
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Server encountered an error.
    pause
)

