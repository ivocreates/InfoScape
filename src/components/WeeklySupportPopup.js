import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Calendar,
  Clock,
  Star,
  ExternalLink,
  BookOpen,
  Video,
  Users,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Zap,
  Heart,
  CreditCard
} from 'lucide-react';

const WeeklySupportPopup = ({ isVisible, onClose, onOpenChat }) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [hasSeenThisWeek, setHasSeenThisWeek] = useState(false);

  // Check if user has seen this week's popup
  useEffect(() => {
    const lastSeen = localStorage.getItem('lastWeeklySupportSeen');
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (lastSeen === weekKey) {
      setHasSeenThisWeek(true);
    }
  }, []);

  // Mark as seen for this week
  const markAsSeen = () => {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekKey = weekStart.toISOString().split('T')[0];
    localStorage.setItem('lastWeeklySupportSeen', weekKey);
    setHasSeenThisWeek(true);
  };

  // Weekly tips rotation
  const weeklyTips = [
    {
      title: "Advanced Google Dorking",
      description: "Master complex search operators to uncover hidden information",
      icon: <BookOpen className="w-6 h-6" />,
      color: "blue",
      tips: [
        "Use site: operator with specific directories: site:github.com/username",
        "Combine filetype: with sensitive keywords: filetype:pdf \"confidential\"",
        "Find exposed databases: intext:\"phpMyAdmin\" \"Welcome to phpMyAdmin\"",
        "Discover forgotten subdomains: site:*.target.com -www"
      ],
      action: "Learn More Dorking",
      actionType: "chat",
      query: "Tell me about advanced Google dorking techniques"
    },
    {
      title: "Social Media Investigation",
      description: "Effective techniques for researching social media profiles",
      icon: <Users className="w-6 h-6" />,
      color: "green",
      tips: [
        "Cross-reference usernames across multiple platforms",
        "Use reverse image search on profile photos",
        "Check posting patterns for location clues",
        "Analyze friend networks for additional leads"
      ],
      action: "Get Social Media Tips",
      actionType: "chat",
      query: "How do I effectively investigate social media profiles?"
    },
    {
      title: "Data Verification Methods",
      description: "Ensure the accuracy and reliability of your findings",
      icon: <CheckCircle className="w-6 h-6" />,
      color: "purple",
      tips: [
        "Always verify information from multiple sources",
        "Check metadata in images and documents",
        "Use fact-checking websites and tools",
        "Document your verification process thoroughly"
      ],
      action: "Learn Verification",
      actionType: "chat",
      query: "What are the best practices for verifying OSINT information?"
    },
    {
      title: "Legal & Ethical Guidelines",
      description: "Stay compliant while conducting investigations",
      icon: <AlertCircle className="w-6 h-6" />,
      color: "red",
      tips: [
        "Only use publicly available information",
        "Respect website terms of service",
        "Maintain detailed documentation",
        "Consider privacy implications of your research"
      ],
      action: "Review Guidelines",
      actionType: "chat",
      query: "What legal and ethical considerations should I follow in OSINT?"
    },
    {
      title: "Tool Mastery",
      description: "Maximize efficiency with the right OSINT tools",
      icon: <Zap className="w-6 h-6" />,
      color: "yellow",
      tips: [
        "Automate repetitive searches with scripts",
        "Use specialized tools for different data types",
        "Keep your toolkit updated regularly",
        "Learn keyboard shortcuts for faster work"
      ],
      action: "Explore Tools",
      actionType: "chat",
      query: "What OSINT tools should I be using for better efficiency?"
    }
  ];

  // Get current week's tip (rotates based on week of year)
  const getCurrentWeekTip = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const weekOfYear = Math.ceil(dayOfYear / 7);
    return weeklyTips[weekOfYear % weeklyTips.length];
  };

  const currentWeekTip = getCurrentWeekTip();

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        border: 'border-blue-200 dark:border-blue-700',
        text: 'text-blue-800 dark:text-blue-200',
        icon: 'text-blue-600 dark:text-blue-400',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        border: 'border-green-200 dark:border-green-700',
        text: 'text-green-800 dark:text-green-200',
        icon: 'text-green-600 dark:text-green-400',
        button: 'bg-green-600 hover:bg-green-700'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        border: 'border-purple-200 dark:border-purple-700',
        text: 'text-purple-800 dark:text-purple-200',
        icon: 'text-purple-600 dark:text-purple-400',
        button: 'bg-purple-600 hover:bg-purple-700'
      },
      red: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        border: 'border-red-200 dark:border-red-700',
        text: 'text-red-800 dark:text-red-200',
        icon: 'text-red-600 dark:text-red-400',
        button: 'bg-red-600 hover:bg-red-700'
      },
      yellow: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        border: 'border-yellow-200 dark:border-yellow-700',
        text: 'text-yellow-800 dark:text-yellow-200',
        icon: 'text-yellow-600 dark:text-yellow-400',
        button: 'bg-yellow-600 hover:bg-yellow-700'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  const colors = getColorClasses(currentWeekTip.color);

  const handleAction = () => {
    markAsSeen();
    if (currentWeekTip.actionType === 'chat') {
      onOpenChat(currentWeekTip.query);
    }
    onClose();
  };

  const handleClose = () => {
    markAsSeen();
    onClose();
  };

  // Don't show if user has already seen this week's popup
  if (!isVisible || hasSeenThisWeek) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full shadow-2xl transform transition-all">
        {/* Header */}
        <div className={`p-6 rounded-t-xl ${colors.bg} ${colors.border} border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center ${colors.border} border-2`}>
                <div className={colors.icon}>
                  {currentWeekTip.icon}
                </div>
              </div>
              <div>
                <h2 className={`text-xl font-bold ${colors.text}`}>Weekly OSINT Tip</h2>
                <div className={`flex items-center gap-2 text-sm ${colors.text} opacity-75`}>
                  <Calendar className="w-4 h-4" />
                  <span>Week of {new Date().toLocaleDateString('en-US', { 
                    month: '2-digit', 
                    day: '2-digit', 
                    year: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white hover:bg-opacity-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-white dark:bg-gray-900">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{currentWeekTip.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{currentWeekTip.description}</p>
            
            <div className="space-y-3">
              {currentWeekTip.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-6 h-6 ${colors.bg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 ${colors.button.split(' ')[0]} rounded-full`}></div>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleAction}
                className={`flex-1 ${colors.button} text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
              >
                <MessageCircle className="w-4 h-4" />
                {currentWeekTip.action}
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Maybe Later
              </button>
            </div>
            
            {/* Support Development Section */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Heart className="w-5 h-5" />
                <div>
                  <h4 className="font-semibold">Support InfoScope Development</h4>
                  <p className="text-sm opacity-90">Help us add more features & keep the project free</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open('https://razorpay.me/@ivocreates', '_blank')}
                  className="flex-1 bg-white text-purple-600 px-3 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Donate ₹50
                </button>
                <button
                  onClick={() => window.open('https://github.com/ivocreates/InfoScape', '_blank')}
                  className="flex-1 bg-white bg-opacity-20 text-white px-3 py-2 rounded-lg font-medium hover:bg-opacity-30 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  Star on GitHub
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                <span>Tip #{Math.floor(new Date().getTime() / (7 * 24 * 60 * 60 * 1000)) % 100}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>New tip every week</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySupportPopup;