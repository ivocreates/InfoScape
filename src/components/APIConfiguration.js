import React, { useState, useEffect } from 'react';
import { Settings, Key, Eye, EyeOff, Save, AlertCircle, CheckCircle } from 'lucide-react';
import osintAPIService from '../services/osintAPIService';

function APIConfiguration() {
  const [apiKeys, setApiKeys] = useState({
    shodan: '',
    virustotal: '',
    hunter: '',
    haveibeenpwned: '',
    censys: '',
    securitytrails: ''
  });
  
  const [showKeys, setShowKeys] = useState({});
  const [saved, setSaved] = useState(false);
  const [apiStatus, setApiStatus] = useState({});

  useEffect(() => {
    // Load saved API keys from localStorage
    const savedKeys = {};
    Object.keys(apiKeys).forEach(service => {
      const saved = localStorage.getItem(`osint_api_${service}`);
      if (saved) {
        savedKeys[service] = saved;
      }
    });
    setApiKeys(prev => ({ ...prev, ...savedKeys }));
    
    // Get API status
    setApiStatus(osintAPIService.getAPIStatus());
  }, []);

  const handleApiKeyChange = (service, value) => {
    setApiKeys(prev => ({
      ...prev,
      [service]: value
    }));
  };

  const toggleShowKey = (service) => {
    setShowKeys(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  const saveConfiguration = () => {
    Object.entries(apiKeys).forEach(([service, key]) => {
      if (key.trim()) {
        localStorage.setItem(`osint_api_${service}`, key.trim());
        // Update the service instance
        osintAPIService.apiKeys[service] = key.trim();
      } else {
        localStorage.removeItem(`osint_api_${service}`);
        osintAPIService.apiKeys[service] = '';
      }
    });
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    
    // Update API status
    setApiStatus(osintAPIService.getAPIStatus());
  };

  const apiServices = [
    {
      name: 'shodan',
      label: 'Shodan',
      description: 'Internet-connected device search engine',
      website: 'https://shodan.io',
      pricing: 'Free tier: 100 queries/month, Paid: $59+/month'
    },
    {
      name: 'virustotal',
      label: 'VirusTotal',
      description: 'File and URL analysis service',
      website: 'https://virustotal.com',
      pricing: 'Free tier: 4 requests/minute, Paid: Custom pricing'
    },
    {
      name: 'hunter',
      label: 'Hunter.io',
      description: 'Email finder and verification',
      website: 'https://hunter.io',
      pricing: 'Free tier: 25 searches/month, Paid: $39+/month'
    },
    {
      name: 'haveibeenpwned',
      label: 'Have I Been Pwned',
      description: 'Data breach notification service',
      website: 'https://haveibeenpwned.com',
      pricing: 'Free for individuals, Paid: $3.50/month for API access'
    },
    {
      name: 'censys',
      label: 'Censys',
      description: 'Internet-wide scanning and analysis',
      website: 'https://censys.io',
      pricing: 'Free tier: 250 queries/month, Paid: Custom pricing'
    },
    {
      name: 'securitytrails',
      label: 'SecurityTrails',
      description: 'DNS and domain intelligence',
      website: 'https://securitytrails.com',
      pricing: 'Free tier: 50 queries/month, Paid: $99+/month'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Settings className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Configuration</h1>
          <p className="text-gray-600">Configure your OSINT service API keys for enhanced functionality</p>
        </div>
      </div>

      {/* Save Status */}
      {saved && (
        <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">Configuration saved successfully!</span>
        </div>
      )}

      {/* API Services Configuration */}
      <div className="space-y-6">
        {apiServices.map(service => (
          <div key={service.name} className="card p-6 border-l-4 border-l-blue-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{service.label}</h3>
                  {apiStatus[service.name] ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Configured
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Not Configured
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-2">{service.description}</p>
                <p className="text-sm text-gray-500">{service.pricing}</p>
                <a 
                  href={service.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Get API Key →
                </a>
              </div>
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Key className="w-4 h-4 inline mr-1" />
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKeys[service.name] ? 'text' : 'password'}
                  value={apiKeys[service.name]}
                  onChange={(e) => handleApiKeyChange(service.name, e.target.value)}
                  placeholder={`Enter your ${service.label} API key`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey(service.name)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showKeys[service.name] ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveConfiguration}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

      {/* Security Notice */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
            <p className="text-sm text-yellow-700 mt-1">
              API keys are stored locally in your browser and are not transmitted to our servers. 
              For enhanced security in production environments, consider using environment variables 
              or a secure key management system.
            </p>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Usage Instructions</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Most services offer free tiers with limited requests</li>
          <li>• API keys are required for real-time data and higher rate limits</li>
          <li>• Without API keys, InfoScope will use mock data for demonstrations</li>
          <li>• Rate limits are automatically enforced to prevent quota exhaustion</li>
        </ul>
      </div>
    </div>
  );
}

export default APIConfiguration;