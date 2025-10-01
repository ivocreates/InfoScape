import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  X, 
  RefreshCw, 
  Brain, 
  Zap, 
  Clock,
  Star,
  BookOpen,
  Search,
  Shield
} from 'lucide-react';
import aiService from '../services/aiService';

const WeeklyTips = ({ isOpen, onClose }) => {
  const [currentTip, setCurrentTip] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [weeklyTips, setWeeklyTips] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastGenerated, setLastGenerated] = useState(null);

  // Predefined OSINT tips as fallback
  const fallbackTips = [
    {
      title: "Google Dorking Mastery",
      content: "Use site-specific searches to uncover hidden information: `site:linkedin.com \"Company Name\" \"Executive\"` can reveal organizational structures and key personnel.",
      category: "Search Techniques",
      difficulty: "Intermediate",
      icon: <Search className="w-4 h-4" />
    },
    {
      title: "Metadata Investigation",
      content: "Photos contain valuable metadata (EXIF data) including GPS coordinates, camera settings, and timestamps. Use tools like ExifTool to extract this information.",
      category: "Digital Forensics",
      difficulty: "Advanced",
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      title: "Username Pattern Analysis",
      content: "People often reuse usernames across platforms. Try variations like adding numbers, underscores, or years to find connected accounts.",
      category: "Social Intelligence",
      difficulty: "Beginner",
      icon: <Star className="w-4 h-4" />
    },
    {
      title: "Wayback Machine Research",
      content: "Use archive.org's Wayback Machine to view historical versions of websites and discover deleted or changed content that may be relevant to your investigation.",
      category: "Web Intelligence",
      difficulty: "Beginner",
      icon: <Clock className="w-4 h-4" />
    },
    {
      title: "Legal Compliance Check",
      content: "Always document your OSINT methodology and sources. This creates a defensible audit trail and ensures your investigation meets legal standards.",
      category: "Legal & Ethics",
      difficulty: "Essential",
      icon: <Shield className="w-4 h-4" />
    }
  ];

  // Check if we should show weekly tips (once per week)
  useEffect(() => {
    const lastShown = localStorage.getItem('lastWeeklyTipsShown');
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    if (!lastShown || parseInt(lastShown) < oneWeekAgo) {
      // Generate new tips if we haven't shown them this week
      generateWeeklyTips();
    } else {
      // Load saved tips
      const savedTips = localStorage.getItem('weeklyOSINTTips');
      if (savedTips) {
        setWeeklyTips(JSON.parse(savedTips));
      } else {
        setWeeklyTips(fallbackTips);
      }
    }
  }, []);

  // Generate AI-powered weekly tips
  const generateWeeklyTips = async () => {
    setIsLoading(true);
    
    try {
      const aiTips = [];
      
      // Try to generate 3 AI-powered tips
      for (let i = 0; i < 3; i++) {
        try {
          const prompt = `Generate a concise, actionable OSINT tip for cybersecurity investigators. 
          Focus on practical techniques for: ${i === 0 ? 'search techniques' : i === 1 ? 'social media intelligence' : 'digital forensics'}.
          Include a clear title (max 4 words), content (max 150 words), and difficulty level.
          Make it specific and immediately useful.`;
          
          const response = await aiService.generateResponse(prompt, [], 'gemini');
          
          if (response && response.content) {
            // Parse AI response into structured tip
            const tipData = parseAITipResponse(response.content);
            if (tipData) {
              aiTips.push({
                ...tipData,
                source: 'AI Generated',
                agent: response.provider === 'gemini' ? 'Agent 1' : 'Agent 2'
              });
            }
          }
        } catch (error) {
          console.warn('Failed to generate AI tip:', error);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Combine AI tips with fallback tips
      const combinedTips = aiTips.length > 0 ? [...aiTips, ...fallbackTips.slice(0, 2)] : fallbackTips;
      
      setWeeklyTips(combinedTips);
      setLastGenerated(Date.now());
      
      // Save to localStorage
      localStorage.setItem('weeklyOSINTTips', JSON.stringify(combinedTips));
      localStorage.setItem('lastWeeklyTipsShown', Date.now().toString());
      
    } catch (error) {
      console.error('Failed to generate weekly tips:', error);
      setWeeklyTips(fallbackTips);
    } finally {
      setIsLoading(false);
    }
  };

  // Parse AI response into structured tip format
  const parseAITipResponse = (content) => {
    try {
      // Look for structured content in AI response
      const lines = content.split('\n').filter(line => line.trim());
      
      let title = 'OSINT Tip';
      let tipContent = content;
      let category = 'General';
      let difficulty = 'Intermediate';
      
      // Try to extract title (look for patterns like "Title:" or bold text)
      const titleMatch = content.match(/(?:Title:|#\s*)(.*?)(?:\n|$)/i);
      if (titleMatch) {
        title = titleMatch[1].trim().replace(/[*#]/g, '');
      }
      
      // Extract main content (remove title and metadata)
      tipContent = content
        .replace(/(?:Title:|#\s*).*?\n/i, '')
        .replace(/(?:Category:|Difficulty:).*?\n/gi, '')
        .trim();
      
      // Extract category if mentioned
      const categoryMatch = content.match(/Category:\s*(.*?)(?:\n|$)/i);
      if (categoryMatch) {
        category = categoryMatch[1].trim();
      }
      
      // Extract difficulty if mentioned
      const difficultyMatch = content.match(/Difficulty:\s*(.*?)(?:\n|$)/i);
      if (difficultyMatch) {
        difficulty = difficultyMatch[1].trim();
      }
      
      return {
        title: title.substring(0, 50), // Limit title length
        content: tipContent.substring(0, 200), // Limit content length
        category,
        difficulty,
        icon: <Lightbulb className="w-4 h-4" />
      };
    } catch (error) {
      console.warn('Failed to parse AI tip response:', error);
      return null;
    }
  };

  // Navigate through tips
  const nextTip = () => {
    setCurrentIndex((prev) => (prev + 1) % weeklyTips.length);
  };

  const prevTip = () => {
    setCurrentIndex((prev) => (prev - 1 + weeklyTips.length) % weeklyTips.length);
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
      case 'easy':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'intermediate':
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'advanced':
      case 'hard':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      case 'essential':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  if (!isOpen || weeklyTips.length === 0) return null;

  const currentTipData = weeklyTips[currentIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Weekly OSINT Tips</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tip {currentIndex + 1} of {weeklyTips.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Generating tips...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tip Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {currentTipData.icon}
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {currentTipData.title}
                  </h4>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentTipData.difficulty)}`}>
                  {currentTipData.difficulty}
                </span>
              </div>

              {/* Tip Content */}
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {currentTipData.content}
              </p>

              {/* Tip Meta */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {currentTipData.category}
                </span>
                {currentTipData.agent && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    {currentTipData.agent === 'Agent 1' ? <Brain className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                    <span>{currentTipData.agent}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
          <button
            onClick={prevTip}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={generateWeeklyTips}
              disabled={isLoading}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              title="Generate New Tips"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <button
            onClick={nextTip}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyTips;