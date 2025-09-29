// Real OSINT Analysis Service
import axios from 'axios';

class OSINTAnalysisService {
  constructor() {
    this.rateLimitDelay = 1000; // 1 second between requests
  }

  // Delay function for rate limiting
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Extract domain from URL
  extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return null;
    }
  }

  // Detect social media platforms
  detectPlatform(url) {
    const domain = this.extractDomain(url);
    if (!domain) return 'unknown';

    const platforms = {
      'linkedin.com': 'linkedin',
      'github.com': 'github',
      'twitter.com': 'twitter',
      'x.com': 'twitter',
      'facebook.com': 'facebook',
      'instagram.com': 'instagram',
      'youtube.com': 'youtube',
      'tiktok.com': 'tiktok',
      'reddit.com': 'reddit',
      'pinterest.com': 'pinterest',
      'behance.net': 'behance',
      'dribbble.com': 'dribbble',
      'stackoverflow.com': 'stackoverflow',
      'medium.com': 'medium',
      'twitch.tv': 'twitch'
    };

    for (const [platformDomain, platform] of Object.entries(platforms)) {
      if (domain.includes(platformDomain)) {
        return platform;
      }
    }
    return 'other';
  }

  // Generate search queries for different platforms
  generateSearchQueries(targetName, location = '', profession = '') {
    const queries = [];
    const name = targetName.trim();
    
    if (!name) return [];

    // Basic name searches
    queries.push(`"${name}"`);
    queries.push(`"${name}" profile`);
    queries.push(`"${name}" social`);

    // Platform-specific searches
    const platforms = ['linkedin', 'facebook', 'twitter', 'instagram', 'github'];
    platforms.forEach(platform => {
      queries.push(`"${name}" site:${platform}.com`);
      if (location) {
        queries.push(`"${name}" "${location}" site:${platform}.com`);
      }
      if (profession) {
        queries.push(`"${name}" "${profession}" site:${platform}.com`);
      }
    });

    // Email pattern searches
    const nameParts = name.toLowerCase().split(' ');
    if (nameParts.length >= 2) {
      const emailPattern = `${nameParts[0]}.${nameParts[1]}`;
      queries.push(`"${emailPattern}@" OR "${nameParts[0]}${nameParts[1]}@"`);
    }

    // Username pattern searches
    if (nameParts.length >= 2) {
      const usernamePattern = nameParts.join('');
      queries.push(`"${usernamePattern}" username OR handle`);
    }

    return queries;
  }

  // Analyze URL and extract metadata
  async analyzeURL(url) {
    try {
      await this.delay(this.rateLimitDelay);

      // Basic URL validation
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      const domain = this.extractDomain(url);
      const platform = this.detectPlatform(url);

      // Since we can't make cross-origin requests from the browser,
      // we'll analyze what we can from the URL structure
      const analysis = {
        url: url,
        domain: domain,
        platform: platform,
        isActive: false, // Would require actual HTTP request
        title: '',
        description: '',
        metadata: {},
        confidence: 0,
        lastUpdated: new Date(),
        analysisMethod: 'url_structure'
      };

      // Platform-specific URL analysis
      switch (platform) {
        case 'linkedin':
          analysis.metadata = this.analyzeLinkedInURL(url);
          analysis.confidence = analysis.metadata.username ? 85 : 30;
          break;
        case 'github':
          analysis.metadata = this.analyzeGitHubURL(url);
          analysis.confidence = analysis.metadata.username ? 90 : 30;
          break;
        case 'twitter':
          analysis.metadata = this.analyzeTwitterURL(url);
          analysis.confidence = analysis.metadata.username ? 85 : 30;
          break;
        case 'facebook':
          analysis.metadata = this.analyzeFacebookURL(url);
          analysis.confidence = analysis.metadata.username ? 80 : 30;
          break;
        case 'instagram':
          analysis.metadata = this.analyzeInstagramURL(url);
          analysis.confidence = analysis.metadata.username ? 85 : 30;
          break;
        default:
          analysis.confidence = 50;
      }

      return analysis;
    } catch (error) {
      console.error('Error analyzing URL:', error);
      return {
        url: url,
        domain: this.extractDomain(url),
        platform: this.detectPlatform(url),
        error: error.message,
        confidence: 0,
        lastUpdated: new Date()
      };
    }
  }

  // Analyze LinkedIn URL structure
  analyzeLinkedInURL(url) {
    const metadata = {};
    
    // Extract username from LinkedIn URL
    const linkedinPattern = /linkedin\.com\/in\/([^\/\?]+)/;
    const match = url.match(linkedinPattern);
    
    if (match) {
      metadata.username = match[1];
      metadata.profileType = 'personal';
      metadata.urlPattern = 'standard';
    } else if (url.includes('/company/')) {
      metadata.profileType = 'company';
      const companyMatch = url.match(/\/company\/([^\/\?]+)/);
      if (companyMatch) {
        metadata.username = companyMatch[1];
      }
    }

    return metadata;
  }

  // Analyze GitHub URL structure
  analyzeGitHubURL(url) {
    const metadata = {};
    
    const githubPattern = /github\.com\/([^\/\?]+)/;
    const match = url.match(githubPattern);
    
    if (match) {
      metadata.username = match[1];
      metadata.profileType = 'user';
      
      // Check if it's a repository URL
      if (url.includes('/' + match[1] + '/')) {
        const repoMatch = url.match(/github\.com\/[^\/]+\/([^\/\?]+)/);
        if (repoMatch) {
          metadata.repository = repoMatch[1];
        }
      }
    }

    return metadata;
  }

  // Analyze Twitter URL structure
  analyzeTwitterURL(url) {
    const metadata = {};
    
    const twitterPattern = /(twitter\.com|x\.com)\/([^\/\?]+)/;
    const match = url.match(twitterPattern);
    
    if (match) {
      metadata.username = match[2];
      metadata.profileType = 'personal';
      metadata.platform = match[1].includes('x.com') ? 'x' : 'twitter';
    }

    return metadata;
  }

  // Analyze Facebook URL structure
  analyzeFacebookURL(url) {
    const metadata = {};
    
    // Facebook has various URL patterns
    const patterns = [
      /facebook\.com\/([^\/\?]+)/,
      /facebook\.com\/profile\.php\?id=([^&]+)/,
      /facebook\.com\/people\/[^\/]+\/([^\/\?]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        metadata.username = match[1];
        metadata.profileType = 'personal';
        break;
      }
    }

    return metadata;
  }

  // Analyze Instagram URL structure
  analyzeInstagramURL(url) {
    const metadata = {};
    
    const instagramPattern = /instagram\.com\/([^\/\?]+)/;
    const match = url.match(instagramPattern);
    
    if (match) {
      metadata.username = match[1];
      metadata.profileType = 'personal';
    }

    return metadata;
  }

  // Perform comprehensive search for a target
  async performOSINTSearch(targetName, options = {}) {
    const {
      location = '',
      profession = '',
      email = '',
      phone = '',
      additionalKeywords = []
    } = options;

    const results = {
      target: targetName,
      searchQueries: [],
      potentialProfiles: [],
      recommendations: [],
      searchTimestamp: new Date(),
      confidence: 'medium'
    };

    // Generate search queries
    results.searchQueries = this.generateSearchQueries(targetName, location, profession);

    // Add email-based searches if provided
    if (email) {
      results.searchQueries.push(`"${email}"`);
      results.searchQueries.push(`"${email}" profile`);
    }

    // Add phone-based searches if provided
    if (phone) {
      results.searchQueries.push(`"${phone}"`);
      results.searchQueries.push(`"${phone}" contact`);
    }

    // Generate potential profile URLs based on common patterns
    results.potentialProfiles = this.generatePotentialProfiles(targetName, location, profession);

    // Generate search recommendations
    results.recommendations = this.generateSearchRecommendations(targetName, options);

    return results;
  }

  // Generate potential profile URLs based on name patterns
  generatePotentialProfiles(targetName, location, profession) {
    const profiles = [];
    const nameParts = targetName.toLowerCase().split(' ').filter(part => part.length > 0);
    
    if (nameParts.length === 0) return profiles;

    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    
    // Common username patterns
    const usernamePatterns = [
      `${firstName}${lastName}`,
      `${firstName}.${lastName}`,
      `${firstName}_${lastName}`,
      `${firstName}${lastName[0]}`,
      `${firstName[0]}${lastName}`,
      firstName,
      lastName
    ];

    // Generate profiles for major platforms
    const platforms = [
      { name: 'LinkedIn', baseUrl: 'https://linkedin.com/in/', confidence: 80 },
      { name: 'GitHub', baseUrl: 'https://github.com/', confidence: 75 },
      { name: 'Twitter', baseUrl: 'https://twitter.com/', confidence: 70 },
      { name: 'Instagram', baseUrl: 'https://instagram.com/', confidence: 65 },
      { name: 'Facebook', baseUrl: 'https://facebook.com/', confidence: 60 }
    ];

    platforms.forEach(platform => {
      usernamePatterns.forEach(pattern => {
        profiles.push({
          platform: platform.name,
          url: platform.baseUrl + pattern,
          username: pattern,
          confidence: platform.confidence,
          method: 'pattern_generation'
        });
      });
    });

    return profiles.slice(0, 20); // Limit to 20 most likely profiles
  }

  // Generate search recommendations
  generateSearchRecommendations(targetName, options) {
    const recommendations = [];

    recommendations.push({
      type: 'search_engine',
      title: 'Google Advanced Search',
      description: 'Use Google\'s advanced search operators for more precise results',
      action: 'Try searching with site-specific operators'
    });

    recommendations.push({
      type: 'reverse_search',
      title: 'Reverse Image Search',
      description: 'If you have a photo, use reverse image search to find profiles',
      action: 'Upload photo to Google Images or TinEye'
    });

    recommendations.push({
      type: 'username_search',
      title: 'Username Enumeration',
      description: 'Check if common username patterns exist across platforms',
      action: 'Use tools like Sherlock or Namechk'
    });

    if (options.email) {
      recommendations.push({
        type: 'email_search',
        title: 'Email Investigation',
        description: 'Search for the email address across different platforms',
        action: 'Use email enumeration tools'
      });
    }

    if (options.phone) {
      recommendations.push({
        type: 'phone_search',
        title: 'Phone Number Investigation',
        description: 'Search for the phone number in public records',
        action: 'Use reverse phone lookup services'
      });
    }

    return recommendations;
  }

  // Profile analysis for social media URLs
  async analyzeProfile(profileUrl, platform) {
    try {
      const basicAnalysis = await this.analyzeURL(profileUrl);
      
      // Enhanced analysis based on platform
      const analysis = {
        ...basicAnalysis,
        platform: platform || basicAnalysis.platform,
        profileAnalysis: {
          accountAge: 'unknown',
          activityLevel: 'unknown',
          followerCount: 'unknown',
          connectionCount: 'unknown',
          profileCompleteness: 'unknown',
          verificationStatus: 'unknown',
          riskFactors: [],
          strengths: []
        },
        recommendations: []
      };

      // Add platform-specific analysis recommendations
      switch (analysis.platform) {
        case 'linkedin':
          analysis.recommendations.push('Check for mutual connections');
          analysis.recommendations.push('Look for company information');
          analysis.recommendations.push('Verify employment history');
          break;
        case 'github':
          analysis.recommendations.push('Analyze repository activity');
          analysis.recommendations.push('Check contribution patterns');
          analysis.recommendations.push('Look for contact information in profiles');
          break;
        case 'twitter':
          analysis.recommendations.push('Analyze tweet patterns and frequency');
          analysis.recommendations.push('Check follower/following ratio');
          analysis.recommendations.push('Look for linked accounts');
          break;
      }

      return analysis;
    } catch (error) {
      console.error('Profile analysis error:', error);
      return {
        url: profileUrl,
        platform: platform,
        error: error.message,
        confidence: 0
      };
    }
  }
}

export default new OSINTAnalysisService();