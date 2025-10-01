// Subscription Service for InfoScope OSINT Platform v2.3.0
// Premium subscription management with Razorpay integration

import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

class SubscriptionService {
  constructor() {
    this.razorpayKeyId = process.env.REACT_APP_RAZORPAY_KEY_ID;
    this.user = null;
    this.subscription = null;
    this.listeners = [];
    
    // Initialize Razorpay
    this.loadRazorpayScript();
  }

  // Subscription Plans - Most features free, only charge for storage/export
  static PLANS = {
    FREE: {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'INR',
      interval: 'lifetime',
      features: [
        '✅ All OSINT Investigation Tools',
        '✅ IP Intelligence (Unlimited)',
        '✅ Email Analysis (Unlimited)',
        '✅ Domain Research (Unlimited)',
        '✅ Social Media Intelligence',
        '✅ Phone Lookup (Unlimited)',
        '✅ Geolocation Services',
        '✅ Built-in Secure Browser',
        '✅ Real-time API Integrations',
        '✅ Basic Export (JSON, CSV)',
        '📦 Data Storage (5MB)',
        '📧 Community Support'
      ],
      limits: {
        daily_requests: 'unlimited',
        monthly_requests: 'unlimited',
        export_formats: ['json'],
        api_access: 'full',
        storage: '10MB',
        max_exports_per_month: 10,
        investigation_history: 50,
        support: 'community'
      },
      color: 'gray'
    },
    PREMIUM: {
      id: 'premium',
      name: 'Premium',
      price: 49,
      currency: 'INR',
      interval: 'month',
      features: [
        '✅ Everything in Free Plan',
        '🚀 Premium Export Formats (PDF, DOC, XLSX)',
        '📊 Professional Report Templates',
        '💾 Enhanced Data Storage (50MB)',
        '🔄 Unlimited Exports',
        '🎨 Custom Report Branding',
        '📈 Advanced Analytics Dashboard',
        '⚡ Priority Email Support',
        '📱 Export via Mobile App',
        '🔐 Extended History (500 records)'
      ],
      limits: {
        daily_requests: 'unlimited',
        monthly_requests: 'unlimited',
        export_formats: ['json', 'csv', 'pdf', 'docx', 'xlsx', 'xml'],
        api_access: 'full',
        storage: '50MB',
        max_exports_per_month: 'unlimited',
        investigation_history: 500,
        support: 'priority'
      },
      color: 'blue',
      popular: true
    }
  };

  // Load Razorpay script
  async loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // Initialize user subscription
  async initializeUser(user) {
    this.user = user;
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // Create new user with free plan
        await this.createUserSubscription(user.uid, 'free');
      }
      
      // Listen to subscription changes
      this.subscribeToUserChanges(user.uid);
    }
  }

  // Create user subscription
  async createUserSubscription(userId, planId = 'free') {
    const plan = SubscriptionService.PLANS[planId.toUpperCase()];
    const subscription = {
      plan: planId,
      status: 'active',
      created_at: new Date().toISOString(),
      expires_at: planId === 'free' ? null : this.calculateExpiryDate(plan.interval),
      usage: {
        daily_requests: 0,
        monthly_requests: 0,
        last_reset: new Date().toISOString()
      },
      payment_history: []
    };

    await setDoc(doc(db, 'users', userId), {
      subscription,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    this.subscription = subscription;
    return subscription;
  }

  // Subscribe to user changes
  subscribeToUserChanges(userId) {
    const unsubscribe = onSnapshot(doc(db, 'users', userId), (doc) => {
      if (doc.exists()) {
        this.subscription = doc.data().subscription;
        this.notifyListeners();
      }
    });
    
    this.listeners.push(unsubscribe);
  }

  // Add listener for subscription changes
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(listener => {
      if (typeof listener === 'function') {
        listener(this.subscription);
      }
    });
  }

  // Calculate expiry date
  calculateExpiryDate(interval) {
    const now = new Date();
    switch (interval) {
      case 'month':
        return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
      default:
        return null;
    }
  }

  // Get current subscription
  getCurrentSubscription() {
    return this.subscription;
  }

  // Get current plan
  getCurrentPlan() {
    if (!this.subscription) return SubscriptionService.PLANS.FREE;
    return SubscriptionService.PLANS[this.subscription.plan.toUpperCase()] || SubscriptionService.PLANS.FREE;
  }

  // Check if user has feature access
  hasFeatureAccess(feature) {
    const plan = this.getCurrentPlan();
    return plan.features.some(f => f.toLowerCase().includes(feature.toLowerCase()));
  }

  // Check export format access
  canExportFormat(format) {
    const plan = this.getCurrentPlan();
    return plan.limits.export_formats.includes(format.toLowerCase());
  }

  // Check request limits
  async checkRequestLimit() {
    if (!this.subscription) return false;
    
    const plan = this.getCurrentPlan();
    if (plan.limits.daily_requests === 'unlimited') return true;
    
    const now = new Date();
    const today = now.toDateString();
    const lastReset = new Date(this.subscription.usage.last_reset).toDateString();
    
    // Reset daily counter if new day
    if (today !== lastReset) {
      await this.resetDailyUsage();
      return true;
    }
    
    return this.subscription.usage.daily_requests < plan.limits.daily_requests;
  }

  // Increment request count
  async incrementRequestCount() {
    if (!this.user || !this.subscription) return;
    
    const plan = this.getCurrentPlan();
    if (plan.limits.daily_requests === 'unlimited') return;
    
    const newUsage = {
      daily_requests: this.subscription.usage.daily_requests + 1,
      monthly_requests: this.subscription.usage.monthly_requests + 1,
      last_reset: this.subscription.usage.last_reset
    };
    
    await updateDoc(doc(db, 'users', this.user.uid), {
      'subscription.usage': newUsage,
      updated_at: new Date().toISOString()
    });
  }

  // Reset daily usage
  async resetDailyUsage() {
    if (!this.user) return;
    
    const newUsage = {
      daily_requests: 0,
      monthly_requests: this.subscription.usage.monthly_requests,
      last_reset: new Date().toISOString()
    };
    
    await updateDoc(doc(db, 'users', this.user.uid), {
      'subscription.usage': newUsage,
      updated_at: new Date().toISOString()
    });
  }

  // Initiate payment
  async initiatePurchase(planId) {
    const plan = SubscriptionService.PLANS[planId.toUpperCase()];
    if (!plan || plan.price === 0) return false;
    
    const scriptLoaded = await this.loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Payment gateway not available');
    }
    
    const options = {
      key: this.razorpayKeyId,
      amount: plan.price * 100, // Amount in paise
      currency: plan.currency,
      name: 'InfoScope OSINT',
      description: `${plan.name} Plan Subscription`,
      image: '/logo192.png',
      handler: async (response) => {
        await this.handlePaymentSuccess(response, planId);
      },
      prefill: {
        name: this.user?.displayName || '',
        email: this.user?.email || '',
        contact: ''
      },
      notes: {
        plan_id: planId,
        user_id: this.user?.uid
      },
      theme: {
        color: '#2563EB'
      },
      modal: {
        ondismiss: () => {
          console.log('Payment cancelled');
        }
      }
    };
    
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  }

  // Handle payment success
  async handlePaymentSuccess(response, planId) {
    try {
      const plan = SubscriptionService.PLANS[planId.toUpperCase()];
      const paymentData = {
        payment_id: response.razorpay_payment_id,
        amount: plan.price,
        currency: plan.currency,
        plan_id: planId,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      
      // Update subscription
      const subscription = {
        plan: planId,
        status: 'active',
        created_at: this.subscription?.created_at || new Date().toISOString(),
        expires_at: this.calculateExpiryDate(plan.interval),
        usage: {
          daily_requests: 0,
          monthly_requests: 0,
          last_reset: new Date().toISOString()
        },
        payment_history: [
          ...(this.subscription?.payment_history || []),
          paymentData
        ]
      };
      
      await updateDoc(doc(db, 'users', this.user.uid), {
        subscription,
        updated_at: new Date().toISOString()
      });
      
      // Show success message
      this.showSuccessMessage(plan.name);
      
      return true;
    } catch (error) {
      console.error('Payment processing failed:', error);
      this.showErrorMessage('Payment processing failed');
      return false;
    }
  }

  // Show success message
  showSuccessMessage(planName) {
    // This would typically trigger a toast or modal
    console.log(`Successfully upgraded to ${planName} plan!`);
  }

  // Show error message
  showErrorMessage(message) {
    // This would typically trigger a toast or modal
    console.error(message);
  }

  // Get usage stats
  getUsageStats() {
    if (!this.subscription) return null;
    
    const plan = this.getCurrentPlan();
    return {
      daily_requests: {
        used: this.subscription.usage.daily_requests,
        limit: plan.limits.daily_requests
      },
      monthly_requests: {
        used: this.subscription.usage.monthly_requests,
        limit: plan.limits.monthly_requests
      },
      storage: {
        used: '0MB', // Would be calculated based on actual usage
        limit: plan.limits.storage
      }
    };
  }

  // Check if subscription is expired
  isSubscriptionExpired() {
    if (!this.subscription || !this.subscription.expires_at) return false;
    return new Date(this.subscription.expires_at) < new Date();
  }

  // Cleanup
  cleanup() {
    this.listeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners = [];
  }
}

export default new SubscriptionService();