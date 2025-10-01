import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const FeedbackForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    rating: 5,
    category: 'general'
  });
  
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'general', label: 'General Feedback' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'ui', label: 'UI/UX Improvement' },
    { value: 'tools', label: 'OSINT Tools' },
    { value: 'performance', label: 'Performance Issue' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('');

    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        setStatus('error:Please fill in all required fields.');
        setIsSubmitting(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setStatus('error:Please enter a valid email address.');
        setIsSubmitting(false);
        return;
      }

      // Prepare data for submission
      const feedbackData = {
        ...formData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        type: 'infoscope_feedback'
      };

      // Submit to Google Apps Script (same endpoint as portfolio)
      const response = await fetch('https://script.google.com/macros/s/AKfycbzs9_9DGe-4ob1lo77wNDcVEfHcQYVUfNOlgaKFgvGT9tSzs4iprulWy4JMYHuc9jkN/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      const result = await response.json();

      if (result.status === 'ok' || response.ok) {
        setStatus('success:Thank you for your feedback! Your message has been sent successfully.');
        
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
            rating: 5,
            category: 'general'
          });
          setStatus('');
          if (onClose) onClose();
        }, 2000);
      } else {
        setStatus(`error:${result.message || 'Failed to send feedback. Please try again.'}`);
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      setStatus('error:Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto popup-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Send Feedback</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Help us improve InfoScope OSINT</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name and Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          {/* Category and Rating Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Feedback Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Overall Rating
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  id="rating"
                  name="rating"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={handleChange}
                  className="flex-1"
                />
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                    {formData.rating}/5
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Brief summary of your feedback"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Please provide detailed feedback about your experience with InfoScope OSINT..."
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Minimum 10 characters. Include specific details to help us improve.
            </p>
          </div>

          {/* Status Message */}
          {status && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              status.startsWith('error:') 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            }`}>
              {status.startsWith('error:') ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">
                {status.replace(/^(error:|success:)/, '')}
              </span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Feedback
                </>
              )}
            </button>
          </div>
        </form>

        {/* Privacy Notice */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Privacy Notice:</strong> Your feedback helps us improve InfoScope OSINT. 
              We collect your name, email, and message for support purposes only. 
              We don't share your information with third parties and use it solely for product improvement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;