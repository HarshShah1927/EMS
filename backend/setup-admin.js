const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

// Load environment variables from the backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const setupAdmin = async () => {
  try {
    // Get MongoDB URI with fallback
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ems';
    
    console.log('🔧 Environment check:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`   MONGODB_URI: ${mongoUri}`);
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'set' : 'not set'}`);
    
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${mongoose.connection.name}`);

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@company.com' });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log('📧 Email: admin@company.com');
      console.log('🔑 Password: admin123');
      process.exit(0);
    }

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@company.com',
      password: 'admin123',
      role: 'admin',
      department: 'IT',
      phone: '+1234567890',
      employeeId: 'EMP001',
      isActive: true
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@company.com');
    console.log('🔑 Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin user:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('ENOTFOUND')) {
      console.error('🔧 DNS Resolution Error - Check your MongoDB URI');
      console.error('💡 Make sure MongoDB is running or your connection string is correct');
    } else if (error.message.includes('authentication failed')) {
      console.error('🔧 Authentication Error - Check your credentials');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('🔧 Connection Refused - MongoDB might not be running');
      console.error('💡 Start MongoDB with: mongod --dbpath /path/to/your/db');
    }
    
    process.exit(1);
  }
};

setupAdmin();