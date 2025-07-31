#!/usr/bin/env node

const dotenv = require('dotenv');
const path = require('path');

console.log('🧪 Testing Environment Variables and Database Connection');
console.log('=========================================================');

// Load environment variables
console.log('📁 Loading .env file...');
const envPath = path.join(__dirname, '.env');
console.log(`📍 Looking for .env at: ${envPath}`);

const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('❌ Error loading .env file:', result.error.message);
    console.log('💡 Creating a basic .env file...');
    
    const fs = require('fs');
    const envContent = `NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee_management_system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRE=7d
DB_NAME=employee_management_system
FRONTEND_URL=http://localhost:5173`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file');
    
    // Reload environment variables
    dotenv.config({ path: envPath });
} else {
    console.log('✅ .env file loaded successfully');
}

console.log('\n🔍 Environment Variables:');
console.log('========================');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`PORT: ${process.env.PORT || 'not set'}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '***set***' : 'not set'}`);
console.log(`MONGODB_URI: ${process.env.MONGODB_URI || 'not set'}`);
console.log(`DB_NAME: ${process.env.DB_NAME || 'not set'}`);
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || 'not set'}`);

// Test database connection
console.log('\n🗄️  Testing Database Connection:');
console.log('================================');

const mongoose = require('mongoose');

const testConnection = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined');
        }
        
        console.log(`📍 Connecting to: ${mongoURI}`);
        
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000, // 5 second timeout
        });
        
        console.log('✅ Database connection successful!');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
        
        await mongoose.disconnect();
        console.log('✅ Database disconnected successfully');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.error('');
            console.error('🔧 MongoDB is not running. Start it with:');
            console.error('   - macOS: brew services start mongodb-community');
            console.error('   - Ubuntu: sudo systemctl start mongod');
            console.error('   - Windows: net start MongoDB');
        } else if (error.message.includes('uri parameter')) {
            console.error('');
            console.error('🔧 Invalid MongoDB URI. Check your .env file.');
        }
        
        process.exit(1);
    }
};

testConnection();