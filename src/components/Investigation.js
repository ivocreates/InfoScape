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
  CheckCircle,
  Clock, 
  Download,
  Eye, 
  X, 
  RefreshCw, 
  Database, 
  Target, 
  Layers,
  MapPin,
  Type,
  Tag,
  Settings
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
      {labelText && (
        <label className={`text-sm font-semibold ${
          error 
            ? 'text-red-700 dark:text-red-400' 
            : 'text-gray-900 dark:text-gray-200'
        }`}>
          {labelText}
          {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
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
  const [completing, setCompleting] = useState(false);
  const [investigationStatus, setInvestigationStatus] = useState('active'); // 'active', 'completed', 'archived'
  const [investigationName, setInvestigationName] = useState("");
  const [investigationDescription, setInvestigationDescription] = useState("");
  const [investigationNotes, setInvestigationNotes] = useState("");
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
        description: investigationDescription,
        notes: investigationNotes,
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
      setInvestigationDescription('');
      setInvestigationNotes('');
    } catch (error) {
      console.error('Error saving investigation:', error);
      alert('Failed to save investigation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const completeInvestigation = async () => {
    if (!investigationName.trim()) {
      alert('Please provide a name for this investigation before completing it');
      return;
    }

    if (!window.confirm('Are you sure you want to mark this investigation as completed? This action cannot be undone.')) {
      return;
    }

    setCompleting(true);
    try {
      if (!auth.currentUser) {
        alert('You must be logged in to complete investigations.');
        setCompleting(false);
        return;
      }

      const investigationData = {
        name: investigationName,
        description: investigationDescription,
        notes: investigationNotes,
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
        completedAt: serverTimestamp(),
        status: 'completed',
        userId: auth.currentUser.uid
      };

      await addDoc(collection(db, `users/${auth.currentUser.uid}/investigations`), investigationData);
      setInvestigationStatus('completed');
      alert('Investigation completed and saved successfully!');
      
      // Optionally clear the form
      setInvestigationName('');
      setInvestigationDescription('');
      setInvestigationNotes('');
    } catch (error) {
      console.error('Error completing investigation:', error);
      alert('Failed to complete investigation. Please try again.');
    } finally {
      setCompleting(false);
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
    setInvestigationDescription("");
    setInvestigationNotes("");
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
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
        {/* Enhanced Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Advanced OSINT Investigation Engine
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                Professional-grade open source intelligence gathering with multi-engine search capabilities
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-sm border ${
                riskLevel === 'low' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700' :
                riskLevel === 'medium' ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700' :
                riskLevel === 'high' ? 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700' :
                'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700'
              }`}>
                Risk: {riskLevels[riskLevel].label}
              </div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="btn-secondary text-sm font-medium hover:shadow-md transition-all duration-200"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showAdvanced ? 'Basic Mode' : 'Advanced Mode'}
              </button>
              <button
                onClick={resetForm}
                className="btn-secondary text-sm font-medium hover:shadow-md transition-all duration-200"
              >
                <Zap className="w-4 h-4 mr-2" />
                Reset All
              </button>
            </div>
          </div>

          {/* Risk Warning */}
          {(riskLevel === 'high' || riskLevel === 'critical') && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 mb-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 dark:text-red-200 text-lg">High Risk Investigation Detected</h3>
                  <p className="text-sm text-red-800 dark:text-red-300 mt-2 leading-relaxed">
                    This search may access sensitive or confidential information. Ensure you have proper authorization and comply with all applicable laws and regulations. Consider ethical implications and privacy rights.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-300">
                      Legal Compliance Required
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-300">
                      Authorization Needed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Engine & Logic Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Search Engine:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(osintEngines).map(([key, engineData]) => (
                    <button
                      key={key}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                        engine === key 
                          ? "bg-black text-white border-black shadow-md dark:bg-white dark:text-black dark:border-white" 
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                      }`}
                      onClick={() => setEngine(key)}
                      title={`${engineData.name} - Rate limit: ${engineData.rateLimit}/hour`}
                    >
                      {engineData.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Query Logic:</span>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      !useAND 
                        ? "bg-black text-white border-black shadow-md dark:bg-white dark:text-black dark:border-white" 
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => setUseAND(false)}
                  >
                    OR (Broad Search)
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      useAND 
                        ? "bg-black text-white border-black shadow-md dark:bg-white dark:text-black dark:border-white" 
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => setUseAND(true)}
                  >
                    AND (Precise Search)
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Multi-Engine:</span>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={multiEngine}
                    onChange={(e) => setMultiEngine(e.target.checked)}
                    className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black dark:focus:ring-white dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Search All Engines
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Enhanced Dorking Templates */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Investigation Templates</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {advancedTemplates.map((template) => {
                const Icon = template.icon;
                const isSelected = preset === template.id;
                return (
                  <button
                    key={template.id}
                    className={`group p-5 rounded-xl border-2 text-left transition-all duration-300 relative overflow-hidden ${
                      isSelected 
                        ? "bg-black text-white border-black shadow-lg transform scale-105 dark:bg-white dark:text-black dark:border-white" 
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-xl text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-750 hover:-translate-y-1"
                    }`}
                    onClick={() => setPreset(preset === template.id ? null : template.id)}
                    title={template.description}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected 
                          ? 'bg-white/20 dark:bg-black/20' 
                          : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          isSelected 
                            ? 'text-white dark:text-black' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`} />
                      </div>
                      <span className={`text-sm font-bold ${
                        isSelected 
                          ? 'text-white dark:text-black' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {template.name}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed mb-4 ${
                      isSelected 
                        ? 'text-gray-300 dark:text-gray-700' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        template.risk === 'low' ? 
                          (isSelected ? 'bg-emerald-500/20 text-emerald-200 dark:bg-emerald-200/20 dark:text-emerald-700' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300') :
                        template.risk === 'medium' ? 
                          (isSelected ? 'bg-amber-500/20 text-amber-200 dark:bg-amber-200/20 dark:text-amber-700' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300') :
                        template.risk === 'high' ? 
                          (isSelected ? 'bg-red-500/20 text-red-200 dark:bg-red-200/20 dark:text-red-700' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300') :
                          (isSelected ? 'bg-purple-500/20 text-purple-200 dark:bg-purple-200/20 dark:text-purple-700' : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300')
                      }`}>
                        {template.risk.toUpperCase()}
                      </span>
                      {isSelected && (
                        <div className="w-3 h-3 bg-white dark:bg-black rounded-full animate-pulse"></div>
                      )}
                    </div>
                    
                    {/* Subtle hover effect */}
                    {!isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300 pointer-events-none"></div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Template Selection Helper */}
            {preset && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                <div className="flex items-center gap-3 text-blue-800 dark:text-blue-300">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold">
                    {advancedTemplates.find(t => t.id === preset)?.name} template is active
                  </span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-2 leading-relaxed">
                  This template will automatically apply specialized search operators and filters to optimize your investigation query.
                </p>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Identity & Context - Left Column */}
          <section className="xl:col-span-4">
            <div className="card p-6 space-y-8 shadow-md">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-black dark:bg-white rounded-lg">
                    <Target className="w-5 h-5 text-white dark:text-black" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Target Information</h2>
                </div>
                <div className="space-y-5">
                  <EnhancedField labelText="Full Name" hint="Exact name for precise matching" required>
                    <input
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder='e.g., "John Smith"'
                      value={values.fullName}
                      onChange={(e) => update("fullName", e.target.value)}
                    />
                  </EnhancedField>
                  <EnhancedField labelText="Username / Handle" hint="Social media handles, forum names">
                    <input
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder="e.g., johnsmith123, @john_smith"
                      value={values.username}
                      onChange={(e) => update("username", e.target.value)}
                    />
                  </EnhancedField>
                  <EnhancedField labelText="Email Address" hint="Primary or known email addresses">
                    <input
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder="e.g., john@example.com"
                      value={values.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
                  </EnhancedField>
                  <EnhancedField labelText="Phone Number" hint="Include country code if known">
                    <input
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder="e.g., +1 555-123-4567"
                      value={values.phone}
                      onChange={(e) => update("phone", e.target.value)}
                    />
                  </EnhancedField>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-black dark:bg-white rounded-lg">
                    <MapPin className="w-5 h-5 text-white dark:text-black" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Context Information</h2>
                </div>
                <div className="space-y-5">
                  <EnhancedField labelText="Location" hint="City, state, country - be specific">
                    <input
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder="New York, NY, USA"
                      value={values.location}
                      onChange={(e) => update("location", e.target.value)}
                    />
                  </EnhancedField>
                  <EnhancedField labelText="Company / Organization" hint="Current or previous employers">
                    <input
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder="Acme Corporation, Google Inc."
                      value={values.company}
                      onChange={(e) => update("company", e.target.value)}
                    />
                  </EnhancedField>
                  <EnhancedField labelText="School / University" hint="Educational institutions attended">
                    <input
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder="Harvard University, MIT"
                      value={values.school}
                      onChange={(e) => update("school", e.target.value)}
                    />
                  </EnhancedField>
                </div>
              </div>

              {/* Display identity chips */}
              {chips.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Active Search Terms</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {chips.map((chip, index) => (
                      <span key={index} className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm border border-gray-200 dark:border-gray-600">
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
                          className="ml-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200"
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
            <div className="card p-6 space-y-8 shadow-md">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-black dark:bg-white rounded-lg">
                    <Layers className="w-5 h-5 text-white dark:text-black" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Search Operators</h2>
                </div>
                <div className="space-y-5">
                  <EnhancedField labelText="Target Sites" hint="Specific domains to search within">
                    <textarea
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 min-h-[80px] resize-none custom-scrollbar"
                      placeholder="linkedin.com, github.com, twitter.com"
                      value={values.sites}
                      onChange={(e) => update("sites", e.target.value)}
                    />
                  </EnhancedField>
                  <EnhancedField labelText="File Types" hint="Document types to search for">
                    <input
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder="pdf, docx, xlsx, pptx"
                      value={values.filetypes}
                      onChange={(e) => update("filetypes", e.target.value)}
                    />
                  </EnhancedField>
                  <EnhancedField labelText="URL Contains (inurl:)" hint="Keywords that must appear in URLs">
                    <input
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder="profile, resume, contact, about"
                      value={values.inurl}
                      onChange={(e) => update("inurl", e.target.value)}
                    />
                  </EnhancedField>
                  <EnhancedField labelText="Title Contains (intitle:)" hint="Keywords in page titles">
                    <input
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder="resume, cv, portfolio, about"
                      value={values.intitle}
                      onChange={(e) => update("intitle", e.target.value)}
                    />
                  </EnhancedField>
                  <EnhancedField labelText="Text Contains (intext:)" hint="Keywords in page content">
                    <input
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder="phone, email, address, contact"
                      value={values.intext}
                      onChange={(e) => update("intext", e.target.value)}
                    />
                  </EnhancedField>
                  
                  {/* Advanced operators for experienced users */}
                  {showAdvanced && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <EnhancedField labelText="After Date">
                          <input
                            type="date"
                            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={values.after}
                            onChange={(e) => update("after", e.target.value)}
                          />
                        </EnhancedField>
                        <EnhancedField labelText="Before Date">
                          <input
                            type="date"
                            className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={values.before}
                            onChange={(e) => update("before", e.target.value)}
                          />
                        </EnhancedField>
                      </div>
                      <EnhancedField labelText="Proximity (words apart)" hint="For engines that support proximity search">
                        <input
                          type="number"
                          className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
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

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-black dark:bg-white rounded-lg">
                    <Type className="w-5 h-5 text-white dark:text-black" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Keywords</h2>
                </div>
                <div className="space-y-5">
                  <EnhancedField labelText="Include Keywords" hint="Comma or newline separated">
                    <textarea
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 min-h-[80px] resize-none custom-scrollbar"
                      placeholder="portfolio, developer, engineer, consultant"
                      value={values.include}
                      onChange={(e) => update("include", e.target.value)}
                    />
                  </EnhancedField>
                  <EnhancedField labelText="Exclude Keywords" hint="Terms to exclude from results">
                    <textarea
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 min-h-[80px] resize-none custom-scrollbar"
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
              <div className="card p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-black dark:bg-white rounded-lg">
                    <Code className="w-5 h-5 text-white dark:text-black" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generated Query</h3>
                </div>
                <EnhancedField 
                  labelText="" 
                  error={errors.query}
                  hint={`${query.length}/${osintEngines[engine].maxQueryLength} characters`}
                >
                  <textarea
                    className={`input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 font-mono text-sm min-h-[140px] resize-none custom-scrollbar ${
                      errors.query ? 'border-red-300 focus:ring-red-500 dark:border-red-600' : ''
                    }`}
                    value={query}
                    readOnly
                    placeholder="Your search query will appear here..."
                  />
                </EnhancedField>

                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    className="btn-primary flex items-center gap-2 text-sm font-semibold px-6 py-3 shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={() => openEngine(engine, query)}
                    disabled={!query.trim() || errors.query}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Search in {osintEngines[engine].name}
                  </button>
                  
                  <button
                    className="btn-secondary flex items-center gap-2 text-sm font-semibold px-4 py-3 shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={copyQuery}
                    disabled={!query.trim()}
                  >
                    <Copy className="w-4 h-4" />
                    Copy Query
                  </button>
                </div>
              </div>

              {/* Query Variations */}
              {values.fullName && getVariations().length > 0 && (
                <div className="card p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Query Variations</h3>
                  </div>
                  <div className="space-y-3">
                    {getVariations().map((variation, index) => (
                      <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-600 shadow-sm">
                        <code className="text-sm text-blue-800 dark:text-blue-300 font-medium">{variation}</code>
                        <button
                          className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors duration-200"
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
                <div className="card p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Recent Searches ({searchHistory.length})
                    </h3>
                  </div>
                  <div className="space-y-3 max-h-72 overflow-y-auto popup-scrollbar">
                    {searchHistory.slice(0, 10).map((search) => (
                      <div key={search.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">{search.engine}</span>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              search.risk === 'low' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                              search.risk === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                              search.risk === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                              'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                            }`}>
                              {search.risk.toUpperCase()}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 text-xs">
                              {new Date(search.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <code className="text-gray-700 dark:text-gray-300 text-xs break-all leading-relaxed">{search.query}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Investigation */}
              <div className="card p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <Save className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Save Investigation</h3>
                </div>
                
                <div className="space-y-4">
                  <EnhancedField labelText="Investigation Name" required>
                    <input
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder="e.g., John Smith Corporate Background Check"
                      value={investigationName}
                      onChange={(e) => setInvestigationName(e.target.value)}
                    />
                  </EnhancedField>
                  
                  <EnhancedField labelText="Description" optional>
                    <input
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder="Brief description of the investigation purpose"
                      value={investigationDescription}
                      onChange={(e) => setInvestigationDescription(e.target.value)}
                    />
                  </EnhancedField>
                  
                  <EnhancedField labelText="Notes" optional>
                    <textarea
                      className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      placeholder="Investigation notes, findings, or observations..."
                      value={investigationNotes}
                      onChange={(e) => setInvestigationNotes(e.target.value)}
                      rows="3"
                      style={{ minHeight: '80px', resize: 'vertical' }}
                    />
                  </EnhancedField>
                </div>
                
                <div className="flex gap-3">
                  <button
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={saveInvestigation}
                    disabled={saving || completing || !investigationName.trim()}
                  >
                    {saving ? <LoadingSpinner size="small" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Investigation'}
                  </button>
                  
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white flex-1 flex items-center justify-center gap-2 py-3 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={completeInvestigation}
                    disabled={saving || completing || !investigationName.trim()}
                  >
                    {completing ? <LoadingSpinner size="small" /> : <CheckCircle className="w-4 h-4" />}
                    {completing ? 'Completing...' : 'Complete Investigation'}
                  </button>
                </div>
                
                {investigationStatus === 'completed' && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Investigation completed successfully!</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Ethics & Legal Notice */}
              <div className="card p-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-600 dark:bg-amber-500 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300">Ethics & Legal Compliance</h3>
                </div>
                <div className="text-sm text-amber-700 dark:text-amber-300 space-y-3 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Only investigate with legitimate purpose and proper authorization</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Respect privacy rights and comply with local laws (GDPR, CCPA, etc.)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Avoid harassment, stalking, or doxxing activities</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Follow platform terms of service and rate limits</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-600 dark:bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Document your legal basis for investigation</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
    </div>
  );
}

export default Investigation;
