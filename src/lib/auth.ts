import { AuthUser, LoginCredentials } from '../types';
import apiService from './api';

// Login function using API service
export const loginUser = async (credentials: LoginCredentials): Promise<AuthUser | null> => {
  try {
    const response = await apiService.login(credentials);
    
    if (response.success && response.data) {
      return response.data.user;
    }
    
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

// Logout function
export const logoutUser = async (): Promise<void> => {
  try {
    await apiService.logout();
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Get current user profile
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const response = await apiService.getProfile();
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Change password
export const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    const response = await apiService.changePassword(currentPassword, newPassword);
    return response.success;
  } catch (error) {
    console.error('Change password error:', error);
    return false;
  }
};

// Update user profile
export const updateProfile = async (userData: Partial<AuthUser>): Promise<AuthUser | null> => {
  try {
    const response = await apiService.updateProfile(userData);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Update profile error:', error);
    return null;
  }
};