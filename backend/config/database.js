const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Get MongoDB URI with fallback
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ems';
    
    console.log('🔧 Environment check:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`   MONGODB_URI: ${mongoUri}`);
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'set' : 'not set'}`);
    
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  MONGODB_URI not found in environment variables');
      console.log('💡 Using fallback: mongodb://localhost:27017/ems');
    }
    
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Create database and collections if they don't exist
    await createCollections();
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('ENOTFOUND')) {
      console.error('🔧 DNS Resolution Error - Check your MongoDB URI');
      console.error('💡 Make sure your cluster URL is correct');
      console.error('💡 Check your internet connection');
    } else if (error.message.includes('authentication failed')) {
      console.error('🔧 Authentication Error - Check your credentials');
      console.error('💡 Verify your username and password');
    } else if (error.message.includes('IP')) {
      console.error('🔧 Network Access Error - Check IP whitelist');
      console.error('💡 Add your IP to MongoDB Atlas Network Access');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('🔧 Connection Refused - MongoDB is not running');
      console.error('💡 Solutions:');
      console.error('   1. Use MongoDB Atlas (free cloud database)');
      console.error('   2. Install MongoDB locally');
      console.error('   3. Use Docker: docker run -d -p 27017:27017 mongo');
      console.error('   4. Use in-memory database: npm run setup-dev-db');
    } else if (error.message.includes('uri parameter')) {
      console.error('🔧 Invalid MongoDB URI');
      console.error('💡 Check your MONGODB_URI in .env file');
      console.error('💡 Current URI:', process.env.MONGODB_URI || 'undefined');
    }
    
    console.error('\n🚀 Quick Fix: Use MongoDB Atlas');
    console.error('   1. Go to https://cloud.mongodb.com');
    console.error('   2. Create free account and cluster');
    console.error('   3. Get connection string');
    console.error('   4. Update MONGODB_URI in backend/.env');
    
    process.exit(1);
  }
};

const createCollections = async () => {
  try {
    const db = mongoose.connection.db;
    
    // List of collections to create
    const collections = [
      'users',
      'employees', 
      'attendance',
      'leaverequests',
      'salaries',
      'advancesalaries'
    ];

    // Create collections if they don't exist
    for (const collectionName of collections) {
      const collectionExists = await db.listCollections({ name: collectionName }).hasNext();
      if (!collectionExists) {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      }
    }

    // Create indexes for better performance
    await createIndexes();
    
  } catch (error) {
    console.error('❌ Error creating collections:', error.message);
  }
};

const createIndexes = async () => {
  try {
    // Users collection indexes
    await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.db.collection('users').createIndex({ employeeId: 1 }, { sparse: true });
    
    // Employees collection indexes
    await mongoose.connection.db.collection('employees').createIndex({ employeeId: 1 }, { unique: true });
    await mongoose.connection.db.collection('employees').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.db.collection('employees').createIndex({ department: 1 });
    
    // Attendance collection indexes
    await mongoose.connection.db.collection('attendance').createIndex({ employeeId: 1, date: 1 }, { unique: true });
    await mongoose.connection.db.collection('attendance').createIndex({ date: 1 });
    
    // Leave requests collection indexes
    await mongoose.connection.db.collection('leaverequests').createIndex({ employeeId: 1 });
    await mongoose.connection.db.collection('leaverequests').createIndex({ status: 1 });
    
    // Salary collection indexes
    await mongoose.connection.db.collection('salaries').createIndex({ employeeId: 1, month: 1, year: 1 }, { unique: true });
    await mongoose.connection.db.collection('salaries').createIndex({ status: 1 });
    
    // Advance salary collection indexes
    await mongoose.connection.db.collection('advancesalaries').createIndex({ employeeId: 1 });
    await mongoose.connection.db.collection('advancesalaries').createIndex({ status: 1 });
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
};

module.exports = connectDB;