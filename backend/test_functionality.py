#!/usr/bin/env python3
"""
Minimal test to verify backend functionality without external dependencies
"""

import asyncio
import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

async def test_people_search():
    """Test people search functionality"""
    try:
        from modules.people_search import PeopleSearchEngine
        
        search_engine = PeopleSearchEngine()
        
        # Test search
        query = {
            'first_name': 'John',
            'last_name': 'Doe',
            'username': 'johndoe'
        }
        
        options = {
            'search_engines': True,
            'social_media': True,
            'public_records': False
        }
        
        print("Testing People Search...")
        results = await search_engine.search_person(query, options)
        
        print(f"✅ People Search: {results.get('summary', {}).get('total_results', 0)} results")
        return True
        
    except Exception as e:
        print(f"❌ People Search Error: {str(e)}")
        return False

async def test_reverse_lookup():
    """Test reverse lookup functionality"""
    try:
        from modules.reverse_lookup import ReverseLookupEngine
        
        class MockRequest:
            def __init__(self):
                self.phone = "+1-555-123-4567"
                self.email = None
                self.ip_address = None
                self.location = None
        
        lookup_engine = ReverseLookupEngine()
        request = MockRequest()
        
        print("Testing Reverse Lookup...")
        results = await lookup_engine.comprehensive_lookup(request)
        
        print(f"✅ Reverse Lookup: {len(results.get('results', []))} results")
        return True
        
    except Exception as e:
        print(f"❌ Reverse Lookup Error: {str(e)}")
        return False

async def test_domain_intel():
    """Test domain intelligence functionality"""
    try:
        from modules.domain_intel import DomainIntelligence
        
        class MockRequest:
            def __init__(self):
                self.domain = "example.com"
                self.ip_address = None
        
        domain_intel = DomainIntelligence()
        request = MockRequest()
        
        print("Testing Domain Intelligence...")
        results = await domain_intel.analyze_domain(request)
        
        print(f"✅ Domain Intel: Analysis completed for {results.get('target', 'unknown')}")
        return True
        
    except Exception as e:
        print(f"❌ Domain Intel Error: {str(e)}")
        return False

async def main():
    """Run all tests"""
    print("🔍 InfoScape Backend Functionality Test")
    print("=" * 50)
    
    tests = [
        test_people_search(),
        test_reverse_lookup(),
        test_domain_intel(),
    ]
    
    results = await asyncio.gather(*tests, return_exceptions=True)
    
    success_count = sum(1 for result in results if result is True)
    total_tests = len(tests)
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {success_count}/{total_tests} passed")
    
    if success_count == total_tests:
        print("🎉 All backend modules are functional!")
    else:
        print("⚠️  Some modules need attention")
    
    return success_count == total_tests

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"💥 Test execution failed: {str(e)}")
        sys.exit(1)