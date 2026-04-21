@echo off
echo ========================================
echo   VIEN Y DHUOC HOC DAN TOC - DEV SERVER
echo ========================================
echo.

cd /d "F:\HAILEO\My Project\vien-ydhdt-website\vien-ydh-frontend"

echo Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found! Please install Node.js 18+
    pause
    exit /b 1
)

echo.
echo Installing dependencies (if needed)...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo Starting development server...
echo.
echo The server will run at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
echo ========================================

call npm run dev

pause
