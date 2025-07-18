require('dotenv').config();
const mongoose = require('mongoose');

const clearCollections = async () => {
  try {
    console.log('🔧 Clearing problematic collections...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Drop users collection
    try {
      await db.collection('users').drop();
      console.log('✅ Dropped users collection');
    } catch (error) {
      if (error.message.includes('ns not found')) {
        console.log('ℹ️  users collection does not exist');
      } else {
        throw error;
      }
    }
    
    // Drop employees collection
    try {
      await db.collection('employees').drop();
      console.log('✅ Dropped employees collection');
    } catch (error) {
      if (error.message.includes('ns not found')) {
        console.log('ℹ️  employees collection does not exist');
      } else {
        throw error;
      }
    }
    
    console.log('✅ Collections cleared successfully!');
    console.log('🚀 You can now run: npm run setup');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

clearCollections();