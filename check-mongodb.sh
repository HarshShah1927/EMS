#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Checking MongoDB status...${NC}"

# Check if MongoDB is running
if pgrep -x "mongod" > /dev/null; then
    echo -e "${GREEN}✅ MongoDB is running${NC}"
    
    # Try to connect and show status
    if command -v mongosh &> /dev/null; then
        echo -e "${BLUE}📊 MongoDB connection test:${NC}"
        mongosh --eval "db.runCommand('ping')" --quiet 2>/dev/null || echo -e "${YELLOW}⚠️  Could not connect to MongoDB${NC}"
    elif command -v mongo &> /dev/null; then
        echo -e "${BLUE}📊 MongoDB connection test:${NC}"
        mongo --eval "db.runCommand('ping')" --quiet 2>/dev/null || echo -e "${YELLOW}⚠️  Could not connect to MongoDB${NC}"
    fi
else
    echo -e "${RED}❌ MongoDB is not running${NC}"
    echo -e "${YELLOW}To start MongoDB, try one of these commands:${NC}"
    echo -e "${BLUE}  • macOS (Homebrew): brew services start mongodb/brew/mongodb-community${NC}"
    echo -e "${BLUE}  • Ubuntu/Debian: sudo systemctl start mongod${NC}"
    echo -e "${BLUE}  • CentOS/RHEL: sudo systemctl start mongod${NC}"
    echo -e "${BLUE}  • Manual: mongod --dbpath /path/to/your/db${NC}"
    echo -e "${BLUE}  • Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest${NC}"
    echo ""
    echo -e "${YELLOW}After starting MongoDB, run this script again to verify.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ MongoDB check completed${NC}"