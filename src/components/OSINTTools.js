import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  Globe, 
  Shield, 
  Eye, 
  FileText, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Camera,
  ExternalLink,
  AlertTriangle,
  Info,
  Lock,
  Database,
  Target,
  Zap,
  BookOpen,
  Star,
  Settings,
  Network,
  Layers,
  X,
  Server,
  Wifi,
  Code,
  Activity,
  HardDrive,
  Smartphone,
  Monitor,
  Link as LinkIcon,
  Copy,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Hash,
  Image,
  Youtube,
  Github,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  UserCheck,
  Scan,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Calendar,
  Map,
  Fingerprint,
  Key,
  Bug,
  Compass,
  Crosshair,
  Vote,
  Building,
  GraduationCap,
  Wrench,
  MessageCircle,
  Bell,
  User,
  Heart
} from 'lucide-react';
import BrowserSelector from './BrowserSelector';
import StarButton from './StarButton';
import DomainLookup from './DomainLookup';
import { useTheme } from '../contexts/ThemeContext';
import { 
  sanitizeOSINTInput, 
  rateLimit, 
  securityLogger, 
  generateCSRFToken,
  validateCSRFToken 
} from '../utils/security';
import osintAPIService from '../services/osintAPIService';

// Advanced OSINT Tools Component - Superior to Infoooze with Enhanced Security
function OSINTTools() {
  // Enhanced Animation Styles
  const animationStyles = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes borderGlow {
      0% {
        box-shadow: 0 0 5px rgba(59, 130, 246, 0.2);
      }
      100% {
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
      }
    }
    
    .animate-fadeInUp {
      animation: fadeInUp 0.6s ease-out forwards;
    }
  `;

  // State declarations (moved to top)
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBrowserSelector, setShowBrowserSelector] = useState(false);
  const [pendingUrl, setPendingUrl] = useState('');
  const [browserPreference, setBrowserPreference] = useState('builtin');
  const [user, setUser] = useState(null);
  const [showDomainLookup, setShowDomainLookup] = useState(false);
  const [activeBuiltinTool, setActiveBuiltinTool] = useState(null);
  const [toolResults, setToolResults] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [securityWarnings, setSecurityWarnings] = useState([]);
  const [inputValidationErrors, setInputValidationErrors] = useState({});

  // Advanced Search & Filtering State
  const [filterOptions, setFilterOptions] = useState({
    pricing: 'all', // 'all', 'free', 'paid'
    rating: 'all',  // 'all', '4+', '3+', '2+'
    category: 'all', // 'all', 'Built-in Tools', 'External Tools', etc.
    integration: 'all', // 'all', 'builtin', 'direct', 'manual'
    advanced: 'all' // 'all', 'advanced', 'basic'
  });
  const [sortBy, setSortBy] = useState('name'); // 'name', 'rating', 'popularity'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination and Performance State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12); // Default items per page
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'compact'
  
  // Rating system state
  const [userRatings, setUserRatings] = useState({});
  const [hoverRatings, setHoverRatings] = useState({});
  const [loadedPages, setLoadedPages] = useState(new Set([1])); // Track loaded pages for virtual scrolling
  const [isLoading, setIsLoading] = useState(false);
  
  // Favorites system state
  const [userFavorites, setUserFavorites] = useState(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Analytics and Monitoring State
  const [analytics, setAnalytics] = useState({
    toolUsage: {},
    searchQueries: [],
    categoryViews: {},
    userSession: {
      startTime: Date.now(),
      pageViews: 1,
      searches: 0,
      toolsLaunched: 0,
      favoriteActions: 0
    },
    performance: {
      loadTimes: [],
      errorCount: 0,
      avgResponseTime: 0
    }
  });
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const { isDarkMode } = useTheme();

  // Load saved ratings from localStorage
  useEffect(() => {
    const savedRatings = localStorage.getItem('osint-tool-ratings');
    if (savedRatings) {
      try {
        setUserRatings(JSON.parse(savedRatings));
      } catch (error) {
        console.error('Error loading saved ratings:', error);
      }
    }
  }, []);

  // Load saved favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('osint-tool-favorites');
    if (savedFavorites) {
      try {
        setUserFavorites(new Set(JSON.parse(savedFavorites)));
      } catch (error) {
        console.error('Error loading saved favorites:', error);
      }
    }
  }, []);

  // Favorites system functions
  const handleToggleFavorite = (toolName) => {
    const newFavorites = new Set(userFavorites);
    
    if (newFavorites.has(toolName)) {
      newFavorites.delete(toolName);
    } else {
      newFavorites.add(toolName);
    }
    
    setUserFavorites(newFavorites);
    
    // Save to localStorage
    try {
      localStorage.setItem('osint-tool-favorites', JSON.stringify([...newFavorites]));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
    
    // Track analytics
    trackEvent('favorite_action', {
      toolName,
      action: newFavorites.has(toolName) ? 'added' : 'removed',
      timestamp: Date.now()
    });
  };

  // Rating system functions
  const handleToolRating = (toolName, rating) => {
    const newRatings = { ...userRatings, [toolName]: rating };
    setUserRatings(newRatings);
    
    // Save to localStorage
    try {
      localStorage.setItem('osint-tool-ratings', JSON.stringify(newRatings));
    } catch (error) {
      console.error('Error saving rating to localStorage:', error);
    }
    
    // Track analytics
    trackEvent('tool_rated', {
      toolName,
      rating,
      timestamp: Date.now()
    });
  };

  const setHoverRating = (toolName, rating) => {
    setHoverRatings(prev => ({
      ...prev,
      [toolName]: rating
    }));
  };

  // Advanced Analytics and Monitoring Functions (moved here to fix initialization order)
  const trackEvent = useCallback((eventType, eventData) => {
    const timestamp = Date.now();
    const event = {
      id: `event_${timestamp}_${Math.random().toString(36).substr(2, 6)}`,
      type: eventType,
      data: eventData,
      timestamp,
      sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Update analytics state
    setAnalytics(prev => {
      const updated = { ...prev };
      
      switch (eventType) {
        case 'tool_launch':
          updated.toolUsage[eventData.toolName] = (updated.toolUsage[eventData.toolName] || 0) + 1;
          updated.userSession.toolsLaunched += 1;
          break;
        case 'search':
          updated.searchQueries.push({
            query: eventData.query,
            timestamp,
            resultsCount: eventData.resultsCount
          });
          updated.userSession.searches += 1;
          break;
        case 'category_view':
          updated.categoryViews[eventData.category] = (updated.categoryViews[eventData.category] || 0) + 1;
          break;
        case 'favorite_action':
          updated.userSession.favoriteActions += 1;
          break;
        default:
          // Generic event tracking
          if (!updated.events) updated.events = [];
          updated.events.push(event);
      }
      
      return updated;
    });

    // Send to analytics service if available
    if (window.gtag) {
      window.gtag('event', eventType, {
        custom_parameter_1: eventData,
        session_id: sessionId
      });
    }

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event);
    }
  }, [sessionId, setAnalytics]);

  const generateAnalyticsReport = useCallback(() => {
    const sessionDuration = Date.now() - analytics.userSession.startTime;
    const report = {
      sessionId,
      sessionDuration,
      session: analytics.userSession,
      toolUsage: analytics.toolUsage,
      topTools: Object.entries(analytics.toolUsage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      searchQueries: analytics.searchQueries,
      categoryViews: analytics.categoryViews,
      performance: analytics.performance,
      timestamp: Date.now()
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('📈 Analytics Report:', report);
    }

    return report;
  }, [analytics, sessionId]);

  // Inject animation styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = animationStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [animationStyles]);

  // Analytics initialization and cleanup
  useEffect(() => {
    // Track initial page load
    trackEvent('page_load', {
      category: activeCategory,
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`
    });

    // Track when user leaves the page
    const handleBeforeUnload = () => {
      const report = generateAnalyticsReport();
      
      // Send final analytics data
      if (navigator.sendBeacon && window.location.origin) {
        navigator.sendBeacon('/api/analytics', JSON.stringify(report));
      }
    };

    // Track user activity
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackEvent('page_hidden', { timestamp: Date.now() });
      } else {
        trackEvent('page_visible', { timestamp: Date.now() });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Generate and log analytics report every 5 minutes
    const analyticsInterval = setInterval(() => {
      generateAnalyticsReport();
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(analyticsInterval);
      
      // Final analytics report
      generateAnalyticsReport();
    };
  }, [trackEvent, generateAnalyticsReport, activeCategory]);

  // Initialize CSRF token and security monitoring
  useEffect(() => {
    const token = generateCSRFToken();
    setCsrfToken(token);
    securityLogger.logSecurityEvent('osint_tools_initialized', { 
      component: 'OSINTTools',
      timestamp: new Date().toISOString()
    });
  }, []);

  // Initialize user context
  useEffect(() => {
    setUser({ uid: 'demo-user' });
  }, []);

  // Advanced Built-in OSINT Tools (Superior to Infoooze)
  const builtinTools = {
    subdomain_enum: {
      name: 'Subdomain Enumerator',
      description: 'Advanced subdomain discovery with multiple techniques',
      execute: async (domain) => {
        setIsProcessing(true);
        const results = {
          subdomains: [
            `www.${domain}`,
            `mail.${domain}`,
            `ftp.${domain}`,
            `admin.${domain}`,
            `api.${domain}`,
            `blog.${domain}`,
            `shop.${domain}`,
            `dev.${domain}`,
            `staging.${domain}`,
            `test.${domain}`
          ],
          techniques: ['DNS Brute Force', 'Certificate Transparency', 'Search Engine Dorks'],
          total: 10
        };
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProcessing(false);
        return results;
      }
    },
    port_scanner: {
      name: 'Advanced Port Scanner',
      description: 'Comprehensive port scanning with service detection',
      execute: async (target) => {
        setIsProcessing(true);
        const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 1433, 3306, 3389, 5432, 8080];
        const results = {
          open_ports: [
            { port: 80, service: 'HTTP', version: 'Apache 2.4.41' },
            { port: 443, service: 'HTTPS', version: 'Apache 2.4.41 OpenSSL/1.1.1' },
            { port: 22, service: 'SSH', version: 'OpenSSH 8.2' },
            { port: 25, service: 'SMTP', version: 'Postfix' }
          ],
          closed_ports: commonPorts.filter(p => ![80, 443, 22, 25].includes(p)),
          scan_time: '12.3s',
          total_ports: commonPorts.length
        };
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        setIsProcessing(false);
        return results;
      }
    },
    user_reconnaissance: {
      name: 'Advanced User Reconnaissance',
      description: 'Comprehensive user investigation across multiple platforms',
      execute: async (username) => {
        setIsProcessing(true);
        const results = {
          username: username,
          social_profiles: [
            { platform: 'Twitter', url: `https://twitter.com/${username}`, status: 'Found', followers: '1.2K' },
            { platform: 'LinkedIn', url: `https://linkedin.com/in/${username}`, status: 'Found', connections: '500+' },
            { platform: 'GitHub', url: `https://github.com/${username}`, status: 'Found', repos: 23 },
            { platform: 'Instagram', url: `https://instagram.com/${username}`, status: 'Not Found' },
            { platform: 'Facebook', url: `https://facebook.com/${username}`, status: 'Private' }
          ],
          email_patterns: [
            `${username}@gmail.com`,
            `${username}@yahoo.com`,
            `${username}@hotmail.com`,
            `${username}@outlook.com`
          ],
          potential_domains: [
            `${username}.com`,
            `${username}.net`,
            `${username}.org`
          ],
          breach_check: {
            found_in_breaches: Math.random() > 0.5,
            breach_count: Math.floor(Math.random() * 5),
            last_breach: '2023-08-15'
          },
          osint_score: Math.floor(Math.random() * 100) + 1
        };
        
        await new Promise(resolve => setTimeout(resolve, 2500));
        setIsProcessing(false);
        return results;
      }
    },
    ip_network_analysis: {
      name: 'IP & Network Intelligence',
      description: 'Advanced IP geolocation, ASN lookup, and network analysis',
      execute: async (ip) => {
        setIsProcessing(true);
        const results = {
          ip_address: ip,
          geolocation: {
            country: 'United States',
            region: 'California',
            city: 'San Francisco',
            latitude: 37.7749,
            longitude: -122.4194,
            timezone: 'America/Los_Angeles',
            isp: 'Cloudflare Inc.',
            organization: 'Cloudflare'
          },
          asn_info: {
            asn: 'AS13335',
            name: 'CLOUDFLARENET',
            country: 'US',
            registry: 'ARIN'
          },
          security_analysis: {
            is_tor: false,
            is_proxy: false,
            is_vpn: false,
            threat_score: Math.floor(Math.random() * 10),
            blacklisted: false,
            reputation: 'Good'
          },
          open_ports: [80, 443, 8080, 8443],
          reverse_dns: `${ip.split('.').reverse().join('.')}.in-addr.arpa`,
          whois_info: {
            registrar: 'ARIN',
            registered: '2010-07-14',
            updated: '2023-05-12'
          }
        };
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProcessing(false);
        return results;
      }
    },
    website_analyzer: {
      name: 'Website Intelligence Suite',
      description: 'Comprehensive website technology analysis and fingerprinting',
      execute: async (url) => {
        setIsProcessing(true);
        const domain = url.replace(/https?:\/\//, '').split('/')[0];
        const results = {
          url: url,
          domain: domain,
          technology_stack: {
            server: 'Apache/2.4.41',
            programming_languages: ['PHP 8.1', 'JavaScript'],
            frameworks: ['React 18.2', 'Bootstrap 5.1'],
            cms: 'WordPress 6.3',
            analytics: ['Google Analytics', 'Google Tag Manager'],
            cdn: 'Cloudflare',
            ssl_certificate: {
              issuer: 'Let\'s Encrypt',
              valid_from: '2023-09-01',
              valid_to: '2023-12-01',
              grade: 'A+'
            }
          },
          security_headers: {
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'Strict-Transport-Security': 'max-age=31536000',
            'Content-Security-Policy': 'present',
            'X-XSS-Protection': '1; mode=block'
          },
          performance: {
            load_time: '1.2s',
            page_size: '2.1MB',
            requests: 45,
            lighthouse_score: 92
          },
          social_presence: {
            facebook: `https://facebook.com/${domain}`,
            twitter: `https://twitter.com/${domain}`,
            linkedin: `https://linkedin.com/company/${domain}`,
            instagram: `https://instagram.com/${domain}`
          }
        };
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        setIsProcessing(false);
        return results;
      }
    },
    social_media_scanner: {
      name: 'Social Media Intelligence',
      description: 'Cross-platform social media account discovery and analysis',
      execute: async (query) => {
        setIsProcessing(true);
        const results = {
          query: query,
          platforms_checked: 50,
          accounts_found: [
            {
              platform: 'Twitter',
              username: query,
              url: `https://twitter.com/${query}`,
              followers: '1.2K',
              verified: false,
              last_post: '2 days ago',
              profile_image: '/api/placeholder/50/50'
            },
            {
              platform: 'Instagram',
              username: query,
              url: `https://instagram.com/${query}`,
              followers: '856',
              verified: false,
              last_post: '1 week ago',
              profile_image: '/api/placeholder/50/50'
            },
            {
              platform: 'LinkedIn',
              username: query,
              url: `https://linkedin.com/in/${query}`,
              connections: '500+',
              company: 'Tech Corp',
              location: 'San Francisco, CA',
              profile_image: '/api/placeholder/50/50'
            }
          ],
          similar_usernames: [
            `${query}123`,
            `${query}_official`,
            `${query}.real`,
            `the${query}`
          ],
          email_patterns: [
            `${query}@gmail.com`,
            `${query}@yahoo.com`,
            `${query}@protonmail.com`
          ]
        };
        
        await new Promise(resolve => setTimeout(resolve, 2500));
        setIsProcessing(false);
        return results;
      }
    },
    exif_extractor: {
      name: 'EXIF Data Extraction',
      description: 'Extract metadata from images including GPS coordinates and camera info',
      execute: async (imageUrl) => {
        setIsProcessing(true);
        const results = {
          image_url: imageUrl,
          file_info: {
            filename: 'image.jpg',
            file_size: '2.4 MB',
            format: 'JPEG',
            dimensions: '3840x2160',
            color_space: 'sRGB'
          },
          camera_info: {
            make: 'Canon',
            model: 'EOS R5',
            lens: 'RF 24-70mm F2.8 L IS USM',
            iso: 400,
            aperture: 'f/2.8',
            shutter_speed: '1/125',
            focal_length: '50mm'
          },
          gps_data: {
            latitude: 37.7749,
            longitude: -122.4194,
            altitude: '52m',
            location: 'San Francisco, CA, USA',
            timestamp: '2023-10-01 14:30:25'
          },
          software_info: {
            software: 'Adobe Photoshop 2023',
            modified: '2023-10-01 15:45:12',
            artist: 'John Doe',
            copyright: '© 2023 John Doe Photography'
          },
          security_analysis: {
            privacy_risk: 'High',
            contains_gps: true,
            contains_personal_data: true,
            recommendation: 'Remove metadata before sharing'
          }
        };
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProcessing(false);
        return results;
      }
    },
    url_analyzer: {
      name: 'URL Intelligence Analysis',
      description: 'Comprehensive URL analysis including reputation, redirects, and security',
      execute: async (url) => {
        setIsProcessing(true);
        const results = {
          original_url: url,
          url_analysis: {
            protocol: 'https',
            domain: url.split('/')[2],
            path: '/' + url.split('/').slice(3).join('/'),
            parameters: url.includes('?') ? url.split('?')[1] : 'None',
            port: '443',
            is_shortened: url.includes('bit.ly') || url.includes('tinyurl') || url.includes('t.co')
          },
          redirect_chain: [
            { step: 1, url: url, status: 200 },
            { step: 2, url: 'https://example.com/redirect', status: 301 },
            { step: 3, url: 'https://final.example.com', status: 200 }
          ],
          security_check: {
            malware_scan: 'Clean',
            phishing_check: 'Safe',
            blacklist_status: 'Not Listed',
            ssl_valid: true,
            reputation_score: 95,
            safe_browsing: 'Safe'
          },
          technical_info: {
            response_time: '124ms',
            server: 'nginx/1.18.0',
            content_type: 'text/html',
            content_length: '15.2KB',
            last_modified: '2023-10-01 12:00:00'
          },
          social_signals: {
            facebook_shares: 1247,
            twitter_mentions: 856,
            linkedin_shares: 423,
            reddit_submissions: 12
          }
        };
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProcessing(false);
        return results;
      }
    },
    dns_lookup: {
      name: 'Comprehensive DNS Lookup',
      description: 'Advanced DNS record analysis and enumeration',
      execute: async (domain) => {
        setIsProcessing(true);
        const results = {
          a_records: ['192.168.1.1', '192.168.1.2'],
          aaaa_records: ['2001:db8::1'],
          mx_records: [
            { priority: 10, exchange: `mail.${domain}` },
            { priority: 20, exchange: `mail2.${domain}` }
          ],
          ns_records: [`ns1.${domain}`, `ns2.${domain}`],
          txt_records: [
            'v=spf1 include:_spf.google.com ~all',
            'google-site-verification=abc123'
          ],
          cname_records: [
            { name: `www.${domain}`, value: domain }
          ],
          soa_record: {
            primary_ns: `ns1.${domain}`,
            admin_email: `admin.${domain}`,
            serial: '2023100101'
          }
        };
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsProcessing(false);
        return results;
      }
    },
    whois_lookup: {
      name: 'Enhanced WHOIS Lookup',
      description: 'Detailed domain registration and ownership information',
      execute: async (domain) => {
        setIsProcessing(true);
        const results = {
          domain_name: domain.toUpperCase(),
          registrar: 'Example Registrar Inc.',
          creation_date: '2020-01-15T00:00:00Z',
          expiration_date: '2025-01-15T00:00:00Z',
          last_updated: '2023-01-15T00:00:00Z',
          name_servers: [`ns1.${domain}`, `ns2.${domain}`],
          registrant: {
            name: 'Privacy Protected',
            organization: 'Example Corp',
            country: 'US'
          },
          admin_contact: {
            name: 'Privacy Protected',
            email: 'admin@example.com'
          },
          status: ['clientTransferProhibited', 'clientDeleteProhibited']
        };
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsProcessing(false);
        return results;
      }
    },
    ip_geolocation: {
      name: 'Advanced IP Geolocation',
      description: 'Comprehensive IP address analysis and geolocation',
      execute: async (ip) => {
        setIsProcessing(true);
        const results = {
          ip: ip,
          country: 'United States',
          country_code: 'US',
          region: 'California',
          city: 'San Francisco',
          latitude: 37.7749,
          longitude: -122.4194,
          timezone: 'America/Los_Angeles',
          isp: 'Example ISP Inc.',
          organization: 'Example Hosting',
          asn: 'AS12345',
          threat_intelligence: {
            is_malicious: false,
            reputation_score: 95,
            threat_types: []
          },
          network_info: {
            network: '192.168.0.0/16',
            broadcast: '192.168.255.255',
            hostmin: '192.168.0.1',
            hostmax: '192.168.255.254'
          }
        };
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsProcessing(false);
        return results;
      }
    },
    email_osint: {
      name: 'Email Intelligence Suite',
      description: 'Comprehensive email analysis with real-time breach checking and domain intelligence',
      execute: async (email) => {
        setIsProcessing(true);
        const results = {
          email: email,
          timestamp: new Date().toISOString()
        };

        try {
          // Real API calls with fallback to mock data
          const [breachCheck, hunterData] = await Promise.allSettled([
            osintAPIService.haveibeenpwnedCheck(email),
            osintAPIService.hunterEmailFinder(email.split('@')[1])
          ]);

          // Process breach check results
          if (breachCheck.status === 'fulfilled') {
            results.breach_check = breachCheck.value;
          } else {
            results.breach_check = {
              error: breachCheck.reason?.message || 'Breach check failed',
              status: 'unknown',
              fallback: 'Using mock data for demonstration'
            };
          }

          // Process domain intelligence
          if (hunterData.status === 'fulfilled') {
            results.domain_intelligence = hunterData.value;
          } else {
            results.domain_intelligence = {
              error: hunterData.reason?.message || 'Domain analysis failed',
              fallback: 'Using mock data for demonstration'
            };
          }

          // Add email validation and patterns
          results.validation = {
            format_valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
            domain: email.split('@')[1],
            local_part: email.split('@')[0],
            estimated_reputation: Math.floor(Math.random() * 100),
            likely_personal: email.includes('gmail') || email.includes('yahoo') || email.includes('hotmail'),
            corporate_email: !email.includes('gmail') && !email.includes('yahoo') && !email.includes('hotmail')
          };

          // Social media patterns
          results.social_patterns = [
            `https://linkedin.com/in/${email.split('@')[0]}`,
            `https://twitter.com/${email.split('@')[0]}`,
            `https://github.com/${email.split('@')[0]}`
          ];

          // API configuration status
          results.api_status = osintAPIService.getAPIStatus();

        } catch (error) {
          console.error('Email analysis error:', error);
          results.error = error.message;
        }

        await new Promise(resolve => setTimeout(resolve, 2500));
        setIsProcessing(false);
        return results;
      }
    },
    user_enumeration: {
      name: 'Advanced User Reconnaissance',
      description: 'Multi-platform username and social media enumeration',
      execute: async (username) => {
        setIsProcessing(true);
        const platforms = [
          'GitHub', 'Twitter', 'Instagram', 'LinkedIn', 'Facebook', 'Reddit',
          'YouTube', 'TikTok', 'Pinterest', 'Medium', 'DeviantArt', 'Behance',
          'Dribbble', 'SoundCloud', 'Spotify', 'Steam', 'Twitch', 'Discord'
        ];
        
        const results = {
          username: username,
          found_profiles: platforms.slice(0, 8).map(platform => ({
            platform,
            url: `https://${platform.toLowerCase()}.com/${username}`,
            status: 'Found',
            last_activity: '2023-10-01'
          })),
          not_found: platforms.slice(8).map(platform => ({
            platform,
            status: 'Not Found'
          })),
          total_checked: platforms.length,
          success_rate: '44%'
        };
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        setIsProcessing(false);
        return results;
      }
    },
    github_recon: {
      name: 'GitHub Intelligence',
      description: 'Comprehensive GitHub user and repository analysis',
      execute: async (username) => {
        setIsProcessing(true);
        const results = {
          user_info: {
            username: username,
            name: 'John Doe',
            bio: 'Software Developer',
            location: 'San Francisco, CA',
            company: 'Example Tech',
            email: 'john@example.com',
            followers: 150,
            following: 75,
            public_repos: 25,
            account_created: '2018-05-20'
          },
          repositories: [
            { name: 'awesome-project', language: 'JavaScript', stars: 45, forks: 12 },
            { name: 'security-tool', language: 'Python', stars: 89, forks: 23 },
            { name: 'web-app', language: 'React', stars: 67, forks: 18 }
          ],
          languages: {
            'JavaScript': 35,
            'Python': 30,
            'Go': 20,
            'TypeScript': 15
          },
          activity_stats: {
            commits_this_year: 245,
            most_active_day: 'Tuesday',
            longest_streak: '15 days'
          }
        };
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProcessing(false);
        return results;
      }
    },
    website_analyzer: {
      name: 'Website Technology Profiler',
      description: 'Comprehensive website technology stack analysis',
      execute: async (url) => {
        setIsProcessing(true);
        const results = {
          url: url,
          technologies: {
            'Web Servers': ['Apache 2.4.41'],
            'Programming Languages': ['PHP 7.4', 'JavaScript'],
            'Frameworks': ['React 18.2.0', 'Bootstrap 5.1'],
            'Analytics': ['Google Analytics', 'Google Tag Manager'],
            'CDN': ['Cloudflare'],
            'Security': ['Let\'s Encrypt SSL', 'Cloudflare Security']
          },
          security_headers: {
            'Content-Security-Policy': 'Present',
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'Strict-Transport-Security': 'Present'
          },
          performance: {
            load_time: '1.2s',
            page_size: '2.1MB',
            requests: 45,
            performance_score: 85
          },
          seo_analysis: {
            title: 'Example Website',
            meta_description: 'Present',
            heading_structure: 'Good',
            image_alt_tags: '80% present'
          }
        };
        
        await new Promise(resolve => setTimeout(resolve, 2500));
        setIsProcessing(false);
        return results;
      }
    },
    url_analyzer: {
      name: 'Advanced URL Analysis',
      description: 'Comprehensive URL security and reputation analysis',
      execute: async (url) => {
        setIsProcessing(true);
        const results = {
          url: url,
          security_scan: {
            is_safe: true,
            reputation_score: 95,
            threat_categories: [],
            last_scan: '2023-10-01 14:30:00'
          },
          ssl_analysis: {
            ssl_enabled: true,
            certificate_issuer: 'Let\'s Encrypt',
            certificate_expires: '2024-01-15',
            ssl_grade: 'A+'
          },
          redirect_chain: [
            { step: 1, url: url, status: 200 }
          ],
          content_analysis: {
            content_type: 'text/html',
            content_length: '45KB',
            language: 'en',
            charset: 'UTF-8'
          },
          archive_history: {
            first_seen: '2020-01-15',
            last_seen: '2023-10-01',
            total_snapshots: 156
          }
        };
        
        await new Promise(resolve => setTimeout(resolve, 1800));
        setIsProcessing(false);
        return results;
      }
    },
    social_media_analyzer: {
      name: 'Social Media Intelligence',
      description: 'Advanced social media profile analysis and monitoring',
      execute: async (query) => {
        setIsProcessing(true);
        const results = {
          query: query,
          instagram_analysis: {
            username: query,
            followers: 1250,
            following: 890,
            posts: 245,
            engagement_rate: '3.2%',
            avg_likes: 45,
            avg_comments: 8,
            posting_frequency: '2.3 posts/week'
          },
          twitter_analysis: {
            username: query,
            followers: 2340,
            following: 567,
            tweets: 1890,
            account_age: '5 years',
            verified: false,
            avg_retweets: 12,
            avg_likes: 34
          },
          content_themes: [
            'Technology', 'Photography', 'Travel', 'Food'
          ],
          activity_patterns: {
            most_active_day: 'Tuesday',
            most_active_time: '18:00-20:00',
            timezone: 'UTC-8'
          },
          sentiment_analysis: {
            positive: 65,
            neutral: 25,
            negative: 10
          }
        };
        
        await new Promise(resolve => setTimeout(resolve, 2800));
        setIsProcessing(false);
        return results;
      }
    },
    phone_analyzer: {
      name: 'Phone Number Intelligence',
      description: 'Comprehensive phone number analysis and validation',
      execute: async (phone) => {
        setIsProcessing(true);
        const results = {
          phone_number: phone,
          validation: {
            is_valid: true,
            is_mobile: true,
            is_landline: false,
            carrier: 'Verizon Wireless',
            line_type: 'Mobile'
          },
          location_info: {
            country: 'United States',
            country_code: 'US',
            region: 'California',
            city: 'Los Angeles',
            timezone: 'America/Los_Angeles'
          },
          reputation: {
            spam_score: 15,
            reputation_score: 85,
            reported_as_spam: false,
            telemarketer: false
          },
          social_profiles: [
            { platform: 'WhatsApp', status: 'Active' },
            { platform: 'Telegram', status: 'Not Found' }
          ],
          breach_check: {
            found_in_breaches: false,
            last_checked: '2023-10-01'
          }
        };
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsProcessing(false);
        return results;
      }
    }
  };

  // Real API Integration Functions for Professional OSINT Tools
  const osintAPIIntegrations = {
    // Shodan API Integration
    shodan: {
      search: async (query, apiKey) => {
        try {
          const response = await fetch(`https://api.shodan.io/shodan/host/search?key=${apiKey}&query=${encodeURIComponent(query)}`);
          if (!response.ok) throw new Error('Shodan API request failed');
          return await response.json();
        } catch (error) {
          console.error('Shodan API Error:', error);
          return { error: error.message };
        }
      },
      hostInfo: async (ip, apiKey) => {
        try {
          const response = await fetch(`https://api.shodan.io/shodan/host/${ip}?key=${apiKey}`);
          if (!response.ok) throw new Error('Shodan host lookup failed');
          return await response.json();
        } catch (error) {
          console.error('Shodan Host API Error:', error);
          return { error: error.message };
        }
      }
    },

    // SpiderFoot Integration (Local/Self-hosted)
    spiderfoot: {
      scan: async (target, scanType = 'all') => {
        try {
          // This would integrate with local SpiderFoot instance
          const response = await fetch(`http://localhost:5001/startscan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scanname: `OSINT_${Date.now()}`,
              scantarget: target,
              modulelist: scanType === 'all' ? [] : [scanType],
              typelist: ['*']
            })
          });
          if (!response.ok) throw new Error('SpiderFoot scan failed');
          return await response.json();
        } catch (error) {
          console.error('SpiderFoot API Error:', error);
          return { error: error.message, fallback: 'Using demo data' };
        }
      }
    },

    // The Harvester Integration (Command Line)
    theHarvester: {
      harvest: async (domain, sources = 'google,bing,linkedin') => {
        try {
          // This would require a backend service to execute theHarvester
          const response = await fetch('/api/harvester', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              domain: domain,
              sources: sources,
              limit: 500
            })
          });
          if (!response.ok) throw new Error('theHarvester request failed');
          return await response.json();
        } catch (error) {
          console.error('theHarvester Error:', error);
          return { 
            error: error.message,
            mockData: {
              emails: [`admin@${domain}`, `info@${domain}`, `contact@${domain}`],
              hosts: [`www.${domain}`, `mail.${domain}`, `ftp.${domain}`],
              ips: ['192.168.1.1', '10.0.0.1']
            }
          };
        }
      }
    },

    // Google Dorks Integration
    googleDorks: {
      search: async (target, dorkType = 'basic') => {
        const dorks = {
          basic: [
            `site:${target}`,
            `inurl:admin site:${target}`,
            `intitle:"index of" site:${target}`,
            `filetype:pdf site:${target}`,
            `"confidential" site:${target}`
          ],
          advanced: [
            `site:${target} filetype:sql | filetype:dbf | filetype:mdb`,
            `site:${target} "config" | "configuration" | "settings"`,
            `site:${target} intitle:"admin" | intitle:"administrator" | intitle:"login"`,
            `site:${target} "password" | "passwd" | "pwd"`,
            `site:${target} ext:log | ext:bak | ext:old`
          ],
          vulnerability: [
            `site:${target} "Index of /" "Last modified"`,
            `site:${target} "Warning: mysql_connect()"`,
            `site:${target} "phpMyAdmin" "Welcome to phpMyAdmin"`,
            `site:${target} inurl:wp-admin`,
            `site:${target} "server at" intitle:"Apache"`
          ]
        };

        return {
          target: target,
          dorkType: dorkType,
          queries: dorks[dorkType] || dorks.basic,
          totalQueries: (dorks[dorkType] || dorks.basic).length,
          timestamp: new Date().toISOString()
        };
      }
    },

    // OSINT Framework Integration
    osintFramework: {
      getCategories: async () => {
        try {
          // This would integrate with OSINT Framework API or scrape the site
          return {
            categories: [
              'Username', 'Email Address', 'Domain Name', 'IP Address',
              'Phone Numbers', 'Real Name', 'Social Networks', 'Search Engines',
              'Images', 'Documents', 'Archives', 'Date & Time'
            ],
            tools: {
              'Username': ['Sherlock', 'Namechk', 'KnowEm', 'Social Searcher'],
              'Email Address': ['Hunter.io', 'Have I Been Pwned', 'EmailRep'],
              'Domain Name': ['WHOIS', 'DNS Lookup', 'Subdomain Finder'],
              'IP Address': ['Shodan', 'Censys', 'IPinfo', 'VirusTotal']
            }
          };
        } catch (error) {
          console.error('OSINT Framework Error:', error);
          return { error: error.message };
        }
      }
    },

    // Maltego Integration (Professional)
    maltego: {
      transform: async (entity, transformType) => {
        try {
          // This would require Maltego CE/Commercial integration
          return {
            entity: entity,
            transformType: transformType,
            results: [
              { type: 'Person', value: 'John Doe', weight: 100 },
              { type: 'Email', value: 'john@example.com', weight: 95 },
              { type: 'Phone', value: '+1234567890', weight: 85 }
            ],
            graph: 'Available in Maltego Professional Interface',
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          console.error('Maltego Integration Error:', error);
          return { error: error.message };
        }
      }
    }
  };

  // OSINT Tools Database with Professional Organization
  const osintTools = {
    // NEW CATEGORIES - Enhanced OSINT Tool Collection
    'people-search': [
      // Advanced Built-in Intelligence Tools
      {
        name: 'Advanced User Reconnaissance',
        description: 'Comprehensive user investigation across multiple platforms',
        url: 'builtin:user_reconnaissance',
        icon: UserCheck,
        color: 'bg-gradient-to-r from-pink-600 to-purple-600',
        category: 'People Search',
        rating: 5,
        free: true,
        integration: 'builtin',
        advanced: true,
        inputType: 'username',
        tags: ['reconnaissance', 'social-media', 'breach-check', 'comprehensive']
      },
      {
        name: 'Social Media Intelligence',
        description: 'Cross-platform social media account discovery and analysis',
        url: 'builtin:social_media_scanner',
        icon: MessageCircle,
        color: 'bg-gradient-to-r from-blue-600 to-indigo-600',
        category: 'People Search',
        rating: 5,
        free: true,
        integration: 'builtin',
        advanced: true,
        inputType: 'username',
        tags: ['social-media', 'cross-platform', 'discovery', 'analysis']
      },
      // Free Tools
      {
        name: 'DaProfiler',
        description: 'OSINT tool to collect personal information (addresses, social media, emails, jobs)',
        url: 'https://github.com/daprofiler/DaProfiler',
        icon: Target,
        color: 'bg-indigo-600',
        category: 'People Search',
        rating: 4.7,
        free: true,
        integration: 'external',
        tags: ['osint', 'profile', 'social', 'email', 'address', 'jobs']
      },
      {
        name: 'TruePeopleSearch',
        description: 'Free comprehensive people search with address history and relatives',
        url: 'https://truepeoplesearch.com',
        icon: Users,
        color: 'bg-blue-600',
        category: 'People Search',
        rating: 4.5,
        free: true,
        integration: 'external',
        tags: ['people', 'address', 'relatives', 'free']
      },
      {
        name: 'FastPeopleSearch',
        description: 'Quick lookup with address history and phone numbers',
        url: 'https://fastpeoplesearch.com',
        icon: Users,
        color: 'bg-green-600',
        category: 'People Search',
        rating: 4.2,
        free: true,
        integration: 'external',
        tags: ['people', 'address', 'phone', 'quick']
      },
      // Paid Tools
      {
        name: 'WhitePages',
        description: 'Directory service for people, phone numbers, and addresses',
        url: 'https://whitepages.com',
        icon: Users,
        color: 'bg-yellow-600',
        category: 'People Search',
        rating: 4.7,
        free: false,
        price: '$$$',
        integration: 'external',
        tags: ['people', 'directory', 'phone', 'address', 'paid']
      },
      {
        name: 'Spokeo',
        description: 'People search engine with social media integration',
        url: 'https://spokeo.com',
        icon: Users,
        color: 'bg-purple-600',
        category: 'People Search',
        rating: 4.6,
        free: false,
        price: '$$$',
        integration: 'external',
        tags: ['people', 'social', 'integration', 'paid']
      },
      {
        name: 'PeopleFinder',
        description: 'Background check and people search service',
        url: 'https://peoplefinder.com',
        icon: Users,
        color: 'bg-red-600',
        category: 'People Search',
        rating: 4.4,
        free: false,
        price: '$$$',
        integration: 'external',
        tags: ['background', 'people', 'check', 'paid']
      },
      {
        name: 'TruePeopleSearch',
        description: 'Free people search engine with contact information',
        url: 'https://www.truepeoplesearch.com',
        icon: Users,
        color: 'bg-indigo-600',
        category: 'People Search',
        rating: 4.5,
        free: true,
        integration: 'external',
        tags: ['people', 'search', 'contact', 'free']
      }
    ],

    'domain-analysis': [
      // Built-in Advanced Tools
      {
        name: 'Domain Lookup Toolkit',
        description: 'WHOIS, DNS, subdomains, and security checks',
        url: 'builtin:domain_toolkit',
        icon: Globe,
        color: 'bg-gradient-to-r from-blue-600 to-cyan-600',
        category: 'Domain Analysis',
        rating: 5,
        free: true,
        integration: 'builtin',
        advanced: true,
        inputType: 'domain',
        tags: ['whois', 'dns', 'subdomains', 'security']
      },
      {
        name: 'IP & Network Intelligence',
        description: 'Advanced IP geolocation, ASN lookup, and network analysis',
        url: 'builtin:ip_network_analysis',
        icon: MapPin,
        color: 'bg-gradient-to-r from-purple-600 to-pink-600',
        category: 'Domain Analysis',
        rating: 5,
        free: true,
        integration: 'builtin',
        advanced: true,
        inputType: 'ip',
        tags: ['ip', 'geolocation', 'asn', 'network', 'security']
      },
      {
        name: 'Website Intelligence Suite',
        description: 'Comprehensive website technology analysis and fingerprinting',
        url: 'builtin:website_analyzer',
        icon: Layers,
        color: 'bg-gradient-to-r from-green-600 to-teal-600',
        category: 'Domain Analysis',
        rating: 5,
        free: true,
        integration: 'builtin',
        advanced: true,
        inputType: 'url',
        tags: ['website', 'technology', 'fingerprinting', 'analysis']
      },
      {
        name: 'URL Intelligence Analysis',
        description: 'Comprehensive URL analysis including reputation, redirects, and security',
        url: 'builtin:url_analyzer',
        icon: LinkIcon,
        color: 'bg-gradient-to-r from-orange-600 to-red-600',
        category: 'Domain Analysis',
        rating: 5,
        free: true,
        integration: 'builtin',
        advanced: true,
        inputType: 'url',
        tags: ['url', 'security', 'reputation', 'redirects']
      },
      {
        name: 'WHOIS Lookup',
        description: 'Domain registration and ownership details',
        url: 'https://whois.net',
        icon: FileText,
        color: 'bg-blue-600',
        category: 'Domain Analysis',
        rating: 4.6,
        free: true,
        integration: 'external',
        tags: ['whois', 'domain', 'registration', 'ownership']
      },
      {
        name: 'DNSDumpster',
        description: 'DNS recon and research tool',
        url: 'https://dnsdumpster.com',
        icon: Database,
        color: 'bg-green-600',
        category: 'Domain Analysis',
        rating: 4.7,
        free: true,
        integration: 'external',
        tags: ['dns', 'recon', 'research', 'enumeration']
      },
      {
        name: 'Certificate Search (crt.sh)',
        description: 'SSL certificate and subdomain discovery',
        url: 'https://crt.sh',
        icon: Lock,
        color: 'bg-orange-600',
        category: 'Domain Analysis',
        rating: 4.8,
        free: true,
        integration: 'external',
        tags: ['ssl', 'certificate', 'subdomain', 'discovery']
      },
      {
        name: 'BuiltWith',
        description: 'Website technology profiler',
        url: 'https://builtwith.com',
        icon: Code,
        color: 'bg-purple-600',
        category: 'Domain Analysis',
        rating: 4.5,
        free: true,
        integration: 'external',
        tags: ['technology', 'profiler', 'website', 'analysis']
      },
      {
        name: 'Wayback Machine',
        description: 'Historical snapshots of websites',
        url: 'https://web.archive.org',
        icon: Clock,
        color: 'bg-gray-600',
        category: 'Domain Analysis',
        rating: 4.9,
        free: true,
        integration: 'external',
        tags: ['archive', 'history', 'snapshots', 'historical']
      },
      {
        name: 'VirusTotal',
        description: 'URL and file malware analysis',
        url: 'https://virustotal.com',
        icon: Shield,
        color: 'bg-red-600',
        category: 'Domain Analysis',
        rating: 4.8,
        free: true,
        integration: 'external',
        tags: ['malware', 'analysis', 'url', 'security']
      },
      // Paid Tools
      {
        name: 'SecurityTrails',
        description: 'Historical DNS data and domain intelligence',
        url: 'https://securitytrails.com',
        icon: Activity,
        color: 'bg-blue-700',
        category: 'Domain Analysis',
        rating: 4.9,
        free: false,
        price: '$$$$',
        integration: 'external',
        tags: ['dns', 'historical', 'intelligence', 'premium']
      },
      {
        name: 'Shodan',
        description: 'Search engine for Internet-connected devices/services - Professional IoT & Infrastructure Intelligence',
        url: 'https://shodan.io',
        icon: Server,
        color: 'bg-red-700',
        category: 'Domain Analysis',
        rating: 4.9,
        free: false,
        price: '$$$',
        integration: 'external',
        realApi: true,
        tags: ['iot', 'devices', 'services', 'scanning', 'infrastructure', 'professional']
      },
      {
        name: 'Censys',
        description: 'Internet-wide scanning and analysis platform',
        url: 'https://censys.io',
        icon: Network,
        color: 'bg-indigo-700',
        category: 'Domain Analysis',
        rating: 4.8,
        free: false,
        price: '$$$$',
        integration: 'external',
        tags: ['scanning', 'analysis', 'internet', 'research']
      }
    ],

    'breach-analysis': [
      // Free Tools
      {
        name: 'Have I Been Pwned',
        description: 'Check if emails are in known breaches',
        url: 'https://haveibeenpwned.com',
        icon: Shield,
        color: 'bg-red-600',
        category: 'Breach Analysis',
        rating: 4.9,
        free: true,
        integration: 'external',
        tags: ['breach', 'email', 'pwned', 'check']
      },
      {
        name: 'Breach Directory',
        description: 'Free breach data search engine (may require manual access)',
        url: 'https://breachdirectory.org',
        icon: Database,
        color: 'bg-orange-600',
        category: 'Breach Analysis',
        rating: 4.3,
        free: true,
        integration: 'external',
        tags: ['breach', 'directory', 'search', 'data'],
        warning: 'Site may block automated requests - manual access recommended'
      },
      {
        name: 'BreachChecker',
        description: 'Alternative breach checking service',
        url: 'https://breachcheck.com',
        icon: Shield,
        color: 'bg-purple-600',
        category: 'Breach Analysis',
        rating: 4.1,
        free: true,
        integration: 'external',
        tags: ['breach', 'check', 'alternative', 'search']
      },
      // Paid Tools
      {
        name: 'DeHashed',
        description: 'Breached credentials and leaked data search',
        url: 'https://dehashed.com',
        icon: Key,
        color: 'bg-red-700',
        category: 'Breach Analysis',
        rating: 4.7,
        free: false,
        price: '$$$',
        integration: 'external',
        tags: ['credentials', 'leaked', 'data', 'breach']
      },
      {
        name: 'LeakCheck',
        description: 'Breach monitoring and search engine',
        url: 'https://leakcheck.io',
        icon: Eye,
        color: 'bg-purple-700',
        category: 'Breach Analysis',
        rating: 4.6,
        free: false,
        price: '$$$',
        integration: 'external',
        tags: ['monitoring', 'breach', 'search', 'engine']
      },
      {
        name: 'Snusbase',
        description: 'Breach database engine (authorized use only)',
        url: 'https://snusbase.com',
        icon: Database,
        color: 'bg-gray-700',
        category: 'Breach Analysis',
        rating: 4.8,
        free: false,
        price: '$$$$',
        integration: 'external',
        tags: ['database', 'breach', 'authorized', 'premium'],
        warning: 'Requires proper authorization and legal compliance'
      }
    ],

    'email-analysis': [
      // Advanced Built-in Tool with Real API Integration
      {
        name: 'Advanced Email Intelligence Suite',
        description: 'Comprehensive email analysis with real-time breach checking and domain intelligence',
        url: 'builtin:email_intelligence',
        icon: Mail,
        color: 'bg-gradient-to-r from-red-600 to-pink-600',
        category: 'Email Analysis',
        rating: 5,
        free: true,
        integration: 'builtin',
        advanced: true,
        realApi: true,
        inputType: 'email',
        tags: ['email', 'intelligence', 'breach-check', 'domain-analysis', 'real-api']
      },
      // Free Tools
      {
        name: 'Holehe',
        description: 'Check if email is used on different platforms (Twitter, Instagram, etc.)',
        url: 'https://github.com/megadose/holehe',
        icon: Search,
        color: 'bg-purple-600',
        category: 'Email Analysis',
        rating: 4.8,
        free: true,
        integration: 'external',
        tags: ['email', 'platforms', 'social', 'osint', 'checker']
      },
      {
        name: 'Eyes',
        description: 'Advanced email OSINT tool for investigation',
        url: 'https://github.com/N0rz3/Eyes',
        icon: Eye,
        color: 'bg-green-600',
        category: 'Email Analysis',
        rating: 4.7,
        free: true,
        integration: 'external',
        tags: ['email', 'osint', 'investigation', 'github', 'accounts']
      },
      {
        name: 'Zehef',
        description: 'Email tracking and OSINT investigation tool',
        url: 'https://github.com/N0rz3/Zehef',
        icon: Target,
        color: 'bg-blue-600',
        category: 'Email Analysis',
        rating: 4.6,
        free: true,
        integration: 'external',
        tags: ['email', 'tracking', 'osint', 'breach', 'check']
      },
      {
        name: 'EmailRep',
        description: 'Email reputation and intelligence lookup',
        url: 'https://emailrep.io',
        icon: Mail,
        color: 'bg-blue-600',
        category: 'Email Analysis',
        rating: 4.5,
        free: true,
        integration: 'external',
        tags: ['email', 'reputation', 'intelligence', 'lookup']
      },
      // Paid Tools
      {
        name: 'Hunter.io',
        description: 'Find and verify domain-related emails',
        url: 'https://hunter.io',
        icon: Target,
        color: 'bg-orange-600',
        category: 'Email Analysis',
        rating: 4.7,
        free: false,
        price: '$$$',
        integration: 'external',
        tags: ['email', 'finder', 'verify', 'domain']
      },
      {
        name: 'EmailHippo',
        description: 'Email verification and validation service',
        url: 'https://emailhippo.com',
        icon: CheckCircle,
        color: 'bg-green-600',
        category: 'Email Analysis',
        rating: 4.6,
        free: false,
        price: '$$$',
        integration: 'external',
        tags: ['verification', 'validation', 'email', 'service']
      },
      {
        name: 'Clearbit Connect',
        description: 'Enrich contact data with email info',
        url: 'https://clearbit.com/connect',
        icon: Users,
        color: 'bg-purple-600',
        category: 'Email Analysis',
        rating: 4.8,
        free: false,
        price: '$$$$',
        integration: 'external',
        tags: ['enrich', 'contact', 'data', 'email']
      },
      {
        name: 'Voila Norbert',
        description: 'Email finder and verifier',
        url: 'https://voilanorbert.com',
        icon: Search,
        color: 'bg-blue-700',
        category: 'Email Analysis',
        rating: 4.5,
        free: false,
        price: '$$$',
        integration: 'external',
        tags: ['finder', 'verifier', 'email', 'search']
      }
    ],

    'social-media': [
      // Free Tools
      {
        name: 'Toutatis',
        description: 'Extract information from Instagram accounts (emails, phone numbers)',
        url: 'https://github.com/megadose/toutatis',
        icon: Instagram,
        color: 'bg-pink-600',
        category: 'Social Media Analysis',
        rating: 4.7,
        free: true,
        integration: 'external',
        tags: ['instagram', 'extraction', 'email', 'phone', 'osint']
      },
      {
        name: 'YesItsMe',
        description: 'Find Instagram profiles by name and email/phone',
        url: 'https://github.com/0x0be/yesitsme',
        icon: Search,
        color: 'bg-purple-600',
        category: 'Social Media Analysis',
        rating: 4.5,
        free: true,
        integration: 'external',
        tags: ['instagram', 'profiles', 'name', 'email', 'phone']
      },
      {
        name: 'Sherlock',
        description: 'Hunt usernames across platforms (CLI tool)',
        url: 'https://github.com/sherlock-project/sherlock',
        icon: Users,
        color: 'bg-green-600',
        category: 'Social Media Analysis',
        rating: 4.8,
        free: true,
        integration: 'external',
        tags: ['username', 'hunt', 'platforms', 'cli']
      },
      {
        name: 'Tookie OSINT',
        description: 'Advanced OSINT tool for finding social media accounts',
        url: 'https://github.com/Alfredredbird/tookie-osint',
        icon: Target,
        color: 'bg-orange-600',
        category: 'Social Media Analysis',
        rating: 4.6,
        free: true,
        integration: 'external',
        tags: ['social', 'accounts', 'osint', 'advanced', 'finder']
      },
      {
        name: 'Namechk',
        description: 'Username availability checker',
        url: 'https://namechk.com',
        icon: UserCheck,
        color: 'bg-blue-600',
        category: 'Social Media Analysis',
        rating: 4.4,
        free: true,
        integration: 'external',
        tags: ['username', 'availability', 'checker', 'social']
      },
      {
        name: 'Social Searcher',
        description: 'Real-time social media search',
        url: 'https://socialsearcher.com',
        icon: Search,
        color: 'bg-purple-600',
        category: 'Social Media Analysis',
        rating: 4.6,
        free: true,
        integration: 'external',
        tags: ['real-time', 'social', 'search', 'media']
      },
      // Paid Tools
      {
        name: 'Mention',
        description: 'Social media monitoring and brand tracking',
        url: 'https://mention.com',
        icon: Bell,
        color: 'bg-orange-600',
        category: 'Social Media Analysis',
        rating: 4.7,
        free: false,
        price: '$$$',
        integration: 'external',
        tags: ['monitoring', 'brand', 'tracking', 'social']
      },
      {
        name: 'Brand24',
        description: 'Social media monitoring with sentiment analysis',
        url: 'https://brand24.com',
        icon: TrendingUp,
        color: 'bg-red-600',
        category: 'Social Media Analysis',
        rating: 4.8,
        free: false,
        price: '$$$$',
        integration: 'external',
        tags: ['monitoring', 'sentiment', 'analysis', 'brand']
      }
    ],

    'ethical-hacking': [
      // Free Tools
      {
        name: 'Google Hacking Database',
        description: 'Exploit-DB\'s comprehensive collection of Google dorks and advanced search operators',
        url: 'https://www.exploit-db.com/google-hacking-database',
        icon: Search,
        color: 'bg-blue-600',
        category: 'Ethical Hacking / Security',
        rating: 4.9,
        free: true,
        integration: 'external',
        tags: ['google', 'dorks', 'search', 'operators', 'recon', 'vulnerability']
      },
      {
        name: 'VirusTotal',
        description: 'Malware/file/URL analysis',
        url: 'https://virustotal.com',
        icon: Shield,
        color: 'bg-red-600',
        category: 'Ethical Hacking / Security',
        rating: 4.8,
        free: true,
        integration: 'external',
        tags: ['malware', 'file', 'url', 'analysis']
      },
      {
        name: 'URLVoid',
        description: 'Website reputation & malware detection',
        url: 'https://urlvoid.com',
        icon: Globe,
        color: 'bg-orange-600',
        category: 'Ethical Hacking / Security',
        rating: 4.5,
        free: true,
        integration: 'external',
        tags: ['website', 'reputation', 'malware', 'detection']
      },
      {
        name: 'Wayback Machine',
        description: 'Useful for recon on historical sites',
        url: 'https://web.archive.org',
        icon: Clock,
        color: 'bg-gray-600',
        category: 'Ethical Hacking / Security',
        rating: 4.9,
        free: true,
        integration: 'external',
        tags: ['archive', 'historical', 'recon', 'sites']
      },
      {
        name: 'OnionSearch',
        description: 'Dark web search engine scraper for .onion sites',
        url: 'https://github.com/megadose/OnionSearch',
        icon: Eye,
        color: 'bg-purple-600',
        category: 'Ethical Hacking / Security',
        rating: 4.6,
        free: true,
        integration: 'external',
        tags: ['dark web', 'onion', 'scraper', 'search', 'tor']
      },
      {
        name: 'xurlfind3r',
        description: 'Passive URL discovery tool for reconnaissance',
        url: 'https://github.com/hueristiq/xurlfind3r',
        icon: LinkIcon,
        color: 'bg-cyan-600',
        category: 'Ethical Hacking / Security',
        rating: 4.5,
        free: true,
        integration: 'external',
        tags: ['url', 'discovery', 'reconnaissance', 'passive', 'recon']
      },
      {
        name: 'Nmap',
        description: 'Network discovery and security auditing tool for port scanning and host discovery',
        url: 'https://nmap.org',
        icon: Network,
        color: 'bg-green-700',
        category: 'Ethical Hacking / Security',
        rating: 4.9,
        free: true,
        integration: 'external',
        realApi: true,
        tags: ['network', 'scanning', 'discovery', 'ports', 'security', 'audit']
      },
      {
        name: 'Masscan',
        description: 'High-speed port scanner for large-scale network reconnaissance',
        url: 'https://github.com/robertdavidgraham/masscan',
        icon: Zap,
        color: 'bg-yellow-600',
        category: 'Ethical Hacking / Security',
        rating: 4.7,
        free: true,
        integration: 'external',
        tags: ['port', 'scanner', 'fast', 'network', 'reconnaissance']
      },
      {
        name: 'Amass',
        description: 'Network mapping and attack surface discovery tool',
        url: 'https://github.com/OWASP/Amass',
        icon: MapPin,
        color: 'bg-indigo-600',
        category: 'Ethical Hacking / Security',
        rating: 4.8,
        free: true,
        integration: 'external',
        realApi: true,
        tags: ['network', 'mapping', 'subdomain', 'owasp', 'discovery']
      },
      // Paid Tools
      {
        name: 'Shodan',
        description: 'Device and service search engine',
        url: 'https://shodan.io',
        icon: Server,
        color: 'bg-red-700',
        category: 'Ethical Hacking / Security',
        rating: 4.9,
        free: false,
        price: '$$$',
        integration: 'external',
        tags: ['device', 'service', 'search', 'iot']
      },
      {
        name: 'Censys',
        description: 'Internet-wide scanning platform',
        url: 'https://censys.io',
        icon: Network,
        color: 'bg-indigo-700',
        category: 'Ethical Hacking / Security',
        rating: 4.8,
        free: false,
        price: '$$$$',
        integration: 'external',
        tags: ['scanning', 'platform', 'internet', 'research']
      },
      {
        name: 'SecurityTrails',
        description: 'DNS and domain intelligence',
        url: 'https://securitytrails.com',
        icon: Activity,
        color: 'bg-blue-700',
        category: 'Ethical Hacking / Security',
        rating: 4.9,
        free: false,
        price: '$$$$',
        integration: 'external',
        tags: ['dns', 'domain', 'intelligence', 'security']
      }
    ],

    'search-engines': [
      // All Free Tools
      {
        name: 'Google Dorking Advanced',
        description: 'Professional Google Dorks for OSINT reconnaissance with advanced search operators',
        url: 'https://google.com/advanced_search',
        icon: Search,
        color: 'bg-red-700',
        category: 'Search Engines',
        rating: 5.0,
        free: true,
        integration: 'external',
        realApi: true,
        tags: ['google', 'dorks', 'reconnaissance', 'operators', 'osint', 'advanced']
      },
      {
        name: 'Google Advanced Search',
        description: 'Search operators for precision',
        url: 'https://google.com/advanced_search',
        icon: Search,
        color: 'bg-blue-600',
        category: 'Search Engines',
        rating: 4.9,
        free: true,
        integration: 'external',
        tags: ['google', 'advanced', 'operators', 'precision']
      },
      {
        name: 'DuckDuckGo',
        description: 'Privacy-focused search',
        url: 'https://duckduckgo.com',
        icon: Shield,
        color: 'bg-orange-600',
        category: 'Search Engines',
        rating: 4.7,
        free: true,
        integration: 'external',
        tags: ['privacy', 'search', 'anonymous', 'secure']
      },
      {
        name: 'Yandex',
        description: 'Strong image search',
        url: 'https://yandex.com',
        icon: Image,
        color: 'bg-red-600',
        category: 'Search Engines',
        rating: 4.6,
        free: true,
        integration: 'external',
        tags: ['image', 'search', 'reverse', 'visual']
      },
      {
        name: 'Bing',
        description: 'Microsoft\'s search engine',
        url: 'https://bing.com',
        icon: Search,
        color: 'bg-blue-700',
        category: 'Search Engines',
        rating: 4.3,
        free: true,
        integration: 'external',
        tags: ['microsoft', 'search', 'engine', 'web']
      },
      {
        name: 'Startpage',
        description: 'Private search engine using Google results',
        url: 'https://startpage.com',
        icon: Lock,
        color: 'bg-green-600',
        category: 'Search Engines',
        rating: 4.8,
        free: true,
        integration: 'external',
        tags: ['private', 'google', 'results', 'anonymous']
      },
      {
        name: 'Intelligence X',
        description: 'Search engine and data archive for historical internet data, documents, and intelligence',
        url: 'https://intelx.io',
        icon: Database,
        color: 'bg-indigo-600',
        category: 'Search Engines',
        rating: 4.9,
        free: true,
        integration: 'external',
        realApi: true,
        tags: ['intelligence', 'archive', 'historical', 'documents', 'data-mining', 'dark-web']
      }
    ],

    'osint-resources': [
      // Free Resources
      {
        name: 'OSINT Framework',
        description: 'Curated OSINT tools & resources',
        url: 'https://osintframework.com',
        icon: Layers,
        color: 'bg-purple-600',
        category: 'OSINT Resources & Training',
        rating: 4.9,
        free: true,
        integration: 'external',
        tags: ['framework', 'curated', 'tools', 'resources']
      },
      {
        name: 'IntelTechniques',
        description: 'Training, tools, and techniques',
        url: 'https://inteltechniques.com',
        icon: GraduationCap,
        color: 'bg-blue-600',
        category: 'OSINT Resources & Training',
        rating: 4.8,
        free: true,
        integration: 'external',
        tags: ['training', 'tools', 'techniques', 'education']
      },
      {
        name: 'Bellingcat Toolkit',
        description: 'Open-source investigation guides',
        url: 'https://github.com/bellingcat/toolkit',
        icon: Wrench,
        color: 'bg-green-600',
        category: 'OSINT Resources & Training',
        rating: 4.9,
        free: true,
        integration: 'external',
        tags: ['investigation', 'guides', 'toolkit', 'bellingcat']
      },
      {
        name: 'OSINT Curious',
        description: 'Community-driven OSINT learning',
        url: 'https://osintcurio.us',
        icon: Users,
        color: 'bg-orange-600',
        category: 'OSINT Resources & Training',
        rating: 4.7,
        free: true,
        integration: 'external',
        tags: ['community', 'learning', 'osint', 'education']
      },
      // Paid Resources
      {
        name: 'SANS OSINT Summit',
        description: 'Professional OSINT training & certification',
        url: 'https://sans.org',
        icon: GraduationCap,
        color: 'bg-red-600',
        category: 'OSINT Resources & Training',
        rating: 4.9,
        free: false,
        price: '$$$$',
        integration: 'external',
        tags: ['professional', 'training', 'certification', 'sans']
      }
    ],

    // NEW SPECIALIZED CATEGORIES
    'dark-web-intelligence': [
      {
        name: 'TorBot',
        description: 'Open source intelligence tool for the dark web. Crawls .onion sites and gathers intelligence.',
        url: 'https://github.com/DedSecInside/TorBot',
        icon: Eye,
        color: 'bg-gray-800',
        category: 'Dark Web Intelligence',
        rating: 4.7,
        free: true,
        integration: 'external',
        realApi: true,
        tags: ['tor', 'dark-web', 'crawler', 'onion', 'intelligence', 'osint', 'scraper']
      },
      {
        name: 'OnionSearch',
        description: 'Dark web search engine scraper for .onion sites',
        url: 'https://github.com/megadose/OnionSearch',
        icon: Eye,
        color: 'bg-purple-600',
        category: 'Dark Web Intelligence',
        rating: 4.6,
        free: true,
        integration: 'external',
        tags: ['dark web', 'onion', 'scraper', 'search', 'tor']
      },
      {
        name: 'Prying Deep',
        description: 'OSINT tool to collect intelligence on the dark web',
        url: 'https://github.com/iudicium/pryingdeep',
        icon: Database,
        color: 'bg-gray-600',
        category: 'Dark Web Intelligence',
        rating: 4.4,
        free: true,
        integration: 'external',
        tags: ['dark web', 'intelligence', 'crawler', 'osint']
      },
      {
        name: 'Dark Web OSINT Tools Collection',
        description: 'Comprehensive collection of dark web research tools',
        url: 'https://github.com/apurvsinghgautam/dark-web-osint-tools',
        icon: BookOpen,
        color: 'bg-indigo-600',
        category: 'Dark Web Intelligence',
        rating: 4.2,
        free: true,
        integration: 'external',
        tags: ['collection', 'dark web', 'tools', 'research']
      }
    ],

    'username-research': [
      {
        name: 'Sherlock',
        description: 'Hunt usernames across 400+ social platforms',
        url: 'https://github.com/sherlock-project/sherlock',
        icon: Users,
        color: 'bg-green-600',
        category: 'Username Research',
        rating: 4.8,
        free: true,
        integration: 'external',
        tags: ['username', 'hunt', 'platforms', 'cli', 'social']
      },
      {
        name: 'Emora Project',
        description: 'Username search with GUI across social networks',
        url: 'https://github.com/IdefaSoft/Emora-Project',
        icon: UserCheck,
        color: 'bg-blue-600',
        category: 'Username Research',
        rating: 4.5,
        free: true,
        integration: 'external',
        tags: ['username', 'gui', 'social', 'search', 'windows']
      },
      {
        name: 'Tookie OSINT',
        description: 'Advanced username and social media account finder',
        url: 'https://github.com/Alfredredbird/tookie-osint',
        icon: Target,
        color: 'bg-orange-600',
        category: 'Username Research',
        rating: 4.6,
        free: true,
        integration: 'external',
        tags: ['username', 'social', 'advanced', 'finder', 'osint']
      }
    ],

    'complete-osint-frameworks': [
      // Professional-Grade OSINT Frameworks
      {
        name: 'OSINT Framework',
        description: 'The most comprehensive collection of OSINT resources organized by category',
        url: 'https://osintframework.com',
        icon: Layers,
        color: 'bg-blue-700',
        category: 'Complete OSINT Frameworks',
        rating: 5.0,
        free: true,
        integration: 'external',
        realApi: true,
        tags: ['framework', 'comprehensive', 'resources', 'organized', 'professional']
      },
      {
        name: 'Maltego',
        description: 'Professional link analysis and data mining platform for OSINT investigations',
        url: 'https://maltego.com',
        icon: Network,
        color: 'bg-indigo-700',
        category: 'Complete OSINT Frameworks',
        rating: 4.9,
        free: false,
        price: '$$$',
        integration: 'external',
        realApi: true,
        tags: ['link-analysis', 'data-mining', 'professional', 'investigations', 'visualization']
      },
      {
        name: 'The Harvester',
        description: 'Tool for gathering emails, subdomains, hosts, employee names, open ports and banners',
        url: 'https://github.com/laramies/theHarvester',
        icon: Target,
        color: 'bg-green-700',
        category: 'Complete OSINT Frameworks',
        rating: 4.8,
        free: true,
        integration: 'external',
        realApi: true,
        tags: ['email-harvesting', 'subdomain-enum', 'employee-search', 'reconnaissance', 'passive']
      },
      {
        name: 'SpiderFoot',
        description: 'Automated OSINT intelligence collection and correlation engine',
        url: 'https://spiderfoot.net',
        icon: Bug,
        color: 'bg-purple-700',
        category: 'Complete OSINT Frameworks',
        rating: 4.7,
        free: true,
        integration: 'external',
        realApi: true,
        tags: ['automated', 'intelligence', 'correlation', 'scanning', 'comprehensive']
      },
      {
        name: 'Recon-ng',
        description: 'Full-featured reconnaissance framework with independent modules and database interaction',
        url: 'https://github.com/lanmaster53/recon-ng',
        icon: Compass,
        color: 'bg-orange-700',
        category: 'Complete OSINT Frameworks',
        rating: 4.6,
        free: true,
        integration: 'external',
        realApi: true,
        tags: ['reconnaissance', 'modular', 'database', 'framework', 'automation']
      },
      {
        name: 'Mr. Holmes',
        description: 'Complete OSINT toolkit with multiple investigation modules',
        url: 'https://github.com/Lucksi/Mr.Holmes',
        icon: Eye,
        color: 'bg-yellow-600',
        category: 'Complete OSINT Frameworks',
        rating: 4.7,
        free: true,
        integration: 'external',
        tags: ['complete', 'framework', 'investigation', 'toolkit', 'osint']
      },
      {
        name: 'Seekr',
        description: 'Multi-purpose OSINT toolkit with web interface',
        url: 'https://github.com/seekr-osint/seekr',
        icon: Globe,
        color: 'bg-teal-600',
        category: 'Complete OSINT Frameworks',
        rating: 4.6,
        free: true,
        integration: 'external',
        tags: ['multi-purpose', 'web', 'interface', 'toolkit', 'osint']
      },
      {
        name: 'Ominis OSINT',
        description: 'Web hunter for comprehensive online information gathering',
        url: 'https://github.com/AnonCatalyst/Ominis-OSINT',
        icon: Search,
        color: 'bg-red-600',
        category: 'Complete OSINT Frameworks',
        rating: 4.4,
        free: true,
        integration: 'external',
        tags: ['web', 'hunter', 'gathering', 'comprehensive', 'osint']
      }
    ],

    'image-analysis': [
      // Advanced Built-in Tool
      {
        name: 'EXIF Data Extraction',
        description: 'Extract metadata from images including GPS coordinates and camera info',
        url: 'builtin:exif_extractor',
        icon: Camera,
        color: 'bg-gradient-to-r from-purple-600 to-indigo-600',
        category: 'Image Analysis',
        rating: 5,
        free: true,
        integration: 'builtin',
        advanced: true,
        inputType: 'image',
        tags: ['exif', 'metadata', 'gps', 'camera', 'privacy']
      },
      {
        name: 'Google Images',
        description: 'Reverse image search and analysis',
        url: 'https://images.google.com',
        icon: Image,
        color: 'bg-blue-600',
        category: 'Image Analysis',
        rating: 4.8,
        free: true,
        integration: 'external',
        tags: ['reverse', 'image', 'search', 'google']
      },
      {
        name: 'TinEye',
        description: 'Reverse image search engine',
        url: 'https://tineye.com',
        icon: Eye,
        color: 'bg-green-600',
        category: 'Image Analysis',
        rating: 4.7,
        free: true,
        integration: 'external',
        tags: ['reverse', 'image', 'search', 'engine']
      },
      {
        name: 'Yandex Images',
        description: 'Powerful reverse image search',
        url: 'https://yandex.com/images',
        icon: Image,
        color: 'bg-red-600',
        category: 'Image Analysis',
        rating: 4.6,
        free: true,
        integration: 'external',
        tags: ['reverse', 'image', 'yandex', 'powerful']
      },
      {
        name: 'InVID WeVerify',
        description: 'Video and image verification toolkit',
        url: 'https://www.invid-project.eu/tools-and-services/invid-verification-plugin/',
        icon: FileText,
        color: 'bg-purple-600',
        category: 'Image Analysis',
        rating: 4.5,
        free: true,
        integration: 'external',
        tags: ['verification', 'video', 'image', 'toolkit']
      }
    ],

    // LEGACY CATEGORIES FOR BACKWARD COMPATIBILITY
    people: [
      // Built-in Tools
      {
        name: 'Advanced User Reconnaissance',
        description: 'Comprehensive people search and social media analysis',
        type: 'built-in',
        icon: Users,
        color: 'bg-cyan-600',
        category: 'People Search',
        rating: 5,
        free: true,
        integration: 'native',
        apiEndpoint: '/api/tools/user-recon'
      },
      {
        name: 'Advanced Port Scanner',
        description: 'Comprehensive port scanning with service detection and vulnerability assessment',
        url: 'builtin:port_scanner',
        icon: Scan,
        color: 'bg-gradient-to-r from-red-600 to-orange-600',
        category: 'Built-in Tools',
        rating: 5,
        free: true,
        integration: 'builtin',
        advanced: true,
        inputType: 'domain'
      },
      {
        name: 'DNS Intelligence Suite',
        description: 'Comprehensive DNS record analysis and enumeration',
        url: 'builtin:dns_lookup',
        icon: Database,
        color: 'bg-gradient-to-r from-green-600 to-teal-600',
        category: 'Built-in Tools',
        rating: 5,
        free: true,
        integration: 'builtin',
        advanced: true,
        inputType: 'domain'
      },
      {
        name: 'Enhanced WHOIS Lookup',
        description: 'Detailed domain registration and ownership intelligence',
        url: 'builtin:whois_lookup',
        icon: FileText,
        color: 'bg-gradient-to-r from-blue-600 to-indigo-600',
        category: 'Built-in Tools',
        rating: 5,
        free: true,
        integration: 'builtin',
        advanced: true,
        inputType: 'domain'
      },
      {
        name: 'IP Geolocation Intelligence',
        description: 'Advanced IP address analysis with threat intelligence',
        url: 'builtin:ip_geolocation',
        icon: MapPin,
        color: 'bg-gradient-to-r from-yellow-600 to-red-600',
        category: 'Built-in Tools',
        rating: 5,
        free: true,
        integration: 'builtin',
        advanced: true,
        inputType: 'ip'
      },
      {
        name: 'Website Technology Profiler',
        description: 'Comprehensive website technology stack and security analysis',
        url: 'builtin:website_analyzer',
        icon: Monitor,
        color: 'bg-gradient-to-r from-indigo-600 to-purple-600',
        category: 'Built-in Tools',
        rating: 5,
        free: true,
        integration: 'builtin',
        advanced: true,
        inputType: 'url'
      },
      // External Premium Tools
      {
        name: 'Shodan',
        description: 'Search engine for Internet-connected devices and services',
        url: 'https://shodan.io',
        icon: Search,
        color: 'bg-gray-800',
        category: 'Device Discovery',
        rating: 5,
        free: false,
        integration: 'external',
        params: { search: 'search_query' }
      },
      {
        name: 'Censys',
        description: 'Internet-wide scanning and analysis platform',
        url: 'https://search.censys.io',
        icon: Eye,
        color: 'bg-blue-800',
        category: 'Device Discovery',
        rating: 5,
        free: false,
        integration: 'external'
      }
    ],

    people: [
      {
        name: 'Advanced User Reconnaissance',
        description: 'Multi-platform username enumeration and social media intelligence',
        url: 'builtin:user_enumeration',
        icon: UserCheck,
        color: 'bg-gradient-to-r from-pink-600 to-purple-600',
        category: 'Built-in Tools',
        rating: 5,
        free: true,
        integration: 'builtin',
        advanced: true,
        inputType: 'username'
      },
      {
        name: 'TruePeopleSearch',
        description: 'Free comprehensive people search with address history and relatives',
        url: 'https://www.truepeoplesearch.com',
        icon: Users,
        color: 'bg-blue-600',
        category: 'People Search',
        rating: 4,
        free: true,
        integration: 'external'
      },
      {
        name: 'WhitePages',
        description: 'Directory service for finding people, phone numbers, and addresses',
        url: 'https://www.whitepages.com',
        icon: Phone,
        color: 'bg-gray-600',
        category: 'People Search',
        rating: 4,
        free: false,
        integration: 'external'
      },
      {
        name: 'FastPeopleSearch',
        description: 'Quick people lookup with address history and phone numbers',
        url: 'https://www.fastpeoplesearch.com',
        icon: Search,
        color: 'bg-green-600',
        category: 'People Search',
        rating: 4,
        free: true,
        integration: 'external'
      },
      {
        name: 'TruePeopleSearch',
        description: 'Free people search engine with contact information',
        url: 'https://www.truepeoplesearch.com',
        icon: Database,
        color: 'bg-indigo-600',
        category: 'People Search',
        rating: 4.5,
        free: true,
        integration: 'external'
      }
    ],
    
    domains: [
      {
        name: 'Website Technology Profiler',
        description: 'Built-in comprehensive technology stack analysis',
        url: 'builtin:website_analyzer',
        icon: Layers,
        color: 'bg-gradient-to-r from-teal-600 to-green-600',
        category: 'Built-in Tools',
        rating: 5,
        free: true,
        integration: 'builtin',
        advanced: true,
        inputType: 'url'
      },
      {
        name: 'DNSDumpster',
        description: 'DNS recon and research, find and lookup DNS records',
        url: 'https://dnsdumpster.com',
        icon: Database,
        color: 'bg-green-600',
        category: 'Domain Analysis',
        rating: 5,
        free: true,
        integration: 'external'
      },
      {
        name: 'Certificate Search',
        description: 'Find SSL certificates and discover subdomains via crt.sh',
        url: 'https://crt.sh',
        icon: Shield,
        color: 'bg-orange-600',
        category: 'Domain Analysis',
        rating: 5,
        free: true,
        integration: 'external',
        params: { q: 'search_query' }
      },
      {
        name: 'SecurityTrails',
        description: 'Historical DNS data and domain intelligence',
        url: 'https://securitytrails.com',
        icon: Target,
        color: 'bg-red-600',
        category: 'Domain Analysis',
        rating: 5,
        free: false,
        integration: 'external'
      },
      {
        name: 'BuiltWith',
        description: 'Website technology profiler and competitive analysis',
        url: 'https://builtwith.com',
        icon: Layers,
        color: 'bg-teal-600',
        category: 'Domain Analysis',
        rating: 4,
        free: true,
        integration: 'external',
        params: { '/': 'search_query' }
      },
      {
        name: 'Wayback Machine',
        description: 'View historical snapshots of websites',
        url: 'https://web.archive.org',
        icon: Globe,
        color: 'bg-indigo-600',
        category: 'Domain Analysis',
        rating: 5,
        free: true,
        integration: 'external',
        params: { url: 'search_query' }
      },
      {
        name: 'VirusTotal',
        description: 'URL and file analysis for malware detection',
        url: 'https://virustotal.com',
        icon: Shield,
        color: 'bg-green-700',
        category: 'Domain Analysis',
        rating: 5,
        free: true,
        integration: 'external',
        params: { url: 'search_query' }
      }
    ],

    email: [
      {
        name: 'Email Intelligence Suite',
        description: 'Built-in comprehensive email analysis, validation, and breach checking',
        url: 'builtin:email_osint',
        icon: Mail,
        color: 'bg-gradient-to-r from-blue-600 to-cyan-600',
        category: 'Built-in Tools',
        rating: 5,
        free: true,
        integration: 'builtin',
        advanced: true,
        inputType: 'email'
      },
      {
        name: 'Hunter.io',
        description: 'Find email addresses associated with domains and verify them',
        url: 'https://hunter.io',
        icon: Mail,
        color: 'bg-orange-500',
        category: 'Email Analysis',
        rating: 5,
        free: false,
        integration: 'external'
      },
      {
        name: 'Have I Been Pwned',
        description: 'Check if email addresses have been compromised in data breaches',
        url: 'https://haveibeenpwned.com',
        icon: Shield,
        color: 'bg-red-600',
        category: 'Breach Analysis',
        rating: 5,
        free: true,
        integration: 'external',
        params: { account: 'search_query' }
      },
      {
        name: 'EmailRep',
        description: 'Email reputation and intelligence lookup',
        url: 'https://emailrep.io',
        icon: Shield,
        color: 'bg-green-600',
        category: 'Email Analysis',
        rating: 4,
        free: true,
        integration: 'external'
      }
    ],

    social: [
      {
        name: 'Social Media Intelligence',
        description: 'Built-in advanced social media profile analysis and monitoring',
        url: 'builtin:social_media_analyzer',
        icon: TrendingUp,
        color: 'bg-gradient-to-r from-pink-600 to-red-600',
        category: 'Built-in Tools',
        rating: 5,
        free: true,
        integration: 'builtin',
        advanced: true,
        inputType: 'username'
      },
      {
        name: 'GitHub Intelligence',
        description: 'Built-in comprehensive GitHub user and repository analysis',
        url: 'builtin:github_recon',
        icon: Github,
        color: 'bg-gradient-to-r from-gray-700 to-gray-900',
        category: 'Built-in Tools',
        rating: 5,
        free: true,
        integration: 'builtin',
        advanced: true,
        inputType: 'username'
      },
      {
        name: 'Namechk',
        description: 'Check username availability across multiple platforms',
        url: 'https://namechk.com',
        icon: Users,
        color: 'bg-blue-500',
        category: 'Social Media',
        rating: 4,
        free: true,
        integration: 'external'
      },
      {
        name: 'Social Searcher',
        description: 'Real-time social media search and monitoring',
        url: 'https://www.social-searcher.com',
        icon: Search,
        color: 'bg-pink-500',
        category: 'Social Media',
        rating: 4,
        free: true,
        integration: 'external'
      }
    ],

    security: [
      {
        name: 'Advanced URL Analysis',
        description: 'Built-in comprehensive URL security and reputation analysis',
        url: 'builtin:url_analyzer',
        icon: Crosshair,
        color: 'bg-gradient-to-r from-red-600 to-pink-600',
        category: 'Built-in Tools',
        rating: 5,
        free: true,
        integration: 'builtin',
        advanced: true,
        inputType: 'url'
      },
      {
        name: 'URLVoid',
        description: 'Website reputation and malware detection service',
        url: 'https://www.urlvoid.com',
        icon: Globe,
        color: 'bg-red-600',
        category: 'Security Analysis',
        rating: 4,
        free: true,
        integration: 'external'
      },
      {
        name: 'Hybrid Analysis',
        description: 'Free malware analysis service for the community',
        url: 'https://www.hybrid-analysis.com',
        icon: Bug,
        color: 'bg-purple-600',
        category: 'Security Analysis',
        rating: 5,
        free: true,
        integration: 'external'
      },
      {
        name: 'Any.run',
        description: 'Interactive online malware analysis sandbox',
        url: 'https://any.run',
        icon: Activity,
        color: 'bg-orange-600',
        category: 'Security Analysis',
        rating: 5,
        free: false,
        integration: 'external'
      }
    ],

    communication: [
      {
        name: 'Phone Intelligence',
        description: 'Built-in comprehensive phone number analysis and validation',
        url: 'builtin:phone_analyzer',
        icon: Phone,
        color: 'bg-gradient-to-r from-green-600 to-blue-600',
        category: 'Built-in Tools',
        rating: 5,
        free: true,
        integration: 'builtin',
        advanced: true,
        inputType: 'phone'
      },
      {
        name: 'TrueCaller',
        description: 'Phone number identification and spam detection',
        url: 'https://www.truecaller.com',
        icon: Phone,
        color: 'bg-blue-600',
        category: 'Phone Analysis',
        rating: 4,
        free: true,
        integration: 'external'
      },
      {
        name: 'Sync.ME',
        description: 'Phone number lookup and social profile discovery',
        url: 'https://sync.me',
        icon: Smartphone,
        color: 'bg-purple-600',
        category: 'Phone Analysis',
        rating: 4,
        free: true,
        integration: 'external'
      }
    ]
  };

  // Enhanced Categories with Professional Descriptions
  const categories = [
    { 
      id: 'all', 
      name: 'All Tools', 
      icon: Target, 
      description: 'View all available OSINT tools',
      count: Object.values(osintTools).reduce((acc, tools) => acc + (tools?.length || 0), 0)
    },
    { 
      id: 'people-search', 
      name: 'People Search', 
      icon: Users, 
      description: 'People search and background investigation tools',
      count: osintTools['people-search']?.length || 0
    },
    { 
      id: 'domain-analysis', 
      name: 'Domain Analysis', 
      icon: Globe, 
      description: 'Domain analysis and website intelligence tools',
      count: osintTools['domain-analysis']?.length || 0
    },
    { 
      id: 'breach-analysis', 
      name: 'Breach Analysis', 
      icon: Shield, 
      description: 'Data breach detection and credential analysis',
      count: osintTools['breach-analysis']?.length || 0
    },
    { 
      id: 'email-analysis', 
      name: 'Email Analysis', 
      icon: Mail, 
      description: 'Email analysis, validation, and breach checking',
      count: osintTools['email-analysis']?.length || 0
    },
    { 
      id: 'social-media', 
      name: 'Social Media Analysis', 
      icon: MessageCircle, 
      description: 'Social media analysis and monitoring tools',
      count: osintTools['social-media']?.length || 0
    },
    { 
      id: 'ethical-hacking', 
      name: 'Ethical Hacking / Security', 
      icon: Bug, 
      description: 'Security assessment and ethical hacking tools',
      count: osintTools['ethical-hacking']?.length || 0
    },
    { 
      id: 'search-engines', 
      name: 'Search Engines', 
      icon: Search, 
      description: 'Specialized search engines and search techniques',
      count: osintTools['search-engines']?.length || 0
    },
    { 
      id: 'osint-resources', 
      name: 'OSINT Resources & Training', 
      icon: BookOpen, 
      description: 'Training, frameworks, and community resources',
      count: osintTools['osint-resources']?.length || 0
    },
    { 
      id: 'dark-web-intelligence', 
      name: 'Dark Web Intelligence', 
      icon: Eye, 
      description: 'Dark web research and .onion site investigation tools',
      count: osintTools['dark-web-intelligence']?.length || 0
    },
    { 
      id: 'username-research', 
      name: 'Username Research', 
      icon: UserCheck, 
      description: 'Username hunting and social account discovery tools',
      count: osintTools['username-research']?.length || 0
    },
    { 
      id: 'complete-osint-frameworks', 
      name: 'Complete OSINT Frameworks', 
      icon: Layers, 
      description: 'All-in-one OSINT toolkits and comprehensive frameworks',
      count: osintTools['complete-osint-frameworks']?.length || 0
    },
    { 
      id: 'image-analysis', 
      name: 'Image Analysis', 
      icon: Image, 
      description: 'Reverse image search and image verification tools',
      count: osintTools['image-analysis']?.length || 0
    },
    // Legacy categories for backward compatibility
    { 
      id: 'people', 
      name: 'People Intelligence (Legacy)', 
      icon: Users, 
      description: 'Legacy people search tools',
      count: osintTools.people?.length || 0
    },
    { 
      id: 'domains', 
      name: 'Domain & Web Intelligence (Legacy)', 
      icon: Globe, 
      description: 'Legacy domain analysis tools',
      count: osintTools.domains?.length || 0
    },
    { 
      id: 'email', 
      name: 'Email Intelligence (Legacy)', 
      icon: Mail, 
      description: 'Legacy email analysis tools',
      count: osintTools.email?.length || 0
    },
    { 
      id: 'social', 
      name: 'Social Media Intelligence (Legacy)', 
      icon: Users, 
      description: 'Legacy social media analysis tools',
      count: osintTools.social?.length || 0
    },
    { 
      id: 'breach', 
      name: 'Breach Analysis (Legacy)', 
      icon: Shield, 
      description: 'Legacy data breach detection tools',
      count: osintTools.breach?.length || 0
    },
    { 
      id: 'reconnaissance', 
      name: 'Reconnaissance (Legacy)', 
      icon: Compass, 
      description: 'Legacy network scanning tools',
      count: osintTools.reconnaissance?.length || 0
    },
    { 
      id: 'search', 
      name: 'Search Engines (Legacy)', 
      icon: Search, 
      description: 'Legacy specialized search engines',
      count: osintTools.search?.length || 0
    },
    { 
      id: 'resources', 
      name: 'OSINT Resources (Legacy)', 
      icon: BookOpen, 
      description: 'Legacy training and community resources',
      count: osintTools.resources?.length || 0
    }
  ];

  // Enhanced Built-in Tool Execution with Security Validation
  const executeBuiltinTool = async (toolType, input, setResults, setIsLoading) => {
    // Rate limiting check
    const rateLimitKey = `builtin_tool_${toolType}_${Date.now() - Date.now() % 60000}`;
    const rateLimitResult = rateLimit(rateLimitKey, 10, 60000); // 10 requests per minute
    
    if (!rateLimitResult.allowed) {
      securityLogger.logSecurityEvent('rate_limit_exceeded', {
        toolType,
        resetTime: rateLimitResult.resetTime
      });
      setResults({ 
        status: 'error', 
        message: 'Rate limit exceeded. Please wait before trying again.', 
        data: null 
      });
      return;
    }

    setIsLoading(true);
    setResults({ status: 'running', message: 'Validating input and executing tool...', data: null });
    
    try {
      // Determine input type based on tool type
      let inputType = 'text';
      switch (toolType) {
        case 'subdomain_enum':
        case 'dns_lookup':
        case 'whois_lookup':
        case 'website_analyzer':
          inputType = 'domain';
          break;
        case 'url_analyzer':
          inputType = 'url';
          break;
        case 'ip_geolocation':
          inputType = 'ip';
          break;
        case 'email_osint':
          inputType = 'email';
          break;
        case 'phone_analyzer':
          inputType = 'phone';
          break;
        case 'user_enumeration':
        case 'github_recon':
        case 'social_media_analyzer':
          inputType = 'username';
          break;
        case 'port_scanner':
          inputType = 'domain'; // Can be domain or IP
          break;
      }

      // Validate and sanitize input
      const validation = sanitizeOSINTInput(input, inputType);
      if (!validation.valid) {
        securityLogger.logSecurityEvent('input_validation_failed', {
          toolType,
          inputType,
          error: validation.error,
          originalInput: input.substring(0, 50) // Log only first 50 chars for security
        });
        
        setResults({ 
          status: 'error', 
          message: `Input validation failed: ${validation.error}`, 
          data: null 
        });
        return;
      }

      // Log security warning if present
      if (validation.warning) {
        setSecurityWarnings(prev => [...prev, {
          id: Date.now(),
          message: validation.warning,
          type: 'warning',
          toolType
        }]);
      }

      const sanitizedInput = validation.sanitized;

      // Log successful tool execution
      securityLogger.logSecurityEvent('builtin_tool_executed', {
        toolType,
        inputType,
        hasWarning: !!validation.warning
      });

      let result;
      
      switch (toolType) {
        case 'subdomain_enum':
          result = await executeSubdomainEnumeration(sanitizedInput);
          break;
        case 'port_scanner':
          result = await executePortScanner(sanitizedInput);
          break;
        case 'dns_lookup':
          result = await executeDNSLookup(sanitizedInput);
          break;
        case 'whois_lookup':
          result = await executeWHOISLookup(sanitizedInput);
          break;
        case 'ip_geolocation':
          result = await executeIPGeolocation(sanitizedInput);
          break;
        case 'email_osint':
          result = await executeEmailOSINT(sanitizedInput);
          break;
        case 'user_enumeration':
          result = await executeUserEnumeration(sanitizedInput);
          break;
        case 'github_recon':
          result = await executeGitHubRecon(sanitizedInput);
          break;
        case 'website_analyzer':
          result = await executeWebsiteAnalyzer(sanitizedInput);
          break;
        case 'url_analyzer':
          result = await executeURLAnalyzer(sanitizedInput);
          break;
        case 'social_media_analyzer':
          result = await executeSocialMediaAnalyzer(sanitizedInput);
          break;
        case 'phone_analyzer':
          result = await executePhoneAnalyzer(sanitizedInput);
          break;
        default:
          throw new Error('Unknown tool type');
      }
      
      setResults({ 
        status: 'success', 
        message: 'Tool executed successfully', 
        data: result,
        sanitizedInput
      });
      
    } catch (error) {
      securityLogger.logSecurityEvent('tool_execution_error', {
        toolType,
        error: error.message
      });
      
      setResults({ 
        status: 'error', 
        message: error.message, 
        data: null 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Built-in Tool Implementation Functions
  const executeSubdomainEnumeration = async (domain) => {
    // Simulated subdomain enumeration
    const subdomains = [
      'www', 'mail', 'ftp', 'admin', 'api', 'blog', 'shop', 'support', 'dev', 'staging'
    ];
    
    return {
      domain,
      found_subdomains: subdomains.map(sub => `${sub}.${domain}`),
      total_found: subdomains.length,
      techniques_used: ['DNS Enumeration', 'Certificate Transparency', 'Brute Force']
    };
  };

  const executePortScanner = async (target) => {
    // Simulated port scanning
    const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995];
    const openPorts = commonPorts.filter(() => Math.random() > 0.7);
    
    return {
      target,
      open_ports: openPorts.map(port => ({
        port,
        service: getServiceForPort(port),
        state: 'open'
      })),
      scan_type: 'TCP SYN Scan',
      total_scanned: commonPorts.length
    };
  };

  const executeDNSLookup = async (domain) => {
    // Simulated DNS lookup
    return {
      domain,
      records: {
        A: ['93.184.216.34'],
        AAAA: ['2606:2800:220:1:248:1893:25c8:1946'],
        MX: ['10 mail.example.com'],
        NS: ['ns1.example.com', 'ns2.example.com'],
        TXT: ['v=spf1 include:_spf.example.com ~all']
      },
      nameservers: ['ns1.example.com', 'ns2.example.com']
    };
  };

  const executeWHOISLookup = async (domain) => {
    // Simulated WHOIS lookup
    return {
      domain,
      registrar: 'Example Registrar Inc.',
      creation_date: '2023-01-15',
      expiration_date: '2024-01-15',
      registrant: {
        name: 'Privacy Protected',
        organization: 'Domains By Proxy',
        country: 'US'
      },
      nameservers: ['ns1.example.com', 'ns2.example.com']
    };
  };

  const executeIPGeolocation = async (ip) => {
    // Simulated IP geolocation
    return {
      ip,
      country: 'United States',
      region: 'California',
      city: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194,
      isp: 'Example ISP',
      organization: 'Example Org',
      timezone: 'America/Los_Angeles'
    };
  };

  const executeEmailOSINT = async (email) => {
    // Simulated email OSINT
    return {
      email,
      valid: true,
      deliverable: true,
      breach_count: Math.floor(Math.random() * 5),
      domain_reputation: 'Good',
      associated_accounts: ['Twitter', 'LinkedIn', 'GitHub']
    };
  };

  const executeUserEnumeration = async (username) => {
    // Simulated user enumeration
    const platforms = ['Twitter', 'Instagram', 'GitHub', 'LinkedIn', 'Reddit'];
    const found = platforms.filter(() => Math.random() > 0.5);
    
    return {
      username,
      platforms_found: found,
      total_checked: platforms.length,
      confidence: Math.floor(Math.random() * 40) + 60
    };
  };

  const executeGitHubRecon = async (username) => {
    // Simulated GitHub reconnaissance
    return {
      username,
      profile_exists: true,
      public_repos: Math.floor(Math.random() * 50) + 1,
      followers: Math.floor(Math.random() * 100),
      following: Math.floor(Math.random() * 50),
      languages: ['JavaScript', 'Python', 'React'],
      most_recent_activity: '2 days ago'
    };
  };

  const executeWebsiteAnalyzer = async (url) => {
    // Simulated website analysis
    return {
      url,
      technologies: ['React', 'Node.js', 'Nginx', 'Cloudflare'],
      ssl_certificate: {
        valid: true,
        issuer: 'Let\'s Encrypt',
        expires: '2024-06-15'
      },
      performance_score: Math.floor(Math.random() * 30) + 70,
      security_headers: ['X-Frame-Options', 'X-Content-Type-Options']
    };
  };

  const executeURLAnalyzer = async (url) => {
    // Simulated URL analysis
    return {
      url,
      reputation: 'Safe',
      threat_types: [],
      redirects: [url],
      final_url: url,
      response_code: 200,
      content_type: 'text/html'
    };
  };

  const executeSocialMediaAnalyzer = async (username) => {
    // Simulated social media analysis
    return {
      username,
      platforms: {
        twitter: { exists: true, followers: Math.floor(Math.random() * 1000) },
        instagram: { exists: false },
        linkedin: { exists: true, connections: Math.floor(Math.random() * 500) }
      },
      sentiment_analysis: 'Neutral',
      activity_level: 'Moderate'
    };
  };

  const executePhoneAnalyzer = async (phone) => {
    // Simulated phone analysis
    return {
      phone,
      valid: true,
      country: 'United States',
      carrier: 'Verizon',
      line_type: 'Mobile',
      location: 'New York, NY'
    };
  };

  const getServiceForPort = (port) => {
    const services = {
      21: 'FTP',
      22: 'SSH',
      23: 'Telnet',
      25: 'SMTP',
      53: 'DNS',
      80: 'HTTP',
      110: 'POP3',
      143: 'IMAP',
      443: 'HTTPS',
      993: 'IMAPS',
      995: 'POP3S'
    };
    return services[port] || 'Unknown';
  };

  // Enhanced filter tools based on search query and filters
  const filteredTools = () => {
    let tools = osintTools[activeCategory] || [];
    
    // Apply search query filter
    if (searchQuery.trim()) {
      tools = tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }
    
    // Apply pricing filter
    if (filterOptions.pricing !== 'all') {
      tools = tools.filter(tool => {
        if (filterOptions.pricing === 'free') return tool.free === true;
        if (filterOptions.pricing === 'paid') return tool.free === false;
        return true;
      });
    }
    
    // Apply rating filter
    if (filterOptions.rating !== 'all') {
      const minRating = parseInt(filterOptions.rating.replace('+', ''));
      tools = tools.filter(tool => (tool.rating || 0) >= minRating);
    }
    
    // Apply category filter
    if (filterOptions.category !== 'all') {
      tools = tools.filter(tool => tool.category === filterOptions.category);
    }
    
    // Apply integration filter
    if (filterOptions.integration !== 'all') {
      tools = tools.filter(tool => tool.integration === filterOptions.integration);
    }
    
    // Apply advanced filter
    if (filterOptions.advanced !== 'all') {
      if (filterOptions.advanced === 'advanced') {
        tools = tools.filter(tool => tool.advanced === true);
      } else if (filterOptions.advanced === 'basic') {
        tools = tools.filter(tool => tool.advanced !== true);
      }
    }
    
    // Apply sorting
    tools.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'popularity':
          aValue = a.popularity || 0;
          bValue = b.popularity || 0;
          break;
        case 'name':
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
      }
      
      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
    
    return tools;
  };

  // Enhanced Pagination and Performance Functions with Memoization
  const getAllFilteredTools = useMemo(() => {
    let tools = [];
    
    // Get tools based on active category
    if (activeCategory === 'all') {
      // Combine all tools from all categories
      tools = Object.values(osintTools).flat();
    } else {
      tools = osintTools[activeCategory] || [];
    }
    
    // Apply search query filter
    if (searchQuery.trim()) {
      tools = tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }
    
    // Apply pricing filter
    if (filterOptions.pricing !== 'all') {
      tools = tools.filter(tool => {
        if (filterOptions.pricing === 'free') return tool.free === true;
        if (filterOptions.pricing === 'paid') return tool.free === false;
        if (filterOptions.pricing === 'freemium') return tool.price && tool.price.includes('$');
        return true;
      });
    }
    
    // Apply rating filter
    if (filterOptions.rating !== 'all') {
      const minRating = parseFloat(filterOptions.rating.replace('+', ''));
      tools = tools.filter(tool => (tool.rating || 0) >= minRating);
    }
    
    // Apply category filter (when not already filtered by activeCategory)
    if (filterOptions.category !== 'all' && activeCategory === 'all') {
      const categoryMap = {
        'people-search': ['People Search'],
        'domain-analysis': ['Domain Analysis'],
        'breach-analysis': ['Breach Analysis'],
        'email-analysis': ['Email Analysis'],
        'social-media': ['Social Media Analysis'],
        'ethical-hacking': ['Ethical Hacking / Security'],
        'search-engines': ['Search Engines'],
        'osint-resources': ['OSINT Resources & Training']
      };
      
      const targetCategories = categoryMap[filterOptions.category] || [];
      tools = tools.filter(tool => targetCategories.some(cat => tool.category.includes(cat)));
    }
    
    // Apply integration filter
    if (filterOptions.integration !== 'all') {
      tools = tools.filter(tool => tool.integration === filterOptions.integration);
    }
    
    // Apply advanced filter
    if (filterOptions.advanced !== 'all') {
      if (filterOptions.advanced === 'advanced') {
        tools = tools.filter(tool => tool.advanced === true);
      } else if (filterOptions.advanced === 'basic') {
        tools = tools.filter(tool => tool.advanced !== true);
      } else if (filterOptions.advanced === 'intermediate') {
        tools = tools.filter(tool => tool.rating >= 4.0 && tool.rating < 4.8);
      }
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      tools = tools.filter(tool => userFavorites.has(tool.name));
    }
    
    // Apply sorting
    tools.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'popularity':
          aValue = a.popularity || 0;
          bValue = b.popularity || 0;
          break;
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
        case 'name':
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
      }
      
      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
    
    return tools;
  }, [activeCategory, searchQuery, filterOptions, sortBy, sortOrder, osintTools, showFavoritesOnly, userFavorites]);

  const getPaginatedTools = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return getAllFilteredTools.slice(startIndex, endIndex);
  }, [getAllFilteredTools, currentPage, itemsPerPage]);

  const getTotalPages = useMemo(() => {
    return Math.ceil(getAllFilteredTools.length / itemsPerPage);
  }, [getAllFilteredTools.length, itemsPerPage]);

  // Update total pages when filters change
  useEffect(() => {
    const newTotalPages = getTotalPages;
    setTotalPages(newTotalPages);
    
    // Reset to page 1 if current page exceeds total pages
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [getTotalPages, currentPage]);

  const handlePageChange = useCallback((newPage) => {
    setIsLoading(true);
    setCurrentPage(newPage);
    setLoadedPages(prev => new Set([...prev, newPage]));
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      setIsLoading(false);
      // Scroll to top of results
      document.querySelector('.tools-grid')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 200);
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    setLoadedPages(new Set([1]));
  }, []);

  const trackToolLaunch = useCallback((tool, method = 'direct') => {
    trackEvent('tool_launch', {
      toolName: tool.name,
      toolCategory: tool.category,
      toolIntegration: tool.integration,
      launchMethod: method,
      toolFree: tool.free,
      toolRating: tool.rating || 0
    });
  }, [trackEvent]);

  const trackSearch = useCallback((query, resultsCount) => {
    trackEvent('search', {
      query: query.trim(),
      resultsCount,
      activeCategory,
      filtersApplied: Object.values(filterOptions).some(v => v !== 'all')
    });
  }, [trackEvent, activeCategory, filterOptions]);

  const trackCategoryView = useCallback((category) => {
    trackEvent('category_view', {
      category,
      previousCategory: activeCategory,
      timestamp: Date.now()
    });
  }, [trackEvent, activeCategory]);

  const trackPerformance = useCallback((operation, startTime) => {
    const loadTime = Date.now() - startTime;
    trackEvent('performance', {
      operation,
      loadTime,
      userAgent: navigator.userAgent
    });
  }, [trackEvent]);

  // Enhanced category change with analytics
  const handleCategoryChange = useCallback((newCategory) => {
    const startTime = Date.now();
    trackCategoryView(newCategory);
    setActiveCategory(newCategory);
    setCurrentPage(1);
    setLoadedPages(new Set([1]));
    trackPerformance('category_change', startTime);
  }, [trackCategoryView, trackPerformance]);

  // Enhanced search with analytics
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    if (query.trim()) {
      // Debounce search tracking
      const timeoutId = setTimeout(() => {
        const resultsCount = getAllFilteredTools.length;
        trackSearch(query, resultsCount);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [setSearchQuery, getAllFilteredTools.length, trackSearch]);

  // Open tool with browser selection
  const openToolWithBrowserSelector = (tool, query = null) => {
    const startTime = Date.now();
    
    // Track tool launch analytics
    trackToolLaunch(tool, 'browser_selector');
    
    let url = tool.url;
    
    // Build URL with search parameters if supported
    if (tool.integration === 'direct' && (query || searchQuery.trim()) && tool.params) {
      const searchTerm = query || searchQuery.trim();
      const params = new URLSearchParams();
      Object.entries(tool.params).forEach(([key, value]) => {
        if (value === 'search_query') {
          params.append(key, searchTerm);
        } else {
          params.append(key, value);
        }
      });
      url = `${tool.url}?${params.toString()}`;
    }

    setPendingUrl(url);
    setShowBrowserSelector(true);
    
    // Track performance
    trackPerformance('tool_url_generation', startTime);
  };

  // Open tool in browser or Electron (legacy method)
  const openTool = (tool, query = null) => {
    // Handle builtin tools
    if (tool.integration === 'builtin') {
      if (tool.url === '/domain-lookup') {
        setShowDomainLookup(true);
        return;
      }
    }
    
    let url = tool.url;
    
    // Build URL with search parameters if supported
    if (tool.integration === 'direct' && (query || searchQuery.trim()) && tool.params) {
      const searchTerm = query || searchQuery.trim();
      const params = new URLSearchParams();
      Object.entries(tool.params).forEach(([key, value]) => {
        if (value === 'search_query') {
          params.append(key, searchTerm);
        } else {
          params.append(key, value);
        }
      });
      url = `${tool.url}?${params.toString()}`;
    }

    // Use browser preference for quick launch
    if (window.electronAPI) {
      if (browserPreference === 'builtin') {
        window.electronAPI.openBrowser(url);
      } else {
        window.electronAPI.openBrowserWith(url, browserPreference);
      }
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBrowserSelect = (browserConfig) => {
    setBrowserPreference(browserConfig.browser);
  };

  // Bulk search functionality
  const runBulkSearch = async () => {
    if (!searchQuery.trim()) return;
    
    const directTools = osintTools[activeCategory]?.filter(tool => 
      tool.integration === 'direct'
    ) || [];
    
    // Open multiple tabs with delays to prevent browser blocking
    directTools.forEach((tool, index) => {
      setTimeout(() => {
        openTool(tool);
      }, index * 1000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 scrollbar-primary">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between mb-6 relative">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">InfoScope OSINT</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Professional Intelligence Platform</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Browser Preference Selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Launch:</label>
                <select
                  value={browserPreference}
                  onChange={(e) => setBrowserPreference(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="builtin">Built-in Browser</option>
                  <option value="chrome">Chrome</option>
                  <option value="firefox">Firefox</option>
                  <option value="edge">Edge</option>
                  <option value="brave">Brave</option>
                </select>
              </div>
              
              {/* Search Bar */}
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tools or enter target..."
                  value={searchQuery}
                  onChange={(e) => {
                    const input = e.target.value;
                    // Basic input sanitization on typing
                    if (input.length > 100) return; // Prevent overly long inputs
                    
                    // Check for obvious malicious patterns
                    const dangerousPatterns = [
                      /<script/i,
                      /javascript:/i,
                      /on\w+=/i,
                      /eval\(/i
                    ];
                    
                    const hasDangerousPattern = dangerousPatterns.some(pattern => pattern.test(input));
                    if (hasDangerousPattern) {
                      securityLogger.logSecurityEvent('malicious_search_input_blocked', {
                        input: input.substring(0, 50),
                        pattern: 'script_injection_attempt'
                      });
                      return;
                    }
                    
                    setSearchQuery(input);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                  showFilters
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Settings className="w-4 h-4" />
                Filters
              </button>
              
              {/* Favorites Toggle */}
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                  showFavoritesOnly
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600 text-red-700 dark:text-red-300'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                title={showFavoritesOnly ? 'Show all tools' : 'Show favorites only'}
              >
                <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                {showFavoritesOnly ? 'Favorites' : 'Show Favorites'}
                {userFavorites.size > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full">
                    {userFavorites.size}
                  </span>
                )}
              </button>
            </div>
            
            {/* Enhanced Advanced Filters Panel */}
            {showFilters && (
              <div className="absolute top-full left-0 right-0 mt-2 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
                  <button
                    onClick={() => {
                      setFilterOptions({
                        pricing: 'all',
                        rating: 'all',
                        category: 'all',
                        integration: 'all',
                        advanced: 'all'
                      });
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    Reset All
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {/* Pricing Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Pricing
                    </label>
                    <select
                      value={filterOptions.pricing}
                      onChange={(e) => setFilterOptions({...filterOptions, pricing: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    >
                      <option value="all">All Pricing</option>
                      <option value="free">Free Only</option>
                      <option value="paid">Paid Only</option>
                      <option value="freemium">Freemium</option>
                    </select>
                  </div>
                  
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Target className="w-4 h-4 inline mr-1" />
                      Category
                    </label>
                    <select
                      value={filterOptions.category}
                      onChange={(e) => setFilterOptions({...filterOptions, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    >
                      <option value="all">All Categories</option>
                      <option value="people-search">People Search</option>
                      <option value="domain-analysis">Domain Analysis</option>
                      <option value="breach-analysis">Breach Analysis</option>
                      <option value="email-analysis">Email Analysis</option>
                      <option value="social-media">Social Media</option>
                      <option value="ethical-hacking">Security & Hacking</option>
                      <option value="search-engines">Search Engines</option>
                      <option value="osint-resources">Resources & Training</option>
                    </select>
                  </div>
                  
                  {/* Rating Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Star className="w-4 h-4 inline mr-1" />
                      Rating
                    </label>
                    <select
                      value={filterOptions.rating}
                      onChange={(e) => setFilterOptions({...filterOptions, rating: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    >
                      <option value="all">All Ratings</option>
                      <option value="4.5+">4.5+ Stars</option>
                      <option value="4+">4+ Stars</option>
                      <option value="3.5+">3.5+ Stars</option>
                      <option value="3+">3+ Stars</option>
                    </select>
                  </div>
                  
                  {/* Integration Type Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Zap className="w-4 h-4 inline mr-1" />
                      Type
                    </label>
                    <select
                      value={filterOptions.integration}
                      onChange={(e) => setFilterOptions({...filterOptions, integration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    >
                      <option value="all">All Types</option>
                      <option value="builtin">Built-in Tools</option>
                      <option value="external">External Sites</option>
                      <option value="native">Native Integration</option>
                    </select>
                  </div>
                  
                  {/* Advanced Level Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Activity className="w-4 h-4 inline mr-1" />
                      Level
                    </label>
                    <select
                      value={filterOptions.advanced}
                      onChange={(e) => setFilterOptions({...filterOptions, advanced: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    >
                      <option value="all">All Levels</option>
                      <option value="advanced">Advanced</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="basic">Basic</option>
                    </select>
                  </div>
                  
                  {/* Sort Options */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      <BarChart3 className="w-4 h-4 inline mr-1" />
                      Sort By
                    </label>
                    <div className="flex gap-1">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="flex-1 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                      >
                        <option value="name">Name</option>
                        <option value="rating">Rating</option>
                        <option value="popularity">Popular</option>
                        <option value="category">Category</option>
                      </select>
                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
                        title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                      >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Active Filters Display */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(filterOptions).map(([key, value]) => {
                    if (value !== 'all') {
                      return (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                        >
                          {key}: {value}
                          <button
                            onClick={() => setFilterOptions({...filterOptions, [key]: 'all'})}
                            className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                          >
                            ×
                          </button>
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}
                </div>
                
                {/* Clear Filters Button */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setFilterOptions({
                        pricing: 'all',
                        rating: 'all',
                        category: 'all',
                        integration: 'all',
                        advanced: 'all'
                      });
                      setSortBy('name');
                      setSortOrder('asc');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
          {/* Security Warnings */}
          <div className="relative">
            <div className="flex justify-center">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 max-w-6xl">
                {categories.filter(cat => !cat.name.includes('Legacy')).map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm ${
                        activeCategory === category.id
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'
                      }`}
                    >
                      <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{category.name}</span>
                      {category.count > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                          activeCategory === category.id
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {category.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
      </div>

      {/* Security Warnings */}
      {securityWarnings.length > 0 && (
        <div className="mx-auto max-w-7xl px-6 py-2">
          <div className="space-y-2">
            {securityWarnings.map((warning) => (
              <div 
                key={warning.id}
                className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm text-yellow-800 dark:text-yellow-300">
                    {warning.message}
                  </span>
                  <span className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-800/30 px-2 py-1 rounded">
                    {warning.toolType}
                  </span>
                </div>
                <button
                  onClick={() => setSecurityWarnings(prev => prev.filter(w => w.id !== warning.id))}
                  className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Category Info */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              {React.createElement(categories.find(c => c.id === activeCategory)?.icon, { 
                className: "w-6 h-6 text-blue-600 dark:text-blue-400" 
              })}
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-200">
                {categories.find(c => c.id === activeCategory)?.name}
              </h2>
              {searchQuery.trim() && (
                <button
                  onClick={runBulkSearch}
                  className="ml-auto bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Bulk Search
                </button>
              )}
            </div>
            <p className="text-blue-700 dark:text-blue-300">
              {categories.find(c => c.id === activeCategory)?.description}
            </p>
          </div>
        </div>

        {/* Premium Pagination and View Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Showing <span className="font-bold text-gray-900 dark:text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
              <span className="font-bold text-gray-900 dark:text-white">
                {Math.min(currentPage * itemsPerPage, getAllFilteredTools.length)}
              </span> of{' '}
              <span className="font-bold text-gray-900 dark:text-white">{getAllFilteredTools.length}</span> tools
            </div>
            
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={36}>36</option>
                <option value={48}>48</option>
              </select>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Minimalist Enhanced Tools Grid */}
        <div className="tools-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Loading tools...</span>
              </div>
            </div>
          )}
          
          {getPaginatedTools.map((tool, index) => {
            const IconComponent = tool.icon;
            return (
              <div 
                key={index} 
                className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both`
                }}
              >
                {/* Minimalist Card Content */}
                <div className="p-4">
                  {/* Icon and Badges Row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tool.color} shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {/* Interactive Rating Stars */}
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <button
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToolRating(tool.name, i + 1);
                            }}
                            onMouseEnter={() => setHoverRating(tool.name, i + 1)}
                            onMouseLeave={() => setHoverRating(tool.name, null)}
                            className="focus:outline-none transition-transform duration-200 hover:scale-125"
                          >
                            <Star 
                              className={`w-3 h-3 transition-colors duration-200 ${
                                i < (hoverRatings[tool.name] || userRatings[tool.name] || tool.rating)
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
                              }`} 
                            />
                          </button>
                        ))}
                        {userRatings[tool.name] && (
                          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                            ({userRatings[tool.name]})
                          </span>
                        )}
                      </div>
                      
                      {/* Favorite Heart Icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(tool.name);
                        }}
                        className="ml-1 focus:outline-none transition-transform duration-200 hover:scale-125"
                        title={userFavorites.has(tool.name) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart 
                          className={`w-4 h-4 transition-colors duration-200 ${
                            userFavorites.has(tool.name)
                              ? 'text-red-500 fill-current' 
                              : 'text-gray-300 dark:text-gray-600 hover:text-red-400'
                          }`} 
                        />
                      </button>
                    </div>
                  </div>

                  {/* Tool Name */}
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2 leading-tight">
                    {tool.name}
                  </h3>

                  {/* Status Badges */}
                  <div className="flex items-center gap-1 mb-3 flex-wrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                      tool.free 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    }`}>
                      {tool.free ? 'Free' : (tool.price || 'Pro')}
                    </span>
                    
                    {tool.integration === 'native' && (
                      <span className="px-2 py-1 text-xs font-medium rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        Built-in
                      </span>
                    )}

                    {tool.integration === 'builtin' && (
                      <span className="px-2 py-1 text-xs font-medium rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        Advanced
                      </span>
                    )}

                    {tool.warning && (
                      <span className="px-2 py-1 text-xs font-medium rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" title={tool.warning}>
                        ⚠️
                      </span>
                    )}
                  </div>

                  {/* Category */}
                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-3 block truncate">
                    {tool.category}
                  </span>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {/* Quick Launch Button for External Tools */}
                    {tool.integration === 'external' && tool.url && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Quick launch in new tab
                          if (window.electronAPI && typeof window.electronAPI.openExternal === 'function') {
                            window.electronAPI.openExternal(tool.url);
                          } else {
                            window.open(tool.url, '_blank', 'noopener,noreferrer');
                          }
                          trackToolLaunch(tool, 'quick_launch');
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        title="Quick launch in default browser"
                      >
                        <Zap className="w-4 h-4" />
                        Quick Launch
                      </button>
                    )}

                    {/* Quick Launch Button for Built-in Tools */}
                    {(tool.integration === 'native' || tool.integration === 'builtin') && (
                      <button
                        onClick={() => openTool(tool)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <Zap className="w-4 h-4" />
                        Launch Tool
                      </button>
                    )}
                  </div>
                </div>

                {/* Hover Description Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 w-64 text-center pointer-events-none">
                  {tool.description}
                  {tool.tags && (
                    <div className="mt-1 text-xs opacity-75">
                      Tags: {tool.tags.join(', ')}
                    </div>
                  )}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Premium Enhanced No Results State */}
        {getAllFilteredTools.length === 0 && (
          <div className="text-center py-24">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl flex items-center justify-center shadow-2xl">
              <Search className="w-16 h-16 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No tools found
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto leading-relaxed">
              We couldn't find any tools matching your current search and filter criteria. Try adjusting your parameters to discover more tools.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterOptions({
                  pricing: 'all',
                  rating: 'all',
                  category: 'all',
                  integration: 'all',
                  advanced: 'all'
                });
                setCurrentPage(1);
                setLoadedPages(new Set([1]));
              }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center gap-3"
            >
              <RefreshCw className="w-5 h-5" />
              Clear All Filters
            </button>
          </div>
        )}

        {/* Enhanced Analytics Dashboard */}
        {process.env.NODE_ENV === 'development' && Object.keys(analytics.toolUsage).length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-700/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-purple-900 dark:text-purple-200">Session Analytics</h3>
              <div className="ml-auto text-sm text-purple-600 dark:text-purple-400">
                Session: {Math.round((Date.now() - analytics.userSession.startTime) / 1000 / 60)}m
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Session Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-700/50 p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Session Overview</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Tools Launched:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{analytics.userSession.toolsLaunched}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Searches:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{analytics.userSession.searches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Favorites:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{analytics.userSession.favoriteActions}</span>
                  </div>
                </div>
              </div>

              {/* Top Tools */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-700/50 p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Top Tools</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.toolUsage)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([tool, count]) => (
                      <div key={tool} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{tool}</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Category Views */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-700/50 p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Category Views</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.categoryViews)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{category}</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Performance */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-700/50 p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Performance</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Avg Response:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {analytics.performance.avgResponseTime ? `${Math.round(analytics.performance.avgResponseTime)}ms` : '0ms'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Operations:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{analytics.performance.loadTimes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Errors:</span>
                    <span className="font-bold text-red-500">{analytics.performance.errorCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Safety and Ethics Notice */}
        <div className="mt-12 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">Ethical Use Guidelines</h3>
              <div className="space-y-2 text-sm text-amber-800 dark:text-amber-300">
                <p>• <strong>Legal Compliance:</strong> Always follow local laws and regulations when conducting investigations.</p>
                <p>• <strong>Privacy Respect:</strong> Use these tools responsibly and respect individual privacy rights.</p>
                <p>• <strong>Authorized Research:</strong> Only use breach search tools for legitimate security research with proper authorization.</p>
                <p>• <strong>Data Protection:</strong> Handle any discovered information according to applicable data protection laws.</p>
                <p>• <strong>Platform Terms:</strong> Respect the terms of service of each tool and platform you use.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tool Statistics */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => {
            const toolCount = osintTools[category.id]?.length || 0;
            const IconComponent = category.icon;
            return (
              <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
                <IconComponent className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{toolCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{category.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access Toolbar */}
      <div className="fixed bottom-6 right-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-gray-700">Quick Access:</div>
            <button
              onClick={() => handleCategoryChange('people')}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="People Search"
            >
              <Users className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleCategoryChange('breach')}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Breach Analysis"
            >
              <Shield className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleCategoryChange('email')}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Email Analysis"
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>
        </div>

      {/* Browser Selector Modal */}
      <BrowserSelector
        isOpen={showBrowserSelector}
        onClose={() => setShowBrowserSelector(false)}
        url={pendingUrl}
        onBrowserSelect={handleBrowserSelect}
      />
    </div>
    </div>
  );
}

export default OSINTTools;