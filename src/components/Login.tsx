import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { loginUser } from '../lib/auth';
import { AuthUser } from '../types';

interface LoginProps {
  onLogin: (user: AuthUser) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate input
      if (!email.trim()) {
        setError('Please enter your email address');
        setIsLoading(false);
        return;
      }

      if (!password.trim()) {
        setError('Please enter your password');
        setIsLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Attempt login
      const user = await loginUser({ email: email.trim(), password });

      if (user) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          onLogin(user);
        }, 1000);
      } else {
        setError('Invalid email or password. Please check your credentials and try again.');
      }

    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again or contact support if the problem persists.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setSuccess('');
    
    // Auto-submit after setting credentials
    setTimeout(async () => {
      setIsLoading(true);
      try {
        const user = await loginUser({ email: demoEmail, password: demoPassword });
        if (user) {
          setSuccess('Demo login successful! Redirecting...');
          setTimeout(() => {
            onLogin(user);
          }, 1000);
        } else {
          setError('Demo login failed. Please try manual login.');
        }
      } catch (error) {
        setError('Demo login failed. Please try manual login.');
      } finally {
        setIsLoading(false);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to your EMS account</p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Enter your email"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pr-12"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">Demo Accounts (Click to login)</p>
            <div className="space-y-2">
              <button
                onClick={() => handleDemoLogin('admin@company.com', 'admin123')}
                disabled={isLoading}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <div className="font-medium text-gray-900">Administrator</div>
                <div className="text-sm text-gray-600">admin@company.com</div>
              </button>
              
              <button
                onClick={() => handleDemoLogin('hr@company.com', 'hr123')}
                disabled={isLoading}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <div className="font-medium text-gray-900">HR Manager</div>
                <div className="text-sm text-gray-600">hr@company.com</div>
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Having trouble logging in?{' '}
              <button 
                onClick={() => setError('Please contact your system administrator for password reset.')}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Get Help
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}