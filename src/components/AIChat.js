import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
  X,
  Loader,
  AlertCircle,
  Lightbulb,
  Shield,
  Search,
  Globe,
  Database,
  Settings,
  HelpCircle,
  Wifi,
  WifiOff,
  RotateCcw,
  Zap,
  Brain
} from 'lucide-react';
import aiService from '../services/aiService';

const AIChat = ({ isOpen, onClose, onMinimize, isMinimized, initialMessage = null }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your OSINT AI assistant with dual agent support. I can help you with investigation techniques, search strategies, data analysis, and legal compliance. What would you like to know?',
      timestamp: new Date(),
      suggestions: aiService.getOSINTSuggestions().slice(0, 4)
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [currentProvider, setCurrentProvider] = useState('auto');
  const [selectedAgent, setSelectedAgent] = useState('gemini'); // Track which agent user prefers
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Helper function to get masked agent names
  const getAgentName = (provider) => {
    switch (provider) {
      case 'gemini':
        return 'Agent 1';
      case 'openai':
        return 'Agent 2';
      default:
        return 'AI Assistant';
    }
  };

  // Handle agent switching
  const handleAgentSwitch = (agent) => {
    setSelectedAgent(agent);
    setCurrentProvider(agent);
    
    // Add a system message about the switch
    const switchMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: `Switched to ${getAgentName(agent)}`,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, switchMessage]);
  };

  // Check AI service status on component mount
  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const status = await aiService.getStatus();
        setConnectionStatus(status.available ? 'connected' : 'offline');
        setCurrentProvider(status.currentProvider);
      } catch (error) {
        console.error('Failed to check AI status:', error);
        setConnectionStatus('offline');
      }
    };
    
    checkAIStatus();
  }, []);

  // Handle initial message from weekly support popup
  useEffect(() => {
    if (initialMessage && typeof initialMessage === 'string' && initialMessage.trim()) {
      setInputMessage(initialMessage);
      // Auto-send the message after a brief delay
      setTimeout(() => {
        if (inputMessage !== initialMessage) {
          handleSendMessage();
        }
      }, 500);
    }
  }, [initialMessage]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Enhanced AI response generator with dual API support
  const generateAIResponse = async (userMessage) => {
    setIsLoading(true);
    setConnectionStatus('connecting');
    
    try {
      // Pass selected agent preference to AI service
      const result = await aiService.generateResponse(userMessage, messages, selectedAgent);
      setConnectionStatus('connected');
      setCurrentProvider(result.provider);
      
      return {
        content: result.content,
        provider: result.provider,
        usedFallback: result.usedFallback
      };
      
    } catch (error) {
      console.error('AI service failed:', error);
      setConnectionStatus('offline');
      
      // Use local fallback responses
      const fallbackResponse = await getFallbackResponse(userMessage);
      return {
        content: fallbackResponse,
        provider: 'fallback',
        usedFallback: true
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback response system for when AI APIs are unavailable
  const getFallbackResponse = async (userMessage) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock responses based on common OSINT questions (original logic)
    const responses = {
      investigation: "For OSINT investigations, start with these key steps:\n\n1. **Define your objective** - Clearly state what you're trying to find\n2. **Create a search plan** - Outline data sources and methods\n3. **Document everything** - Keep detailed records of your process\n4. **Verify information** - Cross-reference findings across multiple sources\n5. **Respect privacy** - Only use publicly available information\n\nWould you like me to elaborate on any of these steps?",
      
      dorking: "Here are powerful Google dorking techniques:\n\n**Site-specific searches:**\n• `site:linkedin.com \"company name\"`\n• `site:github.com \"API key\"`\n• `site:pastebin.com \"password\"`\n\n**File type searches:**\n• `filetype:pdf \"confidential\"`\n• `filetype:xlsx \"employee list\"`\n• `filetype:doc \"internal memo\"`\n\n**Advanced operators:**\n• `inurl:admin` - Find admin pages\n• `intitle:\"index of\"` - Directory listings\n• `cache:example.com` - Cached versions\n\n**Remember:** Always ensure your searches comply with legal and ethical guidelines.",
      
      social: "To verify social media profiles effectively:\n\n**Cross-platform verification:**\n• Check if the same username exists across platforms\n• Look for consistent profile photos and information\n• Verify posting patterns and timestamps\n\n**Technical verification:**\n• Use reverse image search on profile photos\n• Check metadata in uploaded images\n• Analyze posting times for geographic consistency\n\n**Behavioral analysis:**\n• Review writing style and language patterns\n• Check friend/follower networks\n• Look for authentic interactions and engagement\n\n**Tools to use:**\n• TinEye or Google Images for reverse searches\n• Social media search engines like Pipl\n• Username checkers like Namechk",
      
      legal: "Important legal considerations for OSINT:\n\n**Stay within legal boundaries:**\n• Only use publicly available information\n• Respect terms of service of websites\n• Don't use social engineering or deception\n• Avoid accessing private or password-protected content\n\n**Privacy and ethics:**\n• Consider the privacy impact of your investigation\n• Don't share personal information without consent\n• Be mindful of potential harm to individuals\n• Follow your organization's ethical guidelines\n\n**Documentation:**\n• Keep detailed records of your sources\n• Screenshot evidence with timestamps\n• Maintain chain of custody for digital evidence\n• Document your methodology\n\n**When in doubt, consult with legal counsel before proceeding.**",
      
      default: "I understand you're looking for OSINT guidance. I can help with:\n\n🔍 **Investigation Techniques** - Research methodologies and best practices\n🌐 **Search Strategies** - Advanced search operators and tools\n📊 **Data Analysis** - Processing and verifying information\n⚖️ **Legal Compliance** - Ethical and legal considerations\n🛡️ **Security** - Protecting yourself during investigations\n🔧 **Tools & Resources** - Recommended OSINT tools and platforms\n\nWhat specific area would you like to explore?"
    };

    // Simple keyword matching for responses
    const lowerMessage = userMessage.toLowerCase();
    let response = responses.default;
    
    if (lowerMessage.includes('investigation') || lowerMessage.includes('start')) {
      response = responses.investigation;
    } else if (lowerMessage.includes('dork') || lowerMessage.includes('google') || lowerMessage.includes('search')) {
      response = responses.dorking;
    } else if (lowerMessage.includes('social') || lowerMessage.includes('profile') || lowerMessage.includes('verify')) {
      response = responses.social;
    } else if (lowerMessage.includes('legal') || lowerMessage.includes('law') || lowerMessage.includes('ethical')) {
      response = responses.legal;
    }

    return response;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Generate AI response
    const aiResponse = await generateAIResponse(userMessage.content);
    
    const botMessage = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: aiResponse.content,
      timestamp: new Date(),
      provider: aiResponse.provider,
      usedFallback: aiResponse.usedFallback
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'bot',
        content: 'Hello! I\'m your OSINT AI assistant with dual agent support. I can help you with investigation techniques, search strategies, data analysis, and legal compliance. What would you like to know?',
        timestamp: new Date(),
        suggestions: aiService.getOSINTSuggestions().slice(0, 4)
      }
    ]);
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-3 h-3 text-green-500" />;
      case 'connecting':
        return <Loader className="w-3 h-3 text-yellow-500 animate-spin" />;
      case 'offline':
        return <WifiOff className="w-3 h-3 text-blue-500" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return <WifiOff className="w-3 h-3 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        const providerName = getAgentName(currentProvider);
        return `${providerName} Online`;
      case 'connecting':
        return 'Connecting...';
      case 'checking':
        return 'Checking Status...';
      case 'offline':
        return 'Offline Mode';
      case 'error':
        return 'Connection Error';
      default:
        return 'AI Assistant';
    }
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => onMinimize(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">AI Assistant</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-40 transform transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">OSINT AI Assistant</h3>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-xs text-gray-600 dark:text-gray-400">{getStatusText()}</span>
            </div>
          </div>
        </div>
        
        {/* Agent Switching Controls */}
        <div className="flex items-center gap-1">
          <div className="flex bg-white dark:bg-gray-700 rounded-lg p-1 mr-2">
            <button
              onClick={() => handleAgentSwitch('gemini')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                selectedAgent === 'gemini'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              title="Switch to Agent 1"
            >
              <Brain className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleAgentSwitch('openai')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                selectedAgent === 'openai'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              title="Switch to Agent 2"
            >
              <Zap className="w-3 h-3" />
            </button>
          </div>
          
          <button
            onClick={handleClearChat}
            className="p-1.5 hover:bg-white hover:bg-opacity-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
            title="Clear Chat"
          >
            <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onMinimize(true)}
            className="p-1.5 hover:bg-white hover:bg-opacity-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white hover:bg-opacity-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 popup-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`rounded-xl p-3 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none'
              }`}>
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-2 flex items-center justify-between opacity-70 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {message.type === 'bot' && message.provider && message.provider !== 'fallback' && (
                    <span className="flex items-center gap-1">
                      {message.provider === 'gemini' ? (
                        <Brain className="w-3 h-3" />
                      ) : message.provider === 'openai' ? (
                        <Zap className="w-3 h-3" />
                      ) : null}
                      {getAgentName(message.provider)}
                      {message.usedFallback && <span className="text-orange-400">*</span>}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Suggestions */}
        {messages.length > 0 && messages[messages.length - 1].suggestions && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 px-2">Suggested questions:</p>
            {messages[messages.length - 1].suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-2 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 max-w-[80%]">
              <div className="w-7 h-7 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-xl rounded-tl-none p-3">
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about OSINT techniques, tools, or best practices..."
              className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isLoading}
            />
            <HelpCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">Quick topics:</span>
          <div className="flex items-center gap-1 flex-wrap">
            {[
              { icon: Search, text: 'Search Tips', query: 'What are the best search techniques?' },
              { icon: Shield, text: 'Legal', query: 'What legal considerations should I know?' },
              { icon: Globe, text: 'Social Media', query: 'How do I investigate social media profiles?' },
              { icon: Database, text: 'Tools', query: 'What OSINT tools do you recommend?' }
            ].map((topic, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(topic.query)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors text-gray-700 dark:text-gray-300"
                title={topic.query}
              >
                <topic.icon className="w-3 h-3" />
                <span>{topic.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;