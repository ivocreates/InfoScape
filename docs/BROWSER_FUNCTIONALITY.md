# Enhanced Browser Functionality for OSINT Investigations

## Overview
InfoScape now supports multiple browser types with proxy/relay configurations specifically designed for OSINT investigations. This feature allows investigators to maintain anonymity and bypass restrictions while conducting research.

## Supported Browsers

### Built-in Browser
- **Description**: Electron-based browser integrated into InfoScape
- **Proxy Support**: No
- **Best For**: General investigations, quick access
- **Security**: Standard Chromium security

### Google Chrome
- **Description**: External Chrome browser with proxy support
- **Proxy Support**: Yes (HTTP, HTTPS, SOCKS4, SOCKS5)
- **Best For**: JavaScript-heavy sites, modern web applications
- **Security**: Standard browser security + proxy anonymization

### Mozilla Firefox
- **Description**: External Firefox browser with proxy support
- **Proxy Support**: Yes (HTTP, HTTPS, SOCKS4, SOCKS5)
- **Best For**: Privacy-focused investigations, add-on compatibility
- **Security**: Enhanced privacy features + proxy anonymization

### Microsoft Edge
- **Description**: External Edge browser with proxy support
- **Proxy Support**: Yes (HTTP, HTTPS, SOCKS4, SOCKS5)
- **Best For**: Windows-integrated investigations
- **Security**: Standard browser security + proxy anonymization

### Brave Browser
- **Description**: Privacy-focused browser with built-in Tor support
- **Proxy Support**: Yes + Built-in Tor mode
- **Best For**: Privacy-focused investigations, blocking trackers
- **Security**: Enhanced privacy + ad/tracker blocking + proxy/Tor

### Tor Browser
- **Description**: Anonymous browsing via Tor network
- **Proxy Support**: Built-in Tor network routing
- **Best For**: Maximum anonymity, bypassing censorship
- **Security**: Maximum anonymity through Tor network

## Proxy Configuration Options

### Quick Profiles

#### No Proxy
- **Type**: Direct connection
- **Speed**: Fast
- **Anonymity**: None
- **Use Case**: Internal investigations, trusted networks

#### Tor Network
- **Type**: SOCKS5 proxy (127.0.0.1:9050)
- **Speed**: Slow
- **Anonymity**: High
- **Use Case**: Anonymous investigations, bypassing restrictions

#### Custom Proxy
- **Type**: User-configurable
- **Speed**: Varies
- **Anonymity**: Depends on proxy
- **Use Case**: Corporate proxies, specific requirements

### Predefined Proxies

#### Tor SOCKS5
- **Address**: 127.0.0.1:9050
- **Type**: SOCKS5
- **Requirements**: Tor service running locally

#### Privoxy HTTP
- **Address**: 127.0.0.1:8118
- **Type**: HTTP
- **Requirements**: Privoxy service running locally

#### I2P HTTP Proxy
- **Address**: 127.0.0.1:4444
- **Type**: HTTP
- **Requirements**: I2P router running locally

## Usage Instructions

### Quick Launch
1. Select your preferred browser from the dropdown in the header
2. Click "Quick Launch" on any OSINT tool
3. Tool opens in the selected browser with default settings

### Advanced Configuration
1. Click the "Settings" icon (⚙️) next to "Quick Launch"
2. Choose your desired browser from the list
3. Configure proxy settings:
   - Select a quick profile (No Proxy, Tor Network, Custom)
   - Choose from predefined proxies
   - Configure custom proxy settings
4. Click "Launch Browser" to open the tool

### Browser Selection Modal Features
- **Browser Detection**: Automatically detects installed browsers
- **Proxy Profiles**: Quick configuration for common scenarios
- **Custom Settings**: Full control over proxy configuration
- **Security Warnings**: Alerts for proxy/Tor usage
- **Session-only**: Configuration applies to current session only

## Security Considerations

### Anonymity Levels
1. **No Proxy**: Direct connection (no anonymity)
2. **HTTP/HTTPS Proxy**: Basic IP masking
3. **SOCKS Proxy**: Better protocol support
4. **Tor Network**: Maximum anonymity (multiple hops)

### Best Practices
- **Legal Compliance**: Always follow local laws and regulations
- **Proxy Trust**: Only use trusted proxy servers
- **Target Awareness**: Some sites block proxy/Tor traffic
- **Speed Trade-offs**: Anonymity comes with reduced speed
- **Session Management**: Use different browsers for different investigations

### Warnings and Limitations
- Proxy/Tor browsing is slower than direct connections
- Some websites may block or restrict proxy traffic
- Ensure proxy servers are trustworthy and secure
- Always comply with local laws and website terms of service
- Configuration is session-only for security

## Technical Implementation

### Browser Detection
The system automatically detects available browsers on:
- **Windows**: Checks common installation paths
- **macOS**: Checks Applications folder
- **Linux**: Uses `which` command to check PATH

### Proxy Configuration
- **Chrome**: Uses `--proxy-server` command line argument
- **Firefox**: Requires profile configuration (simplified implementation)
- **Tor**: Uses existing Tor Browser installation
- **Built-in**: No proxy support (direct Chromium)

### Security Features
- Temporary user data directories for proxy sessions
- Incognito/private browsing mode enforcement
- Process isolation for external browsers
- No persistent proxy configuration storage

## Troubleshooting

### Browser Not Detected
- Verify browser is installed in standard location
- Check if browser executable is in system PATH
- Restart InfoScape after installing new browsers

### Proxy Connection Issues
- Verify proxy server is running and accessible
- Check firewall settings for proxy ports
- Ensure proxy credentials are correct (if required)
- Test proxy configuration in browser manually

### Tor Browser Issues
- Ensure Tor Browser is installed and configured
- Check that Tor service is running
- Verify Tor Browser path in system

### Performance Issues
- Proxy/Tor connections are inherently slower
- Try different proxy servers for better performance
- Use direct connection for time-sensitive investigations
- Monitor system resources during proxy usage

## Future Enhancements

### Planned Features
- **Proxy Profiles**: Save and manage proxy configurations
- **VPN Integration**: Direct VPN service integration
- **Browser Fingerprinting**: Additional anti-fingerprinting measures
- **Automated Rotation**: Automatic proxy rotation for investigations
- **Performance Monitoring**: Connection speed and reliability metrics

### Integration Opportunities
- **Investigation Logging**: Track which browsers/proxies were used
- **Compliance Reporting**: Document proxy usage for audits
- **Team Sharing**: Share proxy configurations across team members
- **API Integration**: Integration with commercial proxy services

This enhanced browser functionality significantly improves InfoScape's capabilities for professional OSINT investigations while maintaining focus on security, privacy, and legal compliance.