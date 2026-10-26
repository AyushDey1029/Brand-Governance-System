@echo off
title Push Inkloom AI to GitHub
set PATH=C:\Users\katana\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\ucrt64\bin;C:\Users\katana\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd;%PATH%

echo ================================================================
echo   Inkloom AI - Brand Governance Platform
echo   Pushing to https://github.com/AyushDey1029/Brand-Governance-System.git
echo ================================================================
echo.
echo [1/2] Pushing 'main' baseline branch...
git push -u origin main
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Push failed. If prompted, please complete GitHub sign-in in your browser.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Pushing 'feat/frontend-admin-extension' feature branch...
git push -u origin feat/frontend-admin-extension
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Push failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ================================================================
echo   SUCCESS! All branches successfully pushed to GitHub.
echo   Go to GitHub to open your Pull Request into 'main'!
echo ================================================================
pause
