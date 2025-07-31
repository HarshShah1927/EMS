#!/bin/bash
echo "🚀 EMS MongoDB Fix Script"

# Install MongoDB if not present
if ! command -v mongod &> /dev/null; then
    echo "Installing MongoDB..."
    sudo apt update
    sudo apt install -y mongodb
    sudo systemctl start mongodb
    sudo systemctl enable mongodb
fi

# Start MongoDB if not running
sudo systemctl start mongodb 2>/dev/null || docker run -d --name mongodb-ems -p 27017:27017 mongo:latest

# Navigate to backend
cd backend

# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/ems_database
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DEFAULT_ADMIN_EMAIL=admin@company.com
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_EMPLOYEE_EMAIL=employee@company.com
DEFAULT_EMPLOYEE_PASSWORD=employee123
EOF

echo "✅ Environment configured"

# Install dependencies and run setup
npm install
node setup.js

echo "🎉 Setup complete!"
echo "Login with: admin@company.com / admin123"
echo "Or: employee@company.com / employee123"

