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
  Laptop,
  LogOut
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header with Profile Editing */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Enhanced Profile Picture */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-1">
                <img
                  src={getCurrentProfilePicture()}
                  alt={user?.displayName || 'User'}
                  className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-700 group-hover:border-blue-500 dark:group-hover:border-blue-400 transition-colors"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=4F46E5&color=fff&size=200`;
                  }}
                />
              </div>
              {isEditingProfile && (
                <button
                  onClick={() => setShowProfilePictureModal(true)}
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              {isEditingProfile ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Display Name"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                  />
                  <input
                    type="text"
                    value={profileData.title}
                    onChange={(e) => setProfileData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Professional Title"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Professional Bio"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    rows="3"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={saveProfileData}
                      className="px-6 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="px-6 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      {profileData.displayName || user?.displayName || 'User'}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">{user?.email}</p>
                  </div>
                  <div className="flex items-center gap-6 mt-4 text-sm">
                    <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-medium">{profileData.title || 'OSINT Investigator'}</span>
                    </span>
                    <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="font-medium">Member since {new Date().toLocaleDateString()}</span>
                    </span>
                  </div>
                  {profileData.bio && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profileData.bio}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
              <button
                onClick={() => setShowFeedbackForm(true)}
                className="px-6 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-200 flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
              >
                <MessageSquare className="w-4 h-4" />
                Send Feedback
              </button>
              <button
                onClick={installPWA}
                className="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="px-6 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-200 flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-600 overflow-x-auto">
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
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500 dark:bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Search className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{investigationHistory.length}</div>
                        <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Investigations</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-6 border border-green-200 dark:border-green-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500 dark:bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Bookmark className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-900 dark:text-green-100">{savedPages.length}</div>
                        <div className="text-sm text-green-700 dark:text-green-300 font-medium">Saved Pages</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-yellow-500 dark:bg-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                          {investigationHistory.filter(inv => inv.status === 'completed').length}
                        </div>
                        <div className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Completed</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-500 dark:bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Database className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{storageInfo.used}MB</div>
                        <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Data Used</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
                  <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3 text-lg">Access InfoScope Anywhere</h3>
                  <p className="text-blue-800 dark:text-blue-200 text-sm mb-4 leading-relaxed">
                    InfoScope works as both a desktop application and web app. You can access your investigations from any device with seamless synchronization.
                  </p>
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
                        <Monitor className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">Desktop App</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
                        <Globe className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">Web Browser</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">Mobile Device</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Saved Pages Tab */}
            {activeTab === 'saved' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Saved Pages</h3>
                  <button
                    onClick={() => setShowAddPageModal(true)}
                    className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Save New Page
                  </button>
                </div>
                
                {savedPages.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Bookmark className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No saved pages yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">Save important pages from your investigations for quick access later. Build your personal knowledge base.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {savedPages.map(page => (
                      <div key={page.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                page.category === 'investigation' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                page.category === 'resource' ? 'bg-green-100 dark:bg-green-900/30' :
                                page.category === 'evidence' ? 'bg-purple-100 dark:bg-purple-900/30' :
                                'bg-yellow-100 dark:bg-yellow-900/30'
                              }`}>
                                {page.category === 'investigation' && <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                                {page.category === 'resource' && <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />}
                                {page.category === 'evidence' && <Image className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                                {page.category === 'reference' && <Bookmark className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />}
                              </div>
                              <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{page.title}</h4>
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                page.category === 'investigation' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                                page.category === 'resource' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                page.category === 'evidence' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
                                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              }`}>
                                {page.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-mono bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg">{page.url}</p>
                            {page.description && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{page.description}</p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Saved on {page.savedAt.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-6">
                            <a
                              href={page.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Open in new tab"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => deletePage(page.id)}
                              className="p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete page"
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
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Investigation History</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {investigationHistory.length} total investigations
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={exportData}
                      className="px-6 py-2 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200 flex items-center gap-2 font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Export Data
                    </button>
                    <button
                      onClick={clearInvestigationHistory}
                      className="px-6 py-2 text-red-600 dark:text-red-400 border border-red-600 dark:border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 flex items-center gap-2 font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  </div>
                </div>

                {investigationHistory.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                      <History className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No investigations found</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">Start your first investigation to see it here. All your research will be automatically tracked and saved.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {investigationHistory.map((investigation) => (
                      <div key={investigation.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
                        {/* Investigation Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h4 className="font-bold text-gray-900 dark:text-white text-lg">{investigation.name}</h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  investigation.status === 'completed' 
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                }`}>
                                  <CheckCircle className="w-3 h-3 inline mr-1" />
                                  {investigation.status === 'completed' ? 'Completed' : 'In Progress'}
                                </span>
                              </div>
                              
                              {/* Investigation Metadata */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                  <Clock className="w-4 h-4 text-blue-500" />
                                  <div>
                                    <p className="font-medium">Created</p>
                                    <p>{investigation.date}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                  <User className="w-4 h-4 text-green-500" />
                                  <div>
                                    <p className="font-medium">Target</p>
                                    <p className="text-gray-900 dark:text-white">{investigation.targetName || 'Anonymous'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                  <Search className="w-4 h-4 text-purple-500" />
                                  <div>
                                    <p className="font-medium">Search Engine</p>
                                    <p className="capitalize">{investigation.engine || 'Google'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-6">
                              <button
                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                title="View details"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              {investigation.status !== 'completed' && (
                                <button
                                  onClick={() => {
                                    const updatedHistory = investigationHistory.map(inv => 
                                      inv.id === investigation.id 
                                        ? { ...inv, status: 'completed', completedAt: new Date().toISOString() }
                                        : inv
                                    );
                                    setInvestigationHistory(updatedHistory);
                                    localStorage.setItem('investigationHistory', JSON.stringify(updatedHistory));
                                  }}
                                  className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                  title="Mark as completed"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteInvestigation(investigation.id)}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Delete investigation"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Investigation Details */}
                        <div className="p-6 space-y-4">
                          {/* Search Query */}
                          {investigation.query && (
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                Search Query
                              </h5>
                              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600">
                                <p className="text-sm font-mono text-gray-700 dark:text-gray-300 leading-relaxed break-all">
                                  {investigation.query}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Search Parameters */}
                          {investigation.searchParameters && (
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-gray-500" />
                                Search Parameters
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(investigation.searchParameters).map(([key, value]) => (
                                  <div key={key} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                    </p>
                                    <p className="text-sm text-gray-900 dark:text-white">{value}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Investigation Results Summary */}
                          {investigation.resultsCount !== undefined && (
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <Database className="w-4 h-4 text-gray-500" />
                                Results Summary
                              </h5>
                              <div className="flex items-center gap-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                    {investigation.resultsCount || 0}
                                  </p>
                                  <p className="text-xs text-blue-600 dark:text-blue-400">Results Found</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                    {investigation.linksScanned || 0}
                                  </p>
                                  <p className="text-xs text-green-600 dark:text-green-400">Links Scanned</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                    {investigation.profilesFound || 0}
                                  </p>
                                  <p className="text-xs text-purple-600 dark:text-purple-400">Profiles Found</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {investigation.notes && (
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-gray-500" />
                                Investigation Notes
                              </h5>
                              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <p className="text-sm text-gray-700 dark:text-gray-300">{investigation.notes}</p>
                              </div>
                            </div>
                          )}

                          {/* Tags */}
                          {investigation.tags && investigation.tags.length > 0 && (
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <Bookmark className="w-4 h-4 text-gray-500" />
                                Tags
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {investigation.tags.map((tag, index) => (
                                  <span key={index} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full font-medium">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Application Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="mb-3 sm:mb-0">
                      <label className="font-semibold text-gray-900 dark:text-white text-base">Auto-save investigations</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Automatically save your work as you type</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={(e) => updateSetting('autoSave', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="mb-3 sm:mb-0">
                      <label className="font-semibold text-gray-900 dark:text-white text-base">Anonymous mode</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Hide your identity in browser requests</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.anonymousMode}
                      onChange={(e) => updateSetting('anonymousMode', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="mb-3 sm:mb-0">
                      <label className="font-semibold text-gray-900 dark:text-white text-base">Notifications</label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Get notified about investigation updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => updateSetting('notifications', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700"
                    />
                  </div>

                  <div className="py-4 px-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <label className="font-semibold text-gray-900 dark:text-white text-base block mb-2">Data retention (days)</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">How long to keep investigation data</p>
                    <select
                      value={settings.dataRetention}
                      onChange={(e) => updateSetting('dataRetention', parseInt(e.target.value))}
                      className="w-full sm:w-auto px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Data & Storage</h3>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                    <div className="mb-4 sm:mb-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Storage Usage</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Local data stored on this device</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{storageInfo.used}MB</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">of {storageInfo.total}MB</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${(storageInfo.used / storageInfo.total) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex justify-between sm:flex-col sm:justify-start">
                      <span className="text-gray-600 dark:text-gray-400">Investigations:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{storageInfo.investigations}</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:justify-start">
                      <span className="text-gray-600 dark:text-gray-400">Saved Pages:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{storageInfo.savedPages || savedPages.length}</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:justify-start">
                      <span className="text-gray-600 dark:text-gray-400">Settings:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">Synced</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">Data Privacy Notice</h4>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-2 leading-relaxed">
                        Your investigation data is stored locally and in Firebase. We do not share your data with third parties. 
                        You can export or delete your data at any time.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Premium Storage Upgrade */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-xl p-6 text-white">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Database className="w-5 h-5" />
                        <h4 className="font-bold text-lg">Need More Storage?</h4>
                      </div>
                      <p className="text-blue-100 dark:text-blue-200 mb-4 leading-relaxed">
                        Upgrade to premium for more storage, advanced features, and priority support.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Up to 10GB storage</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Advanced analytics</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Team collaboration</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPremiumStorage(true)}
                      className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
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