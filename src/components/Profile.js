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
  Search,
  Edit2,
  Save,
  X,
  Plus,
  Bookmark,
  ExternalLink,
  FileText,
  Image,
  Link,
  MessageSquare,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../firebase';
import LoadingSpinner from './LoadingSpinner';
import PremiumStorage from './PremiumStorage';
import FeedbackForm from './FeedbackForm';
import { useTheme } from '../contexts/ThemeContext';

function Profile({ user }) {
  const { isDarkMode, setIsDarkMode, themePreference, setThemePreference } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [investigationHistory, setInvestigationHistory] = useState([]);
  const [savedPages, setSavedPages] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPremiumStorage, setShowPremiumStorage] = useState(false);
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    bio: '',
    organization: '',
    location: '',
    website: '',
    customPhotoURL: ''
  });
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [newPage, setNewPage] = useState({
    title: '',
    url: '',
    description: '',
    category: 'investigation'
  });
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
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
    investigations: 0,
    savedPages: 0
  });

  useEffect(() => {
    // Load user data and investigation history
    loadInvestigationHistory();
    loadSavedPages();
    loadUserSettings();
    calculateStorageUsage();
    loadProfileData();
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
      investigations: investigationHistory.length,
      savedPages: savedPages.length
    });
  };

  const loadProfileData = async () => {
    if (!auth.currentUser) return;
    
    try {
      // Try to load extended profile data from Firestore
      const profileQuery = query(
        collection(db, `users/${auth.currentUser.uid}/profile`),
        where('type', '==', 'extended')
      );
      const snapshot = await getDocs(profileQuery);
      
      if (!snapshot.empty) {
        const profileDoc = snapshot.docs[0].data();
        setProfileData(prev => ({
          ...prev,
          ...profileDoc
        }));
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const loadSavedPages = async () => {
    if (!auth.currentUser) return;
    
    try {
      const pagesQuery = query(
        collection(db, `users/${auth.currentUser.uid}/savedPages`),
        orderBy('savedAt', 'desc')
      );
      const snapshot = await getDocs(pagesQuery);
      const pages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        savedAt: doc.data().savedAt?.toDate?.() || new Date()
      }));
      setSavedPages(pages);
    } catch (error) {
      console.error('Error loading saved pages:', error);
    }
  };

  const saveProfileData = async () => {
    if (!auth.currentUser) return;
    
    try {
      // Update Firebase Auth profile
      const updateData = {
        displayName: profileData.displayName
      };
      
      // Add photoURL if custom photo is provided
      if (profileData.customPhotoURL) {
        updateData.photoURL = profileData.customPhotoURL;
      }
      
      await updateProfile(auth.currentUser, updateData);

      // Save extended profile data to Firestore
      await addDoc(collection(db, `users/${auth.currentUser.uid}/profile`), {
        ...profileData,
        type: 'extended',
        updatedAt: serverTimestamp()
      });

      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const getGoogleProfilePicture = (email) => {
    if (!email) return null;
    // Try to get Gravatar image based on email
    const emailHash = btoa(email.toLowerCase().trim());
    return `https://www.gravatar.com/avatar/${emailHash}?s=200&d=404`;
  };

  const handleProfilePictureChange = (newPhotoURL) => {
    setProfileData(prev => ({ ...prev, customPhotoURL: newPhotoURL }));
    setShowProfilePictureModal(false);
  };

  const getCurrentProfilePicture = () => {
    // Priority: Custom URL > User's current photoURL > Google/Gravatar > UI Avatar fallback
    if (profileData.customPhotoURL) return profileData.customPhotoURL;
    if (user?.photoURL) return user.photoURL;
    
    const gravatarUrl = getGoogleProfilePicture(user?.email);
    if (gravatarUrl) return gravatarUrl;
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=4F46E5&color=fff&size=200`;
  };

  const savePage = async () => {
    if (!auth.currentUser || !newPage.title || !newPage.url) return;
    
    try {
      await addDoc(collection(db, `users/${auth.currentUser.uid}/savedPages`), {
        ...newPage,
        savedAt: serverTimestamp(),
        userId: auth.currentUser.uid
      });

      await loadSavedPages(); // Refresh the list
      setShowAddPageModal(false);
      setNewPage({ title: '', url: '', description: '', category: 'investigation' });
      alert('Page saved successfully!');
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Failed to save page. Please try again.');
    }
  };

  const deletePage = async (pageId) => {
    if (!auth.currentUser) return;
    
    try {
      await deleteDoc(doc(db, `users/${auth.currentUser.uid}/savedPages`, pageId));
      await loadSavedPages(); // Refresh the list
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Failed to delete page. Please try again.');
    }
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Profile Editing */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-4">
            {/* Enhanced Profile Picture */}
            <div className="relative group">
              <img
                src={getCurrentProfilePicture()}
                alt={user?.displayName || 'User'}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 group-hover:border-blue-500 transition-colors"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=4F46E5&color=fff&size=200`;
                }}
              />
              {isEditingProfile && (
                <button
                  onClick={() => setShowProfilePictureModal(true)}
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
            <div className="flex-1">
              {isEditingProfile ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Display Name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={profileData.title}
                    onChange={(e) => setProfileData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Professional Title"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Bio"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveProfileData}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-900">{profileData.displayName || user?.displayName || 'User'}</h1>
                  <p className="text-gray-600">{user?.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      {profileData.title || 'OSINT Investigator'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Member since {new Date().toLocaleDateString()}
                    </span>
                  </div>
                  {profileData.bio && (
                    <p className="text-gray-700 mt-2">{profileData.bio}</p>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-2">
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
              <button
                onClick={() => setShowFeedbackForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Send Feedback
              </button>
              <button
                onClick={installPWA}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-600">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'saved', label: `Saved Pages (${savedPages.length})`, icon: Bookmark },
              { id: 'history', label: 'Investigation History', icon: History },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'storage', label: 'Data & Storage', icon: Database }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{investigationHistory.length}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Investigations</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Bookmark className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{savedPages.length}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Saved Pages</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-yellow-600" />
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

            {/* Saved Pages Tab */}
            {activeTab === 'saved' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Saved Pages</h3>
                  <button
                    onClick={() => setShowAddPageModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Save New Page
                  </button>
                </div>
                
                {savedPages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No saved pages yet</p>
                    <p className="text-sm">Save important pages from your investigations for quick access later</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {savedPages.map(page => (
                      <div key={page.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {page.category === 'investigation' && <Search className="w-4 h-4 text-blue-600" />}
                              {page.category === 'resource' && <FileText className="w-4 h-4 text-green-600" />}
                              {page.category === 'evidence' && <Image className="w-4 h-4 text-purple-600" />}
                              {page.category === 'reference' && <Bookmark className="w-4 h-4 text-yellow-600" />}
                              <h4 className="font-medium text-gray-900">{page.title}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                page.category === 'investigation' ? 'bg-blue-100 text-blue-800' :
                                page.category === 'resource' ? 'bg-green-100 text-green-800' :
                                page.category === 'evidence' ? 'bg-purple-100 text-purple-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {page.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1 font-mono">{page.url}</p>
                            {page.description && (
                              <p className="text-sm text-gray-700 mb-2">{page.description}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              Saved on {page.savedAt.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <a
                              href={page.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => deletePage(page.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Application Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <label className="font-medium text-gray-900 dark:text-white">Auto-save investigations</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Automatically save your work as you type</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={(e) => updateSetting('autoSave', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <label className="font-medium text-gray-900 dark:text-white">Anonymous mode</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Hide your identity in browser requests</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.anonymousMode}
                      onChange={(e) => updateSetting('anonymousMode', e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <label className="font-medium text-gray-900 dark:text-white">Notifications</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Get notified about investigation updates</p>
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
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Investigations:</span>
                      <span className="ml-2 font-medium">{storageInfo.investigations}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Saved Pages:</span>
                      <span className="ml-2 font-medium">{storageInfo.savedPages || savedPages.length}</span>
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

                {/* Premium Storage Upgrade */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="w-5 h-5" />
                        <h4 className="font-semibold">Need More Storage?</h4>
                      </div>
                      <p className="text-blue-100 mb-4">
                        Upgrade to premium for more storage, advanced features, and priority support.
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Up to 10GB storage</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Advanced analytics</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Team collaboration</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPremiumStorage(true)}
                      className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                      <Database className="w-4 h-4" />
                      View Plans
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Page Modal */}
      {showAddPageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Save New Page</h3>
              <button
                onClick={() => setShowAddPageModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                <input
                  type="text"
                  placeholder="Enter page title"
                  value={newPage.title}
                  onChange={(e) => setNewPage(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page URL</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={newPage.url}
                  onChange={(e) => setNewPage(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  placeholder="Brief description of the page"
                  value={newPage.description}
                  onChange={(e) => setNewPage(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newPage.category}
                  onChange={(e) => setNewPage(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="investigation">Investigation</option>
                  <option value="resource">Resource</option>
                  <option value="evidence">Evidence</option>
                  <option value="reference">Reference</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={savePage}
                disabled={!newPage.title || !newPage.url}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Save Page
              </button>
              <button
                onClick={() => setShowAddPageModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Picture Modal */}
      {showProfilePictureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Update Profile Picture</h3>
              <button
                onClick={() => setShowProfilePictureModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Current Picture Preview */}
              <div className="text-center">
                <img
                  src={getCurrentProfilePicture()}
                  alt="Current profile"
                  className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-gray-200"
                />
                <p className="text-sm text-gray-600 mt-2">Current Picture</p>
              </div>
              
              {/* Custom URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Picture URL
                </label>
                <input
                  type="url"
                  value={profileData.customPhotoURL}
                  onChange={(e) => setProfileData(prev => ({ ...prev, customPhotoURL: e.target.value }))}
                  placeholder="https://example.com/your-picture.jpg"
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a direct link to your profile picture
                </p>
              </div>
              
              {/* Google/Gravatar Option */}
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <img
                    src={getGoogleProfilePicture(user?.email)}
                    alt="Google profile"
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Use Gravatar Picture</p>
                    <p className="text-xs text-gray-600">Based on your email: {user?.email}</p>
                  </div>
                  <button
                    onClick={() => handleProfilePictureChange(getGoogleProfilePicture(user?.email))}
                    className="ml-auto px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Use This
                  </button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleProfilePictureChange('')}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Use Default
                </button>
                <button
                  onClick={() => setShowProfilePictureModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Storage Modal */}
      <PremiumStorage
        user={user}
        currentUsage={parseFloat(storageInfo.used)}
        isOpen={showPremiumStorage}
        onClose={() => setShowPremiumStorage(false)}
      />

      {/* Feedback Form Modal */}
      <FeedbackForm
        isOpen={showFeedbackForm}
        onClose={() => setShowFeedbackForm(false)}
      />
    </div>
  );
}

export default Profile;