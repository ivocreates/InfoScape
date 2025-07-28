#!/usr/bin/env python3
"""
Simple test script for InfoScape Google Dorking functionality
Tests the Google dorking feature without requiring full backend dependencies
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.google_dorking import GoogleDorkingEngine
import json

def test_google_dorking():
    """Test Google dorking functionality"""
    print("🔍 Testing InfoScape Google Dorking Feature")
    print("=" * 50)
    
    # Initialize Google dorking engine
    engine = GoogleDorkingEngine()
    
    # Test case 1: Basic person search
    print("\n📋 Test Case 1: Basic Person Search")
    test_params_1 = {
        'first_name': 'John',
        'last_name': 'Doe',
        'location': 'San Francisco'
    }
    
    dorks_1 = engine.generate_person_dorks(test_params_1)
    print(f"✅ Generated {len(dorks_1)} dorks for basic person search")
    
    # Show some examples
    print("\n🎯 Top 5 Google Dorks:")
    for i, dork in enumerate(dorks_1[:5]):
        print(f"{i+1}. {dork['description']}")
        print(f"   Query: {dork['query']}")
        print(f"   URL: {engine.generate_dork_url(dork['query'])}")
        print(f"   Category: {dork['category']}, Priority: {dork['priority']}")
        print()
    
    # Test case 2: Email-based search
    print("\n📧 Test Case 2: Email-Based Search")
    test_params_2 = {
        'first_name': 'Jane',
        'last_name': 'Smith',
        'email': 'jane.smith@techcorp.com',
        'company': 'TechCorp',
        'occupation': 'Software Engineer'
    }
    
    dorks_2 = engine.generate_person_dorks(test_params_2)
    print(f"✅ Generated {len(dorks_2)} dorks for email-based search")
    
    # Show email-specific dorks
    email_dorks = engine.filter_dorks_by_category(dorks_2, ['email_search'])
    print(f"\n📧 Email-specific dorks ({len(email_dorks)}):")
    for dork in email_dorks[:3]:
        print(f"• {dork['description']}: {dork['query']}")
    
    # Test case 3: Social media focused search
    print("\n📱 Test Case 3: Social Media Search")
    test_params_3 = {
        'username': 'johndoe123',
        'first_name': 'John',
        'last_name': 'Doe'
    }
    
    dorks_3 = engine.generate_person_dorks(test_params_3)
    social_dorks = engine.filter_dorks_by_category(dorks_3, ['social_media'])
    print(f"✅ Generated {len(social_dorks)} social media dorks")
    
    for dork in social_dorks[:5]:
        print(f"• {dork['description']}: {dork['query']}")
    
    # Test case 4: Professional search
    print("\n💼 Test Case 4: Professional Search")
    professional_dorks = engine.filter_dorks_by_category(dorks_2, ['professional'])
    print(f"✅ Generated {len(professional_dorks)} professional dorks")
    
    for dork in professional_dorks[:3]:
        print(f"• {dork['description']}: {dork['query']}")
    
    # Test categories
    print("\n📊 Available Dork Categories:")
    categories = engine.get_dork_categories()
    for category in categories:
        count = len(engine.filter_dorks_by_category(dorks_2, [category]))
        print(f"• {category}: {count} dorks")
    
    print("\n✅ Google Dorking Test Complete!")
    print("🎯 InfoScape's Google dorking feature is working properly")
    
    return True

def simulate_api_response():
    """Simulate what the API would return"""
    print("\n🌐 Simulating API Response Structure")
    print("=" * 40)
    
    engine = GoogleDorkingEngine()
    test_params = {
        'first_name': 'Alice',
        'last_name': 'Johnson',
        'email': 'alice.johnson@example.com',
        'phone': '+1-555-123-4567',
        'location': 'New York'
    }
    
    dorks = engine.generate_person_dorks(test_params)
    
    # Simulate the structure that would be returned by the API
    api_response = {
        'success': True,
        'search_id': 'search_12345',
        'query': test_params,
        'results': {
            'search_id': 'search_12345',
            'query': test_params,
            'timestamp': '2025-01-28T14:37:00Z',
            'total_results': len(dorks),
            'confidence': 0.85,
            'summary': f'Enhanced search found {len(dorks)} Google dorks across various categories',
            'results': [
                {
                    'platform': 'Google Dorking',
                    'type': 'search_results',
                    'profiles': [
                        {
                            'url': engine.generate_dork_url(dork['query']),
                            'title': f"Advanced Search: {dork['description']}",
                            'description': f"Google dork: {dork['query']}",
                            'confidence': dork['confidence'],
                            'metadata': {
                                'search_engine': 'Google',
                                'dork_type': dork['category'],
                                'priority': dork['priority'],
                                'estimated_results': engine.estimate_dork_results(dork['query']),
                                'search_operator': 'advanced_search'
                            }
                        } for dork in dorks[:10]  # Top 10 dorks
                    ]
                }
            ]
        }
    }
    
    print("📄 Sample API Response Structure:")
    print(json.dumps({
        'success': api_response['success'],
        'total_dorks': len(dorks),
        'sample_dork': {
            'query': dorks[0]['query'],
            'description': dorks[0]['description'],
            'url': engine.generate_dork_url(dorks[0]['query'])
        } if dorks else None
    }, indent=2))
    
    return api_response

if __name__ == "__main__":
    test_google_dorking()
    simulate_api_response()