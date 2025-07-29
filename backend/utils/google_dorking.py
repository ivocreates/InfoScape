"""
Enhanced Google Dorking Engine for Advanced People Search
Provides comprehensive Google search operators for OSINT investigations with worldwide support
"""

import re
import hashlib
from typing import Dict, List, Any, Optional
from datetime import datetime
from urllib.parse import quote_plus
import logging

logger = logging.getLogger(__name__)

class GoogleDorkingEngine:
    """Advanced Google dorking engine with comprehensive search patterns and worldwide support"""
    
    def __init__(self):
        self.base_url = "https://www.google.com/search?q="
        
        # Comprehensive worldwide country-specific search domains and patterns
        self.country_domains = {
            # North America
            'United States': ['site:com', 'site:org', 'site:net', 'site:edu', 'site:gov'],
            'Canada': ['site:ca', 'site:gc.ca', 'site:qc.ca'],
            'Mexico': ['site:mx', 'site:gob.mx'],
            
            # Europe
            'United Kingdom': ['site:co.uk', 'site:org.uk', 'site:ac.uk', 'site:gov.uk'],
            'Germany': ['site:de'],
            'France': ['site:fr', 'site:gouv.fr'],
            'Italy': ['site:it'],
            'Spain': ['site:es'],
            'Netherlands': ['site:nl'],
            'Belgium': ['site:be'],
            'Switzerland': ['site:ch'],
            'Austria': ['site:at'],
            'Sweden': ['site:se'],
            'Norway': ['site:no'],
            'Denmark': ['site:dk'],
            'Finland': ['site:fi'],
            'Poland': ['site:pl'],
            'Czech Republic': ['site:cz'],
            'Hungary': ['site:hu'],
            'Greece': ['site:gr'],
            'Portugal': ['site:pt'],
            'Ireland': ['site:ie'],
            'Luxembourg': ['site:lu'],
            'Slovakia': ['site:sk'],
            'Slovenia': ['site:si'],
            'Croatia': ['site:hr'],
            'Romania': ['site:ro'],
            'Bulgaria': ['site:bg'],
            'Estonia': ['site:ee'],
            'Latvia': ['site:lv'],
            'Lithuania': ['site:lt'],
            'Malta': ['site:mt'],
            'Cyprus': ['site:cy'],
            'Iceland': ['site:is'],
            'Russia': ['site:ru'],
            'Ukraine': ['site:ua'],
            'Belarus': ['site:by'],
            'Moldova': ['site:md'],
            
            # Asia
            'Japan': ['site:jp', 'site:go.jp'],
            'South Korea': ['site:kr', 'site:go.kr'],
            'China': ['site:cn', 'site:com.cn'],
            'India': ['site:in', 'site:gov.in'],
            'Singapore': ['site:sg', 'site:gov.sg'],
            'Hong Kong': ['site:hk', 'site:gov.hk'],
            'Taiwan': ['site:tw', 'site:gov.tw'],
            'Thailand': ['site:th', 'site:go.th'],
            'Malaysia': ['site:my', 'site:gov.my'],
            'Indonesia': ['site:id', 'site:go.id'],
            'Philippines': ['site:ph', 'site:gov.ph'],
            'Vietnam': ['site:vn', 'site:gov.vn'],
            'Bangladesh': ['site:bd', 'site:gov.bd'],
            'Pakistan': ['site:pk', 'site:gov.pk'],
            'Sri Lanka': ['site:lk', 'site:gov.lk'],
            'Nepal': ['site:np', 'site:gov.np'],
            'Myanmar': ['site:mm'],
            'Cambodia': ['site:kh'],
            'Laos': ['site:la'],
            'Mongolia': ['site:mn'],
            'Kazakhstan': ['site:kz'],
            'Uzbekistan': ['site:uz'],
            'Kyrgyzstan': ['site:kg'],
            'Tajikistan': ['site:tj'],
            'Turkmenistan': ['site:tm'],
            
            # Middle East
            'Turkey': ['site:tr', 'site:gov.tr'],
            'Israel': ['site:il', 'site:gov.il'],
            'Saudi Arabia': ['site:sa', 'site:gov.sa'],
            'UAE': ['site:ae', 'site:gov.ae'],
            'Qatar': ['site:qa', 'site:gov.qa'],
            'Kuwait': ['site:kw', 'site:gov.kw'],
            'Bahrain': ['site:bh', 'site:gov.bh'],
            'Oman': ['site:om', 'site:gov.om'],
            'Jordan': ['site:jo', 'site:gov.jo'],
            'Lebanon': ['site:lb', 'site:gov.lb'],
            'Syria': ['site:sy'],
            'Iraq': ['site:iq'],
            'Iran': ['site:ir'],
            'Afghanistan': ['site:af'],
            'Yemen': ['site:ye'],
            
            # Africa
            'South Africa': ['site:za', 'site:gov.za'],
            'Egypt': ['site:eg', 'site:gov.eg'],
            'Nigeria': ['site:ng', 'site:gov.ng'],
            'Kenya': ['site:ke', 'site:go.ke'],
            'Morocco': ['site:ma', 'site:gov.ma'],
            'Tunisia': ['site:tn'],
            'Algeria': ['site:dz'],
            'Libya': ['site:ly'],
            'Ethiopia': ['site:et'],
            'Ghana': ['site:gh'],
            'Tanzania': ['site:tz'],
            'Uganda': ['site:ug'],
            'Zimbabwe': ['site:zw'],
            'Botswana': ['site:bw'],
            'Namibia': ['site:na'],
            'Zambia': ['site:zm'],
            'Senegal': ['site:sn'],
            'Ivory Coast': ['site:ci'],
            'Cameroon': ['site:cm'],
            'Gabon': ['site:ga'],
            'Rwanda': ['site:rw'],
            
            # Oceania
            'Australia': ['site:com.au', 'site:gov.au', 'site:edu.au'],
            'New Zealand': ['site:nz', 'site:govt.nz'],
            'Papua New Guinea': ['site:pg'],
            'Fiji': ['site:fj'],
            'Samoa': ['site:ws'],
            'Tonga': ['site:to'],
            'Vanuatu': ['site:vu'],
            'Solomon Islands': ['site:sb'],
            
            # South America
            'Brazil': ['site:br', 'site:gov.br'],
            'Argentina': ['site:ar', 'site:gob.ar'],
            'Chile': ['site:cl', 'site:gob.cl'],
            'Colombia': ['site:co', 'site:gov.co'],
            'Peru': ['site:pe', 'site:gob.pe'],
            'Venezuela': ['site:ve', 'site:gob.ve'],
            'Uruguay': ['site:uy', 'site:gub.uy'],
            'Paraguay': ['site:py'],
            'Bolivia': ['site:bo'],
            'Ecuador': ['site:ec'],
            'Guyana': ['site:gy'],
            'Suriname': ['site:sr'],
            
            # Central America & Caribbean
            'Guatemala': ['site:gt'],
            'Honduras': ['site:hn'],
            'El Salvador': ['site:sv'],
            'Nicaragua': ['site:ni'],
            'Costa Rica': ['site:cr'],
            'Panama': ['site:pa'],
            'Cuba': ['site:cu'],
            'Dominican Republic': ['site:do'],
            'Haiti': ['site:ht'],
            'Jamaica': ['site:jm'],
            'Trinidad and Tobago': ['site:tt'],
            'Barbados': ['site:bb'],
            'Bahamas': ['site:bs'],
            'Belize': ['site:bz'],
            'Antigua and Barbuda': ['site:ag'],
            'Saint Lucia': ['site:lc'],
            'Saint Vincent and the Grenadines': ['site:vc'],
            'Grenada': ['site:gd'],
            'Dominica': ['site:dm'],
            'Saint Kitts and Nevis': ['site:kn'],
            
            # Additional African Countries
            'Angola': ['site:ao'],
            'Benin': ['site:bj'],
            'Burkina Faso': ['site:bf'],
            'Burundi': ['site:bi'],
            'Cape Verde': ['site:cv'],
            'Central African Republic': ['site:cf'],
            'Chad': ['site:td'],
            'Comoros': ['site:km'],
            'Democratic Republic of Congo': ['site:cd'],
            'Republic of Congo': ['site:cg'],
            'Djibouti': ['site:dj'],
            'Equatorial Guinea': ['site:gq'],
            'Eritrea': ['site:er'],
            'Eswatini': ['site:sz'],
            'Gambia': ['site:gm'],
            'Guinea': ['site:gn'],
            'Guinea-Bissau': ['site:gw'],
            'Lesotho': ['site:ls'],
            'Liberia': ['site:lr'],
            'Madagascar': ['site:mg'],
            'Malawi': ['site:mw'],
            'Mali': ['site:ml'],
            'Mauritania': ['site:mr'],
            'Mauritius': ['site:mu'],
            'Mozambique': ['site:mz'],
            'Niger': ['site:ne'],
            'São Tomé and Príncipe': ['site:st'],
            'Seychelles': ['site:sc'],
            'Sierra Leone': ['site:sl'],
            'Somalia': ['site:so'],
            'South Sudan': ['site:ss'],
            'Sudan': ['site:sd'],
            'Togo': ['site:tg'],
            'Tunisia': ['site:tn'],
            
            # Additional Asian Countries
            'Bhutan': ['site:bt'],
            'Brunei': ['site:bn'],
            'East Timor': ['site:tl'],
            'Maldives': ['site:mv'],
            'North Korea': ['site:kp'],
            'Oman': ['site:om'],
            
            # Additional European Countries
            'Albania': ['site:al'],
            'Andorra': ['site:ad'],
            'Armenia': ['site:am'],
            'Azerbaijan': ['site:az'],
            'Bosnia and Herzegovina': ['site:ba'],
            'Georgia': ['site:ge'],
            'Liechtenstein': ['site:li'],
            'Monaco': ['site:mc'],
            'Montenegro': ['site:me'],
            'North Macedonia': ['site:mk'],
            'San Marino': ['site:sm'],
            'Serbia': ['site:rs'],
            'Vatican City': ['site:va'],
            
            # Additional Pacific Countries
            'Kiribati': ['site:ki'],
            'Marshall Islands': ['site:mh'],
            'Micronesia': ['site:fm'],
            'Nauru': ['site:nr'],
            'Palau': ['site:pw'],
            'Tuvalu': ['site:tv'],
        }
        
        # Enhanced social media platforms with advanced patterns
        self.social_platforms = {
            'linkedin': [
                'site:linkedin.com/in/',
                'site:linkedin.com/pub/',
                'site:linkedin.com/profile/',
                'site:linkedin.com intitle:"{name}"',
                'site:linkedin.com "{name}" "{company}"',
                'site:linkedin.com "{name}" "{location}"'
            ],
            'facebook': [
                'site:facebook.com',
                'site:facebook.com/people/',
                'site:facebook.com "{name}"',
                'site:facebook.com "{name}" "{location}"',
                'site:facebook.com intitle:"{name}"'
            ],
            'twitter': [
                'site:twitter.com',
                'site:x.com',
                'site:twitter.com "{name}"',
                'site:x.com "{name}"',
                'site:twitter.com intitle:"{name}"',
                'site:x.com intitle:"{name}"'
            ],
            'instagram': [
                'site:instagram.com',
                'site:instagram.com "{name}"',
                'site:instagram.com/{username}',
                'site:instagram.com intitle:"{name}"'
            ],
            'youtube': [
                'site:youtube.com',
                'site:youtube.com/user/',
                'site:youtube.com/c/',
                'site:youtube.com/@{username}',
                'site:youtube.com "{name}"',
                'site:youtube.com intitle:"{name}"'
            ],
            'tiktok': [
                'site:tiktok.com',
                'site:tiktok.com/@{username}',
                'site:tiktok.com "{name}"'
            ],
            'reddit': [
                'site:reddit.com',
                'site:reddit.com/user/',
                'site:reddit.com "{name}"',
                'site:reddit.com intitle:"{name}"'
            ],
            'pinterest': [
                'site:pinterest.com',
                'site:pinterest.com/{username}',
                'site:pinterest.com "{name}"'
            ],
            'github': [
                'site:github.com',
                'site:github.com/{username}',
                'site:github.com "{name}"',
                'site:github.com intitle:"{name}"'
            ],
            'discord': [
                'site:discord.com',
                'site:discord.gg',
                '"{name}" discord',
                '"{name}" discord.com'
            ],
            'telegram': [
                'site:t.me',
                'site:telegram.me',
                '"{name}" telegram',
                '"{name}" t.me'
            ],
            'snapchat': [
                'site:snapchat.com',
                '"{name}" snapchat',
                'snapchat "{name}"'
            ],
            'whatsapp': [
                '"{name}" whatsapp',
                'whatsapp "{name}"',
                '"{phone}" whatsapp'
            ],
            'mastodon': [
                'site:mastodon.social',
                'site:mas.to',
                '"{name}" mastodon'
            ],
            'threads': [
                'site:threads.net',
                '"{name}" threads'
            ]
        }
        
        # Enhanced professional platforms and patterns
        self.professional_platforms = {
            'crunchbase': [
                'site:crunchbase.com/person/',
                'site:crunchbase.com "{name}"',
                'site:crunchbase.com intitle:"{name}"'
            ],
            'angellist': [
                'site:angel.co',
                'site:angel.co/u/',
                'site:angel.co "{name}"'
            ],
            'behance': [
                'site:behance.net',
                'site:behance.net/{username}',
                'site:behance.net "{name}"'
            ],
            'dribbble': [
                'site:dribbble.com',
                'site:dribbble.com/{username}',
                'site:dribbble.com "{name}"'
            ],
            'stackoverflow': [
                'site:stackoverflow.com',
                'site:stackoverflow.com/users/',
                'site:stackoverflow.com "{name}"'
            ],
            'medium': [
                'site:medium.com',
                'site:medium.com/@{username}',
                'site:medium.com "{name}"'
            ],
            'academia': [
                'site:academia.edu',
                'site:researchgate.net',
                'site:scholar.google.com',
                'site:orcid.org',
                '"{name}" research papers',
                '"{name}" publications'
            ],
            'freelancer': [
                'site:upwork.com',
                'site:freelancer.com',
                'site:fiverr.com',
                '"{name}" freelancer'
            ]
        }
        
        # Enhanced document and file search patterns
        self.document_patterns = {
            'resume_cv': [
                '"{name}" filetype:pdf resume',
                '"{name}" filetype:doc resume',
                '"{name}" filetype:pdf cv',
                '"{name}" filetype:doc cv',
                '"{name}" filetype:pdf curriculum',
                '"{name}" "curriculum vitae" filetype:pdf'
            ],
            'presentations': [
                '"{name}" filetype:ppt',
                '"{name}" filetype:pptx',
                '"{name}" presentation filetype:pdf',
                '"{name}" speaker filetype:pdf'
            ],
            'spreadsheets': [
                '"{name}" filetype:xls',
                '"{name}" filetype:xlsx',
                '"{name}" filetype:csv'
            ],
            'documents': [
                '"{name}" filetype:pdf',
                '"{name}" filetype:doc',
                '"{name}" filetype:docx',
                '"{name}" filetype:txt'
            ],
            'research_papers': [
                '"{name}" filetype:pdf author',
                '"{name}" filetype:pdf research',
                '"{name}" filetype:pdf publication',
                '"{name}" filetype:pdf journal'
            ]
        }
        
        # Enhanced contact information patterns with global variations
        self.contact_patterns = {
            'email_patterns': [
                '"{name}" email',
                '"{name}" contact',
                '"{name}" "@"',
                '"{email}"',
                '"{name}" email address',
                '"{name}" contact information',
                '"{name}" mailto:',
                '"{name}" e-mail'
            ],
            'phone_patterns': [
                '"{name}" phone',
                '"{name}" telephone',
                '"{name}" mobile',
                '"{phone}"',
                '"{name}" phone number',
                '"{name}" contact number',
                '"{name}" tel:',
                '"{name}" cell',
                '"{name}" WhatsApp',
                '"{name}" Signal'
            ],
            'address_patterns': [
                '"{name}" address',
                '"{name}" location',
                '"{name}" "{location}"',
                '"{name}" address "{location}"',
                '"{name}" lives in',
                '"{name}" resident of',
                '"{name}" home address',
                '"{name}" mailing address'
            ]
        }
        
        # Enhanced news and media patterns with international sources
        self.media_patterns = {
            'news_global': [
                '"{name}" site:news.google.com',
                '"{name}" site:reuters.com',
                '"{name}" site:bbc.com',
                '"{name}" site:cnn.com',
                '"{name}" site:aljazeera.com',
                '"{name}" site:dw.com',
                '"{name}" site:france24.com'
            ],
            'news_regional': [
                '"{name}" news',
                '"{name}" article',
                '"{name}" interview',
                '"{name}" press release',
                '"{name}" announcement',
                '"{name}" media mention'
            ],
            'blogs_content': [
                '"{name}" blog',
                '"{name}" blogger',
                '"{name}" writes',
                '"{name}" author',
                '"{name}" guest post',
                '"{name}" contribution'
            ],
            'podcasts_media': [
                '"{name}" podcast',
                '"{name}" interview podcast',
                '"{name}" guest',
                '"{name}" speaker',
                '"{name}" webinar'
            ]
        }
        
        # Enhanced public records patterns with international coverage
        self.public_records_patterns = {
            'business_records': [
                '"{name}" business owner',
                '"{name}" company director',
                '"{name}" LLC',
                '"{name}" incorporated',
                '"{name}" business registration',
                '"{name}" trademark',
                '"{name}" patent',
                '"{name}" copyright'
            ],
            'property_records': [
                '"{name}" property owner',
                '"{name}" real estate',
                '"{name}" house',
                '"{name}" property records',
                '"{name}" deed',
                '"{name}" mortgage',
                '"{name}" land registry'
            ],
            'legal_records': [
                '"{name}" court records',
                '"{name}" lawsuit',
                '"{name}" legal',
                '"{name}" attorney',
                '"{name}" lawyer',
                '"{name}" litigation',
                '"{name}" judgment'
            ],
            'marriage_family': [
                '"{name}" married',
                '"{name}" spouse',
                '"{name}" wedding',
                '"{name}" marriage',
                '"{name}" divorced',
                '"{name}" family'
            ],
            'education_records': [
                '"{name}" graduate',
                '"{name}" alumni',
                '"{name}" degree',
                '"{name}" university',
                '"{name}" college',
                '"{name}" school'
            ]
        }
        
        # Person disambiguation patterns for common names
        self.disambiguation_patterns = {
            'age_identifiers': [
                '"{name}" age {age}',
                '"{name}" born {year}',
                '"{name}" {age} years old',
                '"{name}" birthday',
                '"{name}" date of birth'
            ],
            'location_identifiers': [
                '"{name}" "{location}"',
                '"{name}" from "{location}"',
                '"{name}" lives in "{location}"',
                '"{name}" based in "{location}"'
            ],
            'profession_identifiers': [
                '"{name}" "{occupation}"',
                '"{name}" works as "{occupation}"',
                '"{name}" profession "{occupation}"',
                '"{name}" job title "{occupation}"'
            ],
            'family_identifiers': [
                '"{name}" son of',
                '"{name}" daughter of',
                '"{name}" father of',
                '"{name}" mother of',
                '"{name}" married to',
                '"{name}" spouse'
            ]
        }
    
    def generate_person_dorks(self, search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate comprehensive Google dorks for person search with enhanced categorization"""
        dorks = []
        
        # Extract search parameters
        name = self._get_full_name(search_params)
        email = search_params.get('email', '')
        phone = search_params.get('phone', '')
        username = search_params.get('username', '')
        location = search_params.get('location', '')
        country = search_params.get('country', location)  # Support both location and country
        company = search_params.get('company', '')
        occupation = search_params.get('occupation', '')
        education = search_params.get('education', '')
        age = search_params.get('age', '')
        
        if not name and not email and not phone and not username:
            return dorks
        
        # Generate basic name-based dorks with enhanced targeting
        if name:
            dorks.extend(self._generate_basic_name_dorks(name, location, company))
            dorks.extend(self._generate_social_media_dorks(name, username))
            dorks.extend(self._generate_professional_dorks(name, company, occupation))
            dorks.extend(self._generate_document_dorks(name))
            dorks.extend(self._generate_contact_dorks(name, email, phone, location))
            dorks.extend(self._generate_media_dorks(name))
            dorks.extend(self._generate_public_records_dorks(name, location))
            
            # Enhanced disambiguation for common names
            dorks.extend(self._generate_disambiguation_dorks(name, age, location, occupation))
            
            # Location/Country-specific dorks with worldwide support
            if country or location:
                target_location = country or location
                dorks.extend(self._generate_location_specific_dorks(name, target_location))
            
            # Education-specific dorks
            if education:
                dorks.extend(self._generate_education_dorks(name, education))
        
        # Email-specific dorks with enhanced patterns
        if email:
            dorks.extend(self._generate_email_dorks(email))
        
        # Phone-specific dorks with international format support
        if phone:
            dorks.extend(self._generate_phone_dorks(phone))
        
        # Username-specific dorks with platform coverage
        if username:
            dorks.extend(self._generate_username_dorks(username))
        
        # Advanced combination dorks for better targeting
        dorks.extend(self._generate_advanced_combination_dorks(search_params))
        
        # Sort by priority and remove duplicates
        unique_dorks = self._deduplicate_dorks(dorks)
        sorted_dorks = sorted(unique_dorks, key=lambda x: x.get('priority', 5), reverse=True)
        
        # Add metadata to each dork
        for i, dork in enumerate(sorted_dorks):
            dork['id'] = hashlib.md5(dork['query'].encode()).hexdigest()[:8]
            dork['rank'] = i + 1
            dork['created_at'] = datetime.now().isoformat()
            dork['estimated_results'] = self.estimate_dork_results(dork['query'])
        
        return sorted_dorks[:100]  # Return top 100 dorks
    
    
    def _get_full_name(self, search_params: Dict[str, Any]) -> str:
        """Extract full name from search parameters"""
        full_name = search_params.get('full_name', '')
        if not full_name:
            first_name = search_params.get('first_name', '')
            last_name = search_params.get('last_name', '')
            if first_name and last_name:
                full_name = f"{first_name} {last_name}"
            elif first_name:
                full_name = first_name
            elif last_name:
                full_name = last_name
        return full_name.strip()
    
    def _generate_basic_name_dorks(self, name: str, location: str = '', company: str = '') -> List[Dict[str, Any]]:
        """Generate enhanced basic name-based search dorks"""
        dorks = []
        
        # Exact name match with high priority
        dorks.append({
            'query': f'"{name}"',
            'description': f'Exact match search for "{name}"',
            'category': 'basic_search',
            'priority': 10,
            'confidence': 0.9
        })
        
        # Name with location for geographic targeting
        if location:
            dorks.append({
                'query': f'"{name}" "{location}"',
                'description': f'Search for "{name}" in "{location}"',
                'category': 'location_search',
                'priority': 9,
                'confidence': 0.85
            })
        
        # Name with company for professional targeting
        if company:
            dorks.append({
                'query': f'"{name}" "{company}"',
                'description': f'Search for "{name}" at "{company}"',
                'category': 'company_search',
                'priority': 9,
                'confidence': 0.85
            })
        
        # Enhanced name variations for better coverage
        name_parts = name.split()
        if len(name_parts) >= 2:
            # Last name, first name format (common in official documents)
            dorks.append({
                'query': f'"{name_parts[-1]}, {" ".join(name_parts[:-1])}"',
                'description': f'Search with last name first format',
                'category': 'name_variation',
                'priority': 8,
                'confidence': 0.8
            })
            
            # First initial, last name (professional format)
            dorks.append({
                'query': f'"{name_parts[0][0]}. {name_parts[-1]}"',
                'description': f'Search with first initial and last name',
                'category': 'name_variation',
                'priority': 7,
                'confidence': 0.7
            })
            
            # Middle initial variations if 3+ names
            if len(name_parts) >= 3:
                dorks.append({
                    'query': f'"{name_parts[0]} {name_parts[1][0]}. {name_parts[-1]}"',
                    'description': f'Search with middle initial',
                    'category': 'name_variation',
                    'priority': 7,
                    'confidence': 0.75
                })
        
        return dorks
    
    def _generate_social_media_dorks(self, name: str, username: str = '') -> List[Dict[str, Any]]:
        """Generate comprehensive social media platform dorks"""
        dorks = []
        
        for platform, patterns in self.social_platforms.items():
            for pattern in patterns:
                try:
                    # Replace placeholders safely
                    if '{name}' in pattern:
                        query = pattern.replace('{name}', name)
                    elif '{username}' in pattern:
                        if username:
                            query = pattern.replace('{username}', username)
                        else:
                            continue  # Skip if no username provided
                    else:
                        query = pattern
                    
                    # Clean up any remaining placeholders
                    if '{' in query and '}' in query:
                        continue  # Skip malformed patterns
                    
                    dorks.append({
                        'query': query,
                        'description': f'Search for "{name or username}" on {platform.title()}',
                        'category': 'social_media',
                        'platform': platform,
                        'priority': 8,
                        'confidence': 0.75
                    })
                except Exception as e:
                    logger.warning(f"Error processing social media pattern for {platform}: {str(e)}")
                    continue
        
        return dorks
    
    def _generate_professional_dorks(self, name: str, company: str = '', occupation: str = '') -> List[Dict[str, Any]]:
        """Generate enhanced professional network dorks"""
        dorks = []
        
        for platform, patterns in self.professional_platforms.items():
            for pattern in patterns:
                try:
                    # Replace placeholders safely
                    query = pattern.replace('{name}', name) if '{name}' in pattern else pattern
                    
                    # Skip if placeholder remains
                    if '{' in query and '}' in query:
                        continue
                    
                    dorks.append({
                        'query': query,
                        'description': f'Search for "{name}" on {platform.title()}',
                        'category': 'professional',
                        'platform': platform,
                        'priority': 8,
                        'confidence': 0.8
                    })
                except Exception as e:
                    logger.warning(f"Error processing professional pattern for {platform}: {str(e)}")
                    continue
        
        # Enhanced company-specific professional searches
        if company:
            dorks.extend([
                {
                    'query': f'"{name}" "{company}" linkedin',
                    'description': f'LinkedIn search for "{name}" at "{company}"',
                    'category': 'professional',
                    'priority': 10,
                    'confidence': 0.9
                },
                {
                    'query': f'"{name}" "{company}" employee',
                    'description': f'Search for "{name}" as employee of "{company}"',
                    'category': 'professional',
                    'priority': 9,
                    'confidence': 0.85
                },
                {
                    'query': f'"{name}" "{company}" (director OR manager OR executive)',
                    'description': f'Search for "{name}" in leadership role at "{company}"',
                    'category': 'professional',
                    'priority': 8,
                    'confidence': 0.8
                }
            ])
        
        # Enhanced occupation-specific searches
        if occupation:
            dorks.extend([
                {
                    'query': f'"{name}" "{occupation}"',
                    'description': f'Search for "{name}" in "{occupation}" role',
                    'category': 'professional',
                    'priority': 8,
                    'confidence': 0.8
                },
                {
                    'query': f'"{name}" "{occupation}" linkedin',
                    'description': f'LinkedIn search for "{name}" - "{occupation}"',
                    'category': 'professional',
                    'priority': 9,
                    'confidence': 0.85
                }
            ])
        
        return dorks
    
    def _generate_document_dorks(self, name: str) -> List[Dict[str, Any]]:
        """Generate comprehensive document search dorks"""
        dorks = []
        
        for doc_type, patterns in self.document_patterns.items():
            for pattern in patterns:
                try:
                    query = pattern.replace('{name}', name) if '{name}' in pattern else pattern
                    
                    # Skip if placeholder remains
                    if '{' in query and '}' in query:
                        continue
                    
                    dorks.append({
                        'query': query,
                        'description': f'Search for {doc_type.replace("_", " ")} documents containing "{name}"',
                        'category': 'documents',
                        'document_type': doc_type,
                        'priority': 8,
                        'confidence': 0.7
                    })
                except Exception as e:
                    logger.warning(f"Error processing document pattern: {str(e)}")
                    continue
        
        return dorks
    
    def _generate_contact_dorks(self, name: str, email: str = '', phone: str = '', location: str = '') -> List[Dict[str, Any]]:
        """Generate enhanced contact information dorks"""
        dorks = []
        
        for contact_type, patterns in self.contact_patterns.items():
            for pattern in patterns:
                try:
                    # Replace placeholders safely
                    query = pattern
                    if '{name}' in pattern:
                        query = query.replace('{name}', name)
                    if '{email}' in pattern and email:
                        query = query.replace('{email}', email)
                    elif '{email}' in pattern:
                        continue  # Skip if no email provided
                    if '{phone}' in pattern and phone:
                        query = query.replace('{phone}', phone)
                    elif '{phone}' in pattern:
                        continue  # Skip if no phone provided
                    if '{location}' in pattern and location:
                        query = query.replace('{location}', location)
                    elif '{location}' in pattern:
                        continue  # Skip if no location provided
                    
                    # Skip if any placeholder remains
                    if '{' in query and '}' in query:
                        continue
                    
                    dorks.append({
                        'query': query,
                        'description': f'Search for {contact_type.replace("_", " ")} for "{name}"',
                        'category': 'contact_info',
                        'contact_type': contact_type,
                        'priority': 7,
                        'confidence': 0.75
                    })
                except Exception as e:
                    logger.warning(f"Error processing contact pattern: {str(e)}")
                    continue
        
        return dorks
    
    def _generate_media_dorks(self, name: str) -> List[Dict[str, Any]]:
        """Generate enhanced news and media dorks"""
        dorks = []
        
        for media_type, patterns in self.media_patterns.items():
            for pattern in patterns:
                try:
                    query = pattern.replace('{name}', name) if '{name}' in pattern else pattern
                    
                    # Skip if placeholder remains
                    if '{' in query and '}' in query:
                        continue
                    
                    dorks.append({
                        'query': query,
                        'description': f'Search for "{name}" in {media_type.replace("_", " ")}',
                        'category': 'media',
                        'media_type': media_type,
                        'priority': 6,
                        'confidence': 0.65
                    })
                except Exception as e:
                    logger.warning(f"Error processing media pattern: {str(e)}")
                    continue
        
        return dorks
    
    def _generate_public_records_dorks(self, name: str, location: str = '') -> List[Dict[str, Any]]:
        """Generate enhanced public records dorks"""
        dorks = []
        
        for record_type, patterns in self.public_records_patterns.items():
            for pattern in patterns:
                try:
                    query = pattern
                    if '{name}' in pattern:
                        query = query.replace('{name}', name)
                    if '{location}' in pattern and location:
                        query = query.replace('{location}', location)
                    elif '{location}' in pattern:
                        continue  # Skip if no location provided
                    
                    # Skip if placeholder remains
                    if '{' in query and '}' in query:
                        continue
                    
                    dorks.append({
                        'query': query,
                        'description': f'Search for "{name}" in {record_type.replace("_", " ")} records',
                        'category': 'public_records',
                        'record_type': record_type,
                        'priority': 7,
                        'confidence': 0.7
                    })
                except Exception as e:
                    logger.warning(f"Error processing public records pattern: {str(e)}")
                    continue
        
        return dorks
    
    def _generate_disambiguation_dorks(self, name: str, age: str = '', location: str = '', occupation: str = '') -> List[Dict[str, Any]]:
        """Generate dorks to help disambiguate between people with the same name"""
        dorks = []
        
        # Age-based disambiguation
        if age:
            for pattern in self.disambiguation_patterns['age_identifiers']:
                try:
                    query = pattern
                    if '{name}' in pattern:
                        query = query.replace('{name}', name)
                    if '{age}' in pattern:
                        query = query.replace('{age}', age)
                    if '{year}' in pattern and age.isdigit():
                        birth_year = str(datetime.now().year - int(age))
                        query = query.replace('{year}', birth_year)
                    
                    # Skip if placeholder remains
                    if '{' in query and '}' in query:
                        continue
                    
                    dorks.append({
                        'query': query,
                        'description': f'Age-based disambiguation for "{name}"',
                        'category': 'disambiguation',
                        'disambiguation_type': 'age',
                        'priority': 9,
                        'confidence': 0.85
                    })
                except Exception as e:
                    logger.warning(f"Error processing age disambiguation pattern: {str(e)}")
                    continue
        
        # Location-based disambiguation
        if location:
            for pattern in self.disambiguation_patterns['location_identifiers']:
                try:
                    query = pattern.replace('{name}', name).replace('{location}', location)
                    
                    # Skip if placeholder remains
                    if '{' in query and '}' in query:
                        continue
                    
                    dorks.append({
                        'query': query,
                        'description': f'Location-based disambiguation for "{name}"',
                        'category': 'disambiguation',
                        'disambiguation_type': 'location',
                        'priority': 8,
                        'confidence': 0.8
                    })
                except Exception as e:
                    logger.warning(f"Error processing location disambiguation pattern: {str(e)}")
                    continue
        
        # Profession-based disambiguation
        if occupation:
            for pattern in self.disambiguation_patterns['profession_identifiers']:
                try:
                    query = pattern.replace('{name}', name).replace('{occupation}', occupation)
                    
                    # Skip if placeholder remains
                    if '{' in query and '}' in query:
                        continue
                    
                    dorks.append({
                        'query': query,
                        'description': f'Profession-based disambiguation for "{name}"',
                        'category': 'disambiguation',
                        'disambiguation_type': 'profession',
                        'priority': 8,
                        'confidence': 0.8
                    })
                except Exception as e:
                    logger.warning(f"Error processing profession disambiguation pattern: {str(e)}")
                    continue
        
        # Family-based disambiguation
        for pattern in self.disambiguation_patterns['family_identifiers']:
            try:
                query = pattern.replace('{name}', name)
                
                # Skip if placeholder remains
                if '{' in query and '}' in query:
                    continue
                
                dorks.append({
                    'query': query,
                    'description': f'Family-based disambiguation for "{name}"',
                    'category': 'disambiguation',
                    'disambiguation_type': 'family',
                    'priority': 6,
                    'confidence': 0.65
                })
            except Exception as e:
                logger.warning(f"Error processing family disambiguation pattern: {str(e)}")
                continue
        
        return dorks
    
    def _generate_location_specific_dorks(self, name: str, location: str) -> List[Dict[str, Any]]:
        """Generate location-specific dorks with worldwide country domain support"""
        dorks = []
        
        # Get country-specific domains
        country_domains = self.country_domains.get(location, [])
        
        for domain in country_domains:
            dorks.extend([
                {
                    'query': f'"{name}" {domain}',
                    'description': f'Search for "{name}" on {location} websites',
                    'category': 'location_specific',
                    'country': location,
                    'priority': 9,
                    'confidence': 0.8
                },
                {
                    'query': f'"{name}" "{location}" {domain}',
                    'description': f'Combined location and domain search for "{name}"',
                    'category': 'location_specific',
                    'country': location,
                    'priority': 8,
                    'confidence': 0.75
                }
            ])
        
        # Add general location-based searches
        location_searches = [
            f'"{name}" "{location}" address',
            f'"{name}" "{location}" phone',
            f'"{name}" "{location}" contact',
            f'"{name}" "{location}" directory',
            f'"{name}" "{location}" resident',
            f'"{name}" "{location}" business'
        ]
        
        for search in location_searches:
            dorks.append({
                'query': search,
                'description': f'Location-specific search for "{name}" in {location}',
                'category': 'location_specific',
                'country': location,
                'priority': 6,
                'confidence': 0.7
            })
        
        return dorks
    
    def _generate_education_dorks(self, name: str, education: str) -> List[Dict[str, Any]]:
        """Generate education-specific dorks"""
        dorks = []
        
        education_patterns = [
            f'"{name}" "{education}"',
            f'"{name}" "{education}" alumni',
            f'"{name}" "{education}" student',
            f'"{name}" "{education}" graduate',
            f'"{name}" "{education}" university',
            f'"{name}" "{education}" college',
            f'site:linkedin.com "{name}" "{education}"',
            f'site:academia.edu "{name}" "{education}"',
            f'"{name}" "{education}" degree',
            f'"{name}" "{education}" class of'
        ]
        
        for pattern in education_patterns:
            dorks.append({
                'query': pattern,
                'description': f'Search for "{name}" connected to "{education}"',
                'category': 'education',
                'institution': education,
                'priority': 8,
                'confidence': 0.75
            })
        
        return dorks
    
    def _generate_email_dorks(self, email: str) -> List[Dict[str, Any]]:
        """Generate comprehensive email-specific dorks"""
        dorks = []
        
        email_patterns = [
            f'"{email}"',
            f'"{email}" -site:linkedin.com',
            f'"{email}" contact',
            f'"{email}" profile',
            f'"{email}" about',
            f'"{email}" filetype:pdf',
            f'"{email}" filetype:doc',
            f'"{email}" site:github.com',
            f'"{email}" site:stackoverflow.com',
            f'"{email}" resume',
            f'"{email}" cv',
            f'"{email}" biography'
        ]
        
        # Extract domain for domain-specific searches
        if '@' in email:
            domain = email.split('@')[1]
            username = email.split('@')[0]
            
            email_patterns.extend([
                f'"{username}" site:{domain}',
                f'"{email}" site:{domain}',
                f'"{username}" "@{domain}"',
                f'site:{domain} "{username}"',
                f'"{username}" domain:{domain}'
            ])
        
        for pattern in email_patterns:
            dorks.append({
                'query': pattern,
                'description': f'Email-specific search: {pattern}',
                'category': 'email_search',
                'priority': 8,
                'confidence': 0.85
            })
        
        return dorks
    
    def _generate_phone_dorks(self, phone: str) -> List[Dict[str, Any]]:
        """Generate comprehensive phone-specific dorks with international format support"""
        dorks = []
        
        # Clean phone number for search variations
        clean_phone = re.sub(r'[^\d]', '', phone)
        
        phone_patterns = [
            f'"{phone}"',
            f'"{clean_phone}"',
            f'"{phone}" contact',
            f'"{phone}" phone',
            f'"{phone}" number',
            f'"{phone}" whatsapp',
            f'"{phone}" telegram',
            f'"{phone}" signal',
            f'"{phone}" viber'
        ]
        
        # Generate international and formatted variations
        if len(clean_phone) >= 10:
            # US format variations
            if len(clean_phone) == 10:
                us_format = f"({clean_phone[:3]}) {clean_phone[3:6]}-{clean_phone[6:10]}"
                dash_format = f"{clean_phone[:3]}-{clean_phone[3:6]}-{clean_phone[6:10]}"
                dot_format = f"{clean_phone[:3]}.{clean_phone[3:6]}.{clean_phone[6:10]}"
                
                phone_patterns.extend([
                    f'"{us_format}"',
                    f'"{dash_format}"',
                    f'"{dot_format}"'
                ])
            
            # International format variations
            if len(clean_phone) >= 11:
                # +1 country code format
                intl_format = f"+{clean_phone[0]} {clean_phone[1:4]} {clean_phone[4:7]} {clean_phone[7:]}"
                intl_dash = f"+{clean_phone[0]}-{clean_phone[1:4]}-{clean_phone[4:7]}-{clean_phone[7:]}"
                
                phone_patterns.extend([
                    f'"{intl_format}"',
                    f'"{intl_dash}"'
                ])
        
        for pattern in phone_patterns:
            dorks.append({
                'query': pattern,
                'description': f'Phone-specific search: {pattern}',
                'category': 'phone_search',
                'priority': 8,
                'confidence': 0.85
            })
        
        return dorks
    
    def _generate_username_dorks(self, username: str) -> List[Dict[str, Any]]:
        """Generate comprehensive username-specific dorks"""
        dorks = []
        
        username_patterns = [
            f'"{username}"',
            f'"{username}" profile',
            f'"{username}" user',
            f'"{username}" account',
            f'inurl:"{username}"',
            f'intitle:"{username}"',
            f'"{username}" social',
            f'"{username}" online'
        ]
        
        # Platform-specific username searches
        for platform in self.social_platforms.keys():
            username_patterns.extend([
                f'"{username}" site:{platform}.com',
                f'site:{platform}.com "{username}"'
            ])
        
        # Username variations
        variations = [
            username.lower(),
            username.upper(),
            username.replace('_', ''),
            username.replace('.', ''),
            username.replace('-', ''),
            username.replace('_', '.'),
            username.replace('_', '-'),
            username.replace('.', '_'),
            username.replace('-', '_')
        ]
        
        for variation in set(variations):
            if variation != username and len(variation) > 2:
                username_patterns.append(f'"{variation}"')
        
        for pattern in username_patterns:
            dorks.append({
                'query': pattern,
                'description': f'Username-specific search: {pattern}',
                'category': 'username_search',
                'priority': 7,
                'confidence': 0.75
            })
        
        return dorks
    
    def _generate_advanced_combination_dorks(self, search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate advanced combination dorks for enhanced targeting"""
        dorks = []
        
        name = self._get_full_name(search_params)
        email = search_params.get('email', '')
        phone = search_params.get('phone', '')
        location = search_params.get('location', '')
        company = search_params.get('company', '')
        
        # Multi-field Boolean combinations
        if name and email and location:
            dorks.append({
                'query': f'("{name}" OR "{email}") "{location}"',
                'description': f'Name or email in {location}',
                'category': 'advanced_combination',
                'priority': 9,
                'confidence': 0.85
            })
        
        if name and phone and company:
            dorks.append({
                'query': f'("{name}" OR "{phone}") "{company}"',
                'description': f'Name or phone at {company}',
                'category': 'advanced_combination',
                'priority': 9,
                'confidence': 0.85
            })
        
        # Social media and professional combination
        if name:
            dorks.append({
                'query': f'"{name}" (site:linkedin.com OR site:facebook.com OR site:twitter.com OR site:instagram.com)',
                'description': f'Major social media profiles for {name}',
                'category': 'advanced_combination',
                'priority': 8,
                'confidence': 0.8
            })
        
        # Contact information combinations
        if name and (email or phone):
            contact = email or phone
            dorks.append({
                'query': f'"{name}" "{contact}" (contact OR about OR profile)',
                'description': f'Contact pages mentioning {name}',
                'category': 'advanced_combination',
                'priority': 8,
                'confidence': 0.8
            })
        
        # Document and media combinations
        if name:
            dorks.append({
                'query': f'"{name}" (filetype:pdf OR filetype:doc OR filetype:ppt) (resume OR cv OR bio)',
                'description': f'Professional documents for {name}',
                'category': 'advanced_combination',
                'priority': 7,
                'confidence': 0.75
            })
        
        return dorks
    
    def _deduplicate_dorks(self, dorks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate dorks based on query"""
        seen_queries = set()
        unique_dorks = []
        
        for dork in dorks:
            query = dork.get('query', '').lower().strip()
            if query and query not in seen_queries:
                seen_queries.add(query)
                unique_dorks.append(dork)
        
        return unique_dorks
    
    def generate_dork_url(self, query: str) -> str:
        """Generate Google search URL for a dork query"""
        encoded_query = quote_plus(query)
        return f"{self.base_url}{encoded_query}"
    
    def estimate_dork_results(self, query: str) -> int:
        """Estimate number of results for a dork query with enhanced heuristics"""
        base_estimate = 5000
        
        # Adjust based on search operators and specificity
        specificity_multiplier = 1.0
        
        # Site operators reduce results significantly
        site_count = len(re.findall(r'site:', query, re.IGNORECASE))
        specificity_multiplier *= (0.2 ** site_count)
        
        # Filetype operators are very specific
        if 'filetype:' in query.lower():
            specificity_multiplier *= 0.1
        
        # Intitle and inurl operators
        if 'intitle:' in query.lower():
            specificity_multiplier *= 0.3
        if 'inurl:' in query.lower():
            specificity_multiplier *= 0.4
        
        # Quoted terms increase specificity
        quoted_terms = len(re.findall(r'"[^"]*"', query))
        specificity_multiplier *= (0.6 ** quoted_terms)
        
        # Boolean operators (OR increases, AND decreases results)
        or_count = len(re.findall(r'\bOR\b', query, re.IGNORECASE))
        and_count = len(re.findall(r'\bAND\b', query, re.IGNORECASE))
        specificity_multiplier *= (2.0 ** or_count) * (0.5 ** and_count)
        
        # Very long queries are usually more specific
        word_count = len(query.split())
        if word_count > 6:
            specificity_multiplier *= 0.7
        
        estimated_results = int(base_estimate * specificity_multiplier)
        return max(1, min(estimated_results, 1000000))  # Cap between 1 and 1M
    
    def get_supported_countries(self) -> List[str]:
        """Get list of all supported countries for worldwide search"""
        return sorted(list(self.country_domains.keys()))
    
    def get_dork_categories(self) -> List[str]:
        """Get list of all dork categories"""
        return [
            'basic_search',
            'location_search',
            'company_search',
            'name_variation',
            'social_media',
            'professional',
            'documents',
            'contact_info',
            'media',
            'public_records',
            'location_specific',
            'education',
            'email_search',
            'phone_search',
            'username_search',
            'disambiguation',
            'advanced_combination'
        ]
    
    def filter_dorks_by_category(self, dorks: List[Dict[str, Any]], categories: List[str]) -> List[Dict[str, Any]]:
        """Filter dorks by specified categories"""
        return [dork for dork in dorks if dork.get('category') in categories]
    
    def filter_dorks_by_country(self, dorks: List[Dict[str, Any]], country: str) -> List[Dict[str, Any]]:
        """Filter dorks by specific country"""
        return [dork for dork in dorks if dork.get('country') == country or dork.get('category') != 'location_specific']
    
    def get_dorks_by_priority(self, dorks: List[Dict[str, Any]], min_priority: int = 5) -> List[Dict[str, Any]]:
        """Get dorks with priority above specified threshold"""
        return [dork for dork in dorks if dork.get('priority', 0) >= min_priority]
    
    def get_high_confidence_dorks(self, dorks: List[Dict[str, Any]], min_confidence: float = 0.7) -> List[Dict[str, Any]]:
        """Get dorks with confidence above specified threshold"""
        return [dork for dork in dorks if dork.get('confidence', 0) >= min_confidence]
    
    def generate_dork_summary(self, dorks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate a summary of the generated dorks"""
        if not dorks:
            return {'total': 0, 'categories': {}, 'avg_confidence': 0, 'avg_priority': 0}
        
        categories = {}
        confidences = []
        priorities = []
        
        for dork in dorks:
            category = dork.get('category', 'unknown')
            categories[category] = categories.get(category, 0) + 1
            
            if 'confidence' in dork:
                confidences.append(dork['confidence'])
            if 'priority' in dork:
                priorities.append(dork['priority'])
        
        return {
            'total': len(dorks),
            'categories': categories,
            'avg_confidence': sum(confidences) / len(confidences) if confidences else 0,
            'avg_priority': sum(priorities) / len(priorities) if priorities else 0,
            'high_priority_count': len([d for d in dorks if d.get('priority', 0) >= 8]),
            'high_confidence_count': len([d for d in dorks if d.get('confidence', 0) >= 0.8])
        }