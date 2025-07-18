# Windows Setup Guide - MongoDB Connection Fix

## 🚨 Windows-Specific Issue Fixed

The `mongodb-memory-server` module can sometimes have issues on Windows. Here are multiple solutions:

## 🚀 Quick Solutions (Choose One)

### Option 1: Use MongoDB Atlas (Recommended for Windows)
**Free cloud database - no local installation needed**

1. **Create MongoDB Atlas Account**:
   - Go to https://cloud.mongodb.com
   - Sign up for free
   - Create a new cluster (free tier)

2. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

3. **Update Environment**:
   ```bash
   # Edit backend/.env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ems?retryWrites=true&w=majority
   ```

4. **Run Setup**:
   ```bash
   cd backend
   npm run setup-simple
   ```

### Option 2: Use Docker (If you have Docker Desktop)
```bash
# Start MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Run setup
cd backend
npm run setup-simple
```

### Option 3: Install MongoDB Locally on Windows
1. **Download MongoDB**:
   - Go to https://www.mongodb.com/try/download/community
   - Download MongoDB Community Server for Windows

2. **Install MongoDB**:
   - Run the installer
   - Choose "Complete" installation
   - Install MongoDB as a service

3. **Start MongoDB**:
   - MongoDB should start automatically as a service
   - Or run: `net start MongoDB`

4. **Run Setup**:
   ```bash
   cd backend
   npm run setup-simple
   ```

### Option 4: Skip Database Setup (Frontend Only)
If you just want to see the frontend:

1. **Mock Backend** (create `backend/mock-server.js`):
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const app = express();
   
   app.use(cors());
   app.use(express.json());
   
   app.post('/api/auth/login', (req, res) => {
     res.json({
       success: true,
       data: {
         user: { id: '1', name: 'Admin', email: 'admin@company.com', role: 'admin' },
         token: 'mock-jwt-token'
       }
     });
   });
   
   app.get('/api/health', (req, res) => {
     res.json({ success: true, message: 'Mock server running' });
   });
   
   app.listen(5000, () => console.log('Mock server running on port 5000'));
   ```

2. **Start Mock Server**:
   ```bash
   cd backend
   node mock-server.js
   ```

3. **Start Frontend**:
   ```bash
   npm run dev
   ```

## 🔧 Troubleshooting Windows Issues

### Issue: "Cannot find module 'mongodb-memory-server'"
**Solution**: Use one of the options above instead of the in-memory database.

### Issue: "Python not found" during npm install
**Solution**: 
```bash
npm install --global windows-build-tools
```

### Issue: "node-gyp rebuild failed"
**Solution**: 
```bash
npm install --global node-gyp
npm config set msvs_version 2019
```

### Issue: PowerShell execution policy
**Solution**: 
```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📋 Windows-Specific Scripts

Create these batch files for easier setup:

### `setup-windows.bat`:
```batch
@echo off
echo Installing dependencies...
npm install
cd backend
npm install
cd ..

echo Creating environment files...
if not exist .env copy .env.example .env
if not exist backend\.env copy backend\.env.example backend\.env

echo Setup complete!
echo.
echo Choose your database option:
echo 1. MongoDB Atlas (recommended)
echo 2. Local MongoDB
echo 3. Docker MongoDB
echo 4. Mock server (frontend only)
pause
```

### `start-windows.bat`:
```batch
@echo off
echo Starting Employee Management System...

start "Backend" cmd /k "cd backend && npm run dev"
timeout /t 3
start "Frontend" cmd /k "npm run dev"

echo Servers started!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
pause
```

## 🎯 Recommended Windows Workflow

1. **Use MongoDB Atlas** (easiest, no local setup)
2. **Install dependencies**: `npm install` in both root and backend
3. **Create .env files**: Copy from .example files
4. **Update MongoDB URI**: Use Atlas connection string
5. **Run setup**: `npm run setup-simple`
6. **Start servers**: Use batch files or manual commands

## 🔐 Login Credentials

- **Email**: `admin@company.com`
- **Password**: `admin123`

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 📞 Still Having Issues?

If you're still having problems:

1. **Check Node.js version**: `node --version` (should be 16+)
2. **Clear npm cache**: `npm cache clean --force`
3. **Delete node_modules**: Remove folders and run `npm install` again
4. **Use the simple setup**: `npm run setup-simple` instead of other scripts

The key is to avoid the `mongodb-memory-server` dependency and use a real database instead!