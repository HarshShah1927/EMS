const mongoose = require('mongoose');

// Your MongoDB cluster details
const MONGODB_BASE_URI = 'mongodb+srv://harshmumbai1927';
const MONGODB_CLUSTER = '@cluster0.czfzgkd.mongodb.net';
const DATABASE_NAME = 'employee_management';

// You need to replace 'YOUR_PASSWORD_HERE' with your actual password
const DB_PASSWORD = 'YOUR_PASSWORD_HERE'; // Replace this with your actual password

// Complete MongoDB URI
const MONGODB_URI = `${MONGODB_BASE_URI}:${DB_PASSWORD}${MONGODB_CLUSTER}/${DATABASE_NAME}?retryWrites=true&w=majority`;

console.log('🔗 Testing MongoDB Connection...');
console.log('Cluster: cluster0.czfzgkd.mongodb.net');
console.log('Database: employee_management');
console.log('User: harshmumbai1927');
console.log('');

// Test the connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connection successful!');
  console.log('✅ Database "employee_management" is ready');
  console.log('✅ Your EMS system can connect to the database');
  console.log('');
  console.log('🎉 You can now proceed with the full setup!');
  process.exit(0);
})
.catch((error) => {
  console.log('❌ MongoDB connection failed!');
  console.log('');
  console.log('Error details:');
  console.log(error.message);
  console.log('');
  console.log('🔧 Common solutions:');
  console.log('1. Check your password is correct');
  console.log('2. Ensure your IP address is whitelisted in MongoDB Atlas');
  console.log('3. Verify your cluster is running');
  console.log('4. Check your internet connection');
  console.log('');
  console.log('📋 To fix:');
  console.log('1. Go to MongoDB Atlas dashboard');
  console.log('2. Check Network Access -> IP Whitelist');
  console.log('3. Add your current IP or use 0.0.0.0/0 for testing');
  console.log('4. Verify Database Access -> Database Users');
  process.exit(1);
});