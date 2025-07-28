@echo off
title InfoScape - OSINT Intelligence Toolkit

echo 🌐 InfoScape - OSINT Intelligence Toolkit
echo ===========================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is required but not found
    echo    Please install Python 3.8+ and try again
    echo    Download from: https://python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python found
python --version

REM Navigate to backend directory
cd /d "%~dp0backend"
if errorlevel 1 (
    echo ❌ Backend directory not found
    pause
    exit /b 1
)

echo 📁 Starting from: %CD%
echo.
echo 🚀 Starting InfoScape Backend...
echo    This will run a demo server with working OSINT functionality
echo.

REM Start the simple backend server
start /b python simple_server.py

REM Wait for server to start
timeout /t 3 /nobreak >nul

REM Check if server is running (simple test)
echo ✅ Backend server is starting...
echo 🌐 Frontend: Open simple_frontend.html in your browser
echo 📡 API: http://localhost:8000
echo 💚 Health: http://localhost:8000/health
echo.

REM Try to open the frontend
set "FRONTEND_PATH=%~dp0simple_frontend.html"
echo Opening frontend in your default browser...
start "" "file:///%FRONTEND_PATH%"

echo.
echo 🎉 InfoScape is now running!
echo    Close this window to stop the server
echo.
echo Press any key to continue...
pause >nul