import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import favoritesService from '../services/favorites';

const StarButton = ({ 
  item, 
  user, 
  size = 'md', 
  showLabel = false, 
  className = '',
  onToggle = null 
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Size configurations
  const sizeConfig = {
    sm: {
      icon: 'w-3 h-3',
      button: 'p-1',
      text: 'text-xs'
    },
    md: {
      icon: 'w-4 h-4',
      button: 'p-2',
      text: 'text-sm'
    },
    lg: {
      icon: 'w-5 h-5',
      button: 'p-2',
      text: 'text-base'
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  useEffect(() => {
    checkFavoriteStatus();
  }, [item, user]);

  const checkFavoriteStatus = async () => {
    if (!item || !item.id) return;
    
    try {
      const favorited = await favoritesService.isFavorited(item.id, item.type || 'tool', user?.uid);
      setIsFavorited(favorited);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!item || !item.id) return;
    
    setIsLoading(true);
    try {
      if (isFavorited) {
        await favoritesService.removeFavorite(item.id, item.type || 'tool', user?.uid);
        setIsFavorited(false);
      } else {
        await favoritesService.addFavorite({
          id: item.id,
          type: item.type || 'tool',
          name: item.name || item.title || 'Unnamed Item',
          description: item.description || '',
          category: item.category || 'Uncategorized',
          url: item.url || item.href || '',
          icon: item.icon || '⭐',
          ...item
        }, user?.uid);
        setIsFavorited(true);
      }
      
      // Call onToggle callback if provided
      if (onToggle) {
        onToggle(isFavorited);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonClass = () => {
    const baseClass = `${config.button} rounded-lg transition-all duration-200 hover:scale-105 ${className}`;
    
    if (isFavorited) {
      return `${baseClass} text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50`;
    } else {
      return `${baseClass} text-gray-400 hover:text-yellow-500 hover:bg-yellow-50`;
    }
  };

  const getStarClass = () => {
    const baseClass = `${config.icon} transition-all duration-200`;
    
    if (isLoading) {
      return `${baseClass} animate-pulse`;
    } else if (isFavorited) {
      return `${baseClass} fill-current`;
    } else {
      return baseClass;
    }
  };

  if (showLabel) {
    return (
      <button
        onClick={handleToggleFavorite}
        disabled={isLoading}
        className={`inline-flex items-center gap-2 ${getButtonClass()} disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star className={getStarClass()} />
        <span className={`${config.text} font-medium`}>
          {isFavorited ? 'Favorited' : 'Add to Favorites'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`${getButtonClass()} disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star className={getStarClass()} />
    </button>
  );
};

export default StarButton;