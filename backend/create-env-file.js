const fs = require('fs');

console.log('🔧 Creating .env file with correct MongoDB URI format');
console.log('====================================================');
console.log('');

// Check if .env already exists
if (fs.existsSync('.env')) {
  console.log('⚠️  .env file already exists. Creating backup...');
  fs.copyFileSync('.env', '.env.backup');
  console.log('✅ Backup created as .env.backup');
}

// Template for .env file
const envTemplate = `# Database Configuration
# Replace YOUR_PASSWORD_HERE with your actual MongoDB Atlas password
MONGODB_URI=mongodb+srv://harshmumbai1927:YOUR_ACTUAL_PASSWORD@cluster0.wd95y43.mongodb.net/?retryWrites=true&w=majority

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

// Write the .env file
fs.writeFileSync('.env', envTemplate);

console.log('✅ .env file created successfully!');
console.log('');
console.log('🔧 Next steps:');
console.log('1. Edit the .env file and replace YOUR_PASSWORD_HERE with your actual MongoDB Atlas password');
console.log('2. Make sure there are no extra spaces or characters');
console.log('3. Save the file');
console.log('4. Run: node check-mongodb-uri.js (to test the connection)');
console.log('5. Run: npm run setup (to initialize the database)');
console.log('');
console.log('📋 Your MongoDB URI should look exactly like this:');
console.log('mongodb+srv://harshmumbai1927:YOUR_ACTUAL_PASSWORD@cluster0.csof1rw.mongodb.net/?retryWrites=true&w=majority');
console.log('');
console.log('⚠️  Important: Replace YOUR_ACTUAL_PASSWORD with your real password!');
console.log('⚠️  Make sure there are no line breaks in the URI!');
console.log('⚠️  The URI should be on a single line!');
console.log('');
console.log('🔍 If your password contains special characters, you may need to URL encode them:');
console.log('@ → %40');
console.log('# → %23');
console.log('$ → %24');
console.log('% → %25');
console.log('& → %26');
console.log('+ → %2B');
console.log('= → %3D');
console.log('? → %3F');
console.log('/ → %2F');