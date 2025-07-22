import sqlite3
import asyncio
import aiosqlite
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Advanced database manager for OSINT data storage and retrieval"""
    
    def __init__(self, db_path: str = "database/infoscape.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(exist_ok=True)
        
        self.tables = {
            'searches': '''
                CREATE TABLE IF NOT EXISTS searches (
                    id TEXT PRIMARY KEY,
                    search_type TEXT NOT NULL,
                    query_data TEXT NOT NULL,
                    status TEXT DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP NULL,
                    error_message TEXT NULL
                )
            ''',
            'search_results': '''
                CREATE TABLE IF NOT EXISTS search_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    search_id TEXT NOT NULL,
                    source TEXT NOT NULL,
                    data_type TEXT NOT NULL,
                    data TEXT NOT NULL,
                    confidence_score REAL DEFAULT 0.0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (search_id) REFERENCES searches (id)
                )
            ''',
            'profiles': '''
                CREATE TABLE IF NOT EXISTS profiles (
                    id TEXT PRIMARY KEY,
                    platform TEXT NOT NULL,
                    username TEXT,
                    display_name TEXT,
                    profile_url TEXT NOT NULL,
                    profile_image TEXT,
                    bio TEXT,
                    followers INTEGER DEFAULT 0,
                    following INTEGER DEFAULT 0,
                    posts INTEGER DEFAULT 0,
                    verified BOOLEAN DEFAULT FALSE,
                    last_activity TEXT,
                    location TEXT,
                    website TEXT,
                    contact_info TEXT,
                    metadata TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'profile_connections': '''
                CREATE TABLE IF NOT EXISTS profile_connections (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    profile1_id TEXT NOT NULL,
                    profile2_id TEXT NOT NULL,
                    connection_type TEXT NOT NULL,
                    confidence_score REAL DEFAULT 0.0,
                    evidence TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (profile1_id) REFERENCES profiles (id),
                    FOREIGN KEY (profile2_id) REFERENCES profiles (id)
                )
            ''',
            'entities': '''
                CREATE TABLE IF NOT EXISTS entities (
                    id TEXT PRIMARY KEY,
                    entity_type TEXT NOT NULL,
                    name TEXT NOT NULL,
                    aliases TEXT,
                    attributes TEXT,
                    confidence_score REAL DEFAULT 0.0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'entity_relationships': '''
                CREATE TABLE IF NOT EXISTS entity_relationships (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    entity1_id TEXT NOT NULL,
                    entity2_id TEXT NOT NULL,
                    relationship_type TEXT NOT NULL,
                    confidence_score REAL DEFAULT 0.0,
                    evidence TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (entity1_id) REFERENCES entities (id),
                    FOREIGN KEY (entity2_id) REFERENCES entities (id)
                )
            ''',
            'investigation_sessions': '''
                CREATE TABLE IF NOT EXISTS investigation_sessions (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    archived_at TIMESTAMP NULL
                )
            ''',
            'session_searches': '''
                CREATE TABLE IF NOT EXISTS session_searches (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    search_id TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (session_id) REFERENCES investigation_sessions (id),
                    FOREIGN KEY (search_id) REFERENCES searches (id)
                )
            ''',
            'intelligence_reports': '''
                CREATE TABLE IF NOT EXISTS intelligence_reports (
                    id TEXT PRIMARY KEY,
                    session_id TEXT,
                    search_id TEXT,
                    report_type TEXT NOT NULL,
                    format TEXT NOT NULL,
                    file_path TEXT,
                    metadata TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (session_id) REFERENCES investigation_sessions (id),
                    FOREIGN KEY (search_id) REFERENCES searches (id)
                )
            ''',
            'data_breaches': '''
                CREATE TABLE IF NOT EXISTS data_breaches (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL,
                    breach_name TEXT NOT NULL,
                    breach_date TEXT,
                    data_types TEXT,
                    verified BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'domain_intelligence': '''
                CREATE TABLE IF NOT EXISTS domain_intelligence (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    domain TEXT NOT NULL,
                    ip_address TEXT,
                    whois_data TEXT,
                    dns_records TEXT,
                    subdomains TEXT,
                    ssl_certificates TEXT,
                    threat_intelligence TEXT,
                    technologies TEXT,
                    security_scan TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'phone_intelligence': '''
                CREATE TABLE IF NOT EXISTS phone_intelligence (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    phone_number TEXT NOT NULL,
                    formatted_number TEXT,
                    country_code TEXT,
                    country TEXT,
                    region TEXT,
                    carrier TEXT,
                    line_type TEXT,
                    is_valid BOOLEAN DEFAULT FALSE,
                    is_mobile BOOLEAN DEFAULT FALSE,
                    is_voip BOOLEAN DEFAULT FALSE,
                    spam_score REAL DEFAULT 0.0,
                    associated_accounts TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''',
            'correlation_clusters': '''
                CREATE TABLE IF NOT EXISTS correlation_clusters (
                    id TEXT PRIMARY KEY,
                    cluster_type TEXT NOT NULL,
                    confidence_score REAL DEFAULT 0.0,
                    entity_ids TEXT NOT NULL,
                    correlation_factors TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            '''
        }
        
        self.indexes = [
            'CREATE INDEX IF NOT EXISTS idx_searches_status ON searches(status)',
            'CREATE INDEX IF NOT EXISTS idx_search_results_search_id ON search_results(search_id)',
            'CREATE INDEX IF NOT EXISTS idx_search_results_source ON search_results(source)',
            'CREATE INDEX IF NOT EXISTS idx_profiles_platform ON profiles(platform)',
            'CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username)',
            'CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type)',
            'CREATE INDEX IF NOT EXISTS idx_sessions_status ON investigation_sessions(status)',
            'CREATE INDEX IF NOT EXISTS idx_domain_intel_domain ON domain_intelligence(domain)',
            'CREATE INDEX IF NOT EXISTS idx_phone_intel_number ON phone_intelligence(phone_number)'
        ]
    
    async def initialize(self):
        """Initialize database with required tables and indexes"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                # Create tables
                for table_name, table_sql in self.tables.items():
                    await db.execute(table_sql)
                    logger.debug(f"Created/verified table: {table_name}")
                
                # Create indexes
                for index_sql in self.indexes:
                    await db.execute(index_sql)
                
                await db.commit()
                logger.info(f"Database initialized successfully at {self.db_path}")
                
        except Exception as e:
            logger.error(f"Database initialization error: {str(e)}")
            raise
    
    async def check_connection(self):
        """Check if database connection is working"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute("SELECT 1")
                return True
        except Exception as e:
            logger.error(f"Database connection check failed: {e}")
            raise
    
    async def create_search(self, search_id: str, search_type: str, query_data: Dict) -> bool:
        """Create new search record"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute(
                    'INSERT INTO searches (id, search_type, query_data, status) VALUES (?, ?, ?, ?)',
                    (search_id, search_type, json.dumps(query_data), 'pending')
                )
                await db.commit()
                return True
                
        except Exception as e:
            logger.error(f"Create search error: {str(e)}")
            return False
    
    async def update_search_status(self, search_id: str, status: str, error_message: str = None):
        """Update search status"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                if status == 'completed':
                    await db.execute(
                        'UPDATE searches SET status = ?, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                        (status, search_id)
                    )
                elif status == 'error':
                    await db.execute(
                        'UPDATE searches SET status = ?, error_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                        (status, error_message, search_id)
                    )
                else:
                    await db.execute(
                        'UPDATE searches SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                        (status, search_id)
                    )
                
                await db.commit()
                
        except Exception as e:
            logger.error(f"Update search status error: {str(e)}")
    
    async def store_search_results(self, search_id: str, results: List[Dict]) -> bool:
        """Store search results"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                for result in results:
                    await db.execute(
                        '''INSERT INTO search_results 
                           (search_id, source, data_type, data, confidence_score) 
                           VALUES (?, ?, ?, ?, ?)''',
                        (
                            search_id,
                            result.get('source', 'unknown'),
                            result.get('data_type', 'general'),
                            json.dumps(result.get('data', {})),
                            result.get('confidence_score', 0.0)
                        )
                    )
                
                await db.commit()
                return True
                
        except Exception as e:
            logger.error(f"Store search results error: {str(e)}")
            return False
    
    async def get_search_status(self, search_id: str) -> Optional[Dict]:
        """Get search status and metadata"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                
                async with db.execute(
                    'SELECT * FROM searches WHERE id = ?',
                    (search_id,)
                ) as cursor:
                    row = await cursor.fetchone()
                    
                    if row:
                        return {
                            'search_id': row['id'],
                            'search_type': row['search_type'],
                            'status': row['status'],
                            'created_at': row['created_at'],
                            'updated_at': row['updated_at'],
                            'completed_at': row['completed_at'],
                            'error_message': row['error_message']
                        }
                    
                    return None
                    
        except Exception as e:
            logger.error(f"Get search status error: {str(e)}")
            return None
    
    async def get_search_results(self, search_id: str) -> Optional[Dict]:
        """Get comprehensive search results"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                
                # Get search metadata
                search_info = await self.get_search_status(search_id)
                if not search_info:
                    return None
                
                # Get search results
                results = []
                async with db.execute(
                    'SELECT * FROM search_results WHERE search_id = ? ORDER BY created_at DESC',
                    (search_id,)
                ) as cursor:
                    async for row in cursor:
                        results.append({
                            'id': row['id'],
                            'source': row['source'],
                            'data_type': row['data_type'],
                            'data': json.loads(row['data']),
                            'confidence_score': row['confidence_score'],
                            'created_at': row['created_at']
                        })
                
                return {
                    'search_info': search_info,
                    'results': results,
                    'total_results': len(results)
                }
                
        except Exception as e:
            logger.error(f"Get search results error: {str(e)}")
            return None
    
    async def store_profile(self, profile_data: Dict) -> bool:
        """Store social media profile data"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute(
                    '''INSERT OR REPLACE INTO profiles 
                       (id, platform, username, display_name, profile_url, profile_image, 
                        bio, followers, following, posts, verified, last_activity, 
                        location, website, contact_info, metadata, updated_at) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)''',
                    (
                        profile_data.get('id'),
                        profile_data.get('platform'),
                        profile_data.get('username'),
                        profile_data.get('display_name'),
                        profile_data.get('profile_url'),
                        profile_data.get('profile_image'),
                        profile_data.get('bio'),
                        profile_data.get('followers', 0),
                        profile_data.get('following', 0),
                        profile_data.get('posts', 0),
                        profile_data.get('verified', False),
                        profile_data.get('last_activity'),
                        profile_data.get('location'),
                        profile_data.get('website'),
                        json.dumps(profile_data.get('contact_info', {})),
                        json.dumps(profile_data.get('metadata', {}))
                    )
                )
                
                await db.commit()
                return True
                
        except Exception as e:
            logger.error(f"Store profile error: {str(e)}")
            return False
    
    async def create_session(self, session_data: Dict) -> str:
        """Create investigation session"""
        try:
            session_id = session_data.get('session_id')
            
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute(
                    'INSERT INTO investigation_sessions (id, name, description) VALUES (?, ?, ?)',
                    (session_id, session_data.get('name'), session_data.get('description'))
                )
                await db.commit()
                
                return session_id
                
        except Exception as e:
            logger.error(f"Create session error: {str(e)}")
            raise
    
    async def get_session(self, session_id: str) -> Optional[Dict]:
        """Get investigation session with associated searches"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                
                # Get session info
                async with db.execute(
                    'SELECT * FROM investigation_sessions WHERE id = ?',
                    (session_id,)
                ) as cursor:
                    session_row = await cursor.fetchone()
                    
                    if not session_row:
                        return None
                
                # Get associated searches
                searches = []
                async with db.execute(
                    '''SELECT s.* FROM searches s 
                       JOIN session_searches ss ON s.id = ss.search_id 
                       WHERE ss.session_id = ? 
                       ORDER BY s.created_at DESC''',
                    (session_id,)
                ) as cursor:
                    async for row in cursor:
                        searches.append(dict(row))
                
                return {
                    'session_id': session_row['id'],
                    'name': session_row['name'],
                    'description': session_row['description'],
                    'status': session_row['status'],
                    'created_at': session_row['created_at'],
                    'updated_at': session_row['updated_at'],
                    'searches': searches
                }
                
        except Exception as e:
            logger.error(f"Get session error: {str(e)}")
            return None
    
    async def store_domain_intelligence(self, domain_data: Dict) -> bool:
        """Store domain intelligence data"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute(
                    '''INSERT OR REPLACE INTO domain_intelligence 
                       (domain, ip_address, whois_data, dns_records, subdomains, 
                        ssl_certificates, threat_intelligence, technologies, 
                        security_scan, updated_at) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)''',
                    (
                        domain_data.get('domain'),
                        domain_data.get('ip_address'),
                        json.dumps(domain_data.get('whois_data', {})),
                        json.dumps(domain_data.get('dns_records', {})),
                        json.dumps(domain_data.get('subdomains', [])),
                        json.dumps(domain_data.get('ssl_certificates', {})),
                        json.dumps(domain_data.get('threat_intelligence', {})),
                        json.dumps(domain_data.get('technologies', [])),
                        json.dumps(domain_data.get('security_scan', {}))
                    )
                )
                
                await db.commit()
                return True
                
        except Exception as e:
            logger.error(f"Store domain intelligence error: {str(e)}")
            return False
    
    async def store_phone_intelligence(self, phone_data: Dict) -> bool:
        """Store phone intelligence data"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute(
                    '''INSERT OR REPLACE INTO phone_intelligence 
                       (phone_number, formatted_number, country_code, country, region, 
                        carrier, line_type, is_valid, is_mobile, is_voip, spam_score, 
                        associated_accounts) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                    (
                        phone_data.get('phone_number'),
                        phone_data.get('formatted_number'),
                        phone_data.get('country_code'),
                        phone_data.get('country'),
                        phone_data.get('region'),
                        phone_data.get('carrier'),
                        phone_data.get('line_type'),
                        phone_data.get('is_valid', False),
                        phone_data.get('is_mobile', False),
                        phone_data.get('is_voip', False),
                        phone_data.get('spam_score', 0.0),
                        json.dumps(phone_data.get('associated_accounts', []))
                    )
                )
                
                await db.commit()
                return True
                
        except Exception as e:
            logger.error(f"Store phone intelligence error: {str(e)}")
            return False
    
    async def create_correlation_cluster(self, cluster_data: Dict) -> bool:
        """Create entity correlation cluster"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute(
                    '''INSERT OR REPLACE INTO correlation_clusters 
                       (id, cluster_type, confidence_score, entity_ids, correlation_factors, updated_at) 
                       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)''',
                    (
                        cluster_data.get('id'),
                        cluster_data.get('cluster_type'),
                        cluster_data.get('confidence_score', 0.0),
                        json.dumps(cluster_data.get('entity_ids', [])),
                        json.dumps(cluster_data.get('correlation_factors', {}))
                    )
                )
                
                await db.commit()
                return True
                
        except Exception as e:
            logger.error(f"Create correlation cluster error: {str(e)}")
            return False
    
    async def search_profiles(self, platform: str = None, username: str = None, limit: int = 100) -> List[Dict]:
        """Search stored profiles"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                
                query = 'SELECT * FROM profiles WHERE 1=1'
                params = []
                
                if platform:
                    query += ' AND platform = ?'
                    params.append(platform)
                
                if username:
                    query += ' AND username LIKE ?'
                    params.append(f'%{username}%')
                
                query += ' ORDER BY updated_at DESC LIMIT ?'
                params.append(limit)
                
                results = []
                async with db.execute(query, params) as cursor:
                    async for row in cursor:
                        profile = dict(row)
                        profile['contact_info'] = json.loads(profile['contact_info'] or '{}')
                        profile['metadata'] = json.loads(profile['metadata'] or '{}')
                        results.append(profile)
                
                return results
                
        except Exception as e:
            logger.error(f"Search profiles error: {str(e)}")
            return []
    
    async def get_statistics(self) -> Dict[str, Any]:
        """Get database statistics"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                stats = {}
                
                # Count records in each table
                for table_name in self.tables.keys():
                    async with db.execute(f'SELECT COUNT(*) as count FROM {table_name}') as cursor:
                        row = await cursor.fetchone()
                        stats[f'{table_name}_count'] = row[0] if row else 0
                
                # Recent activity
                async with db.execute(
                    'SELECT COUNT(*) as count FROM searches WHERE created_at > datetime("now", "-24 hours")'
                ) as cursor:
                    row = await cursor.fetchone()
                    stats['searches_last_24h'] = row[0] if row else 0
                
                return stats
                
        except Exception as e:
            logger.error(f"Get statistics error: {str(e)}")
            return {}
    
    async def cleanup_old_data(self, days_old: int = 30):
        """Clean up old search data"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                # Delete old search results
                await db.execute(
                    'DELETE FROM search_results WHERE search_id IN (SELECT id FROM searches WHERE created_at < datetime("now", "-{} days"))'.format(days_old)
                )
                
                # Delete old searches
                await db.execute(
                    'DELETE FROM searches WHERE created_at < datetime("now", "-{} days")'.format(days_old)
                )
                
                await db.commit()
                logger.info(f"Cleaned up data older than {days_old} days")
                
        except Exception as e:
            logger.error(f"Cleanup error: {str(e)}")
    
    async def export_data(self, export_type: str, filters: Dict = None) -> List[Dict]:
        """Export data for reports"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                
                if export_type == 'searches':
                    query = 'SELECT * FROM searches ORDER BY created_at DESC'
                elif export_type == 'profiles':
                    query = 'SELECT * FROM profiles ORDER BY updated_at DESC'
                elif export_type == 'sessions':
                    query = 'SELECT * FROM investigation_sessions ORDER BY created_at DESC'
                else:
                    return []
                
                results = []
                async with db.execute(query) as cursor:
                    async for row in cursor:
                        results.append(dict(row))
                
                return results
                
        except Exception as e:
            logger.error(f"Export data error: {str(e)}")
            return []
