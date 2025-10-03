// Enhanced AI Service supporting multiple AI providers with OSINT focus
// Provides fallback functionality, web scraping, and data interpretation

class AIService {
  constructor() {
    // API Keys - use environment variables and localStorage fallback
    this.googleApiKey = process.env.REACT_APP_GOOGLE_AI_API_KEY || localStorage.getItem('google_ai_api_key');
    this.openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY || localStorage.getItem('openai_api_key');
    this.anthropicApiKey = process.env.REACT_APP_ANTHROPIC_API_KEY || localStorage.getItem('anthropic_api_key');
    
    // API URLs
    this.googleApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.openaiApiUrl = 'https://api.openai.com/v1/chat/completions';
    this.anthropicApiUrl = 'https://api.anthropic.com/v1/messages';
    
    // AI Agent names (masked for OSINT operations)
    this.agentNames = {
      gemini: 'OSINT-Alpha',     // Primary intelligence analyst
      openai: 'OSINT-Beta',      // Secondary analyst
      anthropic: 'OSINT-Gamma',  // Tertiary analyst
      fallback: 'OSINT-Offline'  // Local knowledge base
    };
    
    // Provider configuration
    this.currentProvider = 'auto';
    this.lastSuccessfulProvider = 'gemini';
    this.isOnlineMode = navigator.onLine;
    this.offlineKnowledgeBase = this.loadOfflineKnowledge();
    
    // Web scraping configuration
    this.scraperConfig = {
      timeout: 10000,
      maxRetries: 3,
      userAgent: 'InfoScope-OSINT-Research-Bot/2.3.0',
      respectRobots: true
    };
    
    // Initialize availability check
    this.checkAvailability();
    this.initializeOfflineMode();
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnlineMode = true;
      console.log('AI Service: Online mode activated');
    });
    
    window.addEventListener('offline', () => {
      this.isOnlineMode = false;
      console.log('AI Service: Offline mode activated');
    });
  }

  // Enhanced OSINT-specific system prompt
  getSystemPrompt() {
    return `You are an expert OSINT (Open Source Intelligence) AI assistant specialized in helping investigators with ethical and legal research techniques. Your expertise covers:

**Core OSINT Capabilities:**
1. Advanced search techniques and Google dorking (site:, inurl:, filetype:, etc.)
2. Social media investigation methods across all platforms
3. Data verification and cross-referencing techniques
4. Legal and ethical considerations in OSINT operations
5. Privacy protection during investigations
6. Popular OSINT tools: Maltego, SpiderFoot, theHarvester, Shodan, Recon-ng
7. Cybersecurity awareness for investigators
8. Digital forensics and evidence collection
9. Dark web research (ethical boundaries)
10. Email analysis and breach checking

**Data Interpretation Skills:**
- Analyze investigation data from InfoScope
- Interpret domain analysis results
- Process social media intelligence
- Correlate multiple data sources
- Generate investigation reports
- Suggest next investigative steps

**Search String Optimization:**
- Format queries for different search engines (Google, Bing, Yandex, DuckDuckGo)
- Create effective dork strings
- Optimize for regional search engines
- Handle special characters and operators

**Always Emphasize:**
- Only use publicly available information
- Respect privacy and legal boundaries  
- Follow ethical investigation practices
- Verify information from multiple sources
- Document methodology properly
- Consider legal implications
- Protect investigator identity and security

You can interpret data from saved investigations, suggest improvements, and help format search queries for optimal results.

Provide practical, actionable advice while maintaining ethical standards. Be concise but thorough in explanations. When suggesting InfoScope OSINT tools, mention specific categories like People Search, Domain Analysis, Breach Analysis, Email Analysis, Social Media Analysis, or Ethical Hacking tools.`;
  }

  // Load offline knowledge base for fallback functionality
  loadOfflineKnowledge() {
    return {
      osintBasics: {
        definition: "Open Source Intelligence (OSINT) is intelligence collected from publicly available sources.",
        legalConsiderations: "Always respect privacy laws, terms of service, and ethical boundaries.",
        ethicalGuidelines: "Only collect publicly available information and respect individual privacy rights."
      },
      searchTechniques: {
        googleDorks: [
          "site: - Search within specific domain",
          "inurl: - Search for terms in URL",
          "intitle: - Search for terms in page title",
          "filetype: - Search for specific file types",
          "cache: - View cached version of page",
          "link: - Find pages linking to a URL"
        ],
        socialMedia: [
          "Use username enumeration tools",
          "Check multiple platforms systematically",
          "Look for cross-platform connections",
          "Verify information across sources"
        ]
      },
      tools: {
        domains: ["WHOIS lookup", "DNS enumeration", "Certificate transparency"],
        people: ["Social media search", "Professional networks", "Public records"],
        email: ["Breach checking", "Email validation", "Domain analysis"],
        phone: ["Carrier lookup", "Geographic location", "Spam databases"]
      },
      bestPractices: [
        "Document your methodology",
        "Verify information from multiple sources",
        "Respect rate limits and robots.txt",
        "Use VPNs for operational security",
        "Keep detailed investigation notes"
      ]
    };
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

  // Initialize offline mode with enhanced knowledge base
  initializeOfflineMode() {
    this.offlineKnowledgeBase = {
      osintTechniques: {
        'google dorking': 'Advanced Google search operators: site:, inurl:, intitle:, filetype:, intext:, cache:, link:, before:, after:, AROUND()',
        'social media investigation': 'Cross-platform username analysis, reverse image search, metadata extraction, behavioral pattern analysis',
        'domain analysis': 'WHOIS lookups, DNS enumeration, SSL certificate analysis, subdomain discovery, technology fingerprinting',
        'email investigation': 'Breach checking, domain analysis, social media correlation, deliverability testing',
        'search engines': 'Google, Bing, Yandex, DuckDuckGo, Baidu optimization techniques and regional considerations'
      },
      searchOperators: {
        google: ['site:', 'inurl:', 'intitle:', 'filetype:', 'intext:', 'cache:', 'link:', 'before:', 'after:', 'AROUND()'],
        bing: ['site:', 'inurl:', 'intitle:', 'filetype:', 'ip:', 'language:', 'loc:', 'contains:'],
        yandex: ['site:', 'inurl:', 'intitle:', 'filetype:', '&&', '<<', '/+n', 'url:'],
        duckduckgo: ['site:', 'intitle:', 'filetype:', 'intext:', 'region:']
      },
      osintTools: [
        'Maltego - Link analysis and data visualization',
        'SpiderFoot - Automated OSINT collection',
        'theHarvester - Email and domain intelligence',
        'Shodan - Internet-connected device discovery',
        'Recon-ng - Modular reconnaissance framework',
        'TorBot - Dark web scanning',
        'Censys - Internet-wide scanning',
        'Intelligence X - Deep web searching'
      ]
    };
  }

  // Load and interpret saved investigation data
  async interpretInvestigationData(investigationData) {
    try {
      const interpretation = {
        summary: this.generateDataSummary(investigationData),
        insights: this.extractKeyInsights(investigationData),
        recommendations: this.generateRecommendations(investigationData),
        nextSteps: this.suggestNextSteps(investigationData)
      };

      return {
        status: 'success',
        agent: 'OSINT-Analyzer',
        interpretation,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Data interpretation error:', error);
      return {
        status: 'error',
        error: error.message,
        fallback: 'Unable to interpret data automatically. Please review manually.'
      };
    }
  }

  // Generate data summary
  generateDataSummary(data) {
    const summary = {
      totalSources: 0,
      dataTypes: [],
      timeRange: null,
      keyFindings: []
    };

    if (data.domains) {
      summary.totalSources += data.domains.length;
      summary.dataTypes.push('Domain Analysis');
    }

    if (data.emails) {
      summary.totalSources += data.emails.length;
      summary.dataTypes.push('Email Intelligence');
    }

    if (data.socialMedia) {
      summary.totalSources += data.socialMedia.length;
      summary.dataTypes.push('Social Media');
    }

    return summary;
  }

  // Extract key insights from investigation data
  extractKeyInsights(data) {
    const insights = [];

    // Domain insights
    if (data.domains) {
      data.domains.forEach(domain => {
        if (domain.suspicious_indicators) {
          insights.push(`Domain ${domain.name} shows suspicious indicators`);
        }
        if (domain.subdomains?.length > 20) {
          insights.push(`Domain ${domain.name} has extensive subdomain structure (${domain.subdomains.length} found)`);
        }
      });
    }

    // Email insights
    if (data.emails) {
      const breachedEmails = data.emails.filter(email => email.breached);
      if (breachedEmails.length > 0) {
        insights.push(`${breachedEmails.length} email(s) found in data breaches`);
      }
    }

    return insights;
  }

  // Generate investigation recommendations
  generateRecommendations(data) {
    const recommendations = [];

    if (data.incomplete_searches) {
      recommendations.push('Complete remaining search queries for comprehensive coverage');
    }

    if (data.high_risk_findings) {
      recommendations.push('Prioritize verification of high-risk findings');
    }

    recommendations.push('Cross-reference findings with additional sources');
    recommendations.push('Document methodology and sources for legal compliance');

    return recommendations;
  }

  // Suggest next investigative steps
  suggestNextSteps(data) {
    const steps = [];

    if (data.domains) {
      steps.push('Perform deeper subdomain enumeration');
      steps.push('Analyze SSL certificate transparency logs');
    }

    if (data.people) {
      steps.push('Search for additional social media profiles');
      steps.push('Check for professional networking presence');
    }

    steps.push('Verify information through multiple sources');
    steps.push('Consider reverse lookup techniques');

    return steps;
  }

  // Enhanced web scraping capabilities
  async scrapeWebContent(url, options = {}) {
    try {
      // Security and ethics check
      if (!this.isEthicalScraping(url)) {
        throw new Error('Scraping this URL may violate terms of service or ethical guidelines');
      }

      const config = { ...this.scraperConfig, ...options };
      
      // Use fetch with appropriate headers
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': config.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive'
        },
        timeout: config.timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      
      return {
        url,
        content: content.substring(0, 10000), // Limit content size
        metadata: {
          contentType: response.headers.get('content-type'),
          lastModified: response.headers.get('last-modified'),
          server: response.headers.get('server'),
          contentLength: content.length
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Web scraping error:', error);
      return {
        error: error.message,
        fallback: 'Manual analysis recommended - automated scraping failed'
      };
    }
  }

  // Check if scraping is ethical and allowed
  isEthicalScraping(url) {
    const blockedDomains = [
      'facebook.com', 'linkedin.com', 'twitter.com', 'instagram.com',
      'banking', 'paypal', 'government', 'military'
    ];

    const domain = new URL(url).hostname.toLowerCase();
    return !blockedDomains.some(blocked => domain.includes(blocked));
  }

  // Format search strings for different browsers/engines
  formatSearchString(query, engine = 'google', options = {}) {
    const formattedQueries = {
      google: this.formatGoogleQuery(query, options),
      bing: this.formatBingQuery(query, options),
      yandex: this.formatYandexQuery(query, options),
      duckduckgo: this.formatDuckDuckGoQuery(query, options),
      baidu: this.formatBaiduQuery(query, options)
    };

    return formattedQueries[engine] || formattedQueries.google;
  }

  // Google query formatting
  formatGoogleQuery(query, options) {
    let formatted = query;

    if (options.site) formatted += ` site:${options.site}`;
    if (options.filetype) formatted += ` filetype:${options.filetype}`;
    if (options.inurl) formatted += ` inurl:${options.inurl}`;
    if (options.intitle) formatted += ` intitle:"${options.intitle}"`;
    if (options.exact) formatted = `"${formatted}"`;
    if (options.exclude) formatted += ` -${options.exclude}`;
    if (options.dateRange) formatted += ` after:${options.dateRange.start} before:${options.dateRange.end}`;

    return formatted.trim();
  }

  // Bing query formatting
  formatBingQuery(query, options) {
    let formatted = query;

    if (options.site) formatted += ` site:${options.site}`;
    if (options.filetype) formatted += ` filetype:${options.filetype}`;
    if (options.language) formatted += ` language:${options.language}`;
    if (options.location) formatted += ` loc:${options.location}`;
    if (options.ip) formatted += ` ip:${options.ip}`;

    return formatted.trim();
  }

  // Yandex query formatting  
  formatYandexQuery(query, options) {
    let formatted = query;

    if (options.site) formatted += ` site:${options.site}`;
    if (options.url) formatted += ` url:${options.url}`;
    if (options.proximity) formatted += ` /+${options.proximity}`;

    return formatted.trim();
  }

  // DuckDuckGo query formatting
  formatDuckDuckGoQuery(query, options) {
    let formatted = query;

    if (options.site) formatted += ` site:${options.site}`;
    if (options.filetype) formatted += ` filetype:${options.filetype}`;
    if (options.region) formatted += ` region:${options.region}`;

    return formatted.trim();
  }

  // Baidu query formatting
  formatBaiduQuery(query, options) {
    let formatted = query;

    if (options.site) formatted += ` site:${options.site}`;
    if (options.filetype) formatted += ` filetype:${options.filetype}`;
    if (options.intitle) formatted += ` intitle:${options.intitle}`;

    return formatted.trim();
  }

  // Get available agent names for selection
  getAvailableAgents() {
    return [
      { id: 'auto', name: 'Auto-Select', description: 'Automatically choose the best available AI agent' },
      { id: 'gemini', name: this.agentNames.gemini, description: 'Strategic intelligence and analytical reasoning' },
      { id: 'openai', name: this.agentNames.openai, description: 'Comprehensive knowledge and precise responses' },
      { id: 'anthropic', name: this.agentNames.anthropic, description: 'Advanced reasoning and ethical analysis' },
      { id: 'fallback', name: this.agentNames.fallback, description: 'Offline OSINT expertise and local knowledge base' }
    ];
  }

  // Enhanced OSINT Investigation Analysis
  async analyzeInvestigationData(investigationContext) {
    const prompt = `As an expert OSINT analyst, analyze this investigation configuration and provide insights:

**Investigation Context:**
- Search Query: ${investigationContext.query}
- Target: ${investigationContext.targetInfo.name || 'Unknown'}
- Email: ${investigationContext.targetInfo.email || 'Not provided'}
- Username: ${investigationContext.targetInfo.username || 'Not provided'}
- Location: ${investigationContext.targetInfo.location || 'Not provided'}
- Company: ${investigationContext.targetInfo.company || 'Not provided'}
- Search Engine: ${investigationContext.engine}
- Investigation Type: ${investigationContext.preset || 'General'}
- Risk Level: ${investigationContext.riskLevel}

**Recent Search History:**
${investigationContext.searchHistory?.map(s => `- ${s.engine}: ${s.query} (${s.risk} risk)`).join('\n') || 'No previous searches'}

Please provide:
1. Analysis of investigation completeness and quality
2. Potential privacy/legal concerns to address
3. Suggestions for improving search effectiveness
4. Alternative investigation approaches
5. Missing data points that could be valuable

Focus on ethical OSINT practices and actionable recommendations.`;

    try {
      const response = await this.sendRequest(prompt);
      return {
        analysis: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Investigation analysis error:', error);
      return {
        analysis: this.getOfflineInvestigationAnalysis(investigationContext),
        timestamp: new Date().toISOString(),
        mode: 'offline'
      };
    }
  }

  // Generate search suggestions based on target information
  async generateSearchSuggestions(targetData) {
    const prompt = `As an OSINT expert, suggest optimal search strategies for this target:

**Target Information:**
- Name: ${targetData.fullName || 'Not provided'}
- Email: ${targetData.email || 'Not provided'}
- Username: ${targetData.username || 'Not provided'}
- Location: ${targetData.location || 'Not provided'}
- Company: ${targetData.company || 'Not provided'}
- Current Engine: ${targetData.currentEngine}
- Risk Tolerance: ${targetData.riskTolerance}

Generate specific suggestions for:
1. Additional keywords to include
2. Relevant websites/domains to search
3. Filetypes that might contain valuable information
4. Alternative search engines to try
5. Social media platforms to prioritize

Provide practical, immediately actionable suggestions formatted as lists. Focus on publicly available information and ethical research methods.`;

    try {
      const response = await this.sendRequest(prompt);
      return this.parseSearchSuggestions(response);
    } catch (error) {
      console.error('Search suggestions error:', error);
      return this.getOfflineSearchSuggestions(targetData);
    }
  }

  // Interpret search results and provide analysis
  async interpretSearchResults(resultsContext) {
    const prompt = `Analyze these OSINT search results and provide interpretation:

**Search Context:**
- Query: ${resultsContext.query}
- Target: ${resultsContext.targetInfo.name || 'Unknown'}
- Search Type: ${resultsContext.searchContext.preset || 'General'}
- Engine: ${resultsContext.searchContext.engine}
- Risk Level: ${resultsContext.searchContext.riskLevel}

**Search Results Data:**
${JSON.stringify(resultsContext.searchData, null, 2)}

Please provide:
1. Key findings and patterns identified
2. Data reliability assessment
3. Verification recommendations
4. Next investigation steps
5. Potential red flags or concerns

Focus on actionable intelligence and verification methods.`;

    try {
      const response = await this.sendRequest(prompt);
      return {
        interpretation: response,
        confidence: 'high',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Results interpretation error:', error);
      return {
        interpretation: this.getOfflineResultsInterpretation(resultsContext),
        confidence: 'medium',
        timestamp: new Date().toISOString(),
        mode: 'offline'
      };
    }
  }

  // Parse AI response for search suggestions
  parseSearchSuggestions(response) {
    const suggestions = {
      keywords: [],
      sites: [],
      filetypes: [],
      engines: [],
      social: []
    };

    try {
      // Extract keywords
      const keywordMatch = response.match(/keywords?[:\-\s]*([^\n]*(?:\n\s*\-[^\n]*)*)/i);
      if (keywordMatch) {
        suggestions.keywords = keywordMatch[1]
          .split(/[,\n\-]/)
          .map(k => k.trim().replace(/^\-\s*/, ''))
          .filter(k => k && k.length > 2)
          .slice(0, 10);
      }

      // Extract sites
      const siteMatch = response.match(/(?:websites?|sites?|domains?)[:\-\s]*([^\n]*(?:\n\s*\-[^\n]*)*)/i);
      if (siteMatch) {
        suggestions.sites = siteMatch[1]
          .split(/[,\n\-]/)
          .map(s => s.trim().replace(/^\-\s*/, '').replace(/^https?:\/\//, ''))
          .filter(s => s && s.includes('.'))
          .slice(0, 8);
      }

      // Extract filetypes
      const filetypeMatch = response.match(/filetypes?[:\-\s]*([^\n]*(?:\n\s*\-[^\n]*)*)/i);
      if (filetypeMatch) {
        suggestions.filetypes = filetypeMatch[1]
          .split(/[,\n\-]/)
          .map(f => f.trim().replace(/^\-\s*/, '').replace(/^\./, ''))
          .filter(f => f && f.length < 10)
          .slice(0, 6);
      }

    } catch (error) {
      console.error('Error parsing suggestions:', error);
    }

    return suggestions;
  }

  // Offline fallback for investigation analysis
  getOfflineInvestigationAnalysis(context) {
    const analyses = [];
    
    if (!context.targetInfo.name && !context.targetInfo.email && !context.targetInfo.username) {
      analyses.push("⚠️ Limited target information: Consider gathering more identifying information before proceeding.");
    }
    
    if (context.riskLevel === 'high' || context.riskLevel === 'critical') {
      analyses.push("🔒 High-risk investigation detected: Ensure proper authorization and legal compliance.");
    }
    
    if (context.searchHistory?.length === 0) {
      analyses.push("📋 Fresh investigation: Start with broad searches on major platforms before narrowing scope.");
    }
    
    if (context.targetInfo.email) {
      analyses.push("📧 Email available: Consider breach checking and domain analysis for additional intelligence.");
    }
    
    if (context.targetInfo.company) {
      analyses.push("🏢 Company affiliation known: Investigate corporate connections and professional networks.");
    }

    return analyses.length > 0 ? analyses.join(' ') : "Investigation parameters appear reasonable. Proceed with standard OSINT methodology.";
  }

  // Offline fallback for search suggestions
  getOfflineSearchSuggestions(targetData) {
    const suggestions = {
      keywords: [],
      sites: [],
      filetypes: ['pdf', 'doc', 'xlsx'],
      engines: ['google', 'bing', 'duckduckgo'],
      social: ['linkedin.com', 'twitter.com', 'facebook.com']
    };

    if (targetData.company) {
      suggestions.keywords.push('employee', 'staff', 'team', 'directory');
      suggestions.sites.push(targetData.company.toLowerCase().replace(/\s+/g, '') + '.com');
    }

    if (targetData.location) {
      suggestions.keywords.push(targetData.location.split(',')[0].trim());
    }

    if (targetData.email) {
      const domain = targetData.email.split('@')[1];
      if (domain) {
        suggestions.sites.push(domain);
      }
    }

    return suggestions;
  }

  // Offline fallback for results interpretation
  getOfflineResultsInterpretation(context) {
    return `Search completed using ${context.searchContext.engine} engine. Results require manual verification and cross-referencing with additional sources. Consider expanding search to other platforms and verify any findings through multiple sources before drawing conclusions.`;
  }
}

// Create singleton instance
const aiService = new AIService();

export default aiService;