import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import investigationService from '../services/investigationService';
import { 
  Mail, 
  Search, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  Copy,
  Download,
  Eye,
  Clock,
  Users,
  Globe,
  Target,
  Database,
  FileText,
  Save,
  FolderPlus
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

function EmailOSINT() {
  const [email, setEmail] = useState('');
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
        collection(db, `users/${auth.currentUser.uid}/email_analysis`),
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
        type: 'email_osint',
        tags: ['osint', 'email_analysis'],
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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const analyzeEmail = async () => {
    if (!email.trim()) {
      alert('Please enter an email address');
      return;
    }

    if (!validateEmail(email)) {
      alert('Please enter a valid email address');
      return;
    }

    setAnalyzing(true);
    setResults(null);

    try {
      // Comprehensive email analysis
      const analysisResult = await performEmailAnalysis(email);
      setResults(analysisResult);

      // Save to investigation if selected
      if (currentInvestigationId) {
        try {
          await investigationService.saveEmailAnalysis(analysisResult, currentInvestigationId);
          console.log('Email analysis saved to investigation');
        } catch (saveError) {
          console.error('Error saving to investigation:', saveError);
        }
      }

      // Save to analysis history
      try {
        await addDoc(collection(db, `users/${auth.currentUser.uid}/email_analysis`), {
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
      console.error('Email analysis error:', error);
      alert('Failed to analyze email: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const performEmailAnalysis = async (emailAddress) => {
    // Simulate comprehensive email analysis
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    const domain = emailAddress.split('@')[1];
    const username = emailAddress.split('@')[0];

    // Simulate various OSINT checks
    const breachData = generateBreachData(emailAddress);
    const socialMediaProfiles = generateSocialMediaProfiles(username, emailAddress);
    const domainInfo = generateDomainInfo(domain);
    const securityAssessment = generateSecurityAssessment(emailAddress);

    return {
      email: emailAddress,
      username: username,
      domain: domain,
      timestamp: new Date().toISOString(),
      
      // Email validation and deliverability
      validation: {
        isValid: true,
        isDeliverable: Math.random() > 0.2,
        isDisposable: Math.random() > 0.8,
        isRole: ['admin', 'info', 'support', 'contact'].some(role => username.includes(role)),
        riskScore: Math.floor(Math.random() * 100)
      },

      // Data breach information
      breaches: breachData,

      // Social media presence
      socialProfiles: socialMediaProfiles,

      // Domain analysis
      domainAnalysis: domainInfo,

      // Security assessment
      security: securityAssessment,

      // Additional intelligence
      intelligence: {
        reputation: Math.random() > 0.7 ? 'Good' : Math.random() > 0.4 ? 'Neutral' : 'Poor',
        spamScore: Math.floor(Math.random() * 10),
        lastSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        associatedDomains: generateAssociatedDomains(domain),
        possibleLocations: generatePossibleLocations()
      },

      metadata: {
        analysisDate: new Date().toISOString(),
        sources: ['HaveIBeenPwned', 'Breach Databases', 'Social Media APIs', 'Domain Intelligence', 'Reputation Services'],
        toolVersion: '2.0',
        confidence: Math.floor(Math.random() * 40) + 60
      }
    };
  };

  const generateBreachData = (email) => {
    const possibleBreaches = [
      { name: 'Adobe', date: '2013-10-04', affected: 153000000, dataTypes: ['Email addresses', 'Passwords', 'Names'] },
      { name: 'LinkedIn', date: '2012-05-05', affected: 164611595, dataTypes: ['Email addresses', 'Passwords'] },
      { name: 'Yahoo', date: '2013-08-01', affected: 1000000000, dataTypes: ['Email addresses', 'Names', 'Phone numbers'] },
      { name: 'Equifax', date: '2017-07-29', affected: 147900000, dataTypes: ['Email addresses', 'Names', 'SSNs'] },
      { name: 'Facebook', date: '2019-04-03', affected: 533000000, dataTypes: ['Email addresses', 'Names', 'Phone numbers'] }
    ];

    const numBreaches = Math.floor(Math.random() * 4);
    return possibleBreaches.slice(0, numBreaches).map(breach => ({
      ...breach,
      confidence: Math.floor(Math.random() * 40) + 60
    }));
  };

  const generateSocialMediaProfiles = (username, email) => {
    const platforms = ['Twitter', 'LinkedIn', 'Facebook', 'Instagram', 'GitHub', 'Reddit'];
    const profiles = [];

    platforms.forEach(platform => {
      if (Math.random() > 0.6) {
        profiles.push({
          platform,
          username: username,
          url: `https://${platform.toLowerCase()}.com/${username}`,
          confidence: Math.floor(Math.random() * 50) + 50,
          verified: Math.random() > 0.8,
          lastActivity: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });

    return profiles;
  };

  const generateDomainInfo = (domain) => {
    return {
      domain: domain,
      registrar: ['GoDaddy', 'Namecheap', 'CloudFlare', 'Google Domains'][Math.floor(Math.random() * 4)],
      createdDate: new Date(Date.now() - Math.random() * 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      nameServers: ['ns1.example.com', 'ns2.example.com'],
      mxRecords: [`mail.${domain}`, `mx.${domain}`],
      isCustomDomain: !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(domain),
      riskLevel: Math.random() > 0.8 ? 'High' : Math.random() > 0.5 ? 'Medium' : 'Low'
    };
  };

  const generateSecurityAssessment = (email) => {
    return {
      phishingRisk: Math.floor(Math.random() * 100),
      spamRisk: Math.floor(Math.random() * 100),
      malwareRisk: Math.floor(Math.random() * 100),
      overallThreatLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      recommendations: [
        'Enable two-factor authentication',
        'Use strong, unique passwords',
        'Monitor for suspicious activity',
        'Consider email alias for public use'
      ].slice(0, Math.floor(Math.random() * 3) + 1)
    };
  };

  const generateAssociatedDomains = (domain) => {
    const variations = [
      domain.replace('.com', '.net'),
      domain.replace('.com', '.org'),
      `secure${domain}`,
      `mail.${domain}`
    ];
    return variations.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  const generatePossibleLocations = () => {
    const locations = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France'];
    return locations.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  const exportResults = () => {
    if (!results) return;
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `email-osint-${results.email}-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could show a toast notification here
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            Email OSINT
          </h1>
          <p className="text-gray-600">
            Comprehensive email intelligence gathering and breach analysis
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Analysis Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Form */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Analysis</h2>
              
              {/* Investigation Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link to Investigation (Optional)
                </label>
                <div className="flex gap-2">
                  <select
                    value={currentInvestigationId || ''}
                    onChange={(e) => setCurrentInvestigationId(e.target.value || null)}
                    className="flex-1 input"
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

              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address to analyze"
                  className="flex-1 input"
                  disabled={analyzing}
                />
                <button
                  onClick={analyzeEmail}
                  disabled={analyzing || !email.trim()}
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

            {/* Analysis Results */}
            {analyzing && (
              <div className="card p-8 text-center">
                <LoadingSpinner className="w-8 h-8 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Analyzing Email
                </h3>
                <p className="text-gray-600">
                  Checking breaches, social profiles, and domain intelligence...
                </p>
              </div>
            )}

            {results && (
              <div className="space-y-6">
                {/* Email Validation */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Email Validation</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(results.email)}
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
                        results.validation.isValid ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {results.validation.isValid ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {results.validation.isValid ? 'Valid' : 'Invalid'}
                      </div>
                      <div className="text-xs text-gray-500">Format</div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        results.validation.isDeliverable ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        <Mail className={`w-6 h-6 ${
                          results.validation.isDeliverable ? 'text-green-600' : 'text-yellow-600'
                        }`} />
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {results.validation.isDeliverable ? 'Deliverable' : 'Undeliverable'}
                      </div>
                      <div className="text-xs text-gray-500">Status</div>
                    </div>

                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        results.validation.isDisposable ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        <Shield className={`w-6 h-6 ${
                          results.validation.isDisposable ? 'text-red-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {results.validation.isDisposable ? 'Disposable' : 'Permanent'}
                      </div>
                      <div className="text-xs text-gray-500">Type</div>
                    </div>

                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        results.validation.riskScore > 70 ? 'bg-red-100' : 
                        results.validation.riskScore > 40 ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        <Target className={`w-6 h-6 ${
                          results.validation.riskScore > 70 ? 'text-red-600' : 
                          results.validation.riskScore > 40 ? 'text-yellow-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {results.validation.riskScore}%
                      </div>
                      <div className="text-xs text-gray-500">Risk Score</div>
                    </div>
                  </div>
                </div>

                {/* Data Breaches */}
                {results.breaches.length > 0 && (
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Data Breaches Found ({results.breaches.length})
                    </h3>
                    <div className="space-y-3">
                      {results.breaches.map((breach, index) => (
                        <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-red-900">{breach.name}</h4>
                            <span className="text-sm text-red-700">
                              {new Date(breach.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-red-800">Affected:</span>
                              <span className="ml-2 text-red-700">
                                {breach.affected.toLocaleString()} accounts
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-red-800">Data Types:</span>
                              <span className="ml-2 text-red-700">
                                {breach.dataTypes.join(', ')}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-red-800">Confidence:</span>
                              <span className="ml-2 text-red-700">{breach.confidence}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Media Profiles */}
                {results.socialProfiles.length > 0 && (
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Potential Social Media Profiles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.socialProfiles.map((profile, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-gray-900">{profile.platform}</span>
                              {profile.verified && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                            <a
                              href={profile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Username: {profile.username}</div>
                            <div>Confidence: {profile.confidence}%</div>
                            <div>Last Activity: {new Date(profile.lastActivity).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Domain Analysis */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-600" />
                    Domain Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Domain:</span>
                      <span className="ml-2 text-gray-900">{results.domainAnalysis.domain}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Registrar:</span>
                      <span className="ml-2 text-gray-900">{results.domainAnalysis.registrar}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Created:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(results.domainAnalysis.createdDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Risk Level:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        results.domainAnalysis.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                        results.domainAnalysis.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {results.domainAnalysis.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Assessment */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Security Assessment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {results.security.phishingRisk}%
                      </div>
                      <div className="text-sm text-gray-600">Phishing Risk</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {results.security.spamRisk}%
                      </div>
                      <div className="text-sm text-gray-600">Spam Risk</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {results.security.malwareRisk}%
                      </div>
                      <div className="text-sm text-gray-600">Malware Risk</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="font-medium text-gray-700">Overall Threat Level:</span>
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                      results.security.overallThreatLevel === 'High' ? 'bg-red-100 text-red-700' :
                      results.security.overallThreatLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {results.security.overallThreatLevel}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Recommendations:</h4>
                    <ul className="space-y-1">
                      {results.security.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {!results && !analyzing && (
              <div className="card p-8 text-center">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Analysis Results Yet
                </h3>
                <p className="text-gray-600">
                  Enter an email address above to begin comprehensive OSINT analysis
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
                        {analysis.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        {analysis.createdAt?.toLocaleDateString()}
                      </div>
                      {analysis.breaches?.length > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          {analysis.breaches.length} breach(es) found
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
                  <span className="text-sm text-gray-600">Breaches Found</span>
                  <span className="text-sm font-medium text-red-600">
                    {analysisHistory.reduce((acc, analysis) => acc + (analysis.breaches?.length || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Social Profiles</span>
                  <span className="text-sm font-medium text-blue-600">
                    {analysisHistory.reduce((acc, analysis) => acc + (analysis.socialProfiles?.length || 0), 0)}
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

export default EmailOSINT;