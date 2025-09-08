import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Search, Plus, Clock, TrendingUp, Users, Globe, FileText, Link, Shield, Eye } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

function Dashboard({ setCurrentView }) {
  const [recentInvestigations, setRecentInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInvestigations: 0,
    successfulFinds: 0,
    platformsCovered: 0
  });

  useEffect(() => {
    fetchRecentInvestigations();
    fetchStats();
  }, []);

  const fetchRecentInvestigations = async () => {
    try {
      const q = query(
        collection(db, `users/${auth.currentUser.uid}/investigations`),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const investigations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setRecentInvestigations(investigations);
    } catch (error) {
      console.error('Error fetching investigations:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const q = query(collection(db, `users/${auth.currentUser.uid}/investigations`));
      const snapshot = await getDocs(q);
      const investigations = snapshot.docs.map(doc => doc.data());
      
      const successful = investigations.filter(inv => inv.status === 'completed').length;
      const platforms = new Set();
      investigations.forEach(inv => {
        if (inv.platforms) {
          inv.platforms.forEach(platform => platforms.add(platform));
        }
      });

      setStats({
        totalInvestigations: investigations.length,
        successfulFinds: successful,
        platformsCovered: platforms.size
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStart = (type) => {
    setCurrentView(type);
  };

  const quickStartOptions = [
    {
      id: 'investigation',
      title: 'Query Builder',
      description: 'Build advanced Google dorks and search queries',
      icon: Search,
      color: 'bg-blue-500',
      searchTerms: ['Google dorking', 'advanced search']
    },
    {
      id: 'link-scanner', 
      title: 'Link Scanner',
      description: 'Scan and verify links with accuracy scoring',
      icon: Link,
      color: 'bg-green-500',
      searchTerms: ['link verification', 'accuracy analysis']
    },
    {
      id: 'profile-analyzer',
      title: 'Profile Analyzer', 
      description: 'Analyze social media profiles and assess risks',
      icon: Eye,
      color: 'bg-purple-500',
      searchTerms: ['profile analysis', 'risk assessment']
    },
    {
      id: 'osint-tools',
      title: 'OSINT Arsenal',
      description: 'Access integrated professional OSINT tools',
      icon: Shield,
      color: 'bg-red-500',
      searchTerms: ['OSINT tools', 'investigation tools']
    }
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {auth.currentUser?.displayName?.split(' ')[0] || 'Investigator'}
        </h2>
        <p className="text-gray-600">
          Ready to dive deep into your next OSINT investigation?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Investigations</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalInvestigations}</p>
            </div>
            <Search className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Successful Finds</p>
              <p className="text-3xl font-bold text-green-600">{stats.successfulFinds}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Platforms Covered</p>
              <p className="text-3xl font-bold text-blue-600">{stats.platformsCovered}</p>
            </div>
            <Globe className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Quick Start Options */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Start Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStartOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => handleQuickStart(option.id)}
                className="card p-6 text-left hover:shadow-lg transition-all duration-200 group"
              >
                <div className={`w-12 h-12 rounded-lg ${option.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{option.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                <div className="flex flex-wrap gap-1">
                  {option.searchTerms.slice(0, 2).map((term, index) => (
                    <span key={index} className="chip-secondary text-xs px-2 py-1">
                      {term}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Investigations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Investigations</h3>
              <button
                onClick={() => setCurrentView('investigation')}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Investigation
              </button>
            </div>

            {recentInvestigations.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No investigations yet</p>
                <button
                  onClick={() => setCurrentView('investigation')}
                  className="btn-primary"
                >
                  Start Your First Investigation
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentInvestigations.map((investigation) => (
                  <div key={investigation.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="w-5 h-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {investigation.targetName || 'Untitled Investigation'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {investigation.description || 'No description provided'}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {investigation.createdAt ? 
                          investigation.createdAt.toLocaleDateString() : 
                          'Unknown date'
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tips & Tricks */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">OSINT Tips</h3>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 text-sm mb-1">Exact Name Matching</h4>
              <p className="text-xs text-blue-700">Use quotes around names to avoid unrelated results: "John Smith"</p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 text-sm mb-1">Combine Context</h4>
              <p className="text-xs text-green-700">Add location or workplace: "John Smith" "Microsoft" "Seattle"</p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 text-sm mb-1">Exclude Noise</h4>
              <p className="text-xs text-purple-700">Remove unrelated results: "John Smith" -football -musician</p>
            </div>
            
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-900 text-sm mb-1">Time-bound Search</h4>
              <p className="text-xs text-amber-700">Use before: and after: to narrow down timeframes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
