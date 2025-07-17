# Quick Setup Guide - MongoDB Connection Fixed

## 🚨 Problem Solved!

The MongoDB connection error has been resolved! You no longer need to install MongoDB separately.

## 🎯 Quick Start (3 Steps)

### 1. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Create Environment Files
```bash
# Copy environment examples
cp .env.example .env
cp backend/.env.example backend/.env
```

### 3. Start Everything
```bash
# Start all servers (database + backend + frontend)
./start-dev.sh
```

## ✅ What's Fixed

- **No MongoDB Installation Required**: Uses in-memory MongoDB for development
- **Automatic Database Setup**: Creates admin user automatically
- **One-Command Start**: Single script starts everything
- **Environment Configuration**: Proper .env file setup

## 🔐 Login Credentials

- **Email**: `admin@company.com`
- **Password**: `admin123`

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 🔧 Alternative Setup Methods

### Option 1: Manual Setup (Step by Step)
```bash
# Terminal 1 - Start development database
cd backend
npm run setup-dev-db

# Terminal 2 - Start backend server
cd backend
npm run dev

# Terminal 3 - Start frontend server
npm run dev
```

### Option 2: With Real MongoDB (If Available)
```bash
# If you have MongoDB installed and running
cd backend
npm run setup-admin  # Creates admin user
npm run dev          # Start backend

# In another terminal
npm run dev          # Start frontend
```

## 🧪 Testing the Connection

1. **Health Check**:
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Login Test**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@company.com", "password": "admin123"}'
   ```

3. **Frontend Test**:
   - Open http://localhost:5173
   - Login with admin credentials
   - Should redirect to dashboard

## 📋 What Each Script Does

- **`./start-dev.sh`**: Starts database, backend, and frontend
- **`./check-mongodb.sh`**: Checks if MongoDB is running (for troubleshooting)
- **`backend/setup-dev-db.js`**: Creates in-memory database with admin user
- **`backend/setup-admin.js`**: Creates admin user in existing MongoDB

## 🚨 Troubleshooting

### If the start script fails:
1. Make sure you have Node.js installed
2. Run `npm install` in both root and backend directories
3. Check that ports 5173, 5000, and 27017 are available

### If login doesn't work:
1. Check that all three servers are running
2. Verify the admin user was created (check terminal output)
3. Try clearing browser cache/localStorage

### If API calls fail:
1. Check backend is running on port 5000
2. Verify CORS settings allow frontend origin
3. Check network tab in browser dev tools

## 🎉 Success!

You should now have:
- ✅ In-memory MongoDB running
- ✅ Backend API server running
- ✅ Frontend React app running
- ✅ Admin user created
- ✅ Full authentication working

The frontend and backend are now fully connected and ready for development!