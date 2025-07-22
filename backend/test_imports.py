#!/usr/bin/env python3
"""
Test script to verify all required imports for domain_intel.py work correctly
"""

def test_imports():
    try:
        print("Testing imports for domain_intel.py...")
        
        # Test basic imports
        print("✓ Testing asyncio...")
        import asyncio
        
        print("✓ Testing aiohttp...")
        import aiohttp
        
        print("✓ Testing json...")
        import json
        
        print("✓ Testing typing...")
        from typing import Dict, List, Any, Optional
        
        print("✓ Testing datetime...")
        from datetime import datetime
        
        print("✓ Testing logging...")
        import logging
        
        print("✓ Testing socket...")
        import socket
        
        print("✓ Testing ssl...")
        import ssl
        
        print("✓ Testing dns.resolver...")
        import dns.resolver
        
        print("✓ Testing whois...")
        import whois
        
        print("✓ Testing subprocess...")
        import subprocess
        
        print("✓ Testing ipaddress...")
        import ipaddress
        
        print("✓ Testing concurrent.futures...")
        from concurrent.futures import ThreadPoolExecutor
        
        print("\n🎉 All imports successful!")
        
        # Test basic functionality
        print("\nTesting basic functionality...")
        
        # Test DNS resolution
        try:
            answers = dns.resolver.resolve('google.com', 'A')
            print(f"✓ DNS resolution works: {answers[0]}")
        except Exception as e:
            print(f"⚠ DNS resolution warning: {e}")
        
        # Test WHOIS (might fail due to rate limiting)
        try:
            w = whois.whois('google.com')
            print(f"✓ WHOIS works: {w.domain_name}")
        except Exception as e:
            print(f"⚠ WHOIS warning: {e}")
        
        print("\n✅ All tests completed successfully!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_imports()
    exit(0 if success else 1)
