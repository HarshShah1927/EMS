#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Employee Management System${NC}"

# Function to cleanup background processes
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Trap Ctrl+C to cleanup
trap cleanup SIGINT

# Start development database
echo -e "${GREEN}🗄️  Starting development database...${NC}"
cd backend
npm run setup-dev-db &
DB_PID=$!

# Wait for database to start
echo -e "${YELLOW}⏳ Waiting for database to initialize...${NC}"
sleep 8

# Start backend server
echo -e "${GREEN}🔧 Starting backend server...${NC}"
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo -e "${GREEN}🎨 Starting frontend server...${NC}"
cd ..
npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}✅ All servers started successfully!${NC}"
echo -e "${BLUE}📱 Frontend: http://localhost:5173${NC}"
echo -e "${BLUE}🔧 Backend: http://localhost:5000${NC}"
echo -e "${BLUE}🏥 Health Check: http://localhost:5000/api/health${NC}"
echo -e "${BLUE}🗄️  Database: In-memory MongoDB (no installation required)${NC}"
echo -e "${YELLOW}📧 Login: admin@company.com | 🔑 Password: admin123${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"

# Wait for all processes
wait $DB_PID $BACKEND_PID $FRONTEND_PID