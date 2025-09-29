// Investigation data management service
import investigationService from '../services/investigationService';

// Update LinkScanner runScan function to save with investigation context
const saveToInvestigation = async (scanData, investigationId = null) => {
  const enhancedData = {
    ...scanData,
    investigationContext: investigationId ? 'investigation' : 'standalone',
    timestamp: Date.now(),
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  
  if (investigationId) {
    return await investigationService.saveLinkScan(enhancedData, investigationId);
  } else {
    return await investigationService.saveLinkScan(enhancedData);
  }
};

// Update ProfileAnalyzer analysis function to save with investigation context  
const saveProfileAnalysis = async (analysisData, investigationId = null) => {
  const enhancedData = {
    ...analysisData,
    investigationContext: investigationId ? 'investigation' : 'standalone',
    timestamp: Date.now(),
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  
  if (investigationId) {
    return await investigationService.saveProfileAnalysis(enhancedData, investigationId);
  } else {
    return await investigationService.saveProfileAnalysis(enhancedData);
  }
};

export { saveToInvestigation, saveProfileAnalysis };