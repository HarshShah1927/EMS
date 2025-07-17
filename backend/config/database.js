const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Remove deprecated options - they're not needed in newer versions
    const conn = await mongoose.connect(process.env.MONGODB_URI);

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