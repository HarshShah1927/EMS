const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

// Load environment variables from the backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

let mongod;

const setupAdmin = async () => {
  try {
    console.log('🔧 Environment check:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'set' : 'not set'}`);
    
    // Check if we should use external MongoDB or in-memory
    const useExternalMongoDB = process.env.USE_EXTERNAL_MONGODB === 'true';
    
    let mongoUri;
    
    if (useExternalMongoDB && process.env.MONGODB_URI) {
      // Use external MongoDB if specified
      mongoUri = process.env.MONGODB_URI;
      console.log(`   MONGODB_URI: ${mongoUri}`);
      console.log('🔌 Connecting to external MongoDB...');
    } else {
      // Use in-memory MongoDB for development
      console.log('🔧 Starting in-memory MongoDB for development...');
      mongod = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: 'ems'
        }
      });
      mongoUri = mongod.getUri();
      console.log(`   Database URI: ${mongoUri}`);
      console.log('✅ In-memory MongoDB started');
    }
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${mongoose.connection.name}`);

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@company.com' });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log('📧 Email: admin@company.com');
      console.log('🔑 Password: admin123');
      
      if (mongod) {
        console.log('\n💡 In-memory database will stop when this process ends.');
        console.log('💡 To keep the database running, use: npm run setup-dev-db');
      }
      
      if (!mongod) {
        process.exit(0);
      }
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
    
    if (mongod) {
      console.log('\n🎉 Setup complete with in-memory database!');
      console.log('💡 Database will stop when this process ends.');
      console.log('💡 To keep the database running, use: npm run setup-dev-db');
      console.log('💡 Or set USE_EXTERNAL_MONGODB=true in .env for external MongoDB');
    } else {
      console.log('\n🎉 Setup complete!');
      process.exit(0);
    }
    
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
      console.error('💡 Try using the in-memory database instead:');
      console.error('💡   npm run setup-dev-db');
      console.error('💡 Or install and start MongoDB locally');
    }
    
    if (mongod) {
      await mongod.stop();
    }
    
    process.exit(1);
  }
};

// Handle cleanup
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  if (mongod) {
    await mongod.stop();
  }
  process.exit(0);
});

setupAdmin();