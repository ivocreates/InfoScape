import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { 
  Search, Plus, Clock, TrendingUp, Users, Globe, FileText, Link, Shield, Eye, 
  Zap, Target, Compass, Activity, Filter, ArrowRight, Command, Bookmark,
  ChevronRight, Star, AlertTriangle
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

function Dashboard({ setCurrentView }) {
  const [recentInvestigations, setRecentInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Enhanced quick access tools with categories
  const quickAccessTools = [
    {
      category: 'General Search',
      tools: [
        {
          id: 'investigation',
          title: 'Query Builder',
          description: 'Advanced Google dorking and search operators',
          icon: Search,
          color: 'bg-blue-500',
          shortcut: 'Ctrl+1',
          popular: true
        },
        {
          id: 'osint-tools',
          title: 'OSINT Arsenal',
          description: 'Professional investigation tools collection',
          icon: Shield,
          color: 'bg-red-500',
          shortcut: 'Ctrl+2',
          popular: true
        }
      ]
    },
    {
      category: 'People Lookup',
      tools: [
        {
          id: 'profile-analyzer',
          title: 'Profile Analyzer',
          description: 'Social media analysis and risk assessment',
          icon: Eye,
          color: 'bg-purple-500',
          shortcut: 'Ctrl+3'
        },
        {
          id: 'link-scanner',
          title: 'Link Scanner',
          description: 'Verify links with accuracy scoring',
          icon: Link,
          color: 'bg-green-500',
          shortcut: 'Ctrl+4'
        }
      ]
    }
  ];

  // Common OSINT scenarios for quick start
  const investigationTemplates = [
    {
      title: 'Social Media Investigation',
      description: 'Find social profiles across platforms',
      icon: Users,
      color: 'border-blue-200 bg-blue-50',
      action: () => setCurrentView('profile-analyzer')
    },
    {
      title: 'Email Investigation',
      description: 'Trace email addresses and breaches',
      icon: Target,
      color: 'border-green-200 bg-green-50',
      action: () => setCurrentView('osint-tools')
    },
    {
      title: 'Website Analysis',
      description: 'Analyze domains and web presence',
      icon: Globe,
      color: 'border-purple-200 bg-purple-50',
      action: () => setCurrentView('link-scanner')
    },
    {
      title: 'Advanced Dorking',
      description: 'Custom search operators and filters',
      icon: Compass,
      color: 'border-amber-200 bg-amber-50',
      action: () => setCurrentView('investigation')
    }
  ];

  // Filter tools based on search query
  const filteredTools = quickAccessTools.map(category => ({
    ...category,
    tools: category.tools.filter(tool =>
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.tools.length > 0);

  const filteredTemplates = investigationTemplates.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Enhanced Header with Search */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back, {auth.currentUser?.displayName?.split(' ')[0] || 'Investigator'}
            </h2>
            <p className="text-gray-600 mt-1">
              Ready to dive deep into your next OSINT investigation?
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              <Command className="w-3 h-3 inline mr-1" />
              Use keyboard shortcuts
            </div>
          </div>
        </div>
        
        {/* Global Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            className="search-input pl-10"
            placeholder="Search tools, features, or templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Investigations</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalInvestigations}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Successful Finds</p>
              <p className="text-3xl font-bold text-green-600">{stats.successfulFinds}</p>
              <p className="text-xs text-gray-500 mt-1">Completed cases</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Platforms Covered</p>
              <p className="text-3xl font-bold text-blue-600">{stats.platformsCovered}</p>
              <p className="text-xs text-gray-500 mt-1">Data sources</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Tools by Category */}
      {(searchQuery === '' || filteredTools.length > 0) && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Access Tools</h3>
          {filteredTools.map((category) => (
            <div key={category.category} className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                {category.category}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.tools.map((tool) => {
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
                      
                      <h4 className="font-semibold text-gray-900 mb-2">{tool.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                      
                      {tool.shortcut && (
                        <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md inline-block">
                          {tool.shortcut}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Investigation Templates */}
      {(searchQuery === '' || filteredTemplates.length > 0) && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Start Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.title}
                  onClick={template.action}
                  className={`card p-4 text-left hover:shadow-md transition-all duration-200 group ${template.color}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-6 h-6 text-gray-600" />
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{template.title}</h4>
                  <p className="text-xs text-gray-600">{template.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Investigations */}
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
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No investigations yet</p>
                <p className="text-sm text-gray-400 mb-4">Start your first OSINT investigation to see it here</p>
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
                  <div key={investigation.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <Search className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {investigation.targetName || 'Untitled Investigation'}
                      </h4>
                      <p className="text-sm text-gray-600 truncate">
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

        {/* Enhanced Tips & Shortcuts */}
        <div className="space-y-6">
          {/* OSINT Tips */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">Pro Tips</h3>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-medium text-blue-900 text-sm mb-1">Exact Name Matching</h4>
                <p className="text-xs text-blue-700">Use quotes around names: "John Smith"</p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <h4 className="font-medium text-green-900 text-sm mb-1">Add Context</h4>
                <p className="text-xs text-green-700">Combine with location: "John" "Seattle"</p>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                <h4 className="font-medium text-purple-900 text-sm mb-1">Exclude Noise</h4>
                <p className="text-xs text-purple-700">Remove irrelevant: "John" -football</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => setCurrentView('osint-tools')}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-700">Run OSINT Tools</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
              
              <button 
                onClick={() => setCurrentView('link-scanner')}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Link className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">Scan Links</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
              
              <button 
                onClick={() => setCurrentView('profile-analyzer')}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Analyze Profile</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">OSINT Tools</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Link Scanner</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Browser Engine</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
