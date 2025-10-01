// AI Tips Service for InfoScope OSINT Platform
// Generates dynamic AI tips and manages weekly display frequency with premium AI agents

class AITipsService {
  constructor() {
    this.storageKey = 'infoscope_ai_tips';
    this.settingsKey = 'infoscope_ai_tips_settings';
    this.lastShownKey = 'infoscope_ai_tips_last_shown';
    
    // AI Agent configurations
    this.agents = {
      basic: {
        name: 'OSINT Assistant',
        description: 'Basic OSINT guidance and tips',
        icon: '🤖',
        premium: false
      },
      expert: {
        name: 'Expert Analyst',
        description: 'Advanced investigation techniques and professional insights',
        icon: '🕵️',
        premium: true
      },
      cyber: {
        name: 'Cyber Specialist',
        description: 'Cybersecurity-focused OSINT and threat intelligence',
        icon: '🛡️',
        premium: true
      },
      researcher: {
        name: 'Research Professional',
        description: 'Academic and enterprise-level OSINT methodologies',
        icon: '🔬',
        premium: true
      }
    };
    
    // Initialize default settings
    this.initializeSettings();
  }

  initializeSettings() {
    const settings = this.getSettings();
    if (!settings) {
      this.saveSettings({
        enabled: true,
        frequency: 'weekly', // weekly, daily, never
        categories: ['security', 'investigation', 'tools', 'privacy', 'tips'],
        selectedAgent: 'basic',
        lastShown: null,
        userSubscription: null
      });
    }
  }

  getSettings() {
    try {
      const settings = localStorage.getItem(this.settingsKey);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error loading AI tips settings:', error);
      return null;
    }
  }

  saveSettings(settings) {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving AI tips settings:', error);
    }
  }

  updateSettings(newSettings) {
    const currentSettings = this.getSettings() || {};
    const updatedSettings = { ...currentSettings, ...newSettings };
    this.saveSettings(updatedSettings);
    return updatedSettings;
  }

  // Check if user can access premium agents
  canAccessPremiumAgent(agentId, userSubscription = null) {
    const agent = this.agents[agentId];
    if (!agent || !agent.premium) return true;
    
    const settings = this.getSettings();
    const subscription = userSubscription || settings?.userSubscription;
    return subscription && subscription.plan && subscription.plan !== 'free';
  }

  // Update user subscription for agent access
  updateUserSubscription(subscription) {
    const settings = this.getSettings() || {};
    settings.userSubscription = subscription;
    this.saveSettings(settings);
  }

  // Get available agents based on subscription
  getAvailableAgents(userSubscription = null) {
    const settings = this.getSettings();
    const subscription = userSubscription || settings?.userSubscription;
    const isPremium = subscription && subscription.plan && subscription.plan !== 'free';
    
    return Object.entries(this.agents).map(([id, agent]) => ({
      id,
      ...agent,
      available: !agent.premium || isPremium,
      locked: agent.premium && !isPremium
    }));
  }

  // Generate AI tip using real API or fallback
  async generateAITip(category = null, useAPI = true) {
    const settings = this.getSettings();
    const selectedAgent = settings?.selectedAgent || 'basic';
    const agent = this.agents[selectedAgent];
    
    // Check if user can access the selected agent
    if (!this.canAccessPremiumAgent(selectedAgent, settings?.userSubscription)) {
      // Fall back to basic agent
      settings.selectedAgent = 'basic';
      this.saveSettings(settings);
    }

    try {
      if (useAPI && this.canAccessPremiumAgent(selectedAgent, settings?.userSubscription)) {
        // Try to generate using AI API for premium users
        const apiTip = await this.generateWithAPI(category, selectedAgent);
        if (apiTip) return apiTip;
      }
      
      // Fallback to static tips
      return this.generateStaticTip(category, selectedAgent);
    } catch (error) {
      console.error('Error generating AI tip:', error);
      return this.generateStaticTip(category, selectedAgent);
    }
  }

  // Generate tip using AI API (premium feature)
  async generateWithAPI(category, agentId) {
    const agent = this.agents[agentId];
    const categoryContext = category || this.getRandomCategory();
    
    const prompt = this.buildPrompt(categoryContext, agent);
    
    try {
      // Try OpenAI API first
      const openAIResponse = await this.callOpenAI(prompt);
      if (openAIResponse) return this.formatAPIResponse(openAIResponse, categoryContext, agent);
      
      // Fallback to other APIs
      const claudeResponse = await this.callClaude(prompt);
      if (claudeResponse) return this.formatAPIResponse(claudeResponse, categoryContext, agent);
      
      return null;
    } catch (error) {
      console.error('AI API call failed:', error);
      return null;
    }
  }

  buildPrompt(category, agent) {
    const categoryDescriptions = {
      security: "OSINT operational security and privacy protection",
      investigation: "digital investigation techniques and methodologies", 
      tools: "OSINT tools, platforms, and technical resources",
      privacy: "maintaining anonymity and protecting investigator privacy",
      tips: "general OSINT best practices and professional tips"
    };

    return `As an ${agent.name} (${agent.description}), provide a practical OSINT tip about ${categoryDescriptions[category]}. 
    
    Requirements:
    - One concise, actionable tip (max 150 characters)
    - Focus on ${category} aspects of OSINT
    - Professional tone appropriate for ${agent.name}
    - Include relevant emoji
    - No introductory text, just the tip
    
    Example format: "🔍 Always verify timestamps across multiple sources to detect potential disinformation campaigns."`;
  }

  async callOpenAI(prompt) {
    try {
      const apiKey = localStorage.getItem('openai_api_key');
      if (!apiKey) return null;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100,
          temperature: 0.7
        })
      });

      if (!response.ok) return null;
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim();
    } catch (error) {
      console.error('OpenAI API error:', error);
      return null;
    }
  }

  async callClaude(prompt) {
    try {
      const apiKey = localStorage.getItem('claude_api_key');
      if (!apiKey) return null;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 100,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) return null;
      
      const data = await response.json();
      return data.content?.[0]?.text?.trim();
    } catch (error) {
      console.error('Claude API error:', error);
      return null;
    }
  }

  formatAPIResponse(content, category, agent) {
    return {
      id: Date.now(),
      category: category,
      content: content,
      timestamp: new Date().toISOString(),
      agent: agent.name,
      source: 'ai_generated',
      shown: false
    };
  }
  // Generate static tips based on selected agent
  generateStaticTip(category = null, agentId = 'basic') {
    const agent = this.agents[agentId];
    const selectedCategory = category || this.getRandomCategory();
    
    // Agent-specific tip databases
    const agentTips = {
      basic: {
        security: [
          "🛡️ Always use VPN when conducting OSINT investigations to protect your identity and location.",
          "🔐 Rotate your API keys regularly and never share them publicly. Use environment variables for security.",
          "👥 Create separate personas for different investigations to maintain operational security."
        ],
        investigation: [
          "� Start with passive reconnaissance before moving to active investigation techniques.",
          "📝 Always document your sources and maintain a clear chain of evidence.",
          "🎯 Use multiple data sources to cross-verify information and avoid false positives."
        ],
        tools: [
          "⚡ InfoScope's Advanced Intel module integrates 15+ professional APIs for comprehensive investigations.",
          "🌐 Use the built-in secure browser for safe reconnaissance without exposing your main browser.",
          "� Export your investigation results in multiple formats: PDF, CSV, JSON, and DOCX."
        ],
        privacy: [
          "🕶️ InfoScope doesn't track you - all data stays on your device for maximum privacy.",
          "� Use private browsing mode and clear cookies regularly during investigations.",
          "📍 Disable GPS and location tracking when conducting sensitive research."
        ],
        tips: [
          "� Cross-reference information from multiple sources to verify authenticity.",
          "� Archive important findings immediately - web content can disappear quickly.",
          "�️ Use consistent naming conventions for your investigation files and folders."
        ]
      },
      expert: {
        security: [
          "🎭 Deploy attribution techniques: analyze writing patterns, timestamps, and technical signatures to unmask threat actors.",
          "�️ Implement compartmentalized investigation environments with isolated VMs and dedicated VPN endpoints per case.",
          "� Use steganographic techniques to hide sensitive investigation notes within seemingly innocent files."
        ],
        investigation: [
          "�️ Leverage temporal analysis: correlate social media posting patterns with known events to establish timelines.",
          "📊 Apply graph analysis to map relationships between entities using tools like Maltego and i2 Analyst's Notebook.",
          "� Master advanced search operators: use site-specific queries, date ranges, and boolean logic for precision targeting."
        ],
        tools: [
          "⚡ Integrate OSINT Framework APIs: automate data collection from multiple sources using custom Python scripts.",
          "🔧 Deploy honeypot infrastructure for active intelligence gathering on threat actor communications.",
          "📈 Use sentiment analysis and NLP tools to analyze large datasets for behavioral patterns."
        ],
        privacy: [
          "🌐 Implement sophisticated traffic analysis resistance using Tor bridges and traffic obfuscation.",
          "🎯 Deploy false flag operations: create believable personas with complete digital footprints for deep cover work.",
          "� Use hardware security keys and air-gapped systems for the most sensitive investigation data."
        ],
        tips: [
          "🎯 Apply the intelligence cycle: direction, collection, processing, analysis, dissemination, and feedback.",
          "📊 Master pivot techniques: use one piece of intelligence to systematically uncover related information.",
          "� Implement continuous monitoring: set up automated alerts for changes in target digital footprints."
        ]
      },
      cyber: {
        security: [
          "🛡️ Deploy threat hunting methodologies: proactively search for indicators of compromise using YARA rules.",
          "� Implement certificate transparency monitoring to detect suspicious SSL certificates for target domains.",
          "🚨 Use passive DNS analysis to track infrastructure changes and identify command & control servers."
        ],
        investigation: [
          "�️ Analyze malware samples in sandboxed environments to extract IoCs and attribution markers.",
          "📊 Correlate threat intelligence feeds with OSINT findings to build comprehensive threat actor profiles.",
          "� Use blockchain analysis tools to trace cryptocurrency transactions and identify wallet clusters."
        ],
        tools: [
          "⚡ Deploy Shodan and Censys for internet-wide asset discovery and vulnerability assessment.",
          "� Use VirusTotal Intelligence for advanced malware analysis and threat hunting capabilities.",
          "📈 Implement SIEM correlation rules to automatically flag suspicious activities during investigations."
        ],
        privacy: [
          "� Use operational security techniques from APT groups: multiple proxy chains and encrypted communications.",
          "🎯 Deploy counter-surveillance measures: detect and evade attribution attempts by adversaries.",
          "� Implement perfect forward secrecy in all communications to protect historical investigation data."
        ],
        tips: [
          "� Apply the cyber kill chain model to understand attacker progression and identify intervention points.",
          "📊 Use diamond model analysis: adversary, capability, infrastructure, and victim to map threat landscapes.",
          "🔄 Implement threat hunting hypotheses: develop and test theories about potential threat actor activities."
        ]
      },
      researcher: {
        security: [
          "🎓 Apply academic research methodologies: systematic literature reviews and meta-analysis for comprehensive investigations.",
          "� Implement scientific method principles: hypothesis formation, controlled testing, and peer review processes.",
          "📊 Use statistical analysis to identify patterns and anomalies in large-scale OSINT datasets."
        ],
        investigation: [
          "� Deploy longitudinal studies: track changes in target behavior and digital footprints over extended periods.",
          "� Apply ethnographic research methods: deep cultural analysis for social media and online community investigations.",
          "📊 Use quantitative analysis tools: R, Python, and specialized libraries for advanced data science approaches."
        ],
        tools: [
          "⚡ Implement automated data pipelines: ETL processes for handling massive OSINT datasets efficiently.",
          "🔧 Use academic databases: JSTOR, IEEE Xplore, and specialized research platforms for background intelligence.",
          "📈 Deploy machine learning models: clustering, classification, and anomaly detection for pattern recognition."
        ],
        privacy: [
          "� Follow IRB protocols: ensure ethical standards and informed consent principles in human subjects research.",
          "🔒 Implement data anonymization techniques: differential privacy and k-anonymity for protecting subject identities.",
          "� Use secure multi-party computation for collaborative research without exposing sensitive datasets."
        ],
        tips: [
          "🎯 Apply triangulation methodology: use multiple research methods to validate findings and reduce bias.",
          "📊 Implement systematic sampling techniques to ensure representative and unbiased data collection.",
          "🔄 Use version control and reproducible research practices: document methodology for peer review and validation."
        ]
      }
    };

    const tipsByAgent = agentTips[agentId] || agentTips.basic;
    const categoryTips = tipsByAgent[selectedCategory] || tipsByAgent.tips;
    const randomTip = categoryTips[Math.floor(Math.random() * categoryTips.length)];
    
    return {
      id: Date.now(),
      category: selectedCategory,
      content: randomTip,
      timestamp: new Date().toISOString(),
      agent: agent.name,
      source: 'static',
      level: agentId === 'basic' ? 'beginner' : agentId === 'expert' ? 'intermediate' : 'advanced',
      shown: false
    };
  }

  // Main method to generate tips (updated for new functionality)
  generateTip(category = null) {
    const settings = this.getSettings();
    const selectedAgent = settings?.selectedAgent || 'basic';
    return this.generateStaticTip(category, selectedAgent);
  }

  // Async method for AI-powered tip generation
  async generateTipAsync(category = null) {
    return await this.generateAITip(category, true);
  }

  getRandomCategory() {
    const settings = this.getSettings();
    const categories = settings?.categories || ['security', 'investigation', 'tools', 'privacy', 'tips'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  // Check if it's time to show a new tip
  shouldShowTip() {
    const settings = this.getSettings();
    
    if (!settings?.enabled) {
      return false;
    }

    const lastShown = settings.lastShown;
    const now = new Date();
    
    if (!lastShown) {
      return true; // First time
    }

    const lastShownDate = new Date(lastShown);
    const timeDiff = now - lastShownDate;
    
    switch (settings.frequency) {
      case 'daily':
        return timeDiff >= 24 * 60 * 60 * 1000; // 24 hours
      case 'weekly':
        return timeDiff >= 7 * 24 * 60 * 60 * 1000; // 7 days
      case 'never':
        return false;
      default:
        return timeDiff >= 7 * 24 * 60 * 60 * 1000; // Default to weekly
    }
  }

  // Get the current tip to show
  getCurrentTip() {
    if (!this.shouldShowTip()) {
      return null;
    }

    // Generate a new tip
    const tip = this.generateTip();
    
    // Update last shown timestamp
    const settings = this.getSettings();
    this.saveSettings({
      ...settings,
      lastShown: new Date().toISOString()
    });

    return tip;
  }

  // Mark tip as shown (when user closes it)
  markTipAsShown(tipId) {
    const settings = this.getSettings();
    this.saveSettings({
      ...settings,
      lastShown: new Date().toISOString()
    });
  }

  // Get tip history
  getTipHistory() {
    try {
      const history = localStorage.getItem(this.storageKey);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading tip history:', error);
      return [];
    }
  }

  // Save tip to history
  saveTipToHistory(tip) {
    try {
      const history = this.getTipHistory();
      history.unshift({ ...tip, shown: true });
      
      // Keep only last 50 tips
      const trimmedHistory = history.slice(0, 50);
      localStorage.setItem(this.storageKey, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Error saving tip to history:', error);
    }
  }

  // Generate tips for different user experience levels
  generateContextualTip(userLevel = 'beginner') {
    const contextualTips = {
      beginner: [
        "👋 Welcome to OSINT! Start with basic Google searches using quotes and operators.",
        "🎯 Try investigating your own digital footprint first to understand the process.",
        "📚 Learn the fundamentals: passive vs active reconnaissance techniques.",
        "🔍 Master basic search operators before moving to advanced tools.",
        "📝 Always document your investigation steps and sources."
      ],
      intermediate: [
        "⚡ Combine multiple investigation techniques for comprehensive results.",
        "🔗 Learn to pivot between different data sources and platforms.",
        "🛡️ Implement proper OPSEC practices to protect your investigations.",
        "📊 Start using specialized OSINT tools like Maltego or Recon-ng.",
        "🎯 Focus on specific investigation methodologies for your domain."
      ],
      advanced: [
        "🚀 Develop custom scripts and automation for repetitive tasks.",
        "🔬 Contribute to the OSINT community with tools and techniques.",
        "📈 Build comprehensive investigation frameworks and workflows.",
        "🎓 Mentor newcomers and share advanced methodologies.",
        "🔮 Stay ahead of emerging technologies and their OSINT applications."
      ]
    };

    const tips = contextualTips[userLevel] || contextualTips.beginner;
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    return {
      id: Date.now(),
      category: 'contextual',
      level: userLevel,
      content: randomTip,
      timestamp: new Date().toISOString(),
      shown: false
    };
  }

  // Get AI tips settings for profile customization
  getCustomizationOptions() {
    return {
      frequencies: [
        { value: 'daily', label: 'Daily', description: 'Show new tip every day' },
        { value: 'weekly', label: 'Weekly', description: 'Show new tip every week' },
        { value: 'never', label: 'Never', description: 'Disable AI tips' }
      ],
      categories: [
        { value: 'security', label: 'Security', description: 'Privacy and security tips', icon: '🛡️' },
        { value: 'investigation', label: 'Investigation', description: 'Investigation techniques', icon: '🔍' },
        { value: 'tools', label: 'Tools', description: 'InfoScope features and tools', icon: '⚡' },
        { value: 'privacy', label: 'Privacy', description: 'Privacy protection methods', icon: '🕶️' },
        { value: 'tips', label: 'General Tips', description: 'General OSINT tips', icon: '💡' }
      ]
    };
  }

  // Reset all settings to default
  resetSettings() {
    localStorage.removeItem(this.settingsKey);
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.lastShownKey);
    this.initializeSettings();
  }
}

export default new AITipsService();