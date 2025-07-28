#!/usr/bin/env python3
"""
Simple InfoScape Backend Server
Runs without external dependencies for demonstration purposes
"""

import asyncio
import json
import sys
import os
from datetime import datetime
from typing import Dict, Any, Optional

# Add the current directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Simple HTTP server implementation
import http.server
import socketserver
from urllib.parse import urlparse, parse_qs
import threading
import socket

class InfoScapeHandler(http.server.BaseHTTPRequestHandler):
    """Simple HTTP handler for InfoScape API"""
    
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_GET(self):
        self._set_headers()
        
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path == '/':
            response = {
                "name": "InfoScape OSINT API",
                "version": "2.0.0", 
                "status": "operational",
                "features": [
                    "Advanced People Search",
                    "Reverse Phone/Email Lookup",
                    "Social Media Intelligence",
                    "Domain & IP Intelligence",
                    "Data Correlation & Analysis",
                    "Multi-tool OSINT Integration",
                    "Report Generation & Export"
                ],
                "timestamp": datetime.now().isoformat()
            }
        elif path == '/health':
            response = {
                "status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "services": {
                    "database": "connected",
                    "api": "running",
                    "osint_tools": "ready"
                }
            }
        else:
            response = {"error": "Endpoint not found", "path": path}
        
        self.wfile.write(json.dumps(response, indent=2).encode())

    def do_POST(self):
        self._set_headers()
        
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            request_data = json.loads(post_data.decode('utf-8'))
        except:
            request_data = {}
        
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Mock responses for different endpoints
        if path == '/api/search/people':
            response = self._handle_people_search(request_data)
        elif path == '/api/search/reverse':
            response = self._handle_reverse_search(request_data)
        elif path == '/api/intel/social':
            response = self._handle_social_intel(request_data)
        elif path == '/api/intel/domain':
            response = self._handle_domain_intel(request_data)
        elif path == '/api/reports/generate':
            response = self._handle_report_generation(request_data)
        else:
            response = {"error": "Endpoint not implemented", "path": path}
        
        self.wfile.write(json.dumps(response, indent=2).encode())

    def _handle_people_search(self, data):
        """Handle people search requests"""
        return {
            "success": True,
            "search_id": "demo_search_123",
            "query": data,
            "results": {
                "sources": {
                    "social_media": [
                        {
                            "platform": "LinkedIn",
                            "username": data.get('username', 'demo_user'),
                            "profile_url": f"https://linkedin.com/in/{data.get('username', 'demo_user')}",
                            "confidence": 0.85,
                            "verified": True
                        }
                    ],
                    "search_engines": [
                        {
                            "source": "Google Search",
                            "query": f"{data.get('first_name', 'John')} {data.get('last_name', 'Doe')}",
                            "results_count": 42,
                            "confidence": 0.7
                        }
                    ]
                },
                "summary": {
                    "total_results": 15,
                    "platforms_found": ["LinkedIn", "Google"],
                    "high_confidence_matches": 3,
                    "email_addresses": [data.get('email', 'demo@example.com')],
                    "phone_numbers": [data.get('phone', '+1-555-123-4567')],
                    "social_profiles": ["linkedin.com/in/demo_user"],
                }
            },
            "confidence_score": 75,
            "processing_time": 2.5,
            "timestamp": datetime.now().isoformat()
        }

    def _handle_reverse_search(self, data):
        """Handle reverse lookup requests"""
        return {
            "success": True,
            "results": {
                "lookup_type": "phone" if data.get('phone') else "email",
                "query": data.get('phone') or data.get('email'),
                "results": [
                    {
                        "source": "Directory Lookup",
                        "name": "Demo User",
                        "location": "Demo City, Demo State",
                        "confidence": 0.8
                    }
                ]
            },
            "sources_checked": ["whitepages", "spokeo", "truecaller"],
            "confidence_score": 80
        }

    def _handle_social_intel(self, data):
        """Handle social intelligence requests"""
        return {
            "intel_id": "social_intel_456",
            "status": "completed",
            "results": {
                "social_profiles": [
                    {
                        "platform": "Facebook",
                        "username": data.get('username', 'demo_user'),
                        "confidence": 0.75,
                        "profile_url": f"https://facebook.com/{data.get('username', 'demo_user')}"
                    },
                    {
                        "platform": "Twitter", 
                        "username": data.get('username', 'demo_user'),
                        "confidence": 0.82,
                        "profile_url": f"https://twitter.com/{data.get('username', 'demo_user')}"
                    }
                ],
                "analytics": {
                    "total_profiles": 2,
                    "high_confidence": 1,
                    "platforms_searched": 10
                }
            }
        }

    def _handle_domain_intel(self, data):
        """Handle domain intelligence requests"""
        domain = data.get('domain', 'example.com')
        return {
            "success": True,
            "domain_info": {
                "domain": domain,
                "ip_address": "93.184.216.34",
                "registrar": "Demo Registrar",
                "creation_date": "1995-08-14",
                "country": "United States",
                "organization": "Internet Corporation for Assigned Names and Numbers"
            },
            "subdomains": [f"www.{domain}", f"mail.{domain}", f"ftp.{domain}"],
            "dns_records": {
                "A": ["93.184.216.34"],
                "MX": ["mail.example.com"],
                "NS": ["ns1.example.com", "ns2.example.com"]
            },
            "security_scan": {
                "ssl_valid": True,
                "security_headers": 6,
                "vulnerabilities": 0
            }
        }

    def _handle_report_generation(self, data):
        """Handle report generation requests"""
        return {
            "success": True,
            "report_path": f"/reports/demo_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
            "format": data.get('format', 'pdf'),
            "generated_at": datetime.now().isoformat()
        }

    def log_message(self, format, *args):
        """Override to provide custom logging"""
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

def find_free_port():
    """Find a free port to bind to"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        s.listen(1)
        port = s.getsockname()[1]
    return port

def main():
    print("🌐 InfoScape Demo Backend Server")
    print("=" * 50)
    
    # Try to use port 8000, or find a free port
    try:
        port = 8000
        with socketserver.TCPServer(("", port), InfoScapeHandler) as httpd:
            print(f"✅ Server running on http://localhost:{port}")
            print(f"🔍 API Documentation: http://localhost:{port}/")
            print(f"💚 Health Check: http://localhost:{port}/health")
            print("\nPress Ctrl+C to stop the server")
            print("=" * 50)
            httpd.serve_forever()
    except OSError:
        port = find_free_port()
        with socketserver.TCPServer(("", port), InfoScapeHandler) as httpd:
            print(f"⚠️  Port 8000 busy, using port {port}")
            print(f"✅ Server running on http://localhost:{port}")
            print(f"🔍 API Documentation: http://localhost:{port}/")
            print(f"💚 Health Check: http://localhost:{port}/health")
            print("\nPress Ctrl+C to stop the server")
            print("=" * 50)
            httpd.serve_forever()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n💥 Server error: {str(e)}")
        sys.exit(1)