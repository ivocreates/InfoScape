# InfoScape PowerShell Starter
# Advanced OSINT Intelligence Toolkit Development Environment

Write-Host "🌐 InfoScape - Starting Development Environment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Set execution policy for current user
Write-Host "[INFO] Updating PowerShell execution policy..." -ForegroundColor Yellow
try {
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "[SUCCESS] PowerShell execution policy updated" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] Could not update execution policy. You may need to run as administrator." -ForegroundColor Yellow
}

# Function to start backend
function Start-Backend {
    Write-Host "[INFO] Starting Backend Server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; .\venv\Scripts\Activate.ps1; python main.py"
}

# Function to start frontend
function Start-Frontend {
    Write-Host "[INFO] Starting Frontend Application..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\electron-app'; npm start"
}

# Check if virtual environment exists
if (-not (Test-Path "backend\venv")) {
    Write-Host "[ERROR] Virtual environment not found. Please run setup.bat first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "electron-app\node_modules")) {
    Write-Host "[INFO] Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location "electron-app"
    npm install
    Set-Location ".."
    Write-Host "[SUCCESS] Frontend dependencies installed" -ForegroundColor Green
}

# Start backend
Start-Backend

# Wait for backend to start
Start-Sleep -Seconds 5

# Start frontend
Start-Frontend

Write-Host ""
Write-Host "[SUCCESS] InfoScape development environment started!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
