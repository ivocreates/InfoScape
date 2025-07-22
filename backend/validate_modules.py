#!/usr/bin/env python3
"""
Quick validation for newly created modules
"""

def test_new_modules():
    try:
        print("Testing newly created modules...")
        
        # Test DataSourceManager
        from utils.data_sources import DataSourceManager
        dsm = DataSourceManager()
        print("✓ DataSourceManager imported and instantiated")
        
        # Test ConfidenceCalculator
        from utils.confidence_scoring import ConfidenceCalculator
        cc = ConfidenceCalculator()
        print("✓ ConfidenceCalculator imported and instantiated")
        
        # Test confidence calculation
        test_data = {
            'source': 'hunter_io',
            'timestamp': '2024-01-01T00:00:00Z',
            'data': {'email': 'test@example.com'},
            'response_time': 2.0
        }
        confidence = cc.calculate_confidence(test_data)
        print(f"✓ Confidence calculation works: {confidence:.3f}")
        
        # Test PeopleSearchEngine with new dependencies
        from modules.people_search import PeopleSearchEngine
        pse = PeopleSearchEngine()
        print("✓ PeopleSearchEngine imported with new dependencies")
        
        print("\n🎉 All new modules working correctly!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_new_modules()
