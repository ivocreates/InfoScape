#!/usr/bin/env python3
"""
Quick import test for fixed modules
"""

import sys
import os

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    try:
        print("Testing imports after fixes...")
        
        # Test utils imports
        from utils.logger import setup_logger
        from utils.data_sources import DataSourceManager
        from utils.confidence_scoring import ConfidenceCalculator
        print("✓ Utils imports successful")
        
        # Test modules imports
        from modules.people_search import PeopleSearchEngine
        from modules.data_correlation import DataCorrelationEngine
        print("✓ Modules imports successful")
        
        # Test logger initialization
        logger = setup_logger("TestLogger")
        print("✓ Logger initialization successful")
        
        # Test basic functionality
        dsm = DataSourceManager()
        cc = ConfidenceCalculator()
        pse = PeopleSearchEngine()
        print("✓ Component initialization successful")
        
        print("\n🎉 All tests passed! Ready to run main.py")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_imports()
