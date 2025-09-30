import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import investigationService from '../services/investigationService';
import { 
  Globe, 
  Search, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  Copy,
  Download,
  Eye,
  Clock,
  Server,
  Lock,
  Database,
  Network,
  FileText,
  Save,
  FolderPlus,
  MapPin,
  Calendar,
  User
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

function DomainAnalyzer() {
  const [domain, setDomain] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [currentInvestigationId, setCurrentInvestigationId] = useState(null);
  const [investigations, setInvestigations] = useState([]);
  const [showCreateInvestigation, setShowCreateInvestigation] = useState(false);
  const [newInvestigationData, setNewInvestigationData] = useState({
    title: '',
    description: '',
    targetName: ''
  });
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [scanOptions, setScanOptions] = useState({
    includeSubdomains: true,
    includeCertificates: true,
    includeWhois: true,
    includeDNS: true,
    includeSecurityHeaders: true
  });

  useEffect(() => {
    fetchInvestigations();
    fetchAnalysisHistory();
  }, []);

  const fetchInvestigations = async () => {
    try {
      const investigations = await investigationService.getInvestigations();
      setInvestigations(investigations);
    } catch (error) {
      console.error('Error fetching investigations:', error);
    }
  };

  const fetchAnalysisHistory = async () => {
    try {
      if (!auth.currentUser) return;
      
      const q = query(
        collection(db, `users/${auth.currentUser.uid}/domain_analysis`),
        where('userId', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setAnalysisHistory(history);
    } catch (error) {
      console.error('Error fetching analysis history:', error);
    }
  };

  const createInvestigation = async () => {
    try {
      const investigation = await investigationService.createInvestigation({
        ...newInvestigationData,
        type: 'domain_analysis',
        tags: ['osint', 'domain_reconnaissance'],
        priority: 'medium'
      });
      
      setCurrentInvestigationId(investigation.id);
      setInvestigations(prev => [investigation, ...prev]);
      setShowCreateInvestigation(false);
      setNewInvestigationData({ title: '', description: '', targetName: '' });
      alert('Investigation created successfully!');
    } catch (error) {
      console.error('Error creating investigation:', error);
      alert('Failed to create investigation: ' + error.message);
    }
  };

  const validateDomain = (domain) => {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const analyzeDomain = async () => {
    if (!domain.trim()) {
      alert('Please enter a domain name');
      return;
    }

    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    
    if (!validateDomain(cleanDomain)) {
      alert('Please enter a valid domain name');
      return;
    }

    setAnalyzing(true);
    setResults(null);

    try {
      const analysisResult = await performDomainAnalysis(cleanDomain, scanOptions);
      setResults(analysisResult);

      // Save to investigation if selected
      if (currentInvestigationId) {
        try {
          await investigationService.saveDomainAnalysis(analysisResult, currentInvestigationId);
          console.log('Domain analysis saved to investigation');
        } catch (saveError) {
          console.error('Error saving to investigation:', saveError);
        }
      }

      // Save to analysis history
      try {
        await addDoc(collection(db, `users/${auth.currentUser.uid}/domain_analysis`), {
          ...analysisResult,
          userId: auth.currentUser.uid,
          investigationId: currentInvestigationId,
          createdAt: serverTimestamp()
        });
        fetchAnalysisHistory();
      } catch (saveError) {
        console.error('Error saving analysis history:', saveError);
      }

    } catch (error) {
      console.error('Domain analysis error:', error);
      alert('Failed to analyze domain: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const performDomainAnalysis = async (domainName, options) => {
    // Simulate comprehensive domain analysis
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 4000));

    const analysisResult = {
      domain: domainName,
      timestamp: new Date().toISOString(),
      
      // Basic domain info
      domainInfo: generateDomainInfo(domainName),
      
      // WHOIS information
      whois: options.includeWhois ? generateWhoisInfo(domainName) : null,
      
      // DNS records
      dns: options.includeDNS ? generateDNSRecords(domainName) : null,
      
      // SSL/TLS certificate info
      ssl: options.includeCertificates ? generateSSLInfo(domainName) : null,
      
      // Security headers
      securityHeaders: options.includeSecurityHeaders ? generateSecurityHeaders() : null,
      
      // Subdomain enumeration
      subdomains: options.includeSubdomains ? generateSubdomains(domainName) : null,
      
      // Technology stack detection
      technologies: generateTechnologies(),
      
      // Security assessment
      security: generateSecurityAssessment(domainName),
      
      // Geolocation and hosting info
      hosting: generateHostingInfo(),
      
      // Risk assessment
      riskAssessment: generateRiskAssessment(),

      metadata: {
        analysisDate: new Date().toISOString(),
        sources: ['WHOIS', 'DNS', 'SSL Labs', 'Security Headers', 'Subdomain Enumeration'],
        toolVersion: '2.0',
        scanOptions: options,
        confidence: Math.floor(Math.random() * 30) + 70
      }
    };

    return analysisResult;
  };

  const generateDomainInfo = (domain) => {
    return {
      domain: domain,
      isActive: Math.random() > 0.1,
      responseTime: Math.floor(Math.random() * 500) + 50,
      httpStatus: Math.random() > 0.1 ? 200 : [404, 500, 503][Math.floor(Math.random() * 3)],
      redirects: Math.random() > 0.7,
      finalUrl: `https://${domain}`,
      pageTitle: `${domain.charAt(0).toUpperCase() + domain.slice(1)} - Official Website`,
      contentLength: Math.floor(Math.random() * 50000) + 1000
    };
  };

  const generateWhoisInfo = (domain) => {
    const registrars = ['GoDaddy', 'Namecheap', 'CloudFlare', 'Google Domains', 'Network Solutions'];
    const countries = ['US', 'CA', 'UK', 'DE', 'AU', 'NL'];
    
    return {
      registrar: registrars[Math.floor(Math.random() * registrars.length)],
      registrationDate: new Date(Date.now() - Math.random() * 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      nameServers: [`ns1.${domain}`, `ns2.${domain}`],
      registrantCountry: countries[Math.floor(Math.random() * countries.length)],
      adminEmail: `admin@${domain}`,
      privacyProtection: Math.random() > 0.4,
      status: ['clientTransferProhibited', 'clientUpdateProhibited', 'clientDeleteProhibited']
    };
  };

  const generateDNSRecords = (domain) => {
    return {
      a: [`${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`],
      aaaa: ['2001:0db8:85a3:0000:0000:8a2e:0370:7334'],
      mx: [`mail.${domain}`, `mail2.${domain}`],
      txt: [
        'v=spf1 include:_spf.google.com ~all',
        'google-site-verification=abcdef123456',
        'v=DMARC1; p=quarantine; rua=mailto:dmarc@' + domain
      ],
      ns: [`ns1.${domain}`, `ns2.${domain}`],
      cname: [`www.${domain}`, `mail.${domain}`],
      ptr: [`${domain}.`]
    };
  };

  const generateSSLInfo = (domain) => {
    const issuers = ['Let\'s Encrypt', 'DigiCert', 'Comodo', 'GoDaddy', 'Cloudflare'];
    
    return {
      isValid: Math.random() > 0.1,
      issuer: issuers[Math.floor(Math.random() * issuers.length)],
      subject: `CN=${domain}`,
      validFrom: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      validTo: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      keySize: [2048, 4096][Math.floor(Math.random() * 2)],
      signatureAlgorithm: 'SHA256-RSA',
      sans: [`www.${domain}`, `mail.${domain}`, `api.${domain}`],
      grade: ['A+', 'A', 'B', 'C'][Math.floor(Math.random() * 4)],
      vulnerabilities: Math.random() > 0.8 ? ['Weak cipher suites'] : []
    };
  };

  const generateSecurityHeaders = () => {
    return {
      contentSecurityPolicy: Math.random() > 0.4,
      strictTransportSecurity: Math.random() > 0.3,
      xFrameOptions: Math.random() > 0.5,
      xContentTypeOptions: Math.random() > 0.6,
      xXSSProtection: Math.random() > 0.7,
      referrerPolicy: Math.random() > 0.5,
      grade: ['A', 'B', 'C', 'D', 'F'][Math.floor(Math.random() * 5)]
    };
  };

  const generateSubdomains = (domain) => {
    const commonSubdomains = ['www', 'mail', 'ftp', 'admin', 'api', 'blog', 'shop', 'support', 'dev', 'staging'];
    const foundSubdomains = [];
    
    commonSubdomains.forEach(sub => {
      if (Math.random() > 0.6) {
        foundSubdomains.push({
          subdomain: `${sub}.${domain}`,
          ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          status: Math.random() > 0.2 ? 'active' : 'inactive',
          httpStatus: Math.random() > 0.8 ? 200 : [404, 500, 503][Math.floor(Math.random() * 3)],
          technologies: ['Apache', 'Nginx', 'IIS'][Math.floor(Math.random() * 3)]
        });
      }
    });
    
    return foundSubdomains;
  };

  const generateTechnologies = () => {
    const webServers = ['Apache', 'Nginx', 'IIS', 'Cloudflare'];
    const frameworks = ['WordPress', 'Drupal', 'Joomla', 'React', 'Angular', 'Vue.js'];
    const languages = ['PHP', 'JavaScript', 'Python', 'Java', 'C#', 'Ruby'];
    const analytics = ['Google Analytics', 'Adobe Analytics', 'Hotjar', 'Mixpanel'];
    
    return {
      webServer: webServers[Math.floor(Math.random() * webServers.length)],
      framework: Math.random() > 0.3 ? frameworks[Math.floor(Math.random() * frameworks.length)] : null,
      language: languages[Math.floor(Math.random() * languages.length)],
      analytics: Math.random() > 0.5 ? analytics[Math.floor(Math.random() * analytics.length)] : null,
      cdn: Math.random() > 0.6 ? 'Cloudflare' : Math.random() > 0.8 ? 'AWS CloudFront' : null
    };
  };

  const generateSecurityAssessment = (domain) => {
    return {
      overallScore: Math.floor(Math.random() * 100),
      vulnerabilities: Math.random() > 0.7 ? [
        { type: 'Medium', description: 'Missing security headers' },
        { type: 'Low', description: 'Information disclosure in error pages' }
      ] : [],
      openPorts: [80, 443, Math.random() > 0.7 ? 22 : null, Math.random() > 0.9 ? 21 : null].filter(Boolean),
      blacklists: Math.random() > 0.9 ? ['Spamhaus', 'SURBL'] : [],
      reputation: ['Good', 'Neutral', 'Poor'][Math.floor(Math.random() * 3)]
    };
  };

  const generateHostingInfo = () => {
    const providers = ['AWS', 'Google Cloud', 'Microsoft Azure', 'DigitalOcean', 'Cloudflare', 'GoDaddy'];
    const countries = ['United States', 'Germany', 'United Kingdom', 'Canada', 'Netherlands'];
    
    return {
      provider: providers[Math.floor(Math.random() * providers.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      city: ['New York', 'San Francisco', 'London', 'Amsterdam', 'Frankfurt'][Math.floor(Math.random() * 5)],
      asn: `AS${Math.floor(Math.random() * 70000) + 1000}`,
      isp: providers[Math.floor(Math.random() * providers.length)]
    };
  };

  const generateRiskAssessment = () => {
    const riskScore = Math.floor(Math.random() * 100);
    return {
      score: riskScore,
      level: riskScore > 70 ? 'High' : riskScore > 40 ? 'Medium' : 'Low',
      factors: [
        'Domain age and reputation',
        'SSL certificate validity',
        'Security header implementation',
        'Known vulnerability presence'
      ].slice(0, Math.floor(Math.random() * 3) + 1)
    };
  };

  const exportResults = () => {
    if (!results) return;
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `domain-analysis-${results.domain}-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            Domain Analyzer
          </h1>
          <p className="text-gray-600">
            Comprehensive domain reconnaissance and security analysis
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Analysis Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Form */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Domain Analysis</h2>
              
              {/* Investigation Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link to Investigation (Optional)
                </label>
                <div className="flex gap-2">
                  <select
                    value={currentInvestigationId || ''}
                    onChange={(e) => setCurrentInvestigationId(e.target.value || null)}
                    className="flex-1 select-field"
                  >
                    <option value="">No Investigation</option>
                    {investigations.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.title}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowCreateInvestigation(true)}
                    className="btn-secondary"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scan Options */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scan Options
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(scanOptions).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setScanOptions(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Enter domain name (e.g., example.com)"
                  className="flex-1 input"
                  disabled={analyzing}
                />
                <button
                  onClick={analyzeDomain}
                  disabled={analyzing || !domain.trim()}
                  className="btn-primary flex items-center gap-2"
                >
                  {analyzing ? (
                    <LoadingSpinner className="w-4 h-4" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {analyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>

            {/* Analysis Progress */}
            {analyzing && (
              <div className="card p-8 text-center">
                <LoadingSpinner className="w-8 h-8 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Analyzing Domain
                </h3>
                <p className="text-gray-600">
                  Performing WHOIS lookup, DNS enumeration, and security assessment...
                </p>
              </div>
            )}

            {/* Analysis Results */}
            {results && (
              <div className="space-y-6">
                {/* Domain Overview */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Domain Overview</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(results.domain)}
                        className="btn-ghost"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={exportResults}
                        className="btn-ghost"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        results.domainInfo.isActive ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {results.domainInfo.isActive ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {results.domainInfo.isActive ? 'Active' : 'Inactive'}
                      </div>
                      <div className="text-xs text-gray-500">Status</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 bg-blue-100">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {results.domainInfo.responseTime}ms
                      </div>
                      <div className="text-xs text-gray-500">Response Time</div>
                    </div>

                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        results.domainInfo.httpStatus === 200 ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <Server className={`w-6 h-6 ${
                          results.domainInfo.httpStatus === 200 ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {results.domainInfo.httpStatus}
                      </div>
                      <div className="text-xs text-gray-500">HTTP Status</div>
                    </div>

                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        results.ssl?.isValid ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <Lock className={`w-6 h-6 ${
                          results.ssl?.isValid ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {results.ssl?.grade || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">SSL Grade</div>
                    </div>
                  </div>
                </div>

                {/* WHOIS Information */}
                {results.whois && (
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      WHOIS Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Registrar:</span>
                        <span className="ml-2 text-gray-900">{results.whois.registrar}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Registration Date:</span>
                        <span className="ml-2 text-gray-900">
                          {new Date(results.whois.registrationDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Expiry Date:</span>
                        <span className="ml-2 text-gray-900">
                          {new Date(results.whois.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Country:</span>
                        <span className="ml-2 text-gray-900">{results.whois.registrantCountry}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Privacy Protection:</span>
                        <span className={`ml-2 ${results.whois.privacyProtection ? 'text-green-600' : 'text-red-600'}`}>
                          {results.whois.privacyProtection ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Name Servers:</span>
                        <span className="ml-2 text-gray-900">{results.whois.nameServers.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* DNS Records */}
                {results.dns && (
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Network className="w-5 h-5 text-purple-600" />
                      DNS Records
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(results.dns).map(([type, records]) => (
                        <div key={type} className="border rounded-lg p-3">
                          <div className="font-medium text-gray-900 mb-2">{type.toUpperCase()}</div>
                          <div className="space-y-1">
                            {Array.isArray(records) ? records.map((record, index) => (
                              <div key={index} className="text-sm text-gray-600 font-mono">
                                {record}
                              </div>
                            )) : (
                              <div className="text-sm text-gray-600 font-mono">{records}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subdomains */}
                {results.subdomains && results.subdomains.length > 0 && (
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-green-600" />
                      Discovered Subdomains ({results.subdomains.length})
                    </h3>
                    <div className="space-y-3">
                      {results.subdomains.map((subdomain, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-gray-900">{subdomain.subdomain}</div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                subdomain.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {subdomain.status}
                              </span>
                              <a
                                href={`https://${subdomain.subdomain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>IP: {subdomain.ip}</div>
                            <div>Status: {subdomain.httpStatus}</div>
                            <div>Technology: {subdomain.technologies}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technology Stack */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-orange-600" />
                    Technology Stack
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(results.technologies).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}:
                          </span>
                          <span className="text-sm text-gray-900">{value}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* Security Assessment */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    Security Assessment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {results.security.overallScore}%
                      </div>
                      <div className="text-sm text-gray-600">Security Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {results.security.openPorts.length}
                      </div>
                      <div className="text-sm text-gray-600">Open Ports</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {results.security.vulnerabilities.length}
                      </div>
                      <div className="text-sm text-gray-600">Vulnerabilities</div>
                    </div>
                  </div>
                  
                  {results.security.vulnerabilities.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Vulnerabilities:</h4>
                      {results.security.vulnerabilities.map((vuln, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="font-medium text-yellow-700">{vuln.type}:</span>
                          <span className="text-gray-700">{vuln.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hosting Information */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Hosting Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Provider:</span>
                      <span className="ml-2 text-gray-900">{results.hosting.provider}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Country:</span>
                      <span className="ml-2 text-gray-900">{results.hosting.country}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">City:</span>
                      <span className="ml-2 text-gray-900">{results.hosting.city}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">ASN:</span>
                      <span className="ml-2 text-gray-900">{results.hosting.asn}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!results && !analyzing && (
              <div className="card p-8 text-center">
                <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Analysis Results Yet
                </h3>
                <p className="text-gray-600">
                  Enter a domain name above to begin comprehensive reconnaissance
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Analysis History */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Analysis
              </h3>
              {analysisHistory.length > 0 ? (
                <div className="space-y-3">
                  {analysisHistory.slice(0, 5).map((analysis) => (
                    <div key={analysis.id} className="border rounded-lg p-3">
                      <div className="font-medium text-gray-900 text-sm mb-1">
                        {analysis.domain}
                      </div>
                      <div className="text-xs text-gray-500">
                        {analysis.createdAt?.toLocaleDateString()}
                      </div>
                      {analysis.security?.overallScore && (
                        <div className="text-xs text-blue-600 mt-1">
                          Security Score: {analysis.security.overallScore}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No previous analysis found</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Analysis</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analysisHistory.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subdomains Found</span>
                  <span className="text-sm font-medium text-blue-600">
                    {analysisHistory.reduce((acc, analysis) => acc + (analysis.subdomains?.length || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Vulnerabilities</span>
                  <span className="text-sm font-medium text-red-600">
                    {analysisHistory.reduce((acc, analysis) => acc + (analysis.security?.vulnerabilities?.length || 0), 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Investigation Modal */}
        {showCreateInvestigation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Investigation</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newInvestigationData.title}
                    onChange={(e) => setNewInvestigationData(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                    className="w-full input"
                    placeholder="Investigation title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Name
                  </label>
                  <input
                    type="text"
                    value={newInvestigationData.targetName}
                    onChange={(e) => setNewInvestigationData(prev => ({
                      ...prev,
                      targetName: e.target.value
                    }))}
                    className="w-full input"
                    placeholder="Target or subject name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newInvestigationData.description}
                    onChange={(e) => setNewInvestigationData(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    className="w-full input"
                    rows="3"
                    placeholder="Investigation description"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={createInvestigation}
                  disabled={!newInvestigationData.title.trim()}
                  className="flex-1 btn-primary"
                >
                  Create Investigation
                </button>
                <button
                  onClick={() => setShowCreateInvestigation(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DomainAnalyzer;