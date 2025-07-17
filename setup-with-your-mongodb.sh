#!/bin/bash

# Employee Management System - Setup with Your MongoDB
# Customized for your MongoDB Atlas cluster

echo "🚀 Employee Management System - Setup with Your MongoDB"
echo "======================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# Your MongoDB details
MONGODB_BASE_URI="mongodb+srv://harshmumbai1927"
MONGODB_CLUSTER="@cluster0.czfzgkd.mongodb.net"
DATABASE_NAME="employee_management"

echo "🗄️  MongoDB Atlas Configuration"
echo "==============================="
echo "Your MongoDB cluster: cluster0.czfzgkd.mongodb.net"
echo "Database name: employee_management"
echo ""

# Ask for the database password
echo "🔑 Please enter your MongoDB Atlas password:"
echo "This is the password for user 'harshmumbai1927'"
read -s -p "Password: " DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Password is required. Please run the script again."
    exit 1
fi

# Construct the complete MongoDB URI
MONGODB_URI="${MONGODB_BASE_URI}:${DB_PASSWORD}${MONGODB_CLUSTER}/${DATABASE_NAME}?retryWrites=true&w=majority"

echo "✅ MongoDB URI configured"
echo ""

# Ask for admin credentials
echo "👤 Admin User Setup"
echo "==================="
read -p "Admin Email (default: admin@yourcompany.com): " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@yourcompany.com}

read -p "Admin Password (default: SecurePassword123!): " ADMIN_PASSWORD
ADMIN_PASSWORD=${ADMIN_PASSWORD:-SecurePassword123!}

read -p "Admin Name (default: System Administrator): " ADMIN_NAME
ADMIN_NAME=${ADMIN_NAME:-System Administrator}

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "your-super-secret-jwt-key-here-$(date +%s)")

echo ""
echo "📁 Creating project structure..."
echo "================================"

# Create directories
mkdir -p backend/config
mkdir -p backend/models
mkdir -p backend/routes
mkdir -p backend/middleware
mkdir -p backend/utils
mkdir -p backend/uploads
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/types

echo "✅ Project structure created"

echo ""
echo "🔧 Setting up Backend..."
echo "========================"

# Navigate to backend directory
cd backend

# Create backend package.json
cat > package.json << 'EOF'
{
  "name": "ems-backend",
  "version": "1.0.0",
  "description": "Employee Management System Backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "setup": "node setup.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.7",
    "moment": "^2.29.4",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

# Create .env file with your MongoDB URI
cat > .env << EOF
# Database Configuration
MONGODB_URI=$MONGODB_URI

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Default Admin Configuration
DEFAULT_ADMIN_EMAIL=$ADMIN_EMAIL
DEFAULT_ADMIN_PASSWORD=$ADMIN_PASSWORD
DEFAULT_ADMIN_NAME=$ADMIN_NAME

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EOF

echo "✅ Backend configuration created with your MongoDB URI"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "✅ Backend dependencies installed"

# Go back to project root
cd ..

echo ""
echo "🎨 Setting up Frontend..."
echo "========================="

# Create frontend package.json
cat > package.json << 'EOF'
{
  "name": "employee-management-system",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}
EOF

# Create frontend .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF

echo "✅ Frontend configuration created"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "✅ Frontend dependencies installed"

echo ""
echo "🗄️  Testing MongoDB Connection..."
echo "=================================="

# Test MongoDB connection
cd backend
node -e "
const mongoose = require('mongoose');
const uri = '$MONGODB_URI';

console.log('Testing MongoDB connection...');
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    console.log('Database: employee_management');
    console.log('Cluster: cluster0.czfzgkd.mongodb.net');
    process.exit(0);
  })
  .catch((error) => {
    console.log('❌ MongoDB connection failed:');
    console.log(error.message);
    process.exit(1);
  });
"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Setup Complete!"
    echo "=================="
    echo ""
    echo "✅ Your Employee Management System is ready!"
    echo ""
    echo "📋 Your Configuration:"
    echo "• MongoDB Cluster: cluster0.czfzgkd.mongodb.net"
    echo "• Database: employee_management"
    echo "• Admin Email: $ADMIN_EMAIL"
    echo "• Admin Password: $ADMIN_PASSWORD"
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Initialize the database:"
    echo "   cd backend && npm run setup"
    echo ""
    echo "2. Start the backend server:"
    echo "   cd backend && npm run dev"
    echo ""
    echo "3. In a new terminal, start the frontend:"
    echo "   npm run dev"
    echo ""
    echo "4. Open your browser and go to: http://localhost:5173"
    echo ""
    echo "🔐 Login with:"
    echo "Email: $ADMIN_EMAIL"
    echo "Password: $ADMIN_PASSWORD"
    echo ""
    echo "⚠️  Important: Change the default password after first login!"
else
    echo ""
    echo "❌ MongoDB connection test failed."
    echo "Please check:"
    echo "1. Your password is correct"
    echo "2. Your IP address is whitelisted in MongoDB Atlas"
    echo "3. Your cluster is running"
    echo ""
    echo "You can still continue with the setup and fix the connection later."
fi

cd ..
echo ""
echo "🎯 Ready to start developing!"