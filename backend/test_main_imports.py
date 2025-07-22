#!/usr/bin/env python3
"""
Test all imports to verify they work correctly
"""

def test_all_imports():
    try:
        print("Testing main.py imports...")
        
        # Test individual imports
        print("✓ Testing FastAPI imports...")
        from fastapi import FastAPI, HTTPException, BackgroundTasks
        from fastapi.middleware.cors import CORSMiddleware
        from pydantic import BaseModel, EmailStr
        
        print("✓ Testing standard library imports...")
        from typing import List, Optional, Dict, Any
        import asyncio
        import uvicorn
        from datetime import datetime
        import json
        import os
        from pathlib import Path
        
        print("✓ Testing custom module imports...")
        from modules.people_search import PeopleSearchEngine
        from modules.reverse_lookup import ReverseLookupEngine
        from modules.social_intel import SocialIntelligence
        from modules.domain_intel import DomainIntelligence
        from modules.data_correlation import DataCorrelationEngine
        from modules.osint_tools import OSINTToolsManager
        from modules.report_generator import ReportGenerator
        
        print("✓ Testing database imports...")
        from database.db_manager import DatabaseManager
        
        print("✓ Testing utils imports...")
        from utils.validators import validate_input
        from utils.logger import setup_logger
        
        print("✓ Testing logger initialization...")
        logger = setup_logger("Test")
        
        print("✓ Testing component initialization...")
        db_manager = DatabaseManager()
        people_search = PeopleSearchEngine()
        
        print("\n🎉 All imports and initializations successful!")
        print("✅ InfoScape backend is ready to run!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("InfoScape Backend Import Test")
    print("=" * 40)
    success = test_all_imports()
    if success:
        print("\n✅ Ready to run: python main.py")
    else:
        print("\n❌ Fix the errors above before running main.py")
