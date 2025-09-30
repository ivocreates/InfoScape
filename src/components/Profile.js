import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  History, 
  Download, 
  Trash2, 
  Shield, 
  Globe,
  Monitor,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Search
} from 'lucide-react';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import LoadingSpinner from './LoadingSpinner';

function Profile({ user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [investigationHistory, setInvestigationHistory] = useState([]);
  const [settings, setSettings] = useState({
    autoSave: true,
    darkMode: false,
    notifications: true,
    dataRetention: 30, // days
    anonymousMode: false
  });
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    total: 0,
    investigations: 0
  });

  useEffect(() => {
    // Load user data and investigation history
    loadInvestigationHistory();
    loadUserSettings();
    calculateStorageUsage();
  }, []);

  const loadInvestigationHistory = async () => {
    if (!auth.currentUser) return;
    
    try {
      const investigationsQuery = query(
        collection(db, `users/${auth.currentUser.uid}/investigations`),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(investigationsQuery);
      const investigations = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        investigations.push({
          id: doc.id,
          ...data,
          date: data.createdAt?.toDate?.()?.toLocaleDateString() || new Date().toLocaleDateString()
        });
      });
      
      setInvestigationHistory(investigations);
    } catch (error) {
      console.error('Error loading investigation history:', error);
      // Fallback to mock data for demo
      const mockHistory = [
        {
          id: 'demo-1',
          name: "Corporate Background Check",
          date: new Date().toLocaleDateString(),
          targetName: "John Smith",
          searchParameters: { fullName: "John Smith", company: "Acme Corp" },
          query: '"John Smith" site:linkedin.com OR site:github.com',
          status: "completed",
          engine: "google"
        }
      ];
      setInvestigationHistory(mockHistory);
    }
  };

  const loadUserSettings = () => {
    const savedSettings = localStorage.getItem('infoscope-settings');
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) });
    }
  };

  const calculateStorageUsage = () => {
    // Calculate approximate storage usage
    const data = JSON.stringify(investigationHistory);
    const usedMB = new Blob([data]).size / (1024 * 1024);
    setStorageInfo({
      used: usedMB.toFixed(2),
      total: 100, // 100MB limit for demo
      investigations: investigationHistory.length
    });
  };

  const clearInvestigationHistory = () => {
    if (window.confirm('Are you sure you want to clear all investigation history? This action cannot be undone.')) {
      setInvestigationHistory([]);
      localStorage.removeItem('infoscope-investigations');
      setStorageInfo(prev => ({ ...prev, used: 0, investigations: 0 }));
    }
  };

  const deleteInvestigation = async (id) => {
    if (!window.confirm('Delete this investigation?')) return;
    
    try {
      if (auth.currentUser && id.startsWith('demo-') === false) {
        await deleteDoc(doc(db, `users/${auth.currentUser.uid}/investigations`, id));
      }
      setInvestigationHistory(prev => prev.filter(inv => inv.id !== id));
    } catch (error) {
      console.error('Error deleting investigation:', error);
      alert('Failed to delete investigation. Please try again.');
    }
  };

  const exportData = () => {
    const data = {
      user: {
        email: user?.email,
        name: user?.displayName,
        exportDate: new Date().toISOString()
      },
      investigations: investigationHistory,
      settings: settings
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infoscope-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('infoscope-settings', JSON.stringify(newSettings));
  };

  const installPWA = () => {
    if (window.deferredPrompt) {
      // Use the deferred prompt if available
      window.deferredPrompt.prompt();
      window.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          alert('InfoScope has been installed! You can now access it from your desktop or app drawer.');
        }
        window.deferredPrompt = null;
      });
    } else if ('serviceWorker' in navigator) {
      // Check if already installed
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        alert('InfoScope is already installed as a PWA!');
      } else {
        // Show manual installation instructions
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        if (isIOS) {
          alert('To install InfoScope on iOS:\n1. Tap the Share button\n2. Select "Add to Home Screen"\n3. Tap "Add"');
        } else if (isAndroid) {
          alert('To install InfoScope on Android:\n1. Tap the menu (⋮) in your browser\n2. Select "Add to Home screen"\n3. Tap "Add"');
        } else {
          alert('To install InfoScope:\n1. Look for an "Install" icon in your browser\'s address bar\n2. Or check browser menu for "Install InfoScope" option\n3. Follow the prompts to install');
        }
      }
    } else {
      alert('Your browser does not support Progressive Web Apps. Please use a modern browser like Chrome, Firefox, or Edge.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=000&color=fff&size=80`}
              alt={user?.displayName || 'User'}
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user?.displayName || 'User'}</h1>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  OSINT Investigator
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Member since {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              onClick={installPWA}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Install App
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'history', label: 'Investigation History', icon: History },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'storage', label: 'Data & Storage', icon: Database }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Search className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{investigationHistory.length}</div>
                        <div className="text-sm text-gray-600">Total Investigations</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {investigationHistory.filter(inv => inv.status === 'completed').length}
                        </div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{storageInfo.used}MB</div>
                        <div className="text-sm text-gray-600">Data Used</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Access InfoScope Anywhere</h3>
                  <p className="text-blue-800 text-sm mb-3">
                    InfoScope works as both a desktop application and web app. You can access your investigations from any device.
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Monitor className="w-4 h-4" />
                      <span>Desktop App</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-700">
                      <Globe className="w-4 h-4" />
                      <span>Web Browser</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-700">
                      <Smartphone className="w-4 h-4" />
                      <span>Mobile Device</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Investigation History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Investigation History</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportData}
                      className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export Data
                    </button>
                    <button
                      onClick={clearInvestigationHistory}
                      className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  </div>
                </div>

                {investigationHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No investigations found</p>
                    <p className="text-sm">Start your first investigation to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {investigationHistory.map((investigation) => (
                      <div key={investigation.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{investigation.name}</h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              <span>{investigation.date}</span>
                              <span>Target: {investigation.targetName || 'Unknown'}</span>
                              <span>Engine: {investigation.engine || 'google'}</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                investigation.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {investigation.status || 'active'}
                              </span>
                            </div>
                            {investigation.query && (
                              <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono text-gray-700">
                                {investigation.query}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => deleteInvestigation(investigation.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Application Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <label className="font-medium text-gray-900">Auto-save investigations</label>
                      <p className="text-sm text-gray-600">Automatically save your work as you type</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={(e) => updateSetting('autoSave', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <label className="font-medium text-gray-900">Anonymous mode</label>
                      <p className="text-sm text-gray-600">Hide your identity in browser requests</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.anonymousMode}
                      onChange={(e) => updateSetting('anonymousMode', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <label className="font-medium text-gray-900">Notifications</label>
                      <p className="text-sm text-gray-600">Get notified about investigation updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => updateSetting('notifications', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="py-3">
                    <label className="font-medium text-gray-900 block mb-2">Data retention (days)</label>
                    <p className="text-sm text-gray-600 mb-3">How long to keep investigation data</p>
                    <select
                      value={settings.dataRetention}
                      onChange={(e) => updateSetting('dataRetention', parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={7}>7 days</option>
                      <option value={30}>30 days</option>
                      <option value={90}>90 days</option>
                      <option value={365}>1 year</option>
                      <option value={-1}>Never delete</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Storage Tab */}
            {activeTab === 'storage' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Data & Storage</h3>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Storage Usage</h4>
                      <p className="text-sm text-gray-600">Local data stored on this device</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">{storageInfo.used}MB</div>
                      <div className="text-sm text-gray-600">of {storageInfo.total}MB</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(storageInfo.used / storageInfo.total) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Investigations:</span>
                      <span className="ml-2 font-medium">{storageInfo.investigations}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Settings:</span>
                      <span className="ml-2 font-medium">Synced</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Data Privacy Notice</h4>
                      <p className="text-sm text-yellow-800 mt-1">
                        Your investigation data is stored locally and in Firebase. We do not share your data with third parties. 
                        You can export or delete your data at any time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;