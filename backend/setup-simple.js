const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const setupAdmin = async () => {
  try {
    console.log('🔧 Simple Admin Setup');
    console.log('=====================');
    
    // Check environment
    console.log('🔍 Environment check:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'set' : 'not set'}`);
    
    // Try to connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ems';
    console.log(`   MONGODB_URI: ${mongoUri}`);
    
    console.log('\n🔌 Attempting to connect to MongoDB...');
    
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000, // 5 second timeout
      });
      console.log('✅ Connected to MongoDB');
    } catch (connectError) {
      console.log('❌ Could not connect to external MongoDB');
      console.log('💡 This is normal if you don\'t have MongoDB installed');
      console.log('\n🚀 SOLUTION: Use one of these methods instead:');
      console.log('   1. Install MongoDB locally and start it');
      console.log('   2. Use MongoDB Atlas (cloud database)');
      console.log('   3. Use the in-memory database: npm run setup-dev-db');
      console.log('   4. Use Docker: docker run -d -p 27017:27017 mongo');
      console.log('\n📝 To use MongoDB Atlas:');
      console.log('   1. Go to https://cloud.mongodb.com');
      console.log('   2. Create a free cluster');
      console.log('   3. Get your connection string');
      console.log('   4. Update MONGODB_URI in backend/.env');
      console.log('\n🎯 For now, you can continue with the in-memory database option');
      process.exit(1);
    }

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
    
    console.log('\n🎉 Setup complete!');
    console.log('🚀 You can now start the backend server: npm run dev');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during setup:', error.message);
    console.log('\n🔧 Troubleshooting:');
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('   • MongoDB is not running');
      console.log('   • Try: npm run setup-dev-db (for in-memory database)');
      console.log('   • Or install and start MongoDB locally');
    } else if (error.message.includes('authentication')) {
      console.log('   • Check your MongoDB credentials');
      console.log('   • Verify your connection string');
    } else {
      console.log('   • Check your .env file configuration');
      console.log('   • Ensure all required environment variables are set');
    }
    
    process.exit(1);
  }
};

setupAdmin();