@echo off
chcp 65001 >nul
where node >nul 2>nul || (echo Node.js is not installed. Get it from https://nodejs.org & pause & exit /b)
call npm install
call npm run dist
echo.
echo Done. Installer: dist\Karen-Setup-2.0.0.exe
pause
