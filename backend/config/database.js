const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is defined
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      console.error('💡 Please check your .env file in the backend directory');
      console.error('💡 Expected format: MONGODB_URI=mongodb://localhost:27017/database_name');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    console.log(`📍 URI: ${mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Hide credentials in logs
    
    // Connect to MongoDB with proper options
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

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
      console.error('🔧 Connection Refused - MongoDB server is not running');
      console.error('💡 Start MongoDB service:');
      console.error('   - macOS: brew services start mongodb-community');
      console.error('   - Ubuntu: sudo systemctl start mongod');
      console.error('   - Windows: net start MongoDB');
    } else if (error.message.includes('uri parameter')) {
      console.error('🔧 Invalid MongoDB URI format');
      console.error('💡 Check your MONGODB_URI in .env file');
      console.error('💡 Expected format: mongodb://localhost:27017/database_name');
    }
    
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