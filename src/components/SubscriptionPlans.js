import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Globe, 
  Users, 
  Download,
  CreditCard,
  X,
  Info,
  TrendingUp
} from 'lucide-react';
import subscriptionService from '../services/subscriptionService';

const SubscriptionPlans = ({ isOpen, onClose }) => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usageStats, setUsageStats] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const plan = subscriptionService.getCurrentPlan();
      const stats = subscriptionService.getUsageStats();
      setCurrentPlan(plan);
      setUsageStats(stats);
    }
  }, [isOpen]);

  const handlePlanSelect = async (planId) => {
    if (planId === 'free' || currentPlan?.id === planId) return;
    
    setLoading(true);
    try {
      await subscriptionService.initiatePurchase(planId);
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'free': return <Users className="w-6 h-6" />;
      case 'basic': return <Zap className="w-6 h-6" />;
      case 'professional': return <Crown className="w-6 h-6" />;
      case 'enterprise': return <Shield className="w-6 h-6" />;
      default: return <Globe className="w-6 h-6" />;
    }
  };

  const getPlanColorClasses = (planId, isCurrentPlan) => {
    const baseClasses = "relative rounded-xl border-2 p-6 transition-all duration-200";
    
    if (isCurrentPlan) {
      return `${baseClasses} border-green-500 bg-green-50 dark:bg-green-900/20`;
    }
    
    switch (planId) {
      case 'free':
        return `${baseClasses} border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600`;
      case 'basic':
        return `${baseClasses} border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500`;
      case 'professional':
        return `${baseClasses} border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500 bg-purple-50 dark:bg-purple-900/10`;
      case 'enterprise':
        return `${baseClasses} border-yellow-300 dark:border-yellow-600 hover:border-yellow-400 dark:hover:border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10`;
      default:
        return baseClasses;
    }
  };

  const getButtonClasses = (planId, isCurrentPlan) => {
    if (isCurrentPlan) {
      return "w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors cursor-default";
    }
    
    if (planId === 'free') {
      return "w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors cursor-default";
    }
    
    switch (planId) {
      case 'basic':
        return "w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors";
      case 'professional':
        return "w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors";
      case 'enterprise':
        return "w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-medium transition-colors";
      default:
        return "w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Choose Your Plan
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Unlock premium OSINT capabilities with advanced export features
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Usage Stats */}
        {usageStats && (
          <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Usage - {currentPlan?.name} Plan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Requests</span>
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usageStats.daily_requests.used}
                  <span className="text-sm font-normal text-gray-500">
                    /{usageStats.daily_requests.limit === 'unlimited' ? '∞' : usageStats.daily_requests.limit}
                  </span>
                </div>
                {usageStats.daily_requests.limit !== 'unlimited' && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min((usageStats.daily_requests.used / usageStats.daily_requests.limit) * 100, 100)}%` 
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Requests</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usageStats.monthly_requests.used}
                  <span className="text-sm font-normal text-gray-500">
                    /{usageStats.monthly_requests.limit === 'unlimited' ? '∞' : usageStats.monthly_requests.limit}
                  </span>
                </div>
                {usageStats.monthly_requests.limit !== 'unlimited' && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min((usageStats.monthly_requests.used / usageStats.monthly_requests.limit) * 100, 100)}%` 
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage Used</span>
                  <Download className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usageStats.storage.used}
                  <span className="text-sm font-normal text-gray-500">/{usageStats.storage.limit}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.values(subscriptionService.constructor.PLANS).map((plan) => {
              const isCurrentPlan = currentPlan?.id === plan.id;
              
              return (
                <div key={plan.id} className={getPlanColorClasses(plan.id, isCurrentPlan)}>
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  {/* Current plan badge */}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Current
                      </span>
                    </div>
                  )}
                  
                  {/* Plan header */}
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                      plan.id === 'free' ? 'bg-gray-100 text-gray-600' :
                      plan.id === 'basic' ? 'bg-blue-100 text-blue-600' :
                      plan.id === 'professional' ? 'bg-purple-100 text-purple-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {getPlanIcon(plan.id)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      ₹{plan.price}
                      {plan.price > 0 && (
                        <span className="text-sm font-normal text-gray-500">/{plan.interval}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Features list */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Limits info */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Limits</span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <div>Daily: {plan.limits.daily_requests === 'unlimited' ? '∞' : `${plan.limits.daily_requests} requests`}</div>
                      <div>Export: {plan.limits.export_formats.join(', ').toUpperCase()}</div>
                      <div>Support: {plan.limits.support}</div>
                    </div>
                  </div>
                  
                  {/* Action button */}
                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={loading || isCurrentPlan || plan.id === 'free'}
                    className={getButtonClasses(plan.id, isCurrentPlan)}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : isCurrentPlan ? (
                      <div className="flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        Current Plan
                      </div>
                    ) : plan.id === 'free' ? (
                      'Free Forever'
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Upgrade Now
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Need Help Choosing?
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              All plans include our core OSINT tools. Premium plans unlock advanced export formats and enhanced API access.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>✓ Secure Razorpay payments</span>
              <span>✓ Cancel anytime</span>
              <span>✓ 30-day money back guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;