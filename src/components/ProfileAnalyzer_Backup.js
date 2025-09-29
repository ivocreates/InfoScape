import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import investigationService from '../services/investigationService';
import { 
  User, 
  Globe, 
  ExternalLink, 
  Save, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Database,
  FolderPlus
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

function ProfileAnalyzer() {
  const [targetUrl, setTargetUrl] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [currentInvestigationId, setCurrentInvestigationId] = useState(null);
  const [investigations, setInvestigations] = useState([]);
  const [showCreateInvestigation, setShowCreateInvestigation] = useState(false);
  const [newInvestigationData, setNewInvestigationData] = useState({
    title: '',
    description: '',
    targetName: ''
  });

  useEffect(() => {
    fetchSavedProfiles();
    fetchInvestigations();
  }, []);

  const fetchInvestigations = async () => {
    try {
      const investigations = await investigationService.getInvestigations();
      setInvestigations(investigations);
    } catch (error) {
      console.error('Error fetching investigations:', error);
    }
  };

  const fetchSavedProfiles = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, `users/${auth.currentUser.uid}/profiles`),
        where('userId', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const profilesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setProfiles(profilesData);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeProfile = async () => {
    if (!targetUrl.trim()) return;
    
    // Validate URL format
    try {
      new URL(targetUrl);
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    setAnalyzing(true);
    try {
      // Enhanced profile analysis simulation with realistic data
      const platform = detectPlatform(targetUrl);
      const profileData = await simulateProfileAnalysis(targetUrl, platform);
      
      const mockAnalysis = {
        url: targetUrl,
        platform: platform,
        profile: profileData.profile,
        socialLinks: profileData.socialLinks,
        riskScore: profileData.riskScore,
        riskLevel: getRiskLevel(profileData.riskScore),
        flags: profileData.flags,
        recommendations: profileData.recommendations,
        metadata: {
          analysisDate: new Date().toISOString(),
          dataPoints: profileData.dataPoints || 0,
          confidence: profileData.confidence || 'medium',
          sources: profileData.sources || ['Profile Data', 'Public Information']
        }
      };

      setAnalysis(mockAnalysis);
      
      // Enhanced data structure for investigation service
      const analysisData = {
        ...mockAnalysis,
        scanType: 'profile_analysis',
        investigationId: currentInvestigationId,
        metadata: {
          ...mockAnalysis.metadata,
          investigationContext: currentInvestigationId ? 'investigation_scan' : 'standalone_scan',
          toolVersion: '2.0',
          timestamp: Date.now()
        }
      };
      
      // Save using the enhanced investigation service
      await investigationService.saveProfileAnalysis(analysisData, currentInvestigationId);
      
      fetchSavedProfiles();
    } catch (error) {
      console.error('Error analyzing profile:', error);
      alert('Error analyzing profile. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const createInvestigation = async () => {
    try {
      const investigation = await investigationService.createInvestigation({
        ...newInvestigationData,
        type: 'profile_investigation',
        tags: ['osint', 'profile_analysis'],
        priority: 'medium'
      });
      
      setCurrentInvestigationId(investigation.id);
      setInvestigations(prev => [investigation, ...prev]);
      setShowCreateInvestigation(false);
      setNewInvestigationData({ title: '', description: '', targetName: '' });
    } catch (error) {
      console.error('Error creating investigation:', error);
    }
  };

  const simulateProfileAnalysis = async (url, platform) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    
    // Generate realistic profile data based on platform
    const profiles = {
      'LinkedIn': {
        profile: {
          name: 'Sarah Johnson',
          username: 'sarah.johnson.dev',
          bio: 'Senior Software Engineer at TechCorp | Full-Stack Developer | React & Node.js Expert',
          location: 'San Francisco, CA',
          profileImage: null,
          followersCount: Math.floor(Math.random() * 2000) + 500,
          verified: Math.random() > 0.7,
          connections: Math.floor(Math.random() * 1000) + 200,
          experience: `${Math.floor(Math.random() * 10) + 5} years`,
          education: 'UC Berkeley - Computer Science',
          skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker']
        },
        socialLinks: [
          { platform: 'GitHub', url: 'https://github.com/sarahjohnsondev', confidence: 'high' },
          { platform: 'Twitter', url: 'https://twitter.com/sarah_codes', confidence: 'medium' },
          { platform: 'Personal Website', url: 'https://sarahjohnson.dev', confidence: 'high' }
        ],
        riskScore: Math.floor(Math.random() * 40) + 20,
        flags: generateSecurityFlags('linkedin'),
        recommendations: generateRecommendations('linkedin'),
        dataPoints: 15,
        confidence: 'high',
        sources: ['LinkedIn Profile', 'Public Posts', 'Connection Network']
      },
      'GitHub': {
        profile: {
          name: 'Alex Chen',
          username: 'alexchen-dev',
          bio: 'Open source enthusiast | JavaScript & Python | Building the future 🚀',
          location: 'Seattle, WA',
          followersCount: Math.floor(Math.random() * 1000) + 100,
          verified: false,
          repositories: Math.floor(Math.random() * 50) + 20,
          contributions: Math.floor(Math.random() * 1000) + 200,
          languages: ['JavaScript', 'Python', 'TypeScript', 'Go'],
          stars: Math.floor(Math.random() * 500) + 50
        },
        socialLinks: [
          { platform: 'LinkedIn', url: 'https://linkedin.com/in/alexchen', confidence: 'medium' },
          { platform: 'Twitter', url: 'https://twitter.com/alexchen_dev', confidence: 'high' },
          { platform: 'Personal Blog', url: 'https://alexchen.blog', confidence: 'medium' }
        ],
        riskScore: Math.floor(Math.random() * 30) + 15,
        flags: generateSecurityFlags('github'),
        recommendations: generateRecommendations('github'),
        dataPoints: 12,
        confidence: 'high',
        sources: ['GitHub Profile', 'Repository Analysis', 'Commit History']
      },
      'Twitter/X': {
        profile: {
          name: 'Jordan Smith',
          username: 'jordan_tech',
          bio: 'Tech entrepreneur | AI enthusiast | Building @StartupName | Thoughts are my own',
          location: 'Austin, TX',
          followersCount: Math.floor(Math.random() * 5000) + 1000,
          verified: Math.random() > 0.8,
          tweets: Math.floor(Math.random() * 2000) + 500,
          following: Math.floor(Math.random() * 1000) + 200,
          joined: '2018-03-15',
          engagement: 'High'
        },
        socialLinks: [
          { platform: 'LinkedIn', url: 'https://linkedin.com/in/jordansmith', confidence: 'high' },
          { platform: 'Personal Website', url: 'https://jordansmith.co', confidence: 'high' },
          { platform: 'Medium', url: 'https://medium.com/@jordantech', confidence: 'medium' }
        ],
        riskScore: Math.floor(Math.random() * 50) + 30,
        flags: generateSecurityFlags('twitter'),
        recommendations: generateRecommendations('twitter'),
        dataPoints: 18,
        confidence: 'medium',
        sources: ['Twitter Profile', 'Tweet Analysis', 'Network Analysis']
      }
    };
    
    return profiles[platform] || profiles['LinkedIn'];
  };

  const generateSecurityFlags = (platform) => {
    const allFlags = {
      linkedin: [
        'Public email address visible in contact info',
        'Phone number displayed in profile',
        'Detailed work history with company names',
        'Personal interests revealed in posts',
        'Connection network fully visible'
      ],
      github: [
        'Real name visible in commit history',
        'Email address exposed in commits',
        'Personal projects reveal interests',
        'Location data in repositories',
        'Contribution patterns show work schedule'
      ],
      twitter: [
        'Location services enabled',
        'Personal photos with metadata',
        'Real-time activity updates',
        'Political opinions expressed',
        'Family members mentioned in tweets'
      ]
    };
    
    const flags = allFlags[platform] || allFlags.linkedin;
    return flags.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  const generateRecommendations = (platform) => {
    const allRecs = {
      linkedin: [
        'Review privacy settings to limit public visibility',
        'Remove personal contact information from profile',
        'Limit connection visibility to network only',
        'Be cautious about posting location-specific content',
        'Enable two-factor authentication'
      ],
      github: [
        'Use a professional email for commits',
        'Review repository descriptions for sensitive info',
        'Consider making personal projects private',
        'Use GitHub\'s private email feature',
        'Enable two-factor authentication'
      ],
      twitter: [
        'Disable location services',
        'Review photo metadata before posting',
        'Limit personal information in bio',
        'Be cautious about real-time updates',
        'Review follower list privacy'
      ]
    };
    
    const recs = allRecs[platform] || allRecs.linkedin;
    return recs.slice(0, Math.floor(Math.random() * 4) + 2);
  };

  const getRiskLevel = (score) => {
    if (score <= 30) return 'Low';
    if (score <= 60) return 'Medium';
    return 'High';
  };

  const exportAnalysis = () => {
    if (!analysis) return;
    
    const exportData = {
      analysisDate: new Date().toISOString(),
      profileUrl: analysis.url,
      platform: analysis.platform,
      profileInfo: analysis.profile,
      riskAssessment: {
        score: analysis.riskScore,
        level: analysis.riskLevel,
        flags: analysis.flags
      },
      socialLinks: analysis.socialLinks,
      recommendations: analysis.recommendations,
      metadata: analysis.metadata
    };

    // Create downloadable JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `profile-analysis-${analysis.platform.toLowerCase()}-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const detectPlatform = (url) => {
    if (url.includes('linkedin.com')) return 'LinkedIn';
    if (url.includes('github.com')) return 'GitHub';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter/X';
    if (url.includes('facebook.com')) return 'Facebook';
    if (url.includes('instagram.com')) return 'Instagram';
    return 'Unknown';
  };

  const openProfile = (url) => {
    if (window.electronAPI) {
      window.electronAPI.openBrowser(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getRiskColor = (score) => {
    if (score <= 30) return 'text-green-600 bg-green-50';
    if (score <= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            Profile Analyzer
          </h1>
          <p className="text-lg text-gray-600">
            Analyze social media profiles and online presence for OSINT investigations
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Analysis Input */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-6 space-y-6">
              {/* Investigation Management */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                  <Database className="w-5 h-5 text-gray-700" />
                  Investigation
                </h2>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Active Investigation
                    </label>
                    <select
                      value={currentInvestigationId || ''}
                      onChange={(e) => setCurrentInvestigationId(e.target.value || null)}
                      className="input-field text-gray-900 bg-white w-full"
                    >
                      <option value="">No Investigation</option>
                      {investigations.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={() => setShowCreateInvestigation(true)}
                    className="btn-secondary w-full text-sm text-blue-700 border-blue-300 hover:bg-blue-50"
                  >
                    <FolderPlus className="w-4 h-4 mr-2" />
                    New Investigation
                  </button>
                  
                  {currentInvestigationId && (
                    <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border">
                      🔍 Analyses will be saved to selected investigation
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                  <Search className="w-5 h-5 text-gray-700" />
                  Analyze Profile
                </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Profile URL
                  </label>
                  <input
                    type="url"
                    className="input-field text-gray-900 bg-white"
                    placeholder="https://linkedin.com/in/username"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the full URL of a social media profile to analyze
                  </p>
                </div>

                <button
                  onClick={analyzeProfile}
                  disabled={!targetUrl.trim() || analyzing}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="text-white">Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Analyze Profile</span>
                    </>
                  )}
                </button>

                <div className="text-xs text-gray-500 space-y-2">
                  <p><strong className="text-gray-700">Supported platforms:</strong></p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>LinkedIn profiles</li>
                    <li>GitHub profiles</li>
                    <li>Twitter/X profiles</li>
                    <li>Facebook profiles</li>
                    <li>Instagram profiles</li>
                  </ul>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => openProfile('https://google.com')}
                    className="btn-secondary w-full text-sm"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Open Browser
                  </button>
                  {analysis && (
                    <button
                      onClick={() => exportAnalysis()}
                      className="btn-secondary w-full text-sm text-green-700 border-green-300 hover:bg-green-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Export Analysis
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Results & Saved Profiles */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Analysis */}
            {analysis && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Analysis Results</h2>
                  <button
                    onClick={() => openProfile(analysis.url)}
                    className="btn-secondary text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Info */}
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900">Profile Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{analysis.profile.name}</p>
                          <p className="text-sm text-gray-600">@{analysis.profile.username}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <strong className="text-gray-700">Platform:</strong>
                          <span className="text-gray-900">{analysis.platform}</span>
                        </div>
                        <div className="flex justify-between">
                          <strong className="text-gray-700">Bio:</strong>
                          <span className="text-gray-900 text-right max-w-xs truncate">{analysis.profile.bio}</span>
                        </div>
                        <div className="flex justify-between">
                          <strong className="text-gray-700">Location:</strong>
                          <span className="text-gray-900">{analysis.profile.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <strong className="text-gray-700">Followers:</strong>
                          <span className="text-gray-900">{analysis.profile.followersCount?.toLocaleString()}</span>
                        </div>
                        {analysis.profile.verified && (
                          <div className="flex justify-between">
                            <strong className="text-gray-700">Verified:</strong>
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    {analysis.metadata && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2">Analysis Metadata</h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Data Points:</span>
                            <span className="text-gray-900 font-medium">{analysis.metadata.dataPoints}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Confidence:</span>
                            <span className={`font-medium capitalize ${
                              analysis.metadata.confidence === 'high' ? 'text-green-600' :
                              analysis.metadata.confidence === 'medium' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {analysis.metadata.confidence}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Sources:</span>
                            <span className="text-gray-900 font-medium">{analysis.metadata.sources.length}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Risk Assessment */}
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900">Risk Assessment</h3>
                    <div className={`p-4 rounded-lg ${getRiskColor(analysis.riskScore)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Privacy Risk Score</span>
                        <div className="text-right">
                          <span className="text-2xl font-bold">{analysis.riskScore}/100</span>
                          <div className="text-sm font-medium">{analysis.riskLevel} Risk</div>
                        </div>
                      </div>
                      <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                        <div 
                          className="bg-current h-2 rounded-full transition-all duration-500"
                          style={{ width: `${analysis.riskScore}%` }}
                        />
                      </div>
                    </div>

                    {analysis.flags && analysis.flags.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Security Flags ({analysis.flags.length})
                        </h4>
                        <ul className="space-y-1">
                          {analysis.flags.map((flag, index) => (
                            <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                              <span>{flag}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                {analysis.socialLinks.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold mb-3">Connected Profiles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analysis.socialLinks.map((link, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium">{link.platform}</p>
                            <p className="text-sm text-gray-600 capitalize">
                              {link.confidence} confidence
                            </p>
                          </div>
                          <button
                            onClick={() => openProfile(link.url)}
                            className="btn-secondary text-sm"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.recommendations.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Saved Profiles */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Saved Analyses</h2>
              
              {loading ? (
                <LoadingSpinner />
              ) : profiles.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No profile analyses yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">{profile.profile?.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-600">{profile.platform}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(profile.riskScore || 0)}`}>
                            Risk: {profile.riskScore || 0}/100
                          </span>
                          <button
                            onClick={() => openProfile(profile.url)}
                            className="btn-secondary text-sm"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {profile.createdAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Analyzed on {profile.createdAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileAnalyzer;
