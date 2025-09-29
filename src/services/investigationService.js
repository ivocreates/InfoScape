import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs, 
  doc, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase';

// Investigation data management service
class InvestigationService {
  constructor() {
    this.userId = null;
    this.investigations = [];
  }

  // Initialize with current user
  init() {
    console.log('InvestigationService.init() called');
    console.log('auth.currentUser:', auth.currentUser);
    
    if (!auth.currentUser) {
      console.error('User must be authenticated to use investigation service');
      return false;
    }
    this.userId = auth.currentUser.uid;
    console.log('User ID set to:', this.userId);
    
    if (!this.userId) {
      console.error('Unable to get user ID - authentication required');
      return false;
    }
    return true;
  }

  // Create a new investigation case
  async createInvestigation(investigationData) {
    console.log('createInvestigation called with:', investigationData);
    
    if (!this.init()) {
      throw new Error('Authentication required to create investigation');
    }
    
    console.log('Creating investigation for user:', this.userId);
    
    const docData = {
      ...investigationData,
      userId: this.userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active',
      version: 1
    };

    console.log('Document data to save:', docData);
    
    try {
      const docRef = await addDoc(collection(db, `users/${this.userId}/investigations`), docData);
      console.log('Investigation created successfully with ID:', docRef.id);
      return { id: docRef.id, ...docData };
    } catch (error) {
      console.error('Error creating investigation:', error);
      throw error;
    }
  }

  // Update an existing investigation
  async updateInvestigation(investigationId, updateData) {
    this.init();
    
    const docRef = doc(db, `users/${this.userId}/investigations`, investigationId);
    const updatePayload = {
      ...updateData,
      updatedAt: serverTimestamp(),
      version: (updateData.version || 1) + 1
    };

    await updateDoc(docRef, updatePayload);
    return updatePayload;
  }

  // Add scan data to investigation
  async addScanToInvestigation(investigationId, scanType, scanData) {
    this.init();
    
    const scanRecord = {
      investigationId,
      scanType, // 'link_scan' or 'profile_analysis'
      data: scanData,
      userId: this.userId,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, `users/${this.userId}/investigation_scans`), scanRecord);
    
    // Update investigation with latest activity
    await this.updateInvestigation(investigationId, {
      lastActivity: serverTimestamp(),
      lastScanType: scanType
    });

    return { id: docRef.id, ...scanRecord };
  }

  // Save link scan with investigation context
  async saveLinkScan(scanData, investigationId = null) {
    try {
      if (!this.init()) {
        throw new Error('Authentication required to save link scan');
      }
      
      // Validate required data
      if (!scanData.query || !scanData.results) {
        throw new Error('Missing required scan data: query and results are required');
      }
      
      const enrichedData = {
        ...scanData,
        scanType: 'link_scan',
        userId: this.userId,
        createdAt: serverTimestamp(),
        investigationId: investigationId || null,
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          sessionId: this.generateSessionId(),
          ipAddress: 'client-side', // Would need backend for real IP
          ...scanData.metadata
        }
      };

      // Save to main scans collection
      const scanRef = await addDoc(collection(db, `users/${this.userId}/link_scans`), enrichedData);
      
      // If part of investigation, also save to investigation scans
      if (investigationId) {
        await this.addScanToInvestigation(investigationId, 'link_scan', enrichedData);
      }

      console.log('Link scan saved successfully:', scanRef.id);
      return { id: scanRef.id, ...enrichedData };
    } catch (error) {
      console.error('Error saving link scan:', error);
      throw new Error(`Failed to save link scan: ${error.message}`);
    }
  }

  // Save profile analysis with investigation context
  async saveProfileAnalysis(analysisData, investigationId = null) {
    try {
      if (!this.init()) {
        throw new Error('Authentication required to save profile analysis');
      }
      
      // Validate required data
      if (!analysisData.url || !analysisData.platform) {
        throw new Error('Missing required analysis data: url and platform are required');
      }
      
      const enrichedData = {
        ...analysisData,
        scanType: 'profile_analysis',
        userId: this.userId,
        createdAt: serverTimestamp(),
        investigationId: investigationId || null,
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          sessionId: this.generateSessionId(),
          analysisVersion: '2.0',
          ...analysisData.metadata
        }
      };

      // Save to main profiles collection
      const profileRef = await addDoc(collection(db, `users/${this.userId}/profiles`), enrichedData);
      
      // If part of investigation, also save to investigation scans
      if (investigationId) {
        await this.addScanToInvestigation(investigationId, 'profile_analysis', enrichedData);
      }

      console.log('Profile analysis saved successfully:', profileRef.id);
      return { id: profileRef.id, ...enrichedData };
    } catch (error) {
      console.error('Error saving profile analysis:', error);
      throw new Error(`Failed to save profile analysis: ${error.message}`);
    }
  }

  // Get all investigations for current user
  async getInvestigations() {
    if (!this.init()) {
      throw new Error('Authentication required to get investigations');
    }
    
    const q = query(
      collection(db, `users/${this.userId}/investigations`),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));
  }

  // Get investigation scans
  async getInvestigationScans(investigationId) {
    this.init();
    
    const q = query(
      collection(db, `users/${this.userId}/investigation_scans`),
      where('investigationId', '==', investigationId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  }

  // Get recent scans
  async getRecentScans(scanType = null, limitCount = 10) {
    this.init();
    
    let q;
    if (scanType) {
      q = query(
        collection(db, `users/${this.userId}/${scanType === 'link_scan' ? 'link_scans' : 'profiles'}`),
        where('userId', '==', this.userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    } else {
      // Get mixed results - this would need a composite query or separate calls
      q = query(
        collection(db, `users/${this.userId}/link_scans`),
        where('userId', '==', this.userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  }

  // Generate session ID for tracking
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Search investigations
  async searchInvestigations(searchQuery) {
    this.init();
    
    const q = query(
      collection(db, `users/${this.userId}/investigations`),
      where('userId', '==', this.userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const investigations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));

    // Client-side filtering (could be improved with better Firestore queries)
    return investigations.filter(inv => 
      inv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.targetName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Delete investigation
  async deleteInvestigation(investigationId) {
    this.init();
    
    const docRef = doc(db, `users/${this.userId}/investigations`, investigationId);
    await deleteDoc(docRef);
    
    // Also delete associated scans
    const scansQuery = query(
      collection(db, `users/${this.userId}/investigation_scans`),
      where('investigationId', '==', investigationId)
    );
    
    const scansSnapshot = await getDocs(scansQuery);
    const deletePromises = scansSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return true;
  }

  // Export investigation data
  async exportInvestigation(investigationId) {
    this.init();
    
    const investigations = await this.getInvestigations();
    const investigation = investigations.find(inv => inv.id === investigationId);
    
    if (!investigation) {
      throw new Error('Investigation not found');
    }

    const scans = await this.getInvestigationScans(investigationId);
    
    return {
      investigation,
      scans,
      exportDate: new Date().toISOString(),
      totalScans: scans.length,
      summary: {
        linkScans: scans.filter(s => s.scanType === 'link_scan').length,
        profileAnalyses: scans.filter(s => s.scanType === 'profile_analysis').length
      }
    };
  }

  // Get investigation statistics
  async getInvestigationStats() {
    this.init();
    
    const investigations = await this.getInvestigations();
    const linkScans = await this.getRecentScans('link_scan', 100);
    const profileScans = await this.getRecentScans('profile_analysis', 100);
    
    return {
      totalInvestigations: investigations.length,
      activeInvestigations: investigations.filter(inv => inv.status === 'active').length,
      totalLinkScans: linkScans.length,
      totalProfileAnalyses: profileScans.length,
      recentActivity: {
        lastWeek: [
          ...linkScans.filter(scan => this.isWithinDays(scan.createdAt, 7)),
          ...profileScans.filter(scan => this.isWithinDays(scan.createdAt, 7))
        ].length,
        lastMonth: [
          ...linkScans.filter(scan => this.isWithinDays(scan.createdAt, 30)),
          ...profileScans.filter(scan => this.isWithinDays(scan.createdAt, 30))
        ].length
      }
    };
  }

  // Helper function to check if date is within specified days
  isWithinDays(date, days) {
    const now = new Date();
    const pastDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    return date && new Date(date) >= pastDate;
  }
}

// Export singleton instance
export const investigationService = new InvestigationService();
export default investigationService;