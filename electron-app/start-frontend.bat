@echo off
title InfoScape Frontend Application
echo 🎨 InfoScape Frontend Application
echo ================================
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the electron-app directory.
    echo Expected location: d:\Projects\InfoScape\electron-app\
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies. Please check your Node.js installation.
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed
)

:: Start the frontend application
echo.
echo [INFO] Starting InfoScape Frontend Application...
echo [INFO] Application will be available at: http://localhost:3000
echo [INFO] Make sure the backend server is running on port 8000
echo [INFO] Press Ctrl+C to stop the application
echo.

call npm start

echo.
echo [INFO] Frontend application stopped.
pause
