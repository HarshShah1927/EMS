const fs = require('fs');
const mongoose = require('mongoose');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 MongoDB URI Fixer');
console.log('====================');
console.log('');
console.log('This script will help you create a properly formatted MongoDB URI');
console.log('');

// Function to ask for password
function askPassword() {
  return new Promise((resolve) => {
    rl.question('Enter your MongoDB Atlas password for user "harshmumbai1927": ', (password) => {
      resolve(password);
    });
  });
}

// Function to test connection
async function testConnection(uri) {
  try {
    console.log('🔗 Testing connection...');
    await mongoose.connect(uri);
    console.log('✅ Connection successful!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    await mongoose.connection.close();
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return false;
  }
}

// Function to create .env file
function createEnvFile(uri) {
  const envContent = `# Database Configuration
MONGODB_URI=${uri}

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-${Date.now()}
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Default Admin Configuration
DEFAULT_ADMIN_EMAIL=admin@yourcompany.com
DEFAULT_ADMIN_PASSWORD=SecurePassword123!
DEFAULT_ADMIN_NAME=System Administrator

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file created successfully!');
}

// Main function
async function main() {
  try {
    // Get password from user
    const password = await askPassword();
    
    if (!password) {
      console.log('❌ Password is required');
      process.exit(1);
    }
    
    console.log('');
    console.log('🔨 Creating MongoDB URI...');
    
    // Create the complete URI
    const baseUri = 'mongodb+srv://harshmumbai1927';
    const cluster = 'cluster0.czfzgkd.mongodb.net';
    const database = 'employee_management';
    const options = 'retryWrites=true&w=majority';
    
    const completeUri = `${baseUri}:${password}@${cluster}/${database}?${options}`;
    
    console.log('✅ URI created');
    console.log('');
    
    // Show URI with hidden password
    const hiddenUri = completeUri.replace(/:([^:@]+)@/, ':****@');
    console.log('📋 Your MongoDB URI:');
    console.log(hiddenUri);
    console.log('');
    
    // Test the connection
    const isConnected = await testConnection(completeUri);
    
    if (isConnected) {
      console.log('');
      console.log('🎉 Connection successful! Creating .env file...');
      createEnvFile(completeUri);
      console.log('');
      console.log('🚀 Next steps:');
      console.log('1. Run: npm run setup');
      console.log('2. Run: npm run dev');
      console.log('3. Start frontend: cd .. && npm run dev');
    } else {
      console.log('');
      console.log('❌ Connection failed. Please check:');
      console.log('1. Your password is correct');
      console.log('2. Your IP is whitelisted in MongoDB Atlas');
      console.log('3. Your cluster is running');
      console.log('4. Your internet connection is stable');
      console.log('');
      console.log('📋 MongoDB Atlas Quick Checks:');
      console.log('• Go to https://cloud.mongodb.com/');
      console.log('• Check Clusters → Make sure cluster0 is running');
      console.log('• Check Network Access → Add your IP or use 0.0.0.0/0');
      console.log('• Check Database Access → Verify user "harshmumbai1927" exists');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Run the script
main();