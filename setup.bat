@echo off
:: InfoScape Setup Script for Windows
:: Advanced OSINT Intelligence Toolkit Setup

echo 🌐 InfoScape - Advanced OSINT Intelligence Toolkit Setup
echo =========================================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.10 or higher.
    pause
    exit /b 1
)
echo [SUCCESS] Python found

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18 or higher.
    pause
    exit /b 1
)
echo [SUCCESS] Node.js found

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found. Please install npm.
    pause
    exit /b 1
)
echo [SUCCESS] npm found

:: Setup Python environment
echo [INFO] Setting up Python environment...
cd backend

if not exist "venv" (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
    echo [SUCCESS] Virtual environment created
) else (
    echo [INFO] Virtual environment already exists
)

echo [INFO] Activating virtual environment...
call venv\Scripts\activate

echo [INFO] Upgrading pip...
python -m pip install --upgrade pip

echo [INFO] Installing Python dependencies...
pip install -r requirements.txt
echo [SUCCESS] Python dependencies installed

cd ..

:: Setup Node.js environment
echo [INFO] Setting up Node.js environment...
cd electron-app

echo [INFO] Installing Node.js dependencies...
npm install
echo [SUCCESS] Node.js dependencies installed

cd ..

:: Create directories
echo [INFO] Creating directories...
if not exist "tools" mkdir tools
if not exist "backend\logs" mkdir backend\logs
if not exist "electron-app\logs" mkdir electron-app\logs
echo [SUCCESS] Directories created

:: Setup database
echo [INFO] Setting up database...
cd backend
call venv\Scripts\activate

python -c "import asyncio; from database.db_manager import DatabaseManager; asyncio.run(DatabaseManager().initialize()); print('Database initialized successfully')"
echo [SUCCESS] Database initialized

cd ..

:: Create configuration files
echo [INFO] Creating configuration files...

echo # InfoScape Backend Configuration > backend\.env
echo DEBUG=True >> backend\.env
echo HOST=127.0.0.1 >> backend\.env
echo PORT=8000 >> backend\.env
echo DATABASE_URL=sqlite:///database/infoscape.db >> backend\.env
echo. >> backend\.env
echo # API Keys (add your own) >> backend\.env
echo SHODAN_API_KEY= >> backend\.env
echo VIRUSTOTAL_API_KEY= >> backend\.env
echo HUNTER_IO_API_KEY= >> backend\.env

echo # InfoScape Frontend Configuration > electron-app\.env
echo REACT_APP_API_URL=http://127.0.0.1:8000 >> electron-app\.env
echo REACT_APP_VERSION=2.0.0 >> electron-app\.env
echo REACT_APP_ENVIRONMENT=development >> electron-app\.env

echo [SUCCESS] Configuration files created

:: Build application
echo [INFO] Building application...
cd electron-app
npm run build
echo [SUCCESS] Application built
cd ..

:: Create launch scripts
echo @echo off > start_backend.bat
echo cd backend >> start_backend.bat
echo call venv\Scripts\activate >> start_backend.bat
echo python main.py >> start_backend.bat
echo pause >> start_backend.bat

echo @echo off > start_frontend.bat
echo cd electron-app >> start_frontend.bat
echo npm run electron-dev >> start_frontend.bat
echo pause >> start_frontend.bat

echo @echo off > start_infoscape.bat
echo echo 🌐 Starting InfoScape... >> start_infoscape.bat
echo cd backend >> start_infoscape.bat
echo call venv\Scripts\activate >> start_infoscape.bat
echo start /B python main.py >> start_infoscape.bat
echo timeout /t 3 /nobreak >> start_infoscape.bat
echo cd ..\electron-app >> start_infoscape.bat
echo npm run electron >> start_infoscape.bat

echo [SUCCESS] Launch scripts created

echo.
echo [SUCCESS] InfoScape setup completed successfully!
echo.
echo 🚀 Quick Start:
echo    1. Configure API keys in backend\.env
echo    2. Run: start_infoscape.bat
echo.
echo 📚 Documentation:
echo    - Backend API: http://127.0.0.1:8000/docs
echo    - GitHub Wiki: https://github.com/ivocreates/InfoScape/wiki
echo.
echo 🔧 Manual Start:
echo    Backend:  start_backend.bat
echo    Frontend: start_frontend.bat
echo.
echo Happy investigating! 🕵️‍♂️
pause
