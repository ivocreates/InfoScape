import React, { useState, useEffect, useMemo } from "react";
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { 
  Copy, 
  ExternalLink, 
  RotateCcw, 
  Save, 
  Search, 
  Globe, 
  FileText, 
  Users, 
  Shield, 
  Chrome, 
  Monitor, 
  Code, 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  Filter, 
  Download,
  Eye, 
  Clock, 
  CheckCircle, 
  X, 
  RefreshCw, 
  Database, 
  Target, 
  Layers
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

// Advanced OSINT Search Engine utilities
const osintEngines = {
  google: {
    name: 'Google',
    baseUrl: 'https://www.google.com/search',
    operators: ['site:', 'inurl:', 'intitle:', 'intext:', 'filetype:', 'cache:', 'link:', 'allintitle:', 'allinurl:', 'ext:', 'before:', 'after:', 'AROUND():', 'numrange:'],
    maxQueryLength: 2048,
    rateLimit: 100,
    supports: ['temporal', 'proximity', 'wildcard', 'boolean']
  },
  bing: {
    name: 'Bing',
    baseUrl: 'https://www.bing.com/search',
    operators: ['site:', 'inurl:', 'intitle:', 'intext:', 'filetype:', 'contains:', 'location:', 'ip:', 'language:', 'feed:'],
    maxQueryLength: 1000,
    rateLimit: 200,
    supports: ['temporal', 'location', 'ip']
  },
  yandex: {
    name: 'Yandex',
    baseUrl: 'https://yandex.com/search/',
    operators: ['site:', 'url:', 'inurl:', '+', '&&', '<<', '/+n'],
    maxQueryLength: 1000,
    rateLimit: 150,
    supports: ['proximity', 'boolean', 'wildcard']
  },
  baidu: {
    name: 'Baidu',
    baseUrl: 'https://www.baidu.com/s',
    operators: ['site:', 'inurl:', 'intitle:', 'filetype:', 'quotation'],
    maxQueryLength: 500,
    rateLimit: 100,
    supports: ['basic']
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    baseUrl: 'https://duckduckgo.com/',
    operators: ['site:', 'inurl:', 'intitle:', 'intext:', 'filetype:', 'region:', 'bang'],
    maxQueryLength: 500,
    rateLimit: 300,
    supports: ['privacy', 'bang']
  }
};

const riskLevels = {
  low: { color: 'green', label: 'Low Risk' },
  medium: { color: 'yellow', label: 'Medium Risk' },
  high: { color: 'red', label: 'High Risk' },
  critical: { color: 'purple', label: 'Critical Risk' }
};

// Utility functions
function validateQuery(query, engineKey) {
  const engine = osintEngines[engineKey];
  if (!engine) return { valid: false, error: 'Unknown search engine' };
  
  if (query.length > engine.maxQueryLength) {
    return { valid: false, error: `Query too long (max: ${engine.maxQueryLength} chars)` };
  }
  
  return { valid: true };
}

function assessRisk(query) {
  const criticalKeywords = ['password', 'confidential', 'secret', 'admin', 'login', 'database', 'backup'];
  const highKeywords = ['internal', 'private', 'restricted', 'config', 'env', 'credentials'];
  const mediumKeywords = ['contact', 'phone', 'email', 'address', 'personal'];
  
  const lowerQuery = query.toLowerCase();
  
  if (criticalKeywords.some(kw => lowerQuery.includes(kw))) return 'critical';
  if (highKeywords.some(kw => lowerQuery.includes(kw))) return 'high';
  if (mediumKeywords.some(kw => lowerQuery.includes(kw))) return 'medium';
  return 'low';
}

function generateVariations(target) {
  const variations = [];
  
  if (target.fullName) {
    const name = target.fullName.trim();
    if (name.includes(' ')) {
      const parts = name.split(' ').filter(p => p.trim());
      variations.push(`"${parts[0]} ${parts[parts.length - 1]}"`);
      variations.push(`"${parts[0][0]}. ${parts[parts.length - 1]}"`);
      variations.push(`"${parts[0]} ${parts[parts.length - 1][0]}."`);
    }
  }
  
  if (target.email) {
    const domain = target.email.split('@')[1];
    if (domain) {
      variations.push(`site:${domain}`);
      variations.push(`inurl:${domain}`);
    }
  }
  
  if (target.username) {
    variations.push(`"@${target.username}"`);
    variations.push(`inurl:${target.username}`);
  }
  
  return variations.slice(0, 5);
}

// Hook for localStorage with encryption simulation
function useSecureStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        return { ...initialValue, ...parsed };
      }
      return initialValue;
    } catch {
      return initialValue;
    }
  });
  
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  
  return [value, setValue];
}

// Advanced dorking utilities
function tokenizeCSV(s) {
  if (!s) return [];
  return s
    .split(/[\n,]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function wrapQuotes(s) {
  if (!s) return s;
  const trimmed = s.trim();
  if (/^".*"$/.test(trimmed)) return trimmed;
  if (/[\s]/.test(trimmed) || /[@]/.test(trimmed)) return `"${trimmed}"`;
  return trimmed;
}

function orClause(prefix, list) {
  if (!list?.length) return "";
  const content = list.map((v) => `${prefix}${v}`).join(" OR ");
  return list.length > 1 ? `(${content})` : content;
}

function andClause(terms) {
  return terms.filter(Boolean).join(" AND ");
}

// Advanced query builder with engine-specific optimization
function buildAdvancedQuery(values, preset = null, useAND = false, engineKey = 'google') {
  if (!values || typeof values !== 'object') return '';
  const terms = [];

  // Identity anchors with proper escaping
  if (values.fullName) terms.push(wrapQuotes(values.fullName));
  if (values.username) {
    terms.push(wrapQuotes(values.username));
    if (!values.username.startsWith('@')) {
      terms.push(wrapQuotes(`@${values.username}`));
    }
  }
  if (values.email) terms.push(wrapQuotes(values.email));
  if (values.phone) terms.push(wrapQuotes(values.phone));

  // Context with location intelligence
  if (values.location) {
    terms.push(wrapQuotes(values.location));
    const locationParts = values.location.split(',').map(p => p.trim());
    locationParts.forEach(part => {
      if (part && part !== values.location) {
        terms.push(wrapQuotes(part));
      }
    });
  }
  if (values.company) terms.push(wrapQuotes(values.company));
  if (values.school) terms.push(wrapQuotes(values.school));

  // Keywords with intelligent processing
  for (const k of tokenizeCSV(values.include || '')) terms.push(wrapQuotes(k));
  for (const k of tokenizeCSV(values.exclude || '')) terms.push("-" + wrapQuotes(k));

  // Advanced operators
  const sites = tokenizeCSV(values.sites || '');
  if (sites.length) terms.push(orClause("site:", sites));

  const filetypes = tokenizeCSV(values.filetypes || '');
  if (filetypes.length) terms.push(orClause("filetype:", filetypes));

  const inurls = tokenizeCSV(values.inurl || '');
  if (inurls.length) terms.push(orClause("inurl:", inurls));

  const intitles = tokenizeCSV(values.intitle || '');
  if (intitles.length) terms.push(orClause("intitle:", intitles));

  const intexts = tokenizeCSV(values.intext || '');
  if (intexts.length) terms.push(orClause("intext:", intexts));

  // Temporal operators (Google/Bing specific)
  if (['google', 'bing'].includes(engineKey)) {
    if (values.after) terms.push(`after:${values.after}`);
    if (values.before) terms.push(`before:${values.before}`);
  }

  // Advanced preset modifiers
  if (preset === "linkedin") {
    if (engineKey === 'google') {
      terms.push(orClause("site:", ["linkedin.com/in", "linkedin.com/pub", "linkedin.com/company"]));
    } else {
      terms.push("site:linkedin.com");
    }
    if (!values.intitle) terms.push(orClause("intitle:", ["profile", "linkedin"]));
  }
  
  if (preset === "social-media") {
    const socialSites = [
      "twitter.com", "instagram.com", "facebook.com", "tiktok.com", 
      "snapchat.com", "youtube.com", "reddit.com", "pinterest.com"
    ];
    terms.push(orClause("site:", socialSites));
  }
  
  if (preset === "github") {
    terms.push("site:github.com");
    if (values.username) {
      terms.push(`inurl:${values.username}`);
    }
  }
  
  if (preset === "resume") {
    terms.push(orClause("filetype:", ["pdf", "doc", "docx"]));
    terms.push(orClause("intitle:", ["resume", "cv", "curriculum vitae"]));
  }
  
  if (preset === "contact") {
    terms.push(orClause("intitle:", ["contact", "about", "email"]));
    terms.push(orClause("intext:", ["phone", "email", "contact"]));
  }
  
  if (preset === "leaks") {
    const leakSites = [
      "pastebin.com", "ghostbin.com", "rentry.co", "gist.github.com",
      "justpaste.it", "controlc.com", "hastebin.com", "paste.ee"
    ];
    terms.push(orClause("site:", leakSites));
  }
  
  if (preset === "academic") {
    const academicSites = [
      "researchgate.net", "academia.edu", "scholar.google.com",
      "orcid.org", "pubmed.ncbi.nlm.nih.gov", "arxiv.org"
    ];
    terms.push(orClause("site:", academicSites));
    terms.push(orClause("filetype:", ["pdf"]));
  }
  
  if (preset === "professional") {
    const professionalSites = [
      "linkedin.com", "indeed.com", "glassdoor.com", 
      "monster.com", "crunchbase.com", "bloomberg.com"
    ];
    terms.push(orClause("site:", professionalSites));
    terms.push(orClause("intitle:", ["profile", "resume", "bio"]));
  }

  if (preset === "sensitive") {
    terms.push(orClause("filetype:", ["xls", "xlsx", "csv", "sql", "db"]));
    terms.push(orClause("intext:", ["password", "confidential", "internal"]));
  }

  if (preset === "infrastructure") {
    terms.push(orClause("inurl:", ["admin", "login", "panel", "dashboard"]));
    terms.push(orClause("intitle:", ["index of", "directory listing"]));
  }

  return useAND ? andClause(terms) : terms.filter(Boolean).join(" ");
}

// Enhanced Field component with validation
function EnhancedField({ labelText, children, hint, error, required = false }) {
  return (
    <div className="space-y-2">
      <label className={`text-sm font-medium ${error ? 'text-red-700' : 'text-gray-700'}`}>
        {labelText}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

// Investigation Component (simplified to avoid constructor issues)
function Investigation() {
  const [values, setValues] = useSecureStorage("osint-investigation-v2", {
    fullName: "",
    username: "",
    email: "",
    phone: "",
    location: "",
    company: "",
    school: "",
    include: "",
    exclude: "",
    sites: "",
    filetypes: "",
    inurl: "",
    intitle: "",
    intext: "",
    after: "",
    before: "",
    proximity: "5"
  });
  
  const [engine, setEngine] = useState("google");
  const [preset, setPreset] = useState(null);
  const [useAND, setUseAND] = useState(false);
  const [saving, setSaving] = useState(false);
  const [investigationName, setInvestigationName] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [activeSearches, setActiveSearches] = useState([]);
  const [errors, setErrors] = useState({});
  const [riskLevel, setRiskLevel] = useState('low');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [multiEngine, setMultiEngine] = useState(false);
  const [results, setResults] = useState([]);

  const query = useMemo(() => {
    if (!values || typeof values !== 'object') return '';
    const generatedQuery = buildAdvancedQuery(values, preset, useAND, engine);
    
    // Assess risk level
    const risk = assessRisk(generatedQuery);
    setRiskLevel(risk);
    
    return generatedQuery;
  }, [values, preset, useAND, engine]);

  // Validate form fields
  useEffect(() => {
    const newErrors = {};
    
    if (query) {
      const validation = validateQuery(query, engine);
      if (!validation.valid) {
        newErrors.query = validation.error;
      }
    }
    
    setErrors(newErrors);
  }, [query, engine]);

  // Advanced dorking templates with risk assessment
  const advancedTemplates = [
    {
      id: 'social-media',
      name: 'Social Media Hunt',
      icon: Users,
      description: 'Find profiles across major social platforms',
      color: 'bg-blue-500',
      risk: 'low'
    },
    {
      id: 'professional',
      name: 'Professional Profile',
      icon: FileText,
      description: 'LinkedIn, resumes, and career information',
      color: 'bg-green-500',
      risk: 'low'
    },
    {
      id: 'academic',
      name: 'Academic Research',
      icon: Globe,
      description: 'Research papers, academic profiles',
      color: 'bg-purple-500',
      risk: 'low'
    },
    {
      id: 'contact',
      name: 'Contact Information',
      icon: Search,
      description: 'Email addresses, phone numbers, contact pages',
      color: 'bg-amber-500',
      risk: 'medium'
    },
    {
      id: 'leaks',
      name: 'Data Breach Search',
      icon: Shield,
      description: 'Pastebin, GitHub gists, leaked information',
      color: 'bg-red-500',
      risk: 'high'
    },
    {
      id: 'github',
      name: 'Developer Profile',
      icon: Code,
      description: 'GitHub repositories and developer activity',
      color: 'bg-gray-700',
      risk: 'low'
    },
    {
      id: 'sensitive',
      name: 'Sensitive Data',
      icon: AlertTriangle,
      description: 'Confidential files, databases, credentials',
      color: 'bg-red-700',
      risk: 'critical'
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure Recon',
      icon: Database,
      description: 'Admin panels, login pages, directories',
      color: 'bg-orange-500',
      risk: 'high'
    }
  ];

  function update(k, v) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  const openEngine = (engineType, searchQuery, browserType = 'system-default') => {
    const q = encodeURIComponent(searchQuery);
    let url = "";
    
    switch (engineType) {
      case "google":
        url = `https://www.google.com/search?q=${q}`;
        break;
      case "duckduckgo":
        url = `https://duckduckgo.com/?q=${q}`;
        break;
      case "bing":
        url = `https://www.bing.com/search?q=${q}`;
        break;
      case "yandex":
        url = `https://yandex.com/search/?text=${q}`;
        break;
      case "baidu":
        url = `https://www.baidu.com/s?wd=${q}`;
        break;
      default:
        url = `https://www.google.com/search?q=${q}`;
    }
    
    // Log search history
    const searchEntry = {
      id: Date.now(),
      query: searchQuery,
      engine: engineType,
      browser: browserType,
      timestamp: new Date().toISOString(),
      risk: riskLevel
    };
    
    setSearchHistory(prev => [searchEntry, ...prev.slice(0, 19)]);
    
    if (window.electronAPI) {
      if (browserType !== 'system-default') {
        window.electronAPI.openBrowserWith(url, browserType);
      } else {
        window.electronAPI.openBrowser(url);
      }
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const getVariations = () => {
    if (!values || !values.fullName || typeof values.fullName !== 'string') return [];
    return generateVariations(values);
  };

  const copyQuery = async () => {
    try {
      await navigator.clipboard.writeText(query);
    } catch (err) {
      console.error('Failed to copy query:', err);
    }
  };

  const saveInvestigation = async () => {
    if (!investigationName.trim()) {
      alert('Please provide a name for this investigation');
      return;
    }

    setSaving(true);
    try {
      if (!auth.currentUser) {
        alert('You must be logged in to save investigations.');
        setSaving(false);
        return;
      }

      const investigationData = {
        name: investigationName,
        targetName: values.fullName || values.username || values.email || 'Unknown',
        searchParameters: values,
        query: query,
        preset: preset,
        engine: engine,
        useAND: useAND,
        riskLevel: riskLevel,
        searchHistory: searchHistory,
        results: results,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        userId: auth.currentUser.uid
      };

      await addDoc(collection(db, `users/${auth.currentUser.uid}/investigations`), investigationData);
      alert('Investigation saved successfully!');
      setInvestigationName('');
    } catch (error) {
      console.error('Error saving investigation:', error);
      alert('Failed to save investigation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setValues({
      fullName: "",
      username: "",
      email: "",
      phone: "",
      location: "",
      company: "",
      school: "",
      include: "",
      exclude: "",
      sites: "",
      filetypes: "",
      inurl: "",
      intitle: "",
      intext: "",
      after: "",
      before: "",
      proximity: "5"
    });
    setPreset(null);
    setInvestigationName("");
    setSearchHistory([]);
    setActiveSearches([]);
    setResults([]);
  };

  const chips = [
    values && values.fullName && `Name: ${values.fullName}`,
    values && values.username && `User: ${values.username}`,
    values && values.email && `Email: ${values.email}`,
    values && values.phone && `Phone: ${values.phone}`,
    values && values.location && `Loc: ${values.location}`,
    values && values.company && `Org: ${values.company}`,
    values && values.school && `School: ${values.school}`,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Enhanced Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Advanced OSINT Investigation Engine
              </h1>
              <p className="text-gray-600 mt-1">
                Professional-grade open source intelligence gathering with multi-engine search capabilities
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                Risk: {riskLevels[riskLevel].label}
              </div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="btn-secondary text-sm"
              >
                <Filter className="w-4 h-4 mr-1" />
                {showAdvanced ? 'Basic' : 'Advanced'}
              </button>
              <button
                onClick={resetForm}
                className="btn-secondary text-sm"
              >
                <Zap className="w-4 h-4 mr-1" />
                Reset
              </button>
            </div>
          </div>

          {/* Risk Warning */}
          {(riskLevel === 'high' || riskLevel === 'critical') && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-900">High Risk Investigation</h3>
                  <p className="text-sm text-red-800 mt-1">
                    This search may access sensitive or confidential information. Ensure you have proper authorization and comply with all applicable laws and regulations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search Engine & Logic Selection */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Search Engine:</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(osintEngines).map(([key, engineData]) => (
                  <button
                    key={key}
                    className={`chip text-xs transition-all duration-200 ${
                      engine === key ? "chip-primary" : "chip-secondary hover:bg-gray-200"
                    }`}
                    onClick={() => setEngine(key)}
                    title={`${engineData.name} - Rate limit: ${engineData.rateLimit}/hour`}
                  >
                    {engineData.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Logic:</span>
              <div className="flex gap-2">
                <button
                  className={`chip text-xs transition-all duration-200 ${
                    !useAND ? "chip-primary" : "chip-secondary hover:bg-gray-200"
                  }`}
                  onClick={() => setUseAND(false)}
                >
                  OR (Broad)
                </button>
                <button
                  className={`chip text-xs transition-all duration-200 ${
                    useAND ? "chip-primary" : "chip-secondary hover:bg-gray-200"
                  }`}
                  onClick={() => setUseAND(true)}
                >
                  AND (Precise)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="checkbox"
                id="multiEngine"
                checked={multiEngine}
                onChange={(e) => setMultiEngine(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="multiEngine" className="text-sm font-medium text-gray-700">
                Multi-Engine Search
              </label>
            </div>
          </div>

          {/* Enhanced Dorking Templates */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Investigation Templates:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {advancedTemplates.map((template) => {
                const Icon = template.icon;
                const isSelected = preset === template.id;
                return (
                  <button
                    key={template.id}
                    className={`p-4 rounded-lg border text-left transition-all duration-200 relative group ${
                      isSelected 
                        ? "bg-black text-white border-black shadow-lg transform scale-105" 
                        : "bg-white border-gray-200 hover:border-gray-400 hover:shadow-md text-gray-900 hover:bg-gray-50"
                    }`}
                    onClick={() => setPreset(preset === template.id ? null : template.id)}
                    title={template.description}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-gray-700'}`} />
                      <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {template.name}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed mb-3 ${isSelected ? 'text-gray-300' : 'text-gray-600'}`}>
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        template.risk === 'low' ? 
                          (isSelected ? 'bg-green-600 text-green-100' : 'bg-green-100 text-green-800') :
                        template.risk === 'medium' ? 
                          (isSelected ? 'bg-yellow-600 text-yellow-100' : 'bg-yellow-100 text-yellow-800') :
                        template.risk === 'high' ? 
                          (isSelected ? 'bg-red-600 text-red-100' : 'bg-red-100 text-red-800') :
                          (isSelected ? 'bg-purple-600 text-purple-100' : 'bg-purple-100 text-purple-800')
                      }`}>
                        {template.risk}
                      </span>
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    
                    {/* Hover effect indicator */}
                    {!isSelected && (
                      <div className="absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity"></div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Template Selection Helper */}
            {preset && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm font-medium">
                    {advancedTemplates.find(t => t.id === preset)?.name} template active
                  </span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  This template will modify your search query with specialized operators and filters.
                </p>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Identity & Context - Left Column */}
          <section className="xl:col-span-4">
            <div className="card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                  <Target className="w-5 h-5" />
                  Target Information
                </h2>
                <div className="space-y-4">
                  <EnhancedField labelText="Full Name" hint="Exact name for precise matching" required>
                    <input
                      className="input-field"
                      placeholder='e.g., "John Smith"'
                      value={values.fullName}
                      onChange={(e) => update("fullName", e.target.value)}
                    />
                  </EnhancedField>
                  <EnhancedField labelText="Username / Handle" hint="Social media handles, forum names">
                    <input
                      className="input-field"
                      placeholder="e.g., johnsmith123, @john_smith"
                      value={values.username}
                      onChange={(e) => update("username", e.target.value)}
                    />
                  </EnhancedField>
                  <EnhancedField labelText="Email Address" hint="Primary or known email addresses">
                    <input
                      className="input-field"
                      placeholder="e.g., john@example.com"
                      value={values.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
                  </EnhancedField>
                  <EnhancedField labelText="Phone Number" hint="Include country code if known">
                    <input
                      className="input-field"
                      placeholder="e.g., +1 555-123-4567"
                      value={values.phone}
                      onChange={(e) => update("phone", e.target.value)}
                    />
                  </EnhancedField>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Context Information</h2>
                <div className="space-y-4">
                  <EnhancedField labelText="Location" hint="City, state, country - be specific">
                    <input
                      className="input-field"
                      placeholder="New York, NY, USA"
                      value={values.location}
                      onChange={(e) => update("location", e.target.value)}
                    />
                  </EnhancedField>
                  <EnhancedField labelText="Company / Organization" hint="Current or previous employers">
                    <input
                      className="input-field"
                      placeholder="Acme Corporation, Google Inc."
                      value={values.company}
                      onChange={(e) => update("company", e.target.value)}
                    />
                  </EnhancedField>
                  <EnhancedField labelText="School / University" hint="Educational institutions attended">
                    <input
                      className="input-field"
                      placeholder="Harvard University, MIT"
                      value={values.school}
                      onChange={(e) => update("school", e.target.value)}
                    />
                  </EnhancedField>
                </div>
              </div>

              {/* Display identity chips */}
              {chips.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Active Search Terms:</h3>
                  <div className="flex flex-wrap gap-2">
                    {chips.map((chip, index) => (
                      <span key={index} className="chip-secondary text-xs">
                        {chip}
                        <button
                          onClick={() => {
                            const [key] = chip.split(': ');
                            const fieldMap = {
                              'Name': 'fullName',
                              'User': 'username',
                              'Email': 'email',
                              'Phone': 'phone',
                              'Loc': 'location',
                              'Org': 'company',
                              'School': 'school'
                            };
                            if (fieldMap[key]) update(fieldMap[key], '');
                          }}
                          className="ml-2 text-gray-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Operators & Keywords - Middle Column */}
          <section className="xl:col-span-4">
            <div className="card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                  <Layers className="w-5 h-5" />
                  Search Operators
                </h2>
                <div className="space-y-4">
                  <EnhancedField labelText="Target Sites" hint="Specific domains to search within">
                    <textarea
                      className="input-field min-h-[72px] resize-none"
                      placeholder="linkedin.com, github.com, twitter.com"
                      value={values.sites}
                      onChange={(e) => update("sites", e.target.value)}
                    />
                  </EnhancedField>
                  <EnhancedField labelText="File Types" hint="Document types to search for">
                    <input
                      className="input-field"
                      placeholder="pdf, docx, xlsx, pptx"
                      value={values.filetypes}
                      onChange={(e) => update("filetypes", e.target.value)}
                    />
                  </EnhancedField>
                  <EnhancedField labelText="URL Contains (inurl:)" hint="Keywords that must appear in URLs">
                    <input
                      className="input-field"
                      placeholder="profile, resume, contact, about"
                      value={values.inurl}
                      onChange={(e) => update("inurl", e.target.value)}
                    />
                  </EnhancedField>
                  <EnhancedField labelText="Title Contains (intitle:)" hint="Keywords in page titles">
                    <input
                      className="input-field"
                      placeholder="resume, cv, portfolio, about"
                      value={values.intitle}
                      onChange={(e) => update("intitle", e.target.value)}
                    />
                  </EnhancedField>
                  <EnhancedField labelText="Text Contains (intext:)" hint="Keywords in page content">
                    <input
                      className="input-field"
                      placeholder="phone, email, address, contact"
                      value={values.intext}
                      onChange={(e) => update("intext", e.target.value)}
                    />
                  </EnhancedField>
                  
                  {/* Advanced operators for experienced users */}
                  {showAdvanced && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <EnhancedField labelText="After Date">
                          <input
                            type="date"
                            className="input-field"
                            value={values.after}
                            onChange={(e) => update("after", e.target.value)}
                          />
                        </EnhancedField>
                        <EnhancedField labelText="Before Date">
                          <input
                            type="date"
                            className="input-field"
                            value={values.before}
                            onChange={(e) => update("before", e.target.value)}
                          />
                        </EnhancedField>
                      </div>
                      <EnhancedField labelText="Proximity (words apart)" hint="For engines that support proximity search">
                        <input
                          type="number"
                          className="input-field"
                          placeholder="5"
                          min="1"
                          max="20"
                          value={values.proximity}
                          onChange={(e) => update("proximity", e.target.value)}
                        />
                      </EnhancedField>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Keywords</h2>
                <div className="space-y-4">
                  <EnhancedField labelText="Include Keywords" hint="Comma or newline separated">
                    <textarea
                      className="input-field min-h-[72px] resize-none"
                      placeholder="portfolio, developer, engineer, consultant"
                      value={values.include}
                      onChange={(e) => update("include", e.target.value)}
                    />
                  </EnhancedField>
                  <EnhancedField labelText="Exclude Keywords" hint="Terms to exclude from results">
                    <textarea
                      className="input-field min-h-[72px] resize-none"
                      placeholder="footballer, actor, musician, student"
                      value={values.exclude}
                      onChange={(e) => update("exclude", e.target.value)}
                    />
                  </EnhancedField>
                </div>
              </div>
            </div>
          </section>

          {/* Query Builder & Actions - Right Column */}
          <section className="xl:col-span-4">
            <div className="space-y-6">
              {/* Generated Query */}
              <div className="card p-6">
                <EnhancedField 
                  labelText="Generated Query" 
                  error={errors.query}
                  hint={`${query.length}/${osintEngines[engine].maxQueryLength} characters`}
                >
                  <textarea
                    className={`input-field font-mono text-xs min-h-[120px] resize-none ${
                      errors.query ? 'border-red-300 focus:ring-red-500' : ''
                    }`}
                    value={query}
                    readOnly
                    placeholder="Your search query will appear here..."
                  />
                </EnhancedField>

                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    className="btn-primary flex items-center gap-2"
                    onClick={() => openEngine(engine, query)}
                    disabled={!query.trim() || errors.query}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Search in {osintEngines[engine].name}
                  </button>
                  
                  <button
                    className="btn-secondary flex items-center gap-2"
                    onClick={copyQuery}
                    disabled={!query.trim()}
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
              </div>

              {/* Query Variations */}
              {values.fullName && getVariations().length > 0 && (
                <div className="card p-6 bg-blue-50 border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Query Variations
                  </h3>
                  <div className="space-y-2">
                    {getVariations().map((variation, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-blue-200">
                        <code className="text-xs text-blue-800">{variation}</code>
                        <button
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          onClick={() => {
                            const variationQuery = buildAdvancedQuery({...values, fullName: variation.replace(/"/g, '')}, preset, useAND, engine);
                            openEngine(engine, variationQuery);
                          }}
                        >
                          Search
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search History */}
              {searchHistory.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Searches ({searchHistory.length})
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchHistory.slice(0, 10).map((search) => (
                      <div key={search.id} className="bg-gray-50 p-2 rounded text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-700">{search.engine}</span>
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-xs ${
                              search.risk === 'low' ? 'bg-green-100 text-green-800' :
                              search.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              search.risk === 'high' ? 'bg-red-100 text-red-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {search.risk}
                            </span>
                            <span className="text-gray-500">{new Date(search.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <code className="text-gray-600 break-all">{search.query}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Investigation */}
              <div className="card p-6">
                <h3 className="font-semibold mb-3 text-gray-900">Save Investigation</h3>
                <EnhancedField labelText="Investigation Name" required>
                  <input
                    className="input-field"
                    placeholder="e.g., John Smith Corporate Background Check"
                    value={investigationName}
                    onChange={(e) => setInvestigationName(e.target.value)}
                  />
                </EnhancedField>
                <button
                  className="btn-primary w-full mt-3 flex items-center justify-center gap-2"
                  onClick={saveInvestigation}
                  disabled={saving || !investigationName.trim()}
                >
                  {saving ? <LoadingSpinner size="small" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Investigation'}
                </button>
              </div>

              {/* Ethics & Legal Notice */}
              <div className="card p-6 bg-amber-50 border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Ethics & Legal Compliance
                </h3>
                <div className="text-sm text-amber-700 space-y-2">
                  <p>• Only investigate with legitimate purpose and proper authorization</p>
                  <p>• Respect privacy rights and comply with local laws (GDPR, CCPA, etc.)</p>
                  <p>• Avoid harassment, stalking, or doxxing activities</p>
                  <p>• Follow platform terms of service and rate limits</p>
                  <p>• Document your legal basis for investigation</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Investigation;
