import asyncio
import aiohttp
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
import socket
import ssl
import dns.resolver
import whois
import subprocess
import ipaddress
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class DomainIntelligence:
    """Advanced domain and IP intelligence gathering"""
    
    def __init__(self):
        self.tools_config = {
            'subdomain_enumeration': ['subfinder', 'assetfinder', 'amass', 'sublist3r'],
            'port_scanning': ['nmap', 'masscan', 'rustscan'],
            'web_crawling': ['waybackurls', 'gau', 'hakrawler'],
            'vulnerability_scanning': ['nuclei', 'nikto', 'dirb'],
            'ssl_analysis': ['sslscan', 'testssl.sh'],
            'dns_enumeration': ['dnsrecon', 'fierce', 'dnsmap'],
            'threat_intelligence': ['virustotal', 'abuseipdb', 'urlvoid']
        }
        
        self.executor = ThreadPoolExecutor(max_workers=5)
    
    async def analyze_domain(self, request) -> Dict[str, Any]:
        """Comprehensive domain analysis"""
        domain = request.domain
        ip = request.ip_address
        
        if not domain and not ip:
            raise ValueError("Domain or IP address required")
        
        results = {
            'target': domain or ip,
            'analysis_type': 'domain' if domain else 'ip',
            'timestamp': datetime.now().isoformat(),
            'domain_details': {},
            'subdomains': [],
            'ip_details': {},
            'dns': {},
            'whois': {},
            'security': {},
            'historical': {},
            'threats': {},
            'certificates': {}
        }
        
        try:
            if domain:
                results.update(await self._analyze_domain_comprehensive(domain))
            
            if ip:
                results.update(await self._analyze_ip_comprehensive(ip))
            
        except Exception as e:
            logger.error(f"Domain intelligence error: {str(e)}")
            results['error'] = str(e)
        
        return results
    
    async def _analyze_domain_comprehensive(self, domain: str) -> Dict[str, Any]:
        """Comprehensive domain analysis"""
        analysis = {}
        
        # Parallel analysis tasks
        tasks = [
            self._get_domain_basic_info(domain),
            self._get_whois_info(domain),
            self._get_dns_records(domain),
            self._enumerate_subdomains(domain),
            self._get_ssl_certificates(domain),
            self._check_threat_intelligence(domain),
            self._get_historical_data(domain),
            self._scan_common_ports(domain),
            self._check_web_technologies(domain),
            self._get_security_headers(domain)
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        for i, result in enumerate(results):
            if isinstance(result, dict) and not isinstance(result, Exception):
                analysis.update(result)
            elif isinstance(result, Exception):
                logger.error(f"Domain analysis task {i} failed: {str(result)}")
        
        return analysis
    
    async def _analyze_ip_comprehensive(self, ip: str) -> Dict[str, Any]:
        """Comprehensive IP address analysis"""
        analysis = {}
        
        # Parallel analysis tasks
        tasks = [
            self._get_ip_basic_info(ip),
            self._get_ip_geolocation(ip),
            self._scan_ip_ports(ip),
            self._get_reverse_dns(ip),
            self._check_ip_reputation(ip),
            self._get_ip_whois(ip),
            self._check_ip_services(ip),
            self._get_ssl_certificates_ip(ip),
            self._check_vulnerabilities_ip(ip)
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        for i, result in enumerate(results):
            if isinstance(result, dict) and not isinstance(result, Exception):
                analysis.update(result)
            elif isinstance(result, Exception):
                logger.error(f"IP analysis task {i} failed: {str(result)}")
        
        return analysis
    
    async def _get_domain_basic_info(self, domain: str) -> Dict[str, Any]:
        """Get basic domain information"""
        info = {
            'domain_details': {
                'domain': domain,
                'is_valid': False,
                'is_alive': False,
                'response_time': None,
                'http_status': None,
                'redirects': [],
                'title': None,
                'server': None,
                'technologies': []
            }
        }
        
        try:
            # Check if domain resolves
            try:
                socket.gethostbyname(domain)
                info['domain_details']['is_valid'] = True
            except socket.gaierror:
                info['domain_details']['is_valid'] = False
                return info
            
            # HTTP connectivity check
            async with aiohttp.ClientSession() as session:
                start_time = datetime.now()
                try:
                    async with session.get(f'http://{domain}', timeout=10) as response:
                        end_time = datetime.now()
                        info['domain_details']['is_alive'] = True
                        info['domain_details']['response_time'] = (end_time - start_time).total_seconds()
                        info['domain_details']['http_status'] = response.status
                        info['domain_details']['server'] = response.headers.get('Server', 'Unknown')
                        
                        # Get page title
                        content = await response.text()
                        if '<title>' in content:
                            title_start = content.find('<title>') + 7
                            title_end = content.find('</title>')
                            if title_end > title_start:
                                info['domain_details']['title'] = content[title_start:title_end]
                
                except Exception as e:
                    logger.debug(f"HTTP check failed for {domain}: {str(e)}")
                    
                # HTTPS check
                try:
                    async with session.get(f'https://{domain}', timeout=10) as response:
                        info['domain_details']['supports_https'] = True
                        info['domain_details']['https_status'] = response.status
                except:
                    info['domain_details']['supports_https'] = False
            
        except Exception as e:
            logger.error(f"Domain basic info error: {str(e)}")
            info['domain_details']['error'] = str(e)
        
        return info
    
    async def _get_whois_info(self, domain: str) -> Dict[str, Any]:
        """Get WHOIS information for domain"""
        whois_data = {'whois': {}}
        
        try:
            w = whois.whois(domain)
            
            whois_data['whois'] = {
                'domain_name': w.domain_name,
                'registrar': w.registrar,
                'creation_date': str(w.creation_date) if w.creation_date else None,
                'expiration_date': str(w.expiration_date) if w.expiration_date else None,
                'updated_date': str(w.updated_date) if w.updated_date else None,
                'name_servers': w.name_servers if w.name_servers else [],
                'status': w.status if w.status else [],
                'emails': w.emails if w.emails else [],
                'country': w.country,
                'state': w.state,
                'city': w.city,
                'org': w.org,
                'address': w.address
            }
            
            # Calculate domain age
            if w.creation_date:
                if isinstance(w.creation_date, list):
                    creation_date = w.creation_date[0]
                else:
                    creation_date = w.creation_date
                
                age = datetime.now() - creation_date
                whois_data['whois']['age_days'] = age.days
                whois_data['whois']['age_years'] = round(age.days / 365.25, 1)
            
        except Exception as e:
            logger.error(f"WHOIS error for {domain}: {str(e)}")
            whois_data['whois']['error'] = str(e)
        
        return whois_data
    
    async def _get_dns_records(self, domain: str) -> Dict[str, Any]:
        """Get comprehensive DNS records"""
        dns_data = {
            'dns': {
                'A': [],
                'AAAA': [],
                'MX': [],
                'NS': [],
                'TXT': [],
                'CNAME': [],
                'SOA': [],
                'SRV': []
            }
        }
        
        record_types = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME', 'SOA', 'SRV']
        
        for record_type in record_types:
            try:
                answers = dns.resolver.resolve(domain, record_type)
                dns_data['dns'][record_type] = [str(answer) for answer in answers]
            except:
                pass  # Record type not found or error
        
        return dns_data
    
    async def _enumerate_subdomains(self, domain: str) -> Dict[str, Any]:
        """Enumerate subdomains using multiple tools"""
        subdomain_data = {'subdomains': []}
        
        try:
            # Use multiple subdomain enumeration tools
            tools = ['subfinder', 'assetfinder', 'amass']
            all_subdomains = set()
            
            for tool in tools:
                try:
                    subdomains = await self._run_subdomain_tool(tool, domain)
                    all_subdomains.update(subdomains)
                except Exception as e:
                    logger.debug(f"Subdomain tool {tool} failed: {str(e)}")
            
            # Validate and analyze subdomains
            valid_subdomains = []
            for subdomain in all_subdomains:
                subdomain_info = await self._analyze_subdomain(subdomain)
                if subdomain_info:
                    valid_subdomains.append(subdomain_info)
            
            subdomain_data['subdomains'] = valid_subdomains
            
        except Exception as e:
            logger.error(f"Subdomain enumeration error: {str(e)}")
            subdomain_data['subdomains_error'] = str(e)
        
        return subdomain_data
    
    async def _run_subdomain_tool(self, tool: str, domain: str) -> List[str]:
        """Run specific subdomain enumeration tool"""
        subdomains = []
        
        try:
            if tool == 'subfinder':
                cmd = f'subfinder -d {domain} -silent'
            elif tool == 'assetfinder':
                cmd = f'assetfinder --subs-only {domain}'
            elif tool == 'amass':
                cmd = f'amass enum -passive -d {domain}'
            else:
                return subdomains
            
            # Run command
            result = await asyncio.get_event_loop().run_in_executor(
                self.executor,
                lambda: subprocess.run(cmd.split(), capture_output=True, text=True, timeout=30)
            )
            
            if result.returncode == 0:
                subdomains = result.stdout.strip().split('\n')
                subdomains = [s.strip() for s in subdomains if s.strip()]
            
        except Exception as e:
            logger.debug(f"Subdomain tool {tool} execution error: {str(e)}")
        
        return subdomains
    
    async def _analyze_subdomain(self, subdomain: str) -> Optional[Dict[str, Any]]:
        """Analyze individual subdomain"""
        try:
            # Check if subdomain resolves
            ip = socket.gethostbyname(subdomain)
            
            subdomain_info = {
                'subdomain': subdomain,
                'ip': ip,
                'is_alive': False,
                'http_status': None,
                'https_status': None,
                'title': None,
                'technologies': []
            }
            
            # Quick HTTP check
            async with aiohttp.ClientSession() as session:
                try:
                    async with session.get(f'http://{subdomain}', timeout=5) as response:
                        subdomain_info['is_alive'] = True
                        subdomain_info['http_status'] = response.status
                except:
                    pass
                
                try:
                    async with session.get(f'https://{subdomain}', timeout=5) as response:
                        subdomain_info['https_status'] = response.status
                except:
                    pass
            
            return subdomain_info
            
        except Exception as e:
            logger.debug(f"Subdomain analysis error for {subdomain}: {str(e)}")
            return None
    
    async def _get_ssl_certificates(self, domain: str) -> Dict[str, Any]:
        """Get SSL certificate information"""
        cert_data = {'certificates': {}}
        
        try:
            # Get SSL certificate info
            context = ssl.create_default_context()
            with socket.create_connection((domain, 443), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    cert = ssock.getpeercert()
                    
                    cert_data['certificates'] = {
                        'subject': dict(x[0] for x in cert['subject']),
                        'issuer': dict(x[0] for x in cert['issuer']),
                        'version': cert['version'],
                        'serial_number': cert['serialNumber'],
                        'not_before': cert['notBefore'],
                        'not_after': cert['notAfter'],
                        'subject_alt_name': [x[1] for x in cert.get('subjectAltName', [])]
                    }
                    
        except Exception as e:
            logger.debug(f"SSL certificate error for {domain}: {str(e)}")
            cert_data['certificates']['error'] = str(e)
        
        return cert_data
    
    async def _check_threat_intelligence(self, domain: str) -> Dict[str, Any]:
        """Check domain against threat intelligence sources"""
        threat_data = {'threats': {}}
        
        try:
            # Check multiple threat intelligence sources
            threat_sources = [
                self._check_virustotal_domain(domain),
                self._check_urlvoid(domain),
                self._check_malware_domains(domain),
                self._check_phishing_databases(domain)
            ]
            
            threat_results = await asyncio.gather(*threat_sources, return_exceptions=True)
            
            for result in threat_results:
                if isinstance(result, dict):
                    threat_data['threats'].update(result)
            
        except Exception as e:
            logger.error(f"Threat intelligence error: {str(e)}")
            threat_data['threats']['error'] = str(e)
        
        return threat_data
    
    async def _get_historical_data(self, domain: str) -> Dict[str, Any]:
        """Get historical data for domain"""
        historical_data = {'historical': {}}
        
        try:
            # Wayback machine data
            historical_data['historical'].update(await self._get_wayback_data(domain))
            
            # DNS history
            historical_data['historical'].update(await self._get_dns_history(domain))
            
            # WHOIS history
            historical_data['historical'].update(await self._get_whois_history(domain))
            
        except Exception as e:
            logger.error(f"Historical data error: {str(e)}")
            historical_data['historical']['error'] = str(e)
        
        return historical_data
    
    # Additional analysis methods for IP addresses
    async def _get_ip_basic_info(self, ip: str) -> Dict[str, Any]:
        """Get basic IP information"""
        info = {'ip_details': {'ip': ip}}
        
        try:
            # Validate IP
            ip_obj = ipaddress.ip_address(ip)
            info['ip_details']['version'] = ip_obj.version
            info['ip_details']['is_private'] = ip_obj.is_private
            info['ip_details']['is_loopback'] = ip_obj.is_loopback
            info['ip_details']['is_multicast'] = ip_obj.is_multicast
            
        except Exception as e:
            logger.error(f"IP basic info error: {str(e)}")
            info['ip_details']['error'] = str(e)
        
        return info
    
    async def _get_ip_geolocation(self, ip: str) -> Dict[str, Any]:
        """Get IP geolocation information"""
        geo_data = {'geolocation': {}}
        
        try:
            # Use IP geolocation API
            async with aiohttp.ClientSession() as session:
                async with session.get(f'http://ip-api.com/json/{ip}') as response:
                    if response.status == 200:
                        data = await response.json()
                        geo_data['geolocation'] = {
                            'country': data.get('country'),
                            'region': data.get('regionName'),
                            'city': data.get('city'),
                            'zip': data.get('zip'),
                            'lat': data.get('lat'),
                            'lon': data.get('lon'),
                            'timezone': data.get('timezone'),
                            'isp': data.get('isp'),
                            'org': data.get('org'),
                            'as': data.get('as')
                        }
            
        except Exception as e:
            logger.error(f"IP geolocation error: {str(e)}")
            geo_data['geolocation']['error'] = str(e)
        
        return geo_data
    
    # Placeholder methods for additional functionality
    async def _scan_common_ports(self, domain: str): pass
    async def _check_web_technologies(self, domain: str): pass
    async def _get_security_headers(self, domain: str): pass
    async def _scan_ip_ports(self, ip: str): pass
    async def _get_reverse_dns(self, ip: str): pass
    async def _check_ip_reputation(self, ip: str): pass
    async def _get_ip_whois(self, ip: str): pass
    async def _check_ip_services(self, ip: str): pass
    async def _get_ssl_certificates_ip(self, ip: str): pass
    async def _check_vulnerabilities_ip(self, ip: str): pass
    async def _check_virustotal_domain(self, domain: str): pass
    async def _check_urlvoid(self, domain: str): pass
    async def _check_malware_domains(self, domain: str): pass
    async def _check_phishing_databases(self, domain: str): pass
    async def _get_wayback_data(self, domain: str): pass
    async def _get_dns_history(self, domain: str): pass
    async def _get_whois_history(self, domain: str): pass
