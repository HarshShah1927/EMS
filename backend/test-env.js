const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔍 Environment Variables Test');
console.log('============================');
console.log('Current directory:', __dirname);
console.log('.env file path:', path.join(__dirname, '.env'));
console.log('');

console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set');
console.log('MONGODB_URI:', process.env.MONGODB_URI || 'not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'set (hidden)' : 'not set');
console.log('JWT_EXPIRE:', process.env.JWT_EXPIRE || 'not set');

console.log('');
console.log('All environment variables:');
Object.keys(process.env)
  .filter(key => key.startsWith('MONGODB') || key.startsWith('JWT') || key.startsWith('NODE') || key.startsWith('PORT'))
  .forEach(key => {
    console.log(`${key}:`, process.env[key]);
  });

// Test if .env file exists
const fs = require('fs');
const envPath = path.join(__dirname, '.env');
console.log('');
console.log('.env file exists:', fs.existsSync(envPath));
if (fs.existsSync(envPath)) {
  console.log('.env file contents:');
  console.log(fs.readFileSync(envPath, 'utf8'));
}