import React, { useState } from 'react';
import { 
  Search, 
  Globe, 
  Shield, 
  Eye, 
  FileText, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Camera,
  ExternalLink,
  AlertTriangle,
  Info
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

function OSINTTools() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // OSINT Tools Database
  const osintTools = {
    general: [
      {
        name: 'Google Advanced Search',
        description: 'Advanced Google search operators for precise results',
        url: 'https://www.google.com/advanced_search',
        icon: Search,
        color: 'bg-blue-500',
        integration: 'direct',
        params: { q: 'search_query' }
      },
      {
        name: 'DuckDuckGo',
        description: 'Privacy-focused search engine with !bang operators',
        url: 'https://duckduckgo.com',
        icon: Shield,
        color: 'bg-orange-500',
        integration: 'direct',
        params: { q: 'search_query' }
      },
      {
        name: 'Bing Search',
        description: 'Microsoft search with unique indexing',
        url: 'https://www.bing.com/search',
        icon: Search,
        color: 'bg-green-500',
        integration: 'direct',
        params: { q: 'search_query' }
      },
      {
        name: 'Yandex',
        description: 'Russian search engine with reverse image search',
        url: 'https://yandex.com/search',
        icon: Globe,
        color: 'bg-red-500',
        integration: 'direct',
        params: { text: 'search_query' }
      }
    ],
    people: [
      {
        name: 'Pipl',
        description: 'People search engine aggregating public records',
        url: 'https://pipl.com',
        icon: Users,
        color: 'bg-purple-500',
        integration: 'external'
      },
      {
        name: 'TruePeopleSearch',
        description: 'Free people search with contact information',
        url: 'https://www.truepeoplesearch.com',
        icon: Users,
        color: 'bg-blue-600',
        integration: 'external'
      },
      {
        name: 'WhitePages',
        description: 'Directory service for finding people and businesses',
        url: 'https://www.whitepages.com',
        icon: Phone,
        color: 'bg-gray-600',
        integration: 'external'
      },
      {
        name: 'FastPeopleSearch',
        description: 'Quick people lookup with address history',
        url: 'https://www.fastpeoplesearch.com',
        icon: MapPin,
        color: 'bg-green-600',
        integration: 'external'
      }
    ],
    social: [
      {
        name: 'Sherlock',
        description: 'Username enumeration across social platforms',
        url: 'https://github.com/sherlock-project/sherlock',
        icon: Eye,
        color: 'bg-indigo-500',
        integration: 'tool',
        note: 'Command-line tool for username hunting'
      },
      {
        name: 'Social Searcher',
        description: 'Real-time social media search and monitoring',
        url: 'https://www.social-searcher.com',
        icon: Users,
        color: 'bg-pink-500',
        integration: 'external'
      },
      {
        name: 'Mention',
        description: 'Social media monitoring and brand tracking',
        url: 'https://mention.com',
        icon: Globe,
        color: 'bg-blue-500',
        integration: 'external'
      },
      {
        name: 'IntelTechniques Tools',
        description: 'Collection of OSINT investigation tools',
        url: 'https://inteltechniques.com/tools/',
        icon: Shield,
        color: 'bg-gray-800',
        integration: 'external'
      }
    ],
    email: [
      {
        name: 'Hunter.io',
        description: 'Find email addresses associated with domains',
        url: 'https://hunter.io',
        icon: Mail,
        color: 'bg-orange-500',
        integration: 'external'
      },
      {
        name: 'Have I Been Pwned',
        description: 'Check if email addresses have been compromised',
        url: 'https://haveibeenpwned.com',
        icon: Shield,
        color: 'bg-red-600',
        integration: 'direct',
        params: { account: 'search_query' }
      },
      {
        name: 'EmailRep',
        description: 'Email reputation and intelligence lookup',
        url: 'https://emailrep.io',
        icon: Mail,
        color: 'bg-blue-600',
        integration: 'external'
      },
      {
        name: 'Breach Directory',
        description: 'Search breached credentials databases',
        url: 'https://breachdirectory.org',
        icon: AlertTriangle,
        color: 'bg-red-500',
        integration: 'external',
        warning: 'Use only for legitimate security research'
      }
    ],
    images: [
      {
        name: 'TinEye',
        description: 'Reverse image search engine',
        url: 'https://tineye.com',
        icon: Camera,
        color: 'bg-teal-500',
        integration: 'external'
      },
      {
        name: 'Google Images',
        description: 'Google reverse image search',
        url: 'https://images.google.com',
        icon: Camera,
        color: 'bg-blue-500',
        integration: 'external'
      },
      {
        name: 'Yandex Images',
        description: 'Yandex reverse image search (often more effective)',
        url: 'https://yandex.com/images',
        icon: Camera,
        color: 'bg-red-500',
        integration: 'external'
      },
      {
        name: 'Jeffrey\'s Image Metadata Viewer',
        description: 'Extract EXIF data from images',
        url: 'http://exif.regex.info/exif.cgi',
        icon: FileText,
        color: 'bg-gray-600',
        integration: 'external'
      }
    ],
    domains: [
      {
        name: 'Whois Lookup',
        description: 'Domain registration information',
        url: 'https://whois.net',
        icon: Globe,
        color: 'bg-blue-600',
        integration: 'direct',
        params: { domain: 'search_query' }
      },
      {
        name: 'DNSdumpster',
        description: 'DNS reconnaissance and subdomain discovery',
        url: 'https://dnsdumpster.com',
        icon: Shield,
        color: 'bg-green-600',
        integration: 'external'
      },
      {
        name: 'Shodan',
        description: 'Search engine for Internet-connected devices',
        url: 'https://www.shodan.io',
        icon: Eye,
        color: 'bg-gray-800',
        integration: 'external'
      },
      {
        name: 'Censys',
        description: 'Internet-wide scanning and analysis',
        url: 'https://censys.io',
        icon: Search,
        color: 'bg-purple-600',
        integration: 'external'
      }
    ]
  };

  const categories = [
    { id: 'general', name: 'General Search', icon: Search },
    { id: 'people', name: 'People Search', icon: Users },
    { id: 'social', name: 'Social Media', icon: Globe },
    { id: 'email', name: 'Email Intel', icon: Mail },
    { id: 'images', name: 'Image Analysis', icon: Camera },
    { id: 'domains', name: 'Domain Intel', icon: Shield }
  ];

  const openTool = (tool) => {
    let url = tool.url;
    
    // Build URL with search parameters if supported
    if (tool.integration === 'direct' && searchQuery.trim() && tool.params) {
      const params = new URLSearchParams();
      Object.entries(tool.params).forEach(([key, value]) => {
        if (value === 'search_query') {
          params.append(key, searchQuery.trim());
        } else {
          params.append(key, value);
        }
      });
      url = `${tool.url}?${params.toString()}`;
    }

    if (window.electronAPI) {
      window.electronAPI.openBrowser(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const runBulkSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    
    // Get tools that support direct integration
    const directTools = osintTools[activeCategory]?.filter(tool => 
      tool.integration === 'direct'
    ) || [];
    
    // Open multiple tabs with a delay to prevent browser blocking
    for (let i = 0; i < directTools.length; i++) {
      setTimeout(() => {
        openTool(directTools[i]);
      }, i * 1000);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            OSINT Tool Arsenal
          </h1>
          <p className="text-gray-600">
            Integrated access to professional OSINT investigation tools
          </p>
        </header>

        {/* Search Bar */}
        <div className="card p-6 mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Search Query / Target
              </label>
              <input
                type="text"
                className="input-field"
                placeholder='e.g., "John Smith", email@domain.com, domain.com'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={runBulkSearch}
              disabled={!searchQuery.trim() || loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Bulk Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-4 sticky top-6">
              <h2 className="font-semibold mb-4">Tool Categories</h2>
              <div className="space-y-2">
                {categories.map(({ id, name, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveCategory(id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                      activeCategory === id
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {osintTools[activeCategory]?.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <div key={index} className="card p-6 hover:shadow-lg transition-shadow group">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${tool.color} text-white group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                          <div className="flex items-center gap-1">
                            {tool.integration === 'direct' && (
                              <span className="chip-secondary text-xs px-2 py-1">Direct</span>
                            )}
                            {tool.warning && (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                        
                        {tool.note && (
                          <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg mb-3">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                            <p className="text-xs text-blue-700">{tool.note}</p>
                          </div>
                        )}
                        
                        {tool.warning && (
                          <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg mb-3">
                            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                            <p className="text-xs text-amber-700">{tool.warning}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openTool(tool)}
                            className="btn-primary text-sm flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open Tool
                          </button>
                          
                          {tool.integration === 'direct' && searchQuery.trim() && (
                            <button
                              onClick={() => openTool(tool)}
                              className="btn-secondary text-sm"
                            >
                              Search "{searchQuery.slice(0, 20)}{searchQuery.length > 20 ? '...' : ''}"
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Integration Guide */}
            <div className="mt-8 card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">Integration Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-green-800">Direct Integration</p>
                    <p className="text-green-700">Tools open with your search query pre-filled</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-blue-800">Bulk Search</p>
                    <p className="text-blue-700">Open multiple tools simultaneously</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-purple-800">Built-in Browser</p>
                    <p className="text-purple-700">All tools open in integrated browser</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ethics Notice */}
            <div className="mt-6 card p-4 bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Ethical Use Reminder</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    These tools are for legitimate investigations only. Always comply with local laws, 
                    platform terms of service, and ethical guidelines. Respect privacy and use 
                    responsibly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OSINTTools;
