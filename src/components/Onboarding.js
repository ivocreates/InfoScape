import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Shield,
  Search,
  Globe,
  Users,
  Zap,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  BookOpen,
  Coffee
} from 'lucide-react';

const Onboarding = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to InfoScope OSINT",
      subtitle: "Your Professional OSINT Investigation Platform",
      icon: Shield,
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Professional OSINT Made Simple
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
              InfoScope provides you with 37+ advanced OSINT tools, anonymous browsing capabilities, 
              and comprehensive investigation features - all in one secure platform.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <Search className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <span className="font-medium text-gray-900 dark:text-white">37+ Tools</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <Globe className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
              <span className="font-medium text-gray-900 dark:text-white">Anonymous</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
              <span className="font-medium text-gray-900 dark:text-white">Fast</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
              <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mb-2" />
              <span className="font-medium text-gray-900 dark:text-white">Secure</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Explore OSINT Tools",
      subtitle: "Comprehensive toolkit for digital investigations",
      icon: Search,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <Search className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Complete OSINT Arsenal
            </h3>
            <p className="text-gray-600 text-lg">
              Access specialized tools for every type of investigation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">People Investigation</div>
                  <div className="text-sm text-gray-600">Social media, email lookup, username search</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Globe className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Domain Analysis</div>
                  <div className="text-sm text-gray-600">WHOIS, DNS, SSL analysis, subdomains</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Search className="w-6 h-6 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900">Google Dorking</div>
                  <div className="text-sm text-gray-600">Advanced search operators and techniques</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Shield className="w-6 h-6 text-yellow-600" />
                <div>
                  <div className="font-medium text-gray-900">Anonymous Browsing</div>
                  <div className="text-sm text-gray-600">Tor integration with proxy chains</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <Zap className="w-6 h-6 text-red-600" />
                <div>
                  <div className="font-medium text-gray-900">Real-time Analysis</div>
                  <div className="text-sm text-gray-600">Live monitoring and data collection</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-indigo-600" />
                <div>
                  <div className="font-medium text-gray-900">Investigation Reports</div>
                  <div className="text-sm text-gray-600">Professional documentation tools</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Anonymous & Secure",
      subtitle: "Protect your identity during investigations",
      icon: Shield,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Maximum Privacy & Security
            </h3>
            <p className="text-gray-600 text-lg">
              Conduct investigations safely with built-in anonymity features
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <Globe className="w-8 h-8 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Tor Integration</h4>
                <p className="text-sm opacity-90">Route through Tor network with custom exit nodes</p>
              </div>
              <div>
                <Shield className="w-8 h-8 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Proxy Chains</h4>
                <p className="text-sm opacity-90">Multiple proxy layers for enhanced anonymity</p>
              </div>
              <div>
                <Zap className="w-8 h-8 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">No Logging</h4>
                <p className="text-sm opacity-90">Your searches and data remain private</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Security Best Practices</h4>
                <p className="text-sm text-yellow-800 mt-1">
                  InfoScope follows industry-standard security practices to protect your investigations 
                  and maintain operational security (OPSEC) throughout your research.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Get Started",
      subtitle: "Begin your first investigation",
      icon: Star,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Ready to Start Investigating?
            </h3>
            <p className="text-gray-600 text-lg">
              Everything is set up and ready to go!
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white text-center">
              <Play className="w-12 h-12 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">Start Investigation</h4>
              <p className="mb-4 opacity-90">
                Jump right into your first investigation with our guided tools
              </p>
              <button
                onClick={() => onComplete('investigation')}
                className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Start Investigating
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-xl p-6 text-white text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">Explore Tools</h4>
              <p className="mb-4 opacity-90">
                Browse our complete arsenal of OSINT tools and capabilities
              </p>
              <button
                onClick={() => onComplete('tools')}
                className="w-full bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors"
              >
                Explore Tools
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <Coffee className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Support the Project</h4>
            <p className="text-gray-600 text-sm mb-4">
              InfoScope is free and open-source. Consider supporting development to help us add more features.
            </p>
            <button
              onClick={() => onComplete('about')}
              className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Learn More & Support
            </button>
          </div>
        </div>
      )
    }
  ];

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

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            {React.createElement(steps[currentStep].icon, { className: "w-6 h-6 text-blue-600" })}
            <h2 className="text-xl font-bold text-gray-900">
              {steps[currentStep].title}
            </h2>
          </div>
          <p className="text-gray-600">{steps[currentStep].subtitle}</p>
          <div className="mt-4 text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
        
        {/* Content */}
  <div className="p-8 overflow-y-auto max-h-[60vh] popup-scrollbar">
          {steps[currentStep].content}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip Tutorial
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => onComplete('dashboard')}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;