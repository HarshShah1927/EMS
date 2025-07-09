import React, { useState } from 'react';
import { Settings as SettingsIcon, Lock, User, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthUser } from '../types';
import { changePassword, getUserById } from '../lib/auth';

interface SettingsProps {
  user: AuthUser;
}

export default function Settings({ user }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        setError('Please fill in all password fields');
        setIsLoading(false);
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError('New passwords do not match');
        setIsLoading(false);
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setError('New password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }

      if (passwordForm.currentPassword === passwordForm.newPassword) {
        setError('New password must be different from current password');
        setIsLoading(false);
        return;
      }

      // Change password
      const result = await changePassword(
        user.id,
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      if (result) {
        setSuccess('Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError('Failed to change password. Please check your current password.');
      }

    } catch (error: any) {
      console.error('Password change error:', error);
      setError(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      value={user.name}
                      className="form-input bg-gray-50"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      value={user.email}
                      className="form-input bg-gray-50"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Role</label>
                    <input
                      type="text"
                      value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      className="form-input bg-gray-50"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      value={user.department || 'Not specified'}
                      className="form-input bg-gray-50"
                      disabled
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    To update your profile information, please contact your system administrator.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>
              
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value
                    })}
                    className="form-input"
                    placeholder="Enter your current password"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value
                    })}
                    className="form-input"
                    placeholder="Enter your new password"
                    disabled={isLoading}
                    minLength={6}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value
                    })}
                    className="form-input"
                    placeholder="Confirm your new password"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-3">Password Requirements</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• At least 6 characters long</li>
                  <li>• Different from your current password</li>
                  <li>• Use a combination of letters, numbers, and symbols for better security</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}