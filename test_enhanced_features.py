#!/usr/bin/env python3
"""
Test script to demonstrate enhanced Google dorking and person classification features
"""

import sys
import os
import json
from datetime import datetime

# Add backend path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

def test_enhanced_google_dorking():
    """Test the enhanced Google dorking engine"""
    print("🔍 Testing Enhanced Google Dorking Engine")
    print("=" * 50)
    
    try:
        from utils.google_dorking import GoogleDorkingEngine
        
        engine = GoogleDorkingEngine()
        
        # Test different scenarios
        test_cases = [
            {
                'name': 'Common Name - US Professional',
                'params': {
                    'full_name': 'John Smith',
                    'country': 'United States',
                    'company': 'Google',
                    'occupation': 'Software Engineer',
                    'age': '30'
                }
            },
            {
                'name': 'International Search - European',
                'params': {
                    'full_name': 'Maria Garcia',
                    'country': 'Spain',
                    'education': 'Universidad Complutense Madrid',
                    'occupation': 'Data Scientist'
                }
            },
            {
                'name': 'Asian Professional',
                'params': {
                    'full_name': 'Takeshi Yamamoto',
                    'country': 'Japan',
                    'company': 'Sony',
                    'occupation': 'Product Manager'
                }
            }
        ]
        
        for test_case in test_cases:
            print(f"\n📋 Test Case: {test_case['name']}")
            print("-" * 30)
            
            dorks = engine.generate_person_dorks(test_case['params'])
            summary = engine.generate_dork_summary(dorks)
            
            print(f"✅ Generated: {summary['total']} dorks")
            print(f"📊 Categories: {len(summary['categories'])}")
            print(f"🎯 High Priority: {summary['high_priority_count']}")
            print(f"🔒 High Confidence: {summary['high_confidence_count']}")
            
            print("\n🔝 Top 5 Dorks:")
            for i, dork in enumerate(dorks[:5]):
                category = dork.get('category', 'unknown')
                confidence = dork.get('confidence', 0)
                priority = dork.get('priority', 0)
                print(f"  {i+1}. [{category}] {dork['query'][:80]}...")
                print(f"     Priority: {priority}, Confidence: {confidence:.2f}")
            
            # Show category breakdown
            print(f"\n📈 Category Breakdown:")
            for category, count in summary['categories'].items():
                print(f"  • {category.replace('_', ' ').title()}: {count}")
        
        print(f"\n🌍 Worldwide Coverage:")
        countries = engine.get_supported_countries()
        print(f"✅ Supported Countries: {len(countries)}")
        print(f"🗺️  Sample Countries: {', '.join(countries[:10])}...")
        
        print(f"\n📋 Available Categories:")
        categories = engine.get_dork_categories()
        print(f"✅ Total Categories: {len(categories)}")
        for category in categories:
            print(f"  • {category.replace('_', ' ').title()}")
            
        return True
        
    except Exception as e:
        print(f"❌ Error testing Google dorking: {str(e)}")
        return False

def test_person_classification():
    """Test the person classification engine"""
    print("\n\n🧠 Testing Person Classification Engine")
    print("=" * 50)
    
    try:
        from utils.person_classification import PersonClassificationEngine
        
        engine = PersonClassificationEngine()
        
        # Mock search results for testing
        mock_results = {
            'sources': {
                'social_media': [
                    {
                        'platform': 'LinkedIn',
                        'url': 'https://linkedin.com/in/john-smith-google',
                        'title': 'John Smith - Software Engineer at Google',
                        'description': 'Experienced software engineer in Mountain View, CA',
                        'confidence': 0.85,
                        'metadata': {
                            'platform': 'LinkedIn',
                            'company': 'Google',
                            'location': 'Mountain View, CA'
                        }
                    }
                ],
                'professional_networks': [
                    {
                        'platform': 'GitHub',
                        'url': 'https://github.com/jsmith-dev',
                        'title': 'John Smith (@jsmith-dev)',
                        'description': 'Software Engineer at Google. Python, JavaScript, Machine Learning.',
                        'confidence': 0.75,
                        'metadata': {
                            'platform': 'GitHub',
                            'company': 'Google'
                        }
                    }
                ]
            }
        }
        
        target_criteria = {
            'name': 'John Smith',
            'company': 'Google',
            'location': 'California',
            'occupation': 'Software Engineer'
        }
        
        print(f"🎯 Target: {target_criteria['name']} at {target_criteria['company']}")
        
        # Classify and disambiguate
        results = engine.classify_and_disambiguate_results(mock_results, target_criteria)
        
        print(f"\n📊 Classification Results:")
        print(f"✅ Disambiguation Level: {results.get('disambiguation_level', 'unknown')}")
        print(f"🔍 Unique Identities: {results['classification_metadata']['unique_identities_detected']}")
        print(f"🎯 High Confidence: {results['classification_metadata']['high_confidence_matches']}")
        
        confidence_analysis = results.get('confidence_analysis', {})
        print(f"\n🔒 Confidence Analysis:")
        print(f"  • Overall Confidence: {confidence_analysis.get('overall_confidence', 0):.2f}")
        print(f"  • Reliability: {confidence_analysis.get('reliability', 'unknown')}")
        
        if results.get('recommendations'):
            print(f"\n💡 Recommendations:")
            for rec in results['recommendations'][:3]:
                print(f"  • {rec}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing person classification: {str(e)}")
        return False

def test_integration():
    """Test integration between components"""
    print("\n\n🔗 Testing Component Integration")
    print("=" * 50)
    
    try:
        from modules.people_search import PeopleSearchEngine
        
        # This would test the integration but requires more setup
        print("✅ Import successful - Integration framework ready")
        print("🔧 Note: Full integration test requires database setup")
        return True
        
    except Exception as e:
        print(f"❌ Error testing integration: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("🚀 InfoScape Enhanced Features Test Suite")
    print("=" * 60)
    print(f"⏰ Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tests = [
        test_enhanced_google_dorking,
        test_person_classification,
        test_integration
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test failed with error: {str(e)}")
            results.append(False)
    
    print("\n\n📋 Test Summary")
    print("=" * 30)
    print(f"✅ Passed: {sum(results)}/{len(results)}")
    print(f"❌ Failed: {len(results) - sum(results)}/{len(results)}")
    
    if all(results):
        print("\n🎉 All tests passed! Enhanced features are working correctly.")
        return 0
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    exit(main())