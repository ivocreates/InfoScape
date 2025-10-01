import React, { useState, useEffect } from 'react';
import {
  Globe,
  Search,
  Shield,
  MapPin,
  Calendar,
  Server,
  Database,
  ExternalLink,
  Copy,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Target,
  Network,
  FileText,
  Mail,
  Phone,
  Building,
  User,
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  Layers
} from 'lucide-react';

// Domain analysis tools and APIs
const domainAnalysisTools = {
  whois: {
    name: 'WHOIS Lookup',
    description: 'Get domain registration information',
    icon: FileText,
    category: 'registration',
    apis: [
      'https://whois.net/',
      'https://whois.domaintools.com/',
      'https://www.whois.com/whois/'
    ]
  },
  dns: {
    name: 'DNS Records',
    description: 'Analyze DNS configuration and records',
    icon: Network,
    category: 'technical',
    apis: [
      'https://dns.google/',
      'https://mxtoolbox.com/',
      'https://dnsdumpster.com/'
    ]
  },
  subdomains: {
    name: 'Subdomain Discovery',
    description: 'Find subdomains and related infrastructure',
    icon: Layers,
    category: 'discovery',
    apis: [
      'https://crt.sh/',
      'https://securitytrails.com/',
      'https://sublist3r.github.io/'
    ]
  },
  ssl: {
    name: 'SSL Certificate',
    description: 'SSL/TLS certificate information',
    icon: Shield,
    category: 'security',
    apis: [
      'https://crt.sh/',
      'https://ssllabs.com/ssltest/',
      'https://censys.io/'
    ]
  },
  reputation: {
    name: 'Domain Reputation',
    description: 'Check domain reputation and security status',
    icon: AlertTriangle,
    category: 'security',
    apis: [
      'https://virustotal.com/',
      'https://urlvoid.com/',
      'https://opentip.kaspersky.com/'
    ]
  },
  wayback: {
    name: 'Historical Data',
    description: 'View historical snapshots and changes',
    icon: Clock,
    category: 'history',
    apis: [
      'https://web.archive.org/',
      'https://archive.today/',
      'https://securitytrails.com/domain/'
    ]
  },
  geolocation: {
    name: 'IP Geolocation',
    description: 'Server location and hosting information',
    icon: MapPin,
    category: 'location',
    apis: [
      'https://ipinfo.io/',
      'https://iplocation.net/',
      'https://geoiplookup.net/'
    ]
  },
  hosting: {
    name: 'Hosting Analysis',
    description: 'Web hosting and server information',
    icon: Server,
    category: 'technical',
    apis: [
      'https://builtwith.com/',
      'https://netcraft.com/',
      'https://shodan.io/'
    ]
  },
  social: {
    name: 'Social Presence',
    description: 'Find social media and online presence',
    icon: User,
    category: 'social',
    apis: [
      'https://namechk.com/',
      'https://knowem.com/',
      'https://social-searcher.com/'
    ]
  },
  security: {
    name: 'Security Scan',
    description: 'Vulnerability and security assessment',
    icon: Shield,
    category: 'security',
    apis: [
      'https://securityheaders.com/',
      'https://observatory.mozilla.org/',
      'https://hstspreload.org/'
    ]
  }
};

// OSINT search operators for domains
const domainSearchOperators = {
  google: [
    'site:{domain}',
    'inurl:{domain}',
    'intitle:"{domain}"',
    'link:{domain}',
    'cache:{domain}',
    'filetype:pdf site:{domain}',
    '"contact" site:{domain}',
    '"about" site:{domain}',
    '"admin" site:{domain}',
    'inurl:admin site:{domain}'
  ],
  bing: [
    'site:{domain}',
    'domain:{domain}',
    'ip:{ip}',
    'contains:{domain}',
    'inurl:{domain}',
    'intitle:{domain}'
  ],
  yandex: [
    'site:{domain}',
    'host:{domain}',
    'url:{domain}',
    'domain:{domain}'
  ]
};

function DomainLookup() {
  const [domain, setDomain] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [selectedTools, setSelectedTools] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [quickDorking, setQuickDorking] = useState(false);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('domain-lookup-history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load search history:', e);
      }
    }
  }, []);

  // Save search history to localStorage
  useEffect(() => {
    localStorage.setItem('domain-lookup-history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const categories = {
    all: { name: 'All Tools', icon: Globe },
    registration: { name: 'Registration', icon: FileText },
    technical: { name: 'Technical', icon: Network },
    security: { name: 'Security', icon: Shield },
    discovery: { name: 'Discovery', icon: Search },
    location: { name: 'Location', icon: MapPin },
    history: { name: 'History', icon: Clock },
    social: { name: 'Social', icon: User }
  };

  const validateDomain = (input) => {
    // Remove protocol if present
    let cleanDomain = input.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    // Extract domain from URL path
    cleanDomain = cleanDomain.split('/')[0];
    
    // Basic domain validation
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(cleanDomain) ? cleanDomain : null;
  };

  const addToHistory = (searchDomain) => {
    const historyEntry = {
      domain: searchDomain,
      timestamp: new Date().toISOString(),
      tools: selectedTools.length > 0 ? selectedTools : Object.keys(domainAnalysisTools)
    };
    
    setSearchHistory(prev => [
      historyEntry,
      ...prev.filter(item => item.domain !== searchDomain).slice(0, 19)
    ]);
  };

  const performLookup = async (toolKey, targetDomain) => {
    setLoading(prev => ({ ...prev, [toolKey]: true }));
    
    try {
      // Simulate API call - in real implementation, this would call actual APIs
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Mock results based on tool type
      const mockResult = generateMockResult(toolKey, targetDomain);
      
      setResults(prev => ({
        ...prev,
        [toolKey]: {
          success: true,
          data: mockResult,
          timestamp: new Date().toISOString()
        }
      }));
      
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [toolKey]: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [toolKey]: false }));
    }
  };

  const generateMockResult = (toolKey, targetDomain) => {
    const results = {
      whois: {
        registrar: 'Example Registrar Inc.',
        creationDate: '2015-03-15',
        expirationDate: '2025-03-15',
        nameServers: ['ns1.example.com', 'ns2.example.com'],
        registrant: {
          organization: 'Example Organization',
          country: 'United States',
          state: 'California'
        }
      },
      dns: {
        a: ['192.168.1.1', '192.168.1.2'],
        aaaa: ['2001:db8::1'],
        mx: ['mail.example.com', 'mail2.example.com'],
        ns: ['ns1.example.com', 'ns2.example.com'],
        txt: ['v=spf1 include:_spf.example.com ~all'],
        cname: ['www.example.com']
      },
      subdomains: [
        'www.' + targetDomain,
        'mail.' + targetDomain,
        'blog.' + targetDomain,
        'api.' + targetDomain,
        'admin.' + targetDomain,
        'ftp.' + targetDomain
      ],
      ssl: {
        issuer: 'Let\'s Encrypt Authority X3',
        validFrom: '2024-01-15',
        validTo: '2025-04-15',
        algorithm: 'RSA 2048',
        grade: 'A+',
        vulnerabilities: []
      },
      reputation: {
        score: 85,
        status: 'Clean',
        threats: [],
        categories: ['Technology'],
        lastScanned: new Date().toISOString()
      },
      wayback: {
        firstSeen: '2015-03-20',
        lastSeen: '2024-12-01',
        snapshots: 156,
        changes: 23
      },
      geolocation: {
        ip: '192.168.1.1',
        country: 'United States',
        region: 'California',
        city: 'San Francisco',
        isp: 'Example Hosting LLC',
        asn: 'AS12345'
      },
      hosting: {
        provider: 'Example Cloud Services',
        technology: ['Apache', 'PHP', 'MySQL'],
        cms: 'WordPress 6.4',
        frameworks: ['Bootstrap', 'jQuery'],
        cdns: ['Cloudflare']
      },
      social: {
        platforms: [
          { name: 'Twitter', available: false },
          { name: 'Facebook', available: true },
          { name: 'Instagram', available: false },
          { name: 'LinkedIn', available: true }
        ]
      },
      security: {
        httpHeaders: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'Strict-Transport-Security': 'max-age=31536000'
        },
        score: 'A',
        vulnerabilities: []
      }
    };
    
    return results[toolKey] || {};
  };

  const runAllTools = () => {
    const cleanDomain = validateDomain(domain);
    if (!cleanDomain) {
      alert('Please enter a valid domain name');
      return;
    }

    addToHistory(cleanDomain);
    
    const toolsToRun = selectedTools.length > 0 ? selectedTools : Object.keys(domainAnalysisTools);
    toolsToRun.forEach(toolKey => {
      performLookup(toolKey, cleanDomain);
    });
  };

  const openInNewTab = (url) => {
    const cleanDomain = validateDomain(domain);
    if (cleanDomain) {
      const finalUrl = url.replace('{domain}', cleanDomain);
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const generateDorkingQueries = () => {
    const cleanDomain = validateDomain(domain);
    if (!cleanDomain) return [];

    const queries = [];
    Object.entries(domainSearchOperators).forEach(([engine, operators]) => {
      operators.forEach(operator => {
        queries.push({
          engine,
          query: operator.replace('{domain}', cleanDomain).replace('{ip}', results.geolocation?.data?.ip || ''),
          description: `${engine.toUpperCase()}: ${operator}`
        });
      });
    });
    
    return queries;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const filteredTools = activeCategory === 'all' 
    ? Object.entries(domainAnalysisTools)
    : Object.entries(domainAnalysisTools).filter(([_, tool]) => tool.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Domain OSINT Toolkit</h1>
        <p className="text-gray-600">Comprehensive domain analysis and intelligence gathering</p>
      </div>

      {/* Domain Input */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domain or URL to Analyze
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com or https://example.com"
              className="input-field"
              onKeyPress={(e) => e.key === 'Enter' && runAllTools()}
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={runAllTools}
              disabled={!domain.trim()}
              className={`btn btn-primary flex items-center gap-2 ${
                !domain.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Search className="w-4 h-4" />
              Analyze Domain
            </button>
            <button
              onClick={() => setQuickDorking(!quickDorking)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Dorking
            </button>
          </div>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Recent Searches</label>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 5).map((item, index) => (
                <button
                  key={index}
                  onClick={() => setDomain(item.domain)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {item.domain}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(categories).map(([key, category]) => {
            const IconComponent = category.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === key
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Dorking Panel */}
      {quickDorking && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">OSINT Search Operators</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {generateDorkingQueries().slice(0, 12).map((query, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">{query.engine.toUpperCase()}</span>
                  <button
                    onClick={() => copyToClipboard(query.query)}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                    title="Copy query"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <code className="text-sm text-gray-800 break-all">{query.query}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTools.map(([toolKey, tool]) => {
          const IconComponent = tool.icon;
          const result = results[toolKey];
          const isLoading = loading[toolKey];
          const isSelected = selectedTools.includes(toolKey);

          return (
            <div key={toolKey} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    result?.success ? 'bg-green-100 text-green-600' :
                    result?.success === false ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                    <p className="text-sm text-gray-600">{tool.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTools(prev => [...prev, toolKey]);
                      } else {
                        setSelectedTools(prev => prev.filter(t => t !== toolKey));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Tool Actions */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => domain && performLookup(toolKey, validateDomain(domain))}
                  disabled={!domain || isLoading}
                  className="flex-1 btn btn-secondary text-xs py-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    'Run Tool'
                  )}
                </button>
                {tool.apis.length > 0 && (
                  <button
                    onClick={() => openInNewTab(tool.apis[0])}
                    className="btn btn-secondary text-xs py-2 px-3"
                    title="Open external tool"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Results Display */}
              {result && (
                <div className="border-t border-gray-200 pt-4">
                  {result.success ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Analysis Complete
                      </div>
                      {toolKey === 'whois' && (
                        <div className="text-sm space-y-1">
                          <div><span className="font-medium">Registrar:</span> {result.data.registrar}</div>
                          <div><span className="font-medium">Created:</span> {result.data.creationDate}</div>
                          <div><span className="font-medium">Expires:</span> {result.data.expirationDate}</div>
                        </div>
                      )}
                      {toolKey === 'dns' && (
                        <div className="text-sm space-y-1">
                          <div><span className="font-medium">A Records:</span> {result.data.a?.join(', ')}</div>
                          <div><span className="font-medium">MX Records:</span> {result.data.mx?.join(', ')}</div>
                        </div>
                      )}
                      {toolKey === 'subdomains' && (
                        <div className="text-sm">
                          <span className="font-medium">Found {result.data.length} subdomains</span>
                          <div className="mt-1 max-h-20 overflow-y-auto popup-scrollbar">
                            {result.data.slice(0, 5).map((sub, idx) => (
                              <div key={idx} className="text-xs text-gray-600">{sub}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {toolKey === 'reputation' && (
                        <div className="text-sm space-y-1">
                          <div><span className="font-medium">Score:</span> {result.data.score}/100</div>
                          <div><span className="font-medium">Status:</span> {result.data.status}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      {result.error || 'Analysis failed'}
                    </div>
                  )}
                </div>
              )}

              {/* External APIs */}
              {tool.apis.length > 1 && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <label className="text-xs font-medium text-gray-700 mb-2 block">External Tools</label>
                  <div className="space-y-1">
                    {tool.apis.slice(1).map((api, index) => (
                      <button
                        key={index}
                        onClick={() => openInNewTab(api)}
                        className="w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded transition-colors"
                      >
                        {new URL(api).hostname}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Results Summary */}
      {Object.keys(results).length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(results).filter(r => r.success).length}
              </div>
              <div className="text-sm text-green-600">Successful</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {Object.values(results).filter(r => !r.success).length}
              </div>
              <div className="text-sm text-red-600">Failed</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(results).length}
              </div>
              <div className="text-sm text-blue-600">Total Tools</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DomainLookup;