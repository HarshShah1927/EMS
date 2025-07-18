require('dotenv').config();
const mongoose = require('mongoose');

const fixIndexes = async () => {
  try {
    console.log('🔧 Fixing database indexes...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log('📊 Found collections:', collections.map(c => c.name));
    
    // Fix User collection indexes
    if (collections.some(c => c.name === 'users')) {
      const userCollection = db.collection('users');
      
      console.log('🔍 Checking User collection indexes...');
      const userIndexes = await userCollection.indexes();
      console.log('Current indexes:', userIndexes.map(i => ({ name: i.name, key: i.key })));
      
      // Drop conflicting employeeId index if it exists
      const conflictingIndex = userIndexes.find(i => i.name === 'employeeId_1');
      if (conflictingIndex) {
        console.log('🗑️  Dropping conflicting employeeId index...');
        await userCollection.dropIndex('employeeId_1');
        console.log('✅ Dropped employeeId_1 index');
      }
    }
    
    // Fix Employee collection indexes  
    if (collections.some(c => c.name === 'employees')) {
      const employeeCollection = db.collection('employees');
      
      console.log('🔍 Checking Employee collection indexes...');
      const employeeIndexes = await employeeCollection.indexes();
      console.log('Current indexes:', employeeIndexes.map(i => ({ name: i.name, key: i.key })));
      
      // Drop conflicting employeeId index if it exists
      const conflictingIndex = employeeIndexes.find(i => i.name === 'employeeId_1');
      if (conflictingIndex) {
        console.log('🗑️  Dropping conflicting employeeId index...');
        await employeeCollection.dropIndex('employeeId_1');
        console.log('✅ Dropped employeeId_1 index');
      }
    }
    
    console.log('✅ Index cleanup completed!');
    console.log('');
    console.log('🚀 You can now run: npm run setup');
    
  } catch (error) {
    console.error('❌ Error fixing indexes:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

fixIndexes();