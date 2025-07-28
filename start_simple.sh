#!/bin/bash

# InfoScape Startup Script
# Simple way to run InfoScape without complex dependencies

echo "🌐 InfoScape - OSINT Intelligence Toolkit"
echo "==========================================="
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not found"
    echo "   Please install Python 3.8+ and try again"
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Navigate to backend directory
cd "$(dirname "$0")/backend" || {
    echo "❌ Backend directory not found"
    exit 1
}

echo "📁 Starting from: $(pwd)"

# Start the simple backend server
echo ""
echo "🚀 Starting InfoScape Backend..."
echo "   This will run a demo server with working OSINT functionality"
echo ""

python3 simple_server.py &
SERVER_PID=$!

# Wait a moment for server to start
sleep 2

# Check if server is running
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo ""
    echo "✅ Backend server is running!"
    echo "🌐 Frontend: Open simple_frontend.html in your browser"
    echo "📡 API: http://localhost:8000"
    echo "💚 Health: http://localhost:8000/health"
    echo ""
    echo "Press any key to open the frontend in your default browser..."
    read -n 1 -s
    
    # Try to open the frontend in browser
    FRONTEND_PATH="$(dirname "$(pwd)")/simple_frontend.html"
    
    if command -v xdg-open &> /dev/null; then
        xdg-open "file://$FRONTEND_PATH"
    elif command -v open &> /dev/null; then
        open "file://$FRONTEND_PATH"
    elif command -v start &> /dev/null; then
        start "file://$FRONTEND_PATH"
    else
        echo "Please manually open: file://$FRONTEND_PATH"
    fi
    
    echo ""
    echo "🎉 InfoScape is now running!"
    echo "   Press Ctrl+C to stop the server"
    echo ""
    
    # Wait for Ctrl+C
    wait $SERVER_PID
else
    echo "❌ Failed to start backend server"
    echo "   Check if port 8000 is already in use"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi