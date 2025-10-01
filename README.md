# InfoScope OSINT - Professional Investigation Platform

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/ivocreates/InfoScope)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Firebase Hosting](https://img.shields.io/badge/Firebase-Hosting-orange.svg)](https://infoscope-osint.web.app)

## 🌐 **Quick Access**

| Platform | Link | Description |
|----------|------|-------------|
| **🌐 Web App** | **[infoscope-osint.web.app](https://infoscope-osint.web.app)** | Instant access - no installation required |
| **📱 PWA Install** | [Install Guide](https://infoscope-osint.web.app) | Add to home screen on mobile/desktop |
| **💻 Desktop** | [GitHub Releases](https://github.com/ivocreates/InfoScope/releases) | Windows, macOS, Linux packages |
| **📋 Source** | [GitHub Repository](https://github.com/ivocreates/InfoScope) | Full source code and documentation |

A comprehensive OSINT (Open Source Intelligence) investigation platform that combines advanced research tools with privacy-focused browsing capabilities. Available as both desktop application and web app with PWA support. Built for cybersecurity professionals, journalists, researchers, and digital investigators.

## 🚀 Key Features

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
