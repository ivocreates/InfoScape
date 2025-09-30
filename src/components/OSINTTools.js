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
  Info,
  Lock,
  Database,
  Target,
  Zap,
  BookOpen,
  Star,
  Settings
} from 'lucide-react';
import BrowserSelector from './BrowserSelector';
import StarButton from './StarButton';

function OSINTTools() {
  const [activeCategory, setActiveCategory] = useState('people');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBrowserSelector, setShowBrowserSelector] = useState(false);
  const [pendingUrl, setPendingUrl] = useState('');
  const [browserPreference, setBrowserPreference] = useState('builtin');
  const [user, setUser] = useState(null); // Add user state for favorites

  // Get user from context or props (for now, we'll simulate it)
  React.useEffect(() => {
    // In a real app, this would come from auth context
    // For now, we'll use a placeholder
    setUser({ uid: 'demo-user' });
  }, []);

  // Comprehensive OSINT Tools Database
  const osintTools = {
    people: [
      {
        name: 'TruePeopleSearch',
        description: 'Free comprehensive people search with address history and relatives',
        url: 'https://www.truepeoplesearch.com',
        icon: Users,
        color: 'bg-blue-600',
        category: 'People Search',
        rating: 4,
        free: true,
        integration: 'external'
      },
      {
        name: 'WhitePages',
        description: 'Directory service for finding people, phone numbers, and addresses',
        url: 'https://www.whitepages.com',
        icon: Phone,
        color: 'bg-gray-600',
        category: 'People Search',
        rating: 4,
        free: false,
        integration: 'external'
      },
      {
        name: 'FastPeopleSearch',
        description: 'Quick people lookup with address history and phone numbers',
        url: 'https://www.fastpeoplesearch.com',
        icon: Search,
        color: 'bg-green-600',
        category: 'People Search',
        rating: 4,
        free: true,
        integration: 'external'
      },
      {
        name: 'Spokeo',
        description: 'People search engine with social media integration',
        url: 'https://www.spokeo.com',
        icon: Users,
        color: 'bg-purple-600',
        category: 'People Search',
        rating: 4,
        free: false,
        integration: 'external'
      },
      {
        name: 'PeopleFinder',
        description: 'Background check and people search service',
        url: 'https://www.peoplefinder.com',
        icon: Eye,
        color: 'bg-orange-600',
        category: 'People Search',
        rating: 3,
        free: false,
        integration: 'external'
      },
      {
        name: 'Pipl',
        description: 'Deep web people search aggregating public records',
        url: 'https://pipl.com',
        icon: Database,
        color: 'bg-indigo-600',
        category: 'People Search',
        rating: 5,
        free: false,
        integration: 'external'
      }
    ],
    
    breach: [
      {
        name: 'Have I Been Pwned',
        description: 'Check if email addresses have been compromised in data breaches',
        url: 'https://haveibeenpwned.com',
        icon: Shield,
        color: 'bg-red-600',
        category: 'Breach Analysis',
        rating: 5,
        free: true,
        integration: 'direct',
        params: { account: 'search_query' }
      },
      {
        name: 'DeHashed',
        description: 'Search engine for breached credentials and leaked data',
        url: 'https://dehashed.com',
        icon: Lock,
        color: 'bg-gray-800',
        category: 'Breach Analysis',
        rating: 5,
        free: false,
        integration: 'external',
        warning: 'For authorized security research only'
      },
      {
        name: 'Breach Directory',
        description: 'Free breach data search engine',
        url: 'https://breachdirectory.org',
        icon: AlertTriangle,
        color: 'bg-red-500',
        category: 'Breach Analysis',
        rating: 4,
        free: true,
        integration: 'external',
        warning: 'Use only for legitimate security research'
      },
      {
        name: 'LeakCheck',
        description: 'Data breach search engine and monitoring service',
        url: 'https://leakcheck.io',
        icon: Eye,
        color: 'bg-blue-700',
        category: 'Breach Analysis',
        rating: 4,
        free: false,
        integration: 'external'
      },
      {
        name: 'Snusbase',
        description: 'Database breach search engine',
        url: 'https://snusbase.com',
        icon: Database,
        color: 'bg-purple-700',
        category: 'Breach Analysis',
        rating: 4,
        free: false,
        integration: 'external',
        warning: 'For authorized security research only'
      }
    ],

    email: [
      {
        name: 'Hunter.io',
        description: 'Find email addresses associated with domains and verify them',
        url: 'https://hunter.io',
        icon: Mail,
        color: 'bg-orange-500',
        category: 'Email Analysis',
        rating: 5,
        free: false,
        integration: 'external'
      },
      {
        name: 'EmailHippo',
        description: 'Email verification and validation service',
        url: 'https://www.emailhippo.com',
        icon: Mail,
        color: 'bg-blue-500',
        category: 'Email Analysis',
        rating: 4,
        free: false,
        integration: 'external'
      },
      {
        name: 'EmailRep',
        description: 'Email reputation and intelligence lookup',
        url: 'https://emailrep.io',
        icon: Shield,
        color: 'bg-green-600',
        category: 'Email Analysis',
        rating: 4,
        free: true,
        integration: 'external'
      },
      {
        name: 'Clearbit Connect',
        description: 'Find email addresses and enrich contact data',
        url: 'https://clearbit.com/connect',
        icon: Users,
        color: 'bg-teal-600',
        category: 'Email Analysis',
        rating: 4,
        free: false,
        integration: 'external'
      },
      {
        name: 'Voila Norbert',
        description: 'Email finder and verification tool',
        url: 'https://www.voilanorbert.com',
        icon: Search,
        color: 'bg-purple-500',
        category: 'Email Analysis',
        rating: 4,
        free: false,
        integration: 'external'
      }
    ],

    social: [
      {
        name: 'Sherlock',
        description: 'Hunt down social media accounts by username across platforms',
        url: 'https://github.com/sherlock-project/sherlock',
        icon: Target,
        color: 'bg-gray-800',
        category: 'Social Media',
        rating: 5,
        free: true,
        integration: 'tool',
        note: 'Command-line tool for username enumeration'
      },
      {
        name: 'Namechk',
        description: 'Check username availability across multiple platforms',
        url: 'https://namechk.com',
        icon: Users,
        color: 'bg-blue-500',
        category: 'Social Media',
        rating: 4,
        free: true,
        integration: 'external'
      },
      {
        name: 'Social Searcher',
        description: 'Real-time social media search and monitoring',
        url: 'https://www.social-searcher.com',
        icon: Search,
        color: 'bg-pink-500',
        category: 'Social Media',
        rating: 4,
        free: true,
        integration: 'external'
      },
      {
        name: 'Mention',
        description: 'Social media monitoring and brand tracking',
        url: 'https://mention.com',
        icon: Eye,
        color: 'bg-indigo-500',
        category: 'Social Media',
        rating: 4,
        free: false,
        integration: 'external'
      },
      {
        name: 'Brand24',
        description: 'Social media monitoring and sentiment analysis',
        url: 'https://brand24.com',
        icon: Globe,
        color: 'bg-orange-500',
        category: 'Social Media',
        rating: 4,
        free: false,
        integration: 'external'
      }
    ],

    hacking: [
      {
        name: 'Shodan',
        description: 'Search engine for Internet-connected devices and services',
        url: 'https://www.shodan.io',
        icon: Eye,
        color: 'bg-gray-800',
        category: 'Ethical Hacking',
        rating: 5,
        free: false,
        integration: 'external'
      },
      {
        name: 'Censys',
        description: 'Internet-wide scanning and device discovery platform',
        url: 'https://censys.io',
        icon: Search,
        color: 'bg-purple-600',
        category: 'Ethical Hacking',
        rating: 5,
        free: false,
        integration: 'external'
      },
      {
        name: 'SecurityTrails',
        description: 'DNS and domain intelligence platform',
        url: 'https://securitytrails.com',
        icon: Shield,
        color: 'bg-blue-700',
        category: 'Ethical Hacking',
        rating: 4,
        free: false,
        integration: 'external'
      },
      {
        name: 'VirusTotal',
        description: 'File and URL analysis for malware detection',
        url: 'https://www.virustotal.com',
        icon: Shield,
        color: 'bg-green-600',
        category: 'Ethical Hacking',
        rating: 5,
        free: true,
        integration: 'external'
      },
      {
        name: 'URLVoid',
        description: 'Website reputation and malware detection service',
        url: 'https://www.urlvoid.com',
        icon: Globe,
        color: 'bg-red-600',
        category: 'Ethical Hacking',
        rating: 4,
        free: true,
        integration: 'external'
      },
      {
        name: 'Wayback Machine',
        description: 'Archive of websites and historical content',
        url: 'https://web.archive.org',
        icon: FileText,
        color: 'bg-orange-600',
        category: 'Ethical Hacking',
        rating: 5,
        free: true,
        integration: 'external'
      }
    ],

    search: [
      {
        name: 'Google Advanced Search',
        description: 'Advanced Google search operators for precise results',
        url: 'https://www.google.com/advanced_search',
        icon: Search,
        color: 'bg-blue-500',
        category: 'Search Engines',
        rating: 5,
        free: true,
        integration: 'direct',
        params: { q: 'search_query' }
      },
      {
        name: 'DuckDuckGo',
        description: 'Privacy-focused search engine with !bang operators',
        url: 'https://duckduckgo.com',
        icon: Shield,
        color: 'bg-orange-500',
        category: 'Search Engines',
        rating: 4,
        free: true,
        integration: 'direct',
        params: { q: 'search_query' }
      },
      {
        name: 'Yandex',
        description: 'Russian search engine with excellent image search',
        url: 'https://yandex.com/search',
        icon: Globe,
        color: 'bg-red-500',
        category: 'Search Engines',
        rating: 4,
        free: true,
        integration: 'direct',
        params: { text: 'search_query' }
      },
      {
        name: 'Bing',
        description: 'Microsoft search engine with unique indexing',
        url: 'https://www.bing.com/search',
        icon: Search,
        color: 'bg-blue-600',
        category: 'Search Engines',
        rating: 4,
        free: true,
        integration: 'direct',
        params: { q: 'search_query' }
      },
      {
        name: 'Startpage',
        description: 'Private search engine using Google results',
        url: 'https://www.startpage.com',
        icon: Shield,
        color: 'bg-green-500',
        category: 'Search Engines',
        rating: 4,
        free: true,
        integration: 'external'
      }
    ],

    resources: [
      {
        name: 'OSINT Framework',
        description: 'Comprehensive collection of OSINT tools and resources',
        url: 'https://osintframework.com',
        icon: BookOpen,
        color: 'bg-blue-600',
        category: 'Resources',
        rating: 5,
        free: true,
        integration: 'external'
      },
      {
        name: 'IntelTechniques',
        description: 'OSINT training, tools, and investigation techniques',
        url: 'https://inteltechniques.com',
        icon: Shield,
        color: 'bg-gray-800',
        category: 'Resources',
        rating: 5,
        free: true,
        integration: 'external'
      },
      {
        name: 'Bellingcat Toolkit',
        description: 'Open source investigation tools and guides',
        url: 'https://www.bellingcat.com/resources/',
        icon: Eye,
        color: 'bg-orange-600',
        category: 'Resources',
        rating: 5,
        free: true,
        integration: 'external'
      },
      {
        name: 'SANS OSINT Summit',
        description: 'OSINT training and certification resources',
        url: 'https://www.sans.org/cyber-aces/osint',
        icon: BookOpen,
        color: 'bg-red-600',
        category: 'Resources',
        rating: 4,
        free: false,
        integration: 'external'
      },
      {
        name: 'OSINT Curious',
        description: 'OSINT training and community resources',
        url: 'https://osintcurio.us',
        icon: Users,
        color: 'bg-purple-600',
        category: 'Resources',
        rating: 4,
        free: true,
        integration: 'external'
      }
    ]
  };

  // Categories with enhanced descriptions
  const categories = [
    { 
      id: 'people', 
      name: 'People Search', 
      icon: Users,
      description: 'Find detailed information about individuals including contact details, address history, and public records'
    },
    { 
      id: 'breach', 
      name: 'Breach Analysis', 
      icon: Shield,
      description: 'Check for compromised credentials and data breaches for security assessment'
    },
    { 
      id: 'email', 
      name: 'Email Analysis', 
      icon: Mail,
      description: 'Email verification, domain analysis, and reputation checking tools'
    },
    { 
      id: 'social', 
      name: 'Social Media', 
      icon: Globe,
      description: 'Social media investigation, username enumeration, and profile analysis'
    },
    { 
      id: 'hacking', 
      name: 'Ethical Hacking', 
      icon: Zap,
      description: 'Security assessment tools for authorized penetration testing and research'
    },
    { 
      id: 'search', 
      name: 'Search Engines', 
      icon: Search,
      description: 'Specialized search engines and advanced search operators for precise results'
    },
    { 
      id: 'resources', 
      name: 'Resources & Training', 
      icon: BookOpen,
      description: 'Educational resources, training materials, and OSINT learning platforms'
    }
  ];

  // Filter tools based on search query
  const filteredTools = () => {
    const tools = osintTools[activeCategory] || [];
    if (!searchQuery.trim()) return tools;
    
    return tools.filter(tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Open tool with browser selection
  const openToolWithBrowserSelector = (tool, query = null) => {
    let url = tool.url;
    
    // Build URL with search parameters if supported
    if (tool.integration === 'direct' && (query || searchQuery.trim()) && tool.params) {
      const searchTerm = query || searchQuery.trim();
      const params = new URLSearchParams();
      Object.entries(tool.params).forEach(([key, value]) => {
        if (value === 'search_query') {
          params.append(key, searchTerm);
        } else {
          params.append(key, value);
        }
      });
      url = `${tool.url}?${params.toString()}`;
    }

    setPendingUrl(url);
    setShowBrowserSelector(true);
  };

  // Open tool in browser or Electron (legacy method)
  const openTool = (tool, query = null) => {
    let url = tool.url;
    
    // Build URL with search parameters if supported
    if (tool.integration === 'direct' && (query || searchQuery.trim()) && tool.params) {
      const searchTerm = query || searchQuery.trim();
      const params = new URLSearchParams();
      Object.entries(tool.params).forEach(([key, value]) => {
        if (value === 'search_query') {
          params.append(key, searchTerm);
        } else {
          params.append(key, value);
        }
      });
      url = `${tool.url}?${params.toString()}`;
    }

    // Use browser preference for quick launch
    if (window.electronAPI) {
      if (browserPreference === 'builtin') {
        window.electronAPI.openBrowser(url);
      } else {
        window.electronAPI.openBrowserWith(url, browserPreference);
      }
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBrowserSelect = (browserConfig) => {
    setBrowserPreference(browserConfig.browser);
  };

  // Bulk search functionality
  const runBulkSearch = async () => {
    if (!searchQuery.trim()) return;
    
    const directTools = osintTools[activeCategory]?.filter(tool => 
      tool.integration === 'direct'
    ) || [];
    
    // Open multiple tabs with delays to prevent browser blocking
    directTools.forEach((tool, index) => {
      setTimeout(() => {
        openTool(tool);
      }, index * 1000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">OSINT Arsenal</h1>
              <p className="text-gray-600 mt-1">Professional open source intelligence tools for ethical investigations</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Browser Preference Selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Quick Launch:</label>
                <select
                  value={browserPreference}
                  onChange={(e) => setBrowserPreference(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="builtin">Built-in Browser</option>
                  <option value="chrome">Chrome</option>
                  <option value="firefox">Firefox</option>
                  <option value="edge">Edge</option>
                  <option value="brave">Brave</option>
                </select>
              </div>
              
              {/* Search Bar */}
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tools or enter target..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Category Navigation */}
          <div className="flex space-x-1 overflow-x-auto">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Category Info */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              {React.createElement(categories.find(c => c.id === activeCategory)?.icon, { 
                className: "w-6 h-6 text-blue-600" 
              })}
              <h2 className="text-xl font-semibold text-blue-900">
                {categories.find(c => c.id === activeCategory)?.name}
              </h2>
              {searchQuery.trim() && (
                <button
                  onClick={runBulkSearch}
                  className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Bulk Search
                </button>
              )}
            </div>
            <p className="text-blue-700">
              {categories.find(c => c.id === activeCategory)?.description}
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools().map((tool, index) => {
            const IconComponent = tool.icon;
            return (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow group">
                {/* Tool Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${tool.color}`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Star Button for Favorites */}
                    <StarButton
                      item={{
                        id: `osint-tool-${tool.name.toLowerCase().replace(/\s+/g, '-')}`,
                        type: 'tool',
                        name: tool.name,
                        description: tool.description,
                        category: tool.category,
                        url: tool.url,
                        icon: tool.icon === Users ? '👥' : 
                              tool.icon === Shield ? '🛡️' : 
                              tool.icon === Mail ? '📧' : 
                              tool.icon === Globe ? '🌐' : 
                              tool.icon === Eye ? '👁️' : 
                              tool.icon === Search ? '🔍' : 
                              tool.icon === BookOpen ? '📚' : '⭐'
                      }}
                      user={user}
                      size="sm"
                    />
                    {/* Rating Stars */}
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < tool.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    {/* Free/Paid Badge */}
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      tool.free 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {tool.free ? 'Free' : 'Paid'}
                    </span>
                  </div>
                </div>

                {/* Tool Info */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-2">
                    {tool.description}
                  </p>
                  
                  {/* Warnings and Notes */}
                  {tool.warning && (
                    <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700">{tool.warning}</p>
                    </div>
                  )}
                  
                  {tool.note && (
                    <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg mb-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-700">{tool.note}</p>
                    </div>
                  )}
                </div>

                {/* Tool Actions */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openTool(tool)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Quick Launch
                    </button>
                    <button
                      onClick={() => openToolWithBrowserSelector(tool)}
                      className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      title="Browser Options"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Quick Search for direct integration tools */}
                  {tool.integration === 'direct' && (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Quick search..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            openTool(tool, e.target.value.trim());
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Tool Category */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">{tool.category}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredTools().length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tools found</h3>
            <p className="text-gray-600">
              Try adjusting your search query or browse different categories.
            </p>
          </div>
        )}

        {/* Safety and Ethics Notice */}
        <div className="mt-12 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-2">Ethical Use Guidelines</h3>
              <div className="space-y-2 text-sm text-amber-800">
                <p>• <strong>Legal Compliance:</strong> Always follow local laws and regulations when conducting investigations.</p>
                <p>• <strong>Privacy Respect:</strong> Use these tools responsibly and respect individual privacy rights.</p>
                <p>• <strong>Authorized Research:</strong> Only use breach search tools for legitimate security research with proper authorization.</p>
                <p>• <strong>Data Protection:</strong> Handle any discovered information according to applicable data protection laws.</p>
                <p>• <strong>Platform Terms:</strong> Respect the terms of service of each tool and platform you use.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tool Statistics */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => {
            const toolCount = osintTools[category.id]?.length || 0;
            const IconComponent = category.icon;
            return (
              <div key={category.id} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <IconComponent className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{toolCount}</div>
                <div className="text-sm text-gray-600">{category.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access Toolbar */}
      <div className="fixed bottom-6 right-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-gray-700">Quick Access:</div>
            <button
              onClick={() => setActiveCategory('people')}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="People Search"
            >
              <Users className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveCategory('breach')}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Breach Analysis"
            >
              <Shield className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveCategory('email')}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Email Analysis"
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Browser Selector Modal */}
      <BrowserSelector
        isOpen={showBrowserSelector}
        onClose={() => setShowBrowserSelector(false)}
        url={pendingUrl}
        onBrowserSelect={handleBrowserSelect}
      />
    </div>
  );
}

export default OSINTTools;