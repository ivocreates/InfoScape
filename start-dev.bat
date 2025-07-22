@echo off
:: InfoScape Development Starter
:: Handles PowerShell execution policy and starts both backend and frontend

echo 🌐 InfoScape - Starting Development Environment
echo ================================================
echo.

:: Set PowerShell execution policy for current user
echo [INFO] Setting PowerShell execution policy...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
echo [SUCCESS] PowerShell execution policy updated

:: Start Backend in new window
echo [INFO] Starting Backend Server...
start "InfoScape Backend" cmd /k "cd /d backend && call venv\Scripts\activate && python main.py"

:: Wait a moment for backend to start
timeout /t 5 /nobreak >nul

:: Start Frontend in new window
echo [INFO] Starting Frontend Application...
start "InfoScape Frontend" cmd /k "cd /d electron-app && npm start"

echo [SUCCESS] InfoScape development environment started!
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to continue...
pause >nul
