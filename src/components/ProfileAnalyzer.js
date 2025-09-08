import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { User, Globe, ExternalLink, Save, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

function ProfileAnalyzer() {
  const [targetUrl, setTargetUrl] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    fetchSavedProfiles();
  }, []);

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

    setAnalyzing(true);
    try {
      // Simulate profile analysis (in a real app, this would call an API or scraping service)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalysis = {
        url: targetUrl,
        platform: detectPlatform(targetUrl),
        profile: {
          name: 'John Smith',
          username: 'johnsmith123',
          bio: 'Software Engineer at Tech Corp',
          location: 'San Francisco, CA',
          profileImage: null,
          followersCount: 1250,
          verified: false
        },
        socialLinks: [
          { platform: 'LinkedIn', url: 'https://linkedin.com/in/johnsmith', confidence: 'high' },
          { platform: 'GitHub', url: 'https://github.com/johnsmith', confidence: 'medium' },
          { platform: 'Twitter', url: 'https://twitter.com/johnsmith', confidence: 'low' }
        ],
        riskScore: 25,
        flags: [
          'Public email address found',
          'Phone number visible in bio'
        ],
        recommendations: [
          'Enable two-factor authentication',
          'Review privacy settings',
          'Consider removing personal contact info from bio'
        ]
      };

      setAnalysis(mockAnalysis);
      
      // Save to Firebase
      await addDoc(collection(db, `users/${auth.currentUser.uid}/profiles`), {
        ...mockAnalysis,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      fetchSavedProfiles();
    } catch (error) {
      console.error('Error analyzing profile:', error);
    } finally {
      setAnalyzing(false);
    }
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
          <p className="text-gray-600">
            Analyze social media profiles and online presence for OSINT investigations
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Analysis Input */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Analyze Profile
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Profile URL
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://linkedin.com/in/username"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                  />
                </div>

                <button
                  onClick={analyzeProfile}
                  disabled={!targetUrl.trim() || analyzing}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <LoadingSpinner size="small" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Analyze Profile
                    </>
                  )}
                </button>

                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Supported platforms:</strong></p>
                  <ul className="list-disc pl-4">
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
                  <h2 className="text-xl font-semibold">Analysis Results</h2>
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
                    <h3 className="font-semibold mb-3">Profile Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{analysis.profile.name}</p>
                          <p className="text-sm text-gray-600">@{analysis.profile.username}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <p><strong>Platform:</strong> {analysis.platform}</p>
                        <p><strong>Bio:</strong> {analysis.profile.bio}</p>
                        <p><strong>Location:</strong> {analysis.profile.location}</p>
                        <p><strong>Followers:</strong> {analysis.profile.followersCount?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div>
                    <h3 className="font-semibold mb-3">Risk Assessment</h3>
                    <div className={`p-4 rounded-lg ${getRiskColor(analysis.riskScore)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Privacy Risk Score</span>
                        <span className="text-2xl font-bold">{analysis.riskScore}/100</span>
                      </div>
                      <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                        <div 
                          className="bg-current h-2 rounded-full transition-all"
                          style={{ width: `${analysis.riskScore}%` }}
                        />
                      </div>
                    </div>

                    {analysis.flags.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Security Flags
                        </h4>
                        <ul className="space-y-1">
                          {analysis.flags.map((flag, index) => (
                            <li key={index} className="text-sm text-red-700 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                              {flag}
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
