import React, { useEffect, useMemo, useState } from "react";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Copy, ExternalLink, RotateCcw, Save, Search, Globe, FileText, Users, Shield, Chrome, Monitor, Code, Zap } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

// Hook for localStorage
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
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

// Helper functions
function tokenizeCSV(s) {
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

function buildQuery(values, preset = null, useAND = false) {
  const terms = [];

  // Identity anchors
  if (values.fullName) terms.push(wrapQuotes(values.fullName));
  if (values.username) terms.push(wrapQuotes(values.username));
  if (values.email) terms.push(wrapQuotes(values.email));
  if (values.phone) terms.push(wrapQuotes(values.phone));

  // Context
  if (values.location) terms.push(wrapQuotes(values.location));
  if (values.company) terms.push(wrapQuotes(values.company));
  if (values.school) terms.push(wrapQuotes(values.school));

  // Keywords
  for (const k of tokenizeCSV(values.include)) terms.push(wrapQuotes(k));
  for (const k of tokenizeCSV(values.exclude)) terms.push("-" + wrapQuotes(k));

  // Operators
  const sites = tokenizeCSV(values.sites);
  if (sites.length) terms.push(orClause("site:", sites));

  const filetypes = tokenizeCSV(values.filetypes);
  if (filetypes.length) terms.push(orClause("filetype:", filetypes));

  const inurls = tokenizeCSV(values.inurl);
  if (inurls.length) terms.push(orClause("inurl:", inurls));

  const intitles = tokenizeCSV(values.intitle);
  if (intitles.length) terms.push(orClause("intitle:", intitles));

  const intexts = tokenizeCSV(values.intext);
  if (intexts.length) terms.push(orClause("intext:", intexts));

  if (values.after) terms.push(`after:${values.after}`);
  if (values.before) terms.push(`before:${values.before}`);

  // Advanced preset modifiers with proper dorking techniques
  if (preset === "linkedin") {
    terms.push(orClause("site:", ["linkedin.com/in", "linkedin.com/pub"]));
    if (!values.intitle) terms.push(orClause("intitle:", ["profile"]));
  }
  if (preset === "social-media") {
    terms.push(orClause("site:", [
      "twitter.com", "instagram.com", "facebook.com", 
      "tiktok.com", "snapchat.com", "youtube.com"
    ]));
  }
  if (preset === "github") {
    terms.push("site:github.com");
    if (!values.username && values.fullName) terms.push("in:fullname");
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
    terms.push(orClause("site:", [
      "pastebin.com", "ghostbin.com", "rentry.co", "gist.github.com",
      "justpaste.it", "controlc.com", "hastebin.com"
    ]));
  }
  if (preset === "academic") {
    terms.push(orClause("site:", [
      "researchgate.net", "academia.edu", "scholar.google.com",
      "orcid.org", "pubmed.ncbi.nlm.nih.gov"
    ]));
    terms.push(orClause("filetype:", ["pdf"]));
  }
  if (preset === "professional") {
    terms.push(orClause("site:", [
      "linkedin.com", "indeed.com", "glassdoor.com", 
      "monster.com", "crunchbase.com"
    ]));
    terms.push(orClause("intitle:", ["profile", "resume", "bio"]));
  }

  // Use AND or OR logic based on user preference
  return useAND ? andClause(terms) : terms.filter(Boolean).join(" ");
}

// Field component
function Field({ labelText, children, hint }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{labelText}</label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

// Tag list component
function TagList({ title, items, onRemove }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </span>
      {items.map((t, i) => (
        <span key={i} className="chip-secondary">
          {t}
          <button
            onClick={() => onRemove?.(t)}
            className="ml-2 rounded-full border px-1.5 py-0.5 text-xs text-gray-500 hover:bg-gray-200 transition-colors"
            aria-label={`Remove ${t}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

function Investigation() {
  const [values, setValues] = useLocalStorage("osint-investigation-v1", {
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
  });
  
  const [engine, setEngine] = useState("google");
  const [preset, setPreset] = useState(null);
  const [useAND, setUseAND] = useState(false);
  const [saving, setSaving] = useState(false);
  const [investigationName, setInvestigationName] = useState("");

  const query = useMemo(() => buildQuery(values, preset, useAND), [values, preset, useAND]);

  // Advanced dorking templates
  const dorkingTemplates = [
    {
      id: 'social-media',
      name: 'Social Media Hunt',
      icon: Users,
      description: 'Find profiles across major social platforms',
      color: 'bg-blue-500'
    },
    {
      id: 'professional',
      name: 'Professional Profile',
      icon: FileText,
      description: 'LinkedIn, resumes, and career information',
      color: 'bg-green-500'
    },
    {
      id: 'academic',
      name: 'Academic Research',
      icon: Globe,
      description: 'Research papers, academic profiles',
      color: 'bg-purple-500'
    },
    {
      id: 'contact',
      name: 'Contact Information',
      icon: Search,
      description: 'Email addresses, phone numbers, contact pages',
      color: 'bg-amber-500'
    },
    {
      id: 'leaks',
      name: 'Data Breach Search',
      icon: Shield,
      description: 'Pastebin, GitHub gists, leaked information',
      color: 'bg-red-500'
    },
    {
      id: 'github',
      name: 'Developer Profile',
      icon: Code,
      description: 'GitHub repositories and developer activity',
      color: 'bg-gray-700'
    }
  ];

  // Browser options with icons and descriptions
  const browserOptions = [
    {
      id: 'system-default',
      name: 'System Default',
      icon: Monitor,
      description: 'Open in your default browser',
      command: null
    },
    {
      id: 'chrome',
      name: 'Google Chrome',
      icon: Chrome,
      description: 'Open in Chrome browser',
      command: 'chrome'
    },
    {
      id: 'firefox',
      name: 'Firefox',
      icon: Globe,
      description: 'Open in Firefox browser',
      command: 'firefox'
    },
    {
      id: 'edge',
      name: 'Microsoft Edge',
      icon: Monitor,
      description: 'Open in Edge browser',
      command: 'msedge'
    },
    {
      id: 'brave',
      name: 'Brave Browser',
      icon: Shield,
      description: 'Open in Brave browser',
      command: 'brave'
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
      case "duck":
        url = `https://duckduckgo.com/?q=${q}`;
        break;
      case "bing":
        url = `https://www.bing.com/search?q=${q}`;
        break;
      case "brave":
        url = `https://search.brave.com/search?q=${q}`;
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
    
    if (window.electronAPI) {
      // For Electron, we can try to specify browser
      if (browserType !== 'system-default') {
        window.electronAPI.openBrowserWith(url, browserType);
      } else {
        window.electronAPI.openBrowser(url);
      }
    } else {
      // For web version, always use default browser
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const generateVariations = () => {
    if (!values.fullName) return [];
    
    const name = values.fullName;
    const variations = [];
    
    // Basic variations
    variations.push(`"${name}"`);
    
    if (name.includes(' ')) {
      const parts = name.split(' ');
      variations.push(`"${parts[0]} ${parts[parts.length - 1]}"`); // First + Last
      variations.push(`"${parts[0][0]}. ${parts[parts.length - 1]}"`); // Initial + Last
      variations.push(`"${parts[0]} ${parts[parts.length - 1][0]}."`); // First + Initial
    }
    
    return variations.slice(0, 4); // Limit to 4 variations
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
      const investigationData = {
        name: investigationName,
        targetName: values.fullName,
        searchParameters: values,
        query: query,
        preset: preset,
        engine: engine,
        useAND: useAND,
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
    });
    setPreset(null);
    setInvestigationName("");
  };

  const quickFillExample = () => {
    setValues({
      ...values,
      fullName: "John Smith",
      location: "San Francisco",
      company: "Microsoft",
      sites: "linkedin.com, github.com, twitter.com",
      include: "software engineer, developer"
    });
  };

  const chips = [
    values.fullName && `Name: ${values.fullName}`,
    values.username && `User: ${values.username}`,
    values.email && `Email: ${values.email}`,
    values.phone && `Phone: ${values.phone}`,
    values.location && `Loc: ${values.location}`,
    values.company && `Org: ${values.company}`,
    values.school && `School: ${values.school}`,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Advanced OSINT Dorking Engine
              </h1>
              <p className="text-gray-600 mt-1">
                Build precise search queries with advanced Google dorking techniques
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={quickFillExample}
                className="btn-secondary text-sm"
              >
                <Zap className="w-4 h-4 mr-1" />
                Quick Fill
              </button>
            </div>
          </div>

          {/* Search Engine & Logic Selection */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Search Engine:</span>
              {[
                ["google", "Google"],
                ["duck", "DuckDuckGo"], 
                ["bing", "Bing"],
                ["brave", "Brave"],
                ["yandex", "Yandex"],
                ["baidu", "Baidu"]
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={`chip text-xs ${engine === key ? "chip-primary" : "chip-secondary"}`}
                  onClick={() => setEngine(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Logic:</span>
              <button
                className={`chip text-xs ${!useAND ? "chip-primary" : "chip-secondary"}`}
                onClick={() => setUseAND(false)}
              >
                OR (Default)
              </button>
              <button
                className={`chip text-xs ${useAND ? "chip-primary" : "chip-secondary"}`}
                onClick={() => setUseAND(true)}
              >
                AND (Strict)
              </button>
            </div>
          </div>

          {/* Dorking Templates */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Templates:</h3>
            <div className="flex flex-wrap gap-2">
              {dorkingTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.id}
                    className={`chip text-xs flex items-center gap-1 ${
                      preset === template.id ? "chip-primary" : "chip-secondary"
                    }`}
                    onClick={() => setPreset(preset === template.id ? null : template.id)}
                    title={template.description}
                  >
                    <Icon className="w-3 h-3" />
                    {template.name}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Identity & Context - Left Column */}
          <section className="xl:col-span-4">
            <div className="card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Identity Information
                </h2>
                <div className="space-y-4">
                  <Field labelText="Full Name (exact)">
                    <input
                      className="input-field"
                      placeholder='e.g., "John Smith"'
                      value={values.fullName}
                      onChange={(e) => update("fullName", e.target.value)}
                    />
                  </Field>
                  <Field labelText="Username / Handle">
                    <input
                      className="input-field"
                      placeholder="e.g., johnsmith123"
                      value={values.username}
                      onChange={(e) => update("username", e.target.value)}
                    />
                  </Field>
                  <Field labelText="Email Address">
                    <input
                      className="input-field"
                      placeholder="e.g., john@example.com"
                      value={values.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
                  </Field>
                  <Field labelText="Phone Number">
                    <input
                      className="input-field"
                      placeholder="e.g., +1 555-123-4567"
                      value={values.phone}
                      onChange={(e) => update("phone", e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Context Information</h2>
                <div className="space-y-4">
                  <Field labelText="Location">
                    <input
                      className="input-field"
                      placeholder="city, state, country"
                      value={values.location}
                      onChange={(e) => update("location", e.target.value)}
                    />
                  </Field>
                  <Field labelText="Company / Organization">
                    <input
                      className="input-field"
                      placeholder="workplace, employer"
                      value={values.company}
                      onChange={(e) => update("company", e.target.value)}
                    />
                  </Field>
                  <Field labelText="School / University">
                    <input
                      className="input-field"
                      placeholder="educational institution"
                      value={values.school}
                      onChange={(e) => update("school", e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              <TagList
                title="Identity Anchors"
                items={chips}
                onRemove={(t) => {
                  const keyMap = {
                    Name: "fullName",
                    User: "username", 
                    Email: "email",
                    Phone: "phone",
                    Loc: "location",
                    Org: "company",
                    School: "school",
                  };
                  const key = Object.entries(keyMap).find(([k]) => t.startsWith(k+": "))?.[1];
                  if (key) update(key, "");
                }}
              />
            </div>
          </section>

          {/* Operators & Keywords - Middle Column */}
          <section className="xl:col-span-4">
            <div className="card p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Operators
                </h2>
                <div className="space-y-4">
                  <Field labelText="Target Sites" hint="e.g., linkedin.com, github.com, facebook.com">
                    <textarea
                      className="input-field min-h-[72px] resize-none"
                      placeholder="linkedin.com, github.com, instagram.com"
                      value={values.sites}
                      onChange={(e) => update("sites", e.target.value)}
                    />
                  </Field>
                  <Field labelText="File Types" hint="pdf, doc, docx, xlsx, pptx">
                    <input
                      className="input-field"
                      placeholder="pdf, docx, txt"
                      value={values.filetypes}
                      onChange={(e) => update("filetypes", e.target.value)}
                    />
                  </Field>
                  <Field labelText="URL Contains (inurl:)" hint="profile, resume, contact, about">
                    <input
                      className="input-field"
                      placeholder="profile, resume, contact"
                      value={values.inurl}
                      onChange={(e) => update("inurl", e.target.value)}
                    />
                  </Field>
                  <Field labelText="Title Contains (intitle:)" hint="resume, cv, about, contact">
                    <input
                      className="input-field"
                      placeholder="resume, cv, portfolio"
                      value={values.intitle}
                      onChange={(e) => update("intitle", e.target.value)}
                    />
                  </Field>
                  <Field labelText="Text Contains (intext:)" hint="phone, email, address, contact">
                    <input
                      className="input-field"
                      placeholder="phone, email, address"
                      value={values.intext}
                      onChange={(e) => update("intext", e.target.value)}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field labelText="After Date">
                      <input
                        type="date"
                        className="input-field"
                        value={values.after}
                        onChange={(e) => update("after", e.target.value)}
                      />
                    </Field>
                    <Field labelText="Before Date">
                      <input
                        type="date"
                        className="input-field"
                        value={values.before}
                        onChange={(e) => update("before", e.target.value)}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Keywords</h2>
                <div className="space-y-4">
                  <Field labelText="Include Keywords" hint="Separate by comma or newline">
                    <textarea
                      className="input-field min-h-[72px] resize-none"
                      placeholder="portfolio, developer, engineer"
                      value={values.include}
                      onChange={(e) => update("include", e.target.value)}
                    />
                  </Field>
                  <Field labelText="Exclude Keywords" hint="Will be prefixed with - (minus)">
                    <textarea
                      className="input-field min-h-[72px] resize-none"
                      placeholder="footballer, actor, musician"
                      value={values.exclude}
                      onChange={(e) => update("exclude", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            </div>
          </section>

          {/* Query Builder & Actions - Right Column */}
          <section className="xl:col-span-4">
            <div className="space-y-6">
              {/* Presets */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Quick Presets
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    [null, "General", Globe],
                    ["linkedin", "LinkedIn", Users],
                    ["github", "GitHub", FileText],
                    ["resume", "Resume", FileText],
                    ["email", "Contact", Globe],
                    ["leaks", "Data Leaks", Shield],
                  ].map(([key, label, Icon]) => (
                    <button
                      key={label}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 ${
                        preset === key
                          ? "bg-black text-white border-black"
                          : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                      onClick={() => setPreset(key)}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated Query */}
              <div className="card p-6">
                <Field labelText="Generated Query">
                  <textarea
                    className="input-field font-mono text-xs min-h-[120px] resize-none"
                    value={query}
                    readOnly
                    placeholder="Your search query will appear here..."
                  />
                </Field>

                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    className="btn-primary flex items-center gap-2"
                    onClick={() => openEngine(engine, query)}
                    disabled={!query.trim()}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Search in {engine === "duck" ? "DuckDuckGo" : engine.charAt(0).toUpperCase()+engine.slice(1)}
                  </button>
                  
                  <button
                    className="btn-secondary flex items-center gap-2"
                    onClick={copyQuery}
                    disabled={!query.trim()}
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  
                  <button
                    className="btn-secondary flex items-center gap-2"
                    onClick={resetForm}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                </div>

                {/* Browser Selection */}
                {query.trim() && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-3">Choose Browser:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {browserOptions.map((browser) => {
                        const Icon = browser.icon;
                        return (
                          <button
                            key={browser.id}
                            className="flex items-center gap-2 p-2 text-left text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            onClick={() => openEngine(engine, query, browser.id)}
                            title={browser.description}
                          >
                            <Icon className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-700">{browser.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Alternative Search Engines */}
                {query.trim() && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Try in other search engines:</p>
                    <div className="flex flex-wrap gap-1">
                      {["google","duck","bing","brave","yandex","baidu"].filter(e=>e!==engine).map((e)=> (
                        <button 
                          key={e} 
                          className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 transition-colors" 
                          onClick={() => openEngine(e, query)}
                        >
                          {e === "duck" ? "DuckDuckGo" : e.charAt(0).toUpperCase()+e.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Name Variations */}
              {values.fullName && generateVariations().length > 0 && (
                <div className="card p-6 bg-blue-50 border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Name Variations to Try
                  </h3>
                  <div className="space-y-2">
                    {generateVariations().map((variation, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-blue-200">
                        <code className="text-xs text-blue-800">{variation}</code>
                        <button
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          onClick={() => {
                            const variationQuery = buildQuery({...values, fullName: variation.replace(/"/g, '')}, preset, useAND);
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

              {/* Save Investigation */}
              <div className="card p-6">
                <h3 className="font-semibold mb-3">Save Investigation</h3>
                <Field labelText="Investigation Name">
                  <input
                    className="input-field"
                    placeholder="e.g., John Smith LinkedIn Search"
                    value={investigationName}
                    onChange={(e) => setInvestigationName(e.target.value)}
                  />
                </Field>
                <button
                  className="btn-primary w-full mt-3 flex items-center justify-center gap-2"
                  onClick={saveInvestigation}
                  disabled={saving || !investigationName.trim()}
                >
                  {saving ? <LoadingSpinner size="small" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Investigation'}
                </button>
              </div>

              {/* Tips */}
              <div className="card p-6 bg-amber-50 border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-3">⚠️ Ethics & Safety</h3>
                <p className="text-sm text-amber-700">
                  Use responsibly. Only investigate people with legitimate purpose and follow local laws/platform TOS. 
                  Avoid stalking, harassment, or doxxing.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Investigation;
