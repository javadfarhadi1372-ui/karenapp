@echo off
chcp 65001 >nul
if exist node_modules\electron (call npx electron .) else (start "" msedge --app="file:///%~dp0index.html" || start "" "%~dp0index.html")
