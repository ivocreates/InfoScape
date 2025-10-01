import React from 'react';
import BrowserAlert from './BrowserAlert';
import { useBrowserAlert } from '../hooks/useBrowserAlert';

const BrowserAlertContainer = () => {
  const { alerts, hideAlert } = useBrowserAlert();

  return (
    <>
      {alerts.map(alert => (
        <BrowserAlert
          key={alert.id}
          isOpen={alert.isOpen}
          onClose={() => hideAlert(alert.id)}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          confirmText={alert.confirmText}
          cancelText={alert.cancelText}
          onConfirm={alert.onConfirm}
          onCancel={alert.onCancel}
          autoClose={alert.autoClose}
        />
      ))}
    </>
  );
};

export default BrowserAlertContainer;