# Database Connection Fix Guide

## ❌ Problem
```
Database connection error: The `uri` parameter to `openUri()` must be a string, got "undefined". 
Make sure the first parameter to `mongoose.connect()` or `mongoose.createConnection()` is a string.
```

## 🔧 Solution Steps

### Step 1: Quick Fix - Run the Test Script
```bash
cd backend
npm run test:env
```

This will:
- Check if `.env` file exists
- Create one if missing
- Test environment variables
- Test database connection
- Provide specific error messages

### Step 2: Manual Setup (if needed)

#### Create Backend .env File
Create `backend/.env` with the following content:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee_management_system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRE=7d
DB_NAME=employee_management_system
FRONTEND_URL=http://localhost:5173
```

#### Ensure MongoDB is Running

**macOS:**
```bash
# Install MongoDB (if not installed)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Check if running
brew services list | grep mongodb
```

**Ubuntu/Linux:**
```bash
# Install MongoDB (if not installed)
sudo apt update
sudo apt install mongodb

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Check if running
sudo systemctl status mongod
```

**Windows:**
```cmd
# Start MongoDB service
net start MongoDB

# Or use Services.msc to start MongoDB service
```

### Step 3: Initialize Database
```bash
cd backend
npm run db:init
```

This will:
- Create default users (admin, hr, employee)
- Set up database indexes
- Verify connection

### Step 4: Start the System
```bash
# Start backend
cd backend
npm start

# Start frontend (in new terminal)
cd ..
npm run dev
```

## 🧪 Testing Commands

### Test Environment Variables
```bash
cd backend
npm run test:env
```

### Test Database Connection Only
```bash
cd backend
npm run db:test
```

### Initialize Database with Users
```bash
cd backend
npm run db:init
```

## 🚨 Common Issues & Solutions

### Issue 1: MongoDB Not Installed
**Error:** `command not found: mongod`

**Solution:**
- **macOS:** `brew install mongodb-community`
- **Ubuntu:** `sudo apt install mongodb`
- **Windows:** Download from [mongodb.com](https://www.mongodb.com/try/download/community)

### Issue 2: MongoDB Not Running
**Error:** `ECONNREFUSED`

**Solution:**
- **macOS:** `brew services start mongodb-community`
- **Ubuntu:** `sudo systemctl start mongod`
- **Windows:** `net start MongoDB`

### Issue 3: .env File Missing
**Error:** `MONGODB_URI is not defined`

**Solution:**
```bash
cd backend
npm run test:env  # This will create the .env file automatically
```

### Issue 4: Permission Issues (Linux/macOS)
**Error:** `Permission denied`

**Solution:**
```bash
# Fix MongoDB data directory permissions
sudo chown -R $(whoami) /usr/local/var/mongodb
sudo chown -R $(whoami) /usr/local/var/log/mongodb

# Or create new data directory
mkdir -p ~/mongodb/data
mongod --dbpath ~/mongodb/data
```

### Issue 5: Port Already in Use
**Error:** `EADDRINUSE: address already in use`

**Solution:**
```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)

# Or change port in .env file
PORT=5001
```

## 🔄 Complete Reset (if nothing works)

If you're still having issues, try this complete reset:

```bash
# 1. Stop all processes
pkill -f "node"
pkill -f "mongod"

# 2. Remove node_modules and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

cd ..
rm -rf node_modules package-lock.json
npm install

# 3. Reset MongoDB data (CAUTION: This deletes all data)
# macOS:
rm -rf /usr/local/var/mongodb/*

# Linux:
sudo rm -rf /var/lib/mongodb/*

# 4. Start fresh
brew services restart mongodb-community  # macOS
# OR
sudo systemctl restart mongod  # Linux

# 5. Run setup
./setup-attendance-system.sh
```

## 📋 Verification Checklist

After setup, verify everything works:

- [ ] ✅ Node.js installed (`node --version`)
- [ ] ✅ MongoDB installed (`mongod --version`)
- [ ] ✅ MongoDB running (`brew services list | grep mongodb` or `ps aux | grep mongod`)
- [ ] ✅ Backend .env file exists and has MONGODB_URI
- [ ] ✅ Frontend .env file exists and has VITE_API_URL
- [ ] ✅ Database connection test passes (`npm run test:env`)
- [ ] ✅ Database initialized with users (`npm run db:init`)
- [ ] ✅ Backend starts without errors (`npm start`)
- [ ] ✅ Frontend starts without errors (`npm run dev`)
- [ ] ✅ Can login with test users
- [ ] ✅ Attendance features work

## 🎯 Default Test Users

After successful setup, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | admin123 |
| HR | hr@company.com | hr123 |
| Employee | employee@company.com | employee123 |

## 📞 Still Having Issues?

If you're still experiencing problems:

1. **Run the diagnostic:**
   ```bash
   cd backend
   npm run test:env
   ```

2. **Check the logs:**
   - Backend logs will show specific error messages
   - MongoDB logs: `/usr/local/var/log/mongodb/mongo.log` (macOS)

3. **Try the automated setup:**
   ```bash
   ./setup-attendance-system.sh
   ```

4. **Manual step-by-step setup:**
   ```bash
   # Backend
   cd backend
   npm install
   npm run test:env
   npm run db:init
   npm start
   
   # Frontend (new terminal)
   cd ..
   npm install
   npm run dev
   ```

The system should now work correctly with all attendance features functional! 🎉