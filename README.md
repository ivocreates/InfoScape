# InfoScope OSINT - Desktop Application

A comprehensive desktop OSINT (Open Source Intelligence) application for person information lookup with built-in browser capabilities and advanced Google dorking techniques.

## Features

- **🔍 Advanced Search Query Builder**: Build precise Google dorks with visual interface
- **🌐 Built-in Browser**: Integrated browser for seamless investigation workflow  
- **🔐 Firebase Integration**: Secure cloud storage with Google authentication
- **📊 Profile Analyzer**: Analyze social media profiles and assess privacy risks
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
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom components

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

## Available Scripts

- `npm start` - Start React development server
- `npm run build` - Build React app for production
- `npm run electron` - Start Electron app
- `npm run electron-dev` - Start Electron in development mode
- `npm run electron-pack` - Package Electron app for distribution

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
