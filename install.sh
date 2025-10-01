#!/bin/bash
# InfoScope OSINT Platform v2.0.0 - Installation Wrapper
# Automated installation script with dependency checks and setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logo
echo -e "${BLUE}"
echo "  ___        __       ____                       "
echo " |_ _|_ __  / _| ___  / ___|  ___ ___  _ __   ___  "
echo "  | || '_ \| |_ / _ \| |     / __/ _ \| '_ \ / _ \ "
echo "  | || | | |  _| (_) | |___ | (_| (_) | |_) |  __/ "
echo " |___|_| |_|_|  \___/ \____| \___\___/| .__/ \___| "
echo "                                     |_|          "
echo -e "${NC}"
echo -e "${GREEN}Professional OSINT Investigation Platform v2.0.0${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check system requirements
print_status "Checking system requirements..."

# Detect OS
OS="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
fi

print_status "Detected OS: $OS"

# Check available space
AVAILABLE_SPACE=$(df -h . | awk 'NR==2 {print $4}' | sed 's/[^0-9.]//g')
if (( $(echo "$AVAILABLE_SPACE < 1" | bc -l) )); then
    print_error "Insufficient disk space. At least 1GB required."
    exit 1
fi

print_status "Available disk space: ${AVAILABLE_SPACE}GB"

# Download URLs (replace with actual release URLs)
BASE_URL="https://github.com/ivocreates/InfoScape/releases/download/v2.0.0"
declare -A DOWNLOAD_URLS
DOWNLOAD_URLS[linux]="$BASE_URL/InfoScope-OSINT-2.0.0.AppImage"
DOWNLOAD_URLS[macos]="$BASE_URL/InfoScope-OSINT-2.0.0.dmg"
DOWNLOAD_URLS[windows]="$BASE_URL/InfoScope-OSINT-2.0.0-Setup.exe"

# Download function
download_file() {
    local url=$1
    local output=$2
    
    print_status "Downloading $output..."
    
    if command -v curl >/dev/null 2>&1; then
        curl -L -o "$output" "$url"
    elif command -v wget >/dev/null 2>&1; then
        wget -O "$output" "$url"
    else
        print_error "Neither curl nor wget found. Please install one of them."
        exit 1
    fi
}

# Install function
install_app() {
    case $OS in
        linux)
            print_status "Installing InfoScope OSINT for Linux..."
            local app_file="InfoScope-OSINT-2.0.0.AppImage"
            download_file "${DOWNLOAD_URLS[linux]}" "$app_file"
            chmod +x "$app_file"
            
            # Create desktop entry
            mkdir -p ~/.local/share/applications
            cat > ~/.local/share/applications/infoscope-osint.desktop << EOF
[Desktop Entry]
Type=Application
Name=InfoScope OSINT Platform
Comment=Professional OSINT Investigation Platform
Exec=$(pwd)/$app_file
Icon=$(pwd)/icon.png
Categories=Utility;Security;
StartupWMClass=InfoScope OSINT Platform
EOF
            
            print_status "Installation complete! Launch from applications menu or run: ./$app_file"
            ;;
            
        macos)
            print_status "Installing InfoScope OSINT for macOS..."
            local dmg_file="InfoScope-OSINT-2.0.0.dmg"
            download_file "${DOWNLOAD_URLS[macos]}" "$dmg_file"
            
            print_status "Opening DMG file. Please drag InfoScope OSINT to Applications folder."
            open "$dmg_file"
            ;;
            
        windows)
            print_status "Installing InfoScope OSINT for Windows..."
            local exe_file="InfoScope-OSINT-2.0.0-Setup.exe"
            download_file "${DOWNLOAD_URLS[windows]}" "$exe_file"
            
            print_status "Running installer..."
            ./"$exe_file"
            ;;
            
        *)
            print_error "Unsupported operating system: $OS"
            print_status "Please visit https://github.com/ivocreates/InfoScape/releases for manual download"
            exit 1
            ;;
    esac
}

# Setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    # Create config directory
    local config_dir=""
    case $OS in
        linux|macos)
            config_dir="$HOME/.config/infoscope-osint"
            ;;
        windows)
            config_dir="$APPDATA/InfoScope OSINT"
            ;;
    esac
    
    mkdir -p "$config_dir"
    
    # Create example environment file
    cat > "$config_dir/.env.example" << EOF
# InfoScope OSINT Platform - Environment Configuration
# Copy this file to .env and add your actual API keys

# Google AI API Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# OpenAI API Configuration  
OPENAI_API_KEY=your_openai_api_key_here

# Firebase Configuration (optional for cloud sync)
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_PROJECT_ID=your_project_id
EOF

    print_status "Configuration template created at: $config_dir/.env.example"
    print_warning "Remember to configure your API keys for full functionality!"
}

# Post-installation setup
post_install_setup() {
    print_status "Running post-installation setup..."
    
    # Check for security tools
    print_status "Checking for recommended security tools..."
    
    local tools=("tor" "proxychains" "nmap" "whois" "dig")
    for tool in "${tools[@]}"; do
        if command -v "$tool" >/dev/null 2>&1; then
            print_status "✓ $tool is available"
        else
            print_warning "○ $tool is not installed (optional but recommended)"
        fi
    done
    
    # Show usage information
    echo ""
    print_status "Installation completed successfully!"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Configure API keys in the settings"
    echo "2. Review legal documentation and terms"
    echo "3. Start your first OSINT investigation"
    echo ""
    echo -e "${BLUE}Resources:${NC}"
    echo "• Documentation: https://github.com/ivocreates/InfoScape/wiki"
    echo "• Web Version: https://infoscope-osint.web.app"
    echo "• Community: https://github.com/ivocreates/InfoScape/discussions"
    echo ""
    echo -e "${GREEN}Happy investigating! 🕵️${NC}"
}

# Main installation flow
main() {
    echo "Starting InfoScope OSINT Platform v2.0.0 installation..."
    echo ""
    
    # Confirm installation
    read -p "Do you want to continue with the installation? [Y/n]: " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]] && [[ ! -z $REPLY ]]; then
        print_status "Installation cancelled."
        exit 0
    fi
    
    install_app
    setup_environment
    post_install_setup
}

# Run main function
main "$@"