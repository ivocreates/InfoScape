import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  File, 
  Grid, 
  Code, 
  Image,
  Crown,
  Loader,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';
import premiumExportService from '../services/premiumExportService';
import subscriptionService from '../services/subscriptionService';

const ExportFeatures = ({ data, toolName, onClose }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);
  
  const currentPlan = subscriptionService.getCurrentPlan();
  const availableFormats = currentPlan?.limits.export_formats || ['json'];

  const formats = [
    {
      id: 'pdf',
      name: 'PDF Report',
      icon: <FileText className="w-5 h-5" />,
      description: 'Professional PDF report with charts and analysis',
      premium: true,
      plans: ['basic', 'professional', 'enterprise']
    },
    {
      id: 'docx',
      name: 'Word Document',
      icon: <File className="w-5 h-5" />,
      description: 'Editable Microsoft Word document',
      premium: true,
      plans: ['professional', 'enterprise']
    },
    {
      id: 'csv',
      name: 'CSV Data',
      icon: <Grid className="w-5 h-5" />,
      description: 'Comma-separated values for data analysis',
      premium: true,
      plans: ['premium']
    },
    {
      id: 'json',
      name: 'JSON Export',
      icon: <Code className="w-5 h-5" />,
      description: 'Raw JSON data for developers',
      premium: false,
      plans: ['free', 'basic', 'professional', 'enterprise']
    },
    {
      id: 'xml',
      name: 'XML Export',
      icon: <Code className="w-5 h-5" />,
      description: 'Structured XML format',
      premium: true,
      plans: ['professional', 'enterprise']
    },
    {
      id: 'xlsx',
      name: 'Excel Spreadsheet',
      icon: <Grid className="w-5 h-5" />,
      description: 'Microsoft Excel workbook with multiple sheets',
      premium: true,
      plans: ['professional', 'enterprise']
    }
  ];

  const handleExport = async () => {
    if (!data) {
      setExportStatus({ type: 'error', message: 'No data available to export' });
      return;
    }

    // Check if format is available for current plan
    if (!availableFormats.includes(exportFormat)) {
      setExportStatus({ 
        type: 'error', 
        message: `${exportFormat.toUpperCase()} export requires a premium subscription` 
      });
      return;
    }

    setIsExporting(true);
    setExportStatus(null);

    try {
      const exportData = {
        toolName,
        timestamp: new Date().toISOString(),
        data: data,
        user: subscriptionService.getCurrentUser(),
        plan: currentPlan
      };

      let result;
      switch (exportFormat) {
        case 'pdf':
          result = await premiumExportService.exportToPDF(exportData);
          break;
        case 'docx':
          result = await premiumExportService.exportToWord(exportData);
          break;
        case 'csv':
          result = await premiumExportService.exportToCSV(exportData);
          break;
        case 'json':
          result = await premiumExportService.exportToJSON(exportData);
          break;
        case 'xml':
          result = await premiumExportService.exportToXML(exportData);
          break;
        case 'xlsx':
          result = await premiumExportService.exportToExcel(exportData);
          break;
        default:
          throw new Error('Unsupported export format');
      }

      setExportStatus({ 
        type: 'success', 
        message: `${exportFormat.toUpperCase()} exported successfully!`,
        filename: result.filename 
      });

    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus({ 
        type: 'error', 
        message: error.message || 'Export failed. Please try again.' 
      });
    } finally {
      setIsExporting(false);
    }
  };

  const isFormatAvailable = (format) => {
    return availableFormats.includes(format.id);
  };

  const getFormatStatus = (format) => {
    if (isFormatAvailable(format)) {
      return 'available';
    } else if (format.premium) {
      return 'premium';
    } else {
      return 'unavailable';
    }
  };

  const getFormatClasses = (format) => {
    const baseClasses = "relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200";
    const status = getFormatStatus(format);
    
    if (status === 'unavailable') {
      return `${baseClasses} border-gray-200 bg-gray-50 cursor-not-allowed opacity-50`;
    }
    
    if (exportFormat === format.id) {
      if (status === 'premium') {
        return `${baseClasses} border-purple-500 bg-purple-50 dark:bg-purple-900/20`;
      }
      return `${baseClasses} border-blue-500 bg-blue-50 dark:bg-blue-900/20`;
    }
    
    if (status === 'premium') {
      return `${baseClasses} border-purple-200 hover:border-purple-300 dark:border-purple-700 dark:hover:border-purple-600`;
    }
    
    return `${baseClasses} border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Export Data
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Export your {toolName} results in various formats
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
          >
            ×
          </button>
        </div>

        {/* Current Plan Info */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Current Plan: {currentPlan?.name || 'Free'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Available formats: {availableFormats.map(f => f.toUpperCase()).join(', ')}
              </p>
            </div>
            {currentPlan?.id === 'free' && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openSubscription'))}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                <Crown className="w-4 h-4" />
                Upgrade for More Formats
              </button>
            )}
          </div>
        </div>

        {/* Format Selection */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Choose Export Format
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {formats.map((format) => {
              const status = getFormatStatus(format);
              const isSelected = exportFormat === format.id;
              
              return (
                <div
                  key={format.id}
                  onClick={() => {
                    if (status !== 'unavailable') {
                      setExportFormat(format.id);
                    }
                  }}
                  className={getFormatClasses(format)}
                >
                  {/* Premium badge */}
                  {format.premium && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Premium
                      </div>
                    </div>
                  )}
                  
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute -top-2 -left-2">
                      <div className="bg-blue-600 text-white rounded-full p-1">
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      status === 'premium' ? 'bg-purple-100 text-purple-600' :
                      status === 'available' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {format.icon}
                    </div>
                    <h4 className={`font-semibold ${
                      status === 'unavailable' ? 'text-gray-400' : 'text-gray-900 dark:text-white'
                    }`}>
                      {format.name}
                    </h4>
                  </div>
                  
                  <p className={`text-sm ${
                    status === 'unavailable' ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {format.description}
                  </p>
                  
                  {status === 'unavailable' && (
                    <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                      Requires: {format.plans.filter(p => p !== 'free').join(' or ').toUpperCase()} plan
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Export Options */}
          {exportFormat && isFormatAvailable({ id: exportFormat }) && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Export Options
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Include metadata</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Add InfoScope branding</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                
                {(exportFormat === 'pdf' || exportFormat === 'docx') && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Include charts and graphs</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Messages */}
          {exportStatus && (
            <div className={`p-4 rounded-lg mb-6 ${
              exportStatus.type === 'success' ? 'bg-green-50 border border-green-200' :
              'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {exportStatus.type === 'success' ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  exportStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {exportStatus.message}
                </span>
              </div>
              {exportStatus.filename && (
                <p className="text-sm text-green-700 mt-1">
                  File saved as: {exportStatus.filename}
                </p>
              )}
            </div>
          )}

          {/* Export Button */}
          <div className="flex gap-4">
            <button
              onClick={handleExport}
              disabled={isExporting || !isFormatAvailable({ id: exportFormat })}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {isExporting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Export as {exportFormat.toUpperCase()}
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium mb-1">Export Information:</p>
              <ul className="space-y-1">
                <li>• PDF and Word exports include professional formatting and charts</li>
                <li>• CSV and Excel formats are optimized for data analysis</li>
                <li>• All exports include metadata and source attribution</li>
                <li>• Enterprise users get unlimited exports with priority processing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportFeatures;