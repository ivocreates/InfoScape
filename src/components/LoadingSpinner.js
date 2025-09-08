import React from 'react';

function LoadingSpinner({ size = 'default', className = '' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin`} />
    </div>
  );
}

export default LoadingSpinner;
