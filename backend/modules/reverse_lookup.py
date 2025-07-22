import asyncio
import aiohttp
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import re
import phonenumbers
import logging
from email_validator import validate_email
import whois
import socket
import dns.resolver

logger = logging.getLogger(__name__)

class ReverseLookupEngine:
    """Advanced reverse lookup engine for phones, emails, IPs, and addresses"""
    
    def __init__(self):
        self.lookup_sources = {
            'phone': [
                'truecaller', 'whitepages', 'spokeo', 'beenverified',
                'intelius', 'pipl', 'social_catfish', 'fastpeoplesearch'
            ],
            'email': [
                'hunter_io', 'emailrep', 'haveibeenpwned', 'breachdirectory',
                'holehe', 'email_permutator', 'clearbit', 'fullcontact'
            ],
            'ip': [
                'shodan', 'censys', 'virustotal', 'abuseipdb',
                'maxmind', 'ipinfo', 'ipapi', 'ipgeolocation'
            ],
            'address': [
                'zillow', 'realtor', 'propertyshark', 'blockshopper',
                'neighborwho', 'homemetry', 'landwatch', 'loopnet'
            ]
        }
    
    async def comprehensive_lookup(self, request) -> Dict[str, Any]:
        """Perform comprehensive reverse lookup based on request type"""
        results = {
            'lookup_type': None,
            'query': None,
            'results': [],
            'sources_used': [],
            'confidence': 0,
            'timestamp': datetime.now().isoformat()
        }
        
        try:
            if request.phone:
                results.update(await self._reverse_phone_lookup(request.phone))
            elif request.email:
                results.update(await self._reverse_email_lookup(request.email))
            elif request.ip_address:
                results.update(await self._reverse_ip_lookup(request.ip_address))
            elif request.location:
                results.update(await self._reverse_address_lookup(request.location))
            else:
                raise ValueError("No valid lookup target provided")
                
        except Exception as e:
            logger.error(f"Comprehensive lookup error: {str(e)}")
            results['error'] = str(e)
        
        return results
    
    async def _reverse_phone_lookup(self, phone: str) -> Dict[str, Any]:
        """Advanced reverse phone number lookup"""
        results = {
            'lookup_type': 'phone',
            'query': phone,
            'results': [],
            'sources_used': [],
            'confidence': 0
        }
        
        try:
            # Phone number validation and formatting
            phone_info = self._analyze_phone_number(phone)
            results['phone_analysis'] = phone_info
            
            if not phone_info['is_valid']:
                results['error'] = "Invalid phone number format"
                return results
            
            # Multiple source lookups
            lookup_tasks = [
                self._lookup_truecaller(phone),
                self._lookup_whitepages_phone(phone),
                self._lookup_spokeo_phone(phone),
                self._lookup_social_media_by_phone(phone),
                self._lookup_business_directories_phone(phone),
                self._lookup_carrier_info(phone),
                self._lookup_spam_databases(phone)
            ]
            
            lookup_results = await asyncio.gather(*lookup_tasks, return_exceptions=True)
            
            for result in lookup_results:
                if isinstance(result, dict) and result.get('data'):
                    results['results'].extend(result['data'])
                    results['sources_used'].extend(result.get('sources', []))
            
            # Calculate confidence score
            results['confidence'] = self._calculate_phone_confidence(results['results'])
            
        except Exception as e:
            logger.error(f"Reverse phone lookup error: {str(e)}")
            results['error'] = str(e)
        
        return results
    
    async def _reverse_email_lookup(self, email: str) -> Dict[str, Any]:
        """Advanced reverse email lookup"""
        results = {
            'lookup_type': 'email',
            'query': email,
            'results': [],
            'sources_used': [],
            'confidence': 0
        }
        
        try:
            # Email validation
            email_validation = validate_email(email)
            email = email_validation.email
            
            # Email analysis
            email_info = self._analyze_email_detailed(email)
            results['email_analysis'] = email_info
            
            # Multiple source lookups
            lookup_tasks = [
                self._lookup_hunter_io(email),
                self._lookup_emailrep(email),
                self._lookup_haveibeenpwned(email),
                self._lookup_holehe(email),
                self._lookup_social_media_by_email(email),
                self._lookup_professional_networks_email(email),
                self._lookup_domain_info(email.split('@')[1]),
                self._lookup_email_reputation(email)
            ]
            
            lookup_results = await asyncio.gather(*lookup_tasks, return_exceptions=True)
            
            for result in lookup_results:
                if isinstance(result, dict) and result.get('data'):
                    results['results'].extend(result['data'])
                    results['sources_used'].extend(result.get('sources', []))
            
            # Calculate confidence score
            results['confidence'] = self._calculate_email_confidence(results['results'])
            
        except Exception as e:
            logger.error(f"Reverse email lookup error: {str(e)}")
            results['error'] = str(e)
        
        return results
    
    async def _reverse_ip_lookup(self, ip_address: str) -> Dict[str, Any]:
        """Advanced reverse IP address lookup"""
        results = {
            'lookup_type': 'ip',
            'query': ip_address,
            'results': [],
            'sources_used': [],
            'confidence': 0
        }
        
        try:
            # IP validation
            socket.inet_aton(ip_address)  # Validates IPv4
            
            # Multiple source lookups
            lookup_tasks = [
                self._lookup_shodan(ip_address),
                self._lookup_censys(ip_address),
                self._lookup_virustotal_ip(ip_address),
                self._lookup_abuseipdb(ip_address),
                self._lookup_maxmind(ip_address),
                self._lookup_reverse_dns(ip_address),
                self._lookup_port_scan(ip_address),
                self._lookup_ssl_certificates(ip_address)
            ]
            
            lookup_results = await asyncio.gather(*lookup_tasks, return_exceptions=True)
            
            for result in lookup_results:
                if isinstance(result, dict) and result.get('data'):
                    results['results'].extend(result['data'])
                    results['sources_used'].extend(result.get('sources', []))
            
            # Calculate confidence score
            results['confidence'] = self._calculate_ip_confidence(results['results'])
            
        except Exception as e:
            logger.error(f"Reverse IP lookup error: {str(e)}")
            results['error'] = str(e)
        
        return results
    
    async def _reverse_address_lookup(self, address: str) -> Dict[str, Any]:
        """Advanced reverse address lookup"""
        results = {
            'lookup_type': 'address',
            'query': address,
            'results': [],
            'sources_used': [],
            'confidence': 0
        }
        
        try:
            # Address parsing and validation
            address_info = self._parse_address(address)
            results['address_analysis'] = address_info
            
            # Multiple source lookups
            lookup_tasks = [
                self._lookup_property_records(address),
                self._lookup_zillow(address),
                self._lookup_realtor_com(address),
                self._lookup_neighbor_lookup(address),
                self._lookup_business_at_address(address),
                self._lookup_voting_records_address(address),
                self._lookup_permit_records(address)
            ]
            
            lookup_results = await asyncio.gather(*lookup_tasks, return_exceptions=True)
            
            for result in lookup_results:
                if isinstance(result, dict) and result.get('data'):
                    results['results'].extend(result['data'])
                    results['sources_used'].extend(result.get('sources', []))
            
            # Calculate confidence score
            results['confidence'] = self._calculate_address_confidence(results['results'])
            
        except Exception as e:
            logger.error(f"Reverse address lookup error: {str(e)}")
            results['error'] = str(e)
        
        return results
    
    def _analyze_phone_number(self, phone: str) -> Dict[str, Any]:
        """Detailed phone number analysis"""
        analysis = {
            'original': phone,
            'formatted': None,
            'country_code': None,
            'country': None,
            'region': None,
            'carrier': None,
            'line_type': None,
            'timezone': [],
            'is_valid': False,
            'is_mobile': False,
            'is_voip': False
        }
        
        try:
            parsed = phonenumbers.parse(phone, None)
            
            if phonenumbers.is_valid_number(parsed):
                analysis['is_valid'] = True
                analysis['formatted'] = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.INTERNATIONAL)
                analysis['country_code'] = parsed.country_code
                analysis['country'] = phonenumbers.geocoder.description_for_number(parsed, "en")
                analysis['carrier'] = phonenumbers.carrier.name_for_number(parsed, "en")
                analysis['timezone'] = list(phonenumbers.timezone.time_zones_for_number(parsed))
                
                number_type = phonenumbers.number_type(parsed)
                analysis['line_type'] = str(number_type)
                analysis['is_mobile'] = number_type in [phonenumbers.PhoneNumberType.MOBILE, phonenumbers.PhoneNumberType.FIXED_LINE_OR_MOBILE]
                analysis['is_voip'] = number_type == phonenumbers.PhoneNumberType.VOIP
                
        except Exception as e:
            logger.error(f"Phone analysis error: {str(e)}")
            analysis['error'] = str(e)
        
        return analysis
    
    def _analyze_email_detailed(self, email: str) -> Dict[str, Any]:
        """Detailed email analysis"""
        analysis = {
            'email': email,
            'username': email.split('@')[0],
            'domain': email.split('@')[1],
            'is_disposable': False,
            'is_role_based': False,
            'is_free_provider': False,
            'domain_analysis': {},
            'mx_records': [],
            'reputation_score': 0
        }
        
        try:
            domain = analysis['domain']
            
            # Check if it's a free email provider
            free_providers = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com']
            analysis['is_free_provider'] = domain.lower() in free_providers
            
            # Check if it's role-based
            role_keywords = ['admin', 'support', 'info', 'contact', 'sales', 'noreply', 'no-reply']
            analysis['is_role_based'] = any(keyword in analysis['username'].lower() for keyword in role_keywords)
            
            # Domain analysis
            analysis['domain_analysis'] = self._analyze_domain(domain)
            
            # MX records
            try:
                mx_records = dns.resolver.resolve(domain, 'MX')
                analysis['mx_records'] = [str(mx) for mx in mx_records]
            except:
                pass
                
        except Exception as e:
            logger.error(f"Email analysis error: {str(e)}")
            analysis['error'] = str(e)
        
        return analysis
    
    def _analyze_domain(self, domain: str) -> Dict[str, Any]:
        """Analyze domain information"""
        analysis = {
            'domain': domain,
            'whois_info': {},
            'creation_date': None,
            'expiration_date': None,
            'registrar': None,
            'name_servers': [],
            'age_days': None
        }
        
        try:
            w = whois.whois(domain)
            
            analysis['whois_info'] = {
                'registrar': w.registrar,
                'creation_date': str(w.creation_date) if w.creation_date else None,
                'expiration_date': str(w.expiration_date) if w.expiration_date else None,
                'name_servers': w.name_servers if w.name_servers else [],
                'status': w.status if w.status else [],
                'country': w.country,
                'org': w.org
            }
            
            if w.creation_date:
                if isinstance(w.creation_date, list):
                    creation_date = w.creation_date[0]
                else:
                    creation_date = w.creation_date
                
                age = datetime.now() - creation_date
                analysis['age_days'] = age.days
                
        except Exception as e:
            logger.error(f"Domain analysis error: {str(e)}")
            analysis['error'] = str(e)
        
        return analysis
    
    def _parse_address(self, address: str) -> Dict[str, Any]:
        """Parse and analyze address components"""
        analysis = {
            'original': address,
            'street_number': None,
            'street_name': None,
            'city': None,
            'state': None,
            'zip_code': None,
            'country': None,
            'coordinates': {},
            'address_type': None
        }
        
        # Basic address parsing (can be enhanced with geocoding APIs)
        parts = address.split(',')
        if len(parts) >= 2:
            analysis['street_name'] = parts[0].strip()
            analysis['city'] = parts[1].strip() if len(parts) > 1 else None
            analysis['state'] = parts[2].strip() if len(parts) > 2 else None
            analysis['zip_code'] = parts[3].strip() if len(parts) > 3 else None
        
        return analysis
    
    def _calculate_phone_confidence(self, results: List) -> float:
        """Calculate confidence score for phone lookup results"""
        if not results:
            return 0.0
        
        score = 0.0
        for result in results:
            if result.get('source') == 'carrier_official':
                score += 0.3
            elif result.get('source') == 'directory_listing':
                score += 0.2
            elif result.get('source') == 'social_media':
                score += 0.15
            elif result.get('verified'):
                score += 0.1
        
        return min(score, 1.0)
    
    def _calculate_email_confidence(self, results: List) -> float:
        """Calculate confidence score for email lookup results"""
        if not results:
            return 0.0
        
        score = 0.0
        for result in results:
            if result.get('source') == 'professional_network':
                score += 0.25
            elif result.get('source') == 'breach_database':
                score += 0.2
            elif result.get('source') == 'social_media':
                score += 0.15
            elif result.get('verified'):
                score += 0.1
        
        return min(score, 1.0)
    
    def _calculate_ip_confidence(self, results: List) -> float:
        """Calculate confidence score for IP lookup results"""
        if not results:
            return 0.0
        
        score = 0.0
        for result in results:
            if result.get('source') == 'shodan':
                score += 0.3
            elif result.get('source') == 'censys':
                score += 0.25
            elif result.get('source') == 'reverse_dns':
                score += 0.2
            elif result.get('verified'):
                score += 0.1
        
        return min(score, 1.0)
    
    def _calculate_address_confidence(self, results: List) -> float:
        """Calculate confidence score for address lookup results"""
        if not results:
            return 0.0
        
        score = 0.0
        for result in results:
            if result.get('source') == 'property_records':
                score += 0.4
            elif result.get('source') == 'voting_records':
                score += 0.3
            elif result.get('source') == 'business_registration':
                score += 0.2
            elif result.get('verified'):
                score += 0.1
        
        return min(score, 1.0)
    
    # Placeholder methods for specific lookup implementations
    async def _lookup_truecaller(self, phone): pass
    async def _lookup_whitepages_phone(self, phone): pass
    async def _lookup_spokeo_phone(self, phone): pass
    async def _lookup_social_media_by_phone(self, phone): pass
    async def _lookup_business_directories_phone(self, phone): pass
    async def _lookup_carrier_info(self, phone): pass
    async def _lookup_spam_databases(self, phone): pass
    async def _lookup_hunter_io(self, email): pass
    async def _lookup_emailrep(self, email): pass
    async def _lookup_haveibeenpwned(self, email): pass
    async def _lookup_holehe(self, email): pass
    async def _lookup_social_media_by_email(self, email): pass
    async def _lookup_professional_networks_email(self, email): pass
    async def _lookup_domain_info(self, domain): pass
    async def _lookup_email_reputation(self, email): pass
    async def _lookup_shodan(self, ip): pass
    async def _lookup_censys(self, ip): pass
    async def _lookup_virustotal_ip(self, ip): pass
    async def _lookup_abuseipdb(self, ip): pass
    async def _lookup_maxmind(self, ip): pass
    async def _lookup_reverse_dns(self, ip): pass
    async def _lookup_port_scan(self, ip): pass
    async def _lookup_ssl_certificates(self, ip): pass
    async def _lookup_property_records(self, address): pass
    async def _lookup_zillow(self, address): pass
    async def _lookup_realtor_com(self, address): pass
    async def _lookup_neighbor_lookup(self, address): pass
    async def _lookup_business_at_address(self, address): pass
    async def _lookup_voting_records_address(self, address): pass
    async def _lookup_permit_records(self, address): pass
