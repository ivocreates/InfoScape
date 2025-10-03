# InfoScope OSINT Platform - Desktop Build Guide

## Overview
This guide provides comprehensive instructions for building InfoScope OSINT Platform v2.3.0 for desktop distribution across Windows, macOS, and Linux platforms.

## Prerequisites

### Required Software
- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: For version control and dependency management

### Platform-Specific Requirements

#### Windows
- **Windows 10/11** (recommended)
- **Windows SDK** (for native dependencies)
- **Visual Studio Build Tools** (C++ build tools)

#### macOS
- **macOS 10.14** or higher
- **Xcode Command Line Tools**: `xcode-select --install`
- **Apple Developer Account** (for code signing and notarization)

#### Linux
- **Ubuntu 18.04+**, **Fedora 30+**, or equivalent
- **Required packages**:
  ```bash
  sudo apt-get install -y git nodejs npm python3 make g++ libnss3-dev libgconf-2-4
  ```

## Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/ivocreates/InfoScope.git
cd InfoScope
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Verify Installation
```bash
npm run electron-dev
```

## Build Commands

### Development Testing
```bash
# Start React development server
npm start

# Run Electron in development mode
npm run electron-dev

# Build React app only
npm run build
```

### Production Builds

#### All Platforms (Cross-Platform)
```bash
# Build for all platforms (requires appropriate OS or CI/CD)
npm run electron-pack-all
```

#### Platform-Specific Builds

##### Windows
```bash
# Build Windows installers (NSIS, MSI, Portable)
npm run electron-pack-win
```
**Output formats:**
- `InfoScope-OSINT-Platform-v2.3.0-Setup-2.3.0-x64.exe` (NSIS Installer)
- `InfoScope-OSINT-Platform-v2.3.0-2.3.0-x64.msi` (MSI Installer)
- `InfoScope-OSINT-Platform-v2.3.0-2.3.0-x64.exe` (Portable)

##### macOS
```bash
# Build macOS applications (DMG, ZIP)
npm run electron-pack-mac
```
**Output formats:**
- `InfoScope-OSINT-Platform-v2.3.0-2.3.0-x64.dmg` (Intel Macs)
- `InfoScope-OSINT-Platform-v2.3.0-2.3.0-arm64.dmg` (Apple Silicon)
- `InfoScope-OSINT-Platform-v2.3.0-2.3.0-x64.zip` (Intel Archive)
- `InfoScope-OSINT-Platform-v2.3.0-2.3.0-arm64.zip` (Apple Silicon Archive)

##### Linux
```bash
# Build Linux packages (AppImage, DEB, RPM, TAR.GZ)
npm run electron-pack-linux
```
**Output formats:**
- `InfoScope-OSINT-Platform-v2.3.0-2.3.0-x64.AppImage` (Universal)
- `InfoScope-OSINT-Platform-v2.3.0-2.3.0-amd64.deb` (Debian/Ubuntu)
- `InfoScope-OSINT-Platform-v2.3.0-2.3.0-x86_64.rpm` (Red Hat/Fedora)
- `InfoScope-OSINT-Platform-v2.3.0-2.3.0-x64.tar.gz` (Archive)

## Build Configuration

### Electron Builder Settings
The build configuration is defined in `package.json` under the `"build"` section:

#### Key Features
- **Multi-architecture support**: x64, ia32, arm64
- **Auto-updater integration**: GitHub releases
- **Code signing ready**: Windows/macOS certificates
- **Custom installer options**: NSIS, MSI, DMG
- **Linux desktop integration**: .desktop files, categories

#### Output Directory
All build artifacts are placed in the `dist/` directory:
```
dist/
├── win-unpacked/          # Windows unpacked
├── mac/                   # macOS unpacked
├── linux-unpacked/        # Linux unpacked
├── InfoScope-*.exe        # Windows installers
├── InfoScope-*.dmg        # macOS disk images
├── InfoScope-*.AppImage   # Linux AppImages
├── InfoScope-*.deb        # Debian packages
└── InfoScope-*.rpm        # RPM packages
```

## Code Signing & Distribution

### Windows Code Signing
1. **Obtain Code Signing Certificate**
   - Purchase from DigiCert, Sectigo, or similar CA
   - Or use self-signed for internal distribution

2. **Configure Signing**
   ```json
   "win": {
     "certificateFile": "path/to/certificate.p12",
     "certificatePassword": "password",
     "signingHashAlgorithms": ["sha256"]
   }
   ```

### macOS Code Signing & Notarization
1. **Apple Developer Account Required**
2. **Configure certificates**:
   ```json
   "mac": {
     "identity": "Developer ID Application: Your Name",
     "hardenedRuntime": true,
     "entitlements": "assets/entitlements.mac.plist"
   }
   ```

3. **Notarization** (automatic with proper setup):
   ```bash
   export APPLE_ID="your-apple-id@email.com"
   export APPLE_ID_PASSWORD="app-specific-password"
   npm run electron-pack-mac
   ```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Build and Release
on:
  push:
    tags: ['v*']

jobs:
  build:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    runs-on: ${{ matrix.os }}
    
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - run: npm ci
    - run: npm run build
    
    - name: Build Windows
      if: matrix.os == 'windows-latest'
      run: npm run electron-pack-win
    
    - name: Build macOS
      if: matrix.os == 'macos-latest'
      run: npm run electron-pack-mac
    
    - name: Build Linux
      if: matrix.os == 'ubuntu-latest'
      run: npm run electron-pack-linux
    
    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: dist-${{ matrix.os }}
        path: dist/
```

## Distribution Options

### 1. GitHub Releases
- Automatic uploads with `electron-builder`
- Download links for all platforms
- Version management and changelogs

### 2. Microsoft Store (Windows)
- Additional configuration required
- UWP packaging needed

### 3. Mac App Store
- Requires additional entitlements
- Sandbox compliance needed

### 4. Linux Package Repositories
- Submit to Flathub (Flatpak)
- Ubuntu PPA
- AUR (Arch User Repository)

## Security Considerations

### Content Security Policy
```javascript
// In electron.js
session.defaultSession.webSecurity = true;
```

### Secure Defaults
- **Node integration disabled** in renderer
- **Context isolation enabled**
- **Preload scripts** for safe API access
- **External URL handling** via system browser

## Troubleshooting

### Common Build Issues

#### Windows
```bash
# Visual Studio Build Tools missing
npm install --global windows-build-tools

# Node-gyp issues
npm install --global node-gyp
npm config set msvs_version 2019
```

#### macOS
```bash
# Xcode tools missing
xcode-select --install

# Python issues
npm config set python $(which python3)
```

#### Linux
```bash
# Missing dependencies
sudo apt-get install -y build-essential libnss3-dev libatk-bridge2.0-dev libdrm2 libgtk-3-dev
```

### Build Optimization

#### Reduce Bundle Size
```json
"build": {
  "compression": "maximum",
  "nsis": {
    "oneClick": false,
    "artifactName": "${productName}-${version}.${ext}"
  }
}
```

#### Exclude Development Dependencies
```json
"files": [
  "!node_modules/electron-builder",
  "!node_modules/concurrently",
  "!**/*.map"
]
```

## Performance Testing

### Startup Time Testing
```bash
# Measure cold start time
time ./dist/InfoScope-OSINT-Platform-v2.3.0-x64.AppImage
```

### Memory Usage Monitoring
```bash
# Monitor resource usage
top -p $(pgrep -f InfoScope)
```

## Legal & Compliance

### License Information
- **License**: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
- **Third-party licenses**: Automatically included in builds
- **Attribution requirements**: Maintained in About section

### Export Compliance
- **OSINT tools**: Generally unrestricted
- **Encryption**: Standard web crypto APIs
- **International distribution**: Review local regulations

## Support & Updates

### Auto-Update Configuration
```json
"publish": {
  "provider": "github",
  "owner": "ivocreates",
  "repo": "InfoScope",
  "releaseType": "release"
}
```

### Manual Update Process
1. Download latest release
2. Uninstall previous version (optional)
3. Install new version
4. Data migration (automatic)

## Version History

- **v2.3.0**: Current release with enhanced AI integration
- **v2.2.x**: OSINT tools expansion
- **v2.1.x**: Investigation framework
- **v2.0.x**: Complete rewrite with modern stack

## Contact & Contribution

- **Author**: Ivo Pereira (ivo@ivocreates.gmail.com)
- **Website**: https://ivocreates.site
- **Repository**: https://github.com/ivocreates/InfoScope
- **Issues**: GitHub Issues tracker

---

For additional help, consult the main README.md or create an issue on GitHub.