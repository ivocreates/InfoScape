#!/usr/bin/env python3
"""
Backend test script for InfoScape
Tests if all modules import correctly and basic functionality works
"""

import sys
import os

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing backend imports...")
    
    try:
        from main import app
        print("✓ Main FastAPI app imported successfully")
    except Exception as e:
        print(f"✗ Failed to import main app: {e}")
        return False
    
    try:
        from modules.people_search import PeopleSearchEngine
        print("✓ PeopleSearchEngine imported successfully")
    except Exception as e:
        print(f"✗ Failed to import PeopleSearchEngine: {e}")
        return False
    
    try:
        from modules.reverse_lookup import ReverseLookupEngine
        print("✓ ReverseLookupEngine imported successfully")
    except Exception as e:
        print(f"✗ Failed to import ReverseLookupEngine: {e}")
        return False
    
    try:
        from modules.social_intel import SocialIntelligence
        print("✓ SocialIntelligence imported successfully")
    except Exception as e:
        print(f"✗ Failed to import SocialIntelligence: {e}")
        return False
    
    try:
        from modules.domain_intel import DomainIntelligence
        print("✓ DomainIntelligence imported successfully")
    except Exception as e:
        print(f"✗ Failed to import DomainIntelligence: {e}")
        return False
    
    try:
        from modules.data_correlation import DataCorrelationEngine
        print("✓ DataCorrelationEngine imported successfully")
    except Exception as e:
        print(f"✗ Failed to import DataCorrelationEngine: {e}")
        return False
    
    try:
        from modules.osint_tools import OSINTToolsManager
        print("✓ OSINTToolsManager imported successfully")
    except Exception as e:
        print(f"✗ Failed to import OSINTToolsManager: {e}")
        return False
    
    try:
        from modules.report_generator import ReportGenerator
        print("✓ ReportGenerator imported successfully")
    except Exception as e:
        print(f"✗ Failed to import ReportGenerator: {e}")
        return False
    
    try:
        from database.db_manager import DatabaseManager
        print("✓ DatabaseManager imported successfully")
    except Exception as e:
        print(f"✗ Failed to import DatabaseManager: {e}")
        return False
    
    try:
        from utils.validators import validate_input
        print("✓ Validators imported successfully")
    except Exception as e:
        print(f"✗ Failed to import validators: {e}")
        return False
    
    try:
        from utils.logger import setup_logger
        print("✓ Logger imported successfully")
    except Exception as e:
        print(f"✗ Failed to import logger: {e}")
        return False
    
    return True

def test_basic_functionality():
    """Test basic functionality of key components"""
    print("\nTesting basic functionality...")
    
    try:
        from modules.people_search import PeopleSearchEngine
        engine = PeopleSearchEngine()
        print("✓ PeopleSearchEngine instantiated successfully")
    except Exception as e:
        print(f"✗ Failed to instantiate PeopleSearchEngine: {e}")
        return False
    
    try:
        from modules.osint_tools import OSINTToolsManager
        tools = OSINTToolsManager()
        supported_tools = tools.get_supported_tools()
        print(f"✓ OSINTToolsManager instantiated, supports {len(supported_tools)} tools")
    except Exception as e:
        print(f"✗ Failed to instantiate OSINTToolsManager: {e}")
        return False
    
    try:
        from database.db_manager import DatabaseManager
        db = DatabaseManager()
        print("✓ DatabaseManager instantiated successfully")
    except Exception as e:
        print(f"✗ Failed to instantiate DatabaseManager: {e}")
        return False
    
    return True

def test_api_routes():
    """Test if API routes are defined correctly"""
    print("\nTesting API routes...")
    
    try:
        from main import app
        routes = [route.path for route in app.routes]
        print(f"✓ FastAPI app has {len(routes)} routes defined")
        
        # Check for key routes
        expected_routes = ["/", "/health", "/api/search/people", "/api/search/reverse-lookup"]
        for route in expected_routes:
            if any(route in r for r in routes):
                print(f"  ✓ Route {route} found")
            else:
                print(f"  ⚠ Route {route} not found")
        
    except Exception as e:
        print(f"✗ Failed to test API routes: {e}")
        return False
    
    return True

def main():
    """Run all tests"""
    print("=" * 60)
    print("InfoScape Backend Test Suite")
    print("=" * 60)
    
    success = True
    
    # Test imports
    if not test_imports():
        success = False
    
    # Test basic functionality
    if not test_basic_functionality():
        success = False
    
    # Test API routes
    if not test_api_routes():
        success = False
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 All tests passed! Backend is ready.")
        print("You can now start the backend with: python main.py")
    else:
        print("❌ Some tests failed. Please check the errors above.")
    print("=" * 60)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
