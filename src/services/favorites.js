// Favorites Management Service
// Handles storing and retrieving user's favorite OSINT tools and investigation templates

class FavoritesService {
  constructor() {
    this.storageKey = 'infoscope_favorites';
    this.localStorageKey = 'infoscope_local_favorites';
  }

  // Get all favorites for a user
  async getFavorites(userId = null) {
    try {
      // Try to get from Firebase if user is logged in
      if (userId) {
        // TODO: Implement Firebase favorites sync
        // For now, fall back to local storage
      }
      
      // Get from local storage
      const localFavorites = localStorage.getItem(this.localStorageKey);
      return localFavorites ? JSON.parse(localFavorites) : this.getDefaultFavorites();
    } catch (error) {
      console.error('Error getting favorites:', error);
      return this.getDefaultFavorites();
    }
  }

  // Save favorites
  async saveFavorites(favorites, userId = null) {
    try {
      // Save to local storage
      localStorage.setItem(this.localStorageKey, JSON.stringify(favorites));
      
      // TODO: Sync to Firebase if user is logged in
      if (userId) {
        // Implement Firebase sync
      }
      
      return true;
    } catch (error) {
      console.error('Error saving favorites:', error);
      return false;
    }
  }

  // Add a tool to favorites
  async addFavorite(item, userId = null) {
    try {
      const favorites = await this.getFavorites(userId);
      
      // Check if already exists
      const exists = favorites.some(fav => fav.id === item.id && fav.type === item.type);
      if (exists) {
        return favorites;
      }
      
      const newFavorite = {
        ...item,
        dateAdded: new Date().toISOString(),
        id: item.id || this.generateId(),
        type: item.type || 'tool' // 'tool', 'template', 'search'
      };
      
      const updatedFavorites = [...favorites, newFavorite];
      await this.saveFavorites(updatedFavorites, userId);
      return updatedFavorites;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return await this.getFavorites(userId);
    }
  }

  // Remove a tool from favorites
  async removeFavorite(itemId, itemType, userId = null) {
    try {
      const favorites = await this.getFavorites(userId);
      const updatedFavorites = favorites.filter(fav => !(fav.id === itemId && fav.type === itemType));
      await this.saveFavorites(updatedFavorites, userId);
      return updatedFavorites;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return await this.getFavorites(userId);
    }
  }

  // Check if an item is favorited
  async isFavorited(itemId, itemType, userId = null) {
    try {
      const favorites = await this.getFavorites(userId);
      return favorites.some(fav => fav.id === itemId && fav.type === itemType);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }

  // Get favorites by type
  async getFavoritesByType(type, userId = null) {
    try {
      const favorites = await this.getFavorites(userId);
      return favorites.filter(fav => fav.type === type);
    } catch (error) {
      console.error('Error getting favorites by type:', error);
      return [];
    }
  }

  // Get recently added favorites
  async getRecentFavorites(limit = 5, userId = null) {
    try {
      const favorites = await this.getFavorites(userId);
      return favorites
        .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recent favorites:', error);
      return [];
    }
  }

  // Export favorites
  async exportFavorites(userId = null) {
    try {
      const favorites = await this.getFavorites(userId);
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        favorites: favorites
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `infoscope-favorites-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error exporting favorites:', error);
      return false;
    }
  }

  // Import favorites
  async importFavorites(file, userId = null, mergeMode = false) {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (!importData.favorites || !Array.isArray(importData.favorites)) {
        throw new Error('Invalid favorites file format');
      }
      
      let finalFavorites;
      if (mergeMode) {
        const currentFavorites = await this.getFavorites(userId);
        // Merge, avoiding duplicates
        const merged = [...currentFavorites];
        importData.favorites.forEach(importedFav => {
          const exists = merged.some(fav => fav.id === importedFav.id && fav.type === importedFav.type);
          if (!exists) {
            merged.push({
              ...importedFav,
              dateAdded: importedFav.dateAdded || new Date().toISOString()
            });
          }
        });
        finalFavorites = merged;
      } else {
        // Replace all favorites
        finalFavorites = importData.favorites.map(fav => ({
          ...fav,
          dateAdded: fav.dateAdded || new Date().toISOString()
        }));
      }
      
      await this.saveFavorites(finalFavorites, userId);
      return finalFavorites;
    } catch (error) {
      console.error('Error importing favorites:', error);
      throw error;
    }
  }

  // Get default favorites (pre-populated)
  getDefaultFavorites() {
    return [
      {
        id: 'google-search',
        type: 'tool',
        name: 'Google Search',
        description: 'Advanced Google search with custom operators',
        category: 'Search Engines',
        url: 'https://www.google.com',
        icon: '🔍',
        dateAdded: new Date().toISOString(),
        isDefault: true
      },
      {
        id: 'whois-lookup',
        type: 'tool',
        name: 'WHOIS Lookup',
        description: 'Domain registration information',
        category: 'Domain Analysis',
        url: 'https://whois.net',
        icon: '🌐',
        dateAdded: new Date().toISOString(),
        isDefault: true
      },
      {
        id: 'shodan',
        type: 'tool',
        name: 'Shodan',
        description: 'Search engine for Internet-connected devices',
        category: 'Network Intelligence',
        url: 'https://www.shodan.io',
        icon: '🔌',
        dateAdded: new Date().toISOString(),
        isDefault: true
      },
      {
        id: 'social-media-template',
        type: 'template',
        name: 'Social Media Investigation',
        description: 'Template for investigating social media profiles',
        category: 'Investigation Templates',
        template: {
          title: 'Social Media Profile Investigation',
          steps: [
            'Profile verification and authentication',
            'Content analysis and timeline review',
            'Network analysis of connections',
            'Cross-platform correlation'
          ]
        },
        dateAdded: new Date().toISOString(),
        isDefault: true
      }
    ];
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Clear all favorites (with confirmation)
  async clearAllFavorites(userId = null, keepDefaults = false) {
    try {
      const favorites = keepDefaults ? this.getDefaultFavorites() : [];
      await this.saveFavorites(favorites, userId);
      return favorites;
    } catch (error) {
      console.error('Error clearing favorites:', error);
      return await this.getFavorites(userId);
    }
  }

  // Get favorites statistics
  async getFavoritesStats(userId = null) {
    try {
      const favorites = await this.getFavorites(userId);
      const stats = {
        total: favorites.length,
        byType: {},
        byCategory: {},
        recentlyAdded: 0
      };

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      favorites.forEach(fav => {
        // Count by type
        stats.byType[fav.type] = (stats.byType[fav.type] || 0) + 1;
        
        // Count by category
        if (fav.category) {
          stats.byCategory[fav.category] = (stats.byCategory[fav.category] || 0) + 1;
        }
        
        // Count recently added
        if (new Date(fav.dateAdded) > oneWeekAgo) {
          stats.recentlyAdded++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting favorites stats:', error);
      return { total: 0, byType: {}, byCategory: {}, recentlyAdded: 0 };
    }
  }
}

// Export singleton instance
export const favoritesService = new FavoritesService();
export default favoritesService;