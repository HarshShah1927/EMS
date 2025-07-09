import bcrypt from 'bcryptjs';
import { connectDB } from './mongodb';
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
    const { db } = await connectDB();
    const usersCollection = db.collection('users');

    // Find user by email (case-insensitive)
    const user = await usersCollection.findOne({ 
      email: { $regex: new RegExp(`^${credentials.email.trim()}$`, 'i') }
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
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLogin: new Date(),
          loginCount: (user.loginCount || 0) + 1
        }
      }
    );

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
    const { db } = await connectDB();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ 
      email: { $regex: new RegExp(`^${userData.email.trim()}$`, 'i') }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user object
    const newUser = {
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      password: hashedPassword,
      role: userData.role,
      department: userData.department || '',
      phone: userData.phone || '',
      employeeId: userData.employeeId || '',
      isActive: true,
      createdAt: new Date(),
      lastLogin: null,
      loginCount: 0
    };

    // Insert user
    const result = await usersCollection.insertOne(newUser);

    if (result.insertedId) {
      return {
        id: result.insertedId.toString(),
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        department: newUser.department,
        isActive: newUser.isActive
      };
    }

    return null;
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

// Update user password
export const updateUserPassword = async (userId: string, newPassword: string): Promise<boolean> => {
  try {
    const { db } = await connectDB();
    const usersCollection = db.collection('users');
    const { ObjectId } = await import('mongodb');

    const hashedPassword = await hashPassword(newPassword);

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount > 0;

  } catch (error) {
    console.error('Update password error:', error);
    return false;
  }
};

// Change password (requires current password verification)
export const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    const { db } = await connectDB();
    const usersCollection = db.collection('users');
    const { ObjectId } = await import('mongodb');

    // Get current user
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
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
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount > 0;

  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

// Initialize default admin user
export const initializeDefaultUsers = async (): Promise<void> => {
  try {
    const { db } = await connectDB();
    const usersCollection = db.collection('users');

    // Check if admin user exists
    const adminExists = await usersCollection.findOne({ email: 'admin@company.com' });

    if (!adminExists) {
      const adminUser = {
        name: 'System Administrator',
        email: 'admin@company.com',
        password: await hashPassword('admin123'),
        role: 'admin',
        department: 'IT',
        phone: '+1234567890',
        employeeId: 'EMP001',
        isActive: true,
        createdAt: new Date(),
        lastLogin: null,
        loginCount: 0
      };

      await usersCollection.insertOne(adminUser);
      console.log('Default admin user created');
    }

    // Create sample HR user if doesn't exist
    const hrExists = await usersCollection.findOne({ email: 'hr@company.com' });
    
    if (!hrExists) {
      const hrUser = {
        name: 'HR Manager',
        email: 'hr@company.com',
        password: await hashPassword('hr123'),
        role: 'hr',
        department: 'Human Resources',
        phone: '+1234567891',
        employeeId: 'EMP002',
        isActive: true,
        createdAt: new Date(),
        lastLogin: null,
        loginCount: 0
      };

      await usersCollection.insertOne(hrUser);
      console.log('Default HR user created');
    }

  } catch (error) {
    console.error('Error initializing default users:', error);
  }
};

// Get user by ID
export const getUserById = async (userId: string): Promise<AuthUser | null> => {
  try {
    const { db } = await connectDB();
    const usersCollection = db.collection('users');
    const { ObjectId } = await import('mongodb');

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

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

// Deactivate user
export const deactivateUser = async (userId: string): Promise<boolean> => {
  try {
    const { db } = await connectDB();
    const usersCollection = db.collection('users');
    const { ObjectId } = await import('mongodb');

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          isActive: false,
          deactivatedAt: new Date()
        }
      }
    );

    return result.modifiedCount > 0;

  } catch (error) {
    console.error('Deactivate user error:', error);
    return false;
  }
};

// Activate user
export const activateUser = async (userId: string): Promise<boolean> => {
  try {
    const { db } = await connectDB();
    const usersCollection = db.collection('users');
    const { ObjectId } = await import('mongodb');

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          isActive: true,
          activatedAt: new Date()
        }
      }
    );

    return result.modifiedCount > 0;

  } catch (error) {
    console.error('Activate user error:', error);
    return false;
  }
};