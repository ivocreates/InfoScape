#!/usr/bin/env node
/**
 * InfoScape Development Launcher
 * Cross-platform Node.js script to start InfoScape development environment
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🌐 InfoScape - Development Environment Launcher');
console.log('===============================================');
console.log('');

// Check if we're in the right directory
const packageJsonPath = path.join(__dirname, 'electron-app', 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ Error: Please run this script from the InfoScape root directory');
    process.exit(1);
}

// Check if backend virtual environment exists
const venvPath = path.join(__dirname, 'backend', 'venv');
if (!fs.existsSync(venvPath)) {
    console.log('⚠️  Virtual environment not found. Please run setup first:');
    console.log('   Windows: .\\setup.bat');
    console.log('   Linux/Mac: ./setup.sh');
    process.exit(1);
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'electron-app', 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing frontend dependencies...');
    exec('npm install', { cwd: path.join(__dirname, 'electron-app') }, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Failed to install dependencies:', error);
            process.exit(1);
        }
        console.log('✅ Dependencies installed');
        startServices();
    });
} else {
    startServices();
}

function startServices() {
    console.log('🚀 Starting InfoScape services...');
    console.log('');

    // Start backend
    console.log('📡 Starting backend server...');
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const activateScript = process.platform === 'win32' 
        ? path.join(__dirname, 'backend', 'venv', 'Scripts', 'activate.bat')
        : path.join(__dirname, 'backend', 'venv', 'bin', 'activate');
    
    const backendCmd = process.platform === 'win32'
        ? `call "${activateScript}" && python main.py`
        : `source "${activateScript}" && python3 main.py`;

    const backend = spawn(process.platform === 'win32' ? 'cmd' : 'bash', 
        process.platform === 'win32' ? ['/c', backendCmd] : ['-c', backendCmd], 
        { 
            cwd: path.join(__dirname, 'backend'),
            stdio: 'inherit'
        }
    );

    // Wait a moment for backend to start
    setTimeout(() => {
        console.log('🎨 Starting frontend application...');
        
        // Start frontend
        const frontend = spawn('npm', ['start'], {
            cwd: path.join(__dirname, 'electron-app'),
            stdio: 'inherit'
        });

        frontend.on('error', (error) => {
            console.error('❌ Frontend error:', error);
        });

    }, 3000);

    backend.on('error', (error) => {
        console.error('❌ Backend error:', error);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down InfoScape...');
        backend.kill();
        process.exit(0);
    });

    console.log('');
    console.log('✅ InfoScape services started!');
    console.log('');
    console.log('🌐 Access points:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend API: http://localhost:8000');
    console.log('   API Docs: http://localhost:8000/docs');
    console.log('');
    console.log('Press Ctrl+C to stop all services');
}
