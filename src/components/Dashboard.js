import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { 
  Search, Plus, Clock, TrendingUp, Users, Globe, Shield, Eye, 
  Target, Activity, ArrowRight, Command, 
  ChevronRight, Star, Zap, Compass, Link
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

function Dashboard({ setCurrentView }) {
  const [recentInvestigations, setRecentInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [favoriteTools, setFavoriteTools] = useState([]);
  const [stats, setStats] = useState({
    totalInvestigations: 0,
    successfulFinds: 0,
    platformsCovered: 0
  });

  useEffect(() => {
    fetchRecentInvestigations();
    fetchStats();
    loadFavoriteTools();
  }, []);

  useEffect(() => {
    fetchRecentInvestigations();
    fetchStats();
    loadFavoriteTools();
  }, []);

  const loadFavoriteTools = async () => {
    try {
      // Load favorites from Firebase
      if (auth.currentUser) {
        const favoritesQuery = query(
          collection(db, `users/${auth.currentUser.uid}/favorites`),
          orderBy('addedAt', 'desc'),
          limit(6)
        );
        const snapshot = await getDocs(favoritesQuery);
        const favorites = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFavoriteTools(favorites);
      }
    } catch (error) {
      console.error('Error loading favorite tools:', error);
      // Fallback to default favorite tools
      setFavoriteTools([
        {
          id: 'domain-lookup',
          title: 'Domain Lookup',
          description: 'Comprehensive domain analysis toolkit',
          icon: Globe,
          color: 'bg-purple-500',
          action: () => setCurrentView('osint-tools')
        },
        {
          id: 'haveibeenpwned',
          title: 'Have I Been Pwned',
          description: 'Check for data breaches',
          icon: Shield,
          color: 'bg-red-500',
          action: () => window.open('https://haveibeenpwned.com', '_blank')
        },
        {
          id: 'whois-lookup',
          title: 'WHOIS Lookup',
          description: 'Domain registration information',
          icon: Globe,
          color: 'bg-blue-500',
          action: () => window.open('https://whois.net', '_blank')
        }
      ]);
    }
  };



  const fetchRecentInvestigations = async () => {
    try {
      if (!auth.currentUser) {
        console.error('User not authenticated');
        return;
      }
      
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
      if (!auth.currentUser) {
        console.error('User not authenticated');
        return;
      }
      
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

  // Simplified quick access tools
  const quickAccessTools = [
    {
      id: 'investigation',
      title: 'Query Builder',
      description: 'Advanced Google dorking and search operators',
      icon: Search,
      color: 'bg-blue-500',
      popular: true
    },
    {
      id: 'osint-tools',
      title: 'OSINT Arsenal',
      description: 'Professional investigation tools collection',
      icon: Shield,
      color: 'bg-red-500',
      popular: true
    },
    {
      id: 'domain-lookup',
      title: 'Domain Lookup',
      description: 'Comprehensive domain analysis toolkit',
      icon: Globe,
      color: 'bg-purple-500'
    },
    {
      id: 'profile-analyzer',
      title: 'Profile Analysis',
      description: 'Social media and profile investigation',
      icon: Users,
      color: 'bg-green-500'
    }
  ];

  // Quick start templates for common OSINT scenarios
  const investigationTemplates = [
    {
      title: 'Social Media Investigation',
      description: 'Find social profiles across platforms',
      icon: Users,
      action: () => setCurrentView('profile-analyzer')
    },
    {
      title: 'Email Investigation',
      description: 'Trace email addresses and breaches',
      icon: Target,
      action: () => setCurrentView('osint-tools')
    },
    {
      title: 'Website Analysis',
      description: 'Analyze domains and web presence',
      icon: Globe,
      action: () => setCurrentView('link-scanner')
    },
    {
      title: 'Advanced Dorking',
      description: 'Custom search operators and filters',
      icon: Compass,
      action: () => setCurrentView('investigation')
    }
  ];


  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Simple Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {auth.currentUser?.displayName?.split(' ')[0] || 'Investigator'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Ready to dive deep into your next OSINT investigation?
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Investigations</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalInvestigations}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All time</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Successful Finds</p>
              <p className="text-3xl font-bold text-green-600">{stats.successfulFinds}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed cases</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Platforms Covered</p>
              <p className="text-3xl font-bold text-blue-600">{stats.platformsCovered}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Data sources</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Tools */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Access Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAccessTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setCurrentView(tool.id)}
                className="card p-6 text-left hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group relative"
              >
                {tool.popular && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 inline" />
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </div>
                
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{tool.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{tool.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Investigation Templates */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Start Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {investigationTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.title}
                onClick={template.action}
                className="card p-4 text-left hover:shadow-md transition-all duration-200 group bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">{template.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">{template.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Investigations */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Investigations</h3>
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
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-2">No investigations yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Start your first OSINT investigation to see it here</p>
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
                  <div key={investigation.id} className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <Search className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {investigation.targetName || 'Untitled Investigation'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {investigation.description || 'No description provided'}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
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

        {/* Enhanced Tips & Shortcuts */}
        <div className="space-y-6">
          {/* OSINT Tips */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pro Tips</h3>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 text-sm mb-1">Exact Name Matching</h4>
                <p className="text-xs text-blue-700 dark:text-blue-400">Use quotes around names: "John Smith"</p>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border-l-4 border-green-400">
                <h4 className="font-medium text-green-900 dark:text-green-300 text-sm mb-1">Add Context</h4>
                <p className="text-xs text-green-700 dark:text-green-400">Combine with location: "John" "Seattle"</p>
              </div>
              
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border-l-4 border-purple-400">
                <h4 className="font-medium text-purple-900 dark:text-purple-300 text-sm mb-1">Exclude Noise</h4>
                <p className="text-xs text-purple-700 dark:text-purple-400">Remove irrelevant: "John" -football</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
