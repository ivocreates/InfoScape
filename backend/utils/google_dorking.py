"""
Google Dorking Module for InfoScape OSINT Platform
Advanced Google search operator generation for people search
"""

import logging
from typing import Dict, List, Any, Optional, Tuple
from urllib.parse import quote
import re

logger = logging.getLogger(__name__)

class GoogleDorkingEngine:
    """Advanced Google dorking for OSINT people search"""
    
    def __init__(self):
        # Social media platforms with specific search patterns
        self.social_platforms = {
            'linkedin': {
                'site': 'linkedin.com',
                'patterns': ['site:linkedin.com/in/', 'site:linkedin.com/pub/'],
                'additional': ['intitle:"LinkedIn"']
            },
            'facebook': {
                'site': 'facebook.com',
                'patterns': ['site:facebook.com', 'site:fb.com'],
                'additional': ['intitle:"Facebook"']
            },
            'twitter': {
                'site': 'twitter.com',
                'patterns': ['site:twitter.com', 'site:x.com'],
                'additional': ['intitle:"Twitter"', 'intitle:"X"']
            },
            'instagram': {
                'site': 'instagram.com',
                'patterns': ['site:instagram.com'],
                'additional': ['intitle:"Instagram"']
            },
            'github': {
                'site': 'github.com',
                'patterns': ['site:github.com'],
                'additional': ['intitle:"GitHub"']
            },
            'youtube': {
                'site': 'youtube.com',
                'patterns': ['site:youtube.com/channel/', 'site:youtube.com/c/', 'site:youtube.com/@'],
                'additional': ['intitle:"YouTube"']
            },
            'tiktok': {
                'site': 'tiktok.com',
                'patterns': ['site:tiktok.com/@'],
                'additional': ['intitle:"TikTok"']
            },
            'pinterest': {
                'site': 'pinterest.com',
                'patterns': ['site:pinterest.com'],
                'additional': ['intitle:"Pinterest"']
            },
            'reddit': {
                'site': 'reddit.com',
                'patterns': ['site:reddit.com/user/'],
                'additional': ['intitle:"Reddit"']
            }
        }
        
        # Professional platforms
        self.professional_platforms = {
            'crunchbase': 'site:crunchbase.com/person/',
            'angellist': 'site:angel.co/u/',
            'behance': 'site:behance.net/',
            'dribbble': 'site:dribbble.com/',
            'stackoverflow': 'site:stackoverflow.com/users/',
            'medium': 'site:medium.com/@'
        }
        
        # Document types that often contain personal information
        self.document_types = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt']
        
        # Contact information patterns
        self.contact_patterns = {
            'email': r'[\w\.-]+@[\w\.-]+\.\w+',
            'phone_us': r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
            'phone_intl': r'\+\d{1,3}[-.\s]?\d{1,14}'
        }
        
        # News and media sites
        self.news_sites = [
            'news.google.com', 'reuters.com', 'ap.org', 'bbc.com', 'cnn.com',
            'npr.org', 'wsj.com', 'nytimes.com', 'washingtonpost.com', 'usatoday.com',
            'bloomberg.com', 'forbes.com', 'techcrunch.com', 'wired.com'
        ]
        
        # Academic and research sites
        self.academic_sites = [
            'scholar.google.com', 'researchgate.net', 'academia.edu', 'pubmed.ncbi.nlm.nih.gov',
            'arxiv.org', 'jstor.org', 'ieee.org', 'acm.org'
        ]
    
    def generate_person_dorks(self, search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate comprehensive Google dorks for person search"""
        dorks = []
        
        # Extract search parameters
        full_name = self._get_full_name(search_params)
        first_name = search_params.get('first_name', '')
        last_name = search_params.get('last_name', '')
        email = search_params.get('email', '')
        phone = search_params.get('phone', '')
        username = search_params.get('username', '')
        location = search_params.get('location', '')
        company = search_params.get('company', '')
        occupation = search_params.get('occupation', '')
        
        # Basic name searches
        if full_name:
            dorks.extend(self._generate_basic_name_dorks(full_name, location, company))
        
        # Email-based dorks
        if email:
            dorks.extend(self._generate_email_dorks(email, full_name))
        
        # Phone-based dorks
        if phone:
            dorks.extend(self._generate_phone_dorks(phone, full_name))
        
        # Username-based dorks
        if username:
            dorks.extend(self._generate_username_dorks(username))
        
        # Social media dorks
        if full_name or username:
            dorks.extend(self._generate_social_media_dorks(full_name, username))
        
        # Professional dorks
        if full_name and (company or occupation):
            dorks.extend(self._generate_professional_dorks(full_name, company, occupation))
        
        # Document search dorks
        if full_name:
            dorks.extend(self._generate_document_dorks(full_name, company))
        
        # News and media dorks
        if full_name:
            dorks.extend(self._generate_news_dorks(full_name, company))
        
        # Academic and research dorks
        if full_name:
            dorks.extend(self._generate_academic_dorks(full_name))
        
        # Location-specific dorks
        if full_name and location:
            dorks.extend(self._generate_location_dorks(full_name, location))
        
        # Advanced combination dorks
        dorks.extend(self._generate_advanced_combination_dorks(search_params))
        
        # Sort by priority and confidence
        dorks = self._prioritize_dorks(dorks)
        
        return dorks[:50]  # Limit to top 50 dorks
    
    def _get_full_name(self, search_params: Dict[str, Any]) -> str:
        """Extract full name from search parameters"""
        if search_params.get('full_name'):
            return search_params['full_name']
        
        first = search_params.get('first_name', '').strip()
        last = search_params.get('last_name', '').strip()
        
        if first and last:
            return f"{first} {last}"
        elif first:
            return first
        elif last:
            return last
        
        return ''
    
    def _generate_basic_name_dorks(self, name: str, location: str = '', company: str = '') -> List[Dict[str, Any]]:
        """Generate basic name-based Google dorks"""
        dorks = []
        
        # Exact name match
        dorks.append({
            'query': f'"{name}"',
            'description': f'Exact match for "{name}"',
            'category': 'basic_search',
            'priority': 10,
            'confidence': 0.9
        })
        
        # Name with location
        if location:
            dorks.append({
                'query': f'"{name}" "{location}"',
                'description': f'"{name}" in {location}',
                'category': 'location_search',
                'priority': 9,
                'confidence': 0.85
            })
        
        # Name with company
        if company:
            dorks.append({
                'query': f'"{name}" "{company}"',
                'description': f'"{name}" at {company}',
                'category': 'company_search',
                'priority': 9,
                'confidence': 0.85
            })
        
        # Name variations
        name_parts = name.split()
        if len(name_parts) >= 2:
            # First name + last initial
            dorks.append({
                'query': f'"{name_parts[0]} {name_parts[-1][0]}"',
                'description': f'Name with last initial: {name_parts[0]} {name_parts[-1][0]}.',
                'category': 'name_variation',
                'priority': 7,
                'confidence': 0.7
            })
            
            # Last name, first name format
            dorks.append({
                'query': f'"{name_parts[-1]}, {name_parts[0]}"',
                'description': f'Reverse name format: {name_parts[-1]}, {name_parts[0]}',
                'category': 'name_variation',
                'priority': 7,
                'confidence': 0.7
            })
        
        return dorks
    
    def _generate_email_dorks(self, email: str, name: str = '') -> List[Dict[str, Any]]:
        """Generate email-based Google dorks"""
        dorks = []
        
        # Exact email search
        dorks.append({
            'query': f'"{email}"',
            'description': f'Exact email search: {email}',
            'category': 'email_search',
            'priority': 10,
            'confidence': 0.95
        })
        
        # Email with name
        if name:
            dorks.append({
                'query': f'"{email}" "{name}"',
                'description': f'Email and name combination',
                'category': 'email_search',
                'priority': 9,
                'confidence': 0.9
            })
        
        # Email domain search
        domain = email.split('@')[1] if '@' in email else ''
        if domain:
            dorks.append({
                'query': f'site:{domain} "{name}"' if name else f'site:{domain}',
                'description': f'Search within email domain: {domain}',
                'category': 'domain_search',
                'priority': 6,
                'confidence': 0.6
            })
        
        # Email in documents
        for doc_type in self.document_types:
            dorks.append({
                'query': f'"{email}" filetype:{doc_type}',
                'description': f'Email in {doc_type.upper()} documents',
                'category': 'document_search',
                'priority': 5,
                'confidence': 0.7
            })
        
        return dorks
    
    def _generate_phone_dorks(self, phone: str, name: str = '') -> List[Dict[str, Any]]:
        """Generate phone-based Google dorks"""
        dorks = []
        
        # Clean phone number variations
        clean_phone = re.sub(r'[^\d]', '', phone)
        
        # Different phone formats
        phone_formats = [phone]
        if len(clean_phone) >= 10:
            # (XXX) XXX-XXXX format
            formatted = f"({clean_phone[-10:-7]}) {clean_phone[-7:-4]}-{clean_phone[-4:]}"
            phone_formats.append(formatted)
            
            # XXX-XXX-XXXX format
            formatted = f"{clean_phone[-10:-7]}-{clean_phone[-7:-4]}-{clean_phone[-4:]}"
            phone_formats.append(formatted)
            
            # XXX.XXX.XXXX format
            formatted = f"{clean_phone[-10:-7]}.{clean_phone[-7:-4]}.{clean_phone[-4:]}"
            phone_formats.append(formatted)
        
        for phone_format in phone_formats:
            dorks.append({
                'query': f'"{phone_format}"',
                'description': f'Phone number search: {phone_format}',
                'category': 'phone_search',
                'priority': 8,
                'confidence': 0.85
            })
            
            if name:
                dorks.append({
                    'query': f'"{phone_format}" "{name}"',
                    'description': f'Phone and name combination',
                    'category': 'phone_search',
                    'priority': 8,
                    'confidence': 0.9
                })
        
        return dorks
    
    def _generate_username_dorks(self, username: str) -> List[Dict[str, Any]]:
        """Generate username-based Google dorks"""
        dorks = []
        
        # Exact username search
        dorks.append({
            'query': f'"{username}"',
            'description': f'Username search: {username}',
            'category': 'username_search',
            'priority': 8,
            'confidence': 0.8
        })
        
        # Username variations
        variations = [
            username.lower(),
            username.upper(),
            username.replace('_', ''),
            username.replace('.', ''),
            username.replace('-', '')
        ]
        
        for variation in set(variations):
            if variation != username:
                dorks.append({
                    'query': f'"{variation}"',
                    'description': f'Username variation: {variation}',
                    'category': 'username_search',
                    'priority': 6,
                    'confidence': 0.7
                })
        
        return dorks
    
    def _generate_social_media_dorks(self, name: str = '', username: str = '') -> List[Dict[str, Any]]:
        """Generate social media platform dorks"""
        dorks = []
        
        search_terms = [term for term in [name, username] if term]
        
        for platform, config in self.social_platforms.items():
            for term in search_terms:
                # Site-specific searches
                for pattern in config['patterns']:
                    dorks.append({
                        'query': f'{pattern} "{term}"',
                        'description': f'{platform.title()} profile search for "{term}"',
                        'category': 'social_media',
                        'priority': 7,
                        'confidence': 0.75
                    })
                
                # General site search
                dorks.append({
                    'query': f'site:{config["site"]} "{term}"',
                    'description': f'General {platform.title()} search for "{term}"',
                    'category': 'social_media',
                    'priority': 6,
                    'confidence': 0.7
                })
        
        return dorks
    
    def _generate_professional_dorks(self, name: str, company: str = '', occupation: str = '') -> List[Dict[str, Any]]:
        """Generate professional network dorks"""
        dorks = []
        
        # LinkedIn specific searches
        if company:
            dorks.append({
                'query': f'site:linkedin.com/in/ "{name}" "{company}"',
                'description': f'LinkedIn profile for {name} at {company}',
                'category': 'professional',
                'priority': 9,
                'confidence': 0.85
            })
        
        if occupation:
            dorks.append({
                'query': f'site:linkedin.com/in/ "{name}" "{occupation}"',
                'description': f'LinkedIn profile for {name} - {occupation}',
                'category': 'professional',
                'priority': 8,
                'confidence': 0.8
            })
        
        # Other professional platforms
        for platform, site_pattern in self.professional_platforms.items():
            dorks.append({
                'query': f'{site_pattern} "{name}"',
                'description': f'{platform.title()} profile search',
                'category': 'professional',
                'priority': 6,
                'confidence': 0.7
            })
        
        return dorks
    
    def _generate_document_dorks(self, name: str, company: str = '') -> List[Dict[str, Any]]:
        """Generate document search dorks"""
        dorks = []
        
        for doc_type in self.document_types:
            # Basic document search
            dorks.append({
                'query': f'"{name}" filetype:{doc_type}',
                'description': f'Documents ({doc_type.upper()}) mentioning {name}',
                'category': 'document_search',
                'priority': 5,
                'confidence': 0.65
            })
            
            # Document with company
            if company:
                dorks.append({
                    'query': f'"{name}" "{company}" filetype:{doc_type}',
                    'description': f'{doc_type.upper()} documents with {name} and {company}',
                    'category': 'document_search',
                    'priority': 6,
                    'confidence': 0.7
                })
        
        # Resume/CV specific searches
        cv_terms = ['resume', 'cv', 'curriculum vitae', 'biography', 'bio']
        for term in cv_terms:
            dorks.append({
                'query': f'"{name}" "{term}" filetype:pdf',
                'description': f'{term.title()} documents for {name}',
                'category': 'document_search',
                'priority': 7,
                'confidence': 0.75
            })
        
        return dorks
    
    def _generate_news_dorks(self, name: str, company: str = '') -> List[Dict[str, Any]]:
        """Generate news and media search dorks"""
        dorks = []
        
        # News site searches
        for site in self.news_sites[:10]:  # Limit to top 10 news sites
            dorks.append({
                'query': f'site:{site} "{name}"',
                'description': f'News articles on {site}',
                'category': 'news_media',
                'priority': 5,
                'confidence': 0.6
            })
        
        # General news search
        dorks.append({
            'query': f'"{name}" (news OR article OR interview OR press)',
            'description': f'News and media mentions of {name}',
            'category': 'news_media',
            'priority': 6,
            'confidence': 0.65
        })
        
        if company:
            dorks.append({
                'query': f'"{name}" "{company}" (news OR press OR announcement)',
                'description': f'News about {name} and {company}',
                'category': 'news_media',
                'priority': 7,
                'confidence': 0.7
            })
        
        return dorks
    
    def _generate_academic_dorks(self, name: str) -> List[Dict[str, Any]]:
        """Generate academic and research dorks"""
        dorks = []
        
        # Academic site searches
        for site in self.academic_sites:
            dorks.append({
                'query': f'site:{site} "{name}"',
                'description': f'Academic profile/papers on {site}',
                'category': 'academic',
                'priority': 4,
                'confidence': 0.6
            })
        
        # Research paper searches
        research_terms = ['author', 'researcher', 'professor', 'PhD', 'publication']
        for term in research_terms:
            dorks.append({
                'query': f'"{name}" "{term}" filetype:pdf',
                'description': f'Academic papers by {name}',
                'category': 'academic',
                'priority': 5,
                'confidence': 0.65
            })
        
        return dorks
    
    def _generate_location_dorks(self, name: str, location: str) -> List[Dict[str, Any]]:
        """Generate location-specific dorks"""
        dorks = []
        
        # Location with contact information
        contact_terms = ['address', 'phone', 'email', 'contact']
        for term in contact_terms:
            dorks.append({
                'query': f'"{name}" "{location}" "{term}"',
                'description': f'Contact information for {name} in {location}',
                'category': 'location_search',
                'priority': 6,
                'confidence': 0.7
            })
        
        # Local business directories
        directory_terms = ['directory', 'business', 'listing', 'yellow pages']
        for term in directory_terms:
            dorks.append({
                'query': f'"{name}" "{location}" "{term}"',
                'description': f'Business directory listings in {location}',
                'category': 'location_search',
                'priority': 5,
                'confidence': 0.65
            })
        
        return dorks
    
    def _generate_advanced_combination_dorks(self, search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate advanced combination dorks"""
        dorks = []
        
        name = self._get_full_name(search_params)
        email = search_params.get('email', '')
        phone = search_params.get('phone', '')
        location = search_params.get('location', '')
        company = search_params.get('company', '')
        
        # Multi-field combinations
        if name and email and location:
            dorks.append({
                'query': f'("{name}" OR "{email}") "{location}"',
                'description': f'Name or email in {location}',
                'category': 'advanced_combination',
                'priority': 8,
                'confidence': 0.8
            })
        
        if name and phone and company:
            dorks.append({
                'query': f'("{name}" OR "{phone}") "{company}"',
                'description': f'Name or phone at {company}',
                'category': 'advanced_combination',
                'priority': 8,
                'confidence': 0.8
            })
        
        # Social media and professional combination
        if name:
            dorks.append({
                'query': f'"{name}" (site:linkedin.com OR site:facebook.com OR site:twitter.com)',
                'description': f'Major social media profiles for {name}',
                'category': 'advanced_combination',
                'priority': 7,
                'confidence': 0.75
            })
        
        return dorks
    
    def _prioritize_dorks(self, dorks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Sort dorks by priority and confidence"""
        return sorted(dorks, key=lambda x: (x['priority'], x['confidence']), reverse=True)
    
    def generate_dork_url(self, dork_query: str) -> str:
        """Generate Google search URL for a dork query"""
        encoded_query = quote(dork_query)
        return f"https://www.google.com/search?q={encoded_query}"
    
    def get_dork_categories(self) -> List[str]:
        """Get list of all dork categories"""
        return [
            'basic_search', 'email_search', 'phone_search', 'username_search',
            'social_media', 'professional', 'document_search', 'news_media',
            'academic', 'location_search', 'domain_search', 'company_search',
            'name_variation', 'advanced_combination'
        ]
    
    def filter_dorks_by_category(self, dorks: List[Dict[str, Any]], categories: List[str]) -> List[Dict[str, Any]]:
        """Filter dorks by specified categories"""
        return [dork for dork in dorks if dork.get('category') in categories]
    
    def estimate_dork_results(self, dork_query: str) -> int:
        """Estimate number of results for a dork query (placeholder)"""
        # This would integrate with Google's API or use other methods to estimate results
        # For now, return a placeholder estimate based on query complexity
        query_length = len(dork_query.split())
        if query_length <= 2:
            return 10000
        elif query_length <= 4:
            return 5000
        elif query_length <= 6:
            return 1000
        else:
            return 100