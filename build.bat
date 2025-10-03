@echo off
REM InfoScope OSINT Platform - Automated Release Build Script (Windows)
REM Version: 2.3.0
REM Author: Ivo Pereira

setlocal enabledelayedexpansion

REM Configuration
set APP_NAME=InfoScope OSINT Platform
set VERSION=2.3.0
set BUILD_DIR=dist
set LOG_FILE=build.log

REM Colors (if supported)
set GREEN=[92m
set RED=[91m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

echo %BLUE%InfoScope OSINT Platform v%VERSION% - Windows Build Script%NC%
echo ================================================================

REM Clear previous log
echo. > %LOG_FILE%

call :log "Starting InfoScope OSINT Platform v%VERSION% build process..."

REM Check prerequisites
call :check_prerequisites
if errorlevel 1 goto :error

REM Clean previous builds
call :clean_build
if errorlevel 1 goto :error

REM Install dependencies
call :install_dependencies
if errorlevel 1 goto :error

REM Build React application
call :build_react
if errorlevel 1 goto :error

REM Build Electron applications
call :build_electron
if errorlevel 1 goto :error

REM Generate checksums
call :generate_checksums

REM Display build summary
call :show_summary

call :success "Build process completed successfully!"
goto :end

REM Functions
:log
echo [%time%] %~1
echo [%time%] %~1 >> %LOG_FILE%
goto :eof

:success
echo %GREEN%✓ %~1%NC%
echo [%time%] SUCCESS: %~1 >> %LOG_FILE%
goto :eof

:warning
echo %YELLOW%⚠ %~1%NC%
echo [%time%] WARNING: %~1 >> %LOG_FILE%
goto :eof

:error
echo %RED%✗ %~1%NC%
echo [%time%] ERROR: %~1 >> %LOG_FILE%
exit /b 1

:check_prerequisites
call :log "Checking prerequisites..."

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    call :error "Node.js is not installed. Please install Node.js 18.x or higher."
    exit /b 1
)

REM Get Node.js version
for /f "tokens=1 delims=." %%a in ('node --version') do (
    set NODE_MAJOR=%%a
    set NODE_MAJOR=!NODE_MAJOR:v=!
)

if !NODE_MAJOR! LSS 18 (
    call :error "Node.js version 18 or higher is required."
    exit /b 1
)

call :success "Node.js found: %NODE_VERSION%"

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    call :error "npm is not installed."
    exit /b 1
)

call :success "npm found"

REM Check for Visual Studio Build Tools
where msbuild >nul 2>&1
if errorlevel 1 (
    call :warning "MSBuild not found. Some native dependencies may fail to build."
    call :warning "Install Visual Studio Build Tools if you encounter issues."
) else (
    call :success "MSBuild found"
)

REM Check for Python (required for node-gyp)
python --version >nul 2>&1
if errorlevel 1 (
    python3 --version >nul 2>&1
    if errorlevel 1 (
        call :warning "Python not found. May be required for native dependencies."
    ) else (
        call :success "Python3 found"
    )
) else (
    call :success "Python found"
)

goto :eof

:clean_build
call :log "Cleaning previous builds..."

if exist %BUILD_DIR% (
    rmdir /s /q %BUILD_DIR%
    call :success "Removed %BUILD_DIR% directory"
)

if exist build (
    rmdir /s /q build
    call :success "Removed React build directory"
)

REM Clean npm cache
npm cache clean --force >nul 2>&1
call :success "Cleaned npm cache"

goto :eof

:install_dependencies
call :log "Installing dependencies..."

npm ci
if errorlevel 1 (
    call :error "Failed to install dependencies"
    exit /b 1
)

call :success "Dependencies installed successfully"

REM Audit dependencies for security issues
call :log "Checking for security vulnerabilities..."
npm audit --audit-level high
if errorlevel 1 (
    call :warning "Security vulnerabilities detected - review npm audit output"
) else (
    call :success "No high-severity vulnerabilities found"
)

goto :eof

:build_react
call :log "Building React application..."

npm run build
if errorlevel 1 (
    call :error "React build failed"
    exit /b 1
)

call :success "React build completed"

REM Check build size (approximate)
if exist build (
    for /f %%i in ('dir build /s /-c ^| find "bytes"') do set BUILD_SIZE=%%i
    call :log "React build completed"
)

goto :eof

:build_electron
call :log "Building Electron applications for Windows..."

npm run electron-pack-win
if errorlevel 1 (
    call :error "Windows build failed"
    exit /b 1
)

call :success "Windows build completed"

REM List generated files
if exist %BUILD_DIR% (
    call :log "Generated files:"
    for %%f in (%BUILD_DIR%\*) do (
        call :log "  %%~nxf"
    )
)

goto :eof

:generate_checksums
call :log "Generating checksums..."

if exist %BUILD_DIR% (
    cd %BUILD_DIR%
    
    REM Generate SHA256 checksums using PowerShell
    powershell -Command "Get-ChildItem -File | ForEach-Object { (Get-FileHash $_.Name -Algorithm SHA256).Hash + '  ' + $_.Name } | Out-File -Encoding UTF8 SHA256SUMS"
    
    if exist SHA256SUMS (
        call :success "SHA256 checksums generated"
    ) else (
        call :warning "Failed to generate checksums"
    )
    
    cd ..
)

goto :eof

:show_summary
call :log "Build Summary:"
call :log "=============="
call :log "Application: %APP_NAME%"
call :log "Version: %VERSION%"
call :log "Platform: Windows"
call :log "Build Directory: %BUILD_DIR%"

if exist %BUILD_DIR% (
    call :log "Generated Files:"
    for %%f in (%BUILD_DIR%\*) do (
        call :log "  %%~nxf"
    )
)

call :log ""
call :log "Build log saved to: %LOG_FILE%"

goto :eof

:end
echo.
echo %GREEN%Build completed! Check the %BUILD_DIR% directory for output files.%NC%
pause
exit /b 0