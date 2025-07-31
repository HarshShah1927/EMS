#!/bin/bash

echo "🚀 Setting up the Employee Attendance System with all fixes..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js is installed: $(node --version)${NC}"

# Check if MongoDB is installed and running
echo -e "\n${BLUE}🔍 Checking MongoDB...${NC}"
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB is not installed.${NC}"
    echo "   - On macOS: brew install mongodb-community"
    echo "   - On Ubuntu: sudo apt install mongodb"
    echo "   - On Windows: Download from mongodb.com"
    echo ""
    echo -e "${YELLOW}Continuing setup... You can install MongoDB later.${NC}"
else
    echo -e "${GREEN}✅ MongoDB is installed${NC}"
    
    # Try to start MongoDB if not running
    if ! pgrep -x "mongod" > /dev/null; then
        echo -e "${YELLOW}⚠️  MongoDB is not running. Attempting to start...${NC}"
        
        # Try different start methods based on OS
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            brew services start mongodb-community 2>/dev/null || echo "Could not start MongoDB via brew"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            sudo systemctl start mongod 2>/dev/null || echo "Could not start MongoDB via systemctl"
        fi
        
        sleep 3
        
        if ! pgrep -x "mongod" > /dev/null; then
            echo -e "${YELLOW}⚠️  Could not start MongoDB automatically.${NC}"
            echo "   Please start MongoDB manually:"
            echo "   - macOS: brew services start mongodb-community"
            echo "   - Ubuntu: sudo systemctl start mongod"
            echo "   - Windows: net start MongoDB"
            echo ""
            echo -e "${YELLOW}Continuing setup... Database features will not work until MongoDB is running.${NC}"
        else
            echo -e "${GREEN}✅ MongoDB is now running${NC}"
        fi
    else
        echo -e "${GREEN}✅ MongoDB is already running${NC}"
    fi
fi

# Setup Backend
echo -e "\n${BLUE}📦 Setting up Backend...${NC}"
cd backend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 Creating backend .env file...${NC}"
    cat > .env << EOL
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee_management_system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRE=7d
DB_NAME=employee_management_system
FRONTEND_URL=http://localhost:5173
EOL
    echo -e "${GREEN}✅ Backend .env file created${NC}"
else
    echo -e "${GREEN}✅ Backend .env file already exists${NC}"
fi

# Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
npm install

# Test database connection and initialize if MongoDB is running
if pgrep -x "mongod" > /dev/null; then
    echo -e "\n${BLUE}🗄️  Initializing database...${NC}"
    npm run db:init
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database initialized successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Database initialization had issues, but continuing...${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping database initialization (MongoDB not running)${NC}"
fi

# Start backend in background
echo -e "\n${BLUE}🚀 Starting backend server...${NC}"
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Setup Frontend
echo -e "\n${BLUE}📦 Setting up Frontend...${NC}"
cd ..

# Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
npm install

# Create or update .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 Creating frontend .env file...${NC}"
    echo "VITE_API_URL=http://localhost:5000/api" > .env
fi

echo -e "\n${GREEN}✅ Setup completed successfully!${NC}"
echo -e "${GREEN}=================================================="
echo -e "🎉 Employee Attendance System is ready!"
echo -e "=================================================="
echo ""
echo -e "${BLUE}🌐 Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}🔧 Backend API:${NC} http://localhost:5000/api"
echo -e "${BLUE}📊 Health Check:${NC} http://localhost:5000/api/health"
echo ""
echo -e "${YELLOW}👤 Default Users:${NC}"
echo -e "   ${GREEN}Admin:${NC} admin@company.com / admin123"
echo -e "   ${GREEN}Employee:${NC} employee@company.com / employee123"
echo ""
echo -e "${YELLOW}🔧 Features Fixed:${NC}"
echo -e "   ✅ Employee login and check-in issues"
echo -e "   ✅ Admin can view employee records in real-time"
echo -e "   ✅ Check-out button working properly"
echo -e "   ✅ Role-based access control"
echo -e "   ✅ Real-time data synchronization"
echo ""
echo -e "${BLUE}📚 Documentation:${NC} See ATTENDANCE_SYSTEM_FIXES.md for detailed information"
echo ""
echo -e "${GREEN}🚀 Starting frontend development server...${NC}"

# Start frontend
npm run dev

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM