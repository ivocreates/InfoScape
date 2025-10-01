import React, { useState } from 'react';
import { 
  Shield, 
  Search, 
  Globe, 
  Users, 
  Zap, 
  ArrowRight,
  ExternalLink,
  Download,
  Star,
  Github,
  Heart,
  AlertTriangle,
  CheckCircle,
  Lock,
  Eye,
  Database,
  Smartphone,
  Monitor,
  Code
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import InfoScopeIcon from './InfoScopeIcon';

function LandingPage({ onGetStarted }) {
  const { isDarkMode } = useTheme();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Shield,
      title: 'Advanced OSINT Investigation Engine',
      description: 'Professional-grade query building with 37+ specialized templates for comprehensive digital investigations.',
      color: 'from-blue-600 to-purple-600',
      darkColor: 'from-blue-500 to-purple-500'
    },
    {
      icon: Globe,
      title: 'Anonymous Browsing & Privacy',
      description: 'Built-in Tor integration with exit node selection and proxy chaining for maximum anonymity and security.',
      color: 'from-green-600 to-teal-600',
      darkColor: 'from-green-500 to-teal-500'
    },
    {
      icon: Database,
      title: 'Multi-Engine Search Capabilities',
      description: 'Search across Google, Bing, DuckDuckGo, Yandex, and Baidu with specialized operators and rate limiting.',
      color: 'from-purple-600 to-pink-600',
      darkColor: 'from-purple-500 to-pink-500'
    },
    {
      icon: Lock,
      title: 'Encrypted Investigation Storage',
      description: 'Secure local storage with encryption, investigation templates, and comprehensive search history tracking.',
      color: 'from-red-600 to-orange-600',
      darkColor: 'from-red-500 to-orange-500'
    }
  ];

  const useCases = [
    { title: 'Corporate Due Diligence', description: 'Background checks and company verification' },
    { title: 'Cybersecurity Intelligence', description: 'Threat hunting and digital forensics' },
    { title: 'Social Media Investigation', description: 'Profile analysis and social network mapping' },
    { title: 'Academic Research', description: 'Information gathering for scholarly work' },
    { title: 'Fraud Investigation', description: 'Identity verification and fraud detection' },
    { title: 'Background Verification', description: 'Professional and personal background checks' }
  ];

  const stats = [
    { number: '37+', label: 'OSINT Tools' },
    { number: '5', label: 'Search Engines' },
    { number: '100%', label: 'Open Source' },
    { number: '24/7', label: 'Available' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-colors">
      {/* Navigation Header */}
      <nav className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <InfoScopeIcon size={24} variant="monochrome" className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">InfoScope</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">OSINT Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/ivocreates/InfoScope" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <button
                onClick={onGetStarted}
                className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-700">
                <Star className="w-4 h-4" />
                Professional OSINT Platform
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-gray-900 via-black to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                InfoScope
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                OSINT Platform
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
              Professional-grade open source intelligence platform with advanced query building, 
              anonymous browsing, and comprehensive investigation tools for cybersecurity professionals, 
              researchers, and investigators.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 mb-16">
              <button
                onClick={onGetStarted}
                className="flex items-center gap-3 bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 w-full sm:w-auto"
              >
                <Shield className="w-5 h-5" />
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button className="hidden sm:flex items-center gap-3 bg-gray-900 dark:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-all duration-200 shadow-lg">
                  <Monitor className="w-4 h-4" />
                  Install on Desktop
                </button>
                
                <button className="sm:hidden flex items-center gap-3 bg-gray-900 dark:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-all duration-200 shadow-lg">
                  <Smartphone className="w-4 h-4" />
                  Install on Mobile
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Professional OSINT Capabilities
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Everything you need for comprehensive digital investigations, built with privacy and security as core principles.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isActive = activeFeature === index;
                return (
                  <button
                    key={index}
                    className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
                      isActive 
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-800'
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${
                        isDarkMode ? feature.darkColor : feature.color
                      }`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="lg:pl-8">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 text-white shadow-2xl">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">InfoScope OSINT Terminal</h3>
                  <p className="text-gray-300 text-sm">Advanced investigation interface</p>
                </div>
                
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">$</span>
                    <span className="text-blue-300">osint</span>
                    <span className="text-white">--target "John Smith"</span>
                  </div>
                  <div className="text-gray-400">→ Initializing OSINT investigation...</div>
                  <div className="text-gray-400">→ Loading search templates...</div>
                  <div className="text-green-400">✓ 37+ OSINT tools ready</div>
                  <div className="text-green-400">✓ Anonymous browsing enabled</div>
                  <div className="text-green-400">✓ Multi-engine search configured</div>
                  <div className="text-blue-300">→ Investigation workspace created</div>
                </div>
                
                <div className="mt-6 p-4 bg-black/30 rounded-lg">
                  <div className="text-xs text-gray-400 mb-2">Generated Query:</div>
                  <div className="text-green-300 font-mono text-sm break-all">
                    "John Smith" (site:linkedin.com OR site:github.com) filetype:pdf
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Trusted by Professionals Worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              From cybersecurity teams to research institutions, InfoScope powers investigations across diverse industries.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{useCase.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Available Everywhere
            </h2>
            <p className="text-xl text-blue-100 dark:text-blue-200 mb-12">
              Access InfoScope OSINT as a web application, progressive web app, or native desktop application.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Globe className="w-12 h-12 text-white mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Web Application</h3>
                <p className="text-blue-100 dark:text-blue-200 text-sm mb-4">
                  Instant access from any modern browser with full feature support.
                </p>
                <button 
                  onClick={onGetStarted}
                  className="w-full bg-white text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  Launch Now
                </button>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Smartphone className="w-12 h-12 text-white mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Progressive Web App</h3>
                <p className="text-blue-100 dark:text-blue-200 text-sm mb-4">
                  Install on mobile devices with offline capabilities and native feel.
                </p>
                <button 
                  onClick={onGetStarted}
                  className="w-full bg-white/20 text-white py-2 px-4 rounded-lg font-medium hover:bg-white/30 transition-colors border border-white/30"
                >
                  Install PWA
                </button>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Monitor className="w-12 h-12 text-white mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Desktop Application</h3>
                <p className="text-blue-100 dark:text-blue-200 text-sm mb-4">
                  Native desktop app for Windows, macOS, and Linux systems.
                </p>
                <a
                  href="https://github.com/ivocreates/InfoScope/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white/20 text-white py-2 px-4 rounded-lg font-medium hover:bg-white/30 transition-colors border border-white/30 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Start Investigating?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
            Join thousands of professionals using InfoScope for their OSINT investigations. 
            Free, open source, and privacy-focused.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={onGetStarted}
              className="flex items-center gap-3 bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <Shield className="w-5 h-5" />
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Quick sign up process
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                100% free & open source
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold">InfoScope OSINT</div>
                <div className="text-xs text-gray-400">Professional Investigation Platform</div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <a 
                href="https://github.com/ivocreates/InfoScope" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <a 
                href="https://ivocreates.site" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Heart className="w-4 h-4" />
                Support
              </a>
              <span className="text-gray-400">
                Built with ❤️ by Ivo Pereira
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;