const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

console.log('🔍 MongoDB URI Checker');
console.log('======================');
console.log('');

// Check if .env file exists and has MONGODB_URI
if (!process.env.MONGODB_URI) {
  console.log('❌ MONGODB_URI not found in .env file');
  console.log('');
  console.log('🔧 To fix this:');
  console.log('1. Create a .env file in the backend directory');
  console.log('2. Add your MongoDB URI like this:');
  console.log('   MONGODB_URI=mongodb+srv://harshmumbai1927:2h9WTwfurc2ouqbM@cluster0.wd95y43.mongodb.net/?retryWrites=true&w=majority');
  console.log('');
  console.log('3. Replace YOUR_PASSWORD with your actual MongoDB Atlas password');
  process.exit(1);
}

console.log('✅ MONGODB_URI found in .env file');
console.log('');

// Show the URI (with password hidden)
const uri = process.env.MONGODB_URI;
const hiddenUri = uri.replace(/:([^:@]+)@/, ':****@');
console.log('📋 Your MongoDB URI:');
console.log(hiddenUri);
console.log('');

// Validate URI format
if (!uri.includes('mongodb+srv://')) {
  console.log('❌ Invalid URI format - should start with mongodb+srv://');
  process.exit(1);
}

if (!uri.includes('cluster0.czfzgkd.mongodb.net')) {
  console.log('❌ Incorrect cluster URL - should be cluster0.czfzgkd.mongodb.net');
  console.log('💡 Your URI should look like:');
  console.log('   mongodb+srv://harshmumbai1927:2h9WTwfurc2ouqbM@cluster0.wd95y43.mongodb.net/?retryWrites=true&w=majority');
  process.exit(1);
}

if (!uri.includes('harshmumbai1927')) {
  console.log('❌ Incorrect username - should be harshmumbai1927');
  process.exit(1);
}

console.log('✅ URI format looks correct');
console.log('');

// Test the connection
console.log('🔗 Testing MongoDB connection...');
console.log('');

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connection successful!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log('');
    console.log('🎉 Your MongoDB is ready for the EMS system!');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Run: npm run setup');
    console.log('2. Run: npm run dev');
    process.exit(0);
  })
  .catch((error) => {
    console.log('❌ Connection failed!');
    console.log('');
    console.log('Error:', error.message);
    console.log('');
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('🔧 DNS Resolution Error');
      console.log('💡 This usually means:');
      console.log('   - Your cluster URL is incorrect');
      console.log('   - Internet connection issue');
      console.log('   - DNS resolution problem');
      console.log('');
      console.log('✅ Correct format:');
      console.log('   mongodb+srv://harshmumbai1927:PASSWORD@cluster0.czfzgkd.mongodb.net/employee_management?retryWrites=true&w=majority');
    } else if (error.message.includes('authentication failed')) {
      console.log('🔧 Authentication Error');
      console.log('💡 Check your MongoDB Atlas password');
      console.log('💡 Ensure the user has proper permissions');
    } else if (error.message.includes('IP')) {
      console.log('🔧 Network Access Error');
      console.log('💡 Add your IP to MongoDB Atlas Network Access');
      console.log('💡 Go to MongoDB Atlas → Network Access → Add IP Address');
      console.log('💡 For testing, you can use 0.0.0.0/0 (not recommended for production)');
    }
    
    console.log('');
    console.log('📋 MongoDB Atlas Checklist:');
    console.log('1. ✓ Cluster is running');
    console.log('2. ✓ Database user exists with correct password');
    console.log('3. ✓ User has "Read and write to any database" permissions');
    console.log('4. ✓ Your IP is whitelisted in Network Access');
    console.log('5. ✓ Cluster URL is correct: cluster0.czfzgkd.mongodb.net');
    
    process.exit(1);
  });


