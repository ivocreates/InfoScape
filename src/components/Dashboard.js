import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { 
  Search, Plus, Clock, TrendingUp, Users, Globe, Shield, Eye, 
  Target, Activity, ArrowRight, Command, 
  ChevronRight, Star, Zap, Compass, Link
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import LegalDocumentation from './LegalDocumentation';
import statisticsService from '../services/statisticsService';

function Dashboard({ setCurrentView }) {
  const [recentInvestigations, setRecentInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [favoriteTools, setFavoriteTools] = useState([]);
  const [showLegalDocs, setShowLegalDocs] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [stats, setStats] = useState({
    totalInvestigations: 0,
    successfulFinds: 0,
    platformsCovered: 0
  });
  const [weeklyStats, setWeeklyStats] = useState({
    newCases: 8,
    completed: 5,
    inProgress: 3
  });
  const [topTools, setTopTools] = useState([
    { name: 'Social Media Analyzer', usage: 75, trend: '+5%' },
    { name: 'Username Hunter', usage: 68, trend: '+12%' },
    { name: 'Email Validator', usage: 62, trend: '+8%' }
  ]);
  const [systemStatus, setSystemStatus] = useState({
    overall: 'operational',
    apiServices: 'online',
    database: 'healthy',
    responseTime: '123ms',
    lastUpdated: new Date().toLocaleTimeString()
  });

  useEffect(() => {
    fetchRecentInvestigations();
    fetchStats();
    loadFavoriteTools();
    checkTermsAcceptance();
  }, []);

  useEffect(() => {
    fetchRecentInvestigations();
    fetchStats();
    loadFavoriteTools();
  }, []);

  const checkTermsAcceptance = () => {
    const termsAccepted = localStorage.getItem(`terms_accepted_${auth.currentUser?.uid}`);
    if (!termsAccepted) {
      setShowLegalDocs(true);
    } else {
      setHasAcceptedTerms(true);
    }
  };

  const handleAcceptTerms = () => {
    localStorage.setItem(`terms_accepted_${auth.currentUser?.uid}`, 'true');
    setHasAcceptedTerms(true);
    setShowLegalDocs(false);
  };

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

      // Fetch real-time statistics
      await fetchRealTimeStats();
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeStats = async () => {
    try {
      // Get weekly statistics
      const weeklyData = await statisticsService.getWeeklyStats();
      setWeeklyStats(weeklyData.thisWeek);

      // Get top tools usage
      const topToolsData = await statisticsService.getTopToolsStats();
      setTopTools(topToolsData);

      // Get system status
      const statusData = await statisticsService.getSystemStatus();
      setSystemStatus(statusData);
    } catch (error) {
      console.error('Error fetching real-time stats:', error);
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

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Investigations */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Investigations</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalInvestigations}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <p className="text-xs text-green-600 dark:text-green-400">+12% this month</p>
              </div>
            </div>
            <div className="w-14 h-14 bg-blue-200 dark:bg-blue-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="w-7 h-7 text-blue-700 dark:text-blue-300" />
            </div>
          </div>
        </div>

        {/* Successful Findings */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Successful Findings</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.successfulFinds}</p>
              <div className="flex items-center gap-1 mt-2">
                <Target className="w-3 h-3 text-green-500" />
                <p className="text-xs text-green-600 dark:text-green-400">89% success rate</p>
              </div>
            </div>
            <div className="w-14 h-14 bg-green-200 dark:bg-green-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-7 h-7 text-green-700 dark:text-green-300" />
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Data Sources</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.platformsCovered}+</p>
              <div className="flex items-center gap-1 mt-2">
                <Globe className="w-3 h-3 text-purple-500" />
                <p className="text-xs text-purple-600 dark:text-purple-400">Social, Web, Email</p>
              </div>
            </div>
            <div className="w-14 h-14 bg-purple-200 dark:bg-purple-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Globe className="w-7 h-7 text-purple-700 dark:text-purple-300" />
            </div>
          </div>
        </div>

        {/* Active Tools */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Active Tools</p>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">24</p>
              <div className="flex items-center gap-1 mt-2">
                <Zap className="w-3 h-3 text-orange-500" />
                <p className="text-xs text-orange-600 dark:text-orange-400">All operational</p>
              </div>
            </div>
            <div className="w-14 h-14 bg-orange-200 dark:bg-orange-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Command className="w-7 h-7 text-orange-700 dark:text-orange-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Investigation Timeline */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">This Week</h4>
            <Activity className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">New Cases</span>
              <span className="font-medium text-gray-900 dark:text-white">{weeklyStats.newCases}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
              <span className="font-medium text-green-600 dark:text-green-400">{weeklyStats.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">{weeklyStats.inProgress}</span>
            </div>
          </div>
        </div>

        {/* Popular Tools */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Top Tools</h4>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {topTools.map((tool, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{tool.name}</span>
                <div className="flex items-center gap-1">
                  <div className="w-8 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        index === 0 ? 'bg-blue-500' : 
                        index === 1 ? 'bg-green-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${Math.min(tool.usage, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{tool.usage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">System Status</h4>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                systemStatus.overall === 'operational' ? 'bg-green-500' : 
                systemStatus.overall === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className={`text-xs capitalize ${
                systemStatus.overall === 'operational' ? 'text-green-600 dark:text-green-400' :
                systemStatus.overall === 'degraded' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
              }`}>{systemStatus.overall}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">API Services</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                systemStatus.apiServices === 'online' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>{systemStatus.apiServices}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                systemStatus.database === 'healthy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                systemStatus.database === 'degraded' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>{systemStatus.database}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{systemStatus.responseTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{systemStatus.lastUpdated}</span>
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
      
      {/* Legal Documentation Modal */}
      <LegalDocumentation 
        isOpen={showLegalDocs} 
        onClose={handleAcceptTerms}
      />
    </div>
  );
}

export default Dashboard;
