import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase';
import { Search, Shield, Eye, EyeOff, Globe, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import InfoScopeIcon from './InfoScopeIcon';

function AuthScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [authMode, setAuthMode] = useState('signin'); // 'signin', 'signup', 'forgot-password'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }
    
    if (authMode === 'signup') {
      if (!formData.displayName) {
        setError('Display name is required for registration');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }
    
    return true;
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      await sendPasswordResetEmail(auth, formData.email, {
        url: window.location.origin, // Return URL after password reset
        handleCodeInApp: false
      });
      
      setSuccessMessage(
        `Password reset email sent to ${formData.email}. Please check your inbox and spam folder.`
      );
      
      // Clear form and switch back to sign in after successful reset
      setTimeout(() => {
        setAuthMode('signin');
        setSuccessMessage('');
      }, 5000);
      
    } catch (error) {
      console.error('Password reset error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many password reset attempts. Please try again later.');
          break;
        default:
          setError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    
    try {
      if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        // Update profile with display name
        await updateProfile(userCredential.user, {
          displayName: formData.displayName
        });
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }
    } catch (error) {
      console.error('Email authentication error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address');
          break;
        case 'auth/wrong-password':
          setError(
            <div>
              <p>Incorrect password.</p>
              <button
                onClick={() => setAuthMode('forgot-password')}
                className="text-blue-400 hover:text-blue-300 underline text-sm mt-1"
              >
                Forgot your password?
              </button>
            </div>
          );
          break;
        case 'auth/email-already-in-use':
          setError('An account with this email already exists');
          break;
        case 'auth/weak-password':
          setError('Password is too weak');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        default:
          setError('Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      // Add additional scopes if needed
      provider.addScope('profile');
      provider.addScope('email');
      
      // Configure provider settings
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google authentication error:', error);
      switch (error.code) {
        case 'auth/popup-blocked':
          setError('Popup was blocked. Please allow popups and try again.');
          break;
        case 'auth/popup-closed-by-user':
          setError('Sign-in was cancelled. Please try again.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your connection and try again.');
          break;
        default:
          setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <InfoScopeIcon size={32} variant="monochrome" className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">InfoScope OSINT</h1>
          <p className="text-gray-400">Professional OSINT Intelligence Platform</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="flex items-center gap-3 text-gray-300">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="text-sm">Advanced Google Dorking</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <Eye className="w-5 h-5 text-green-400" />
            <span className="text-sm">Built-in Browser Investigation</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <Globe className="w-5 h-5 text-purple-400" />
            <span className="text-sm">Cross-Platform Intelligence</span>
          </div>
        </div>

        {/* Authentication */}
        <div className="card bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={() => {
                setAuthMode('signin');
                setError('');
                setSuccessMessage('');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                authMode === 'signin' 
                  ? 'bg-white text-gray-900' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setError('');
                setSuccessMessage('');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                authMode === 'signup' 
                  ? 'bg-white text-gray-900' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
            {authMode === 'forgot-password' && (
              <button
                onClick={() => {
                  setAuthMode('signin');
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-gray-400 hover:text-white text-sm underline"
              >
                ← Back to Sign In
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg p-3 mb-4 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  {typeof error === 'string' ? error : error}
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-900/50 border border-green-700 text-green-300 rounded-lg p-3 mb-4 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">{successMessage}</div>
              </div>
            </div>
          )}

          {/* Forgot Password Form */}
          {authMode === 'forgot-password' ? (
            <form onSubmit={handleForgotPassword} className="space-y-4 mb-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium text-white mb-2">Reset Your Password</h3>
                <p className="text-sm text-gray-400">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary bg-white text-gray-900 hover:bg-gray-100 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                {isLoading ? 'Sending Reset Email...' : 'Send Reset Email'}
              </button>
            </form>
          ) : (
            /* Email/Password Form */
            <form onSubmit={handleEmailAuth} className="space-y-4 mb-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                    placeholder="Your name"
                    required={authMode === 'signup'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                    placeholder="••••••••"
                    required={authMode === 'signup'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary bg-white text-gray-900 hover:bg-gray-100 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              {isLoading 
                ? (authMode === 'signup' ? 'Creating Account...' : 'Signing In...') 
                : (authMode === 'signup' ? 'Create Account' : 'Sign In')
              }
            </button>
          </form>
          )}

          {/* Only show Google sign-in and forgot password options if not in forgot-password mode */}
          {authMode !== 'forgot-password' && (
            <>
              {/* Forgot Password Link for Sign In Mode */}
              {authMode === 'signin' && (
                <div className="text-center mb-4">
                  <button
                    onClick={() => {
                      setAuthMode('forgot-password');
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="text-blue-400 hover:text-blue-300 underline text-sm"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-600"></div>
                <span className="px-3 text-sm text-gray-400">or</span>
                <div className="flex-1 border-t border-gray-600"></div>
              </div>

              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full btn-primary bg-white text-gray-900 hover:bg-gray-100 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <img 
                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgPHBhdGggZD0iTTE3LjY0IDkuMjA0NTVjMC0uNjM5MzItLjA1NzI3LTEuMjUzNjgtLjE2MzY0LTEuODQwOUg5djMuNDgxODJoNC44NDM2M2MtLjIwOTA5IDEuMTI1LS44NDU0NSAxLjczNTIzLTEuODA5MDkgMi4zODE4MnYyLjA0NTQ1aDIuOTI3MjdjMS42ODQwOS0xLjU1IDIuNzE1OTEtMy44MjUgMi43MTU5MS02LjQwOTA5eiIgZmlsbD0iIzQyODVGNCIvPgogICAgPHBhdGggZD0iTTkgMThjMS4zNjM2NCAwIDIuNTA5MDktLjQzNjM2IDMuMzQwOTEtMS4yMTM2NGwtMi42NzcyNy0yLjA0NTQ1Yy0uNzYzNjQtLjUzMTgyLTEuNzEzNjQtLjc5MDkxLTIuNjYzNjQtLjc5MDkxeiIgZmlsbD0iIzM0QTg1MyIvPgogICAgPHBhdGggZD0iTTkgMThjLTEuMzYzNjQgMC0yLjUwOTA5LS40MzYzNi0zLjM0MDkxLTEuMjEzNjRsLTIuNjc3MjcgMi4wNDU0NUMzLjU3NzI3IDE5LjQzNjM2IDUuOTkwOTEgMjEgOSAyMWM0Ljk2IDAgOS00IDktOSAwLS42MzkzMi0uMDU3MjctMS4yNTM2OC0uMTYzNjQtMS44NDA5SDE4VjlIOS4xODAwOVoiIGZpbGw9IiNGRkJBRDAiLz4KICA8L2c+Cjwvc3ZnPgo=" 
                    alt="Google" 
                    className="w-5 h-5"
                  />
                )}
                {isLoading ? 'Signing in...' : 'Continue with Google'}
              </button>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to use this tool responsibly and in accordance with applicable laws and platform terms of service.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-amber-900/30 border border-amber-700 rounded-lg">
          <p className="text-xs text-amber-300 text-center">
            ⚠️ <strong>Ethical Use Only:</strong> This tool is for legitimate investigations only. 
            Respect privacy laws and platform terms. No stalking, harassment, or doxxing.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthScreen;
