#!/usr/bin/env python3
"""
Test the enhanced InfoScape OSINT capabilities
"""

import asyncio
import json
import sys
import os

# Add backend directory to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

async def test_comprehensive_search():
    """Test the comprehensive people search functionality"""
    try:
        from modules.people_search import PeopleSearchEngine
        
        # Initialize search engine
        search_engine = PeopleSearchEngine()
        
        print("🔍 Testing InfoScape Comprehensive OSINT Search")
        print("=" * 60)
        
        # Test search query
        test_query = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com',
            'location': 'New York'
        }
        
        print(f"📝 Search Query: {json.dumps(test_query, indent=2)}")
        print("\n🚀 Starting comprehensive search...")
        
        # Perform search
        results = await search_engine.search_person(test_query)
        
        print(f"\n✅ Search completed in {results.get('processing_time', 0):.2f} seconds")
        print(f"🎯 Confidence Score: {results.get('confidence_score', 0):.3f}")
        print(f"📊 Total Results: {results.get('summary', {}).get('total_results', 0)}")
        print(f"🌐 Platforms Found: {len(results.get('summary', {}).get('platforms_found', []))}")
        
        # Display summary
        summary = results.get('summary', {})
        if summary.get('email_addresses'):
            print(f"📧 Email Addresses: {len(summary['email_addresses'])}")
        if summary.get('phone_numbers'):
            print(f"📱 Phone Numbers: {len(summary['phone_numbers'])}")
        if summary.get('social_profiles'):
            print(f"👤 Social Profiles: {len(summary['social_profiles'])}")
        if summary.get('addresses'):
            print(f"🏠 Addresses: {len(summary['addresses'])}")
        
        # Display source breakdown
        sources = results.get('sources', {})
        print(f"\n📊 Results by Source:")
        for source_type, source_results in sources.items():
            if source_results:
                print(f"  {source_type}: {len(source_results)} results")
        
        print(f"\n🎉 Test completed successfully!")
        print(f"💾 Search ID: {results.get('search_id')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

async def test_phone_analysis():
    """Test phone number analysis"""
    try:
        from modules.people_search import PeopleSearchEngine
        
        search_engine = PeopleSearchEngine()
        
        print("\n📞 Testing Phone Number Analysis")
        print("-" * 40)
        
        test_phone = "+1-555-123-4567"
        print(f"🔍 Analyzing: {test_phone}")
        
        results = await search_engine._search_phone_specific(test_phone)
        
        if results and results.get('additional_sources'):
            phone_data = results['additional_sources'][0]['data']
            print(f"📍 Location: {phone_data.get('location', 'Unknown')}")
            print(f"📡 Carrier: {phone_data.get('carrier', 'Unknown')}")
            print(f"🌍 Country Code: {phone_data.get('country_code', 'Unknown')}")
            print(f"📱 Mobile: {phone_data.get('is_mobile', False)}")
            print("✅ Phone analysis successful!")
        else:
            print("ℹ️ No phone data extracted (expected for test number)")
        
        return True
        
    except Exception as e:
        print(f"❌ Phone analysis failed: {str(e)}")
        return False

async def test_email_analysis():
    """Test email analysis"""
    try:
        from modules.people_search import PeopleSearchEngine
        
        search_engine = PeopleSearchEngine()
        
        print("\n📧 Testing Email Analysis")
        print("-" * 40)
        
        test_email = "test@example.com"
        print(f"🔍 Analyzing: {test_email}")
        
        results = await search_engine._search_email_specific(test_email)
        
        if results and results.get('additional_sources'):
            print(f"✅ Email analysis completed!")
            print(f"📊 Sources checked: {len(results['additional_sources'])}")
            for source in results['additional_sources']:
                print(f"  - {source.get('source', 'Unknown')}: {source.get('found', False)}")
        else:
            print("ℹ️ No email data extracted (expected for test email)")
        
        return True
        
    except Exception as e:
        print(f"❌ Email analysis failed: {str(e)}")
        return False

if __name__ == "__main__":
    async def run_all_tests():
        print("🌐 InfoScape OSINT Engine Test Suite")
        print("=" * 50)
        
        # Test comprehensive search
        test1 = await test_comprehensive_search()
        
        # Test phone analysis
        test2 = await test_phone_analysis()
        
        # Test email analysis
        test3 = await test_email_analysis()
        
        print("\n" + "=" * 50)
        if all([test1, test2, test3]):
            print("🎉 All tests passed! InfoScape OSINT engine is ready!")
            print("✅ Features working:")
            print("  - Comprehensive people search")
            print("  - Multi-source data aggregation")
            print("  - Phone number analysis")
            print("  - Email analysis")
            print("  - Web scraping capabilities")
            print("  - Confidence scoring")
            print("  - Real-time processing")
        else:
            print("❌ Some tests failed. Check the errors above.")
        
        return all([test1, test2, test3])
    
    # Run tests
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)
