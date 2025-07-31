# MongoDB Connection Error Fix

## Problem
❌ Database connection error: The `uri` parameter to `openUri()` must be a string, got "undefined"

## Root Cause
The `MONGODB_URI` environment variable is not set in the `.env` file, causing `process.env.MONGODB_URI` to be `undefined`.

## Solution

### Step 1: Create .env file in the backend directory

Create a file named `.env` in the `backend` directory with the following content:

```env
MONGODB_URI=mongodb+srv://harshmumbai1927:2h9WTwfurc2ouqbM@cluster0.wd95y43.mongodb.net/employee_management?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-here-1736960000000
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
DEFAULT_ADMIN_EMAIL=admin@yourcompany.com
DEFAULT_ADMIN_PASSWORD=SecurePassword123!
DEFAULT_ADMIN_NAME=System Administrator
```

### Step 2: Quick Commands to Fix

#### Option A: Use the setup script
```bash
cd backend
node setup-env.js
```

#### Option B: Manual creation
```bash
cd backend
echo 'MONGODB_URI=mongodb+srv://harshmumbai1927:2h9WTwfurc2ouqbM@cluster0.wd95y43.mongodb.net/employee_management?retryWrites=true&w=majority&appName=Cluster0' > .env
echo 'JWT_SECRET=your-super-secret-jwt-key-here-1736960000000' >> .env
echo 'PORT=5000' >> .env
echo 'NODE_ENV=development' >> .env
```

### Step 3: Test the Connection

```bash
cd backend
node test-db-connection.js
```

### Step 4: Start the Server

```bash
cd backend
npm start
```

## Additional Improvements Made

1. **Enhanced Error Handling**: Updated `backend/config/database.js` to provide better error messages when `MONGODB_URI` is missing.

2. **Created Setup Script**: Added `backend/setup-env.js` to automatically create the `.env` file with proper configuration.

## Troubleshooting

If you still get connection errors after creating the `.env` file:

1. **Check MongoDB Atlas Password**: Ensure the password in the URI is correct
2. **IP Whitelist**: Add your IP address to MongoDB Atlas Network Access (or use 0.0.0.0/0 for testing)
3. **Cluster Status**: Verify your MongoDB cluster is running
4. **Network Connection**: Check your internet connection

## Files Modified

- `backend/config/database.js` - Added better error handling for missing MONGODB_URI
- `backend/setup-env.js` - Created new setup script
- `backend/.env` - Created with proper MongoDB URI configuration

The error should now be resolved with the `MONGODB_URI` properly set in the environment variables.