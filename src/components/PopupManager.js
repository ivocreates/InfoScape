import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const PopupManager = ({ user, onOpenChat }) => {
  const [activePopup, setActivePopup] = useState(null);
  const [popupQueue, setPopupQueue] = useState([]);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (!user) return;

    const userId = user.uid;
    const now = Date.now();
    const oneMonth = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    // Check if user is new (first time)
    const hasSeenOnboarding = localStorage.getItem(`onboarding-seen-${userId}`);
    const lastGetStarted = localStorage.getItem(`get-started-shown-${userId}`);
    const lastLegalities = localStorage.getItem(`legalities-shown-${userId}`);
    const lastDownloadPromo = localStorage.getItem(`download-promo-shown-${userId}`);
    const lastWeeklyTips = localStorage.getItem(`weekly-tips-shown-${userId}`);

    // Initialize popup queue based on user state
    const queue = [];

    // Show onboarding for new users first
    if (!hasSeenOnboarding) {
      queue.push('getting-started');
    }

    // Show legalities if not seen recently (1 month cooldown)
    if (!lastLegalities || (now - parseInt(lastLegalities)) > oneMonth) {
      queue.push('legalities');
    }

    // Show weekly tips if not seen recently (1 week cooldown)
    if (!lastWeeklyTips || (now - parseInt(lastWeeklyTips)) > oneWeek) {
      queue.push('weekly-tips');
    }

    // Show download promo occasionally (1 month cooldown)
    if (!lastDownloadPromo || (now - parseInt(lastDownloadPromo)) > oneMonth) {
      queue.push('download-promo');
    }

    if (queue.length > 0) {
      setPopupQueue(queue);
      setActivePopup(queue[0]);
    }
  }, [user]);

  const handlePopupComplete = (popupType) => {
    const userId = user.uid;
    const now = Date.now();
    
    // Mark popup as seen
    localStorage.setItem(`${popupType}-shown-${userId}`, now.toString());
    
    if (popupType === 'getting-started') {
      localStorage.setItem(`onboarding-seen-${userId}`, 'true');
    }

    // Move to next popup in queue
    const currentIndex = popupQueue.indexOf(popupType);
    const nextPopup = popupQueue[currentIndex + 1];
    
    if (nextPopup) {
      setActivePopup(nextPopup);
    } else {
      setActivePopup(null);
      setPopupQueue([]);
    }
  };

  const handlePopupSkip = (popupType) => {
    handlePopupComplete(popupType);
  };

  const handlePopupClose = () => {
    setActivePopup(null);
    setPopupQueue([]);
  };

  if (!activePopup) return null;

  return (
    <>
      {activePopup === 'getting-started' && (
        <GettingStartedPopup 
          onComplete={() => handlePopupComplete('getting-started')}
          onSkip={() => handlePopupSkip('getting-started')}
          isDarkMode={isDarkMode}
        />
      )}
      {activePopup === 'legalities' && (
        <LegalitiesPopup 
          onComplete={() => handlePopupComplete('legalities')}
          onSkip={() => handlePopupSkip('legalities')}
          isDarkMode={isDarkMode}
        />
      )}
      {activePopup === 'weekly-tips' && (
        <WeeklyTipsPopup 
          onComplete={() => handlePopupComplete('weekly-tips')}
          onSkip={() => handlePopupSkip('weekly-tips')}
          onOpenChat={onOpenChat}
          isDarkMode={isDarkMode}
        />
      )}
      {activePopup === 'download-promo' && (
        <DownloadPromoPopup 
          onComplete={() => handlePopupComplete('download-promo')}
          onSkip={() => handlePopupSkip('download-promo')}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
};

// Enhanced Getting Started/Onboarding Popup Component
const GettingStartedPopup = ({ onComplete, onSkip, isDarkMode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      icon: "🔍",
      title: "Welcome to InfoScope",
      subtitle: "Your Professional OSINT Investigation Platform",
      content: (
        <div className="space-y-4">
          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            InfoScope is a comprehensive Open Source Intelligence (OSINT) toolkit designed for security professionals, 
            investigators, and researchers who need reliable digital investigation capabilities.
          </p>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/30 border border-blue-700/50' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              🛡️ <strong>Professional Grade:</strong> Built for compliance, security, and accuracy
            </p>
          </div>
        </div>
      )
    },
    {
      icon: "🛠️",
      title: "Core Investigation Tools",
      subtitle: "Everything you need for digital investigations",
      content: (
        <div className="space-y-3">
          <div className={`flex items-start gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-green-600' : 'bg-green-500'}`}>
              <span className="text-white text-sm">🌐</span>
            </div>
            <div>
              <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Network Analysis</h4>
              <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>IP lookup, domain research, SSL certificates, DNS records</p>
            </div>
          </div>
          
          <div className={`flex items-start gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-purple-600' : 'bg-purple-500'}`}>
              <span className="text-white text-sm">👤</span>
            </div>
            <div>
              <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Social Media Intel</h4>
              <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Username searches, social platform analysis, public data gathering</p>
            </div>
          </div>

          <div className={`flex items-start gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-orange-600' : 'bg-orange-500'}`}>
              <span className="text-white text-sm">🔒</span>
            </div>
            <div>
              <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Secure Browsing</h4>
              <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Built-in Tor browser, proxy support, anonymous investigations</p>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: "🤖",
      title: "AI-Powered Assistance",
      subtitle: "Smart guidance for your investigations",
      content: (
        <div className="space-y-4">
          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Our AI assistant provides intelligent guidance, suggests investigation paths, and helps you understand 
            complex data patterns during your research.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50 border border-blue-700/30' : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'}`}>
              <div className="text-2xl mb-2">💡</div>
              <p className={`text-xs font-medium ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>Smart Tips</p>
            </div>
            <div className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-gradient-to-br from-green-900/50 to-blue-900/50 border border-green-700/30' : 'bg-gradient-to-br from-green-50 to-blue-50 border border-green-200'}`}>
              <div className="text-2xl mb-2">🎯</div>
              <p className={`text-xs font-medium ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>Investigation Paths</p>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: "⚖️",
      title: "Legal & Ethical Use",
      subtitle: "Important guidelines for responsible investigations",
      content: (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border-2 ${isDarkMode ? 'bg-amber-900/30 border-amber-700/50' : 'bg-amber-50 border-amber-300'}`}>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>
              ⚠️ <strong>Important:</strong> InfoScope is designed for legitimate investigations only
            </p>
          </div>
          <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            <li className="flex items-start gap-2">
              <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>✓</span>
              Authorized security research and compliance
            </li>
            <li className="flex items-start gap-2">
              <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>✓</span>
              Legal investigations and due diligence
            </li>
            <li className="flex items-start gap-2">
              <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>✓</span>
              Academic research and education
            </li>
            <li className="flex items-start gap-2">
              <span className={`${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>✗</span>
              Harassment, stalking, or illegal activities
            </li>
          </ul>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-600' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">{currentStepData.icon}</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {currentStep + 1} of {steps.length}
            </div>
          </div>
          <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {currentStepData.title}
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {currentStepData.subtitle}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStepData.content}
        </div>

        {/* Progress Bar */}
        <div className="px-6 pb-2">
          <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className={`p-6 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Previous
              </button>
            )}
            
            <div className="flex-1" />
            
            {!isLastStep ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg text-sm transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
              >
                Start Using InfoScope
              </button>
            )}
          </div>
          
          {currentStep === 0 && (
            <button
              onClick={onSkip}
              className={`w-full mt-3 text-sm transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-200' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Skip introduction
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Legalities Popup Component with improved readability
const LegalitiesPopup = ({ onComplete, onSkip, isDarkMode }) => {
  const [acceptedTerms, setAcceptedTerms] = useState({
    usage: false,
    privacy: false,
    ethics: false,
    compliance: false,
    terms: false
  });

  const allTermsAccepted = Object.values(acceptedTerms).every(Boolean);

  const terms = [
    {
      id: 'usage',
      title: 'Responsible Usage',
      description: 'I will use InfoScope only for legitimate, authorized investigations and legal purposes.',
      icon: '🎯'
    },
    {
      id: 'privacy', 
      title: 'Privacy Respect',
      description: 'I will respect privacy laws, individual rights, and obtain proper authorization before investigations.',
      icon: '🛡️'
    },
    {
      id: 'ethics',
      title: 'Ethical Standards', 
      description: 'I will maintain professional ethics and avoid using this tool for harassment or illegal activities.',
      icon: '⚖️'
    },
    {
      id: 'compliance',
      title: 'Legal Compliance',
      description: 'I understand my local laws and will ensure all investigations comply with applicable regulations.',
      icon: '📋'
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      description: 'I agree to the Terms of Service, Privacy Policy, and understand the licensing conditions.',
      icon: '📄'
    }
  ];

  const handleTermChange = (termId) => {
    setAcceptedTerms(prev => ({
      ...prev,
      [termId]: !prev[termId]
    }));
  };

  const handleReadMore = () => {
    // Navigate to About page legal tab
    window.location.hash = '#/about?tab=legal';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-600' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`p-6 text-center border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">📋</span>
          </div>
          <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Legal Terms & Conditions
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Please review and accept each term to continue
          </p>
        </div>
        
        {/* Terms */}
        <div className="p-6">
          <div className="space-y-4 mb-6">
            {terms.map((term) => (
              <div 
                key={term.id}
                className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  acceptedTerms[term.id] 
                    ? isDarkMode
                      ? 'border-green-500/50 bg-green-900/20 shadow-lg' 
                      : 'border-green-300 bg-green-50 shadow-md'
                    : isDarkMode
                      ? 'border-gray-600 bg-gray-700/30 hover:border-gray-500' 
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => handleTermChange(term.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    acceptedTerms[term.id]
                      ? isDarkMode
                        ? 'border-green-400 bg-green-500'
                        : 'border-green-500 bg-green-500'
                      : isDarkMode
                        ? 'border-gray-500 bg-transparent'
                        : 'border-gray-300 bg-transparent'
                  }`}>
                    {acceptedTerms[term.id] && (
                      <span className="text-white text-sm font-bold">✓</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{term.icon}</span>
                      <h3 className={`font-semibold text-sm ${
                        isDarkMode ? 'text-gray-100' : 'text-gray-900'
                      }`}>
                        {term.title}
                      </h3>
                    </div>
                    <p className={`text-xs leading-relaxed ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {term.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Read More Section */}
          <div className={`p-4 rounded-xl border mb-6 ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-700/50' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-semibold text-sm ${
                  isDarkMode ? 'text-blue-200' : 'text-blue-800'
                }`}>
                  Complete Legal Documentation
                </h4>
                <p className={`text-xs ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-600'
                }`}>
                  View detailed terms, privacy policy & compliance
                </p>
              </div>
              <button
                onClick={handleReadMore}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Read More
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onComplete}
              disabled={!allTermsAccepted}
              className={`w-full font-semibold py-3 px-4 rounded-xl transition-all transform ${
                allTermsAccepted
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {allTermsAccepted ? 'Accept All Terms & Continue' : 'Please accept all terms'}
            </button>
            <button
              onClick={onSkip}
              className={`w-full text-sm py-2 transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-200' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Review Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Weekly Tips Popup Component
const WeeklyTipsPopup = ({ onComplete, onSkip, onOpenChat, isDarkMode }) => {
  const [currentTip] = useState({
    title: "Advanced Search Techniques",
    content: "Use Google dorking with 'site:' and 'intext:' operators for more precise OSINT gathering. Combine multiple operators for deeper intelligence.",
    category: "search",
    level: "intermediate"
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl max-w-md w-full shadow-2xl border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-600' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">💡</span>
          </div>
          <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Weekly OSINT Tip
          </h2>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {currentTip.title}
          </p>
          
          <div className={`rounded-xl p-4 mb-6 ${
            isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'
          }`}>
            <p className={`text-sm leading-relaxed ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              {currentTip.content}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              isDarkMode 
                ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50' 
                : 'bg-purple-100 text-purple-700 border border-purple-200'
            }`}>
              {currentTip.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              isDarkMode 
                ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50' 
                : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}>
              {currentTip.level}
            </span>
          </div>

          <div className="space-y-3">
            <button
              onClick={onOpenChat}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              🤖 Ask AI for Advanced Tips
            </button>
            <button
              onClick={onComplete}
              className={`w-full text-sm font-medium py-2 transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-200' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Thanks! I'll apply this tip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Download Promo Popup Component
const DownloadPromoPopup = ({ onComplete, onSkip, isDarkMode }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl max-w-md w-full shadow-2xl border ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-600' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">💻</span>
          </div>
          <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Download Desktop App
          </h2>
          <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Get the full InfoScope experience with our desktop application. Enhanced performance and offline capabilities.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.open('https://github.com/ivocreates/InfoScope/releases', '_blank')}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Download Now
            </button>
            <button
              onClick={onComplete}
              className={`w-full text-sm py-2 transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-200' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupManager;