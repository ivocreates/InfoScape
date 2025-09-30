import React, { useState, useEffect } from 'react';
import {
  Database,
  Crown,
  Check,
  X,
  CreditCard,
  Shield,
  Zap,
  Users,
  Download,
  Upload,
  BarChart3,
  Star,
  Clock,
  HardDrive,
  Cloud,
  Lock,
  Smartphone
} from 'lucide-react';

const PremiumStorage = ({ user, currentUsage, isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: 0,
      currency: '₹',
      period: 'forever',
      storage: '10 MB',
      features: [
        'Basic OSINT tools',
        '10MB storage',
        'Investigation history',
        'Basic export features',
        'Community support'
      ],
      limitations: [
        'Limited cloud storage',
        'Basic features only',
        'No priority support'
      ],
      popular: false,
      color: 'gray'
    },
    {
      id: 'basic',
      name: 'Basic Pro',
      price: 99,
      currency: '₹',
      period: 'month',
      storage: '100 MB',
      features: [
        'All OSINT tools',
        '100MB cloud storage',
        'Advanced export formats',
        'Investigation templates',
        'Priority support',
        'Data backup & sync'
      ],
      limitations: [],
      popular: true,
      color: 'blue'
    },
    {
      id: 'premium',
      name: 'Professional',
      price: 299,
      currency: '₹',
      period: 'month',
      storage: '1 GB',
      features: [
        'All Pro features',
        '1GB cloud storage',
        'Advanced analytics',
        'Custom investigation templates',
        'API access',
        'Team collaboration (up to 3 users)',
        'Dedicated support',
        'Custom export formats'
      ],
      limitations: [],
      popular: false,
      color: 'purple'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 999,
      currency: '₹',
      period: 'month',
      storage: '10 GB',
      features: [
        'All Professional features',
        '10GB cloud storage',
        'Unlimited team members',
        'Custom integrations',
        'Advanced security features',
        'Compliance reporting',
        'Dedicated account manager',
        'Custom deployment options',
        'White-label options'
      ],
      limitations: [],
      popular: false,
      color: 'gold'
    }
  ];

  const currentPlan = plans.find(plan => plan.id === 'free'); // Default to free plan
  const storagePercentage = (currentUsage / 10) * 100; // Assuming 10MB free limit

  const handleUpgrade = async (planId) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan || plan.price === 0) return;

    setLoading(true);
    setShowPayment(true);

    try {
      // Initialize Razorpay payment
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Add this to your .env file
        amount: plan.price * 100, // Amount in paisa
        currency: 'INR',
        name: 'InfoScope OSINT',
        description: `${plan.name} Subscription`,
        image: '/favicon.ico',
        handler: function (response) {
          handlePaymentSuccess(response, plan);
        },
        prefill: {
          name: user?.displayName || 'User',
          email: user?.email || '',
        },
        notes: {
          plan_id: planId,
          user_id: user?.uid
        },
        theme: {
          color: plan.color === 'blue' ? '#3B82F6' : 
                 plan.color === 'purple' ? '#8B5CF6' : 
                 plan.color === 'gold' ? '#F59E0B' : '#6B7280'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            setShowPayment(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment initialization failed:', error);
      alert('Payment initialization failed. Please try again.');
      setLoading(false);
      setShowPayment(false);
    }
  };

  const handlePaymentSuccess = async (response, plan) => {
    try {
      // Here you would typically verify the payment with your backend
      console.log('Payment successful:', response);
      
      // For demo purposes, we'll just show success
      alert(`Successfully upgraded to ${plan.name}! Your new storage limit is ${plan.storage}.`);
      
      // Update user subscription in Firebase (implement this based on your backend)
      // await updateUserSubscription(user.uid, plan.id, response.razorpay_payment_id);
      
      setLoading(false);
      setShowPayment(false);
      onClose();
    } catch (error) {
      console.error('Payment verification failed:', error);
      alert('Payment verification failed. Please contact support.');
      setLoading(false);
      setShowPayment(false);
    }
  };

  const formatStorage = (mb) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Premium Storage Plans</h2>
                <p className="opacity-90">Upgrade your storage and unlock advanced features</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Current Usage */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Current Storage Usage</h3>
                <p className="text-gray-600">You're using {currentUsage?.toFixed(2) || 0} MB of your {currentPlan?.storage || '10 MB'} limit</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{storagePercentage.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Used</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  storagePercentage > 90 ? 'bg-red-500' : 
                  storagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              />
            </div>
            
            {storagePercentage > 80 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Storage almost full! Consider upgrading to continue saving investigations.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white border-2 rounded-xl p-6 transition-all duration-200 ${
                  plan.popular 
                    ? 'border-blue-500 shadow-lg transform scale-105' 
                    : selectedPlan === plan.id
                    ? 'border-blue-300 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                    plan.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    plan.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    plan.color === 'gold' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {plan.id === 'free' && <HardDrive className="w-6 h-6" />}
                    {plan.id === 'basic' && <Cloud className="w-6 h-6" />}
                    {plan.id === 'premium' && <Crown className="w-6 h-6" />}
                    {plan.id === 'enterprise' && <Shield className="w-6 h-6" />}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  
                  <div className="mb-3">
                    <span className="text-3xl font-bold text-gray-900">{plan.currency}{plan.price}</span>
                    {plan.price > 0 && <span className="text-gray-600">/{plan.period}</span>}
                  </div>
                  
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    plan.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    plan.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                    plan.color === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    <Database className="w-3 h-3" />
                    {plan.storage} Storage
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-sm text-gray-500">{limitation}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    if (plan.price > 0) {
                      handleUpgrade(plan.id);
                    }
                  }}
                  disabled={loading || plan.id === 'free'}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    plan.id === 'free'
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {loading && selectedPlan === plan.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : plan.id === 'free' ? (
                    'Current Plan'
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Upgrade Now
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="mt-12 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Why Upgrade to Premium?
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Enhanced Performance</h4>
                <p className="text-sm text-gray-600">
                  Faster processing, priority servers, and advanced caching for lightning-fast investigations.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Advanced Security</h4>
                <p className="text-sm text-gray-600">
                  End-to-end encryption, secure cloud storage, and advanced privacy protection features.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Team Collaboration</h4>
                <p className="text-sm text-gray-600">
                  Share investigations, collaborate in real-time, and manage team access with advanced controls.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Frequently Asked Questions</h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-800">Can I cancel anytime?</p>
                <p className="text-gray-600">Yes, you can cancel your subscription at any time. Your data will remain accessible during the current billing period.</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">Is my data secure?</p>
                <p className="text-gray-600">Absolutely. We use enterprise-grade encryption and follow industry best practices to protect your investigation data.</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">What payment methods do you accept?</p>
                <p className="text-gray-600">We accept all major credit/debit cards, UPI, net banking, and digital wallets through Razorpay.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumStorage;