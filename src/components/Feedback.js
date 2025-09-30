import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Lightbulb,
  Bug,
  Star,
  ExternalLink,
  Github,
  Users,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Coffee,
  HelpCircle
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Feedback = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('feedback');
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const feedbackTypes = [
    {
      id: 'suggestion',
      label: 'Feature Suggestion',
      icon: Lightbulb,
      description: 'Suggest new features or improvements',
      color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
    },
    {
      id: 'bug',
      label: 'Bug Report',
      icon: Bug,
      description: 'Report issues or bugs you\'ve encountered',
      color: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
    },
    {
      id: 'question',
      label: 'Question',
      icon: HelpCircle,
      description: 'Ask questions about features or usage',
      color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
    },
    {
      id: 'general',
      label: 'General Feedback',
      icon: MessageCircle,
      description: 'Share your thoughts and experiences',
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create GitHub discussion URL with pre-filled content
    const title = `[${feedbackTypes.find(t => t.id === feedbackType)?.label}] ${feedback.slice(0, 50)}${feedback.length > 50 ? '...' : ''}`;
    const body = `
**Feedback Type:** ${feedbackTypes.find(t => t.id === feedbackType)?.label}

**Description:**
${feedback}

**Contact Email:** ${email || 'Not provided'}

**Rating:** ${rating > 0 ? `${rating}/5 stars` : 'Not provided'}

---
*This feedback was submitted through InfoScope OSINT feedback system*
    `.trim();

    const githubUrl = `https://github.com/ivocreates/InfoScape/discussions/new?category=general&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    window.open(githubUrl, '_blank');
    
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setFeedback('');
      setEmail('');
      setRating(0);
    }, 2000);
  };

  const quickActions = [
    {
      title: 'Join Community Discussions',
      description: 'Connect with other OSINT investigators and share knowledge',
      icon: Users,
      action: () => window.open('https://github.com/ivocreates/InfoScape/discussions', '_blank'),
      color: 'bg-blue-600'
    },
    {
      title: 'Star on GitHub',
      description: 'Show your support by starring the project',
      icon: Star,
      action: () => window.open('https://github.com/ivocreates/InfoScape', '_blank'),
      color: 'bg-yellow-600'
    },
    {
      title: 'Report Security Issue',
      description: 'Privately report security vulnerabilities',
      icon: ExternalLink,
      action: () => window.open('https://github.com/ivocreates/InfoScape/security/advisories/new', '_blank'),
      color: 'bg-red-600'
    },
    {
      title: 'Support Development',
      description: 'Help us keep the project free and add new features',
      icon: Coffee,
      action: () => window.open('https://razorpay.me/@ivocreates', '_blank'),
      color: 'bg-green-600'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Feedback & Support</h2>
                <p className="opacity-90 text-sm">Help us improve InfoScope OSINT</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] popup-scrollbar">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <ThumbsUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your feedback has been submitted to GitHub Discussions. 
                Our team will review it and respond soon.
              </p>
            </div>
          ) : (
            <>
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 dark:border-gray-600 mb-6">
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'feedback'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Submit Feedback
                </button>
                <button
                  onClick={() => setActiveTab('community')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'community'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Community & Support
                </button>
              </div>

              {activeTab === 'feedback' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Feedback Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      What type of feedback do you have?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {feedbackTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFeedbackType(type.id)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            feedbackType === type.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${type.color}`}>
                              <type.icon className="w-3 h-3" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{type.label}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{type.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      How would you rate InfoScope OSINT? (Optional)
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`w-8 h-8 transition-colors ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                          }`}
                        >
                          <Star className="w-full h-full fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your feedback *
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      required
                      placeholder={`Please share your ${feedbackTypes.find(t => t.id === feedbackType)?.label.toLowerCase()}...`}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows="4"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      We'll only use this to follow up on your feedback if needed
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!feedback.trim()}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Submit Feedback
                  </button>

                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Your feedback will be posted to our GitHub Discussions for transparency and community engagement.
                  </p>
                </form>
              )}

              {activeTab === 'community' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Join Our Community
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Connect with other OSINT investigators, share knowledge, and help improve InfoScope.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md transition-all text-left"
                      >
                        <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                          <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{action.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Github className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-900">Open Source Project</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      InfoScope OSINT is fully open source. You can contribute code, report issues, 
                      or suggest features on our GitHub repository.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;