const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

let mongod;

const setupDevDatabase = async () => {
  try {
    console.log('🚀 Setting up development database...');
    
    // Start MongoDB Memory Server
    console.log('🔧 Starting MongoDB Memory Server...');
    mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017, // Use default MongoDB port
        dbName: 'ems'
      }
    });
    
    const uri = mongod.getUri();
    console.log('✅ MongoDB Memory Server started');
    console.log(`📊 Database URI: ${uri}`);
    
    // Connect to the in-memory database
    await mongoose.connect(uri);
    console.log('✅ Connected to in-memory MongoDB');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@company.com' });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log('📧 Email: admin@company.com');
      console.log('🔑 Password: admin123');
      return;
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
    
    console.log('\n🎉 Development database setup complete!');
    console.log('💡 The database will run in memory and persist until the process is stopped.');
    console.log('💡 To stop the database, press Ctrl+C');
    
    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down development database...');
      await mongoose.connection.close();
      if (mongod) {
        await mongod.stop();
      }
      console.log('✅ Database stopped');
      process.exit(0);
    });
    
    // Keep the process alive
    console.log('\n⏳ Database is running... Press Ctrl+C to stop');
    
  } catch (error) {
    console.error('❌ Error setting up development database:', error.message);
    
    if (mongod) {
      await mongod.stop();
    }
    
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', async (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  if (mongod) {
    await mongod.stop();
  }
  process.exit(1);
});

setupDevDatabase();