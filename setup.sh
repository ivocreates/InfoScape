#!/bin/bash

# InfoScape Setup Script
# Advanced OSINT Intelligence Toolkit Setup

set -e

echo "🌐 InfoScape - Advanced OSINT Intelligence Toolkit Setup"
echo "========================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on supported OS
check_os() {
    print_status "Checking operating system..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        print_success "Linux detected"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        print_success "macOS detected"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        OS="windows"
        print_success "Windows detected"
    else
        print_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
}

# Check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        print_success "Python 3 found: $PYTHON_VERSION"
    else
        print_error "Python 3 not found. Please install Python 3.10 or higher."
        exit 1
    fi
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js not found. Please install Node.js 18 or higher."
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm not found. Please install npm."
        exit 1
    fi
    
    # Check Git
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        print_success "Git found: $GIT_VERSION"
    else
        print_warning "Git not found. Some features may not work properly."
    fi
}

# Setup Python environment
setup_python_environment() {
    print_status "Setting up Python environment..."
    
    cd backend
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
        print_success "Virtual environment created"
    else
        print_status "Virtual environment already exists"
    fi
    
    # Activate virtual environment
    print_status "Activating virtual environment..."
    if [[ "$OS" == "windows" ]]; then
        source venv/Scripts/activate
    else
        source venv/bin/activate
    fi
    
    # Upgrade pip
    print_status "Upgrading pip..."
    pip install --upgrade pip
    
    # Install Python dependencies
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
    print_success "Python dependencies installed"
    
    cd ..
}

# Setup Node.js environment
setup_nodejs_environment() {
    print_status "Setting up Node.js environment..."
    
    cd electron-app
    
    # Install Node.js dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    print_success "Node.js dependencies installed"
    
    cd ..
}

# Install OSINT tools
install_osint_tools() {
    print_status "Installing OSINT tools..."
    
    # Create tools directory
    mkdir -p tools
    cd tools
    
    # Install Sherlock
    if [ ! -d "sherlock" ]; then
        print_status "Installing Sherlock..."
        git clone https://github.com/sherlock-project/sherlock.git
        cd sherlock
        pip install -r requirements.txt
        cd ..
        print_success "Sherlock installed"
    else
        print_status "Sherlock already installed"
    fi
    
    # Install theHarvester
    if [ ! -d "theHarvester" ]; then
        print_status "Installing theHarvester..."
        git clone https://github.com/laramies/theHarvester.git
        cd theHarvester
        pip install -r requirements/base.txt
        cd ..
        print_success "theHarvester installed"
    else
        print_status "theHarvester already installed"
    fi
    
    # Install Photon
    if [ ! -d "Photon" ]; then
        print_status "Installing Photon..."
        git clone https://github.com/s0md3v/Photon.git
        cd Photon
        pip install -r requirements.txt
        cd ..
        print_success "Photon installed"
    else
        print_status "Photon already installed"
    fi
    
    # Install Sublist3r
    if [ ! -d "Sublist3r" ]; then
        print_status "Installing Sublist3r..."
        git clone https://github.com/aboul3la/Sublist3r.git
        cd Sublist3r
        pip install -r requirements.txt
        cd ..
        print_success "Sublist3r installed"
    else
        print_status "Sublist3r already installed"
    fi
    
    cd ..
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    cd backend
    
    # Activate virtual environment
    if [[ "$OS" == "windows" ]]; then
        source venv/Scripts/activate
    else
        source venv/bin/activate
    fi
    
    # Initialize database
    print_status "Initializing database..."
    python -c "
import asyncio
from database.db_manager import DatabaseManager

async def init_db():
    db = DatabaseManager()
    await db.initialize()
    print('Database initialized successfully')

asyncio.run(init_db())
"
    print_success "Database initialized"
    
    cd ..
}

# Create configuration files
create_config_files() {
    print_status "Creating configuration files..."
    
    # Create backend config
    cat > backend/.env << EOF
# InfoScape Backend Configuration
DEBUG=True
HOST=127.0.0.1
PORT=8000
DATABASE_URL=sqlite:///database/infoscape.db

# API Keys (add your own)
SHODAN_API_KEY=
VIRUSTOTAL_API_KEY=
HUNTER_IO_API_KEY=
CLEARBIT_API_KEY=
FULLCONTACT_API_KEY=

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600

# Security
SECRET_KEY=your-secret-key-change-this
CORS_ORIGINS=http://localhost:3000

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/infoscape.log
EOF
    
    print_success "Backend configuration created"
    
    # Create frontend config
    cat > electron-app/.env << EOF
# InfoScape Frontend Configuration
REACT_APP_API_URL=http://127.0.0.1:8000
REACT_APP_VERSION=2.0.0
REACT_APP_ENVIRONMENT=development
EOF
    
    print_success "Frontend configuration created"
}

# Setup logging directories
setup_logging() {
    print_status "Setting up logging directories..."
    
    mkdir -p backend/logs
    mkdir -p electron-app/logs
    
    print_success "Logging directories created"
}

# Build application
build_application() {
    print_status "Building application..."
    
    cd electron-app
    
    # Build React app
    print_status "Building React application..."
    npm run build
    print_success "React application built"
    
    cd ..
}

# Create launch scripts
create_launch_scripts() {
    print_status "Creating launch scripts..."
    
    # Create backend launch script
    cat > start_backend.sh << 'EOF'
#!/bin/bash
cd backend
source venv/bin/activate
python main.py
EOF
    chmod +x start_backend.sh
    
    # Create frontend launch script
    cat > start_frontend.sh << 'EOF'
#!/bin/bash
cd electron-app
npm run electron-dev
EOF
    chmod +x start_frontend.sh
    
    # Create full application launch script
    cat > start_infoscape.sh << 'EOF'
#!/bin/bash
echo "🌐 Starting InfoScape..."

# Start backend in background
echo "Starting backend server..."
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend application..."
cd ../electron-app
npm run electron

# Clean up
kill $BACKEND_PID
EOF
    chmod +x start_infoscape.sh
    
    # Create Windows batch files
    cat > start_backend.bat << 'EOF'
@echo off
cd backend
call venv\Scripts\activate
python main.py
pause
EOF
    
    cat > start_frontend.bat << 'EOF'
@echo off
cd electron-app
npm run electron-dev
pause
EOF
    
    cat > start_infoscape.bat << 'EOF'
@echo off
echo 🌐 Starting InfoScape...

echo Starting backend server...
cd backend
call venv\Scripts\activate
start /B python main.py

echo Waiting for backend to start...
timeout /t 3 /nobreak

echo Starting frontend application...
cd ..\electron-app
npm run electron

echo InfoScape closed. Press any key to exit.
pause
EOF
    
    print_success "Launch scripts created"
}

# Main setup function
main() {
    echo "Starting InfoScape setup..."
    echo ""
    
    check_os
    check_dependencies
    setup_python_environment
    setup_nodejs_environment
    install_osint_tools
    setup_database
    create_config_files
    setup_logging
    build_application
    create_launch_scripts
    
    echo ""
    print_success "InfoScape setup completed successfully!"
    echo ""
    echo "🚀 Quick Start:"
    echo "   1. Configure API keys in backend/.env"
    echo "   2. Run: ./start_infoscape.sh (Linux/macOS) or start_infoscape.bat (Windows)"
    echo ""
    echo "📚 Documentation:"
    echo "   - Backend API: http://127.0.0.1:8000/docs"
    echo "   - GitHub Wiki: https://github.com/ivocreates/InfoScape/wiki"
    echo ""
    echo "🔧 Manual Start:"
    echo "   Backend:  ./start_backend.sh"
    echo "   Frontend: ./start_frontend.sh"
    echo ""
    echo "Happy investigating! 🕵️‍♂️"
}

# Run main function
main "$@"
