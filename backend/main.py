from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
import asyncio
import uvicorn
from datetime import datetime
import json
import os
from pathlib import Path

# Import custom modules
from modules.people_search import PeopleSearchEngine
from modules.reverse_lookup import ReverseLookupEngine
from modules.social_intel import SocialIntelligence
from modules.domain_intel import DomainIntelligence
from modules.data_correlation import DataCorrelationEngine
from modules.osint_tools import OSINTToolsManager
from modules.report_generator import ReportGenerator
from database.db_manager import DatabaseManager
from utils.validators import validate_input
from utils.logger import setup_logger

app = FastAPI(
    title="InfoScape OSINT API",
    description="Advanced OSINT Intelligence Toolkit API",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
logger = setup_logger("InfoScape.Main")
db_manager = DatabaseManager()
people_search = PeopleSearchEngine()
reverse_lookup = ReverseLookupEngine()
social_intel = SocialIntelligence()
domain_intel = DomainIntelligence()
correlation_engine = DataCorrelationEngine()
osint_tools = OSINTToolsManager()
report_gen = ReportGenerator()

# Pydantic models
class SearchRequest(BaseModel):
    query_type: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    domain: Optional[str] = None
    ip_address: Optional[str] = None
    social_profiles: Optional[List[str]] = []
    advanced_options: Optional[Dict[str, Any]] = {}

class InvestigationSession(BaseModel):
    session_id: str
    name: str
    description: Optional[str] = None
    targets: List[SearchRequest]
    created_at: datetime
    updated_at: datetime

@app.on_startup
async def startup_event():
    """Initialize database and components on startup"""
    await db_manager.initialize()
    logger.info("InfoScape OSINT API started successfully")

@app.get("/")
async def root():
    """API health check and information"""
    return {
        "name": "InfoScape OSINT API",
        "version": "2.0.0",
        "status": "operational",
        "features": [
            "Advanced People Search",
            "Reverse Phone/Email Lookup",
            "Social Media Intelligence", 
            "Domain & IP Intelligence",
            "Data Correlation & Analysis",
            "Multi-tool OSINT Integration",
            "Report Generation & Export"
        ],
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Simple health check endpoint"""
    try:
        # Check database connection
        await db_manager.check_connection()
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "services": {
                "database": "connected",
                "api": "running",
                "osint_tools": "ready"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

@app.post("/api/search/people")
async def search_people(request: SearchRequest, background_tasks: BackgroundTasks):
    """Comprehensive people search across multiple OSINT sources - ZabaSearch equivalent"""
    try:
        # Validate input
        if not any([request.first_name, request.last_name, request.email, request.phone, request.username]):
            raise HTTPException(status_code=400, detail="At least one search parameter is required")
        
        # Prepare comprehensive search query
        search_query = {
            'first_name': request.first_name,
            'last_name': request.last_name,
            'email': request.email,
            'phone': request.phone,
            'username': request.username,
            'location': request.location,
        }
        
        # Remove None values
        search_query = {k: v for k, v in search_query.items() if v is not None}
        
        # Configure advanced search options
        search_options = {
            'search_engines': True,
            'social_media': True,
            'public_records': True,
            'professional_networks': True,
            'people_search_sites': True,
            'deep_search': request.advanced_options.get('deep_search', True),
            'include_images': request.advanced_options.get('include_images', True),
            'include_documents': request.advanced_options.get('include_documents', True),
            'correlate_data': request.advanced_options.get('correlate_data', True)
        }
        
        logger.info(f"Starting comprehensive OSINT search for: {search_query}")
        
        # Perform the comprehensive search
        results = await people_search.search_person(search_query, search_options)
        
        # Store results in database for later retrieval
        search_id = results.get('search_id')
        await db_manager.store_search_results(search_id, search_query, results)
        
        # Run background correlation if requested
        if search_options.get('correlate_data'):
            background_tasks.add_task(
                correlation_engine.correlate_entities,
                results.get('sources', {})
            )
        
        # Return comprehensive results immediately
        return {
            "success": True,
            "search_id": search_id,
            "query": search_query,
            "results": results,
            "summary": {
                "total_results": results.get('summary', {}).get('total_results', 0),
                "platforms_found": results.get('summary', {}).get('platforms_found', []),
                "high_confidence_matches": results.get('summary', {}).get('high_confidence_matches', 0),
                "email_addresses": results.get('summary', {}).get('email_addresses', []),
                "phone_numbers": results.get('summary', {}).get('phone_numbers', []),
                "social_profiles": results.get('summary', {}).get('social_profiles', []),
                "addresses": results.get('summary', {}).get('addresses', [])
            },
            "confidence_score": results.get('confidence_score', 0),
            "processing_time": results.get('processing_time', 0),
            "message": f"Found {results.get('summary', {}).get('total_results', 0)} results across {len(results.get('summary', {}).get('platforms_found', []))} platforms",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Comprehensive people search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.post("/api/search/reverse")
async def reverse_lookup(request: SearchRequest):
    """Reverse lookup for phone numbers, emails, and addresses"""
    try:
        validate_input(request)
        
        results = await reverse_lookup.comprehensive_lookup(request)
        
        return {
            "success": True,
            "results": results,
            "sources_checked": results.get("sources_used", []),
            "confidence_score": results.get("confidence", 0)
        }
        
    except Exception as e:
        logger.error(f"Reverse lookup error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/intel/social")
async def social_intelligence(request: SearchRequest, background_tasks: BackgroundTasks):
    """Advanced social media intelligence gathering"""
    try:
        validate_input(request)
        
        # Multi-platform social intel
        intel_id = await social_intel.gather_intelligence(request)
        
        # Background deep analysis
        background_tasks.add_task(
            social_intel.deep_profile_analysis,
            intel_id,
            request
        )
        
        return {
            "intel_id": intel_id,
            "status": "gathering",
            "platforms_scanning": [
                "Facebook", "Twitter", "Instagram", "LinkedIn",
                "TikTok", "YouTube", "Snapchat", "Pinterest",
                "Reddit", "Discord", "Telegram", "WhatsApp"
            ]
        }
        
    except Exception as e:
        logger.error(f"Social intelligence error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/intel/domain")
async def domain_intelligence(request: SearchRequest):
    """Comprehensive domain and IP intelligence"""
    try:
        validate_input(request)
        
        intel = await domain_intel.analyze_domain(request)
        
        return {
            "success": True,
            "domain_info": intel.get("domain_details", {}),
            "subdomains": intel.get("subdomains", []),
            "ip_info": intel.get("ip_details", {}),
            "dns_records": intel.get("dns", {}),
            "whois_data": intel.get("whois", {}),
            "security_scan": intel.get("security", {}),
            "historical_data": intel.get("historical", {})
        }
        
    except Exception as e:
        logger.error(f"Domain intelligence error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search/status/{search_id}")
async def get_search_status(search_id: str):
    """Get status of ongoing search operations"""
    try:
        status = await db_manager.get_search_status(search_id)
        
        if not status:
            raise HTTPException(status_code=404, detail="Search ID not found")
            
        return status
        
    except Exception as e:
        logger.error(f"Status check error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/results/{search_id}")
async def get_results(search_id: str):
    """Retrieve comprehensive search results"""
    try:
        results = await db_manager.get_search_results(search_id)
        
        if not results:
            raise HTTPException(status_code=404, detail="Results not found")
            
        # Apply correlation and scoring
        enhanced_results = await correlation_engine.enhance_results(results)
        
        return {
            "search_id": search_id,
            "results": enhanced_results,
            "correlation_insights": enhanced_results.get("insights", {}),
            "confidence_metrics": enhanced_results.get("confidence", {}),
            "data_sources": enhanced_results.get("sources", [])
        }
        
    except Exception as e:
        logger.error(f"Results retrieval error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tools/run")
async def run_osint_tool(tool_name: str, parameters: Dict[str, Any]):
    """Execute specific OSINT tools with parameters"""
    try:
        result = await osint_tools.execute_tool(tool_name, parameters)
        
        return {
            "tool": tool_name,
            "status": "completed",
            "results": result,
            "execution_time": result.get("execution_time", 0)
        }
        
    except Exception as e:
        logger.error(f"Tool execution error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tools/available")
async def get_available_tools():
    """List all available OSINT tools and their capabilities"""
    return await osint_tools.get_available_tools()

@app.post("/api/reports/generate")
async def generate_report(search_id: str, format: str = "pdf"):
    """Generate comprehensive investigation reports"""
    try:
        report_data = await db_manager.get_search_results(search_id)
        
        if not report_data:
            raise HTTPException(status_code=404, detail="Search data not found")
            
        report_path = await report_gen.generate_report(
            report_data, 
            format=format,
            search_id=search_id
        )
        
        return {
            "success": True,
            "report_path": report_path,
            "format": format,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Report generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sessions/create")
async def create_investigation_session(session: InvestigationSession):
    """Create new investigation session"""
    try:
        session_id = await db_manager.create_session(session)
        
        return {
            "session_id": session_id,
            "status": "created",
            "message": "Investigation session created successfully"
        }
        
    except Exception as e:
        logger.error(f"Session creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sessions/{session_id}")
async def get_investigation_session(session_id: str):
    """Retrieve investigation session with all associated data"""
    try:
        session = await db_manager.get_session(session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
            
        return session
        
    except Exception as e:
        logger.error(f"Session retrieval error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
