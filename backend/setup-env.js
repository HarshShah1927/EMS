#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 EMS Environment Setup');
console.log('========================');
console.log('');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('⚠️  .env file already exists');
  
  // Check if MONGODB_URI is set
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('MONGODB_URI=') && !envContent.includes('YOUR_PASSWORD_HERE') && !envContent.includes('YOUR_ACTUAL_PASSWORD')) {
    console.log('✅ MONGODB_URI appears to be configured');
    console.log('');
    console.log('If you\'re still getting connection errors, please check:');
    console.log('1. Your MongoDB Atlas password is correct');
    console.log('2. Your IP address is whitelisted in MongoDB Atlas');
    console.log('3. Your cluster is running and accessible');
    process.exit(0);
  } else {
    console.log('❌ MONGODB_URI is not properly configured');
    console.log('');
  }
} else {
  console.log('❌ .env file not found');
  console.log('');
}

// Create or update .env file
console.log('Creating .env file with template...');

const envTemplate = `# Database Configuration
# Replace the password in the URI below with your actual MongoDB Atlas password
MONGODB_URI=mongodb+srv://harshmumbai1927:2h9WTwfurc2ouqbM@cluster0.wd95y43.mongodb.net/employee_management?retryWrites=true&w=majority&appName=Cluster0

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

try {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env file created successfully!');
  console.log('');
  console.log('🔧 Important Next Steps:');
  console.log('1. The MongoDB URI is already configured with the credentials from your test files');
  console.log('2. If the connection still fails, verify your MongoDB Atlas password is correct');
  console.log('3. Make sure your IP address is whitelisted in MongoDB Atlas Network Access');
  console.log('4. Test the connection by running: node test-db-connection.js');
  console.log('');
  console.log('📋 Your MongoDB URI is set to:');
  console.log('mongodb+srv://harshmumbai1927:****@cluster0.wd95y43.mongodb.net/employee_management');
  console.log('');
  console.log('🚀 You can now start the server with: npm start');
  
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('');
  console.log('Manual setup:');
  console.log('1. Create a file named ".env" in the backend directory');
  console.log('2. Add this line to the file:');
  console.log('   MONGODB_URI=mongodb+srv://harshmumbai1927:2h9WTwfurc2ouqbM@cluster0.wd95y43.mongodb.net/employee_management?retryWrites=true&w=majority&appName=Cluster0');
  process.exit(1);
}