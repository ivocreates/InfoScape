import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

const BrowserAlert = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'info', 'success', 'warning', 'error'
  confirmText = 'OK',
  cancelText = null,
  onConfirm = null,
  onCancel = null,
  autoClose = null // Auto close after X milliseconds
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      // Auto close if specified
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoClose);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [isOpen, autoClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200); // Wait for animation to complete
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    handleClose();
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-700',
          iconColor: 'text-green-600 dark:text-green-400',
          titleColor: 'text-green-900 dark:text-green-300',
          buttonColor: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-700',
          iconColor: 'text-amber-600 dark:text-amber-400',
          titleColor: 'text-amber-900 dark:text-amber-300',
          buttonColor: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600'
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-700',
          iconColor: 'text-red-600 dark:text-red-400',
          titleColor: 'text-red-900 dark:text-red-300',
          buttonColor: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
        };
      default: // info
        return {
          icon: Info,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-700',
          iconColor: 'text-blue-600 dark:text-blue-400',
          titleColor: 'text-blue-900 dark:text-blue-300',
          buttonColor: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Alert Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl border ${config.borderColor} max-w-md w-full transform transition-all duration-200 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Header */}
          <div className={`${config.bgColor} rounded-t-xl p-6 border-b ${config.borderColor}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${config.bgColor}`}>
                <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-lg ${config.titleColor}`}>
                  {title}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 pt-0">
            {cancelText && (
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`${cancelText ? 'flex-1' : 'w-full'} px-4 py-2 text-white ${config.buttonColor} rounded-lg transition-colors font-medium`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BrowserAlert;