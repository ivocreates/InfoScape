import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { 
  Search, 
  Link, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Globe,
  Shield,
  Eye,
  Target,
  FileText,
  Users
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

function LinkScanner() {
  const [targetQuery, setTargetQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({
    platforms: {
      linkedin: true,
      github: true,
      twitter: true,
      facebook: true,
      instagram: true,
      other: true
    },
    minAccuracy: 70,
    showVerified: true,
    showUnverified: true
  });
  const [scanHistory, setScanHistory] = useState([]);

  useEffect(() => {
    fetchScanHistory();
  }, []);

  const fetchScanHistory = async () => {
    try {
      const q = query(
        collection(db, `users/${auth.currentUser.uid}/link_scans`),
        where('userId', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const scans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setScanHistory(scans);
    } catch (error) {
      console.error('Error fetching scan history:', error);
    }
  };

  // OSINT Link Detection Engine
  const detectLinks = async (searchQuery) => {
    const mockResults = [
      {
        id: 1,
        platform: 'linkedin',
        url: 'https://linkedin.com/in/john-smith-dev',
        title: 'John Smith - Software Engineer at Tech Corp',
        description: 'Experienced software engineer with 5+ years in full-stack development...',
        accuracy: 95,
        confidence: 'high',
        verified: true,
        matchReasons: ['exact name match', 'profession match', 'location match'],
        osintData: {
          connections: 500,
          skills: ['JavaScript', 'Python', 'React'],
          education: 'MIT Computer Science',
          location: 'San Francisco, CA'
        }
      },
      {
        id: 2,
        platform: 'github',
        url: 'https://github.com/johnsmith-dev',
        title: 'johnsmith-dev (John Smith)',
        description: '42 repositories, 250 followers, JavaScript enthusiast',
        accuracy: 88,
        confidence: 'high',
        verified: false,
        matchReasons: ['username similarity', 'coding activity matches profile'],
        osintData: {
          repositories: 42,
          followers: 250,
          languages: ['JavaScript', 'Python', 'TypeScript'],
          contributions: 'Active contributor'
        }
      },
      {
        id: 3,
        platform: 'twitter',
        url: 'https://twitter.com/johnsmith_dev',
        title: '@johnsmith_dev',
        description: 'Software Engineer | Tech Enthusiast | San Francisco',
        accuracy: 82,
        confidence: 'medium',
        verified: false,
        matchReasons: ['similar handle', 'location match', 'bio keywords'],
        osintData: {
          followers: 1200,
          following: 350,
          tweets: 850,
          joined: '2019-03-15'
        }
      },
      {
        id: 4,
        platform: 'facebook',
        url: 'https://facebook.com/john.smith.dev',
        title: 'John Smith',
        description: 'Lives in San Francisco, California • Works at Tech Corp',
        accuracy: 75,
        confidence: 'medium',
        verified: false,
        matchReasons: ['name match', 'workplace match', 'location match'],
        osintData: {
          friends: '500+',
          checkins: 'Multiple SF locations',
          photos: 'Professional headshots'
        }
      },
      {
        id: 5,
        platform: 'other',
        url: 'https://stackoverfow.com/users/john-smith',
        title: 'John Smith - Stack Overflow',
        description: 'Senior Developer with 10k+ reputation',
        accuracy: 70,
        confidence: 'medium',
        verified: false,
        matchReasons: ['expertise match', 'activity timeline'],
        osintData: {
          reputation: 10500,
          answers: 250,
          questions: 45,
          tags: ['javascript', 'python', 'react']
        }
      },
      {
        id: 6,
        platform: 'other',
        url: 'https://medium.com/@johnsmith-tech',
        title: 'John Smith - Medium',
        description: 'Tech writer and software engineer sharing insights...',
        accuracy: 68,
        confidence: 'low',
        verified: false,
        matchReasons: ['writing style analysis', 'technical topics'],
        osintData: {
          articles: 25,
          followers: 800,
          topics: ['Software Engineering', 'JavaScript', 'Career Advice']
        }
      }
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    return mockResults;
  };

  const runScan = async () => {
    if (!targetQuery.trim()) return;

    setScanning(true);
    try {
      const detectedLinks = await detectLinks(targetQuery);
      
      // Apply filters
      const filteredResults = detectedLinks.filter(link => {
        if (link.accuracy < filters.minAccuracy) return false;
        if (!filters.platforms[link.platform]) return false;
        if (!filters.showVerified && link.verified) return false;
        if (!filters.showUnverified && !link.verified) return false;
        return true;
      });

      setResults(filteredResults);

      // Save to Firebase
      const scanData = {
        query: targetQuery,
        results: filteredResults,
        totalFound: detectedLinks.length,
        filteredCount: filteredResults.length,
        filters: filters,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, `users/${auth.currentUser.uid}/link_scans`), scanData);
      fetchScanHistory();

    } catch (error) {
      console.error('Error running scan:', error);
    } finally {
      setScanning(false);
    }
  };

  const openLink = (url) => {
    if (window.electronAPI) {
      window.electronAPI.openBrowser(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'linkedin': return Users;
      case 'github': return FileText;
      case 'twitter': return Globe;
      case 'facebook': return Users;
      case 'instagram': return Globe;
      default: return Link;
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            OSINT Link Scanner
          </h1>
          <p className="text-gray-600">
            Advanced link detection and verification with accuracy scoring
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Scan Controls */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Target Search
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Search Query
                    </label>
                    <textarea
                      className="input-field min-h-[80px] resize-none"
                      placeholder='e.g., "John Smith" "Software Engineer" "San Francisco"'
                      value={targetQuery}
                      onChange={(e) => setTargetQuery(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={runScan}
                    disabled={!targetQuery.trim() || scanning}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {scanning ? (
                      <>
                        <LoadingSpinner size="small" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Start Scan
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Filters
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Minimum Accuracy: {filters.minAccuracy}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="5"
                      value={filters.minAccuracy}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        minAccuracy: parseInt(e.target.value)
                      }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Platforms
                    </label>
                    <div className="space-y-2">
                      {Object.entries(filters.platforms).map(([platform, enabled]) => (
                        <label key={platform} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setFilters(prev => ({
                              ...prev,
                              platforms: {
                                ...prev.platforms,
                                [platform]: e.target.checked
                              }
                            }))}
                            className="rounded"
                          />
                          <span className="text-sm capitalize">{platform}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.showVerified}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          showVerified: e.target.checked
                        }))}
                        className="rounded"
                      />
                      <span className="text-sm">Show Verified</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.showUnverified}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          showUnverified: e.target.checked
                        }))}
                        className="rounded"
                      />
                      <span className="text-sm">Show Unverified</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              {results.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Scan Results</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Found:</span>
                      <span className="font-medium">{results.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>High Confidence:</span>
                      <span className="font-medium text-green-600">
                        {results.filter(r => r.confidence === 'high').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verified:</span>
                      <span className="font-medium text-blue-600">
                        {results.filter(r => r.verified).length}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {scanning && (
                <div className="card p-8 text-center">
                  <LoadingSpinner size="large" className="mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Scanning for Links...</h3>
                  <p className="text-gray-600">
                    Running advanced OSINT analysis across multiple platforms
                  </p>
                </div>
              )}

              {results.length > 0 && !scanning && (
                <>
                  <div className="card p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Found {results.length} Potential Matches
                    </h2>
                    
                    <div className="space-y-4">
                      {results.map((result) => {
                        const PlatformIcon = getPlatformIcon(result.platform);
                        
                        return (
                          <div key={result.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <PlatformIcon className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{result.title}</h3>
                                  <p className="text-sm text-gray-600 capitalize">{result.platform}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {result.verified && (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                )}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(result.confidence)}`}>
                                  {result.confidence} confidence
                                </span>
                                <span className={`text-sm font-bold ${getAccuracyColor(result.accuracy)}`}>
                                  {result.accuracy}%
                                </span>
                              </div>
                            </div>

                            <p className="text-gray-700 mb-3">{result.description}</p>

                            {/* Match Reasons */}
                            <div className="flex flex-wrap gap-1 mb-3">
                              {result.matchReasons.map((reason, index) => (
                                <span key={index} className="chip-secondary text-xs px-2 py-1">
                                  {reason}
                                </span>
                              ))}
                            </div>

                            {/* OSINT Data */}
                            {result.osintData && (
                              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                <h4 className="text-sm font-medium mb-2">Intelligence Data:</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                  {Object.entries(result.osintData).map(([key, value]) => (
                                    <div key={key}>
                                      <span className="font-medium capitalize">{key}:</span>
                                      <span className="ml-1 text-gray-600">
                                        {Array.isArray(value) ? value.join(', ') : value}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium truncate max-w-md"
                              >
                                {result.url}
                              </a>
                              <button
                                onClick={() => openLink(result.url)}
                                className="btn-secondary text-sm"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Open
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {results.length === 0 && !scanning && (
                <div className="card p-8 text-center">
                  <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Scan Results Yet
                  </h3>
                  <p className="text-gray-600">
                    Enter a search query and click "Start Scan" to begin OSINT link discovery
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LinkScanner;
