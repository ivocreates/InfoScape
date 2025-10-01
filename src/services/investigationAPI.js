// Enhanced API Service for InfoScope OSINT Platform v2.3.0
// Real working APIs for professional investigations

import { API_ENDPOINTS, FREE_APIS, getApiKey, hasApiKey, getDefaultHeaders, API_ERRORS } from './apiConfig';

class InvestigationAPIService {
  constructor() {
    this.rateLimitTracker = new Map();
    this.cache = new Map();
    this.requestQueue = [];
    this.processing = false;
  }

  // Rate limiting helper
  async checkRateLimit(service) {
    const now = Date.now();
    const key = service.toLowerCase();
    
    if (!this.rateLimitTracker.has(key)) {
      this.rateLimitTracker.set(key, { requests: [], lastReset: now });
    }
    
    const tracker = this.rateLimitTracker.get(key);
    
    // Reset if it's been more than an hour
    if (now - tracker.lastReset > 3600000) {
      tracker.requests = [];
      tracker.lastReset = now;
    }
    
    // Check if we've hit rate limit
    const recentRequests = tracker.requests.filter(time => now - time < 60000);
    if (recentRequests.length >= 10) {
      throw new Error(API_ERRORS.RATE_LIMIT);
    }
    
    tracker.requests.push(now);
  }

  // Cache helper
  getCacheKey(service, params) {
    return `${service}_${JSON.stringify(params)}`;
  }

  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        ...options,
        headers: {
          ...options.headers,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(API_ERRORS.RATE_LIMIT);
        } else if (response.status === 401) {
          throw new Error(API_ERRORS.INVALID_KEY);
        } else if (response.status === 404) {
          throw new Error(API_ERRORS.NOT_FOUND);
        } else {
          throw new Error(API_ERRORS.SERVER_ERROR);
        }
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error(API_ERRORS.NETWORK_ERROR);
      }
      throw error;
    }
  }

  // IP Intelligence Methods
  async investigateIP(ip) {
    const results = {
      ip,
      timestamp: new Date().toISOString(),
      sources: []
    };

    // IPinfo.io (Free)
    try {
      await this.checkRateLimit('ipinfo');
      const cacheKey = this.getCacheKey('ipinfo', { ip });
      
      let ipinfoData = this.cache.get(cacheKey);
      if (!ipinfoData) {
        const response = await this.makeRequest(`https://ipinfo.io/${ip}/json`);
        ipinfoData = {
          source: 'IPinfo.io',
          location: {
            country: response.country,
            region: response.region,
            city: response.city,
            coordinates: response.loc
          },
          network: {
            org: response.org,
            timezone: response.timezone
          },
          success: true
        };
        this.cache.set(cacheKey, ipinfoData);
      }
      results.sources.push(ipinfoData);
    } catch (error) {
      results.sources.push({
        source: 'IPinfo.io',
        error: error.message,
        success: false
      });
    }

    // IPapi.co (Free)
    try {
      await this.checkRateLimit('ipapi');
      const response = await this.makeRequest(`https://ipapi.co/${ip}/json/`);
      results.sources.push({
        source: 'IPapi.co',
        location: {
          country: response.country_name,
          region: response.region,
          city: response.city,
          coordinates: `${response.latitude},${response.longitude}`
        },
        network: {
          isp: response.org,
          asn: response.asn,
          timezone: response.timezone
        },
        threat: {
          vpn: response.threat || 'Unknown',
          proxy: response.proxy || false
        },
        success: true
      });
    } catch (error) {
      results.sources.push({
        source: 'IPapi.co',
        error: error.message,
        success: false
      });
    }

    // VirusTotal (API Key required)
    if (hasApiKey('virustotal')) {
      try {
        await this.checkRateLimit('virustotal');
        const headers = getDefaultHeaders('virustotal');
        const response = await this.makeRequest(
          `https://www.virustotal.com/vtapi/v2/ip-address/report?apikey=${getApiKey('virustotal')}&ip=${ip}`,
          { headers }
        );
        
        results.sources.push({
          source: 'VirusTotal',
          reputation: {
            malicious: response.detected_urls?.length || 0,
            suspicious: response.detected_samples?.length || 0,
            harmless: response.harmless || 0
          },
          detected_urls: response.detected_urls?.slice(0, 10) || [],
          success: true
        });
      } catch (error) {
        results.sources.push({
          source: 'VirusTotal',
          error: error.message,
          success: false
        });
      }
    }

    // AbuseIPDB (API Key required)
    if (hasApiKey('abuseipdb')) {
      try {
        await this.checkRateLimit('abuseipdb');
        const headers = getDefaultHeaders('abuseipdb');
        const response = await this.makeRequest(
          `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90&verbose`,
          { headers }
        );
        
        results.sources.push({
          source: 'AbuseIPDB',
          abuse: {
            confidence: response.data?.abuseConfidencePercentage || 0,
            reports: response.data?.totalReports || 0,
            whitelisted: response.data?.isWhitelisted || false
          },
          success: true
        });
      } catch (error) {
        results.sources.push({
          source: 'AbuseIPDB',
          error: error.message,
          success: false
        });
      }
    }

    return results;
  }

  // Email Analysis Methods
  async investigateEmail(email) {
    const results = {
      email,
      timestamp: new Date().toISOString(),
      sources: []
    };

    // EmailRep.io (Free)
    try {
      await this.checkRateLimit('emailrep');
      const response = await this.makeRequest(`https://emailrep.io/${email}`);
      results.sources.push({
        source: 'EmailRep.io',
        reputation: {
          suspicious: response.suspicious || false,
          references: response.references || 0,
          blacklisted: response.blacklisted || false,
          malicious_activity: response.malicious_activity || false,
          credentials_leaked: response.credentials_leaked || false,
          data_breach: response.data_breach || false,
          spam: response.spam || false
        },
        details: {
          domain_exists: response.domain_exists,
          domain_reputation: response.domain_reputation,
          new_domain: response.new_domain,
          days_since_domain_creation: response.days_since_domain_creation
        },
        success: true
      });
    } catch (error) {
      results.sources.push({
        source: 'EmailRep.io',
        error: error.message,
        success: false
      });
    }

    // Hunter.io (API Key required)
    if (hasApiKey('hunter')) {
      try {
        await this.checkRateLimit('hunter');
        const apiKey = getApiKey('hunter');
        const response = await this.makeRequest(
          `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${apiKey}`
        );
        
        results.sources.push({
          source: 'Hunter.io',
          verification: {
            result: response.data?.result || 'unknown',
            score: response.data?.score || 0,
            regexp: response.data?.regexp || false,
            gibberish: response.data?.gibberish || false,
            disposable: response.data?.disposable || false,
            webmail: response.data?.webmail || false,
            mx_records: response.data?.mx_records || false,
            smtp_server: response.data?.smtp_server || false,
            smtp_check: response.data?.smtp_check || false,
            accept_all: response.data?.accept_all || false
          },
          success: true
        });
      } catch (error) {
        results.sources.push({
          source: 'Hunter.io',
          error: error.message,
          success: false
        });
      }
    }

    // Have I Been Pwned (API Key required)
    if (hasApiKey('haveibeenpwned')) {
      try {
        await this.checkRateLimit('haveibeenpwned');
        const headers = getDefaultHeaders('haveibeenpwned');
        const response = await this.makeRequest(
          `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`,
          { headers }
        );
        
        results.sources.push({
          source: 'Have I Been Pwned',
          breaches: response?.map(breach => ({
            name: breach.Name,
            domain: breach.Domain,
            date: breach.BreachDate,
            accounts: breach.PwnCount,
            verified: breach.IsVerified,
            sensitive: breach.IsSensitive,
            retired: breach.IsRetired,
            spam_list: breach.IsSpamList
          })) || [],
          breach_count: response?.length || 0,
          success: true
        });
      } catch (error) {
        if (error.message === API_ERRORS.NOT_FOUND) {
          results.sources.push({
            source: 'Have I Been Pwned',
            breaches: [],
            breach_count: 0,
            message: 'No breaches found',
            success: true
          });
        } else {
          results.sources.push({
            source: 'Have I Been Pwned',
            error: error.message,
            success: false
          });
        }
      }
    }

    return results;
  }

  // Domain Research Methods
  async investigateDomain(domain) {
    const results = {
      domain,
      timestamp: new Date().toISOString(),
      sources: []
    };

    // Wayback Machine (Free)
    try {
      await this.checkRateLimit('wayback');
      const response = await this.makeRequest(
        `https://web.archive.org/wayback/available?url=${domain}`
      );
      
      results.sources.push({
        source: 'Wayback Machine',
        archived: response.archived_snapshots?.closest ? true : false,
        first_seen: response.archived_snapshots?.closest?.timestamp || 'Unknown',
        last_seen: response.archived_snapshots?.closest?.timestamp || 'Unknown',
        snapshots_available: response.archived_snapshots?.closest ? true : false,
        success: true
      });
    } catch (error) {
      results.sources.push({
        source: 'Wayback Machine',
        error: error.message,
        success: false
      });
    }

    // Basic WHOIS lookup using free service
    try {
      await this.checkRateLimit('whois');
      const response = await this.makeRequest(
        `https://www.whoisxmlapi.com/whoisserver/WhoisService?domainName=${domain}&outputFormat=json`
      );
      
      const whoisData = response.WhoisRecord;
      results.sources.push({
        source: 'WHOIS Lookup',
        registration: {
          registrar: whoisData?.registrarName || 'Unknown',
          created: whoisData?.createdDate || 'Unknown',
          updated: whoisData?.updatedDate || 'Unknown',
          expires: whoisData?.expiresDate || 'Unknown'
        },
        contacts: {
          registrant: whoisData?.registrant?.name || 'Hidden',
          admin: whoisData?.administrativeContact?.name || 'Hidden',
          tech: whoisData?.technicalContact?.name || 'Hidden'
        },
        nameservers: whoisData?.nameServers?.map(ns => ns.name) || [],
        success: true
      });
    } catch (error) {
      results.sources.push({
        source: 'WHOIS Lookup',
        error: error.message,
        success: false
      });
    }

    // Security Trails (API Key required)
    if (hasApiKey('securitytrails')) {
      try {
        await this.checkRateLimit('securitytrails');
        const headers = getDefaultHeaders('securitytrails');
        const response = await this.makeRequest(
          `https://api.securitytrails.com/v1/domain/${domain}`,
          { headers }
        );
        
        results.sources.push({
          source: 'SecurityTrails',
          subdomains_count: response.subdomain_count || 0,
          alexa_rank: response.alexa_rank || 'Not ranked',
          apex_domain: response.apex_domain || domain,
          hostname: response.hostname || domain,
          success: true
        });
      } catch (error) {
        results.sources.push({
          source: 'SecurityTrails',
          error: error.message,
          success: false
        });
      }
    }

    return results;
  }

  // Phone Lookup Methods
  async investigatePhone(phone) {
    const results = {
      phone,
      timestamp: new Date().toISOString(),
      sources: []
    };

    // NumVerify (API Key required)
    if (hasApiKey('numverify')) {
      try {
        await this.checkRateLimit('numverify');
        const apiKey = getApiKey('numverify');
        const response = await this.makeRequest(
          `https://apilayer.net/api/validate?access_key=${apiKey}&number=${phone}`
        );
        
        results.sources.push({
          source: 'NumVerify',
          validation: {
            valid: response.valid || false,
            number: response.number || phone,
            local_format: response.local_format || 'Unknown',
            international_format: response.international_format || 'Unknown',
            country_prefix: response.country_prefix || 'Unknown',
            country_code: response.country_code || 'Unknown',
            country_name: response.country_name || 'Unknown',
            location: response.location || 'Unknown',
            carrier: response.carrier || 'Unknown',
            line_type: response.line_type || 'Unknown'
          },
          success: true
        });
      } catch (error) {
        results.sources.push({
          source: 'NumVerify',
          error: error.message,
          success: false
        });
      }
    }

    // Basic phone validation without API
    try {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const isValid = phoneRegex.test(phone.replace(/\s/g, ''));
      
      results.sources.push({
        source: 'Basic Validation',
        validation: {
          format_valid: isValid,
          cleaned_number: phone.replace(/[^\d\+]/g, ''),
          length: phone.replace(/[^\d]/g, '').length
        },
        success: true
      });
    } catch (error) {
      results.sources.push({
        source: 'Basic Validation',
        error: error.message,
        success: false
      });
    }

    return results;
  }

  // Geolocation Methods
  async investigateLocation(query) {
    const results = {
      query,
      timestamp: new Date().toISOString(),
      sources: []
    };

    // Determine if query is coordinates or address
    const coordRegex = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    const isCoordinates = coordRegex.test(query);

    // OpenCage (API Key required)
    if (hasApiKey('opencage')) {
      try {
        await this.checkRateLimit('opencage');
        const apiKey = getApiKey('opencage');
        const endpoint = isCoordinates 
          ? `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${apiKey}&pretty=1`
          : `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}&pretty=1`;
        
        const response = await this.makeRequest(endpoint);
        
        if (response.results && response.results.length > 0) {
          const result = response.results[0];
          results.sources.push({
            source: 'OpenCage',
            location: {
              formatted: result.formatted || 'Unknown',
              latitude: result.geometry?.lat || 0,
              longitude: result.geometry?.lng || 0,
              confidence: result.confidence || 0,
              country: result.components?.country || 'Unknown',
              state: result.components?.state || 'Unknown',
              city: result.components?.city || result.components?.town || 'Unknown',
              postcode: result.components?.postcode || 'Unknown',
              timezone: result.annotations?.timezone?.name || 'Unknown'
            },
            success: true
          });
        }
      } catch (error) {
        results.sources.push({
          source: 'OpenCage',
          error: error.message,
          success: false
        });
      }
    }

    // GeoJS (Free IP-based geolocation)
    if (!isCoordinates) {
      try {
        await this.checkRateLimit('geojs');
        const response = await this.makeRequest('https://get.geojs.io/v1/ip/geo.json');
        
        results.sources.push({
          source: 'GeoJS',
          location: {
            ip: response.ip || 'Unknown',
            country: response.country || 'Unknown',
            country_code: response.country_code || 'Unknown',
            region: response.region || 'Unknown',
            city: response.city || 'Unknown',
            latitude: response.latitude || 0,
            longitude: response.longitude || 0,
            timezone: response.timezone || 'Unknown',
            asn: response.asn || 'Unknown',
            organization: response.organization || 'Unknown'
          },
          note: 'This shows your current location based on IP',
          success: true
        });
      } catch (error) {
        results.sources.push({
          source: 'GeoJS',
          error: error.message,
          success: false
        });
      }
    }

    return results;
  }

  // Social Media Investigation
  async investigateSocialMedia(username) {
    const results = {
      username,
      timestamp: new Date().toISOString(),
      platforms: []
    };

    // Check common social media platforms
    const platforms = [
      { name: 'Twitter', url: `https://twitter.com/${username}`, icon: '🐦' },
      { name: 'Instagram', url: `https://instagram.com/${username}`, icon: '📷' },
      { name: 'Facebook', url: `https://facebook.com/${username}`, icon: '👥' },
      { name: 'LinkedIn', url: `https://linkedin.com/in/${username}`, icon: '💼' },
      { name: 'GitHub', url: `https://github.com/${username}`, icon: '💻' },
      { name: 'Reddit', url: `https://reddit.com/user/${username}`, icon: '🤖' },
      { name: 'TikTok', url: `https://tiktok.com/@${username}`, icon: '🎵' },
      { name: 'YouTube', url: `https://youtube.com/@${username}`, icon: '📺' },
      { name: 'Telegram', url: `https://t.me/${username}`, icon: '✈️' },
      { name: 'Discord', url: `https://discord.com/users/${username}`, icon: '🎮' }
    ];

    for (const platform of platforms) {
      try {
        // Note: Due to CORS restrictions, we can't directly check these URLs
        // Instead, we provide the URLs for manual verification
        results.platforms.push({
          name: platform.name,
          url: platform.url,
          icon: platform.icon,
          status: 'Check manually',
          note: 'Click to check if profile exists'
        });
      } catch (error) {
        results.platforms.push({
          name: platform.name,
          url: platform.url,
          icon: platform.icon,
          status: 'Error',
          error: error.message
        });
      }
    }

    return results;
  }

  // Export investigation results
  exportResults(results, format = 'json') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `infoscope-investigation-${timestamp}`;

    switch (format.toLowerCase()) {
      case 'json':
        this.downloadFile(
          JSON.stringify(results, null, 2),
          `${filename}.json`,
          'application/json'
        );
        break;
      case 'csv':
        const csv = this.convertToCSV(results);
        this.downloadFile(csv, `${filename}.csv`, 'text/csv');
        break;
      case 'txt':
        const txt = this.convertToText(results);
        this.downloadFile(txt, `${filename}.txt`, 'text/plain');
        break;
      default:
        throw new Error('Unsupported export format');
    }
  }

  convertToCSV(results) {
    // Flatten results for CSV format
    const rows = [];
    const headers = ['Type', 'Source', 'Key', 'Value', 'Timestamp'];
    rows.push(headers.join(','));

    const addRow = (type, source, key, value) => {
      const escapedValue = typeof value === 'string' 
        ? `"${value.replace(/"/g, '""')}"` 
        : value;
      rows.push([type, source, key, escapedValue, results.timestamp].join(','));
    };

    if (results.sources) {
      results.sources.forEach(source => {
        const type = results.ip ? 'IP' : results.email ? 'Email' : 
                     results.domain ? 'Domain' : results.phone ? 'Phone' : 'Other';
        
        Object.entries(source).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            Object.entries(value).forEach(([subKey, subValue]) => {
              addRow(type, source.source || 'Unknown', `${key}.${subKey}`, subValue);
            });
          } else {
            addRow(type, source.source || 'Unknown', key, value);
          }
        });
      });
    }

    return rows.join('\n');
  }

  convertToText(results) {
    let text = `InfoScope OSINT Investigation Report\n`;
    text += `Generated: ${results.timestamp}\n`;
    text += `Target: ${results.ip || results.email || results.domain || results.phone || results.query || results.username}\n`;
    text += `${'='.repeat(50)}\n\n`;

    if (results.sources) {
      results.sources.forEach((source, index) => {
        text += `${index + 1}. ${source.source || 'Unknown Source'}\n`;
        text += `-${'-'.repeat(source.source?.length || 10)}\n`;
        
        if (source.success) {
          Object.entries(source).forEach(([key, value]) => {
            if (key !== 'source' && key !== 'success') {
              text += `${key}: ${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}\n`;
            }
          });
        } else {
          text += `Error: ${source.error}\n`;
        }
        text += '\n';
      });
    }

    if (results.platforms) {
      text += `Social Media Platforms:\n`;
      text += `-${'-'.repeat(20)}\n`;
      results.platforms.forEach(platform => {
        text += `${platform.icon} ${platform.name}: ${platform.url}\n`;
      });
    }

    return text;
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export default new InvestigationAPIService();