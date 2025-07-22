import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🔍 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('API Response Error:', error);
        
        // Enhanced error handling
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          error.message = 'Backend server is not running. Please start the backend first.';
        } else if (error.response?.status === 500) {
          error.message = 'Internal server error. Please check the backend logs.';
        } else if (error.response?.status === 404) {
          error.message = 'API endpoint not found. Please check the backend configuration.';
        } else if (!error.response) {
          error.message = 'Network error. Please check your connection and ensure the backend is running.';
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Health check with fallback
  async checkHealth() {
    try {
      const response = await this.api.get('/');
      return response.data;
    } catch (error) {
      console.error('Backend health check failed:', error);
      
      // Try alternative health endpoints
      try {
        const healthResponse = await this.api.get('/health');
        return healthResponse.data;
      } catch (healthError) {
        console.error('Alternative health check also failed:', healthError);
        return {
          status: 'error',
          message: 'Backend server is not accessible',
          timestamp: new Date().toISOString(),
          error: error.message
        };
      }
    }
  }

  // Alias for backward compatibility
  async getSystemHealth() {
    return this.checkHealth();
  }

  // People search with comprehensive OSINT capabilities
  async searchPeople(searchRequest) {
    try {
      console.log('🔍 Starting comprehensive OSINT search:', searchRequest);
      const response = await this.api.post('/api/search/people', searchRequest);
      console.log('✅ OSINT search completed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ People search error:', error);
      
      // If backend is not available, return demo results
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.log('🔄 Backend unavailable, generating demo results...');
        return this.generateDemoResults(searchRequest);
      }
      
      throw error;
    }
  }

  // Generate demo results for development/testing
  generateDemoResults(searchRequest) {
    const query = typeof searchRequest === 'string' ? searchRequest : 
                  (searchRequest.query || searchRequest.first_name || searchRequest.email || 'Unknown');
    
    return {
      success: true,
      confidence: 0.85,
      data: {
        query: query,
        timestamp: new Date().toISOString(),
        total_results: Math.floor(Math.random() * 50) + 10,
        confidence: 0.85 + Math.random() * 0.15,
        summary: `Enhanced OSINT search found multiple references to "${query}" across various platforms and databases. This is a demo result while the backend is starting up.`,
        results: [
          {
            platform: 'LinkedIn',
            type: 'professional_profile',
            profiles: [
              {
                url: `https://linkedin.com/in/${query.toLowerCase().replace(/\s+/g, '-')}`,
                title: `${query} - Professional Profile`,
                description: 'Software Engineer at Tech Company',
                confidence: 0.92,
                verified: true,
                metadata: {
                  platform: 'LinkedIn',
                  profile_type: 'professional',
                  last_updated: new Date().toISOString(),
                  connections: Math.floor(Math.random() * 1000) + 100,
                  experience_years: Math.floor(Math.random() * 20) + 1,
                }
              }
            ]
          },
          {
            platform: 'GitHub',
            type: 'developer_profile',
            profiles: [
              {
                url: `https://github.com/${query.toLowerCase().replace(/\s+/g, '')}`,
                title: `${query} (@${query.toLowerCase().replace(/\s+/g, '')})`,
                description: 'Open source contributor and developer',
                confidence: 0.78,
                verified: false,
                metadata: {
                  platform: 'GitHub',
                  profile_type: 'developer',
                  repositories: Math.floor(Math.random() * 50) + 5,
                  followers: Math.floor(Math.random() * 500) + 10,
                  contributions_last_year: Math.floor(Math.random() * 1000) + 100,
                }
              }
            ]
          },
          {
            platform: 'Twitter/X',
            type: 'social_profile',
            profiles: [
              {
                url: `https://twitter.com/${query.toLowerCase().replace(/\s+/g, '_')}`,
                title: `@${query.toLowerCase().replace(/\s+/g, '_')}`,
                description: 'Social media presence and public posts',
                confidence: 0.65,
                verified: false,
                metadata: {
                  platform: 'Twitter',
                  profile_type: 'social',
                  followers: Math.floor(Math.random() * 10000) + 100,
                  following: Math.floor(Math.random() * 1000) + 50,
                  tweets: Math.floor(Math.random() * 5000) + 100,
                }
              }
            ]
          },
          {
            platform: 'Google Dorking',
            type: 'search_results',
            profiles: [
              {
                url: `https://www.google.com/search?q="${query}"`,
                title: `Advanced search results for "${query}"`,
                description: 'Comprehensive Google search with advanced operators',
                confidence: 0.95,
                verified: true,
                metadata: {
                  platform: 'Google',
                  search_type: 'dorking',
                  operators_used: ['site:', 'intext:', 'filetype:', 'intitle:'],
                  estimated_results: Math.floor(Math.random() * 100000) + 1000,
                }
              }
            ]
          },
          {
            platform: 'Public Records',
            type: 'official_records',
            profiles: [
              {
                url: '#',
                title: `Public records matching "${query}"`,
                description: 'Voter registration, business licenses, court records',
                confidence: 0.88,
                verified: true,
                metadata: {
                  platform: 'Public Records',
                  record_types: ['voter_registration', 'business_license', 'court_records'],
                  jurisdiction: 'Multiple',
                  last_verified: new Date().toISOString(),
                }
              }
            ]
          }
        ],
        analytics: {
          search_time_ms: Math.floor(Math.random() * 3000) + 500,
          sources_checked: 15,
          total_matches: Math.floor(Math.random() * 200) + 50,
          high_confidence_matches: Math.floor(Math.random() * 50) + 10,
          verified_profiles: Math.floor(Math.random() * 10) + 2,
        },
        recommendations: [
          'Try searching with additional filters for more specific results',
          'Check social media platforms for recent activity',
          'Consider searching for associated email addresses or phone numbers',
          'Review public records for official documentation',
        ]
      }
    };
  }

  // Reverse lookup
  async reverseLookup(lookupRequest) {
    try {
      const response = await this.api.post('/api/search/reverse', lookupRequest);
      return response.data;
    } catch (error) {
      console.error('Reverse lookup error:', error);
      throw error;
    }
  }

  // Alias for backward compatibility
  async reverseSearch(identifier, type, options = {}) {
    const lookupRequest = {
      identifier,
      type,
      ...options
    };
    return this.reverseLookup(lookupRequest);
  }

  // Social intelligence
  async socialIntelligence(intelRequest) {
    try {
      const response = await this.api.post('/api/intel/social', intelRequest);
      return response.data;
    } catch (error) {
      console.error('Social intelligence error:', error);
      throw error;
    }
  }

  // Domain intelligence
  async domainIntelligence(domainRequest) {
    try {
      const response = await this.api.post('/api/intel/domain', domainRequest);
      return response.data;
    } catch (error) {
      console.error('Domain intelligence error:', error);
      throw error;
    }
  }

  // Get search status
  async getSearchStatus(searchId) {
    try {
      const response = await this.api.get(`/api/search/status/${searchId}`);
      return response.data;
    } catch (error) {
      console.error('Get search status error:', error);
      throw error;
    }
  }

  // Get search results
  async getSearchResults(searchId) {
    try {
      const response = await this.api.get(`/api/results/${searchId}`);
      return response.data;
    } catch (error) {
      console.error('Get search results error:', error);
      throw error;
    }
  }

  // Run OSINT tool
  async runOsintTool(toolName, parameters) {
    try {
      const response = await this.api.post('/api/tools/run', { tool_name: toolName, parameters });
      return response.data;
    } catch (error) {
      console.error('Run OSINT tool error:', error);
      throw error;
    }
  }

  // Alias for backward compatibility
  async runTool(toolName, target, options = {}) {
    const parameters = { target, ...options };
    return this.runOsintTool(toolName, parameters);
  }

  // Get available tools
  async getAvailableTools() {
    try {
      const response = await this.api.get('/api/tools/available');
      return response.data;
    } catch (error) {
      console.error('Get available tools error:', error);
      throw error;
    }
  }

  // Get system health with comprehensive status
  async getSystemHealth() {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      console.error('System health check error:', error);
      throw error;
    }
  }

  // Advanced search with multiple parameters
  async advancedSearch(searchParams) {
    try {
      console.log('🔍 Advanced OSINT search:', searchParams);
      const response = await this.api.post('/api/search/people', {
        ...searchParams,
        advanced_options: {
          deep_search: true,
          include_images: true,
          include_documents: true,
          correlate_data: true,
          search_engines: true,
          social_media: true,
          public_records: true,
          professional_networks: true,
          ...searchParams.advanced_options
        }
      });
      return response.data;
    } catch (error) {
      console.error('Advanced search error:', error);
      throw error;
    }
  }

  // Get detailed search results
  async getDetailedResults(searchId) {
    try {
      const response = await this.api.get(`/api/search/results/${searchId}`);
      return response.data;
    } catch (error) {
      console.error('Get detailed results error:', error);
      throw error;
    }
  }

  // Check search status
  async getSearchStatus(searchId) {
    try {
      const response = await this.api.get(`/api/search/status/${searchId}`);
      return response.data;
    } catch (error) {
      console.error('Get search status error:', error);
      throw error;
    }
  }

  // Generate report
  async generateReport(searchId, format = 'pdf') {
    try {
      const response = await this.api.post('/api/reports/generate', { search_id: searchId, format });
      return response.data;
    } catch (error) {
      console.error('Generate report error:', error);
      throw error;
    }
  }

  // Create investigation session
  async createSession(sessionData) {
    try {
      const response = await this.api.post('/api/sessions/create', sessionData);
      return response.data;
    } catch (error) {
      console.error('Create session error:', error);
      throw error;
    }
  }

  // Get investigation session
  async getSession(sessionId) {
    try {
      const response = await this.api.get(`/api/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Get session error:', error);
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService;
export { apiService };
