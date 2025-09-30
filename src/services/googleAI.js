// Google AI API Service for OSINT Assistant
// This service handles integration with Google's Generative AI API (Gemini)

const GOOGLE_AI_API_KEY = process.env.REACT_APP_GOOGLE_AI_API_KEY;
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// OSINT-specific system prompt to guide AI responses
const OSINT_SYSTEM_PROMPT = `You are an expert OSINT (Open Source Intelligence) assistant specialized in helping investigators with ethical and legal research techniques. Your knowledge covers:

1. Advanced search techniques and Google dorking
2. Social media investigation methods
3. Data verification and cross-referencing
4. Legal and ethical considerations in OSINT
5. Privacy protection during investigations
6. Popular OSINT tools and platforms
7. Cybersecurity awareness for investigators

Always emphasize:
- Only use publicly available information
- Respect privacy and legal boundaries
- Follow ethical investigation practices
- Verify information from multiple sources
- Document methodology properly

Provide practical, actionable advice while maintaining ethical standards. Be concise but thorough in explanations.`;

class GoogleAIService {
  constructor() {
    this.apiKey = GOOGLE_AI_API_KEY;
    this.isAvailable = !!this.apiKey && this.apiKey !== 'your_google_ai_api_key_here';
  }

  // Check if the API is properly configured
  isConfigured() {
    return this.isAvailable;
  }

  // Generate response using Google AI
  async generateResponse(userMessage, conversationHistory = []) {
    if (!this.isConfigured()) {
      throw new Error('Google AI API key not configured');
    }

    try {
      // Prepare conversation context
      const contextMessages = conversationHistory
        .slice(-6) // Keep last 6 messages for context
        .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      // Combine system prompt with context and current message
      const fullPrompt = `${OSINT_SYSTEM_PROMPT}

Previous conversation:
${contextMessages}

Current question: ${userMessage}

Please provide a helpful OSINT-focused response:`;

      const requestBody = {
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };

      const response = await fetch(`${GOOGLE_AI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from Google AI API');
      }

      return data.candidates[0].content.parts[0].text;

    } catch (error) {
      console.error('Google AI API Error:', error);
      throw error;
    }
  }

  // Get AI suggestions for OSINT investigation topics
  async getSuggestions(investigationType = 'general') {
    const suggestionPrompts = {
      general: "Provide 4 concise questions a beginner might ask about OSINT investigations",
      social: "Provide 4 concise questions about social media investigation techniques",
      technical: "Provide 4 concise questions about technical OSINT tools and methods",
      legal: "Provide 4 concise questions about legal and ethical aspects of OSINT"
    };

    try {
      const response = await this.generateResponse(suggestionPrompts[investigationType] || suggestionPrompts.general);
      
      // Parse response into array of suggestions
      const suggestions = response
        .split('\n')
        .filter(line => line.trim().startsWith('1.') || line.trim().startsWith('2.') || 
                      line.trim().startsWith('3.') || line.trim().startsWith('4.') ||
                      line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[\d\.\-•]\s*/, '').trim())
        .filter(suggestion => suggestion.length > 0)
        .slice(0, 4);

      return suggestions.length > 0 ? suggestions : [
        "How do I start an OSINT investigation?",
        "What are the best Google search techniques?",
        "How can I verify information sources?",
        "What legal considerations should I know?"
      ];

    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Return fallback suggestions
      return [
        "How do I start an OSINT investigation?",
        "What are the best Google search techniques?",
        "How can I verify information sources?",
        "What legal considerations should I know?"
      ];
    }
  }

  // Analyze and categorize user query for better response routing
  categorizeQuery(query) {
    const categories = {
      technical: ['dork', 'search', 'tool', 'api', 'script', 'automation', 'metadata'],
      social: ['social media', 'facebook', 'twitter', 'instagram', 'linkedin', 'profile', 'username'],
      legal: ['legal', 'law', 'ethical', 'privacy', 'consent', 'compliance', 'gdpr'],
      investigation: ['investigate', 'research', 'find', 'trace', 'track', 'identify'],
      verification: ['verify', 'confirm', 'validate', 'check', 'authentic', 'fake', 'false']
    };

    const lowerQuery = query.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        return category;
      }
    }
    
    return 'general';
  }
}

// Export singleton instance
export const googleAIService = new GoogleAIService();
export default googleAIService;