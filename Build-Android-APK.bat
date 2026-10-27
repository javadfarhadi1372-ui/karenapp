@echo off
chcp 65001 >nul
where node >nul 2>nul || (echo Node.js is not installed. Get it from https://nodejs.org & pause & exit /b)
copy /Y index.html www\index.html >nul
copy /Y icon-192.png www\icon-192.png >nul
copy /Y icon-512.png www\icon-512.png >nul
copy /Y manifest.json www\manifest.json >nul
call npm i @capacitor/core @capacitor/cli @capacitor/android @capacitor/assets
if not exist android call npx cap add android
node tools\patch-android.js
if not exist assets mkdir assets
copy /Y icon-512.png assets\icon-only.png >nul
call npx capacitor-assets generate --android --iconBackgroundColor #0f766e
call npx cap sync
call npx cap open android
echo In Android Studio: Build ^> Build Bundle(s) / APK(s) ^> Build APK(s)
pause
