@echo off
echo ========================================================
echo   PROJECTHUB LIVE DEMO LAUNCHER
echo ========================================================
echo.
echo [1/2] Starting the Backend Server (Production Mode)...
start "ProjectHub Server" cmd /k "cd server && npm run dev"

echo [2/2] Starting the Public Internet Tunnel...
echo ⚠️  Wait for the URL to appear below.
echo.
start "ProjectHub Tunnel" cmd /k "npx localtunnel --port 5001 --subdomain projecthub-demo-lpu"

timeout /t 5 >nul

echo.
echo ========================================================
echo ✅ SUCCESS! Your app is now LIVE on the internet.
echo.
echo 🔗 SHARE THIS LINK WITH YOUR TEACHER:
echo    https://projecthub-demo-lpu.loca.lt
echo.
echo ⚠️  IF IT ASKS FOR AN "ENDPOINT IP", TYPE YOUR PUBLIC IP.
echo    You can find it at: https://api.ipify.org
echo.
echo 💡 HINT: If this is the first time, make sure to run:
echo    cd server && node seed.js
echo ========================================================
echo.
echo Keep the two black windows open while presenting.
echo You can close this window now.
pause
