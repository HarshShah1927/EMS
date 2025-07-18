const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const createAdmin = async () => {
  try {
    console.log('🔧 Creating Admin User...');
    console.log('========================');
    
    // Try to connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ems';
    console.log(`Connecting to: ${mongoUri}`);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Delete existing admin if any
    const existingAdmin = await User.findOne({ email: 'admin@company.com' });
    if (existingAdmin) {
      await User.deleteOne({ email: 'admin@company.com' });
      console.log('🗑️  Deleted existing admin user');
    }
    
    // Create new admin
    const admin = new User({
      name: 'Admin User',
      email: 'admin@company.com',
      password: 'admin123',
      role: 'admin',
      department: 'IT',
      phone: '+1234567890',
      employeeId: 'EMP001',
      isActive: true
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('========================');
    console.log('📧 Email: admin@company.com');
    console.log('🔑 Password: admin123');
    console.log('========================');
    console.log('🚀 You can now login to the frontend!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    console.log('\n🔧 Troubleshooting:');
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('   • MongoDB is not running');
      console.log('   • Try using MongoDB Atlas instead:');
      console.log('     1. Go to https://cloud.mongodb.com');
      console.log('     2. Create a free cluster');
      console.log('     3. Get connection string');
      console.log('     4. Update MONGODB_URI in .env file');
      console.log('     5. Run this script again');
    } else if (error.message.includes('validation')) {
      console.log('   • Check the user data format');
      console.log('   • Make sure all required fields are provided');
    } else {
      console.log('   • Check your MongoDB connection');
      console.log('   • Verify your .env file configuration');
    }
    
    console.log('\n💡 Alternative: Use MongoDB Atlas (free cloud database)');
    console.log('   It\'s easier than installing MongoDB locally!');
    
    process.exit(1);
  }
};

console.log('🚀 Admin User Creation Script');
console.log('==============================');
createAdmin();