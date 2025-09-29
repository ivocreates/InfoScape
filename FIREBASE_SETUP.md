# Firebase Data Saving Configuration Guide

## Overview
This guide explains how to properly configure Firebase to save investigation data for the InfoScape OSINT application.

## Firebase Security Rules

### 1. Firestore Security Rules
The `firestore.rules` file contains comprehensive security rules that:

- **User Isolation**: Each user can only access their own data under `/users/{userId}/`
- **Authentication Required**: All operations require valid Firebase authentication
- **Data Validation**: Write operations validate required fields and data types
- **Collection-Specific Rules**:
  - `link_scans`: Link scanner results with validation for query, results, userId, and createdAt
  - `profiles`: Profile analysis results with validation for url, platform, userId, and createdAt
  - `investigations`: Investigation cases with status validation (active/completed/archived)
  - `investigation_scans`: Scans linked to specific investigations

### 2. Data Structure

#### Link Scans (`/users/{userId}/link_scans/{scanId}`)
```javascript
{
  query: string,           // Search query used
  results: array,          // Array of found links
  totalFound: number,      // Total links found before filtering
  filteredCount: number,   // Links after applying filters
  filters: object,         // Applied filter settings
  scanType: 'osint_link_scan',
  investigationId: string|null,  // Optional investigation ID
  userId: string,          // User who performed scan
  createdAt: timestamp,    // When scan was performed
  metadata: {
    scanDuration: number,
    platformsCovered: array,
    accuracyThreshold: number,
    toolVersion: string,
    timestamp: number,
    userAgent: string,
    sessionId: string
  }
}
```

#### Profile Analysis (`/users/{userId}/profiles/{profileId}`)
```javascript
{
  url: string,            // Analyzed profile URL
  platform: string,       // Platform name (LinkedIn, Twitter, etc.)
  profile: object,        // Profile information
  socialLinks: array,     // Associated social media links
  riskScore: number,      // Risk assessment score (0-100)
  riskLevel: string,      // Risk level (Low/Medium/High Risk)
  flags: array,          // Analysis flags and warnings
  recommendations: array, // Security recommendations
  scanType: 'profile_analysis',
  investigationId: string|null,  // Optional investigation ID
  userId: string,         // User who performed analysis
  createdAt: timestamp,   // When analysis was performed
  metadata: {
    analysisDate: string,
    dataPoints: number,
    confidence: string,
    sources: array,
    investigationId: string,
    toolVersion: string,
    userAgent: string,
    sessionId: string,
    analysisVersion: string
  }
}
```

#### Investigations (`/users/{userId}/investigations/{investigationId}`)
```javascript
{
  title: string,          // Investigation title
  description: string,    // Investigation description
  targetName: string,     // Primary target name
  type: string,          // 'link_investigation' or 'profile_investigation'
  tags: array,           // Array of tags ['osint', 'link_analysis', etc.]
  priority: string,      // 'low', 'medium', 'high'
  status: string,        // 'active', 'completed', 'archived'
  userId: string,        // Investigation owner
  createdAt: timestamp,  // Creation date
  updatedAt: timestamp,  // Last update date
  lastActivity: timestamp, // Last scan activity
  lastScanType: string,  // Type of last scan performed
  version: number        // Investigation version for updates
}
```

#### Investigation Scans (`/users/{userId}/investigation_scans/{scanId}`)
```javascript
{
  investigationId: string,  // Parent investigation ID
  scanType: string,        // 'link_scan' or 'profile_analysis'
  data: object,           // Complete scan data (same structure as above)
  userId: string,         // User who performed scan
  createdAt: timestamp    // When scan was performed
}
```

## Deployment Steps

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Initialize Firebase Project
```bash
firebase login
firebase init
```
Select:
- Firestore: Configure security rules and indexes
- Functions: (Optional) For server-side processing
- Hosting: For web deployment
- Storage: For file uploads (if needed)

### 3. Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

### 4. Deploy the Application
```bash
# Build the React app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### 5. Configure Firebase Project Settings
1. Go to Firebase Console
2. Select your project
3. Go to Authentication > Settings
4. Configure authorized domains
5. Set up authentication providers (Email/Password, Google, etc.)

## Testing Data Saving

### 1. Verify Authentication
```javascript
// Check if user is authenticated before saving
if (!auth.currentUser) {
  throw new Error('User must be authenticated');
}
```

### 2. Test Link Scanner Data Saving
```javascript
// LinkScanner component automatically saves via investigationService
const scanData = await investigationService.saveLinkScan(scanData, investigationId);
console.log('Saved scan:', scanData.id);
```

### 3. Test Profile Analysis Data Saving
```javascript
// ProfileAnalyzer component automatically saves via investigationService
const analysisData = await investigationService.saveProfileAnalysis(analysisData, investigationId);
console.log('Saved analysis:', analysisData.id);
```

### 4. Verify Data in Firebase Console
1. Go to Firestore Database in Firebase Console
2. Navigate to: `users > {userId} > link_scans` or `profiles`
3. Verify that documents are being created with correct structure

## Common Issues and Solutions

### Issue 1: Permission Denied
**Cause**: User not authenticated or trying to access another user's data
**Solution**: Ensure `auth.currentUser` is valid and userId matches

### Issue 2: Missing Required Fields
**Cause**: Required fields not provided in data structure
**Solution**: Ensure all required fields are included:
- Link scans: query, results, userId, createdAt
- Profile analysis: url, platform, userId, createdAt

### Issue 3: Invalid Data Types
**Cause**: Data types don't match security rule validation
**Solution**: Verify data types match the expected structure

### Issue 4: Network/Connection Issues
**Cause**: Firebase connection problems
**Solution**: 
- Check Firebase configuration in `src/firebase.js`
- Verify API keys and project settings
- Check network connectivity

## Monitoring and Debugging

### Enable Firestore Debug Logging
```javascript
// Add to src/firebase.js for debugging
import { connectFirestoreEmulator } from 'firebase/firestore';

// For development only
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

### Check Browser Network Tab
1. Open browser DevTools
2. Go to Network tab
3. Filter by "firestore" or "firebase"
4. Check for failed requests

### Firebase Console Logs
1. Go to Firebase Console > Firestore > Usage
2. Check for error rates and failed operations
3. Review security rule evaluations

## Best Practices

1. **Always validate data** before saving to Firestore
2. **Use proper error handling** in all database operations
3. **Implement offline support** for better user experience
4. **Regular security rule audits** to ensure data protection
5. **Monitor usage** to prevent hitting Firebase quotas
6. **Use batch operations** for multiple related writes
7. **Implement data cleanup** for old/unnecessary documents

## Performance Optimization

1. **Use indexes** for frequently queried fields
2. **Limit query results** to prevent large data transfers
3. **Implement pagination** for large result sets
4. **Cache frequently accessed data** locally
5. **Use subcollections** for better data organization

## Security Checklist

- [ ] Security rules deployed and tested
- [ ] Authentication required for all operations
- [ ] User can only access their own data
- [ ] Required fields validated on write
- [ ] Data types properly validated
- [ ] No public read/write access
- [ ] API keys properly secured
- [ ] CORS settings configured correctly