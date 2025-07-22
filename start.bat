@echo off
echo ===============================================
echo        InfoScape v2.0.0 - Startup Script
echo    Advanced OSINT Intelligence Platform
echo ===============================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found! Please install Python 3.10+
    pause
    exit /b 1
)

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found! Please install Node.js 18+
    pause
    exit /b 1
)

echo [INFO] Starting InfoScape Backend...
cd backend

REM Activate virtual environment and start backend
start /b cmd /c "venv\Scripts\activate && python main.py"

timeout /t 3 /nobreak >nul

echo [INFO] Starting InfoScape Frontend...
cd ..\electron-app

REM Start Electron app
start /b cmd /c "npm start"

echo.
echo ===============================================
echo    InfoScape is starting up...
echo    Backend: http://localhost:8000
echo    Frontend: Electron Desktop App
echo ===============================================
echo.
echo Press any key to exit...
pause >nul
