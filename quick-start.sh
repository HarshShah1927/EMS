#!/bin/bash

# Employee Management System - Quick Start Script
# This script helps you set up the EMS system quickly

echo "🚀 Employee Management System - Quick Start Setup"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# Create directories if they don't exist
mkdir -p backend/config
mkdir -p backend/models
mkdir -p backend/routes
mkdir -p backend/middleware
mkdir -p backend/utils
mkdir -p backend/uploads

echo "📁 Created backend directory structure"
echo ""

# Ask for MongoDB Atlas connection string
echo "🗄️  MongoDB Atlas Setup"
echo "======================"
echo "Please provide your MongoDB Atlas connection string:"
echo "Example: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/employee_management?retryWrites=true&w=majority"
echo ""
read -p "MongoDB URI: " MONGODB_URI

if [ -z "$MONGODB_URI" ]; then
    echo "❌ MongoDB URI is required. Please run the script again with a valid URI."
    exit 1
fi

# Ask for admin credentials
echo ""
echo "👤 Admin User Setup"
echo "==================="
read -p "Admin Email (default: admin@company.com): " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@company.com}

read -p "Admin Password (default: SecurePassword123!): " ADMIN_PASSWORD
ADMIN_PASSWORD=${ADMIN_PASSWORD:-SecurePassword123!}

read -p "Admin Name (default: System Administrator): " ADMIN_NAME
ADMIN_NAME=${ADMIN_NAME:-System Administrator}

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "your-super-secret-jwt-key-here-$(date +%s)")

echo ""
echo "🔧 Setting up Backend..."
echo "========================"

# Navigate to backend directory
cd backend

# Create .env file
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

echo "✅ Created backend .env file"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "✅ Backend dependencies installed"

# Initialize database
echo "🗄️  Initializing database..."
npm run setup

if [ $? -ne 0 ]; then
    echo "❌ Failed to initialize database"
    exit 1
fi

echo "✅ Database initialized successfully"

# Go back to project root
cd ..

echo ""
echo "🎨 Setting up Frontend..."
echo "========================="

# Create frontend .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF

echo "✅ Created frontend .env file"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "✅ Frontend dependencies installed"

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Your Employee Management System is now ready to use!"
echo ""
echo "📋 Next Steps:"
echo "1. Start the backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   npm run dev"
echo ""
echo "3. Open your browser and go to: http://localhost:5173"
echo ""
echo "🔐 Default Login Credentials:"
echo "Email: $ADMIN_EMAIL"
echo "Password: $ADMIN_PASSWORD"
echo ""
echo "⚠️  Important Security Notes:"
echo "- Change the default admin password immediately after first login"
echo "- Update default employee passwords (password123)"
echo "- Review and update security settings before production use"
echo ""
echo "📖 For detailed instructions, see: COMPLETE_EMS_SETUP_GUIDE.md"
echo ""
echo "🚀 Happy managing!"