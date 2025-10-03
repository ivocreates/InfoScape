#!/bin/bash

# InfoScope OSINT Platform - Automated Release Build Script
# Version: 2.3.0
# Author: Ivo Pereira

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="InfoScope OSINT Platform"
VERSION="2.3.0"
BUILD_DIR="dist"
LOG_FILE="build.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}✗${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# Main script
main() {
    log "Starting InfoScope OSINT Platform v$VERSION build process..."
    
    # Clear previous log
    > "$LOG_FILE"
    
    # Detect platform
    PLATFORM=$(uname -s)
    case "$PLATFORM" in
        Linux*)     MACHINE=Linux;;
        Darwin*)    MACHINE=Mac;;
        CYGWIN*|MINGW*|MSYS*) MACHINE=Windows;;
        *)          MACHINE="Unknown";;
    esac
    
    log "Detected platform: $MACHINE"
    
    # Check prerequisites
    check_prerequisites
    
    # Clean previous builds
    clean_build
    
    # Install dependencies
    install_dependencies
    
    # Run tests (if available)
    run_tests
    
    # Build React application
    build_react
    
    # Build Electron applications
    build_electron
    
    # Generate checksums
    generate_checksums
    
    # Display build summary
    show_summary
    
    success "Build process completed successfully!"
}

check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js 18.x or higher."
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Node.js version 18 or higher is required. Current version: $(node --version)"
    fi
    success "Node.js $(node --version) found"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed."
    fi
    success "npm $(npm --version) found"
    
    # Check git (optional)
    if command -v git &> /dev/null; then
        success "Git $(git --version | cut -d' ' -f3) found"
    else
        warning "Git not found - version control features may not work"
    fi
    
    # Platform-specific checks
    case "$MACHINE" in
        Windows)
            check_windows_prerequisites
            ;;
        Mac)
            check_mac_prerequisites
            ;;
        Linux)
            check_linux_prerequisites
            ;;
    esac
}

check_windows_prerequisites() {
    log "Checking Windows-specific prerequisites..."
    
    # Check for Visual Studio Build Tools
    if ! command -v msbuild &> /dev/null; then
        warning "MSBuild not found. Some native dependencies may fail to build."
        warning "Install Visual Studio Build Tools if you encounter issues."
    fi
    
    # Check for Python (required for node-gyp)
    if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
        warning "Python not found. May be required for native dependencies."
    fi
}

check_mac_prerequisites() {
    log "Checking macOS-specific prerequisites..."
    
    # Check for Xcode Command Line Tools
    if ! xcode-select -p &> /dev/null; then
        warning "Xcode Command Line Tools not found."
        warning "Run: xcode-select --install"
    else
        success "Xcode Command Line Tools found"
    fi
    
    # Check for code signing identity (optional)
    if security find-identity -v -p codesigning | grep -q "Developer ID Application"; then
        success "Code signing identity found"
    else
        warning "No code signing identity found - builds will not be signed"
    fi
}

check_linux_prerequisites() {
    log "Checking Linux-specific prerequisites..."
    
    # Check for required packages
    REQUIRED_PACKAGES="build-essential libnss3-dev libatk-bridge2.0-dev libdrm2 libgtk-3-dev"
    
    for package in $REQUIRED_PACKAGES; do
        if dpkg-query -W -f='${Status}' "$package" 2>/dev/null | grep -q "ok installed"; then
            success "$package is installed"
        else
            warning "$package is not installed - may cause build issues"
            warning "Install with: sudo apt-get install $package"
        fi
    done
}

clean_build() {
    log "Cleaning previous builds..."
    
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        success "Removed $BUILD_DIR directory"
    fi
    
    if [ -d "build" ]; then
        rm -rf "build"
        success "Removed React build directory"
    fi
    
    # Clean npm cache (optional)
    npm cache clean --force &> /dev/null || true
    success "Cleaned npm cache"
}

install_dependencies() {
    log "Installing dependencies..."
    
    # Install npm dependencies
    if npm ci; then
        success "Dependencies installed successfully"
    else
        error "Failed to install dependencies"
    fi
    
    # Audit dependencies for security issues
    log "Checking for security vulnerabilities..."
    if npm audit --audit-level high; then
        success "No high-severity vulnerabilities found"
    else
        warning "Security vulnerabilities detected - review npm audit output"
    fi
}

run_tests() {
    log "Running tests..."
    
    # Check if test script exists
    if npm run test --silent -- --watchAll=false --passWithNoTests 2>/dev/null; then
        success "All tests passed"
    else
        warning "Tests failed or no tests found"
    fi
}

build_react() {
    log "Building React application..."
    
    if npm run build; then
        success "React build completed"
        
        # Check build size
        BUILD_SIZE=$(du -sh build 2>/dev/null | cut -f1 || echo "Unknown")
        log "React build size: $BUILD_SIZE"
    else
        error "React build failed"
    fi
}

build_electron() {
    log "Building Electron applications..."
    
    case "$MACHINE" in
        Windows)
            build_platform "win" "npm run electron-pack-win"
            ;;
        Mac)
            build_platform "mac" "npm run electron-pack-mac"
            ;;
        Linux)
            build_platform "linux" "npm run electron-pack-linux"
            ;;
        *)
            warning "Unknown platform - attempting cross-platform build"
            build_platform "all" "npm run electron-pack-all"
            ;;
    esac
}

build_platform() {
    local platform=$1
    local command=$2
    
    log "Building for $platform..."
    
    if eval "$command"; then
        success "$platform build completed"
        
        # List generated files
        if [ -d "$BUILD_DIR" ]; then
            log "Generated files:"
            find "$BUILD_DIR" -maxdepth 1 -type f -name "*" | while read -r file; do
                FILE_SIZE=$(du -h "$file" | cut -f1)
                log "  $(basename "$file") ($FILE_SIZE)"
            done
        fi
    else
        error "$platform build failed"
    fi
}

generate_checksums() {
    log "Generating checksums..."
    
    if [ -d "$BUILD_DIR" ]; then
        cd "$BUILD_DIR"
        
        # Generate SHA256 checksums
        if command -v sha256sum &> /dev/null; then
            sha256sum * > SHA256SUMS 2>/dev/null || true
            success "SHA256 checksums generated"
        elif command -v shasum &> /dev/null; then
            shasum -a 256 * > SHA256SUMS 2>/dev/null || true
            success "SHA256 checksums generated (shasum)"
        else
            warning "No checksum utility found"
        fi
        
        cd - > /dev/null
    fi
}

show_summary() {
    log "Build Summary:"
    log "=============="
    log "Application: $APP_NAME"
    log "Version: $VERSION"
    log "Platform: $MACHINE"
    log "Build Directory: $BUILD_DIR"
    
    if [ -d "$BUILD_DIR" ]; then
        TOTAL_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
        FILE_COUNT=$(find "$BUILD_DIR" -type f | wc -l)
        
        log "Total Size: $TOTAL_SIZE"
        log "Files Generated: $FILE_COUNT"
        
        log ""
        log "Generated Files:"
        find "$BUILD_DIR" -maxdepth 1 -type f -name "*" | sort | while read -r file; do
            FILE_SIZE=$(du -h "$file" | cut -f1)
            printf "  %-50s %s\n" "$(basename "$file")" "$FILE_SIZE"
        done | tee -a "$LOG_FILE"
    fi
    
    log ""
    log "Build log saved to: $LOG_FILE"
}

# Handle script interruption
trap 'error "Build process interrupted"' INT TERM

# Run main function
main "$@"