@echo off
title InfoScape Backend Server
echo 🌐 InfoScape Backend Server
echo ========================
echo.

:: Check if we're in the right directory
if not exist "main.py" (
    echo [ERROR] main.py not found. Please run this script from the backend directory.
    echo Expected location: d:\Projects\InfoScape\backend\
    pause
    exit /b 1
)

:: Check if virtual environment exists
if not exist "venv" (
    echo [INFO] Virtual environment not found. Creating one...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment. Please install Python 3.10+
        pause
        exit /b 1
    )
    echo [SUCCESS] Virtual environment created
)

:: Activate virtual environment
echo [INFO] Activating virtual environment...
call venv\Scripts\activate

:: Install dependencies if requirements.txt exists
if exist "requirements.txt" (
    echo [INFO] Installing/updating dependencies...
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo [WARNING] Some dependencies failed to install. Continuing anyway...
    )
)

:: Start the backend server
echo.
echo [INFO] Starting InfoScape Backend Server...
echo [INFO] Server will be available at: http://localhost:8000
echo [INFO] API Documentation: http://localhost:8000/docs
echo [INFO] Press Ctrl+C to stop the server
echo.

python main.py

echo.
echo [INFO] Backend server stopped.
pause
