const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Attendance = require('./models/Attendance');

const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing Employee Management System Database...');
    console.log('================================================');
    
    // Check environment variables
    console.log('🔍 Checking environment variables...');
    const mongoURI = process.env.MONGODB_URI;
    const jwtSecret = process.env.JWT_SECRET;
    const port = process.env.PORT;
    
    console.log(`📍 NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`📍 PORT: ${port || 'not set'}`);
    console.log(`📍 JWT_SECRET: ${jwtSecret ? '***set***' : 'not set'}`);
    console.log(`📍 MONGODB_URI: ${mongoURI || 'not set'}`);
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined!');
      console.error('💡 Please create a .env file in the backend directory with:');
      console.error('   MONGODB_URI=mongodb://localhost:27017/employee_management_system');
      process.exit(1);
    }
    
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET is not defined!');
      console.error('💡 Please add JWT_SECRET to your .env file');
      process.exit(1);
    }
    
    // Connect to MongoDB
    console.log('\n🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
    // Create default users
    console.log('\n👤 Creating default users...');
    await createDefaultUsers();
    
    // Create indexes
    console.log('\n📊 Creating database indexes...');
    await createIndexes();
    
    console.log('\n✅ Database initialization completed successfully!');
    console.log('================================================');
    console.log('🎉 Your Employee Management System is ready!');
    console.log('');
    console.log('👤 Default Users Created:');
    console.log('   Admin: admin@company.com / admin123');
    console.log('   HR: hr@company.com / hr123');
    console.log('   Employee: employee@company.com / employee123');
    console.log('');
    console.log('🚀 You can now start the server with: npm start');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('');
      console.error('🔧 MongoDB is not running. Please start MongoDB:');
      console.error('   - macOS: brew services start mongodb-community');
      console.error('   - Ubuntu: sudo systemctl start mongod');
      console.error('   - Windows: net start MongoDB');
      console.error('');
      console.error('💡 Or install MongoDB if not installed:');
      console.error('   - macOS: brew install mongodb-community');
      console.error('   - Ubuntu: sudo apt install mongodb');
      console.error('   - Windows: Download from mongodb.com');
    }
    
    process.exit(1);
  }
};

const createDefaultUsers = async () => {
  try {
    // Check if users already exist
    const existingAdmin = await User.findOne({ email: 'admin@company.com' });
    if (existingAdmin) {
      console.log('👤 Admin user already exists, skipping...');
    } else {
      // Create admin user
      const adminUser = new User({
        name: 'System Administrator',
        email: 'admin@company.com',
        password: 'admin123',
        role: 'admin',
        department: 'IT',
        phone: '+1234567890',
        employeeId: 'EMP001',
        isActive: true
      });
      await adminUser.save();
      console.log('✅ Admin user created: admin@company.com / admin123');
    }
    
    // Create HR user
    const existingHR = await User.findOne({ email: 'hr@company.com' });
    if (existingHR) {
      console.log('👤 HR user already exists, skipping...');
    } else {
      const hrUser = new User({
        name: 'HR Manager',
        email: 'hr@company.com',
        password: 'hr123',
        role: 'hr',
        department: 'Human Resources',
        phone: '+1234567891',
        employeeId: 'EMP002',
        isActive: true
      });
      await hrUser.save();
      console.log('✅ HR user created: hr@company.com / hr123');
    }
    
    // Create employee user
    const existingEmployee = await User.findOne({ email: 'employee@company.com' });
    if (existingEmployee) {
      console.log('👤 Employee user already exists, skipping...');
    } else {
      const employeeUser = new User({
        name: 'John Doe',
        email: 'employee@company.com',
        password: 'employee123',
        role: 'employee',
        department: 'Development',
        phone: '+1234567892',
        employeeId: 'EMP003',
        isActive: true
      });
      await employeeUser.save();
      console.log('✅ Employee user created: employee@company.com / employee123');
    }
    
  } catch (error) {
    console.error('❌ Error creating default users:', error.message);
  }
};

const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Users collection indexes
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ employeeId: 1 }, { sparse: true });
      console.log('✅ Users indexes created');
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.log('⚠️ Users indexes already exist');
      }
    }
    
    // Attendance collection indexes
    try {
      await db.collection('attendances').createIndex({ employeeId: 1, date: 1 }, { unique: true });
      await db.collection('attendances').createIndex({ date: 1 });
      await db.collection('attendances').createIndex({ employeeId: 1 });
      console.log('✅ Attendance indexes created');
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.log('⚠️ Attendance indexes already exist');
      }
    }
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
};

// Test database connection
const testConnection = async () => {
  try {
    console.log('🧪 Testing database connection...');
    
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management_system';
    console.log(`📍 Testing URI: ${mongoURI}`);
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Database connection test successful!');
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    process.exit(1);
  }
};

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'test':
    testConnection();
    break;
  case 'init':
  default:
    initializeDatabase();
    break;
}

module.exports = { initializeDatabase, testConnection };