#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Employee Management System${NC}"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB is not running. Please start MongoDB first.${NC}"
    echo -e "${YELLOW}   You can start it with: brew services start mongodb/brew/mongodb-community${NC}"
    echo -e "${YELLOW}   Or: sudo systemctl start mongod${NC}"
    echo -e "${YELLOW}   Or: mongod --dbpath /path/to/your/db${NC}"
    exit 1
fi

# Function to cleanup background processes
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Trap Ctrl+C to cleanup
trap cleanup SIGINT

# Start backend server
echo -e "${GREEN}🔧 Starting backend server...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo -e "${GREEN}🎨 Starting frontend server...${NC}"
cd ..
npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Servers started successfully!${NC}"
echo -e "${BLUE}📱 Frontend: http://localhost:5173${NC}"
echo -e "${BLUE}🔧 Backend: http://localhost:5000${NC}"
echo -e "${BLUE}🏥 Health Check: http://localhost:5000/api/health${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID