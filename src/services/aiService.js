// Enhanced AI Service supporting multiple AI providers
// Provides fallback functionality and optimal provider selection

class AIService {
  constructor() {
    // API Keys - use environment variables only for security
    this.googleApiKey = process.env.REACT_APP_GOOGLE_AI_API_KEY;
    this.openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;
    
    // API URLs
    this.googleApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.openaiApiUrl = 'https://api.openai.com/v1/chat/completions';
    
    // AI Agent names (masked)
    this.agentNames = {
      gemini: 'Athena',     // Strategic and intelligent
      openai: 'Apollo',     // Knowledgeable and precise
      fallback: 'Hermes'    // Messenger of information
    };
    
    // Current provider - will auto-select based on availability
    this.currentProvider = 'auto';
    this.lastSuccessfulProvider = 'gemini';
    this.isOnlineMode = true;
    
    // Initialize availability check
    this.checkAvailability();
  }

  // OSINT-specific system prompt
  getSystemPrompt() {
    return `You are an expert OSINT (Open Source Intelligence) assistant specialized in helping investigators with ethical and legal research techniques. Your knowledge covers:

1. Advanced search techniques and Google dorking
2. Social media investigation methods  
3. Data verification and cross-referencing
4. Legal and ethical considerations in OSINT
5. Privacy protection during investigations
6. Popular OSINT tools and platforms (like those in InfoScope)
7. Cybersecurity awareness for investigators
8. Digital forensics and evidence collection

Always emphasize:
- Only use publicly available information
- Respect privacy and legal boundaries
- Follow ethical investigation practices
- Verify information from multiple sources
- Document methodology properly
- Consider legal implications

Provide practical, actionable advice while maintaining ethical standards. Be concise but thorough in explanations. When suggesting InfoScope OSINT tools, mention specific categories like People Search, Domain Analysis, Breach Analysis, Email Analysis, Social Media Analysis, or Ethical Hacking tools.`;
  }

  // Check API availability
  async checkAvailability() {
    const geminiAvailable = !!this.googleApiKey && this.googleApiKey.length > 10;
    const openaiAvailable = !!this.openaiApiKey && this.openaiApiKey.length > 10;
    
    return {
      gemini: geminiAvailable,
      openai: openaiAvailable,
      hasAnyAPI: geminiAvailable || openaiAvailable
    };
  }

  // Get best available provider
  async getBestProvider() {
    const availability = await this.checkAvailability();
    
    if (this.currentProvider === 'auto') {
      // Prefer the last successful provider, fallback to available ones
      if (this.lastSuccessfulProvider === 'gemini' && availability.gemini) {
        return 'gemini';
      } else if (this.lastSuccessfulProvider === 'openai' && availability.openai) {
        return 'openai';
      } else if (availability.gemini) {
        return 'gemini';
      } else if (availability.openai) {
        return 'openai';
      }
    }
    
    return this.currentProvider !== 'auto' ? this.currentProvider : 'gemini';
  }

  // Generate response using Google Gemini API
  async generateWithGemini(userMessage, conversationHistory = []) {
    if (!this.googleApiKey) {
      throw new Error('Google AI API key not configured');
    }

    // Prepare conversation context
    const contextMessages = conversationHistory
      .slice(-6) // Keep last 6 messages for context
      .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const prompt = `${this.getSystemPrompt()}\n\nConversation Context:\n${contextMessages}\n\nUser: ${userMessage}\n\nAssistant:`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(`${this.googleApiUrl}?key=${this.googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Google AI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Google AI API');
    }

    return data.candidates[0].content.parts[0].text.trim();
  }

  // Generate response using OpenAI API
  async generateWithOpenAI(userMessage, conversationHistory = []) {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Convert conversation history to OpenAI format
    const messages = [
      {
        role: 'system',
        content: this.getSystemPrompt()
      }
    ];

    // Add conversation history
    conversationHistory.slice(-6).forEach(msg => {
      messages.push({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    const requestBody = {
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0
    };

    const response = await fetch(this.openaiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI API');
    }

    return data.choices[0].message.content.trim();
  }

  // Enhanced offline response system
  async getOfflineResponse(userMessage) {
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Enhanced OSINT-specific responses
    const responses = {
      investigation: `🔍 **Starting an OSINT Investigation**

**1. Planning Phase:**
• Define clear objectives and scope
• Identify target information requirements
• Create a search strategy and timeline
• Document everything from the start

**2. Information Gathering:**
• Use InfoScope's People Search tools
• Try Domain Analysis for website intelligence
• Check Breach Analysis for exposed data
• Utilize Social Media Analysis tools

**3. Verification:**
• Cross-reference findings across multiple sources
• Use different search engines (Google, Bing, DuckDuckGo)
• Verify timestamps and metadata
• Document source reliability

**4. Legal & Ethical Compliance:**
• Only use publicly available information
• Respect privacy boundaries and ToS
• Maintain detailed investigation logs
• Consider jurisdictional laws

Would you like me to elaborate on any specific phase?`,

      dorking: `🌐 **Advanced Google Dorking Techniques**

**Essential Operators:**
• \`site:linkedin.com "John Smith"\` - Site-specific search
• \`filetype:pdf "resume" "engineer"\` - Document hunting
• \`inurl:admin OR inurl:login\` - Find admin pages
• \`intitle:"index of" "sensitive"\` - Directory listings

**Professional Intelligence:**
• \`site:github.com "API key" OR "password"\` - Code leaks
• \`"@company.com" filetype:xlsx\` - Employee lists
• \`site:pastebin.com "company" password\` - Data dumps
• \`cache:website.com\` - Cached versions

**InfoScope Integration:**
Use our built-in Google Hacking Database for pre-built queries targeting specific information types.

**Safety Tips:**
• Always respect robots.txt
• Don't overwhelm servers with requests
• Verify information independently
• Document your methodology

*Available offline via InfoScope's local OSINT knowledge base*`,

      social: `📱 **Social Media Investigation Guide**

**Platform-Specific Techniques:**
• **LinkedIn**: Professional network mapping
• **Twitter**: Timeline analysis and connection graphs  
• **Facebook**: Location and relationship verification
• **Instagram**: Metadata extraction from images
• **TikTok**: Behavioral pattern analysis

**Verification Methods:**
• Reverse image search on profile photos
• Cross-platform username correlation
• Posting pattern analysis for authenticity
• Network analysis of connections
• Temporal correlation of activities

**InfoScope Tools:**
Use our Social Media Analysis category for automated username checking across 50+ platforms.

**Red Flags:**
• Inconsistent posting patterns
• Stock photo profile images
• Limited interaction history
• Mismatched location data

**Privacy Considerations:**
Always respect platform ToS and privacy settings.

*Available offline - Advanced social media investigation techniques*`,

      legal: `⚖️ **Legal & Ethical OSINT Guidelines**

**Legal Boundaries:**
• Public information only - never bypass paywalls or login screens
• Respect website Terms of Service
• Comply with jurisdictional privacy laws (GDPR, CCPA, etc.)
• No social engineering or deceptive practices

**Ethical Framework:**
• Proportionality - methods must match investigation importance
• Necessity - only collect information relevant to objectives
• Minimization - limit data collection to essential elements
• Accountability - maintain detailed records and justification

**Documentation Requirements:**
• Source URLs and timestamps
• Methodology used for each finding
• Chain of custody for digital evidence
• Legal basis for investigation

**When to Stop:**
• If information moves from public to private
• When encountering password-protected content
• If methods become invasive or unethical
• When legal counsel advises cessation

*InfoScope includes built-in legal compliance reminders*`,

      tools: `🛠️ **InfoScope OSINT Tools Overview**

**8 Main Categories:**
1. **People Search** - Background investigation tools
2. **Domain Analysis** - Website intelligence gathering
3. **Breach Analysis** - Data exposure checking
4. **Email Analysis** - Email verification and intelligence
5. **Social Media Analysis** - Cross-platform investigation
6. **Ethical Hacking** - Security assessment tools
7. **Network Intelligence** - Infrastructure analysis
8. **Document Analysis** - File metadata extraction

**48+ Integrated Tools:**
• Professional-grade OSINT platforms
• Real-time data verification
• Cross-reference capabilities
• Export and reporting features

**Offline Capabilities:**
Even without internet, InfoScope provides local OSINT methodologies, legal guidelines, and investigation templates.

**Getting Started:**
Visit the OSINT Tools section - all categories are visible by default for immediate access.

*Comprehensive OSINT toolkit available 24/7*`,

      default: `🤖 **InfoScope OSINT Assistant (Offline Mode)**

I'm currently operating in offline mode but can still help with:

**📚 OSINT Methodologies:**
• Investigation planning and execution
• Search strategy development
• Legal and ethical guidelines
• Documentation best practices

**🔍 Available Topics:**
• **Investigation** - How to start and structure OSINT research
• **Dorking** - Advanced search operators and techniques  
• **Social** - Social media investigation methods
• **Legal** - Compliance and ethical considerations
• **Tools** - InfoScope's integrated OSINT toolkit

**💡 Quick Tips:**
• All 48+ OSINT tools are available locally
• Use the Investigation module for structured research
• Check the legal documentation for compliance
• Access offline Google Hacking Database

*Type keywords like "investigation", "dorking", "social", "legal", or "tools" for specific guidance.*

🌐 **Note:** Online AI capabilities will resume when connectivity is restored.`
    };

    // Enhanced keyword matching
    if (lowerMessage.includes('investigation') || lowerMessage.includes('start') || lowerMessage.includes('begin')) {
      return responses.investigation;
    } else if (lowerMessage.includes('dork') || lowerMessage.includes('google') || lowerMessage.includes('search') || lowerMessage.includes('operator')) {
      return responses.dorking;
    } else if (lowerMessage.includes('social') || lowerMessage.includes('media') || lowerMessage.includes('profile') || lowerMessage.includes('verify') || lowerMessage.includes('platform')) {
      return responses.social;
    } else if (lowerMessage.includes('legal') || lowerMessage.includes('law') || lowerMessage.includes('ethical') || lowerMessage.includes('compliance') || lowerMessage.includes('privacy')) {
      return responses.legal;
    } else if (lowerMessage.includes('tool') || lowerMessage.includes('infoscope') || lowerMessage.includes('category') || lowerMessage.includes('feature')) {
      return responses.tools;
    }

    return responses.default;
  }

  // Main method to generate response with fallback
  async generateResponse(userMessage, conversationHistory = [], preferredAgent = null) {
    const availability = await this.checkAvailability();
    
    // If no APIs available, use offline mode
    if (!availability.hasAnyAPI) {
      this.isOnlineMode = false;
      const offlineResponse = await this.getOfflineResponse(userMessage);
      return {
        content: offlineResponse,
        provider: 'fallback',
        agentName: this.agentNames.fallback,
        timestamp: new Date(),
        offline: true
      };
    }

    // Use preferred agent if specified and available
    let provider = await this.getBestProvider();
    if (preferredAgent && availability[preferredAgent]) {
      provider = preferredAgent;
    }
    
    try {
      let response;
      
      if (provider === 'gemini' && availability.gemini) {
        response = await this.generateWithGemini(userMessage, conversationHistory);
        this.lastSuccessfulProvider = 'gemini';
        this.isOnlineMode = true;
      } else if (provider === 'openai' && availability.openai) {
        response = await this.generateWithOpenAI(userMessage, conversationHistory);
        this.lastSuccessfulProvider = 'openai';
        this.isOnlineMode = true;
      } else {
        throw new Error('Selected provider not available');
      }

      return {
        content: response,
        provider: provider,
        agentName: this.agentNames[provider],
        timestamp: new Date(),
        offline: false
      };
      
    } catch (error) {
      console.warn(`Failed to generate response with ${provider}:`, error);
      
      // Try fallback provider
      const fallbackProvider = provider === 'gemini' ? 'openai' : 'gemini';
      const fallbackAvailable = fallbackProvider === 'gemini' ? availability.gemini : availability.openai;
      
      if (fallbackAvailable) {
        try {
          let response;
          
          if (fallbackProvider === 'gemini') {
            response = await this.generateWithGemini(userMessage, conversationHistory);
          } else {
            response = await this.generateWithOpenAI(userMessage, conversationHistory);
          }
          
          this.lastSuccessfulProvider = fallbackProvider;
          this.isOnlineMode = true;
          
          return {
            content: response,
            provider: fallbackProvider,
            agentName: this.agentNames[fallbackProvider],
            timestamp: new Date(),
            usedFallback: true,
            offline: false
          };
          
        } catch (fallbackError) {
          console.error('Both API providers failed, switching to offline mode:', { primary: error, fallback: fallbackError });
          this.isOnlineMode = false;
          
          const offlineResponse = await this.getOfflineResponse(userMessage);
          return {
            content: offlineResponse,
            provider: 'fallback',
            agentName: this.agentNames.fallback,
            timestamp: new Date(),
            offline: true,
            error: `Online services unavailable`
          };
        }
      } else {
        // Switch to offline mode
        this.isOnlineMode = false;
        const offlineResponse = await this.getOfflineResponse(userMessage);
        return {
          content: offlineResponse,
          provider: 'fallback',
          agentName: this.agentNames.fallback,
          timestamp: new Date(),
          offline: true,
          error: error.message
        };
      }
    }
  }

  // Check if service is configured
  isConfigured() {
    return !!(this.googleApiKey && this.googleApiKey.length > 10) || 
           !!(this.openaiApiKey && this.openaiApiKey.length > 10);
  }

  // Get current status
  async getStatus() {
    const availability = await this.checkAvailability();
    const currentProvider = await this.getBestProvider();
    
    return {
      configured: this.isConfigured(),
      available: availability.hasAnyAPI || true, // Always show as available due to offline mode
      currentProvider: currentProvider,
      providers: availability,
      lastSuccessful: this.lastSuccessfulProvider,
      onlineMode: this.isOnlineMode,
      agentNames: this.agentNames
    };
  }

  // Set preferred provider
  setProvider(provider) {
    if (['auto', 'gemini', 'openai'].includes(provider)) {
      this.currentProvider = provider;
    }
  }

  // Get OSINT-specific suggestions
  getOSINTSuggestions() {
    return [
      'How do I start an OSINT investigation?',
      'What are the best Google dorking techniques?',
      'How can I verify social media profiles?',
      'What legal considerations should I keep in mind?',
      'How do I use InfoScope\'s People Search tools?',
      'What\'s the best approach for domain analysis?',
      'How can I check if an email has been breached?',
      'What are some ethical hacking techniques for OSINT?',
      'How do I analyze social media networks?',
      'What are the latest OSINT investigation methods?'
    ];
  }

  // Get available agent names for selection
  getAvailableAgents() {
    return [
      { id: 'auto', name: 'Auto-Select', description: 'Automatically choose the best available AI agent' },
      { id: 'gemini', name: this.agentNames.gemini, description: 'Strategic intelligence and analytical reasoning' },
      { id: 'openai', name: this.agentNames.apollo, description: 'Comprehensive knowledge and precise responses' },
      { id: 'fallback', name: this.agentNames.fallback, description: 'Offline OSINT expertise and local knowledge base' }
    ];
  }
}

// Create singleton instance
const aiService = new AIService();

export default aiService;