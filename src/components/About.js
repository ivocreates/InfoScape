import React, { useState, useEffect } from 'react';
import { 
  Info,
  Github,
  Globe,
  Heart,
  Coffee,
  Star,
  Shield,
  Users,
  Zap,
  Download,
  ExternalLink,
  Copy,
  Check,
  CreditCard,
  Smartphone,
  Scale,
  MessageCircle
} from 'lucide-react';
import LegalDocumentation from './LegalDocumentation';
import { useTheme } from '../contexts/ThemeContext';
import InfoScopeIcon from './InfoScopeIcon';

function About() {
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [showLegalDocs, setShowLegalDocs] = useState(false);
  const { theme } = useTheme();

  // Handle URL parameters for direct navigation to tabs
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['about', 'developer', 'support', 'legal'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  // Listen for hash changes to support navigation from popups
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('tab=legal')) {
        setActiveTab('legal');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const copyUPI = () => {
    navigator.clipboard.writeText('ivopereiraix3@oksbi');
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const openDonationLink = () => {
    window.open('https://razorpay.me/@ivocreates', '_blank');
  };

  const openPayPalLink = () => {
    window.open('https://paypal.me/ivocreates', '_blank');
  };

  const features = [
    {
      icon: Shield,
      title: 'Advanced OSINT Tools',
      description: 'Comprehensive suite of 37+ professional OSINT tools for investigations'
    },
    {
      icon: Globe,
      title: 'Anonymous Browsing',
      description: 'Tor integration with exit node selection and proxy chaining for maximum anonymity'
    },
    {
      icon: Zap,
      title: 'Google Dorking Engine',
      description: 'Advanced search query builder with professional dorking techniques'
    },
    {
      icon: Users,
      title: 'Multi-Platform Support',
      description: 'Available as desktop app, web app, and installable PWA'
    }
  ];

  const technologies = [
    'React.js', 'Electron', 'Firebase', 'Tailwind CSS', 'Node.js', 'Progressive Web App'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 p-8 mb-6 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)',
              backgroundSize: '20px 20px'
            }}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <InfoScopeIcon 
                size={64} 
                variant="gradient"
                className="drop-shadow-lg"
              />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-3">
              InfoScope OSINT
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 font-medium">
              Professional Open Source Intelligence Platform
            </p>
            <div className="flex items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-medium">
                Version 1.0.0
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                Open Source
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                MIT License
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'about', label: 'About', icon: Info },
              { id: 'developer', label: 'Developer', icon: Github },
              { id: 'support', label: 'Support Development', icon: Heart },
              { id: 'legal', label: 'Legal', icon: Scale }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What is InfoScope OSINT?</h2>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                    InfoScope OSINT is a comprehensive Open Source Intelligence platform designed for 
                    cybersecurity professionals, researchers, journalists, and investigators. It provides 
                    advanced tools for digital investigations while maintaining the highest standards of 
                    privacy and anonymity.
                  </p>

                  {/* Download Section */}
                  <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 dark:from-blue-800 dark:via-purple-800 dark:to-purple-900 rounded-xl p-8 mb-8 shadow-xl border border-blue-400/20">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold mb-3 text-white drop-shadow-lg">📱 Get InfoScope OSINT</h3>
                        <p className="text-blue-100 dark:text-blue-200 mb-4 text-lg">
                          Available as web app, PWA, and desktop application
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                          <span className="px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30">
                            🌐 Web App
                          </span>
                          <span className="px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30">
                            📱 PWA
                          </span>
                          <span className="px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30">
                            💻 Desktop
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        {/* Web App Access */}
                        <button
                          onClick={() => window.open('https://infoscope-osint.web.app', '_blank')}
                          className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 hover:shadow-lg transition-all duration-200 shadow-lg min-w-[160px] transform hover:scale-105"
                        >
                          <Globe className="w-5 h-5" />
                          <span className="hidden sm:inline">Open Web App</span>
                          <span className="sm:hidden">Web App</span>
                        </button>
                        
                        {/* Desktop Download */}
                        <button
                          onClick={() => window.open('https://github.com/ivocreates/InfoScope/releases', '_blank')}
                          className="flex items-center justify-center gap-3 px-8 py-4 bg-white/15 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/25 hover:border-white/50 transition-all duration-200 min-w-[160px] transform hover:scale-105"
                        >
                          <Download className="w-5 h-5" />
                          <span className="hidden sm:inline">Download App</span>
                          <span className="sm:hidden">Download</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Direct Downloads Section */}
                    <div className="mt-8 pt-8 border-t border-white/30">
                      <h4 className="font-bold mb-6 text-center text-white text-lg drop-shadow-md">📦 Direct Downloads</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = '/downloads/InfoScope-OSINT-WebApp-v1.1.0.zip';
                            link.download = 'InfoScope-OSINT-WebApp-v1.1.0.zip';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500/25 backdrop-blur-sm border border-green-400/40 text-green-100 rounded-xl text-sm font-medium hover:bg-green-500/35 hover:border-green-400/60 transition-all duration-200 transform hover:scale-105"
                        >
                          <Download className="w-4 h-4" />
                          Web App
                        </button>
                        <button
                          onClick={() => {
                            // Check if file exists, otherwise redirect to GitHub releases
                            const link = document.createElement('a');
                            link.href = '/downloads/InfoScope-OSINT-Setup-1.1.0.exe';
                            link.download = 'InfoScope-OSINT-Setup-1.1.0.exe';
                            link.onerror = () => window.open('https://github.com/ivocreates/InfoScope/releases', '_blank');
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-white/15 backdrop-blur-sm border border-white/40 text-white rounded-xl text-sm font-medium hover:bg-white/25 hover:border-white/60 transition-all duration-200 transform hover:scale-105"
                        >
                          <Download className="w-4 h-4" />
                          Windows
                        </button>
                        <button
                          onClick={() => window.open('https://github.com/ivocreates/InfoScope/releases', '_blank')}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-white/15 backdrop-blur-sm border border-white/40 text-white rounded-xl text-sm font-medium hover:bg-white/25 hover:border-white/60 transition-all duration-200 transform hover:scale-105"
                        >
                          <Download className="w-4 h-4" />
                          macOS
                        </button>
                        <button
                          onClick={() => window.open('https://github.com/ivocreates/InfoScope/releases', '_blank')}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-white/15 backdrop-blur-sm border border-white/40 text-white rounded-xl text-sm font-medium hover:bg-white/25 hover:border-white/60 transition-all duration-200 transform hover:scale-105"
                        >
                          <Download className="w-4 h-4" />
                          Linux
                        </button>
                      </div>
                      <p className="text-center text-sm text-blue-100 dark:text-blue-200 mt-4 font-medium">
                        💡 Web App download includes all features and works offline
                      </p>
                    </div>
                    
                    {/* Platform Instructions */}
                    <div className="mt-8 pt-8 border-t border-white/30">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="text-center md:text-left bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          <h4 className="font-bold mb-3 text-white text-base drop-shadow-md">🌐 Web Access</h4>
                          <p className="text-blue-100 dark:text-blue-200 leading-relaxed">
                            Access instantly from any browser at infoscope-osint.web.app
                          </p>
                        </div>
                        <div className="text-center md:text-left bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          <h4 className="font-bold mb-3 text-white text-base drop-shadow-md">📱 Mobile (PWA)</h4>
                          <p className="text-blue-100 dark:text-blue-200 leading-relaxed">
                            Install as app on iOS/Android. Works offline with full features.
                          </p>
                        </div>
                        <div className="text-center md:text-left bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          <h4 className="font-bold mb-3 text-white text-base drop-shadow-md">💻 Desktop</h4>
                          <p className="text-blue-100 dark:text-blue-200 leading-relaxed">
                            Download from GitHub releases for Windows, macOS, and Linux.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">🚀 Key Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            <feature.icon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900 dark:text-blue-100">{feature.title}</h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Built With</h3>
                  <div className="flex flex-wrap gap-2">
                    {technologies.map((tech, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Privacy & Security</h3>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p>• All investigations are stored locally and encrypted</p>
                    <p>• Tor integration ensures anonymous browsing capabilities</p>
                    <p>• No tracking or data collection beyond what you explicitly save</p>
                    <p>• Open source code available for security auditing</p>
                    <p>• GDPR compliant with full data export and deletion controls</p>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 dark:text-green-300 mb-3">🌟 Use Cases</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-2 text-green-800 dark:text-green-400">
                      <p>• Corporate due diligence</p>
                      <p>• Cybersecurity threat intelligence</p>
                      <p>• Digital forensics investigations</p>
                      <p>• Social media intelligence</p>
                    </div>
                    <div className="space-y-2 text-green-800 dark:text-green-400">
                      <p>• Background verification</p>
                      <p>• Data breach analysis</p>
                      <p>• Fraud investigation</p>
                      <p>• Academic research</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Developer Tab */}
            {activeTab === 'developer' && (
              <div className="space-y-8">
                {/* Enhanced Developer Profile */}
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <img
                      src="https://github.com/ivocreates.png"
                      alt="Ivo Pereira - GitHub Avatar"
                      className="w-full h-full rounded-full object-cover border-4 border-blue-500 dark:border-blue-400 shadow-xl hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=Ivo+Pereira&background=4F46E5&color=fff&size=128`;
                      }}
                    />
                  </div>
                  
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                    Ivo Pereira
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">Full-Stack Developer & OSINT Enthusiast</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">Hover over the photo to see more!</p>
                  
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <a 
                      href="https://github.com/ivocreates" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <Github className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      GitHub
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <a 
                      href="https://ivocreates.site/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Website
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <a 
                      href="mailto:hello@ivocreates.site" 
                      className="group flex items-center gap-2 px-6 py-3 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <CreditCard className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Contact
                    </a>
                  </div>
                </div>

                {/* Enhanced About Section */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">About the Developer</h3>
                  </div>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p className="text-lg">
                      InfoScope OSINT was born from a passion for cybersecurity and open source intelligence. 
                      As a full-stack developer with years of experience in building secure applications, 
                      I saw the need for a comprehensive, privacy-focused OSINT platform that could serve 
                      both newcomers and experienced investigators.
                    </p>
                    <p>
                      This project represents the culmination of expertise in modern web technologies, 
                      professional-grade security practices, and deep understanding of OSINT methodologies. 
                      Every feature has been carefully designed to prioritize user privacy while delivering 
                      powerful investigation capabilities.
                    </p>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500 dark:border-blue-400">
                      <p className="italic text-blue-800 dark:text-blue-300">
                        "Building tools that empower investigators while respecting privacy and security is not just my profession—it's my mission."
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">— Ivo Pereira</p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Skills & Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg dark:hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Technical Expertise</h4>
                    </div>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                        <span>React.js & Modern JavaScript</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                        <span>Node.js & Backend Development</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
                        <span>Electron & Desktop Apps</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 dark:bg-yellow-400 rounded-full"></div>
                        <span>Firebase & Cloud Platforms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full"></div>
                        <span>Cybersecurity & Privacy</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg dark:hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">OSINT Specialization</h4>
                    </div>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                        <span>Digital Footprint Analysis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                        <span>Social Media Intelligence</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
                        <span>Domain & Network Analysis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 dark:bg-yellow-400 rounded-full"></div>
                        <span>Anonymous Browsing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full"></div>
                        <span>Investigation Methodologies</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg dark:hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                        <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Project Stats</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">OSINT Tools</span>
                        <span className="font-semibold text-gray-900 dark:text-white">37+</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Development Time</span>
                        <span className="font-semibold text-gray-900 dark:text-white">6+ months</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Lines of Code</span>
                        <span className="font-semibold text-gray-900 dark:text-white">10,000+</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Open Source</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">✓ CC BY-SA 4.0 License</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connect Section */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 text-white">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-4">Let's Connect!</h3>
                    <p className="text-gray-300 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                      Interested in collaborating, have questions about InfoScope, or want to discuss OSINT methodologies? 
                      I'd love to hear from you! Feel free to reach out through any of these channels.
                    </p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                      <a 
                        href="https://github.com/ivocreates/InfoScape/discussions" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 dark:bg-white/5 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Discussions
                      </a>
                      <a 
                        href="https://github.com/ivocreates/InfoScape/issues" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 dark:bg-white/5 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Issues
                      </a>
                      <a 
                        href="https://ivocreates.site/contact" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 dark:bg-white/5 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        Contact Form
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Support Development Tab */}
            {activeTab === 'support' && (
              <div className="space-y-8">
                <div className="text-center">
                  <Heart className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Support InfoScope Development</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    InfoScope OSINT is free and open source. Your support helps maintain and improve the platform, 
                    add new features, and keep the project sustainable for the OSINT community.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* UPI Payment */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-orange-900 dark:text-orange-300">UPI Payment (India)</h3>
                        <p className="text-sm text-orange-700 dark:text-orange-400">Quick and secure UPI transfer</p>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm text-gray-700 dark:text-gray-300">ivopereiraix3@oksbi</span>
                        <button
                          onClick={copyUPI}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-900/70 transition-colors"
                        >
                          {copiedUPI ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedUPI ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-xs text-orange-700 dark:text-orange-400">
                      Scan QR code or copy UPI ID for direct transfer. Available 24/7 for instant donations.
                    </p>
                  </div>

                  {/* Razorpay Payment */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-300">Razorpay (Global)</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-400">Credit/Debit cards accepted</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={openDonationLink}
                      className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium mb-4 flex items-center justify-center gap-2"
                    >
                      <Heart className="w-4 h-4" />
                      Donate via Razorpay
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      Secure payment processing. Supports international cards, wallets, and net banking.
                    </p>
                  </div>

                  {/* PayPal Payment */}
                  <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-indigo-900 dark:text-indigo-300">PayPal (International)</h3>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400">Worldwide payments accepted</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={openPayPalLink}
                      className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium mb-4 flex items-center justify-center gap-2"
                    >
                      <Heart className="w-4 h-4" />
                      Donate via PayPal
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    
                    <p className="text-xs text-indigo-700 dark:text-indigo-400">
                      International payments, currency conversion, and buyer protection included.
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 dark:text-green-300 mb-4">🌟 How Your Support Helps</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-800 dark:text-green-400">
                        <Coffee className="w-4 h-4" />
                        <span className="text-sm">Server costs and infrastructure</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-800 dark:text-green-400">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm">New OSINT tool integrations</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-800 dark:text-green-400">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm">Enhanced security features</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-800 dark:text-green-400">
                        <Download className="w-4 h-4" />
                        <span className="text-sm">Mobile app development</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-800 dark:text-green-400">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">Community support and documentation</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-800 dark:text-green-400">
                        <Star className="w-4 h-4" />
                        <span className="text-sm">Regular updates and improvements</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">💡 Other Ways to Support</h3>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <div className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400 mt-0.5" />
                      <span className="text-sm">Star the project on GitHub to show your appreciation</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5" />
                      <span className="text-sm">Share InfoScope with the OSINT and cybersecurity community</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Github className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5" />
                      <span className="text-sm">Contribute code, report bugs, or suggest new features</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Globe className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5" />
                      <span className="text-sm">Write blog posts or tutorials about OSINT investigations</span>
                    </div>
                  </div>
                </div>

                <div className="text-center text-gray-600 dark:text-gray-400">
                  <p className="text-sm">
                    Every contribution, no matter the size, makes a difference. Thank you for supporting 
                    open source OSINT tools and helping make digital investigations more accessible to everyone.
                  </p>
                </div>
              </div>
            )}

            {/* Legal Tab */}
            {activeTab === 'legal' && (
              <div className="space-y-8">
                <div className="text-center">
                  <Scale className="w-16 h-16 text-blue-500 dark:text-blue-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Legal Information</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    InfoScope operates under a comprehensive legal framework ensuring compliance, 
                    privacy protection, and ethical OSINT practices.
                  </p>
                </div>

                {/* Detailed Terms and Conditions */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Scale className="w-5 h-5" />
                    Terms & Conditions
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">1. Acceptable Use Policy</h4>
                      <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-4">
                        <li>• InfoScope must be used only for legitimate, authorized investigations</li>
                        <li>• Users must comply with all applicable local, national, and international laws</li>
                        <li>• Prohibited: harassment, stalking, illegal surveillance, or unauthorized data collection</li>
                        <li>• Users must obtain proper authorization before conducting investigations involving third parties</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">2. User Responsibilities</h4>
                      <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-4">
                        <li>• Maintain professional ethical standards at all times</li>
                        <li>• Respect privacy rights and data protection regulations</li>
                        <li>• Document investigations properly for legal compliance</li>
                        <li>• Report security vulnerabilities responsibly</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">3. Data Protection & Privacy</h4>
                      <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-4">
                        <li>• Data is processed locally whenever possible</li>
                        <li>• No personal data is collected without explicit consent</li>
                        <li>• Users retain full ownership of their investigation data</li>
                        <li>• GDPR, CCPA, and other privacy regulations are respected</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">4. Limitation of Liability</h4>
                      <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-4">
                        <li>• InfoScope is provided "as is" without warranties</li>
                        <li>• Users are solely responsible for their investigation activities</li>
                        <li>• The platform is not liable for misuse or legal violations by users</li>
                        <li>• Results and data accuracy cannot be guaranteed</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-green-600 dark:bg-green-500 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-green-900 dark:text-green-300">Open Source License</h3>
                    </div>
                    <p className="text-green-700 dark:text-green-400 mb-4">
                      Licensed under Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)
                    </p>
                    <ul className="space-y-2 text-sm text-green-600 dark:text-green-400">
                      <li>• Free to use, modify, and distribute</li>
                      <li>• Attribution required</li>
                      <li>• Derivatives must use same license</li>
                      <li>• Commercial use permitted with restrictions</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-purple-600 dark:bg-purple-500 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-300">Privacy Protection</h3>
                    </div>
                    <p className="text-purple-700 dark:text-purple-400 mb-4">
                      Privacy-by-design with minimal data collection and strong user control
                    </p>
                    <ul className="space-y-2 text-sm text-purple-600 dark:text-purple-400">
                      <li>• GDPR compliant framework</li>
                      <li>• Local data storage priority</li>
                      <li>• No tracking or analytics by default</li>
                      <li>• User data ownership and control</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                        <Scale className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-300">Ethical Guidelines</h3>
                    </div>
                    <p className="text-blue-700 dark:text-blue-400 mb-4">
                      Professional standards for responsible OSINT investigations
                    </p>
                    <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                      <li>• Respect for individual privacy</li>
                      <li>• Authorized investigation requirements</li>
                      <li>• Professional conduct standards</li>
                      <li>• Legal compliance verification</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-orange-600 dark:bg-orange-500 rounded-lg flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-300">Compliance Framework</h3>
                    </div>
                    <p className="text-orange-700 dark:text-orange-400 mb-4">
                      Adherence to international standards and regulations
                    </p>
                    <ul className="space-y-2 text-sm text-orange-600 dark:text-orange-400">
                      <li>• GDPR compliance implementation</li>
                      <li>• Security best practices</li>
                      <li>• Legal framework adherence</li>
                      <li>• Industry standards compliance</li>
                    </ul>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => setShowLegalDocs(true)}
                    className="inline-flex items-center gap-2 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <Scale className="w-4 h-4" />
                    View Complete Legal Documentation
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                    Access comprehensive legal documentation including privacy policy, terms of service, 
                    compliance framework, and licensing details.
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <ExternalLink className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">Important Legal Notice</h3>
                      <p className="text-yellow-800 dark:text-yellow-400 text-sm mb-3">
                        While InfoScope provides tools for OSINT investigations, users are solely responsible 
                        for ensuring their activities comply with applicable laws and regulations. Always 
                        consult with legal counsel when conducting sensitive investigations.
                      </p>
                      <p className="text-yellow-800 dark:text-yellow-400 text-sm">
                        <strong>Disclaimer:</strong> InfoScope does not provide legal advice. Users must 
                        understand and comply with their local laws, international regulations, and 
                        professional ethical standards when conducting investigations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legal Documentation Modal */}
        <LegalDocumentation
          isOpen={showLegalDocs}
          onClose={() => setShowLegalDocs(false)}
        />
      </div>
    </div>
  );
}

export default About;