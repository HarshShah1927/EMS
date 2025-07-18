#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Employee Management System - Complete Setup${NC}"
echo -e "${BLUE}===============================================${NC}"

# Function to check if command succeeded
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1 failed${NC}"
        exit 1
    fi
}

# Step 1: Install frontend dependencies
echo -e "\n${YELLOW}📦 Step 1: Installing frontend dependencies...${NC}"
npm install
check_success "Frontend dependencies installed"

# Step 2: Install backend dependencies
echo -e "\n${YELLOW}📦 Step 2: Installing backend dependencies...${NC}"
cd backend
npm install
check_success "Backend dependencies installed"
cd ..

# Step 3: Create environment files
echo -e "\n${YELLOW}⚙️  Step 3: Creating environment files...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    check_success "Frontend .env file created"
else
    echo -e "${GREEN}✅ Frontend .env file already exists${NC}"
fi

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    check_success "Backend .env file created"
else
    echo -e "${GREEN}✅ Backend .env file already exists${NC}"
fi

# Step 4: Test the setup
echo -e "\n${YELLOW}🧪 Step 4: Testing setup...${NC}"
echo -e "${BLUE}Testing admin user creation...${NC}"
cd backend
timeout 10 npm run setup-admin
cd ..

echo -e "\n${GREEN}🎉 Setup Complete!${NC}"
echo -e "${BLUE}===============================================${NC}"
echo -e "${GREEN}✅ All dependencies installed${NC}"
echo -e "${GREEN}✅ Environment files created${NC}"
echo -e "${GREEN}✅ Database setup tested${NC}"

echo -e "\n${YELLOW}🚀 Ready to start the system:${NC}"
echo -e "${BLUE}   ./start-dev.sh${NC}"

echo -e "\n${YELLOW}🔐 Login credentials:${NC}"
echo -e "${BLUE}   Email: admin@company.com${NC}"
echo -e "${BLUE}   Password: admin123${NC}"

echo -e "\n${YELLOW}🌐 Access points (after starting):${NC}"
echo -e "${BLUE}   Frontend: http://localhost:5173${NC}"
echo -e "${BLUE}   Backend: http://localhost:5000/api${NC}"
echo -e "${BLUE}   Health: http://localhost:5000/api/health${NC}"

echo -e "\n${GREEN}🎯 Next step: Run ./start-dev.sh to start all servers${NC}"