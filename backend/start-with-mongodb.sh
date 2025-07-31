#!/bin/bash

echo "🚀 Starting EMS MongoDB Setup..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install Node.js if not present
if ! command_exists node; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install MongoDB
if ! command_exists mongod; then
    echo "📦 Installing MongoDB..."
    
    # Import MongoDB public GPG key
    curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    
    # Add MongoDB repository
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    # Update package list and install MongoDB
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    
    # Start MongoDB service
    sudo systemctl start mongod
    sudo systemctl enable mongod
    
    echo "✅ MongoDB installed and started"
else
    echo "✅ MongoDB already installed"
    sudo systemctl start mongod 2>/dev/null || true
fi

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 5

# Check if MongoDB is running
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB failed to start, trying Docker..."
    
    # Try Docker as fallback
    if command_exists docker; then
        echo "🐳 Starting MongoDB with Docker..."
        docker run -d --name mongodb-ems -p 27017:27017 mongo:latest
        sleep 10
        echo "✅ MongoDB Docker container started"
    else
        echo "❌ Neither MongoDB nor Docker is available"
        exit 1
    fi
fi

# Create .env file
echo "📝 Creating .env file..."
cat > .env << 'EOF'
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ems_database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CLIENT_URL=http://localhost:5173

# Default Admin Configuration
DEFAULT_ADMIN_EMAIL=admin@company.com
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_NAME=System Administrator

# Default Employee Configuration
DEFAULT_EMPLOYEE_EMAIL=employee@company.com
DEFAULT_EMPLOYEE_PASSWORD=employee123
DEFAULT_EMPLOYEE_NAME=Test Employee
EOF

echo "✅ .env file created"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run setup script
echo "🔧 Setting up database and default users..."
node setup.js

echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Default Login Credentials:"
echo "   Admin: admin@company.com / admin123"
echo "   Employee: employee@company.com / employee123"
echo ""
echo "🚀 Starting server..."
npm start