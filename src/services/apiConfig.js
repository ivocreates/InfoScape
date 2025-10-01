// API Configuration for InfoScope OSINT Platform v2.3.0
// Real working APIs for professional investigations

export const API_ENDPOINTS = {
  // IP Intelligence APIs
  IP_INTELLIGENCE: {
    IPINFO: {
      base: 'https://ipinfo.io',
      free: true,
      rateLimit: '50k/month',
      features: ['location', 'ISP', 'organization', 'timezone']
    },
    IPAPI: {
      base: 'https://ipapi.co',
      free: true,
      rateLimit: '30k/month',
      features: ['geolocation', 'ISP', 'threat', 'VPN detection']
    },
    VIRUSTOTAL: {
      base: 'https://www.virustotal.com/vtapi/v2',
      apiKey: true,
      features: ['malware scan', 'reputation', 'community comments']
    },
    SHODAN: {
      base: 'https://api.shodan.io',
      apiKey: true,
      features: ['port scan', 'vulnerabilities', 'services', 'banners']
    },
    ABUSEIPDB: {
      base: 'https://api.abuseipdb.com/api/v2',
      apiKey: true,
      features: ['abuse reports', 'confidence score', 'country']
    }
  },

  // Email Analysis APIs
  EMAIL_ANALYSIS: {
    HUNTER: {
      base: 'https://api.hunter.io/v2',
      apiKey: true,
      features: ['domain search', 'email finder', 'verification']
    },
    EMAILREP: {
      base: 'https://emailrep.io',
      free: true,
      features: ['reputation', 'blacklist', 'suspicious activity']
    },
    HAVEIBEENPWNED: {
      base: 'https://haveibeenpwned.com/api/v3',
      apiKey: true,
      features: ['breach data', 'paste dumps', 'domain breaches']
    },
    CLEARBIT: {
      base: 'https://person.clearbit.com/v2',
      apiKey: true,
      features: ['person enrichment', 'company data', 'social profiles']
    }
  },

  // Domain Research APIs
  DOMAIN_RESEARCH: {
    WHOIS: {
      base: 'https://www.whoisxmlapi.com/whoisserver/WhoisService',
      apiKey: true,
      features: ['domain info', 'registrar', 'creation date', 'nameservers']
    },
    SECURITYTRAILS: {
      base: 'https://api.securitytrails.com/v1',
      apiKey: true,
      features: ['DNS history', 'subdomains', 'certificates', 'IP history']
    },
    URLVOID: {
      base: 'https://api.urlvoid.com/v1',
      apiKey: true,
      features: ['reputation', 'blacklist check', 'safety report']
    },
    WAYBACK: {
      base: 'https://web.archive.org/wayback/available',
      free: true,
      features: ['historical snapshots', 'archive dates', 'page changes']
    }
  },

  // Social Media APIs
  SOCIAL_MEDIA: {
    SOCIAL_SEARCHER: {
      base: 'https://api.social-searcher.com/v2',
      apiKey: true,
      features: ['username search', 'social profiles', 'posts analysis']
    },
    PIPL: {
      base: 'https://api.pipl.com/search',
      apiKey: true,
      features: ['person search', 'social profiles', 'contact info']
    },
    FULLCONTACT: {
      base: 'https://api.fullcontact.com/v3',
      apiKey: true,
      features: ['person enrichment', 'social verification', 'demographics']
    }
  },

  // Phone Lookup APIs
  PHONE_LOOKUP: {
    NUMVERIFY: {
      base: 'https://apilayer.net/api/validate',
      apiKey: true,
      features: ['validation', 'carrier', 'location', 'line type']
    },
    TWILIO: {
      base: 'https://lookups.twilio.com/v1',
      apiKey: true,
      features: ['carrier lookup', 'caller name', 'SMS capabilities']
    },
    TRUECALLER: {
      base: 'https://search5-noneu.truecaller.com/v2/search',
      free: true,
      features: ['caller ID', 'spam detection', 'name lookup']
    }
  },

  // Geolocation APIs
  GEOLOCATION: {
    OPENCAGE: {
      base: 'https://api.opencagedata.com/geocode/v1',
      apiKey: true,
      features: ['geocoding', 'reverse geocoding', 'timezone']
    },
    MAPBOX: {
      base: 'https://api.mapbox.com/geocoding/v5',
      apiKey: true,
      features: ['places search', 'coordinates', 'boundaries']
    },
    GEOJS: {
      base: 'https://get.geojs.io/v1/ip',
      free: true,
      features: ['IP geolocation', 'country', 'city', 'timezone']
    }
  }
};

// Free APIs that don't require keys
export const FREE_APIS = {
  ipapi: 'https://ipapi.co/{ip}/json/',
  geojs: 'https://get.geojs.io/v1/ip/{ip}.json',
  emailrep: 'https://emailrep.io/{email}',
  wayback: 'https://web.archive.org/wayback/available?url={url}',
  whois: 'https://www.whoisxmlapi.com/whoisserver/WhoisService?domainName={domain}&outputFormat=json'
};

// API key management
export const API_KEYS = {
  // Users can add their API keys here
  VIRUSTOTAL: localStorage.getItem('vt_api_key') || '',
  SHODAN: localStorage.getItem('shodan_api_key') || '',
  HUNTER: localStorage.getItem('hunter_api_key') || '',
  IPINFO: localStorage.getItem('ipinfo_api_key') || '',
  ABUSEIPDB: localStorage.getItem('abuseipdb_api_key') || '',
  HAVEIBEENPWNED: localStorage.getItem('hibp_api_key') || '',
  CLEARBIT: localStorage.getItem('clearbit_api_key') || '',
  WHOIS: localStorage.getItem('whois_api_key') || '',
  SECURITYTRAILS: localStorage.getItem('securitytrails_api_key') || '',
  URLVOID: localStorage.getItem('urlvoid_api_key') || '',
  NUMVERIFY: localStorage.getItem('numverify_api_key') || '',
  TWILIO: localStorage.getItem('twilio_api_key') || '',
  OPENCAGE: localStorage.getItem('opencage_api_key') || '',
  MAPBOX: localStorage.getItem('mapbox_api_key') || ''
};

// Rate limiting configuration
export const RATE_LIMITS = {
  FREE_TIER: {
    requests_per_minute: 10,
    requests_per_hour: 100,
    requests_per_day: 1000
  },
  PREMIUM_TIER: {
    requests_per_minute: 60,
    requests_per_hour: 1000,
    requests_per_day: 10000
  }
};

// Error messages and status codes
export const API_ERRORS = {
  RATE_LIMIT: 'Rate limit exceeded. Please wait before making more requests.',
  INVALID_KEY: 'Invalid API key. Please check your configuration.',
  NOT_FOUND: 'No data found for the provided input.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  QUOTA_EXCEEDED: 'API quota exceeded. Consider upgrading your plan.'
};

// Helper function to save API keys
export const saveApiKey = (service, key) => {
  localStorage.setItem(`${service.toLowerCase()}_api_key`, key);
  API_KEYS[service.toUpperCase()] = key;
};

// Helper function to get API key
export const getApiKey = (service) => {
  return localStorage.getItem(`${service.toLowerCase()}_api_key`) || '';
};

// Helper function to check if API key is configured
export const hasApiKey = (service) => {
  const key = getApiKey(service);
  return key && key.length > 0;
};

// Default headers for API requests
export const getDefaultHeaders = (service) => {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'InfoScope-OSINT/2.3.0'
  };

  const apiKey = getApiKey(service);
  if (apiKey) {
    switch (service.toLowerCase()) {
      case 'virustotal':
        headers['apikey'] = apiKey;
        break;
      case 'shodan':
        headers['key'] = apiKey;
        break;
      case 'hunter':
        headers['api_key'] = apiKey;
        break;
      case 'abuseipdb':
        headers['Key'] = apiKey;
        break;
      case 'haveibeenpwned':
        headers['hibp-api-key'] = apiKey;
        break;
      default:
        headers['Authorization'] = `Bearer ${apiKey}`;
    }
  }

  return headers;
};

export default {
  API_ENDPOINTS,
  FREE_APIS,
  API_KEYS,
  RATE_LIMITS,
  API_ERRORS,
  saveApiKey,
  getApiKey,
  hasApiKey,
  getDefaultHeaders
};