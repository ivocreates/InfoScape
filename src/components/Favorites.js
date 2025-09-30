import React, { useState, useEffect } from 'react';
import {
  Star,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  ExternalLink,
  Grid3X3,
  List,
  Clock,
  Tag,
  Plus,
  X,
  Settings,
  Heart,
  BookOpen,
  Globe,
  Zap,
  Shield,
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import favoritesService from '../services/favorites';
import { useTheme } from '../contexts/ThemeContext';

const Favorites = ({ user, isOpen, onClose }) => {
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('dateAdded'); // 'dateAdded', 'name', 'type'
  const [showImportModal, setShowImportModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, byType: {}, byCategory: {}, recentlyAdded: 0 });
  const { theme } = useTheme();

  // Load favorites on component mount
  useEffect(() => {
    loadFavorites();
    loadStats();
  }, [user]);

  // Filter and sort favorites when criteria change
  useEffect(() => {
    filterAndSortFavorites();
  }, [favorites, searchQuery, selectedType, selectedCategory, sortBy]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const userFavorites = await favoritesService.getFavorites(user?.uid);
      setFavorites(userFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const favStats = await favoritesService.getFavoritesStats(user?.uid);
      setStats(favStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filterAndSortFavorites = () => {
    let filtered = favorites;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(fav =>
        fav.name.toLowerCase().includes(query) ||
        fav.description.toLowerCase().includes(query) ||
        fav.category?.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(fav => fav.type === selectedType);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(fav => fav.category === selectedCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'dateAdded':
        default:
          return new Date(b.dateAdded) - new Date(a.dateAdded);
      }
    });

    setFilteredFavorites(filtered);
  };

  const handleRemoveFavorite = async (itemId, itemType) => {
    try {
      const updated = await favoritesService.removeFavorite(itemId, itemType, user?.uid);
      setFavorites(updated);
      loadStats();
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleExportFavorites = async () => {
    try {
      await favoritesService.exportFavorites(user?.uid);
    } catch (error) {
      console.error('Error exporting favorites:', error);
    }
  };

  const handleImportFavorites = async (file, mergeMode = false) => {
    try {
      const updated = await favoritesService.importFavorites(file, user?.uid, mergeMode);
      setFavorites(updated);
      loadStats();
      setShowImportModal(false);
    } catch (error) {
      console.error('Error importing favorites:', error);
      alert('Error importing favorites: ' + error.message);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all favorites? This action cannot be undone.')) {
      try {
        const updated = await favoritesService.clearAllFavorites(user?.uid, true);
        setFavorites(updated);
        loadStats();
      } catch (error) {
        console.error('Error clearing favorites:', error);
      }
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'tool':
        return <Zap className="w-4 h-4" />;
      case 'template':
        return <BookOpen className="w-4 h-4" />;
      case 'search':
        return <Search className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'tool':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      case 'template':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'search':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const handleOpenItem = (item) => {
    if (item.url) {
      window.open(item.url, '_blank');
    } else if (item.template) {
      // Handle template opening (could integrate with Investigation component)
      console.log('Opening template:', item.template);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Favorites</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">Quick access to your favorite OSINT tools and templates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="font-medium text-gray-900 dark:text-white">{stats.total}</span>
                <span className="text-gray-600 dark:text-gray-300">total favorites</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-gray-900 dark:text-white">{stats.recentlyAdded}</span>
                <span className="text-gray-600 dark:text-gray-300">added this week</span>
              </div>
              {stats.byType.tool && (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">{stats.byType.tool}</span>
                  <span className="text-gray-600 dark:text-gray-300">tools</span>
                </div>
              )}
              {stats.byType.template && (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-gray-900 dark:text-white">{stats.byType.template}</span>
                  <span className="text-gray-600 dark:text-gray-300">templates</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Export/Import */}
              <button
                onClick={handleExportFavorites}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
                title="Export favorites"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
                title="Import favorites"
              >
                <Upload className="w-4 h-4" />
              </button>
              
              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid' ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Grid view"
                >
                  <Grid3X3 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${
                    viewMode === 'list' ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="select-field text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="tool">Tools</option>
                <option value="template">Templates</option>
                <option value="search">Searches</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select-field text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              >
                <option value="dateAdded">Recently Added</option>
                <option value="name">Name A-Z</option>
                <option value="type">Type</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto popup-scrollbar">
          <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Loading favorites...</p>
              </div>
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery || selectedType !== 'all' ? 'No matches found' : 'No favorites yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {searchQuery || selectedType !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start adding tools and templates to your favorites for quick access'
                }
              </p>
              {!searchQuery && selectedType === 'all' && (
                <button
                  onClick={() => {/* Navigate to tools */}}
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Browse OSINT Tools
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {filteredFavorites.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className={`border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all duration-200 ${
                    viewMode === 'grid' ? 'p-4' : 'p-3 flex items-center gap-4'
                  }`}
                >
                  {viewMode === 'grid' ? (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {item.icon && <span className="text-lg">{item.icon}</span>}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getTypeColor(item.type)}`}>
                            {getTypeIcon(item.type)}
                            {item.type}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveFavorite(item.id, item.type)}
                          className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Remove from favorites"
                        >
                          <X className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400" />
                        </button>
                      </div>

                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{item.description}</p>
                      
                      {item.category && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <Tag className="w-3 h-3" />
                          {item.category}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(item.dateAdded).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleOpenItem(item)}
                          className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium"
                        >
                          Open
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {item.icon && <span className="text-lg flex-shrink-0">{item.icon}</span>}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getTypeColor(item.type)}`}>
                              {getTypeIcon(item.type)}
                              {item.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{item.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.category && (
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {item.category}
                              </span>
                            )}
                            <span>{new Date(item.dateAdded).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleOpenItem(item)}
                          className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                          title="Open"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveFavorite(item.id, item.type)}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remove from favorites"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Showing {filteredFavorites.length} of {favorites.length} favorites
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg max-w-md w-full m-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Favorites</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select favorites file (JSON)
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleImportFavorites(file, false);
                    }
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mergeMode"
                  onChange={(e) => {
                    const file = document.querySelector('input[type="file"]').files[0];
                    if (file) {
                      handleImportFavorites(file, e.target.checked);
                    }
                  }}
                />
                <label htmlFor="mergeMode" className="text-sm text-gray-700">
                  Merge with existing favorites (don't replace)
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;