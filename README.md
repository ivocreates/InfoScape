# InfoScope OSINT Platform v2.3.0

<div align="center">

![InfoScope Logo](https://via.placeholder.com/200x200/2563EB/FFFFFF?text=InfoScope)

**Professional Open Source Intelligence Investigation Platform**

[![Version](https://img.shields.io/badge/version-2.3.0-blue.svg)](https://github.com/ivocreates/InfoScope/releases)
[![License](https://img.shields.io/badge/license-CC%20BY--SA%204.0-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](#installation)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)](https://reactjs.org/)
[![Electron](https://img.shields.io/badge/Electron-28.3.3-47848F.svg)](https://electronjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.7.1-FFCA28.svg)](https://firebase.google.com/)

[Download](https://github.com/ivocreates/InfoScope/releases) • [Documentation](#documentation) • [API Guide](#api-configuration) • [Contributing](#contributing) • [Support](#support)

</div>

---

## 🎯 Overview

InfoScope is a cutting-edge **Open Source Intelligence (OSINT) platform** designed for cybersecurity professionals, investigators, researchers, and digital forensics experts. Built with modern web technologies and integrated with 15+ real-world APIs, InfoScope provides comprehensive intelligence gathering capabilities while maintaining privacy and security.

### ✨ Key Features

- **🔍 Advanced Intelligence Gathering**: IP analysis, email investigation, domain research, social media reconnaissance, phone lookup, and geolocation services
- **🛡️ Real API Integrations**: 15+ professional APIs including VirusTotal, Shodan, Hunter.io, Have I Been Pwned, SecurityTrails, and more
- **🌐 Built-in Secure Browser**: Anonymous browsing with Tor integration, proxy chaining, and privacy protection
- **📊 Professional Reporting**: Export results in JSON, CSV, TXT, and XML formats with detailed analysis
- **🎨 Modern Interface**: Dark/light themes, responsive design, mobile-friendly interface
- **⚡ Real-time Investigation**: Live API calls with rate limiting and error handling
- **💾 Local Data Storage**: All investigations stored locally for privacy and security
- **🔒 Privacy-First Design**: No data collection, no tracking, complete user privacy
- **📱 Cross-Platform**: Desktop applications for Windows, macOS, and Linux + web version

---

## 🚀 Quick Start

### Web Version (Instant Access)
Visit [InfoScope Web App](https://infoscope-osint.web.app) to start investigating immediately.

### Desktop Installation

#### Windows
1. Download `InfoScope-OSINT-Platform-v2.3.0-Setup-x64.exe` from [Releases](https://github.com/ivocreates/InfoScope/releases)
2. Run the installer as Administrator
3. Launch InfoScope from Start Menu or Desktop shortcut

#### macOS
1. Download `InfoScope-OSINT-Platform-v2.3.0-x64.dmg` from [Releases](https://github.com/ivocreates/InfoScope/releases)
2. Mount the DMG file and drag InfoScope to Applications
3. Launch from Applications (may require allowing unsigned apps in Security preferences)

#### Linux
```bash
# AppImage (Universal)
wget https://github.com/ivocreates/InfoScope/releases/download/v2.3.0/InfoScope-OSINT-Platform-v2.3.0-x64.AppImage
chmod +x InfoScope-OSINT-Platform-v2.3.0-x64.AppImage
./InfoScope-OSINT-Platform-v2.3.0-x64.AppImage

# Debian/Ubuntu (.deb)
wget https://github.com/ivocreates/InfoScope/releases/download/v2.3.0/InfoScope-OSINT-Platform-v2.3.0-x64.deb
sudo dpkg -i InfoScope-OSINT-Platform-v2.3.0-x64.deb

# Red Hat/CentOS (.rpm)
wget https://github.com/ivocreates/InfoScope/releases/download/v2.3.0/InfoScope-OSINT-Platform-v2.3.0-x64.rpm
sudo rpm -i InfoScope-OSINT-Platform-v2.3.0-x64.rpm
```

---

## 🔧 Investigation Modules

### 🛡️ IP Intelligence
Comprehensive IP address analysis with threat detection and geolocation.

**Data Sources:**
- **IPinfo.io** (Free) - Location, ISP, Organization, Timezone
- **IPapi.co** (Free) - Geolocation, VPN/Proxy detection, ASN
- **VirusTotal** (API Key) - Malware analysis, reputation scoring
- **AbuseIPDB** (API Key) - Abuse reports, confidence scoring
- **Shodan** (API Key) - Port scanning, vulnerability detection

**Use Cases:**
- Network security analysis
- Incident response investigations
- Threat hunting and attribution
- Forensic analysis and evidence gathering

### 📧 Email Analysis
Professional email investigation and verification services.

**Data Sources:**
- **EmailRep.io** (Free) - Reputation analysis, blacklist checking
- **Hunter.io** (API Key) - Email verification, domain analysis
- **Have I Been Pwned** (API Key) - Data breach detection
- **Clearbit** (API Key) - Person/company enrichment

**Capabilities:**
- Email validation and verification
- Data breach history analysis
- Reputation scoring and risk assessment
- Domain and registrar investigation

### 🌐 Domain Research
Comprehensive domain intelligence and historical analysis.

**Data Sources:**
- **WHOIS Services** (Free) - Registration details, nameservers
- **Wayback Machine** (Free) - Historical snapshots
- **SecurityTrails** (API Key) - DNS history, subdomains
- **URLVoid** (API Key) - Reputation and safety analysis

**Features:**
- Domain registration history
- DNS record analysis
- Subdomain enumeration
- Certificate transparency logs

### 👥 Social Media Intelligence
Username enumeration across major social platforms.

**Platforms Covered:**
- Twitter/X, Instagram, LinkedIn, GitHub
- TikTok, Reddit, YouTube, Telegram
- Discord, Facebook, and more

**Investigation Types:**
- Username availability checking
- Cross-platform account discovery
- Profile verification and analysis
- Digital footprint mapping

### 📱 Phone Number Lookup
Professional phone number investigation and validation.

**Data Sources:**
- **NumVerify** (API Key) - Number validation, carrier lookup
- **Twilio Lookup** (API Key) - Caller information, SMS capabilities
- **TrueCaller** (Limited) - Caller ID and spam detection

**Information Gathered:**
- Number validation and formatting
- Carrier and line type identification
- Geographic location analysis
- Risk and spam assessment

### 🗺️ Geolocation Services
Advanced location intelligence and mapping capabilities.

**Data Sources:**
- **OpenCage Data** (API Key) - Geocoding, reverse geocoding
- **GeoJS** (Free) - IP-based geolocation
- **Mapbox** (API Key) - Advanced mapping and places search

**Capabilities:**
- Address to coordinates conversion
- Reverse geocoding services
- Timezone and administrative region data
- Precision location analysis

---

## ⚙️ API Configuration

InfoScope integrates with 15+ professional APIs to provide real-world intelligence capabilities. While some features work with free APIs, premium capabilities require API keys.

### 🆓 Free APIs (No Key Required)
- IPinfo.io - 50k requests/month
- IPapi.co - 30k requests/month
- EmailRep.io - Unlimited with rate limits
- Wayback Machine - Unlimited
- GeoJS - Unlimited

### 🔑 Premium APIs (Key Required)

#### Security & Threat Intelligence
- **VirusTotal** - Malware analysis, IP/domain reputation
  - Get key: [VirusTotal API](https://www.virustotal.com/gui/join-us)
  - Free tier: 500 requests/day

- **Shodan** - Internet-connected device search
  - Get key: [Shodan API](https://developer.shodan.io/)
  - Free tier: 100 queries/month

- **AbuseIPDB** - IP abuse database
  - Get key: [AbuseIPDB API](https://www.abuseipdb.com/api)
  - Free tier: 1000 checks/day

#### Email & Domain Intelligence
- **Hunter.io** - Email finder and verifier
  - Get key: [Hunter.io API](https://hunter.io/api)
  - Free tier: 25 searches/month

- **Have I Been Pwned** - Breach database
  - Get key: [HIBP API](https://haveibeenpwned.com/API/Key)
  - Rate limited: 1 request per 1.5 seconds

- **SecurityTrails** - DNS and domain history
  - Get key: [SecurityTrails API](https://securitytrails.com/corp/api)
  - Free tier: 50 queries/month

#### Communication & Location
- **NumVerify** - Phone number validation
  - Get key: [NumVerify API](https://numverify.com/)
  - Free tier: 100 requests/month

- **OpenCage Data** - Geocoding service
  - Get key: [OpenCage API](https://opencagedata.com/api)
  - Free tier: 2500 requests/day

### 🔧 Setting Up API Keys

1. **In-App Configuration:**
   - Open InfoScope → Advanced Intel → API Config
   - Enter your API keys for desired services
   - Keys are stored locally in your browser

2. **Environment Variables (Development):**
   ```bash
   export VT_API_KEY="your_virustotal_key"
   export SHODAN_API_KEY="your_shodan_key"
   export HUNTER_API_KEY="your_hunter_key"
   # ... add other keys as needed
   ```

3. **Configuration File:**
   Create `apiKeys.json` in the application directory:
   ```json
   {
     "virustotal": "your_api_key_here",
     "shodan": "your_api_key_here",
     "hunter": "your_api_key_here"
   }
   ```

---

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git
- Modern web browser

### Installation
```bash
# Clone the repository
git clone https://github.com/ivocreates/InfoScope.git
cd InfoScope

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Build desktop applications
npm run electron-pack-all
```

### Project Structure
```
InfoScope/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   ├── services/          # API integrations
│   ├── contexts/          # React contexts
│   └── utils/             # Utility functions
├── main.js                # Electron main process
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run electron` - Start Electron app
- `npm run electron-pack-win` - Build Windows installer
- `npm run electron-pack-mac` - Build macOS application
- `npm run electron-pack-linux` - Build Linux packages
- `npm run deploy` - Deploy to Firebase hosting

---

## 📋 Feature Comparison

| Feature | InfoScope | Maltego | SpiderFoot | Recon-ng | OSINTgram |
|---------|-----------|---------|------------|----------|-----------|
| **Free & Open Source** | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Cross-Platform Desktop** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Web Interface** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Real-time API Integration** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Built-in Secure Browser** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Modern UI/UX** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **No Installation Required** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Mobile Responsive** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Privacy Focused** | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Multiple Export Formats** | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 🔒 Privacy & Security

InfoScope is designed with privacy as a core principle:

- **No Data Collection**: We don't collect, store, or transmit any personal data
- **Local Storage Only**: All investigations are stored locally on your device
- **No Tracking**: No analytics, cookies, or user tracking
- **Open Source**: Complete transparency - audit the code yourself
- **Secure Communication**: All API calls use HTTPS encryption
- **Anonymous Usage**: Use with Tor, VPNs, and proxy chains
- **Self-Hosted Option**: Deploy your own instance for maximum security

### Security Best Practices
1. Keep API keys secure and rotate them regularly
2. Use VPN or Tor when conducting sensitive investigations
3. Regularly clear investigation history if needed
4. Verify SSL certificates when making API calls
5. Follow responsible disclosure for any security issues

---

## 📜 License

InfoScope is licensed under the **Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)**.

This means you are free to:
- **Share** — copy and redistribute the material in any medium or format
- **Adapt** — remix, transform, and build upon the material for any purpose, even commercially

Under the following terms:
- **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made
- **ShareAlike** — If you remix, transform, or build upon the material, you must distribute your contributions under the same license

[Read the full license](https://creativecommons.org/licenses/by-sa/4.0/)

---

## 📞 Support & Community

### Getting Help
- **Documentation**: [InfoScope Wiki](https://github.com/ivocreates/InfoScope/wiki)
- **Issues**: [Report bugs or request features](https://github.com/ivocreates/InfoScope/issues)
- **Discussions**: [Community forum](https://github.com/ivocreates/InfoScope/discussions)
- **Email**: [ivo@ivocreates.gmail.com](mailto:ivo@ivocreates.gmail.com)

### Community
- **GitHub**: [Star us on GitHub](https://github.com/ivocreates/InfoScope)
- **Twitter**: [@IvoCreates](https://twitter.com/IvoCreates)
- **Website**: [ivocreates.site](https://ivocreates.site)

### Professional Support
For enterprise deployments, custom integrations, or professional consulting:
- Email: [ivo@ivocreates.gmail.com](mailto:ivo@ivocreates.gmail.com)
- Website: [ivocreates.site](https://ivocreates.site)

---

<div align="center">

**Made with ❤️ by [Ivo Pereira](https://ivocreates.site)**

[⭐ Star on GitHub](https://github.com/ivocreates/InfoScope) | [🐛 Report Bug](https://github.com/ivocreates/InfoScope/issues) | [💡 Request Feature](https://github.com/ivocreates/InfoScope/issues/new)

**InfoScope OSINT Platform v2.3.0** - Professional Intelligence for Everyone

</div>

### 🔍 **Advanced OSINT Tools (48+ Integrated)**
- **People Search**: TruePeopleSearch, BeenVerified, PeopleFinder, Whitepages, FastPeopleSearch
- **Social Media Intelligence**: Sherlock, Social Searcher, Mention, KnowEm, Namechk
- **Email Analysis**: Hunter.io, Verify-Email, EmailRep, Have I Been Pwned, VoilaNorbert
- **Breach Analysis**: BreachDirectory, IntelligenceX, Snusbase, LeakCheck
- **Search Engines**: Shodan, Censys, Google Dorking, DuckDuckGo, Pipl
- **Ethical Hacking**: Maltego, SpiderFoot, theHarvester, Recon-ng, OSINT Framework
- **Domain Analysis**: Whois lookup, DNS analysis, SSL certificate inspection
- **Network Security**: Port scanning, vulnerability assessment, network mapping

### ✨ **Latest Enhancements (October 2025)**
- **🎯 Show All Tools by Default**: No need to select categories - all 48+ tools visible immediately
- **📱 Enhanced UI/UX**: Improved dropdown positioning, centered categories, responsive design
- **🔐 Password Visibility Toggle**: Show/hide password functionality in authentication
- **🌙 Dark Mode Improvements**: Better contrast and readability in dark theme
- **📚 Interactive Onboarding**: Step-by-step guided tour for new users
- **⚖️ Legal Framework**: Comprehensive terms of service and Creative Commons licensing
- **🚀 Performance Optimizations**: Faster loading times and improved stability

### 🌐 **Multi-Platform Anonymous Browsing**
- **Tor Browser Integration** with exit node selection (18+ countries)
- **Multi-hop Proxy Chaining** for maximum anonymity
- **Privacy Browsers**: Mullvad, LibreWolf, Epic Privacy Browser, Tails, Whonix  
- **Anonymous Networks**: I2P, Freenet, Psiphon, Lantern, UltraSurf

### ⚡ **Advanced Google Dorking Engine**
- Visual query builder with professional techniques
- Multi-search engine support (Google, Bing, DuckDuckGo)
- Site-specific and file type targeting
- Date range filtering and advanced operators

### 👤 **Comprehensive Profile Management**
- Investigation history with search tracking
- Data export/import in multiple formats
- Privacy settings and data retention controls
- Storage usage monitoring and cleanup tools

### 🖥️ **Multi-Platform Access**
- **Desktop Application** (Windows, macOS, Linux)
- **Web Application** (runs in any modern browser)
- **Progressive Web App** (installable from browser)
- **Cross-device sync** with Firebase integration
- **� Link Scanner**: Advanced link detection with accuracy scoring and match probability
- **🛠️ OSINT Tools Arsenal**: Integrated access to 25+ professional OSINT tools
- **�📱 Cross-Platform**: Built with Electron for Windows, macOS, and Linux
- **🎯 Preset Templates**: Quick-start templates for LinkedIn, GitHub, Resume hunting, etc.
- **💾 Investigation Management**: Save and organize your OSINT investigations
- **📧 Email/Password Auth**: Alternative authentication method alongside Google login

## Technology Stack

- **Frontend**: React 18 with Tailwind CSS
- **Desktop**: Electron 28
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Icons**: Lucide React (48+ professional icons)
- **Styling**: Tailwind CSS with custom components and dark mode support
- **Security**: Input sanitization, CSRF protection, rate limiting
- **Performance**: Optimized bundle size, lazy loading elimination for stability
- **Authentication**: Firebase Auth with Google OAuth and email/password
- **Legal Compliance**: Creative Commons BY-SA 4.0 licensing

## 📝 Recent Updates & Fixes

### Version 1.1.0 - October 2025

#### 🛠️ **Major Fixes**
- ✅ **Resolved Chunk Loading Errors**: Fixed React lazy loading issues causing runtime failures
- ✅ **UI Dropdown Improvements**: Fixed filter dropdown overlapping and content shifting
- ✅ **Performance Optimizations**: Eliminated webpack chunk loading for improved stability

#### ✨ **New Features**
- 🎯 **Show All Tools by Default**: All 48+ OSINT tools now visible immediately without category selection
- 🔐 **Password Visibility Toggle**: Added show/hide password functionality in login/register forms
- 📚 **Enhanced Onboarding**: Interactive step-by-step tutorial for new users
- 🌙 **Dark Mode Refinements**: Improved contrast and readability in dark theme
- ⚖️ **Legal Documentation**: Comprehensive terms of service and legal framework

#### 🎨 **UI/UX Enhancements**
- 📱 **Centered Categories**: Better visual layout for OSINT tool categories
- 🎨 **Custom Scrollbars**: Enhanced scrolling experience throughout the application
- 🔄 **Responsive Design**: Improved layout across all screen sizes
- 🎯 **Better Navigation**: More intuitive user interface and interaction patterns

#### 🔒 **Security Improvements**
- 🛡️ **Input Sanitization**: Enhanced security measures for user input
- 🔐 **CSRF Protection**: Cross-site request forgery protection implementation
- ⚡ **Rate Limiting**: Prevents abuse and ensures stable performance

## 🚀 **Get Started - Multiple Ways to Access**

### **Option 1: Web App (Recommended)**
Simply visit **[infoscope-osint.web.app](https://infoscope-osint.web.app)** in any modern browser. No installation required - works instantly with full functionality.

### **Option 2: Install as Progressive Web App (PWA)**
1. Visit [infoscope-osint.web.app](https://infoscope-osint.web.app)
2. Look for "Install App" or "Add to Home Screen" option in your browser
3. Install for offline access and app-like experience

### **Option 3: Desktop Application**
Download platform-specific packages from [GitHub Releases](https://github.com/ivocreates/InfoScope/releases):
- **Windows**: InfoScope-OSINT-Setup-1.1.0.exe
- **macOS**: InfoScope-OSINT-1.1.0.dmg  
- **Linux**: InfoScope-OSINT-1.1.0.AppImage

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd infoscope-osint
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase** (already configured with provided keys)
   - Firebase project is pre-configured
   - Authentication, Firestore, and Storage are ready to use

4. **Start development server**
   ```bash
   npm run electron-dev
   ```

5. **Build for production**
   ```bash
   npm run electron-pack
   ```

## Usage Guide

### 1. Authentication
- Sign in with Google account OR email/password
- Create new account with email registration
- All data is securely stored in your personal Firebase space

### 2. Investigation Builder
- Enter target person's information (name, username, email, etc.)
- Add context (location, workplace, school)
- Use operators (sites, file types, URL/title contains)
- Select from preset templates for common scenarios
- Generate optimized search queries

### 3. Link Scanner
- Advanced link detection across multiple platforms
- Accuracy scoring and match probability analysis
- Filter by platform, confidence level, and verification status
- OSINT data extraction for each discovered link

### 4. Profile Analyzer
- Input social media profile URLs
- Get privacy risk assessment
- Find connected profiles across platforms
- Receive security recommendations

### 5. OSINT Tools Arsenal
- Access 25+ integrated professional OSINT tools
- Organized by categories: General, People, Social Media, Email, Images, Domains
- Direct integration with search queries
- Bulk search functionality across multiple tools

### 6. Built-in Browser
- Access via "Browser" button in navigation
- Opens Google/Bing/DuckDuckGo results directly
- Maintains session across searches

## Search Query Examples

### Basic Person Search
```
"John Smith" "San Francisco" site:linkedin.com
```

### Resume Hunting
```
"Jane Doe" filetype:pdf intitle:resume
```

### Developer Profile
```
"johndoe" site:github.com OR site:stackoverflow.com
```

### Social Media Sweep
```
"John Smith" (site:twitter.com OR site:facebook.com OR site:instagram.com)
```

### Contact Information
```
"John Smith" "email" OR "contact" OR "phone"
```

## Security & Ethics

⚠️ **IMPORTANT**: This tool is for legitimate investigations only.

### Ethical Use Guidelines
- Only investigate with legitimate purpose
- Follow local laws and platform Terms of Service
- Respect privacy and data protection regulations
- No stalking, harassment, or doxxing
- Use for professional/educational purposes only

### Security Features
- Local data encryption
- Secure Firebase authentication
- No data shared with third parties
- Audit trails for investigations

## Project Structure

```
infoscope-osint/
├── public/
│   ├── electron.js          # Main Electron process
│   ├── preload.js          # Electron preload script
│   └── index.html          # HTML template
├── src/
│   ├── components/         # React components
│   │   ├── AuthScreen.js   # Google authentication
│   │   ├── Dashboard.js    # Main dashboard
│   │   ├── Investigation.js # OSINT query builder
│   │   ├── ProfileAnalyzer.js # Profile analysis tool
│   │   └── Navigation.js   # App navigation
│   ├── firebase.js         # Firebase configuration
│   ├── App.js             # Main React app
│   └── index.js           # React entry point
└── package.json           # Dependencies and scripts
```

## 🔗 Developer Information

**Created by:** [Ivo Pereira](https://ivocreates.site/)  
**GitHub:** [@ivocreates](https://github.com/ivocreates)  
**Website:** [ivocreates.site](https://ivocreates.site/)

### 💖 Support Development

InfoScope OSINT is free and open source. Your support helps maintain the project and add new features:

- **💳 UPI (India):** `ivopereiraix3@oksbi`
- **🌍 Razorpay (Global):** [razorpay.me/@inovix](https://razorpay.me/@ivocreates)
- **⭐ GitHub:** Star the repository to show appreciation
- **🤝 Contribute:** Submit PRs, report bugs, suggest features

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Optional: Tor Browser for enhanced anonymity

### Installation
```bash
# Clone the repository
git clone https://github.com/ivocreates/InfoScape.git
cd InfoScape

# Install dependencies
npm install
```

## 🖥️ Running the Application

### Desktop Application (Full Features)
```bash
npm run electron-dev      # Development mode with hot reload
npm run electron-pack     # Build for current platform
npm run electron-pack-win # Build Windows installer
npm run electron-pack-mac # Build macOS DMG
npm run electron-pack-linux # Build Linux AppImage
npm run package           # Build for all platforms
```

### Web Application (Browser Access)  
```bash
npm start                 # React dev server (http://localhost:3000)
npm run build            # Production build for deployment
npm run serve            # Serve production build locally
npm run deploy           # Deploy to Firebase hosting
```

### Live Deployment
- **Production Web App**: [infoscope-osint.web.app](https://infoscope-osint.web.app)
- **Firebase Console**: [console.firebase.google.com/project/infoscope-osint](https://console.firebase.google.com/project/infoscope-osint/overview)
- **GitHub Repository**: [github.com/ivocreates/InfoScope](https://github.com/ivocreates/InfoScope)

### Progressive Web App (PWA)
1. Visit [infoscope-osint.web.app](https://infoscope-osint.web.app) in Chrome/Edge/Safari
2. Click the "Install" icon in the address bar
3. Or use the "Install App" button in the About section

## 📱 Platform Support

| Platform | Desktop App | Web App | PWA Install | Tor Integration |
|----------|------------|---------|-------------|-----------------|
| Windows  | ✅ NSIS    | ✅      | ✅          | ✅             |
| macOS    | ✅ DMG     | ✅      | ✅          | ✅             |
| Linux    | ✅ AppImage| ✅      | ✅          | ✅             |
| Android  | ➖         | ✅      | ✅          | ➖             |
| iOS      | ➖         | ✅      | ✅          | ➖             |

## Available Scripts

- `npm start` - React development server (web app)
- `npm run build` - Build React app for production  
- `npm run electron-dev` - Electron app with development server
- `npm run electron-pack` - Package Electron app for distribution
- `npm run serve` - Serve production build locally

## Keyboard Shortcuts

- `Ctrl/Cmd + N` - New Investigation
- `Ctrl/Cmd + S` - Save Investigation  
- `Ctrl/Cmd + B` - Open Browser
- `Ctrl/Cmd + Q` - Quit Application

## Supported Platforms for Analysis

- LinkedIn profiles
- GitHub repositories  
- Social media (Twitter/X, Facebook, Instagram)
- Professional networks
- Academic platforms
- Public documents and resumes

## Contributing

This is a professional OSINT tool. Contributions should focus on:
- Improving search accuracy
- Adding new platforms
- Enhancing security features
- Better data visualization
- Performance optimizations

## Legal Disclaimer

Users are responsible for complying with:
- Local privacy and data protection laws
- Platform Terms of Service
- Professional ethics guidelines
- Applicable investigation regulations

The developers assume no liability for misuse of this tool.

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review documentation
3. Create detailed issue report

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built for OSINT professionals, researchers, and security analysts who need efficient person intelligence gathering capabilities.**
