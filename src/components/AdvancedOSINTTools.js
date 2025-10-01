import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Database, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  Shield, 
  Eye, 
  Zap, 
  FileText, 
  BarChart3,
  Settings,
  RefreshCw,
  Copy,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Layers,
  Key,
  Lock,
  Unlock,
  Activity,
  TrendingUp,
  Calendar,
  Star,
  Info,
  Crown,
  FileDown,
  Package
} from 'lucide-react';
import investigationAPI from '../services/investigationAPI';
import { API_ENDPOINTS, hasApiKey, saveApiKey, getApiKey } from '../services/apiConfig';
import subscriptionService from '../services/subscriptionService';

const AdvancedOSINTTools = () => {
  const [activeTab, setActiveTab] = useState('ip');
  const [results, setResults] = useState([]);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [exportFormat, setExportFormat] = useState('json');
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [apiKeys, setApiKeys] = useState({});
  const [currentResult, setCurrentResult] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);

  // Form states for different investigation types
  const [ipInput, setIpInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [domainInput, setDomainInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [locationInput, setLocationInput] = useState('');

  useEffect(() => {
    loadResults();
    updateStatistics();
    loadApiKeys();
    loadUserSubscription();
  }, []);

  const loadUserSubscription = async () => {
    try {
      const subscription = await subscriptionService.getCurrentSubscription();
      setUserSubscription(subscription);
    } catch (error) {
      console.error('Failed to load subscription:', error);
      setUserSubscription({ plan: 'free' });
    }
  };

  const loadResults = () => {
    const savedResults = localStorage.getItem('infoscope_investigation_results');
    if (savedResults) {
      setResults(JSON.parse(savedResults).reverse());
    }
  };

  const saveResults = (newResults) => {
    localStorage.setItem('infoscope_investigation_results', JSON.stringify(newResults));
    setResults(newResults.reverse());
    updateStatistics();
  };

  const loadApiKeys = () => {
    const keys = {};
    Object.keys(API_ENDPOINTS).forEach(category => {
      Object.keys(API_ENDPOINTS[category]).forEach(service => {
        keys[service.toLowerCase()] = getApiKey(service.toLowerCase());
      });
    });
    setApiKeys(keys);
  };

  const handleApiKeyChange = (service, key) => {
    saveApiKey(service, key);
    setApiKeys(prev => ({ ...prev, [service]: key }));
  };

  const updateStatistics = () => {
    const allResults = JSON.parse(localStorage.getItem('infoscope_investigation_results') || '[]');
    const today = new Date().toDateString();
    const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const stats = {
      total: allResults.length,
      today: allResults.filter(r => new Date(r.timestamp).toDateString() === today).length,
      thisWeek: allResults.filter(r => new Date(r.timestamp) >= thisWeek).length,
      byType: {},
      successRate: 0
    };

    // Count by investigation type
    allResults.forEach(result => {
      const type = result.ip ? 'IP' : result.email ? 'Email' : 
                   result.domain ? 'Domain' : result.phone ? 'Phone' : 
                   result.query ? 'Location' : result.username ? 'Social' : 'Other';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    // Calculate success rate
    const totalSources = allResults.reduce((sum, result) => 
      sum + (result.sources?.length || result.platforms?.length || 0), 0);
    const successfulSources = allResults.reduce((sum, result) => 
      sum + (result.sources?.filter(s => s.success).length || 
             result.platforms?.filter(p => p.status !== 'Error').length || 0), 0);
    
    stats.successRate = totalSources > 0 ? Math.round((successfulSources / totalSources) * 100) : 0;
    
    setStatistics(stats);
  };

  // Check if user has premium access
  const checkPremiumAccess = () => {
    return userSubscription && userSubscription.plan && userSubscription.plan !== 'free';
  };

  const showPremiumDialog = () => {
    alert('🚀 Premium Feature\n\nAdvanced OSINT tools require a Premium subscription.\n\nUpgrade to Premium for ₹49/month to access:\n• Advanced IP Intelligence\n• Email Investigation\n• Domain Research\n• Export Features\n• Extra Storage\n\nGo to Profile → Subscription to upgrade!');
  };

  // Real API Investigation Handlers
  const handleIPInvestigation = async () => {
    if (!ipInput.trim()) return;
    
    if (!checkPremiumAccess()) {
      showPremiumDialog();
      return;
    }
    
    setIsInvestigating(true);
    setCurrentResult(null);
    
    try {
      const result = await investigationAPI.investigateIP(ipInput.trim());
      setCurrentResult(result);
      
      // Save to results
      const allResults = JSON.parse(localStorage.getItem('infoscope_investigation_results') || '[]');
      allResults.push(result);
      saveResults(allResults);
      
      setIpInput('');
    } catch (error) {
      console.error('IP investigation failed:', error);
      setCurrentResult({
        error: error.message,
        timestamp: new Date().toISOString(),
        ip: ipInput.trim()
      });
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleEmailInvestigation = async () => {
    if (!emailInput.trim()) return;
    
    if (!checkPremiumAccess()) {
      showPremiumDialog();
      return;
    }
    
    setIsInvestigating(true);
    setCurrentResult(null);
    
    try {
      const result = await investigationAPI.investigateEmail(emailInput.trim());
      setCurrentResult(result);
      
      // Save to results
      const allResults = JSON.parse(localStorage.getItem('infoscope_investigation_results') || '[]');
      allResults.push(result);
      saveResults(allResults);
      
      setEmailInput('');
    } catch (error) {
      console.error('Email investigation failed:', error);
      setCurrentResult({
        error: error.message,
        timestamp: new Date().toISOString(),
        email: emailInput.trim()
      });
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleDomainInvestigation = async () => {
    if (!domainInput.trim()) return;
    
    if (!checkPremiumAccess()) {
      showPremiumDialog();
      return;
    }
    
    setIsInvestigating(true);
    setCurrentResult(null);
    
    try {
      const result = await investigationAPI.investigateDomain(domainInput.trim());
      setCurrentResult(result);
      
      // Save to results
      const allResults = JSON.parse(localStorage.getItem('infoscope_investigation_results') || '[]');
      allResults.push(result);
      saveResults(allResults);
      
      setDomainInput('');
    } catch (error) {
      console.error('Domain investigation failed:', error);
      setCurrentResult({
        error: error.message,
        timestamp: new Date().toISOString(),
        domain: domainInput.trim()
      });
    } finally {
      setIsInvestigating(false);
    }
  };

  const handlePhoneInvestigation = async () => {
    if (!phoneInput.trim()) return;
    
    if (!checkPremiumAccess()) {
      showPremiumDialog();
      return;
    }
    
    setIsInvestigating(true);
    setCurrentResult(null);
    
    try {
      const result = await investigationAPI.investigatePhone(phoneInput.trim());
      setCurrentResult(result);
      
      // Save to results
      const allResults = JSON.parse(localStorage.getItem('infoscope_investigation_results') || '[]');
      allResults.push(result);
      saveResults(allResults);
      
      setPhoneInput('');
    } catch (error) {
      console.error('Phone investigation failed:', error);
      setCurrentResult({
        error: error.message,
        timestamp: new Date().toISOString(),
        phone: phoneInput.trim()
      });
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleSocialInvestigation = async () => {
    if (!usernameInput.trim()) return;
    
    if (!checkPremiumAccess()) {
      showPremiumDialog();
      return;
    }
    
    setIsInvestigating(true);
    setCurrentResult(null);
    
    try {
      const result = await investigationAPI.investigateSocialMedia(usernameInput.trim());
      setCurrentResult(result);
      
      // Save to results
      const allResults = JSON.parse(localStorage.getItem('infoscope_investigation_results') || '[]');
      allResults.push(result);
      saveResults(allResults);
      
      setUsernameInput('');
    } catch (error) {
      console.error('Social investigation failed:', error);
      setCurrentResult({
        error: error.message,
        timestamp: new Date().toISOString(),
        username: usernameInput.trim()
      });
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleLocationInvestigation = async () => {
    if (!locationInput.trim()) return;
    
    if (!checkPremiumAccess()) {
      showPremiumDialog();
      return;
    }
    
    setIsInvestigating(true);
    setCurrentResult(null);
    
    try {
      const result = await investigationAPI.investigateLocation(locationInput.trim());
      setCurrentResult(result);
      
      // Save to results
      const allResults = JSON.parse(localStorage.getItem('infoscope_investigation_results') || '[]');
      allResults.push(result);
      saveResults(allResults);
      
      setLocationInput('');
    } catch (error) {
      console.error('Location investigation failed:', error);
      setCurrentResult({
        error: error.message,
        timestamp: new Date().toISOString(),
        query: locationInput.trim()
      });
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleExport = (result = null) => {
    if (!checkPremiumAccess()) {
      showPremiumDialog();
      return;
    }
    
    try {
      const dataToExport = result || (results.length > 0 ? results : []);
      investigationAPI.exportResults(dataToExport, exportFormat);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const clearResults = () => {
    localStorage.removeItem('infoscope_investigation_results');
    setResults([]);
    setCurrentResult(null);
    updateStatistics();
  };

  const renderInvestigationForm = () => {
    switch (activeTab) {
      case 'ip':
        return (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                placeholder="Enter IP address (e.g., 8.8.8.8)"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isInvestigating}
                onKeyPress={(e) => e.key === 'Enter' && handleIPInvestigation()}
              />
              <button
                onClick={handleIPInvestigation}
                disabled={isInvestigating || !ipInput.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                {isInvestigating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {isInvestigating ? 'Investigating...' : 'Investigate'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">IP Intelligence Sources:</h4>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• IPinfo.io (Location, ISP)</li>
                  <li>• IPapi.co (Threat Detection)</li>
                  <li>• VirusTotal (Reputation) {hasApiKey('virustotal') ? '✓' : '⚠️'}</li>
                  <li>• AbuseIPDB (Abuse Reports) {hasApiKey('abuseipdb') ? '✓' : '⚠️'}</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Information Gathered:</h4>
                <ul className="space-y-1 text-green-700 dark:text-green-300">
                  <li>• Geolocation & ISP</li>
                  <li>• Threat Intelligence</li>
                  <li>• Malware Analysis</li>
                  <li>• Abuse Confidence</li>
                </ul>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Use Cases:</h4>
                <ul className="space-y-1 text-purple-700 dark:text-purple-300">
                  <li>• Network Security</li>
                  <li>• Incident Response</li>
                  <li>• Forensic Analysis</li>
                  <li>• Threat Hunting</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter email address (e.g., test@example.com)"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isInvestigating}
                onKeyPress={(e) => e.key === 'Enter' && handleEmailInvestigation()}
              />
              <button
                onClick={handleEmailInvestigation}
                disabled={isInvestigating || !emailInput.trim()}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                {isInvestigating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {isInvestigating ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Email Analysis Sources:</h4>
                <ul className="space-y-1 text-green-700 dark:text-green-300">
                  <li>• EmailRep.io (Reputation)</li>
                  <li>• Hunter.io (Verification) {hasApiKey('hunter') ? '✓' : '⚠️'}</li>
                  <li>• Have I Been Pwned {hasApiKey('haveibeenpwned') ? '✓' : '⚠️'}</li>
                  <li>• Clearbit (Enrichment) {hasApiKey('clearbit') ? '✓' : '⚠️'}</li>
                </ul>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Information Gathered:</h4>
                <ul className="space-y-1 text-yellow-700 dark:text-yellow-300">
                  <li>• Email Validation</li>
                  <li>• Reputation Scoring</li>
                  <li>• Breach History</li>
                  <li>• Domain Analysis</li>
                </ul>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Security Insights:</h4>
                <ul className="space-y-1 text-red-700 dark:text-red-300">
                  <li>• Spam Detection</li>
                  <li>• Malicious Activity</li>
                  <li>• Data Breaches</li>
                  <li>• Credential Leaks</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'domain':
        return (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="Enter domain (e.g., example.com)"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isInvestigating}
                onKeyPress={(e) => e.key === 'Enter' && handleDomainInvestigation()}
              />
              <button
                onClick={handleDomainInvestigation}
                disabled={isInvestigating || !domainInput.trim()}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                {isInvestigating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                {isInvestigating ? 'Researching...' : 'Research'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Domain Research Sources:</h4>
                <ul className="space-y-1 text-purple-700 dark:text-purple-300">
                  <li>• WHOIS Lookup</li>
                  <li>• Wayback Machine</li>
                  <li>• SecurityTrails {hasApiKey('securitytrails') ? '✓' : '⚠️'}</li>
                  <li>• URLVoid {hasApiKey('urlvoid') ? '✓' : '⚠️'}</li>
                </ul>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">Information Gathered:</h4>
                <ul className="space-y-1 text-indigo-700 dark:text-indigo-300">
                  <li>• Registration Details</li>
                  <li>• Historical Data</li>
                  <li>• DNS Records</li>
                  <li>• Subdomain Discovery</li>
                </ul>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Investigation Types:</h4>
                <ul className="space-y-1 text-orange-700 dark:text-orange-300">
                  <li>• Brand Protection</li>
                  <li>• Phishing Detection</li>
                  <li>• Infrastructure Mapping</li>
                  <li>• Digital Footprinting</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter username (e.g., johndoe)"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isInvestigating}
                onKeyPress={(e) => e.key === 'Enter' && handleSocialInvestigation()}
              />
              <button
                onClick={handleSocialInvestigation}
                disabled={isInvestigating || !usernameInput.trim()}
                className="px-6 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                {isInvestigating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                {isInvestigating ? 'Searching...' : 'Search'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-pink-800 dark:text-pink-200 mb-2">Social Media Platforms:</h4>
                <ul className="space-y-1 text-pink-700 dark:text-pink-300">
                  <li>• Twitter/X 🐦</li>
                  <li>• Instagram 📷</li>
                  <li>• LinkedIn 💼</li>
                  <li>• GitHub 💻</li>
                  <li>• TikTok 🎵</li>
                  <li>• Reddit 🤖</li>
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Search Strategy:</h4>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• Username Enumeration</li>
                  <li>• Cross-Platform Search</li>
                  <li>• Profile Discovery</li>
                  <li>• Account Verification</li>
                </ul>
              </div>
              <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-teal-800 dark:text-teal-200 mb-2">Use Cases:</h4>
                <ul className="space-y-1 text-teal-700 dark:text-teal-300">
                  <li>• Background Checks</li>
                  <li>• Digital Footprinting</li>
                  <li>• Social Engineering</li>
                  <li>• Account Takeover</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'phone':
        return (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Enter phone number (e.g., +1234567890)"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isInvestigating}
                onKeyPress={(e) => e.key === 'Enter' && handlePhoneInvestigation()}
              />
              <button
                onClick={handlePhoneInvestigation}
                disabled={isInvestigating || !phoneInput.trim()}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                {isInvestigating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                {isInvestigating ? 'Looking up...' : 'Lookup'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Phone Lookup Sources:</h4>
                <ul className="space-y-1 text-orange-700 dark:text-orange-300">
                  <li>• NumVerify {hasApiKey('numverify') ? '✓' : '⚠️'}</li>
                  <li>• Twilio Lookup {hasApiKey('twilio') ? '✓' : '⚠️'}</li>
                  <li>• TrueCaller (Limited)</li>
                  <li>• Basic Validation</li>
                </ul>
              </div>
              <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-cyan-800 dark:text-cyan-200 mb-2">Information Gathered:</h4>
                <ul className="space-y-1 text-cyan-700 dark:text-cyan-300">
                  <li>• Number Validation</li>
                  <li>• Carrier Information</li>
                  <li>• Geographic Location</li>
                  <li>• Line Type (Mobile/Fixed)</li>
                </ul>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-emerald-800 dark:text-emerald-200 mb-2">Applications:</h4>
                <ul className="space-y-1 text-emerald-700 dark:text-emerald-300">
                  <li>• Fraud Prevention</li>
                  <li>• Identity Verification</li>
                  <li>• Contact Validation</li>
                  <li>• OSINT Investigation</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Enter address or coordinates (e.g., New York or 40.7128,-74.0060)"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isInvestigating}
                onKeyPress={(e) => e.key === 'Enter' && handleLocationInvestigation()}
              />
              <button
                onClick={handleLocationInvestigation}
                disabled={isInvestigating || !locationInput.trim()}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                {isInvestigating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                {isInvestigating ? 'Locating...' : 'Locate'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-teal-800 dark:text-teal-200 mb-2">Geolocation Sources:</h4>
                <ul className="space-y-1 text-teal-700 dark:text-teal-300">
                  <li>• OpenCage Data {hasApiKey('opencage') ? '✓' : '⚠️'}</li>
                  <li>• GeoJS (IP-based)</li>
                  <li>• Mapbox {hasApiKey('mapbox') ? '✓' : '⚠️'}</li>
                  <li>• Coordinate Systems</li>
                </ul>
              </div>
              <div className="bg-lime-50 dark:bg-lime-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-lime-800 dark:text-lime-200 mb-2">Location Data:</h4>
                <ul className="space-y-1 text-lime-700 dark:text-lime-300">
                  <li>• Precise Coordinates</li>
                  <li>• Address Formatting</li>
                  <li>• Timezone Information</li>
                  <li>• Administrative Regions</li>
                </ul>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Investigation Uses:</h4>
                <ul className="space-y-1 text-amber-700 dark:text-amber-300">
                  <li>• Asset Tracking</li>
                  <li>• Incident Mapping</li>
                  <li>• Geofencing</li>
                  <li>• Location Verification</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderCurrentResult = () => {
    if (!currentResult) return null;

    return (
      <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Investigation Results
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport(currentResult)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setCurrentResult(null)}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        {currentResult.error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Investigation Failed</span>
            </div>
            <p className="text-red-700 dark:text-red-300 mt-2">{currentResult.error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Target: {currentResult.ip || currentResult.email || currentResult.domain || 
                            currentResult.phone || currentResult.query || currentResult.username}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Investigated: {new Date(currentResult.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Sources: {currentResult.sources?.length || currentResult.platforms?.length || 0}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Success: {currentResult.sources?.filter(s => s.success).length || 
                             currentResult.platforms?.filter(p => p.status !== 'Error').length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Display investigation sources */}
            {currentResult.sources && (
              <div className="grid gap-4">
                {currentResult.sources.map((source, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${
                    source.success 
                      ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
                      : 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className={`font-medium flex items-center gap-2 ${
                        source.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                      }`}>
                        {source.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {source.source}
                      </h5>
                      <span className={`text-xs px-2 py-1 rounded ${
                        source.success 
                          ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' 
                          : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                      }`}>
                        {source.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    
                    {source.success ? (
                      <div className="space-y-2">
                        {Object.entries(source).map(([key, value]) => {
                          if (key === 'source' || key === 'success') return null;
                          
                          return (
                            <div key={key} className="text-sm">
                              <span className="font-medium capitalize text-gray-700 dark:text-gray-300">
                                {key.replace(/_/g, ' ')}: 
                              </span>
                              <span className="ml-2 text-gray-600 dark:text-gray-400">
                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-red-700 dark:text-red-300 text-sm">{source.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Display social media platforms */}
            {currentResult.platforms && (
              <div className="grid gap-2">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Social Media Platforms:</h5>
                {currentResult.platforms.map((platform, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{platform.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{platform.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{platform.status}</span>
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderApiConfiguration = () => {
    if (!showApiConfig) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Configuration</h3>
            <button
              onClick={() => setShowApiConfig(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">API Key Management</h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Configure API keys for enhanced investigation capabilities. Free APIs work without keys but have limited features.
              </p>
            </div>

            {Object.entries(API_ENDPOINTS).map(([category, services]) => (
              <div key={category} className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                  {category.replace(/_/g, ' ')}
                </h4>
                <div className="grid gap-4">
                  {Object.entries(services).map(([service, config]) => (
                    <div key={service} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h5 className="font-medium text-gray-900 dark:text-white">{service}</h5>
                          {config.free ? (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded">
                              Free
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200 text-xs rounded">
                              API Key Required
                            </span>
                          )}
                          {hasApiKey(service.toLowerCase()) && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded">
                              Configured
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Features: {config.features.join(', ')}
                        </p>
                        {config.rateLimit && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Rate Limit: {config.rateLimit}
                          </p>
                        )}
                      </div>
                      
                      {config.apiKey && (
                        <div className="ml-4 w-64">
                          <input
                            type="password"
                            placeholder="Enter API key..."
                            value={apiKeys[service.toLowerCase()] || ''}
                            onChange={(e) => handleApiKeyChange(service.toLowerCase(), e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Important Notes</h4>
              <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
                <li>• API keys are stored locally in your browser</li>
                <li>• Never share your API keys with others</li>
                <li>• Some services offer free tiers with limitations</li>
                <li>• Rate limits apply to prevent abuse</li>
                <li>• Always respect API terms of service</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const investigationTabs = [
    { id: 'ip', label: 'IP Intelligence', icon: Shield, color: 'blue' },
    { id: 'email', label: 'Email Analysis', icon: Mail, color: 'green' },
    { id: 'domain', label: 'Domain Research', icon: Globe, color: 'purple' },
    { id: 'social', label: 'Social Media', icon: Users, color: 'pink' },
    { id: 'phone', label: 'Phone Lookup', icon: Phone, color: 'orange' },
    { id: 'location', label: 'Geolocation', icon: MapPin, color: 'teal' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-blue-600" />
            Advanced Intel
            {userSubscription?.plan !== 'free' && (
              <Crown className="w-6 h-6 text-yellow-500" title={`${userSubscription?.plan} Plan`} />
            )}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Professional OSINT investigation tools with real API integrations
            {userSubscription && (
              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full capitalize">
                {userSubscription.plan} Plan
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowApiConfig(true)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Key className="w-4 h-4" />
            API Config
          </button>
          <button
            onClick={() => alert('Export features have been moved to Profile → Data Management for better organization!')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Export → Profile
          </button>
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Database className="w-4 h-4" />
            Clear All
          </button>
          <button
            onClick={() => handleExport()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Quick Export
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Investigations</p>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>
              <Database className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Today</p>
                <p className="text-2xl font-bold">{statistics.today}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">This Week</p>
                <p className="text-2xl font-bold">{statistics.thisWeek}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Success Rate</p>
                <p className="text-2xl font-bold">{statistics.successRate}%</p>
              </div>
              <Activity className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>
      )}

      {/* Investigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-1 p-1">
            {investigationTabs.map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === id
                    ? `bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-300`
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderInvestigationForm()}
        </div>
      </div>

      {/* Current Investigation Result */}
      {renderCurrentResult()}

      {/* API Configuration Modal */}
      {renderApiConfiguration()}
    </div>
  );
};

export default AdvancedOSINTTools;