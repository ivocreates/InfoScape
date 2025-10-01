import React, { useState } from 'react';
import {
  Shield,
  FileText,
  Scale,
  Users,
  Lock,
  Eye,
  Download,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  X,
  Info,
  Menu,
  ChevronLeft
} from 'lucide-react';

const LegalDocumentation = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Legal Overview', icon: Shield },
    { id: 'license', label: 'License', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', icon: Lock },
    { id: 'terms', label: 'Terms of Service', icon: Scale },
    { id: 'conditions', label: 'Terms & Conditions', icon: Users },
    { id: 'compliance', label: 'Compliance', icon: CheckCircle },
    { id: 'disclaimer', label: 'Disclaimer', icon: AlertTriangle }
  ];

  if (!isOpen) return null;

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
            <Info className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">InfoScope Legal Framework</h3>
            <p className="text-blue-800 dark:text-blue-200 mb-4">
              InfoScope is committed to providing a legally compliant, ethical, and transparent OSINT platform. 
              This documentation outlines our legal framework, user responsibilities, and compliance requirements.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <CheckCircle className="w-4 h-4" />
                <span>Open Source License (CC BY-SA 4.0)</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <CheckCircle className="w-4 h-4" />
                <span>Privacy-First Design</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700">
                <CheckCircle className="w-4 h-4" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700">
                <CheckCircle className="w-4 h-4" />
                <span>Ethical OSINT Guidelines</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Open Source License</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            InfoScope is licensed under Creative Commons Attribution-ShareAlike 4.0 International License, 
            promoting transparency and community collaboration.
          </p>
          <button
            onClick={() => setActiveTab('license')}
            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium flex items-center gap-2"
          >
            View License Details <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy Protection</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We implement privacy-by-design principles, minimal data collection, and strong user control 
            over personal information.
          </p>
          <button
            onClick={() => setActiveTab('privacy')}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium flex items-center gap-2"
          >
            View Privacy Policy <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Terms of Service</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Clear guidelines for acceptable use, user responsibilities, and service limitations 
            to ensure ethical OSINT practices.
          </p>
          <button
            onClick={() => setActiveTab('terms')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-2"
          >
            View Terms <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Legal Disclaimer</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Important disclaimers regarding tool usage, liability limitations, and user responsibilities 
            in OSINT investigations.
          </p>
          <button
            onClick={() => setActiveTab('disclaimer')}
            className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium flex items-center gap-2"
          >
            View Disclaimer <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Principles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Transparency</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Open source, auditable code and clear documentation</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Ethics</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Responsible OSINT practices and user guidelines</p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Community</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Collaborative development and shared knowledge</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLicense = () => (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-600 dark:bg-green-700 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-900 dark:text-green-100">Creative Commons License</h3>
            <p className="text-green-700 dark:text-green-300">Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Official License
          </a>
          <button className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-green-600 border border-green-200 px-4 py-2 rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4" />
            Download License
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">License Summary</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Share</h4>
              <p className="text-gray-600">Copy and redistribute the material in any medium or format</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Adapt</h4>
              <p className="text-gray-600">Remix, transform, and build upon the material for any purpose</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Attribution Required</h4>
              <p className="text-gray-600">You must give appropriate credit and indicate if changes were made</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">ShareAlike</h4>
              <p className="text-gray-600">If you remix or transform the material, you must distribute under the same license</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attribution Guidelines</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">How to Attribute InfoScope:</h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <code className="text-sm text-gray-800">
                InfoScope OSINT Platform by @ivocreates, licensed under CC BY-SA 4.0.<br/>
                Source: https://github.com/ivocreates/InfoScape<br/>
                License: https://creativecommons.org/licenses/by-sa/4.0/
              </code>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Required Elements:</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• Title of the work: "InfoScope OSINT Platform"</li>
              <li>• Creator: "@ivocreates"</li>
              <li>• Source URL: https://github.com/ivocreates/InfoScape</li>
              <li>• License: "CC BY-SA 4.0" with link to license</li>
              <li>• Changes: Indicate if you modified the original work</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Contribution Guidelines</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">🚫 What You CANNOT Do:</h4>
            <ul className="space-y-2 text-red-700">
              <li>• ❌ Claim this software as your own creation</li>
              <li>• ❌ Remove attribution or copyright notices</li>
              <li>• ❌ Sell or commercially license without proper attribution</li>
              <li>• ❌ Copy the strategy or codebase without giving credit</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">✅ How You CAN Contribute:</h4>
            <ul className="space-y-2 text-green-700">
              <li>• 🍴 Fork the repository on GitHub</li>
              <li>• 📧 Submit feature requests via email: ivocreates@proton.me</li>
              <li>• 💬 Participate in discussions for feedback and issues</li>
              <li>• 🔄 Submit pull requests with improvements</li>
              <li>• 🐛 Report bugs and security issues responsibly</li>
              <li>• 📚 Contribute to documentation and translations</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">📞 Contact Information:</h4>
            <div className="bg-white border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800">Email: <strong>ivocreates@proton.me</strong></p>
              <p className="text-blue-800">GitHub: <strong>@ivocreates</strong></p>
              <p className="text-blue-800">Repository: <strong>github.com/ivocreates/InfoScape</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-purple-900">Privacy Policy</h3>
            <p className="text-purple-700">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <p className="text-purple-800">
          InfoScope is committed to protecting your privacy and implementing privacy-by-design principles 
          throughout our platform.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Collection</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Information We Collect:</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• <strong>Account Information:</strong> Email address, display name (when you create an account)</li>
                <li>• <strong>Investigation Data:</strong> Saved investigations and search queries (stored locally and optionally in Firebase)</li>
                <li>• <strong>Usage Analytics:</strong> Anonymous usage statistics to improve the platform (optional)</li>
                <li>• <strong>Browser Information:</strong> Browser type and version for compatibility (not personally identifiable)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Information We Do NOT Collect:</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Personal browsing history outside InfoScope</li>
                <li>• Content of your OSINT investigations</li>
                <li>• Passwords (we use Firebase Authentication)</li>
                <li>• Location data or device identifiers</li>
                <li>• Third-party service credentials</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Usage & Storage</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">How We Use Your Data:</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Provide and maintain InfoScope services</li>
                <li>• Sync your investigations across devices (if enabled)</li>
                <li>• Improve platform functionality and user experience</li>
                <li>• Provide customer support and respond to inquiries</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Data Storage:</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• <strong>Local Storage:</strong> Most data is stored locally on your device</li>
                <li>• <strong>Firebase:</strong> Account data and optionally investigation syncing</li>
                <li>• <strong>Encryption:</strong> All data transmission is encrypted via HTTPS</li>
                <li>• <strong>Retention:</strong> Data is retained only as long as necessary</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Rights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">Access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">Rectification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">Erasure</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">Portability</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">Objection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">Restriction</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 mt-4">
            To exercise your rights, contact us at privacy@infoscope.com or use the data export/deletion 
            features in your account settings.
          </p>
        </div>
      </div>
    </div>
  );

  const renderTerms = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-900">Terms of Service</h3>
            <p className="text-blue-700">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <p className="text-blue-800">
          By using InfoScope, you agree to these terms and commit to ethical and legal OSINT practices.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acceptable Use</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2 text-green-700">✓ Permitted Uses:</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Legal research and investigation using publicly available information</li>
                <li>• Academic research and educational purposes</li>
                <li>• Cybersecurity research and threat analysis</li>
                <li>• Journalism and fact-checking activities</li>
                <li>• Due diligence and background verification</li>
                <li>• Personal research and genealogy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2 text-red-700">✗ Prohibited Uses:</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Stalking, harassment, or intimidation of individuals</li>
                <li>• Accessing private or password-protected information</li>
                <li>• Violating terms of service of third-party websites</li>
                <li>• Commercial spamming or unauthorized data scraping</li>
                <li>• Activities that violate local, national, or international laws</li>
                <li>• Doxxing or publishing private information without consent</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Responsibilities</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Legal Compliance</h4>
                <p className="text-gray-600">Ensure all activities comply with applicable laws and regulations in your jurisdiction.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Ethical Standards</h4>
                <p className="text-gray-600">Maintain high ethical standards and respect for privacy and human rights.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Documentation</h4>
                <p className="text-gray-600">Maintain proper documentation of your research methodology and sources.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Respect for Others</h4>
                <p className="text-gray-600">Respect the privacy and dignity of individuals in your research.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Limitations</h3>
          <div className="space-y-3 text-gray-600">
            <p>• InfoScope is provided "as is" without warranties of any kind</p>
            <p>• We do not guarantee the accuracy or completeness of any information</p>
            <p>• Service availability may be subject to maintenance and updates</p>
            <p>• We reserve the right to modify or discontinue features with notice</p>
            <p>• Rate limiting may apply to prevent abuse</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConditions = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">Terms & Conditions</h3>
            <p className="text-blue-700 dark:text-blue-300">User Agreement and Conditions of Use</p>
          </div>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-blue-800 dark:text-blue-200">
            By using InfoScope OSINT Platform, you agree to the following terms and conditions. 
            Please read carefully before proceeding with your investigation activities.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Agreement</h4>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <div>
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Acceptance of Terms</h5>
            <p>By accessing and using this platform, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.</p>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Intended Use</h5>
            <ul className="list-disc ml-6 space-y-1">
              <li>InfoScope is designed for legitimate OSINT investigations only</li>
              <li>Users must comply with all applicable laws and regulations</li>
              <li>Platform must not be used for illegal activities or harassment</li>
              <li>Respect privacy rights and data protection laws</li>
            </ul>
          </div>

          <div>
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">User Responsibilities</h5>
            <ul className="list-disc ml-6 space-y-1">
              <li>Verify accuracy of information obtained through investigations</li>
              <li>Maintain confidentiality of sensitive investigation data</li>
              <li>Report any security vulnerabilities or bugs discovered</li>
              <li>Use the platform ethically and professionally</li>
            </ul>
          </div>

          <div>
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Prohibited Activities</h5>
            <ul className="list-disc ml-6 space-y-1">
              <li>Attempting to bypass security measures or rate limits</li>
              <li>Using the platform for stalking, harassment, or illegal surveillance</li>
              <li>Sharing credentials or unauthorized access to accounts</li>
              <li>Reverse engineering or attempting to extract proprietary code</li>
            </ul>
          </div>

          <div>
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Data Protection</h5>
            <ul className="list-disc ml-6 space-y-1">
              <li>Users are responsible for protecting sensitive investigation data</li>
              <li>Platform data should not be shared with unauthorized parties</li>
              <li>Users must comply with GDPR, CCPA, and local privacy laws</li>
              <li>Delete unnecessary data when investigations are complete</li>
            </ul>
          </div>

          <div>
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Limitation of Liability</h5>
            <p>InfoScope OSINT Platform is provided "as is" without warranties. Users assume full responsibility for their investigation activities and any consequences thereof.</p>
          </div>

          <div>
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Termination</h5>
            <p>We reserve the right to terminate access for users who violate these terms or engage in activities that compromise the platform's security or integrity.</p>
          </div>

          <div>
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Updates to Terms</h5>
            <p>These terms may be updated periodically. Users will be notified of significant changes and continued use constitutes acceptance of updated terms.</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Important Notice</h4>
            <p className="text-yellow-800 dark:text-yellow-200">
              These terms and conditions are legally binding. If you do not agree with any part of these terms, 
              please discontinue use of the platform immediately. For questions about these terms, 
              please contact our legal team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-900">Compliance Framework</h3>
            <p className="text-green-700">InfoScope adheres to international standards and regulations</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">GDPR Compliance</h3>
          </div>
          <ul className="space-y-2 text-gray-600">
            <li>• Privacy by design and by default</li>
            <li>• Lawful basis for data processing</li>
            <li>• Data subject rights implementation</li>
            <li>• Data minimization principles</li>
            <li>• Cross-border data transfer protections</li>
            <li>• Data breach notification procedures</li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Security Standards</h3>
          </div>
          <ul className="space-y-2 text-gray-600">
            <li>• End-to-end encryption for data transmission</li>
            <li>• Secure authentication via Firebase</li>
            <li>• Regular security audits and updates</li>
            <li>• Minimal data collection practices</li>
            <li>• Secure development lifecycle</li>
            <li>• Vulnerability disclosure program</li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Legal Framework</h3>
          </div>
          <ul className="space-y-2 text-gray-600">
            <li>• International human rights standards</li>
            <li>• National data protection laws</li>
            <li>• Computer fraud and abuse prevention</li>
            <li>• Terms of service compliance</li>
            <li>• Copyright and intellectual property respect</li>
            <li>• Cross-jurisdictional legal considerations</li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Industry Standards</h3>
          </div>
          <ul className="space-y-2 text-gray-600">
            <li>• OSINT ethical guidelines</li>
            <li>• Information security best practices</li>
            <li>• Open source development standards</li>
            <li>• Accessibility compliance (WCAG)</li>
            <li>• Quality assurance processes</li>
            <li>• Community contribution guidelines</li>
          </ul>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">Important Notice</h3>
            <p className="text-yellow-800">
              While InfoScope implements comprehensive compliance measures, users remain responsible for 
              ensuring their specific use cases comply with applicable local, national, and international laws. 
              When in doubt, consult with legal counsel before proceeding with sensitive investigations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDisclaimer = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-orange-900">Legal Disclaimer</h3>
            <p className="text-orange-700">Important limitations and user responsibilities</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Disclaimer</h3>
          <div className="space-y-4 text-gray-600">
            <p>
              <strong>No Warranty:</strong> InfoScope is provided "as is" and "as available" without any warranties, 
              express or implied, including but not limited to warranties of merchantability, fitness for a particular 
              purpose, or non-infringement.
            </p>
            <p>
              <strong>Information Accuracy:</strong> We make no representations or warranties about the accuracy, 
              completeness, or reliability of any information obtained through InfoScope. Users must verify all 
              information independently.
            </p>
            <p>
              <strong>Third-Party Services:</strong> InfoScope integrates with various third-party services and 
              websites. We are not responsible for the availability, content, or policies of these external services.
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Limitation of Liability</h3>
          <div className="space-y-4 text-gray-600">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-semibold">
                ⚠️ IMPORTANT: The creator (@ivocreates) shall NOT be held liable for any misuse, illegal activities, 
                or consequences arising from the use of InfoScope OSINT Platform.
              </p>
            </div>
            <p>
              <strong>No Consequential Damages:</strong> In no event shall InfoScope, its developers (@ivocreates), or contributors 
              be liable for any indirect, incidental, special, consequential, or punitive damages arising from your 
              use of the service.
            </p>
            <p>
              <strong>Maximum Liability:</strong> Our total liability for any claims related to InfoScope shall not 
              exceed the amount you paid for the service (which is currently $0 as InfoScope is free and open source).
            </p>
            <p>
              <strong>Legal Consequences:</strong> Users are solely responsible for any legal consequences arising 
              from their use of InfoScope, including but not limited to violations of privacy laws, terms of service 
              of third-party websites, or other applicable regulations.
            </p>
            <p>
              <strong>User Responsibility:</strong> By using this software, you acknowledge that you are using it at your own risk 
              and that @ivocreates cannot be held responsible for any damage, legal issues, or problems that may arise.
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Responsibilities</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Legal Compliance</h4>
                <p className="text-gray-600">
                  You are solely responsible for ensuring your use of InfoScope complies with all applicable laws, 
                  regulations, and third-party terms of service.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Ethical Use</h4>
                <p className="text-gray-600">
                  You must use InfoScope ethically and responsibly, respecting privacy rights and avoiding harm 
                  to individuals or organizations.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Information Verification</h4>
                <p className="text-gray-600">
                  You must independently verify any information obtained through InfoScope before taking action 
                  based on such information.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-2">Critical Warning</h3>
              <p className="text-red-800 mb-4">
                OSINT activities can have serious legal, ethical, and safety implications. Always:
              </p>
              <ul className="space-y-2 text-red-700">
                <li>• Consult with legal counsel when in doubt</li>
                <li>• Respect privacy and human rights</li>
                <li>• Follow your organization's policies</li>
                <li>• Consider the potential impact of your research</li>
                <li>• Maintain detailed documentation of your methodology</li>
                <li>• Operate within legal and ethical boundaries at all times</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'license':
        return renderLicense();
      case 'privacy':
        return renderPrivacy();
      case 'terms':
        return renderTerms();
      case 'conditions':
        return renderConditions();
      case 'compliance':
        return renderCompliance();
      case 'disclaimer':
        return renderDisclaimer();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-6 sm:w-8 lg:w-10 h-6 sm:h-8 lg:h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
              <Shield className="w-3 sm:w-4 lg:w-5 h-3 sm:h-4 lg:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">Legal Documentation</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">InfoScope compliance and legal framework</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-transparent hover:border-red-200 dark:hover:border-red-800 shadow-lg hover:shadow-xl"
            title="Close Legal Documentation"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex h-[calc(95vh-60px)] sm:h-[calc(90vh-80px)] lg:h-[calc(90vh-88px)] relative">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            fixed md:relative left-0 top-0 w-64 h-full md:w-64 bg-gray-50 dark:bg-gray-900 
            border-r border-gray-200 dark:border-gray-700 p-3 sm:p-4 overflow-y-auto 
            transition-transform duration-300 ease-in-out z-20 md:z-0
          `}>
            {/* Mobile close button */}
            <div className="md:hidden flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Menu</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false); // Close sidebar on mobile after selection
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors w-full ${
                    activeTab === tab.id
                      ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 popup-scrollbar bg-white dark:bg-gray-800">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalDocumentation;