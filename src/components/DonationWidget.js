import React, { useState } from 'react';

const DonationWidget = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const donationAmounts = [49, 99, 199, 499];
  const upiId = "developer@infoscope.osint";

  const handleRazorpayDonation = (amount) => {
    // Initialize Razorpay
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_sample',
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      name: 'InfoScope OSINT',
      description: `Support InfoScope Development - ₹${amount}`,
      image: '/logo192.png',
      handler: function (response) {
        console.log('Donation successful:', response);
        alert(`Thank you for your donation of ₹${amount}! Your support helps keep InfoScope free and updated.`);
        setShowPaymentOptions(false);
        setIsExpanded(false);
      },
      prefill: {
        name: 'Supporter',
        email: 'supporter@example.com'
      },
      theme: {
        color: '#7c3aed'
      },
      modal: {
        ondismiss: function() {
          console.log('Donation cancelled');
        }
      }
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      alert('Payment gateway not available. Please try UPI payment.');
    }
  };

  const handleUPIPayment = (amount) => {
    const upiLink = `upi://pay?pa=${upiId}&pn=InfoScope%20OSINT&am=${amount}&cu=INR&tn=Support%20InfoScope%20Development`;
    
    // Try to open UPI app
    const link = document.createElement('a');
    link.href = upiLink;
    link.click();

    // Show fallback
    setTimeout(() => {
      const copyText = `UPI ID: ${upiId}\nAmount: ₹${amount}\nNote: Support InfoScope Development`;
      navigator.clipboard.writeText(copyText).then(() => {
        alert(`UPI details copied to clipboard!\n\n${copyText}`);
      }).catch(() => {
        alert(`UPI Payment Details:\n\nUPI ID: ${upiId}\nAmount: ₹${amount}\nNote: Support InfoScope Development`);
      });
    }, 2000);
  };

  const handlePayPalDonation = (amount) => {
    // Convert INR to USD (approximate rate)
    const usdAmount = Math.round((amount / 83) * 100) / 100;
    const paypalUrl = `https://www.paypal.com/donate/?hosted_button_id=SAMPLE&amount=${usdAmount}&currency_code=USD`;
    window.open(paypalUrl, '_blank');
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          title="Support InfoScope Development"
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">❤️</span>
            <span className="hidden group-hover:inline-block text-sm font-medium whitespace-nowrap">
              Donate
            </span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 w-80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">❤️</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">Support InfoScope</h3>
          </div>
          <button
            onClick={() => {
              setIsExpanded(false);
              setShowPaymentOptions(false);
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Help us maintain servers, add new features, and keep InfoScope free for the community.
        </p>

        {!showPaymentOptions ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {donationAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => setShowPaymentOptions(true)}
                  className="bg-gray-100 hover:bg-purple-100 dark:bg-gray-700 dark:hover:bg-purple-900/20 text-gray-900 dark:text-white p-2 rounded-lg text-sm font-medium transition-colors"
                >
                  ₹{amount}
                </button>
              ))}
            </div>
            <div className="text-center">
              <button
                onClick={() => setShowPaymentOptions(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full"
              >
                Choose Payment Method
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-center mb-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">Choose donation amount & method:</p>
            </div>
            
            {donationAmounts.map(amount => (
              <div key={amount} className="space-y-2">
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">₹{amount}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleRazorpayDonation(amount)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-xs font-medium transition-colors"
                    title="Razorpay (Cards, UPI, Wallets)"
                  >
                    💳 Card
                  </button>
                  <button
                    onClick={() => handleUPIPayment(amount)}
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded text-xs font-medium transition-colors"
                    title="UPI Payment"
                  >
                    📱 UPI
                  </button>
                  <button
                    onClick={() => handlePayPalDonation(amount)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded text-xs font-medium transition-colors"
                    title="PayPal (International)"
                  >
                    🌍 PayPal
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setShowPaymentOptions(false)}
                className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
              >
                ← Back to amounts
              </button>
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Every contribution helps keep InfoScope running! 🚀
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonationWidget;