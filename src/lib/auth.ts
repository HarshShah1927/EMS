import bcrypt from 'bcryptjs';
import { User } from './database';
import { AuthUser, LoginCredentials } from '../types';

// Hash password utility
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Verify password utility
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Login function
export const loginUser = async (credentials: LoginCredentials): Promise<AuthUser | null> => {
  try {
    // Find user by email (case-insensitive)
    const user = await User.findOne({ 
      email: credentials.email.trim().toLowerCase()
    });

    if (!user) {
      console.log('User not found:', credentials.email);
      return null;
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('User account is deactivated:', credentials.email);
      return null;
    }

    // Verify password
    const isPasswordValid = await verifyPassword(credentials.password, user.password);
    
    if (!isPasswordValid) {
      console.log('Invalid password for user:', credentials.email);
      return null;
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
      loginCount: (user.loginCount || 0) + 1
    });

    // Return user data (without password)
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      isActive: user.isActive
    };

  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

// Create new user function
export const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
  role: string;
  department?: string;
  phone?: string;
  employeeId?: string;
}): Promise<AuthUser | null> => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: userData.email.trim().toLowerCase()
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user object
    const newUser = new User({
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      password: hashedPassword,
      role: userData.role,
      department: userData.department || '',
      phone: userData.phone || '',
      employeeId: userData.employeeId || '',
      isActive: true
    });

    // Save user
    const savedUser = await newUser.save();

    return {
      id: savedUser._id.toString(),
      email: savedUser.email,
      name: savedUser.name,
      role: savedUser.role,
      department: savedUser.department,
      isActive: savedUser.isActive
    };

  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

// Change password function
export const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    // Get current user
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      updatedAt: new Date()
    });

    return true;

  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId: string): Promise<AuthUser | null> => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      isActive: user.isActive
    };

  } catch (error) {
    console.error('Get user by ID error:', error);
    return null;
  }
};

// Update user password (admin function)
export const updateUserPassword = async (userId: string, newPassword: string): Promise<boolean> => {
  try {
    const hashedPassword = await hashPassword(newPassword);

    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      updatedAt: new Date()
    });

    return true;

  } catch (error) {
    console.error('Update password error:', error);
    return false;
  }
};

// Activate user
export const activateUser = async (userId: string): Promise<boolean> => {
  try {
    await User.findByIdAndUpdate(userId, {
      isActive: true,
      updatedAt: new Date()
    });

    return true;

  } catch (error) {
    console.error('Activate user error:', error);
    return false;
  }
};

// Deactivate user
export const deactivateUser = async (userId: string): Promise<boolean> => {
  try {
    await User.findByIdAndUpdate(userId, {
      isActive: false,
      updatedAt: new Date()
    });

    return true;

  } catch (error) {
    console.error('Deactivate user error:', error);
    return false;
  }
};