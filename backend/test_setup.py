#!/usr/bin/env python3
"""
InfoScape Quick Test Script
Tests the basic functionality and setup of InfoScape components
"""

import asyncio
import sys
import os
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

async def test_database():
    """Test database connection and initialization"""
    try:
        from database.db_manager import DatabaseManager
        
        print("🔍 Testing database connection...")
        db = DatabaseManager()
        await db.initialize()
        await db.check_connection()
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False

async def test_modules():
    """Test module imports"""
    try:
        print("🔍 Testing module imports...")
        
        # Test individual modules
        from modules.people_search import PeopleSearchEngine
        from modules.reverse_lookup import ReverseLookupEngine
        from modules.social_intel import SocialIntelligence
        from modules.domain_intel import DomainIntelligence
        from modules.data_correlation import DataCorrelationEngine
        from modules.osint_tools import OSINTToolsManager
        from modules.report_generator import ReportGenerator
        
        print("✅ All modules imported successfully")
        return True
    except Exception as e:
        print(f"❌ Module import test failed: {e}")
        return False

async def test_api_startup():
    """Test if the API can start without errors"""
    try:
        print("🔍 Testing API startup...")
        
        # Import FastAPI app
        from main import app
        
        print("✅ API startup test successful")
        return True
    except Exception as e:
        print(f"❌ API startup test failed: {e}")
        return False

async def main():
    """Run all tests"""
    print("🌐 InfoScape Quick Test Suite")
    print("=" * 40)
    
    tests = [
        ("Database", test_database),
        ("Modules", test_modules),
        ("API Startup", test_api_startup)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n📋 Running {test_name} test...")
        result = await test_func()
        results.append((test_name, result))
    
    print("\n" + "=" * 40)
    print("📊 Test Results:")
    
    all_passed = True
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {test_name}: {status}")
        if not result:
            all_passed = False
    
    print("\n" + "=" * 40)
    if all_passed:
        print("🎉 All tests passed! InfoScape is ready to run.")
        print("\n🚀 To start InfoScape:")
        print("   Backend: python main.py")
        print("   Frontend: cd ../electron-app && npm start")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
        print("💡 Common fixes:")
        print("   - Run: pip install -r requirements.txt")
        print("   - Check Python version (3.10+ required)")
        print("   - Ensure all files are in correct directories")

if __name__ == "__main__":
    asyncio.run(main())
