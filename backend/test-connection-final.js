const mongoose = require('mongoose');

console.log('🔗 Final MongoDB Connection Test');
console.log('================================');
console.log('');

// Your correct MongoDB URI with new password
const MONGODB_URI = 'mongodb+srv://harshmumbai1927:2h9WTwfurc2ouqbM@cluster0.wd95y43.mongodb.net/employee_management?retryWrites=true&w=majority&appName=Cluster0';

console.log('📋 Configuration:');
console.log('• Cluster: cluster0.wd95y43.mongodb.net');
console.log('• User: harshmumbai1927');
console.log('• Password: 2h9WTwfurc2ouqbM');
console.log('• Database: employee_management');
console.log('');

// Test the connection
console.log('🔗 Testing connection...');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ SUCCESS! Connection established!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log('');
    console.log('🎉 Your MongoDB is ready for the EMS system!');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Run: npm run setup');
    console.log('2. Run: npm run dev');
    console.log('3. Start frontend: cd .. && npm run dev');
    console.log('4. Open http://localhost:5173 in your browser');
    console.log('');
    console.log('🔐 Default Login Credentials:');
    console.log('Email: admin@yourcompany.com');
    console.log('Password: SecurePassword123!');
    console.log('');
    console.log('⚠️  Remember to change the default password after first login!');
    
    process.exit(0);
  })
  .catch((error) => {
    console.log('❌ Connection failed!');
    console.log('');
    console.log('Error:', error.message);
    console.log('');
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('🔧 DNS Resolution Error');
      console.log('💡 Your cluster URL might be incorrect');
      console.log('💡 Expected: cluster0.wd95y43.mongodb.net');
      console.log('💡 Check your MongoDB Atlas dashboard for the correct URL');
    } else if (error.message.includes('authentication failed')) {
      console.log('🔧 Authentication Error');
      console.log('💡 Password might be incorrect: 2h9WTwfurc2ouqbM');
      console.log('💡 Check your MongoDB Atlas Database Access settings');
    } else if (error.message.includes('IP')) {
      console.log('🔧 Network Access Error');
      console.log('💡 Your IP address is not whitelisted');
      console.log('💡 Go to MongoDB Atlas → Network Access → Add IP Address');
      console.log('💡 Add your current IP or use 0.0.0.0/0 for testing');
    }
    
    console.log('');
    console.log('📋 MongoDB Atlas Troubleshooting:');
    console.log('1. Go to https://cloud.mongodb.com/');
    console.log('2. Check that your cluster is running (not paused)');
    console.log('3. Verify Network Access allows your IP');
    console.log('4. Confirm Database Access user credentials');
    console.log('5. Copy the connection string from "Connect" button');
    console.log('');
    console.log('🔧 If the cluster URL is different, update your .env file');
    
    process.exit(1);
  });