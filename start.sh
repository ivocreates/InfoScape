#!/bin/bash

echo "==============================================="
echo "       InfoScape v2.0.0 - Startup Script"
echo "   Advanced OSINT Intelligence Platform"
echo "==============================================="
echo

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python3 not found! Please install Python 3.10+"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js not found! Please install Node.js 18+"
    exit 1
fi

echo "[INFO] Starting InfoScape Backend..."
cd backend

# Start backend in background
source venv/bin/activate
python main.py &
BACKEND_PID=$!

sleep 3

echo "[INFO] Starting InfoScape Frontend..."
cd ../electron-app

# Start Electron app
npm start &
FRONTEND_PID=$!

echo
echo "==============================================="
echo "   InfoScape is running!"
echo "   Backend: http://localhost:8000"
echo "   Frontend: Electron Desktop App"
echo "==============================================="
echo
echo "Press Ctrl+C to stop all services..."

# Wait for interrupt
trap "echo 'Stopping InfoScape...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
