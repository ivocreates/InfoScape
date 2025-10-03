// Real OSINT API Integration Service
// Handles actual connections to external OSINT services with proper authentication

class OSINTAPIService {
  constructor() {
    this.apiKeys = {
      shodan: process.env.REACT_APP_SHODAN_API_KEY || '',
      virustotal: process.env.REACT_APP_VIRUSTOTAL_API_KEY || '',
      hunter: process.env.REACT_APP_HUNTER_API_KEY || '',
      haveibeenpwned: process.env.REACT_APP_HIBP_API_KEY || '',
      censys: process.env.REACT_APP_CENSYS_API_KEY || '',
      securitytrails: process.env.REACT_APP_SECURITYTRAILS_API_KEY || ''
    };
    
    this.rateLimits = new Map();
    this.cache = new Map();
  }

  // Rate limiting helper
  async checkRateLimit(service, limit = 60, window = 60000) {
    const now = Date.now();
    const key = service;
    
    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, []);
    }
    
    const requests = this.rateLimits.get(key);
    const validRequests = requests.filter(time => now - time < window);
    
    if (validRequests.length >= limit) {
      throw new Error(`Rate limit exceeded for ${service}. Try again later.`);
    }
    
    validRequests.push(now);
    this.rateLimits.set(key, validRequests);
  }

  // Cache helper
  getCached(key, maxAge = 300000) { // 5 minutes default
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < maxAge) {
      return cached.data;
    }
    return null;
  }

  setCached(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Shodan API Integration
  async shodanSearch(query) {
    try {
      await this.checkRateLimit('shodan', 100);
      
      const cacheKey = `shodan_search_${query}`;
      const cached = this.getCached(cacheKey);
      if (cached) return cached;

      if (!this.apiKeys.shodan) {
        throw new Error('Shodan API key not configured');
      }

      const response = await fetch(`https://api.shodan.io/shodan/host/search?key=${this.apiKeys.shodan}&query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Shodan API error: ${response.status}`);
      }

      const data = await response.json();
      this.setCached(cacheKey, data);
      
      return {
        query,
        total: data.total,
        matches: data.matches?.slice(0, 10).map(match => ({
          ip: match.ip_str,
          port: match.port,
          org: match.org,
          location: match.location,
          hostnames: match.hostnames,
          data: match.data?.substring(0, 200),
          timestamp: match.timestamp
        })) || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Shodan API Error:', error);
      return {
        error: error.message,
        mockData: this.getMockShodanData(query)
      };
    }
  }

  // VirusTotal API Integration
  async virusTotalScan(resource, type = 'domain') {
    try {
      await this.checkRateLimit('virustotal', 4); // 4 requests per minute for free tier
      
      const cacheKey = `vt_${type}_${resource}`;
      const cached = this.getCached(cacheKey);
      if (cached) return cached;

      if (!this.apiKeys.virustotal) {
        throw new Error('VirusTotal API key not configured');
      }

      const url = type === 'domain' 
        ? `https://www.virustotal.com/vtapi/v2/domain/report`
        : `https://www.virustotal.com/vtapi/v2/ip-address/report`;

      const response = await fetch(`${url}?apikey=${this.apiKeys.virustotal}&domain=${resource}`);
      
      if (!response.ok) {
        throw new Error(`VirusTotal API error: ${response.status}`);
      }

      const data = await response.json();
      this.setCached(cacheKey, data);
      
      return {
        resource,
        detected_urls: data.detected_urls?.slice(0, 5) || [],
        resolutions: data.resolutions?.slice(0, 10) || [],
        categories: data.categories || {},
        reputation: data.reputation || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('VirusTotal API Error:', error);
      return {
        error: error.message,
        mockData: this.getMockVirusTotalData(resource)
      };
    }
  }

  // Hunter.io Email Finder API
  async hunterEmailFinder(domain) {
    try {
      await this.checkRateLimit('hunter', 25); // 25 requests per month for free
      
      const cacheKey = `hunter_${domain}`;
      const cached = this.getCached(cacheKey);
      if (cached) return cached;

      if (!this.apiKeys.hunter) {
        throw new Error('Hunter.io API key not configured');
      }

      const response = await fetch(`https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${this.apiKeys.hunter}`);
      
      if (!response.ok) {
        throw new Error(`Hunter.io API error: ${response.status}`);
      }

      const data = await response.json();
      this.setCached(cacheKey, data);
      
      return {
        domain,
        organization: data.data?.organization,
        emails: data.data?.emails?.slice(0, 10).map(email => ({
          value: email.value,
          type: email.type,
          confidence: email.confidence,
          sources: email.sources?.length || 0
        })) || [],
        total_emails: data.data?.total || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Hunter.io API Error:', error);
      return {
        error: error.message,
        mockData: this.getMockHunterData(domain)
      };
    }
  }

  // Have I Been Pwned API
  async haveibeenpwnedCheck(email) {
    try {
      await this.checkRateLimit('hibp', 10); // Conservative rate limiting
      
      const cacheKey = `hibp_${email}`;
      const cached = this.getCached(cacheKey);
      if (cached) return cached;

      // HIBP API requires a user agent and API key for breach searches
      const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`, {
        headers: {
          'hibp-api-key': this.apiKeys.haveibeenpwned,
          'User-Agent': 'InfoScope-OSINT-Tool'
        }
      });

      if (response.status === 404) {
        // No breaches found
        const result = {
          email,
          breaches: [],
          total_breaches: 0,
          status: 'clean',
          timestamp: new Date().toISOString()
        };
        this.setCached(cacheKey, result);
        return result;
      }

      if (!response.ok) {
        throw new Error(`HIBP API error: ${response.status}`);
      }

      const data = await response.json();
      const result = {
        email,
        breaches: data.slice(0, 5).map(breach => ({
          name: breach.Name,
          title: breach.Title,
          domain: breach.Domain,
          breach_date: breach.BreachDate,
          added_date: breach.AddedDate,
          pwn_count: breach.PwnCount,
          description: breach.Description?.substring(0, 200),
          data_classes: breach.DataClasses
        })),
        total_breaches: data.length,
        status: data.length > 0 ? 'pwned' : 'clean',
        timestamp: new Date().toISOString()
      };
      
      this.setCached(cacheKey, result);
      return result;
    } catch (error) {
      console.error('HIBP API Error:', error);
      return {
        error: error.message,
        mockData: this.getMockHIBPData(email)
      };
    }
  }

  // SecurityTrails API for DNS History
  async securityTrailsDNS(domain) {
    try {
      await this.checkRateLimit('securitytrails', 50);
      
      const cacheKey = `st_dns_${domain}`;
      const cached = this.getCached(cacheKey);
      if (cached) return cached;

      if (!this.apiKeys.securitytrails) {
        throw new Error('SecurityTrails API key not configured');
      }

      const response = await fetch(`https://api.securitytrails.com/v1/domain/${domain}`, {
        headers: {
          'APIKEY': this.apiKeys.securitytrails
        }
      });

      if (!response.ok) {
        throw new Error(`SecurityTrails API error: ${response.status}`);
      }

      const data = await response.json();
      this.setCached(cacheKey, data);
      
      return {
        domain,
        current_dns: data.current_dns || {},
        subdomain_count: data.subdomain_count || 0,
        alexa_rank: data.alexa_rank || null,
        apex_domain: data.apex_domain,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('SecurityTrails API Error:', error);
      return {
        error: error.message,
        mockData: this.getMockSecurityTrailsData(domain)
      };
    }
  }

  // Mock data generators for fallback
  getMockShodanData(query) {
    return {
      query,
      total: 156,
      matches: [
        {
          ip: '192.168.1.1',
          port: 80,
          org: 'Example ISP',
          location: { country_name: 'United States', city: 'San Francisco' },
          hostnames: ['example.com'],
          data: 'HTTP/1.1 200 OK\nServer: Apache/2.4.41',
          timestamp: new Date().toISOString()
        }
      ],
      note: 'Mock data - Configure Shodan API key for real results'
    };
  }

  getMockVirusTotalData(resource) {
    return {
      resource,
      detected_urls: [],
      resolutions: [
        { ip_address: '192.168.1.1', last_resolved: '2023-10-01' }
      ],
      categories: { 'technology': 'clean' },
      reputation: 85,
      note: 'Mock data - Configure VirusTotal API key for real results'
    };
  }

  getMockHunterData(domain) {
    return {
      domain,
      organization: 'Example Company',
      emails: [
        { value: `admin@${domain}`, type: 'generic', confidence: 95, sources: 3 },
        { value: `info@${domain}`, type: 'generic', confidence: 90, sources: 2 }
      ],
      total_emails: 2,
      note: 'Mock data - Configure Hunter.io API key for real results'
    };
  }

  getMockHIBPData(email) {
    return {
      email,
      breaches: Math.random() > 0.7 ? [
        {
          name: 'ExampleBreach2023',
          title: 'Example Data Breach',
          domain: 'example.com',
          breach_date: '2023-05-15',
          added_date: '2023-05-20',
          pwn_count: 1500000,
          description: 'A mock data breach for demonstration purposes',
          data_classes: ['Email addresses', 'Passwords']
        }
      ] : [],
      total_breaches: Math.random() > 0.7 ? 1 : 0,
      status: Math.random() > 0.7 ? 'pwned' : 'clean',
      note: 'Mock data - Configure HIBP API key for real results'
    };
  }

  getMockSecurityTrailsData(domain) {
    return {
      domain,
      current_dns: {
        a: { values: [{ ip: '192.168.1.1', first_seen: '2023-01-01' }] },
        mx: { values: [{ hostname: `mail.${domain}`, priority: 10 }] }
      },
      subdomain_count: 25,
      alexa_rank: 50000,
      apex_domain: domain,
      note: 'Mock data - Configure SecurityTrails API key for real results'
    };
  }

  // Get API configuration status
  getAPIStatus() {
    return {
      shodan: !!this.apiKeys.shodan,
      virustotal: !!this.apiKeys.virustotal,
      hunter: !!this.apiKeys.hunter,
      haveibeenpwned: !!this.apiKeys.haveibeenpwned,
      censys: !!this.apiKeys.censys,
      securitytrails: !!this.apiKeys.securitytrails,
      note: 'Configure API keys in environment variables for full functionality'
    };
  }
}

export default new OSINTAPIService();