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
  LogOut,
  Crown,
  Zap,
  Mail,
  Users,
  Lock,
  Star
} from 'lucide-react';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth, storage } from '../firebase';
import LoadingSpinner from './LoadingSpinner';
import PremiumStorage from './PremiumStorage';
import FeedbackForm from './FeedbackForm';
import SubscriptionPlans from './SubscriptionPlans';
import { useTheme } from '../contexts/ThemeContext';
import { useBrowserAlert } from '../hooks/useBrowserAlert';

function Profile({ user, setCurrentView }) {
  const { isDarkMode, setIsDarkMode, themePreference, setThemePreference } = useTheme();
  const { showInfo, showSuccess, showWarning, showError } = useBrowserAlert();
  const [activeTab, setActiveTab] = useState('overview');
  const [investigationHistory, setInvestigationHistory] = useState([]);
  const [savedPages, setSavedPages] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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
    anonymousMode: false,
    aiTips: {
      enabled: true,
      frequency: 'weekly', // daily, weekly, disabled
      categories: ['security', 'investigation', 'tools', 'privacy', 'tips'],
      level: 'beginner', // beginner, intermediate, advanced
      agent: 'basic' // basic (free), expert, cyber, researcher (premium)
    }
  });
  const [userSubscription, setUserSubscription] = useState(null);
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
    loadFavorites();
    loadUserSettings();
    calculateStorageUsage();
    loadProfileData();
    loadUserSubscription();
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
      const parsedSettings = JSON.parse(savedSettings);
      // Ensure AI tips settings have default values
      const mergedSettings = {
        ...settings,
        ...parsedSettings,
        aiTips: {
          enabled: true,
          frequency: 'weekly',
          categories: ['security', 'investigation', 'tools', 'privacy', 'tips'],
          level: 'beginner',
          agent: 'basic',
          ...parsedSettings.aiTips
        }
      };
      setSettings(mergedSettings);
      
      // Sync AI tips settings with the service
      if (mergedSettings.aiTips) {
        try {
          import('../services/aiTipsService').then(module => {
            const aiTipsService = module.default;
            aiTipsService.updateSettings(mergedSettings.aiTips);
          }).catch(error => {
            console.error('Failed to sync AI tips settings:', error);
          });
        } catch (error) {
          console.error('Error importing AI tips service:', error);
        }
      }
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

  const loadUserSubscription = async () => {
    try {
      // Import subscription service dynamically to avoid issues
      const subscriptionModule = await import('../services/subscriptionService');
      const subscription = await subscriptionModule.default.getCurrentSubscription();
      setUserSubscription(subscription);
    } catch (error) {
      console.error('Failed to load user subscription:', error);
      setUserSubscription({ plan: 'free' });
    }
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

  const loadFavorites = async () => {
    try {
      // Load from localStorage first
      const localFavorites = JSON.parse(localStorage.getItem('infoscope_favorites') || '[]');
      setFavorites(localFavorites);

      // If user is authenticated, try to sync with Firebase
      if (auth.currentUser) {
        try {
          const favoritesQuery = query(
            collection(db, `users/${auth.currentUser.uid}/favorites`),
            orderBy('addedAt', 'desc')
          );
          const snapshot = await getDocs(favoritesQuery);
          const cloudFavorites = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            addedAt: doc.data().addedAt?.toDate?.()?.toISOString() || new Date().toISOString()
          }));

          // Merge cloud and local favorites, preferring cloud data
          if (cloudFavorites.length > 0) {
            setFavorites(cloudFavorites);
            localStorage.setItem('infoscope_favorites', JSON.stringify(cloudFavorites));
          } else if (localFavorites.length > 0) {
            // Upload local favorites to cloud
            await syncFavoritesToCloud(localFavorites);
          }
        } catch (error) {
          console.warn('Cloud favorites sync failed, using local data:', error);
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  };

  const syncFavoritesToCloud = async (favoritesToSync) => {
    if (!auth.currentUser || !favoritesToSync.length) return;

    try {
      // Upload each favorite to Firebase
      for (const favorite of favoritesToSync) {
        await addDoc(collection(db, `users/${auth.currentUser.uid}/favorites`), {
          ...favorite,
          addedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error syncing favorites to cloud:', error);
    }
  };

  const addToFavorites = async (tool) => {
    try {
      const currentFavorites = JSON.parse(localStorage.getItem('infoscope_favorites') || '[]');
      const isAlreadyFavorite = currentFavorites.some(fav => fav.name === tool.name);
      
      if (!isAlreadyFavorite) {
        const newFavorite = {
          ...tool,
          addedAt: new Date().toISOString()
        };
        const newFavorites = [...currentFavorites, newFavorite];
        
        // Update localStorage
        localStorage.setItem('infoscope_favorites', JSON.stringify(newFavorites));
        setFavorites(newFavorites);
        
        // Sync to cloud if authenticated
        if (auth.currentUser) {
          try {
            await addDoc(collection(db, `users/${auth.currentUser.uid}/favorites`), {
              ...newFavorite,
              addedAt: serverTimestamp()
            });
          } catch (error) {
            console.warn('Failed to sync favorite to cloud:', error);
          }
        }
        
        showSuccess(`${tool.name} added to favorites!`);
      } else {
        showInfo(`${tool.name} is already in your favorites.`);
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      showError('Failed to add to favorites.');
    }
  };

  const removeFromFavorites = async (toolName) => {
    try {
      const currentFavorites = JSON.parse(localStorage.getItem('infoscope_favorites') || '[]');
      const newFavorites = currentFavorites.filter(fav => fav.name !== toolName);
      
      // Update localStorage
      localStorage.setItem('infoscope_favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
      
      // Remove from cloud if authenticated
      if (auth.currentUser) {
        try {
          const favoritesQuery = query(
            collection(db, `users/${auth.currentUser.uid}/favorites`),
            where('name', '==', toolName)
          );
          const snapshot = await getDocs(favoritesQuery);
          snapshot.docs.forEach(async (doc) => {
            await deleteDoc(doc.ref);
          });
        } catch (error) {
          console.warn('Failed to remove favorite from cloud:', error);
        }
      }
      
      showSuccess('Tool removed from favorites!');
    } catch (error) {
      console.error('Error removing from favorites:', error);
      showError('Failed to remove from favorites.');
    }
  };

  const isFavorite = (toolName) => {
    return favorites.some(fav => fav.name === toolName);
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file.');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('Image size must be less than 5MB.');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfileImage = async () => {
    if (!imageFile || !auth.currentUser) {
      showError('Please select an image and ensure you are signed in.');
      return;
    }

    setUploadingImage(true);
    try {
      // Create a unique filename
      const fileName = `profile_${auth.currentUser.uid}_${Date.now()}.${imageFile.name.split('.').pop()}`;
      const imageRef = ref(storage, `profile-images/${fileName}`);

      // Upload image
      const snapshot = await uploadBytes(imageRef, imageFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update user profile with new photo URL
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL
      });

      // Update profile data state
      setProfileData(prev => ({
        ...prev,
        customPhotoURL: downloadURL
      }));

      // Save to Firestore
      await addDoc(collection(db, `users/${auth.currentUser.uid}/profile`), {
        photoURL: downloadURL,
        uploadedAt: serverTimestamp(),
        type: 'profile_image'
      });

      // Clear upload state
      setImageFile(null);
      setImagePreview(null);
      setShowProfilePictureModal(false);
      
      showSuccess('Profile image updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      showError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const useGoogleAvatar = async () => {
    if (!auth.currentUser) return;

    try {
      // Get Google avatar URL from user's profile
      const googlePhotoURL = auth.currentUser.providerData
        .find(provider => provider.providerId === 'google.com')?.photoURL;

      if (googlePhotoURL) {
        await updateProfile(auth.currentUser, {
          photoURL: googlePhotoURL
        });

        setProfileData(prev => ({
          ...prev,
          customPhotoURL: googlePhotoURL
        }));

        await addDoc(collection(db, `users/${auth.currentUser.uid}/profile`), {
          photoURL: googlePhotoURL,
          source: 'google',
          updatedAt: serverTimestamp(),
          type: 'profile_image'
        });

        setShowProfilePictureModal(false);
        showSuccess('Google avatar applied successfully!');
      } else {
        showWarning('Google avatar not available. Please upload a custom image.');
      }
    } catch (error) {
      console.error('Error setting Google avatar:', error);
      showError('Failed to set Google avatar.');
    }
  };

  const removeProfileImage = async () => {
    if (!auth.currentUser) return;

    try {
      // Update user profile to remove photo
      await updateProfile(auth.currentUser, {
        photoURL: null
      });

      // Update profile data state
      setProfileData(prev => ({
        ...prev,
        customPhotoURL: ''
      }));

      // Save removal to Firestore
      await addDoc(collection(db, `users/${auth.currentUser.uid}/profile`), {
        photoURL: null,
        action: 'removed',
        updatedAt: serverTimestamp(),
        type: 'profile_image'
      });

      setShowProfilePictureModal(false);
      showSuccess('Profile image removed successfully!');
    } catch (error) {
      console.error('Error removing profile image:', error);
      showError('Failed to remove profile image.');
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
    
    // Sync AI tips settings with the service
    if (key === 'aiTips') {
      try {
        import('../services/aiTipsService').then(module => {
          const aiTipsService = module.default;
          aiTipsService.updateSettings(value);
        }).catch(error => {
          console.error('Failed to update AI tips settings:', error);
        });
      } catch (error) {
        console.error('Error importing AI tips service:', error);
      }
    }
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
              { id: 'favorites', label: `Favorite Tools (${JSON.parse(localStorage.getItem('infoscope_favorites') || '[]').length})`, icon: Star },
              { id: 'history', label: 'Investigation History', icon: History },
              { id: 'subscription', label: 'Subscription', icon: Crown },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'storage', label: 'Data & Storage', icon: Database },
              { id: 'export', label: 'Export Data', icon: Download }
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

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Star className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Favorite OSINT Tools
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Quick access to your most-used OSINT tools and resources. Mark tools as favorites for easy access.
                  </p>
                </div>

                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Favorite Tools Yet</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Visit the OSINT Tools section and click the star icon to add tools to your favorites.
                    </p>
                    <button
                      onClick={() => setCurrentView('tools')}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Browse OSINT Tools
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((tool, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-105">
                        <div className={`h-2 ${tool.color || 'bg-purple-600'}`}></div>
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {tool.icon && React.createElement(tool.icon, {
                                className: "w-8 h-8 text-gray-700 dark:text-gray-300"
                              })}
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                                  {tool.name}
                                </h4>
                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                  {tool.category}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromFavorites(tool.name)}
                              className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Remove from favorites"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            {tool.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {tool.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {tool.rating}
                                  </span>
                                </div>
                              )}
                              {tool.free && (
                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                                  Free
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {tool.url && tool.url.startsWith('http') && (
                                <a
                                  href={tool.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Open
                                </a>
                              )}
                              {tool.url && tool.url.startsWith('builtin:') && (
                                <button
                                  onClick={() => {
                                    setCurrentView('tools');
                                    // You could add logic here to navigate to the specific built-in tool
                                  }}
                                  className="flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                                >
                                  <Settings className="w-4 h-4" />
                                  Use Tool
                                </button>
                              )}
                            </div>
                          </div>

                          {tool.addedAt && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Added {new Date(tool.addedAt).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {favorites.length > 0 && (
                  <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-3">
                      <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                        Managing Your Favorites
                      </h4>
                    </div>
                    <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <p>• Visit the OSINT Tools section to discover and favorite new tools</p>
                      <p>• Click the star icon next to any tool to add it to your favorites</p>
                      <p>• Your favorites are synced across devices when signed in</p>
                      <p>• Use favorites for quick access to your most-used investigation tools</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div className="text-center">
                  <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Subscription & Premium Features
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Unlock advanced OSINT capabilities and professional export features for just ₹49/month. 
                    Core tools remain completely free forever.
                  </p>
                </div>

                {/* Current Plan Status */}
                <div className={`p-6 rounded-xl border-2 ${
                  userSubscription?.plan && userSubscription.plan !== 'free'
                    ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-600'
                    : 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {userSubscription?.plan && userSubscription.plan !== 'free' ? (
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      ) : (
                        <Crown className="w-8 h-8 text-gray-400" />
                      )}
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                          {userSubscription?.plan && userSubscription.plan !== 'free' ? 'Premium Plan' : 'Free Plan'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {userSubscription?.plan && userSubscription.plan !== 'free' 
                            ? 'You have access to all premium features' 
                            : 'Basic OSINT tools with limited exports'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userSubscription?.plan && userSubscription.plan !== 'free' ? '₹49' : '₹0'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">/month</div>
                    </div>
                  </div>
                  
                  {userSubscription?.plan && userSubscription.plan !== 'free' ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        ✓ Premium active • Next billing: {userSubscription.nextBilling || 'Unknown'}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
                      >
                        <Crown className="w-4 h-4" />
                        Upgrade to Premium
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Subscription Plans Inline */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Choose Your Plan</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Free Plan */}
                    <div className={`p-4 rounded-lg border-2 transition-all ${
                      (!userSubscription?.plan || userSubscription.plan === 'free')
                        ? 'border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-white">👤</span>
                        </div>
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Free Plan</h5>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">₹0</div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Forever free</p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                          <li>✓ All basic OSINT tools</li>
                          <li>✓ 10MB cloud storage</li>
                          <li>✓ Basic exports (JSON only)</li>
                          <li>✓ Community support</li>
                        </ul>
                      </div>
                    </div>

                    {/* Premium Plan */}
                    <div className={`p-4 rounded-lg border-2 transition-all ${
                      userSubscription?.plan && userSubscription.plan !== 'free'
                        ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-600'
                        : 'border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600'
                    }`}>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Premium Plan</h5>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">₹49</div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">per month</p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                          <li>✓ Advanced OSINT tools</li>
                          <li>✓ 50MB cloud storage</li>
                          <li>✓ Professional exports (PDF, DOC, CSV)</li>
                          <li>✓ Priority support</li>
                          <li>✓ Early access features</li>
                        </ul>
                        {(!userSubscription?.plan || userSubscription.plan === 'free') && (
                          <button
                            onClick={() => {
                              // Trigger subscription upgrade
                              import('../services/subscriptionService').then(module => {
                                module.default.initiatePurchase('premium');
                              });
                            }}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                          >
                            Upgrade Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Tools Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        Advanced Intelligence Tools
                        {userSubscription?.plan && userSubscription.plan !== 'free' ? (
                          <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium px-2 py-1 rounded-full">
                            UNLOCKED
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-medium px-2 py-1 rounded-full">
                            PREMIUM ONLY
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Professional-grade OSINT investigation tools with API integrations, advanced analytics, and comprehensive export capabilities.
                      </p>
                      
                      {/* Tools Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {[
                          { 
                            name: 'IP Intelligence', 
                            icon: Globe, 
                            features: ['Advanced GeoLocation', 'Threat Intelligence', 'ISP & ASN Details', 'Historical Data'],
                            status: userSubscription?.plan && userSubscription.plan !== 'free' ? 'unlocked' : 'locked'
                          },
                          { 
                            name: 'Email Investigation', 
                            icon: Mail, 
                            features: ['Domain Reputation', 'Breach Detection', 'Social Media Links', 'Validation Status'],
                            status: userSubscription?.plan && userSubscription.plan !== 'free' ? 'unlocked' : 'locked'
                          },
                          { 
                            name: 'Domain Research', 
                            icon: Database, 
                            features: ['WHOIS Analysis', 'DNS Records', 'Security Scanning', 'Certificate Details'],
                            status: userSubscription?.plan && userSubscription.plan !== 'free' ? 'unlocked' : 'locked'
                          },
                          { 
                            name: 'Social Media Intel', 
                            icon: Users, 
                            features: ['Multi-Platform Search', 'Profile Analysis', 'Network Mapping', 'Content Analysis'],
                            status: userSubscription?.plan && userSubscription.plan !== 'free' ? 'unlocked' : 'locked'
                          }
                        ].map((tool) => (
                          <div 
                            key={tool.name}
                            className={`p-4 rounded-lg border transition-all duration-200 ${
                              tool.status === 'unlocked'
                                ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 cursor-pointer hover:shadow-md'
                                : 'border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20'
                            }`}
                            onClick={() => {
                              if (tool.status === 'unlocked') {
                                setCurrentView('advanced-osint');
                              }
                            }}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <tool.icon className={`w-5 h-5 ${
                                tool.status === 'unlocked' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                              }`} />
                              <span className="font-medium text-gray-900 dark:text-white text-sm">{tool.name}</span>
                              {tool.status === 'unlocked' ? (
                                <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                              ) : (
                                <Lock className="w-4 h-4 text-amber-500 ml-auto" />
                              )}
                            </div>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              {tool.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-1">
                                  {tool.status === 'unlocked' ? '✓' : '•'} {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Access Button */}
                      {userSubscription?.plan && userSubscription.plan !== 'free' ? (
                        <button
                          onClick={() => setCurrentView('advanced-osint')}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <Zap className="w-4 h-4" />
                          Access Advanced Tools Now
                        </button>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Unlock these powerful intelligence tools for just ₹49/month
                          </p>
                          <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
                          >
                            <Crown className="w-4 h-4" />
                            Upgrade Now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Export Features Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        Professional Export Features
                        {userSubscription?.plan && userSubscription.plan !== 'free' ? (
                          <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium px-2 py-1 rounded-full">
                            INCLUDED
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-medium px-2 py-1 rounded-full">
                            ₹49/MONTH
                          </span>
                        )}
                      </h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                        <li className="flex items-center gap-2">
                          {userSubscription?.plan && userSubscription.plan !== 'free' ? '✓' : '•'}
                          <span>Professional PDF reports with custom templates</span>
                        </li>
                        <li className="flex items-center gap-2">
                          {userSubscription?.plan && userSubscription.plan !== 'free' ? '✓' : '•'}
                          <span>Excel/CSV exports with advanced data organization</span>
                        </li>
                        <li className="flex items-center gap-2">
                          {userSubscription?.plan && userSubscription.plan !== 'free' ? '✓' : '•'}
                          <span>Word documents with investigation summaries</span>
                        </li>
                        <li className="flex items-center gap-2">
                          {userSubscription?.plan && userSubscription.plan !== 'free' ? '✓' : '•'}
                          <span>Enhanced cloud storage (10GB vs 1GB)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          {userSubscription?.plan && userSubscription.plan !== 'free' ? '✓' : '•'}
                          <span>Priority support and early feature access</span>
                        </li>
                      </ul>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        All core OSINT tools remain completely free forever!
                      </p>
                    </div>
                  </div>
                </div>
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

                  {/* AI Tips Settings */}
                  <div className="py-4 px-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-base">AI-Powered Tips</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Customize your OSINT learning experience</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Enable/Disable AI Tips */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="mb-2 sm:mb-0">
                          <label className="font-medium text-gray-900 dark:text-white">Enable AI Tips</label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Receive personalized OSINT tips and insights</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.aiTips.enabled}
                          onChange={(e) => updateSetting('aiTips', { ...settings.aiTips, enabled: e.target.checked })}
                          className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 dark:focus:ring-purple-400 bg-white dark:bg-gray-700"
                        />
                      </div>

                      {/* Frequency Setting */}
                      {settings.aiTips.enabled && (
                        <div>
                          <label className="font-medium text-gray-900 dark:text-white block mb-2">Tip Frequency</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {[
                              { value: 'daily', label: 'Daily', desc: 'Get tips every day' },
                              { value: 'weekly', label: 'Weekly', desc: 'Get tips weekly' },
                              { value: 'disabled', label: 'Manual', desc: 'Only when requested' }
                            ].map((freq) => (
                              <div
                                key={freq.value}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                  settings.aiTips.frequency === freq.value
                                    ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/30 dark:border-purple-400'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                }`}
                                onClick={() => updateSetting('aiTips', { ...settings.aiTips, frequency: freq.value })}
                              >
                                <div className="font-medium text-gray-900 dark:text-white text-sm">{freq.label}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">{freq.desc}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Experience Level */}
                      {settings.aiTips.enabled && (
                        <div>
                          <label className="font-medium text-gray-900 dark:text-white block mb-2">Experience Level</label>
                          <select
                            value={settings.aiTips.level}
                            onChange={(e) => updateSetting('aiTips', { ...settings.aiTips, level: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="beginner">Beginner - Basic OSINT concepts</option>
                            <option value="intermediate">Intermediate - Advanced techniques</option>
                            <option value="advanced">Advanced - Expert-level insights</option>
                          </select>
                        </div>
                      )}

                      {/* AI Agent Selection */}
                      {settings.aiTips.enabled && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="font-medium text-gray-900 dark:text-white">AI Agent</label>
                            {!userSubscription?.isActive && (
                              <span className="text-xs px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-medium">
                                Premium Feature
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            {/* Basic Agent - Free */}
                            <div
                              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                settings.aiTips.agent === 'basic'
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                              onClick={() => updateSetting('aiTips', { ...settings.aiTips, agent: 'basic' })}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">🤖</span>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white text-sm">Basic Agent</div>
                                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">FREE</div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                General OSINT tips and basic guidance for beginners
                              </div>
                            </div>

                            {/* Expert Agent - Premium */}
                            <div
                              className={`p-4 rounded-lg border cursor-pointer transition-all relative ${
                                !userSubscription?.isActive 
                                  ? 'opacity-60 cursor-not-allowed' 
                                  : settings.aiTips.agent === 'expert'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                              onClick={() => {
                                if (userSubscription?.isActive) {
                                  updateSetting('aiTips', { ...settings.aiTips, agent: 'expert' });
                                } else {
                                  // Show upgrade prompt
                                  showWarning(
                                    'Premium Feature Required',
                                    'Expert Agent is only available for Premium subscribers. Upgrade to access advanced AI agents with professional OSINT guidance!',
                                    {
                                      confirmText: 'Upgrade Now',
                                      cancelText: 'Maybe Later',
                                      onConfirm: () => setActiveSection('subscription')
                                    }
                                  );
                                }
                              }}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">🎯</span>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white text-sm">Expert Agent</div>
                                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">PREMIUM</div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Advanced techniques, tool recommendations, and professional methodologies
                              </div>
                              {!userSubscription?.isActive && (
                                <div className="absolute inset-0 bg-gray-900/10 dark:bg-gray-100/10 rounded-lg flex items-center justify-center">
                                  <Lock className="w-6 h-6 text-gray-500" />
                                </div>
                              )}
                            </div>

                            {/* Cyber Agent - Premium */}
                            <div
                              className={`p-4 rounded-lg border cursor-pointer transition-all relative ${
                                !userSubscription?.isActive 
                                  ? 'opacity-60 cursor-not-allowed' 
                                  : settings.aiTips.agent === 'cyber'
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                              onClick={() => {
                                if (userSubscription?.isActive) {
                                  updateSetting('aiTips', { ...settings.aiTips, agent: 'cyber' });
                                } else {
                                  showWarning(
                                    'Premium Feature Required',
                                    'Cyber Agent is only available for Premium subscribers. This agent specializes in cybersecurity OSINT and threat intelligence!',
                                    {
                                      confirmText: 'Upgrade Now',
                                      cancelText: 'Maybe Later',
                                      onConfirm: () => setActiveSection('subscription')
                                    }
                                  );
                                }
                              }}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">🛡️</span>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white text-sm">Cyber Agent</div>
                                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">PREMIUM</div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Cybersecurity-focused OSINT, threat intelligence, and digital forensics
                              </div>
                              {!userSubscription?.isActive && (
                                <div className="absolute inset-0 bg-gray-900/10 dark:bg-gray-100/10 rounded-lg flex items-center justify-center">
                                  <Lock className="w-6 h-6 text-gray-500" />
                                </div>
                              )}
                            </div>

                            {/* Researcher Agent - Premium */}
                            <div
                              className={`p-4 rounded-lg border cursor-pointer transition-all relative ${
                                !userSubscription?.isActive 
                                  ? 'opacity-60 cursor-not-allowed' 
                                  : settings.aiTips.agent === 'researcher'
                                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-400'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                              onClick={() => {
                                if (userSubscription?.isActive) {
                                  updateSetting('aiTips', { ...settings.aiTips, agent: 'researcher' });
                                } else {
                                  showWarning(
                                    'Premium Feature Required',
                                    'Researcher Agent is only available for Premium subscribers. This agent focuses on academic research methods and scholarly investigation!',
                                    {
                                      confirmText: 'Upgrade Now',
                                      cancelText: 'Maybe Later',
                                      onConfirm: () => setActiveSection('subscription')
                                    }
                                  );
                                }
                              }}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">🔬</span>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white text-sm">Researcher Agent</div>
                                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">PREMIUM</div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Academic research methods, data verification, and scholarly investigation
                              </div>
                              {!userSubscription?.isActive && (
                                <div className="absolute inset-0 bg-gray-900/10 dark:bg-gray-100/10 rounded-lg flex items-center justify-center">
                                  <Lock className="w-6 h-6 text-gray-500" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Agent Description */}
                          <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Current Agent:</strong> 
                              {settings.aiTips.agent === 'basic' && " Basic Agent provides foundational OSINT tips and general guidance suitable for beginners."}
                              {settings.aiTips.agent === 'expert' && " Expert Agent offers advanced technical guidance, tool recommendations, and professional methodologies."}
                              {settings.aiTips.agent === 'cyber' && " Cyber Agent specializes in cybersecurity OSINT, threat intelligence, and digital forensics techniques."}
                              {settings.aiTips.agent === 'researcher' && " Researcher Agent focuses on academic research methods, data verification, and scholarly investigation approaches."}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Category Preferences */}
                      {settings.aiTips.enabled && (
                        <div>
                          <label className="font-medium text-gray-900 dark:text-white block mb-3">Tip Categories</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                              { value: 'security', label: 'Security', icon: '🛡️', desc: 'OPSEC & Safety' },
                              { value: 'investigation', label: 'Investigation', icon: '🔍', desc: 'Research Methods' },
                              { value: 'tools', label: 'Tools', icon: '🔧', desc: 'OSINT Tools' },
                              { value: 'privacy', label: 'Privacy', icon: '🔒', desc: 'Digital Privacy' },
                              { value: 'tips', label: 'General Tips', icon: '💡', desc: 'Best Practices' }
                            ].map((category) => (
                              <div
                                key={category.value}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                  settings.aiTips.categories.includes(category.value)
                                    ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/30 dark:border-purple-400'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                }`}
                                onClick={() => {
                                  const newCategories = settings.aiTips.categories.includes(category.value)
                                    ? settings.aiTips.categories.filter(c => c !== category.value)
                                    : [...settings.aiTips.categories, category.value];
                                  updateSetting('aiTips', { ...settings.aiTips, categories: newCategories });
                                }}
                              >
                                <div className="text-center">
                                  <div className="text-lg mb-1">{category.icon}</div>
                                  <div className="font-medium text-gray-900 dark:text-white text-sm">{category.label}</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">{category.desc}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Tips Preview */}
                      {settings.aiTips.enabled && (
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Preview:</span>
                            <button
                              onClick={() => {
                                // Trigger a test tip with current agent
                                try {
                                  import('../services/aiTipsService').then(module => {
                                    const aiTipsService = module.default;
                                    aiTipsService.updateSettings(settings.aiTips);
                                    const tip = aiTipsService.generateTip();
                                    
                                    // Get agent name for display
                                    const agentNames = {
                                      basic: 'Basic Agent 🤖',
                                      expert: 'Expert Agent 🎯',
                                      cyber: 'Cyber Agent 🛡️',
                                      researcher: 'Researcher Agent 🔬'
                                    };
                                    
                                    showInfo(
                                      `${agentNames[settings.aiTips.agent]} - Sample Tip`,
                                      `Category: ${tip.category}\n\n${tip.content}`,
                                      { autoClose: 8000 }
                                    );
                                  }).catch(error => {
                                    // Fallback with agent-specific sample
                                    const agentSamples = {
                                      basic: "Remember to always verify information from multiple sources before drawing conclusions in your OSINT investigations.",
                                      expert: "Use advanced Google dorks like 'site:linkedin.com intitle:\"software engineer\" location:\"San Francisco\"' to find specific professionals in your target research.",
                                      cyber: "When investigating cyber threats, always use virtual machines and VPNs to maintain operational security and protect your investigation infrastructure.",
                                      researcher: "Apply academic research principles: document your methodology, maintain source citations, and establish clear evidence chains for all your OSINT findings."
                                    };
                                    
                                    const agentNames = {
                                      basic: 'Basic Agent 🤖',
                                      expert: 'Expert Agent 🎯',
                                      cyber: 'Cyber Agent 🛡️',
                                      researcher: 'Researcher Agent 🔬'
                                    };
                                    
                                    showInfo(
                                      `${agentNames[settings.aiTips.agent]} - Sample Tip`,
                                      agentSamples[settings.aiTips.agent],
                                      { autoClose: 8000 }
                                    );
                                  });
                                } catch (error) {
                                  showInfo(
                                    'Sample AI Tip',
                                    'Use multiple OSINT sources to verify information accuracy and build comprehensive intelligence profiles.',
                                    { autoClose: 6000 }
                                  );
                                }
                              }}
                              className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                            >
                              Test {settings.aiTips.agent.charAt(0).toUpperCase() + settings.aiTips.agent.slice(1)} Agent
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            You'll receive {settings.aiTips.frequency === 'daily' ? 'daily' : settings.aiTips.frequency === 'weekly' ? 'weekly' : 'manual'} AI-generated tips 
                            from your <strong>{settings.aiTips.agent.charAt(0).toUpperCase() + settings.aiTips.agent.slice(1)} Agent</strong>, 
                            focusing on {settings.aiTips.categories.length > 0 ? settings.aiTips.categories.join(', ') : 'all categories'} 
                            at {settings.aiTips.level} level.
                          </p>
                        </div>
                      )}

                      {/* Premium Upgrade Prompt */}
                      {settings.aiTips.enabled && !userSubscription?.isActive && (
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Unlock Premium AI Agents</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Upgrade to Premium for access to Expert, Cyber, and Researcher AI agents with advanced OSINT guidance and real AI-powered tips.
                          </p>
                          <button
                            onClick={() => setActiveSection('subscription')}
                            className="text-xs px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all font-medium"
                          >
                            Upgrade to Premium - ₹49/month
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Storage Tab */}
            {activeTab === 'storage' && (
              <div className="space-y-6">
                <div className="text-center">
                  <Database className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Data & Storage Management</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Monitor your data usage, manage storage limits, and access premium storage features.
                  </p>
                </div>
                
                {/* Current Plan Storage */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        userSubscription?.plan && userSubscription.plan !== 'free' 
                          ? 'bg-purple-100 dark:bg-purple-900/30' 
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <Database className={`w-5 h-5 ${
                          userSubscription?.plan && userSubscription.plan !== 'free' 
                            ? 'text-purple-600 dark:text-purple-400' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {userSubscription?.plan && userSubscription.plan !== 'free' ? 'Premium Storage' : 'Free Storage'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {userSubscription?.plan && userSubscription.plan !== 'free' 
                            ? 'Enhanced storage with advanced features' 
                            : 'Local device storage with basic features'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {storageInfo.used}MB
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        of {userSubscription?.plan && userSubscription.plan !== 'free' ? '50MB' : '10MB'} total
                      </div>
                    </div>
                  </div>
                  
                  {/* Usage Progress Bar */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Storage Usage</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {Math.round((storageInfo.used / (userSubscription?.plan && userSubscription.plan !== 'free' ? 50 : 10)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          Math.round((storageInfo.used / (userSubscription?.plan && userSubscription.plan !== 'free' ? 10240 : 1024)) * 100) > 80
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : Math.round((storageInfo.used / (userSubscription?.plan && userSubscription.plan !== 'free' ? 10240 : 1024)) * 100) > 60
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600'
                        }`}
                        style={{ 
                          width: `${Math.min(100, (storageInfo.used / (userSubscription?.plan && userSubscription.plan !== 'free' ? 10240 : 1024)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Storage Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Investigations</span>
                      </div>
                      <div className="text-xl font-bold text-blue-900 dark:text-blue-100">{storageInfo.investigations}</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">Active cases</div>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Bookmark className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">Saved Pages</span>
                      </div>
                      <div className="text-xl font-bold text-green-900 dark:text-green-100">{savedPages.length}</div>
                      <div className="text-xs text-green-600 dark:text-green-400">Bookmarked</div>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Favorites</span>
                      </div>
                      <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
                        {JSON.parse(localStorage.getItem('infoscope_favorites') || '[]').length}
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">Tools & Resources</div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Sync Status</span>
                      </div>
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">✓</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Cloud synced</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={exportData}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Export All Data
                    </button>
                    <button
                      onClick={clearInvestigationHistory}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear Data
                    </button>
                    {(!userSubscription?.plan || userSubscription.plan === 'free') && (
                      <button
                        onClick={() => setActiveTab('subscription')}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors font-medium"
                      >
                        <Crown className="w-4 h-4" />
                        Upgrade Storage
                      </button>
                    )}
                  </div>
                </div>

                {/* Data Privacy & Security */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Data Privacy & Security</h4>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                        <li>• Investigation data stored locally and encrypted in Firebase</li>
                        <li>• No data sharing with third parties or external services</li>
                        <li>• Full data export available anytime in multiple formats</li>
                        <li>• Automatic data deletion available with account closure</li>
                        <li>• GDPR compliant data handling and user rights protection</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Storage Upgrade Benefits */}
                {(!userSubscription?.plan || userSubscription.plan === 'free') && (
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-xl p-6 text-white">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Database className="w-5 h-5" />
                          <h4 className="font-bold text-lg">Premium Storage Benefits</h4>
                        </div>
                        <p className="text-blue-100 dark:text-blue-200 mb-4 leading-relaxed">
                          Upgrade to Premium for enhanced storage, advanced features, and professional tools.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            <span>50MB cloud storage (vs 10MB)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            <span>Advanced export formats</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            <span>Premium OSINT tools access</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            <span>Priority AI assistance</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('subscription')}
                        className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Crown className="w-4 h-4" />
                        Upgrade Now - ₹49/month
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Data Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="text-center">
            <Download className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Export Your Data</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Download your investigation data, saved pages, and settings in various formats.
            </p>
          </div>

          {/* Export Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Investigation Data Export */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Investigation History</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{investigationHistory.length} investigations</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Export all your investigation data including search queries, timestamps, and results.
              </p>
              <button
                onClick={() => {
                  const data = {
                    investigations: investigationHistory,
                    exportDate: new Date().toISOString(),
                    userEmail: user?.email
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `infoscope-investigations-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  showSuccess('Export Complete', 'Investigation data exported successfully!');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Export as JSON
              </button>
            </div>

            {/* Saved Pages Export */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Saved Pages</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{savedPages.length} saved pages</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Export your bookmarked pages and resources with descriptions and categories.
              </p>
              <button
                onClick={() => {
                  const data = {
                    savedPages: savedPages,
                    exportDate: new Date().toISOString(),
                    userEmail: user?.email
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `infoscope-saved-pages-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  showSuccess('Export Complete', 'Saved pages exported successfully!');
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Export as JSON
              </button>
            </div>

            {/* Settings Export */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Settings & Preferences</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">All configurations</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Export your app settings, preferences, and AI tips configuration.
              </p>
              <button
                onClick={() => {
                  const data = {
                    settings: settings,
                    profileData: profileData,
                    exportDate: new Date().toISOString(),
                    userEmail: user?.email
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `infoscope-settings-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  showSuccess('Export Complete', 'Settings exported successfully!');
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Export as JSON
              </button>
            </div>

            {/* Complete Data Export */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Complete Export</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">All data in one file</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Export everything: investigations, saved pages, settings, and profile data.
              </p>
              <button
                onClick={() => {
                  const data = {
                    investigations: investigationHistory,
                    savedPages: savedPages,
                    settings: settings,
                    profileData: profileData,
                    storageInfo: storageInfo,
                    exportDate: new Date().toISOString(),
                    userEmail: user?.email,
                    version: '2.3.0'
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `infoscope-complete-export-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  showSuccess('Export Complete', 'Complete data export finished successfully!');
                }}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Export Everything
              </button>
            </div>
          </div>

          {/* Export Notes */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900 dark:text-amber-300 mb-1">Export Information</h4>
                <ul className="text-sm text-amber-800 dark:text-amber-400 space-y-1">
                  <li>• Exported data is in JSON format for easy import/backup</li>
                  <li>• Files include timestamps and user identification</li>
                  <li>• Data remains private and is only stored locally on your device</li>
                  <li>• You can import this data to restore your InfoScope settings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Enhanced Profile Picture Modal */}
      {showProfilePictureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Update Profile Picture</h3>
              <button
                onClick={() => {
                  setShowProfilePictureModal(false);
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Current Picture Preview */}
              <div className="text-center">
                <img
                  src={imagePreview || getCurrentProfilePicture()}
                  alt="Profile preview"
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-200 dark:border-gray-600 shadow-lg"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {imagePreview ? 'Preview' : 'Current Picture'}
                </p>
              </div>
              
              {/* Upload from Device */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload from Device</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Choose a photo from your computer (Max 5MB, JPG/PNG)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="imageUpload"
                />
                <label
                  htmlFor="imageUpload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Choose Image
                </label>
                {imageFile && (
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <span className="text-sm text-green-600 dark:text-green-400">
                      {imageFile.name} selected
                    </span>
                    <button
                      onClick={uploadProfileImage}
                      disabled={uploadingImage}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      {uploadingImage ? (
                        <>
                          <LoadingSpinner size={16} />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Upload
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              
              {/* Google Avatar Option */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-yellow-500 flex items-center justify-center text-white font-bold text-xl">
                    G
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Use Google Avatar</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Your Google profile picture from {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={useGoogleAvatar}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Use Google
                  </button>
                </div>
              </div>
              
              {/* Custom URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Or use a custom URL
                </label>
                <input
                  type="url"
                  value={profileData.customPhotoURL}
                  onChange={(e) => setProfileData(prev => ({ ...prev, customPhotoURL: e.target.value }))}
                  placeholder="https://example.com/your-picture.jpg"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter a direct link to your profile picture
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={removeProfileImage}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Remove Picture
                </button>
                <button
                  onClick={() => {
                    if (profileData.customPhotoURL) {
                      handleProfilePictureChange(profileData.customPhotoURL);
                    }
                    setShowProfilePictureModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save Changes
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