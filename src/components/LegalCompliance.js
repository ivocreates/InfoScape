import React, { useState } from 'react';
import { 
  Shield, 
  Eye, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  Scale, 
  FileText, 
  UserCheck,
  Globe,
  Clock,
  Download,
  ExternalLink,
  Book,
  Gavel,
  Info
} from 'lucide-react';

function LegalCompliance() {
  const [activeTab, setActiveTab] = useState('overview');
  const [acceptedTerms, setAcceptedTerms] = useState(localStorage.getItem('legal_terms_accepted') === 'true');
  const [acknowledgedRisks, setAcknowledgedRisks] = useState(localStorage.getItem('legal_risks_acknowledged') === 'true');

  const handleAcceptTerms = () => {
    setAcceptedTerms(true);
    localStorage.setItem('legal_terms_accepted', 'true');
    localStorage.setItem('legal_acceptance_date', new Date().toISOString());
  };

  const handleAcknowledgeRisks = () => {
    setAcknowledgedRisks(true);
    localStorage.setItem('legal_risks_acknowledged', 'true');
    localStorage.setItem('legal_risks_date', new Date().toISOString());
  };

  const tabs = [
    { id: 'overview', name: 'Legal Overview', icon: Scale },
    { id: 'terms', name: 'Terms of Use', icon: FileText },
    { id: 'privacy', name: 'Privacy Policy', icon: Lock },
    { id: 'ethics', name: 'OSINT Ethics', icon: UserCheck },
    { id: 'compliance', name: 'Compliance Guide', icon: CheckCircle },
    { id: 'disclaimers', name: 'Disclaimers', icon: AlertTriangle }
  ];

  const legalStatuses = [
    {
      title: 'Terms of Service',
      status: acceptedTerms ? 'accepted' : 'pending',
      description: 'User agreement for InfoScope platform usage',
      action: acceptedTerms ? 'Accepted' : 'Review Required'
    },
    {
      title: 'Privacy Policy',
      status: 'active',
      description: 'Data protection and privacy guidelines',
      action: 'Compliant'
    },
    {
      title: 'OSINT Ethics',
      status: acknowledgedRisks ? 'acknowledged' : 'pending',
      description: 'Ethical investigation practices and boundaries',
      action: acknowledgedRisks ? 'Acknowledged' : 'Review Required'
    },
    {
      title: 'Data Retention',
      status: 'active',
      description: 'Information storage and deletion policies',
      action: 'Auto-Managed'
    }
  ];

  const complianceChecklist = [
    { item: 'Only use publicly available information', completed: true },
    { item: 'Respect website Terms of Service', completed: true },
    { item: 'Follow applicable privacy laws (GDPR, CCPA)', completed: true },
    { item: 'Document investigation methodology', completed: false },
    { item: 'Verify information from multiple sources', completed: false },
    { item: 'Maintain ethical boundaries', completed: true },
    { item: 'Protect subject privacy when possible', completed: false },
    { item: 'Regular legal compliance review', completed: false }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Legal Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {legalStatuses.map((item, index) => (
          <div key={index} className="card p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                item.status === 'accepted' || item.status === 'active' || item.status === 'acknowledged'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
              }`}>
                {item.status === 'accepted' || item.status === 'active' || item.status === 'acknowledged' ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <Clock className="w-3 h-3 mr-1" />
                )}
                {item.action}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Compliance Checklist */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
          OSINT Compliance Checklist
        </h3>
        <div className="space-y-3">
          {complianceChecklist.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                item.completed 
                  ? 'bg-green-500 border-green-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <span className={`${
                item.completed 
                  ? 'text-gray-900 dark:text-white' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {item.item}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300">Compliance Tip</h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Regular compliance reviews help ensure your OSINT activities remain ethical and legal. 
                Consider documenting your methodology and maintaining evidence of proper procedures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTerms = () => (
    <div className="space-y-6">
      <div className="card p-8">
        <div className="text-center mb-8">
          <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Last updated: October 2025</p>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-6">
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">1. Acceptable Use</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>InfoScope is designed for legitimate OSINT research and investigation purposes. Users must:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the platform only for lawful purposes</li>
                <li>Respect intellectual property rights</li>
                <li>Comply with applicable data protection laws</li>
                <li>Not attempt to circumvent security measures</li>
                <li>Maintain ethical standards in investigations</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">2. User Responsibilities</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>Users are responsible for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Ensuring legal compliance in their jurisdiction</li>
                <li>Protecting sensitive information discovered during investigations</li>
                <li>Verifying information before taking action</li>
                <li>Respecting privacy rights of individuals</li>
                <li>Maintaining confidentiality when required</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">3. Prohibited Activities</h3>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-red-800 dark:text-red-300">
                  <p className="font-medium">Strictly Prohibited:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>Hacking or unauthorized access attempts</li>
                    <li>Harassment or stalking individuals</li>
                    <li>Violating platform terms of service</li>
                    <li>Illegal surveillance activities</li>
                    <li>Sharing malicious content or malware</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">4. Platform Disclaimers</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>InfoScope provides tools and information "as is" without warranties. We do not guarantee:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Accuracy of third-party data sources</li>
                <li>Continuous availability of external services</li>
                <li>Legal compliance in all jurisdictions</li>
                <li>Fitness for specific investigation purposes</li>
              </ul>
            </div>
          </section>
        </div>

        {!acceptedTerms && (
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-blue-900 dark:text-blue-300">Accept Terms of Service</h4>
                <p className="text-blue-700 dark:text-blue-400 mt-1">
                  By accepting, you agree to use InfoScope responsibly and ethically.
                </p>
              </div>
              <button
                onClick={handleAcceptTerms}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Accept Terms
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6">
      <div className="card p-8">
        <div className="text-center mb-8">
          <Lock className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Your privacy and data protection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Data Protection</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              We protect your personal information with enterprise-grade security.
            </p>
          </div>
          <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Eye className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Transparency</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Clear policies on what data we collect and how it's used.
            </p>
          </div>
          <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <UserCheck className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white">User Control</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              You control your data with options to export or delete.
            </p>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-6">
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Data Collection</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>We collect minimal data necessary for platform functionality:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Account information (email, username)</li>
                <li>Investigation data you choose to save</li>
                <li>Usage analytics (anonymized)</li>
                <li>Security logs for platform protection</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Data Usage</h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>Your data is used exclusively for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Platform functionality and features</li>
                <li>Account management and security</li>
                <li>Improving user experience</li>
                <li>Legal compliance requirements</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Data Protection</h3>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-green-800 dark:text-green-300">
                  <p className="font-medium">Security Measures:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                    <li>End-to-end encryption for sensitive data</li>
                    <li>Regular security audits and updates</li>
                    <li>Secure data centers with SOC 2 compliance</li>
                    <li>Multi-factor authentication support</li>
                    <li>GDPR and CCPA compliance</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  const renderEthics = () => (
    <div className="space-y-6">
      <div className="card p-8">
        <div className="text-center mb-8">
          <UserCheck className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">OSINT Ethics Guide</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Responsible investigation practices</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
              Best Practices
            </h3>
            <div className="space-y-4">
              {[
                'Use only publicly available information',
                'Verify information from multiple sources',
                'Respect privacy and dignity of subjects',
                'Document methodology transparently',
                'Consider legal implications',
                'Protect sensitive findings appropriately'
              ].map((practice, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{practice}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
              Avoid These Actions
            </h3>
            <div className="space-y-4">
              {[
                'Social engineering or deception',
                'Accessing private accounts or data',
                'Harassment or stalking behavior',
                'Sharing personal information publicly',
                'Using information for harmful purposes',
                'Ignoring terms of service'
              ].map((avoid, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{avoid}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!acknowledgedRisks && (
          <div className="mt-8 p-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-purple-900 dark:text-purple-300">Acknowledge Ethical Guidelines</h4>
                <p className="text-purple-700 dark:text-purple-400 mt-1">
                  Confirm you understand the ethical responsibilities of OSINT work.
                </p>
              </div>
              <button
                onClick={handleAcknowledgeRisks}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                I Understand
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="card p-8">
        <div className="text-center mb-8">
          <Scale className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Compliance Guide</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Legal frameworks and requirements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'GDPR Compliance',
              icon: Globe,
              description: 'European data protection regulations',
              points: [
                'Data minimization principles',
                'User consent requirements',
                'Right to be forgotten',
                'Data portability rights'
              ]
            },
            {
              title: 'CCPA Compliance',
              icon: Gavel,
              description: 'California privacy regulations',
              points: [
                'Consumer privacy rights',
                'Data disclosure requirements',
                'Opt-out mechanisms',
                'Non-discrimination policies'
              ]
            },
            {
              title: 'Industry Standards',
              icon: Book,
              description: 'Professional OSINT standards',
              points: [
                'OWASP OSINT guidelines',
                'Ethical investigation frameworks',
                'Professional certification standards',
                'International best practices'
              ]
            }
          ].map((item, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <item.icon className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {item.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDisclaimers = () => (
    <div className="space-y-6">
      <div className="card p-8">
        <div className="text-center mb-8">
          <AlertTriangle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Important Disclaimers</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Legal limitations and warnings</p>
        </div>

        <div className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                  Information Accuracy
                </h3>
                <p className="text-yellow-800 dark:text-yellow-400">
                  InfoScope aggregates data from multiple third-party sources. We cannot guarantee the accuracy, 
                  completeness, or timeliness of external data. Always verify information independently before 
                  making decisions based on OSINT findings.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2">
                  Legal Responsibility
                </h3>
                <p className="text-red-800 dark:text-red-400">
                  Users are solely responsible for ensuring their use of InfoScope complies with applicable 
                  laws and regulations in their jurisdiction. This includes but is not limited to privacy laws, 
                  data protection regulations, and investigation licensing requirements.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Platform Limitations
                </h3>
                <p className="text-blue-800 dark:text-blue-400">
                  InfoScope is provided "as is" without warranties of any kind. We do not guarantee continuous 
                  availability, accuracy of results, or fitness for any particular purpose. External service 
                  availability may vary and is beyond our control.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p>For legal inquiries: legal@infoscope.com</p>
              <p>For privacy concerns: privacy@infoscope.com</p>
              <p>For compliance questions: compliance@infoscope.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 scrollbar-primary">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Legal & Compliance Center</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Understanding your rights, responsibilities, and ethical obligations
          </p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`card p-6 border-l-4 ${acceptedTerms ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Terms Status</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {acceptedTerms ? 'Accepted' : 'Pending Review'}
                </p>
              </div>
              {acceptedTerms ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <Clock className="w-8 h-8 text-yellow-600" />
              )}
            </div>
          </div>

          <div className="card p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy Compliant</h3>
                <p className="text-gray-600 dark:text-gray-300">GDPR & CCPA Ready</p>
              </div>
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className={`card p-6 border-l-4 ${acknowledgedRisks ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ethics Training</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {acknowledgedRisks ? 'Completed' : 'Required'}
                </p>
              </div>
              {acknowledgedRisks ? (
                <UserCheck className="w-8 h-8 text-green-600" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="card p-0 mb-8 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 overflow-x-auto scrollbar-primary" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="results-scroll max-h-screen overflow-y-auto">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'terms' && renderTerms()}
          {activeTab === 'privacy' && renderPrivacy()}
          {activeTab === 'ethics' && renderEthics()}
          {activeTab === 'compliance' && renderCompliance()}
          {activeTab === 'disclaimers' && renderDisclaimers()}
        </div>
      </div>
    </div>
  );
}

export default LegalCompliance;